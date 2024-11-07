export const calculateEfficiency = (teamScore: number, maxScore: number): number => {
  return maxScore > 0 ? (teamScore / maxScore) * 100 : 0;
};

// Gaussian kernel function
const gaussianKernel = (x: number, mean: number, bandwidth: number): number => {
  const z = (x - mean) / bandwidth;
  return Math.exp(-(z * z) / 2) / (bandwidth * Math.sqrt(2 * Math.PI));
};

// Calculate KDE for a set of points
export const calculateKDE = (
  data: number[],
  bandwidth: number,
  points: number = 100
): { x: number[]; y: number[] } => {
  if (data.length === 0) return { x: [], y: [] };

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;

  // Generate evaluation points
  const x = Array.from({ length: points }, (_, i) =>
    min - range * 0.1 + (range * 1.2 * i) / (points - 1)
  );

  // Calculate density at each point
  const y = x.map(point =>
    data.reduce((sum, dataPoint) =>
      sum + gaussianKernel(point, dataPoint, bandwidth), 0
    ) / data.length
  );

  return { x, y };
};

// Automatically estimate bandwidth using Silverman's rule of thumb
export const estimateBandwidth = (data: number[]): number => {
  const n = data.length;
  const std = Math.sqrt(
    data.reduce((sum, x) => sum + x * x, 0) / n -
    Math.pow(data.reduce((sum, x) => sum + x, 0) / n, 2)
  );
  return 0.9 * std * Math.pow(n, -0.2);
};
