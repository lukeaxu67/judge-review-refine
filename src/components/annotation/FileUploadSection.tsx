
import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import * as XLSX from 'xlsx';

interface FileUploadSectionProps {
  onFileUploaded: (file: File, data: any[]) => void;
  annotationType: "single-turn" | "multi-turn" | "multi-dimension-single" | "multi-dimension-multi";
}

const getRequiredColumns = (annotationType: string, evaluationType: "rule-based" | "comparison", columns: string[]) => {
  // const isMultiDimension = annotationType.includes("multi-dimension");
  const isSingleTurn = annotationType.includes("single");
  const lowerColumns = columns.map(col => col.toLowerCase());
  
  if (isSingleTurn) {
    // 单轮对话
    const baseColumns = ["question"];
    if (evaluationType === "comparison") {
      return [...baseColumns, "answer1", "answer2"];
    } else {
      return [...baseColumns, "answer"];
    }
  } else {
    // 多轮对话
    // Check if we have the new format (history + question + answer)
    if (lowerColumns.includes("history") && lowerColumns.includes("question")) {
      if (evaluationType === "comparison") {
        return ["history", "question", "answer1", "answer2"];
      } else {
        return ["history", "question", "answer"];
      }
    }
    
    // Otherwise use the old format
    if (evaluationType === "comparison") {
      return ["dialog1", "dialog2"];
    } else {
      return ["dialog"];
    }
  }
};

const validateFileFormat = (data: any[], annotationType: string) => {
  if (!data || data.length === 0) {
    return { isValid: false, message: "文件为空或无法读取数据" };
  }

  const columns = Object.keys(data[0]).map(col => col.toLowerCase());
  // const isMultiDimension = annotationType.includes("multi-dimension");
  const isSingleTurn = annotationType.includes("single");
  
  // 检测评估类型
  let evaluationType: "rule-based" | "comparison" = "rule-based";
  if (isSingleTurn) {
    if (columns.includes("answer1") && columns.includes("answer2")) {
      evaluationType = "comparison";
    }
  } else {
    if (columns.includes("dialog1") && columns.includes("dialog2")) {
      evaluationType = "comparison";
    }
  }
  
  const requiredColumns = getRequiredColumns(annotationType, evaluationType, Object.keys(data[0]));
  const missingColumns = requiredColumns.filter(col => !columns.includes(col.toLowerCase()));
  
  if (missingColumns.length > 0) {
    return {
      isValid: false,
      message: `缺少必需的列: ${missingColumns.join(", ")}`,
      requiredColumns,
      foundColumns: columns
    };
  }

  // 对于多维度标注，不再强制要求特定的判断结果列
  // 用户可以在下一步手动配置维度列

  return { isValid: true, evaluationType };
};

export const FileUploadSection = ({ onFileUploaded, annotationType }: FileUploadSectionProps) => {
  const [isUploading, setIsUploading] = useState(false);
  // const fileUpload = useFileUpload();  // Not used, using apiService directly
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      // Read Excel file
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      // 验证文件格式
      const validation = validateFileFormat(data, annotationType);
      if (!validation.isValid) {
        toast({
          title: "文件格式错误",
          description: validation.message,
          variant: "destructive",
        });
        return;
      }

      // Upload file to get file hash
      try {
        const uploadResponse = await apiService.uploadFile(file);
        console.log('Upload response:', uploadResponse);
        
        // Handle wrapped response (ApiResponse structure)
        const fileId = uploadResponse?.data?.fileId;
        
        if (fileId) {
          // Store file hash in sessionStorage
          sessionStorage.setItem('current_file_hash', fileId);
          console.log(`File hash stored: ${fileId}`);
        } else {
          console.error('No fileId in upload response:', uploadResponse);
        }
      } catch (uploadError) {
        console.error('Failed to get file hash from server:', uploadError);
      }

      console.log(`${annotationType} file processed:`, {
        filename: file.name,
        size: file.size,
        dataLength: data.length,
        evaluationType: validation.evaluationType,
        sampleData: data.slice(0, 3),
        timestamp: new Date().toISOString()
      });

      onFileUploaded(file, data);
      
      toast({
        title: "文件上传成功",
        description: `已读取 ${data.length} 行数据`,
      });
    } catch (error) {
      console.error("File processing failed:", error);
      toast({
        title: "文件处理失败",
        description: "请确保文件格式正确",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }, [onFileUploaded, toast, annotationType]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    maxFiles: 1,
    disabled: isUploading
  });

  const getFormatRequirements = () => {
    const isMultiDimension = annotationType.includes("multi-dimension");
    const isSingleTurn = annotationType.includes("single");
    
    const requirements = [];
    
    if (isSingleTurn) {
      // requirements.push("• 必须包含 question 列（问题）");
      // requirements.push("• 规则评估：包含 answer 列（回答）");
      // requirements.push("• 对比评估：包含 answer1 和 answer2 列（两个回答）");
      requirements.push("• 默认识别: question + answer 或 answer1/answer2");
    } else {
      // requirements.push("• 规则评估：包含 dialog 列（对话内容，JSON格式）或 history + question + answer 列");
      // requirements.push("• 对比评估：包含 dialog1 和 dialog2 列（两个对话，JSON格式）或 history + question + answer1/answer2 列");
      // requirements.push("• history 列应为历史对话数组（不含当前轮），当前轮用 question/answer 表示");
      requirements.push("• 默认识别 history 历史对话数组 + question + answer|answer1/answer2 表示");
    }
    
    if (isMultiDimension) {
      // requirements.push("• 维度列自动识别：维度名 + 分隔符(空格/下划线/中划线) + 后缀");
      // requirements.push("• 判断结果后缀：结果/result/results/score/options/option/得分/判断/binary/judgement/judgment");
      // requirements.push("• 判断原因后缀：原因/reason/reasoning/分析/analysis");
      // requirements.push("• 如无法自动识别，可在下一步手动配置维度列");
    }
    
    // 添加辅助信息说明
    requirements.push("• 可选列：context/上下文/搜索结果");
    requirements.push("• 可选列：refer/reference/refer_answer/参考答案/参考");
    
    return requirements;
  };

  return (
    <Card className="p-8 bg-white/70 backdrop-blur-sm border-white/20">
      <div className="text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <Upload className="w-8 h-8 text-blue-600" />
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">上传数据文件</h2>
          <p className="text-gray-600">
            支持 Excel (.xlsx, .xls) 和 CSV (.csv) 格式文件
          </p>
        </div>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer ${
            isDragActive
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
          } ${isUploading ? "pointer-events-none opacity-50" : ""}`}
        >
          <input {...getInputProps()} />
          <div className="text-center space-y-4">
            <FileText className="w-12 h-12 text-gray-400 mx-auto" />
            {isDragActive ? (
              <p className="text-blue-600 font-medium">释放文件以上传...</p>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">
                  {isUploading ? "正在处理文件..." : "拖拽文件到此处，或点击选择文件"}
                </p>
                <Button variant="outline" disabled={isUploading}>
                  {isUploading ? "处理中..." : "选择文件"}
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="text-left">
              <h4 className="text-sm font-medium text-amber-800 mb-1">文件格式要求</h4>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• 第一行应为列标题</li>
                {getFormatRequirements().map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
                <li>• 文件大小建议不超过 50MB</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
