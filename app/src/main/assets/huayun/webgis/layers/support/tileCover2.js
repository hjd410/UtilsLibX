//>>built
define("com/huayun/webgis/layers/support/tileCover2",["exports","require"],function(_1,_2){function _3(a,b){if(a.y>b.y){var t=a;a=b;b=t;}return {x0:a.x,y0:a.y,x1:b.x,y1:b.y,dx:b.x-a.x,dy:b.y-a.y};};function _4(e0,e1,_5,_6,_7){var y0=Math.max(_5,Math.floor(e1.y0));var y1=Math.min(_6,Math.ceil(e1.y1));if((e0.x0===e1.x0&&e0.y0===e1.y0)?(e0.x0+e1.dy/e0.dy*e0.dx<e1.x1):(e0.x1-e1.dy/e0.dy*e0.dx<e1.x0)){var t=e0;e0=e1;e1=t;}var m0=e0.dx/e0.dy;var m1=e1.dx/e1.dy;var d0=e0.dx>0;var d1=e1.dx<0;for(var y=y0;y<y1;y++){var x0=m0*Math.max(0,Math.min(e0.dy,y+d0-e0.y0))+e0.x0;var x1=m1*Math.max(0,Math.min(e1.dy,y+d1-e1.y0))+e1.x0;_7(Math.floor(x1),Math.ceil(x0),y);}};function _8(a,b,c,_9,_a,_b){var ab=_3(a,b),bc=_3(b,c),ca=_3(c,a);var t;if(ab.dy>bc.dy){t=ab;ab=bc;bc=t;}if(ab.dy>ca.dy){t=ab;ab=ca;ca=t;}if(bc.dy>ca.dy){t=bc;bc=ca;ca=t;}if(ab.dy){_4(ca,ab,_9,_a,_b);}if(bc.dy){_4(ca,bc,_9,_a,_b);}};_1.tileCover=function(z,_c,_d){var t={};function _e(x0,x1,y){var x,w,wx,_f;for(x=x0;x<x1;x++){w=Math.floor(x);_f={z:z,x:w,y:y};t[z+"/"+w+"/"+y]=_f;}};_8(_c[0],_c[1],_c[2],_d[0],_d[1],_e);_8(_c[2],_c[3],_c[0],_d[0],_d[1],_e);return t;};});