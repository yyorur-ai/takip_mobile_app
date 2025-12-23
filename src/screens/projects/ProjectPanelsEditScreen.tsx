import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';

import type { RootStackParamList, ProjectsScreenNav } from '../../nav/types';
import type { Panel, ProjectPanelItem } from '../../models/types';
import { apiGet, apiPut } from '../../api/endpoints';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Row } from '../../components/Row';

type R = RouteProp<RootStackParamList, 'ProjectPanelsEdit'>;

function toNum(v: any): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export default function ProjectPanelsEditScreen() {
  const nav = useNavigation<ProjectsScreenNav>();
  const route = useRoute<R>();
  const projectId = route.params.projectId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [panelDefs, setPanelDefs] = useState<Panel[]>([]);
  const [items, setItems] = useState<ProjectPanelItem[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const defs = await apiGet<{ items: Panel[] }>('/panels');
      const existing = await apiGet<{ items: ProjectPanelItem[] }>(`/projects/${projectId}/panels`);
      setPanelDefs(defs.items);
      setItems((existing.items ?? []).map(it => ({
        panel_id: Number((it as any).panel_id ?? it.panel_id),
        qty: toNum((it as any).qty ?? 0),
        width_cm: toNum((it as any).width_cm ?? 0),
        height_cm: toNum((it as any).height_cm ?? 0),
        sqm: toNum((it as any).sqm ?? 0),
        weight_kg: toNum((it as any).weight_kg ?? 0),
        panel_name: (it as any).panel_name ?? (it as any).name
      })));
    } catch (e: any) {
      Alert.alert('Hata', e?.message ?? 'Yükleme hatası');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  const addRow = () => {
    const first = panelDefs[0];
    if (!first) {
      Alert.alert('Tanım yok', 'Önce Panel tanımı eklenmeli.');
      return;
    }
    setItems(prev => [...prev, { panel_id: first.id, qty: 1, width_cm: 0, height_cm: 0, sqm: 0, weight_kg: 0 }]);
  };

  const removeRow = (idx: number) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const save = async () => {
    setSaving(true);
    try {
      // API expects {items:[...]}
      const payload = {
        items: items.map(it => ({
          panel_id: Number(it.panel_id),
          qty: toNum(it.qty),
          width_cm: toNum(it.width_cm),
          height_cm: toNum(it.height_cm),
          sqm: toNum(it.sqm),
          weight_kg: toNum(it.weight_kg)
        }))
      };
      await apiPut(`/projects/${projectId}/panels`, payload);
      Alert.alert('Kaydedildi', 'Paneller güncellendi.');
      nav.goBack();
    } catch (e: any) {
      Alert.alert('Hata', e?.message ?? 'Kaydetme hatası');
    } finally {
      setSaving(false);
    }
  };

  const panelName = useMemo(() => {
    const m = new Map(panelDefs.map(p => [p.id, p.name]));
    return (id: number) => m.get(id) ?? `#${id}`;
  }, [panelDefs]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: '800', marginBottom: 10 }}>Proje Panelleri</Text>

      <PrimaryButton title="+ Satır Ekle" onPress={addRow} />
      <View style={{ height: 10 }} />

      {items.length === 0 ? (
        <Text style={{ color: '#666' }}>Kayıt yok.</Text>
      ) : null}

      {items.map((it, idx) => (
        <View key={idx} style={{ borderWidth: 1, borderColor: '#eee', borderRadius: 14, padding: 12, marginBottom: 10 }}>
          <Text style={{ fontWeight: '700', marginBottom: 8 }}>Panel: {panelName(Number(it.panel_id))}</Text>

          <Row style={{ gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: '#666' }}>Panel ID</Text>
              <TextInput
                value={String(it.panel_id)}
                onChangeText={(v) => setItems(prev => prev.map((x,i) => i===idx ? { ...x, panel_id: toNum(v) } : x))}
                keyboardType="numeric"
                style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 10 }}
              />
              <Text style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                Not: Panel ID girerek değiştirin. Tanımlar: /Tanımlar > Paneller
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

          <Row style={{ gap: 10, marginTop: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: '#666' }}>Genişlik (cm)</Text>
              <TextInput
                value={String(it.width_cm)}
                onChangeText={(v) => setItems(prev => prev.map((x,i) => i===idx ? { ...x, width_cm: toNum(v) } : x))}
                keyboardType="numeric"
                style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 10 }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: '#666' }}>Yükseklik (cm)</Text>
              <TextInput
                value={String(it.height_cm)}
                onChangeText={(v) => setItems(prev => prev.map((x,i) => i===idx ? { ...x, height_cm: toNum(v) } : x))}
                keyboardType="numeric"
                style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 10 }}
              />
            </View>
          </Row>

          <Row style={{ gap: 10, marginTop: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: '#666' }}>m²</Text>
              <TextInput
                value={String(it.sqm)}
                onChangeText={(v) => setItems(prev => prev.map((x,i) => i===idx ? { ...x, sqm: toNum(v) } : x))}
                keyboardType="numeric"
                style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 10 }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: '#666' }}>Ağırlık (kg)</Text>
              <TextInput
                value={String(it.weight_kg)}
                onChangeText={(v) => setItems(prev => prev.map((x,i) => i===idx ? { ...x, weight_kg: toNum(v) } : x))}
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
