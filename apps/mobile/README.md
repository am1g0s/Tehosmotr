# Техосмотр Фото

Мобильное приложение для создания и сохранения фотографий для техосмотра с интеграцией Google Drive.

## Возможности

- 📸 Съемка фотографий с настраиваемым качеством
- 🔐 Авторизация через Google аккаунт
- ☁️ Сохранение фотографий в Google Drive
- 📁 Просмотр и управление файлами в Google Drive
- 💾 Автоматическое сохранение в галерею устройства
- 🎨 Современный и интуитивный интерфейс

## Технологии

- **React Native** с Expo
- **TypeScript**
- **Google OAuth 2.0** для авторизации
- **Google Drive API** для работы с файлами
- **AsyncStorage** для сохранения состояния авторизации

## Установка и запуск

### Предварительные требования

- Node.js (версия 16 или выше)
- npm или yarn
- Expo CLI
- Google Cloud Console проект с настроенным OAuth 2.0

### Установка зависимостей

```bash
npm install
```

### Настройка Google OAuth

1. Следуйте инструкциям в файле [GOOGLE_SETUP.md](./GOOGLE_SETUP.md)
2. Создайте файл `.env` на основе `.env.example`
3. Добавьте ваши Google Client ID в файл `.env`

### Запуск приложения

```bash
npx expo start
```

## Структура проекта

```
tehosmotrPhoto/
├── app/                    # Экранные компоненты (Expo Router)
│   ├── index.tsx          # Главный экран
│   ├── photo.tsx          # Экран съемки
│   ├── settings.tsx       # Настройки
│   └── drive.tsx          # Google Drive браузер
├── components/            # Переиспользуемые компоненты
│   ├── GoogleAuthScreen.tsx    # Экран авторизации Google
│   ├── GoogleDriveBrowser.tsx  # Браузер Google Drive
│   └── ...
├── hooks/                 # Пользовательские хуки
│   ├── useGoogleAuth.ts   # Хук для Google авторизации
│   ├── useGoogleDrive.ts  # Хук для работы с Google Drive
│   └── ...
├── lib/                   # Утилиты и настройки
└── assets/               # Статические ресурсы
```

## Основные компоненты

### useGoogleAuth

Хук для управления авторизацией Google с автоматическим сохранением состояния:

```typescript
const { isAuthenticated, user, signIn, signOut } = useGoogleAuth()
```

### useGoogleDrive

Хук для работы с Google Drive API:

```typescript
const { files, folders, listFiles, uploadFile, downloadFile } = useGoogleDrive()
```

### GoogleAuthScreen

Компонент для авторизации пользователя в Google с красивым UI.

### GoogleDriveBrowser

Компонент для просмотра и навигации по файлам Google Drive.

## Функции авторизации

- ✅ Автоматическое сохранение состояния авторизации
- ✅ Обновление токенов доступа
- ✅ Безопасное хранение в AsyncStorage
- ✅ Обработка ошибок авторизации
- ✅ Поддержка выхода из аккаунта

## Функции Google Drive

- ✅ Просмотр файлов и папок
- ✅ Навигация по папкам
- ✅ Загрузка файлов
- ✅ Скачивание файлов
- ✅ Создание папок
- ✅ Удаление файлов
- ✅ Переименование файлов

## Безопасность

- Все токены хранятся локально в AsyncStorage
- Автоматическое обновление токенов доступа
- Безопасная передача данных через HTTPS
- Поддержка OAuth 2.0 PKCE

## Лицензия

MIT License

## Поддержка

Если у вас возникли вопросы или проблемы, создайте issue в репозитории.
