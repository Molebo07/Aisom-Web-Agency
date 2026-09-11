// NOTE: Two separate deployments.
//   Marketing site: aisom.co.za
//   This app:       app.aisom.co.za
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/app/ProtectedRoute";
import Landing from "./pages/Landing.tsx";
import Placeholder from "./pages/Placeholder.tsx";
import NotFound from "./pages/NotFound.tsx";
import AuthLogin from "./pages/AuthLogin.tsx";
import AuthSignup from "./pages/AuthSignup.tsx";
import AuthCallback from "./pages/AuthCallback.tsx";
import PayfastCheckout from "./pages/PayfastCheckout.tsx";
import Terms from "./pages/Terms.tsx";
import RefundPolicy from "./pages/RefundPolicy.tsx";

const queryClient = new QueryClient();

const protectedPlaceholder = (
  <ProtectedRoute>
    <Placeholder />
  </ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />

            {/* Auth — unchanged */}
            <Route path="/auth/login" element={<AuthLogin />} />
            <Route path="/auth/signup" element={<AuthSignup />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/login" element={<AuthLogin />} />

            {/* SCAFFOLD — app shell goes here */}
            <Route path="/app" element={protectedPlaceholder} />
            {/* SCAFFOLD — dashboard feature goes here */}
            <Route path="/app/dashboard" element={protectedPlaceholder} />
            {/* SCAFFOLD — study feature goes here */}
            <Route path="/app/study" element={protectedPlaceholder} />
            {/* SCAFFOLD — notes feature goes here */}
            <Route path="/app/notes" element={protectedPlaceholder} />
            {/* SCAFFOLD — flashcards feature goes here */}
            <Route path="/app/flashcards" element={protectedPlaceholder} />
            {/* SCAFFOLD — settings feature goes here */}
            <Route path="/app/settings" element={protectedPlaceholder} />

            {/* Payments — unchanged */}
            <Route path="/checkout" element={<PayfastCheckout />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
