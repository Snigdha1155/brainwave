// ==========================================
// INVERTED CHAOS - MAIN GAME LOOP
// ==========================================

// Global variables
let game;
let lastFrameTime = Date.now();

/**
 * Initialize game
 */
function init() {
    const canvas = document.getElementById('gameCanvas');
    game = new Game(canvas);

    // Set up event listeners
    setupControls();

    // Start game loop
    gameLoop();
}

/**
 * Set up keyboard and button controls
 */
function setupControls() {
    // Keyboard input
    document.addEventListener('keydown', (e) => {
        if (game.isWon) return;

        switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                game.move('up');
                e.preventDefault();
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                game.move('down');
                e.preventDefault();
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                game.move('left');
                e
