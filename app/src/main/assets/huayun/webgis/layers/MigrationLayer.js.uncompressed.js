/**
 * 迁徙图层
 * @see com.huayun.webgis.layers.MigrationLayer
 */
define("com/huayun/webgis/layers/MigrationLayer", [
  "require",
  "./Layer",
  "../views/3d/layers/MigrationLayerView3D",
  "../geometry/Point",
  "../geometry/Multipoint",
  "../geometry/Polyline",
  "../symbols/CanvasSymbol",
  "../symbols/LineSymbol",
  "../symbols/ImageSymbol",
  "../symbols/TextSymbol",
  "../Feature",
  "../Graphic",
  "../utils/geometryGenerate",
  "../data/GraphicIndex",
  "../views/3d/AnimateGraphicsView"
], function (require, Layer, MigrationLayerView3D, Point, Multipoint, Polyline, CanvasSymbol, LineSymbol, ImageSymbol, TextSymbol, Feature, Graphic, geometryGenerate, GraphicIndex, AnimateGraphicsView) {
  /**
   * 后端出图图层
   * @constructor
   * @alias com.huayun.webgis.layers.MigrationLayer
   * @extends {Layer}
   * @param {Object} params 构造函数参数
   * @param {string}  params.id  图层id
   * @property {string}  type  图层类型
   * @property {string}  id  图层id
   */
  var MigrationLayer = function (params) {
    Layer.call(this, params);
    this.id = params.id === undefined ? "migration" : params.id;
    this.graphics = [];
    this.iconGraphics = [];
    this.graphicIndex = new GraphicIndex();
    this.geometryArr = [];
    this.visible = params.visible === undefined ? true : params.visible;
    this.animate = params.animate === undefined ? true : params.animate;
    this.iconPosition = params.iconPosition;
    this.segment = params.segment === undefined ? 50 : params.segment;
    this.speed = params.gapTime === undefined ? 50 : params.gapTime;
    this.curvature = params.curvature === undefined?4:params.curvature;
    this.moveLine = !!params.moveLine;

    this.textStyle = params.textStyle || {
      color: "#000",
      size: 12
    };

    this.showLineName = !!params.showLineName;

    if (params.nodeSymbol) {
      this.nodeSymbol = params.nodeSymbol;
    } else {
      this.nodeSymbol = new CanvasSymbol({
        width: 40,
        height: 40,
        render: function () {
          var duration = 1000;
          var t = (performance.now() % duration) / duration;
          var radius = (this.width / 2) * 0.3;
          var outerRadius = (this.width / 2) * 0.7 * t + radius;
          var ctx = this.ctx;
          ctx.clearRect(0, 0, this.width, this.height);
          ctx.beginPath();
          ctx.arc(
            this.width / 2,
            this.height / 2,
            outerRadius,
            0,
            Math.PI * 2
          );
          ctx.fillStyle = "rgba(255, 200, 200, " + (1 - t) + ")";
          ctx.fill();

          ctx.beginPath();
          ctx.arc(
            this.width / 2,
            this.height / 2,
            radius,
            0,
            Math.PI * 2
          );
          ctx.fillStyle = "rgba(255, 100, 100, 1)";
          ctx.strokeStyle = "white";
          ctx.lineWidth = 1;
          ctx.fill();
          ctx.stroke();

          return ctx.getImageData(
            0,
            0,
            this.width,
            this.height
          ).data;
        }
      });
    }

    if (params.lineSymbol) {
      this.lineSymbol = params.lineSymbol;
    } else {
      this.lineSymbol = new LineSymbol({
        color: "#0000FF",
        width: 2
      });
    }
    if (params.iconSymbol) {
      this.iconSymbol = params.iconSymbol;
    } else {
      this.iconSymbol = new ImageSymbol({
        url: require.toUrl("com/huayun/webgis/css/images/feijichang.png"),
        width: 20,
        height: 20,
        isRotate: true
      });
    }
    if (params.moveLineSymbol) {
      this.moveLineSymbol = params.moveLineSymbol;
    } else {
      this.moveLineSymbol = new LineSymbol({
        color: "#ffffff",
        width: 6.5,
        length: 16
      });
    }
    if (params.data) {
      this.setData(params.data);
    }
  };
  if (Layer) MigrationLayer.__proto__ = Layer;
  MigrationLayer.prototype = Object.create(Layer && Layer.prototype);
  MigrationLayer.prototype.constructor = MigrationLayer;

  MigrationLayer.prototype.createLayerView = function (view, option) {
    var layerView = new MigrationLayerView3D({
      visible: this.visible,
      view: view,
      id: this.id,
      layer: this
    });
    this.layerView = layerView;
    layerView.transform = view.viewpoint;

    this.graphics.forEach(function (item) {
      this.layerView.addGraphic(item);
    }.bind(this));
    this.iconGraphics.forEach(function (item) {
      this.layerView.addGraphic(item);
    }.bind(this));
    if (this.graphics.length > 0) {
      this._repaint();
    }
    return layerView;
  };

  MigrationLayer.prototype.setData = function (data) {
    this.geometryArr = [];
    this.iconGraphics = [];
    this.graphics = [];
    this.indexNeedUpdate = true;
    this.data = data;
    this.addGraphics(this.data);
  };

  MigrationLayer.prototype.addGraphics = function (data) {
    var index = 0;
    var pArr = [];
    var center = Math.round(this.segment / 2);
    this.lineData = [];
    this.moveLineData = [];
    var lineWidth = this.lineSymbol.width + this.textStyle.size;

    for (var id in data) {
      // 处理点
      var node = data[id];
      var p = node.geometry.coordinates;
      p = new Point(p[0], p[1]);
      pArr.push(p);
      this.geometryArr.push({
        feature: {
          attributes: node,
          geometry: p
        },
        symbol: this.nodeSymbol,
        id: index,
        visible: true
      });
      index++;

      // 处理线
      var flows = node.flows;
      var flow, target;
      var targetIds = {};
      for (var j = 0, jj = flows.length; j < jj; j++) {
        flow = flows[j];
        var curvature = flow.curvature;
        if (!curvature) {
          var value = targetIds[flow.to];
          if (value) {
            targetIds[flow.to] = value+1;
          } else {
            targetIds[flow.to] = 1;
          }
          curvature = this.curvature * targetIds[flow.to];
        }

        target = data[flow.to].geometry.coordinates;
        var targetPoint = new Point(target[0], target[1]);
        var curve = geometryGenerate.generateBezierCurveByTwoPoints(p, targetPoint, this.segment, curvature);
        var polyline = curve.line;
        var normal = curve.normal;
        this.lineData.push(polyline.path[0]);
        if (this.moveLine) {
          this.moveLineData.push([p, curve.middle, targetPoint]);
        }

        var lines = new Feature({
          attributes: flow.lineConfig,
          geometry: polyline
        });
        var lineGraphic = new Graphic({
          feature: lines,
          symbol: this.lineSymbol
        });
        this.graphics.push(lineGraphic);
        this.geometryArr.push(lineGraphic);

        // 线的名称
        if (this.showLineName) {
          var lineName = flow.lineConfig.lineName;
          var textPosition = polyline.path[0][center];
          var nextTextPosition = polyline.path[0][center+1];

          var textSymbol = new TextSymbol({
            text: lineName,
            color: this.textStyle.color,
            size: this.textStyle.size,
            isRotate: true,
            rotateRadian: textPosition.angleTo(nextTextPosition)
          });
          textSymbol.setOffset([normal.x * lineWidth, normal.y * lineWidth]);

          var textFeature = new Feature({
            attributes: {
              name: lineName
            },
            geometry: textPosition
          });
          var textGraphic = new Graphic({
            feature: textFeature,
            symbol: textSymbol
          });
          this.graphics.push(textGraphic);
        }
      }
    }
    var multipoints = new Multipoint(pArr);
    var feature = new Feature({
      attributes: null,
      geometry: multipoints
    });
    var graphic = new Graphic({
      feature: feature,
      symbol: this.nodeSymbol
    });
    this.graphics.push(graphic);

    var geo;
    var nextPoint;
    var radian;
    // 图标
    for (var i = 0, ii = this.lineData.length; i < ii; i++) {
      if (this.iconPosition) {
        switch (this.iconPosition) {
          case MigrationLayer.START:
            geo = this.lineData[i][0]; // 初始点
            nextPoint = this.lineData[i][1];
            radian = geo.angleTo(nextPoint) + Math.PI / 2;
            break;
          case MigrationLayer.END:
            geo = this.lineData[i][this.segment - 2]; // 初始点
            nextPoint = this.lineData[i][this.segment - 1];
            radian = geo.angleTo(nextPoint) + Math.PI / 2;
            geo = nextPoint;
            break;
          default:
            geo = this.lineData[i][center]; // 初始点
            nextPoint = this.lineData[i][center + 1];
            radian = geo.angleTo(nextPoint) + Math.PI / 2;
            break;
        }
      } else {
        geo = this.lineData[i][0]; // 初始点
        nextPoint = this.lineData [i][1];
      }
      var iconFeature = new Feature({
        attributes: null,
        geometry: geo
      });
      var icon = new Graphic({
        feature: iconFeature,
        symbol: this.iconSymbol
      });
      icon.curPos = geo;
      icon.radian = radian;
      this.iconGraphics.push(icon);
    }
    // 处理运动线
    if (this.moveLine) {
      var mline = new Polyline(this.moveLineData);

      feature = new Feature({
        attributes: {},
        geometry: mline
      });

      graphic = new Graphic({
        feature: feature,
        symbol: this.moveLineSymbol,
        renderer: AnimateGraphicsView
      });
      this.graphics.push(graphic);
    }

    if (this.layerView) {
      this.graphics.forEach(function (item) {
        this.layerView.addGraphic(item);
      }.bind(this));
      this.iconGraphics.forEach(function (item) {
        this.layerView.addGraphic(item);
      }.bind(this));
      if (this.graphics.length > 0) {
        this._repaint();
      }
    }
  };

  MigrationLayer.prototype._repaint = function () {
    if (!this.animate || this.interval) {
      this.layerView.view.threeRender();
    } else {
      var count = 0;
      var obj = this;
      var view = this.layerView.view;
      this.interval = setInterval(function () {
        count++;
        if (count > obj.segment - 2) {
          count = 0;
        }
        obj.iconGraphics.forEach(function (item, index) {
         if (!obj.iconPosition) { // 若设置iconPosition, 则icon不动
           var nextPoint = obj.lineData[index][count];
           var p = obj.lineData[index][count + 1];
           item.radian = nextPoint.angleTo(p) + Math.PI / 2;
           item.updatePosition(nextPoint.x - item.curPos.x, nextPoint.y - item.curPos.y);
           item.curPos = nextPoint;
         }
         if (obj.moveLine){
           obj.moveLineSymbol.uniforms.ratio = (obj.moveLineSymbol.uniforms.ratio + 0.00005 * obj.speed)%1;
         }
        });
        view.threeRender();
      }, obj.speed);
    }

  };

  MigrationLayer.prototype.setVisible = function (visible) {
    if (visible && !this.interval) {
      this._repaint();
    }
    if (!visible) {
      clearInterval(this.interval);
      this.interval = null;
    }
  };

  MigrationLayer.prototype.queryFeaturesByGeometry = function (geometry, queryPadding) {
    if (this.indexNeedUpdate) {
      this.graphicIndex.clear();
      this.geometryArr.forEach(function (item) {
        var geometry;
        switch (item.symbol.type) {
          case "point":
            geometry = [[item.feature.geometry]];
            break;
          case "circle":
            geometry = [[item.feature.geometry.center]];
            break;
          case "text":
            return;
          case "canvas":
          case "image":
            geometry = [[item.feature.geometry]];
            break;
          default:
            geometry = item.feature.geometry.path;
        }
        this.graphicIndex.insert(geometry, item.id);
      }.bind(this));
      this.indexNeedUpdate = false;
    }
    queryPadding = queryPadding || this.queryPadding;
    switch (geometry.type) {
      case "point":
        geometry = [geometry];
        break;
    }
    return this.graphicIndex.queryRender(geometry, queryPadding, this.geometryArr, this.layerView.view.resolution, this.layerView.view.viewpoint);
  };

  MigrationLayer.START = 0;
  MigrationLayer.CENTER = 1;
  MigrationLayer.END = 2;

  return MigrationLayer;
});