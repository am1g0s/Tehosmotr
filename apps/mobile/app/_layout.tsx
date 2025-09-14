import CustomHeader from '@/components/CustomHeader'
import { AuthProvider } from '@/hooks/auth-context'
import { OverlayCompositorProvider } from '@/hooks/overlay-compositor'
import { ToastProvider, useToast } from '@/hooks/toast-context'
import { useColorScheme } from '@/hooks/useColorScheme'
import { Stack } from 'expo-router'
import { Toast } from '../components/Toast'
import { SettingsProvider, useSettings } from '../lib/settings'

function AppContent() {
	const { toastVisible, toastMessage, toastType, hideToast } = useToast()
	const systemTheme = useColorScheme() ?? 'light'
	const { themeMode } = useSettings()

	// Определяем актуальную тему
	const theme = themeMode === 'auto' ? systemTheme : themeMode

	return (
		<>
			<Stack>
				<Stack.Screen
					name='index'
					options={{
						header: () => <CustomHeader title='GeoPhoto' showSettings={true} />,
					}}
				/>
				<Stack.Screen
					name='photo'
					options={{
						title: 'Съемка фото',
						headerShown: false,
					}}
				/>
				<Stack.Screen
					name='settings'
					options={{
						title: 'Настройки',
						presentation: 'modal',
						headerStyle: {
							backgroundColor: theme === 'dark' ? '#1C1C1E' : '#F2F2F7',
						},
						headerTintColor: theme === 'dark' ? '#FFFFFF' : '#11181C',
						headerTitleStyle: {
							color: theme === 'dark' ? '#FFFFFF' : '#11181C',
						},
					}}
				/>
			</Stack>

			<Toast
				visible={toastVisible}
				message={toastMessage}
				type={toastType}
				onHide={hideToast}
			/>
		</>
	)
}

export default function RootLayout() {
	return (
		<SettingsProvider>
			<AuthProvider>
				<ToastProvider>
					<OverlayCompositorProvider>
						<AppContent />
					</OverlayCompositorProvider>
				</ToastProvider>
			</AuthProvider>
		</SettingsProvider>
	)
}
