# 📌 Saved Posts & Saved Leads - Feature Implementation Plan

**Date**: November 5, 2025  
**Status**: Planning Phase  
**Priority**: Medium (UX Enhancement)

---

## 🎯 Obiectiv

Implementarea unui sistem complet de salvare și vizualizare pentru:
1. **Saved Posts** - Postări din Community salvate de utilizator
2. **Saved Leads** - Lead-uri din My Leads salvate/marcate ca importante

---

## 📊 Analiza Situației Actuale

### ✅ Ce Există Deja (Community Posts)

**Database Structure:**
```sql
-- Table: community_interactions
CREATE TABLE community_interactions (
  id uuid PRIMARY KEY,
  post_id uuid REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  interaction_type text CHECK (interaction_type IN ('view', 'interested', 'contacted', 'saved', 'reported')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id, interaction_type)
);
```

**Funcționalitate Existentă:**
- ✅ `savePost()` - Salvează post în `community_interactions` cu `interaction_type = 'saved'`
- ✅ `getSavedPosts()` - Query pentru postări salvate
- ✅ Store state: `savedPosts: CommunityPost[]`
- ✅ Buton "Save" în `PostCard.tsx` (iconița Bookmark)
- ✅ Traduceri pentru "saved_posts", "no_saved_posts" (10 limbi)

**Ce Lipsește:**
- ❌ **UI dedicat** pentru vizualizarea postărilor salvate
- ❌ **Tab/Filter** în CommunityFeed pentru "Saved Posts"
- ❌ **Badge/Counter** cu numărul de postări salvate
- ❌ **Empty state** când nu există postări salvate

---

### ⚠️ Ce NU Există (Saved Leads)

**Database Structure (Leads):**
```sql
-- Table: leads
CREATE TABLE leads (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  company_name text NOT NULL,
  contact_person_name text,
  email text,
  phone text,
  status text CHECK (status IN ('new', 'contacted', 'in_progress', 'won', 'lost')),
  source_type text DEFAULT 'search', -- 'search' | 'community'
  source_id uuid, -- Reference to search or community post
  -- ... other fields
);
```

**Ce Lipsește Complet:**
- ❌ **Nu există structură** pentru "saved leads" (similar cu `community_interactions`)
- ❌ **Nu există concept** de "favorite lead" sau "important lead"
- ❌ **Nu există flag** `is_favorite` sau `is_saved` în table `leads`
- ❌ **Nu există tab** "Saved Leads" în UI

---

## 🏗️ Arhitectura Propusă

### Option 1: **RECOMANDATĂ** - Table Separată (Consistent cu Community)

Creează o tabelă `lead_interactions` similar cu `community_interactions`:

```sql
CREATE TABLE lead_interactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  interaction_type text CHECK (interaction_type IN ('viewed', 'contacted', 'saved', 'archived')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(lead_id, user_id, interaction_type)
);
```

**Avantaje:**
- ✅ Consistent cu arhitectura Community
- ✅ Extensibil (poți adăuga alte tipuri: 'contacted', 'archived', etc.)
- ✅ Nu modifică table `leads` (mai puțin risc)
- ✅ RLS policies clare și securizate

---

### Option 2: Coloană `is_saved` în Table `leads`

```sql
ALTER TABLE leads
ADD COLUMN is_saved boolean DEFAULT false,
ADD COLUMN saved_at timestamptz;
```

**Avantaje:**
- ✅ Mai simplu de query (`WHERE is_saved = true`)
- ✅ Mai rapid (un query direct)

**Dezavantaje:**
- ❌ Inconsistent cu Community approach
- ❌ Mai puțin flexibil (nu poți track "when saved", "how many times", etc.)
- ❌ Dificil de extins cu alte interacțiuni

---

## 📋 Implementation Plan

### **Phase 1: Community - Saved Posts UI** (1-2 ore)

#### 1.1 Add Tab/Filter in CommunityFeed
**File**: `components/community/CommunityFeed.tsx`

```typescript
// Add new tab option
type TabOption = 'all' | 'drivers' | 'loads' | 'saved';

// Update tab buttons
const tabs = [
  { key: 'all', label: t('community.all_posts'), icon: Globe },
  { key: 'drivers', label: t('community.drivers'), icon: Truck },
  { key: 'loads', label: t('community.loads'), icon: Package },
  { key: 'saved', label: t('community.saved'), icon: Bookmark }, // NEW
];

// Update loadPosts logic
useEffect(() => {
  if (selectedTab === 'saved') {
    loadSavedPosts(user.id);
  } else {
    loadPosts(true);
  }
}, [selectedTab]);
```

#### 1.2 Update Store Logic
**File**: `store/communityStore.ts`

```typescript
interface CommunityState {
  selectedTab: 'all' | 'drivers' | 'loads' | 'saved';
  savedPosts: CommunityPost[];
  savedPostsLoading: boolean;
  // ...
}

// Add method
loadSavedPosts: async (userId: string) => {
  set({ savedPostsLoading: true });
  const posts = await communityService.getSavedPosts(userId);
  set({ savedPosts: posts, savedPostsLoading: false });
}
```

#### 1.3 Empty State Component
**File**: `components/community/SavedPostsEmptyState.tsx`

```tsx
export default function SavedPostsEmptyState() {
  return (
    <View style={styles.container}>
      <Bookmark size={64} color="#D1D5DB" />
      <Text style={styles.title}>{t('community.no_saved_posts')}</Text>
      <Text style={styles.subtitle}>{t('community.save_posts_hint')}</Text>
    </View>
  );
}
```

#### 1.4 Translations (Already Exist!)
```json
// locales/en.json
{
  "community": {
    "saved": "Saved",
    "saved_posts": "Saved Posts",
    "no_saved_posts": "No saved posts yet",
    "save_posts_hint": "Tap the bookmark icon on any post to save it here"
  }
}
```

---

### **Phase 2: Leads - Database Structure** (30 min)

#### 2.1 Create Migration
**File**: `supabase/migrations/20251105_lead_interactions.sql`

```sql
-- Create lead_interactions table (consistent with community_interactions)
CREATE TABLE IF NOT EXISTS lead_interactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  interaction_type text NOT NULL CHECK (interaction_type IN ('viewed', 'contacted', 'saved', 'archived')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(lead_id, user_id, interaction_type)
);

-- Indexes
CREATE INDEX idx_lead_interactions_lead ON lead_interactions(lead_id);
CREATE INDEX idx_lead_interactions_user ON lead_interactions(user_id);
CREATE INDEX idx_lead_interactions_type ON lead_interactions(interaction_type);
CREATE INDEX idx_lead_interactions_created ON lead_interactions(created_at DESC);

-- RLS Policies
ALTER TABLE lead_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own interactions" ON lead_interactions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own interactions" ON lead_interactions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own interactions" ON lead_interactions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own interactions" ON lead_interactions
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Grant permissions
GRANT ALL ON lead_interactions TO authenticated;

-- Function to record lead interaction (similar to community)
CREATE OR REPLACE FUNCTION record_lead_interaction(
  p_user_id uuid,
  p_lead_id uuid,
  p_interaction_type text,
  p_metadata jsonb DEFAULT '{}'::jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_inserted boolean := false;
BEGIN
  -- Validation
  IF p_user_id IS NULL OR p_lead_id IS NULL OR p_interaction_type IS NULL THEN
    RAISE EXCEPTION 'Missing required parameters';
  END IF;

  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Upsert interaction
  WITH upsert AS (
    INSERT INTO lead_interactions (lead_id, user_id, interaction_type, metadata)
    VALUES (p_lead_id, p_user_id, p_interaction_type, COALESCE(p_metadata, '{}'::jsonb))
    ON CONFLICT (lead_id, user_id, interaction_type) DO UPDATE
      SET metadata = CASE
        WHEN EXCLUDED.metadata IS NULL OR EXCLUDED.metadata = '{}'::jsonb 
        THEN lead_interactions.metadata
        ELSE COALESCE(lead_interactions.metadata, '{}'::jsonb) || EXCLUDED.metadata
      END,
      created_at = lead_interactions.created_at
    RETURNING (xmax = 0) AS inserted
  )
  SELECT inserted INTO v_inserted FROM upsert;

  RETURN jsonb_build_object('inserted', COALESCE(v_inserted, false));
END;
$$;

GRANT EXECUTE ON FUNCTION record_lead_interaction(uuid, uuid, text, jsonb) TO authenticated;
```

---

### **Phase 3: Leads - Service Layer** (30 min)

#### 3.1 Update leadsService
**File**: `services/leadsService.ts`

```typescript
export const leadsService = {
  // ... existing methods

  /**
   * Get saved leads for a user
   */
  async getSavedLeads(userId: string): Promise<Lead[]> {
    const { data, error } = await supabase
      .from('lead_interactions')
      .select(`
        lead:leads (*)
      `)
      .eq('user_id', userId)
      .eq('interaction_type', 'saved')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching saved leads:', error);
      return [];
    }

    return (data || [])
      .map(item => item.lead)
      .filter((lead): lead is Lead => Boolean(lead));
  },

  /**
   * Save a lead
   */
  async saveLead(leadId: string, userId: string): Promise<void> {
    const { error } = await supabase.rpc('record_lead_interaction', {
      p_user_id: userId,
      p_lead_id: leadId,
      p_interaction_type: 'saved',
      p_metadata: {}
    });

    if (error) {
      console.error('Error saving lead:', error);
      throw error;
    }
  },

  /**
   * Unsave a lead
   */
  async unsaveLead(leadId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('lead_interactions')
      .delete()
      .eq('lead_id', leadId)
      .eq('user_id', userId)
      .eq('interaction_type', 'saved');

    if (error) {
      console.error('Error unsaving lead:', error);
      throw error;
    }
  },

  /**
   * Check if lead is saved
   */
  async isLeadSaved(leadId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('lead_interactions')
      .select('id')
      .eq('lead_id', leadId)
      .eq('user_id', userId)
      .eq('interaction_type', 'saved')
      .maybeSingle();

    if (error) {
      console.error('Error checking saved status:', error);
      return false;
    }

    return Boolean(data);
  },
};
```

---

### **Phase 4: Leads - Store Update** (20 min)

#### 4.1 Update leadsStore
**File**: `store/leadsStore.ts`

```typescript
interface LeadsState {
  leads: Lead[];
  savedLeads: Lead[]; // NEW
  isLoading: boolean;
  isSavedLoading: boolean; // NEW
  filterView: 'all' | 'saved'; // NEW
  // ... existing fields

  // NEW methods
  loadSavedLeads: (userId: string) => Promise<void>;
  saveLead: (leadId: string, userId: string) => Promise<void>;
  unsaveLead: (leadId: string, userId: string) => Promise<void>;
  setFilterView: (view: 'all' | 'saved') => void;
}

export const useLeadsStore = create<LeadsState>((set, get) => ({
  leads: [],
  savedLeads: [],
  isLoading: false,
  isSavedLoading: false,
  filterView: 'all',
  // ... existing state

  loadSavedLeads: async (userId: string) => {
    set({ isSavedLoading: true });
    try {
      const savedLeads = await leadsService.getSavedLeads(userId);
      set({ savedLeads, isSavedLoading: false });
    } catch (error) {
      console.error('Error loading saved leads:', error);
      set({ isSavedLoading: false });
    }
  },

  saveLead: async (leadId: string, userId: string) => {
    try {
      await leadsService.saveLead(leadId, userId);
      
      // Add to savedLeads if not already there
      const lead = get().leads.find(l => l.id === leadId);
      if (lead && !get().savedLeads.find(l => l.id === leadId)) {
        set({ savedLeads: [lead, ...get().savedLeads] });
      }
    } catch (error) {
      console.error('Error saving lead:', error);
      throw error;
    }
  },

  unsaveLead: async (leadId: string, userId: string) => {
    try {
      await leadsService.unsaveLead(leadId, userId);
      set({ savedLeads: get().savedLeads.filter(l => l.id !== leadId) });
    } catch (error) {
      console.error('Error unsaving lead:', error);
      throw error;
    }
  },

  setFilterView: (filterView) => set({ filterView }),
}));
```

---

### **Phase 5: Leads - UI Components** (1-2 ore)

#### 5.1 Update Leads Screen
**File**: `app/(tabs)/leads.tsx`

```tsx
// Add filter toggle
<View style={styles.filterRow}>
  <TouchableOpacity
    style={[styles.filterBtn, filterView === 'all' && styles.filterBtnActive]}
    onPress={() => setFilterView('all')}
  >
    <Text>{t('leads.all_leads')}</Text>
  </TouchableOpacity>
  
  <TouchableOpacity
    style={[styles.filterBtn, filterView === 'saved' && styles.filterBtnActive]}
    onPress={() => {
      setFilterView('saved');
      loadSavedLeads(user.id);
    }}
  >
    <Bookmark size={16} />
    <Text>{t('leads.saved_leads')}</Text>
    {savedLeads.length > 0 && (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{savedLeads.length}</Text>
      </View>
    )}
  </TouchableOpacity>
</View>

{/* Display logic */}
<FlatList
  data={filterView === 'saved' ? savedLeads : filteredLeads}
  renderItem={({ item }) => <LeadCard lead={item} />}
  // ...
/>
```

#### 5.2 Create LeadCard Component (if not exists)
**File**: `components/leads/LeadCard.tsx`

```tsx
export default function LeadCard({ lead }: { lead: Lead }) {
  const { saveLead, unsaveLead, savedLeads } = useLeadsStore();
  const { user } = useAuthStore();
  
  const isSaved = savedLeads.some(l => l.id === lead.id);

  const handleSave = async () => {
    if (!user) return;
    
    try {
      if (isSaved) {
        await unsaveLead(lead.id, user.id);
        Toast.show({ type: 'success', text1: t('leads.unsaved') });
      } else {
        await saveLead(lead.id, user.id);
        Toast.show({ type: 'success', text1: t('leads.saved') });
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: t('common.error') });
    }
  };

  return (
    <View style={styles.card}>
      {/* Lead info */}
      <Text style={styles.company}>{lead.company_name}</Text>
      <Text style={styles.contact}>{lead.contact_person_name}</Text>
      
      {/* Save button */}
      <TouchableOpacity onPress={handleSave}>
        <Bookmark size={20} color={isSaved ? '#10B981' : '#9CA3AF'} />
      </TouchableOpacity>
    </View>
  );
}
```

---

### **Phase 6: Translations** (15 min)

#### 6.1 Add Missing Keys
**Files**: `locales/*.json` (all 10 languages)

```json
{
  "community": {
    "saved": "Saved",
    "saved_posts": "Saved Posts",
    "no_saved_posts": "No saved posts yet",
    "save_posts_hint": "Tap the bookmark icon on any post to save it here"
  },
  "leads": {
    "all_leads": "All Leads",
    "saved_leads": "Saved Leads",
    "no_saved_leads": "No saved leads yet",
    "save_leads_hint": "Tap the bookmark icon to save important leads",
    "saved": "Lead saved!",
    "unsaved": "Lead removed from saved"
  }
}
```

**Romanian:**
```json
{
  "community": {
    "saved": "Salvate",
    "saved_posts": "Postări Salvate",
    "no_saved_posts": "Nu ai postări salvate încă",
    "save_posts_hint": "Apasă pe iconița de bookmark pentru a salva postări aici"
  },
  "leads": {
    "all_leads": "Toate Lead-urile",
    "saved_leads": "Lead-uri Salvate",
    "no_saved_leads": "Nu ai lead-uri salvate încă",
    "save_leads_hint": "Apasă pe iconița de bookmark pentru a salva lead-uri importante",
    "saved": "Lead salvat!",
    "unsaved": "Lead eliminat din salvate"
  }
}
```

---

## 🎨 UI/UX Design Patterns

### Community Feed Tabs
```
┌─────────────────────────────────────────┐
│ [All] [Drivers] [Loads] [📌 Saved (5)] │ ← New tab
└─────────────────────────────────────────┘
```

### Leads Filter Toggle
```
┌─────────────────────────────────────────┐
│ [All Leads] [📌 Saved (12)]             │
│                                         │
│ 🟢 Lead Card 1         [💚 Bookmark]   │
│ 🔵 Lead Card 2         [🤍 Bookmark]   │
└─────────────────────────────────────────┘
```

### Bookmark Icon States
- **Not Saved**: `<Bookmark color="#9CA3AF" />` (Gray outline)
- **Saved**: `<Bookmark color="#10B981" fill="#10B981" />` (Green filled)

---

## 📊 Database Query Performance

### Community Saved Posts Query
```sql
-- Efficient with existing indexes
SELECT cp.*, p.* 
FROM community_interactions ci
JOIN community_posts cp ON ci.post_id = cp.id
JOIN profiles p ON cp.user_id = p.user_id
WHERE ci.user_id = 'user-uuid'
  AND ci.interaction_type = 'saved'
ORDER BY ci.created_at DESC;

-- Uses index: idx_interactions_user, idx_interactions_type
```

### Leads Saved Query
```sql
-- New query (after migration)
SELECT l.* 
FROM lead_interactions li
JOIN leads l ON li.lead_id = l.id
WHERE li.user_id = 'user-uuid'
  AND li.interaction_type = 'saved'
ORDER BY li.created_at DESC;

-- Uses index: idx_lead_interactions_user, idx_lead_interactions_type
```

---

## ✅ Testing Checklist

### Community Saved Posts
- [ ] Save a post from feed → appears in "Saved" tab
- [ ] Unsave a post → disappears from "Saved" tab
- [ ] Navigate to "Saved" tab → loads saved posts correctly
- [ ] Empty state shows when no saved posts
- [ ] Counter badge shows correct number (5 saved = "Saved (5)")
- [ ] Pull to refresh works on "Saved" tab
- [ ] Saved state persists after app restart

### Leads Saved
- [ ] Save a lead from "All Leads" → appears in "Saved Leads"
- [ ] Unsave a lead → disappears from "Saved Leads"
- [ ] Toggle to "Saved Leads" filter → shows only saved leads
- [ ] Bookmark icon filled (green) when saved
- [ ] Bookmark icon outline (gray) when not saved
- [ ] Empty state shows when no saved leads
- [ ] Saved state persists after app restart

---

## 🚀 Deployment Steps

### Step 1: Deploy Database Migration
```bash
# Apply migration
npx supabase db push

# Verify table created
npx supabase db dump --data-only --table lead_interactions
```

### Step 2: Test RLS Policies
```sql
-- Test as authenticated user
SELECT * FROM lead_interactions WHERE user_id = auth.uid();
INSERT INTO lead_interactions (lead_id, user_id, interaction_type) 
VALUES ('lead-uuid', auth.uid(), 'saved');
```

### Step 3: Deploy Code Changes
```bash
# Community UI
git add components/community/CommunityFeed.tsx
git add components/community/SavedPostsEmptyState.tsx

# Leads changes
git add services/leadsService.ts
git add store/leadsStore.ts
git add app/(tabs)/leads.tsx
git add components/leads/LeadCard.tsx

# Translations
git add locales/*.json

git commit -m "Feature: Saved Posts & Saved Leads (complete implementation)"
```

---

## 🔮 Future Enhancements

### Phase 2 Features (Optional)
1. **Bulk Actions**: Select multiple saved posts/leads for delete
2. **Collections**: Group saved posts into custom folders
3. **Export Saved**: Export saved leads to CSV/Excel
4. **Saved Search Filters**: Filter saved posts by date, type, location
5. **Notifications**: Alert when saved post expires or lead updates
6. **Analytics**: Track most saved posts, conversion rate from saved to contacted

---

## 📝 Summary

### Complexity Estimate
- **Community Saved Posts**: ⭐⭐ (Easy - 90% done, just UI)
- **Leads Saved**: ⭐⭐⭐ (Medium - need migration + full implementation)

### Time Estimate
- **Phase 1** (Community UI): 1-2 ore
- **Phase 2** (Leads DB): 30 min
- **Phase 3** (Leads Service): 30 min
- **Phase 4** (Leads Store): 20 min
- **Phase 5** (Leads UI): 1-2 ore
- **Phase 6** (Translations): 15 min
- **Testing**: 1 oră

**Total**: ~4-6 ore pentru implementare completă

---

**Next Steps**: Ești pregătit să începem implementarea? Recomand să începem cu **Phase 1** (Community Saved Posts UI) pentru că e 90% gata și vezi rezultate imediate! 🚀
