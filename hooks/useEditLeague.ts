import { useAuth } from '@/context/auth';
import { useLocalization } from '@/context/localization';
import { uploadImageToR2 } from '@/utils/cloudflareR2';
import React, { useState } from 'react';
import { Alert } from 'react-native';

export interface UseEditLeagueResult {
   isEditModalVisible: boolean;
   setIsEditModalVisible: (visible: boolean) => void;
   isUpdatingLeague: boolean;
   handleUpdateLeague: (name: string, imageUri: string | null) => Promise<void>;
}

export interface UseEditLeagueProps {
   leagueId?: string;
   currentLeague?: {
      name: string;
      imageUrl?: string;
   } | null;
   onSuccess?: () => void;
}

export function useEditLeague({
   leagueId,
   currentLeague,
   onSuccess,
}: UseEditLeagueProps): UseEditLeagueResult {
   const { t } = useLocalization();
   const { fetchWithAuth } = useAuth();
   const [isEditModalVisible, setIsEditModalVisible] = useState(false);
   const [isUpdatingLeague, setIsUpdatingLeague] = useState(false);

   const handleUpdateLeague = async (name: string, imageUri: string | null) => {
      if (!currentLeague || !leagueId) return;
      try {
         setIsUpdatingLeague(true);

         // 1. Upload image if changed
         let uploadedImageUrl = imageUri;
         if (
            imageUri &&
            imageUri !== currentLeague.imageUrl &&
            !imageUri.startsWith('http')
         ) {
            try {
               uploadedImageUrl = await uploadImageToR2(
                  imageUri,
                  'league-images'
               );
            } catch (error) {
               console.error('Failed to upload image:', error);
               Alert.alert(t('error'), t('failedToUploadImage'));
               setIsUpdatingLeague(false);
               return;
            }
         }

         // 2. Call update API
         const response = await fetchWithAuth(`/api/leagues/${leagueId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               name,
               imageUrl: uploadedImageUrl,
            }),
         });

         if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || t('failedToUpdateLeague'));
         }

         // 3. Delete old image if changed and exists
         if (
            currentLeague.imageUrl &&
            uploadedImageUrl !== currentLeague.imageUrl &&
            currentLeague.imageUrl.includes('r2.dev')
         ) {
            try {
               await fetchWithAuth(
                  `/api/upload/image?url=${encodeURIComponent(
                     currentLeague.imageUrl
                  )}`,
                  {
                     method: 'DELETE',
                  }
               );
            } catch (e) {
               console.warn('Failed to delete old image', e);
            }
         }

         setIsEditModalVisible(false);
         if (onSuccess) {
            onSuccess();
         }
         Alert.alert(t('success'), t('leagueUpdatedSuccess'));
      } catch (error) {
         console.error('Update league failed:', error);
         Alert.alert(t('error'), t('failedToUpdateLeague'));
      } finally {
         setIsUpdatingLeague(false);
      }
   };

   return {
      isEditModalVisible,
      setIsEditModalVisible,
      isUpdatingLeague,
      handleUpdateLeague,
   };
}
