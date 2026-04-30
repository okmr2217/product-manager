import type { Scenario } from 'shot-kit';

const DEMO_SLUG = 'yarukoto';

const scenarios: Scenario[] = [
  // ----------------------------------------------------------------
  // PC — authenticated
  // ----------------------------------------------------------------
  { name: 'プロダクト一覧_PC', path: '/products', device: 'pc' },
  { name: 'プロダクト作成フォーム_PC', path: '/products/new', device: 'pc' },
  { name: 'プロダクト詳細_概要_PC', path: `/products/${DEMO_SLUG}`, device: 'pc' },
  { name: 'プロダクト詳細_設定_PC', path: `/products/${DEMO_SLUG}/settings`, device: 'pc' },
  { name: 'プロダクト詳細_タスク_PC', path: `/products/${DEMO_SLUG}/tasks`, device: 'pc' },
  { name: 'プロダクト詳細_画像_PC', path: `/products/${DEMO_SLUG}/images`, device: 'pc' },
  { name: 'プロダクト詳細_リリースノート_PC', path: `/products/${DEMO_SLUG}/releases`, device: 'pc' },
  { name: 'プロダクト詳細_ステータス履歴_PC', path: `/products/${DEMO_SLUG}/history`, device: 'pc' },

  {
    name: '削除確認ダイアログ_PC',
    path: `/products/${DEMO_SLUG}`,
    device: 'pc',
    action: async (page) => {
      await page.locator('button:has-text("削除")').first().click();
      await page.waitForTimeout(300);
    },
  },

  {
    name: '画像アップロードダイアログ_PC',
    path: `/products/${DEMO_SLUG}/images`,
    device: 'pc',
    action: async (page) => {
      await page.locator('button:has-text("アップロード"), button:has-text("画像を追加"), button:has-text("追加")').first().click();
      await page.waitForTimeout(300);
    },
  },

  { name: 'リリースノート作成フォーム_PC', path: `/products/${DEMO_SLUG}/releases/new`, device: 'pc' },

  {
    name: 'リリースノート編集フォーム_PC',
    path: `/products/${DEMO_SLUG}/releases`,
    device: 'pc',
    action: async (page) => {
      await page.locator('a[href*="/releases/"][href*="/edit"]').first().click();
      await page.waitForLoadState('networkidle');
    },
  },

  { name: 'タスク作成フォーム_PC', path: `/products/${DEMO_SLUG}/tasks/new`, device: 'pc' },

  {
    name: 'タスク編集フォーム_PC',
    path: `/products/${DEMO_SLUG}/tasks`,
    device: 'pc',
    action: async (page) => {
      await page.locator('a[href*="/tasks/"][href*="/edit"]').first().click();
      await page.waitForLoadState('networkidle');
    },
  },

  // ----------------------------------------------------------------
  // Mobile — authenticated
  // ----------------------------------------------------------------
  { name: 'ダッシュボード_モバイル', path: '/dashboard', device: 'mobile' },

  {
    name: 'サイドバー展開_モバイル',
    path: '/dashboard',
    device: 'mobile',
    action: async (page) => {
      const hamburger = page.locator('button[aria-label], button[aria-label*="メニュー"], button[aria-label*="menu"], button[aria-label*="sidebar"]').first();
      try {
        await hamburger.click({ timeout: 3000 });
      } catch {
        await page.locator('header button, nav button').first().click({ timeout: 3000 });
      }
      await page.waitForTimeout(400);
    },
  },

  // ----------------------------------------------------------------
  // PC — unauthenticated
  // ----------------------------------------------------------------
  { name: 'ログイン', path: '/login', device: 'pc', requiresAuth: false },
  { name: '新規登録', path: '/signup', device: 'pc', requiresAuth: false },
];

export default scenarios;
