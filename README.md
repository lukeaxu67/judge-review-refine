# LLM 评测结果复审系统

一个轻量级的 LLM 评测结果人工复审系统，支持专家对机器评测结果进行审核、修正和统计分析。

体验页面：[https://judge-review-refine.onrender.com/](https://judge-review-refine.onrender.com/)
示例数据：dataset/评测数据.xlsx

## 🌟 特性

- **多维度评测支持**：支持单轮对话和多轮对话的多维度评测审核
- **高效的标注界面**：提供键盘快捷键操作，支持快速审核大量数据
- **实时统计分析**：实时查看标注进度、一致性分析等统计数据
- **数据导出功能**：支持将标注结果导出为 CSV 格式
- **隐私保护设计**：后端不保存原始文件，仅收集标注后的结构化数据
- **用户管理**：基于浏览器指纹和账号名称的轻量级用户识别系统

## 🚀 快速开始

### 环境要求

- Node.js >= 16
- Python >= 3.8
- SQLite3

### 安装步骤

1. 克隆项目
```bash
git clone https://github.com/lukeaxu67/judge-review-refine.git
cd judge-review-refine
```

2. 安装前端依赖
```bash
npm install
```

3. 安装后端依赖
```bash
cd server
pip install -r requirements.txt
cd ..
```

### 启动系统

1. 启动后端服务
```bash
cd server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

2. 在新的终端窗口中启动前端服务
```bash
npm run dev
```

## 📁 项目结构

```
├── src/                    # 前端源代码
│   ├── components/         # React 组件
│   ├── pages/             # 页面组件
│   ├── hooks/             # 自定义 Hooks
│   └── services/          # API 服务
├── server/                # 后端源代码
│   ├── app/              # FastAPI 应用
│   │   ├── api/          # API 路由
│   │   ├── core/         # 核心功能
│   │   └── models/       # 数据模型
│   └── data/             # SQLite 数据库存储
├── public/               # 静态资源
└── README.md            # 项目说明
```

## 💡 使用说明

### 1. 首次使用
系统会要求您设置账号名称，用于标识您的标注工作。账号名称为必填项，将用于数据统计和分析。

### 2. 上传数据
- 支持 Excel 格式文件
- 文件应包含待审核的对话数据和 LLM 评测结果

### 3. 配置评测维度
- 设置需要审核的评测维度
- 指定 LLM 判断结果和推理的列名

### 4. 开始标注
- 使用键盘快捷键进行快速操作：
  - `A` - 同意 LLM 的判断
  - `D` - 反对（需填写修正意见）
  - `R` - 跳过当前项
  - `W/S` - 上一条/下一条数据
  - `Q/E` - 切换评测维度（多维度模式）

### 5. 查看统计
实时查看标注进度、各维度的一致性分析、标注员工作量统计等。

### 6. 导出数据
完成标注后，可将结果导出为 CSV 格式进行后续分析。

## 🔒 数据安全

- **原始文件不保存**：系统不会在服务器端保存上传的原始文件
- **结构化存储**：仅保存标注后的结构化数据
- **本地 SQLite**：默认使用本地 SQLite 数据库，数据存储在 `server/data/` 目录
- **用户隐私**：使用浏览器指纹 + 账号名称识别用户，不收集其他个人信息

## 🛠️ 技术栈

### 前端
- React + TypeScript
- Vite 构建工具
- Tailwind CSS + shadcn/ui
- React Query 数据管理
- React Router 路由管理

### 后端
- FastAPI (Python)
- SQLite 数据库
- Pydantic 数据验证

## 📊 API 文档

启动后端服务后，访问 `http://localhost:8000/docs` 查看完整的 API 文档。

主要接口：
- `/api/upload` - 文件上传
- `/api/projects/{project_id}/annotations` - 提交标注
- `/api/analytics/stats` - 获取统计数据
- `/api/export` - 导出标注结果

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📄 开源协议

本项目采用 MIT 协议开源，详见 [LICENSE](LICENSE) 文件。

---

如有问题或建议，请提交 [Issue](https://github.com/yourusername/llm-review-system/issues) 或联系维护者。