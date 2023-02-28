//>>built
define("com/huayun/webgis/renderer/SimpleRenderer",["./FillRenderer","./LineRenderer","./CircleRenderer","./ImageRenderer"],function(_1,_2,_3,_4){function _5(){this.lineRenderer=new _2();this.fillRenderer=new _1();this.circleRenderer=new _3();this.imageRenderer=new _4();};_5.prototype.add=function(_6,_7,_8,_9){switch(_9.type){case "line":this.lineRenderer.add(_6,_7,_8,_9);break;case "polygon":this.fillRenderer.add(_6,_7,_8,_9);break;case "circle":this.circleRenderer.add(_6,_7,_8,_9);break;case "image":this.imageRenderer.add(_6,_7,_8,_9);}};_5.prototype.draw=function(_a,_b,_c,_d,_e,_f){switch(_d.type){case "line":this.lineRenderer.draw(_a,_b,_c,_d,_e,_f);break;case "polygon":this.fillRenderer.draw(_a,_b,_c,_d,_e,_f);break;case "circle":this.circleRenderer.draw(_a,_b,_c,_d,_e,_f);break;case "image":this.imageRenderer.draw(_a,_b,_c,_d,_e,_f);break;}};_5.prototype.calculateExtent=function(_10,_11,_12,_13,_14){switch(_13.type){case "line":this.lineRenderer.calculateExtent(_10,_11,_12,_13,_14);break;case "polygon":this.fillRenderer.calculateExtent(_10,_11,_12,_13,_14);break;case "circle":this.circleRenderer.calculateExtent(_10,_11,_12,_13,_14);break;case "image":this.imageRenderer.calculateExtent(_10,_11,_12,_13,_14);break;}};return _5;});