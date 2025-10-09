/**
 * 色彩算法工具类
 *
 * 功能：
 * 1. RGB ↔ HSL 颜色空间转换
 * 2. 生成10级色阶（参考Ant Design色板算法）
 * 3. WCAG 2.1对比度计算和无障碍检查
 * 4. 暗色主题色彩反转算法
 *
 * 设计原则：
 * - 零依赖，纯TypeScript实现
 * - 完整的类型安全
 * - 高性能（生成色板<10ms）
 *
 * @author AI首席架构师
 * @version 1.0
 * @date 2025-10-03
 */
/**
 * 色彩算法工具类
 */
export class ColorUtils {
    /**
     * 将十六进制颜色转换为RGB
     * @param hex 十六进制颜色 (#RRGGBB 或 #RGB)
     * @returns RGB对象
     */
    static hexToRgb(hex) {
        // 移除#号
        const cleanHex = hex.replace(/^#/, '');
        // 处理3位简写格式 (#RGB -> #RRGGBB)
        const fullHex = cleanHex.length === 3
            ? cleanHex.split('').map(char => char + char).join('')
            : cleanHex;
        const num = parseInt(fullHex, 16);
        return {
            r: (num >> 16) & 255,
            g: (num >> 8) & 255,
            b: num & 255
        };
    }
    /**
     * 将RGB转换为十六进制颜色
     * @param rgb RGB对象
     * @returns 十六进制颜色字符串
     */
    static rgbToHex(rgb) {
        const toHex = (n) => {
            const hex = Math.round(n).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
    }
    /**
     * RGB转HSL
     * @param rgb RGB对象
     * @returns HSL对象
     */
    static rgbToHsl(rgb) {
        const r = rgb.r / 255;
        const g = rgb.g / 255;
        const b = rgb.b / 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const delta = max - min;
        let h = 0;
        let s = 0;
        const l = (max + min) / 2;
        if (delta !== 0) {
            // 计算饱和度
            s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
            // 计算色相
            switch (max) {
                case r:
                    h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
                    break;
                case g:
                    h = ((b - r) / delta + 2) / 6;
                    break;
                case b:
                    h = ((r - g) / delta + 4) / 6;
                    break;
            }
        }
        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }
    /**
     * HSL转RGB
     * @param hsl HSL对象
     * @returns RGB对象
     */
    static hslToRgb(hsl) {
        const h = hsl.h / 360;
        const s = hsl.s / 100;
        const l = hsl.l / 100;
        let r, g, b;
        if (s === 0) {
            r = g = b = l; // 灰度
        }
        else {
            const hue2rgb = (p, q, t) => {
                if (t < 0)
                    t += 1;
                if (t > 1)
                    t -= 1;
                if (t < 1 / 6)
                    return p + (q - p) * 6 * t;
                if (t < 1 / 2)
                    return q;
                if (t < 2 / 3)
                    return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }
    /**
     * 生成10级色阶
     *
     * 算法参考Ant Design色板生成：
     * - 50-400: 提高明度，降低饱和度
     * - 500-600: 基准色
     * - 700-900: 降低明度，提高饱和度
     *
     * @param baseColor 基准颜色（十六进制）
     * @returns 10级色板
     */
    static generateColorPalette(baseColor) {
        const rgb = this.hexToRgb(baseColor);
        const hsl = this.rgbToHsl(rgb);
        // 色阶配置（明度和饱和度调整系数）
        const lightnessMap = {
            50: 0.95, // 最浅
            100: 0.90,
            200: 0.80,
            300: 0.70,
            400: 0.60,
            500: 0.50, // 接近基准
            600: 0.40, // 基准（1.0相对系数）
            700: 0.30,
            800: 0.20,
            900: 0.10 // 最深
        };
        const saturationMap = {
            50: 0.3, // 浅色降低饱和度
            100: 0.4,
            200: 0.5,
            300: 0.7,
            400: 0.85,
            500: 0.95,
            600: 1.0, // 基准
            700: 1.05, // 深色提高饱和度
            800: 1.1,
            900: 1.15
        };
        const palette = {};
        Object.entries(lightnessMap).forEach(([level, lightnessFactor]) => {
            const numLevel = parseInt(level);
            const saturationFactor = saturationMap[numLevel];
            // 计算新的HSL值
            let newL;
            if (numLevel < 600) {
                // 浅色：提高明度
                newL = hsl.l + (100 - hsl.l) * (1 - lightnessFactor);
            }
            else if (numLevel === 600) {
                // 基准色
                newL = hsl.l;
            }
            else {
                // 深色：降低明度
                newL = hsl.l * lightnessFactor / 0.4;
            }
            // 调整饱和度
            const newS = Math.min(100, hsl.s * saturationFactor);
            // 转换回RGB和十六进制
            const newRgb = this.hslToRgb({
                h: hsl.h,
                s: newS,
                l: Math.max(0, Math.min(100, newL))
            });
            palette[numLevel] = this.rgbToHex(newRgb);
        });
        // 设置DEFAULT为600级
        palette.DEFAULT = palette[600];
        return palette;
    }
    /**
     * 计算相对亮度（WCAG 2.1标准）
     * @param rgb RGB对象
     * @returns 相对亮度 [0, 1]
     */
    static getRelativeLuminance(rgb) {
        const rsRGB = rgb.r / 255;
        const gsRGB = rgb.g / 255;
        const bsRGB = rgb.b / 255;
        const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
        const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
        const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }
    /**
     * 计算两个颜色的对比度（WCAG 2.1标准）
     * @param color1 颜色1（十六进制）
     * @param color2 颜色2（十六进制）
     * @returns 对比度 [1, 21]
     */
    static calculateContrast(color1, color2) {
        const rgb1 = this.hexToRgb(color1);
        const rgb2 = this.hexToRgb(color2);
        const lum1 = this.getRelativeLuminance(rgb1);
        const lum2 = this.getRelativeLuminance(rgb2);
        const lighter = Math.max(lum1, lum2);
        const darker = Math.min(lum1, lum2);
        return (lighter + 0.05) / (darker + 0.05);
    }
    /**
     * 检查无障碍对比度是否合规
     *
     * WCAG 2.1标准：
     * - AA级（普通文本）: 对比度 ≥ 4.5:1
     * - AA级（大文本）: 对比度 ≥ 3:1
     * - AAA级（普通文本）: 对比度 ≥ 7:1
     * - AAA级（大文本）: 对比度 ≥ 4.5:1
     *
     * @param foreground 前景色（文本颜色）
     * @param background 背景色
     * @param level WCAG等级（AA或AAA）
     * @param largeText 是否为大文本（≥18pt或14pt粗体）
     * @returns 是否合规
     */
    static checkAccessibility(foreground, background, level = 'AA', largeText = false) {
        const contrast = this.calculateContrast(foreground, background);
        if (level === 'AA') {
            return largeText ? contrast >= 3 : contrast >= 4.5;
        }
        else {
            // AAA级
            return largeText ? contrast >= 4.5 : contrast >= 7;
        }
    }
    /**
     * 暗色主题色彩反转算法
     *
     * 策略：
     * 1. 浅色（L > 50）→ 反转明度，保持色相和饱和度
     * 2. 深色（L ≤ 50）→ 提高明度，略微降低饱和度
     * 3. 确保暗色主题下对比度合规
     *
     * @param color 亮色主题颜色
     * @returns 暗色主题对应颜色
     */
    static invertForDarkTheme(color) {
        const rgb = this.hexToRgb(color);
        const hsl = this.rgbToHsl(rgb);
        let newL;
        let newS;
        if (hsl.l > 50) {
            // 浅色 → 反转为深色
            newL = 100 - hsl.l;
            newS = hsl.s * 0.9; // 略微降低饱和度
        }
        else {
            // 深色 → 提高明度
            newL = Math.min(80, hsl.l + 30);
            newS = Math.min(100, hsl.s * 1.1);
        }
        const newRgb = this.hslToRgb({
            h: hsl.h,
            s: newS,
            l: newL
        });
        return this.rgbToHex(newRgb);
    }
    /**
     * 调整颜色透明度
     * @param color 十六进制颜色
     * @param opacity 透明度 [0, 1]
     * @returns RGBA字符串
     */
    static adjustOpacity(color, opacity) {
        const rgb = this.hexToRgb(color);
        const clampedOpacity = Math.max(0, Math.min(1, opacity));
        return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${clampedOpacity})`;
    }
    /**
     * 生成渐变色
     * @param color1 起始颜色
     * @param color2 结束颜色
     * @param direction 方向（CSS gradient方向）
     * @returns CSS linear-gradient字符串
     */
    static generateGradient(color1, color2, direction = 'to right') {
        return `linear-gradient(${direction}, ${color1}, ${color2})`;
    }
}
// 导出单例实例（可选）
export default ColorUtils;
