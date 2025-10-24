import { useEffect } from "react";
import { soundManager } from "@/utils/sounds";

export const useSound = () => {
  useEffect(() => {
    const initializeOnInteraction = () => {
      soundManager.initialize();
      window.removeEventListener("click", initializeOnInteraction);
      window.removeEventListener("touchstart", initializeOnInteraction);
    };

    window.addEventListener("click", initializeOnInteraction);
    window.addEventListener("touchstart", initializeOnInteraction);

    return () => {
      window.removeEventListener("click", initializeOnInteraction);
      window.removeEventListener("touchstart", initializeOnInteraction);
    };
  }, []);

  const playLeverPull = () => {
    soundManager.playLeverPull();
  };

  const playBoxOpen = () => {
    soundManager.playBoxOpen();
  };

  const playItemReveal = (
    collection: Parameters<typeof soundManager.playItemReveal>[0],
  ) => {
    soundManager.playItemReveal(collection);
  };

  const playCoinInsert = () => {
    soundManager.playCoinInsert();
  };

  const playButtonClick = () => {
    soundManager.play("buttonClick");
  };

  const playThemeChange = (themeId: string) => {
    soundManager.playThemeChange(themeId);
  };

  return {
    playLeverPull,
    playBoxOpen,
    playItemReveal,
    playCoinInsert,
    playButtonClick,
    playThemeChange,
  };
};
