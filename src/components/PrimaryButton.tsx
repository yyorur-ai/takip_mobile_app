import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';

export function PrimaryButton({
  title,
  onPress,
  disabled,
  loading,
  variant,
  style,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
  style?: ViewStyle;
}) {
  const v = variant ?? 'primary';

  return (
    <Pressable
      style={[
        styles.btn,
        v === 'secondary' ? styles.secondary : null,
        disabled || loading ? styles.btnDisabled : null,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator />
      ) : (
        <Text style={[styles.txt, v === 'secondary' ? styles.txtSecondary : null]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: '#111827',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  txt: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  txtSecondary: {
    color: '#111827',
  },
});
