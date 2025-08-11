import * as Font from "expo-font";

const fontMap = {
  "SpaceGrotesk-Regular": require("../assets/fonts/SpaceGrotesk-Regular.ttf"),
  "SpaceGrotesk-Medium": require("../assets/fonts/SpaceGrotesk-Medium.ttf"),
  "SpaceGrotesk-SemiBold": require("../assets/fonts/SpaceGrotesk-SemiBold.ttf"),
  "SpaceGrotesk-Bold": require("../assets/fonts/SpaceGrotesk-Bold.ttf"),
};

// Optional fonts that might fail to load
const optionalFonts = {
  "SpaceGrotesk-Light": require("../assets/fonts/SpaceGrotesk-Light.ttf"),
};

export async function loadFonts(): Promise<void> {
  try {
    // Load core fonts first
    await Font.loadAsync(fontMap);

    // Try to load optional fonts
    try {
      await Font.loadAsync(optionalFonts);
    } catch (error) {
      console.warn("Failed to load optional fonts:", error);
    }
  } catch (error) {
    console.error("Failed to load core fonts:", error);
    throw error;
  }
}

export const fontNames = Object.keys(fontMap) as Array<keyof typeof fontMap>;

export function isFontLoaded(fontName: keyof typeof fontMap): boolean {
  return Font.isLoaded(fontName);
}

export function areFontsLoaded(): boolean {
  return fontNames.every((fontName) => Font.isLoaded(fontName));
}
