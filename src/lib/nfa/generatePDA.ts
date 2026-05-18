import type { NFADefinition } from './types';

export interface PDAState {
  id: string;
  label: string;
  type: 'start' | 'read' | 'push' | 'pop' | 'accept' | 'reject';
  x: number;
  y: number;
}

export interface PDATransition {
  from: string;
  to: string;
  label: string; // "0", "1", "" (epsilon), or "0,1" (set)
  curve?: 'straight' | 'curve-up' | 'curve-down' | 'self-loop-top' | 'self-loop-bottom' | 'self-loop-left' | 'self-loop-right' | 'step-down' | 'step-up';
  labelOffset?: { x: number; y: number };
}

export interface GeneratedPDA {
  states: PDAState[];
  transitions: PDATransition[];
}

/**
 * Generate PDA from NFA. Each NFA state becomes a PDA state.
 * Each NFA transition becomes a PDA transition.
 * Epsilon transitions in NFA become epsilon transitions in PDA.
 */
export function generatePDAFromNFA(nfa: NFADefinition): GeneratedPDA {
  // Create PDA states from NFA states
  const states: PDAState[] = nfa.states.map((id) => {
    let type: PDAState['type'] = 'read';
    if (id === nfa.startState) type = 'start';
    if (nfa.acceptStates.includes(id)) type = 'accept';

    // Generate labels based on state purpose
    let label = id.toUpperCase();
    if (type === 'start') label = 'START';
    if (type === 'accept') label = 'ACCEPT';

    return { id, label, type, x: 0, y: 0 }; // Coordinates will be hand-coded later
  });

  // Create PDA transitions from NFA transitions
  const transitions: PDATransition[] = [];

  for (const [from, trans] of Object.entries(nfa.transitions)) {
    // Handle '0' transitions
    if (trans['0']) {
      for (const to of trans['0']) {
        transitions.push({ from, to, label: '0' });
      }
    }

    // Handle '1' transitions
    if (trans['1']) {
      for (const to of trans['1']) {
        transitions.push({ from, to, label: '1' });
      }
    }

    // Handle epsilon transitions
    if (trans.epsilon) {
      for (const to of trans.epsilon) {
        transitions.push({ from, to, label: '' }); // Empty string = epsilon
      }
    }
  }

  return { states, transitions };
}

/**
 * Generate the complete binary PDA from the NFA.
 */
export function generateBinaryPDA(nfa: NFADefinition): GeneratedPDA {
  return generatePDAFromNFA(nfa);
}
