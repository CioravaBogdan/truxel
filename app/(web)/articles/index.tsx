import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Platform, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { WebFooter } from '@/components/web/WebFooter';
import { SeoHead } from '@/components/web/SeoHead';
import { useTheme } from '@/lib/theme';
import { blogService, Article } from '@/services/blogService';
import { ArticleCard } from '@/components/web/ArticleCard';
import { Search } from 'lucide-react-native';

export default function ArticlesPage() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadArticles();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredArticles(articles);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = articles.filter(article => 
        article.title.toLowerCase().includes(query) || 
        article.excerpt?.toLowerCase().includes(query)
      );
      setFilteredArticles(filtered);
    }
  }, [searchQuery, articles]);

  const loadArticles = async () => {
    try {
      const data = await blogService.getAllArticles();
      setArticles(data);
      setFilteredArticles(data);
    } catch (error) {
      console.error('Failed to load articles', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SeoHead 
        title="Truxel Blog - Logistics & Transportation Insights"
        description="Latest news, tips, and insights for owner operators and logistics professionals."
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroSection}>
          <Text style={[styles.heroTitle, { color: theme.colors.text }]}>
            Truxel Blog
          </Text>
          <Text style={[styles.heroSubtitle, { color: theme.colors.textSecondary }]}>
            Insights, tips, and stories from the road.
          </Text>
          
          <View style={[styles.searchContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Search size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.text }]}
              placeholder="Search articles..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <View style={styles.contentSection}>
          {loading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} />
          ) : filteredArticles.length > 0 ? (
            <View style={styles.grid}>
              {filteredArticles.map((article) => (
                <View key={article.id} style={styles.gridItem}>
                  <ArticleCard article={article} />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                No articles found matching "{searchQuery}".
              </Text>
            </View>
          )}
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
    minHeight: Platform.OS === 'web' ? '100vh' : '100%',
  },
  heroSection: {
    paddingVertical: 60,
    paddingHorizontal: 24,
    alignItems: 'center',
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: '900',
    marginBottom: 16,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 20,
    textAlign: 'center',
    maxWidth: 600,
    marginBottom: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 500,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    paddingHorizontal: 16,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    }),
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
    outlineStyle: 'none',
  } as any,
  contentSection: {
    paddingHorizontal: 24,
    paddingBottom: 80,
    maxWidth: 1400, // Increased to fit 4 items better
    alignSelf: 'center',
    width: '100%',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    justifyContent: 'flex-start',
  },
  gridItem: {
    width: Platform.OS === 'web' ? 'calc(25% - 18px)' : '100%', // Desktop default (4 per row)
    ...(Platform.OS === 'web' && {
      '@media (max-width: 1024px)': {
        width: 'calc(50% - 12px)', // 2 per row on tablets
      },
      '@media (max-width: 640px)': {
        width: '100%', // 1 per row on mobile
      },
    }),
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
  },
});
