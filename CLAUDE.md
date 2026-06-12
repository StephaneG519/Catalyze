# CLAUDE.md — Catalyze Prototype

Read this file at the start of every Claude Code session. It prevents incorrect
assumptions and saves context tokens.

---

## Tech stack

Plain HTML/CSS/JS prototype — no build step, no framework, no bundler. Five HTML
files served by a minimal Node.js static file server (`server.js`, port 3000).
A shared config file (`catalyze-config.js`) is loaded via a `<script>` tag before
each module's own `<script>`. The shell (`index.html`) renders a fixed sidebar and
an `<iframe>` that swaps between modules. All AI calls go directly to
`https://api.anthropic.com/v1/messages` from the browser using model
`claude-sonnet-4-5`. Cross-module state is stored exclusively in `localStorage`.

---

## Fictional company context

**Meriaux & Fils** — B2B distribution, ~85 employees, ~€18M revenue.  
Leadership team (used in all AI prompts and avatar colours):

| Name   | Role           |
|--------|----------------|
| Thomas | CEO            |
| Sarah  | COO            |
| Marc   | Sales Director |
| Julie  | Finance Director |
| Pierre | Ops Director   |

The `COMPANY_CONTEXT` string in `catalyze-config.js` is injected as the `system`
field in every API call. Do not alter it without updating all module prompts.

---

## File structure

```
index.html              — Shell: sidebar nav + iframe
catalyze-config.js      — Shared: COMPANY_CONTEXT, COLORS, AVATAR_COLORS, getApiKey(), setApiKey(), maskApiKey()
meeting_capture.html    — Module 1: Meeting list + deep-dive analysis
topic_backlog.html      — Module 2: Topic table + AI analysis + info gathering
goal_setting.html       — Module 3: Goal table + KR tracking + automated check-ins
meeting_prep.html       — Module 4: Upcoming meetings + agenda builder + pre-reads
server.js               — Local dev server (Node.js, port 3000, no dependencies)
```

---

## localStorage schema (10 keys — all prefixed `catalyze_`)

| Key | Writer | Reader | Shape |
|-----|--------|--------|-------|
| `catalyze_api_key` | `catalyze-config.js` (`setApiKey`) | all modules (`getApiKey`) | string (raw API key) |
| `catalyze_meetings` | `meeting_capture.html` (`saveMeetings`) | `meeting_capture.html` (`loadMeetings`) | `Meeting[]` — only `_userAdded: true` meetings are persisted; seed data lives in code; user-added meeting ids are `Date.now()`-based |
| `catalyze_backlog_topics` | `meeting_capture.html` (`saveBacklogTopics`) | `topic_backlog.html` (`loadFromLocalStorage`), `meeting_prep.html` (`getTopicsForMeeting`) | `StoredTopic[]` — `{title, category, priority, owner, forum, rationale, source, status, tags, _new, meetingId}` |
| `catalyze_goals` | `meeting_capture.html` (`saveGoalsFromTopics`), `topic_backlog.html` (`createGoalFromTopic`), `goal_setting.html` (`saveGoals`) | `goal_setting.html` (`loadGoals`) | `Goal[]` — only `autoCreated: true` goals from localStorage are merged into seed data |
| `catalyze_commitments` | `meeting_capture.html` (action plan send) | `meeting_capture.html` (`isPlanSent`, `openDeleteModal`) | `{meetingId, topicTitle, owner, sentAt}[]` |
| `catalyze_pending_backlog` | `meeting_capture.html` (`savePendingBacklog`) | `meeting_capture.html` (`loadPendingBacklog`, `checkPendingBacklog`, `sendBacklogNow`) | `{meetingId, topics[], scheduledAt, status: 'scheduled'\|'sent'\|'orphaned'}[]` — topics are pre-filtered at schedule time; `orphaned` means the source meeting was not found at flush time |
| `catalyze_info_requests` | `topic_backlog.html` (`saveInfoRequest`) | `topic_backlog.html` (`getInfoRequest`, `renderDD`) | `{ [topicId]: {topicId, topicTitle, owner, generatedAt, questions[], emailSubject, emailBody, status, sentAt?} }` |
| `catalyze_followups` | `goal_setting.html` (`appendFollowup`, `updateNextDraft`) | `goal_setting.html` (`loadFollowups`, `getKrHistory`) | `{ "goalId_krIdx": [{goalId, krId, owner, krText, sentAt, message:{subject,body}, status}], _nextDraft? }` |
| `catalyze_agenda_topics` | `topic_backlog.html` (`doAction agenda`), `goal_setting.html` (`doAction agenda`) | `meeting_prep.html` (`getTopicsForMeeting`) | `{title, owner, priority, forum, topicId?, goalId?}[]` |
| `catalyze_meeting_prep` | `meeting_prep.html` (`saveTopicState`) | `meeting_prep.html` (`loadTopicState`) | `{ [meetingId]: { [topicId]: boolean } }` — include/exclude state per meeting |

---

## Navigation architecture

`index.html` is the shell. Navigation between modules is done in two ways:

1. **Sidebar click** — sets `iframe.src` directly.
2. **postMessage** — any module can send `{ type: 'navigate', src: 'target.html', highlight?: string, forum?: string }` via `window.parent.postMessage(...)`. The shell listens and calls `navigateTo()`.
   - `highlight` is consumed by `topic_backlog.html` (scrolls to matching topic).
   - `forum` is consumed by `meeting_prep.html` (auto-selects matching meeting).

Modules that trigger navigation:
- `meeting_capture.html` → `topic_backlog.html` (Decision quality "View in backlog" links)
- `topic_backlog.html` → `goal_setting.html` (after "Create a goal" action)
- `goal_setting.html` → `topic_backlog.html` ("View source topic" action)
- `meeting_prep.html` → `topic_backlog.html` ("Backlog" links in topic rows)

---

## Naming conventions

- Functions: camelCase verbs — `renderList`, `selectMeeting`, `saveBacklogTopics`, `openDeleteModal`
- localStorage helpers: `load*`, `save*`, `get*` prefixes
- Overlay/modal open/close: `openModal`/`closeModal` (meeting_capture), `open`/`close` (topic_backlog), `openOv`/`closeOv` (goal_setting, meeting_prep)
- IDs in HTML: kebab-case — `btn-add-meeting`, `modal-action-plan`, `dd-body`
- Seed data arrays: SCREAMING_SNAKE for module-level constants (`MEETINGS`, `BACKLOG_TOPICS`, `DEFAULT_GOALS`, `SUGGESTIONS`, `AGENDA_FIXED`)

---

## Known fragilities — never break these

1. **Boot sequence order** — In every module, `load*` (localStorage merge) must run
   before `renderTable`/`renderList`, which must run before `select*` (deep dive).
   In `goal_setting.html`, `renderSuggest()` must run before `renderTable()`.
   In `goal_setting.html`, the stale-followup cleanup IIFE runs before Boot.
   Do not reorder these.

2. **localStorage merge logic (topic_backlog)** — `loadFromLocalStorage` deduplicates
   by topic title (`existingTitles` Set). Adding a topic whose title already exists
   in seed data silently skips it. Never change this without considering that
   `meeting_capture.html`'s `saveBacklogTopics` also deduplicates by title.

3. **Goal merge logic (goal_setting)** — `loadGoals` only merges items where
   `g.autoCreated === true`. Manually-edited seed goals are never overwritten by
   localStorage. Do not remove the `autoCreated` flag from goals written by
   `meeting_capture.html`.

4. **Anti-spam gates** — `autoSendCheckins` (goal_setting) gates on `THREE_DAYS_MS`
   (259200000 ms). `autoGatherInfo` (topic_backlog) gates on `SEVEN_DAYS_MS`
   (604800000 ms). Never remove these guards — they prevent flooding on every
   page load.

5. **API key prompt fallback** — `getApiKey()` returns `''` (not null) when no key
   is stored. All modules check for a falsy key and either show a toast or prompt
   inline. Never change `getApiKey()` to throw.

6. **`_userAdded` flag** — Only meetings with `_userAdded: true` are written to
   `catalyze_meetings`. Seed meetings are never persisted. The delete button in
   the meeting list only appears on `_userAdded` rows.

7. **`anthropic-dangerous-direct-browser-access: true` header** — Required on all
   direct browser-to-API fetch calls. Never remove it.

---

## Testing & debugging protocol

Rules derived from bugs found in production use of this prototype.

### Test plans for write operations
Any test plan for a feature that writes data (localStorage or future backend)
must include a **delete → re-add cycle** of the parent entity. Verify that
the re-added entity gets a fresh id and that all id-keyed mechanisms
(cascade delete, pending queues, foreign keys) work correctly on the new
entry. Rationale: this cycle exposed the `meetingId` foreign key corruption
caused by sequential id reuse (June 2026 incident).

### Quoting code for diagnosis
When inspecting code to answer a question or diagnose a bug, always
**quote verbatim with exact line numbers** — copy directly from the file
using a Read or Grep tool call. Never retype or paraphrase from memory.
Paraphrasing has produced false typos and a false "no bug" conclusion in
this codebase.

### Reproduce before fixing
Never modify code to fix a bug without a reproduction path first. Instrument
the live system (console monkey-patching, localStorage reads in DevTools)
to confirm the failure before touching any file.

### Entity id generation
Entity ids must be generated with `Date.now()`, never sequentially
(`max + 1` or `array.length + 1`). Sequential ids are silently reused after
deletion and corrupt every id-keyed mechanism: cascade delete, pending
queues, and foreign key lookups. The meeting id in `meeting_capture.html`
was migrated to `Date.now()` after the June 2026 incident; apply the same
rule to any new entity type introduced in future steps.

---

## Current brief version

See `Catalyze_Wedge_Prototype_Brief_v7.md` for the full handoff document.
