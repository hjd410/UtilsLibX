/**
 *  @author :   JiGuangJie
 *  @date   :   2019/11/29
 *  @time   :   11:11
 *  @Email  :   530904731@qq.com
 */
define("com/huayun/webgis/widget/searchs/searchbox", [
    "dojo/_base/declare",
    "dojo/dom-class",
    "../../../framework/ModuleXContainer"
], function (declare, domClass, ModuleXContainer) {
    return declare("com.huayun.webgis.widget.searchs.searchbox", [ModuleXContainer], {
        baseClass: "searchbox",
        NAME_SEARCH: "nameSearch",
        PATH_SEARCH: "pathPlanningSearch",

        doInit: function () {
            this.doLoadModuleX(function () {
                var nameSearch = this.context.lookUp(this.NAME_SEARCH);
                if (nameSearch) {
                    nameSearch.changeMethod = function () {
                        var pathSearch = this.context.lookUp(this.PATH_SEARCH);
                        if (pathSearch === null) {
                            this.createModuleX(this.PATH_SEARCH, null, function () {
                                pathSearch = this.context.lookUp(this.PATH_SEARCH);
                                pathSearch.changeMethod = function () {
                                    domClass.remove(nameSearch.domNode, "hidden");
                                }
                            }.bind(this));
                        } else {
                            domClass.remove(pathSearch.domNode, "hidden");
                        }
                    }.bind(this);
                }
            }.bind(this));
        }
    });
});