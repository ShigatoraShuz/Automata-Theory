import type { CFGDefinition, PDADefinition } from '../types';

export const alphaCFG: CFGDefinition = {
  startSymbol: 'S',
  description: 'Context-Free Grammar for (aba + bab)(a+b)*(bab)(a+b)*(a+b+ab+ba)(a+b+aa)*',
  alphabet: ['a', 'b'],
  examples: ['ababababa', 'babababaaa', 'ababbababa', 'babbababa', 'ababaabab'],
  productions: [
    {
      nonTerminal: 'S',
      productions: ['ABCDEF'],
      description: 'The Whole String: ABCDEF',
    },
    {
      nonTerminal: 'A',
      productions: ['aba', 'bab'],
      description: 'Prefix: aba or bab',
    },
    {
      nonTerminal: 'B',
      productions: ['aB', 'bB', 'Λ'],
      description: 'Wildcard 1: Any combination of as and bs, or empty.',
    },
    {
      nonTerminal: 'C',
      productions: ['bab'],
      description: 'Middle: Exactly bab',
    },
    {
      nonTerminal: 'D',
      productions: ['aD', 'bD', 'Λ'],
      description: 'Wildcard 2: Any combination of as and bs, or empty.',
    },
    {
      nonTerminal: 'E',
      productions: ['a', 'b', 'ab', 'ba'],
      description: 'Suffix 1: a, b, ab, or ba',
    },
    {
      nonTerminal: 'F',
      productions: ['a', 'b', 'aa', 'Λ'],
      description: 'Suffix 2: a, b, aa, or empty',
    },
  ],
};

export const binaryCFG: CFGDefinition = {
  startSymbol: 'S',
  description: 'Context-Free Grammar for ((101+111)+(1+0+11))(1+0+01)(111+000+101)(1+0)*',
  alphabet: ['0', '1'],
  examples: ['11100111', '10101000', '11001111', '11011110'],
  productions: [
    {
      nonTerminal: 'S',
      productions: ['WXYZ'],
      description: 'The Whole String: WXYZ',
    },
    {
      nonTerminal: 'W',
      productions: ['101', '111', '1', '0', '11'],
      description: 'Group 1: 101, 111, 1, 0, or 11',
    },
    {
      nonTerminal: 'X',
      productions: ['1', '0', '01'],
      description: 'Group 2: 1, 0, or 01',
    },
    {
      nonTerminal: 'Y',
      productions: ['111', '000', '101'],
      description: 'Group 3: 111, 000, or 101',
    },
    {
      nonTerminal: 'Z',
      productions: ['1Z', '0Z', 'Λ'],
      description: 'Final Loop: Any combination of 1s and 0s, or empty.',
    },
  ],
};

export const alphaPDA: PDADefinition = {
  id: 'alpha-pda-detailed',
  name: 'Alphabetic PDA Blueprint',
  description: 'High-Fidelity Flowchart for (aba+bab)(a+b)*(bab)(a+b)*(a+b+ab+ba)(a+b+aa)*',
  viewBox: '0 0 1700 850',
  alphabet: ['a', 'b'],
  examples: ['ababababa', 'babababaaa', 'ababbababa', 'babbababa'],
  states: [
    { id: 'start', type: 'start', label: 'START', x: 50, y: 400 },
    { id: 'r1', type: 'read', label: 'READ₁', x: 180, y: 300 },
    { id: 'r_aba_1', type: 'read', label: 'READ_a', x: 320, y: 200 },
    { id: 'r_aba_2', type: 'read', label: 'READ_b', x: 460, y: 200 },
    { id: 'r_bab_1', type: 'read', label: 'READ_b', x: 320, y: 400 },
    { id: 'r_bab_2', type: 'read', label: 'READ_a', x: 460, y: 400 },
    { id: 'loop1', type: 'read', label: 'LOOP₁', x: 650, y: 300 },
    { id: 'mid_b', type: 'read', label: 'READ_b', x: 800, y: 450 },
    { id: 'mid_a', type: 'read', label: 'READ_a', x: 950, y: 550 },
    { id: 'mid_b2', type: 'read', label: 'READ_b', x: 1100, y: 550 },
    { id: 'loop2', type: 'read', label: 'LOOP₂', x: 1250, y: 650 },
    { id: 'suffix_a', type: 'read', label: 'READ_a', x: 1400, y: 750 },
    { id: 'suffix_b', type: 'read', label: 'READ_b', x: 1400, y: 550 },
    { id: 'suffix_ab_b', type: 'read', label: 'READ_b', x: 1500, y: 750 },
    { id: 'suffix_ba_a', type: 'read', label: 'READ_a', x: 1500, y: 550 },
    { id: 'accept', type: 'accept', label: 'ACCEPT', x: 1600, y: 650 },
    { id: 'reject', type: 'reject', label: 'REJECT', x: 800, y: 100 },
  ],
  transitions: [
    { from: 'start', to: 'r1', label: '' },
    { from: 'r1', to: 'r_aba_1', label: 'a' },
    { from: 'r1', to: 'r_bab_1', label: 'b' },
    { from: 'r_aba_1', to: 'r_aba_2', label: 'b' },
    { from: 'r_bab_1', to: 'r_bab_2', label: 'a' },
    { from: 'r_aba_2', to: 'loop1', label: 'a' },
    { from: 'r_bab_2', to: 'loop1', label: 'b' },
    { from: 'loop1', to: 'loop1', label: 'a,b', curve: 'self-loop-top' },
    { from: 'loop1', to: 'mid_b', label: 'b' },
    { from: 'mid_b', to: 'mid_a', label: 'a' },
    { from: 'mid_a', to: 'mid_b2', label: 'b' },
    { from: 'mid_b2', to: 'loop2', label: '' },
    { from: 'loop2', to: 'loop2', label: 'a,b', curve: 'self-loop-top' },
    // Suffix handling: (a+b+ab+ba)
    // Single char suffix: a or b
    { from: 'loop2', to: 'suffix_a', label: 'a' },
    { from: 'loop2', to: 'suffix_b', label: 'b' },
    // Two char suffix: ab (a then b)
    { from: 'suffix_a', to: 'suffix_ab_b', label: 'b' },
    // Two char suffix: ba (b then a)
    { from: 'suffix_b', to: 'suffix_ba_a', label: 'a' },
    // Accept transitions
    { from: 'suffix_a', to: 'accept', label: 'Δ' },
    { from: 'suffix_b', to: 'accept', label: 'Δ' },
    { from: 'suffix_ab_b', to: 'accept', label: 'Δ' },
    { from: 'suffix_ba_a', to: 'accept', label: 'Δ' },
    // Reject transitions
    { from: 'r1', to: 'reject', label: 'Δ' },
    { from: 'mid_b', to: 'reject', label: 'Δ' },
  ],
};

export const binaryPDA: PDADefinition = {
  id: 'binary-pda-detailed',
  name: 'Binary PDA Blueprint',
  description: 'Formal Flowchart for ((101+111)+(1+0+11))(1+0+01)(111+000+101)(1+0)*',
  viewBox: '0 0 1800 900',
  alphabet: ['0', '1'],
  examples: ['11100111', '10101000', '11001111', '11011110'],
  states: [
    // Start
    { id: 'q0', type: 'start', label: 'START', x: 80, y: 450 },
    // Group 1: (101+111)+(1+0+11)
    { id: 'q1', type: 'read', label: 'G1✓', x: 500, y: 450 },
    { id: 'q2', type: 'read', label: 'READ₁', x: 200, y: 250 },
    { id: 'q3', type: 'read', label: 'READ₀', x: 200, y: 450 },
    { id: 'q4', type: 'read', label: 'READ₁', x: 350, y: 450 },
    { id: 'q5', type: 'read', label: 'READ₁', x: 200, y: 650 },
    { id: 'q6', type: 'read', label: 'READ₁', x: 350, y: 650 },
    // Group 2: (1+0+01)
    { id: 'q7', type: 'read', label: 'G2_START', x: 600, y: 450 },
    { id: 'q8', type: 'read', label: 'G2✓', x: 800, y: 450 },
    { id: 'q9', type: 'read', label: 'READ₁', x: 700, y: 600 },
    // Group 3: (111+000+101)
    { id: 'q10', type: 'read', label: 'G3_START', x: 900, y: 450 },
    { id: 'q11', type: 'read', label: 'READ₁', x: 1000, y: 250 },
    { id: 'q12', type: 'read', label: 'READ₁', x: 1150, y: 250 },
    { id: 'q13', type: 'read', label: 'READ₁', x: 1000, y: 450 },
    { id: 'q14', type: 'read', label: 'READ₀', x: 1150, y: 450 },
    { id: 'q15', type: 'read', label: 'READ₀', x: 1000, y: 650 },
    { id: 'q16', type: 'read', label: 'READ₀', x: 1150, y: 650 },
    { id: 'q17', type: 'read', label: 'G3✓', x: 1300, y: 450 },
    // Final loop and accept
    { id: 'q18', type: 'accept', label: 'ACCEPT', x: 1600, y: 450 },
  ],
  transitions: [
    // Group 1: (101+111)+(1+0+11)
    { from: 'q0', to: 'q1', label: '0', curve: 'straight', labelOffset: { x: 0, y: -20 } },
    { from: 'q0', to: 'q1', label: '1', curve: 'curve-up', labelOffset: { x: 0, y: -40 } },
    { from: 'q0', to: 'q2', label: '1', curve: 'straight', labelOffset: { x: 0, y: -15 } },
    { from: 'q0', to: 'q3', label: '1', curve: 'straight', labelOffset: { x: 0, y: -15 } },
    { from: 'q0', to: 'q5', label: '1', curve: 'straight', labelOffset: { x: 0, y: 15 } },
    { from: 'q2', to: 'q1', label: '1', curve: 'straight', labelOffset: { x: 0, y: -15 } },
    { from: 'q3', to: 'q4', label: '0', curve: 'straight', labelOffset: { x: 0, y: -15 } },
    { from: 'q4', to: 'q1', label: '1', curve: 'straight', labelOffset: { x: 0, y: -15 } },
    { from: 'q5', to: 'q6', label: '1', curve: 'straight', labelOffset: { x: 0, y: 15 } },
    { from: 'q6', to: 'q1', label: '1', curve: 'straight', labelOffset: { x: 0, y: 15 } },
    // Group 1 → Group 2 (ε-transition)
    { from: 'q1', to: 'q7', label: '', curve: 'straight', labelOffset: { x: 0, y: -15 } },
    // Group 2: (1+0+01)
    { from: 'q7', to: 'q8', label: '0', curve: 'straight', labelOffset: { x: 0, y: -20 } },
    { from: 'q7', to: 'q9', label: '0', curve: 'straight', labelOffset: { x: 0, y: 15 } },
    { from: 'q7', to: 'q8', label: '1', curve: 'curve-up', labelOffset: { x: 0, y: -40 } },
    { from: 'q9', to: 'q8', label: '1', curve: 'straight', labelOffset: { x: 0, y: 15 } },
    // Group 2 → Group 3 (ε-transition)
    { from: 'q8', to: 'q10', label: '', curve: 'straight', labelOffset: { x: 0, y: -15 } },
    // Group 3: (111+000+101)
    { from: 'q10', to: 'q15', label: '0', curve: 'straight', labelOffset: { x: 0, y: 15 } },
    { from: 'q10', to: 'q11', label: '1', curve: 'straight', labelOffset: { x: 0, y: -15 } },
    { from: 'q10', to: 'q13', label: '1', curve: 'straight', labelOffset: { x: 0, y: -15 } },
    { from: 'q11', to: 'q12', label: '1', curve: 'straight', labelOffset: { x: 0, y: -15 } },
    { from: 'q12', to: 'q17', label: '1', curve: 'straight', labelOffset: { x: 0, y: -15 } },
    { from: 'q13', to: 'q14', label: '0', curve: 'straight', labelOffset: { x: 0, y: -15 } },
    { from: 'q14', to: 'q17', label: '1', curve: 'straight', labelOffset: { x: 0, y: -15 } },
    { from: 'q15', to: 'q16', label: '0', curve: 'straight', labelOffset: { x: 0, y: 15 } },
    { from: 'q16', to: 'q17', label: '0', curve: 'straight', labelOffset: { x: 0, y: 15 } },
    // Group 3 → Accept (ε-transition)
    { from: 'q17', to: 'q18', label: '', curve: 'straight', labelOffset: { x: 0, y: -15 } },
    // Final loop: (1+0)*
    { from: 'q18', to: 'q18', label: '0', curve: 'self-loop-bottom', labelOffset: { x: -20, y: 20 } },
    { from: 'q18', to: 'q18', label: '1', curve: 'self-loop-bottom', labelOffset: { x: 20, y: 20 } },
  ],
};
