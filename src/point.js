function Point(x, y) {
    this.position = {x: x, y: y};
    this.states = {
	is_origin: false,
	visited: false,
	nearest: false,
	is_blue: false,
	is_brown: false
    };
    this.debug = {};

};

Point.prototype = {
    constructor: Point,
    reset: function() {
	this.states.is_origin = false;
	this.states.visited = false;
    },

    visit: function() {
	this.states.visited = true;
    },
    getX: function() {
	return this.position.x;
    },
    getY: function() {
	return this.position.y;
    },
    setAsOrigin: function() {
	this.states.is_origin = true;
	this.visit();
    },

    unsetAsOrigin: function() {
	this.states.is_origin = false;
    },
    getIsOrigin: function() {
	return this.states.is_origin === true;
    },
    setBlue: function() {
	this.states.is_blue = true;
	this.states.is_brown = false;
    },
    setBrown: function() {
	this.states.is_brown = true;
	this.states.is_blue = false;
    },
    update: function(dt) {
	return false;
    },
    render: function(ctx) {
	let specialColor = 'black';
	if (this.states.is_origin) {
	    specialColor = 'red';

	} else if (this.states.is_blue) {
	    specialColor = 'blue';
	    
	} else if (this.states.is_brown) {
	    specialColor = 'brown';
	}
	    
	ctx.fillStyle = specialColor;
	if (this.states.visited) {
	    ctx.beginPath();
	    ctx.arc(this.position.x, this.position.y, 10, 0, 2*Math.PI);
	    ctx.fill();
	    ctx.fillStyle = 'white';
	    ctx.beginPath();
	    ctx.arc(this.position.x, this.position.y, 8, 0, 2*Math.PI);
	    ctx.fill();
	}
	ctx.fillStyle = specialColor;

	ctx.beginPath();
	ctx.arc(this.position.x, this.position.y, 6, 0, 2*Math.PI);
	ctx.fill();
	ctx.fillStyle = 'black';

    },
    log:function(logObj) {
	Object.assign(this.debug, logObj);
    },
    renderLog: function(ctx) {
	let positionDelta = 20;
	for (let name in this.debug) {
	    if (this.debug.hasOwnProperty(name)) {
		ctx.fillText(this.debug[name], this.getX(), this.getY() + positionDelta);
		positionDelta += 20;
	    }
	}	
    }
};

export default Point;



