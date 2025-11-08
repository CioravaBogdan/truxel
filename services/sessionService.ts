import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

/**
 * SessionService - Manages automatic session refresh
 * 
 * Features:
 * - Checks session expiry every 5 minutes
 * - Auto-refreshes if expires in < 5 minutes
 * - Updates authStore with new session
 * - Singleton pattern for single interval
 */
class SessionService {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private checkIntervalMs = 5 * 60 * 1000; // 5 minutes
  private refreshThresholdMs = 5 * 60 * 1000; // Refresh if expires in < 5 minutes

  /**
   * Start session monitoring
   * Called when user logs in
   */
  start(): void {
    // Prevent multiple intervals
    if (this.intervalId) {
      console.log('[SessionService] Already running');
      return;
    }

    console.log('[SessionService] Starting session monitoring (5min interval)');
    
    // Check immediately on start
    this.checkAndRefresh();

    // Then check every 5 minutes
    this.intervalId = setInterval(() => {
      this.checkAndRefresh();
    }, this.checkIntervalMs);
  }

  /**
   * Stop session monitoring
   * Called when user logs out
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('[SessionService] Stopped session monitoring');
    }
  }

  /**
   * Check session expiry and refresh if needed
   */
  private async checkAndRefresh(): Promise<void> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('[SessionService] Error getting session:', error);
        return;
      }

      if (!session) {
        console.log('[SessionService] No active session');
        this.stop(); // Stop if no session
        return;
      }

      const expiresAt = session.expires_at;
      if (!expiresAt) {
        console.warn('[SessionService] Session missing expires_at');
        return;
      }

      const now = Math.floor(Date.now() / 1000); // Unix timestamp in seconds
      const timeUntilExpiry = expiresAt - now;
      const minutesUntilExpiry = Math.floor(timeUntilExpiry / 60);

      console.log(`[SessionService] Session expires in ${minutesUntilExpiry} minutes`);

      // Refresh if expires in less than 5 minutes
      if (timeUntilExpiry < this.refreshThresholdMs / 1000) {
        console.log('[SessionService] Refreshing session (expires soon)');
        
        const { data: { session: newSession }, error: refreshError } = 
          await supabase.auth.refreshSession();

        if (refreshError) {
          console.error('[SessionService] Refresh failed:', refreshError);
          return;
        }

        if (newSession) {
          console.log('[SessionService] Session refreshed successfully');
          
          // Update authStore with new session
          useAuthStore.getState().setSession(newSession);
        }
      }
    } catch (err) {
      console.error('[SessionService] Unexpected error:', err);
    }
  }

  /**
   * Get status (for debugging)
   */
  isRunning(): boolean {
    return this.intervalId !== null;
  }
}

// Export singleton instance
export const sessionService = new SessionService();
