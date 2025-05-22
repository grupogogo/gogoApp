import {
  _extends
} from "./chunk-HQ6ZTAWL.js";
import {
  require_react_is
} from "./chunk-UJE42DUN.js";
import {
  e,
  n,
  r
} from "./chunk-DM533J3Z.js";
import {
  require_react
} from "./chunk-W4EHDCLL.js";
import {
  __commonJS,
  __toESM
} from "./chunk-EWTE5DHJ.js";

// node_modules/hoist-non-react-statics/dist/hoist-non-react-statics.cjs.js
var require_hoist_non_react_statics_cjs = __commonJS({
  "node_modules/hoist-non-react-statics/dist/hoist-non-react-statics.cjs.js"(exports, module) {
    "use strict";
    var reactIs = require_react_is();
    var REACT_STATICS = {
      childContextTypes: true,
      contextType: true,
      contextTypes: true,
      defaultProps: true,
      displayName: true,
      getDefaultProps: true,
      getDerivedStateFromError: true,
      getDerivedStateFromProps: true,
      mixins: true,
      propTypes: true,
      type: true
    };
    var KNOWN_STATICS = {
      name: true,
      length: true,
      prototype: true,
      caller: true,
      callee: true,
      arguments: true,
      arity: true
    };
    var FORWARD_REF_STATICS = {
      "$$typeof": true,
      render: true,
      defaultProps: true,
      displayName: true,
      propTypes: true
    };
    var MEMO_STATICS = {
      "$$typeof": true,
      compare: true,
      defaultProps: true,
      displayName: true,
      propTypes: true,
      type: true
    };
    var TYPE_STATICS = {};
    TYPE_STATICS[reactIs.ForwardRef] = FORWARD_REF_STATICS;
    TYPE_STATICS[reactIs.Memo] = MEMO_STATICS;
    function getStatics(component) {
      if (reactIs.isMemo(component)) {
        return MEMO_STATICS;
      }
      return TYPE_STATICS[component["$$typeof"]] || REACT_STATICS;
    }
    var defineProperty = Object.defineProperty;
    var getOwnPropertyNames = Object.getOwnPropertyNames;
    var getOwnPropertySymbols = Object.getOwnPropertySymbols;
    var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    var getPrototypeOf = Object.getPrototypeOf;
    var objectPrototype = Object.prototype;
    function hoistNonReactStatics2(targetComponent, sourceComponent, blacklist) {
      if (typeof sourceComponent !== "string") {
        if (objectPrototype) {
          var inheritedComponent = getPrototypeOf(sourceComponent);
          if (inheritedComponent && inheritedComponent !== objectPrototype) {
            hoistNonReactStatics2(targetComponent, inheritedComponent, blacklist);
          }
        }
        var keys = getOwnPropertyNames(sourceComponent);
        if (getOwnPropertySymbols) {
          keys = keys.concat(getOwnPropertySymbols(sourceComponent));
        }
        var targetStatics = getStatics(targetComponent);
        var sourceStatics = getStatics(sourceComponent);
        for (var i3 = 0; i3 < keys.length; ++i3) {
          var key = keys[i3];
          if (!KNOWN_STATICS[key] && !(blacklist && blacklist[key]) && !(sourceStatics && sourceStatics[key]) && !(targetStatics && targetStatics[key])) {
            var descriptor = getOwnPropertyDescriptor(sourceComponent, key);
            try {
              defineProperty(targetComponent, key, descriptor);
            } catch (e5) {
            }
          }
        }
      }
      return targetComponent;
    }
    module.exports = hoistNonReactStatics2;
  }
});

// node_modules/@emotion/react/dist/emotion-element-489459f2.browser.development.esm.js
var React2 = __toESM(require_react());
var import_react = __toESM(require_react());

// node_modules/@emotion/sheet/dist/emotion-sheet.development.esm.js
var isDevelopment = true;
function sheetForTag(tag) {
  if (tag.sheet) {
    return tag.sheet;
  }
  for (var i3 = 0; i3 < document.styleSheets.length; i3++) {
    if (document.styleSheets[i3].ownerNode === tag) {
      return document.styleSheets[i3];
    }
  }
  return void 0;
}
function createStyleElement(options) {
  var tag = document.createElement("style");
  tag.setAttribute("data-emotion", options.key);
  if (options.nonce !== void 0) {
    tag.setAttribute("nonce", options.nonce);
  }
  tag.appendChild(document.createTextNode(""));
  tag.setAttribute("data-s", "");
  return tag;
}
var StyleSheet = function() {
  function StyleSheet2(options) {
    var _this = this;
    this._insertTag = function(tag) {
      var before;
      if (_this.tags.length === 0) {
        if (_this.insertionPoint) {
          before = _this.insertionPoint.nextSibling;
        } else if (_this.prepend) {
          before = _this.container.firstChild;
        } else {
          before = _this.before;
        }
      } else {
        before = _this.tags[_this.tags.length - 1].nextSibling;
      }
      _this.container.insertBefore(tag, before);
      _this.tags.push(tag);
    };
    this.isSpeedy = options.speedy === void 0 ? !isDevelopment : options.speedy;
    this.tags = [];
    this.ctr = 0;
    this.nonce = options.nonce;
    this.key = options.key;
    this.container = options.container;
    this.prepend = options.prepend;
    this.insertionPoint = options.insertionPoint;
    this.before = null;
  }
  var _proto = StyleSheet2.prototype;
  _proto.hydrate = function hydrate(nodes) {
    nodes.forEach(this._insertTag);
  };
  _proto.insert = function insert(rule) {
    if (this.ctr % (this.isSpeedy ? 65e3 : 1) === 0) {
      this._insertTag(createStyleElement(this));
    }
    var tag = this.tags[this.tags.length - 1];
    {
      var isImportRule3 = rule.charCodeAt(0) === 64 && rule.charCodeAt(1) === 105;
      if (isImportRule3 && this._alreadyInsertedOrderInsensitiveRule) {
        console.error("You're attempting to insert the following rule:\n" + rule + "\n\n`@import` rules must be before all other types of rules in a stylesheet but other rules have already been inserted. Please ensure that `@import` rules are before all other rules.");
      }
      this._alreadyInsertedOrderInsensitiveRule = this._alreadyInsertedOrderInsensitiveRule || !isImportRule3;
    }
    if (this.isSpeedy) {
      var sheet = sheetForTag(tag);
      try {
        sheet.insertRule(rule, sheet.cssRules.length);
      } catch (e5) {
        if (!/:(-moz-placeholder|-moz-focus-inner|-moz-focusring|-ms-input-placeholder|-moz-read-write|-moz-read-only|-ms-clear|-ms-expand|-ms-reveal){/.test(rule)) {
          console.error('There was a problem inserting the following rule: "' + rule + '"', e5);
        }
      }
    } else {
      tag.appendChild(document.createTextNode(rule));
    }
    this.ctr++;
  };
  _proto.flush = function flush() {
    this.tags.forEach(function(tag) {
      var _tag$parentNode;
      return (_tag$parentNode = tag.parentNode) == null ? void 0 : _tag$parentNode.removeChild(tag);
    });
    this.tags = [];
    this.ctr = 0;
    {
      this._alreadyInsertedOrderInsensitiveRule = false;
    }
  };
  return StyleSheet2;
}();

// node_modules/stylis/src/Enum.js
var MS = "-ms-";
var MOZ = "-moz-";
var WEBKIT = "-webkit-";
var COMMENT = "comm";
var RULESET = "rule";
var DECLARATION = "decl";
var IMPORT = "@import";
var KEYFRAMES = "@keyframes";
var LAYER = "@layer";

// node_modules/stylis/src/Utility.js
var abs = Math.abs;
var from = String.fromCharCode;
var assign = Object.assign;
function hash(value, length2) {
  return charat(value, 0) ^ 45 ? (((length2 << 2 ^ charat(value, 0)) << 2 ^ charat(value, 1)) << 2 ^ charat(value, 2)) << 2 ^ charat(value, 3) : 0;
}
function trim(value) {
  return value.trim();
}
function match(value, pattern) {
  return (value = pattern.exec(value)) ? value[0] : value;
}
function replace(value, pattern, replacement) {
  return value.replace(pattern, replacement);
}
function indexof(value, search) {
  return value.indexOf(search);
}
function charat(value, index) {
  return value.charCodeAt(index) | 0;
}
function substr(value, begin, end) {
  return value.slice(begin, end);
}
function strlen(value) {
  return value.length;
}
function sizeof(value) {
  return value.length;
}
function append(value, array) {
  return array.push(value), value;
}
function combine(array, callback) {
  return array.map(callback).join("");
}

// node_modules/stylis/src/Tokenizer.js
var line = 1;
var column = 1;
var length = 0;
var position = 0;
var character = 0;
var characters = "";
function node(value, root, parent, type, props, children, length2) {
  return { value, root, parent, type, props, children, line, column, length: length2, return: "" };
}
function copy(root, props) {
  return assign(node("", null, null, "", null, null, 0), root, { length: -root.length }, props);
}
function char() {
  return character;
}
function prev() {
  character = position > 0 ? charat(characters, --position) : 0;
  if (column--, character === 10)
    column = 1, line--;
  return character;
}
function next() {
  character = position < length ? charat(characters, position++) : 0;
  if (column++, character === 10)
    column = 1, line++;
  return character;
}
function peek() {
  return charat(characters, position);
}
function caret() {
  return position;
}
function slice(begin, end) {
  return substr(characters, begin, end);
}
function token(type) {
  switch (type) {
    case 0:
    case 9:
    case 10:
    case 13:
    case 32:
      return 5;
    case 33:
    case 43:
    case 44:
    case 47:
    case 62:
    case 64:
    case 126:
    case 59:
    case 123:
    case 125:
      return 4;
    case 58:
      return 3;
    case 34:
    case 39:
    case 40:
    case 91:
      return 2;
    case 41:
    case 93:
      return 1;
  }
  return 0;
}
function alloc(value) {
  return line = column = 1, length = strlen(characters = value), position = 0, [];
}
function dealloc(value) {
  return characters = "", value;
}
function delimit(type) {
  return trim(slice(position - 1, delimiter(type === 91 ? type + 2 : type === 40 ? type + 1 : type)));
}
function whitespace(type) {
  while (character = peek())
    if (character < 33)
      next();
    else
      break;
  return token(type) > 2 || token(character) > 3 ? "" : " ";
}
function escaping(index, count) {
  while (--count && next())
    if (character < 48 || character > 102 || character > 57 && character < 65 || character > 70 && character < 97)
      break;
  return slice(index, caret() + (count < 6 && peek() == 32 && next() == 32));
}
function delimiter(type) {
  while (next())
    switch (character) {
      case type:
        return position;
      case 34:
      case 39:
        if (type !== 34 && type !== 39)
          delimiter(character);
        break;
      case 40:
        if (type === 41)
          delimiter(type);
        break;
      case 92:
        next();
        break;
    }
  return position;
}
function commenter(type, index) {
  while (next())
    if (type + character === 47 + 10)
      break;
    else if (type + character === 42 + 42 && peek() === 47)
      break;
  return "/*" + slice(index, position - 1) + "*" + from(type === 47 ? type : next());
}
function identifier(index) {
  while (!token(peek()))
    next();
  return slice(index, position);
}

// node_modules/stylis/src/Parser.js
function compile(value) {
  return dealloc(parse("", null, null, null, [""], value = alloc(value), 0, [0], value));
}
function parse(value, root, parent, rule, rules, rulesets, pseudo, points, declarations) {
  var index = 0;
  var offset = 0;
  var length2 = pseudo;
  var atrule = 0;
  var property = 0;
  var previous = 0;
  var variable = 1;
  var scanning = 1;
  var ampersand = 1;
  var character2 = 0;
  var type = "";
  var props = rules;
  var children = rulesets;
  var reference = rule;
  var characters2 = type;
  while (scanning)
    switch (previous = character2, character2 = next()) {
      case 40:
        if (previous != 108 && charat(characters2, length2 - 1) == 58) {
          if (indexof(characters2 += replace(delimit(character2), "&", "&\f"), "&\f") != -1)
            ampersand = -1;
          break;
        }
      case 34:
      case 39:
      case 91:
        characters2 += delimit(character2);
        break;
      case 9:
      case 10:
      case 13:
      case 32:
        characters2 += whitespace(previous);
        break;
      case 92:
        characters2 += escaping(caret() - 1, 7);
        continue;
      case 47:
        switch (peek()) {
          case 42:
          case 47:
            append(comment(commenter(next(), caret()), root, parent), declarations);
            break;
          default:
            characters2 += "/";
        }
        break;
      case 123 * variable:
        points[index++] = strlen(characters2) * ampersand;
      case 125 * variable:
      case 59:
      case 0:
        switch (character2) {
          case 0:
          case 125:
            scanning = 0;
          case 59 + offset:
            if (ampersand == -1) characters2 = replace(characters2, /\f/g, "");
            if (property > 0 && strlen(characters2) - length2)
              append(property > 32 ? declaration(characters2 + ";", rule, parent, length2 - 1) : declaration(replace(characters2, " ", "") + ";", rule, parent, length2 - 2), declarations);
            break;
          case 59:
            characters2 += ";";
          default:
            append(reference = ruleset(characters2, root, parent, index, offset, rules, points, type, props = [], children = [], length2), rulesets);
            if (character2 === 123)
              if (offset === 0)
                parse(characters2, root, reference, reference, props, rulesets, length2, points, children);
              else
                switch (atrule === 99 && charat(characters2, 3) === 110 ? 100 : atrule) {
                  case 100:
                  case 108:
                  case 109:
                  case 115:
                    parse(value, reference, reference, rule && append(ruleset(value, reference, reference, 0, 0, rules, points, type, rules, props = [], length2), children), rules, children, length2, points, rule ? props : children);
                    break;
                  default:
                    parse(characters2, reference, reference, reference, [""], children, 0, points, children);
                }
        }
        index = offset = property = 0, variable = ampersand = 1, type = characters2 = "", length2 = pseudo;
        break;
      case 58:
        length2 = 1 + strlen(characters2), property = previous;
      default:
        if (variable < 1) {
          if (character2 == 123)
            --variable;
          else if (character2 == 125 && variable++ == 0 && prev() == 125)
            continue;
        }
        switch (characters2 += from(character2), character2 * variable) {
          case 38:
            ampersand = offset > 0 ? 1 : (characters2 += "\f", -1);
            break;
          case 44:
            points[index++] = (strlen(characters2) - 1) * ampersand, ampersand = 1;
            break;
          case 64:
            if (peek() === 45)
              characters2 += delimit(next());
            atrule = peek(), offset = length2 = strlen(type = characters2 += identifier(caret())), character2++;
            break;
          case 45:
            if (previous === 45 && strlen(characters2) == 2)
              variable = 0;
        }
    }
  return rulesets;
}
function ruleset(value, root, parent, index, offset, rules, points, type, props, children, length2) {
  var post = offset - 1;
  var rule = offset === 0 ? rules : [""];
  var size = sizeof(rule);
  for (var i3 = 0, j = 0, k = 0; i3 < index; ++i3)
    for (var x3 = 0, y3 = substr(value, post + 1, post = abs(j = points[i3])), z = value; x3 < size; ++x3)
      if (z = trim(j > 0 ? rule[x3] + " " + y3 : replace(y3, /&\f/g, rule[x3])))
        props[k++] = z;
  return node(value, root, parent, offset === 0 ? RULESET : type, props, children, length2);
}
function comment(value, root, parent) {
  return node(value, root, parent, COMMENT, from(char()), substr(value, 2, -2), 0);
}
function declaration(value, root, parent, length2) {
  return node(value, root, parent, DECLARATION, substr(value, 0, length2), substr(value, length2 + 1, -1), length2);
}

// node_modules/stylis/src/Serializer.js
function serialize(children, callback) {
  var output = "";
  var length2 = sizeof(children);
  for (var i3 = 0; i3 < length2; i3++)
    output += callback(children[i3], i3, children, callback) || "";
  return output;
}
function stringify(element, index, children, callback) {
  switch (element.type) {
    case LAYER:
      if (element.children.length) break;
    case IMPORT:
    case DECLARATION:
      return element.return = element.return || element.value;
    case COMMENT:
      return "";
    case KEYFRAMES:
      return element.return = element.value + "{" + serialize(element.children, callback) + "}";
    case RULESET:
      element.value = element.props.join(",");
  }
  return strlen(children = serialize(element.children, callback)) ? element.return = element.value + "{" + children + "}" : "";
}

// node_modules/stylis/src/Middleware.js
function middleware(collection) {
  var length2 = sizeof(collection);
  return function(element, index, children, callback) {
    var output = "";
    for (var i3 = 0; i3 < length2; i3++)
      output += collection[i3](element, index, children, callback) || "";
    return output;
  };
}

// node_modules/@emotion/weak-memoize/dist/emotion-weak-memoize.esm.js
var weakMemoize = function weakMemoize2(func) {
  var cache = /* @__PURE__ */ new WeakMap();
  return function(arg) {
    if (cache.has(arg)) {
      return cache.get(arg);
    }
    var ret = func(arg);
    cache.set(arg, ret);
    return ret;
  };
};

// node_modules/@emotion/memoize/dist/emotion-memoize.esm.js
function memoize(fn) {
  var cache = /* @__PURE__ */ Object.create(null);
  return function(arg) {
    if (cache[arg] === void 0) cache[arg] = fn(arg);
    return cache[arg];
  };
}

// node_modules/@emotion/cache/dist/emotion-cache.browser.development.esm.js
var identifierWithPointTracking = function identifierWithPointTracking2(begin, points, index) {
  var previous = 0;
  var character2 = 0;
  while (true) {
    previous = character2;
    character2 = peek();
    if (previous === 38 && character2 === 12) {
      points[index] = 1;
    }
    if (token(character2)) {
      break;
    }
    next();
  }
  return slice(begin, position);
};
var toRules = function toRules2(parsed, points) {
  var index = -1;
  var character2 = 44;
  do {
    switch (token(character2)) {
      case 0:
        if (character2 === 38 && peek() === 12) {
          points[index] = 1;
        }
        parsed[index] += identifierWithPointTracking(position - 1, points, index);
        break;
      case 2:
        parsed[index] += delimit(character2);
        break;
      case 4:
        if (character2 === 44) {
          parsed[++index] = peek() === 58 ? "&\f" : "";
          points[index] = parsed[index].length;
          break;
        }
      default:
        parsed[index] += from(character2);
    }
  } while (character2 = next());
  return parsed;
};
var getRules = function getRules2(value, points) {
  return dealloc(toRules(alloc(value), points));
};
var fixedElements = /* @__PURE__ */ new WeakMap();
var compat = function compat2(element) {
  if (element.type !== "rule" || !element.parent || // positive .length indicates that this rule contains pseudo
  // negative .length indicates that this rule has been already prefixed
  element.length < 1) {
    return;
  }
  var value = element.value;
  var parent = element.parent;
  var isImplicitRule = element.column === parent.column && element.line === parent.line;
  while (parent.type !== "rule") {
    parent = parent.parent;
    if (!parent) return;
  }
  if (element.props.length === 1 && value.charCodeAt(0) !== 58 && !fixedElements.get(parent)) {
    return;
  }
  if (isImplicitRule) {
    return;
  }
  fixedElements.set(element, true);
  var points = [];
  var rules = getRules(value, points);
  var parentRules = parent.props;
  for (var i3 = 0, k = 0; i3 < rules.length; i3++) {
    for (var j = 0; j < parentRules.length; j++, k++) {
      element.props[k] = points[i3] ? rules[i3].replace(/&\f/g, parentRules[j]) : parentRules[j] + " " + rules[i3];
    }
  }
};
var removeLabel = function removeLabel2(element) {
  if (element.type === "decl") {
    var value = element.value;
    if (
      // charcode for l
      value.charCodeAt(0) === 108 && // charcode for b
      value.charCodeAt(2) === 98
    ) {
      element["return"] = "";
      element.value = "";
    }
  }
};
var ignoreFlag = "emotion-disable-server-rendering-unsafe-selector-warning-please-do-not-use-this-the-warning-exists-for-a-reason";
var isIgnoringComment = function isIgnoringComment2(element) {
  return element.type === "comm" && element.children.indexOf(ignoreFlag) > -1;
};
var createUnsafeSelectorsAlarm = function createUnsafeSelectorsAlarm2(cache) {
  return function(element, index, children) {
    if (element.type !== "rule" || cache.compat) return;
    var unsafePseudoClasses = element.value.match(/(:first|:nth|:nth-last)-child/g);
    if (unsafePseudoClasses) {
      var isNested = !!element.parent;
      var commentContainer = isNested ? element.parent.children : (
        // global rule at the root level
        children
      );
      for (var i3 = commentContainer.length - 1; i3 >= 0; i3--) {
        var node2 = commentContainer[i3];
        if (node2.line < element.line) {
          break;
        }
        if (node2.column < element.column) {
          if (isIgnoringComment(node2)) {
            return;
          }
          break;
        }
      }
      unsafePseudoClasses.forEach(function(unsafePseudoClass) {
        console.error('The pseudo class "' + unsafePseudoClass + '" is potentially unsafe when doing server-side rendering. Try changing it to "' + unsafePseudoClass.split("-child")[0] + '-of-type".');
      });
    }
  };
};
var isImportRule = function isImportRule2(element) {
  return element.type.charCodeAt(1) === 105 && element.type.charCodeAt(0) === 64;
};
var isPrependedWithRegularRules = function isPrependedWithRegularRules2(index, children) {
  for (var i3 = index - 1; i3 >= 0; i3--) {
    if (!isImportRule(children[i3])) {
      return true;
    }
  }
  return false;
};
var nullifyElement = function nullifyElement2(element) {
  element.type = "";
  element.value = "";
  element["return"] = "";
  element.children = "";
  element.props = "";
};
var incorrectImportAlarm = function incorrectImportAlarm2(element, index, children) {
  if (!isImportRule(element)) {
    return;
  }
  if (element.parent) {
    console.error("`@import` rules can't be nested inside other rules. Please move it to the top level and put it before regular rules. Keep in mind that they can only be used within global styles.");
    nullifyElement(element);
  } else if (isPrependedWithRegularRules(index, children)) {
    console.error("`@import` rules can't be after other rules. Please put your `@import` rules before your other rules.");
    nullifyElement(element);
  }
};
function prefix2(value, length2) {
  switch (hash(value, length2)) {
    case 5103:
      return WEBKIT + "print-" + value + value;
    case 5737:
    case 4201:
    case 3177:
    case 3433:
    case 1641:
    case 4457:
    case 2921:
    case 5572:
    case 6356:
    case 5844:
    case 3191:
    case 6645:
    case 3005:
    case 6391:
    case 5879:
    case 5623:
    case 6135:
    case 4599:
    case 4855:
    case 4215:
    case 6389:
    case 5109:
    case 5365:
    case 5621:
    case 3829:
      return WEBKIT + value + value;
    case 5349:
    case 4246:
    case 4810:
    case 6968:
    case 2756:
      return WEBKIT + value + MOZ + value + MS + value + value;
    case 6828:
    case 4268:
      return WEBKIT + value + MS + value + value;
    case 6165:
      return WEBKIT + value + MS + "flex-" + value + value;
    case 5187:
      return WEBKIT + value + replace(value, /(\w+).+(:[^]+)/, WEBKIT + "box-$1$2" + MS + "flex-$1$2") + value;
    case 5443:
      return WEBKIT + value + MS + "flex-item-" + replace(value, /flex-|-self/, "") + value;
    case 4675:
      return WEBKIT + value + MS + "flex-line-pack" + replace(value, /align-content|flex-|-self/, "") + value;
    case 5548:
      return WEBKIT + value + MS + replace(value, "shrink", "negative") + value;
    case 5292:
      return WEBKIT + value + MS + replace(value, "basis", "preferred-size") + value;
    case 6060:
      return WEBKIT + "box-" + replace(value, "-grow", "") + WEBKIT + value + MS + replace(value, "grow", "positive") + value;
    case 4554:
      return WEBKIT + replace(value, /([^-])(transform)/g, "$1" + WEBKIT + "$2") + value;
    case 6187:
      return replace(replace(replace(value, /(zoom-|grab)/, WEBKIT + "$1"), /(image-set)/, WEBKIT + "$1"), value, "") + value;
    case 5495:
    case 3959:
      return replace(value, /(image-set\([^]*)/, WEBKIT + "$1$`$1");
    case 4968:
      return replace(replace(value, /(.+:)(flex-)?(.*)/, WEBKIT + "box-pack:$3" + MS + "flex-pack:$3"), /s.+-b[^;]+/, "justify") + WEBKIT + value + value;
    case 4095:
    case 3583:
    case 4068:
    case 2532:
      return replace(value, /(.+)-inline(.+)/, WEBKIT + "$1$2") + value;
    case 8116:
    case 7059:
    case 5753:
    case 5535:
    case 5445:
    case 5701:
    case 4933:
    case 4677:
    case 5533:
    case 5789:
    case 5021:
    case 4765:
      if (strlen(value) - 1 - length2 > 6) switch (charat(value, length2 + 1)) {
        case 109:
          if (charat(value, length2 + 4) !== 45) break;
        case 102:
          return replace(value, /(.+:)(.+)-([^]+)/, "$1" + WEBKIT + "$2-$3$1" + MOZ + (charat(value, length2 + 3) == 108 ? "$3" : "$2-$3")) + value;
        case 115:
          return ~indexof(value, "stretch") ? prefix2(replace(value, "stretch", "fill-available"), length2) + value : value;
      }
      break;
    case 4949:
      if (charat(value, length2 + 1) !== 115) break;
    case 6444:
      switch (charat(value, strlen(value) - 3 - (~indexof(value, "!important") && 10))) {
        case 107:
          return replace(value, ":", ":" + WEBKIT) + value;
        case 101:
          return replace(value, /(.+:)([^;!]+)(;|!.+)?/, "$1" + WEBKIT + (charat(value, 14) === 45 ? "inline-" : "") + "box$3$1" + WEBKIT + "$2$3$1" + MS + "$2box$3") + value;
      }
      break;
    case 5936:
      switch (charat(value, length2 + 11)) {
        case 114:
          return WEBKIT + value + MS + replace(value, /[svh]\w+-[tblr]{2}/, "tb") + value;
        case 108:
          return WEBKIT + value + MS + replace(value, /[svh]\w+-[tblr]{2}/, "tb-rl") + value;
        case 45:
          return WEBKIT + value + MS + replace(value, /[svh]\w+-[tblr]{2}/, "lr") + value;
      }
      return WEBKIT + value + MS + value + value;
  }
  return value;
}
var prefixer = function prefixer2(element, index, children, callback) {
  if (element.length > -1) {
    if (!element["return"]) switch (element.type) {
      case DECLARATION:
        element["return"] = prefix2(element.value, element.length);
        break;
      case KEYFRAMES:
        return serialize([copy(element, {
          value: replace(element.value, "@", "@" + WEBKIT)
        })], callback);
      case RULESET:
        if (element.length) return combine(element.props, function(value) {
          switch (match(value, /(::plac\w+|:read-\w+)/)) {
            case ":read-only":
            case ":read-write":
              return serialize([copy(element, {
                props: [replace(value, /:(read-\w+)/, ":" + MOZ + "$1")]
              })], callback);
            case "::placeholder":
              return serialize([copy(element, {
                props: [replace(value, /:(plac\w+)/, ":" + WEBKIT + "input-$1")]
              }), copy(element, {
                props: [replace(value, /:(plac\w+)/, ":" + MOZ + "$1")]
              }), copy(element, {
                props: [replace(value, /:(plac\w+)/, MS + "input-$1")]
              })], callback);
          }
          return "";
        });
    }
  }
};
var defaultStylisPlugins = [prefixer];
var getSourceMap;
{
  sourceMapPattern = /\/\*#\ssourceMappingURL=data:application\/json;\S+\s+\*\//g;
  getSourceMap = function getSourceMap2(styles) {
    var matches = styles.match(sourceMapPattern);
    if (!matches) return;
    return matches[matches.length - 1];
  };
}
var sourceMapPattern;
var createCache = function createCache2(options) {
  var key = options.key;
  if (!key) {
    throw new Error("You have to configure `key` for your cache. Please make sure it's unique (and not equal to 'css') as it's used for linking styles to your cache.\nIf multiple caches share the same key they might \"fight\" for each other's style elements.");
  }
  if (key === "css") {
    var ssrStyles = document.querySelectorAll("style[data-emotion]:not([data-s])");
    Array.prototype.forEach.call(ssrStyles, function(node2) {
      var dataEmotionAttribute = node2.getAttribute("data-emotion");
      if (dataEmotionAttribute.indexOf(" ") === -1) {
        return;
      }
      document.head.appendChild(node2);
      node2.setAttribute("data-s", "");
    });
  }
  var stylisPlugins = options.stylisPlugins || defaultStylisPlugins;
  {
    if (/[^a-z-]/.test(key)) {
      throw new Error('Emotion key must only contain lower case alphabetical characters and - but "' + key + '" was passed');
    }
  }
  var inserted = {};
  var container;
  var nodesToHydrate = [];
  {
    container = options.container || document.head;
    Array.prototype.forEach.call(
      // this means we will ignore elements which don't have a space in them which
      // means that the style elements we're looking at are only Emotion 11 server-rendered style elements
      document.querySelectorAll('style[data-emotion^="' + key + ' "]'),
      function(node2) {
        var attrib = node2.getAttribute("data-emotion").split(" ");
        for (var i3 = 1; i3 < attrib.length; i3++) {
          inserted[attrib[i3]] = true;
        }
        nodesToHydrate.push(node2);
      }
    );
  }
  var _insert;
  var omnipresentPlugins = [compat, removeLabel];
  {
    omnipresentPlugins.push(createUnsafeSelectorsAlarm({
      get compat() {
        return cache.compat;
      }
    }), incorrectImportAlarm);
  }
  {
    var currentSheet;
    var finalizingPlugins = [stringify, function(element) {
      if (!element.root) {
        if (element["return"]) {
          currentSheet.insert(element["return"]);
        } else if (element.value && element.type !== COMMENT) {
          currentSheet.insert(element.value + "{}");
        }
      }
    }];
    var serializer = middleware(omnipresentPlugins.concat(stylisPlugins, finalizingPlugins));
    var stylis = function stylis2(styles) {
      return serialize(compile(styles), serializer);
    };
    _insert = function insert(selector, serialized, sheet, shouldCache) {
      currentSheet = sheet;
      if (getSourceMap) {
        var sourceMap = getSourceMap(serialized.styles);
        if (sourceMap) {
          currentSheet = {
            insert: function insert2(rule) {
              sheet.insert(rule + sourceMap);
            }
          };
        }
      }
      stylis(selector ? selector + "{" + serialized.styles + "}" : serialized.styles);
      if (shouldCache) {
        cache.inserted[serialized.name] = true;
      }
    };
  }
  var cache = {
    key,
    sheet: new StyleSheet({
      key,
      container,
      nonce: options.nonce,
      speedy: options.speedy,
      prepend: options.prepend,
      insertionPoint: options.insertionPoint
    }),
    nonce: options.nonce,
    inserted,
    registered: {},
    insert: _insert
  };
  cache.sheet.hydrate(nodesToHydrate);
  return cache;
};

// node_modules/@emotion/react/_isolated-hnrs/dist/emotion-react-_isolated-hnrs.browser.development.esm.js
var import_hoist_non_react_statics = __toESM(require_hoist_non_react_statics_cjs());

// node_modules/@emotion/utils/dist/emotion-utils.browser.esm.js
var isBrowser = true;
function getRegisteredStyles(registered, registeredStyles, classNames) {
  var rawClassName = "";
  classNames.split(" ").forEach(function(className) {
    if (registered[className] !== void 0) {
      registeredStyles.push(registered[className] + ";");
    } else if (className) {
      rawClassName += className + " ";
    }
  });
  return rawClassName;
}
var registerStyles = function registerStyles2(cache, serialized, isStringTag) {
  var className = cache.key + "-" + serialized.name;
  if (
    // we only need to add the styles to the registered cache if the
    // class name could be used further down
    // the tree but if it's a string tag, we know it won't
    // so we don't have to add it to registered cache.
    // this improves memory usage since we can avoid storing the whole style string
    (isStringTag === false || // we need to always store it if we're in compat mode and
    // in node since emotion-server relies on whether a style is in
    // the registered cache to know whether a style is global or not
    // also, note that this check will be dead code eliminated in the browser
    isBrowser === false) && cache.registered[className] === void 0
  ) {
    cache.registered[className] = serialized.styles;
  }
};
var insertStyles = function insertStyles2(cache, serialized, isStringTag) {
  registerStyles(cache, serialized, isStringTag);
  var className = cache.key + "-" + serialized.name;
  if (cache.inserted[serialized.name] === void 0) {
    var current = serialized;
    do {
      cache.insert(serialized === current ? "." + className : "", current, cache.sheet, true);
      current = current.next;
    } while (current !== void 0);
  }
};

// node_modules/@emotion/hash/dist/emotion-hash.esm.js
function murmur2(str) {
  var h2 = 0;
  var k, i3 = 0, len = str.length;
  for (; len >= 4; ++i3, len -= 4) {
    k = str.charCodeAt(i3) & 255 | (str.charCodeAt(++i3) & 255) << 8 | (str.charCodeAt(++i3) & 255) << 16 | (str.charCodeAt(++i3) & 255) << 24;
    k = /* Math.imul(k, m): */
    (k & 65535) * 1540483477 + ((k >>> 16) * 59797 << 16);
    k ^= /* k >>> r: */
    k >>> 24;
    h2 = /* Math.imul(k, m): */
    (k & 65535) * 1540483477 + ((k >>> 16) * 59797 << 16) ^ /* Math.imul(h, m): */
    (h2 & 65535) * 1540483477 + ((h2 >>> 16) * 59797 << 16);
  }
  switch (len) {
    case 3:
      h2 ^= (str.charCodeAt(i3 + 2) & 255) << 16;
    case 2:
      h2 ^= (str.charCodeAt(i3 + 1) & 255) << 8;
    case 1:
      h2 ^= str.charCodeAt(i3) & 255;
      h2 = /* Math.imul(h, m): */
      (h2 & 65535) * 1540483477 + ((h2 >>> 16) * 59797 << 16);
  }
  h2 ^= h2 >>> 13;
  h2 = /* Math.imul(h, m): */
  (h2 & 65535) * 1540483477 + ((h2 >>> 16) * 59797 << 16);
  return ((h2 ^ h2 >>> 15) >>> 0).toString(36);
}

// node_modules/@emotion/unitless/dist/emotion-unitless.esm.js
var unitlessKeys = {
  animationIterationCount: 1,
  aspectRatio: 1,
  borderImageOutset: 1,
  borderImageSlice: 1,
  borderImageWidth: 1,
  boxFlex: 1,
  boxFlexGroup: 1,
  boxOrdinalGroup: 1,
  columnCount: 1,
  columns: 1,
  flex: 1,
  flexGrow: 1,
  flexPositive: 1,
  flexShrink: 1,
  flexNegative: 1,
  flexOrder: 1,
  gridRow: 1,
  gridRowEnd: 1,
  gridRowSpan: 1,
  gridRowStart: 1,
  gridColumn: 1,
  gridColumnEnd: 1,
  gridColumnSpan: 1,
  gridColumnStart: 1,
  msGridRow: 1,
  msGridRowSpan: 1,
  msGridColumn: 1,
  msGridColumnSpan: 1,
  fontWeight: 1,
  lineHeight: 1,
  opacity: 1,
  order: 1,
  orphans: 1,
  scale: 1,
  tabSize: 1,
  widows: 1,
  zIndex: 1,
  zoom: 1,
  WebkitLineClamp: 1,
  // SVG-related properties
  fillOpacity: 1,
  floodOpacity: 1,
  stopOpacity: 1,
  strokeDasharray: 1,
  strokeDashoffset: 1,
  strokeMiterlimit: 1,
  strokeOpacity: 1,
  strokeWidth: 1
};

// node_modules/@emotion/serialize/dist/emotion-serialize.development.esm.js
var isDevelopment2 = true;
var ILLEGAL_ESCAPE_SEQUENCE_ERROR = `You have illegal escape sequence in your template literal, most likely inside content's property value.
Because you write your CSS inside a JavaScript string you actually have to do double escaping, so for example "content: '\\00d7';" should become "content: '\\\\00d7';".
You can read more about this here:
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#ES2018_revision_of_illegal_escape_sequences`;
var UNDEFINED_AS_OBJECT_KEY_ERROR = "You have passed in falsy value as style object's key (can happen when in example you pass unexported component as computed key).";
var hyphenateRegex = /[A-Z]|^ms/g;
var animationRegex = /_EMO_([^_]+?)_([^]*?)_EMO_/g;
var isCustomProperty = function isCustomProperty2(property) {
  return property.charCodeAt(1) === 45;
};
var isProcessableValue = function isProcessableValue2(value) {
  return value != null && typeof value !== "boolean";
};
var processStyleName = memoize(function(styleName) {
  return isCustomProperty(styleName) ? styleName : styleName.replace(hyphenateRegex, "-$&").toLowerCase();
});
var processStyleValue = function processStyleValue2(key, value) {
  switch (key) {
    case "animation":
    case "animationName": {
      if (typeof value === "string") {
        return value.replace(animationRegex, function(match2, p1, p22) {
          cursor = {
            name: p1,
            styles: p22,
            next: cursor
          };
          return p1;
        });
      }
    }
  }
  if (unitlessKeys[key] !== 1 && !isCustomProperty(key) && typeof value === "number" && value !== 0) {
    return value + "px";
  }
  return value;
};
{
  contentValuePattern = /(var|attr|counters?|url|element|(((repeating-)?(linear|radial))|conic)-gradient)\(|(no-)?(open|close)-quote/;
  contentValues = ["normal", "none", "initial", "inherit", "unset"];
  oldProcessStyleValue = processStyleValue;
  msPattern = /^-ms-/;
  hyphenPattern = /-(.)/g;
  hyphenatedCache = {};
  processStyleValue = function processStyleValue3(key, value) {
    if (key === "content") {
      if (typeof value !== "string" || contentValues.indexOf(value) === -1 && !contentValuePattern.test(value) && (value.charAt(0) !== value.charAt(value.length - 1) || value.charAt(0) !== '"' && value.charAt(0) !== "'")) {
        throw new Error("You seem to be using a value for 'content' without quotes, try replacing it with `content: '\"" + value + "\"'`");
      }
    }
    var processed = oldProcessStyleValue(key, value);
    if (processed !== "" && !isCustomProperty(key) && key.indexOf("-") !== -1 && hyphenatedCache[key] === void 0) {
      hyphenatedCache[key] = true;
      console.error("Using kebab-case for css properties in objects is not supported. Did you mean " + key.replace(msPattern, "ms-").replace(hyphenPattern, function(str, _char) {
        return _char.toUpperCase();
      }) + "?");
    }
    return processed;
  };
}
var contentValuePattern;
var contentValues;
var oldProcessStyleValue;
var msPattern;
var hyphenPattern;
var hyphenatedCache;
var noComponentSelectorMessage = "Component selectors can only be used in conjunction with @emotion/babel-plugin, the swc Emotion plugin, or another Emotion-aware compiler transform.";
function handleInterpolation(mergedProps, registered, interpolation) {
  if (interpolation == null) {
    return "";
  }
  var componentSelector = interpolation;
  if (componentSelector.__emotion_styles !== void 0) {
    if (String(componentSelector) === "NO_COMPONENT_SELECTOR") {
      throw new Error(noComponentSelectorMessage);
    }
    return componentSelector;
  }
  switch (typeof interpolation) {
    case "boolean": {
      return "";
    }
    case "object": {
      var keyframes = interpolation;
      if (keyframes.anim === 1) {
        cursor = {
          name: keyframes.name,
          styles: keyframes.styles,
          next: cursor
        };
        return keyframes.name;
      }
      var serializedStyles = interpolation;
      if (serializedStyles.styles !== void 0) {
        var next2 = serializedStyles.next;
        if (next2 !== void 0) {
          while (next2 !== void 0) {
            cursor = {
              name: next2.name,
              styles: next2.styles,
              next: cursor
            };
            next2 = next2.next;
          }
        }
        var styles = serializedStyles.styles + ";";
        return styles;
      }
      return createStringFromObject(mergedProps, registered, interpolation);
    }
    case "function": {
      if (mergedProps !== void 0) {
        var previousCursor = cursor;
        var result = interpolation(mergedProps);
        cursor = previousCursor;
        return handleInterpolation(mergedProps, registered, result);
      } else {
        console.error("Functions that are interpolated in css calls will be stringified.\nIf you want to have a css call based on props, create a function that returns a css call like this\nlet dynamicStyle = (props) => css`color: ${props.color}`\nIt can be called directly with props or interpolated in a styled call like this\nlet SomeComponent = styled('div')`${dynamicStyle}`");
      }
      break;
    }
    case "string":
      {
        var matched = [];
        var replaced = interpolation.replace(animationRegex, function(_match, _p1, p22) {
          var fakeVarName = "animation" + matched.length;
          matched.push("const " + fakeVarName + " = keyframes`" + p22.replace(/^@keyframes animation-\w+/, "") + "`");
          return "${" + fakeVarName + "}";
        });
        if (matched.length) {
          console.error("`keyframes` output got interpolated into plain string, please wrap it with `css`.\n\nInstead of doing this:\n\n" + [].concat(matched, ["`" + replaced + "`"]).join("\n") + "\n\nYou should wrap it with `css` like this:\n\ncss`" + replaced + "`");
        }
      }
      break;
  }
  var asString = interpolation;
  if (registered == null) {
    return asString;
  }
  var cached = registered[asString];
  return cached !== void 0 ? cached : asString;
}
function createStringFromObject(mergedProps, registered, obj) {
  var string = "";
  if (Array.isArray(obj)) {
    for (var i3 = 0; i3 < obj.length; i3++) {
      string += handleInterpolation(mergedProps, registered, obj[i3]) + ";";
    }
  } else {
    for (var key in obj) {
      var value = obj[key];
      if (typeof value !== "object") {
        var asString = value;
        if (registered != null && registered[asString] !== void 0) {
          string += key + "{" + registered[asString] + "}";
        } else if (isProcessableValue(asString)) {
          string += processStyleName(key) + ":" + processStyleValue(key, asString) + ";";
        }
      } else {
        if (key === "NO_COMPONENT_SELECTOR" && isDevelopment2) {
          throw new Error(noComponentSelectorMessage);
        }
        if (Array.isArray(value) && typeof value[0] === "string" && (registered == null || registered[value[0]] === void 0)) {
          for (var _i = 0; _i < value.length; _i++) {
            if (isProcessableValue(value[_i])) {
              string += processStyleName(key) + ":" + processStyleValue(key, value[_i]) + ";";
            }
          }
        } else {
          var interpolated = handleInterpolation(mergedProps, registered, value);
          switch (key) {
            case "animation":
            case "animationName": {
              string += processStyleName(key) + ":" + interpolated + ";";
              break;
            }
            default: {
              if (key === "undefined") {
                console.error(UNDEFINED_AS_OBJECT_KEY_ERROR);
              }
              string += key + "{" + interpolated + "}";
            }
          }
        }
      }
    }
  }
  return string;
}
var labelPattern = /label:\s*([^\s;{]+)\s*(;|$)/g;
var cursor;
function serializeStyles(args, registered, mergedProps) {
  if (args.length === 1 && typeof args[0] === "object" && args[0] !== null && args[0].styles !== void 0) {
    return args[0];
  }
  var stringMode = true;
  var styles = "";
  cursor = void 0;
  var strings = args[0];
  if (strings == null || strings.raw === void 0) {
    stringMode = false;
    styles += handleInterpolation(mergedProps, registered, strings);
  } else {
    var asTemplateStringsArr = strings;
    if (asTemplateStringsArr[0] === void 0) {
      console.error(ILLEGAL_ESCAPE_SEQUENCE_ERROR);
    }
    styles += asTemplateStringsArr[0];
  }
  for (var i3 = 1; i3 < args.length; i3++) {
    styles += handleInterpolation(mergedProps, registered, args[i3]);
    if (stringMode) {
      var templateStringsArr = strings;
      if (templateStringsArr[i3] === void 0) {
        console.error(ILLEGAL_ESCAPE_SEQUENCE_ERROR);
      }
      styles += templateStringsArr[i3];
    }
  }
  labelPattern.lastIndex = 0;
  var identifierName = "";
  var match2;
  while ((match2 = labelPattern.exec(styles)) !== null) {
    identifierName += "-" + match2[1];
  }
  var name = murmur2(styles) + identifierName;
  {
    var devStyles = {
      name,
      styles,
      next: cursor,
      toString: function toString() {
        return "You have tried to stringify object returned from `css` function. It isn't supposed to be used directly (e.g. as value of the `className` prop), but rather handed to emotion so it can handle it (e.g. as value of `css` prop).";
      }
    };
    return devStyles;
  }
}

// node_modules/@emotion/use-insertion-effect-with-fallbacks/dist/emotion-use-insertion-effect-with-fallbacks.browser.esm.js
var React = __toESM(require_react());
var syncFallback = function syncFallback2(create) {
  return create();
};
var useInsertionEffect2 = React["useInsertionEffect"] ? React["useInsertionEffect"] : false;
var useInsertionEffectAlwaysWithSyncFallback = useInsertionEffect2 || syncFallback;
var useInsertionEffectWithLayoutFallback = useInsertionEffect2 || React.useLayoutEffect;

// node_modules/@emotion/react/dist/emotion-element-489459f2.browser.development.esm.js
var EmotionCacheContext = React2.createContext(
  // we're doing this to avoid preconstruct's dead code elimination in this one case
  // because this module is primarily intended for the browser and node
  // but it's also required in react native and similar environments sometimes
  // and we could have a special build just for that
  // but this is much easier and the native packages
  // might use a different theme context in the future anyway
  typeof HTMLElement !== "undefined" ? createCache({
    key: "css"
  }) : null
);
{
  EmotionCacheContext.displayName = "EmotionCacheContext";
}
var CacheProvider = EmotionCacheContext.Provider;
var withEmotionCache = function withEmotionCache2(func) {
  return (0, import_react.forwardRef)(function(props, ref) {
    var cache = (0, import_react.useContext)(EmotionCacheContext);
    return func(props, cache, ref);
  });
};
var ThemeContext = React2.createContext({});
{
  ThemeContext.displayName = "EmotionThemeContext";
}
var getTheme = function getTheme2(outerTheme, theme) {
  if (typeof theme === "function") {
    var mergedTheme = theme(outerTheme);
    if (mergedTheme == null || typeof mergedTheme !== "object" || Array.isArray(mergedTheme)) {
      throw new Error("[ThemeProvider] Please return an object from your theme function, i.e. theme={() => ({})}!");
    }
    return mergedTheme;
  }
  if (theme == null || typeof theme !== "object" || Array.isArray(theme)) {
    throw new Error("[ThemeProvider] Please make your theme prop a plain object");
  }
  return _extends({}, outerTheme, theme);
};
var createCacheWithTheme = weakMemoize(function(outerTheme) {
  return weakMemoize(function(theme) {
    return getTheme(outerTheme, theme);
  });
});
var hasOwn = {}.hasOwnProperty;
var getLastPart = function getLastPart2(functionName) {
  var parts = functionName.split(".");
  return parts[parts.length - 1];
};
var getFunctionNameFromStackTraceLine = function getFunctionNameFromStackTraceLine2(line2) {
  var match2 = /^\s+at\s+([A-Za-z0-9$.]+)\s/.exec(line2);
  if (match2) return getLastPart(match2[1]);
  match2 = /^([A-Za-z0-9$.]+)@/.exec(line2);
  if (match2) return getLastPart(match2[1]);
  return void 0;
};
var internalReactFunctionNames = /* @__PURE__ */ new Set(["renderWithHooks", "processChild", "finishClassComponent", "renderToString"]);
var sanitizeIdentifier = function sanitizeIdentifier2(identifier2) {
  return identifier2.replace(/\$/g, "-");
};
var getLabelFromStackTrace = function getLabelFromStackTrace2(stackTrace) {
  if (!stackTrace) return void 0;
  var lines = stackTrace.split("\n");
  for (var i3 = 0; i3 < lines.length; i3++) {
    var functionName = getFunctionNameFromStackTraceLine(lines[i3]);
    if (!functionName) continue;
    if (internalReactFunctionNames.has(functionName)) break;
    if (/^[A-Z]/.test(functionName)) return sanitizeIdentifier(functionName);
  }
  return void 0;
};
var typePropName = "__EMOTION_TYPE_PLEASE_DO_NOT_USE__";
var labelPropName = "__EMOTION_LABEL_PLEASE_DO_NOT_USE__";
var createEmotionProps = function createEmotionProps2(type, props) {
  if (typeof props.css === "string" && // check if there is a css declaration
  props.css.indexOf(":") !== -1) {
    throw new Error("Strings are not allowed as css prop values, please wrap it in a css template literal from '@emotion/react' like this: css`" + props.css + "`");
  }
  var newProps = {};
  for (var _key in props) {
    if (hasOwn.call(props, _key)) {
      newProps[_key] = props[_key];
    }
  }
  newProps[typePropName] = type;
  if (typeof globalThis !== "undefined" && !!globalThis.EMOTION_RUNTIME_AUTO_LABEL && !!props.css && (typeof props.css !== "object" || !("name" in props.css) || typeof props.css.name !== "string" || props.css.name.indexOf("-") === -1)) {
    var label = getLabelFromStackTrace(new Error().stack);
    if (label) newProps[labelPropName] = label;
  }
  return newProps;
};
var Insertion = function Insertion2(_ref) {
  var cache = _ref.cache, serialized = _ref.serialized, isStringTag = _ref.isStringTag;
  registerStyles(cache, serialized, isStringTag);
  useInsertionEffectAlwaysWithSyncFallback(function() {
    return insertStyles(cache, serialized, isStringTag);
  });
  return null;
};
var Emotion = withEmotionCache(function(props, cache, ref) {
  var cssProp = props.css;
  if (typeof cssProp === "string" && cache.registered[cssProp] !== void 0) {
    cssProp = cache.registered[cssProp];
  }
  var WrappedComponent = props[typePropName];
  var registeredStyles = [cssProp];
  var className = "";
  if (typeof props.className === "string") {
    className = getRegisteredStyles(cache.registered, registeredStyles, props.className);
  } else if (props.className != null) {
    className = props.className + " ";
  }
  var serialized = serializeStyles(registeredStyles, void 0, React2.useContext(ThemeContext));
  if (serialized.name.indexOf("-") === -1) {
    var labelFromStack = props[labelPropName];
    if (labelFromStack) {
      serialized = serializeStyles([serialized, "label:" + labelFromStack + ";"]);
    }
  }
  className += cache.key + "-" + serialized.name;
  var newProps = {};
  for (var _key2 in props) {
    if (hasOwn.call(props, _key2) && _key2 !== "css" && _key2 !== typePropName && _key2 !== labelPropName) {
      newProps[_key2] = props[_key2];
    }
  }
  newProps.className = className;
  if (ref) {
    newProps.ref = ref;
  }
  return React2.createElement(React2.Fragment, null, React2.createElement(Insertion, {
    cache,
    serialized,
    isStringTag: typeof WrappedComponent === "string"
  }), React2.createElement(WrappedComponent, newProps));
});
{
  Emotion.displayName = "EmotionCssPropInternal";
}
var Emotion$1 = Emotion;

// node_modules/@emotion/react/dist/emotion-react.browser.development.esm.js
var React3 = __toESM(require_react());
var import_hoist_non_react_statics2 = __toESM(require_hoist_non_react_statics_cjs());
var isDevelopment3 = true;
var pkg = {
  name: "@emotion/react",
  version: "11.14.0",
  main: "dist/emotion-react.cjs.js",
  module: "dist/emotion-react.esm.js",
  types: "dist/emotion-react.cjs.d.ts",
  exports: {
    ".": {
      types: {
        "import": "./dist/emotion-react.cjs.mjs",
        "default": "./dist/emotion-react.cjs.js"
      },
      development: {
        "edge-light": {
          module: "./dist/emotion-react.development.edge-light.esm.js",
          "import": "./dist/emotion-react.development.edge-light.cjs.mjs",
          "default": "./dist/emotion-react.development.edge-light.cjs.js"
        },
        worker: {
          module: "./dist/emotion-react.development.edge-light.esm.js",
          "import": "./dist/emotion-react.development.edge-light.cjs.mjs",
          "default": "./dist/emotion-react.development.edge-light.cjs.js"
        },
        workerd: {
          module: "./dist/emotion-react.development.edge-light.esm.js",
          "import": "./dist/emotion-react.development.edge-light.cjs.mjs",
          "default": "./dist/emotion-react.development.edge-light.cjs.js"
        },
        browser: {
          module: "./dist/emotion-react.browser.development.esm.js",
          "import": "./dist/emotion-react.browser.development.cjs.mjs",
          "default": "./dist/emotion-react.browser.development.cjs.js"
        },
        module: "./dist/emotion-react.development.esm.js",
        "import": "./dist/emotion-react.development.cjs.mjs",
        "default": "./dist/emotion-react.development.cjs.js"
      },
      "edge-light": {
        module: "./dist/emotion-react.edge-light.esm.js",
        "import": "./dist/emotion-react.edge-light.cjs.mjs",
        "default": "./dist/emotion-react.edge-light.cjs.js"
      },
      worker: {
        module: "./dist/emotion-react.edge-light.esm.js",
        "import": "./dist/emotion-react.edge-light.cjs.mjs",
        "default": "./dist/emotion-react.edge-light.cjs.js"
      },
      workerd: {
        module: "./dist/emotion-react.edge-light.esm.js",
        "import": "./dist/emotion-react.edge-light.cjs.mjs",
        "default": "./dist/emotion-react.edge-light.cjs.js"
      },
      browser: {
        module: "./dist/emotion-react.browser.esm.js",
        "import": "./dist/emotion-react.browser.cjs.mjs",
        "default": "./dist/emotion-react.browser.cjs.js"
      },
      module: "./dist/emotion-react.esm.js",
      "import": "./dist/emotion-react.cjs.mjs",
      "default": "./dist/emotion-react.cjs.js"
    },
    "./jsx-runtime": {
      types: {
        "import": "./jsx-runtime/dist/emotion-react-jsx-runtime.cjs.mjs",
        "default": "./jsx-runtime/dist/emotion-react-jsx-runtime.cjs.js"
      },
      development: {
        "edge-light": {
          module: "./jsx-runtime/dist/emotion-react-jsx-runtime.development.edge-light.esm.js",
          "import": "./jsx-runtime/dist/emotion-react-jsx-runtime.development.edge-light.cjs.mjs",
          "default": "./jsx-runtime/dist/emotion-react-jsx-runtime.development.edge-light.cjs.js"
        },
        worker: {
          module: "./jsx-runtime/dist/emotion-react-jsx-runtime.development.edge-light.esm.js",
          "import": "./jsx-runtime/dist/emotion-react-jsx-runtime.development.edge-light.cjs.mjs",
          "default": "./jsx-runtime/dist/emotion-react-jsx-runtime.development.edge-light.cjs.js"
        },
        workerd: {
          module: "./jsx-runtime/dist/emotion-react-jsx-runtime.development.edge-light.esm.js",
          "import": "./jsx-runtime/dist/emotion-react-jsx-runtime.development.edge-light.cjs.mjs",
          "default": "./jsx-runtime/dist/emotion-react-jsx-runtime.development.edge-light.cjs.js"
        },
        browser: {
          module: "./jsx-runtime/dist/emotion-react-jsx-runtime.browser.development.esm.js",
          "import": "./jsx-runtime/dist/emotion-react-jsx-runtime.browser.development.cjs.mjs",
          "default": "./jsx-runtime/dist/emotion-react-jsx-runtime.browser.development.cjs.js"
        },
        module: "./jsx-runtime/dist/emotion-react-jsx-runtime.development.esm.js",
        "import": "./jsx-runtime/dist/emotion-react-jsx-runtime.development.cjs.mjs",
        "default": "./jsx-runtime/dist/emotion-react-jsx-runtime.development.cjs.js"
      },
      "edge-light": {
        module: "./jsx-runtime/dist/emotion-react-jsx-runtime.edge-light.esm.js",
        "import": "./jsx-runtime/dist/emotion-react-jsx-runtime.edge-light.cjs.mjs",
        "default": "./jsx-runtime/dist/emotion-react-jsx-runtime.edge-light.cjs.js"
      },
      worker: {
        module: "./jsx-runtime/dist/emotion-react-jsx-runtime.edge-light.esm.js",
        "import": "./jsx-runtime/dist/emotion-react-jsx-runtime.edge-light.cjs.mjs",
        "default": "./jsx-runtime/dist/emotion-react-jsx-runtime.edge-light.cjs.js"
      },
      workerd: {
        module: "./jsx-runtime/dist/emotion-react-jsx-runtime.edge-light.esm.js",
        "import": "./jsx-runtime/dist/emotion-react-jsx-runtime.edge-light.cjs.mjs",
        "default": "./jsx-runtime/dist/emotion-react-jsx-runtime.edge-light.cjs.js"
      },
      browser: {
        module: "./jsx-runtime/dist/emotion-react-jsx-runtime.browser.esm.js",
        "import": "./jsx-runtime/dist/emotion-react-jsx-runtime.browser.cjs.mjs",
        "default": "./jsx-runtime/dist/emotion-react-jsx-runtime.browser.cjs.js"
      },
      module: "./jsx-runtime/dist/emotion-react-jsx-runtime.esm.js",
      "import": "./jsx-runtime/dist/emotion-react-jsx-runtime.cjs.mjs",
      "default": "./jsx-runtime/dist/emotion-react-jsx-runtime.cjs.js"
    },
    "./_isolated-hnrs": {
      types: {
        "import": "./_isolated-hnrs/dist/emotion-react-_isolated-hnrs.cjs.mjs",
        "default": "./_isolated-hnrs/dist/emotion-react-_isolated-hnrs.cjs.js"
      },
      development: {
        "edge-light": {
          module: "./_isolated-hnrs/dist/emotion-react-_isolated-hnrs.development.edge-light.esm.js",
          "import": "./_isolated-hnrs/dist/emotion-react-_isolated-hnrs.development.edge-light.cjs.mjs",
          "default": "./_isolated-hnrs/dist/emotion-react-_isolated-hnrs.development.edge-light.cjs.js"
        },
        worker: {
          module: "./_isolated-hnrs/dist/emotion-react-_isolated-hnrs.development.edge-light.esm.js",
          "import": "./_isolated-hnrs/dist/emotion-react-_isolated-hnrs.development.edge-light.cjs.mjs",
          "default": "./_isolated-hnrs/dist/emotion-react-_isolated-hnrs.development.edge-light.cjs.js"
        },
        workerd: {
          module: "./_isolated-hnrs/dist/emotion-react-_isolated-hnrs.development.edge-light.esm.js",
          "import": "./_isolated-hnrs/dist/emotion-react-_isolated-hnrs.development.edge-light.cjs.mjs",
          "default": "./_isolated-hnrs/dist/emotion-react-_isolated-hnrs.development.edge-light.cjs.js"
        },
        browser: {
          module: "./_isolated-hnrs/dist/emotion-react-_isolated-hnrs.browser.development.esm.js",
          "import": "./_isolated-hnrs/dist/emotion-react-_isolated-hnrs.browser.development.cjs.mjs",
          "default": "./_isolated-hnrs/dist/emotion-react-_isolated-hnrs.browser.development.cjs.js"
        },
        module: "./_isolated-hnrs/dist/emotion-react-_isolated-hnrs.development.esm.js",
        "import": "./_isolated-hnrs/dist/emotion-react-_isolated-hnrs.development.cjs.mjs",
        "default": "./_isolated-hnrs/dist/emotion-react-_isolated-hnrs.development.cjs.js"
      },
      "edge-light": {
        module: "./_isolated-hnrs/dist/emotion-react-_isolated-hnrs.edge-light.esm.js",
        "import": "./_isolated-hnrs/dist/emotion-react-_isolated-hnrs.edge-light.cjs.mjs",
        "default": "./_isolated-hnrs/dist/emotion-react-_isolated-hnrs.edge-light.cjs.js"
      },
      worker: {
        module: "./_isolated-hnrs/dist/emotion-react-_isolated-hnrs.edge-light.esm.js",
        "import": "./_isolated-hnrs/dist/emotion-react-_isolated-hnrs.edge-light.cjs.mjs",
        "default": "./_isolated-hnrs/dist/emotion-react-_isolated-hnrs.edge-light.cjs.js"
      },
      workerd: {
        module: "./_isolated-hnrs/dist/emotion-react-_isolated-hnrs.edge-light.esm.js",
        "import": "./_isolated-hnrs/dist/emotion-react-_isolated-hnrs.edge-light.cjs.mjs",
        "default": "./_isolated-hnrs/dist/emotion-react-_isolated-hnrs.edge-light.cjs.js"
      },
      browser: {
        module: "./_isolated-hnrs/dist/emotion-react-_isolated-hnrs.browser.esm.js",
        "import": "./_isolated-hnrs/dist/emotion-react-_isolated-hnrs.browser.cjs.mjs",
        "default": "./_isolated-hnrs/dist/emotion-react-_isolated-hnrs.browser.cjs.js"
      },
      module: "./_isolated-hnrs/dist/emotion-react-_isolated-hnrs.esm.js",
      "import": "./_isolated-hnrs/dist/emotion-react-_isolated-hnrs.cjs.mjs",
      "default": "./_isolated-hnrs/dist/emotion-react-_isolated-hnrs.cjs.js"
    },
    "./jsx-dev-runtime": {
      types: {
        "import": "./jsx-dev-runtime/dist/emotion-react-jsx-dev-runtime.cjs.mjs",
        "default": "./jsx-dev-runtime/dist/emotion-react-jsx-dev-runtime.cjs.js"
      },
      development: {
        "edge-light": {
          module: "./jsx-dev-runtime/dist/emotion-react-jsx-dev-runtime.development.edge-light.esm.js",
          "import": "./jsx-dev-runtime/dist/emotion-react-jsx-dev-runtime.development.edge-light.cjs.mjs",
          "default": "./jsx-dev-runtime/dist/emotion-react-jsx-dev-runtime.development.edge-light.cjs.js"
        },
        worker: {
          module: "./jsx-dev-runtime/dist/emotion-react-jsx-dev-runtime.development.edge-light.esm.js",
          "import": "./jsx-dev-runtime/dist/emotion-react-jsx-dev-runtime.development.edge-light.cjs.mjs",
          "default": "./jsx-dev-runtime/dist/emotion-react-jsx-dev-runtime.development.edge-light.cjs.js"
        },
        workerd: {
          module: "./jsx-dev-runtime/dist/emotion-react-jsx-dev-runtime.development.edge-light.esm.js",
          "import": "./jsx-dev-runtime/dist/emotion-react-jsx-dev-runtime.development.edge-light.cjs.mjs",
          "default": "./jsx-dev-runtime/dist/emotion-react-jsx-dev-runtime.development.edge-light.cjs.js"
        },
        browser: {
          module: "./jsx-dev-runtime/dist/emotion-react-jsx-dev-runtime.browser.development.esm.js",
          "import": "./jsx-dev-runtime/dist/emotion-react-jsx-dev-runtime.browser.development.cjs.mjs",
          "default": "./jsx-dev-runtime/dist/emotion-react-jsx-dev-runtime.browser.development.cjs.js"
        },
        module: "./jsx-dev-runtime/dist/emotion-react-jsx-dev-runtime.development.esm.js",
        "import": "./jsx-dev-runtime/dist/emotion-react-jsx-dev-runtime.development.cjs.mjs",
        "default": "./jsx-dev-runtime/dist/emotion-react-jsx-dev-runtime.development.cjs.js"
      },
      "edge-light": {
        module: "./jsx-dev-runtime/dist/emotion-react-jsx-dev-runtime.edge-light.esm.js",
        "import": "./jsx-dev-runtime/dist/emotion-react-jsx-dev-runtime.edge-light.cjs.mjs",
        "default": "./jsx-dev-runtime/dist/emotion-react-jsx-dev-runtime.edge-light.cjs.js"
      },
      worker: {
        module: "./jsx-dev-runtime/dist/emotion-react-jsx-dev-runtime.edge-light.esm.js",
        "import": "./jsx-dev-runtime/dist/emotion-react-jsx-dev-runtime.edge-light.cjs.mjs",
        "default": "./jsx-dev-runtime/dist/emotion-react-jsx-dev-runtime.edge-light.cjs.js"
      },
      workerd: {
        module: "./jsx-dev-runtime/dist/emotion-react-jsx-dev-runtime.edge-light.esm.js",
        "import": "./jsx-dev-runtime/dist/emotion-react-jsx-dev-runtime.edge-light.cjs.mjs",
        "default": "./jsx-dev-runtime/dist/emotion-react-jsx-dev-runtime.edge-light.cjs.js"
      },
      browser: {
        module: "./jsx-dev-runtime/dist/emotion-react-jsx-dev-runtime.browser.esm.js",
        "import": "./jsx-dev-runtime/dist/emotion-react-jsx-dev-runtime.browser.cjs.mjs",
        "default": "./jsx-dev-runtime/dist/emotion-react-jsx-dev-runtime.browser.cjs.js"
      },
      module: "./jsx-dev-runtime/dist/emotion-react-jsx-dev-runtime.esm.js",
      "import": "./jsx-dev-runtime/dist/emotion-react-jsx-dev-runtime.cjs.mjs",
      "default": "./jsx-dev-runtime/dist/emotion-react-jsx-dev-runtime.cjs.js"
    },
    "./package.json": "./package.json",
    "./types/css-prop": "./types/css-prop.d.ts",
    "./macro": {
      types: {
        "import": "./macro.d.mts",
        "default": "./macro.d.ts"
      },
      "default": "./macro.js"
    }
  },
  imports: {
    "#is-development": {
      development: "./src/conditions/true.ts",
      "default": "./src/conditions/false.ts"
    },
    "#is-browser": {
      "edge-light": "./src/conditions/false.ts",
      workerd: "./src/conditions/false.ts",
      worker: "./src/conditions/false.ts",
      browser: "./src/conditions/true.ts",
      "default": "./src/conditions/is-browser.ts"
    }
  },
  files: [
    "src",
    "dist",
    "jsx-runtime",
    "jsx-dev-runtime",
    "_isolated-hnrs",
    "types/css-prop.d.ts",
    "macro.*"
  ],
  sideEffects: false,
  author: "Emotion Contributors",
  license: "MIT",
  scripts: {
    "test:typescript": "dtslint types"
  },
  dependencies: {
    "@babel/runtime": "^7.18.3",
    "@emotion/babel-plugin": "^11.13.5",
    "@emotion/cache": "^11.14.0",
    "@emotion/serialize": "^1.3.3",
    "@emotion/use-insertion-effect-with-fallbacks": "^1.2.0",
    "@emotion/utils": "^1.4.2",
    "@emotion/weak-memoize": "^0.4.0",
    "hoist-non-react-statics": "^3.3.1"
  },
  peerDependencies: {
    react: ">=16.8.0"
  },
  peerDependenciesMeta: {
    "@types/react": {
      optional: true
    }
  },
  devDependencies: {
    "@definitelytyped/dtslint": "0.0.112",
    "@emotion/css": "11.13.5",
    "@emotion/css-prettifier": "1.2.0",
    "@emotion/server": "11.11.0",
    "@emotion/styled": "11.14.0",
    "@types/hoist-non-react-statics": "^3.3.5",
    "html-tag-names": "^1.1.2",
    react: "16.14.0",
    "svg-tag-names": "^1.1.1",
    typescript: "^5.4.5"
  },
  repository: "https://github.com/emotion-js/emotion/tree/main/packages/react",
  publishConfig: {
    access: "public"
  },
  "umd:main": "dist/emotion-react.umd.min.js",
  preconstruct: {
    entrypoints: [
      "./index.ts",
      "./jsx-runtime.ts",
      "./jsx-dev-runtime.ts",
      "./_isolated-hnrs.ts"
    ],
    umdName: "emotionReact",
    exports: {
      extra: {
        "./types/css-prop": "./types/css-prop.d.ts",
        "./macro": {
          types: {
            "import": "./macro.d.mts",
            "default": "./macro.d.ts"
          },
          "default": "./macro.js"
        }
      }
    }
  }
};
var jsx = function jsx2(type, props) {
  var args = arguments;
  if (props == null || !hasOwn.call(props, "css")) {
    return React3.createElement.apply(void 0, args);
  }
  var argsLength = args.length;
  var createElementArgArray = new Array(argsLength);
  createElementArgArray[0] = Emotion$1;
  createElementArgArray[1] = createEmotionProps(type, props);
  for (var i3 = 2; i3 < argsLength; i3++) {
    createElementArgArray[i3] = args[i3];
  }
  return React3.createElement.apply(null, createElementArgArray);
};
(function(_jsx) {
  var JSX;
  /* @__PURE__ */ (function(_JSX) {
  })(JSX || (JSX = _jsx.JSX || (_jsx.JSX = {})));
})(jsx || (jsx = {}));
var warnedAboutCssPropForGlobal = false;
var Global = withEmotionCache(function(props, cache) {
  if (!warnedAboutCssPropForGlobal && // check for className as well since the user is
  // probably using the custom createElement which
  // means it will be turned into a className prop
  // I don't really want to add it to the type since it shouldn't be used
  ("className" in props && props.className || "css" in props && props.css)) {
    console.error("It looks like you're using the css prop on Global, did you mean to use the styles prop instead?");
    warnedAboutCssPropForGlobal = true;
  }
  var styles = props.styles;
  var serialized = serializeStyles([styles], void 0, React3.useContext(ThemeContext));
  var sheetRef = React3.useRef();
  useInsertionEffectWithLayoutFallback(function() {
    var key = cache.key + "-global";
    var sheet = new cache.sheet.constructor({
      key,
      nonce: cache.sheet.nonce,
      container: cache.sheet.container,
      speedy: cache.sheet.isSpeedy
    });
    var rehydrating = false;
    var node2 = document.querySelector('style[data-emotion="' + key + " " + serialized.name + '"]');
    if (cache.sheet.tags.length) {
      sheet.before = cache.sheet.tags[0];
    }
    if (node2 !== null) {
      rehydrating = true;
      node2.setAttribute("data-emotion", key);
      sheet.hydrate([node2]);
    }
    sheetRef.current = [sheet, rehydrating];
    return function() {
      sheet.flush();
    };
  }, [cache]);
  useInsertionEffectWithLayoutFallback(function() {
    var sheetRefCurrent = sheetRef.current;
    var sheet = sheetRefCurrent[0], rehydrating = sheetRefCurrent[1];
    if (rehydrating) {
      sheetRefCurrent[1] = false;
      return;
    }
    if (serialized.next !== void 0) {
      insertStyles(cache, serialized.next, true);
    }
    if (sheet.tags.length) {
      var element = sheet.tags[sheet.tags.length - 1].nextElementSibling;
      sheet.before = element;
      sheet.flush();
    }
    cache.insert("", serialized, sheet, false);
  }, [cache, serialized.name]);
  return null;
});
{
  Global.displayName = "EmotionGlobal";
}
function css() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }
  return serializeStyles(args);
}
var classnames = function classnames2(args) {
  var len = args.length;
  var i3 = 0;
  var cls = "";
  for (; i3 < len; i3++) {
    var arg = args[i3];
    if (arg == null) continue;
    var toAdd = void 0;
    switch (typeof arg) {
      case "boolean":
        break;
      case "object": {
        if (Array.isArray(arg)) {
          toAdd = classnames2(arg);
        } else {
          if (arg.styles !== void 0 && arg.name !== void 0) {
            console.error("You have passed styles created with `css` from `@emotion/react` package to the `cx`.\n`cx` is meant to compose class names (strings) so you should convert those styles to a class name by passing them to the `css` received from <ClassNames/> component.");
          }
          toAdd = "";
          for (var k in arg) {
            if (arg[k] && k) {
              toAdd && (toAdd += " ");
              toAdd += k;
            }
          }
        }
        break;
      }
      default: {
        toAdd = arg;
      }
    }
    if (toAdd) {
      cls && (cls += " ");
      cls += toAdd;
    }
  }
  return cls;
};
function merge(registered, css2, className) {
  var registeredStyles = [];
  var rawClassName = getRegisteredStyles(registered, registeredStyles, className);
  if (registeredStyles.length < 2) {
    return className;
  }
  return rawClassName + css2(registeredStyles);
}
var Insertion3 = function Insertion4(_ref) {
  var cache = _ref.cache, serializedArr = _ref.serializedArr;
  useInsertionEffectAlwaysWithSyncFallback(function() {
    for (var i3 = 0; i3 < serializedArr.length; i3++) {
      insertStyles(cache, serializedArr[i3], false);
    }
  });
  return null;
};
var ClassNames = withEmotionCache(function(props, cache) {
  var hasRendered = false;
  var serializedArr = [];
  var css2 = function css3() {
    if (hasRendered && isDevelopment3) {
      throw new Error("css can only be used during render");
    }
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    var serialized = serializeStyles(args, cache.registered);
    serializedArr.push(serialized);
    registerStyles(cache, serialized, false);
    return cache.key + "-" + serialized.name;
  };
  var cx = function cx2() {
    if (hasRendered && isDevelopment3) {
      throw new Error("cx can only be used during render");
    }
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }
    return merge(cache.registered, css2, classnames(args));
  };
  var content = {
    css: css2,
    cx,
    theme: React3.useContext(ThemeContext)
  };
  var ele = props.children(content);
  hasRendered = true;
  return React3.createElement(React3.Fragment, null, React3.createElement(Insertion3, {
    cache,
    serializedArr
  }), ele);
});
{
  ClassNames.displayName = "EmotionClassNames";
}
{
  isBrowser2 = typeof document !== "undefined";
  isTestEnv = typeof jest !== "undefined" || typeof vi !== "undefined";
  if (isBrowser2 && !isTestEnv) {
    globalContext = typeof globalThis !== "undefined" ? globalThis : isBrowser2 ? window : global;
    globalKey = "__EMOTION_REACT_" + pkg.version.split(".")[0] + "__";
    if (globalContext[globalKey]) {
      console.warn("You are loading @emotion/react when it is already loaded. Running multiple instances may cause problems. This can happen if multiple versions are used, or if multiple builds of the same version are used.");
    }
    globalContext[globalKey] = true;
  }
}
var isBrowser2;
var isTestEnv;
var globalContext;
var globalKey;

// node_modules/@table-library/react-table-library/styles-492c6342.js
var g = __toESM(require_react(), 1);
function t() {
  return l = t = Object.assign || function(g2) {
    for (var c = 1; c < arguments.length; c++) {
      var I = arguments[c];
      for (var t2 in I) Object.prototype.hasOwnProperty.call(I, t2) && (g2[t2] = I[t2]);
    }
    return g2;
  }, t.apply(this, arguments);
}
var l = t;
var n2 = l;
var i = function(g2, c) {
  if (null == g2) return {};
  var I, t2, l2 = {}, n4 = Object.keys(g2);
  for (t2 = 0; t2 < n4.length; t2++) I = n4[t2], c.indexOf(I) >= 0 || (l2[I] = g2[I]);
  return l2;
};
var e2 = function(g2, c) {
  if (null == g2) return {};
  var I, t2, l2 = i(g2, c);
  if (Object.getOwnPropertySymbols) {
    var n4 = Object.getOwnPropertySymbols(g2);
    for (t2 = 0; t2 < n4.length; t2++) I = n4[t2], c.indexOf(I) >= 0 || Object.prototype.propertyIsEnumerable.call(g2, I) && (l2[I] = g2[I]);
  }
  return l2;
};
var b = g.createContext(null);
var u = function(g2) {
  var c = g2.current.querySelector(".tr-header");
  return Array.from((null == c ? void 0 : c.querySelectorAll(".th")) || []);
};
var C = function(g2, c, I, t2) {
  return Array.from(g2.current.querySelectorAll(I)).forEach(function(g3) {
    var I2 = Array.from(g3.querySelectorAll(t2)), l2 = I2.length;
    I2.forEach(function(g4, I3) {
      return c(g4, I3, l2);
    });
  });
};
var o = function(g2, c) {
  return C(g2, c, ".tr-header", ".th");
};
var a = function(g2, c) {
  return C(g2, c, ".tr-body", ".td");
};
var G = function(g2, c) {
  return { index: c, minWidth: +g2.getAttribute("data-resize-min-width"), width: g2.getBoundingClientRect().width, isStiff: g2.classList.contains("stiff"), isHide: "true" === g2.getAttribute("data-hide"), isColSpan: g2.classList.contains("colspan") };
};
var A = g.createContext(null);
var X = function(I) {
  var t2 = I.tableElementRef, l2 = I.tableMemoryRef, n4 = I.layout, i3 = I.children, e5 = g.useMemo(function() {
    return { layout: n4, tableElementRef: t2, tableMemoryRef: l2 };
  }, [n4, t2, l2]);
  return jsx(A.Provider, { value: e5 }, i3);
};
var d = function(g2, c) {
  var I = u(g2).map(G);
  c.current.dataColumns = I;
};
var r2 = function(g2, c, I) {
  var t2 = c.current.style.getPropertyValue("--data-table-library_grid-template-columns") !== g2;
  c.current && g2 && t2 && (c.current.style.setProperty("--data-table-library_grid-template-columns", g2), d(c, I));
};
var x = function(g2, c) {
  null != c && c.onLayoutChange && g2 && c.onLayoutChange(g2);
};
var y = "\n  ".concat(function() {
}, "\n  padding: 0;\n  margin: 0;\n\n  ").concat(function() {
}, "\n  display: flex;\n  align-items: center;\n\n  ").concat(function() {
}, "\n  align-self: stretch;\n\n\n  & > div {\n    ").concat(function() {
}, "\n    flex: 1;\n\n    overflow: hidden;\n    white-space: nowrap;\n    text-overflow: ellipsis;\n  }\n\n  &.hide {\n    display: none;\n  }\n\n  &.pin-left,\n  &.pin-right {\n    position: sticky;\n    z-index: 2;\n  }\n\n  ").concat(function() {
}, "\n  background-color: inherit;\n");
var s = css(y, ";" + (false ? "" : ";label:CELL_CONTAINER_STYLE;"), false ? "" : "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNlbGwudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQTJDaUMiLCJmaWxlIjoiQ2VsbC50c3giLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XHJcbmltcG9ydCB7IGNzcyB9IGZyb20gJ0BlbW90aW9uL3JlYWN0JztcclxuaW1wb3J0IHsgTGF5b3V0Q29udGV4dCB9IGZyb20gJ0B0YWJsZS1saWJyYXJ5L3JlYWN0LXRhYmxlLWxpYnJhcnkvY29tbW9uL2NvbnRleHQnO1xyXG5jb25zdCBCQVNFX1NUWUxFID0gYFxuICAkeygpID0+IHtcclxufX1cbiAgcGFkZGluZzogMDtcbiAgbWFyZ2luOiAwO1xuXG4gICR7KCkgPT4ge1xyXG59fVxuICBkaXNwbGF5OiBmbGV4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuXG4gICR7KCkgPT4ge1xyXG59fVxuICBhbGlnbi1zZWxmOiBzdHJldGNoO1xuXG5cbiAgJiA+IGRpdiB7XG4gICAgJHsoKSA9PiB7XHJcbn19XG4gICAgZmxleDogMTtcblxuICAgIG92ZXJmbG93OiBoaWRkZW47XG4gICAgd2hpdGUtc3BhY2U6IG5vd3JhcDtcbiAgICB0ZXh0LW92ZXJmbG93OiBlbGxpcHNpcztcbiAgfVxuXG4gICYuaGlkZSB7XG4gICAgZGlzcGxheTogbm9uZTtcbiAgfVxuXG4gICYucGluLWxlZnQsXG4gICYucGluLXJpZ2h0IHtcbiAgICBwb3NpdGlvbjogc3RpY2t5O1xuICAgIHotaW5kZXg6IDI7XG4gIH1cblxuICAkeygpID0+IHtcclxufX1cbiAgYmFja2dyb3VuZC1jb2xvcjogaW5oZXJpdDtcbmA7XHJcbmNvbnN0IENFTExfQ09OVEFJTkVSX1NUWUxFID0gY3NzIGBcbiAgJHtCQVNFX1NUWUxFfVxuYDtcclxuY29uc3QgQ2VsbENvbnRhaW5lciA9IFJlYWN0LmZvcndhcmRSZWYoKHByb3BzLCByZWYpID0+IHtcclxuICAgIGNvbnN0IGNvbnRleHQgPSBSZWFjdC51c2VDb250ZXh0KExheW91dENvbnRleHQpO1xyXG4gICAgaWYgKCFjb250ZXh0KSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBMYXlvdXQgQ29udGV4dC4nKTtcclxuICAgIH1cclxuICAgIGNvbnN0IHsgbGF5b3V0IH0gPSBjb250ZXh0O1xyXG4gICAgY29uc3QgQXMgPSBsYXlvdXQ/LmlzRGl2ID8gJ2RpdicgOiAndGQnO1xyXG4gICAgcmV0dXJuIDxBcyBjc3M9e0NFTExfQ09OVEFJTkVSX1NUWUxFfSByZWY9e3JlZn0gey4uLnByb3BzfS8+O1xyXG59KTtcclxuY29uc3QgSEVBREVSX0NFTExfQ09OVEFJTkVSX1NUWUxFID0gY3NzIGBcbiAgJHtCQVNFX1NUWUxFfVxuXG4gIHotaW5kZXg6IDE7XG4gIHRleHQtYWxpZ246IGxlZnQ7XG4gIHBvc2l0aW9uOiBzdGlja3k7XG4gIHRvcDogMDtcblxuICAmLnBpbi1sZWZ0LFxuICAmLnBpbi1yaWdodCB7XG4gICAgei1pbmRleDogMztcbiAgfVxuYDtcclxuY29uc3QgSGVhZGVyQ2VsbENvbnRhaW5lciA9IFJlYWN0LmZvcndhcmRSZWYoKHByb3BzLCByZWYpID0+IHtcclxuICAgIGNvbnN0IGNvbnRleHQgPSBSZWFjdC51c2VDb250ZXh0KExheW91dENvbnRleHQpO1xyXG4gICAgaWYgKCFjb250ZXh0KSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBMYXlvdXQgQ29udGV4dC4nKTtcclxuICAgIH1cclxuICAgIGNvbnN0IHsgbGF5b3V0IH0gPSBjb250ZXh0O1xyXG4gICAgY29uc3QgQXMgPSBsYXlvdXQ/LmlzRGl2ID8gJ2RpdicgOiAndGgnO1xyXG4gICAgcmV0dXJuIDxBcyBjc3M9e0hFQURFUl9DRUxMX0NPTlRBSU5FUl9TVFlMRX0gcmVmPXtyZWZ9IHsuLi5wcm9wc30vPjtcclxufSk7XHJcbmV4cG9ydCB7IENlbGxDb250YWluZXIsIEhlYWRlckNlbGxDb250YWluZXIgfTtcclxuIl19 */");
var p = g.forwardRef(function(I, t2) {
  var l2 = g.useContext(A);
  if (!l2) throw new Error("No Layout Context.");
  var i3 = l2.layout, e5 = null != i3 && i3.isDiv ? "div" : "td";
  return jsx(e5, n2({ css: s, ref: t2 }, I));
});
var B = css(y, " z-index:1;text-align:left;position:sticky;top:0;&.pin-left,&.pin-right{z-index:3;}" + (false ? "" : ";label:HEADER_CELL_CONTAINER_STYLE;"), false ? "" : "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNlbGwudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQXVEd0MiLCJmaWxlIjoiQ2VsbC50c3giLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XHJcbmltcG9ydCB7IGNzcyB9IGZyb20gJ0BlbW90aW9uL3JlYWN0JztcclxuaW1wb3J0IHsgTGF5b3V0Q29udGV4dCB9IGZyb20gJ0B0YWJsZS1saWJyYXJ5L3JlYWN0LXRhYmxlLWxpYnJhcnkvY29tbW9uL2NvbnRleHQnO1xyXG5jb25zdCBCQVNFX1NUWUxFID0gYFxuICAkeygpID0+IHtcclxufX1cbiAgcGFkZGluZzogMDtcbiAgbWFyZ2luOiAwO1xuXG4gICR7KCkgPT4ge1xyXG59fVxuICBkaXNwbGF5OiBmbGV4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuXG4gICR7KCkgPT4ge1xyXG59fVxuICBhbGlnbi1zZWxmOiBzdHJldGNoO1xuXG5cbiAgJiA+IGRpdiB7XG4gICAgJHsoKSA9PiB7XHJcbn19XG4gICAgZmxleDogMTtcblxuICAgIG92ZXJmbG93OiBoaWRkZW47XG4gICAgd2hpdGUtc3BhY2U6IG5vd3JhcDtcbiAgICB0ZXh0LW92ZXJmbG93OiBlbGxpcHNpcztcbiAgfVxuXG4gICYuaGlkZSB7XG4gICAgZGlzcGxheTogbm9uZTtcbiAgfVxuXG4gICYucGluLWxlZnQsXG4gICYucGluLXJpZ2h0IHtcbiAgICBwb3NpdGlvbjogc3RpY2t5O1xuICAgIHotaW5kZXg6IDI7XG4gIH1cblxuICAkeygpID0+IHtcclxufX1cbiAgYmFja2dyb3VuZC1jb2xvcjogaW5oZXJpdDtcbmA7XHJcbmNvbnN0IENFTExfQ09OVEFJTkVSX1NUWUxFID0gY3NzIGBcbiAgJHtCQVNFX1NUWUxFfVxuYDtcclxuY29uc3QgQ2VsbENvbnRhaW5lciA9IFJlYWN0LmZvcndhcmRSZWYoKHByb3BzLCByZWYpID0+IHtcclxuICAgIGNvbnN0IGNvbnRleHQgPSBSZWFjdC51c2VDb250ZXh0KExheW91dENvbnRleHQpO1xyXG4gICAgaWYgKCFjb250ZXh0KSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBMYXlvdXQgQ29udGV4dC4nKTtcclxuICAgIH1cclxuICAgIGNvbnN0IHsgbGF5b3V0IH0gPSBjb250ZXh0O1xyXG4gICAgY29uc3QgQXMgPSBsYXlvdXQ/LmlzRGl2ID8gJ2RpdicgOiAndGQnO1xyXG4gICAgcmV0dXJuIDxBcyBjc3M9e0NFTExfQ09OVEFJTkVSX1NUWUxFfSByZWY9e3JlZn0gey4uLnByb3BzfS8+O1xyXG59KTtcclxuY29uc3QgSEVBREVSX0NFTExfQ09OVEFJTkVSX1NUWUxFID0gY3NzIGBcbiAgJHtCQVNFX1NUWUxFfVxuXG4gIHotaW5kZXg6IDE7XG4gIHRleHQtYWxpZ246IGxlZnQ7XG4gIHBvc2l0aW9uOiBzdGlja3k7XG4gIHRvcDogMDtcblxuICAmLnBpbi1sZWZ0LFxuICAmLnBpbi1yaWdodCB7XG4gICAgei1pbmRleDogMztcbiAgfVxuYDtcclxuY29uc3QgSGVhZGVyQ2VsbENvbnRhaW5lciA9IFJlYWN0LmZvcndhcmRSZWYoKHByb3BzLCByZWYpID0+IHtcclxuICAgIGNvbnN0IGNvbnRleHQgPSBSZWFjdC51c2VDb250ZXh0KExheW91dENvbnRleHQpO1xyXG4gICAgaWYgKCFjb250ZXh0KSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBMYXlvdXQgQ29udGV4dC4nKTtcclxuICAgIH1cclxuICAgIGNvbnN0IHsgbGF5b3V0IH0gPSBjb250ZXh0O1xyXG4gICAgY29uc3QgQXMgPSBsYXlvdXQ/LmlzRGl2ID8gJ2RpdicgOiAndGgnO1xyXG4gICAgcmV0dXJuIDxBcyBjc3M9e0hFQURFUl9DRUxMX0NPTlRBSU5FUl9TVFlMRX0gcmVmPXtyZWZ9IHsuLi5wcm9wc30vPjtcclxufSk7XHJcbmV4cG9ydCB7IENlbGxDb250YWluZXIsIEhlYWRlckNlbGxDb250YWluZXIgfTtcclxuIl19 */");
var Z = g.forwardRef(function(I, t2) {
  var l2 = g.useContext(A);
  if (!l2) throw new Error("No Layout Context.");
  var i3 = l2.layout, e5 = null != i3 && i3.isDiv ? "div" : "th";
  return jsx(e5, n2({ css: B, ref: t2 }, I));
});
var W = false ? { name: "1k13m5t", styles: "z-index:2;position:absolute;top:0;right:0;bottom:0;width:1px;margin:4px 0" } : { name: "1ysef1f-handle", styles: "z-index:2;position:absolute;top:0;right:0;bottom:0;width:1px;margin:4px 0;label:handle;", map: "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN0eWxlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFPb0IiLCJmaWxlIjoic3R5bGVzLnRzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgY3NzIH0gZnJvbSAnQGVtb3Rpb24vcmVhY3QnO1xyXG5jb25zdCByZXNpemVyU3R5bGUgPSAocmVzaXplKSA9PiB7XHJcbiAgICBjb25zdCB3aWR0aCA9IHR5cGVvZiByZXNpemUgPT09ICdib29sZWFuJyB8fCByZXNpemU/LnJlc2l6ZXJXaWR0aCA9PSBudWxsID8gMTAgOiByZXNpemUucmVzaXplcldpZHRoO1xyXG4gICAgY29uc3QgaGlnaGxpZ2h0ID0gdHlwZW9mIHJlc2l6ZSA9PT0gJ2Jvb2xlYW4nIHx8IHJlc2l6ZT8ucmVzaXplckhpZ2hsaWdodCA9PSBudWxsXHJcbiAgICAgICAgPyAndHJhbnNwYXJlbnQnXHJcbiAgICAgICAgOiByZXNpemUucmVzaXplckhpZ2hsaWdodDtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgaGFuZGxlOiBjc3MgYFxuICAgICAgei1pbmRleDogMjtcbiAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgIHRvcDogMDtcbiAgICAgIHJpZ2h0OiAwO1xuICAgICAgYm90dG9tOiAwO1xuXG4gICAgICB3aWR0aDogMXB4O1xuICAgICAgbWFyZ2luOiA0cHggMDtcbiAgICBgLFxyXG4gICAgICAgIGFyZWE6IGNzcyBgXG4gICAgICB6LWluZGV4OiAxO1xuICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgdG9wOiAwO1xuICAgICAgcmlnaHQ6IDA7XG4gICAgICBib3R0b206IDA7XG5cbiAgICAgIGN1cnNvcjogZXctcmVzaXplO1xuICAgICAgd2lkdGg6ICR7d2lkdGh9cHg7XG4gICAgICBoZWlnaHQ6IDEwMCU7XG5cbiAgICAgICY6aG92ZXIsXG4gICAgICAmLmFjdGl2ZSB7XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6ICR7aGlnaGxpZ2h0fTtcbiAgICAgIH1cbiAgICBgLFxyXG4gICAgfTtcclxufTtcclxuZXhwb3J0IHsgcmVzaXplclN0eWxlIH07XHJcbiJdfQ== */", toString: function() {
  return "You have tried to stringify object returned from `css` function. It isn't supposed to be used directly (e.g. as value of the `className` prop), but rather handed to emotion so it can handle it (e.g. as value of `css` prop).";
} };
var m = function(g2) {
  var c = "boolean" == typeof g2 || null == (null == g2 ? void 0 : g2.resizerWidth) ? 10 : g2.resizerWidth, t2 = "boolean" == typeof g2 || null == (null == g2 ? void 0 : g2.resizerHighlight) ? "transparent" : g2.resizerHighlight;
  return { handle: W, area: css("z-index:1;position:absolute;top:0;right:0;bottom:0;cursor:ew-resize;width:", c, "px;height:100%;&:hover,&.active{background-color:", t2, ";}" + (false ? "" : ";label:area;"), false ? "" : "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN0eWxlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFpQmtCIiwiZmlsZSI6InN0eWxlcy50cyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNzcyB9IGZyb20gJ0BlbW90aW9uL3JlYWN0JztcclxuY29uc3QgcmVzaXplclN0eWxlID0gKHJlc2l6ZSkgPT4ge1xyXG4gICAgY29uc3Qgd2lkdGggPSB0eXBlb2YgcmVzaXplID09PSAnYm9vbGVhbicgfHwgcmVzaXplPy5yZXNpemVyV2lkdGggPT0gbnVsbCA/IDEwIDogcmVzaXplLnJlc2l6ZXJXaWR0aDtcclxuICAgIGNvbnN0IGhpZ2hsaWdodCA9IHR5cGVvZiByZXNpemUgPT09ICdib29sZWFuJyB8fCByZXNpemU/LnJlc2l6ZXJIaWdobGlnaHQgPT0gbnVsbFxyXG4gICAgICAgID8gJ3RyYW5zcGFyZW50J1xyXG4gICAgICAgIDogcmVzaXplLnJlc2l6ZXJIaWdobGlnaHQ7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGhhbmRsZTogY3NzIGBcbiAgICAgIHotaW5kZXg6IDI7XG4gICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICB0b3A6IDA7XG4gICAgICByaWdodDogMDtcbiAgICAgIGJvdHRvbTogMDtcblxuICAgICAgd2lkdGg6IDFweDtcbiAgICAgIG1hcmdpbjogNHB4IDA7XG4gICAgYCxcclxuICAgICAgICBhcmVhOiBjc3MgYFxuICAgICAgei1pbmRleDogMTtcbiAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgIHRvcDogMDtcbiAgICAgIHJpZ2h0OiAwO1xuICAgICAgYm90dG9tOiAwO1xuXG4gICAgICBjdXJzb3I6IGV3LXJlc2l6ZTtcbiAgICAgIHdpZHRoOiAke3dpZHRofXB4O1xuICAgICAgaGVpZ2h0OiAxMDAlO1xuXG4gICAgICAmOmhvdmVyLFxuICAgICAgJi5hY3RpdmUge1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAke2hpZ2hsaWdodH07XG4gICAgICB9XG4gICAgYCxcclxuICAgIH07XHJcbn07XHJcbmV4cG9ydCB7IHJlc2l6ZXJTdHlsZSB9O1xyXG4iXX0= */") };
};

// node_modules/@table-library/react-table-library/node_modules/clsx/dist/clsx.m.js
function toVal(mix) {
  var k, y3, str = "";
  if (typeof mix === "string" || typeof mix === "number") {
    str += mix;
  } else if (typeof mix === "object") {
    if (Array.isArray(mix)) {
      for (k = 0; k < mix.length; k++) {
        if (mix[k]) {
          if (y3 = toVal(mix[k])) {
            str && (str += " ");
            str += y3;
          }
        }
      }
    } else {
      for (k in mix) {
        if (mix[k]) {
          str && (str += " ");
          str += k;
        }
      }
    }
  }
  return str;
}
function clsx_m_default() {
  var i3 = 0, tmp, x3, str = "";
  while (i3 < arguments.length) {
    if (tmp = arguments[i3++]) {
      if (x3 = toVal(tmp)) {
        str && (str += " ");
        str += x3;
      }
    }
  }
  return str;
}

// node_modules/@table-library/react-table-library/toConsumableArray-25e5c43c.js
var e3 = r;
var n3 = function(r3) {
  if (Array.isArray(r3)) return e3(r3);
};
var o2 = function(r3) {
  if ("undefined" != typeof Symbol && Symbol.iterator in Object(r3)) return Array.from(r3);
};
var a2 = n;
var i2 = function() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
};
var u2 = function(r3) {
  return n3(r3) || o2(r3) || a2(r3) || i2();
};

// node_modules/@table-library/react-table-library/HeaderCell-1d879c3c.js
var e4 = __toESM(require_react(), 1);
var A2 = null;
var G2 = function() {
  return A2 || (A2 = e4.createContext(null));
};
var W2 = function() {
  return e4.useContext(A2);
};
function X2(e5, c) {
  var t2 = Object.keys(e5);
  if (Object.getOwnPropertySymbols) {
    var l2 = Object.getOwnPropertySymbols(e5);
    c && (l2 = l2.filter(function(c2) {
      return Object.getOwnPropertyDescriptor(e5, c2).enumerable;
    })), t2.push.apply(t2, l2);
  }
  return t2;
}
function V(e5) {
  for (var c = 1; c < arguments.length; c++) {
    var t2 = null != arguments[c] ? arguments[c] : {};
    c % 2 ? X2(Object(t2), true).forEach(function(c2) {
      e(e5, c2, t2[c2]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e5, Object.getOwnPropertyDescriptors(t2)) : X2(Object(t2)).forEach(function(c2) {
      Object.defineProperty(e5, c2, Object.getOwnPropertyDescriptor(t2, c2));
    });
  }
  return e5;
}
var y2 = function(b2, C2) {
  var i3 = e4.useContext(A);
  if (!i3) throw new Error("No Layout Context.");
  var u3 = i3.tableElementRef, a3 = i3.tableMemoryRef, d2 = i3.layout, s2 = e4.useRef(null), m2 = e4.useRef(null), o3 = e4.useRef(""), A3 = e4.useRef(null), G3 = e4.useRef(false), W3 = e4.useCallback(function(e5) {
    var c;
    e5.preventDefault(), o3.current = u3.current.style.getPropertyValue("--data-table-library_grid-template-columns"), G3.current = true, A3.current = s2.current.offsetWidth - e5.pageX, null === (c = s2.current) || void 0 === c || c.querySelector(".resizer-area").classList.add("active");
  }, [u3]), X3 = e4.useCallback(function(e5) {
    if (G3.current) {
      e5.preventDefault();
      var c = A3.current + e5.pageX, l2 = function(e6, c2, t2, l3) {
        var b3 = u(t2).map(G).filter(function(e7) {
          return !e7.isHide;
        }), C3 = b3.findIndex(function(c3) {
          return c3.index === e6;
        }), i4 = (b3 = b3.map(function(e7, c3) {
          return V(V({}, e7), {}, { index: c3 });
        })).reduce(function(e7, c3, t3) {
          return e7 || (t3 > C3 && 0 !== c3.width ? c3 : e7);
        }, null), u4 = b3.reduce(function(e7, c3) {
          return e7 + c3.width;
        }, 0), a4 = b3[C3].minWidth, d3 = l3 > a4 && 0 !== l3 ? l3 : a4, s3 = d3 - b3[C3].width, m3 = b3.map(function(e7, c3) {
          if (i4 && C3 === c3) return i4.width - s3 > a4 ? d3 : e7.width;
          if ((null == i4 ? void 0 : i4.index) === c3) {
            var t3 = e7.width - s3;
            return t3 > a4 ? t3 : e7.width;
          }
          return e7.width;
        }), o4 = u4 - m3.reduce(function(e7, c3) {
          return e7 + c3;
        }, 0);
        m3[C3] = m3[C3] + o4;
        var A4 = false, G4 = b3.slice(0).reverse().map(function(e7, t3) {
          var l4 = m3.slice(0).reverse()[t3], n4 = l4 / u4 * 100;
          return e7.isStiff || null != c2 && c2.horizontalScroll ? "".concat(l4, "px") : A4 ? "minmax(0, ".concat(n4, "%)") : (A4 = true, "minmax(0, 1fr)");
        }).slice(0).reverse().join(" "), W4 = function(e7, c3) {
          if (u2(Array.from(e7.classList)).includes("pin-left")) {
            var t3 = m3.reduce(function(e8, t4, l5) {
              return l5 >= c3 ? e8 : e8 + t4;
            }, 0);
            e7.style.left = "".concat(t3, "px");
          }
          if (u2(Array.from(e7.classList)).includes("pin-right")) {
            var l4 = m3.reduceRight(function(e8, t4, l5) {
              return l5 <= c3 ? e8 : e8 + t4;
            }, 0);
            e7.style.right = "".concat(l4, "px");
          }
        };
        return o(t2, W4), a(t2, W4), G4;
      }(b2, d2, u3, c);
      r2(l2, u3, a3);
    }
  }, [b2, d2, u3, a3]), y3 = e4.useCallback(function() {
    var e5;
    G3.current = false;
    var c = u3.current.style.getPropertyValue("--data-table-library_grid-template-columns");
    if (o3.current !== c) {
      x(c, d2);
      var t2 = u(u3).map(G);
      a3.current.dataColumns = t2;
    }
    null === (e5 = s2.current) || void 0 === e5 || e5.querySelector(".resizer-area").classList.remove("active");
  }, [d2, u3, a3]);
  return e4.useEffect(function() {
    var e5 = m2.current;
    return e5 && (e5.addEventListener("mousedown", W3), document.addEventListener("mousemove", X3), document.addEventListener("mouseup", y3)), function() {
      e5 && (e5.removeEventListener("mousedown", W3), document.removeEventListener("mousemove", X3), document.removeEventListener("mouseup", y3));
    };
  }, [C2, W3, X3, y3]), { cellRef: s2, resizeRef: m2 };
};
var p2 = ["index", "className", "hide", "pinLeft", "pinRight", "stiff", "isFooter", "includePreviousColSpan", "previousColSpans", "gridColumnStart", "gridColumnEnd", "resize", "role", "children", "style"];
function h(e5, c) {
  var t2 = Object.keys(e5);
  if (Object.getOwnPropertySymbols) {
    var l2 = Object.getOwnPropertySymbols(e5);
    c && (l2 = l2.filter(function(c2) {
      return Object.getOwnPropertyDescriptor(e5, c2).enumerable;
    })), t2.push.apply(t2, l2);
  }
  return t2;
}
function x2(e5) {
  for (var c = 1; c < arguments.length; c++) {
    var t2 = null != arguments[c] ? arguments[c] : {};
    c % 2 ? h(Object(t2), true).forEach(function(c2) {
      e(e5, c2, t2[c2]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e5, Object.getOwnPropertyDescriptors(t2)) : h(Object(t2)).forEach(function(c2) {
      Object.defineProperty(e5, c2, Object.getOwnPropertyDescriptor(t2, c2));
    });
  }
  return e5;
}
var R = function(e5, c) {
  return c.find(function(c2) {
    return c2.index === e5;
  });
};
var v = function(r3) {
  var I = r3.index, d2 = r3.className, Z2 = r3.hide, A3 = r3.pinLeft, G3 = r3.pinRight, W3 = r3.stiff, X3 = r3.isFooter, V2 = r3.includePreviousColSpan, h2 = r3.previousColSpans, v2 = r3.gridColumnStart, J = r3.gridColumnEnd, f = r3.resize, H = r3.role, Y = void 0 === H ? "columnheader" : H, N = r3.children, B2 = r3.style, F = e2(r3, p2), z = e4.useContext(b);
  !function(r4, I2) {
    var b2 = e4.useContext(A);
    if (!b2) throw new Error("No Layout Context.");
    var C2 = b2.layout, i3 = b2.tableElementRef, u3 = b2.tableMemoryRef;
    e4.useLayoutEffect(function() {
      var e5 = u3.current.dataColumns, c = u(i3).map(G), b3 = R(r4, e5), a3 = (null == b3 ? void 0 : b3.isHide) === !!I2;
      if (null != e5 && e5.length && !a3) {
        var d3 = c.filter(function(e6) {
          return !e6.isHide;
        }).map(function(c2) {
          if (c2.isStiff || null != C2 && C2.horizontalScroll) {
            var t2 = R(c2.index, e5);
            return t2 ? "".concat(t2.width || 2 * t2.minWidth, "px") : "minmax(0px, 1fr)";
          }
          return "minmax(0px, 1fr)";
        }).join(" ");
        r2(d3, i3, u3), x(d3, C2);
        var s2 = u(i3).map(G);
        u3.current.dataColumns = s2;
      }
    }, [r4, I2, C2, i3, u3]);
  }(I, Z2);
  var S = y2(I, Z2), Q = S.cellRef, w = S.resizeRef, D = v2 && J, k = D ? J - v2 - 1 : 0, L = V2 ? v2 + h2 : v2, j = V2 ? J + h2 : J;
  return jsx(e4.Fragment, null, jsx(Z, n2({ role: Y, "data-table-library_th": "", "data-hide": !!Z2, "data-resize-min-width": "boolean" == typeof f || null == (null == f ? void 0 : f.minWidth) ? 75 : f.minWidth, style: x2(x2({}, D ? { gridColumnStart: L, gridColumnEnd: j } : {}), B2), css: css(null == z ? void 0 : z.BaseCell, " ", X3 ? null == z ? void 0 : z.FooterCell : null == z ? void 0 : z.HeaderCell, ";" + (false ? "" : ";label:HeaderCell;"), false ? "" : "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkhlYWRlckNlbGwudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQWdFb0IiLCJmaWxlIjoiSGVhZGVyQ2VsbC50c3giLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XHJcbmltcG9ydCBjcyBmcm9tICdjbHN4JztcclxuaW1wb3J0IHsgY3NzIH0gZnJvbSAnQGVtb3Rpb24vcmVhY3QnO1xyXG5pbXBvcnQgeyBIZWFkZXJDZWxsQ29udGFpbmVyIH0gZnJvbSAnQHRhYmxlLWxpYnJhcnkvcmVhY3QtdGFibGUtbGlicmFyeS9jb21tb24vY29tcG9uZW50cy9DZWxsJztcclxuaW1wb3J0IHsgVGhlbWVDb250ZXh0IH0gZnJvbSAnQHRhYmxlLWxpYnJhcnkvcmVhY3QtdGFibGUtbGlicmFyeS9jb21tb24vY29udGV4dC9UaGVtZSc7XHJcbmltcG9ydCB7IExheW91dENvbnRleHQsIHByb3BhZ2F0ZVJlc2l6ZWRMYXlvdXQsIHNldFJlc2l6ZWRMYXlvdXQsIH0gZnJvbSAnQHRhYmxlLWxpYnJhcnkvcmVhY3QtdGFibGUtbGlicmFyeS9jb21tb24vY29udGV4dCc7XHJcbmltcG9ydCB7IHJlc2l6ZXJTdHlsZSB9IGZyb20gJ0B0YWJsZS1saWJyYXJ5L3JlYWN0LXRhYmxlLWxpYnJhcnkvcmVzaXplL3N0eWxlcyc7XHJcbmltcG9ydCB7IHVzZVJlc2l6ZSB9IGZyb20gJ0B0YWJsZS1saWJyYXJ5L3JlYWN0LXRhYmxlLWxpYnJhcnkvcmVzaXplL3VzZVJlc2l6ZSc7XHJcbmltcG9ydCB7IHRvRGF0YUNvbHVtbiwgZ2V0SGVhZGVyQ29sdW1ucywgfSBmcm9tICdAdGFibGUtbGlicmFyeS9yZWFjdC10YWJsZS1saWJyYXJ5L2NvbW1vbi91dGlsL2NvbHVtbnMnO1xyXG5jb25zdCBnZXRQcmVzZXJ2ZWRDb2x1bW4gPSAoaW5kZXgsIHByZXNlcnZlZERhdGFDb2x1bW5zKSA9PiB7XHJcbiAgICBjb25zdCBmaW5kUHJlc2VydmVkRGF0YUNvbHVtbiA9IChkYXRhQ29sdW1uKSA9PiBkYXRhQ29sdW1uLmluZGV4ID09PSBpbmRleDtcclxuICAgIGNvbnN0IHByZXNlcnZlZERhdGFDb2x1bW4gPSBwcmVzZXJ2ZWREYXRhQ29sdW1ucy5maW5kKGZpbmRQcmVzZXJ2ZWREYXRhQ29sdW1uKTtcclxuICAgIHJldHVybiBwcmVzZXJ2ZWREYXRhQ29sdW1uO1xyXG59O1xyXG5jb25zdCB1c2VVcGRhdGVMYXlvdXQgPSAoaW5kZXgsIGhpZGUpID0+IHtcclxuICAgIGNvbnN0IGNvbnRleHQgPSBSZWFjdC51c2VDb250ZXh0KExheW91dENvbnRleHQpO1xyXG4gICAgaWYgKCFjb250ZXh0KSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBMYXlvdXQgQ29udGV4dC4nKTtcclxuICAgIH1cclxuICAgIGNvbnN0IHsgbGF5b3V0LCB0YWJsZUVsZW1lbnRSZWYsIHRhYmxlTWVtb3J5UmVmIH0gPSBjb250ZXh0O1xyXG4gICAgUmVhY3QudXNlTGF5b3V0RWZmZWN0KCgpID0+IHtcclxuICAgICAgICBjb25zdCBwcmVzZXJ2ZWREYXRhQ29sdW1ucyA9IHRhYmxlTWVtb3J5UmVmLmN1cnJlbnQuZGF0YUNvbHVtbnM7XHJcbiAgICAgICAgY29uc3QgZGF0YUNvbHVtbnMgPSBnZXRIZWFkZXJDb2x1bW5zKHRhYmxlRWxlbWVudFJlZikubWFwKHRvRGF0YUNvbHVtbik7XHJcbiAgICAgICAgY29uc3QgdGhpc1ByZXNlcnZlZERhdGFDb2x1bW4gPSBnZXRQcmVzZXJ2ZWRDb2x1bW4oaW5kZXgsIHByZXNlcnZlZERhdGFDb2x1bW5zKTtcclxuICAgICAgICBjb25zdCBoaWRlU3RhdHVzRGlkTm90Q2hhbmdlID0gdGhpc1ByZXNlcnZlZERhdGFDb2x1bW4/LmlzSGlkZSA9PT0gISFoaWRlO1xyXG4gICAgICAgIGlmICghcHJlc2VydmVkRGF0YUNvbHVtbnM/Lmxlbmd0aCB8fCBoaWRlU3RhdHVzRGlkTm90Q2hhbmdlKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgY29uc3QgdmlzaWJsZURhdGFDb2x1bW5zID0gZGF0YUNvbHVtbnMuZmlsdGVyKChkYXRhQ29sdW1uKSA9PiAhZGF0YUNvbHVtbi5pc0hpZGUpO1xyXG4gICAgICAgIGNvbnN0IGdldFBhcnRpYWxSZXNpemVkTGF5b3V0ID0gKGRhdGFDb2x1bW4pID0+IHtcclxuICAgICAgICAgICAgaWYgKGRhdGFDb2x1bW4uaXNTdGlmZiB8fCBsYXlvdXQ/Lmhvcml6b250YWxTY3JvbGwpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHByZXNlcnZlZERhdGFDb2x1bW4gPSBnZXRQcmVzZXJ2ZWRDb2x1bW4oZGF0YUNvbHVtbi5pbmRleCwgcHJlc2VydmVkRGF0YUNvbHVtbnMpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFwcmVzZXJ2ZWREYXRhQ29sdW1uKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAnbWlubWF4KDBweCwgMWZyKSc7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7cHJlc2VydmVkRGF0YUNvbHVtbi53aWR0aCB8fCBwcmVzZXJ2ZWREYXRhQ29sdW1uLm1pbldpZHRoICogMn1weGA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJ21pbm1heCgwcHgsIDFmciknO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICBjb25zdCByZXNpemVkTGF5b3V0ID0gdmlzaWJsZURhdGFDb2x1bW5zLm1hcChnZXRQYXJ0aWFsUmVzaXplZExheW91dCkuam9pbignICcpO1xyXG4gICAgICAgIHNldFJlc2l6ZWRMYXlvdXQocmVzaXplZExheW91dCwgdGFibGVFbGVtZW50UmVmLCB0YWJsZU1lbW9yeVJlZik7XHJcbiAgICAgICAgcHJvcGFnYXRlUmVzaXplZExheW91dChyZXNpemVkTGF5b3V0LCBsYXlvdXQpO1xyXG4gICAgICAgIGNvbnN0IG5ld1ByZXNlcnZlZERhdGFDb2x1bW5zID0gZ2V0SGVhZGVyQ29sdW1ucyh0YWJsZUVsZW1lbnRSZWYpLm1hcCh0b0RhdGFDb2x1bW4pO1xyXG4gICAgICAgIHRhYmxlTWVtb3J5UmVmLmN1cnJlbnQuZGF0YUNvbHVtbnMgPSBuZXdQcmVzZXJ2ZWREYXRhQ29sdW1ucztcclxuICAgIH0sIFtpbmRleCwgaGlkZSwgbGF5b3V0LCB0YWJsZUVsZW1lbnRSZWYsIHRhYmxlTWVtb3J5UmVmXSk7XHJcbn07XHJcbmV4cG9ydCBjb25zdCBIZWFkZXJDZWxsID0gKHsgaW5kZXgsIGNsYXNzTmFtZSwgaGlkZSwgcGluTGVmdCwgcGluUmlnaHQsIHN0aWZmLCBpc0Zvb3RlciwgaW5jbHVkZVByZXZpb3VzQ29sU3BhbiwgcHJldmlvdXNDb2xTcGFucywgZ3JpZENvbHVtblN0YXJ0LCBncmlkQ29sdW1uRW5kLCByZXNpemUsIHJvbGUgPSAnY29sdW1uaGVhZGVyJywgY2hpbGRyZW4sIHN0eWxlLCAuLi5yZXN0IH0pID0+IHtcclxuICAgIGNvbnN0IHRoZW1lID0gUmVhY3QudXNlQ29udGV4dChUaGVtZUNvbnRleHQpO1xyXG4gICAgdXNlVXBkYXRlTGF5b3V0KGluZGV4LCBoaWRlKTtcclxuICAgIGNvbnN0IHsgY2VsbFJlZiwgcmVzaXplUmVmIH0gPSB1c2VSZXNpemUoaW5kZXgsIGhpZGUpO1xyXG4gICAgY29uc3QgaGFzQ29sU3BhbiA9IGdyaWRDb2x1bW5TdGFydCAmJiBncmlkQ29sdW1uRW5kO1xyXG4gICAgY29uc3QgY29sU3BhbiA9IGhhc0NvbFNwYW4gPyBncmlkQ29sdW1uRW5kIC0gZ3JpZENvbHVtblN0YXJ0IC0gMSA6IDA7XHJcbiAgICBjb25zdCBjb21wdXRlZEdyaWRDb2x1bW5TdGFydCA9IGluY2x1ZGVQcmV2aW91c0NvbFNwYW5cclxuICAgICAgICA/IGdyaWRDb2x1bW5TdGFydCArIHByZXZpb3VzQ29sU3BhbnNcclxuICAgICAgICA6IGdyaWRDb2x1bW5TdGFydDtcclxuICAgIGNvbnN0IGNvbXB1dGVkR3JpZENvbHVtbkVuZCA9IGluY2x1ZGVQcmV2aW91c0NvbFNwYW5cclxuICAgICAgICA/IGdyaWRDb2x1bW5FbmQgKyBwcmV2aW91c0NvbFNwYW5zXHJcbiAgICAgICAgOiBncmlkQ29sdW1uRW5kO1xyXG4gICAgcmV0dXJuICg8PlxuICAgICAgPEhlYWRlckNlbGxDb250YWluZXIgcm9sZT17cm9sZX0gZGF0YS10YWJsZS1saWJyYXJ5X3RoPVwiXCIgZGF0YS1oaWRlPXshIWhpZGV9IGRhdGEtcmVzaXplLW1pbi13aWR0aD17dHlwZW9mIHJlc2l6ZSA9PT0gJ2Jvb2xlYW4nIHx8IHJlc2l6ZT8ubWluV2lkdGggPT0gbnVsbCA/IDc1IDogcmVzaXplLm1pbldpZHRofSBzdHlsZT17e1xyXG4gICAgICAgICAgICAuLi4oaGFzQ29sU3BhblxyXG4gICAgICAgICAgICAgICAgPyB7IGdyaWRDb2x1bW5TdGFydDogY29tcHV0ZWRHcmlkQ29sdW1uU3RhcnQsIGdyaWRDb2x1bW5FbmQ6IGNvbXB1dGVkR3JpZENvbHVtbkVuZCB9XHJcbiAgICAgICAgICAgICAgICA6IHt9KSxcclxuICAgICAgICAgICAgLi4uc3R5bGUsXHJcbiAgICAgICAgfX0gY3NzPXtjc3MgYFxuICAgICAgICAgICR7dGhlbWU/LkJhc2VDZWxsfVxuICAgICAgICAgICR7aXNGb290ZXIgPyB0aGVtZT8uRm9vdGVyQ2VsbCA6IHRoZW1lPy5IZWFkZXJDZWxsfVxuICAgICAgICBgfSBjbGFzc05hbWU9e2NzKCd0aCcsIGNsYXNzTmFtZSwge1xyXG4gICAgICAgICAgICBzdGlmZixcclxuICAgICAgICAgICAgaGlkZSxcclxuICAgICAgICAgICAgcmVzaXplLFxyXG4gICAgICAgICAgICAncGluLWxlZnQnOiBwaW5MZWZ0LFxyXG4gICAgICAgICAgICAncGluLXJpZ2h0JzogcGluUmlnaHQsXHJcbiAgICAgICAgfSl9IHJlZj17Y2VsbFJlZn0gey4uLnJlc3R9PlxuICAgICAgICA8ZGl2PntjaGlsZHJlbn08L2Rpdj5cbiAgICAgICAge3Jlc2l6ZSAmJiAhaGlkZSAmJiAoPGRpdiBjbGFzc05hbWU9XCJyZXNpemVyLWFyZWFcIiByZWY9e3Jlc2l6ZVJlZn0gY3NzPXtyZXNpemVyU3R5bGUocmVzaXplKS5hcmVhfT5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInJlc2l6ZXItaGFuZGxlXCIgY3NzPXtyZXNpemVyU3R5bGUocmVzaXplKS5oYW5kbGV9Lz5cbiAgICAgICAgICA8L2Rpdj4pfVxuICAgICAgPC9IZWFkZXJDZWxsQ29udGFpbmVyPlxuXG4gICAgICBcbiAgICAgIHtBcnJheS5mcm9tKHsgbGVuZ3RoOiBjb2xTcGFuIH0sICgpID0+ICg8SGVhZGVyQ2VsbENvbnRhaW5lciBjbGFzc05hbWU9e2NzKCd0aCcsICdoaWRlJywgJ2NvbHNwYW4nKX0vPikpfVxuICAgIDwvPik7XHJcbn07XHJcbiJdfQ== */"), className: clsx_m_default("th", d2, { stiff: W3, hide: Z2, resize: f, "pin-left": A3, "pin-right": G3 }), ref: Q }, F), jsx("div", null, N), f && !Z2 && jsx("div", { className: "resizer-area", ref: w, css: m(f).area }, jsx("span", { className: "resizer-handle", css: m(f).handle }))), Array.from({ length: k }, function() {
    return jsx(Z, { className: clsx_m_default("th", "hide", "colspan") });
  }));
};

export {
  jsx,
  css,
  n2 as n,
  e2 as e,
  b,
  u,
  G,
  A,
  X,
  d,
  r2 as r,
  p,
  clsx_m_default,
  u2,
  G2,
  W2 as W,
  v
};
//# sourceMappingURL=chunk-RBADCI7F.js.map
