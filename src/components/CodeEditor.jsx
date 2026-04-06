import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useTheme } from '../contexts/ThemeContext';

/**
 * VS Code-like code editor component using Monaco Editor
 *
 * @param {Object} props
 * @param {string} props.code - Initial code content
 * @param {Function} props.onChange - Callback when code changes (code: string) => void
 * @param {string} props.language - Programming language (default: 'javascript')
 * @param {string} props.placeholder - Placeholder text when editor is empty
 * @param {number} props.height - Editor height in pixels (default: 400)
 * @param {boolean} props.readOnly - Whether editor is read-only
 */
export default function CodeEditor({
  code = '',
  onChange,
  language = 'javascript',
  placeholder = "// Kodni shu yerga yozing...",
  height = 400,
  readOnly = false,
}) {
  const { isDarkMode: isDark } = useTheme();
  const [editorCode, setEditorCode] = useState(code || placeholder);

  useEffect(() => {
    setEditorCode(code || placeholder);
  }, [code, placeholder]);

  const handleEditorChange = (value) => {
    setEditorCode(value);
    if (onChange) {
      onChange(value);
    }
  };

  // Language options mapping
  const languageOptions = {
    javascript: 'javascript',
    typescript: 'typescript',
    python: 'python',
    html: 'html',
    css: 'css',
    json: 'json',
    sql: 'sql',
    java: 'java',
    csharp: 'csharp',
    cpp: 'cpp',
  };

  const editorLanguage = languageOptions[language] || 'javascript';

  // Editor options for VS Code-like experience
  const editorOptions = {
    selectOnLineNumbers: true,
    roundedSelection: false,
    readOnly: readOnly,
    cursorStyle: 'line',
    automaticLayout: true,
    minimap: {
      enabled: true,
      renderCharacters: false,
    },
    fontSize: 14,
    fontFamily: "'Fira Code', 'JetBrains Mono', 'Consolas', monospace",
    lineNumbers: 'on',
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    folding: true,
    foldingHighlight: true,
    foldingStrategy: 'indentation',
    showFoldingControls: 'always',
    matchBrackets: 'always',
    autoClosingBrackets: 'always',
    autoClosingQuotes: 'always',
    formatOnPaste: true,
    formatOnType: true,
    tabSize: 2,
    insertSpaces: true,
    detectIndentation: true,
    trimAutoWhitespace: true,
    suggestOnTriggerCharacters: true,
    quickSuggestions: {
      other: true,
      comments: false,
      strings: false,
    },
    parameterHints: {
      enabled: true,
    },
    wordBasedSuggestions: 'allDocuments',
    scrollbar: {
      vertical: 'visible',
      horizontal: 'visible',
      useShadows: false,
      verticalScrollbarSize: 10,
      horizontalScrollbarSize: 10,
    },
    padding: {
      top: 16,
      bottom: 16,
    },
  };

  return (
    <div className="code-editor-wrapper">
      <style>{`
        .code-editor-wrapper {
          border-radius: 12px;
          overflow: hidden;
          border: 2px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
          box-shadow: ${isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.1)'};
        }

        .code-editor-wrapper .monaco-editor {
          border-radius: 10px;
        }

        .code-editor-wrapper .monaco-editor .margin {
          background-color: ${isDark ? '#1e1e1e' : '#f5f5f5'};
        }

        .code-editor-wrapper .monaco-editor .minimap {
          opacity: ${isDark ? '0.6' : '0.4'};
        }

        .code-editor-wrapper .monaco-editor .cursor {
          border-left-color: ${isDark ? '#569cd6' : '#0066cc'} !important;
        }

        .code-editor-wrapper .monaco-editor .current-line {
          border: 2px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
          background-color: ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'};
        }

        @media (max-width: 768px) {
          .code-editor-wrapper .monaco-editor {
            font-size: 12px;
          }

          .code-editor-wrapper .minimap {
            display: none !important;
          }
        }
      `}</style>

      <Editor
        height={`${height}px`}
        language={editorLanguage}
        value={editorCode}
        theme={isDark ? 'vs-dark' : 'vs'}
        options={editorOptions}
        onChange={handleEditorChange}
        loading={
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: `${height}px`,
            backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
            color: isDark ? '#888' : '#666',
            fontSize: '14px',
          }}>
            Kod editör yuklanmoqda...
          </div>
        }
      />
    </div>
  );
}

/**
 * Language selector component for CodeEditor
 */
export function LanguageSelector({ language, onChange, languages = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
] }) {
  return (
    <select
      value={language}
      onChange={(e) => onChange(e.target.value)}
      style={{
        padding: '8px 12px',
        borderRadius: '8px',
        border: '1px solid rgba(0,0,0,0.1)',
        backgroundColor: '#fff',
        color: '#333',
        fontSize: '14px',
        cursor: 'pointer',
      }}
    >
      {languages.map((lang) => (
        <option key={lang.value} value={lang.value}>
          {lang.label}
        </option>
      ))}
    </select>
  );
}
