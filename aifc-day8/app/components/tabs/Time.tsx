'use client';
import { Card, ChartFrame, Kpi, Empty } from '../ui';
import { Lines, BarsGrouped, ACCENT, ACCENT2, ACCENT3 } from '../charts';
import { byDay, kd, kpis, shortDay, sum, DATE_MIN, DATE_MAX } from '@/lib/compute';
import type { Order, Filters } from '@/lib/types';

export default function Time({ rows, f, set }: {
  rows: Order[]; f: Filters; set: (p: Partial<Filters>) => void;
}) {
  const days = byDay(rows);
  const k = kpis(rows);
  const dated = rows.filter((r) => r.dated);
  const d = dated.filter((r) => r.status === 'Delivered');

  const w1 = d.filter((r) => r.date <= '2026-09-07');
  const w2 = d.filter((r) => r.date >= '2026-09-08');
  const r1 = sum(w1, (x) => x.kd), r2 = sum(w2, (x) => x.kd);
  const a1 = w1.length ? r1 / w1.length : 0, a2 = w2.length ? r2 / w2.length : 0;
  const ordersChg = w1.length ? ((w2.length - w1.length) / w1.length) * 100 : 0;
  const revChg = r1 ? ((r2 - r1) / r1) * 100 : 0;

  const peak = [...days].sort((a, b) => b.revenue - a.revenue)[0];
  const quiet = [...days].sort((a, b) => a.revenue - b.revenue)[0];

  const preset = (from: string, to: string, label: string) => (
    <button key={label} onClick={() => set({ from, to })}
      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
        f.from === from && f.to === to ? 'border-accent text-accent' : 'border-line text-text-1 hover:border-accent hover:text-accent'}`}>
      {label}
    </button>
  );

  if (!days.length) return <Card className="p-5"><Empty msg="No orders with a usable date in this selection." /></Card>;

  return (
    <div className="grid gap-4">
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[.14em] text-text-2">Quick range</span>
          {preset('', '', 'All 14 days')}
          {preset('2026-09-01', '2026-09-07', 'Week 1 · Sep 1–7')}
          {preset('2026-09-08', '2026-09-14', 'Week 2 · Sep 8–14')}
          <span className="ml-auto text-xs text-text-2">
            Data covers {DATE_MIN} to {DATE_MAX} — 14 trading days
          </span>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Days in view" value={days.length} sub="Days with at least one dated order" />
        <Kpi label="Delivered revenue" value={sum(d, (x) => x.kd)} decimals={3} unit="KD" tone="accent"
             sub={`From ${d.length} dated delivered orders`} />
        <Kpi label="Busiest day by revenue" value={peak.revenue} decimals={3} unit="KD" sub={`${peak.date} — ${peak.delivered} delivered`} />
        <Kpi label="Quietest day by revenue" value={quiet.revenue} decimals={3} unit="KD" sub={`${quiet.date} — ${quiet.delivered} delivered`} />
      </div>

      <ChartFrame
        finding={`Delivered revenue swings between ${kd(quiet.revenue)} and ${kd(peak.revenue)} KD a day with no upward trend`}
        yAxis="Delivered revenue per day in Kuwaiti dinar (KD) — axis starts at zero"
        xAxis={`Order date, ${days[0].date} to ${days[days.length - 1].date}`}
        basis={`Built from ${d.length} dated delivered orders across ${days.length} days`}
        excluded={`Cancelled and pending orders excluded.${k.undated ? ` ${k.undated} order(s) in view carry an unusable date and appear on no day.` : ''}`}
      >
        <Lines data={days.map((x) => ({ label: shortDay(x.date), 'Delivered revenue': x.revenue }))}
               series={[{ key: 'Delivered revenue', name: 'Delivered revenue (KD)', color: ACCENT }]} money />
      </ChartFrame>

      <ChartFrame
        finding="Order volume rises across the fortnight — delivered, pending and cancelled counts per day"
        yAxis="Orders per day (count) — axis starts at zero"
        xAxis={`Order date, ${days[0].date} to ${days[days.length - 1].date}`}
        basis={`Built from ${dated.length} dated orders in view, all statuses`}
        excluded={k.undated ? `${k.undated} order(s) with an unusable date.` : 'Nothing — every order in view has a usable date.'}
      >
        <Lines data={days.map((x) => ({ label: shortDay(x.date), Delivered: x.delivered, Pending: x.pending, Cancelled: x.cancelled }))}
               series={[
                 { key: 'Delivered', name: 'Delivered', color: ACCENT3 },
                 { key: 'Pending', name: 'Pending', color: ACCENT },
                 { key: 'Cancelled', name: 'Cancelled', color: ACCENT2 },
               ]} />
      </ChartFrame>

      {w1.length > 0 && w2.length > 0 && (
        <ChartFrame
          finding={`Orders rose ${ordersChg.toFixed(1)}% between the two weeks while revenue moved ${revChg.toFixed(1)}%`}
          subject="Two bars, one scale. The count grew; the money did not follow."
          yAxis="Count of delivered orders, and delivered revenue in KD — shown as two separate charts' worth of bars on one zero-based scale"
          xAxis="Week (Sep 1–7 against Sep 8–14)"
          basis={`Built from ${w1.length + w2.length} dated delivered orders`}
          excluded="Cancelled and pending orders excluded. Orders without a usable date excluded."
        >
          <BarsGrouped
            data={[
              { label: 'Delivered orders (count)', 'Sep 1–7': w1.length, 'Sep 8–14': w2.length },
              { label: 'Avg order value (KD)', 'Sep 1–7': Math.round(a1 * 1000) / 1000, 'Sep 8–14': Math.round(a2 * 1000) / 1000 },
            ]}
            series={[{ key: 'Sep 1–7', name: 'Sep 1–7', color: ACCENT }, { key: 'Sep 8–14', name: 'Sep 8–14', color: ACCENT2 }]}
          />
        </ChartFrame>
      )}

      <Card className="p-5">
        <h3 className="mb-3 text-sm font-semibold">Day table</h3>
        <div className="scrollx">
          <table className="w-full min-w-[620px] text-sm">
            <thead><tr className="border-b border-line text-left text-[11px] uppercase tracking-wider text-text-2">
              <th className="py-2 pr-3">Date</th><th className="py-2 pr-3 text-right">Orders</th>
              <th className="py-2 pr-3 text-right">Delivered</th><th className="py-2 pr-3 text-right">Pending</th>
              <th className="py-2 pr-3 text-right">Cancelled</th><th className="py-2 text-right">Delivered revenue (KD)</th>
            </tr></thead>
            <tbody>
              {days.map((x) => (
                <tr key={x.date} className="border-b border-line/60 hover:bg-ink-2">
                  <td className="py-2 pr-3 font-medium">{x.date}</td>
                  <td className="numeric py-2 pr-3 text-right">{x.orders}</td>
                  <td className="numeric py-2 pr-3 text-right">{x.delivered}</td>
                  <td className="numeric py-2 pr-3 text-right">{x.pending}</td>
                  <td className="numeric py-2 pr-3 text-right">{x.cancelled}</td>
                  <td className="numeric py-2 text-right">{kd(x.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
