
export interface Agent {
  id: string;
  name: string;
  behavior: string;
  memorySummary: string;
  color: string;
}

export interface Message {
  id: string;
  agentId: string;
  agentName: string;
  timestamp: Date;
  content: string;
  parentId?: string; // ID of the message being replied to
  isSystem?: boolean; // For initial topic display
}

export interface SimulationState {
  isPlaying: boolean;
  topic: string;
  duration: number; // in seconds
  elapsed: number; // in seconds
  messages: Message[];
  agents: Agent[];
}

export interface ReportData {
  dominantAgents: string;
  agreementClusters: string;
  conflicts: string;
  influenceChains: string;
  topicDrift: string;
  behavioralStability: string;
  overallConclusion: string;
}
