/**
 * 色板系统
 *
 * 基于主色自动生成10级色阶，确保：
 * 1. 视觉一致性（遵循设计规律）
 * 2. 无障碍合规（WCAG AA级对比度）
 * 3. 暗色主题自动适配
 *
 * @author AI首席架构师
 * @version 1.0
 * @date 2025-10-03
 */
import { ColorUtils } from '@/utils/theme/colorUtils';
/**
 * 生成完整的主题色板
 * @param baseColors 基础颜色配置
 * @returns 完整的主题色板
 */
export function generateThemePalettes(baseColors) {
    return {
        primary: ColorUtils.generateColorPalette(baseColors.primary),
        success: ColorUtils.generateColorPalette(baseColors.success || '#52c41a'),
        warning: ColorUtils.generateColorPalette(baseColors.warning || '#faad14'),
        error: ColorUtils.generateColorPalette(baseColors.error || '#f5222d'),
        info: ColorUtils.generateColorPalette(baseColors.info || '#1890ff'),
        neutral: ColorUtils.generateColorPalette(baseColors.neutral || '#8c8c8c')
    };
}
/**
 * 将色板扁平化为CSS变量对象
 * @param paletteName 色板名称
 * @param palette 色板对象
 * @returns CSS变量键值对
 */
export function flattenPalette(paletteName, palette) {
    const cssVars = {};
    // 生成所有级别的CSS变量
    const levels = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
    levels.forEach(level => {
        cssVars[`--color-${paletteName}-${level}`] = palette[level];
    });
    // 默认值（映射到600级）
    cssVars[`--color-${paletteName}`] = palette.DEFAULT;
    return cssVars;
}
/**
 * 生成暗色主题色板
 * @param lightPalettes 亮色主题色板
 * @returns 暗色主题色板
 */
export function generateDarkThemePalettes(lightPalettes) {
    const darkPalettes = {};
    Object.entries(lightPalettes).forEach(([name, palette]) => {
        const paletteName = name;
        const darkPalette = {};
        // 反转色阶顺序（浅色变深色，深色变浅色）
        const levels = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
        levels.forEach((level, index) => {
            const inverseLevelIndex = levels.length - 1 - index;
            const inverseLevel = levels[inverseLevelIndex];
            if (!inverseLevel) {
                return;
            }
            // 使用暗色反转算法
            const inverseColor = palette[inverseLevel];
            if (inverseColor) {
                darkPalette[level] = ColorUtils.invertForDarkTheme(inverseColor);
            }
        });
        darkPalette.DEFAULT = darkPalette[600];
        darkPalettes[paletteName] = darkPalette;
    });
    return darkPalettes;
}
/**
 * 验证色板对比度合规性
 * @param palette 色板
 * @param background 背景色
 * @returns 对比度合规报告
 */
export function validatePaletteContrast(palette, background) {
    const levels = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
    return levels.map(level => {
        const color = palette[level];
        const contrast = ColorUtils.calculateContrast(color, background);
        return {
            level,
            color,
            contrast: Math.round(contrast * 100) / 100,
            passAA: ColorUtils.checkAccessibility(color, background, 'AA'),
            passAAA: ColorUtils.checkAccessibility(color, background, 'AAA')
        };
    });
}
/**
 * 预设主题色板（懒加载）
 */
let _presetPalettes = null;
export function getPresetPalettes() {
    if (_presetPalettes) {
        return _presetPalettes;
    }
    _presetPalettes = {
        // 简洁亮色
        light: generateThemePalettes({
            primary: '#1e3a5f',
            success: '#52c41a',
            warning: '#faad14',
            error: '#f5222d',
            info: '#1890ff',
            neutral: '#8c8c8c'
        }),
        // 优雅暗黑
        dark: generateThemePalettes({
            primary: '#4a90e2',
            success: '#73d13d',
            warning: '#ffc53d',
            error: '#ff7875',
            info: '#40a9ff',
            neutral: '#bfbfbf'
        }),
        // 科技蓝调
        blue: generateThemePalettes({
            primary: '#0066cc',
            success: '#00b96b',
            warning: '#fa8c16',
            error: '#ff4d4f',
            info: '#1890ff',
            neutral: '#8c8c8c'
        }),
        // 商务绿（新增）
        green: generateThemePalettes({
            primary: '#00a870',
            success: '#52c41a',
            warning: '#faad14',
            error: '#f5222d',
            info: '#13c2c2',
            neutral: '#8c8c8c'
        }),
        // 创意紫（新增）
        purple: generateThemePalettes({
            primary: '#7c3aed',
            success: '#52c41a',
            warning: '#faad14',
            error: '#f5222d',
            info: '#9254de',
            neutral: '#8c8c8c'
        })
    };
    return _presetPalettes;
}
/**
 * 生成CSS变量文本
 * @param palettes 主题色板
 * @returns CSS变量文本
 */
export function generateCssVariablesText(palettes) {
    const lines = [];
    Object.entries(palettes).forEach(([name, palette]) => {
        const vars = flattenPalette(name, palette);
        Object.entries(vars).forEach(([key, value]) => {
            lines.push(`  ${key}: ${value};`);
        });
    });
    return lines.join('\n');
}
// 导出常用工具函数
export { ColorUtils };
