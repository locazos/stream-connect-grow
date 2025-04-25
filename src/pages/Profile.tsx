
import { useState, useEffect } from "react";
import { MobileLayout } from "@/components/MobileLayout";
import { useAuth } from "@/contexts/AuthContext";
import useStore from "@/store/useStore";
import { useProfileForm } from "@/hooks/useProfileForm";
import { ProfileView } from "@/components/profile/ProfileView";
import { ProfileEditForm } from "@/components/profile/ProfileEditForm";
import { useNavigate } from "react-router-dom";

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
    PREDEFINED_CATEGORIES,
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

  if (!profile) {
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
              PREDEFINED_CATEGORIES={PREDEFINED_CATEGORIES}
              onSubmit={(e) => {
                handleSubmit(e, user!.id).then(() => setIsEditing(false));
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
