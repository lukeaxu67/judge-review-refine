import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Bot, Settings, Maximize2, Minimize2, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
// @ts-ignore
import remarkBreaks from "remark-breaks";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import mermaid from "mermaid";
import "katex/dist/katex.min.css";

interface DialogMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface DialogRendererProps {
  dialog: DialogMessage[];
  title?: string;
}

// Initialize mermaid
mermaid.initialize({
  startOnLoad: true,
  theme: "default",
  securityLevel: "loose",
  fontFamily: "inherit",
});

export const DialogRenderer = ({ dialog, title }: DialogRendererProps) => {
  const mermaidRef = useRef<number>(0);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    mermaid.run();
  }, [dialog]);

  // Handle ESC key to close maximized view
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMaximized) {
        setIsMaximized(false);
      }
    };

    if (isMaximized) {
      document.addEventListener('keydown', handleEsc);
      // Prevent body scroll when maximized
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isMaximized]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "system":
        return <Settings className="w-4 h-4" />;
      case "user":
        return <User className="w-4 h-4" />;
      case "assistant":
        return <Bot className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "system":
        return "bg-gray-100 border-gray-200";
      case "user":
        return "bg-blue-50 border-blue-200";
      case "assistant":
        return "bg-green-50 border-green-200";
      default:
        return "bg-gray-100 border-gray-200";
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case "system":
        return "系统";
      case "user":
        return "用户";
      case "assistant":
        return "助手";
      default:
        return role;
    }
  };

  const DialogContent = () => (
    // <div className={`space-y-3 ${isMaximized ? 'h-full overflow-y-auto p-6' : 'max-h-96 overflow-y-auto'}`}>
    <div className={`space-y-3 ${isMaximized ? 'h-full overflow-y-auto p-6' : 'overflow-y-auto'}`}>
      {dialog.map((message, index) => (
        <Card key={index} className={`${isMaximized ? 'p-6' : 'p-3'} border ${getRoleColor(message.role)} ${isMaximized ? 'shadow-sm' : ''}`}>
          <div className="flex items-center space-x-2 mb-2">
            {getRoleIcon(message.role)}
            <span className="text-sm font-medium capitalize">
              {getRoleName(message.role)}
            </span>
          </div>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown 
              remarkPlugins={[remarkMath, remarkGfm, remarkBreaks]}
              rehypePlugins={[rehypeKatex, rehypeRaw]}
              components={{
                // Paragraph with proper spacing
                p({ children }) {
                  return <p className="mb-4 leading-relaxed">{children}</p>;
                },
                // Code blocks with syntax highlighting
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  const language = match ? match[1] : '';
                  
                  // Handle mermaid diagrams
                  if (language === 'mermaid') {
                    const id = `mermaid-${mermaidRef.current++}`;
                    return (
                      <div className="my-4">
                        <pre id={id} className="mermaid">
                          {String(children).replace(/\n$/, '')}
                        </pre>
                      </div>
                    );
                  }
                  
                  return !inline && match ? (
                    <div className="my-4">
                      <SyntaxHighlighter
                        style={vscDarkPlus as any}
                        language={language}
                        PreTag="div"
                        className="rounded-md !my-0"
                        showLineNumbers={true}
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-sm" {...props}>
                      {children}
                    </code>
                  );
                },
                // Table components with better styling
                table({ children }) {
                  return (
                    <div className="overflow-x-auto my-4">
                      <table className="min-w-full divide-y divide-gray-300 border border-gray-300">
                        {children}
                      </table>
                    </div>
                  );
                },
                thead({ children }) {
                  return <thead className="bg-gray-50 dark:bg-gray-800">{children}</thead>;
                },
                tbody({ children }) {
                  return <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">{children}</tbody>;
                },
                tr({ children }) {
                  return <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">{children}</tr>;
                },
                th({ children }) {
                  return (
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border border-gray-300 dark:border-gray-600">
                      {children}
                    </th>
                  );
                },
                td({ children }) {
                  return (
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 whitespace-pre-wrap">
                      {children}
                    </td>
                  );
                },
                // Better heading styles
                h1({ children }) {
                  return <h1 className="text-2xl font-bold mt-6 mb-4 text-gray-900 dark:text-gray-100">{children}</h1>;
                },
                h2({ children }) {
                  return <h2 className="text-xl font-bold mt-5 mb-3 text-gray-900 dark:text-gray-100">{children}</h2>;
                },
                h3({ children }) {
                  return <h3 className="text-lg font-bold mt-4 mb-2 text-gray-900 dark:text-gray-100">{children}</h3>;
                },
                h4({ children }) {
                  return <h4 className="text-base font-bold mt-3 mb-2 text-gray-900 dark:text-gray-100">{children}</h4>;
                },
                h5({ children }) {
                  return <h5 className="text-sm font-bold mt-2 mb-1 text-gray-900 dark:text-gray-100">{children}</h5>;
                },
                h6({ children }) {
                  return <h6 className="text-sm font-bold mt-2 mb-1 text-gray-900 dark:text-gray-100">{children}</h6>;
                },
                // Lists with proper spacing
                ul({ children }) {
                  return <ul className="list-disc pl-6 my-4 space-y-2">{children}</ul>;
                },
                ol({ children }) {
                  return <ol className="list-decimal pl-6 my-4 space-y-2">{children}</ol>;
                },
                li({ children }) {
                  return <li className="leading-relaxed">{children}</li>;
                },
                // Blockquote
                blockquote({ children }) {
                  return (
                    <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 py-2 italic my-4 text-gray-700 dark:text-gray-300">
                      {children}
                    </blockquote>
                  );
                },
                // Links
                a({ children, href }) {
                  return (
                    <a href={href} className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  );
                },
                // Horizontal rule
                hr() {
                  return <hr className="my-6 border-gray-300 dark:border-gray-600" />;
                },
                // Strong/Bold
                strong({ children }) {
                  return <strong className="font-bold">{children}</strong>;
                },
                // Emphasis/Italic
                em({ children }) {
                  return <em className="italic">{children}</em>;
                },
              }}
            >
              {String(message.content)}
            </ReactMarkdown>
          </div>
        </Card>
      ))}
    </div>
  );

  const MaximizedView = () => (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white shadow-sm shrink-0">
        <h2 className="text-lg font-semibold text-gray-900">
          {title || "对话内容"}
        </h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMaximized(false)}
            className="flex items-center space-x-1"
          >
            <Minimize2 className="w-4 h-4" />
            <span>恢复</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMaximized(false)}
            className="p-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-hidden bg-gray-50">
        <div className="h-full max-w-6xl mx-auto px-4">
          <DialogContent />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="relative">
        {/* Maximize button */}
        <div className="absolute top-2 right-2 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMaximized(true)}
            className="p-2 opacity-70 hover:opacity-100"
            title="最大化查看 (ESC键关闭)"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
        
        <DialogContent />
      </div>
      
      {/* Portal for maximized view */}
      {isMaximized && createPortal(<MaximizedView />, document.body)}
    </>
  );
};