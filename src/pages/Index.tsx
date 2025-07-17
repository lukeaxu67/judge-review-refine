
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { BarChart3, FileText, Brain, Layers, Network, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { AccountSettingsDialog } from "@/components/AccountSettingsDialog";
import { UserInfoDialog } from "@/components/UserInfoDialog";
import { AccountSetupDialog } from "@/components/AccountSetupDialog";

const Index = () => {
  const navigate = useNavigate();
  const [showAccountDialog, setShowAccountDialog] = useState(false);
  const [showAccountSetup, setShowAccountSetup] = useState(false);
  const [hasAccount, setHasAccount] = useState(false);

  useEffect(() => {
    // 检查是否已设置账号
    const savedAccount = localStorage.getItem("annotation_account");
    if (savedAccount && savedAccount.trim()) {
      setHasAccount(true);
    } else {
      setShowAccountSetup(true);
    }
  }, []);

  const handleAccountSet = (account: string) => {
    setHasAccount(true);
    setShowAccountSetup(false);
  };

  const navigationItems = [
    {
      title: "单轮对话评分审核",
      description: "机器预评，专家审核单轮对话",
      icon: Layers,
      route: "/multi-dimension-single",
      color: "from-emerald-500 to-emerald-600",
      status: "ready"
    },
    {
      title: "多轮对话评分审核",
      description: "机器预评，专家审核多轮对话",
      icon: Network,
      route: "/multi-dimension-multi",
      color: "from-orange-500 to-orange-600",
      status: "ready"
    },
    {
      title: "统计分析",
      description: "查看标注进度和结果统计分析",
      icon: BarChart3,
      route: "/analytics",
      color: "from-purple-500 to-purple-600",
      status: "ready"
    },
    {
      title: "数据导出",
      description: "导出标注数据为CSV格式",
      icon: Download,
      route: "/export",
      color: "from-indigo-500 to-indigo-600",
      status: "ready"
    },
    // {
    //   title: "批量分析",
    //   description: "批量数据处理和深度分析工具",
    //   icon: FileText,
    //   route: "/batch-analysis",
    //   color: "from-red-500 to-red-600",
    //   status: "coming-soon"
    // }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Brain className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">评测结果复审</h1>
                <p className="text-sm text-gray-600">LLM as a Judge 机器预评，专家复审</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <UserInfoDialog />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {navigationItems.map((item, index) => (
            <Card 
              key={index}
              className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-white/70 backdrop-blur-sm border-white/20"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              <div className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  {item.status === "coming-soon" && (
                    <Badge variant="secondary" className="text-xs">
                      即将推出
                    </Badge>
                  )}
                  {item.status === "ready" && (
                    <Badge className="text-xs bg-green-100 text-green-700 hover:bg-green-100">
                      可用
                    </Badge>
                  )}
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {item.description}
                </p>
                
                <Button 
                  className={`w-full bg-gradient-to-r ${item.color} hover:shadow-lg transition-all duration-300 border-0`}
                  onClick={() => item.status === "ready" && navigate(item.route)}
                  disabled={item.status === "coming-soon"}
                >
                  {item.status === "ready" ? "开始" : "敬请期待"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <AccountSettingsDialog 
        open={showAccountDialog}
        onOpenChange={setShowAccountDialog}
      />
      
      <AccountSetupDialog 
        open={showAccountSetup}
        onAccountSet={handleAccountSet}
      />
    </div>
  );
};

export default Index;
