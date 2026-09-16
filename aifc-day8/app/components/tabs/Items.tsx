'use client';
import { useState } from 'react';
import { Card, ChartFrame, Empty } from '../ui';
import { BarsH } from '../charts';
import { groupBy, kd, int, pct, ALL } from '@/lib/compute';
import { METRICS } from '@/lib/data';
import type { Order } from '@/lib/types';

type Col = 'key' | 'orders' | 'qty' | 'revenue' | 'aov' | 'unit';
export default function Items({ rows, picked, onItem }: {
  rows: Order[]; picked: string; onItem: (i: string) => void;
}) {
  const [sort, setSort] = useState<{ c: Col; dir: 1 | -1 }>({ c: 'revenue', dir: -1 });
  const d = rows.filter((r) => r.status === 'Delivered');
  const g = groupBy(d, 'item').map((x) => ({ ...x, unit: METRICS.price_list_kd[x.key] }));
  const total = g.reduce((a, b) => a + b.revenue, 0) || 1;
  const byOrders = [...g].sort((a, b) => b.orders - a.orders);
  const byQty = [...g].sort((a, b) => b.qty - a.qty);

  const sorted = [...g].sort((a, b) => {
    const A = a[sort.c], B = b[sort.c];
    return (typeof A === 'string' ? String(A).localeCompare(String(B)) : Number(A) - Number(B)) * sort.dir;
  });
  const th = (c: Col, label: string, right = true) => (
    <th className={`py-2 pr-3 ${right ? 'text-right' : 'text-left'} cursor-pointer select-none hover:text-accent`}
        onClick={() => setSort((s) => ({ c, dir: s.c === c && s.dir === -1 ? 1 : -1 }))}>
      {label}{sort.c === c && <span className="ml-1 text-accent">{sort.dir === -1 ? '▾' : '▴'}</span>}
    </th>
  );

  if (!g.length) return <Card className="p-5"><Empty msg="No delivered orders in this selection." /></Card>;
  const top = g[0], mostOrdered = byOrders[0];

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 xl:grid-cols-2">
        <ChartFrame
          finding={`${top.key} is ${pct((top.revenue / total) * 100)} of delivered revenue — ${kd(top.revenue)} KD from ${top.orders} orders`}
          subject="Click a bar to filter the dashboard to that item."
          yAxis="Menu item"
          xAxis="Delivered revenue in Kuwaiti dinar (KD) — axis starts at zero"
          basis={`Built from ${d.length} delivered orders`}
          excluded="Cancelled and pending orders excluded — delivered revenue only."
        >
          <BarsH data={g.map((x) => ({ key: x.key, value: x.revenue }))} money onPick={onItem}
                 active={picked !== ALL ? picked : null} />
        </ChartFrame>

        <ChartFrame
          finding={`${mostOrdered.key} is ordered most often (${mostOrdered.orders} delivered orders) — popularity and revenue are not the same ranking`}
          yAxis="Menu item"
          xAxis="Delivered orders (count) — axis starts at zero"
          basis={`Built from ${d.length} delivered orders`}
          excluded="Cancelled and pending orders excluded."
        >
          <BarsH data={byOrders.map((x) => ({ key: x.key, value: x.orders }))} onPick={onItem}
                 active={picked !== ALL ? picked : null} />
        </ChartFrame>

        <ChartFrame
          finding={`${byQty[0].key} moves the most units (${byQty[0].qty}) yet earns ${pct((byQty[0].revenue / total) * 100)} of revenue`}
          yAxis="Menu item"
          xAxis="Units sold (sum of quantity) — axis starts at zero"
          basis={`Built from ${d.length} delivered orders`}
          excluded="Cancelled and pending orders excluded."
        >
          <BarsH data={byQty.map((x) => ({ key: x.key, value: x.qty }))} onPick={onItem}
                 active={picked !== ALL ? picked : null} />
        </ChartFrame>

        <ChartFrame
          finding="Unit price is fixed per item across the whole file — which is how impossible rows were caught"
          subject="Every one of the 189 cleaned rows satisfies amount_kd = unit price × quantity."
          yAxis="Menu item"
          xAxis="Unit price in Kuwaiti dinar (KD) — axis starts at zero"
          basis="Built from all 189 cleaned orders, every status"
          excluded="Nothing. The price list is derived from the file itself, not supplied from outside."
        >
          <BarsH data={Object.entries(METRICS.price_list_kd).sort((a, b) => b[1] - a[1])
                    .map(([k, v]) => ({ key: k, value: v }))} money onPick={onItem}
                 active={picked !== ALL ? picked : null} />
        </ChartFrame>
      </div>

      <Card className="p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">Item table — click any column header to sort</h3>
          {picked !== ALL && (
            <button onClick={() => onItem(ALL)} className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-text-1 hover:border-accent hover:text-accent">
              Clear item filter ({picked})
            </button>
          )}
        </div>
        <div className="scrollx">
          <table className="w-full min-w-[720px] text-sm">
            <thead><tr className="border-b border-line text-[11px] uppercase tracking-wider text-text-2">
              {th('key', 'Item', false)}{th('unit', 'Unit price (KD)')}{th('orders', 'Delivered orders')}
              {th('qty', 'Units')}{th('revenue', 'Revenue (KD)')}{th('aov', 'Avg order (KD)')}
              <th className="py-2 text-right">Share</th>
            </tr></thead>
            <tbody>
              {sorted.map((x) => (
                <tr key={x.key} className={`cursor-pointer border-b border-line/60 hover:bg-ink-2 ${picked === x.key ? 'bg-ink-2' : ''}`}
                    onClick={() => onItem(x.key)}>
                  <td className="py-2 pr-3 font-medium">{x.key}</td>
                  <td className="numeric py-2 pr-3 text-right">{kd(x.unit)}</td>
                  <td className="numeric py-2 pr-3 text-right">{int(x.orders)}</td>
                  <td className="numeric py-2 pr-3 text-right">{int(x.qty)}</td>
                  <td className="numeric py-2 pr-3 text-right">{kd(x.revenue)}</td>
                  <td className="numeric py-2 pr-3 text-right">{kd(x.aov)}</td>
                  <td className="numeric py-2 text-right">{pct((x.revenue / total) * 100)}</td>
                </tr>
              ))}
              <tr className="font-semibold">
                <td className="py-2 pr-3">Total</td><td /><td className="numeric py-2 pr-3 text-right">{int(d.length)}</td>
                <td className="numeric py-2 pr-3 text-right">{int(g.reduce((a, b) => a + b.qty, 0))}</td>
                <td className="numeric py-2 pr-3 text-right">{kd(total)}</td><td /><td className="numeric py-2 text-right">100.0%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-text-2">
          Item revenue reconciles exactly to the headline: every delivered order has an item, so these rows
          sum to the full delivered revenue with no gap.
        </p>
      </Card>
    </div>
  );
}
