
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Upload, FileText, Settings2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FileUploadSection } from "@/components/annotation/FileUploadSection";
import { ColumnConfigSection } from "@/components/annotation/ColumnConfigSection";
import { AnnotationWorkspace } from "@/components/annotation/AnnotationWorkspace";
import { Dimension } from "@/types/api";

type AnnotationStep = "upload" | "config" | "annotate";

const MultiDimensionSingleTurn = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<AnnotationStep>("upload");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<any[]>([]);
  const [columnConfig, setColumnConfig] = useState<any>(null);
  const [dimensions, setDimensions] = useState<Dimension[]>([]);

  const generateProjectId = () => {
    if (!uploadedFile) return "multi-dimension-single-project";
    const timestamp = Date.now();
    const fileName = uploadedFile.name.replace(/\.[^/.]+$/, "");
    return `${fileName}-${timestamp}`;
  };

  const steps = [
    { key: "upload", title: "上传文件", icon: Upload },
    { key: "config", title: "配置维度", icon: Settings2 },
    { key: "annotate", title: "开始标注", icon: FileText }
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.key === currentStep);
  };

  const handleFileUploaded = (file: File, data: any[]) => {
    setUploadedFile(file);
    setFileData(data);
    setCurrentStep("config");
    
    console.log("Multi-dimension single-turn file uploaded:", {
      filename: file.name,
      size: file.size,
      dataLength: data.length,
      sampleData: data.slice(0, 3),
      timestamp: new Date().toISOString()
    });
  };

  const handleConfigComplete = (config: any) => {
    setColumnConfig(config);
    
    // 从配置中提取维度信息
    const extractedDimensions: Dimension[] = [];
    if (config.dimensions && Array.isArray(config.dimensions)) {
      extractedDimensions.push(...config.dimensions);
    }
    
    setDimensions(extractedDimensions);
    setCurrentStep("annotate");
    
    console.log("Multi-dimension single-turn config completed:", {
      config,
      dimensions: extractedDimensions,
      filename: uploadedFile?.name,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>返回首页</span>
              </Button>
              <div className="w-px h-6 bg-gray-300" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">多维度单轮对话标注</h1>
                <p className="text-sm text-gray-600">Multi-dimension Single-turn Dialogue Annotation</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="container mx-auto px-6 py-6">
        <Card className="p-6 bg-white/70 backdrop-blur-sm border-white/20 mb-6">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.key} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                  index <= getCurrentStepIndex() 
                    ? "bg-emerald-600 border-emerald-600 text-white" 
                    : "border-gray-300 text-gray-400"
                }`}>
                  <step.icon className="w-5 h-5" />
                </div>
                <div className="ml-3">
                  <div className={`text-sm font-medium ${
                    index <= getCurrentStepIndex() ? "text-emerald-600" : "text-gray-400"
                  }`}>
                    {step.title}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-px mx-4 ${
                    index < getCurrentStepIndex() ? "bg-emerald-600" : "bg-gray-300"
                  }`} />
                )}
              </div>
            ))}
          </div>
          <Progress value={(getCurrentStepIndex() + 1) / steps.length * 100} className="h-2" />
        </Card>

        {/* Step Content */}
        {currentStep === "upload" && (
          <FileUploadSection 
            onFileUploaded={handleFileUploaded}
            annotationType="multi-dimension-single"
          />
        )}

        {currentStep === "config" && uploadedFile && fileData.length > 0 && (
          <ColumnConfigSection
            file={uploadedFile}
            data={fileData}
            annotationType="multi-dimension-single"
            onConfigComplete={handleConfigComplete}
          />
        )}

        {currentStep === "annotate" && columnConfig && (
          <AnnotationWorkspace
            file={uploadedFile!}
            data={fileData}
            config={columnConfig}
            annotationType="multi-dimension-single"
            projectId={generateProjectId()}
            dimensions={dimensions}
          />
        )}
      </div>
    </div>
  );
};

export default MultiDimensionSingleTurn;
