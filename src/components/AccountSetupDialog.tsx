import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, User } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AccountSetupDialogProps {
  open: boolean;
  onAccountSet: (account: string) => void;
}

export const AccountSetupDialog = ({ open, onAccountSet }: AccountSetupDialogProps) => {
  const [account, setAccount] = useState("");
  const [description, setDescription] = useState("");
  const [fingerprint, setFingerprint] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      generateFingerprint();
    }
  }, [open]);

  const generateFingerprint = () => {
    let fp = localStorage.getItem("browser_fingerprint");
    if (!fp) {
      // 基于浏览器特征的简单指纹生成
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Browser fingerprint', 2, 2);
        
        const fingerprint = [
          navigator.userAgent,
          navigator.language,
          screen.width + 'x' + screen.height,
          new Date().getTimezoneOffset(),
          canvas.toDataURL()
        ].join('|');
        
        fp = btoa(fingerprint).substring(0, 16);
        localStorage.setItem("browser_fingerprint", fp);
      } else {
        // Fallback if canvas is not available
        fp = `fp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem("browser_fingerprint", fp);
      }
    }
    setFingerprint(fp);
  };

  const handleSubmit = async () => {
    if (!account.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // 保存到本地存储
      localStorage.setItem("annotation_account", account.trim());
      if (description.trim()) {
        localStorage.setItem("annotation_description", description.trim());
      }
      
      // 回调通知父组件
      onAccountSet(account.trim());
    } catch (error) {
      console.error("保存账号设置失败:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && account.trim()) {
      handleSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" hideCloseButton>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            设置账号名称
          </DialogTitle>
          <DialogDescription>
            请设置您的账号名称，这将用于标识您的标注工作。账号名称是必填项。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              账号名称将用于数据统计和分析，您可以随时修改。浏览器指纹用于技术识别，保持不变。
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <Label htmlFor="account">账号名称 <span className="text-red-500">*</span></Label>
              <Input
                id="account"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="请输入您的账号名称"
                className="mt-1"
                autoFocus
              />
            </div>

            <div>
              <Label htmlFor="description">描述信息 <span className="text-gray-400 text-xs">(可选)</span></Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="简单描述您的身份或专业背景..."
                className="mt-1 min-h-[60px]"
              />
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <Label className="text-sm font-medium text-gray-700">浏览器指纹</Label>
              <div className="text-xs text-gray-500 mt-1 font-mono bg-white px-2 py-1 rounded border">
                {fingerprint || "生成中..."}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                用于技术识别，自动生成并保存在浏览器中
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            onClick={handleSubmit} 
            disabled={!account.trim() || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "保存中..." : "确认设置"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};