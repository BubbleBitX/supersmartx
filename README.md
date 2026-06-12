# SuperSmartX

Personal branding announcement platform for turning milestones into polished, platform-aware post assets.

## What it does

SuperSmartX helps a user:

- choose a category or template
- fill structured event details
- select one or more publishing platforms
- customize the visual card style
- generate platform-specific copy plus downloadable image assets where a graphic makes sense

The current create flow supports:

- visual-first platforms: LinkedIn, X/Twitter, Instagram, Product Hunt
- text-first platforms: Threads, Reddit, Indie Hackers, Hacker News, GitHub, Dev.to, Discord, Substack

## Current product flow

Manual flow:

1. Category
2. Event
3. Platforms
4. Details
5. Style
6. Generate

Template flow:

1. Template
2. Details
3. Style
4. Generate

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

## Notes

- X/Twitter is currently modeled with a safe `280` character default in the UI. Premium accounts may allow longer posts, but the app uses the safer baseline for generation and native-share gating.
- Text-first platforms no longer show a fake image preview. The style step now makes it explicit when the final output is content-only.
