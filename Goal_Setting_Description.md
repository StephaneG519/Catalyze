# Goal setting — how it works

## Purpose

The goal setting module is where topics from the backlog become commitments. It tracks what the company has decided to achieve, who owns it, whether it is moving, and whether it is aligned with the company's priorities. It is not a standalone goal tracker — it is connected to the topic backlog, fed by the AI, and visible to the CEO without requiring owners to log in and update manually.

---

## Where goals come from

Goals enter the module from three sources.

The primary source is the topic backlog. When the CEO clicks "Create a project or goal" on a topic, the AI drafts an objective and key results based on the topic description and company context. The CEO reviews, edits, and confirms — and the goal appears here, linked back to the originating topic.

The second source is manual entry via the "Add goal" button. The CEO or a team member fills in the goal description; the AI suggests a structure (OKR or simple), an owner, and a deadline based on the context, which the user can accept or override.

The third source is the AI itself. The AI continuously monitors the topic backlog and flags gaps in goal coverage — topics that are open, high priority, and not yet covered by any goal. These appear as suggestions in the banner above the list.

---

## Goal structure — OKR or simple

Two structures are supported, and the choice is flexible per goal.

An OKR has an objective — a qualitative statement of what needs to be achieved — and 2–4 key results, each a measurable outcome with a target and a deadline. The goal is considered achieved when the key results are hit.

A simple goal has a single statement of what needs to happen, an owner, and a deadline. No key results. Used for topics where the outcome is clear and binary, or where the team is not ready for the full OKR structure.

The type is shown in the deep dive, not the list view, to keep the list uncluttered.

---

## The AI suggestion banner

When the AI identifies a gap in goal coverage — a high-priority topic with no corresponding goal — it surfaces a suggestion in the banner above the list. The banner shows one suggestion at a time, with a counter indicating how many suggestions exist in total (e.g. "1 / 3"). The user can navigate between suggestions using the left and right arrows without dismissing them.

Each suggestion has two actions: "Create goal" opens the goal creation flow pre-filled with the AI's draft, and "Dismiss" removes the suggestion from the queue. When a suggestion is acted on or dismissed, the counter decreases and the next suggestion is shown automatically. Suggestions are ordered by priority — the most urgent gap is always shown first.

---

## The list view

The list shows all goals with five columns: goal, owner, progress, alignment, and status. Goals are sortable by any column and filterable by status, owner, or time period.

The progress bar shows overall completion as a percentage — for OKRs, this is the average across all key results; for simple goals, it is manually set by the owner. The bar colour reflects status: green for on track, amber for at risk, red for off track.

Alignment indicates whether the goal connects to the company's stated priorities as assessed by the AI: Aligned, Partial, or No alignment. This is shown as a badge and explained in the deep dive.

Status has five states: Not started, On track, At risk, Off track, Completed.

---

## The "Inform AI" button

The "Inform AI" button sits in the topbar and is also present on the topic backlog. It opens a free-text input where the CEO can share context the AI doesn't have — a conversation that happened outside the product, a decision that was made verbally, a constraint the AI should factor into its opinions and suggestions. The AI processes the input, updates its understanding of the company context, and adjusts its opinions and suggestions accordingly.

---

## The deep dive panel

Clicking any row opens the deep dive panel on the right. The panel shows:

**Header** — goal title and its metadata (type, status, alignment).

**Objective** — the qualitative statement of what needs to be achieved (OKR only; for simple goals, this is the goal statement).

**Owner · Deadline** — who is responsible and by when.

**Key results** (OKR only) — each KR shown as a card with its description, a progress bar, a percentage, a due date, and a "last updated" timestamp. If a KR has not been updated recently relative to its deadline, the timestamp turns red. This is the primary signal the CEO uses to identify stalled KRs without asking the owner directly.

**AI opinion** — flags what is wrong or missing at the goal or KR level, and gives a specific recommendation. When a KR timestamp is red, the AI opinion will reference it directly — connecting the stale update to the risk it represents.

**Type · Source** — whether the goal is an OKR or simple, and a clickable link back to the originating topic in the backlog. If the goal was created manually, no source link is shown.

---

## Progress updates — how they work

Progress is updated by owners via email, not by logging into the product. Catalyze sends a recurring check-in email to each owner showing their specific goals and KRs, their current progress, and their deadlines. The owner replies in plain language — no format required. The AI processes the response, extracts the update, and applies it to the relevant KRs. After processing, the CEO sees a confirmation of what the AI understood before it is saved, and can correct any misinterpretation.

The "Update progress" button in the deep dive panel allows the CEO or owner to update a goal manually from within the product — opening a small form where each KR can be updated with a new percentage and an optional comment.

---

## The four action buttons

**Update progress** is the primary action — styled distinctly to signal it is the most common interaction in the deep dive. Opens a form to update each KR's progress and add a comment. The comment is stored and visible in the goal history.

**View source topic** jumps to the originating topic in the topic backlog. Available only when the goal was created from a topic. Useful when the CEO needs to revisit the original context or the AI opinion on the underlying issue.

**Add to meeting agenda** routes the goal to a specific forum. Opens a step showing upcoming meetings with their agenda load. The CEO selects a forum and the goal is added to that meeting's agenda in the Meeting preparation module.

**Ask a Catalyze Expert** escalates the goal to a human Catalyze Expert. The most relevant use cases are: a goal is off track and the CEO wants a human perspective on whether the objective itself is wrong or just the execution; a key result target is being contested by the owner and an external opinion is needed; or the goal requires a structured intervention — a renegotiation, an org change, a recovery plan — that goes beyond what the AI can design. Clicking it opens a step where the AI drafts a structured briefing summarising the goal, its current state, and the specific question being asked. The CEO reviews and edits before sending.
