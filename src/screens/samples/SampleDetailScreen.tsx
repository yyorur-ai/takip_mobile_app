import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Image, ScrollView, Text, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

import type { RootStackParamList, SamplesScreenNav } from '../../nav/types';
import type { ImageItem, Sample } from '../../models/types';
import { apiDelete, apiGet, apiPostForm } from '../../api/endpoints';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Row } from '../../components/Row';
import { baseAppUrl } from '../../utils/env';
import { useAuth } from '../../auth/AuthContext';

type R = RouteProp<RootStackParamList, 'SampleDetail'>;

type ImgCat = 'sample' | 'sample_shipment' | 'sample_labels';

export default function SampleDetailScreen() {
  const nav = useNavigation<SamplesScreenNav>();
  const route = useRoute<R>();
  const { user } = useAuth();
  const canEdit = user?.role === 'admin' || user?.role === 'assistant';

  const id = route.params.id;

  const [loading, setLoading] = useState(true);
  const [sample, setSample] = useState<Sample | null>(null);
  const [imgCat, setImgCat] = useState<ImgCat>('sample');
  const [images, setImages] = useState<ImageItem[]>([]);

  const fullImgUrl = useMemo(() => {
    const appRoot = baseAppUrl();
    return (rel: string) => {
      if (!rel) return '';
      if (rel.startsWith('http')) return rel;
      const r = rel.replace(/^\/+/, '');
      return `${appRoot}/${r}`;
    };
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const s = await apiGet<{ sample: Sample }>(`/samples/${id}`);
      setSample(s.sample);
      const im = await apiGet<{ items: ImageItem[] }>(`/samples/${id}/images?category=${imgCat}`);
      setImages(im.items ?? []);
    } finally {
      setLoading(false);
    }
  }, [id, imgCat]);

  useEffect(() => {
    loadAll().catch((e: any) => Alert.alert('Hata', e?.message ?? 'Yükleme hatası'));
  }, [loadAll]);

  useEffect(() => {
    (async () => {
      try {
        const im = await apiGet<{ items: ImageItem[] }>(`/samples/${id}/images?category=${imgCat}`);
        setImages(im.items ?? []);
      } catch {
        // ignore
      }
    })();
  }, [id, imgCat]);

  const delSample = async () => {
    if (!sample) return;
    Alert.alert('Sil', 'Numuneyi silmek istiyor musunuz?', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiDelete(`/samples/${sample.id}`);
            Alert.alert('Silindi', 'Numune silindi.');
            nav.goBack();
          } catch (e: any) {
            Alert.alert('Hata', e?.message ?? 'Silme hatası');
          }
        }
      }
    ]);
  };

  const uploadImages = async () => {
    if (!canEdit || !sample) return;

    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('İzin gerekli', 'Fotoğrafları seçmek için izin verin.');
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      quality: 0.8,
      mediaTypes: ImagePicker.MediaTypeOptions.Images
    });

    if (res.canceled) return;

    const form = new FormData();
    form.append('category', imgCat);

    for (const asset of res.assets) {
      const uri = asset.uri;
      const name = uri.split('/').pop() ?? `image_${Date.now()}.jpg`;
      const ext = (name.split('.').pop() ?? 'jpg').toLowerCase();
      const type = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
      // @ts-ignore
      form.append('images[]', { uri, name, type });
    }

    try {
      await apiPostForm(`/samples/${sample.id}/images`, form);
      const im = await apiGet<{ items: ImageItem[] }>(`/samples/${id}/images?category=${imgCat}`);
      setImages(im.items ?? []);
      Alert.alert('Yüklendi', 'Resimler yüklendi.');
    } catch (e: any) {
      Alert.alert('Hata', e?.message ?? 'Yükleme hatası');
    }
  };

  const delImage = async (imageId: number) => {
    if (!canEdit) return;
    Alert.alert('Sil', 'Resmi silmek istiyor musunuz?', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiDelete(`/samples/${id}/images/${imageId}`);
            const im = await apiGet<{ items: ImageItem[] }>(`/samples/${id}/images?category=${imgCat}`);
            setImages(im.items ?? []);
          } catch (e: any) {
            Alert.alert('Hata', e?.message ?? 'Silme hatası');
          }
        }
      }
    ]);
  };

  if (loading || !sample) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: '900' }}>{sample.sample_no} — {sample.sample_name}</Text>
      <Text style={{ color: '#666', marginTop: 4 }}>{String(sample.sample_date).slice(0, 10)} | {sample.status}</Text>
      {sample.note ? <Text style={{ color: '#444', marginTop: 6 }}>{sample.note}</Text> : null}

      {canEdit ? (
        <Row style={{ gap: 10, marginTop: 12 }}>
          <View style={{ flex: 1 }}>
            <PrimaryButton title="Düzenle" onPress={() => nav.navigate('SampleForm', { mode: 'edit', sample })} />
          </View>
          <View style={{ flex: 1 }}>
            <PrimaryButton title="Sil" variant="secondary" onPress={delSample} />
          </View>
        </Row>
      ) : null}

      <View style={{ height: 18 }} />

      <Text style={{ fontSize: 16, fontWeight: '800' }}>Resimler</Text>
      <Row style={{ gap: 8, marginTop: 10, flexWrap: 'wrap' as any }}>
        {(['sample','sample_shipment','sample_labels'] as ImgCat[]).map(c => (
          <View key={c} style={{ marginRight: 8, marginBottom: 8 }}>
            <PrimaryButton
              title={c}
              variant={imgCat === c ? 'primary' : 'secondary'}
              onPress={() => setImgCat(c)}
            />
          </View>
        ))}
      </Row>

      {canEdit ? (
        <View style={{ marginTop: 8 }}>
          <PrimaryButton title="Resim Yükle" onPress={uploadImages} />
        </View>
      ) : null}

      <View style={{ height: 10 }} />

      {images.length === 0 ? (
        <Text style={{ color: '#666' }}>Bu kategoride resim yok.</Text>
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {images.map(img => {
            const uri = fullImgUrl(img.image_path);
            return (
              <View key={img.id} style={{ width: 110 }}>
                <Image source={{ uri }} style={{ width: 110, height: 110, borderRadius: 12, backgroundColor: '#eee' }} />
                <Text numberOfLines={2} style={{ fontSize: 11, color: '#666', marginTop: 4 }}>{img.original_name ?? img.image_path}</Text>
                {canEdit ? (
                  <View style={{ marginTop: 6 }}>
                    <PrimaryButton title="Sil" variant="secondary" onPress={() => delImage(img.id)} />
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      )}

      <View style={{ height: 20 }} />
      <PrimaryButton title="Yenile" variant="secondary" onPress={() => loadAll()} />
    </ScrollView>
  );
}
