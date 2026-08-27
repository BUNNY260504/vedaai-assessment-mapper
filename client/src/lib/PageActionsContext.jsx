import { createContext, useCallback, useContext, useState } from "react";

const PageActionsContext = createContext(null);

export function PageActionsProvider({ children }) {
  const [headerAction, setHeaderAction] = useState(null);
  const [backGuard, setBackGuardState] = useState(null);
  const [hasNotification, setHasNotification] = useState(false);

  // backGuard is itself a function, so it must be set via the functional
  // updater form — otherwise React would try to call it as one.
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
