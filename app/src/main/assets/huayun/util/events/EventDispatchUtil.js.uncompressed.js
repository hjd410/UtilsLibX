/**
 *  @author :   JiGuangJie
 *  @date   :   2019/8/15
 *  @time   :   14:39
 *  @Email  :   530904731@qq.com
 *
 *  事件侦听类，后面考虑统一处理，目前事件在graphic中处理的
 */
define(
    "com/huayun/util/events/EventDispatchUtil", [
        "dojo/_base/declare",
        "dojo/topic",
        "dojo/on"
    ], function (declare, topic, on) {
        return declare("com.huayun.util.EventDispatchUtil", [], {
            _click: null,

            constructor: function (params) {
                // console.log(params.target);
                declare.safeMixin(this, params);
                this._currentTarget = params.target;
                this._mouse = new THREE.Vector2();
                this._raycaster = new THREE.Raycaster();
            },

            destroy: function () {
                this._click.remove();
            },
            /**
             * 点击事件监听
             * @param evt 
             */
            _clickHandler: function (evt) {
                this._target = evt.currentTarget.parentNode;
                this._offSetLeft = this._target.getBoundingClientRect().left;
                this._offSetTop = this._target.getBoundingClientRect().top;
                this._containerWidth = this._target.clientWidth;
                this._containerHeight = this._target.clientHeight;
                this._camera = this._target.camera;
                this._group = this._target.group;
                // console.log(this._click);
                evt.preventDefault();
                this._mouse.x = ((evt.clientX - this._offSetLeft) / this._containerWidth) * 2 - 1;
                this._mouse.y = -((evt.clientY - this._offSetTop) / this._containerHeight) * 2 + 1;
                // console.log("graphic click", evt.clientX, evt.clientY);
                // console.log(this._camera, this._group);
                this._raycaster.setFromCamera(this._mouse, this._camera);
                var intersects = this._raycaster.intersectObject(this._group, true);
                for (var i = 0; i < intersects.length; i++) {
                    var intersect = intersects[i];
                    if (intersect.object.uuid === this._currentTarget.id) {
                        // console.log(evt);
                        evt.stopPropagation();
                        this.listener({
                            type: this.type,
                            currentTarget: this._currentTarget,
                            target: this._target,
                            clientX: evt.clientX,
                            clientY: evt.clientY,
                            sceneX: this._mouse.x,
                            sceneY: this._mouse.y,
                            x: evt.x,
                            y: evt.y
                        });
                    }
                }
            },
            _selectedItem: function () {
                this._click.remove();
            }
        });
    });