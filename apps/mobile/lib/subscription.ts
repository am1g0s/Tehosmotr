export const SUBSCRIPTION_STATUS_URL =
	'https://example.com/api/subscription/status'
export const PAYMENT_PAGE_URL = 'https://example.com/payment'

export function buildPaymentUrl(params: {
	email?: string | null
	equipmentId: string
}) {
	const url = new URL(PAYMENT_PAGE_URL)
	if (params.email) url.searchParams.set('email', params.email)
	url.searchParams.set('equipment_id', params.equipmentId)
	return url.toString()
}
