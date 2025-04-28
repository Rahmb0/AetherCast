# AethLang Documentation

AethLang is the custom scripting language used in AetherCast to manipulate simulation parameters. This document provides a comprehensive guide to the syntax, capabilities, and examples of using AethLang.

## Basic Syntax

AethLang spells follow this general structure:

```
focus [Force] with [Anchor] shift [Direction][Amount]
```

For more complex spells, you can use:

```
focus [Force] with [Anchor] shift [Direction][Amount] {
  // Additional parameters or nested effects
  bind to [Target]
  seal with [Condition]
}
```

## Core Components

### Forces

The four fundamental forces that can be manipulated:

- **Energy**: Manipulates the power level in a system
- **Probability**: Shifts likelihood of outcomes
- **Entropy**: Controls chaos and disorder
- **Time**: Affects the passage of time in the simulation

### Anchors

Anchors define the point of origin for your spell:

- **Self**: Centers the effect on the caster
  ```
  focus Energy with Self shift +10
  ```

- **Object**: Targets a specific object by ID
  ```
  focus Entropy with Object(id="particle-1") shift +4
  ```

- **Zone**: Affects an area with specified parameters
  ```
  focus Probability with Zone(radius=5) shift -2
  ```

### Parameters

Each anchor type accepts different parameters:

- **Self**
  - No additional parameters required

- **Object**
  - `id`: Unique identifier for the object
  - `type` (optional): Type of object to target

- **Zone**
  - `radius`: Radius of effect in simulation units
  - `shape` (optional): "circle", "square", or "custom"
  - `duration` (optional): How long the zone persists

### Shift

Defines how the force is modified:

- Direction: `+` (increase) or `-` (decrease)
- Amount: Numeric value representing magnitude

## Advanced Usage

### Binding

Binding attaches your spell to a target:

```
focus Energy with Self shift +10 {
  bind to "particle-generator"
}
```

### Sealing

Sealing adds conditions to your spell:

```
focus Time with Zone(radius=3) shift -2 {
  seal with "duration=10s"
}
```

### Compound Spells

Multiple effects can be combined:

```
focus Energy with Self shift +5
focus Probability with Zone(radius=2) shift -1
```

## Hidden Protocols

AethLang contains hidden "true name" protocols that can be discovered:

```
focus Energy with Self shift +3 {
  // Hidden protocol syntax would be here
}
```

These special commands unlock additional capabilities when the correct keywords are included.

## Energy Cost

Each spell has an energy cost based on:

1. The force being manipulated
2. The magnitude of the shift
3. The size or complexity of the anchor
4. Any additional bindings or seals

For example:
- `focus Energy with Self shift +1` has a cost of 5 units
- `focus Time with Zone(radius=10) shift -5` has a cost of 25 units

## Error Handling

Common errors include:

- **Energy Insufficient**: Not enough energy to cast the spell
- **Reality Fracture**: Incompatible force combinations
- **Time Loop**: Paradoxical time manipulations
- **Paradox**: Logical contradictions in spell design

## Examples

### Basic Energy Manipulation
```
focus Energy with Self shift +10
```

### Creating a Probability Field
```
focus Probability with Zone(radius=5) shift -2
```

### Targeted Entropy Reduction
```
focus Entropy with Object(id="particle-cluster") shift -3
```

### Localized Time Dilation
```
focus Time with Zone(radius=2, shape="circle") shift +1
```

### Complex Binding Example
```
focus Energy with Self shift +7 {
  bind to "energy-well"
  seal with "threshold=10"
}
```