"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Flame,
  Gift,
  Home,
  ListTodo,
  Pencil,
  Plus,
  RotateCcw,
  Settings,
  ShieldCheck,
  Tag,
  Trash2,
  X
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSwipeable } from "react-swipeable";

import {
  PRIORITY_META,
  THEMES,
  advanceStreak,
  createId,
  dateKey,
  getInitialState,
  isOverdue,
  isTodayTask,
  makeEmptyTask,
  normalizeTags,
  readableDate,
  sortTasks,
  longDateLabel,
  visibleStreak,
  type HaloState,
  type HaloTask,
  type Priority,
  type ThemeId,
  type ViewId
} from "@/lib/halo-data";
import { clearHaloState, loadHaloState, saveHaloState } from "@/lib/storage";
import {
  initializeAdMob,
  pulseCompletion,
  registerServiceWorker,
  showNativeInterstitial,
  showNativeRewarded
} from "@/lib/native";

const NAV_ITEMS: { id: ViewId; label: string; Icon: typeof Home }[] = [
  { id: "home", label: "Home", Icon: Home },
  { id: "today", label: "Today", Icon: CalendarDays },
  { id: "completed", label: "Completed", Icon: CheckCircle2 },
  { id: "settings", label: "Settings", Icon: Settings }
];

const MILESTONES = [7, 30, 100];

export function HaloApp() {
  const prefersReducedMotion = useReducedMotion();
  const [state, setState] = useState<HaloState>(getInitialState);
  const [hydrated, setHydrated] = useState(false);
  const [view, setView] = useState<ViewId>("home");
  const [draft, setDraft] = useState<HaloTask | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tagText, setTagText] = useState("");
  const [subtaskText, setSubtaskText] = useState("");
  const [recentHaloId, setRecentHaloId] = useState("");
  const [bannerVisible, setBannerVisible] = useState(false);
  const [sessionInterstitialShown, setSessionInterstitialShown] = useState(false);
  const [webInterstitialOpen, setWebInterstitialOpen] = useState(false);
  const [rewardOpen, setRewardOpen] = useState(false);
  const [toast, setToast] = useState("");

  const today = dateKey();
  const reducedMotion = state.reducedMotion || Boolean(prefersReducedMotion);
  const displayedStreak = visibleStreak(state.streak);
  const adFreeActive = state.adFreeUntil ? new Date(state.adFreeUntil).getTime() > Date.now() : false;

  useEffect(() => {
    registerServiceWorker();
    void initializeAdMob();
    const timer = window.setTimeout(() => setBannerVisible(true), 2400);
    loadHaloState().then((loaded) => {
      setState(loaded);
      setHydrated(true);
    });
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.body.dataset.theme = state.theme;
    document.body.dataset.reducedMotion = String(reducedMotion);
  }, [state.theme, reducedMotion]);

  useEffect(() => {
    if (!hydrated) return;
    void saveHaloState(state);
  }, [hydrated, state]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const lists = useMemo(() => {
    const names = Array.from(new Set(state.tasks.map((task) => task.list).filter(Boolean))).sort();
    return ["All", ...names];
  }, [state.tasks]);

  const activeTasks = useMemo(() => state.tasks.filter((task) => !task.completed), [state.tasks]);
  const homeTasks = useMemo(() => {
    const filtered =
      state.selectedList === "All" ? activeTasks : activeTasks.filter((task) => task.list === state.selectedList);
    return sortTasks(filtered);
  }, [activeTasks, state.selectedList]);

  const todayTasks = useMemo(() => sortTasks(state.tasks.filter((task) => isTodayTask(task, today))), [state.tasks, today]);
  const completedTasks = useMemo(
    () =>
      [...state.tasks]
        .filter((task) => task.completed)
        .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? "")),
    [state.tasks]
  );

  const visibleTasks = view === "today" ? todayTasks : view === "completed" ? completedTasks : homeTasks;
  const totalSubtasks = state.tasks.reduce((count, task) => count + task.subtasks.length, 0);
  const completedSubtasks = state.tasks.reduce(
    (count, task) => count + task.subtasks.filter((subtask) => subtask.done).length,
    0
  );
  const dueTodayTotal = state.tasks.filter((task) => !task.completed && task.dueDate === today).length;
  const overdueTotal = state.tasks.filter((task) => isOverdue(task, today)).length;
  const showBanner = view === "home" && bannerVisible && !adFreeActive;

  function announce(message: string) {
    setToast(message);
  }

  function runMilestoneConfetti(nextStreak: number) {
    if (reducedMotion || !MILESTONES.includes(nextStreak)) return;

    import("canvas-confetti")
      .then(({ default: confetti }) => {
        confetti({
          particleCount: 90,
          spread: 76,
          origin: { y: 0.7 },
          colors: ["#4F46E5", "#7C5CFC", "#10B981", "#FAFAF8"]
        });
      })
      .catch(() => undefined);
  }

  function hideBannerAroundCompletion() {
    setBannerVisible(false);
    window.setTimeout(() => setBannerVisible(true), 1550);
  }

  function completeTask(taskId: string) {
    let completedNow = false;
    let nextStreakValue = 0;
    let shouldShowInterstitial = false;

    setState((current) => {
      const target = current.tasks.find((task) => task.id === taskId);
      if (!target || target.completed) return current;

      const now = new Date().toISOString();
      const nextTasks = current.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completed: true,
              completedAt: now,
              updatedAt: now,
              subtasks: task.subtasks.map((subtask) => ({ ...subtask, done: true }))
            }
          : task
      );
      const nextStreak = advanceStreak(current.streak);
      completedNow = true;
      nextStreakValue = nextStreak.current;
      shouldShowInterstitial =
        isTodayTask(target, today) &&
        nextTasks.some((task) => task.dueDate && task.dueDate <= today) &&
        nextTasks.filter((task) => isTodayTask(task, today)).length === 0 &&
        !sessionInterstitialShown;

      return { ...current, tasks: nextTasks, streak: nextStreak };
    });

    if (!completedNow) return;

    setRecentHaloId(taskId);
    hideBannerAroundCompletion();
    void pulseCompletion();
    runMilestoneConfetti(nextStreakValue);
    window.setTimeout(() => setRecentHaloId((id) => (id === taskId ? "" : id)), 720);

    if (shouldShowInterstitial) {
      setSessionInterstitialShown(true);
      window.setTimeout(() => {
        showNativeInterstitial().then((shownNative) => {
          if (!shownNative) setWebInterstitialOpen(true);
        });
      }, 1650);
    }
  }

  function reopenTask(taskId: string) {
    setState((current) => ({
      ...current,
      tasks: current.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completed: false,
              completedAt: undefined,
              updatedAt: new Date().toISOString()
            }
          : task
      )
    }));
  }

  function deleteTask(taskId: string) {
    setState((current) => ({
      ...current,
      tasks: current.tasks.filter((task) => task.id !== taskId)
    }));
    announce("Task deleted");
  }

  function toggleExpand(taskId: string) {
    setState((current) => ({
      ...current,
      tasks: current.tasks.map((task) => (task.id === taskId ? { ...task, expanded: !task.expanded } : task))
    }));
  }

  function toggleSubtask(taskId: string, subtaskId: string) {
    let shouldCompleteParent = false;

    setState((current) => ({
      ...current,
      tasks: current.tasks.map((task) => {
        if (task.id !== taskId) return task;
        const subtasks = task.subtasks.map((subtask) =>
          subtask.id === subtaskId ? { ...subtask, done: !subtask.done } : subtask
        );
        shouldCompleteParent = !task.completed && subtasks.length > 0 && subtasks.every((subtask) => subtask.done);
        return { ...task, subtasks, updatedAt: new Date().toISOString() };
      })
    }));

    if (shouldCompleteParent) {
      window.setTimeout(() => completeTask(taskId), 120);
    }
  }

  function openCreate() {
    const next = makeEmptyTask();
    next.list = state.selectedList !== "All" ? state.selectedList : view === "today" ? "Today" : "Personal";
    next.dueDate = view === "today" ? today : next.dueDate;
    setDraft(next);
    setEditingId(null);
    setTagText("");
    setSubtaskText("");
  }

  function openEdit(task: HaloTask) {
    setDraft({ ...task, subtasks: task.subtasks.map((subtask) => ({ ...subtask })) });
    setEditingId(task.id);
    setTagText(task.tags.join(", "));
    setSubtaskText("");
  }

  function saveDraft() {
    if (!draft) return;
    const cleanTitle = draft.title.trim();
    if (!cleanTitle) {
      announce("Task title is required");
      return;
    }

    const now = new Date().toISOString();
    const savedTask: HaloTask = {
      ...draft,
      title: cleanTitle,
      notes: draft.notes.trim(),
      list: draft.list.trim() || "Personal",
      tags: normalizeTags(tagText),
      updatedAt: now
    };

    setState((current) => {
      if (editingId) {
        return {
          ...current,
          tasks: current.tasks.map((task) => (task.id === editingId ? savedTask : task))
        };
      }

      return {
        ...current,
        selectedList: current.selectedList === "All" ? current.selectedList : savedTask.list,
        tasks: [{ ...savedTask, createdAt: now }, ...current.tasks]
      };
    });

    setDraft(null);
    setEditingId(null);
    announce(editingId ? "Task updated" : "Task added");
  }

  function addDraftSubtask() {
    if (!draft || !subtaskText.trim()) return;
    setDraft({
      ...draft,
      subtasks: [...draft.subtasks, { id: createId("subtask"), title: subtaskText.trim(), done: false }]
    });
    setSubtaskText("");
  }

  function removeDraftSubtask(subtaskId: string) {
    if (!draft) return;
    setDraft({ ...draft, subtasks: draft.subtasks.filter((subtask) => subtask.id !== subtaskId) });
  }

  function setTheme(theme: ThemeId) {
    setState((current) => ({ ...current, theme }));
  }

  function setSelectedList(selectedList: string) {
    setState((current) => ({ ...current, selectedList }));
  }

  function toggleReducedMotion() {
    setState((current) => ({ ...current, reducedMotion: !current.reducedMotion }));
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `halo-backup-${dateKey()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    announce("Backup exported");
  }

  async function resetData() {
    await clearHaloState();
    setState(getInitialState());
    setSessionInterstitialShown(false);
    announce("Demo data restored");
  }

  async function claimReward() {
    await showNativeRewarded();
    const until = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    setState((current) => ({ ...current, adFreeUntil: until }));
    setRewardOpen(false);
    announce("Banner hidden for 24 hours");
  }

  return (
    <main className="halo-shell" aria-label="Halo task manager">
      <section className="app-surface">
        <header className="app-header">
          <div>
            <p className="date-label">{longDateLabel(today)}</p>
            <h1>Halo</h1>
          </div>
          <button className="streak-badge" type="button" title="Current streak">
            <Flame size={17} aria-hidden="true" />
            <span>{displayedStreak}</span>
          </button>
        </header>

        {view !== "settings" && (
          <div className="status-row" aria-label="Task summary">
            <span>{activeTasks.length} open</span>
            <span>{dueTodayTotal} today</span>
            <span>{overdueTotal} overdue</span>
          </div>
        )}

        {view === "home" && (
          <div className="list-filter" aria-label="List filter">
            {lists.map((list) => (
              <button
                className={state.selectedList === list ? "selected" : ""}
                key={list}
                type="button"
                onClick={() => setSelectedList(list)}
              >
                {list}
              </button>
            ))}
          </div>
        )}

        <section className="view-frame" aria-live="polite">
          {view === "settings" ? (
            <SettingsView
              adFreeActive={adFreeActive}
              completedSubtasks={completedSubtasks}
              onClaimReward={() => setRewardOpen(true)}
              onExport={exportData}
              onReset={resetData}
              onTheme={setTheme}
              onToggleReducedMotion={toggleReducedMotion}
              reducedMotion={state.reducedMotion}
              streak={displayedStreak}
              taskCount={state.tasks.length}
              theme={state.theme}
              totalSubtasks={totalSubtasks}
            />
          ) : (
            <TaskList
              emptyTitle={view === "completed" ? "Nothing completed yet" : view === "today" ? "Today is clear" : "List is clear"}
              onComplete={completeTask}
              onDelete={deleteTask}
              onEdit={openEdit}
              onExpand={toggleExpand}
              onReopen={reopenTask}
              onToggleSubtask={toggleSubtask}
              recentHaloId={recentHaloId}
              reducedMotion={reducedMotion}
              tasks={visibleTasks}
              view={view}
            />
          )}
        </section>

        <AnimatePresence>
          {showBanner && (
            <motion.aside
              animate={{ opacity: 1, y: 0 }}
              className="ad-banner"
              exit={{ opacity: 0, y: 18 }}
              initial={{ opacity: 0, y: 18 }}
              transition={{ duration: 0.22 }}
            >
              <ShieldCheck size={16} aria-hidden="true" />
              <span>AdMob test banner</span>
              <small>TEST</small>
            </motion.aside>
          )}
        </AnimatePresence>

        {view !== "settings" && (
          <button className="fab" type="button" onClick={openCreate} aria-label="Add task">
            <Plus size={26} aria-hidden="true" />
          </button>
        )}

        <nav className="bottom-nav" aria-label="Primary">
          {NAV_ITEMS.map(({ id, label, Icon }) => (
            <button className={view === id ? "active" : ""} key={id} type="button" onClick={() => setView(id)}>
              <Icon size={20} aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </section>

      <AnimatePresence>
        {draft && (
          <TaskEditor
            draft={draft}
            editing={Boolean(editingId)}
            onAddSubtask={addDraftSubtask}
            onChange={setDraft}
            onClose={() => setDraft(null)}
            onRemoveSubtask={removeDraftSubtask}
            onSave={saveDraft}
            setSubtaskText={setSubtaskText}
            setTagText={setTagText}
            subtaskText={subtaskText}
            tagText={tagText}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {webInterstitialOpen && (
          <AdModal
            body="All planned tasks for today are complete. This is the only moment Halo allows an interstitial test placement."
            cta="Back to Halo"
            onClose={() => setWebInterstitialOpen(false)}
            title="Interstitial test break"
          />
        )}
        {rewardOpen && (
          <AdModal
            body="Rewarded ads are opt-in. In native builds this uses the Google test rewarded unit; on web this grants the same 24-hour banner pause instantly."
            cta="Claim 24h banner pause"
            onClose={claimReward}
            title="Rewarded test ad"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="toast"
            exit={{ opacity: 0, y: 12 }}
            initial={{ opacity: 0, y: 12 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function TaskList({
  emptyTitle,
  onComplete,
  onDelete,
  onEdit,
  onExpand,
  onReopen,
  onToggleSubtask,
  recentHaloId,
  reducedMotion,
  tasks,
  view
}: {
  emptyTitle: string;
  onComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onEdit: (task: HaloTask) => void;
  onExpand: (taskId: string) => void;
  onReopen: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  recentHaloId: string;
  reducedMotion: boolean;
  tasks: HaloTask[];
  view: ViewId;
}) {
  return (
    <div className="task-list">
      <AnimatePresence initial={false} mode="popLayout">
        {tasks.length ? (
          tasks.map((task) => (
            <TaskCard
              isRecentlyCompleted={recentHaloId === task.id}
              key={task.id}
              onComplete={onComplete}
              onDelete={onDelete}
              onEdit={onEdit}
              onExpand={onExpand}
              onReopen={onReopen}
              onToggleSubtask={onToggleSubtask}
              reducedMotion={reducedMotion}
              task={task}
              view={view}
            />
          ))
        ) : (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="empty-state"
            exit={{ opacity: 0, y: -10 }}
            initial={{ opacity: 0, y: 10 }}
          >
            <CheckCircle2 size={28} aria-hidden="true" />
            <h2>{emptyTitle}</h2>
            <p>{view === "today" ? "No due or overdue tasks are waiting." : "Add a task when the next thing appears."}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TaskCard({
  isRecentlyCompleted,
  onComplete,
  onDelete,
  onEdit,
  onExpand,
  onReopen,
  onToggleSubtask,
  reducedMotion,
  task,
  view
}: {
  isRecentlyCompleted: boolean;
  onComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onEdit: (task: HaloTask) => void;
  onExpand: (taskId: string) => void;
  onReopen: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  reducedMotion: boolean;
  task: HaloTask;
  view: ViewId;
}) {
  const [dragX, setDragX] = useState(0);
  const completedSubtasks = task.subtasks.filter((subtask) => subtask.done).length;
  const handlers = useSwipeable({
    onSwiping: ({ deltaX, absX, absY }) => {
      if (task.completed) return;
      if (absY > absX) return; // User is scrolling vertically, don't drag card
      setDragX(Math.max(-92, Math.min(92, deltaX)));
    },
    onSwipedLeft: ({ absX, absY }) => {
      setDragX(0);
      if (absX > absY && absX > 45) {
        if (!task.completed) onDelete(task.id);
      }
    },
    onSwipedRight: ({ absX, absY }) => {
      setDragX(0);
      if (absX > absY && absX > 45) {
        if (!task.completed) onComplete(task.id);
      }
    },
    onTouchEndOrOnMouseUp: () => setDragX(0),
    preventScrollOnSwipe: false,
    trackMouse: true,
    delta: 12
  });

  return (
    <motion.article
      animate={{ opacity: 1, height: "auto", y: 0 }}
      className="task-shell"
      exit={{ opacity: 0, height: 0, marginBottom: 0, y: -10 }}
      initial={{ opacity: 0, y: reducedMotion ? 0 : 24 }}
      layout
      transition={reducedMotion ? { duration: 0.12 } : { type: "spring", stiffness: 300, damping: 28 }}
    >
      {!task.completed && (
        <div className="swipe-zones" aria-hidden="true" style={{ opacity: Math.min(1, Math.abs(dragX) / 72) }}>
          <span className="complete-zone">Complete</span>
          <span className="delete-zone">Delete</span>
        </div>
      )}

      <div
        {...handlers}
        className={`task-card ${task.completed ? "completed" : ""}`}
        style={{ transform: `translateX(${dragX}px)` }}
      >
        <div className="task-main">
          <button
            className={`check-button ${task.completed ? "checked" : ""}`}
            disabled={task.completed}
            type="button"
            onClick={() => onComplete(task.id)}
            aria-label={task.completed ? "Task completed" : "Mark task complete"}
          >
            <AnimatePresence>
              {isRecentlyCompleted && <motion.span className="halo-bloom" exit={{ opacity: 0 }} initial={{ opacity: 1 }} />}
            </AnimatePresence>
            {task.completed && <CheckCircle2 size={18} aria-hidden="true" />}
          </button>

          <div className="task-copy">
            <div className="task-title-row">
              <span className={`priority-dot ${task.priority}`} aria-label={`${PRIORITY_META[task.priority].label} priority`} />
              <h2>
                <span>{task.title}</span>
              </h2>
            </div>
            {task.notes && <p>{task.notes}</p>}
            <div className="task-meta">
              <span className={isOverdue(task) ? "danger" : ""}>
                <CalendarDays size={13} aria-hidden="true" />
                {task.completed && task.completedAt ? readableDate(task.completedAt.slice(0, 10)) : readableDate(task.dueDate)}
              </span>
              {task.reminderAt && (
                <span>
                  <Bell size={13} aria-hidden="true" />
                  {task.reminderAt.slice(11, 16)}
                </span>
              )}
              <span>
                <ListTodo size={13} aria-hidden="true" />
                {task.list}
              </span>
            </div>
            {task.tags.length > 0 && (
              <div className="tag-row">
                {task.tags.map((tag) => (
                  <span key={tag}>
                    <Tag size={12} aria-hidden="true" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="task-actions">
          {task.subtasks.length > 0 && (
            <button type="button" onClick={() => onExpand(task.id)} aria-label="Toggle subtasks">
              <ChevronDown className={task.expanded ? "rotate" : ""} size={18} aria-hidden="true" />
              <span>
                {completedSubtasks}/{task.subtasks.length}
              </span>
            </button>
          )}
          {task.completed ? (
            <button type="button" onClick={() => onReopen(task.id)} aria-label="Reopen task">
              <RotateCcw size={17} aria-hidden="true" />
            </button>
          ) : (
            <button type="button" onClick={() => onEdit(task)} aria-label="Edit task">
              <Pencil size={17} aria-hidden="true" />
            </button>
          )}
          {view === "completed" && (
            <button type="button" onClick={() => onDelete(task.id)} aria-label="Delete task">
              <Trash2 size={17} aria-hidden="true" />
            </button>
          )}
        </div>

        <AnimatePresence initial={false}>
          {task.expanded && task.subtasks.length > 0 && (
            <motion.div
              animate={{ opacity: 1, height: "auto" }}
              className="subtasks"
              exit={{ opacity: 0, height: 0 }}
              initial={{ opacity: 0, height: 0 }}
            >
              {task.subtasks.map((subtask) => (
                <label key={subtask.id} className={subtask.done ? "done" : ""}>
                  <input
                    checked={subtask.done}
                    disabled={task.completed}
                    onChange={() => onToggleSubtask(task.id, subtask.id)}
                    type="checkbox"
                  />
                  <span>{subtask.title}</span>
                </label>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}

function TaskEditor({
  draft,
  editing,
  onAddSubtask,
  onChange,
  onClose,
  onRemoveSubtask,
  onSave,
  setSubtaskText,
  setTagText,
  subtaskText,
  tagText
}: {
  draft: HaloTask;
  editing: boolean;
  onAddSubtask: () => void;
  onChange: (task: HaloTask) => void;
  onClose: () => void;
  onRemoveSubtask: (subtaskId: string) => void;
  onSave: () => void;
  setSubtaskText: (value: string) => void;
  setTagText: (value: string) => void;
  subtaskText: string;
  tagText: string;
}) {
  return (
    <motion.div animate={{ opacity: 1 }} className="modal-backdrop" exit={{ opacity: 0 }} initial={{ opacity: 0 }}>
      <motion.form
        animate={{ y: 0 }}
        className="task-editor"
        exit={{ y: 44 }}
        initial={{ y: 44 }}
        onSubmit={(event) => {
          event.preventDefault();
          onSave();
        }}
      >
        <div className="editor-header">
          <h2>{editing ? "Edit task" : "New task"}</h2>
          <button type="button" onClick={onClose} aria-label="Close editor">
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <label>
          <span>Title</span>
          <input
            autoFocus
            maxLength={80}
            onChange={(event) => onChange({ ...draft, title: event.target.value })}
            placeholder="What needs doing?"
            value={draft.title}
          />
        </label>

        <label>
          <span>Notes</span>
          <textarea
            maxLength={180}
            onChange={(event) => onChange({ ...draft, notes: event.target.value })}
            placeholder="Context, if useful"
            rows={3}
            value={draft.notes}
          />
        </label>

        <div className="field-grid">
          <label>
            <span>Due</span>
            <input onChange={(event) => onChange({ ...draft, dueDate: event.target.value })} type="date" value={draft.dueDate} />
          </label>
          <label>
            <span>Reminder</span>
            <input
              onChange={(event) => onChange({ ...draft, reminderAt: event.target.value })}
              type="datetime-local"
              value={draft.reminderAt}
            />
          </label>
        </div>

        <div className="field-grid">
          <label>
            <span>Priority</span>
            <select
              onChange={(event) => onChange({ ...draft, priority: event.target.value as Priority })}
              value={draft.priority}
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </label>
          <label>
            <span>List</span>
            <input
              maxLength={24}
              onChange={(event) => onChange({ ...draft, list: event.target.value })}
              value={draft.list}
            />
          </label>
        </div>

        <label>
          <span>Tags</span>
          <input onChange={(event) => setTagText(event.target.value)} placeholder="demo, launch" value={tagText} />
        </label>

        <div className="subtask-editor">
          <span>Subtasks</span>
          {draft.subtasks.map((subtask) => (
            <div className="draft-subtask" key={subtask.id}>
              <span>{subtask.title}</span>
              <button type="button" onClick={() => onRemoveSubtask(subtask.id)} aria-label="Remove subtask">
                <X size={15} aria-hidden="true" />
              </button>
            </div>
          ))}
          <div className="subtask-add">
            <input
              onChange={(event) => setSubtaskText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  onAddSubtask();
                }
              }}
              placeholder="Add subtask"
              value={subtaskText}
            />
            <button type="button" onClick={onAddSubtask}>
              <Plus size={17} aria-hidden="true" />
            </button>
          </div>
        </div>

        <button className="primary-action" type="submit">
          {editing ? "Save task" : "Add task"}
        </button>
      </motion.form>
    </motion.div>
  );
}

function SettingsView({
  adFreeActive,
  completedSubtasks,
  onClaimReward,
  onExport,
  onReset,
  onTheme,
  onToggleReducedMotion,
  reducedMotion,
  streak,
  taskCount,
  theme,
  totalSubtasks
}: {
  adFreeActive: boolean;
  completedSubtasks: number;
  onClaimReward: () => void;
  onExport: () => void;
  onReset: () => void;
  onTheme: (theme: ThemeId) => void;
  onToggleReducedMotion: () => void;
  reducedMotion: boolean;
  streak: number;
  taskCount: number;
  theme: ThemeId;
  totalSubtasks: number;
}) {
  return (
    <div className="settings-view">
      <section className="settings-section">
        <div className="section-title">
          <h2>Themes</h2>
          <span>5 built in</span>
        </div>
        <div className="theme-grid">
          {THEMES.map((option) => (
            <button
              className={theme === option.id ? "active" : ""}
              key={option.id}
              type="button"
              onClick={() => onTheme(option.id)}
            >
              <span className="theme-preview" style={{ background: option.bg }}>
                <i style={{ background: option.surface, borderColor: option.accent }} />
                <b style={{ background: option.accent }} />
              </span>
              <strong>{option.name}</strong>
              <small>{option.description}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="settings-section compact">
        <div>
          <h2>Task stats</h2>
          <p>
            {taskCount} tasks, {completedSubtasks}/{totalSubtasks || 0} subtasks, {streak} day streak
          </p>
        </div>
        <button className="icon-button" type="button" onClick={onExport} title="Export backup">
          <ShieldCheck size={19} aria-hidden="true" />
        </button>
      </section>

      <section className="settings-section compact">
        <div>
          <h2>Motion</h2>
          <p>Reduced motion keeps completion clear without the bloom burst.</p>
        </div>
        <button className={`toggle ${reducedMotion ? "on" : ""}`} type="button" onClick={onToggleReducedMotion}>
          <span />
        </button>
      </section>

      <section className="settings-section compact">
        <div>
          <h2>Rewarded test</h2>
          <p>{adFreeActive ? "Banner pause is active." : "Opt in to hide Home banner for 24 hours."}</p>
        </div>
        <button className="icon-button" type="button" onClick={onClaimReward} title="Open rewarded test ad">
          <Gift size={19} aria-hidden="true" />
        </button>
      </section>

      <section className="settings-section compact">
        <div>
          <h2>Demo data</h2>
          <p>Restore default demo tasks.</p>
        </div>
        <button className="icon-button danger" type="button" onClick={onReset} title="Reset demo data">
          <RotateCcw size={19} aria-hidden="true" />
        </button>
      </section>

      <section className="settings-section compact">
        <div>
          <h2>About Halo</h2>
          <p style={{ margin: 0, fontSize: "14px", color: "var(--muted)" }}>Version 1.0.2 · support@halotasks.app</p>
          <div style={{ display: "flex", gap: "16px", marginTop: "6px", fontSize: "13px" }}>
            <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: "600" }}>Privacy Policy</a>
            <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: "600" }}>Terms of Service</a>
          </div>
        </div>
      </section>
    </div>
  );
}

function AdModal({
  body,
  cta,
  onClose,
  title
}: {
  body: string;
  cta: string;
  onClose: () => void;
  title: string;
}) {
  return (
    <motion.div animate={{ opacity: 1 }} className="modal-backdrop" exit={{ opacity: 0 }} initial={{ opacity: 0 }}>
      <motion.div animate={{ scale: 1, y: 0 }} className="ad-modal" exit={{ scale: 0.96, y: 16 }} initial={{ scale: 0.96, y: 16 }}>
        <div className="ad-glyph">
          <Gift size={24} aria-hidden="true" />
        </div>
        <h2>{title}</h2>
        <p>{body}</p>
        <button className="primary-action" type="button" onClick={onClose}>
          {cta}
        </button>
      </motion.div>
    </motion.div>
  );
}
