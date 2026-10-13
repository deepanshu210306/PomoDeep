import {
  Check,
  ChevronRight,
  Circle,
  CircleDashed,
  CircleDot,
  CircleX,
  ClipboardList,
  ListFilter,
  Search,
  Target,
  Trash2,
  X,
} from 'lucide-react';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../store/AppContext';
import { formatDurationShort } from '../../utils/time';
import type { Task, TaskStatus } from '../../types';

const STATUSES: { id: TaskStatus; label: string }[] = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'todo', label: 'Todo' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'done', label: 'Done' },
  { id: 'canceled', label: 'Canceled' },
];

function StatusIcon({ status, size = 18 }: { status: TaskStatus; size?: number }) {
  if (status === 'backlog') {
    return <CircleDashed size={size} strokeWidth={1.75} color="#8b8d97" />;
  }
  if (status === 'todo') {
    return <Circle size={size} strokeWidth={1.75} color="#c4c4cc" />;
  }
  if (status === 'in_progress') {
    return <CircleDot size={size} strokeWidth={2} color="#eab308" />;
  }
  if (status === 'done') {
    return (
      <span
        className="status-done-icon"
        style={{ width: size, height: size }}
      >
        <Check size={size * 0.62} strokeWidth={3} />
      </span>
    );
  }
  return <CircleX size={size} strokeWidth={1.75} color="#9ca3af" />;
}

export function TasksPanel() {
  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    setTaskStatus,
    setFocusTask,
    focusTaskId,
    taskSearch,
    setTaskSearch,
    taskSort,
    setTaskSort,
    taskFilter,
    setTaskFilter,
  } = useApp();

  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [menu, setMenu] = useState<{
    taskId: string;
    top: number;
    left: number;
  } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (adding) inputRef.current?.focus();
  }, [adding]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(id);
  }, [toast]);

  useEffect(() => {
    if (!menu) return;

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (menuRef.current?.contains(target)) return;
      setMenu(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenu(null);
    };

    // Defer so the opening click does not instantly close the menu
    const id = window.setTimeout(() => {
      window.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('keydown', onKey);
    }, 0);

    return () => {
      window.clearTimeout(id);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [menu]);

  const doneCount = tasks.filter((t) => t.status === 'done').length;
  const activeTotal = tasks.filter((t) => t.status !== 'canceled').length;
  const progress = activeTotal === 0 ? 0 : doneCount / activeTotal;

  const filtered = useMemo(() => {
    let list = [...tasks];
    if (taskFilter !== 'all') list = list.filter((t) => t.status === taskFilter);
    if (taskSearch.trim()) {
      const q = taskSearch.toLowerCase();
      list = list.filter((t) => t.title.toLowerCase().includes(q));
    }
    switch (taskSort) {
      case 'oldest':
        list.sort((a, b) => a.createdAt - b.createdAt);
        break;
      case 'title':
        list.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'status':
        list.sort((a, b) => a.status.localeCompare(b.status));
        break;
      case 'time':
        list.sort((a, b) => b.accumulatedMs - a.accumulatedMs);
        break;
      default:
        list.sort((a, b) => b.createdAt - a.createdAt);
    }
    return list;
  }, [tasks, taskFilter, taskSearch, taskSort]);

  const submit = () => {
    if (!draft.trim()) return;
    addTask(draft);
    setDraft('');
    setAdding(false);
    setToast('Task added');
  };

  const openStatusMenu = (e: MouseEvent, task: Task) => {
    e.stopPropagation();
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();

    if (menu?.taskId === task.id) {
      setMenu(null);
      return;
    }

    const menuWidth = 190;
    const menuHeight = 240;
    const left = Math.min(rect.left, window.innerWidth - menuWidth - 12);
    const top =
      rect.bottom + 6 + menuHeight > window.innerHeight
        ? Math.max(12, rect.top - menuHeight - 6)
        : rect.bottom + 6;

    setMenu({ taskId: task.id, top, left: Math.max(12, left) });
  };

  const statusMenu =
    menu &&
    createPortal(
      <div
        ref={menuRef}
        className="status-menu"
        role="menu"
        aria-label="Task status"
        style={{ top: menu.top, left: menu.left }}
      >
        {STATUSES.map((s) => {
          const selected =
            tasks.find((t) => t.id === menu.taskId)?.status === s.id;
          return (
            <button
              key={s.id}
              type="button"
              role="menuitemradio"
              aria-checked={selected}
              className={`status-option ${selected ? 'selected' : ''}`}
              onClick={() => {
                setTaskStatus(menu.taskId, s.id);
                setMenu(null);
                setToast(`Marked as ${s.label}`);
              }}
            >
              <StatusIcon status={s.id} size={17} />
              <span>{s.label}</span>
              {selected && <Check size={15} className="check" strokeWidth={2.5} />}
            </button>
          );
        })}
      </div>,
      document.body,
    );

  return (
    <aside className="panel panel-wide" aria-label="Tasks">
      <div className="panel-scroll">
        <div className="tasks-header">
          <h2 className="tasks-title">Tasks</h2>
          <div className="tasks-progress">
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <span className="progress-count">
              {doneCount}/{activeTotal || tasks.length}
            </span>
          </div>
          <div className="tasks-actions">
            <button
              type="button"
              className={`icon-btn ${showSearch ? 'active' : ''}`}
              aria-label="Search tasks"
              onClick={() => setShowSearch((v) => !v)}
            >
              <Search size={18} />
            </button>
            <button
              type="button"
              className={`icon-btn ${showFilter ? 'active' : ''}`}
              aria-label="Filter and sort"
              onClick={() => setShowFilter((v) => !v)}
            >
              <ListFilter size={18} />
            </button>
          </div>
        </div>

        {showSearch && (
          <div className="search-bar">
            <Search size={14} color="#8b8d97" />
            <input
              value={taskSearch}
              onChange={(e) => setTaskSearch(e.target.value)}
              placeholder="Search tasks…"
              aria-label="Search tasks"
            />
            {taskSearch && (
              <button
                type="button"
                className="icon-btn"
                aria-label="Clear search"
                onClick={() => setTaskSearch('')}
              >
                <X size={14} />
              </button>
            )}
          </div>
        )}

        {showFilter && (
          <div className="filter-bar">
            {(['all', ...STATUSES.map((s) => s.id)] as const).map((f) => (
              <button
                key={f}
                type="button"
                className={`pill ${taskFilter === f ? 'active' : ''}`}
                onClick={() => setTaskFilter(f)}
              >
                {f === 'all' ? 'All' : STATUSES.find((s) => s.id === f)?.label}
              </button>
            ))}
            {(
              [
                ['newest', 'Newest'],
                ['oldest', 'Oldest'],
                ['title', 'Title'],
                ['time', 'Time'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={`pill ${taskSort === key ? 'active' : ''}`}
                onClick={() => setTaskSort(key)}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {adding ? (
          <div className="add-task-form">
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="New task…"
              onKeyDown={(e) => {
                if (e.key === 'Enter') submit();
                if (e.key === 'Escape') {
                  setAdding(false);
                  setDraft('');
                }
              }}
            />
            <div className="add-task-form-actions">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  setAdding(false);
                  setDraft('');
                }}
              >
                Cancel
              </button>
              <button type="button" className="btn-accent" onClick={submit}>
                Add
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="add-task-btn"
            onClick={() => setAdding(true)}
          >
            + Add task
          </button>
        )}

        {filtered.length === 0 ? (
          <div className="empty-tasks">
            <ClipboardList size={36} />
            <p>
              {tasks.length === 0
                ? 'No tasks yet — add one above to stay focused.'
                : 'No tasks match your search or filters.'}
            </p>
          </div>
        ) : (
          <div className="task-list">
            {filtered.map((task) => (
              <div key={task.id}>
                <div
                  className={`task-card ${focusTaskId === task.id ? 'focused' : ''}`}
                >
                  <button
                    type="button"
                    className="task-status-btn"
                    aria-label={`Change status (${STATUSES.find((s) => s.id === task.status)?.label})`}
                    aria-haspopup="menu"
                    aria-expanded={menu?.taskId === task.id}
                    onClick={(e) => openStatusMenu(e, task)}
                  >
                    <StatusIcon status={task.status} />
                  </button>
                  <button
                    type="button"
                    className="task-body"
                    onClick={() =>
                      setExpandedId(expandedId === task.id ? null : task.id)
                    }
                  >
                    <div
                      className={`task-title ${task.status === 'done' || task.status === 'canceled' ? 'done' : ''}`}
                    >
                      {task.title}
                    </div>
                    {task.accumulatedMs > 0 && (
                      <div className="task-meta">
                        {formatDurationShort(task.accumulatedMs / 1000)} studied
                      </div>
                    )}
                  </button>
                  <ChevronRight size={16} className="task-chevron" />
                </div>

                {expandedId === task.id && (
                  <div className="task-details">
                    <input
                      value={task.title}
                      onChange={(e) =>
                        updateTask(task.id, { title: e.target.value })
                      }
                      aria-label="Edit task title"
                    />
                    <div className="task-details-actions">
                      <button
                        type="button"
                        className="btn-accent"
                        onClick={() => {
                          setFocusTask(
                            focusTaskId === task.id ? null : task.id,
                          );
                          setToast(
                            focusTaskId === task.id
                              ? 'Focus cleared'
                              : 'Set as focus task',
                          );
                        }}
                      >
                        <Target size={14} style={{ marginRight: 6 }} />
                        {focusTaskId === task.id ? 'Clear focus' : 'Focus'}
                      </button>
                      <button
                        type="button"
                        className="btn-ghost"
                        onClick={() => {
                          deleteTask(task.id);
                          setToast('Task deleted');
                        }}
                      >
                        <Trash2 size={14} style={{ marginRight: 6 }} />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {statusMenu}
      {toast && <div className="toast">{toast}</div>}
    </aside>
  );
}
