import Button from '@/components/Button';
import { Text } from '@/components/Text';
import {
   addBreadcrumb,
   captureException,
   captureMessage,
   setTag,
   setUser,
} from '@/utils/sentry';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Toast from 'react-native-toast-message';

/**
 * Debug component for testing Sentry integration
 * Only use this in development builds
 */
const SentryDebug: React.FC = () => {
   const testError = () => {
      try {
         throw new Error('Test error from Sentry Debug component');
      } catch (error) {
         captureException(error as Error, {
            testType: 'manual_error',
            component: 'SentryDebug',
            timestamp: new Date().toISOString(),
         });
         Toast.show({
            type: 'success',
            text1: 'Error Sent',
            text2: 'Test error has been sent to Sentry',
         });
      }
   };

   const testMessage = () => {
      captureMessage('Test message from Sentry Debug', 'info', {
         testType: 'manual_message',
         component: 'SentryDebug',
      });
      Toast.show({
         type: 'success',
         text1: 'Message Sent',
         text2: 'Test message has been sent to Sentry',
      });
   };

   const testBreadcrumb = () => {
      addBreadcrumb('User clicked breadcrumb test button', 'user_action', {
         component: 'SentryDebug',
         buttonType: 'breadcrumb_test',
      });
      Toast.show({
         type: 'info',
         text1: 'Breadcrumb Added',
         text2: 'Breadcrumb has been added to Sentry',
      });
   };

   const testUserContext = () => {
      setUser({
         id: 'test-user-123',
         email: 'test@example.com',
         username: 'testuser',
      });
      Toast.show({
         type: 'success',
         text1: 'User Set',
         text2: 'User context has been set in Sentry',
      });
   };

   const testTags = () => {
      setTag('test_component', 'SentryDebug');
      setTag('environment', __DEV__ ? 'development' : 'production');
      Toast.show({
         type: 'success',
         text1: 'Tags Set',
         text2: 'Tags have been set in Sentry',
      });
   };

   const testPerformance = () => {
      addBreadcrumb('Performance test started', 'performance');

      // Simulate some work
      setTimeout(() => {
         addBreadcrumb('Performance test completed', 'performance');
         Toast.show({
            type: 'success',
            text1: 'Performance Tracked',
            text2: 'Performance breadcrumbs added',
         });
      }, 1000);
   };

   const testAsyncError = async () => {
      try {
         // Simulate async operation that fails
         await new Promise((_, reject) => {
            setTimeout(() => {
               reject(new Error('Async operation failed'));
            }, 500);
         });
      } catch (error) {
         captureException(error as Error, {
            testType: 'async_error',
            operation: 'simulated_async_failure',
         });
         Toast.show({
            type: 'success',
            text1: 'Async Error Sent',
            text2: 'Async error has been sent to Sentry',
         });
      }
   };

   if (!__DEV__) {
      return null; // Don't render in production
   }

   return (
      <View style={styles.container}>
         <Text style={styles.title}>Sentry Debug Panel</Text>
         <Text style={styles.subtitle}>לבדיקת אינטגרציית Sentry</Text>

         <View style={styles.buttonContainer}>
            <Button title="Test Error" onPress={testError} />

            <Button title="Test Message" onPress={testMessage} />

            <Button title="Test Breadcrumb" onPress={testBreadcrumb} />

            <Button title="Set User Context" onPress={testUserContext} />

            <Button title="Set Tags" onPress={testTags} />

            <Button title="Test Performance" onPress={testPerformance} />

            <Button title="Test Async Error" onPress={testAsyncError} />
         </View>
      </View>
   );
};

const styles = StyleSheet.create({
   container: {
      padding: 20,
      backgroundColor: '#f5f5f5',
      margin: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#ddd',
   },
   title: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 8,
      textAlign: 'center',
   },
   subtitle: {
      fontSize: 14,
      color: '#666',
      marginBottom: 20,
      textAlign: 'center',
   },
   buttonContainer: {
      gap: 12,
   },
   button: {
      marginVertical: 4,
   },
});

export default SentryDebug;
