import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowLeft, RefreshCw, Utensils } from "lucide-react-native";

// Constants
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MEAL_SLOTS = ["breakfast", "lunch", "dinner"];

// Mock Data
const MOCK_PLAN = {
  avgCalories: 1850,
  avgProtein: 125,
  avgCarbs: 180,
  avgFat: 65,
  days: Array.from({ length: 7 }, (_, i) => ({
    breakfast: i % 2 === 0 ? {
      name: "Avocado & Egg Toast",
      calories: 450,
      protein: 18,
      carbs: 35,
      fat: 22,
      imageUrl: "https://images.unsplash.com/photo-1562918005-50afb98e5d32?w=400&auto=format&fit=crop&q=60",
    } : null,
    lunch: {
      name: "Grilled Salmon Bowl",
      calories: 620,
      protein: 42,
      carbs: 45,
      fat: 28,
      imageUrl: "https://images.unsplash.com/photo-1648580852350-3098af89f110?w=400&auto=format&fit=crop&q=60",
    },
    dinner: i % 3 !== 0 ? {
      name: "Quinoa Salad",
      calories: 380,
      protein: 12,
      carbs: 55,
      fat: 10,
      imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&auto=format&fit=crop&q=60",
    } : null,
  })),
};

// Helper Functions
function getCalorieColor(avg: number, target: number | null) {
  if (!target) return "#3B82F6"; // Blue
  const ratio = avg / target;
  if (ratio >= 0.9 && ratio <= 1.1) return "#22C55E"; // Green
  if (ratio >= 0.8 && ratio <= 1.2) return "#F59E0B"; // Amber
  return "#EF4444"; // Red
}

type StatChipProps = {
  value: string;
  label: string;
  color: string;
};

function StatChip({ value, label, color }: StatChipProps) {
  return (
    <View className="flex-col items-center bg-card border border-border rounded-2xl p-3 min-w-[90px]">
      <Text className="text-sm font-bold" style={{ color }}>
        {value}
      </Text>
      <Text className="text-xs text-muted-foreground mt-1">{label}</Text>
    </View>
  );
}

type MealSlotCardProps = {
  slotLabel: string;
  meal: any;
};

function MealSlotCard({ slotLabel, meal }: MealSlotCardProps) {
  if (!meal || !meal.name) {
    return (
      <View className="bg-card border border-dashed border-border rounded-2xl p-6 items-center justify-center mb-3">
        <Utensils size={24} className="text-muted-foreground mb-2" />
        <Text className="text-sm font-semibold text-foreground">
          {slotLabel.toUpperCase()}
        </Text>
        <Text className="text-xs text-muted-foreground mt-1">Rest / Fasting</Text>
      </View>
    );
  }

  const initials = meal.name
    .split(" ")
    .slice(0, 2)
    .map((w: string) => w[0])
    .join("");

  return (
    <View className="bg-card border border-border rounded-2xl p-4 flex-row gap-4 mb-3 items-center">
      <View className="w-20 h-20 rounded-xl bg-muted overflow-hidden flex-shrink-0">
        {meal.imageUrl ? (
          <Image
            source={{ uri: meal.imageUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full items-center justify-center bg-secondary">
            <Text className="text-secondary-foreground font-bold text-lg">
              {initials}
            </Text>
          </View>
        )}
      </View>
      <View className="flex-1">
        <Text className="text-xs text-muted-foreground mb-1">
          {slotLabel.toUpperCase()}
        </Text>
        <Text className="text-base font-semibold text-foreground mb-2">
          {meal.name}
        </Text>
        <Text className="text-xs text-muted-foreground">
          <Text className="text-foreground font-medium">{meal.calories} kcal</Text>
          {" · "}
          {meal.protein}g P · {meal.carbs}g C · {meal.fat}g F
        </Text>
      </View>
    </View>
  );
}

export default function PlanScreen() {
  const router = useRouter();
  const [plan, setPlan] = useState<any>(null);
  const [dailyTarget, setDailyTarget] = useState<number | null>(2000); // Mock target
  const [selectedDay, setSelectedDay] = useState(0);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const dayScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setPlan(MOCK_PLAN);
      setLoading(false);
    }, 800);
  }, []);

  // Scroll to selected day on mount or change
  useEffect(() => {
    if (dayScrollRef.current && selectedDay > 0) {
      dayScrollRef.current.scrollTo({
        x: (selectedDay - 1) * 70, // Approximate scroll
        animated: true,
      });
    }
  }, [selectedDay]);

  async function handleRegenerate() {
    Alert.alert(
      "Regenerate Plan",
      "This will replace your current plan. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Regenerate",
          onPress: async () => {
            setRegenerating(true);
            try {
              // Simulate API call
              await new Promise((resolve) => setTimeout(resolve, 2000));
              setPlan(MOCK_PLAN); // In real app, this would be new data
              setSelectedDay(0);
            } catch (err) {
              console.error(err);
            } finally {
              setRegenerating(false);
            }
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" className="text-primary" />
      </SafeAreaView>
    );
  }

  if (!plan) return null;

  const calorieColor = getCalorieColor(plan.avgCalories, dailyTarget);
  const dayData = plan.days[selectedDay] || {};

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft size={24} className="text-foreground" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-foreground">Meal Plan</Text>
        <ThemeToggle />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 128 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Nutrition Summary */}
        <View className="mt-6">
          <Text className="text-lg font-bold text-foreground mb-4">
            Weekly Nutrition
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12 }}
          >
            <StatChip
              value={`~${plan.avgCalories}`}
              label="Avg / day"
              color={calorieColor}
            />
            <StatChip value={`${plan.avgProtein}g`} label="Protein" color="#8B5CF6" />
            <StatChip value={`${plan.avgCarbs}g`} label="Carbs" color="#F59E0B" />
            <StatChip value={`${plan.avgFat}g`} label="Fat" color="#EC4899" />
          </ScrollView>
          {dailyTarget && (
            <View className="mt-3 px-1">
              <Text className="text-sm text-muted-foreground">
                Your target:{" "}
                <Text className="text-foreground font-bold" style={{ color: calorieColor }}>
                  {dailyTarget} kcal/day
                </Text>
              </Text>
            </View>
          )}
        </View>

        {/* Day Selector */}
        <View className="mt-8 mb-4">
          <Text className="text-lg font-bold text-foreground mb-4">Select Day</Text>
          <ScrollView
            ref={dayScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {DAY_LABELS.map((day, index) => (
              <TouchableOpacity
                key={day}
                onPress={() => setSelectedDay(index)}
                activeOpacity={0.7}
                className={`px-5 py-2.5 rounded-full border ${
                  selectedDay === index
                    ? "bg-primary border-primary"
                    : "bg-card border-border"
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    selectedDay === index
                      ? "text-primary-foreground"
                      : "text-foreground"
                  }`}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Day Meals */}
        <View>
          <Text className="text-lg font-bold text-foreground mb-4">
            {DAY_LABELS[selectedDay]}'s Meals
          </Text>
          <View className="gap-3">
            {MEAL_SLOTS.map((slot) => (
              <MealSlotCard
                key={slot}
                slotLabel={slot}
                meal={dayData[slot as keyof typeof dayData]}
              />
            ))}
          </View>
        </View>
        
        {/* Regenerate Button */}
        <TouchableOpacity 
            onPress={handleRegenerate}
            className="mt-8 flex-row items-center justify-center gap-2 bg-card border border-border p-4 rounded-2xl"
        >
            <RefreshCw size={18} className="text-primary" />
            <Text className="text-primary font-semibold">Regenerate Plan</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Regenerating Overlay */}
      {regenerating && (
        <View className="absolute inset-0 bg-black/60 items-center justify-center z-50">
          <View className="bg-card p-8 rounded-2xl items-center mx-6 border border-border">
            <ActivityIndicator size="large" className="text-primary mb-4" />
            <Text className="text-foreground font-semibold text-center">
              Building your personalised plan...
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}