# 第 4 章 用户界面、终端与 Shell

> 命令行不是机器指令，而是可组合、可记录的软件交互接口。

## 一、GUI 与 CLI

图形用户界面（Graphical User Interface，GUI）通过窗口、控件等接收用户操作。命令行界面（Command-line Interface，CLI）通过文本参数接受操作请求。两者最终都由程序处理输入，并可能调用同一业务逻辑。

终端（Terminal）提供文本输入输出环境。Shell 是解释命令、处理变量和启动程序的软件。常见 Shell 包括 Bash、Zsh 和 PowerShell。终端窗口与 Shell 并非同一个概念。

## 二、命令的组成

以读取 Git 状态的命令为例：

```sh
git status --short
```

git 是程序名称，status 是子命令，--short 是选项。Shell 处理引号、变量展开和参数等语法后启动程序。不同 Shell 的语法可能不同，不能假设 Bash 命令可以原样用于 PowerShell。

PATH 环境变量通常用于查找可执行程序。当提示 command not found 时，可能是程序未安装、路径未配置或名称错误。它与程序启动后返回的业务错误不同。

## 三、输入、输出与退出状态

标准输入（Standard Input，stdin）、标准输出（Standard Output，stdout）和标准错误（Standard Error，stderr）是常见的进程输入输出通道。输出文字颜色不是成功与失败的可靠指标。

退出码（Exit Code）用于报告进程结束状态。许多 CLI 工具以 0 表示成功、非零表示失败，但具体含义应查阅工具文档。成功退出也不代表业务结果一定符合要求。

管道（Pipe）可以将一个程序的输出传给下一个程序。重定向（Redirection）可以将输出写入文件。Shell 中的 > 常常会覆盖目标文件，因此执行前应检查目标路径。

## 四、环境与权限

环境变量（Environment Variable）是传递给进程的名称与值。PATH、语言区域和服务配置都可能通过环境变量影响程序行为。当前工作目录也会影响相对路径。

sudo 可以在类 Unix 系统中以其他用户身份执行命令，常用于获得更高权限；Windows 具有不同的权限提升机制。权限提升不应该是普通故障的默认解决方案。

不要执行未经理解的远程脚本、删除命令或包含真实凭据的命令。命令历史与日志可能保存参数，秘密不应随意出现在其中。

## 五、实践：查看工作目录与退出码

先打开终端。在 macOS 或 Linux 的 Bash/Zsh 中执行：

```sh
pwd
ls -la
git --version
echo $?
```

在 PowerShell 中执行：

```powershell
Get-Location
Get-ChildItem -Force
git --version
$LASTEXITCODE
```

git --version 需要预先安装 Git。若程序没有安装，应记录错误，不必为了练习安装额外软件。退出码应紧接目标外部命令读取；PowerShell 的 $LASTEXITCODE 不适用于解释所有 cmdlet 的结果。

## 六、自动化与 Agent

CLI 的优势在于参数可记录、输出可检查、操作可自动化，而不是同一命令永远产生同一结果。文件状态、环境变量和网络资源变化都可能影响执行。

请 Agent 明确目标操作系统、Shell、当前目录、依赖版本和命令目的；优先执行只读检查。执行后提供完整相关错误信息、退出码及产物路径，而非只根据最后一行日志判断成功。

## 七、知识检验

- 终端、Shell、CLI 程序分别负责什么？
- PATH 如何影响命令查找？
- stderr 中出现文字是否必然代表失败？
- 为什么重定向与权限提升需要额外检查？

进阶方向：Shell 脚本、参数解析、进程环境、管道、幂等性与自动化接口。
