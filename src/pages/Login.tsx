
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Twitch } from "lucide-react";

const Login = () => {
  const { signInWithTwitch, user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Redirect logic after login
  useEffect(() => {
    if (user) {
      console.log("✅ User logged in, redirecting to profile");
      navigate("/profile");
    }
  }, [user, navigate]);

  const handleTwitchLogin = async () => {
    setIsLoggingIn(true);
    try {
      const { error } = await signInWithTwitch();
      if (error) {
        console.error("Twitch login error:", error);
        toast({
          title: "Error",
          description: "No se pudo iniciar sesión con Twitch. Intenta de nuevo.",
          variant: "destructive",
        });
        setIsLoggingIn(false);
      }
      // Navigation will be handled by the useEffect above
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado. Intenta de nuevo.",
        variant: "destructive",
      });
      setIsLoggingIn(false);
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
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4"></div>
              <p className="text-muted-foreground">Verificando sesión...</p>
            </div>
          ) : (
            <Button 
              onClick={handleTwitchLogin} 
              className="w-full py-6 bg-[#9146FF] hover:bg-[#7a3dd1] text-white"
              size="lg"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></div>
                  Conectando...
                </>
              ) : (
                <>
                  <Twitch className="mr-2 h-5 w-5" />
                  Conectar con Twitch
                </>
              )}
            </Button>
          )}
          
          <p className="text-sm text-center text-muted-foreground">
            Al iniciar sesión, aceptas los términos y condiciones de Streamder.
          </p>
        </div>
      </div>
    </div>
  );
