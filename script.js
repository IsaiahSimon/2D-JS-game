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

  }

  // Handles player lazers
  class Projectile {

  }

  // Handles falling screws, cogs, and bolts from damaged enemies
  class Particle {

  }

  // Controls the main character, animate player sprite sheet
  class Player{

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

  }
});