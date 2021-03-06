const PRECISION = 8;

//constants
const PTRAD = .025; //radius for point  icon

var points = [];
var elements = [];
var segments = [];
var golden = [];

// connect to SVG element
var D = SVG("drawing").panZoom({zoomMin: 50, zoomMax: 300, zoomFactor: 1.5});

//use groups as layers to keep points on top and selectable
var groupCircles = D.group().attr({ id: "Circles" });
var groupLines = D.group().attr({ id: "Lines" });
var groupSegments = D.group().attr({ id: "Segments" });
var groupPoints = D.group().attr({ id: "Points"  });

/* ****************************************************************/
function Point(x, y, parent1, parent2) {

  //if someone calls function without instantiating object - return new object
  if (!(this instanceof Point)) {
    return new Point(x, y, parent1, parent2);
  }

  this.id = points.length;
  this.type = "point";

  console.groupCollapsed( `+ ${this.type} : ${this.id} ` );

  // trust that the values are ok
  this.x = x;
  this.y = y;
  this.xVal = getNumber( this.x );
  this.yVal = getNumber( this.y );

  this.parents = [];
  //first points have no parents
  if (parent1 && parent2) {
    this.parents = [parent1, parent2];
  }

  //TODO: make the point an SVG symbol

  this.element = groupPoints.circle(PTRAD * 2).cx(this.xVal).cy(this.yVal)
    .addClass("Point")
    .attr({
      id: 'p' + this.id,
      'point-id': this.id
    });
  points.push(this);

  setPoint("#p" + this.id);

  this.distanceTo = distanceTo;
  this.addParent = addParentToList;

  this.element.on('click', click);
  this.element.on('mouseover', hover);
  this.element.on('mouseout', hover);


  this.toString = function() {

    var str = `${this.type}: ${this.id}
  x: ${this.x}
  y: ${this.y}
  parents: ${this.parents.length}\n`;
    this.parents.forEach( function(parent){
      str += "    " +  parent.type + " :\t" + parent.id + "\n";
    });

    return str;
  }

  logPoint(this);
  // log(this);
  console.dir(this);
  console.groupEnd();
}

// add a point but check if it exists first
function addPoint(x, y, parent1, parent2) {
  // log(`    + add point: ${x}, ${y} `);
  var point;

  // log("addPoint: " + x + " " + y);

  // TODO: determine if value check is necessary
  var xVal = getNumber(x);
  var yVal = getNumber(y);

  if (!isNaN( xVal ) && !isNaN( yVal )) {

    //look for other points with same x, y
    //if point exists, add unique "parents" to point
    point = findPoint(x, y);

    if (point) {
      // log("      - found point: " + point.id);

      // add new parents to existing point
      point.addParent(parent1);
      point.addParent(parent2);

    } else {

      point = new Point(x, y, parent1, parent2);
      // log("      - new point: " + point.id);

    }
  } else {
    // log("      * not a valid point\n");
    return;
  }

  //add point to parent point list
  parent1.addPoint(point);
  parent2.addPoint(point);

  return point;

}

//add a parent to the point
function addParentToList(parent) {
  // check if parent is already in list
  if (!this.parents.includes(parent)) {
    // add new parent to point
    this.parents.push(parent);
    // log("        add parent: " + parent.id + " to: " + this.id);
  }
}

//add a point to the parent element
function addPointToList(point) {
  // check if point is already in list
  // log("        add point: " + point.id + " to: " + this.id);

  if (!this.points.includes(point)) {
    // add new point to parent
    this.points.push(point);
    // log("        add point: " + point.id + " to: " + this.id);
  }

}

// for sorting points
function comparePoints(p1, p2) {
  var p1x = p1.xVal;
  var p1y = p1.yVal;
  var p2x = p2.xVal;
  var p2y = p2.yVal;

  if (p1x < p2x) {
    return -1;
  }
  if (p1x > p2x) {
    return 1;
  }

  //compare strings for equality - not values
  if (p1.x === p2.x) {
    if (p1y < p2y) {
      return -1;
    }
    if (p1y > p2y) {
      return 1;
    }
  }
  // a must be equal to b
  return 0;
}

/* ****************************************************************/
function Line(pt1, pt2) {

  if (!(this instanceof Line)) {
    return new Line(pt1, pt2);
  }

  this.id = elements.length;
  this.type = "line";

  console.groupCollapsed( `+ ${this.type} : ${this.id} ` );

  this.points = [];

  this.points[0] = pt1;
  this.points[1] = pt2;

  this.addPoint = addPointToList;

  //calculate equation 1 coefficients
  // ax + by + c form
  var cmd = `clearall
  a = (${pt1.y}) - (${pt2.y})
  a
  b = (${pt2.x}) - (${pt1.x})
  b
  c = ((${pt1.x}) * (${pt2.y})) - ((${pt2.x}) * (${pt1.y}))
  c
  eq = a * x + b * y + c
  eq
  `;

  // run script and parse result
  // returns a, b, c, eq
  var result = alg(cmd).split("\n");

  this.a = result[0];
  this.b = result[1];
  this.c = result[2];
  this.eq = result[3];

  //calculate equation 1 coefficients
  // y = mx + n form
  // var bVal = getNumber(this.b);
  if (this.b != "0") {

    var scmd = `
    # i think a should be negative
    m = -(a) / (b)
    m
    n = -(c) / (b)
    n
    eq2 = m * x + n
    eq2
    `;

    // run script and parse result
    // returns m, n, eq2
    var result = alg(cmd).split("\n");

    this.m = result[0];
    this.n = result[1];
    this.eq2 = result[2];

  }

  // set xRoot if not horizontal
  if (this.a != 0) {
    this.xRoot = alg( `roots(eq, x)` );
  } else {
    // leave undefined
  }

  // set yRoot if not vertical
  if (this.b != 0) {
    this.yRoot = alg( `roots(eq, y)` );
  } else {
    // leave undefined
  }

  //////////////////////////////////////////////
  // get y value for corresponding x
  this.getY = function(x) {
    var y, deg;
    if (this.yRoot) {
      deg = alg( `deg(${this.yRoot})` );
      if (deg == 1) {
        y = alg( `subst((${x}), x, (${this.yRoot}))` );
      } else {
        y = this.yRoot;
      }
    } else {
      // y is undefined
    }
    return y;
  }

  // get x value for corresponding y
  this.getX = function(y) {
    var x, deg;
    if (this.xRoot) {

      deg = alg( `deg(${this.xRoot})` );
      if (deg == 1) {
        x = alg( `subst((${y}), y, (${this.xRoot}))` );
      } else {
        x = this.xRoot;
      }
    } else {
      // x is undefined
    }
    return x;
  }

  //////////////////////////////////////////////
  // draw line to edge of the viewbox
  var box = getViewboxIntersection(this);
  // log(box);
  //create SVG element
  this.element = groupLines.line(box[0], box[1], box[2], box[3])
    .addClass("Line")
    .attr({
      id: "i" + this.id,
      'element-id': this.id
    })
    ;

  setLine("#i" + this.id);

  //check for intersections with existing elements
  // this.intersect = lineIntersect;
  elements.forEach(function(element) {
    lineIntersect (this, element) ;
  }, this);


  //add this element to array
  elements.push(this);

  // set UI hover and click
  this.element.on('click', click);
  this.element.on('mouseover', hover);
  this.element.on('mouseout', hover);

  // summarize attributes for toString
  this.toString = function() {
    var str = `${this.type}: ${this.id}
      a: ${this.a}
      b: ${this.b}
      c: ${this.c}
     eq: ${this.eq} [ = 0 ]
      m: ${this.m}
      n: ${this.n}
    eq2: [ y = ] ${this.eq2}
  xRoot: ${this.xRoot}
  yRoot: ${this.yRoot}
  points: ${this.points.length}\n`;
    // list related points
    this.points.forEach( function(point){
      str += "    " +  point.type + " :\t" + point.id + "\n";
    });
    return str;
  }

  logLine(this);
  // log(this);
  console.dir(this);
  console.groupEnd();

}

function lineIntersect (line, element) {

  //intersect this Line with Line
  if ((element instanceof Line)) {
    intersectLineLine(line, element);
  }

  //intersect this Line with Circle
  if ((element instanceof Circle)) {
    intersectLineCircle(line, element);
  }

}

function intersectLineLine (line1, line2) {
  // log("  > intersect: l1:" + line1.id + " l2:" + line2.id);
  var x, y;

  if (line1.m == line2.m) {
    //lines are parallel;
    // log("    lines are parallel");
    return;
  }

  var test1 = alg(`(${line1.a}) * (${line2.b})`)
  var test2 = alg(`(${line2.a}) * (${line1.b})`)

  if ( test1 == test2 ) {
    //lines are parallel;
    // log("    lines are parallel");
    return;
  }


  //check if line2 line is vertical
  if ( line1.b !== "0") {
    x = alg(`( (${line2.b}) * (${line1.c}) - (${line1.b}) * (${line2.c}) )/( (${line2.a}) * (${line1.b}) - (${line1.a}) * (${line2.b}) )`);
    y = line1.getY(x);
    addPoint(x, y, line1, line2);
  } else {
    //line is vertical
    // log("   l1:" + line1.id + " vertical\n");
    x = '0'; //TODO: i think this needs to be a / c
    y = line2.getY(x);
    addPoint(x, y, line1, line2);

  }
}

function intersectLineCircle (line, circle) {

  // log("  > intersect: l:" + line.id + " c:" + circle.id);
  var r = circle.r;
  var h = circle.h;
  var k = circle.k;

  if ((line.xRoot)) {
    // if not vertical solve for y
    alg(`
    C = ${circle.eq}
    L = ${line.xRoot}
    S = subst(L,x,C)`);

    var deg = alg(`deg(S)`);

    var x, y;

    // TODO: get roots as array
    for (var i = 1; i <= deg; i++) {
      y = alg(`roots(S, y)[${i}]`);
      x = line.getX(y);
      if (checkValid(x) && checkValid(y)) {
        log("    > add circle intersection: " + x + ", " + y);
        addPoint(x, y, line, circle);
      } else {
        log(`    not a valid point: [${x}, ${y}]`);
      }

    }

  } else {
    // if vertical solve for x
    alg(`
    C = ${circle.eq}
    L = ${line.yRoot}
    S = subst(L,y,C)`);

    var deg = alg(`deg(S)`);

    var x, y;

    // TODO: get roots as array
    for (var i = 1; i <= deg; i++) {
      x = alg(`roots(S, x)[${i}]`);
      y = line.getY(x);

      if (checkValid(x) && checkValid(y)) {
        log("    > add circle intersection: " + x + ", " + y);
        addPoint(x, y, line, circle);
      } else {
        log(`    not a valid point: [${x}, ${y}]`);
      }
    }
  }
}


/* ****************************************************************/
function Circle(centerPoint, radiusPoint) {

  if (!(this instanceof Circle)) {
    return new Circle(centerPoint, radiusPoint);
  }

  this.id = elements.length;
  this.type = "circle";

  console.groupCollapsed( `+ ${this.type} : ${this.id} ` );

  //center point is not a point on the circle
  this.points = [radiusPoint];
  this.addPoint = addPointToList;

  this.center = centerPoint;

  // x offest
  this.h = centerPoint.x;

  // y offset
  this.k = centerPoint.y;

  //get radius length
  this.r = centerPoint.distanceTo(radiusPoint);

  // generate equation for circle
  // (x - h)^2 + (y - k)^2 + r^2
  this.eq = Algebrite.run( `clearall
    (x - (${this.h}))^2 + (y - (${this.k}))^2 - (${this.r})^2` );
  // log("   eq: " + this.eq);



  //TODO: whay does the radius need to be multiplied by 2??
  var cx = getNumber( centerPoint.x );
  var cy = getNumber( centerPoint.y );
  var r = getNumber( this.r );

  this.element = groupCircles.circle( r * 2 )
    .cx(cx)
    .cy(cy)
    .addClass("Circle")
    .attr({
      'id': `c${this.id}`,
      'element-id': this.id
      });

  setCircle("#c" + this.id);

  // find all intersections with other elements
  elements.forEach(function(element) {
    circleIntersect (this, element) ;
  }, this); //pass this context in

  // elements.forEach( function(element){
  // });

  // add this to elements array
  elements.push(this);

  //TODO: rotate circle to align start point with Radius

  //UI interactvity
  this.element.on('click', click);
  this.element.on('mouseover', hover);
  this.element.on('mouseout', hover);


  this.toString = function() {
    var str = `${this.type} - ${this.id}
    c pt: ${this.center.id} : ${this.center.x}, ${this.center.y}
       h: ${this.h}
       k: ${this.k}
       r: ${this.r}
      eq: ${this.eq} = 0
  points: ${this.points.length}\n`;
  //TODO: list related points
    this.points.forEach( function(point){
      str += "    " +  point.type + " :\t" + point.id + "\n";
    });

    return str;
  }

  logCircle(this);
  // log(this);

  console.dir(this);
  console.groupEnd();
}

//used in Point object
function distanceTo(point) {
  var d = Algebrite.run(
    `(( ((${this.x}) - (${point.x}))^2 + ((${point.y}) - (${this.y}))^2 )^(1/2))` );
  // log("  d: " + d);
  return d;
}

function circleIntersect (circle, element) {
  //intersect this Line with Line
  if ((element instanceof Line)) {
    intersectLineCircle(element, circle);
  }

  //intersect this Line with Circle
  if ((element instanceof Circle)) {
    intersectCircleCircle(circle, element);
  }
}

function intersectCircleCircle(c1, c2) {
  log("  > intersect: c1:" + c1.id + " c2:" + c2.id);

  // Algebrite Script
  var cmd = `
  C1 = ${c1.eq}
  C2 = ${c2.eq}
  # subtract two circle equations
  # this should provide a linear equation
  S = C1 - C2

  # solve this equation for x
  X = roots(S, x)

  # substitute this x value into a circle equation
  Y = subst(X, x, C1)

  # solve for y
  roots(Y, y)
`;

  var result = alg(cmd);

  if ( checkValid(result) ) {
    var yRoots = result.replace("[", "").replace("]", "").split(",");

    // substitute each y value into the linear equation
    yRoots.forEach( function(y) {
      var x = alg(`subst(${y}, y, X)`);

      //check values
      if (checkValid(x) && checkValid(y)) {
        log("    > add circle intersection: " + x + ", " + y);
        addPoint(x, y, c1, c2);
      } else {
        log(`    not a valid point: [${x}, ${y}]`);
      }
    })

  } else {

    // solve for x-roots
    cmd = `
    C1 = ${c1.eq}
    C2 = ${c2.eq}
    # subtract two circle equations
    # this should provide a linear equation
    S = C1 - C2

    Y = roots(S, y)
    X = subst(Y, y, C1)
    roots(X, x)
    `;

    var result = alg(cmd);

    if ( checkValid(result) ) {
      var xRoots = result.replace("[", "").replace("]", "").split(",");

      xRoots.forEach( function(x) {
        var y = alg(`subst(${x}, x, Y)`);
        //check values
        if (checkValid(x) && checkValid(y)) {
          log("    > add circle intersection: " + x + ", " + y);
          addPoint(x, y, c1, c2);
        } else {
          log(`    not a valid point: [${x}, ${y}]`);
        }
      })
    }
  }

}


function findPoint(x, y) {
  for (var i = 0; i < points.length; i++) {
    if ( points[i].x == x  &&  points[i].y == y ) {
      return points[i];
    }
  }
}

function round(number) {
  var factor = Math.pow(10, PRECISION);
  return Math.floor(number * factor) / factor;
}

function getElementById(id) {
  for (i = 0; i < elements.length; i++) {
    if (elements[i].id == id) {
      return elements[i];
    }
  }
}
function getPointById(id) {
  for (i = 0; i < points.length; i++) {
    if (points[i].id == id) {
      return points[i];
    }
  }
}


var click = function() {
  this.toggleClass('click');
  log("click");
}

//us hover event
var hover = function() {
  this.toggleClass('hover');

  var element;
  var latex;

  if (this instanceof SVG.Circle) {
    if (this.hasClass("Circle")) {
      var id = this.attr( 'element-id' );
      element = elements[id];
      latex = alg(`printlatex(${element.eq})`) + "= 0"
      // info = getElementById(this.attr('element-id')).toString();
    } else {
      //then point
      var id = this.attr( 'point-id' );
      element = points[id];
      latex = alg(`printlatex([ ${element.x}, ${element.y} ])`)
      // info = getPointById(this.attr('point-id')).toString();
    }
  }
  if (this instanceof SVG.Line) {
    if (this.hasClass("Line")) {
      var id = this.attr( 'element-id');
      // log('    id:' + id)
      element = elements[id];
      // latex = alg(`printlatex(${element.eq})`) + "= 0\n";
      latex = "y = " + alg(`printlatex(${element.eq2})`);
      // info = getElementById(this.attr('element-id')).toString();
    } else if (this.hasClass("Segment")) {
      //then point
      var id = this.attr( 'segment-id' );
      element = segments[id];
      latex = alg(`printlatex([ ${element.length} ])`)
      // info = getPointById(this.attr('point-id')).toString();
    }
  }

  // log(info);
  infoPanel.innerHTML = element;
  footerPanel.innerHTML = element.type + " " + element.id + ":  " + katex.renderToString(latex);

  // log(info);

  // log("hover: " + this.hasClass('hover'));
}


function Segment(pt1, pt2, line) {

  if (!(this instanceof Segment)) {
    return new Segment(pt1, pt2);
  }

  this.id = segments.length;
  this.type = "segment";
  this.line = line;

  log( `+ ${this.type} : ${this.id} ` );

  this.points = [pt1, pt2];
  this.points.sort( comparePoints );


  this.length = pt1.distanceTo(pt2);
  this.lengthVal = alg(`float(${this.length})`);

  var p1x = pt1.xVal;
  var p1y = pt1.yVal;
  var p2x = pt2.xVal;
  var p2y = pt2.yVal;


  this.element = groupSegments.line(p1x, p1y, p2x, p2y)
    .addClass("Segment")
    .attr({
      id: "s" + this.id,
      'segment-id': this.id,
      'stroke-width': this.lengthVal / 25
    })
    .marker('start', 4, 4, function(add) {
      add.circle(2).center(2,2)
    })
    .marker('end', 4, 4, function(add) {
      add.circle(2).center(2,2)
    })

  this.markerStart = this.element.attr('marker-start').replace("url(", "").replace(")", "")
  this.markerEnd = this.element.attr('marker-end').replace("url(", "").replace(")", "")

  setSegment("#s" + this.id);

  //add this element to array
  segments.push(this);

  this.element.on('click', click);
  this.element.on('mouseover', hover);
  this.element.on('mouseout', hover);


  this.toString = function() {
    var str = `${this.type}: ${this.id}
  length: ${this.length}
  lengthVal: ${this.lengthVal}
  points: ${this.points.length}\n`;
  //TODO: list related points
    this.points.forEach( function(point){
      str += "    " +  point.type + " :\t" + point.id + "\n";
    });
    return str;
  }

  // geometor_logo(this);
  // log(this);
}
