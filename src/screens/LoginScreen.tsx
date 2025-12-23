import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';

import { Field } from '@/components/Field';
import { PrimaryButton } from '@/components/PrimaryButton';
import { login } from '@/api/endpoints';
import { useAuth } from '@/auth/AuthContext';
import { friendlyError } from '@/utils/errors';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (!username.trim() || !password) {
      Alert.alert('Eksik bilgi', 'Kullanıcı adı ve şifre zorunlu.');
      return;
    }

    setLoading(true);
    try {
      const r = await login(username.trim(), password);
      await signIn(r.token, r.user);
    } catch (e) {
      Alert.alert('Hata', friendlyError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Takip</Text>
      <Text style={styles.sub}>API ile giriş yapın</Text>

      <Field label="Kullanıcı Adı" value={username} onChangeText={setUsername} placeholder="admin" />
      <Field label="Şifre" value={password} onChangeText={setPassword} placeholder="••••••" secureTextEntry />

      <PrimaryButton title="Giriş" onPress={onLogin} loading={loading} />

      <Text style={styles.hint}>
        İlk kurulumda Profil ekranından "API Base URL" alanını kendi adresinize göre güncelleyin.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 18, justifyContent: 'center', backgroundColor: '#F9FAFB' },
  title: { fontSize: 28, fontWeight: '800', color: '#111827' },
  sub: { marginTop: 6, marginBottom: 18, color: '#6B7280' },
  hint: { marginTop: 16, color: '#6B7280', fontSize: 12 },
});
