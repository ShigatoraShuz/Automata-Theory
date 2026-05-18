import { useState } from 'react';
import { ArrowLeft, GitBranch, BookOpen, Layers, Terminal, Activity, Users, HelpCircle, HelpCircle as GuideIcon, type LucideIcon } from 'lucide-react';
import type { DFADefinition, DFAChoice, CFGDerivationStep } from '../types';
import { alphaCFG, binaryCFG, alphaPDA, binaryPDA } from '../data/grammarData';
import DFAGraph from './DFAGraph';
import SimulationPanel from './SimulationPanel';
import CFGSection from './CFGSection';
import CFGSimulationPanel from './CFGSimulationPanel';
import PDAGraph from './PDAGraph';
import PDASimulationPanel from './PDASimulationPanel';
import MembersSection from './MembersSection';
import TutorialSection from './TutorialSection';
import DFAUIBlurGuide from './DFAUIBlurGuide';
// PDASection is archived in src/components/PDASection.tsx (not rendered)

interface DFAPageProps {
  dfa: DFADefinition;
  choice: DFAChoice;
  onBack: () => void;
}

type Tab = 'dfa' | 'cfg' | 'pda' | 'members' | 'tutorial';

export default function DFAPage({ dfa, choice, onBack }: DFAPageProps) {
  const [currentState, setCurrentState] = useState<string | null>(null);
  const [visitedTransition, setVisitedTransition] = useState<{
    from: string;
    to: string;
    label: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('dfa');
  const [showGuide, setShowGuide] = useState(false);
  const [cfgSteps, setCfgSteps] = useState<CFGDerivationStep[]>([]);
  const [cfgStepIndex, setCfgStepIndex] = useState(-1);
  const [pdaCurrentState, setPdaCurrentState] = useState<string | null>(null);
  const [pdaVisitedTransition, setPdaVisitedTransition] = useState<{ from: string; to: string; label: string } | null>(null);
  const [pdaIsRejectedFinal, setPdaIsRejectedFinal] = useState(false);

  const cfg = choice === 'alpha' ? alphaCFG : binaryCFG;
  const pda = choice === 'alpha' ? alphaPDA : binaryPDA;

  const tabs: { id: Tab; label: string; icon: LucideIcon }[] = [
    { id: 'dfa', label: 'DFA Logic', icon: GitBranch },
    { id: 'cfg', label: 'CFG Blueprint', icon: BookOpen },
    { id: 'pda', label: 'PDA Flowchart', icon: Layers },
    { id: 'members', label: 'Team', icon: Users },
    { id: 'tutorial', label: 'Manual', icon: HelpCircle },
  ];

  const isTeal = choice === 'alpha';
  const accent = isTeal ? 'text-teal-400' : 'text-blue-400';
  const accentBg = isTeal ? 'bg-teal-500/10' : 'bg-blue-500/10';

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col relative overflow-hidden font-sans tech-grid">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-blue-600/5 to-transparent" />
        <div className={`absolute top-[10%] right-[10%] w-[600px] h-[600px] rounded-full blur-[140px] opacity-20 animate-pulse ${isTeal ? 'bg-teal-500' : 'bg-blue-500'}`} />
      </div>

      <header className="border-b border-white/5 bg-slate-950/80 backdrop-blur-3xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all text-xs font-black uppercase tracking-tighter group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Return
            </button>
            <div className="h-8 w-[1px] bg-white/10" />
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-black text-white tracking-tight tech-text-glow">{dfa.name}</h1>
                <div className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-[0.1em] ${
                  isTeal ? 'bg-teal-500/10 border-teal-500/30 text-teal-400' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                }`}>
                  <Activity size={10} className="animate-pulse" />
                  {choice} node
                </div>
              </div>
              <p className="text-[11px] font-mono text-slate-500 mt-1 tracking-tight">{dfa.regex}</p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-6">
             <div className="flex flex-col items-end border-r border-white/10 pr-6">
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Core Protocol</span>
               <span className="text-xs font-bold text-slate-300">v2.5.0-ALPHA</span>
             </div>
             <div className="flex items-center gap-3 bg-white/5 px-4 py-2.5 rounded-xl border border-white/10 shadow-xl shadow-black/20">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
                <span className="text-[10px] font-black text-slate-100 uppercase tracking-widest">System Active</span>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-10 flex flex-col gap-10 flex-1 relative z-10">
        {/* Futuristic Floating Tab Bar */}
        <div className="flex justify-center">
          <div className="glass-card p-1.5 rounded-2xl flex relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-6 sm:px-8 py-3 rounded-xl text-[10px] sm:text-[11px] font-black transition-all uppercase tracking-[0.1em] sm:tracking-[0.2em] relative z-10 ${
                    isActive
                      ? `text-white bg-white/10 shadow-lg border border-white/10`
                      : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <Icon size={16} className={isActive ? accent : 'opacity-40'} />
                  <span className="hidden md:inline">{tab.label}</span>
                  <span className="md:hidden">{tab.id === 'dfa' ? 'DFA' : tab.id === 'cfg' ? 'CFG' : tab.id === 'pda' ? 'PDA' : tab.label}</span>
                  {isActive && (
                    <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-[2px] rounded-full tech-text-glow ${isTeal ? 'bg-teal-400' : 'bg-blue-400'}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Section with entrance animation */}
        <div className="flex-1 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
          {activeTab === 'dfa' && (
            <div className="grid lg:grid-cols-12 gap-8 h-full">
              <div className="lg:col-span-8 flex flex-col gap-8">
                <div id="graph-container" className="glass-card rounded-[2.5rem] p-8 relative overflow-hidden h-[640px] flex flex-col">
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-50 ${accent}`} />
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${accentBg}`}>
                        <Terminal size={20} className={accent} />
                      </div>
                      <div>
                        <h2 className="text-sm font-black text-white uppercase tracking-[0.15em]">Neural Logic Processor</h2>
                        <div className="flex items-center gap-2 mt-1">
                          <div className={`w-2 h-2 rounded-full animate-pulse ${isTeal ? 'bg-teal-500' : 'bg-blue-500'}`} />
                          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Live_Node_Stream</span>
                        </div>
                      </div>
                    </div>
                    {currentState && (
                       <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-900/80 border border-white/5 backdrop-blur-xl">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active State:</span>
                          <span className={`font-mono font-black text-sm tech-text-glow ${accent}`}>{currentState}</span>
                       </div>
                    )}
                    <button
                      onClick={() => setShowGuide(true)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${
                        isTeal ? 'bg-teal-500/10 border-teal-500/20 text-teal-400 hover:bg-teal-500/20' : 'bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20'
                      }`}
                    >
                      <GuideIcon size={12} />
                      System Guide
                    </button>
                  </div>

                  <div className="flex-1 w-full bg-slate-950/40 rounded-[2rem] border border-white/5 relative overflow-hidden group shadow-2xl">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.4)_100%)] pointer-events-none" />
                    <DFAGraph 
                      dfa={dfa} 
                      currentState={currentState} 
                      visitedTransition={visitedTransition}
                    />
                  </div>
                </div>

                <div id="transition-matrix" className="glass-card rounded-[2.5rem] p-8">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="flex flex-col">
                      <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">DFA Execution Matrix</h3>
                      <p className="text-[10px] font-medium text-slate-600 mt-1 uppercase tracking-widest">Formal state-transition mapping</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs font-mono">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="text-left pr-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Source_ID</th>
                          {dfa.alphabet.map((a) => (
                            <th key={a} className="px-6 py-4 text-center">
                              <span className={`px-3 py-1.5 rounded-lg border text-sm font-black ${
                                isTeal ? 'bg-teal-500/5 border-teal-500/20 text-teal-400' : 'bg-blue-500/5 border-blue-500/20 text-blue-400'
                              }`}>{a}</span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.03]">
                        {dfa.states.map((s) => {
                          const isCurrentRow = s.id === currentState;
                          return (
                            <tr key={s.id} className={`group transition-all duration-300 ${isCurrentRow ? 'bg-white/5' : 'hover:bg-white/[0.02]'}`}>
                              <td className="pr-8 py-5 relative">
                                {isCurrentRow && <div className={`absolute left-0 top-1/4 bottom-1/4 w-1 rounded-full ${isTeal ? 'bg-teal-400' : 'bg-blue-400'}`} />}
                                <div className="flex items-center gap-3">
                                  <span className={`text-sm font-black ${
                                    s.isStart ? accent : s.isAccept ? 'text-emerald-400' : s.isTrap ? 'text-slate-700' : 'text-slate-300'
                                  }`}>{s.label}</span>
                                  {s.isStart && <span className="text-[9px] font-black text-slate-600 border border-slate-800 px-1.5 py-0.5 rounded-md uppercase tracking-widest">Root</span>}
                                </div>
                              </td>
                              {dfa.alphabet.map((a) => {
                                const next = dfa.transitionTable[s.id]?.[a] ?? '—';
                                const isActive = visitedTransition?.from === s.id && visitedTransition?.label === a;
                                return (
                                  <td key={a} className={`px-6 py-5 text-center transition-all ${isActive ? `font-black text-sm tech-text-glow ${accent}` : 'text-slate-500 group-hover:text-slate-400'}`}>
                                    {next}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4">
                <div className="glass-card rounded-[2.5rem] p-8 h-full sticky top-[6.5rem]">
                  <SimulationPanel
                    dfa={dfa}
                    onStateChange={(state, transition) => {
                      setCurrentState(state);
                      setVisitedTransition(transition);
                    }}
                    onResult={() => {}}
                    isTeal={isTeal}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cfg' && (
            <div className="grid lg:grid-cols-12 gap-8 h-full">
              <div className="lg:col-span-8 flex flex-col gap-8">
                <div id="cfg-grammar-container" className="glass-card rounded-[2.5rem] p-8 relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-50 ${accent}`} />
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${accentBg}`}>
                        <BookOpen size={20} className={accent} />
                      </div>
                      <div>
                        <h2 className="text-sm font-black text-white uppercase tracking-[0.15em]">Grammar Derivation Engine</h2>
                        <div className="flex items-center gap-2 mt-1">
                          <div className={`w-2 h-2 rounded-full animate-pulse ${isTeal ? 'bg-teal-500' : 'bg-blue-500'}`} />
                          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Live_Production_Stream</span>
                        </div>
                      </div>
                    </div>
                    <div className={`px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-[0.1em] ${
                      isTeal ? 'bg-teal-500/10 border-teal-500/30 text-teal-400' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                    }`}>
                      LEFTMOST MODE
                    </div>
                  </div>

                  <div className="w-full bg-slate-950/40 rounded-[2rem] border border-white/5 relative overflow-hidden shadow-2xl">
                    <CFGSection cfg={cfg} derivationSteps={cfgSteps} currentStepIndex={cfgStepIndex} isTeal={isTeal} />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4">
                <div className="glass-card rounded-[2.5rem] p-8 h-full sticky top-[6.5rem]">
                  <CFGSimulationPanel
                    cfg={cfg}
                    onStepChange={(_step, index, allSteps) => { setCfgStepIndex(index); setCfgSteps(allSteps); }}
                    onResult={() => {}}
                    isTeal={isTeal}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pda' && (
            <div className="grid lg:grid-cols-12 gap-8 h-full">
              <div className="lg:col-span-8 flex flex-col gap-8">
                <div id="pda-graph-container" className="glass-card rounded-[2.5rem] p-8 relative overflow-hidden h-[640px] flex flex-col">
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-50 ${accent}`} />
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${accentBg}`}>
                        <Layers size={20} className={accent} />
                      </div>
                      <div>
                        <h2 className="text-sm font-black text-white uppercase tracking-[0.15em]">Stack Logic Processor</h2>
                        <div className="flex items-center gap-2 mt-1">
                          <div className={`w-2 h-2 rounded-full animate-pulse ${isTeal ? 'bg-teal-500' : 'bg-blue-500'}`} />
                          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Live_State_Flow</span>
                        </div>
                      </div>
                    </div>
                    <div className={`px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-[0.1em] ${
                      isTeal ? 'bg-teal-500/10 border-teal-500/30 text-teal-400' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                    }`}>
                      PUSHDOWN ACTIVE
                    </div>
                  </div>

                  <div className="flex-1 w-full bg-slate-950/40 rounded-[2rem] border border-white/5 relative overflow-hidden group shadow-2xl">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.4)_100%)] pointer-events-none" />
                    <PDAGraph
                      pda={pda}
                      currentState={pdaCurrentState}
                      visitedTransition={pdaVisitedTransition}
                      isTeal={isTeal}
                      isRejectedFinal={pdaIsRejectedFinal}
                    />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4">
                <div className="glass-card rounded-[2.5rem] p-8 h-full sticky top-[6.5rem]">
                  <PDASimulationPanel
                    pda={pda}
                    onStateChange={(state, transition) => {
                      setPdaCurrentState(state);
                      setPdaVisitedTransition(transition);
                    }}
                    onResult={(_accepted, _rejected, isRejectedFinal) => {
                      setPdaIsRejectedFinal(isRejectedFinal);
                    }}
                    isTeal={isTeal}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="max-w-6xl mx-auto w-full">
              <MembersSection />
            </div>
          )}

          {activeTab === 'tutorial' && (
            <div className="max-w-6xl mx-auto w-full">
              <TutorialSection />
            </div>
          )}
        </div>
      </main>

      {/* Futuristic Scanline Effect */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] overflow-hidden">
        <div className="w-full h-[2px] bg-white animate-scan" />
      </div>

      <DFAUIBlurGuide isOpen={showGuide} onClose={() => setShowGuide(false)} />
    </div>
  );
}
