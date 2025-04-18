
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { MobileLayout } from "@/components/MobileLayout";
import { AvatarWithFallback } from "@/components/ui/avatar-with-fallback";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import useStore from "@/store/useStore";

const Matches = () => {
  const { matches, loadMatches, isLoading, error } = useStore();
  
  useEffect(() => {
    loadMatches();
  }, [loadMatches]);
  
  return (
    <MobileLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6">Tus Matches</h1>
        
        {isLoading ? (
          <div className="space-y-4">
            <MatchCardSkeleton />
            <MatchCardSkeleton />
            <MatchCardSkeleton />
          </div>
        ) : error ? (
          <div className="p-6 text-center bg-card rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-2">Error</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button 
              onClick={() => loadMatches()} 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 py-2 px-4"
            >
              Intentar de nuevo
            </button>
          </div>
        ) : matches.length === 0 ? (
          <div className="p-6 text-center bg-card rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-2">No tienes matches aún</h3>
            <p className="text-muted-foreground mb-4">
              Sigue explorando para encontrar streamers con los que colaborar.
            </p>
            <Link 
              to="/" 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 py-2 px-4"
            >
              Explorar
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => (
              <div 
                key={match.id} 
                className="p-4 bg-card rounded-lg shadow-sm border border-border flex items-center gap-4"
              >
                <AvatarWithFallback
                  src={match.profile.avatar_url}
                  username={match.profile.username}
                  className="h-16 w-16"
                />
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate">{match.profile.username}</h3>
                  
                  {match.profile.games && match.profile.games.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1 mb-2">
                      {match.profile.games.slice(0, 3).map((game, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {game}
                        </Badge>
                      ))}
                      {match.profile.games.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{match.profile.games.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {match.profile.description || "Sin descripción"}
                  </p>
                </div>
                
                <div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(match.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

// Skeleton loader for match card
const MatchCardSkeleton = () => (
  <div className="p-4 bg-card rounded-lg shadow-sm border border-border flex items-center gap-4 animate-pulse">
    <Skeleton className="h-16 w-16 rounded-full" />
    <div className="flex-1">
      <Skeleton className="h-5 w-32 mb-2" />
      <div className="flex gap-1 mb-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full" />
    </div>
  </div>
);

export default Matches;
