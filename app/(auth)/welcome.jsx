import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Background Image */}
      <Image
        source={{
          uri: 'https://images.unsplash.com/photo-1657087018695-a57e346504f9?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGhpa2luZyUyMGFkdmVudHVyZXxlbnwwfHwwfHx8MA%3D%3D',
        }}
        className="absolute w-full h-full"
        resizeMode="cover"
      />

      {/* Gradient Overlay */}
      <LinearGradient
        colors={['rgba(15, 23, 42, 0.8)', 'rgba(15, 23, 42, 0.2)', 'rgba(15, 23, 42, 0.9)']}
        locations={[0, 0.4, 1]}
        className="absolute w-full h-full"
      />

      {/* Content */}
      <View className="flex-1 justify-between px-8 pt-12 pb-8 relative z-10">
        {/* Top Section */}
        <View className="items-center mt-12">
          <View className="mb-6 p-4 bg-white/10 rounded-3xl border border-white/20">
            <Image
              source={require('../../assets/images/icon.png')}
              className="w-24 h-24"
              resizeMode="contain"
            />
          </View>

          <Text className="text-6xl font-bold text-white tracking-tight mb-3">
            Nue
          </Text>

          <Text className="text-lg text-white/80 text-center leading-relaxed max-w-xs">
            Your personal{' '}
            <Text className="text-primary font-semibold">fitness</Text>{' '}
            companion.
          </Text>
        </View>

        {/* Bottom Section */}
        <View className="mb-4">
          <TouchableOpacity
            onPress={() => router.push('/(auth)/email')}
            activeOpacity={0.9}
            className="bg-primary rounded-full py-4 px-8 flex-row items-center justify-center"
          >
            <Text className="text-white font-bold text-lg mr-2">Get Started</Text>
            <ArrowRight size={20} color="white" />
          </TouchableOpacity>

          <Text className="text-center text-white/50 text-xs mt-4">
            By continuing, you agree to our Terms of Service
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

