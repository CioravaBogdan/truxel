import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, Platform, TouchableOpacity, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebFooter } from '@/components/web/WebFooter';
import { SeoHead } from '@/components/web/SeoHead';
import { useTheme } from '@/lib/theme';
import { blogService, Article } from '@/services/blogService';
import { format } from 'date-fns';
import { Calendar, User, ArrowLeft, TrendingUp, Download } from 'lucide-react-native';

export default function ArticleDetailPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { theme } = useTheme();
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      loadArticle(slug);
    }
  }, [slug]);

  const loadArticle = async (articleSlug: string) => {
    try {
      const data = await blogService.getArticleBySlug(articleSlug);
      setArticle(data);
    } catch (error) {
      console.error('Failed to load article', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!article) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.text }]}>Article not found</Text>
          <Text 
            style={[styles.backLink, { color: theme.colors.primary }]}
            onPress={() => router.push('/(web)/articles')}
          >
            Back to Articles
          </Text>
        </View>
        <WebFooter />
      </View>
    );
  }

  const formattedDate = article.published_at 
    ? format(new Date(article.published_at), 'MMMM d, yyyy')
    : '';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SeoHead 
        title={`${article.title} - Truxel Blog`}
        description={article.meta_description || article.excerpt || article.title}
        image={article.cover_image_url || undefined}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.articleContainer}>
          <TouchableOpacity 
            style={[styles.backButton, { borderColor: theme.colors.border }]}
            onPress={() => router.push('/(web)/articles')}
          >
            <ArrowLeft size={20} color={theme.colors.text} />
            <Text style={[styles.backButtonText, { color: theme.colors.text }]}>Back to Articles</Text>
          </TouchableOpacity>

          <Text style={[styles.title, { color: theme.colors.text }]}>
            {article.title}
          </Text>

          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Calendar size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                {formattedDate}
              </Text>
            </View>
            {article.author && (
              <View style={styles.metaItem}>
                <User size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                  {article.author}
                </Text>
              </View>
            )}
          </View>

          {/* Key Stats Section */}
          {article.key_stats && article.key_stats.length > 0 && (
            <View style={[styles.keyStatsContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <View style={styles.keyStatsHeader}>
                <TrendingUp size={20} color={theme.colors.primary} />
                <Text style={[styles.keyStatsTitle, { color: theme.colors.text }]}>Key Stats</Text>
              </View>
              <View style={styles.keyStatsList}>
                {article.key_stats.map((stat, index) => (
                  <View key={index} style={styles.keyStatBullet}>
                    <View style={[styles.bulletDot, { backgroundColor: theme.colors.primary }]} />
                    <Text style={[styles.keyStatText, { color: theme.colors.text }]}>
                      {stat.label ? `${stat.label}: ${stat.value}` : stat.value}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {article.cover_image_url && (
            <Image 
              source={{ uri: article.cover_image_url }} 
              style={styles.coverImage}
              resizeMode="cover"
            />
          )}

          <View style={styles.content}>
            {/* 
              TODO: Implement proper Markdown rendering.
              For now, we display text with basic whitespace handling.
            */}
            <Text style={[styles.bodyText, { color: theme.colors.text }]}>
              {article.content}
            </Text>
          </View>

          {/* CTA Section */}
          <View style={[styles.ctaContainer, { backgroundColor: theme.mode === 'dark' ? '#1a1a2e' : '#0f172a' }]}>
            <View style={styles.ctaContent}>
              <Download size={32} color="#FF5722" style={{ marginBottom: 16 }} />
              <Text style={styles.ctaTitle}>
                {article.cta || 'For the best experience, download our mobile app. Truxel works on PC, but it\'s built for the road.'}
              </Text>
              <View style={styles.ctaButtons}>
                <TouchableOpacity 
                  onPress={() => Linking.openURL('https://apps.apple.com/ro/app/truxel-owner-operator-tool/id6755073677')}
                  style={styles.storeButton}
                >
                  <Image 
                    source={require('@/assets/images/download_apple_store.svg')} 
                    style={styles.storeBadge}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => Linking.openURL('https://play.google.com/store/apps/details?id=io.truxel.app')}
                  style={styles.storeButton}
                >
                  <Image 
                    source={require('@/assets/images/download_google_store_footer.png')} 
                    style={styles.storeBadge}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
        <WebFooter />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: Platform.OS === 'web' ? '100vh' as any : '100%',
  },
  articleContainer: {
    flex: 1,
    paddingVertical: 60,
    paddingHorizontal: 24,
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginBottom: 32,
    cursor: 'pointer',
  } as any,
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 40,
    fontWeight: '900',
    marginBottom: 24,
    lineHeight: 48,
  },
  metaContainer: {
    flexDirection: 'row',
    marginBottom: 32,
    gap: 24,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 16,
  },
  coverImage: {
    width: '100%',
    height: 400,
    borderRadius: 16,
    marginBottom: 40,
  },
  content: {
    gap: 16,
  },
  bodyText: {
    fontSize: 18,
    lineHeight: 30,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  backLink: {
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  // Key Stats Styles
  keyStatsContainer: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    marginBottom: 32,
  },
  keyStatsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  keyStatsTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  keyStatsList: {
    gap: 12,
  },
  keyStatBullet: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  bulletDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  keyStatText: {
    fontSize: 16,
    lineHeight: 24,
    flex: 1,
  },
  // CTA Styles
  ctaContainer: {
    marginTop: 48,
    borderRadius: 20,
    overflow: 'hidden',
  },
  ctaContent: {
    alignItems: 'center',
    padding: 40,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 500,
    lineHeight: 28,
  },
  ctaButtons: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  storeButton: {
    cursor: 'pointer',
  } as any,
  storeBadge: {
    height: 50,
    width: 160,
  },
});
