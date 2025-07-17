
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { User, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// 简化的用户信息管理，使用本地存储
const getLocalFingerprint = (): string => {
  let fingerprint = localStorage.getItem('user_fingerprint');
  if (!fingerprint) {
    fingerprint = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('user_fingerprint', fingerprint);
  }
  return fingerprint;
};

const getLocalAccount = (): string | null => {
  return localStorage.getItem('annotation_account');
};

const setLocalAccount = (account: string): void => {
  localStorage.setItem('annotation_account', account);
};

export const UserInfoDialog = () => {
  const [open, setOpen] = useState(false);
  const [account, setAccount] = useState("");
  const [fingerprint, setFingerprint] = useState("");
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadUserInfo = async () => {
      const userFingerprint = getLocalFingerprint();
      const userAccount = getLocalAccount();
      
      setFingerprint(userFingerprint);
      setCurrentAccount(userAccount);
      setAccount(userAccount || "");
      
      console.log('用户信息已加载:', { fingerprint: userFingerprint, account: userAccount });
    };
    
    loadUserInfo();
  }, []);

  const handleSaveAccount = async () => {
    if (!account.trim()) {
      toast({
        title: "错误",
        description: "请输入账号名称",
        variant: "destructive",
      });
      return;
    }

    try {
      setLocalAccount(account.trim());
      setCurrentAccount(account.trim());
      setOpen(false);
      
      console.log('账号信息已保存:', account.trim());
      
      toast({
        title: "成功",
        description: "账号信息已保存",
      });
    } catch (error) {
      console.error('保存账号失败:', error);
      toast({
        title: "错误",
        description: "保存失败，请重试",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center space-x-2">
          <User className="w-4 h-4" />
          <span>{currentAccount || "设置账号"}</span>
          <Settings className="w-3 h-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>用户信息</DialogTitle>
          <DialogDescription>
            设置您的账号名称，用于标识您的标注工作
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="fingerprint">用户标识</Label>
            <Input
              id="fingerprint"
              value={fingerprint}
              readOnly
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-500">
              用于唯一标识您的会话
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="account">账号名称 <span className="text-red-500">*</span></Label>
            <Input
              id="account"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              placeholder="请输入您的账号名称"
            />
            <p className="text-xs text-gray-500">
              必填项，用于标识和管理您的标注记录
            </p>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            取消
          </Button>
          <Button onClick={handleSaveAccount} disabled={!account.trim()}>
            保存
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
