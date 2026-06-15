export type ThemeId = "cloud" | "midnight" | "sakura" | "forest" | "sand";
export type Priority = "high" | "medium" | "low";
export type ViewId = "home" | "today" | "completed" | "settings";

export type Subtask = {
  id: string;
  title: string;
  done: boolean;
};

export type HaloTask = {
  id: string;
  title: string;
  notes: string;
  dueDate: string;
  reminderAt: string;
  priority: Priority;
  list: string;
  tags: string[];
  subtasks: Subtask[];
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  expanded: boolean;
};

export type StreakState = {
  current: number;
  lastCompletionDate: string;
  completedDates: string[];
};

export type HaloState = {
  tasks: HaloTask[];
  theme: ThemeId;
  selectedList: string;
  streak: StreakState;
  reducedMotion: boolean;
  adFreeUntil: string;
  installedAt: string;
};

export type ThemeDefinition = {
  id: ThemeId;
  name: string;
  bg: string;
  accent: string;
  surface: string;
  description: string;
};

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

export const THEMES: ThemeDefinition[] = [
  {
    id: "cloud",
    name: "Cloud",
    bg: "#FAFAF8",
    accent: "#4F46E5",
    surface: "#FFFFFF",
    description: "Warm white, indigo accent, soft borders"
  },
  {
    id: "midnight",
    name: "Midnight",
    bg: "#0F0F1A",
    accent: "#7C5CFC",
    surface: "#1A1A2E",
    description: "Near-black, violet accent, sharper cards"
  },
  {
    id: "sakura",
    name: "Sakura",
    bg: "#FFF5F7",
    accent: "#F43F5E",
    surface: "#FFFFFF",
    description: "Blush surface, rose accent, calm contrast"
  },
  {
    id: "forest",
    name: "Forest",
    bg: "#F0FDF4",
    accent: "#059669",
    surface: "#FFFFFF",
    description: "Pale green, emerald accent, fresh task rows"
  },
  {
    id: "sand",
    name: "Sand",
    bg: "#FEFCE8",
    accent: "#D97706",
    surface: "#FFFBEB",
    description: "Warm yellow, amber accent, soft focus"
  }
];

export const PRIORITY_META: Record<Priority, { label: string; rank: number; color: string }> = {
  high: { label: "High", rank: 0, color: "#EF4444" },
  medium: { label: "Medium", rank: 1, color: "#D97706" },
  low: { label: "Low", rank: 2, color: "#9CA3AF" }
};

export const AD_TEST_IDS = {
  appId: "ca-app-pub-3940256099942544~3347511713",
  banner: "ca-app-pub-3940256099942544/6300978111",
  interstitial: "ca-app-pub-3940256099942544/1033173712",
  rewarded: "ca-app-pub-3940256099942544/5224354917"
};

export function dateKey(date = new Date()) {
  const copy = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return copy.toISOString().slice(0, 10);
}

export function readableDate(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return `${MONTHS[month - 1]} ${day}`;
}

export function longDateLabel(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return `${WEEKDAYS[date.getDay()]}, ${MONTHS[month - 1]} ${day}`;
}

export function isOverdue(task: HaloTask, today = dateKey()) {
  return Boolean(task.dueDate && task.dueDate < today && !task.completed);
}

export function isTodayTask(task: HaloTask, today = dateKey()) {
  return Boolean(!task.completed && task.dueDate && task.dueDate <= today);
}

export function sortTasks(tasks: HaloTask[]) {
  return [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return Number(a.completed) - Number(b.completed);
    const priority = PRIORITY_META[a.priority].rank - PRIORITY_META[b.priority].rank;
    if (priority !== 0) return priority;
    return a.dueDate.localeCompare(b.dueDate) || b.createdAt.localeCompare(a.createdAt);
  });
}

export function visibleStreak(streak: StreakState) {
  const today = dateKey();
  const yesterday = dateKey(new Date(Date.now() - 86_400_000));
  if (streak.lastCompletionDate === today || streak.lastCompletionDate === yesterday) {
    return streak.current;
  }
  return 0;
}

export function advanceStreak(streak: StreakState): StreakState {
  const today = dateKey();
  if (streak.completedDates.includes(today)) return streak;

  const yesterday = dateKey(new Date(Date.now() - 86_400_000));
  const nextCurrent = streak.lastCompletionDate === yesterday ? streak.current + 1 : 1;
  return {
    current: nextCurrent,
    lastCompletionDate: today,
    completedDates: [...streak.completedDates, today].slice(-120)
  };
}

export function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function normalizeTags(value: string | string[]) {
  const source = Array.isArray(value) ? value : value.split(",");
  return source.map((tag) => tag.trim()).filter(Boolean).slice(0, 6);
}

export function makeEmptyTask(): HaloTask {
  const now = new Date().toISOString();
  return {
    id: createId("task"),
    title: "",
    notes: "",
    dueDate: dateKey(),
    reminderAt: "",
    priority: "medium",
    list: "Personal",
    tags: [],
    subtasks: [],
    completed: false,
    createdAt: now,
    updatedAt: now,
    expanded: false
  };
}

export function getInitialState(): HaloState {
  const today = dateKey();
  const tomorrow = dateKey(new Date(Date.now() + 86_400_000));
  const yesterday = dateKey(new Date(Date.now() - 86_400_000));
  const now = new Date().toISOString();

  return {
    theme: "cloud",
    selectedList: "All",
    reducedMotion: false,
    adFreeUntil: "",
    installedAt: now,
    streak: {
      current: 0,
      lastCompletionDate: "",
      completedDates: []
    },
    tasks: [
      {
        id: "task-demo-portfolio",
        title: "Prep for design portfolio review",
        notes: "Focus on presenting the case study for the mobile app redesign. Keep the pitch concise.",
        dueDate: today,
        reminderAt: `${today}T10:00`,
        priority: "high",
        list: "Work",
        tags: ["design", "presentation"],
        subtasks: [
          { id: "sub-demo-1", title: "Select top 3 project screens", done: true },
          { id: "sub-demo-2", title: "Write the 2-minute project summary", done: false },
          { id: "sub-demo-3", title: "Export high-res prototype video", done: false }
        ],
        completed: false,
        createdAt: now,
        updatedAt: now,
        expanded: true
      },
      {
        id: "task-demo-groceries",
        title: "Weekly grocery run",
        notes: "Pick up fresh ingredients for dinner prep. Try the new organic store nearby.",
        dueDate: today,
        reminderAt: "",
        priority: "medium",
        list: "Personal",
        tags: ["errand", "health"],
        subtasks: [
          { id: "sub-grocery-1", title: "Organic spinach & berries", done: false },
          { id: "sub-grocery-2", title: "Almond milk", done: false },
          { id: "sub-grocery-3", title: "Salmon fillets", done: false }
        ],
        completed: false,
        createdAt: now,
        updatedAt: now,
        expanded: false
      },
      {
        id: "task-demo-workout",
        title: "Evening cardio & mobility flow",
        notes: "30 mins light run followed by a full-body stretching session.",
        dueDate: today,
        reminderAt: "",
        priority: "low",
        list: "Wellness",
        tags: ["fitness"],
        subtasks: [],
        completed: false,
        createdAt: now,
        updatedAt: now,
        expanded: false
      },
      {
        id: "task-demo-habits",
        title: "Read next chapter of Atomic Habits",
        notes: "Chapter 4: The man who didn't look right. Take quick notes on implementation intentions.",
        dueDate: tomorrow,
        reminderAt: "",
        priority: "medium",
        list: "Personal",
        tags: ["learning", "habits"],
        subtasks: [],
        completed: false,
        createdAt: now,
        updatedAt: now,
        expanded: false
      },
      {
        id: "task-demo-subscription",
        title: "Submit monthly subscription cancellation",
        notes: "Cancel the streaming service trial before it auto-renews.",
        dueDate: yesterday,
        reminderAt: "",
        priority: "high",
        list: "Finance",
        tags: ["admin"],
        subtasks: [],
        completed: false,
        createdAt: now,
        updatedAt: now,
        expanded: false
      }
    ]
  };
}
