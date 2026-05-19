import { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, ChevronRight, ChevronLeft, Pause, Zap } from 'lucide-react';
import type { DFADefinition, SimulationStep } from '../types';

interface SimulationPanelProps {
  dfa: DFADefinition;
  onStateChange: (state: string | null, transition: { from: string; to: string; label: string } | null) => void;
  onResult: (accepted: boolean | null, rejected: boolean) => void;
  isTeal: boolean;
}

type BatchDFAResult = {
  id: number;
  input: string;
  accepted: boolean;
  finalState: string;
};

const INPUT_COUNT = 10;
const EMPTY_INPUTS = Array.from({ length: INPUT_COUNT }, () => '');

function buildSteps(dfa: DFADefinition, input: string): SimulationStep[] {
  const steps: SimulationStep[] = [];
  let current = dfa.startState;
  steps.push({ stateId: current, charIndex: -1, char: null });

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    const next = dfa.transitionTable[current]?.[ch];
    if (!next) {
      steps.push({ stateId: 'DEAD', charIndex: i, char: ch, transitionFrom: current, transitionTo: 'DEAD' });
      break;
    }
    steps.push({
      stateId: next,
      charIndex: i,
      char: ch,
      transitionFrom: current,
      transitionTo: next,
    });
    current = next;
  }
  return steps;
}

function simulateDFA(dfa: DFADefinition, input: string): BatchDFAResult {
  const steps = buildSteps(dfa, input);
  const finalState = steps[steps.length - 1]?.stateId ?? 'DEAD';

  return {
    id: 0,
    input,
    finalState,
    accepted: dfa.acceptStates.includes(finalState),
  };
}

export default function SimulationPanel({ dfa, onStateChange, onResult, isTeal }: SimulationPanelProps) {
  const [inputValues, setInputValues] = useState<string[]>(EMPTY_INPUTS);
  const [inputStr, setInputStr] = useState('');
  const [steps, setSteps] = useState<SimulationStep[]>([]);
  const [stepIndex, setStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(700);
  const [hasRun, setHasRun] = useState(false);
  const [batchResults, setBatchResults] = useState<BatchDFAResult[]>([]);
  const [activeResultId, setActiveResultId] = useState<number | null>(null);
  const [isBatchReplaying, setIsBatchReplaying] = useState(false);
  const [batchReplayIndex, setBatchReplayIndex] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const batchReplayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentStep = steps[stepIndex] ?? null;
  const inputErrors = inputValues.map(value => value.trim().split('').some((c) => !dfa.alphabet.includes(c)));
  const hasInvalid = inputErrors.some(Boolean);
  const hasRunnableInput = inputValues.some(value => value.trim().length > 0);
  const isAccepted = hasRun && stepIndex === steps.length - 1 && currentStep
    ? dfa.acceptStates.includes(currentStep.stateId)
    : null;
  const isRejected = hasRun && stepIndex === steps.length - 1 && currentStep
    ? !dfa.acceptStates.includes(currentStep.stateId) || currentStep.stateId === 'DEAD'
    : false;

  useEffect(() => {
    if (currentStep) {
      const transition =
        currentStep.transitionFrom && currentStep.transitionTo
          ? {
              from: currentStep.transitionFrom,
              to: currentStep.transitionTo,
              label: currentStep.char ?? '',
            }
          : null;
      onStateChange(currentStep.stateId === 'DEAD' ? null : currentStep.stateId, transition);
      onResult(isAccepted, isRejected);
    } else {
      onStateChange(null, null);
      onResult(null, false);
    }
  }, [stepIndex, steps]);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setStepIndex((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            clearInterval(intervalRef.current!);
            return prev;
          }
          const next = prev + 1;
          if (next >= steps.length - 1) {
            setIsPlaying(false);
            clearInterval(intervalRef.current!);
          }
          return next;
        });
      }, speed);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, steps, speed]);

  useEffect(() => {
    if (
      !isBatchReplaying ||
      batchReplayIndex === null ||
      isPlaying ||
      steps.length === 0 ||
      stepIndex !== steps.length - 1
    ) {
      return;
    }

    const nextBatchIndex = batchReplayIndex + 1;
    if (nextBatchIndex >= batchResults.length) {
      setIsBatchReplaying(false);
      setBatchReplayIndex(null);
      return;
    }

    batchReplayTimeoutRef.current = setTimeout(() => {
      const nextResult = batchResults[nextBatchIndex];
      const nextSteps = buildSteps(dfa, nextResult.input);
      setBatchReplayIndex(nextBatchIndex);
      setInputStr(nextResult.input);
      setSteps(nextSteps);
      setStepIndex(0);
      setHasRun(true);
      setIsPlaying(true);
      setActiveResultId(nextResult.id);
    }, Math.max(450, speed));

    return () => {
      if (batchReplayTimeoutRef.current) {
        clearTimeout(batchReplayTimeoutRef.current);
      }
    };
  }, [isBatchReplaying, batchReplayIndex, isPlaying, stepIndex, steps.length, batchResults, speed, dfa]);

  function cancelBatchReplay() {
    if (batchReplayTimeoutRef.current) {
      clearTimeout(batchReplayTimeoutRef.current);
    }
    setIsBatchReplaying(false);
    setBatchReplayIndex(null);
  }

  function loadSimulation(input: string, resultId: number | null = null, autoplay = false) {
    const newSteps = buildSteps(dfa, input);
    setInputStr(input);
    setSteps(newSteps);
    setStepIndex(0);
    setHasRun(true);
    setIsPlaying(autoplay);
    setActiveResultId(resultId);
  }

  function handleBatchRun() {
    if (!hasRunnableInput || hasInvalid) return;
    cancelBatchReplay();

    const results = inputValues
      .map((value, index) => ({ value: value.trim(), index }))
      .filter(({ value }) => value.length > 0)
      .map(({ value, index }) => ({
        ...simulateDFA(dfa, value),
        id: index,
      }));

    setBatchResults(results);

    if (results.length > 0) {
      setIsBatchReplaying(true);
      setBatchReplayIndex(0);
      loadSimulation(results[0].input, results[0].id, true);
    }
  }

  function handlePlay() {
    cancelBatchReplay();
    if (stepIndex >= steps.length - 1) {
      setStepIndex(0);
    }
    setIsPlaying(true);
  }

  function handleReset() {
    cancelBatchReplay();
    setSteps([]);
    setStepIndex(-1);
    setIsPlaying(false);
    setHasRun(false);
    setActiveResultId(null);
    onStateChange(null, null);
    onResult(null, false);
  }

  function handleClearAll() {
    setInputValues([...EMPTY_INPUTS]);
    setBatchResults([]);
    setInputStr('');
    handleReset();
  }

  function handleInputChange(index: number, value: string) {
    cancelBatchReplay();
    setInputValues((current) => {
      const next = [...current];
      next[index] = value;
      return next;
    });
    setBatchResults([]);
    setHasRun(false);
    setActiveResultId(null);
  }

  function handleExample(example: string) {
    cancelBatchReplay();
    const targetIndex = inputValues.findIndex(value => value.trim().length === 0);
    const index = targetIndex === -1 ? 0 : targetIndex;
    const nextInputs = [...inputValues];
    nextInputs[index] = example;
    const result = { ...simulateDFA(dfa, example), id: index };

    setInputValues(nextInputs);
    setBatchResults([result]);
    loadSimulation(example, index);
  }

  function handleStepForward() {
    cancelBatchReplay();
    if (stepIndex < steps.length - 1) setStepIndex((p) => p + 1);
  }

  function handleStepBack() {
    cancelBatchReplay();
    if (stepIndex > 0) setStepIndex((p) => p - 1);
  }

  return (
    <div id="simulation-panel" className="space-y-6">
      {/* Input Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
            Batch Input Sequences
          </label>
          <div className="flex gap-1">
            {dfa.alphabet.map(a => (
              <span key={a} className="px-2 py-0.5 rounded bg-slate-800/50 border border-slate-700/50 text-[10px] font-mono text-slate-400">
                {a}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {inputValues.map((value, index) => {
            const isInvalid = inputErrors[index];
            return (
              <div key={index} className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-600">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  placeholder="Input string"
                  className={`w-full bg-slate-900/50 border rounded-xl pl-10 pr-3 py-2.5 text-slate-100 placeholder-slate-600 font-mono text-xs focus:outline-none transition-all ${
                    isInvalid
                      ? 'border-red-500/50 focus:border-red-500 ring-2 ring-red-500/10'
                      : `border-slate-800 ${isTeal ? 'focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/10' : 'focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10'}`
                  }`}
                />
              </div>
            );
          })}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleBatchRun}
            disabled={!hasRunnableInput || hasInvalid}
            className={`flex-1 px-4 py-3 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 group ${
              isTeal ? 'bg-teal-600 hover:bg-teal-500 shadow-teal-900/20' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20'
            }`}
          >
            <Zap size={16} className={!hasRunnableInput || hasInvalid ? '' : 'group-hover:animate-pulse'} />
            Run Batch
          </button>
          <button
            onClick={handleClearAll}
            className="px-4 py-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl transition-all border border-slate-700/50 text-slate-300"
            title="Clear all inputs"
          >
            <RotateCcw size={18} />
          </button>
        </div>

        {hasInvalid && (
          <p className="text-red-400 text-[10px] font-semibold animate-shake">
            Error: Invalid characters detected in one or more inputs.
          </p>
        )}

        {/* Examples Section */}
        {dfa.examples && dfa.examples.length > 0 && (
          <div id="examples-section" className="space-y-2 pt-2 border-t border-white/5">
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Quick Test Protocols</p>
            <div className="flex flex-wrap gap-2">
              {dfa.examples.map((ex, idx) => (
                <button
                  key={idx}
                  onClick={() => handleExample(ex)}
                  className={`px-3 py-1.5 rounded-lg border text-[10px] font-mono font-bold transition-all hover:scale-105 active:scale-95 ${
                    isTeal
                      ? 'bg-teal-500/5 border-teal-500/20 text-teal-500/80 hover:bg-teal-500/10 hover:border-teal-500/40 hover:text-teal-400'
                      : 'bg-blue-500/5 border-blue-500/20 text-blue-500/80 hover:bg-blue-500/10 hover:border-blue-500/40 hover:text-blue-400'
                  }`}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {batchResults.length > 0 && (
        <div className="space-y-3 animate-fade-in">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Batch Results</p>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-hide">
            {batchResults.map((result) => {
              const isActive = activeResultId === result.id;
              return (
                <button
                  key={`${result.id}-${result.input}`}
                  onClick={() => {
                    cancelBatchReplay();
                    loadSimulation(result.input, result.id);
                  }}
                  className={`w-full flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition-all ${
                    isActive
                      ? isTeal
                        ? 'bg-teal-500/10 border-teal-500/40'
                        : 'bg-blue-500/10 border-blue-500/40'
                      : 'bg-slate-900/40 border-slate-800/50 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-bold text-slate-200 truncate">{result.input}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">
                      Final state: {result.finalState}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-lg border px-2 py-1 text-[9px] font-black uppercase tracking-wider ${
                      result.accepted
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                        : 'bg-red-500/10 border-red-500/40 text-red-400'
                    }`}
                  >
                    {result.accepted ? 'Accepted' : 'Rejected'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {hasRun && steps.length > 0 && (
        <div className="space-y-6 animate-fade-in">
          {/* Tape Visualization */}
          <div className="space-y-3">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Tape State</p>
            <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
              {inputStr.split('').map((ch, i) => {
                const isProcessed = i < (currentStep?.charIndex ?? -1);
                const isCurrent = i === currentStep?.charIndex;
                return (
                  <div
                    key={i}
                    className={`min-w-[42px] h-[42px] flex items-center justify-center rounded-xl border-2 font-mono font-bold text-lg transition-all duration-300 relative overflow-hidden ${
                      isCurrent
                        ? `${isTeal ? 'border-teal-500 bg-teal-500/10 text-teal-400 shadow-teal-500/20' : 'border-blue-500 bg-blue-500/10 text-blue-400 shadow-blue-500/20'} scale-110 shadow-lg`
                        : isProcessed
                        ? 'border-slate-800 bg-slate-800/30 text-slate-600'
                        : 'border-slate-800/50 bg-slate-900/30 text-slate-400'
                    }`}
                  >
                    {isCurrent && (
                      <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/20 to-transparent animate-pulse" />
                    )}
                    {ch}
                  </div>
                );
              })}
              {inputStr.length === 0 && (
                <div className="text-slate-600 text-sm italic font-mono">epsilon (empty)</div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-4 space-y-4 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleReset}
                  className="p-2.5 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl transition-all border border-slate-700/50 text-slate-300 group"
                  title="Reset Simulation"
                >
                  <RotateCcw size={20} className="group-hover:rotate-[-45deg] transition-transform" />
                </button>
                <button
                  onClick={handleStepBack}
                  disabled={stepIndex <= 0}
                  className="p-2.5 bg-slate-800/50 hover:bg-slate-700/50 disabled:opacity-20 rounded-xl transition-all border border-slate-700/50 text-slate-300"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={isPlaying ? () => setIsPlaying(false) : handlePlay}
                  disabled={stepIndex >= steps.length - 1 && !isPlaying}
                  className={`w-32 h-11 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
                    isPlaying
                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/50 shadow-amber-900/20'
                      : `${isTeal ? 'bg-teal-600 text-white shadow-teal-900/20 border border-teal-500' : 'bg-blue-600 text-white shadow-blue-900/20 border border-blue-500'}`
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Pause size={18} fill="currentColor" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play size={18} fill="currentColor" />
                      {stepIndex >= steps.length - 1 ? 'Replay' : 'Play'}
                    </>
                  )}
                </button>
                <button
                  onClick={handleStepForward}
                  disabled={stepIndex >= steps.length - 1}
                  className="p-2.5 bg-slate-800/50 hover:bg-slate-700/50 disabled:opacity-20 rounded-xl transition-all border border-slate-700/50 text-slate-300"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="flex flex-col items-end gap-1.5 flex-1">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Speed
                </div>
                <input
                  type="range"
                  min="200"
                  max="1500"
                  step="100"
                  value={1700 - speed}
                  onChange={(e) => setSpeed(1700 - Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
            </div>

            {/* Current Action Description */}
            <div className="bg-black/20 rounded-xl p-3 border border-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-black text-slate-400 border border-slate-700">
                  {stepIndex}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Operation</p>
                  <p className="text-sm font-medium text-slate-300 truncate">
                    {currentStep && (
                      currentStep.char
                        ? <span>Read <b className={isTeal ? 'text-teal-400' : 'text-blue-400'}>'{currentStep.char}'</b> move to <b className="text-white">{currentStep.stateId}</b></span>
                        : <span>Initialize at <b className="text-white">{currentStep.stateId}</b></span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Result Banner */}
          {stepIndex === steps.length - 1 && (
            <div
              className={`rounded-2xl p-5 border-2 text-center transition-all duration-700 animate-bounce-in shadow-2xl ${
                isAccepted
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-emerald-500/10'
                  : 'bg-red-500/10 border-red-500 text-red-400 shadow-red-500/10'
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Result</span>
                <span className="text-2xl font-black tracking-tight italic">
                  {isAccepted ? 'SEQUENCE ACCEPTED' : 'SEQUENCE REJECTED'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
