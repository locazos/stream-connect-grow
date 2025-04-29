
// pages/complete-profile.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/MobileLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import useStore from "@/store/useStore";
import { supabase } from "@/integrations/supabase/client";
import { TWITCH_CATEGORIES, WEEK_DAYS } from "@/lib/constants";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Clock } from "lucide-react";

const CompleteProfile = () => {
  const { user } = useAuth();
  const { setProfile } = useStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    username: user?.user_metadata.name || "",
    description: "",
    category: "",
    categories: [] as string[],
    stream_days: [] as string[],
    start_time: "",
    end_time: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  const handleStreamDaysChange = (days: string[]) => {
    setFormData((prev) => ({
      ...prev,
      stream_days: days,
    }));
  };

  const handleTimeChange = (type: "start" | "end", value: string) => {
    setFormData((prev) => ({
      ...prev,
      [type === "start" ? "start_time" : "end_time"]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);

    try {
      const { error, data } = await supabase
        .from("profiles")
        .update({
          username: formData.username,
          description: formData.description,
          categories: formData.categories,
          stream_days: formData.stream_days,
          start_time: formData.start_time,
          end_time: formData.end_time,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select()
        .single();

      if (error) {
        console.error("❌ Error actualizando perfil:", error);
        toast({
          title: "Error",
          description: "No se pudo actualizar el perfil",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        setProfile(data); // Actualizamos el store
      }

      toast({
        title: "✅ Perfil completado",
        description: "¡Ya puedes explorar streamers!",
      });

      navigate("/profile");
    } catch (error) {
      console.error("❌ Error inesperado:", error);
      toast({
        title: "Error inesperado",
        description: "Algo falló al guardar tu perfil",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MobileLayout>
      <div className="p-4 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Completa tu perfil</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username">Nombre de usuario</Label>
            <Input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              disabled
              placeholder="Tu nombre de usuario"
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
            <Label>Categorías de contenido</Label>
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
                      <path d="M18 6 6 18"></path>
                      <path d="m6 6 12 12"></path>
                    </svg>
                  </button>
                </Badge>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 mb-2">
              {TWITCH_CATEGORIES.map((category) => (
                <Badge 
                  key={category} 
                  variant="outline" 
                  className="cursor-pointer hover:bg-secondary"
                  onClick={() => {
                    if (!formData.categories.includes(category)) {
                      setFormData(prev => ({
                        ...prev,
                        categories: [...prev.categories, category]
                      }));
                    }
                  }}
                >
                  {category}
                </Badge>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Añadir otra categoría"
              />
              <Button type="button" variant="secondary" onClick={handleAddCategory} className="shrink-0">
                Añadir
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Días de stream</Label>
            <ToggleGroup 
              type="multiple" 
              value={formData.stream_days}
              onValueChange={handleStreamDaysChange}
              className="flex flex-wrap justify-between gap-2"
            >
              {WEEK_DAYS.map((day) => (
                <ToggleGroupItem
                  key={day}
                  value={day}
                  className="text-xs flex-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >
                  {day.slice(0, 3)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">Hora de inicio</Label>
              <div className="relative">
                <Input
                  id="start_time"
                  name="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => handleTimeChange("start", e.target.value)}
                  className="pl-10"
                />
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_time">Hora de fin</Label>
              <div className="relative">
                <Input
                  id="end_time"
                  name="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => handleTimeChange("end", e.target.value)}
                  className="pl-10"
                />
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              </div>
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Guardando perfil..." : "Guardar perfil"}
          </Button>
        </form>
      </div>
    </MobileLayout>
  );
};

export default CompleteProfile;
