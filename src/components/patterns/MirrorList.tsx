import type { MirrorVerdict } from '../../domain/types';
import { QUALITIES } from '../../domain/qualities';
import { useCockpit } from '../../store/useCockpit';
import { TrendMark } from '../common/TrendMark';

// Plain-language label for a verdict: "Intent · Clarity" rather than "M-Intent.Clarity".
function label(v: MirrorVerdict): string {
  const q = QUALITIES.find((x) => x.id === v.quality);
  return q ? `${q.name} · ${v.title}` : v.title;
}

// The ten Mirror verdicts. Each is one click from the section it critiques (focusQuality).
export function MirrorList({ verdicts }: { verdicts: MirrorVerdict[] }) {
  const focusQuality = useCockpit((s) => s.focusQuality);

  return (
    <ul className="mirror-list">
      {verdicts.map((v) => (
        <li key={v.id} className="mirror">
          <button
            className="mirror-row"
            onClick={() => focusQuality(v.quality)}
            disabled={!v.quality}
          >
            <span className="mirror-top">
              <span className="mirror-id">{label(v)}</span>
              <TrendMark trend={v.trend} />
            </span>
            <span className="mirror-body">{v.body}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
