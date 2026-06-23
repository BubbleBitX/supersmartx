# SuperSmartX User Flows

This document maps the current product behavior for launch-critical flows.

## 1. First Free Template Flow

Entry points
- Landing: `Generate First Template`
- Direct route: `/create`

Behavior
- First generation is available without authentication.
- Guest progress is stored in `localStorage`.
- Refresh restores the in-progress guest draft in the same browser.
- The first generated output can be downloaded immediately.
- Account creation is requested only when the user tries to create again or explicitly save the draft.

```text
User opens landing page
 -> Clicks Generate First Template
 -> Enters Create Flow directly
 -> Chooses category or template
 -> Selects platforms
 -> Fills details
 -> Adjusts style
 -> Clicks Generate
   -> Success
     -> Output opens immediately
     -> PNG download available for visual platforms
     -> Copy actions available for platform text
     -> Guest draft stays in localStorage
     -> Save prompt appears, but no hard block
```

Recovery
- Refresh during the first guest session restores the draft from `localStorage`.
- If the user signs in after generating the first draft, the generated event is auto-saved to the account timeline.

## 2. Auth Gate on Second Attempt

Entry points
- Guest clicks `Create Another Post`
- Guest clicks `Generate` after already using the first free generation
- Guest clicks `Save This Draft`

Behavior
- An auth modal explains that the first draft can be saved and future generations unlocked.
- Google OAuth, optional GitHub OAuth, and email sign-in/up entry points are shown based on environment configuration.
- After auth callback, the user returns to `/create?resume=guest`.
- The guest draft remains available and is migrated into account storage.

```text
Guest completes first output
 -> Clicks Create Another Post
   -> Auth modal opens
 -> User signs in
   -> Returns to /create?resume=guest
   -> Guest draft is restored
   -> First generated event is auto-saved to timeline
```

## 3. Manual Create Flow

```text
User opens Create
 -> Entry screen
 -> Category
 -> Event
 -> Platforms
 -> Details
 -> Style
 -> Output
```

Important states
- Platform step supports multi-select plus `Select All` and `Clear to Default`.
- Text-first platforms skip fake graphic expectations and stay copy-first.
- Visual-first platforms support native export presets.

## 4. Template Flow

```text
User opens Template Library
 -> Picks template
 -> Enters Create with preselected structure
 -> Fills details
 -> Adjusts style
 -> Generates output
```

Current note
- The library is publicly reachable.
- Template browsing is still simpler than the long-term target filter system.

## 5. Post-Auth Saved Work

```text
Authenticated user generates output
 -> Event saved to timeline
 -> User opens saved work
 -> Reuses a prior event or starts another
```

## 6. Primary Risks Still To Improve

- Template library filtering and preview depth are still limited.
- Rich text editing is not implemented in the details step.
- Guest recovery does not yet persist every possible uploaded asset variant.
