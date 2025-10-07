import { colors } from '@/colors';
import { useLocalization } from '@/context/localization';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { View } from 'react-native';

export default function TabLayout() {
   const { t } = useLocalization();

   return (
      <Tabs
         screenOptions={{
            headerShown: false,
            tabBarStyle: {
               backgroundColor: '#1a0033', // Dark purple background matching gradient
               borderTopWidth: 0, // Remove heavy borders
               borderWidth: 0,
               paddingBottom: 12,
               paddingTop: 8,
               paddingHorizontal: 20,
               height: 75, // Reduced height for modern look
               elevation: 10,
               shadowColor: '#000000',
               shadowOffset: { width: 0, height: -4 }, // Subtle shadow
               shadowOpacity: 0.3,
               shadowRadius: 8, // Soft shadow
               position: 'absolute',
               marginHorizontal: 16, // Margin for pill shape
               marginBottom: 24, // Lift from bottom
               borderRadius: 28, // Rounded pill shape
               left: 0,
               right: 0,
            },
            tabBarLabelStyle: {
               fontSize: 11,
               fontWeight: '600', // Moderate weight
               letterSpacing: 0.5, // Subtle spacing
               textTransform: 'none', // Normal case
               marginTop: 4,
               textShadowColor: 'transparent', // Remove text shadow
            },
            tabBarActiveTintColor: '#FFFFFF', // White for active
            tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)', // Semi-transparent white for inactive
            tabBarIconStyle: {
               marginTop: 2,
            },
            tabBarItemStyle: {
               borderRadius: 20, // Rounded corners
               marginHorizontal: 4,
               marginVertical: 2,
               paddingVertical: 4,
               paddingHorizontal: 8,
            },
            tabBarBackground: () => (
               <View
                  style={{
                     flex: 1,
                     backgroundColor: 'transparent',
                     borderRadius: 28,
                     overflow: 'hidden',
                  }}
               />
            ),
         }}
      >
         <Tabs.Screen
            name="my-leagues"
            options={{
               title: t('myLeagues'),
               tabBarIcon: ({ color, focused, size }) => (
                  <View
                     style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: focused ? 48 : 44,
                        height: focused ? 32 : 28,
                        backgroundColor: focused
                           ? 'rgba(255, 255, 255, 0.15)'
                           : 'transparent',
                        borderRadius: 16, // Rounded corners for modern pill shape
                        paddingHorizontal: focused ? 12 : 8,
                     }}
                  >
                     <Ionicons
                        name={focused ? 'trophy' : 'trophy-outline'}
                        size={20}
                        color={color}
                        style={{
                           opacity: focused ? 1 : 0.8,
                        }}
                     />
                  </View>
               ),
            }}
         />
         <Tabs.Screen
            name="account"
            options={{
               title: t('account'),
               tabBarIcon: ({ color, focused, size }) => (
                  <View
                     style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: focused ? 48 : 44,
                        height: focused ? 32 : 28,
                        backgroundColor: focused
                           ? 'rgba(255, 255, 255, 0.15)'
                           : 'transparent',
                        borderRadius: 16, // Rounded corners for modern pill shape
                        paddingHorizontal: focused ? 12 : 8,
                     }}
                  >
                     <Ionicons
                        name={focused ? 'person' : 'person-outline'}
                        size={20}
                        color={color}
                        style={{
                           opacity: focused ? 1 : 0.8,
                        }}
                     />
                  </View>
               ),
            }}
         />
      </Tabs>
   );
}
