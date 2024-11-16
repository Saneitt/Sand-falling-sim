const canvas = document.getElementById("sandbox");
const ctx = canvas.getContext("2d");

// Grid settings
const cellSize = 3; // Smaller particle size
const gridWidth = Math.floor(canvas.width / cellSize); // Adjusted grid resolution
const gridHeight = Math.floor(canvas.height / cellSize);
let grid = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(null));

// Color batch settings
let currentColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
let particlesInBatch = 0;
const batchSize = 50;

// Mouse state
let isDragging = false;
let mouseX = 0;
let mouseY = 0;
let sandInterval = null;

// Utility function to draw the grid
function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            const cell = grid[y][x];
            if (cell) {
                ctx.fillStyle = cell;
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
    }
}

// Sand falling mechanics
function simulate() {
    for (let y = gridHeight - 2; y >= 0; y--) {
        for (let x = 0; x < gridWidth; x++) {
            if (grid[y][x]) {
                if (!grid[y + 1][x]) {
                    // Move straight down
                    grid[y + 1][x] = grid[y][x];
                    grid[y][x] = null;
                } else if (x > 0 && !grid[y + 1][x - 1]) {
                    // Move diagonally left
                    grid[y + 1][x - 1] = grid[y][x];
                    grid[y][x] = null;
                } else if (x < gridWidth - 1 && !grid[y + 1][x + 1]) {
                    // Move diagonally right
                    grid[y + 1][x + 1] = grid[y][x];
                    grid[y][x] = null;
                }
            }
        }
    }
}

// Check for rows of same-color sand and remove them
function checkRows() {
    for (let y = 0; y < gridHeight; y++) {
        if (grid[y].every(cell => cell && cell === grid[y][0])) {
            grid.splice(y, 1);
            grid.unshift(Array(gridWidth).fill(null));
        }
    }
}

// Add sand particle near cursor
function addSandAroundCursor(x, y) {
    const spread = 2; // How far particles spread from the cursor
    for (let i = 0; i < 3; i++) { // Spawn multiple particles for each interval
        const offsetX = x + Math.floor(Math.random() * (2 * spread + 1) - spread);
        const offsetY = y + Math.floor(Math.random() * (2 * spread + 1) - spread);
        if (offsetX >= 0 && offsetX < gridWidth && offsetY >= 0 && offsetY < gridHeight) {
            for (let py = 0; py < gridHeight; py++) { // Drop particle from top if space is empty
                if (!grid[py][offsetX]) {
                    grid[py][offsetX] = currentColor;
                    particlesInBatch++;
                    if (particlesInBatch >= batchSize) {
                        particlesInBatch = 0;
                        currentColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
                    }
                    break;
                }
            }
        }
    }
}

// Start spawning sand
function startSandSpawn() {
    if (!sandInterval) {
        sandInterval = setInterval(() => {
            const x = Math.floor(mouseX / cellSize);
            const y = Math.floor(mouseY / cellSize);
            addSandAroundCursor(x, y);
        }, 7); // Faster spawn rate
    }
}

// Stop spawning sand
function stopSandSpawn() {
    clearInterval(sandInterval);
    sandInterval = null;
}

// Handle mouse events
canvas.addEventListener("mousedown", () => {
    isDragging = true;
    startSandSpawn();
});

canvas.addEventListener("mouseup", () => {
    isDragging = false;
    stopSandSpawn();
});

canvas.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
});

// Reset button functionality
const resetButton = document.getElementById("resetButton");
resetButton.addEventListener("click", () => {
    grid = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(null));
});

// Main game loop
function gameLoop() {
    simulate();
    checkRows();
    drawGrid();
    requestAnimationFrame(gameLoop);
}

// Start the simulation
gameLoop();
