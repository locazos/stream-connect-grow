
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface AvatarWithFallbackProps {
  src?: string | null;
  username?: string;
  className?: string;
  fallbackClassName?: string;
}

export function AvatarWithFallback({ 
  src, 
  username = "User", 
  className,
  fallbackClassName 
}: AvatarWithFallbackProps) {
  // Generate initials from the username
  const initials = username
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  return (
    <Avatar className={cn("border-2 border-primary", className)}>
      <AvatarImage src={src || undefined} alt={username} />
      <AvatarFallback 
        className={cn("bg-secondary text-secondary-foreground font-semibold", fallbackClassName)}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
