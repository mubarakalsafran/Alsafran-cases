'use client';
import { Card, ChartFrame, Kpi, Tip, Empty } from '../ui';
import { BarsH, Lines, ACCENT, ACCENT2, ACCENT3 } from '../charts';
import { byDay, groupBy, kd, kpis, pct, shortDay } from '@/lib/compute';
import type { Order } from '@/lib/types';

export default function Overview({ rows, onArea }: { rows: Order[]; onArea: (a: string) => void }) {
  const k = kpis(rows);
  const d = rows.filter((r) => r.status === 'Delivered');
  const areas = groupBy(d.filter((r) => r.area !== 'Unknown'), 'area');
  const items = groupBy(d, 'item');
  const days = byDay(rows);
  const topArea = areas[0], topItem = items[0];
  const areaRev = areas.reduce((a, b) => a + b.revenue, 0) || 1;

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Top area by revenue" value={topArea?.revenue ?? 0} decimals={3} unit="KD"
             sub={topArea ? `${topArea.key} — ${pct((topArea.revenue / areaRev) * 100)} of area-attributed revenue` : 'No area-attributed orders in view'} />
        <Kpi label="Top item by revenue" value={topItem?.revenue ?? 0} decimals={3} unit="KD"
             sub={topItem ? `${topItem.key} — from ${topItem.orders} delivered orders` : 'No delivered orders in view'} />
        <Kpi label="Areas in view" value={k.areas} sub="Named areas. Rows with a blank area count as Unknown." />
        <Kpi label="Cancellation rate" value={k.cancelRate} decimals={1} unit="%" sub={`${k.cancelled} cancelled ÷ ${k.orders} orders in view`} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {areas.length ? (
          <ChartFrame
            finding={`${topArea.key} is the largest area at ${kd(topArea.revenue)} KD, ${pct((topArea.revenue / areaRev) * 100)} of area-attributed delivered revenue`}
            subject="Click a bar to filter the whole dashboard to that area."
            yAxis="Area (8 named areas, after standardising 29 raw spellings)"
            xAxis="Delivered revenue in Kuwaiti dinar (KD) — axis starts at zero"
            basis={`Built from ${d.filter((r) => r.area !== 'Unknown').length} delivered orders with a named area`}
            excluded={k.unknownArea
              ? `${k.unknownArea} order(s) in view have no area in the source file and appear in no bar, so ${kd(k.deliveredUnknownAreaRevenue)} KD of delivered revenue sits in the headline but not in this chart. Cancelled and pending orders are also excluded.`
              : 'Cancelled and pending orders are excluded — this is delivered revenue only.'}
          >
            <BarsH data={areas.map((a) => ({ key: a.key, value: a.revenue }))} money onPick={onArea} />
          </ChartFrame>
        ) : <Card className="p-5"><Empty msg="No delivered orders with a named area in this selection." /></Card>}

        {items.length ? (
          <ChartFrame
            finding={`${topItem.key} earns the most at ${kd(topItem.revenue)} KD from just ${topItem.orders} delivered orders`}
            yAxis="Menu item (10 items — the one column that arrived already consistent)"
            xAxis="Delivered revenue in Kuwaiti dinar (KD) — axis starts at zero"
            basis={`Built from ${d.length} delivered orders`}
            excluded="Cancelled and pending orders are excluded — this is delivered revenue only."
          >
            <BarsH data={items.map((i) => ({ key: i.key, value: i.revenue }))} money />
          </ChartFrame>
        ) : <Card className="p-5"><Empty msg="No delivered orders in this selection." /></Card>}
      </div>

      {days.length > 1 && (
        <ChartFrame
          finding="Orders climb through the second week while delivered revenue stays flat"
          subject="The gap between order count and revenue is the whole story — see The Story tab."
          yAxis="Orders per day (count) — one scale, no second axis"
          xAxis={`Order date, ${days[0].date} to ${days[days.length - 1].date}`}
          basis={`Built from ${rows.filter((r) => r.dated).length} orders in view that carry a usable date`}
          excluded={k.undated ? `${k.undated} order(s) in view have an unusable date and cannot be placed on a time axis.` : 'Nothing — every order in view has a usable date.'}
        >
          <Lines
            data={days.map((x) => ({ label: shortDay(x.date), Delivered: x.delivered, Pending: x.pending, Cancelled: x.cancelled }))}
            series={[
              { key: 'Delivered', name: 'Delivered', color: ACCENT3 },
              { key: 'Pending', name: 'Pending', color: ACCENT },
              { key: 'Cancelled', name: 'Cancelled', color: ACCENT2 },
            ]}
          />
        </ChartFrame>
      )}

      <Card className="p-5">
        <h3 className="text-sm font-semibold">How every number on this page is calculated<Tip>
          <strong>Delivered revenue</strong> = sum of <code>amount_kd</code> where status = Delivered.<br /><br />
          <strong>Average order value</strong> = delivered revenue ÷ delivered orders.<br /><br />
          <strong>Cancellation rate</strong> = cancelled orders ÷ all orders in view.<br /><br />
          <code>amount_kd</code> is the line total, not a unit price. Verified against the item price list:
          all 189 cleaned rows satisfy amount = unit price × quantity.
        </Tip></h3>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-text-1">
          Revenue means <strong>delivered</strong> revenue throughout this dashboard. Pending and cancelled
          orders are counted separately and never added to it, because neither has been paid.
        </p>
      </Card>
    </div>
  );
}
