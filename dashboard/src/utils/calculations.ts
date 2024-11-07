import { GameResult, TeamResult } from '../types/data';

export const calculatePackagePlaces = (packageResults: GameResult[]) => {
  // Group results by team
  const teamResults = packageResults.reduce((acc, result) => {
    if (!acc[result.team]) {
      acc[result.team] = {
        team: result.team,
        totalPoints: 0,
        rounds: Array(result.rounds.length).fill(0),
        gameResults: [],
      };
    }

    // Add points from each round
    result.rounds.forEach((score, index) => {
      acc[result.team].rounds[index] = (acc[result.team].rounds[index] || 0) + score;
    });

    acc[result.team].totalPoints += result.sum;
    acc[result.team].gameResults.push(result);

    return acc;
  }, {} as Record<string, TeamResult>);

  // Convert to array and sort
  const sortedTeams = Object.values(teamResults).sort((a, b) => {
    if (a.totalPoints !== b.totalPoints) {
      return b.totalPoints - a.totalPoints;
    }

    // Compare round totals from last to first
    for (let i = a.rounds.length - 1; i >= 0; i--) {
      if (a.rounds[i] !== b.rounds[i]) {
        return b.rounds[i] - a.rounds[i];
      }
    }

    return 0;
  });

  // Assign places (handling equal positions)
  let currentPlace = 1;
  let samePlaceCount = 0;

  return sortedTeams.map((team, index) => {
    if (index > 0) {
      const prev = sortedTeams[index - 1];
      if (
        prev.totalPoints === team.totalPoints &&
        prev.rounds.every((score: number, i: number) => score === team.rounds[i])
      ) {
        samePlaceCount++;
      } else {
        currentPlace += samePlaceCount + 1;
        samePlaceCount = 0;
      }
    }

    return {
      ...team,
      place: currentPlace,
    };
  });
};
