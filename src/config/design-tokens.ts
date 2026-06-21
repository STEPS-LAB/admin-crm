/** Design tokens aligned with docs/06-design-system.md */
export const designTokens = {
  layout: {
    maxWidth: 1600,
    sidebarCollapsed: 72,
    sidebarExpanded: 280,
    headerHeight: 64,
  },
  radius: {
    sm: 6,
    md: 8,
    lg: 10,
    xl: 12,
  },
  spacing: [4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96] as const,
  typography: {
    caption: "text-xs", // 12px
    small: "text-sm", // 14px
    body: "text-base", // 16px
    section: "text-lg", // 18px
    page: "text-2xl", // 24px
    dashboard: "text-[2rem] leading-tight", // 32px
  },
  iconSize: {
    sm: 16,
    md: 18,
    lg: 20,
    xl: 24,
  },
} as const;

export type DesignTokens = typeof designTokens;
