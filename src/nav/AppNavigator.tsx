import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../auth/AuthContext';
import type { RootStackParamList } from './types';

import LoginScreen from '../screens/LoginScreen';
import Tabs from '../screens/Tabs';

import ProjectDetailScreen from '../screens/projects/ProjectDetailScreen';
import ProjectFormScreen from '../screens/projects/ProjectFormScreen';
import ProjectPanelsEditScreen from '../screens/projects/ProjectPanelsEditScreen';
import ProjectConsumablesEditScreen from '../screens/projects/ProjectConsumablesEditScreen';

import SampleDetailScreen from '../screens/samples/SampleDetailScreen';
import SampleFormScreen from '../screens/samples/SampleFormScreen';

import PanelsMasterScreen from '../screens/masters/PanelsMasterScreen';
import ConsumablesMasterScreen from '../screens/masters/ConsumablesMasterScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { token } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {token ? (
          <>
            <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />

            <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} options={{ title: 'Proje' }} />
            <Stack.Screen name="ProjectForm" component={ProjectFormScreen} options={{ title: 'Proje Form' }} />
            <Stack.Screen name="ProjectPanelsEdit" component={ProjectPanelsEditScreen} options={{ title: 'Proje Panelleri' }} />
            <Stack.Screen name="ProjectConsumablesEdit" component={ProjectConsumablesEditScreen} options={{ title: 'Proje Sarfları' }} />

            <Stack.Screen name="SampleDetail" component={SampleDetailScreen} options={{ title: 'Numune' }} />
            <Stack.Screen name="SampleForm" component={SampleFormScreen} options={{ title: 'Numune Form' }} />

            <Stack.Screen name="PanelsMaster" component={PanelsMasterScreen} options={{ title: 'Paneller' }} />
            <Stack.Screen name="ConsumablesMaster" component={ConsumablesMasterScreen} options={{ title: 'Sarflar' }} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Giriş' }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
