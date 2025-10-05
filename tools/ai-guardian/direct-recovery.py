#!/usr/bin/env python3
"""
智能AI恢复守护 - 避免无限循环的"请继续"输入
智能检测对话框并实现三级恢复策略
"""

import time
import json
import os
from datetime import datetime

try:
    import pyautogui
    import pygetwindow as gw
    print("✅ UI自动化可用")
except ImportError:
    print("❌ 请安装: pip install pyautogui pygetwindow")
    exit(1)

class SmartAIGuardian:
    """智能AI恢复守护"""
    
    def __init__(self):
        self.recovery_attempts = 0
        self.max_attempts_per_phase = 3
        self.wait_time = 15  # 等待15秒检测连接
        
    def find_cursor(self):
        """查找Cursor窗口"""
        for title in ['Cursor', 'Visual Studio Code']:
            windows = gw.getWindowsWithTitle(title)
            if windows:
                return windows[0]
        return None
    
    def close_dialogs_and_modals(self):
        """尝试关闭可能弹出的对话框或模态框"""
        try:
            # 尝试按ESC键关闭对话框
            pyautogui.press('esc')
            time.sleep(0.5)
            
            # 尝试按ESC键再次确保
            pyautogui.press('esc')
            time.sleep(0.5)
            
            print("✅ 已尝试关闭对话框")
            return True
        except Exception as e:
            print(f"❌ 关闭对话框失败: {e}")
            return False
    
    def is_ai_connected(self):
        """检测AI是否已连接（简化版检测）"""
        # 这里可以扩展为更复杂的检测逻辑
        # 目前使用简单的文件状态检测
        state_file = '.ai-engine/ai-state.json'
        if os.path.exists(state_file):
            try:
                with open(state_file, 'r') as f:
                    state = json.load(f)
                last_activity = state.get('lastActivity', 0)
                inactive_sec = (time.time() * 1000 - last_activity) / 1000
                return inactive_sec < 30  # 30秒内有活动认为已连接
            except:
                return False
        return False
    
    def smart_send_continue(self, phase=1):
        """智能发送"请继续" - 包含对话框检测和等待机制"""
        cursor = self.find_cursor()
        if not cursor:
            print("❌ 未找到Cursor窗口")
            return False
        
        try:
            print(f"🎯 找到窗口: {cursor.title}")
            
            # 激活窗口
            cursor.activate()
            time.sleep(0.5)
            
            # 阶段1：尝试关闭对话框
            self.close_dialogs_and_modals()
            
            # 阶段2：打开新会话（如果是第2阶段）
            if phase == 2:
                print("🔄 尝试新会话恢复...")
                pyautogui.hotkey('ctrl', 'l')  # 打开新聊天
                time.sleep(1)
            else:
                # 阶段1：使用当前聊天框
                pyautogui.hotkey('ctrl', 'l')
                time.sleep(0.8)
            
            # 清空并输入
            pyautogui.hotkey('ctrl', 'a')
            time.sleep(0.2)
            
            pyautogui.write('请继续', interval=0.1)
            time.sleep(0.5)
            
            # 发送
            pyautogui.press('enter')
            
            print(f"✅ 已发送'请继续' (阶段{phase})")
            return True
            
        except Exception as e:
            print(f"❌ 发送失败: {e}")
            return False
    
    def wait_for_ai_connection(self, attempt_num):
        """等待AI连接，返回是否连接成功"""
        print(f"⏳ 等待AI连接... (尝试 {attempt_num})")
        
        for i in range(self.wait_time):
            time.sleep(1)
            if self.is_ai_connected():
                print("✅ AI连接成功！")
                return True
        
        print("❌ AI连接超时")
        return False
    
    def recovery_phase_1(self):
        """第一阶段恢复：在当前会话中尝试"""
        print("🔄 第一阶段恢复：当前会话")
        
        for attempt in range(1, self.max_attempts_per_phase + 1):
            print(f"🔄 尝试 {attempt}/{self.max_attempts_per_phase}")
            
            if self.smart_send_continue(phase=1):
                if self.wait_for_ai_connection(attempt):
                    return True  # 连接成功
            
            # 等待一段时间再重试
            if attempt < self.max_attempts_per_phase:
                time.sleep(5)
        
        return False
    
    def recovery_phase_2(self):
        """第二阶段恢复：开启新会话尝试"""
        print("🔄 第二阶段恢复：新会话")
        
        for attempt in range(1, self.max_attempts_per_phase + 1):
            print(f"🔄 新会话尝试 {attempt}/{self.max_attempts_per_phase}")
            
            if self.smart_send_continue(phase=2):
                if self.wait_for_ai_connection(attempt):
                    return True  # 连接成功
            
            # 等待一段时间再重试
            if attempt < self.max_attempts_per_phase:
                time.sleep(5)
        
        return False
    
    def smart_recovery(self):
        """智能恢复策略"""
        print("🤖 启动智能恢复策略")
        
        # 第一阶段恢复
        if self.recovery_phase_1():
            print("✅ 第一阶段恢复成功")
            return True
        
        # 第二阶段恢复
        if self.recovery_phase_2():
            print("✅ 第二阶段恢复成功")
            return True
        
        # 所有恢复尝试都失败
        print("⚠️ 所有恢复尝试失败，需要人工干预")
        return False

def main():
    """主入口"""
    print("🤖 智能AI恢复守护启动")
    print("🎯 避免无限循环，实现智能恢复")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    
    guardian = SmartAIGuardian()
    
    # 检查是否需要恢复
    if not guardian.is_ai_connected():
        print("⚠️ AI连接断开，开始智能恢复...")
        guardian.smart_recovery()
    else:
        print("💚 AI连接正常")

if __name__ == '__main__':
    main()
