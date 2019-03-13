# JBDAP-Node-Wrap 概览

## **[English Version](https://github.com/JBDAP/JBDAP-Node-Wrap/blob/master/README.md)**

<div id="nav" style="width:100%;height:1px;border:none;"></div>

### 目录导航

<div style="width:100%;height:20px;border:none;"></div>

## 一、这到底是个啥？

**JBDAP-Node-Wrap** 是 **JBDAP** 的 nodejs 版官方实现，简单来说就是一个关系型数据库访问组件，帮助开发人员快速实现数据库相关应用的搭建，数据处理模块代码量有望减少 **70%** 以上。

<div style="width:100%;height:20px;border:none;"></div>

## 二、它跟 ORM 框架有什么不同？

ORM 的主要目的是将数据操作代码 **对象化、语义化、简洁化**，ORM 很棒，它工作在 **“术”** 的层面，让我们的数据处理模块变得清晰易懂，不再杂乱无章。ORM 改变的是具体编码模式和质量，但是我们依然要为每个数据表去编写对应的数据模型类和数据实体类，里面充斥着大量雷同的模板化代码。

JBDAP 的设计则定位在 **“道”** 的层面，目的是将数据处理整个这一层的开发工作大限度 **自动化、标准化、配置化**，换言之，我们希望改变的是开发模式，以尽可能的砍掉那些雷同的数据对象处理类。

### JBDAP 设计指导思想如下：

- 用 JSON 操作数据，一切基于配置，让开发人员跟 SQL 和数据实体类说再见
- 反对数据表与 API 生硬对应的 **“Restful 式不负责任的懒汉数据接口设计”**，提供简洁又极致自由的强大 API 模型
- 支持在保证数据安全的前提下将数据操作权限开放给前端开发者

听起来不错，但是它真的好用吗？

<div style="width:100%;height:20px;border:none;"></div>

## 三、JBDAP 的主要功能及特色：

- 支持大多数主流关系型数据库，如 Postgres, MSSQL, MySQL, MariaDB, SQLite3, Oracle, 甚至包含 Amazon Redshift
- 高度语义化的 JSON 配置，上手简单、易学难忘，两小时会用无压力
- 功能强大、可编程、支持复杂逻辑操作、支持事务
- 数据结构任意改变，基础 API 稳如泰山，减少需求变动带来的系统频繁更新发布
- 减轻沟通负担，只需数据库词典在手，从此告别 API 文档
- 暴爽的开发速度，一天搞定一个数据访问 API 应用开发

<div style="width:100%;height:20px;border:none;"></div>

## 四、JBDAP 可以用在哪些开发场景：

- 网络应用的 **WebAPI 开发**，如 APP 后端接口，最少一个 url 就可以支持整库所有表的操作
- 三层架构 WEB 应用开发中的 **DAO 层开发**，或者任何其它开发模型的数据访问层开发
- 本地应用（如 Electron 应用）开发中的 **数据库交互**

