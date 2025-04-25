
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Database } from "@/lib/database.types";
import { AvatarWithFallback } from "@/components/ui/avatar-with-fallback";
import { Clock } from "lucide-react";

// Define the Profile type from the Database type
type Profile = Database['public']['Tables']['profiles']['Row'];

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

      {profile.description && (
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-2">Descripción</h2>
          <p className="text-sm bg-muted/50 p-3 rounded-md">
            {profile.description}
          </p>
        </div>
      )}

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

      {(profile.start_time || profile.end_time) && (
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-2">Horario de Stream</h2>
          <div className="flex items-center space-x-4 bg-muted/50 p-3 rounded-md">
            <Clock className="text-muted-foreground" size={20} />
            <div>
              {profile.start_time && profile.end_time ? (
                <p className="text-sm">
                  {profile.start_time} - {profile.end_time}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {profile.start_time ? `Inicio: ${profile.start_time}` : `Fin: ${profile.end_time}`}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

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
