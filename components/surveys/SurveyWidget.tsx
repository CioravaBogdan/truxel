import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '@/components/Card';
import { useTheme } from '@/lib/theme';
import { MessageSquare, ArrowRight } from 'lucide-react-native';
import { Survey } from '@/types/database.types';
import { useTranslation } from 'react-i18next';

interface SurveyWidgetProps {
  survey: Survey;
  onPress: () => void;
}

export const SurveyWidget: React.FC<SurveyWidgetProps> = ({ survey, onPress }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <Card style={[
        styles.container, 
        { 
          borderColor: theme.colors.secondary,
          backgroundColor: theme.colors.secondary + '08' // Very light orange tint
        }
      ]}>
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.secondary }]}>
            <MessageSquare size={24} color={theme.colors.white} />
          </View>
          
          <View style={styles.textContainer}>
            <Text style={[styles.eyebrow, { color: theme.colors.secondary }]}>
              {t('survey.widget_title', 'Tell us what you want')}
            </Text>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {survey.title}
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              {t('survey.widget_subtitle', { count: survey.questions.length, defaultValue: 'Help us improve Truxel' })}
            </Text>
          </View>

          <View style={[styles.arrowContainer, { backgroundColor: theme.colors.surface }]}>
            <ArrowRight size={20} color={theme.colors.secondary} />
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderWidth: 1.5, // Thicker border
    marginBottom: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
