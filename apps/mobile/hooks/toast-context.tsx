import React, { createContext, ReactNode, useContext, useState } from 'react'

interface ToastContextType {
	showToast: (message: string, type?: 'success' | 'error' | 'info') => void
	hideToast: () => void
	toastVisible: boolean
	toastMessage: string
	toastType: 'success' | 'error' | 'info'
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
	const [toastVisible, setToastVisible] = useState(false)
	const [toastMessage, setToastMessage] = useState('')
	const [toastType, setToastType] = useState<'success' | 'error' | 'info'>(
		'success'
	)

	const showToast = (
		message: string,
		type: 'success' | 'error' | 'info' = 'success'
	) => {
		setToastMessage(message)
		setToastType(type)
		setToastVisible(true)
	}

	const hideToast = () => {
		setToastVisible(false)
	}

	return (
		<ToastContext.Provider
			value={{
				showToast,
				hideToast,
				toastVisible,
				toastMessage,
				toastType,
			}}
		>
			{children}
		</ToastContext.Provider>
	)
}

export function useToast(): ToastContextType {
	const context = useContext(ToastContext)
	if (context === undefined) {
		throw new Error('useToast must be used within a ToastProvider')
	}
	return context
}
