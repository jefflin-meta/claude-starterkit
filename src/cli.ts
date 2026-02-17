#!/usr/bin/env node
import { Command } from 'commander';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const pkg = JSON.parse(
  readFileSync(resolve(__dirname, '../package.json'), 'utf-8')
);

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
