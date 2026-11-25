# 第 17 章 数据存储、数据库与灾难恢复

> 数据的持久化、完整性、可迁移性和恢复能力必须分别设计与验证。

## 一、数据存储的位置

持久化（Persistence）指数据在进程退出或重启之后仍可保留。浏览器 Local Storage、IndexedDB、本地文件、关系型数据库、对象存储等都是常见存储方式，但生命周期和访问范围不同。

浏览器存储通常与站点来源及浏览器配置相关，可能因用户清理站点数据、配额策略或设备故障而丢失。缓存原则上是可再生成的副本，但具体应用可能混用存储，因此清理前应确认实际数据位置。

数据库管理系统（Database Management System，DBMS）提供数据组织、查询、更新和一致性等能力。数据库不只是带索引的文件集合。

## 二、关系型数据库与数据模型

关系型数据库（Relational Database）以表、行和列等结构表达数据。主键（Primary Key）唯一标识记录，外键（Foreign Key）约束记录间的引用关系，唯一约束（Unique Constraint）防止违反指定唯一性规则。

报名系统可以包含 users、events 和 registrations 三张表。registrations 使用 user_id 与 event_id 引用用户和活动，并建立组合唯一约束防止重复报名。

SQL（Structured Query Language）是关系型数据库常用的查询和操作语言。例如：

```sql
SELECT event_id, COUNT(*) AS registrations
FROM registrations
GROUP BY event_id;
```

该语句按活动统计报名记录数。它不等于独立用户数，除非数据模型保证每个活动中用户唯一。

## 三、事务与一致性

事务（Transaction）将多个数据库操作组织为逻辑工作单元。ACID 通常描述原子性、一致性、隔离性和持久性。不同数据库的隔离级别及持久性配置存在差异。

转账或库存扣减可能包含多次写入。若部分写入成功而其他失败，可能导致不一致状态。事务可用于约束这组操作的提交与回滚，但涉及外部支付、邮件等系统时，还需要额外的跨系统一致性设计。

数据库索引可加速某些查询，约束用于保护数据规则，两者不能互相替代。

## 四、备份、复制和同步

备份（Backup）是独立保存的可恢复数据副本；复制（Replication）将数据变化传递给其他实例，以提高可用性或读取能力；同步（Synchronization）使多个位置的数据保持一致。

复制和同步可能传播误删除、错误更新或恶意修改，因此不能直接代替具备历史恢复能力的备份。

3-2-1 策略建议保留至少三份数据、使用两种不同存储介质，并有一份异地副本。实际设计还应考虑独立凭据、不可变或离线副本以及加密。

恢复点目标（Recovery Point Objective，RPO）表示可容忍的数据丢失时间范围；恢复时间目标（Recovery Time Objective，RTO）表示可容忍的恢复时间。每天备份一次通常无法保证只丢失五分钟的数据。

## 五、导出与迁移

导出 CSV 或 JSON 可以提高数据可移植性，但不一定保留完整的数据模型、约束、附件、权限和事务状态。数据库逻辑备份、物理备份及增量日志各有适用范围。

迁移（Migration）需要映射字段和类型、保留标识关系、检查记录数及业务一致性，并验证目标应用能读取数据。平台锁定（Vendor Lock-in）不仅来自私有数据格式，也来自专用 API、权限体系和运行环境。

## 六、实践：执行恢复演练

使用独立测试目录和虚构数据，若已安装 Python 3，可运行以下程序建立 SQLite 数据库、创建备份并检查恢复副本：

```python
import sqlite3
import tempfile
from pathlib import Path

with tempfile.TemporaryDirectory() as directory:
    source = Path(directory) / "source.db"
    backup = Path(directory) / "backup.db"
    with sqlite3.connect(source) as db:
        db.execute("CREATE TABLE records (id INTEGER PRIMARY KEY)")
        db.execute("INSERT INTO records VALUES (1)")
        db.commit()
        with sqlite3.connect(backup) as target:
            db.backup(target)
            assert target.execute("SELECT COUNT(*) FROM records").fetchone()[0] == 1
            assert target.execute("PRAGMA integrity_check").fetchone()[0] == "ok"
    print("backup verified")
```

这只是单数据库的最小练习，不包含附件、配置及生产权限恢复。真实恢复演练应在隔离环境完成，验证业务查询、数据完整性及实际恢复耗时。

## 七、与 Agent 协作

请识别全部数据存储位置、数据模型和持久化机制，定义 RPO、RTO 及备份保留策略。在隔离环境执行恢复演练，检查约束、记录数、附件和关键业务流程；未经授权不清理生产数据、不覆盖原数据库。

## 八、知识检验

- 为什么复制不能代替备份？
- 主键、外键和唯一约束有何区别？
- RPO 与 RTO 分别衡量什么？
- 为什么能够导出 CSV 不代表能够完整迁移系统？

进阶方向：数据库规范化、事务隔离、WAL、时间点恢复（PITR）、数据库迁移与灾难恢复。
