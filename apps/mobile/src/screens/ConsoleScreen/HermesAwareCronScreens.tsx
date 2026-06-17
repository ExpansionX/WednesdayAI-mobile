import React from 'react';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '../../components/ui';
import { useAppContext } from '../../contexts/AppContext';
import { useNativeStackModalHeader } from '../../hooks/useNativeStackModalHeader';
import { selectByBackend } from '../../services/gateway-backends';
import { resolveCronEditorDispatch } from './hermesAwareCronDispatch';
import { CronDetailScreen as OpenClawCronDetailScreen } from './CronDetailScreen';
import { CronEditorScreen as OpenClawCronEditorScreen } from './CronEditorScreen';
import { CronListScreen as OpenClawCronListScreen } from './CronListScreen';
import { CronWizardScreen as OpenClawCronWizardScreen } from './CronWizardScreen';
import { HermesCronDetailScreen } from './HermesCronDetailScreen';
import { HermesCronEditorScreen } from './HermesCronEditorScreen';
import { HermesCronListScreen } from './HermesCronListScreen';
import { HermesCronWizardScreen } from './HermesCronWizardScreen';
import type { ConsoleStackParamList } from './ConsoleTab';

// This file centralizes the OpenClaw-compatible-vs-Hermes dispatch for
// the 4 Cron route screens. Backend branching goes through
// `selectByBackend` and the `consoleCronCreate` capability flag so we
// never spread `if (backend === 'hermes')` across screen files (see
// Backend Architecture Rule #3 in apps/mobile/CLAUDE.md). WednesdayAI
// and OpenClaw use the OpenClaw-compatible cron route in this first
// slice, and `consoleCronCreate` is `true` for both, so the
// create-unavailable short-circuit never triggers.

function CronCreateUnavailableScreen(): React.JSX.Element {
  const { t } = useTranslation('console');
  const navigation = useNavigation<NativeStackNavigationProp<ConsoleStackParamList>>();

  useNativeStackModalHeader({
    navigation,
    title: t('Create Task'),
    onClose: () => navigation.goBack(),
  });

  return (
    <EmptyState
      icon="🧩"
      title={t('Not Available Yet')}
      subtitle={t('Creating Hermes scheduled tasks in Clawket is not available yet.')}
    />
  );
}

export function CronListRouteScreen(): React.JSX.Element {
  const { gateway } = useAppContext();
  const Component = selectByBackend(gateway.getBackendKind(), {
    wednesdayai: OpenClawCronListScreen,
    openclaw: OpenClawCronListScreen,
    hermes: HermesCronListScreen,
  });
  return <Component />;
}

export function CronDetailRouteScreen(): React.JSX.Element {
  const { gateway } = useAppContext();
  const Component = selectByBackend(gateway.getBackendKind(), {
    wednesdayai: OpenClawCronDetailScreen,
    openclaw: OpenClawCronDetailScreen,
    hermes: HermesCronDetailScreen,
  });
  return <Component />;
}

export function CronEditorRouteScreen(): React.JSX.Element {
  const { gateway } = useAppContext();
  const route = useRoute<RouteProp<ConsoleStackParamList, 'CronEditor'>>();
  const decision = resolveCronEditorDispatch({
    jobId: route.params?.jobId,
    capabilities: gateway.getBackendCapabilities(),
  });
  if (decision === 'createUnavailable') {
    return <CronCreateUnavailableScreen />;
  }
  const Component = selectByBackend(gateway.getBackendKind(), {
    wednesdayai: OpenClawCronEditorScreen,
    openclaw: OpenClawCronEditorScreen,
    hermes: HermesCronEditorScreen,
  });
  return <Component />;
}

export function CronWizardRouteScreen(): React.JSX.Element {
  const { gateway } = useAppContext();
  const route = useRoute<RouteProp<ConsoleStackParamList, 'CronWizard'>>();
  const decision = resolveCronEditorDispatch({
    jobId: route.params?.jobId,
    capabilities: gateway.getBackendCapabilities(),
  });
  if (decision === 'createUnavailable') {
    return <CronCreateUnavailableScreen />;
  }
  const Component = selectByBackend(gateway.getBackendKind(), {
    wednesdayai: OpenClawCronWizardScreen,
    openclaw: OpenClawCronWizardScreen,
    hermes: HermesCronWizardScreen,
  });
  return <Component />;
}
