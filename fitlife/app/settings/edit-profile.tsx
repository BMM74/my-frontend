import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Save, Check } from 'lucide-react-native';

const ACTIVITY_LEVELS = [
  { key: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
  { key: 'lightly_active', label: 'Lightly Active', desc: 'Light exercise 1–3 days/week' },
  { key: 'moderately_active', label: 'Moderately Active', desc: 'Moderate exercise 3–5 days/week' },
  { key: 'very_active', label: 'Very Active', desc: 'Hard exercise 6–7 days/week' },
  { key: 'extra_active', label: 'Extra Active', desc: 'Very hard exercise + physical job' },
];

const GOALS = [
  { key: 'lose', label: 'Lose Weight' },
  { key: 'maintain', label: 'Maintain Weight' },
  { key: 'gain', label: 'Gain Weight' },
];

const GENDERS = [
  { key: 'male', label: 'Male' },
  { key: 'female', label: 'Female' },
];

export default function EditProfileScreen() {
  const router = useRouter();
  
  // State
  const [original, setOriginal] = useState(null);
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState('male');
  const [activityLevel, setActivityLevel] = useState('moderately_active');
  const [goal, setGoal] = useState('maintain');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Mock loading user data
  useEffect(() => {
    const timer = setTimeout(() => {
      const mockUser = {
        age: 28,
        weight: 75,
        height: 180,
        gender: 'male',
        activityLevel: 'moderately_active',
        goal: 'maintain',
      };
      setOriginal(mockUser);
      setAge(String(mockUser.age));
      setWeight(String(mockUser.weight));
      setHeight(String(mockUser.height));
      setGender(mockUser.gender);
      setActivityLevel(mockUser.activityLevel);
      setGoal(mockUser.goal);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Age stepper logic
  function stepAge(delta) {
    const current = parseInt(age) || 0;
    const newVal = Math.max(10, Math.min(120, current + delta));
    setAge(String(newVal));
  }

  // Mock save function
  async function handleSave() {
    setSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setSubmitting(false);
      Alert.alert('Success', 'Your profile has been updated.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }, 1000);
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#0D9488" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-border">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <ChevronLeft size={24} className="text-foreground" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-foreground">Edit Profile</Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={submitting}
            className="p-2 -mr-2 opacity-80"
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#0D9488" />
            ) : (
              <Save size={24} className="text-primary" />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ padding: 24, gap: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Age Section */}
          <View>
            <Text className="text-sm font-medium text-muted-foreground mb-3">Age</Text>
            <View className="flex-row items-center justify-between bg-card p-4 rounded-2xl border border-border">
              <TouchableOpacity 
                onPress={() => stepAge(-1)}
                className="w-10 h-10 rounded-full bg-secondary items-center justify-center"
              >
                <Text className="text-xl font-bold text-foreground">−</Text>
              </TouchableOpacity>
              
              <TextInput
                className="text-2xl font-bold text-foreground w-16 text-center"
                value={age}
                onChangeText={(v) => setAge(v.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                maxLength={3}
                selectTextOnFocus
              />
              
              <TouchableOpacity 
                onPress={() => stepAge(1)}
                className="w-10 h-10 rounded-full bg-secondary items-center justify-center"
              >
                <Text className="text-xl font-bold text-foreground">+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Weight Section */}
          <View>
            <Text className="text-sm font-medium text-muted-foreground mb-3">Weight (kg)</Text>
            <View className="bg-card p-4 rounded-2xl border border-border">
              <TextInput
                className="text-lg text-foreground"
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
                placeholder="e.g. 72.5"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          {/* Height Section */}
          <View>
            <Text className="text-sm font-medium text-muted-foreground mb-3">Height (cm)</Text>
            <View className="bg-card p-4 rounded-2xl border border-border">
              <TextInput
                className="text-lg text-foreground"
                value={height}
                onChangeText={setHeight}
                keyboardType="number-pad"
                placeholder="e.g. 175"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          {/* Gender Section */}
          <View>
            <Text className="text-sm font-medium text-muted-foreground mb-3">Gender</Text>
            <View className="flex-row bg-card p-1.5 rounded-2xl border border-border">
              {GENDERS.map((g) => (
                <TouchableOpacity
                  key={g.key}
                  onPress={() => setGender(g.key)}
                  className={`flex-1 py-3 rounded-xl items-center justify-center ${
                    gender === g.key ? 'bg-primary shadow-sm' : 'bg-transparent'
                  }`}
                >
                  <Text className={`font-medium ${
                    gender === g.key ? 'text-primary-foreground' : 'text-foreground'
                  }`}>
                    {g.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Activity Level Section */}
          <View>
            <Text className="text-sm font-medium text-muted-foreground mb-3">Activity Level</Text>
            <View className="bg-card rounded-2xl border border-border overflow-hidden">
              {ACTIVITY_LEVELS.map((al, index) => (
                <TouchableOpacity
                  key={al.key}
                  onPress={() => setActivityLevel(al.key)}
                  className={`flex-row items-center p-4 ${
                    index !== ACTIVITY_LEVELS.length - 1 ? 'border-b border-border' : ''
                  } ${activityLevel === al.key ? 'bg-secondary/50' : ''}`}
                >
                  <View className={`w-5 h-5 rounded-full border-2 items-center justify-center mr-3 ${
                    activityLevel === al.key ? 'border-primary' : 'border-muted-foreground'
                  }`}>
                    {activityLevel === al.key && (
                      <View className="w-2.5 h-2.5 rounded-full bg-primary" />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className={`font-medium ${
                      activityLevel === al.key ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {al.label}
                    </Text>
                    <Text className="text-xs text-muted-foreground mt-0.5">
                      {al.desc}
                    </Text>
                  </View>
                  {activityLevel === al.key && (
                    <Check size={18} className="text-primary" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Goal Section */}
          <View>
            <Text className="text-sm font-medium text-muted-foreground mb-3">Goal</Text>
            <View className="bg-card rounded-2xl border border-border overflow-hidden">
              {GOALS.map((g, index) => (
                <TouchableOpacity
                  key={g.key}
                  onPress={() => setGoal(g.key)}
                  className={`flex-row items-center justify-between p-4 ${
                    index !== GOALS.length - 1 ? 'border-b border-border' : ''
                  } ${goal === g.key ? 'bg-secondary/50' : ''}`}
                >
                  <Text className={`font-medium ${
                    goal === g.key ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {g.label}
                  </Text>
                  {goal === g.key && (
                    <Check size={18} className="text-primary" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}