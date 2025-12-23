# Android APK'yi bilgisayar olmadan alma

Kaynak kodu telefona kopyalamak tek başına yeterli değildir. Telefona kurmak için APK gerekir.

Bu projede `eas.json` hazırdır ve Android için APK üretir.

## Yöntem 1: Termux ile EAS Build (bulut derleme)

1) Telefona Termux kurun.
2) Termux ->

```sh
pkg update -y
pkg install -y nodejs-lts git unzip
termux-setup-storage
```

3) Bu ZIP'i telefona indirin ve Termux'ta Downloads'a gidin:

```sh
cd /storage/emulated/0/Download
unzip takip_mobile_app_eas.zip
cd takip_mobile_app
npm install
npm i -g eas-cli
```

4) Expo hesabınızla giriş:

```sh
eas login
```

5) APK build başlat:

```sh
eas build -p android --profile preview
```

Build tamamlanınca EAS size bir link verir; o linkten `.apk` indirip telefona kurarsınız.

## Yöntem 2: GitHub üzerinden build

Projeyi GitHub'a yükleyip EAS Dashboard/GitHub trigger ile build alabilirsiniz.

