<div align="center">
  <h1 style="margin-top: 15px;">电商问数智能数据分析 Agent</h1>
  <h4><b>shopkeeper-agent</b></h4>
  <p><em>面向电商数仓问数场景的智能数据分析工作台，支持自然语言提问、混合检索、LangGraph 流程编排、SQL 生成校验和 SSE 流式返回</em></p>
</div>

<div align="center">

![Python](https://img.shields.io/badge/Python-3.14-3776AB.svg?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571.svg?logo=fastapi&logoColor=white)
![LangGraph](https://img.shields.io/badge/LangGraph-Agentic%20Workflow-1C3C3C.svg)
![React](https://img.shields.io/badge/React-61DAFB.svg?logo=react&logoColor=000)
![MySQL](https://img.shields.io/badge/MySQL-4479A1.svg?logo=mysql&logoColor=white)
![Qdrant](https://img.shields.io/badge/Qdrant-FF6F61.svg)
![Elasticsearch](https://img.shields.io/badge/Elasticsearch-005571.svg?logo=elasticsearch&logoColor=white)

</div>

![电商问数工作台空状态，左侧样例与会话控制，中间问答区，右侧运行概览](docs/images/shopkeeper-agent-home.jpg)

![电商问数查询结果页，展示 LangGraph 执行流程和查询结果表格](docs/images/shopkeeper-agent-query-result.jpg)

## 项目简介

这个项目解决的是一个很具体的问题: 业务同学想问数，但不想自己写 SQL，也不想去记表、字段、指标和口径。

现在这版已经把召回、生成、校验、执行和展示串成了一条完整链路:

- 用户输入自然语言问题
- 系统召回相关字段、指标和字段取值
- LangGraph 组织多阶段问数流程
- 生成 SQL、校验 SQL、执行 SQL
- 结果通过 SSE 流式返回到前端

前端也改成了三栏工作台，不再只是单一聊天框:

- 左侧是样例问题、新会话和接口状态
- 中间是对话区、当前问题、执行状态和结果摘要
- 右侧是运行概览、最近分析记录和一键复用入口

## 现在的前端

这版界面重点做了三件事:

1. 把问数流程收进一个三栏工作台，信息更集中。
2. 保留流式反馈，让每一步执行状态都看得见。
3. 用本地最近记录补上会话轨迹，方便反复试问题。

移动端会自动收敛成单栏布局，桌面端保持三栏。

## 核心能力

- 混合检索: `Qdrant` 负责字段和指标语义召回，`Elasticsearch` 负责字段取值检索，`MySQL` 保存结构化元数据。
- 流程编排: `LangGraph` 负责把召回、过滤、生成、校验和执行串起来。
- 实时返回: 后端通过 `SSE` 推送节点进度、结果和错误信息。
- 本地可视化: 前端保留最近分析记录、运行状态和结果摘要，适合本地演示和面试讲解。
- 数据落地: 元数据库和教学数仓都接到本地 MySQL，Navicat 里可以直接看 `meta` 和 `dw` 两个库。

## 技术栈

| 模块 | 技术 | 作用 |
| --- | --- | --- |
| 智能体编排 | `LangGraph` | 组织多阶段问数流程 |
| 后端接口 | `FastAPI` | 提供问数 API 和生命周期管理 |
| 流式协议 | `SSE` | 推送执行进度和结果 |
| 元数据存储 | `MySQL` / `SQLAlchemy` | 保存表、字段、指标等结构化信息 |
| 向量检索 | `Qdrant` | 存储字段和指标向量 |
| 全文检索 | `Elasticsearch` | 检索字段真实取值 |
| 前端 | `React` / `Vite` / `Tailwind CSS` | 提供三栏工作台和结果展示 |
| 依赖管理 | `uv` / `pnpm` | 管理后端和前端依赖 |

## 项目结构

```text
shopkeeper-agent/
├── app/                  # 后端业务代码、智能体、接口、服务和仓储
├── conf/                 # app_config.yaml、meta_config.yaml
├── docs/                 # 项目截图和架构图
├── frontend/             # React + Vite + Tailwind CSS 前端
├── prompts/              # SQL 生成、修正和过滤模板
├── main.py               # FastAPI 应用入口
└── pyproject.toml        # Python 依赖和工具配置
```

## 本地运行

项目依赖本地运行的 MySQL、Qdrant、Elasticsearch 和 Embedding 服务，连接信息在 [conf/app_config.yaml](conf/app_config.yaml) 里。

### 1. 准备环境

- Python `>= 3.14`
- `uv`
- Node.js
- `pnpm`

### 2. 克隆项目

```bash
git clone https://github.com/qiqiqi-max/shopkeeper-agent.git
cd shopkeeper-agent
```

### 3. 安装后端依赖

```bash
uv sync
```

### 4. 配置环境变量

复制 `.env.example` 为 `.env`，然后设置 LLM 相关信息:

```bash
LLM_API_KEY=your_real_api_key
LLM_BASE_URL=your_llm_base_url
```

### 5. 准备 Embedding 模型

把 `BAAI/bge-large-zh-v1.5` 下载到你本地的 embedding 服务目录，并和 `conf/app_config.yaml` 里的挂载路径保持一致。

### 6. 构建元数据知识库

```bash
uv run python -m app.scripts.build_meta_knowledge -c conf/meta_config.yaml
```

### 7. 启动后端

```bash
uv run fastapi dev main.py
```

### 8. 启动前端

```bash
cd frontend
pnpm install
pnpm dev
```

默认前端会通过 `/api` 代理到后端接口。需要手动改地址时，调整 `frontend/.env` 里的 `VITE_DEV_PROXY_TARGET` 或 `VITE_API_BASE_URL`。

## 数据库说明

当前配置使用本地 MySQL。

- 元数据库: `meta`
- 教学数仓: `dw`
- 账号: `shopkeeper-agent`
- 密码: `123456`

Navicat 里直接连本机 `3306` 就能看到这两个库。

## 项目现状

当前版本已经打通本地 MySQL、元数据构建、问数链路、前端三栏工作台和结果展示，可以直接用于本地演示和二次开发。
