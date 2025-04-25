
import { useState } from "react";
import { MobileLayout } from "@/components/MobileLayout";
import { useAuth } from "@/contexts/AuthContext";
import useStore from "@/store/useStore";
import { useProfileForm } from "@/hooks/useProfileForm";
import { ProfileView } from "@/components/profile/ProfileView";
import { ProfileEditForm } from "@/components/profile/ProfileEditForm";

const Profile = () => {
  const { user, signOut } = useAuth();
  const { profile } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  
  const {
    formData,
    isLoading,
    handleChange,
    handleAddGame,
    handleRemoveGame,
    handleAddCategory,
    handleRemoveCategory,
    handleSubmit,
    setFormData,
  } = useProfileForm(profile);

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
          {isEditing ? (
            <ProfileEditForm
              formData={formData}
              isLoading={isLoading}
              onSubmit={(e) => {
                handleSubmit(e, user.id).then(() => setIsEditing(false));
              }}
              onChange={handleChange}
              onAddGame={handleAddGame}
              onRemoveGame={handleRemoveGame}
              onAddCategory={handleAddCategory}
              onRemoveCategory={handleRemoveCategory}
              onCancel={() => setIsEditing(false)}
              onStreamDaysChange={(days) => setFormData(prev => ({ ...prev, stream_days: days }))}
              onStreamTimeChange={(time) => setFormData(prev => ({ ...prev, stream_time: time }))}
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
