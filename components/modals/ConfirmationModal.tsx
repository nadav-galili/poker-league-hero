import { colors, getTheme } from '@/colors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

interface ConfirmationModalProps {
   visible: boolean;
   title: string;
   message: string;
   confirmText?: string;
   cancelText?: string;
   isDestructive?: boolean;
   isProcessing?: boolean;
   onConfirm: () => void;
   onCancel: () => void;
}

export function ConfirmationModal({
   visible,
   title,
   message,
   confirmText = 'Yes',
   cancelText = 'No',
   isDestructive = false,
   isProcessing = false,
   onConfirm,
   onCancel,
}: ConfirmationModalProps) {
   const theme = getTheme('light');

   return (
      <Modal visible={visible} transparent={false} animationType="fade">
         <View className="flex-1 bg-background justify-center items-center p-4">
            <View
               className="rounded-2xl border-4 border-primary shadow-lg overflow-hidden"
               style={{ backgroundColor: theme.surface }}
            >
               {/* Header */}
               <View
                  className="px-6 py-4 border-b-2 border-primary flex-row items-center gap-3"
                  style={{ backgroundColor: colors.primary }}
               >
                  <Ionicons
                     name={isDestructive ? 'warning' : 'help-circle'}
                     size={24}
                     color={isDestructive ? colors.error : colors.text}
                  />
                  <Text className="text-lg font-bold text-white flex-1">
                     {title}
                  </Text>
               </View>

               {/* Content */}
               <View className="px-6 py-6">
                  <Text className="text-base text-white leading-6">
                     {message}
                  </Text>
               </View>

               {/* Buttons */}
               <View className="flex-row gap-3 px-6 py-4 border-t-2 border-primary">
                  <TouchableOpacity
                     onPress={onCancel}
                     disabled={isProcessing}
                     className="flex-1 py-3 rounded-lg border-2 border-primary bg-white/10 active:bg-white/20"
                     style={{ opacity: isProcessing ? 0.6 : 1 }}
                  >
                     <Text className="text-center font-bold text-white text-base">
                        {cancelText}
                     </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                     onPress={onConfirm}
                     disabled={isProcessing}
                     className={`flex-1 py-3 rounded-lg border-2 border-primary active:scale-95 ${
                        isDestructive ? 'bg-error' : 'bg-primary'
                     }`}
                     style={{ opacity: isProcessing ? 0.6 : 1 }}
                  >
                     <Text className="text-center font-bold text-white text-base">
                        {isProcessing ? 'Processing...' : confirmText}
                     </Text>
                  </TouchableOpacity>
               </View>
            </View>
         </View>
      </Modal>
   );
}
