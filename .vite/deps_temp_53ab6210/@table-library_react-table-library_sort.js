import {
  W,
  clsx_m_default,
  css,
  e,
  jsx,
  n,
  v
} from "./chunk-RBADCI7F.js";
import "./chunk-HQ6ZTAWL.js";
import "./chunk-UJE42DUN.js";
import {
  c,
  e as e3,
  u
} from "./chunk-UJGZIITF.js";
import {
  a,
  e as e2
} from "./chunk-DM533J3Z.js";
import {
  require_react
} from "./chunk-W4EHDCLL.js";
import {
  __toESM
} from "./chunk-EWTE5DHJ.js";

// node_modules/@table-library/react-table-library/sort-c8713016.js
var e4;
var t;
!function(e6) {
  e6[e6.Prefix = 0] = "Prefix", e6[e6.Suffix = 1] = "Suffix";
}(e4 || (e4 = {})), function(e6) {
  e6[e6.Alternate = 0] = "Alternate", e6[e6.AlternateWithReset = 1] = "AlternateWithReset";
}(t || (t = {}));

// node_modules/@table-library/react-table-library/sort.js
var o = __toESM(require_react());

// node_modules/@table-library/react-table-library/IconChevronSingleDown-26fa40c5.js
var g = __toESM(require_react(), 1);
var c2 = function(i) {
  var t2 = i.margin;
  return css("display:flex;align-items:center;background:none;color:inherit;border:none;padding:0;font:inherit;cursor:pointer;outline:inherit;width:100%;height:100%;&.narrow{width:auto;}&.active{font-weight:bold;}span{display:flex;align-items:center;justify-content:center;}&.prefix{margin-right:", t2 || 0, ";}&.suffix{margin-left:", t2 || 0, ";}&.no-shrink{flex-shrink:0;}div{text-align:left;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;}div:after{display:block;content:attr(title);font-weight:bold;height:0;overflow:hidden;visibility:hidden;}" + (false ? "" : "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN0eWxlcy50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ21DIiwiZmlsZSI6InN0eWxlcy50c3giLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBjc3MgfSBmcm9tICdAZW1vdGlvbi9yZWFjdCc7XHJcbmV4cG9ydCBkZWZhdWx0ICh7IG1hcmdpbiB9KSA9PiBjc3MgYFxuICBkaXNwbGF5OiBmbGV4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuXG4gIGJhY2tncm91bmQ6IG5vbmU7XG4gIGNvbG9yOiBpbmhlcml0O1xuICBib3JkZXI6IG5vbmU7XG4gIHBhZGRpbmc6IDA7XG4gIGZvbnQ6IGluaGVyaXQ7XG4gIGN1cnNvcjogcG9pbnRlcjtcbiAgb3V0bGluZTogaW5oZXJpdDtcblxuICB3aWR0aDogMTAwJTtcbiAgaGVpZ2h0OiAxMDAlO1xuXG4gICYubmFycm93IHtcbiAgICB3aWR0aDogYXV0bztcbiAgfVxuXG4gICYuYWN0aXZlIHtcbiAgICBmb250LXdlaWdodDogYm9sZDtcbiAgfVxuXG4gIHNwYW4ge1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgfVxuXG4gICYucHJlZml4IHtcbiAgICBtYXJnaW4tcmlnaHQ6ICR7bWFyZ2luIHx8IDB9O1xuICB9XG5cbiAgJi5zdWZmaXgge1xuICAgIG1hcmdpbi1sZWZ0OiAke21hcmdpbiB8fCAwfTtcbiAgfVxuXG4gICYubm8tc2hyaW5rIHtcbiAgICBmbGV4LXNocmluazogMDtcbiAgfVxuXG4gIGRpdiB7XG4gICAgdGV4dC1hbGlnbjogbGVmdDtcbiAgICBvdmVyZmxvdzogaGlkZGVuO1xuICAgIHdoaXRlLXNwYWNlOiBub3dyYXA7XG4gICAgdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7XG4gIH1cblxuICBkaXY6YWZ0ZXIge1xuICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgIGNvbnRlbnQ6IGF0dHIodGl0bGUpO1xuICAgIGZvbnQtd2VpZ2h0OiBib2xkO1xuICAgIGhlaWdodDogMDtcbiAgICBvdmVyZmxvdzogaGlkZGVuO1xuICAgIHZpc2liaWxpdHk6IGhpZGRlbjtcbiAgfVxuYDtcclxuIl19 */"));
};
var e5 = ["margin"];
var I = g.forwardRef(function(g2, n2) {
  var I2 = g2.margin, a3 = e(g2, e5);
  return jsx("div", n({ ref: n2 }, a3, { css: c2({ margin: I2 }) }));
});
var a2 = function(i) {
  var t2 = i.width, g2 = i.height, n2 = i.viewBox, c3 = i.strokeWidth;
  return jsx("svg", { id: "svg-icon-chevron-single-down", "data-name": "svg-icon-chevron-single-down", "data-testid": "svg-icon-chevron-single-down", xmlns: "http://www.w3.org/2000/svg", width: t2 || "36rem", height: g2 || "36rem", viewBox: n2 || "0 0 36 36", strokeWidth: c3 || "0rem" }, jsx("polygon", { points: "0 15 0 12 18 21 36 12 36 15 18 24 0 15" }));
};

// node_modules/@table-library/react-table-library/sort.js
function d(e6, r) {
  var t2 = Object.keys(e6);
  if (Object.getOwnPropertySymbols) {
    var o2 = Object.getOwnPropertySymbols(e6);
    r && (o2 = o2.filter(function(r2) {
      return Object.getOwnPropertyDescriptor(e6, r2).enumerable;
    })), t2.push.apply(t2, o2);
  }
  return t2;
}
function m(e6) {
  for (var r = 1; r < arguments.length; r++) {
    var t2 = null != arguments[r] ? arguments[r] : {};
    r % 2 ? d(Object(t2), true).forEach(function(r2) {
      e2(e6, r2, t2[r2]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e6, Object.getOwnPropertyDescriptors(t2)) : d(Object(t2)).forEach(function(r2) {
      Object.defineProperty(e6, r2, Object.getOwnPropertyDescriptor(t2, r2));
    });
  }
  return e6;
}
var h = function(r) {
  var t2 = r.sort, n2 = r.sortKey, s = r.sortIcon, a3 = void 0 === s ? {} : s, u2 = r.children, p = t2.state, f = t2.fns, v2 = m(m({}, t2.options.sortIcon), a3), g2 = v2.position === e4.Prefix, y = v2.position === e4.Suffix, d2 = function(e6, r2, t3, n3, s2, i) {
    var c3 = { height: "".concat(t3), width: "".concat(t3) };
    return e6.sortKey === r2 && e6.reverse ? i ? o.cloneElement(i, m({}, c3)) : null : e6.sortKey !== r2 || e6.reverse ? n3 ? o.cloneElement(n3, m({}, c3)) : null : s2 ? o.cloneElement(s2, m({}, c3)) : null;
  }(p, n2, v2.size, v2.iconDefault, v2.iconUp, v2.iconDown);
  return jsx(I, { className: clsx_m_default({ active: p.sortKey === n2 }), onClick: function() {
    return f.onToggleSort({ sortKey: n2 });
  } }, g2 && d2 && jsx("span", { style: { marginRight: v2.margin } }, d2), jsx("div", { title: "string" == typeof u2 ? u2 : "" }, u2), y && d2 && jsx("span", { style: { marginLeft: v2.margin } }, d2));
};
var w = ["sortKey", "sortIcon", "children"];
var O = o.memo(function(e6) {
  var r = e6.sortKey, o2 = e6.sortIcon, i = void 0 === o2 ? {} : o2, a3 = e6.children, u2 = e(e6, w), l = W();
  if (!l) throw new Error("No Sort Context. No return value from useSort provided to Table component.");
  return jsx(v, u2, jsx(h, { sort: l, sortKey: r, sortIcon: i }, a3));
});
function b(e6, r) {
  var t2 = Object.keys(e6);
  if (Object.getOwnPropertySymbols) {
    var o2 = Object.getOwnPropertySymbols(e6);
    r && (o2 = o2.filter(function(r2) {
      return Object.getOwnPropertyDescriptor(e6, r2).enumerable;
    })), t2.push.apply(t2, o2);
  }
  return t2;
}
function j(e6) {
  for (var r = 1; r < arguments.length; r++) {
    var t2 = null != arguments[r] ? arguments[r] : {};
    r % 2 ? b(Object(t2), true).forEach(function(r2) {
      e2(e6, r2, t2[r2]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e6, Object.getOwnPropertyDescriptors(t2)) : b(Object(t2)).forEach(function(r2) {
      Object.defineProperty(e6, r2, Object.getOwnPropertyDescriptor(t2, r2));
    });
  }
  return e6;
}
var P = "TOGGLE_SORT";
var x = function(e6, t2) {
  switch (t2.type) {
    case P:
      return function(e7, t3) {
        var o2 = t3.payload.value.sortKey === e7.sortKey, n2 = e7.reverse;
        if (o2 && n2 && t3.payload.options.sortToggleType === t.AlternateWithReset) return { sortKey: "NONE", reverse: false };
        var s = o2 && !n2;
        return j(j({}, t3.payload.value), {}, { reverse: s });
      }(e6, t2);
    case "SET":
      return function(e7, r) {
        return j(j({}, e7), r.payload);
      }(e6, t2);
    default:
      throw new Error();
  }
};
var T = { sortKey: "NONE", reverse: false };
var E = { position: e4.Suffix, margin: "4px", size: "14px", iconDefault: jsx(function(e6) {
  var r = e6.width, t2 = e6.height, o2 = e6.viewBox, n2 = e6.strokeWidth;
  return jsx("svg", { id: "svg-icon-chevron-single-up-down", "data-name": "svg-icon-chevron-single-up-down", "data-testid": "svg-icon-chevron-single-up-down", xmlns: "http://www.w3.org/2000/svg", width: r || "36rem", height: t2 || "36rem", viewBox: o2 || "0 0 36 36", strokeWidth: n2 || "0rem" }, jsx("polygon", { points: "36 12 36 15 18 6 0 15 0 12 18 3 36 12" }), jsx("polygon", { points: "0 24 0 21 18 30 36 21 36 24 18 33 0 24" }));
}, null), iconUp: jsx(function(e6) {
  var r = e6.width, t2 = e6.height, o2 = e6.viewBox, n2 = e6.strokeWidth;
  return jsx("svg", { id: "svg-icon-chevron-single-up", "data-name": "svg-icon-chevron-single-up", "data-testid": "svg-icon-chevron-single-up", xmlns: "http://www.w3.org/2000/svg", width: r || "36rem", height: t2 || "36rem", viewBox: o2 || "0 0 36 36", strokeWidth: n2 || "0rem" }, jsx("polygon", { points: "36 21 36 24 18 15 0 24 0 21 18 12 36 21" }));
}, null), iconDown: jsx(a2, null) };
var D = { isServer: false, sortToggleType: t.Alternate, sortIcon: E, isRecursive: true };
var K = function(e6, r, t2, n2) {
  var s, i = j(j({}, T), null !== (s = r.state) && void 0 !== s ? s : {}), c3 = null != r && r.onChange ? r.onChange : function() {
  }, a3 = e3(x, i, [], [c3], n2), u2 = a(a3, 2), l = u2[0], p = u2[1], d2 = o.useCallback(function(e7) {
    return p({ type: P, payload: { value: e7, options: t2 } });
  }, [t2, p]);
  c(i, l, function() {
    return p({ type: "SET", payload: i });
  });
  var m2 = o.useCallback(function(e7, r2, t3) {
    var o2 = r2[l.sortKey] || function(e8) {
      return e8;
    };
    return (l.reverse ? function(e8) {
      return o2(e8).reverse();
    } : o2)(e7).reduce(function(e8, o3) {
      return t3 && o3.nodes ? e8.concat(j(j({}, o3), {}, { nodes: m2(o3.nodes, r2, t3) })) : e8.concat(o3);
    }, []);
  }, [l]), h2 = o.useMemo(function() {
    return { onToggleSort: d2 };
  }, [d2]);
  u("sort", n2, l);
  var w2 = j(j(j({}, D), t2), {}, { sortIcon: j(j({}, E), t2 ? t2.sortIcon : {}) }), b2 = j(j({}, l), {}, { sortFn: m2 });
  return { state: b2, fns: h2, options: w2, modifier: function(e7) {
    return w2.isServer ? e7 : b2.sortFn(e7, w2.sortFns, w2.isRecursive);
  }, components: { HeaderCellSort: O } };
};
export {
  O as HeaderCellSort,
  e4 as SortIconPositions,
  t as SortToggleType,
  K as useSort
};
//# sourceMappingURL=@table-library_react-table-library_sort.js.map
