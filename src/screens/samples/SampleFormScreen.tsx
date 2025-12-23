import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';

import { Field } from '../../components/Field';
import { PrimaryButton } from '../../components/PrimaryButton';
import { apiPost, apiPut } from '../../api/endpoints';
import type { RootStackParamList, SamplesScreenNav } from '../../nav/types';
import type { Sample } from '../../models/types';

type R = RouteProp<RootStackParamList, 'SampleForm'>;

function todayISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function SampleFormScreen() {
  const nav = useNavigation<SamplesScreenNav>();
  const route = useRoute<R>();

  const mode = (route.params as any).mode as 'create' | 'edit';
  const existing: Sample | undefined = mode === 'edit' ? (route.params as any).sample : undefined;

  const [saving, setSaving] = useState(false);

  const [sampleNo, setSampleNo] = useState(existing?.sample_no ?? '');
  const [sampleDate, setSampleDate] = useState((existing?.sample_date ?? todayISO()).slice(0, 10));
  const [sampleName, setSampleName] = useState(existing?.sample_name ?? '');
  const [status, setStatus] = useState(existing?.status ?? '');
  const [note, setNote] = useState(existing?.note?.toString() ?? '');

  const title = useMemo(() => (mode === 'create' ? 'Yeni Numune' : 'Numune Düzenle'), [mode]);

  const submit = async () => {
    const req = {
      sample_no: sampleNo.trim(),
      sample_date: sampleDate.trim(),
      sample_name: sampleName.trim(),
      status: status.trim(),
      note: note.trim(),
    };

    const required = ['sample_no', 'sample_date', 'sample_name', 'status'] as const;
    for (const k of required) {
      if (!(req as any)[k] || String((req as any)[k]).trim() === '') {
        Alert.alert('Eksik Alan', `Lütfen doldurun: ${k}`);
        return;
      }
    }

    setSaving(true);
    try {
      if (mode === 'create') {
        const res = await apiPost<{ ok: true; sample: Sample }>('/samples', req);
        Alert.alert('Kaydedildi', 'Numune oluşturuldu.');
        nav.replace('SampleDetail', { id: res.sample.id });
      } else {
        const id = existing!.id;
        await apiPut<{ ok: true; sample: Sample }>(`/samples/${id}`, req);
        Alert.alert('Güncellendi', 'Numune güncellendi.');
        nav.goBack();
      }
    } catch (e: any) {
      Alert.alert('Hata', e?.message ?? 'İşlem başarısız');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: '800', marginBottom: 12 }}>{title}</Text>

      <Field label="Numune No" value={sampleNo} onChangeText={setSampleNo} />
      <Field label="Numune Tarihi (YYYY-MM-DD)" value={sampleDate} onChangeText={setSampleDate} />
      <Field label="Numune Adı" value={sampleName} onChangeText={setSampleName} />
      <Field label="Durum" value={status} onChangeText={setStatus} />
      <Field label="Not" value={note} onChangeText={setNote} multiline />

      <PrimaryButton title={saving ? 'Kaydediliyor...' : 'Kaydet'} disabled={saving} onPress={submit} />
      <View style={{ height: 10 }} />
      <PrimaryButton title="Vazgeç" variant="secondary" onPress={() => nav.goBack()} />
    </ScrollView>
  );
}
