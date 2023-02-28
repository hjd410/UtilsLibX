define("com/huayun/webgis/layers/support/PauseablePlacement", [
    "com/huayun/webgis/gl/MapGridIndex",
    "com/huayun/webgis/geometry/Point2D",
    "./funcUtils",
    "../../utils/Constant",
    "../../utils/utils",
    "../../utils/intersectUtils"
], function (MapGridIndex, Point, funcUtils, Constant, utils, intersectUtils) {

    var OpacityState = function OpacityState(prevState, increment, placed, skipFade) {
        if (prevState) {
            this.opacity = Math.max(0, Math.min(1, prevState.opacity + (prevState.placed ? increment : -increment)));
        } else {
            this.opacity = (skipFade && placed) ? 1 : 0;
        }
        this.placed = placed;
    };
    OpacityState.prototype.isHidden = function isHidden() {
        return this.opacity === 0 && !this.placed;
    };

    var JointOpacityState = function JointOpacityState(prevState, increment, placedText, placedIcon, skipFade) {
        this.text = new OpacityState(prevState ? prevState.text : null, increment, placedText, skipFade);
        this.icon = new OpacityState(prevState ? prevState.icon : null, increment, placedIcon, skipFade);
    };
    JointOpacityState.prototype.isHidden = function isHidden() {
        return this.text.isHidden() && this.icon.isHidden();
    };

    var JointPlacement = function JointPlacement(text       , icon       , skipFade       ) {
        this.text = text;
        this.icon = icon;
        this.skipFade = skipFade;
    };

    var viewportPadding = 100;
    var shift25 = Math.pow(2, 25);
    var shift24 = Math.pow(2, 24);
    var shift17 = Math.pow(2, 17);
    var shift16 = Math.pow(2, 16);
    var shift9 = Math.pow(2, 9);
    var shift8 = Math.pow(2, 8);
    var shift1 = Math.pow(2, 1);

    function packOpacity(opacityState) {
        if (opacityState.opacity === 0 && !opacityState.placed) {
            return 0;
        } else if (opacityState.opacity === 1 && opacityState.placed) {
            return 4294967295;
        }
        var targetBit = opacityState.placed ? 1 : 0;
        var opacityBits = Math.floor(opacityState.opacity * 127);
        return opacityBits * shift25 + targetBit * shift24 +
            opacityBits * shift17 + targetBit * shift16 +
            opacityBits * shift9 + targetBit * shift8 +
            opacityBits * shift1 + targetBit;
    }

    function projectTruncatedLineSegment(previousTilePoint, currentTilePoint, previousProjectedPoint, minimumLength, projectionMatrix) {
        // We are assuming "previousTilePoint" won't project to a point within one unit of the camera plane
        // If it did, that would mean our label extended all the way out from within the viewport to a (very distant)
        // point near the plane of the camera. We wouldn't be able to render the label anyway once it crossed the
        // plane of the camera.
        var projectedUnitVertex = project(previousTilePoint.add(previousTilePoint.sub(currentTilePoint)._unit()), projectionMatrix).point;
        var projectedUnitSegment = previousProjectedPoint.sub(projectedUnitVertex);

        return previousProjectedPoint.add(projectedUnitSegment._mult(minimumLength / projectedUnitSegment.mag()));
    }

    function project(point, matrix) {
        var pos = [point.x, point.y, 0, 1];
        funcUtils.xyTransformMat4(pos, pos, matrix);
        var w = pos[3];
        return {
            point: new Point(pos[0] / w, pos[1] / w),
            signedDistanceFromCamera: w
        };
    }

    function markCollisionCircleUsed(collisionCircles, index, used) {
        collisionCircles[index + 4] = used ? 1 : 0;
    }

    function placeGlyphAlongLine(offsetX,
                                 lineOffsetX,
                                 lineOffsetY,
                                 flip,
                                 anchorPoint,
                                 tileAnchorPoint,
                                 anchorSegment,
                                 lineStartIndex,
                                 lineEndIndex,
                                 lineVertexArray,
                                 labelPlaneMatrix,
                                 projectionCache,
                                 returnTileDistance) {

        
        var combinedOffsetX = flip ?
            offsetX - lineOffsetX :
            offsetX + lineOffsetX;

        var dir = combinedOffsetX > 0 ? 1 : -1;

        var angle = 0;
        if (flip) {
            // The label needs to be flipped to keep text upright.
            // Iterate in the reverse direction.
            dir *= -1;
            angle = Math.PI;
        }

        if (dir < 0) {
            angle += Math.PI;
        }

        var currentIndex = dir > 0 ?
            lineStartIndex + anchorSegment :
            lineStartIndex + anchorSegment + 1;

        var initialIndex = currentIndex;
        var current = anchorPoint;
        var prev = anchorPoint;
        var distanceToPrev = 0;
        var currentSegmentDistance = 0;
        var absOffsetX = Math.abs(combinedOffsetX);

        while (distanceToPrev + currentSegmentDistance <= absOffsetX) {
            currentIndex += dir;

            // offset does not fit on the projected line
            if (currentIndex < lineStartIndex || currentIndex >= lineEndIndex) {
                return null;
            }

            prev = current;

            current = projectionCache[currentIndex];
            if (current === undefined) {
                var currentVertex = new Point(lineVertexArray.getx(currentIndex), lineVertexArray.gety(currentIndex));
                var projection = project(currentVertex, labelPlaneMatrix);
                if (projection.signedDistanceFromCamera > 0) {
                    current = projectionCache[currentIndex] = projection.point;
                } else {
                    // The vertex is behind the plane of the camera, so we can't project it
                    // Instead, we'll create a vertex along the line that's far enough to include the glyph
                    var previousLineVertexIndex = currentIndex - dir;
                    var previousTilePoint = distanceToPrev === 0 ?
                        tileAnchorPoint :
                        new Point(lineVertexArray.getx(previousLineVertexIndex), lineVertexArray.gety(previousLineVertexIndex));
                    // Don't cache because the new vertex might not be far enough out for future glyphs on the same segment
                    current = projectTruncatedLineSegment(previousTilePoint, currentVertex, prev, absOffsetX - distanceToPrev + 1, labelPlaneMatrix);
                }
            }

            distanceToPrev += currentSegmentDistance;
            currentSegmentDistance = prev.dist(current);
        }

        // The point is on the current segment. Interpolate to find it.
        var segmentInterpolationT = (absOffsetX - distanceToPrev) / currentSegmentDistance;
        var prevToCurrent = current.sub(prev);
        var p = prevToCurrent.mult(segmentInterpolationT)._add(prev);

        // offset the point from the line to text-offset and icon-offset
        p._add(prevToCurrent._unit()._perp()._mult(lineOffsetY * dir));

        var segmentAngle = angle + Math.atan2(current.y - prev.y, current.x - prev.x);

        return {
            point: p,
            angle: segmentAngle,
            tileDistance: returnTileDistance ?
                {
                    prevTileDistance: (currentIndex - dir) === initialIndex ? 0 : lineVertexArray.gettileUnitDistanceFromAnchor(currentIndex - dir),
                    lastSegmentViewportDistance: absOffsetX - distanceToPrev
                } : null
        };
    }

    function placeFirstAndLastGlyph(fontScale, glyphOffsetArray, lineOffsetX, lineOffsetY, flip, anchorPoint, tileAnchorPoint, symbol, lineVertexArray, labelPlaneMatrix, projectionCache, returnTileDistance) {
        var glyphEndIndex = symbol.glyphStartIndex + symbol.numGlyphs;
        var lineStartIndex = symbol.lineStartIndex;
        var lineEndIndex = symbol.lineStartIndex + symbol.lineLength;

        var firstGlyphOffset = glyphOffsetArray.getoffsetX(symbol.glyphStartIndex);
        var lastGlyphOffset = glyphOffsetArray.getoffsetX(glyphEndIndex - 1);

        var firstPlacedGlyph = placeGlyphAlongLine(fontScale * firstGlyphOffset, lineOffsetX, lineOffsetY, flip, anchorPoint, tileAnchorPoint, symbol.segment,
            lineStartIndex, lineEndIndex, lineVertexArray, labelPlaneMatrix, projectionCache, returnTileDistance);
        if (!firstPlacedGlyph) {
            return null;
        }

        var lastPlacedGlyph = placeGlyphAlongLine(fontScale * lastGlyphOffset, lineOffsetX, lineOffsetY, flip, anchorPoint, tileAnchorPoint, symbol.segment,
            lineStartIndex, lineEndIndex, lineVertexArray, labelPlaneMatrix, projectionCache, returnTileDistance);
        if (!lastPlacedGlyph) {
            return null;
        }

        return {first: firstPlacedGlyph, last: lastPlacedGlyph};
    }

    var RetainedQueryData = function RetainedQueryData(bucketInstanceId,
                                                       featureIndex,
                                                       sourceLayerIndex,
                                                       bucketIndex,
                                                       tileID) {
        this.bucketInstanceId = bucketInstanceId;
        this.featureIndex = featureIndex;
        this.sourceLayerIndex = sourceLayerIndex;
        this.bucketIndex = bucketIndex;
        this.tileID = tileID;
    };

    /**
     * A collision index used to prevent symbols from overlapping. It keep tracks of
     * where previous symbols have been placed and is used to check if a new
     * symbol overlaps with any previously added symbols.
     *
     * There are two steps to insertion: first placeCollisionBox/Circles checks if
     * there's room for a symbol, then insertCollisionBox/Circles actually puts the
     * symbol in the index. The two step process allows paired symbols to be inserted
     * together even if they overlap.
     *
     * @private
     */
    var CollisionIndex = function CollisionIndex(transform, grid, ignoredGrid
    ) {
        if (grid === void 0) grid = new MapGridIndex(transform.width + 2 * viewportPadding, transform.height + 2 * viewportPadding, 25);
        if (ignoredGrid === void 0) ignoredGrid = new MapGridIndex(transform.width + 2 * viewportPadding, transform.height + 2 * viewportPadding, 25);

        this.transform = transform;

        this.grid = grid;
        this.ignoredGrid = ignoredGrid;
        this.pitchfactor = Math.cos(transform._pitch) * transform.cameraToCenterDistance;

        this.screenRightBoundary = transform.width + viewportPadding;
        this.screenBottomBoundary = transform.height + viewportPadding;
        this.gridRightBoundary = transform.width + 2 * viewportPadding;
        this.gridBottomBoundary = transform.height + 2 * viewportPadding;
    };

    CollisionIndex.prototype.placeCollisionBox = function placeCollisionBox(collisionBox, allowOverlap, textPixelRatio, posMatrix, collisionGroupPredicate) {
        var projectedPoint = this.projectAndGetPerspectiveRatio(posMatrix, collisionBox.anchorPointX, collisionBox.anchorPointY);
        var tileToViewport = textPixelRatio * projectedPoint.perspectiveRatio;
        var tlX = collisionBox.x1 * tileToViewport + projectedPoint.point.x;
        var tlY = collisionBox.y1 * tileToViewport + projectedPoint.point.y;
        var brX = collisionBox.x2 * tileToViewport + projectedPoint.point.x;
        var brY = collisionBox.y2 * tileToViewport + projectedPoint.point.y;

        if (!this.isInsideGrid(tlX, tlY, brX, brY) ||
            (!allowOverlap && this.grid.hitTest(tlX, tlY, brX, brY, collisionGroupPredicate))) {
            return {
                box: [],
                offscreen: false
            };
        }

        return {
            box: [tlX, tlY, brX, brY],
            offscreen: this.isOffscreen(tlX, tlY, brX, brY)
        };
    };

    CollisionIndex.prototype.approximateTileDistance = function approximateTileDistance(tileDistance, lastSegmentAngle, pixelsToTileUnits, cameraToAnchorDistance, pitchWithMap) {
        var incidenceStretch = pitchWithMap ? 1 : cameraToAnchorDistance / this.pitchfactor;
        var lastSegmentTile = tileDistance.lastSegmentViewportDistance * pixelsToTileUnits;
        return tileDistance.prevTileDistance +
            lastSegmentTile +
            (incidenceStretch - 1) * lastSegmentTile * Math.abs(Math.sin(lastSegmentAngle));
    };

    CollisionIndex.prototype.placeCollisionCircles = function placeCollisionCircles(collisionCircles, allowOverlap, scale, textPixelRatio, symbol, lineVertexArray,
                                                                                    glyphOffsetArray, fontSize, posMatrix, labelPlaneMatrix, showCollisionCircles, pitchWithMap,
                                                                                    collisionGroupPredicate) {
        var placedCollisionCircles = [];

        var projectedAnchor = this.projectAnchor(posMatrix, symbol.anchorX, symbol.anchorY);

        var projectionCache = {};
        var fontScale = fontSize / 24;
        var lineOffsetX = symbol.lineOffsetX * fontSize;
        var lineOffsetY = symbol.lineOffsetY * fontSize;

        var tileUnitAnchorPoint = new Point(symbol.anchorX, symbol.anchorY);
        var labelPlaneAnchorPoint = project(tileUnitAnchorPoint, labelPlaneMatrix).point;

        var firstAndLastGlyph = placeFirstAndLastGlyph(
            fontScale,
            glyphOffsetArray,
            lineOffsetX,
            lineOffsetY,
            /*flip*/ false,
            labelPlaneAnchorPoint,
            tileUnitAnchorPoint,
            symbol,
            lineVertexArray,
            labelPlaneMatrix,
            projectionCache,
            /*return tile distance*/ true);

        var collisionDetected = false;
        var inGrid = false;
        var entirelyOffscreen = true;

        var tileToViewport = projectedAnchor.perspectiveRatio * textPixelRatio;
        var pixelsToTileUnits = 1 / (textPixelRatio * scale);

        var firstTileDistance = 0, lastTileDistance = 0;
        if (firstAndLastGlyph) {
            firstTileDistance = this.approximateTileDistance(firstAndLastGlyph.first.tileDistance, firstAndLastGlyph.first.angle, pixelsToTileUnits, projectedAnchor.cameraDistance, pitchWithMap);
            lastTileDistance = this.approximateTileDistance(firstAndLastGlyph.last.tileDistance, firstAndLastGlyph.last.angle, pixelsToTileUnits, projectedAnchor.cameraDistance, pitchWithMap);
        }

        for (var k = 0; k < collisionCircles.length; k += 5) {
            var anchorPointX = collisionCircles[k];
            var anchorPointY = collisionCircles[k + 1];
            var tileUnitRadius = collisionCircles[k + 2];
            var boxSignedDistanceFromAnchor = collisionCircles[k + 3];
            
            if (!firstAndLastGlyph ||
                (boxSignedDistanceFromAnchor < -firstTileDistance) ||
                (boxSignedDistanceFromAnchor > lastTileDistance)) {
                markCollisionCircleUsed(collisionCircles, k, false);
                continue;
            }

            var projectedPoint = this.projectPoint(posMatrix, anchorPointX, anchorPointY);
            var radius = tileUnitRadius * tileToViewport;

            var atLeastOneCirclePlaced = placedCollisionCircles.length > 0;
            if (atLeastOneCirclePlaced) {
                var dx = projectedPoint.x - placedCollisionCircles[placedCollisionCircles.length - 4];
                var dy = projectedPoint.y - placedCollisionCircles[placedCollisionCircles.length - 3];
                var placedTooDensely = radius * radius * 2 > dx * dx + dy * dy;
                if (placedTooDensely) {
                    var atLeastOneMoreCircle = (k + 8) < collisionCircles.length;
                    if (atLeastOneMoreCircle) {
                        var nextBoxDistanceToAnchor = collisionCircles[k + 8];
                        if ((nextBoxDistanceToAnchor > -firstTileDistance) &&
                            (nextBoxDistanceToAnchor < lastTileDistance)) {
                            // Hide significantly overlapping circles, unless this is the last one we can
                            // use, in which case we want to keep it in place even if it's tightly packed
                            // with the one before it.
                            markCollisionCircleUsed(collisionCircles, k, false);
                            continue;
                        }
                    }
                }
            }
            var collisionBoxArrayIndex = k / 5;
            placedCollisionCircles.push(projectedPoint.x, projectedPoint.y, radius, collisionBoxArrayIndex);
            markCollisionCircleUsed(collisionCircles, k, true);

            var x1 = projectedPoint.x - radius;
            var y1 = projectedPoint.y - radius;
            var x2 = projectedPoint.x + radius;
            var y2 = projectedPoint.y + radius;
            entirelyOffscreen = entirelyOffscreen && this.isOffscreen(x1, y1, x2, y2);
            inGrid = inGrid || this.isInsideGrid(x1, y1, x2, y2);

            if (!allowOverlap) {
                if (this.grid.hitTestCircle(projectedPoint.x, projectedPoint.y, radius, collisionGroupPredicate)) {
                    if (!showCollisionCircles) {
                        return {
                            circles: [],
                            offscreen: false
                        };
                    } else {
                        // Don't early exit if we're showing the debug circles because we still want to calculate
                        // which circles are in use
                        collisionDetected = true;
                    }
                }
            }
        }

        return {
            circles: (collisionDetected || !inGrid) ? [] : placedCollisionCircles,
            offscreen: entirelyOffscreen
        };
    };

    /**
     * Because the geometries in the CollisionIndex are an approximation of the shape of
     * symbols on the map, we use the CollisionIndex to look up the symbol part of
     * `queryRenderedFeatures`.
     *
     * @private
     */
    CollisionIndex.prototype.queryRenderedSymbols = function queryRenderedSymbols(viewportQueryGeometry) {
        if (viewportQueryGeometry.length === 0 || (this.grid.keysLength() === 0 && this.ignoredGrid.keysLength() === 0)) {
            return {};
        }

        var query = [];
        var minX = Infinity;
        var minY = Infinity;
        var maxX = -Infinity;
        var maxY = -Infinity;
        for (var i = 0, list = viewportQueryGeometry; i < list.length; i += 1) {
            var point = list[i];

            var gridPoint = new Point(point.x + viewportPadding, point.y + viewportPadding);
            minX = Math.min(minX, gridPoint.x);
            minY = Math.min(minY, gridPoint.y);
            maxX = Math.max(maxX, gridPoint.x);
            maxY = Math.max(maxY, gridPoint.y);
            query.push(gridPoint);
        }

        var features = this.grid.query(minX, minY, maxX, maxY).concat(this.ignoredGrid.query(minX, minY, maxX, maxY));

        var seenFeatures = {};
        var result = {};

        for (var i$1 = 0, list$1 = features; i$1 < list$1.length; i$1 += 1) {
            var feature = list$1[i$1];

            var featureKey = feature.key;
            // Skip already seen features.
            if (seenFeatures[featureKey.bucketInstanceId] === undefined) {
                seenFeatures[featureKey.bucketInstanceId] = {};
            }
            if (seenFeatures[featureKey.bucketInstanceId][featureKey.featureIndex]) {
                continue;
            }

            var bbox = [
                new Point(feature.x1, feature.y1),
                new Point(feature.x2, feature.y1),
                new Point(feature.x2, feature.y2),
                new Point(feature.x1, feature.y2)
            ];
            if (!intersectUtils.polygonIntersectsPolygon(query, bbox)) {
                continue;
            }

            seenFeatures[featureKey.bucketInstanceId][featureKey.featureIndex] = true;
            if (result[featureKey.bucketInstanceId] === undefined) {
                result[featureKey.bucketInstanceId] = [];
            }
            result[featureKey.bucketInstanceId].push(featureKey.featureIndex);
        }

        return result;
    };

    CollisionIndex.prototype.insertCollisionBox = function insertCollisionBox(collisionBox, ignorePlacement, bucketInstanceId, featureIndex, collisionGroupID) {
        var grid = ignorePlacement ? this.ignoredGrid : this.grid;
        var key = {bucketInstanceId: bucketInstanceId, featureIndex: featureIndex, collisionGroupID: collisionGroupID};
        grid.insert(key, collisionBox[0], collisionBox[1], collisionBox[2], collisionBox[3]);
    };

    CollisionIndex.prototype.insertCollisionCircles = function insertCollisionCircles(collisionCircles, ignorePlacement, bucketInstanceId, featureIndex, collisionGroupID) {
        var grid = ignorePlacement ? this.ignoredGrid : this.grid;
        var key = {bucketInstanceId: bucketInstanceId, featureIndex: featureIndex, collisionGroupID: collisionGroupID};
        for (var k = 0; k < collisionCircles.length; k += 4) {
            grid.insertCircle(key, collisionCircles[k], collisionCircles[k + 1], collisionCircles[k + 2]);
        }
    };

    CollisionIndex.prototype.projectAnchor = function projectAnchor(posMatrix, x, y) {
        var p = [x, y, 0, 1];
        funcUtils.xyTransformMat4(p, p, posMatrix);
        return {
            perspectiveRatio: 0.5 + 0.5 * (this.transform.cameraToCenterDistance / p[3]),
            cameraDistance: p[3]
        };
    };

    CollisionIndex.prototype.projectPoint = function projectPoint(posMatrix, x, y) {
        var p = [x, y, 0, 1];
        funcUtils.xyTransformMat4(p, p, posMatrix);
        return new Point(
            (((p[0] / p[3] + 1) / 2) * this.transform.width) + viewportPadding,
            (((-p[1] / p[3] + 1) / 2) * this.transform.height) + viewportPadding
        );
    };

    CollisionIndex.prototype.projectAndGetPerspectiveRatio = function projectAndGetPerspectiveRatio(posMatrix, x, y) {
        var p = [x, y, 0, 1];
        funcUtils.xyTransformMat4(p, p, posMatrix);
        var a = new Point(
            (((p[0] / p[3] + 1) / 2) * this.transform.width) + viewportPadding,
            (((-p[1] / p[3] + 1) / 2) * this.transform.height) + viewportPadding
        );
        return {
            point: a,
            // See perspective ratio comment in symbol_sdf.vertex
            // We're doing collision detection in viewport space so we need
            // to scale down boxes in the distance
            perspectiveRatio: 0.5 + 0.5 * (this.transform.cameraToCenterDistance / p[3])
        };
    };

    CollisionIndex.prototype.isOffscreen = function isOffscreen(x1, y1, x2, y2) {
        return x2 < viewportPadding || x1 >= this.screenRightBoundary || y2 < viewportPadding || y1 > this.screenBottomBoundary;
    };

    CollisionIndex.prototype.isInsideGrid = function isInsideGrid(x1, y1, x2, y2) {
        return x2 >= 0 && x1 < this.gridRightBoundary && y2 >= 0 && y1 < this.gridBottomBoundary;
    };

    var CollisionGroups = function CollisionGroups(crossSourceCollisions) {
        this.crossSourceCollisions = crossSourceCollisions;
        this.maxGroupID = 0;
        this.collisionGroups = {};
    };

    CollisionGroups.prototype.get = function get(sourceID) {
        if (!this.crossSourceCollisions) {
            if (!this.collisionGroups[sourceID]) {
                var nextGroupID = ++this.maxGroupID;
                this.collisionGroups[sourceID] = {
                    ID: nextGroupID,
                    predicate: function (key) {
                        return key.collisionGroupID === nextGroupID;
                    }
                };
            }
            return this.collisionGroups[sourceID];
        } else {
            return {ID: 0, predicate: null};
        }
    };

    var LayerPlacement = function LayerPlacement() {
        this._currentTileIndex = 0;
        this._seenCrossTileIDs = {};
    };

    LayerPlacement.prototype.continuePlacement = function continuePlacement(tiles, placement, showCollisionBoxes, styleLayer, shouldPausePlacement) {
        while (this._currentTileIndex < tiles.length) {
            var tile = tiles[this._currentTileIndex];
            placement.placeLayerTile(styleLayer, tile, showCollisionBoxes, this._seenCrossTileIDs);

            this._currentTileIndex++;
            if (shouldPausePlacement()) {
                return true;
            }
        }
    };

    var Placement = function Placement(transform, fadeDuration, crossSourceCollisions, prevPlacement) {
        this.transform = transform;
        this.collisionIndex = new CollisionIndex(transform);
        this.placements = {};
        this.opacities = {};
        this.variableOffsets = {};
        this.stale = false;
        this.commitTime = 0;
        this.fadeDuration = fadeDuration;
        this.retainedQueryData = {};
        this.collisionGroups = new CollisionGroups(crossSourceCollisions);

        this.prevPlacement = prevPlacement;
        if (prevPlacement) {
            prevPlacement.prevPlacement = undefined; // Only hold on to one placement back
        }
    };

    Placement.prototype.placeLayerTile = function placeLayerTile(styleLayer, tile, showCollisionBoxes, seenCrossTileIDs) {
        var symbolBucket = ((tile.getBucket(styleLayer)));
        var bucketFeatureIndex = tile.latestFeatureIndex;
        if (!symbolBucket || !bucketFeatureIndex || styleLayer.id !== symbolBucket.layerIds[0]) {
            return;
        }

        var collisionBoxArray = tile.collisionBoxArray;

        var layout = symbolBucket.layers[0].layout;

        var scale = Math.pow(2, this.transform.zoom - tile.tileID.overscaledZ);
        // var textPixelRatio = tile.tileSize / Constant.layout.EXTENT;
        // todo
        var textPixelRatio = 512 / Constant.layout.EXTENT;

        var posMatrix = this.transform.updatePosMatrix(tile.tileID.toUnwrapped());

        var textLabelPlaneMatrix = funcUtils.getLabelPlaneMatrix(posMatrix,
            layout.get('text-pitch-alignment') === 'map',
            layout.get('text-rotation-alignment') === 'map',
            this.transform,
            utils.pixelsToTileUnits(tile, 1, this.transform.zoom));

        var iconLabelPlaneMatrix = funcUtils.getLabelPlaneMatrix(posMatrix,
            layout.get('icon-pitch-alignment') === 'map',
            layout.get('icon-rotation-alignment') === 'map',
            this.transform,
            utils.pixelsToTileUnits(tile, 1, this.transform.zoom));

        // As long as this placement lives, we have to hold onto this bucket's
        // matching FeatureIndex/data for querying purposes
        this.retainedQueryData[symbolBucket.bucketInstanceId] = new RetainedQueryData(
            symbolBucket.bucketInstanceId,
            bucketFeatureIndex,
            symbolBucket.sourceLayerIndex,
            symbolBucket.index,
            tile.tileID
        );
        this.placeLayerBucket(symbolBucket, posMatrix, textLabelPlaneMatrix, iconLabelPlaneMatrix, scale, textPixelRatio,
            showCollisionBoxes, tile.holdingForFade(), seenCrossTileIDs, collisionBoxArray);
    };

    Placement.prototype.attemptAnchorPlacement = function attemptAnchorPlacement(anchor, textBox, width, height,
                                                                                 radialTextOffset, textBoxScale, rotateWithMap,
                                                                                 pitchWithMap, textPixelRatio, posMatrix, collisionGroup,
                                                                                 textAllowOverlap, symbolInstance, bucket) {

        var shift = calculateVariableLayoutOffset(anchor, width, height, radialTextOffset, textBoxScale);

        var placedGlyphBoxes = this.collisionIndex.placeCollisionBox(
            shiftVariableCollisionBox(
                textBox, shift.x, shift.y,
                rotateWithMap, pitchWithMap, this.transform.angle),
            textAllowOverlap, textPixelRatio, posMatrix, collisionGroup.predicate);

        if (placedGlyphBoxes.box.length > 0) {
            var prevAnchor;
            // If this label was placed in the previous placement, record the anchor position
            // to allow us to animate the transition
            if (this.prevPlacement &&
                this.prevPlacement.variableOffsets[symbolInstance.crossTileID] &&
                this.prevPlacement.placements[symbolInstance.crossTileID] &&
                this.prevPlacement.placements[symbolInstance.crossTileID].text) {
                prevAnchor = this.prevPlacement.variableOffsets[symbolInstance.crossTileID].anchor;
            }
            this.variableOffsets[symbolInstance.crossTileID] = {
                radialOffset: radialTextOffset,
                width: width,
                height: height,
                anchor: anchor,
                textBoxScale: textBoxScale,
                prevAnchor: prevAnchor
            };
            this.markUsedJustification(bucket, anchor, symbolInstance);
            return placedGlyphBoxes;
        }
    };

    Placement.prototype.placeLayerBucket = function placeLayerBucket(bucket, posMatrix, textLabelPlaneMatrix, iconLabelPlaneMatrix,
                                                                     scale, textPixelRatio, showCollisionBoxes, holdingForFade, seenCrossTileIDs,
                                                                     collisionBoxArray) {
        var this$1 = this;

        var layout = bucket.layers[0].layout;
        var partiallyEvaluatedTextSize = funcUtils.evaluateSizeForZoom(bucket.textSizeData, this.transform.zoom);
        var textOptional = layout.get('text-optional');
        var iconOptional = layout.get('icon-optional');
        var textAllowOverlap = layout.get('text-allow-overlap');
        var iconAllowOverlap = layout.get('icon-allow-overlap');
        var alwaysShowText = textAllowOverlap && (iconAllowOverlap || !bucket.hasIconData() || iconOptional);
        var alwaysShowIcon = iconAllowOverlap && (textAllowOverlap || !bucket.hasTextData() || textOptional);
        var collisionGroup = this.collisionGroups.get(bucket.sourceID);
        var rotateWithMap = layout.get('text-rotation-alignment') === 'map';
        var pitchWithMap = layout.get('text-pitch-alignment') === 'map';
        var zOrderByViewportY = layout.get('symbol-z-order') === 'viewport-y';

        if (!bucket.collisionArrays && collisionBoxArray) {
            bucket.deserializeCollisionBoxes(collisionBoxArray);
        }

        var placeSymbol = function (symbolInstance, collisionArrays) {
            if (seenCrossTileIDs[symbolInstance.crossTileID]) {
                return;
            }
            
            if (holdingForFade) {
                this$1.placements[symbolInstance.crossTileID] = new joint.JointPlacement(false, false, false);
                return;
            }

            var placeText = false;
            var placeIcon = false;
            var offscreen = true;

            var placedGlyphBoxes = null;
            var placedGlyphCircles = null;
            var placedIconBoxes = null;
            var textFeatureIndex = 0;
            var iconFeatureIndex = 0;

            if (collisionArrays.textFeatureIndex) {
                textFeatureIndex = collisionArrays.textFeatureIndex;
            }

            var textBox = collisionArrays.textBox;
            if (textBox) {
                if (!layout.get('text-variable-anchor')) {
                    placedGlyphBoxes = this$1.collisionIndex.placeCollisionBox(textBox,
                        layout.get('text-allow-overlap'), textPixelRatio, posMatrix, collisionGroup.predicate);
                    placeText = placedGlyphBoxes.box.length > 0;
                } else {
                    var width = textBox.x2 - textBox.x1;
                    var height = textBox.y2 - textBox.y1;
                    var textBoxScale = symbolInstance.textBoxScale;
                    var anchors = layout.get('text-variable-anchor');

                    // If we this symbol was in the last placement, shift the previously used
                    // anchor to the front of the anchor list.
                    if (this$1.prevPlacement && this$1.prevPlacement.variableOffsets[symbolInstance.crossTileID]) {
                        var prevOffsets = this$1.prevPlacement.variableOffsets[symbolInstance.crossTileID];
                        if (anchors[0] !== prevOffsets.anchor) {
                            anchors = anchors.filter(function (anchor) {
                                return anchor !== prevOffsets.anchor;
                            });
                            anchors.unshift(prevOffsets.anchor);
                        }
                    }

                    for (var i = 0, list = anchors; i < list.length; i += 1) {
                        var anchor = list[i];

                        placedGlyphBoxes = this$1.attemptAnchorPlacement(
                            anchor, textBox, width, height, symbolInstance.radialTextOffset,
                            textBoxScale, rotateWithMap, pitchWithMap, textPixelRatio, posMatrix,
                            collisionGroup, textAllowOverlap, symbolInstance, bucket);
                        if (placedGlyphBoxes) {
                            placeText = true;
                            break;
                        }
                    }

                    if (!this$1.variableOffsets[symbolInstance.crossTileID] && this$1.prevPlacement) {
                        var prevOffset = this$1.prevPlacement.variableOffsets[symbolInstance.crossTileID];
                        if (prevOffset) {
                            this$1.variableOffsets[symbolInstance.crossTileID] = prevOffset;
                            this$1.markUsedJustification(bucket, prevOffset.anchor, symbolInstance);
                        }
                    }
                }
            }

            offscreen = placedGlyphBoxes && placedGlyphBoxes.offscreen;
            var textCircles = collisionArrays.textCircles;
            if (textCircles) {
                var placedSymbol = bucket.text.placedSymbolArray.get(symbolInstance.centerJustifiedTextSymbolIndex);
                var fontSize = funcUtils.evaluateSizeForFeature(bucket.textSizeData, partiallyEvaluatedTextSize, placedSymbol);
                placedGlyphCircles = this$1.collisionIndex.placeCollisionCircles(textCircles,
                    layout.get('text-allow-overlap'),
                    scale,
                    textPixelRatio,
                    placedSymbol,
                    bucket.lineVertexArray,
                    bucket.glyphOffsetArray,
                    fontSize,
                    posMatrix,
                    textLabelPlaneMatrix,
                    showCollisionBoxes,
                    pitchWithMap,
                    collisionGroup.predicate);
                placeText = layout.get('text-allow-overlap') || placedGlyphCircles.circles.length > 0;
                offscreen = offscreen && placedGlyphCircles.offscreen;
            }

            if (collisionArrays.iconFeatureIndex) {
                iconFeatureIndex = collisionArrays.iconFeatureIndex;
            }
            if (collisionArrays.iconBox) {
                placedIconBoxes = this$1.collisionIndex.placeCollisionBox(collisionArrays.iconBox,
                    layout.get('icon-allow-overlap'), textPixelRatio, posMatrix, collisionGroup.predicate);
                placeIcon = placedIconBoxes.box.length > 0;
                offscreen = offscreen && placedIconBoxes.offscreen;
            }

            var iconWithoutText = textOptional ||
                (symbolInstance.numHorizontalGlyphVertices === 0 && symbolInstance.numVerticalGlyphVertices === 0);
            var textWithoutIcon = iconOptional || symbolInstance.numIconVertices === 0;

            if (!iconWithoutText && !textWithoutIcon) {
                placeIcon = placeText = placeIcon && placeText;
            } else if (!textWithoutIcon) {
                placeText = placeIcon && placeText;
            } else if (!iconWithoutText) {
                placeIcon = placeIcon && placeText;
            }

            if (placeText && placedGlyphBoxes) {
                this$1.collisionIndex.insertCollisionBox(placedGlyphBoxes.box, layout.get('text-ignore-placement'),
                    bucket.bucketInstanceId, textFeatureIndex, collisionGroup.ID);
            }
            if (placeIcon && placedIconBoxes) {
                this$1.collisionIndex.insertCollisionBox(placedIconBoxes.box, layout.get('icon-ignore-placement'),
                    bucket.bucketInstanceId, iconFeatureIndex, collisionGroup.ID);
            }
            if (placeText && placedGlyphCircles) {
                this$1.collisionIndex.insertCollisionCircles(placedGlyphCircles.circles, layout.get('text-ignore-placement'),
                    bucket.bucketInstanceId, textFeatureIndex, collisionGroup.ID);
            }

            this$1.placements[symbolInstance.crossTileID] = new JointPlacement(placeText || alwaysShowText, placeIcon || alwaysShowIcon, offscreen || bucket.justReloaded);
            seenCrossTileIDs[symbolInstance.crossTileID] = true;
        };

        if (zOrderByViewportY) {
            var symbolIndexes = bucket.getSortedSymbolIndexes(this.transform.angle);
            for (var i = symbolIndexes.length - 1; i >= 0; --i) {
                var symbolIndex = symbolIndexes[i];
                placeSymbol(bucket.symbolInstances.get(symbolIndex), bucket.collisionArrays[symbolIndex]);
            }
        } else {
            for (var i$1 = 0; i$1 < bucket.symbolInstances.length; ++i$1) {
                placeSymbol(bucket.symbolInstances.get(i$1), bucket.collisionArrays[i$1]);
            }
        }

        bucket.justReloaded = false;
    };

    Placement.prototype.markUsedJustification = function markUsedJustification(bucket, placedAnchor, symbolInstance) {
        var justifications = {
            "left": symbolInstance.leftJustifiedTextSymbolIndex,
            "center": symbolInstance.centerJustifiedTextSymbolIndex,
            "right": symbolInstance.rightJustifiedTextSymbolIndex
        };
        var autoIndex = justifications[__chunk_1.getAnchorJustification(placedAnchor)];

        for (var justification in justifications) {
            var index = justifications[justification];
            if (index >= 0) {
                if (autoIndex >= 0 && index !== autoIndex) {
                    // There are multiple justifications and this one isn't it: shift offscreen
                    bucket.text.placedSymbolArray.get(index).crossTileID = 0;
                } else {
                    // Either this is the chosen justification or the justification is hardwired: use this one
                    bucket.text.placedSymbolArray.get(index).crossTileID = symbolInstance.crossTileID;
                }
            }
        }
    };

    Placement.prototype.commit = function commit(now) {
        this.commitTime = now;

        var prevPlacement = this.prevPlacement;
        var placementChanged = false;

        var increment = (prevPlacement && this.fadeDuration !== 0) ?
            (this.commitTime - prevPlacement.commitTime) / this.fadeDuration :
            1;

        var prevOpacities = prevPlacement ? prevPlacement.opacities : {};
        var prevOffsets = prevPlacement ? prevPlacement.variableOffsets : {};
        // add the opacities from the current placement, and copy their current values from the previous placement


        for (var crossTileID in this.placements) {
            
            var jointPlacement = this.placements[crossTileID];
            var prevOpacity = prevOpacities[crossTileID];
            if (prevOpacity) {
                this.opacities[crossTileID] = new JointOpacityState(prevOpacity, increment, jointPlacement.text, jointPlacement.icon);
                placementChanged = placementChanged ||
                    jointPlacement.text !== prevOpacity.text.placed ||
                    jointPlacement.icon !== prevOpacity.icon.placed;
            } else {
                this.opacities[crossTileID] = new JointOpacityState(null, increment, jointPlacement.text, jointPlacement.icon, jointPlacement.skipFade);
                placementChanged = placementChanged || jointPlacement.text || jointPlacement.icon;
            }
        }

        // copy and update values from the previous placement that aren't in the current placement but haven't finished fading
        for (var crossTileID$1 in prevOpacities) {
            var prevOpacity$1 = prevOpacities[crossTileID$1];
            if (!this.opacities[crossTileID$1]) {
                var jointOpacity = new JointOpacityState(prevOpacity$1, increment, false, false);
                if (!jointOpacity.isHidden()) {
                    this.opacities[crossTileID$1] = jointOpacity;
                    placementChanged = placementChanged || prevOpacity$1.text.placed || prevOpacity$1.icon.placed;
                }
            }
        }
        for (var crossTileID$2 in prevOffsets) {
            if (!this.variableOffsets[crossTileID$2] && this.opacities[crossTileID$2] && !this.opacities[crossTileID$2].isHidden()) {
                this.variableOffsets[crossTileID$2] = prevOffsets[crossTileID$2];
            }
        }

        if (placementChanged) {
            this.lastPlacementChangeTime = now;
        } else if (typeof this.lastPlacementChangeTime !== 'number') {
            this.lastPlacementChangeTime = prevPlacement ? prevPlacement.lastPlacementChangeTime : now;
        }
    };

    Placement.prototype.updateLayerOpacities = function updateLayerOpacities(styleLayer, tiles) {
        var seenCrossTileIDs = {};
        for (var i = 0, list = tiles; i < list.length; i += 1) {
            var tile = list[i];
            var symbolBucket = ((tile.getBucket(styleLayer)));
            if (symbolBucket && tile.latestFeatureIndex && styleLayer.id === symbolBucket.layerIds[0]) {
                this.updateBucketOpacities(symbolBucket, seenCrossTileIDs, tile.collisionBoxArray);
            }
        }
    };

    Placement.prototype.updateBucketOpacities = function updateBucketOpacities(bucket, seenCrossTileIDs, collisionBoxArray) {
        if (bucket.hasTextData()) {
            bucket.text.opacityVertexArray.clear();
        }
        if (bucket.hasIconData()) {
            bucket.icon.opacityVertexArray.clear();
        }
        if (bucket.hasCollisionBoxData()) {
            bucket.collisionBox.collisionVertexArray.clear();
        }
        if (bucket.hasCollisionCircleData()) {
            bucket.collisionCircle.collisionVertexArray.clear();
        }

        var layout = bucket.layers[0].layout;
        var duplicateOpacityState = new JointOpacityState(null, 0, false, false, true);
        var textAllowOverlap = layout.get('text-allow-overlap');
        var iconAllowOverlap = layout.get('icon-allow-overlap');
        var variablePlacement = layout.get('text-variable-anchor');
        var rotateWithMap = layout.get('text-rotation-alignment') === 'map';
        var pitchWithMap = layout.get('text-pitch-alignment') === 'map';
        var defaultOpacityState = new JointOpacityState(null, 0,
            textAllowOverlap && (iconAllowOverlap || !bucket.hasIconData() || layout.get('icon-optional')),
            iconAllowOverlap && (textAllowOverlap || !bucket.hasTextData() || layout.get('text-optional')),
            true);

        if (!bucket.collisionArrays && collisionBoxArray && (bucket.hasCollisionBoxData() || bucket.hasCollisionCircleData())) {
            bucket.deserializeCollisionBoxes(collisionBoxArray);
        }

        for (var s = 0; s < bucket.symbolInstances.length; s++) {
            var symbolInstance = bucket.symbolInstances.get(s);
            var numHorizontalGlyphVertices = symbolInstance.numHorizontalGlyphVertices;
            var numVerticalGlyphVertices = symbolInstance.numVerticalGlyphVertices;
            var crossTileID = symbolInstance.crossTileID;

            var isDuplicate = seenCrossTileIDs[crossTileID];

            var opacityState = this.opacities[crossTileID];
            if (isDuplicate) {
                opacityState = duplicateOpacityState;
            } else if (!opacityState) {
                opacityState = defaultOpacityState;
                // store the state so that future placements use it as a starting point
                this.opacities[crossTileID] = opacityState;
            }

            seenCrossTileIDs[crossTileID] = true;

            var hasText = numHorizontalGlyphVertices > 0 || numVerticalGlyphVertices > 0;
            var hasIcon = symbolInstance.numIconVertices > 0;

            
            if (hasText) {
                var packedOpacity = packOpacity(opacityState.text);
                var opacityEntryCount = (numHorizontalGlyphVertices + numVerticalGlyphVertices) / 4;
                for (var i = 0; i < opacityEntryCount; i++) {
                    bucket.text.opacityVertexArray.emplaceBack(packedOpacity);
                }
                var hidden = opacityState.text.isHidden() ? 1 : 0;
                [
                    symbolInstance.rightJustifiedTextSymbolIndex,
                    symbolInstance.centerJustifiedTextSymbolIndex,
                    symbolInstance.leftJustifiedTextSymbolIndex,
                    symbolInstance.verticalPlacedTextSymbolIndex
                ].forEach(function (index) {
                    if (index >= 0) {
                        bucket.text.placedSymbolArray.get(index).hidden = hidden;
                    }
                });

                var prevOffset = this.variableOffsets[symbolInstance.crossTileID];
                if (prevOffset) {
                    this.markUsedJustification(bucket, prevOffset.anchor, symbolInstance);
                }
            }

            if (hasIcon) {
                var packedOpacity$1 = packOpacity(opacityState.icon);
                for (var i$1 = 0; i$1 < symbolInstance.numIconVertices / 4; i$1++) {
                    bucket.icon.opacityVertexArray.emplaceBack(packedOpacity$1);
                }
                bucket.icon.placedSymbolArray.get(s).hidden =
                    (opacityState.icon.isHidden());
            }


            if (bucket.hasCollisionBoxData() || bucket.hasCollisionCircleData()) {
                var collisionArrays = bucket.collisionArrays[s];
                if (collisionArrays) {
                    if (collisionArrays.textBox) {
                        var shift = new __chunk_1.Point(0, 0);
                        var used = true;
                        if (variablePlacement) {
                            var variableOffset = this.variableOffsets[crossTileID];
                            if (variableOffset) {
                                shift = calculateVariableLayoutOffset(variableOffset.anchor,
                                    variableOffset.width,
                                    variableOffset.height,
                                    variableOffset.radialOffset,
                                    variableOffset.textBoxScale);
                                if (rotateWithMap) {
                                    shift._rotate(pitchWithMap ? this.transform.angle : -this.transform.angle);
                                }
                            } else {
                                used = false;
                            }
                        }
                        updateCollisionVertices(bucket.collisionBox.collisionVertexArray, opacityState.text.placed, !used, shift.x, shift.y);
                    }

                    if (collisionArrays.iconBox) {
                        updateCollisionVertices(bucket.collisionBox.collisionVertexArray, opacityState.icon.placed, false);
                    }

                    var textCircles = collisionArrays.textCircles;
                    if (textCircles && bucket.hasCollisionCircleData()) {
                        for (var k = 0; k < textCircles.length; k += 5) {
                            var notUsed = isDuplicate || textCircles[k + 4] === 0;
                            updateCollisionVertices(bucket.collisionCircle.collisionVertexArray, opacityState.text.placed, notUsed);
                        }
                    }
                }
            }
        }

        bucket.sortFeatures(this.transform.angle);
        if (this.retainedQueryData[bucket.bucketInstanceId]) {
            this.retainedQueryData[bucket.bucketInstanceId].featureSortOrder = bucket.featureSortOrder;
        }

        
        if (bucket.hasTextData() && bucket.text.opacityVertexBuffer) {
            bucket.text.opacityVertexBuffer.updateData(bucket.text.opacityVertexArray);
        }
        if (bucket.hasIconData() && bucket.icon.opacityVertexBuffer) {
            bucket.icon.opacityVertexBuffer.updateData(bucket.icon.opacityVertexArray);
        }
        if (bucket.hasCollisionBoxData() && bucket.collisionBox.collisionVertexBuffer) {
            bucket.collisionBox.collisionVertexBuffer.updateData(bucket.collisionBox.collisionVertexArray);
        }
        if (bucket.hasCollisionCircleData() && bucket.collisionCircle.collisionVertexBuffer) {
            bucket.collisionCircle.collisionVertexBuffer.updateData(bucket.collisionCircle.collisionVertexArray);
        }

    };

    Placement.prototype.symbolFadeChange = function symbolFadeChange(now) {
        return this.fadeDuration === 0 ? 1 : (now - this.commitTime) / this.fadeDuration;
    };

    Placement.prototype.hasTransitions = function hasTransitions(now) {
        return this.stale ||
            now - this.lastPlacementChangeTime < this.fadeDuration;
    };

    Placement.prototype.stillRecent = function stillRecent(now) {
        return this.commitTime + this.fadeDuration > now;
    };

    Placement.prototype.setStale = function setStale() {
        this.stale = true;
    };

    var PauseablePlacement = function PauseablePlacement(transform, order, forceFullPlacement, showCollisionBoxes,
                                                         fadeDuration, crossSourceCollisions, prevPlacement) {
        this.placement = new Placement(transform, fadeDuration, crossSourceCollisions, prevPlacement);
        this._currentPlacementIndex = order.length - 1;
        this._forceFullPlacement = forceFullPlacement;
        this._showCollisionBoxes = showCollisionBoxes;
        this._done = false;
    };

    PauseablePlacement.prototype.isDone = function isDone() {
        return this._done;
    };

    PauseablePlacement.prototype.continuePlacement = function continuePlacement(order, layers, layerTiles) {
        var this$1 = this;

        var startTime = funcUtils.now();

        var shouldPausePlacement = function () {
            var elapsedTime = funcUtils.now() - startTime;
            return this$1._forceFullPlacement ? false : elapsedTime > 2;
        };
        
        while (this._currentPlacementIndex >= 0) {
            var layerId = order[this._currentPlacementIndex];
            var layer = layers[layerId];
            var placementZoom = this.placement.collisionIndex.transform.zoom;
            if (layer.type === 'symbol' &&
                (!layer.minzoom || layer.minzoom <= placementZoom) &&
                (!layer.maxzoom || layer.maxzoom > placementZoom)) {

                if (!this._inProgressLayer) {
                    this._inProgressLayer = new LayerPlacement();
                }

                var pausePlacement = this._inProgressLayer.continuePlacement(layerTiles[layer.source], this.placement, this._showCollisionBoxes, layer, shouldPausePlacement);

                if (pausePlacement) {
                    return;
                }

                delete this._inProgressLayer;
            }

            this._currentPlacementIndex--;
        }

        this._done = true;
    };

    PauseablePlacement.prototype.commit = function commit(now) {
        this.placement.commit(now);
        return this.placement;
    };

    return PauseablePlacement;
});