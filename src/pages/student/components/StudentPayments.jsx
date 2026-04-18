import { DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function StudentPayments({ payments, C }) {
  const formatDate = (date) => {
    if (!date) return "—";
    try {
      return new Date(date).toLocaleDateString("uz-UZ", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
    } catch {
      return "—";
    }
  };

  const totalPaid = payments.filter(p => p.type === 'credit' || p.dk === 'credit').reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalOwed = payments.filter(p => p.type === 'debit' || p.dk === 'debit').reduce((sum, p) => sum + (p.amount || 0), 0);
  const balance = totalPaid - totalOwed;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text }}>To'lovlar</h2>
        <p style={{ fontSize: 13, color: C.muted }}>{payments.length} ta yozuv</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "To'langan", value: `${totalPaid.toLocaleString()} so'm`, color: C.green, icon: ArrowUpRight, trend: "+12%" },
          { label: "Qarzdorlik", value: `${Math.abs(totalOwed).toLocaleString()} so'm`, color: C.red, icon: ArrowDownRight, trend: "+5%" },
          { label: "Balans", value: `${balance.toLocaleString()} so'm`, color: balance >= 0 ? C.blue : C.red, icon: DollarSign, trend: balance >= 0 ? "Ijobiy" : "Manfiy" },
        ].map(stat => (
          <div key={stat.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `${stat.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <stat.icon size={16} color={stat.color} />
              </div>
              <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: `${C.green}15`, color: C.green, fontWeight: 600 }}>{stat.trend}</span>
            </div>
            <p style={{ fontSize: 13, color: C.muted, marginBottom: 4 }}>{stat.label}</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: C.text }}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: C.text }}>So'nggi to'lovlar</p>
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          {payments.length === 0 ? (
            <div style={{ textAlign: "center", padding: 32 }}>
              <DollarSign size={32} color={C.muted} />
              <p style={{ fontSize: 14, color: C.muted, marginTop: 12 }}>To'lovlar yo'q</p>
            </div>
          ) : (
            payments.slice(0, 10).map(payment => (
              <div key={payment.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 8, background: C.card2 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: payment.type === 'credit' || payment.dk === 'credit' ? `${C.green}15` : `${C.red}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {payment.type === 'credit' || payment.dk === 'credit' ? (
                    <ArrowUpRight size={16} color={C.green} />
                  ) : (
                    <ArrowDownRight size={16} color={C.red} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{payment.comment || payment.description || "To'lov"}</p>
                  <p style={{ fontSize: 11, color: C.muted }}>{formatDate(payment.date)}</p>
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: payment.type === 'credit' || payment.dk === 'credit' ? C.green : C.red }}>
                  {payment.type === 'credit' || payment.dk === 'credit' ? '+' : '-'}{payment.amount?.toLocaleString()} so'm
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}