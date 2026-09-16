'use client';
import { useMemo, useState } from 'react';
import { Card } from '../ui';
import { kd, int } from '@/lib/compute';
import type { Order } from '@/lib/types';

type Col = keyof Pick<Order, 'id' | 'area' | 'date' | 'item' | 'qty' | 'kd' | 'pay' | 'status'>;
const COLS: { c: Col; label: string; right?: boolean }[] = [
  { c: 'id', label: 'Order ID' }, { c: 'area', label: 'Area' }, { c: 'date', label: 'Date' },
  { c: 'item', label: 'Item' }, { c: 'qty', label: 'Qty', right: true },
  { c: 'kd', label: 'Amount (KD)', right: true }, { c: 'pay', label: 'Payment' }, { c: 'status', label: 'Status' },
];
const PAGE = 15;

export default function DataTable({ rows }: { rows: Order[] }) {
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<{ c: Col; dir: 1 | -1 }>({ c: 'date', dir: 1 });
  const [page, setPage] = useState(0);

  const view = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const f = needle
      ? rows.filter((r) => [r.id, r.area, r.date, r.item, r.pay, r.status].join(' ').toLowerCase().includes(needle))
      : rows;
    return [...f].sort((a, b) => {
      const A = a[sort.c], B = b[sort.c];
      return (typeof A === 'number' && typeof B === 'number' ? A - B : String(A).localeCompare(String(B))) * sort.dir;
    });
  }, [rows, q, sort]);

  const pages = Math.max(1, Math.ceil(view.length / PAGE));
  const p = Math.min(page, pages - 1);
  const slice = view.slice(p * PAGE, p * PAGE + PAGE);

  return (
    <Card className="p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">Cleaned orders — search, sort and page through every row</h3>
        <div className="flex items-center gap-2">
          <input value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }}
                 placeholder="Search any field…" aria-label="Search orders"
                 className="w-56 rounded-lg border border-line bg-ink-2 px-3 py-2 text-sm placeholder:text-text-2 focus:border-accent focus:outline-none" />
          <a href="https://cdn.jsdelivr.net/gh/mubarakalsafran/Alsafran-cases@20b4fab/aifc-day8/data/kuwait-orders-clean.csv" target="_blank" rel="noopener"
             className="rounded-lg border border-accent/50 bg-accent/10 px-3 py-2 text-xs font-semibold text-accent hover:bg-accent/20">
            Download CSV
          </a>
        </div>
      </div>
      <div className="scrollx">
        <table className="w-full min-w-[820px] text-sm">
          <thead><tr className="border-b border-line text-[11px] uppercase tracking-wider text-text-2">
            {COLS.map((c) => (
              <th key={c.c} onClick={() => setSort((s) => ({ c: c.c, dir: s.c === c.c && s.dir === 1 ? -1 : 1 }))}
                  className={`cursor-pointer select-none py-2 pr-3 hover:text-accent ${c.right ? 'text-right' : 'text-left'}`}>
                {c.label}{sort.c === c.c && <span className="ml-1 text-accent">{sort.dir === 1 ? '▴' : '▾'}</span>}
              </th>
            ))}
          </tr></thead>
          <tbody>
            {slice.map((r) => (
              <tr key={r.id + r.date + r.item} className="border-b border-line/60 hover:bg-ink-2">
                <td className="py-2 pr-3 font-medium">{r.id}</td>
                <td className="py-2 pr-3">{r.area === 'Unknown'
                  ? <span className="text-accent-2">Unknown</span> : r.area}</td>
                <td className="py-2 pr-3">{r.dated ? r.date
                  : <span className="text-accent-2" title="Date was 31/09/2026 or 2027-09-03 — not usable">no usable date</span>}</td>
                <td className="py-2 pr-3">{r.item}</td>
                <td className="numeric py-2 pr-3 text-right">{int(r.qty)}</td>
                <td className="numeric py-2 pr-3 text-right">{kd(r.kd)}</td>
                <td className="py-2 pr-3 text-text-1">{r.pay}</td>
                <td className="py-2">{r.status}</td>
              </tr>
            ))}
            {!slice.length && <tr><td colSpan={8} className="py-8 text-center text-text-2">No rows match.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-text-2">
        <span>Showing <strong className="numeric text-text-1">{slice.length}</strong> of{' '}
          <strong className="numeric text-text-1">{view.length}</strong> rows in the current filter</span>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage(Math.max(0, p - 1))} disabled={p === 0}
                  className="rounded-lg border border-line px-3 py-1.5 font-semibold hover:border-accent hover:text-accent disabled:opacity-40">Previous</button>
          <span className="numeric">Page {p + 1} / {pages}</span>
          <button onClick={() => setPage(Math.min(pages - 1, p + 1))} disabled={p >= pages - 1}
                  className="rounded-lg border border-line px-3 py-1.5 font-semibold hover:border-accent hover:text-accent disabled:opacity-40">Next</button>
        </div>
      </div>
    </Card>
  );
}
