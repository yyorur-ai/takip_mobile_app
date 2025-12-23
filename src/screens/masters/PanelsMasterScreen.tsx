import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Text, TextInput, View } from 'react-native';

import { apiDelete, apiGet, apiPost, apiPut } from '../../api/endpoints';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Row } from '../../components/Row';
import { useAuth } from '../../auth/AuthContext';
import type { Panel } from '../../models/types';

export default function PanelsMasterScreen() {
  const { user } = useAuth();
  const canEdit = user?.role === 'admin' || user?.role === 'assistant';

  const [items, setItems] = useState<Panel[]>([]);
  const [name, setName] = useState('');

  const load = useCallback(async () => {
    const res = await apiGet<{ items: Panel[] }>('/panels');
    setItems(res.items ?? []);
  }, []);

  useEffect(() => {
    load().catch(() => {});
  }, [load]);

  const add = async () => {
    if (!canEdit) return;
    if (!name.trim()) {
      Alert.alert('Eksik', 'Panel adı girin.');
      return;
    }
    try {
      await apiPost('/panels', { name: name.trim() });
      setName('');
      await load();
    } catch (e: any) {
      Alert.alert('Hata', e?.message ?? 'İşlem hatası');
    }
  };

  const edit = async (id: number, newName: string) => {
    if (!canEdit) return;
    try {
      await apiPut(`/panels/${id}`, { name: newName.trim() });
      await load();
    } catch (e: any) {
      Alert.alert('Hata', e?.message ?? 'İşlem hatası');
    }
  };

  const del = async (id: number) => {
    if (!canEdit) return;
    Alert.alert('Sil', 'Bu paneli silmek istiyor musunuz?', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiDelete(`/panels/${id}`);
            await load();
          } catch (e: any) {
            Alert.alert('Hata', e?.message ?? 'Silme hatası');
          }
        }
      }
    ]);
  };

  return (
    <View style={{ flex: 1, padding: 12 }}>
      {canEdit ? (
        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontWeight: '800', marginBottom: 6 }}>Yeni Panel</Text>
          <Row style={{ gap: 10 }}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Panel adı"
              style={{ flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 10 }}
            />
            <PrimaryButton title="Ekle" onPress={add} />
          </Row>
        </View>
      ) : (
        <Text style={{ color: '#999', marginBottom: 10 }}>Bu hesap tanım ekleyemez/düzenleyemez.</Text>
      )}

      <FlatList
        data={items}
        keyExtractor={(it) => String(it.id)}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
            <Text style={{ fontSize: 15, fontWeight: '700' }}>#{item.id} — {item.name}</Text>
            {canEdit ? (
              <Row style={{ gap: 10, marginTop: 8 }}>
                <PrimaryButton
                  title="Adı Düzenle"
                  variant="secondary"
                  onPress={() => {
                    Alert.prompt?.('Panel Adı', 'Yeni adı girin', (text) => {
                      if (text && text.trim()) edit(item.id, text);
                    }, 'plain-text', item.name);
                  }}
                />
                <PrimaryButton title="Sil" variant="secondary" onPress={() => del(item.id)} />
              </Row>
            ) : null}
          </View>
        )}
      />

      {canEdit ? (
        <Text style={{ marginTop: 10, color: '#666' }}>
          Not: Android'te "Adı Düzenle" için prompt yerine hızlı bir düzenleme ekranı isterseniz ekleyebilirim.
        </Text>
      ) : null}
    </View>
  );
}
