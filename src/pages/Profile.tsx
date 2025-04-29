
import { useState, useEffect } from "react";
import { MobileLayout } from "@/components/MobileLayout";
import { AvatarWithFallback } from "@/components/ui/avatar-with-fallback";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import useStore from "@/store/useStore";
import { supabase } from "@/lib/supabase";
import { ProfileView } from "@/components/profile/ProfileView";
import { ProfileEditForm } from "@/components/profile/ProfileEditForm";

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

  const handleChange = (e) => {
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

  const handleRemoveItem = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((item) => item !== value),
    }));
  };

  const handleAddCategory = (category) => {
    if (!formData.categories.includes(category)) {
      setFormData((prev) => ({
        ...prev,
        categories: [...prev.categories, category],
      }));
    }
  };

  const handleToggleDay = (day) => {
    if (formData.stream_days.includes(day)) {
      handleRemoveItem("stream_days", day);
    } else {
      setFormData((prev) => ({
        ...prev,
        stream_days: [...prev.stream_days, day],
      }));
    }
  };

  const handleSubmit = async (e) => {
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
        ...profile,
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
            <ProfileEditForm
              formData={formData}
              isLoading={isLoading}
              daysOfWeek={daysOfWeek}
              topCategories={topCategories}
              onSubmit={handleSubmit}
              onChange={handleChange}
              onAddGame={handleAddGame}
              onAddCategory={handleAddCategory}
              onToggleDay={handleToggleDay}
              onRemoveItem={handleRemoveItem}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <ProfileView
              profile={profile}
              email={user.email}
              onEdit={() => setIsEditing(true)}
              onLogout={handleLogout}
            />
          )}
        </div>
      </div>
    </MobileLayout>
  );
};

export default Profile;
