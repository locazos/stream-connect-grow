
import { useEffect, useRef, useState } from "react";
import { motion, PanInfo, useAnimation } from "framer-motion";
import { ProfileCard } from "@/components/ProfileCard";
import { MatchModal } from "@/components/MatchModal";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import useStore from "@/store/useStore";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/lib/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

const Explore = () => {
  const { user, profiles, setProfiles, swipe, isLoading, setIsLoading, error, setError } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const cardControls = useAnimation();
  const { toast } = useToast();
  
  useEffect(() => {
    // Load profiles
    loadProfiles();
  }, []);
  
  // Load profiles from Supabase
  const loadProfiles = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Get profiles that are not the current user
      // and that the current user has not already swiped on
      console.log('Loading profiles for user', user.id);
      
      // First, get all the profiles that the user has already swiped on
      const { data: swipedData, error: swipedError } = await supabase
        .from('swipes')
        .select('target_id')
        .eq('swiper_id', user.id);
      
      if (swipedError) {
        console.error('Error loading swiped profiles:', swipedError);
        setError("Error loading swiped profiles");
        return;
      }
      
      // Get the IDs of profiles that have been swiped on
      const swipedIds = swipedData.map(swipe => swipe.target_id);
      
      // Add the current user's ID to the list of IDs to exclude
      const excludeIds = [...swipedIds, user.id];
      
      // Get profiles that are not in the exclude list
      let query = supabase
        .from('profiles')
        .select('*');
      
      if (excludeIds.length > 0) {
        query = query.not('id', 'in', `(${excludeIds.join(',')})`);
      }
      
      const { data: profilesData, error: profilesError } = await query;
      
      if (profilesError) {
        console.error('Error loading profiles:', profilesError);
        setError("Error loading profiles");
        return;
      }
      
      console.log('Loaded profiles:', profilesData);
      setProfiles(profilesData);
      setCurrentIndex(0);
      
    } catch (error) {
      console.error('Error in loadProfiles:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle swipe right (connect)
  const handleConnect = async () => {
    if (!profiles.length || currentIndex >= profiles.length || !user) return;
  
    const target = profiles[currentIndex];
    const targetId = target.id;
    const currentUserId = user.id;
  
    // Animate card
    await cardControls.start({
      x: 300,
      opacity: 0,
      rotateZ: 20,
      transition: { duration: 0.3 },
    });
  
    // 1. Insert swipe
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

// 2. Logs para depurar reciprocidad
console.log("🟢 currentUserId:", currentUserId);
console.log("🟣 targetId:", targetId);
console.log("🔁 Buscando reciprocidad: ¿ha hecho", targetId, "swipe a", currentUserId, "?");

// 3. Comprobar reciprocidad
const { data: reciprocalSwipes, error: checkError } = await supabase
  .from("swipes")
  .select("*")
  .eq("swiper_id", targetId)
  .eq("target_id", currentUserId)
  .eq("direction", "right")
  .order("created_at", { ascending: false });

if (checkError) {
  console.error("❌ Error comprobando reciprocidad:", checkError.message);
  return;
}

console.log("🧪 Swipes recíprocos encontrados:", reciprocalSwipes);

const reciprocalSwipe = reciprocalSwipes?.[0];

if (reciprocalSwipe) {
  console.log("🤝 Reciprocidad detectada. Creando match...");

  const { data: matchResult, error: matchError } = await supabase.rpc("create_match", {
    user_1: currentUserId,
    user_2: targetId,
  });

  if (matchError) {
    console.error("❌ Error creando match:", matchError.message);
  } else {
    console.log("🎉 Match creado:", matchResult);
    toast({
      title: "🎮 ¡Es un match!",
      description: `Has hecho match con ${target.username}`,
    });
  }
} else {
  console.log("⏳ No hay reciprocidad aún.");
  toast({
    title: "✅ Solicitud enviada",
    description: `Has conectado con ${target.username}`,
  });
}


  
    // Pasar al siguiente
    setCurrentIndex((prev) => prev + 1);
    cardControls.set({ x: 0, opacity: 1, rotateZ: 0 });
  };
  
  
  // Handle swipe left (pass)
  const handlePass = async () => {
    if (!profiles.length || currentIndex >= profiles.length) return;
    
    // Animate card to the left
    await cardControls.start({ 
      x: -300, 
      opacity: 0,
      rotateZ: -20,
      transition: { duration: 0.3 } 
    });
    
    // Perform swipe action
    await swipe('left');
    
    // Move to next card
    setCurrentIndex(prev => prev + 1);
    
    // Reset animation
    cardControls.set({ x: 0, opacity: 1, rotateZ: 0 });
  };
  
  // Handle drag end for manual swiping
  const handleDragEnd = async (e: any, info: PanInfo) => {
    const threshold = 100; // minimum distance to trigger swipe
    const velocity = 500; // minimum velocity to trigger swipe
    
    if (info.offset.x > threshold || info.velocity.x > velocity) {
      // Swiped right
      await handleConnect();
    } else if (info.offset.x < -threshold || info.velocity.x < -velocity) {
      // Swiped left
      await handlePass();
    } else {
      // Not swiped enough, return to center
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
              <Button onClick={loadProfiles}>Intentar de nuevo</Button>
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center p-6 bg-card rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">No hay más perfiles</h3>
              <p className="text-muted-foreground mb-4">
                Has visto todos los perfiles disponibles.
              </p>
              <Button onClick={loadProfiles}>Actualizar</Button>
            </div>
          ) : currentIndex >= profiles.length ? (
            <div className="text-center p-6 bg-card rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">No hay más perfiles</h3>
              <p className="text-muted-foreground mb-4">
                Has visto todos los perfiles disponibles.
              </p>
              <Button onClick={loadProfiles}>Actualizar</Button>
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
      
      {/* Match Modal */}
      <MatchModal />
    </MobileLayout>
  );
};

// Skeleton loader for profile card
const ProfileCardSkeleton = () => (
  <div className="w-full bg-card shadow-lg rounded-xl overflow-hidden animate-pulse">
    <div className="h-56 sm:h-64 bg-muted flex items-center justify-center">
      <Skeleton className="h-32 w-32 rounded-full" />
    </div>
    <div className="p-4">
      <Skeleton className="h-4 w-24 mb-4" />
      <div className="mb-4">
        <Skeleton className="h-3 w-16 mb-2" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-3 w-16 mb-2" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-2/3" />
    </div>
    <div className="p-4 border-t border-border flex gap-4 justify-center">
      <Skeleton className="h-14 w-14 rounded-full" />
      <Skeleton className="h-14 w-14 rounded-full" />
    </div>
  </div>
);

export default Explore;
