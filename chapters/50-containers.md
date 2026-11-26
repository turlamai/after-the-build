# 容器为什么不等于一台小型虚拟机

假设报名后端与另一项服务都适合运行在 Linux 上。我们希望它们拥有独立的依赖和文件环境，却不一定希望每个应用启动一套完整的客户操作系统。

## 从操作系统已有的隔离能力出发

Linux 可以让不同进程看到不同范围的系统资源，例如进程编号、文件系统和网络环境。常见机制包括命名空间（Namespace）。

系统也可以管理一组进程对 CPU、内存等资源的使用。Linux 中承担这类职责的机制之一是控制组（Control Group，cgroup）。

这些能力与文件、网络及配置管理相结合，可以为应用建立相对独立的运行环境。这是常见 Linux 容器（Container）的基础。

![虚拟机具有各自的客户内核，普通 Linux 容器共享宿主 Linux 内核](../assets/intro-containers-vs-vm.svg)

## 镜像与正在运行的容器

我们可以把 Python、必要依赖、应用代码和启动配置组织成容器镜像（Container Image）。容器运行工具根据镜像及具体配置创建运行环境，启动应用进程。

同一镜像可以创建多个容器，每个容器可以拥有自己的运行配置和可写状态。

Docker 是广泛使用的容器构建和运行工具之一，而不是全部容器技术的统称。

## 一个最小实验

在专用实验目录创建 app.py：

```python
print("registration service")
```

再创建名为 Dockerfile 的文件：

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY app.py .
CMD ["python", "app.py"]
```

FROM 选择基础镜像，WORKDIR 设置工作目录，COPY 复制构建所需文件，CMD 指定默认启动命令。

如果已经安装并启动 Docker 环境，且可以取得相应镜像，可执行：

```sh
docker build -t registration-demo .
docker run --rm registration-demo
```

预期程序输出 registration service 后结束。这个实验只是演示镜像与容器的关系，不是真实报名服务器。基础镜像下载需要网络，本实验尚未执行。

## 为什么容器替换时必须保护数据

如果数据库只保存在容器自己的可写层，删除容器时数据可能消失。长期数据应放在具有独立生命周期的持久化存储中，例如通过卷（Volume）或其他挂载机制访问的存储。

镜像也不应该随意包含用户数据和生产凭据。

普通 Linux 容器共享 Linux 内核。在 macOS 或 Windows 上运行 Linux 容器时，常见桌面工具可能使用 Linux 虚拟机提供相应环境。镜像中的本机代码还需要与处理器架构兼容。

容器能够减少环境差异，但不能消除所有平台差异，也不意味着绝对安全。
