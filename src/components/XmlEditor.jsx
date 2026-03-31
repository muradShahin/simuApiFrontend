import { useRef, useEffect } from 'react';

/**
 * Minimal XML editor with line numbers and syntax-highlighted preview.
 * Uses a plain <textarea> for editing and a styled <pre> for display.
 */
export default function XmlEditor({ value, onChange, rows = 12, readOnly = false, placeholder = '' }) {
  const textareaRef = useRef(null);
  const lineRef = useRef(null);

  const lines = (value || '').split('\n');
  const lineCount = Math.max(lines.length, 1);

  useEffect(() => {
    // Sync scroll between textarea and line numbers
    const ta = textareaRef.current;
    const ln = lineRef.current;
    if (!ta || !ln) return;
    const syncScroll = () => { ln.scrollTop = ta.scrollTop; };
    ta.addEventListener('scroll', syncScroll);
    return () => ta.removeEventListener('scroll', syncScroll);
  }, []);

  return (
    <div className="xml-editor">
      <div className="xml-editor-lines" ref={lineRef}>
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i} className="xml-editor-line-num">{i + 1}</div>
        ))}
      </div>
      <textarea
        ref={textareaRef}
        className="xml-editor-textarea"
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        rows={rows}
        readOnly={readOnly}
        placeholder={placeholder}
        spellCheck={false}
      />
    </div>
  );
}
