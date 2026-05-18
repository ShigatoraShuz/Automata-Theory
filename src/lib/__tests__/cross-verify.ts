/**
 * Cross-verification script: Tests that DFA, CFG, and PDA produce
 * IDENTICAL accept/reject results for the same input strings.
 * 
 * Run with: npx tsx src/lib/__tests__/cross-verify.ts
 */

import { alphaDFA, binaryDFA } from '../../data/dfaData';
import { alphaCFG, binaryCFG, alphaPDA, binaryPDA } from '../../data/grammarData';
import { buildCFGDerivation } from '../cfgSimulation';
import { buildPDASteps } from '../pdaSimulation';
import type { DFADefinition } from '../../types';

// ========== DFA Simulation (extracted from SimulationPanel.tsx) ==========

function simulateDFA(dfa: DFADefinition, input: string): boolean {
  let current = dfa.startState;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    const next = dfa.transitionTable[current]?.[ch];
    if (!next) return false; // Dead state
    current = next;
  }
  return dfa.acceptStates.includes(current);
}

// ========== CFG Simulation Wrapper ==========

function simulateCFG(cfg: typeof alphaCFG, input: string): boolean {
  const { succeeded } = buildCFGDerivation(cfg, input);
  return succeeded;
}

// ========== PDA Simulation Wrapper ==========

function simulatePDA(pda: typeof alphaPDA, input: string): boolean {
  const { succeeded } = buildPDASteps(pda, input);
  return succeeded;
}

// ========== Test Harness ==========

interface TestResult {
  input: string;
  dfa: boolean;
  cfg: boolean;
  pda: boolean;
  consistent: boolean;
}

function runTest(name: string, dfaDef: DFADefinition, cfgDef: typeof alphaCFG, pdaDef: typeof alphaPDA, inputs: string[]): TestResult[] {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing: ${name}`);
  console.log(`${'='.repeat(60)}\n`);

  const results: TestResult[] = [];
  let consistent = 0;
  let inconsistent = 0;

  for (const input of inputs) {
    const dfaResult = simulateDFA(dfaDef, input);
    const cfgResult = simulateCFG(cfgDef, input);
    const pdaResult = simulatePDA(pdaDef, input);

    const isConsistent = dfaResult === cfgResult && cfgResult === pdaResult;
    
    const result: TestResult = {
      input,
      dfa: dfaResult,
      cfg: cfgResult,
      pda: pdaResult,
      consistent: isConsistent,
    };
    results.push(result);

    if (isConsistent) {
      consistent++;
      console.log(`✓ "${input}" → DFA:${dfaResult} CFG:${cfgResult} PDA:${pdaResult} [CONSISTENT]`);
    } else {
      inconsistent++;
      console.log(`✗ "${input}" → DFA:${dfaResult} CFG:${cfgResult} PDA:${pdaResult} [INCONSISTENT!]`);
    }
  }

  console.log(`\n${name} Summary: ${consistent} consistent, ${inconsistent} inconsistent out of ${inputs.length} tests`);
  return results;
}

// ========== Test Cases ==========

// Generate all strings up to length N over given alphabet
function generateStrings(alphabet: string[], maxLength: number): string[] {
  const result: string[] = ['']; // Include empty string
  let current = [''];
  
  for (let len = 1; len <= maxLength; len++) {
    const next: string[] = [];
    for (const str of current) {
      for (const ch of alphabet) {
        next.push(str + ch);
      }
    }
    result.push(...next);
    current = next;
  }
  
  return result;
}

// Known examples from the data files
const alphaExamples = ['ababababa', 'babababaaa', 'ababbababa', 'babbababa', 'ababaabab'];
const binaryExamples = ['11100111', '10101000', '11001111', '11011110'];

// Edge cases
const alphaEdgeCases = [
  '',           // empty
  'a',          // single char
  'b',          // single char
  'aba',        // just prefix
  'bab',        // just prefix
  'ababab',     // prefix + partial wildcard
  'ababbab',    // prefix + wildcard + middle bab
  'ababbaba',   // prefix + wildcard + bab + suffix a
  'ababbabab',  // prefix + wildcard + bab + suffix ab
  'ababbabba',  // prefix + wildcard + bab + suffix ba
  'ababbabaa',  // prefix + wildcard + bab + suffix a + aa
  'bababababa', // bab prefix variant
  'abababbaba', // longer string
  'aabababab',  // starts with aa (invalid)
  'bbababab',   // starts with bb (invalid)
  'abababab',   // missing middle bab
];

const binaryEdgeCases = [
  '',           // empty
  '0',          // single 0
  '1',          // single 1
  '101',        // just Group 1 (101)
  '111',        // just Group 1 (111)
  '01',         // 0 + 1
  '11',         // just Group 1 (11)
  '1010',       // 101 + 0
  '1011',       // 101 + 1
  '10101',      // 101 + 0 + 1? or 1010 + 1?
  '101000',     // 101 + 0 + 000
  '10101000',   // 101 + 0 + 101 + 000
  '11101110',   // 111 + 0 + 111 + 0
  '01000',      // 0 + 1 + 000
  '11000',      // 11 + 0 + 000
  '0011',       // 0 + 0 + 11? invalid
  '101011',     // 101 + 0 + 11
];

// ========== Main ==========

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║     CROSS-VERIFICATION: DFA vs CFG vs PDA Consistency     ║');
console.log('╚════════════════════════════════════════════════════════════╝');

// Generate exhaustive strings up to length 8
const alphaStrings = generateStrings(['a', 'b'], 8);
const binaryStrings = generateStrings(['0', '1'], 8);

console.log(`\nGenerated ${alphaStrings.length} alpha strings and ${binaryStrings.length} binary strings for testing.\n`);

// Run tests
const alphaExhaustiveResults = runTest(
  'ALPHA DFA/CFG/PDA - Exhaustive (length ≤ 8)',
  alphaDFA, alphaCFG, alphaPDA,
  alphaStrings
);

const binaryExhaustiveResults = runTest(
  'BINARY DFA/CFG/PDA - Exhaustive (length ≤ 8)',
  binaryDFA, binaryCFG, binaryPDA,
  binaryStrings
);

const alphaExampleResults = runTest(
  'ALPHA - Known Examples',
  alphaDFA, alphaCFG, alphaPDA,
  alphaExamples
);

const binaryExampleResults = runTest(
  'BINARY - Known Examples',
  binaryDFA, binaryCFG, binaryPDA,
  binaryExamples
);

const alphaEdgeResults = runTest(
  'ALPHA - Edge Cases',
  alphaDFA, alphaCFG, alphaPDA,
  alphaEdgeCases
);

const binaryEdgeResults = runTest(
  'BINARY - Edge Cases',
  binaryDFA, binaryCFG, binaryPDA,
  binaryEdgeCases
);

// ========== Summary ==========

function countInconsistencies(results: TestResult[]): number {
  return results.filter(r => !r.consistent).length;
}

function findDisagreements(results: TestResult[]): TestResult[] {
  return results.filter(r => !r.consistent);
}

console.log('\n' + '═'.repeat(60));
console.log('FINAL SUMMARY');
console.log('═'.repeat(60));

const alphaExhIncon = countInconsistencies(alphaExhaustiveResults);
const binaryExhIncon = countInconsistencies(binaryExhaustiveResults);
const alphaExIncon = countInconsistencies(alphaExampleResults);
const binaryExIncon = countInconsistencies(binaryExampleResults);
const alphaEdgeIncon = countInconsistencies(alphaEdgeResults);
const binaryEdgeIncon = countInconsistencies(binaryEdgeResults);

console.log(`\nAlpha Exhaustive: ${alphaExhIncon} inconsistencies out of ${alphaExhaustiveResults.length}`);
console.log(`Binary Exhaustive: ${binaryExhIncon} inconsistencies out of ${binaryExhaustiveResults.length}`);
console.log(`Alpha Examples: ${alphaExIncon} inconsistencies out of ${alphaExampleResults.length}`);
console.log(`Binary Examples: ${binaryExIncon} inconsistencies out of ${binaryExampleResults.length}`);
console.log(`Alpha Edge Cases: ${alphaEdgeIncon} inconsistencies out of ${alphaEdgeResults.length}`);
console.log(`Binary Edge Cases: ${binaryEdgeIncon} inconsistencies out of ${binaryEdgeResults.length}`);

const totalIncon = alphaExhIncon + binaryExhIncon + alphaExIncon + binaryExIncon + alphaEdgeIncon + binaryEdgeIncon;

if (totalIncon === 0) {
  console.log('\n✅ ALL TESTS CONSISTENT! DFA, CFG, and PDA agree on all inputs.');
} else {
  console.log(`\n❌ FOUND ${totalIncon} INCONSISTENCIES!`);
  
  // Show first 20 disagreements from exhaustive tests
  const alphaDisagreements = findDisagreements(alphaExhaustiveResults).slice(0, 20);
  const binaryDisagreements = findDisagreements(binaryExhaustiveResults).slice(0, 20);
  
  if (alphaDisagreements.length > 0) {
    console.log('\n--- Alpha Disagreements (first 20) ---');
    for (const d of alphaDisagreements) {
      console.log(`  "${d.input}" → DFA:${d.dfa} CFG:${d.cfg} PDA:${d.pda}`);
    }
  }
  
  if (binaryDisagreements.length > 0) {
    console.log('\n--- Binary Disagreements (first 20) ---');
    for (const d of binaryDisagreements) {
      console.log(`  "${d.input}" → DFA:${d.dfa} CFG:${d.cfg} PDA:${d.pda}`);
    }
  }
}

// Exit with error code if inconsistencies found
if (totalIncon > 0) {
  process.exit(1);
}
