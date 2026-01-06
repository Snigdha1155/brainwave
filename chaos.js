// ==========================================
// INVERTED CHAOS - CHAOS SYSTEM
// ==========================================

class ChaosSystem {
    constructor() {
        this.chaosLevel = 0; // 0-100
        this.lastMoveTime = Date.now();
        this.moveHistory = []; // Track recent moves
        this.maxHistorySize = 5;
        
        // Chaos effects state
        this.effects = {
            screenShake: false,
            randomWalls: [],
            goalMoving: false
        };
        
        // UI elements
        this.chaosFill = document.getElementById('chaosFill');
        this.chaosValue = document.getElementById('chaosValue');
        this.chaosWarning = document.getElementById('chaosWarning');
    }

    /**
     * Update chaos level based on player behavior
     */
    update(deltaTime) {
        const currentTime = Date.now();
        const timeSinceLastMove = (currentTime - this.lastMoveTime) / 1000;

        // Increase chaos when player is idle (more than 1 second)
        if (timeSinceLastMove > 1) {
            this.increaseChaos(deltaTime * 5); // 5% per second of idleness
        }

        // Gradually decrease chaos over time (slower than increase)
        this.decreaseChaos(deltaTime * 2);

        // Clamp chaos level
        this.chaosLevel = clamp(this.chaosLevel, 0, 100);

        // Update UI
        this.updateUI();

        // Trigger chaos effects
        this.updateEffects();
    }

    /**
     * Called when player makes a move
     */
    onPlayerMove() {
        const currentTime = Date.now();
        const timeSinceLastMove = (currentTime - this.lastMoveTime) / 1000;

        // Add move to history
        this.moveHistory.push(currentTime);
        if (this.moveHistory.length > this.maxHistorySize) {
            this.moveHistory.shift();
        }

        // Check if moving quickly (within 0.5 seconds)
        if (timeSinceLastMove < 0.5) {
            this.decreaseChaos(10); // Reward quick movement
        } else {
            this.increaseChaos(3); // Slow movement increases chaos slightly
        }

        // Check for rapid succession (multiple moves in 2 seconds)
        if (this.moveHistory.length >= 3) {
            const timeSpan = (currentTime - this.moveHistory[0]) / 1000;
            if (timeSpan < 2) {
                this.decreaseChaos(15); // Big reward for rapid moves
            }
        }

        this.lastMoveTime = currentTime;
    }

    /**
     * Increase chaos level
     */
    increaseChaos(amount) {
        this.chaosLevel = Math.min(100, this.chaosLevel + amount);
    }

    /**
     * Decrease chaos level
     */
    decreaseChaos(amount) {
        this.chaosLevel = Math.max(0, this.chaosLevel - amount);
    }

    /**
     * Update UI elements
     */
    updateUI() {
        // Update meter
        this.chaosFill.style.width = `${this.chaosLevel}%`;
        this.chaosValue.textContent = `${Math.floor(this.chaosLevel)}%`;

        // Change meter color based on chaos level
        if (this.chaosLevel < 30) {
            this.chaosValue.style.color = '#4facfe';
        } else if (this.chaosLevel < 70) {
            this.chaosValue.style.color = '#f093fb';
        } else {
            this.chaosValue.style.color = '#ff6b6b';
        }

        // Show warning at high chaos
        if (this.chaosLevel > 70) {
            this.chaosWarning.classList.remove('hidden');
        } else {
            this.chaosWarning.classList.add('hidden');
        }
    }

    /**
     * Update chaos effects
     */
    updateEffects() {
        // Screen shake effect when chaos > 50
        this.effects.screenShake = this.chaosLevel > 50;

        // Random walls spawn when chaos > 60
        // (handled in game.js)

        // Goal moves when chaos > 80
        this.effects.goalMoving = this.chaosLevel > 80;
    }

    /**
     * Get screen shake offset
     */
    getShakeOffset() {
        if (!this.effects.screenShake) {
            return { x: 0, y: 0 };
        }

        const intensity = (this.chaosLevel - 50) / 50; // 0 to 1
        const maxShake = 5 * intensity;

        return {
            x: (Math.random() - 0.5) * maxShake,
            y: (Math.random() - 0.5) * maxShake
        };
    }

    /**
     * Check if should spawn random wall
     */
    shouldSpawnRandomWall() {
        return this.chaosLevel > 60 && Math.random() < 0.02; // 2% chance per frame
    }

    /**
     * Reset chaos system
     */
    reset() {
        this.chaosLevel = 0;
        this.lastMoveTime = Date.now();
        this.moveHistory = [];
        this.effects = {
            screenShake: false,
            randomWalls: [],
            goalMoving: false
        };
        this.updateUI();
    }
}
