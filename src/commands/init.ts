import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const REQUIRED_DIRS = [
  'docs/ai-sessions',
  'docs/security',
  'docs/publish',
  'docs/code-review',
  'docs/plans',
  '.starterkit'
];

export async function initCommand(): Promise<void> {
  console.log('Initializing starterkit...\n');

  // Create directories
  REQUIRED_DIRS.forEach(dir => {
    const fullPath = resolve(process.cwd(), dir);
    if (!existsSync(fullPath)) {
      mkdirSync(fullPath, { recursive: true });
      console.log(`✓ Created ${dir}/`);
    } else {
      console.log(`- ${dir}/ already exists`);
    }
  });

  // Create config
  const configPath = resolve(process.cwd(), '.starterkit/config.json');
  if (!existsSync(configPath)) {
    const config = {
      version: '0.1.0',
      modules: [],
      settings: {
        autoTrack: true,
        reportFormat: 'html'
      }
    };
    writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('✓ Created .starterkit/config.json');
  }

  console.log('\n✨ Starterkit initialized successfully!');
}
