define("com/huayun/webgis/renderer/SimpleRenderer", [
    "./FillRenderer",
    "./LineRenderer",
    "./CircleRenderer",
    "./ImageRenderer"
], function (FillRenderer, LineRenderer, CircleRenderer, ImageRenderer) {
    function SimpleRenderer() {
        this.lineRenderer = new LineRenderer();
        this.fillRenderer = new FillRenderer();
        this.circleRenderer = new CircleRenderer();
        this.imageRenderer = new ImageRenderer();
    }

    SimpleRenderer.prototype.add = function (view, graphic, geometry, symbol) {
        switch (symbol.type) {
            case "line":
                this.lineRenderer.add(view, graphic, geometry, symbol);
                break;
            case "polygon":
                this.fillRenderer.add(view, graphic, geometry, symbol);
                break;
            case "circle":
                this.circleRenderer.add(view, graphic, geometry, symbol);
                break;
            case "image":
                this.imageRenderer.add(view, graphic, geometry, symbol);
        }
    };

    SimpleRenderer.prototype.draw = function (view, graphic, geometry, symbol, layerView, index) {
        switch (symbol.type) {
            case "line":
                this.lineRenderer.draw(view, graphic, geometry, symbol, layerView, index);
                break;
            case "polygon":
                this.fillRenderer.draw(view, graphic, geometry, symbol, layerView, index);
                break;
            case "circle":
                this.circleRenderer.draw(view, graphic, geometry, symbol, layerView, index);
                break;
            case "image":
                this.imageRenderer.draw(view, graphic, geometry, symbol, layerView, index);
                break;
        }
    };

    SimpleRenderer.prototype.calculateExtent = function (view, graphic, geometry, symbol, result) {
        switch (symbol.type) {
            case "line":
                this.lineRenderer.calculateExtent(view, graphic, geometry, symbol, result);
                break;
            case "polygon":
                this.fillRenderer.calculateExtent(view, graphic, geometry, symbol, result);
                break;
            case "circle":
                this.circleRenderer.calculateExtent(view, graphic, geometry, symbol, result);
                break;
            case "image":
                this.imageRenderer.calculateExtent(view, graphic, geometry, symbol, result);
                break;
        }
    };

    return SimpleRenderer;
});
