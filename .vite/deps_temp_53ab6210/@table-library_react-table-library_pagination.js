import {
  c,
  e as e2,
  u
} from "./chunk-UJGZIITF.js";
import {
  a,
  e
} from "./chunk-DM533J3Z.js";
import {
  require_react
} from "./chunk-W4EHDCLL.js";
import {
  __toESM
} from "./chunk-EWTE5DHJ.js";

// node_modules/@table-library/react-table-library/pagination.js
var t = __toESM(require_react());
function i(e3, r) {
  var t2 = Object.keys(e3);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e3);
    r && (n = n.filter(function(r2) {
      return Object.getOwnPropertyDescriptor(e3, r2).enumerable;
    })), t2.push.apply(t2, n);
  }
  return t2;
}
function s(e3) {
  for (var t2 = 1; t2 < arguments.length; t2++) {
    var n = null != arguments[t2] ? arguments[t2] : {};
    t2 % 2 ? i(Object(n), true).forEach(function(t3) {
      e(e3, t3, n[t3]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e3, Object.getOwnPropertyDescriptors(n)) : i(Object(n)).forEach(function(r) {
      Object.defineProperty(e3, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e3;
}
var u2 = "SET";
var c2 = function(e3, r) {
  if (r.type === u2) return function(e4, r2) {
    return s(s({}, e4), r2.payload);
  }(e3, r);
  throw new Error();
};
var p = { page: 0, size: 10 };
var l = { isServer: false };
var f = function(r, i2, f2, g) {
  var y, b = s(s({}, p), null !== (y = null == i2 ? void 0 : i2.state) && void 0 !== y ? y : {}), d = null != i2 && i2.onChange ? i2.onChange : function() {
  }, O = e2(c2, b, [], [d], g), j = a(O, 2), m = j[0], v = j[1], P = t.useCallback(function(e3) {
    return v({ type: u2, payload: { page: e3 } });
  }, [v]), h = t.useCallback(function(e3) {
    return v({ type: u2, payload: { size: e3, page: 0 } });
  }, [v]);
  c(b, m, function() {
    return v({ type: u2, payload: b });
  });
  var z = t.useCallback(function(e3) {
    return Math.ceil(e3.length / m.size);
  }, [m.size]), S = t.useCallback(function(e3) {
    return e3.reduce(function(e4, r2, t2) {
      var n = Math.floor(t2 / m.size);
      return e4[n] || (e4[n] = []), e4[n].push(r2), e4;
    }, []);
  }, [m.size]), w = t.useCallback(function(e3) {
    var r2 = m.page * m.size + 1, t2 = m.page * m.size + m.size;
    return { start: r2, end: t2 > e3.length ? e3.length : t2 };
  }, [m.page, m.size]), C = t.useMemo(function() {
    return { onSetPage: P, onSetSize: h };
  }, [P, h]);
  u("pagination", g, m);
  var k = s(s({}, l), null != f2 ? f2 : {}), D = s(s({}, m), {}, { getTotalPages: z, getPages: S, getPageBoundaries: w });
  return { state: D, fns: C, options: k, modifier: function(e3) {
    return k.isServer ? e3 : D.getPages(e3)[m.page] || [];
  } };
};
export {
  f as usePagination
};
//# sourceMappingURL=@table-library_react-table-library_pagination.js.map
