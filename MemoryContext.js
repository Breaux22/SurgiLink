import React, { createContext, useState, useContext } from 'react';

const MemoryContext = createContext(null);

export const MemoryProvider = ({ children }) => {
  const [myMemory, setMyMemory] = useState({});
  return (
    <MemoryContext.Provider value={{ myMemory, setMyMemory }}>
      {children}
    </MemoryContext.Provider>
  );
};

export const useMemory = () => {
  const context = useContext(MemoryContext);
  if (!context) {
    throw new Error('useMemory must be used within a MemoryProvider');
  }
  return context;
};