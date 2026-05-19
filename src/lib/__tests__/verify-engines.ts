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
    console.log(`PASS ${name}`);
    passed++;
  } catch (e) {
    console.error(`FAIL ${name}: ${e instanceof Error ? e.message : String(e)}`);
    failed++;
  }
}

function assertEquals(actual: unknown, expected: unknown, msg?: string) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${msg || 'Assertion failed'}\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`);
  }
}

console.log('=== CFG Simulation Tests ===\n');

test('alphaCFG: should derive "ababababa"', () => {
  const result = buildCFGDerivation(alphaCFG, 'ababababa');
  assertEquals(result.succeeded, true);
  assertEquals(result.steps.length > 0, true);
  assertEquals(result.steps[0].nonTerminal, 'S');
  assertEquals(result.steps[0].production, 'ABCDEF');
  const lastStep = result.steps[result.steps.length - 1];
  assertEquals(lastStep.sententialAfter, 'ababababa');
});

test('alphaCFG: should derive "babababaaa"', () => {
  const result = buildCFGDerivation(alphaCFG, 'babababaaa');
  assertEquals(result.succeeded, true);
});

test('alphaCFG: should reject "zzz"', () => {
  const result = buildCFGDerivation(alphaCFG, 'zzz');
  assertEquals(result.succeeded, false);
});

test('alphaCFG: should reject empty string', () => {
  const result = buildCFGDerivation(alphaCFG, '');
  assertEquals(result.succeeded, false);
});

test('binaryCFG: should derive "101000"', () => {
  const result = buildCFGDerivation(binaryCFG, '101000');
  assertEquals(result.succeeded, true);
  const lastStep = result.steps[result.steps.length - 1];
  assertEquals(lastStep.sententialAfter, '101000');
});

test('binaryCFG: should derive "11011110"', () => {
  const result = buildCFGDerivation(binaryCFG, '11011110');
  assertEquals(result.succeeded, true);
});

test('binaryCFG: should reject invalid input', () => {
  const result = buildCFGDerivation(binaryCFG, '11100111');
  assertEquals(result.succeeded, false);
});

test('binaryCFG: should use epsilon production', () => {
  const result = buildCFGDerivation(binaryCFG, '101000');
  assertEquals(result.succeeded, true);
  const hasEpsilon = result.steps.some(step => step.production === 'Î›');
  assertEquals(hasEpsilon, true, 'Should have epsilon production');
});

console.log('\n=== PDA Simulation Tests ===\n');

test('alphaPDA: should accept "ababababa"', () => {
  const result = buildPDASteps(alphaPDA, 'ababababa');
  assertEquals(result.succeeded, true);
  assertEquals(result.steps[0].fromState, 'start');
  assertEquals(result.steps[0].toState, 'r1');
  assertEquals(result.steps[0].label, '');
});

test('alphaPDA: should accept "babbababa"', () => {
  const result = buildPDASteps(alphaPDA, 'babbababa');
  assertEquals(result.succeeded, true);
});

test('alphaPDA: should reject "zzz"', () => {
  const result = buildPDASteps(alphaPDA, 'zzz');
  assertEquals(result.succeeded, false);
});

test('alphaPDA: should end with delta transition to accept', () => {
  const result = buildPDASteps(alphaPDA, 'ababababa');
  assertEquals(result.succeeded, true);
  const lastStep = result.steps[result.steps.length - 1];
  assertEquals(lastStep.toState, 'accept');
  assertEquals(lastStep.label, 'Î”');
});

test('alphaPDA: should accept longer strings', () => {
  const result = buildPDASteps(alphaPDA, 'ababbababa');
  assertEquals(result.succeeded, true);
});

test('alphaPDA: should match character sets', () => {
  const result = buildPDASteps(alphaPDA, 'ababababa');
  assertEquals(result.succeeded, true);
  const loop1Steps = result.steps.filter(step => step.label === 'a,b');
  assertEquals(loop1Steps.length > 0, true, 'Should have a,b transitions');
});

test('alphaPDA: inputPosition should never decrease', () => {
  const result = buildPDASteps(alphaPDA, 'ababababa');
  assertEquals(result.succeeded, true);
  for (let i = 1; i < result.steps.length; i++) {
    assertEquals(result.steps[i].inputPosition >= result.steps[i - 1].inputPosition, true);
  }
});

test('alphaPDA: should follow valid path', () => {
  const result = buildPDASteps(alphaPDA, 'ababbababa');
  assertEquals(result.succeeded, true);
  const hasAccept = result.steps.some(step => step.toState === 'accept');
  assertEquals(hasAccept, true, 'Should reach accept state');
  const states = result.steps.map(step => step.toState);
  assertEquals(states.includes('loop1'), true, 'Should pass through loop1');
});

console.log('\n=== Summary ===');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total: ${passed + failed}`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('\nAll tests passed!');
}
