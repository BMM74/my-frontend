import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OtpScreen() {
 const { email, code } = useLocalSearchParams<{ email: string; code: string }>();
  const router = useRouter();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    // Auto-focus first input on mount
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  }, []);

  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  function handleOtpChange(text: string, index: number) {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setError('');

    
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyPress(e: any, index: number) {
    if (e.nativeEvent.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    }
  }

  async function handleVerify() {
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }

    setLoading(true);
    setError('');

    // Mock API call
    setTimeout(() => {
      setLoading(false);
      // Simulate success
      Alert.alert('Success', 'Email verified successfully!', [
        {
          text: 'OK',
          onPress: () => router.replace('/(tabs)/index'),
        },
      ]);
    }, 1500);
  }

  async function handleResend() {
    setResendLoading(true);
    setError('');

    // Mock API call
    setTimeout(() => {
      setResendLoading(false);
      setOtp(['', '', '', '', '', '']);
      setCountdown(60);
      setCanResend(false);
      inputRefs.current[0]?.focus();
      Alert.alert('Code Sent', 'A new code has been sent to your email.');
    }, 1000);
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View className="flex-1 justify-center px-6">
          {/* Header */}
          <View className="mb-8">
            <Text className="text-3xl font-bold text-foreground mb-2 text-center">
              Check your email
            </Text>
            <Text className="text-muted-foreground text-center text-base">
              We sent a code to{' '}
              <Text className="text-foreground font-semibold">
                {email || 'your email'}
              </Text>
            </Text>
          </View>

          {/* OTP Inputs */}
          <View className="flex-row justify-between mb-6">
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                className={`h-16 w-12 bg-card rounded-xl border-2 text-center text-2xl font-bold text-foreground ${
                  digit ? 'border-primary text-primary' : 'border-input'
                }`}
                value={digit}
                onChangeText={(text) => handleOtpChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                placeholderTextColor="transparent"
              />
            ))}
          </View>

          {/* Error Message */}
          {error ? (
            <Text className="text-destructive text-center mb-6 text-sm">{error}</Text>
          ) : null}

          {/* Verify Button */}
          <TouchableOpacity
            className={`bg-primary rounded-xl p-4 items-center justify-center ${
              loading ? 'opacity-70' : ''
            }`}
            onPress={handleVerify}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-primary-foreground font-semibold text-base">Verify</Text>
            )}
          </TouchableOpacity>

          {/* Resend Section */}
          <View className="mt-6 items-center">
            {canResend ? (
              <TouchableOpacity
                onPress={handleResend}
                disabled={resendLoading}
                activeOpacity={0.7}
              >
                {resendLoading ? (
                  <ActivityIndicator color="#0D9488" size="small" />
                ) : (
                  <Text className="text-primary font-semibold text-base">Resend Code</Text>
                )}
              </TouchableOpacity>
            ) : (
              <Text className="text-muted-foreground text-sm">
                Resend code in{' '}
                <Text className="text-foreground font-semibold">{countdown}s</Text>
              </Text>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}