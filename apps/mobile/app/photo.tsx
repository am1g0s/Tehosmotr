import { BlurView } from 'expo-blur'
import Constants from 'expo-constants'
import * as MediaLibrary from 'expo-media-library'
import * as Notifications from 'expo-notifications'
import { router, useLocalSearchParams } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import { Bell, Save, X } from 'lucide-react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
	Alert,
	Image,
	ScrollView,
	StyleSheet,
	Switch,
	Text,
	TextInput,
	TouchableOpacity,
	View,
	ViewStyle,
} from 'react-native'
import { captureRef } from 'react-native-view-shot'
import { useAuth } from '../hooks/auth-context'
import { useToast } from '../hooks/toast-context'
import { useCamera } from '../hooks/useCamera'
import { useGoogleDrive } from '../hooks/useGoogleDrive'
import { useSettings } from '../lib/settings'

WebBrowser.maybeCompleteAuthSession()

// Настройка уведомлений
Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldPlaySound: true,
		shouldSetBadge: false,
		shouldShowBanner: true,
		shouldShowList: true,
	}),
})

// const { width: screenWidth } = Dimensions.get('window')

export default function PhotoScreen() {
	const params = useLocalSearchParams()
	const [photoUri, setPhotoUri] = useState<string | null>(null)
	const [fileSizeBytes, setFileSizeBytes] = useState<number | null>(null)
	const [latitude, setLatitude] = useState<number | null>(null)
	const [longitude, setLongitude] = useState<number | null>(null)
	const [width, setWidth] = useState<number | null>(null)
	const [height, setHeight] = useState<number | null>(null)
	const [fileName, setFileName] = useState('')
	const [photoTakenTime, setPhotoTakenTime] = useState<Date | null>(null)
	const [reminderEnabled, setReminderEnabled] = useState(true)
	const [isUploading, setIsUploading] = useState(false)
	const [isInitialized, setIsInitialized] = useState(false)
	const [isFileNameInitialized, setIsFileNameInitialized] = useState(false)
	const fileNameRef = useRef('')
	const captureViewRef = useRef<View | null>(null)
	const [isHiddenImageLoaded, setIsHiddenImageLoaded] = useState(false)
	const [isHiddenMounted, setIsHiddenMounted] = useState(false)
	const [autoUploadTriggered, setAutoUploadTriggered] = useState(false)

	const {
		autoSave,
		showCoordinates,
		showDateTime,
		coordinateFormat,
		decimalPlaces,
		textColor,
		textOutline,
		textPosition,
		fontSize,
	} = useSettings()
	const { showToast } = useToast()
	const { processPhotoForUpload } = useCamera()
	const { uploadPhoto } = useGoogleDrive()
	const { resolution } = useSettings()
	const isAutoUpload = params?.autoUpload === '1'
	const { isAuthenticated } = useAuth()

	const getTargetDimensions = useCallback(() => {
		if (resolution === '1920x1080') return { w: 1920, h: 1080 }
		if (resolution === '1280x720') return { w: 1280, h: 720 }
		if (width && height) return { w: width, h: height }
		return { w: 1280, h: 720 }
	}, [resolution, width, height])

	const toDMS = (lat: number, lon: number) => {
		const toD = (v: number, isLat: boolean) => {
			const abs = Math.abs(v)
			const deg = Math.floor(abs)
			const minFloat = (abs - deg) * 60
			const min = Math.floor(minFloat)
			const sec = Math.round((minFloat - min) * 60)
			const ref = isLat ? (v >= 0 ? 'N' : 'S') : v >= 0 ? 'E' : 'W'
			return `${deg}° ${min}' ${sec}" ${ref}`
		}
		return `${toD(lat, true)}  ${toD(lon, false)}`
	}

	const buildOverlayText = () => {
		const lines: string[] = []
		if (
			showCoordinates &&
			latitude !== null &&
			longitude !== null &&
			Number.isFinite(latitude) &&
			Number.isFinite(longitude)
		) {
			let coordsLine = ''
			if (coordinateFormat === 'degrees_minutes') {
				coordsLine = toDMS(latitude, longitude)
			} else {
				// 'decimal' и 'both' выводим в десятичном виде
				coordsLine = `${latitude.toFixed(decimalPlaces)}; ${longitude.toFixed(
					decimalPlaces
				)}`
			}
			lines.push(coordsLine)
		}
		if (showDateTime && photoTakenTime) {
			const dt = photoTakenTime
			const pad = (n: number) => String(n).padStart(2, '0')
			const dateStr = `${pad(dt.getDate())}.${pad(
				dt.getMonth() + 1
			)}.${dt.getFullYear()}`
			const timeStr = `${pad(dt.getHours())}:${pad(dt.getMinutes())}`
			lines.push(`${dateStr} ${timeStr}`)
		}
		return lines.join('\n')
	}

	const overlayPositionStyle = (pos: string): ViewStyle => {
		switch (pos) {
			case 'top-left':
				return { position: 'absolute', top: 12, left: 12 }
			case 'top-right':
				return { position: 'absolute', top: 12, right: 12 }
			case 'bottom-left':
				return { position: 'absolute', bottom: 12, left: 12 }
			case 'bottom-right':
				return { position: 'absolute', bottom: 12, right: 12 }
			case 'center':
			default:
				return {
					position: 'absolute',
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					justifyContent: 'center',
					alignItems: 'center',
				}
		}
	}

	const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

	const captureComposedImage = useCallback(async (): Promise<string> => {
		try {
			const { w, h } = getTargetDimensions()
			const loops = isAutoUpload ? 5 : 15
			for (let i = 0; i < loops; i++) {
				if (captureViewRef.current && isHiddenMounted && isHiddenImageLoaded)
					break
				await wait(100)
			}
			if (!captureViewRef.current || !isHiddenMounted || !isHiddenImageLoaded) {
				throw new Error('Capture view not ready')
			}
			let lastError: any = null
			for (let i = 0; i < 3; i++) {
				try {
					const uri = await captureRef(captureViewRef.current, {
						format: 'jpg',
						quality: 1,
						result: 'tmpfile',
						width: w,
						height: h,
					})
					return uri
				} catch (err) {
					lastError = err
					await wait(120)
				}
			}
			throw lastError || new Error('Unknown capture error')
		} catch (e) {
			console.warn(
				'Не удалось собрать изображение с оверлеем, используем оригинал',
				e
			)
			return photoUri!
		}
	}, [
		getTargetDimensions,
		isAutoUpload,
		isHiddenMounted,
		isHiddenImageLoaded,
		photoUri,
	])

	// Запрос разрешений для уведомлений
	useEffect(() => {
		const requestNotificationPermissions = async () => {
			const { status: existingStatus } =
				await Notifications.getPermissionsAsync()
			let finalStatus = existingStatus

			if (existingStatus !== 'granted') {
				const { status } = await Notifications.requestPermissionsAsync()
				finalStatus = status
			}

			if (finalStatus !== 'granted') {
				console.log('Разрешения на уведомления не предоставлены')
			} else {
				console.log('✅ Разрешения на уведомления предоставлены')
			}
		}

		requestNotificationPermissions()
	}, [])

	// Инициализируем данные фото из параметров навигации
	useEffect(() => {
		if (params.photoUri && typeof params.photoUri === 'string') {
			setPhotoUri(params.photoUri)
		} else {
			console.log('❌ Нет URI фото в параметрах')
		}

		if (
			params.fileSizeBytes &&
			typeof params.fileSizeBytes === 'string' &&
			params.fileSizeBytes !== ''
		) {
			const size = parseInt(params.fileSizeBytes, 10)
			if (!isNaN(size)) {
				setFileSizeBytes(size)
			}
		} else {
			console.log('❌ Нет размера файла в параметрах')
		}

		if (
			params.latitude &&
			typeof params.latitude === 'string' &&
			params.latitude !== ''
		) {
			const lat = parseFloat(params.latitude)
			if (!isNaN(lat)) {
				setLatitude(lat)
			}
		} else {
			console.log('❌ Нет широты в параметрах')
		}

		if (
			params.longitude &&
			typeof params.longitude === 'string' &&
			params.longitude !== ''
		) {
			const lon = parseFloat(params.longitude)
			if (!isNaN(lon)) {
				setLongitude(lon)
			}
		} else {
			console.log('❌ Нет долготы в параметрах')
		}

		if (
			params.width &&
			typeof params.width === 'string' &&
			params.width !== ''
		) {
			const w = parseInt(params.width, 10)
			if (!isNaN(w)) {
				setWidth(w)
			}
		} else {
			console.log('❌ Нет ширины в параметрах')
		}

		if (
			params.height &&
			typeof params.height === 'string' &&
			params.height !== ''
		) {
			const h = parseInt(params.height, 10)
			if (!isNaN(h)) {
				setHeight(h)
			}
		} else {
			console.log('❌ Нет высоты в параметрах')
		}

		// Генерируем название файла по умолчанию только один раз при инициализации
		if (!isFileNameInitialized) {
			const now = new Date()
			const pad = (n: number) => String(n).padStart(2, '0')
			const defaultName = `${now.getFullYear()}-${pad(
				now.getMonth() + 1
			)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(
				now.getMinutes()
			)}-${pad(now.getSeconds())}`
			setFileName(defaultName)
			fileNameRef.current = defaultName
			setIsFileNameInitialized(true)
		}

		setIsInitialized(true)

		// Если нет данных фото, возвращаемся назад
		if (!params.photoUri) {
			router.back()
		}
	}, [params, isFileNameInitialized])

	// Устанавливаем время съемки только один раз при инициализации
	useEffect(() => {
		if (!photoTakenTime) {
			setPhotoTakenTime(new Date())
		}
	}, [photoTakenTime])

	useEffect(() => {
		setIsHiddenImageLoaded(false)
		setIsHiddenMounted(false)
	}, [photoUri])

	// Автозагрузка, если пришли с autoUpload=1 (режим без предпросмотра)
	useEffect(() => {
		if (isInitialized && isAutoUpload && photoUri && !autoUploadTriggered) {
			setAutoUploadTriggered(true)
			uploadToGoogleDrive()
		}
	}, [isInitialized, isAutoUpload, photoUri, autoUploadTriggered])

	const scheduleReminder = useCallback(async () => {
		if (!reminderEnabled) return

		try {
			// Отменяем все предыдущие уведомления
			await Notifications.cancelAllScheduledNotificationsAsync()

			// Планируем уведомление через 30 минут (1800 секунд)
			const notificationId = await Notifications.scheduleNotificationAsync({
				content: {
					title: '📸 Время сделать второе фото!',
					body: 'Не забудьте сделать фото с другого ракурса',
					sound: 'default',
				},
				trigger: {
					type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
					seconds: 1800, // 30 минут
				},
			})

			const scheduledTime = new Date(Date.now() + 1800 * 1000)
			console.log(
				`✅ Напоминание запланировано на ${scheduledTime.toLocaleString()} (ID: ${notificationId})`
			)

			// Проверяем, что уведомление действительно запланировано
			const scheduledNotifications =
				await Notifications.getAllScheduledNotificationsAsync()
			console.log(
				`📋 Всего запланировано уведомлений: ${scheduledNotifications.length}`
			)

			// уведомление пользователю не показываем по требованию
		} catch (error) {
			console.error('Ошибка планирования уведомления:', error)
			showToast('Ошибка установки напоминания', 'error')
		}
	}, [reminderEnabled, showToast])

	const saveToGallery = useCallback(
		async (uri?: string) => {
			try {
				const { status } = await MediaLibrary.requestPermissionsAsync()

				if (status !== 'granted') {
					Alert.alert(
						'Разрешение галереи',
						'Для сохранения фото необходимо разрешение на доступ к галерее.',
						[
							{ text: 'Отмена', style: 'cancel' },
							{
								text: 'Настройки',
								onPress: () => MediaLibrary.requestPermissionsAsync(),
							},
						]
					)
					return
				}

				const photoToSave = uri || photoUri
				if (!photoToSave) return

				let baseUri = photoToSave
				if ((showCoordinates || showDateTime) && !uri) {
					baseUri = await captureComposedImage()
				}

				let finalPhotoUri = baseUri
				if (latitude !== null && longitude !== null && !uri) {
					finalPhotoUri = await processPhotoForUpload(
						baseUri,
						latitude,
						longitude
					)
				}

				await MediaLibrary.saveToLibraryAsync(finalPhotoUri)
				showToast('Фото сохранено в галерею', 'success')
			} catch (error) {
				console.error('Ошибка сохранения в галерею:', error)
				showToast('Ошибка сохранения в галерею', 'error')
			}
		},
		[
			photoUri,
			showCoordinates,
			showDateTime,
			captureComposedImage,
			processPhotoForUpload,
			latitude,
			longitude,
			showToast,
		]
	)

	const uploadToGoogleDrive = useCallback(async () => {
		if (!photoUri) {
			return
		}

		try {
			setIsUploading(true)

			// Нет авторизации Google — не пытаемся грузить, возвращаемся на главный
			if (!isAuthenticated) {
				if (autoSave) {
					await saveToGallery(photoUri)
				}
				showToast('Требуется вход в Google для загрузки на Диск', 'error')
				router.back()
				return
			}

			// Проверяем наличие clientId
			const cfg: any = (Constants as any)?.expoConfig?.extra || {}
			if (
				!cfg.googleExpoClientId &&
				!cfg.googleAndroidClientId &&
				!cfg.googleIosClientId &&
				!cfg.googleWebClientId
			) {
				Alert.alert(
					'Настройка Google',
					'Не задано ни одного Google Client ID в app.json → expo.extra.*. Загрузка на Google Drive невозможна.'
				)
				return
			}

			// Устанавливаем напоминание, если включено
			if (reminderEnabled) {
				await scheduleReminder()
			}

			// Готовим файл ДО ухода со страницы, чтобы captureRef не сломался
			const composedUri =
				showCoordinates || showDateTime
					? await captureComposedImage()
					: photoUri
			const processedPhotoUri = await processPhotoForUpload(
				composedUri,
				latitude,
				longitude
			)

			// Переходим назад после подготовки файла
			router.back()
			showToast('Отправка изображения на Google Drive...', 'info')

			// Загружаем уже подготовленный файл
			setTimeout(async () => {
				try {
					const uploadResult = await uploadPhoto(
						processedPhotoUri,
						new Date(),
						fileNameRef.current
					)

					if (autoSave) {
						await saveToGallery(processedPhotoUri)
					}

					showToast(
						`Фото "${uploadResult.name}" загружено на Google Drive`,
						'success'
					)
				} catch (error) {
					console.error('Ошибка загрузки на Google Drive:', error)
					showToast('Не удалось отправить фото на Google Drive', 'error')
				}
			}, 50)
		} catch (error) {
			console.error('Ошибка подготовки загрузки:', error)
			showToast('Ошибка подготовки загрузки', 'error')
		} finally {
			setIsUploading(false)
		}
	}, [
		photoUri,
		isAuthenticated,
		reminderEnabled,
		showCoordinates,
		showDateTime,
		captureComposedImage,
		processPhotoForUpload,
		latitude,
		longitude,
		showToast,
		autoSave,
		saveToGallery,
		scheduleReminder,
		uploadPhoto,
	])

	const updateFileName = (newName: string) => {
		setFileName(newName)
		fileNameRef.current = newName
	}

	const cancelPhoto = () => {
		console.log('❌ Отмена фото, возвращаемся на главный экран')
		router.back()
	}

	// Если автоаплоад: не показываем UI предпросмотра
	if (isAutoUpload) {
		return photoUri ? (
			<View
				ref={captureViewRef}
				collapsable={false}
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					width: getTargetDimensions().w,
					height: getTargetDimensions().h,
					opacity: 0,
					pointerEvents: 'none',
				}}
				onLayout={() => setIsHiddenMounted(true)}
			>
				<Image
					source={{ uri: photoUri }}
					style={{ width: '100%', height: '100%' }}
					resizeMode='cover'
					onLoadEnd={() => setIsHiddenImageLoaded(true)}
				/>
				{(showCoordinates || showDateTime) && (
					<View style={overlayPositionStyle(textPosition)}>
						<Text
							style={{
								color: textColor,
								fontSize: fontSize,
								fontWeight: '600',
								textShadowColor: textOutline
									? 'rgba(0,0,0,0.7)'
									: 'transparent',
								textShadowOffset: { width: 0, height: 0 },
								textShadowRadius: textOutline ? 3 : 0,
							}}
						>
							{buildOverlayText()}
						</Text>
					</View>
				)}
			</View>
		) : null
	}

	// Ждем инициализации данных
	if (!isInitialized) {
		return (
			<View style={styles.container}>
				<Text style={styles.loadingText}>Инициализация...</Text>
			</View>
		)
	}

	if (!photoUri) {
		return (
			<View style={styles.container}>
				<Text style={styles.loadingText}>Загрузка фото...</Text>
			</View>
		)
	}

	return (
		<View style={styles.container}>
			{/* Скрытая область для захвата изображения с оверлеем в нужном разрешении */}
			{photoUri ? (
				<View
					ref={captureViewRef}
					collapsable={false}
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						width: getTargetDimensions().w,
						height: getTargetDimensions().h,
						opacity: 0,
						pointerEvents: 'none',
					}}
					onLayout={() => setIsHiddenMounted(true)}
				>
					<Image
						source={{ uri: photoUri }}
						style={{ width: '100%', height: '100%' }}
						resizeMode='cover'
						onLoadEnd={() => setIsHiddenImageLoaded(true)}
					/>
					{(showCoordinates || showDateTime) && (
						<View style={overlayPositionStyle(textPosition)}>
							<Text
								style={{
									color: textColor,
									fontSize: fontSize,
									fontWeight: '600',
									textShadowColor: textOutline
										? 'rgba(0,0,0,0.7)'
										: 'transparent',
									textShadowOffset: { width: 0, height: 0 },
									textShadowRadius: textOutline ? 3 : 0,
								}}
							>
								{buildOverlayText()}
							</Text>
						</View>
					)}
				</View>
			) : null}
			<ScrollView
				style={styles.scrollContainer}
				showsVerticalScrollIndicator={false}
			>
				{/* Header */}
				<View style={styles.header}>
					<Text style={styles.title}>Предпросмотр</Text>
					<TouchableOpacity
						style={styles.closeButton}
						onPress={cancelPhoto}
						disabled={isUploading}
					>
						<X size={24} color='#ef4444' />
					</TouchableOpacity>
				</View>

				{/* Photo Preview */}
				<View style={styles.photoContainer}>
					<View style={styles.previewWrapper}>
						<Image source={{ uri: photoUri }} style={styles.preview} />
						{(showCoordinates || showDateTime) && (
							<View style={overlayPositionStyle(textPosition)}>
								<Text
									style={{
										color: textColor,
										fontSize: fontSize,
										fontWeight: '600',
										textShadowColor: textOutline
											? 'rgba(0,0,0,0.7)'
											: 'transparent',
										textShadowOffset: { width: 0, height: 0 },
										textShadowRadius: textOutline ? 3 : 0,
									}}
								>
									{buildOverlayText()}
								</Text>
							</View>
						)}
					</View>
				</View>

				{/* Data Block */}
				<BlurView intensity={20} style={styles.dataBlock}>
					<Text style={styles.blockTitle}>Данные</Text>
					<View style={styles.dataRow}>
						<Text style={styles.dataLabel}>Координаты</Text>
						<Text style={styles.dataValue}>
							{latitude !== null && longitude !== null
								? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
								: 'не определены'}
						</Text>
					</View>
					<View style={styles.dataRow}>
						<Text style={styles.dataLabel}>Время съемки</Text>
						<Text style={styles.dataValue}>
							{photoTakenTime
								? photoTakenTime.toLocaleString()
								: 'не определено'}
						</Text>
					</View>
					<View style={styles.dataRow}>
						<Text style={styles.dataLabel}>Размер файла</Text>
						<Text style={styles.dataValue}>
							{fileSizeBytes !== null
								? `${(fileSizeBytes / 1024 / 1024).toFixed(1)} МБ`
								: 'не определен'}
						</Text>
					</View>
					<View style={styles.dataRow}>
						<Text style={styles.dataLabel}>Разрешение</Text>
						<Text style={styles.dataValue}>
							{resolution === 'camera'
								? width !== null && height !== null
									? `${width}×${height}`
									: 'Оригинал камеры'
								: resolution}
						</Text>
					</View>
				</BlurView>

				{/* Reminder Toggle */}
				<BlurView intensity={20} style={styles.reminderBlock}>
					<View style={styles.reminderContent}>
						<View style={styles.reminderInfo}>
							<Bell size={20} color='#f59e0b' />
							<View style={styles.reminderTextContainer}>
								<Text style={styles.reminderTitle}>Напоминание</Text>
								<Text style={styles.reminderSubtitle}>
									Уведомить через 30 минут
								</Text>
							</View>
						</View>
						<Switch
							value={reminderEnabled}
							onValueChange={setReminderEnabled}
							trackColor={{ false: '#cbd5e1', true: '#3b82f6' }}
							thumbColor={reminderEnabled ? '#ffffff' : '#ffffff'}
						/>
					</View>
				</BlurView>

				{/* File Settings */}
				<BlurView intensity={20} style={styles.settingsBlock}>
					<Text style={styles.blockTitle}>Название файла</Text>
					<View style={styles.inputContainer}>
						{/* <Text style={styles.inputLabel}></Text> */}
						<TextInput
							style={styles.textInput}
							value={fileName}
							onChangeText={updateFileName}
							placeholder='Введите название файла'
							placeholderTextColor='#94a3b8'
						/>
					</View>
				</BlurView>
			</ScrollView>

			{/* Action Buttons */}
			<BlurView intensity={20} style={styles.buttonContainer}>
				<TouchableOpacity
					style={[styles.cancelButton, isUploading && styles.disabledButton]}
					onPress={cancelPhoto}
					disabled={isUploading}
				>
					<Text style={styles.cancelButtonText}>Отмена</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={[styles.saveButton, isUploading && styles.disabledButton]}
					onPress={uploadToGoogleDrive}
					disabled={isUploading}
				>
					<Save size={20} color='#fff' />
					<Text style={styles.saveButtonText}>
						{isUploading ? 'Сохранение...' : 'Сохранить'}
					</Text>
				</TouchableOpacity>
			</BlurView>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f1f5f9',
	},
	scrollContainer: {
		flex: 1,
	},
	loadingText: {
		color: '#64748b',
		fontSize: 18,
		textAlign: 'center',
		marginTop: 100,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 24,
		paddingTop: 20,
		paddingBottom: 15,
	},
	title: {
		fontSize: 28,
		fontWeight: 'bold',
		color: '#1e293b',
	},
	closeButton: {
		width: 40,
		height: 40,
		borderRadius: 12,
		backgroundColor: 'rgba(239, 68, 68, 0.1)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	photoContainer: {
		marginHorizontal: 24,
		marginBottom: 15,
		borderRadius: 24,
		overflow: 'hidden',
		backgroundColor: 'rgba(255, 255, 255, 0.4)',
		padding: 16,
	},
	preview: {
		width: '100%',
		height: 256,
		borderRadius: 16,
		resizeMode: 'cover',
	},
	previewWrapper: {
		width: '100%',
		height: 256,
		borderRadius: 16,
		overflow: 'hidden',
	},
	dataBlock: {
		marginHorizontal: 24,
		marginBottom: 15,
		borderRadius: 24,
		padding: 18,
		backgroundColor: 'rgba(255, 255, 255, 0.4)',
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.2)',
		overflow: 'hidden',
	},
	settingsBlock: {
		marginHorizontal: 24,
		marginBottom: 15,
		borderRadius: 24,
		padding: 18,
		backgroundColor: 'rgba(255, 255, 255, 0.4)',
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.2)',
		overflow: 'hidden',
	},
	reminderBlock: {
		marginHorizontal: 24,
		marginBottom: 15,
		borderRadius: 24,
		padding: 24,
		backgroundColor: 'rgba(255, 255, 255, 0.4)',
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.2)',
		overflow: 'hidden',
	},
	blockTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: '#334155',
		marginBottom: 2,
	},
	dataRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 4,
	},
	dataLabel: {
		fontSize: 16,
		color: '#64748b',
	},
	dataValue: {
		fontSize: 14,
		color: '#1e293b',
		fontFamily: 'monospace',
		fontWeight: '500',
	},
	inputContainer: {
		marginBottom: 16,
	},
	inputLabel: {
		fontSize: 14,
		fontWeight: '500',
		color: '#64748b',
		marginBottom: 8,
	},
	textInput: {
		backgroundColor: 'rgba(255, 255, 255, 0.5)',
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.3)',
		borderRadius: 16,
		paddingHorizontal: 16,
		paddingVertical: 12,
		fontSize: 16,
		color: '#1e293b',
	},
	reminderContent: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	reminderInfo: {
		flexDirection: 'row',
		alignItems: 'center',
		flex: 1,
	},
	reminderTextContainer: {
		marginLeft: 12,
	},
	reminderTitle: {
		fontSize: 16,
		fontWeight: '500',
		color: '#334155',
	},
	reminderSubtitle: {
		fontSize: 14,
		color: '#64748b',
		marginTop: 2,
	},
	buttonContainer: {
		flexDirection: 'row',
		paddingHorizontal: 24,
		paddingVertical: 16,
		backgroundColor: 'rgba(255, 255, 255, 0.4)',
		borderTopWidth: 1,
		borderTopColor: 'rgba(255, 255, 255, 0.2)',
		overflow: 'hidden',
	},
	cancelButton: {
		flex: 1,
		backgroundColor: 'rgba(255, 255, 255, 0.6)',
		borderRadius: 16,
		paddingVertical: 16,
		alignItems: 'center',
		marginRight: 8,
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.2)',
	},
	saveButton: {
		flex: 1,
		backgroundColor: '#3b82f6',
		borderRadius: 16,
		paddingVertical: 16,
		alignItems: 'center',
		marginLeft: 8,
		flexDirection: 'row',
		justifyContent: 'center',
		gap: 8,
	},
	cancelButtonText: {
		color: '#334155',
		fontSize: 16,
		fontWeight: '600',
	},
	saveButtonText: {
		color: '#ffffff',
		fontSize: 16,
		fontWeight: '600',
	},
	disabledButton: {
		opacity: 0.6,
	},
})
