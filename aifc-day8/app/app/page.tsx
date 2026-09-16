'use client';
import { useMemo, useState } from 'react';
import FilterBar from '@/components/FilterBar';
import { Kpi, Card } from '@/components/ui';
import Overview from '@/components/tabs/Overview';
import Areas from '@/components/tabs/Areas';
import Items from '@/components/tabs/Items';
import Time from '@/components/tabs/Time';
import Quality from '@/components/tabs/Quality';
import Story from '@/components/tabs/Story';
import AskNext from '@/components/tabs/AskNext';
import DataTable from '@/components/tabs/DataTable';
import { ORDERS, METRICS } from '@/lib/data';
import { ALL, applyFilters, emptyFilters, kpis } from '@/lib/compute';
import type { Filters } from '@/lib/types';

const TABS = ['Overview', 'Areas', 'Items', 'Time', 'Quality', 'The Story', 'What I Would Ask Next'] as const;
type Tab = (typeof TABS)[number];

export default function Page() {
  const [tab, setTab] = useState<Tab>('Overview');
  const [f, setF] = useState<Filters>(emptyFilters);
  const set = (p: Partial<Filters>) => setF((s) => ({ ...s, ...p }));
  const reset = () => setF(emptyFilters);
  const dirty = JSON.stringify(f) !== JSON.stringify(emptyFilters);

  const rows = useMemo(() => applyFilters(ORDERS, f), [f]);
  const k = kpis(rows);
  const M = METRICS;
  const showFilters = !['Quality', 'The Story', 'What I Would Ask Next'].includes(tab);
  const heroFull = tab === 'Overview';

  return (
    <div className="min-h-screen">
      {/* ---------------------------------------------------------- hero -- */}
      <header className="relative overflow-hidden border-b border-line">
        <div aria-hidden className="pointer-events-none absolute inset-0"
             style={{ background:
               'radial-gradient(900px 380px at 12% -10%, rgba(57,135,229,.20), transparent 60%),' +
               'radial-gradient(700px 320px at 88% 0%, rgba(217,89,38,.12), transparent 60%)' }} />
        <div className={`relative mx-auto max-w-[1400px] px-4 ${heroFull ? "pb-8 pt-10 md:pt-14" : "pb-5 pt-6"}`}>
          <p className="text-[11px] font-semibold uppercase tracking-[.22em] text-accent">
            AIFC · Day 8 · Clean it · Tell it · Show it
          </p>
          <h1 className={`mt-3 font-bold leading-[0.95] tracking-tighter ${heroFull ? "text-[clamp(2.25rem,7vw,4.5rem)]" : "text-[clamp(1.5rem,3.5vw,2.25rem)]"}`}>
            {heroFull ? <>KUWAIT ORDERS<br /><span className="text-accent">DATA LAB</span></> : <>KUWAIT ORDERS <span className="text-accent">DATA LAB</span></>}
          </h1>
          <p className={`max-w-[52ch] text-text-1 ${heroFull ? 'mt-4 text-[clamp(1rem,2.2vw,1.25rem)]' : 'mt-1 text-sm'}`}>
            From Messy Data to Meaningful Decisions
          </p>
          {heroFull && (
          <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-text-2">
            {M.raw_rows} raw rows audited before a single value was changed, cleaned to {M.clean_rows},
            with all {M.excluded_rows} exclusions named. Every figure here traces to a row in the source file.
          </p>)}

          {heroFull && (<>
          <p className="mt-8 text-[10px] font-semibold uppercase tracking-[.16em] text-text-2">
            The whole cleaned dataset — these six do not move when you filter
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <Kpi label="Total orders" value={M.clean_rows} sub={`${M.raw_rows} raw − ${M.excluded_rows} excluded`} />
            <Kpi label="Delivered orders" value={M.delivered_orders} sub={`${M.pending_orders} pending · ${M.cancelled_orders} cancelled`} />
            <Kpi label="Delivered revenue" value={M.delivered_revenue_kd} decimals={3} unit="KD" tone="accent"
                 sub={`Across ${M.trading_days} trading days`} />
            <Kpi label="Average order value" value={M.avg_order_value_kd} decimals={3} unit="KD"
                 sub={`${M.delivered_revenue_kd.toFixed(3)} ÷ ${M.delivered_orders} orders`} />
            <Kpi label="Areas covered" value={M.areas_covered} sub="Standardised from 29 raw spellings" />
            <Kpi label="Data quality issues" value={13} sub="Documented decisions, every one with a reason" />
          </div></>)}
        </div>
      </header>

      {/* ---------------------------------------------------------- tabs -- */}
      <nav className="sticky top-0 z-50 border-b border-line bg-ink-0/92 backdrop-blur" aria-label="Sections">
        <div className="scrollx mx-auto flex max-w-[1400px] gap-1 px-4">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} aria-current={tab === t ? 'page' : undefined}
              className={`whitespace-nowrap border-b-2 px-4 py-3.5 text-sm font-semibold transition ${
                tab === t ? 'border-accent text-accent' : 'border-transparent text-text-2 hover:text-text-0'}`}>
              {t}
            </button>
          ))}
        </div>
      </nav>

      {showFilters && <FilterBar f={f} set={set} dirty={dirty} reset={reset} showing={rows.length} />}

      {/* live KPI strip — visibly animates whenever a filter changes */}
      {showFilters && (
        <div className="mx-auto max-w-[1400px] px-4 pt-5">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[.16em] text-accent">
            Current filter — these four count up whenever you change a control above
          </p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi label="Orders in view" value={k.orders} sub="Updates live with the filters above" />
            <Kpi label="Delivered in view" value={k.delivered} sub={`${k.cancelled} cancelled · ${k.pending} pending`} />
            <Kpi label="Revenue in view" value={k.revenue} decimals={3} unit="KD" tone="accent" sub="Delivered orders only" />
            <Kpi label="Avg order in view" value={k.aov} decimals={3} unit="KD" sub="Delivered revenue ÷ delivered orders" />
          </div>
        </div>
      )}

      <main className="mx-auto max-w-[1400px] px-4 py-6">
        {rows.length === 0 && showFilters ? (
          <Card className="p-10 text-center">
            <p className="text-lg font-semibold">No orders match these filters.</p>
            <button onClick={reset} className="mt-4 rounded-lg border border-accent/50 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent">Reset filters</button>
          </Card>
        ) : (
          <div key={tab} className="rise grid gap-4">
            {tab === 'Overview' && <><Overview rows={rows} onArea={(a) => set({ area: a })} /><DataTable rows={rows} /></>}
            {tab === 'Areas' && <Areas rows={rows} picked={f.area} onArea={(a) => set({ area: a })} />}
            {tab === 'Items' && <Items rows={rows} picked={f.item} onItem={(i) => set({ item: i })} />}
            {tab === 'Time' && <Time rows={rows} f={f} set={set} />}
            {tab === 'Quality' && <Quality />}
            {tab === 'The Story' && <Story />}
            {tab === 'What I Would Ask Next' && <AskNext />}
          </div>
        )}
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto max-w-[1400px] px-4 py-8">
          <p className="text-sm font-semibold">AIFC · Day 8</p>
          <p className="mt-1 text-sm text-text-1">Clean It · Tell It · Show It</p>
          <p className="mt-3 max-w-[70ch] text-xs leading-relaxed text-text-2">
            Data analyzed from the provided Kuwait Orders practice dataset (kuwait-orders-dirty.csv,
            {' '}{M.raw_rows} rows). The dataset is invented for the exercise — every name, email and phone
            number in it is fictional. The original file was preserved unchanged and is downloadable from the
            Quality tab alongside the cleaned version.
            {' '}{M.excluded_rows} rows were excluded: 5 duplicates and 1 row whose amount and quantity
            contradicted each other.
          </p>
        </div>
      </footer>
    </div>
  );
}
