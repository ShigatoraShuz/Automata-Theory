export type NFATransitions = {
  [stateId: string]: {
    '0'?: string[];
    '1'?: string[];
    epsilon?: string[];
  }
}

export interface NFADefinition {
  states: string[];
  startState: string;
  acceptStates: string[];
  transitions: NFATransitions;
}
