'use client';
import { Card } from '../ui';
import { BarsGrouped, ACCENT, ACCENT2 } from '../charts';
import { METRICS } from '@/lib/data';
import { kd } from '@/lib/compute';

const M = METRICS, W = M.weeks, X = M.mix;

function Beat({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 border-t border-line pt-8 md:grid-cols-[88px_1fr]">
      <div className="text-[clamp(2.5rem,6vw,3.75rem)] font-bold leading-none tracking-tighter text-accent/25">{n}</div>
      <div>
        <h3 className="text-[clamp(1.1rem,2.6vw,1.6rem)] font-bold tracking-tight">{title}</h3>
        <div className="mt-3 max-w-[68ch] space-y-3 text-[clamp(.95rem,1.6vw,1.05rem)] leading-relaxed text-text-1">
          {children}
        </div>
      </div>
    </section>
  );
}
const N = ({ children }: { children: React.ReactNode }) =>
  <strong className="numeric font-semibold text-text-0">{children}</strong>;

export default function Story() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="rounded-2xl border border-line bg-gradient-to-b from-ink-1 to-ink-0 p-6 md:p-10">
        <p className="text-[11px] font-semibold uppercase tracking-[.2em] text-accent">The five beats · under one minute</p>
        <h2 className="mt-3 text-[clamp(1.75rem,5vw,3rem)] font-bold leading-[1.05] tracking-tight">
          The kitchen got <span className="text-accent-2">51.7% busier</span> and earned{' '}
          <span className="text-accent-2">nothing extra</span> for it.
        </h2>
        <p className="mt-4 max-w-[60ch] text-lg leading-relaxed text-text-1">
          Two weeks of orders, 189 of them once cleaned. The second week took half as many orders again
          as the first and brought in <N>0.500</N> KD more. Half a dinar.
        </p>
      </div>

      <div className="mt-8 grid gap-8">
        <Beat n="01" title="The question worth asking">
          <p>
            Orders are rising. Is the business actually growing — or just getting busier?
          </p>
          <p className="text-text-2">
            It matters because the two need opposite responses. Growth means hire and buy more stock.
            Busier-at-the-same-money means the mix has shifted underneath you and margin is leaking.
          </p>
        </Beat>

        <Beat n="02" title="What I found">
          <p>
            Busier, not bigger. Delivered orders went from <N>{W.week1.orders}</N> in Sep 1–7 to{' '}
            <N>{W.week2.orders}</N> in Sep 8–14 — up <N>{W.orders_change_pct}%</N> — while delivered
            revenue moved from <N>{kd(W.week1.revenue_kd)}</N> KD to <N>{kd(W.week2.revenue_kd)}</N> KD,
            a change of <N>{W.revenue_change_pct}%</N>.
          </p>
          <p>
            The average order fell from <N>{kd(W.week1.aov_kd)}</N> KD to <N>{kd(W.week2.aov_kd)}</N> KD —
            down <N>{Math.abs(W.aov_change_pct)}%</N>. Every extra order in week two was a cheaper one.
          </p>
        </Beat>

        <Beat n="03" title="The evidence">
          <p>
            Across the full cleaned fortnight, <N>{M.delivered_orders}</N> delivered orders produced{' '}
            <N>{kd(M.delivered_revenue_kd)}</N> KD, an average of <N>{kd(M.avg_order_value_kd)}</N> KD per order
            over <N>{M.trading_days}</N> trading days in <N>{M.areas_covered}</N> areas.
          </p>
          <p>
            The mix explains the flatness. Two premium dishes — {X.premium_items.join(' and ')} — are{' '}
            <N>{X.premium_order_share_pct}%</N> of delivered orders but <N>{X.premium_revenue_share_pct}%</N>{' '}
            of delivered revenue (<N>{kd(X.premium_revenue_kd)}</N> KD). The five cheapest items are{' '}
            <N>{X.cheap_order_share_pct}%</N> of orders and only <N>{X.cheap_revenue_share_pct}%</N> of
            revenue (<N>{kd(X.cheap_revenue_kd)}</N> KD).
          </p>
          <p>
            Between the weeks, premium orders <em>fell</em> from <N>{W.week1.premium_orders}</N> to{' '}
            <N>{W.week2.premium_orders}</N> — worth <N>{kd(W.week1.premium_revenue_kd)}</N> KD down to{' '}
            <N>{kd(W.week2.premium_revenue_kd)}</N> KD — while cheap orders doubled from{' '}
            <N>{W.week1.cheap_orders}</N> to <N>{W.week2.cheap_orders}</N> and added only{' '}
            <N>{kd(W.week2.cheap_revenue_kd - W.week1.cheap_revenue_kd)}</N> KD. More work, same money.
          </p>
          <div className="not-prose mt-5">
            <Card className="p-4">
              <p className="mb-2 text-xs font-semibold text-text-2">
                Delivered orders and average order value, week against week — both axes start at zero.
                Built from {W.week1.orders + W.week2.orders} dated delivered orders. Cancelled, pending and
                undated orders excluded.
              </p>
              <BarsGrouped
                data={[
                  { label: 'Delivered orders (count)', 'Sep 1–7': W.week1.orders, 'Sep 8–14': W.week2.orders },
                  { label: 'Avg order value (KD)', 'Sep 1–7': W.week1.aov_kd, 'Sep 8–14': W.week2.aov_kd },
                ]}
                series={[{ key: 'Sep 1–7', name: 'Sep 1–7', color: ACCENT },
                         { key: 'Sep 8–14', name: 'Sep 8–14', color: ACCENT2 }]}
                height={260}
              />
            </Card>
          </div>
        </Beat>

        <Beat n="04" title="What surprised me">
          <p>
            The most expensive thing on the menu is also the most reliable. Mixed grill platter, at{' '}
            <N>7.250</N> KD a unit, was ordered <N>23</N> times and cancelled{' '}
            <N>0</N> times — the only item in the file with a clean sheet. It carries{' '}
            <N>{kd(M.by_item_delivered['Mixed grill platter'].revenue)}</N> KD, nearly a third of all
            delivered revenue.
          </p>
          <p>
            Meanwhile the cheapest things cancel most: falafel wrap cancels{' '}
            <N>{M.cancellation_by_item['Falafel wrap'].rate_pct}%</N> of the time
            ({M.cancellation_by_item['Falafel wrap'].cancelled} of {M.cancellation_by_item['Falafel wrap'].orders}).
            I expected expensive orders to be the fragile ones. The file says the opposite.
          </p>
        </Beat>

        <Beat n="05" title="What I would do next week">
          <p>
            Put the two premium dishes back in front of customers — top of the menu, bundled, or as the
            default suggestion at checkout — and hold week-two order volume while doing it.
          </p>
          <p className="text-text-2">
            The arithmetic: week two took <N>{W.week2.orders}</N> delivered orders. Moving just{' '}
            <N>10</N> of them from the cheap group (avg{' '}
            <N>{kd(X.cheap_revenue_kd / X.cheap_orders)}</N> KD) to the premium group (avg{' '}
            <N>{kd(X.premium_revenue_kd / X.premium_orders)}</N> KD) is about{' '}
            <N>{kd(10 * (X.premium_revenue_kd / X.premium_orders - X.cheap_revenue_kd / X.cheap_orders))}</N>{' '}
            KD — more than the entire week-on-week revenue change of {kd(W.revenue_change_kd)} KD, from ten orders.
          </p>
        </Beat>
      </div>

      <p className="mt-10 border-t border-line pt-5 text-xs leading-relaxed text-text-2">
        Every number on this page comes from the cleaned dataset of {M.clean_rows} orders, traceable to a row in
        kuwait-orders-dirty.csv. Revenue means delivered revenue. {M.excluded_rows} rows were excluded before any
        of this was calculated — listed line by line on the Quality tab.
      </p>
    </div>
  );
}
