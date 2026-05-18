import { binaryNFA } from '../nfa/binaryNFA';
import { epsilonClosure, move } from '../nfa/subsetConstruction';

/**
 * Simulate NFA on input string using BFS over state sets.
 * Returns true if any path reaches an accept state after consuming all input.
 */
function simulateNFA(nfa: typeof binaryNFA, input: string): boolean {
  let currentStates = epsilonClosure(nfa.transitions, new Set([nfa.startState]));
  
  for (const char of input) {
    const moved = move(nfa.transitions, currentStates, char as '0' | '1');
    currentStates = epsilonClosure(nfa.transitions, moved);
    if (currentStates.size === 0) return false; // Dead end
  }
  
  // Check if any current state is accepting
  for (const state of currentStates) {
    if (nfa.acceptStates.includes(state)) return true;
  }
  return false;
}

// Test harness
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

function assertAccept(input: string) {
  if (!simulateNFA(binaryNFA, input)) {
    throw new Error(`Expected "${input}" to be ACCEPTED, but it was REJECTED`);
  }
}

function assertReject(input: string) {
  if (simulateNFA(binaryNFA, input)) {
    throw new Error(`Expected "${input}" to be REJECTED, but it was ACCEPTED`);
  }
}

console.log('=== Binary NFA Tests ===\n');

// Known accepted strings (from cross-verify examples)
test('accept "101000" (W=101, X=0, Y=000)', () => assertAccept('101000'));
test('accept "1110111" (W=111, X=0, Y=111)', () => assertAccept('1110111'));
test('accept "11011110" (W=11, X=01, Y=111, Z=0)', () => assertAccept('11011110'));
test('accept "01000" (W=0, X=1, Y=000)', () => assertAccept('01000'));
test('accept "00101" (W=0, X=0, Y=101)', () => assertAccept('00101'));
test('accept "10101000" (W=101, X=0, Y=101??)', () => assertAccept('10101000'));

// Known rejected strings
test('reject "" (empty)', () => assertReject(''));
test('reject "0" (too short)', () => assertReject('0'));
test('reject "1" (too short)', () => assertReject('1'));
test('reject "01" (W=0, X=1, no Y)', () => assertReject('01'));
test('reject "101" (just W, no X,Y)', () => assertReject('101'));

// Additional tests
test('accept "00000" (W=0, X=0, Y=000)', () => assertAccept('00000'));
test('accept "1010111" (W=101, X=0, Y=111)', () => assertAccept('1010111'));
test('accept "111000" (W=1, X=1, Y=000??)', () => assertAccept('111000'));

console.log(`\n=== Summary ===`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total: ${passed + failed}`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('\n✓ All NFA tests passed!');
}
