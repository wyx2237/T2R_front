# API 接口文档

> Base URL: `/api`

---

## 目录

- [1. 原子工具模板库](#1-原子工具模板库)
- [2. 指标管理](#2-指标管理)
- [3. 计算执行](#3-计算执行)
- [附录: 公共类型定义](#附录-公共类型定义)
- [附录: 错误码](#附录-错误码)

---

## 1. 原子工具模板库

### 1.1 获取全部工具模板

获取内置的 8 个原子工具模板，只读，固定数量。

| 项目 | 内容 |
|---|---|
| **方法** | `GET` |
| **路径** | `/api/tools` |
| **参数** | 无 |

**返回数据定义:**

```typescript
// 响应体: AtomicTool[]
```

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | `string` | 唯一标识，如 `"tool_001"` |
| `MetaInfo.Name` | `string` | 工具分类名（英文），如 `"FormulaCalculation"` |
| `MetaInfo.Description` | `string` | 分类描述 |
| `MetaInfo.Scope` | `string` | 适用与不适用场景说明 |
| `FlowInfo.Input.Description` | `string` | 输入参数说明 |
| `FlowInfo.Input.Example` | `object` | 输入示例 |
| `FlowInfo.Output.Description` | `string` | 输出说明 |
| `FlowInfo.Output.Example` | `object` | 输出示例 |
| `ExecInfo.Language` | `string` | 执行语言，如 `"python"` |
| `ExecInfo.Library` | `string[]` | 依赖库列表 |
| `ExecInfo.Logic` | `string[]` | 执行逻辑步骤（有序） |
| `Examples[]` | `ToolExample[]` | 使用示例列表 |

**ToolExample 字段:**

| 字段 | 类型 | 说明 |
|---|---|---|
| `ToolName` | `string` | 示例名称 |
| `Parameters` | `object` | 示例输入参数 |
| `Code` | `string` | 示例代码 |
| `Output` | `object` | 示例输出 |

**返回示例:**

```json
[
  {
    "id": "tool_001",
    "MetaInfo": {
      "Name": "FormulaCalculation",
      "Description": "Formula calculation category, primarily performing calculations for specific mathematical formulas...",
      "Scope": "Applicable to scenarios requiring clear mathematical formulas..."
    },
    "FlowInfo": {
      "Input": {
        "Description": "Input includes all variables required for the formula...",
        "Example": { "radius": 5, "formula": "math.pi * radius ** 2" }
      },
      "Output": {
        "Description": "Output is a single numeric value representing the formula result...",
        "Example": { "result": 78.54 }
      }
    },
    "ExecInfo": {
      "Language": "python",
      "Library": ["math"],
      "Logic": [
        "Import necessary libraries (e.g., math)",
        "Receive input parameters",
        "Replace variable names in the formula string with actual numeric values",
        "Evaluate the formula using eval within a restricted namespace",
        "Round the result to 4 decimal places and return it"
      ]
    },
    "Examples": [
      {
        "ToolName": "Circle Area Calculator",
        "Parameters": { "radius": 5, "formula": "math.pi * radius ** 2" },
        "Code": "area = math.pi * radius ** 2",
        "Output": { "area": 78.5398 }
      }
    ]
  }
]
```

**错误情况:** 无（固定数据，始终返回 200）

---

## 2. 指标管理

### 2.1 获取指标列表

分页查询指标，支持关键词搜索和科室筛选。

| 项目 | 内容 |
|---|---|
| **方法** | `GET` |
| **路径** | `/api/metrics` |

**请求参数 (Query String):**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|---|---|---|---|---|
| `keyword` | `string` | 否 | — | 按 name（模糊）和 code（精确）搜索 |
| `department` | `string` | 否 | — | 按科室精确筛选 |
| `page` | `number` | 否 | `1` | 页码，从 1 开始 |
| `pageSize` | `number` | 否 | `20` | 每页条数 |

**返回数据定义:**

```typescript
{
  items: Metric[]
  total: number
}
```

**Metric 字段说明见 [附录: Metric 类型](#metric-类型)。**

**返回示例:**

```json
{
  "items": [
    {
      "id": "metric_001",
      "code": "REN-001",
      "department": "Nephrology",
      "reference": "CKD-EPI 2021 (KDIGO)",
      "name": "eGFR (CKD-EPI)",
      "description": "Estimate glomerular filtration rate based on serum creatinine, age, and sex",
      "inputs": [
        { "input_name": "serumCreatinine", "input_type": "float", "input_desc": "Serum creatinine level" },
        { "input_name": "age", "input_type": "int", "input_desc": "Patient age" },
        { "input_name": "sex", "input_type": "enum", "input_desc": "Patient biological sex" }
      ],
      "output": {
        "output_name": "eGFR",
        "output_type": "float",
        "output_desc": "Estimated glomerular filtration rate in mL/min/1.73m²"
      },
      "steps": [
        {
          "step_id": "1",
          "step_name": "Unit Conversion",
          "step_description": "Convert serum creatinine units if needed",
          "category": "Data Preprocessing",
          "reason": "Ensure consistent units before formula application",
          "detail": "If in μmol/L, divide by 88.4 to convert to mg/dL",
          "step_inputs": [
            { "input_name": "scr", "input_type": "float", "input_desc": "Serum creatinine value",
              "input_source": "$|inputs|.serumCreatinine" }
          ],
          "step_outputs": [
            { "output_name": "scr_mg", "output_type": "float", "output_desc": "Serum creatinine in mg/dL" }
          ]
        },
        {
          "step_id": "2",
          "step_name": "CKD-EPI Formula",
          "step_description": "Apply the CKD-EPI 2021 equation",
          "category": "Core Calculation",
          "reason": "CKD-EPI is the recommended formula for eGFR estimation",
          "detail": "eGFR = 142 × min(Scr/κ, 1)^α × ...",
          "step_inputs": [
            { "input_name": "Scr", "input_type": "float", "input_desc": "Serum creatinine in mg/dL",
              "input_source": "$|steps|.1.scr_mg" },
            { "input_name": "Age", "input_type": "int", "input_desc": "Patient age",
              "input_source": "$|inputs|.age" },
            { "input_name": "Sex", "input_type": "enum", "input_desc": "Patient sex",
              "input_source": "$|inputs|.sex" }
          ],
          "step_outputs": [
            { "output_name": "eGFR", "output_type": "float", "output_desc": "Computed eGFR value" }
          ]
        }
      ],
      "executableCode": "def compute(inputs):\n    scr = float(inputs[\"serumCreatinine\"])\n    ...\n    return {\"eGFR\": round(egfr, 1)}"
    }
  ],
  "total": 5
}
```

**请求示例:**

```
GET /api/metrics?keyword=eGFR&department=Nephrology&page=1&pageSize=10
```

**错误情况:**

| 场景 | HTTP 状态码 | 响应体 |
|---|---|---|
| 正常（含空结果） | `200` | `{ items: [], total: 0 }` |

---

### 2.2 获取指标详情

| 项目 | 内容 |
|---|---|
| **方法** | `GET` |
| **路径** | `/api/metrics/:id` |

**路径参数:**

| 参数 | 类型 | 说明 |
|---|---|---|
| `id` | `string` | 指标唯一标识，如 `"metric_001"` |

**返回数据定义:** 单个 `Metric` 对象（类型定义见 [附录](#metric-类型)）。

**返回示例:**

```json
{
  "id": "metric_001",
  "code": "REN-001",
  "department": "Nephrology",
  "reference": "CKD-EPI 2021 (KDIGO)",
  "name": "eGFR (CKD-EPI)",
  "description": "Estimate glomerular filtration rate based on serum creatinine, age, and sex",
  "inputs": [
    { "input_name": "serumCreatinine", "input_type": "float", "input_desc": "Serum creatinine level" },
    { "input_name": "age", "input_type": "int", "input_desc": "Patient age" },
    { "input_name": "sex", "input_type": "enum", "input_desc": "Patient biological sex" }
  ],
  "output": {
    "output_name": "eGFR",
    "output_type": "float",
    "output_desc": "Estimated glomerular filtration rate in mL/min/1.73m²"
  },
  "steps": [
    {
      "step_id": "1",
      "step_name": "Unit Conversion",
      "step_description": "Convert serum creatinine units if needed",
      "category": "Data Preprocessing",
      "reason": "Ensure consistent units",
      "detail": "If in μmol/L, divide by 88.4 to convert to mg/dL",
      "step_inputs": [
        { "input_name": "scr", "input_type": "float", "input_desc": "Serum creatinine value",
          "input_source": "$|inputs|.serumCreatinine" }
      ],
      "step_outputs": [
        { "output_name": "scr_mg", "output_type": "float", "output_desc": "Serum creatinine in mg/dL" }
      ]
    }
  ],
  "executableCode": "def compute(inputs): ..."
}
```

**错误情况:**

| 场景 | HTTP 状态码 | 响应体 |
|---|---|---|
| 指标不存在 | `404` | `{ "message": "Metric not found" }` |

---

### 2.3 新建指标 (占位)

| 项目 | 内容 |
|---|---|
| **方法** | `POST` |
| **路径** | `/api/metrics` |

**请求体:** `Partial<Metric>`（除 `id` 外均可提交）

**返回数据:**

```json
{ "success": true }
```

**错误情况:** 当前为占位接口，始终返回 200。

---

### 2.4 更新指标 (占位)

| 项目 | 内容 |
|---|---|
| **方法** | `PUT` |
| **路径** | `/api/metrics/:id` |

**路径参数:** `id` — 指标 ID

**请求体:** `Partial<Metric>`

**返回数据:**

```json
{ "success": true }
```

**错误情况:** 当前为占位接口，始终返回 200。

---

### 2.5 删除指标

| 项目 | 内容 |
|---|---|
| **方法** | `DELETE` |
| **路径** | `/api/metrics/:id` |

**路径参数:** `id` — 指标 ID

**返回数据:**

```json
{ "success": true }
```

**错误情况:** 当前 mock 实现始终返回 200。

---

## 3. 计算执行

### 3.1 上传病例文件

上传 `.txt` 病例文件，服务端保存原始文本并返回可计算指标列表。此阶段不做参数抽取。

| 项目 | 内容 |
|---|---|
| **方法** | `POST` |
| **路径** | `/api/compute/sessions` |
| **Content-Type** | `multipart/form-data` |

**请求参数 (FormData):**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `file` | `File` | 是 | `.txt` 纯文本病例文件，最大 100KB |

**返回数据定义:**

```typescript
{
  sessionId: string
  rawText: string
  availableMetrics: Metric[]
}
```

| 字段 | 类型 | 说明 |
|---|---|---|
| `sessionId` | `string` | 计算会话标识，后续步骤使用 |
| `rawText` | `string` | 原始病例文本 |
| `availableMetrics` | `Metric[]` | 当前病例可计算的全量指标列表 |

**返回示例:**

```json
{
  "sessionId": "session_demo_001",
  "rawText": "Patient is a 58-year-old male admitted for routine checkup...",
  "availableMetrics": [
    { "id": "metric_001", "code": "REN-001", "name": "eGFR (CKD-EPI)", "..." : "..." }
  ]
}
```

**错误情况:**

| 场景 | HTTP 状态码 | 响应体示例 |
|---|---|---|
| 未上传文件 | `400` | `{ "message": "File is required" }` |
| 文件格式非 .txt | `400` | `{ "message": "Only .txt files are supported" }` |
| 文件大小超限 | `400` | `{ "message": "File size must not exceed 100KB" }` |
| 文件解析失败 | `500` | `{ "message": "Failed to parse case file" }` |

---

### 3.2 获取 Session 状态

| 项目 | 内容 |
|---|---|
| **方法** | `GET` |
| **路径** | `/api/compute/sessions/:id` |

**路径参数:** `id` — sessionId

**返回数据定义:** `ComputeSession` 对象。

| 字段 | 类型 | 说明 |
|---|---|---|
| `sessionId` | `string` | |
| `rawText` | `string` | |
| `selectedMetricId` | `string | null` | 已选中的指标 ID（单选） |
| `results` | `MetricComputeResult[]` | 计算结果（仅 currentStep=result 时有值） |
| `currentStep` | `"upload" \| "select" \| "result"` | |
| `createdAt` | `string` | ISO 8601 |

**错误情况:**

| 场景 | HTTP 状态码 | 响应体 |
|---|---|---|
| Session 不存在 | `404` | `{ "message": "Session not found" }` |

---

### 3.3 执行计算

提交选中的指标 ID 和原始文本，服务端根据指标定义从原始文本中抽取参数，执行定量计算并返回逐步骤结果。

| 项目 | 内容 |
|---|---|
| **方法** | `POST` |
| **路径** | `/api/compute/sessions/:id/execute` |
| **Content-Type** | `application/json` |

**路径参数:** `id` — sessionId

**请求体:**

```typescript
{
  metricId: string
  rawText: string
}
```

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `metricId` | `string` | 是 | 要计算的指标 ID |
| `rawText` | `string` | 是 | 病人信息的原始文本，用于抽取参数 |

**返回数据定义:**

```typescript
{
  results: MetricComputeResult[]
}
```

**MetricComputeResult 字段说明:**

| 字段 | 类型 | 说明 |
|---|---|---|
| `metricId` | `string` | 指标 ID |
| `metricName` | `string` | 指标名称 |
| `metricCode` | `string` | 指标编码 |
| `finalValue` | `number` | 最终计算结果值 |
| `finalUnit` | `string` | 结果单位 |
| `status` | `"normal" \| "borderline" \| "abnormal"` (可选) | 临床状态判定 |
| `statusLabel` | `string` (可选) | 状态描述，无判定时省略 |
| `referenceRange` | `{ min: number; max: number }` (可选) | 参考范围，无参考值时省略 |
| `steps` | `StepTrace[]` | 逐步骤计算追溯 |
| `extractedParams` | `ExtractedParam[]` | 根据本指标定义从原始文本中抽取的参数列表 |

**StepTrace 字段说明:**

| 字段 | 类型 | 说明 |
|---|---|---|
| `order` | `number` | 步骤序号 |
| `toolId` | `string` | 使用的原子工具 ID |
| `toolName` | `string` | 工具名称 |
| `description` | `string` | 本步骤说明 |
| `formulaLatex?` | `string` | 本步骤公式（LaTeX 格式，可选） |
| `input` | `Record<string, unknown>` | 本步骤输入参数键值对 |
| `inputSource` | `Record<string, { sourceType, sourceLabel }>` | 每个输入参数的来源追溯 |
| `inputSource[].sourceType` | `"raw" \| "step"` | `raw`=来自原文，`step`=来自前置步骤 |
| `inputSource[].sourceLabel` | `string` | 来源标签，如 `"Raw Text"` 或 `"Step 2 — FormulaCalculation"` |
| `output` | `Record<string, unknown>` | 本步骤输出键值对 |
| `errorMessage?` | `string` | 仅 status=error 时有值 |

**返回示例:**

```json
{
  "results": [
    {
      "metricId": "metric_001",
      "metricName": "eGFR (CKD-EPI)",
      "metricCode": "REN-001",
      "finalValue": 72.4,
      "finalUnit": "mL/min/1.73m²",
      "status": "borderline",
      "statusLabel": "CKD Stage 2: Mildly decreased kidney function",
      "referenceRange": { "min": 90, "max": 120 },
      "extractedParams": [
        {
          "name": "Age",
          "rawValue": "58",
          "normalizedValue": 58,
          "unit": "years",
          "confidence": 5,
          "position": { "start": 13, "end": 15 }
        },
        {
          "name": "SerumCreatinine",
          "rawValue": "1.2",
          "normalizedValue": 1.2,
          "unit": "mg/dL",
          "confidence": 5,
          "position": { "start": 192, "end": 195 }
        }
      ],
      "steps": [
        {
          "order": 1,
          "toolId": "tool_004",
          "toolName": "UnitConversion",
          "description": "Convert serum creatinine units if needed",
          "input": { "value": 1.2, "fromUnit": "mg/dL", "toUnit": "mg/dL" },
          "inputSource": {
            "value": { "sourceType": "raw", "sourceLabel": "Raw Text" }
          },
          "output": { "convertedValue": 1.2, "unit": "mg/dL" },
          "status": "success"
        },
        {
          "order": 2,
          "toolId": "tool_001",
          "toolName": "FormulaCalculation",
          "description": "Compute eGFR with CKD-EPI formula",
          "formulaLatex": "eGFR = 142 \\times \\min(Scr/\\kappa, 1)^\\alpha \\times \\max(Scr/\\kappa, 1)^{-1.200} \\times 0.9938^{Age} \\times 1.012",
          "input": { "Scr": 1.2, "Age": 58, "Sex": "M" },
          "inputSource": {
            "Scr": { "sourceType": "raw", "sourceLabel": "Raw Text" },
            "Age": { "sourceType": "raw", "sourceLabel": "Raw Text" },
            "Sex": { "sourceType": "step", "sourceLabel": "Step 1 — UnitConversion" }
          },
          "output": { "eGFR": 72.4 },
          "status": "success"
        },
        {
          "order": 3,
          "toolId": "tool_002",
          "toolName": "ConditionEvaluation",
          "description": "Classify CKD stage based on eGFR value",
          "input": { "eGFR": 72.4 },
          "inputSource": {
            "eGFR": { "sourceType": "step", "sourceLabel": "Step 2 — FormulaCalculation" }
          },
          "output": { "stage": "Stage 2", "description": "Mildly decreased kidney function" },
          "status": "success"
        }
      ]
    }
  ]
}
```

**请求示例:**

```
POST /api/compute/sessions/session_demo_001/execute
Content-Type: application/json

{
  "metricId": "metric_001",
  "rawText": "Patient is a 58-year-old male admitted for routine checkup..."
}
```

**错误情况:**

| 场景 | HTTP 状态码 | 响应体示例 |
|---|---|---|
| metricId 为空 | `400` | `{ "message": "metricId is required" }` |
| Session 不存在 | `404` | `{ "message": "Session not found" }` |
| 某步骤计算失败 | `200` | 对应 StepTrace.status=`"error"`，errorMessage 含错误原因，不影响其他步骤 |

---

### 3.4 导出报告

| 项目 | 内容 |
|---|---|
| **方法** | `GET` |
| **路径** | `/api/compute/sessions/:id/export` |

**路径参数:** `id` — sessionId

**Query 参数:**

| 参数 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `format` | `string` | — | 目前仅支持 `"pdf"` |

**返回数据定义:** `Blob`（PDF 文件二进制流）

**响应头:**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="report.pdf"
```

**请求示例:**
```
GET /api/compute/sessions/session_demo_001/export?format=pdf
```

**错误情况:**

| 场景 | HTTP 状态码 | 响应体 |
|---|---|---|
| Session 不存在 | `404` | `{ "message": "Session not found" }` |
| Session 未完成计算 | `400` | `{ "message": "No results to export" }` |

---

## 附录: 公共类型定义

### Metric 类型

```typescript
interface Metric {
  id: string                     // 唯一标识
  code: string                   // 业务编码，如 "REN-001"
  department: string             // 所属科室
  reference: string              // 参考文献/指南
  name: string                   // 指标名称
  description: string            // 功能描述
  inputs: WorkflowInput[]        // 工作流输入参数
  output: WorkflowOutput         // 工作流输出定义
  steps: WorkflowStep[]          // 工作流步骤序列
  executableCode: string         // 可执行 Python 代码
}

interface WorkflowInput {
  input_name: string
  input_desc: string
  input_type: string
}

interface WorkflowOutput {
  output_name: string
  output_desc: string
  output_type: string
}

interface WorkflowStep {
  step_id: string
  step_name: string
  step_description: string
  step_inputs: StepInput[]
  step_outputs: StepOutput[]
  category: string               // 步骤分类标签
  reason: string                 // 为何需要此步骤
  detail: string                 // 步骤详细说明
}

interface StepInput {
  input_name: string
  input_desc: string
  input_type: string
  input_source: string           // "$|inputs|.xxx" 或 "$|steps|.N.output_name"
}

interface StepOutput {
  output_name: string
  output_desc: string
  output_type: string
}
```

### ExtractedParam 类型

```typescript
interface ExtractedParam {
  name: string                    // 参数名（与指标定义的 inputs 对应）
  rawValue: string                // 原文中的原始文本
  normalizedValue: string | number // 归一化后的值（用于计算）
  unit: string                    // 单位，无单位时为 "-"
  confidence: number              // 置信度等级 0~5 整数，5=最可信
  position: {
    start: number                 // 原文中起始字符位置（0-indexed）
    end: number                   // 原文中结束字符位置（不包含）
  }
}
```

### 状态枚举

| 枚举 | 可选值 | 说明 |
|---|---|---|
| `ComputeStepStatus` | `"success"` / `"error"` | 步骤执行状态 |
| `ResultStatus` | `"normal"` / `"borderline"` / `"abnormal"` | 计算结果临床状态 |
| `SourceType` | `"raw"` / `"step"` | 参数来源类型 |
| `SessionStep` | `"upload"` / `"select"` / `"result"` | 计算会话阶段 |

---

## 附录: 错误码

所有错误响应遵循统一格式:

```json
{
  "message": "错误描述信息"
}
```

| HTTP 状态码 | 含义 | 常见场景 |
|---|---|---|
| `200` | 成功 | 正常返回 |
| `400` | 请求参数错误 | 文件格式不符、必填参数缺失 |
| `404` | 资源不存在 | 指标 ID 无效、Session 不存在 |
| `500` | 服务端错误 | 文件解析失败 |
