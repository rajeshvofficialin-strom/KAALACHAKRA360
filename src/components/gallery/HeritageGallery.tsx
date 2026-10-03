import { useCallback, useRef, useState } from 'react';
import { GitCompare, Info, Star, X } from 'lucide-react';
import { GALLERY_MODULES, HERITAGE_EXHIBITS, getExhibitById, type HeritageExhibit } from '@/data/heritageExhibits';
import { useHeritageGallery } from './useHeritageGallery';
import ViewerStage from './ViewerStage';
import ExhibitCard from './ExhibitCard';
import GalleryDialog from './GalleryDialog';
import ExhibitFacts, { FactList, ReconstructionNotice } from './ExhibitFacts';
import ComparePanel from './ComparePanel';
import CollectionTracker from './CollectionTracker';

const MODULE_STATUS_STYLES = {
  live: 'border-emerald-500/40 text-emerald-300',
  preview: 'border-amber-400/40 text-amber-300',
  planned: 'border-stone-500/40 text-stone-400',
} as const;

export default function HeritageGallery() {
  const gallery = useHeritageGallery();
  const [activeId, setActiveId] = useState(HERITAGE_EXHIBITS[0].id);
  const [detailsExhibit, setDetailsExhibit] = useState<HeritageExhibit | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  const active = getExhibitById(activeId) ?? HERITAGE_EXHIBITS[0];
  const compareExhibits = gallery.compareIds.map(getExhibitById).filter((e): e is HeritageExhibit => Boolean(e));
  const isActiveCollected = gallery.collected.includes(active.id);

  const explore = useCallback(
    (id: string) => {
      setActiveId(id);
      gallery.markExplored(id);
      stageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
    [gallery],
  );

  const closeDetails = useCallback(() => setDetailsExhibit(null), []);
  const closeCompare = useCallback(() => setCompareOpen(false), []);

  return (
    <section id="ancient-toys" aria-labelledby="ancient-toys-title" className="relative overflow-hidden px-4 py-20 sm:px-6">
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0E27] via-[#140d08] to-[#0A0E27]" />
        <div className="absolute inset-0 mandala-bg opacity-10" />
        <div className="absolute left-1/2 top-40 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-amber-600/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <header className="mb-12 text-center">
          <p className="mb-2 font-sanskrit text-lg text-amber-300/60">प्राचीन खिलौने · संग्रहालय</p>
          <h2 id="ancient-toys-title" className="mb-4 font-display text-4xl font-bold text-gold-gradient sm:text-5xl text-balance">
            Ancient Toys — 3D Heritage Gallery
          </h2>
          <p className="mx-auto max-w-3xl font-body text-lg text-amber-100/60 text-pretty">
            Walk through a digital exhibition hall of ten Indian toy traditions, from Harappan terracotta to living crafts of
            Karnataka, Andhra Pradesh and Tamil Nadu. Rotate, zoom and study each piece up close.
          </p>
        </header>

        <div className="mb-10">
          <CollectionTracker collected={gallery.collected} explored={gallery.explored} percent={gallery.collectedPercent} complete={gallery.isComplete} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div
            ref={stageRef}
            className="relative h-[420px] overflow-hidden rounded-2xl border border-amber-700/40 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] sm:h-[520px] lg:h-[600px]"
          >
            <div className="pointer-events-none absolute inset-0 z-10 rounded-2xl ring-1 ring-inset ring-amber-400/10" aria-hidden="true" />
            <ViewerStage exhibit={active} />
          </div>

          <aside className="flex flex-col gap-5 rounded-2xl border border-amber-800/40 bg-gradient-to-b from-[#1c140e] to-[#0e0a07] p-5 sm:p-6" aria-live="polite">
            <div>
              <p className="font-display text-xs tracking-[0.2em] text-amber-500/80">EXHIBIT {String(active.number).padStart(2, '0')} / {HERITAGE_EXHIBITS.length}</p>
              <h3 className="mt-2 font-display text-xl font-semibold leading-snug text-amber-100 text-balance">{active.name}</h3>
              {active.localName && <p className="mt-1 font-body text-base italic text-amber-300/70">{active.localName}</p>}
            </div>
            <FactList exhibit={active} />
            <p className="font-body text-base leading-relaxed text-amber-100/70">{active.significance}</p>
            <ReconstructionNotice exhibit={active} />
            <div className="mt-auto grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDetailsExhibit(active)}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-amber-700/50 px-3 py-2.5 font-display text-xs text-amber-100 hover:border-amber-400/70"
              >
                <Info size={14} aria-hidden="true" /> View Details
              </button>
              <button
                type="button"
                onClick={() => gallery.toggleCollected(active.id)}
                aria-pressed={isActiveCollected}
                className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 font-display text-xs font-semibold ${
                  isActiveCollected ? 'border border-amber-400/70 bg-amber-400/15 text-amber-200' : 'bg-gradient-to-r from-amber-600 to-amber-400 text-[#1a120c] hover:opacity-90'
                }`}
              >
                <Star size={14} fill={isActiveCollected ? 'currentColor' : 'none'} aria-hidden="true" />
                {isActiveCollected ? 'Collected' : 'Collect'}
              </button>
            </div>
          </aside>
        </div>

        <div className="section-divider my-14" />

        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h3 className="font-display text-2xl font-semibold text-amber-100">The Collection</h3>
            <p className="font-body text-base text-amber-100/55">Select up to two exhibits to compare.</p>
          </div>
        </div>
        <ul className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
          {HERITAGE_EXHIBITS.map((exhibit) => (
            <li key={exhibit.id} className="flex">
              <div className="flex w-full flex-col [&>article]:flex-1">
                <ExhibitCard
                  exhibit={exhibit}
                  active={exhibit.id === active.id}
                  explored={gallery.explored.includes(exhibit.id)}
                  collected={gallery.collected.includes(exhibit.id)}
                  comparing={gallery.compareIds.includes(exhibit.id)}
                  onExplore={() => explore(exhibit.id)}
                  onDetails={() => setDetailsExhibit(exhibit)}
                  onCompare={() => gallery.toggleCompare(exhibit.id)}
                  onCollect={() => gallery.toggleCollected(exhibit.id)}
                />
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-14">
          <h3 className="mb-4 font-display text-sm tracking-[0.2em] text-amber-400">GALLERY WINGS</h3>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {GALLERY_MODULES.map((module) => (
              <li key={module.id} className="rounded-lg border border-amber-900/40 bg-black/20 p-4">
                <span className={`inline-block rounded-full border px-2 py-0.5 font-display text-[10px] uppercase tracking-widest ${MODULE_STATUS_STYLES[module.status]}`}>
                  {module.status === 'planned' ? 'Coming soon' : module.status}
                </span>
                <p className="mt-2 font-display text-sm text-amber-100">{module.title}</p>
                <p className="mt-1 font-body text-sm text-amber-100/50">{module.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {compareExhibits.length > 0 && (
        <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
          <div className="flex items-center gap-3 rounded-full border border-amber-600/50 bg-[#1a120c]/95 py-2 pl-4 pr-2 shadow-2xl backdrop-blur">
            <GitCompare size={16} className="text-amber-300" aria-hidden="true" />
            <span className="font-display text-xs text-amber-100">{compareExhibits.length}/2 selected</span>
            <button
              type="button"
              disabled={compareExhibits.length < 2}
              onClick={() => setCompareOpen(true)}
              className="rounded-full bg-amber-500 px-4 py-1.5 font-display text-xs font-semibold text-[#1a120c] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Compare
            </button>
            <button type="button" onClick={gallery.clearCompare} aria-label="Clear comparison" className="rounded-full p-1.5 text-amber-200/70 hover:text-amber-100">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {detailsExhibit && (
        <GalleryDialog title={detailsExhibit.name} onClose={closeDetails}>
          <ExhibitFacts exhibit={detailsExhibit} />
          <button
            type="button"
            onClick={() => {
              explore(detailsExhibit.id);
              closeDetails();
            }}
            className="mt-6 w-full rounded-lg bg-gradient-to-r from-amber-600 to-amber-400 px-4 py-3 font-display text-sm font-semibold text-[#1a120c] hover:opacity-90"
          >
            Explore 3D
          </button>
        </GalleryDialog>
      )}

      {compareOpen && compareExhibits.length === 2 && (
        <GalleryDialog title="Compare Exhibits" onClose={closeCompare} wide>
          <ComparePanel exhibits={[compareExhibits[0], compareExhibits[1]]} />
        </GalleryDialog>
      )}
    </section>
  );
}
