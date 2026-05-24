import type { CynefinDomain } from '../../domain/types';
import type { QualityMeta } from '../../domain/qualities';
import { useCockpit } from '../../store/useCockpit';
import { PlanguageEditor } from './PlanguageEditor';

const CYNEFIN: CynefinDomain[] = ['clear', 'complicated', 'complex', 'chaotic', 'confused'];

// Parse a comma-separated input into a trimmed list.
function toList(s: string): string[] {
  return s.split(',').map((x) => x.trim()).filter(Boolean);
}

// One authoring section for a single strategic quality: prompt + prose + any
// structured fields that quality's Mirror reads.
export function SectionEditor({ meta }: { meta: QualityMeta }) {
  const draft = useCockpit((s) => s.draft);
  const update = useCockpit((s) => s.updateSection);
  const active = useCockpit((s) => s.activeQuality);
  const isActive = active === meta.id;

  const empty = !sectionHasContent(meta.id);

  return (
    <section id={`section-${meta.id}`} className={`section ${isActive ? 'section-active' : ''}`}>
      <div className="section-head">
        <span className="section-n num">{String(meta.n).padStart(2, '0')}</span>
        <h3 className="section-name">{meta.name}</h3>
        {empty && <span className="section-empty">deliberately empty?</span>}
      </div>
      <p className="section-prompt">{meta.prompt}</p>

      <textarea
        rows={3}
        placeholder="…"
        value={draft[meta.id].text}
        onChange={(e) => update(meta.id, { text: e.target.value } as never)}
      />

      {meta.id === 'context' && (
        <div className="section-extra">
          <label className="field">
            <span>Crux (the single biggest obstacle)</span>
            <input
              value={draft.context.crux}
              placeholder="name the crux, not the goal"
              onChange={(e) => update('context', { crux: e.target.value })}
            />
          </label>
          <label className="field">
            <span>Cynefin domain</span>
            <div className="chips">
              {CYNEFIN.map((d) => (
                <button
                  key={d}
                  className={`chip ${draft.context.cynefin === d ? 'chip-on' : ''}`}
                  onClick={() => update('context', { cynefin: draft.context.cynefin === d ? '' : d })}
                >
                  {d}
                </button>
              ))}
            </div>
          </label>
        </div>
      )}

      {meta.id === 'focus' && (
        <div className="section-extra">
          <label className="field">
            <span>We will NOT (comma-separated)</span>
            <input
              value={draft.focus.willNot.join(', ')}
              placeholder="e.g. enterprise, on-prem"
              onChange={(e) => update('focus', { willNot: toList(e.target.value) })}
            />
          </label>
          <label className="field field-narrow">
            <span>Strategic WIP cap</span>
            <input
              type="number"
              min={0}
              value={draft.focus.wipCap ?? ''}
              placeholder="—"
              onChange={(e) =>
                update('focus', { wipCap: e.target.value === '' ? null : Number(e.target.value) })
              }
            />
          </label>
        </div>
      )}

      {meta.id === 'quantification' && (
        <div className="section-extra">
          <PlanguageEditor
            entries={draft.quantification.entries}
            onChange={(entries) => update('quantification', { entries })}
          />
        </div>
      )}

      {meta.id === 'participation' && (
        <div className="section-extra">
          <label className="field">
            <span>Authors (comma-separated)</span>
            <input
              value={draft.participation.authors.join(', ')}
              placeholder="whose voices shaped this"
              onChange={(e) => update('participation', { authors: toList(e.target.value) })}
            />
          </label>
          <label className="field">
            <span>Missing voices (comma-separated)</span>
            <input
              value={draft.participation.missingVoices.join(', ')}
              placeholder="whose voices are absent"
              onChange={(e) => update('participation', { missingVoices: toList(e.target.value) })}
            />
          </label>
        </div>
      )}

      {meta.id === 'durability' && (
        <div className="section-extra">
          <label className="field">
            <span>Depends on one named person? (leave blank if not)</span>
            <input
              value={draft.durability.dependsOn}
              placeholder="role or person this hinges on"
              onChange={(e) => update('durability', { dependsOn: e.target.value })}
            />
          </label>
        </div>
      )}
    </section>
  );
}

// Whether a section has any authored content (used to flag deliberately-empty sections).
function sectionHasContent(id: QualityMeta['id']): boolean {
  const d = useCockpit.getState().draft;
  const s = d[id];
  if (s.text.trim()) return true;
  if (id === 'context') return !!(d.context.crux.trim() || d.context.cynefin);
  if (id === 'focus') return d.focus.willNot.length > 0 || d.focus.wipCap != null;
  if (id === 'quantification') return d.quantification.entries.length > 0;
  if (id === 'participation') return d.participation.authors.length > 0 || d.participation.missingVoices.length > 0;
  if (id === 'durability') return !!d.durability.dependsOn.trim();
  return false;
}
