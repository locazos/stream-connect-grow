
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, User, X, Check, Calendar } from "lucide-react";
import { TWITCH_CATEGORIES } from "@/lib/constants";
import { useEffect, useState } from "react";

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
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onAddCategory: () => void;
  onRemoveCategory: (category: string) => void;
  onCancel: () => void;
}

export function ProfileEditForm({
  formData,
  isLoading,
  onSubmit,
  onChange,
  onAddCategory,
  onRemoveCategory,
  onCancel,
}: ProfileEditFormProps) {
  const [categoryError, setcategoryError] = useState("");
  const [formValid, setFormValid] = useState(true);

  // Validate form on data change
  useEffect(() => {
    const isValid = formData.description.trim().length > 0;
    setFormValid(isValid);
  }, [formData]);

  // Handle category selection from dropdown
  const handleCategorySelect = (value: string) => {
    // Check if category already exists
    if (formData.categories.includes(value)) {
      setcategoryError("Esta categoría ya está en tu lista");
      return;
    }
    
    // Update the formData.category value
    onChange({ target: { name: 'category', value } } as React.ChangeEvent<HTMLInputElement>);
  };

  // Handle custom category input
  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setcategoryError("");
    onChange(e);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Username - Read only */}
      <div className="space-y-2">
        <Label htmlFor="username" className="text-sm font-medium">
          Nombre de usuario
        </Label>
        <div className="relative">
          <Input
            id="username"
            name="username"
            value={formData.username}
            readOnly
            className="pl-10 bg-muted/20 cursor-not-allowed text-muted-foreground"
          />
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
        </div>
        <p className="text-xs text-muted-foreground">
          El nombre de usuario se obtiene de Twitch
        </p>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">
          Descripción
          <span className="text-destructive ml-1">*</span>
        </Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={onChange}
          placeholder="Cuéntanos sobre ti y tu canal"
          rows={4}
          className={`resize-none ${!formData.description.trim() ? 'border-destructive' : ''}`}
          required
        />
        {!formData.description.trim() && (
          <p className="text-xs text-destructive">La descripción es obligatoria</p>
        )}
      </div>

      {/* Categories */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Categorías</Label>
        
        {/* Display selected categories */}
        <div className="flex flex-wrap gap-2 mb-3">
          {formData.categories.map((category, index) => (
            <Badge 
              key={index} 
              variant="secondary" 
              className="pl-3 pr-2 py-1.5 flex items-center gap-1 animate-fade-in"
            >
              {category}
              <button
                type="button"
                onClick={() => onRemoveCategory(category)}
                className="ml-1 h-4 w-4 rounded-full bg-muted-foreground/30 inline-flex items-center justify-center hover:bg-muted-foreground/50"
                aria-label={`Eliminar ${category}`}
              >
                <X size={10} strokeWidth={3} />
              </button>
            </Badge>
          ))}
        </div>
        
        {/* Category selector */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <Select
              onValueChange={handleCategorySelect}
              value={formData.category}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Categorías populares" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {TWITCH_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex flex-1 gap-2">
              <Input
                id="category"
                name="category"
                value={formData.category}
                onChange={handleCategoryChange}
                placeholder="O escribe una categoría"
                className="flex-grow"
              />
              <Button 
                type="button" 
                variant="secondary" 
                onClick={onAddCategory} 
                className="shrink-0"
                disabled={!formData.category.trim() || formData.categories.includes(formData.category)}
              >
                Añadir
              </Button>
            </div>
          </div>
          
          {categoryError && (
            <p className="text-xs text-destructive">{categoryError}</p>
          )}
        </div>
      </div>

      {/* Stream Time */}
      <div className="space-y-2">
        <Label>Horario de Stream</Label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="start_time" className="text-xs text-muted-foreground mb-1 block">
              Hora de inicio
            </Label>
            <div className="relative">
              <Input
                id="start_time"
                name="start_time"
                type="time"
                value={formData.start_time}
                onChange={onChange}
                className="pl-10"
              />
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            </div>
          </div>
          <div>
            <Label htmlFor="end_time" className="text-xs text-muted-foreground mb-1 block">
              Hora de finalización
            </Label>
            <div className="relative">
              <Input
                id="end_time"
                name="end_time"
                type="time"
                value={formData.end_time}
                onChange={onChange}
                className="pl-10"
              />
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-between gap-4 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel} 
          disabled={isLoading}
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading || !formValid}
          className="flex-1 gap-2"
        >
          {isLoading ? "Guardando..." : (
            <>
              <Check size={16} />
              Guardar
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
