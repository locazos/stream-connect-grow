
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { Database } from "@/lib/database.types";
import useStore from "@/store/useStore";

// Define the Profile type from the Database type
type Profile = Database['public']['Tables']['profiles']['Row'];

// Predefined Twitch categories
const PREDEFINED_CATEGORIES = [
  'Just Chatting',
  'Fortnite',
  'Valorant',
  'League of Legends', 
  'GTA V',
  'Call of Duty',
  'Minecraft',
  'FIFA',
  'Among Us',
  'Apex Legends'
];

interface ProfileFormData {
  username: string;
  description: string;
  category: string;
  categories: string[];
  start_time: string;
  end_time: string;
  games: string[];
}

export function useProfileForm(initialProfile: Profile | null) {
  const { setProfile } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState<ProfileFormData>({
    username: initialProfile?.username || "",
    description: initialProfile?.description || "",
    category: "",
    categories: Array.isArray(initialProfile?.categories) ? initialProfile.categories : [],
    start_time: initialProfile?.start_time || "",
    end_time: initialProfile?.end_time || "",
    games: Array.isArray(initialProfile?.games) ? initialProfile.games : [],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddCategory = () => {
    if (!formData.category.trim()) return;

    const newCategory = formData.category.trim();
    if (!formData.categories.includes(newCategory)) {
      setFormData((prev) => ({
        ...prev,
        categories: [...prev.categories, newCategory],
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
          categories: formData.categories,
          start_time: formData.start_time,
          end_time: formData.end_time,
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
        categories: formData.categories,
        start_time: formData.start_time,
        end_time: formData.end_time,
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
  };

  return {
    formData,
    isLoading,
    handleChange,
    handleAddCategory,
    handleRemoveCategory,
    handleSubmit,
    setFormData,
    PREDEFINED_CATEGORIES,
  };
}
