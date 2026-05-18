import type { NFADefinition, NFATransitions } from './types';

/**
 * Compute the epsilon closure of a set of NFA states.
 * Returns all states reachable via epsilon transitions (transitively).
 */
export function epsilonClosure(
  transitions: NFATransitions,
  states: Set<string>
): Set<string> {
  const closure = new Set(states);
  const stack = [...states];

  while (stack.length > 0) {
    const state = stack.pop()!;
    const epsilonTargets = transitions[state]?.epsilon ?? [];
    for (const target of epsilonTargets) {
      if (!closure.has(target)) {
        closure.add(target);
        stack.push(target);
      }
    }
  }

  return closure;
}

/**
 * Compute the set of NFA states reachable from a given set of states
 * by consuming a single input symbol.
 */
export function move(
  transitions: NFATransitions,
  states: Set<string>,
  symbol: '0' | '1'
): Set<string> {
  const result = new Set<string>();
  for (const state of states) {
    const targets = transitions[state]?.[symbol] ?? [];
    for (const target of targets) {
      result.add(target);
    }
  }
  return result;
}

export interface SubsetDFA {
  states: string[];
  startState: string;
  acceptStates: string[];
  transitionTable: Record<string, Record<string, string>>;
}

/**
 * Convert an NFA to an equivalent DFA using the subset construction algorithm.
 *
 * The idea: each DFA state represents a *set* of NFA states. We start from
 * the epsilon-closure of the NFA's start state, then BFS through every
 * reachable combination by consuming each input symbol and taking the
 * epsilon-closure of the result.
 */
export function subsetConstruction(nfa: NFADefinition): SubsetDFA {
  const alphabet: Array<'0' | '1'> = ['0', '1'];

  // Helper to stringify a state set for use as DFA state ID
  function stateSetKey(states: Set<string>): string {
    return '{' + [...states].sort().join(',') + '}';
  }

  const startSet = epsilonClosure(nfa.transitions, new Set([nfa.startState]));
  const startKey = stateSetKey(startSet);

  const dfaStates = new Map<string, Set<string>>(); // key -> NFA state set
  dfaStates.set(startKey, startSet);

  const queue: string[] = [startKey];
  const transitionTable: Record<string, Record<string, string>> = {};
  const acceptStates: string[] = [];

  // Check if start state is accepting
  for (const nfaState of startSet) {
    if (nfa.acceptStates.includes(nfaState)) {
      acceptStates.push(startKey);
      break;
    }
  }

  while (queue.length > 0) {
    const currentKey = queue.shift()!;
    const currentSet = dfaStates.get(currentKey)!;

    transitionTable[currentKey] = {};

    for (const symbol of alphabet) {
      const moved = move(nfa.transitions, currentSet, symbol);
      const closure = epsilonClosure(nfa.transitions, moved);
      const nextKey = stateSetKey(closure);

      transitionTable[currentKey][symbol] = nextKey;

      if (!dfaStates.has(nextKey)) {
        dfaStates.set(nextKey, closure);
        queue.push(nextKey);

        // Check if this new state is accepting
        for (const nfaState of closure) {
          if (nfa.acceptStates.includes(nfaState)) {
            acceptStates.push(nextKey);
            break;
          }
        }
      }
    }
  }

  return {
    states: [...dfaStates.keys()],
    startState: startKey,
    acceptStates,
    transitionTable,
  };
}
