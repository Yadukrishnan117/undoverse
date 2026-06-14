# UX Copy Guide — undoverse.in

| | |
|---|---|
| **Project** | undoverse.in |
| **Document** | UX Copy Guide |
| **Version** | 1.0 |
| **Date** | 2026-06-15 |
| **Owner** | 72BPM, Trivandrum, Kerala |
| **Author** | Yadukrishnan K H — yadu@chargemod.com |

This guide is the single source of truth for the words on undoverse.in. If you're writing UI text, a button label, an error, or an email — it should sound like it came from here.

---

## 1. Brand Voice Principles

undoverse is the hub for the undo ecosystem, built by 72BPM in Trivandrum. We talk to builders the way one builder talks to another — directly, warmly, and without corporate fog.

1. **Human, not corporate.** Write like a person, not a press release. Contractions are fine. No "leverage", "synergy", "seamless solutions", or "empowering". If you wouldn't say it out loud to a friend, don't ship it.
2. **Kerala-proud, quietly.** We're from Trivandrum and we like it. A light Malayalam/Kerala touch is welcome where it lands naturally (and is understood) — never forced, never a gimmick, never at the cost of clarity for someone outside Kerala.
3. **Developer-native.** Our audience builds things. Respect their time and intelligence. Use the right technical word when it's the clearest word; don't over-explain; don't dumb down.
4. **Encouraging, not hype.** Celebrate making things. We hype the *builder's* work, not our own platform. No exclamation-mark confetti on every screen.
5. **Honest and specific.** Say what happened and what to do next. Never blame the user. Never hide an error behind a smiley.

**Always / Never**

| Always | Never |
|---|---|
| "Sign in with GitHub" | "Authenticate via OAuth provider" |
| "We couldn't save that. Try again." | "An unexpected error occurred." |
| "No projects yet — be the first to ship one." | "No data available." |
| Plain verbs: ship, submit, upvote | Buzzwords: leverage, empower, unlock |

---

## 2. Tone Variations

The voice is constant; the **tone** flexes with context.

| Context | Tone | Notes |
|---|---|---|
| **Hero / marketing** | Playful, confident, proud | A little personality, a little Kerala. This is where we smile. |
| **Forms / labels** | Clear, minimal, instructive | Tell people exactly what to type. No jokes here. |
| **Errors** | Calm, helpful, blameless | State the problem + the fix. Never "you did X wrong." |
| **Success** | Warm, brief, celebratory | One line of genuine delight, then get out of the way. |
| **Onboarding** | Friendly, guiding | Short. One idea per step. |
| **Empty states** | Encouraging, inviting | Turn emptiness into an invitation to act. |

---

## 3. Key Copy Decisions (before / after)

### 3.1 Hero
- **Headline (final):** **"Where the undo gets built."**
- **Subheadline (final):** "undoverse is the home of the undo ecosystem — discover what builders are shipping, and add your own. Made in Trivandrum."

| Before | After | Why |
|---|---|---|
| "The all-in-one platform empowering developers to showcase innovative solutions." | "Where the undo gets built." | Shorter, owns our niche, no buzzwords. |
| "Join thousands of developers building the future." | "Discover what builders are shipping, and add your own." | Honest (no fake "thousands"), action-oriented, uses *builder*. |

### 3.2 CTAs
| Action | Copy | Avoid |
|---|---|---|
| Primary sign-in | **Continue with GitHub** | "Login", "Authenticate" |
| Submit a project | **Ship a project** | "Publish", "Create listing" |
| Upvote | **Upvote** (toggles to **Upvoted**) | "Like", "Vote up", "+1" |
| Explore | **Browse the undoverse** | "Explore solutions" |
| Profile edit | **Edit profile** | "Manage account settings" |
| Save | **Save changes** | "Submit form" |

### 3.3 Empty States
- **No projects (hub):** "Nothing here yet. The undoverse is waiting for its first project — **ship one**."
- **No search results:** "No matches for *"{query}"*. Try a different spelling, or **browse everything**."
- **No projects on a builder profile (owner):** "You haven't shipped anything yet. Your first project goes here — **ship one**."
- **No projects on a builder profile (visitor):** "@{handle} hasn't shipped a project yet. Check back soon."
- **No builders / quiet feed (changelog):** "It's quiet for now. When builders ship, you'll see it here first."

### 3.4 Error Messages
**Form validation (inline, beside the field):**
| Field | Message |
|---|---|
| Name empty | "Give your project a name." |
| Slug taken | "*{slug}.undoverse.in* is taken. Try another." |
| Slug invalid | "Subdomains use lowercase letters, numbers, and hyphens only." |
| Slug reserved | "That subdomain is reserved. Pick a different one." |
| URL invalid | "That doesn't look like a valid URL — include https://" |
| Tagline too long | "Keep the tagline under 80 characters." |

**API / system errors (toast or panel):**
| Situation | Message |
|---|---|
| Save failed (generic) | "We couldn't save that. Give it another go — your work isn't lost." |
| Upvote failed | "Couldn't register your upvote. Try once more." |
| Not signed in (mutation) | "Sign in with GitHub to do that." |
| Rate limited | "Slow down a sec — you've done that a lot. Try again in a minute." |
| Search backend down | "Search is napping. Showing you the latest projects instead." |

**404 (unknown subdomain or page):**
> **Naah, nothing here.**
> This corner of the undoverse doesn't exist (yet). Head back to the hub and find what does.
> [Back to undoverse.in]

**500 / unexpected:**
> **Something broke on our end.**
> Not your fault. We've been pinged. Try again in a moment.

### 3.5 Success Messages
| Action | Message |
|---|---|
| Project submitted | "Submitted! 🎉 Your project is in review — we'll get it live soon." |
| Project goes LIVE (notify) | "*{name}* is live at {slug}.undoverse.in. Go say hi to your subdomain." |
| Upvoted | "Upvoted. Nice taste." |
| Profile saved | "Saved. Looking good." |
| Changelog posted | "Posted to the feed. The undoverse knows." |

(Use emoji sparingly — at most one, only on genuine milestones like a submission.)

### 3.6 Onboarding Microcopy
- First sign-in welcome: "Welcome to the undoverse, @{handle}. You're a builder now."
- Empty profile nudge: "Add a line about yourself so people know who's behind the builds."
- First submission hint (near slug field): "This becomes your project's address: **{slug}.undoverse.in**. Choose well — it's hard to change later."
- Post-submit waiting state: "In review. We keep the undoverse tidy, so a human takes a quick look before it goes live."

---

## 4. Terminology Glossary

Consistency matters. Use the **left** column, never the right.

| Use this | Not this | Notes |
|---|---|---|
| **builder** | developer, user, member | The people who make things here are builders. |
| **ship** | publish, launch, post | A builder *ships* a project. |
| **submit** (for the review step) | publish, create listing | You *submit* for review; it goes *live* after. |
| **project** | app, tool, product, listing | The unit on the hub is a project. |
| **upvote** | like, vote, +1, star | The appreciation signal is an upvote. |
| **the hub** | the homepage, the portal | The root undoverse.in surface. |
| **the undoverse** | the platform, the ecosystem (in copy) | Use "the undoverse" in user-facing copy; "ecosystem" is fine in docs. |
| **subdomain / address** | URL slug, endpoint | A project's address is its subdomain. |
| **live** | published, active, deployed | A reviewed project is *live*. |
| **in review** | pending approval, awaiting moderation | Status shown to the builder after submit. |
| **Continue with GitHub** | log in, sign up, register | One door; we don't distinguish login vs signup in copy. |
| **the feed** | changelog (in copy), activity stream | "Changelog" is fine in docs; users see "the feed". |

**Capitalisation:** "undoverse" is lowercase. Project names follow the builder's own casing (e.g. currentundo, kuzhiundo, damundo). Sentence case for buttons and headings ("Ship a project", not "Ship A Project").

**Numbers & plurals:** "1 upvote", "2 upvotes". Use real numbers, never fake ("thousands of builders") until they're true.

---

*End of UX Copy Guide v1.0 — undoverse.in — 72BPM, Trivandrum.*
