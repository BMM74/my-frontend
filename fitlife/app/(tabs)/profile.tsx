import { useRouter } from 'expo-router';
import { Bell, Calendar, ChevronRight, Edit2, LogOut, Ruler, Settings, Target, User, Weight } from 'lucide-react-native';
import React from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock user data
const userData = {
  name: 'Alex Johnson',
  email: 'alex.j@example.com',
  age: 28,
  weight: 75, // kg
  height: 180, // cm
  gender: 'Male',
  activityLevel: 'Moderately Active',
  goal: 'Maintain Weight',
  avatar: 'https://images.unsplash.com/photo-1573496358961-3c82861ab8f4?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0'
};

const MENU_ITEMS = [
  { id: '1', label: 'Edit Profile', icon: Edit2, href: '/settings/edit-profile' },
  { id: '2', label: 'Preferences', icon: Settings, href: '/preferences' },
  { id: '3', label: 'My Plan', icon: Target, href: '/plan' },
  { id: '4', label: 'Notifications', icon: Bell, href: '/notifications' },
];

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 128 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View className="p-6">
          <View className="flex-row justify-between items-start mb-6">
            <View className="flex-row items-center gap-4">
              <Image
                source={{ uri: userData.avatar }}
                className="w-20 h-20 rounded-full border-2 border-primary"
              />
              <View>
                <Text className="text-2xl font-bold text-foreground">{userData.name}</Text>
                <Text className="text-muted-foreground mt-1">{userData.email}</Text>
              </View>
            </View>
          </View>

          {/* Stats Badges Section */}
          <View className="flex-row flex-wrap gap-2">
            {/* Age Badge */}
            <View className="bg-secondary rounded-full px-3 py-1.5 flex-row items-center gap-1.5">
              <Calendar size={14} className="text-primary" />
              <Text className="text-sm font-medium text-foreground">{userData.age} yrs</Text>
            </View>

            {/* Weight Badge */}
            <View className="bg-secondary rounded-full px-3 py-1.5 flex-row items-center gap-1.5">
              <Weight size={14} className="text-primary" />
              <Text className="text-sm font-medium text-foreground">{userData.weight} kg</Text>
            </View>

            {/* Height Badge */}
            <View className="bg-secondary rounded-full px-3 py-1.5 flex-row items-center gap-1.5">
              <Ruler size={14} className="text-primary" />
              <Text className="text-sm font-medium text-foreground">{userData.height} cm</Text>
            </View>

            {/* Gender Badge */}
            <View className="bg-secondary rounded-full px-3 py-1.5 flex-row items-center gap-1.5">
              <User size={14} className="text-primary" />
              <Text className="text-sm font-medium text-foreground">{userData.gender}</Text>
            </View>

            {/* Goal Badge */}
            <View className="bg-secondary rounded-full px-3 py-1.5 flex-row items-center gap-1.5">
              <Target size={14} className="text-primary" />
              <Text className="text-sm font-medium text-foreground">{userData.goal}</Text>
            </View>
          </View>
        </View>

        {/* Menu Section */}
        <View className="px-6 mt-2">
          <Text className="text-lg font-semibold text-foreground mb-3">Account</Text>
          <View className="bg-card rounded-2xl border border-border overflow-hidden">
            {MENU_ITEMS.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => router.push(item.href as any)}
                className={`flex-row items-center justify-between p-4 ${
                  index !== MENU_ITEMS.length - 1 ? 'border-b border-border' : ''
                }`}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center gap-3">
                  <View className="w-8 h-8 rounded-full bg-secondary items-center justify-center">
                    <item.icon size={18} className="text-foreground" />
                  </View>
                  <Text className="text-base text-foreground font-medium">{item.label}</Text>
                </View>
                <ChevronRight size={20} className="text-muted-foreground" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout Section */}
        <View className="px-6 mt-6">
          <TouchableOpacity className="flex-row items-center justify-center gap-2 p-4 bg-destructive/10 rounded-2xl" activeOpacity={0.7}>
            <LogOut size={20} className="text-destructive" />
            <Text className="text-base font-semibold text-destructive">Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}