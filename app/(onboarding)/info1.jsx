import { ThemeToggle } from '@/components/ThemeToggle';
import { router } from 'expo-router';
import { Ruler, Scale, User } from 'lucide-react-native';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Info1Screen() {
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState('');
  const [errors, setErrors] = useState({});

  function clearError(field) {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate() {
    const newErrors = {};
    const ageNum = Number(age);
    const weightNum = Number(weight);
    const heightNum = Number(height);

    if (!age || isNaN(ageNum) || ageNum < 10 || ageNum > 120 || !Number.isInteger(ageNum)) {
      newErrors.age = 'Enter a valid age between 10 and 120.';
    }
    if (!weight || isNaN(weightNum) || weightNum < 20 || weightNum > 500) {
      newErrors.weight = 'Enter a valid weight between 20 and 500 kg.';
    }
    if (!height || isNaN(heightNum) || heightNum < 50 || heightNum > 300) {
      newErrors.height = 'Enter a valid height between 50 and 300 cm.';
    }
    if (!gender) {
      newErrors.gender = 'Please select your gender.';
    }
    return newErrors;
  }

  function handleNext() {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    router.push({
      pathname: '/(onboarding)/info2',
      params: {
        age: String(parseInt(age, 10)),
        weight: String(parseFloat(weight)),
        height: String(parseFloat(height)),
        gender,
      },
    });
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ padding: 24, paddingBottom: 128 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between mb-8">
            <View>
              <Text className="text-2xl font-bold text-foreground">Tell us about yourself</Text>
              <Text className="text-muted-foreground mt-1">
                We use this to calculate your personalized metrics.
              </Text>
            </View>
            <ThemeToggle />
          </View>

          {/* Age */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-foreground mb-2">Age</Text>
            <View className="relative">
              <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                <User size={20} color="#64748B" />
              </View>
              <TextInput
                className={`bg-input border border-border rounded-xl px-12 py-4 text-foreground text-base ${
                  errors.age ? 'border-destructive' : ''
                }`}
                keyboardType="number-pad"
                placeholder="e.g. 25"
                placeholderTextColor="rgba(100, 116, 139, 0.6)"
                value={age}
                onChangeText={(text) => {
                  setAge(text.replace(/[^0-9]/g, ''));
                  clearError('age');
                }}
                returnKeyType="next"
              />
            </View>
            {errors.age ? (
              <Text className="text-destructive text-sm mt-2">{errors.age}</Text>
            ) : null}
          </View>

          {/* Weight */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-foreground mb-2">Weight (kg)</Text>
            <View className="relative">
              <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                <Scale size={20} color="#64748B" />
              </View>
              <TextInput
                className={`bg-input border border-border rounded-xl px-12 py-4 text-foreground text-base ${
                  errors.weight ? 'border-destructive' : ''
                }`}
                keyboardType="decimal-pad"
                placeholder="e.g. 75"
                placeholderTextColor="rgba(100, 116, 139, 0.6)"
                value={weight}
                onChangeText={(text) => {
                  setWeight(text);
                  clearError('weight');
                }}
                returnKeyType="next"
              />
            </View>
            {errors.weight ? (
              <Text className="text-destructive text-sm mt-2">{errors.weight}</Text>
            ) : null}
          </View>

          {/* Height */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-foreground mb-2">Height (cm)</Text>
            <View className="relative">
              <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                <Ruler size={20} color="#64748B" />
              </View>
              <TextInput
                className={`bg-input border border-border rounded-xl px-12 py-4 text-foreground text-base ${
                  errors.height ? 'border-destructive' : ''
                }`}
                keyboardType="decimal-pad"
                placeholder="e.g. 175"
                placeholderTextColor="rgba(100, 116, 139, 0.6)"
                value={height}
                onChangeText={(text) => {
                  setHeight(text);
                  clearError('height');
                }}
                returnKeyType="done"
              />
            </View>
            {errors.height ? (
              <Text className="text-destructive text-sm mt-2">{errors.height}</Text>
            ) : null}
          </View>

          {/* Gender */}
          <View className="mb-8">
            <Text className="text-sm font-medium text-foreground mb-2">Gender</Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className={`flex-1 rounded-xl py-4 items-center border-2 ${
                  gender === 'male' ? 'border-primary bg-primary/10' : 'border-border bg-input'
                }`}
                onPress={() => {
                  setGender('male');
                  clearError('gender');
                }}
                activeOpacity={0.8}
              >
                <Text className={`font-semibold ${
                  gender === 'male' ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  Male
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 rounded-xl py-4 items-center border-2 ${
                  gender === 'female' ? 'border-primary bg-primary/10' : 'border-border bg-input'
                }`}
                onPress={() => {
                  setGender('female');
                  clearError('gender');
                }}
                activeOpacity={0.8}
              >
                <Text className={`font-semibold ${
                  gender === 'female' ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  Female
                </Text>
              </TouchableOpacity>
            </View>
            {errors.gender ? (
              <Text className="text-destructive text-sm mt-2">{errors.gender}</Text>
            ) : null}
          </View>

          {/* Next Button */}
          <TouchableOpacity
            className="bg-primary rounded-xl py-4 items-center"
            onPress={handleNext}
            activeOpacity={0.85}
          >
            <Text className="text-primary-foreground font-semibold text-base">Next</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
