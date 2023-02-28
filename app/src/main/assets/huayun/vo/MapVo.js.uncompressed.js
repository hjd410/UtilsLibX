/**
 *  @author :   JiGuangJie
 *  @date   :   2020/5/27
 *  @time   :   19:35
 *  @Email  :   530904731@qq.com
 */
define("com/huayun/vo/MapVo", [
    "../util/JSONFormatterUtil",
    "./map/PropertiesVo",
    "./map/LayerVo"
], function (JSONFormatterUtil, PropertiesVo, LayerVo) {
    function MapVo(params, styles) {
        this.layerVoList = [];
        this.properties = new PropertiesVo(params.properties);
        this.workspace = JSONFormatterUtil.formatterKey(params.workspaces.shapeWorkspace).name;
        var temp = this._stylesFormatterObj(styles);
        if (Array.isArray(params.layers.layer)) {
            for (var i = 0; i < params.layers.layer.length; i++) {
                var aLayer = params.layers.layer[i];
                aLayer = JSONFormatterUtil.formatterKey(aLayer);
                this.layerVoList.push(new LayerVo(aLayer, temp));
            }
        } else {
            // this.layerVoList.push(new LayerVo(params.layers.layer, temp));
            var tempLayer = JSONFormatterUtil.formatterKey(params.layers.layer);
            this.layerVoList.push(new LayerVo(tempLayer, temp));
        }
    }

    MapVo.prototype._stylesFormatterObj = function (list) {
        var result = {};
        for (var i = 0; i < list.length; i++) {
            var listElement = list[i];
            result[listElement.name] = listElement.data;
        }
        // return result;
        return list;
    };

    return MapVo;
});
