import {
  User,
  Brain,
  Loader2,
  MessageSquare,
  Moon,
  SunMedium,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronsUpDown,
  Plus,
  Trash,
  Pencil,
  AlertCircle,
  Sparkles,
  Database,
  History,
  Send,
  Wrench,
  Rocket,
  LayoutDashboard,
  Shield,
  Zap,
  LogOut,
  Mail,
  Lock,
  Github,
} from "lucide-react";
import type { LucideProps, LucideIcon } from "lucide-react";

export type Icon = LucideIcon;

export const Icons = {
  user: User,
  brain: Brain,
  spinner: Loader2,
  message: MessageSquare,
  moon: Moon,
  sun: SunMedium,
  settings: Settings,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  chevronDown: ChevronDown,
  chevronsUpDown: ChevronsUpDown,
  plus: Plus,
  trash: Trash,
  pencil: Pencil,
  alertCircle: AlertCircle,
  sparkles: Sparkles,
  database: Database,
  history: History,
  send: Send,
  tool: Wrench,
  rocket: Rocket,
  dashboard: LayoutDashboard,
  shield: Shield,
  zap: Zap,
  logOut: LogOut,
  mail: Mail,
  lock: Lock,
  gitHub: Github,
  google: ({ ...props }: LucideProps) => (
    <svg
      aria-hidden="true"
      focusable="false"
      data-prefix="fab"
      data-icon="google"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 488 512"
      {...props}
    >
      <path
        fill="currentColor"
        d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
      ></path>
    </svg>
  ),
};
