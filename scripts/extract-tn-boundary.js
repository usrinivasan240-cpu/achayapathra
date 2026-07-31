const fs = require('fs');

const geojsonPath = 'C:\\Users\\Srinivasan\\.local\\share\\opencode\\tool-output\\tool_fb870b012001bHI3Rd5MM3sEeQ';

const MIN_LAT = 7.8;
const MAX_LAT = 13.8;
const MIN_LNG = 76.0;
const MAX_LNG = 81.0;
const SVG_WIDTH = 520;
const SVG_HEIGHT = 680;

function latLngToSvg(lat, lng) {
    const x = ((lng - MIN_LNG) / 5.0) * 442 + 39;
    const y = SVG_HEIGHT - ((lat - MIN_LAT) / 6.0) * 612 - 14;
    return { x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 };
}

function pKey(lng, lat) {
    return `${lng.toFixed(6)},${lat.toFixed(6)}`;
}

// Read GeoJSON
const geojson = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));
const features = geojson.features;
console.error(`Districts: ${features.length}`);

// Collect all edges from all polygons. An edge is a pair of adjacent vertices.
// We store each edge as a canonical pair (sorted) so shared borders match.
const edgeCount = new Map(); // key -> count

for (const feature of features) {
    const geom = feature.geometry;
    const rings = [];
    if (geom.type === 'Polygon') {
        rings.push(...geom.coordinates);
    } else if (geom.type === 'MultiPolygon') {
        for (const poly of geom.coordinates) {
            rings.push(...poly);
        }
    }

    for (const ring of rings) {
        // First and last point are the same in a closed ring, skip duplicate
        for (let i = 0; i < ring.length - 1; i++) {
            const [lng1, lat1] = ring[i];
            const [lng2, lat2] = ring[i + 1];
            const k1 = pKey(lng1, lat1);
            const k2 = pKey(lng2, lat2);
            // Canonical key: smaller key first
            const edgeKey = k1 < k2 ? `${k1}|${k2}` : `${k2}|${k1}`;
            edgeCount.set(edgeKey, (edgeCount.get(edgeKey) || 0) + 1);
        }
    }
}

// Boundary edges are those that appear exactly once
const boundaryEdges = [];
for (const [edgeKey, count] of edgeCount) {
    if (count === 1) {
        const [p1, p2] = edgeKey.split('|');
        const [lng1, lat1] = p1.split(',').map(Number);
        const [lng2, lat2] = p2.split(',').map(Number);
        boundaryEdges.push({ from: { lng: lng1, lat: lat1 }, to: { lng: lng2, lat: lat2 } });
    }
}

console.error(`Boundary edges: ${boundaryEdges.length}`);

// Build adjacency: for each point, list of neighbors via boundary edges
const adj = new Map();

function addAdj(a, b) {
    const key = pKey(a.lng, a.lat);
    if (!adj.has(key)) adj.set(key, []);
    adj.get(key).push(b);
}

for (const edge of boundaryEdges) {
    addAdj(edge.from, edge.to);
    addAdj(edge.to, edge.from);
}

// Find outer boundary by tracing: start from a known boundary point
// Pick the point with minimum latitude (southernmost) - Kanyakumari area
let startKey = null;
let startLat = Infinity;
let startLng = 0;
for (const [key, neighbors] of adj) {
    const [lng, lat] = key.split(',').map(Number);
    if (lat < startLat || (lat === startLat && lng > startLng)) {
        startLat = lat;
        startLng = lng;
        startKey = key;
    }
}

console.error(`Starting point: ${startKey} (lat=${startLat}, lng=${startLng})`);

// Trace the boundary using right-hand rule (clockwise = outer boundary)
const path = [];
let current = startKey;
let prev = null;

do {
    const [clng, clat] = current.split(',').map(Number);
    path.push({ lng: clng, lat: clat });

    const neighbors = adj.get(current);
    if (!neighbors || neighbors.length === 0) break;

    let next = null;
    if (prev === null) {
        // Pick the neighbor that gives the most clockwise turn from east
        next = neighbors[0];
    } else {
        // Choose the neighbor that turns rightmost from the direction we came from
        const [plng, plat] = prev.split(',').map(Number);
        const dirX = clng - plng;
        const dirY = clat - plat;

        let bestAngle = -Infinity;
        for (const nb of neighbors) {
            if (pKey(nb.lng, nb.lat) === prev) continue;
            const ndirX = nb.lng - clng;
            const ndirY = nb.lat - clat;
            // Cross product: positive = left turn, negative = right turn
            // For outer boundary clockwise: pick most right turn (most negative cross product)
            // Actually for outer boundary of a polygon in lat/lng, 
            // we want counter-clockwise in lat/lng space to trace outer boundary
            // But India/TN is in northern hemisphere, let's just pick the most counter-clockwise turn
            const cross = dirX * ndirY - dirY * ndirX;
            // Also consider the angle
            const dot = dirX * ndirX + dirY * ndirY;
            const angle = Math.atan2(cross, dot);
            if (cross > bestAngle || (cross === bestAngle && angle > 0)) {
                bestAngle = cross;
                next = nb;
            }
        }

        if (next === null) {
            // fallback: just pick the first non-prev neighbor
            for (const nb of neighbors) {
                if (pKey(nb.lng, nb.lat) !== prev) {
                    next = nb;
                    break;
                }
            }
        }
    }

    const nextKey = pKey(next.lng, next.lat);
    prev = current;
    current = nextKey;
} while (current !== startKey);

console.error(`Boundary path points: ${path.length}`);

// Convert to SVG and generate path string
const svgPoints = path.map(p => latLngToSvg(p.lat, p.lng));

let svgPath = `M ${svgPoints[0].x},${svgPoints[0].y}`;
for (let i = 1; i < svgPoints.length; i++) {
    svgPath += ` L ${svgPoints[i].x},${svgPoints[i].y}`;
}
svgPath += ' Z';

console.log(svgPath);
