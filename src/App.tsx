
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import MultiDimensionSingleTurn from "./pages/MultiDimensionSingleTurn";
import MultiDimensionMultiTurn from "./pages/MultiDimensionMultiTurn";
import Analytics from "./pages/Analytics";
import Export from "./pages/Export";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/multi-dimension-single" element={<MultiDimensionSingleTurn />} />
          <Route path="/multi-dimension-multi" element={<MultiDimensionMultiTurn />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/export" element={<Export />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
