import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

// Constants
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
  { label: '🌶 Low', value: 'low' },
  { label: '🌶🌶 Medium', value: 'medium' },
  { label: '🌶🌶🌶 High', value: 'high' },
];

// Helper Functions
function toggleArrayItem(arr: string[], value: string) {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

// Components
interface ChipGroupProps {
  options: string[] | { label: string; value: string }[];
  selected: string[];
  onToggle: (val: string) => void;
  accentColor?: string;
}

function ChipGroup({ options, selected, onToggle, accentColor = '#EF4444' }: ChipGroupProps) {
  return (
    <View className="flex-row flex-wrap gap-2 mb-6">
      {options.map((opt) => {
        const val = typeof opt === 'string' ? opt : opt.value;
        const label = typeof opt === 'string' ? opt : opt.label;
        const isSelected = selected.includes(val);
        
        return (
          <TouchableOpacity
            key={val}
            className={`px-4 py-2 rounded-full border ${
              isSelected 
                ? 'bg-primary/10 border-primary' 
                : 'bg-card border-border'
            }`}
            onPress={() => onToggle(val)}
            activeOpacity={0.7}
          >
            <Text
              className={`text-sm font-medium ${
                isSelected ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

interface ToggleRowProps {
  label: string;
  value: boolean;
  onToggle: (val: boolean) => void;
}

function ToggleRow({ label, value, onToggle }: ToggleRowProps) {
  return (
    <View className="flex-row justify-between items-center py-2">
      <Text className="text-foreground text-base">{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#E2E8F0', true: '#0D9488' }}
        thumbColor={value ? '#FFFFFF' : '#FFFFFF'}
        activeThumbColor="#FFFFFF"
      />
    </View>
  );
}

export default function PreferencesScreen() {
  const router = useRouter();
  const [prefs, setPrefs] = useState({
    isKeto: false,
    isVegetarian: false,
    isVegan: false,
    allergies: [] as string[],
    cuisinePreferences: [] as string[],
    likedIngredients: [] as string[],
    dislikedIngredients: [] as string[],
    mealsPerDay: 3,
    spiceTolerance: 'medium',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function set(key: string, value: any) {
    setPrefs((prev) => ({ ...prev, [key]: value }));
  }

  function handleToggleVegan(value: boolean) {
    setPrefs((prev) => ({
      ...prev,
      isVegan: value,
      isVegetarian: value ? true : prev.isVegetarian,
    }));
  }

  function handleToggleLiked(val: string) {
    setPrefs((prev) => ({
      ...prev,
      likedIngredients: toggleArrayItem(prev.likedIngredients, val),
      dislikedIngredients: prev.dislikedIngredients.filter((v) => v !== val),
    }));
  }

  function handleToggleDisliked(val: string) {
    setPrefs((prev) => ({
      ...prev,
      dislikedIngredients: toggleArrayItem(prev.dislikedIngredients, val),
      likedIngredients: prev.likedIngredients.filter((v) => v !== val),
    }));
  }

  async function handleSubmit() {
    setLoading(true);
    setError('');
    
    // Mock API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success', 'Your preferences have been saved!', [
        {
          text: 'OK',
          onPress: () => router.replace('/plan'),
        },
      ]);
    }, 1500);
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView 
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 128 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground">Preferences</Text>
          <Text className="text-muted-foreground mt-1">Customize your meal plan</Text>
        </View>

        {error ? (
          <View className="bg-destructive/10 p-4 rounded-xl mb-6">
            <Text className="text-destructive text-sm">{error}</Text>
          </View>
        ) : null}

        {/* Diet Type */}
        <Text className="text-lg font-bold text-foreground mb-3">Diet Type</Text>
        <View className="bg-card rounded-xl p-4 mb-6 border border-border">
          <ToggleRow label="Keto" value={prefs.isKeto} onToggle={(v) => set('isKeto', v)} />
          <View className="h-px bg-border my-3" />
          <ToggleRow
            label="Vegetarian"
            value={prefs.isVegetarian}
            onToggle={(v) => set('isVegetarian', v)}
          />
          <View className="h-px bg-border my-3" />
          <ToggleRow label="Vegan" value={prefs.isVegan} onToggle={handleToggleVegan} />
        </View>

        {/* Allergies */}
        <Text className="text-lg font-bold text-foreground mb-3">Allergies</Text>
        <ChipGroup
          options={ALLERGY_OPTIONS}
          selected={prefs.allergies}
          onToggle={(val) => set('allergies', toggleArrayItem(prefs.allergies, val))}
        />

        {/* Cuisine */}
        <Text className="text-lg font-bold text-foreground mb-3">Favourite Cuisines</Text>
        <ChipGroup
          options={CUISINE_OPTIONS}
          selected={prefs.cuisinePreferences}
          onToggle={(val) => set('cuisinePreferences', toggleArrayItem(prefs.cuisinePreferences, val))}
        />

        {/* Liked ingredients */}
        <Text className="text-lg font-bold text-foreground mb-3">Ingredients You Love</Text>
        <ChipGroup
          options={INGREDIENT_OPTIONS}
          selected={prefs.likedIngredients}
          onToggle={handleToggleLiked}
        />

        {/* Disliked ingredients */}
        <Text className="text-lg font-bold text-foreground mb-3">Ingredients You Dislike</Text>
        <ChipGroup
          options={INGREDIENT_OPTIONS}
          selected={prefs.dislikedIngredients}
          onToggle={handleToggleDisliked}
        />

        {/* Meals per day */}
        <Text className="text-lg font-bold text-foreground mb-3">Meals Per Day</Text>
        <View className="flex-row gap-3 mb-6">
          {[2, 3, 4, 5].map((num) => (
            <TouchableOpacity
              key={num}
              onPress={() => set('mealsPerDay', num)}
              className={`flex-1 py-3 rounded-xl border items-center justify-center ${
                prefs.mealsPerDay === num
                  ? 'bg-primary border-primary'
                  : 'bg-card border-border'
              }`}
              activeOpacity={0.7}
            >
              <Text
                className={`font-semibold ${
                  prefs.mealsPerDay === num ? 'text-primary-foreground' : 'text-foreground'
                }`}
              >
                {num}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Spice Tolerance */}
        <Text className="text-lg font-bold text-foreground mb-3">Spice Tolerance</Text>
        <ChipGroup
          options={SPICE_OPTIONS}
          selected={[prefs.spiceTolerance]}
          onToggle={(val) => set('spiceTolerance', val)}
        />

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          className="bg-primary rounded-xl py-4 items-center justify-center mt-4"
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-primary-foreground font-bold text-lg">Save Preferences</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}