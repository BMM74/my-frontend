import { ThemeToggle } from '@/components/ThemeToggle';
import { router } from 'expo-router';
import { ArrowLeft, RefreshCw, Utensils } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../../lib/api';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MEAL_SLOTS = ['breakfast', 'lunch', 'dinner'];

function getCalorieColor(avg, target) {
  if (!target) return '#3B82F6';
  const ratio = avg / target;
  if (ratio >= 0.9 && ratio <= 1.1) return '#22C55E';
  if (ratio >= 0.8 && ratio <= 1.2) return '#F59E0B';
  return '#EF4444';
}

function StatChip({ value, label, color }) {
  return (
    <View className="flex-col items-center bg-card border border-border rounded-2xl p-3 min-w-[90px]">
      <Text
        className={`text-sm font-bold ${color ? '' : 'text-foreground'}`}
        style={color ? { color } : undefined}
      >
        {value}
      </Text>
      <Text className="text-xs text-muted-foreground mt-1">{label}</Text>
    </View>
  );
}

function MealSlotCard({ slotLabel, meal }) {
  const [imageError, setImageError] = useState(false);

  if (!meal || !meal.name) {
    return (
      <View className="bg-card border border-dashed border-border rounded-2xl p-6 items-center justify-center mb-3">
        <Utensils size={24} color="#64748B" />
        <Text className="text-sm font-semibold text-foreground mt-2">{slotLabel.toUpperCase()}</Text>
        <Text className="text-xs text-muted-foreground mt-1">Rest / Fasting</Text>
      </View>
    );
  }

  const initials = meal.name.split(' ').slice(0, 2).map((w) => w[0]).join('');
  console.log(`[Meal] ${meal.name} - imageUrl:`, meal.imageUrl);

  return (
    <View className="bg-card border border-border rounded-2xl p-4 flex-row gap-4 mb-3 items-center">
      <View className="w-20 h-20 rounded-xl bg-muted overflow-hidden">
        {meal.imageUrl && !imageError ? (
          <Image 
            source={{ uri: meal.imageUrl }} 
            style={{ width: '100%', height: '100%' }} 
            resizeMode="cover"
            onError={(err) => {
              console.error(`[Image Error] Failed to load: ${meal.imageUrl}`, err);
              setImageError(true);
            }}
          />
        ) : (
          <View className="w-full h-full items-center justify-center bg-secondary">
            <Text className="text-secondary-foreground font-bold text-lg">{initials}</Text>
          </View>
        )}
      </View>
      <View className="flex-1">
        <Text className="text-xs text-muted-foreground mb-1">{slotLabel.toUpperCase()}</Text>
        <Text className="text-base font-semibold text-foreground mb-2">{meal.name}</Text>
        <Text className="text-xs text-muted-foreground">
          <Text className="text-foreground font-medium">{meal.calories} kcal</Text>
          {' · '}
          {meal.protein}g P · {meal.carbs}g C · {meal.fat}g F
        </Text>
      </View>
    </View>
  );
}

export default function PlanScreen() {
  const [plan, setPlan] = useState(null);
  const [dailyTarget, setDailyTarget] = useState(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState('');
  const dayScrollRef = useRef(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [planRes, userRes] = await Promise.all([
        api.get('/meal-plan/current'),
        api.get('/users/me'),
      ]);
      if (!planRes.data) {
        router.replace('/meals/preferences');
        return;
      }
      setPlan(planRes.data);
      setDailyTarget(userRes.data.metrics?.dailyCalories ?? null);
    } catch (err) {
      if (err.response?.status !== 401) {
        const msg = err.response?.data?.message;
        setError(Array.isArray(msg) ? msg.join('\n') : (msg || 'Failed to load plan.'));
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleRegenerate() {
    Alert.alert('Regenerate Plan', 'This will replace your current plan. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes, Regenerate',
        onPress: async () => {
          setRegenerating(true);
          setError('');
          try {
            const res = await api.post('/meal-plan/generate');
            setPlan(res.data);
            setSelectedDay(0);
          } catch (err) {
            const msg = err.response?.data?.message;
            setError(Array.isArray(msg) ? msg.join('\n') : (msg || 'Could not build a plan.'));
          } finally {
            setRegenerating(false);
          }
        },
      },
    ]);
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#0D9488" />
      </SafeAreaView>
    );
  }

  if (!plan) return null;

  const calorieColor = getCalorieColor(plan.avgCalories, dailyTarget);
  const dayData = plan.days[selectedDay] || {};

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft size={24} color="#64748B" />
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
          <Text className="text-lg font-bold text-foreground mb-4">Weekly Nutrition</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            <StatChip value={`~${plan.avgCalories}`} label="Avg / day" color={calorieColor} />
            <StatChip value={`${plan.avgProtein}g`} label="Protein" color="#8B5CF6" />
            <StatChip value={`${plan.avgCarbs}g`} label="Carbs" color="#F59E0B" />
            <StatChip value={`${plan.avgFat}g`} label="Fat" color="#EC4899" />
          </ScrollView>
          {dailyTarget ? (
            <View className="mt-3 px-1">
              <Text className="text-sm text-muted-foreground">
                Your target:{' '}
                <Text className="font-bold" style={{ color: calorieColor }}>
                  {dailyTarget} kcal/day
                </Text>
              </Text>
            </View>
          ) : null}
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
                  selectedDay === index ? 'bg-primary border-primary' : 'bg-card border-border'
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    selectedDay === index ? 'text-primary-foreground' : 'text-foreground'
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
          <Text className="text-lg font-bold text-foreground mb-4">{DAY_LABELS[selectedDay]}'s Meals</Text>
          <View className="gap-3">
            {MEAL_SLOTS.map((slot) => (
              <MealSlotCard key={slot} slotLabel={slot} meal={dayData[slot]} />
            ))}
          </View>
        </View>

        {/* Regenerate Button */}
        <TouchableOpacity
          onPress={handleRegenerate}
          disabled={regenerating}
          className="mt-8 flex-row items-center justify-center gap-2 bg-card border border-border p-4 rounded-2xl"
          activeOpacity={0.8}
        >
          <RefreshCw size={18} color="#0D9488" />
          <Text className="text-primary font-semibold">Regenerate Plan</Text>
        </TouchableOpacity>

        {error ? <Text className="text-destructive text-center mt-4">{error}</Text> : null}
      </ScrollView>

      {/* Regenerating Overlay */}
      {regenerating && (
        <View className="absolute inset-0 bg-black/60 items-center justify-center z-50">
          <View className="bg-card p-8 rounded-2xl items-center mx-6 border border-border">
            <ActivityIndicator size="large" color="#0D9488" />
            <Text className="text-foreground font-semibold text-center mt-4">
              Building your personalised plan...
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
