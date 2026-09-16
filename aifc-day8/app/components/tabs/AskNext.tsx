'use client';
import { Card } from '../ui';

const Q = [
  {
    q: 'Why did the premium dishes drop in week two?',
    why: 'This is the whole finding, and the file cannot explain it. Orders for the two premium dishes fell from 22 to 18 while everything else rose. If it was a stock-out, the fix is supply. If it was price sensitivity, the fix is pricing. If it was a promotion on cheap items, the fix is to stop running it. Three different answers, three different budgets.',
    need: 'Daily stock-out and sold-out flags per item, a record of promotions and their dates, and menu-position history. None of these exist in the file.',
  },
  {
    q: 'Are these 153 delivered orders from 153 different people, or 40 regulars ordering repeatedly?',
    why: 'It changes what the revenue is worth. A flat fortnight from a growing customer base is a pricing problem. The same flat fortnight from a shrinking base of loyal customers is a retention emergency. The dashboard cannot tell these apart.',
    need: 'A stable customer ID. The file has names and emails, but names repeat across different emails and two emails are blank, so neither can be trusted to identify a person.',
  },
  {
    q: 'Why does Fintas cancel 20% of its orders while Mangaf cancels 3.3%?',
    why: 'Fintas cancels six times as often as Mangaf. If it is distance or driver coverage, it is an operations fix worth real money. If it is one bad week or one unreliable customer, it is noise and should be ignored. Acting on the wrong reading wastes the effort.',
    need: 'A cancellation reason code, the time between order and cancellation, and which party cancelled. The file records only the final status, with no reason and no timestamp.',
  },
];

export default function AskNext() {
  return (
    <div className="mx-auto max-w-4xl">
      <h2 className="text-[clamp(1.5rem,3.5vw,2.25rem)] font-bold tracking-tight">What I would ask next</h2>
      <p className="mt-2 max-w-[65ch] text-sm leading-relaxed text-text-1">
        Three questions this dataset raises and cannot answer. Each one would change a decision, and each
        one needs data that simply is not in the file. Listing them is not a failure of the analysis —
        knowing the edge of what you can prove is part of the analysis.
      </p>
      <div className="mt-6 grid gap-4">
        {Q.map((x, i) => (
          <Card key={i} className="p-6">
            <div className="flex gap-4">
              <span className="text-2xl font-bold leading-none text-accent/30">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3 className="text-lg font-semibold leading-snug">{x.q}</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[.14em] text-text-2">Why it matters</div>
                    <p className="mt-1.5 text-sm leading-relaxed text-text-1">{x.why}</p>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[.14em] text-accent">What we would need to collect</div>
                    <p className="mt-1.5 text-sm leading-relaxed text-text-1">{x.need}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
