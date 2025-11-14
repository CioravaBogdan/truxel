import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DeleteAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function DeleteAccountModal({
  visible,
  onClose,
  onConfirm,
}: DeleteAccountModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleFirstConfirm = () => {
    setStep(2);
  };

  const handleFinalConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      // Don't reset state - user will be logged out and navigated away
    } catch (error) {
      console.error('Delete account error:', error);
      setIsDeleting(false);
      // Modal will show error from parent component
    }
  };

  const handleClose = () => {
    if (isDeleting) return; // Don't allow closing during deletion
    setStep(1);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Ionicons name="warning" size={48} color="#EF4444" />
            <Text style={styles.title}>
              {step === 1 ? 'Delete Account?' : 'Final Confirmation'}
            </Text>
            {!isDeleting && (
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {step === 1 ? (
              <>
                <Text style={styles.warningText}>
                  This action is <Text style={styles.bold}>permanent</Text> and cannot be undone.
                </Text>

                <View style={styles.dataList}>
                  <Text style={styles.dataListTitle}>The following data will be deleted:</Text>
                  <View style={styles.dataItem}>
                    <Ionicons name="checkmark-circle" size={20} color="#EF4444" />
                    <Text style={styles.dataItemText}>Your profile and account information</Text>
                  </View>
                  <View style={styles.dataItem}>
                    <Ionicons name="checkmark-circle" size={20} color="#EF4444" />
                    <Text style={styles.dataItemText}>All saved leads (My Book)</Text>
                  </View>
                  <View style={styles.dataItem}>
                    <Ionicons name="checkmark-circle" size={20} color="#EF4444" />
                    <Text style={styles.dataItemText}>Search history</Text>
                  </View>
                  <View style={styles.dataItem}>
                    <Ionicons name="checkmark-circle" size={20} color="#EF4444" />
                    <Text style={styles.dataItemText}>Community posts and interactions</Text>
                  </View>
                  <View style={styles.dataItem}>
                    <Ionicons name="checkmark-circle" size={20} color="#EF4444" />
                    <Text style={styles.dataItemText}>Transaction history</Text>
                  </View>
                  <View style={styles.dataItem}>
                    <Ionicons name="checkmark-circle" size={20} color="#EF4444" />
                    <Text style={styles.dataItemText}>Search credits and subscriptions</Text>
                  </View>
                  <View style={styles.dataItem}>
                    <Ionicons name="checkmark-circle" size={20} color="#EF4444" />
                    <Text style={styles.dataItemText}>All other personal data</Text>
                  </View>
                </View>

                <View style={styles.infoBox}>
                  <Ionicons name="information-circle" size={20} color="#3B82F6" />
                  <Text style={styles.infoText}>
                    Public lead data remains in Truxel&apos;s database for other users to discover.
                  </Text>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.finalWarning}>
                  Are you absolutely sure you want to delete your account?
                </Text>
                <Text style={styles.finalSubtext}>
                  This will immediately and permanently delete all your data. You will be logged out and won&apos;t be able to recover your account.
                </Text>

                <View style={styles.criticalBox}>
                  <Ionicons name="alert-circle" size={24} color="#DC2626" />
                  <Text style={styles.criticalText}>
                    This action <Text style={styles.bold}>CANNOT</Text> be reversed!
                  </Text>
                </View>
              </>
            )}
          </ScrollView>

          <View style={styles.footer}>
            {step === 1 ? (
              <>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleClose}
                  disabled={isDeleting}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={handleFirstConfirm}
                  disabled={isDeleting}
                >
                  <Text style={styles.deleteButtonText}>Continue</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleClose}
                  disabled={isDeleting}
                >
                  <Text style={styles.cancelButtonText}>Go Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.finalDeleteButton, isDeleting && styles.disabledButton]}
                  onPress={handleFinalConfirm}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Ionicons name="trash" size={20} color="#FFFFFF" />
                      <Text style={styles.finalDeleteButtonText}>Delete My Account</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  header: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 12,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  content: {
    padding: 24,
  },
  warningText: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 24,
  },
  bold: {
    fontWeight: 'bold',
    color: '#DC2626',
  },
  dataList: {
    marginBottom: 20,
  },
  dataListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  dataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingLeft: 8,
  },
  dataItemText: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 10,
    flex: 1,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1E40AF',
    marginLeft: 8,
    flex: 1,
  },
  finalWarning: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 16,
  },
  finalSubtext: {
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  criticalBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#DC2626',
  },
  criticalText: {
    fontSize: 16,
    color: '#991B1B',
    marginLeft: 8,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  finalDeleteButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  finalDeleteButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  disabledButton: {
    opacity: 0.7,
  },
});
