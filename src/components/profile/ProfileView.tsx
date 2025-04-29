
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AvatarWithFallback } from "@/components/ui/avatar-with-fallback";
import { Calendar, Clock } from "lucide-react";

interface ProfileViewProps {
  profile: {
    username: string;
    description: string;
    games: string[];
    categories: string[];
    stream_days: string[];
    avatar_url: string | null;
    start_time: string | null;
    end_time: string | null;
    twitch_url?: string | null;
  };
  email?: string;
  onEdit: () => void;
  onLogout: () => void;
}

export function ProfileView({ profile, email, onEdit, onLogout }: ProfileViewProps) {
  // Format time range for display if both exist
  const formattedTimeRange = profile.start_time && profile.end_time 
    ? `${profile.start_time.slice(0, 5)} - ${profile.end_time.slice(0, 5)}`
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{profile.username}</h1>
        {email && <p className="text-muted-foreground">{email}</p>}
      </div>

      {/* Mostrar info del perfil */}
      {profile.description && (
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-2">Descripción</h2>
          <p className="text-sm bg-muted/50 p-3 rounded-md">{profile.description}</p>
        </div>
      )}

      {profile.games && profile.games.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-2">Juegos principales</h2>
          <div className="flex flex-wrap gap-2">
            {profile.games.map((game, idx) => (
              <Badge key={idx} variant="secondary">{game}</Badge>
            ))}
          </div>
        </div>
      )}
      
      {/* Stream Days */}
      {Array.isArray(profile.stream_days) && profile.stream_days.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-2">Días de stream</h2>
          <div className="flex items-start space-x-3 bg-muted/50 p-4 rounded-lg">
            <Calendar className="text-muted-foreground mt-0.5" size={20} />
            <div className="flex flex-wrap gap-2">
              {profile.stream_days.map((day, index) => (
                <Badge key={index} variant="secondary">
                  {day}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stream Schedule */}
      {(profile.start_time || profile.end_time) && (
        <div>
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

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onLogout}>Cerrar sesión</Button>
        <Button onClick={onEdit}>Editar perfil</Button>
      </div>
    </div>
  );
}
