# Community Feed Filter Rebuild Plan

## Why start fresh?
- **Driver tab empty**: `origin_country` is stored as the full name for legacy posts (for example `"Romania"`), but the new filter sends the ISO code (`"RO"`). The current query only matches exact values, so drivers never appear.
- **Duplicated card labels**: both tab sections render the same translation key twice (`AVAILABLE AVAILABLE DRIVERS`). We need badge + label keys instead of reusing the old copy.
- **Divergent logic**: the rewritten `CommunityFeed.tsx` calls store actions in a different order than the working “Available Routes” flow. Resetting to a proven baseline and layering enhancements keeps behaviour predictable.

## Rebuild goals
1. **Mirror the working flow** for tab switching, initialization and pagination, then add the card styling on top.
2. **Store both ISO code and human name** for the country filter, so queries can match either format.
3. **Normalize tab copy** to show a single "Available" badge and a clean title ("Drivers" / "Routes").
4. **Keep the City + Country selectors**, but ensure they simply update shared filter state.

## Recommended implementation path

### 1. Reset the component logic
- Check out the last good version (`origin/main:components/community/CommunityFeed.tsx`) into a scratch file for reference.
- Copy the baseline logic for:
  - Store selectors: `posts`, `selectedTab`, `selectedCity`, `filters`, etc.
  - Effects: initial `loadPosts(true)` on mount + on tab changes.
  - Viewability tracking (`recordView`).
  - Empty/footer renderers.
- Paste that logic into the working file before applying the new UI treatment.

### 2. Re-introduce the new UI pieces carefully
- Add the card-style tab markup, but keep the handler `onPress={() => setSelectedTab('availability')}` identical.
- Replace duplicated translations with two keys:
  - `community.tab_badge_available`: rendered in the small badge.
  - `community.tab_title_drivers` / `community.tab_title_routes`: rendered in the main label.
- Port the country + city controls back in, but wire them through existing store actions (`setSelectedCountry`, `setSelectedCity`) rather than custom state inside the component.

### 3. Fix the filter payload
- In `store/communityStore.ts`:
  - Extend the filter state to include `origin_country_name`.
  - Update `setSelectedCountry` and `initializeFilters` to persist both `country.code` and `country.name`.
- In `services/communityService.ts` `getPosts()`:
  - If both `origin_country` and `origin_country_name` exist, use `.in('origin_country', [code, name])` so either format matches.
  - If only one is present, fall back to `ilike` to be tolerant of punctuation (e.g., “United Kingdom”).

### 4. Confirm translation updates
- Add the new tab keys to every locale file (`en`, `ro`, `pl`, `tr`, `lt`, `es`). Example for English:
  ```json
  "tab_badge_available": "Available",
  "tab_title_drivers": "Drivers",
  "tab_title_routes": "Routes"
  ```
- Update the JSX to use `t('community.tab_badge_available')` and `t('community.tab_title_drivers')` etc.

### 5. Test in stages
1. **Routes tab smoke test**: verify nothing regressed.
2. **Drivers tab**:
   - Without filters → old posts appear.
   - With country selected (`Romania`) → legacy posts still show.
   - Add city filter → query still returns the subset.
3. **Translations**: switch each language to ensure no missing keys.
4. **Pagination / refresh**: scroll to the end of both tabs; pull-to-refresh.

### 6. Clean up and iterate
- Remove any unused imports introduced during porting.
- Re-run linting if configured (`pnpm lint` / `npm run lint`).
- Once everything is stable, capture new snapshots or recordings for QA.

## Personal recommendation
Starting from the last working logic and applying visual changes incrementally is safer than trying to unpick the current diff. Make small commits at each checkpoint (baseline restore → UI restyle → filter payload fix → translations) so we can rollback precisely if a regression sneaks in.

When the core behaviour matches the specification, we can explore extras (direction filters, badges, analytics) knowing the foundation is solid.
