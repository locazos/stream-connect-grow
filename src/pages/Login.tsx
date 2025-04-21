
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Twitch } from "lucide-react";

const Login = () => {
  const { signInWithTwitch, user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if user is already logged in and redirect accordingly
  useEffect(() => {
    if (user) {
      if (profile && (profile.description && profile.games && profile.games.length > 0)) {
        // Profile is complete, redirect to explore
        navigate("/");
      } else if (profile) {
        // Profile exists but is incomplete, redirect to setup
        navigate("/setup-profile");
      }
    }
  }, [user, profile, navigate]);

  const handleTwitchLogin = async () => {
    try {
      await signInWithTwitch();
      // Navigation will be handled by the useEffect above once user is set
    } catch (error) {
      console.error("Twitch login error:", error);
      toast({
        title: "Error",
        description: "No se pudo iniciar sesión con Twitch. Intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#9146FF] to-purple-400">
              Streamder
            </span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Conecta tu cuenta de Twitch para encontrar streamers con los que colaborar en Streamder.
          </p>
        </div>
        
        <div className="space-y-6">
          <Button 
            onClick={handleTwitchLogin} 
            className="w-full py-6 bg-[#9146FF] hover:bg-[#7a3dd1] text-white"
            size="lg"
          >
            <Twitch className="mr-2 h-5 w-5" />
            Conectar con Twitch
          </Button>
          
          <p className="text-sm text-center text-muted-foreground">
            Al iniciar sesión, aceptas los términos y condiciones de Streamder.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
