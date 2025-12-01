// Main Game Class
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = GAME_CONFIG.CANVAS_WIDTH;
        this.canvas.height = GAME_CONFIG.CANVAS_HEIGHT;
        
        // Game objects
        this.player = new PlayerCar();
        this.obstacleManager = new ObstacleManager();
        this.inputController = new InputController();
        this.hud = new HUD();
        
        // Game state
        this.gameState = 'menu'; // menu, playing, win
        this.distanceTraveled = 0; // in km
        this.roadOffset = 0;
        this.crashCount = 0;
        this.crashCooldown = 0; // Prevent multiple crash counts from same collision
        this.finishLineY = -200; // Y position of finish line (off screen initially)
        this.finishLineActive = false; // Whether finish line has been triggered
        
        // Stats tracking
        this.timeAbove3500Rpm = 0; // Time in ms spent above 3500 RPM
        this.hardBrakeCount = 0; // Number of hard brakes
        this.wasHardBraking = false; // Track if currently hard braking
        this.raceTime = 0; // Total race time in ms
        
        // Timing
        this.lastTime = 0;
        this.currentTime = 0;
        
        // Track previous key states for lane change detection
        this.prevLeft = false;
        this.prevRight = false;
        
        // UI Elements
        this.overlay = document.getElementById('game-overlay');
        this.overlayTitle = document.getElementById('overlay-title');
        this.overlayMessage = document.getElementById('overlay-message');
        this.startBtn = document.getElementById('start-btn');
        
        this.setupEventListeners();
        this.showMenu();
        
        // Start game loop
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    setupEventListeners() {
        this.startBtn.addEventListener('click', () => {
            if (this.gameState === 'menu' || this.gameState === 'gameover' || this.gameState === 'win') {
                this.startGame();
            }
        });
        
        // Also allow Enter/Space to start
        window.addEventListener('keydown', (e) => {
            if ((e.code === 'Enter' || e.code === 'Space') && 
                (this.gameState === 'menu' || this.gameState === 'gameover' || this.gameState === 'win')) {
                this.startGame();
            }
        });
    }
    
    showMenu() {
        this.overlay.classList.remove('hidden', 'win', 'lose');
        this.overlayTitle.textContent = 'Highway Racer';
        this.overlayMessage.textContent = 'Avoid traffic and reach the target distance!';
        this.startBtn.textContent = 'START';
    }
    
    showGameOver() {
        // No longer used - crashes don't end the game
        this.overlay.classList.remove('hidden', 'win');
        this.overlay.classList.add('lose');
        this.overlayTitle.textContent = 'CRASH!';
        this.overlayMessage.textContent = `You traveled ${this.distanceTraveled.toFixed(2)} km`;
        this.startBtn.textContent = 'TRY AGAIN';
    }
    
    showWin() {
        this.overlay.classList.remove('hidden', 'lose');
        this.overlay.classList.add('win');
        this.overlayTitle.textContent = 'RACE COMPLETE!';
        
        // Calculate score
        const raceTimeSeconds = this.raceTime / 1000;
        const timeAbove3500Seconds = this.timeAbove3500Rpm / 1000;
        
        // Base score: faster time = higher score (target ~60 seconds for good run)
        // 10000 points for 30 seconds, decreasing as time increases
        const baseScore = Math.max(0, Math.round(10000 - (raceTimeSeconds * 100)));
        
        // RPM penalty: -5 points per second above 3500 RPM
        const rpmPenalty = Math.round(timeAbove3500Seconds * 5);
        
        // Crash penalty: -250 points per crash
        const crashPenalty = this.crashCount * 250;
        
        // Hard brake penalty: -30 points per hard brake
        const hardBrakePenalty = this.hardBrakeCount * 30;
        
        // Final score (minimum 0)
        const finalScore = Math.max(0, baseScore - rpmPenalty - crashPenalty - hardBrakePenalty);
        
        this.overlayMessage.innerHTML = `
            <strong>Time:</strong> ${raceTimeSeconds.toFixed(1)}s<br><br>
            <strong>Score Breakdown:</strong><br>
            Base score (speed): ${baseScore} pts<br>
            RPM penalty (${timeAbove3500Seconds.toFixed(1)}s above 3500): -${rpmPenalty} pts<br>
            Crash penalty (${this.crashCount} crashes): -${crashPenalty} pts<br>
            Hard brake penalty (${this.hardBrakeCount} brakes): -${hardBrakePenalty} pts<br><br>
            <strong style="font-size: 24px; color: #00ff00;">FINAL SCORE: ${finalScore}</strong>
        `;
        this.startBtn.textContent = 'PLAY AGAIN';
    }
    
    startGame() {
        this.gameState = 'playing';
        this.distanceTraveled = 0;
        this.roadOffset = 0;
        this.crashCount = 0;
        this.crashCooldown = 0;
        this.finishLineY = -200;
        this.finishLineActive = false;
        this.timeAbove3500Rpm = 0;
        this.hardBrakeCount = 0;
        this.wasHardBraking = false;
        this.raceTime = 0;
        this.player.reset();
        this.obstacleManager.reset();
        this.overlay.classList.add('hidden');
    }
    
    gameLoop(timestamp) {
        // Calculate delta time
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        this.currentTime = timestamp;
        
        // Update
        this.update(deltaTime);
        
        // Draw
        this.draw();
        
        // Continue loop
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update(deltaTime) {
        if (this.gameState !== 'playing') return;
        
        // Cap delta time to prevent huge jumps
        const dt = Math.min(deltaTime, 50);
        
        // Update input controller
        this.inputController.update();
        
        // Handle lane changes (only on key press, not hold)
        const leftPressed = this.inputController.isLeft();
        const rightPressed = this.inputController.isRight();
        
        if (leftPressed && !this.prevLeft) {
            this.player.moveLeft();
        }
        if (rightPressed && !this.prevRight) {
            this.player.moveRight();
        }
        
        this.prevLeft = leftPressed;
        this.prevRight = rightPressed;
        
        // Handle acceleration/braking
        this.player.accelerate(this.inputController.isAccelerating());
        this.player.brake(this.inputController.isBraking());
        
        // Update player
        this.player.update(dt);
        
        // Track race time
        this.raceTime += dt;
        
        // Track time above 3500 RPM
        if (this.player.rpm > 3500) {
            this.timeAbove3500Rpm += dt;
        }
        
        // Track hard braking (brake amount > 70%)
        const isHardBraking = this.player.brakeAmount > 0.7;
        if (isHardBraking && !this.wasHardBraking) {
            this.hardBrakeCount++;
        }
        this.wasHardBraking = isHardBraking;
        
        // Update distance based on speed (with game speed multiplier for more fun)
        // speed is in km/h, we need to convert to km per frame
        const gameSpeed = this.player.speed * GAME_CONFIG.GAME_SPEED_MULTIPLIER;
        const speedInKmPerMs = gameSpeed / 3600000; // km/h to km/ms
        this.distanceTraveled += speedInKmPerMs * dt;
        
        // Update road animation (uses game speed for visual effect)
        const roadSpeed = (gameSpeed / 3.6) * 0.5; // Convert to pixels
        this.roadOffset += roadSpeed * (dt / 16.67);
        if (this.roadOffset > GAME_CONFIG.LANE_LINE_HEIGHT + GAME_CONFIG.LANE_LINE_GAP) {
            this.roadOffset = 0;
        }
        
        // Update obstacles (uses game speed for faster obstacle movement)
        this.obstacleManager.update(gameSpeed, dt, this.currentTime, this.distanceTraveled);
        
        // Update crash cooldown
        if (this.crashCooldown > 0) {
            this.crashCooldown -= dt;
        }
        
        // Check collisions
        const collision = CollisionDetector.checkPlayerCollision(this.player, this.obstacleManager);
        if (collision.collided && this.crashCooldown <= 0) {
            this.crashCount++;
            this.crashCooldown = 1000; // 1 second cooldown before next crash can count
            // Remove the obstacle that was hit
            const index = this.obstacleManager.obstacles.indexOf(collision.obstacle);
            if (index > -1) {
                this.obstacleManager.obstacles.splice(index, 1);
            }
        }
        
        // Check for approaching finish line - trigger when close to target distance
        if (this.distanceTraveled >= GAME_CONFIG.TARGET_DISTANCE - 0.05 && !this.finishLineActive) {
            // Start showing finish line at top of screen
            this.finishLineY = -50;
            this.finishLineActive = true;
        }
        
        // Move finish line towards player when active
        if (this.finishLineActive) {
            const roadSpeed = (this.player.speed / 3.6) * 0.5;
            this.finishLineY += roadSpeed * (dt / 16.67);
            
            // Check win condition (finish line reaches player car)
            if (this.finishLineY >= this.player.y) {
                this.gameState = 'win';
                this.showWin();
                return;
            }
        }
        
        // Update HUD
        this.hud.update(this.player, this.distanceTraveled, this.crashCount);
    }
    
    draw() {
        const ctx = this.ctx;
        
        // Clear canvas
        ctx.fillStyle = GAME_CONFIG.COLORS.GRASS;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw road
        this.drawRoad();
        
        // Draw obstacles
        this.obstacleManager.draw(ctx);
        
        // Draw finish line if active
        if (this.finishLineActive) {
            this.drawFinishLine();
        }
        
        // Draw player
        this.player.draw(ctx);
        
        // Draw crash flash effect
        if (this.crashCooldown > 800) {
            ctx.fillStyle = `rgba(255, 0, 0, ${(this.crashCooldown - 800) / 200 * 0.3})`;
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
    
    drawFinishLine() {
        const ctx = this.ctx;
        const y = this.finishLineY;
        const lineHeight = 30;
        const squareSize = 15;
        
        // Draw checkered pattern
        for (let row = 0; row < 2; row++) {
            for (let i = 0; i < Math.ceil(GAME_CONFIG.ROAD_WIDTH / squareSize); i++) {
                const isWhite = (i + row) % 2 === 0;
                ctx.fillStyle = isWhite ? '#ffffff' : '#000000';
                ctx.fillRect(
                    GAME_CONFIG.ROAD_LEFT + i * squareSize,
                    y + row * squareSize,
                    squareSize,
                    squareSize
                );
            }
        }
        
        // "FINISH" text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeText('FINISH', this.canvas.width / 2, y - 10);
        ctx.fillText('FINISH', this.canvas.width / 2, y - 10);
    }
    
    drawRoad() {
        const ctx = this.ctx;
        
        // Road surface
        ctx.fillStyle = GAME_CONFIG.COLORS.ROAD;
        ctx.fillRect(
            GAME_CONFIG.ROAD_LEFT, 
            0, 
            GAME_CONFIG.ROAD_WIDTH, 
            this.canvas.height
        );
        
        // Road edges (white lines)
        ctx.strokeStyle = GAME_CONFIG.COLORS.ROAD_EDGE;
        ctx.lineWidth = 5;
        
        ctx.beginPath();
        ctx.moveTo(GAME_CONFIG.ROAD_LEFT, 0);
        ctx.lineTo(GAME_CONFIG.ROAD_LEFT, this.canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(GAME_CONFIG.ROAD_RIGHT, 0);
        ctx.lineTo(GAME_CONFIG.ROAD_RIGHT, this.canvas.height);
        ctx.stroke();
        
        // Lane dividers (dashed yellow lines)
        ctx.strokeStyle = GAME_CONFIG.COLORS.LANE_LINE;
        ctx.lineWidth = GAME_CONFIG.LANE_LINE_WIDTH;
        ctx.setLineDash([GAME_CONFIG.LANE_LINE_HEIGHT, GAME_CONFIG.LANE_LINE_GAP]);
        ctx.lineDashOffset = -this.roadOffset;
        
        for (let i = 1; i < GAME_CONFIG.LANE_COUNT; i++) {
            const x = GAME_CONFIG.ROAD_LEFT + i * GAME_CONFIG.LANE_WIDTH;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.canvas.height);
            ctx.stroke();
        }
        
        ctx.setLineDash([]);
    }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
