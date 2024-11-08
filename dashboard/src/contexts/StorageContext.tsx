import React, { createContext, useContext } from 'react';
import { CsvStorage } from '../storage/csv';
import { Storage } from '../storage/interface';
import { MockStorage } from '../storage/mock';

export const StorageContext = createContext<Storage | undefined>(undefined);

export const useStorage = () => {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error('useStorage must be used within a StorageProvider');
  }
  return context;
};

interface StorageProviderProps {
  children: React.ReactNode;
  mock?: boolean;
}

export const StorageProvider: React.FC<StorageProviderProps> = ({ children, mock = false }) => {
  const storage = mock ? new MockStorage() : new CsvStorage();

  return (
    <StorageContext.Provider value={storage}>
      {children}
    </StorageContext.Provider>
  );
};
