
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Database } from "@/lib/database.types";
import { AvatarWithFallback } from "@/components/ui/avatar-with-fallback";
import { Clock, User, Edit, LogOut } from "lucide-react";

// Define the Profile type from the Database type
type Profile = Database['public']['Tables']['profiles']['Row'];

interface ProfileViewProps {
  profile: Profile;
  onEdit: () => void;
  onLogout: () => void;
}

export function ProfileView({ profile, onEdit, onLogout }: ProfileViewProps) {
  // Format times for display if both exist
  const formattedTimeRange = profile.start_time && profile.end_time 
    ? `${profile.start_time.slice(0, 5)} - ${profile.end_time.slice(0, 5)}`
    : null;

  return (
    <div className="flex flex-col items-center space-y-6 pt-2 pb-8">
      {/* Avatar */}
      <div className="relative w-24 h-24">
        <AvatarWithFallback 
          src={profile.avatar_url || undefined} 
          username={profile.username || "User"}
          className="w-24 h-24 border-2 border-primary/20"
        />
      </div>

      {/* Username and Profile Info */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">{profile.username}</h1>
        {profile.twitch_url && (
          <a 
            href={profile.twitch_url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-sm text-muted-foreground hover:text-primary"
          >
            {profile.twitch_url.replace('https://', '')}
          </a>
        )}
      </div>

      {/* Description */}
      {profile.description && (
        <div className="w-full">
          <h2 className="text-sm font-medium text-muted-foreground mb-2">Descripción</h2>
          <p className="text-sm bg-muted/50 p-4 rounded-lg">
            {profile.description}
          </p>
        </div>
      )}

      {/* Categories */}
      {Array.isArray(profile.categories) && profile.categories.length > 0 && (
        <div className="w-full">
          <h2 className="text-sm font-medium text-muted-foreground mb-2">Categorías</h2>
          <div className="flex flex-wrap gap-2">
            {profile.categories.map((category, index) => (
              <Badge key={index} variant="secondary" className="px-3 py-1 text-xs">
                {category}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Stream Schedule */}
      {(profile.start_time || profile.end_time) && (
        <div className="w-full">
          <h2 className="text-sm font-medium text-muted-foreground mb-2">Horario de Stream</h2>
          <div className="flex items-center space-x-3 bg-muted/50 p-4 rounded-lg">
            <Clock className="text-muted-foreground" size={20} />
            <div>
              {formattedTimeRange ? (
                <p className="text-sm font-medium">{formattedTimeRange}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {profile.start_time ? `Inicio: ${profile.start_time.slice(0, 5)}` : `Fin: ${profile.end_time?.slice(0, 5)}`}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between w-full pt-4 gap-4">
        <Button 
          variant="outline" 
          onClick={onLogout} 
          className="flex-1 gap-2"
        >
          <LogOut size={16} />
          Cerrar sesión
        </Button>
        <Button 
          onClick={onEdit}
          className="flex-1 gap-2"
        >
          <Edit size={16} />
          Editar perfil
        </Button>
      </div>
    </div>
  );
}
