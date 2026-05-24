import { useRef, useState } from 'react';
import { TRIAD_SIGNAL } from '../../data/sensorData';
import { pointToBarycentric } from '../../lib/barycentric';
import { useCockpit } from '../../store/useCockpit';

// Triad geometry (matches TriadChart): A=top, B=lower-left, C=lower-right.
const W = 240;
const H = 214;
const A = { x: W / 2, y: 22 };
const B = { x: 30, y: H - 30 };
const C = { x: W - 30, y: H - 30 };

// Segments only — never named individuals (C4).
const SEGMENTS = [
  'onboarding teams',
  'returning users',
  'power users',
  'cross-team hand-offs',
  'evaluators',
  'admins',
  'PM',
  'engineer',
  'designer',
  'support',
];

// /signify — SenseMaker-style capture for survey takers. Story first (C2), then the
// respondent drops a dot in the triad to signify it; the dot's position becomes the (a,b,c)
// the cockpit's triads consume. Self-contained: captures persist to localStorage and merge
// into the live Cynefin triads.
export function SignifyMode() {
  const setMode = useCockpit((s) => s.setMode);
  const captureStory = useCockpit((s) => s.captureStory);
  const captured = useCockpit((s) => s.capturedStories);
  const triads = TRIAD_SIGNAL.value.triads;

  const [triadIdx, setTriadIdx] = useState(0);
  const [text, setText] = useState('');
  const [role, setRole] = useState(SEGMENTS[0]);
  const [w, setW] = useState<{ a: number; b: number; c: number } | null>(null);
  const [na, setNa] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragging = useRef(false);

  const triad = triads[triadIdx];
  // Ready when the triad is marked not-applicable, OR there's a story plus a placement.
  const ready = na || (text.trim().length >= 10 && w != null);
  const dot = w ? { x: w.a * A.x + w.b * B.x + w.c * C.x, y: w.a * A.y + w.b * B.y + w.c * C.y } : null;
  const mineForTriad = captured.filter((s) => s.triadId === triad.id).length;

  function place(clientX: number, clientY: number) {
    const el = svgRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const p = { x: ((clientX - r.left) / r.width) * W, y: ((clientY - r.top) / r.height) * H };
    setW(pointToBarycentric(p, A, B, C));
    setJustSaved(false);
  }

  function submit() {
    if (!ready) return;
    if (na) {
      captureStory({ triadId: triad.id, role, text: '', a: 0, b: 0, c: 0, na: true });
    } else if (w) {
      captureStory({ triadId: triad.id, role, text: text.trim(), a: w.a, b: w.b, c: w.c });
    } else {
      return;
    }
    setText('');
    setW(null);
    setNa(false);
    setJustSaved(true);
  }

  return (
    <div className="author signify">
      <header className="author-head">
        <button className="author-back" onClick={() => setMode('cockpit')}>
          ‹ cockpit
        </button>
        <span className="author-title">Signify a story</span>
        <span className="author-note">your story, your placement — the cockpit only shows the dots</span>
        <span className="author-fresh">{captured.length} captured</span>
      </header>

      <div className="author-body sig-body">
        <div className="sig-triad-tabs">
          {triads.map((t, i) => (
            <button
              key={t.id}
              className={`sig-tab${i === triadIdx ? ' sig-tab-on' : ''}`}
              onClick={() => {
                setTriadIdx(i);
                setW(null);
                setNa(false);
                setText('');
                setJustSaved(false);
              }}
            >
              {t.title}
            </button>
          ))}
        </div>

        <p className="sig-question">{triad.question}</p>

        <div className="sig-grid">
          <div className="sig-left">
            <label className="sig-label" htmlFor="sig-story">
              1 · Your story
            </label>
            <textarea
              id="sig-story"
              className="sig-story"
              placeholder="A recent, real moment — what happened, in a sentence or two."
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setJustSaved(false);
              }}
              maxLength={280}
            />
            <div className="sig-count">{text.trim().length}/280 · at least 10 characters</div>

            <label className="sig-label" htmlFor="sig-role">
              3 · Whose situation (a segment, never a person)
            </label>
            <select id="sig-role" className="sig-role" value={role} onChange={(e) => setRole(e.target.value)}>
              {SEGMENTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <button className="sig-submit" disabled={!ready} onClick={submit}>
              Submit signification
            </button>
            {justSaved && <div className="sig-saved">Captured — add another, or return to the cockpit.</div>}
          </div>

          <div className="sig-right">
            <div className="sig-right-head">
              <label className="sig-label">2 · Place it — drag the dot to where your story sits</label>
              <label className="sig-na-label">
                <input
                  type="checkbox"
                  className="sig-na"
                  checked={na}
                  onChange={(e) => {
                    setNa(e.target.checked);
                    setJustSaved(false);
                  }}
                />
                Not applicable
              </label>
            </div>
            <svg
              ref={svgRef}
              viewBox={`0 0 ${W} ${H}`}
              className={`sig-svg${na ? ' sig-svg-disabled' : ''}`}
              role="img"
              onPointerDown={(e) => {
                if (na) return;
                dragging.current = true;
                (e.target as Element).setPointerCapture?.(e.pointerId);
                place(e.clientX, e.clientY);
              }}
              onPointerMove={(e) => {
                if (!na && dragging.current) place(e.clientX, e.clientY);
              }}
              onPointerUp={() => {
                dragging.current = false;
              }}
            >
              <polygon points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`} className="tc-frame" />
              <text x={A.x} y={A.y - 8} className="tc-pole" textAnchor="middle">
                {triad.poles[0].short}
              </text>
              <text x={B.x - 2} y={B.y + 18} className="tc-pole" textAnchor="middle">
                {triad.poles[1].short}
              </text>
              <text x={C.x + 2} y={C.y + 18} className="tc-pole" textAnchor="middle">
                {triad.poles[2].short}
              </text>
              {dot && <circle cx={dot.x} cy={dot.y} r={7} className="sig-dot" />}
            </svg>
            <div className="sig-hint">{mineForTriad} stories already on “{triad.title}”.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
