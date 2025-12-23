import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Image, ScrollView, Text, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

import type { RootStackParamList, ProjectsScreenNav } from '../../nav/types';
import type { ImageItem, Project, ProjectConsumableItem, ProjectPanelItem } from '../../models/types';
import { apiDelete, apiGet, apiPostForm } from '../../api/endpoints';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Row } from '../../components/Row';
import { baseAppUrl } from '../../utils/env';
import { useAuth } from '../../auth/AuthContext';

type R = RouteProp<RootStackParamList, 'ProjectDetail'>;

type ImgCat = 'project' | 'production' | 'label' | 'shipment' | 'sample';

export default function ProjectDetailScreen() {
  const nav = useNavigation<ProjectsScreenNav>();
  const route = useRoute<R>();
  const { user } = useAuth();
  const canEdit = user?.role === 'admin' || user?.role === 'assistant';

  const id = route.params.id;

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [panels, setPanels] = useState<ProjectPanelItem[]>([]);
  const [consumables, setConsumables] = useState<ProjectConsumableItem[]>([]);
  const [imgCat, setImgCat] = useState<ImgCat>('project');
  const [images, setImages] = useState<ImageItem[]>([]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const p = await apiGet<{ project: Project }>(`/projects/${id}`);
      setProject(p.project);

      const pn = await apiGet<{ items: ProjectPanelItem[] }>(`/projects/${id}/panels`);
      setPanels(pn.items ?? []);

      const cn = await apiGet<{ items: ProjectConsumableItem[] }>(`/projects/${id}/consumables`);
      setConsumables(cn.items ?? []);

      const im = await apiGet<{ items: ImageItem[] }>(`/projects/${id}/images?category=${imgCat}`);
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
        const im = await apiGet<{ items: ImageItem[] }>(`/projects/${id}/images?category=${imgCat}`);
        setImages(im.items ?? []);
      } catch {
        // ignore
      }
    })();
  }, [id, imgCat]);

  const fullImgUrl = useMemo(() => {
    const appRoot = baseAppUrl();
    return (rel: string) => {
      if (!rel) return '';
      if (rel.startsWith('http')) return rel;
      const r = rel.replace(/^\/+/, '');
      return `${appRoot}/${r}`;
    };
  }, []);

  const delProject = async () => {
    if (!project) return;
    Alert.alert('Sil', 'Projeyi silmek istiyor musunuz?', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiDelete(`/projects/${project.id}`);
            Alert.alert('Silindi', 'Proje silindi.');
            nav.goBack();
          } catch (e: any) {
            Alert.alert('Hata', e?.message ?? 'Silme hatası');
          }
        }
      }
    ]);
  };

  const uploadImages = async () => {
    if (!canEdit || !project) return;

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
      await apiPostForm(`/projects/${project.id}/images`, form);
      const im = await apiGet<{ items: ImageItem[] }>(`/projects/${id}/images?category=${imgCat}`);
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
            await apiDelete(`/projects/${id}/images/${imageId}`);
            const im = await apiGet<{ items: ImageItem[] }>(`/projects/${id}/images?category=${imgCat}`);
            setImages(im.items ?? []);
          } catch (e: any) {
            Alert.alert('Hata', e?.message ?? 'Silme hatası');
          }
        }
      }
    ]);
  };

  const openEditPanels = () => nav.navigate('ProjectPanelsEdit', { projectId: id });
  const openEditConsumables = () => nav.navigate('ProjectConsumablesEdit', { projectId: id });

  if (loading || !project) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: '900' }}>{project.project_no} — {project.project_name}</Text>
      <Text style={{ color: '#444', marginTop: 4 }}>{project.company_name}</Text>
      <Text style={{ color: '#666', marginTop: 4 }}>{String(project.project_date).slice(0, 10)} | {project.status}</Text>

      {canEdit ? (
        <Row style={{ gap: 10, marginTop: 12 }}>
          <View style={{ flex: 1 }}>
            <PrimaryButton title="Düzenle" onPress={() => nav.navigate('ProjectForm', { mode: 'edit', project })} />
          </View>
          <View style={{ flex: 1 }}>
            <PrimaryButton title="Sil" variant="secondary" onPress={delProject} />
          </View>
        </Row>
      ) : null}

      <View style={{ height: 14 }} />

      <Text style={{ fontSize: 16, fontWeight: '800' }}>Paneller</Text>
      <Text style={{ color: '#666', marginTop: 4 }}>Kayıt: {panels.length}</Text>

      {panels.slice(0, 5).map((it, idx) => (
        <Text key={idx} style={{ marginTop: 6 }}>
          • {(it as any).panel_name ?? (it as any).name ?? `Panel #${(it as any).panel_id}`} — Adet: {(it as any).qty} — m²: {(it as any).sqm}
        </Text>
      ))}

      {canEdit ? (
        <View style={{ marginTop: 10 }}>
          <PrimaryButton title="Panelleri Düzenle" onPress={openEditPanels} />
        </View>
      ) : null}

      <View style={{ height: 14 }} />

      <Text style={{ fontSize: 16, fontWeight: '800' }}>Sarflar</Text>
      <Text style={{ color: '#666', marginTop: 4 }}>Kayıt: {consumables.length}</Text>

      {consumables.slice(0, 8).map((it, idx) => (
        <Text key={idx} style={{ marginTop: 6 }}>
          • {(it as any).consumable_name ?? (it as any).name ?? `Sarf #${(it as any).consumable_id}`} — Adet: {(it as any).qty}
        </Text>
      ))}

      {canEdit ? (
        <View style={{ marginTop: 10 }}>
          <PrimaryButton title="Sarfları Düzenle" onPress={openEditConsumables} />
        </View>
      ) : null}

      <View style={{ height: 18 }} />

      <Text style={{ fontSize: 16, fontWeight: '800' }}>Resimler</Text>
      <Row style={{ gap: 8, marginTop: 10, flexWrap: 'wrap' as any }}>
        {(['project','production','label','shipment','sample'] as ImgCat[]).map(c => (
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
