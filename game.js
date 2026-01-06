// ==========================================
// INVERTED CHAOS - GAME LOGIC
// ==========================================

class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Game constants
        this.gridSize = 5;
        this.tileSize = 100;
        this.padding = 50;
        
        // Game state
        this.player = { x: 0, y: 0 };
        this.goal = { x: 4, y: 4 };
        this.walls = [];
        this.chaosWalls = []; // Random walls from chaos
        this.isWon = false;
        
        // Chaos system
        this.chaosSystem = new ChaosSystem();
        
        // Animation
        this.rotation = 0; // For grid rotation effect
        this.goalPulse = 0; // For goal animation
        
        // Initialize
        this.initializeLevel();
    }

    /**
     * Initialize level layout
     */
    initializeLevel() {
        this.player = { x: 0, y: 0 };
        this.goal = { x: 4, y: 4 };
        this.walls = [];
        this.chaosWalls = [];
        this.isWon = false;
        
        // Create some permanent walls for challenge
        this.walls.push(
            { x: 2, y: 1 },
            { x: 2, y: 2 },
            { x: 2, y: 3 },
            { x: 1, y: 2 },
            { x: 3, y: 2 }
        );
    }

    /**
     * Handle player movement (with inverted controls)
     */
    move(direction) {
        if (this.isWon) return;

        // INVERTED CONTROLS
        let newX = this.player.x;
        let newY = this.player.y;

        switch (direction) {
            case 'up':
                newY++; // Up arrow moves DOWN
                break;
            case 'down':
                newY--; // Down arrow moves UP
                break;
            case 'left':
                newX++; // Left arrow moves RIGHT
                break;
            case 'right':
                newX--; // Right arrow moves LEFT
                break;
        }

        // Check bounds
        if (newX < 0 || newX >= this.gridSize || newY < 0 || newY >= this.gridSize) {
            return;
        }

        // Check walls (permanent + chaos walls)
        const allWalls = [...this.walls, ...this.chaosWalls];
        const hitWall = allWalls.some(wall => wall.x === newX && wall.y === newY);
        if (hitWall) {
            return;
        }

        // Move player
        this.player.x = newX;
        this.player.y = newY;

        // Notify chaos system
        this.chaosSystem.onPlayerMove();

        // Check win condition
        if (positionsEqual(this.player, this.goal)) {
            this.win();
        }
    }

    /**
     * Update game state
     */
    update(deltaTime) {
        if (this.isWon) return;

        // Update chaos system
        this.chaosSystem.update(deltaTime);

        // Update animations
        this.goalPulse += deltaTime * 3;
        
        // Grid rotation based on chaos
        if (this.chaosSystem.chaosLevel > 70) {
            this.rotation += deltaTime * (this.chaosSystem.chaosLevel - 70) / 30;
        } else {
            // Smoothly return to 0
            this.rotation *= 0.95;
        }

        // Handle chaos effects
        this.handleChaosEffects();
    }

    /**
     * Handle chaos-driven effects
     */
    handleChaosEffects() {
        // Spawn random chaos walls
        if (this.chaosSystem.shouldSpawnRandomWall() && this.chaosWalls.length < 3) {
            const newWall = this.getRandomEmptyPosition();
            if (newWall && !positionsEqual(newWall, this.player)) {
                this.chaosWalls.push(newWall);
            }
        }

        // Remove chaos walls when chaos drops below 50
        if (this.chaosSystem.chaosLevel < 50 && this.chaosWalls.length > 0) {
            if (Math.random() < 0.05) { // 5% chance per frame to remove
                this.chaosWalls.pop();
            }
        }

        // Move goal when chaos > 80
        if (this.chaosSystem.effects.goalMoving && Math.random() < 0.01) {
            const newGoal = this.getRandomEmptyPosition();
            if (newGoal && !positionsEqual(newGoal, this.player)) {
                this.goal = newGoal;
            }
        }
    }

    /**
     * Get a random empty position on grid
     */
    getRandomEmptyPosition() {
        const attempts = 20;
        for (let i = 0; i < attempts; i++) {
            const x = randomInt(0, this.gridSize - 1);
            const y = randomInt(0, this.gridSize - 1);
            
            const allWalls = [...this.walls, ...this.chaosWalls];
            const isWall = allWalls.some(wall => wall.x === x && wall.y === y);
            const isPlayer = positionsEqual({ x, y }, this.player);
            const isGoal = positionsEqual({ x, y }, this.goal);
            
            if (!isWall && !isPlayer && !isGoal) {
                return { x, y };
            }
        }
        return null;
    }

    /**
     * Render game
     */
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#0a0e27';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Save context for transformations
        this.ctx.save();

        // Apply screen shake
        const shake = this.chaosSystem.getShakeOffset();
        this.ctx.translate(shake.x, shake.y);

        // Apply grid rotation (slight rotation at high chaos)
        if (this.rotation !== 0) {
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;
            this.ctx.translate(centerX, centerY);
            this.ctx.rotate(this.rotation * 0.05); // Small rotation
            this.ctx.translate(-centerX, -centerY);
        }

        // Draw grid
        this.drawGrid();

        // Draw walls
        this.drawWalls();

        // Draw chaos walls (different color)
        this.drawChaosWalls();

        // Draw goal
        this.drawGoal();

        // Draw player
        this.drawPlayer();

        // Restore context
        this.ctx.restore();
    }

    /**
     * Draw grid lines
     */
    drawGrid() {
        this.ctx.strokeStyle = getChaosColor(this.chaosSystem.chaosLevel);
        this.ctx.lineWidth = 2;
        this.ctx.globalAlpha = 0.3;

        for (let i = 0; i <= this.gridSize; i++) {
            // Vertical lines
            const x = this.padding + i * this.tileSize;
            this.ctx.beginPath();
            this.ctx.moveTo(x, this.padding);
            this.ctx.lineTo(x, this.padding + this.gridSize * this.tileSize);
            this.ctx.stroke();

            // Horizontal lines
            const y = this.padding + i * this.tileSize;
            this.ctx.beginPath();
            this.ctx.moveTo(this.padding, y);
            this.ctx.lineTo(this.padding + this.gridSize * this.tileSize, y);
            this.ctx.stroke();
        }

        this.ctx.globalAlpha = 1;
    }

    /**
     * Draw permanent walls
     */
    drawWalls() {
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.strokeStyle = '#34495e';
        this.ctx.lineWidth = 3;

        this.walls.forEach(wall => {
            const x = this.padding + wall.x * this.tileSize;
            const y = this.padding + wall.y * this.tileSize;
            
            this.ctx.fillRect(x + 5, y + 5, this.tileSize - 10, this.tileSize - 10);
            this.ctx.strokeRect(x + 5, y + 5, this.tileSize - 10, this.tileSize - 10);
        });
    }

    /**
     * Draw chaos-spawned walls
     */
    drawChaosWalls() {
        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.strokeStyle = '#ff8787';
        this.ctx.lineWidth = 3;
        
        // Add pulsing effect
        const pulse = Math.sin(Date.now() / 200) * 0.1 + 0.9;
        this.ctx.globalAlpha = pulse;

        this.chaosWalls.forEach(wall => {
            const x = this.padding + wall.x * this.tileSize;
            const y = this.padding + wall.y * this.tileSize;
            
            this.ctx.fillRect(x + 5, y + 5, this.tileSize - 10, this.tileSize - 10);
            this.ctx.strokeRect(x + 5, y + 5, this.tileSize - 10, this.tileSize - 10);
        });

        this.ctx.globalAlpha = 1;
    }

    /**
     * Draw goal tile
     */
    drawGoal() {
        const x = this.padding + this.goal.x * this.tileSize + this.tileSize / 2;
        const y = this.padding + this.goal.y * this.tileSize + this.tileSize / 2;
        
        // Pulsing effect
        const pulse = Math.sin(this.goalPulse) * 5 + 40;

        // Outer glow
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, pulse + 10);
        gradient.addColorStop(0, 'rgba(79, 172, 254, 0.6)');
        gradient.addColorStop(1, 'rgba(79, 172, 254, 0)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x - pulse - 10, y - pulse - 10, (pulse + 10) * 2, (pulse + 10) * 2);

        // Inner star
        this.ctx.fillStyle = '#4facfe';
        this.ctx.beginPath();
        this.drawStar(x, y, 5, pulse / 2, pulse / 4);
        this.ctx.fill();
        
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    /**
     * Draw star shape
     */
    drawStar(cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;

        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy - outerRadius);

        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            this.ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            this.ctx.lineTo(x, y);
            rot += step;
        }

        this.ctx.lineTo(cx, cy - outerRadius);
        this.ctx.closePath();
    }

    /**
     * Draw player
     */
    drawPlayer() {
        const x = this.padding + this.player.x * this.tileSize + this.tileSize / 2;
        const y = this.padding + this.player.y * this.tileSize + this.tileSize / 2;
        const size = 35;

        // Player color based on chaos
        const playerColor = getChaosColor(this.chaosSystem.chaosLevel);

        // Shadow/glow
        this.ctx.shadowColor = playerColor;
        this.ctx.shadowBlur = 15;

        // Draw circle
        this.ctx.fillStyle = playerColor;
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.fill();

        // Inner circle
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(x, y, size / 2, 0, Math.PI * 2);
        this.ctx.fill();

        // Reset shadow
        this.ctx.shadowBlur = 0;
    }

    /**
     * Win condition
     */
    win() {
        this.isWon = true;
        document.getElementById('winModal').classList.remove('hidden');
    }

    /**
     * Reset game
     */
    reset() {
        this.initializeLevel();
        this.chaosSystem.reset();
        this.rotation = 0;
        document.getElementById('winModal').classList.add('hidden');
    }
}
