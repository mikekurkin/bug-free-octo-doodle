import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { cities } from '../data/mockData';

export const CityGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { citySlug } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const city = cities.find(c => c.slug === citySlug);
    if (!city) {
      navigate('/');
    }
  }, [citySlug, navigate]);

  return <>{children}</>;
}; 
