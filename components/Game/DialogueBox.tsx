'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/store/gameStore';
import { X, User } from 'lucide-react';

export default function DialogueBox() {
  const { activeDialogue, setActiveDialogue } = useGameStore();
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0);

  if (!activeDialogue) return null;

  const currentDialogue = activeDialogue.dialogues[currentDialogueIndex];
  
  const handleNext = () => {
    if (currentDialogueIndex < activeDialogue.dialogues.length - 1) {
      setCurrentDialogueIndex(currentDialogueIndex + 1);
    } else {
      handleClose();
    }
  };

  const handleChoice = (choice: string) => {
    console.log('Player chose:', choice);
    // TODO: Handle dialogue choices and branching
    handleNext();
  };

  const handleClose = () => {
    setActiveDialogue(null);
    setCurrentDialogueIndex(0);
  };

  return (
    <div className="absolute inset-0 flex items-end justify-center z-50 pointer-events-none">
      <div className="bg-slate-800/95 backdrop-blur-sm rounded-t-lg shadow-2xl w-full max-w-2xl mb-0 pointer-events-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              {activeDialogue.npc.name}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Dialogue Content */}
        <div className="p-6">
          <div className="text-white leading-relaxed mb-4">
            {currentDialogue.text}
          </div>

          {/* Choices */}
          {currentDialogue.choices ? (
            <div className="space-y-2">
              {currentDialogue.choices.map((choice: string, index: number) => (
                <button
                  key={index}
                  onClick={() => handleChoice(choice)}
                  className="block w-full text-left p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-white"
                >
                  {choice}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex justify-end">
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                {currentDialogueIndex < activeDialogue.dialogues.length - 1 ? 'Continue' : 'End'}
              </button>
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="px-6 pb-4">
          <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 transition-all duration-300"
              style={{ 
                width: `${((currentDialogueIndex + 1) / activeDialogue.dialogues.length) * 100}%` 
              }}
            />
          </div>
          <div className="text-xs text-gray-400 mt-2 text-center">
            {currentDialogueIndex + 1} / {activeDialogue.dialogues.length}
          </div>
        </div>
      </div>
    </div>
  );
}