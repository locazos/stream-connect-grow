// pages/complete-profile.tsx

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { MobileLayout } from "@/components/MobileLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import useStore from "@/store/useStore";

const CompleteProfile = () => {
  const { user } = useAuth();
  const { profile, setProfile } = useStore();
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    username: profile?.username || "",
    description: profile?.description || "",
    game: "",
    games: profile?.games || [],
    categories: profile?.categories || [],
    stream_days: profile?.stream_days || [],
    stream_start: profile?.stream_start || "",
    stream_end: profile?.stream_end || "",
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile?.description && profile?.games?.length) {
      router.push("/profile"); // si ya tiene info, enviarlo al perfil
    }
  }, [profile, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddGame = () => {
    if (formData.game.trim() && !formData.games.includes(formData.game)) {
      setFormData((prev) => ({
        ...prev,
        games: [...prev.games, formData.game],
        game: "",
      }));
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

    setIsSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        description: formData.description,
        games: formData.games,
        categories: formData.categories,
        stream_days: formData.stream_days,
        stream_start: formData.stream_start,
        stream_end: formData.stream_end,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      console.error("❌ Error actualizando perfil:", error.message);
      toast({ title: "Error", description: "No se pudo actualizar el perfil.", variant: "destructive" });
      setIsSaving(false);
      return;
    }

    // Actualizar el store
    setProfile({
      ...(profile || {}),
      description: formData.description,
      games: formData.games,
      categories: formData.categories,
      stream_days: formData.stream_days,
      stream_start: formData.stream_start,
      stream_end: formData.stream_end,
      updated_at: new Date().toISOString(),
    });

    toast({ title: "✅ Perfil completado", description: "¡Bienvenido a Streamder!" });
    router.push("/profile");
  };

  if (!user || !profile) {
    return (
      <MobileLayout>
        <div className="flex flex-col items-center justify-center h-screen">
          <p className="text
