import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EmailScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSendCode() {
    const trimmed = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(trimmed)) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    setError('');
    
    // Mock API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Code Sent', 
        `A one-time code has been sent to ${trimmed}`,
        [
          { text: 'OK', onPress: () => console.log('User acknowledged') }
        ]
      );
    }, 1500);
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="gap-2 mb-8">
            <Text className="text-3xl font-bold text-foreground">Enter your email</Text>
            <Text className="text-muted-foreground text-base leading-6">
              We'll send a one-time code to verify your account.
            </Text>
          </View>

          <View className="gap-4">
            <View>
              <TextInput
                className={`bg-input border rounded-xl p-4 text-foreground text-base ${
                  error ? 'border-destructive' : 'border-border'
                }`}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="Enter your email"
                placeholderTextColor="#64748B"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError('');
                }}
                onSubmitEditing={handleSendCode}
                returnKeyType="done"
              />
              {error ? <Text className="text-destructive mt-2 text-sm">{error}</Text> : null}
            </View>

            <TouchableOpacity
              className={`bg-primary rounded-xl p-4 items-center justify-center ${
                loading ? 'opacity-70' : ''
              }`}
              onPress={handleSendCode}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-primary-foreground font-semibold text-base">Send Code</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}