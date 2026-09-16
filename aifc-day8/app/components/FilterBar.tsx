'use client';
import { AREAS, ITEMS, STATUSES, DATE_MIN, DATE_MAX, ALL } from '@/lib/compute';
import type { Filters } from '@/lib/types';

const sel =
  'w-full rounded-lg border border-line bg-ink-2 px-3 py-2 text-sm text-text-0 ' +
  'focus:border-accent focus:outline-none';
const lab = 'block text-[10px] font-semibold uppercase tracking-[.14em] text-text-2 mb-1.5';

export default function FilterBar({ f, set, dirty, reset, showing }: {
  f: Filters; set: (p: Partial<Filters>) => void; dirty: boolean; reset: () => void; showing: number;
}) {
  return (
    <div className="sticky top-0 z-40 border-b border-line bg-ink-0/92 backdrop-blur">
      <div className="mx-auto max-w-[1400px] px-4 py-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <div><label className={lab} htmlFor="f-area">Area</label>
            <select id="f-area" className={sel} value={f.area} onChange={(e) => set({ area: e.target.value })}>
              <option value={ALL}>All areas</option>
              {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select></div>
          <div><label className={lab} htmlFor="f-status">Status</label>
            <select id="f-status" className={sel} value={f.status} onChange={(e) => set({ status: e.target.value })}>
              <option value={ALL}>All statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select></div>
          <div><label className={lab} htmlFor="f-item">Item</label>
            <select id="f-item" className={sel} value={f.item} onChange={(e) => set({ item: e.target.value })}>
              <option value={ALL}>All items</option>
              {ITEMS.map((i) => <option key={i} value={i}>{i}</option>)}
            </select></div>
          <div><label className={lab} htmlFor="f-from">Date from</label>
            <input id="f-from" type="date" className={sel} min={DATE_MIN} max={DATE_MAX}
                   value={f.from} onChange={(e) => set({ from: e.target.value })} /></div>
          <div><label className={lab} htmlFor="f-to">Date to</label>
            <input id="f-to" type="date" className={sel} min={DATE_MIN} max={DATE_MAX}
                   value={f.to} onChange={(e) => set({ to: e.target.value })} /></div>
          <div className="flex items-end">
            <button type="button" onClick={reset} disabled={!dirty}
              className="w-full rounded-lg border border-line bg-ink-2 px-3 py-2 text-sm font-semibold text-text-1 transition hover:border-accent hover:text-accent disabled:opacity-40 disabled:hover:border-line disabled:hover:text-text-1">
              Reset filters
            </button>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-text-2">
          {dirty
            ? <>Filters active — showing <strong className="text-accent">{showing}</strong> of 189 cleaned orders. Every KPI and chart below reflects this selection.</>
            : <>Showing all <strong className="text-text-1">189</strong> cleaned orders.</>}
        </p>
      </div>
    </div>
  );
}
