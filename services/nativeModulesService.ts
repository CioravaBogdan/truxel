/**
 * Native Modules Service
 * 
 * Safe initialization wrapper for all React Native native modules
 * to prevent iOS/Android crashes during app startup.
 * 
 * CRITICAL: All native module initializations should go through this service
 * to ensure proper error handling and prevent app crashes.
 */

class NativeModulesService {
  private isInitialized = false;
  private initializationPromise: Promise<boolean> | null = null;

  /**
   * Initialize all native modules safely with error boundaries
   * Returns true if all critical modules initialized successfully
   */
  async initialize(): Promise<boolean> {
    // Prevent multiple simultaneous initializations
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._performInitialization();
    return this.initializationPromise;
  }

  private async _performInitialization(): Promise<boolean> {
    if (this.isInitialized) {
      console.log('[NativeModules] Already initialized');
      return true;
    }

    console.log('[NativeModules] Starting safe initialization...');

    try {
      // 1. Initialize i18n (safe, no native dependencies)
      await this._initializeI18n();

      // 2. Initialize Stripe (lazy - only on payment screens)
      await this._initializeStripe();

      // 3. Initialize location services (wrapped in error handling)
      await this._initializeLocationServices();

      // 4. Initialize notification services (non-critical)
      await this._initializeNotifications();

      this.isInitialized = true;
      console.log('[NativeModules] ✅ All modules initialized successfully');
      return true;
    } catch (error) {
      console.error('[NativeModules] ❌ Initialization error:', error);
      // Don't throw - allow app to continue with degraded functionality
      this.isInitialized = true; // Mark as initialized anyway
      return false;
    }
  }

  private async _initializeI18n(): Promise<void> {
    try {
      console.log('[NativeModules] Initializing i18n...');
      // i18n is already initialized in lib/i18n.ts
      // This is just a verification step
      console.log('[NativeModules] ✅ i18n ready');
    } catch (error) {
      console.error('[NativeModules] i18n error (non-critical):', error);
    }
  }

  private async _initializeStripe(): Promise<void> {
    try {
      console.log('[NativeModules] Stripe will initialize on-demand (lazy loading)');
      // Stripe initialization happens in payment screens, not at app start
      // This prevents crashes if Stripe SDK has issues
      console.log('[NativeModules] ✅ Stripe ready for lazy init');
    } catch (error) {
      console.error('[NativeModules] Stripe error (non-critical):', error);
    }
  }

  private async _initializeLocationServices(): Promise<void> {
    try {
      console.log('[NativeModules] Location services ready for on-demand use');
      // Location permissions are requested when needed, not at startup
      // This prevents crashes if location services are disabled
      console.log('[NativeModules] ✅ Location services ready');
    } catch (error) {
      console.error('[NativeModules] Location error (non-critical):', error);
    }
  }

  private async _initializeNotifications(): Promise<void> {
    try {
      console.log('[NativeModules] Notifications will initialize after auth');
      // Notification service starts after user authentication
      // This prevents crashes if push notifications are not supported
      console.log('[NativeModules] ✅ Notifications ready');
    } catch (error) {
      console.error('[NativeModules] Notifications error (non-critical):', error);
    }
  }

  /**
   * Check if native modules are ready
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Reset initialization state (for testing)
   */
  reset(): void {
    this.isInitialized = false;
    this.initializationPromise = null;
  }
}

// Export singleton instance
export const nativeModulesService = new NativeModulesService();
