import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';

import type { RootStackParamList, ProjectsScreenNav } from '../../nav/types';
import type { Consumable, ProjectConsumableItem } from '../../models/types';
import { apiGet, apiPut } from '../../api/endpoints';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Row } from '../../components/Row';

type R = RouteProp<RootStackParamList, 'ProjectConsumablesEdit'>;

function toNum(v: any): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export default function ProjectConsumablesEditScreen() {
  const nav = useNavigation<ProjectsScreenNav>();
  const route = useRoute<R>();
  const projectId = route.params.projectId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [defs, setDefs] = useState<Consumable[]>([]);
  const [items, setItems] = useState<ProjectConsumableItem[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await apiGet<{ items: Consumable[] }>('/consumables');
      const existing = await apiGet<{ items: ProjectConsumableItem[] }>(`/projects/${projectId}/consumables`);
      setDefs(d.items);
      setItems((existing.items ?? []).map(it => ({
        consumable_id: Number((it as any).consumable_id ?? it.consumable_id),
        qty: toNum((it as any).qty ?? 0),
        consumable_name: (it as any).consumable_name ?? (it as any).name
      })));
    } catch (e: any) {
      Alert.alert('Hata', e?.message ?? 'Yükleme hatası');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  const addRow = () => {
    const first = defs[0];
    if (!first) {
      Alert.alert('Tanım yok', 'Önce Sarf tanımı eklenmeli.');
      return;
    }
    setItems(prev => [...prev, { consumable_id: first.id, qty: 1 }]);
  };

  const removeRow = (idx: number) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        items: items.map(it => ({
          consumable_id: Number(it.consumable_id),
          qty: toNum(it.qty)
        }))
      };
      await apiPut(`/projects/${projectId}/consumables`, payload);
      Alert.alert('Kaydedildi', 'Sarflar güncellendi.');
      nav.goBack();
    } catch (e: any) {
      Alert.alert('Hata', e?.message ?? 'Kaydetme hatası');
    } finally {
      setSaving(false);
    }
  };

  const nameById = useMemo(() => {
    const m = new Map(defs.map(x => [x.id, x.name]));
    return (id: number) => m.get(id) ?? `#${id}`;
  }, [defs]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: '800', marginBottom: 10 }}>Proje Sarfları</Text>

      <PrimaryButton title="+ Satır Ekle" onPress={addRow} />
      <View style={{ height: 10 }} />

      {items.length === 0 ? (
        <Text style={{ color: '#666' }}>Kayıt yok.</Text>
      ) : null}

      {items.map((it, idx) => (
        <View key={idx} style={{ borderWidth: 1, borderColor: '#eee', borderRadius: 14, padding: 12, marginBottom: 10 }}>
          <Text style={{ fontWeight: '700', marginBottom: 8 }}>Sarf: {nameById(Number(it.consumable_id))}</Text>

          <Row style={{ gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: '#666' }}>Sarf ID</Text>
              <TextInput
                value={String(it.consumable_id)}
                onChangeText={(v) => setItems(prev => prev.map((x,i) => i===idx ? { ...x, consumable_id: toNum(v) } : x))}
                keyboardType="numeric"
                style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 10 }}
              />
              <Text style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                Not: Sarf ID girerek değiştirin. Tanımlar: /Tanımlar > Sarflar
              </Text>
            </View>
            <View style={{ width: 90 }}>
              <Text style={{ fontSize: 12, color: '#666' }}>Adet</Text>
              <TextInput
                value={String(it.qty)}
                onChangeText={(v) => setItems(prev => prev.map((x,i) => i===idx ? { ...x, qty: toNum(v) } : x))}
                keyboardType="numeric"
                style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 10 }}
              />
            </View>
          </Row>

          <View style={{ marginTop: 10 }}>
            <PrimaryButton title="Satırı Sil" variant="secondary" onPress={() => removeRow(idx)} />
          </View>
        </View>
      ))}

      <PrimaryButton title={saving ? 'Kaydediliyor...' : 'Kaydet'} disabled={saving} onPress={save} />
    </ScrollView>
  );
}
