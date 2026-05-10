import { router } from 'expo-router';
import { ArrowLeft, CheckCircle, Clock, Flame } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../../lib/api';

const ITEM_H = 60;
const VISIBLE = 5;
const PAD = ITEM_H * Math.floor(VISIBLE / 2);

const DURATIONS = Array.from({ length: 36 }, (_, i) => ({
  key: String((i + 1) * 5),
  label: String((i + 1) * 5),
}));

const INTENSITY_COLORS = { low: '#0F6E56', medium: '#BA7517', high: '#A32D2D' };

function WheelPicker({ items, selectedIndex, onChange, flex }) {
  const ref = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => {
      ref.current?.scrollTo({ y: selectedIndex * ITEM_H, animated: false });
    }, 80);
    return () => clearTimeout(t);
  }, []);

  function snap(e) {
    const raw = Math.round(e.nativeEvent.contentOffset.y / ITEM_H);
    onChange(Math.max(0, Math.min(items.length - 1, raw)));
  }

  return (
    <View style={{ flex, overflow: 'hidden', height: ITEM_H * VISIBLE }}>
      {/* Selection band */}
      <View
        pointerEvents="none"
        className="absolute left-0 right-0 bg-primary/5 rounded-lg border-y border-primary/10 z-10"
        style={{ top: PAD, height: ITEM_H }}
      />
      <ScrollView
        ref={ref}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        onMomentumScrollEnd={snap}
        onScrollEndDrag={snap}
        contentContainerStyle={{ paddingTop: PAD, paddingBottom: PAD }}
      >
        {items.map((item, i) => {
          const dist = Math.abs(i - selectedIndex);
          const opacity = dist === 0 ? 1 : dist === 1 ? 0.5 : 0.25;
          const scale = dist === 0 ? 1.1 : 1;
          const fw = dist === 0 ? '700' : '400';
          return (
            <TouchableOpacity
              key={item.key}
              style={{ height: ITEM_H, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 8 }}
              activeOpacity={0.7}
              onPress={() => {
                onChange(i);
                ref.current?.scrollTo({ y: i * ITEM_H, animated: true });
              }}
            >
              <Text
                style={{ textAlign: 'center', opacity, fontSize: 16, fontWeight: fw, transform: [{ scale }] }}
                className="text-foreground"
                numberOfLines={1}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

export default function AddActivity() {
  const [activityTypes, setActivityTypes] = useState({});
  const [typesLoading, setTypesLoading] = useState(true);
  const [activityIndex, setActivityIndex] = useState(0);
  const [durationIndex, setDurationIndex] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/activities/types');
        setActivityTypes(res.data);
      } catch (err) {
        const msg = err.response?.data?.message;
        Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : (msg || 'Could not load activities.'));
      } finally {
        setTypesLoading(false);
      }
    }
    load();
  }, []);

  const allActivities = useMemo(
    () =>
      Object.entries(activityTypes).flatMap(([category, items]) =>
        items.map((item) => ({ ...item, category }))
      ),
    [activityTypes]
  );

  const selected = allActivities[activityIndex] ?? null;
  const selectedDuration = parseInt(DURATIONS[durationIndex].key, 10);
  const iColor = selected ? INTENSITY_COLORS[selected.intensity] : '#0D9488';
  const estimatedCalories = selected?.met
    ? Math.round(selected.met * 70 * (selectedDuration / 60))
    : null;

  async function handleSubmit() {
    if (!selected) return;
    setSubmitting(true);
    try {
      await api.post('/activities', {
        activityType: selected.key,
        durationMinutes: parseInt(DURATIONS[durationIndex].key, 10),
        loggedAt: new Date().toISOString(),
      });
      router.back();
    } catch (err) {
      const msg = err.response?.data?.message;
      Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : (msg || 'Could not log activity.'));
    } finally {
      setSubmitting(false);
    }
  }

  if (typesLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#0D9488" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft size={24} color="#64748B" strokeWidth={2} />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-foreground">Log Activity</Text>
        <View className="w-8" />
      </View>

      <View className="flex-1 px-6 pt-6 gap-6">
        {/* Drum-roll Picker */}
        <View className="bg-card rounded-2xl border border-border overflow-hidden mb-2 shadow-sm">
          <View className="flex-row" style={{ height: ITEM_H * VISIBLE }}>
            {/* Activity column */}
            <View style={{ flex: 3 }} className="border-r border-border">
              <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center mt-2 mb-1">
                Activity
              </Text>
              <WheelPicker
                items={allActivities.map((a) => ({ key: a.key, label: a.label }))}
                selectedIndex={activityIndex}
                onChange={setActivityIndex}
                flex={1}
              />
            </View>
            {/* Duration column */}
            <View style={{ flex: 1 }}>
              <View className="flex-row justify-center items-center mt-2 mb-1">
                <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Duration
                </Text>
              </View>
              <WheelPicker
                items={DURATIONS}
                selectedIndex={durationIndex}
                onChange={setDurationIndex}
                flex={1}
              />
            </View>
          </View>
        </View>

        {/* Detail card */}
        {selected ? (
          <View
            className="bg-card rounded-xl p-5 border border-border"
            style={{ borderLeftWidth: 4, borderLeftColor: iColor }}
          >
            <View className="flex-row justify-between items-start mb-3">
              <View>
                <Text className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  {selected.category}
                </Text>
                <Text className="text-xl font-bold text-foreground">{selected.label}</Text>
              </View>
              <View
                className="px-3 py-1 rounded-full"
                style={{ backgroundColor: `${iColor}20` }}
              >
                <Text className="text-xs font-bold" style={{ color: iColor }}>
                  {selected.intensity?.toUpperCase()}
                </Text>
              </View>
            </View>
            <View className="flex-row gap-6">
              <View className="flex-row items-center gap-2">
                <Clock size={16} color="#64748B" />
                <Text className="text-foreground font-medium">{selectedDuration} min</Text>
              </View>
              {estimatedCalories ? (
                <View className="flex-row items-center gap-2">
                  <Flame size={16} color="#64748B" />
                  <Text className="text-foreground font-medium">~{estimatedCalories} kcal</Text>
                </View>
              ) : null}
            </View>
          </View>
        ) : null}

        {/* Submit */}
        <TouchableOpacity
          className={`bg-primary rounded-2xl py-4 flex-row items-center justify-center gap-2 ${(!selected || submitting) ? 'opacity-50' : ''}`}
          onPress={handleSubmit}
          disabled={!selected || submitting}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <CheckCircle size={20} color="#ffffff" />
              <Text className="text-primary-foreground font-bold text-lg">Log Activity</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}


