import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { WebFooter } from '@/components/web/WebFooter';

export default function CookiePolicy() {

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Cookie Policy</Text>
        <Text style={styles.updated}>Last Updated: November 12, 2025</Text>

        <View style={styles.section}>
          <Text style={styles.heading}>1. What Are Cookies?</Text>
          <Text style={styles.text}>
            Cookies are small text files stored on your device (computer, smartphone, tablet) when you visit websites. They help websites remember your actions and preferences over time, improving your browsing experience.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>2. How Truxel Uses Cookies</Text>
          <Text style={styles.text}>
            We use cookies to provide a better user experience, maintain your session, remember your preferences, and analyze how our Service is used. We respect your privacy and comply with GDPR cookie consent requirements.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>3. Types of Cookies We Use</Text>

          <Text style={styles.subheading}>3.1 Essential Cookies (Always Active)</Text>
          <Text style={styles.text}>
            These cookies are necessary for the Service to function and cannot be disabled:{'\n\n'}
            • Authentication Cookies: Keep you logged in securely{'\n'}
            • Session Management: Maintain your session across pages{'\n'}
            • Security Cookies: Protect against unauthorized access{'\n'}
            • CSRF Protection: Prevent cross-site request forgery attacks{'\n\n'}
            Duration: Session cookies (deleted when you close browser) and persistent cookies (up to 30 days)
          </Text>

          <Text style={styles.subheading}>3.2 Functional Cookies (Optional)</Text>
          <Text style={styles.text}>
            These cookies enhance functionality and personalization (require consent):{'\n\n'}
            • Language Preference: Remember your selected language{'\n'}
            • Remember Me: Keep you logged in across sessions{'\n'}
            • UI Preferences: Remember your display settings{'\n'}
            • Recent Searches: Store your recent search history locally{'\n\n'}
            Duration: Up to 1 year
          </Text>

          <Text style={styles.subheading}>3.3 Analytics Cookies (Optional)</Text>
          <Text style={styles.text}>
            These cookies help us understand how users interact with our Service (require consent):{'\n\n'}
            • Google Analytics: Page views, user behavior, demographics{'\n'}
            • Performance Monitoring: Load times, errors, app performance{'\n'}
            • Usage Statistics: Feature usage, popular pages{'\n\n'}
            Note: Analytics data is anonymized and cannot identify individual users.{'\n\n'}
            Duration: Up to 2 years
          </Text>

          <Text style={styles.subheading}>3.4 Marketing Cookies (Optional)</Text>
          <Text style={styles.text}>
            These cookies track your browsing for advertising purposes (require consent):{'\n\n'}
            • Conversion Tracking: Track sign-ups from ads{'\n'}
            • Retargeting: Show relevant ads on other websites{'\n'}
            • Attribution: Understand which marketing channels work best{'\n\n'}
            We use:{'\n'}
            • Google Ads conversion tracking{'\n'}
            • Facebook Pixel (if applicable){'\n\n'}
            Duration: Up to 1 year
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>4. Third-Party Cookies</Text>
          <Text style={styles.text}>
            Some cookies are set by third-party services we use:{'\n\n'}
            • Supabase: Authentication and session management{'\n'}
            • Stripe: Payment processing and fraud prevention{'\n'}
            • Google Analytics: Website analytics{'\n'}
            • Expo: Push notification delivery{'\n\n'}
            These third parties have their own privacy policies. We encourage you to review them:{'\n'}
            • Supabase: https://supabase.com/privacy{'\n'}
            • Stripe: https://stripe.com/privacy{'\n'}
            • Google: https://policies.google.com/privacy
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>5. Cookie Consent</Text>
          <Text style={styles.text}>
            When you first visit Truxel, you will see a cookie consent banner. You can:{'\n\n'}
            • Accept All: Allow all cookies including optional ones{'\n'}
            • Reject Non-Essential: Accept only essential cookies{'\n'}
            • Customize: Choose which cookie categories to allow{'\n\n'}
            Your consent choices are stored in a cookie (ironically) so we remember your preferences.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>6. Managing Your Cookie Preferences</Text>

          <Text style={styles.subheading}>6.1 Change Settings in Truxel</Text>
          <Text style={styles.text}>
            You can change your cookie preferences at any time:{'\n'}
            1. Go to Profile → Settings{'\n'}
            2. Click &quot;Cookie Preferences&quot;{'\n'}
            3. Enable or disable cookie categories{'\n'}
            4. Save changes
          </Text>

          <Text style={styles.subheading}>6.2 Browser Settings</Text>
          <Text style={styles.text}>
            You can also manage cookies through your browser settings:{'\n\n'}
            Chrome: Settings → Privacy and Security → Cookies{'\n'}
            Firefox: Options → Privacy & Security → Cookies{'\n'}
            Safari: Preferences → Privacy → Cookies{'\n'}
            Edge: Settings → Privacy → Cookies{'\n\n'}
            Note: Blocking essential cookies will prevent you from using some features of the Service.
          </Text>

          <Text style={styles.subheading}>6.3 Opt-Out Links</Text>
          <Text style={styles.text}>
            • Google Analytics Opt-out: https://tools.google.com/dlpage/gaoptout{'\n'}
            • Network Advertising Initiative: https://optout.networkadvertising.org{'\n'}
            • Digital Advertising Alliance: https://youradchoices.com
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>7. Mobile App Tracking</Text>
          <Text style={styles.text}>
            Our mobile apps use similar tracking technologies (local storage, device identifiers) instead of traditional cookies:{'\n\n'}
            • Secure Storage: For authentication tokens{'\n'}
            • AsyncStorage: For app preferences{'\n'}
            • Device IDs: For push notifications{'\n'}
            • Analytics SDKs: For usage tracking (with consent){'\n\n'}
            You can manage tracking permissions in your device settings:{'\n'}
            iOS: Settings → Privacy → Tracking{'\n'}
            Android: Settings → Google → Ads → Opt out of Ads Personalization
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>8. Do Not Track (DNT)</Text>
          <Text style={styles.text}>
            Some browsers offer a &quot;Do Not Track&quot; (DNT) signal. Currently, there is no industry standard for responding to DNT signals. However, we respect your privacy choices made through our consent banner and settings.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>9. Cookie Lifespan</Text>
          <Text style={styles.text}>
            • Session Cookies: Deleted when you close your browser{'\n'}
            • Persistent Cookies: Remain on your device for a specified period:{'\n'}
              - Authentication: 30 days{'\n'}
              - Preferences: 1 year{'\n'}
              - Analytics: 2 years{'\n'}
              - Marketing: 1 year{'\n\n'}
            After expiration, cookies are automatically deleted.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>10. Impact of Disabling Cookies</Text>
          <Text style={styles.text}>
            If you disable cookies, you may experience:{'\n\n'}
            • Need to log in on every visit{'\n'}
            • Loss of personalized settings{'\n'}
            • Difficulty using some features{'\n'}
            • Language resets to default{'\n'}
            • Recent searches not saved{'\n\n'}
            Essential cookies cannot be disabled as they are necessary for the Service to work.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>11. Children's Privacy</Text>
          <Text style={styles.text}>
            Our Service is not intended for users under 18. We do not knowingly collect cookies from children. If we discover that we have inadvertently collected information from a child under 16, we will delete it immediately.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>12. Updates to This Policy</Text>
          <Text style={styles.text}>
            We may update this Cookie Policy to reflect changes in technology, regulations, or our practices. We will notify you of material changes via:{'\n'}
            • Email notification{'\n'}
            • In-app notification{'\n'}
            • Updated consent banner{'\n\n'}
            The &quot;Last Updated&quot; date at the top indicates when changes were made.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>13. Your Rights (GDPR)</Text>
          <Text style={styles.text}>
            Under GDPR, you have the right to:{'\n'}
            • Know what cookies we use and why{'\n'}
            • Withdraw cookie consent at any time{'\n'}
            • Request deletion of data collected via cookies{'\n'}
            • Object to processing for marketing purposes{'\n'}
            • Lodge a complaint with your data protection authority
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>14. Contact Us</Text>
          <Text style={styles.text}>
            For questions about cookies or this policy:{'\n\n'}
            Email: office@truxel.io{'\n'}
            Phone: +40 750 492 985{'\n\n'}
            For privacy-related concerns, see our Privacy Policy at truxel.io/privacy.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>15. Useful Resources</Text>
          <Text style={styles.text}>
            To learn more about cookies:{'\n'}
            • AboutCookies.org: https://www.aboutcookies.org{'\n'}
            • AllAboutCookies: https://www.allaboutcookies.org{'\n'}
            • EU Cookie Directive: https://ec.europa.eu/ipg/basics/legal/cookies{'\n'}
            • ICO Cookie Guidance: https://ico.org.uk/for-organisations/guide-to-pecr/cookies-and-similar-technologies
          </Text>
        </View>
      </View>

      <WebFooter />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    maxWidth: 800,
    marginHorizontal: 'auto',
    paddingHorizontal: 16,
    paddingVertical: 64,
    width: '100%',
  },
  title: {
    fontSize: 40,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  updated: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 48,
  },
  section: {
    marginBottom: 32,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  subheading: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
    marginTop: 16,
  },
  text: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
  },
});
