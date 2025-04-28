
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

interface StreamScheduleProps {
  selectedDays: string[];
  startTime: string;
  endTime: string;
  onDaysChange: (days: string[]) => void;
  onTimeChange: (type: "start" | "end", value: string) => void;
  
  // Add compatibility with ProfileCard component
  days?: string[];
  time?: string;
}

export function StreamSchedule({
  selectedDays,
  startTime,
  endTime,
  onDaysChange,
  onTimeChange,
  // For backwards compatibility with ProfileCard
  days = [],
  time,
}: StreamScheduleProps) {
  // If this component is used in read-only mode (like in ProfileCard)
  // we'll just display the schedule without interaction
  const isReadOnly = days.length > 0 || time !== undefined;
  
  const daysToShow = isReadOnly ? days : selectedDays;
  
  return (
    <div className="space-y-4">
      {isReadOnly ? (
        // Read-only display mode
        <div className="space-y-2">
          {daysToShow.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {daysToShow.map((day) => (
                <Badge key={day} variant="secondary">
                  {day}
                </Badge>
              ))}
            </div>
          )}
          {time && (
            <div className="flex items-center text-sm gap-2 text-muted-foreground">
              <Clock size={16} />
              <span>{time}</span>
            </div>
          )}
        </div>
      ) : (
        // Interactive edit mode
        <>
          <div className="space-y-2">
            <Label>Stream Days</Label>
            <ToggleGroup 
              type="multiple" 
              value={selectedDays}
              onValueChange={onDaysChange}
              className="flex flex-wrap gap-2"
            >
              {DAYS_OF_WEEK.map((day) => (
                <ToggleGroupItem
                  key={day}
                  value={day}
                  className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >
                  {day.slice(0, 3)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            
            {selectedDays.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedDays.map((day) => (
                  <Badge key={day} variant="secondary">
                    {day}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <div className="relative">
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => onTimeChange("start", e.target.value)}
                  className="pl-10"
                />
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <div className="relative">
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => onTimeChange("end", e.target.value)}
                  className="pl-10"
                />
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
