
import { useState } from "react";
import { MobileLayout } from "@/components/MobileLayout";
import { AvatarWithFallback } from "@/components/ui/avatar-with-fallback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import useStore from "@/store/useStore";
import { supabase } from "@/lib/supabase";

const Profile = () => {
  const { user, signOut } = useAuth();
  const { profile, setProfile } = useStore();
  import { useEffect } from "react";

useEffect(() => {
  const fetchProfile = async () => {
    if (!user || profile) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("❌ Error loading profile:", error.message);
      return;
    }

    setProfile(data);
  };

  fetchProfile();
}, [user, profile, setProfile]);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: profile?.username || "",
    description: profile?.description || "",
    game: "",
    games: profile?.games || [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Handle form input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  // Add a game to the list
  const handleAddGame = () => {
    if (!formData.game.trim()) return;
    
    if (!formData.games.includes(formData.game)) {
      setFormData((prev) => ({
        ...prev,
        games: [...prev.games, formData.game],
        game: "",
      }));
    } else {
      toast({
        title: "Juego duplicado",
        description: "Ya has añadido este juego",
        variant: "destructive",
      });
    }
  };
  
  // Remove a game from the list
  const handleRemoveGame = (gameToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      games: prev.games.filter((game) => game !== gameToRemove),
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username: formData.username,
          description: formData.description,
          games: formData.games,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
      
      if (error) {
        console.error("Error updating profile:", error);
        toast({
          title: "Error",
          description: "No se pudo actualizar el perfil",
          variant: "destructive",
        });
        return;
      }
      
      // Update profile in store
      if (profile) {
        setProfile({
          ...profile,
          username: formData.username,
          description: formData.description,
          games: formData.games,
          updated_at: new Date().toISOString(),
        });
      }
      
      toast({
        title: "Perfil actualizado",
        description: "Tu perfil ha sido actualizado correctamente",
      });
      
      setIsEditing(false);
      
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle logout
  const handleLogout = async () => {
    await signOut();
  };
  
  if (!profile) {
    return (
      <MobileLayout>
        <div className="flex flex-col items-center justify-center h-screen text-white">
          <p>📄 Cargando perfil...</p>
        </div>
      </MobileLayout>
    );
  }
    
  return (
    <MobileLayout>
      <div className="p-4 max-w-md mx-auto">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <AvatarWithFallback
              src={profile.avatar_url}
              username={profile.username}
              className="h-24 w-24"
            />
          </div>
          
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Nombre de usuario</Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Tu nombre de usuario"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Cuéntanos sobre ti y tu canal"
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Juegos</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.games.map((game, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {game}
                      <button
                        type="button"
                        onClick={() => handleRemoveGame(game)}
                        className="ml-1 h-4 w-4 rounded-full bg-muted-foreground/30 inline-flex items-center justify-center hover:bg-muted-foreground/50"
                      >
                        <span className="sr-only">Remove</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M18 6 6 18"></path>
                          <path d="m6 6 12 12"></path>
                        </svg>
                      </button>
                    </Badge>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Input
                    id="game"
                    name="game"
                    value={formData.game}
                    onChange={handleChange}
                    placeholder="Añadir juego"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleAddGame}
                    className="shrink-0"
                  >
                    Añadir
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Guardando..." : "Guardar cambios"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold">{profile.username}</h1>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>
              
              {profile.games && profile.games.length > 0 && (
                <div>
                  <h2 className="text-sm font-medium text-muted-foreground mb-2">Juegos</h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.games.map((game, index) => (
                      <Badge key={index} variant="secondary">
                        {game}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <h2 className="text-sm font-medium text-muted-foreground mb-2">Descripción</h2>
                <p className="text-sm bg-muted/50 p-3 rounded-md">
                  {profile.description || "Sin descripción"}
                </p>
              </div>
              
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={handleLogout}>
                  Cerrar sesión
                </Button>
                <Button onClick={() => setIsEditing(true)}>Editar perfil</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
};

export default Profile;
