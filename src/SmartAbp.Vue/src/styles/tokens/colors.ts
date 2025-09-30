/**
 * Design Tokens - 颜色系统
 */

export interface ColorTokens {
  // 主色
  primary: {
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string // 主色
    600: string
    700: string
    800: string
    900: string
  }
  
  // 成功色
  success: {
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string // 主色
    600: string
    700: string
    800: string
    900: string
  }
  
  // 警告色
  warning: {
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string // 主色
    600: string
    700: string
    800: string
    900: string
  }
  
  // 危险色
  danger: {
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string // 主色
    600: string
    700: string
    800: string
    900: string
  }
  
  // 信息色
  info: {
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string // 主色
    600: string
    700: string
    800: string
    900: string
  }
  
  // 中性色
  gray: {
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string
    600: string
    700: string
    800: string
    900: string
  }
  
  // 文本色
  text: {
    primary: string
    secondary: string
    tertiary: string
    disabled: string
    inverse: string
  }
  
  // 背景色
  background: {
    primary: string
    secondary: string
    tertiary: string
    inverse: string
  }
  
  // 边框色
  border: {
    light: string
    base: string
    dark: string
  }
}

/**
 * 浅色主题颜色
 */
export const lightColors: ColorTokens = {
  primary: {
    50: '#e3f2fd',
    100: '#bbdefb',
    200: '#90caf9',
    300: '#64b5f6',
    400: '#42a5f5',
    500: '#409eff', // Element Plus primary
    600: '#1e88e5',
    700: '#1976d2',
    800: '#1565c0',
    900: '#0d47a1'
  },
  
  success: {
    50: '#e8f5e9',
    100: '#c8e6c9',
    200: '#a5d6a7',
    300: '#81c784',
    400: '#66bb6a',
    500: '#67c23a', // Element Plus success
    600: '#43a047',
    700: '#388e3c',
    800: '#2e7d32',
    900: '#1b5e20'
  },
  
  warning: {
    50: '#fff3e0',
    100: '#ffe0b2',
    200: '#ffcc80',
    300: '#ffb74d',
    400: '#ffa726',
    500: '#e6a23c', // Element Plus warning
    600: '#fb8c00',
    700: '#f57c00',
    800: '#ef6c00',
    900: '#e65100'
  },
  
  danger: {
    50: '#ffebee',
    100: '#ffcdd2',
    200: '#ef9a9a',
    300: '#e57373',
    400: '#ef5350',
    500: '#f56c6c', // Element Plus danger
    600: '#e53935',
    700: '#d32f2f',
    800: '#c62828',
    900: '#b71c1c'
  },
  
  info: {
    50: '#f5f5f5',
    100: '#eeeeee',
    200: '#e0e0e0',
    300: '#bdbdbd',
    400: '#9e9e9e',
    500: '#909399', // Element Plus info
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121'
  },
  
  gray: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121'
  },
  
  text: {
    primary: '#303133',
    secondary: '#606266',
    tertiary: '#909399',
    disabled: '#c0c4cc',
    inverse: '#ffffff'
  },
  
  background: {
    primary: '#ffffff',
    secondary: '#f5f7fa',
    tertiary: '#e4e7ed',
    inverse: '#303133'
  },
  
  border: {
    light: '#e4e7ed',
    base: '#dcdfe6',
    dark: '#c0c4cc'
  }
}

/**
 * 深色主题颜色
 */
export const darkColors: ColorTokens = {
  primary: {
    50: '#0d47a1',
    100: '#1565c0',
    200: '#1976d2',
    300: '#1e88e5',
    400: '#2196f3',
    500: '#409eff',
    600: '#42a5f5',
    700: '#64b5f6',
    800: '#90caf9',
    900: '#bbdefb'
  },
  
  success: {
    50: '#1b5e20',
    100: '#2e7d32',
    200: '#388e3c',
    300: '#43a047',
    400: '#4caf50',
    500: '#67c23a',
    600: '#66bb6a',
    700: '#81c784',
    800: '#a5d6a7',
    900: '#c8e6c9'
  },
  
  warning: {
    50: '#e65100',
    100: '#ef6c00',
    200: '#f57c00',
    300: '#fb8c00',
    400: '#ff9800',
    500: '#e6a23c',
    600: '#ffa726',
    700: '#ffb74d',
    800: '#ffcc80',
    900: '#ffe0b2'
  },
  
  danger: {
    50: '#b71c1c',
    100: '#c62828',
    200: '#d32f2f',
    300: '#e53935',
    400: '#f44336',
    500: '#f56c6c',
    600: '#ef5350',
    700: '#e57373',
    800: '#ef9a9a',
    900: '#ffcdd2'
  },
  
  info: {
    50: '#212121',
    100: '#424242',
    200: '#616161',
    300: '#757575',
    400: '#9e9e9e',
    500: '#909399',
    600: '#bdbdbd',
    700: '#e0e0e0',
    800: '#eeeeee',
    900: '#f5f5f5'
  },
  
  gray: {
    50: '#212121',
    100: '#424242',
    200: '#616161',
    300: '#757575',
    400: '#9e9e9e',
    500: '#bdbdbd',
    600: '#e0e0e0',
    700: '#eeeeee',
    800: '#f5f5f5',
    900: '#fafafa'
  },
  
  text: {
    primary: '#e4e7ed',
    secondary: '#c0c4cc',
    tertiary: '#909399',
    disabled: '#606266',
    inverse: '#303133'
  },
  
  background: {
    primary: '#1a1a1a',
    secondary: '#242424',
    tertiary: '#2e2e2e',
    inverse: '#ffffff'
  },
  
  border: {
    light: '#3a3a3a',
    base: '#4a4a4a',
    dark: '#5a5a5a'
  }
}
