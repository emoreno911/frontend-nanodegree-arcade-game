var GAME_ROWS = [-25, 60, 145, 230, 320, 405];

// Enemies our player must avoid
var Enemy = function(sprite, x, y, speed) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = sprite || 'images/enemy-bug.png';
    this.x = x || 0;
    this.y = y || GAME_ROWS[1];
    this.speed = speed || 100;
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x += (this.speed * dt);
    if(this.x > 500)
        this.x = 0;

    // theres collition
    if(isPointBetween(player.x, this.x - 50, this.x + 50) && isPointBetween(player.y, this.y - 40, this.y + 40)) {
        player.reset();
        game.updateLives(false);
    }
        
};

Enemy.prototype.updateSpeed = function(isDecrement) {
    var increment = getRandomInt(10,35);

    if(isDecrement)
        this.speed -= increment;
    else
        this.speed += increment;
}

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {
    Enemy.call(this, 'images/char-boy.png', 0, 400, 0);
};

// Set prototype inheritance
Player.prototype = Object.create(Enemy.prototype);
Player.prototype.constructor = Player;

Player.prototype.handleInput = function(key) {
    var x, y;

    switch(key){
        case 'up':
            y = this.y - 85;
            if(y >= -25) 
                this.y = y;
        break;

        case 'down':
            y = this.y + 85;
            if(y <= 405) 
                this.y = y;
        break;

        case 'left':
            x = this.x - 100;
            if(x >= 0) 
                this.x = x;
        break;

        case 'right':
            x = this.x + 100;
            if(x < 500) 
                this.x = x;
        break;

        default:
        // do nothing
    }

    //console.log('player to: ' + x + ', ' + y);
    //console.log('player in: ' + this.x + ', ' + this.y);
    this.render();
}

Player.prototype.update = function(dt) {
    // last block pixels
    if(this.y < GAME_ROWS[1]) {
        var scoreIncrement = 100; // Increment when reach blue blocks        

        // check for gem extra points
        if(gem) {
            if(isPointBetween(player.x, gem.x - 20, gem.x + 20)) {
                scoreIncrement += gem.value;
            }
        }

        game.updateScore(scoreIncrement);

        // more speed to enemies
        allEnemies.forEach(function(enemy) {
            enemy.updateSpeed();
            //console.log(enemy.speed);
        });

        this.reset();
    }
};

// Reubica al jugador en una posicion inicial
Player.prototype.reset = function() {
    this.x = getRandomInt(0,4) * 100;
    this.y = 400 - (getRandomInt(0,2) * 80);
    this.render();
};


// Gems
var Gem = function(type) {
    switch(type){
        case 1:
            this.sprite = 'images/gem-blue.png';
            this.value = 50;
            break;
        case 2:
            this.sprite = 'images/gem-green.png';
            this.value = 75;
            break;
        case 3:
            this.sprite = 'images/gem-orange.png';
            this.value = 120;
            break;
    }

    this.x = getRandomInt(0,5) * 100;
    this.y = GAME_ROWS[0];
};

Gem.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}


// Game handle
var INIT_LIVES = 3,
    LEVEL_MAX_TIME = 0, // not used yet
    isGameOver;         // can player make a move???

var Game = function() {
    this.score = 0;
    this.lives = INIT_LIVES;
    this.timer = LEVEL_MAX_TIME;
    this.renderScoreboard();
};

Game.prototype.renderScoreboard = function() {
    var livesCount = [];

    for(var i = 0; i < this.lives; i++){
        livesCount.push('<img src="images/heart-mini.png">');
    }

    var template = [
        '<div class="lives">Lives <span>', livesCount.join(''), '</span></div>',
        '<div class="time">', this.timer,'</div>',
        '<div class="score">Score <span>', this.score, '</span></div>'
    ].join('');

    document.getElementById('scoreboard').innerHTML = template;
}

Game.prototype.updateLives = function(increment) {
    if(increment)
        this.lives++;
    else
        this.lives--;

    if(this.lives < 1) {
        console.log('You Lose');
        gameOver();
        this.lives = 0;
    }

    this.renderScoreboard();
}

Game.prototype.updateScore = function(points) {
    this.score += points;
    this.renderScoreboard();
}



// Returns true if point is between min and max
function isPointBetween(point, min, max) {
    if(point > min && point < max)
        return true;

    return false;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

var $gameModal = $('#gameModal'),
    topScores;

function gameOver() {
    isGameOver = true;

    var strTopScores = localStorage.getItem('topScores') || "[]",
        playerScore = { name: "#ME#", score: game.score };

    topScores = JSON.parse(strTopScores);
    topScores.push(playerScore);
    topScores.sort(function (a, b) {
        if (a.score > b.score) {
            return -1;
        }
        if (a.score < b.score) {
            return 1;
        }

        return 0;
    });

    var ohtml = topScores.map(function(el, i) {
        var input = ['<input type="text" class="form-control" placeholder="Type your name here">'],
            name = el.name.replace('#ME#', input.join(''));

        return ['<tr data-index="', i, '">',
                    '<th scope="row">',i+1,'</th>',
                    '<td>',name,'</td>',
                    '<td>',el.score,'</td>',
                '</tr>'].join('');
    });

    // Theres always one row to show, so comment the line bellow
    // if(ohtml.length == 0) ohtml = ['<tr><td colspan="3">Top scores not found<td></tr>'];

    $gameModal.find('table tbody').html(ohtml.join(''));
    $gameModal.modal('show');
}

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var game, allEnemies, player, gem, gemInterval;

function gameStart() {
    game = new Game();
    allEnemies = [new Enemy(), new Enemy(null,null,GAME_ROWS[2], 80), new Enemy(null,null,GAME_ROWS[3], 160)];
    player = new Player();
    isGameOver = false;

    if(gemInterval) clearInterval(gemInterval);

    gemInterval = setInterval(function(argument) {
        // using floor method, at 3.5 the last gem has a fewer probability to appear
        var rand = getRandomInt(1,3.5);
        gem = new Gem(rand);
    }, 5000);

}

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    if(!isGameOver)
        player.handleInput(allowedKeys[e.keyCode]);
});

document.getElementById('btnNewGame').onclick = function(e) {
    var $input = $gameModal.find('input'),
        index = $input.closest('tr').data('index');

    topScores[index].name = $input.val() || "Juan Doe";
    
    // We only save 5 top scores
    if(topScores.length > 5) 
        topScores.pop();
    
    localStorage.setItem('topScores', JSON.stringify(topScores));

    gameStart();
    $gameModal.modal('hide');
}

gameStart();