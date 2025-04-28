import { useEffect, useRef } from "react";
import { useSpell } from "../lib/stores/useSpell";

// CodeMirror types and setup
declare global {
  interface Window {
    CodeMirror: any;
  }
}

export default function CodeEditor() {
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const cmRef = useRef<any>(null);
  const { spellCode, setSpellCode } = useSpell();
  
  // Initialize CodeMirror
  useEffect(() => {
    // Check if CodeMirror is available on window
    if (window.CodeMirror && editorRef.current && !cmRef.current) {
      // Load CodeMirror scripts from CDN
      const loadScript = (src: string) => {
        return new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = src;
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      };
      
      // Ensure scripts are loaded
      Promise.all([
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/codemirror.min.js'),
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/javascript/javascript.min.js')
      ]).then(() => {
        // Define AetherCast syntax mode
        window.CodeMirror.defineMode("aethercast", () => {
          return {
            token: function(stream: any) {
              if (stream.match(/focus:|anchor:|shift:|cost:|intent:|seal|bind/)) {
                return "keyword";
              }
              if (stream.match(/Energy|Probability|Entropy|Time|Self|Object|Zone/)) {
                return "def";
              }
              if (stream.match(/\d+%|\d+E/)) {
                return "number";
              }
              if (stream.match(/\+|-/)) {
                return "operator";
              }
              if (stream.match(/".*?"/)) {
                return "string";
              }
              if (stream.match(/\(.*?\)/)) {
                return "variable";
              }
              stream.next();
              return null;
            }
          };
        });
        
        // Initialize editor
        cmRef.current = window.CodeMirror.fromTextArea(editorRef.current, {
          mode: "aethercast",
          theme: "material-darker",
          lineNumbers: true,
          lineWrapping: true,
          autofocus: true
        });
        
        // Set initial value
        cmRef.current.setValue(spellCode);
        
        // Handle changes
        cmRef.current.on("change", (cm: any) => {
          setSpellCode(cm.getValue());
        });
      });
    }
  }, [setSpellCode, spellCode]);
  
  return (
    <div className="flex-1 min-h-[250px] border border-primary/30 rounded-lg shadow-inner overflow-hidden relative">
      <div className="absolute top-2 left-4 text-xs text-primary/70 opacity-60 font-mono">AetherCast v1.0.2</div>
      <textarea 
        ref={editorRef}
        className="w-full h-full hidden"
        defaultValue={spellCode}
      />
    </div>
  );
}
