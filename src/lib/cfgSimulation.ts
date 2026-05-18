import type { CFGDefinition, CFGDerivationStep } from '../types';

export interface CFGDerivationResult {
  steps: CFGDerivationStep[];
  succeeded: boolean;
}

/**
 * Build a leftmost derivation for a given CFG and input string.
 * Always returns a result — on failure, returns the deepest (farthest-reaching)
 * attempt found so the UI can animate it and show where derivation got stuck.
 */
export function buildCFGDerivation(cfg: CFGDefinition, input: string): CFGDerivationResult {
  const productionMap = new Map<string, string[]>();
  const nonTerminals = new Set<string>();

  for (const production of cfg.productions) {
    productionMap.set(production.nonTerminal, production.productions);
    nonTerminals.add(production.nonTerminal);
  }

  function isAllTerminals(str: string): boolean {
    for (const nt of nonTerminals) {
      if (str.includes(nt)) return false;
    }
    return true;
  }

  function findLeftmostNonTerminal(form: string): {
    nonTerminal: string;
    index: number;
    prefix: string;
    suffix: string;
  } | null {
    const sortedNTs = Array.from(nonTerminals).sort((a, b) => b.length - a.length);
    for (let i = 0; i < form.length; i++) {
      for (const nt of sortedNTs) {
        if (form.substring(i, i + nt.length) === nt) {
          return { nonTerminal: nt, index: i, prefix: form.substring(0, i), suffix: form.substring(i + nt.length) };
        }
      }
    }
    return null;
  }

  function canLeadToInput(form: string): boolean {
    const leftmost = findLeftmostNonTerminal(form);
    const terminalPrefix = leftmost ? leftmost.prefix : form;
    if (terminalPrefix.length > input.length) return false;
    return input.substring(0, terminalPrefix.length) === terminalPrefix;
  }

  // Track the best (deepest) failed attempt — measured by how many input chars
  // the terminal prefix matched before the derivation got stuck.
  let best: { steps: CFGDerivationStep[]; matchLength: number } = {
    steps: [],
    matchLength: -1,
  };

  function tryUpdateBest(steps: CFGDerivationStep[], form: string) {
    const leftmost = findLeftmostNonTerminal(form);
    const terminalPrefix = leftmost ? leftmost.prefix : form;
    const matchLength = Math.min(terminalPrefix.length, input.length);
    if (
      matchLength > best.matchLength ||
      (matchLength === best.matchLength && steps.length > best.steps.length)
    ) {
      best = { steps, matchLength };
    }
  }

  function derive(form: string, steps: CFGDerivationStep[]): boolean {
    if (!canLeadToInput(form)) return false;

    if (isAllTerminals(form)) {
      if (form === input) {
        best = { steps, matchLength: input.length };
        return true;
      }
      tryUpdateBest(steps, form);
      return false;
    }

    const leftmost = findLeftmostNonTerminal(form);
    if (!leftmost) {
      if (form === input) {
        best = { steps, matchLength: input.length };
        return true;
      }
      tryUpdateBest(steps, form);
      return false;
    }

    const { nonTerminal, prefix, suffix } = leftmost;
    const productions = productionMap.get(nonTerminal);

    if (!productions) {
      tryUpdateBest(steps, form);
      return false;
    }

    for (const production of productions) {
      const newForm = production === 'Λ' ? prefix + suffix : prefix + production + suffix;
      const step: CFGDerivationStep = {
        nonTerminal,
        production,
        sententialBefore: form,
        sententialAfter: newForm,
      };
      if (derive(newForm, [...steps, step])) return true;
    }

    // All productions for this NT failed — record as a candidate best path
    tryUpdateBest(steps, form);
    return false;
  }

  const succeeded = derive(cfg.startSymbol, []);
  return { steps: best.steps, succeeded };
}
