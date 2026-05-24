import { useEffect, useState } from 'react';

interface BuildInfo {
  commit?: string | null;
  builtAt?: string | null;
  runUrl?: string | null;
  tests?: { passed?: number | null; total?: number | null; failed?: number | null };
  ok?: boolean;
}

// Reads the deploy-time build-info.json served alongside the app, so the live build's
// test result is verifiable in the cockpit itself (and links to the CI run log).
export function BuildBadge() {
  const [info, setInfo] = useState<BuildInfo | null>(null);

  useEffect(() => {
    fetch('/build-info.json', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then(setInfo)
      .catch(() => {});
  }, []);

  if (!info) return null;
  const sha = info.commit ? info.commit.slice(0, 7) : null;
  const t = info.tests;
  const label = t && t.passed != null ? `tests ${t.passed}${info.ok === false ? ' ✗' : ' ✓'}` : 'build';

  const body = (
    <>
      <i className={`hud-build-pip ${info.ok === false ? 'hud-build-bad' : ''}`} /> {label}
      {sha ? ` · ${sha}` : ''}
    </>
  );

  return info.runUrl ? (
    <a className="hud-build" href={info.runUrl} target="_blank" rel="noreferrer" title="view the CI run that tested this build">
      {body}
    </a>
  ) : (
    <span className="hud-build">{body}</span>
  );
}
