# Leads Section Restructure - Phase 2 Implementation Plan

**Date Created**: November 5, 2025
**Status**: 🔄 PLANNING → READY FOR IMPLEMENTATION

## 📋 User Requirements

### Original Request (Romanian)
> "in tabul de la sectiunea leads sa o avem impartita in **Searched Leads**, **Forwarding Companies** si **Drivers**, iar atunci cand se salveaza un post sa se salveze automat in **drivers leads** daca salveaza din **DRIVERS AVAILABLE** sau in **Forwarding** cand se salveaza din **AVAILABLE LOADS**"

### Key Features Required
1. **3 Tabs in Leads Section**:
   - 📊 **Searched Leads** - Manual searches (existing functionality)
   - 🚛 **Drivers** - Saved posts from Community "Available Drivers" tab
   - 📦 **Forwarding Companies** - Saved posts from Community "Available Loads" tab

2. **Auto-Convert on Save**:
   - User saves post from Community → Automatically appears in appropriate Leads tab
   - Driver post → Goes to "Drivers" tab
   - Load post → Goes to "Forwarding Companies" tab

3. **Same Filter System**:
   - All 3 tabs must have Country + City filters (same as Community Feed)
   - Filters should work independently per tab
   - Location-based filtering for saved posts

4. **North American Terminology**:
   - Use industry-standard terms for logistics/trucking
   - "Forwarding Companies" = freight forwarders, brokers, shippers
   - "Drivers" = owner-operators, carriers, fleet owners

---

## 🎯 Implementation Strategy

### Option A: Display-Only (RECOMMENDED) ✅

**Concept**: Saved Community posts are **displayed** in Leads tabs, but remain in `community_interactions` table.

**Pros**:
- ✅ Simple implementation
- ✅ No data duplication
- ✅ Single source of truth (community_interactions)
- ✅ Auto-sync: unsave in Community = disappears from Leads instantly
- ✅ Original post updates propagate automatically

**Cons**:
- ❌ Can't add Lead-specific fields (status, notes) to saved posts
- ❌ Mixing two different data types (Leads vs Saved Posts)

**Use Case**: User wants to quickly see saved Community posts alongside manual search leads.

---

### Option B: Auto-Create Lead Records (COMPLEX) ⚠️

**Concept**: When user saves Community post → create actual Lead record in `leads` table.

**Pros**:
- ✅ Saved posts become full Leads (can add status, notes, etc.)
- ✅ Consistent data model (everything in Leads is a Lead)
- ✅ Saved posts persist even if Community feature changes

**Cons**:
- ❌ Data duplication (same info in community_posts AND leads)
- ❌ Complex sync: if original post edited, need to update Lead
- ❌ If user unsaves, what happens to Lead record?
- ❌ Need migration to convert existing saved posts

**Use Case**: User treats saved posts as full CRM leads with pipeline management.

---

## 🚀 Recommended Implementation: Option A (Display-Only)

### Architecture Overview

```
Leads Screen (3 Tabs)
├── Searched Leads (existing)
│   ├── Data Source: leads table
│   ├── Created by: Manual search + "Save as Lead"
│   └── Filters: Country, City, Industry, Status
│
├── Drivers (NEW)
│   ├── Data Source: community_interactions (type='saved') 
│   │                 JOIN community_posts (type='DRIVER_AVAILABLE')
│   ├── Created by: Saving Community post from "Available Drivers" tab
│   └── Filters: Country, City (same as Community)
│
└── Forwarding Companies (NEW)
    ├── Data Source: community_interactions (type='saved')
    │                 JOIN community_posts (type='LOAD_AVAILABLE')
    ├── Created by: Saving Community post from "Available Loads" tab
    └── Filters: Country, City (same as Community)
```

### Data Flow

```
User in Community Feed (Available Drivers tab)
    ↓
Taps Bookmark on Post ID xyz
    ↓
communityService.savePost(xyz, userId, 'saved')
    ↓
INSERT INTO community_interactions 
  (post_id=xyz, user_id=userId, type='saved')
    ↓
✅ Post appears in Community "Saved" tab
✅ Post ALSO appears in Leads "Drivers" tab (auto-sync!)
```

---

## 📝 Implementation Checklist

### 1. Update Store Types
**File**: `store/leadsStore.ts`

```typescript
interface LeadsState {
  // Existing
  leads: Lead[];  // Searched leads (manual)
  
  // NEW
  savedDrivers: CommunityPost[];  // From Community DRIVER_AVAILABLE
  savedForwarding: CommunityPost[];  // From Community LOAD_AVAILABLE
  selectedTab: 'searched' | 'drivers' | 'forwarding';  // NEW
  
  // Existing filters (apply to all tabs)
  filterCountry: Country | null;
  filterCity: City | null;
  searchQuery: string;
  
  // NEW actions
  loadSavedDrivers: (userId: string) => Promise<void>;
  loadSavedForwarding: (userId: string) => Promise<void>;
  setSelectedTab: (tab: 'searched' | 'drivers' | 'forwarding') => void;
  setFilterCountry: (country: Country | null) => void;
  setFilterCity: (city: City | null) => void;
}
```

### 2. Create Service Methods
**File**: `services/leadsService.ts`

```typescript
// Get saved driver posts (DRIVER_AVAILABLE)
async getSavedDrivers(userId: string, filters?: {
  country?: string;
  city?: string;
}): Promise<CommunityPost[]> {
  let query = supabase
    .from('community_interactions')
    .select(`
      *,
      community_posts!inner(*)
    `)
    .eq('user_id', userId)
    .eq('interaction_type', 'saved')
    .eq('community_posts.post_type', 'DRIVER_AVAILABLE')
    .order('created_at', { ascending: false });
  
  // Apply filters (same logic as Community)
  if (filters?.country) {
    query = query.eq('community_posts.origin_country', filters.country);
  }
  if (filters?.city) {
    query = query.eq('community_posts.origin_city', filters.city);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  
  return data.map(interaction => interaction.community_posts);
}

// Get saved forwarding company posts (LOAD_AVAILABLE)
async getSavedForwarding(userId: string, filters?: {
  country?: string;
  city?: string;
}): Promise<CommunityPost[]> {
  // Same as above, but post_type = 'LOAD_AVAILABLE'
}
```

### 3. Update UI - Leads Screen
**File**: `app/(tabs)/leads.tsx`

**Changes**:
- Replace single search bar with 3-tab layout (copy from CommunityFeed.tsx)
- Add Country + City filter controls (reuse CommunityFeed filter components)
- Conditional FlatList data source based on selectedTab
- Different card rendering for Leads vs Community Posts

**Tab Layout**:
```typescript
// Top row: Searched Leads + Drivers (side-by-side)
<View style={styles.tabsRow}>
  <TouchableOpacity
    style={[styles.tabHalf, selectedTab === 'searched' && styles.activeTab]}
    onPress={() => setSelectedTab('searched')}
  >
    <Search size={20} />
    <Text>SEARCHED LEADS</Text>
  </TouchableOpacity>
  
  <TouchableOpacity
    style={[styles.tabHalf, selectedTab === 'drivers' && styles.activeTab]}
    onPress={() => setSelectedTab('drivers')}
  >
    <Truck size={20} />
    <Text>DRIVERS</Text>
  </TouchableOpacity>
</View>

// Bottom row: Forwarding (full width)
<TouchableOpacity
  style={[styles.tabFull, selectedTab === 'forwarding' && styles.activeTab]}
  onPress={() => setSelectedTab('forwarding')}
>
  <Package size={20} />
  <Text>FORWARDING COMPANIES</Text>
</TouchableOpacity>
```

### 4. Add Translations (10 Languages)
**Files**: `locales/*.json`

```json
{
  "leads": {
    "searched": "Searched Leads",
    "drivers": "Drivers",
    "forwarding": "Forwarding Companies",
    "no_saved_drivers": "No saved drivers yet",
    "no_saved_forwarding": "No saved forwarding companies yet",
    "save_driver_hint": "Save driver posts from Community to see them here",
    "save_forwarding_hint": "Save load posts from Community to see them here"
  }
}
```

### 5. Reuse Filter Components
**Create**: `components/leads/LeadFilters.tsx`

Copy Country + City filter logic from `CommunityFeed.tsx`:
- Country picker modal
- City search modal  
- Filter bar UI with clear buttons
- GPS location initialization

**Integration**: Import and use in `leads.tsx`

### 6. Card Rendering Logic
**File**: `app/(tabs)/leads.tsx`

```typescript
const renderCard = ({ item }: { item: Lead | CommunityPost }) => {
  // Check if it's a Lead or Community Post
  if ('status' in item) {
    // It's a Lead from manual search
    return <LeadCard lead={item} />;
  } else {
    // It's a Community Post (saved driver/forwarding)
    return <PostCard post={item} />;  // Reuse existing PostCard!
  }
};
```

---

## 🎨 UI/UX Design

### Tab Color Scheme
- **Searched Leads**: Blue (#3B82F6) - matches search theme
- **Drivers**: Green (#10B981) - matches "Available Drivers" in Community
- **Forwarding Companies**: Blue (#3B82F6) - matches "Available Loads" in Community

### Empty States
```
Drivers Tab (empty):
  🚛 Truck icon (48px, gray)
  "No saved drivers yet"
  "Save driver posts from Community to see them here"

Forwarding Tab (empty):
  📦 Package icon (48px, gray)
  "No saved forwarding companies yet"
  "Save load posts from Community to see them here"
```

### Filter Behavior
- Filters apply **independently** to each tab
- Switching tabs preserves filter selection
- GPS location pre-fills Country filter (same as Community)
- City filter disabled until Country selected

---

## 🔄 User Flow Examples

### Scenario 1: Save Driver Post
```
1. User opens Community Feed → "Available Drivers" tab
2. Sees post: "George - Trailer, Bucharest → Berlin"
3. Taps bookmark icon → Post saved
4. User navigates to Leads section
5. Opens "Drivers" tab
6. ✅ Sees same post: "George - Trailer, Bucharest → Berlin"
7. Can tap Email/WhatsApp/Call buttons (same actions as Community)
```

### Scenario 2: Save Forwarding Company Post
```
1. User opens Community Feed → "Available Loads" tab
2. Sees post: "Heavy Cargo - Bucharest → Munich, 24 tons"
3. Taps bookmark icon → Post saved
4. User navigates to Leads section
5. Opens "Forwarding Companies" tab
6. ✅ Sees same post: "Heavy Cargo - Bucharest → Munich"
7. Can contact company for load booking
```

### Scenario 3: Filter Saved Posts
```
1. User in Leads → "Drivers" tab
2. Has 50 saved driver posts from various countries
3. Selects Country filter: "Romania"
4. City filter: "Bucharest"
5. ✅ Only sees drivers from Bucharest, Romania
6. Switches to "Forwarding" tab
7. ✅ Same filters applied - sees forwarding companies in Bucharest
```

### Scenario 4: Unsave from Community
```
1. User has driver post saved (appears in both Community Saved + Leads Drivers)
2. User unsaves post from Community Feed
3. DELETE from community_interactions
4. User returns to Leads → "Drivers" tab
5. ✅ Post automatically disappeared (JOIN query returns nothing)
```

---

## 🗄️ Database Queries

### Get Saved Drivers (with filters)
```sql
SELECT 
  cp.*,
  ci.created_at as saved_at
FROM community_interactions ci
INNER JOIN community_posts cp ON cp.id = ci.post_id
WHERE ci.user_id = $1
  AND ci.interaction_type = 'saved'
  AND cp.post_type = 'DRIVER_AVAILABLE'
  AND cp.origin_country = $2  -- Optional filter
  AND cp.origin_city = $3     -- Optional filter
  AND cp.expires_at > NOW()   -- Only active posts
ORDER BY ci.created_at DESC;
```

### Get Saved Forwarding Companies (with filters)
```sql
-- Same query, but cp.post_type = 'LOAD_AVAILABLE'
```

### Performance Considerations
- ✅ `community_interactions.post_id` indexed (foreign key)
- ✅ `community_interactions.user_id` indexed (foreign key)
- ✅ `community_posts.post_type` indexed
- ✅ Composite index on (user_id, interaction_type) recommended
- ✅ Query optimized with INNER JOIN (only returns posts that exist)

---

## 📦 File Changes Summary

### New Files
- `components/leads/LeadFilters.tsx` - Reusable filter component

### Modified Files
- `app/(tabs)/leads.tsx` - 3-tab layout + filters + conditional rendering
- `store/leadsStore.ts` - Add savedDrivers, savedForwarding, selectedTab
- `services/leadsService.ts` - Add getSavedDrivers(), getSavedForwarding()
- `locales/*.json` (10 files) - Add 7 new translation keys each

### No Changes Needed
- `components/community/PostCard.tsx` - Reuse as-is! ✅
- `services/communityService.ts` - Save/unsave logic already works ✅
- Database schema - No new tables needed ✅

---

## ✅ Testing Checklist

### Unit Tests
- [ ] Store: setSelectedTab() switches data source correctly
- [ ] Service: getSavedDrivers() returns only DRIVER_AVAILABLE posts
- [ ] Service: getSavedForwarding() returns only LOAD_AVAILABLE posts
- [ ] Service: Filters work (country, city)

### Integration Tests
- [ ] Save driver post in Community → appears in Leads Drivers tab
- [ ] Save forwarding post in Community → appears in Leads Forwarding tab
- [ ] Unsave in Community → disappears from Leads tab
- [ ] Filters apply correctly to saved posts
- [ ] Empty states show when no saved posts

### User Acceptance Tests
- [ ] User can save 10 driver posts → all appear in Drivers tab
- [ ] User can save 10 forwarding posts → all appear in Forwarding tab
- [ ] User can filter by country → only matching posts shown
- [ ] User can switch tabs → filters persist
- [ ] User can contact saved posts (Email/WhatsApp/Call buttons work)
- [ ] Expired posts disappear automatically (48h cascade delete)

---

## 🚀 Deployment Plan

### Phase 2A: Backend + Store (1-2 hours)
1. Update `leadsStore.ts` types and state
2. Add `getSavedDrivers()` and `getSavedForwarding()` to `leadsService.ts`
3. Test queries in Supabase SQL editor
4. Commit: "feat(leads): Add saved drivers/forwarding data layer"

### Phase 2B: UI Components (2-3 hours)
1. Create `LeadFilters.tsx` component (copy from CommunityFeed)
2. Update `leads.tsx` with 3-tab layout
3. Add conditional rendering logic
4. Add empty states
5. Commit: "feat(leads): Restructure UI with 3 tabs and filters"

### Phase 2C: Translations (30 minutes)
1. Add 7 new keys to all 10 language files
2. Test language switching
3. Commit: "feat(leads): Add i18n for restructured tabs"

### Phase 2D: Testing + Polish (1-2 hours)
1. Run through all test scenarios
2. Fix any bugs found
3. Polish animations/transitions
4. Update documentation
5. Commit: "feat(leads): Complete Phase 2 - Leads restructure with saved posts"

**Total Estimated Time**: 5-8 hours

---

## 🔮 Future Enhancements (Phase 3+)

### Lead Management Features
- **Convert Saved Post to Full Lead**: Button to create Lead record from saved post
- **Add Notes to Saved Posts**: Extend community_interactions with notes field
- **Status Tracking**: Mark saved posts as "Contacted", "In Progress", "Closed"
- **Pipeline View**: Kanban board for saved posts
- **Bulk Actions**: Select multiple posts, export to CSV

### Advanced Filtering
- **Truck Type Filter**: Filter drivers by truck type (Trailer, Frigo, etc.)
- **Load Weight Filter**: Filter forwarding by cargo weight
- **Date Range**: Show posts saved in last 7/30/90 days
- **Distance Filter**: Show posts within X km of user location

### Analytics
- **Saved Post Stats**: How many driver/forwarding posts saved per month
- **Conversion Tracking**: How many saved posts led to actual deals
- **Response Rate**: Which saved posts got contacted/responded

---

## 📞 Questions for User

Before starting implementation, please clarify:

1. **Card Display**: Should saved Community posts in Leads tabs:
   - [ ] Look exactly like Community PostCard (with bookmark, views, etc.)?
   - [ ] Be simplified to show only contact info?
   - [ ] Have a hybrid design?

2. **Contact Actions**: On saved posts in Leads section:
   - [ ] Keep same Email/WhatsApp/Call buttons as Community?
   - [ ] Add "Convert to Full Lead" button?
   - [ ] Add "Add Note" feature?

3. **Post Expiry**: Saved posts that expired (48h):
   - [ ] Still show in Leads (marked as expired)?
   - [ ] Hide automatically (JOIN only active posts)?
   - [ ] Move to "Archived" section?

4. **Initial Tab**: When user opens Leads section, default tab should be:
   - [ ] Searched Leads (current behavior)?
   - [ ] Drivers (most recently saved)?
   - [ ] Remember last selected tab?

5. **Terminology Preference**: For North American market:
   - [ ] "Forwarding Companies" (current)
   - [ ] "Freight Brokers"
   - [ ] "Shippers"
   - [ ] "Logistics Companies"

---

**Status**: 📝 READY FOR USER REVIEW & APPROVAL
**Next Step**: User answers questions above → Start Phase 2A implementation
**Estimated Completion**: November 5-6, 2025

