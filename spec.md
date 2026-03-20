# Stake Note

## Current State
New project with no existing application logic.

## Requested Changes (Diff)

### Add
- Personal diary/journal app with user authentication
- Create, read, update, delete diary entries
- Each entry has: title, body text, date, mood tags
- Search entries by keyword
- Entry list sidebar + main editor view layout

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend: Motoko actor with authorization, CRUD for diary entries (title, body, date, tags, owner)
2. Frontend: Two-column layout — sidebar with entry list + search, main pane with editor
3. Auth-gated: users only see and manage their own entries
