import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AvatarWithFallback } from "@/components/ui/avatar-with-fallback";
import { StreamSchedule } from "@/components/StreamSchedule";

const POPULAR_GAMES = [
  "Fortnite", "Minecraft", "Call of Duty", "League of Legends", 
  "Valorant", "Apex Legends", "GTA V", "Among Us", "PUBG",
  "Dota 2", "CS:GO", "Overwatch", "Fall Guys", "Rocket League"
];

const SetupProfile = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [description, setDescription] = useState("");
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [customGame, setCustomGame] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  
  // Pre-fill form if profile exists
  useEffect(() => {
    if (profile) {
      if (profile.description) setDescription(profile.description);
      if (profile.games && profile.games.length > 0) setSelectedGames(profile.games);
      if (profile.stream_days) setSelectedDays(profile.stream_days);
      if (profile.stream_start_time) setStartTime(profile.stream_start_time);
      if (profile.stream_end_time) setEndTime(profile.stream_end_time);
    }
  }, [profile]);
  
  const toggleGame = (game: string) => {
    if (selectedGames.includes(game)) {
      setSelectedGames(selectedGames.filter(g => g !== game));
    } else {
      setSelectedGames([...selectedGames, game]);
    }
  };
  
  const addCustomGame = () => {
    if (customGame.trim() && !selectedGames.includes(customGame.trim())) {
      setSelectedGames([...selectedGames, customGame.trim()]);
      setCustomGame("");
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para completar tu perfil",
        variant: "destructive",
      });
      return;
    }
    
    if (!description) {
      toast({
        title: "Error",
        description: "Por favor, añade una descripción a tu perfil",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedGames.length === 0) {
      toast({
        title: "Error",
        description: "Por favor, selecciona al menos un juego",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          description,
          games: selectedGames,
          stream_days: selectedDays,
          stream_start_time: startTime,
          stream_end_time: endTime,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      
      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Error",
          description: "No se pudo actualizar tu perfil. Intenta de nuevo.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Perfil actualizado",
          description: "Tu perfil ha sido actualizado correctamente",
        });
        navigate("/profile");
      }
    } catch (error) {
      console.error('Error in form submission:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (!profile) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center p-6 bg-background">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-[100dvh] items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Completa tu perfil
          </h1>
          <p className="text-muted-foreground">
            Solo necesitamos un poco más de información para comenzar a conectarte con otros streamers
          </p>
          
          <div className="flex justify-center py-6">
            <AvatarWithFallback 
              src={profile.avatar_url} 
              username={profile.username}
              className="h-24 w-24"
            />
          </div>
          
          <div className="text-lg font-medium">{profile.username}</div>
        </div>
        
        <form className="space-y-8" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Label htmlFor="description">Descripción de tu canal</Label>
            <Textarea
              id="description"
              placeholder="Cuéntanos sobre tu canal, qué tipo de contenido creas y qué buscas en una colaboración..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[120px]"
              required
            />
          </div>
          
          <div className="space-y-4">
            <Label>Juegos que juegas</Label>
            <div className="flex flex-wrap gap-2 mb-4">
              {POPULAR_GAMES.map((game) => (
                <Button
                  key={game}
                  type="button"
                  variant={selectedGames.includes(game) ? "default" : "outline"}
                  onClick={() => toggleGame(game)}
                  className="mr-2 mb-2"
                >
                  {game}
                </Button>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Input
                placeholder="Añadir otro juego..."
                value={customGame}
                onChange={(e) => setCustomGame(e.target.value)}
              />
              <Button 
                type="button" 
                onClick={addCustomGame}
                disabled={!customGame.trim()}
              >
                Añadir
              </Button>
            </div>
          </div>

          <StreamSchedule
            selectedDays={selectedDays}
            startTime={startTime}
            endTime={endTime}
            onDaysChange={setSelectedDays}
            onTimeChange={(type, value) => {
              if (type === "start") setStartTime(value);
              else setEndTime(value);
            }}
          />
          
          <Button 
            type="submit" 
            className="w-full h-12 text-base" 
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar perfil"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SetupProfile;
