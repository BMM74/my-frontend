import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../../lib/api';

const ALLERGY_OPTIONS = ['nuts', 'dairy', 'gluten', 'eggs', 'shellfish', 'soy'];

const CUISINE_OPTIONS = [
  { label: 'Arabic', value: 'arabic' },
  { label: 'Mediterranean', value: 'mediterranean' },
  { label: 'Asian', value: 'asian' },
  { label: 'Western', value: 'western' },
];

const INGREDIENT_OPTIONS = [
  { label: 'Chicken', value: 'chicken' },
  { label: 'Beef', value: 'beef' },
  { label: 'Salmon', value: 'salmon' },
  { label: 'Eggs', value: 'eggs' },
  { label: 'Rice', value: 'rice' },
  { label: 'Pasta', value: 'pasta' },
  { label: 'Legumes', value: 'legumes' },
  { label: 'Lamb', value: 'lamb' },
  { label: 'Tuna', value: 'tuna' },
];

const SPICE_OPTIONS = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
];

function toggleArrayItem(arr, value) {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

function ChipGroup({ options, selected, onToggle }) {
  return (
    <View className="flex-row flex-wrap gap-2 mb-6">
      {options.map((opt) => {
        const val = typeof opt === 'string' ? opt : opt.value;
        const label = typeof opt === 'string' ? opt : opt.label;
        const isSelected = selected.includes(val);
        return (
          <TouchableOpacity
            key={val}
            className={`px-4 py-2 rounded-full border ${isSelected ? 'bg-primary/10 border-primary' : 'bg-card border-border'}`}
            onPress={() => onToggle(val)}
            activeOpacity={0.7}
          >
            <Text className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function ToggleRow({ label, value, onToggle }) {
  return (
    <View className="flex-row justify-between items-center py-2">
      <Text className="text-foreground font-medium">{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#E2E8F0', true: '#0D9488' }}
        thumbColor="#ffffff"
      />
    </View>
  );
}

export default function PreferencesScreen() {
  const [prefs, setPrefs] = useState({
    isKeto: false,
    isVegetarian: false,
    isVegan: false,
    allergies: [],
    cuisinePreferences: [],
    likedIngredients: [],
    dislikedIngredients: [],
    mealsPerDay: 3,
    spiceTolerance: 'medium',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function set(key, value) {
    setPrefs((prev) => ({ ...prev, [key]: value }));
  }

  function handleToggleVegan(value) {
    setPrefs((prev) => ({
      ...prev,
      isVegan: value,
      isVegetarian: value ? true : prev.isVegetarian,
    }));
  }

  function handleToggleLiked(val) {
    setPrefs((prev) => ({
      ...prev,
      likedIngredients: toggleArrayItem(prev.likedIngredients, val),
      dislikedIngredients: prev.dislikedIngredients.filter((v) => v !== val),
    }));
  }

  function handleToggleDisliked(val) {
    setPrefs((prev) => ({
      ...prev,
      dislikedIngredients: toggleArrayItem(prev.dislikedIngredients, val),
      likedIngredients: prev.likedIngredients.filter((v) => v !== val),
    }));
  }

  async function handleSubmit() {
    setLoading(true);
    setError('');
    try {
      await api.patch('/users/meal-preferences', {
        ...prefs,
        mealsPerDay: Number(prefs.mealsPerDay),
      });
      router.replace('/meals/rate');
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join('\n') : (msg || 'Something went wrong. Please try again.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 mr-2">
          <ChevronLeft size={24} color="#64748B" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-foreground">Food Preferences</Text>
      </View>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Diet Type */}
        <Text className="text-sm font-bold text-muted-foreground uppercase tracking-wide mt-6 mb-3">Diet Type</Text>
        <View className="bg-card rounded-xl p-4 mb-6 border border-border gap-2">
          <ToggleRow label="Keto" value={prefs.isKeto} onToggle={(v) => set('isKeto', v)} />
          <View className="h-px bg-border" />
          <ToggleRow label="Vegetarian" value={prefs.isVegetarian} onToggle={(v) => set('isVegetarian', v)} />
          <View className="h-px bg-border" />
          <ToggleRow label="Vegan" value={prefs.isVegan} onToggle={handleToggleVegan} />
        </View>

        {/* Allergies */}
        <Text className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-3">Allergies</Text>
        <ChipGroup
          options={ALLERGY_OPTIONS}
          selected={prefs.allergies}
          onToggle={(val) => set('allergies', toggleArrayItem(prefs.allergies, val))}
        />

        {/* Cuisine */}
        <Text className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-3">Favourite Cuisines</Text>
        <ChipGroup
          options={CUISINE_OPTIONS}
          selected={prefs.cuisinePreferences}
          onToggle={(val) => set('cuisinePreferences', toggleArrayItem(prefs.cuisinePreferences, val))}
        />

        {/* Liked Ingredients */}
        <Text className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-3">Ingredients You Love</Text>
        <ChipGroup
          options={INGREDIENT_OPTIONS}
          selected={prefs.likedIngredients}
          onToggle={handleToggleLiked}
        />

        {/* Disliked Ingredients */}
        <Text className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-3">Ingredients You Dislike</Text>
        <ChipGroup
          options={INGREDIENT_OPTIONS}
          selected={prefs.dislikedIngredients}
          onToggle={handleToggleDisliked}
        />

        {/* Meals per day */}
        <Text className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-3">Meals Per Day</Text>
        <View className="flex-row gap-3 mb-6">
          {[2, 3].map((n) => (
            <TouchableOpacity
              key={n}
              className={`flex-1 py-3 rounded-xl border ${prefs.mealsPerDay === n ? 'bg-primary border-primary' : 'bg-card border-border'}`}
              onPress={() => set('mealsPerDay', n)}
              activeOpacity={0.8}
            >
              <Text className={`text-center font-semibold ${prefs.mealsPerDay === n ? 'text-primary-foreground' : 'text-foreground'}`}>
                {n} Meals
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Spice Tolerance */}
        <Text className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-3">Spice Tolerance</Text>
        <View className="flex-row gap-3 mb-6">
          {SPICE_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              className={`flex-1 py-3 rounded-xl border ${prefs.spiceTolerance === opt.value ? 'bg-primary border-primary' : 'bg-card border-border'}`}
              onPress={() => set('spiceTolerance', opt.value)}
              activeOpacity={0.8}
            >
              <Text className={`text-center font-semibold ${prefs.spiceTolerance === opt.value ? 'text-primary-foreground' : 'text-foreground'}`}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {error ? <Text className="text-destructive text-center mb-4">{error}</Text> : null}

        <TouchableOpacity
          className={`bg-primary rounded-2xl py-4 items-center justify-center ${loading ? 'opacity-70' : ''}`}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-primary-foreground font-bold text-lg">Save &amp; Continue</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

