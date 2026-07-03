import React, { createContext, useState, useContext } from 'react';

const NavigationContext = createContext({});

export function NavigationProvider({ children }) {
  const [authScreen, setAuthScreen] = useState('login'); // 'login' | 'register'
  const [riderScreen, setRiderScreen] = useState('home'); // 'home' | 'active_ride' | 'history'

  return (
    <NavigationContext.Provider value={{
      authScreen,
      setAuthScreen,
      riderScreen,
      setRiderScreen
    }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  return useContext(NavigationContext);
}
