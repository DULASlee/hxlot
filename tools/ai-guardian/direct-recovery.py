#!/usr/bin/env python3
"""
直接恢复 - 通过Windows API自动发送恢复指令
无需用户任何操作
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

def find_cursor():
    """查找Cursor窗口"""
    for title in ['Cursor', 'Visual Studio Code']:
        windows = gw.getWindowsWithTitle(title)
        if windows:
            return windows[0]
    return None

def auto_send_continue():
    """自动发送"请继续"到聊天框"""
    cursor = find_cursor()
    if not cursor:
        print("❌ 未找到Cursor窗口")
        return False
    
    try:
        print(f"🎯 找到窗口: {cursor.title}")
        
        # 激活窗口
        cursor.activate()
        time.sleep(0.5)
        
        # 打开聊天框 Ctrl+L
        pyautogui.hotkey('ctrl', 'l')
        time.sleep(0.8)
        
        # 清空并输入
        pyautogui.hotkey('ctrl', 'a')
        time.sleep(0.2)
        
        pyautogui.write('请继续', interval=0.1)
        time.sleep(0.5)
        
        # 发送
        pyautogui.press('enter')
        
        print("✅ 已自动发送'请继续'")
        return True
        
    except Exception as e:
        print(f"❌ 发送失败: {e}")
        return False

def monitor_and_auto_recover():
    """监控并自动恢复"""
    state_file = '.ai-engine/ai-state.json'
    
    print("🤖 AI自动恢复守护启动")
    print("🎯 检测到断线将自动发送'请继续'")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    
    while True:
        try:
            # 检查AI状态
            if os.path.exists(state_file):
                with open(state_file, 'r') as f:
                    state = json.load(f)
                
                last_activity = state.get('lastActivity', time.time() * 1000)
                inactive_sec = (time.time() * 1000 - last_activity) / 1000
                
                if inactive_sec > 60:  # 60秒无活动
                    print(f"⚠️ AI离线 {int(inactive_sec)}秒，自动恢复...")
                    
                    if auto_send_continue():
                        # 发送成功后等待AI响应
                        time.sleep(30)
                    else:
                        time.sleep(10)
                else:
                    print(f"💚 AI在线 (最后活动: {int(inactive_sec)}秒前)")
            else:
                print("⚠️ 无AI状态文件")
            
            time.sleep(15)  # 15秒检查一次
            
        except KeyboardInterrupt:
            print("\n🛑 自动守护已停止")
            break
        except Exception as e:
            print(f"❌ 监控错误: {e}")
            time.sleep(15)

if __name__ == '__main__':
    # 立即测试一次
    print("🧪 测试自动发送功能...")
    if auto_send_continue():
        print("✅ 测试成功！开始监控...")
        time.sleep(3)
        monitor_and_auto_recover()
    else:
        print("❌ 测试失败，请检查Cursor是否打开")
