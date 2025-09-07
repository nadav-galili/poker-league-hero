import {
   SpaceGrotesk_300Light,
   SpaceGrotesk_400Regular,
   SpaceGrotesk_500Medium,
   SpaceGrotesk_600SemiBold,
   SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import * as Font from 'expo-font';

export async function loadFonts(): Promise<void> {
   try {
      await Font.loadAsync({
         SpaceGrotesk_300Light,
         SpaceGrotesk_400Regular,
         SpaceGrotesk_500Medium,
         SpaceGrotesk_600SemiBold,
         SpaceGrotesk_700Bold,
      });
      console.log('Space Grotesk fonts loaded successfully');
   } catch (error) {
      console.error('Failed to load Space Grotesk fonts:', error);
      // Don't throw error - continue with system fonts
   }
}

export const fontNames = [
   'SpaceGrotesk_300Light',
   'SpaceGrotesk_400Regular',
   'SpaceGrotesk_500Medium',
   'SpaceGrotesk_600SemiBold',
   'SpaceGrotesk_700Bold',
] as const;

export function isFontLoaded(fontName: string): boolean {
   return Font.isLoaded(fontName);
}

export function areFontsLoaded(): boolean {
   return fontNames.every((fontName) => Font.isLoaded(fontName));
}
