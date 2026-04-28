const DEFAULT_ZONE_COUNT = 22;

function getFeatureCentroid(feature) {
  const geometry = feature.geometry;

  if (!geometry) {
    return [0, 0];
  }

  const coordinates = geometry.type === "Polygon"
    ? geometry.coordinates.flat()
    : geometry.coordinates.flat(2);

  let sumX = 0;
  let sumY = 0;
  let count = 0;

  coordinates.forEach(([x, y]) => {
    if (Number.isFinite(x) && Number.isFinite(y)) {
      sumX += x;
      sumY += y;
      count += 1;
    }
  });

  if (!count) {
    return [0, 0];
  }

  return [sumX / count, sumY / count];
}

function seedCenters(points, clusterCount) {
  const step = Math.max(1, Math.floor(points.length / clusterCount));
  const centers = [];

  for (let i = 0; i < clusterCount; i += 1) {
    const point = points[Math.min(i * step, points.length - 1)];
    centers.push([point[0], point[1]]);
  }

  return centers;
}

function nearestCenter(point, centers) {
  let bestIndex = 0;
  let bestDistance = Number.POSITIVE_INFINITY;

  centers.forEach((center, index) => {
    const dx = point[0] - center[0];
    const dy = point[1] - center[1];
    const distance = dx * dx + dy * dy;

    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });

  return bestIndex;
}

function kMeans(points, clusterCount, maxIterations = 20) {
  if (points.length <= clusterCount) {
    return points.map((_, index) => index);
  }

  const centers = seedCenters(points, clusterCount);
  const assignments = new Array(points.length).fill(0);

  for (let iteration = 0; iteration < maxIterations; iteration += 1) {
    let changed = false;

    points.forEach((point, pointIndex) => {
      const nearest = nearestCenter(point, centers);
      if (assignments[pointIndex] !== nearest) {
        assignments[pointIndex] = nearest;
        changed = true;
      }
    });

    const sums = new Array(clusterCount).fill(null).map(() => ({ x: 0, y: 0, n: 0 }));

    points.forEach((point, pointIndex) => {
      const cluster = assignments[pointIndex];
      sums[cluster].x += point[0];
      sums[cluster].y += point[1];
      sums[cluster].n += 1;
    });

    sums.forEach((sum, cluster) => {
      if (sum.n > 0) {
        centers[cluster] = [sum.x / sum.n, sum.y / sum.n];
      }
    });

    if (!changed) {
      break;
    }
  }

  return assignments;
}

function getPolygonRings(feature) {
  if (!feature.geometry) {
    return [];
  }

  if (feature.geometry.type === "Polygon") {
    return feature.geometry.coordinates;
  }

  return feature.geometry.coordinates.flat();
}

function edgeKey(a, b) {
  const round = (value) => Number.parseFloat(value.toFixed(6));
  const p1 = [round(a[0]), round(a[1])];
  const p2 = [round(b[0]), round(b[1])];

  if (p1[0] < p2[0] || (p1[0] === p2[0] && p1[1] <= p2[1])) {
    return `${p1[0]},${p1[1]}|${p2[0]},${p2[1]}`;
  }

  return `${p2[0]},${p2[1]}|${p1[0]},${p1[1]}`;
}

function buildZoneBoundaries(featuresByZone) {
  const globalEdges = new Map();

  featuresByZone.forEach((zoneFeatures, zoneId) => {
    zoneFeatures.forEach((feature) => {
      const rings = getPolygonRings(feature);

      rings.forEach((ring) => {
        for (let i = 0; i < ring.length - 1; i += 1) {
          const start = ring[i];
          const end = ring[i + 1];
          const key = edgeKey(start, end);

          if (!globalEdges.has(key)) {
            globalEdges.set(key, {
              start,
              end,
              byZone: new Map(),
            });
          }

          const record = globalEdges.get(key);
          record.byZone.set(zoneId, (record.byZone.get(zoneId) || 0) + 1);
        }
      });
    });
  });

  const boundaryFeatures = [];

  featuresByZone.forEach((_, zoneId) => {
    const segments = [];

    globalEdges.forEach((record) => {
      const count = record.byZone.get(zoneId) || 0;
      if (count === 1) {
        segments.push([record.start, record.end]);
      }
    });

    if (segments.length) {
      boundaryFeatures.push({
        type: "Feature",
        properties: { zone_id: zoneId, zone_name: `Zone ${zoneId}` },
        geometry: {
          type: "MultiLineString",
          coordinates: segments,
        },
      });
    }
  });

  return {
    type: "FeatureCollection",
    features: boundaryFeatures,
  };
}

export function buildMergedWards(geojson, targetZoneCount = DEFAULT_ZONE_COUNT) {
  if (!geojson?.features?.length) {
    return { zones: null, markers: [], boundaries: null };
  }

  const zoneCount = Math.max(
    20,
    Math.min(25, Math.min(targetZoneCount, geojson.features.length)),
  );

  const centroids = geojson.features.map(getFeatureCentroid);
  const assignments = kMeans(centroids, zoneCount);

  const zoneStats = new Map();

  const zones = {
    ...geojson,
    features: geojson.features.map((feature, index) => {
      const zoneId = assignments[index] + 1;

      if (!zoneStats.has(zoneId)) {
        zoneStats.set(zoneId, {
          zoneId,
          wardCount: 0,
          wardNames: [],
          x: 0,
          y: 0,
          features: [],
        });
      }

      const zone = zoneStats.get(zoneId);
      zone.wardCount += 1;
      zone.x += centroids[index][0];
      zone.y += centroids[index][1];
      zone.features.push(feature);

      if (feature.properties?.KGISWardName) {
        zone.wardNames.push(feature.properties.KGISWardName);
      }

      return {
        ...feature,
        properties: {
          ...feature.properties,
          zone_id: zoneId,
          zone_name: `Zone ${zoneId}`,
          score: null,
        },
      };
    }),
  };

  const markers = Array.from(zoneStats.values()).map((zone) => ({
    zoneId: zone.zoneId,
    center: [zone.y / zone.wardCount, zone.x / zone.wardCount],
    wardCount: zone.wardCount,
    wardNames: zone.wardNames,
  }));

  const detailsByZone = new Map(markers.map((zone) => [zone.zoneId, zone]));

  zones.features = zones.features.map((feature) => {
    const details = detailsByZone.get(feature.properties.zone_id);

    return {
      ...feature,
      properties: {
        ...feature.properties,
        ward_count: details?.wardCount ?? 0,
        ward_names: details?.wardNames ?? [],
      },
    };
  });

  const featuresByZone = new Map(
    Array.from(zoneStats.values()).map((zone) => [zone.zoneId, zone.features]),
  );

  const boundaries = buildZoneBoundaries(featuresByZone);

  return {
    zones,
    markers,
    boundaries,
  };
}
