import { ThemeToggle } from '@/components/ThemeToggle';
import { Activity as ActivityIcon, Flame, Target, TrendingUp, Utensils, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock Data for Preview
const MOCK_USER = {
  user: {
    email: 'alex.fitness@example.com',
    weight: 75,
    height: 180,
    age: 28,
    goal: 'lose',
  },
  metrics: {
    bmi: 23.1,
    bmr: 1750,
    tdee: 2400,
    dailyCalories: 2000,
  },
};

const MOCK_MEALS = {
  breakfast: { name: 'Oatmeal & Berries', calories: 450, protein: '15g' },
  lunch: { name: 'Grilled Chicken Salad', calories: 650, protein: '40g' },
  dinner: { name: 'Salmon with Quinoa', calories: 700, protein: '35g' },
};

const MOCK_ACTIVITIES = [
  { id: 1, type: 'Running', duration: '30 min', calories: 320, date: 'Today' },
  { id: 2, type: 'Weight Training', duration: '45 min', calories: 210, date: 'Yesterday' },
  { id: 3, type: 'Yoga', duration: '60 min', calories: 180, date: '2 days ago' },
];

// Helper Functions
function getBmiLabel(bmi: number) {
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-500', rangeColor: '#3B82F6' };
  if (bmi < 25) return { label: 'Normal', color: 'text-green-500', rangeColor: '#22C55E' };
  if (bmi < 30) return { label: 'Overweight', color: 'text-yellow-500', rangeColor: '#EAB308' };
  return { label: 'Obese', color: 'text-red-500', rangeColor: '#EF4444' };
}

function getDailyCaloriesSubtitle(goal: string) {
  if (goal === 'lose') return 'kcal / day (deficit)';
  if (goal === 'maintain') return 'kcal / day (maintenance)';
  return 'kcal / day (surplus)';
}

type MetricType = 'bmi' | 'bmr' | 'tdee' | 'calories';

type MetricData = {
  id: string;
  label: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  type: MetricType;
  highlight?: boolean;
};

type MetricCardProps = {
  data: MetricData;
  onPress: (data: MetricData) => void;
};

function MetricCard({ data, onPress }: MetricCardProps) {
  const Icon = data.icon;
  return (
    <Pressable onPress={() => onPress(data)} className="flex-1">
      <View className={`flex-1 bg-card rounded-2xl p-4 border ${data.highlight ? 'border-primary/50 bg-primary/5' : 'border-border'} min-h-[120px] justify-between`}>
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-medium text-muted-foreground">{data.label}</Text>
          <Icon size={16} className={data.highlight ? 'text-primary' : 'text-muted-foreground'} />
        </View>
        <View>
          <Text className={`text-2xl font-bold ${data.highlight ? 'text-primary' : 'text-foreground'}`}>
            {data.value}
          </Text>
          <Text className="text-xs text-muted-foreground mt-1">{data.subtitle}</Text>
        </View>
      </View>
    </Pressable>
  );
}

// Chart Components
function BMIChart({ value }: { value: number }) {
  const maxBmi = 40;
  const percentage = Math.min((value / maxBmi) * 100, 100);
  
  return (
    <View className="mt-4">
      <View className="h-4 w-full rounded-full flex-row overflow-hidden bg-muted">
        <View className="flex-1 bg-blue-500 h-full" /> {/* Underweight */}
        <View className="flex-1 bg-green-500 h-full" /> {/* Normal */}
        <View className="flex-1 bg-yellow-500 h-full" /> {/* Overweight */}
        <View className="flex-1 bg-red-500 h-full" /> {/* Obese */}
      </View>
      <View className="relative h-6 mt-1">
        <View 
          className="absolute top-0 w-0.5 h-full bg-foreground"
          style={{ left: `${percentage}%` }}
        >
          <View className="absolute -top-1 -left-1 w-2 h-2 bg-foreground rounded-full" />
        </View>
      </View>
      <View className="flex-row justify-between mt-2">
        <Text className="text-xs text-muted-foreground">0</Text>
        <Text className="text-xs text-muted-foreground">18.5</Text>
        <Text className="text-xs text-muted-foreground">25</Text>
        <Text className="text-xs text-muted-foreground">30</Text>
        <Text className="text-xs text-muted-foreground">40+</Text>
      </View>
      <View className="mt-4 p-4 bg-muted rounded-xl">
        <Text className="text-sm font-semibold text-foreground mb-2">Analysis</Text>
        <Text className="text-sm text-muted-foreground">
          Your BMI is <Text className="font-bold text-foreground">{value}</Text>. {getBmiLabel(value).label} weight range.
        </Text>
      </View>
    </View>
  );
}

function CalorieChart({ value, type }: { value: number; type: string }) {
  // Mock macro breakdown
  const protein = Math.round(value * 0.3);
  const carbs = Math.round(value * 0.5);
  const fat = Math.round(value * 0.2);

  return (
    <View className="mt-4">
      <Text className="text-sm font-semibold text-foreground mb-3">Suggested Macro Breakdown</Text>
      
      <View className="gap-3">
        <View>
          <View className="flex-row justify-between mb-1">
            <Text className="text-xs text-muted-foreground">Carbs (50%)</Text>
            <Text className="text-xs font-bold text-foreground">{carbs} kcal</Text>
          </View>
          <View className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <View className="h-full bg-blue-500 rounded-full" style={{ width: '50%' }} />
          </View>
        </View>

        <View>
          <View className="flex-row justify-between mb-1">
            <Text className="text-xs text-muted-foreground">Protein (30%)</Text>
            <Text className="text-xs font-bold text-foreground">{protein} kcal</Text>
          </View>
          <View className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <View className="h-full bg-green-500 rounded-full" style={{ width: '30%' }} />
          </View>
        </View>

        <View>
          <View className="flex-row justify-between mb-1">
            <Text className="text-xs text-muted-foreground">Fat (20%)</Text>
            <Text className="text-xs font-bold text-foreground">{fat} kcal</Text>
          </View>
          <View className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <View className="h-full bg-yellow-500 rounded-full" style={{ width: '20%' }} />
          </View>
        </View>
      </View>

      <View className="mt-4 p-4 bg-muted rounded-xl">
        <Text className="text-sm font-semibold text-foreground mb-2">About {type}</Text>
        <Text className="text-sm text-muted-foreground">
          {type === 'BMR' 
            ? 'Basal Metabolic Rate: Calories burned at complete rest.'
            : type === 'TDEE'
            ? 'Total Daily Energy Expenditure: Total calories burned per day with activity.'
            : 'Daily Target: Recommended calorie intake for your goal.'}
        </Text>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const [userData, setUserData] = useState<typeof MOCK_USER | null>(null);
  const [todayMeals, setTodayMeals] = useState(MOCK_MEALS);
  const [recentActivities, setRecentActivities] = useState(MOCK_ACTIVITIES);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<MetricData | null>(null);

  useEffect(() => {
    // Simulate API call with mock data
    setTimeout(() => {
      setUserData(MOCK_USER);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" className="text-primary" />
      </SafeAreaView>
    );
  }

  if (!userData) return null;

  const { user, metrics } = userData;
  const username = user.email.split('@')[0];

  // Prepare metrics data for cards
  const metricsList: MetricData[] = [
    {
      id: 'bmi',
      label: 'BMI',
      value: metrics.bmi.toFixed(1),
      subtitle: getBmiLabel(metrics.bmi).label,
      icon: Target,
      type: 'bmi',
    },
    {
      id: 'bmr',
      label: 'BMR',
      value: metrics.bmr.toString(),
      subtitle: 'kcal / day at rest',
      icon: Flame,
      type: 'bmr',
    },
    {
      id: 'tdee',
      label: 'TDEE',
      value: metrics.tdee.toString(),
      subtitle: 'Total daily energy',
      icon: TrendingUp,
      type: 'tdee',
    },
    {
      id: 'calories',
      label: 'Daily Target',
      value: metrics.dailyCalories.toString(),
      subtitle: getDailyCaloriesSubtitle(user.goal),
      icon: ActivityIcon,
      type: 'calories',
      highlight: true,
    },
  ];

  const renderChart = () => {
    if (!selectedMetric) return null;
    
    const value = parseFloat(selectedMetric.value);
    
    if (selectedMetric.type === 'bmi') {
      return <BMIChart value={value} />;
    }
    
    return <CalorieChart value={value} type={selectedMetric.label} />;
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      <ScrollView 
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 128, gap: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between pt-2">
          <View>
            <Text className="text-2xl font-bold text-foreground">Hi, {username} 👋</Text>
            <Text className="text-muted-foreground">Here's your fitness overview</Text>
          </View>
          <ThemeToggle />
        </View>

        {/* Metrics Grid */}
        <View className="gap-4">
          <View className="flex-row gap-4">
            <MetricCard data={metricsList[0]} onPress={setSelectedMetric} />
            <MetricCard data={metricsList[1]} onPress={setSelectedMetric} />
          </View>
          <View className="flex-row gap-4">
            <MetricCard data={metricsList[2]} onPress={setSelectedMetric} />
            <MetricCard data={metricsList[3]} onPress={setSelectedMetric} />
          </View>
        </View>

        {/* Profile Stats Row */}
        <View className="bg-card rounded-2xl p-4 border border-border flex-row justify-between items-center">
          <View className="flex-1 items-center border-r border-border">
            <Text className="text-xl font-bold text-foreground">{user.weight}</Text>
            <Text className="text-xs text-muted-foreground mt-1">Weight (kg)</Text>
          </View>
          <View className="flex-1 items-center border-r border-border">
            <Text className="text-xl font-bold text-foreground">{user.height}</Text>
            <Text className="text-xs text-muted-foreground mt-1">Height (cm)</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-xl font-bold text-foreground">{user.age}</Text>
            <Text className="text-xs text-muted-foreground mt-1">Age</Text>
          </View>
        </View>

        {/* Today's Meals */}
        <View>
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-foreground">Today's Meals</Text>
            <Text className="text-sm text-primary font-medium">See All</Text>
          </View>
          <View className="gap-3">
            {todayMeals && (
              <>
                <View className="bg-card rounded-xl p-4 border border-border flex-row items-center gap-4">
                  <View className="bg-primary/10 p-3 rounded-full">
                    <Utensils size={20} className="text-primary" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-foreground">Breakfast</Text>
                    <Text className="text-sm text-muted-foreground">{todayMeals.breakfast.name}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="font-bold text-foreground">{todayMeals.breakfast.calories}</Text>
                    <Text className="text-xs text-muted-foreground">kcal</Text>
                  </View>
                </View>

                <View className="bg-card rounded-xl p-4 border border-border flex-row items-center gap-4">
                  <View className="bg-primary/10 p-3 rounded-full">
                    <Utensils size={20} className="text-primary" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-foreground">Lunch</Text>
                    <Text className="text-sm text-muted-foreground">{todayMeals.lunch.name}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="font-bold text-foreground">{todayMeals.lunch.calories}</Text>
                    <Text className="text-xs text-muted-foreground">kcal</Text>
                  </View>
                </View>

                <View className="bg-card rounded-xl p-4 border border-border flex-row items-center gap-4">
                  <View className="bg-primary/10 p-3 rounded-full">
                    <Utensils size={20} className="text-primary" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-foreground">Dinner</Text>
                    <Text className="text-sm text-muted-foreground">{todayMeals.dinner.name}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="font-bold text-foreground">{todayMeals.dinner.calories}</Text>
                    <Text className="text-xs text-muted-foreground">kcal</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Recent Activities */}
        <View>
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-foreground">Recent Activities</Text>
            <Text className="text-sm text-primary font-medium">History</Text>
          </View>
          <View className="gap-3">
            {recentActivities.map((activity) => (
              <View key={activity.id} className="bg-card rounded-xl p-4 border border-border flex-row items-center justify-between">
                <View className="flex-row items-center gap-3 flex-1">
                  <View className="bg-orange-500/10 p-3 rounded-full">
                    <ActivityIcon size={20} className="text-orange-500" />
                  </View>
                  <View>
                    <Text className="font-semibold text-foreground">{activity.type}</Text>
                    <Text className="text-sm text-muted-foreground">{activity.duration}</Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="font-bold text-foreground">{activity.calories}</Text>
                  <Text className="text-xs text-muted-foreground">kcal</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Metric Detail Modal */}
      <Modal
        visible={!!selectedMetric}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedMetric(null)}
      >
        <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View className="bg-card rounded-2xl p-6 w-[90%] max-w-sm">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center gap-3">
                {selectedMetric && <selectedMetric.icon size={24} className="text-primary" />}
                <Text className="text-2xl font-bold text-foreground">{selectedMetric?.label}</Text>
              </View>
              <Pressable onPress={() => setSelectedMetric(null)} className="p-2 -mr-2">
                <X size={20} className="text-muted-foreground" />
              </Pressable>
            </View>
            
            <View className="mb-4">
              <Text className="text-4xl font-bold text-primary">{selectedMetric?.value}</Text>
              <Text className="text-sm text-muted-foreground mt-1">{selectedMetric?.subtitle}</Text>
            </View>

            {renderChart()}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}