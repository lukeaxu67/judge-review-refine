import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  ChevronLeft, 
  ChevronRight, 
  MessageSquare 
} from "lucide-react";
import { DialogRenderer } from "./DialogRenderer";
import { DimensionCard } from "./DimensionCard";
import { MultiDimensionCardStack } from "./MultiDimensionCardStack";
import { AuxiliaryInfo } from "./AuxiliaryInfo";
import { useSubmitAnnotation } from "@/hooks/useApi";
import { useToast } from "@/hooks/use-toast";
import { Dimension } from "@/types/api";

interface AnnotationWorkspaceProps {
  file: File;
  data: any[];
  config: any;
  annotationType: "single-turn" | "multi-turn" | "multi-dimension-single" | "multi-dimension-multi";
  projectId: string;
  dimensions?: Dimension[];
}

export const AnnotationWorkspace = ({ 
  file, 
  data, 
  config, 
  annotationType,
  projectId,
  dimensions = []
}: AnnotationWorkspaceProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentDimensionIndex, setCurrentDimensionIndex] = useState(0);
  const [jumpToInput, setJumpToInput] = useState("");
  const [showDisagreeInputs, setShowDisagreeInputs] = useState(false);
  
  const submitAnnotation = useSubmitAnnotation();
  const { toast } = useToast();

  const currentItem = data[currentIndex];
  const progress = ((currentIndex + 1) / data.length) * 100;
  
  // 判断是否为多维度模式
  const isMultiDimension = annotationType.includes("multi-dimension");
  const effectiveDimensions = isMultiDimension ? dimensions : [{
    name: "默认维度",
    judgementColumn: config.llmJudgementColumn,
    reasoningColumn: config.llmReasoningColumn
  }];

  // 键盘快捷键
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'a':
          e.preventDefault();
          handleDimensionAction("agree", effectiveDimensions[currentDimensionIndex].name);
          break;
        case 'd':
          e.preventDefault();
          if (!showDisagreeInputs) {
            setShowDisagreeInputs(true);
          }
          break;
        case 'r':
          e.preventDefault();
          handleDimensionAction("skip", effectiveDimensions[currentDimensionIndex].name);
          break;
        case 'w':
          e.preventDefault();
          goToIndex(currentIndex - 1);
          break;
        case 's':
          e.preventDefault();
          goToIndex(currentIndex + 1);
          break;
        case 'q':
          e.preventDefault();
          if (isMultiDimension) {
            setCurrentDimensionIndex(Math.max(0, currentDimensionIndex - 1));
          }
          break;
        case 'e':
          e.preventDefault();
          if (isMultiDimension) {
            setCurrentDimensionIndex(Math.min(effectiveDimensions.length - 1, currentDimensionIndex + 1));
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, currentDimensionIndex, isMultiDimension, effectiveDimensions]);

  const handleDimensionChange = (index: number) => {
    setCurrentDimensionIndex(index);
    setShowDisagreeInputs(false);
  };

  // Convert data to dialog format
  const convertToDialog = (item: any) => {
    console.log("Converting item to dialog:", { item, config, annotationType });
    
    if (annotationType === "single-turn" || annotationType === "multi-dimension-single") {
      if (config.evaluationType === "comparison") {
        const dialog1 = [];
        const dialog2 = [];

        // 查找question列
        const questionColumn = Object.keys(item).find(key => key.toLowerCase() === 'question');
        const answer1Column = Object.keys(item).find(key => key.toLowerCase() === 'answer1');
        const answer2Column = Object.keys(item).find(key => key.toLowerCase() === 'answer2');

        if (questionColumn && item[questionColumn]) {
          dialog1.push({ role: "user", content: item[questionColumn] });
          dialog2.push({ role: "user", content: item[questionColumn] });
        }

        if (answer1Column && item[answer1Column]) {
          dialog1.push({ role: "assistant", content: item[answer1Column] });
        }
        if (answer2Column && item[answer2Column]) {
          dialog2.push({ role: "assistant", content: item[answer2Column] });
        }

        console.log("Generated comparison dialogs:", { dialog1, dialog2 });
        return { dialog1, dialog2, isComparison: true };
      } else {
        const dialog = [];
        
        // 查找question和answer列
        const questionColumn = Object.keys(item).find(key => key.toLowerCase() === 'question');
        const answerColumn = Object.keys(item).find(key => key.toLowerCase() === 'answer');

        if (questionColumn && item[questionColumn]) {
          dialog.push({ role: "user", content: item[questionColumn] });
        }
        if (answerColumn && item[answerColumn]) {
          dialog.push({ role: "assistant", content: item[answerColumn] });
        }
        
        console.log("Generated single-turn dialog:", dialog);
        return { dialog, isComparison: false };
      }
    } else {
      // Multi-turn
      // Check if we have history + question/answer format
      const historyColumn = Object.keys(item).find(key => key.toLowerCase() === 'history');
      const questionColumn = Object.keys(item).find(key => key.toLowerCase() === 'question');
      const answerColumn = Object.keys(item).find(key => key.toLowerCase() === 'answer');
      const answer1Column = Object.keys(item).find(key => key.toLowerCase() === 'answer1');
      const answer2Column = Object.keys(item).find(key => key.toLowerCase() === 'answer2');
      
      if (historyColumn && questionColumn) {
        // New format: history + question/answer
        try {
          const history = historyColumn ? JSON.parse(item[historyColumn] || "[]") : [];
          
          if (answer1Column && answer2Column) {
            // Comparison mode with history
            const dialog1 = [...history];
            const dialog2 = [...history];
            
            if (item[questionColumn]) {
              dialog1.push({ role: "user", content: item[questionColumn] });
              dialog2.push({ role: "user", content: item[questionColumn] });
            }
            
            if (item[answer1Column]) {
              dialog1.push({ role: "assistant", content: item[answer1Column] });
            }
            if (item[answer2Column]) {
              dialog2.push({ role: "assistant", content: item[answer2Column] });
            }
            
            console.log("Generated multi-turn comparison dialogs with history:", { dialog1, dialog2 });
            return { dialog1, dialog2, isComparison: true };
          } else if (answerColumn) {
            // Rule-based mode with history
            const dialog = [...history];
            
            if (item[questionColumn]) {
              dialog.push({ role: "user", content: item[questionColumn] });
            }
            if (item[answerColumn]) {
              dialog.push({ role: "assistant", content: item[answerColumn] });
            }
            
            console.log("Generated multi-turn dialog with history:", dialog);
            return { dialog, isComparison: false };
          }
        } catch (error) {
          console.error("Failed to parse history column:", error);
        }
      }
      
      // Fallback to old format: dialog or dialog1/dialog2
      if (config.evaluationType === "comparison") {
        const dialog1Column = Object.keys(item).find(key => key.toLowerCase() === 'dialog1');
        const dialog2Column = Object.keys(item).find(key => key.toLowerCase() === 'dialog2');
        
        try {
          const dialog1 = dialog1Column ? JSON.parse(item[dialog1Column] || "[]") : [];
          const dialog2 = dialog2Column ? JSON.parse(item[dialog2Column] || "[]") : [];
          console.log("Generated multi-turn comparison dialogs:", { dialog1, dialog2 });
          return { dialog1, dialog2, isComparison: true };
        } catch (error) {
          console.error("Failed to parse dialog columns:", error);
          return { dialog1: [], dialog2: [], isComparison: true };
        }
      } else {
        const dialogColumn = Object.keys(item).find(key => key.toLowerCase() === 'dialog');
        
        try {
          const dialogData = dialogColumn ? JSON.parse(item[dialogColumn] || "[]") : [];
          console.log("Generated multi-turn dialog:", dialogData);
          return { dialog: dialogData, isComparison: false };
        } catch (error) {
          console.error("Failed to parse dialog column:", error);
          return { dialog: [], isComparison: false };
        }
      }
    }
  };

  const handleDimensionAction = async (
    action: "agree" | "disagree" | "skip", 
    dimension: string, 
    humanJudgement?: string, 
    humanReasoning?: string
  ) => {
    const itemId = `${projectId}_item_${currentIndex}`;
    
    // Get file hash from sessionStorage (should be stored when file is uploaded)
    const fileHash = sessionStorage.getItem('current_file_hash') || '';
    
    // Debug: Log all sessionStorage keys
    console.log('SessionStorage keys:', Object.keys(sessionStorage));
    console.log('SessionStorage current_file_hash:', sessionStorage.getItem('current_file_hash'));
    
    if (!fileHash) {
      console.error('No file hash found in sessionStorage');
      // Try to get from the uploaded file (fallback)
      console.warn('Attempting to use filename as fallback identifier');
      toast({
        title: "警告",
        description: "未找到文件哈希值，使用文件名作为标识",
        variant: "default"
      });
      // Use filename as a temporary fallback
      // return;
    }
    
    // Extract labels from current item
    const labelColumns = ['labels', 'label', 'category', 'categorys', '分类'];
    const labels = [];
    Object.keys(currentItem).forEach(key => {
      if (labelColumns.includes(key.toLowerCase()) && currentItem[key]) {
        if (Array.isArray(currentItem[key])) {
          labels.push(...currentItem[key]);
        } else {
          labels.push(...String(currentItem[key]).split(',').map(s => s.trim()));
        }
      }
    });
    
    // Use file hash or generate one from filename as fallback
    const effectiveFileHash = fileHash || btoa(file.name).replace(/[^a-zA-Z0-9]/g, '').substring(0, 64);
    
    const completeDataRow = {
      file_hash: effectiveFileHash,
      filename: file.name,
      case_id: currentIndex,  // Use current index as case_id
      original_data: currentItem,
      annotation_type: annotationType,
      evaluation_type: config.evaluationType,
      account_name: localStorage.getItem('annotation_account'),
      labels: [...new Set(labels)],  // Remove duplicates
      metadata: {
        project_id: projectId,
        item_id: itemId,
        timestamp: new Date().toISOString()
      }
    };
    
    const submission = {
      itemId: itemId,
      action,
      humanJudgement,
      humanReasoning,
      dimension,
      completeDataRow: completeDataRow
    };

    try {
      console.log("提交维度标注数据:", submission);
      await submitAnnotation.mutateAsync({ projectId, submission });
      
      // 成功后逻辑
      if (isMultiDimension) {
        // 多维度模式：切换到下一个维度，如果是最后一个维度则切换到下一条数据
        if (currentDimensionIndex < effectiveDimensions.length - 1) {
          setCurrentDimensionIndex(currentDimensionIndex + 1);
          setShowDisagreeInputs(false);
        } else {
          // 当前数据的所有维度都已完成，切换到下一条数据
          if (currentIndex < data.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setCurrentDimensionIndex(0);
            setShowDisagreeInputs(false);
          } else {
            toast({
              title: "标注完成",
              description: "所有数据已完成标注",
            });
          }
        }
      } else {
        // 单维度模式：直接切换到下一条数据
        if (currentIndex < data.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setShowDisagreeInputs(false);
        } else {
          toast({
            title: "标注完成",
            description: "所有数据已完成标注",
          });
        }
      }
    } catch (error) {
      console.error("提交标注失败:", error);
    }
  };

  const goToIndex = (index: number) => {
    if (index >= 0 && index < data.length) {
      setCurrentIndex(index);
      setCurrentDimensionIndex(0);
      setShowDisagreeInputs(false);
    }
  };

  const handleJumpToCase = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const targetIndex = parseInt(jumpToInput) - 1;
      if (!isNaN(targetIndex) && targetIndex >= 0 && targetIndex < data.length) {
        goToIndex(targetIndex);
        setJumpToInput("");
      } else {
        toast({
          title: "无效的案例ID",
          description: `请输入 1 到 ${data.length} 之间的数字`,
          variant: "destructive",
        });
      }
    }
  };

  const dialogResult = convertToDialog(currentItem);

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card className="p-4 bg-white/70 backdrop-blur-sm border-white/20">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-medium text-gray-700">
            数据集进度: {currentIndex + 1} / {data.length}
            {isMultiDimension && (
              <span className="ml-4 text-blue-600">
                维度: {currentDimensionIndex + 1} / {effectiveDimensions.length} ({effectiveDimensions[currentDimensionIndex].name})
              </span>
            )}
          </div>
          <div className="text-sm text-gray-600">
            当前ID: {currentIndex + 1}
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </Card>

      {/* 快捷键提示 */}
      <Card className="p-3 bg-blue-50/70 backdrop-blur-sm border-blue-200/20">
        <div className="text-sm text-blue-700">
          <strong>快捷键:</strong> A-同意 | D-反对 | R-跳过 | W-上一条 | S-下一条
          {isMultiDimension && " | Q-上一维度 | E-下一维度"}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Dialog Content */}
        <Card className="p-6 bg-white/70 backdrop-blur-sm border-white/20">
        {/* <Card className="p-6 bg-white/70 backdrop-blur-sm border-white/20 h-full flex flex-col"> */}
          <div className="flex items-center space-x-2 mb-4">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">对话内容</h3>
          </div>
          
          {dialogResult.isComparison ? (
            <div className="space-y-6">
              <div>
                <h4 className="text-md font-medium text-gray-800 mb-3">被评测对象 1</h4>
                <DialogRenderer dialog={dialogResult.dialog1} title="被评测对象 1" />
              </div>
              <div className="border-t pt-4">
                <h4 className="text-md font-medium text-gray-800 mb-3">被评测对象 2</h4>
                <DialogRenderer dialog={dialogResult.dialog2} title="被评测对象 2" />
              </div>
            </div>
          ) : (
            <DialogRenderer dialog={dialogResult.dialog} title="对话内容" />
          )}
          
          {/* Auxiliary Information */}
          <AuxiliaryInfo currentItem={currentItem} />
        </Card>

        {/* Right Panel - Dimensions */}
        <div className="space-y-4">
          {isMultiDimension ? (
            <MultiDimensionCardStack
              dimensions={effectiveDimensions}
              currentItem={currentItem}
              currentDimensionIndex={currentDimensionIndex}
              onAction={handleDimensionAction}
              onDimensionChange={handleDimensionChange}
              isPending={submitAnnotation.isPending}
              showDisagreeInputs={showDisagreeInputs}
              onShowDisagreeInputsChange={setShowDisagreeInputs}
            />
          ) : (
            effectiveDimensions.map((dimension, index) => (
              <DimensionCard
                key={dimension.name}
                dimension={dimension}
                currentItem={currentItem}
                isActive={index === currentDimensionIndex}
                onAction={handleDimensionAction}
                isPending={submitAnnotation.isPending}
                showDisagreeInputs={index === currentDimensionIndex ? showDisagreeInputs : false}
                onShowDisagreeInputsChange={index === currentDimensionIndex ? setShowDisagreeInputs : undefined}
              />
            ))
          )}

          {/* Navigation */}
          <Card className="p-4 bg-white/70 backdrop-blur-sm border-white/20">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">导航</h3>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToIndex(currentIndex - 1)}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="w-4 h-4" />
                上一条 (W)
              </Button>
              <div className="flex-1 text-center">
                <input
                  type="number"
                  min="1"
                  max={data.length}
                  value={jumpToInput}
                  onChange={(e) => setJumpToInput(e.target.value)}
                  onKeyDown={handleJumpToCase}
                  placeholder={`${currentIndex + 1}`}
                  className="w-20 px-2 py-1 text-center border rounded"
                />
                <div className="text-xs text-gray-500 mt-1">按Enter跳转</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToIndex(currentIndex + 1)}
                disabled={currentIndex === data.length - 1}
              >
                下一条 (S)
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
