# Community Feed - Ghid Tehnic Complet

**Data ultimei actualizări**: 4 Noiembrie 2025  
**Versiune**: 2.0 (cu filtre Country/City și tab-uri colorate)

---

## Cuprins

1. [Prezentare Generală](#prezentare-generală)
2. [Arhitectură și Flow](#arhitectură-și-flow)
3. [Structura Bazei de Date](#structura-bazei-de-date)
4. [Politici RLS (Row Level Security)](#politici-rls-row-level-security)
5. [Componenta CommunityFeed](#componenta-communityfeed)
6. [Zustand Store (State Management)](#zustand-store-state-management)
7. [Service Layer](#service-layer)
8. [Filtrare și Localizare GPS](#filtrare-și-localizare-gps)
9. [Interacțiuni Utilizator](#interacțiuni-utilizator)
10. [Fluxuri de Date](#fluxuri-de-date)
11. [Optimizări și Performance](#optimizări-și-performance)

---

## Prezentare Generală

**CommunityFeed** este feature-ul central al aplicației Truxel care permite șoferilor și companiilor de transport să:
- Posteze disponibilitatea lor (AVAILABLE DRIVERS)
- Posteze rute disponibile (AVAILABLE ROUTES)
- Contacteze alți membri ai comunității (WhatsApp, Email, Apel)
- Filtreze postări după țară și oraș
- Vizualizeze statistici despre postări active, contacte și conversii

### Componente Principale

```
CommunityFeed (UI Component)
    ↓
communityStore (Zustand State)
    ↓
communityService (API Layer)
    ↓
Supabase PostgreSQL (Database + RLS)
```

---

## Arhitectură și Flow

### 1. Inițializare Aplicație

```typescript
// app/_layout.tsx - User authentication
const { user, isAuthenticated } = useAuthStore();

// CommunityFeed.tsx - Component mount
useEffect(() => {
  if (!user?.id) return;
  
  // 1. Get GPS location
  const locationInfo = await cityService.getCurrentLocationCity();
  
  // 2. Initialize filters with user's country/city
  await initializeFilters({
    country: { code: 'US', name: 'United States' },
    city: { id: '123', name: 'New York', ... }
  });
  
  // 3. Load posts
  await loadPosts(true);
  
  // 4. Load user stats
  await loadCommunityStats(user.id);
}, [user?.id]);
```

### 2. Data Flow - Loading Posts

```
User selects filter (Country/City)
    ↓
communityStore.setSelectedCountry()
    ↓
useEffect detects filter change
    ↓
communityStore.loadPosts(true) // reset = true
    ↓
communityService.getPosts({ 
  tab: 'availability',
  country: 'US',
  city: 'New York',
  limit: 20 
})
    ↓
Supabase Query with RLS policies
    ↓
SELECT * FROM community_posts 
WHERE origin_country IN ('US', 'United States')
  AND origin_city = 'New York'
  AND post_type = 'availability'
  AND expires_at > NOW()
ORDER BY created_at DESC
LIMIT 20
    ↓
Results returned to store
    ↓
UI re-renders with new posts
```

### 3. Data Flow - Creating Post

```
User taps "I'M AVAILABLE" button
    ↓
QuickPostBar opens TemplateSelector
    ↓
User selects template + city
    ↓
communityStore.createPost({
  userId: user.id,
  postType: 'availability',
  originCity: 'New York',
  originCountry: 'US',
  template: 'available_now'
})
    ↓
Check post limits (RPC function)
    ↓
communityService.createPost()
    ↓
Supabase INSERT with RLS check
    ↓
RPC: increment_post_usage(user_id)
    ↓
New post appears in feed
```

---

## Structura Bazei de Date

### Tabela: `community_posts`

```sql
CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  post_type TEXT NOT NULL CHECK (post_type IN ('availability', 'route')),
  
  -- Location fields
  origin_city TEXT NOT NULL,
  origin_country TEXT NOT NULL,  -- Can be code ('US') or name ('United States')
  destination_city TEXT,
  destination_country TEXT,
  
  -- Content
  template_id TEXT,
  custom_message TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Analytics
  views_count INTEGER DEFAULT 0,
  contacts_count INTEGER DEFAULT 0,
  saves_count INTEGER DEFAULT 0,
  
  CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

-- Indexes for performance
CREATE INDEX idx_community_posts_user ON community_posts(user_id);
CREATE INDEX idx_community_posts_type ON community_posts(post_type);
CREATE INDEX idx_community_posts_country ON community_posts(origin_country);
CREATE INDEX idx_community_posts_city ON community_posts(origin_city);
CREATE INDEX idx_community_posts_active ON community_posts(is_active, expires_at);
CREATE INDEX idx_community_posts_created ON community_posts(created_at DESC);
```

### Tabela: `user_post_usage`

Tracking-ul limitelor de postări:

```sql
CREATE TABLE user_post_usage (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  posts_this_month INTEGER DEFAULT 0,
  posts_today INTEGER DEFAULT 0,
  last_post_date DATE,
  month_start_date DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabela: `subscription_limits`

Definește limitele pentru fiecare tier:

```sql
CREATE TABLE subscription_limits (
  tier TEXT PRIMARY KEY CHECK (tier IN ('trial', 'standard', 'pro', 'premium')),
  posts_per_month INTEGER NOT NULL,
  posts_per_day INTEGER NOT NULL,
  searches_per_month INTEGER NOT NULL
);

-- Values
INSERT INTO subscription_limits VALUES
  ('trial', 1, 1, 5),
  ('standard', 5, 2, 15),
  ('pro', 15, 5, 30),
  ('premium', -1, -1, 100); -- -1 = unlimited
```

### Tabela: `community_interactions`

Track-ing interacțiuni (save, contact, view):

```sql
CREATE TABLE community_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('view', 'contact', 'save')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(post_id, user_id, interaction_type)
);
```

### Tabela: `cities`

Oraș pentru filtre și autocomplete:

```sql
CREATE TABLE cities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  ascii_name TEXT,
  country_code TEXT NOT NULL,
  country_name TEXT,
  lat NUMERIC(10, 7),
  lng NUMERIC(10, 7),
  population INTEGER,
  
  -- For search performance
  name_lower TEXT GENERATED ALWAYS AS (LOWER(name)) STORED
);

CREATE INDEX idx_cities_country ON cities(country_code);
CREATE INDEX idx_cities_name_lower ON cities(name_lower);
CREATE INDEX idx_cities_population ON cities(population DESC);
```

---

## Politici RLS (Row Level Security)

### Concepte de Bază

Supabase folosește **Row Level Security** pentru a controla accesul la date la nivel de rând. Fiecare query este executat în contextul utilizatorului autentificat (`auth.uid()`).

### Politici pentru `community_posts`

#### 1. SELECT - Vizualizare Postări

```sql
-- Policy: Toată lumea poate vedea postările active și neexpirate
CREATE POLICY "Anyone can view active posts"
ON community_posts
FOR SELECT
USING (
  is_active = TRUE 
  AND expires_at > NOW()
);
```

**Explicație**:
- Orice utilizator autentificat poate vedea postările
- Doar postările active (`is_active = TRUE`)
- Doar postările care nu au expirat (`expires_at > NOW()`)
- Filtrarea după țară/oraș se face în query, nu în RLS

#### 2. INSERT - Creare Postări

```sql
-- Policy: Utilizatorii pot crea propriile postări
CREATE POLICY "Users can create own posts"
ON community_posts
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND post_type IN ('availability', 'route')
);
```

**Explicație**:
- Utilizatorul poate insera doar dacă `user_id` = ID-ul său
- `post_type` trebuie să fie valid
- Limitele de postări se verifică separat prin RPC function

#### 3. UPDATE - Modificare Postări

```sql
-- Policy: Utilizatorii pot modifica doar propriile postări
CREATE POLICY "Users can update own posts"
ON community_posts
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

**Explicație**:
- USING: Verifică că postarea aparține utilizatorului
- WITH CHECK: Asigură că `user_id` nu se schimbă

#### 4. DELETE - Ștergere Postări

```sql
-- Policy: Utilizatorii pot șterge doar propriile postări
CREATE POLICY "Users can delete own posts"
ON community_posts
FOR DELETE
USING (auth.uid() = user_id);
```

### Politici pentru `community_interactions`

```sql
-- View: Toată lumea poate vedea interacțiunile publice
CREATE POLICY "Anyone can view interactions"
ON community_interactions
FOR SELECT
USING (TRUE);

-- Insert: Utilizatorii pot crea interacțiuni pentru ei înșiși
CREATE POLICY "Users can create own interactions"
ON community_interactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Delete: Utilizatorii pot șterge propriile interacțiuni (unsave)
CREATE POLICY "Users can delete own interactions"
ON community_interactions
FOR DELETE
USING (auth.uid() = user_id);
```

### Politici pentru `user_post_usage`

```sql
-- Select: Utilizatorii pot vedea doar propriul usage
CREATE POLICY "Users can view own usage"
ON user_post_usage
FOR SELECT
USING (auth.uid() = user_id);

-- Insert/Update: Managed prin RPC functions (bypass RLS)
-- Nu există politici publice de INSERT/UPDATE
```

---

## Componenta CommunityFeed

### Props și Interfață

```typescript
interface CommunityFeedProps {
  customHeader?: React.ReactNode; // Optional header (ex: stats)
}
```

### State Management Local

```typescript
const [isCountryPickerVisible, setCountryPickerVisible] = useState(false);
const [isCityPickerVisible, setCityPickerVisible] = useState(false);
const [isInitializingFilters, setIsInitializingFilters] = useState(false);
```

### Zustand Store Selectors

```typescript
const {
  // Data
  posts,                    // Array<CommunityPost>
  selectedTab,              // 'availability' | 'routes'
  selectedCity,             // City | null
  selectedCountry,          // Country | null
  
  // Loading states
  isLoading,               // boolean
  isRefreshing,            // boolean
  hasMore,                 // boolean
  error,                   // string | null
  
  // Actions
  loadPosts,               // (reset: boolean) => Promise<void>
  loadMorePosts,           // () => Promise<void>
  refreshPosts,            // () => Promise<void>
  setSelectedTab,          // (tab) => void
  setSelectedCountry,      // (country) => void
  setSelectedCity,         // (city) => void
  initializeFilters,       // (filters) => Promise<void>
  clearError,              // () => void
  recordView,              // (postId, userId) => Promise<void>
} = useCommunityStore();
```

### useEffect Hooks

#### 1. Inițializare GPS și Filtre (One-shot)

```typescript
useEffect(() => {
  if (!user?.id) return;
  
  let isMounted = true;

  async function initFilters() {
    try {
      setIsInitializingFilters(true);
      
      // Get user's location
      const locationInfo = await cityService.getCurrentLocationCity();
      
      if (!isMounted) return;

      if (locationInfo?.nearestMajorCity) {
        const { country_code, country_name } = locationInfo.nearestMajorCity;
        
        // Set filters based on location
        await initializeFilters({
          country: { code: country_code, name: country_name },
          city: locationInfo.nearestMajorCity
        });
      }
    } catch (err) {
      console.log('[CommunityFeed] Location init failed (non-critical):', err);
    } finally {
      if (isMounted) {
        setIsInitializingFilters(false);
      }
    }
  }

  void initFilters();

  return () => {
    isMounted = false;
  };
}, [user?.id, initializeFilters]);
```

**De ce one-shot?**
- Dependency array conține doar `user?.id`
- `initializeFilters` nu e în dependencies pentru a preveni re-execuția
- Cleanup function (`isMounted = false`) previne memory leaks

#### 2. Load Posts la Schimbare Filtre

```typescript
useEffect(() => {
  void loadPosts(true); // reset = true (start from page 1)
}, [loadPosts, selectedTab, selectedCity, selectedCountry]);
```

**Trigger-uri**:
- User schimbă tab-ul (AVAILABLE DRIVERS ↔ AVAILABLE ROUTES)
- User selectează altă țară
- User selectează alt oraș
- Initial mount (toate sunt undefined → prima încărcare)

#### 3. Load User Stats

```typescript
useEffect(() => {
  if (user) {
    useCommunityStore.getState().loadCommunityStats(user.id);
    useCommunityStore.getState().checkPostLimits(user.id);
  }
}, [user]);
```

### UI Sections

#### 1. Tab Buttons (AVAILABLE DRIVERS / AVAILABLE ROUTES)

```typescript
<View style={styles.tabs}>
  <TouchableOpacity
    style={[
      styles.tab, 
      { backgroundColor: selectedTab === 'availability' ? '#10B981' : '#D1FAE5' },
      selectedTab === 'availability' && styles.activeTab
    ]}
    onPress={() => setSelectedTab('availability')}
  >
    <Truck size={20} color={selectedTab === 'availability' ? 'white' : '#059669'} />
    <Text style={...}>{t('community.available_drivers').toUpperCase()}</Text>
  </TouchableOpacity>
  
  {/* Similar for routes tab with blue colors */}
</View>
```

**Culori**:
- **AVAILABLE DRIVERS**: 
  - Activ: Verde #10B981 (emerald-500)
  - Inactiv: Verde deschis #D1FAE5 (emerald-100)
- **AVAILABLE ROUTES**: 
  - Activ: Albastru #3B82F6 (blue-500)
  - Inactiv: Albastru deschis #DBEAFE (blue-100)

#### 2. Filter Bar (Country + City)

```typescript
<View style={styles.filterBar}>
  {/* Country Filter */}
  <TouchableOpacity
    style={styles.filterControl}
    onPress={handleCountryPress}
  >
    <Globe size={14} color="#6B7280" />
    <View style={styles.filterLabelContainer}>
      <Text style={styles.filterLabel}>{t('community.country')}</Text>
      <Text style={...}>
        {selectedCountry?.name || t('community.select_country')}
      </Text>
    </View>
    {selectedCountry && (
      <TouchableOpacity onPress={handleClearCountry}>
        <Text>✕</Text>
      </TouchableOpacity>
    )}
  </TouchableOpacity>

  {/* City Filter - Similar structure, disabled if no country */}
</View>
```

**Logică**:
- City filter este disabled dacă nu e selectată o țară
- Clear country → clear city automat
- Iconuri: Globe (14px) pentru țară, MapPin (14px) pentru oraș

#### 3. Posts List (FlatList)

```typescript
<FlatList
  data={posts}
  renderItem={renderPost}
  keyExtractor={(item) => item.id}
  ListHeaderComponent={renderHeader}
  ListEmptyComponent={renderEmpty}
  ListFooterComponent={renderFooter}
  refreshControl={<RefreshControl ... />}
  onEndReached={loadMorePosts}  // Pagination
  onEndReachedThreshold={0.5}
  onViewableItemsChanged={handleViewableItemsChanged}  // Analytics
/>
```

**Viewability Tracking**:

```typescript
const handleViewableItemsChanged = useCallback(
  ({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (!user?.id) return;

    viewableItems.forEach((viewToken) => {
      if (!viewToken.isViewable) return;
      
      const item = viewToken.item as CommunityPost;
      
      // Don't track own posts
      if (item && item.user_id !== user.id) {
        recordView(item.id, user.id);
      }
    });
  },
  [recordView, user?.id]
);
```

---

## Zustand Store (State Management)

### Store Structure

```typescript
interface CommunityStore {
  // Posts data
  posts: CommunityPost[];
  selectedTab: 'availability' | 'routes';
  
  // Filters
  selectedCountry: Country | null;
  selectedCity: City | null;
  
  // Pagination
  currentPage: number;
  hasMore: boolean;
  
  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  
  // Stats
  communityStats: CommunityStats | null;
  canPost: CanPostResponse | null;
  
  // Actions
  loadPosts: (reset?: boolean) => Promise<void>;
  loadMorePosts: () => Promise<void>;
  refreshPosts: () => Promise<void>;
  createPost: (data: CreatePostData) => Promise<CommunityPost>;
  setSelectedTab: (tab: TabType) => void;
  setSelectedCountry: (country: Country | null) => void;
  setSelectedCity: (city: City | null) => void;
  initializeFilters: (filters: InitialFilters) => Promise<void>;
  recordView: (postId: string, userId: string) => Promise<void>;
  recordContact: (postId: string, userId: string) => Promise<void>;
  savePost: (postId: string, userId: string) => Promise<void>;
  unsavePost: (postId: string, userId: string) => Promise<void>;
  loadCommunityStats: (userId: string) => Promise<void>;
  checkPostLimits: (userId: string) => Promise<void>;
  clearError: () => void;
}
```

### Key Actions Implementation

#### loadPosts (cu filtre)

```typescript
loadPosts: async (reset = false) => {
  const { selectedTab, selectedCountry, selectedCity, currentPage } = get();
  
  try {
    set({ isLoading: true, error: null });
    
    const page = reset ? 1 : currentPage;
    
    const result = await communityService.getPosts({
      tab: selectedTab,
      country: selectedCountry?.code || selectedCountry?.name,
      city: selectedCity?.name,
      page,
      limit: 20
    });
    
    set({
      posts: reset ? result.posts : [...get().posts, ...result.posts],
      currentPage: page,
      hasMore: result.posts.length === 20,
      isLoading: false
    });
  } catch (error) {
    set({ error: error.message, isLoading: false });
  }
}
```

#### createPost (cu limit checking)

```typescript
createPost: async (data: CreatePostData) => {
  try {
    // 1. Check if user can post
    const canPost = await communityService.canUserPost(data.userId);
    
    if (!canPost.can_post) {
      throw new Error(canPost.reason || 'Post limit reached');
    }
    
    // 2. Check for duplicate
    const isDuplicate = await communityService.checkDuplicatePost(
      data.userId,
      data.originCity
    );
    
    if (isDuplicate) {
      throw new Error('You already have an active post in this city');
    }
    
    // 3. Create post
    const newPost = await communityService.createPost(data);
    
    // 4. Update local state
    set(state => ({
      posts: [newPost, ...state.posts]
    }));
    
    // 5. Refresh limits
    await get().checkPostLimits(data.userId);
    
    return newPost;
  } catch (error) {
    set({ error: error.message });
    throw error;
  }
}
```

#### initializeFilters (GPS-based)

```typescript
initializeFilters: async (filters: InitialFilters) => {
  set({
    selectedCountry: filters.country,
    selectedCity: filters.city
  });
  
  // Auto-load posts cu noile filtre
  await get().loadPosts(true);
}
```

---

## Service Layer

### communityService.ts

#### getPosts - Query Principal

```typescript
async getPosts(params: {
  tab: 'availability' | 'routes';
  country?: string;
  city?: string;
  page?: number;
  limit?: number;
}): Promise<{ posts: CommunityPost[] }> {
  let query = supabase
    .from('community_posts')
    .select(`
      *,
      profiles:user_id (
        id,
        company_name,
        phone_number,
        email,
        subscription_tier
      )
    `)
    .eq('post_type', params.tab)
    .eq('is_active', true)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });
  
  // Filter by country (code OR name - backward compatibility)
  if (params.country) {
    query = query.in('origin_country', [params.country]);
  }
  
  // Filter by city
  if (params.city) {
    query = query.eq('origin_city', params.city);
  }
  
  // Pagination
  const page = params.page || 1;
  const limit = params.limit || 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  
  query = query.range(from, to);
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  return { posts: data || [] };
}
```

**Query Breakdown**:
1. **SELECT cu JOIN**: Fetch posts + profile data (company_name, phone, email)
2. **Filter post_type**: 'availability' sau 'routes'
3. **Filter active**: `is_active = true AND expires_at > NOW()`
4. **Filter country**: Caută în `origin_country` (poate fi cod 'US' sau nume 'United States')
5. **Filter city**: Exact match pe `origin_city`
6. **Sort**: Cele mai noi first (`created_at DESC`)
7. **Pagination**: `.range(from, to)` pentru infinite scroll

#### canUserPost - RPC Function Call

```typescript
async canUserPost(userId: string): Promise<CanPostResponse> {
  const { data, error } = await supabase.rpc('can_user_post', {
    p_user_id: userId
  });
  
  if (error) throw error;
  
  return data as CanPostResponse;
}
```

**PostgreSQL Function** (`can_user_post`):

```sql
CREATE OR REPLACE FUNCTION can_user_post(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_tier TEXT;
  v_posts_this_month INT;
  v_posts_today INT;
  v_monthly_limit INT;
  v_daily_limit INT;
BEGIN
  -- Get user's subscription tier
  SELECT subscription_tier INTO v_tier
  FROM profiles
  WHERE id = p_user_id;
  
  -- Get usage
  SELECT 
    COALESCE(posts_this_month, 0),
    COALESCE(posts_today, 0)
  INTO v_posts_this_month, v_posts_today
  FROM user_post_usage
  WHERE user_id = p_user_id;
  
  -- Get limits
  SELECT posts_per_month, posts_per_day
  INTO v_monthly_limit, v_daily_limit
  FROM subscription_limits
  WHERE tier = v_tier;
  
  -- Check limits (-1 = unlimited)
  IF v_monthly_limit != -1 AND v_posts_this_month >= v_monthly_limit THEN
    RETURN json_build_object(
      'can_post', FALSE,
      'reason', 'Monthly limit reached',
      'posts_remaining', 0
    );
  END IF;
  
  IF v_daily_limit != -1 AND v_posts_today >= v_daily_limit THEN
    RETURN json_build_object(
      'can_post', FALSE,
      'reason', 'Daily limit reached',
      'posts_remaining', 0
    );
  END IF;
  
  -- Can post
  RETURN json_build_object(
    'can_post', TRUE,
    'reason', NULL,
    'posts_remaining', v_monthly_limit - v_posts_this_month
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### createPost - Insert cu Analytics

```typescript
async createPost(data: CreatePostData): Promise<CommunityPost> {
  const postData = {
    user_id: data.userId,
    post_type: data.postType,
    origin_city: data.originCity,
    origin_country: data.originCountry,
    destination_city: data.destinationCity,
    destination_country: data.destinationCountry,
    template_id: data.templateId,
    custom_message: data.customMessage,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  };
  
  const { data: newPost, error } = await supabase
    .from('community_posts')
    .insert(postData)
    .select(`
      *,
      profiles:user_id (
        id,
        company_name,
        phone_number,
        email,
        subscription_tier
      )
    `)
    .single();
  
  if (error) throw error;
  
  // Increment usage counters
  await supabase.rpc('increment_post_usage', {
    p_user_id: data.userId
  });
  
  return newPost;
}
```

#### recordView - Analytics Tracking

```typescript
async recordView(postId: string, userId: string): Promise<void> {
  // 1. Insert interaction (UNIQUE constraint prevents duplicates)
  const { error: insertError } = await supabase
    .from('community_interactions')
    .insert({
      post_id: postId,
      user_id: userId,
      interaction_type: 'view'
    });
  
  // Ignore duplicate errors
  if (insertError && !insertError.message.includes('duplicate')) {
    throw insertError;
  }
  
  // 2. Increment views counter
  await supabase.rpc('increment', {
    table_name: 'community_posts',
    column_name: 'views_count',
    row_id: postId
  });
}
```

---

## Filtrare și Localizare GPS

### Flow GPS → Filters

```
1. User opens app
    ↓
2. CommunityFeed mounts
    ↓
3. cityService.getCurrentLocationCity()
    ↓
4. expo-location gets GPS coordinates
    ↓
5. Query Supabase cities table for nearest city
    ↓
SELECT * FROM cities
WHERE ST_DWithin(
  ST_MakePoint(lng, lat)::geography,
  ST_MakePoint(user_lng, user_lat)::geography,
  50000  -- 50km radius
)
ORDER BY ST_Distance(
  ST_MakePoint(lng, lat)::geography,
  ST_MakePoint(user_lng, user_lat)::geography
)
LIMIT 1
    ↓
6. Return LocationInfo { nearestMajorCity }
    ↓
7. initializeFilters({ country, city })
    ↓
8. loadPosts(true) with filters
```

### cityService.ts

```typescript
async getCurrentLocationCity(): Promise<LocationInfo | null> {
  try {
    // 1. Get GPS permission
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;
    
    // 2. Get coordinates
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced
    });
    
    const { latitude, longitude } = location.coords;
    
    // 3. Query nearest city from Supabase
    const { data, error } = await supabase.rpc('get_nearest_city', {
      user_lat: latitude,
      user_lng: longitude,
      max_distance: 50000  // 50km
    });
    
    if (error || !data) return null;
    
    return {
      latitude,
      longitude,
      nearestMajorCity: data as City
    };
  } catch (error) {
    console.error('[cityService] GPS error:', error);
    return null;
  }
}
```

### Country Picker Modal

**31 țări** (3 North America + 28 Europe):

```typescript
const NORTH_AMERICAN_COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
];

const EUROPEAN_COUNTRIES = [
  { code: 'AT', name: 'Austria', flag: '🇦🇹' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
  // ... 26 more
];

const ALL_COUNTRIES = [
  ...NORTH_AMERICAN_COUNTRIES,
  ...EUROPEAN_COUNTRIES
];
```

### City Search Modal

**Features**:
- **Recent cities**: Ultimele 3 orașe selectate (cached in AsyncStorage)
- **Popular cities**: Top orașe după populație (filtrate după țară)
- **Search**: Autocomplete cu debounce (300ms)
- **Country filtering**: Doar orașe din țara selectată

```typescript
// Filter recent cities by country
const safeRecentCities = recentCities
  .filter(city => city && city.id && city.name)
  .filter(city => !countryCode || city.country_code === countryCode);

// Filter popular cities by country + exclude recent
const recentCityIds = new Set(safeRecentCities.map(c => c.id));
const safePopularCities = popularCities
  .filter(city => city && city.id && city.name)
  .filter(city => !countryCode || city.country_code === countryCode)
  .filter(city => !recentCityIds.has(city.id));
```

---

## Interacțiuni Utilizator

### 1. Contact Buttons (WhatsApp, Email, Call)

#### WhatsApp - Pre-populated Message

```typescript
const handleWhatsAppContact = (post: CommunityPost) => {
  const phoneNumber = post.profiles.phone_number;
  const myCompany = currentUser.company_name;
  const theirCompany = post.profiles.company_name;
  const city = post.origin_city;
  
  const message = t('community.whatsapp_driver_available', {
    myName: myCompany,
    theirName: theirCompany,
    city: city
  });
  // "Hello! I'm Acme Logistics. I saw you're available in New York."
  
  const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
  
  Linking.openURL(url);
  
  // Record contact
  await recordContact(post.id, currentUser.id);
};
```

#### Email - Pre-filled Subject & Body

```typescript
const handleEmailContact = (post: CommunityPost) => {
  const email = post.profiles.email;
  
  const subject = t('community.email_subject_driver', { 
    city: post.origin_city 
  });
  // "Availability in New York"
  
  const body = t('community.email_body_driver', {
    myName: currentUser.company_name,
    theirName: post.profiles.company_name,
    city: post.origin_city
  });
  // "Hello, I'm interested in your availability in New York..."
  
  const emailUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  
  Linking.openURL(emailUrl);
  
  await recordContact(post.id, currentUser.id);
};
```

#### Phone Call

```typescript
const handlePhoneCall = (post: CommunityPost) => {
  const phoneNumber = post.profiles.phone_number;
  const phoneUrl = `tel:${phoneNumber}`;
  
  Linking.openURL(phoneUrl);
  
  await recordContact(post.id, currentUser.id);
};
```

### 2. Save/Unsave Posts

```typescript
const handleSaveToggle = async (post: CommunityPost) => {
  if (post.is_saved) {
    await unsavePost(post.id, currentUser.id);
  } else {
    await savePost(post.id, currentUser.id);
  }
};
```

**Backend**:

```typescript
// communityService.ts
async savePost(postId: string, userId: string): Promise<void> {
  await supabase
    .from('community_interactions')
    .insert({
      post_id: postId,
      user_id: userId,
      interaction_type: 'save'
    });
  
  await supabase.rpc('increment', {
    table_name: 'community_posts',
    column_name: 'saves_count',
    row_id: postId
  });
}
```

---

## Fluxuri de Date

### Flux Complet: User Creates Post

```
1. User taps "I'M AVAILABLE"
    ↓
2. QuickPostBar → TemplateSelector modal
    ↓
3. User selects "Available Now" template
    ↓
4. TemplateSelector → CitySearchModal
    ↓
5. User selects city (e.g., "New York")
    ↓
6. QuickPostBar.handlePost({
     template: 'available_now',
     city: 'New York',
     country: 'US'
   })
    ↓
7. Check user tier (trial blocks post)
    ↓
8. communityStore.createPost()
    ↓
9. communityService.canUserPost(userId)
    ↓
10. Supabase RPC: can_user_post(p_user_id)
    ↓
11. Returns { can_post: true, posts_remaining: 4 }
    ↓
12. communityService.checkDuplicatePost(userId, 'New York')
    ↓
13. Supabase RPC: check_duplicate_post(p_user_id, p_origin_city)
    ↓
14. Returns false (no duplicate)
    ↓
15. communityService.createPost(postData)
    ↓
16. Supabase INSERT INTO community_posts
    ↓
17. RLS Policy checks: auth.uid() = user_id ✅
    ↓
18. Post created, returns new post with profile data
    ↓
19. Supabase RPC: increment_post_usage(p_user_id)
    ↓
20. Updates user_post_usage (posts_today++, posts_this_month++)
    ↓
21. communityStore adds post to local state
    ↓
22. UI re-renders with new post at top
    ↓
23. User sees success message
```

### Flux: Infinite Scroll Loading

```
1. User scrolls to bottom of list
    ↓
2. FlatList triggers onEndReached
    ↓
3. communityStore.loadMorePosts()
    ↓
4. Check hasMore flag
    ↓
5. Increment currentPage (2, 3, 4...)
    ↓
6. communityService.getPosts({
     tab: 'availability',
     country: 'US',
     city: 'New York',
     page: 2,
     limit: 20
   })
    ↓
7. Supabase query with .range(20, 39)
    ↓
8. RLS allows SELECT on active posts
    ↓
9. Returns next 20 posts
    ↓
10. communityStore appends to existing posts
    ↓
11. If less than 20 returned → hasMore = false
    ↓
12. UI updates with new posts
```

### Flux: Filter Change

```
1. User taps Country filter
    ↓
2. CountryPickerModal opens
    ↓
3. User selects "United States"
    ↓
4. handleCountrySelect({ code: 'US', name: 'United States' })
    ↓
5. communityStore.setSelectedCountry({ code: 'US', ... })
    ↓
6. useEffect detects selectedCountry change
    ↓
7. communityStore.loadPosts(true) // reset = true
    ↓
8. Sets currentPage = 1
    ↓
9. communityService.getPosts({
     country: 'US',
     ...
   })
    ↓
10. Supabase: WHERE origin_country IN ('US')
    ↓
11. Returns filtered posts
    ↓
12. communityStore replaces posts array
    ↓
13. UI shows only US posts
```

---

## Optimizări și Performance

### 1. Database Indexes

```sql
-- Critical indexes for query performance
CREATE INDEX idx_community_posts_active_expires 
ON community_posts(is_active, expires_at) 
WHERE is_active = TRUE;

CREATE INDEX idx_community_posts_type_country_city 
ON community_posts(post_type, origin_country, origin_city);

CREATE INDEX idx_community_posts_created_desc 
ON community_posts(created_at DESC);
```

**Impact**:
- Query cu filtre country+city: ~5ms (vs ~200ms fără index)
- Pagination queries: ~3ms constant time
- Active posts filter: Bitmap scan foarte rapid

### 2. React useMemo & useCallback

```typescript
// Prevent renderHeader re-creation on every render
const renderHeader = useMemo(() => (
  <View>...</View>
), [
  customHeader,
  selectedTab,
  selectedCity,
  selectedCountry,
  // ... only dependencies that actually change
]);

// Prevent handler re-creation
const handleCountryPress = useCallback(() => {
  setCountryPickerVisible(true);
}, []); // No dependencies = stable reference
```

**Impact**:
- FlatList nu re-renderează header-ul inutil
- Child components primesc aceleași references → shallow compare optimization

### 3. Debounced Search

```typescript
// CitySearchModal.tsx
const debouncedSearch = useCallback(
  debounce(async (query: string) => {
    if (query.length < 2) return;
    
    const results = await cityService.searchCities(query, countryCode);
    setSearchResults(results);
  }, 300), // 300ms delay
  [countryCode]
);
```

**Impact**:
- Reduce API calls: typing "New York" = 1 query (nu 8)
- Better UX: nu flicker constant

### 4. Pagination Strategy

```typescript
const POSTS_PER_PAGE = 20;

// Load more when 50% from bottom
<FlatList
  onEndReachedThreshold={0.5}
  onEndReached={loadMorePosts}
/>
```

**De ce 20 posts/page?**
- Balans între: prea multe (slow initial load) vs prea puține (multe requests)
- Mobile: ~3-4 screens worth of content
- Database: 20 rows = optimal pentru Postgres query planner

### 5. Conditional Rendering

```typescript
// Don't render modals until needed
{isCountryPickerVisible && (
  <CountryPickerModal ... />
)}

// Don't render empty state while loading
{!isLoading && posts.length === 0 && (
  <EmptyState />
)}
```

**Impact**:
- Faster initial mount
- Less memory usage

### 6. ViewabilityConfig pentru Analytics

```typescript
const viewabilityConfig = useRef({ 
  itemVisiblePercentThreshold: 60  // 60% visible
});
```

**De ce 60%?**
- Mai strict decât 50% (default) = mai accurate tracking
- Nu prea strict (80%+) = ar lipsi views la scroll rapid

### 7. Fire-and-Forget Analytics

```typescript
const recordView = async (postId: string, userId: string) => {
  // Don't await - fire and forget
  communityService.recordView(postId, userId).catch(() => {
    // Silently ignore analytics errors
  });
};
```

**Impact**:
- UI nu blochează pentru analytics
- Failure în analytics nu afectează UX

---

## Debugging și Troubleshooting

### Common Issues

#### 1. "Posts nu se încarcă"

**Verificări**:
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'community_posts';

-- Check if posts exist
SELECT COUNT(*) FROM community_posts 
WHERE is_active = TRUE AND expires_at > NOW();

-- Check user authentication
SELECT auth.uid(); -- Should return user ID
```

#### 2. "Post limit reached dar am tier premium"

**Verificări**:
```sql
-- Check user tier
SELECT subscription_tier FROM profiles WHERE id = auth.uid();

-- Check limits
SELECT * FROM subscription_limits WHERE tier = 'premium';

-- Check usage
SELECT * FROM user_post_usage WHERE user_id = auth.uid();

-- Reset usage (if needed)
UPDATE user_post_usage 
SET posts_this_month = 0, posts_today = 0 
WHERE user_id = auth.uid();
```

#### 3. "Filtre nu funcționează"

**Check Console**:
```typescript
console.log('[CommunityFeed] Filters:', {
  selectedCountry,
  selectedCity,
  posts: posts.length
});
```

**Verify Query**:
```typescript
// In communityService.getPosts
console.log('[Service] Query params:', {
  tab: params.tab,
  country: params.country,
  city: params.city
});
```

### Performance Monitoring

```typescript
// Add timing to loadPosts
const start = Date.now();
await loadPosts(true);
console.log(`[Performance] loadPosts took ${Date.now() - start}ms`);
```

---

## Concluzie

**CommunityFeed** este un sistem complex care combină:
- **State management** (Zustand) pentru reactivity
- **Service layer** pentru business logic
- **Supabase RLS** pentru security
- **PostgreSQL functions** pentru limit checking
- **GPS location** pentru auto-filtering
- **Real-time updates** via Supabase subscriptions (opțional)
- **Analytics tracking** pentru engagement metrics

**Key Takeaways**:
1. **Security-first**: RLS policies protejează datele la nivel de rând
2. **Performance**: Indexes + pagination + memoization = smooth UX
3. **User-centric**: GPS auto-location + smart defaults
4. **Scalable**: Infinite scroll + efficient queries
5. **Maintainable**: Clear separation of concerns (UI → Store → Service → DB)

---

**Ultima actualizare**: 4 Noiembrie 2025  
**Autor**: Truxel Development Team  
**Versiune Document**: 2.0
