import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Quote, Truck, Users, MapPin, ArrowRight, CheckCircle } from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import { WebFooter } from '@/components/web/WebFooter';
import { SeoHead } from '@/components/web/SeoHead';

export default function StoryPage() {
  const { theme } = useTheme();
  const router = useRouter();

  const profiles = [
    {
      title: "Solo Warrior",
      subtitle: "Owner Operator cu 1 camion",
      desc: "Pentru cel care face tot: conduce, negociază, facturează. Care vrea să știe că are de lucru săptămâna viitoare și să nu mai piardă 20% pe intermediari.",
      icon: Truck
    },
    {
      title: "Hustle Builder",
      subtitle: "Mic Fleet Owner (2-5 camioane)",
      desc: "Pentru cel care a crescut de la un camion și acum jonglează să le țină pe toate încărcate. Care vrea clienți direcți pentru a putea crește sustenabil.",
      icon: Users
    },
    {
      title: "International Runner",
      subtitle: "Șofer pe rute lungi",
      desc: "Pentru cel care cunoaște rutele, dar nu țările. Care ajunge într-o zonă industrială din Germania sau Franța și vrea să găsească marfă locală rapid.",
      icon: MapPin
    }
  ];

  return (
    <>
      <SeoHead
        title="Povestea Truxel | De la Șofer la Șofer"
        description="Povestea din spatele Truxel - o platformă construită de un șofer pentru șoferi, pentru a elimina intermediarii și a reda libertatea owner operatorilor."
        path="/story"
      />

      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Hero Section */}
        <View style={[styles.hero, { backgroundColor: '#0F172A' }]}>
          <View style={styles.heroContent}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>POVESTEA NOASTRĂ</Text>
            </View>
            <Text style={styles.heroTitle}>De la Șofer la Șofer</Text>
            <Text style={styles.heroSubtitle}>
              Nu suntem o corporație. Suntem soluția la o problemă pe care am trăit-o pe propria piele.
            </Text>
          </View>
        </View>

        {/* The Open Letter Section */}
        <View style={styles.letterSection}>
          <View style={[styles.letterContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.quoteIcon}>
              <Quote size={48} color="#FF5722" fill="#FF5722" style={{ opacity: 0.2 }} />
            </View>
            
            <Text style={[styles.letterTitle, { color: theme.colors.text }]}>Scrisoare deschisă către toți owner operatorii</Text>
            
            <View style={styles.letterBody}>
              <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
                Mă numesc George Bogdan. Am 10 camioane acum, dar am început ca șofer în UK.
              </Text>
              
              <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
                Știi cum e când te trezești la 1 noaptea, luni de zile, să ajungă laptele la timp la supermarket? Știi cum e să-ți riști programul de condus, să riști amenzi, doar pentru că expeditorul ți-a zis "trebuie să ajungă azi"?
              </Text>
              
              <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
                Eu știu.
              </Text>
              
              <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
                Și știi ce se întâmplă după? După ce te-ai rupt în două să livrezi la timp? Exact - găsesc pe unul mai ieftin cu €50 și uită că exiști. <Text style={{ fontWeight: '700', color: theme.colors.text }}>Asta e realitatea cu casele de expediție.</Text>
              </Text>
              
              <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
                Am încercat load boards. Îmi amintesc un caz - am dat de o "firmă" care căuta transport. Până am ajuns la marfa reală, am trecut prin <Text style={{ fontWeight: '700', color: theme.colors.text }}>6 intermediari</Text>. Șase! Fiecare lua o bucată din plata mea.
              </Text>
              
              <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
                Și cel mai nasol? Nu-mi place să bat la uși. Nu-mi place să mă duc din fabrică în fabrică, să aștept la secretară, să mă uite de sus logisticianul pentru că EU am venit la EI.
              </Text>
              
              <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
                Dar ce alternativă aveam? M-am găsit de multe ori în zone industriale imense, orașe întregi pline de fabrici, și nu aveam cursa să plec. Nu cunoșteam limba. Nu știam pe nimeni.
              </Text>
              
              <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
                <Text style={{ fontWeight: '700', color: theme.colors.text }}>Acolo s-a născut Truxel.</Text>
              </Text>
              
              <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
                Nu ca o "aplicație de logistică". Ci ca o soluție la propria mea problemă. Ca un instrument pe care mi l-aș fi dorit când stăteam în parcarea unei zone industriale din Germania, cu telefonul în mână, neștiind pe cine să sun.
              </Text>
            </View>

            <View style={styles.signature}>
              <Text style={[styles.signatureName, { color: theme.colors.text }]}>George Bogdan</Text>
              <Text style={[styles.signatureRole, { color: theme.colors.textSecondary }]}>Fondator Truxel & Owner Operator</Text>
            </View>
          </View>
        </View>

        {/* Target Audience Section */}
        <View style={[styles.profilesSection, { backgroundColor: theme.mode === 'dark' ? '#1E293B' : '#F8FAFC' }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Pentru cine este Truxel?</Text>
            <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
              Nu suntem pentru toată lumea. Suntem pentru cei care vor independență.
            </Text>
          </View>

          <View style={styles.profilesGrid}>
            {profiles.map((profile, index) => {
              const Icon = profile.icon;
              return (
                <View key={index} style={[styles.profileCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                  <View style={styles.profileIconContainer}>
                    <Icon size={32} color="#FF5722" />
                  </View>
                  <Text style={[styles.profileTitle, { color: theme.colors.text }]}>{profile.title}</Text>
                  <Text style={[styles.profileSubtitle, { color: theme.colors.primary }]}>{profile.subtitle}</Text>
                  <Text style={[styles.profileDesc, { color: theme.colors.textSecondary }]}>{profile.desc}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Manifesto / Values Section */}
        <View style={[styles.manifestoSection, { backgroundColor: '#0F172A' }]}>
          <View style={styles.manifestoContent}>
            <Text style={styles.manifestoTitle}>Ce credem noi</Text>
            
            <View style={styles.manifestoGrid}>
              <View style={styles.manifestoItem}>
                <CheckCircle size={24} color="#FF5722" style={{ marginTop: 4 }} />
                <View>
                  <Text style={styles.manifestoItemTitle}>Libertate</Text>
                  <Text style={styles.manifestoItemDesc}>Nu mai depinde de nimeni pentru următoarea cursă. Găsești tu firmele, nu aștepți să te găsească ele.</Text>
                </View>
              </View>
              
              <View style={styles.manifestoItem}>
                <CheckCircle size={24} color="#FF5722" style={{ marginTop: 4 }} />
                <View>
                  <Text style={styles.manifestoItemTitle}>Simplitate</Text>
                  <Text style={styles.manifestoItemDesc}>În 30 de secunde ai contacte. Fără formulare complicate, fără contracte stufoase.</Text>
                </View>
              </View>
              
              <View style={styles.manifestoItem}>
                <CheckCircle size={24} color="#FF5722" style={{ marginTop: 4 }} />
                <View>
                  <Text style={styles.manifestoItemTitle}>Comunitate</Text>
                  <Text style={styles.manifestoItemDesc}>Nu ești singur pe drum. Suntem mii care ne ajutăm. Șofer ajută șofer.</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* CTA Section */}
        <View style={[styles.ctaSection, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.ctaCard, { backgroundColor: theme.colors.secondary }]}>
            <Text style={styles.ctaTitle}>Găsește-ți singur marfa.</Text>
            <Text style={styles.ctaSubtitle}>Lasă brokerii să aștepte.</Text>
            
            <TouchableOpacity 
              style={styles.ctaButton}
              onPress={() => router.push('/(auth)/register')}
            >
              <Text style={[styles.ctaButtonText, { color: theme.colors.secondary }]}>Începe Acum</Text>
              <ArrowRight size={20} color={theme.colors.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        <WebFooter />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    paddingVertical: 80,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  heroContent: {
    maxWidth: 800,
    alignItems: 'center',
  },
  heroBadge: {
    backgroundColor: 'rgba(255, 87, 34, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 50,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 87, 34, 0.3)',
  },
  heroBadgeText: {
    color: '#FF5722',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 56,
    ...(Platform.OS === 'web' && {
      '@media (max-width: 768px)': {
        fontSize: 36,
        lineHeight: 44,
      },
    }),
  },
  heroSubtitle: {
    fontSize: 20,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 30,
    maxWidth: 600,
  },
  letterSection: {
    paddingVertical: 64,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: -40,
  },
  letterContainer: {
    maxWidth: 800,
    width: '100%',
    padding: 48,
    borderRadius: 24,
    borderWidth: 1,
    position: 'relative',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.1)',
      '@media (max-width: 768px)': {
        padding: 32,
      },
    }),
  },
  quoteIcon: {
    position: 'absolute',
    top: 32,
    left: 32,
  },
  letterTitle: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 32,
    textAlign: 'center',
    marginTop: 16,
    ...(Platform.OS === 'web' && {
      '@media (max-width: 768px)': {
        fontSize: 24,
      },
    }),
  },
  letterBody: {
    gap: 20,
  },
  paragraph: {
    fontSize: 18,
    lineHeight: 28,
  },
  signature: {
    marginTop: 40,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 24,
  },
  signatureName: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  signatureRole: {
    fontSize: 16,
  },
  profilesSection: {
    paddingVertical: 80,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  sectionHeader: {
    maxWidth: 800,
    alignItems: 'center',
    marginBottom: 48,
  },
  sectionTitle: {
    fontSize: 36,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 18,
    textAlign: 'center',
    maxWidth: 600,
  },
  profilesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    justifyContent: 'center',
    maxWidth: 1200,
    width: '100%',
  },
  profileCard: {
    flex: 1,
    minWidth: 300,
    padding: 32,
    borderRadius: 20,
    borderWidth: 1,
    ...(Platform.OS === 'web' && {
      transition: 'transform 0.2s ease',
      ':hover': {
        transform: 'translateY(-5px)',
      },
    }),
  },
  profileIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 87, 34, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  profileTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  profileSubtitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  profileDesc: {
    fontSize: 16,
    lineHeight: 24,
  },
  manifestoSection: {
    paddingVertical: 80,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  manifestoContent: {
    maxWidth: 1000,
    width: '100%',
  },
  manifestoTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 48,
  },
  manifestoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 48,
    justifyContent: 'center',
  },
  manifestoItem: {
    flex: 1,
    minWidth: 280,
    flexDirection: 'row',
    gap: 16,
  },
  manifestoItemTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  manifestoItemDesc: {
    fontSize: 16,
    color: '#94A3B8',
    lineHeight: 24,
  },
  ctaSection: {
    paddingVertical: 80,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  ctaCard: {
    maxWidth: 1000,
    width: '100%',
    padding: 64,
    borderRadius: 32,
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      '@media (max-width: 768px)': {
        padding: 40,
      },
    }),
  },
  ctaTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    ...(Platform.OS === 'web' && {
      '@media (max-width: 768px)': {
        fontSize: 32,
      },
    }),
  },
  ctaSubtitle: {
    fontSize: 24,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 40,
  },
  ctaButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'transform 0.2s ease',
      ':hover': {
        transform: 'scale(1.05)',
      },
    }),
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: '800',
  },
});
