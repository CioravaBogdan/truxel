import { supabase } from '@/lib/supabase';
import { Lead, LeadStatus } from '@/types/database.types';
import type { CommunityPost } from '@/types/community.types';

export const leadsService = {
  async getLeads(userId: string): Promise<Lead[]> {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getLeadsBySearch(searchId: string): Promise<Lead[]> {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('source_search_id', searchId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getLead(id: string): Promise<Lead | null> {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createLead(lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>): Promise<Lead> {
    const { data, error } = await supabase
      .from('leads')
      .insert(lead)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

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

  async updateLeadStatus(id: string, status: LeadStatus): Promise<Lead> {
    return this.updateLead(id, { status });
  },

  async updateLeadNotes(id: string, notes: string): Promise<Lead> {
    return this.updateLead(id, { user_notes: notes });
  },

  async deleteLead(id: string): Promise<void> {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Get converted leads (from Community Hot Leads)
   * Filters by source_type='community' to show only converted posts
   */
  async getConvertedLeads(userId: string): Promise<Lead[]> {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', userId)
      .eq('source_type', 'community')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Check if a lead with similar contact info already exists for this user
   * Checks for duplicate phone OR (duplicate email AND company name)
   */
  async isDuplicateLead(
    userId: string, 
    phone: string | null, 
    email: string | null, 
    companyName: string
  ): Promise<boolean> {
    // Build query conditions
    let query = supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Check for duplicate phone (if provided)
    if (phone) {
      const { count: phoneCount } = await query.eq('phone', phone);
      if (phoneCount && phoneCount > 0) {
        return true; // Duplicate found by phone
      }
    }

    // Check for duplicate email + company name (if both provided)
    if (email && companyName) {
      const { count: emailCount } = await supabase
        .from('leads')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('email', email)
        .eq('company_name', companyName);
      
      if (emailCount && emailCount > 0) {
        return true; // Duplicate found by email + company
      }
    }

    return false; // No duplicates found
  },

  /**
   * Convert a Community post to a permanent lead in My Book
   * Creates a new lead record with source_type='community' and source_id=post.id
   */
  async convertPostToLead(post: CommunityPost, userId: string): Promise<Lead> {
    // Extract clean city name from formatted text (e.g., "Podu Turcului - 98km..." → "Podu Turcului")
    const cleanCityName = post.origin_city?.split(' - ')[0] || post.origin_city;
    
    const phone = post.contact_phone || post.profile?.phone_number || null;
    const email = post.profile?.email || null;
    const companyName = post.profile?.company_name || 'Unknown Company';
    
    // Check for duplicates BEFORE creating lead
    const isDuplicate = await this.isDuplicateLead(userId, phone, email, companyName);
    
    if (isDuplicate) {
      throw new Error('DUPLICATE_LEAD'); // Special error code for UI handling
    }
    
    // Map CommunityPost fields to Lead fields
    const leadData = {
      user_id: userId,
      source_type: 'community',
      source_id: post.id,
      company_name: companyName,
      contact_person_name: post.profile?.full_name || null,
      email: email,
      phone: phone,
      whatsapp: post.contact_whatsapp ? phone : null,
      city: cleanCityName, // Use clean city name without distance info
      country: post.origin_country,
      latitude: post.origin_lat ? parseFloat(post.origin_lat.toString()) : null,
      longitude: post.origin_lng ? parseFloat(post.origin_lng.toString()) : null,
      description: `Converted from Community ${post.post_type === 'DRIVER_AVAILABLE' ? 'Driver' : 'Load'} post`,
      status: 'new' as LeadStatus,
      user_notes: `Origin: ${cleanCityName}${post.dest_city ? ` → Destination: ${post.dest_city}` : ''}`,
    };

    const { data, error } = await supabase
      .from('leads')
      .insert(leadData)
      .select()
      .single();

    if (error) throw error;
    return data;
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
