import { Request, Response } from "express";

// Store some server-side simulation state
const simulationState = {
  serverTime: Date.now(),
  activePhenomena: [],
  hiddenProtocolDiscoveries: {},
  systemIntegrity: 100,
  anomalyLevel: 0
};

// Controller for simulation-related endpoints
export const simulationController = {
  /**
   * Get the current simulation state
   */
  getState: (req: Request, res: Response) => {
    // Update server time
    simulationState.serverTime = Date.now();
    
    // Return current simulation state
    res.json({
      ...simulationState,
      serverUptime: Math.floor((Date.now() - simulationState.serverTime) / 1000)
    });
  },
  
  /**
   * Process a spell cast request
   */
  castSpell: (req: Request, res: Response) => {
    const { spellCode, energyCost } = req.body;
    
    if (!spellCode) {
      return res.status(400).json({
        success: false,
        message: "No spell code provided"
      });
    }
    
    // For this simulation, actual spell processing happens client-side
    // This endpoint just records the fact that a spell was cast
    
    // Record the spell casting
    simulationState.activePhenomena.push({
      id: Math.random().toString(36).substring(2, 15),
      timestamp: Date.now(),
      type: "spell_cast",
      energyCost: energyCost || 0,
      spellFragment: spellCode.substring(0, 50) // Only record the first part for privacy
    });
    
    // Only keep the last 10 phenomena
    if (simulationState.activePhenomena.length > 10) {
      simulationState.activePhenomena.shift();
    }
    
    // Check for hidden words in the spell
    checkForHiddenProtocols(spellCode, req.ip);
    
    // Return success
    res.json({
      success: true,
      message: "Spell recorded by the simulation"
    });
  },
  
  /**
   * Trigger feedback in the simulation
   */
  triggerFeedback: (req: Request, res: Response) => {
    const { feedbackType, intensity } = req.body;
    
    if (!feedbackType) {
      return res.status(400).json({
        success: false,
        message: "No feedback type provided"
      });
    }
    
    // Record the feedback event
    simulationState.activePhenomena.push({
      id: Math.random().toString(36).substring(2, 15),
      timestamp: Date.now(),
      type: "feedback",
      feedbackType,
      intensity: intensity || 1.0
    });
    
    // Update anomaly level based on feedback
    simulationState.anomalyLevel += (intensity || 1.0);
    
    // If anomaly level gets too high, reduce system integrity
    if (simulationState.anomalyLevel > 10) {
      simulationState.systemIntegrity -= 5;
      simulationState.anomalyLevel = 0;
    }
    
    // Only keep the last 10 phenomena
    if (simulationState.activePhenomena.length > 10) {
      simulationState.activePhenomena.shift();
    }
    
    // Return success
    res.json({
      success: true,
      message: "Feedback propagated through the simulation",
      currentIntegrity: simulationState.systemIntegrity
    });
  },
  
  /**
   * Discover hidden protocols
   */
  discoverProtocols: (req: Request, res: Response) => {
    const clientIp = req.ip;
    const userDiscoveries = simulationState.hiddenProtocolDiscoveries[clientIp] || [];
    
    // Return the list of protocols this user has discovered
    res.json({
      success: true,
      discoveredProtocols: userDiscoveries,
      hint: userDiscoveries.length === 0 
        ? "Look for hidden patterns in the code" 
        : "You've begun to see beyond the veil"
    });
  }
};

/**
 * Check a spell for hidden protocols
 */
function checkForHiddenProtocols(spellCode: string, clientIp: string): void {
  // List of hidden protocols to look for
  const hiddenProtocols = [
    "kernel.space",
    "root.entropy",
    "void.manifest",
    "quantum.superposition",
    "paradox.engine"
  ];
  
  // Initialize user's discoveries if not present
  if (!simulationState.hiddenProtocolDiscoveries[clientIp]) {
    simulationState.hiddenProtocolDiscoveries[clientIp] = [];
  }
  
  // Check for each protocol
  for (const protocol of hiddenProtocols) {
    if (
      spellCode.includes(protocol) && 
      !simulationState.hiddenProtocolDiscoveries[clientIp].includes(protocol)
    ) {
      // User discovered a new protocol
      simulationState.hiddenProtocolDiscoveries[clientIp].push(protocol);
    }
  }
}
