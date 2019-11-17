function Line(start, end) {
    // div by 0 gets us Inf/-Inf and atan can handle that
    let angle = Math.atan((end[1] - start.position.y) / (end[0] - start.position.x));
    if (angle < 0) {
	angle += (2 * Math.PI);
    }
    this.initialStates = {origin: start, angle: angle};
    this.currentStates = {origin: start, angle: angle};
};

Line.prototype = {
    constructor: Line,
    rotate: function(angle) {
	this.currentStates.angle += angle;
	if (this.currentStates.angle >= 2 * Math.PI) {
	    this.currentStates.angle = this.currentStates.angle % (2 * Math.PI);
	}
    },
    setOrigin: function(point) {
	this.currentStates.origin = point;
    },
    getOrigin: function() {
	return this.currentStates.origin;
    },
    reset: function() {
	this.currentStates.origin = this.initialStates.origin;
	this.currentStates.angle = this.initialStates.angle;
    },
    getAngle: function() {
	return this.currentStates.angle;
    },
    getCartCoordinate: function() {
	return {slope: 0, intercept: 0};
    },
    update: function(dt) {
	// 2 RPM, 4pi/min, 4pi/60sec, 1/15pi per sec
	const angleDelta = (Math.PI / 8.0) * dt * 2;
	this.rotate(angleDelta);
	

    },
    render: function(ctx) {
	const radius = 1000.0;

	const originX = this.currentStates.origin.position.x;
	const originY = this.currentStates.origin.position.y;

	ctx.beginPath();
	ctx.moveTo(originX, originY);
	const angle1 = this.currentStates.angle;
	const x1 = (originX) + (radius * Math.cos(angle1));
	const y1 = (originY) + (radius * Math.sin(angle1));
	ctx.lineTo(x1, y1);
	ctx.stroke();
	
	ctx.strokeStyle = 'red';
	ctx.beginPath();
	ctx.moveTo(originX, originY);
	const angle2 = this.currentStates.angle + Math.PI;
	const x2 = (originX) + (radius * Math.cos(angle2));
	const y2 = (originY) + (radius * Math.sin(angle2));
	ctx.lineTo(x2, y2);
	ctx.stroke();
	ctx.strokeStyle = 'black';
    
    },
    log: function(ctx) {
	Object.assign(this.debug, logObj);
    },
    renderLog: function(ctx) {
	ctx.fillText(`Line angle(radians): (${this.getAngle()})`, 200, 100);
	ctx.fillText(`Line origin at: (${this.getOrigin().getX()}, ${this.getOrigin().getY()})`, 200, 150);

    }
    
};

export default Line;
