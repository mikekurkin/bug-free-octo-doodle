import { Link } from 'react-router-dom';
import { cities } from '../data/mockData';

export const CityListPage = () => {

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cities.map(city => (
          <Link
            key={city._id}
            to={`/${city.slug}`}
            className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold">{city.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{city.timezone}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};
