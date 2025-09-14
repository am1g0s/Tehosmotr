/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/Colors'
import { useColorScheme } from '@/hooks/useColorScheme'
import { useSettings } from '@/lib/settings'

export function useThemeColor(
	props: { light?: string; dark?: string },
	colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
	const systemTheme = useColorScheme() ?? 'light'
	const { themeMode } = useSettings()

	// Определяем актуальную тему на основе пользовательских настроек
	const theme = themeMode === 'auto' ? systemTheme : themeMode

	const colorFromProps = props[theme]

	if (colorFromProps) {
		return colorFromProps
	} else {
		return Colors[theme][colorName]
	}
}
