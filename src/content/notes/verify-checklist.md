---
title: 讲义待核实清单
description: 讲义 01–07 里我没能当场核实的每一个数字，分「本机一行命令能测」「官方文档要读」「第三方库读原文」「你账号后台才能查」四类，勾完一条才算你能讲的东西。
date: "2026-10-10"
kind: 清单
tags: [核实, 出处, MySQL, Redis, Java 并发]
order: 25
---

# 讲义待核实清单（2026-10-10 汇总）

> 这份是我写讲义 01–07 时**没能当场核实**的全部数字与出处，一条不落。
> 用法：每核实一条就把 `[ ]` 勾上，并在后面写上**你实际看到的值和出处**（页名 / 命令 / 文档链接）。核实完的那条，才算你能在面试里讲的东西。
> 分四类：A 你自己机器一行命令就能测（最该先做）｜B 官方文档要读｜C 第三方库/书，只能读原文｜D 你的账号后台，只能你查。

---

## A. 本机一行命令实测（Workbench 或终端直接跑，成本最低）

### A1 MySQL 8.0.46 —— 参数默认值（讲义 02、03 用）

```sql
SHOW VARIABLES WHERE Variable_name IN
 ('innodb_page_size','transaction_isolation','autocommit','innodb_lock_wait_timeout',
  'innodb_flush_log_at_trx_commit','innodb_print_all_deadlocks','sync_binlog','binlog_format',
  'binlog_row_image','binlog_cache_size','binlog_expire_logs_seconds','binlog_group_commit_sync_delay',
  'replica_parallel_workers','replica_parallel_type','replica_parallel_strategy',
  'replica_preserve_commit_order','replica_read_only','gtid_mode','enforce_gtid_consistency',
  'innodb_deadlock_detect');
```

- [ ] `innodb_page_size`（讲义 01 那个 16KB，我给的 `SHOW GLOBAL STATUS` 查法可能是错的，`SHOW VARIABLES` 才对 —— 你实测哪个能用）
- [ ] `transaction_isolation` 是不是 `REPEATABLE-READ`（官方文档说默认 RR，看你机器有没有被 my.ini 改过）
- [ ] `innodb_lock_wait_timeout`（网上流传 50 秒，我没核）
- [ ] `innodb_flush_log_at_trx_commit` / `sync_binlog`（"双 1"那两个，讲义 03 第九节）
- [ ] `innodb_print_all_deadlocks` / `innodb_deadlock_detect`（讲义 03 第十节）
- [ ] `binlog_expire_logs_seconds`（我印象 30 天 = 2592000，**没核实**）
- [ ] `replica_parallel_workers` / `replica_parallel_type` / `replica_parallel_strategy` / `replica_preserve_commit_order`（**讲义 07 最想给你数的那组，官方页面我这次取到一半就截断了；你机器上直接看最快**）
- [ ] `gtid_mode` / `enforce_gtid_consistency`（官方默认 OFF，看你环境）

### A2 MySQL —— 主从/分区/锁的语义验证

- [ ] 半同步插件在你这台装没装：`SELECT * FROM information_schema.PLUGINS WHERE PLUGIN_NAME LIKE '%semisync%';`（没装就属正常，它是插件）
- [ ] `SKIP LOCKED` 的真实行为（讲义 06 第八节）：开两个会话，都跑 `SELECT ... WHERE status='PENDING' ORDER BY id LIMIT 5 FOR UPDATE SKIP LOCKED;`，看会不会拿到同一批行；官方 `SELECT ... FOR UPDATE` 那一节我没逐字核
- [ ] 分区表到底能不能带外键（讲义 07 第九节：官方说 InnoDB 分区表不支持外键，**建一张试一次**：`CREATE TABLE t(a INT PRIMARY KEY, b INT, KEY(b)) PARTITION BY RANGE(a)(PARTITION p0 VALUES LESS THAN (100));` 再挂个外键看报什么）
- [ ] `SHOW REPLICA STATUS` 里 `Seconds_Behind_Master` 在你机器上长什么样（没搭主从就跳过，讲义 07 第五节）

### A3 Redis（用 Docker 起一个就够，讲义 04、05 那一堆默认值）

```bash
docker run -d --name r -p 6379:6379 redis:8
docker exec r redis-cli CONFIG GET save
docker exec r redis-cli CONFIG GET appendonly
docker exec r redis-cli CONFIG GET appendfsync
docker exec r redis-cli CONFIG GET auto-aof-rewrite-percentage
docker exec r redis-cli CONFIG GET auto-aof-rewrite-min-size
docker exec r redis-cli CONFIG GET maxmemory-policy
docker exec r redis-cli CONFIG GET repl-backlog-size
docker exec r redis-cli CONFIG GET repl-diskless-sync
docker exec r redis-cli CONFIG GET cluster-node-timeout
docker exec r redis-cli CONFIG GET io-threads
docker exec r redis-cli CONFIG GET aof-load-truncated
docker exec r redis-cli CONFIG GET replica-read-only
docker exec r redis-server --version
```

- [ ] `appendonly` 默认值（讲义 04 第三节）
- [ ] `save` 的默认三档（官方文档只举了 `save 60 1000` 这个**例子**，例子不等于默认）
- [ ] `auto-aof-rewrite-percentage` / `auto-aof-rewrite-min-size`
- [ ] `repl-backlog-size` / `repl-diskless-sync`
- [ ] `cluster-node-timeout`
- [ ] `io-threads`（多线程 IO 默认开不开）
- [ ] `aof-load-truncated` / `replica-read-only`
- [ ] 你实际跑的 Redis 版本号（讲义 04 末尾那条"8.4 才有 DELEX/条件写"是从官方命令页看到的，**你装的版本可能更高也可能更低**，用 `redis-server --version` 定死一个数）
- [ ] `DELEX` 在你这个版本存不存在：`docker exec r redis-cli COMMAND INFO DELEX`
- [ ] 布隆过滤器能不能直接用：`docker exec r redis-cli BF.RESERVE t 0.01 1000`

### A4 JDK / Spring Boot（讲义 02 那四个默认池）

我 2026-10-10 已经在你机器上跑过一轮，这些**不用再查**：`availableProcessors=24`、`commonPool.parallelism=23`、`poolSize=0`、裸 `ThreadPoolExecutor` 默认 `AbortPolicy` / `allowsCoreThreadTimeOut=false` / keepAlive 60s；Tomcat 200/10/100/8192；`applicationTaskExecutor` core 8 + max 与队列都是 `Integer.MAX_VALUE`、`allow-core-thread-timeout=true`；`taskScheduler` pool.size=1。

还差的：

- [ ] `ThreadPoolExecutor` javadoc 里七个参数的**顺序**与四个拒绝策略的类名（本地 JDK 17 有源码：`JAVA_HOME/src.java.base/java/util/concurrent/ThreadPoolExecutor.java`，类注释开头就是）
- [ ] `LinkedBlockingQueue` 无界时的容量常量（同一目录里 `LinkedBlockingQueue.java`，是 `Integer.MAX_VALUE`）
- [ ] `SynchronousQueue` 的交接语义（它的类注释写得非常清楚，值得读一遍）
- [ ] `ForkJoinPool.commonPool()` 被阻塞任务占满时会不会补线程（`ForkJoinPool` 类注释里的 compensation 机制，**我没读源码，讲义里那段别照我讲**）
- [ ] `@Async` 在没有 `applicationTaskExecutor` 时的退化行为（我说是 `SimpleAsyncTaskExecutor`，**没读到源码**：看 `AsyncExecutionAspectSupport.getDefaultExecutor()`）
- [ ] `spring.task.execution.mode=auto` 的确切触发条件（`TaskExecutionAutoConfiguration` 源码里那句 "Create the task executor only when necessary" 的判定）
- [ ] Tomcat Connector 线程名的实际格式（`http-nio-8080-exec-N` 是我凭印象写的，起一次服务用 jstack 或 actuator threaddump 数一遍）
- [ ] SSE / 异步请求超时：`spring.mvc.async.request-timeout` 未设时 Tomcat 的默认异步超时是多少（讲义 02；你做 W3 流式返回那周会撞上）

## B. 官方文档要读的（一行命令测不出来，但决定你能不能扛追问）

- [ ] **两阶段提交崩溃恢复的完整判定规则**（四种组合分别怎么处理）—— MySQL 官方 redo/binlog 那两节；讲义 03 第九节我只写了骨架，**没读完就别在面试展开**
- [ ] `AFTER_SYNC` 与 `AFTER_COMMIT` 的**准确语义差别**—— MySQL 官方 Configuring Semisynchronous Replication 一节。我只核到默认值是 `AFTER_SYNC`，讲义里那段"幽灵更新"是我自己的推断
- [ ] GTID 的格式（`server_uuid:序号`）与 `gtid_executed` / `gtid_purged` / `RESET MASTER` 的行为 —— 官方 GTID 那几节
- [ ] `MOVED` 与 `ASK` 重定向的确切区别、Cluster 迁移期间的行为 —— Redis Cluster **specification** 页（讲义 04 第八节我只给到槽和 hash tag）
- [ ] `binlog_row_image=minimal` 的开启条件与限制（讲义 03 第九节）
- [ ] MySQL 8.0 的 `Backward index scan` 到底存不存在、什么条件触发（讲义 01 核对清单留的那条）
- [ ] MVCC 遍历版本链时"同一行的多个列可能取自不同历史版本"—— 丁奇书第 14 章的结论，讲义 03 正文写了，**我没核到原文**
- [ ] `rpl_semi_sync_*` 在 8.0 各小版本里的命名变化（我核到官方同时给 source/master 两套名，**哪一版改的没查**）
- [ ] Kafka：`acks`、`min.insync.replicas`、`enable.auto.commit`、`max.poll.interval.ms`、`delivery.timeout.ms`、幂等生产者从哪版默认开 —— 官方文档 Producer / Consumer / Broker config 三节（我这次没取到内容，**别背网上流传的数字**；实测：`bin/kafka-configs.sh --describe --all`）
- [ ] RabbitMQ：`x-single-active-consumer` 默认值、延迟消息是原生还是插件（4.0 之后）、TTL 到期消息的**队头阻塞**现状、quorum 队列不支持全局 QoS 的替代做法 —— 官方 `docs/delayed-message-delivery`、`docs/quorum-queues`
- [ ] outbox 模式 / 事务消息（RocketMQ 半消息）的完整流程 —— 讲义 06 第四、七节我只给了名字
- [ ] pgvector：HNSW 建索引的内存/时间开销、`ef_search`/`m`/`hnsw.ef construction` 参数含义、**分片对召回率的影响** —— pgvector 的 GitHub README。**这条只能你自己压测**，我给不了数，而它正是你项目最该有数字的地方

## C. 第三方库与书（没有"官方默认值"，只能读原文）

- [ ] **偏向锁在哪个 JDK 版本被废弃 / 默认关闭、JEP 编号** —— 讲义 02 第七节。这是我最没底的一条，**查到之前不要写进简历**
- [ ] Goetz《Java 并发编程实战》里线程数公式的**原始写法**与章节（讲义 02 第六节我给的是转述）
- [ ] Redisson 看门狗的默认续期周期与锁默认 TTL（讲义 05 第五节；网上流传"10 秒 / 30 秒"我**没有依据**）
- [ ] Kleppmann 对 Redlock 的批评与 antirez 的回应**各自论点**（讲义 05 我给了两个官方链接，正文是二手转述，读完再决定要不要提）
- [ ] 《Redis 设计与实现》（黄健宏）的目录 → 讲义 04、05 都**没给章节对照表**，因为我没有这本书的目录；你把目录发我，我照讲义 03 那样补一节
- [ ] 《MySQL 是怎样运行的》的目录你已经给我了，讲义 01、03 的章节对照表都补上了 —— 讲义 02/04/05/06/07 涉及的书（并发那本、Redis 那本）也照这个格式补
- [ ] `gh-ost` / `pt-online-schema-change` 的机制与限制（讲义 07 第七节只提了名字）
- [ ] 雪花算法的位分配与时钟回拨的标准处理、号段模式实现（讲义 07 第六节；**这类没有官方，只能读实现源码**）

## D. 只能你账号后台查的（我进不去，而且会变）

- [ ] DeepSeek / 智谱 控制台的**并发数、RPM、TPM 限额** —— 讲义 02 第六、十节那个"下游限流才是真正的池"的数字。**这是决定你批量 embedding 该开几个线程的唯一依据**，而且官方一改你的答案就错
- [ ]  embedding 模型 `embedding-3` 的**向量维度**（讲义里我按 1024 维 × float32 ≈ 4KB/条 算过内存，**维度要按你控制台上的模型确认**，换模型这个数字就变）
- [ ] 你自己的问答接口实测数据：命中率、回源 QPS、P99 延迟、单次问答 token 与费用（讲义 05、路线里第三段"量化到能说出来"的那几个数 —— 现在都还是空的，W8 那周补）

---

## 优先级建议（别一次全查，那是逃避写代码）

1. **A1 + A4**（15 分钟，全是一行命令/一个文件，覆盖讲义 02、03 里我留的所有数）
2. **A3**（Docker 起 Redis 一次，讲义 04 的整张留空表清零）
3. **B 里的两阶段提交 + Kafka 默认值**（面试最常被追问的两处）
4. **D 的 API 限额 + 维度**（W1 周三周四做批量入库时必须已经知道）
5. C 类全部往后放，**其中"偏向锁 JEP 编号"这条如果在简历里出现就必须查，不在简历里就不用管**
