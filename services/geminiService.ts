import { Agent, Message, ReportData } from "../types";

const LOCAL_LLM_URL = "https://jackets-sox-changed-various.trycloudflare.com/askgemini";

/**
 * Helper retry wrapper
 */
async function callGeminiWithRetry<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0) {
      console.warn(`Local LLM failed. Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return callGeminiWithRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}


async function callLocalLLM(prompt: string): Promise<string> {
  const form = new FormData();
  form.append("prompt", prompt);

  const res = await fetch(LOCAL_LLM_URL, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    throw new Error(`Local LLM error: ${res.status}`);
  }

  const data = await res.json();
  return (data?.response ?? "").trim();
}


export async function generateAgentReply(
  agent: Agent,
  topic: string,
  history: Message[],
  allAgents: Agent[],
  targetMessage?: Message
): Promise<string> {

  // Only recent meaningful messages
  const historyText = history
    .filter(m => !m.isSystem)
    .slice(-12)
    .map((m) => `[${m.agentName}]: ${m.content}`)
    .join("\n");

  // stronger directed stimulus
  const targetContext = targetMessage
    ? `
PRIMARY INTERACTION TARGET:
You MUST respond to ${targetMessage.agentName}.
Their statement: "${targetMessage.content}"

You may disagree, support, question, or reinterpret it — but you must engage it.
`
    : `
No one addressed you directly.
You must introduce a perspective that challenges or advances the discussion.
`;

  // conversational continuation pressure
  const continuationRule = `
CRITICAL RULE:
Your response must create a reaction from another agent.
End your message in a way that invites or provokes a reply.
Avoid concluding the discussion.
`;

  const prompt = `
You are an autonomous participant in a live multi-agent cognitive simulation.

EXPERIMENT TOPIC: "${topic}"

IDENTITY: ${agent.name}
BEHAVIORAL RULES: ${agent.behavior}
CURRENT INTERNAL MEMORY: ${agent.memorySummary}

OTHER AGENTS: ${allAgents.map(a => a.name).join(", ")}

${targetContext}

RECENT DISCUSSION:
${historyText}

${continuationRule}

RESPONSE REQUIREMENTS:
- Stay in character
- Maximum 3 sentences
- No assistant-style language
- Avoid summarizing the discussion
- Push the conversation forward

Provide only the spoken dialogue.
`;

  return callGeminiWithRetry(async () => {
    const text = await callLocalLLM(prompt);
    return text || "...observes silently but signals disagreement.";
  });
}

/**
 * Summarize agent memory
 * (less aggressive — prevents conversation collapse)
 */
export async function summarizeAgentMemory(
  agent: Agent,
  newMessages: Message[]
): Promise<string> {

  // IMPORTANT: prevent over-updating memory
  if (newMessages.length < 3) return agent.memorySummary;

  const interactionLog = newMessages
    .map(m => `${m.agentName}: ${m.content}`)
    .join("\n");

  const prompt = `
You are maintaining a cognitive memory state for agent "${agent.name}".

PREVIOUS MEMORY:
${agent.memorySummary}

NEW OBSERVATIONS:
${interactionLog}

Update the memory:
- Keep personality stable
- Track opinions about other agents
- Track beliefs about the topic
- Do NOT summarize the whole conversation

Return a concise evolving internal belief state (max 80 words).
Return only text.
`;

  return callGeminiWithRetry(async () => {
    const result = await callLocalLLM(prompt);
    return result || agent.memorySummary;
  });
}

/**
 * Final analysis report
 */
export async function generateExperimentReport(
  topic: string,
  agents: Agent[],
  history: Message[]
): Promise<ReportData> {

  const transcript = history
    .filter(m => !m.isSystem)
    .slice(-120)
    .map(m => `${m.agentName}: ${m.content}`)
    .join("\n");

  async function ask(field: string, instruction: string): Promise<string> {
    const prompt = `
You are analyzing a multi-agent discussion.

Return ONLY plain text.
Maximum 80 words.
No JSON.
No markdown.

TASK: ${instruction}

TOPIC:
${topic}

AGENTS:
${agents.map(a => a.name).join(", ")}

TRANSCRIPT:
${transcript}
`;

    const res = await callGeminiWithRetry(() => callLocalLLM(prompt));
    console.log("FIELD:", field, "\n", res);
    return (res || "").trim();
  }

  const [
    dominantAgents,
    agreementClusters,
    conflicts,
    influenceChains,
    topicDrift,
    behavioralStability
  ] = await Promise.all([
    ask("dominantAgents", "Who dominated or guided the discussion and why?"),
    ask("agreementClusters", "Which participants agreed and formed shared viewpoints?"),
    ask("conflicts", "What disagreements or competing interpretations occurred?"),
    ask("influenceChains", "Who influenced whose decisions over time?"),
    ask("topicDrift", "Did the discussion drift away from the original topic?"),
    ask("behavioralStability", "Did participants stay consistent with their roles?")
  ]);

  return {
    dominantAgents,
    agreementClusters,
    conflicts,
    influenceChains,
    topicDrift,
    behavioralStability,
    overallConclusion: "" // no longer used
  };
}
