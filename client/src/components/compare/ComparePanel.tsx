import { useEffect, useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { fetchCompare } from '../../lib/api';
import { ScoreBadge } from '../ui/ScoreBadge';
import { formatQar } from '../../lib/mortgage';
import type { ScoredProperty } from '@lusael/shared';

export function ComparePanel() {
  const { brief, pinnedIds, shortlist, compareResult, setCompareResult, setView, setActiveProperty } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pinned = pinnedIds
    .map((id) => shortlist.find((p) => p.id === id))
    .filter((p): p is ScoredProperty => !!p);

  useEffect(() => {
    if (pinned.length < 2 || !brief) return;
    if (compareResult) return;
    loadComparison();
  }, []);

  async function loadComparison() {
    if (!brief || pinned.length < 2) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchCompare({ property_ids: pinnedIds, brief });
      setCompareResult(result);
    } catch {
      setError('Failed to load comparison.');
    } finally {
      setLoading(false);
    }
  }

  if (pinned.length < 2) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-navy/50 mb-4">Pin at least 2 properties to compare</p>
          <button onClick={() => setView('shortlist')} className="btn-primary">
            Back to shortlist
          </button>
        </div>
      </div>
    );
  }

  const rows: [string, (p: ScoredProperty) => React.ReactNode][] = [
    ['Price', (p) => formatQar(p.price_qar)],
    ['Rent/month', (p) => formatQar(p.rent_monthly_qar)],
    ['Bedrooms', (p) => p.bedrooms === 0 ? 'Studio' : `${p.bedrooms} BR`],
    ['Size', (p) => `${p.size_sqm} m²`],
    ['Rental yield', (p) => `${p.rental_yield_pct}%`],
    ['1yr price trend', (p) => `+${p.price_trend_1yr_pct}%`],
    ['Metro distance', (p) => `${p.distance_to_metro_m}m`],
    ['Lifestyle score', (p) => <ScoreBadge score={p.scores.lifestyle_score} label="" variant="lifestyle" />],
    ['Investment score', (p) => <ScoreBadge score={p.scores.investment_score} label="" variant="investment" />],
    ['Combined score', (p) => <span className="font-semibold">{p.scores.combined_score}</span>],
    ['Developer', (p) => p.developer],
    ['Built', (p) => String(p.year_built)],
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button onClick={() => setView('shortlist')} className="flex items-center gap-2 text-navy/60 hover:text-navy transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            <span className="text-sm">Back to shortlist</span>
          </button>
          <span className="font-serif text-navy text-lg font-medium">Comparison</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Property images */}
        <div className="grid gap-4 mb-8" style={{ gridTemplateColumns: `repeat(${pinned.length}, 1fr)` }}>
          {pinned.map((p) => (
            <div
              key={p.id}
              className="cursor-pointer"
              onClick={() => { setActiveProperty(p); setView('property'); }}
            >
              <img src={p.image_url} alt={p.title} className="w-full h-36 object-cover rounded-2xl" />
              <h3 className="font-serif text-navy text-sm font-medium mt-2 leading-snug">{p.title}</h3>
              <p className="text-xs text-stone-400">{p.district}</p>
            </div>
          ))}
        </div>

        {/* Comparison table */}
        <div className="card overflow-x-auto mb-8">
          <table className="w-full text-sm">
            <colgroup>
              <col className="w-36" />
              {pinned.map((p) => <col key={p.id} />)}
            </colgroup>
            <tbody>
              {rows.map(([label, render]) => (
                <tr key={label} className="border-b border-stone-100 last:border-0">
                  <td className="px-4 py-3 text-stone-400 text-xs font-medium whitespace-nowrap">{label}</td>
                  {pinned.map((p) => (
                    <td key={p.id} className="px-4 py-3 text-navy font-medium">
                      {render(p)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* AI tradeoff analysis */}
        {loading && (
          <div className="text-center py-8 text-navy/40 animate-pulse text-sm">
            Analysing tradeoffs…
          </div>
        )}
        {error && (
          <div className="text-red-500 text-sm text-center py-4 bg-red-50 rounded-xl">
            {error}
            <button onClick={loadComparison} className="ml-3 underline">Retry</button>
          </div>
        )}
        {compareResult && (
          <div className="bg-white border border-stone-200 rounded-2xl p-6">
            <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-3">
              Concierge analysis
            </p>
            <p className="text-sm text-navy/80 leading-relaxed whitespace-pre-wrap">
              {compareResult.tradeoff}
            </p>
          </div>
        )}
      </main>

      <footer className="text-center text-xs text-stone-400 py-6">
        MVP Demo — property data is illustrative
      </footer>
    </div>
  );
}
