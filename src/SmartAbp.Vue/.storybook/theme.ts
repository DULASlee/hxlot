/**
 * Storybook Custom Theme Configuration
 * Advanced UI Component Library - Phase 3 Week 4
 * Custom branding and styling for Storybook interface
 */

import { create } from "storybook/theming/create"

// Brand colors
const brandColors = {
  primary: "#409EFF",
  secondary: "#67C23A",
  success: "#67C23A",
  warning: "#E6A23C",
  danger: "#F56C6C",
  info: "#909399",

  // Neutral colors
  white: "#FFFFFF",
  black: "#000000",
  gray: {
    50: "#FAFAFA",
    100: "#F5F5F5",
    200: "#EBEEF5",
    300: "#E4E7ED",
    400: "#DCDFE6",
    500: "#C0C4CC",
    600: "#909399",
    700: "#606266",
    800: "#303133",
    900: "#1D1E1F",
  },
}

// Light theme
export const lightTheme = create({
  base: "light",

  // Brand
  brandTitle: "Advanced UI Components",
  brandUrl: "/",
  brandImage: "/logo.svg",
  brandTarget: "_self",

  // Colors
  colorPrimary: brandColors.primary,
  colorSecondary: brandColors.secondary,

  // UI colors
  appBg: brandColors.white,
  appContentBg: brandColors.white,
  appBorderColor: brandColors.gray[300],
  appBorderRadius: 8,

  // Text colors
  textColor: brandColors.gray[800],
  textInverseColor: brandColors.white,
  textMutedColor: brandColors.gray[600],

  // Toolbar colors
  barTextColor: brandColors.gray[700],
  barSelectedColor: brandColors.primary,
  barBg: brandColors.gray[50],

  // Form colors
  inputBg: brandColors.white,
  inputBorder: brandColors.gray[300],
  inputTextColor: brandColors.gray[800],
  inputBorderRadius: 4,

  // Button colors
  buttonBg: brandColors.primary,
  buttonBorder: brandColors.primary,

  // Typography
  fontBase: '"Helvetica Neue", Helvetica, Arial, "Microsoft YaHei", "微软雅黑", SimSun, sans-serif',
  fontCode: 'Monaco, Menlo, "Ubuntu Mono", Consolas, source-code-pro, monospace',
})

// Dark theme
export const darkTheme = create({
  base: "dark",

  // Brand
  brandTitle: "Advanced UI Components",
  brandUrl: "/",
  brandImage: "/logo-dark.svg",
  brandTarget: "_self",

  // Colors
  colorPrimary: brandColors.primary,
  colorSecondary: brandColors.secondary,

  // UI colors
  appBg: brandColors.gray[900],
  appContentBg: brandColors.gray[800],
  appBorderColor: brandColors.gray[600],
  appBorderRadius: 8,

  // Text colors
  textColor: brandColors.gray[200],
  textInverseColor: brandColors.gray[800],
  textMutedColor: brandColors.gray[400],

  // Toolbar colors
  barTextColor: brandColors.gray[300],
  barSelectedColor: brandColors.primary,
  barBg: brandColors.gray[800],

  // Form colors
  inputBg: brandColors.gray[700],
  inputBorder: brandColors.gray[600],
  inputTextColor: brandColors.gray[200],
  inputBorderRadius: 4,

  // Button colors
  buttonBg: brandColors.primary,
  buttonBorder: brandColors.primary,

  // Typography
  fontBase: '"Helvetica Neue", Helvetica, Arial, "Microsoft YaHei", "微软雅黑", SimSun, sans-serif',
  fontCode: 'Monaco, Menlo, "Ubuntu Mono", Consolas, source-code-pro, monospace',
})

export default lightTheme
