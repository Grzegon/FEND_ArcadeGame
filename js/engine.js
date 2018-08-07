/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine makes the canvas' context (ctx) object globally available to make 
 * writing app.js a little simpler to work with.
 */

var Engine = (function (global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    const doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d');
    let lastTime;
    let gameStatus = 'new game';

    canvas.width = 505;
    canvas.height = 606;
    doc.body.appendChild(canvas);

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    main = () => {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        const now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        update(dt);
        render();

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        win.requestAnimationFrame(main);
    }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    init = () => {
        lastTime = Date.now();
        main();
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
    update = (dt) => {
        switch (gameStatus) {
            case "new game": {
                // Turn the keypress event listener in app.js off
                document.removeEventListener("keyup", input);

                const startInput = (event) => {
                    const key = event.keyCode;

                    if (key === 13) {
                        gameStatus = "in game";
                    }
                };
                document.addEventListener("keydown", startInput);
                break;
            }
            // Here we do the "normal" things we'd do when the game is running, mainly updateEntities
            case "in game": {
                // Turn the keypress event listener in app.js back on
                document.addEventListener('keyup', input);
                // Call updateEntities to update each entity in the game
                updateEntities(dt);
                // Check collisions
                checkCollisions();
                break;
            }
            case "game over": {
                // Turn the keypress event listener in app.js off
                document.removeEventListener('keyup', input);

                const gameoverInput = (event) => {
                    const key = event.keyCode;
                    if (key === 13) {
                        gameStatus = "in game";
                    }
                };

                document.addEventListener("keydown", gameoverInput);
                break;
            }
        }
    }

    /*
     * Check for collision between player and enemies
     */
    checkCollisions = () => {
        allEnemies.forEach(enemy => {
            if (player.x < enemy.x + 60 &&
                player.x + 37 > enemy.x &&
                player.y < enemy.y + 25 &&
                30 + player.y > enemy.y) {
                player.x = 200;
                player.y = 380;
            }
        });

        // Check if player reached top of canvas and won the game
        if (player.y < 0) {
            player.x = 200;
            player.y = 380;
            // End game
            gameStatus = 'game over';
            this.init();
        }
    };

    /* This is called by the update function and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to the object. Do your drawing in your
     * render methods.
     */
    updateEntities = (dt) => {
        allEnemies.forEach(function (enemy) {
            enemy.update(dt);
        });
        player.update();
    }

    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    render = () => {
        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */
        const rowImages = [
            'images/water-block.png',   // Top row is water
            'images/stone-block.png',   // Row 1 of 3 of stone
            'images/stone-block.png',   // Row 2 of 3 of stone
            'images/stone-block.png',   // Row 3 of 3 of stone
            'images/grass-block.png',   // Row 1 of 2 of grass
            'images/grass-block.png'    // Row 2 of 2 of grass
        ],
            numRows = 6,
            numCols = 5;
        let row, col;

        // Before drawing, clear existing canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        switch (gameStatus) {
            case "new game": {
                for (row = 0; row < numRows; row++) {
                    for (col = 0; col < numCols; col++) {
                        ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
                        // Text to display over the game board
                        ctx.fillStyle = "black";
                        ctx.font = "40px Comic Sans MS";
                        ctx.textAlign = "center";
                        ctx.fillText("FEND Arcade Game", canvas.width / 2, canvas.height / 3);
                        ctx.fillStyle = "black";
                        ctx.font = "20px Comic Sans MS";
                        ctx.textAlign = "center";
                        ctx.fillText("Press Enter To Start", canvas.width / 2, canvas.height / 2.5);
                        ctx.fillStyle = "black";
                        ctx.font = "16px Comic Sans MS";
                        ctx.textAlign = "center";
                        ctx.fillText("Use the arrow keys to move", canvas.width / 2, canvas.height / 1.7);
                        ctx.fillText("Avoid the bugs to win the game!", canvas.width / 2, canvas.height / 1.5);
                        ctx.fillStyle = "Black";
                        ctx.font = "20px Comic Sans MS";
                        ctx.textAlign = "center";
                        ctx.fillText("Good Luck!", canvas.width / 2, canvas.height / 1.2);
                    }
                }
                break;
            }
            case "in game": {
                /* Loop through the number of rows and columns we've defined above
                 * and, using the rowImages array, draw the correct image for that
                 * portion of the "grid"
                 */
                for (row = 0; row < numRows; row++) {
                    for (col = 0; col < numCols; col++) {
                        /* The drawImage function of the canvas' context element
                         * requires 3 parameters: the image to draw, the x coordinate
                         * to start drawing and the y coordinate to start drawing.
                         * We're using our Resources helpers to refer to our images
                         * so that we get the benefits of caching these images, since
                         * we're using them over and over.
                         */
                        ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
                    }
                }
                renderEntities();
                break;
            }
            case "game over": {
                for (row = 0; row < numRows; row++) {
                    for (col = 0; col < numCols; col++) {
                        ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
                        // Text to display over the game board
                        ctx.fillStyle = "black";
                        ctx.font = "40px Comic Sans MS";
                        ctx.textAlign = "center";
                        ctx.fillText("CONGRATULATIONS!", canvas.width / 2, canvas.height / 3);
                        ctx.fillText("You won!", canvas.width / 2, canvas.height / 2.3);
                        ctx.fillStyle = "black";
                        ctx.font = "20px Comic Sans MS";
                        ctx.textAlign = "center";
                        ctx.fillText("Press Enter To Restart", canvas.width / 2, canvas.height / 2);
                    }
                }
                break;
            }
        }
    }

    /* This function is called by the render function and is called on each game
     * tick. Its purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
    renderEntities = () => {
        /* Loop through all of the objects within the allEnemies array and call
         * the render function you have defined.
         */
        allEnemies.forEach(function (enemy) {
            enemy.render();
        });

        player.render();
    }

    /* This function does nothing but it could have been a good place to
     * handle game reset states - maybe a new game menu or a game over screen
     * those sorts of things. It's only called once by the init() method.
     */
    reset = () => {
        // Turn off key event listener needed to move character
        document.removeEventListener('keyup', input);
        const gameStartInput = (event) => {
            const key = event.which || event.keyCode;
            if (key === 13) {
                gameStatus = "in game";
            }
        };
        document.addEventListener("keydown", gameStartInput);

        switch (gameStatus) {
            case 'new game': {
                // Display an empty game board with text here
                const rowImages = [
                    'images/water-block.png',   // Top row is water
                    'images/stone-block.png',   // Row 1 of 3 of stone
                    'images/stone-block.png',   // Row 2 of 3 of stone
                    'images/stone-block.png',   // Row 3 of 3 of stone
                    'images/grass-block.png',   // Row 1 of 2 of grass
                    'images/grass-block.png'    // Row 2 of 2 of grass
                ],
                    numRows = 6,
                    numCols = 5;
                let row, col;

                for (row = 0; row < numRows; row++) {
                    for (col = 0; col < numCols; col++) {
                        ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
                        // Text to display over the game board
                        ctx.fillStyle = "white";
                        ctx.font = "40px Comic Sans MS";
                        ctx.textAlign = "center";
                        ctx.fillText("Let's Play Frogger!", canvas.width / 2, canvas.height / 5.5);
                        ctx.fillStyle = "white";
                        ctx.font = "20px Comic Sans MS";
                        ctx.textAlign = "center";
                        ctx.fillText("Press Enter To Start", canvas.width / 2, canvas.height / 4);
                        ctx.fillStyle = "white";
                        ctx.font = "16px Comic Sans MS";
                        ctx.textAlign = "center";
                        ctx.fillText("Use the arrow keys to move", canvas.width / 2, canvas.height / 3.3);
                        ctx.fillText("Reach the water and collect gems to score", canvas.width / 2, canvas.height / 3.0);
                        ctx.fillText("Difficulty increases when you reach water", canvas.width / 2, canvas.height / 2.75);
                        ctx.fillText("Collect hearts for extra lives", canvas.width / 2, canvas.height / 2.55);
                        ctx.fillText("Avoid the bugs to stay alive", canvas.width / 2, canvas.height / 2.37);
                        ctx.fillStyle = "white";
                        ctx.font = "20px Comic Sans MS";
                        ctx.textAlign = "center";
                        ctx.fillText("Good Luck!", canvas.width / 2, canvas.height / 2.1);
                    }
                }
                break;
            }
            case 'game over': {
                // Display an empty game board with text here
                rowImages = [
                    'images/water-block.png',   // Top row is water
                    'images/stone-block.png',   // Row 1 of 3 of stone
                    'images/stone-block.png',   // Row 2 of 3 of stone
                    'images/stone-block.png',   // Row 3 of 3 of stone
                    'images/grass-block.png',   // Row 1 of 2 of grass
                    'images/grass-block.png'    // Row 2 of 2 of grass
                ],
                    numRows = 6,
                    numCols = 5;

                for (row = 0; row < numRows; row++) {
                    for (col = 0; col < numCols; col++) {
                        ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
                        // Text to display over the game board
                        ctx.fillStyle = "white";
                        ctx.font = "40px Comic Sans MS";
                        ctx.textAlign = "center";
                        ctx.fillText("Game Over!", canvas.width / 2, canvas.height / 3);
                        ctx.fillStyle = "white";
                        ctx.font = "20px Comic Sans MS";
                        ctx.textAlign = "center";
                        ctx.fillText("Press Enter To Restart", canvas.width / 2, canvas.height / 2.6);
                    }
                }
                break;
            }
        }
    }

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/enemy-bug.png',
        'images/char-boy.png'
    ]);
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developers can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;
})(this);
