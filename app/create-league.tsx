import { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';

import Button from '@/components/Button';
import { Text } from '@/components/Text';
import { useAuth } from '@/context/auth';
import { createLeague } from '@/utils/leagueUtils';
import { getTheme } from '@/colors';
import { useLocalization } from '@/context/localization';

export default function CreateLeagueScreen() {
  const theme = getTheme('light');
  const { t } = useLocalization();
  const router = useRouter();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultImage =
    'https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=400&h=400&fit=crop&crop=center';

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        t('permissionDenied'),
        t('galleryPermission')
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert(t('validationError'), t('leagueNameRequired'));
      return;
    }

    if (!user) {
      Alert.alert(t('error'), t('mustBeLoggedIn'));
      return;
    }

    setIsSubmitting(true);
    try {
      await createLeague({
        name: name.trim(),
        imageUrl: image || defaultImage,
        adminUserId: user.id,
      });
      router.back();
    } catch (error) {
      console.error('Failed to create league:', error);
      Alert.alert(t('error'), t('failedToCreateLeague'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text variant="h1" style={styles.title}>
        {t('createLeague')}
      </Text>
      <View style={styles.form}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: image || defaultImage }}
            style={styles.leagueImage}
            contentFit="cover"
          />
          <Button
            title={t('changeImage')}
            onPress={pickImage}
            variant="outline"
            size="small"
          />
        </View>
        <View style={styles.inputContainer}>
          <Text variant="label" style={styles.label}>
            {t('leagueName')}
          </Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.input}>{name}</Text>
          </View>
        </View>

        <Button
          title={isSubmitting ? t('creating') : t('createLeague')}
          onPress={handleSubmit}
          variant="primary"
          size="large"
          fullWidth
          disabled={isSubmitting}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
  },
  form: {
    gap: 24,
  },
  imageContainer: {
    alignItems: 'center',
    gap: 16,
  },
  leagueImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#000',
  },
  inputContainer: {},
  label: {
    marginBottom: 8,
  },
  inputWrapper: {
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  input: {
    fontSize: 16,
  },
});
