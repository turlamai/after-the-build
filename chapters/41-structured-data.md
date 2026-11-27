# 怎样保存具有内部结构的数据

CSV 适合保存许多具有相同字段的记录。但如果我们希望保存一次活动的名称、总名额和全部报名记录，这些数据就不只是单独的一张表了。

## 程序中的数据可以包含其他数据

我们先观察报名信息的组成关系：

- 活动具有名称和总名额。
- 活动包含一组报名记录。
- 每条报名记录具有编号和姓名。

把数据按照有意义的组成关系组织起来，就形成了结构化数据（Structured Data）。

在编程语言中，常用列表（List）表示一组有顺序的值，用映射（Map）或字典（Dictionary）表示名称与值之间的关联。具体名称和行为因语言而异。

## JSON 怎样表达这些关系

JSON（JavaScript Object Notation）是一种常见的文本数据交换格式。

```json
{
  "title": "周末活动",
  "capacity": 20,
  "registrations": [
    {"id": 17, "name": "小林"},
    {"id": 18, "name": "小王"}
  ]
}
```

大括号中的对象由名称和值组成，方括号中的数组表示有顺序的一组值。JSON 还规定了字符串、数字、布尔值和 null 等表示。

注意，JSON 对象并不等同于某个编程语言中所有可能存在的对象。例如函数不能直接作为 JSON 值保存。

![活动对象包含多个报名记录](../assets/intro-structured-records.svg)

## 序列化和反序列化

当程序运行时，数据可能分布在内存中的许多位置。我们不能简单地把内存地址发给另一台电脑，要求对方从同样的地址读取报名信息。

将程序内部的数据转换成适合保存或传输的表示，通常称为序列化（Serialization）。从这种表示恢复可供程序处理的数据，称为反序列化（Deserialization）。

Python 标准库可以完成一个简单的转换：

```python
import json

event = {"capacity": 20, "registered": 17}
encoded = json.dumps(event)
restored = json.loads(encoded)

print(restored["capacity"] - restored["registered"])
assert restored == event
```

预期输出 3。这里 json.dumps 生成 JSON 字符串；若要写入文件或网络，还可以根据约定将字符串编码为字节。

## 程序对象、JSON 文本与网络字节的区别

我们可以沿着一次报名请求观察三个层次。程序中的字典是供程序访问的数据结构；JSON 字符串是按照格式规则生成的文本；UTF-8 字节才是可以交给网络发送接口的一种表示。

```python
import json

record = {"name": "小林", "id": 17}
text = json.dumps(record, ensure_ascii=False, separators=(",", ":"))
payload = text.encode("utf-8")
assert len(payload) > len(text)
assert json.loads(payload.decode("utf-8")) == record
print(len(text), len(payload))
```

这里的 separators 参数指定分隔符的形式，ensure_ascii=False 使中文可以直接出现在生成的文本中。两种不同的合法 JSON 文本也可能表示同样的数据，因此不能把 JSON 文本的字节完全相等作为数据内容相等的唯一判断方法。

![程序数据、JSON 文本及 UTF-8 字节的转换关系](../assets/intro-serialization-layers.svg)

序列化可以保存约定的数据结构，但不必保存程序对象的全部内部状态。例如两个变量可能引用同一个内存对象，普通 JSON 并不负责恢复这一共享引用关系。

## 能够解析不代表数据正确

下面的数据符合 JSON 语法：

```json
{"capacity": -20, "registered": "很多"}
```

但是，它不符合我们的报名业务要求。

规定允许出现哪些字段、字段具有什么类型、满足什么约束的结构说明，可以称为数据模式（Schema）。程序还需要进行必要的数据验证（Validation）。

数据格式解决如何表达；数据验证解决表达的内容是否满足约定。二者不能互相替代。

如果报名人数越来越多，每次修改都要重新读取和写入整个 JSON 文件，是否仍然合适？下一章将从这个问题引出数据库。
