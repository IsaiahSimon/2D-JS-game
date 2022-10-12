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
        }
        console.log(e.key);                               // log the key pressed
      });
      window.addEventListener('keyup', e => {
        if(this.game.keys.indexOf(e.key) > -1){                     // if the key pressed is in the array
          this.game.keys.splice(this.game.keys.indexOf(e.key), 1);  // remove the key from the array, (startIndex, deleteCount)
        }
        console.log(this.game.keys);                                  // log the array
      })
    }
  }

  // Handles player lazers
  class Projectile {

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
    }

    // Draws grapics representing the player, context will specify which canvas element to draw on, better to use context rather than pulling ctx variable from outside into this object
    draw(context){
      context.fillRect(this.x, this.y, this.width, this.height);
    }
  }

  // Main blueprint for all enemies
  class Enemy {

  }

  // Handles individual background layers in multilayered parallax background
  class Layer {

  }

  // Pulls all layer objects together to animate the entire game world
  class Background {

  }

  // Will draw score, timer and other info to be displayed for the user
  class UI {

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
      this.keys = [];                           // array to store all keys pressed by user
    }

    update(){
      this.player.update(); // takes this.player property, and calls an instance of Player method, and calls its update method.
    }

    draw(context){
      this.player.draw(context); //
    }
  }

  // Create a new instance of the Game class
  const game = new Game(canvas.width, canvas.height); // pass in canvas width and height as arguments from "Game Area" above

  // Animation Loop
  function animate(){
    // Clear the canvas between frames
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    game.update();
    game.draw(ctx);

    requestAnimationFrame(animate); // tells the browser that you wish to perform an animation and requests that the browser call a specified function to update an animation before the next repaint.
  }

  animate();
});