# プロダクト管理アプリ

個人開発プロダクトの進捗・ステータス・リリース履歴を横断的に管理するアプリ。Next.js 15 / Prisma / Supabase / Better Auth。

---

## Tech Stack

- Next.js 15 (App Router) / TypeScript
- Prisma / Supabase (PostgreSQL) + Supabase Storage
- Better Auth（メール+パスワード認証）
- Tailwind CSS / shadcn/ui

## コマンド

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
```

## コーディングルール

- TypeScript strict mode。`any` 禁止
- サーバーコンポーネント優先。Client Component は必要最小限に
- DB アクセスはサーバーのみ（Client から Prisma を呼ばない）
- named export を使用（default export は page.tsx / layout.tsx のみ）
- Tailwind CSS のみ使用。カスタム CSS ファイルは作らない
- Prettier printWidth = 140
- Zod スキーマから型を推論する（型の重複定義禁止）

## プロダクト前提

- プロダクト管理アプリがマスターデータ。技術ブログ（パリッと開発日記）は同一 Supabase DB に直接接続して読み取るだけ
- ユーザーは常に1人（セルフホスト前提）
- 詳細は @docs/requirements.md を参照

## アーキテクチャ

- App Router + Server Components 優先。データ取得・更新は Server Actions（`requireAuth()` 必須）
- 詳細は @docs/architecture-design.md を参照

## やらないこと

- 不要な抽象化・ライブラリ追加
- コードコメント・docstring の追加（変更していないコードへ）
- エラーハンドリングの過剰追加（起こりえないケースへの対処）
- リファクタリング・整理（明示的に依頼されていない場合）

## Git コミットメッセージ

- 日本語: `feat: ○○を実装` / `fix: ○○を修正`
- プレフィックス: `feat:` / `fix:` / `refactor:` / `chore:` / `docs:` / `test:` / `style:`
- 1つの論理的変更 = 1コミット

---

## 参照ドキュメント

- @docs/requirements.md（要件定義書）
- @docs/architecture-design.md（設計書・アーキテクチャ）
