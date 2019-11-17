import Point from './point.js';
import Line from './line.js';

const Engine = (function(global) {
    const doc = global.document,
	  win = global.window,
	  canvas = doc.createElement('canvas'),
	  ctx = canvas.getContext('2d'),
	  canvasWidth = 600,
	  canvasHeight = 600,
	  spinToggleButton = doc.getElementById('spinToggleButton'),
	  spinToggleButtonState = {clicked: false, started: false, stopped: true},
	  resetButton = doc.getElementById('resetButton'),
	  blueCounter = doc.getElementById('blueCounter'),
	  brownCounter = doc.getElementById('brownCounter'),
	  states = {
	      is_spinning: false,
	      debug: false
	  };

	  
    let lastTime,
	lastBlueHalf,
	lastBrownHalf,
	line,
	pointsOnScreen = [],
	points = [
	    [295, 544],
	    [140, 77],
	    [548, 511],
	    [153, 179],
	    [338, 520],
	    [110, 244],
	    [365, 292],
	    [211, 396],
	    [409, 235],
	    [285, 357],
	    [552, 256]
	];

    const canvasClickEventListener = function(event) {
	const clickRange = 8;
	const rect = canvas.getBoundingClientRect();
	const clickedX = event.clientX - rect.left;
	const clickedY = event.clientY - rect.top;

	let pointClicked = false,
	    i = 0;

	while (!pointClicked && i < points.length) {
	    const dX = points[i][0] - clickedX,
		  dY = points[i][1] - clickedY,
		  inRange = Math.abs(Math.pow((dX*dX + dY*dY), 0.5)) <= clickRange;

	    if (inRange) {
		pointClicked = true;
		if (!pointsOnScreen[i].getIsOrigin()) {
		    const newOrigin = points.splice(i, 1);
		    points.splice(0, 0, newOrigin[0]);
		    reset();
		}
	    }
	    i += 1;
	}
    };

    canvas.innerText = 'Oops! Looks like your browser is not supported :(';
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    canvas.addEventListener('click', canvasClickEventListener);

    doc.getElementById('canvasContainer').appendChild(canvas);

    const setButtonStateToStopped = function(btn) {
	btn.innerText = "Start";
	btn.classList.add('stopped');
	btn.classList.remove('started');
	spinToggleButtonState.started = false;
	spinToggleButtonState.stopped = true;
    };
    const setButtonStateToStarted = function(btn) {
	btn.innerText = "Stop";
	btn.classList.remove('stopped');
	btn.classList.add('started');
	spinToggleButtonState.stopped = false;
	spinToggleButtonState.started = true;
    };
    
    const spinToggleButtonClickEventListener = function(event) {
	if (!spinToggleButtonState.clicked) {
	    spinToggleButtonState.clicked = true;
	    if (spinToggleButtonState.started) {
		stopSpinning();
		setButtonStateToStopped(this);

	    } else if (spinToggleButtonState.stopped) {
		startSpinning();
		setButtonStateToStarted(this);
	    }
	    spinToggleButtonState.clicked = false;
	}
    };

    spinToggleButton.addEventListener('click', spinToggleButtonClickEventListener);

    resetButton.addEventListener('click', event => {
	reset();
    });

    /**
     * Returns angle of a vector given its x and y components.
     *
     * _Math.atan_ returns value between 90 degrees and -90 degress.
     * This function transforms the answer to be within the range of a full circle (0 degress to 360 degree)
     *
     * A vector points to (1, 0) has an angle of 0 degree (or 360 degree)
     */
    const getVectorAngle = function(x, y) {
        let vectorAngle = Math.atan(y / x);

	if (vectorAngle < 0) {
	    if (x < 0) {
		vectorAngle += Math.PI;
	    } else if (x > 0) {
		vectorAngle += (2 * Math.PI);
	    }
	} else if (vectorAngle >= 0) {
	    if (x < 0) {
		vectorAngle += Math.PI;
	    }
	}

	return vectorAngle;
    };
    
    /**
     * Returns the angle between a line and a vector, which goes from the origin of the line to a point.
     *
     */
    const getAngleBetweenPointAndLine = function(point, line) {
	// vector starts from line's origin, pointing at point
	const vectorX = point.getX() - line.getOrigin().getX(),
	      vectorY = point.getY() - line.getOrigin().getY(),
	      vectorAngle = getVectorAngle(vectorX, vectorY);

	point.log({angle_self: vectorAngle});

	let angleBetweenVectorAndLine = vectorAngle - line.getAngle();

	if (angleBetweenVectorAndLine > (2 * Math.PI)) {
	    angleBetweenVectorAndLine %= (2 * Math.PI);
	} else if (angleBetweenVectorAndLine < 0) {
	    angleBetweenVectorAndLine %= (2 * Math.PI);
	    angleBetweenVectorAndLine += (2 * Math.PI);
	}

	return angleBetweenVectorAndLine;
    };

    const getNewPoint = function(newSet, oldSet) {
	// new point is always in new set
	let newPoint;

	newSet.forEach(point => {
	    if (!oldSet.includes(point)) {
		newPoint = point;
	    }
	});

	return newPoint;
    };

    const resetEntities = function() {
	line = null;
	lastBlueHalf = null;
	lastBrownHalf = null;
	pointsOnScreen = [];
    };
    
    const setupEntities = function() {
	points.forEach((point, index) => {
	    const newPoint = new Point(point[0], point[1]);
	    if (index === 0) {
		line = new Line(newPoint, [point[0], point[1]/2]);
	    }
	    pointsOnScreen.push(newPoint);
	});
	line.getOrigin().setAsOrigin();
    };

    
    const init = function() {
	resetEntities();
	setupEntities();
	lastTime = Date.now();
	main();
	render();
    };
    
    const main = function() {
	const now = Date.now(),
	      dt = (now - lastTime) / 1000.0;

	let blueHalf = [],
	    brownHalf = [];
	
	pointsOnScreen.forEach((point, index, arr) => {
	    if (point !== line.getOrigin()) {
		const angle = getAngleBetweenPointAndLine(point, line);
		point.log({angle_rel: angle});
		if (angle <= Math.PI) {
		    point.setBlue();
		    blueHalf.push(point);
		} else {
		    point.setBrown();
		    brownHalf.push(point);
		}
	    }
	});
	if (lastBlueHalf && lastBrownHalf) {
	    let newOrigin;
	    if (lastBlueHalf.length > blueHalf.length) {
		// blue -> brown: the new origin is in brown
		newOrigin = getNewPoint(brownHalf, lastBrownHalf);
	    } else if (lastBlueHalf.length < blueHalf.length) {
		// brown -> blue: the new origin is in blue
		newOrigin = getNewPoint(blueHalf, lastBlueHalf);
	    }
	    if (newOrigin) {
		const oldOrigin = line.getOrigin();
		pointsOnScreen.forEach(point => {
		    point.unsetAsOrigin();
		});
		newOrigin.setAsOrigin();
		line.setOrigin(newOrigin);
		lastBlueHalf = null;
		lastBrownHalf = null;
	    }
	    
	} else {
	    lastBlueHalf = blueHalf;
	    lastBrownHalf = brownHalf;
	}

	blueCounter.innerText = blueHalf.length;
	brownCounter.innerText = brownHalf.length;
	
	if (states.is_spinning) {
	    update(dt);
	    render();
	}

	lastTime = now;
	
	win.requestAnimationFrame(main);
    };

    const update = function(dt) {
	pointsOnScreen.forEach(entity => {
	    entity.update(dt);
	});
	line.update(dt);
    };
    const render = function() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	drawGrid();
	
	pointsOnScreen.forEach(entity => {
	    entity.render(ctx);
	});
	line.render(ctx);

	if (states.debug) {
	    pointsOnScreen.forEach(entity => {
		entity.renderLog(ctx);
	    });
	    line.renderLog(ctx);
	}
    };

    const drawGrid = function() {

	const gridDivisions = 10,
	      canvasWidth = canvas.width,
	      canvasHeight = canvas.height,
	      horizontalInterval = Math.floor(canvasWidth / gridDivisions),
	      verticalInterval = Math.floor(canvasHeight / gridDivisions);

	let horizontalDivisionPosition = horizontalInterval,
	    verticalDivisionPosition = verticalInterval;

	ctx.strokeStyle = 'lightgrey';
	ctx.strokeRect(0, 0, canvasWidth, canvasHeight);
	// draw horizontal grid lines
	for(let i = 1; i <= gridDivisions; i++) {
	    ctx.beginPath();
	    ctx.moveTo(0, horizontalDivisionPosition, );
	    ctx.lineTo(canvasWidth, horizontalDivisionPosition);
	    ctx.stroke();
	    horizontalDivisionPosition += horizontalInterval;
	    
	}

	// draw vertical grid lines
	for(let i = 1; i <= gridDivisions; i++) {
	    ctx.beginPath();
	    ctx.moveTo(verticalDivisionPosition, 0);
	    ctx.lineTo(verticalDivisionPosition, canvasHeight);
	    ctx.stroke();
	    verticalDivisionPosition += verticalInterval;
	    
	}

	ctx.strokeStyle = 'black';
    };
    
    const startSpinning = function() {
	states.is_spinning = true;
    };

    const stopSpinning = function() {
	states.is_spinning = false;
    };

    const reset = function() {
	stopSpinning();
	setButtonStateToStopped(spinToggleButton);
	init();
    };
    
    init();

})(window);
