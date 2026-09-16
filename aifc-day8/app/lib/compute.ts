import { ORDERS } from './data';
import type { Order, Filters } from './types';

export const ALL = 'All';

/** Money is always shown to 3 decimals: the Kuwaiti dinar divides into 1000 fils. */
export const kd = (n: number) =>
  n.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
export const pct = (n: number) => `${n.toFixed(1)}%`;
export const int = (n: number) => n.toLocaleString('en-US');

export const emptyFilters: Filters = { area: ALL, status: ALL, item: ALL, from: '', to: '' };

export function applyFilters(rows: Order[], f: Filters): Order[] {
  return rows.filter((r) => {
    if (f.area !== ALL && r.area !== f.area) return false;
    if (f.status !== ALL && r.status !== f.status) return false;
    if (f.item !== ALL && r.item !== f.item) return false;
    // date filter only constrains rows that HAVE a usable date; undated rows are
    // dropped by a date filter because they cannot be placed inside the window
    if (f.from || f.to) {
      if (!r.dated) return false;
      if (f.from && r.date < f.from) return false;
      if (f.to && r.date > f.to) return false;
    }
    return true;
  });
}

export const sum = (rows: Order[], pick: (r: Order) => number) =>
  Math.round(rows.reduce((a, r) => a + pick(r), 0) * 1000) / 1000;

export interface Kpis {
  orders: number; delivered: number; cancelled: number; pending: number;
  revenue: number; aov: number; cancelRate: number;
  areas: number; items: number;
  undated: number; unknownArea: number;
  deliveredUnknownAreaRevenue: number;
}
export function kpis(rows: Order[]): Kpis {
  const d = rows.filter((r) => r.status === 'Delivered');
  const revenue = sum(d, (r) => r.kd);
  const dUnknown = d.filter((r) => r.area === 'Unknown');
  return {
    orders: rows.length,
    delivered: d.length,
    cancelled: rows.filter((r) => r.status === 'Cancelled').length,
    pending: rows.filter((r) => r.status === 'Pending').length,
    revenue,
    aov: d.length ? Math.round((revenue / d.length) * 1000) / 1000 : 0,
    cancelRate: rows.length
      ? Math.round((rows.filter((r) => r.status === 'Cancelled').length / rows.length) * 1000) / 10
      : 0,
    areas: new Set(rows.filter((r) => r.area !== 'Unknown').map((r) => r.area)).size,
    items: new Set(rows.map((r) => r.item)).size,
    undated: rows.filter((r) => !r.dated).length,
    unknownArea: rows.filter((r) => r.area === 'Unknown').length,
    deliveredUnknownAreaRevenue: sum(dUnknown, (r) => r.kd),
  };
}

export interface GroupRow { key: string; orders: number; revenue: number; qty: number; aov: number }
export function groupBy(rows: Order[], key: keyof Order): GroupRow[] {
  const m = new Map<string, GroupRow>();
  for (const r of rows) {
    const k = String(r[key]);
    const g = m.get(k) ?? { key: k, orders: 0, revenue: 0, qty: 0, aov: 0 };
    g.orders += 1; g.revenue += r.kd; g.qty += r.qty;
    m.set(k, g);
  }
  return [...m.values()]
    .map((g) => ({ ...g, revenue: Math.round(g.revenue * 1000) / 1000,
                   aov: Math.round((g.revenue / g.orders) * 1000) / 1000 }))
    .sort((a, b) => b.revenue - a.revenue);
}

export interface DayRow {
  date: string; orders: number; delivered: number; cancelled: number; pending: number; revenue: number;
}
export function byDay(rows: Order[]): DayRow[] {
  const m = new Map<string, DayRow>();
  for (const r of rows) {
    if (!r.dated) continue;
    const g = m.get(r.date) ??
      { date: r.date, orders: 0, delivered: 0, cancelled: 0, pending: 0, revenue: 0 };
    g.orders += 1;
    if (r.status === 'Delivered') { g.delivered += 1; g.revenue += r.kd; }
    else if (r.status === 'Cancelled') g.cancelled += 1;
    else g.pending += 1;
    m.set(r.date, g);
  }
  return [...m.values()]
    .map((g) => ({ ...g, revenue: Math.round(g.revenue * 1000) / 1000 }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export const AREAS = [...new Set(ORDERS.map((o) => o.area))].sort();
export const ITEMS = [...new Set(ORDERS.map((o) => o.item))].sort();
export const STATUSES = ['Delivered', 'Pending', 'Cancelled'];
export const DATE_MIN = ORDERS.filter((o) => o.dated).map((o) => o.date).sort()[0];
export const DATE_MAX = ORDERS.filter((o) => o.dated).map((o) => o.date).sort().slice(-1)[0];
export const shortDay = (iso: string) => iso.slice(8) + ' Sep';
