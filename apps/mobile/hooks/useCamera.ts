import { writeAsync } from '@lodev09/react-native-exify'
import * as FileSystem from 'expo-file-system'
import * as ImageManipulator from 'expo-image-manipulator'
import * as ImagePicker from 'expo-image-picker'
import * as Location from 'expo-location'
import * as MediaLibrary from 'expo-media-library'
import { router } from 'expo-router'
import { useCallback, useState } from 'react'
import { Alert, Image } from 'react-native'
import { useSettings } from '../lib/settings'
import { useOverlayCompositor } from './overlay-compositor'
import { useToast } from './toast-context'
import { useGoogleDrive } from './useGoogleDrive'

export interface PhotoData {
	uri: string
	fileSizeBytes: number | null
	latitude: number | null
	longitude: number | null
	width: number | null
	height: number | null
}

export const useCamera = () => {
	const [isLoading, setIsLoading] = useState(false)
	const {
		imageQuality,
		resolution,
		locationSource,
		previewBeforeSave,
		autoSave,
		// настройки для прожига текста
		showCoordinates,
		showDateTime,
		textPosition,
		fontSize,
		textColor,
		textOutline,
		coordinateFormat,
		decimalPlaces,
	} = useSettings()
	const { uploadPhoto } = useGoogleDrive()
	const { showToast } = useToast()
	const { composePhotoWithOverlay } = useOverlayCompositor()

	// =========================
	// Вспомогательные функции
	// =========================

	const requestCameraPermission = useCallback(async () => {
		const { status: cameraStatus } =
			await ImagePicker.getCameraPermissionsAsync()
		if (cameraStatus !== 'granted') {
			const { status: newStatus } =
				await ImagePicker.requestCameraPermissionsAsync()
			if (newStatus !== 'granted') {
				Alert.alert(
					'Разрешение камеры',
					'Для съемки фотографий необходимо разрешение на доступ к камере.'
				)
				return false
			}
		}
		return true
	}, [])

	const getForegroundLocationOrNull = useCallback(async (): Promise<{
		latitude: number | null
		longitude: number | null
		altitude: number | null
	}> => {
		try {
			const { status } = await Location.getForegroundPermissionsAsync()
			if (status !== 'granted') {
				const { status: newStatus } =
					await Location.requestForegroundPermissionsAsync()
				if (newStatus !== 'granted') {
					return { latitude: null, longitude: null, altitude: null }
				}
			}

			const accuracy =
				locationSource === 'gps_only'
					? Location.Accuracy.Highest
					: Location.Accuracy.Balanced
			const loc = await Location.getCurrentPositionAsync({ accuracy })

			const { latitude, longitude, altitude } = loc.coords
			return {
				latitude: typeof latitude === 'number' ? latitude : null,
				longitude: typeof longitude === 'number' ? longitude : null,
				altitude:
					typeof altitude === 'number' && Number.isFinite(altitude)
						? altitude
						: null,
			}
		} catch (e) {
			console.error('❌ Ошибка получения местоположения:', e)
			return { latitude: null, longitude: null, altitude: null }
		}
	}, [locationSource])

	const extractCoordsFromExif = (
		exif: any
	): { latitude: number | null; longitude: number | null } => {
		const lat =
			typeof exif?.GPSLatitude === 'number'
				? exif.GPSLatitude
				: typeof exif?.gpsLatitude === 'number'
				? exif.gpsLatitude
				: null
		const lon =
			typeof exif?.GPSLongitude === 'number'
				? exif.GPSLongitude
				: typeof exif?.gpsLongitude === 'number'
				? exif.gpsLongitude
				: null
		return { latitude: lat, longitude: lon }
	}

	// Функция для получения размеров изображения
	const getImageDimensions = useCallback(
		async (
			uri: string
		): Promise<{
			width: number | null
			height: number | null
		}> => {
			try {
				return new Promise(resolve => {
					Image.getSize(
						uri,
						(width, height) => {
							resolve({ width, height })
						},
						error => {
							console.error('❌ Ошибка получения размеров изображения:', error)
							resolve({ width: null, height: null })
						}
					)
				})
			} catch (error) {
				console.error('❌ Ошибка получения размеров изображения:', error)
				return { width: null, height: null }
			}
		},
		[]
	)

	// Функция для получения разрешения изображения
	const getResolutionSettings = useCallback(() => {
		switch (resolution) {
			case '1920x1080':
				return { width: 1920, height: 1080 }
			case '1280x720':
				return { width: 1280, height: 720 }
			case 'camera':
			default:
				return undefined
		}
	}, [resolution])

	// Функция для получения геолокации в фоне (после съемки)
	const getLocationInBackground = useCallback(async (): Promise<{
		latitude: number | null
		longitude: number | null
	}> => {
		const loc = await getForegroundLocationOrNull()
		return { latitude: loc.latitude, longitude: loc.longitude }
	}, [getForegroundLocationOrNull])

	const takePicture = useCallback(async (): Promise<PhotoData | null> => {
		setIsLoading(true)

		try {
			// Получаем настройки разрешения
			const resolutionSettings = getResolutionSettings()

			// Разрешение камеры
			const allowed = await requestCameraPermission()
			if (!allowed) {
				setIsLoading(false)
				return null
			}

			// БЫСТРО открываем камеру без ожидания геолокации
			const result = await ImagePicker.launchCameraAsync({
				mediaTypes: 'images',
				allowsEditing: false,
				aspect: [4, 3],
				quality: 1.0, // Максимальное качество, сжатие будет потом
				exif: true, // Включаем EXIF для возможного получения координат из камеры
				...resolutionSettings,
			})

			if (!result.canceled && result.assets[0]) {
				const asset = result.assets[0]

				// ПОСЛЕ съемки начинаем обработку данных параллельно
				const [fileSizeResult, locationResult, dimensionsResult] =
					await Promise.allSettled([
						// Получение размера файла
						(async () => {
							try {
								const info = await FileSystem.getInfoAsync(asset.uri)
								if (info.exists && typeof info.size === 'number') {
									return info.size
								}
								return null
							} catch {
								return null
							}
						})(),
						// Получение геолокации в фоне
						getLocationInBackground(),
						// Получение размеров изображения
						getImageDimensions(asset.uri),
					])

				// Извлекаем результаты
				const fileSizeBytes =
					fileSizeResult.status === 'fulfilled' ? fileSizeResult.value : null
				const locationData =
					locationResult.status === 'fulfilled'
						? locationResult.value
						: { latitude: null, longitude: null }
				const dimensionsData =
					dimensionsResult.status === 'fulfilled'
						? dimensionsResult.value
						: { width: null, height: null }

				// Пробуем получить координаты из EXIF если геолокация не сработала
				let { latitude, longitude } = locationData
				if (latitude === null || longitude === null) {
					const { latitude: exifLat, longitude: exifLon } =
						extractCoordsFromExif(asset.exif || {})
					latitude = latitude ?? exifLat
					longitude = longitude ?? exifLon
				}

				const photoData: PhotoData = {
					uri: asset.uri,
					fileSizeBytes,
					latitude,
					longitude,
					width: dimensionsData.width,
					height: dimensionsData.height,
				}

				setIsLoading(false)
				return photoData
			} else {
				// Пользователь отменил съемку
				setIsLoading(false)
				return null
			}
		} catch (error) {
			console.error('❌ Ошибка при съемке:', error)
			Alert.alert('Ошибка', 'Не удалось сделать снимок')
			setIsLoading(false)
			return null
		}
	}, [
		getResolutionSettings,
		getLocationInBackground,
		requestCameraPermission,
		getImageDimensions,
	])

	const takePhotoAndNavigate = useCallback(async () => {
		const photoData = await takePicture()

		if (photoData) {
			if (previewBeforeSave) {
				// Переходим на страницу предпросмотра
				router.push({
					pathname: '/photo',
					params: {
						photoUri: photoData.uri,
						fileSizeBytes: photoData.fileSizeBytes?.toString() || '',
						latitude: photoData.latitude?.toString() || '',
						longitude: photoData.longitude?.toString() || '',
						width: photoData.width?.toString() || '',
						height: photoData.height?.toString() || '',
					},
				})
				return
			}

			// Режим без предпросмотра: обработка и отправка в фоне
			try {
				showToast('Отправка изображения на Google Drive...', 'info')
				// 1) при необходимости прожечь текст (координаты/время) на фото
				let baseUri = photoData.uri
				try {
					const lines: string[] = []
					if (
						showCoordinates &&
						photoData.latitude !== null &&
						photoData.longitude !== null
					) {
						const lat = photoData.latitude
						const lon = photoData.longitude
						if (coordinateFormat === 'degrees_minutes') {
							const toD = (v: number, isLat: boolean) => {
								const abs = Math.abs(v)
								const deg = Math.floor(abs)
								const minFloat = (abs - deg) * 60
								const min = Math.floor(minFloat)
								const sec = Math.round((minFloat - min) * 60)
								const ref = isLat ? (v >= 0 ? 'N' : 'S') : v >= 0 ? 'E' : 'W'
								return `${deg}° ${min}' ${sec}" ${ref}`
							}
							lines.push(`${toD(lat, true)}  ${toD(lon, false)}`)
						} else {
							lines.push(
								`${lat.toFixed(decimalPlaces)}; ${lon.toFixed(decimalPlaces)}`
							)
						}
					}
					if (showDateTime) {
						const dt = new Date()
						const pad = (n: number) => String(n).padStart(2, '0')
						const dateStr = `${pad(dt.getDate())}.${pad(
							dt.getMonth() + 1
						)}.${dt.getFullYear()}`
						const timeStr = `${pad(dt.getHours())}:${pad(dt.getMinutes())}`
						lines.push(`${dateStr} ${timeStr}`)
					}
					if (lines.length > 0 && photoData.width && photoData.height) {
						baseUri = await composePhotoWithOverlay({
							photoUri: baseUri,
							width: photoData.width,
							height: photoData.height,
							textLines: lines,
							textPosition,
							fontSize,
							textColor,
							textOutline,
						})
					}
				} catch (e) {
					// Если не удалось собрать оверлей, продолжаем без прожига, не прерывая процесс
					console.warn('Не удалось прожечь текст на изображение, пропускаем', e)
				}

				// 2) доп. ресайз/компресс + EXIF
				const processedUri = await processPhotoForUpload(
					baseUri,
					photoData.latitude,
					photoData.longitude
				)
				try {
					const uploaded = await uploadPhoto(processedUri, new Date())
					if (autoSave) {
						await ensureGalleryPermissionAndSave(processedUri)
					}
					showToast(
						`Фото "${uploaded.name}" загружено на Google Drive`,
						'success'
					)
				} catch (e) {
					// Не авторизован или другая ошибка — не валим поток, информируем
					showToast('Требуется вход в Google для загрузки на Диск', 'error')
					if (autoSave) {
						await ensureGalleryPermissionAndSave(processedUri)
					}
				}
			} catch (e) {
				showToast('Ошибка обработки фото', 'error')
			}
		} else {
			console.log('❌ Нет данных фото для навигации')
		}
	}, [
		takePicture,
		previewBeforeSave,
		uploadPhoto,
		showToast,
		processPhotoForUpload,
		autoSave,
		composePhotoWithOverlay,
		showCoordinates,
		showDateTime,
		textPosition,
		fontSize,
		textColor,
		textOutline,
		coordinateFormat,
		decimalPlaces,
	])

	const ensureGalleryPermissionAndSave = useCallback(async (uri: string) => {
		try {
			const { status } = await MediaLibrary.requestPermissionsAsync()
			if (status === 'granted') {
				await MediaLibrary.saveToLibraryAsync(uri)
			}
		} catch {}
	}, [])

	const processPhotoForUpload = useCallback(
		async (
			photoUri: string,
			latitude?: number | null,
			longitude?: number | null
		): Promise<string> => {
			try {
				const resolutionSettings = getResolutionSettings()
				const processedImageUri = await (async () => {
					if (resolutionSettings && resolution !== 'camera') {
						const processed = await ImageManipulator.manipulateAsync(
							photoUri,
							[
								{
									resize: {
										width: resolutionSettings.width,
										height: resolutionSettings.height,
									},
								},
							],
							{
								compress: imageQuality,
								format: ImageManipulator.SaveFormat.JPEG,
							}
						)
						return processed.uri
					}
					const processed = await ImageManipulator.manipulateAsync(
						photoUri,
						[],
						{ compress: imageQuality, format: ImageManipulator.SaveFormat.JPEG }
					)
					return processed.uri
				})()

				if (
					latitude !== null &&
					longitude !== null &&
					latitude !== undefined &&
					longitude !== undefined &&
					Number.isFinite(latitude) &&
					Number.isFinite(longitude) &&
					Math.abs(latitude) <= 90 &&
					Math.abs(longitude) <= 180
				) {
					console.log('🌍 Добавляем GPS-координаты:', latitude, longitude)
					const loc = await getForegroundLocationOrNull()

					const dt = new Date()
					const pad = (n: number) => String(n).padStart(2, '0')
					const dateStr = `${dt.getFullYear()}:${pad(dt.getMonth() + 1)}:${pad(
						dt.getDate()
					)}`
					const timeStr = `${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(
						dt.getSeconds()
					)}`

					const gpsData: Record<string, any> = {
						GPSLatitude: Math.abs(latitude as number),
						GPSLongitude: Math.abs(longitude as number),
						GPSLatitudeRef: (latitude as number) >= 0 ? 'N' : 'S',
						GPSLongitudeRef: (longitude as number) >= 0 ? 'E' : 'W',
						DateTimeOriginal: `${dateStr} ${timeStr}`,
						CreateDate: `${dateStr} ${timeStr}`,
						UserComment: 'GPS location added by app',
					}
					if (
						typeof loc.altitude === 'number' &&
						Number.isFinite(loc.altitude)
					) {
						gpsData.GPSAltitude = Math.abs(loc.altitude)
						gpsData.GPSAltitudeRef = loc.altitude >= 0 ? 0 : 1
					}

					const writeResult = await writeAsync(processedImageUri, gpsData)
					return writeResult?.uri ?? processedImageUri
				}

				return processedImageUri
			} catch (error) {
				console.error('❌ Ошибка обработки фото с GPS:', error)
				return photoUri
			}
		},
		[
			imageQuality,
			getResolutionSettings,
			resolution,
			getForegroundLocationOrNull,
		]
	)

	return {
		takePicture,
		takePhotoAndNavigate,
		processPhotoForUpload,
		isLoading,
	}
}
