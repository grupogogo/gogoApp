import {
  a
} from "./chunk-DM533J3Z.js";
import {
  require_react
} from "./chunk-W4EHDCLL.js";
import {
  __toESM
} from "./chunk-EWTE5DHJ.js";

// node_modules/@table-library/react-table-library/useSyncControlledState-6e39bfdc.js
var r = __toESM(require_react(), 1);
var u = function(n, u2, e2) {
  r.useEffect(function() {
    u2 && (u2.current[n] = { state: e2 });
  }, [u2, n, e2]);
};
var e = function(u2, e2, t2, c2, f) {
  var o = r.useReducer(u2, e2), i = a(o, 2), s = i[0], a2 = i[1], l = r.useRef(null), v = r.useRef(null);
  return r.useEffect(function() {
    v.current && (c2.forEach(function(r2) {
      return r2(v.current, l.current, f ? f.current : void 0);
    }), v.current = null, l.current = null);
  }, [f, c2, s]), [s, function(r2) {
    t2.forEach(function(n2) {
      return n2(r2, s, f ? f.current : void 0);
    });
    var n = u2(s, r2);
    l.current = n, v.current = r2, a2(r2);
  }];
};
var t = function(r2, n) {
  return JSON.stringify(r2) === JSON.stringify(n);
};
var c = function(n, u2, e2) {
  var c2 = r.useRef(n), f = r.useRef(n);
  r.useEffect(function() {
    t(u2, f.current) && (t(n, c2.current) || t(n, u2) || e2()), c2.current = n, f.current = u2;
  }, [u2, e2, n]);
};

export {
  u,
  e,
  c
};
//# sourceMappingURL=chunk-UJGZIITF.js.map
