#!/usr/bin/env node
import { Command } from 'commander';
import { readFileSync } from 'fs';
import { resolve } from 'path';

let pkg: any;
try {
  pkg = JSON.parse(
    readFileSync(resolve(__dirname, '../package.json'), 'utf-8')
  );
} catch (error) {
  console.error('Error: Could not read package.json');
  process.exit(1);
}

const program = new Command();

program
  .name('starterkit')
  .description('Claude CLI plugin for small AI development teams')
  .version(pkg.version);

program
  .command('init')
  .description('Initialize starterkit in current project')
  .action(() => {
    console.log('Initializing starterkit...');
  });

program
  .command('publish')
  .description('Run full pre-merge workflow')
  .option('--skip-visual-qa', 'Skip visual QA checks')
  .option('--skip-security-audit', 'Skip security audit')
  .action((options) => {
    console.log('Running publish workflow...', options);
  });

program.parse();
