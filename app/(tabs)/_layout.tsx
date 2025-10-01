import { colors, getTheme } from '@/colors';
import { useLocalization } from '@/context/localization';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { View } from 'react-native';

export default function TabLayout() {
   const theme = getTheme('light');
   const { t } = useLocalization();

   return (
      <Tabs
         screenOptions={{
            headerShown: false,
            tabBarStyle: {
               backgroundColor: theme.primary,
               borderTopWidth: 6, // Thicker neo-brutalist border
               borderTopColor: theme.border,
               borderLeftWidth: 4,
               borderRightWidth: 4,
               borderLeftColor: theme.border,
               borderRightColor: theme.border,
               paddingBottom: 12,
               paddingTop: 12,
               paddingHorizontal: 8,
               height: 88, // Increased height for better touch targets
               elevation: 20,
               shadowColor: colors.text,
               shadowOffset: { width: 0, height: -8 }, // Stronger shadow
               shadowOpacity: 1, // Full opacity for brutal shadow
               shadowRadius: 0, // Hard shadow
            },
            tabBarLabelStyle: {
               fontSize: 11,
               fontWeight: '900', // Heavier weight
               letterSpacing: 1.2, // More spacing
               textTransform: 'uppercase',
               marginTop: 6,
               textShadowColor: 'rgba(0,0,0,0.5)',
               textShadowOffset: { width: 1, height: 1 },
               textShadowRadius: 0,
            },
            tabBarActiveTintColor: theme.accent, // Neon yellow for active
            tabBarInactiveTintColor: 'rgba(255,255,255,0.7)',
            tabBarIconStyle: {
               marginTop: 6,
               transform: [{ scale: 1.1 }], // Slightly larger icons
            },
            tabBarItemStyle: {
               borderRadius: 0, // Remove rounded corners
               marginHorizontal: 4,
               marginVertical: 6,
               paddingVertical: 4,
            },
            tabBarBackground: () => (
               // Custom background with geometric accent
               <View style={{
                  flex: 1,
                  backgroundColor: theme.primary,
                  position: 'relative',
               }}>
                  <View style={{
                     position: 'absolute',
                     top: -3,
                     left: 20,
                     width: 60,
                     height: 6,
                     backgroundColor: theme.accent,
                     transform: [{ skewX: '-15deg' }],
                  }} />
                  <View style={{
                     position: 'absolute',
                     top: -3,
                     right: 20,
                     width: 60,
                     height: 6,
                     backgroundColor: theme.secondary,
                     transform: [{ skewX: '15deg' }],
                  }} />
               </View>
            ),
         }}
      >
         <Tabs.Screen
            name="my-leagues"
            options={{
               title: t('myLeagues'),
               tabBarIcon: ({ color, size }) => (
                  <Ionicons name="trophy" size={size} color={color} />
               ),
            }}
         />
         <Tabs.Screen
            name="account"
            options={{
               title: t('account'),
               tabBarIcon: ({ color, size }) => (
                  <Ionicons name="person" size={size} color={color} />
               ),
            }}
         />
      </Tabs>
   );
}
