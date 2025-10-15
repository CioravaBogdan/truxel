import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LeadStatus } from '@/types/database.types';

interface StatusBadgeProps {
  status: LeadStatus;
}

const statusConfig = {
  new: { color: '#3B82F6', label: 'New' },
  contacted: { color: '#EAB308', label: 'Contacted' },
  in_progress: { color: '#8B5CF6', label: 'In Progress' },
  won: { color: '#10B981', label: 'Won' },
  lost: { color: '#EF4444', label: 'Lost' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <View style={[styles.badge, { backgroundColor: `${config.color}20` }]}>
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <Text style={[styles.text, { color: config.color }]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
