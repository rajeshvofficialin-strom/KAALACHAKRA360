import { Box, Check, GitCompare, Info, Star } from 'lucide-react';
import { ARTIFACT_STATUS_LABELS, type HeritageExhibit } from '@/data/heritageExhibits';

interface ExhibitCardProps {
  exhibit: HeritageExhibit;
  active: boolean;
  explored: boolean;
  collected: boolean;
  comparing: boolean;
  onExplore: () => void;
  onDetails: () => void;
  onCompare: () => void;
  onCollect: () => void;
}

export default function ExhibitCard({ exhibit, active, explored, collected, comparing, onExplore, onDetails, onCompare, onCollect }: ExhibitCardProps) {
  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-xl border bg-gradient-to-b from-[#1c140e] to-[#0f0b08] transition-all duration-300 hover:-translate-y-1 ${
        active ? 'border-amber-400/70 shadow-[0_0_30px_rgba(212,166,74,0.25)]' : 'border-amber-900/40 hover:border-amber-600/50'
      }`}
    >
      <button
        type="button"
        onClick={onExplore}
        className="relative flex h-28 items-center justify-center overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-300"
        aria-label={`Explore ${exhibit.name} in 3D`}
      >
        <div className="absolute inset-0 opacity-70 transition-opacity group-hover:opacity-100" style={{ background: `radial-gradient(circle at 50% 80%, ${exhibit.accent}66 0%, transparent 65%)` }} />
        <div className="absolute inset-x-6 bottom-3 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
        <span className="relative font-display text-4xl font-bold text-amber-200/90">{String(exhibit.number).padStart(2, '0')}</span>
        <span className="absolute right-2 top-2 flex gap-1">
          {explored && (
            <span className="rounded-full bg-black/50 p-1 text-amber-300" title="Explored">
              <Check size={12} aria-hidden="true" />
              <span className="sr-only">Explored</span>
            </span>
          )}
          {collected && (
            <span className="rounded-full bg-amber-400/90 p-1 text-[#1a120c]" title="Collected">
              <Star size={12} fill="currentColor" aria-hidden="true" />
              <span className="sr-only">Collected</span>
            </span>
          )}
        </span>
      </button>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="font-display text-[10px] uppercase tracking-[0.18em] text-amber-500/80">{ARTIFACT_STATUS_LABELS[exhibit.artifactStatus]}</p>
        <h3 className="font-display text-sm font-semibold leading-snug text-amber-100 text-balance">{exhibit.name}</h3>
        <p className="font-body text-sm leading-snug text-amber-100/55">{exhibit.region}</p>

        <div className="mt-auto grid grid-cols-2 gap-1.5 pt-3">
          <button
            type="button"
            onClick={onExplore}
            className="col-span-2 flex items-center justify-center gap-1.5 rounded-md bg-gradient-to-r from-amber-600 to-amber-500 px-3 py-2 font-display text-xs font-semibold text-[#1a120c] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
          >
            <Box size={14} aria-hidden="true" /> Explore 3D
          </button>
          <button
            type="button"
            onClick={onDetails}
            className="flex items-center justify-center gap-1 rounded-md border border-amber-800/50 px-2 py-1.5 font-display text-[11px] text-amber-200/80 hover:border-amber-500/60 hover:text-amber-100"
          >
            <Info size={12} aria-hidden="true" /> Details
          </button>
          <button
            type="button"
            onClick={onCompare}
            aria-pressed={comparing}
            className={`flex items-center justify-center gap-1 rounded-md border px-2 py-1.5 font-display text-[11px] ${
              comparing ? 'border-amber-400/70 bg-amber-400/15 text-amber-100' : 'border-amber-800/50 text-amber-200/80 hover:border-amber-500/60 hover:text-amber-100'
            }`}
          >
            <GitCompare size={12} aria-hidden="true" /> Compare
          </button>
          <button
            type="button"
            onClick={onCollect}
            aria-pressed={collected}
            className={`col-span-2 flex items-center justify-center gap-1 rounded-md border px-2 py-1.5 font-display text-[11px] ${
              collected ? 'border-amber-400/70 bg-amber-400/15 text-amber-200' : 'border-amber-800/50 text-amber-200/80 hover:border-amber-500/60 hover:text-amber-100'
            }`}
          >
            <Star size={12} fill={collected ? 'currentColor' : 'none'} aria-hidden="true" /> {collected ? 'Collected' : 'Collect'}
          </button>
        </div>
      </div>
    </article>
  );
}
