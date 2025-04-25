
import { useState, useEffect } from "react";
import { MobileLayout } from "@/components/MobileLayout";
import { AvatarWithFallback } from "@/components/ui/avatar-with-fallback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { StreamSchedule } from "@/components/StreamSchedule";
import useStore from "@/store/useStore";
import { supabase } from "@/lib/supabase";
import { TWITCH_CATEGORIES, WEEK_DAYS } from "@/lib/constants";
import { Check, ChevronsUpDown, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const Profile = () => {
  const { user, signOut } = useAuth();
  const { profile, setProfile } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: profile?.username || "",
    description: profile?.description || "",
    categories: profile?.categories ?? [],
    stream_days: profile?.stream_days ?? [],
    stream_time: profile?.stream_time || "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Update form data when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || "",
        description: profile.description || "",
        categories: profile.categories ?? [],
        stream_days: profile.stream_days ?? [],
        stream_time: profile.stream_time || "",
      });
    }
  }, [profile]);

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

  useEffect(() => {
    console.log("👤 user:", user);
    console.log("📄 profile:", profile);
  }, [user, profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStreamDayToggle = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      stream_days: prev.stream_days?.includes(day)
        ? prev.stream_days.filter((d) => d !== day)
        : [...(prev.stream_days ?? []), day],
    }));
  };

  const handleCategorySelect = (category: string) => {
    setFormData((prev) => {
      const currentCategories = prev.categories ?? [];
      return {
        ...prev,
        categories: currentCategories.includes(category)
          ? currentCategories.filter((c) => c !== category)
          : [...currentCategories, category],
      };
    });
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
          categories: formData.categories ?? [],
          stream_days: formData.stream_days ?? [],
          stream_time: formData.stream_time,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      if (profile) {
        setProfile({
          ...profile,
          ...formData,
          categories: formData.categories ?? [],
          stream_days: formData.stream_days ?? [],
          updated_at: new Date().toISOString(),
        });
      }

      toast({
        title: "Perfil actualizado",
        description: "Tu perfil ha sido actualizado correctamente",
      });

      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || !profile) {
    return (
      <MobileLayout>
        <div className="flex flex-col items-center justify-center h-screen">
          <p>Cargando perfil...</p>
        </div>
      </MobileLayout>
    );
  }

  // Safe access to array properties
  const categories = profile?.categories ?? [];
  const streamDays = profile?.stream_days ?? [];
  const formCategories = formData?.categories ?? [];
  const formStreamDays = formData?.stream_days ?? [];

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
                  value={formData.description || ""}
                  onChange={handleChange}
                  placeholder="Cuéntanos sobre ti y tu canal"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Categorías</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between"
                    >
                      {formCategories.length > 0
                        ? `${formCategories.length} categorías seleccionadas`
                        : "Seleccionar categorías"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Buscar categoría..." />
                      <CommandEmpty>No se encontraron categorías.</CommandEmpty>
                      <CommandGroup>
                        {TWITCH_CATEGORIES.map((category) => (
                          <CommandItem
                            key={category}
                            value={category}
                            onSelect={() => handleCategorySelect(category)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formCategories.includes(category)
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {category}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formCategories.map((category) => (
                    <Badge
                      key={category}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleCategorySelect(category)}
                    >
                      {category} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Días de stream</Label>
                <div className="grid grid-cols-2 gap-2">
                  {WEEK_DAYS.map((day) => (
                    <div key={day} className="flex items-center space-x-2">
                      <Checkbox
                        id={day}
                        checked={formStreamDays.includes(day)}
                        onCheckedChange={() => handleStreamDayToggle(day)}
                      />
                      <label
                        htmlFor={day}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {day}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stream_time">Horario habitual</Label>
                <Input
                  id="stream_time"
                  name="stream_time"
                  value={formData.stream_time || ""}
                  onChange={handleChange}
                  placeholder="20:00 - 00:00"
                />
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
                <p className="text-muted-foreground">{user.email}</p>
              </div>

              {categories.length > 0 && (
                <div>
                  <h2 className="text-sm font-medium text-muted-foreground mb-2">
                    Categorías
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Badge key={category} variant="secondary">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {(streamDays.length > 0 || profile.stream_time) && (
                <div>
                  <h2 className="text-sm font-medium text-muted-foreground mb-2">
                    Horario
                  </h2>
                  <StreamSchedule
                    days={streamDays}
                    time={profile.stream_time}
                  />
                </div>
              )}

              <div>
                <h2 className="text-sm font-medium text-muted-foreground mb-2">
                  Descripción
                </h2>
                <p className="text-sm bg-muted/50 p-3 rounded-md">
                  {profile.description || "Sin descripción"}
                </p>
              </div>

              {profile.twitch_url && (
                <div>
                  <a
                    href={profile.twitch_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                  >
                    Ver canal <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={signOut}>
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
