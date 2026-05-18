import type { DFADefinition } from '../types';

export const alphaDFA: DFADefinition = {
  id: 'alpha',
  name: 'Alphabetic DFA',
  regex: '(aba + bab)(a+b)*(bab)(a+b)*(a+b+ab+ba)(a+b+aa)*',
  alphabet: ['a', 'b'],
  viewBox: '0 0 960 560',
  startState: 's0',
  acceptStates: ['s9'],
  examples: ['ababababa', 'babababaaa', 'ababbababa', 'babbababa'],
  states: [
    { id: 's0', label: 's0', x: 70,  y: 300, isStart: true,  isAccept: false },
    { id: 's1', label: 's1', x: 210, y: 160, isStart: false, isAccept: false },
    { id: 's2', label: 's2', x: 210, y: 440, isStart: false, isAccept: false },
    { id: 's3', label: 's3', x: 360, y: 160, isStart: false, isAccept: false },
    { id: 's4', label: 's4', x: 360, y: 440, isStart: false, isAccept: false },
    { id: 'T',  label: 'T',  x: 360, y: 300, isStart: false, isAccept: false, isTrap: true },
    { id: 's5', label: 's5', x: 530, y: 160, isStart: false, isAccept: false },
    { id: 's6', label: 's6', x: 700, y: 160, isStart: false, isAccept: false },
    { id: 's7', label: 's7', x: 700, y: 300, isStart: false, isAccept: false },
    { id: 's8', label: 's8', x: 530, y: 440, isStart: false, isAccept: false },
    { id: 's9', label: 's9', x: 700, y: 440, isStart: false, isAccept: true },
  ],
  transitions: [
    { from: 's0', to: 's1', label: 'b', curve: 'curve-up',   labelOffset: { x: -10, y: -10 } },
    { from: 's0', to: 's2', label: 'a', curve: 'curve-down', labelOffset: { x: -10, y: 12 } },
    { from: 's1', to: 's3', label: 'a', curve: 'straight',   labelOffset: { x: 0, y: -14 } },
    { from: 's1', to: 'T',  label: 'b', curve: 'curve-down', labelOffset: { x: 12, y: 0 } },
    { from: 's2', to: 's4', label: 'b', curve: 'straight',   labelOffset: { x: 0, y: 14 } },
    { from: 's2', to: 'T',  label: 'a', curve: 'curve-up',   labelOffset: { x: 12, y: 0 } },
    { from: 's3', to: 's5', label: 'b', curve: 'straight',   labelOffset: { x: 0, y: -14 } },
    { from: 's3', to: 'T',  label: 'a', curve: 'curve-down', labelOffset: { x: 12, y: -10 } },
    { from: 's4', to: 's5', label: 'a', curve: 'curve-up',   labelOffset: { x: 0, y: -14 } },
    { from: 's4', to: 'T',  label: 'b', curve: 'curve-up',   labelOffset: { x: 12, y: 10 } },
    { from: 'T',  to: 'T',  label: 'a,b', curve: 'self-loop-left', labelOffset: { x: -30, y: 0 } },
    { from: 's5', to: 's5', label: 'a', curve: 'self-loop-top', labelOffset: { x: 0, y: -28 } },
    { from: 's5', to: 's6', label: 'b', curve: 'straight',   labelOffset: { x: 0, y: -14 } },
    { from: 's6', to: 's6', label: 'b', curve: 'self-loop-top', labelOffset: { x: 0, y: -28 } },
    { from: 's6', to: 's7', label: 'a', curve: 'straight',   labelOffset: { x: 14, y: 0 } },
    { from: 's7', to: 's5', label: 'a', curve: 'curve-up',   labelOffset: { x: 0, y: -14 } },
    { from: 's7', to: 's8', label: 'b', curve: 'curve-down', labelOffset: { x: 14, y: 0 } },
    { from: 's8', to: 's9', label: 'a,b', curve: 'straight', labelOffset: { x: 0, y: 14 } },
    { from: 's9', to: 's9', label: 'a,b', curve: 'self-loop-bottom', labelOffset: { x: 0, y: 30 } },
  ],
  transitionTable: {
    s0: { a: 's2', b: 's1' },
    s1: { a: 's3', b: 'T'  },
    s2: { a: 'T',  b: 's4' },
    s3: { a: 'T',  b: 's5' },
    s4: { a: 's5', b: 'T'  },
    T:  { a: 'T',  b: 'T'  },
    s5: { a: 's5', b: 's6' },
    s6: { a: 's7', b: 's6' },
    s7: { a: 's5', b: 's8' },
    s8: { a: 's9', b: 's9' },
    s9: { a: 's9', b: 's9' },
  },
};

export const binaryDFA: DFADefinition = {
  id: 'binary',
  name: 'Binary DFA',
  regex: '((101 + 111) + (1 + 0 + 11))(1 + 0 + 01)(111 + 000 + 101)(1+0)*',
  alphabet: ['0', '1'],
  viewBox: '0 0 2000 1200',
  startState: 's0',
  acceptStates: ['s21', 's22', 's23', 's24', 's25', 's26', 's27', 's28', 's29', 's30'],
  examples: ['11100111', '10101000', '11001111', '11011110'],
  states: [
    // Start state
    { id: 's0', label: 's0', x: 100, y: 600, isStart: true, isAccept: false },
    // Group 1 expansion (s1-s6)
    { id: 's1', label: 's1', x: 300, y: 300, isStart: false, isAccept: false },
    { id: 's2', label: 's2', x: 300, y: 900, isStart: false, isAccept: false },
    { id: 's3', label: 's3', x: 500, y: 200, isStart: false, isAccept: false },
    { id: 's4', label: 's4', x: 500, y: 450, isStart: false, isAccept: false },
    { id: 's5', label: 's5', x: 500, y: 700, isStart: false, isAccept: false },
    { id: 's6', label: 's6', x: 500, y: 1000, isStart: false, isAccept: false },
    // Group 2 (s7-s11)
    { id: 's7', label: 's7', x: 700, y: 300, isStart: false, isAccept: false },
    { id: 's8', label: 's8', x: 700, y: 550, isStart: false, isAccept: false },
    { id: 's9', label: 's9', x: 700, y: 800, isStart: false, isAccept: false },
    { id: 's10', label: 's10', x: 800, y: 950, isStart: false, isAccept: false },
    { id: 's11', label: 's11', x: 800, y: 700, isStart: false, isAccept: false },
    // Group 3 (s12-s20)
    { id: 's12', label: 's12', x: 950, y: 250, isStart: false, isAccept: false },
    { id: 's13', label: 's13', x: 1050, y: 600, isStart: false, isAccept: false, isTrap: true },
    { id: 's14', label: 's14', x: 950, y: 450, isStart: false, isAccept: false },
    { id: 's15', label: 's15', x: 1050, y: 300, isStart: false, isAccept: false },
    { id: 's16', label: 's16', x: 1150, y: 200, isStart: false, isAccept: false },
    { id: 's17', label: 's17', x: 1150, y: 400, isStart: false, isAccept: false },
    { id: 's18', label: 's18', x: 950, y: 800, isStart: false, isAccept: false },
    { id: 's19', label: 's19', x: 1050, y: 900, isStart: false, isAccept: false },
    { id: 's20', label: 's20', x: 1150, y: 750, isStart: false, isAccept: false },
    // Accept states and loop (s21-s30)
    { id: 's21', label: 's21', x: 1400, y: 300, isStart: false, isAccept: true },
    { id: 's22', label: 's22', x: 1400, y: 550, isStart: false, isAccept: true },
    { id: 's23', label: 's23', x: 1400, y: 800, isStart: false, isAccept: true },
    { id: 's24', label: 's24', x: 1500, y: 900, isStart: false, isAccept: true },
    { id: 's25', label: 's25', x: 1500, y: 400, isStart: false, isAccept: true },
    { id: 's26', label: 's26', x: 1650, y: 300, isStart: false, isAccept: true },
    { id: 's27', label: 's27', x: 1650, y: 800, isStart: false, isAccept: true },
    { id: 's28', label: 's28', x: 1750, y: 600, isStart: false, isAccept: true },
    { id: 's29', label: 's29', x: 1800, y: 400, isStart: false, isAccept: true },
    { id: 's30', label: 's30', x: 1850, y: 550, isStart: false, isAccept: true },
  ],
  transitions: [
    // s0 transitions
    { from: 's0', to: 's1', label: '0', curve: 'curve-up', labelOffset: { x: -10, y: -12 } },
    { from: 's0', to: 's2', label: '1', curve: 'curve-down', labelOffset: { x: -10, y: 12 } },
    // s1 transitions
    { from: 's1', to: 's3', label: '0', curve: 'curve-up', labelOffset: { x: 0, y: -14 } },
    { from: 's1', to: 's4', label: '1', curve: 'curve-down', labelOffset: { x: 12, y: 0 } },
    // s2 transitions
    { from: 's2', to: 's5', label: '0', curve: 'curve-up', labelOffset: { x: 0, y: -14 } },
    { from: 's2', to: 's6', label: '1', curve: 'curve-down', labelOffset: { x: 0, y: 14 } },
    // s3 transitions
    { from: 's3', to: 's7', label: '0', curve: 'straight', labelOffset: { x: 0, y: -14 } },
    { from: 's3', to: 's8', label: '1', curve: 'curve-down', labelOffset: { x: 12, y: 0 } },
    // s4 transitions
    { from: 's4', to: 's7', label: '0', curve: 'curve-up', labelOffset: { x: 0, y: -14 } },
    { from: 's4', to: 's9', label: '1', curve: 'curve-down', labelOffset: { x: 12, y: 0 } },
    // s5 transitions
    { from: 's5', to: 's7', label: '0', curve: 'curve-up', labelOffset: { x: 0, y: -14 } },
    { from: 's5', to: 's10', label: '1', curve: 'curve-down', labelOffset: { x: 12, y: 0 } },
    // s6 transitions
    { from: 's6', to: 's11', label: '0', curve: 'curve-up', labelOffset: { x: 0, y: -14 } },
    { from: 's6', to: 's10', label: '1', curve: 'curve-down', labelOffset: { x: 0, y: 14 } },
    // s7 transitions
    { from: 's7', to: 's12', label: '0', curve: 'straight', labelOffset: { x: 0, y: -14 } },
    { from: 's7', to: 's13', label: '1', curve: 'curve-down', labelOffset: { x: 12, y: 0 } },
    // s8 transitions
    { from: 's8', to: 's14', label: '0', curve: 'straight', labelOffset: { x: 0, y: -14 } },
    { from: 's8', to: 's15', label: '1', curve: 'curve-up', labelOffset: { x: 0, y: -14 } },
    // s9 transitions
    { from: 's9', to: 's16', label: '0', curve: 'curve-up', labelOffset: { x: 0, y: -14 } },
    { from: 's9', to: 's17', label: '1', curve: 'straight', labelOffset: { x: 0, y: -14 } },
    // s10 transitions
    { from: 's10', to: 's18', label: '0', curve: 'straight', labelOffset: { x: 0, y: 14 } },
    { from: 's10', to: 's19', label: '1', curve: 'curve-down', labelOffset: { x: 0, y: 14 } },
    // s11 transitions
    { from: 's11', to: 's20', label: '0', curve: 'straight', labelOffset: { x: 0, y: 14 } },
    { from: 's11', to: 's8', label: '1', curve: 'curve-up', labelOffset: { x: -12, y: 0 } },
    // s12 transitions
    { from: 's12', to: 's21', label: '0', curve: 'straight', labelOffset: { x: 0, y: -14 } },
    { from: 's12', to: 's13', label: '1', curve: 'curve-down', labelOffset: { x: 12, y: 0 } },
    // s13 self-loop (trap state)
    { from: 's13', to: 's13', label: '0,1', curve: 'self-loop-bottom', labelOffset: { x: 0, y: 30 } },
    // s14 transitions
    { from: 's14', to: 's12', label: '0', curve: 'curve-up', labelOffset: { x: -12, y: 0 } },
    { from: 's14', to: 's21', label: '1', curve: 'straight', labelOffset: { x: 0, y: -14 } },
    // s15 transitions
    { from: 's15', to: 's16', label: '0', curve: 'straight', labelOffset: { x: 0, y: -14 } },
    { from: 's15', to: 's22', label: '1', curve: 'curve-down', labelOffset: { x: 12, y: 0 } },
    // s16 transitions
    { from: 's16', to: 's13', label: '0', curve: 'curve-down', labelOffset: { x: 12, y: 0 } },
    { from: 's16', to: 's21', label: '1', curve: 'straight', labelOffset: { x: 0, y: -14 } },
    // s17 transitions
    { from: 's17', to: 's13', label: '0', curve: 'curve-down', labelOffset: { x: 12, y: 0 } },
    { from: 's17', to: 's21', label: '1', curve: 'curve-up', labelOffset: { x: 0, y: -14 } },
    // s18 transitions
    { from: 's18', to: 's20', label: '0', curve: 'curve-up', labelOffset: { x: 0, y: -14 } },
    { from: 's18', to: 's23', label: '1', curve: 'straight', labelOffset: { x: 0, y: 14 } },
    // s19 transitions
    { from: 's19', to: 's14', label: '0', curve: 'curve-up', labelOffset: { x: -12, y: 0 } },
    { from: 's19', to: 's24', label: '1', curve: 'straight', labelOffset: { x: 0, y: 14 } },
    // s20 transitions
    { from: 's20', to: 's25', label: '0', curve: 'curve-up', labelOffset: { x: 0, y: -14 } },
    { from: 's20', to: 's13', label: '1', curve: 'curve-down', labelOffset: { x: -12, y: 0 } },
    // s21 transition (both 0 and 1 go to s26)
    { from: 's21', to: 's26', label: '0,1', curve: 'straight', labelOffset: { x: 0, y: -14 } },
    // s22 transitions
    { from: 's22', to: 's26', label: '0', curve: 'curve-up', labelOffset: { x: 0, y: -14 } },
    { from: 's22', to: 's21', label: '1', curve: 'curve-up', labelOffset: { x: -12, y: 0 } },
    // s23 transitions
    { from: 's23', to: 's27', label: '0', curve: 'straight', labelOffset: { x: 0, y: 14 } },
    { from: 's23', to: 's28', label: '1', curve: 'curve-down', labelOffset: { x: 12, y: 0 } },
    // s24 transitions
    { from: 's24', to: 's29', label: '0', curve: 'curve-up', labelOffset: { x: 0, y: -14 } },
    { from: 's24', to: 's22', label: '1', curve: 'curve-up', labelOffset: { x: -12, y: 0 } },
    // s25 transitions
    { from: 's25', to: 's21', label: '0', curve: 'curve-up', labelOffset: { x: -12, y: 0 } },
    { from: 's25', to: 's26', label: '1', curve: 'straight', labelOffset: { x: 0, y: -14 } },
    // s26 self-loop
    { from: 's26', to: 's26', label: '0,1', curve: 'self-loop-bottom', labelOffset: { x: 0, y: 30 } },
    // s27 transitions
    { from: 's27', to: 's30', label: '0', curve: 'curve-up', labelOffset: { x: 0, y: -14 } },
    { from: 's27', to: 's21', label: '1', curve: 'curve-up', labelOffset: { x: -12, y: 0 } },
    // s28 transitions
    { from: 's28', to: 's29', label: '0', curve: 'curve-up', labelOffset: { x: 0, y: -14 } },
    { from: 's28', to: 's22', label: '1', curve: 'curve-up', labelOffset: { x: -12, y: 0 } },
    // s29 transitions
    { from: 's29', to: 's26', label: '0', curve: 'straight', labelOffset: { x: 0, y: -14 } },
    { from: 's29', to: 's21', label: '1', curve: 'curve-up', labelOffset: { x: -12, y: 0 } },
    // s30 transitions
    { from: 's30', to: 's21', label: '0', curve: 'curve-up', labelOffset: { x: -12, y: 0 } },
    { from: 's30', to: 's26', label: '1', curve: 'curve-up', labelOffset: { x: 0, y: -14 } },
  ],
  transitionTable: {
    s0: { '0': 's1', '1': 's2' },
    s1: { '0': 's3', '1': 's4' },
    s2: { '0': 's5', '1': 's6' },
    s3: { '0': 's7', '1': 's8' },
    s4: { '0': 's7', '1': 's9' },
    s5: { '0': 's7', '1': 's10' },
    s6: { '0': 's11', '1': 's10' },
    s7: { '0': 's12', '1': 's13' },
    s8: { '0': 's14', '1': 's15' },
    s9: { '0': 's16', '1': 's17' },
    s10: { '0': 's18', '1': 's19' },
    s11: { '0': 's20', '1': 's8' },
    s12: { '0': 's21', '1': 's13' },
    s13: { '0': 's13', '1': 's13' },
    s14: { '0': 's12', '1': 's21' },
    s15: { '0': 's16', '1': 's22' },
    s16: { '0': 's13', '1': 's21' },
    s17: { '0': 's13', '1': 's21' },
    s18: { '0': 's20', '1': 's23' },
    s19: { '0': 's14', '1': 's24' },
    s20: { '0': 's25', '1': 's13' },
    s21: { '0': 's26', '1': 's26' },
    s22: { '0': 's26', '1': 's21' },
    s23: { '0': 's27', '1': 's28' },
    s24: { '0': 's29', '1': 's22' },
    s25: { '0': 's21', '1': 's26' },
    s26: { '0': 's26', '1': 's26' },
    s27: { '0': 's30', '1': 's21' },
    s28: { '0': 's29', '1': 's22' },
    s29: { '0': 's26', '1': 's21' },
    s30: { '0': 's21', '1': 's26' },
  },
};
