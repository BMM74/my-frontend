import { router, useLocalSearchParams } from 'expo-router';
import { Activity, Check, Target } from 'lucide-react-native';
import { useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../lib/api';

const ACTIVITY_LEVELS = [
  { label: 'Sedentary', value: 'sedentary', desc: 'Little or no exercise', icon: Activity },
  { label: 'Lightly Active', value: 'lightly_active', desc: 'Light exercise 1–3 days/week', icon: Activity },
  { label: 'Moderately Active', value: 'moderately_active', desc: 'Moderate exercise 3–5 days/week', icon: Activity },
  { label: 'Very Active', value: 'very_active', desc: 'Hard exercise 6–7 days/week', icon: Activity },
  { label: 'Extra Active', value: 'extra_active', desc: 'Very hard exercise + physical job', icon: Activity },
];

const GOALS = [
  { label: 'Lose Weight', value: 'lose', icon: Target },
  { label: 'Maintain Weight', value: 'maintain', icon: Target },
  { label: 'Gain Weight', value: 'gain', icon: Target },
];

export default function Info2Screen() {
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
    try {
      await api.patch('/users/profile', {
        age: Number(params.age),
        weight: Number(params.weight),
        height: Number(params.height),
        gender: params.gender,
        activityLevel,
        goal,
      });
      router.replace('/(app)/home');
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join('\n') : (msg || 'Something went wrong. Please try again.'));
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
        {/* Header */}
        <View className="gap-2 pt-4">
          <Text className="text-3xl font-bold text-foreground">
            Your activity &amp; goal
          </Text>
          <Text className="text-base text-muted-foreground">
            Help us calculate the right targets for you.
          </Text>
        </View>

        {/* Activity Level */}
        <View className="gap-3">
          <Text className="text-lg font-bold text-foreground ml-1">Activity Level</Text>
          <View className="gap-3">
            {ACTIVITY_LEVELS.map((item) => {
              const isSelected = activityLevel === item.value;
              const Icon = item.icon;
              return (
                <TouchableOpacity
                  key={item.value}
                  className={`flex-row items-center justify-between p-5 rounded-2xl border-2 ${
                    isSelected ? 'bg-primary/10 border-primary' : 'bg-card border-border'
                  }`}
                  onPress={() => { setActivityLevel(item.value); setError(''); }}
                  activeOpacity={0.8}
                >
                  <View className="flex-row items-center gap-4 flex-1">
                    <View className={`p-2.5 rounded-xl ${isSelected ? 'bg-primary' : 'bg-muted'}`}>
                      <Icon
                        size={24}
                        color={isSelected ? '#ffffff' : '#64748B'}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className={`text-base font-semibold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                        {item.label}
                      </Text>
                      <Text className={`text-sm mt-0.5 ${isSelected ? 'text-primary/80' : 'text-muted-foreground'}`}>
                        {item.desc}
                      </Text>
                    </View>
                  </View>
                  {isSelected && (
                    <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
                      <Check size={16} color="#ffffff" strokeWidth={3} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Goal */}
        <View className="gap-3">
          <Text className="text-lg font-bold text-foreground ml-1">Your Goal</Text>
          <View className="gap-3">
            {GOALS.map((item) => {
              const isSelected = goal === item.value;
              const Icon = item.icon;
              return (
                <TouchableOpacity
                  key={item.value}
                  className={`flex-row items-center justify-between p-5 rounded-2xl border-2 ${
                    isSelected ? 'bg-primary/10 border-primary' : 'bg-card border-border'
                  }`}
                  onPress={() => { setGoal(item.value); setError(''); }}
                  activeOpacity={0.8}
                >
                  <View className="flex-row items-center gap-4 flex-1">
                    <View className={`p-2.5 rounded-xl ${isSelected ? 'bg-primary' : 'bg-muted'}`}>
                      <Icon size={24} color={isSelected ? '#ffffff' : '#64748B'} />
                    </View>
                    <View className="flex-1">
                      <Text className={`text-base font-semibold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                        {item.label}
                      </Text>
                    </View>
                  </View>
                  {isSelected && (
                    <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
                      <Check size={16} color="#ffffff" strokeWidth={3} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Error */}
        {error ? (
          <View className="bg-destructive/10 p-4 rounded-xl border border-destructive/20">
            <Text className="text-destructive text-center text-sm font-medium">{error}</Text>
          </View>
        ) : null}

        {/* Submit */}
        <TouchableOpacity
          className={`bg-primary rounded-2xl py-4 items-center justify-center ${loading ? 'opacity-70' : ''}`}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-primary-foreground text-lg font-bold">Complete Setup</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
