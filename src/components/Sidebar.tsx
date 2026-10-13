import {
  ChartColumn,
  Flame,
  ListTodo,
  Music2,
  Settings,
  Trophy,
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import type { PanelId } from '../types';

const baseItems: { id: PanelId; label: string; icon: typeof ListTodo }[] = [
  { id: 'tasks', label: 'Tasks', icon: ListTodo },
  { id: 'achievements', label: "Today's challenge", icon: Trophy },
  { id: 'streak', label: 'Focus streak', icon: Flame },
  { id: 'music', label: 'Music', icon: Music2 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const { panel, setPanel, streak, view } = useApp();

  const items =
    view === 'study'
      ? [
          ...baseItems.slice(0, 1),
          {
            id: 'studyHistory' as PanelId,
            label: 'Study graph',
            icon: ChartColumn,
          },
          ...baseItems.slice(1),
        ]
      : baseItems;

  const toggle = (id: PanelId) => {
    setPanel(panel === id ? null : id);
  };

  return (
    <nav className="sidebar" aria-label="Main">
      {items.map((item, index) => {
        if (!item.id) return null;
        const Icon = item.icon;
        const active = panel === item.id;
        return (
          <div key={item.id} style={{ display: 'contents' }}>
            {index > 0 && <div className="sidebar-divider" />}
            <button
              type="button"
              className={`sidebar-btn ${active ? 'active' : ''} ${item.id === 'streak' ? 'streak-btn' : ''} ${item.id === 'studyHistory' ? 'study-hist-btn' : ''}`}
              aria-label={item.label}
              aria-pressed={active}
              onClick={() => toggle(item.id)}
            >
              <Icon strokeWidth={1.75} />
              {item.id === 'streak' && (
                <span className="streak-count">{streak.current}</span>
              )}
            </button>
          </div>
        );
      })}
    </nav>
  );
}
