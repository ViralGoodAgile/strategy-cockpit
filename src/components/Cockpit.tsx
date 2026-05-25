import { hasV01, useCockpit } from '../store/useCockpit';
import { latestVersion } from '../store/useCockpit';
import { StrategyReadout } from './dash/StrategyReadout';
import { MandateReadout } from './dash/MandateReadout';
import { TriadsReadout } from './dash/TriadsReadout';
import { FlowReadout } from './dash/FlowReadout';
import { QuantReadout } from './dash/QuantReadout';
import { StrategyTriadsReadout } from './dash/StrategyTriadsReadout';
import { LoopInstrument } from './dash/LoopInstrument';
import { SystemModelReadout } from './dash/SystemModelReadout';
import { WeakSignalsReadout } from './dash/WeakSignalsReadout';
import { RadarReadout } from './dash/RadarReadout';
import { OutcomesReadout } from './dash/OutcomesReadout';
import { ReliabilityReadout } from './dash/ReliabilityReadout';
import { HygieneReadout } from './dash/HygieneReadout';
import { ChallengeBar } from './dash/ChallengeBar';
import { ScenarioSelector } from './dash/ScenarioSelector';
import { GlobalTimeTravel } from './dash/GlobalTimeTravel';
import { ThemeSelector } from './dash/ThemeSelector';
import { BuildBadge } from './dash/BuildBadge';
import { DetailOverlay } from './dash/DetailOverlay';
import { AuthorMode } from './dash/AuthorMode';
import { SignifyMode } from './dash/SignifyMode';
import './cockpit.css';
import './dash/dashboard.css';
import './loop/loop.css';
import './sensors/sensors.css';

// The cockpit: a fixed, no-scroll instrument cluster. Author mode is a separate screen.
export function Cockpit() {
  const mode = useCockpit((s) => s.mode);
  const versions = useCockpit((s) => s.versions);
  const setMode = useCockpit((s) => s.setMode);
  const gateOpen = hasV01(versions);
  const latest = latestVersion(versions);

  if (mode === 'author') return <AuthorMode />;
  if (mode === 'signify') return <SignifyMode />;

  return (
    <div className="cockpit">
      <header className="hud">
        <div className="hud-id">
          <span className="hud-title">Strategy.Cockpit</span>
          <span className="hud-sub">inspector for a strategic feedback loop</span>
        </div>
        <div className="hud-status">
          {gateOpen ? (
            <span className="hud-online">
              <i className="hud-pip" /> online · strategy v{latest?.version}
            </span>
          ) : (
            <span className="hud-offline">offline · no strategy v0.1</span>
          )}
        </div>
        {gateOpen && <GlobalTimeTravel />}
        {gateOpen && <ScenarioSelector />}
        <ThemeSelector />
        <BuildBadge />
        {gateOpen && (
          <button className="hud-signify" onClick={() => setMode('signify')}>
            Signify ›
          </button>
        )}
        <button className="hud-author" onClick={() => setMode('author')}>
          Author strategy ›
        </button>
      </header>

      {gateOpen ? (
        <div className="band">
          <main className="dash-grid">
            <StrategyReadout />
            <MandateReadout />
            <QuantReadout />
            <WeakSignalsReadout />
            <RadarReadout />
            <StrategyTriadsReadout />
            <LoopInstrument />
            <SystemModelReadout />
            <TriadsReadout />
            <OutcomesReadout />
            <HygieneReadout />
            <ReliabilityReadout />
            <FlowReadout />
          </main>
          <ChallengeBar />
        </div>
      ) : (
        <div className="cockpit-offline">
          <p>The cockpit is offline.</p>
          <p className="cockpit-offline-note">
            Author a v0.1 strategy across the ten qualities to bring the sensors and challenge online.
            An empty section is allowed — it is itself a finding.
          </p>
          <button className="hud-author" onClick={() => setMode('author')}>
            Author strategy ›
          </button>
        </div>
      )}

      <DetailOverlay />
    </div>
  );
}
