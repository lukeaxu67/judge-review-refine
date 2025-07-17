import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Upload, Download, FileText, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";

interface FileDimension {
  name: string;
  annotationCount: number;
  firstAnnotation: string;
  lastAnnotation: string;
}

const Export = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileHash, setFileHash] = useState<string>("");
  const [dimensions, setDimensions] = useState<FileDimension[]>([]);
  const [selectedDimension, setSelectedDimension] = useState<string>("");
  const [exportFormat, setExportFormat] = useState<string>("csv");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"upload" | "select" | "export">("upload");

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setLoading(true);

    try {
      // Upload file to get hash
      const uploadResponse = await apiService.uploadFile(file);
      const fileId = uploadResponse?.data?.fileId;
      
      if (!fileId) {
        throw new Error("Failed to get file hash");
      }

      setFileHash(fileId);
      
      // Get available dimensions
      const dimensionsResponse = await apiService.getFileDimensions(fileId);
      console.log('Dimensions response:', dimensionsResponse);
      const dimensionsData = dimensionsResponse?.data?.dimensions || [];
      
      setDimensions(dimensionsData);
      
      if (dimensionsData.length === 0) {
        toast({
          title: "无标注数据",
          description: "该文件尚未有任何标注数据",
          variant: "destructive",
        });
        return;
      }

      setStep("select");
      toast({
        title: "文件上传成功",
        description: `找到 ${dimensionsData.length} 个维度的标注数据`,
      });

    } catch (error) {
      console.error("Failed to upload file:", error);
      toast({
        title: "文件上传失败",
        description: "请检查文件格式或网络连接",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!fileHash) return;

    setLoading(true);

    try {
      // Call export API
      const dimensionParam = selectedDimension === "__all__" ? "" : selectedDimension;
      const exportUrl = `/api/export?file_hash=${fileHash}&dimension=${dimensionParam}&format=${exportFormat}`;
      
      // Create download link
      const link = document.createElement('a');
      link.href = `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000'}${exportUrl}`;
      link.download = `annotations_${fileHash.substring(0, 8)}_${selectedDimension === "__all__" ? 'all' : selectedDimension}.${exportFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "导出成功",
        description: "标注数据已开始下载",
      });

      setStep("export");

    } catch (error) {
      console.error("Failed to export:", error);
      toast({
        title: "导出失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetProcess = () => {
    setSelectedFile(null);
    setFileHash("");
    setDimensions([]);
    setSelectedDimension("");
    setStep("upload");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-blue-100">
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
                <h1 className="text-xl font-bold text-gray-900">数据导出</h1>
                <p className="text-sm text-gray-600">Export Annotation Data</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        {/* Progress Steps */}
        <Card className="p-4 bg-white/70 backdrop-blur-sm border-white/20 mb-6">
          <div className="flex items-center justify-between">
            <div className={`flex items-center space-x-2 ${step === "upload" ? "text-blue-600" : step === "select" || step === "export" ? "text-green-600" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "upload" ? "bg-blue-100" : step === "select" || step === "export" ? "bg-green-100" : "bg-gray-100"}`}>
                {step === "select" || step === "export" ? <CheckCircle className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
              </div>
              <span className="font-medium">1. 上传文件</span>
            </div>
            
            <div className={`flex items-center space-x-2 ${step === "select" ? "text-blue-600" : step === "export" ? "text-green-600" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "select" ? "bg-blue-100" : step === "export" ? "bg-green-100" : "bg-gray-100"}`}>
                {step === "export" ? <CheckCircle className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
              </div>
              <span className="font-medium">2. 选择维度</span>
            </div>
            
            <div className={`flex items-center space-x-2 ${step === "export" ? "text-blue-600" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "export" ? "bg-blue-100" : "bg-gray-100"}`}>
                <Download className="w-4 h-4" />
              </div>
              <span className="font-medium">3. 导出数据</span>
            </div>
          </div>
        </Card>

        {/* Step 1: File Upload */}
        {step === "upload" && (
          <Card className="p-8 bg-white/70 backdrop-blur-sm border-white/20">
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-green-600" />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">上传标注文件</h2>
                <p className="text-gray-600">
                  上传您之前标注过的数据文件，系统将自动识别可用的维度
                </p>
              </div>

              <div className="max-w-md mx-auto">
                <Label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
                  选择文件
                </Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileSelect}
                  disabled={loading}
                />
                {selectedFile && (
                  <div className="mt-2 text-sm text-gray-600">
                    已选择: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </div>
                )}
              </div>

              {loading && (
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-sm text-gray-600">正在处理文件...</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Step 2: Dimension Selection */}
        {step === "select" && (
          <Card className="p-6 bg-white/70 backdrop-blur-sm border-white/20">
            <h2 className="text-lg font-semibold mb-4">选择导出维度</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="dimension-select" className="block text-sm font-medium text-gray-700 mb-2">
                  评价维度
                </Label>
                <Select value={selectedDimension} onValueChange={setSelectedDimension}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择要导出的维度" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">全部维度</SelectItem>
                    {dimensions.map((dim, index) => (
                      <SelectItem key={dim.name || `dim-${index}`} value={dim.name || `未命名维度-${index}`}>
                        {dim.name || "未命名维度"} ({dim.annotationCount} 条标注)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="format-select" className="block text-sm font-medium text-gray-700 mb-2">
                  导出格式
                </Label>
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV 格式</SelectItem>
                    {/* <SelectItem value="excel">Excel 格式</SelectItem> */}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Available Dimensions */}
            <div className="mt-6">
              <h3 className="text-md font-medium text-gray-900 mb-3">可用维度</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {dimensions.map((dim, index) => (
                  <div key={dim.name || `dim-${index}`} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{dim.name || "未命名维度"}</span>
                      <Badge variant="secondary" className="text-xs">
                        {dim.annotationCount} 条
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500">
                      最新标注: {new Date(dim.lastAnnotation).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={resetProcess}>
                重新选择文件
              </Button>
              <Button
                onClick={handleExport}
                disabled={loading}
                className="bg-gradient-to-r from-green-500 to-green-600"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    导出中...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    开始导出
                  </>
                )}
              </Button>
            </div>
          </Card>
        )}

        {/* Step 3: Export Complete */}
        {step === "export" && (
          <Card className="p-8 bg-white/70 backdrop-blur-sm border-white/20">
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">导出完成</h2>
                <p className="text-gray-600">
                  标注数据已成功导出，文件应该正在下载中
                </p>
              </div>

              <div className="max-w-md mx-auto space-y-3">
                <div className="text-sm text-gray-600">
                  <p><strong>文件:</strong> {selectedFile?.name}</p>
                  <p><strong>维度:</strong> {selectedDimension === "__all__" ? "全部维度" : selectedDimension}</p>
                  <p><strong>格式:</strong> {exportFormat.toUpperCase()}</p>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <Button variant="outline" onClick={resetProcess}>
                  导出其他文件
                </Button>
                <Button onClick={() => navigate("/")} className="bg-gradient-to-r from-blue-500 to-blue-600">
                  返回首页
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Export;