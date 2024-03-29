// All JS logic for the game goes here


// Load Event fires when the whole page has been loaded, including all dependent resources such as stylesheets and images.


// Load game in browser window
window.addEventListener('load', function() {
  // canvas setup
  const canvas = document.getElementById('canvas1');

  // Drawing Context: a built in object that contains all methods and properties that allow us to draw and animate colors, shapes, and other graphics on HTML canvas.
  const ctx = canvas.getContext('2d');

  // Game Area
  canvas.width = 1000;
  canvas.height = 500;

  // Keeps track of user input (keyboard)
  class InputHandler {
    constructor(game){
      this.game = game;                                   // convert into a property of the class

      window.addEventListener('keydown', e => {           // listen for keydown event, arrow function needed to bind this.game to the class
        if((  (e.key === 'ArrowUp') ||
              (e.key === 'ArrowDown')
        ) && this.game.keys.indexOf(e.key) === -1){       // only if key is not already in the array, add it
          this.game.keys.push(e.key);
        } else if (e.key === ' '){
          this.game.player.shootTop()
        } else if (e.key === 'd'){
          this.game.debug = !this.game.debug;
        }
      });

      window.addEventListener('keyup', e => {
        if(this.game.keys.indexOf(e.key) > -1){                     // if the key pressed is in the array
          this.game.keys.splice(this.game.keys.indexOf(e.key), 1);  // remove the key from the array, (startIndex, deleteCount)
        }
      })
    }
  }

  // Handles sound effects
  class SoundController {
    constructor(){
      this.powerUpSound = document.getElementById('powerup');
      this.powerDownSound = document.getElementById('powerdown');
      this.explosionSound = document.getElementById('explosion');
      this.shotSound = document.getElementById('shot');
      this.hitSound = document.getElementById('hit');
      this.shieldSound = document.getElementById('shieldSound');
    }
    powerUp(){
      this.powerUpSound.currentTime = 0; // reset sound to beginning
      this.powerUpSound.play();
    }
    powerDown() {
      this.powerDownSound.currentTime = 0;
      this.powerDownSound.play();
    }
    explosion() {
      this.explosionSound.currentTime = 0;
      this.explosionSound.play();
    }
    shot() {
      this.shotSound.currentTime = 0;
      this.shotSound.play();
    }
    hit() {
      this.hitSound.currentTime = 0;
      this.hitSound.play();
    }
    shield() {
      this.shieldSound.currentTime = 0;
      this.shieldSound.play();
    }
  }

  // Handles player lazers
  class Projectile {
    constructor(game, x, y){
      this.game = game;
      this.x = x;
      this.y = y;
      this.width = 36.25;
      this.height = 20;
      this.speed = Math.random() * 0.2 + 2.8;
      this.markedForDeletion = false
      this.image = document.getElementById('fireball')
      this.frameX = 0;
      this.maxFrame = 3;
      this.fps = 20;
      this.timer = 0;
      this.interval = 1000 / this.fps;
  }
  update(deltaTime){
    this.x += this.speed
    if (this.timer > this.interval){
      if (this.frameX < this.maxFrame) {
        this.frameX++
      } else {
        this.frameX = 0
      }

      this.timer = 0;
    } else {
      this.timer += deltaTime
    }

    if(this.x > this.game.width * 0.8){           // sets the range of the projectile based on the game width
      this.markedForDeletion = true
    }
  }
  draw(context){
    context.drawImage(this.image, this.frameX * this.width, 0, this.width, this.height, this.x, this.y, this.width, this.height)
  }

  }

  // Handles player shield
  class Shield {
    constructor(game){
      this.game = game;
      this.width = this.game.player.width;
      this.height = this.game.player.height;
      this.frameX = 0;
      this.maxFrame = 24;
      this.image = document.getElementById('shield');
      this.fps = 30
      this.timer = 0
      this.interval = 1000/this.fps
    }
    update(deltaTime){
      if(this.frameX <= this.maxFrame){
        if(this.timer > this.interval){
          this.frameX++;
          this.timer = 0;
        } else {
          this.timer += deltaTime;
        }
        this.frameX++;
      }
    }
    draw(context){
      context.drawImage(this.image, this.frameX * this.width, 0, this.width, this.height, this.game.player.x, this.game.player.y, this.width, this.height)
    }
    reset(){
      this.frameX = 0;
      this.game.sound.shield();
    }
  }

  // Handles falling screws, cogs, and bolts from damaged enemies
  class Particle {
    constructor(game, x, y){
      this.game = game
      this.x = x
      this.y = y
      this.image = document.getElementById('gears')
      this.frameX = Math.floor(Math.random() * 3)
      this.frameY = Math.floor(Math.random() * 3)
      this.spriteSize = 50
      this.sizeModifier = (Math.random() * 0.5 + 0.5).toFixed(1) // random number between 0.5 and 1
      this.size = this.spriteSize * this.sizeModifier // random particle size
      this.speedX = Math.random() * 6 - 3         // random speed between -3 and 3
      this.speedY = Math.random() * -15         // random speed between -15 and 0 (negative so it goes up)
      this.gravity = 0.5                      // gravity constant
      this.markedForDeletion = false
      this.angle = 0                         // angle of rotation
      this.va = Math.random() * 0.2 - 0.1     // velocity of angle
      this.bounced = 0
      this.bottomBouncedBoundary = Math.random() * 80 + 60
    }
    update(){
      this.angle += this.va           // update angle
      this.speedY += this.gravity     // update speedY
      this.x -= this.speedX + this.game.speed           // update x
      this.y += this.speedY           // update y affect by gravity
      if(this.y > this.game.height + this.size || this.x < 0 - this.size){ // if particle is off screen
        this.markedForDeletion = true
      }

      // bounce off bottom of screen
      if(this.y > this.game.height - this.bottomBouncedBoundary && this.bounced < 2){
        this.bounced++
        this.speedY *= -0.5
      }
    }
    draw(context){
      context.save()

      context.translate(this.x, this.y) // move rotation center point (0,0) to the center of the particle
      context.rotate(this.angle)        // rotate the particle

      context.drawImage(this.image, this.frameX * this.spriteSize, this.frameY * this.spriteSize, this.spriteSize, this.spriteSize, this.size * -0.5, this.size * -0.5, this.size, this.size) // draw image
      context.restore()
    }
  }

  // Controls the main character, animate player sprite sheet
  class Player{
    constructor(game){
      // convert game object that is passed in, into a property of the player class called this.game
      this.game = game

      // Player sprite sheet
      this.width = 120;
      this.height = 190;

      // Player start position
      this.x = 20;
      this.y = 100;

      // Helper variables
      this.frameX = 0              // frameX and frameY are used to determine which frame of the sprite sheet to draw
      this.frameY = 0              // toggle between 0 and 1 to see power up animation state
      this.maxFrame = 37

      // Player speed
      this.speedY = 0;        // -1 means player will move up, 1 means player will move down, 0 means player will not move
      this.maxSpeed = 5;      // max speed player can move, allows dynamic speed changes in update method for power ups

      this.projectiles = []   // holds all currently active projectile objects

      this.image = document.getElementById('player') // get player image from html

      // Power up
      this.powerUp = false;   // boolean to determine if power up is active
      this.powerUpTimer = 0;  // timer to keep track of how long power up is active
      this.powerUpLimit = 10000; // how long power up is active
    }
    // Moves the player around the screen
    update(deltaTime){
      if(this.game.keys.includes('ArrowUp')){     // change player position based on key pressed
        this.speedY = -this.maxSpeed;
      } else if (this.game.keys.includes('ArrowDown')){
        this.speedY = this.maxSpeed;
      } else {
        this.speedY = 0
      }

      // vertical boundaries
      if(this.y > this.game.height - this.height * 0.5){   // bottom boundary
        this.y = this.game.height - this.height * 0.5;
      } else if (this.y < -this.height * 0.5){              // top boundary
        this.y = -this.height * 0.5;
      }

      this.y += this.speedY;                     // update player position

      // handle projectiles
      this.projectiles.forEach(projectile => {
        projectile.update(deltaTime);
      })
      this.projectiles = this.projectiles.filter(projectile => !projectile.markedForDeletion) // filter out projectiles that are marked for deletion, and overwrite the projectiles array with the new array

      // handle sprite animation
      if (this.frameX < this.maxFrame){
        this.frameX++
      } else {
        this.frameX = 0
      }

      // handle power up
      if(this.powerUp){
        if (this.powerUpTimer > this.powerUpLimit) {
          this.powerUpTimer = 0;          // reset timer
          this.powerUp = false;           // turn off power up
          this.frameY = 0                 // reset to normal animation
          this.game.sound.powerDown();
        } else {
          this.powerUpTimer += deltaTime  // increment timer
          this.frameY = 1                 // change animation to power up
          this.game.ammo += 0.1           // increase ammo
        }
      }
    }
    // Draws grapics representing the player, context will specify which canvas element to draw on, better to use context rather than pulling ctx variable from outside into this object
    draw(context){
      if (this.game.debug){
        context.strokeRect(this.x, this.y, this.width, this.height);
      }
      // handle projectiles
      this.projectiles.forEach(projectile => {
        projectile.draw(context)
      })
      context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height) // draw player image, using 9 argument version of .drawImage. (1 img + 4 source + 4 destination)
    }
    shootTop(){
      if(this.game.ammo > 0){                                                // only shoot if ammo is greater than 0
        this.projectiles.push(new Projectile(this.game, this.x + 80, this.y + 30))
        this.game.ammo--                                                     // decrement ammo
      }
      this.game.sound.shot();
      if(this.powerUp){                                                      // if power up is active, shoot 2 projectiles
        this.shootBottom()
      }

    }
    shootBottom(){
      if (this.game.ammo > 0) {                                                // only shoot if ammo is greater than 0
        this.projectiles.push(new Projectile(this.game, this.x + 80, this.y + 175))
      }
    }
    enterPowerUp(){
      this.powerUpTimer = 0;    // reset timer
      this.powerUp = true;      // turn on power up
      if(this.game.ammo < this.game.maxAmmo) this.game.ammo = this.game.maxAmmo // reset ammo
      this.game.sound.powerUp(); // play power up sound
    }
  }

  // Main blueprint for all enemies
  class Enemy {
    constructor(game){
      this.game = game;
      this.x = this.game.width                      // enemy starts at the right side of the screen
      this.speedX = Math.random() * -1.5 - 0.5;     // random enemy speed
      this.markedForDeletion = false;
      this.frameX = 0
      this.frameY = 0
      this.maxFrame = 37
    }
    update(){
      this.x += this.speedX - this.game.speed;                         // update enemy position, dynamic events based on game speed
      if(this.x + this.width < 0){                  // if enemy is off the screen, mark it for deletion
        this.markedForDeletion = true
      }

      // handle sprite animation
      if (this.frameX < this.maxFrame){
        this.frameX++
      } else {
        this.frameX = 0
      }
    }
    draw(context){
      if (this.game.debug){
        context.strokeRect(this.x, this.y, this.width, this.height)
      }
      context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height)
      if(this.game.debug){
        context.font = '20px Helvetica'
        context.fillText(this.lives, this.x, this.y)
      }
    }
  }
  class Angler1 extends Enemy {                     // Inherits from Enemy class
    constructor(game){
      super(game)                                   // calls the constructor of the parent class first
      this.width = 228
      this.height = 169
      this.y = Math.random() * (this.game.height * 0.95 - this.height); // random y position between 0 to 90% from the top of the screen, offset by the height of the enemy
      this.image = document.getElementById('angler1')
      this.frameY = Math.floor(Math.random() * 3)   // random frameY for sprite sheet
      this.lives = 5;
      this.score = this.lives;
    }
  }

  class Angler2 extends Enemy {
    constructor(game) {
      super(game)
      this.width = 213
      this.height = 165
      this.y = Math.random() * (this.game.height * 0.95 - this.height);
      this.image = document.getElementById('angler2')
      this.frameY = Math.floor(Math.random() * 2)
      this.lives = 6;
      this.score = this.lives;
    }
  }

  class LuckyFish extends Enemy {
    constructor(game) {
      super(game)
      this.width = 99
      this.height = 95
      this.y = Math.random() * (this.game.height * 0.95 - this.height);
      this.image = document.getElementById('lucky')
      this.frameY = Math.floor(Math.random() * 2)
      this.lives = 5;
      this.score = 15
      this.type = 'lucky'
    }
  }

  class HiveWhale extends Enemy {
    constructor(game) {
      super(game)
      this.width = 400
      this.height = 227
      this.y = Math.random() * (this.game.height * 0.95 - this.height);
      this.image = document.getElementById('hivewhale')
      this.frameY = 0 // only has 1 animation row
      this.lives = 20
      this.score = this.lives
      this.type = 'hive'
      this.speedX = Math.random() * -1.2 - 0.2  // slow down this enemy
    }
  }

  class Drone extends Enemy {
    constructor(game, x, y) { // need to pass in x, y position of current destroyed Hive Whale
      super(game)
      this.width = 115
      this.height = 95
      this.x = x
      this.y = y
      this.image = document.getElementById('drone')
      this.frameY = Math.floor(Math.random() * 2) // random row from sprite sheet
      this.lives = 3
      this.score = this.lives
      this.type = 'drone'
      this.speedX = Math.random() * -4.2 - 0.5 // random speed range
    }
  }

  class BulbWhale extends Enemy {
    constructor(game) {
      super(game)
      this.width = 270
      this.height = 219
      this.y = Math.random() * (this.game.height * 0.95 - this.height);
      this.image = document.getElementById('bulbwhale')
      this.frameY = Math.floor(Math.random() * 2) // random row from sprite sheet
      this.lives = 20
      this.score = this.lives
      this.speedX = Math.random() * -1.2 - 0.2  // slow down this enemy
    }
  }

  class MoonFish extends Enemy {
    constructor(game) {
      super(game)
      this.width = 227
      this.height = 240
      this.y = Math.random() * (this.game.height * 0.95 - this.height);
      this.image = document.getElementById('moonfish')
      this.frameY = 0
      this.lives = 10
      this.score = this.lives
      this.type = 'moon'
      this.speedX = Math.random() * -1.2 - 2
    }
  }

  class Stalker extends Enemy {
    constructor(game) {
      super(game)
      this.width = 243
      this.height = 123
      this.y = Math.random() * (this.game.height * 0.95 - this.height);
      this.image = document.getElementById('stalker')
      this.frameY = 0
      this.lives = 5
      this.score = this.lives
      this.speedX = Math.random() * -1 - 1
    }
  }

  class Razorfin extends Enemy {
    constructor(game) {
      super(game)
      this.width = 187
      this.height = 149
      this.y = Math.random() * (this.game.height * 0.95 - this.height);
      this.image = document.getElementById('razorfin')
      this.frameY = 0
      this.lives = 7;
      this.score = this.lives
      this.speedX = Math.random() * -1 - 1
    }
  }

  // Handles individual background layers in multilayered parallax background
  class Layer {
    constructor(game, image, speedModifier){
      this.game = game;
      this.image = image;
      this.speedModifier = speedModifier;
      this.width = 1768
      this.height = 500
      this.x = 0
      this.y = 0
    }
    update(){
      if(this.x <= -this.width){
        this.x = 0
      }
      this.x -= this.game.speed * this.speedModifier

    }
    draw(context){
      context.drawImage(this.image, this.x, this.y)
      context.drawImage(this.image, this.x + this.width, this.y) // creates a 2nd image to the right of the first image, so that the image appears to be infinite
    }
  }

  // Handles all layers to create the game world
  class Background {
    constructor(game){
      this.game = game;
      this.image1 = document.getElementById('layer1')           // pull image from html
      this.image2 = document.getElementById('layer2')
      this.image3 = document.getElementById('layer3')
      this.image4 = document.getElementById('layer4')
      this.layer1 = new Layer(this.game, this.image1, 0.2);       // create layer object with a speed modifier of 1
      this.layer2 = new Layer(this.game, this.image2, 0.4);
      this.layer3 = new Layer(this.game, this.image3, 1);
      this.layer4 = new Layer(this.game, this.image4, 1.5);
      this.layers = [this.layer1, this.layer2, this.layer3]   // holds all layers except the foreground, otherwise it gets drawn behind the player
    }
    update(){
      this.layers.forEach(layer => layer.update())
    }
    draw(context){
      this.layers.forEach(layer => layer.draw(context))
    }
  }

  class Explosion {
    constructor(game, x, y){
      this.game = game;
      this.x = x;
      this.y = y;
      this.frameX = 0;
      this.spriteWidth = 200;
      this.spriteHeight = 200;
      this.width = this.spriteWidth;
      this.height = this.spriteHeight;
      this.x = x - this.width * 0.5;
      this.y = y - this.height * 0.5;
      this.fps = 30;          // can change this to make the explosion animation faster or slower
      this.timer = 0;
      this.interval = 1000/this.fps;
      this.markedForDeletion = false;
      this.maxFrame = 8;
    }
    update(deltaTime){
      this.x -= this.game.speed;
      if(this.timer > this.interval){ // if the timer is greater than the interval, then we want to update the frame
        this.frameX++;
        this.timer = 0;
      } else {
        this.timer += deltaTime; // if the timer is not greater than the interval, then we want to add the deltaTime to the timer
      }

      if(this.frameX > this.maxFrame){
        this.markedForDeletion = true;
      }
    }
    draw(context){
      context.drawImage(this.image, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height); // draw the explosion
    }
  }

  class SmokeExplosion extends Explosion {
    constructor(game, x, y){
      super(game, x, y)
      this.image = document.getElementById('smokeExplosion');
    }
  }
  class FireExplosion extends Explosion {
    constructor(game, x, y) {
      super(game, x, y)
      this.image = document.getElementById('fireExplosion');
    }
  }

  // Will draw score, timer and other info to be displayed for the user
  class UI {
    constructor(game){
      this.game = game;
      this.fontSize = 25;
      this.fontFamily = 'Bangers';
      this.color = 'white';
    }
    draw(context){
      context.save()                             // save the current state of the canvas
      context.fillStyle = this.color;
      context.shadowOffsetX = 2
      context.shadowOffsetY = 2
      context.shadowColor = 'black'
      context.font = this.fontSize + 'px ' + this.fontFamily;

      // score
      context.fillText('Score: ' + this.game.score, 20, 40)

      // game timer
      const formattedTime = (this.game.gameTime * 0.001).toFixed(1) // .toFixed formats a number using fixed point notation
      context.fillText('Time: ' + formattedTime, 20, 100)

      // game over messages
      if(this.game.gameOver){
        context.textAlign = 'center'
        let message1;
        let message2;
        if(this.game.score > this.game.winningScore){
          message1 = 'Most Wondrous!'
          message2 = 'Well done explorer!'
        } else {
          message1 = 'Blazes!'
          message2 = 'Get my repair kit and try again!'
        }
        context.font = '70px ' + this.fontFamily;
        context.fillText(message1, this.game.width * 0.5, this.game.height * 0.5 - 20); // -40 moves the text up 40px
        context.font = '35px ' + this.fontFamily;
        context.fillText(message2, this.game.width * 0.5, this.game.height * 0.5 + 30); // +40 moves the text down 40px
      }

      // ammo
      if(this.game.player.powerUp){
        context.fillStyle = '#ffffbd'
      }
      for (let i = 0; i < this.game.ammo; i++) {
        context.fillRect(20 + 5 * i, 50, 3, 20); // uses index from for loop to space UI ammo elements out (5 * i), plus 20px left margin
      }
      context.restore()                         // restore the canvas to the state it was in before the save method
    }
  }

  // Brain of the game, handles all game logic
  class Game {
    // Needs width and height of the canvas as arguments
    constructor(width, height){
      // convert width and height into class properties to ensure they match the size of the canvas element.
      this.width = width;
      this.height = height;
      this.background = new Background(this)

      // Create a new player object (an instance of Player class), will find Player class, runs it's constructor, and passes in the entire Game object as an argument.
      this.player = new Player(this);           // `this` arg refers to the entire Game class

      this.input = new InputHandler(this);      // `this` arg refers to the entire Game class
      this.ui = new UI(this);                   // `this` arg refers to the entire Game class
      this.sound = new SoundController();
      this.shield = new Shield(this);
      this.keys = [];                           // array to store all keys pressed by user
      this.enemies = [];
      this.particles = [];
      this.explosions = [];
      this.enemyTimer = 0;
      this.enemyInterval = 2000;

      this.ammo = 20;                           // ammo counter
      this.maxAmmo = 50;
      this.ammoTimer = 0;
      this.ammoInterval = 350;                 // time in milliseconds between ammo replinishment
      this.gameOver = false;
      this.score = 0;
      this.winningScore = 80;
      this.gameTime = 0;
      this.gameTimeLimit = 35000 ;              // time in milliseconds
      this.speed = 1
      this.debug = false
    }
    update(deltaTime){
      if(!this.gameOver){ // keeps track of time from start of game, and ends game if time limit is reached
        this.gameTime += deltaTime;
      }
      if(this.gameTime > this.gameTimeLimit){
        this.gameOver = true;
      }
      this.background.update() // update background layers
      this.background.layer4.update() // draws the foreground layer last, so that it appears on top of the player layer

      this.player.update(deltaTime); // takes this.player property, and calls an instance of Player method, and calls its update method.
      //console.log(this.ammo, this.ammoTimer, this.ammoInterval) // test ammo counter, disabled for performance

      if(this.ammoTimer > this.ammoInterval){
        if(this.ammo < this.maxAmmo){
          this.ammo++
        }
        this.ammoTimer = 0
      } else {
        this.ammoTimer += deltaTime
      }

      this.shield.update(deltaTime);
      this.particles.forEach(particle => particle.update())
      this.particles = this.particles.filter(particle => !particle.markedForDeletion) // removes all particles marked for deletion

      this.explosions.forEach(explosion => explosion.update(deltaTime))
      this.explosions = this.explosions.filter(explosion => !explosion.markedForDeletion) // removes all explosions marked for deletion

      // Cycle through all enemies in enemies array, and call their update method
      this.enemies.forEach(enemy => {
        enemy.update();
        if(this.checkCollision(this.player, enemy)){
          enemy.markedForDeletion = true;
          this.addExplosion(enemy); // adds explosion when enemy collides with player
          this.sound.hit();
          this.shield.reset();


          for (let i = 0; i < enemy.score; i++) {
            this.particles.push(new Particle(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5)) // create 10 particles for each enemy collides with Player
          }

          if(enemy.type === 'lucky'){
            this.player.enterPowerUp()  // enter power up mode if player collides with lucky enemy
          } else if (!this.gameOver){
            this.score--                // subtract 1 from score if player collides with enemy
          }
        }
        this.player.projectiles.forEach(projectile => {
          if (this.checkCollision(projectile, enemy)) {
            enemy.lives--;
            projectile.markedForDeletion = true;
            this.particles.push(new Particle(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5)) // particle effect for each enemy hit by Player projectile

            if(enemy.lives <= 0){
              for (let i = 0; i < enemy.score; i++) {
                this.particles.push(new Particle(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5)) // create 10 particles for each enemy killed
              }

              enemy.markedForDeletion = true;
              this.addExplosion(enemy);
              this.sound.explosion();

              if(enemy.type === 'moon'){
                this.player.enterPowerUp()  // enter power up mode if player kills moon enemy
              }

              if(enemy.type === 'hive'){
                for(let i = 0; i < 5; i++){
                  this.enemies.push(new Drone(this, enemy.x + Math.random() * enemy.width, enemy.y + Math.random() * enemy.height * 0.5)) // spawn drone enemy when hive enemy is killed
                }
              }

              if (!this.gameOver){
                this.score += enemy.score
              }
              // if(this.score > this.winningScore){  // if score is greater than winning score, end game
              //   this.gameOver = true;
              // }
            }
          }
        })
      })
      this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion) // filter out enemies that are marked for deletion, and overwrite the enemies array with the new array
      if(this.enemyTimer > this.enemyInterval && !this.gameOver){
        this.addEnemy()
        this.enemyTimer = 0
      } else {
        this.enemyTimer += deltaTime
      }
    }
    draw(context){ // controls the order in which the game elements are drawn
      this.background.draw(context)
      this.ui.draw(context);
      this.player.draw(context);
      this.shield.draw(context);
      this.particles.forEach(particle => particle.draw(context))
      this.enemies.forEach(enemy => enemy.draw(context))
      this.explosions.forEach(explosion => explosion.draw(context))
      this.background.layer4.draw(context)
    }
    // Adds enemies to the game
    addEnemy(){
      const randomize = Math.random()
      if(randomize < 0.1){
        this.enemies.push(new Angler1(this));
      } else if (randomize < 0.3) {
        this.enemies.push(new Stalker(this));
      } else if (randomize < 0.5) {
        this.enemies.push(new Razorfin(this));
      } else if (randomize < 0.6){
        this.enemies.push(new Angler2(this));
      } else if (randomize < 0.7) {
        this.enemies.push(new HiveWhale(this));
      } else if (randomize < 0.8) {
        this.enemies.push(new BulbWhale(this));
      } else if (randomize < 0.9) {
        this.enemies.push(new MoonFish(this));
      } else {
        this.enemies.push(new LuckyFish(this));
      }

      //console.log(this.enemies)
    }
    addExplosion(enemy){
      const randomize = Math.random();
      if (randomize < 0.5){
        this.explosions.push(new SmokeExplosion(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
      } else {
        this.explosions.push(new FireExplosion(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
      }
      //console.log(this.explosions);
    }
    checkCollision(rect1, rect2){
      // check if two rectangles are colliding
      return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
      )
    }
  }

  // Create a new instance of the Game class
  const game = new Game(canvas.width, canvas.height); // pass in canvas width and height as arguments from "Game Area" above
  let lastTime = 0; // used to store time between frames

  // Animation Loop
  function animate(timeStamp){
    const deltaTime = timeStamp - lastTime;               // calculate time between frames
    // console.log(deltaTime)                             // log time between frames, disabled for performance
    lastTime = timeStamp;
    // Clear the canvas between frames
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.draw(ctx);
    game.update(deltaTime);

    requestAnimationFrame(animate);                      // tells the browser that you wish to perform an animation and requests that the browser call a specified function to update an animation before the next repaint.
    // requestAnimationFrame has a special feature:  auto passes a time stamp as an argument to the function it calls (animate).
  }

  animate(0);
});