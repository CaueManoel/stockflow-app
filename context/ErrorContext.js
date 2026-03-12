import React, { createContext, useContext, useState } from "react";

const ErrorContext = createContext({});

export function ErrorProvider({ children }) {
  const [error, setError] = useState(null);

  function showError(message) {
    setError(message);
  }

  function hideError() {
    setError(null);
  }

  return (
    <ErrorContext.Provider value={{ error, showError, hideError }}>
      {children}
    </ErrorContext.Provider>
  );
}

export function useError() {
  return useContext(ErrorContext);
}