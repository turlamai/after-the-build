# 全书知识路线

全书按照概念依赖组织，而非按照产品类别罗列名词。零基础读者建议从序章顺序阅读。已有工程经验的读者可以按下列入口补齐知识。

## 信息与计算

从信息、位和编码到计算规则。阅读 [第 1 章](./01-information.html) 至 [第 5 章](./05-computation.html)。

## 计算机内部

数字电路、指令、处理器与存储。阅读 [第 6 章](./06-digital-logic.html) 至 [第 11 章](./11-storage-hierarchy.html)。

## 程序与操作系统

语言、运行环境、内核、进程和文件。阅读 [第 12 章](./12-programming-language.html) 至 [第 21 章](./21-terminal-shell.html)。

## 应用软件

界面、模块、构建及平台。阅读 [第 22 章](./22-input-output-events.html) 至 [第 28 章](./28-software-updates.html)。

## 网络与 Web

从设备通信到浏览器与网络应用。阅读 [第 29 章](./29-network-communication.html) 至 [第 39 章](./39-localhost-deployment.html)。

## 数据与数据库

数据格式、查询、事务与恢复。阅读 [第 40 章](./40-data-formats.html) 至 [第 46 章](./46-data-durability.html)。

## 服务器与云计算

部署、虚拟化、云服务与容量。阅读 [第 47 章](./47-server-environment.html) 至 [第 53 章](./53-capacity-and-cost.html)。

## 软件工程

需求、测试、版本、发布与可靠性。阅读 [第 54 章](./54-requirements.html) 至 [第 62 章](./62-software-reliability.html)。

## 安全与隐私

身份、密码学、HTTPS 与数据保护。阅读 [第 63 章](./63-authentication-authorization.html) 至 [第 71 章](./71-data-privacy.html)。

## AI 与 Agent

模型、上下文、检索与可验证执行。阅读 [第 72 章](./72-models-and-data.html) 至 [第 81 章](./81-agent-verification.html)。

## 从想法到产品

完整教学项目与工程验收。阅读 [第 82 章](./82-product-requirements.html) 至 [第 86 章](./86-maintaining-a-product.html)。

遇到陌生概念时回到其首次建立的章节。最后通过报名项目检验自己能否解释数据从界面输入到数据库提交的全过程。

## 按问题回溯，而不是从术语猜答案

| 遇到的问题 | 先建立的知识 | 继续阅读 |
|---|---|---|
| 字符显示乱码 | [字符、字节和编码](./04-text-encoding.html) | [数据格式](./40-data-formats.html)、[序列化](./41-structured-data.html) |
| 程序为什么打不开 | [指令集](./09-instructions.html)、[编译和链接](./14-code-to-execution.html) | [平台兼容](./27-platforms-compatibility.html)、[构建与打包](./26-build-packaging.html) |
| 界面点击没有响应 | [线程与调度](./17-processes-threads.html)、[事件](./22-input-output-events.html) | [图形界面](./23-graphical-interface.html)、[调试](./57-debugging.html) |
| 别人的电脑打不开我的网页 | [IP 与子网](./31-ip-addresses.html)、[端口与 Socket](./34-ports-sockets.html) | [本地与公网部署](./39-localhost-deployment.html)、[网站托管](./48-hosting-and-domains.html) |
| 两个人同时抢到最后一个名额 | [进程与线程](./17-processes-threads.html)、[关系型数据库](./42-relational-database.html) | [事务](./45-database-transactions.html)、[产品验证](./85-product-verification.html) |
| 用户重试导致重复记录 | [HTTP](./36-http.html)、[事务](./45-database-transactions.html) | [幂等性与重试](./62-software-reliability.html)、[产品接口](./83-product-architecture.html) |
| 网站访问变慢 | [数据库索引](./44-database-indexes.html)、[容量与成本](./53-capacity-and-cost.html) | [性能分析](./55-algorithms-and-measurement.html)、[可观测性](./61-observability.html) |
| HTTPS 证书为什么出错 | [哈希](./65-cryptographic-hash.html)、[公钥密码学](./67-public-key-cryptography.html) | [证书](./68-signatures-certificates.html)、[TLS](./69-tls-https.html) |
| AI 不知道刚修改的项目 | [上下文](./75-context-and-attention.html)、[检索](./76-embeddings-retrieval.html) | [RAG](./77-rag.html)、[工具调用](./78-tool-calling.html) |
| Agent 声称完成却没有交付 | [验收标准](./54-requirements.html)、[版本控制](./58-git-version-control.html) | [Agent 验证](./81-agent-verification.html)、[产品维护](./86-maintaining-a-product.html) |

读者可以先沿某个问题回到相关章节，再顺着正文建立依赖关系。表中的入口不是完整的先修清单，也不保证每种故障只有一种原因。
