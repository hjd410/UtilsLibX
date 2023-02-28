/**
 *  @author :   JiGuangJie
 *  @date   :   2020/6/17
 *  @time   :   18:44
 *  @Email  :   530904731@qq.com
 */
define("com/huayun/edit/components/PropertyPanel", [], function () {
    function PropertyPanel(params) {
        this.container = params.container;
        this._currentEditTarget = params.currentEditTarget;
        this.attributes = null;
        this._aliasData = {};
        this.table = document.createElement('table');
        this.table.id = 'property-table';
        this.table.setAttribute('border', '1');
        this.container.appendChild(this.table)
        // debugger
        // this.createTable();
    }

    PropertyPanel.prototype.update = function (params) {
        if (params === null) {
            this._clearTable();
        } else {
            // debugger
            this.attributes = params;
            this._clearTable();
            this._initTable();
        }
    };

    PropertyPanel.prototype._createAliasData = function (fields) {
        for (var i = 0; i < fields.length; i++) {
            var field = fields[i];
            for (var j = 0; j < this.attributes.length; j++) {
                var attribute = this.attributes[j];
                if (attribute.name === field.name) {
                    this._aliasData[field.name] = {
                        alias: field.alias,
                        defaultValue: field.defaultValue
                    };
                }
            }
        }
    };

    PropertyPanel.prototype._initTable = function () {
        var trTh = document.createElement('tr');
        var th1 = document.createElement('th');
        th1.innerText = '属性';
        var th2 = document.createElement('th');
        th2.innerText = '值';
        trTh.appendChild(th1);
        trTh.appendChild(th2);
        this.table.appendChild(trTh);
        for (var i = 0; i < this.attributes.length; i++) {
            var attribute = this.attributes[i];
            var tr = document.createElement('tr');
            var aliasData = this._aliasData[attribute.name];
            for (var j = 0; j < 2; j++) {
                var td = document.createElement('td');
                var txt;
                if (j === 0) {
                    txt = document.createTextNode(aliasData.alias);
                } else {
                    td.contentEditable = 'true';
                    // var defaultValue =
                    txt = document.createTextNode(attribute.value);
                }
                td.appendChild(txt);
                tr.appendChild(td);
            }
            this.table.appendChild(tr);
        }
    };

    PropertyPanel.prototype._clearTable = function () {
        for (var i = this.table.children.length - 1; i >= 0; i--) {
            var child = this.table.children[i];
            this.table.removeChild(child);
        }
        // debugger
    };

    var prototypeAccessors = {
        currentEditTarget: {configurable: true}
    };

    prototypeAccessors.currentEditTarget.set = function (value) {
        this._aliasData = {};
        this._clearTable();
        this._currentEditTarget = value;
        this.attributes = this._currentEditTarget.attributes;
        this._createAliasData(this._currentEditTarget.fields);
        this._initTable();
        // debugger
        // this.view = this._currentEditLayer.layerView.graphicsLayerView.view;
    };
    Object.defineProperties(PropertyPanel.prototype, prototypeAccessors);
    return PropertyPanel;
});
