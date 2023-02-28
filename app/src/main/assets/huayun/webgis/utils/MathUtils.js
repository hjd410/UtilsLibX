//>>built
define("com/huayun/webgis/utils/MathUtils",["exports"],function(h){function k(a,b,e){return{x:a.x*e-a.y*b,y:a.x*b+a.y*e}}h.radian2Angle=function(a){return 180*a/Math.PI};h.angle2Radian=function(a){return a*Math.PI/180};h.calculateCenterOfLine=function(a){for(var b,e=0,d=[],c=0;c<a.length-1;c++)b=a[c].dist(a[c+1]),d[d.length]=b,e+=b;b=.5*e;for(var g=0,f=0,c=0;c<d.length;c++)if(g+=d[c],g>b){f=c;break}for(c=g=0;c<f;c++)g+=d[c];var d=[a[f+1].x,a[f+1].y],c=[a[f].x,a[f].y],h=void 0,h=[];h[0]=d[0]-c[0];
h[1]=d[1]-c[1];d=h;d=Math.atan2(d[1],d[0]);a=a[f].calculateOtherPoint(b-g,d);return{length:e,center:a,radian:d}};h.sizeAfterRotated=function(a,b){var e=Math.sin(b),d=Math.cos(b);b=k(a[0],e,d);var c=k(a[1],e,d),g=k(a[2],e,d);a=k(a[3],e,d);return{xmin:Math.min(b.x,c.x,g.x,a.x),xmax:Math.max(b.x,c.x,g.x,a.x),ymin:Math.min(b.y,c.y,g.y,a.y),ymax:Math.max(b.y,c.y,g.y,a.y)}};h.calculateCoreOfPolygon=function(a){for(var b,e=0,d=0,c=0,g=a.length,f=0;f<g-1;f++)b=a[f].x*a[f+1].y-a[f].y*a[f+1].x,e+=b,d+=b*(a[f].x+
a[f+1].x),c+=b*(a[f].y+a[f+1].y);b=a[g-1].x*a[0].y-a[g-1].y*a[0].x;d+=b*(a[g-1].x+a[0].x);c+=b*(a[g-1].y+a[0].y);e=(e+b)/2;return{x:d/(6*e),y:c/(6*e)}};h.lerp=function(a,b,e){return(1-e)*a+e*b}});