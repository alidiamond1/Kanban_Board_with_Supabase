import React from 'react';
import { KanbanBoard } from './components/KanbanBoard';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <KanbanBoard />
      <Toaster position="bottom-right" />
    </div>
  );
}

export default App;