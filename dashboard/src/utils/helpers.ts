import { series } from "../data/mockData";

export const slugifySeries = (seriesId: string): string => {
  const seriesObj = series.find(s => s._id === seriesId);
  return seriesObj?.slug || '';
};

export const deslugifySeries = (slug: string) => {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
