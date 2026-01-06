// ==========================================
// INVERTED CHAOS - UTILITY FUNCTIONS
// ==========================================

/**
 * Clamp a value between min and max
 */
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two values
 */
function lerp(start, end, t) {
    return start + (end - start) * t;
}

/**
 * Get a random integer between min and max (inclusive)
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Get a random element from an array
 */
function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Check if two positions are equal
 */
function positionsEqual(pos1, pos2) {
    return pos1.x === pos2.x && pos1.y === pos2.y;
}

/**
 * Get color based on chaos level (0-100)
 */
function getChaosColor(chaosLevel) {
    if (chaosLevel < 30) {
        // Low chaos: blue
        return `rgb(79, 172, 254)`;
    } else if (chaosLevel < 70) {
        // Medium chaos: purple
        const r = lerp(79, 240, (chaosLevel - 30) / 40);
        const g = lerp(172, 147, (chaosLevel - 30) / 40);
        const b = lerp(254, 251, (chaosLevel - 30) / 40);
        return `rgb(${r}, ${g}, ${b})`;
    } else {
        // High chaos: red
        const r = lerp(240, 255, (chaosLevel - 70) / 30);
        const g = lerp(147, 107, (chaosLevel - 70) / 30);
        const b = lerp(251, 107, (chaosLevel - 70) / 30);
        return `rgb(${r}, ${g}, ${b})`;
    }
}

/**
 * Format time in MM:SS
 */
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Distance between two points
 */
function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}
