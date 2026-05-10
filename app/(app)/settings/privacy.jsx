import { router } from 'expo-router';
import { ArrowLeft, Eye, Lock, Server, Share2, ShieldCheck, UserCheck } from 'lucide-react-native';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SECTIONS = [
  {
    id: '1',
    icon: UserCheck,
    title: 'Information We Collect',
    body: "We collect information you provide when creating an account — including your name, email address, age, weight, height, gender, and fitness goals. We also collect activity logs and meal preferences you enter in the app.",
  },
  {
    id: '2',
    icon: Eye,
    title: 'How We Use Your Data',
    body: "Your data is used solely to personalise your experience — generating meal plans, tracking activity, and calculating fitness metrics (BMI, BMR, TDEE). We do not use your data for advertising or sell it to third parties.",
  },
  {
    id: '3',
    icon: Lock,
    title: 'Data Security',
    body: "All data is transmitted over HTTPS and stored with industry-standard encryption. Passwords are hashed and never stored in plain text. We regularly review our security practices to protect your information.",
  },
  {
    id: '4',
    icon: Server,
    title: 'Data Retention',
    body: "We retain your account data for as long as your account is active. You may request deletion of your account and all associated data at any time by contacting us. Deleted data is permanently removed within 30 days.",
  },
  {
    id: '5',
    icon: Share2,
    title: 'Third-Party Services',
    body: "We use third-party services for authentication and infrastructure (e.g. cloud hosting). These providers are contractually bound to handle your data securely and in compliance with applicable privacy laws. We do not share health or biometric data with any third party.",
  },
  {
    id: '6',
    icon: ShieldCheck,
    title: 'Your Rights',
    body: "You have the right to access, correct, or delete your personal data at any time. You may also export your data or withdraw consent for processing. To exercise any of these rights, please contact us through the app or at support@nueapp.com.",
  },
];

export default function PrivacyPolicy() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft size={24} color="#64748B" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-foreground">Privacy Policy</Text>
        <View className="w-10" />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro */}
        <View className="bg-primary/10 rounded-2xl p-4 mb-6">
          <Text className="text-sm text-foreground leading-relaxed">
            Your privacy matters to us. This policy explains what data we collect, how we use it, and the choices you have. Last updated:{' '}
            <Text className="font-semibold">April 25, 2026</Text>.
          </Text>
        </View>

        {/* Sections */}
        {SECTIONS.map((section, index) => (
          <View
            key={section.id}
            className={`bg-card border border-border rounded-2xl p-5 ${index !== SECTIONS.length - 1 ? 'mb-4' : ''}`}
          >
            <View className="flex-row items-center gap-3 mb-3">
              <View className="w-9 h-9 rounded-full bg-secondary items-center justify-center">
                <section.icon size={18} color="#0D9488" />
              </View>
              <Text className="text-base font-semibold text-foreground flex-1">{section.title}</Text>
            </View>
            <Text className="text-sm text-muted-foreground leading-relaxed">{section.body}</Text>
          </View>
        ))}

        {/* Contact */}
        <View className="mt-6 items-center">
          <Text className="text-xs text-muted-foreground text-center">
            Questions? Contact us at{' '}
            <Text className="text-primary font-medium">support@nueapp.com</Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
