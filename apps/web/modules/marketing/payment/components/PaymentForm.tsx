"use client";

import { Button } from "@ui/components/button"
import { Input } from "@ui/components/input"
import { Label } from "@ui/components/label"
import { AlertCircle, Calendar, Check, Clock, CreditCard, Gift, Hash, Shield } from "lucide-react"
import { useMemo, useState } from "react"

interface PaymentFormProps {
	initialEmail?: string;
	initialEquipmentId?: string;
}

export function PaymentForm({ initialEmail = "", initialEquipmentId = "" }: PaymentFormProps) {
	const [email, setEmail] = useState(initialEmail);
	const [equipmentId, setEquipmentId] = useState(initialEquipmentId);
	const [period, setPeriod] = useState<number>(12);
	const [registryNumber, setRegistryNumber] = useState("");
	const [promoCode, setPromoCode] = useState("");
	const [paymentMethod, setPaymentMethod] = useState<"online" | "invoice">("online");

	const prices = useMemo(
		() => ({
			1: { original: 399, discounted: 299, invoice: 390 },
			6: { original: 1990, discounted: 1490, invoice: 1950 },
			12: { original: 3990, discounted: 2990, invoice: 3900 },
		}),
		[]
	);

	function getExpiryDate(months: number) {
		const date = new Date();
		date.setMonth(date.getMonth() + months);
		return date.toLocaleDateString("ru-RU");
	}

	const currentPrice = prices[period as 1 | 6 | 12];

	return (
		<div className="min-h-screen bg-linear-to-b from-card to-background py-8 px-4">
			<div className="max-w-2xl mx-auto">
				<div className="text-center mb-8">
					<div className="inline-flex items-center gap-3 mb-4">
						<div className="p-3 rounded-2xl bg-primary shadow-lg">
							<CreditCard className="w-8 h-8 text-white" />
						</div>
						<h1 className="text-3xl font-bold text-foreground">Оплата подписки</h1>
					</div>
					<p className="text-foreground/60">Активация полной версии приложения</p>
				</div>

				<div className="bg-card/60 backdrop-blur-xl rounded-3xl p-8 border border-border shadow-2xl mb-6">
					<div className="mb-8">
						<div className="flex items-center gap-3 mb-6">
							<Shield className="w-6 h-6 text-primary" />
							<h2 className="text-xl font-semibold text-foreground">Информация о продукте</h2>
						</div>

						<div className="space-y-4">
							<div className="flex justify-between items-center py-3 border-b border-border">
								<span className="text-foreground/60">Программный продукт</span>
								<span className="font-semibold text-foreground">Приложение для Android Фото для техосмотра</span>
							</div>

							{email ? (
								<div className="flex justify-between items-center py-3 border-b border-border">
									<span className="text-foreground/60">Email</span>
									<span className="font-mono text-sm text-foreground bg-muted px-3 py-1 rounded-lg">{email}</span>
								</div>
							) : (
								<div className="py-3 border-b border-border">
									<Label className="mb-2 flex items-center gap-2 text-foreground/80">
										<Shield className="w-4 h-4 text-foreground/60" />
										<span className="text-sm font-medium">Email (необязательно)</span>
									</Label>
									<Input
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										placeholder="Введите email"
										className="rounded-2xl py-6"
									/>
								</div>
							)}

							<div className="flex justify-between items-center py-3 border-b border-border">
								<span className="text-foreground/60">Устройство</span>
								<span className="font-mono text-sm text-foreground bg-muted px-3 py-1 rounded-lg">{equipmentId || "не указан"}</span>
							</div>
						</div>
					</div>

					<div className="mb-8">
						<div className="flex items-center gap-3 mb-4">
							<Calendar className="w-6 h-6 text-primary" />
							<h3 className="text-lg font-semibold text-foreground">Период подписки</h3>
						</div>

						<div className="grid grid-cols-3 gap-3">
							{([1, 6, 12] as const).map((months) => (
								<button
									key={months}
									onClick={() => setPeriod(months)}
									className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
										period === months ? "border-primary bg-primary/10 shadow-lg" : "border-border bg-card hover:border-primary/30 hover:shadow-md"
									}`}
								>
									<div className="text-center">
										<div className={`text-2xl font-bold ${period === months ? "text-primary" : "text-foreground"}`}>{months}</div>
										<div className={`text-sm ${period === months ? "text-primary" : "text-foreground/60"}`}>{months === 1 ? "месяц" : "месяцев"}</div>
										{months === 12 && (
											<div className="mt-1 text-xs bg-success/10 text-success px-2 py-1 rounded-full">Выгодно!</div>
										)}
									</div>
								</button>
							))}
						</div>

						<div className="mt-4 p-4 bg-accent rounded-2xl">
							<div className="flex items-center gap-2 text-foreground">
								<Clock className="w-4 h-4" />
								<span className="text-sm font-medium">Срок действия до: {getExpiryDate(period)}</span>
							</div>
						</div>
					</div>

					<div className="mb-6">
						<Label className="flex items-center gap-3 mb-3 text-foreground">
							<Hash className="w-5 h-5 text-foreground/70" />
							<span className="text-sm font-medium">Номер в реестре (необязательно)</span>
						</Label>
						<Input
							type="text"
							value={registryNumber}
							onChange={(e) => setRegistryNumber(e.target.value)}
							placeholder="Введите номер в реестре"
							className="rounded-2xl py-6"
						/>
					</div>

					<div className="mb-8">
						<Label className="flex items-center gap-3 mb-3 text-foreground">
							<Gift className="w-5 h-5 text-foreground/70" />
							<span className="text-sm font-medium">Промокод</span>
						</Label>
						<Input
							type="text"
							value={promoCode}
							onChange={(e) => setPromoCode(e.target.value)}
							placeholder="Введите промокод для скидки"
							className="rounded-2xl py-6"
						/>
					</div>

					{/* Стоимость скрыта — цены указаны в способах оплаты */}

					<div className="mb-8">
						<h3 className="text-lg font-semibold text-foreground mb-4">Способ оплаты</h3>

						<div className="space-y-3">
							<button
								onClick={() => setPaymentMethod("online")}
								className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
									paymentMethod === "online" ? "border-success bg-success/10" : "border-border bg-card hover:border-success/40"
								}`}
							>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === "online" ? "border-success bg-success" : "border-border"}`}>
											{paymentMethod === "online" && <Check className="w-3 h-3 text-white" />}
										</div>
										<div>
											<div className="font-semibold text-foreground">Онлайн оплата</div>
											<div className="text-sm text-foreground/60">Быстро и безопасно</div>
										</div>
									</div>
									<div className="text-right">
										<div className="text-lg font-bold text-success">{currentPrice.discounted.toLocaleString()} руб.</div>
										<div className="text-xs text-foreground/60">Мгновенная активация</div>
									</div>
								</div>
							</button>

							<button
								onClick={() => setPaymentMethod("invoice")}
								className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
									paymentMethod === "invoice" ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/40"
								}`}
							>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === "invoice" ? "border-primary bg-primary" : "border-border"}`}>
											{paymentMethod === "invoice" && <Check className="w-3 h-3 text-white" />}
										</div>
										<div>
											<div className="font-semibold text-foreground">Оплата по счету</div>
											<div className="text-sm text-foreground/60">Для организаций с документами</div>
										</div>
									</div>
									<div className="text-right">
										<div className="text-lg font-bold text-primary">{currentPrice.invoice.toLocaleString()} руб.</div>
										<div className="text-xs text-foreground/60">С закрывающими документами</div>
									</div>
								</div>
							</button>
						</div>
					</div>

					<Button className="w-full" variant="primary" size="lg">
						<div className="flex items-center justify-center gap-3">
							<CreditCard className="w-6 h-6" />
							<span>{paymentMethod === "online" ? "ОПЛАТИТЬ ОНЛАЙН" : "ЗАПРОСИТЬ СЧЕТ"}</span>
						</div>
					</Button>
				</div>

				<div className="space-y-4">
					<div className="bg-accent border border-border rounded-2xl p-4">
						<div className="flex items-start gap-3">
							<AlertCircle className="w-5 h-5 text-highlight mt-0.5 flex-shrink-0" />
							<div className="text-foreground">
								<p className="font-medium mb-1">Обращаем внимание!</p>
								<p className="text-sm">Подписка, после оплаты, будет привязана именно к этому устройству!</p>
							</div>
						</div>
					</div>

					<div className="bg-primary/10 border border-primary/30 rounded-2xl p-4">
						<div className="flex items-start gap-3">
							<AlertCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
							<div className="text-foreground">
								<p className="font-medium mb-1">Информация об оплате</p>
								<p className="text-sm">Банк или платежный шлюз может удерживать комиссию. Не изменяйте сумму оплаты вручную!</p>
							</div>
						</div>
					</div>
				</div>

				<div className="text-center mt-8">
					<a href="#" className="text-primary hover:text-primary/80 text-sm underline transition-colors">
						Политика конфиденциальности
					</a>
				</div>
			</div>
		</div>
	);
}

export default PaymentForm;


