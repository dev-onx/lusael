interface ScoreBadgeProps {
  score: number;
  label: string;
  variant: 'lifestyle' | 'investment';
}

function scoreColor(score: number, variant: 'lifestyle' | 'investment') {
  if (variant === 'lifestyle') {
    if (score >= 80) return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    if (score >= 60) return 'bg-amber-50 text-amber-700 border border-amber-200';
    return 'bg-red-50 text-red-700 border border-red-200';
  }
  if (score >= 75) return 'bg-blue-50 text-blue-700 border border-blue-200';
  if (score >= 55) return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
  return 'bg-stone-100 text-stone-600 border border-stone-200';
}

export function ScoreBadge({ score, label, variant }: ScoreBadgeProps) {
  return (
    <span className={`score-badge ${scoreColor(score, variant)}`}>
      <span className="font-semibold">{score}</span>
      <span className="opacity-70">{label}</span>
    </span>
  );
}
