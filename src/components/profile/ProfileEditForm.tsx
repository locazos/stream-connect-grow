
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock } from "lucide-react";

interface ProfileEditFormProps {
  formData: {
    username: string;
    description: string;
    category: string;
    categories: string[];
    start_time: string;
    end_time: string;
  };
  isLoading: boolean;
  PREDEFINED_CATEGORIES: string[];
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onAddCategory: () => void;
  onRemoveCategory: (category: string) => void;
  onCancel: () => void;
}

export function ProfileEditForm({
  formData,
  isLoading,
  PREDEFINED_CATEGORIES,
  onSubmit,
  onChange,
  onAddCategory,
  onRemoveCategory,
  onCancel,
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
          readOnly
          className="bg-muted-foreground/10 cursor-not-allowed"
        />
        <p className="text-sm text-muted-foreground">
          El nombre de usuario se obtiene directamente de Twitch
        </p>
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
        
        <div className="space-y-2">
          <Label>Seleccionar categoría</Label>
          <div className="flex gap-2">
            <Select 
              onValueChange={(value) => {
                const input = document.getElementById('category') as HTMLInputElement;
                if (input) input.value = value;
                onChange({ target: { name: 'category', value } } as React.ChangeEvent<HTMLInputElement>);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categorías de Twitch" />
              </SelectTrigger>
              <SelectContent>
                {PREDEFINED_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              id="category"
              name="category"
              value={formData.category}
              onChange={onChange}
              placeholder="Otra categoría"
              className="flex-grow"
            />
            <Button type="button" variant="secondary" onClick={onAddCategory} className="shrink-0">
              Añadir
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Horario de Stream</Label>
        <div className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="start_time">Hora de inicio</Label>
            <div className="relative">
              <Input
                id="start_time"
                name="start_time"
                type="time"
                value={formData.start_time}
                onChange={onChange}
                className="pl-10"
              />
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            </div>
          </div>
          <div className="flex-1">
            <Label htmlFor="end_time">Hora de finalización</Label>
            <div className="relative">
              <Input
                id="end_time"
                name="end_time"
                type="time"
                value={formData.end_time}
                onChange={onChange}
                className="pl-10"
              />
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            </div>
          </div>
        </div>
      </div>

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
