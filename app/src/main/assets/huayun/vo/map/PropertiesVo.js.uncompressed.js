/**
 *  @author :   JiGuangJie
 *  @date   :   2020/5/27
 *  @time   :   19:57
 *  @Email  :   530904731@qq.com
 */
define("com/huayun/vo/map/PropertiesVo", [
    "../../util/JSONFormatterUtil"
], function (JSONFormatterUtil) {
    function PropertiesVo(params) {
        var tempFullExtent = JSONFormatterUtil.formatterKey(params.fullExtent);
        var tempInitialExtent = JSONFormatterUtil.formatterKey(params.initialExtent);
        var tempLabelDodge = JSONFormatterUtil.formatterKey(params.labelDodge);
        this.fullExtent = {
            minX: Number(tempFullExtent.minX),
            minY: Number(tempFullExtent.minY),
            maxX: Number(tempFullExtent.maxX),
            maxY: Number(tempFullExtent.maxY)
        };
        this.initialExtent = {
            minX: Number(tempInitialExtent.minX),
            minY: Number(tempInitialExtent.minY),
            maxX: Number(tempInitialExtent.maxX),
            maxY: Number(tempInitialExtent.maxY)
        };
        this.labelDodge = {
            type: JSONFormatterUtil.formatterKey(params.labelDodge).type,
            cellWidth: Number(tempLabelDodge.cellWidth),
            cellHeight: Number(tempLabelDodge.cellHeight),
            rangeRadius: Number(tempLabelDodge.rangeRadius),
            usedPercent: Number(tempLabelDodge.usedPercent)
        };
        this.mapUnits = {
            units: JSONFormatterUtil.formatterKey(params.mapUnits).units
        };
        this.spatialReference = {
            crs: JSONFormatterUtil.formatterKey(params.spatialReference).crs,
            name: JSONFormatterUtil.formatterKey(params.spatialReference).name
        };
    }

    return PropertiesVo;
});
