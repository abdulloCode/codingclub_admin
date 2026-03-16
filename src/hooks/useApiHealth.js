import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://blog-mrabdunozir-uz.onrender.com';

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
        const response = await fetch(`${API_BASE_URL}/api/health`, {
          method: 'GET',
          signal: controller.signal,
          mode: 'cors',
        });

        clearTimeout(timeoutId);

        const isServerUp = response.ok || response.status < 500;
        setIsHealthy(isServerUp);
        setLastChecked(new Date());

        return isServerUp;
      } catch (error) {
        clearTimeout(timeoutId);

        // If health endpoint doesn't exist, try a simple API call
        if (error.name === 'AbortError') {
          try {
            await apiService.getProfile(); // Try a lightweight call
            setIsHealthy(true);
            setLastChecked(new Date());
            return true;
          } catch {
            setIsHealthy(false);
            setLastChecked(new Date());
            return false;
          }
        } else {
          setIsHealthy(false);
          setLastChecked(new Date());
          return false;
        }
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
