import { useState, useRef, useCallback } from 'react';
import { Copy, Check, Maximize2, Minimize2, RefreshCw } from 'lucide-react';

/**
 * Kod muharriri komponenti
 * Barcha panellar (Student, Teacher, Admin) uchun umumiy kod muharriri
 */
export default function SharedCodeEditor({
  value,
  onChange,
  language = 'javascript',
  readOnly = false,
  placeholder = "// Kodingizni shu yerga yozing...",
  minHeight = 200,
  maxHeight = '60vh',
  onSave,
  onRun,
  showSaveButton = true,
  showRunButton = false,
}) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [running, setRunning] = useState(false);
  const textareaRef = useRef(null);

  const lineCount = (value || '').split('\n').length;

  // Tab key support
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Tab' && !readOnly) {
      e.preventDefault();
      const ta = textareaRef.current;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newVal = value.substring(0, start) + '  ' + value.substring(end);
      onChange?.(newVal);
      // restore cursor
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      });
    }
  }, [value, onChange, readOnly]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = textareaRef.current;
      if (ta) {
        ta.select();
        document.execCommand('copy');
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [value]);

  const handleSave = useCallback(() => {
    onSave?.(value);
  }, [value, onSave]);

  const handleRun = useCallback(async () => {
    if (!onRun || running) return;
    setRunning(true);
    try {
      await onRun(value);
    } finally {
      setRunning(false);
    }
  }, [value, onRun, running]);

  const langColors = {
    javascript: '#f7df1e',
    python: '#3572A5',
    java: '#b07219',
    cpp: '#f34b7d',
    html: '#e34c26',
    css: '#563d7c',
  };
  const langColor = langColors[language] || '#427A43';

  const editorHeight = expanded ? '600px' : minHeight;

  return (
    <div style={{
      background: '#0d1117',
      border: '1px solid #30363d',
      borderRadius: '12px',
      overflow: 'hidden',
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
      maxHeight: maxHeight,
      transition: 'max-height 0.3s ease',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px',
        background: '#161b22',
        borderBottom: '1px solid #30363d',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Traffic lights */}
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{
              width: 12, height: 12, borderRadius: '50%',
              background: '#ff5f57'
            }} />
            <div style={{
              width: 12, height: 12, borderRadius: '50%',
              background: '#ffbd2e'
            }} />
            <div style={{
              width: 12, height: 12, borderRadius: '50%',
              background: '#28c840'
            }} />
          </div>
          <div style={{
            padding: '2px 10px',
            borderRadius: 4,
            background: `${langColor}20`,
            color: langColor,
            fontSize: 11,
            fontWeight: 600,
            fontFamily: 'monospace',
          }}>
            {language}
          </div>
          <span style={{ fontSize: 11, color: '#484f58' }}>
            {lineCount} qator
          </span>
        </div>

        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={handleCopy}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '5px 8px',
              borderRadius: 6,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              color: copied ? '#22c55e' : '#8b949e',
              transition: 'all 0.15s',
            }}
            title={copied ? 'Nusxalandi!' : 'Nusxalash'}
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            <span style={{ fontSize: 11 }}>{copied ? 'Nusxalandi!' : 'Nusxalash'}</span>
          </button>

          <button
            onClick={() => setExpanded(v => !v)}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '5px 8px',
              borderRadius: 6,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              color: '#8b949e',
              transition: 'all 0.15s',
            }}
            title={expanded ? 'Kichraytirish' : 'Kattalashtirish'}
          >
            {expanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            <span style={{ fontSize: 11 }}>{expanded ? 'Kichraytirish' : 'Kattalashtirish'}</span>
          </button>

          {showRunButton && (
            <button
              onClick={handleRun}
              disabled={running || readOnly}
              style={{
                background: running ? '#22c55e' : 'transparent',
                border: '1px solid #8b949e',
                padding: '5px 8px',
                borderRadius: 6,
                cursor: running ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                color: '#8b949e',
                transition: 'all 0.15s',
              }}
              title="Kodni ishga tushirish"
            >
              {running ? (
                <RefreshCw size={13} className="spin" />
              ) : (
                <span style={{ fontSize: 11 }}>▶ Ishga tushirish</span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ display: 'flex', position: 'relative' }}>
        {/* Line numbers */}
        <div style={{
          minWidth: '44px',
          padding: '14px 8px',
          background: '#0d1117',
          color: '#484f58',
          fontSize: 12,
          lineHeight: 1.7,
          textAlign: 'right',
          userSelect: 'none',
          borderRight: '1px solid #21262d',
          flexShrink: 0,
        }}>
          {Array.from({ length: Math.max(lineCount, 1) }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => onChange?.(e.target.value)}
          onKeyDown={!readOnly ? handleKeyDown : undefined}
          readOnly={readOnly}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          placeholder={placeholder}
          style={{
            flex: 1,
            padding: '14px 16px',
            background: '#0d1117',
            border: 'none',
            color: '#e6edf3',
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: 13,
            lineHeight: 1.7,
            resize: 'vertical',
            outline: 'none',
            caretColor: '#427A43',
            tabSize: 2,
            minHeight: editorHeight,
            maxHeight: '100%',
            width: '100%',
          }}
        />
      </div>

      {/* Action buttons */}
      {(showSaveButton || onRun) && (
        <div style={{
          padding: '10px 14px',
          background: '#161b22',
          borderTop: '1px solid #30363d',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 8,
        }}>
          {showSaveButton && (
            <button
              onClick={handleSave}
              disabled={readOnly}
              style={{
                padding: '8px 16px',
                borderRadius: 6,
                background: readOnly ? '#484f58' : '#427A43',
                color: '#ffffff',
                border: 'none',
                fontSize: 12,
                fontWeight: 600,
                cursor: readOnly ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.15s',
              }}
              title="Kodni saqlash"
            >
              💾 Kodni saqlash
            </button>
          )}
        </div>
      )}

      {/* Style for spinning animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}