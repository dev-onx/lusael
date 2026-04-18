import { useAppStore } from './store/appStore';
import { IntakeChat } from './components/intake/IntakeChat';
import { ShortlistView } from './components/shortlist/ShortlistView';
import { PropertyPanel } from './components/property/PropertyPanel';
import { ComparePanel } from './components/compare/ComparePanel';

export default function App() {
  const { view } = useAppStore();

  if (view === 'shortlist') return <ShortlistView />;
  if (view === 'property') return <PropertyPanel />;
  if (view === 'compare') return <ComparePanel />;

  return (
    <div className="min-h-screen bg-navy flex flex-col">
      {/* Logo / header */}
      <header className="flex items-center justify-between px-6 pt-6 pb-2">
        <span className="font-serif text-sand text-2xl font-medium tracking-tight">Lusael</span>
        <span className="text-white/30 text-xs">Lusail, Qatar</span>
      </header>

      {/* Hero text */}
      <div className="flex-none px-6 pt-6 pb-4 max-w-lg">
        <h1 className="font-serif text-white text-3xl sm:text-4xl font-light leading-tight mb-2">
          Find your place<br />
          <em className="text-sand not-italic">in Lusail.</em>
        </h1>
        <p className="text-white/40 text-sm leading-relaxed">
          No filters. Just a conversation with a concierge who knows every district.
        </p>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col mx-4 sm:mx-6 mb-6 bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 min-h-0 max-h-[calc(100vh-200px)]">
        <IntakeChat />
      </div>

      <footer className="text-center text-white/20 text-xs pb-4">
        MVP Demo — property data is illustrative
      </footer>
    </div>
  );
}
