# ONEIROX Reanimation — Master Plan

Baseline HEAD: 011dd9974c37f4ef93ad5c825f5f94ffc2e17f7a
Date: 2026-09-23

## Current facts

- GSC last 28 days: ~117 impressions, 2 clicks.
- Current crawl/index issue counts: 124 redirect, 24 404, 135 crawled-not-indexed, 4 redirect errors, 1 noindex, 44 canonical alternatives, 14 robots-blocked, 54 discovered-not-indexed.
- Current sitemap architecture at baseline: 30 core + 50 dreams + 16 somatic = 96 submitted URLs.
- Sitemaps at baseline do not submit current redirect URLs.
- Lab Search regression suite exists and passed at baseline.
- Third-party SEO data sees very low current authority/traffic; use it only as directional evidence, never as a Google metric.

## Root causes prioritized

### P1 — Scientific overstatement
Several pages turn plausible dream theories into confident biological claims. This weakens the core product promise and trust.

### P1 — Synthetic pillar padding
Non-Gold dream pillars append generated long-form prose that repeats product language, internal keys, and deterministic mechanism claims. This is low-value text and dilutes search intent.

### P1 — Search relevance is too narrow
Google is testing a few dream pages, but the site has very little non-brand query coverage. Fix quality and intent before expanding page count.

### P1 — Historical crawl residue
Large GSC redirect/404/crawled-not-indexed counts include legacy WordPress and older PSEO URLs. Reconcile before "fixing" raw counts.

### P2 — Authority
External authority is weak. Do not start link acquisition until the science/editorial layer is trustworthy and stable.

## Execution order

1. Science integrity standard + methodology repair.
2. Remove synthetic long-form padding from pillars.
3. Rewrite highest-value pillars (Why We Dream, Teeth, Being Chased, Falling) with evidence boundaries.
4. Correct REM mechanics pages and lunar claims.
5. Rebuild dream SSG only; rebuild Lab Search index; run audits/tests.
6. Review diff before commit.
7. Next batch: audit remaining 23 pillars and 10 Gold pages against the science standard.
8. Then reconcile GSC URL samples: current indexable vs redirect vs noindex vs blocked vs missing.
9. Decide whether the 12 non-Gold indexable LF scenarios should be Gold-converted, merged, or demoted. No indexability change without a separate review.
10. Only after content/indexability cleanup: keyword opportunity + internal linking + external authority campaign.

## Deployment rule

No commit, push, or production deploy until:
- pseo:dreams:build PASS
- pseo:audit PASS
- pseo:audit:crawl PASS
- pseo:lab-search:test PASS
- diff reviewed
- no accidental changes to unrelated generated pages
