import React from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { PrimaryButton } from '../../components/PrimaryButton';
import { useAuth } from '../../auth/AuthContext';
import type { ProjectsScreenNav } from '../../nav/types';

export default function MastersScreen() {
  const nav = useNavigation<ProjectsScreenNav>();
  const { user } = useAuth();
  const canEdit = user?.role === 'admin' || user?.role === 'assistant';

  return (
    <View style={{ flex: 1, padding: 12, gap: 10 }}>
      <Text style={{ fontSize: 18, fontWeight: '800' }}>Tanımlar</Text>
      <Text style={{ color: '#666' }}>
        Panel ve Sarf listeleri. (Sadece admin/assistant düzenler)
      </Text>

      <PrimaryButton title="Paneller" onPress={() => nav.navigate('PanelsMaster')} />
      <PrimaryButton title="Sarflar" onPress={() => nav.navigate('ConsumablesMaster')} />

      {!canEdit ? (
        <Text style={{ marginTop: 10, color: '#999' }}>
          Bu hesap tanımları düzenleyemez; sadece görüntüleyebilir.
        </Text>
      ) : null}
    </View>
  );
}
