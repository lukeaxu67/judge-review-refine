import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, FileText, Search } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface AuxiliaryInfoProps {
  currentItem: any;
}

export const AuxiliaryInfo = ({ currentItem }: AuxiliaryInfoProps) => {
  const [contextOpen, setContextOpen] = useState(true);
  const [referenceOpen, setReferenceOpen] = useState(true);

  // Find context column
  const contextColumn = Object.keys(currentItem).find(key => {
    const lower = key.toLowerCase();
    return lower === 'context' || lower === '上下文' || lower === '搜索结果';
  });

  // Find reference column
  const referenceColumn = Object.keys(currentItem).find(key => {
    const lower = key.toLowerCase();
    return lower === 'refer' || lower === 'reference' || lower === 'refer_answer' || lower === '参考答案' || lower === '参考';
  });

  if (!contextColumn && !referenceColumn) {
    return null;
  }

  const renderJsonContent = (content: any) => {
    // Handle different data types
    if (content === null || content === undefined) {
      return (
        <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-500">
          (无内容)
        </div>
      );
    }
    
    // If content is already an object/array, render it directly
    if (typeof content === 'object') {
      return (
        <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
          {JSON.stringify(content, null, 2)}
        </pre>
      );
    }
    
    // Convert to string and try to parse as JSON
    const contentStr = String(content);
    try {
      const parsed = JSON.parse(contentStr);
      return (
        <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
          {JSON.stringify(parsed, null, 2)}
        </pre>
      );
    } catch {
      // If JSON parsing fails, render as text with proper line breaks
      return (
        <div className="bg-gray-50 p-4 rounded-lg text-sm whitespace-pre-wrap break-words">
          {contentStr}
        </div>
      );
    }
  };

  return (
    <div className="mt-6 space-y-4 border-t pt-4">
      {/* Context Section */}
      {contextColumn && currentItem[contextColumn] && (
        <Collapsible open={contextOpen} onOpenChange={setContextOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-3 h-auto">
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4" />
                <span className="font-medium">上下文</span>
              </div>
              {contextOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Card className="p-4 mt-2">
              {renderJsonContent(currentItem[contextColumn])}
            </Card>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Reference Section */}
      {referenceColumn && currentItem[referenceColumn] && (
        <Collapsible open={referenceOpen} onOpenChange={setReferenceOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-3 h-auto">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span className="font-medium">参考答案</span>
              </div>
              {referenceOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Card className="p-4 mt-2">
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {String(currentItem[referenceColumn])}
                </ReactMarkdown>
              </div>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};