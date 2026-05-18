// Manual test script for simulation engines
// Run with: npx tsx src/lib/__tests__/verify-engines.ts

import { buildCFGDerivation } from '../cfgSimulation';
import { buildPDASteps } from '../pdaSimulation';
import { alphaCFG, binaryCFG, alphaPDA } from '../../data/grammarData';

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ ${name}`);
    passed++;
  } catch (e) {
    console.error(`✗ ${name}: ${e instanceof Error ? e.message : String(e)}`);
    failed++;
  }
}

function assertEquals(actual: unknown, expected: unknown, msg?: string) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${msg || 'Assertion failed'}\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`);
  }
}

function assertNotNull(value: unknown, msg?: string) {
  if (value === null) {
    throw new Error(msg || 'Expected non-null value');
  }
}

function assertNull(value: unknown, msg?: string) {
  if (value !== null) {
    throw new Error(msg || 'Expected null value');
  }
}

console.log('=== CFG Simulation Tests ===\n');

test('alphaCFG: should derive "ababababa"', () => {
  const result = buildCFGDerivation(alphaCFG, 'ababababa');
  assertNotNull(result);
  assertEquals(result!.length > 0, true);
  assertEquals(result![0].nonTerminal, 'S');
  assertEquals(result![0].production, 'ABCDEF');
  const lastStep = result![result!.length - 1];
  assertEquals(lastStep.sententialAfter, 'ababababa');
});

test('alphaCFG: should derive "babababaaa"', () => {
  const result = buildCFGDerivation(alphaCFG, 'babababaaa');
  assertNotNull(result);
});

test('alphaCFG: should reject "zzz"', () => {
  const result = buildCFGDerivation(alphaCFG, 'zzz');
  assertNull(result);
});

test('alphaCFG: should reject empty string', () => {
  const result = buildCFGDerivation(alphaCFG, '');
  assertNull(result);
});

test('binaryCFG: should derive "101000"', () => {
  const result = buildCFGDerivation(binaryCFG, '101000');
  assertNotNull(result);
  const lastStep = result![result!.length - 1];
  assertEquals(lastStep.sententialAfter, '101000');
});

test('binaryCFG: should derive "11011110"', () => {
  const result = buildCFGDerivation(binaryCFG, '11011110');
  assertNotNull(result);
});

test('binaryCFG: should reject invalid input', () => {
  const result = buildCFGDerivation(binaryCFG, '11100111');
  assertNull(result);
});

test('binaryCFG: should use epsilon (Λ) production', () => {
  const result = buildCFGDerivation(binaryCFG, '101000');
  assertNotNull(result);
  const hasEpsilon = result!.some(step => step.production === 'Λ');
  assertEquals(hasEpsilon, true, 'Should have epsilon production');
});

console.log('\n=== PDA Simulation Tests ===\n');

test('alphaPDA: should accept "ababababa"', () => {
  const result = buildPDASteps(alphaPDA, 'ababababa');
  assertNotNull(result);
  assertEquals(result![0].fromState, 'start');
  assertEquals(result![0].toState, 'r1');
  assertEquals(result![0].label, '');
});

test('alphaPDA: should accept "babbababa"', () => {
  const result = buildPDASteps(alphaPDA, 'babbababa');
  assertNotNull(result);
});

test('alphaPDA: should reject "zzz"', () => {
  const result = buildPDASteps(alphaPDA, 'zzz');
  assertNull(result);
});

test('alphaPDA: should end with delta transition to accept', () => {
  const result = buildPDASteps(alphaPDA, 'ababababa');
  assertNotNull(result);
  const lastStep = result![result!.length - 1];
  assertEquals(lastStep.toState, 'accept');
  assertEquals(lastStep.label, 'Δ');
});

test('alphaPDA: should accept longer strings', () => {
  const result = buildPDASteps(alphaPDA, 'ababbababa');
  assertNotNull(result);
});

test('alphaPDA: should match character sets', () => {
  const result = buildPDASteps(alphaPDA, 'ababababa');
  assertNotNull(result);
  const loop1Steps = result!.filter(step => step.label === 'a,b');
  assertEquals(loop1Steps.length > 0, true, 'Should have a,b transitions');
});

test('alphaPDA: inputPosition should never decrease', () => {
  const result = buildPDASteps(alphaPDA, 'ababababa');
  assertNotNull(result);
  for (let i = 1; i < result!.length; i++) {
    assertEquals(result![i].inputPosition >= result![i-1].inputPosition, true);
  }
});

test('alphaPDA: should follow valid path', () => {
  const result = buildPDASteps(alphaPDA, 'ababbababa');
  assertNotNull(result);
  const hasAccept = result!.some(step => step.toState === 'accept');
  assertEquals(hasAccept, true, 'Should reach accept state');
  const states = result!.map(step => step.toState);
  assertEquals(states.includes('loop1'), true, 'Should pass through loop1');
});

console.log('\n=== Summary ===');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total: ${passed + failed}`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('\n✓ All tests passed!');
}
