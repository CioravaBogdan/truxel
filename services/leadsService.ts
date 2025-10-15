import { supabase } from '@/lib/supabase';
import { Lead, LeadStatus } from '@/types/database.types';

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
