# 部署指南

本项目支持开发环境前后端分离和生产环境一体化部署。

## 开发环境

### 方式一：使用开发脚本（推荐）
```bash
./scripts/dev.sh
```
这会同时启动前端开发服务器(8080端口)和后端API服务器(8000端口)。

### 方式二：手动启动
1. 启动后端：
```bash
cd server
python run.py
```

2. 新开终端，启动前端：
```bash
npm run dev
```

### 开发环境特点
- 前端运行在 http://localhost:8080
- 后端API运行在 http://localhost:8000
- 前端自动代理 `/api` 请求到后端
- 支持热重载

## 生产环境部署

### 一键构建部署
```bash
./scripts/build-and-deploy.sh
```

### 手动部署步骤

1. **构建前端到后端静态目录**
```bash
npm run build:server
```
这会将前端构建到 `server/static` 目录。

2. **启动后端服务**
```bash
cd server
python run.py
```

### 生产环境特点
- 前后端通过同一个服务提供（默认8000端口）
- 访问 http://localhost:8000 即可使用完整应用
- API路径: http://localhost:8000/api/*
- API文档: http://localhost:8000/api/docs

## 环境变量配置

### 开发环境 (.env.development)
```env
VITE_API_URL=http://localhost:8000/api
VITE_USE_REAL_API=true
```

### 生产环境 (.env.production)
```env
VITE_API_URL=/api
VITE_USE_REAL_API=true
```

## 构建命令说明

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动前端开发服务器 |
| `npm run build` | 构建前端到 dist 目录 |
| `npm run build:server` | 构建前端到 server/static 目录（生产部署） |
| `npm run preview` | 预览 dist 目录的构建结果 |
| `npm run preview:server` | 预览 server/static 的构建结果 |

## 技术实现细节

### Vite 配置
- 开发环境自动配置代理，将 `/api` 请求转发到后端
- 生产构建可通过命令行参数指定输出目录

### FastAPI 静态文件服务
- 自动检测 `server/static` 目录
- 如果存在静态文件，自动服务前端应用
- 支持前端路由（所有非API路径返回 index.html）
- 如果不存在静态文件，仅提供API服务

### 部署架构
```
生产环境:
  http://localhost:8000
    ├── /             (前端应用)
    ├── /assets/*     (前端静态资源)
    ├── /api/*        (后端API)
    ├── /api/docs     (API文档)
    └── /health       (健康检查)

开发环境:
  http://localhost:8080 (前端)
    └── /api/* → proxy → http://localhost:8000/api/*
  
  http://localhost:8000 (后端)
    ├── /api/*
    ├── /api/docs
    └── /health
```

## 常见问题

### Q: 如何切换开发和生产模式？
A: 开发时使用 `npm run dev`，部署时使用 `npm run build:server`。

### Q: 前端路由404问题？
A: 后端已配置SPA支持，所有非API路径都会返回 index.html。

### Q: 如何更新部署？
A: 重新运行 `npm run build:server`，然后重启后端服务。

### Q: 能否使用 Nginx？
A: 可以，但不是必需的。FastAPI 已经能够很好地服务静态文件。