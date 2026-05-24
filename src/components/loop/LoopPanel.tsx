import { SensorStack } from '../sensors/SensorStack';
import { LoopDiagram } from './LoopDiagram';
import './loop.css';

// Centre panel: the loop under inspection, then the sensor stack (gated on v0.1).
export function LoopPanel({ gateOpen }: { gateOpen: boolean }) {
  return (
    <div className="panel">
      <div>
        <div className="panel-title">The loop under inspection</div>
        <div className="panel-note">
          A loop is closed when REALITY observably modifies INTENT. Most loops never draw the return
          arrow. Click an arrow to mark its closure.
        </div>
      </div>

      <LoopDiagram />

      <div className="loop-legend">
        <span><i className="swatch swatch-open" /> open</span>
        <span><i className="swatch swatch-partial" /> partial</span>
        <span><i className="swatch swatch-closed" /> closed</span>
        <span className="loop-legend-note">return arrow shown dashed while open</span>
      </div>

      <div className="system-view panel-scroll">
        <div className="panel-title">Sensors <span className="panel-note">— reality, observed</span></div>
        <SensorStack gateOpen={gateOpen} />
      </div>
    </div>
  );
}
