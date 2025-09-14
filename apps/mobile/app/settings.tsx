import { useAuth } from '@/hooks/auth-context'
import { useThemeColor } from '@/hooks/useThemeColor'
import Slider from '@react-native-community/slider'
import { Picker } from '@react-native-picker/picker'
import React, { useState } from 'react'
import {
	Modal,
	ScrollView,
	StyleSheet,
	Switch,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'
import { ThemedText } from '../components/ThemedText'
import { ThemedView } from '../components/ThemedView'
import {
	CoordinateFormat,
	LocationSource,
	ResolutionOption,
	TextPosition,
	ThemeMode,
	useSettings,
} from '../lib/settings'

export default function SettingsScreen() {
	const {
		imageQuality,
		autoSave,
		resolution,
		showCoordinates,
		showDateTime,
		coordinateFormat,
		decimalPlaces,
		textColor,
		textOutline,
		textPosition,
		fontSize,
		googleDriveRootFolder,
		locationSource,
		previewBeforeSave,
		themeMode,
		setImageQuality,
		setAutoSave,
		setResolution,
		setShowCoordinates,
		setShowDateTime,
		setCoordinateFormat,
		setDecimalPlaces,
		setTextColor,
		setTextOutline,
		setTextPosition,
		setFontSize,
		setGoogleDriveRootFolder,
		setLocationSource,
		setPreviewBeforeSave,
		setThemeMode,
	} = useSettings()

	const { isAuthenticated, user, signIn, signOut } = useAuth()
	const [showColorPicker, setShowColorPicker] = useState(false)

	const handleGoogleAuth = async () => {
		try {
			await signIn()
		} catch (error) {
			console.error('Ошибка авторизации Google:', error)
		}
	}

	const handleGoogleLogout = async () => {
		try {
			await signOut()
		} catch (error) {
			console.error('Ошибка выхода из Google:', error)
		}
	}

	const handleResolutionChange = (newResolution: ResolutionOption) => {
		setResolution(newResolution)
	}

	const handleCoordinateFormatChange = (format: CoordinateFormat) => {
		setCoordinateFormat(format)
	}

	const handleDecimalPlacesChange = (places: number) => {
		setDecimalPlaces(places)
	}

	const handleTextPositionChange = (position: TextPosition) => {
		setTextPosition(position)
	}

	const handleColorChange = (color: string) => {
		setTextColor(color)
		setShowColorPicker(false)
	}

	const handleThemeModeChange = (mode: ThemeMode) => {
		setThemeMode(mode)
	}

	// Цвета для текущей темы
	const cardBackground = useThemeColor({}, 'cardBackground')
	const borderColor = useThemeColor({}, 'borderColor')
	const modalBackground = useThemeColor({}, 'modalBackground')
	const overlayBackground = useThemeColor({}, 'overlayBackground')
	const buttonPrimary = useThemeColor({}, 'buttonPrimary')
	const buttonSecondary = useThemeColor({}, 'buttonSecondary')
	const buttonText = useThemeColor({}, 'buttonText')
	const placeholderText = useThemeColor({}, 'placeholderText')
	const switchTrackActive = useThemeColor({}, 'switchTrackActive')
	const switchTrackInactive = useThemeColor({}, 'switchTrackInactive')
	const dynamicTextColor = useThemeColor({}, 'text')
	const pickerText = useThemeColor({}, 'pickerText')
	const pickerItemColor = useThemeColor({}, 'pickerItemColor')

	return (
		<ThemedView style={styles.container}>
			<ScrollView
				contentContainerStyle={styles.scrollView}
				showsVerticalScrollIndicator={false}
			>
				{/* Изображение */}
				<View style={[styles.section, { backgroundColor: cardBackground }]}>
					<ThemedText style={styles.sectionTitle}>
						Настройки изображения
					</ThemedText>

					<View style={styles.settingGroup}>
						<ThemedText style={styles.settingLabel}>Разрешение</ThemedText>
						<View
							style={[styles.pickerContainer, { borderColor: borderColor }]}
						>
							<Picker
								selectedValue={resolution}
								onValueChange={handleResolutionChange}
								style={[styles.picker, { color: pickerText }]}
								itemStyle={{ color: pickerItemColor }}
							>
								<Picker.Item label='Управляется камерой' value='camera' />
								<Picker.Item label='1920x1080 (Full HD)' value='1920x1080' />
								<Picker.Item label='1280x720 (HD)' value='1280x720' />
							</Picker>
						</View>
					</View>

					<View style={styles.settingGroup}>
						<ThemedText style={styles.settingLabel}>
							Качество: {Math.round(imageQuality * 100)}%
						</ThemedText>
						<Slider
							style={styles.slider}
							minimumValue={0.1}
							maximumValue={1.0}
							value={imageQuality}
							onValueChange={setImageQuality}
							minimumTrackTintColor={switchTrackActive}
							maximumTrackTintColor={switchTrackInactive}
						/>
						<View style={styles.sliderLabels}>
							<ThemedText style={styles.sliderLabel}>Низкое</ThemedText>
							<ThemedText style={styles.sliderLabel}>Высокое</ThemedText>
						</View>
					</View>
				</View>

				{/* Координаты на фото */}
				<View style={[styles.section, { backgroundColor: cardBackground }]}>
					<ThemedText style={styles.sectionTitle}>
						Настройки координат
					</ThemedText>

					<View style={styles.settingRow}>
						<ThemedText style={styles.settingText}>
							Вывод координат на фото
						</ThemedText>
						<Switch
							value={showCoordinates}
							onValueChange={setShowCoordinates}
							trackColor={{
								false: switchTrackInactive,
								true: switchTrackActive,
							}}
							thumbColor='#fff'
						/>
					</View>

					<View style={styles.settingRow}>
						<ThemedText style={styles.settingText}>
							Вывод даты и времени на фото
						</ThemedText>
						<Switch
							value={showDateTime}
							onValueChange={setShowDateTime}
							trackColor={{
								false: switchTrackInactive,
								true: switchTrackActive,
							}}
							thumbColor='#fff'
						/>
					</View>

					<View style={styles.settingGroup}>
						<ThemedText style={styles.settingLabel}>
							Формат записи координат
						</ThemedText>
						<View
							style={[styles.pickerContainer, { borderColor: borderColor }]}
						>
							<Picker
								selectedValue={coordinateFormat}
								onValueChange={handleCoordinateFormatChange}
								style={[styles.picker, { color: pickerText }]}
								itemStyle={{ color: pickerItemColor }}
							>
								<Picker.Item
									label='Градусы и минуты с дробью'
									value='degrees_minutes'
								/>
								<Picker.Item
									label='Градусы с десятичной дробной частью'
									value='decimal'
								/>
								<Picker.Item label='Сразу оба формата' value='both' />
							</Picker>
						</View>
					</View>

					<View style={styles.settingGroup}>
						<ThemedText style={styles.settingLabel}>
							Кол-во знаков в дробной части координаты
						</ThemedText>
						<View
							style={[styles.pickerContainer, { borderColor: borderColor }]}
						>
							<Picker
								selectedValue={decimalPlaces}
								onValueChange={handleDecimalPlacesChange}
								style={[styles.picker, { color: pickerText }]}
								itemStyle={{ color: pickerItemColor }}
							>
								{[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(
									places => (
										<Picker.Item
											key={places}
											label={places.toString()}
											value={places}
										/>
									)
								)}
							</Picker>
						</View>
					</View>

					<View style={styles.settingGroup}>
						<ThemedText style={styles.settingLabel}>
							Позиция текста на фото
						</ThemedText>
						<View
							style={[styles.pickerContainer, { borderColor: borderColor }]}
						>
							<Picker
								selectedValue={textPosition}
								onValueChange={handleTextPositionChange}
								style={[styles.picker, { color: pickerText }]}
								itemStyle={{ color: pickerItemColor }}
							>
								<Picker.Item label='Верхний левый' value='top-left' />
								<Picker.Item label='Верхний правый' value='top-right' />
								<Picker.Item label='Нижний левый' value='bottom-left' />
								<Picker.Item label='Нижний правый' value='bottom-right' />
								<Picker.Item label='Центр' value='center' />
							</Picker>
						</View>
					</View>

					<View style={styles.settingGroup}>
						<ThemedText style={styles.settingLabel}>
							Размер шрифта: {fontSize}px
						</ThemedText>
						<Slider
							style={styles.slider}
							minimumValue={12}
							maximumValue={32}
							value={fontSize}
							onValueChange={setFontSize}
							minimumTrackTintColor={switchTrackActive}
							maximumTrackTintColor={switchTrackInactive}
							step={1}
						/>
						<View style={styles.sliderLabels}>
							<ThemedText style={styles.sliderLabel}>12px</ThemedText>
							<ThemedText style={styles.sliderLabel}>32px</ThemedText>
						</View>
					</View>

					<View style={styles.settingRow}>
						<ThemedText style={styles.settingText}>
							Цвет шрифта на фото
						</ThemedText>
						<TouchableOpacity
							style={[
								styles.colorButton,
								{
									backgroundColor: textColor,
									borderColor: borderColor,
								},
							]}
							onPress={() => setShowColorPicker(true)}
						/>
					</View>

					<View style={[styles.settingRow, styles.lastRow]}>
						<ThemedText style={styles.settingText}>Обводка текста</ThemedText>
						<Switch
							value={textOutline}
							onValueChange={setTextOutline}
							trackColor={{
								false: switchTrackInactive,
								true: switchTrackActive,
							}}
							thumbColor='#fff'
						/>
					</View>
				</View>

				{/* Сохранение */}
				<View style={[styles.section, { backgroundColor: cardBackground }]}>
					<ThemedText style={styles.sectionTitle}>Сохранение</ThemedText>

					<View style={styles.settingRow}>
						<ThemedText style={styles.settingText}>
							Сохранять фото в галерею
						</ThemedText>
						<Switch
							value={autoSave}
							onValueChange={setAutoSave}
							trackColor={{
								false: switchTrackInactive,
								true: switchTrackActive,
							}}
							thumbColor='#fff'
						/>
					</View>

					<View style={styles.settingRow}>
						<ThemedText style={styles.settingText}>
							Предпросмотр фото перед сохранением
						</ThemedText>
						<Switch
							value={previewBeforeSave}
							onValueChange={setPreviewBeforeSave}
							trackColor={{
								false: switchTrackInactive,
								true: switchTrackActive,
							}}
							thumbColor='#fff'
						/>
					</View>

					<View style={styles.settingRow}>
						<View>
							<ThemedText style={{ fontWeight: '500' }}>
								Google аккаунт
							</ThemedText>
							<ThemedText>
								{isAuthenticated ? user?.email : 'Не привязан'}
							</ThemedText>
						</View>
						<View style={styles.buttonContainer}>
							{!isAuthenticated ? (
								<TouchableOpacity
									style={[
										styles.googleButton,
										{ backgroundColor: buttonPrimary },
									]}
									onPress={handleGoogleAuth}
								>
									<ThemedText
										style={[styles.googleButtonText, { color: buttonText }]}
									>
										Привязать Google
									</ThemedText>
								</TouchableOpacity>
							) : (
								<TouchableOpacity
									style={[
										styles.googleButton,
										{ backgroundColor: buttonPrimary },
									]}
									onPress={handleGoogleLogout}
								>
									<ThemedText
										style={[styles.googleButtonText, { color: buttonText }]}
									>
										Отвязать Google
									</ThemedText>
								</TouchableOpacity>
							)}
						</View>
					</View>

					{isAuthenticated && (
						<View style={styles.settingGroup}>
							<ThemedText style={styles.settingLabel}>
								Корневой каталог на Google Диске
							</ThemedText>
							<TextInput
								style={[
									styles.textInput,
									{
										borderColor: borderColor,
										color: dynamicTextColor,
										backgroundColor: cardBackground,
									},
								]}
								value={googleDriveRootFolder}
								onChangeText={setGoogleDriveRootFolder}
								placeholder='Введите название папки'
								placeholderTextColor={placeholderText}
							/>
							<ThemedText style={styles.settingDescription}>
								Папки с датами будут создаваться внутри этого каталога
							</ThemedText>
						</View>
					)}
				</View>

				{/* Геоданные */}
				<View style={[styles.section, { backgroundColor: cardBackground }]}>
					<ThemedText style={styles.sectionTitle}>Геоданные</ThemedText>
					<View style={styles.settingGroup}>
						<ThemedText style={styles.settingLabel}>
							Источник геоданных
						</ThemedText>
						<View
							style={[styles.pickerContainer, { borderColor: borderColor }]}
						>
							<Picker
								selectedValue={locationSource}
								onValueChange={(val: LocationSource) => setLocationSource(val)}
								style={[styles.picker, { color: pickerText }]}
								itemStyle={{ color: pickerItemColor }}
							>
								<Picker.Item label='Только спутник (GPS)' value='gps_only' />
								<Picker.Item
									label='Спутник + сети (Wi‑Fi/моб.)'
									value='gps_networks'
								/>
							</Picker>
						</View>
					</View>
				</View>

				{/* Внешний вид */}
				<View style={[styles.section, { backgroundColor: cardBackground }]}>
					<ThemedText style={styles.sectionTitle}>Внешний вид</ThemedText>
					<View style={styles.settingGroup}>
						<ThemedText style={styles.settingLabel}>Тема приложения</ThemedText>
						<View
							style={[styles.pickerContainer, { borderColor: borderColor }]}
						>
							<Picker
								selectedValue={themeMode}
								onValueChange={handleThemeModeChange}
								style={[styles.picker, { color: pickerText }]}
								itemStyle={{ color: pickerItemColor }}
							>
								<Picker.Item label='Системная' value='auto' />
								<Picker.Item label='Светлая' value='light' />
								<Picker.Item label='Темная' value='dark' />
							</Picker>
						</View>
					</View>
				</View>

				{/* Color Picker Modal */}
				<Modal
					visible={showColorPicker}
					transparent={true}
					animationType='slide'
				>
					<View
						style={[
							styles.modalOverlay,
							{ backgroundColor: overlayBackground },
						]}
					>
						<View
							style={[
								styles.modalContent,
								{ backgroundColor: modalBackground },
							]}
						>
							<ThemedText style={styles.modalTitle}>Выберите цвет</ThemedText>
							<View style={styles.colorGrid}>
								{[
									'#FFFFFF',
									'#000000',
									'#FF0000',
									'#00FF00',
									'#0000FF',
									'#FFFF00',
									'#FF00FF',
									'#00FFFF',
									'#FFA500',
									'#800080',
									'#008000',
									'#FFC0CB',
									'#A52A2A',
									'#808080',
									'#FFD700',
								].map(color => (
									<TouchableOpacity
										key={color}
										style={[
											styles.colorOption,
											{
												backgroundColor: color,
												borderColor: borderColor,
											},
										]}
										onPress={() => handleColorChange(color)}
									/>
								))}
							</View>
							<TouchableOpacity
								style={[
									styles.cancelButton,
									{ backgroundColor: buttonSecondary },
								]}
								onPress={() => setShowColorPicker(false)}
							>
								<ThemedText style={styles.cancelButtonText}>Отмена</ThemedText>
							</TouchableOpacity>
						</View>
					</View>
				</Modal>
			</ScrollView>
		</ThemedView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	scrollView: {
		display: 'flex',
		flexDirection: 'column',
		gap: 20,
		margin: 20,
		paddingBottom: 40,
	},
	section: {
		borderRadius: 12,
		padding: 20,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: '600',
		marginBottom: 16,
	},
	settingGroup: {
		marginBottom: 5,
	},
	settingLabel: {
		fontSize: 16,
		fontWeight: '500',
		marginBottom: 8,
	},
	settingDescription: {
		fontSize: 12,
		marginTop: 4,
		fontStyle: 'italic',
	},
	textInput: {
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 10,
		fontSize: 16,
	},
	pickerContainer: {
		borderWidth: 1,
		borderRadius: 8,
	},
	picker: {
		height: 50,
	},
	slider: {
		width: '100%',
	},
	sliderLabels: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 8,
	},
	sliderLabel: {
		fontSize: 12,
	},
	settingRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 16,
	},
	lastRow: { marginBottom: 0 },
	settingText: {
		fontSize: 16,
		flex: 1,
		marginRight: 16,
	},
	colorButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		borderWidth: 2,
	},
	buttonContainer: {
		marginTop: 12,
	},
	googleButton: {
		borderRadius: 8,
		paddingVertical: 12,
		paddingHorizontal: 16,
		alignItems: 'center',
	},
	googleButtonText: {
		fontSize: 16,
		fontWeight: '600',
	},
	modalOverlay: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	modalContent: {
		borderRadius: 12,
		padding: 20,
		width: '80%',
		maxWidth: 400,
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: '600',
		textAlign: 'center',
		marginBottom: 20,
	},
	colorGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'center',
		marginBottom: 20,
	},
	colorOption: {
		width: 40,
		height: 40,
		borderRadius: 20,
		margin: 8,
		borderWidth: 2,
	},
	cancelButton: {
		borderRadius: 8,
		paddingVertical: 12,
		alignItems: 'center',
	},
	cancelButtonText: {
		fontSize: 16,
		fontWeight: '600',
	},
})
