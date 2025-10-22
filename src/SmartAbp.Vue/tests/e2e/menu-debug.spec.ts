import { test, expect } from '@playwright/test';

test('菜单调试 - 检查主菜单是否显示Layer1/2/3', async ({ page }) => {
    console.log('🔍 开始菜单调试测试...');

    // 1. 导航到登录页面
    await page.goto('http://localhost:9001/account/login');
    await page.waitForLoadState('domcontentloaded');

    // 2. 填写登录信息
    await page.locator('input[placeholder*="用户名"]').fill('admin');
    await page.locator('input[type="password"]').fill('1q2w3E*');

    // 3. 点击登录按钮
    await page.locator('button:has-text("企业登录")').first().click();

    // 4. 等待登录成功（跳转到dashboard或lowcode页面）
    await page.waitForURL(/\/(dashboard|lowcode)/, { timeout: 10000 });
    console.log('  ✅ 登录成功');

    // 5. 等待菜单加载
    await page.waitForSelector('.sidebar-nav', { timeout: 5000 });
    console.log('  ✅ 侧边栏已加载');

    // 6. 获取所有菜单项
    const menuItems = await page.locator('.sidebar-nav .nav-item').all();
    console.log(`  📊 总菜单项数: ${menuItems.length}`);

    // 7. 检查每个菜单项
    for (let i = 0; i < menuItems.length; i++) {
        const title = await menuItems[i].locator('.nav-text').first().textContent();
        console.log(`  📋 菜单${i + 1}: ${title}`);
    }

    // 8. 专门查找"低代码引擎"菜单
    const lowcodeMenu = page.locator('.nav-item:has-text("低代码引擎")');
    const lowcodeMenuCount = await lowcodeMenu.count();
    console.log(`  🔍 "低代码引擎"菜单数量: ${lowcodeMenuCount}`);

    if (lowcodeMenuCount > 0) {
        console.log('  ✅ 找到"低代码引擎"菜单');

        // 9. 点击展开"低代码引擎"菜单
        await lowcodeMenu.first().click();
        await page.waitForTimeout(500);

        // 10. 检查子菜单
        const subMenus = await page.locator('.sub-menu .sub-nav-link').all();
        console.log(`  📊 子菜单数量: ${subMenus.length}`);

        for (let i = 0; i < subMenus.length; i++) {
            const subTitle = await subMenus[i].locator('.nav-text').textContent();
            console.log(`  📋 子菜单${i + 1}: ${subTitle}`);
        }

        // 11. 检查是否有Layer1/2/3
        const hasLayer1 = await page.locator('.sub-menu:has-text("Layer1")').count() > 0;
        const hasLayer2 = await page.locator('.sub-menu:has-text("Layer2")').count() > 0;
        const hasLayer3 = await page.locator('.sub-menu:has-text("Layer3")').count() > 0;

        console.log(`  🎯 Layer1: ${hasLayer1 ? '✅' : '❌'}`);
        console.log(`  🎯 Layer2: ${hasLayer2 ? '✅' : '❌'}`);
        console.log(`  🎯 Layer3: ${hasLayer3 ? '✅' : '❌'}`);
    } else {
        console.log('  ❌ 未找到"低代码引擎"菜单！');

        // 输出所有可见的文本用于诊断
        const allText = await page.locator('.sidebar-nav').textContent();
        console.log('  📋 侧边栏全部文本:', allText);
    }

    // 12. 截图保存
    await page.screenshot({ path: 'playwright-report/menu-debug.png', fullPage: true });

    // 13. 输出更多调试信息
    const debugInfo = await page.evaluate(() => {
        // @ts-ignore
        const app = window.__VUE_DEVTOOLS_GLOBAL_HOOK__.apps[0];
        if (app) {
            // @ts-ignore
            const menuStore = app.config.globalProperties.$pinia.state.value.menu;
            return {
                filteredMenusCount: menuStore?.filteredMenus?.length || 0,
                activeMenuKey: menuStore?.menuState?.activeMenuKey,
                expandedMenuKeys: menuStore?.menuState?.expandedMenuKeys,
                isAuthenticated: app.config.globalProperties.$pinia.state.value.auth?.isAuthenticated
            };
        }
        return null;
    });

    console.log('  🐛 Vue调试信息:', debugInfo);
});

