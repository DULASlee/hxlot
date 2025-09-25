#!/usr/bin/env node
// 🔧 SmartAbp 主应用引用路径更新器

const fs = require('fs');
const path = require('path');

/**
 * 🎯 主应用引用更新器
 */
class MainAppReferenceUpdater {
  constructor(projectRoot = path.join(__dirname, '../src/SmartAbp.Vue')) {
    this.projectRoot = projectRoot;
    this.updatedCount = 0;
    this.updateMap = new Map();
  }

  /**
   * 🔄 更新主应用中的低代码组件引用
   */
  updateLowCodeComponentReferences() {
    console.log('🔄 更新主应用低代码组件引用...');
    
    const referenceUpdates = [
      // 组件引用更新
      {
        from: '@/components/lowcode/BusinessRulesEngine.vue',
        to: '@smartabp/lowcode-designer',
        importName: 'BusinessRulesEngine'
      },
      {
        from: '@/components/lowcode/EnhancedThemeEditor.vue', 
        to: '@smartabp/lowcode-designer',
        importName: 'EnhancedThemeEditor'
      },
      {
        from: '@/components/lowcode/EnhancedStateMachine.vue',
        to: '@smartabp/lowcode-designer', 
        importName: 'EnhancedStateMachine'
      },
      {
        from: '@/components/lowcode/VisualDesignCanvas.vue',
        to: '@smartabp/lowcode-designer',
        importName: 'VisualDesignCanvas'
      },
      {
        from: '@/components/lowcode/AdvancedEntityRelationshipDesigner.vue',
        to: '@smartabp/lowcode-designer',
        importName: 'AdvancedEntityRelationshipDesigner'
      },
      {
        from: '@/components/lowcode/AdvancedFieldTypeDesigner.vue',
        to: '@smartabp/lowcode-designer',
        importName: 'AdvancedFieldTypeDesigner'
      },
      
      // Store引用更新
      {
        from: '@/stores/lowcode/entityModeling',
        to: '@smartabp/lowcode-core',
        importName: 'useEntityModelingStore'
      },
      {
        from: '@/stores/lowcode/pageDesign',
        to: '@smartabp/lowcode-core',
        importName: 'usePageDesignStore'
      },
      {
        from: '@/stores/lowcode/codeGeneration',
        to: '@smartabp/lowcode-core',
        importName: 'useCodeGenerationStore'
      },
      {
        from: '@/stores/lowcode/workspace',
        to: '@smartabp/lowcode-core',
        importName: 'useWorkspaceStore'
      }
    ];

    const mainAppFiles = this.findMainAppFiles();
    
    for (const file of mainAppFiles) {
      try {
        let content = fs.readFileSync(file, 'utf8');
        let fileChanged = false;
        
        referenceUpdates.forEach(update => {
          const oldPattern = new RegExp(`import\\s+([^}]+)\\s+from\\s+['"]${update.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g');
          
          if (oldPattern.test(content)) {
            // 更新为新的导入方式
            content = content.replace(oldPattern, `import { ${update.importName} } from '${update.to}'`);
            fileChanged = true;
            
            console.log(`   ✅ ${update.description}: ${path.relative(this.projectRoot, file)}`);
            this.updatedCount++;
          }
        });
        
        if (fileChanged) {
          fs.writeFileSync(file, content, 'utf8');
        }
        
      } catch (error) {
        console.error(`   ❌ 更新失败: ${path.relative(this.projectRoot, file)} - ${error.message}`);
      }
    }
  }

  /**
   * 📋 更新路由配置引用
   */
  updateRouterReferences() {
    console.log('📋 更新路由配置引用...');
    
    const routerFiles = [
      'src/router/index.ts',
      'src/router/index.js'
    ];

    routerFiles.forEach(routerFile => {
      const filePath = path.join(this.projectRoot, routerFile);
      if (fs.existsSync(filePath)) {
        try {
          let content = fs.readFileSync(filePath, 'utf8');
          let fileChanged = false;
          
          // 更新路由组件引用
          const routerUpdates = [
            {
              from: '@/views/lowcode/DesignView.vue',
              to: '@smartabp/lowcode-designer',
              description: '更新DesignView路由引用'
            },
            {
              from: '@/views/lowcode/EntityModelingView.vue',
              to: '@smartabp/lowcode-designer',
              description: '更新EntityModelingView路由引用'
            },
            {
              from: '@/views/lowcode/ThemeCustomizationView.vue',
              to: '@smartabp/lowcode-designer',
              description: '更新ThemeCustomizationView路由引用'
            }
          ];
          
          routerUpdates.forEach(update => {
            const pattern = new RegExp(`['"]${update.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g');
            const newContent = content.replace(pattern, `'${update.to}'`);
            
            if (newContent !== content) {
              content = newContent;
              fileChanged = true;
              console.log(`   ✅ ${update.description}: ${routerFile}`);
            }
          });
          
          if (fileChanged) {
            fs.writeFileSync(filePath, content, 'utf8');
            this.updatedCount++;
          }
          
        } catch (error) {
          console.error(`   ❌ 路由更新失败: ${routerFile} - ${error.message}`);
        }
      }
    });
  }

  /**
   * 🧹 清理备份文件
   */
  cleanupBackupFiles() {
    console.log('🧹 清理临时备份文件...');
    
    const backupFiles = this.findFilesInDirRecursive(this.projectRoot, ['.backup']);
    
    backupFiles.forEach(file => {
      try {
        fs.unlinkSync(file);
        console.log(`   🗑️ 删除备份: ${path.relative(this.projectRoot, file)}`);
      } catch (error) {
        console.error(`   ❌ 删除失败: ${file} - ${error.message}`);
      }
    });
  }

  findMainAppFiles() {
    // 只查找主应用src目录下的文件，排除packages目录
    const srcDir = path.join(this.projectRoot, 'src');
    return this.findFilesInDirRecursive(srcDir, ['.ts', '.vue', '.js'])
      .filter(file => !file.includes('packages/'));
  }

  findFilesInDirRecursive(dir, extensions) {
    const files = [];
    
    const search = (currentDir) => {
      try {
        const items = fs.readdirSync(currentDir);
        
        items.forEach(item => {
          const fullPath = path.join(currentDir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory() && !item.includes('node_modules') && !item.includes('.git')) {
            search(fullPath);
          } else if (extensions.some(ext => item.endsWith(ext))) {
            files.push(fullPath);
          }
        });
      } catch (error) {
        // 忽略权限错误
      }
    };
    
    search(dir);
    return files;
  }

  /**
   * 🎯 执行完整引用更新
   */
  async runFullUpdate() {
    console.log('🚀 开始主应用引用路径更新...\n');
    
    const startTime = Date.now();
    
    try {
      await this.updateLowCodeComponentReferences();
      await this.updateRouterReferences();
      await this.cleanupBackupFiles();
      
      const duration = Date.now() - startTime;
      
      console.log('\n🎯 === 引用路径更新完成 ===');
      console.log(`✅ 更新成功: ${this.updatedCount}处`);
      console.log(`⏰ 总耗时: ${duration}ms`);
      
      return {
        success: true,
        updatedCount: this.updatedCount,
        duration
      };
      
    } catch (error) {
      console.error('🚨 更新过程中发生错误:', error);
      throw error;
    }
  }
}

// 执行更新
if (require.main === module) {
  const updater = new MainAppReferenceUpdater();
  
  updater.runFullUpdate().then(result => {
    console.log('\n✅ 主应用引用更新完成!');
  }).catch(error => {
    console.error('❌ 更新失败:', error);
    process.exit(1);
  });
}

module.exports = MainAppReferenceUpdater;
