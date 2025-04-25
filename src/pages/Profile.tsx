
import { useState, useEffect } from "react";
import { MobileLayout } from "@/components/MobileLayout";
import { useAuth } from "@/contexts/AuthContext";
import useStore from "@/store/useStore";
import { useProfileForm } from "@/hooks/useProfileForm";
import { ProfileView } from "@/components/profile/ProfileView";
import { ProfileEditForm } from "@/components/profile/ProfileEditForm";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

const Profile = () => {
  const { user, signOut } = useAuth();
  const { profile } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  
  const {
    formData,
    isLoading,
    handleChange,
    handleAddCategory,
    handleRemoveCategory,
    handleSubmit,
    setFormData,
    TWITCH_CATEGORIES,
  } = useProfileForm(profile);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  if (!user) {
    return (
      <MobileLayout>
        <div className="flex flex-col items-center justify-center h-screen text-white">
          <p>🔒 Inicia sesión para ver tu perfil</p>
        </div>
      </MobileLayout>
    );
  }

  if (!profile) {
    return (
      <MobileLayout>
        <div className="p-4 max-w-md mx-auto">
          <div className="space-y-6 pt-2 pb-8">
            {/* Avatar skeleton */}
            <div className="flex justify-center">
              <Skeleton className="w-24 h-24 rounded-full" />
            </div>
            
            {/* Username skeleton */}
            <div className="space-y-2 flex flex-col items-center">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-4 w-60" />
            </div>
            
            {/* Content skeletons */}
            <Skeleton className="h-32 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
            
            {/* Buttons skeleton */}
            <div className="flex gap-4 pt-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 flex-1" />
            </div>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="p-4 max-w-md mx-auto">
        <div className="mb-6">
          {isEditing ? (
            <ProfileEditForm
              formData={formData}
              isLoading={isLoading}
              onSubmit={(e) => {
                handleSubmit(e, user.id).then(() => setIsEditing(false));
              }}
              onChange={handleChange}
              onAddCategory={handleAddCategory}
              onRemoveCategory={handleRemoveCategory}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <ProfileView
              profile={profile}
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
