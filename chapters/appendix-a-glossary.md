# 附录 A 计算机技术术语索引

> 术语是精确交流的基础。以下索引按知识领域组织，给出常见英文名称、定义及正文入口；缩写与上下文可能存在多义性。

## 平台与硬件（第 1—2 章）

| 术语 | 定义 |
|---|---|
| Platform（平台） | 软件运行所需的硬件、系统与接口环境 |
| Frontend / Backend（前端 / 后端） | 用户交互部分与服务端业务处理部分 |
| API（Application Programming Interface） | 组件之间约定的可调用接口 |
| PWA（Progressive Web App） | 利用浏览器能力提供部分应用式体验的 Web 应用 |
| Bit / Byte（比特 / 字节） | 二进制信息单位；一个字节通常为八比特 |
| CPU（Central Processing Unit） | 执行机器指令的中央处理器 |
| ISA（Instruction Set Architecture） | 软件可见的指令、寄存器及相关行为规范 |
| Register（寄存器） | 处理器内部保存操作数及状态的资源 |
| Cache（缓存） | 为减少访问或计算成本保留的可复用数据 |
| RAM（Random Access Memory） | 随机访问内存，通常用于运行时主存 |
| SSD（Solid State Drive） | 基于固态存储的持久化设备 |
| GPU / NPU | 图形处理器 / 神经网络处理器，适用于特定并行计算 |
| Code Signing（代码签名） | 对产物进行签名以支持完整性及签名者验证 |

## 文件、语言与操作系统（第 3—5、7 章）

| 术语 | 定义 |
|---|---|
| File System（文件系统） | 组织、命名和访问存储对象的机制 |
| Metadata（元数据） | 描述文件或数据对象属性的信息 |
| CWD（Current Working Directory） | 相对路径解析常用的当前工作目录 |
| Symbolic Link（符号链接） | 引用另一文件系统路径的对象 |
| GUI / CLI | 图形用户界面 / 命令行界面 |
| Terminal（终端） | 文本交互环境 |
| Shell | 命令解释器，负责参数处理及启动程序等 |
| PATH | 常用于查找可执行程序的环境变量 |
| stdin / stdout / stderr | 标准输入、标准输出、标准错误 |
| Exit Code（退出码） | 进程结束时报告的状态值 |
| Pipe（管道） | 连接程序输入输出的通信机制 |
| Source Code（源代码） | 使用编程语言表达的程序文本 |
| Compiler / Interpreter | 编译器 / 解释器，分别转换程序表示或执行其行为 |
| JIT（Just-in-time Compilation） | 运行期间进行的即时编译 |
| Runtime（运行时） | 支持程序执行的环境及功能 |
| Library / Framework | 可复用功能库 / 组织应用结构与执行流程的框架 |
| Dependency（依赖） | 软件运行或构建所需要的外部组件 |
| Kernel（内核） | 操作系统核心资源管理部分 |
| System Call（系统调用） | 用户程序请求内核服务的接口 |
| Process / Thread（进程 / 线程） | 程序运行实例 / 执行序列 |
| PID（Process ID） | 进程标识符 |
| Virtual Memory（虚拟内存） | 提供虚拟地址空间并管理地址映射的机制 |
| IPC（Inter-process Communication） | 进程间通信机制 |
| Device Driver（设备驱动） | 与硬件或虚拟设备交互的软件 |

## 算法与数据（第 6、8、17 章）

| 术语 | 定义 |
|---|---|
| Algorithm（算法） | 解决问题的一组明确计算步骤 |
| Big O（大 O 记号） | 描述渐近复杂度上界的数学记号 |
| Latency / Throughput | 单次操作延迟 / 单位时间处理量 |
| P95 | 约 95% 的观测值不超过的分位数 |
| Profiling（性能分析） | 测量程序资源消耗及高成本路径 |
| Unicode | 字符及其码点等的标准 |
| UTF-8 | Unicode 的一种字节编码 |
| Endianness（字节序） | 多字节数值的字节排列规则 |
| Serialization（序列化） | 将数据结构转换为可保存或传输表示 |
| CSV / JSON | 逗号分隔值格式 / JavaScript 对象表示法 |
| Schema（模式） | 对数据结构、类型及约束的描述 |
| DBMS（Database Management System） | 数据库管理系统 |
| SQL（Structured Query Language） | 结构化查询语言 |
| Primary Key / Foreign Key | 主键 / 外键，用于记录标识及引用约束 |
| Index（索引） | 支持高效查询的数据结构 |
| Transaction（事务） | 作为逻辑工作单元执行的数据库操作 |
| ACID | 原子性、一致性、隔离性、持久性 |
| Backup / Replication | 备份 / 复制，分别服务恢复及数据副本同步等目的 |
| RPO / RTO | 恢复点目标 / 恢复时间目标 |

## 网络与云（第 9—10 章）

| 术语 | 定义 |
|---|---|
| Client / Server | 发起请求的客户端 / 提供服务的服务器 |
| IP（Internet Protocol） | 网络层寻址及数据报传输协议 |
| Port（端口） | TCP 或 UDP 中区分通信端点的编号 |
| Socket（套接字） | 应用使用的通信端点抽象 |
| DNS（Domain Name System） | 域名系统，提供名称相关记录查询 |
| localhost | 通常解析到本机回环地址的名称 |
| NAT（Network Address Translation） | 网络地址转换 |
| TCP / UDP | 可靠有序字节流传输协议 / 数据报传输协议 |
| TLS（Transport Layer Security） | 提供传输机密性、完整性和认证的协议 |
| HTTP（Hypertext Transfer Protocol） | 定义请求响应等应用语义的协议 |
| URL（Uniform Resource Locator） | 描述资源位置与访问方式的标识形式 |
| QUIC | 基于 UDP 的安全传输协议，供 HTTP/3 等使用 |
| VM（Virtual Machine） | 虚拟机 |
| Container（容器） | 依赖操作系统隔离机制的运行实例 |
| IaaS / PaaS / SaaS | 基础设施 / 平台 / 软件即服务 |
| Serverless | 由提供方管理服务器及运行资源的服务模式 |
| CDN（Content Delivery Network） | 内容分发网络 |
| Reverse Proxy / Load Balancer | 反向代理 / 负载均衡器 |
| Object Storage（对象存储） | 以对象及对象键组织数据的存储方式 |

## AI 与 Agent（第 11—12 章）

| 术语 | 定义 |
|---|---|
| LLM（Large Language Model） | 大语言模型 |
| Transformer | 常用于序列建模的神经网络架构 |
| Attention（注意力） | 按输入关系计算加权表示的机制 |
| Parameter（参数） | 模型内部参与计算的可学习数值 |
| Token / Tokenizer | 模型处理的序列单位 / 分词器 |
| Context Window（上下文窗口） | 单次模型处理的 Token 容量范围 |
| Training / Inference | 训练 / 推理，分别涉及参数学习与使用 |
| Embedding（嵌入向量） | 将数据表示为数值向量 |
| RAG（Retrieval-Augmented Generation） | 检索增强生成 |
| Agent | 将模型、工具、任务状态及执行流程结合的系统 |
| Tool Calling（工具调用） | 模型请求外部工具执行操作的机制 |
| MCP（Model Context Protocol） | AI 应用连接外部工具及资源的协议 |
| Hallucination（幻觉） | 缺乏事实依据或与证据冲突的生成内容 |
| Prompt Injection（提示注入） | 不可信内容试图影响模型指令执行的风险 |

## 软件工程与维护（第 12—14、16、18、22—23 章）

| 术语 | 定义 |
|---|---|
| Requirements Specification | 需求规格，描述行为及约束 |
| Acceptance Criteria | 验收标准，描述可观察的通过条件 |
| Build / Release / Deployment | 构建 / 发布 / 部署 |
| CI/CD | 持续集成及持续交付或持续部署 |
| Staging / Production | 预发布环境 / 生产环境 |
| Rollback（回滚） | 恢复已知版本或状态的操作 |
| Unit / Integration / E2E Test | 单元 / 集成 / 端到端测试 |
| Regression Test（回归测试） | 验证修改未破坏既有行为 |
| Stack Trace（调用堆栈） | 描述异常发生时的调用路径 |
| Observability（可观测性） | 根据系统输出理解内部状态的能力 |
| Logs / Metrics / Traces | 日志 / 指标 / 追踪 |
| Git / GitHub | 分布式版本控制系统 / 仓库托管协作平台 |
| Commit / Branch | 提交快照 / 指向提交的可移动引用 |
| PR（Pull Request） | 变更审查及整合请求 |
| SemVer（Semantic Versioning） | 语义化版本规范 |
| Lockfile（锁定文件） | 记录依赖解析结果的文件 |
| SBOM（Software Bill of Materials） | 软件物料清单 |
| TCO（Total Cost of Ownership） | 总拥有成本 |
| ADR（Architecture Decision Record） | 架构决策记录 |
| MVP（Minimum Viable Product） | 最小可行产品 |
| SLI / SLO / SLA | 服务等级指标 / 目标 / 协议 |
| SRE（Site Reliability Engineering） | 站点可靠性工程 |
| Runbook（运行手册） | 记录常见运维操作及处置步骤的文档 |
| Incident / Postmortem | 事故 / 事后复盘 |
| EOL（End of Life） | 生命周期终止或停止支持阶段 |

## 安全、密码学与隐私（第 15、19—21 章）

| 术语 | 定义 |
|---|---|
| Credential（凭据） | 证明身份或获得访问能力的信息 |
| API Key / Access Token | 服务调用标识或凭据 / 访问令牌 |
| Environment Variable | 进程环境中的名称与值 |
| Least Privilege（最小权限） | 仅授予任务必需的权限 |
| Rotation / Revocation | 凭据轮换 / 撤销 |
| CIA | 机密性、完整性、可用性 |
| Authentication / Authorization | 身份认证 / 访问授权 |
| RBAC / ABAC | 基于角色 / 属性的访问控制 |
| MFA（Multi-factor Authentication） | 多因素认证 |
| SQL Injection / XSS / CSRF | SQL 注入 / 跨站脚本 / 跨站请求伪造 |
| Encryption（加密） | 使用密钥将明文转换为密文的机制 |
| Hash（哈希） | 将输入映射为固定长度摘要的函数 |
| AEAD | 带关联数据的认证加密 |
| MAC（Message Authentication Code） | 使用秘密密钥生成的消息认证码 |
| Digital Signature（数字签名） | 利用私钥签名、公钥验证的机制 |
| Salt / Nonce | 盐 / 按算法要求使用的单次值 |
| PKI（Public Key Infrastructure） | 公钥基础设施 |
| E2EE（End-to-end Encryption） | 端到端加密 |
| Cookie | 浏览器按规则保存并发送的 HTTP 状态数据 |
| OAuth 2.0 / OIDC | 授权框架 / 基于该框架的身份层 |
| Data Minimization（数据最小化） | 按处理目的限制收集及保留范围 |
| Anonymization / Pseudonymization | 匿名化 / 假名化 |

本索引用于定位正文，不替代协议、语言或安全标准的正式规范。
