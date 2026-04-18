import type { ScoredProperty } from '@lusael/shared';
import { ScoreBadge } from '../ui/ScoreBadge';
import { PropertyChat } from './PropertyChat';
import { useAppStore } from '../../store/appStore';
import { formatQar } from '../../lib/mortgage';

export function PropertyPanel() {
  const { activeProperty, setView, setActiveProperty, togglePin, pinnedIds } = useAppStore();

  if (!activeProperty) return null;

  const p: ScoredProperty = activeProperty;
  const isPinned = pinnedIds.includes(p.id);
  const canPin = isPinned || pinnedIds.length < 3;

  function handleClose() {
    setActiveProperty(null);
    setView('shortlist');
  }

  return (
    <div className="fixed inset-0 z-30 flex flex-col lg:flex-row bg-white">
      {/* Property detail — left/top */}
      <div className="lg:w-1/2 flex flex-col overflow-y-auto">
        <div className="relative">
          <img
            src={p.image_url}
            alt={p.title}
            className="w-full h-56 sm:h-72 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          <button
            onClick={handleClose}
            className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm text-white rounded-full p-2 hover:bg-white/30 transition-colors"
            aria-label="Back"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>

          <div className="absolute bottom-4 left-4 right-4">
            <h1 className="font-serif text-white text-xl sm:text-2xl font-medium leading-tight">
              {p.title}
            </h1>
            <p className="text-white/70 text-sm mt-0.5">{p.district}</p>
          </div>
        </div>

        <div className="p-5 flex-1">
          {/* Scores */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <ScoreBadge score={p.scores.lifestyle_score} label="Lifestyle fit" variant="lifestyle" />
            <ScoreBadge score={p.scores.investment_score} label="Investment" variant="investment" />
          </div>

          {/* Price + quick specs */}
          <div className="flex items-baseline gap-4 mb-1">
            <span className="text-2xl font-semibold text-navy">{formatQar(p.price_qar)}</span>
          </div>
          <p className="text-sm text-stone-500 mb-4">
            {formatQar(p.rent_monthly_qar)}/mo · {p.bedrooms === 0 ? 'Studio' : `${p.bedrooms} bed`} · {p.bathrooms} bath · {p.size_sqm} m²
          </p>

          {/* Why scores */}
          <div className="space-y-3 mb-5">
            <div className="bg-emerald-50 rounded-xl p-3">
              <p className="text-xs font-medium text-emerald-700 mb-1">Lifestyle</p>
              <p className="text-sm text-emerald-800 leading-relaxed">{p.scores.lifestyle_justification}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3">
              <p className="text-xs font-medium text-blue-700 mb-1">Investment</p>
              <p className="text-sm text-blue-800 leading-relaxed">{p.scores.investment_explanation}</p>
            </div>
          </div>

          {/* Key stats grid */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              ['Yield', `${p.rental_yield_pct}%`],
              ['1yr growth', `+${p.price_trend_1yr_pct}%`],
              ['Metro', `${p.distance_to_metro_m}m`],
              ['West Bay', `${p.distance_to_west_bay_km}km`],
              ['Built', String(p.year_built)],
              ['Developer', p.developer],
            ].map(([k, v]) => (
              <div key={k} className="bg-stone-50 rounded-xl p-3">
                <p className="text-xs text-stone-400">{k}</p>
                <p className="text-sm font-medium text-navy truncate">{v}</p>
              </div>
            ))}
          </div>

          {/* Amenities */}
          <div className="mb-5">
            <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-2">Amenities</p>
            <div className="flex flex-wrap gap-1.5">
              {p.amenities.map((a) => (
                <span key={a} className="px-2.5 py-1 bg-stone-100 text-navy text-xs rounded-full capitalize">
                  {a}
                </span>
              ))}
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-stone-600 leading-relaxed mb-5">{p.description}</p>

          {/* Pin button */}
          <button
            onClick={() => togglePin(p.id)}
            disabled={!canPin}
            className={`w-full py-3 rounded-full border text-sm font-medium transition-colors ${
              isPinned
                ? 'border-sand bg-sand/10 text-sand-dark'
                : canPin
                ? 'border-stone-200 text-stone-600 hover:border-sand hover:text-sand-dark'
                : 'border-stone-100 text-stone-300 cursor-not-allowed'
            }`}
          >
            {isPinned ? '✓ Pinned for comparison' : pinnedIds.length >= 3 ? 'Max 3 pins reached' : '+ Pin to compare'}
          </button>
        </div>
      </div>

      {/* Chat — right/bottom */}
      <div className="lg:w-1/2 border-t lg:border-t-0 lg:border-l border-stone-200 flex flex-col min-h-[50vh] lg:min-h-0">
        <div className="px-5 py-3 border-b border-stone-100">
          <p className="text-xs font-medium text-stone-400 uppercase tracking-wider">Ask anything</p>
        </div>
        <div className="flex-1 overflow-hidden">
          <PropertyChat />
        </div>
      </div>
    </div>
  );
}
