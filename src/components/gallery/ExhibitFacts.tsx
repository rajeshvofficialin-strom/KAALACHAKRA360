import { AlertTriangle, BookOpen } from 'lucide-react';
import { ARTIFACT_STATUS_LABELS, RECONSTRUCTION_LABEL, type HeritageExhibit } from '@/data/heritageExhibits';

export function ReconstructionNotice({ exhibit }: { exhibit: HeritageExhibit }) {
  return (
    <div className="flex gap-3 rounded-lg border border-amber-600/30 bg-amber-950/30 p-3">
      <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-400" aria-hidden="true" />
      <div>
        <p className="font-display text-xs font-semibold uppercase tracking-wider text-amber-300">{RECONSTRUCTION_LABEL}</p>
        <p className="mt-1 font-body text-sm text-amber-100/70">{exhibit.statusNote}</p>
      </div>
    </div>
  );
}

export function FactList({ exhibit }: { exhibit: HeritageExhibit }) {
  const facts = [
    { label: 'Region', value: exhibit.region },
    { label: 'Historical Period', value: exhibit.period },
    { label: 'Material', value: exhibit.material },
    { label: 'Artifact Status', value: ARTIFACT_STATUS_LABELS[exhibit.artifactStatus] },
  ];
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
      {facts.map((fact) => (
        <div key={fact.label} className="border-l-2 border-amber-700/40 pl-3">
          <dt className="font-display text-[10px] uppercase tracking-[0.18em] text-amber-500/80">{fact.label}</dt>
          <dd className="mt-0.5 font-body text-base leading-snug text-amber-100/90">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function References({ exhibit }: { exhibit: HeritageExhibit }) {
  return (
    <div>
      <h3 className="mb-2 flex items-center gap-2 font-display text-xs uppercase tracking-[0.18em] text-amber-400">
        <BookOpen size={14} aria-hidden="true" /> Historical References
      </h3>
      <ul className="flex flex-col gap-2">
        {exhibit.references.map((ref) => (
          <li key={ref.title} className="font-body text-sm text-amber-100/70">
            <span className="text-amber-100/90">{ref.title}</span> — {ref.note}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ExhibitFacts({ exhibit }: { exhibit: HeritageExhibit }) {
  return (
    <div className="flex flex-col gap-5">
      {exhibit.localName && <p className="font-body text-lg italic text-amber-300/80">{exhibit.localName}</p>}
      <p className="font-body text-lg leading-relaxed text-amber-100/80">{exhibit.description}</p>
      <FactList exhibit={exhibit} />
      <div>
        <h3 className="mb-1 font-display text-xs uppercase tracking-[0.18em] text-amber-400">Cultural Significance</h3>
        <p className="font-body text-base leading-relaxed text-amber-100/75">{exhibit.significance}</p>
      </div>
      <References exhibit={exhibit} />
      <ReconstructionNotice exhibit={exhibit} />
    </div>
  );
}
