import React, { createContext, ReactNode, useContext, useState } from 'react'

export type ResolutionOption = 'camera' | '1920x1080' | '1280x720'
export type CoordinateFormat = 'degrees_minutes' | 'decimal' | 'both'
export type TextPosition =
	| 'top-left'
	| 'top-right'
	| 'bottom-left'
	| 'bottom-right'
	| 'center'
export type TextColor = string
export type LocationSource = 'gps_only' | 'gps_networks'
export type ThemeMode = 'auto' | 'light' | 'dark'

interface Settings {
	themeMode: ThemeMode
	imageQuality: number
	autoSave: boolean
	resolution: ResolutionOption
	// Настройки координат
	showCoordinates: boolean
	showDateTime: boolean
	coordinateFormat: CoordinateFormat
	decimalPlaces: number
	textColor: TextColor
	textOutline: boolean
	textPosition: TextPosition
	fontSize: number
	// Источник геоданных
	locationSource: LocationSource
	// Предпросмотр перед сохранением
	previewBeforeSave: boolean
	// Настройки Google Drive
	googleAccount: string | null
	googleToken: string | null
	googleDriveRootFolder: string
	setImageQuality: (quality: number) => void
	setAutoSave: (autoSave: boolean) => void
	setResolution: (resolution: ResolutionOption) => void
	setShowCoordinates: (show: boolean) => void
	setShowDateTime: (show: boolean) => void
	setCoordinateFormat: (format: CoordinateFormat) => void
	setDecimalPlaces: (places: number) => void
	setTextColor: (color: TextColor) => void
	setTextOutline: (outline: boolean) => void
	setTextPosition: (position: TextPosition) => void
	setFontSize: (size: number) => void
	setLocationSource: (source: LocationSource) => void
	setPreviewBeforeSave: (value: boolean) => void
	setGoogleAccount: (account: string | null) => void
	setGoogleToken: (token: string | null) => void
	setGoogleDriveRootFolder: (folder: string) => void
	setThemeMode: (mode: ThemeMode) => void
}

const SettingsContext = createContext<Settings | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
	const [imageQuality, setImageQuality] = useState(0.8)
	const [autoSave, setAutoSave] = useState(false)
	const [resolution, setResolution] = useState<ResolutionOption>('camera')
	// Настройки координат
	const [showCoordinates, setShowCoordinates] = useState(true)
	const [showDateTime, setShowDateTime] = useState(true)
	const [coordinateFormat, setCoordinateFormat] =
		useState<CoordinateFormat>('decimal')
	const [decimalPlaces, setDecimalPlaces] = useState(6)
	const [textColor, setTextColor] = useState<TextColor>('#FFFFFF')
	const [textOutline, setTextOutline] = useState(true)
	const [textPosition, setTextPosition] = useState<TextPosition>('bottom-left')
	const [fontSize, setFontSize] = useState(16)
	// Источник геоданных (по умолчанию: GPS + сети)
	const [locationSource, setLocationSource] =
		useState<LocationSource>('gps_networks')
	// Предпросмотр перед сохранением: включен по умолчанию
	const [previewBeforeSave, setPreviewBeforeSave] = useState<boolean>(true)
	// Настройки Google Drive
	const [googleAccount, setGoogleAccount] = useState<string | null>(null)
	const [googleToken, setGoogleToken] = useState<string | null>(null)
	const [googleDriveRootFolder, setGoogleDriveRootFolder] =
		useState('Техосмотр')
	const [themeMode, setThemeMode] = useState<ThemeMode>('auto')

	const value: Settings = {
		themeMode,
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
		locationSource,
		previewBeforeSave,
		googleAccount,
		googleToken,
		googleDriveRootFolder,
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
		setLocationSource,
		setPreviewBeforeSave,
		setGoogleAccount,
		setGoogleToken,
		setGoogleDriveRootFolder,
		setThemeMode,
	}

	return (
		<SettingsContext.Provider value={value}>
			{children}
		</SettingsContext.Provider>
	)
}

export function useSettings(): Settings {
	const context = useContext(SettingsContext)
	if (context === undefined) {
		throw new Error('useSettings must be used within a SettingsProvider')
	}
	return context
}
