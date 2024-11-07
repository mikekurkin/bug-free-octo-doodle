import { ExternalLink } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from 'react-i18next';
import { Link, useParams } from "react-router-dom";
import { GameCard } from "../components/GameCard";
import { RoundPerformanceChart } from "../components/RoundPerformanceChart";
import { cities, gameResults, games, series, teams } from "../data/mockData";
import { Game, GameResult } from "../types/data";

export const PackageDetailsPage = () => {
  const { citySlug, seriesSlug, number } = useParams();
  const city = cities.find(c => c.slug === citySlug);
  const seriesObj = series.find(s => s.slug === seriesSlug);

  const [packageGames, setPackageGames] = useState<Game[]>([]);
  const [packageResults, setPackageResults] = useState<GameResult[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    if (city && seriesObj && number) {
      const filteredGames = games.filter(game =>
        game.city_id === city._id &&
        game.series_id === seriesObj._id &&
        game.number === number
      );
      setPackageGames(filteredGames);

      const filteredResults = gameResults.filter(result =>
        filteredGames.some(game => game._id === result.game_id)
      );
      setPackageResults(filteredResults);
    }
  }, [city, seriesObj, number]);

  const teamStandings = useMemo(() => {
    const standings = new Map<string, {
      team_id: string,
      team_name: string,
      totalPoints: number,
      rounds: number[],
      gameResults: GameResult[]
    }>();

    packageResults.forEach(result => {
      const team = teams.find(t => t._id === result.team_id);
      if (!team) return;

      const existing = standings.get(team._id) || {
        team_id: team._id,
        team_name: team.name,
        totalPoints: 0,
        rounds: [],
        gameResults: []
      };

      existing.totalPoints += result.sum;
      existing.rounds.push(...result.rounds);
      existing.gameResults.push(result);
      standings.set(team._id, existing);
    });

    return Array.from(standings.values())
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((standing, index) => ({
        ...standing,
        place: index + 1
      }));
  }, [packageResults]);

  const roundCount = packageResults[0]?.rounds.length || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Games Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          {t('sections.gamesInPackage')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packageGames.map(game => (
            <GameCard
              key={game.id}
              game={game}
              results={packageResults.filter(r => r.game_id === game.id)}
            />
          ))}
        </div>
      </div>

      {/* Chart Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          {t('sections.roundPerformance')}
        </h3>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <RoundPerformanceChart results={packageResults} />
        </div>
      </div>


      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <h3 className="text-lg font-semibold p-6 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
          Package Results
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Place
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  In Game
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Team
                </th>
                {Array.from({ length: roundCount }, (_, i) => (
                  <th key={i} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    R{i + 1}
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {teamStandings.map((team) => (
                <tr key={team.team_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                    #{team.place}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex gap-4">
                      {team.gameResults.map((result: GameResult) => (
                        <div key={result.game_id} className="flex items-center gap-1">
                          <span>#{result.place}</span>
                          <Link
                            to={`/${citySlug}/games/${result.game_id}`}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                            title="Go to game"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    <Link
                      to={`/${citySlug}/teams/${team.slug}`}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      {team.team_name}
                    </Link>
                  </td>
                  {team.rounds.map((score: number, i: number) => (
                    <td key={i} className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {score}
                    </td>
                  ))}
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {team.totalPoints}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
