import type { UserBrief } from '@lusael/shared';
import { useAppStore } from '../../store/appStore';
import { formatQar } from '../../lib/mortgage';

interface BriefCardProps {
  brief: UserBrief;
}

export function BriefCard({ brief }: BriefCardProps) {
  const { restartIntake } = useAppStore();

  const tags = [
    brief.intent.toUpperCase(),
    brief.bedrooms !== null ? `${brief.bedrooms}BR` : null,
    brief.timeline,
    ...brief.lifestyle_tags,
  ].filter(Boolean);

  return (
    <div className="bg-navy/5 border border-navy/10 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-navy/50 uppercase tracking-wider">Your brief</p>
        <button
          onClick={restartIntake}
          className="text-xs text-sand-dark hover:text-sand transition-colors"
        >
          Start over
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-navy">
            {formatQar(brief.budget_min)} – {formatQar(brief.budget_max)}
          </span>
          {brief.intent === 'rent' && <span className="text-xs text-stone-500">/month</span>}
        </div>

        {brief.commute_anchor && (
          <p className="text-xs text-stone-500">
            Near <span className="font-medium text-navy/70">{brief.commute_anchor}</span>
          </p>
        )}

        <div className="flex flex-wrap gap-1.5 mt-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-sand/20 text-navy text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
          {brief.investment_focus && (
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200">
              Investment focus
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
