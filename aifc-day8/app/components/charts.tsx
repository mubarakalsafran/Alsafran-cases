'use client';
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts';
import { ACCENT, ACCENT2, ACCENT3 } from './ui';
import { kd, int } from '@/lib/compute';

const GRID = '#232B36';
const AXIS = { fill: '#6C7886', fontSize: 11 };

function box(): React.CSSProperties {
  return { background: '#1C232C', border: '1px solid #232B36', borderRadius: 12,
           padding: '8px 10px', fontSize: 12, color: '#F2F5F9' };
}
type TipRow = { name?: string; value?: number | string; color?: string; dataKey?: string | number };
function Tt({ active, payload, label, money }:
  { active?: boolean; payload?: TipRow[]; label?: string | number; money?: boolean }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={box()}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ width: 9, height: 9, borderRadius: 3, background: p.color, display: 'inline-block' }} />
          <span style={{ color: '#A7B2C0' }}>{p.name}</span>
          <strong className="numeric">
            {money ? `${kd(Number(p.value))} KD` : int(Number(p.value))}
          </strong>
        </div>
      ))}
    </div>
  );
}

/** Horizontal bars. Value axis always starts at zero — no exceptions used anywhere here. */
export function BarsH({ data, money = false, height = 320, onPick, active, colorFor }: {
  data: { key: string; value: number }[]; money?: boolean; height?: number;
  onPick?: (k: string) => void; active?: string | null;
  colorFor?: (k: string) => string;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 56, bottom: 4, left: 8 }}>
        <CartesianGrid horizontal={false} stroke={GRID} />
        <XAxis type="number" domain={[0, 'dataMax']} allowDecimals tick={AXIS}
               stroke={GRID} tickFormatter={(v) => (money ? kd(v) : int(v))} />
        <YAxis type="category" dataKey="key" width={132} tick={AXIS} stroke={GRID} />
        <Tooltip cursor={{ fill: '#ffffff08' }}
                 content={<Tt money={money} />} />
        <Bar dataKey="value" name={money ? 'Revenue (KD)' : 'Orders'} radius={[0, 4, 4, 0]}
             isAnimationActive
             onClick={(_, index) => { const k = data[index]?.key; if (k) onPick?.(k); }}
             cursor={onPick ? 'pointer' : 'default'}
             label={{ position: 'right', fill: '#A7B2C0', fontSize: 11,
                      formatter: (v: unknown) => (money ? kd(Number(v)) : int(Number(v))) }}>
          {data.map((d) => (
            <Cell key={d.key}
                  fill={colorFor ? colorFor(d.key) : ACCENT}
                  fillOpacity={active && active !== d.key ? 0.32 : 1} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Time is always a line. Value axis starts at zero. */
export function Lines({ data, series, money = false, height = 300 }: {
  data: Record<string, string | number>[];
  series: { key: string; name: string; color: string }[];
  money?: boolean; height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 4, left: 4 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="label" tick={AXIS} stroke={GRID} />
        <YAxis domain={[0, 'auto']} allowDecimals tick={AXIS} stroke={GRID}
               tickFormatter={(v) => (money ? kd(v) : int(v))} width={money ? 64 : 40} />
        <Tooltip content={<Tt money={money} />} />
        {series.length > 1 && (
          <Legend wrapperStyle={{ fontSize: 12, color: '#A7B2C0', paddingTop: 8 }} />
        )}
        {series.map((s) => (
          <Line key={s.key} type="monotone" dataKey={s.key} name={s.name}
                stroke={s.color} strokeWidth={2} dot={{ r: 3, strokeWidth: 0, fill: s.color }}
                activeDot={{ r: 6, stroke: '#151A21', strokeWidth: 2 }} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

/** Grouped vertical bars for a two-period comparison. */
export function BarsGrouped({ data, series, money = false, height = 300 }: {
  data: Record<string, string | number>[];
  series: { key: string; name: string; color: string }[];
  money?: boolean; height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: 4 }} barGap={2}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="label" tick={AXIS} stroke={GRID} />
        <YAxis domain={[0, 'auto']} tick={AXIS} stroke={GRID}
               tickFormatter={(v) => (money ? kd(v) : int(v))} width={money ? 64 : 40} />
        <Tooltip cursor={{ fill: '#ffffff08' }} content={<Tt money={money} />} />
        <Legend wrapperStyle={{ fontSize: 12, color: '#A7B2C0', paddingTop: 8 }} />
        {series.map((s) => (
          <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color} radius={[4, 4, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
export { ACCENT, ACCENT2, ACCENT3 };
