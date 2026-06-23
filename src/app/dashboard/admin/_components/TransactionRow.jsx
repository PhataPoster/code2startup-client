"use client";

export default function TransactionRow({ payment }) {
  const status =
    payment.payment_status || payment.status || "completed";
  const style =
    status === "completed" || status === "paid"
      ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
      : status === "pending"
      ? "border-amber-400/30 bg-amber-500/10 text-amber-200"
      : "border-rose-400/30 bg-rose-500/10 text-rose-200";

  return (
    <tr className="border-t border-white/10 transition hover:bg-white/2">
      <td className="px-6 py-3 text-sm text-zinc-300">
        {payment.user_email || payment.email}
      </td>
      <td className="px-6 py-3 text-sm font-bold text-white">
        ${Number(payment.amount || 0).toFixed(2)}
      </td>
      <td className="px-6 py-3">
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${style}`}
        >
          {status}
        </span>
      </td>
      <td className="px-6 py-3 text-sm text-zinc-300">
        {payment.paid_at
          ? new Date(payment.paid_at).toLocaleString()
          : "—"}
      </td>
    </tr>
  );
}
