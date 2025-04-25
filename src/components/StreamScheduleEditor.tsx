
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { WEEK_DAYS } from "@/lib/constants";

interface StreamScheduleEditorProps {
  streamDays: string[];
  streamTime: string;
  onStreamDaysChange: (days: string[]) => void;
  onStreamTimeChange: (time: string) => void;
}

export function StreamScheduleEditor({
  streamDays,
  streamTime,
  onStreamDaysChange,
  onStreamTimeChange,
}: StreamScheduleEditorProps) {
  const handleDayToggle = (day: string, checked: boolean) => {
    if (checked) {
      onStreamDaysChange([...streamDays, day]);
    } else {
      onStreamDaysChange(streamDays.filter((d) => d !== day));
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Días de stream</Label>
        <div className="flex flex-wrap gap-4">
          {WEEK_DAYS.map((day) => (
            <div key={day} className="flex items-center space-x-2">
              <Checkbox
                id={`day-${day}`}
                checked={streamDays.includes(day)}
                onCheckedChange={(checked) => handleDayToggle(day, checked as boolean)}
              />
              <Label htmlFor={`day-${day}`} className="text-sm font-normal">
                {day}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="streamTime">Horario habitual</Label>
        <Input
          id="streamTime"
          placeholder="Ej: 19:00 - 21:00"
          value={streamTime}
          onChange={(e) => onStreamTimeChange(e.target.value)}
        />
      </div>
    </div>
  );
}
