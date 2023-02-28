/**
 * Created by overfly on 2017/11/20.
 */
define("com/huayun/webgis/request", ["require",
        "dojo/_base/config",
        "dojo/Deferred",
        "dojo/_base/lang",
        "dojo/_base/url",
        "dojo/request",
        "dojo/io-query",
        "dojo/when",
        "./core/global",
        "./core/deferredUtils"],
    function (S,y,D,l,H,z,A,T,V,W) {
        function Y(a){
            var c=A.objectToQuery(a.content);
            var b=new Image;
            b.setAttribute("crossOrigin",'Anonymous');
            var e=!1,
                d=new D(function(a){
                    e=!0;
                    b.onload=b.onerror=b.onabort=null;
                    b.src=""
                }),
                c=function(a){
                    b.onload=b.onerror=b.onabort=null;
                    //e||d.reject(a)
                    e||d.reject("fa");
                };
            b.onload=function(){
                b.onload=b.onerror=b.onabort=null;
                e||d.resolve(this)
            };
            b.onerror=c;
            b.onabort=c;
            b.alt="";
            b.src=a.url;
            return d.promise
        }
        //a:deferred,c:false,b:urlObj,e:url
        function v(a,c,b,e){
            function d(a){
                a._pendingDfd=Y(b);
                if(a._pendingDfd){
                    var c=!!a._pendingDfd.response;
                    (a._pendingDfd.response||a._pendingDfd).then(function(a){
                        if(!c||!a.data){
                            return a;
                        }
                    },function (error) {
                    }).then(function(b){
                        var g=c?b.data:b,//<img alt="" src="http://10.146.254.114/rest/services/zj_map10k_maplex_gray/MapServer/tile/8/690/807">
                            d=c?b.getHeader.bind(b):ba;//ƒ (){return null}
                        a.ioArgs=a._pendingDfd&& a._pendingDfd.ioArgs;
                        a.resolve({data:g,url:e.url,requestOptions:e.requestOptions,getHeader:d});
                        a._pendingDfd=null
                    },function (error) {
                    })
                }
            }
            var w=!1;
            w?b.workerOptions&&b.workerOptions.worker?(z=b.workerOptions.worker,d(a)):S(["./workers/RequestClient"],
                function(c){
                    if(b.workerOptions){
                        var e=b.workerOptions;
                        z=c.getClient(e.callback, e.cbFunction)
                    }
                    else
                        z=c.getClient();
                    d(a)
                }):d(a);
            return a.promise
        }
        function myrequest(a,c){
            var b=l.mixin({},c),
                e={url:a, requestOptions:l.mixin({},c)};
            b.handleAs=b.responseType;
            delete b.responseType;
            "array-buffer"===b.handleAs&&(b.handleAs="arraybuffer");
            b.url = a;
            b.urlObj=new H(b.url);
            var d=W.makeDeferredCancellingPending();
            T().always(function(){v(d,!1,b,e)
            });
            return d.promise
        }
        var x,
            ba=function(){return null};
        myrequest._makeRequest=Y;
        myrequest._processRequest=v;
        myrequest.setRequestPreCallback=function(a){
            x=a
        };
        return myrequest
    }
);
