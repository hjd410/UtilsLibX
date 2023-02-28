/**
 * Created by DELL on 2017/11/21.
 */

define("com/huayun/webgis/kernel", ["require","./core/requireUtils","dojo/main","dojo/has"],function(e,f,g,d){
    (function(){
        var b=g.config,
            a=b.has&&void 0!==b.has["config-deferredInstrumentation"],
            c=b.has&&void 0!==b.has["config-useDeferredInstrumentation"];
        void 0!==b.useDeferredInstrumentation||a||c||(d.add("config-deferredInstrumentation",!1,!0,!0),d.add("config-useDeferredInstrumentation",!1,!0,!0))
    })();
    return{
        version:"4.4",
        workerMessages:{
            request:function(b){
                return f.when(e,"./request").then(function(a){
                    var c=b.options||{};
                    c.responseType="array-buffer";
                    return a(b.url,c)
                }).then(function(a){
                    return{data:{data:a.data,ssl:a.ssl},buffers:[a.data]}
                }).otherwise(function(a){
                    throw{code:a.code,message:a.message,ssl:a.ssl};
                })
            }
        }
    }
});