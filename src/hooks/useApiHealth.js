import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

export function useApiHealth() {
  const [isHealthy, setIsHealthy] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkHealth = useCallback(async () => {
    setIsChecking(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      try {
        await apiService.getProfile(); // Try a lightweight call
        clearTimeout(timeoutId);
        setIsHealthy(true);
        setLastChecked(new Date());
        return true;
      } catch (error) {
        clearTimeout(timeoutId);
        setIsHealthy(false);
        setLastChecked(new Date());
        return false;
      }
    } catch (error) {
      setIsHealthy(false);
      setLastChecked(new Date());
      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Check health on mount and periodically
  useEffect(() => {
    checkHealth();

    // Check health every 2 minutes
    const interval = setInterval(checkHealth, 120000);

    return () => clearInterval(interval);
  }, [checkHealth]);

  return {
    isHealthy,
    isChecking,
    lastChecked,
    checkHealth,
    isServerDown: isHealthy === false,
  };
}

export default useApiHealth;
