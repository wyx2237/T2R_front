# T2R Front — 医疗定量计算平台

基于 Vue 3 + TypeScript + Vite + Element Plus 的临床定量计算平台前端。

## 环境要求

- Node.js >= 18
- npm >= 9

## 项目启动

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev
```

开发服务器默认运行在 `http://localhost:5173/`，浏览器访问该地址即可。

## 自定义端口

可以通过以下两种方式修改端口。

### 命令行参数（临时）

```bash
npm run dev -- --port 3000
```

### 配置文件（永久）

在 `vite.config.ts` 中添加 `server.port`：

```ts
export default defineConfig({
  server: {
    port: 3000,
  },
  // ...
})
```

## 项目构建

```bash
npm run build     # 类型检查 + 生产构建
npm run preview   # 预览生产构建
```

## 技术栈

| 层 | 选型 |
|---|---|
| 框架 | Vue 3 (Composition API + `<script setup lang="ts">`) |
| 语言 | TypeScript |
| 构建 | Vite |
| UI 组件库 | Element Plus |
| 状态管理 | Pinia |
| 路由 | Vue Router |
| HTTP | Axios + axios-mock-adapter |
| 代码高亮 | highlight.js |
| 公式渲染 | KaTeX |

## 模块路由

| 路由 | 说明 |
|---|---|
| `/metrics` | 指标列表（搜索/筛选/分页） |
| `/metrics/:id` | 指标详情（计算流水线 + 参数表 + 胶水代码） |
| `/compute/upload` | 计算执行 — 上传病例 |
| `/compute/:sessionId/select` | 计算执行 — 选择指标 |
| `/compute/:sessionId/execute` | 计算执行 — 查看结果 |
| `/tools` | 原子工具模板库 |

## Mock 数据

开发环境下通过 `axios-mock-adapter` 自动拦截 API 请求，无需后端服务。Mock 数据位于 `src/mock/` 目录。
