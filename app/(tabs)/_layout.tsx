import { colors } from '@/colors';
import { useLocalization } from '@/context/localization';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Dimensions, View } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export default function TabLayout() {
   const { t } = useLocalization();

   return (
      <Tabs
         screenOptions={{
            headerShown: false,
            tabBarStyle: {
               backgroundColor: colors.text, // Pure black background
               borderTopWidth: 8, // Even thicker border
               borderTopColor: colors.accent, // Neon yellow top border
               borderLeftWidth: 6,
               borderRightWidth: 6,
               borderLeftColor: colors.text,
               borderRightColor: colors.text,
               paddingBottom: 16,
               paddingTop: 16,
               paddingHorizontal: 12,
               height: 100, // Taller for more presence
               elevation: 24,
               shadowColor: colors.text,
               shadowOffset: { width: 0, height: -12 }, // More aggressive shadow
               shadowOpacity: 1,
               shadowRadius: 0, // Hard shadow
               position: 'absolute', // Ensure it floats above content
            },
            tabBarLabelStyle: {
               fontSize: 10,
               fontWeight: '900', // Black weight
               letterSpacing: 2, // Wide letter spacing
               textTransform: 'uppercase',
               marginTop: 8,
               textShadowColor: colors.text,
               textShadowOffset: { width: 2, height: 2 },
               textShadowRadius: 0,
            },
            tabBarActiveTintColor: colors.accent, // Neon yellow for active
            tabBarInactiveTintColor: colors.background, // White for inactive
            tabBarIconStyle: {
               marginTop: 4,
            },
            tabBarItemStyle: {
               borderRadius: 0, // Sharp corners
               marginHorizontal: 8,
               marginVertical: 4,
               paddingVertical: 8,
               paddingHorizontal: 4,
            },
            tabBarBackground: () => (
               <View
                  style={{
                     flex: 1,
                     backgroundColor: colors.primary,
                     position: 'relative',
                     overflow: 'hidden',
                  }}
               >
                  {/* Top accent stripe */}
                  <View
                     style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 8,
                        backgroundColor: colors.accent,
                     }}
                  />
               </View>
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
                        width: focused ? 44 : 40,
                        height: focused ? 44 : 40,
                        backgroundColor: focused
                           ? colors.accent
                           : 'transparent',
                        borderWidth: focused ? 3 : 2,
                        borderColor: focused ? colors.text : color,
                        borderRadius: 0, // Sharp corners
                        shadowColor: focused ? colors.text : 'transparent',
                        shadowOffset: { width: 3, height: 3 },
                        shadowOpacity: focused ? 1 : 0,
                        shadowRadius: 0,
                        elevation: focused ? 8 : 0,
                     }}
                  >
                     <Ionicons
                        name={focused ? 'trophy' : 'trophy-outline'}
                        size={focused ? 24 : 22}
                        color={focused ? colors.text : color}
                        style={{
                           textShadowColor: focused
                              ? colors.text
                              : 'transparent',
                           textShadowOffset: { width: 1, height: 1 },
                           textShadowRadius: 0,
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
                        width: focused ? 44 : 40,
                        height: focused ? 44 : 40,
                        backgroundColor: focused
                           ? colors.secondary
                           : 'transparent',
                        borderWidth: focused ? 3 : 2,
                        borderColor: focused ? colors.text : color,
                        borderRadius: 0, // Sharp corners
                        shadowColor: focused ? colors.text : 'transparent',
                        shadowOffset: { width: 3, height: 3 },
                        shadowOpacity: focused ? 1 : 0,
                        shadowRadius: 0,
                        elevation: focused ? 8 : 0,
                     }}
                  >
                     <Ionicons
                        name={focused ? 'person' : 'person-outline'}
                        size={focused ? 24 : 22}
                        color={focused ? colors.text : color}
                        style={{
                           textShadowColor: focused
                              ? colors.text
                              : 'transparent',
                           textShadowOffset: { width: 1, height: 1 },
                           textShadowRadius: 0,
                        }}
                     />
                  </View>
               ),
            }}
         />
      </Tabs>
   );
}
