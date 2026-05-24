import { useCockpit } from '../../store/useCockpit';
import { SCENARIOS, SCENARIO_ORDER } from '../../data/scenarios';

// A demo control in the HUD: flip the cockpit between scenarios so a sponsor can watch
// the loop-closure, the challenge, and data hygiene react in real time.
export function ScenarioSelector() {
  const scenario = useCockpit((s) => s.scenario);
  const setScenario = useCockpit((s) => s.setScenario);

  return (
    <div className="hud-scenario" title={SCENARIOS[scenario].note}>
      <span className="scn-tag">scenario</span>
      <div className="scn-pills">
        {SCENARIO_ORDER.map((id) => (
          <button
            key={id}
            className={`scn-pill${id === scenario ? ' scn-pill-on' : ''}`}
            onClick={() => setScenario(id)}
            title={SCENARIOS[id].note}
          >
            {SCENARIOS[id].label}
          </button>
        ))}
      </div>
    </div>
  );
}
