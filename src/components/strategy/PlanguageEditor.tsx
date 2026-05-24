import type { PlanguageEntry } from '../../domain/types';

// Structured Planguage editor (Gilb): one row per objective, Scale/Meter/Tolerable/Goal.
export function PlanguageEditor({
  entries,
  onChange,
}: {
  entries: PlanguageEntry[];
  onChange: (next: PlanguageEntry[]) => void;
}) {
  function update(id: string, patch: Partial<PlanguageEntry>) {
    onChange(entries.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }
  function add() {
    onChange([
      ...entries,
      { id: crypto.randomUUID(), gist: '', scale: '', meter: '', tolerable: '', goal: '' },
    ]);
  }
  function remove(id: string) {
    onChange(entries.filter((e) => e.id !== id));
  }

  return (
    <div className="planguage">
      {entries.map((e, i) => (
        <div className="pl-entry" key={e.id}>
          <div className="pl-entry-head">
            <span className="pl-index num">{String(i + 1).padStart(2, '0')}</span>
            <input
              className="pl-gist"
              placeholder="Gist — what is this objective?"
              value={e.gist}
              onChange={(ev) => update(e.id, { gist: ev.target.value })}
            />
            <button className="pl-remove" onClick={() => remove(e.id)} title="Remove">
              remove
            </button>
          </div>
          <div className="pl-grid">
            <label className="pl-field">
              <span>Scale</span>
              <input value={e.scale} placeholder="unit of measure" onChange={(ev) => update(e.id, { scale: ev.target.value })} />
            </label>
            <label className="pl-field">
              <span>Meter</span>
              <input value={e.meter} placeholder="how measured" onChange={(ev) => update(e.id, { meter: ev.target.value })} />
            </label>
            <label className="pl-field">
              <span>Tolerable</span>
              <input value={e.tolerable} placeholder="minimum" onChange={(ev) => update(e.id, { tolerable: ev.target.value })} />
            </label>
            <label className="pl-field">
              <span>Goal</span>
              <input value={e.goal} placeholder="target" onChange={(ev) => update(e.id, { goal: ev.target.value })} />
            </label>
          </div>
        </div>
      ))}
      <button className="pl-add link" onClick={add}>
        + add objective
      </button>
    </div>
  );
}
