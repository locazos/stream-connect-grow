
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StreamScheduleEditor } from "@/components/StreamScheduleEditor";

interface ProfileEditFormProps {
  formData: {
    username: string;
    description: string;
    game: string;
    games: string[];
    category: string;
    categories: string[];
    stream_days: string[];
    stream_time: string;
  };
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onAddGame: () => void;
  onRemoveGame: (game: string) => void;
  onAddCategory: () => void;
  onRemoveCategory: (category: string) => void;
  onCancel: () => void;
  onStreamDaysChange: (days: string[]) => void;
  onStreamTimeChange: (time: string) => void;
}

export function ProfileEditForm({
  formData,
  isLoading,
  onSubmit,
  onChange,
  onAddGame,
  onRemoveGame,
  onAddCategory,
  onRemoveCategory,
  onCancel,
  onStreamDaysChange,
  onStreamTimeChange,
}: ProfileEditFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="username">Nombre de usuario</Label>
        <Input
          id="username"
          name="username"
          value={formData.username}
          onChange={onChange}
          placeholder="Tu nombre de usuario"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={onChange}
          placeholder="Cuéntanos sobre ti y tu canal"
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label>Categorías</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.categories.map((category, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {category}
              <button
                type="button"
                onClick={() => onRemoveCategory(category)}
                className="ml-1 h-4 w-4 rounded-full bg-muted-foreground/30 inline-flex items-center justify-center hover:bg-muted-foreground/50"
              >
                <span className="sr-only">Remove</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            id="category"
            name="category"
            value={formData.category}
            onChange={onChange}
            placeholder="Añadir categoría"
          />
          <Button type="button" variant="secondary" onClick={onAddCategory} className="shrink-0">
            Añadir
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Juegos</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.games.map((game, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {game}
              <button
                type="button"
                onClick={() => onRemoveGame(game)}
                className="ml-1 h-4 w-4 rounded-full bg-muted-foreground/30 inline-flex items-center justify-center hover:bg-muted-foreground/50"
              >
                <span className="sr-only">Remove</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            id="game"
            name="game"
            value={formData.game}
            onChange={onChange}
            placeholder="Añadir juego"
          />
          <Button type="button" variant="secondary" onClick={onAddGame} className="shrink-0">
            Añadir
          </Button>
        </div>
      </div>

      <StreamScheduleEditor
        streamDays={formData.stream_days}
        streamTime={formData.stream_time}
        onStreamDaysChange={onStreamDaysChange}
        onStreamTimeChange={onStreamTimeChange}
      />

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
