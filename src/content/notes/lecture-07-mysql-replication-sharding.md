---
title: 讲义 07 · MySQL 主从复制与分库分表
description: 三线程 + relay log 怎么把改动搬到从库、半同步和 GTID 各省了什么心，然后是延迟为什么是读写分离真正咬人的地方，以及什么时候主从也不够、要上分库分表。
date: "2026-10-10"
kind: 讲义
tags: [MySQL, 主从复制, 分库分表]
order: 10
---

# 讲义 07 · MySQL 主从复制与分库分表

> 用法同前几篇。这篇的"已核"来自 MySQL 8.0 官方 Reference Manual 的 Replication Implementation 一节，我把变量名列给你，但**凡是我没查到默认值的，一律进"留空"那节**，你别背我编的数（我没编）。

---

## 一、主从解决什么，不解决什么

先把边界说清，这是面试第一层：

| 需求 | 主从能不能解决 |
|---|---|
| 读多写少，读扛不住 | ✅ 这是主从的主要目的（读扩展） |
| 有一台机器随时能备份/切换 | ✅ 但**副本不是备份**（讲义 04 第十节同一条） |
| 主机挂了能顶上 | ⚠️ 需要额外的探活与切换（MHA/Orchestrator/云厂商），MySQL 自己不做自动决策 |
| 写扛不住 | ❌ 写仍然只有一个主 |
| 单表数据太大、容量扛不住 | ❌ 这是分库分表 / 归档的事 |

一句话：**主从是"把读复制出去"，不是"把数据切开"。** 后半句才是第八节的主题。

## 二、机制：三个线程 + relay log（✅ 已核）

官方描述的是一个 **pull 模型**：副本主动向源端拉 binlog，每个副本独立进行，不拖累源端。落到线程上是三个：

```
源端：binlog dump 线程         —— 把 binlog 内容发给连上来的副本
副本：I/O 线程                 —— 连源端、收 binlog、写进本地的 relay log
副本：SQL 线程                 —— 读 relay log，重放成实际的数据变更
```

**relay log 为什么要存在**：它是副本本地的"待重放队列"，把"网络接收"和"磁盘重放"解耦 —— 网络快、重放慢，所以两者速率天然不同，中间必须有个缓冲。这个设计眼熟吗？跟讲义 06 的队列一模一样：**接收与处理速率不匹配，就要有缓冲。**

三种 binlog 格式（`statement` / `row` / `mixed`）在这里的作用是**决定重放的是什么**：row 格式重放的是"这一行的值从 A 变成 B"，statement 重放的是"执行这条 SQL"。**8.0 里 `binlog_format` 默认就是 ROW**（这条我在官方参数页核过）。为什么默认 row：statement 对某些函数（`NOW()`、`UUID()`、`LIMIT` 更新）不确定，主从会跑出不同结果 —— 这也解释了讲义 03 里那句"用 RC 就只能吃 row 格式"。

## 三、异步是默认，半同步只是插件（✅ 部分已核）

MySQL 主从**默认异步**：源端提交完就回客户端"成功"，不等任何副本。含义就是讲义 03/04 反复出现的那句：**主库挂了，未传输到副本的写会丢。**

**半同步（semi-sync）是插件，不是内置行为**（官方列在 Replication Solutions 下）：源端提交前至少等**一个副本确认收到**（注意是"收到并写进 relay log"，不是"重放完成"）。官方给的变量名（8.0 新命名）：

```
rpl_semi_sync_source_enabled     # 源端开关
rpl_semi_sync_replica_enabled    # 副本开关
rpl_semi_sync_source_timeout     # 等不到确认就退回异步
```

**默认值（✅ 已从官方 `replication-semisync-interface.html` 核对）**：

| 变量（8.0 新名 / 老名） | 默认值（官方） |
|---|---|
| `rpl_semi_sync_source_enabled` / `..._master_enabled` | **0（关）** —— 半同步默认不开，必须装插件并显式打开 |
| `rpl_semi_sync_source_timeout` / `..._master_timeout` | **10000 毫秒（10 秒）** |
| `rpl_semi_sync_source_wait_for_replica_count` | **1**（每个事务等 1 个副本确认） |
| `rpl_semi_sync_source_wait_point` | **`AFTER_SYNC`**（另一个可选值是 `AFTER_COMMIT`） |

关于超时，官方的原话是它在"等不到副本确认时会 **timing out and reverting to asynchronous replication**"。

**坑点（这是这段的加分句）**：半同步保证的是"不丢"，代价是**每次提交都要等一次网络往返**，写延迟上升；而且**"收到"不等于"重放"**，所以从副本上读到的数据仍然可能是旧的；一旦超过那 10 秒，它会**自动退回异步**，此时"不丢"这个承诺当场失效 —— 而且这个退回是**静默**的，没人告诉你。`wait_point` 那个 `AFTER_SYNC` / `AFTER_COMMIT` 的差别也值得记：**AFTER_SYNC 是"写到 relay log、等确认，但还没在源端提交前"就等**，所以副本崩溃回滚时不会出现"源端提交了但副本不知道"的幽灵更新；AFTER_COMMIT 则是提交后才等，存在那个窗口。**两者的确切官方定义你点开 Configuring Semisynchronous Replication 那一节再确认一次**，我这里给的是它的名字和默认值。

至于"全同步"：MySQL 官方没有提供多副本强同步（组复制 Group Replication / `ndb` 是另外的东西，本讲义不展开，**我也不会在这里给你它的结论**）。

## 四、GTID：为什么它能少出事故（✅ 变量名已核）

传统复制要点要"binlog 文件 + 位置坐标"，一切换就得人工算坐标，算错就漏一段或重放一段。**GTID 给每个事务一个全局唯一 ID**，副本说"我执行过哪些 GTID"就够了，定位不再依赖文件名和偏移。

```
gtid_mode                  = ON     # 开这个功能
enforce_gtid_consistency   = ON     # 只允许能安全记成 GTID 的语句
```

**默认值与开启方式（✅ 已从官方 `replication-options-gtids.html` 核对）**：`gtid_mode` 默认 **OFF**，`enforce_gtid_consistency` 默认 **OFF**。切换是**在线的、但一次只能跨一步**，官方原话：

> "Changes from one value to another can only be one step at a time. For example, if `gtid_mode` is currently set to `OFF_PERMISSIVE`, it is possible to change to `OFF` or `ON_PERMISSIVE` but not to `ON`."

所以正向路径是 `OFF → OFF_PERMISSIVE → ON_PERMISSIVE → ON`，反向对称。两个中间值的含义是"允许新事务不带 GTID / 允许复制别人的匿名事务"这类过渡语义，**具体定义我没逐字核**，你在 `replication-mode-change-online-concepts.html` 那一页读一遍（这一页我这次没能打开）。

官方列的用处：自动定位（auto-position）、多源复制、故障切换/扩容更好做。**GTID 的格式（`server_uuid:事务序号`）我没核实，进清单。**

一句话价值：**GTID 把"复制的进度"变成一个可枚举的集合，而不是一条位置指针** —— 这跟讲义 04 里 replication ID + offset 是同一个思路，只是表达方式不同。

## 五、主从延迟：这才是读写分离真正会咬你的地方

**成因（每一条都能被追问）**：

1. **副本重放天生比源端串行**。源端几千个线程并发写，副本默认由 SQL 线程串行重放 → 高峰期副本越落越远。解法方向是**并行复制**（变量名 `replica_parallel_workers`、`replica_parallel_type`、`replica_preserve_commit_order`，**默认值我没查到，留空**；思路是按"源端能并发提交的事务，副本也能并发重放"来分 worker）。
2. **大事务**：源端一条 `UPDATE` 改 500 万行，副本要把这 500 万行重做一遍（还接讲义 03 第十节第 2 条"大事务"的代价）。
3. **DDL**：加索引、改字段这类操作在副本上同样昂贵，而且期间可能阻塞复制。
4. **副本本身在扛读**：它既要重放又要服务查询，CPU/IO 被抢。
5. **网络或源端 binlog 传输压力**（大事务、`binlog_transaction_compression` 这类优化不展开）。

**怎么量**：`SHOW REPLICA STATUS` 里的 **`Seconds_Behind_Master`**。⚠️ 官方明确它是**估算值**，而且有几个致命限制：多线程复制时它**不能反映最慢的那个 worker**；源端/副本时钟变化（NTP 调整）会让它不可靠；多源复制时可能为 `NULL`；`0` 也不保证真的实时。**所以线上更该看的是"心跳位点差"而不是这个字段**（具体怎么做我没核实，进清单）。

**后果是业务 bug，不是性能问题**：

- 用户下完单立刻刷新订单列表 → 打到延迟 3 秒的从库 → **"我的单子呢"**；
- 定时任务刚改完 `status=DONE`，另一个任务查待处理列表 → 读到旧状态 → **重复处理**（这条正好接讲义 06 的幂等：你的重试逻辑要能扛这种"读到旧值"）。

**四种对策与代价**：

1. **强制走主**：写之后的读走主库。代价是主库压力回来了，读扩展打折。
2. **会话粘性**：同一会话在 N 秒内都读主。代价是实现要维护会话状态，N 怎么定是拍的。
3. **判断位点**：写入时记下 GTID/位置，副本追上再读它。代价是复杂，需要中间件支持。
4. **业务上绕开**：写完直接用已知值更新前端，不去查。—— 实际上**这是最常用、也最该讲的**："这个场景我不查从库，我直接返回刚写入的结果。"

## 六、什么时候"主从也不够" → 分库分表

先讲**垂直**再讲**水平**，因为很多人一上来就说 hash 取模：

- **垂直拆表**：把大字段（文本、blob）单独挪一张表，让主表变窄 → 一个页能装更多行，扫描和索引都受益（这条直接连回讲义 01 的页与行）。
- **垂直拆库**：按业务域拆（订单库、用户库），跨库不能 JOIN、不能一个事务 —— 从此进入分布式事务的领域（**这个我明确不展开，属于你"现在别学"那一格**）。
- **水平拆表/库**：同一张表按某个键分散到 N 份。**这是唯一能同时解决"写压力"和"单表过大"的办法。**

**分片键怎么选（三问）**：

1. **绝大多数查询带不带它？** 不带 → 就得广播所有分片再聚合，性能雪崩。
2. **数据会不会均匀？** 按 `user_id` 但有大客户 → 热点分片；按时间 → 最新分片永远最热。
3. **扩容要不要迁数据？** 取模 `N` 一改变，几乎所有 key 都换分片（迁移 = 全量搬）。所以生产上用**固定虚拟槽位**：先把 key 映射到数量固定的槽（比如 1024/4096 个），再把槽整段分配给分片 → 扩容只搬槽。**这正是讲义 04 里 Redis Cluster 用 16384 个固定槽而不是"节点数取模"的同一个理由** —— 你能把这两处对上，说明你真的理解了 sharding。

**跨片查询的四类代价（必须能各举一例）**：

| 问题 | 为什么麻烦 |
|---|---|
| `ORDER BY ... LIMIT 10 OFFSET 100000` | 每个分片都要取 100010 条，汇总后排序再丢弃 → 10 亿行成本 |
| `COUNT/SUM` 聚合 | 全片广播 + 归并，无法用一个索引解决 |
| `JOIN` | 跨库不能 JOIN，只能冗余字段或在应用层拼 |
| 分布式事务 / 全局唯一约束 | 唯一索引只在单个分片内有效，跨片重复要靠全局 ID 服务或唯一表 |

**全局 ID**：各表自增一定撞。常见做法是**号段模式**（从 DB 批量领一段号）和**雪花算法**（时间戳 + 机器位 + 序列位）。雪花的经典问题是**时钟回拨**（机器时间倒退会生成重复 ID），工程上要等待/报错/用备用位 —— **具体位分配和业界实现细节我没核实，进清单。**

**扩容怎么迁（这条是"知道代价"的重点，不是背工具名）**：

```
1. 新老两套同时写（双写）—— 老库仍然是真相源
2. 全量把历史数据搬到新分片
3. 增量追平（靠 binlog 订阅或时间戳水位）
4. 校验：条数 + 抽样字段比对，不一致就报警并重新搬
5. 灰度切读：先切 1% 流量到新体系，观察
6. 停老写，只保留回退窗口
```

每一步都必须能回退 —— **这和讲义 04 里 schema 的 expand-and-contract 是同一个思想**。真正的难点在 3 和 4：老库还在被写，你的增量水位一旦落后，校验就会一直对不上。

**什么时候该分（三条硬信号，别看"500 万行"那种经验数）**：① 单表 DDL / 备份 / 恢复的时间已经超出业务能忍的窗口；② Buffer Pool 装不下热点页、走索引的查询延迟开始不稳（接讲义 01）；③ **写**已经打满一台机器（注意：只有前两条通常是"分区或加索引"能解决的，第三条才是分库的真正理由）。

### 别把 MySQL 自带 partition 当成"分库分表"

这三句话是官方的，能一次讲清边界（✅ `partitioning-limitations.html` 与 `partitioning-limitations-storage-engines.html`）：

1. **上限**："The maximum possible number of partitions for a given table not using the NDB storage engine is **8192**. This number **includes subpartitions**." —— 也就是说它天生就不是给"无限扩容"用的。
2. **它不解决写和容量**：分区还是**同一张表、同一个实例、同一个 InnoDB**，只是把一张表的数据按分区键切成多个片段。所有写仍然走一个实例 —— 这正是它和水平拆分的根本区别。它能帮你的是**分区裁剪**（查 3 月的数据只碰 3 月那个分区）和**按分区做维护**（DROP PARTITION 秒删旧数据，比 DELETE 快几个量级）。
3. **它会拿走你的外键**："Partitioned tables using the InnoDB storage engine **do not support foreign keys**"，而且官方还说明 **8.0 里只有 InnoDB 和 NDB 提供原生分区 handler**，别的引擎建不了分区表。你项目里那种"文档-分块-向量"的父子表关系，一旦给父表分区，外键就没了。

再加两条你在选型时要自己确认的限制（**这两条我只是在阿里云 RDS 的镜像文档里看到，官方原文我没逐条核对，进清单**）：分区列必须包含在主键/每个唯一索引里；分区表达式对列类型有要求。**"分区列必须进主键"这条尤其致命**——它意味着你几乎不可能既按时间分区、又保留"业务 id 全局唯一"这个约束。

一句话记法：**分区 = 一台机器上把一张表切小；分库分表 = 多台机器把数据切散。** 面试说混了会被追。

## 七、什么情况下会坏

1. **副本挂了没人知道，读流量全压回主库** → 主库被自己原本分担给从库的读打死。要有摘除与告警。
2. **备份只备主库**：副本才是天然适合做备份的地方（离生产一步），但很多人恰恰忘了配。
3. **延迟没监控，业务代码假设主从一致** → 间歇性"数据丢了"的错觉（其实是读旧了）。
4. **大表 DDL**：几十 GB 的表加索引，直接锁或长时间拖住复制。业界做法是**影子表 + 增量同步 + 原子换名**（`gh-ost` / `pt-online-schema-change` 的思路，**工具名我给，机制细节自己核**）。
5. **分片不均**：一个大客户/一天的数据占掉一半容量。
6. **迁移期间双写不一致**：新老两套同时写，校验没做就切读 → 数据缺失。标准流程是**双写 → 全量迁移 → 增量追平 → 校验 → 灰度切读 → 停老写**，每一步都能回退（这条跟讲义 04 的 expand-and-contract 思路一致）。
7. **分片后才发现有个查询不带分片键**：只能全片广播，然后开始改需求或者加冗余表 —— **所以分片键必须在设计期定，不是出事后调。**

## 八、和你项目的连接点

**① 你的项目现在一个都不需要，但要知道临界点。** 文档知识库问答：单机 MySQL（讲义里那个 8.0.46）+ pgvector。判断"要不要拆"别看"500 万行"这种经验数字 —— 那只是**别人的经验值，不是定律**。真正的判据是这四条能量化的：

- 一条 `rows` 走索引的查询耗时开始不稳（页分裂、Buffer Pool 装不下热点页 → 接讲义 01）；
- **DDL 时间**：改一次字段要停服几十分钟；
- **备份/恢复时间**：恢复窗口超出业务能忍的范围（接讲义 04 的备份一节）；
- **单表文件大小**导致运维动作（复制、迁移、重建索引）不可控。

**② 你的表里"会先撑不住"的是向量列，不是行数。** 一块文本几百字节，而 1024 维 float32 向量约 **4KB**（这是我自己算的：1024×4 字节，你可以核对你的模型维度），也就是说**向量列的体积比正文还大一个量级**。由此推出三条：

- pgvector 的表**不适合按 `doc_id` 做水平分片来加速检索** —— 近似最近邻查询必须把候选向量都看完才知结果，分片只会让每个片各自算 top-K 再归并，精度和耗时都变差。**这就是"专业向量库自己做分片"的原因，也是你能讲出的 pgvector 的边界。**（HNSW 的分片与召回率影响我没核实，进清单。）
- 想扩容检索吞吐，优先加**只读副本**（讲义 04 的 replica / MySQL 的主从同一个思路：读多写少 → 复制读），而不是分片。
- 正文和向量分表存（垂直拆表），列表页查询不要 `SELECT *` 把向量捞出来（讲义 01 的"禁止 SELECT *"在这里有了第二条真实理由）。

**③ 读写分离在你项目里唯一会咬人的地方**：导入任务把 `status` 改成 `DONE` 之后立刻查"待处理队列"。如果那个查询走了延迟副本，**同一篇文档会被处理两次** —— 你要么让这类查询走主库，要么让状态更新用 `WHERE status='PENDING'` 这种**条件更新 + 幂等**（讲义 06 第四节第 2 条）。**这个例子能同时展示你知道复制延迟、也知道怎么用幂等兜住，比"我搭过一主两从"有价值得多。**

**④ 面试答法模板**（被问"你项目数据量大了怎么办"）：先量级，再瓶颈，最后才是分库分表 —— "我算过，我这个量级单表 + 索引完全扛得住；真要长，先加只读副本扩读，向量列单独一张表控制页大小；分库分表在我这是最后一步，因为分片键一旦定错，检索类查询就得全片广播，代价比收益来得快。"

## 九、合上文件，讲这三道题

1. 主从复制的三个线程分别是什么、relay log 为什么必须存在？半同步到底保证什么、又**不**保证什么（提示：收到 vs 重放、超时降级）？
2. 主从延迟为什么会发生、`Seconds_Behind_Master` 有什么坑、你的项目里哪个具体场景会因此变成 bug？给出四种对策并说代价。
3. 分片键选择的三个判据是什么？为什么用固定槽而不是对节点数取模（拿 Redis Cluster 的 16384 对比讲）？你的项目为什么"暂时不该分库分表"？

## 十、核对清单（2026-10-10 已用一手来源补全）

**✅ 已核 —— MySQL 8.0 Reference Manual，我把页名给你，正文可以照着讲但仍要点开自己读**

来源：`replication-implementation.html`、`replication-semisync-interface.html`、`replication-options-gtids.html`、`partitioning-limitations.html`、`partitioning-limitations-storage-engines.html`、`replication-options-binary-log.html`。

- [ ] 复制是 **pull 模型**；三个线程：源端 **binlog dump**、副本 **I/O 线程 → relay log**、副本 **SQL 线程重放**
- [ ] 半同步是**插件**；默认值：`rpl_semi_sync_source_enabled = 0`、`rpl_semi_sync_source_timeout = 10000`（10 秒）、`rpl_semi_sync_source_wait_for_replica_count = 1`、`rpl_semi_sync_source_wait_point = AFTER_SYNC`（可选 `AFTER_COMMIT`）
- [ ] 超时的官方措辞：**"timing out and reverting to asynchronous replication"**（会静默退回异步）
- [ ] 老变量名 `..._master_*` / `..._slave_*` 与新名 `..._source_*` / `..._replica_*` **是同一组变量的两个名字**（官方在同一个条目里并列给出）
- [ ] `gtid_mode` 默认 **OFF**、`enforce_gtid_consistency` 默认 **OFF**；切换**一次只能跨一步**（官方原话：`OFF_PERMISSIVE` 时只能回 `OFF` 或去 `ON_PERMISSIVE`，不能直接 `ON`），正解路径 `OFF → OFF_PERMISSIVE → ON_PERMISSIVE → ON`
- [ ] `Seconds_Behind_Master` 是**估算值**；多线程复制下不反映最慢 worker；NTP 调时会失真；多源复制可能为 `NULL`；`0` 不等于实时
- [ ] 8.0 里 `binlog_format` 默认 **ROW**；`binlog_row_image` 默认 **full**；`binlog_cache_size` 默认 **32768**；`binlog_group_commit_sync_delay` 默认 **0**；`relay_log_purge` 默认 **ON**
- [ ] RC 隔离级别下 **"Only row-based binary logging is supported"**（讲义 03 引的同一条）；RC 下**不加间隙锁**、RR 用 **gap / next-key lock** 挡插入
- [ ] **分区上限 8192（含子分区，非 NDB 引擎）**；**InnoDB 分区表不支持外键**；8.0 里**只有 InnoDB 与 NDB 提供原生分区 handler**

**⚠️ 仍然留空 —— 我这次也没能核实，别背**

- [ ] `replica_parallel_workers` / `replica_parallel_type` / `replica_parallel_strategy` / `replica_preserve_commit_order` 的**默认值**：官方 `replication-options-replica.html` 那页我这次取到的内容在 `relay_log_info_repository` 处就截断了，**没覆盖到这几个参数**。最短路径是在你自己的 8.0.46 上实测：`SHOW VARIABLES LIKE 'replica_par%';`
- [ ] `sync_binlog` 与 `innodb_lock_wait_timeout` 的默认值（同理，取到的页面对它们只做了引用、没给 Default Value 行；`SHOW VARIABLES LIKE 'sync_binlog'; SHOW VARIABLES LIKE 'innodb_lock_wait_timeout';` 直接看你机器的）
- [ ] `AFTER_SYNC` 与 `AFTER_COMMIT` 的**准确语义差别**（我只核到了默认是 AFTER_SYNC，正文里那段"幽灵更新"的解释是我的推断，别当结论讲）
- [ ] GTID 的格式（`server_uuid:序号`）与 `gtid_executed` / `gtid_purged` / `RESET MASTER` 的行为细节（生命周期那一节我取到的是流程描述，没做逐条核对）
- [ ] 分区列必须包含在主键/唯一索引内、以及分区表达式对列类型的要求 —— **我是在云厂商镜像文档里看到的，官方原文没逐条核**
- [ ] 雪花算法的位分配、时钟回拨的标准处理；号段模式的实现要点（**这些没有任何"官方"可言，只能读实现源码**）
- [ ] `gh-ost` / `pt-online-schema-change` 的机制与限制（工具文档，我这次没读）
- [ ] pgvector 分片对 HNSW 召回率与建索引时间的实际影响 —— **只能你自己压测**，我给不了数
- [ ] 组复制（Group Replication）与 `NDB` 的定位（本讲义只在第九节点到名字，没有讲机制，**别在面试里说我懂**）
- [ ] `binlog_transaction_compression` 等 8.0 新优化项（我只提了名字）
