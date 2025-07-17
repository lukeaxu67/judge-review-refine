
import { 
  User, 
  Project, 
  AnnotationItem, 
  UploadResponse, 
  AnnotationStats,
  ApiResponse,
  LoginRequest,
  CreateProjectRequest,
  AnnotationSubmitRequest,
  ImportDataRequest
} from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class ApiService {
  // 认证相关
  async login(credentials: LoginRequest): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    return response.json();
  }

  async logout(): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
    });
    return response.json();
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_BASE_URL}/auth/me`);
    return response.json();
  }

  // 文件验证（不保存文件）
  async uploadFile(file: File): Promise<ApiResponse<UploadResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'X-Browser-Fingerprint': localStorage.getItem('browser_fingerprint') || 'unknown'
      }
    });
    return response.json();
  }

  // 数据导入接口
  async importAnnotationData(importRequest: ImportDataRequest): Promise<ApiResponse<{ imported: number }>> {
    const response = await fetch(`${API_BASE_URL}/data/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(importRequest),
    });
    return response.json();
  }

  // 项目管理
  async createProject(projectData: CreateProjectRequest): Promise<ApiResponse<Project>> {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData),
    });
    return response.json();
  }

  async getProjects(): Promise<ApiResponse<Project[]>> {
    const response = await fetch(`${API_BASE_URL}/projects`);
    return response.json();
  }

  async getProject(projectId: string): Promise<ApiResponse<Project>> {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`);
    return response.json();
  }

  // 标注相关
  async getAnnotationItems(
    projectId: string, 
    page: number = 1, 
    limit: number = 10
  ): Promise<ApiResponse<{ items: AnnotationItem[]; total: number }>> {
    const response = await fetch(
      `${API_BASE_URL}/projects/${projectId}/annotations?page=${page}&limit=${limit}`
    );
    return response.json();
  }

  async getAnnotationItem(projectId: string, itemId: string): Promise<ApiResponse<AnnotationItem>> {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/annotations/${itemId}`);
    return response.json();
  }

  async submitAnnotation(
    projectId: string, 
    submission: AnnotationSubmitRequest
  ): Promise<ApiResponse<AnnotationItem>> {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/annotations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Browser-Fingerprint': localStorage.getItem('browser_fingerprint') || 'unknown'
      },
      body: JSON.stringify(submission),
    });
    return response.json();
  }

  // 统计数据
  async getAnnotationStats(projectId: string): Promise<ApiResponse<AnnotationStats>> {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/stats`);
    return response.json();
  }

  // 获取文件的所有维度信息
  async getFileDimensions(fileHash: string): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/analytics/dimensions?file_hash=${fileHash}`);
    return response.json();
  }

  // 获取分析统计数据
  async getAnalyticsStats(fileHash: string, dimension?: string): Promise<AnnotationStats> {
    const url = `${API_BASE_URL}/analytics/stats?file_hash=${fileHash}${dimension ? `&dimension=${dimension}` : ''}`;
    const response = await fetch(url);
    return response.json();
  }

  // 数据导出
  async exportAnnotations(projectId: string, format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/export?format=${format}`);
    return response.blob();
  }
}

export const apiService = new ApiService();
