define("com/huayun/webgis/layers/support/StyleLayerM", [
    "exports",
    "../../data/bucket/FillBucket",
    "../../data/bucket/LineBucket",
    "../../data/bucket/SymbolBucket",
    "../../data/bucket/FillExtrusionBucket",
    "../../data/bucket/HeatmapBucket",
    "../../data/bucket/CircleBucket",
    "./Property",
    "./EvaluationParameters",
    "./expressions",
    "../../utils/utils",
    "../../utils/image",
    "../../geometry/Point2D"
], function (f, FillBucket, LineBucket, SymbolBucket, FillExtrusionBucket, HeatmapBucket, CircleBucket, Property, EvaluationParameters, expressions, utils, image, Point2D) {

    function translate(queryGeometry, translate, translateAnchor, bearing, pixelsToTileUnits) {
        if (!translate[0] && !translate[1]) {
            return queryGeometry;
        }
        var pt = Point2D.convert(translate)._mult(pixelsToTileUnits);

        if (translateAnchor === "viewport") {
            pt._rotate(-bearing);
        }

        var translated = [];
        for (var i = 0; i < queryGeometry.length; i++) {
            var point = queryGeometry[i];
            translated.push(point.sub(pt));
        }
        return translated;
    }

    function getLineWidth(lineWidth, lineGapWidth) {
        if (lineGapWidth > 0) {
            return lineGapWidth + 2 * lineWidth;
        } else {
            return lineWidth;
        }
    }

    function getMaximumPaintValue(property, layer, bucket) {
        var value = ((layer.paint).get(property)).value;
        if (value.kind === 'constant') {
            return value.value;
        } /*else {
            var binders = bucket.programConfigurations.get(layer.id).binders;
            return binders[property].maxValue;
        }*/
    }

    var TRANSITION_SUFFIX = '-transition';
    var $version = 8;
    var $root = {
        version: {
            required: true,
            type: "enum",
            values: [
                8
            ]
        },
        name: {
            type: "string"
        },
        metadata: {
            type: "*"
        },
        center: {
            type: "array",
            value: "number"
        },
        zoom: {
            type: "number"
        },
        bearing: {
            type: "number",
            "default": 0,
            period: 360,
            units: "degrees"
        },
        pitch: {
            type: "number",
            "default": 0,
            units: "degrees"
        },
        light: {
            type: "light"
        },
        sources: {
            required: true,
            type: "sources"
        },
        sprite: {
            type: "string"
        },
        glyphs: {
            type: "string"
        },
        transition: {
            type: "transition"
        },
        layers: {
            required: true,
            type: "array",
            value: "layer"
        }
    };
    var sources = {
        "*": {
            type: "source"
        }
    };
    var source = [
        "source_vector",
        "source_raster",
        "source_raster_dem",
        "source_geojson",
        "source_video",
        "source_image"
    ];
    var source_vector = {
        type: {
            required: true,
            type: "enum",
            values: {
                vector: {}
            }
        },
        url: {
            type: "string"
        },
        tiles: {
            type: "array",
            value: "string"
        },
        bounds: {
            type: "array",
            value: "number",
            length: 4,
            "default": [
                -180,
                -85.051129,
                180,
                85.051129
            ]
        },
        scheme: {
            type: "enum",
            values: {
                xyz: {},
                tms: {}
            },
            "default": "xyz"
        },
        minzoom: {
            type: "number",
            "default": 0
        },
        maxzoom: {
            type: "number",
            "default": 22
        },
        attribution: {
            type: "string"
        },
        "*": {
            type: "*"
        }
    };
    var layer = {
        id: {
            type: "string",
            required: true
        },
        type: {
            type: "enum",
            values: {
                fill: {},
                line: {},
                symbol: {},
                circle: {},
                heatmap: {},
                "fill-extrusion": {},
                raster: {},
                hillshade: {},
                background: {}
            },
            required: true
        },
        metadata: {
            type: "*"
        },
        source: {
            type: "string"
        },
        "source-layer": {
            type: "string"
        },
        minzoom: {
            type: "number",
            minimum: 0,
            maximum: 24
        },
        maxzoom: {
            type: "number",
            minimum: 0,
            maximum: 24
        },
        filter: {
            type: "filter"
        },
        layout: {
            type: "layout"
        },
        paint: {
            type: "paint"
        }
    };
    var layout = [
        "layout_fill",
        "layout_line",
        "layout_circle",
        "layout_heatmap",
        "layout_fill-extrusion",
        "layout_symbol",
        "layout_raster",
        "layout_hillshade",
        "layout_background"
    ];
    var layout_background = {
        visibility: {
            type: "enum",
            values: {
                visible: {},
                none: {}
            },
            "default": "visible",
            "property-type": "constant"
        }
    };
    var layout_fill = {
        visibility: {
            type: "enum",
            values: {
                visible: {},
                none: {}
            },
            "default": "visible",
            "property-type": "constant"
        }
    };
    var layout_circle = {
        visibility: {
            type: "enum",
            values: {
                visible: {},
                none: {}
            },
            "default": "visible",
            "property-type": "constant"
        }
    };
    var layout_heatmap = {
        visibility: {
            type: "enum",
            values: {
                visible: {},
                none: {}
            },
            "default": "visible",
            "property-type": "constant"
        }
    };
    var layout_line = {
        "line-cap": {
            type: "enum",
            values: {
                butt: {},
                round: {},
                square: {}
            },
            "default": "butt",
            expression: {
                interpolated: false,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "data-constant"
        },
        "line-join": {
            type: "enum",
            values: {
                bevel: {},
                round: {},
                miter: {}
            },
            "default": "miter",
            expression: {
                interpolated: false,
                parameters: [
                    "zoom",
                    "feature"
                ]
            },
            "property-type": "data-driven"
        },
        "line-miter-limit": {
            type: "number",
            "default": 2,
            requires: [
                {
                    "line-join": "miter"
                }
            ],
            expression: {
                interpolated: true,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "data-constant"
        },
        "line-round-limit": {
            type: "number",
            "default": 1.05,
            requires: [
                {
                    "line-join": "round"
                }
            ],
            expression: {
                interpolated: true,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "data-constant"
        },
        visibility: {
            type: "enum",
            values: {
                visible: {},
                none: {}
            },
            "default": "visible",
            "property-type": "constant"
        }
    };
    var layout_symbol = {
        "symbol-placement": {
            type: "enum",
            values: {
                point: {},
                line: {},
                "line-center": {}
            },
            "default": "point",
            expression: {
                interpolated: false,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "data-constant"
        },
        "symbol-spacing": {
            type: "number",
            "default": 250,
            minimum: 1,
            units: "pixels",
            requires: [
                {
                    "symbol-placement": "line"
                }
            ],
            expression: {
                interpolated: true,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "data-constant"
        },
        "symbol-avoid-edges": {
            type: "boolean",
            "default": false,
            expression: {
                interpolated: false,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "data-constant"
        },
        "symbol-sort-key": {
            type: "number",
            expression: {
                interpolated: false,
                parameters: [
                    "zoom",
                    "feature"
                ]
            },
            "property-type": "data-driven"
        },
        "symbol-z-order": {
            type: "enum",
            values: {
                auto: {},
                "viewport-y": {},
                source: {}
            },
            "default": "auto",
            expression: {
                interpolated: false,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "data-constant"
        },
        "icon-allow-overlap": {
            type: "boolean",
            "default": false,
            requires: [
                "icon-image"
            ],
            expression: {
                interpolated: false,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "data-constant"
        },
        "icon-ignore-placement": {
            type: "boolean",
            "default": false,
            requires: [
                "icon-image"
            ],
            expression: {
                interpolated: false,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "data-constant"
        },
        "icon-optional": {
            type: "boolean",
            "default": false,
            requires: [
                "icon-image",
                "text-field"
            ],
            expression: {
                interpolated: false,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "data-constant"
        },
        "icon-rotation-alignment": {
            type: "enum",
            values: {
                map: {},
                viewport: {},
                auto: {}
            },
            "default": "auto",
            requires: [
                "icon-image"
            ],
            expression: {
                interpolated: false,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "data-constant"
        },
        "icon-size": {
            type: "number",
            "default": 1,
            minimum: 0,
            units: "factor of the original icon size",
            requires: [
                "icon-image"
            ],
            expression: {
                interpolated: true,
                parameters: [
                    "zoom",
                    "feature"
                ]
            },
            "property-type": "data-driven"
        },
        "icon-text-fit": {
            type: "enum",
            values: {
                none: {},
                width: {},
                height: {},
                both: {}
            },
            "default": "none",
            requires: [
                "icon-image",
                "text-field"
            ],
            expression: {
                interpolated: false,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "data-constant"
        },
        "icon-text-fit-padding": {
            type: "array",
            value: "number",
            length: 4,
            "default": [
                0,
                0,
                0,
                0
            ],
            units: "pixels",
            requires: [
                "icon-image",
                "text-field",
                {
                    "icon-text-fit": [
                        "both",
                        "width",
                        "height"
                    ]
                }
            ],
            expression: {
                interpolated: true,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "data-constant"
        },
        "icon-image": {
            type: "string",
            tokens: true,
            expression: {
                interpolated: false,
                parameters: [
                    "zoom",
                    "feature"
                ]
            },
            "property-type": "data-driven"
        },
        "icon-rotate": {
            type: "number",
            "default": 0,
            period: 360,
            units: "degrees",
            requires: [
                "icon-image"
            ],
            expression: {
                interpolated: true,
                parameters: [
                    "zoom",
                    "feature"
                ]
            },
            "property-type": "data-driven"
        },
        "icon-padding": {
            type: "number",
            "default": 2,
            minimum: 0,
            units: "pixels",
            requires: [
                "icon-image"
            ],
            expression: {
                interpolated: true,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "data-constant"
        },
        "icon-keep-upright": {
            type: "boolean",
            "default": false,
            requires: [
                "icon-image",
                {
                    "icon-rotation-alignment": "map"
                },
                {
                    "symbol-placement": [
                        "line",
                        "line-center"
                    ]
                }
            ],
            expression: {
                interpolated: false,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "data-constant"
        },
        "icon-offset": {
            type: "array",
            value: "number",
            length: 2,
            "default": [
                0,
                0
            ],
            requires: [
                "icon-image"
            ],
            expression: {
                interpolated: true,
                parameters: [
                    "zoom",
                    "feature"
                ]
            },
            "property-type": "data-driven"
        },
        "icon-anchor": {
            type: "enum",
            values: {
                center: {},
                left: {},
                right: {},
                top: {},
                bottom: {},
                "top-left": {},
                "top-right": {},
                "bottom-left": {},
                "bottom-right": {}
            },
            "default": "center",
            requires: [
                "icon-image"
            ],
            expression: {
                interpolated: false,
                parameters: [
                    "zoom",
                    "feature"
                ]
            },
            "property-type": "data-driven"
        },
        "icon-pitch-alignment": {
            type: "enum",
            values: {
                map: {},
                viewport: {},
                auto: {}
            },
            "default": "auto",
            requires: [
                "icon-image"
            ],
            expression: {
                interpolated: false,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "data-constant"
        },
        "text-pitch-alignment": {
            type: "enum",
            values: {
                map: {},
                viewport: {},
                auto: {}
            },
            "default": "auto",
            requires: [
                "text-field"
            ],
            expression: {
                interpolated: false,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "data-constant"
        },
        "text-rotation-alignment": {
            type: "enum",
            values: {
                map: {},
                viewport: {},
                auto: {}
            },
            "default": "auto",
            requires: [
                "text-field"
            ],
            expression: {
                interpolated: false,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "data-constant"
        },
        "text-field": {
            type: "formatted",
            "default": "",
            tokens: true,
            expression: {
                interpolated: false,
                parameters: [
                    "zoom",
                    "feature"
                ]
            },
            "property-type": "data-driven"
        },
        "text-font": {
            type: "array",
            value: "string",
            "default": [
                "Open Sans Regular",
                "Arial Unicode MS Regular"
            ],
            requires: [
                "text-field"
            ],
            expression: {
                interpolated: false,
                parameters: [
                    "zoom",
                    "feature"
                ]
            },
            "property-type": "data-driven"
        },
        "text-size": {
            type: "number",
            "default": 16,
            minimum: 0,
            units: "pixels",
            requires: [
                "text-field"
            ],
            expression: {
                interpolated: true,
                parameters: [
                    "zoom",
                    "feature"
                ]
            },
            "property-type": "data-driven"
        },
        "text-max-width": {
            type: "number",
            "default": 10,
            minimum: 0,
            units: "ems",
            requires: [
                "text-field"
            ],
            expression: {
                interpolated: true,
                parameters: [
                    "zoom",
                    "feature"
                ]
            },
            "property-type": "data-driven"
        },
        "text-line-height": {
            type: "number",
            "default": 1.2,
            units: "ems",
            requires: [
                "text-field"
            ],
            expression: {
                interpolated: true,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "data-constant"
        },
        "text-letter-spacing": {
            type: "number",
            "default": 0,
            units: "ems",
            requires: [
                "text-field"
            ],
            expression: {
                interpolated: true,
                parameters: [
                    "zoom",
                    "feature"
                ]
            },
            "property-type": "data-driven"
        },
        "text-justify": {
            type: "enum",
            values: {
                auto: {},
                left: {},
                center: {},
                right: {}
            },
            "default": "center",
            requires: [
                "text-field"
            ],
            expression: {
                interpolated: false,
                parameters: [
                    "zoom",
                    "feature"
                ]
            },
            "property-type": "data-driven"
        },
        "text-radial-offset": {
            type: "number",
            units: "ems",
            "default": 0,
            requires: [
                "text-field"
            ],
            "property-type": "data-driven",
            expression: {
                interpolated: true,
                parameters: [
                    "zoom",
                    "feature"
                ]
            }
        },
        "text-variable-anchor": {
            type: "array",
            value: "enum",
            values: {
                center: {},
                left: {},
                right: {},
                top: {},
                bottom: {},
                "top-left": {},
                "top-right": {},
                "bottom-left": {},
                "bottom-right": {}
            },
            requires: [
                "text-field",
                {
                    "symbol-placement": [
                        "point"
                    ]
                }
            ],
            expression: {
                interpolated: false,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "data-constant"
        },
        "text-anchor": {
            type: "enum",
            values: {
                center: {},
                left: {},
                right: {},
                top: {},
                bottom: {},
                "top-left": {},
                "top-right": {},
                "bottom-left": {},
                "bottom-right": {}
            },
            "default": "center",
            requires: [
                "text-field",
                {
                    "!": "text-variable-anchor"
                }
            ],
            expression: {
                interpolated: false,
                parameters: [
                    "zoom",
                    "feature"
                ]
            },
            "property-type": "data-driven"
        },
        "text-max-angle": {
            type: "number",
            "default": 45,
            units: "degrees",
            requires: [
                "text-field",
                {
                    "symbol-placement": [
                        "line",
                        "line-center"
                    ]
                }
            ],
            expression: {
                interpolated: true,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "data-constant"
        },
        "text-rotate": {
            type: "number",
            "default": 0,
            period: 360,
            units: "degrees",
            requires: [
                "text-field"
            ],
            expression: {
                interpolated: true,
                parameters: [
                    "zoom",
                    "feature"
                ]
            },
            "property-type": "data-driven"
        },
        "text-padding": {
            type: "number",
            "default": 2,
            minimum: 0,
            units: "pixels",
            requires: [
                "text-field"
            ],
            expression: {
                interpolated: true,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "data-constant"
        },
        "text-keep-upright": {
            type: "boolean",
            "default": true,
            requires: [
                "text-field",
                {
                    "text-rotation-alignment": "map"
                },
                {
                    "symbol-placement": [
                        "line",
                        "line-center"
                    ]
                }
            ],
            expression: {
                interpolated: false,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "data-constant"
        },
        "text-transform": {
            type: "enum",
            values: {
                none: {},
                uppercase: {},
                lowercase: {}
            },
            "default": "none",
            requires: [
                "text-field"
            ],
            expression: {
                interpolated: false,
                parameters: [
                    "zoom",
                    "feature"
                ]
            },
            "property-type": "data-driven"
        },
        "text-offset": {
            type: "array",
            value: "number",
            units: "ems",
            length: 2,
            "default": [
                0,
                0
            ],
            requires: [
                "text-field",
                {
                    "!": "text-radial-offset"
                },
                {
                    "!": "text-variable-anchor"
                }
            ],
            expression: {
                interpolated: true,
                parameters: [
                    "zoom",
                    "feature"
                ]
            },
            "property-type": "data-driven"
        },
        "text-allow-overlap": {
            type: "boolean",
            "default": false,
            requires: [
                "text-field"
            ],
            expression: {
                interpolated: false,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "data-constant"
        },
        "text-ignore-placement": {
            type: "boolean",
            "default": false,
            requires: [
                "text-field"
            ],
            expression: {
                interpolated: false,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "data-constant"
        },
        "text-optional": {
            type: "boolean",
            "default": false,
            requires: [
                "text-field",
                "icon-image"
            ],
            expression: {
                interpolated: false,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "data-constant"
        },
        visibility: {
            type: "enum",
            values: {
                visible: {},
                none: {}
            },
            "default": "visible",
            "property-type": "constant"
        }
    };
    var layout_raster = {
        visibility: {
            type: "enum",
            values: {
                visible: {},
                none: {}
            },
            "default": "visible",
            "property-type": "constant"
        }
    };
    var layout_hillshade = {
        visibility: {
            type: "enum",
            values: {
                visible: {},
                none: {}
            },
            "default": "visible",
            "property-type": "constant"
        }
    };
    var filter = {
        type: "array",
        value: "*"
    };
    var filter_operator = {
        type: "enum",
        values: {
            "==": {},
            "!=": {},
            ">": {},
            ">=": {},
            "<": {},
            "<=": {},
            "in": {},
            "!in": {},
            all: {},
            any: {},
            none: {},
            has: {},
            "!has": {}
        }
    };

    var geometry_type = {
        type: "enum",
        values: {
            Point: {},
            LineString: {},
            Polygon: {}
        }
    };
    var function_stop = {
        type: "array",
        minimum: 0,
        maximum: 22,
        value: [
            "number",
            "color"
        ],
        length: 2
    };
    var expression = {
        type: "array",
        value: "*",
        minimum: 1
    };
    var expression_name = {
        type: "enum",
        values: {
            "let": {
                group: "Variable binding"
            },
            "var": {
                group: "Variable binding"
            },
            literal: {
                group: "Types"
            },
            array: {
                group: "Types"
            },
            at: {
                group: "Lookup"
            },
            "case": {
                group: "Decision"
            },
            match: {
                group: "Decision"
            },
            coalesce: {
                group: "Decision"
            },
            step: {
                group: "Ramps, scales, curves"
            },
            interpolate: {
                group: "Ramps, scales, curves"
            },
            "interpolate-hcl": {
                group: "Ramps, scales, curves"
            },
            "interpolate-lab": {
                group: "Ramps, scales, curves"
            },
            ln2: {
                group: "Math"
            },
            pi: {
                group: "Math"
            },
            e: {
                group: "Math"
            },
            "typeof": {
                group: "Types"
            },
            string: {
                group: "Types"
            },
            number: {
                group: "Types"
            },
            boolean: {
                group: "Types"
            },
            object: {
                group: "Types"
            },
            collator: {
                group: "Types"
            },
            format: {
                group: "Types"
            },
            "number-format": {
                group: "Types"
            },
            "to-string": {
                group: "Types"
            },
            "to-number": {
                group: "Types"
            },
            "to-boolean": {
                group: "Types"
            },
            "to-rgba": {
                group: "Color"
            },
            "to-color": {
                group: "Types"
            },
            rgb: {
                group: "Color"
            },
            rgba: {
                group: "Color"
            },
            get: {
                group: "Lookup"
            },
            has: {
                group: "Lookup"
            },
            length: {
                group: "Lookup"
            },
            properties: {
                group: "Feature data"
            },
            "feature-state": {
                group: "Feature data"
            },
            "geometry-type": {
                group: "Feature data"
            },
            id: {
                group: "Feature data"
            },
            zoom: {
                group: "Zoom"
            },
            "heatmap-density": {
                group: "Heatmap"
            },
            "line-progress": {
                group: "Feature data"
            },
            accumulated: {
                group: "Feature data"
            },
            "+": {
                group: "Math"
            },
            "*": {
                group: "Math"
            },
            "-": {
                group: "Math"
            },
            "/": {
                group: "Math"
            },
            "%": {
                group: "Math"
            },
            "^": {
                group: "Math"
            },
            sqrt: {
                group: "Math"
            },
            log10: {
                group: "Math"
            },
            ln: {
                group: "Math"
            },
            log2: {
                group: "Math"
            },
            sin: {
                group: "Math"
            },
            cos: {
                group: "Math"
            },
            tan: {
                group: "Math"
            },
            asin: {
                group: "Math"
            },
            acos: {
                group: "Math"
            },
            atan: {
                group: "Math"
            },
            min: {
                group: "Math"
            },
            max: {
                group: "Math"
            },
            round: {
                group: "Math"
            },
            abs: {
                group: "Math"
            },
            ceil: {
                group: "Math"
            },
            floor: {
                group: "Math"
            },
            "==": {
                group: "Decision"
            },
            "!=": {
                group: "Decision"
            },
            ">": {
                group: "Decision"
            },
            "<": {
                group: "Decision"
            },
            ">=": {
                group: "Decision"
            },
            "<=": {
                group: "Decision"
            },
            all: {
                group: "Decision"
            },
            any: {
                group: "Decision"
            },
            "!": {
                group: "Decision"
            },
            "is-supported-script": {
                group: "String"
            },
            upcase: {
                group: "String"
            },
            downcase: {
                group: "String"
            },
            concat: {
                group: "String"
            },
            "resolved-locale": {
                group: "String"
            }
        }
    };
    var light = {
        anchor: {
            type: "enum",
            "default": "viewport",
            values: {
                map: {},
                viewport: {}
            },
            "property-type": "data-constant",
            transition: false,
            expression: {
                interpolated: false,
                parameters: [
                    "zoom"
                ]
            }
        },
        position: {
            type: "array",
            "default": [
                1.15,
                210,
                30
            ],
            length: 3,
            value: "number",
            "property-type": "data-constant",
            transition: true,
            expression: {
                interpolated: true,
                parameters: [
                    "zoom"
                ]
            }
        },
        color: {
            type: "color",
            "property-type": "data-constant",
            "default": "#ffffff",
            expression: {
                interpolated: true,
                parameters: [
                    "zoom"
                ]
            },
            transition: true
        },
        intensity: {
            type: "number",
            "property-type": "data-constant",
            "default": 0.5,
            minimum: 0,
            maximum: 1,
            expression: {
                interpolated: true,
                parameters: [
                    "zoom"
                ]
            },
            transition: true
        }
    };
    var paint = [
        "paint_fill",
        "paint_line",
        "paint_circle",
        "paint_heatmap",
        "paint_fill-extrusion",
        "paint_symbol",
        "paint_raster",
        "paint_hillshade",
        "paint_background"
    ];
    var paint_fill = {
        "fill-antialias": {
            type: "boolean",
            "default": true,
            expression: {
                interpolated: false,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "data-constant"
        },
        "fill-opacity": {
            type: "number",
            "default": 1,
            minimum: 0,
            maximum: 1,
            transition: true,
            expression: {
                interpolated: true,
                parameters: [
                    "zoom",
                    "feature",
                    "feature-state"
                ]
            },
            "property-type": "data-driven"
        },
        "fill-color": {
            type: "color",
            "default": "#000000",
            transition: true,
            requires: [
                {
                    "!": "fill-pattern"
                }
            ],
            expression: {
                interpolated: true,
                parameters: [
                    "zoom",
                    "feature",
                    "feature-state"
                ]
            },
            "property-type": "data-driven"
        },
        "fill-outline-color": {
            type: "color",
            transition: true,
            requires: [
                {
                    "!": "fill-pattern"
                },
                {
                    "fill-antialias": true
                }
            ],
            expression: {
                interpolated: true,
                parameters: [
                    "zoom",
                    "feature",
                    "feature-state"
                ]
            },
            "property-type": "data-driven"
        },
        "fill-translate": {
            type: "array",
            value: "number",
            length: 2,
            "default": [
                0,
                0
            ],
            transition: true,
            units: "pixels",
            expression: {
                interpolated: true,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "data-constant"
        },
        "fill-translate-anchor": {
            type: "enum",
            values: {
                map: {},
                viewport: {}
            },
            "default": "map",
            requires: [
                "fill-translate"
            ],
            expression: {
                interpolated: false,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "data-constant"
        },
        "fill-pattern": {
            type: "string",
            transition: true,
            expression: {
                interpolated: false,
                parameters: [
                    "zoom",
                    "feature"
                ]
            },
            "property-type": "cross-faded-data-driven"
        }
    };
    var paint_line = {
        "line-opacity": {
            type: "number",
            "default": 1,
            minimum: 0,
            maximum: 1,
            transition: true,
            expression: {
                interpolated: true,
                parameters: [
                    "zoom",
                    "feature",
                    "feature-state"
                ]
            },
            "property-type": "data-driven"
        },
        "line-color": {
            type: "color",
            "default": "#000000",
            transition: true,
            requires: [
                {
                    "!": "line-pattern"
                }
            ],
            expression: {
                interpolated: true,
                parameters: [
                    "zoom",
                    "feature",
                    "feature-state"
                ]
            },
            "property-type": "data-driven"
        },
        "line-translate": {
            type: "array",
            value: "number",
            length: 2,
            "default": [
                0,
                0
            ],
            transition: true,
            units: "pixels",
            expression: {
                interpolated: true,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "data-constant"
        },
        "line-translate-anchor": {
            type: "enum",
            values: {
                map: {},
                viewport: {}
            },
            "default": "map",
            requires: [
                "line-translate"
            ],
            expression: {
                interpolated: false,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "data-constant"
        },
        "line-width": {
            type: "number",
            "default": 1,
            minimum: 0,
            transition: true,
            units: "pixels",
            expression: {
                interpolated: true,
                parameters: [
                    "zoom",
                    "feature",
                    "feature-state"
                ]
            },
            "property-type": "data-driven"
        },
        "line-gap-width": {
            type: "number",
            "default": 0,
            minimum: 0,
            transition: true,
            units: "pixels",
            expression: {
                interpolated: true,
                parameters: [
                    "zoom",
                    "feature",
                    "feature-state"
                ]
            },
            "property-type": "data-driven"
        },
        "line-offset": {
            type: "number",
            "default": 0,
            transition: true,
            units: "pixels",
            expression: {
                interpolated: true,
                parameters: [
                    "zoom",
                    "feature",
                    "feature-state"
                ]
            },
            "property-type": "data-driven"
        },
        "line-blur": {
            type: "number",
            "default": 0,
            minimum: 0,
            transition: true,
            units: "pixels",
            expression: {
                interpolated: true,
                parameters: [
                    "zoom",
                    "feature",
                    "feature-state"
                ]
            },
            "property-type": "data-driven"
        },
        "line-dasharray": {
            type: "array",
            value: "number",
            minimum: 0,
            transition: true,
            units: "line widths",
            requires: [
                {
                    "!": "line-pattern"
                }
            ],
            expression: {
                interpolated: false,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "cross-faded"
        },
        "line-pattern": {
            type: "string",
            transition: true,
            expression: {
                interpolated: false,
                parameters: [
                    "zoom",
                    "feature"
                ]
            },
            "property-type": "cross-faded-data-driven"
        },
        "line-gradient": {
            type: "color",
            transition: false,
            requires: [
                {
                    "!": "line-dasharray"
                },
                {
                    "!": "line-pattern"
                },
                {
                    source: "geojson",
                    has: {
                        lineMetrics: true
                    }
                }
            ],
            expression: {
                interpolated: true,
                parameters: [
                    "line-progress"
                ]
            },
            "property-type": "color-ramp"
        }
    };
    var paint_circle = {
        "circle-radius": {
            type: "number",
            "default": 5,
            minimum: 0,
            transition: true,
            units: "pixels",
            expression: {
                interpolated: true,
                parameters: [
                    "zoom",
                    "feature",
                    "feature-state"
                ]
            },
            "property-type": "data-driven"
        },
        "circle-color": {
            type: "color",
            "default": "#000000",
            transition: true,
            expression: {
                interpolated: true,
                parameters: [
                    "zoom",
                    "feature",
                    "feature-state"
                ]
            },
            "property-type": "data-driven"
        },
        "circle-blur": {
            type: "number",
            "default": 0,
            transition: true,
            expression: {
                interpolated: true,
                parameters: [
                    "zoom",
                    "feature",
                    "feature-state"
                ]
            },
            "property-type": "data-driven"
        },
        "circle-opacity": {
            type: "number",
            "default": 1,
            minimum: 0,
            maximum: 1,
            transition: true,
            expression: {
                interpolated: true,
                parameters: [
                    "zoom",
                    "feature",
                    "feature-state"
                ]
            },
            "property-type": "data-driven"
        },
        "circle-translate": {
            type: "array",
            value: "number",
            length: 2,
            "default": [
                0,
                0
            ],
            transition: true,
            units: "pixels",
            expression: {
                interpolated: true,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "data-constant"
        },
        "circle-translate-anchor": {
            type: "enum",
            values: {
                map: {},
                viewport: {}
            },
            "default": "map",
            requires: [
                "circle-translate"
            ],
            expression: {
                interpolated: false,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "data-constant"
        },
        "circle-pitch-scale": {
            type: "enum",
            values: {
                map: {},
                viewport: {}
            },
            "default": "map",
            expression: {
                interpolated: false,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "data-constant"
        },
        "circle-pitch-alignment": {
            type: "enum",
            values: {
                map: {},
                viewport: {}
            },
            "default": "viewport",
            expression: {
                interpolated: false,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "data-constant"
        },
        "circle-stroke-width": {
            type: "number",
            "default": 0,
            minimum: 0,
            transition: true,
            units: "pixels",
            expression: {
                interpolated: true,
                parameters: [
                    "zoom",
                    "feature",
                    "feature-state"
                ]
            },
            "property-type": "data-driven"
        },
        "circle-stroke-color": {
            type: "color",
            "default": "#000000",
            transition: true,
            expression: {
                interpolated: true,
                parameters: [
                    "zoom",
                    "feature",
                    "feature-state"
                ]
            },
            "property-type": "data-driven"
        },
        "circle-stroke-opacity": {
            type: "number",
            "default": 1,
            minimum: 0,
            maximum: 1,
            transition: true,
            expression: {
                interpolated: true,
                parameters: [
                    "zoom",
                    "feature",
                    "feature-state"
                ]
            },
            "property-type": "data-driven"
        }
    };
    var paint_heatmap = {
        "heatmap-radius": {
            type: "number",
            "default": 30,
            minimum: 1,
            transition: true,
            units: "pixels",
            expression: {
                interpolated: true,
                parameters: [
                    "zoom",
                    "feature",
                    "feature-state"
                ]
            },
            "property-type": "data-driven"
        },
        "heatmap-weight": {
            type: "number",
            "default": 1,
            minimum: 0,
            transition: false,
            expression: {
                interpolated: true,
                parameters: [
                    "zoom",
                    "feature",
                    "feature-state"
                ]
            },
            "property-type": "data-driven"
        },
        "heatmap-intensity": {
            type: "number",
            "default": 1,
            minimum: 0,
            transition: true,
            expression: {
                interpolated: true,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "data-constant"
        },
        "heatmap-color": {
            type: "color",
            "default": [
                "interpolate",
                [
                    "linear"
                ],
                [
                    "heatmap-density"
                ],
                0,
                "rgba(0, 0, 255, 0)",
                0.1,
                "royalblue",
                0.3,
                "cyan",
                0.5,
                "lime",
                0.7,
                "yellow",
                1,
                "red"
            ],
            transition: false,
            expression: {
                interpolated: true,
                parameters: [
                    "heatmap-density"
                ]
            },
            "property-type": "color-ramp"
        },
        "heatmap-opacity": {
            type: "number",
            "default": 1,
            minimum: 0,
            maximum: 1,
            transition: true,
            expression: {
                interpolated: true,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "data-constant"
        }
    };
    var paint_symbol = {
        "icon-opacity": {
            type: "number",
            "default": 1,
            minimum: 0,
            maximum: 1,
            transition: true,
            requires: [
                "icon-image"
            ],
            expression: {
                interpolated: true,
                parameters: [
                    "zoom",
                    "feature",
                    "feature-state"
                ]
            },
            "property-type": "data-driven"
        },
        "icon-color": {
            type: "color",
            "default": "#000000",
            transition: true,
            requires: [
                "icon-image"
            ],
            expression: {
                interpolated: true,
                parameters: [
                    "zoom",
                    "feature",
                    "feature-state"
                ]
            },
            "property-type": "data-driven"
        },
        "icon-halo-color": {
            type: "color",
            "default": "rgba(0, 0, 0, 0)",
            transition: true,
            requires: [
                "icon-image"
            ],
            expression: {
                interpolated: true,
                parameters: [
                    "zoom",
                    "feature",
                    "feature-state"
                ]
            },
            "property-type": "data-driven"
        },
        "icon-halo-width": {
            type: "number",
            "default": 0,
            minimum: 0,
            transition: true,
            units: "pixels",
            requires: [
                "icon-image"
            ],
            expression: {
                interpolated: true,
                parameters: [
                    "zoom",
                    "feature",
                    "feature-state"
                ]
            },
            "property-type": "data-driven"
        },
        "icon-halo-blur": {
            type: "number",
            "default": 0,
            minimum: 0,
            transition: true,
            units: "pixels",
            requires: [
                "icon-image"
            ],
            expression: {
                interpolated: true,
                parameters: [
                    "zoom",
                    "feature",
                    "feature-state"
                ]
            },
            "property-type": "data-driven"
        },
        "icon-translate": {
            type: "array",
            value: "number",
            length: 2,
            "default": [
                0,
                0
            ],
            transition: true,
            units: "pixels",
            requires: [
                "icon-image"
            ],
            expression: {
                interpolated: true,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "data-constant"
        },
        "icon-translate-anchor": {
            type: "enum",
            values: {
                map: {},
                viewport: {}
            },
            "default": "map",
            requires: [
                "icon-image",
                "icon-translate"
            ],
            expression: {
                interpolated: false,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "data-constant"
        },
        "text-opacity": {
            type: "number",
            "default": 1,
            minimum: 0,
            maximum: 1,
            transition: true,
            requires: [
                "text-field"
            ],
            expression: {
                interpolated: true,
                parameters: [
                    "zoom",
                    "feature",
                    "feature-state"
                ]
            },
            "property-type": "data-driven"
        },
        "text-color": {
            type: "color",
            "default": "#000000",
            transition: true,
            requires: [
                "text-field"
            ],
            expression: {
                interpolated: true,
                parameters: [
                    "zoom",
                    "feature",
                    "feature-state"
                ]
            },
            "property-type": "data-driven"
        },
        "text-halo-color": {
            type: "color",
            "default": "rgba(0, 0, 0, 0)",
            transition: true,
            requires: [
                "text-field"
            ],
            expression: {
                interpolated: true,
                parameters: [
                    "zoom",
                    "feature",
                    "feature-state"
                ]
            },
            "property-type": "data-driven"
        },
        "text-halo-width": {
            type: "number",
            "default": 0,
            minimum: 0,
            transition: true,
            units: "pixels",
            requires: [
                "text-field"
            ],
            expression: {
                interpolated: true,
                parameters: [
                    "zoom",
                    "feature",
                    "feature-state"
                ]
            },
            "property-type": "data-driven"
        },
        "text-halo-blur": {
            type: "number",
            "default": 0,
            minimum: 0,
            transition: true,
            units: "pixels",
            requires: [
                "text-field"
            ],
            expression: {
                interpolated: true,
                parameters: [
                    "zoom",
                    "feature",
                    "feature-state"
                ]
            },
            "property-type": "data-driven"
        },
        "text-translate": {
            type: "array",
            value: "number",
            length: 2,
            "default": [
                0,
                0
            ],
            transition: true,
            units: "pixels",
            requires: [
                "text-field"
            ],
            expression: {
                interpolated: true,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "data-constant"
        },
        "text-translate-anchor": {
            type: "enum",
            values: {
                map: {},
                viewport: {}
            },
            "default": "map",
            requires: [
                "text-field",
                "text-translate"
            ],
            expression: {
                interpolated: false,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "data-constant"
        }
    };
    var paint_raster = {
        "raster-opacity": {
            type: "number",
            "default": 1,
            minimum: 0,
            maximum: 1,
            transition: true,
            expression: {
                interpolated: true,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "data-constant"
        },
        "raster-hue-rotate": {
            type: "number",
            "default": 0,
            period: 360,
            transition: true,
            units: "degrees",
            expression: {
                interpolated: true,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "data-constant"
        },
        "raster-brightness-min": {
            type: "number",
            "default": 0,
            minimum: 0,
            maximum: 1,
            transition: true,
            expression: {
                interpolated: true,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "data-constant"
        },
        "raster-brightness-max": {
            type: "number",
            "default": 1,
            minimum: 0,
            maximum: 1,
            transition: true,
            expression: {
                interpolated: true,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "data-constant"
        },
        "raster-saturation": {
            type: "number",
            "default": 0,
            minimum: -1,
            maximum: 1,
            transition: true,
            expression: {
                interpolated: true,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "data-constant"
        },
        "raster-contrast": {
            type: "number",
            "default": 0,
            minimum: -1,
            maximum: 1,
            transition: true,
            expression: {
                interpolated: true,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "data-constant"
        },
        "raster-resampling": {
            type: "enum",
            values: {
                linear: {},
                nearest: {}
            },
            "default": "linear",
            expression: {
                interpolated: false,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "data-constant"
        },
        "raster-fade-duration": {
            type: "number",
            "default": 300,
            minimum: 0,
            transition: false,
            units: "milliseconds",
            expression: {
                interpolated: true,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "data-constant"
        }
    };
    var paint_hillshade = {
        "hillshade-illumination-direction": {
            type: "number",
            "default": 335,
            minimum: 0,
            maximum: 359,
            transition: false,
            expression: {
                interpolated: true,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "data-constant"
        },
        "hillshade-illumination-anchor": {
            type: "enum",
            values: {
                map: {},
                viewport: {}
            },
            "default": "viewport",
            expression: {
                interpolated: false,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "data-constant"
        },
        "hillshade-exaggeration": {
            type: "number",
            "default": 0.5,
            minimum: 0,
            maximum: 1,
            transition: true,
            expression: {
                interpolated: true,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "data-constant"
        },
        "hillshade-shadow-color": {
            type: "color",
            "default": "#000000",
            transition: true,
            expression: {
                interpolated: true,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "data-constant"
        },
        "hillshade-highlight-color": {
            type: "color",
            "default": "#FFFFFF",
            transition: true,
            expression: {
                interpolated: true,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "data-constant"
        },
        "hillshade-accent-color": {
            type: "color",
            "default": "#000000",
            transition: true,
            expression: {
                interpolated: true,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "data-constant"
        }
    };
    var paint_background = {
        "background-color": {
            type: "color",
            "default": "#000000",
            transition: true,
            requires: [
                {
                    "!": "background-pattern"
                }
            ],
            expression: {
                interpolated: true,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "data-constant"
        },
        "background-pattern": {
            type: "string",
            transition: true,
            expression: {
                interpolated: false,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "cross-faded"
        },
        "background-opacity": {
            type: "number",
            "default": 1,
            minimum: 0,
            maximum: 1,
            transition: true,
            expression: {
                interpolated: true,
                parameters: [
                    "zoom"
                ]
            },
            "property-type": "data-constant"
        }
    };
    var transition = {
        duration: {
            type: "number",
            "default": 300,
            minimum: 0,
            units: "milliseconds"
        },
        delay: {
            type: "number",
            "default": 0,
            minimum: 0,
            units: "milliseconds"
        }
    };
    var spec = {
        $version: $version,
        $root: $root,
        sources: sources,
        source: source,
        source_vector: source_vector,
        layer: layer,
        layout: layout,
        layout_background: layout_background,
        layout_fill: layout_fill,
        layout_circle: layout_circle,
        layout_heatmap: layout_heatmap,
        "layout_fill-extrusion": {
            visibility: {
                type: "enum",
                values: {
                    visible: {},
                    none: {}
                },
                "default": "visible",
                "property-type": "constant"
            }
        },
        layout_line: layout_line,
        layout_symbol: layout_symbol,
        layout_raster: layout_raster,
        layout_hillshade: layout_hillshade,
        filter: filter,
        filter_operator: filter_operator,
        geometry_type: geometry_type,
        "function": {
            expression: {
                type: "expression"
            },
            stops: {
                type: "array",
                value: "function_stop"
            },
            base: {
                type: "number",
                "default": 1,
                minimum: 0
            },
            property: {
                type: "string",
                "default": "$zoom"
            },
            type: {
                type: "enum",
                values: {
                    identity: {},
                    exponential: {},
                    interval: {},
                    categorical: {}
                },
                "default": "exponential"
            },
            colorSpace: {
                type: "enum",
                values: {
                    rgb: {},
                    lab: {},
                    hcl: {}
                },
                "default": "rgb"
            },
            "default": {
                type: "*",
                required: false
            }
        },
        function_stop: function_stop,
        expression: expression,
        expression_name: expression_name,
        light: light,
        paint: paint,
        paint_fill: paint_fill,
        "paint_fill-extrusion": {
            "fill-extrusion-opacity": {
                type: "number",
                "default": 1,
                minimum: 0,
                maximum: 1,
                transition: true,
                expression: {
                    interpolated: true,
                    parameters: [
                        "zoom"
                    ]
                },
                "property-type": "data-constant"
            },
            "fill-extrusion-color": {
                type: "color",
                "default": "#000000",
                transition: true,
                requires: [
                    {
                        "!": "fill-extrusion-pattern"
                    }
                ],
                expression: {
                    interpolated: true,
                    parameters: [
                        "zoom",
                        "feature",
                        "feature-state"
                    ]
                },
                "property-type": "data-driven"
            },
            "fill-extrusion-translate": {
                type: "array",
                value: "number",
                length: 2,
                "default": [
                    0,
                    0
                ],
                transition: true,
                units: "pixels",
                expression: {
                    interpolated: true,
                    parameters: [
                        "zoom"
                    ]
                },
                "property-type": "data-constant"
            },
            "fill-extrusion-translate-anchor": {
                type: "enum",
                values: {
                    map: {},
                    viewport: {}
                },
                "default": "map",
                requires: [
                    "fill-extrusion-translate"
                ],
                expression: {
                    interpolated: false,
                    parameters: [
                        "zoom"
                    ]
                },
                "property-type": "data-constant"
            },
            "fill-extrusion-pattern": {
                type: "string",
                transition: true,
                expression: {
                    interpolated: false,
                    parameters: [
                        "zoom",
                        "feature"
                    ]
                },
                "property-type": "cross-faded-data-driven"
            },
            "fill-extrusion-height": {
                type: "number",
                "default": 0,
                minimum: 0,
                units: "meters",
                transition: true,
                expression: {
                    interpolated: true,
                    parameters: [
                        "zoom",
                        "feature",
                        "feature-state"
                    ]
                },
                "property-type": "data-driven"
            },
            "fill-extrusion-base": {
                type: "number",
                "default": 0,
                minimum: 0,
                units: "meters",
                transition: true,
                requires: [
                    "fill-extrusion-height"
                ],
                expression: {
                    interpolated: true,
                    parameters: [
                        "zoom",
                        "feature",
                        "feature-state"
                    ]
                },
                "property-type": "data-driven"
            },
            "fill-extrusion-vertical-gradient": {
                type: "boolean",
                "default": true,
                transition: false,
                expression: {
                    interpolated: false,
                    parameters: [
                        "zoom"
                    ]
                },
                "property-type": "data-constant"
            }
        },
        paint_line: paint_line,
        paint_circle: paint_circle,
        paint_heatmap: paint_heatmap,
        paint_symbol: paint_symbol,
        paint_raster: paint_raster,
        paint_hillshade: paint_hillshade,
        paint_background: paint_background,
        transition: transition,
        "property-type": {
            "data-driven": {
                type: "property-type"
            },
            "cross-faded": {
                type: "property-type"
            },
            "cross-faded-data-driven": {
                type: "property-type"
            },
            "color-ramp": {
                type: "property-type"
            },
            "data-constant": {
                type: "property-type"
            },
            constant: {
                type: "property-type"
            }
        }
    };

    function mapObject(input, iterator, context) {
        var output = {};
        for (var key in input) {
            output[key] = iterator.call(context || this, input[key], key, input);
        }
        return output;
    }

    function clone(input) {
        if (Array.isArray(input)) {
            return input.map(clone);
        } else if (typeof input === 'object' && input) {
            return ((mapObject(input, clone)));
        } else {
            return input;
        }
    }

    function resolveTokens(properties, text) {
        return text.replace(/{([^{}]+)}/g, function (match, key) {
            return key in properties ? String(properties[key]) : '';
        });
    }

    var PossiblyEvaluated = function PossiblyEvaluated(properties) {
        this._properties = properties;
        this._values = (Object.create(properties.defaultPossiblyEvaluatedValues));
    };

    PossiblyEvaluated.prototype.get = function get(name) {
        return this._values[name];
    };

    var Transitioning = function Transitioning(properties) {
        this._properties = properties;
        this._values = (Object.create(properties.defaultTransitioningPropertyValues));
    };

    Transitioning.prototype.possiblyEvaluate = function possiblyEvaluate(parameters) {
        var result = new PossiblyEvaluated(this._properties); // eslint-disable-line no-use-before-define
        for (var i = 0, list = Object.keys(this._values); i < list.length; i += 1) {
            var property = list[i];

            result._values[property] = this._values[property].possiblyEvaluate(parameters);
        }
        return result;
    };

    Transitioning.prototype.hasTransition = function hasTransition() {
        for (var i = 0, list = Object.keys(this._values); i < list.length; i += 1) {
            var property = list[i];

            if (this._values[property].prior) {
                return true;
            }
        }
        return false;
    };

    var Layout = function Layout(properties) {
        this._properties = properties;
        this._values = (Object.create(properties.defaultPropertyValues));
    };

    Layout.prototype.getValue = function getValue(name) {
        return clone(this._values[name].value);
    };

    Layout.prototype.setValue = function setValue(name, value) {
        this._values[name] = new Property.PropertyValue(this._values[name].property, value === null ? undefined : clone(value));
    };

    Layout.prototype.serialize = function serialize() {
        var result = {};
        for (var i = 0, list = Object.keys(this._values); i < list.length; i += 1) {
            var property = list[i];

            var value = this.getValue(property);
            if (value !== undefined) {
                result[property] = value;
            }
        }
        return result;
    };

    Layout.prototype.possiblyEvaluate = function possiblyEvaluate(parameters) {
        var result = new PossiblyEvaluated(this._properties); // eslint-disable-line no-use-before-define
        for (var i = 0, list = Object.keys(this._values); i < list.length; i += 1) {
            var property = list[i];

            result._values[property] = this._values[property].possiblyEvaluate(parameters);
        }
        return result;
    };

    var Transitionable = function Transitionable(properties) {
        this._properties = properties;
        this._values = (Object.create(properties.defaultTransitionablePropertyValues));
    };

    Transitionable.prototype.getValue = function getValue(name) {
        return clone(this._values[name].value.value);
    };

    Transitionable.prototype.setValue = function setValue(name, value) {
        if (!this._values.hasOwnProperty(name)) {
            this._values[name] = new Property.TransitionablePropertyValue(this._values[name].property);
        }
        this._values[name].value = new Property.PropertyValue(this._values[name].property, value === null ? undefined : clone(value));
    };

    Transitionable.prototype.getTransition = function getTransition(name) {
        return clone(this._values[name].transition);
    };

    Transitionable.prototype.setTransition = function setTransition(name, value) {
        if (!this._values.hasOwnProperty(name)) {
            this._values[name] = new Property.TransitionablePropertyValue(this._values[name].property);
        }
        this._values[name].transition = clone(value) || undefined;
    };

    Transitionable.prototype.serialize = function serialize() {
        var result = {};
        for (var i = 0, list = Object.keys(this._values); i < list.length; i += 1) {
            var property = list[i];

            var value = this.getValue(property);
            if (value !== undefined) {
                result[property] = value;
            }

            var transition = this.getTransition(property);
            if (transition !== undefined) {
                result[(property + "-transition")] = transition;
            }
        }
        return result;
    };

    Transitionable.prototype.transitioned = function transitioned(parameters, prior) {
        var result = new Transitioning(this._properties); // eslint-disable-line no-use-before-define
        for (var i = 0, list = Object.keys(this._values); i < list.length; i += 1) {
            var property = list[i];

            result._values[property] = this._values[property].transitioned(parameters, prior._values[property]);
        }
        return result;
    };

    Transitionable.prototype.untransitioned = function untransitioned() {
        var result = new Transitioning(this._properties); // eslint-disable-line no-use-before-define
        for (var i = 0, list = Object.keys(this._values); i < list.length; i += 1) {
            var property = list[i];

            result._values[property] = this._values[property].untransitioned();
        }
        return result;
    };

    function validateProperty(options, propertyType) {
        var key = options.key;
        var style = options.style;
        var styleSpec = options.styleSpec;
        var value = options.value;
        var propertyKey = options.objectKey;
        var layerSpec = styleSpec[(propertyType + "_" + (options.layerType))];

        if (!layerSpec) {
            return [];
        }

        var transitionMatch = propertyKey.match(/^(.*)-transition$/);
        if (propertyType === 'paint' && transitionMatch && layerSpec[transitionMatch[1]] && layerSpec[transitionMatch[1]].transition) {
            return validate({
                key: key,
                value: value,
                valueSpec: styleSpec.transition,
                style: style,
                styleSpec: styleSpec
            });
        }

        var valueSpec = options.valueSpec || layerSpec[propertyKey];
        if (!valueSpec) {
            return [new ValidationError(key, value, ("unknown property \"" + propertyKey + "\""))];
        }

        var tokenMatch;
        if (getType(value) === 'string' && supportsPropertyExpression(valueSpec) && !valueSpec.tokens && (tokenMatch = /^{([^}]+)}$/.exec(value))) {
            return [new ValidationError(
                key, value,
                "\"" + propertyKey + "\" does not support interpolation syntax\n" +
                "Use an identity property function instead: `{ \"type\": \"identity\", \"property\": " + (JSON.stringify(tokenMatch[1])) + " }`.")];
        }

        var errors = [];

        if (options.layerType === 'symbol') {
            if (propertyKey === 'text-field' && style && !style.glyphs) {
                errors.push(new ValidationError(key, value, 'use of "text-field" requires a style "glyphs" property'));
            }
            if (propertyKey === 'text-font' && isFunction(deepUnbundle(value)) && unbundle(value.type) === 'identity') {
                errors.push(new ValidationError(key, value, '"text-font" does not support identity functions'));
            }
        }

        return errors.concat(validate({
            key: options.key,
            value: value,
            valueSpec: valueSpec,
            style: style,
            styleSpec: styleSpec,
            expressionContext: 'property',
            propertyType: propertyType,
            propertyKey: propertyKey
        }));
    }

    function validatePaintProperty(options) {
        return validateProperty(options, 'paint');
    }

    function validateLayoutProperty(options) {
        return validateProperty(options, 'layout');
    }

    function validateStyleMin(style, styleSpec) {
        styleSpec = styleSpec || spec;

        var errors = [];

        errors = errors.concat(validate({
            key: '',
            value: style,
            valueSpec: styleSpec.$root,
            styleSpec: styleSpec,
            style: style,
            objectElementValidators: {
                glyphs: validateGlyphsURL,
                '*': function _() {
                    return [];
                }
            }
        }));

        if (style.constants) {
            errors = errors.concat(validateConstants({
                key: 'constants',
                value: style.constants,
                style: style,
                styleSpec: styleSpec
            }));
        }

        return sortErrors(errors);
    }

    function sortErrors(errors) {
        return [].concat(errors).sort(function (a, b) {
            return a.line - b.line;
        });
    }

    function translateDistance(translate) {
        return Math.sqrt(translate[0] * translate[0] + translate[1] * translate[1]);
    }

    function wrapCleanErrors(inner) {
        return function () {
            var args = [], len = arguments.length;
            while (len--) args[len] = arguments[len];

            return sortErrors(inner.apply(this, args));
        };
    }

    function filterObject(input, iterator, context) {
        var output = {};
        for (var key in input) {
            if (iterator.call(context || this, input[key], key, input)) {
                output[key] = input[key];
            }
        }
        return output;
    }

    /*validateStyleMin.source = wrapCleanErrors(validateSource);
    validateStyleMin.light = wrapCleanErrors(validateLight);
    validateStyleMin.layer = wrapCleanErrors(validateLayer);
    validateStyleMin.filter = wrapCleanErrors(validateFilter);*/
    validateStyleMin.paintProperty = wrapCleanErrors(validatePaintProperty);
    validateStyleMin.layoutProperty = wrapCleanErrors(validateLayoutProperty);

    var validatePaintProperty$1 = validateStyleMin.paintProperty;
    var validateLayoutProperty$1 = validateStyleMin.layoutProperty;

    /**
     * 图层样式定义基类
     * @type {StyleLayer}
     */
    var e = (function () {
        function StyleLayer(layer, properties) {
            this.id = layer.id;
            this.type = layer.type;
            this._featureFilter = function () {
                return true;
            };

            if (layer.type === 'custom') {
                return;
            }
            // this.metadata = layer.metadata;
            this.minzoom = layer.minzoom;
            this.maxzoom = layer.maxzoom;
            this.source = layer.source;

            if (layer.type !== 'background') {
                this.sourceLayer = layer['source-layer'];
                this.filter = layer.filter;
            }

            if (properties.layout) {
                this._unevaluatedLayout = new Layout(properties.layout);
            }

            if (properties.paint) {
                this._transitionablePaint = new Transitionable(properties.paint);
                for (var property in layer.paint) {
                    this.setPaintProperty(property, layer.paint[property], {validate: false});
                }
                for (var property$1 in layer.layout) {
                    this.setLayoutProperty(property$1, layer.layout[property$1], {validate: false});
                }

                this._transitioningPaint = this._transitionablePaint.untransitioned();
            }
        }

        StyleLayer.prototype.constructor = StyleLayer;

        StyleLayer.prototype.getCrossfadeParameters = function getCrossfadeParameters() {
            return this._crossfadeParameters;
        };

        StyleLayer.prototype.getLayoutProperty = function getLayoutProperty(name) {
            if (name === 'visibility') {
                return this.visibility;
            }

            return this._unevaluatedLayout.getValue(name);
        };

        StyleLayer.prototype.setLayoutProperty = function setLayoutProperty(name, value, options) {

            if (options === void 0) options = {};

            /*if (value !== null && value !== undefined) {
                var key = "layers." + (this.id) + ".layout." + name;
                if (this._validate(validateLayoutProperty$1, key, name, value, options)) {
                    return;
                }
            }*/

            if (name === 'visibility') {
                this.visibility = value;
                return;
            }

            this._unevaluatedLayout.setValue(name, value);
        };

        StyleLayer.prototype.getPaintProperty = function getPaintProperty(name) {
            if (utils.endsWith(name, TRANSITION_SUFFIX)) {
                return this._transitionablePaint.getTransition(name.slice(0, -TRANSITION_SUFFIX.length));
            } else {
                return this._transitionablePaint.getValue(name);
            }
        };

        StyleLayer.prototype.setPaintProperty = function setPaintProperty(name, value, options) {
            if (options === void 0) options = {};

            if (value !== null && value !== undefined) {
                var key = "layers." + (this.id) + ".paint." + name;
                /*if (this._validate(validatePaintProperty$1, key, name, value, options)) {
                    return false;
                }*/
            }

            // if (endsWith(name, TRANSITION_SUFFIX)) {
            if (name.indexOf(TRANSITION_SUFFIX, name.length - TRANSITION_SUFFIX.length) !== -1) {
                this._transitionablePaint.setTransition(name.slice(0, -TRANSITION_SUFFIX.length), (value) || undefined);
                return false;
            } else {
                var transitionable = this._transitionablePaint._values[name];
                var isCrossFadedProperty = transitionable.property.specification["property-type"] === 'cross-faded-data-driven';
                var wasDataDriven = transitionable.value.isDataDriven();

                this._transitionablePaint.setValue(name, value);
                this._handleSpecialPaintPropertyUpdate(name);

                var isDataDriven = this._transitionablePaint._values[name].value.isDataDriven();

                // if a cross-faded value is changed, we need to make sure the new icons get added to each tile's iconAtlas
                // so a call to _updateLayer is necessary, and we return true from this function so it gets called in
                // Style#setPaintProperty
                return isDataDriven || wasDataDriven || isCrossFadedProperty;
            }
        };

        StyleLayer.prototype._handleSpecialPaintPropertyUpdate = function _handleSpecialPaintPropertyUpdate(_) {
            // No-op; can be overridden by derived classes.
        };

        StyleLayer.prototype.isHidden = function isHidden(zoom) {
            if (this.minzoom && zoom < this.minzoom) {
                return true;
            }
            if (this.maxzoom && zoom >= this.maxzoom) {
                return true;
            }
            return this.visibility === 'none';
        };

        StyleLayer.prototype.updateTransitions = function updateTransitions(parameters) {
            this._transitioningPaint = this._transitionablePaint.transitioned(parameters, this._transitioningPaint);
        };

        StyleLayer.prototype.hasTransition = function hasTransition() {
            return this._transitioningPaint.hasTransition();
        };

        StyleLayer.prototype.recalculate = function recalculate(parameters) {
            if (parameters.getCrossfadeParameters) {
                this._crossfadeParameters = parameters.getCrossfadeParameters();
            }

            if (this._unevaluatedLayout) {
                (this).layout = this._unevaluatedLayout.possiblyEvaluate(parameters);
            }

            (this).paint = this._transitioningPaint.possiblyEvaluate(parameters);
        };

        StyleLayer.prototype.serialize = function serialize() {
            var output = {
                'id': this.id,
                'type': this.type,
                'source': this.source,
                'source-layer': this.sourceLayer,
                'metadata': this.metadata,
                'minzoom': this.minzoom,
                'maxzoom': this.maxzoom,
                'filter': this.filter,
                'layout': this._unevaluatedLayout && this._unevaluatedLayout.serialize(),
                'paint': this._transitionablePaint && this._transitionablePaint.serialize()
            };

            if (this.visibility) {
                output.layout = output.layout || {};
                output.layout.visibility = this.visibility;
            }

            return filterObject(output, function (value, key) {
                return value !== undefined &&
                    !(key === 'layout' && !Object.keys(value).length) &&
                    !(key === 'paint' && !Object.keys(value).length);
            });
        };

        StyleLayer.prototype._validate = function _validate(validate, key, name, value, options) {
            if (options === void 0) options = {};

            if (options && options.validate === false) {
                return false;
            }
            return utils.emitValidationErrors(this, validate.call(validateStyle, {
                key: key,
                layerType: this.type,
                objectKey: name,
                value: value,
                styleSpec: spec,
                // Workaround for https://github.com/mapbox/mapbox-gl-js/issues/2407
                style: {glyphs: true, sprite: true}
            }));
        };

        StyleLayer.prototype.is3D = function is3D() {
            return false;
        };

        StyleLayer.prototype.isTileClipped = function isTileClipped() {
            return false;
        };

        StyleLayer.prototype.hasOffscreenPass = function hasOffscreenPass() {
            return false;
        };

        StyleLayer.prototype.resize = function resize() {
            // noop
        };

        StyleLayer.prototype.isStateDependent = function isStateDependent() {
            for (var property in (this).paint._values) {
                var value = (this).paint.get(property);
                if (!(value instanceof Property.PossiblyEvaluatedPropertyValue) || !(value.property.specification['property-type'] === 'data-driven' || value.property.specification['property-type'] === 'cross-faded-data-driven')) {
                    continue;
                }

                if ((value.value.kind === 'source' || value.value.kind === 'composite') &&
                    value.value.isStateDependent) {
                    return true;
                }
            }
            return false;
        };

        return StyleLayer;
    }());

    f.StyleLayer = e;

    var paint$8 = new Property.Properties({
        "background-color": new Property.DataConstantProperty(spec["paint_background"]["background-color"]),
        "background-pattern": new Property.CrossFadedProperty(spec["paint_background"]["background-pattern"]),
        "background-opacity": new Property.DataConstantProperty(spec["paint_background"]["background-opacity"])
    });

    var properties$7 = ({paint: paint$8});

    var BackgroundStyleLayer = (function (StyleLayer) {
        function BackgroundStyleLayer(layer) {
            StyleLayer.call(this, layer, properties$7);
        }

        if (StyleLayer) BackgroundStyleLayer.__proto__ = StyleLayer;
        BackgroundStyleLayer.prototype = Object.create(StyleLayer && StyleLayer.prototype);
        BackgroundStyleLayer.prototype.constructor = BackgroundStyleLayer;
        return BackgroundStyleLayer;
    }(e));
    f.BackgroundStyleLayer = BackgroundStyleLayer;


    var layout$4 = new Property.Properties({
        "line-cap": new Property.DataConstantProperty(spec["layout_line"]["line-cap"]),
        "line-join": new Property.DataDrivenProperty(spec["layout_line"]["line-join"]),
        "line-miter-limit": new Property.DataConstantProperty(spec["layout_line"]["line-miter-limit"]),
        "line-round-limit": new Property.DataConstantProperty(spec["layout_line"]["line-round-limit"])
    });

    var paint$6 = new Property.Properties({
        "line-opacity": new Property.DataDrivenProperty(spec["paint_line"]["line-opacity"]),
        "line-color": new Property.DataDrivenProperty(spec["paint_line"]["line-color"]),
        "line-translate": new Property.DataConstantProperty(spec["paint_line"]["line-translate"]),
        "line-translate-anchor": new Property.DataConstantProperty(spec["paint_line"]["line-translate-anchor"]),
        "line-width": new Property.DataDrivenProperty(spec["paint_line"]["line-width"]),
        "line-gap-width": new Property.DataDrivenProperty(spec["paint_line"]["line-gap-width"]),
        "line-offset": new Property.DataDrivenProperty(spec["paint_line"]["line-offset"]),
        "line-blur": new Property.DataDrivenProperty(spec["paint_line"]["line-blur"]),
        "line-dasharray": new Property.CrossFadedProperty(spec["paint_line"]["line-dasharray"]),
        "line-pattern": new Property.CrossFadedDataDrivenProperty(spec["paint_line"]["line-pattern"]),
        "line-gradient": new Property.ColorRampProperty(spec["paint_line"]["line-gradient"])
    });

    var LineFloorwidthProperty = (function (DataDrivenProperty) {
        function LineFloorwidthProperty() {
            DataDrivenProperty.apply(this, arguments);
        }

        if (DataDrivenProperty) LineFloorwidthProperty.__proto__ = DataDrivenProperty;
        LineFloorwidthProperty.prototype = Object.create(DataDrivenProperty && DataDrivenProperty.prototype);
        LineFloorwidthProperty.prototype.constructor = LineFloorwidthProperty;

        LineFloorwidthProperty.prototype.possiblyEvaluate = function possiblyEvaluate(value, parameters) {
            parameters = new EvaluationParameters(Math.floor(parameters.zoom), {
                now: parameters.now,
                fadeDuration: parameters.fadeDuration,
                zoomHistory: parameters.zoomHistory,
                transition: parameters.transition
            });
            return DataDrivenProperty.prototype.possiblyEvaluate.call(this, value, parameters);
        };

        LineFloorwidthProperty.prototype.evaluate = function evaluate(value, globals, feature, featureState) {
            globals = extend({}, globals, {zoom: Math.floor(globals.zoom)});
            return DataDrivenProperty.prototype.evaluate.call(this, value, globals, feature, featureState);
        };

        return LineFloorwidthProperty;
    }(Property.DataDrivenProperty));

    var lineFloorwidthProperty = new LineFloorwidthProperty(paint$6.properties['line-width'].specification);
    lineFloorwidthProperty.useIntegerZoom = true;

    var LineStyleLayer = (function (StyleLayer) {
        function LineStyleLayer(layer) {
            StyleLayer.call(this, layer, {
                paint: paint$6,
                layout: layout$4
            });
        }

        if (StyleLayer) LineStyleLayer.__proto__ = StyleLayer;
        LineStyleLayer.prototype = Object.create(StyleLayer && StyleLayer.prototype);
        LineStyleLayer.prototype.constructor = LineStyleLayer;

        LineStyleLayer.prototype._handleSpecialPaintPropertyUpdate = function _handleSpecialPaintPropertyUpdate(name) {
            if (name === 'line-gradient') {
                this._updateGradient();
            }
        };

        LineStyleLayer.prototype._updateGradient = function _updateGradient() {
            var expression = this._transitionablePaint._values['line-gradient'].value.expression;
            this.gradient = image.renderColorRamp(expression, 'lineProgress');
            this.gradientTexture = null;
        };

        LineStyleLayer.prototype.recalculate = function recalculate(parameters) {
            StyleLayer.prototype.recalculate.call(this, parameters);

            (this.paint._values)['line-floorwidth'] =
                lineFloorwidthProperty.possiblyEvaluate(this._transitioningPaint._values['line-width'].value, parameters);
        };

        LineStyleLayer.prototype.createBucket = function createBucket(parameters) {
            return new LineBucket(parameters);
        };

        LineStyleLayer.prototype.queryRadius = function queryRadius(bucket) {
            var lineBucket = (bucket);
            var width = getLineWidth(
                getMaximumPaintValue('line-width', this, lineBucket),
                getMaximumPaintValue('line-gap-width', this, lineBucket));
            var offset = getMaximumPaintValue('line-offset', this, lineBucket);
            return width / 2 + Math.abs(offset) + translateDistance(this.paint.get('line-translate'));
        };

        LineStyleLayer.prototype.queryIntersectsFeature = function queryIntersectsFeature(queryGeometry,
                                                                                          feature,
                                                                                          featureState,
                                                                                          geometry,
                                                                                          zoom,
                                                                                          transform,
                                                                                          pixelsToTileUnits) {
            var translatedPolygon = translate(queryGeometry,
                this.paint.get('line-translate'),
                this.paint.get('line-translate-anchor'),
                transform.angle, pixelsToTileUnits);
            var halfWidth = pixelsToTileUnits / 2 * getLineWidth(
                this.paint.get('line-width').evaluate(feature, featureState),
                this.paint.get('line-gap-width').evaluate(feature, featureState));
            var lineOffset = this.paint.get('line-offset').evaluate(feature, featureState);
            if (lineOffset) {
                geometry = offsetLine(geometry, lineOffset * pixelsToTileUnits);
            }

            return polygonIntersectsBufferedMultiLine(translatedPolygon, geometry, halfWidth);
        };

        LineStyleLayer.prototype.isTileClipped = function isTileClipped() {
            return true;
        };

        return LineStyleLayer;
    }(e));
    f.LineStyleLayer = LineStyleLayer;


    /**
     * Fill图层的样式定义类
     * @type {FillStyleLayer}
     */
    var paint$4 = new Property.Properties({
        "fill-antialias": new Property.DataConstantProperty(spec["paint_fill"]["fill-antialias"]),
        "fill-opacity": new Property.DataDrivenProperty(spec["paint_fill"]["fill-opacity"]),
        "fill-color": new Property.DataDrivenProperty(spec["paint_fill"]["fill-color"]),
        "fill-outline-color": new Property.DataDrivenProperty(spec["paint_fill"]["fill-outline-color"]),
        "fill-translate": new Property.DataConstantProperty(spec["paint_fill"]["fill-translate"]),
        "fill-translate-anchor": new Property.DataConstantProperty(spec["paint_fill"]["fill-translate-anchor"]),
        "fill-pattern": new Property.CrossFadedDataDrivenProperty(spec["paint_fill"]["fill-pattern"])
    });

// Note: without adding the explicit type annotation, Flow infers weaker types
// for these objects from their use in the constructor to StyleLayer, as
// {layout?: Properties<...>, paint: Properties<...>}
    var properties$3 = ({paint: paint$4});

    var FillStyleLayer = (function (StyleLayer) {
        function FillStyleLayer(layer) {
            StyleLayer.call(this, layer, properties$3);
        }

        if (StyleLayer) FillStyleLayer.__proto__ = StyleLayer;
        FillStyleLayer.prototype = Object.create(StyleLayer && StyleLayer.prototype);
        FillStyleLayer.prototype.constructor = FillStyleLayer;

        FillStyleLayer.prototype.recalculate = function recalculate(parameters) {
            StyleLayer.prototype.recalculate.call(this, parameters);

            var outlineColor = this.paint._values['fill-outline-color'];
            /*if (outlineColor.value.kind === 'constant' && outlineColor.value.value === undefined) {
                this.paint._values['fill-outline-color'] = this.paint._values['fill-color'];
            }*/
            this.paint._values['fill-outline-color'] = this.paint._values['fill-color'];
        };

        FillStyleLayer.prototype.createBucket = function createBucket(parameters) {
            return new FillBucket(parameters);
        };

        FillStyleLayer.prototype.queryRadius = function queryRadius() {
            return translateDistance([0, 0]);
        };

        FillStyleLayer.prototype.queryIntersectsFeature = function queryIntersectsFeature(queryGeometry,
                                                                                          feature,
                                                                                          featureState,
                                                                                          geometry,
                                                                                          zoom,
                                                                                          transform,
                                                                                          pixelsToTileUnits) {
            var translatedPolygon = translate(queryGeometry,
                this.paint.get('fill-translate'),
                this.paint.get('fill-translate-anchor'),
                transform.angle, pixelsToTileUnits);
            return polygonIntersectsMultiPolygon(translatedPolygon, geometry);
        };

        FillStyleLayer.prototype.isTileClipped = function isTileClipped() {
            return true;
        };

        return FillStyleLayer;
    }(e));

    f.FillStyleLayer = FillStyleLayer;

    var layout$5 = new Property.Properties({
        "symbol-placement": new Property.DataConstantProperty(spec["layout_symbol"]["symbol-placement"]),
        "symbol-spacing": new Property.DataConstantProperty(spec["layout_symbol"]["symbol-spacing"]),
        "symbol-avoid-edges": new Property.DataConstantProperty(spec["layout_symbol"]["symbol-avoid-edges"]),
        "symbol-sort-key": new Property.DataDrivenProperty(spec["layout_symbol"]["symbol-sort-key"]),
        "symbol-z-order": new Property.DataConstantProperty(spec["layout_symbol"]["symbol-z-order"]),
        "icon-allow-overlap": new Property.DataConstantProperty(spec["layout_symbol"]["icon-allow-overlap"]),
        "icon-ignore-placement": new Property.DataConstantProperty(spec["layout_symbol"]["icon-ignore-placement"]),
        "icon-optional": new Property.DataConstantProperty(spec["layout_symbol"]["icon-optional"]),
        "icon-rotation-alignment": new Property.DataConstantProperty(spec["layout_symbol"]["icon-rotation-alignment"]),
        "icon-size": new Property.DataDrivenProperty(spec["layout_symbol"]["icon-size"]),
        "icon-text-fit": new Property.DataConstantProperty(spec["layout_symbol"]["icon-text-fit"]),
        "icon-text-fit-padding": new Property.DataConstantProperty(spec["layout_symbol"]["icon-text-fit-padding"]),
        "icon-image": new Property.DataDrivenProperty(spec["layout_symbol"]["icon-image"]),
        "icon-rotate": new Property.DataDrivenProperty(spec["layout_symbol"]["icon-rotate"]),
        "icon-padding": new Property.DataConstantProperty(spec["layout_symbol"]["icon-padding"]),
        "icon-keep-upright": new Property.DataConstantProperty(spec["layout_symbol"]["icon-keep-upright"]),
        "icon-offset": new Property.DataDrivenProperty(spec["layout_symbol"]["icon-offset"]),
        "icon-anchor": new Property.DataDrivenProperty(spec["layout_symbol"]["icon-anchor"]),
        "icon-pitch-alignment": new Property.DataConstantProperty(spec["layout_symbol"]["icon-pitch-alignment"]),
        "text-pitch-alignment": new Property.DataConstantProperty(spec["layout_symbol"]["text-pitch-alignment"]),
        "text-rotation-alignment": new Property.DataConstantProperty(spec["layout_symbol"]["text-rotation-alignment"]),
        "text-field": new Property.DataDrivenProperty(spec["layout_symbol"]["text-field"]),
        "text-font": new Property.DataDrivenProperty(spec["layout_symbol"]["text-font"]),
        "text-size": new Property.DataDrivenProperty(spec["layout_symbol"]["text-size"]),
        "text-max-width": new Property.DataDrivenProperty(spec["layout_symbol"]["text-max-width"]),
        "text-line-height": new Property.DataConstantProperty(spec["layout_symbol"]["text-line-height"]),
        "text-letter-spacing": new Property.DataDrivenProperty(spec["layout_symbol"]["text-letter-spacing"]),
        "text-justify": new Property.DataDrivenProperty(spec["layout_symbol"]["text-justify"]),
        "text-radial-offset": new Property.DataDrivenProperty(spec["layout_symbol"]["text-radial-offset"]),
        "text-variable-anchor": new Property.DataConstantProperty(spec["layout_symbol"]["text-variable-anchor"]),
        "text-anchor": new Property.DataDrivenProperty(spec["layout_symbol"]["text-anchor"]),
        "text-max-angle": new Property.DataConstantProperty(spec["layout_symbol"]["text-max-angle"]),
        "text-rotate": new Property.DataDrivenProperty(spec["layout_symbol"]["text-rotate"]),
        "text-padding": new Property.DataConstantProperty(spec["layout_symbol"]["text-padding"]),
        "text-keep-upright": new Property.DataConstantProperty(spec["layout_symbol"]["text-keep-upright"]),
        "text-transform": new Property.DataDrivenProperty(spec["layout_symbol"]["text-transform"]),
        "text-offset": new Property.DataDrivenProperty(spec["layout_symbol"]["text-offset"]),
        "text-allow-overlap": new Property.DataConstantProperty(spec["layout_symbol"]["text-allow-overlap"]),
        "text-ignore-placement": new Property.DataConstantProperty(spec["layout_symbol"]["text-ignore-placement"]),
        "text-optional": new Property.DataConstantProperty(spec["layout_symbol"]["text-optional"])
    });


    var paint$7 = new Property.Properties({
        "icon-opacity": new Property.DataDrivenProperty(spec["paint_symbol"]["icon-opacity"]),
        "icon-color": new Property.DataDrivenProperty(spec["paint_symbol"]["icon-color"]),
        "icon-halo-color": new Property.DataDrivenProperty(spec["paint_symbol"]["icon-halo-color"]),
        "icon-halo-width": new Property.DataDrivenProperty(spec["paint_symbol"]["icon-halo-width"]),
        "icon-halo-blur": new Property.DataDrivenProperty(spec["paint_symbol"]["icon-halo-blur"]),
        "icon-translate": new Property.DataConstantProperty(spec["paint_symbol"]["icon-translate"]),
        "icon-translate-anchor": new Property.DataConstantProperty(spec["paint_symbol"]["icon-translate-anchor"]),
        "text-opacity": new Property.DataDrivenProperty(spec["paint_symbol"]["text-opacity"]),
        "text-color": new Property.DataDrivenProperty(spec["paint_symbol"]["text-color"]),
        "text-halo-color": new Property.DataDrivenProperty(spec["paint_symbol"]["text-halo-color"]),
        "text-halo-width": new Property.DataDrivenProperty(spec["paint_symbol"]["text-halo-width"]),
        "text-halo-blur": new Property.DataDrivenProperty(spec["paint_symbol"]["text-halo-blur"]),
        "text-translate": new Property.DataConstantProperty(spec["paint_symbol"]["text-translate"]),
        "text-translate-anchor": new Property.DataConstantProperty(spec["paint_symbol"]["text-translate-anchor"])
    });

    var SymbolStyleLayer = (function (StyleLayer) {
        function SymbolStyleLayer(layer) {
            StyleLayer.call(this, layer, {paint: paint$7, layout: layout$5});
        }

        if (StyleLayer) SymbolStyleLayer.__proto__ = StyleLayer;
        SymbolStyleLayer.prototype = Object.create(StyleLayer && StyleLayer.prototype);
        SymbolStyleLayer.prototype.constructor = SymbolStyleLayer;

        SymbolStyleLayer.prototype.recalculate = function recalculate(parameters) {
            StyleLayer.prototype.recalculate.call(this, parameters);

            if (this.layout.get('icon-rotation-alignment') === 'auto') {
                if (this.layout.get('symbol-placement') !== 'point') {
                    this.layout._values['icon-rotation-alignment'] = 'map';
                } else {
                    this.layout._values['icon-rotation-alignment'] = 'viewport';
                }
            }

            if (this.layout.get('text-rotation-alignment') === 'auto') {
                if (this.layout.get('symbol-placement') !== 'point') {
                    this.layout._values['text-rotation-alignment'] = 'map';
                } else {
                    this.layout._values['text-rotation-alignment'] = 'viewport';
                }
            }

            // If unspecified, `*-pitch-alignment` inherits `*-rotation-alignment`
            if (this.layout.get('text-pitch-alignment') === 'auto') {
                this.layout._values['text-pitch-alignment'] = this.layout.get('text-rotation-alignment');
            }
            if (this.layout.get('icon-pitch-alignment') === 'auto') {
                this.layout._values['icon-pitch-alignment'] = this.layout.get('icon-rotation-alignment');
            }
        };

        SymbolStyleLayer.prototype.getValueAndResolveTokens = function getValueAndResolveTokens(name, feature) {
            var value = this.layout.get(name).evaluate(feature, {});
            var unevaluated = this._unevaluatedLayout._values[name];
            if (!unevaluated.isDataDriven() && !expressions.isExpression(unevaluated.value)) {
                return resolveTokens(feature.properties, value);
            }

            return value;
        };

        SymbolStyleLayer.prototype.createBucket = function createBucket(parameters) {
            return new SymbolBucket(parameters);
        };

        SymbolStyleLayer.prototype.queryRadius = function queryRadius() {
            return 0;
        };

        SymbolStyleLayer.prototype.queryIntersectsFeature = function queryIntersectsFeature() {
            return false;
        };

        return SymbolStyleLayer;
    }(e));

    f.SymbolStyleLayer = SymbolStyleLayer;

    var paint$5 = new Property.Properties({
        "fill-extrusion-opacity": new Property.DataConstantProperty(spec["paint_fill-extrusion"]["fill-extrusion-opacity"]),
        "fill-extrusion-color": new Property.DataDrivenProperty(spec["paint_fill-extrusion"]["fill-extrusion-color"]),
        "fill-extrusion-translate": new Property.DataConstantProperty(spec["paint_fill-extrusion"]["fill-extrusion-translate"]),
        "fill-extrusion-translate-anchor": new Property.DataConstantProperty(spec["paint_fill-extrusion"]["fill-extrusion-translate-anchor"]),
        "fill-extrusion-pattern": new Property.CrossFadedDataDrivenProperty(spec["paint_fill-extrusion"]["fill-extrusion-pattern"]),
        "fill-extrusion-height": new Property.DataDrivenProperty(spec["paint_fill-extrusion"]["fill-extrusion-height"]),
        "fill-extrusion-base": new Property.DataDrivenProperty(spec["paint_fill-extrusion"]["fill-extrusion-base"]),
        "fill-extrusion-vertical-gradient": new Property.DataConstantProperty(spec["paint_fill-extrusion"]["fill-extrusion-vertical-gradient"])
    });
    var properties$4 = ({paint: paint$5});

    var FillExtrusionStyleLayer = (function (StyleLayer) {
        function FillExtrusionStyleLayer(layer) {
            StyleLayer.call(this, layer, properties$4);
        }

        if (StyleLayer) FillExtrusionStyleLayer.__proto__ = StyleLayer;
        FillExtrusionStyleLayer.prototype = Object.create(StyleLayer && StyleLayer.prototype);
        FillExtrusionStyleLayer.prototype.constructor = FillExtrusionStyleLayer;

        FillExtrusionStyleLayer.prototype.createBucket = function createBucket(parameters) {
            return new FillExtrusionBucket(parameters);
        };

        FillExtrusionStyleLayer.prototype.queryRadius = function queryRadius() {
            return translateDistance(this.paint.get('fill-extrusion-translate'));
        };

        FillExtrusionStyleLayer.prototype.is3D = function is3D() {
            return true;
        };

        FillExtrusionStyleLayer.prototype.queryIntersectsFeature = function queryIntersectsFeature(queryGeometry, feature, featureState, geometry,
                                                                                                   zoom, transform, pixelsToTileUnits, pixelPosMatrix) {

            var translatedPolygon = translate(queryGeometry,
                this.paint.get('fill-extrusion-translate'),
                this.paint.get('fill-extrusion-translate-anchor'),
                transform.angle, pixelsToTileUnits);

            var height = this.paint.get('fill-extrusion-height').evaluate(feature, featureState);
            var base = this.paint.get('fill-extrusion-base').evaluate(feature, featureState);

            var projectedQueryGeometry = projectQueryGeometry$1(translatedPolygon, pixelPosMatrix, transform, 0);

            var projected = projectExtrusion(geometry, base, height, pixelPosMatrix);
            var projectedBase = projected[0];
            var projectedTop = projected[1];
            return checkIntersection(projectedBase, projectedTop, projectedQueryGeometry);
        };

        return FillExtrusionStyleLayer;
    }(e));
    f.FillExtrusionStyleLayer = FillExtrusionStyleLayer;

    var paint$2 = new Property.Properties({
        "heatmap-radius": new Property.DataDrivenProperty(spec["paint_heatmap"]["heatmap-radius"]),
        "heatmap-weight": new Property.DataDrivenProperty(spec["paint_heatmap"]["heatmap-weight"]),
        "heatmap-intensity": new Property.DataConstantProperty(spec["paint_heatmap"]["heatmap-intensity"]),
        "heatmap-color": new Property.ColorRampProperty(spec["paint_heatmap"]["heatmap-color"]),
        "heatmap-opacity": new Property.DataConstantProperty(spec["paint_heatmap"]["heatmap-opacity"])
    });

    var properties$1 = ({paint: paint$2});

    var HeatmapStyleLayer = (function (StyleLayer) {
        function HeatmapStyleLayer(layer) {
            StyleLayer.call(this, layer, properties$1);
            this._updateColorRamp();
        }

        if (StyleLayer) HeatmapStyleLayer.__proto__ = StyleLayer;
        HeatmapStyleLayer.prototype = Object.create(StyleLayer && StyleLayer.prototype);
        HeatmapStyleLayer.prototype.constructor = HeatmapStyleLayer;

        HeatmapStyleLayer.prototype.createBucket = function createBucket(options) {
            return new HeatmapBucket(options);
        };

        HeatmapStyleLayer.prototype._handleSpecialPaintPropertyUpdate = function _handleSpecialPaintPropertyUpdate(name) {
            if (name === 'heatmap-color') {
                this._updateColorRamp();
            }
        };

        HeatmapStyleLayer.prototype._updateColorRamp = function _updateColorRamp() {
            var expression = this._transitionablePaint._values['heatmap-color'].value.expression;
            this.colorRamp = image.renderColorRamp(expression, 'heatmapDensity');
            this.colorRampTexture = null;
        };

        HeatmapStyleLayer.prototype.resize = function resize() {
            if (this.heatmapFbo) {
                this.heatmapFbo.destroy();
                this.heatmapFbo = null;
            }
        };

        HeatmapStyleLayer.prototype.queryRadius = function queryRadius() {
            return 0;
        };

        HeatmapStyleLayer.prototype.queryIntersectsFeature = function queryIntersectsFeature() {
            return false;
        };

        HeatmapStyleLayer.prototype.hasOffscreenPass = function hasOffscreenPass() {
            return this.paint.get('heatmap-opacity') !== 0 && this.visibility !== 'none';
        };

        return HeatmapStyleLayer;
    }(e));
    f.HeatmapStyleLayer = HeatmapStyleLayer;

    var paint$1 = new Property.Properties({
        "circle-radius": new Property.DataDrivenProperty(spec["paint_circle"]["circle-radius"]),
        "circle-color": new Property.DataDrivenProperty(spec["paint_circle"]["circle-color"]),
        "circle-blur": new Property.DataDrivenProperty(spec["paint_circle"]["circle-blur"]),
        "circle-opacity": new Property.DataDrivenProperty(spec["paint_circle"]["circle-opacity"]),
        "circle-translate": new Property.DataConstantProperty(spec["paint_circle"]["circle-translate"]),
        "circle-translate-anchor": new Property.DataConstantProperty(spec["paint_circle"]["circle-translate-anchor"]),
        "circle-pitch-scale": new Property.DataConstantProperty(spec["paint_circle"]["circle-pitch-scale"]),
        "circle-pitch-alignment": new Property.DataConstantProperty(spec["paint_circle"]["circle-pitch-alignment"]),
        "circle-stroke-width": new Property.DataDrivenProperty(spec["paint_circle"]["circle-stroke-width"]),
        "circle-stroke-color": new Property.DataDrivenProperty(spec["paint_circle"]["circle-stroke-color"]),
        "circle-stroke-opacity": new Property.DataDrivenProperty(spec["paint_circle"]["circle-stroke-opacity"])
    });

    var properties = ({paint: paint$1});

    var CircleStyleLayer = (function (StyleLayer) {
        function CircleStyleLayer(layer) {
            StyleLayer.call(this, layer, properties);
        }

        if (StyleLayer) CircleStyleLayer.__proto__ = StyleLayer;
        CircleStyleLayer.prototype = Object.create(StyleLayer && StyleLayer.prototype);
        CircleStyleLayer.prototype.constructor = CircleStyleLayer;

        CircleStyleLayer.prototype.createBucket = function createBucket(parameters) {
            return new CircleBucket(parameters);
        };

        CircleStyleLayer.prototype.queryRadius = function queryRadius(bucket) {
            var circleBucket = (bucket);
            return getMaximumPaintValue('circle-radius', this, circleBucket) +
                getMaximumPaintValue('circle-stroke-width', this, circleBucket) +
                translateDistance(this.paint.get('circle-translate'));
        };

        CircleStyleLayer.prototype.queryIntersectsFeature = function queryIntersectsFeature(queryGeometry,
                                                                                            feature,
                                                                                            featureState,
                                                                                            geometry,
                                                                                            zoom,
                                                                                            transform,
                                                                                            pixelsToTileUnits,
                                                                                            pixelPosMatrix) {
            var translatedPolygon = translate(queryGeometry,
                this.paint.get('circle-translate'),
                this.paint.get('circle-translate-anchor'),
                transform.angle, pixelsToTileUnits);
            var radius = this.paint.get('circle-radius').evaluate(feature, featureState);
            var stroke = this.paint.get('circle-stroke-width').evaluate(feature, featureState);
            var size = radius + stroke;

            var alignWithMap = this.paint.get('circle-pitch-alignment') === 'map';
            var transformedPolygon = alignWithMap ? translatedPolygon : utils.projectQueryGeometry(translatedPolygon, pixelPosMatrix);
            var transformedSize = alignWithMap ? size * pixelsToTileUnits : size;

            for (var i$1 = 0, list$1 = geometry; i$1 < list$1.length; i$1 += 1) {
                var ring = list$1[i$1];
                for (var i = 0, list = ring; i < list.length; i += 1) {
                    var point = list[i];
                    var transformedPoint = alignWithMap ? point : utils.projectPoint(point, pixelPosMatrix);
                    var adjustedSize = transformedSize;
                    var projectedCenter = glMatrix.vec4.transformMat4([], [point.x, point.y, 0, 1], pixelPosMatrix);
                    if (this.paint.get('circle-pitch-scale') === 'viewport' && this.paint.get('circle-pitch-alignment') === 'map') {
                        adjustedSize *= projectedCenter[3] / transform.cameraToCenterDistance;
                    } else if (this.paint.get('circle-pitch-scale') === 'map' && this.paint.get('circle-pitch-alignment') === 'viewport') {
                        adjustedSize *= transform.cameraToCenterDistance / projectedCenter[3];
                    }

                    if (utils.polygonIntersectsBufferedPoint(transformedPolygon, transformedPoint, adjustedSize)) {
                        return true;
                    }
                }
            }

            return false;
        };

        return CircleStyleLayer;
    }(e));
    f.CircleStyleLayer = CircleStyleLayer;

    f.createStyleLayer = function (layer) {
        switch (layer.type) {
            case "fill":
                return new FillStyleLayer(layer);
            case "line":
                return new LineStyleLayer(layer);
            case "symbol":
                return new SymbolStyleLayer(layer);
            case "background":
                return new BackgroundStyleLayer(layer);
            case "fill-extrusion":
                return new FillExtrusionStyleLayer(layer);
            case "heatmap":
                return new HeatmapStyleLayer(layer);
            case "circle":
                return new CircleStyleLayer(layer);
        }
    };
});