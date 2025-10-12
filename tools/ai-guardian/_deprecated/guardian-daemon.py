#!/usr/bin/env python3
"""
SmartAbp AI Guardian - Python守护脚本（备选方案）
AI大模型断线检测与自动恢复

@author 世界顶级微服务架构师
@date 2025-10-04
@version 1.0.0
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
    UI_AUTOMATION_AVAILABLE = True
except ImportError:
    print("⚠️  警告: pyautogui未安装，UI自动化功能不可用")
    print("💡 安装命令: pip install pyautogui")
    UI_AUTOMATION_AVAILABLE = False


class AIGuardianDaemon:
    """AI守护守护进程"""
    
    def __init__(self, project_root=None):
        self.project_root = project_root or os.getcwd()
        self.checkpoint_dir = os.path.join(self.project_root, '.ai-engine')
        self.state_file = os.path.join(self.checkpoint_dir, 'ai-state.json')
        self.log_dir = os.path.join(self.checkpoint_dir, 'logs')
        
        # 监控配置
        self.check_interval = 30  # 30秒检查一次
        self.offline_threshold = 90  # 90秒无活动判断为离线
        self.last_activity = time.time()
        self.recovery_attempts = 0
        self.max_recovery_attempts = 3
        
        # 确保目录存在
        os.makedirs(self.checkpoint_dir, exist_ok=True)
        os.makedirs(self.log_dir, exist_ok=True)
        
        print(f"[AI Guardian] 🛡️  AI断线守护服务已启动")
        print(f"[AI Guardian] 📁 项目根目录: {self.project_root}")
        print(f"[AI Guardian] ⏱️  检查间隔: {self.check_interval}秒")
        print(f"[AI Guardian] ⚠️  离线阈值: {self.offline_threshold}秒")
        
    def load_state(self):
        """加载AI状态"""
        try:
            if os.path.exists(self.state_file):
                with open(self.state_file, 'r', encoding='utf-8') as f:
                    state = json.load(f)
                    self.last_activity = state.get('lastActivity', time.time() * 1000) / 1000
                    print(f"[AI Guardian] ✅ 状态加载成功")
                    return state
        except Exception as e:
            print(f"[AI Guardian] ⚠️  状态加载失败: {e}")
        return None
    
    def check_cursor_process(self):
        """检查Cursor进程状态"""
        for proc in psutil.process_iter(['name', 'cpu_percent', 'memory_info']):
            try:
                if 'cursor' in proc.info['name'].lower():
                    return {
                        'running': True,
                        'cpu': proc.info.get('cpu_percent', 0),
                        'memory': proc.info.get('memory_info', {}).get('rss', 0) / 1024 / 1024  # MB
                    }
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
        return {'running': False}
    
    def check_network_connections(self):
        """检查Cursor的网络连接"""
        ai_domains = ['anthropic.com', 'openai.com', 'api.cursor.sh']
        connections = []
        
        for proc in psutil.process_iter(['name', 'connections']):
            try:
                if 'cursor' in proc.info['name'].lower():
                    conns = proc.info.get('connections', [])
                    for conn in conns:
                        if hasattr(conn, 'raddr') and conn.raddr:
                            # 简单检查：有远程连接就认为可能是AI服务
                            connections.append(conn)
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
        
        return len(connections) > 0
    
    def is_ai_offline(self):
        """判断AI是否离线"""
        state = self.load_state()
        if not state:
            return False
        
        last_activity_ms = state.get('lastActivity', time.time() * 1000)
        inactive_duration = (time.time() * 1000 - last_activity_ms) / 1000
        
        return inactive_duration > self.offline_threshold
    
    def generate_recovery_command(self):
        """生成恢复指令"""
        state = self.load_state()
        if not state or not state.get('lastCheckpoint'):
            return "请继续"
        
        checkpoint = state['lastCheckpoint']
        stage = checkpoint.get('stage', '未知')
        task = checkpoint.get('task', '未知')
        progress = checkpoint.get('progress', 0)
        completed = checkpoint.get('completedTasks', [])
        pending = checkpoint.get('pendingTasks', [])
        
        recovery_prompt = f"""
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔄 AI大模型断线恢复指令
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

请继续执行以下任务：

📊 **当前阶段**: {stage}
🎯 **当前任务**: {task}
📈 **完成进度**: {progress}%

✅ **已完成任务**:
{chr(10).join(f"  - {t}" for t in completed) if completed else "  无"}

⏳ **待执行任务**:
{chr(10).join(f"  - {t}" for t in pending) if pending else "  无"}

📍 **检查点时间**: {checkpoint.get('timestamp', '未知')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        """.strip()
        
        return recovery_prompt
    
    def auto_recover_with_ui(self):
        """使用UI自动化恢复（需要pyautogui）"""
        if not UI_AUTOMATION_AVAILABLE:
            print("[AI Guardian] ❌ UI自动化不可用，请手动恢复")
            return False
        
        try:
            print("[AI Guardian] 🔄 尝试UI自动恢复...")
            
            # 查找Cursor窗口
            windows = pyautogui.getWindowsWithTitle('Cursor')
            if not windows:
                print("[AI Guardian] ⚠️  未找到Cursor窗口")
                return False
            
            # 激活窗口
            cursor_window = windows[0]
            cursor_window.activate()
            time.sleep(0.5)
            
            # 打开聊天框 (Ctrl+L)
            pyautogui.hotkey('ctrl', 'l')
            time.sleep(0.5)
            
            # 输入恢复指令
            recovery_cmd = self.generate_recovery_command()
            pyautogui.write(recovery_cmd, interval=0.05)
            
            print("[AI Guardian] ✅ 恢复指令已发送")
            return True
            
        except Exception as e:
            print(f"[AI Guardian] ❌ UI自动恢复失败: {e}")
            return False
    
    def save_recovery_instruction(self):
        """保存恢复指令到文件"""
        recovery_cmd = self.generate_recovery_command()
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        recovery_file = os.path.join(self.log_dir, f'recovery-{timestamp}.txt')
        
        with open(recovery_file, 'w', encoding='utf-8') as f:
            f.write(recovery_cmd)
        
        print(f"[AI Guardian] 📝 恢复指令已保存: {recovery_file}")
        print(f"[AI Guardian] 💡 请复制以下内容到Cursor聊天框：")
        print(recovery_cmd)
        
        return recovery_file
    
    def attempt_recovery(self):
        """尝试恢复"""
        if self.recovery_attempts >= self.max_recovery_attempts:
            print(f"[AI Guardian] ⚠️  已达到最大恢复尝试次数 ({self.max_recovery_attempts})")
            return
        
        self.recovery_attempts += 1
        print(f"[AI Guardian] 🔄 尝试恢复 ({self.recovery_attempts}/{self.max_recovery_attempts})")
        
        # 方案1: UI自动化（如果可用）
        if UI_AUTOMATION_AVAILABLE:
            if self.auto_recover_with_ui():
                return
        
        # 方案2: 保存恢复指令文件
        self.save_recovery_instruction()
    
    def monitor(self):
        """主监控循环"""
        print("[AI Guardian] 🚀 开始监控...")
        
        while True:
            try:
                # 检查Cursor进程
                cursor_status = self.check_cursor_process()
                if not cursor_status['running']:
                    print("[AI Guardian] ⚠️  Cursor进程未运行")
                    time.sleep(self.check_interval)
                    continue
                
                # 检查网络连接
                has_network = self.check_network_connections()
                
                # 检查AI状态
                if self.is_ai_offline():
                    print("[AI Guardian] ⚠️  检测到AI可能已离线！")
                    self.attempt_recovery()
                else:
                    # 重置恢复计数
                    if self.recovery_attempts > 0:
                        print("[AI Guardian] ✅ AI已恢复在线")
                        self.recovery_attempts = 0
                    
                    state = self.load_state()
                    if state:
                        last_activity_ms = state.get('lastActivity', time.time() * 1000)
                        inactive_sec = int((time.time() * 1000 - last_activity_ms) / 1000)
                        print(f"[AI Guardian] 💚 AI在线 (最后活动: {inactive_sec}秒前)")
                
                # 显示系统状态
                print(f"[AI Guardian] 📊 Cursor CPU: {cursor_status.get('cpu', 0):.1f}%, "
                      f"内存: {cursor_status.get('memory', 0):.1f}MB, "
                      f"网络: {'✅' if has_network else '❌'}")
                
            except KeyboardInterrupt:
                print("\n[AI Guardian] 🛡️  AI断线守护服务已停止")
                sys.exit(0)
            except Exception as e:
                print(f"[AI Guardian] ❌ 监控错误: {e}")
            
            time.sleep(self.check_interval)


def main():
    """主入口"""
    import argparse
    
    parser = argparse.ArgumentParser(description='AI Guardian - AI断线守护服务')
    parser.add_argument('--project-root', help='项目根目录', default=None)
    parser.add_argument('--interval', type=int, help='检查间隔（秒）', default=30)
    parser.add_argument('--threshold', type=int, help='离线阈值（秒）', default=90)
    
    args = parser.parse_args()
    
    daemon = AIGuardianDaemon(project_root=args.project_root)
    daemon.check_interval = args.interval
    daemon.offline_threshold = args.threshold
    
    daemon.monitor()


if __name__ == '__main__':
    main()

