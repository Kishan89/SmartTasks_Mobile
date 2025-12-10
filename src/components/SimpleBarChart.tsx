import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme';

interface BarChartData {
  label: string;
  value: number;
  color: string;
}

interface SimpleBarChartProps {
  data: BarChartData[];
  title?: string;
  height?: number;
}

export function SimpleBarChart({ data, title, height = 150 }: SimpleBarChartProps) {
  const { colors } = useTheme();
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <View style={styles.container}>
      {title && <Text style={[styles.title, { color: colors.text }]}>{title}</Text>}
      <View style={[styles.chartArea, { height: height + 50 }]}>
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * height;
          return (
            <View key={index} style={styles.barContainer}>
              {/* Value on top */}
              <Text style={[styles.value, { color: colors.text }]}>{item.value}</Text>
              
              {/* Bar */}
              <View
                style={[
                  styles.bar,
                  {
                    height: Math.max(barHeight, 8),
                    backgroundColor: item.color,
                  },
                ]}
              />
              
              {/* Label at bottom */}
              <Text style={[styles.label, { color: colors.textSecondary }]} numberOfLines={2}>
                {item.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-evenly',
    paddingHorizontal: 4,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    maxWidth: 90,
    paddingBottom: 32,
  },
  bar: {
    width: '75%',
    borderRadius: 6,
    minHeight: 8,
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  label: {
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '500',
    marginTop: 8,
    lineHeight: 14,
    position: 'absolute',
    bottom: 0,
  },
});
