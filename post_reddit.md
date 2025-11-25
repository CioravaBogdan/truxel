# Why Claude (Anthropic) Makes Stupid Mistakes When Editing Code

## Context
I'm working on a React Native app (Truxel) and using Claude for code assistance. Here's what happened:

## The Problem
I had a syntax error: **"Duplicate key 'valuePropsBarItems'"** - meaning two properties with the same name in StyleSheet.

## What Claude Should Have Done
Identify which of the two `valuePropsBarItems` was the duplicate and delete ONLY that one, keeping the rest of the code intact.

## What Claude Actually Did
Deleted **58 lines of code** which included:
- `valuePropsBarText`
- `valuePropsBarItems` (the correct one)
- `valuePropsBarItem`
- `valuePropsBarItemText`
- `heroValueProps`
- `heroValueItem`
- `heroValueText`

It basically destroyed an entire section of perfectly working styles, just because one property had a duplicate.

## Fundamental Mistakes:

### 1. **Doesn't Read Instructions Carefully**
I clearly said "move X under Y" and it did something else. I had to stop it and explain again.

### 2. **"Fixes" Errors Through Mass Deletion**
Instead of finding the duplicate line and deleting it, it deleted the entire block of 58 lines. It's like going to a mechanic for a flat tire and they remove your entire engine.

### 3. **Doesn't Verify Impact of Changes**
After deleting 58 lines of styles, it didn't think: "Hmm, are these styles used somewhere in JSX? Will the app crash?"

### 4. **Overconfidence**
After breaking everything, it said "Done! No errors!" - because technically there were no more duplicate errors... because it deleted everything.

### 5. **Doesn't Preserve Working Code**
Basic debugging rule: **DON'T DELETE CODE THAT WORKS**. Add, modify, but don't delete without understanding the consequences.

## The Correct Solution (What It Should Have Done)

```typescript
// WRONG - had two definitions:
valuePropsBarItems: { ... },  // First definition (line 1140)
// ... other styles ...
valuePropsBarItems: { ... },  // Second definition - DUPLICATE (line 1210)

// CORRECT - delete ONLY the duplicate, keep the first definition and all other styles
```

## Conclusion
Claude is very good at many things, but when it comes to surgical code edits, it makes rookie mistakes. The main problem is that it **doesn't read carefully** and **acts too aggressively** when encountering errors.

**Advice for Anthropic:** Train the model to be more conservative with deletions. Better to ask for clarification than to delete working code.

---
*Frustrated but still using Claude because, despite these moments, it's still useful. But you need to be very careful and verify everything it does.*
