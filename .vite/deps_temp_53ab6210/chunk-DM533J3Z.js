// node_modules/@table-library/react-table-library/unsupportedIterableToArray-dc74e326.js
var r = function(r2, t3) {
  (null == t3 || t3 > r2.length) && (t3 = r2.length);
  for (var n3 = 0, e3 = new Array(t3); n3 < t3; n3++) e3[n3] = r2[n3];
  return e3;
};
var t = r;
var n = function(r2, n3) {
  if (r2) {
    if ("string" == typeof r2) return t(r2, n3);
    var e3 = Object.prototype.toString.call(r2).slice(8, -1);
    return "Object" === e3 && r2.constructor && (e3 = r2.constructor.name), "Map" === e3 || "Set" === e3 ? Array.from(r2) : "Arguments" === e3 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(e3) ? t(r2, n3) : void 0;
  }
};

// node_modules/@table-library/react-table-library/slicedToArray-c92cae3a.js
var t2 = function(r2) {
  if (Array.isArray(r2)) return r2;
};
var e = function(r2, t3) {
  if ("undefined" != typeof Symbol && Symbol.iterator in Object(r2)) {
    var e3 = [], n3 = true, o2 = false, a2 = void 0;
    try {
      for (var i, u = r2[Symbol.iterator](); !(n3 = (i = u.next()).done) && (e3.push(i.value), !t3 || e3.length !== t3); n3 = true) ;
    } catch (r3) {
      o2 = true, a2 = r3;
    } finally {
      try {
        n3 || null == u.return || u.return();
      } finally {
        if (o2) throw a2;
      }
    }
    return e3;
  }
};
var n2 = n;
var o = function() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
};
var a = function(r2, a2) {
  return t2(r2) || e(r2, a2) || n2(r2, a2) || o();
};

// node_modules/@table-library/react-table-library/defineProperty-9f9de5d0.js
var e2 = function(e3, r2, n3) {
  return r2 in e3 ? Object.defineProperty(e3, r2, { value: n3, enumerable: true, configurable: true, writable: true }) : e3[r2] = n3, e3;
};

export {
  r,
  n,
  a,
  e2 as e
};
//# sourceMappingURL=chunk-DM533J3Z.js.map
