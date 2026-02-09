import React from "react";
import { Plus, Play, Pause, RefreshCw } from "lucide-react";

interface ControlPanelProps {
  onAddAgent: () => void;
  topic: string;
  onTopicChange: (topic: string) => void;
  duration: number;
  onDurationChange: (duration: number) => void;
  isPlaying: boolean;
  onTogglePlay: (restart?: boolean) => void; // <-- CHANGED
  elapsed: number;
  onOpenDurationModal: () => void;
}

const formatSeconds = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map((v) => v.toString().padStart(2, "0")).join(":");
};

const ControlPanel: React.FC<ControlPanelProps> = ({
  onAddAgent,
  topic,
  onTopicChange,
  duration,
  onDurationChange,
  isPlaying,
  onTogglePlay,
  elapsed,
  onOpenDurationModal,
}) => {
  const isFinished = elapsed >= duration && duration > 0;

  return (
    <div className="w-80 h-full border-r border-neutral-200 p-6 flex flex-col gap-8 bg-white overflow-y-auto">
      <div>
        <h1 className="text-2xl font-light tracking-tighter text-neutral-800">
          SYNAPSE
        </h1>
        <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-medium">
          Cognitive Behavioural Sandbox
        </p>
        <div className="h-[1px] w-full bg-neutral-100 mt-4" />
      </div>

      <section>
        <button
          onClick={onAddAgent}
          className="w-full flex items-center justify-center gap-2 border border-neutral-200 py-3 text-xs font-semibold uppercase tracking-widest text-neutral-600 hover:bg-neutral-50 transition-all active:scale-[0.98]"
        >
          <Plus size={14} />
          Add Agent Subject
        </button>
      </section>

      <section className="flex flex-col gap-3">
        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
          Discussion Parameter
        </label>
        <textarea
          value={topic}
          onChange={(e) => onTopicChange(e.target.value)}
          className="w-full h-32 bg-neutral-50 border border-neutral-100 p-3 text-sm outline-none focus:border-neutral-300 transition-colors resize-none leading-relaxed"
          placeholder="Describe the scenario, ethical dilemma, or specific topic for agents to investigate..."
        />
      </section>

      <section className="flex flex-col gap-3">
        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
          Duration Profile
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onDurationChange(120)}
            className={`py-2 text-[10px] border ${duration === 120 ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-100 text-neutral-500 hover:border-neutral-300"}`}
          >
            00:02:00
          </button>
          <button
            onClick={() => onDurationChange(1800)}
            className={`py-2 text-[10px] border ${duration === 1800 ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-100 text-neutral-500 hover:border-neutral-300"}`}
          >
            00:30:00
          </button>
        </div>
        <button
          onClick={onOpenDurationModal}
          className="w-full py-2 text-[10px] border border-neutral-100 text-neutral-500 hover:border-neutral-300 uppercase tracking-widest"
        >
          Set Custom (HH:MM:SS)
        </button>
      </section>

      <section className="mt-auto pt-6 border-t border-neutral-100">
        <div className="flex justify-between items-center mb-4">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
            Simulation Clock
          </span>
          <span className="mono text-sm text-neutral-600">
            {formatSeconds(elapsed)} / {formatSeconds(duration)}
          </span>
        </div>
        <button
          onClick={() => onTogglePlay(isFinished)} // <-- CHANGED
          className={`w-full flex items-center justify-center gap-2 py-4 text-xs font-bold uppercase tracking-[0.2em] transition-all active:scale-[0.98] ${
            isFinished
              ? "bg-blue-600 text-white border border-blue-700 hover:bg-blue-700 shadow-lg"
              : isPlaying
                ? "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100"
                : "bg-neutral-900 text-white hover:bg-neutral-800 shadow-lg shadow-neutral-200"
          }`}
        >
          {isFinished ? (
            <RefreshCw size={16} />
          ) : isPlaying ? (
            <Pause size={16} />
          ) : (
            <Play size={16} />
          )}
          {isFinished
            ? "Restart Experiment"
            : isPlaying
              ? "Pause Experiment"
              : "Start Experiment"}
        </button>
      </section>
    </div>
  );
};

export default ControlPanel;
