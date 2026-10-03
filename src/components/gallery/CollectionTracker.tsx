import { Award, Star } from 'lucide-react';
import { HERITAGE_EXHIBITS, TOTAL_EXHIBITS } from '@/data/heritageExhibits';

interface CollectionTrackerProps {
  collected: string[];
  explored: string[];
  percent: number;
  complete: boolean;
}

export default function CollectionTracker({ collected, explored, percent, complete }: CollectionTrackerProps) {
  return (
    <div className="rounded-xl border border-amber-800/40 bg-gradient-to-r from-[#1a120c]/90 via-[#22170f]/90 to-[#1a120c]/90 p-5 backdrop-blur">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-500/40 bg-amber-500/10">
            <Award size={18} className="text-amber-300" aria-hidden="true" />
          </div>
          <div>
            <p className="font-display text-sm font-semibold tracking-widest text-amber-200">COLLECT ALL {TOTAL_EXHIBITS}</p>
            <p className="font-body text-sm text-amber-100/55">
              {collected.length} collected · {explored.length} explored
            </p>
          </div>
        </div>
        <ol className="flex flex-wrap gap-1.5" aria-label="Collection slots">
          {HERITAGE_EXHIBITS.map((exhibit) => {
            const isCollected = collected.includes(exhibit.id);
            return (
              <li
                key={exhibit.id}
                title={exhibit.name}
                className={`flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-display transition-colors ${
                  isCollected ? 'border-amber-300 bg-amber-400 text-[#1a120c]' : 'border-amber-800/60 text-amber-500/60'
                }`}
              >
                {isCollected ? <Star size={12} fill="currentColor" aria-hidden="true" /> : exhibit.number}
                <span className="sr-only">
                  {exhibit.name}: {isCollected ? 'collected' : 'not collected'}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
      <div
        className="mt-4 h-2 overflow-hidden rounded-full bg-black/40"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Collection progress"
      >
        <div className="h-full rounded-full bg-gradient-to-r from-amber-700 via-amber-500 to-amber-300 transition-all duration-700" style={{ width: `${percent}%` }} />
      </div>
      {complete && (
        <p className="mt-3 text-center font-display text-sm tracking-wider text-amber-200">
          Heritage Curator — you have collected every exhibit in the hall.
        </p>
      )}
    </div>
  );
}
