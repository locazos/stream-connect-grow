
import { motion } from "framer-motion";
import { AvatarWithFallback } from "@/components/ui/avatar-with-fallback";
import { Badge } from "@/components/ui/badge";
import { StreamSchedule } from "@/components/StreamSchedule";
import { ExternalLink } from "lucide-react";
import { Database } from "@/lib/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface ProfileCardProps {
  profile: Profile;
  onConnect: () => void;
  onPass: () => void;
  drag?: boolean | "x" | "y";
  exit?: boolean;
  dragConstraints?: React.RefObject<HTMLDivElement>;
  onDragEnd?: (e: any, info: any) => void;
}

export function ProfileCard({
  profile,
  onConnect,
  onPass,
  drag = false,
  exit = false,
  dragConstraints,
  onDragEnd,
}: ProfileCardProps) {
  return (
    <motion.div
      className="w-full max-w-md mx-auto bg-card shadow-lg rounded-xl overflow-hidden"
      drag={drag ? "x" : false}
      dragConstraints={dragConstraints}
      onDragEnd={onDragEnd}
      exit={exit ? { x: 0, opacity: 0, scale: 0.5 } : undefined}
      whileDrag={{ scale: 1.05, cursor: "grabbing" }}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Profile avatar/image section */}
      <div className="h-56 sm:h-64 relative flex items-center justify-center bg-muted overflow-hidden">
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.username}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <AvatarWithFallback
              username={profile.username}
              className="w-32 h-32 text-4xl"
            />
          </div>
        )}
        
        {/* Overlay gradient for better readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        
        {/* Name overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h2 className="text-2xl font-bold text-white">{profile.username}</h2>
        </div>
      </div>

      {/* Profile details */}
      <div className="p-4 space-y-4">
        {/* Description */}
        {profile.description && (
          <p className="text-sm text-muted-foreground">
            {profile.description}
          </p>
        )}

        {/* Categories */}
        {profile.categories && profile.categories.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-2">Categorías</h3>
            <div className="flex flex-wrap gap-2">
              {(profile.categories || []).map((category) => (
                <Badge key={category} variant="secondary">
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Stream Schedule */}
        {((profile.stream_days && profile.stream_days.length > 0) || profile.stream_time) && (
          <div>
            <h3 className="text-sm font-medium mb-2">Horario</h3>
            <StreamSchedule
              days={profile.stream_days || []}
              time={profile.stream_time}
            />
          </div>
        )}

        {/* Twitch Link */}
        {profile.twitch_url && (
          <a
            href={profile.twitch_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
          >
            Ver canal <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>

      {/* Action buttons */}
      <div className="p-4 border-t border-border flex gap-4 justify-center">
        <button
          onClick={onPass}
          className="w-14 h-14 rounded-full bg-destructive flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="text-destructive-foreground"
          >
            <path d="M18 6 6 18"></path>
            <path d="m6 6 12 12"></path>
          </svg>
        </button>
        <button
          onClick={onConnect}
          className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="text-primary-foreground"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
          </svg>
        </button>
      </div>
    </motion.div>
  );
}
