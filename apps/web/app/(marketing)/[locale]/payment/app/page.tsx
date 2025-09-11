import PaymentForm from "@marketing/payment/components/PaymentForm"
import { setRequestLocale } from "next-intl/server"

export default async function PaymentPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ email?: string; equipment_id?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);

  const initialEmail = sp.email ? decodeURIComponent(sp.email) : undefined;
  const initialEquipmentId = sp.equipment_id || undefined;

  return (
    <div className="container max-w-6xl pt-32 pb-24">
      <PaymentForm initialEmail={initialEmail} initialEquipmentId={initialEquipmentId} />
    </div>
  );
}
