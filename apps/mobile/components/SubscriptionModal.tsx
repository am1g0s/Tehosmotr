import { useAuth } from '@/hooks/auth-context'
import { getEquipmentId } from '@/lib/device'
import { buildPaymentUrl } from '@/lib/subscription'
import * as Linking from 'expo-linking'
import { Crown, X } from 'lucide-react-native'
import React, { useCallback } from 'react'
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export type SubscriptionModalProps = {
	visible: boolean
	onClose: () => void
	onBuyGoogle?: () => void // заглушка на будущее
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
	visible,
	onClose,
	onBuyGoogle,
}) => {
	const { isAuthenticated, user } = useAuth()

	const handleOpenPaymentSite = useCallback(async () => {
		const equipmentId = await getEquipmentId()
		const email = isAuthenticated ? user?.email : undefined
		const url = buildPaymentUrl({ email, equipmentId })
		await Linking.openURL(url)
	}, [isAuthenticated, user?.email])

	return (
		<Modal
			visible={visible}
			transparent
			animationType='fade'
			onRequestClose={onClose}
		>
			<View style={styles.overlay}>
				<View style={styles.modalBox}>
					<TouchableOpacity style={styles.closeIcon} onPress={onClose}>
						<X size={20} color='#6b7280' />
					</TouchableOpacity>

					<View style={styles.header}>
						<View style={styles.iconWrap}>
							<Crown size={24} color='#fff' />
						</View>
						<Text style={styles.title}>Оформите подписку</Text>
						<Text style={styles.subtitle}>
							Чтобы снимать фото, необходима активная подписка
						</Text>
					</View>

					<View style={styles.actions}>
						<TouchableOpacity
							style={[styles.btn, styles.btnPrimary]}
							onPress={onBuyGoogle}
						>
							<Text style={styles.btnPrimaryText}>Купить через Google</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={[styles.btn, styles.btnOutline]}
							onPress={handleOpenPaymentSite}
						>
							<Text style={styles.btnOutlineText}>Оплата для ИП и юр. лиц</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</Modal>
	)
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.45)',
		justifyContent: 'center',
		alignItems: 'center',
		padding: 24,
	},
	modalBox: {
		width: '100%',
		maxWidth: 420,
		borderRadius: 20,
		overflow: 'hidden',
		borderWidth: 1,
		borderColor: 'rgba(0, 0, 0, 0.05)',
		backgroundColor: '#ffffff',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 10 },
		shadowOpacity: 0.15,
		shadowRadius: 20,
		elevation: 15,
	},
	closeIcon: {
		position: 'absolute',
		top: 12,
		right: 12,
		padding: 8,
		zIndex: 2,
	},
	header: { padding: 20, alignItems: 'center' },
	iconWrap: {
		width: 56,
		height: 56,
		borderRadius: 16,
		backgroundColor: '#f59e0b',
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 12,
		shadowColor: '#f59e0b',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 8,
	},
	title: { fontSize: 20, fontWeight: '700', color: '#111827' },
	subtitle: { textAlign: 'center', marginTop: 8, color: '#6b7280' },
	actions: { paddingHorizontal: 20, paddingBottom: 20, gap: 12 },
	btn: {
		borderRadius: 12,
		paddingVertical: 14,
		alignItems: 'center',
	},
	btnPrimary: { backgroundColor: '#6366f1' },
	btnPrimaryText: { color: '#fff', fontWeight: '700' },
	btnOutline: {
		borderWidth: 1,
		borderColor: '#c7d2fe',
		backgroundColor: '#eef2ff',
	},
	btnOutlineText: { color: '#4338ca', fontWeight: '700' },
})

export default SubscriptionModal
