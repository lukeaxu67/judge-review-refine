
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Upload, BarChart3, PieChart, TrendingUp, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface FileDimension {
  name: string;
  annotationCount: number;
  firstAnnotation: string;
  lastAnnotation: string;
}

const Analytics = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileHash, setFileHash] = useState<string>("");
  const [dimensions, setDimensions] = useState<FileDimension[]>([]);
  const [selectedDimension, setSelectedDimension] = useState<string>("");
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"upload" | "select" | "results">("upload");

  const pieData = analyticsData ? [
    { name: "同意", value: analyticsData.agreed || 0, color: "#10B981" },
    { name: "不同意", value: analyticsData.disagreed || 0, color: "#EF4444" },
    { name: "跳过", value: analyticsData.skipped || 0, color: "#6B7280" }
  ] : [];

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

  const handleAnalyze = async () => {
    if (!fileHash) return;

    setLoading(true);

    try {
      const dimensionParam = selectedDimension === "__all__" ? undefined : selectedDimension;
      const statsResponse = await apiService.getAnalyticsStats(fileHash, dimensionParam);
      const stats = statsResponse;
      
      if (!stats) {
        throw new Error("No analytics data found");
      }

      console.log("Analytics data received:", stats);
      setAnalyticsData(stats);
      setStep("results");
      
      toast({
        title: "分析完成",
        description: `共分析了 ${stats.completed} 条标注数据`,
      });

    } catch (error) {
      console.error("Failed to get analytics:", error);
      toast({
        title: "分析失败",
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
    setAnalyticsData(null);
    setStep("upload");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100">
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
                <h1 className="text-xl font-bold text-gray-900">统计分析</h1>
                <p className="text-sm text-gray-600">Annotation Statistics & Analytics</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        {/* Progress Steps */}
        <Card className="p-4 bg-white/70 backdrop-blur-sm border-white/20 mb-6">
          <div className="flex items-center justify-between">
            <div className={`flex items-center space-x-2 ${step === "upload" ? "text-blue-600" : step === "select" || step === "results" ? "text-green-600" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "upload" ? "bg-blue-100" : step === "select" || step === "results" ? "bg-green-100" : "bg-gray-100"}`}>
                {step === "select" || step === "results" ? <CheckCircle className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
              </div>
              <span className="font-medium">1. 上传文件</span>
            </div>
            
            <div className={`flex items-center space-x-2 ${step === "select" ? "text-blue-600" : step === "results" ? "text-green-600" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "select" ? "bg-blue-100" : step === "results" ? "bg-green-100" : "bg-gray-100"}`}>
                {step === "results" ? <CheckCircle className="w-4 h-4" /> : <BarChart3 className="w-4 h-4" />}
              </div>
              <span className="font-medium">2. 选择维度</span>
            </div>
            
            <div className={`flex items-center space-x-2 ${step === "results" ? "text-blue-600" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "results" ? "bg-blue-100" : "bg-gray-100"}`}>
                <PieChart className="w-4 h-4" />
              </div>
              <span className="font-medium">3. 查看分析</span>
            </div>
          </div>
        </Card>

        {/* Step 1: File Upload */}
        {step === "upload" && (
          <Card className="p-8 bg-white/70 backdrop-blur-sm border-white/20">
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-purple-600" />
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
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                  <p className="mt-2 text-sm text-gray-600">正在处理文件...</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Step 2: Dimension Selection */}
        {step === "select" && (
          <Card className="p-6 bg-white/70 backdrop-blur-sm border-white/20">
            <h2 className="text-lg font-semibold mb-4">选择分析维度</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="dimension-select" className="block text-sm font-medium text-gray-700 mb-2">
                  评价维度
                </Label>
                <Select value={selectedDimension} onValueChange={setSelectedDimension}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择要分析的维度" />
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
                onClick={handleAnalyze}
                disabled={loading}
                className="bg-gradient-to-r from-purple-500 to-purple-600"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    分析中...
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    开始分析
                  </>
                )}
              </Button>
            </div>
          </Card>
        )}

        {/* Step 3: Analytics Results */}
        {step === "results" && analyticsData && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {analyticsData?.completed || 0}
                    </div>
                    <div className="text-sm text-blue-700">总标注数</div>
                  </div>
                  <BarChart3 className="w-8 h-8 text-blue-500" />
                </div>
              </Card>

              <Card className="p-4 bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {analyticsData?.agreed || 0}
                    </div>
                    <div className="text-sm text-green-700">同意数量</div>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
              </Card>

              <Card className="p-4 bg-gradient-to-r from-red-50 to-red-100 border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {analyticsData?.disagreed || 0}
                    </div>
                    <div className="text-sm text-red-700">不同意数量</div>
                  </div>
                  <PieChart className="w-8 h-8 text-red-500" />
                </div>
              </Card>

              <Card className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-gray-600">
                      {analyticsData?.skipped || 0}
                    </div>
                    <div className="text-sm text-gray-700">跳过数量</div>
                  </div>
                  <Upload className="w-8 h-8 text-gray-500" />
                </div>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pie Chart */}
              <Card className="p-6 bg-white/70 backdrop-blur-sm border-white/20">
                <h3 className="text-lg font-semibold mb-4">标注结果分布</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </Card>

              {/* Bar Chart */}
              <Card className="p-6 bg-white/70 backdrop-blur-sm border-white/20">
                <h3 className="text-lg font-semibold mb-4">标注员统计</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData?.byAnnotator || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="agree" fill="#10B981" name="同意" />
                    <Bar dataKey="disagree" fill="#EF4444" name="不同意" />
                    <Bar dataKey="skip" fill="#6B7280" name="跳过" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Detailed Table */}
            <Card className="p-6 bg-white/70 backdrop-blur-sm border-white/20">
              <h3 className="text-lg font-semibold mb-4">详细统计</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">标注员</th>
                      <th className="text-right p-2">同意</th>
                      <th className="text-right p-2">不同意</th>
                      <th className="text-right p-2">跳过</th>
                      <th className="text-right p-2">总计</th>
                      <th className="text-right p-2">同意率</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(analyticsData?.byAnnotator || []).map((annotator: any, index: number) => {
                      const total = annotator?.total || 0;
                      const agree = annotator?.agree || 0;
                      const agreeRate = total > 0 ? ((agree / total) * 100).toFixed(1) : "0.0";
                      
                      return (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium">{annotator?.name || "未知标注员"}</td>
                          <td className="p-2 text-right text-green-600">{annotator?.agree || 0}</td>
                          <td className="p-2 text-right text-red-600">{annotator?.disagree || 0}</td>
                          <td className="p-2 text-right text-gray-600">{annotator?.skip || 0}</td>
                          <td className="p-2 text-right font-medium">{total}</td>
                          <td className="p-2 text-right">{agreeRate}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <Button variant="outline" onClick={resetProcess}>
                分析其他文件
              </Button>
              <Button onClick={() => navigate("/")} className="bg-gradient-to-r from-blue-500 to-blue-600">
                返回首页
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
