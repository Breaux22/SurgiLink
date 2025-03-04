import { StatusBar } from 'expo-status-bar';
import { useState, React, useEffect } from 'react';
import * as Linking from 'expo-linking';
import { StyleSheet, Text, SafeAreaView, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MemoryProvider } from './MemoryContext';
import iWeekly from './pages/individual/WeeklyViewPage';
import iMonthly from './pages/individual/MonthlyViewPage';
import iCase from './pages/individual/CasePage';
import iNewCase from './pages/individual/NewCasePage';
import iCamera from './pages/individual/TakePicture';
import iCaseList from './pages/individual/ListViewPage';
import iSettings from './pages/individual/Settings';
import iTrayList from './pages/individual/TrayListPage';
import bDaily from './pages/business/DailyViewPage_b';
import bWeekly from './pages/business/WeeklyViewPage_b';
import bMonthly from './pages/business/MonthlyViewPage_b';
import bCase from './pages/business/CasePage_b';
import bNewCase from './pages/business/NewCasePage_b';
import bCamera from './pages/business/TakePicture_b';
import bCaseList from './pages/business/ListViewPage_b';
import bSettings from './pages/business/Settings_b';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import { StripeProvider } from "@stripe/stripe-react-native";

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    const handleDeepLink = (event) => {
      console.log("Deep link triggered:", event.url);
    };

    const subscription = Linking.addEventListener("url", handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, []);
  
  return (
    <StripeProvider publishableKey="pk_live_51Qw7n8Cu4Ft2KEsfaSeMME8fSli7pl3UsgsxhMNOSjljkdCIpUf0wNbiRW4x19LOBYpvIYEf3eGCQVim96S1JNbs00yqqVsTyx">
      <MemoryProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              animation: 'fade',
              animationDuration: 100,
            }}
            >
            <Stack.Screen name="Login" 
              component={Login}            
              options={{
                headerShown: false,
              }} />
            <Stack.Screen name="Sign Up" 
              component={SignUp}            
              options={{
                headerShown: false,
              }} />
            <Stack.Screen name="Monthly View" 
              component={iMonthly}            
              options={{
                headerShown: false,
              }} />
            <Stack.Screen name="Weekly View" 
              component={iWeekly}            
              options={{
                headerShown: false,
              }} />
            <Stack.Screen name="Case Info"
                component={iCase}
                options={{
                  headerShown: false,
                }}
            />
            <Stack.Screen name="Create New Case"
              component={iNewCase}
              options={{
                headerShown: false,
              }} />
            <Stack.Screen name="Take Picture" 
              component={iCamera}            
              options={{
                headerShown: false,
              }} />
            <Stack.Screen name="List Cases" 
              component={iCaseList}            
              options={{
                headerShown: false,
              }} />
            <Stack.Screen name="List Trays" 
              component={iTrayList}            
              options={{
                headerShown: false,
              }} />
            <Stack.Screen name="Settings" 
              component={iSettings}            
              options={{
                headerShown: false,
              }} />
            <Stack.Screen name="Business Monthly View" 
              component={bMonthly}            
              options={{
                headerShown: false,
              }} />
            <Stack.Screen name="Business Weekly View" 
              component={bWeekly}            
              options={{
                headerShown: false,
              }} />
            <Stack.Screen name="Business Daily View" 
              component={bDaily}            
              options={{
                headerShown: false,
              }} />
            <Stack.Screen name="Business Case Info"
                component={bCase}
                options={{
                  headerShown: false,
                }}
            />
            <Stack.Screen name="Business Create New Case"
              component={bNewCase}
              options={{
                headerShown: false,
              }} />
            <Stack.Screen name="Business Take Picture" 
              component={bCamera}            
              options={{
                headerShown: false,
              }} />
            <Stack.Screen name="Business List Cases" 
              component={bCaseList}            
              options={{
                headerShown: false,
              }} />
            <Stack.Screen name="Business Settings" 
              component={bSettings}            
              options={{
                headerShown: false,
              }} />
          </Stack.Navigator>
        </NavigationContainer>
      </MemoryProvider>
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
