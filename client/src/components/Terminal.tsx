import { useEffect, useRef, useState, KeyboardEvent } from "react";
import { SpellParser, ParsedSpell } from "../lib/SpellParser";
import { useSimulation } from "../lib/stores/useSimulation";
import { useAudio } from "../lib/stores/useAudio";
import RippleEffect from "./RippleEffect";

interface SuggestedCommand {
  id: string;
  label: string;
  description: string;
  insertText: string;
  category: 'spell' | 'control' | 'manipulation';
  hasParameters?: boolean;
  parameters?: {
    name: string;
    placeholder: string;
    type: 'text' | 'number' | 'select';
    options?: string[];
  }[];
}

export default function Terminal() {
  const { 
    simulationState, 
    energy, 
    spendEnergy, 
    applySpellEffect, 
    calculateCost, 
    triggerFeedback,
    setSimulationState 
  } = useSimulation();
  const { playHit, playSuccess } = useAudio();
  
  const [inputValue, setInputValue] = useState("");
  const [multiLineMode, setMultiLineMode] = useState(false);
  const [spellLines, setSpellLines] = useState<string[]>([]);
  const [history, setHistory] = useState<Array<{type: 'input' | 'response', content: string, success?: boolean}>>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentSpell, setCurrentSpell] = useState<Partial<ParsedSpell>>({});
  const [showCaret, setShowCaret] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCommand, setSelectedCommand] = useState<SuggestedCommand | null>(null);
  const [commandParams, setCommandParams] = useState<Record<string, string>>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  
  // Suggested commands for the UI
  const suggestedCommands: SuggestedCommand[] = [
    // Spell component commands
    {
      id: 'focus',
      label: 'focus:',
      description: 'Set the focus of your spell',
      insertText: 'focus: ',
      category: 'spell',
      hasParameters: true,
      parameters: [
        {
          name: 'force',
          placeholder: 'Force type',
          type: 'select',
          options: ['Energy', 'Probability', 'Entropy', 'Time']
        }
      ]
    },
    {
      id: 'anchor',
      label: 'anchor:',
      description: 'Set the anchor point of your spell',
      insertText: 'anchor: ',
      category: 'spell',
      hasParameters: true,
      parameters: [
        {
          name: 'type',
          placeholder: 'Anchor type',
          type: 'select',
          options: ['Self', 'Object', 'Zone']
        },
        {
          name: 'radius',
          placeholder: 'Radius (for Zone)',
          type: 'number'
        }
      ]
    },
    {
      id: 'shift',
      label: 'shift:',
      description: 'Set the shift amount of your spell',
      insertText: 'shift: ',
      category: 'spell',
      hasParameters: true,
      parameters: [
        {
          name: 'direction',
          placeholder: 'Direction',
          type: 'select',
          options: ['+', '-']
        },
        {
          name: 'amount',
          placeholder: 'Amount (%)',
          type: 'number'
        }
      ]
    },
    {
      id: 'intent',
      label: 'intent:',
      description: 'Set the intention of your spell',
      insertText: 'intent: "',
      category: 'spell',
      hasParameters: true,
      parameters: [
        {
          name: 'text',
          placeholder: 'Your intention',
          type: 'text'
        }
      ]
    },
    {
      id: 'seal',
      label: 'seal',
      description: 'Cast the current spell',
      insertText: 'seal',
      category: 'spell'
    },
    
    // Control commands
    {
      id: 'help',
      label: 'help',
      description: 'Show available commands',
      insertText: 'help',
      category: 'control'
    },
    {
      id: 'clear',
      label: 'clear',
      description: 'Clear terminal history',
      insertText: 'clear',
      category: 'control'
    },
    {
      id: 'scry',
      label: 'scry',
      description: 'View current reality parameters',
      insertText: 'scry',
      category: 'control'
    },
    
    // Direct manipulation commands
    {
      id: 'energy_set',
      label: 'energy set',
      description: 'Set energy level',
      insertText: 'energy set ',
      category: 'manipulation',
      hasParameters: true,
      parameters: [
        {
          name: 'level',
          placeholder: 'Level (0-100)',
          type: 'number'
        }
      ]
    },
    {
      id: 'probability_set',
      label: 'probability set',
      description: 'Set probability shift',
      insertText: 'probability set ',
      category: 'manipulation',
      hasParameters: true,
      parameters: [
        {
          name: 'level',
          placeholder: 'Level (0-100)',
          type: 'number'
        }
      ]
    },
    {
      id: 'entropy_set',
      label: 'entropy set',
      description: 'Set entropy level',
      insertText: 'entropy set ',
      category: 'manipulation',
      hasParameters: true,
      parameters: [
        {
          name: 'level',
          placeholder: 'Level (0-100)',
          type: 'number'
        }
      ]
    },
    {
      id: 'time_set',
      label: 'time set',
      description: 'Set time speed',
      insertText: 'time set ',
      category: 'manipulation',
      hasParameters: true,
      parameters: [
        {
          name: 'speed',
          placeholder: 'Speed (0.1-2.0)',
          type: 'number'
        }
      ]
    }
  ];
  
  // Auto-scroll to bottom on new entries
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);
  
  // Blinking caret effect
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCaret(prev => !prev);
    }, 500);
    
    return () => clearInterval(interval);
  }, []);
  
  // Handle reality parameter monitoring effect
  const [monitorPulse, setMonitorPulse] = useState<string | null>(null);
  useEffect(() => {
    if (monitorPulse) {
      const timeout = setTimeout(() => {
        setMonitorPulse(null);
      }, 2000);
      
      return () => clearTimeout(timeout);
    }
  }, [monitorPulse]);
  
  // Background grid effect for terminal
  const [gridEffect, setGridEffect] = useState(false);
  
  useEffect(() => {
    // Add ripple effect on typing
    if (inputValue) {
      setGridEffect(true);
      const timeout = setTimeout(() => {
        setGridEffect(false);
      }, 300);
      
      return () => clearTimeout(timeout);
    }
  }, [inputValue]);
  
  // For ripple effects
  const [ripples, setRipples] = useState<{id: number, x: number, y: number, color: string}[]>([]);
  const rippleIdRef = useRef(0);
  const terminalContainerRef = useRef<HTMLDivElement>(null);
  
  // Add a ripple at the given position
  const addRipple = (x: number, y: number, color: string = 'rgba(124, 58, 237, 0.5)') => {
    const id = rippleIdRef.current++;
    setRipples(prev => [...prev, { id, x, y, color }]);
    
    // Remove ripple after animation completes
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 1000);
  };
  
  // Toggle suggestion panel
  const toggleSuggestions = () => {
    setShowSuggestions(prev => !prev);
    if (selectedCommand) {
      setSelectedCommand(null);
      setCommandParams({});
    }
  };
  
  // Handle selecting a command from suggestions
  const handleSelectCommand = (command: SuggestedCommand) => {
    setSelectedCommand(command);
    setCommandParams({});
    
    // If the command has no parameters, insert it directly
    if (!command.hasParameters) {
      setInputValue(command.insertText);
      setShowSuggestions(false);
      inputRef.current?.focus();
    }
    // Create a ripple effect when selecting a command
    if (terminalContainerRef.current) {
      const rect = terminalContainerRef.current.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      addRipple(centerX, centerY, 'rgba(124, 58, 237, 0.3)');
    }
  };
  
  // Handle parameter change for the selected command
  const handleParamChange = (paramName: string, value: string) => {
    setCommandParams(prev => ({
      ...prev,
      [paramName]: value
    }));
  };
  
  // Build the final command with parameters and insert it
  const insertCommandWithParams = () => {
    if (!selectedCommand) return;
    
    let finalCommand = selectedCommand.insertText;
    
    if (selectedCommand.hasParameters && selectedCommand.parameters) {
      // Handle different command types
      switch (selectedCommand.id) {
        case 'focus':
          finalCommand += commandParams.force || '';
          break;
        case 'anchor':
          finalCommand += commandParams.type || '';
          if (commandParams.type === 'Zone' && commandParams.radius) {
            finalCommand += `(radius:${commandParams.radius})`;
          }
          break;
        case 'shift':
          finalCommand += `${commandParams.direction || '+'}${commandParams.amount || '0'}%`;
          break;
        case 'intent':
          finalCommand += `${commandParams.text || ''}"`;
          break;
        case 'energy_set':
        case 'probability_set':
        case 'entropy_set':
          finalCommand += commandParams.level || '50';
          break;
        case 'time_set':
          finalCommand += commandParams.speed || '1.0';
          break;
      }
    }
    
    setInputValue(finalCommand);
    setSelectedCommand(null);
    setCommandParams({});
    setShowSuggestions(false);
    inputRef.current?.focus();
    
    // Add ripple effect on command insert
    if (terminalContainerRef.current) {
      const rect = terminalContainerRef.current.getBoundingClientRect();
      addRipple(rect.width / 2, rect.height / 2, 'rgba(124, 58, 237, 0.5)');
    }
  };
  
  // Toggle between single-line and multi-line modes
  const toggleInputMode = () => {
    setMultiLineMode(prev => !prev);
    if (multiLineMode) {
      // Switching from multi-line to single-line
      setSpellLines([]);
      setInputValue("");
    } else {
      // Switching from single-line to multi-line
      setInputValue("");
    }
    
    // Add a ripple effect when toggling
    if (terminalContainerRef.current) {
      const rect = terminalContainerRef.current.getBoundingClientRect();
      addRipple(rect.width / 2, rect.height / 2, 'rgba(239, 68, 68, 0.3)');
    }
    
    // Focus the appropriate input element
    setTimeout(() => {
      if (multiLineMode) {
        inputRef.current?.focus();
      } else {
        textareaRef.current?.focus();
      }
    }, 100);
  };
  
  // Handle single-line input submission and history navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      if (!inputValue.trim()) return;
      
      // Add input to history
      setHistory(prev => [...prev, { type: 'input', content: inputValue }]);
      
      // Add to command history for arrow key navigation
      setCommandHistory(prev => [inputValue, ...prev]);
      setHistoryIndex(-1);
      
      // Process the command
      processCommand(inputValue);
      
      // Create ripple effect
      if (terminalContainerRef.current) {
        const rect = terminalContainerRef.current.getBoundingClientRect();
        // Center the ripple
        addRipple(rect.width / 2, rect.height / 2);
      }
      
      // Reset input field
      setInputValue("");
      
      // Play sound effect
      playHit();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      
      // Navigate up through command history
      if (commandHistory.length > 0) {
        const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
        setHistoryIndex(newIndex);
        setInputValue(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      
      // Navigate down through command history
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInputValue(commandHistory[newIndex]);
      } else if (historyIndex === 0) {
        // When we reach the bottom of the history, clear the input
        setHistoryIndex(-1);
        setInputValue('');
      }
    }
  };
  
  // Handle multi-line input updates
  const handleMultiLineChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setSpellLines(value.split('\n'));
  };
  
  // Handle keyboard events in multi-line mode
  const handleMultiLineKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Arrow Up with Ctrl key for history navigation
    if (e.key === 'ArrowUp' && e.ctrlKey) {
      e.preventDefault();
      
      // Navigate up through command history
      if (commandHistory.length > 0) {
        const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
        setHistoryIndex(newIndex);
        const previousCommand = commandHistory[newIndex];
        setSpellLines(previousCommand.split('\n'));
        
        // Update the textarea value
        if (textareaRef.current) {
          textareaRef.current.value = previousCommand;
        }
      }
    } 
    // Arrow Down with Ctrl key for history navigation
    else if (e.key === 'ArrowDown' && e.ctrlKey) {
      e.preventDefault();
      
      // Navigate down through command history
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        const previousCommand = commandHistory[newIndex];
        setSpellLines(previousCommand.split('\n'));
        
        // Update the textarea value
        if (textareaRef.current) {
          textareaRef.current.value = previousCommand;
        }
      } else if (historyIndex === 0) {
        // When we reach the bottom of the history, clear the input
        setHistoryIndex(-1);
        setSpellLines([]);
        
        // Clear the textarea
        if (textareaRef.current) {
          textareaRef.current.value = '';
        }
      }
    }
  };
  
  // Handle multi-line spell submission
  const handleSubmitMultilineSpell = () => {
    if (spellLines.length === 0 || spellLines.every(line => !line.trim())) {
      return;
    }
    
    // Combine all lines for history display
    const fullSpell = spellLines.join('\n');
    setHistory(prev => [...prev, { type: 'input', content: fullSpell }]);
    
    // Add to command history for arrow key navigation
    setCommandHistory(prev => [fullSpell, ...prev]);
    setHistoryIndex(-1);
    
    // Process the multi-line spell
    processMultiLineSpell(spellLines);
    
    // Create ripple effect
    if (terminalContainerRef.current) {
      const rect = terminalContainerRef.current.getBoundingClientRect();
      // Create multiple ripples for a more impressive effect
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          const offsetX = rect.width / 2 + (Math.random() * 40 - 20);
          const offsetY = rect.height / 2 + (Math.random() * 40 - 20);
          addRipple(offsetX, offsetY);
        }, i * 100);
      }
    }
    
    // Reset input field
    setSpellLines([]);
    if (textareaRef.current) {
      textareaRef.current.value = '';
    }
    
    // Play sound effect
    playHit();
  };
  
  // Process multi-line spells
  const processMultiLineSpell = (lines: string[]) => {
    if (lines.length === 0) return;
    
    const trimmedLines = lines.map(line => line.trim()).filter(line => line);
    
    // Check if the last line is "seal" to cast the spell
    const lastLine = trimmedLines[trimmedLines.length - 1].toLowerCase();
    if (lastLine === "seal") {
      // This is a complete spell, parse and cast it
      try {
        const spellText = trimmedLines.join('\n');
        const parser = new SpellParser();
        const parsedSpell = parser.parse(spellText);
        
        // Calculate energy cost
        const cost = calculateCost(parsedSpell);
        
        // Check if user has enough energy
        if (cost > energy) {
          setHistory(prev => [...prev, { 
            type: 'response', 
            content: `Not enough energy. Need ${cost}E, have ${energy}E.`, 
            success: false 
          }]);
          triggerFeedback("energy_insufficient");
          return;
        }
        
        // Apply the spell effect to the simulation
        const spellEffect = applySpellEffect(parsedSpell);
        
        if (spellEffect.success) {
          // For multi-line spells, pulse all the forces used
          setMonitorPulse("Energy"); // Always pulse Energy for cost
          
          // Find all forces used in the spell
          const forces = trimmedLines
            .filter(line => line.toLowerCase().startsWith("focus:"))
            .map(line => {
              const match = line.match(/focus:\s*(.+)/i);
              return match ? match[1].trim() : null;
            })
            .filter(Boolean);
          
          // Pulse each force with a delay
          forces.forEach((force, index) => {
            setTimeout(() => {
              setMonitorPulse(force as string);
            }, index * 500);
          });
          
          // Deduct energy cost
          spendEnergy(cost);
          
          // Add success message to history
          setHistory(prev => [...prev, { 
            type: 'response', 
            content: spellEffect.message, 
            success: true 
          }]);
          
          // Create multiple ripple effects
          if (terminalContainerRef.current) {
            const rect = terminalContainerRef.current.getBoundingClientRect();
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Create multiple ripples for more impressive effect
            for (let i = 0; i < forces.length + 2; i++) {
              setTimeout(() => {
                // Slightly offset each ripple for better visual effect
                const offsetX = centerX + (Math.random() * 60 - 30);
                const offsetY = centerY + (Math.random() * 60 - 30);
                
                // Get ripple color based on force (or random if undefined)
                let rippleColor = 'rgba(124, 58, 237, 0.5)'; // Default purple
                if (i < forces.length) {
                  const force = forces[i];
                  switch(force) {
                    case 'Energy':
                      rippleColor = 'rgba(245, 158, 11, 0.5)'; // Amber
                      break;
                    case 'Probability':
                      rippleColor = 'rgba(124, 58, 237, 0.5)'; // Purple
                      break;
                    case 'Entropy':
                      rippleColor = 'rgba(239, 68, 68, 0.5)'; // Red
                      break;
                    case 'Time':
                      rippleColor = 'rgba(14, 165, 233, 0.5)'; // Blue
                      break;
                  }
                }
                
                addRipple(offsetX, offsetY, rippleColor);
              }, i * 150);
            }
          }
          
          // Play success sound
          playSuccess();
        } else {
          // Spell failed to apply
          setHistory(prev => [...prev, { 
            type: 'response', 
            content: spellEffect.message, 
            success: false 
          }]);
          
          // Apply feedback/consequences if needed
          if (spellEffect.feedback) {
            triggerFeedback(spellEffect.feedback);
          }
        }
      } catch (error) {
        setHistory(prev => [...prev, { 
          type: 'response', 
          content: `Spell error: ${(error as Error).message}`, 
          success: false 
        }]);
      }
    } else {
      // Not a complete spell, process each line individually
      for (const line of trimmedLines) {
        processCommand(line);
      }
    }
  };
  
  // Process terminal command
  const processCommand = (command: string) => {
    const trimmedCommand = command.trim().toLowerCase();
    
    // Check for special commands first
    if (trimmedCommand === "scry") {
      // Get current reality parameters
      const response = `
Energy: ${simulationState.energyLevel.toFixed(1)}
Probability: ${simulationState.probabilityShift.toFixed(1)}
Entropy: ${simulationState.entropyLevel.toFixed(1)}
Time: ${simulationState.timeSpeed.toFixed(1)}x
Active effects: ${simulationState.activeEffects.length}
      `;
      setHistory(prev => [...prev, { type: 'response', content: response, success: true }]);
      return;
    }
    
    if (trimmedCommand === "clear") {
      setHistory([]);
      return;
    }
    
    if (trimmedCommand === "seal") {
      // Compile and cast the spell
      castSpell();
      return;
    }
    
    // Direct manipulation commands for demonstration purposes
    // These commands allow the user to see immediate effects in the 2D map
    
    // Energy manipulation
    if (trimmedCommand.startsWith("energy set ")) {
      const levelMatch = trimmedCommand.match(/energy set (\d+)/);
      if (levelMatch && levelMatch[1]) {
        const newLevel = Math.min(100, Math.max(0, parseInt(levelMatch[1], 10)));
        setSimulationState({ 
          energyLevel: newLevel, 
          lastSpellFocus: "Energy" 
        });
        
        // Create energetic ripple effect
        if (terminalContainerRef.current) {
          const rect = terminalContainerRef.current.getBoundingClientRect();
          addRipple(rect.width / 2, rect.height / 2, 'rgba(245, 158, 11, 0.5)');
        }
        
        setHistory(prev => [...prev, { 
          type: 'response', 
          content: `Energy level set to ${newLevel}`, 
          success: true 
        }]);
        return;
      }
    }
    
    // Probability manipulation
    if (trimmedCommand.startsWith("probability set ")) {
      const levelMatch = trimmedCommand.match(/probability set (\d+)/);
      if (levelMatch && levelMatch[1]) {
        const newLevel = Math.min(100, Math.max(0, parseInt(levelMatch[1], 10)));
        setSimulationState({ 
          probabilityShift: newLevel, 
          lastSpellFocus: "Probability" 
        });
        
        // Create probability ripple effect
        if (terminalContainerRef.current) {
          const rect = terminalContainerRef.current.getBoundingClientRect();
          addRipple(rect.width / 2, rect.height / 2, 'rgba(124, 58, 237, 0.5)');
        }
        
        setHistory(prev => [...prev, { 
          type: 'response', 
          content: `Probability shift set to ${newLevel}`, 
          success: true 
        }]);
        return;
      }
    }
    
    // Entropy manipulation
    if (trimmedCommand.startsWith("entropy set ")) {
      const levelMatch = trimmedCommand.match(/entropy set (\d+)/);
      if (levelMatch && levelMatch[1]) {
        const newLevel = Math.min(100, Math.max(0, parseInt(levelMatch[1], 10)));
        setSimulationState({ 
          entropyLevel: newLevel, 
          lastSpellFocus: "Entropy" 
        });
        
        // Create entropy ripple effect
        if (terminalContainerRef.current) {
          const rect = terminalContainerRef.current.getBoundingClientRect();
          addRipple(rect.width / 2, rect.height / 2, 'rgba(239, 68, 68, 0.5)');
        }
        
        setHistory(prev => [...prev, { 
          type: 'response', 
          content: `Entropy level set to ${newLevel}`, 
          success: true 
        }]);
        return;
      }
    }
    
    // Time manipulation
    if (trimmedCommand.startsWith("time set ")) {
      const speedMatch = trimmedCommand.match(/time set (\d+(?:\.\d+)?)/);
      if (speedMatch && speedMatch[1]) {
        const newSpeed = Math.min(2, Math.max(0.1, parseFloat(speedMatch[1])));
        setSimulationState({ 
          timeSpeed: newSpeed, 
          lastSpellFocus: "Time" 
        });
        
        // Create time ripple effect
        if (terminalContainerRef.current) {
          const rect = terminalContainerRef.current.getBoundingClientRect();
          addRipple(rect.width / 2, rect.height / 2, 'rgba(14, 165, 233, 0.5)');
        }
        
        setHistory(prev => [...prev, { 
          type: 'response', 
          content: `Time flow set to ${newSpeed}x`, 
          success: true 
        }]);
        return;
      }
    }
    
    // Help command to display available direct commands
    if (trimmedCommand === "help" || trimmedCommand === "?") {
      const helpText = `
Available commands:
  scry - View current reality parameters
  clear - Clear terminal history
  seal - Cast the current spell
  
Direct manipulation:
  energy set <0-100> - Set energy level
  probability set <0-100> - Set probability shift
  entropy set <0-100> - Set entropy level
  time set <0.1-2.0> - Set time speed

Spell components:
  focus: [Energy|Probability|Entropy|Time]
  anchor: [Self|Object|Zone(radius:n)]
  shift: [+|-]n%
  intent: "Your intention here"
  
Navigation:
  - Use Up/Down arrows to navigate command history in single-line mode
  - Use Ctrl+Up/Down arrows to navigate history in multi-line mode
      `;
      
      setHistory(prev => [...prev, { 
        type: 'response', 
        content: helpText, 
        success: true 
      }]);
      return;
    }
    
    // Handle spell component input
    const focusMatch = command.match(/focus:\s*(.+)/i);
    if (focusMatch) {
      const focus = focusMatch[1].trim();
      setCurrentSpell(prev => ({ ...prev, focus }));
      return;
    }
    
    const anchorMatch = command.match(/anchor:\s*(.+)/i);
    if (anchorMatch) {
      const anchor = anchorMatch[1].trim();
      
      // Parse anchor params if any
      const anchorTypeMatch = anchor.match(/([A-Za-z]+)(?:\(([^)]+)\))?/);
      if (anchorTypeMatch) {
        const anchorType = anchorTypeMatch[1];
        const params: Record<string, any> = {};
        
        if (anchorTypeMatch[2]) {
          const paramPairs = anchorTypeMatch[2].split(",");
          for (const pair of paramPairs) {
            const [key, value] = pair.split(":");
            if (key && value) {
              const numValue = parseFloat(value.trim());
              params[key.trim()] = isNaN(numValue) ? value.trim() : numValue;
            }
          }
        }
        
        setCurrentSpell(prev => ({ 
          ...prev, 
          anchor: { type: anchorType, params } 
        }));
      }
      return;
    }
    
    const shiftMatch = command.match(/shift:\s*(.+)/i);
    if (shiftMatch) {
      const shiftValue = shiftMatch[1].trim();
      const shiftFormatMatch = shiftValue.match(/([+\-])(\d+)%/);
      
      if (shiftFormatMatch) {
        const direction = shiftFormatMatch[1];
        const amount = parseInt(shiftFormatMatch[2], 10);
        setCurrentSpell(prev => ({ 
          ...prev, 
          shift: { direction, amount } 
        }));
      }
      return;
    }
    
    const intentMatch = command.match(/intent:\s*"([^"]+)"/i);
    if (intentMatch) {
      const intent = intentMatch[1].trim();
      setCurrentSpell(prev => ({ ...prev, intent }));
      return;
    }
    
    // If we reached here, it's an unknown command
    setHistory(prev => [...prev, { 
      type: 'response', 
      content: `Aether resonance unclear. Command not recognized: "${command}"`, 
      success: false 
    }]);
  };
  
  // Compile the spell from current components and cast it
  const castSpell = () => {
    if (!currentSpell.focus || !currentSpell.anchor || !currentSpell.shift || !currentSpell.intent) {
      // Missing required components
      setHistory(prev => [...prev, { 
        type: 'response', 
        content: 'Spell incomplete. Required: focus, anchor, shift, and intent.', 
        success: false 
      }]);
      return;
    }
    
    // Convert to full spell format for the parser
    const fullSpell = `focus: ${currentSpell.focus}
anchor: ${currentSpell.anchor.type}${Object.keys(currentSpell.anchor.params || {}).length > 0 ? 
  `(${Object.entries(currentSpell.anchor.params || {}).map(([k, v]) => `${k}:${v}`).join(',')})` : ''}
shift: ${currentSpell.shift.direction}${currentSpell.shift.amount}%
cost: 30E
intent: "${currentSpell.intent}"
seal`;
    
    try {
      // Parse the spell to ensure it's valid
      const parser = new SpellParser();
      const parsedSpell = parser.parse(fullSpell);
      
      // Calculate energy cost
      const cost = calculateCost(parsedSpell);
      
      // Check if user has enough energy
      if (cost > energy) {
        setHistory(prev => [...prev, { 
          type: 'response', 
          content: `Not enough energy. Need ${cost}E, have ${energy}E.`, 
          success: false 
        }]);
        triggerFeedback("energy_insufficient");
        return;
      }
      
      // Apply the spell effect to the simulation
      const spellEffect = applySpellEffect(parsedSpell);
      
      if (spellEffect.success) {
        // Update focus monitor pulse effect
        setMonitorPulse(currentSpell.focus as string);
        
        // Deduct energy cost
        spendEnergy(cost);
        
        // Add success message to history
        setHistory(prev => [...prev, { 
          type: 'response', 
          content: spellEffect.message, 
          success: true 
        }]);
        
        // Create multiple ripple effects based on the focus
        if (terminalContainerRef.current) {
          const rect = terminalContainerRef.current.getBoundingClientRect();
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          
          // Get ripple color based on focus
          let rippleColor = 'rgba(124, 58, 237, 0.5)'; // Default purple
          switch(currentSpell.focus) {
            case 'Energy':
              rippleColor = 'rgba(245, 158, 11, 0.5)'; // Amber
              break;
            case 'Probability':
              rippleColor = 'rgba(124, 58, 237, 0.5)'; // Purple
              break;
            case 'Entropy':
              rippleColor = 'rgba(239, 68, 68, 0.5)'; // Red
              break;
            case 'Time':
              rippleColor = 'rgba(14, 165, 233, 0.5)'; // Blue
              break;
          }
          
          // Create multiple ripples for more impressive effect
          for (let i = 0; i < 3; i++) {
            setTimeout(() => {
              // Slightly offset each ripple for better visual effect
              const offsetX = centerX + (Math.random() * 40 - 20);
              const offsetY = centerY + (Math.random() * 40 - 20);
              addRipple(offsetX, offsetY, rippleColor);
            }, i * 150); // Stagger the ripples
          }
        }
        
        // Reset current spell components
        setCurrentSpell({});
        
        // Play success sound
        playSuccess();
      } else {
        // Spell failed to apply
        setHistory(prev => [...prev, { 
          type: 'response', 
          content: spellEffect.message, 
          success: false 
        }]);
        
        // Apply feedback/consequences if needed
        if (spellEffect.feedback) {
          triggerFeedback(spellEffect.feedback);
        }
      }
    } catch (error) {
      setHistory(prev => [...prev, { 
        type: 'response', 
        content: `Spell error: ${(error as Error).message}`, 
        success: false 
      }]);
    }
  };
  
  // Terminal design CSS classes
  const terminalBackground = "bg-black/85 backdrop-blur-sm border border-[#7C3AED]/30 rounded-lg p-4 overflow-hidden relative z-10";
  const terminalContainer = "h-full flex flex-col overflow-hidden relative z-20";
  const terminalOutput = "flex-1 overflow-y-auto mb-4 font-mono text-sm max-h-[350px]";
  const terminalInputContainer = "flex flex-col border-t border-[#7C3AED]/20 pt-3 relative z-30";
  const promptSymbol = "text-[#7C3AED] mr-2";
  const inputField = "bg-transparent border-none outline-none flex-1 text-cyan-300 font-mono text-sm cursor-text";
  
  // Dynamic reality parameter monitors
  const renderMonitor = (label: string, value: number, color: string, pulsing: boolean) => {
    const getMonitorStyle = () => {
      switch(label) {
        case 'Energy':
          return {
            border: '1px solid rgba(245, 158, 11, 0.3)',
            background: pulsing ? 'rgba(245, 158, 11, 0.15)' : 'rgba(0, 0, 0, 0.3)',
            barColor: '#F59E0B'
          };
        case 'Probability':
          return {
            border: '1px solid rgba(124, 58, 237, 0.3)',
            background: pulsing ? 'rgba(124, 58, 237, 0.15)' : 'rgba(0, 0, 0, 0.3)',
            barColor: '#7C3AED'
          };
        case 'Entropy':
          return {
            border: '1px solid rgba(239, 68, 68, 0.3)',
            background: pulsing ? 'rgba(239, 68, 68, 0.15)' : 'rgba(0, 0, 0, 0.3)',
            barColor: '#EF4444'
          };
        case 'Time':
          return {
            border: '1px solid rgba(14, 165, 233, 0.3)',
            background: pulsing ? 'rgba(14, 165, 233, 0.15)' : 'rgba(0, 0, 0, 0.3)',
            barColor: '#0EA5E9'
          };
        default:
          return {
            border: '1px solid rgba(107, 114, 128, 0.3)',
            background: 'rgba(0, 0, 0, 0.3)',
            barColor: '#6B7280'
          };
      }
    };
    
    const style = getMonitorStyle();
    
    return (
      <div 
        className={`flex-1 px-3 py-2 rounded ${pulsing ? 'animate-pulse' : ''} transition-all duration-300`}
        style={{ border: style.border, background: style.background }}
      >
        <div className="text-xs text-gray-400 mb-1">{label}</div>
        <div className="flex items-center">
          <div className="w-full h-1.5 bg-black/50 rounded overflow-hidden">
            <div 
              className="h-full transition-all duration-300"
              style={{ 
                width: `${Math.min(100, value)}%`,
                backgroundColor: style.barColor
              }}
            />
          </div>
          <span className="ml-2 text-xs" style={{ color: style.barColor }}>
            {value.toFixed(0)}%
          </span>
        </div>
      </div>
    );
  };
  
  return (
    <div className={`${terminalBackground} shadow-[0_0_20px_rgba(124,58,237,0.2)]`}>
      {/* Background grid effect */}
      <div className={`absolute inset-0 opacity-20 transition-opacity duration-300 ${gridEffect ? 'opacity-40' : ''}`}>
        <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] bg-repeat opacity-20" />
      </div>
      
      {/* Glow effect overlay */}
      <div className="absolute inset-0 rounded-lg pointer-events-none overflow-hidden">
        <div className="absolute -inset-[100px] bg-gradient-radial from-[#7C3AED]/10 to-transparent opacity-50"></div>
      </div>
      
      {/* Matrix-like vertical lines */}
      <div className="absolute inset-0 opacity-30 pointer-events-none overflow-hidden">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={`line-${i}`}
            className="absolute top-0 bottom-0 w-[1px] bg-gradient-to-b from-[#7C3AED]/0 via-[#7C3AED]/40 to-[#7C3AED]/0"
            style={{
              left: `${(i + 1) * (100 / 16)}%`,
              opacity: Math.random() * 0.5 + 0.3,
              height: '120%',
              top: `-${Math.random() * 10}%`,
            }}
          />
        ))}
      </div>
      
      {/* Random glyphs animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Random floating glyphs */}
        {Array.from({ length: 10 }).map((_, i) => (
          <div 
            key={i}
            className="absolute text-[#7C3AED]/20 text-lg font-mono"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              transform: 'translate(-50%, -50%)',
              animation: `float ${5 + Math.random() * 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          >
            {['◆', '◇', '⟁', '⧫', '⬢', '⬡', '↯', '⧉'][Math.floor(Math.random() * 8)]}
          </div>
        ))}
        
        {/* Ripple effects on commands */}
        {ripples.map(ripple => (
          <RippleEffect 
            key={ripple.id}
            x={ripple.x}
            y={ripple.y}
            color={ripple.color}
            onComplete={() => {}}
          />
        ))}
      </div>
      
      <div ref={terminalContainerRef} className={terminalContainer}>
        {/* Reality parameter monitors */}
        <div className="flex gap-2 mb-4">
          {renderMonitor("Energy", simulationState.energyLevel, 
            "amber-500", monitorPulse === "Energy")}
          {renderMonitor("Probability", simulationState.probabilityShift, 
            "purple-500", monitorPulse === "Probability")}
          {renderMonitor("Entropy", simulationState.entropyLevel, 
            "rose-500", monitorPulse === "Entropy")}
          {renderMonitor("Time", simulationState.timeSpeed * 50, 
            "cyan-500", monitorPulse === "Time")}
        </div>
        
        {/* Terminal output */}
        <div ref={terminalRef} className={terminalOutput}>
          <div className="text-[#7C3AED] mb-4">
            AetherCast Terminal Interface v2.1.3
            <br />
            <span className="text-gray-500 text-xs">// Enter spell components or type 'scry' to view reality parameters</span>
          </div>
          
          {history.map((entry, index) => (
            <div key={index} className="mb-2">
              {entry.type === 'input' ? (
                <div className="flex">
                  <span className={promptSymbol}>↯</span>
                  <span className="text-cyan-300 whitespace-pre-wrap">{entry.content}</span>
                </div>
              ) : (
                <div className={`pl-4 ${entry.success 
                  ? "text-emerald-400" // Success color
                  : "text-rose-400" // Error color
                }`}>
                  {entry.content}
                </div>
              )}
            </div>
          ))}
          
          {/* Current spell component status */}
          {Object.keys(currentSpell).length > 0 && (
            <div className="bg-black/50 backdrop-blur-sm rounded p-3 my-3 border border-cyan-500/30">
              <div className="text-xs text-gray-300 mb-2">Active Spell Components:</div>
              {currentSpell.focus && <div className="text-cyan-300 text-sm">Focus: {currentSpell.focus}</div>}
              {currentSpell.anchor && <div className="text-cyan-300 text-sm">Anchor: {currentSpell.anchor.type}</div>}
              {currentSpell.shift && <div className="text-cyan-300 text-sm">
                Shift: {currentSpell.shift.direction}{currentSpell.shift.amount}%
              </div>}
              {currentSpell.intent && <div className="text-cyan-300 text-sm">Intent: "{currentSpell.intent}"</div>}
            </div>
          )}
        </div>
        
        {/* Terminal input */}
        <div className={terminalInputContainer}>
          <div className="flex justify-between items-center mb-2">
            <div className="flex gap-2">
              <button 
                onClick={toggleInputMode}
                className={`px-2 py-1 text-xs rounded-sm transition-colors text-cyan-300 border ${multiLineMode ? 'bg-[#7C3AED]/40 border-[#7C3AED]/50' : 'bg-[#7C3AED]/10 border-[#7C3AED]/30 hover:bg-[#7C3AED]/20'}`}
                title="Toggle between single-line and multi-line input"
              >
                <span className="text-xs">{multiLineMode ? "Single-Line Mode" : "Multi-Line Mode"}</span>
              </button>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSuggestions();
                }}
                className="px-2 py-1 text-xs rounded-sm bg-[#7C3AED]/20 hover:bg-[#7C3AED]/30 transition-colors text-cyan-300 border border-[#7C3AED]/30"
                title="Show command suggestions"
              >
                <span className="text-xs">Commands</span>
              </button>
            </div>
            
            {multiLineMode && (
              <button 
                onClick={handleSubmitMultilineSpell}
                className="px-3 py-1 text-xs rounded-sm bg-[#7C3AED]/30 hover:bg-[#7C3AED]/50 transition-colors text-cyan-300 border border-[#7C3AED]/40"
                title="Cast this spell"
              >
                <span className="text-xs">Cast Spell</span>
              </button>
            )}
          </div>
          
          {!multiLineMode ? (
            // Single-line input
            <div className="flex items-center w-full" onClick={() => inputRef.current?.focus()}>
              <span className={promptSymbol}>↯</span>
              <input
                ref={inputRef}
                type="text"
                className={inputField}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter command... (Up/Down arrows for history)"
                autoFocus
              />
              <span className={`text-cyan-300 ${showCaret ? 'opacity-100' : 'opacity-0'}`}>|</span>
            </div>
          ) : (
            // Multi-line input
            <div className="border border-[#7C3AED]/30 rounded-md bg-black/30 p-2">
              <textarea 
                ref={textareaRef}
                className="w-full h-[80px] bg-transparent border-none outline-none text-cyan-300 font-mono text-sm resize-none"
                placeholder="Enter multi-line spell... (Ctrl+Up/Down arrows for history)"
                onChange={handleMultiLineChange}
                onKeyDown={handleMultiLineKeyDown}
                spellCheck={false}
              />
              <div className="text-xs text-gray-500 mt-1">End your spell with 'seal' to cast it.</div>
            </div>
          )}
          
          {/* Command suggestions panel */}
          {showSuggestions && (
            <div className="mt-3 border border-[#7C3AED]/30 bg-black/50 rounded-md p-3 text-sm max-h-[200px] overflow-auto">
              {selectedCommand ? (
                <div className="command-params">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-primary font-medium">{selectedCommand.label}</h4>
                    <button 
                      onClick={() => setSelectedCommand(null)}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      Back
                    </button>
                  </div>
                  
                  {selectedCommand.hasParameters && selectedCommand.parameters && (
                    <div className="space-y-2 mb-3">
                      {selectedCommand.parameters.map(param => (
                        <div key={param.name} className="flex flex-col">
                          <label className="text-xs text-muted-foreground mb-1">{param.placeholder}</label>
                          {param.type === 'select' ? (
                            <select 
                              className="bg-black/70 border border-[#7C3AED]/20 rounded-sm p-1 text-xs text-cyan-300"
                              value={commandParams[param.name] || ''}
                              onChange={(e) => handleParamChange(param.name, e.target.value)}
                            >
                              <option value="">-- Select --</option>
                              {param.options?.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : (
                            <input 
                              type={param.type === 'number' ? 'number' : 'text'}
                              className="bg-black/70 border border-[#7C3AED]/20 rounded-sm p-1 text-xs text-cyan-300"
                              placeholder={param.placeholder}
                              value={commandParams[param.name] || ''}
                              onChange={(e) => handleParamChange(param.name, e.target.value)}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <button 
                    onClick={insertCommandWithParams}
                    className="w-full py-1 bg-[#7C3AED]/30 hover:bg-[#7C3AED]/50 transition-colors text-cyan-300 rounded-sm text-xs"
                  >
                    Insert Command
                  </button>
                </div>
              ) : (
                <>
                  {/* Command categories */}
                  <div className="flex items-center gap-2 mb-3 text-xs border-b border-[#7C3AED]/20 pb-2">
                    <span className="text-cyan-300">Categories:</span>
                    <span className="px-2 py-0.5 bg-[#7C3AED]/20 rounded-sm">Spell</span>
                    <span className="px-2 py-0.5 bg-amber-500/20 rounded-sm">Control</span>
                    <span className="px-2 py-0.5 bg-rose-500/20 rounded-sm">Manipulation</span>
                  </div>
                  
                  {/* Command list */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {suggestedCommands.map(command => (
                      <div 
                        key={command.id}
                        onClick={() => handleSelectCommand(command)}
                        className={`
                          cursor-pointer p-2 rounded-sm hover:bg-[#7C3AED]/10 transition-colors
                          ${command.category === 'spell' ? 'border-l-2 border-[#7C3AED]/50' : 
                            command.category === 'control' ? 'border-l-2 border-amber-500/50' : 
                            'border-l-2 border-rose-500/50'}
                        `}
                      >
                        <div className="font-mono text-xs text-cyan-300">{command.label}</div>
                        <div className="text-xs text-muted-foreground">{command.description}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}