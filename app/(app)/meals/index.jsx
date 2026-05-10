import { ThemeToggle } from '@/components/ThemeToggle';
import { router, useFocusEffect } from 'expo-router';
import { Flame, Sparkles, TrendingUp, Utensils } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../../lib/api';

const GATEWAY_CONFIG = {
  none: {
    emoji: '🥗',
    title: 'Build Your Meal Plan',
    body: "Tell us your dietary preferences and we'll create a personalised 7-day meal plan tailored to your goals.",
    buttonLabel: 'Get Started',
    onPress: () => router.push('/meals/preferences'),
  },
  preferences_saved: {
    emoji: '⭐',
    title: 'Rate Some Meals',
    body: 'Help us understand your taste. Rate a selection of meals so we can fine-tune your plan.',
    buttonLabel: 'Rate Meals',
    onPress: () => router.push('/meals/rate'),
  },
};

function getTodayDayIndex() {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
}

function StatCard({ value, label, icon: Icon }) {
  return (
    <View className="flex-1 bg-card rounded-2xl p-4 border border-border items-center justify-center gap-2">
      <Icon size={20} color="#0D9488" />
      <Text className="text-xl font-bold text-foreground">{value}</Text>
      <Text className="text-xs text-muted-foreground">{label}</Text>
    </View>
  );
}

export default function MealsIndexScreen() {
  const [status, setStatus] = useState(null);
  const [planData, setPlanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [imageErrors, setImageErrors] = useState({});

  useFocusEffect(useCallback(() => { fetchStatus(); }, []));

  async function fetchStatus() {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/users/me');
      const s = res.data.user?.mealPlanStatus || 'none';
      setStatus(s);
      if (s === 'plan_ready') {
        try {
          const planRes = await api.get('/meal-plan/current');
          setPlanData(planRes.data);
        } catch (_) {}
      }
    } catch (err) {
      if (err.response?.status !== 401) {
        const msg = err.response?.data?.message;
        setError(Array.isArray(msg) ? msg.join('\n') : (msg || 'Failed to load.'));
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    setError('');
    try {
      await api.post('/meal-plan/generate');
      router.push('/meals/plan');
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join('\n') : (msg || 'Could not build a plan. Try relaxing preferences.'));
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#0D9488" />
      </SafeAreaView>
    );
  }

  if (status === 'plan_ready') {
    const todayIdx = getTodayDayIndex();
    const todayDay = planData?.days?.[todayIdx];
    const todayMeals = todayDay
      ? ['breakfast', 'lunch', 'dinner']
          .map((slot) => todayDay[slot])
          .filter((m) => m && m.name)
      : [];

    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 128, gap: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between pt-2">
            <View>
              <Text className="text-2xl font-bold text-foreground">Meal Plan</Text>
              <Text className="text-muted-foreground">Your personalized nutrition</Text>
            </View>
            <ThemeToggle />
          </View>

          {planData ? (
            <>
              {/* Daily Averages */}
              <View>
                <Text className="text-lg font-bold text-foreground mb-4">Daily Averages</Text>
                <View className="flex-row gap-4 flex-wrap">
                  <StatCard value={String(planData.avgCalories)} label="Calories" icon={Flame} />
                  <StatCard value={`${planData.avgProtein}g`} label="Protein" icon={TrendingUp} />
                </View>
                <View className="flex-row gap-4 flex-wrap mt-4">
                  <StatCard value={`${planData.avgCarbs}g`} label="Carbs" icon={Utensils} />
                  <StatCard value={`${planData.avgFat}g`} label="Fat" icon={Utensils} />
                </View>
              </View>

              {/* Today's Highlights */}
              {todayMeals.length > 0 && (
                <View>
                  <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-lg font-bold text-foreground">Today's Highlights</Text>
                    <TouchableOpacity onPress={() => router.push('/meals/plan')}>
                      <Text className="text-sm text-primary font-medium">View All</Text>
                    </TouchableOpacity>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 16 }}
                  >
                    {todayMeals.map((meal, idx) => {
                      const hasImageError = imageErrors[idx];
                      console.log(`[Meal] ${meal?.name} - imageUrl:`, meal?.imageUrl);
                      return (
                      <View
                        key={idx}
                        className="w-48 bg-card rounded-2xl border border-border overflow-hidden"
                      >
                        {meal.imageUrl && !hasImageError ? (
                          <Image
                            source={{ uri: meal.imageUrl }}
                            style={{ width: '100%', height: 128 }}
                            resizeMode="cover"
                            onError={(err) => {
                              console.error(`[Image Error] Failed to load: ${meal.imageUrl}`, err);
                              setImageErrors(prev => ({ ...prev, [idx]: true }));
                            }}
                          />
                        ) : (
                          <View className="w-full h-32 bg-primary/10 items-center justify-center">
                            <Utensils size={32} color="#0D9488" />
                          </View>
                        )}
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
                            {meal.protein ? (
                              <Text className="text-xs text-primary font-medium">
                                {meal.protein}g protein
                              </Text>
                            ) : null}
                          </View>
                        </View>
                      </View>
                    );
                    })}
                  </ScrollView>
                </View>
              )}

              {/* Actions */}
              <View className="gap-3 mt-2">
                <TouchableOpacity
                  className="bg-primary rounded-2xl p-4 items-center justify-center flex-row gap-2"
                  onPress={() => router.push('/meals/plan')}
                  activeOpacity={0.85}
                >
                  <Sparkles size={18} color="#ffffff" />
                  <Text className="text-primary-foreground font-semibold text-base">View Full Plan</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-card rounded-2xl p-4 border border-border items-center justify-center"
                  onPress={() => router.push('/meals/preferences')}
                  activeOpacity={0.85}
                >
                  <Text className="text-foreground font-semibold text-base">Update Preferences</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <ActivityIndicator color="#0D9488" style={{ marginTop: 32 }} />
          )}

          {error ? <Text className="text-destructive text-center">{error}</Text> : null}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (status === 'ratings_done') {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-6">
        <Text className="text-5xl mb-4">⚡</Text>
        <Text className="text-2xl font-bold text-foreground mb-2 text-center">Ready to Generate</Text>
        <Text className="text-muted-foreground text-center mb-8">
          Your ratings are saved. Tap below to build your personalised 7-day meal plan.
        </Text>
        {error ? <Text className="text-destructive text-center mb-4">{error}</Text> : null}
        <TouchableOpacity
          className={`bg-primary rounded-2xl py-4 px-8 items-center justify-center flex-row gap-2 w-full ${generating ? 'opacity-70' : ''}`}
          onPress={handleGenerate}
          disabled={generating}
          activeOpacity={0.85}
        >
          {generating ? (
            <>
              <ActivityIndicator color="#ffffff" />
              <Text className="text-primary-foreground font-semibold ml-2">Building your plan...</Text>
            </>
          ) : (
            <Text className="text-primary-foreground font-semibold text-base">Generate My Plan</Text>
          )}
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const cfg = GATEWAY_CONFIG[status] ?? GATEWAY_CONFIG.none;

  return (
    <SafeAreaView className="flex-1 bg-background items-center justify-center px-6">
      <Text className="text-5xl mb-4">{cfg.emoji}</Text>
      <Text className="text-2xl font-bold text-foreground mb-2 text-center">{cfg.title}</Text>
      <Text className="text-muted-foreground text-center mb-8">{cfg.body}</Text>
      {error ? <Text className="text-destructive text-center mb-4">{error}</Text> : null}
      <TouchableOpacity
        className="bg-primary rounded-2xl py-4 px-8 items-center justify-center w-full"
        onPress={cfg.onPress}
        activeOpacity={0.85}
      >
        <Text className="text-primary-foreground font-semibold text-base">{cfg.buttonLabel}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
