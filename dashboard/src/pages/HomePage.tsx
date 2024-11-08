import { useCallback, useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { GamesTable } from "../components/GamesTable";
import { useStorage } from "../contexts/StorageContext";
import { City, Game, QueryParams } from "../types/data";

export const HomePage = () => {
  const storage = useStorage();
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const { citySlug } = useParams();
  const { t } = useTranslation();

  const [city, setCity] = useState<City | null>(null);

  useEffect(() => {
    const loadCity = async () => {
      const cityData = await storage.getCityBySlug(citySlug ?? 'spb');
      setCity(cityData);
    };
    loadCity();
  }, [citySlug, storage]);

  const loadGames = useCallback(async (params: QueryParams, isInitial = false) => {
    if (!city) return;

    setIsLoading(true);
    try {
      const response = await storage.getGames({
        ...params,
        cityId: city._id
      }, { withSeries: true });
      setGames(prev => isInitial ? response.data : [...prev, ...response.data]);
      setHasMore(response.hasMore);
      return response.nextCursor;
    } catch (error) {
      console.error(t('home.error'), error);
    } finally {
      setIsLoading(false);
    }
  }, [city, storage, t]);

  useEffect(() => {
    loadGames({ sort: 'date', order: 'desc' }, true);
  }, [loadGames]);

  if (!city) {
    return <div className="max-w-7xl mx-auto px-4 py-8">{t('errors.cityNotFound')}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <GamesTable
        games={games}
        isLoading={isLoading}
        hasMore={hasMore}
        onQueryChange={loadGames}
      />
    </div>
  );
};
