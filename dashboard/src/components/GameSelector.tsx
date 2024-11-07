import React from 'react';
import { Game } from '../types/data';

interface GameSelectorProps {
  games: Game[];
  selectedGame: string;
  onGameSelect: (gameId: string) => void;
}

export const GameSelector: React.FC<GameSelectorProps> = ({ games, selectedGame, onGameSelect }) => {
  return (
    <div className="flex items-center space-x-4">
      <label className="text-sm font-medium text-gray-700">Select Game:</label>
      <select
        className="bg-white border border-gray-300 rounded-md px-3 py-1.5 text-sm"
        value={selectedGame}
        onChange={(e) => onGameSelect(e.target.value)}
      >
        {games.map((game) => (
          <option key={game.id} value={game.id}>
            {game.tag} - {game.series} ({game.date})
          </option>
        ))}
      </select>
    </div>
  );
}