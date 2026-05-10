import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Activity, Target, Check } from 'lucide-react-native';

const ACTIVITY_LEVELS = [
  {
    label: 'Sedentary',
    value: 'sedentary',
    desc: 'Little or no exercise',
    icon: Activity,
  },
  {
    label: 'Lightly Active',
    value: 'lightly_active',
    desc: 'Light exercise 1–3 days/week',
    icon: Activity,
  },
  {
    label: 'Moderately Active',
    value: 'moderately_active',
    desc: 'Moderate exercise 3–5 days/week',
    icon: Activity,
  },
  {
    label: 'Very Active',
    value: 'very_active',
    desc: 'Hard exercise 6–7 days/week',
    icon: Activity,
  },
  {
    label: 'Extra Active',
    value: 'extra_active',
    desc: 'Very hard exercise + physical job',
    icon: Activity,
  },
];

const GOALS = [
  { label: 'Lose Weight', value: 'lose', icon: Target },
  { label: 'Maintain Weight', value: 'maintain', icon: Target },
  { label: 'Gain Weight', value: 'gain', icon: Target },
];

export default function Onboarding2Screen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [activityLevel, setActivityLevel] = useState('');
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!activityLevel) {
      setError('Please select your activity level.');
      return;
    }
    if (!goal) {
      setError('Please select your goal.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    // MOCK API CALL
    // In a real app, this would be: await api.patch('/users/profile', { ... })
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      
      // Collect all data for the next screen or storage
      const profileData = {
        age: params.age,
        weight: params.weight,
        height: params.height,
        gender: params.gender,
        activityLevel,
        goal,
      };
      
      console.log('Profile saved:', profileData);
      
      // Navigate to the main app (tabs)
      router.replace('/(tabs)');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 128, gap: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View className="gap-2 pt-4">
          <Text className="text-3xl font-bold text-foreground">
            Your activity & goal
          </Text>
          <Text className="text-base text-muted-foreground">
            Help us calculate the right targets for you.
          </Text>
        </View>

        {/* Activity Level Section */}
        <View className="gap-3">
          <Text className="text-lg font-bold text-foreground ml-1">
            Activity Level
          </Text>
          <View className="gap-3">
            {ACTIVITY_LEVELS.map((item) => {
              const isSelected = activityLevel === item.value;
              const Icon = item.icon;
              return (
                <TouchableOpacity
                  key={item.value}
                  className={`flex-row items-center justify-between p-5 rounded-2xl border-2 ${
                    isSelected
                      ? 'bg-primary/10 border-primary'
                      : 'bg-card border-border'
                  }`}
                  onPress={() => {
                    setActivityLevel(item.value);
                    setError('');
                  }}
                  activeOpacity={0.8}
                >
                  <View className="flex-row items-center gap-4 flex-1">
                    <View
                      className={`p-2.5 rounded-xl ${
                        isSelected ? 'bg-primary' : 'bg-muted'
                      }`}
                    >
                      <Icon
                        size={24}
                        className={isSelected ? 'text-primary-foreground' : 'text-muted-foreground'}
                      />
                    </View>
                    <View className="flex-1">
                      <Text
                        className={`text-base font-semibold ${
                          isSelected ? 'text-primary' : 'text-foreground'
                        }`}
                      >
                        {item.label}
                      </Text>
                      <Text
                        className={`text-sm mt-0.5 ${
                          isSelected ? 'text-primary/80' : 'text-muted-foreground'
                        }`}
                      >
                        {item.desc}
                      </Text>
                    </View>
                  </View>
                  {isSelected && (
                    <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
                      <Check size={16} className="text-primary-foreground" strokeWidth={3} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Goal Section */}
        <View className="gap-3">
          <Text className="text-lg font-bold text-foreground ml-1">
            Your Goal
          </Text>
          <View className="gap-3">
            {GOALS.map((item) => {
              const isSelected = goal === item.value;
              const Icon = item.icon;
              return (
                <TouchableOpacity
                  key={item.value}
                  className={`flex-row items-center justify-between p-5 rounded-2xl border-2 ${
                    isSelected
                      ? 'bg-primary/10 border-primary'
                      : 'bg-card border-border'
                  }`}
                  onPress={() => {
                    setGoal(item.value);
                    setError('');
                  }}
                  activeOpacity={0.8}
                >
                  <View className="flex-row items-center gap-4 flex-1">
                    <View
                      className={`p-2.5 rounded-xl ${
                        isSelected ? 'bg-primary' : 'bg-muted'
                      }`}
                    >
                      <Icon
                        size={24}
                        className={isSelected ? 'text-primary-foreground' : 'text-muted-foreground'}
                      />
                    </View>
                    <View className="flex-1">
                      <Text
                        className={`text-base font-semibold ${
                          isSelected ? 'text-primary' : 'text-foreground'
                        }`}
                      >
                        {item.label}
                      </Text>
                    </View>
                  </View>
                  {isSelected && (
                    <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
                      <Check size={16} className="text-primary-foreground" strokeWidth={3} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Error Message */}
        {error ? (
          <View className="bg-destructive/10 p-4 rounded-xl border border-destructive/20">
            <Text className="text-destructive text-center text-sm font-medium">
              {error}
            </Text>
          </View>
        ) : null}

        {/* Submit Button */}
        <TouchableOpacity
          className={`rounded-2xl py-4 items-center justify-center shadow-lg ${
            loading ? 'bg-muted opacity-70' : 'bg-primary shadow-primary/20'
          }`}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-primary-foreground text-lg font-bold">
              Complete Setup
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}