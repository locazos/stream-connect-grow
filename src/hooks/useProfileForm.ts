
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { Profile } from "@/lib/database.types";
import useStore from "@/store/useStore";

interface ProfileFormData {
  username: string;
  description: string;
  game: string;
  games: string[];
  category: string;
  categories: string[];
  stream_days: string[];
  stream_time: string;
}

export function useProfileForm(initialProfile: Profile | null) {
  const { setProfile } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState<ProfileFormData>({
    username: initialProfile?.username || "",
    description: initialProfile?.description || "",
    game: "",
    games: Array.isArray(initialProfile?.games) ? initialProfile.games : [],
    category: "",
    categories: Array.isArray(initialProfile?.categories) ? initialProfile.categories : [],
    stream_days: Array.isArray(initialProfile?.stream_days) ? initialProfile.stream_days : [],
    stream_time: initialProfile?.stream_time || "",
  });

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

  const handleSubmit = async (e: React.FormEvent, userId: string) => {
    e.preventDefault();
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
        .eq("id", userId);

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
        ...initialProfile!,
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

    return isLoading;
  };

  return {
    formData,
    isLoading,
    handleChange,
    handleAddGame,
    handleRemoveGame,
    handleAddCategory,
    handleRemoveCategory,
    handleSubmit,
    setFormData,
  };
}
