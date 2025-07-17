# Annotation Backend Service

基于FastAPI的人机协作标注系统后端服务。

## 功能特性

- 文件上传验证（支持Excel/CSV）
- 标注数据提交和存储
- 统计分析查询
- 数据导出功能
- 进度跟踪

## 快速开始

### 1. 安装依赖

```bash
cd server
pip install -r requirements.txt
```

### 2. 配置环境

复制环境变量示例文件：
```bash
cp .env.example .env
```

根据需要修改配置。

### 3. 启动服务

```bash
python run.py
```

服务将在 http://localhost:8000 启动。

### 4. 查看API文档

访问 http://localhost:8000/api/docs 查看交互式API文档。

## API端点

- `POST /api/upload` - 上传并验证文件
- `POST /api/projects/{project_id}/annotations` - 提交标注
- `GET /api/analytics/stats` - 获取统计信息
- `GET /api/export` - 导出数据
- `GET /api/progress` - 获取进度

## 目录结构

```
server/
├── app/
│   ├── api/          # API路由
│   ├── core/         # 核心功能（数据库、日志）
│   ├── models/       # 数据模型
│   ├── services/     # 业务逻辑
│   └── utils/        # 工具函数
├── config/           # 配置文件
├── data/            # 数据库文件
├── logs/            # 日志文件
└── requirements.txt  # 依赖列表
```

## 数据库

使用SQLite作为数据库，数据文件默认存储在 `./data/annotations.db`。

数据库会在首次启动时自动创建。

## 日志

日志文件存储在 `./logs` 目录下：
- `annotation_service.log` - 所有日志
- `errors.log` - 错误日志

日志文件会自动轮转和压缩。

## 开发

### 运行测试

```bash
pytest tests/
```

### 代码格式化

```bash
black .
isort .
```

## 部署

推荐使用Docker部署：

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["python", "run.py"]
```

## 许可证

MIT License