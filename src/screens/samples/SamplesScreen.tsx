import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { apiGet } from '../../api/endpoints';
import { Sample } from '../../models/types';
import { Row } from '../../components/Row';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useAuth } from '../../auth/AuthContext';
import type { SamplesScreenNav } from '../../nav/types';

export default function SamplesScreen() {
  const nav = useNavigation<SamplesScreenNav>();
  const { user } = useAuth();
  const canEdit = user?.role === 'admin' || user?.role === 'assistant';

  const [q, setQ] = useState('');
  const [items, setItems] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);

  const limit = 20;

  const load = useCallback(async (opts?: { reset?: boolean }) => {
    const reset = !!opts?.reset;
    if (reset) {
      setOffset(0);
      setItems([]);
    }
    const off = reset ? 0 : offset;
    const res = await apiGet<{ items: Sample[]; meta: { total: number; limit: number; offset: number } }>(
      `/samples?limit=${limit}&offset=${off}&q=${encodeURIComponent(q.trim())}`
    );
    setTotal(res.meta.total);
    if (reset) setItems(res.items);
    else setItems(prev => [...prev, ...res.items]);
    setOffset(off + limit);
  }, [q, offset]);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      (async () => {
        try {
          setLoading(true);
          await load({ reset: true });
        } finally {
          if (mounted) setLoading(false);
        }
      })();
      return () => {
        mounted = false;
      };
    }, [load])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load({ reset: true });
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  const canLoadMore = useMemo(() => items.length < total, [items.length, total]);

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Row style={{ alignItems: 'center', gap: 8 }}>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Ara: numune no / adı"
          autoCapitalize="none"
          style={{ flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 }}
        />
        <PrimaryButton title="Ara" onPress={() => load({ reset: true })} />
      </Row>

      {canEdit ? (
        <View style={{ marginTop: 10 }}>
          <PrimaryButton title="+ Yeni Numune" onPress={() => nav.navigate('SampleForm', { mode: 'create' })} />
        </View>
      ) : null}

      <View style={{ height: 10 }} />

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => String(it.id)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          onEndReached={async () => {
            if (!canLoadMore) return;
            try {
              await load();
            } catch {
              // ignore
            }
          }}
          onEndReachedThreshold={0.5}
          renderItem={({ item }) => (
            <View style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
              <Text style={{ fontSize: 16, fontWeight: '700' }}>{item.sample_no} — {item.sample_name}</Text>
              <Row style={{ marginTop: 6, justifyContent: 'space-between' }}>
                <Text style={{ color: '#666' }}>{String(item.sample_date).slice(0, 10)} | {item.status}</Text>
                <PrimaryButton title="Aç" onPress={() => nav.navigate('SampleDetail', { id: item.id })} />
              </Row>
            </View>
          )}
          ListFooterComponent={canLoadMore ? (
            <View style={{ paddingVertical: 16 }}>
              <ActivityIndicator />
            </View>
          ) : (
            <View style={{ paddingVertical: 16 }}>
              <Text style={{ textAlign: 'center', color: '#666' }}>Toplam: {total}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}
