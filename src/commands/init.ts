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
  for (const dir of REQUIRED_DIRS) {
    const fullPath = resolve(process.cwd(), dir);
    try {
      if (!existsSync(fullPath)) {
        mkdirSync(fullPath, { recursive: true });
        console.log(`✓ Created ${dir}/`);
      } else {
        console.log(`- ${dir}/ already exists`);
      }
    } catch (error: any) {
      console.error(`✗ Failed to create ${dir}/: ${error.message}`);
      process.exit(1);
    }
  }

  // Create config
  const configPath = resolve(process.cwd(), '.starterkit/config.json');
  try {
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
    } else {
      console.log('- .starterkit/config.json already exists');
    }
  } catch (error: any) {
    console.error(`✗ Failed to create config: ${error.message}`);
    process.exit(1);
  }

  console.log('\n✨ Starterkit initialized successfully!');
}
