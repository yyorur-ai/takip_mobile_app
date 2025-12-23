# Takip Mobile (Expo / React Native)

Bu uygulama, **takip web projenize dokunmadan** sadece `/api` üzerinden çalışır.

## 1) API Base URL

Uygulama varsayılan olarak şu adresi kullanır:

- `https://wolinux.com.tr/takip/api`

İsterseniz geliştirme/test için ENV ile override edebilirsiniz:

**Windows (PowerShell):**
```powershell
$env:EXPO_PUBLIC_API_BASE="https://wolinux.com.tr/takip/api";
npm install
npx expo start
```

**Linux/Mac:**
```bash
export EXPO_PUBLIC_API_BASE="https://wolinux.com.tr/takip/api"
npm install
npx expo start
```

Not: API Base URL **/api** ile bitmeli.

## 2) Giriş

- Kullanıcı adı / şifre ile giriş yapılır.
- Token güvenli depoya kaydedilir.

## 3) Yapılan İşlemler

- Projeler: Liste, detay, oluştur/güncelle/sil (role'e göre)
- Proje Panelleri: Liste + güncelle (admin/assistant)
- Proje Sarflar: Liste + güncelle (admin/assistant)
- Proje Resimleri: Liste + yükle + sil (admin/assistant)

- Numuneler: Liste, detay, oluştur/güncelle/sil (role'e göre)
- Numune Resimleri: Liste + yükle + sil (admin/assistant)

- Master veriler: Paneller / Sarflar CRUD (admin/assistant)

## 4) Derleme (APK/IPA)

Expo EAS ile alabilirsiniz:
- https://docs.expo.dev/build/setup/

