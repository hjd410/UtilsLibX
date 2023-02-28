define("com/huayun/webgis/layers/support/styleUtils", [
    "exports",
    "./StyleLayerM"
], function (exports, StyleLayer) {

    function convertInOp(property        , values            ) {
        if (values.length === 0) { return false; }
        switch (property) {
            case '$type':
                return ["filter-type-in", ['literal', values]];
            case '$id':
                return ["filter-id-in", ['literal', values]];
            default:
                if (values.length > 200 && !values.some(function (v) { return typeof v !== typeof values[0]; })) {
                    return ['filter-in-large', property, ['literal', values.sort(compare)]];
                } else {
                    return ['filter-in-small', property, ['literal', values]];
                }
        }
    }

    function convertHasOp(property        ) {
        switch (property) {
            case '$type':
                return true;
            case '$id':
                return ["filter-has-id"];
            default:
                return ["filter-has", property];
        }
    }

    function convertNegation(filter       ) {
        return ['!', filter];
    }






});