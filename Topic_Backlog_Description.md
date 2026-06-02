# Topic backlog — how it works

## Purpose

The topic backlog is the central memory of the exec team. Every problem, opportunity, decision, or positive development raised across any leadership forum — weekly ELT, monthly business review, sales review, board — lands in one place. Nothing gets lost between meetings, and the CEO can see the full picture without attending every room.

---

## Where topics come from

Topics enter the backlog from three sources. The primary one is meeting capture: when the AI secretary processes a meeting, it automatically extracts every issue, decision, and unresolved discussion and sends it to the backlog, pre-filled with a suggested category, priority, owner, and forum. The second source is manual entry via the "Add topic" button — for anything the CEO or a team member wants to track that didn't come from a meeting. The third source, in the full product, will be other apps: a process drift detected by the Processes app, a role gap flagged by the Talents app, or an alert from the scorecard.

---

## The list view

The list shows all topics at a glance with six columns: topic, category, priority, owner, tags, and status. Topics are sortable by any column and filterable by category, priority, tag, or owner. The filter chips at the top are the quick way to narrow the view — for example, filtering to "High priority" before a Monday ELT, or to "Marc" before a 1-1.

Each topic has two attributes set by the AI and overridable by the user: category (Strategic or Tactical) and priority (High, Medium, Low). The small pencil icon on the category badge signals it is editable — clicking it lets the user reassign. Tags are user-defined with a chosen color and can be anything — Finance, Sales, IT, HR — giving teams a way to filter by their own vocabulary on top of the system categories.

Status tracks where each topic is in its lifecycle: Not started, In progress, or Completed.

When the AI has identified a potential link between a topic and another topic in the backlog, a small link icon appears next to the topic title in the list. This signals that a match exists without cluttering the view — the detail is only visible when the deep dive is opened.

---

## The topbar buttons

**Analyse all** triggers the AI to process every topic in the backlog that does not yet have an AI opinion — generating root cause, flag, and recommendation for each one in a single batch. In a live product this would run automatically as topics arrive from meeting capture. In the demo it is a setup action: run it once before a session so every row is already populated.

**Add topic** opens a form for manual entry. The user fills in the topic description; the AI suggests a category, priority, and owner based on the company context, which the user can accept or override.

**Inform AI** opens a free-text input where the CEO can share context the AI doesn't have — a conversation that happened outside the product, a decision that was made verbally, a constraint the AI should factor into its opinions. The AI processes the input, updates its understanding of the company context, and adjusts its opinions and suggestions across the backlog accordingly. This button is also present in the Goal setting module.

---

## The deep dive panel

Clicking any row opens the deep dive panel on the right without leaving the list. The panel shows:

**Header** — topic title and its metadata (category, priority, status, tags).

**Description** — where and when the topic was raised, and what was said.

**Owner · Forum** — who is responsible and which meeting should resolve it.

**Root cause** — the AI's hypothesis for why this problem exists or this topic matters.

**AI opinion** — the most important section. It contains a flag (in red) identifying what is missing or wrong — no owner, no deadline, no decision taken, wrong forum, insufficient information — followed by a direct recommendation for what should happen next, who should own it, and by when. This is what makes the backlog opinionated rather than just a list.

**Risk if unresolved** — what happens if this topic is ignored for the next 30 days.

**Possibly the same topic** — see below.

---

## Possibly the same topic

The AI continuously scans the full backlog — open and resolved topics — and flags pairs that appear to share the same root cause or describe the same underlying problem from a different angle. When a match is found with sufficient confidence, it appears in this section of the deep dive as a card showing the matched topic's title, its current status, and a one-line explanation of why the AI thinks they are connected.

The user has three options for each match: confirm the link (the two topics are formally connected, visible on both), dismiss it (the AI's suggestion was wrong), or merge (the two topics are the same thing and should become one — available only when both topics are open).

When a match points to a resolved topic, only confirm and dismiss are available. This case is particularly useful: it surfaces how a similar problem was handled before, giving the CEO a starting point rather than starting from scratch.

When there are no matches for a topic, this section does not appear. An empty state is not shown — absence of the section means no matches were found.

---

## The four action buttons

Each button opens a configuration step before executing.

**Gather more information** is for topics where the AI has flagged that there is not enough context to make a good decision. Clicking it opens a step where the AI proposes a list of questions to answer, the user validates or edits them, and the AI drafts and sends emails via the CEO's email account to the relevant people. The answers come back and update the topic's description and AI opinion.

**Put on agenda** routes a topic to a specific meeting. Clicking it opens a step showing the available upcoming forums with their next date and current agenda load. The user selects a forum, the topic is added to that meeting's agenda in the Meeting preparation module, and the owner is notified.

**Create a project or goal** moves a topic from discussion to execution. Clicking it opens a step in which the AI drafts an objective and key results based on the topic description and the company context. The user edits and confirms, and the goal appears in the Goal setting module linked back to the originating topic.

**Ask a Catalyze Expert** escalates the topic to a human Catalyze Expert for a recommendation. Clicking it opens a step where the AI drafts a structured briefing — summarising the topic, the context, the AI opinion, and the specific question being asked — and presents it to the user for review. The user can edit the text before sending. Once confirmed, the briefing is sent to Catalyze and the Expert responds directly.
