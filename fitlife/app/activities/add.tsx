import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Flame, Clock, CheckCircle } from "lucide-react-native";

// --- Constants & Mock Data ---

const ITEM_HEIGHT = 60;
const VISIBLE_ITEMS = 5;
const PADDING = ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2);

const DURATIONS = Array.from({ length: 36 }, (_, i) => ({
  key: String((i + 1) * 5),
  label: String((i + 1) * 5),
}));

const MOCK_ACTIVITY_TYPES = [
  {
    key: "running",
    label: "Running",
    category: "Cardio",
    intensity: "high",
    met: 9.8,
  },
  {
    key: "walking",
    label: "Walking",
    category: "Cardio",
    intensity: "low",
    met: 3.8,
  },
  {
    key: "cycling",
    label: "Cycling",
    category: "Cardio",
    intensity: "medium",
    met: 7.5,
  },
  {
    key: "swimming",
    label: "Swimming",
    category: "Cardio",
    intensity: "high",
    met: 8.0,
  },
  {
    key: "yoga",
    label: "Yoga",
    category: "Flexibility",
    intensity: "low",
    met: 2.5,
  },
  {
    key: "weightlifting",
    label: "Weight Training",
    category: "Strength",
    intensity: "medium",
    met: 5.0,
  },
  {
    key: "hiit",
    label: "HIIT",
    category: "Cardio",
    intensity: "high",
    met: 11.0,
  },
  {
    key: "pilates",
    label: "Pilates",
    category: "Flexibility",
    intensity: "low",
    met: 3.0,
  },
  {
    key: "boxing",
    label: "Boxing",
    category: "Combat",
    intensity: "high",
    met: 10.2,
  },
  {
    key: "rowing",
    label: "Rowing",
    category: "Cardio",
    intensity: "high",
    met: 8.5,
  },
  {
    key: "elliptical",
    label: "Elliptical",
    category: "Cardio",
    intensity: "medium",
    met: 5.5,
  },
  {
    key: "stretching",
    label: "Stretching",
    category: "Flexibility",
    intensity: "low",
    met: 2.3,
  },
];

const INTENSITY_COLORS = {
  low: "#0F6E56", // Teal/Dark Green
  medium: "#BA7517", // Amber/Orange
  high: "#A32D2D", // Red
};

// --- Types ---

type ActivityItem = {
  key: string;
  label: string;
  category: string;
  intensity: "low" | "medium" | "high";
  met: number;
};

type PickerItem = {
  key: string;
  label: string;
};

// --- Components ---

interface WheelPickerProps {
  items: PickerItem[];
  selectedIndex: number;
  onChange: (index: number) => void;
  flex?: number;
}

function WheelPicker({
  items,
  selectedIndex,
  onChange,
  flex = 1,
}: WheelPickerProps) {
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: selectedIndex * ITEM_HEIGHT,
        animated: false,
      });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleScrollEnd = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(items.length - 1, index));
    onChange(clampedIndex);
  };

  const handleItemPress = (index: number) => {
    onChange(index);
    scrollViewRef.current?.scrollTo({ y: index * ITEM_HEIGHT, animated: true });
  };

  return (
    <View className={`flex-1 relative overflow-hidden`} style={{ flex }}>
      {/* Selection Band Overlay */}
      <View
        className="absolute left-0 right-0 h-[60px] bg-primary/5 rounded-lg border-y border-primary/10 pointer-events-none z-10"
        style={{ top: PADDING }}
      />

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
        contentContainerStyle={{ paddingTop: PADDING, paddingBottom: PADDING }}
      >
        {items.map((item, index) => {
          const distance = Math.abs(index - selectedIndex);
          const opacity = distance === 0 ? 1 : distance === 1 ? 0.5 : 0.25;
          const scale = distance === 0 ? 1.1 : 1;
          const fontWeight = distance === 0 ? "700" : "400";

          return (
            <TouchableOpacity
              key={item.key}
              className="h-[60px] justify-center items-center px-2"
              activeOpacity={0.7}
              onPress={() => handleItemPress(index)}
            >
              <Text
                className="text-foreground text-center"
                style={{
                  opacity,
                  fontSize: 16,
                  transform: [{ scale }],
                  fontWeight: fontWeight as any,
                }}
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

// --- Main Screen ---

export default function AddActivityScreen() {
  const router = useRouter();

  const [activityIndex, setActivityIndex] = useState(0);
  const [durationIndex, setDurationIndex] = useState(5); // Default 30 min
  const [submitting, setSubmitting] = useState(false);

  // Mock weight for calculation (usually from user profile)
  const USER_WEIGHT_KG = 70;

  const selectedActivity = MOCK_ACTIVITY_TYPES[activityIndex];
  const selectedDuration = parseInt(DURATIONS[durationIndex].key, 10);

  // Calculate estimated calories: MET * Weight(kg) * Time(hrs)
  const estimatedCalories = Math.round(
    selectedActivity.met * USER_WEIGHT_KG * (selectedDuration / 60)
  );
  const intensityColor = INTENSITY_COLORS[selectedActivity.intensity];

  const handleSubmit = async () => {
    setSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setSubmitting(false);
      // Navigate back
      router.back();
      // In a real app, we would trigger a refresh or event here
    }, 800);
  };

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      edges={["top", "left", "right"]}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft size={24} className="text-foreground" strokeWidth={2} />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-foreground">Log Activity</Text>
        <View className="w-8" /> {/* Spacer for center alignment */}
      </View>

      <View className="flex-1 px-6 pt-8">
        {/* Picker Section */}
        <View className="bg-card rounded-2xl border border-border overflow-hidden mb-6 shadow-sm">
          <View className="flex-row h-[320px]">
            {/* Activity Picker */}
            <View className="flex-[3] border-r border-border">
              <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center mb-2 mt-2">
                Activity
              </Text>
              <WheelPicker
                items={MOCK_ACTIVITY_TYPES.map((a) => ({
                  key: a.key,
                  label: a.label,
                }))}
                selectedIndex={activityIndex}
                onChange={setActivityIndex}
              />
            </View>

            {/* Duration Picker */}
            <View className="flex-1 relative">
              <View className="flex-row justify-center items-center mb-2 mt-2 relative">
                <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Duration
                </Text>
                <Text className="absolute right-2 text-xs text-muted-foreground font-medium">
                  min
                </Text>
              </View>
              <WheelPicker
                items={DURATIONS}
                selectedIndex={durationIndex}
                onChange={setDurationIndex}
              />
            </View>
          </View>
        </View>

        {/* Details Card */}
        <View
          className="bg-card rounded-xl p-5 border border-border mb-6"
          style={{ borderLeftWidth: 4, borderLeftColor: intensityColor }}
        >
          <View className="flex-row justify-between items-start mb-3">
            <View>
              <Text className="text-sm text-muted-foreground uppercase tracking-wide mb-1">
                {selectedActivity.category}
              </Text>
              <Text className="text-xl font-bold text-foreground">
                {selectedActivity.label}
              </Text>
            </View>
            <View
              className="px-3 py-1 rounded-full"
              style={{ backgroundColor: `${intensityColor}20` }}
            >
              <Text
                className="text-xs font-bold"
                style={{ color: intensityColor }}
              >
                {selectedActivity.intensity.toUpperCase()}
              </Text>
            </View>
          </View>

          <View className="flex-row gap-6">
            <View className="flex-row items-center gap-2">
              <Clock size={16} className="text-muted-foreground" />
              <Text className="text-foreground font-medium">
                {selectedDuration} min
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Flame size={16} className="text-muted-foreground" />
              <Text className="text-foreground font-medium">
                ~{estimatedCalories} kcal
              </Text>
            </View>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.8}
          className={`bg-primary rounded-2xl py-4 flex-row items-center justify-center shadow-lg ${submitting ? "opacity-70" : ""}`}
        >
          {submitting ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <CheckCircle
                size={20}
                className="text-primary-foreground mr-2"
                strokeWidth={3}
              />
              <Text className="text-primary-foreground font-bold text-lg">
                Log Workout
              </Text>
            </>
          )}
        </TouchableOpacity>

        <Text className="text-center text-xs text-muted-foreground mt-4">
          Based on estimated weight of {USER_WEIGHT_KG}kg
        </Text>
      </View>
    </SafeAreaView>
  );
}
