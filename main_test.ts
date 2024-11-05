import { expect, test } from 'vitest';
import { add } from "./main";

test('addTest', () => {
  expect(add(2, 3)).toBe(5);
});
