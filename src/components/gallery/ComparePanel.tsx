import { ARTIFACT_STATUS_LABELS, formatTimelineYear, type HeritageExhibit } from '@/data/heritageExhibits';

const ROWS: { label: string; render: (e: HeritageExhibit) => string }[] = [
  { label: 'Region', render: (e) => e.region },
  { label: 'Period', render: (e) => e.period },
  { label: 'Approx. Timeline', render: (e) => formatTimelineYear(e.timelineYear) },
  { label: 'Material', render: (e) => e.material },
  { label: 'Artifact Status', render: (e) => ARTIFACT_STATUS_LABELS[e.artifactStatus] },
  { label: 'Significance', render: (e) => e.significance },
];

export default function ComparePanel({ exhibits }: { exhibits: [HeritageExhibit, HeritageExhibit] }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-left">
          <caption className="sr-only">Side-by-side comparison of two exhibits</caption>
          <thead>
            <tr>
              <th scope="col" className="w-36 p-3">
                <span className="sr-only">Attribute</span>
              </th>
              {exhibits.map((e) => (
                <th key={e.id} scope="col" className="p-3 align-bottom">
                  <span className="mb-2 block h-1 w-10 rounded-full" style={{ background: e.accent }} aria-hidden="true" />
                  <span className="font-display text-sm font-semibold text-amber-100">{e.name}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.label} className="border-t border-amber-900/40">
                <th scope="row" className="p-3 align-top font-display text-[10px] font-normal uppercase tracking-[0.18em] text-amber-500/80">
                  {row.label}
                </th>
                {exhibits.map((e) => (
                  <td key={e.id} className="p-3 align-top font-body text-sm leading-snug text-amber-100/80">
                    {row.render(e)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="font-body text-sm italic text-amber-100/50">Side-by-side 3D comparison is planned for a future update.</p>
    </div>
  );
}
