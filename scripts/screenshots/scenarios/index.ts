import { Page } from 'playwright';
import { capture } from '../utils/capture';
import { CONFIG } from '../config';

const BASE_URL = CONFIG.BASE_URL;
const DEMO_SLUG = 'yarukoto';

export async function runPcScenarios(page: Page): Promise<void> {
  // dashboard-pc
  try {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');
    await capture(page, 'dashboard-pc', 'pc');
  } catch (e) {
    console.error('❌ dashboard-pc failed:', e);
  }

  // product-new-form
  try {
    await page.goto(`${BASE_URL}/products/new`);
    await page.waitForLoadState('networkidle');
    await capture(page, 'product-new-form', 'pc');
  } catch (e) {
    console.error('❌ product-new-form failed:', e);
  }

  // product-detail-overview
  try {
    await page.goto(`${BASE_URL}/products/${DEMO_SLUG}`);
    await page.waitForLoadState('networkidle');
    await capture(page, 'product-detail-overview', 'pc');
  } catch (e) {
    console.error('❌ product-detail-overview failed:', e);
  }

  // product-detail-info
  try {
    await page.goto(`${BASE_URL}/products/${DEMO_SLUG}/info`);
    await page.waitForLoadState('networkidle');
    await capture(page, 'product-detail-info', 'pc');
  } catch (e) {
    console.error('❌ product-detail-info failed:', e);
  }

  // product-detail-tasks
  try {
    await page.goto(`${BASE_URL}/products/${DEMO_SLUG}/tasks`);
    await page.waitForLoadState('networkidle');
    await capture(page, 'product-detail-tasks', 'pc');
  } catch (e) {
    console.error('❌ product-detail-tasks failed:', e);
  }

  // product-detail-images
  try {
    await page.goto(`${BASE_URL}/products/${DEMO_SLUG}/images`);
    await page.waitForLoadState('networkidle');
    await capture(page, 'product-detail-images', 'pc');
  } catch (e) {
    console.error('❌ product-detail-images failed:', e);
  }

  // product-detail-releases
  try {
    await page.goto(`${BASE_URL}/products/${DEMO_SLUG}/releases`);
    await page.waitForLoadState('networkidle');
    await capture(page, 'product-detail-releases', 'pc');
  } catch (e) {
    console.error('❌ product-detail-releases failed:', e);
  }

  // product-detail-history
  try {
    await page.goto(`${BASE_URL}/products/${DEMO_SLUG}/history`);
    await page.waitForLoadState('networkidle');
    await capture(page, 'product-detail-history', 'pc');
  } catch (e) {
    console.error('❌ product-detail-history failed:', e);
  }

  // delete-confirm-dialog
  try {
    await page.goto(`${BASE_URL}/products/${DEMO_SLUG}`);
    await page.waitForLoadState('networkidle');
    const deleteBtn = page.locator('button:has-text("削除")').first();
    await deleteBtn.click();
    await page.waitForTimeout(300);
    await capture(page, 'delete-confirm-dialog', 'pc');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
  } catch (e) {
    console.error('❌ delete-confirm-dialog failed:', e);
  }

  // image-upload-dialog
  try {
    await page.goto(`${BASE_URL}/products/${DEMO_SLUG}/images`);
    await page.waitForLoadState('networkidle');
    const uploadBtn = page.locator('button:has-text("アップロード"), button:has-text("画像を追加"), button:has-text("追加")').first();
    await uploadBtn.click();
    await page.waitForTimeout(300);
    await capture(page, 'image-upload-dialog', 'pc');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
  } catch (e) {
    console.error('❌ image-upload-dialog failed:', e);
  }

  // release-new-form
  try {
    await page.goto(`${BASE_URL}/products/${DEMO_SLUG}/releases/new`);
    await page.waitForLoadState('networkidle');
    await capture(page, 'release-new-form', 'pc');
  } catch (e) {
    console.error('❌ release-new-form failed:', e);
  }

  // release-edit-form
  try {
    await page.goto(`${BASE_URL}/products/${DEMO_SLUG}/releases`);
    await page.waitForLoadState('networkidle');
    const editBtn = page.locator('a[href*="/releases/"][href*="/edit"]').first();
    await editBtn.click();
    await page.waitForLoadState('networkidle');
    await capture(page, 'release-edit-form', 'pc');
  } catch (e) {
    console.error('❌ release-edit-form failed:', e);
  }

  // task-new-form
  try {
    await page.goto(`${BASE_URL}/products/${DEMO_SLUG}/tasks/new`);
    await page.waitForLoadState('networkidle');
    await capture(page, 'task-new-form', 'pc');
  } catch (e) {
    console.error('❌ task-new-form failed:', e);
  }

  // task-edit-form
  try {
    await page.goto(`${BASE_URL}/products/${DEMO_SLUG}/tasks`);
    await page.waitForLoadState('networkidle');
    const editBtn = page.locator('a[href*="/tasks/"][href*="/edit"]').first();
    await editBtn.click();
    await page.waitForLoadState('networkidle');
    await capture(page, 'task-edit-form', 'pc');
  } catch (e) {
    console.error('❌ task-edit-form failed:', e);
  }
}

export async function runMobileScenarios(page: Page): Promise<void> {
  // dashboard-mobile
  try {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');
    await capture(page, 'dashboard-mobile', 'mobile');
  } catch (e) {
    console.error('❌ dashboard-mobile failed:', e);
  }

  // sidebar-open-mobile
  try {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');
    const hamburger = page.locator('button[aria-label], button[aria-label*="メニュー"], button[aria-label*="menu"], button[aria-label*="sidebar"]').first();
    try {
      await hamburger.click({ timeout: 3000 });
    } catch {
      // fallback: click any button that might be the hamburger
      const btns = page.locator('header button, nav button').first();
      await btns.click({ timeout: 3000 });
    }
    await page.waitForTimeout(400);
    await capture(page, 'sidebar-open-mobile', 'mobile');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
  } catch (e) {
    console.error('❌ sidebar-open-mobile failed:', e);
  }
}

export async function runLoginScenario(page: Page): Promise<void> {
  try {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    await capture(page, 'login', 'pc');
  } catch (e) {
    console.error('❌ login failed:', e);
  }

  try {
    await page.goto(`${BASE_URL}/signup`);
    await page.waitForLoadState('networkidle');
    await capture(page, 'signup', 'pc');
  } catch (e) {
    console.error('❌ signup failed:', e);
  }
}
