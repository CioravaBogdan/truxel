import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react-native';
import { PostTemplate } from '../../types/community.types';
import { useTheme } from '../../lib/theme';

interface TemplateSelectorProps {
  templates: PostTemplate[];
  onSelect: (template: PostTemplate) => void;
  onClose: () => void;
}

export default function TemplateSelector({ templates, onSelect, onClose }: TemplateSelectorProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.modal, { backgroundColor: theme.colors.surface }]}>
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{t('community.select_template')}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.templateList}>
          {templates.map((template) => (
            <TouchableOpacity
              key={template.key}
              style={[styles.templateCard, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
              onPress={() => onSelect(template)}
            >
              <Text style={styles.templateIcon}>{template.icon}</Text>
              <View style={styles.templateContent}>
                <Text style={[styles.templateText, { color: theme.colors.text }]}>{t(template.textKey)}</Text>
                {t(`community.template_descriptions.${template.key}`, { defaultValue: '' }) && (
                  <Text style={[styles.templateDescription, { color: theme.colors.textSecondary }]}>
                    {t(`community.template_descriptions.${template.key}`)}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  templateList: {
    paddingVertical: 8,
  },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  templateIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  templateContent: {
    flex: 1,
  },
  templateText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  templateDescription: {
    fontSize: 14,
  },
});