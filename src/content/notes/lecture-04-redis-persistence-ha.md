---
title: 讲义 04 · Redis 持久化、主从、哨兵与 Cluster
description: RDB 的 fork 和 AOF 的 fsync 各丢多少数据，主从默认异步为什么是一切的根，哨兵只管选主、Cluster 分片顺带高可用。默认值只写官方给得出来的，给不出的留空。
date: "2026-10-10"
kind: 讲义
tags: [Redis, 持久化, 高可用]
order: 10
---

# 讲义 04 · Redis 持久化、主从、哨兵与 Cluster

> 用法同前三篇：先通读，然后合上文件录音讲 5 分钟。
> 这篇的机制**全部来自 Redis 官方文档**，我在正文里标了来源页；凡是官方没给"出厂默认值"的参数，我留了空并明确标注，别背我编的数（我没编）。
> 来源页（都是 `redis.io/docs/latest/operate/oss_and_stack/management/` 下面）：`persistence/`、`replication/`、`sentinel/`、`scaling/`。版本相关的说法见最后「留空未核实」那节。

---

## 一、为什么"内存数据库"还要写盘

Redis 的真相在内存里，内存掉电就没了。所以它提供四种做法（官方原文列的就是这四类）：RDB 快照、AOF 追加日志、**完全不持久化**、RDB + AOF 同时开。

关键区别在**磁盘上的东西能不能当真相用**：

- RDB = 某个时间点的整份快照，恢复快、文件小，但中间的改动没了就是没了。
- AOF = 把写命令一条条追加记下来，重启时重放，粒度更细。
- 主从 = 另一台机器上的**副本**，不是备份。这点第九节会专门打。

还有一条 MySQL 那边的对照：**Redis 没有"事务提交必须先把日志落盘"这种机制**。它的数据结构是原地改内存，日志/快照都是**异步的后台动作**。这一句就是整篇的骨架，第八节展开。

## 二、RDB：fork 一个子进程去写

官方描述的流程就四步：**fork** → 子进程把数据集写进临时文件 → 写完**替换**旧文件（用 `rename` 原子改名）→ 父进程继续服务，全程不碰磁盘。

好处（官方列的）：单文件紧凑、天生适合备份和灾备（可以拷去 S3 / 别的机房）、父进程几乎零开销、**大数据集重启比 AOF 快**、replica 在重启和故障转移后还能走部分重同步。

代价（官方原话，两条都要会讲）：

1. **丢数据窗口**："in case of Redis stopping working without a correct shutdown ... you should be prepared to lose the latest minutes of data"——你一般几分钟才做一次快照，那就最多丢几分钟。
2. **fork 本身会卡**："fork() can be time consuming if the dataset is big, and may result in Redis stopping serving clients for some milliseconds or even for one second"。数据集越大，这一抖越明显。

配置形式是 `save <秒> <改动条数>`，官方举的例子是 `save 60 1000`（60 秒内至少改了 1000 次就做一次快照），可以配多条。**你实例上到底配了哪几条，用 `CONFIG GET save` 看，别猜。**

`SAVE` 是主线程同步做（会阻塞，线上别用），`BGSAVE` 才是 fork 子进程。

## 三、AOF：每条写命令追加，fsync 策略决定丢多少

打开方式是 `appendonly yes`。**fsync 三档**（官方定义，这段是必答区）：

| `appendfsync` | 行为 | 代价 | 官方措辞 |
|---|---|---|---|
| `always` | 每批新追加都 fsync | 极慢 | "Very very slow, very safe" |
| `everysec` | 每秒 fsync 一次 | **最多丢 1 秒** | "Fast enough ... you can only lose one second worth of writes" |
| `no` | 交给操作系统决定 | 丢多少看内核 | "The faster and less safe method" |

官方明确写：**"The suggested (and default) policy is to fsync every second"** —— 默认且推荐 everysec，这条我核实过。

AOF 的其他要点：

- **追加写不会"写到一半损坏整个文件"**：就算最后一条命令只写了一半，`redis-check-aof` 能修；新版 Redis 默认还能直接加载，把最后那条不完整的丢掉（这个行为由配置项控制，配置项名官方日志里出现过，我没核到默认值，见最后）。
- **rewrite**：重复 `INCR` 一百次，只要最终那一个值，所以后台会 fork 子进程生成一份"重建当前数据集所需的最小命令集"，写完原子换掉。自动触发条件由两个参数控制（`auto-aof-rewrite-percentage`、`auto-aof-rewrite-min-size`），**具体默认值我这次没拿到，留空**。
- **7.0 起改成 multi-part AOF**：一份 base（可以是 RDB 格式）+ 多份 incr 增量文件，由一个 manifest 清单文件统一索引；rewrite 失败时重试是**退避限速**的（避免疯狂生成一堆增量文件）。所以备份 AOF 不再是"拷一个文件"那么简单。
- 官方还提了一个救命的特性：AOF 是明文顺序日志，**误 `FLUSHALL` 之后，只要期间没发生过 rewrite**，停服务、删掉最后一条命令、重启就能把数据救回来。

## 四、RDB 和 AOF 同时开时，重启读哪份

两个都开时，**重启永远用 AOF 恢复**，官方理由很干脆："the AOF file will be used to reconstruct the original dataset since it is guaranteed to be the most complete"。

另外从 2.4 起，**RDB snapshot 和 AOF rewrite 不会同时跑**：已经有快照在写盘时，你发 `BGREWRITEAOF` 会被排到快照结束后（官方说这是为了防止两个后台进程同时狂做磁盘 IO）。

官方给的选择建议，背下来当答题模板：

- 想要接近 PostgreSQL 那种数据安全性 → **两个都开**。
- 数据重要但能接受丢几分钟 → **只开 RDB**（重启快、备份简单）。
- 只要缓存，数据能从别处重建 → **可以全关**（官方原话："This is sometimes used when caching"）。
- 官方**不推荐只开 AOF**：时不时有个 RDB 快照对做备份、对快速重启、对"AOF 引擎有 bug"都更好。

## 五、主从复制：默认异步，这是所有"丢数据"的根

官方在开头就把结论写死了："**Redis uses by default asynchronous replication**"。主机不等副本确认；副本每秒 ping 汇报自己处理到哪个位置，所以主机**知道**副本落后多少，只是不愿意等。

三个机制串起来：

1. 链路正常时，主机把写命令（以及**过期删除、内存淘汰**这些自己产生的动作）作为流推给副本。
2. 断线后重连，先试着**部分重同步**（PSYNC，把错过的增量补上）。
3. 补不上就**全量**：主机做一次后台快照 + 把期间的新增写缓冲起来 → 传快照 → 重放缓冲。

**replication ID + offset** 是这套的坐标系：`(ID, offset)` 唯一标识"某个数据集的某个版本"。新主在故障转移后会换一个新 ID（因为网络分区时旧主可能还在写，同 ID 就意味着同数据，不换会破坏这个不变式），但它会**记住旧的 secondary ID**，所以其他副本重连新主时仍然能走部分同步，不用全量（4.0 起）。

几条你会被追问到的细节：

- **副本默认只读**（`replica-read-only`，2.6 起默认开）。官方直接说可写副本"exist only for historical reasons"，7.0 把过去那几个用途都判过时了（`SUNIONSTORE`/`SORT`/`EVAL` 这类改用 `SUNION`/`SORT_RO`/`EVAL_RO`）。
- **副本默认忽略 `maxmemory`**：淘汰由主机制成 `DEL` 命令广播下来，保证两边数据一致。副作用是副本可能比你自己设的 maxmemory 更占内存。
- **过期键**：副本不自己删，等主机发 `DEL`；但副本会用自己的逻辑时钟判断"这个键逻辑上已经过期"，**只在读操作上这么做**，不动数据集。所以你会在副本上读到比主机更"旧"的过期键存在于内存中却查不到。
- **全量同步期间副本会阻塞**：旧数据集要删、新数据集要加载进内存，官方说这段窗口对大数据集"can be as long as many seconds"。
- **官方点名的自杀式配置**：主机不开持久化 + 开机自动重启。主机崩溃→自动重启→**空数据集**→副本来同步→把副本也清空。原话结论：*"Every time data safety is important, and replication is used with master configured without persistence, auto restart of instances should be disabled."*

## 六、"要不要同步复制"：WAIT 和 min-replicas 都救不了你

- `WAIT`：让客户端请求"至少 N 个副本确认收到"。官方立刻补了一刀：**"it does not turn a set of Redis instances into a CP system with strong consistency: acknowledged writes can still be lost during a failover"**。
- `min-replicas-to-write` + `min-replicas-max-lag`：至少 N 个副本且落后不超过 M 秒才接受写，否则直接报错。官方的定位是"best effort data safety ... **there is always a window for data loss**"——把丢数据的时间窗**限定**住，而不是消除。

标准答法（这段是你现在就能拿去说的）：**Redis 的复制是异步的，所以任何"多副本 = 不丢数据"的说法都不成立；能做的只是把丢数据窗口收窄（WAIT / min-replicas-to-write / AOF everysec），真要保证不丢，得把 Redis 当缓存、把数据库当真相源。** 这句正好接回讲义 03 的第十一节④。

## 七、哨兵 Sentinel：它只管"谁当主"，不管数据

Sentinel 的定位（官方原话）："**Sentinel acts as a source of authority for clients service discovery**" —— 客户端不自己记主机地址，而是问 Sentinel：

```
127.0.0.1:5000> SENTINEL get-master-addr-by-name mymaster
1) "127.0.0.1"
2) "6379"
```

故障转移后 Sentinel 会把这个新地址报告出去。最关键的**两个数字要分清新**（这是哨兵最常考的一条）：

- **quorum** 只用来**判定"主是否失效"**（多个 Sentinel 一致认为挂了，降低误判）。
- 真正**授权发起 failover** 需要 **多数（majority）Sentinel 进程**投票。官方例子：5 个 Sentinel、quorum=2，两个同时判定主不可达 → 其中一个尝试 failover；**只有当至少 3 个 Sentinel 可达时才会真的执行**。所以"少数派分区里不会发生 failover"。

配置里的三个参数（官方最小示例给的值，注意这是**示例不是默认**）：

```
sentinel monitor mymaster 127.0.0.1 6379 2
sentinel down-after-milliseconds mymaster 60000   # 多久不可达就认为它 down
sentinel failover-timeout mymaster 180000
sentinel parallel-syncs mymaster 1                # 一次让几个副本同时向新主做全量同步
```

`parallel-syncs` 为什么重要：设成 3 会让三个副本**同时**进入"全量同步期间不可用"的状态，如果你的读请求都打在副本上，等于三个只读节点一起下线。

官方直接点名的反例：**"Example 1: just two Sentinels, DON'T DO THIS"** —— 两个 Sentinel 时，主机所在机器一挂，剩下那个凑不出多数，**故障转移不会发生，整个服务不可用**。所以奇数、≥3，并且**分布在不同的机器/可用区**。

丢数据问题在哨兵下依然存在（官方给的例子）：主写入后立即崩溃，被提升的副本可能比旧主少若干写；旧主回来后会**跟着新主走，那些写永久消失**。要收窄就用第六节那两个参数。

通知方式：Sentinel 用 Pub/Sub 广播事件，其中官方标注"**外部用户最该关心的一条**"是：

```
+switch-master <master name> <oldip> <oldport> <newip> <newport>
```

还有 TILT 模式（Sentinel 发现自己机器时间/CPU 状态异常时进保守模式，暂停故障转移）、Lua 脚本跑超时返回 `-BUSY` 时它会先尝试处理再决定是否 failover（细节自己去核）。

## 八、Cluster：分片顺便也做高可用，但别把它当免费的

官方第一句就定性："Redis Cluster **does not use consistent hashing**"，而是 **hash slot**：

- **一共 16384 个槽**，`槽号 = CRC16(key) % 16384`，每个节点负责一段槽（官方例子：3 节点时 A=0–5500、B=5501–11000、C=11001–16383）。
- 每个槽有 1 主 + N-1 副本；主挂了由副本顶上去。
- **最小能正常工作的集群至少 3 个主节点**，官方推荐的部署形态是 **6 节点：3 主 3 从**。
- `nodes.conf` 由节点自己生成和维护，**"This file is never touched by humans"** —— 手改它是最常见的自找麻烦。
- `cluster-node-timeout <毫秒>`：一个节点不可达超过这个时间就被判定失败，主超过这个时间不可达就触发 failover；它同时还控制"联系不上多数节点的节点自己也要进入失败状态"这类判定。**默认值我这次没拿到，留空。**

真正的约束在这里：**多 key 命令 / 事务 / Lua 只支持所有 key 落在同一个槽**。想把两个 key 绑到一起，用 **hash tag**——官方原话："if there is a substring between `{}` brackets in a key, only what is inside the string is hashed"，于是 `user:{123}:profile` 和 `user:{123}:account` 保证同槽，可以一起操作。这直接决定你的 key 命名，**是 Cluster 最贵的一条设计约束**。

扩容/缩容用 `redis-cli --cluster reshard` / `--cluster check`，迁移期间请求不受影响，但跨节点的聚合类操作（`KEYS`/`SCAN` 要遍历所有主、`MGET` 跨槽报错）都得自己处理。

## 九、持久化 vs MySQL 的 redo/binlog：这是面试最爱追的取舍

| | MySQL InnoDB | Redis |
|---|---|---|
| 真相在哪 | 磁盘上的数据页 | **内存** |
| 提交时做了什么 | redo log（+ binlog）落盘后才回"成功"，双 1 配置下提交即持久 | 什么都不做，改完内存立刻返回 |
| 日志的角色 | redo 保崩溃恢复、binlog 保归档与复制，**都在写路径上** | AOF/RDB 是**后台旁路**，不在请求返回的必经路径上 |
| 丢数据窗口 | 双 1 下单条事务不丢 | RDB：分钟级；AOF everysec：**1 秒**；AOF always：极慢，且官方说仍然只是"safe" |
| 复制 | binlog 有半同步插件路线 | **默认异步**，WAIT/min-replicas 只能收窄窗口 |
| 换回来的是什么 | 每次提交的 fsync 开销（延迟毛刺） | 吞吐和高可用运维的简单性 |

一句话总结，能直接讲：**MySQL 把持久性做进提交路径，所以单条不丢但要付 fsync 的延迟；Redis 把持久性做成后台动作，所以快，代价是永远有一个丢数据窗口，而且它的多副本还是不保证同步的。** 由此推出的选型立场（这才是加分处）：**不能丢的数据放数据库，Redis 里只放"丢了可以重建"的东西。**

## 十、什么情况下会坏

1. **把副本当备份**。副本只解决"这台机器还在"，不解决"数据错了"——你 `FLUSHALL` 一次，所有副本一起被清空（第五节那个故障模式就是它的极端版本）。备份必须是**离线快照 + 拷出机器**（官方建议：cron 每小时/每天各存一份、每天至少一份传到机房外，S3 加密或 scp 到远端小 VPS，并且要能校验文件大小/SHA1，还要有独立的告警告诉你备份没成功）。
2. **主机关持久化 + 开自动重启** → 全库清空（官方原文，见第五节）。
3. **fork 抖与内存放大**。RDB/AOF rewrite 靠 fork + 写时复制：数据集大时 fork 会卡几毫秒到一秒（官方措辞），而且**写越多、被复制出去的页越多，内存越涨**。所以 maxmemory 不要贴着物理内存配。
4. **不设 maxmemory**。内存吃满之后操作系统开始 swap，Redis 单线程 + 内存数据库的前提直接崩掉，延迟从 0.1ms 级掉到 100ms 级（这条属于操作系统层面，**具体阈值和 VM 配置项我没核，留空**；官方 security 页有专门讲 Linux 内存 Overcommit 的一节）。
5. **全量重同步的内存尖峰**。同步期间主机要把所有新写命令缓冲在内存里；数据集大 + 网络慢 + 多个副本同时来 → 缓冲很大。官方还提到：多个副本请求同步时主机只做**一次**后台快照来服务它们。
6. **AOF 备份撞上 rewrite**。multi-part AOF 下直接 tar 那个目录（`appenddirname`）可能拿到不完整的一组，官方给的流程是先 `CONFIG SET auto-aof-rewrite-percentage 0` + 确认 `INFO persistence` 里 `aof_rewrite_in_progress=0` 再拷，或者用硬链接把窗口缩到最短。
7. **哨兵装在同一台机器上 / 只装两个**。凑不出 majority 就没人敢 failover；全在一台机器上则机器一挂监控系统跟着挂。
8. **Cluster 下用了跨槽的多 key 命令** → 运行期报 `CROSSSLOT`（错误码名自己去核）。这是**上线才发现**的问题，所以 key 设计阶段就得用 hash tag 定下来。

## 十一、和你项目的连接点

**① 检索结果缓存 → 可以完全不要持久化。** 它丢了能从 pgvector 重算，属于官方说的"when caching"那一类。关掉持久化换来更稳的延迟、没有 fork 抖动。**但要写清楚理由**（"丢了能重建"），而不是"缓存不需要持久化"这种半句话。

**② 已入库文档清单 → 别把它当唯一真相。** 上一讲（03 第十一节④）的结论是幂等靠数据库唯一约束；如果你想用 Redis 的 Set 做 `SISMEMBER` 加速，那就把它明确定位成**可丢的加速层**，程序逻辑必须能退化到"清单丢了就查一次数据库重建"。如果你真让它当真相，就必须开 AOF everysec，而且接受那 1 秒窗口——**这条取舍能讲出来，比会背配置项有价值得多。**

**③ 并发与限流计数器。** 你要给 embedding 批量导入配并发（讲义 02 第六节的下游限流），用 Redis `INCR` + 过期做一个固定窗口计数器：`INCR rate:deepseek:{时间窗}` 然后 `EXPIRE`。注意它是**多进程/多实例共享**的计数，这正好解决你 Java 侧 `AtomicLong` 只能管住一个进程的问题；而"先读再写"在有并发时必须用 `INCR` 这种原子命令或者 Lua 脚本，不能 GET 完再 SET。

**④ 你现在不要搭哨兵，也不要搭 Cluster。** 你的知识库问答是单机、几个人用。哨兵至少 3 个进程 + 独立机器，Cluster 最少 3 主 3 从 = 6 个实例，这两样带来的运维复杂度全是你的成本，收益是零。面试被问"你项目为什么没用哨兵"，正确答案是："**因为我只有一个单点、丢了能重建，用主从+离线快照够了；上哨兵的代价是要维护 3 个以上进程和它们的分布，我判断不值。**" —— 这比"我不会搭"强一百倍，而且正好是他考察的"知道选择与代价"。

**⑤ pgvector vs Redis 向量检索。** Redis 新版本把自己变成了"带向量索引的数据库"（官方 persistence 页已经出现 8.x 才有的 `BACKUP` 命令族，说明版本线在快速往前走）。**具体到"哪个版本有向量类型、能力如何"我这次没核实，你直接查 Redis 官方 command reference，别听我说**。你要能讲的一句是取舍："向量索引建在 Redis 里 = 全内存 + 快 + 但持久化只有秒级窗口；建在 pgvector 里 = 和元数据同库、一个事务里既能改文档状态又能写向量（讲义 03 第十一节④的唯一约束在这里同样成立）。我选 pgvector 是因为我要**一致性和可重建**，不是因为它更快。"

## 十二、合上文件，讲这三道题

1. `appendfsync` 三档各丢多少数据、付什么代价？RDB 和 AOF 同时开着时，重启读哪一份，为什么？
2. 为什么说"我有两个副本所以数据安全"是错的？请用**三处**官方说法来支撑（提示：异步复制、`WAIT` 不构成 CP、主机关持久化又自动重启会清空全库）。
3. 你的项目里"检索结果缓存"和"已入库文档清单"这两样，持久化和高可用分别怎么配？为什么你不上哨兵？

## 十三、核对清单

**✅ 我这次已经从 Redis 官方文档核到的（可以照这个讲，但请你自己点开看一遍，我可能引错上下文）**

- [ ] 默认且推荐的 fsync 策略是 `everysec`，代价是"最多丢 1 秒"
- [ ] AOF + RDB 同时启用时，重启用 **AOF** 恢复
- [ ] 默认是**异步复制**；副本默认**只读**、默认**忽略 maxmemory**；过期键由主机制成 DEL 广播
- [ ] `WAIT` 不构成强一致；`min-replicas-to-write` / `min-replicas-max-lag` 只能限定窗口
- [ ] 主机关持久化 + 自动重启 = 副本被清空（官方列出的三步故障模式）
- [ ] quorum 只用于判定失效；**failover 需要多数 Sentinel 授权**；"两个 Sentinel" 是官方点名的反例
- [ ] Cluster 用 hash slot 而非一致性哈希：**16384 槽、CRC16 % 16384**；最小 **3 主**，推荐 **3 主 3 从**；hash tag `{}` 的语义
- [ ] 7.0 起 multi-part AOF（base + incr + manifest）；备份 AOF 时要先停 rewrite
- [ ] RDB 靠 fork + 写时复制；数据集很大时 fork 可能让 Redis 停服务几毫秒到一秒
- [ ] **版本线证据（2026-10-10 新查到）**：官方 SET 命令页标注选项组的 since —— NX/XX 与 EX/PX = **2.6.12**、KEEPTTL = **6.0.0**、GET/EXAT/PXAT = **6.2.0**、**IFEQ/IFNE/IFDEQ/IFDNE = 8.4.0**；官方分布式锁页还写明 **`DELEX` 由 Redis 8.4 引入**。所以"当前版本至少到 8.4"是**有官方出处的**；至于更高的 8.6 / 8.8，仍是第三方报道，我没在 redis.io 核到
- [ ] 布隆过滤器（含公式与 `BF.*` 命令）已经在 **Redis 开源版**里提供，不再是 RedisBloom 模块独有 —— 讲义 05 引的具体数字也一并核过了

**⚠️ 留空 —— 我没核实，别背我这里的数，自己去 `CONFIG GET` 或文档查**

- [ ] `appendonly` 在最新版的默认值（我没能取到官方默认配置文本来确认）
- [ ] `save` 的默认三档具体是什么（官方文档只举了 `save 60 1000` 这个**例子**，例子不等于默认）
- [ ] `auto-aof-rewrite-percentage` / `auto-aof-rewrite-min-size` 的默认值
- [ ] `repl-backlog-size`、`repl-diskless-sync` 的默认值
- [ ] `cluster-node-timeout` 的默认值；`MOVED` 与 `ASK` 重定向的准确区别（去 Redis Cluster specification 查）
- [ ] `aof-load-truncated`、`replica-lazy-flush` 这类开关的默认值
- [ ] 哨兵那几个参数是否存在"出厂默认"（官方只给了 `sentinel.conf` 的示例值）
- [ ] **2026 年 Redis 的稳定版本号**、以及向量类型从哪个版本开始有。第三方报道称已发 8.6 / 8.8，但我没在 redis.io 上核实，所以本篇正文一律写"新版/8.x 起有 X 命令族"这种带保留的说法
- [ ] 《Redis 设计与实现》（黄健宏）的目录对应关系：这本书的章号我手上没有，所以这篇**没给章节对照表**。你把目录发我，我照讲义 03 那样补一节
