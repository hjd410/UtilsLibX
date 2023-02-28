//>>built
define("com/huayun/webgis/renderer/LinePatternRenderer","./Renderer ../geometry/Point ../data/bucket/LinePatternBucketSimplify ../gl/mode ../gl/programAttributes ../gl/programCache".split(" "),function(n,q,t,g,u,v){function b(){}n&&(b.__proto__=n);b.prototype=Object.create(n&&n.prototype);b.prototype.constructor=b;var w=function(a,c,f){f=f.uniforms;c=c.position;f.u_matrix=a.viewpoint.getMatrixForPoint(c[0],c[1],!1,!1,c[2]||0);f.u_units_to_pixels=[a.viewpoint.width/2,-a.viewpoint.height/2];f.u_ratio=
1/a.viewpoint.resolution;return f};b.prototype.add=function(a,c,f,d){var e=c.position||a.viewpoint.center||[0,0],l=e[0],e=e[1];a=this._addOnePathFeature(f,a,c,d,l,e);c.buckets.push(a);c.position=[l,e,0]};b.prototype._addOnePathFeature=function(a,c,f,d,e,l){f=a.path;a=[];for(var b=0;b<f.length;b++){for(var k=f[b],m=[],g=new q(-1,-1),p=0;p<k.length;p++){var h=k[p];g.equals(h)||(m.push(new q(h.x-e,h.y-l,h.z)),g=h)}a.push(m)}e=new t;e.addFeature(a,d.join,d.cap,2,1.05);e.upload(c.context);return e};b.prototype.draw=
function(a,c,f,d,e,b,n){void 0===b&&(b=0);var k=a.context,m=k.gl,l;l=e?e.depthModeForSublayer(0,g.DepthMode.ReadWrite):new g.DepthMode(m.LEQUAL,g.DepthMode.ReadWrite,[.9,.9]);var p=g.ColorMode.alphaBlended;e=c.buckets;var h=d.dasharray;h&&(k.activeTexture.set(m.TEXTURE0),a.lineAtlas.bind(k));var q=v.useProgramSimplify(k,h?"basicLineSDF":"myline",u.basicLine),r=h?lineSDFUniformValues(a,c,d,h):w(a,c,d);n||(a=d.width*this.getRealScale(d.fixed,a.scale,d.minScale),r.u_width=1>a?1:a);r.u_color=d.color;
d=e[b];"multipolygon"===f.type?d.forEach(function(a,d){q.draw(k,m.TRIANGLES,l,null,p,g.CullFaceMode.disabled,r,c.id+"-line"+b+"-"+d,a.layoutVertexBuffer,a.indexBuffer,a.segments)}):q.draw(k,m.TRIANGLES,l,null,p,g.CullFaceMode.disabled,r,c.id+"-line"+b,d.layoutVertexBuffer,d.indexBuffer,d.segments)};b.prototype.calculateExtent=function(a,c,b,d,e,g){a=b.extent;e.push({id:c.id,g:c,minX:a.xmin,minY:a.ymin,maxX:a.xmax,maxY:a.ymax,symbol:d})};return b});