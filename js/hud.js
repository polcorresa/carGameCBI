// HUD (Heads-Up Display) Manager
class HUD {
    constructor() {
        this.speedElement = document.getElementById('speed-value');
        this.rpmElement = document.getElementById('rpm-value');
        this.rpmFill = document.getElementById('rpm-fill');
        this.brakeFill = document.getElementById('brake-fill');
        this.distanceElement = document.getElementById('distance-value');
        this.targetDistanceElement = document.getElementById('target-distance');
        this.crashElement = document.getElementById('crash-value');
        
        // Set target distance from config
        this.targetDistanceElement.textContent = GAME_CONFIG.TARGET_DISTANCE;
    }
    
    update(playerCar, distanceKm, crashCount) {
        // Update speed
        this.speedElement.textContent = Math.round(playerCar.speed);
        
        // Update RPM
        this.rpmElement.textContent = Math.round(playerCar.rpm);
        const rpmPercent = ((playerCar.rpm - GAME_CONFIG.IDLE_RPM) / 
            (GAME_CONFIG.MAX_RPM - GAME_CONFIG.IDLE_RPM)) * 100;
        this.rpmFill.style.width = Math.max(0, Math.min(100, rpmPercent)) + '%';
        
        // Change RPM bar color when high
        if (rpmPercent > 80) {
            this.rpmFill.style.background = 'linear-gradient(90deg, #ff6b6b, #ff0000)';
        } else {
            this.rpmFill.style.background = 'linear-gradient(90deg, #00d4ff, #00ff88)';
        }
        
        // Update brake
        const brakePercent = playerCar.brakeAmount * 100;
        this.brakeFill.style.width = brakePercent + '%';
        
        // Update distance
        this.distanceElement.textContent = distanceKm.toFixed(2);
        
        // Update crash counter
        this.crashElement.textContent = crashCount;
    }
}
