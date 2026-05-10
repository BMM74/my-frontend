import { router } from 'expo-router';
import { Check, ChevronLeft, Save } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../../lib/api';

const ACTIVITY_LEVELS = [
  { key: 'sedentary',         label: 'Sedentary',          desc: 'Little or no exercise' },
  { key: 'lightly_active',    label: 'Lightly Active',     desc: '1–3 days/week' },
  { key: 'moderately_active', label: 'Moderately Active',  desc: '3–5 days/week' },
  { key: 'very_active',       label: 'Very Active',        desc: '6–7 days/week' },
  { key: 'extra_active',      label: 'Extra Active',       desc: 'Very hard exercise daily' },
];

const GOALS = [
  { key: 'lose',     label: 'Lose Weight' },
  { key: 'maintain', label: 'Maintain' },
  { key: 'gain',     label: 'Gain' },
];

const GENDERS = [
  { key: 'male',   label: 'Male' },
  { key: 'female', label: 'Female' },
];

export default function EditProfile() {
  const [original, setOriginal] = useState(null);
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState('male');
  const [activityLevel, setActivityLevel] = useState('moderately_active');
  const [goal, setGoal] = useState('maintain');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/users/me');
        const u = res.data.user;
        setOriginal(u);
        setAge(String(u.age ?? ''));
        setWeight(String(u.weight ?? ''));
        setHeight(String(u.height ?? ''));
        setGender(u.gender ?? 'male');
        setActivityLevel(u.activityLevel ?? 'moderately_active');
        setGoal(u.goal ?? 'maintain');
      } catch (_) {}
      finally { setLoading(false); }
    }
    load();
  }, []);

  function stepAge(delta) {
    const n = Math.max(10, Math.min(120, (parseInt(age) || 10) + delta));
    setAge(String(n));
  }

  async function handleSave() {
    if (!original) return;
    const patch = {};
    if (parseInt(age) !== original.age)           patch.age = parseInt(age);
    if (weight !== String(original.weight))       patch.weight = parseFloat(weight);
    if (height !== String(original.height))       patch.height = parseFloat(height);
    if (gender !== original.gender)               patch.gender = gender;
    if (activityLevel !== original.activityLevel) patch.activityLevel = activityLevel;
    if (goal !== original.goal)                   patch.goal = goal;

    if (Object.keys(patch).length === 0) { router.back(); return; }

    setSubmitting(true);
    try {
      await api.patch('/users/profile', patch);
      router.back();
    } catch (err) {
      const msg = err.response?.data?.message;
      Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : (msg || 'Could not save changes.'));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#0D9488" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-secondary items-center justify-center">
          <ChevronLeft size={20} color="#0D9488" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-foreground">Edit Profile</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={submitting}
          className={`w-10 h-10 rounded-full bg-primary items-center justify-center ${submitting ? 'opacity-60' : ''}`}
        >
          {submitting ? <ActivityIndicator size="small" color="#ffffff" /> : <Save size={18} color="#ffffff" />}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 48 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Age */}
          <Text className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 mt-4">Age</Text>
          <View className="flex-row items-center justify-between bg-card p-4 rounded-2xl border border-border gap-3">
            <TouchableOpacity onPress={() => stepAge(-1)} className="w-10 h-10 rounded-full bg-secondary items-center justify-center">
              <Text className="text-foreground font-bold text-xl">−</Text>
            </TouchableOpacity>
            <TextInput
              className="flex-1 text-center text-xl font-bold text-foreground"
              value={age}
              onChangeText={(v) => setAge(v.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              maxLength={3}
              selectTextOnFocus
            />
            <TouchableOpacity onPress={() => stepAge(1)} className="w-10 h-10 rounded-full bg-secondary items-center justify-center">
              <Text className="text-foreground font-bold text-xl">+</Text>
            </TouchableOpacity>
          </View>

          {/* Weight */}
          <Text className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 mt-5">Weight (kg)</Text>
          <View className="bg-card p-4 rounded-2xl border border-border">
            <TextInput
              className="text-foreground text-base"
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              placeholder="e.g. 72.5"
              placeholderTextColor="#94A3B8"
            />
          </View>

          {/* Height */}
          <Text className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 mt-5">Height (cm)</Text>
          <View className="bg-card p-4 rounded-2xl border border-border">
            <TextInput
              className="text-foreground text-base"
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
              placeholder="e.g. 175"
              placeholderTextColor="#94A3B8"
            />
          </View>

          {/* Gender */}
          <Text className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 mt-5">Gender</Text>
          <View className="flex-row bg-card p-1.5 rounded-2xl border border-border gap-1">
            {GENDERS.map((g) => (
              <TouchableOpacity
                key={g.key}
                onPress={() => setGender(g.key)}
                className={`flex-1 py-2.5 rounded-xl items-center ${gender === g.key ? 'bg-primary' : ''}`}
                activeOpacity={0.8}
              >
                <Text className={`font-semibold text-sm ${gender === g.key ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                  {g.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Activity Level */}
          <Text className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 mt-5">Activity Level</Text>
          <View className="bg-card rounded-2xl border border-border overflow-hidden">
            {ACTIVITY_LEVELS.map((al, i) => (
              <TouchableOpacity
                key={al.key}
                onPress={() => setActivityLevel(al.key)}
                className={`flex-row items-center px-4 py-3.5 gap-3 ${i < ACTIVITY_LEVELS.length - 1 ? 'border-b border-border' : ''} ${activityLevel === al.key ? 'bg-primary/10' : ''}`}
                activeOpacity={0.8}
              >
                <View className="flex-1">
                  <Text className={`font-semibold text-sm ${activityLevel === al.key ? 'text-primary' : 'text-foreground'}`}>{al.label}</Text>
                  <Text className="text-muted-foreground text-xs mt-0.5">{al.desc}</Text>
                </View>
                {activityLevel === al.key && <Check size={18} color="#0D9488" />}
              </TouchableOpacity>
            ))}
          </View>

          {/* Goal */}
          <Text className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 mt-5">Goal</Text>
          <View className="bg-card rounded-2xl border border-border overflow-hidden">
            {GOALS.map((g, i) => (
              <TouchableOpacity
                key={g.key}
                onPress={() => setGoal(g.key)}
                className={`flex-row items-center px-4 py-3.5 gap-3 ${i < GOALS.length - 1 ? 'border-b border-border' : ''} ${goal === g.key ? 'bg-primary/10' : ''}`}
                activeOpacity={0.8}
              >
                <Text className={`flex-1 font-semibold text-sm ${goal === g.key ? 'text-primary' : 'text-foreground'}`}>{g.label}</Text>
                {goal === g.key && <Check size={18} color="#0D9488" />}
              </TouchableOpacity>
            ))}
          </View>

          {/* Save Button */}
          <TouchableOpacity
            className={`mt-8 bg-primary rounded-2xl py-4 items-center justify-center flex-row gap-2 ${submitting ? 'opacity-60' : ''}`}
            onPress={handleSave}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Save size={18} color="#ffffff" />
                <Text className="text-primary-foreground font-bold text-lg">Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

