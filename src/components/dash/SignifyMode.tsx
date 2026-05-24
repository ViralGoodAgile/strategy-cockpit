import { useRef, useState } from 'react';
import {
  MIN_STORY_LEN,
  signifiableTriads,
  signifyReady,
  TRIAD_CATEGORY_LABEL,
  type TriadCategory,
} from '../../data/signifiableTriads';
import { pointToBarycentric } from '../../lib/barycentric';
import { useCockpit } from '../../store/useCockpit';

// Triad geometry (matches TriadChart): A=top, B=lower-left, C=lower-right.
const W = 240;
const H = 214;
const A = { x: W / 2, y: 22 };
const B = { x: 30, y: H - 30 };
const C = { x: W - 30, y: H - 30 };
// Median guides — same as the result charts: each vertex to the midpoint of the opposite
// edge, so the eye can read how far a placement sits from each pole.
const GUIDES: [{ x: number; y: number }, { x: number; y: number }][] = [
  [A, { x: (B.x + C.x) / 2, y: (B.y + C.y) / 2 }],
  [B, { x: (A.x + C.x) / 2, y: (A.y + C.y) / 2 }],
  [C, { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 }],
];

// Every signifiable triad, grouped for the picker (Cynefin · Customer · Strategy).
const TRIADS = signifiableTriads();
const CATEGORIES = [...new Set(TRIADS.map((t) => t.category))] as TriadCategory[];

// /signify — SenseMaker-style capture for survey takers. Story first (C2), then the
// respondent drops a dot in the triad to signify it; the dot's position becomes the (a,b,c)
// the cockpit's triads consume. Self-contained: captures persist to localStorage and merge
// into the live Cynefin triads.
export function SignifyMode() {
  const setMode = useCockpit((s) => s.setMode);
  const captureStory = useCockpit((s) => s.captureStory);
  const updateCaptured = useCockpit((s) => s.updateCaptured);
  const deleteCaptured = useCockpit((s) => s.deleteCaptured);
  const captured = useCockpit((s) => s.capturedStories);
  const segments = useCockpit((s) => s.segments);
  const addSegment = useCockpit((s) => s.addSegment);
  const removeSegment = useCockpit((s) => s.removeSegment);
  const triads = TRIADS;

  const [triadIdx, setTriadIdx] = useState(0);
  const [text, setText] = useState('');
  const [roleSel, setRoleSel] = useState<string>(segments[0] ?? '');
  const [w, setW] = useState<{ a: number; b: number; c: number } | null>(null);
  const [na, setNa] = useState(false);
  const [guides, setGuides] = useState(true); // median guide lines (as in the result charts)
  const [justSaved, setJustSaved] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null); // a story being revised
  const [confirmId, setConfirmId] = useState<string | null>(null); // a delete awaiting confirm
  const [editSegs, setEditSegs] = useState(false); // the "manage segments" editor is open
  const [newSeg, setNewSeg] = useState('');

  // The selected segment, kept valid if the chosen one was removed from the list.
  const role = segments.includes(roleSel) ? roleSel : (segments[0] ?? '');
  const setRole = setRoleSel;
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragging = useRef(false);

  const triad = triads[triadIdx];
  // Ready when the triad is marked not-applicable, OR there's a story plus a placement.
  const ready = signifyReady({ na, text, placed: w != null });
  const dot = w ? { x: w.a * A.x + w.b * B.x + w.c * C.x, y: w.a * A.y + w.b * B.y + w.c * C.y } : null;
  const mine = captured.filter((s) => s.triadId === triad.id);

  // Clear the form and any edit/confirm in progress — used on tab switch and after save.
  function resetForm() {
    setText('');
    setW(null);
    setNa(false);
    setEditingId(null);
    setConfirmId(null);
  }

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
    const payload = na
      ? { role, text: '', a: 0, b: 0, c: 0, na: true }
      : w
        ? { role, text: text.trim(), a: w.a, b: w.b, c: w.c, na: false }
        : null;
    if (!payload) return;
    if (editingId) {
      updateCaptured(editingId, payload); // revise the existing record in place
    } else {
      captureStory({ triadId: triad.id, ...payload });
    }
    resetForm();
    setJustSaved(true);
  }

  // Load a captured story back into the form to revise its text, segment or placement.
  function startEdit(s: (typeof captured)[number]) {
    setEditingId(s.id);
    setConfirmId(null);
    setJustSaved(false);
    setText(s.text);
    setRole(s.role);
    setNa(!!s.na);
    setW(s.na ? null : { a: s.a, b: s.b, c: s.c });
  }

  function confirmDelete(id: string) {
    deleteCaptured(id);
    if (editingId === id) resetForm();
    setConfirmId(null);
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
          {CATEGORIES.map((cat) => (
            <div className="sig-tab-group" key={cat}>
              <span className="sig-tab-cat">{TRIAD_CATEGORY_LABEL[cat]}</span>
              {triads.map((t, i) =>
                t.category === cat ? (
                  <button
                    key={t.id}
                    className={`sig-tab${i === triadIdx ? ' sig-tab-on' : ''}`}
                    onClick={() => {
                      setTriadIdx(i);
                      resetForm();
                      setJustSaved(false);
                    }}
                  >
                    {t.title}
                  </button>
                ) : null,
              )}
            </div>
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
            <div className="sig-count">{text.trim().length}/280 · at least {MIN_STORY_LEN} characters</div>

            <label className="sig-label" htmlFor="sig-role">
              3 · Whose situation (a segment, never a person)
              <button className="sig-seg-toggle" type="button" onClick={() => setEditSegs((v) => !v)}>
                {editSegs ? 'done' : 'edit list'}
              </button>
            </label>
            <select id="sig-role" className="sig-role" value={role} onChange={(e) => setRole(e.target.value)}>
              {segments.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {editSegs && (
              <div className="sig-seg-editor">
                <ul className="sig-seg-list">
                  {segments.map((s) => (
                    <li className="sig-seg-chip" key={s}>
                      {s}
                      <button
                        className="sig-seg-del"
                        type="button"
                        aria-label={`remove ${s}`}
                        onClick={() => removeSegment(s)}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
                <form
                  className="sig-seg-add"
                  onSubmit={(e) => {
                    e.preventDefault();
                    addSegment(newSeg);
                    setNewSeg('');
                  }}
                >
                  <input
                    className="sig-seg-input"
                    value={newSeg}
                    placeholder="add a segment (never a person)"
                    onChange={(e) => setNewSeg(e.target.value)}
                  />
                  <button className="sig-seg-addbtn" type="submit" disabled={!newSeg.trim()}>
                    Add
                  </button>
                </form>
              </div>
            )}

            <div className="sig-actions">
              <button className="sig-submit" disabled={!ready} onClick={submit}>
                {editingId ? 'Save changes' : 'Submit signification'}
              </button>
              {editingId && (
                <button
                  className="sig-cancel"
                  onClick={() => {
                    resetForm();
                    setJustSaved(false);
                  }}
                >
                  Cancel edit
                </button>
              )}
            </div>
            {editingId && <div className="sig-editing">Editing a captured story — Save to update it.</div>}
            {justSaved && !editingId && (
              <div className="sig-saved">Saved — add another, edit below, or return to the cockpit.</div>
            )}
          </div>

          <div className="sig-right">
            <div className="sig-right-head">
              <label className="sig-label">2 · Place it — drag the dot to where your story sits</label>
              <div className="sig-toggles">
                <label className="sig-na-label">
                  <input
                    type="checkbox"
                    className="sig-guides"
                    checked={guides}
                    onChange={(e) => setGuides(e.target.checked)}
                  />
                  Guides
                </label>
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
              {guides &&
                GUIDES.map(([v, m], i) => (
                  <line key={i} x1={v.x} y1={v.y} x2={m.x} y2={m.y} className="tc-guide" />
                ))}
              <polygon points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`} className="tc-frame" />
              <text x={A.x} y={A.y - 8} className="tc-pole" textAnchor="middle">
                {triad.poles[0]}
              </text>
              <text x={B.x - 2} y={B.y + 18} className="tc-pole" textAnchor="middle">
                {triad.poles[1]}
              </text>
              <text x={C.x + 2} y={C.y + 18} className="tc-pole" textAnchor="middle">
                {triad.poles[2]}
              </text>
              {dot && <circle cx={dot.x} cy={dot.y} r={7} className="sig-dot" />}
            </svg>
            <div className="sig-hint">{mine.length} stories already on “{triad.title}”.</div>
          </div>
        </div>

        <div className="sig-captured">
          <div className="sig-captured-head">Captured on “{triad.title}” · edit or remove</div>
          {mine.length === 0 ? (
            <p className="sig-captured-empty">No stories yet — signify one above.</p>
          ) : (
            <ul className="sig-cap-list">
              {mine.map((s) => (
                <li className={`sig-cap-row${editingId === s.id ? ' sig-cap-editing' : ''}`} key={s.id}>
                  <span className="sig-cap-role">{s.role}</span>
                  <span className={`sig-cap-text${s.na ? ' sig-cap-na' : ''}`}>
                    {s.na ? 'Not applicable' : s.text}
                  </span>
                  {confirmId === s.id ? (
                    <span className="sig-cap-confirm">
                      <span className="sig-cap-ask">Delete?</span>
                      <button className="sig-cap-yes" onClick={() => confirmDelete(s.id)}>
                        Yes
                      </button>
                      <button className="sig-cap-no" onClick={() => setConfirmId(null)}>
                        No
                      </button>
                    </span>
                  ) : (
                    <span className="sig-cap-acts">
                      <button className="sig-cap-edit" onClick={() => startEdit(s)}>
                        Edit
                      </button>
                      <button
                        className="sig-cap-del"
                        onClick={() => {
                          setConfirmId(s.id);
                          setJustSaved(false);
                        }}
                      >
                        Delete
                      </button>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
