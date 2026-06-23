import type { AdminLocale } from "@/types/admin-locale";

export type AdminMessageKey =
  | "header.language"
  | "header.toggleTheme"
  | "header.theme.light"
  | "header.theme.dark"
  | "header.theme.system"
  | "header.userMenu"
  | "header.profile"
  | "header.signOut"
  | "header.openNavigation"
  | "header.expandSidebar"
  | "header.collapseSidebar";

const MESSAGES: Record<AdminLocale, Record<AdminMessageKey, string>> = {
  uk: {
    "header.language": "Мова",
    "header.toggleTheme": "Змінити тему",
    "header.theme.light": "Світла",
    "header.theme.dark": "Темна",
    "header.theme.system": "Системна",
    "header.userMenu": "Меню користувача",
    "header.profile": "Профіль",
    "header.signOut": "Вийти",
    "header.openNavigation": "Відкрити меню навігації",
    "header.expandSidebar": "Розгорнути бічну панель",
    "header.collapseSidebar": "Згорнути бічну панель",
  },
  en: {
    "header.language": "Language",
    "header.toggleTheme": "Toggle theme",
    "header.theme.light": "Light",
    "header.theme.dark": "Dark",
    "header.theme.system": "System",
    "header.userMenu": "User menu",
    "header.profile": "Profile",
    "header.signOut": "Sign out",
    "header.openNavigation": "Open navigation menu",
    "header.expandSidebar": "Expand sidebar",
    "header.collapseSidebar": "Collapse sidebar",
  },
};

export function getAdminMessage(locale: AdminLocale, key: AdminMessageKey): string {
  return MESSAGES[locale][key];
}
