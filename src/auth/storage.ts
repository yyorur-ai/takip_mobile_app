import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'takip_token';
const USER_KEY = 'takip_user';

export async function saveToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function loadToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(TOKEN_KEY);
}

export async function clearToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function saveUser(userJson: string) {
  await SecureStore.setItemAsync(USER_KEY, userJson);
}

export async function loadUser(): Promise<string | null> {
  return await SecureStore.getItemAsync(USER_KEY);
}

export async function clearUser() {
  await SecureStore.deleteItemAsync(USER_KEY);
}
