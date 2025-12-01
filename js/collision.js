// Collision Detection
class CollisionDetector {
    // AABB (Axis-Aligned Bounding Box) collision detection
    static checkCollision(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    }
    
    // Check player against all obstacles
    static checkPlayerCollision(player, obstacleManager) {
        const playerBounds = player.getBounds();
        const obstacles = obstacleManager.getObstacles();
        
        for (const obstacle of obstacles) {
            const obstacleBounds = obstacle.getBounds();
            if (this.checkCollision(playerBounds, obstacleBounds)) {
                return {
                    collided: true,
                    obstacle: obstacle
                };
            }
        }
        
        return {
            collided: false,
            obstacle: null
        };
    }
}
