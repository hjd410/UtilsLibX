define("com/huayun/webgis/utils/clipLine", [
    "../geometry/Point"
], function (Point) {
    function clipLine(lines, x1, y1, x2, y2) {
        var clippedLines = [];
        for (var l = 0; l < lines.length; l++) {
            var line = lines[l];
            var clippedLine = void 0;

            for (var i = 0; i < line.length - 1; i++) {
                var p0 = line[i];
                var p1 = line[i + 1];
                if (p0.x < x1 && p1.x < x1) {
                    continue;
                } else if (p0.x < x1) {
                    p0 = new Point(x1, p0.y + (p1.y - p0.y) * ((x1 - p0.x) / (p1.x - p0.x)))._round();
                } else if (p1.x < x1) {
                    p1 = new Point(x1, p0.y + (p1.y - p0.y) * ((x1 - p0.x) / (p1.x - p0.x)))._round();
                }

                if (p0.y < y1 && p1.y < y1) {
                    continue;
                } else if (p0.y < y1) {
                    p0 = new Point(p0.x + (p1.x - p0.x) * ((y1 - p0.y) / (p1.y - p0.y)), y1)._round();
                } else if (p1.y < y1) {
                    p1 = new Point(p0.x + (p1.x - p0.x) * ((y1 - p0.y) / (p1.y - p0.y)), y1)._round();
                }

                if (p0.x >= x2 && p1.x >= x2) {
                    continue;
                } else if (p0.x >= x2) {
                    p0 = new Point(x2, p0.y + (p1.y - p0.y) * ((x2 - p0.x) / (p1.x - p0.x)))._round();
                } else if (p1.x >= x2) {
                    p1 = new Point(x2, p0.y + (p1.y - p0.y) * ((x2 - p0.x) / (p1.x - p0.x)))._round();
                }

                if (p0.y >= y2 && p1.y >= y2) {
                    continue;
                } else if (p0.y >= y2) {
                    p0 = new Point(p0.x + (p1.x - p0.x) * ((y2 - p0.y) / (p1.y - p0.y)), y2)._round();
                } else if (p1.y >= y2) {
                    p1 = new Point(p0.x + (p1.x - p0.x) * ((y2 - p0.y) / (p1.y - p0.y)), y2)._round();
                }

                if (!clippedLine || !p0.equals(clippedLine[clippedLine.length - 1])) {
                    clippedLine = [p0];
                    clippedLines.push(clippedLine);
                }
                clippedLine.push(p1);
            }
        }
        return clippedLines;
    }

    return clipLine;
})