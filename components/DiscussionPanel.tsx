import React, { useRef, useEffect, useState, useMemo } from "react";
import { Message } from "../types";

interface DiscussionPanelProps {
  messages: Message[];
}

const DiscussionPanel: React.FC<DiscussionPanelProps> = ({ messages }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  /**
   * IMPORTANT FIX:
   * Always work on a stable sorted copy
   * Prevents React diff collapse when parent updates array in-place
   */
  const stableMessages = useMemo(() => {
    return [...messages].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
    );
  }, [messages]);

  /**
   * Faster parent lookup
   */
  const messageMap = useMemo(() => {
    const map = new Map<string, Message>();
    stableMessages.forEach((m) => map.set(m.id, m));
    return map;
  }, [stableMessages]);

  useEffect(() => {
    if (shouldAutoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [stableMessages, shouldAutoScroll]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShouldAutoScroll(isAtBottom);
  };

  return (
    <div className="flex-1 h-full flex flex-col bg-white overflow-hidden relative">
      <header className="px-8 py-4 border-b border-neutral-100 flex items-center justify-between bg-white z-10">
        <div className="flex items-center gap-3">
          <div
            className={`w-2 h-2 rounded-full ${stableMessages.length > 0 ? "bg-green-500 animate-pulse" : "bg-neutral-300"}`}
          />
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
            Live Observation Feed
          </span>
        </div>
        <div className="text-[10px] mono text-neutral-500 uppercase tracking-tighter">
          Cognitive Stream Analysis v4.0
        </div>
      </header>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-6 md:px-12 py-8 space-y-6 scroll-smooth"
      >
        {stableMessages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-neutral-500 opacity-100 space-y-4">
            <div className="w-px h-16 bg-neutral-500" />
            <p className="text-[10px] uppercase tracking-[0.3em] font-medium">
              Waiting for Simulation Launch
            </p>
          </div>
        )}

        {stableMessages.map((msg) => {
          if (msg.isSystem) {
            return (
              <div
                key={msg.id}
                className="max-w-3xl mx-auto py-12 text-center border-y border-neutral-50 my-8"
              >
                <p className="text-[10px] uppercase tracking-[0.4em] text-neutral-400 mb-6 font-bold">
                  Primary Discussion Parameter
                </p>
                <h2 className="text-2xl font-light text-neutral-800 italic leading-snug">
                  "{msg.content}"
                </h2>
              </div>
            );
          }

          const isReply = !!msg.parentId;
          const parentMsg = isReply ? messageMap.get(msg.parentId!) : null;

          return (
            <div
              key={`${msg.id}-${msg.timestamp.getTime()}`}
              className={`max-w-3xl mx-auto group w-full transition-all ${isReply ? "pl-8 md:pl-12" : ""}`}
            >
              <div className="flex items-baseline justify-between mb-1.5">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-neutral-900">
                    {msg.agentName}
                  </h3>
                  {isReply && parentMsg && (
                    <div className="flex items-center gap-1.5 text-[9px] text-neutral-400 font-medium bg-neutral-50 px-2 py-0.5 rounded border border-neutral-100">
                      <span>↳</span>
                      <span className="truncate max-w-[120px]">
                        Replying to {parentMsg.agentName}
                      </span>
                    </div>
                  )}
                </div>
                <span className="mono text-[9px] text-neutral-300 group-hover:text-neutral-500 transition-colors">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
              </div>
              <div className="relative border-l-2 border-neutral-100 group-hover:border-neutral-200 pl-5 py-2 transition-colors">
                <p className="text-[15px] leading-relaxed text-neutral-700 font-normal">
                  {msg.content}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {!shouldAutoScroll && stableMessages.length > 0 && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20">
          <button
            onClick={() => setShouldAutoScroll(true)}
            className="px-4 py-2 bg-neutral-900 text-white text-[10px] font-bold uppercase tracking-widest shadow-2xl rounded-full flex items-center gap-2 hover:bg-neutral-800 transition-all border border-neutral-700"
          >
            <span>↓</span> Jump to Live
          </button>
        </div>
      )}

      <footer className="h-12 border-t border-neutral-300 flex items-center px-8 bg-neutral-50/50">
        <p className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold">
          {stableMessages.length > 0
            ? `Active Cognitive Stream: ${stableMessages.filter((m) => !m.isSystem).length} responses generated`
            : "Simulation Ready"}
        </p>
      </footer>
    </div>
  );
};

export default DiscussionPanel;
