# Knowledge Base

## Bookmark Icon Not Updating After Save
- Root cause (from legacy Bookmark Instant Update Fix doc): the community feed reused the same `posts` array reference after calling `savePost`, so React skipped re-rendering and bookmark icons stayed gray until the user switched tabs.
- Fix: when updating bookmark state, always create a new `posts` array (e.g., `set({ posts: state.posts.map(...) })`) so each PostCard recalculates `isSaved` immediately.
- Reminder: when mutating Zustand stores shared between tabs, emit new references for both `posts` and `savedPosts` collections to keep UI badges in sync.

## "The expected package.json path ... does not exist" Error
- Cause (from deprecated QUICK_START guide): CLI commands were executed from the wrong directory, so Node looked for `package.json` in `C:\Users\<user>` instead of the Truxel repo.
- Fix:
  1. `cd` into the Truxel workspace (verify with `dir`/`ls` that `package.json` is present).
  2. Re-run the script (`npm install`, `npx expo start`, etc.).
- Troubleshooting checklist: make sure shells launched via VS Code/Terminal default to the repo path or run `Set-Location E:\truxel` before executing npm scripts.
