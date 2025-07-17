
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DimensionCard } from "./DimensionCard";
import { Dimension } from "@/types/api";

interface MultiDimensionCardStackProps {
  dimensions: Dimension[];
  currentItem: any;
  currentDimensionIndex: number;
  onAction: (action: "agree" | "disagree" | "skip", dimension: string, judgement?: string, reasoning?: string) => void;
  onDimensionChange: (index: number) => void;
  isPending: boolean;
  showDisagreeInputs?: boolean;
  onShowDisagreeInputsChange?: (show: boolean) => void;
}

export const MultiDimensionCardStack = ({ 
  dimensions, 
  currentItem, 
  currentDimensionIndex,
  onAction, 
  onDimensionChange,
  isPending,
  showDisagreeInputs = false,
  onShowDisagreeInputsChange
}: MultiDimensionCardStackProps) => {
  const handlePrevious = () => {
    const newIndex = Math.max(0, currentDimensionIndex - 1);
    onDimensionChange(newIndex);
  };

  const handleNext = () => {
    const newIndex = Math.min(dimensions.length - 1, currentDimensionIndex + 1);
    onDimensionChange(newIndex);
  };

  const handleDimensionAction = (action: "agree" | "disagree" | "skip", dimension: string, judgement?: string, reasoning?: string) => {
    onAction(action, dimension, judgement, reasoning);
  };

  if (dimensions.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-gray-500">没有配置的评估维度</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* 维度导航 */}
      <Card className="p-4 bg-white/70 backdrop-blur-sm border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              onClick={handlePrevious}
              disabled={currentDimensionIndex === 0 || isPending}
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="w-4 h-4" />
              上一个
            </Button>
            
            <div className="text-center">
              <div className="text-sm text-gray-600">
                维度 {currentDimensionIndex + 1} / {dimensions.length}
              </div>
              <div className="font-medium text-gray-900">
                {dimensions[currentDimensionIndex]?.name}
              </div>
            </div>
            
            <Button
              onClick={handleNext}
              disabled={currentDimensionIndex === dimensions.length - 1 || isPending}
              variant="outline"
              size="sm"
            >
              下一个
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          
          {/* 进度指示器 */}
          <div className="flex space-x-2">
            {dimensions.map((_, index) => (
              <button
                key={index}
                onClick={() => onDimensionChange(index)}
                disabled={isPending}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentDimensionIndex
                    ? "bg-blue-600"
                    : index < currentDimensionIndex
                    ? "bg-green-600"
                    : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      </Card>

      {/* 当前维度卡片 */}
      <div className="relative">
        {/* 背景卡片 - 营造堆叠效果 */}
        {currentDimensionIndex < dimensions.length - 1 && (
          <div className="absolute top-2 left-2 right-0 bottom-0 bg-white/40 rounded-lg border border-white/30 backdrop-blur-sm" />
        )}
        {currentDimensionIndex < dimensions.length - 2 && (
          <div className="absolute top-4 left-4 right-0 bottom-0 bg-white/20 rounded-lg border border-white/20 backdrop-blur-sm" />
        )}
        
        {/* 当前激活的卡片 */}
        <div className="relative z-10">
          <DimensionCard
            dimension={dimensions[currentDimensionIndex]}
            currentItem={currentItem}
            isActive={true}
            onAction={handleDimensionAction}
            isPending={isPending}
            showDisagreeInputs={showDisagreeInputs}
            onShowDisagreeInputsChange={onShowDisagreeInputsChange}
          />
        </div>
      </div>
    </div>
  );
};
