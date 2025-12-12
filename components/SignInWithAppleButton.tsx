import { useAuth } from '@/context/auth';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Text } from './Text';

export function SignInWithAppleButton() {
   const { signInWithAppleWebBrowser } = useAuth();

   return (
      <Pressable onPress={signInWithAppleWebBrowser}>
         <View style={styles.container}>
            <Image
               source={require('../assets/AppleIcon.png')}
               style={styles.icon}
            />
            <Text variant="body" color="#fff">
               Continue with Apple
            </Text>
         </View>
      </Pressable>
   );
}

const styles = StyleSheet.create({
   container: {
      width: '100%',
      height: 44,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 5,
      backgroundColor: '#000',
      borderWidth: 2,
      borderColor: '#ffffff',
   },
   icon: {
      width: 24,
      height: 24,
      marginRight: 6,
   },
});
