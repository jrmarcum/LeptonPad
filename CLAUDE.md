# LeptonPad — Claude Code Context

**This file is a pointer, not the memory.**

All project memory for LeptonPad lives in **[`cmem/`](cmem/)** — a tracked, portable directory that
travels with the repository (clone, USB drive, another machine). Nothing about this project is stored
in a machine-local memory directory.

## Start here

👉 **Read [`cmem/INDEX.md`](cmem/INDEX.md) first.** It carries the policy, the binding triggers, and a
one-line pointer to every topic file.

| Read this                                        | When                                               |
| ------------------------------------------------ | -------------------------------------------------- |
| [`cmem/INDEX.md`](cmem/INDEX.md)                 | Always — policy, triggers, file map                |
| [`cmem/collaboration.md`](cmem/collaboration.md) | Before your first reply of a session               |
| [`cmem/overview.md`](cmem/overview.md)           | Getting oriented — layout, key files, mental model |
| [`cmem/conventions.md`](cmem/conventions.md)     | Before touching CSS, unit rendering, or imports    |
| [`cmem/known-issues.md`](cmem/known-issues.md)   | Before trusting anything that looks like config    |

## The one rule

When Jon says **"update the project memory"** — fold the change into the matching `cmem/` topic
file(s), refresh its pointer in the `cmem/INDEX.md` Files table, and sync `readme.md` only where the
change is user-facing. **Do not write project memory into this file**; it will not be read as memory
and content added here duplicates what `cmem/` owns.

---

_Historical note: until 2026-08-13 this file held all project memory while being listed in
`.gitignore` — so it never travelled with the repo despite claiming to. `cmem/` fixes that;
`CLAUDE.md` is now tracked and deliberately thin. See `cmem/known-issues.md` §3._
