# 只剩一个名额，两个人同时报名怎么办

在第五部，我们遇到了一个尚未解决的问题：后端收到两个几乎同时发生的报名请求，而活动只剩一个名额。

假设两项工作都按照以下步骤运行：

1. 读取已报名人数 19。
2. 判断人数小于总名额 20。
3. 添加一条报名记录。

如果两个请求都在对方完成写入之前读取了 19，就可能都通过检查，最终得到 21 条报名记录。

这不是减法计算错误，而是多项操作之间缺少适当的协调。

## 一项业务可能包含多个数据操作

一次报名不仅需要增加人数，还可能需要创建记录。如果只完成其中一步就发生错误，数据就可能处于不完整的状态。

数据库事务（Transaction）允许把相关操作组织为一个具有明确完成或取消边界的工作单位。

事务提交（Commit）表示要求数据库完成这项事务的修改。回滚（Rollback）则用于取消尚未提交的事务修改。

## 观察回滚行为

```python
import sqlite3

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE registrations (name TEXT)")
db.commit()

db.execute("INSERT INTO registrations VALUES (?)", ("小林",))
db.rollback()

count = db.execute("SELECT COUNT(*) FROM registrations").fetchone()[0]
assert count == 0

db.execute("INSERT INTO registrations VALUES (?)", ("小王",))
db.commit()

count = db.execute("SELECT COUNT(*) FROM registrations").fetchone()[0]
assert count == 1
print(count)
db.close()
```

预期输出 1。第一次插入被回滚，第二次插入被提交。

这是事务边界的实验，不是完整的并发报名实现，也不验证断电后的持久性。

## 事务的四项典型性质

人们常用 ACID 描述数据库事务的重要性质：

- 原子性（Atomicity）：事务中的修改作为整体成功或失败。
- 一致性（Consistency）：事务在满足适当业务逻辑和数据库约束的条件下，将有效的数据状态转换为另一个有效状态。
- 隔离性（Isolation）：并发事务之间的影响受到相应规则限制。
- 持久性（Durability）：在系统承诺的条件下，已提交的结果能够在故障后保留。

不同数据库及隔离级别提供的具体保证并不完全一样。仅仅写上 BEGIN 和 COMMIT，不会自动修复所有竞争问题。

## 怎样保护最后一个名额

一种设计是让数据库在适当的事务及并发控制条件下执行带限制的更新：

```sql
UPDATE events
SET registered = registered + 1
WHERE id = 1 AND registered < capacity;
```

然后检查实际修改的行数。如果没有成功更新，说明当前条件不满足，或者目标记录不存在。

如果更新成功，再在同一事务中写入报名记录。如果其中任何必要操作失败，则回滚相关修改。

这种方案还需要根据具体数据库的锁、隔离级别、错误重试及约束规则验证正确性，并确保所有相关写入遵守一致的协议。

![两个请求竞争最后一个名额时，受控更新只允许一个成功](../assets/intro-transaction-capacity.svg)

此外，网络中断可能使客户端不知道服务端究竟有没有成功提交事务。盲目重试可能造成重复报名。后续可靠性章节将介绍如何使用请求标识等机制处理这类问题。

数据库能提供强大的工具，但程序必须明确自身的业务约束，并用测试验证这些约束确实得到保护。
