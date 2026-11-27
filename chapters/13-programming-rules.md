# 怎样用程序表达一项计算规则

上一章的程序只计算剩余名额。现在我们希望它能够判断是否允许报名，并在允许时更新人数。

先看一段 Python 代码。无需学习完整的 Python 语言，只要顺着其中的数据变化理解每一步即可。

```python
total = 20
registered = 19

if registered < total:
    registered = registered + 1
    print("报名成功")
else:
    print("名额已满")

print(registered)
```

预期先输出「报名成功」，再输出 20。

## 为数据建立可使用的名称

第一行 total = 20 建立名称 total 与整数值 20 之间的关系。我们把程序中用于关联值或存储位置的名称称为变量（Variable）。不同语言对变量的具体实现有所不同。

第三章告诉我们，同一组二进制位可以代表不同内容。程序同样需要知道一个值应该如何解释。例如数字 20 可以参与算术，而文字 "20" 则首先是由字符组成的内容。

规定一类值及其可用操作的概念称为数据类型（Data Type）。整数、字符串（String）和布尔值都是常见类型。

## 根据条件选择执行路径

if 后面的 registered < total 是一个判断。根据第一部讲过的逻辑知识，它会产生真或假两种结果。

条件成立时，执行缩进在 if 下方的操作；否则执行 else 下方的操作。这类根据条件决定后续步骤的结构称为条件分支（Conditional Branch）。

registered = registered + 1 在 Python 中不是一道数学等式，而是先读取原来的值、计算加法，然后让名称关联新的值。这里更新的是程序运行中的状态。

## 重复执行同一个规则

如果我们有多个报名申请，就不必把同样的处理步骤复制许多次。

```python
registered = 17
for name in ["小林", "小王", "小陈"]:
    registered = registered + 1
    print(name, registered)
```

方括号中的三个姓名构成一个列表（List）：它按照顺序保存多个值。for 每次从列表中取得一个值，让 name 关联这个值，再执行缩进部分。这里的列表有三个元素，因此循环执行三次。

这段程序依次处理三个虚构姓名，人数分别变为 18、19、20。重复执行一组步骤的结构称为循环（Loop）。

注意，这个示例没有重新检查剩余名额。若初始人数改为 19，最后就会得到 22。这不是计算机执行错误，而是我们提供的规则不完整。

## 怎样复用计算规则

当多处需要计算剩余名额时，可以把规则单独组织起来：

```python
def remaining(total, registered):
    return total - registered

print(remaining(20, 17))
print(remaining(30, 12))
```

这段程序输出 3 和 18。可以接收输入并执行一组操作的可调用程序单元，通常称为函数（Function）。调用时提供的值称为实参；函数定义中用于接收值的名称称为形参。return 表示将计算结果返回给调用处。

函数使我们能够给一段规则命名并反复使用，而不用在每个位置重新描述它。

这些机制并非 Python 独有。不同语言使用不同语法，但数据、判断、重复和组织计算规则是许多语言共同面对的问题。

## 函数调用与局部状态

一个函数可以调用另一个函数。先看一个很小的例子：

```python
def remaining(total, registered):
    return total - registered

def can_register(total, registered):
    available = remaining(total, registered)
    return available > 0

assert can_register(20, 19) is True
assert can_register(20, 20) is False
```

执行 can_register 时，它调用 remaining，等待其结果返回，再完成比较。每次调用都需要保存返回后继续执行的位置，以及本次调用使用的有关数据。

很多执行环境将这些调用信息组织成调用栈（Call Stack）：最后开始的尚未结束的调用，通常最先返回。栈（Stack）是一种后进先出的组织方式。局部变量的具体保存方式由语言及其实现决定，不一定都直接位于机器栈中。

## 运行期间也可能遇到错误

例如整数除以零，在 Python 中会产生异常（Exception），而不是一个普通的计算结果。程序可以明确处理某些可预期的异常：

```python
try:
    number = int("abc")
except ValueError:
    number = None
assert number is None
```

这里 int 尝试把文字转换为整数，失败时产生 ValueError。except 指定如何处理这种异常。真实报名程序不能因为输入不是数字就无声地接受错误记录，也不应随意忽略所有异常。

现在我们已经写出了机器指令之外的另一种程序表达形式。接下来要回答的是：谁来执行这些文字？