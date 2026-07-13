import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/app/ProtectedRoute";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import AuthLogin from "./pages/AuthLogin.tsx";
import AuthSignup from "./pages/AuthSignup.tsx";
import AuthCallback from "./pages/AuthCallback.tsx";
import Onboarding from "./pages/Onboarding.tsx";
import AppLayout from "./components/app/AppLayout.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Cards from "./pages/Cards.tsx";
import NewCard from "./pages/NewCard.tsx";
import SearchPage from "./pages/SearchPage.tsx";
import Projects from "./pages/Projects.tsx";
import SettingsPage from "./pages/SettingsPage.tsx";
import PayfastCheckout from "./pages/PayfastCheckout.tsx";
import Terms from "./pages/Terms.tsx";
import RefundPolicy from "./pages/RefundPolicy.tsx";
import WorkspaceMembers from "./pages/WorkspaceMembers.tsx";
import { WorkspaceProvider } from "@/hooks/useWorkspace";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <WorkspaceProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth/login" element={<AuthLogin />} />
            <Route path="/auth/signup" element={<AuthSignup />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/login" element={<AuthLogin />} />
            <Route
              path="/app/onboarding"
              element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="cards" element={<Cards />} />
              <Route path="cards/new" element={<NewCard />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="projects" element={<Projects />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="workspace" element={<WorkspaceMembers />} />
            </Route>
            <Route path="/checkout" element={<PayfastCheckout />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </WorkspaceProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
