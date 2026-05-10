import { ThemeToggle } from '@/components/ThemeToggle';
import { useRouter } from 'expo-router';
import { Activity as ActivityIcon, Calendar, Clock, Flame, Plus, Trash2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- Types ---
type Activity = {
  id: string;
  activityLabel: string;
  durationMinutes: number;
  caloriesBurned: number;
  intensity: 'low' | 'medium' | 'high';
  loggedAt: string;
  notes?: string;
};

type Stats = {
  totalCalories: number;
  totalMinutes: number;
  sessionCount: number;
  mostFrequent?: string;
};


const MOCK_STATS: Stats = {
  totalCalories: 1850,
  totalMinutes: 245,
  sessionCount: 6,
  mostFrequent: 'Running',
};

const MOCK_ACTIVITIES: Activity[] = [
  {
    id: '1',
    activityLabel: 'Morning Run',
    durationMinutes: 45,
    caloriesBurned: 450,
    intensity: 'high',
    loggedAt: new Date().toISOString(),
    notes: 'Felt great, kept a steady pace.',
  },
  {
    id: '2',
    activityLabel: 'Weight Training',
    durationMinutes: 60,
    caloriesBurned: 320,
    intensity: 'medium',
    loggedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    activityLabel: 'Yoga Session',
    durationMinutes: 30,
    caloriesBurned: 120,
    intensity: 'low',
    loggedAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: '4',
    activityLabel: 'Cycling',
    durationMinutes: 40,
    caloriesBurned: 380,
    intensity: 'high',
    loggedAt: new Date(Date.now() - 259200000).toISOString(),
  },
];

const RANGES = ['today', 'week', 'month', 'year'] as const;
const RANGE_LABELS = { today: 'Today', week: 'Week', month: 'Month', year: 'Year' };

const INTENSITY_COLORS = {
  low: '#0F6E56',  
  medium: '#BA7517',
  high: '#A32D2D',   
};


function StatCard({ value, label, icon: Icon }: { value: string | number; label: string; icon: React.ElementType }) {
  return (
    <View className="flex-1 bg-card rounded-2xl p-4 border border-border items-center">
      <Icon size={20} className="text-primary mb-2" />
      <Text className="text-2xl font-bold text-foreground">{value}</Text>
      <Text className="text-xs text-muted-foreground mt-1 capitalize">{label}</Text>
    </View>
  );
}

function ActivityRow({ item, onRemove }: { item: Activity; onRemove: (id: string) => void }) {
  const date = new Date(item.loggedAt);
  const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const borderColor = INTENSITY_COLORS[item.intensity];

  return (
    <View className="bg-card rounded-xl p-4 mb-3 border border-border flex-row justify-between items-center" style={{ borderLeftWidth: 4, borderLeftColor: borderColor }}>
      <View className="flex-1 mr-4">
        <Text className="font-bold text-foreground text-base mb-1">{item.activityLabel}</Text>
        <View className="flex-row items-center gap-3">
          <View className="flex-row items-center gap-1">
            <Clock size={14} className="text-muted-foreground" />
            <Text className="text-sm text-muted-foreground">{item.durationMinutes} min</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Flame size={14} className="text-muted-foreground" />
            <Text className="text-sm text-muted-foreground">{item.caloriesBurned} kcal</Text>
          </View>
        </View>
        {item.notes && (
          <Text className="text-xs text-muted-foreground mt-2 italic" numberOfLines={1}>
            "{item.notes}"
          </Text>
        )}
      </View>
      
      <View className="items-end">
        <Text className="text-xs font-medium text-muted-foreground mb-1">{dateStr}</Text>
        <Text className="text-xs text-muted-foreground mb-2">{timeStr}</Text>
        <TouchableOpacity onPress={() => onRemove(item.id)} className="p-2 bg-destructive/10 rounded-full active:bg-destructive/20">
          <Trash2 size={16} className="text-destructive" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

//Main Screen 

export default function ActivitiesScreen() {
  const router = useRouter();
  const [range, setRange] = useState<(typeof RANGES)[number]>('today');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => {
      setStats(MOCK_STATS);
      setActivities(MOCK_ACTIVITIES);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timeout);
  }, [range]);

  const handleRemove = (id: string) => {
    Alert.alert('Remove Activity', 'Are you sure you want to delete this entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setActivities((prev) => prev.filter((item) => item.id !== id));
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      {/* Header */}
      <View className="px-6 pt-4 pb-2 flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-foreground">My Activities</Text>
        <ThemeToggle />
      </View>

      <FlatList
        data={activities}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 128, paddingTop: 16 }}
        ListHeaderComponent={
          <View className="gap-6">
            {/* Range Selector */}
            <View className="flex-row gap-2">
              {RANGES.map((r) => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setRange(r)}
                  activeOpacity={0.7}
                  className={`flex-1 py-2.5 rounded-full items-center justify-center border ${
                    range === r 
                      ? 'bg-primary border-primary' 
                      : 'bg-card border-border'
                  }`}
                >
                  <Text className={`text-sm font-medium ${
                    range === r ? 'text-primary-foreground' : 'text-muted-foreground'
                  }`}>
                    {RANGE_LABELS[r]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Stats Section */}
            {loading ? (
              <View className="h-24 items-center justify-center">
                <ActivityIndicator size="small" className="text-primary" />
              </View>
            ) : stats ? (
              <View className="gap-4">
                <View className="flex-row gap-3">
                  <StatCard value={stats.totalCalories} label="Kcal Burned" icon={Flame} />
                  <StatCard value={stats.totalMinutes} label="Active Min" icon={Clock} />
                  <StatCard value={stats.sessionCount} label="Sessions" icon={ActivityIcon} />
                </View>
                
                {stats.mostFrequent && (
                  <View className="bg-secondary/50 rounded-xl p-3 flex-row items-center gap-3 border border-border">
                    <ActivityIcon size={18} className="text-primary" />
                    <Text className="text-sm text-foreground">
                      Most frequent: <Text className="font-bold">{stats.mostFrequent}</Text>
                    </Text>
                  </View>
                )}
              </View>
            ) : null}
            
            {/* Section Title */}
            <Text className="text-lg font-bold text-foreground mt-2">Recent History</Text>
          </View>
        }
        renderItem={({ item }) => (
          <ActivityRow item={item} onRemove={handleRemove} />
        )}
        ListEmptyComponent={
          !loading && (
            <View className="items-center justify-center py-12">
              <Calendar size={48} className="text-muted-foreground mb-4" />
              <Text className="text-foreground font-medium text-lg">No activities found</Text>
              <Text className="text-muted-foreground text-sm mt-1">Start logging your workouts!</Text>
            </View>
          )
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        className="absolute bottom-8 right-6 bg-primary w-14 h-14 rounded-full items-center justify-center shadow-lg active:scale-95 transition-transform"
        onPress={() => router.push('/activities/add')}
        activeOpacity={0.8}
      >
        <Plus size={28} className="text-primary-foreground" strokeWidth={3} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}