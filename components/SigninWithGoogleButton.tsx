import { useLocalization } from '@/context/localization';
import { Image, Pressable, View } from 'react-native';
import { Text } from './Text';

export default function SignInWithGoogleButton({
   onPress,
   disabled,
}: {
   onPress: () => void;
   disabled?: boolean;
}) {
   const { t } = useLocalization();
   return (
      <Pressable onPress={onPress} disabled={disabled}>
         <View
            style={{
               width: '100%',
               height: 44,
               flexDirection: 'row',
               alignItems: 'center',
               justifyContent: 'center',
               borderRadius: 5,
               backgroundColor: '#fff',
               borderWidth: 1,
               borderColor: '#ccc',
            }}
         >
            <Image
               source={require('../assets/GoogleIcon.png')}
               style={{
                  width: 18,
                  height: 18,
                  marginRight: 6,
               }}
            />
            <Text>{t('continueWithGoogle')}</Text>
         </View>
      </Pressable>
   );
}
