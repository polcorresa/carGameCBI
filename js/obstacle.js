// Obstacle Car Class
class ObstacleCar {
    constructor(lane) {
        this.width = GAME_CONFIG.OBSTACLE_WIDTH;
        this.height = GAME_CONFIG.OBSTACLE_HEIGHT;
        this.lane = lane;
        this.x = GAME_CONFIG.LANE_CENTERS[lane];
        this.y = -this.height; // Start above screen
        this.speed = GAME_CONFIG.OBSTACLE_BASE_SPEED + Math.random() * 40; // Varying speeds
        this.color = GAME_CONFIG.COLORS.OBSTACLE_CARS[
            Math.floor(Math.random() * GAME_CONFIG.COLORS.OBSTACLE_CARS.length)
        ];
    }
    
    update(playerSpeed, deltaTime) {
        // Move relative to player speed
        // If player is faster, obstacles move down; if slower, they move up
        const relativeSpeed = playerSpeed - this.speed;
        const pixelsPerSecond = (relativeSpeed / 3.6) * 15; // Convert to pixels
        this.y += pixelsPerSecond * (deltaTime / 1000);
    }
    
    isOffScreen() {
        return this.y > GAME_CONFIG.CANVAS_HEIGHT + 100 || this.y < -200;
    }
    
    draw(ctx) {
        const x = this.x - this.width / 2;
        const y = this.y;
        
        // Car body
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.roundRect(x, y, this.width, this.height, 8);
        ctx.fill();
        
        // Windshield
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.roundRect(x + 8, y + 15, this.width - 16, 25, 4);
        ctx.fill();
        
        // Rear window
        ctx.beginPath();
        ctx.roundRect(x + 8, y + this.height - 30, this.width - 16, 18, 4);
        ctx.fill();
        
        // Headlights (at back since we see from above/behind)
        ctx.fillStyle = '#ff6666';
        ctx.fillRect(x + 5, y + this.height - 5, 10, 5);
        ctx.fillRect(x + this.width - 15, y + this.height - 5, 10, 5);
    }
    
    getBounds() {
        return {
            x: this.x - this.width / 2 + 5,
            y: this.y + 5,
            width: this.width - 10,
            height: this.height - 10
        };
    }
}

// Obstacle Manager
class ObstacleManager {
    constructor() {
        this.obstacles = [];
        this.lastSpawnTime = 0;
        this.spawnInterval = GAME_CONFIG.OBSTACLE_SPAWN_INTERVAL;
    }
    
    reset() {
        this.obstacles = [];
        this.lastSpawnTime = 0;
        this.spawnInterval = GAME_CONFIG.OBSTACLE_SPAWN_INTERVAL;
    }
    
    update(playerSpeed, deltaTime, currentTime, distanceTraveled) {
        // Spawn new obstacles
        if (currentTime - this.lastSpawnTime > this.spawnInterval) {
            this.spawnObstacle(distanceTraveled);
            this.lastSpawnTime = currentTime;
            // Add some randomness to spawn interval
            this.spawnInterval = GAME_CONFIG.OBSTACLE_SPAWN_INTERVAL + 
                (Math.random() - 0.5) * 2 * GAME_CONFIG.OBSTACLE_SPAWN_VARIANCE;
            
            // Increase difficulty over distance
            const difficultyMultiplier = 1 - (distanceTraveled / GAME_CONFIG.TARGET_DISTANCE) * 0.4;
            this.spawnInterval *= Math.max(0.5, difficultyMultiplier);
        }
        
        // Update all obstacles
        this.obstacles.forEach(obstacle => {
            obstacle.update(playerSpeed, deltaTime);
        });
        
        // Remove off-screen obstacles
        this.obstacles = this.obstacles.filter(obstacle => !obstacle.isOffScreen());
    }
    
    spawnObstacle(distanceTraveled) {
        // Choose random lane
        const lane = Math.floor(Math.random() * GAME_CONFIG.LANE_COUNT);
        
        // Check if lane is clear near spawn point
        const isClear = !this.obstacles.some(obs => 
            obs.lane === lane && obs.y < 100
        );
        
        if (isClear) {
            this.obstacles.push(new ObstacleCar(lane));
        }
        
        // Sometimes spawn two cars at once for more challenge
        if (distanceTraveled > GAME_CONFIG.TARGET_DISTANCE * 0.3 && Math.random() > 0.7) {
            const secondLane = (lane + 1 + Math.floor(Math.random() * 2)) % GAME_CONFIG.LANE_COUNT;
            if (secondLane !== lane) {
                const isSecondClear = !this.obstacles.some(obs => 
                    obs.lane === secondLane && obs.y < 150
                );
                if (isSecondClear) {
                    this.obstacles.push(new ObstacleCar(secondLane));
                }
            }
        }
    }
    
    draw(ctx) {
        this.obstacles.forEach(obstacle => obstacle.draw(ctx));
    }
    
    getObstacles() {
        return this.obstacles;
    }
}
