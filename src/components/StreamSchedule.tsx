
import { Badge } from "@/components/ui/badge";
import { WEEK_DAYS } from "@/lib/constants";
import { Clock } from "lucide-react";

interface StreamScheduleProps {
  days: string[];
  time?: string;
  className?: string;
}

export function StreamSchedule({ days = [], time, className = "" }: StreamScheduleProps) {
  // Ensure days is always an array
  const safeDays = Array.isArray(days) ? days : [];
  
  if (!safeDays.length && !time) return null;

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
