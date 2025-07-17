
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

// Mock data
const mockUser: User = {
  id: 'mock-user-1',
  username: 'mock-annotator',
  email: 'annotator@example.com',
  role: 'annotator',
  createdAt: new Date().toISOString()
};

const mockProjects: Project[] = [
  {
    id: 'project-1',
    name: '对话质量评估',
    description: '评估AI助手的对话质量和准确性',
    annotationType: 'single-turn',
    evaluationType: 'rule-based',
    status: 'active',
    createdBy: 'mock-user-1',
    createdAt: '2024-01-01T00:00:00Z',
    totalItems: 100,
    completedItems: 25
  }
];

let mockAnnotationItems: AnnotationItem[] = [
  {
    id: 'item-1',
    projectId: 'project-1',
    originalData: {
      question: '什么是人工智能？',
      answer: '人工智能是模拟人类智能的计算机系统。',
      system: '你是一个专业的AI助手。',
      llm_judgement: '优秀',
      llm_reasoning: '回答准确、简洁、专业。'
    },
    llmJudgement: '优秀',
    llmReasoning: '回答准确、简洁、专业。',
    status: 'pending',
    annotatedBy: undefined,
    annotatedAt: undefined
  }
];

// 存储标注完成的数据
let annotatedDataRows: any[] = [];

class MockApiService {
  // 认证相关
  async login(credentials: LoginRequest): Promise<ApiResponse<User>> {
    console.log('Mock API - login 收到的内容:', credentials);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const response = {
      success: true,
      data: mockUser,
      message: '登录成功'
    };
    console.log('Mock API - login 返回的数据:', response);
    return response;
  }

  async logout(): Promise<ApiResponse> {
    console.log('Mock API - logout 被调用');
    const response = {
      success: true,
      message: '退出成功'
    };
    console.log('Mock API - logout 返回的数据:', response);
    return response;
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    console.log('Mock API - getCurrentUser 被调用');
    const response = {
      success: true,
      data: mockUser
    };
    console.log('Mock API - getCurrentUser 返回的数据:', response);
    return response;
  }

  // 文件验证（不保存文件）
  async uploadFile(file: File): Promise<ApiResponse<UploadResponse>> {
    console.log('Mock API - uploadFile 收到的内容:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const uploadResponse: UploadResponse = {
      fileId: `file_${Date.now()}`,
      filename: file.name,
      totalRows: 10,
      columns: ['question', 'answer', 'system', 'llm_judgement', 'llm_reasoning'],
      previewData: [
        {
          question: '什么是人工智能？',
          answer: '人工智能是模拟人类智能的计算机系统。',
          system: '你是一个专业的AI助手。',
          llm_judgement: '优秀',
          llm_reasoning: '回答准确、简洁、专业。'
        }
      ],
      isValid: true
    };

    const response = {
      success: true,
      data: uploadResponse,
      message: '文件验证成功'
    };
    console.log('Mock API - uploadFile 返回的数据:', response);
    return response;
  }

  // 项目管理
  async createProject(projectData: CreateProjectRequest): Promise<ApiResponse<Project>> {
    console.log('Mock API - createProject 收到的内容:', projectData);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newProject: Project = {
      id: `project-${Date.now()}`,
      name: projectData.name,
      description: projectData.description,
      annotationType: projectData.annotationType,
      evaluationType: projectData.evaluationType,
      status: 'active',
      createdBy: mockUser.id,
      createdAt: new Date().toISOString(),
      totalItems: 0,
      completedItems: 0
    };

    mockProjects.push(newProject);
    
    const response = {
      success: true,
      data: newProject,
      message: '项目创建成功'
    };
    console.log('Mock API - createProject 返回的数据:', response);
    return response;
  }

  async getProjects(): Promise<ApiResponse<Project[]>> {
    console.log('Mock API - getProjects 被调用');
    await new Promise(resolve => setTimeout(resolve, 500));
    const response = {
      success: true,
      data: mockProjects
    };
    console.log('Mock API - getProjects 返回的数据:', response);
    return response;
  }

  async getProject(projectId: string): Promise<ApiResponse<Project>> {
    console.log('Mock API - getProject 收到的内容:', { projectId });
    const project = mockProjects.find(p => p.id === projectId);
    if (!project) {
      const response = {
        success: false,
        error: '项目不存在'
      };
      console.log('Mock API - getProject 返回的数据:', response);
      return response;
    }
    
    const response = {
      success: true,
      data: project
    };
    console.log('Mock API - getProject 返回的数据:', response);
    return response;
  }

  // 标注相关
  async getAnnotationItems(
    projectId: string, 
    page: number = 1, 
    limit: number = 10
  ): Promise<ApiResponse<{ items: AnnotationItem[]; total: number }>> {
    console.log('Mock API - getAnnotationItems 收到的内容:', { projectId, page, limit });
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const items = mockAnnotationItems.filter(item => item.projectId === projectId);
    const start = (page - 1) * limit;
    const end = start + limit;
    
    const response = {
      success: true,
      data: {
        items: items.slice(start, end),
        total: items.length
      }
    };
    console.log('Mock API - getAnnotationItems 返回的数据:', response);
    return response;
  }

  async getAnnotationItem(projectId: string, itemId: string): Promise<ApiResponse<AnnotationItem>> {
    console.log('Mock API - getAnnotationItem 收到的内容:', { projectId, itemId });
    const item = mockAnnotationItems.find(item => 
      item.id === itemId && item.projectId === projectId
    );
    
    if (!item) {
      const response = {
        success: false,
        error: '标注项不存在'
      };
      console.log('Mock API - getAnnotationItem 返回的数据:', response);
      return response;
    }
    
    const response = {
      success: true,
      data: item
    };
    console.log('Mock API - getAnnotationItem 返回的数据:', response);
    return response;
  }

  // 提交完整的标注数据行（人类专家标注完成后插入数据库）
  async submitAnnotation(
    projectId: string, 
    submission: AnnotationSubmitRequest & { completeDataRow?: any }
  ): Promise<ApiResponse<AnnotationItem>> {
    console.log('Mock API - submitAnnotation 收到的内容:', { projectId, submission });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 模拟插入完整数据行到数据库
    const completeDataRow = {
      id: `annotation_${Date.now()}`,
      projectId,
      itemId: submission.itemId,
      action: submission.action,
      humanJudgement: submission.humanJudgement,
      humanReasoning: submission.humanReasoning,
      originalData: submission.completeDataRow || {},
      annotatedBy: mockUser.id,
      annotatedAt: new Date().toISOString(),
      timestamp: new Date().toISOString()
    };
    
    // 存储到模拟数据库
    annotatedDataRows.push(completeDataRow);
    console.log('Mock API - 已插入标注数据到数据库:', completeDataRow);
    console.log('Mock API - 当前数据库中的标注数据总数:', annotatedDataRows.length);
    
    // 更新mock标注项状态
    const itemIndex = mockAnnotationItems.findIndex(item => 
      item.id === submission.itemId && item.projectId === projectId
    );
    
    let updatedItem: AnnotationItem;
    
    if (itemIndex !== -1) {
      updatedItem = {
        ...mockAnnotationItems[itemIndex],
        status: submission.action === 'agree' ? 'agreed' as const :
                submission.action === 'disagree' ? 'disagreed' as const : 'skipped' as const,
        humanJudgement: submission.humanJudgement,
        humanReasoning: submission.humanReasoning,
        annotatedBy: mockUser.id,
        annotatedAt: new Date().toISOString()
      };
      
      mockAnnotationItems[itemIndex] = updatedItem;
    } else {
      // 创建新的标注项
      updatedItem = {
        id: submission.itemId,
        projectId,
        originalData: submission.completeDataRow || {},
        llmJudgement: '',
        llmReasoning: '',
        status: submission.action === 'agree' ? 'agreed' as const :
                submission.action === 'disagree' ? 'disagreed' as const : 'skipped' as const,
        humanJudgement: submission.humanJudgement,
        humanReasoning: submission.humanReasoning,
        annotatedBy: mockUser.id,
        annotatedAt: new Date().toISOString()
      };
      
      mockAnnotationItems.push(updatedItem);
    }
    
    const response = {
      success: true,
      data: updatedItem,
      message: '标注提交成功，数据已插入数据库'
    };
    console.log('Mock API - submitAnnotation 返回的数据:', response);
    return response;
  }

  // 统计数据
  async getAnnotationStats(projectId: string): Promise<ApiResponse<AnnotationStats>> {
    console.log('Mock API - getAnnotationStats 收到的内容:', { projectId });
    const items = mockAnnotationItems.filter(item => item.projectId === projectId);
    const total = items.length;
    const completed = items.filter(item => item.status !== 'pending').length;
    const agreed = items.filter(item => item.status === 'agreed').length;
    const disagreed = items.filter(item => item.status === 'disagreed').length;
    const skipped = items.filter(item => item.status === 'skipped').length;
    const agreementRate = completed > 0 ? (agreed / completed) * 100 : 0;

    const response = {
      success: true,
      data: {
        total,
        completed,
        agreed,
        disagreed,
        skipped,
        agreementRate: Math.round(agreementRate * 100) / 100
      }
    };
    console.log('Mock API - getAnnotationStats 返回的数据:', response);
    return response;
  }

  // 数据导出
  async exportAnnotations(projectId: string, format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    console.log('Mock API - exportAnnotations 收到的内容:', { projectId, format });
    
    // 导出已标注完成的数据
    const projectAnnotations = annotatedDataRows.filter(row => row.projectId === projectId);
    console.log('Mock API - 导出的标注数据:', projectAnnotations);
    
    const headers = 'id,projectId,itemId,action,humanJudgement,humanReasoning,annotatedAt\n';
    const rows = projectAnnotations.map(row => {
      const humanJudgement = (row.humanJudgement || '').replace(/"/g, '""');
      const humanReasoning = (row.humanReasoning || '').replace(/"/g, '""');
      return `${row.id},${row.projectId},${row.itemId},${row.action},"${humanJudgement}","${humanReasoning}",${row.annotatedAt}`;
    }).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    console.log('Mock API - exportAnnotations 返回的数据:', { blobSize: blob.size, rowCount: projectAnnotations.length });
    return blob;
  }

  // 获取已标注的完整数据（用于调试）
  async getAnnotatedData(projectId?: string): Promise<any[]> {
    console.log('Mock API - getAnnotatedData 收到的内容:', { projectId });
    const filteredData = projectId 
      ? annotatedDataRows.filter(row => row.projectId === projectId)
      : annotatedDataRows;
    console.log('Mock API - getAnnotatedData 返回的数据:', filteredData);
    return filteredData;
  }
}

export const mockApiService = new MockApiService();
