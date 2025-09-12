import { colors, getTheme } from '@/colors';
import { Text } from '@/components/Text';
import { useLocalization } from '@/context/localization';
import { LeagueMember } from '@/hooks/useGameData';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { FlatList, Modal, TouchableOpacity, View } from 'react-native';

interface AddPlayerModalProps {
   visible: boolean;
   availableMembers: LeagueMember[];
   isProcessing: boolean;
   onClose: () => void;
   onAddPlayer: (member: LeagueMember) => void;
}

const AddPlayerModal: React.FC<AddPlayerModalProps> = ({
   visible,
   availableMembers,
   isProcessing,
   onClose,
   onAddPlayer,
}) => {
   const theme = getTheme('light');
   const { t, isRTL } = useLocalization();

   const renderMemberItem = ({ item }: { item: LeagueMember }) => (
      <TouchableOpacity
         className="flex-row items-center p-4 rounded-xl border-3 border-black shadow-sm elevation-4"
         style={{ backgroundColor: theme.surfaceElevated }}
         onPress={() => onAddPlayer(item)}
         disabled={isProcessing}
      >
         <Image
            source={{
               uri:
                  item.profileImageUrl ||
                  'https://via.placeholder.com/50x50/cccccc/666666?text=?',
            }}
            className="w-12.5 h-12.5 rounded-lg border-2 border-black mr-3"
            contentFit="cover"
         />
         <View className="flex-1">
            <Text
               variant="h4"
               color={theme.text}
               className="tracking-wide mb-0.5"
            >
               {item.fullName}
            </Text>
            <Text
               variant="body"
               color={theme.textMuted}
               className="text-xs tracking-wide"
            >
               {item.role.toUpperCase()}
            </Text>
         </View>
         <Ionicons
            name={isRTL ? 'chevron-back' : 'chevron-forward'}
            size={24}
            color={theme.textMuted}
         />
      </TouchableOpacity>
   );

   return (
      <Modal
         visible={visible}
         animationType="slide"
         presentationStyle="pageSheet"
         onRequestClose={onClose}
      >
         <View className="flex-1" style={{ backgroundColor: theme.background }}>
            {/* Header */}
            <View
               className="flex-row items-center justify-between px-5 pt-15 pb-4 border-b-6 border-black"
               style={{ backgroundColor: colors.primary }}
            >
               <TouchableOpacity onPress={onClose} className="p-2">
                  <Ionicons name="close" size={24} color={colors.textInverse} />
               </TouchableOpacity>
               <Text
                  className="text-xl font-bold uppercase tracking-wide"
                  style={{ color: colors.textInverse }}
               >
                  {t('selectPlayerToAdd')}
               </Text>
               <View className="w-10" />
            </View>

            <FlatList
               data={availableMembers}
               renderItem={renderMemberItem}
               keyExtractor={(item) => item.id}
               contentContainerStyle={{ padding: 16 }}
               showsVerticalScrollIndicator={false}
               ItemSeparatorComponent={() => <View className="h-2" />}
               ListEmptyComponent={
                  <View className="items-center py-15 px-5">
                     <Text
                        variant="h3"
                        color={theme.text}
                        className="text-center mb-3"
                     >
                        No Available Players
                     </Text>
                     <Text
                        variant="body"
                        color={theme.textMuted}
                        className="text-center"
                     >
                        All league members are already in this game.
                     </Text>
                  </View>
               }
            />
         </View>
      </Modal>
   );
};

export default AddPlayerModal;
