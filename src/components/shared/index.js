/**
 * Umumiy komponentlar - Barcha panellar uchun qayta ishlatiladigan
 */

// Import komponentlarni
import SharedStudentCard from '../SharedStudentCard';
import SharedStatsCard from '../SharedStatsCard';

// Named exports
export { SharedStudentCard, SharedStatsCard };

// Re-export with different names
export { SharedStudentCard as StudentCardComponent };
export { SharedStatsCard as StatsCardComponent };