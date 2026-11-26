# 怎样告诉数据库我们想要哪些数据

以前我们使用循环逐条检查记录。如果现在已经有一张报名表，能不能直接告诉数据库：请返回活动 1 的全部报名者？

结构化查询语言（Structured Query Language，SQL）正是关系型数据库中广泛使用的语言。

## 先提出一个具体的查询

```sql
SELECT id, name
FROM registrations
WHERE event_id = 1;
```

SELECT 指定希望获得的列，FROM 指定数据来自哪张表，WHERE 指定记录应满足的条件。

我们描述希望得到什么结果，数据库负责选择相应的执行方法。这是一种常见的声明式表达方式。

SQL 还可以通过 INSERT 添加记录，通过 UPDATE 修改记录，通过 DELETE 删除记录，通过 CREATE TABLE 建立表结构。

这些操作并不都只是查询。执行会改变数据的语句时，应当明确目标及条件。

## 亲自运行一个数据库

下面的实验使用 Python 标准库中的 SQLite 接口，不需要部署数据库服务器。数据库位于内存中，关闭连接后不会保留实验数据。

```python
import sqlite3

db = sqlite3.connect(":memory:")
db.execute("""
    CREATE TABLE registrations (
        id INTEGER PRIMARY KEY,
        event_id INTEGER NOT NULL,
        name TEXT NOT NULL
    )
""")
db.executemany(
    "INSERT INTO registrations VALUES (?, ?, ?)",
    [(17, 1, "小林"), (18, 1, "小王"), (19, 2, "小陈")]
)
rows = db.execute(
    "SELECT id, name FROM registrations WHERE event_id = ? ORDER BY id",
    (1,)
).fetchall()

assert rows == [(17, "小林"), (18, "小王")]
print(rows)
db.close()
```

这段代码依次建立表、插入三条虚构记录、查询活动 1 的报名者，并检查结果。

问号是参数占位符。实际值通过数据库接口单独传递，而不是拼接成 SQL 源代码。这有助于避免把外部输入误解释成 SQL 指令，安全部分还会进一步解释这个问题。

## 怎样统计人数

如果我们不需要所有姓名，只需要报名人数，可以使用：

```sql
SELECT COUNT(*)
FROM registrations
WHERE event_id = 1;
```

数据库返回满足条件的记录数。对于前面的数据，结果为 2。

如果查询没有指定排序规则，不能依赖数据库偶然返回的记录顺序。需要固定顺序时，应当使用适当的 ORDER BY。

SQL 的不同实现存在语法和功能差异。本章实验具体使用 SQLite，并不表示所有数据库都完全使用同样的语法。

下一章我们来看看数据库如何避免每次查询都检查全部记录。
