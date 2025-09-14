import { useColorScheme } from '@/hooks/useColorScheme'
import { useThemeColor } from '@/hooks/useThemeColor'
import { useSettings } from '@/lib/settings'
import { BlurView } from 'expo-blur'
import { useRouter } from 'expo-router'
import { Settings } from 'lucide-react-native'
import { Text, TouchableOpacity, View } from 'react-native'

const CustomHeader = ({
	title,
	showSettings = false,
}: {
	title: string
	showSettings: boolean
}) => {
	const router = useRouter()
	const systemTheme = useColorScheme() ?? 'light'
	const { themeMode } = useSettings()

	// Определяем актуальную тему
	const theme = themeMode === 'auto' ? systemTheme : themeMode

	// Цвета для текущей темы
	const borderColor = useThemeColor({}, 'borderColor')
	const textColor = useThemeColor({}, 'text')
	const secondaryText = useThemeColor({}, 'secondaryText')
	const iconColor = useThemeColor({}, 'icon')

	return (
		<BlurView
			intensity={80}
			tint={theme}
			style={{
				paddingTop: 10,
				paddingBottom: 10,
				paddingHorizontal: 24,
				borderBottomWidth: 1,
				borderBottomColor: `${borderColor}50`,
				backgroundColor:
					theme === 'dark' ? 'rgba(28,28,30,0.9)' : 'rgba(248,250,252,0.9)',
			}}
		>
			<View
				style={{
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'space-between',
				}}
			>
				<View>
					<Text
						style={{
							fontSize: 24,
							fontWeight: 'bold',
							color: textColor,
						}}
					>
						{title}
					</Text>
					<Text
						style={{
							fontSize: 14,
							color: secondaryText,
						}}
					>
						Фото для техосмотра
					</Text>
				</View>

				{showSettings && (
					<TouchableOpacity
						onPress={() => router.navigate('/settings')}
						style={{
							padding: 12,
							borderRadius: 16,
							backgroundColor:
								theme === 'dark'
									? 'rgba(44,44,46,0.8)'
									: 'rgba(255,255,255,0.6)',
							borderWidth: 1,
							borderColor: `${borderColor}40`,
							shadowColor: '#000',
							shadowOffset: { width: 0, height: 4 },
							shadowOpacity: 0.1,
							shadowRadius: 12,
						}}
					>
						<Settings size={24} color={iconColor} />
					</TouchableOpacity>
				)}
			</View>
		</BlurView>
	)
}

export default CustomHeader
