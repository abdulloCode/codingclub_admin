/**
 * Umumiy komponentlar - Barcha panellar uchun qayta ishlatiladigan
 */

// Import komponentlarni
import SharedCodeEditor from '../SharedCodeEditor';
import SharedHomework from '../SharedHomework';
import SharedStudentCard from '../SharedStudentCard';
import SharedStatsCard from '../SharedStatsCard';

// Named exports
export { SharedCodeEditor, SharedHomework, SharedStudentCard, SharedStatsCard };

// Re-export with different names
export { SharedCodeEditor as CodeEditorComponent };
export { SharedHomework as HomeworkComponent };
export { SharedStudentCard as StudentCardComponent };
export { SharedStatsCard as StatsCardComponent };