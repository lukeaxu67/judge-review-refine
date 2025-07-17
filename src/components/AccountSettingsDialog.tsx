
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Save, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AccountSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AccountSettingsDialog = ({ open, onOpenChange }: AccountSettingsDialogProps) => {
  const [account, setAccount] = useState("");
  const [description, setDescription] = useState("");
  const [fingerprint, setFingerprint] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // Load saved account settings from localStorage
    const savedAccount = localStorage.getItem("annotation_account");
    const savedDescription = localStorage.getItem("annotation_description");
    if (savedAccount) setAccount(savedAccount);
    if (savedDescription) setDescription(savedDescription);

    // Generate or get browser fingerprint
    generateFingerprint();
  }, []);

  const generateFingerprint = () => {
    let fp = localStorage.getItem("browser_fingerprint");
    if (!fp) {
      // Simple fingerprint generation based on browser characteristics
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      ctx!.textBaseline = 'top';
      ctx!.font = '14px Arial';
      ctx!.fillText('Browser fingerprint', 2, 2);
      
      const fingerprint = [
        navigator.userAgent,
        navigator.language,
        screen.width + 'x' + screen.height,
        new Date().getTimezoneOffset(),
        canvas.toDataURL()
      ].join('|');
      
      fp = btoa(fingerprint).substring(0, 16);
      localStorage.setItem("browser_fingerprint", fp);
    }
    setFingerprint(fp);
  };

  const handleSave = () => {
    localStorage.setItem("annotation_account", account);
    localStorage.setItem("annotation_description", description);
    
    toast({
      title: "设置已保存",
      description: "您的账户设置已成功保存到本地"
    });
    
    onOpenChange(false);
    
    console.log("Account settings updated:", {
      account,
      description,
      fingerprint,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="w-5 h-5 text-blue-600" />
            <span>账户设置</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="account">账户名称 (可选)</Label>
            <Input
              id="account"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              placeholder="请输入您的标注员名称或ID"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">描述信息 (可选)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="请输入描述信息，如标注经验、专业领域等"
              rows={3}
            />
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Info className="w-4 h-4 text-gray-500" />
              <Label className="text-sm font-medium text-gray-700">浏览器指纹</Label>
            </div>
            <div className="text-sm text-gray-600 font-mono bg-white p-2 rounded border">
              {fingerprint}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              用于识别您的标注记录，自动生成且唯一
            </p>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave} className="flex items-center space-x-2">
            <Save className="w-4 h-4" />
            <span>保存设置</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
