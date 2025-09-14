import React, {
	createContext,
	ReactNode,
	useCallback,
	useContext,
	useMemo,
	useRef,
	useState,
} from 'react'
import { Image, Text, View } from 'react-native'
import { captureRef } from 'react-native-view-shot'

export type OverlayTextPosition =
	| 'top-left'
	| 'top-right'
	| 'bottom-left'
	| 'bottom-right'
	| 'center'

export interface ComposeRequest {
	photoUri: string
	width: number
	height: number
	textLines: string[]
	textPosition: OverlayTextPosition
	fontSize: number
	textColor: string
	textOutline: boolean
}

interface OverlayCompositorContextType {
	composePhotoWithOverlay: (req: ComposeRequest) => Promise<string>
}

const OverlayCompositorContext = createContext<
	OverlayCompositorContextType | undefined
>(undefined)

export function useOverlayCompositor(): OverlayCompositorContextType {
	const ctx = useContext(OverlayCompositorContext)
	if (!ctx)
		throw new Error(
			'useOverlayCompositor must be used within OverlayCompositorProvider'
		)
	return ctx
}

export function OverlayCompositorProvider({
	children,
}: {
	children: ReactNode
}) {
	const viewRef = useRef<View | null>(null)
	const [currentReq, setCurrentReq] = useState<ComposeRequest | null>(null)
	const [isImageLoaded, setIsImageLoaded] = useState(false)
	const [isMounted, setIsMounted] = useState(false)
	const resolverRef = useRef<{
		resolve: (uri: string) => void
		reject: (e: any) => void
	} | null>(null)

	const resetState = () => {
		setIsImageLoaded(false)
		setIsMounted(false)
		setCurrentReq(null)
		resolverRef.current = null
	}

	const overlayPositionStyle = (pos: OverlayTextPosition) => {
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

	const tryCapture = useCallback(async () => {
		if (
			!currentReq ||
			!isMounted ||
			!isImageLoaded ||
			!viewRef.current ||
			!resolverRef.current
		)
			return
		try {
			// Небольшая задержка, чтобы стили точно применились
			await new Promise(r => setTimeout(r, 60))
			const uri = await captureRef(viewRef.current, {
				format: 'jpg',
				quality: 1,
				result: 'tmpfile',
				width: currentReq.width,
				height: currentReq.height,
			})
			resolverRef.current.resolve(uri)
		} catch (e) {
			resolverRef.current.reject(e)
		} finally {
			resetState()
		}
	}, [currentReq, isMounted, isImageLoaded])

	const composePhotoWithOverlay = useCallback(
		async (req: ComposeRequest): Promise<string> => {
			if (currentReq) {
				// простая блокировка: ждём завершения текущего
				await new Promise(r => setTimeout(r, 50))
				return composePhotoWithOverlay(req)
			}
			const promise = new Promise<string>((resolve, reject) => {
				resolverRef.current = { resolve, reject }
				setCurrentReq(req)
			})
			return promise
		},
		[currentReq]
	)

	// Триггеры захвата, когда готово
	const onLayout = useCallback(() => {
		setIsMounted(true)
		// Попробовать захват, если уже загружено
		setTimeout(() => {
			tryCapture()
		}, 0)
	}, [tryCapture])

	const onImageLoad = useCallback(() => {
		setIsImageLoaded(true)
		setTimeout(() => {
			tryCapture()
		}, 0)
	}, [tryCapture])

	const contextValue = useMemo(
		() => ({ composePhotoWithOverlay }),
		[composePhotoWithOverlay]
	)

	return (
		<OverlayCompositorContext.Provider value={contextValue}>
			{children}
			{/* Невидимый offscreen-композитор */}
			{currentReq && (
				<View
					ref={viewRef}
					collapsable={false}
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						width: currentReq.width,
						height: currentReq.height,
						opacity: 0,
						pointerEvents: 'none',
					}}
					onLayout={onLayout}
				>
					<Image
						source={{ uri: currentReq.photoUri }}
						style={{ width: '100%', height: '100%' }}
						resizeMode='cover'
						onLoadEnd={onImageLoad}
					/>
					{currentReq.textLines.length > 0 && (
						<View style={overlayPositionStyle(currentReq.textPosition)}>
							<Text
								style={{
									color: currentReq.textColor,
									fontSize: currentReq.fontSize,
									fontWeight: '600',
									textShadowColor: currentReq.textOutline
										? 'rgba(0,0,0,0.7)'
										: 'transparent',
									textShadowOffset: { width: 0, height: 0 },
									textShadowRadius: currentReq.textOutline ? 3 : 0,
								}}
							>
								{currentReq.textLines.join('\n')}
							</Text>
						</View>
					)}
				</View>
			)}
		</OverlayCompositorContext.Provider>
	)
}
