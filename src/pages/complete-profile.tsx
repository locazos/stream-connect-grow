
// pages/complete-profile.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Changed from next/router to react-router-dom
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

const CompleteProfile = () => {
  const { user } = useAuth();
  const { setProfile } = useStore();
  const navigate = useNavigate(); // Changed from useRouter to useNavigate
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    username: user?.user_metadata.name || "",
    description: "",
    game: "",
    games: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          games: formData.games,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select()
        .single(); // Importante: recoger el perfil actualizado

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

      navigate("/profile"); // Changed from router.push to navigate
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
            <Label>Juegos principales</Label>
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
              <Button type="button" variant="secondary" onClick={handleAddGame} className="shrink-0">
                Añadir
              </Button>
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
