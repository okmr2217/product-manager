import type { ShotKitProjectConfig } from 'shot-kit';

const config: ShotKitProjectConfig = {
  projectName: 'launchpad',
  baseUrl: process.env['SHOT_KIT_BASE_URL'] ?? 'http://localhost:3000',
};

export default config;
