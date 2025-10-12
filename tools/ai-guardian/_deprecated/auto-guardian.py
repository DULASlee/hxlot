#!/usr/bin/env python3
"""
真正的AI大模型自动守护 - 无需人工干预
自动检测断线并发送恢复指令到Cursor聊天框
"""

import os
import sys
import time
import json
import psutil
import subprocess
from datetime import datetime
from pathlib import Path

try:
    import pyautogui
    import pygetwindow as gw
    UI_AUTOMATION_AVAILABLE = True
except ImportError:
    print("⚠️ 安装UI自动化依赖: pip install pyautogui pygetwindow")
    UI_AUTOMATION_AVAILABLE = False

class AutoAIGuardian:
    """完全自动化的AI守护"""
    
    def __init__(self):
        self.project_root = os.getcwd()
        self.checkpoint_dir = os.path.join(self.project_root, '.ai-engine')
        self.state_file = os.path.join(self.checkpoint_dir, 'ai-state.json')
        
        # 自动化配置
        self.check_interval = 15  # 15秒检查一次
        self.offline_threshold = 60  # 60秒无活动判断为离线
        self.recovery_attempts = 0
        self.max_recovery_attempts = 5
        
        os.makedirs(self.checkpoint_dir, exist_ok=True)
        
        print("🤖 AI大模型自动守护已启动")
        print("🎯 完全自动化 - 无需人工干预")
        
    def find_cursor_window(self):
        """查找Cursor窗口"""
        try:
            windows = gw.getWindowsWithTitle('Cursor')
            if windows:
                return windows[0]
            
            # 尝试其他可能的窗口标题
            for title in ['Cursor', 'Visual Studio Code', 'Code']:
                windows = gw.getWindowsWithTitle(title)
                if windows:
                    return windows[0]
            return None
        except Exception as e:
            print(f"❌ 查找窗口失败: {e}")
            return None
    
    def is_ai_offline(self):
        """检测AI是否离线"""
        if not os.path.exists(self.state_file):
            return False
            
        try:
            with open(self.state_file, 'r') as f:
                state = json.load(f)
            
            last_activity = state.get('lastActivity', time.time() * 1000)
            inactive_duration = (time.time() * 1000 - last_activity) / 1000
            
            return inactive_duration > self.offline_threshold
        except:
            return False
    
    def auto_send_recovery(self):
        """自动发送恢复指令到Cursor聊天框"""
        if not UI_AUTOMATION_AVAILABLE:
            print("❌ UI自动化不可用")
            return False
        
        try:
            # 1. 找到Cursor窗口
            cursor_window = self.find_cursor_window()
            if not cursor_window:
                print("❌ 未找到Cursor窗口")
                return False
            
            print(f"✅ 找到Cursor窗口: {cursor_window.title}")
            
            # 2. 激活窗口
            cursor_window.activate()
            time.sleep(0.5)
            
            # 3. 打开聊天框 (Ctrl+L)
            pyautogui.hotkey('ctrl', 'l')
            time.sleep(1)
            
            # 4. 清空聊天框
            pyautogui.hotkey('ctrl', 'a')
            time.sleep(0.2)
            
            # 5. 输入恢复指令
            recovery_text = "请继续执行上一个任务"
            pyautogui.write(recovery_text, interval=0.05)
            time.sleep(0.5)
            
            # 6. 发送消息
            pyautogui.press('enter')
            
            print(f"✅ 自动发送恢复指令: {recovery_text}")
            return True
            
        except Exception as e:
            print(f"❌ 自动恢复失败: {e}")
            return False
    
    def smart_recovery_with_retry(self):
        """智能恢复策略 - 避免无限循环"""
        print("🤖 启动智能恢复策略...")
        
        # 第一阶段：在当前会话中尝试3次
        for phase1_attempt in range(1, 4):
            print(f"🔄 第一阶段恢复尝试 {phase1_attempt}/3")
            
            # 先尝试关闭可能的对话框
            self.close_dialogs()
            
            if self.auto_send_recovery():
                # 等待15秒检测连接
                if self.wait_for_connection(15):
                    print("✅ AI连接恢复成功")
                    return True
            
            if phase1_attempt < 3:
                time.sleep(5)  # 等待5秒再重试
        
        # 第二阶段：开启新会话尝试2次
        for phase2_attempt in range(1, 3):
            print(f"🔄 第二阶段恢复尝试 {phase2_attempt}/2 - 新会话")
            
            # 开启新会话
            if self.open_new_chat_session():
                # 先尝试关闭可能的对话框
                self.close_dialogs()
                
                if self.auto_send_recovery():
                    # 等待15秒检测连接
                    if self.wait_for_connection(15):
                        print("✅ AI连接恢复成功（新会话）")
                        return True
            
            if phase2_attempt < 2:
                time.sleep(5)  # 等待5秒再重试
        
        print("⚠️ 所有恢复尝试失败，需要人工干预")
        return False
    
    def close_dialogs(self):
        """尝试关闭可能弹出的对话框或模态框"""
        try:
            # 按ESC键关闭对话框
            pyautogui.press('esc')
            time.sleep(0.5)
            pyautogui.press('esc')  # 再次确保
            time.sleep(0.5)
            print("✅ 已尝试关闭对话框")
            return True
        except Exception as e:
            print(f"❌ 关闭对话框失败: {e}")
            return False
    
    def open_new_chat_session(self):
        """开启新的聊天会话"""
        try:
            cursor_window = self.find_cursor_window()
            if cursor_window:
                cursor_window.activate()
                time.sleep(0.5)
                
                # 按Ctrl+L开启新会话
                pyautogui.hotkey('ctrl', 'l')
                time.sleep(1)
                print("✅ 已开启新聊天会话")
                return True
            return False
        except Exception as e:
            print(f"❌ 开启新会话失败: {e}")
            return False
    
    def wait_for_connection(self, wait_seconds):
        """等待AI连接"""
        print(f"⏳ 等待AI连接... ({wait_seconds}秒)")
        
        for i in range(wait_seconds):
            time.sleep(1)
            if not self.is_ai_offline():
                return True
        
        return False
    
    def monitor_and_recover(self):
        """智能监控恢复 - 避免无限循环"""
        print("🚀 启动智能监控恢复...")
        
        # 只执行一次恢复流程，避免无限循环
        if self.is_ai_offline():
            print("⚠️ 检测到AI离线，开始智能恢复")
            self.smart_recovery_with_retry()
        else:
            print("💚 AI在线，无需恢复")
        
        print("🔚 智能恢复流程完成")

class ProcessMonitor:
    """进程级监控 - 更可靠的检测"""
    
    def __init__(self):
        self.cursor_process = None
        self.last_cpu_usage = 0
        self.stable_count = 0
        
    def find_cursor_process(self):
        """查找Cursor进程"""
        for proc in psutil.process_iter(['name', 'cpu_percent']):
            try:
                if 'cursor' in proc.info['name'].lower():
                    return proc
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
        return None
    
    def is_cursor_frozen(self):
        """检测Cursor是否卡死"""
        proc = self.find_cursor_process()
        if not proc:
            return True
        
        try:
            cpu_usage = proc.cpu_percent()
            
            # 如果CPU使用率连续5次检查都是0，可能卡死了
            if cpu_usage == 0:
                self.stable_count += 1
            else:
                self.stable_count = 0
            
            return self.stable_count >= 5
            
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            return True
    
    def restart_cursor_if_needed(self):
        """如果需要，重启Cursor"""
        if self.is_cursor_frozen():
            print("⚠️ 检测到Cursor可能卡死")
            
            # 这里可以添加重启逻辑
            # 但为了安全，只记录日志
            with open('.ai-engine/cursor-status.log', 'a') as f:
                f.write(f"{datetime.now()}: Cursor可能卡死\n")
            
            return True
        return False

def main():
    """主入口 - 智能恢复，避免无限循环"""
    if not UI_AUTOMATION_AVAILABLE:
        print("❌ 缺少依赖，请运行: pip install pyautogui pygetwindow")
        return
    
    print("🤖 启动AI大模型智能恢复系统")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("✅ 智能检测AI断线")
    print("✅ 避免无限循环输入")
    print("✅ 三级恢复策略")
    print("✅ 需要时人工干预")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    
    # 启动智能守护
    guardian = AutoAIGuardian()
    
    # 执行单次智能恢复
    guardian.monitor_and_recover()

if __name__ == '__main__':
    main()
