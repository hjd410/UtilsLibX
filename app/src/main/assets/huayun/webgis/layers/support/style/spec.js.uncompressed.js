define("com/huayun/webgis/layers/support/style/spec", [], function () {
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
            },
            "fill-extrusion-terrain": {
                type: "boolean",
                "default": false,
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

    return spec;
});