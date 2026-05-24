import { useCockpit } from '../../store/useCockpit';
import type { ThemeId } from '../../store/useCockpit';

const THEMES: { id: ThemeId; label: string; note: string }[] = [
  { id: 'obsidian', label: 'Obsidian', note: 'Champagne on black (default)' },
  { id: 'slate', label: 'Slate', note: 'Cooler steel field for bright rooms' },
  { id: 'colorsafe', label: 'Colour-safe', note: 'Colour-blind-safe status colours (blue / yellow / orange)' },
];

// Colour-scheme switcher in the HUD — three swatches; the active one is ringed. The note
// is the tooltip. Colour-safe re-maps the red/green status palette for CVD.
export function ThemeSelector() {
  const theme = useCockpit((s) => s.theme);
  const setTheme = useCockpit((s) => s.setTheme);

  return (
    <div className="hud-theme" title="colour scheme">
      {THEMES.map((t) => (
        <button
          key={t.id}
          className={`thm thm-${t.id}${t.id === theme ? ' thm-on' : ''}`}
          onClick={() => setTheme(t.id)}
          title={`${t.label} — ${t.note}`}
          aria-label={`${t.label} colour scheme`}
        />
      ))}
    </div>
  );
}
