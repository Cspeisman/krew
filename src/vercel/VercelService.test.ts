import {describe, test, expect, afterAll, beforeAll} from 'bun:test';
import {VercelService} from "./VercelService.ts";
import {$} from "bun";

describe('VercelService', () => {
  describe('auth', () => {
    beforeAll(async () => {
      await $`mkdir tmp`
    })

    afterAll(async () => {
      await $`rm -rf tmp`;
    })

    test('should test if path to auth file exists', async () => {
      const paths = ['./tmp/no-existent']
      let vs = new VercelService();
      let actual = await vs.authExists(paths);
      expect(actual).toBeFalsy();

      await $`echo {} > ./tmp/exists.json`;
      paths.push('./tmp/exists.json');
      actual = await vs.authExists(paths);
      expect(actual).toBeTruthy();
    });

    test('should populate token when auth file exists', async () => {
      await $`echo {\"token\": \"test-token-1234\"} > ./tmp/auth.json`
      const paths = ['./tmp/auth.json'];
      let vs = new VercelService();
      let exists = await vs.authExists(paths);
      expect(vs.token).toBe('test-token-1234');
      expect(exists).toBeTruthy();
    });
  })
});
