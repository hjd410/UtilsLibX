define(
    "com/huayun/webgis/action/ActiveAction", [
        "dojo/_base/declare",
        "./Action"
    ], function (declare, Action) {
        return declare("com.huayun.webgis.action.ActiveAction", [Action], {
            isActive: true, //是否是拥有持续行为，false不具有持续行为，true具有持续行为
            state:false,    //当前行为的状态,false表示未激活，true表示已激活

            constructor: function (params) {
                // declare.safeMixin(params);
                this.isActive = true;
            },

            /**
             *  激活某个行为，具体实现由子类来做
             * @param action
             */
            active: function () {
                //TODO
            },
            /**
             *  使某个激活的行为失效，具体实现由子类来做
             * @param action
             */
            invalid: function () {
                //TODO
            },

            /**
             * 行为要做的具体事情
             * @param params
             */
            doActive: function (params) {
                //TODO
            }
        });
    }
);