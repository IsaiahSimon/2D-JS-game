// All JS logic for the game goes here


// Load Event fires when the whole page has been loaded, including all dependent resources such as stylesheets and images.


// Load game in browser window
window.addEventListener('load', function() {
  // canvas setup
  const canvas = document.getElementById('canvas1');

  // Drawing Context: a built in object that contains all methods and properties that allow us to draw and animate colors, shapes, and other graphics on HTML canvas.
  const ctx = canvas.getContext('2d');

  // Game Area
  canvas.width = 1500;
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
        }
      });

      window.addEventListener('keyup', e => {
        if(this.game.keys.indexOf(e.key) > -1){                     // if the key pressed is in the array
          this.game.keys.splice(this.game.keys.indexOf(e.key), 1);  // remove the key from the array, (startIndex, deleteCount)
        }
      })
    }
  }

  // Handles player lazers
  class Projectile {
    constructor(game, x, y){
      this.game = game;
      this.x = x;
      this.y = y;
      this.width = 10
      this.height = 3
      this.speed = 3
      this.markedForDeletion = false
  }
  update(){
    this.x += this.speed
    if(this.x > this.game.width * 0.8){           // sets the range of the projectile based on the game width
      this.markedForDeletion = true
    }
  }
  draw(context){
    context.fillStyle = 'yellow'                 // color of the projectile
    context.fillRect(this.x, this.y, this.width, this.height)
  }

}



  // Handles falling screws, cogs, and bolts from damaged enemies
  class Particle {

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

      // Player speed
      this.speedY = 0;        // -1 means player will move up, 1 means player will move down, 0 means player will not move
      this.maxSpeed = 5;      // max speed player can move, allows dynamic speed changes in update method for power ups

      this.projectiles = []   // holds all currently active projectile objects
    }
    // Moves the player around the screen
    update(){
      if(this.game.keys.includes('ArrowUp')){     // change player position based on key pressed
        this.speedY = -this.maxSpeed;
      } else if (this.game.keys.includes('ArrowDown')){
        this.speedY = this.maxSpeed;
      } else {
        this.speedY = 0
      }

      this.y += this.speedY;                     // update player position

      // handle projectiles
      this.projectiles.forEach(projectile => {
        projectile.update()
      })
      this.projectiles = this.projectiles.filter(projectile => !projectile.markedForDeletion) // filter out projectiles that are marked for deletion, and overwrite the projectiles array with the new array
    }
    // Draws grapics representing the player, context will specify which canvas element to draw on, better to use context rather than pulling ctx variable from outside into this object
    draw(context){
      context.fillStyle = 'black'               // prevents yellow style from projectice class from affecting player
      context.fillRect(this.x, this.y, this.width, this.height);
      // handle projectiles
      this.projectiles.forEach(projectile => {
        projectile.draw(context)
      })
    }
    shootTop(){
      if(this.game.ammo > 0){                                                // only shoot if ammo is greater than 0
        this.projectiles.push(new Projectile(this.game, this.x + 80, this.y + 30))
        this.game.ammo--                                                     // decrement ammo

      }

    }
  }

  // Main blueprint for all enemies
  class Enemy {
    constructor(game){
      this.game = game;
      this.x = this.game.width                      // enemy starts at the right side of the screen
      this.speedX = Math.random() * -1.5 - 0.5;     // random enemy speed
      this.markedForDeletion = false;
      this.lives = 5;
      this.score = this.lives;
    }
    update(){
      this.x += this.speedX                         // update enemy position
      if(this.x + this.width < 0){                  // if enemy is off the screen, mark it for deletion
        this.markedForDeletion = true
      }
    }
    draw(context){
      context.fillStyle = 'red'
      context.fillRect(this.x, this.y, this.width, this.height)
      context.fillStyle = 'black'
      context.font = '20px Helvetica'
      context.fillText(this.lives, this.x, this.y)
    }
  }
  class Angler1 extends Enemy {                     // Inherits from Enemy class
    constructor(game){
      super(game)                                   // calls the constructor of the parent class first
      this.width = 228 * 0.2;
      this.height = 169 * 0.2;
      this.y = Math.random() * (this.game.height * 0.9 - this.height); // random y position between 0 to 90% from the top of the screen, offset by the height of the enemy
    }
  }

  // Handles individual background layers in multilayered parallax background
  class Layer {

  }

  // Pulls all layer objects together to animate the entire game world
  class Background {

  }

  // Will draw score, timer and other info to be displayed for the user
  class UI {
    constructor(game){
      this.game = game;
      this.fontSize = 25;
      this.fontFamily = 'Helvetica';
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

      // ammo
      for(let i = 0; i < this.game.ammo; i++){
        context.fillRect(20 + 5 * i, 50, 3, 20); // uses index from for loop to space UI ammo elements out (5 * i), plus 20px left margin
      }

      // game over messages
      if(this.game.gameOver){
        context.textAlign = 'center'
        let message1;
        let message2;
        if(this.game.score > this.game.winningScore){
          message1 = 'You Win!'
          message2 = 'Well Done!'
        } else {
          message1 = 'You Lose!'
          message2 = 'Try Again next time!'
        }
        context.font = '50px ' + this.fontFamily;
        context.fillText(message1, this.game.width * 0.5, this.game.height * 0.5 - 40); // -40 moves the text up 40px
        context.font = '25px ' + this.fontFamily;
        context.fillText(message2, this.game.width * 0.5, this.game.height * 0.5 + 40); // +40 moves the text down 40px
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

      // Create a new player object (an instance of Player class), will find Player class, runs it's constructor, and passes in the entire Game object as an argument.
      this.player = new Player(this);           // `this` arg refers to the entire Game class

      this.input = new InputHandler(this);      // `this` arg refers to the entire Game class
      this.ui = new UI(this);                   // `this` arg refers to the entire Game class
      this.keys = [];                           // array to store all keys pressed by user
      this.enemies = [];
      this.enemyTimer = 0;
      this.enemyInterval = 1000;

      this.ammo = 20;                           // ammo counter
      this.maxAmmo = 50;
      this.ammoTimer = 0;
      this.ammoInterval = 500;                 // time in milliseconds between ammo replinishment
      this.gameOver = false;
      this.score = 0;
      this.winningScore = 10;
    }
    update(deltaTime){
      this.player.update(); // takes this.player property, and calls an instance of Player method, and calls its update method.
      //console.log(this.ammo, this.ammoTimer, this.ammoInterval) // test ammo counter, disabled for performance

      if(this.ammoTimer > this.ammoInterval){
        if(this.ammo < this.maxAmmo){
          this.ammo++
        }
        this.ammoTimer = 0
      } else {
        this.ammoTimer += deltaTime
      }

      // Cycle through all enemies in enemies array, and call their update method
      this.enemies.forEach(enemy => {
        enemy.update();
        if(this.checkCollision(this.player, enemy)){
          enemy.markedForDeletion = true;
        }
        this.player.projectiles.forEach(projectile => {
          if (this.checkCollision(projectile, enemy)) {
            enemy.lives--;
            projectile.markedForDeletion = true;
            if(enemy.lives <= 0){
              enemy.markedForDeletion = true;
              this.score += enemy.score;
              if(this.score > this.winningScore){
                this.gameOver = true;
              }
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
    draw(context){
      this.player.draw(context);
      this.ui.draw(context);
      this.enemies.forEach(enemy => {
        enemy.draw(context);
      })
    }
    // Adds enemies to the game
    addEnemy(){
      this.enemies.push(new Angler1(this));
      //console.log(this.enemies)
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

    game.update(deltaTime);
    game.draw(ctx);

    requestAnimationFrame(animate);                      // tells the browser that you wish to perform an animation and requests that the browser call a specified function to update an animation before the next repaint.
    // requestAnimationFrame has a special feature:  auto passes a time stamp as an argument to the function it calls (animate).
  }

  animate(0);
});