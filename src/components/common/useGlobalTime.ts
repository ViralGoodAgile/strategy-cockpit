import { useCockpit } from '../../store/useCockpit';
import { PERIODS } from '../../lib/timeTravel';

// The shape the shared Transport drives. Backed by the one store-held master clock.
export interface TimeTravel {
  index: number; // current frame (0 oldest … last = now)
  last: number; // max frame index
  playing: boolean;
  speed: number; // playback multiplier
  setIndex: (i: number) => void; // scrub — pauses playback
  setPlaying: (p: boolean) => void;
  setSpeed: (s: number) => void;
}

// The ONE master clock, presented as a TimeTravel so the shared Transport drives it unchanged.
// Every travel-capable widget (tiles AND overlays) reads and controls this single store-backed
// clock, so the entire dashboard moves as one in-sync movie: press play anywhere and every
// instrument advances together; scrub any transport and the whole dashboard travels with it.
// The master play loop itself lives in GlobalTimeTravel (always mounted while the cockpit is on).
export function useGlobalTime(): TimeTravel {
  const index = useCockpit((s) => s.timeIndex);
  const playing = useCockpit((s) => s.timePlaying);
  const speed = useCockpit((s) => s.timeSpeed);
  const setTimeIndex = useCockpit((s) => s.setTimeIndex);
  const setTimePlaying = useCockpit((s) => s.setTimePlaying);
  const setTimeSpeed = useCockpit((s) => s.setTimeSpeed);

  return {
    index,
    last: PERIODS - 1,
    playing,
    speed,
    // Scrubbing is a deliberate act: it pauses the master clock and holds the chosen frame.
    setIndex: (i) => {
      setTimePlaying(false);
      setTimeIndex(i);
    },
    setPlaying: setTimePlaying,
    setSpeed: setTimeSpeed,
  };
}
