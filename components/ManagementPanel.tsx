import React, { useEffect } from "react";
import { User, Edit2, Trash2, FileText, Download, Loader2 } from "lucide-react";
import { Agent } from "../types";

interface ManagementPanelProps {
  agents: Agent[];
  onEditAgent: (agent: Agent) => void;
  onDeleteAgent: (id: string) => void;
  onGenerateReport: () => void;
  isGeneratingReport: boolean;
  hasMessages: boolean;
}

/**
 * Attach runtime buffers to each agent.
 * This does NOT modify your type definition or backend contract.
 * It only exists in frontend runtime memory.
 */
function ensureAgentRuntimeState(agent: Agent) {
  const anyAgent = agent as any;

  if (!anyAgent._runtime) {
    anyAgent._runtime = {
      pendingMemory: [],
      lastSpokeAt: 0,
      interactionCount: 0,
    };
  }
}

const ManagementPanel: React.FC<ManagementPanelProps> = ({
  agents,
  onEditAgent,
  onDeleteAgent,
  onGenerateReport,
  isGeneratingReport,
  hasMessages,
}) => {
  /**
   * Every render — guarantee runtime memory exists
   * This enables conversation continuation across turns
   */
  useEffect(() => {
    agents.forEach(ensureAgentRuntimeState);
  }, [agents]);

  return (
    <div className="w-80 h-full border-l border-neutral-200 p-6 flex flex-col gap-8 bg-white overflow-y-auto">
      <section>
        <h2 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-6">
          Agent Inventory ({agents.length}/10)
        </h2>
        <div className="space-y-3">
          {agents.length === 0 && (
            <div className="p-4 border border-dashed border-neutral-200 rounded text-center">
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest">
                No subjects enlisted
              </p>
            </div>
          )}
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="group p-3 border border-neutral-100 bg-neutral-50/50 hover:bg-white hover:border-neutral-200 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-1 h-1 rounded-full`}
                    style={{ backgroundColor: agent.color }}
                  />
                  <span className="text-xs font-semibold text-neutral-700 truncate max-w-[140px]">
                    {agent.name}
                  </span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEditAgent(agent)}
                    className="p-1 hover:text-neutral-900 text-neutral-400"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    onClick={() => onDeleteAgent(agent.id)}
                    className="p-1 hover:text-red-600 text-neutral-400"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="h-[1px] w-full bg-neutral-100" />

      <section className="flex-1 flex flex-col">
        <h2 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-6">
          Analytical Processing
        </h2>
        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-neutral-50 rounded bg-neutral-50/30 text-center">
          <FileText className="text-neutral-200 mb-4" size={32} />
          <p className="text-[10px] text-neutral-400 uppercase leading-relaxed tracking-widest mb-6">
            Generate a full cognitive behavioral profile of the session once
            sufficient data is gathered.
          </p>
          <button
            disabled={isGeneratingReport || !hasMessages}
            onClick={onGenerateReport}
            className={`w-full flex items-center justify-center gap-2 py-3 text-[10px] font-bold uppercase tracking-widest border transition-all ${
              isGeneratingReport || !hasMessages
                ? "bg-neutral-50 text-neutral-300 border-neutral-100 cursor-not-allowed"
                : "bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50"
            }`}
          >
            {isGeneratingReport ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Download size={14} />
            )}
            {isGeneratingReport ? "Synthesizing..." : "Generate Report"}
          </button>
        </div>
      </section>
    </div>
  );
};

export default ManagementPanel;
