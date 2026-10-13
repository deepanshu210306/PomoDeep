'use client';

import { AuthProvider } from './auth/AuthContext';
import { AmbientEffects } from './components/AmbientEffects';
import { AudioPlayer } from './components/AudioPlayer';
import { AuthModal } from './components/AuthModal';
import { Background } from './components/Background';
import { CloudSync } from './components/CloudSync';
import { Sidebar } from './components/Sidebar';
import { TimerDisplay } from './components/TimerDisplay';
import { AchievementsPanel } from './components/panels/AchievementsPanel';
import { MusicPanel } from './components/panels/MusicPanel';
import { SettingsPanel } from './components/panels/SettingsPanel';
import { StreakPanel } from './components/panels/StreakPanel';
import { StudyHistoryPanel } from './components/panels/StudyHistoryPanel';
import { TasksPanel } from './components/panels/TasksPanel';
import { AppProvider, useApp } from './store/AppContext';

function Workspace() {
  const { panel, toast, view } = useApp();

  return (
    <div className="app-shell">
      <Background />
      <AmbientEffects />
      <AudioPlayer />
      <CloudSync />
      <div className="workspace">
        <Sidebar />
        <TimerDisplay />
      </div>
      {panel === 'tasks' && <TasksPanel />}
      {panel === 'settings' && <SettingsPanel />}
      {panel === 'music' && <MusicPanel />}
      {panel === 'achievements' && <AchievementsPanel />}
      {panel === 'streak' && <StreakPanel />}
      {panel === 'studyHistory' && view === 'study' && <StudyHistoryPanel />}
      <AuthModal />
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Workspace />
      </AppProvider>
    </AuthProvider>
  );
}
