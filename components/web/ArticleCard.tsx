import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/lib/theme';
import { Article } from '@/services/blogService';
import { Calendar, User, ArrowRight } from 'lucide-react-native';
import { format } from 'date-fns';

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const { theme } = useTheme();
  const router = useRouter();

  const handlePress = () => {
    router.push(`/(web)/articles/${article.slug}`);
  };

  const formattedDate = article.published_at 
    ? format(new Date(article.published_at), 'MMM d, yyyy')
    : '';

  return (
    <TouchableOpacity 
      onPress={handlePress}
      style={[
        styles.card, 
        { 
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          ...theme.shadows.medium
        }
      ]}
      activeOpacity={0.9}
    >
      {article.cover_image_url && (
        <Image 
          source={{ uri: article.cover_image_url }} 
          style={styles.image}
          resizeMode="cover"
        />
      )}
      
      <View style={styles.content}>
        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Calendar size={14} color={theme.colors.textSecondary} />
            <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
              {formattedDate}
            </Text>
          </View>
          {article.author && (
            <View style={styles.metaItem}>
              <User size={14} color={theme.colors.textSecondary} />
              <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                {article.author}
              </Text>
            </View>
          )}
        </View>

        <Text 
          style={[styles.title, { color: theme.colors.text }]}
          numberOfLines={2}
        >
          {article.title}
        </Text>

        {article.excerpt && (
          <Text 
            style={[styles.excerpt, { color: theme.colors.textSecondary }]}
            numberOfLines={3}
          >
            {article.excerpt}
          </Text>
        )}

        <View style={styles.footer}>
          <Text style={[styles.readMore, { color: theme.colors.primary }]}>
            Read Article
          </Text>
          <ArrowRight size={16} color={theme.colors.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    width: '100%',
    /* Web-specific hover effect would go here if using CSS */
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
      transition: 'transform 0.2s ease-in-out',
    } : {}),
  },
  image: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: 20,
  },
  metaContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: 28,
  },
  excerpt: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 'auto',
  },
  readMore: {
    fontSize: 15,
    fontWeight: '600',
  },
});
