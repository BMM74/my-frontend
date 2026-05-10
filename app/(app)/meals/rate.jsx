import { router } from 'expo-router';
import { useEffect, useState } from 'react';
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
import api from '../../../lib/api';

function StarRow({ mealId, current, onRate }) {
  return (
    <View className="flex-row gap-1 mt-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <TouchableOpacity
          key={n}
          onPress={() => onRate(mealId, current === n ? null : n)}
          hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
        >
          <Text className={`text-2xl ${n <= (current || 0) ? 'text-primary' : 'text-muted-foreground/30'}`}>
            {n <= (current || 0) ? '★' : '☆'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function MealCard({ meal, rating, onRate }) {
  const [imageError, setImageError] = useState(false);
  const initials = meal.name.split(' ').slice(0, 2).map((w) => w[0]).join('');
  console.log(`[Meal] ${meal.name} - imageUrl:`, meal.imageUrl);

  return (
    <View className="bg-card rounded-xl overflow-hidden mb-4 border border-border">
      {meal.imageUrl && !imageError ? (
        <Image 
          source={{ uri: meal.imageUrl }} 
          style={{ width: '100%', height: 120 }} 
          resizeMode="cover"
          onError={(err) => {
            console.error(`[Image Error] Failed to load: ${meal.imageUrl}`, err);
            setImageError(true);
          }}
        />
      ) : (
        <View className="w-full h-28 bg-muted items-center justify-center">
          <Text className="text-3xl font-bold text-muted-foreground">{initials}</Text>
        </View>
      )}
      <View className="p-4">
        <Text className="text-foreground font-semibold text-base">{meal.name}</Text>
        <Text className="text-muted-foreground text-sm mt-1">
          {meal.calories} kcal · Protein: {meal.protein}g
        </Text>
        <StarRow mealId={meal._id} current={rating} onRate={onRate} />
      </View>
    </View>
  );
}

export default function RateScreen() {
  const [meals, setMeals] = useState([]);
  const [ratings, setRatings] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchCandidates(); }, []);

  async function fetchCandidates() {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/meal-plan/candidates');
      setMeals(res.data);
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join('\n') : (msg || 'Failed to load meals.'));
    } finally {
      setLoading(false);
    }
  }

  function handleRate(mealId, value) {
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
    try {
      await api.post('/ratings/batch', {
        ratings: Object.entries(ratings).map(([mealId, rating]) => ({ mealId, rating })),
      });
      setGenerating(true);
      try {
        await api.post('/meal-plan/generate');
        router.replace('/meals/plan');
      } catch (genErr) {
        setGenerating(false);
        const msg = genErr.response?.data?.message;
        setError(Array.isArray(msg) ? msg.join('\n') : (msg || 'Could not build a plan.'));
      }
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join('\n') : (msg || 'Failed to submit ratings.'));
    } finally {
      setSubmitting(false);
    }
  }

  function handleChangePrefs() {
    Alert.alert(
      'Change Preferences',
      'Going back will lose your current ratings. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes, go back', onPress: () => router.replace('/meals/preferences') },
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
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-8">
        <Text className="text-muted-foreground text-center mb-6">
          No meals match your preferences. Please go back and adjust them.
        </Text>
        <TouchableOpacity
          className="bg-primary rounded-2xl py-4 px-8 items-center"
          onPress={() => router.replace('/meals/preferences')}
          activeOpacity={0.85}
        >
          <Text className="text-primary-foreground font-semibold">Adjust Preferences</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const ratedCount = Object.keys(ratings).length;
  const allRated = ratedCount === meals.length && meals.length > 0;

  return (
    <SafeAreaView className="flex-1 bg-background">
      {generating && (
        <View className="absolute inset-0 bg-primary/90 z-50 items-center justify-center gap-4">
          <ActivityIndicator size="large" color="#ffffff" />
          <Text className="text-primary-foreground text-base font-semibold">Building your personalised plan...</Text>
        </View>
      )}

      <FlatList
        data={meals}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View className="pt-4 mb-4">
            <TouchableOpacity onPress={handleChangePrefs} className="mb-3">
              <Text className="text-primary font-medium">← Change Preferences</Text>
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-foreground mb-1">Rate These Meals</Text>
            <Text className="text-muted-foreground mb-3">
              Give each a rating so we can personalise your plan
            </Text>
            <View className="bg-secondary self-start px-4 py-1.5 rounded-full">
              <Text className="text-secondary-foreground text-sm font-semibold">
                {ratedCount} / {meals.length} rated
              </Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <MealCard meal={item} rating={ratings[item._id] || null} onRate={handleRate} />
        )}
        ListFooterComponent={
          <View className="mt-2 gap-3">
            {error ? <Text className="text-destructive text-center">{error}</Text> : null}
            <TouchableOpacity
              className={`bg-primary rounded-2xl py-4 items-center justify-center ${(!allRated || submitting) ? 'opacity-50' : ''}`}
              onPress={handleSubmit}
              disabled={!allRated || submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-primary-foreground font-bold text-lg">Generate My Plan</Text>
              )}
            </TouchableOpacity>
            {!allRated && (
              <Text className="text-muted-foreground text-center text-sm">
                Rate all {meals.length} meals to continue
              </Text>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}
