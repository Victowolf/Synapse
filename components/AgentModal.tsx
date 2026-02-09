
import React, { useState, useEffect } from 'react';
import { Agent } from '../types';

interface AgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (agent: Partial<Agent>) => void;
  editingAgent?: Agent | null;
}

const AgentModal: React.FC<AgentModalProps> = ({ isOpen, onClose, onSave, editingAgent }) => {
  const [name, setName] = useState('');
  const [behavior, setBehavior] = useState('');

  useEffect(() => {
    if (editingAgent) {
      setName(editingAgent.name);
      setBehavior(editingAgent.behavior);
    } else {
      setName('');
      setBehavior('');
    }
  }, [editingAgent, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md p-8 border border-neutral-200 shadow-2xl">
        <h2 className="text-xl font-medium mb-6 uppercase tracking-wider text-neutral-600">
          {editingAgent ? 'Configure Agent' : 'Create Agent Subject'}
        </h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-2">Subject Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 p-3 outline-none focus:border-neutral-400 transition-colors"
              placeholder="e.g. Subject-04 / Dr. Aris"
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-2">Behavioral Profile</label>
            <textarea
              value={behavior}
              onChange={(e) => setBehavior(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 p-3 h-40 outline-none focus:border-neutral-400 transition-colors resize-none text-sm leading-relaxed"
              placeholder="Define behavioral constraints, biases, personality traits, and objectives..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-neutral-100">
          <button
            onClick={onClose}
            className="px-6 py-2 text-xs font-medium uppercase tracking-widest text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            Abort
          </button>
          <button
            onClick={() => {
              if (name && behavior) {
                onSave({ name, behavior });
                onClose();
              }
            }}
            className="px-6 py-2 bg-neutral-900 text-white text-xs font-medium uppercase tracking-widest hover:bg-neutral-800 transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentModal;
