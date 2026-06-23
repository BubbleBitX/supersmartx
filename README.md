# SuperSmartX

LinkedIn-first milestone posting tool for turning career updates into polished graphics and platform-aware captions.

## Positioning

SuperSmartX leads with one clear promise:

- set up your profile once
- turn promotions, job changes, certifications, internships, and open-to-work updates into LinkedIn-ready posts quickly
- reuse the same milestone details across multiple platforms with caption logic tuned to each destination

## What it does

SuperSmartX helps a user:

- start from one create hub
- choose a category or template
- fill structured event details
- select one or more publishing platforms
- customize the visual card style
- generate platform-specific copy plus downloadable image assets where a graphic makes sense
- save outputs for reuse later

The current create flow supports:

- visual-first platforms: LinkedIn, X/Twitter, Instagram, Product Hunt
- text-first platforms: Threads, Reddit, Indie Hackers, Hacker News, GitHub, Dev.to, Discord, Substack

## Current product flow

Primary IA:

- `Dashboard` for overview and recent saved work
- `Create` as the single creation hub
- `Saved Work` for reuse and cleanup
- `Profile Setup` for autofill and preview quality
- `Template Library` as a fast-start mode inside the create system

Manual flow:

1. Entry
2. Category
3. Event
4. Platforms
5. Details
6. Style
7. Generate

Template flow:

1. Entry or Template Library
2. Template
3. Details
4. Style
5. Generate

Saved work flow:

1. Generate content
2. Review in `Saved Work`
3. Reuse an item through `/create?reuse=...`

## Platform-aware output behavior

The generator now maps outputs by platform shape instead of flattening everything into one caption.

- LinkedIn, X, Threads, Instagram: `caption`
- Reddit: `title` + `body`
- Product Hunt: `tagline` + `description` + optional graphic
- Indie Hackers: `body`
- Hacker News: `title` + `body`
- GitHub: `description` + `body`
- Dev.to: `outline`
- Discord: `announcement`
- Substack: `body`

The output editor also shows:

- per-field character targets
- direct copy for each field
- copy-all for multi-part outputs
- safer native share buttons for LinkedIn and X when the primary text is within the current target limit

## Export formats

Current export presets:

- Universal: `1080 x 1080`
- LinkedIn Feed: `1080 x 1350`
- Instagram Feed: `1080 x 1350`
- X / Twitter: `1200 x 675`

## Templates and categories

The app includes quick-start templates across:

- Achievement
- Career
- Founder
- Creator
- Events
- Newsletter

Custom event options are also available inside each category for flexible announcements.

## Stack

- Next.js 16
- React 19
- TypeScript
- `html-to-image` for PNG export

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production deployment

Copy `.env.example` to `.env` and fill in your production secrets. Then run:

```bash
npm run launch:check
npm run verify
npm run build
```

The production app URL should be `https://supersmartx.com`.

For Supabase OAuth, add `https://supersmartx.com/auth/callback` as a redirect URL in your Supabase auth provider settings.

## Useful commands

```bash
npm run lint
npx tsc --noEmit
```

## Project areas

- [components/create/CreateFlow.tsx](/C:/Users/heman_naocpgi/Downloads/supersmartx/components/create/CreateFlow.tsx)
- [lib/platforms/index.ts](/C:/Users/heman_naocpgi/Downloads/supersmartx/lib/platforms/index.ts)
- [lib/platforms/caption-engine.ts](/C:/Users/heman_naocpgi/Downloads/supersmartx/lib/platforms/caption-engine.ts)
- [lib/events/categories.ts](/C:/Users/heman_naocpgi/Downloads/supersmartx/lib/events/categories.ts)
- [lib/templates.ts](/C:/Users/heman_naocpgi/Downloads/supersmartx/lib/templates.ts)
- [docs/user-flows.md](/C:/Users/heman_naocpgi/Downloads/supersmartx/docs/user-flows.md)

## Notes

- X/Twitter is currently modeled with a safe `280` character default in the UI. Premium accounts may allow longer posts, but the app uses the safer baseline for generation and native-share gating.
- Text-first platforms no longer show a fake image preview. The style step now makes it explicit when the final output is content-only.
