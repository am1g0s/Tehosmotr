import { useCallback, useState } from 'react'
import { useSettings } from '../lib/settings'
import { useGoogleAuth } from './useGoogleAuth'

export interface DriveFile {
	id: string
	name: string
	mimeType: string
	size?: string
	modifiedTime: string
	parents?: string[]
	webViewLink?: string
	thumbnailLink?: string
}

export interface DriveFolder {
	id: string
	name: string
	mimeType: string
	modifiedTime: string
	parents?: string[]
}

export interface DriveState {
	files: DriveFile[]
	folders: DriveFolder[]
	isLoading: boolean
	error: string | null
	currentFolderId: string | null
}

export const useGoogleDrive = () => {
	const { isAuthenticated, ensureAccessToken } = useGoogleAuth()
	const { googleDriveRootFolder } = useSettings()
	const [driveState, setDriveState] = useState<DriveState>({
		files: [],
		folders: [],
		isLoading: false,
		error: null,
		currentFolderId: null,
	})

	// Функция для поиска или создания папки
	const findOrCreateFolder = useCallback(
		async (
			folderName: string,
			parentFolderId: string = 'root'
		): Promise<string> => {
			if (!isAuthenticated) {
				throw new Error('Не авторизован в Google')
			}

			const accessToken = await ensureAccessToken()
			if (!accessToken) {
				throw new Error('Не удалось получить токен доступа')
			}

			try {
				// Ищем папку по имени в указанной родительской папке
				const query = encodeURIComponent(
					`name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false and '${parentFolderId}' in parents`
				)

				const listResponse = await fetch(
					`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`,
					{
						headers: { Authorization: `Bearer ${accessToken}` },
					}
				)

				if (!listResponse.ok) {
					const errorText = await listResponse.text()
					console.error(
						'Google Drive API error:',
						listResponse.status,
						errorText
					)
					throw new Error('Не удалось получить список папок Google Drive')
				}

				const listData = await listResponse.json()

				// Если папка найдена, возвращаем её ID
				if (Array.isArray(listData.files) && listData.files.length > 0) {
					return listData.files[0].id
				}

				// Если папка не найдена, создаём новую
				const createResponse = await fetch(
					'https://www.googleapis.com/drive/v3/files',
					{
						method: 'POST',
						headers: {
							Authorization: `Bearer ${accessToken}`,
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							name: folderName,
							mimeType: 'application/vnd.google-apps.folder',
							parents: [parentFolderId],
						}),
					}
				)

				if (!createResponse.ok) {
					const errorText = await createResponse.text()
					console.error(
						'Google Drive API error:',
						createResponse.status,
						errorText
					)
					throw new Error('Не удалось создать папку на Google Drive')
				}

				const created = await createResponse.json()
				return created.id as string
			} catch (error) {
				console.error('Ошибка при поиске/создании папки:', error)
				throw error
			}
		},
		[isAuthenticated, ensureAccessToken]
	)

	// Функция для получения корневой папки для фотографий
	const getRootPhotoFolder = useCallback(async (): Promise<string> => {
		return await findOrCreateFolder(googleDriveRootFolder, 'root')
	}, [findOrCreateFolder, googleDriveRootFolder])

	// Функция для получения папки с датой
	const getDateFolder = useCallback(
		async (date: Date): Promise<string> => {
			const rootFolderId = await getRootPhotoFolder()
			const dateFolderName = date.toISOString().slice(0, 10) // YYYY-MM-DD
			return await findOrCreateFolder(dateFolderName, rootFolderId)
		},
		[getRootPhotoFolder, findOrCreateFolder]
	)

	// Функция для генерации имени файла с датой и временем
	const generateFileName = useCallback((date: Date): string => {
		const pad = (n: number) => String(n).padStart(2, '0')
		return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
			date.getDate()
		)}_${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(
			date.getSeconds()
		)}.jpg`
	}, [])

	// Функция для загрузки фото на Google Drive
	const uploadPhoto = useCallback(
		async (
			photoUri: string,
			date: Date = new Date(),
			customFileName?: string
		): Promise<{ id: string; name: string }> => {
			if (!isAuthenticated) {
				throw new Error('Не авторизован в Google')
			}

			const accessToken = await ensureAccessToken()
			if (!accessToken) {
				throw new Error('Не удалось получить токен доступа')
			}

			try {
				// Получаем папку с датой
				const dateFolderId = await getDateFolder(date)

				// Генерируем имя файла
				const fileName = customFileName
					? `${customFileName}.jpg`
					: generateFileName(date)

				// Начинаем резюмируемую загрузку
				const startResponse = await fetch(
					'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable',
					{
						method: 'POST',
						headers: {
							Authorization: `Bearer ${accessToken}`,
							'Content-Type': 'application/json; charset=UTF-8',
							'X-Upload-Content-Type': 'image/jpeg',
						},
						body: JSON.stringify({
							name: fileName,
							parents: [dateFolderId],
							mimeType: 'image/jpeg',
						}),
					}
				)

				if (!startResponse.ok) {
					const errorText = await startResponse.text()
					console.error(
						'Google Drive API error:',
						startResponse.status,
						errorText
					)
					throw new Error('Не удалось подготовить загрузку на Google Drive')
				}

				const uploadUrl = startResponse.headers.get('Location')
				if (!uploadUrl) {
					throw new Error('Не удалось получить URL загрузки Google Drive')
				}

				// Загружаем файл
				const uploadResponse = await fetch(uploadUrl, {
					method: 'PUT',
					headers: {
						'Content-Type': 'image/jpeg',
						Authorization: `Bearer ${accessToken}`,
					},
					body: await fetch(photoUri).then(res => res.blob()),
				})

				if (uploadResponse.status !== 200 && uploadResponse.status !== 201) {
					const errorText = await uploadResponse.text()
					console.error(
						'Google Drive API error:',
						uploadResponse.status,
						errorText
					)
					throw new Error('Загрузка файла на Google Drive не удалась')
				}

				const uploadedFile = await uploadResponse.json()
				return { id: uploadedFile.id, name: fileName }
			} catch (error) {
				console.error('Ошибка при загрузке фото:', error)
				throw error
			}
		},
		[isAuthenticated, ensureAccessToken, getDateFolder, generateFileName]
	)

	// Получаем список файлов и папок (тестовая версия)
	const listFiles = useCallback(
		async (folderId: string = 'root') => {
			if (!isAuthenticated) {
				setDriveState(prev => ({
					...prev,
					error: 'Не авторизован в Google',
				}))
				return
			}

			setDriveState(prev => ({ ...prev, isLoading: true, error: null }))

			try {
				// Имитируем задержку сети
				await new Promise(resolve => setTimeout(resolve, 1000))

				// Создаем тестовые данные
				const testFolders: DriveFolder[] = [
					{
						id: 'folder1',
						name: 'Техосмотр 2024',
						mimeType: 'application/vnd.google-apps.folder',
						modifiedTime: new Date().toISOString(),
					},
					{
						id: 'folder2',
						name: 'Фотографии',
						mimeType: 'application/vnd.google-apps.folder',
						modifiedTime: new Date().toISOString(),
					},
				]

				const testFiles: DriveFile[] = [
					{
						id: 'file1',
						name: 'photo1.jpg',
						mimeType: 'image/jpeg',
						size: '2048576',
						modifiedTime: new Date().toISOString(),
					},
					{
						id: 'file2',
						name: 'document.pdf',
						mimeType: 'application/pdf',
						size: '1048576',
						modifiedTime: new Date().toISOString(),
					},
				]

				setDriveState({
					files: testFiles,
					folders: testFolders,
					isLoading: false,
					error: null,
					currentFolderId: folderId,
				})
			} catch (error) {
				console.error('Ошибка получения файлов:', error)
				setDriveState(prev => ({
					...prev,
					isLoading: false,
					error: 'Не удалось получить список файлов',
				}))
			}
		},
		[isAuthenticated]
	)

	// Загружаем файл (заглушка)
	const downloadFile = useCallback(
		async (fileId: string, fileName: string) => {
			if (!isAuthenticated) {
				throw new Error('Не авторизован в Google')
			}

			// Имитируем загрузку файла
			await new Promise(resolve => setTimeout(resolve, 1000))
			return new Blob(['test file content'], { type: 'text/plain' })
		},
		[isAuthenticated]
	)

	// Загружаем файл на Google Drive (заглушка)
	const uploadFile = useCallback(
		async (
			file: File | Blob,
			fileName: string,
			parentFolderId: string = 'root'
		) => {
			if (!isAuthenticated) {
				throw new Error('Не авторизован в Google')
			}

			// Имитируем загрузку файла
			await new Promise(resolve => setTimeout(resolve, 2000))
			return { id: 'uploaded-file-id', name: fileName }
		},
		[isAuthenticated]
	)

	// Создаем новую папку (тестовая версия)
	const createFolder = useCallback(
		async (folderName: string, parentFolderId: string = 'root') => {
			if (!isAuthenticated) {
				throw new Error('Не авторизован в Google')
			}

			// Имитируем создание папки
			await new Promise(resolve => setTimeout(resolve, 1000))
			return { id: `new-folder-${Date.now()}`, name: folderName }
		},
		[isAuthenticated]
	)

	// Удаляем файл или папку (тестовая версия)
	const deleteFile = useCallback(
		async (fileId: string) => {
			if (!isAuthenticated) {
				throw new Error('Не авторизован в Google')
			}

			// Имитируем удаление файла
			await new Promise(resolve => setTimeout(resolve, 1000))
		},
		[isAuthenticated]
	)

	// Переименовываем файл или папку (тестовая версия)
	const renameFile = useCallback(
		async (fileId: string, newName: string) => {
			if (!isAuthenticated) {
				throw new Error('Не авторизован в Google')
			}

			// Имитируем переименование файла
			await new Promise(resolve => setTimeout(resolve, 1000))
		},
		[isAuthenticated]
	)

	// Переходим в папку
	const navigateToFolder = useCallback(
		async (folderId: string) => {
			await listFiles(folderId)
		},
		[listFiles]
	)

	// Возвращаемся в родительскую папку
	const navigateToParent = useCallback(async () => {
		await listFiles('root')
	}, [listFiles])

	// Очищаем ошибку
	const clearError = useCallback(() => {
		setDriveState(prev => ({ ...prev, error: null }))
	}, [])

	return {
		...driveState,
		listFiles,
		downloadFile,
		uploadFile,
		uploadPhoto,
		createFolder,
		deleteFile,
		renameFile,
		navigateToFolder,
		navigateToParent,
		clearError,
		findOrCreateFolder,
		getRootPhotoFolder,
		getDateFolder,
		generateFileName,
	}
}
