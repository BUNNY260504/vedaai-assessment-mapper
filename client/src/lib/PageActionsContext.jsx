import { createContext, useCallback, useContext, useState } from "react";

const PageActionsContext = createContext(null);

export function PageActionsProvider({ children }) {
  const [headerAction, setHeaderAction] = useState(null);
  const [backGuard, setBackGuardState] = useState(null);
  const [hasNotification, setHasNotification] = useState(false);

  const setBackGuard = useCallback((fn) => setBackGuardState(() => fn), []);

  return (
    <PageActionsContext.Provider
      value={{
        headerAction,
        setHeaderAction,
        backGuard,
        setBackGuard,
        hasNotification,
        markNotified: () => setHasNotification(true),
        clearNotification: () => setHasNotification(false),
      }}
    >
      {children}
    </PageActionsContext.Provider>
  );
}

export function usePageActions() {
  return useContext(PageActionsContext);
}
