// Player Car Class
class PlayerCar {
    constructor() {
        this.width = GAME_CONFIG.CAR_WIDTH;
        this.height = GAME_CONFIG.CAR_HEIGHT;
        this.currentLane = 1; // Middle lane (0, 1, 2)
        this.targetX = GAME_CONFIG.LANE_CENTERS[this.currentLane];
        this.x = this.targetX;
        this.y = GAME_CONFIG.CANVAS_HEIGHT - this.height - 50;
        
        // Physics
        this.speed = 0;          // Current speed in km/h
        this.rpm = GAME_CONFIG.IDLE_RPM;
        this.targetRpm = GAME_CONFIG.IDLE_RPM;
        this.brakeAmount = 0;    // 0 to 1
        
        // State
        this.isAccelerating = false;
        this.isBraking = false;
    }
    
    reset() {
        this.currentLane = 1;
        this.targetX = GAME_CONFIG.LANE_CENTERS[this.currentLane];
        this.x = this.targetX;
        this.y = GAME_CONFIG.CANVAS_HEIGHT - this.height - 50;
        this.speed = 0;
        this.rpm = GAME_CONFIG.IDLE_RPM;
        this.targetRpm = GAME_CONFIG.IDLE_RPM;
        this.brakeAmount = 0;
        this.isAccelerating = false;
        this.isBraking = false;
    }
    
    moveLeft() {
        if (this.currentLane > 0) {
            this.currentLane--;
            this.targetX = GAME_CONFIG.LANE_CENTERS[this.currentLane];
        }
    }
    
    moveRight() {
        if (this.currentLane < GAME_CONFIG.LANE_COUNT - 1) {
            this.currentLane++;
            this.targetX = GAME_CONFIG.LANE_CENTERS[this.currentLane];
        }
    }
    
    accelerate(active) {
        this.isAccelerating = active;
    }
    
    brake(active) {
        this.isBraking = active;
    }
    
    update(deltaTime) {
        const dt = deltaTime / 1000; // Convert to seconds
        
        // Handle acceleration/braking
        if (this.isAccelerating && !this.isBraking) {
            this.speed += GAME_CONFIG.ACCELERATION * dt;
            this.brakeAmount = Math.max(0, this.brakeAmount - dt * 5);
        } else if (this.isBraking) {
            this.speed -= GAME_CONFIG.BRAKE_POWER * dt;
            this.brakeAmount = Math.min(1, this.brakeAmount + dt * 5);
        } else {
            // Natural deceleration
            this.speed -= GAME_CONFIG.DECELERATION * dt;
            this.brakeAmount = Math.max(0, this.brakeAmount - dt * 3);
        }
        
        // Clamp speed
        this.speed = Math.max(GAME_CONFIG.MIN_SPEED, Math.min(GAME_CONFIG.MAX_SPEED, this.speed));
        
        // Calculate RPM directly from speed (single gear ratio)
        // At 3000 RPM = 120 km/h
        // RPM = 800 + (speed * (3000 - 800) / 120) = 800 + (speed * 18.33)
        this.targetRpm = GAME_CONFIG.IDLE_RPM + (this.speed * ((3000 - GAME_CONFIG.IDLE_RPM) / 120));
        
        // Add slight RPM boost when accelerating (engine working harder)
        if (this.isAccelerating && !this.isBraking) {
            this.targetRpm += 300;
        }
        
        // Clamp RPM to max
        this.targetRpm = Math.min(this.targetRpm, GAME_CONFIG.MAX_RPM);
        
        // Smooth RPM transition
        const rpmChangeRate = 1500 * dt; // RPM change per second
        if (this.rpm < this.targetRpm) {
            this.rpm = Math.min(this.targetRpm, this.rpm + rpmChangeRate);
        } else {
            this.rpm = Math.max(this.targetRpm, this.rpm - rpmChangeRate * 2);
        }
        
        if (this.speed < 1) {
            this.rpm = GAME_CONFIG.IDLE_RPM;
        }
        
        // Smooth lane change - snap when close to prevent vibration
        const dx = this.targetX - this.x;
        if (Math.abs(dx) > GAME_CONFIG.LANE_CHANGE_SPEED) {
            this.x += Math.sign(dx) * GAME_CONFIG.LANE_CHANGE_SPEED;
        } else {
            this.x = this.targetX;
        }
    }
    
    draw(ctx) {
        const x = this.x - this.width / 2;
        const y = this.y;
        
        // Car body
        ctx.fillStyle = GAME_CONFIG.COLORS.PLAYER_CAR;
        
        // Main body with rounded corners
        ctx.beginPath();
        ctx.roundRect(x, y, this.width, this.height, 8);
        ctx.fill();
        
        // Windshield
        ctx.fillStyle = GAME_CONFIG.COLORS.PLAYER_CAR_WINDOW;
        ctx.beginPath();
        ctx.roundRect(x + 8, y + 15, this.width - 16, 25, 4);
        ctx.fill();
        
        // Rear window
        ctx.beginPath();
        ctx.roundRect(x + 8, y + this.height - 30, this.width - 16, 18, 4);
        ctx.fill();
        
        // Headlights
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(x + 5, y, 10, 5);
        ctx.fillRect(x + this.width - 15, y, 10, 5);
        
        // Taillights
        ctx.fillStyle = this.isBraking ? '#ff0000' : '#880000';
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
