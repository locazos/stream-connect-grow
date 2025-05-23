import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Explore from "./pages/Explore";
import Matches from "./pages/Matches";
import Profile from "./pages/Profile";
import SetupProfile from "./pages/SetupProfile";
import CompleteProfile from "./pages/complete-profile"; // Add import for CompleteProfile
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected route wrapper that also checks for profile completion
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    // Render a loading state while checking authentication
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }
  
  // If profile is incomplete and user is not on SetupProfile or CompleteProfile page, redirect to it
  if (
    profile && 
    (!profile.description || !profile.games || profile.games.length === 0) && 
    location.pathname !== "/setup-profile" &&
    location.pathname !== "/complete-profile"
  ) {
    return <Navigate to="/setup-profile" replace />;
  }
  
  return children;
};

// Public route wrapper (redirects to app if already logged in)
const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    // Render a loading state while checking authentication
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }
  
  if (user) {
    // Redirect to app if already authenticated
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Root App component
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public routes */}
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/register" 
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                } 
              />
              
              {/* Onboarding routes - special protection */}
              <Route 
                path="/setup-profile" 
                element={
                  <ProtectedRoute>
                    <SetupProfile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/complete-profile" 
                element={
                  <ProtectedRoute>
                    <CompleteProfile />
                  </ProtectedRoute>
                } 
              />
              
              {/* Protected routes */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Explore />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/matches" 
                element={
                  <ProtectedRoute>
                    <Matches />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              
              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
