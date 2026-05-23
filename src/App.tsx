import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Archive from "@/pages/Archive";

const queryClient = new QueryClient();

type Page = "home" | "about" | "archive";

const App = () => {
  const [page, setPage] = useState<Page>("home");

  const renderPage = () => {
    if (page === "about") return <About />;
    if (page === "archive") return <Archive />;
    return <Home />;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Layout page={page} onNavigate={setPage}>
          {renderPage()}
        </Layout>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
