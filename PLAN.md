# Plan: CFG & PDA Live Simulation

## Overview

All three formalisms — DFA, CFG, and PDA — describe the **same regular language**:
- **Alphabet DFA**: `(aba + bab)(a+b)*(bab)(a+b)*(a+b+ab+ba)(a+b+aa)*`
- **Binary DFA**: `((101+111)+(1+0+11))(1+0+01)(111+000+101)(1+0)*`

The DFA tab already has a live simulation feel with headers, input panels, tape visualization, step controls, and result banners. This plan ports that exact experience to the CFG and PDA tabs.

---

## Goals

1. Make the **CFG tab** feel like the DFA tab — live derivation simulation with input, step controls, and visual feedback.
2. Make the **PDA tab** feel like the DFA tab — live state-transition simulation with input tape and visual feedback.
3. Keep the same **cyberpunk UI aesthetic**, **layout**, and **interaction patterns** across all three tabs.
4. **No new dependencies** — use existing React + Tailwind + Lucide stack.
5. **No changes to the working DFA tab**.

---

## Part 1: Data & Types

### 1.1 Extend `src/types/index.ts`

Add new interfaces for simulation steps:

```typescript
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
```

### 1.2 Extend `src/data/grammarData.ts`

Add `alphabet` and `examples` to CFG and PDA definitions so simulation panels can validate input and offer quick-test buttons:

```typescript
export const alphaCFG: CFGDefinition = {
  // ... existing fields ...
  alphabet: ['a', 'b'],
  examples: ['ababababa', 'babababaaa', 'ababbababa', 'babbababa'],
};

export const binaryCFG: CFGDefinition = {
  // ... existing fields ...
  alphabet: ['0', '1'],
  examples: ['11100111', '10101000', '11001111', '11011110'],
};

export const alphaPDA: PDADefinition = {
  // ... existing fields ...
  alphabet: ['a', 'b'],
  examples: ['ababababa', 'babababaaa', 'ababbababa', 'babbababa'],
};

export const binaryPDA: PDADefinition = {
  // ... existing fields ...
  alphabet: ['0', '1'],
  examples: ['11100111', '10101000', '11001111', '11011110'],
};
```

---

## Part 2: CFG Simulation Engine

### 2.1 Algorithm — `buildCFGDerivation()`

Pre-computes all derivation steps given an input string, then the UI steps through them (identical pattern to DFA's `buildSteps()`).

**Why backtracking?** At epsilon choice points like `B → aB | bB | Λ`, the algorithm can't know whether to loop or stop without looking ahead. It tries each production in declaration order. If a choice doesn't lead to a complete derivation, it backtracks and tries the next.

**Algorithm:**
1. Start with sentential form = `cfg.startSymbol` (e.g., `S`).
2. Expand start symbol via its single production (e.g., `S → ABCDEF`).
3. Recursively expand the **leftmost non-terminal**:
   - Find leftmost non-terminal by scanning for uppercase chars in `cfg.productions[].nonTerminal`.
   - Verify the terminal prefix before that non-terminal matches `input` at the current position.
   - Try each production of that non-terminal in declaration order.
   - For `Λ`, the non-terminal vanishes (sentential form contracts).
   - For terminal productions like `aB`, splice the expansion into the sentential form.
   - **Backtrack** if a production doesn't lead to a complete derivation.
4. Base case: sentential form is all terminals → check if it equals `input`. If yes, return steps; if no, return `null`.

**Example trace for alphaCFG, input = "ababababa":**
```
Step 0: S
Step 1: ABCDEF       (S → ABCDEF)
Step 2: abaBCDEF     (A → aba)
Step 3: ababBCDEF    (B → bB)
Step 4: ababaBCDEF   (B → aB)
Step 5: abababBCDEF  (B → bB)
Step 6: abababCDEF   (B → Λ)
Step 7: abababbCDEF  (C → bab)
... and so on
```

### 2.2 Λ Productions Visual Treatment

When `B → Λ` is applied:
- **Operation log**: `"Contract B → Λ"` (use "Contract" not "Expand" to signal removal).
- **Derivation Track**: The non-terminal simply disappears. Show the "before" form with `B` highlighted in a red/deleted style, and the "after" form as the shorter string. No empty Λ cell.

---

## Part 3: PDA Simulation Engine

### 3.1 Important Context

The current `PDATransition` has **no stack operations** — just `from`, `to`, `label`. The PDA states are labeled `READ`/`PUSH`/`POP` in the type system, but **every actual state in the data is type `'read'`** (or `start`/`accept`/`reject`). The PDA flowchart is essentially an NFA for the same regular language.

**Therefore**: Simulate it as a **state machine** — same logic as the DFA, just a different graph. No stack visualization needed because there's no stack data.

### 3.2 PDA Label Parsing

Transition labels must be parsed at simulation time:

| Label value | Parsed as | Meaning |
|---|---|---|
| `''` | epsilon transition | Advance state, **do not consume input** |
| `'a'`, `'b'`, `'0'`, `'1'` | Single character | Consume that character |
| `'a,b'`, `'0,1'` | Character set | Consume current char if it matches any in the comma-separated list |
| `'Δ'` | End-of-input | Only fires when input is fully consumed |

### 3.3 Algorithm — `buildPDASteps()`

Pre-computes the accepting state path given an input string using DFS with backtracking.

**Algorithm:**
1. Start at the `'start'` state.
2. At each step, find all outgoing transitions from the current state.
3. Try each transition in declaration order:
   - **`''` (epsilon)**: Advance to target state, don't consume input.
   - **`'Δ'`**: Only valid when `inputPosition === input.length`. Advance state.
   - **Character / character set**: If current input char matches, consume it and advance.
4. If a path reaches an `'accept'` state with all input consumed → return steps.
5. If no transition matches → backtrack and try the next.
6. Return `null` if all paths fail.

**Nondeterminism handling**: At `loop1` with input `'b'`, both `loop1 → loop1` (label `'a,b'`) and `loop1 → mid_b` (label `'b'`) match. Try the **self-loop first** (greedy consume), backtrack to the exit transition if the greedy path fails.

### 3.4 Reject State Handling

The alpha PDA has explicit `reject` states (e.g., `r1 → reject` on `'Δ'`). If the simulation reaches a `reject` state, or if backtracking exhausts all paths, show the **"SEQUENCE REJECTED"** banner (same style as DFA).

---

## Part 4: CFG Tab Layout & UI

Switch from centered single-card to **2-column grid matching DFA** (`lg:grid-cols-12`, 8+4 split).

### Left Column (8 cols) — "Grammar Derivation Engine"

**Header chrome** (same pattern as DFA graph container):
- Icon: `BookOpen` inside accent-colored rounded box (`p-3 rounded-2xl bg-teal-500/10` or `bg-blue-500/10`)
- Title: **"Grammar Derivation Engine"** (`text-sm font-black uppercase tracking-[0.15em]`)
- Subtitle: **"Live_Production_Stream"** (`text-[10px] font-black uppercase tracking-[0.2em]`) + animated pulse dot
- Badge: "LEFTMOST MODE" in accent color

**Below header**: Production rules list (existing `CFGSection` content), but the **active production rule gets a glow border** during simulation.

### Right Column (4 cols) — Simulation Panel

**"Target String" input section**:
- Label: "Target String" (`text-[10px] font-black uppercase tracking-[0.2em]`)
- Alphabet badge pills (`a`, `b` or `0`, `1`)
- Text input with validation (invalid chars = red border + shake)
- **Load** button
- **Quick Test Protocols**: example strings as clickable buttons

**Derivation Track** (replaces DFA tape):
- Horizontal scrollable row of character cells (`overflow-x-auto scrollbar-hide`)
- Each cell: 42×42px rounded box, monospace font
- **Non-terminals**: accent color (`text-teal-400` / `text-blue-400`) + glow
- **Terminals**: white (`text-slate-200`)
- **Leftmost non-terminal**: pulses to indicate "being expanded next"
- Horizontal scrolling when sentential forms grow long

**Controls**:
- Reset, Step Back, Play/Pause, Step Forward, Speed slider
- Same button styles and layout as DFA

**Operation Log**:
- `"Expand B → aB"` or `"Contract B → Λ"`
- Same panel style as DFA (`bg-black/20 rounded-xl p-3 border border-slate-800/50`)

**Result Banner**:
- **"STRING DERIVED"** (green) or **"DERIVATION FAILED"** (red)
- Same bounce animation and colored border as DFA

---

## Part 5: PDA Tab Layout & UI

Switch from centered single-card to **2-column grid matching DFA** (`lg:grid-cols-12`, 8+4 split).

### Left Column (8 cols) — "Stack Logic Processor"

**Header chrome**:
- Icon: `Layers` inside accent-colored rounded box
- Title: **"Stack Logic Processor"** (`text-sm font-black uppercase tracking-[0.15em]`)
- Subtitle: **"Live_State_Flow"** (`text-[10px] font-black uppercase tracking-[0.2em]`) + animated pulse dot
- Badge: "PUSHDOWN ACTIVE" in accent color

**Below header**: `PDAGraph` with **current state highlighted** (glow + scale) and **active transition arrow highlighted** (color change + glow).

### Right Column (4 cols) — Simulation Panel

**"Input Sequence" input section**:
- Label: "Input Sequence" (`text-[10px] font-black uppercase tracking-[0.2em]`)
- Alphabet badge pills
- Text input with validation
- **Load** button
- **Quick Test Protocols**: example strings as clickable buttons

**Input Tape** (identical to DFA tape):
- Row of 42×42px rounded character boxes
- Current character: accent border + scale-110 + glow
- Processed characters: dimmed (`text-slate-600`)
- Unprocessed characters: default (`text-slate-400`)

**State Path** (breadcrumb trail):
- Horizontal row showing visited states: `START → READ₁ → READ_a → LOOP₁`
- Current state: accent color + glow
- Previous states: dimmed

**Controls**: Same as DFA — Reset, Step Back, Play/Pause, Step Forward, Speed slider.

**Operation Log**:
- `"Read 'a' → move to READ_a"`
- `"ε-transition: START → READ₁"` (for epsilon transitions)
- Same panel style as DFA

**Result Banner**:
- **"SEQUENCE ACCEPTED"** (green) or **"SEQUENCE REJECTED"** (red)
- Same bounce animation and colored border as DFA

---

## Part 6: Simulation State Management

All simulation state lives in `DFAPage.tsx` (same pattern as existing DFA state):

```typescript
// Existing DFA state (unchanged)
const [currentState, setCurrentState] = useState<string | null>(null);
const [visitedTransition, setVisitedTransition] = useState<{ from: string; to: string; label: string } | null>(null);

// New CFG state
const [cfgSteps, setCfgSteps] = useState<CFGDerivationStep[]>([]);
const [cfgStepIndex, setCfgStepIndex] = useState(-1);

// New PDA state
const [pdaSteps, setPdaSteps] = useState<PDASimulationStep[]>([]);
const [pdaStepIndex, setPdaStepIndex] = useState(-1);
const [pdaCurrentState, setPdaCurrentState] = useState<string | null>(null);
const [pdaVisitedTransition, setPdaVisitedTransition] = useState<{ from: string; to: string; label: string } | null>(null);
```

Passed down to child components as props.

---

## Part 7: Prop Changes for Existing Components

### `CFGSection`

Add to current `{ cfg: CFGDefinition }`:
```typescript
derivationSteps: CFGDerivationStep[]
currentStepIndex: number
isTeal: boolean
```

The component highlights the active production rule based on `derivationSteps[currentStepIndex]`.

### `PDAGraph`

Add to current `{ pda: PDADefinition }`:
```typescript
currentState: string | null
visitedTransition: { from: string; to: string; label: string } | null
```

Mirrors `DFAGraph`'s highlighting logic — active state gets glow + scale, active transition gets color change.

---

## Part 8: Implementation Order

| # | Task | Files |
|---|---|---|
| 1 | Add `examples` and `alphabet` to CFG/PDA data | `src/data/grammarData.ts` |
| 2 | Add `CFGDerivationStep` and `PDASimulationStep` types | `src/types/index.ts` |
| 3 | Build `buildCFGDerivation()` engine | `src/lib/cfgSimulation.ts` |
| 4 | Build `buildPDASteps()` engine + label parser | `src/lib/pdaSimulation.ts` |
| 5 | Build `CFGSimulationPanel` component | `src/components/CFGSimulationPanel.tsx` |
| 6 | Build `PDASimulationPanel` component | `src/components/PDASimulationPanel.tsx` |
| 7 | Add simulation state and wire up CFG tab | `src/components/DFAPage.tsx` |
| 8 | Add simulation state and wire up PDA tab | `src/components/DFAPage.tsx` |
| 9 | Add active-rule highlighting to `CFGSection` | `src/components/CFGSection.tsx` |
| 10 | Add active-state highlighting to `PDAGraph` | `src/components/PDAGraph.tsx` |

---

## Part 9: What We're NOT Doing

- ❌ **Real PDA stack operations** — The data has no `pop`/`push` fields, and the language is regular so a stack isn't needed.
- ❌ **New animation libraries** — CSS transitions already in the project are sufficient.
- ❌ **Testing framework** — Out of scope. Manual verification only.
- ❌ **Changes to DFA tab** — It already works.
- ❌ **New tabs or navigation changes** — Just enhancing existing CFG and PDA tabs.
- ❌ **User choice of production rules** — The simulation is automated (the grammars are regular and deterministic given the full input string).

---

## Part 10: Visual Consistency Checklist

All three tabs should feel like the same app:

- [ ] Same `glass-card rounded-[2.5rem] p-8` container styling
- [ ] Same `lg:grid-cols-12 gap-8` two-column layout
- [ ] Same sticky right simulation panel
- [ ] Same header chrome pattern (icon box + title + subtitle + pulse dot + badge)
- [ ] Same input text box styling with validation
- [ ] Same alphabet badge pills
- [ ] Same Load button styling
- [ ] Same Quick Test Protocols buttons
- [ ] Same control bar (Reset, Step Back, Play/Pause, Step Forward, Speed)
- [ ] Same operation log panel style
- [ ] Same result banner style (green/red, bounce animation, colored border)
- [ ] Same accent theming (`teal` for alpha, `blue` for binary)

---

## Part 11: Reference Algorithms — Concrete Implementation Approaches

All three programs accept/reject the same strings. The DFA, CFG, and PDA all describe the same regular language. Here are the step-by-step algorithms for each.

---

### 11.1 DFA Program — "The Lookup Table Method"

A DFA is coded as a simple loop and a dictionary. It reads one character at a time and changes state based on a hardcoded table.

**Setup:**
- Variable `current_state = 0`
- Dictionary/hash map for transition rules:

| State | On '0' | On '1' |
|-------|--------|--------|
| 0 | 1 | 1 |
| 1 | 3 | 2 |
| 2 | 5 | 4 |
| 3 | 6 | 2 |
| 4 | 5 | 7 |
| 5 | 6 | 7 |
| 6 | 7 | 2 |
| 7 | 7 | 7 |

**Logic:**
1. Loop through every character in input string
2. Inside loop, update `current_state` by checking dictionary for current character
3. When loop finishes, check `current_state`
4. If `current_state == 7` → Accept. Otherwise → Reject

---

### 11.2 CFG Program — "The String Slicing Method"

A CFG is coded by testing combinations. The grammar splits the string into four parts (A, B, C, D), and the program tries every possible way to slice into four pieces.

**Setup — Part Rules:**
- **Part A** must be one of: `"101"`, `"111"`, `"1"`, `"0"`, or `"11"`
- **Part C** must be one of: `"111"`, `"000"`, or `"101"`
- **Parts B and D** can be any mix of '1's and '0's, or completely empty

**Logic:**
1. Create loops to slice input string into four segments (try every possible index)
2. For every combination of 4 slices, run checks:
   - Does Slice 1 match a valid Part A string?
   - Does Slice 3 match a valid Part C string?
   - Do Slices 2 and 4 contain only '1's and '0's?
3. If combination passes all checks → return True immediately
4. If every slicing combination fails → return False

---

### 11.3 PDA Program — "The Stack + Recursion Method"

Because the expression doesn't need memory, the PDA stack is a formality. The program uses recursion to handle branching paths (non-determinism) and pushes/pops empty values to satisfy the PDA definition.

**Setup:**
- Function `evaluate_PDA(string, current_index, current_state, stack_array)`
- Every state transition: push `""` into stack_array, immediately pop it back out

**Logic:**
1. Function looks at character at `current_index`
2. Checks current state for available paths
3. At `(1+0)*` loops: can choose to stay in loop OR exit to find `"111"`, `"000"`, or `"101"`
4. Handles via two recursive calls:
   - **Branch 1**: Stay in loop, move to next character
   - **Branch 2**: Exit loop, check if next characters match required sequence
5. If `current_index` reaches end of string → check if in Accept State
6. If any recursive branch returns True → whole program returns True
7. If all branches hit dead end → return False

---

## Appendix: Quick Reference — DFA → CFG → PDA Mapping

| Element | DFA | CFG | PDA |
|---|---|---|---|
| **Header Title** | Neural Logic Processor | Grammar Derivation Engine | Stack Logic Processor |
| **Header Subtitle** | Live_Node_Stream | Live_Production_Stream | Live_State_Flow |
| **Input Label** | Input Sequence | Target String | Input Sequence |
| **Visualization** | DFA Graph | Derivation Track | PDA Graph + Input Tape |
| **Active Highlight** | Current state node glows | Leftmost non-terminal pulses | Current state node glows |
| **Step Action** | Read char, move to state | Expand/Contract production | Read char, move to state |
| **Result Success** | SEQUENCE ACCEPTED | STRING DERIVED | SEQUENCE ACCEPTED |
| **Result Failure** | SEQUENCE REJECTED | DERIVATION FAILED | SEQUENCE REJECTED |
