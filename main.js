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

var canvas = document.getElementById("game"),
	ctx = canvas.getContext("2d"),
	W = window.innerWidth - 5, 
	H = window.innerHeight - 5;

canvas.width = W;
canvas.height = H;

//settings
var startingParticleCount = 500,
    minDist = 50,
    expandDivider = 2,
    gameState = 1,
    maxVelocity = 2,
    showAge = 1;

//rules
var rule3 = 5,
    rule2 = 3,
    rule22 = 4,
    rule1 = 0;

var particles = [];

// returns a positive or negative between 0 and @param[max]
function rand(max){

    var num = getRandomNum(0, max);
    if(Math.random() < 0.5) num = -Math.abs(num);
    return num;
}

function getRandomNum(min, max) {
    return Math.random() * (max - min) + min;
}

function Particle(posX, posY, vvx, vvy) {

    this.self = this;
    this.x = posX;
    this.y = posY;
    this.vx = vvx;
    this.vy = vvy;
    this.neighbors = null;
    this.age = 0;
}

Particle.prototype.kill = function(){
	index = particles.indexOf(this);
    particles.splice(index, 1);
}

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
        p2 = particles[i]
        if(p2 === this.self) break;
        getVector(this.self, p2);
    }
}

Particle.prototype.draw = function(){
    var color = '#ADFF2F';
    var size = 2;
    if(this.age>10) {color = '#008000';}
    if(this.age>30) {color = '#00FA9A';}
    if(this.age>50) {color = '#4682B4'; size = 3}
    if(this.age>80) {color = '#4169E1'; size = 3}
    if(this.age>150) {color = '#8A2BE2'; size = 4}
    ctx.beginPath;
    ctx.arc(this.x, this.y, size, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
}

function update() {
    rules();
    ctx.fillStyle = 'black';
    ctx.fillRect(0,0,W,H);
    var i = particles.length;
    while(i--){
        particles[i].update();
        if(showAge === 1)particles[i].draw();
    }
}

function rules(){
    var i = particles.length;
    while(i--){
        var p1 = particles[i];
        if( p1.neighbors === rule1 ) p1.kill();
        if( p1.neighbors > rule3 ) p1.kill();
        if( p1.neighbors === rule2 || p1.neighbors === rule22) createParticle(
            p1.x + rand(minDist/expandDivider), p1.y + rand(minDist/expandDivider), p1.vx, p1.vy
        );
    }
}

function getVector(p1, p2) {
    var dx = p1.x - p2.x,
        dy = p1.y - p2.y;
    var dist = Math.sqrt(dx*dx + dy*dy);
    if(dist <= minDist) {
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

function createParticle(posX, posY, vx, vy) {
    particles.push(new Particle(
        posX || getRandomNum(0,W),
        posY || getRandomNum(0,H),
        vx   || rand(maxVelocity),
        vy   || rand(maxVelocity)
    ));
}

function loop() {
    if(gameState === 1){
        linesCounter = 0;
        update();
    }
    requestAnimFrame(loop);
}

function init(){
    particles = [];
	var i = startingParticleCount;
	while(i--){
		createParticle();
	}
}

init();
loop();

//dom
canvas.onmousedown = function(e) {
    canvas.onmousemove = function(e) { createParticle(e.pageX, e.pageY); }
    document.onmouseup = function() { canvas.onmousemove = null; }
}

//UI
window.onload = function(){

    //get buttons
    var pauseBTN = document.getElementById('pauseBTN'),
        resumeBTN = document.getElementById('resumeBTN'),
        resetBTN = document.getElementById('resetBTN'),
        minimizeBTN = document.getElementById('minimizeBTN');

    var helpBTN_state = 0,
        minimizeBTN_state = 0;

    pauseBTN.onclick=function() {gameState = 0;}
    resumeBTN.onclick=function() {gameState = 1}
    oneframeBTN.onclick=function() {update()}
    resetBTN.onclick=function() { getRules(); init();}
    minimizeBTN.onclick=function() {
        minimizeBTN_state ? minimizeBTN_state = 0 : minimizeBTN_state = 1;
        minimizeBTN_state ? hideElem('none') : hideElem('block');
        function hideElem(style){
            document.getElementById('ui2').style.display = style;
        }
    }

    //get sliders
    var mindDistSLDR = document.getElementById('mindDistSLDR'),
        startingParticleCountSLDR = document.getElementById('startingParticleCountSLDR'),
        maxVelocitySLDR = document.getElementById('maxVelocitySLDR'),
        expandDividerSLDR = document.getElementById('expandDividerSLDR');

    mindDistSLDR.value = minDist;
    startingParticleCountSLDR.value = startingParticleCount;
    maxVelocitySLDR.value = maxVelocity;
    expandDividerSLDR.value = expandDivider;

    mindDistSLDR.onchange=function() {minDist = this.value}
    startingParticleCountSLDR.onchange = function() {startingParticleCount = this.value}
    maxVelocitySLDR.onchange = function() {maxVelocity = this.value}
    expandDividerSLDR.onchange = function() {expandDivider = this.value}

    //get checkboxes
    var showAgeCHK = document.getElementById('showAgeCHK');

    //showAgeCHK.onchange = function() {
    //    if(showAge === 1){
    //        showAge = 0;
    //        return;
    //    }
    //    showAge = 1;
    //    console.log(this.checked);
    //    console.log(this.value)
    //}

    //get text input
    var rulesINPT1 = document.getElementById('rulesINPT1'),
        rulesINPT2 = document.getElementById('rulesINPT2'),
        rulesINPT22 = document.getElementById('rulesINPT22'),
        rulesINPT3 = document.getElementById('rulesINPT3');

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
    var ui = document.getElementById('ui');

    ui.onmousedown = function(e) {
        ui.onmousemove = function(e) {
            //todo: drag
        }
        document.onmouseup = function(){ui.onmousemove = null}
    }
}