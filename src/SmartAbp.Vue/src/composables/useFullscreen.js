/**
 * 全屏功能组合式函数
 * 提供进入/退出全屏的功能
 */
import { ref, onMounted, onUnmounted } from 'vue';
/**
 * 全屏功能Composable
 */
export function useFullscreen() {
    const isFullscreen = ref(false);
    const fullscreenElement = ref(null);
    /**
     * 进入全屏模式
     */
    const enterFullscreen = async (element) => {
        try {
            const targetElement = (element ||
                fullscreenElement.value ||
                document.documentElement);
            if (targetElement.requestFullscreen) {
                await targetElement.requestFullscreen();
            }
            else if (targetElement.webkitRequestFullscreen) {
                await targetElement.webkitRequestFullscreen();
            }
            else if (targetElement.msRequestFullscreen) {
                await targetElement.msRequestFullscreen();
            }
            else if (targetElement.mozRequestFullScreen) {
                await targetElement.mozRequestFullScreen();
            }
            isFullscreen.value = true;
        }
        catch (error) {
            console.error('进入全屏失败:', error);
        }
    };
    /**
     * 退出全屏模式
     */
    const exitFullscreen = async () => {
        try {
            const doc = document;
            if (document.exitFullscreen) {
                await document.exitFullscreen();
            }
            else if (doc.webkitExitFullscreen) {
                await doc.webkitExitFullscreen();
            }
            else if (doc.msExitFullscreen) {
                await doc.msExitFullscreen();
            }
            else if (doc.mozCancelFullScreen) {
                await doc.mozCancelFullScreen();
            }
            isFullscreen.value = false;
        }
        catch (error) {
            console.error('退出全屏失败:', error);
        }
    };
    /**
     * 切换全屏状态
     */
    const toggleFullscreen = async (element) => {
        if (isFullscreen.value) {
            await exitFullscreen();
        }
        else {
            await enterFullscreen(element);
        }
    };
    /**
     * 监听全屏状态变化
     */
    const handleFullscreenChange = () => {
        const doc = document;
        const fullscreenEl = document.fullscreenElement ||
            doc.webkitFullscreenElement ||
            doc.msFullscreenElement ||
            doc.mozFullScreenElement;
        isFullscreen.value = !!fullscreenEl;
    };
    /**
     * 设置全屏目标元素
     */
    const setFullscreenElement = (element) => {
        fullscreenElement.value = element;
    };
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 生命周期钩子
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    onMounted(() => {
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('msfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    });
    onUnmounted(() => {
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.removeEventListener('msfullscreenchange', handleFullscreenChange);
        document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
    });
    return {
        isFullscreen,
        enterFullscreen,
        exitFullscreen,
        toggleFullscreen,
        setFullscreenElement
    };
}
