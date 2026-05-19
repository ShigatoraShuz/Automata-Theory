import { alphaDFA } from '../../data/dfaData';

const alphaRegex = /^(?:aba|bab)[ab]*bab[ab]*(?:a|b|ab|ba)(?:a|b|aa)*$/;

function simulateDFA(input: string): boolean {
  let state = alphaDFA.startState;

  for (const char of input) {
    state = alphaDFA.transitionTable[state]?.[char] ?? 'DEAD';
  }

  return alphaDFA.acceptStates.includes(state);
}

function generateStrings(alphabet: string[], maxLength: number): string[] {
  const result: string[] = [''];
  let current = [''];

  for (let length = 1; length <= maxLength; length++) {
    const next: string[] = [];
    for (const value of current) {
      for (const char of alphabet) {
        next.push(value + char);
      }
    }
    result.push(...next);
    current = next;
  }

  return result;
}

const knownAccepts = ['ababababa', 'babababaaa', 'ababbababa', 'babbababa'];
const knownRejects = ['', 'aba', 'bab', 'ababab', 'aabababab', 'bbababab'];

for (const input of knownAccepts) {
  if (!simulateDFA(input)) {
    throw new Error(`Expected alpha DFA to accept "${input}"`);
  }
}

for (const input of knownRejects) {
  if (simulateDFA(input)) {
    throw new Error(`Expected alpha DFA to reject "${input}"`);
  }
}

for (const input of generateStrings(alphaDFA.alphabet, 12)) {
  const actual = simulateDFA(input);
  const expected = alphaRegex.test(input);

  if (actual !== expected) {
    throw new Error(`Alpha DFA mismatch for "${input}": expected ${expected}, got ${actual}`);
  }
}

console.log('Alpha DFA regression passed.');
