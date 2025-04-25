
import { Badge } from "@/components/ui/badge";
import { WEEK_DAYS } from "@/lib/constants";
import { Clock } from "lucide-react";

interface StreamScheduleProps {
  days: string[] | null | undefined;
  time?: string | null;
  className?: string;
}

export function StreamSchedule({ days, time, className = "" }: StreamScheduleProps) {
  // Garantizar que days siempre sea un array, incluso si es null o undefined
  const safeDays = Array.isArray(days) ? days : [];
  
  // No renderizar nada si no hay días ni horario
  if (safeDays.length === 0 && !time) return null;

  return (
    <div className={className}>
      {safeDays.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {safeDays.map((day) => (
            <Badge key={day} variant="outline">
              {day}
            </Badge>
          ))}
        </div>
      )}
      {time && (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{time}</span>
        </div>
      )}
    </div>
  );
}
