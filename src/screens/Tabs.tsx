import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import ProjectsScreen from './projects/ProjectsScreen';
import SamplesScreen from './samples/SamplesScreen';
import MastersScreen from './masters/MastersScreen';
import ProfileScreen from './profile/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function Tabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Projects" component={ProjectsScreen} options={{ title: 'Projeler' }} />
      <Tab.Screen name="Samples" component={SamplesScreen} options={{ title: 'Numuneler' }} />
      <Tab.Screen name="Masters" component={MastersScreen} options={{ title: 'Tanımlar' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
    </Tab.Navigator>
  );
}
