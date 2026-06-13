# SuperSmartX User Flows

This document maps how users move through the product. It focuses on completion, failure recovery, and likely drop-off points rather than screen visuals.

## 1. Create Event (Manual Flow)

Entry Points
- Landing: `Start Creating Free`
- Dashboard: `New Event`
- Dashboard: category shortcuts
- Direct route: `/create`

Exit Points
- Output complete -> copy, download, share, or start new event
- Back out to Dashboard
- Abandon before generate

```text
User enters SuperSmartX
 -> Opens Create
 -> Lands on Category
 -> Selects category
 -> Lands on Event Type
 -> Selects event type
   -> Chooses custom event
     -> Custom field set loads
 -> Lands on Platforms
 -> Selects one or more platforms
   -> Selects no platform
     -> Cannot continue
     -> Select platform
 -> Lands on Details
 -> Fills required fields
   -> Required field missing
     -> Stays on Details
     -> Fix input
     -> Retry continue
 -> Lands on Style
 -> Chooses theme, format, tone, and layout
   -> Text-only platform selected
     -> Graphic preview is not primary
 -> Clicks Generate
   -> Generation succeeds
     -> Event saved to Timeline
     -> Output opens
     -> User copies text
     -> User downloads graphic if available
     -> User shares to LinkedIn or X if within limits
     -> Exit to Timeline or Create New Event
   -> Export fails
     -> Output still visible
     -> User retries download
     -> Or copies text and exits
```

Drop-off Risks
- Category and event selection can feel repetitive if users already know what they want.
- Platform choice before seeing value may slow first-time users.
- Long details forms can create friction for custom events.
- Style step can feel heavy if the user only wants a fast text post.

## 2. Create Event (Template Flow)

Entry Points
- Landing: `View Templates`
- Public Templates page
- In-app Templates page
- Template SEO page: `/t/[slug]`

Exit Points
- Output complete -> copy, download, share
- Back to Templates
- Abandon on details or style

```text
User opens Templates
 -> Browses categories
 -> Selects template
   -> Opens template detail or goes straight to create
 -> Lands on Template Details
 -> Fills structured fields
   -> Missing required field
     -> Stays on Details
     -> Fix input
 -> Lands on Style
 -> Chooses theme, format, and tone
 -> Clicks Generate
   -> Success
     -> Output opens
     -> User copies text
     -> User downloads graphic if available
     -> User starts new event or returns to Templates
   -> Export fails
     -> Retry export
     -> Or copy-only exit
```

Drop-off Risks
- Users may not understand the difference between templates and manual create.
- Template naming must be specific enough to reduce hesitation.
- If a template asks for too many fields, users may abandon despite the shortcut promise.

## 3. Complete Profile

Entry Points
- Dashboard incomplete-profile banner
- Sidebar `Profile`
- First-time setup intent

Exit Points
- Save complete
- Leave partially completed
- Return to Dashboard or Create

```text
User opens Profile
 -> Sees completion checklist and live preview
 -> Uploads photo
 -> Adds name, role, headline, and company
 -> Adds social links and website
 -> Chooses brand color and theme
 -> Clicks Save Profile
   -> Save succeeds
     -> Success state appears
     -> Sidebar and future forms use saved profile
     -> User exits to Dashboard or Create
   -> User leaves before save
     -> Changes are not committed
     -> Returns later
   -> Image missing or weak profile data
     -> Completion stays partial
     -> Dashboard continues prompting setup
```

Drop-off Risks
- Users may postpone photo and logo upload if they do not immediately see the payoff.
- Too many optional social fields can make setup feel longer than needed.
- If save feedback is subtle, users may not trust that profile data persisted.

## 4. Upgrade to Paid Plan

Entry Points
- Public Pricing page
- In-app `Upgrade`
- Need-based intent after export or feature discovery

Exit Points
- Checkout started
- Payment successful
- User returns to free plan path

```text
User opens Pricing
 -> Compares Free, Pro, and Lifetime
 -> Selects paid plan
   -> Chooses Pro
     -> Checkout starts
   -> Chooses Lifetime
     -> Checkout starts
 -> Payment completes
   -> Success page opens
   -> User clicks Start Creating
   -> Returns to Create
 -> Payment abandoned or fails
   -> User leaves checkout
   -> Returns to Pricing or app
   -> Continues on free path
```

Drop-off Risks
- Value difference between Free and Pro must be obvious before checkout.
- If checkout feels too early, users may leave and continue on the free plan indefinitely.
- Payment success must clearly return users to productive creation, not a dead-end confirmation page.

## 5. Review Timeline

Entry Points
- Dashboard `View All`
- Sidebar `My Timeline`
- Post-generation mental model of saved work

Exit Points
- Open create again
- Filter and review history
- Delete event and leave

```text
User opens Timeline
 -> Timeline empty
   -> Sees empty state
   -> Clicks Create First Event
   -> Moves to Create
 -> Timeline populated
   -> Reviews events by year
   -> Filters by category
   -> Deletes event
     -> Event removed
     -> Timeline updates
   -> Clicks Add Event
   -> Returns to Create
```

Drop-off Risks
- Timeline currently behaves like history, not a workspace, so repeat users may not revisit often.
- Delete without richer recovery can make users cautious.
- If saved events are not visibly reusable, timeline value may feel low.

## Product-Level Friction Themes

```text
User wants fast output
 -> Must choose path
   -> Template path
   -> Manual path
 -> Must understand platform differences
 -> Must fill enough details for quality output
 -> Must trust preview quality
 -> Must complete copy/download/share action
   -> Success
   -> Retry
   -> Abandon
```

Highest-Risk Drop-off Moments
- Path choice: template vs manual
- Platform selection before value is demonstrated
- Long details step for first-time users
- Style complexity for users who only need copy
- Export moment if output quality or download reliability feels weak
