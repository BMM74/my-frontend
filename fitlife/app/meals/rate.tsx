import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Types
type Meal = {
  _id: string;
  name: string;
  calories: number;
  protein: number;
  imageUrl?: string;
};

type Ratings = Record<string, number>;

// Mock Data
const MOCK_MEALS: Meal[] = [
  {
    _id: '1',
    name: 'Grilled Salmon with Asparagus',
    calories: 450,
    protein: 35,
  },
  {
    _id: '2',
    name: 'Quinoa Buddha Bowl',
    calories: 520,
    protein: 18,
  },
  {
    _id: '3',
    name: 'Chicken Breast with Sweet Potato',
    calories: 380,
    protein: 40,
  },
  {
    _id: '4',
    name: 'Mediterranean Lentil Salad',
    calories: 410,
    protein: 15,
  },
];

// Components
interface StarRowProps {
  mealId: string;
  current: number | null;
  onRate: (id: string, val: number | null) => void;
}

function StarRow({ mealId, current, onRate }: StarRowProps) {
  return (
    <View className="flex-row gap-2 mt-3">
      {[1, 2, 3, 4, 5].map((n) => (
        <TouchableOpacity
          key={n}
          onPress={() => onRate(mealId, current === n ? null : n)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
        >
          <Text className={`text-2xl ${n <= (current || 0) ? 'text-primary' : 'text-muted-foreground/30'}`}>
            ★
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

interface MealCardProps {
  meal: Meal;
  rating: number | null;
  onRate: (id: string, val: number | null) => void;
}

function MealCard({ meal, rating, onRate }: MealCardProps) {
  const initials = meal.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('');

  return (
    <View className="bg-card rounded-xl overflow-hidden mb-4 border border-border">
      {meal.imageUrl ? (
        <Image source={{ uri: meal.imageUrl }} className="h-40 w-full bg-muted" resizeMode="cover" />
      ) : (
        <View className="h-40 w-full bg-muted items-center justify-center">
          <Text className="text-4xl font-bold text-muted-foreground/50">{initials}</Text>
        </View>
      )}
      <View className="p-4">
        <Text className="text-lg font-bold text-foreground mb-1">{meal.name}</Text>
        <Text className="text-sm text-muted-foreground mb-2">
          {meal.calories} kcal · Protein: {meal.protein}g
        </Text>
        <StarRow mealId={meal._id} current={rating} onRate={onRate} />
      </View>
    </View>
  );
}

export default function RateScreen() {
  const router = useRouter();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [ratings, setRatings] = useState<Ratings>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCandidates();
  }, []);

  async function fetchCandidates() {
    setLoading(true);
    setError('');
    // Mock API call
    setTimeout(() => {
      setMeals(MOCK_MEALS);
      setLoading(false);
    }, 1000);
  }

  function handleRate(mealId: string, value: number | null) {
    setRatings((prev) => {
      if (value === null) {
        const next = { ...prev };
        delete next[mealId];
        return next;
      }
      return { ...prev, [mealId]: value };
    });
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    // Mock submit
    setTimeout(() => {
      setGenerating(true);
      // Mock generate
      setTimeout(() => {
        setGenerating(false);
        router.replace('/plan'); 
      }, 2000);
    }, 1000);
  }

  function handleChangePrefs() {
    Alert.alert(
      'Change Preferences',
      'Going back will lose your current ratings. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, go back',
          onPress: () => router.replace('/preferences'),
        },
      ]
    );
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#0D9488" />
      </SafeAreaView>
    );
  }

  if (!loading && meals.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center p-6">
        <Text className="text-center text-muted-foreground mb-6">
          No meals match your preferences. Please go back and adjust them.
        </Text>
        <TouchableOpacity
          className="bg-primary rounded-xl py-3 px-6"
          onPress={() => router.replace('/preferences')}
          activeOpacity={0.8}
        >
          <Text className="text-primary-foreground font-semibold">Adjust Preferences</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const ratedCount = Object.keys(ratings).length;
  const allRated = ratedCount === meals.length && meals.length > 0;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      {/* Generating Overlay */}
      {generating && (
        <View className="absolute inset-0 bg-primary/90 z-50 items-center justify-center">
          <ActivityIndicator size="large" color="#ffffff" />
          <Text className="text-white text-lg font-medium mt-4">Building your personalised plan...</Text>
        </View>
      )}

      <FlatList
        data={meals}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 128 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View className="mb-6">
            <TouchableOpacity onPress={handleChangePrefs} activeOpacity={0.7}>
              <Text className="text-primary font-medium mb-2">← Change Preferences</Text>
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-foreground mb-2">Rate These Meals</Text>
            <Text className="text-muted-foreground mb-4">
              Give each a rating so we can personalise your plan
            </Text>
            <View className="bg-secondary self-start px-4 py-1.5 rounded-full">
              <Text className="text-secondary-foreground text-sm font-medium">
                {ratedCount} / {meals.length} rated
              </Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <MealCard meal={item} rating={ratings[item._id] || null} onRate={handleRate} />
        )}
        ListFooterComponent={
          <View className="mt-4">
            {error ? <Text className="text-destructive text-center mb-4">{error}</Text> : null}
            <TouchableOpacity
              className={`rounded-xl py-4 items-center justify-center ${
                allRated && !submitting ? 'bg-primary' : 'bg-muted'
              }`}
              onPress={handleSubmit}
              disabled={!allRated || submitting}
              activeOpacity={0.8}
            >
              {submitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className={`font-bold text-lg ${
                  allRated && !submitting ? 'text-primary-foreground' : 'text-muted-foreground'
                }`}>
                  Generate Plan
                </Text>
              )}
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}