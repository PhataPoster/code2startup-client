"use client";

import TransactionRow from "../_components/TransactionRow";
import { useAdminData } from "../_components/admin-data";

export default function AdminTransactionsPage() {
  const { payments, loading, error, stats } = useAdminData();

  if (loading) return <p className="text-sm text-zinc-400">Loading transactions…</p>;
  if (error)
    return (
      <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
        {error}
      </p>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Total revenue:{" "}
            <span className="font-bold text-emerald-300">
              ${(stats.revenue / 100).toFixed(2)}
            </span>
          </p>
        </div>
        <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-semibold text-zinc-300">
          {payments.length} record{payments.length === 1 ? "" : "s"}
        </span>
      </div>

      {payments.length === 0 ? (
        <p className="rounded-lg border border-dashed border-white/10 p-6 text-center text-sm text-zinc-400">
          No transactions recorded yet.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-black/30 text-left text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Payer</th>
                <th className="px-4 py-3">Purpose</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {payments.map((p) => (
                <TransactionRow key={p._id || p.id} payment={p} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}