
// API接口类型定义
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'annotator';
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  annotationType: 'single-turn' | 'multi-turn' | 'multi-dimension-single' | 'multi-dimension-multi';
  evaluationType: 'rule-based' | 'comparison';
  status: 'active' | 'completed' | 'paused';
  createdBy: string;
  createdAt: string;
  totalItems: number;
  completedItems: number;
}

export interface AnnotationItem {
  id: string;
  projectId: string;
  originalData: Record<string, any>;
  llmJudgement: string;
  llmReasoning: string;
  humanJudgement?: string;
  humanReasoning?: string;
  status: 'pending' | 'agreed' | 'disagreed' | 'skipped';
  annotatedBy?: string;
  annotatedAt?: string;
}

// 新增：维度相关类型
export interface Dimension {
  name: string;
  judgementColumn: string;
  reasoningColumn?: string;
}

export interface MultiDimensionAnnotation {
  dimension: string;
  action: 'agree' | 'disagree' | 'skip';
  humanJudgement?: string;
  humanReasoning?: string;
}

// 新增：原始数据导入接口
export interface ImportDataRequest {
  filename: string;
  dimension: string;
  data: AnnotationDataRow[];
}

export interface AnnotationDataRow {
  case_id: number;
  target1?: any;
  target2?: any;
  llm_judgement?: string;
  llm_reasoning?: string;
  [key: string]: any; // 支持 other01-10 等扩展字段
}

export interface UploadResponse {
  fileId: string;
  filename: string;
  totalRows: number;
  columns: string[];
  previewData: Record<string, any>[];
  isValid: boolean;
  errors?: string[];
}

export interface AnnotationStats {
  total: number;
  completed: number;
  agreed: number;
  disagreed: number;
  skipped: number;
  agreementRate: number;
}

// API请求/响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
  annotationType: 'single-turn' | 'multi-turn' | 'multi-dimension-single' | 'multi-dimension-multi';
  evaluationType: 'rule-based' | 'comparison';
  columnConfig: Record<string, string>;
  fileId: string;
}

export interface AnnotationSubmitRequest {
  itemId: string;
  action: 'agree' | 'disagree' | 'skip';
  humanJudgement?: string;
  humanReasoning?: string;
  dimension?: string; // 新增：维度标识
}
