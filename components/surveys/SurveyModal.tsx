import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '@/lib/theme';
import { Survey } from '@/types/database.types';
import { X, Check } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { useSurveyStore } from '@/store/surveyStore';
import { useTranslation } from 'react-i18next';

interface SurveyModalProps {
  visible: boolean;
  survey: Survey | null;
  onClose: () => void;
}

export const SurveyModal: React.FC<SurveyModalProps> = ({ visible, survey, onClose }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { submitResponse } = useSurveyStore();
  
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [customResponse, setCustomResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!survey) return null;

  const handleOptionSelect = (questionIndex: number, option: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: option
    }));
  };

  const handleSubmit = async () => {
    if (!survey) return;
    
    // Validate required answers (all questions required for now)
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < survey.questions.length) {
      // Show error or highlight missing
      return;
    }

    setIsSubmitting(true);
    const success = await submitResponse(survey.id, answers, customResponse);
    setIsSubmitting(false);

    if (success) {
      onClose();
    }
  };

  const isFormValid = Object.keys(answers).length === survey.questions.length;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            {t('survey.modal_title', 'Market Research')}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {survey.title}
            </Text>
            
            <Text style={[styles.introText, { color: theme.colors.textSecondary }]}>
              {t('survey.intro_text', 'Your feedback helps us build a better tool for you. Please answer the following questions:')}
            </Text>

            {survey.questions.map((question, index) => {
              const options = survey.options?.[index];
              const hasOptions = options && options.length > 0;

              return (
                <View key={index} style={styles.questionContainer}>
                  <Text style={[styles.questionText, { color: theme.colors.text }]}>
                    {index + 1}. {question}
                  </Text>

                  {hasOptions ? (
                    <View style={styles.optionsContainer}>
                      {options.map((option) => {
                        const isSelected = answers[index] === option;
                        return (
                          <TouchableOpacity
                            key={option}
                            style={[
                              styles.optionButton,
                              { 
                                borderColor: isSelected ? theme.colors.secondary : theme.colors.border,
                                backgroundColor: isSelected ? theme.colors.secondary + '10' : 'transparent'
                              }
                            ]}
                            onPress={() => handleOptionSelect(index, option)}
                          >
                            <View style={[
                              styles.radioCircle,
                              { 
                                borderColor: isSelected ? theme.colors.secondary : theme.colors.textSecondary 
                              }
                            ]}>
                              {isSelected && <View style={[styles.radioDot, { backgroundColor: theme.colors.secondary }]} />}
                            </View>
                            <Text style={[
                              styles.optionText,
                              { 
                                color: isSelected ? theme.colors.secondary : theme.colors.text,
                                fontWeight: isSelected ? '600' : '400'
                              }
                            ]}>
                              {option}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ) : (
                    <TextInput
                      style={[
                        styles.textInput,
                        { 
                          color: theme.colors.text,
                          borderColor: theme.colors.border,
                          backgroundColor: theme.colors.surface
                        }
                      ]}
                      placeholder="Type your answer..."
                      placeholderTextColor={theme.colors.textSecondary}
                      value={answers[index] || ''}
                      onChangeText={(text) => handleOptionSelect(index, text)}
                    />
                  )}
                </View>
              );
            })}

            <View style={styles.questionContainer}>
              <Text style={[styles.questionText, { color: theme.colors.text }]}>
                {t('survey.additional_comments', 'Additional Comments (Optional)')}
              </Text>
              <Text style={[styles.helperText, { color: theme.colors.textSecondary }]}>
                {t('survey.additional_comments_helper', 'Any other feedback, feature requests, or thoughts?')}
              </Text>
              <TextInput
                style={[
                  styles.textArea,
                  { 
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.surface
                  }
                ]}
                placeholder={t('survey.additional_comments_placeholder', 'Tell us what you think...')}
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                numberOfLines={4}
                value={customResponse}
                onChangeText={setCustomResponse}
              />
            </View>

            <View style={styles.footer}>
              <Button
                title={isSubmitting ? t('survey.sending_btn', 'Sending...') : t('survey.submit_btn', 'Send Feedback')}
                onPress={handleSubmit}
                disabled={!isFormValid || isSubmitting}
                variant="secondary"
                size="medium"
                style={{ width: '100%' }}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  introText: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 22,
  },
  questionContainer: {
    marginBottom: 24,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  helperText: {
    fontSize: 14,
    marginBottom: 12,
    marginTop: -8,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  optionText: {
    fontSize: 16,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    height: 120,
    textAlignVertical: 'top',
  },
  footer: {
    marginTop: 12,
  },
});
