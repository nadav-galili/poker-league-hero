import { colors, getTheme } from '@/colors';
import { Text } from '@/components/Text';
import { useLocalization } from '@/context/localization';
import { GameData } from '@/hooks/useGameData';
import React from 'react';
import { View } from 'react-native';

interface GameSummaryProps {
   game: GameData;
}

const GameSummary: React.FC<GameSummaryProps> = ({ game }) => {
   const theme = getTheme('light');
   const { t } = useLocalization();

   return (
      <View
         className="m-4 p-4 rounded-xl border-3 border-primary shadow-lg elevation-8"
         style={{ backgroundColor: theme.surfaceElevated }}
      >
         <View className="flex-row items-center justify-between mb-4">
            <Text variant="h3" color={theme.text} className="tracking-wide">
               {t('gameInProgress')}
            </Text>
            <View className="px-2 py-1 rounded-xl border-2 border-primary bg-success">
               <Text variant="captionSmall">{game.status.toUpperCase()}</Text>
            </View>
         </View>

         <View className="flex-row justify-around">
            <View className="items-center">
               <Text variant="h2" color={colors.primary}>
                  {t('currency')}
                  {game.totals.totalBuyIns}
               </Text>
               <Text variant="captionSmall" color={theme.textMuted}>
                  {t('totalBuyIns')}
               </Text>
            </View>
            <View className="items-center">
               <Text variant="h2" color={colors.secondary}>
                  {t('currency')}
                  {game.totals.totalBuyOuts}
               </Text>
               <Text variant="captionSmall" color={theme.textMuted}>
                  {t('totalBuyOuts')}
               </Text>
            </View>
            <View className="items-center">
               <Text variant="h2" color={theme.text}>
                  {game.totals.activePlayers}
               </Text>
               <Text variant="captionSmall" color={theme.textMuted}>
                  Active Players
               </Text>
            </View>
         </View>
      </View>
   );
};

export default GameSummary;
