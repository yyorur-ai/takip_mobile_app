import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { Project, Sample } from '../models/types';

export type RootStackParamList = {
  Login: undefined;
  Tabs: undefined;

  ProjectDetail: { id: number };
  ProjectForm: { mode: 'create' } | { mode: 'edit'; project: Project };
  ProjectPanelsEdit: { projectId: number };
  ProjectConsumablesEdit: { projectId: number };

  SampleDetail: { id: number };
  SampleForm: { mode: 'create' } | { mode: 'edit'; sample: Sample };

  PanelsMaster: undefined;
  ConsumablesMaster: undefined;
};

export type ProjectsScreenNav = NativeStackNavigationProp<RootStackParamList>;
export type SamplesScreenNav = NativeStackNavigationProp<RootStackParamList>;
