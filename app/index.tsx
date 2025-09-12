import { getTheme } from '@/colors';
import { LoadingState } from '@/components/LoadingState';
import LoginForm from '@/components/LoginForm';
import { useAuth } from '@/context/auth';
import { Redirect } from 'expo-router';
import { ScrollView } from 'react-native';

export default function Index() {
   const { user, isLoading } = useAuth();
   const theme = getTheme('light');

   if (isLoading) {
      return <LoadingState />;
   }

   if (!user) {
      return (
         <ScrollView
            style={{ flex: 1, backgroundColor: theme.background }}
            contentContainerStyle={{ flexGrow: 1, paddingTop: 20 }}
            showsVerticalScrollIndicator={false}
         >
            <LoginForm />
         </ScrollView>
      );
   }

   // Redirect to home tabs when user is logged in
   return <Redirect href={'/(tabs)/my-leagues' as any} />;
}
