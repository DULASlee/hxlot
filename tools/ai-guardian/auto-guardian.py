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
    
    def monitor_and_recover(self):
        """监控并自动恢复"""
        print("🚀 开始自动监控...")
        
        while True:
            try:
                if self.is_ai_offline():
                    if self.recovery_attempts < self.max_recovery_attempts:
                        self.recovery_attempts += 1
                        print(f"⚠️ AI离线！自动恢复 ({self.recovery_attempts}/{self.max_recovery_attempts})")
                        
                        if self.auto_send_recovery():
                            print("✅ 恢复指令已自动发送")
                            # 等待AI响应
                            time.sleep(30)
                        else:
                            print("❌ 自动恢复失败")
                    else:
                        print("⚠️ 达到最大恢复次数，停止自动恢复")
                        time.sleep(60)  # 等待1分钟后重置
                        self.recovery_attempts = 0
                else:
                    if self.recovery_attempts > 0:
                        print("✅ AI已恢复在线")
                        self.recovery_attempts = 0
                    
                    print("💚 AI在线")
                
                time.sleep(self.check_interval)
                
            except KeyboardInterrupt:
                print("\n🛑 自动守护已停止")
                break
            except Exception as e:
                print(f"❌ 监控错误: {e}")
                time.sleep(self.check_interval)

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
    """主入口"""
    if not UI_AUTOMATION_AVAILABLE:
        print("❌ 缺少依赖，请运行: pip install pyautogui pygetwindow")
        return
    
    print("🤖 启动AI大模型自动守护系统")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("✅ 自动检测AI断线")
    print("✅ 自动发送恢复指令")
    print("✅ 无需人工干预")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    
    # 启动自动守护
    guardian = AutoAIGuardian()
    
    # 启动进程监控
    process_monitor = ProcessMonitor()
    
    try:
        guardian.monitor_and_recover()
    except KeyboardInterrupt:
        print("\n👋 自动守护已停止")

if __name__ == '__main__':
    main()
