import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { Header } from './components/Header';
import { StorageProvider } from './contexts/StorageContext';
import { ThemeProvider } from './contexts/ThemeProvider';
import { CityListPage } from './pages/CityListPage';
import { GameDetailsPage } from './pages/GameDetailsPage';
import { HomePage } from './pages/HomePage';
import { PackageDetailsPage } from './pages/PackageDetailsPage';
import { TeamDetailsPage } from './pages/TeamDetailsPage';
import { TeamStatsPage } from './pages/TeamStatsPage';

function App() {
  return (
    <ThemeProvider>
      <StorageProvider mock={process.env.NODE_ENV === 'development'}>
        <Router>
          <div className="min-h-screen bg-[var(--bg-primary)]">
            <Routes>
              <Route path="/" element={<>
                <Header title="Select City" />
                <div className="pt-16">
                  <CityListPage />
                </div>
              </>} />

              <Route path="/:citySlug" element={<>
                <Header title="Games List" />
                <div className="pt-16">
                  <HomePage />
                </div>
              </>} />

              <Route path="/:citySlug/teams" element={<>
                <Header title="Team Statistics" />
                <div className="pt-16">
                  <TeamStatsPage />
                </div>
              </>} />

              <Route path="/:citySlug/teams/:teamSlug" element={<>
                <Header title="Team Performance" />
                <div className="pt-16">
                  <TeamDetailsPage />
                </div>
              </>} />

              <Route path="/:citySlug/game/:id" element={<>
                <Header title="Game Results" />
                <div className="pt-16">
                  <GameDetailsPage />
                </div>
              </>} />

              <Route path="/:citySlug/package/:seriesSlug/:number" element={<>
                <Header title="Package Results" />
                <div className="pt-16">
                  <PackageDetailsPage />
                </div>
              </>} />
            </Routes>
          </div>
        </Router>
      </StorageProvider>
    </ThemeProvider>
  );
}

export default App;
