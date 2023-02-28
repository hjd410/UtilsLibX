//>>built
define("com/huayun/gl/shaders/mesh",["exports","../../webgis/data/uniform"],function(a,b){a.meshVS="precision highp float;\nattribute vec3 position;\nuniform mat4 u_matrix;\nuniform mat4 u_model;\nvoid main() {\n    gl_Position \x3d u_matrix * u_model * vec4(position, 1.0);\n}";a.meshFS="precision mediump float;\nuniform vec3 u_color;\nvoid main() {\n    gl_FragColor \x3d vec4(1.0, 1.0, 1.0, 1.0);\n}";a.meshUniforms=function(a,c){return{u_matrix:new b.UniformMatrix4f(a,c.u_matrix),u_model:new b.UniformMatrix4f(a,
c.u_model),u_color:new b.Uniform3f(a,c.u_color)}}});