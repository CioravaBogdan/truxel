import { supabase } from '@/lib/supabase';
import { Lead, LeadStatus } from '@/types/database.types';
import type { CommunityPost } from '@/types/community.types';

type UserLeadWithLead = {
  id: string;
  status: LeadStatus;
  user_notes: string | null;
  saved_at: string;
  source_type: string;
  lead: Lead;
};

export const leadsService = {
  /**
   * Get all leads saved by a user (using user_leads junction table)
   * Returns leads with user-specific metadata (status, notes, saved_at)
   */
  async getLeads(userId: string): Promise<Lead[]> {
    const { data, error } = await supabase
      .from('user_leads')
      .select(`
        id,
        status,
        user_notes,
        saved_at,
        last_contacted_at,
        source_type,
        source_id,
        lead:leads!inner (
          id,
          company_name,
          contact_person_name,
          email,
          emails,
          phone,
          phones,
          whatsapp,
          linkedin,
          facebook,
          instagram,
          website,
          industry,
          address,
          city,
          country,
          latitude,
          longitude,
          description,
          ai_match_score,
          match_reasons,
          employee_count,
          founded_year,
          annual_revenue,
          social_links,
          review_count,
          snapchat,
          telegram,
          tiktok,
          X,
          yelp,
          youtube,
          company_id,
          keywords_searched,
          region,
          google_place_id,
          google_url_place,
          google_url_photo,
          potential_owner_profiles,
          followers,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', userId)
      .order('saved_at', { ascending: false });

    if (error) throw error;
    
    // Flatten the nested structure for backward compatibility
    return data?.map((ul: any) => ({
      id: ul.lead.id, // Lead ID from leads table
      user_lead_id: ul.id, // Junction table ID (for updates/deletes)
      ...ul.lead,
      status: ul.status,
      user_notes: ul.user_notes,
      saved_at: ul.saved_at,
      last_contacted_at: ul.last_contacted_at,
      source_type: ul.source_type,
      source_id: ul.source_id,
    })) || [];
  },

  /**
   * Get leads saved from a specific search
   * Uses user_leads junction table with source_search_id filter
   */
  async getLeadsBySearch(searchId: string): Promise<Lead[]> {
    const { data, error } = await supabase
      .from('user_leads')
      .select(`
        id,
        user_id,
        status,
        user_notes,
        saved_at,
        lead:leads!inner (*)
      `)
      .eq('source_search_id', searchId)
      .order('saved_at', { ascending: false });

    if (error) throw error;
    
    return data?.map((ul: any) => ({
      id: ul.lead.id,
      user_lead_id: ul.id,
      ...ul.lead,
      status: ul.status,
      user_notes: ul.user_notes,
      saved_at: ul.saved_at,
    })) || [];
  },

  /**
   * Get a single lead by ID (from leads table - shared company data)
   * Note: This returns the lead without user-specific metadata
   */
  async getLead(id: string): Promise<Lead | null> {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * Create/save a lead for a user using junction table
   * 1. Insert or get existing lead in leads table (company data)
   * 2. Create user_leads entry (user's relationship to lead)
   */
  async createLead(
    lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>, 
    userId: string
  ): Promise<Lead> {
    // Step 1: Insert lead (or get existing if duplicate phone)
    const { data: leadData, error: leadError } = await supabase
      .from('leads')
      .upsert({
        company_name: lead.company_name,
        contact_person_name: lead.contact_person_name,
        email: lead.email,
        emails: lead.emails,
        phone: lead.phone,
        phones: lead.phones,
        whatsapp: lead.whatsapp,
        linkedin: lead.linkedin,
        facebook: lead.facebook,
        instagram: lead.instagram,
        website: lead.website,
        industry: lead.industry,
        address: lead.address,
        city: lead.city,
        country: lead.country,
        latitude: lead.latitude,
        longitude: lead.longitude,
        description: lead.description,
        ai_match_score: lead.ai_match_score,
        match_reasons: lead.match_reasons,
        employee_count: lead.employee_count,
        founded_year: lead.founded_year,
        annual_revenue: lead.annual_revenue,
        social_links: lead.social_links,
        review_count: lead.review_count,
        snapchat: lead.snapchat,
        telegram: lead.telegram,
        tiktok: lead.tiktok,
        X: lead.X,
        yelp: lead.yelp,
        youtube: lead.youtube,
        company_id: lead.company_id,
        keywords_searched: lead.keywords_searched,
        region: lead.region,
        followers: lead.followers,
      }, {
        onConflict: 'phone', // Deduplicate by phone
        ignoreDuplicates: false,
      })
      .select()
      .single();

    if (leadError) throw leadError;

    // Step 2: Create user_leads entry (user's relationship to this lead)
    const { data: userLeadData, error: userLeadError } = await supabase
      .from('user_leads')
      .insert({
        user_id: userId,
        lead_id: leadData.id,
        status: (lead as any).status || 'new',
        user_notes: (lead as any).user_notes || null,
        source_type: (lead as any).source_type || 'search',
        source_id: (lead as any).source_id || null,
        source_search_id: (lead as any).source_search_id || null,
      })
      .select()
      .single();

    if (userLeadError) throw userLeadError;

    // Return combined lead data
    return {
      ...leadData,
      user_lead_id: userLeadData.id,
      status: userLeadData.status,
      user_notes: userLeadData.user_notes,
      saved_at: userLeadData.saved_at,
    };
  },

  /**
   * Update lead data (company info in leads table)
   * Note: This updates the shared lead data, not user-specific metadata
   */
  async updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
    const { data, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update user-specific lead status (in user_leads junction table)
   * @param userLeadId - ID from user_leads table (not leads.id!)
   */
  async updateLeadStatus(userLeadId: string, status: LeadStatus, userId: string): Promise<void> {
    const { error } = await supabase
      .from('user_leads')
      .update({ 
        status,
        last_contacted_at: status === 'contacted' ? new Date().toISOString() : undefined
      })
      .eq('id', userLeadId)
      .eq('user_id', userId); // Security: ensure user owns this relationship

    if (error) throw error;
  },

  /**
   * Update last_contacted_at timestamp (when user contacts lead via any method)
   * @param userLeadId - ID from user_leads table (not leads.id!)
   */
  async updateLastContacted(userLeadId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('user_leads')
      .update({ last_contacted_at: new Date().toISOString() })
      .eq('id', userLeadId)
      .eq('user_id', userId); // Security: ensure user owns this relationship

    if (error) throw error;
  },

  /**
   * Update user-specific lead notes (in user_leads junction table)
   * @param userLeadId - ID from user_leads table (not leads.id!)
   */
  async updateLeadNotes(userLeadId: string, userId: string, notes: string | null): Promise<void> {
    const { error } = await supabase
      .from('user_leads')
      .update({ user_notes: notes })
      .eq('id', userLeadId)
      .eq('user_id', userId); // Security: ensure user owns this relationship

    if (error) throw error;
  },

  /**
   * Delete (unsave) a lead for a user
   * Removes the user_leads entry, but keeps the lead in leads table
   * @param userLeadId - ID from user_leads table (not leads.id!)
   */
  async deleteLead(userLeadId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('user_leads')
      .delete()
      .eq('id', userLeadId)
      .eq('user_id', userId); // Security: ensure user owns this relationship

    if (error) throw error;
  },

  /**
   * Get converted leads (from Community Hot Leads)
   * Filters by source_type='community' to show only converted posts
   */
  async getConvertedLeads(userId: string): Promise<Lead[]> {
    const { data, error } = await supabase
      .from('user_leads')
      .select(`
        id,
        status,
        user_notes,
        saved_at,
        source_type,
        lead:leads!inner (*)
      `)
      .eq('user_id', userId)
      .eq('source_type', 'community')
      .order('saved_at', { ascending: false });

    if (error) throw error;
    
    return data?.map((ul: any) => ({
      id: ul.lead.id,
      user_lead_id: ul.id,
      ...ul.lead,
      status: ul.status,
      user_notes: ul.user_notes,
      saved_at: ul.saved_at,
      source_type: ul.source_type,
    })) || [];
  },

  /**
   * Promote an existing saved lead (from search) into My Book by toggling source_type
   * This avoids duplicate lead creation while reusing the same user_leads entry
   */
  async promoteLeadToMyBook(userLeadId: string, userId: string): Promise<Lead> {
    const timestamp = new Date().toISOString();

    const { data, error } = await supabase
      .from('user_leads')
      .update({
        source_type: 'community',
        saved_at: timestamp,
      })
      .eq('id', userLeadId)
      .eq('user_id', userId)
      .select(`
        id,
        status,
        user_notes,
        saved_at,
        source_type,
        lead:leads!inner (*)
      `)
      .single<UserLeadWithLead>();

    if (error) throw error;

    return {
      ...data.lead,
      id: data.lead.id,
      user_lead_id: data.id,
      status: data.status as LeadStatus,
      user_notes: data.user_notes ?? undefined,
      saved_at: data.saved_at,
      source_type: 'community',
    };
  },

  /**
   * Check if a lead with similar contact info already exists for this user
   * Uses user_leads junction table to check if user already saved this lead
   */
  async isDuplicateLead(
    userId: string, 
    phone: string | null, 
    email: string | null, 
    companyName: string
  ): Promise<boolean> {
    console.log('[isDuplicateLead] Starting check:', { userId, phone, email, companyName });
    
    // Check for duplicate phone (if provided)
    if (phone) {
      // First, find leads with this phone
      const { data: leadsWithPhone } = await supabase
        .from('leads')
        .select('id')
        .eq('phone', phone);
      
      console.log('[isDuplicateLead] Leads with phone:', leadsWithPhone);
      
      if (leadsWithPhone && leadsWithPhone.length > 0) {
        const leadIds = leadsWithPhone.map(l => l.id);
        
        // Check if user already saved any of these leads
        const { count: phoneCount } = await supabase
          .from('user_leads')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .in('lead_id', leadIds);
        
        console.log('[isDuplicateLead] Phone count in user_leads:', phoneCount);
        
        if (phoneCount && phoneCount > 0) {
          console.log('[isDuplicateLead] DUPLICATE FOUND by phone!');
          return true; // User already saved a lead with this phone
        }
      }
    }

    // Check for duplicate email + company name (if both provided)
    if (email && companyName) {
      const { data: existingLeads } = await supabase
        .from('leads')
        .select('id')
        .eq('email', email)
        .eq('company_name', companyName);
      
      if (existingLeads && existingLeads.length > 0) {
        const leadIds = existingLeads.map(l => l.id);
        
        const { count: emailCount } = await supabase
          .from('user_leads')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .in('lead_id', leadIds);
        
        if (emailCount && emailCount > 0) {
          return true; // User already saved a lead with this email + company
        }
      }
    }

    return false; // No duplicates found
  },

  /**
   * Convert a Community post to a permanent lead in My Book
   * Creates lead in leads table + user_leads entry
   */
  async convertPostToLead(post: CommunityPost, userId: string): Promise<Lead> {
    // Extract clean city name from formatted text (e.g., "Podu Turcului - 98km..." → "Podu Turcului")
    const cleanCityName = post.origin_city?.split(' - ')[0] || post.origin_city;
    
    const phone = post.contact_phone || post.profile?.phone_number || null;
    const email = post.profile?.email || null;
    const companyName = post.profile?.company_name || 'Unknown Company';
    
    console.log('[convertPostToLead] Checking duplicate for:', {
      phone,
      email,
      companyName,
      postId: post.id,
      userId
    });
    
    // Check for duplicates BEFORE creating lead
    const isDuplicate = await this.isDuplicateLead(userId, phone, email, companyName);
    
    console.log('[convertPostToLead] isDuplicate result:', isDuplicate);
    
    if (isDuplicate) {
      throw new Error('DUPLICATE_LEAD'); // Special error code for UI handling
    }
    
    // Step 1: Check if lead already exists in leads table (by phone or email)
    let leadData: any;
    
    const { data: existingLeads, error: searchError } = await supabase
      .from('leads')
      .select('*')
      .or(`phone.eq.${phone},email.eq.${email}`)
      .limit(1);
    
    if (searchError) throw searchError;
    
    if (existingLeads && existingLeads.length > 0) {
      // Lead already exists - reuse it
      leadData = existingLeads[0];
    } else {
      // Create new lead
      const lat = post.origin_lat ? parseFloat(post.origin_lat.toString()) : null;
      const lng = post.origin_lng ? parseFloat(post.origin_lng.toString()) : null;
      
      const { data: newLead, error: createError } = await supabase
        .from('leads')
        .insert({
          user_id: userId, // ✅ Add user_id for backward compatibility
          company_name: companyName,
          contact_person_name: post.profile?.full_name || null,
          email: email,
          phone: phone,
          whatsapp: post.contact_whatsapp ? phone : null,
          city: cleanCityName,
          country: post.origin_country,
          latitude: lat,
          longitude: lng,
          // Generate Google Maps URL if we have coordinates
          google_url_place: (lat && lng) 
            ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
            : null,
          description: `Converted from Community ${post.post_type === 'DRIVER_AVAILABLE' ? 'Driver' : 'Load'} post`,
        })
        .select()
        .single();
      
      if (createError) throw createError;
      leadData = newLead;
    }

    // Step 2: Create user_leads entry
    const { data: userLeadData, error: userLeadError } = await supabase
      .from('user_leads')
      .insert({
        user_id: userId,
        lead_id: leadData.id,
        status: 'new',
        user_notes: `Origin: ${cleanCityName}${post.dest_city ? ` → Destination: ${post.dest_city}` : ''}`,
        source_type: 'community',
        source_id: post.id,
      })
      .select()
      .single();

    if (userLeadError) throw userLeadError;

    // Return combined data
    return {
      ...leadData,
      user_lead_id: userLeadData.id,
      status: userLeadData.status,
      user_notes: userLeadData.user_notes,
      saved_at: userLeadData.saved_at,
    };
  },

  async exportLeadsToCSV(leads: Lead[]): Promise<string> {
    const headers = [
      'Company Name',
      'Contact Person',
      'Email',
      'Phone',
      'WhatsApp',
      'Address',
      'City',
      'Industry',
      'Status',
      'Notes',
      'Date Added',
    ];

    const rows = leads.map(lead => [
      lead.company_name,
      lead.contact_person_name || '',
      lead.email || '',
      lead.phone || '',
      lead.whatsapp || '',
      lead.address || '',
      lead.city || '',
      lead.industry || '',
      lead.status,
      lead.user_notes || '',
      new Date(lead.created_at).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    return csvContent;
  },
};
