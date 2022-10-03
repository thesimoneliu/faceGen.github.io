/* reference:
Assignment 1 - Mask (Computational Portraiture 2021) By Simone Liu
https://editor.p5js.org/ximinliu/sketches/siRNkZtwf
*/

/* ------------------------------ GUI Parameters ------------------------------ */
const params = {
    col_bg: 50,
    col_face: 0,
    col_eye: 30,
    col_eyeball:180,
    col_mouth:220,
    dist:0
};

const pane = new Tweakpane.Pane();
pane.addInput(params, "col_bg", { min: 0, max: 360 });
pane.addInput(params, "col_face", { min: 0, max: 360 });
pane.addInput(params, "col_eye", { min: 0, max: 360 });
// pane.addInput(params, "col_eyeball", { min: 0, max: 360 });
pane.addInput(params, "col_mouth", { min: 0, max: 360 });
pane.addInput(params, "dist", { min: 0, max: 300 });

let particles = [];
let acc = 0;

/* ----------------------------- debug UI ----------------------------- */
// const GUI = new dat.GUI();

const parSettings = {
	numParticle: 500,
	colorZone: 0,
	squiggliness: 1 / 200,
	circleSize: 30,
	lineLength: 0.95,
	angle:4,
	redraw: () => {
		resetAndInit();
	},
	save: () => {
		saveCanvas(canvas);
	},
};

// GUI.add(parSettings, "numParticle", 10, 1000).step(10).name("Particle Number");
// GUI.add(parSettings, "colorZone", -20, 20).step(10).name("Color Change");
// GUI.add(parSettings, "squiggliness", 0, 1 / 100).step(1 / 1000).name("Twist Power");
// GUI.add(parSettings, "circleSize", 1, 100).name("Brush Size");
// GUI.add(parSettings, "lineLength", 0.89, 0.99).step(0.01).name("Brush Length");
// GUI.add(parSettings, "angle", 1,4).step(1).name("Brush Angle");
// GUI.add(parSettings, "redraw").name("RE-DRAW");
// GUI.add(parSettings, "save").name("SAVE");


// function resetCanvas() {
// 	clear();
// 	//framecount = 0;
// 	particles = [];
// 	background(10);
// }

// function resetAndInit() {
// 	resetCanvas();
// }

/* ----------------------------- face recog parameters ----------------------------- */

let facemesh;
let video;

let predictions = [];
let keypoints_array = [];

let faceMask_graphic, eyeL_graphic, eyeR_graphic, mouthOut_graphic, mouthIn_graphic;
let faceContour = [151,109,67,103,54,21,162,127,234,93,132,58,172,136,150,149,176,148,152,377,400,378,379,365,397,288,361,323,454,356,389,251,284,332,297,338];
let eyeptsL = [243,133,173,157,158,159,160,161,246,130,163,144,145,153,154,155];
let eyeptsR = [398,384,385,386,387,388,466,359,390,373,374,380,381,382,362];
let mouthOut = [57,185,40,39,37,0,267,269,270,409,287,273,335,406,313,18,83,182,106,43];
let mouthIn = [78,191,80,81,82,13,312,311,310,415,308,324,318,402,317,14,87,178,88,95];
let faceContour_array = [];
let eyeptsL_array = [];
let eyeptsR_array = [];
let mouthOut_array = [];
let mouthIn_array = [];


/* ------------------------------------ setup ---------------------------------- */

function setup() {
  let c = createCanvas(600,600);
  colorMode(HSB);
  video = createCapture(VIDEO);
  video.size(width, height);
  
  faceMask_graphic = createGraphics(width,height);
  eyeL_graphic = createGraphics(width,height);
  eyeR_graphic = createGraphics(width,height);
  mouthOut_graphic = createGraphics(width,height);
  mouthIn_graphic = createGraphics(width,height);
  //console.log(faceMask_graphic, anim_graphic,eyeL_graphic,eyeR_graphic)
      
  facemesh = ml5.facemesh(video, modelReady);
  // This sets up an event that fills the global variable "predictions"
  // with an array every time new predictions are made
  facemesh.on("predict", results => {
    predictions = results;
  });

  // Hide the video element, and just show the canvas
  video.hide();

  //paricles
  updateParticles();
  setInterval(updateParticles, 1500);
}

function modelReady() {
  console.log("Model ready!");
}

/* ------------------------------------ draw ---------------------------------- */

function draw() {
  let col_bg = color(params.col_bg, 80+int(random(-5,5)), 93, 100)

  background(col_bg);
  
//   for (let p of particles) {
//     noStroke();
//     p.draw();
//     p.move();
// }

  createMask();
  video.mask(faceMask_graphic);
//   image(video, 0, 0, width, height);
//   image(eyes_graphic,0,0,width,height);
//   image(anim_graphic,0,0,width,height);

  faceMask_graphic.clear();
  eyeL_graphic.clear();
  eyeR_graphic.clear();
  mouthOut_graphic.clear();
  mouthIn_graphic.clear();
}


/* ------------------------------------ face generation ---------------------------------- */


// A function to draw ellipses over the detected keypoints
function createMask() {
  for (let i = 0; i < predictions.length; i += 1) {
    const keypoints = predictions[i].scaledMesh;
    //console.log(predictions[i]);

    /* ---------------------------------- Matching real-time facial points into array ---------------------------------- */
    
    for (let j = 0; j < keypoints.length; j += 1) {
      // newKeypoint = keypoint * newDimension / oldDimension
      const [x, y] = keypoints[j];
      keypoints_array.push([x,y]);
      // display keypoints
    //   textSize(3); 
    //   text(j,x,y);
        //ellipse(x, y, 0.5);
    }
    //console.log(keypoints_array);

    for(let j = 0; j< faceContour.length; j++){ //push face contour points into array
        const [x,y] = keypoints_array[faceContour[j]];
        faceContour_array.push([x,y]);
      }
    for(let j = 0; j < eyeptsL.length; j++){ //push left eye points into array
      const [x,y] = keypoints_array[eyeptsL[j]];
      eyeptsL_array.push([x,y]);
    }
    for(let j = 0; j< eyeptsR.length; j++){ //push right eye points into array
      const [x,y] = keypoints_array[eyeptsR[j]];
      eyeptsR_array.push([x,y]);
    }
    for(let j = 0; j< mouthOut.length; j++){ //push mouth outline points into array
        const [x,y] = keypoints_array[mouthOut[j]];
        mouthOut_array.push([x,y]);
    }
    for(let j = 0; j< mouthIn.length; j++){ //push mouth innerline points into array
    const [x,y] = keypoints_array[mouthIn[j]];
    mouthIn_array.push([x,y]);
    }

    /* ---------------------------------- color definition ---------------------------------- */
    
    let col_face = color(params.col_face, 80, 93, 100)
    let col_eye = color(params.col_eye, 80, 93, 100)
    //let col_eyeball = color(params.col_mouth, 80, 93, 100)
    let col_mouth = color(params.col_mouth, 80, 93, 100)

    /* ---------------------------------- Draw Face ---------------------------------- */
    
    //console.log(faceMask_graphic);
    faceMask_graphic.fill(col_face);
    faceMask_graphic.noStroke();
    faceMask_graphic.beginShape();
    for(let j = 0; j < faceContour_array.length; j++){
      const[x,y] = faceContour_array[j];
      curveVertex(x,y);
    //   point(x,y);
    }    
    faceMask_graphic.endShape(CLOSE);
    image(faceMask_graphic,0,0);
    image(faceMask_graphic,params.dist,-params.dist);
    image(faceMask_graphic,params.dist,params.dist);
    image(faceMask_graphic,-params.dist,params.dist);
    image(faceMask_graphic,-params.dist,-params.dist);

    /* ---------------------------------- Draw Eyes ---------------------------------- */

    push(); 

    //left eye
    eyeL_graphic.fill(col_eye);
    eyeL_graphic.noStroke();
    eyeL_graphic.beginShape();
    for(let j = 0; j < eyeptsL_array.length; j++){
      const[x,y] = eyeptsL_array[j];
      curveVertex(x,y);
    }
    eyeL_graphic.endShape(CLOSE);
    image(eyeL_graphic,0,0);
    image(eyeL_graphic,params.dist,params.dist);
    image(eyeL_graphic,params.dist,-params.dist);
    image(eyeL_graphic,-params.dist,params.dist);
    image(eyeL_graphic,-params.dist,-params.dist);
    //draw eye ball
    fill(col_mouth);
    noStroke();
    let mid_x_left = (keypoints[130][0] + keypoints[133][0])/2;
    let mid_y_left = (keypoints[130][1] + keypoints[133][1])/2;
    let dist_left = abs(keypoints[159][1] - keypoints[145][1]);
    ellipse(mid_x_left, mid_y_left, dist_left/2); 
    ellipse(mid_x_left + params.dist, mid_y_left  - params.dist,dist_left/2); 
    ellipse(mid_x_left + params.dist, mid_y_left + params.dist,dist_left/2); 
    ellipse(mid_x_left - params.dist, mid_y_left + params.dist,dist_left/2); 
    ellipse(mid_x_left - params.dist, mid_y_left - params.dist,dist_left/2); 

    //right eye
    eyeR_graphic.fill(col_eye);
    eyeR_graphic.noStroke();
    eyeR_graphic.beginShape();
    for(let j = 0; j < eyeptsR_array.length; j++){
      const[x,y] = eyeptsR_array[j];
      vertex(x,y);
    }
    eyeR_graphic.endShape(CLOSE);
    image(eyeR_graphic,0,0);
    image(eyeR_graphic,params.dist,params.dist);
    image(eyeR_graphic,params.dist,-params.dist);
    image(eyeR_graphic,-params.dist,params.dist);
    image(eyeR_graphic,-params.dist,-params.dist);
    //draw eye ball
    fill(col_mouth);
    noStroke();
    let mid_x_right = (keypoints[362][0] + keypoints[359][0])/2;
    let mid_y_right = (keypoints[362][1] + keypoints[359][1])/2;
    let dist_right = abs(keypoints[386][1] - keypoints[374][1]);
    ellipse(mid_x_right,mid_y_right,dist_right/2); 
    ellipse(mid_x_right + params.dist, mid_y_right  - params.dist,dist_right/2); 
    ellipse(mid_x_right + params.dist, mid_y_right + params.dist,dist_right/2); 
    ellipse(mid_x_right - params.dist, mid_y_right + params.dist,dist_right/2); 
    ellipse(mid_x_right - params.dist, mid_y_right - params.dist,dist_right/2); 

    pop();

    /* ---------------------------------- Draw Mouth ---------------------------------- */
    
    push();

    mouthOut_graphic.fill(col_mouth);
    mouthOut_graphic.noStroke();
    mouthOut_graphic.beginShape();
    for(let j = 0; j < mouthOut_array.length; j++){
      const[x,y] = mouthOut_array[j];
      curveVertex(x,y);
    }    
    mouthOut_graphic.endShape(CLOSE);
    image(mouthOut_graphic,0,0);
    image(mouthOut_graphic,params.dist,params.dist);
    image(mouthOut_graphic,params.dist,-params.dist);
    image(mouthOut_graphic,-params.dist,params.dist);
    image(mouthOut_graphic,-params.dist,-params.dist);
    //console.log(mouthOut_array,mouthOut_array.length);

    mouthIn_graphic.fill(col_face);
    mouthIn_graphic.noStroke();
    mouthIn_graphic.beginShape();
    for(let j = 0; j < mouthIn_array.length; j++){
      const[x,y] = mouthIn_array[j];
      curveVertex(x,y);
    }    
    mouthIn_graphic.endShape(CLOSE);
    image(mouthIn_graphic,0,0);
    image(mouthIn_graphic,params.dist,params.dist);
    image(mouthIn_graphic,params.dist,-params.dist);
    image(mouthIn_graphic,-params.dist,params.dist);
    image(mouthIn_graphic,-params.dist,-params.dist);
    pop();
 
     /* ---------------------------------- Clear ---------------------------------- */
    
    keypoints_array = [];
    faceContour_array = [];
    eyeptsL_array = [];
    eyeptsR_array = [];
    mouthOut_array = [];
    mouthIn_array = [];
    
  }
}

function orbit_dots(centerX,centerY,sampleX,sampleY){
  
  push();
  let dot_radius = 2;//step
  // let d1 = dist(centerX,centerY,x,y);
  let d2 = dist(centerX,centerY,sampleX,sampleY); //minRadius
  let d3 = dist(centerX,centerY,0,0);//maxRadius
  
  for(let i = d2+1; i<d3; i += dot_radius*3){
    fill('green');
    if(sampleX < centerX){
      x = sampleX-i;
      y = sampleY;
    }else if(sampleX == centerX){
      x = sampleX;
      y = sampleY+i;
    }else{
      x = sampleX-i;
      y = sampleY;
    }
    circle(x,y,dot_radius);
  }
  pop();
}


/* ------------------------------------ particles ---------------------------------- */

function updateParticles() {
	particles = [];
	
	for (let i = 0; i < parSettings.numParticle; i++) {
		let x_ = random(width);
		let y_ = random(height);
		let s_ = parSettings.circleSize;
		let c_ = color((random(15) + acc) % 100, 80, 93, 100);
		particles.push(new Particle(x_, y_, s_, c_));
	}
	acc += parSettings.colorZone;
}

function Particle(x_, y_, s_, c_) {
	this.x = x_;
	this.y = y_;
	this.size = s_;
	this.c = c_;

	this.alpha = 100;
	this.dist = 1;

	this.move = function () {
		let theta =
			noise(this.x * parSettings.squiggliness, this.y * parSettings.squiggliness) * PI * parSettings.angle;
		let v = p5.Vector.fromAngle(theta, this.dist);
		this.x += v.x;
		this.y += v.y;
		this.dist *= 0.9999;
		this.alpha *= parSettings.lineLength;
	};

	this.draw = function () {
		this.c.setAlpha(this.alpha);
		fill(this.c);
		circle(this.x, this.y, this.size);
		this.y += random();
		this.c.setAlpha(100);
	};
}


/* ------------------------------------ utility ---------------------------------- */

function saveCanvas(canvas) {
	saveCanvas(canvas, "img", "jpg");
}

function keyPressed() {
    if (keyCode == 83) {
        saveCanvas('img', '.jpg');
    }
}
