import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Settings2, Plus, Trash2, CheckCircle, X, Wand2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// Define the type for a dimension with a unique ID for stable rendering
interface DimensionConfig {
  id: number;
  name: string;
  judgementColumn: string;
  reasoningColumn?: string;
}

interface ColumnConfigSectionProps {
  file: File;
  data: any[];
  annotationType: "multi-dimension-single" | "multi-dimension-multi";
  onConfigComplete: (config: any) => void;
}

export const ColumnConfigSection = ({ file, data, annotationType, onConfigComplete }: ColumnConfigSectionProps) => {
  const [dimensions, setDimensions] = useState<DimensionConfig[]>([
    { id: Date.now(), name: "", judgementColumn: "", reasoningColumn: "" }
  ]);
  
  const availableColumns = data.length > 0 ? Object.keys(data[0]) : [];
  const isSingleTurn = annotationType.includes("single");
  
  // 自动检测评估类型
  const detectEvaluationType = () => {
    const columns = availableColumns.map(col => col.toLowerCase());
    
    if (isSingleTurn) {
      return (columns.includes("answer1") && columns.includes("answer2")) ? "comparison" : "rule-based";
    } else {
      return (columns.includes("dialog1") && columns.includes("dialog2")) ? "comparison" : "rule-based";
    }
  };

  const evaluationType = detectEvaluationType();

  // 检查必需列是否存在
  const checkRequiredColumns = () => {
    const columns = availableColumns.map(col => col.toLowerCase());
    const missing = [];

    if (isSingleTurn) {
      if (!columns.includes("question")) missing.push("question");
      if (evaluationType === "comparison") {
        if (!columns.includes("answer1")) missing.push("answer1");
        if (!columns.includes("answer2")) missing.push("answer2");
      } else {
        if (!columns.includes("answer")) missing.push("answer");
      }
    } else {
      if (evaluationType === "comparison") {
        if (!columns.includes("dialog1")) missing.push("dialog1");
        if (!columns.includes("dialog2")) missing.push("dialog2");
      } else {
        if (!columns.includes("dialog")) missing.push("dialog");
      }
    }

    return missing;
  };

  const missingColumns = checkRequiredColumns();
  const hasAllRequiredColumns = missingColumns.length === 0;

  const handleAutoDetectDimensions = () => {
    let idCounter = dimensions.length > 0 && dimensions.some(d => d.name || d.judgementColumn)
      ? Math.max(...dimensions.map(d => d.id)) + 1 
      : Date.now();

    const existingJudgementColumns = dimensions.map(d => d.judgementColumn);
    
    // 判断结果后缀列表
    const judgementSuffixes = ['结果', 'result', 'results', 'score', 'options', 'option', '得分', '判断', 'binary', 'judgement', 'judgment'];
    // 判断原因后缀列表
    const reasoningSuffixes = ['原因', 'reason', 'reasoning', '分析', 'analysis'];
    // 连接符
    const separators = [' ', '_', '-'];
    
    // 用于存储维度信息
    const dimensionMap = new Map<string, { judgementColumns: string[], reasoningColumns: string[] }>();
    
    // 遍历所有列，尝试识别维度
    availableColumns.forEach(column => {
      if (existingJudgementColumns.includes(column)) return;
      
      const columnLower = column.toLowerCase();
      
      // 检查是否为判断结果列
      for (const suffix of judgementSuffixes) {
        for (const separator of separators) {
          const pattern = separator + suffix.toLowerCase();
          if (columnLower.includes(pattern)) {
            // 提取维度名称
            const index = columnLower.lastIndexOf(pattern);
            if (index > 0) {
              const dimensionName = column.substring(0, index).trim();
              if (dimensionName) {
                if (!dimensionMap.has(dimensionName)) {
                  dimensionMap.set(dimensionName, { judgementColumns: [], reasoningColumns: [] });
                }
                dimensionMap.get(dimensionName)!.judgementColumns.push(column);
                return;
              }
            }
          }
        }
      }
      
      // 检查是否为判断原因列
      for (const suffix of reasoningSuffixes) {
        for (const separator of separators) {
          const pattern = separator + suffix.toLowerCase();
          if (columnLower.includes(pattern)) {
            // 提取维度名称
            const index = columnLower.lastIndexOf(pattern);
            if (index > 0) {
              const dimensionName = column.substring(0, index).trim();
              if (dimensionName) {
                if (!dimensionMap.has(dimensionName)) {
                  dimensionMap.set(dimensionName, { judgementColumns: [], reasoningColumns: [] });
                }
                dimensionMap.get(dimensionName)!.reasoningColumns.push(column);
                return;
              }
            }
          }
        }
      }
    });

    const detectedDimensions: DimensionConfig[] = [];
    
    // 遍历检测到的维度
    dimensionMap.forEach((info, dimensionName) => {
      // 只有当该维度有唯一的判断结果列时才自动配置
      if (info.judgementColumns.length === 1) {
        detectedDimensions.push({
          id: idCounter++,
          name: dimensionName,
          judgementColumn: info.judgementColumns[0],
          reasoningColumn: info.reasoningColumns.length === 1 ? info.reasoningColumns[0] : ""
        });
      }
    });

    if (detectedDimensions.length === 0) {
      toast.info("未找到可自动配置的维度列。请手动配置维度。");
      return;
    }

    // If the only dimension is the initial empty one, replace it. Otherwise, append.
    if (dimensions.length === 1 && dimensions[0].name === "" && dimensions[0].judgementColumn === "") {
      setDimensions(detectedDimensions);
    } else {
      setDimensions(prev => [...prev.filter(d => d.name || d.judgementColumn), ...detectedDimensions]);
    }
    toast.success(`成功检测到 ${detectedDimensions.length} 个新维度。`);
  };

  const handleAddDimension = () => {
    const newId = dimensions.length > 0 ? Math.max(...dimensions.map(d => d.id)) + 1 : Date.now();
    setDimensions(prev => [...prev, { id: newId, name: "", judgementColumn: "", reasoningColumn: "" }]);
  };

  const handleRemoveDimension = (idToRemove: number) => {
    if (dimensions.length > 1) {
      setDimensions(prev => prev.filter(d => d.id !== idToRemove));
    }
  };

  const handleDimensionChange = (idToChange: number, field: keyof Omit<DimensionConfig, 'id'>, value: string) => {
    setDimensions(prev => prev.map(d => 
      d.id === idToChange ? { ...d, [field]: value } : d
    ));
  };

  const handleComplete = () => {
    const finalConfig = {
      evaluationType,
      // Remove the internal 'id' before passing the config up
      dimensions: dimensions
        .filter(d => d.name.trim() && d.judgementColumn)
        .map(({ id, ...rest }) => rest)
    };
    
    console.log("Column configuration completed:", {
      annotationType,
      config: finalConfig,
      filename: file.name,
      timestamp: new Date().toISOString()
    });
    
    onConfigComplete(finalConfig);
  };

  const isConfigValid = () => {
    if (!hasAllRequiredColumns) return false;
    return dimensions.length > 0 && dimensions.some(d => d.name.trim() && d.judgementColumn);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white/70 backdrop-blur-sm border-white/20">
        <div className="flex items-center space-x-2 mb-6">
          <Settings2 className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">多维度标注配置</h2>
        </div>

        {/* File Info */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-blue-900 mb-2">文件信息</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700">文件名:</span>
              <span className="ml-2 text-blue-900">{file.name}</span>
            </div>
            <div>
              <span className="text-blue-700">数据行数:</span>
              <span className="ml-2 text-blue-900">{data.length}</span>
            </div>
            <div>
              <span className="text-blue-700">标注类型:</span>
              <span className="ml-2 text-blue-900">
                {annotationType === "multi-dimension-single" && "多维度单轮"}
                {annotationType === "multi-dimension-multi" && "多维度多轮"}
              </span>
            </div>
            <div>
              <span className="text-blue-700">评估类型:</span>
              <span className="ml-2 text-blue-900">
                {evaluationType === "comparison" ? "对比评估" : "规则评估"}
              </span>
            </div>
          </div>
        </div>

        {/* Column Check Status */}
        <div className="mb-6">
          <h3 className="font-medium text-gray-900 mb-3">必需列检查</h3>
          {hasAllRequiredColumns ? (
            <div className="flex items-center space-x-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span>所有必需列都存在 ✓</span>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-red-700">
                <X className="w-5 h-5" />
                <span>缺少必需列 ✗</span>
              </div>
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="text-red-800 font-medium mb-2">缺少以下必需列:</h4>
                <p className="text-red-700 text-sm mb-2">
                  {missingColumns.join(", ")}
                </p>
                <p className="text-red-600 text-xs">
                  请确保您的Excel文件包含这些列名（不区分大小写）
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Available Columns */}
        <div className="mb-6">
          <h3 className="font-medium text-gray-900 mb-3">检测到的列</h3>
          <div className="flex flex-wrap gap-2">
            {availableColumns.map((column) => (
              <Badge key={column} variant="outline" className="text-xs">
                {column}
              </Badge>
            ))}
          </div>
        </div>

        {/* Dimension Configuration */}
        {hasAllRequiredColumns && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">评估维度配置</h3>
              <div className="flex items-center gap-2">
                <Button onClick={handleAutoDetectDimensions} size="sm" variant="outline" className="flex items-center gap-2">
                  <Wand2 className="w-4 h-4" />
                  自动检测
                </Button>
                <Button onClick={handleAddDimension} size="sm" variant="outline" className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  添加维度
                </Button>
              </div>
            </div>
            
            {dimensions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p className="mb-4">暂无配置的维度</p>
                <Button onClick={handleAddDimension} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  添加第一个维度
                </Button>
              </div>
            )}
            
            {dimensions.map((dimension, index) => (
              <Card key={dimension.id} className="p-4 bg-gray-50 border-2 border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-800 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                      维度 {index + 1}
                    </span>
                  </h4>
                  <Button 
                    onClick={() => handleRemoveDimension(dimension.id)} 
                    size="sm" 
                    variant="ghost"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    disabled={dimensions.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">维度名称 *</Label>
                    <Input
                      value={dimension.name}
                      onChange={(e) => handleDimensionChange(dimension.id, 'name', e.target.value)}
                      placeholder="例如: 相关性、专业性"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">LLM判断结果列 *</Label>
                    <Select 
                      value={dimension.judgementColumn || ""} 
                      onValueChange={(value) => handleDimensionChange(dimension.id, 'judgementColumn', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="选择判断结果列" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableColumns.map((column) => (
                          <SelectItem key={column} value={column}>
                            {column}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">LLM推理过程列 (可选)</Label>
                    <Select 
                      value={dimension.reasoningColumn || "none"} 
                      onValueChange={(value) => handleDimensionChange(dimension.id, 'reasoningColumn', value === 'none' ? '' : value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="选择推理过程列" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">无</SelectItem>
                        {availableColumns.map((column) => (
                          <SelectItem key={column} value={column}>
                            {column}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Data Preview for Dimension */}
                {dimension.judgementColumn && (
                  <div className="mt-3 p-3 bg-white rounded border">
                    <h5 className="text-xs font-medium text-gray-600 mb-2">该维度数据预览</h5>
                    <div className="text-xs text-gray-700">
                      <div><span className="font-medium">LLM判断:</span> {data[0]?.[dimension.judgementColumn] !== undefined ? String(data[0]?.[dimension.judgementColumn]) : '(无数据)'}</div>
                      {dimension.reasoningColumn && (
                        <div className="mt-1"><span className="font-medium">LLM推理:</span> {data[0]?.[dimension.reasoningColumn] !== undefined ? String(data[0]?.[dimension.reasoningColumn]) : '(无数据)'}</div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Data Preview */}
        <div className="mt-6">
          <h3 className="font-medium text-gray-900 mb-3">数据预览</h3>
          <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-auto">
            <pre className="text-xs text-gray-700">
              {JSON.stringify(data.slice(0, 2), null, 2)}
            </pre>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button 
            onClick={handleComplete}
            disabled={!isConfigValid()}
            className="px-8"
          >
            完成配置，开始标注
          </Button>
        </div>
      </Card>
    </div>
  );
};
