# Guide: Writing and Improving AGENTS.md Files

This guide captures the principles used to structure this project's agent instructions.

## Core Principle: Progressive Disclosure

Instructions should be layered. The root `AGENTS.md` is read on every task — keep it minimal. Detail lives in `.agents/` sub-files, linked from the root, and loaded only when relevant.

## What Belongs in Root AGENTS.md

Include only what is **relevant to every single task**:

- One-sentence project description
- Package manager (if not npm)
- Non-standard build/test/lint commands
- Universal rules (e.g. "write tests for new functionality")
- Tooling preferences that override default agent behavior (e.g. prefer Serena MCP over grep)
- Links to `.agents/` sub-files

If you're unsure whether something belongs in root, ask: *would ignoring this on a typical small task cause a mistake?* If no, move it to a sub-file.

## What Belongs in `.agents/` Sub-files

Group related instructions into focused files:

| File | Contents |
|---|---|
| `conventions.md` | Project-specific code style rules |
| `nx.md` | Monorepo / build system guidelines |
| `workflow.md` | PR, documentation, and release processes |
| `testing.md` | Testing patterns, when to use each test type |
| `api.md` | API design rules, GraphQL conventions |

Create a new file when a group has 3+ instructions or covers a distinct domain.

## What to Cut

Flag instructions for removal if they are:

| Category | Example |
|---|---|
| **Redundant** — the agent already knows this | "Use camelCase in TypeScript" |
| **Vague** — not actionable | "Follow normal conventions" |
| **Obvious** — condescending to the agent | "Write clean code" |

When in doubt, cut. Noise in instructions degrades signal.

## Review Checklist

When editing `AGENTS.md` or any `.agents/` file:

- [ ] Could this instruction go in a sub-file instead of root?
- [ ] Is every instruction specific and actionable?
- [ ] Are any instructions redundant with standard language/framework conventions?
- [ ] Are links from root `AGENTS.md` to sub-files up to date?
- [ ] Are MCP/tooling preferences stated where the default agent behavior would differ?
