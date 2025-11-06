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
   * Convert a Community post to a permanent lead in My Book
   * Creates a new lead record with source_type='community' and source_id=post.id
   */
  async convertPostToLead(post: CommunityPost, userId: string): Promise<Lead> {
    // Map CommunityPost fields to Lead fields
    const leadData = {
      user_id: userId,
      source_type: 'community',
      source_id: post.id,
      company_name: post.profile?.company_name || 'Unknown Company',
      contact_person_name: post.profile?.full_name || null,
      email: post.profile?.email || null,
      phone: post.contact_phone || post.profile?.phone_number || null,
      whatsapp: post.contact_whatsapp ? (post.contact_phone || post.profile?.phone_number) : null,
      city: post.origin_city,
      country: post.origin_country,
      latitude: post.origin_lat ? parseFloat(post.origin_lat.toString()) : null,
      longitude: post.origin_lng ? parseFloat(post.origin_lng.toString()) : null,
      description: `Converted from Community ${post.post_type === 'DRIVER_AVAILABLE' ? 'Driver' : 'Load'} post`,
      status: 'new' as LeadStatus,
      user_notes: `Origin: ${post.origin_city}${post.dest_city ? ` → Destination: ${post.dest_city}` : ''}`,
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
