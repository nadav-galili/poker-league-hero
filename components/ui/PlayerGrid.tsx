/**
 * Reusable PlayerGrid component for displaying players in a grid layout
 */

import { getTheme } from '@/colors';
import { Text } from '@/components/Text';
import { useLocalization } from '@/context/localization';
import { LeagueMember } from '@/types';
import React from 'react';
import { FlatList, View } from 'react-native';
import { PlayerCard } from './PlayerCard';

interface PlayerGridProps {
   members: LeagueMember[];
   selectedPlayerIds: string[];
   onPlayerToggle: (playerId: string) => void;
   variant?: 'grid' | 'list';
   showSelectionIndicator?: boolean;
   numColumns?: number;
   loading?: boolean;
   error?: string | null;
   theme?: 'light' | 'dark';
}

export function PlayerGrid({
   members,
   selectedPlayerIds,
   onPlayerToggle,
   variant = 'grid',
   showSelectionIndicator = true,
   numColumns = 3,
   loading = false,
   error = null,
   theme: themeProp = 'light',
}: PlayerGridProps) {
   const theme = getTheme(themeProp);
   const { t } = useLocalization();
   const selectedSet = new Set(selectedPlayerIds);

   const renderPlayerItem = ({ item }: { item: LeagueMember }) => {
      return (
         <PlayerCard
            player={item}
            isSelected={selectedSet.has(item.id)}
            onPress={onPlayerToggle}
            variant={variant}
            showSelectionIndicator={showSelectionIndicator}
         />
      );
   };

   const renderEmptyState = () => (
      <View className="items-center py-15 px-5">
         <Text variant="h3" color={theme.text} className="text-center mb-3">
            {t('noPlayersFound')}
         </Text>
         <Text
            variant="body"
            color={theme.textMuted}
            className="text-center leading-5"
         >
            {t('noPlayersFoundMessage')}
         </Text>
      </View>
   );

   const renderErrorState = () => (
      <View className="items-center py-15 px-5">
         <Text variant="h3" color={theme.error} className="text-center mb-3">
            {t('error')}
         </Text>
         <Text
            variant="body"
            color={theme.textMuted}
            className="text-center leading-5"
         >
            {error || t('unknownError')}
         </Text>
      </View>
   );

   const renderSeparator = () => <View className="h-1.5" />;

   if (error) {
      return renderErrorState();
   }

   return (
      <FlatList
         data={members}
         renderItem={renderPlayerItem}
         keyExtractor={(item) => item.id}
         numColumns={variant === 'grid' ? numColumns : 1}
         key={variant} // Force re-render when variant changes
         columnWrapperStyle={
            variant === 'grid' && numColumns > 1
               ? { justifyContent: 'flex-start', paddingHorizontal: 12 }
               : undefined
         }
         contentContainerStyle={[
            variant === 'grid'
               ? {
                    padding: 12,
                    paddingBottom: 120,
                    flexGrow: members.length === 0 ? 1 : 0,
                    justifyContent:
                       members.length === 0 ? 'center' : 'flex-start',
                 }
               : {
                    padding: 8,
                    paddingBottom: 120,
                    flexGrow: members.length === 0 ? 1 : 0,
                    justifyContent:
                       members.length === 0 ? 'center' : 'flex-start',
                 },
         ]}
         showsVerticalScrollIndicator={false}
         ItemSeparatorComponent={
            variant === 'grid' ? renderSeparator : undefined
         }
         ListEmptyComponent={renderEmptyState}
         scrollEnabled={!loading}
         className="flex-1"
      />
   );
}
