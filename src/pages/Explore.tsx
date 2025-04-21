import { useRef, useState } from "react";
import { motion, PanInfo, useAnimation } from "framer-motion";
import { ProfileCard } from "@/components/ProfileCard";
import { MatchModal } from "@/components/MatchModal";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { ProfileCardSkeleton } from "@/components/ProfileCardSkeleton";
import { useExploreProfiles } from "@/hooks/useExploreProfiles";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const Explore = () => {
  const { user } = useAuth();
  const { profiles, isLoading, error, loadProfiles, setProfiles } = useExploreProfiles(user?.id);
  const [currentIndex, setCurrentIndex] = useState(0);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const cardControls = useAnimation();
  const { toast } = useToast();
  
  useEffect(() => {
    loadProfiles();
  }, []);
  
  const handleConnect = async () => {
    if (!profiles.length || currentIndex >= profiles.length || !user) return;
  
    const target = profiles[currentIndex];
    const targetId = target.id;
    const currentUserId = user.id;
  
    await cardControls.start({
      x: 300,
      opacity: 0,
      rotateZ: 20,
      transition: { duration: 0.3 },
    });
  
    const { error: swipeError } = await supabase.from("swipes").insert([
      {
        swiper_id: currentUserId,
        target_id: targetId,
        direction: "right",
      },
    ]);

    if (swipeError) {
      console.error("❌ Error al guardar el swipe:", swipeError.message);
      toast({
        title: "Error",
        description: "No se pudo enviar la solicitud.",
        variant: "destructive",
      });
      return;
    }

    console.log("✅ Swipe guardado:", currentUserId, "→", targetId);
    console.log("🟢 currentUserId:", currentUserId);
    console.log("🟣 targetId:", targetId);
    console.log(`🧭 Buscando reciprocidad: ¿ha hecho ${targetId} swipe a ${currentUserId} ?`);

    const { data: reciprocalSwipes, error: checkError } = await supabase
      .from("swipes")
      .select("*")
      .eq("swiper_id", targetId)
      .eq("target_id", currentUserId)
      .eq("direction", "right");

    console.log("🖊️ Swipes recíprocos encontrados:", reciprocalSwipes);

    if (checkError) {
      console.error("❌ Error comprobando reciprocidad:", checkError.message);
      return;
    }

    const isReciprocal = reciprocalSwipes && reciprocalSwipes.length > 0;

    if (isReciprocal) {
      console.log("🤝 Reciprocidad detectada. Creando match...");

      const { data: matchResult, error: matchError } = await supabase.rpc("create_match", {
        input_user_1: currentUserId,
        input_user_2: targetId,
      });

      if (matchError) {
        console.error("❌ Error creando match:", matchError.message);
        toast({
          title: "Error creando match",
          description: matchError.message,
          variant: "destructive",
        });
      } else {
        console.log("🎉 Match creado correctamente:", matchResult);
        toast({
          title: "🎮 ¡Es un match!",
          description: `Has hecho match con ${target.username}`,
        });
      }
    } else {
      console.log("🕐 No hay reciprocidad aún.");
      toast({
        title: "✅ Solicitud enviada",
        description: `Has conectado con ${target.username}`,
      });
    }

    setCurrentIndex((prev) => prev + 1);
    cardControls.set({ x: 0, opacity: 1, rotateZ: 0 });
  };
  
  const handlePass = async () => {
    if (!profiles.length || currentIndex >= profiles.length) return;
    
    await cardControls.start({ 
      x: -300, 
      opacity: 0,
      rotateZ: -20,
      transition: { duration: 0.3 } 
    });
    
    await swipe('left');
    
    setCurrentIndex(prev => prev + 1);
    
    cardControls.set({ x: 0, opacity: 1, rotateZ: 0 });
  };
  
  const handleDragEnd = async (e: any, info: PanInfo) => {
    const threshold = 100; // minimum distance to trigger swipe
    const velocity = 500; // minimum velocity to trigger swipe
    
    if (info.offset.x > threshold || info.velocity.x > velocity) {
      await handleConnect();
    } else if (info.offset.x < -threshold || info.velocity.x < -velocity) {
      await handlePass();
    } else {
      cardControls.start({ 
        x: 0, 
        opacity: 1,
        rotateZ: 0,
        transition: { type: "spring", stiffness: 300, damping: 20 } 
      });
    }
  };
  
  return (
    <MobileLayout>
      <div className="flex flex-col items-center h-full p-4">
        <div 
          ref={constraintsRef}
          className="relative w-full max-w-md mx-auto flex-1 flex items-center justify-center"
        >
          {isLoading ? (
            <div className="w-full">
              <ProfileCardSkeleton />
            </div>
          ) : error ? (
            <div className="text-center p-6 bg-card rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">Error</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={loadProfiles}>Try Again</Button>
            </div>
          ) : profiles.length === 0 || currentIndex >= profiles.length ? (
            <div className="text-center p-6 bg-card rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">No More Profiles</h3>
              <p className="text-muted-foreground mb-4">
                You have seen all available profiles.
              </p>
              <Button onClick={loadProfiles}>Refresh</Button>
            </div>
          ) : (
            <motion.div
              className="w-full"
              animate={cardControls}
            >
              <ProfileCard 
                profile={profiles[currentIndex]}
                onConnect={handleConnect}
                onPass={handlePass}
                drag="x"
                dragConstraints={constraintsRef}
                onDragEnd={handleDragEnd}
              />
            </motion.div>
          )}
        </div>
      </div>
      
      <MatchModal />
    </MobileLayout>
  );
};

export default Explore;
