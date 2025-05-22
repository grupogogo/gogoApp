import {
  K,
  O,
  P,
  Q,
  T,
  h,
  i,
  o,
  o2
} from "./chunk-J2KRMBHO.js";
import {
  v
} from "./chunk-RBADCI7F.js";
import "./chunk-HQ6ZTAWL.js";
import "./chunk-UJE42DUN.js";
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
import "./chunk-ZO3OH5QR.js";
import {
  __toESM
} from "./chunk-EWTE5DHJ.js";

// node_modules/@table-library/react-table-library/index-b33465ae.js
var r = __toESM(require_react(), 1);
var a2 = function(e3) {
  var t = r.useRef(e3);
  return r.useEffect(function() {
    t.current = e3;
  }, [e3]), t;
};
function u2(r2, e3) {
  var t = Object.keys(r2);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(r2);
    e3 && (n = n.filter(function(e4) {
      return Object.getOwnPropertyDescriptor(r2, e4).enumerable;
    })), t.push.apply(t, n);
  }
  return t;
}
function f(r2) {
  for (var e3 = 1; e3 < arguments.length; e3++) {
    var n = null != arguments[e3] ? arguments[e3] : {};
    e3 % 2 ? u2(Object(n), true).forEach(function(e4) {
      e(r2, e4, n[e4]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(r2, Object.getOwnPropertyDescriptors(n)) : u2(Object(n)).forEach(function(e4) {
      Object.defineProperty(r2, e4, Object.getOwnPropertyDescriptor(n, e4));
    });
  }
  return r2;
}
var i2 = function(r2, e3) {
  if ("SET" === e3.type) return function(r3, e4) {
    return f(f({}, r3), e4.payload);
  }(r2, e3);
  throw new Error();
};
var s = {};
var p = function(r2, t, a3, u3) {
  var p2, l = f(f({}, s), null !== (p2 = null == a3 ? void 0 : a3.state) && void 0 !== p2 ? p2 : {}), y = null != a3 && a3.onChange ? a3.onChange : function() {
  }, O2 = e2(i2, l, [], [y], u3), b = a(O2, 2), j = b[0], d = b[1];
  return c(l, j, function() {
    return d({ type: "SET", payload: l });
  }), u(r2, u3, j), j;
};

// node_modules/@table-library/react-table-library/table.js
var import_react = __toESM(require_react());
export {
  o2 as Body,
  o as Cell,
  P as Footer,
  K as FooterCell,
  T as FooterRow,
  i as Header,
  v as HeaderCell,
  Q as HeaderRow,
  O as Row,
  h as Table,
  p as useCustom,
  a2 as useTableContext
};
//# sourceMappingURL=@table-library_react-table-library_table.js.map
