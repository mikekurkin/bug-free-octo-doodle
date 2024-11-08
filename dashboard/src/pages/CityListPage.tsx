import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useStorage } from '../contexts/StorageContext';
import { City } from '../types/data';

export const CityListPage = () => {
  const storage = useStorage();
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCities = async () => {
      try {
        setIsLoading(true);
        const data = await storage.getCities();
        setCities(data);
      } catch (err) {
        setError('Failed to load cities');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCities();
  }, [storage]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cities.map(city => (
          <Link
            key={city._id}
            to={`/${city.slug}`}
            className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{city.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{city.timezone}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};
