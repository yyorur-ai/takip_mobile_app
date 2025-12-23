import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Text, TextInput, View } from 'react-native';

import { useAuth } from '../../auth/AuthContext';
import { PrimaryButton } from '../../components/PrimaryButton';
import { apiGet } from '../../api/endpoints';
import { getApiBaseUrl, setApiBaseUrl } from '../../utils/env';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const [apiUrl, setApiUrl] = useState(getApiBaseUrl());
  const [ping, setPing] = useState<string>('');

  const doPing = useCallback(async () => {
    try {
      const r = await apiGet<{ ok: true; time: string }>(`/ping`);
      setPing(r.time);
    } catch (e: any) {
      Alert.alert('Hata', e?.message ?? 'Ping başarısız');
    }
  }, []);

  useEffect(() => {
    doPing().catch(() => {});
  }, [doPing]);

  return (
    <View style={{ flex: 1, padding: 12, gap: 10 }}>
      <Text style={{ fontSize: 18, fontWeight: '800' }}>Profil</Text>

      <Text>Kullanıcı: <Text style={{ fontWeight: '700' }}>{user?.username}</Text></Text>
      <Text>Rol: <Text style={{ fontWeight: '700' }}>{user?.role}</Text></Text>

      <View style={{ height: 10 }} />

      <Text style={{ fontWeight: '800' }}>API Base URL</Text>
      <Text style={{ color: '#666' }}>
        Örn: https://wolinux.com.tr/takip/api
      </Text>
      <TextInput
        value={apiUrl}
        onChangeText={setApiUrl}
        autoCapitalize="none"
        style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 10 }}
      />
      <PrimaryButton
        title="Kaydet"
        onPress={() => {
          const v = apiUrl.trim().replace(/\/+$/, '');
          if (!v) {
            Alert.alert('Hata', 'API URL boş olamaz.');
            return;
          }
          setApiBaseUrl(v);
          Alert.alert('Kaydedildi', 'API base URL güncellendi. Uygulamayı yeniden açmanız gerekebilir.');
        }}
      />

      <View style={{ height: 10 }} />

      <PrimaryButton title="Ping" variant="secondary" onPress={doPing} />
      {ping ? <Text style={{ color: '#666' }}>Sunucu zamanı: {ping}</Text> : null}

      <View style={{ height: 16 }} />

      <PrimaryButton title="Çıkış Yap" variant="secondary" onPress={logout} />
    </View>
  );
}
