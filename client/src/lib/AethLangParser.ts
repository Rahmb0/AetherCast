// AetherCast spell parser implementation

export interface ParsedSpell {
  focus: string;
  anchor: {
    type: string;
    params: Record<string, any>;
  };
  shift: {
    direction: string;
    amount: number;
  };
  cost: number;
  intent: string;
  isBound: boolean;
  isSealed: boolean;
  // For hidden "true name" system
  usesHiddenProtocol: boolean;
  protocolKeywords: string[];
}

export class SpellParser {
  private validFocusValues = ["Energy", "Probability", "Entropy", "Time"];
  private validAnchorTypes = ["Self", "Object", "Zone"];
  
  // Hidden protocol keywords that unlock extended features
  private hiddenProtocolKeywords = [
    "kernel.space", 
    "root.entropy", 
    "void.manifest",
    "quantum.superposition",
    "paradox.engine"
  ];
  
  /**
   * Parse AetherCast spell code into a structured object
   */
  parse(spellCode: string): ParsedSpell[] {
    // Split multi-spells (connected by bind)
    const spellParts = spellCode.split(/bind\s*\n/);
    const parsedSpells: ParsedSpell[] = [];
    
    // Check for hidden protocol keywords in the entire spell
    const allCode = spellCode.toLowerCase();
    const foundProtocols = this.hiddenProtocolKeywords.filter(
      keyword => allCode.includes(keyword.toLowerCase())
    );
    
    // Parse each spell part
    for (let i = 0; i < spellParts.length; i++) {
      const part = spellParts[i].trim();
      if (!part) continue;
      
      const isLastPart = i === spellParts.length - 1;
      
      // Check if the spell is properly sealed
      const isSealed = isLastPart && part.trim().endsWith("seal");
      
      if (!isSealed && isLastPart) {
        throw new Error("Final spell must be sealed with 'seal' keyword");
      }
      
      // Clean up the part by removing seal if present
      const cleanPart = isSealed ? part.replace(/seal\s*$/, "") : part;
      
      // Parse the individual spell
      const parsedSpell = this.parseSingleSpell(cleanPart);
      
      // Set binding and sealing flags
      parsedSpell.isBound = i < spellParts.length - 1;
      parsedSpell.isSealed = isSealed;
      
      // Set hidden protocol flags if any were found
      parsedSpell.usesHiddenProtocol = foundProtocols.length > 0;
      parsedSpell.protocolKeywords = foundProtocols;
      
      parsedSpells.push(parsedSpell);
    }
    
    return parsedSpells;
  }
  
  /**
   * Parse a single spell part
   */
  private parseSingleSpell(spellPart: string): ParsedSpell {
    // Initialize default spell structure
    const spell: ParsedSpell = {
      focus: "",
      anchor: {
        type: "",
        params: {}
      },
      shift: {
        direction: "",
        amount: 0
      },
      cost: 0,
      intent: "",
      isBound: false,
      isSealed: false,
      usesHiddenProtocol: false,
      protocolKeywords: []
    };
    
    // Extract focus
    const focusMatch = spellPart.match(/focus:\s*([^\n]+)/);
    if (!focusMatch) {
      throw new Error("Missing 'focus:' in spell");
    }
    
    spell.focus = focusMatch[1].trim();
    if (!this.validFocusValues.includes(spell.focus)) {
      throw new Error(`Invalid focus value: ${spell.focus}. Must be one of: ${this.validFocusValues.join(", ")}`);
    }
    
    // Extract anchor
    const anchorMatch = spellPart.match(/anchor:\s*([^\n]+)/);
    if (!anchorMatch) {
      throw new Error("Missing 'anchor:' in spell");
    }
    
    const anchorValue = anchorMatch[1].trim();
    
    // Parse anchor type and parameters (if any)
    const anchorTypeMatch = anchorValue.match(/([A-Za-z]+)(?:\(([^)]+)\))?/);
    if (!anchorTypeMatch) {
      throw new Error(`Invalid anchor format: ${anchorValue}`);
    }
    
    const anchorType = anchorTypeMatch[1];
    if (!this.validAnchorTypes.includes(anchorType)) {
      throw new Error(`Invalid anchor type: ${anchorType}. Must be one of: ${this.validAnchorTypes.join(", ")}`);
    }
    
    spell.anchor.type = anchorType;
    
    // Parse anchor parameters if present
    if (anchorTypeMatch[2]) {
      const paramPairs = anchorTypeMatch[2].split(",");
      for (const pair of paramPairs) {
        const [key, value] = pair.split(":");
        if (key && value) {
          // Convert numeric values
          const numValue = parseFloat(value.trim());
          spell.anchor.params[key.trim()] = isNaN(numValue) ? value.trim() : numValue;
        }
      }
    }
    
    // Extract shift
    const shiftMatch = spellPart.match(/shift:\s*([^\n]+)/);
    if (!shiftMatch) {
      throw new Error("Missing 'shift:' in spell");
    }
    
    const shiftValue = shiftMatch[1].trim();
    const shiftFormatMatch = shiftValue.match(/([+\-])(\d+)%/);
    
    if (!shiftFormatMatch) {
      throw new Error(`Invalid shift format: ${shiftValue}. Must be in format +XX% or -XX%`);
    }
    
    spell.shift.direction = shiftFormatMatch[1];
    spell.shift.amount = parseInt(shiftFormatMatch[2], 10);
    
    // Extract cost
    const costMatch = spellPart.match(/cost:\s*(\d+)E/);
    if (!costMatch) {
      throw new Error("Missing 'cost:' in spell");
    }
    
    spell.cost = parseInt(costMatch[1], 10);
    
    // Extract intent
    const intentMatch = spellPart.match(/intent:\s*"([^"]+)"/);
    if (!intentMatch) {
      throw new Error('Missing or improperly formatted intent. Must be in format: intent: "Your intention"');
    }
    
    spell.intent = intentMatch[1].trim();
    
    return spell;
  }
}
