// Game Constants
const GAME_CONFIG = {
    // Canvas dimensions
    CANVAS_WIDTH: 400,
    CANVAS_HEIGHT: 700,
    
    // Road configuration
    ROAD_WIDTH: 300,
    LANE_COUNT: 3,
    LANE_LINE_WIDTH: 4,
    LANE_LINE_HEIGHT: 40,
    LANE_LINE_GAP: 30,
    
    // Player car
    CAR_WIDTH: 50,
    CAR_HEIGHT: 90,
    
    // Physics
    MAX_SPEED: 240,        // km/h (at 8000 RPM)
    MIN_SPEED: 0,
    ACCELERATION: 80,       // km/h per second
    DECELERATION: 40,       // natural slowdown
    BRAKE_POWER: 150,       // km/h per second when braking
    LANE_CHANGE_SPEED: 8,   // pixels per frame
    
    // RPM
    MAX_RPM: 8000,
    IDLE_RPM: 800,
    
    // Obstacles
    OBSTACLE_WIDTH: 50,
    OBSTACLE_HEIGHT: 90,
    OBSTACLE_BASE_SPEED: 60,   // km/h (slower than player)
    OBSTACLE_SPAWN_INTERVAL: 1500, // ms
    OBSTACLE_SPAWN_VARIANCE: 500,  // ms variance
    
    // Game
    TARGET_DISTANCE: 5,     // km
    PIXELS_PER_KM: 50000,   // conversion factor
    
    // Colors
    COLORS: {
        ROAD: '#2d2d2d',
        ROAD_EDGE: '#ffffff',
        LANE_LINE: '#ffff00',
        GRASS: '#228B22',
        PLAYER_CAR: '#ff4444',
        PLAYER_CAR_WINDOW: '#87CEEB',
        OBSTACLE_CARS: ['#3498db', '#9b59b6', '#1abc9c', '#f39c12', '#e74c3c', '#95a5a6']
    }
};

// Calculate derived values
GAME_CONFIG.ROAD_LEFT = (GAME_CONFIG.CANVAS_WIDTH - GAME_CONFIG.ROAD_WIDTH) / 2;
GAME_CONFIG.ROAD_RIGHT = GAME_CONFIG.ROAD_LEFT + GAME_CONFIG.ROAD_WIDTH;
GAME_CONFIG.LANE_WIDTH = GAME_CONFIG.ROAD_WIDTH / GAME_CONFIG.LANE_COUNT;

// Lane center positions (x coordinates)
GAME_CONFIG.LANE_CENTERS = [];
for (let i = 0; i < GAME_CONFIG.LANE_COUNT; i++) {
    GAME_CONFIG.LANE_CENTERS[i] = GAME_CONFIG.ROAD_LEFT + GAME_CONFIG.LANE_WIDTH * (i + 0.5);
}
