var tl ;

$( document ).ready(function() {
    console.log( "ready!" );
    main();
    // tl.stop();
    // tl.timeScale(2);
    tl.play();
    // tl.tweenFromTo( fromThisLabel, toThisLabel );

});

function main() {

  tl = new TimelineMax({
    repeat: 0,
    repeatDelay: 5
  });

  hideAllElements();

  zoomToElement(".view01", 50);

  // tl.addPause("blank");

  //build sequence
  setPoint("#g000w");
  setPoint("#g000e");

  // tl.addPause("unit points");

  setLine("#i00");
  strokeLine("#i00");

  // tl.addPause("baseline");

  strokeLine("#Q1");
  // tl.addPause("unit");

  sweepRadius("#c00aw", "#Q1"); //vesica piseces
  unStrokeLine("#Q1");

  strokeLineReverse("#Q1");
  sweepRadius("#c00ae", "#Q1");
  // tl.addPause("vesica");
  unStrokeLine("#Q1");

  setPoint(".Point.s001");

  // setPoint(["#p003w", "#p003e"]); //unit poles

  strokeLine("#b01"); //perp bisector
  setPoint("#p002");

  root3sequence()
  root5sequence()
  root2sequence()

  root5review()
  root3review()
  showSectors()

}


function root3sequence() {

  var set1 = [
    "#i02ae",
    "#i02aw",
    "#i02be",
    "#i02bw",
  ];

  strokeLine("#i02ae"); //trilateral lines
  strokeLine("#i02aw");
  strokeLine("#i02be");
  strokeLine("#i02bw");

  setPoint(".Point.s009");

  setPolygon("#y3n"); //polygon

  strokeLine("#i04ae"); //diagonals
  strokeLine("#i04aw");
  // strokeLine("#i04be");
  // strokeLine("#i04bw");

  setPoint("#p015n"); //circumcenter
  // setPoint("#p015s");

  strokeLine("#r04an");
  sweepRadius("#c04an", "#r04an"); //circumcircles
  // sweepRadius("#c04as", "#r04as");
  unStrokeLine("#r04an");


  setPoint("#g003w", "begin"); //g section 02
  setPoint("#g003e");
  strokeLine("#g002a2");
  strokeLine("#g002b");
  strokeLine("#g002a1");
  // tl.addPause("g02.r3");

  var removeSet = [
    "#c04an",
    "#y3n",
    "#i04ae",
    "#i04aw",
    "#i02ae",
    "#i02aw",
    "#i02be",
    "#i02bw",
    "#p015n",
    "#p015s",
  ];
  fadeElements(removeSet);
  fadeElements(".Segment.s002");

  // end first set
}

function root5sequence() {
  //root 5 ************

  zoomToElement(".view02", 50);



  // zoomToElement(".view01", 50);

  strokeLine("#r00a");
  sweepRadius("#c00bw", "#r00a"); //unit 2 circles
  unStrokeLine("#r00a");

  strokeLine("#r00b");
  sweepRadius("#c00be", "#r00b");
  unStrokeLine("#r00b");

  setPoint(["#g002n", "#g002s"]); //g section 01

  // first golden section
  strokeLine("#g001a2");
  strokeLine("#g001b");
  strokeLine("#g001a1");

  hideElements(".Segment.s001");


  // tl.addPause("g01");

  sweepRadius("#c00cw", "#r00b"); //unit 2 circles
  sweepRadius("#c00ce", "#r00a");

  setPoint("#p005ne");
  setPoint("#p005se");

  strokeLine("#i01ae"); //unit perps

  setPoint("#p005nw");
  setPoint("#p005sw");

  strokeLine("#i01aw");

  zoomToElement(".view01", 50);


  setPoint(".Point.s006"); //square points

  removeSet = [
    "#c00cw",
    "#c00ce",
    "#c00bw",
    "#c00be",
  ];
  fadeElements(removeSet);

  strokeLine("#i00an"); //horizontal unit above baseline
  strokeLine("#i00as");

  setPolygon("#y4n"); //squares
  setPolygon("#y4s");

  strokeLine("#i03ae"); //diagonal

  strokeLine("#r03a"); //radius
  sweepRadius("#c03a", "#r03a"); //root 5 circle
  unStrokeLine("#r03a"); //radius

  strokeLine("#g002a2");
  strokeLine("#g002b");
  strokeLine("#g002a1");

  // tl.addPause("g02.r5");

  removeSet = [
    "#y4n",
    "#y4s",
    "#i03ae",
    "#c03a",

  ];
  fadeElements(removeSet);
  fadeElements(".Segment.s002");
}

function root2sequence() {
  //Root 2 ****************************

  strokeLine("#i05bw"); //diagonal
  setPoint("#p016e");
  setPoint("#p018n");

  setPolygon("#y4ds"); //diamond

  strokeLine("#r06an")
  zoomToElement(".view04", 50);

  sweepRadius("#c06an", "#r06an"); //root 5 circle
  unStrokeLine("#r06an")

  strokeLine("#g002a2");
  strokeLine("#g002b");
  strokeLine("#g002a1");

  fadeElements(".Segment.s002");

  // tl.addPause("g02.r2");

  // zoomToElement(".view03", 50);
}

function root5review() {

  setCircle("#y4n"); //squares
  setCircle("#y4s");

  strokeLine("#i03ae"); //diagonal
  sweepRadius("#c03a", "#r03a"); //root 5 circle

  strokeLine("#g002a2");
  strokeLine("#g002b");
  strokeLine("#g002a1");

  fadeElements(".Segment.s002");


}

function root3review() {
  // strokeLine("#i02ae"); //trilateral lines
  // strokeLine("#i02aw");
  strokeLine("#i02be");
  // strokeLine("#i02bw");

  setPoint(".Point.s009");

  setCircle("#y3n"); //polygon

  strokeLine("#i04aw"); //diagonals
  // strokeLine("#i04aw");
  // strokeLine("#i04be");
  // strokeLine("#i04bw");

  setPoint("#p015n"); //circumcenter
  // setPoint("#p015s");

  sweepRadius("#c04an", "#r04an"); //circumcircles

  strokeLine("#g002a2");
  strokeLine("#g002b");
  strokeLine("#g002a1");

  fadeElements(".Segment.s002");

}

function showSectors() {

  strokeLine("#g002a2");
  strokeLine("#g002b");
  strokeLine("#g002a1");

  fadeElements(".y");

  // zoomToElement("#c00aw");

  //dumpComputedStyles("#c00aw");

  //tl.to( ["#c04an", "#c03a", "#c06an"], 2, { strokeWidth: 4 } ); //highlight circles
  //tl.to( ["#c04an", "#c03a", "#c06an"], 2, { strokeWidth: 1 } ); //highlight circles

  setPolygon("#s03a"); //sectors
  setPolygon("#s04an_2"); //sectors
  setPolygon("#s05c"); //sectors

  //console.log( $("#drawing")[0].innerHTML );


}
