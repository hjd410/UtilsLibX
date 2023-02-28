define("com/huayun/webgis/symbols/TyphoonSymbol", [
  "./FanSymbol"
], function (FanSymbol) {
  function TyphoonSymbol(params) {
    var radiusArray = params.radiusArray;
    this.type = "typhoon";
    var quadrantOne = new FanSymbol({
      color: params.color,
      strokeColor: params.strokeColor,
      strokeWidth: params.strokeWidth,
      radius: radiusArray[0],
      quadrant: 1,
      opacity: params.opacity
    });
    var quadrantTwo = new FanSymbol({
      color: params.color,
      strokeColor: params.strokeColor,
      strokeWidth: params.strokeWidth,
      radius: radiusArray[1],
      quadrant: 2,
      opacity: params.opacity
    });
    var quadrantThree = new FanSymbol({
      color: params.color,
      strokeColor: params.strokeColor,
      strokeWidth: params.strokeWidth,
      radius: radiusArray[2],
      quadrant: 3,
      opacity: params.opacity
    });

    var quadrantFour = new FanSymbol({
      color: params.color,
      strokeColor: params.strokeColor,
      strokeWidth: params.strokeWidth,
      radius: radiusArray[3],
      quadrant: 4,
      opacity: params.opacity
    });

    if (radiusArray[0] > radiusArray[1]) {
      quadrantOne.uniforms.end = radiusArray[1] / radiusArray[0];
      quadrantTwo.uniforms.start = 1.0;
    } else {
      quadrantOne.uniforms.end = 1.0;
      quadrantTwo.uniforms.start = radiusArray[0] / radiusArray[1];
    }

    if (radiusArray[1] > radiusArray[2]) {
      quadrantTwo.uniforms.end = radiusArray[2] / radiusArray[1];
      quadrantThree.uniforms.start = 1.0;
    } else {
      quadrantTwo.uniforms.end = 1.0;
      quadrantThree.uniforms.start = radiusArray[1] / radiusArray[2];
    }

    if (radiusArray[2] > radiusArray[3]) {
      quadrantThree.uniforms.end = radiusArray[3] / radiusArray[2];
      quadrantFour.uniforms.start = 1.0;
    } else {
      quadrantThree.uniforms.end = 1.0;
      quadrantFour.uniforms.start = radiusArray[2] / radiusArray[3];
    }

    if (radiusArray[3] > radiusArray[0]) {
      quadrantFour.uniforms.end = radiusArray[0] / radiusArray[3];
      quadrantOne.uniforms.start = 1.0;
    } else {
      quadrantFour.uniforms.end = 1.0;
      quadrantOne.uniforms.start = radiusArray[3] / radiusArray[0];
    }

    this.subSymbols = [
      quadrantOne,
      quadrantTwo,
      quadrantThree,
      quadrantFour
    ];
  }

  TyphoonSymbol.prototype.setRadiusArray = function (radiusArray) {
    var quadrantOne = this.subSymbols[0],
      quadrantTwo = this.subSymbols[1],
      quadrantThree = this.subSymbols[2],
      quadrantFour = this.subSymbols[3];
    quadrantOne.radius = radiusArray[0];
    quadrantOne.uniforms.radius = radiusArray[0];
    quadrantTwo.radius = radiusArray[1];
    quadrantTwo.uniforms.radius = radiusArray[1];
    quadrantThree.radius = radiusArray[2];
    quadrantThree.uniforms.radius = radiusArray[2];
    quadrantFour.radius = radiusArray[3];
    quadrantFour.uniforms.radius = radiusArray[3];
    if (radiusArray[0] > radiusArray[1]) {
      quadrantOne.uniforms.end = radiusArray[1] / radiusArray[0];
      quadrantTwo.uniforms.start = 1.0;
    } else {
      quadrantOne.uniforms.end = 1.0;
      quadrantTwo.uniforms.start = radiusArray[0] / radiusArray[1];
    }

    if (radiusArray[1] > radiusArray[2]) {
      quadrantTwo.uniforms.end = radiusArray[2] / radiusArray[1];
      quadrantThree.uniforms.start = 1.0;
    } else {
      quadrantTwo.uniforms.end = 1.0;
      quadrantThree.uniforms.start = radiusArray[1] / radiusArray[2];
    }

    if (radiusArray[2] > radiusArray[3]) {
      quadrantThree.uniforms.end = radiusArray[3] / radiusArray[2];
      quadrantFour.uniforms.start = 1.0;
    } else {
      quadrantThree.uniforms.end = 1.0;
      quadrantFour.uniforms.start = radiusArray[2] / radiusArray[3];
    }

    if (radiusArray[3] > radiusArray[0]) {
      quadrantFour.uniforms.end = radiusArray[0] / radiusArray[3];
      quadrantOne.uniforms.start = 1.0;
    } else {
      quadrantFour.uniforms.end = 1.0;
      quadrantOne.uniforms.start = radiusArray[3] / radiusArray[0];
    }
  };

  return TyphoonSymbol;
});