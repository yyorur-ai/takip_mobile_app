import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

export function Row({
  title,
  subtitle,
  right,
  onPress,
}: {
  title: string;
  subtitle?: string;
  right?: string;
  onPress?: () => void;
}) {
  const Cmp: any = onPress ? Pressable : View;
  return (
    <Cmp style={styles.row} onPress={onPress}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
      </View>
      {right ? <Text style={styles.right}>{right}</Text> : null}
    </Cmp>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: { fontWeight: '700', color: '#111827' },
  sub: { marginTop: 2, color: '#6B7280' },
  right: { color: '#111827', fontWeight: '700' },
});
