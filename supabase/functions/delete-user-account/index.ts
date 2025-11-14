// Supabase Edge Function: Delete User Account (GDPR Compliance)
// Deletes ALL user data except public leads table (those are shared resources)

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.58.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key (bypasses RLS)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get user from JWT token
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = user.id;

    console.log(`[DELETE ACCOUNT] Starting deletion for user: ${userId}`);

    // ============================================
    // DELETE USER DATA IN CORRECT ORDER
    // (respecting foreign key constraints)
    // ============================================

    // 1. Delete community interactions (saves/unsaves)
    const { error: interactionsError } = await supabaseAdmin
      .from('community_interactions')
      .delete()
      .eq('user_id', userId);
    
    if (interactionsError) {
      console.error('Error deleting community_interactions:', interactionsError);
    }

    // 2. Delete user post usage tracking
    const { error: postUsageError } = await supabaseAdmin
      .from('user_post_usage')
      .delete()
      .eq('user_id', userId);
    
    if (postUsageError) {
      console.error('Error deleting user_post_usage:', postUsageError);
    }

    // 3. Delete community posts (user's own posts)
    const { error: postsError } = await supabaseAdmin
      .from('community_posts')
      .delete()
      .eq('user_id', userId);
    
    if (postsError) {
      console.error('Error deleting community_posts:', postsError);
    }

    // 4. Delete user_leads junction table entries (IMPORTANT: This removes My Book leads)
    const { error: userLeadsError } = await supabaseAdmin
      .from('user_leads')
      .delete()
      .eq('user_id', userId);
    
    if (userLeadsError) {
      console.error('Error deleting user_leads:', userLeadsError);
    }

    // 5. Delete search history
    const { error: searchesError } = await supabaseAdmin
      .from('searches')
      .delete()
      .eq('user_id', userId);
    
    if (searchesError) {
      console.error('Error deleting searches:', searchesError);
    }

    // 6. Delete transactions
    const { error: transactionsError } = await supabaseAdmin
      .from('transactions')
      .delete()
      .eq('user_id', userId);
    
    if (transactionsError) {
      console.error('Error deleting transactions:', transactionsError);
    }

    // 7. Delete user search credits
    const { error: creditsError } = await supabaseAdmin
      .from('user_search_credits')
      .delete()
      .eq('user_id', userId);
    
    if (creditsError) {
      console.error('Error deleting user_search_credits:', creditsError);
    }

    // 8. Delete support messages (if table exists)
    try {
      const { error: supportError } = await supabaseAdmin
        .from('support_messages')
        .delete()
        .eq('user_id', userId);
      
      if (supportError && !supportError.message.includes('does not exist')) {
        console.error('Error deleting support_messages:', supportError);
      }
    } catch (e) {
      console.log('support_messages table does not exist, skipping');
    }

    // 9. Delete notification log
    const { error: notificationsError } = await supabaseAdmin
      .from('notification_log')
      .delete()
      .eq('user_id', userId);
    
    if (notificationsError) {
      console.error('Error deleting notification_log:', notificationsError);
    }

    // 10. Delete user profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('user_id', userId);
    
    if (profileError) {
      console.error('Error deleting profile:', profileError);
    }

    // 11. Delete avatar from storage (if exists)
    try {
      const { data: files } = await supabaseAdmin.storage
        .from('profiles-avatars')
        .list(userId);
      
      if (files && files.length > 0) {
        const filePaths = files.map(file => `${userId}/${file.name}`);
        await supabaseAdmin.storage
          .from('profiles-avatars')
          .remove(filePaths);
      }
    } catch (e) {
      console.log('Error deleting avatar:', e);
    }

    // 12. FINAL STEP: Delete auth user (this cascades to auth-related tables)
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    if (deleteUserError) {
      console.error('Error deleting auth user:', deleteUserError);
      throw new Error('Failed to delete authentication account');
    }

    console.log(`[DELETE ACCOUNT] Successfully deleted all data for user: ${userId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Account and all associated data deleted successfully' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('[DELETE ACCOUNT] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
