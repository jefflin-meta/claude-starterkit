import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface TestResult {
  success: boolean;
  output: string;
  error?: string;
}

export async function runTests(): Promise<TestResult> {
  try {
    console.log('Running test suite...\n');

    const { stdout, stderr } = await execAsync('npm test');

    return {
      success: true,
      output: stdout
    };
  } catch (error: any) {
    return {
      success: false,
      output: error.stdout || '',
      error: error.stderr || error.message
    };
  }
}
