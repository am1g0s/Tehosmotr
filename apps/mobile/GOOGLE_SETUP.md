# Настройка Google Console для Google Drive API

Для корректной работы авторизации в Google и доступа к Google Drive API необходимо выполнить следующие шаги:

## 1. Создание проекта в Google Cloud Console

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Запишите ID проекта

## 2. Включение API

1. В навигационном меню выберите "APIs & Services" > "Library"
2. Найдите и включите следующие API:
   - **Google Drive API**
   - **Google+ API** (для получения информации о пользователе)

## 3. Создание учетных данных

### OAuth 2.0 Client ID

1. Перейдите в "APIs & Services" > "Credentials"
2. Нажмите "Create Credentials" > "OAuth client ID"
3. Создайте учетные данные для каждой платформы:

#### Для Android:

- Application type: Android
- Package name: `com.tehosmotrphoto`
- SHA-1 certificate fingerprint: получите командой:

  ```bash
  # Для debug версии
  keytool -keystore ~/.android/debug.keystore -list -v -alias androiddebugkey -storepass android -keypass android

  # Для release версии (если есть)
  keytool -keystore your-release-key.keystore -list -v -alias your-key-alias
  ```

#### Для iOS:

- Application type: iOS
- Bundle ID: `com.tehosmotrphoto`

#### Для Web (обязательно для Expo):

- Application type: Web application
- Authorized JavaScript origins: добавьте домены Expo
- Authorized redirect URIs: добавьте Expo redirect URIs

## 4. Настройка OAuth consent screen

1. Перейдите в "APIs & Services" > "OAuth consent screen"
2. Выберите "External" (если приложение будет доступно всем пользователям)
3. Заполните обязательные поля:
   - App name: "Техосмотр Фото"
   - User support email: ваш email
   - Developer contact information: ваш email
4. Добавьте следующие scopes:
   - `https://www.googleapis.com/auth/drive`
   - `https://www.googleapis.com/auth/drive.file`
   - `https://www.googleapis.com/auth/drive.metadata`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`

## 5. Настройка переменных окружения

Создайте файл `.env` в корне проекта:

```env
GOOGLE_WEB_CLIENT_ID=ваш_web_client_id.apps.googleusercontent.com
GOOGLE_IOS_CLIENT_ID=ваш_ios_client_id.apps.googleusercontent.com
GOOGLE_ANDROID_CLIENT_ID=ваш_android_client_id.apps.googleusercontent.com
GOOGLE_EXPO_CLIENT_ID=ваш_expo_client_id.apps.googleusercontent.com
```

## 6. Обновление app.config.ts

Убедитесь, что в файле `app.config.ts` правильно указаны Client ID:

```typescript
extra: {
  googleExpoClientId: process.env.GOOGLE_EXPO_CLIENT_ID || 'YOUR_EXPO_CLIENT_ID',
  googleIosClientId: process.env.GOOGLE_IOS_CLIENT_ID || 'YOUR_IOS_CLIENT_ID',
  googleAndroidClientId: process.env.GOOGLE_ANDROID_CLIENT_ID || 'YOUR_ANDROID_CLIENT_ID',
  googleWebClientId: process.env.GOOGLE_WEB_CLIENT_ID || 'YOUR_WEB_CLIENT_ID',
},
```

## 7. Тестирование

1. В OAuth consent screen добавьте тестовых пользователей (если приложение в режиме тестирования)
2. Соберите и запустите приложение
3. Протестируйте авторизацию

## Важные замечания

- **Web Client ID** используется для получения токенов доступа к Google Drive API
- **Android/iOS Client ID** используются для нативной авторизации
- Убедитесь, что все Client ID правильно настроены в коде
- Для production версии обязательно пройдите процесс верификации приложения в Google

## Возможные проблемы и решения

### "Error 400: invalid_request"

- Проверьте правильность Client ID
- Убедитесь, что package name/bundle ID совпадают

### "This app isn't verified"

- Добавьте тестовых пользователей в OAuth consent screen
- Для production пройдите процесс верификации

### "Access blocked: This app's request is invalid"

- Проверьте настройки OAuth consent screen
- Убедитесь, что все необходимые scopes добавлены

### Проблемы с SHA-1 fingerprint

- Убедитесь, что используете правильный keystore
- Для Expo managed workflow может потребоваться дополнительная настройка

