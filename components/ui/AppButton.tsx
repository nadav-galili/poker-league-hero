import { colors } from '@/colors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

interface AppButtonProps {
   title?: string;
   width?: number | string;
   bgColor?: string;
   textColor?: string;
   onPress?: () => void;
   disabled?: boolean;
   icon?: keyof typeof Ionicons.glyphMap;
   iconSize?: number;
}

export const AppButton: React.FC<AppButtonProps> = ({
   title = 'Button',
   width = '100%',
   bgColor = colors.primary,
   textColor = colors.textInverse,
   onPress,
   disabled = false,
   icon,
   iconSize = 20,
}) => {
   return (
      <Pressable
         onPress={onPress}
         disabled={disabled}
         className="py-4 px-6 items-center rounded-lg justify-center border-[3px] border-black shadow-lg active:translate-y-1 active:opacity-80"
         style={{
            width: width as number,
            backgroundColor: disabled ? colors.textMuted : bgColor,
            shadowColor: colors.shadow,
            shadowOffset: { width: 4, height: 4 },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: 8,
         }}
      >
         <View className="flex-row items-center gap-2">
            {icon && (
               <Ionicons
                  name={icon}
                  size={iconSize}
                  color={disabled ? colors.textSecondary : textColor}
               />
            )}
            <Text
               className="text-base font-bold uppercase tracking-wide"
               style={{
                  color: disabled ? colors.textSecondary : textColor,
               }}
            >
               {title}
            </Text>
         </View>
      </Pressable>
   );
};
