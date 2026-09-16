'use client';
import { useEffect, useRef, useState } from 'react';

export const ACCENT = '#3987e5';
export const ACCENT2 = '#d95926';
export const ACCENT3 = '#199e70';
/** Status colours are the validated 3-slot set; every use also carries a text label,
 *  so status is never communicated by colour alone. */
export const STATUS_COLOR: Record<string, string> = {
  Delivered: ACCENT3, Pending: ACCENT, Cancelled: ACCENT2,
};

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`min-w-0 rounded-2xl border border-line bg-ink-1 shadow-[0_1px_0_rgba(255,255,255,.03)_inset,0_10px_30px_-12px_rgba(0,0,0,.6)] ${className}`}>
      {children}
    </div>
  );
}

/** Counts up when the value changes, so a filter change is visible, not silent. */
export function CountUp({ value, decimals = 0, className = '' }:
  { value: number; decimals?: number; className?: string }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const start = performance.now(), a = from.current, b = value, dur = 550;
    if (a === b) return;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      setShown(a + (b - a) * e);
      if (p < 1) raf = requestAnimationFrame(tick); else from.current = b;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return (
    <span className={`numeric ${className}`}>
      {shown.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
    </span>
  );
}

export function Kpi({ label, value, decimals = 0, unit, sub, tone = 'default' }: {
  label: string; value: number; decimals?: number; unit?: string; sub?: string;
  tone?: 'default' | 'accent';
}) {
  return (
    <Card className="p-5">
      <div className="text-[11px] uppercase tracking-[.14em] text-text-2 font-semibold">{label}</div>
      <div className={`mt-2 flex items-baseline gap-1.5 ${tone === 'accent' ? 'text-accent' : 'text-text-0'}`}>
        <span className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold leading-none tracking-tight">
          <CountUp value={value} decimals={decimals} />
        </span>
        {unit && <span className="text-sm font-semibold text-text-2">{unit}</span>}
      </div>
      {sub && <div className="mt-2 text-xs leading-snug text-text-1">{sub}</div>}
    </Card>
  );
}

/**
 * Every chart on this site is wrapped in this frame, which makes the five
 * honesty rules structural rather than a thing to remember:
 *   title = the finding · yAxis/xAxis = labelled with units · basis = row count · excluded = what was left out
 */
export function ChartFrame({ finding, subject, yAxis, xAxis, basis, excluded, children, right }: {
  finding: string; subject?: string; yAxis: string; xAxis: string;
  basis: string; excluded?: string; children: React.ReactNode; right?: React.ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[clamp(1rem,2vw,1.2rem)] font-semibold leading-snug text-text-0">{finding}</h3>
          {subject && <p className="mt-1 text-xs text-text-2">{subject}</p>}
        </div>
        {right}
      </div>
      <div className="mt-4">{children}</div>
      <dl className="mt-4 grid gap-1 border-t border-line pt-3 text-[11px] leading-relaxed text-text-2">
        <div className="flex gap-2"><dt className="shrink-0 font-semibold">Y axis</dt><dd>{yAxis}</dd></div>
        <div className="flex gap-2"><dt className="shrink-0 font-semibold">X axis</dt><dd>{xAxis}</dd></div>
        <div className="flex gap-2"><dt className="shrink-0 font-semibold">Built from</dt><dd>{basis}</dd></div>
        <div className="flex gap-2">
          <dt className="shrink-0 font-semibold">Excluded</dt>
          <dd>{excluded ?? 'Nothing — every row in the current filter is shown.'}</dd>
        </div>
      </dl>
    </Card>
  );
}

export function Tip({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-block align-middle">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open}
        className="ml-1.5 grid h-[18px] w-[18px] place-items-center rounded-full border border-line bg-ink-2 text-[10px] font-bold text-text-1 hover:border-accent hover:text-accent">
        i<span className="sr-only">How was this calculated?</span>
      </button>
      {open && (
        <span className="absolute left-0 top-6 z-50 block w-72 rounded-xl border border-line bg-ink-2 p-3 text-xs font-normal leading-relaxed text-text-1 shadow-2xl">
          {children}
        </span>
      )}
    </span>
  );
}

export function Empty({ msg }: { msg: string }) {
  return <div className="grid h-[240px] place-items-center rounded-xl border border-dashed border-line text-sm text-text-2">{msg}</div>;
}
