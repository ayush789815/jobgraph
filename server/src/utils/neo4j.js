import neo4j from 'neo4j-driver';

/**
 * Recursively converts Neo4j driver values into plain, JSON-serializable
 * JavaScript. Handles 64-bit Integers (required before JSON.stringify),
 * Node and Relationship objects, arrays, maps, and dates.
 */
export function toPlain(value) {
  if (value === null || value === undefined) return value;

  if (neo4j.isInt(value)) return value.toNumber();

  if (value instanceof neo4j.types.Node) {
    return toPlain(value.properties);
  }

  if (value instanceof neo4j.types.Relationship) {
    return { ...toPlain(value.properties), type: value.type };
  }

  if (Array.isArray(value)) return value.map(toPlain);

  if (value instanceof Date) return value.toISOString();

  if (typeof value === 'object') {
    const out = {};
    for (const key of Object.keys(value)) {
      out[key] = toPlain(value[key]);
    }
    return out;
  }

  return value;
}
