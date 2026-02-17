import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Project Setup', () => {
  it('should have valid package.json with required fields', () => {
    const pkgPath = resolve(__dirname, '../package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));

    expect(pkg.name).toBe('starterkit');
    expect(pkg.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(pkg.bin).toHaveProperty('starterkit');
    expect(pkg.main).toBeDefined();
    expect(pkg.types).toBeDefined();
  });
});
