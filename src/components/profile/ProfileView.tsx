
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StreamSchedule } from "@/components/StreamSchedule";
import { Profile } from "@/lib/database.types";
import { AvatarWithFallback } from "@/components/ui/avatar-with-fallback";

interface ProfileViewProps {
  profile: Profile;
  onEdit: () => void;
  onLogout: () => void;
}

export function ProfileView({ profile, onEdit, onLogout }: ProfileViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{profile.username}</h1>
      </div>

      {Array.isArray(profile.categories) && profile.categories.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-2">Categorías</h2>
          <div className="flex flex-wrap gap-2">
            {profile.categories.map((category, index) => (
              <Badge key={index} variant="secondary">
                {category}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {Array.isArray(profile.games) && profile.games.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-2">Juegos</h2>
          <div className="flex flex-wrap gap-2">
            {profile.games.map((game, index) => (
              <Badge key={index} variant="secondary">
                {game}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {(Array.isArray(profile.stream_days) && profile.stream_days.length > 0 || profile.stream_time) && (
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-2">Horario</h2>
          <StreamSchedule
            days={profile.stream_days}
            time={profile.stream_time}
          />
        </div>
      )}

      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-2">Descripción</h2>
        <p className="text-sm bg-muted/50 p-3 rounded-md">
          {profile.description || "Sin descripción"}
        </p>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onLogout}>
          Cerrar sesión
        </Button>
        <Button onClick={onEdit}>
          Editar perfil
        </Button>
      </div>
    </div>
  );
}
