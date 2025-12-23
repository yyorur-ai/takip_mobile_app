import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';

import { Field } from '../../components/Field';
import { PrimaryButton } from '../../components/PrimaryButton';
import { apiPost, apiPut } from '../../api/endpoints';
import type { Project } from '../../models/types';
import type { RootStackParamList } from '../../nav/types';

const STATUSES = [
  'Beklemede',
  'Üretim Yapılıyor',
  'Zımpara Yapılıyor',
  'Vintage/Boya Yapılıyor',
  'Paketleniyor',
  'Paketlendi',
  'Tamamlandı',
  'İptal Edildi'
];

function todayISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

type R = RouteProp<RootStackParamList, 'ProjectForm'>;

export default function ProjectFormScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<R>();
  const params: any = route.params ?? { mode: 'create' };

  const mode: 'create' | 'edit' = params?.mode ?? 'create';
  const existing: Project | undefined = mode === 'edit' ? params.project : undefined;

  const [projectNo, setProjectNo] = useState(existing?.project_no ?? '');
  const [projectDate, setProjectDate] = useState(String(existing?.project_date ?? todayISO()).slice(0, 10));
  const [targetShipmentDate, setTargetShipmentDate] = useState(String(existing?.target_shipment_date ?? '').slice(0, 10));
  const [shipmentDate, setShipmentDate] = useState(String(existing?.shipment_date ?? '').slice(0, 10));
  const [companyName, setCompanyName] = useState(existing?.company_name ?? '');
  const [projectName, setProjectName] = useState(existing?.project_name ?? '');
  const [status, setStatus] = useState(existing?.status ?? 'Beklemede');
  const [vehicleNote, setVehicleNote] = useState(existing?.vehicle_note ?? '');
  const [totalSqm, setTotalSqm] = useState(String(existing?.total_sqm ?? '0'));
  const [totalWeight, setTotalWeight] = useState(String(existing?.total_weight_kg ?? '0'));

  const title = useMemo(() => (mode === 'create' ? 'Yeni Proje' : 'Proje Düzenle'), [mode]);

  const chooseStatus = () => {
    const buttons = STATUSES.map(s => ({ text: s, onPress: () => setStatus(s) }));
    Alert.alert('Durum Seç', 'Proje durumu', [...buttons, { text: 'İptal', style: 'cancel' }]);
  };

  const onSave = async () => {
    try {
      const required = [
        { k: 'project_no', v: projectNo },
        { k: 'project_date', v: projectDate },
        { k: 'company_name', v: companyName },
        { k: 'project_name', v: projectName },
        { k: 'status', v: status }
      ];
      for (const r of required) {
        if (!String(r.v ?? '').trim()) {
          Alert.alert('Eksik Alan', `${r.k} zorunlu.`);
          return;
        }
      }

      const payload = {
        project_no: projectNo.trim(),
        project_date: projectDate.trim(),
        target_shipment_date: targetShipmentDate.trim() ? targetShipmentDate.trim() : null,
        shipment_date: shipmentDate.trim() ? shipmentDate.trim() : null,
        company_name: companyName.trim(),
        project_name: projectName.trim(),
        status: status.trim(),
        vehicle_note: vehicleNote.trim(),
        total_sqm: Number(totalSqm || 0),
        total_weight_kg: Number(totalWeight || 0)
      };

      if (mode === 'create') {
        const res = await apiPost<{ ok: true; project: Project }>(`/projects`, payload);
        Alert.alert('Başarılı', 'Proje oluşturuldu.');
        nav.replace('ProjectDetail', { id: res.project.id });
      } else {
        const id = existing?.id;
        if (!id) throw new Error('Proje id bulunamadı.');
        await apiPut<{ ok: true; project: Project }>(`/projects/${id}`, payload);
        Alert.alert('Başarılı', 'Proje güncellendi.');
        nav.goBack();
      }
    } catch (e: any) {
      Alert.alert('Hata', e?.message ?? 'İşlem başarısız.');
    }
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 12, paddingBottom: 40 }}>
      <Text style={{ fontSize: 18, fontWeight: '800', marginBottom: 12 }}>{title}</Text>

      <Field label="Proje No" value={projectNo} onChangeText={setProjectNo} placeholder="65060" />
      <Field label="Proje Tarihi (YYYY-AA-GG)" value={projectDate} onChangeText={setProjectDate} placeholder="2025-12-24" />
      <Field label="Hedef Sevk Tarihi (ops)" value={targetShipmentDate} onChangeText={setTargetShipmentDate} placeholder="2025-12-31" />
      <Field label="Sevk Tarihi (ops)" value={shipmentDate} onChangeText={setShipmentDate} placeholder="2026-01-02" />

      <Field label="Firma" value={companyName} onChangeText={setCompanyName} placeholder="Ziraat Bankası" />
      <Field label="Proje Adı" value={projectName} onChangeText={setProjectName} placeholder="İstiklal Caddesi Şubesi" />

      <View style={{ marginBottom: 12 }}>
        <Text style={{ fontWeight: '700', marginBottom: 6 }}>Durum</Text>
        <PrimaryButton title={status} onPress={chooseStatus} />
      </View>

      <Field label="Araç Notu" value={vehicleNote} onChangeText={setVehicleNote} placeholder="Plaka / Not" />
      <Field label="Toplam m²" value={totalSqm} onChangeText={setTotalSqm} keyboardType="decimal-pad" />
      <Field label="Toplam KG" value={totalWeight} onChangeText={setTotalWeight} keyboardType="decimal-pad" />

      <PrimaryButton title="Kaydet" onPress={onSave} />
    </ScrollView>
  );
}
