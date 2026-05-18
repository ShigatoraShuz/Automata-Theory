import type { NFADefinition } from './types';
import { subsetConstruction, type SubsetDFA } from './subsetConstruction';

/**
 * Rename DFA states from subset names like "{q0,q1,q2}" to friendly names "s0", "s1", etc.
 * Deterministic: same input always produces same mapping.
 */
export function renameDFAStates(dfa: SubsetDFA): {
  states: string[];
  startState: string;
  acceptStates: string[];
  transitionTable: Record<string, Record<string, string>>;
  stateMap: Map<string, string>; // subset name -> friendly name
} {
  const stateMap = new Map<string, string>();
  let counter = 0;

  function getFriendlyName(subsetKey: string): string {
    if (!stateMap.has(subsetKey)) {
      stateMap.set(subsetKey, `s${counter++}`);
    }
    return stateMap.get(subsetKey)!;
  }

  // Rename all states in order of appearance
  const friendlyStates = dfa.states.map(s => getFriendlyName(s));
  const friendlyStart = getFriendlyName(dfa.startState);
  const friendlyAccept = dfa.acceptStates.map(s => getFriendlyName(s));

  // Rename transition table
  const friendlyTable: Record<string, Record<string, string>> = {};
  for (const [from, transitions] of Object.entries(dfa.transitionTable)) {
    const friendlyFrom = getFriendlyName(from);
    friendlyTable[friendlyFrom] = {};
    for (const [symbol, to] of Object.entries(transitions)) {
      friendlyTable[friendlyFrom][symbol] = getFriendlyName(to);
    }
  }

  return {
    states: friendlyStates,
    startState: friendlyStart,
    acceptStates: friendlyAccept,
    transitionTable: friendlyTable,
    stateMap,
  };
}

/**
 * Generate the complete binary DFA from the NFA.
 * Returns data ready to plug into dfaData.ts.
 */
export function generateBinaryDFA(nfa: NFADefinition) {
  const subsetDFA = subsetConstruction(nfa);
  const renamed = renameDFAStates(subsetDFA);

  return {
    states: renamed.states,
    startState: renamed.startState,
    acceptStates: renamed.acceptStates,
    transitionTable: renamed.transitionTable,
    stateMap: renamed.stateMap,
    // For debugging: show the subset-to-friendly mapping
    subsetMapping: Object.fromEntries(renamed.stateMap),
  };
}
