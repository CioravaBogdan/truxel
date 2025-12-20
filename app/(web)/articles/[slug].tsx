import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, Platform, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebFooter } from '@/components/web/WebFooter';
import { SeoHead } from '@/components/web/SeoHead';
import { useTheme } from '@/lib/theme';
import { blogService, Article } from '@/services/blogService';
import { format } from 'date-fns';
import { Calendar, User, ArrowLeft } from 'lucide-react-native';

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
        description={article.excerpt || article.title}
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
  articleContainer: {
    flex: 1,
    paddingVertical: 60,
    paddingHorizontal: 24,
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
  },Button: {
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
});
