import { Stack } from 'expo-router';

export default function MealsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="preferences" />
      <Stack.Screen name="rate" />
      <Stack.Screen name="plan" />
    </Stack>
  );
}
