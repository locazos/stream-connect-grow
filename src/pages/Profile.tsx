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

const Profile = () => {
  const { user, signOut } = useAuth();
  const { profile, setProfile } = useStore();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    description: "",
    categories: [],
    start_time: "",
    end_time: "",
  });

  // Cargar perfil desde Supabase
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

      setProfile({
        ...data,
        categories: Array.isArray(data.categories) ? data.categories : [],
      });
    };

    fetchProfile();
  }, [user, profile, setProfile]);

  // Actualizar formData cuando cargue el perfil
  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || "",
        description: profile.description || "",
        categories: Array.isArray(profile.categories) ? profile.categories : [],
        start_time: profile.start_time || "",
        end_time: profile.end_time || "",
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddCategory = () => {
    if (!formData.category?.trim()) return;

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
      categories: prev.categories.filter((cat) => cat !== categoryToRemove),
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
          description: formData.description,
          categories: formData.categories,
          start_time: formData.start_time,
          end_time: formData.end_time,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        console.error("❌ Error updating profile:", error.message);
        toast({ title: "Error", description: "No se pudo actualizar el perfil", variant: "destructive" });
        return;
      }

      toast({ title: "✅ Perfil actualizado", description: "Se guardaron los cambios." });

      setProfile({
        ...profile!,
        description: formData.description,
        categories: formData.categories,
        start_time: formData.start_time,
        end_time: formData.end_time,
        updated_at: new Date().toISOString(),
      });

      setIsEditing(false);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
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
            <AvatarWithFallback
              src={profile.avatar_url}
              username={profile.username}
              className="h-24 w-24"
            />
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
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Cuéntanos sobre tu canal"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Categorías</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.categories.map((cat, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {cat}
                      <button
                        type="button"
                        onClick={() => handleRemoveCategory(cat)}
                        className="ml-1 h-4 w-4 rounded-full bg-muted-foreground/30 hover:bg-muted-foreground/50"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Hora de inicio</Label>
                <Input
                  type="time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label>Hora de fin</Label>
                <Input
                  type="time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleChange}
                />
              </div>

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
              <h1 className="text-2xl font-bold">{profile.username}</h1>
              <p className="text-muted-foreground">{user.email}</p>

              <div>
                <h2 className="text-sm font-medium text-muted-foreground mb-2">Descripción</h2>
                <p className="text-sm bg-muted/50 p-3 rounded-md">{profile.description || "Sin descripción"}</p>
              </div>

              {profile.categories && profile.categories.length > 0 && (
                <div>
                  <h2 className="text-sm font-medium text-muted-foreground mb-2">Categorías</h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.categories.map((cat, index) => (
                      <Badge key={index} variant="secondary">{cat}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col items-center gap-2">
                <h2 className="text-sm font-medium text-muted-foreground">Horario de Stream</h2>
                <p className="text-sm">{profile.start_time} - {profile.end_time}</p>
              </div>

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
