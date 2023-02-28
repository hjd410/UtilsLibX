//>>built
define("com/huayun/webgis/utils/TaskQueue",[],function(){var _1=function _1(){this._queue=[];this._id=0;this._cleared=false;this._currentlyRunning=false;};_1.prototype.add=function add(_2){var id=++this._id;var _3=this._queue;_3.push({callback:_2,id:id,cancelled:false});return id;};_1.prototype.remove=function remove(id){var _4=this._currentlyRunning;var _5=_4?this._queue.concat(_4):this._queue;for(var i=0,ll=_5.length;i<ll;i+=1){var _6=_5[i];if(_6.id===id){_6.cancelled=true;return;}}};_1.prototype.run=function run(_7){var _8=this._currentlyRunning=this._queue;this._queue=[];for(var i=0,ll=_8.length;i<ll;i+=1){var _9=_8[i];if(_9.cancelled){continue;}_9.callback(_7);if(this._cleared){break;}}this._cleared=false;this._currentlyRunning=false;};_1.prototype.clear=function clear(){if(this._currentlyRunning){this._cleared=true;}this._queue=[];};return _1;});