import type { ScoredProperty } from '@lusael/shared';
import { ScoreBadge } from '../ui/ScoreBadge';
import { useAppStore } from '../../store/appStore';
import { formatQar } from '../../lib/mortgage';

interface PropertyCardProps {
  property: ScoredProperty;
}

export function PropertyCard({ property: p }: PropertyCardProps) {
  const { setActiveProperty, togglePin, pinnedIds, setView } = useAppStore();
  const isPinned = pinnedIds.includes(p.id);
  const canPin = isPinned || pinnedIds.length < 3;

  function handleOpen() {
    setActiveProperty(p);
    setView('property');
  }

  return (
    <div className={`card group cursor-pointer transition-shadow hover:shadow-md ${p.is_wildcard ? 'border-sand/50' : ''}`}>
      {p.is_wildcard && (
        <div className="bg-sand/20 text-sand-dark text-xs font-medium px-3 py-1.5 flex items-center gap-1.5">
          <span>✦</span>
          <span>Wildcard pick — outside your stated criteria, but worth a look</span>
        </div>
      )}

      <div className="relative" onClick={handleOpen}>
        <img
          src={p.image_url}
          alt={p.title}
          className="w-full h-48 object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <span className="text-white/80 text-xs bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
            {p.district}
          </span>
          <div className="flex gap-1.5">
            <ScoreBadge score={p.scores.lifestyle_score} label="fit" variant="lifestyle" />
            <ScoreBadge score={p.scores.investment_score} label="inv" variant="investment" />
          </div>
        </div>
      </div>

      <div className="p-4" onClick={handleOpen}>
        <h3 className="font-serif text-navy text-base font-medium leading-snug mb-1">
          {p.title}
        </h3>
        <p className="text-stone-500 text-xs mb-3">
          {p.bedrooms === 0 ? 'Studio' : `${p.bedrooms}BR`} · {p.bathrooms}BA · {p.size_sqm} m²
        </p>

        <p className="text-sm text-navy/70 leading-relaxed line-clamp-3 mb-4">
          {p.scores.why_this_one}
        </p>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-navy">
              {formatQar(p.price_qar)}
            </p>
            <p className="text-xs text-stone-400">
              {formatQar(p.rent_monthly_qar)}/mo rental
            </p>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); togglePin(p.id); }}
            disabled={!canPin}
            className={`p-2 rounded-full border transition-colors ${
              isPinned
                ? 'border-sand bg-sand/10 text-sand-dark'
                : canPin
                ? 'border-stone-200 text-stone-400 hover:border-sand hover:text-sand-dark'
                : 'border-stone-100 text-stone-200 cursor-not-allowed'
            }`}
            title={isPinned ? 'Unpin' : pinnedIds.length >= 3 ? 'Max 3 pins' : 'Pin to compare'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={isPinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
