define("com/huayun/webgis/geometry/MapPoint", ["dojo/_base/declare","./Geometry"],function (declare,Geometry) {
  return declare("com.huayun.webgis.geometry.MapPoint",[Geometry],{

    constructor: function (x,y,z) {
      this.x = x;
      this.y = y;
      this.z = z;
      this.type = "point";
    },

    toString: function () {
      return "x: "+this.x+" y: " + this.y + "z: "+this.z;
    }
  })
});