import { ConfigContext, ExpoConfig } from 'expo/config'

export default ({ config }: ConfigContext): ExpoConfig => ({
	...config,
	owner: 'am1g0',
	name: 'Техосмотр Фото',
	slug: 'tehosmotrphoto',
	version: '1.0.0',
	orientation: 'portrait',
	icon: './assets/images/icon.png',
	userInterfaceStyle: 'light',
	splash: {
		image: './assets/images/splash-icon.png',
		resizeMode: 'contain',
		backgroundColor: '#ffffff',
	},
	assetBundlePatterns: ['**/*'],
	ios: {
		supportsTablet: true,
		bundleIdentifier: 'com.tehosmotrphoto.app',
	},
	android: {
		adaptiveIcon: {
			foregroundImage: './assets/images/adaptive-icon.png',
			backgroundColor: '#ffffff',
		},
		package: 'com.tehosmotrphoto.app',
	},
	web: {
		favicon: './assets/images/favicon.png',
	},
	scheme: 'tehosmotrphoto',
	extra: {
		googleExpoClientId: process.env.GOOGLE_EXPO_CLIENT_ID,
		GOOGLE_IOS_CLIENT_ID: process.env.GOOGLE_IOS_CLIENT_ID,
		GOOGLE_ANDROID_CLIENT_ID: process.env.GOOGLE_ANDROID_CLIENT_ID,
		GOOGLE_WEB_CLIENT_ID: process.env.GOOGLE_WEB_CLIENT_ID,
	},
	plugins: [
		'expo-router',
		'expo-camera',
		'expo-image-picker',
		'expo-media-library',
		[
			'@react-native-google-signin/google-signin',
			{
				iosUrlScheme:
					'com.googleusercontent.apps.883051547069-8o144202fq9akqu1ibig221iu1f3rmof',
			},
		],
		[
			'expo-location',
			{
				locationAlwaysAndWhenInUsePermission:
					'Для определения местоположения автомобиля при съемке',
			},
		],
	],
})
