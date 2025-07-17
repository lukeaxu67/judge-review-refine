
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services';
import { useToast } from '@/hooks/use-toast';
import type { 
  LoginRequest, 
  CreateProjectRequest, 
  AnnotationSubmitRequest,
  ImportDataRequest,
  ApiResponse
} from '@/types/api';

// 认证相关hooks
export const useLogin = () => {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (credentials: LoginRequest) => api.login(credentials),
    onSuccess: (response) => {
      if (response.success) {
        toast({
          title: "登录成功",
          description: response.message,
        });
      } else {
        toast({
          title: "登录失败",
          description: response.error,
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "登录失败",
        description: "网络错误，请稍后重试",
        variant: "destructive",
      });
    }
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => api.getCurrentUser(),
  });
};

// 项目相关hooks
export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => api.getProjects(),
  });
};

export const useProject = (projectId: string) => {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: () => api.getProject(projectId),
    enabled: !!projectId,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (projectData: CreateProjectRequest) => api.createProject(projectData),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['projects'] });
        toast({
          title: "项目创建成功",
          description: response.message,
        });
      } else {
        toast({
          title: "创建失败",
          description: response.error,
          variant: "destructive",
        });
      }
    }
  });
};

// 文件上传和数据导入hooks
export const useFileUpload = () => {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (file: File) => api.uploadFile(file),
    onSuccess: (response) => {
      if (response.success) {
        toast({
          title: "文件验证成功",
          description: `检测到 ${response.data?.totalRows} 行数据`,
        });
      } else {
        toast({
          title: "文件验证失败",
          description: response.error,
          variant: "destructive",
        });
      }
    }
  });
};

// 注意：这个hook应该谨慎使用，因为数据应该只在人类专家标注后插入
export const useImportData = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (importRequest: ImportDataRequest) => {
      // 检查 api 对象是否有 importAnnotationData 方法
      if ('importAnnotationData' in api && typeof api.importAnnotationData === 'function') {
        return api.importAnnotationData(importRequest);
      } else {
        throw new Error('importAnnotationData method not available');
      }
    },
    onSuccess: (response: ApiResponse<{ imported: number }>) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['projects'] });
        toast({
          title: "数据导入成功",
          description: response.message,
        });
      } else {
        toast({
          title: "导入失败",
          description: response.error,
          variant: "destructive",
        });
      }
    }
  });
};

// 标注相关hooks
export const useAnnotationItems = (projectId: string, page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['annotationItems', projectId, page, limit],
    queryFn: () => api.getAnnotationItems(projectId, page, limit),
    enabled: !!projectId,
  });
};

export const useAnnotationItem = (projectId: string, itemId: string) => {
  return useQuery({
    queryKey: ['annotationItem', projectId, itemId],
    queryFn: () => api.getAnnotationItem(projectId, itemId),
    enabled: !!projectId && !!itemId,
  });
};

export const useSubmitAnnotation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ projectId, submission }: { 
      projectId: string; 
      submission: AnnotationSubmitRequest 
    }) => api.submitAnnotation(projectId, submission),
    onSuccess: (response, variables) => {
      if (response.success) {
        queryClient.invalidateQueries({ 
          queryKey: ['annotationItems', variables.projectId] 
        });
        queryClient.invalidateQueries({ 
          queryKey: ['annotationStats', variables.projectId] 
        });
        
        toast({
          title: "标注提交成功",
          description: response.message,
        });
      } else {
        toast({
          title: "提交失败",
          description: response.error,
          variant: "destructive",
        });
      }
    }
  });
};

// 统计数据hooks
export const useAnnotationStats = (projectId: string) => {
  return useQuery({
    queryKey: ['annotationStats', projectId],
    queryFn: () => api.getAnnotationStats(projectId),
    enabled: !!projectId,
  });
};
