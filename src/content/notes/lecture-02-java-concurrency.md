---
title: 讲义 02 · Java 并发与线程池
description: 从「线程不是免费的」推到七参数和任务提交顺序，再落到拒绝策略、Spring Boot 默认池的坑，最后接上你项目里批量 embedding 入库该怎么写。
date: "2026-10-07"
kind: 讲义
tags: [并发, 线程池, Java 后端]
order: 10
---

# 讲义 02 · Java 并发与线程池

> 用法同 01：先通读一遍，然后合上文件，用手机录音讲 5 分钟。讲不下去的那句就是没懂的那句。
> 这篇里的数字分两类：标了「你机器上实测」的，是我直接从你本地 `~/.m2` 里的 `spring-boot-autoconfigure-3.5.0.jar` 和你项目 `pom.xml` 查出来的；标了「自己核」的，你要自己去官方文档确认一遍。

---

## 一、为什么需要线程池：线程不是免费的

你写 `new Thread(...).start()`，Java 做的事是向操作系统要一个**内核线程**。三笔代价：**建**要一次系统调用 + 整块预留线程栈（默认大小自己核 `-Xss`，64 位 HotSpot 通常 1MB 左右，200 个线程光栈就占 200MB 地址空间，哪怕你只用几十字节）；**占**是每人一份内核调度结构，人多了 CPU 时间被**上下文切换**吃掉；**失控**是线程数没有上限，请求一大你就不是"变慢"而是直接 `OutOfMemoryError: unable to create new native thread`，整个进程挂掉。

线程池干的事，本质是**把"每次任务建一个线程"变成"复用一小组线程 + 排一个队"**。而排队带来的两个好处比复用本身更值钱：**有上限**（最坏情况可控）、**有缓冲**（突发流量先进队列，而不是直接砸到下游）。

顺带理解一件事：线程池不是让程序"变快"的东西。单个任务的耗时一点没变（甚至因为排队更慢）。它换的是**在负载上来时整体不崩、且吞吐量稳定**。

## 二、七个参数，其实就是三个问题

`ThreadPoolExecutor` 的构造器（自己核：`java.util.concurrent.ThreadPoolExecutor` 官方 javadoc，七个参数顺序别背错）：

```java
new ThreadPoolExecutor(
    corePoolSize,        // 平时养几个人
    maximumPoolSize,     // 最多扩到几个人
    keepAliveTime, unit, // 多出来的人闲多久被裁掉
    workQueue,           // 排队用的队列
    threadFactory,       // 线程怎么起名、是不是守护线程
    handler);            // 队满人了怎么办
```

七个参数回答的其实就三个问题：

- **几个人干活** → core、max、keepAlive
- **活怎么等** → workQueue（`ArrayBlockingQueue` 有界 / `LinkedBlockingQueue` 默认无界 / `SynchronousQueue` 不存东西、必须当场交接）
- **扛不住时怎么办** → handler；`threadFactory` 是"出事时你能不能从线程名看出来是谁"（后面第五节你会看到它有多值钱）

## 三、提交一个任务，池子里到底发生了什么

顺序**必须**记准，面试问"任务来了先建线程还是先排队"，答错直接被判没读过源码：

```
1. 当前线程数 < corePoolSize  →  立刻新建一个核心线程执行（哪怕有空闲线程）
2. 核心线程数已够            →  尝试入队 workQueue
3. 队列满了                  →  新建线程直到 maximumPoolSize
4. 线程数也到 max 了         →  走拒绝策略 handler
```

两个反直觉的点，都是从这里长出来的：

**第一，先排队，后扩人。** 不是"忙不过来就加人"，而是"排不下才加人"。所以队列给得很长（或者无界）的时候，`maximumPoolSize` 基本是**摆设**，永远不会触发。

**第二，核心线程即使空闲也不会被拿去"省着用"。** 第 1 步的判断只看**数量**，不看有没有人闲着——线程数还没到 core，就一直新建。想让 core 也能被回收，要显式 `allowCoreThreadTimeOut(true)`（注意：Spring Boot 默认就把它设成了 true，跟 JDK 默认相反，见第六节）。

## 四、四种拒绝策略，以及它们各自坑在哪

JDK 内置四个（自己核：`ThreadPoolExecutor` 的静态内部类）：

| 策略 | 行为 | 副作用 |
|---|---|---|
| `AbortPolicy`（**默认**） | 直接抛 `RejectedExecutionException` | 异常会传到提交任务的那一方，不处理就影响调用链 |
| `CallerRunsPolicy` | 让**提交任务的那个线程**自己去跑 | 提交方被拖住 → 天然降速/背压；但如果是 Tomcat 线程在提交，等于把处理时间还给了请求线程 |
| `DiscardPolicy` | 静默丢掉新任务 | **最危险**：数据没了，没有任何日志 |
| `DiscardOldestPolicy` | 丢掉队首最老的任务，再试一次 | 同样是静默丢，而且丢的往往是最该被处理的 |

一句能讲出来的判断：**任务不能丢就用 Abort 或 CallerRuns，可丢的（比如埋点、日志刷盘）才用 Discard 系列，并且要自己加计数器和日志**，别真让它无声消失。

## 五、`Executors` 那几个工厂方法为什么被规范禁用

阿里 Java 开发手册明确"不允许用 `Executors` 创建线程池"。原因就在第三节那个顺序里：

- `newFixedThreadPool` / `newSingleThreadExecutor` → 用的是**默认无界**的 `LinkedBlockingQueue`（容量 `Integer.MAX_VALUE`）。队列永远"放得下"，所以第 3、4 步永远不触发：**内存被任务堆满，然后 OOM**。看起来"只有 N 个线程所以很安全"，其实堆的是任务对象。
- `newCachedThreadPool` → `SynchronousQueue`（不存）+ `maximumPoolSize = Integer.MAX_VALUE`。第 2 步入队必然失败 → 直接跳到第 3 步疯狂建线程 → **几千个线程**，回到第一节说的"unable to create new native thread"。
- `newScheduledThreadPool` → 同样 max 是无限制。

所以正确写法是**自己 `new ThreadPoolExecutor(...)`**，把有界队列和上限写明白。另外一定给 `threadFactory`：自己起个有意义的名字（比如 `embedding-import-`），出问题时 jstack 和日志里一眼能看出是哪一批任务卡住了——默认的 `pool-3-thread-1` 什么信息都不给。

顺带一个和你现在这个项目直接相关的坑：`parallelStream()` 用的是 `ForkJoinPool.commonPool()`，它**整个 JVM 共享一个**，默认并行度约等于 CPU 核数减一（自己核）。你要是拿它去做"批量调 embedding 接口"这种几秒一次的阻塞 IO，就会把全 JVM 的并行流、以及其他也用 common pool 的地方一起堵死。做阻塞 IO 要用自己建的线程池。

## 六、线程数设多少：公式和它的前提

Goetz《Java 并发编程实战》里给的经典估算（自己核书里那条公式）：

```
最优线程数 ≈ CPU 核数 × 目标利用率 × (1 + 等待时间 / 计算时间)
```

分两种任务：

- **CPU 密集**（算 MD5、序列化、跑排序）：线程数 ≈ 核数 + 1。再多只是增加切换，一点不会快。
- **IO 密集**（查库、调 HTTP、读文件）：大部分时间在等，所以要开很多线程才能把 CPU 喂满。

**但公式有个前提，这个前提才是面试的加分点：木桶效应。** 你这条链路上有好几个"池"，吞吐由**最小的那个**决定：

```
Tomcat 线程  →  你的业务线程池  →  数据库连接池  →  下游 API 的并发限额
```

- Web 容器侧：Tomcat 默认 `maxThreads = 200`、`minSpareThreads = 10`、`acceptCount = 100`（这三个数字我从 Tomcat 10.1 官方 config/http.html 查的，你换成自己项目的版本再核一次）。
- Spring Boot 侧（**这是你机器上实测**，`spring-boot-autoconfigure-3.5.0.jar` 的配置元数据 + 源码）：
  - `spring.task.execution.pool.core-size` 默认 **8**
  - `spring.task.execution.pool.max-size` 默认 **Integer.MAX_VALUE**
  - `spring.task.execution.pool.queue-capacity` 默认 **Integer.MAX_VALUE**（无界！）
  - `spring.task.execution.pool.keep-alive` 默认 **60s**，`allow-core-thread-timeout` 默认 **true**，线程名前缀 `task-`
  - `spring.task.scheduling.pool.size` 默认 **1**

也就是说：**如果你用 `@Async`，默认拿到的池就是第五节说的那个"队列无界、max 无限"的组合**——不用你亲手 new，坑也照样踩。Boot 3.5 还有个 `spring.task.execution.mode=auto`，只在需要时才建这个 executor（自己核这条的确切触发条件，我没验到源码级）。

结论一句：**把业务线程池从 8 调到 800，吞吐不会涨 100 倍，只会把压力原封不动推到数据库连接池和第三方 API 的限流上。** 所以"我为什么这么设"要连着上下游一起答——这也正好是你路线里并发那格的过关标准。

### 四个默认线程池对照表（全部是你这台机器上的实测）

你一行代码没写，进程里其实已经有四个线程池在跑了。这张表的价值是：**它们四个的故障模式完全不同，出事时长得不一样。**

| 谁在用 | 入口 / Bean 名 | 默认核心数 | 队列 | 默认上限 | 其它关键默认值 | 出处 |
|---|---|---|---|---|---|---|
| **① HTTP 请求** | Tomcat NioEndpoint（线程名 `http-nio-8080-exec-N`） | `server.tomcat.threads.min-spare` = **10** | **没有业务队列**，靠 OS 的 backlog | `server.tomcat.threads.max` = **200** | `maxConnections` = **8192**、`acceptCount` = **100** | 你本地 `spring-boot-autoconfigure-3.5.0.jar` 的配置元数据 + Tomcat 官方 config/http.html |
| **② `@Async`** | `applicationTaskExecutor`（`ThreadPoolTaskExecutor`） | `core-size` = **8** | `LinkedBlockingQueue`，`queue-capacity` = **Integer.MAX_VALUE（无界）** | `max-size` = **Integer.MAX_VALUE** | `keep-alive`=60s、`allow-core-thread-timeout`=**true**、线程名前缀 `task-`、`mode`=auto | `TaskExecutionProperties.Pool` 源码（`coreSize=8`、`maxSize`/`queueCapacity` 都是 `Integer.MAX_VALUE`） |
| **③ `@Scheduled`** | `taskScheduler`（`ThreadPoolTaskScheduler`） | `spring.task.scheduling.pool.size` = **1** | `DelayedWorkQueue`（**无界**，按到期时间排序，所以"排队"排的是时间而不是人） | **固定大小，永远不会扩** | 线程名前缀 `scheduling-`、`await-termination` = false | `TaskSchedulingProperties.Pool` 源码（`private int size = 1;`） |
| **④ `parallelStream()` / 不带 executor 的 `CompletableFuture.*Async`** | `ForkJoinPool.commonPool()` | **CPU 核数 − 1** | 每个 worker 一个双端队列（work-stealing） | 不可通过 API 设，只能上系统属性 `java.util.concurrent.ForkJoinPool.common.parallelism` | 你机器实测：`availableProcessors=24` → `commonPool.getParallelism()=23`，`poolSize=0`（线程按需创建），那个系统属性 = `null`（没设过） | 你机器上直接跑出来的（下面给你命令） |

四条要分开讲的坑：

- **② 是最反直觉的一个。** 你以为加了 `@Async` 就"并发跑"，其实默认只有 **8 个线程**真的在跑，其余任务在无界队列里等 —— 表现是"我明明并行了，为什么没变快"。而它同时又是**第五节里那两个坑的合体**（队列无界 + max 无限），任务堆积时你看到的是内存涨而不是拒绝。**并且 `allow-core-thread-timeout` 默认是 true**，这跟裸 `ThreadPoolExecutor` 相反（我实测：新建的 `ThreadPoolExecutor` 默认 `allowsCoreThreadTimeOut()=false`），意思是闲够 60 秒后连"核心"线程都会被收掉 —— 你的定时批处理跑完一小时后再触发，等于冷启动。
- **③ 只有一个线程。** 这是最容易出事的一条：两个 cron 撞到同一分钟，或者一个 `@Scheduled` 方法里调了个 30 秒的外部接口，**其它所有定时任务全部延后**，而且不报错。解法两条：`spring.task.scheduling.pool.size` 调大；或者让定时方法**只负责提交任务**给别的池（注意别提交到 ②，否则绕回同一个无界队列）。
- **④ 最隐蔽，因为你可能压根不知道自己用了它。** `list.parallelStream()`、`CompletableFuture.supplyAsync(supplier)`（**不传 executor 的那个重载**）都落在 commonPool 上。而 commonPool 是**整个 JVM 共享一份**的：你在里面做阻塞 IO（调 embedding 接口），就会把这 23 个槽占住，**别人（以及你自己别处的并行流）一起排队**。它的定位是给 CPU 密集 + work-stealing 用的，任务一阻塞就退化。所以规矩很简单：**做 IO 永远显式传自己的 executor。**
- **① 和 ②④ 的故障表现不同，值得对比着讲。** HTTP 这一层"排队"发生在 **OS 的连接 backlog**（`acceptCount=100`）上，超了新连接握手后被晾着或拒掉，客户看到的是**连不上/超时**；而 ② 的"排队"是**堆在 JVM 内存里**，客户看得到响应、你却慢慢吃掉堆。前者炸连接数，后者炸 heap —— 同一个"线程池打满"，两幅完全不同的现场。

自己复现一遍（比读表有用），在你项目的测试里丢一个类跑掉：

```java
public class Pools {
  public static void main(String[] a) {
    System.out.println("CPU = " + Runtime.getRuntime().availableProcessors());
    ForkJoinPool cp = ForkJoinPool.commonPool();
    System.out.println("commonPool.parallelism = " + cp.getParallelism());
    ThreadPoolExecutor t = new ThreadPoolExecutor(1, 2, 60, java.util.concurrent.TimeUnit.SECONDS,
            new java.util.concurrent.ArrayBlockingQueue<>(2));
    System.out.println("默认拒绝策略 = " + t.getRejectedExecutionHandler().getClass().getSimpleName());
    System.out.println("默认允许核心线程超时 = " + t.allowsCoreThreadTimeOut());
  }
}
```

运行（JDK 17 支持单文件直接跑，不用先 javac）：`java Pools.java`。我在这台机器上跑出来的结果是 `24 / 23 / AbortPolicy / false`。

线上怎么**看**到底有几个池：`jstack <pid>`、或者引了 actuator 就打 `/actuator/threaddump`，按线程名前缀数一遍 —— `http-nio-`、`task-`、`scheduling-`、`ForkJoinPool.commonPool-worker-`，你能一眼看出自己踩了哪一个。

## 七、并发最小模型：可见性和原子性是两件事

这三个只需要能各讲一句，不需要展开：

- **`volatile`**：解决**可见性**（一个线程改了，别的线程立刻能看到最新值）和禁止相关重排；**不保证原子性**。所以 `count++`（读-改-写三步）用 `volatile` 依然会丢更新。典型正确用途：一个"停止标志位"。
- **`synchronized`**：一把锁同时解决可见性和原子性（进锁前的读、出锁后的写有 happens-before 保证）。
- **CAS / 原子类**（`AtomicInteger`、`LongAdder`）：不加锁，靠 CPU 的比较交换指令重试。**高竞争下 `LongAdder` 比 `AtomicLong` 好**（自己核它是怎么分段减少竞争的）。CAS 的老问题是 **ABA**：值被人从 A 改成 B 又改回 A，CAS 以为没变过 → 需要带版本号的 `AtomicStampedReference`。

至于"synchronized 的锁升级（偏向锁 → 轻量级 → 重量级）"，**现在别背**。它是八股，且不同 JDK 版本行为不一样（偏向锁在新版本里已经被废弃、默认关闭——具体哪个 JEP、哪个版本我没能当场验证，写进核对清单让你去查）。面试被问到，答"这是 HotSpot 的实现优化，不是 Java 语言规范的一部分，我记的是 JDK 15 起默认关闭偏向锁，具体版本需要查证"比背错一套术语强。

## 八、`ThreadLocal`：泄漏是次要的，串号才要命

机制一句话：`ThreadLocal` 的值**不存在 `ThreadLocal` 对象里**，而是存在**每个 `Thread` 自己的 `threadLocalMap`** 里，key 是那个 `ThreadLocal` 实例（**弱引用**），value 是强引用。

于是线程池环境下有两个后果：

1. **内存泄漏**：外部没有强引用指向 `ThreadLocal` 实例时，key 被 GC 回收变成 `null`，但 **value 还活着**——因为线程池的线程不销毁，它一直持有那个 map。用完必须 `remove()`，而且 `remove()` 要写在 `finally` 里。
2. **数据串号**（更可怕）：线程被复用，第 2 个请求拿到了第 1 个请求留下的值。比如你放"当前登录用户"，忘了清理，A 用户的操作读到了 B 用户的身份——这是真实的线上事故类型，讲出来很有说服力。

配套要点：**线程池会打破 `ThreadLocal` 的传递**。子线程看不到父线程的 ThreadLocal；MDC 日志链路、Spring 的事务同步（`TransactionSynchronizationManager`）都是靠"装饰器在提交任务时把上下文快照过去、执行完再清回来"实现的（`TaskDecorator`，自己核 Spring 里怎么配）。这也是虚拟线程不推荐配 `ThreadLocal` 的原因——线程数量可能到几十万个。

## 九、什么情况下会坏

前五节讲的都是"正常怎么写"，这一节是"出事长什么样"。这几条你在项目里都能自己复现一遍，比背十遍有用：

1. **异常被无声吞掉**。`execute(task)` 抛出的运行时异常会打到默认 `UncaughtExceptionHandler`（能看到栈）；而 **`submit(task)` 把异常塞进了返回的 `Future`，只要你不调 `future.get()`，异常就永久消失**——线上表现是"任务没执行，也没任何报错"。这是最难查的一类问题。
2. **无界队列堆到 OOM**（第五节）。表现为老年代一直涨、GC 越来越频繁、线程池却"看起来很闲"。
3. **饥饿死锁：父任务和子任务在同一个池里**。父任务提交子任务后阻塞等结果，而池里全是父任务在等，队列里才是子任务，没人去执行它们 → 全部卡住，**不报任何错**。所以"任务里再提交任务"必须用两个独立线程池，或者改成不阻塞的 `CompletableFuture` 链式组合。
4. **定时任务全卡在一个线程上**。`spring.task.scheduling.pool.size` 默认 1（你机器上实测），一个 `@Scheduled` 方法里调了个 30 秒的外部接口，同批次别的定时任务全部延后。
5. **线程池参数不生效**。用 `Executors` 建了池，改了 max 也没用（第三节顺序决定的）。

## 十、和你项目的连接点（这块面试官一定会问）

你的 `SpringAIQuickStart` / `SpringAIEmbedding`：Boot **3.5.0**、`java.version` **17**、引了 `spring-boot-starter-web`（这三个数字是我直接读你 pom 得到的）。把它套进上面的模型：

**① 调大模型是极端 IO 密集。** 一次 DeepSeek / 智谱的 `chat` 请求，你本地 CPU 时间可能几毫秒，等响应 **2~30 秒**。代入第六节公式，`等待/计算` 巨大 → 理论上要开很多线程。但真实上限不在这个公式，而在：**API 的并发/RPM 限额**（超了就是 429，不是更快而是更贵更慢）、以及网关超时。所以"我线程池设 X，因为瓶颈在下游限流而不是 CPU"——这句比公式本身值钱得多。

**② Web 侧不用你配也有默认。** 你现在跑的并发默认是 Tomcat 那 200 个线程；一个流式对话请求可能占住一个 Tomcat 线程十几秒。自己复现一次：写个 `@RestController` 接口里 `Thread.sleep(10_000)`，用工具并发打 300 个，看第 201 个之后是什么表现（进 acceptCount 队列 / 超时）。做过这个实验，"线程池打满"对你就不是一个词。

**③ 批量 embedding 入库，才是这篇该动手的地方。** 你路线里那条"批量向量化入库，启动时只查不重算"，串行跑 1000 篇文档 = 1000 次串行网络往返。正确做法是：自建 `ThreadPoolExecutor`，有界队列（比如 `ArrayBlockingQueue<>(200)`）、明确线程名、`CallerRunsPolicy` 让读文件的循环自己降速、并且**用 `CompletableFuture.allOf(...)` 或计数器等收尾**。同时加两件东西：失败重试要有上限，以及**并发数不能超过 API 的并发限额**（这个限额是多少，去你用的模型控制台查清楚写进 README）。

**④ `@Async` 别裸用。** 一旦加上 `@Async`，你项目里就会出现那个"队列无界 + max 无限"的默认池（第六节）。要么显式配 `ThreadPoolTaskExecutor` 并用 `@Async("myExecutor")` 指定，要么就别用。另外 `@Async` 和 `@Transactional` 是同类坑：**自调用不走代理，注解静默失效**。

**⑤ 虚拟线程你现在还用不了。** 它是 Java 21 起的特性，`spring.threads.virtual.enabled` 默认 false（实测），打开的前提是 `java.version` 升到 21+。它的价值正好对准①的场景——阻塞不再占着宝贵的平台线程。但**现在别为这个升级**：`ThreadLocal` 累积、`synchronized` 块里阻塞会 pin 住载体线程（新版本已解决，哪个版本自己核）这些都得一起看。留到第三段（2027 年 3 月后），现在只需能说一句"虚拟线程把'我还要不要建池'这个问题重新问了一遍"。

## 十一、合上文件，讲这三道题

录音答，不许看上面：

1. 一个任务提交进 `ThreadPoolExecutor`，从判断到执行经过了哪几步？为什么"队列给很长"会让 `maximumPoolSize` 失效？
2. 你自己项目里跑批量 embedding，线程数你会怎么定、设成 4 和设成 40 分别什么后果？往下说：如果 API 有限流，你的池该配多大？（这题答不好，说明项目经不起追问）
3. `ThreadLocal` 在线程池里为什么可能内存泄漏、为什么可能串号？以及 `submit()` 提交的任务抛了异常，你在日志里看得见吗，为什么？

## 十二、核对清单

**✅ 已核 —— 三个来源：你本地的 jar 与源码、Tomcat 官方文档、你这台机器实测**

出处：`~/.m2/.../spring-boot-autoconfigure-3.5.0.jar` 里的 `META-INF/spring-configuration-metadata.json`；同一 artifact 的 sources jar 里 `TaskExecutionProperties.Pool`、`TaskSchedulingProperties.Pool`；Tomcat 10.1 官方 `config/http.html`；`java Pools.java` 在你机器上的输出。

- [ ] 你项目是 **Boot 3.5.0 + Java 17（Temurin 17.0.20.1）**，`spring-boot-starter-web` → 内嵌 Tomcat（直接读你的 `pom.xml`）
- [ ] Tomcat：`threads.max=200`、`threads.min-spare=10`、`accept-count=100`、`max-connections=8192`；官方 config/http.html 对 `maxThreads` 的默认值原话是 "If not specified, this attribute is set to 200"
- [ ] `applicationTaskExecutor`（`@Async`）：core **8**、max **Integer.MAX_VALUE**、queue-capacity **Integer.MAX_VALUE**、keep-alive **60s**、`allow-core-thread-timeout` **true**、线程名前缀 `task-`
- [ ] `taskScheduler`（`@Scheduled`）：pool.size = **1**
- [ ] 裸 `ThreadPoolExecutor` 的默认：拒绝策略 **AbortPolicy**、`allowsCoreThreadTimeOut()` = **false**、keepAlive **60 秒**（我构造一个实例打印出来的，与 Boot 那套的 true 形成对比）
- [ ] 你这台机器：`availableProcessors = 24`，`ForkJoinPool.commonPool().getParallelism() = 23`（即"核数 − 1"），`poolSize = 0`（线程按需创建），系统属性 `java.util.concurrent.ForkJoinPool.common.parallelism` 未设
- [ ] 虚拟线程要 Java 21+，你在 17 上**用不了**；`spring.threads.virtual.enabled` 默认 false

**⚠️ 留空 —— 我没核实，别背**

- [ ] `ThreadPoolExecutor` javadoc 里七个参数的**顺序和准确含义**、四个拒绝策略的类名（javadoc 我这次没打开，只实测了默认策略那一项）
- [ ] `LinkedBlockingQueue` 无界时的确切容量值、`SynchronousQueue` 的交接语义
- [ ] `spring.task.execution.mode=auto` 的**确切触发条件**（我只到配置元数据一级）
- [ ] **`@Async` 在没有 `applicationTaskExecutor` 时的退化行为**：Spring 会退回 `SimpleAsyncTaskExecutor`（每次新建线程、不复用），**这条我只记得大致结论，没读到源码，别当定论讲**
- [ ] Tomcat 的 `threadNamePrefix`（那是 `<Executor>` 共享线程池上的属性，Connector 上没有；所以我说的 `http-nio-8080-exec-N` 是 NioEndpoint 的默认命名，**没有逐字核**）
- [ ] `spring.mvc.async.request-timeout` 未设时 Servlet 容器（Tomcat）的异步超时默认值 —— 你做 SSE 那周会用到，`SHOW` 不出来，得读 Tomcat 文档或实测
- [ ] 你用的 DeepSeek / 智谱 控制台上的**并发数或 RPM/TPM 限额** —— 这个数字决定第十节③的线程数，只能你自己去控制台查，而且会变
- [ ] Goetz《Java 并发编程实战》里线程数公式的原始写法与出处章节
- [ ] **偏向锁在哪个 JDK 版本被废弃/默认关闭、对应 JEP 编号 —— 故意留给你查。查到之前别写进简历。**
- [ ] `commonPool` 被阻塞任务占满时 ForkJoinPool 的 compensation thread 行为（`ForkJoinPool` 的并行度补偿机制我没读源码，别照我这段展开讲）
