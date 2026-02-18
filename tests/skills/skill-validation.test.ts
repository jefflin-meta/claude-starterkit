import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

describe('Skill Validation', () => {
  const skillsDir = resolve(__dirname, '../../core/skills');
  const requiredSkills = ['publish', 'onboard', 'security-audit', 'review-changes'];

  it('should have required custom skills', () => {
    requiredSkills.forEach(skill => {
      const skillPath = resolve(skillsDir, skill);
      expect(existsSync(skillPath)).toBe(true);
      expect(existsSync(`${skillPath}/skill.md`)).toBe(true);
    });
  });

  it('should have valid skill.md format', () => {
    requiredSkills.forEach(skillName => {
      const skillContent = readFileSync(
        resolve(skillsDir, skillName, 'skill.md'),
        'utf-8'
      );

      // Check for YAML frontmatter delimiters
      expect(skillContent).toContain('---');

      // Check for required fields
      expect(skillContent).toContain('name:');
      expect(skillContent).toContain('description:');

      // Extract and validate name field matches directory
      const nameMatch = skillContent.match(/^name:\s*(.+)$/m);
      expect(nameMatch).toBeTruthy();
      expect(nameMatch![1].trim()).toBe(skillName);
    });
  });
});
