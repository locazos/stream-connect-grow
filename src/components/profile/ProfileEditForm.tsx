
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface ProfileEditFormProps {
  formData: {
    username: string;
    description: string;
    game: string;
    games: string[];
    categories: string[];
    stream_days: string[];
    start_time: string;
    end_time: string;
  };
  isLoading: boolean;
  daysOfWeek: string[];
  topCategories: string[];
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onAddGame: () => void;
  onAddCategory: (category: string) => void;
  onToggleDay: (day: string) => void;
  onRemoveItem: (field: "games" | "categories" | "stream_days", value: string) => void;
  onCancel: () => void;
}

export function ProfileEditForm({
  formData,
  isLoading,
  daysOfWeek,
  topCategories,
  onSubmit,
  onChange,
  onAddGame,
  onAddCategory,
  onToggleDay,
  onRemoveItem,
  onCancel,
}: ProfileEditFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>Nombre de usuario</Label>
        <Input value={formData.username} disabled />
      </div>

      <div className="space-y-2">
        <Label>Descripción</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={onChange}
          placeholder="Cuéntanos sobre ti y tu canal"
          rows={3}
        />
      </div>

      {/* Juegos */}
      <div className="space-y-2">
        <Label>Juegos principales</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.games.map((game, idx) => (
            <Badge key={idx} variant="secondary" className="flex items-center gap-1">
              {game}
              <button type="button" onClick={() => onRemoveItem("games", game)}>
                ❌
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input id="game" name="game" value={formData.game} onChange={onChange} placeholder="Añadir juego" />
          <Button type="button" variant="secondary" onClick={onAddGame}>Añadir</Button>
        </div>
      </div>

      {/* Categorías */}
      <div className="space-y-2">
        <Label>Categorías de contenido</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.categories.map((cat, idx) => (
            <Badge key={idx} variant="secondary" className="flex items-center gap-1">
              {cat}
              <button type="button" onClick={() => onRemoveItem("categories", cat)}>
                ❌
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {topCategories.map((cat) => (
            <Button
              key={cat}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onAddCategory(cat)}
              disabled={formData.categories.includes(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Días de stream */}
      <div className="space-y-2">
        <Label>Días que sueles streamear</Label>
        <div className="flex flex-wrap gap-2">
          {daysOfWeek.map((day) => (
            <Button
              key={day}
              type="button"
              variant={formData.stream_days.includes(day) ? "secondary" : "outline"}
              onClick={() => onToggleDay(day)}
              size="sm"
            >
              {day}
            </Button>
          ))}
        </div>
      </div>

      {/* Horarios */}
      <div className="flex gap-4">
        <div className="flex-1 space-y-2">
          <Label>Hora inicio</Label>
          <Input 
            type="time" 
            name="start_time" 
            value={formData.start_time} 
            onChange={onChange} 
          />
        </div>
        <div className="flex-1 space-y-2">
          <Label>Hora fin</Label>
          <Input 
            type="time" 
            name="end_time" 
            value={formData.end_time} 
            onChange={onChange} 
          />
        </div>
      </div>

      {/* Acciones */}
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancelar</Button>
        <Button type="submit" disabled={isLoading}>{isLoading ? "Guardando..." : "Guardar cambios"}</Button>
      </div>
    </form>
  );
}
