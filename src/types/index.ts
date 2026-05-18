export interface DFAState {
  id: string;
  label: string;
  x: number;
  y: number;
  isStart: boolean;
  isAccept: boolean;
  isTrap?: boolean;
}

export interface DFATransition {
  from: string;
  to: string;
  label: string;
  curve?: 'straight' | 'curve-up' | 'curve-down' | 'self-loop-top' | 'self-loop-bottom' | 'self-loop-left';
  labelOffset?: { x: number; y: number };
}

export interface DFADefinition {
  id: string;
  name: string;
  regex: string;
  alphabet: string[];
  states: DFAState[];
  transitions: DFATransition[];
  transitionTable: Record<string, Record<string, string>>;
  startState: string;
  acceptStates: string[];
  viewBox: string;
  examples?: string[];
}

export interface CFGProduction {
  nonTerminal: string;
  productions: string[];
  description?: string;
}

export interface CFGDefinition {
  startSymbol: string;
  productions: CFGProduction[];
  description: string;
  alphabet: string[];
  examples?: string[];
}

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
  label: string; // "a", "b", "Δ", or "ε"
  curve?: 'straight' | 'curve-up' | 'curve-down' | 'self-loop-top' | 'self-loop-bottom' | 'self-loop-left' | 'self-loop-right' | 'step-down' | 'step-up';
  labelOffset?: { x: number; y: number };
}

export interface PDADefinition {
  id: string;
  name: string;
  description: string;
  viewBox: string;
  states: PDAState[];
  transitions: PDATransition[];
  alphabet: string[];
  examples?: string[];
}

export type DFAChoice = 'alpha' | 'binary' | null;

export interface SimulationStep {
  stateId: string;
  charIndex: number;
  char: string | null;
  transitionFrom?: string;
  transitionTo?: string;
}

export interface CFGDerivationStep {
  nonTerminal: string;       // e.g., 'B'
  production: string;        // e.g., 'aB', 'bB', or 'Λ'
  sententialBefore: string;  // e.g., 'abaBCDEF'
  sententialAfter: string;   // e.g., 'abaaBCDEF' or 'abaCDEF'
}

export interface PDASimulationStep {
  fromState: string;         // Source state ID
  toState: string;           // Target state ID
  label: string;             // Transition label (raw, will be parsed)
  inputPosition: number;     // How many characters consumed so far
  char?: string;             // Character consumed (undefined for epsilon and delta)
}
