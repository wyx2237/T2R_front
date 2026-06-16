# FastAPI 后端原型 — 设计方案

> 技术选型：FastAPI + JSON 文件存储，无数据库

---

## 1. 背景

前端 Vue3 项目已通过 axios-mock-adapter 模拟了全部 API（见 `API.md`）。现在需要一个真实的 FastAPI 后端，使用 JSON 文件存储指标定义数据，替换前端 mock，使系统真正跑通。

核心目标：**结构清晰、接口对齐 API.md、可扩展**。原型阶段不引入数据库。

---

## 2. 目录结构

```
T2R_back/                          ← 与 T2R_front 平级
├── main.py                        ← 应用入口：挂载路由 + CORS + 生命周期
├── requirements.txt               ← 依赖清单
├── data/                          ← JSON 文件存储
│   ├── tools.json                 ← 8 个原子工具模板（只读，随代码交付）
│   └── metrics.json               ← 指标定义列表（可 CRUD，运行时写回文件）
├── models/                        ← Pydantic 模型（对应 API.md 中的类型定义）
│   ├── __init__.py
│   ├── tool.py                    ← AtomicTool, MetaInfo, FlowInfo, ExecInfo, ToolExample
│   ├── metric.py                  ← Metric, WorkflowInput/Output, WorkflowStep, StepInput/Output
│   └── compute.py                 ← ComputeSession, MetricComputeResult, StepTrace, ExtractedParam
├── services/                      ← 业务逻辑层
│   ├── __init__.py
│   ├── tool_store.py              ← 工具模板加载（从 tools.json 只读）
│   ├── metric_store.py            ← 指标 CRUD（读写 metrics.json，加文件锁）
│   ├── session_manager.py         ← 会话管理（内存字典，上传 → 选指标 → 执行）
│   └── executor.py                ← 计算执行引擎（模拟逐步骤返回）
├── routers/                       ← 路由层，与 API.md 的三个章节一一对应
│   ├── __init__.py
│   ├── tools.py                   ← GET /api/tools
│   ├── metrics.py                 ← GET /POST/PUT/DELETE /api/metrics[/:id]
│   └── compute.py                 ← 上传 / 执行 / 会话状态 / 导出报告
```

---

## 3. 各模块职责

### 3.1 `main.py` — 应用入口

- 创建 FastAPI 实例
- 挂载 CORS 中间件（允许前端 `localhost:5173` 跨域）
- 挂载三个路由模块，统一前缀 `/api`
- `lifespan` 中加载数据文件到内存、关闭时持久化

### 3.2 `models/` — Pydantic 模型

与 API.md 附录的类型定义一一对应，字段名、类型完全对齐，不做 camelCase/snake_case 转换：

| 文件 | 模型 | 对应 API.md |
|---|---|---|
| `tool.py` | `AtomicTool`, `MetaInfo`, `FlowInfo`, `FlowItem`, `ExecInfo`, `ToolExample` | §1 + 附录 |
| `metric.py` | `Metric`, `WorkflowInput`, `WorkflowOutput`, `WorkflowStep`, `StepInput`, `StepOutput` | §2 + 附录 |
| `compute.py` | `ComputeSession`, `MetricComputeResult`, `StepTrace`, `ExtractedParam`，枚举类型 | §3 + 附录 |

### 3.3 `data/tools.json` — 工具模板数据

- 从前端 `mock/tools.ts` 提取 8 个工具模板，转为 JSON 数组
- 启动时加载到内存，**只读不写**
- 字段结构保留 PascalCase（`MetaInfo`, `FlowInfo`, `ExecInfo`）

### 3.4 `data/metrics.json` — 指标定义数据

- 从前端 `mock/metrics.ts` 提取 7 个指标定义，转为 JSON 数组
- 启动时加载，运行时支持增删改，变更后写回文件
- 使用 `filelock` 保证并发写入安全

### 3.5 `services/tool_store.py` — 工具模板服务

| 方法 | 说明 |
|---|---|
| `load_tools()` | 启动时从 `data/tools.json` 读取，缓存到列表 |
| `get_all_tools()` | 返回全部 8 个工具模板 |

无写入方法。

### 3.6 `services/metric_store.py` — 指标存储服务

| 方法 | 说明 |
|---|---|
| `load_metrics()` | 启动时加载 |
| `list_metrics(keyword, department, page, page_size)` | 分页 + 关键词搜索 + 科室筛选 |
| `get_metric_by_id(id)` | 单条查询，不存在时抛 404 |
| `create_metric(data)` | 生成自增 ID，追加写入 |
| `update_metric(id, data)` | 部分更新 |
| `delete_metric(id)` | 删除 |
| `_save()` | 内部方法，带文件锁写回 `metrics.json` |

### 3.7 `services/session_manager.py` — 计算会话管理

会话存储在内存字典 `dict[str, ComputeSession]`，服务重启即清空。

| 方法 | 说明 |
|---|---|
| `create_session(raw_text, available_metrics)` | 上传后创建会话，返回 sessionId |
| `get_session(id)` | 获取会话状态 |
| `set_selected_metric(id, metric_id)` | 记录选中的指标 |
| `save_results(id, results)` | 存储计算结果 |
| `has_results(id)` | 判断是否有可导出的结果 |

### 3.8 `services/executor.py` — 计算执行引擎

原型阶段**模拟**执行，返回与前端 mock 一致结构的 `MetricComputeResult`：

1. 从 `rawText` 中用正则/关键词匹配抽取 `ExtractedParam`
2. 根据指标的 `steps` 定义，逐步骤构造 `StepTrace`（从 `category` 映射到 `toolId`/`toolName`）
3. 返回 `MetricComputeResult`，包含逐步骤追溯和抽取的参数

原型阶段不做真正的 Python eval，后续可替换为真实执行引擎。

### 3.9 `routers/tools.py` — 工具模板路由

| 方法 | 路径 | 说明 |
|---|---|---|
| `GET` | `/api/tools` | 返回 `AtomicTool[]` |

对应 API.md §1.1。

### 3.10 `routers/metrics.py` — 指标管理路由

| 方法 | 路径 | 说明 |
|---|---|---|
| `GET` | `/api/metrics` | 分页列表 `{ items, total }` |
| `GET` | `/api/metrics/:id` | 单条详情 |
| `POST` | `/api/metrics` | 新建（写入 JSON） |
| `PUT` | `/api/metrics/:id` | 更新（写入 JSON） |
| `DELETE` | `/api/metrics/:id` | 删除 |

对应 API.md §2.1 ~ §2.5。错误码严格按文档返回 400/404。

### 3.11 `routers/compute.py` — 计算执行路由

| 方法 | 路径 | 说明 |
|---|---|---|
| `POST` | `/api/compute/sessions` | 上传 `.txt` 文件，返回 `{ sessionId, rawText, availableMetrics }` |
| `GET` | `/api/compute/sessions/:id` | 获取会话状态 |
| `POST` | `/api/compute/sessions/:id/execute` | 执行计算，返回 `{ results: MetricComputeResult[] }` |
| `GET` | `/api/compute/sessions/:id/export` | 导出 PDF（原型返回空 PDF） |

对应 API.md §3.1 ~ §3.4。

上传验证：文件存在性 → `.txt` 扩展名 → 100KB 大小限制。

---

## 4. 依赖清单

```
fastapi>=0.115
uvicorn[standard]>=0.34
python-multipart>=0.0.18
filelock>=3.16
```

无额外数据库驱动。

---

## 5. 关键设计决策

| 决策 | 原因 |
|---|---|
| JSON 文件存储 + filelock | `metrics.json` 运行时可被修改，filelock 防止并发写入损坏数据 |
| 会话内存存储 | 计算会话是临时状态，不需要持久化，服务重启即清空 |
| 执行引擎原型化 | 先返回结构正确的 mock 结果，保证前后端联调通过，后续迭代替换为真实计算 |
| 端口 8000 | FastAPI 默认端口，前端 vite proxy 指向 `http://localhost:8000` |

---

## 6. 验证方式

```bash
# 1. 启动后端
cd T2R_back && uvicorn main:app --reload --port 8000

# 2. 查看 Swagger 文档
# 浏览器打开 http://localhost:8000/docs，确认全部接口可调

# 3. 前端联调
# 前端移除 mock adapter 引用，配置 vite proxy → localhost:8000，跑通完整流程
```
