import React, { useState, useEffect, useCallback, useRef } from "react";
import ControlPanel from "./components/ControlPanel";
import DiscussionPanel from "./components/DiscussionPanel";
import ManagementPanel from "./components/ManagementPanel";
import AgentModal from "./components/AgentModal";
import DurationModal from "./components/DurationModal";
import { Agent, Message } from "./types";
import {
  generateAgentReply,
  summarizeAgentMemory,
  generateExperimentReport,
} from "./services/geminiService";

const AGENT_COLORS = [
  "#3b82f6",
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f43f5e",
  "#6366f1",
  "#a855f7",
];

const App: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState(300);
  const [elapsed, setElapsed] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDurationModalOpen, setIsDurationModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const simulationTimerRef = useRef<number | null>(null);
  const agentLoopRef = useRef<number | null>(null);
  const runTurnRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (isPlaying && elapsed < duration) {
      simulationTimerRef.current = window.setInterval(() => {
        setElapsed((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
    }
    return () => {
      if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
    };
  }, [isPlaying, elapsed, duration]);

  const handleTogglePlay = (restart?: boolean) => {
    if (elapsed >= duration && duration > 0) {
      setElapsed(0);
      setMessages([]);
      setIsPlaying(false);
      setTimeout(() => {
        setIsPlaying(true);
        const topicMsg: Message = {
          id: "system-topic-" + Date.now(),
          agentId: "system",
          agentName: "SYSTEM",
          timestamp: new Date(),
          content: topic,
          isSystem: true,
        };
        setMessages([topicMsg]);
      }, 50);
      return;
    }

    if (!topic.trim()) {
      alert("Please define a Discussion Parameter (Topic) first.");
      return;
    }
    if (agents.length < 2) {
      alert("Please add at least 2 Agent Subjects to foster interaction.");
      return;
    }

    if (!isPlaying && messages.length === 0) {
      const topicMsg: Message = {
        id: "system-topic-" + Date.now(),
        agentId: "system",
        agentName: "SYSTEM",
        timestamp: new Date(),
        content: topic,
        isSystem: true,
      };
      setMessages([topicMsg]);
    }

    setIsPlaying(!isPlaying);
  };

  const runAgentTurn = async () => {
    if (!isPlaying || agents.length === 0 || elapsed >= duration) return;

    /**
     * STEP 1 — pick speaker (avoid same agent speaking repeatedly)
     */
    const nonSystemMessages = messages.filter((m) => !m.isSystem);
    const lastSpeaker =
      nonSystemMessages.length > 0
        ? nonSystemMessages[nonSystemMessages.length - 1].agentId
        : null;

    let candidateAgents = agents.filter((a) => a.id !== lastSpeaker);
    if (candidateAgents.length === 0) candidateAgents = agents;

    const activeAgent =
      candidateAgents[Math.floor(Math.random() * candidateAgents.length)];

    /**
     * STEP 2 — choose target intelligently (force interaction)
     */
    const recentMessages = nonSystemMessages.slice(-8);

    let targetMessage: Message | undefined;

    if (recentMessages.length > 0) {
      // Prefer messages not from self
      const validTargets = recentMessages.filter(
        (m) => m.agentId !== activeAgent.id,
      );

      if (validTargets.length > 0) {
        // 80% chance direct reply
        if (Math.random() < 0.8) {
          targetMessage =
            validTargets[Math.floor(Math.random() * validTargets.length)];
        }
      }
    }

    try {
      const reply = await generateAgentReply(
        activeAgent,
        topic,
        messages,
        agents,
        targetMessage,
      );

      const newMessage: Message = {
        id: crypto.randomUUID(),
        agentId: activeAgent.id,
        agentName: activeAgent.name,
        timestamp: new Date(),
        content: reply,
        parentId: targetMessage?.id,
      };

      /**
       * IMPORTANT: functional state update prevents stale state freeze
       */
      setMessages((prev) => {
        const updated = [...prev, newMessage];

        // memory update per-agent (stable)
        if (
          updated.filter((m) => m.agentId === activeAgent.id).length % 3 ===
          0
        ) {
          summarizeAgentMemory(activeAgent, updated.slice(-6)).then(
            (summary) => {
              setAgents((aPrev) =>
                aPrev.map((a) =>
                  a.id === activeAgent.id
                    ? { ...a, memorySummary: summary }
                    : a,
                ),
              );
            },
          );
        }

        return updated;
      });
    } catch (error) {
      console.error("Turn execution failed", error);
    }
  };
  runTurnRef.current = runAgentTurn;

  useEffect(() => {
    if (!isPlaying) {
      if (agentLoopRef.current) clearTimeout(agentLoopRef.current);
      agentLoopRef.current = null;
      return;
    }

    const loop = () => {
      runTurnRef.current();

      const nextDelay = Math.random() * 6000 + 4000;
      agentLoopRef.current = window.setTimeout(loop, nextDelay);
    };

    loop();

    return () => {
      if (agentLoopRef.current) clearTimeout(agentLoopRef.current);
    };
  }, [isPlaying]);

  const handleSaveAgent = (data: Partial<Agent>) => {
    if (editingAgent) {
      setAgents((prev) =>
        prev.map((a) => (a.id === editingAgent.id ? { ...a, ...data } : a)),
      );
    } else {
      const newAgent: Agent = {
        id: crypto.randomUUID(),
        name: data.name || "Subject-" + (agents.length + 1),
        behavior: data.behavior || "",
        memorySummary: "Subject initialized. Awaiting experiment start.",
        color: AGENT_COLORS[agents.length % AGENT_COLORS.length],
      };
      setAgents((prev) => [...prev, newAgent]);
    }
    setEditingAgent(null);
  };

  const handleDeleteAgent = (id: string) => {
    setAgents((prev) => prev.filter((a) => a.id !== id));
  };

  const handleGenerateReport = async () => {
    if (messages.length < 5) {
      alert(
        "Insufficient data points. Let the simulation run longer before synthesizing a report.",
      );
      return;
    }
    setIsGeneratingReport(true);
    try {
      const report = await generateExperimentReport(topic, agents, messages);

      // Import jsPDF dynamically for PDF generation
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      const margin = 10;
      const pageWidth = doc.internal.pageSize.getWidth();
      const contentWidth = pageWidth - 2 * margin;

      let y = 20;

      // Title
      doc.setFontSize(22);
      doc.setTextColor(0);
      doc.text("SYNAPSE RESEARCH REPORT", margin, y);
      y += 10;

      // Metadata
      doc.setFontSize(10);
      doc.setTextColor(100);

      // Topic (dynamic height — FIXES OVERLAP)
      const topicLines = doc.splitTextToSize(`Topic: ${topic}`, contentWidth);
      doc.text(topicLines, margin, y);
      y += topicLines.length * 5 + 4;

      // Generated time
      doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y);
      y += 5;

      // Duration
      doc.text(`Duration: ${elapsed}s / ${duration}s`, margin, y);
      y += 8;

      // Divider
      doc.setDrawColor(200);
      doc.line(margin, y, pageWidth - margin, y);

      y += 10;

      const sections = [
        { title: "1. DOMINANT AGENTS", content: report.dominantAgents },
        { title: "2. AGREEMENT CLUSTERS", content: report.agreementClusters },
        { title: "3. CONFLICTS", content: report.conflicts },
        { title: "4. INFLUENCE CHAINS", content: report.influenceChains },
        { title: "5. TOPIC DRIFT", content: report.topicDrift },
        {
          title: "6. BEHAVIORAL STABILITY",
          content: report.behavioralStability,
        },
      ];

      sections.forEach((sec) => {
        const lines = doc.splitTextToSize(sec.content, contentWidth);

        // calculate required height BEFORE drawing
        const blockHeight = 7 + lines.length * 5 + 10;
        const pageHeight = doc.internal.pageSize.getHeight();

        if (y + blockHeight > pageHeight - 15) {
          doc.addPage();
          y = 20;
        }

        // title
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.setFont("helvetica", "bold");
        doc.text(sec.title, margin, y);
        y += 7;

        // body
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(60);
        doc.text(lines, margin, y, { lineHeightFactor: 1.4 });
        y += lines.length * 5 + 10;
      });

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      doc.save(`SYNAPSE_ANALYTICS_${timestamp}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Report generation engine failure.");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-neutral-50 overflow-hidden text-neutral-900 selection:bg-neutral-200">
      <ControlPanel
        onAddAgent={() => {
          setEditingAgent(null);
          setIsModalOpen(true);
        }}
        topic={topic}
        onTopicChange={setTopic}
        duration={duration}
        onDurationChange={setDuration}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        elapsed={elapsed}
        onOpenDurationModal={() => setIsDurationModalOpen(true)}
      />

      <DiscussionPanel messages={messages} />

      <ManagementPanel
        agents={agents}
        onEditAgent={(a) => {
          setEditingAgent(a);
          setIsModalOpen(true);
        }}
        onDeleteAgent={handleDeleteAgent}
        onGenerateReport={handleGenerateReport}
        isGeneratingReport={isGeneratingReport}
        hasMessages={messages.filter((m) => !m.isSystem).length > 0}
      />

      <AgentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAgent}
        editingAgent={editingAgent}
      />

      <DurationModal
        isOpen={isDurationModalOpen}
        onClose={() => setIsDurationModalOpen(false)}
        onConfirm={(secs) => {
          setDuration(secs);
          setElapsed(0);
        }}
      />
    </div>
  );
};

export default App;
