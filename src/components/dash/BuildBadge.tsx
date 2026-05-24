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
  // The build number is the short commit the live site was built from ("dev" for a local,
  // unbuilt copy, where build-info.json carries no commit).
  const build = info.commit ? info.commit.slice(0, 7) : 'dev';
  const t = info.tests;
  const tests = t && t.passed != null ? `${t.passed}${info.ok === false ? ' ✗' : ' ✓'}` : null;
  const builtAt = info.builtAt ? new Date(info.builtAt).toLocaleString() : null;
  const title = `build ${build}${builtAt ? ` · built ${builtAt}` : ''}${
    info.runUrl ? ' · click for the CI run that tested it' : ''
  }`;

  const body = (
    <>
      <i className={`hud-build-pip ${info.ok === false ? 'hud-build-bad' : ''}`} />
      <span className="hud-build-no">build {build}</span>
      {tests && <span className="hud-build-tests"> · tests {tests}</span>}
    </>
  );

  return info.runUrl ? (
    <a className="hud-build" href={info.runUrl} target="_blank" rel="noreferrer" title={title}>
      {body}
    </a>
  ) : (
    <span className="hud-build" title={title}>
      {body}
    </span>
  );
}
