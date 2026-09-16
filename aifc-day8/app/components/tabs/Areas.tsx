'use client';
import { Card, ChartFrame, Kpi, Empty } from '../ui';
import { BarsH, ACCENT, ACCENT2 } from '../charts';
import { groupBy, kd, kpis, pct, int, ALL } from '@/lib/compute';
import type { Order } from '@/lib/types';

export default function Areas({ rows, picked, onArea }: {
  rows: Order[]; picked: string; onArea: (a: string) => void;
}) {
  const named = rows.filter((r) => r.area !== 'Unknown');
  const d = named.filter((r) => r.status === 'Delivered');
  const rev = groupBy(d, 'area');
  const total = rev.reduce((a, b) => a + b.revenue, 0) || 1;
  // sorted by its own measure — a bar chart whose bars are ordered by a different
  // column reads as broken, and the title would name the wrong leader
  const ordersByArea = [...groupBy(named, 'area')].sort((a, b) => b.orders - a.orders);
  const k = kpis(rows);

  // delivery success = delivered ÷ all orders in that area
  const success = ordersByArea.map((g) => {
    const all = named.filter((r) => r.area === g.key);
    return { key: g.key, value: Math.round((all.filter((r) => r.status === 'Delivered').length / all.length) * 1000) / 10 };
  }).sort((a, b) => b.value - a.value);

  const sel = picked !== ALL ? rows.filter((r) => r.area === picked) : null;
  const selK = sel ? kpis(sel) : null;
  const best = rev[0], worst = rev[rev.length - 1];
  const aov = [...rev].sort((a, b) => b.aov - a.aov);

  return (
    <div className="grid gap-4">
      {selK && sel && (
        <Card className="p-5 rise">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h3 className="text-xl font-bold">{picked}<span className="ml-2 text-sm font-normal text-text-2">selected — every figure below is this area only</span></h3>
            <button onClick={() => onArea(ALL)} className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-text-1 hover:border-accent hover:text-accent">Clear area</button>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3 xl:grid-cols-6">
            <Kpi label="Orders" value={selK.orders} />
            <Kpi label="Delivered" value={selK.delivered} />
            <Kpi label="Cancelled" value={selK.cancelled} />
            <Kpi label="Revenue" value={selK.revenue} decimals={3} unit="KD" tone="accent" />
            <Kpi label="Avg order value" value={selK.aov} decimals={3} unit="KD" />
            <Kpi label="Items ordered" value={selK.items} />
          </div>
        </Card>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        {rev.length ? (
          <ChartFrame
            finding={`${best.key} leads on revenue with ${kd(best.revenue)} KD — ${pct((best.revenue / total) * 100)} of area-attributed delivered revenue`}
            subject="Click any bar to filter the dashboard to that area."
            yAxis="Area (8 named areas, standardised from 29 raw spellings)"
            xAxis="Delivered revenue in Kuwaiti dinar (KD) — axis starts at zero"
            basis={`Built from ${d.length} delivered orders with a named area`}
            excluded={`${k.unknownArea} order(s) in view have a blank area and appear in no bar (${kd(k.deliveredUnknownAreaRevenue)} KD of delivered revenue). Cancelled and pending orders excluded.`}
          >
            <BarsH data={rev.map((r) => ({ key: r.key, value: r.revenue }))} money onPick={onArea}
                   active={picked !== ALL ? picked : null} />
          </ChartFrame>
        ) : <Card className="p-5"><Empty msg="No delivered orders with a named area." /></Card>}

        {ordersByArea.length ? (
          <ChartFrame
            finding={`${ordersByArea[0].key} takes the most orders (${ordersByArea[0].orders}) but ${best.key} takes the most money — volume and value rank differently`}
            yAxis="Area"
            xAxis="Orders (count, all statuses) — axis starts at zero"
            basis={`Built from ${named.length} orders with a named area, all statuses`}
            excluded={`${k.unknownArea} order(s) with a blank area.`}
          >
            <BarsH data={ordersByArea.map((r) => ({ key: r.key, value: r.orders }))} onPick={onArea}
                   active={picked !== ALL ? picked : null} />
          </ChartFrame>
        ) : null}

        {aov.length ? (
          <ChartFrame
            finding={`${aov[0].key} has the highest average order at ${kd(aov[0].aov)} KD — ${(aov[0].aov / (aov[aov.length - 1].aov || 1)).toFixed(1)}× ${aov[aov.length - 1].key}`}
            yAxis="Area"
            xAxis="Average delivered order value in KD — axis starts at zero"
            basis={`Built from ${d.length} delivered orders with a named area`}
            excluded="Cancelled and pending orders excluded, and orders with a blank area."
          >
            <BarsH data={aov.map((r) => ({ key: r.key, value: r.aov }))} money onPick={onArea}
                   active={picked !== ALL ? picked : null} />
          </ChartFrame>
        ) : null}

        {success.length ? (
          <ChartFrame
            finding={`Delivery success ranges from ${success[success.length - 1].value.toFixed(1)}% in ${success[success.length - 1].key} to ${success[0].value.toFixed(1)}% in ${success[0].key}`}
            yAxis="Area"
            xAxis="Share of that area's orders that were delivered (%) — axis starts at zero"
            basis={`Built from ${named.length} orders with a named area, all statuses`}
            excluded={`${k.unknownArea} order(s) with a blank area. The remainder of each bar is pending or cancelled.`}
          >
            <BarsH data={success} onPick={onArea} active={picked !== ALL ? picked : null}
                   colorFor={(key) => (success.find((s) => s.key === key)!.value < 80 ? ACCENT2 : ACCENT)} />
          </ChartFrame>
        ) : null}
      </div>

      <Card className="p-5">
        <h3 className="mb-3 text-sm font-semibold">Area table — delivered orders only</h3>
        <div className="scrollx">
          <table className="w-full min-w-[640px] text-sm">
            <thead><tr className="border-b border-line text-left text-[11px] uppercase tracking-wider text-text-2">
              <th className="py-2 pr-3">Area</th><th className="py-2 pr-3 text-right">Delivered orders</th>
              <th className="py-2 pr-3 text-right">Revenue (KD)</th><th className="py-2 pr-3 text-right">Avg order (KD)</th>
              <th className="py-2 pr-3 text-right">Units</th><th className="py-2 text-right">Share of revenue</th>
            </tr></thead>
            <tbody>
              {rev.map((r) => (
                <tr key={r.key} className="cursor-pointer border-b border-line/60 hover:bg-ink-2" onClick={() => onArea(r.key)}>
                  <td className="py-2 pr-3 font-medium">{r.key}</td>
                  <td className="numeric py-2 pr-3 text-right">{int(r.orders)}</td>
                  <td className="numeric py-2 pr-3 text-right">{kd(r.revenue)}</td>
                  <td className="numeric py-2 pr-3 text-right">{kd(r.aov)}</td>
                  <td className="numeric py-2 pr-3 text-right">{int(r.qty)}</td>
                  <td className="numeric py-2 text-right">{pct((r.revenue / total) * 100)}</td>
                </tr>
              ))}
              <tr className="font-semibold">
                <td className="py-2 pr-3">Total, named areas</td>
                <td className="numeric py-2 pr-3 text-right">{int(d.length)}</td>
                <td className="numeric py-2 pr-3 text-right">{kd(total)}</td>
                <td className="py-2 pr-3" /><td className="py-2 pr-3" /><td className="numeric py-2 text-right">100.0%</td>
              </tr>
            </tbody>
          </table>
        </div>
        {k.unknownArea > 0 && (
          <p className="mt-3 rounded-lg border border-line bg-ink-2 p-3 text-xs leading-relaxed text-text-1">
            <strong className="text-accent-2">Why this table totals less than the headline.</strong>{' '}
            {k.unknownArea} order(s) in the current view have no area in the source file. They are real orders
            with real revenue, so they stay in the headline total, but they cannot be placed in any area row —
            a gap of <strong className="numeric">{kd(k.deliveredUnknownAreaRevenue)} KD</strong>. Named here rather than dropped quietly.
          </p>
        )}
      </Card>
    </div>
  );
}
