# Security Policy

## Scope

Strategy.Cockpit is a **client-side-only prototype**: a static single-page app
deployed to Cloudflare Pages. It has **no backend, no authentication, and no real
user data** — all data in the app is synthetic and committed to this public repo.
Anything a user authors in "Author mode" stays in their own browser `localStorage`
and is never transmitted.

Because of that, the meaningful attack surface is the **delivery pipeline** (what
ships to a visitor's browser) rather than data confidentiality.

## Supported

| What | Status |
| --- | --- |
| `main` branch / the live site (`strategy-cockpit.pages.dev`) | supported |
| Any other branch, fork, or local build | not supported |

## Reporting a vulnerability

Please report privately via GitHub's **"Report a vulnerability"** button on the
[Security tab](https://github.com/ViralGoodAgile/strategy-cockpit/security/advisories/new)
(private vulnerability reporting is enabled). Do **not** open a public issue for a
security report.

We aim to acknowledge a report within a few days. As an unfunded prototype there is
no formal SLA or bounty.

## Hardening already in place

- Branch protection on `main` (required CI checks, linear history, no force-push).
- All GitHub Actions pinned to commit SHAs; SHA pinning enforced repo-wide.
- Dependabot alerts + automated security updates; dependency review on PRs.
- Least-privilege workflow token (`contents: read`); deploy secret only used on
  push to `main`, never exposed to PR builds.
- Strict Content-Security-Policy + HSTS, X-Frame-Options, Referrer-Policy and
  Permissions-Policy on the deployed site.
