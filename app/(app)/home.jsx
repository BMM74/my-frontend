import { ThemeToggle } from '@/components/ThemeToggle';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { Activity, Coffee, Flame, Sandwich, Target, TrendingUp, Utensils, X } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Pressable,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../lib/api';

function getTodayDayIndex() {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
}

const MEAL_SLOT_LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' };
const MEAL_SLOT_ICONS = { breakfast: Coffee, lunch: Sandwich, dinner: Utensils };

function getBmiLabel(bmi) {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

function BMIChart({ value }) {
  const maxBmi = 40;
  const percentage = Math.min((value / maxBmi) * 100, 100);
  return (
    <View className="mt-4">
      <View className="h-4 w-full rounded-full flex-row overflow-hidden bg-muted">
        <View className="flex-1 bg-blue-500 h-full" />
        <View className="flex-1 bg-green-500 h-full" />
        <View className="flex-1 bg-yellow-500 h-full" />
        <View className="flex-1 bg-red-500 h-full" />
      </View>
      <View className="relative h-6 mt-1">
        <View
          className="absolute top-0 w-0.5 h-full bg-foreground"
          style={{ left: `${percentage}%` }}
        >
          <View className="absolute -top-1 -left-1 w-2 h-2 bg-foreground rounded-full" />
        </View>
      </View>
      <View className="flex-row justify-between mt-2">
        {['0', '18.5', '25', '30', '40+'].map((l) => (
          <Text key={l} className="text-xs text-muted-foreground">{l}</Text>
        ))}
      </View>
      <View className="mt-4 p-4 bg-muted rounded-xl">
        <Text className="text-sm font-semibold text-foreground mb-2">Analysis</Text>
        <Text className="text-sm text-muted-foreground">
          Your BMI is <Text className="font-bold text-foreground">{value}</Text>. {getBmiLabel(value)} weight range.
        </Text>
      </View>
    </View>
  );
}

function CalorieChart({ value, type }) {
  const protein = Math.round(value * 0.3);
  const carbs = Math.round(value * 0.5);
  const fat = Math.round(value * 0.2);
  const bars = [
    { label: 'Carbs (50%)', kcal: carbs, color: 'bg-blue-500', width: '50%' },
    { label: 'Protein (30%)', kcal: protein, color: 'bg-green-500', width: '30%' },
    { label: 'Fat (20%)', kcal: fat, color: 'bg-yellow-500', width: '20%' },
  ];
  const description =
    type === 'BMR'
      ? 'Basal Metabolic Rate: Calories burned at complete rest.'
      : type === 'TDEE'
      ? 'Total Daily Energy Expenditure: Total calories burned per day with activity.'
      : 'Daily Target: Recommended calorie intake for your goal.';
  return (
    <View className="mt-4">
      <Text className="text-sm font-semibold text-foreground mb-3">Suggested Macro Breakdown</Text>
      <View className="gap-3">
        {bars.map((bar) => (
          <View key={bar.label}>
            <View className="flex-row justify-between mb-1">
              <Text className="text-xs text-muted-foreground">{bar.label}</Text>
              <Text className="text-xs font-bold text-foreground">{bar.kcal} kcal</Text>
            </View>
            <View className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <View className={`h-full ${bar.color} rounded-full`} style={{ width: bar.width }} />
            </View>
          </View>
        ))}
      </View>
      <View className="mt-4 p-4 bg-muted rounded-xl">
        <Text className="text-sm font-semibold text-foreground mb-2">About {type}</Text>
        <Text className="text-sm text-muted-foreground">{description}</Text>
      </View>
    </View>
  );
}

function getDailyCaloriesSubtitle(goal) {
  if (goal === 'lose') return 'kcal / day (deficit)';
  if (goal === 'maintain') return 'kcal / day (maintenance)';
  return 'kcal / day (surplus)';
}

function MetricCard({ label, value, subtitle, icon: Icon, highlight, onPress }) {
  return (
    <Pressable onPress={onPress} className="flex-1">
      <View className={`flex-1 bg-card rounded-2xl p-4 border ${highlight ? 'border-primary/50 bg-primary/5' : 'border-border'} min-h-[120px] justify-between`}>
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-sm font-medium text-muted-foreground">{label}</Text>
          <Icon size={16} color={highlight ? '#0D9488' : '#94A3B8'} />
        </View>
        <View>
          <Text className={`text-2xl font-bold ${highlight ? 'text-primary' : 'text-foreground'}`}>
            {value}
          </Text>
          <Text className="text-xs text-muted-foreground mt-1">{subtitle}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const [userData, setUserData] = useState(null);
  const [todayMeals, setTodayMeals] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMetric, setSelectedMetric] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      async function fetchData() {
        setLoading(true);
        setError('');
        try {
          const [userRes, planRes, actRes] = await Promise.allSettled([
            api.get('/users/me'),
            api.get('/meal-plan/current'),
            api.get('/activities?range=week'),
          ]);
          if (!active) return;
          if (userRes.status === 'fulfilled') {
            setUserData(userRes.value.data);
          } else if (userRes.reason?.response?.status !== 401) {
            const msg = userRes.reason?.response?.data?.message;
            setError(Array.isArray(msg) ? msg.join('\n') : (msg || 'Failed to load data.'));
          }
          if (planRes.status === 'fulfilled' && planRes.value.data) {
            const dayIndex = getTodayDayIndex();
            setTodayMeals(planRes.value.data.days?.[dayIndex] ?? null);
          } else {
            setTodayMeals(null);
          }
          if (actRes.status === 'fulfilled' && Array.isArray(actRes.value.data)) {
            setRecentActivities(actRes.value.data.slice(0, 3));
          } else {
            setRecentActivities([]);
          }
        } finally {
          if (active) setLoading(false);
        }
      }
      fetchData();
      return () => { active = false; };
    }, [])
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#0D9488" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center p-6">
        <Text className="text-destructive text-center">{error}</Text>
      </SafeAreaView>
    );
  }

  const { user, metrics } = userData;
  const username = user.email.split('@')[0];

  const metricsList = metrics
    ? [
        { id: 'bmi', label: 'BMI', value: Number(metrics.bmi).toFixed(1), subtitle: getBmiLabel(metrics.bmi), icon: Target, type: 'bmi' },
        { id: 'bmr', label: 'BMR', value: String(metrics.bmr), subtitle: 'kcal / day at rest', icon: Flame, type: 'bmr' },
        { id: 'tdee', label: 'TDEE', value: String(metrics.tdee), subtitle: 'Total daily energy', icon: TrendingUp, type: 'tdee' },
        { id: 'calories', label: 'Daily Target', value: String(metrics.dailyCalories), subtitle: getDailyCaloriesSubtitle(user.goal), icon: Activity, type: 'calories', highlight: true },
      ]
    : [];

  function renderChart() {
    if (!selectedMetric) return null;
    const value = parseFloat(selectedMetric.value);
    if (selectedMetric.type === 'bmi') return <BMIChart value={value} />;
    return <CalorieChart value={value} type={selectedMetric.label} />;
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 128, gap: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between pt-2">
          <View>
            <Text className="text-2xl font-bold text-foreground">Hi, {username} 👋</Text>
            <Text className="text-muted-foreground">Here's your fitness overview</Text>
          </View>
          <ThemeToggle />
        </View>

        {metrics ? (
          <>
            {/* Metrics Grid */}
            <View className="gap-4">
              <View className="flex-row gap-4">
                <MetricCard {...metricsList[0]} onPress={() => setSelectedMetric(metricsList[0])} />
                <MetricCard {...metricsList[1]} onPress={() => setSelectedMetric(metricsList[1])} />
              </View>
              <View className="flex-row gap-4">
                <MetricCard {...metricsList[2]} onPress={() => setSelectedMetric(metricsList[2])} />
                <MetricCard {...metricsList[3]} onPress={() => setSelectedMetric(metricsList[3])} />
              </View>
            </View>

            {/* Profile Stats Row */}
            <View className="bg-card rounded-2xl p-4 border border-border flex-row justify-between items-center">
              <View className="flex-1 items-center border-r border-border">
                <Text className="text-xl font-bold text-foreground">{user.weight}</Text>
                <Text className="text-xs text-muted-foreground mt-1">Weight (kg)</Text>
              </View>
              <View className="flex-1 items-center border-r border-border">
                <Text className="text-xl font-bold text-foreground">{user.height}</Text>
                <Text className="text-xs text-muted-foreground mt-1">Height (cm)</Text>
              </View>
              <View className="flex-1 items-center">
                <Text className="text-xl font-bold text-foreground">{user.age}</Text>
                <Text className="text-xs text-muted-foreground mt-1">Age</Text>
              </View>
            </View>
          </>
        ) : (
          <View className="bg-card rounded-2xl p-6 border border-border">
            <Text className="text-muted-foreground text-center">
              Complete your profile to see your metrics.
            </Text>
          </View>
        )}

        {/* Recent Activities */}
        {recentActivities.length > 0 && (
          <View>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-foreground">Recent Activities</Text>
              <TouchableOpacity onPress={() => router.push('/(app)/activities')}>
                <Text className="text-sm text-primary font-medium">History</Text>
              </TouchableOpacity>
            </View>
            <View className="gap-3">
              {recentActivities.map((item, idx) => (
                <View
                  key={idx}
                  className="bg-card rounded-xl p-4 border border-border flex-row items-center justify-between"
                >
                  <View className="flex-row items-center gap-3 flex-1">
                    <View className="bg-orange-500/10 p-3 rounded-full">
                      <Activity size={20} color="#F97316" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-semibold text-foreground">{item.activityLabel}</Text>
                      <Text className="text-sm text-muted-foreground">{item.durationMinutes} min</Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="font-bold text-foreground">{item.caloriesBurned}</Text>
                    <Text className="text-xs text-muted-foreground">kcal</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Today's Meals */}
        {todayMeals && (
          <View>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-foreground">Today's Meals</Text>
              <TouchableOpacity onPress={() => router.push('/(app)/meals/plan')}>
                <Text className="text-sm text-primary font-medium">See All</Text>
              </TouchableOpacity>
            </View>
            <View className="gap-3">
              {['breakfast', 'lunch', 'dinner'].map((slot) => {
                const meal = todayMeals[slot];
                if (!meal || !meal.name) return null;
                return (
                  <View key={slot} className="bg-card rounded-xl p-4 border border-border flex-row items-center gap-4">
                    <View className="bg-primary/10 p-3 rounded-full">
                      {(() => { const Icon = MEAL_SLOT_ICONS[slot]; return <Icon size={20} color="#0D9488" />; })()}
                    </View>
                    <View className="flex-1">
                      <Text className="font-semibold text-foreground">{MEAL_SLOT_LABELS[slot]}</Text>
                      <Text className="text-sm text-muted-foreground">{meal.name}</Text>
                    </View>
                    <View className="items-end">
                      <Text className="font-bold text-foreground">{meal.calories}</Text>
                      <Text className="text-xs text-muted-foreground">kcal</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Metric Detail Modal */}
      <Modal
        visible={!!selectedMetric}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedMetric(null)}
      >
        <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View className="bg-card rounded-2xl p-6 mx-6 w-full" style={{ maxWidth: 400 }}>
            {/* Modal Header */}
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center gap-3">
                {selectedMetric && <selectedMetric.icon size={24} color="#0D9488" />}
                <Text className="text-2xl font-bold text-foreground">{selectedMetric?.label}</Text>
              </View>
              <Pressable onPress={() => setSelectedMetric(null)} className="p-2 -mr-2">
                <X size={20} color="#64748B" />
              </Pressable>
            </View>

            {/* Value */}
            <View className="mb-4">
              <Text className="text-4xl font-bold text-primary">{selectedMetric?.value}</Text>
              <Text className="text-sm text-muted-foreground mt-1">{selectedMetric?.subtitle}</Text>
            </View>

            {renderChart()}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

