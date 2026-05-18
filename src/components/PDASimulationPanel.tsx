import { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, ChevronRight, ChevronLeft, Pause, Zap } from 'lucide-react';
import { buildPDASteps } from '../lib/pdaSimulation';
import type { PDADefinition, PDASimulationStep } from '../types';

interface PDASimulationPanelProps {
  pda: PDADefinition;
  onStateChange: (state: string | null, transition: { from: string; to: string; label: string } | null) => void;
  onResult: (accepted: boolean | null, rejected: boolean, isRejectedFinal: boolean) => void;
  isTeal: boolean;
}

export default function PDASimulationPanel({ pda, onStateChange, onResult, isTeal }: PDASimulationPanelProps) {
  const [inputStr, setInputStr] = useState('');
  const [steps, setSteps] = useState<PDASimulationStep[]>([]);
  const [stepIndex, setStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(700);
  const [hasRun, setHasRun] = useState(false);
  const [simulationSucceeded, setSimulationSucceeded] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentStep = steps[stepIndex] ?? null;
  const isAtLastStep = hasRun && stepIndex === steps.length - 1 && steps.length > 0;
  const isAccepted = isAtLastStep && simulationSucceeded;
  const isRejectedFinal = isAtLastStep && !simulationSucceeded;

  useEffect(() => {
    if (currentStep) {
      onStateChange(currentStep.toState, {
        from: currentStep.fromState,
        to: currentStep.toState,
        label: currentStep.label,
      });
      onResult(isAccepted || null, isRejectedFinal, isRejectedFinal);
    } else {
      onStateChange(null, null);
      onResult(null, false, false);
    }
  }, [stepIndex, steps]);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setStepIndex(prev => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            clearInterval(intervalRef.current!);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, steps, speed]);

  function runSimulation(str: string) {
    const { steps: newSteps, succeeded } = buildPDASteps(pda, str);
    setSteps(newSteps);
    setStepIndex(newSteps.length > 0 ? 0 : -1);
    setHasRun(true);
    setSimulationSucceeded(succeeded);
    setIsPlaying(false);
  }

  function handleRun() {
    if (!inputStr.trim()) return;
    if (inputStr.split('').some(c => !pda.alphabet.includes(c))) return;
    runSimulation(inputStr);
  }

  function handlePlay() {
    if (stepIndex >= steps.length - 1) setStepIndex(0);
    setIsPlaying(true);
  }

  function handleReset() {
    setSteps([]);
    setStepIndex(-1);
    setIsPlaying(false);
    setHasRun(false);
    setSimulationSucceeded(false);
    onStateChange(null, null);
    onResult(null, false, false);
  }

  function handleStepForward() {
    if (stepIndex < steps.length - 1) setStepIndex(p => p + 1);
  }

  function handleStepBack() {
    if (stepIndex > 0) setStepIndex(p => p - 1);
  }

  const hasInvalid = inputStr.split('').some(c => !pda.alphabet.includes(c));

  const visitedStates = steps.length > 0 && stepIndex >= 0
    ? (() => {
        const sliced = steps.slice(0, stepIndex + 1);
        const states: string[] = [sliced[0].fromState];
        for (const step of sliced) states.push(step.toState);
        return states;
      })()
    : [];

  return (
    <div id="pda-simulation-panel" className="space-y-6">
      {/* Input */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
            Input Sequence
          </label>
          <div className="flex gap-1">
            {pda.alphabet.map(a => (
              <span key={a} className="px-2 py-0.5 rounded bg-slate-800/50 border border-slate-700/50 text-[10px] font-mono text-slate-400">
                {a}
              </span>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputStr}
              onChange={e => { setInputStr(e.target.value); setHasRun(false); }}
              placeholder="Type input string..."
              className={`w-full bg-slate-900/50 border rounded-xl px-4 py-3.5 text-slate-100 placeholder-slate-600 font-mono text-sm focus:outline-none transition-all ${
                hasInvalid
                  ? 'border-red-500/50 focus:border-red-500 ring-4 ring-red-500/10'
                  : `border-slate-800 ${isTeal ? 'focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10' : 'focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10'}`
              }`}
            />
            {inputStr && (
              <button
                onClick={() => { setInputStr(''); handleReset(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300 transition-colors"
              >
                <RotateCcw size={14} />
              </button>
            )}
          </div>
          <button
            onClick={handleRun}
            disabled={!inputStr || hasInvalid}
            className={`px-6 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95 flex items-center gap-2 group ${
              isTeal ? 'bg-teal-600 hover:bg-teal-500 shadow-teal-900/20' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20'
            }`}
          >
            <Zap size={16} className={!inputStr || hasInvalid ? '' : 'group-hover:animate-pulse'} />
            <span className="hidden sm:inline">Load</span>
          </button>
        </div>
        {hasInvalid && (
          <p className="text-red-400 text-[10px] font-semibold animate-shake">
            Error: Invalid characters detected.
          </p>
        )}

        {/* Examples */}
        {pda.examples && pda.examples.length > 0 && (
          <div id="pda-examples-section" className="space-y-2 pt-2 border-t border-white/5">
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Quick Test Protocols</p>
            <div className="flex flex-wrap gap-2">
              {pda.examples.map((ex, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputStr(ex);
                    setHasRun(false);
                    setTimeout(() => runSimulation(ex), 0);
                  }}
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

      {hasRun && steps.length > 0 && (
        <div className="space-y-6 animate-fade-in">
          {/* Tape */}
          <div className="space-y-3">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Tape State</p>
            <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
              {inputStr.split('').map((ch, i) => {
                const currentPos = currentStep?.inputPosition ?? 0;
                const isProcessed = i < currentPos;
                const isCurrent = i === currentPos && i < inputStr.length;
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
            </div>
          </div>

          {/* State path breadcrumb */}
          {visitedStates.length > 0 && (
            <div className="space-y-3">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">State Path</p>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
                {visitedStates.map((state, i) => (
                  <div key={i} className="flex items-center gap-1.5 shrink-0">
                    {i > 0 && <span className="text-slate-700 text-xs font-bold">→</span>}
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all ${
                        i === visitedStates.length - 1
                          ? `${isTeal ? 'bg-teal-500/10 text-teal-400' : 'bg-blue-500/10 text-blue-400'} shadow-md`
                          : 'text-slate-600'
                      }`}
                    >
                      {state}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-4 space-y-4 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleReset}
                  className="p-2.5 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl transition-all border border-slate-700/50 text-slate-300 group"
                  title="Reset"
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
                    <><Pause size={18} fill="currentColor" /> Pause</>
                  ) : (
                    <><Play size={18} fill="currentColor" /> {stepIndex >= steps.length - 1 ? 'Replay' : 'Play'}</>
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
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Speed</div>
                <input
                  type="range"
                  min="200"
                  max="1500"
                  step="100"
                  value={1700 - speed}
                  onChange={e => setSpeed(1700 - Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
            </div>

            {/* Operation log */}
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
                        ? <span>Read <b className={isTeal ? 'text-teal-400' : 'text-blue-400'}>'{currentStep.char}'</b> → <b className="text-white">{currentStep.toState}</b></span>
                        : currentStep.label === ''
                        ? <span>ε-transition → <b className="text-white">{currentStep.toState}</b></span>
                        : currentStep.label === 'Δ'
                        ? <span>Δ end-of-input → <b className="text-white">{currentStep.toState}</b></span>
                        : <span>Transition → <b className="text-white">{currentStep.toState}</b></span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Result banner — delayed so the graph animation is visible first */}
          {isAtLastStep && (
            <div
              className={`rounded-2xl p-5 border-2 text-center animate-bounce-in shadow-2xl ${
                isAccepted
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-emerald-500/10'
                  : 'bg-red-500/10 border-red-500 text-red-400 shadow-red-500/10'
              }`}
              style={{ animationDelay: isAccepted ? '0.45s' : '1s', animationFillMode: 'both' }}
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
