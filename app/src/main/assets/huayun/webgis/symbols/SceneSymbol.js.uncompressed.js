define(
    "com/huayun/webgis/symbols/SceneSymbol", [
        "dojo/_base/declare",
        "./BaseSymbol"
    ], function (declare, BaseSymbol) {
        return declare("com.huayun.webgis.symbols.SceneSymbol", [BaseSymbol], {
            minScale: 0,
            maxScale: 0,
            fixedSize: false,
            loaded: false,
            scale: 1,
           
            draw: function (graphic, feature) {

            }
        });
    }
);