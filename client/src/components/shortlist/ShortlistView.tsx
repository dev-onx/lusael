import { useEffect, useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { fetchRecommendations } from '../../lib/api';
import { PropertyCard } from './PropertyCard';
import { BriefCard } from '../intake/BriefCard';
import type { ScoredProperty } from '@lusael/shared';

export function ShortlistView() {
  const { brief, shortlist, setShortlist, appendShortlist, pinnedIds, setView } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [moreOffset, setMoreOffset] = useState(5);
  const [loadingMode, setLoadingMode] = useState<'more' | 'wildcards' | null>(null);
  const [wildcards, setWildcards] = useState<ScoredProperty[]>([]);
  const [showWildcards, setShowWildcards] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!brief || shortlist.length > 0) return;
    loadInitial();
  }, [brief]);

  async function loadInitial() {
    if (!brief) return;
    setLoading(true);
    setError(null);
    try {
      const results = await fetchRecommendations(brief, 0, 'standard');
      setShortlist(results);
    } catch (e) {
      setError('Failed to load recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleShowMore() {
    if (!brief) return;
    setLoadingMode('more');
    try {
      const results = await fetchRecommendations(brief, moreOffset, 'more');
      appendShortlist(results);
      setMoreOffset((o) => o + 5);
    } catch {
      setError('Failed to load more.');
    } finally {
      setLoadingMode(null);
    }
  }

  async function handleShowWildcards() {
    if (!brief) return;
    setLoadingMode('wildcards');
    try {
      const results = await fetchRecommendations(brief, 0, 'wildcards');
      setWildcards(results);
      setShowWildcards(true);
    } catch {
      setError('Failed to load wildcards.');
    } finally {
      setLoadingMode(null);
    }
  }

  if (!brief) return null;

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button onClick={() => setView('intake')} className="flex items-center gap-2">
            <span className="font-serif text-navy text-xl font-medium">Lusael</span>
          </button>
          <div className="flex items-center gap-3">
            {pinnedIds.length >= 2 && (
              <button
                onClick={() => setView('compare')}
                className="btn-primary text-xs"
              >
                Compare {pinnedIds.length}
              </button>
            )}
            <button onClick={() => setView('intake')} className="btn-ghost text-xs">
              New search
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1 space-y-4">
            <BriefCard brief={brief} />
            {pinnedIds.length > 0 && (
              <div className="bg-white border border-stone-200 rounded-2xl p-4">
                <p className="text-xs font-medium text-navy/50 uppercase tracking-wider mb-2">
                  Pinned for compare
                </p>
                <p className="text-sm text-navy font-medium">{pinnedIds.length}/3 selected</p>
                {pinnedIds.length >= 2 && (
                  <button onClick={() => setView('compare')} className="btn-primary w-full mt-3 text-sm">
                    Compare now
                  </button>
                )}
              </div>
            )}
          </aside>

          <div className="lg:col-span-3">
            {loading && (
              <div className="text-center py-16">
                <p className="text-navy/50 text-sm animate-pulse">Finding your best matches…</p>
              </div>
            )}

            {error && (
              <div className="text-red-500 text-sm text-center py-4 bg-red-50 rounded-xl">
                {error}
              </div>
            )}

            {!loading && shortlist.length > 0 && (
              <>
                <div className="flex items-baseline justify-between mb-6">
                  <h1 className="font-serif text-2xl text-navy font-medium">
                    Your shortlist
                  </h1>
                  <p className="text-xs text-stone-400">
                    {shortlist.length} curated from 20 listings
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {shortlist.map((p) => (
                    <PropertyCard key={p.id} property={p} />
                  ))}
                </div>

                {showWildcards && wildcards.length > 0 && (
                  <div className="mt-8">
                    <h2 className="font-serif text-xl text-navy font-medium mb-5">
                      Wildcard picks
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {wildcards.map((p) => (
                        <PropertyCard key={p.id} property={p} />
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mt-8 justify-center">
                  {moreOffset < 20 && (
                    <button
                      onClick={handleShowMore}
                      disabled={loadingMode === 'more'}
                      className="btn-ghost"
                    >
                      {loadingMode === 'more' ? 'Loading…' : 'Show 5 more'}
                    </button>
                  )}
                  {!showWildcards && (
                    <button
                      onClick={handleShowWildcards}
                      disabled={loadingMode === 'wildcards'}
                      className="btn-ghost"
                    >
                      {loadingMode === 'wildcards' ? 'Thinking…' : '✦ Show wildcards'}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-stone-400 py-6">
        MVP Demo — property data is illustrative
      </footer>
    </div>
  );
}
