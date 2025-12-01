# Highway Racer 🏎️

A simple 3-lane highway car game built for booth demonstrations. Avoid traffic, manage your speed, and compete for the highest score on the leaderboard!

## How to Run

1. Open `index.html` in any modern web browser (Chrome, Firefox, Safari, Edge)
2. No server or installation required - just double-click the file!

```bash
# Or from terminal:
open index.html
```

## How to Play

### Controls
- **← / → or A / D** - Change lanes
- **↑ or W** - Accelerate
- **↓ or S** - Brake
- **Enter / Space** - Start game (from menu)

### Gamepad Support
- **Left Stick / D-pad** - Change lanes
- **Right Trigger (RT)** - Accelerate
- **Left Trigger (LT)** - Brake
- **A Button** - Accelerate (alternative)
- **B Button** - Brake (alternative)

### Objective
Complete 3.5 km while maximizing your score!

### Scoring
- **Base Score**: Faster completion = higher score (10,000 - time × 100)
- **RPM Penalty**: -5 pts per second above 3500 RPM
- **Crash Penalty**: -250 pts per crash (-1000 extra if above 180 km/h)
- **Hard Brake Penalty**: -30 pts per hard brake

## Leaderboard

The leaderboard persists across page refreshes using localStorage. Perfect for booth events where multiple players compete sequentially!

### Reset Leaderboard

To clear all scores, enter **`RESET1234`** as the player name and click START. An alert will confirm the reset.

## Configuration

Game settings can be adjusted in `js/constants.js`:
- `TARGET_DISTANCE` - Race length in km (default: 3.5)
- `MAX_SPEED` - Maximum speed in km/h (default: 240)
- `GAME_SPEED_MULTIPLIER` - Visual game speed (default: 2.0)
- `OBSTACLE_SPAWN_INTERVAL` - Traffic frequency in ms (default: 1500)

## File Structure

```
carGame/
├── index.html          # Main HTML file
├── css/
│   └── style.css       # Styling
├── js/
│   ├── constants.js    # Game configuration
│   ├── car.js          # Player car physics
│   ├── obstacle.js     # Traffic cars
│   ├── collision.js    # Collision detection
│   ├── controls.js     # Keyboard/gamepad input
│   ├── hud.js          # Speed/RPM/brake display
│   ├── leaderboard.js  # Score persistence
│   └── game.js         # Main game loop
└── README.md
```

## License

MIT
