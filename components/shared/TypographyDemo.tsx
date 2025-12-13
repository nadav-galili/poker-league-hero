import { colors, getTheme } from '@/colors';
import { Typography } from '@/constants/typography';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../Text';

export function TypographyDemo() {
   const theme = getTheme('light');

   const variants = Object.keys(Typography) as (keyof typeof Typography)[];

   return (
      <ScrollView
         style={[styles.container, { backgroundColor: theme.background }]}
      >
         <View style={styles.content}>
            <Text variant="h1" color={theme.text} style={styles.header}>
               Space Grotesk Typography
            </Text>

            {variants.map((variant) => (
               <View key={variant} style={styles.variantContainer}>
                  <Text
                     variant="labelSmall"
                     color={colors.textMuted}
                     style={styles.variantLabel}
                  >
                     {variant.toUpperCase()}
                  </Text>
                  <Text variant={variant} color={theme.text}>
                     The quick brown fox jumps over the lazy dog
                  </Text>
               </View>
            ))}
         </View>
      </ScrollView>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
   },
   content: {
      padding: 20,
      gap: 24,
   },
   header: {
      textAlign: 'center',
      marginBottom: 20,
   },
   variantContainer: {
      gap: 8,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(0,0,0,0.1)',
   },
   variantLabel: {
      letterSpacing: 1,
   },
});

export default TypographyDemo;
