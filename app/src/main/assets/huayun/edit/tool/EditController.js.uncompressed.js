/**
 *  @author :   JiGuangJie
 *  @date   :   2020/6/17
 *  @time   :   10:23
 *  @Email  :   530904731@qq.com
 */
define("com/huayun/edit/tool/EditController", [
    "./DrawTool",
    "./EditTool"
], function (DrawTool, EditTool) {
    function EditController() {
        this._currentEditLayer = null;
        this.drawTool = new DrawTool();
        this.editTool = new EditTool();
    }

    EditController.prototype.add = function (params) {
        switch (params.geoType) {
            case 'point':
                this.drawTool.drawPoint(params);
                break;
            case 'line':
                this.drawTool.drawLine(params);
                break;
            case 'polygon':
                this.drawTool.drawPolygon(params);
                break;
        }
    };

    EditController.prototype.edit = function () {

    };

    EditController.prototype.delete = function (graphic) {
        this.drawTool.delete(graphic);
    };

    EditController.prototype.endDraw = function () {
        this.drawTool.endDraw();
    };

    var prototypeAccessors = {
        currentEditLayer: {configurable: true}
    };

    prototypeAccessors.currentEditLayer.set = function (value) {
        this._currentEditLayer = value;
        this.drawTool.currentEditLayer = value;
    };
    Object.defineProperties(EditController.prototype, prototypeAccessors);

    return EditController;
});
