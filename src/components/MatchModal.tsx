
import { Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AvatarWithFallback } from "@/components/ui/avatar-with-fallback";
import { Button } from "@/components/ui/button";
import useStore from "@/store/useStore";
import { Database } from "@/lib/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export function MatchModal() {
  const { showMatchModal, matchedProfile, profile, setShowMatchModal } = useStore();
  const navigate = useNavigate();

  if (!matchedProfile || !profile) return null;

  const handleKeepExploring = () => {
    setShowMatchModal(false);
  };

  const handleViewMatches = () => {
    setShowMatchModal(false);
    navigate("/matches");
  };

  return (
    <AnimatePresence>
      {showMatchModal && (
        <Fragment>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            onClick={handleKeepExploring}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-card max-w-md w-full rounded-xl shadow-xl overflow-hidden">
              {/* Header with gradient */}
              <div className="bg-gradient-to-r from-primary/80 to-secondary/80 p-6 text-white text-center">
                <motion.h2 
                  className="text-2xl font-bold mb-1"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  🎮 ¡Es un Match!
                </motion.h2>
                <motion.p 
                  className="text-white/90"
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Ahora podéis hablar y colaborar
                </motion.p>
              </div>

              {/* Avatars */}
              <div className="p-6 flex justify-center items-center gap-2 relative">
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4, type: "spring" }}
                >
                  <AvatarWithFallback
                    src={profile.avatar_url}
                    username={profile.username}
                    className="h-24 w-24 border-4"
                  />
                </motion.div>

                {/* Heart or connection icon in the middle */}
                <motion.div 
                  className="bg-primary rounded-full p-2 mx-2 shadow-lg"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", bounce: 0.6 }}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="text-white"
                  >
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                  </svg>
                </motion.div>

                <motion.div
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4, type: "spring" }}
                >
                  <AvatarWithFallback
                    src={matchedProfile.avatar_url}
                    username={matchedProfile.username}
                    className="h-24 w-24 border-4"
                  />
                </motion.div>
              </div>

              {/* User info */}
              <motion.div 
                className="px-6 pt-2 pb-4 text-center"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <h3 className="text-lg font-semibold mb-2">
                  Haz hecho match con {matchedProfile.username}
                </h3>
                {matchedProfile.games && matchedProfile.games.length > 0 && (
                  <p className="text-muted-foreground text-sm mb-4">
                    Juegos: {matchedProfile.games.join(", ")}
                  </p>
                )}
              </motion.div>

              {/* Actions */}
              <motion.div 
                className="p-4 flex flex-col gap-2 border-t border-border"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <Button onClick={handleViewMatches} className="w-full">
                  Ver Matches
                </Button>
                <Button onClick={handleKeepExploring} variant="secondary" className="w-full">
                  Seguir explorando
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </Fragment>
      )}
    </AnimatePresence>
  );
}
