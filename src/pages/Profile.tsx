import { useState, useEffect } from "react";
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
import { StreamSchedule } from "@/components/StreamSchedule";
import { StreamScheduleEditor } from "@/components/StreamScheduleEditor";

const Profile = () => {
  const { user, signOut } = useAuth();
  const { profile, setProfile } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    description: "",
    game: "",
    games: [] as string[],
    category: "",
    categories: [] as string[],
    stream_days: [] as string[],
    stream_time: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("❌ Error loading profile:", error.message);
        return;
      }

      const safeProfile = {
        ...data,
        games: Array.isArray(data.games) ? data.games : [],
        categories: Array.isArray(data.categories) ? data.categories : [],
        stream_days: Array.isArray(data.stream_days) ? data.stream_days : [],
      };

      setProfile(safeProfile);
      setFormData({
        username: safeProfile.username || "",
        description: safeProfile.description || "",
        game: "",
        games: safeProfile.games || [],
        category: "",
        categories: safeProfile.categories || [],
        stream_days: safeProfile.stream_days || [],
        stream_time: safeProfile.stream_time || "",
      });
    };

    fetchProfile();
  }, [user, setProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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

  const handleRemoveGame = (gameToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      games: prev.games.filter((game) => game !== gameToRemove),
    }));
  };

  const handleAddCategory = () => {
    if (!formData.category.trim()) return;

    if (!formData.categories.includes(formData.category)) {
      setFormData((prev) => ({
        ...prev,
        categories: [...prev.categories, formData.category],
        category: "",
      }));
    } else {
      toast({
        title: "Categoría duplicada",
        description: "Ya has añadido esta categoría",
        variant: "destructive",
      });
    }
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.filter((category) => category !== categoryToRemove),
    }));
  };

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
          categories: formData.categories,
          stream_days: formData.stream_days,
          stream_time: formData.stream_time,
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

      setProfile({
        ...profile!,
        username: formData.username,
        description: formData.description,
        games: formData.games,
        categories: formData.categories,
        stream_days: formData.stream_days,
        stream_time: formData.stream_time,
      });

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

  const handleLogout = async () => {
    await signOut();
  };

  if (!user || !profile) {
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
                <Label>Categorías</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.categories.map((category, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {category}
                      <button
                        type="button"
                        onClick={() => handleRemoveCategory(category)}
                        className="ml-1 h-4 w-4 rounded-full bg-muted-foreground/30 inline-flex items-center justify-center hover:bg-muted-foreground/50"
                      >
                        <span className="sr-only">Remove</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 6 6 18" />
                          <path d="m6 6 12 12" />
                        </svg>
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="Añadir categoría"
                  />
                  <Button type="button" variant="secondary" onClick={handleAddCategory} className="shrink-0">
                    Añadir
                  </Button>
                </div>
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
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 6 6 18" />
                          <path d="m6 6 12 12" />
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
                  <Button type="button" variant="secondary" onClick={handleAddGame} className="shrink-0">
                    Añadir
                  </Button>
                </div>
              </div>

              <StreamScheduleEditor
                streamDays={formData.stream_days}
                streamTime={formData.stream_time}
                onStreamDaysChange={(days) => setFormData(prev => ({ ...prev, stream_days: days }))}
                onStreamTimeChange={(time) => setFormData(prev => ({ ...prev, stream_time: time }))}
              />

              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={isLoading}>
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

              {profile.categories && profile.categories.length > 0 && (
                <div>
                  <h2 className="text-sm font-medium text-muted-foreground mb-2">Categorías</h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.categories.map((category, index) => (
                      <Badge key={index} variant="secondary">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {profile.games.length > 0 && (
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

              {(profile.stream_days?.length > 0 || profile.stream_time) && (
                <div>
                  <h2 className="text-sm font-medium text-muted-foreground mb-2">Horario</h2>
                  <StreamSchedule
                    days={profile.stream_days}
                    time={profile.stream_time}
                  />
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
                <Button onClick={() => setIsEditing(true)}>
                  Editar perfil
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
};

export default Profile;
