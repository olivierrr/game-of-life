var canvas, ctx, H, W;

Canvas = {

    init : function(){
        canvas = document.getElementById('game');
        ctx = canvas.getContext('2d');
    },

    setSize : function(){
        W = window.innerWidth - 5;
        H = window.innerHeight - 5;
        canvas.width = W;
        canvas.height = H;
    }
}

//settings
var startingParticleCount = 500,
    minDist = 50,
    expandDivider = 2,
    maxVelocity = 2,
    gameRunning = true,
    showAge = 1;

//rules //TODO: fix
var rule3 = 6,
    rule2 = 3,
    rule22 = 4,
    rule1 = 0;

// returns a positive or negative between 0 and @param[max]
function rand(max){

    var num = getRandomNum(0, max);
    if(Math.random() < 0.5) num = -Math.abs(num);
    return num;
}

//returns a random number between @param[min] and @param[max]
function getRandomNum(min, max) {

    return Math.random() * (max - min) + min;
}

/*===================================================================
*   Particle
*/

//holds Particle instances
var particles; 

//Particle instance constructor
function constructParticle(posX, posY, vx, vy) {

    particles.push(new Particle(
        posX || getRandomNum(0,W),
        posY || getRandomNum(0,H),
        vx   || rand(maxVelocity),
        vy   || rand(maxVelocity)
    ));
}

//Particle
var Particle = function(posX, posY, vvx, vvy) {

    this.x = posX;
    this.y = posY;
    this.vx = vvx;
    this.vy = vvy;
    this.neighbors = 0;
    this.age = 0;
}

//destroy Particle instance references
Particle.prototype.kill = function(){

	index = particles.indexOf(this);
    particles.splice(index, 1);
}

//update Particle instance
Particle.prototype.update = function(){

    //update age
    this.age +=1;

    //update position
	this.x += this.vx;
	this.y += this.vy;

    //bounce off edges
	if(this.x > W) this.vx = -Math.abs(this.vx);
	if(this.x < 5) this.vx = Math.abs(this.vx);
	if(this.y > H) this.vy = -Math.abs(this.vy);
	if(this.y < 5) this.vy = Math.abs(this.vy);

    //reset neighbor count
    this.neighbors = 0;

    //find neighbors
    var i = particles.length;
    while(i--){
        var p2 = particles[i];
        if(p2 === this) break;
        getVector(this, p2);
    }
}

//draw Particle instance
Particle.prototype.draw = function(){

    var color = '#ADFF2F';
    var size = 2;

    //TODO: fix wall o' ifs
    if(this.age>10) {color = '#008000';}
    if(this.age>30) {color = '#00FA9A';}
    if(this.age>50) {color = '#4682B4'; size = 3}
    if(this.age>80) {color = '#4169E1'; size = 3}
    if(this.age>150) {color = '#8A2BE2'; size = 4}

    //draw Particle
    ctx.beginPath;
    ctx.arc(this.x, this.y, size, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
}

//calculate and draw vector
function getVector(p1, p2) {

    //get distance between p1 and p2
    var dx = p1.x - p2.x,
        dy = p1.y - p2.y,
        dist = Math.sqrt(dx*dx + dy*dy);

    if(dist <= minDist) {

        //update neighbor count
        p1.neighbors += 1;

        //draw vector
        ctx.beginPath();
        ctx.strokeStyle = "rgba(255,255,255,"+ (1.2-dist/minDist) +")";
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.closePath()
    }
}

//checks game rules
function checkRules(){

    //iterrate Particle instances
    var i = particles.length;
    while(i--){
        var p1 = particles[i];
        if( p1.neighbors <= rule1 ) p1.kill();
        if( p1.neighbors >= rule3 ) p1.kill();
        if( p1.neighbors === rule2 || p1.neighbors === rule22) constructParticle(
            p1.x + rand(minDist/expandDivider), p1.y + rand(minDist/expandDivider), p1.vx, p1.vy
        );
    }
}

function update() {

    //clear canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0,0,W,H);

    //itterate Particle instances
    var i = particles.length;
    while(i--){
        particles[i].update();
        if(showAge === 1)particles[i].draw();
    }

    //check rules
    checkRules();
}

//game loop
function loop() {

    if(gameRunning === true){
        update();
    }

    requestAnimFrame(loop);
}

//initiate new simulation
function init(){

    Canvas.init();
    Canvas.setSize();

    //clear Particle instance array
    particles = [];

    //spawn initial Particles
	var i = startingParticleCount;
	while(i--){
		constructParticle();
	}
}

window.requestAnimFrame = (function(){
  return window.requestAnimationFrame       ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame    ||
         window.oRequestAnimationFrame      ||
         window.msRequestAnimationFrame     ||
         function( callback ){
           window.setTimeout(callback, 1000/30);
         };
})();

init();
loop();

/*===========================================================================
*   DOM
*/

//TODO: fix this... all of this V

canvas.onmousedown = function(e) {
    canvas.onmousemove = function(e) { constructParticle(e.pageX, e.pageY); }
    document.onmouseup = function() { canvas.onmousemove = null; }
}

//get DOM element by id
function getElement(id){
    return document.getElementById(id);
}

function bind(elem, listener, model, callback){
    var elem = document.getElementById(elem);
    elem.value = model;
    elem[listener] = function(){
        callback(elem);
    }
}

//UI
window.onload = function(){

    var helpBTN_state = 0,
        minimizeBTN_state = 0;

    bind('oneframeBTN', 'onclick', 0, function(){
        update();
    });

    bind('resetBTN', 'onclick', 0, function(){
        getRules(); init();
    });

    bind('minimizeBTN', 'onclick', 0, function(){
        minimizeBTN_state ? minimizeBTN_state = 0 : minimizeBTN_state = 1;
        minimizeBTN_state ? hideElem('none') : hideElem('block');
        function hideElem(style){
            getElement('ui2').style.display = style;
        }
    });

    bind('pauseBTN', 'onclick', 0, function(){
        gameRunning = false;
    });

    bind('resumeBTN', 'onclick', 0, function(){
        gameRunning = true;
    });

    bind('mindDistSLDR', 'onchange', minDist, function(elem){
        minDist = elem.value;
    });

    bind('startingParticleCountSLDR', 'onchange', startingParticleCount, function(elem){
        startingParticleCount = elem.value;
    });

    bind('maxVelocitySLDR', 'onchange', maxVelocity, function(elem){
        maxVelocity = elem.value;
    });

    bind('expandDividerSLDR', 'onchange', expandDivider, function(elem){
        expandDivider = elem.value;
    });

    //get input checkboxes
    var showAgeCHK = getElement('showAgeCHK');
    //TODO: this

    //get input text
    var rulesINPT1 = getElement('rulesINPT1'),
        rulesINPT2 = getElement('rulesINPT2'),
        rulesINPT22 = getElement('rulesINPT22'),
        rulesINPT3 = getElement('rulesINPT3');

    rulesINPT1.value = rule1;
    rulesINPT2.value = rule2;
    rulesINPT22.value = rule22;
    rulesINPT3.value = rule3;

    function getRules(){
        rule1 = parseInt(rulesINPT1.value);
        rule2 = parseInt(rulesINPT2.value);
        rule22 = parseInt(rulesINPT22.value);
        rule3 = parseInt(rulesINPT3.value);
    }

    //get ui container
    var ui = getElement('ui');

    ui.onmousedown = function(e) {
        ui.onmousemove = function(e) {
            //todo: drag
        }
        document.onmouseup = function(){ui.onmousemove = null}
    }
}