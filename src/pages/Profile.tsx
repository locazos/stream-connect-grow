
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

const daysOfWeek = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

const topCategories = [
  "Just Chatting",
  "League of Legends",
  "Fortnite",
  "Valorant",
  "Minecraft",
  "Counter-Strike",
  "Call of Duty",
  "GTA V",
];

const Profile = () => {
  const { user, signOut } = useAuth();
  const { profile, setProfile } = useStore();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    description: "",
    game: "",
    games: [],
    categories: [],
    stream_days: [],
    start_time: "",
    end_time: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || "",
        description: profile.description || "",
        game: "",
        games: Array.isArray(profile.games) ? profile.games : [],
        categories: Array.isArray(profile.categories) ? profile.categories : [],
        stream_days: Array.isArray(profile.stream_days) ? profile.stream_days : [],
        start_time: profile.start_time || "",
        end_time: profile.end_time || "",
      });
    }
  }, [profile]);

  const handleChange = (e: any) => {
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

  const handleRemoveItem = (field: "games" | "categories" | "stream_days", value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((item: string) => item !== value),
    }));
  };

  const handleAddCategory = (category: string) => {
    if (!formData.categories.includes(category)) {
      setFormData((prev) => ({
        ...prev,
        categories: [...prev.categories, category],
      }));
    }
  };

  const handleToggleDay = (day: string) => {
    if (formData.stream_days.includes(day)) {
      handleRemoveItem("stream_days", day);
    } else {
      setFormData((prev) => ({
        ...prev,
        stream_days: [...prev.stream_days, day],
      }));
    }
  };

  const handleSubmit = async (e: any) => {
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
          start_time: formData.start_time,
          end_time: formData.end_time,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        console.error("Error updating profile:", error);
        toast({ title: "Error", description: "No se pudo actualizar el perfil", variant: "destructive" });
        return;
      }

      setProfile({
        ...profile!,
        username: formData.username,
        description: formData.description,
        games: formData.games,
        categories: formData.categories,
        stream_days: formData.stream_days,
        start_time: formData.start_time,
        end_time: formData.end_time,
        updated_at: new Date().toISOString(),
      });

      toast({ title: "Perfil actualizado", description: "Tu perfil ha sido actualizado correctamente" });
      setIsEditing(false);
    } catch (error) {
      console.error("Error en handleSubmit:", error);
      toast({ title: "Error", description: "Ocurrió un error inesperado", variant: "destructive" });
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
            <AvatarWithFallback src={profile.avatar_url} username={profile.username} className="h-24 w-24" />
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label>Nombre de usuario</Label>
                <Input value={formData.username} disabled />
              </div>

              <div className="space-y-2">
                <Label>Descripción</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Cuéntanos sobre ti y tu canal"
                  rows={3}
                />
              </div>

              {/* Juegos */}
              <div className="space-y-2">
                <Label>Juegos principales</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.games.map((game, idx) => (
                    <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                      {game}
                      <button type="button" onClick={() => handleRemoveItem("games", game)}>
                        ❌
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input id="game" name="game" value={formData.game} onChange={handleChange} placeholder="Añadir juego" />
                  <Button type="button" variant="secondary" onClick={handleAddGame}>Añadir</Button>
                </div>
              </div>

              {/* Categorías */}
              <div className="space-y-2">
                <Label>Categorías de contenido</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.categories.map((cat, idx) => (
                    <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                      {cat}
                      <button type="button" onClick={() => handleRemoveItem("categories", cat)}>
                        ❌
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {topCategories.map((cat) => (
                    <Button
                      key={cat}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddCategory(cat)}
                      disabled={formData.categories.includes(cat)}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Días de stream */}
              <div className="space-y-2">
                <Label>Días que sueles streamear</Label>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map((day) => (
                    <Button
                      key={day}
                      type="button"
                      variant={formData.stream_days.includes(day) ? "secondary" : "outline"}
                      onClick={() => handleToggleDay(day)}
                      size="sm"
                    >
                      {day}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Horarios - FIX: Changed references from stream_time_start/end to start_time/end_time */}
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label>Hora inicio</Label>
                  <Input 
                    type="time" 
                    name="start_time" 
                    value={formData.start_time} 
                    onChange={handleChange} 
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label>Hora fin</Label>
                  <Input 
                    type="time" 
                    name="end_time" 
                    value={formData.end_time} 
                    onChange={handleChange} 
                  />
                </div>
              </div>

              {/* Acciones */}
              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={isLoading}>Cancelar</Button>
                <Button type="submit" disabled={isLoading}>{isLoading ? "Guardando..." : "Guardar cambios"}</Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold">{profile.username}</h1>
                <p className="text-muted-foreground">{user.email}</p>
              </div>

              {/* Mostrar info del perfil */}
              {profile.description && (
                <div>
                  <h2 className="text-sm font-medium text-muted-foreground mb-2">Descripción</h2>
                  <p className="text-sm bg-muted/50 p-3 rounded-md">{profile.description}</p>
                </div>
              )}

              {profile.games.length > 0 && (
                <div>
                  <h2 className="text-sm font-medium text-muted-foreground mb-2">Juegos principales</h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.games.map((game, idx) => (
                      <Badge key={idx} variant="secondary">{game}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={handleLogout}>Cerrar sesión</Button>
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
