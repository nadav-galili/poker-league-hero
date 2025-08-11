import * as Font from "expo-font";

const fontMap = {
  "SpaceGrotesk-Light": require("../assets/fonts/SpaceGrotesk-Light.ttf"),
  "SpaceGrotesk-Regular": require("../assets/fonts/SpaceGrotesk-Regular.ttf"),
  "SpaceGrotesk-Medium": require("../assets/fonts/SpaceGrotesk-Medium.ttf"),
  "SpaceGrotesk-SemiBold": require("../assets/fonts/SpaceGrotesk-SemiBold.ttf"),
  "SpaceGrotesk-Bold": require("../assets/fonts/SpaceGrotesk-Bold.ttf"),
};

export async function loadFonts(): Promise<void> {
  await Font.loadAsync(fontMap);
}

export const fontNames = Object.keys(fontMap) as Array<keyof typeof fontMap>;

export function isFontLoaded(fontName: keyof typeof fontMap): boolean {
  return Font.isLoaded(fontName);
}

export function areFontsLoaded(): boolean {
  return fontNames.every((fontName) => Font.isLoaded(fontName));
}
