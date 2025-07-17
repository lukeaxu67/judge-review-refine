
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Check, X, SkipForward } from "lucide-react";
import { useState } from "react";
import { Dimension } from "@/types/api";

interface DimensionCardProps {
  dimension: Dimension;
  currentItem: any;
  isActive: boolean;
  onAction: (action: "agree" | "disagree" | "skip", dimension: string, judgement?: string, reasoning?: string) => void;
  isPending: boolean;
  showDisagreeInputs?: boolean;
  onShowDisagreeInputsChange?: (show: boolean) => void;
}

export const DimensionCard = ({ 
  dimension, 
  currentItem, 
  isActive, 
  onAction, 
  isPending,
  showDisagreeInputs = false,
  onShowDisagreeInputsChange
}: DimensionCardProps) => {
  const [humanJudgement, setHumanJudgement] = useState("");
  const [humanReasoning, setHumanReasoning] = useState("");

  const handleAction = (action: "agree" | "disagree" | "skip") => {
    if (action === "disagree" && !showDisagreeInputs) {
      onShowDisagreeInputsChange?.(true);
      return;
    }

    if (action === "agree" || action === "skip") {
      // 重置反对意见表单
      onShowDisagreeInputsChange?.(false);
      setHumanJudgement("");
      setHumanReasoning("");
    }

    onAction(
      action, 
      dimension.name,
      action === "disagree" ? humanJudgement : undefined,
      action === "disagree" ? humanReasoning : undefined
    );

    // 在成功提交反对意见后重置表单
    if (action === "disagree") {
      onShowDisagreeInputsChange?.(false);
      setHumanJudgement("");
      setHumanReasoning("");
    }
  };

  const handleSubmit = () => {
    if (!humanJudgement.trim()) return;
    
    onAction("disagree", dimension.name, humanJudgement, humanReasoning);
    onShowDisagreeInputsChange?.(false);
    setHumanJudgement("");
    setHumanReasoning("");
  };

  const handleCancelDisagree = () => {
    onShowDisagreeInputsChange?.(false);
    setHumanJudgement("");
    setHumanReasoning("");
  };

  // 获取LLM判断结果和推理
  const getLLMJudgement = () => {
    if (dimension.judgementColumn && currentItem[dimension.judgementColumn] !== undefined && currentItem[dimension.judgementColumn] !== null) {
      const value = currentItem[dimension.judgementColumn];
      // Convert to string, handling boolean values specially
      if (typeof value === 'boolean') {
        return value ? "是" : "否";
      }
      return String(value);
    }
    return "无";
  };

  const getLLMReasoning = () => {
    if (dimension.reasoningColumn && currentItem[dimension.reasoningColumn] !== undefined && currentItem[dimension.reasoningColumn] !== null) {
      return String(currentItem[dimension.reasoningColumn]);
    }
    
    // 尝试其他可能的推理列名
    const possibleReasoningColumns = [
      'reasoning', 'reason', 'explanation', 'llm_reasoning', 'llm_reason',
      `${dimension.name}_reasoning`, `${dimension.name}_reason`
    ];
    
    for (const column of possibleReasoningColumns) {
      if (currentItem[column] !== undefined && currentItem[column] !== null) {
        return String(currentItem[column]);
      }
    }
    
    return null;
  };

  const llmJudgement = getLLMJudgement();
  const llmReasoning = getLLMReasoning();

  // 获取标签/分类信息
  const getLabels = () => {
    const labelColumns = ['labels', 'label', 'category', 'categorys', '分类'];
    const labels: string[] = [];
    
    Object.keys(currentItem).forEach(key => {
      if (labelColumns.includes(key.toLowerCase())) {
        const value = currentItem[key];
        if (value !== undefined && value !== null && value !== '') {
          // 处理数组或逗号分隔的字符串
          if (Array.isArray(value)) {
            labels.push(...value.map(v => String(v)));
          } else {
            const strValue = String(value);
            // 尝试解析逗号分隔的值
            if (strValue.includes(',')) {
              labels.push(...strValue.split(',').map(s => s.trim()).filter(s => s));
            } else {
              labels.push(strValue);
            }
          }
        }
      }
    });
    
    // 去重
    return [...new Set(labels)];
  };

  const labels = getLabels();

  console.log("DimensionCard render data:", {
    dimensionName: dimension.name,
    judgementColumn: dimension.judgementColumn,
    reasoningColumn: dimension.reasoningColumn,
    llmJudgement,
    llmReasoning,
    labels,
    currentItemKeys: Object.keys(currentItem)
  });

  return (
    <Card className={`p-6 transition-all duration-300 ${
      isActive 
        ? "bg-white/90 backdrop-blur-sm border-blue-400 shadow-lg scale-[1.02]" 
        : "bg-white/70 backdrop-blur-sm border-white/20"
    }`}>
      <div className="space-y-6">
        {/* 维度标题 */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{dimension.name}</h3>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {isActive && (
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                  当前评价维度
                </Badge>
              )}
              {labels.map((label, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {label}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* LLM 判断结果 */}
        <div>
          <h4 className="text-md font-medium text-gray-800 mb-3">LLM 评判结果</h4>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-800 mb-1">判断结果</div>
              <div className="text-blue-700">
                {llmJudgement}
              </div>
            </div>
            {llmReasoning && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-800 mb-1">判断理由</div>
                <div className="text-gray-700 text-sm">
                  {llmReasoning}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 操作按钮 - 只在激活状态下显示 */}
        {isActive && (
          <div>
            <h4 className="text-md font-medium text-gray-800 mb-3">专家操作</h4>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <Button
                onClick={() => handleAction("agree")}
                className="bg-green-600 hover:bg-green-700"
                disabled={isPending}
                size="sm"
              >
                <Check className="w-4 h-4 mr-1" />
                同意 (A)
              </Button>
              <Button
                onClick={() => handleAction("disagree")}
                variant="destructive"
                disabled={isPending}
                size="sm"
              >
                <X className="w-4 h-4 mr-1" />
                反对 (D)
              </Button>
              <Button
                onClick={() => handleAction("skip")}
                variant="outline"
                disabled={isPending}
                size="sm"
              >
                <SkipForward className="w-4 h-4 mr-1" />
                跳过 (R)
              </Button>
            </div>

            {/* 反对意见输入 */}
            {showDisagreeInputs && (
              <div className="space-y-4 p-4 bg-red-50 rounded-lg border border-red-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    您的判断结果 <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    value={humanJudgement}
                    onChange={(e) => setHumanJudgement(e.target.value)}
                    placeholder="请输入您的判断结果..."
                    className="min-h-[60px]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    判断理由 <span className="text-gray-400 text-xs">(可选)</span>
                  </label>
                  <Textarea
                    value={humanReasoning}
                    onChange={(e) => setHumanReasoning(e.target.value)}
                    placeholder="请详细说明您的判断理由..."
                    className="min-h-[80px]"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSubmit}
                    className="flex-1"
                    disabled={!humanJudgement.trim() || isPending}
                    size="sm"
                  >
                    {isPending ? "提交中..." : "提交修正结果"}
                  </Button>
                  <Button
                    onClick={handleCancelDisagree}
                    variant="outline"
                    disabled={isPending}
                    size="sm"
                  >
                    取消
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
