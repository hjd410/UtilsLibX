//>>built
define("com/huayun/webgis/data/bucket/LinePatternBucketSimplify",["../ArrayType","../../gl/SegmentVector"],function(B,C){function z(b,h,k,l,v,d,m,p){b.emplaceBack(h.x,h.y,h.z||0,Math.round(63*k.x)+128,Math.round(63*k.y)+128,(0===d?0:0>d?-1:1)+1|(.5*m&63)<<2,.5*m>>6,p,v?1:0,l?1:0,v?1:0)}var D=Math.pow(2,14)/.5,E=Math.cos(Math.PI/180*37.5),w=function(b){this.layoutVertexArray=new B.StructArrayLayout9f2ib40;this.indexArray=new B.StructArrayLayout3ui6;this.segments=new C};w.prototype.addFeature=function(b,
h,k,l,v){for(var d=0;d<b.length;d+=1)this.addLine(b[d],h,k,l,v)};w.prototype.upload=function(b){this.uploaded||(this.layoutVertexBuffer=b.createVertexBuffer(this.layoutVertexArray,[{name:"a_pos",type:"Float32",components:3,offset:0},{name:"a_data",type:"Float32",components:4,offset:12},{name:"a_uv",type:"Float32",components:2,offset:28},{name:"a_normal",type:"Int16",components:2,offset:36}]),this.indexBuffer=b.createIndexBuffer(this.indexArray));this.uploaded=!0};w.prototype.destroy=function(){this.layoutVertexBuffer&&
(this.layoutVertexBuffer.destroy(),this.indexBuffer.destroy(),this.segments.destroy())};w.prototype.addLine=function(b,h,k,l,v){for(var d=b.length;2<=d&&b[d-1].equals(b[d-2]);)b.splice(d-1),d--;for(var m=0;m<d-1&&b[m].equals(b[m+1]);)m++;this.totalDistance=0;for(var p=m;p<d-1;p++)this.totalDistance+=b[p].dist(b[p+1]);"bevel"===h&&(l=1.05);var c=this.segments.prepareSegment(10*d,this.layoutVertexArray,this.indexArray);this.distance=0;var q=!0,a,x=void 0,r=void 0,f=void 0,e=void 0,t,w;this.e1=this.e2=
this.e3=-1;for(p=m;p<d;p++){r=b[p+1];e&&(f=e);a&&(x=a);a=b[p];e=r?r.sub(a)._unit()._perp():f;f=f||e;if(!f)break;var n=f.add(e);0===n.x&&0===n.y||n._unit();var y=n.x*e.x+n.y*e.y;t=0!==y?1/y:Infinity;var A=y<E&&x&&r;if(A&&p>m){var u=a.dist(x);480<u&&(u=a.sub(a.sub(x)._mult(240/u)._round()),this.distance+=u.dist(x),this.addCurrentVertex(u,this.distance,f.mult(1),0,0,!1,c,null),x=u)}var g=(u=x&&r)?h:k;u&&"round"===g&&(t<v?g="miter":2>=t&&(g="fakeround"));"miter"===g&&t>l&&(g="bevel");"bevel"===g&&(2<
t&&(g="flipbevel"),t<l&&(g="miter"));x&&(this.distance+=a.dist(x));if("miter"===g)n._mult(t),this.addCurrentVertex(a,this.distance,n,0,0,!1,c,null);else if("flipbevel"===g)100<t?n=e.clone().mult(-1):(u=0<f.x*e.y-f.y*e.x?-1:1,q=t*f.add(e).mag()/f.sub(e).mag(),n._perp()._mult(q*u)),this.addCurrentVertex(a,this.distance,n,0,0,!1,c,null),this.addCurrentVertex(a,this.distance,n.mult(-1),0,0,!1,c,null);else if("bevel"===g||"fakeround"===g){var u=0<f.x*e.y-f.y*e.x,z=-Math.sqrt(t*t-1);u?(w=0,t=z):(t=0,w=
z);q||this.addCurrentVertex(a,this.distance,f,t,w,!1,c,null);if("fakeround"===g){q=Math.floor(8*(.5-(y-.5)));y=void 0;for(g=0;g<q;g++)y=e.mult((g+1)/(q+1))._add(f)._unit(),this.addPieSliceVertex(a,this.distance,y,u,c,null);this.addPieSliceVertex(a,this.distance,n,u,c,null);for(n=q-1;0<=n;n--)y=f.mult((n+1)/(q+1))._add(e)._unit(),this.addPieSliceVertex(a,this.distance,y,u,c,null)}r&&this.addCurrentVertex(a,this.distance,e,-t,-w,!1,c,null)}else"butt"===g?(q||this.addCurrentVertex(a,this.distance,f,
0,0,!1,c,null),r&&this.addCurrentVertex(a,this.distance,e,0,0,!1,c,null)):"square"===g?(q||(this.addCurrentVertex(a,this.distance,f,1,1,!1,c,null),this.e1=this.e2=-1),r&&this.addCurrentVertex(a,this.distance,e,-1,-1,!1,c,null)):"round"===g&&(q||(this.addCurrentVertex(a,this.distance,f,0,0,!1,c,null),this.addCurrentVertex(a,this.distance,f,1,1,!0,c,null),this.e1=this.e2=-1),r&&(this.addCurrentVertex(a,this.distance,e,-1,-1,!0,c,null),this.addCurrentVertex(a,this.distance,e,0,0,!1,c,null)));A&&p<d-
1&&(A=a.dist(r),480<A&&(r=a.add(r.sub(a)._mult(240/A)._round()),this.distance+=r.dist(a),this.addCurrentVertex(r,this.distance,e.mult(1),0,0,!1,c,null),a=r));q=!1}};w.prototype.addCurrentVertex=function(b,h,k,l,v,d,m,p){var c,q=this.layoutVertexArray,a=this.indexArray;c=k.clone();l&&c._sub(k.perp()._mult(l));z(q,b,c,d,!1,l,h,h/this.totalDistance);this.e3=m.vertexLength++;0<=this.e1&&0<=this.e2&&(a.emplaceBack(this.e1,this.e2,this.e3),m.primitiveLength++);this.e1=this.e2;this.e2=this.e3;c=k.mult(-1);
v&&c._sub(k.perp()._mult(v));z(q,b,c,d,!0,-v,h,h/this.totalDistance);this.e3=m.vertexLength++;0<=this.e1&&0<=this.e2&&(a.emplaceBack(this.e1,this.e2,this.e3),m.primitiveLength++);this.e1=this.e2;this.e2=this.e3;h>D/2&&!p&&(this.distance=0,this.addCurrentVertex(b,this.distance,k,l,v,d,m))};w.prototype.addPieSliceVertex=function(b,h,k,l,v){k=k.mult(l?-1:1);var d=this.indexArray;z(this.layoutVertexArray,b,k,!1,l,0,h);this.e3=v.vertexLength++;0<=this.e1&&0<=this.e2&&(d.emplaceBack(this.e1,this.e2,this.e3),
v.primitiveLength++);l?this.e2=this.e3:this.e1=this.e3};return w});