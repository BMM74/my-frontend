import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../lib/api';
import { saveToken } from '../../lib/auth';

export default function OtpScreen() {
  const { email } = useLocalSearchParams();

  //const [otp, setOtp] = useState('');
  const [otp, setOtp] = useState(code || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const hiddenInputRef = useRef(null);

  useEffect(() => {
    setTimeout(() => hiddenInputRef.current?.focus(), 100);
  }, []);

  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  function handleOtpChange(text) {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 6);
    setOtp(cleaned);
    setError('');
  }

  async function handleVerify() {
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/verify-otp', { email, code: otp });
      await saveToken(res.data.token);
      if (res.data.isProfileComplete) {
        router.replace('/(app)/home');
      } else {
        router.replace('/(onboarding)/info1');
      }
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join('\n') : (msg || 'Invalid code. Please try again.'));
      setOtp('');
      hiddenInputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResendLoading(true);
    setError('');
    try {
      /*await api.post('/auth/send-otp', { email });
      setOtp('');*/
      const response = await api.post('/auth/send-otp', { email });
setOtp(response.data.code);
      setCountdown(60);
      setCanResend(false);
      hiddenInputRef.current?.focus();
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join('\n') : (msg || 'Failed to resend code.'));
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior="padding"
    >
      <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="mb-8">
            <Text className="text-3xl font-bold text-foreground mb-2 text-center">
              Check your email
            </Text>
            <Text className="text-muted-foreground text-center text-base">
              We sent a code to{' '}
              <Text className="text-foreground font-semibold">{email}</Text>
            </Text>
          </View>

          {/* OTP Boxes (visual only) + hidden input covering the same area */}
          <View className="flex-row justify-between mb-6">
            {Array.from({ length: 6 }).map((_, index) => {
              const digit = otp[index] ?? '';
              const isActive = focused && index === otp.length;
              const filled = !!digit;
              return (
                <View
                  key={index}
                  className={`h-16 w-12 bg-card rounded-xl border-2 items-center justify-center ${
                    filled || isActive ? 'border-primary' : 'border-input'
                  }`}
                >
                  <Text className="text-2xl font-bold text-foreground">{digit}</Text>
                </View>
              );
            })}

            {/* Hidden input covers the full OTP row so any tap opens the keyboard */}
            <TextInput
              ref={hiddenInputRef}
              value={otp}
              onChangeText={handleOtpChange}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              keyboardType="number-pad"
              maxLength={6}
              textContentType="oneTimeCode"
              autoComplete="sms-otp"
              caretHidden
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0.01,
                color: 'transparent',
              }}
            />
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
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
