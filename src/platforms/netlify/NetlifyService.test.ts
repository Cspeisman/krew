import {describe, beforeEach, afterEach, test, expect} from "bun:test";
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import {NetlifyService} from "./NetlifyService";

describe('deleteProject with real filesystem', () => {
  let netlifyService = new NetlifyService();
  const testDir = '.netlify';
  const stateFile = join(testDir, 'state.json');

  // Set up test directory and files before each test
  beforeEach(async () => {
    // Create test directory
    await mkdir(testDir, {recursive: true});
  });

  // Clean up after each test
  afterEach(async () => {
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch (error) {
      console.warn('Error during cleanup:', error);
    }
  });

  test('should return true when state.json exists', async () => {
    // Create a test state.json file
    await writeFile(stateFile, JSON.stringify({ test: true }));

    // Run the test
    const result = await netlifyService.deleteProject();
    expect(result).toBe(true);
  });

  test('should return false when state.json does not exist', async () => {
    // Don't create the file
    const result = await netlifyService.deleteProject();
    expect(result).toBe(false);
  });

  test('should handle malformed state.json', async () => {
    // Create an empty state.json file
    await writeFile(stateFile, '');

    const result = await netlifyService.deleteProject();
    expect(result).toBe(true); // The file exists, even if empty
  });

  test('should handle directory permissions', async () => {
    // Note: This test might need to be run with appropriate permissions
    try {
      // Create a read-only directory
      await mkdir(testDir, { recursive: true, mode: 0o444 });

      const result = await netlifyService.deleteProject();
      expect(result).toBe(false);
    } finally {
      // Ensure we can clean up by restoring write permissions
      await mkdir(testDir, { recursive: true, mode: 0o777 });
    }
  });
});
