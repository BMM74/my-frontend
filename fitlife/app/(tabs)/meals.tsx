import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Utensils,
  Flame,
  TrendingUp,
  ChevronRight,
  Sparkles,
} from "lucide-react-native";

// Mock Data
const MOCK_PLAN_DATA = {
  avgCalories: 1850,
  avgProtein: 125,
  avgCarbs: 180,
  avgFat: 65,
};

const MOCK_TODAY_MEALS = [
  {
    id: 1,
    name: "Avocado & Egg Toast",
    calories: 450,
    protein: "18g",
    image:
      "https://images.unsplash.com/photo-1562918005-50afb98e5d32?w=400&auto=format&fit=crop&q=60",
  },
  {
    id: 2,
    name: "Grilled Salmon Bowl",
    calories: 620,
    protein: "42g",
    image:
      "https://images.unsplash.com/photo-1648580852350-3098af89f110?w=400&auto=format&fit=crop&q=60",
  },
  {
    id: 3,
    name: "Quinoa Salad",
    calories: 380,
    protein: "12g",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&auto=format&fit=crop&q=60",
  },
];

type StatCardProps = {
  value: string;
  label: string;
  icon: React.ElementType;
};

function StatCard({ value, label, icon: Icon }: StatCardProps) {
  return (
    <View className="flex-1 bg-card rounded-2xl p-4 border border-border items-center justify-center gap-2">
      <Icon size={20} className="text-primary" />
      <Text className="text-xl font-bold text-foreground">{value}</Text>
      <Text className="text-xs text-muted-foreground">{label}</Text>
    </View>
  );
}

export default function MealsScreen() {
  const router = useRouter();
  const [status, setStatus] = useState<
    "none" | "preferences_saved" | "ratings_done" | "plan_ready"
  >("plan_ready");
  const [planData, setPlanData] = useState(MOCK_PLAN_DATA);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Simulate fetching status
    setTimeout(() => {
      setLoading(false);
      // Default to plan_ready for preview purposes
      setStatus("plan_ready");
      setPlanData(MOCK_PLAN_DATA);
    }, 800);
  }, []);

  async function handleGenerate() {
    setGenerating(true);
    setError("");
    // Simulate API call
    setTimeout(() => {
      setGenerating(false);
      setStatus("plan_ready");
      setPlanData(MOCK_PLAN_DATA);
      router.push("/(tabs)/meals"); // Stay on screen but update view
    }, 2000);
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" className="text-primary" />
      </SafeAreaView>
    );
  }

  // ── plan_ready: show stats + View Full Plan button ──────────────────────────
  if (status === "plan_ready") {
    return (
      <SafeAreaView
        className="flex-1 bg-background"
        edges={["top", "left", "right"]}
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom: 128,
            gap: 24,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between pt-2">
            <View>
              <Text className="text-2xl font-bold text-foreground">
                Meal Plan
              </Text>
              <Text className="text-muted-foreground">
                Your personalized nutrition
              </Text>
            </View>
            <ThemeToggle />
          </View>

          {/* Stats Grid */}
          <View>
            <Text className="text-lg font-bold text-foreground mb-4">
              Daily Averages
            </Text>
            <View className="flex-row gap-4 flex-wrap">
              <StatCard
                value={planData.avgCalories.toString()}
                label="Calories"
                icon={Flame}
              />
              <StatCard
                value={`${planData.avgProtein}g`}
                label="Protein"
                icon={TrendingUp}
              />
              <StatCard
                value={`${planData.avgCarbs}g`}
                label="Carbs"
                icon={Utensils}
              />
              <StatCard
                value={`${planData.avgFat}g`}
                label="Fat"
                icon={Utensils}
              />
            </View>
          </View>

          {/* Today's Preview */}
          <View>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-foreground">
                Today's Highlights
              </Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/meals")}>
                <Text className="text-sm text-primary font-medium">
                  View All
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 16 }}
            >
              {MOCK_TODAY_MEALS.map((meal) => (
                <View
                  key={meal.id}
                  className="w-48 bg-card rounded-2xl border border-border overflow-hidden"
                >
                  <Image
                    source={{ uri: meal.image }}
                    className="w-full h-32"
                    resizeMode="cover"
                  />
                  <View className="p-3">
                    <Text
                      className="font-semibold text-foreground text-sm mb-1"
                      numberOfLines={1}
                    >
                      {meal.name}
                    </Text>
                    <View className="flex-row items-center gap-3">
                      <Text className="text-xs text-muted-foreground">
                        {meal.calories} kcal
                      </Text>
                      <Text className="text-xs text-primary font-medium">
                        {meal.protein} protein
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Actions */}
          <View className="gap-3 mt-4">
            <TouchableOpacity
              className="bg-primary rounded-2xl p-4 items-center justify-center"
              onPress={() => router.push("/(tabs)/meals")}
              activeOpacity={0.85}
            >
              <Text className="text-primary-foreground font-semibold text-base">
                View Full Plan
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-card rounded-2xl p-4 items-center justify-center border border-border"
              onPress={() => router.push("/(tabs)/meals")}
              activeOpacity={0.85}
            >
              <Text className="text-foreground font-medium text-base">
                Update Preferences
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── ratings_done: offer to generate ─────────────────────────────────────────
  if (status === "ratings_done") {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6">
        <View className="bg-primary/10 p-6 rounded-full mb-6">
          <Sparkles size={48} className="text-primary" />
        </View>
        <Text className="text-2xl font-bold text-foreground text-center mb-2">
          Ready to Generate
        </Text>
        <Text className="text-muted-foreground text-center mb-8 text-center">
          Your ratings are saved. Tap below to build your personalised 7-day
          meal plan.
        </Text>
        {error ? (
          <Text className="text-destructive text-center mb-4">{error}</Text>
        ) : null}

        <TouchableOpacity
          className={`bg-primary rounded-2xl p-4 w-full items-center justify-center ${generating ? "opacity-70" : ""}`}
          onPress={handleGenerate}
          disabled={generating}
          activeOpacity={0.85}
        >
          {generating ? (
            <View className="flex-row items-center gap-2">
              <ActivityIndicator color="#ffffff" />
              <Text className="text-primary-foreground font-semibold">
                Building your plan...
              </Text>
            </View>
          ) : (
            <Text className="text-primary-foreground font-semibold text-base">
              Generate My Plan
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  // ── none / preferences_saved: gateway CTA ───────────────────────────────────
  const isNone = status === "none";
  const emoji = isNone ? "🥗" : "⭐";
  const title = isNone ? "Build Your Meal Plan" : "Rate Some Meals";
  const body = isNone
    ? "Tell us your dietary preferences and we'll create a personalised 7-day meal plan tailored to your goals."
    : "Help us understand your taste. Rate a selection of meals so we can fine-tune your plan.";
  const btnLabel = isNone ? "Get Started" : "Rate Meals";

  return (
    <View className="flex-1 bg-background items-center justify-center px-6">
      <Text className="text-6xl mb-6">{emoji}</Text>
      <Text className="text-2xl font-bold text-foreground text-center mb-2">
        {title}
      </Text>
      <Text className="text-muted-foreground text-center mb-8 leading-6">
        {body}
      </Text>

      {error ? (
        <Text className="text-destructive text-center mb-4">{error}</Text>
      ) : null}

      <TouchableOpacity
        className="bg-primary rounded-2xl p-4 w-full items-center justify-center"
        onPress={() => router.push("/(tabs)/meals")}
        activeOpacity={0.85}
      >
        <Text className="text-primary-foreground font-semibold text-base">
          {btnLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
