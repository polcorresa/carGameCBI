// Input Controller - Handles keyboard and gamepad input
class InputController {
    constructor() {
        this.keys = {
            left: false,
            right: false,
            up: false,
            down: false
        };
        
        this.keyJustPressed = {
            left: false,
            right: false
        };
        
        this.previousKeys = {
            left: false,
            right: false
        };
        
        this.gamepadConnected = false;
        this.gamepadIndex = null;
        this.gamepadDeadzone = 0.3;
        this.gamepadAxisCooldown = 0;
        
        this.setupKeyboardListeners();
        this.setupGamepadListeners();
    }
    
    setupKeyboardListeners() {
        window.addEventListener('keydown', (e) => {
            this.handleKey(e.code, true);
            // Prevent scrolling with arrow keys
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
                e.preventDefault();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.handleKey(e.code, false);
        });
    }
    
    handleKey(code, isPressed) {
        switch (code) {
            case 'ArrowLeft':
            case 'KeyA':
                this.keys.left = isPressed;
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.keys.right = isPressed;
                break;
            case 'ArrowUp':
            case 'KeyW':
                this.keys.up = isPressed;
                break;
            case 'ArrowDown':
            case 'KeyS':
                this.keys.down = isPressed;
                break;
        }
    }
    
    setupGamepadListeners() {
        window.addEventListener('gamepadconnected', (e) => {
            console.log('Gamepad connected:', e.gamepad.id);
            this.gamepadConnected = true;
            this.gamepadIndex = e.gamepad.index;
        });
        
        window.addEventListener('gamepaddisconnected', (e) => {
            console.log('Gamepad disconnected:', e.gamepad.id);
            if (e.gamepad.index === this.gamepadIndex) {
                this.gamepadConnected = false;
                this.gamepadIndex = null;
            }
        });
    }
    
    pollGamepad() {
        if (!this.gamepadConnected || this.gamepadIndex === null) return;
        
        const gamepads = navigator.getGamepads();
        const gp = gamepads[this.gamepadIndex];
        
        if (!gp) return;
        
        // Left stick X-axis for steering (axes[0])
        const leftStickX = gp.axes[0];
        
        // Handle lane changes with cooldown to prevent rapid switching
        if (this.gamepadAxisCooldown <= 0) {
            if (leftStickX < -this.gamepadDeadzone) {
                this.keys.left = true;
                this.keys.right = false;
                this.gamepadAxisCooldown = 15; // frames
            } else if (leftStickX > this.gamepadDeadzone) {
                this.keys.right = true;
                this.keys.left = false;
                this.gamepadAxisCooldown = 15;
            }
        } else {
            this.gamepadAxisCooldown--;
            if (Math.abs(leftStickX) < this.gamepadDeadzone) {
                this.gamepadAxisCooldown = 0;
                this.keys.left = false;
                this.keys.right = false;
            }
        }
        
        // D-pad
        if (gp.buttons[14] && gp.buttons[14].pressed) { // D-pad left
            this.keys.left = true;
        }
        if (gp.buttons[15] && gp.buttons[15].pressed) { // D-pad right
            this.keys.right = true;
        }
        
        // Right trigger (RT) for accelerate - axes[5] or buttons[7]
        if (gp.buttons[7]) {
            this.keys.up = gp.buttons[7].value > 0.1 || gp.buttons[7].pressed;
        }
        
        // Left trigger (LT) for brake - axes[4] or buttons[6]
        if (gp.buttons[6]) {
            this.keys.down = gp.buttons[6].value > 0.1 || gp.buttons[6].pressed;
        }
        
        // A button for accelerate (alternative)
        if (gp.buttons[0] && gp.buttons[0].pressed) {
            this.keys.up = true;
        }
        
        // B button for brake (alternative)
        if (gp.buttons[1] && gp.buttons[1].pressed) {
            this.keys.down = true;
        }
    }
    
    update() {
        // Store previous state
        this.previousKeys.left = this.keyJustPressed.left;
        this.previousKeys.right = this.keyJustPressed.right;
        
        // Detect just pressed (for lane changes)
        this.keyJustPressed.left = this.keys.left && !this.previousKeys.left;
        this.keyJustPressed.right = this.keys.right && !this.previousKeys.right;
        
        // Poll gamepad
        this.pollGamepad();
    }
    
    isLeft() {
        return this.keys.left;
    }
    
    isRight() {
        return this.keys.right;
    }
    
    isAccelerating() {
        return this.keys.up;
    }
    
    isBraking() {
        return this.keys.down;
    }
    
    justPressedLeft() {
        return this.keyJustPressed.left;
    }
    
    justPressedRight() {
        return this.keyJustPressed.right;
    }
}
