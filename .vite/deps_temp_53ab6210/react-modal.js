import {
  init_react_lifecycles_compat_es,
  react_lifecycles_compat_es_exports,
  require_warning
} from "./chunk-OFHKCT6E.js";
import {
  require_prop_types
} from "./chunk-IQIDLP6P.js";
import {
  require_react_dom
} from "./chunk-UHINIFCJ.js";
import "./chunk-UJE42DUN.js";
import {
  require_react
} from "./chunk-W4EHDCLL.js";
import {
  __commonJS,
  __toCommonJS
} from "./chunk-EWTE5DHJ.js";

// node_modules/react-modal/lib/helpers/tabbable.js
var require_tabbable = __commonJS({
  "node_modules/react-modal/lib/helpers/tabbable.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = findTabbableDescendants;
    var DISPLAY_NONE = "none";
    var DISPLAY_CONTENTS = "contents";
    var tabbableNode = /input|select|textarea|button|object|iframe/;
    function isNotOverflowing(element, style) {
      return style.getPropertyValue("overflow") !== "visible" || // if 'overflow: visible' set, check if there is actually any overflow
      element.scrollWidth <= 0 && element.scrollHeight <= 0;
    }
    function hidesContents(element) {
      var zeroSize = element.offsetWidth <= 0 && element.offsetHeight <= 0;
      if (zeroSize && !element.innerHTML) return true;
      try {
        var style = window.getComputedStyle(element);
        var displayValue = style.getPropertyValue("display");
        return zeroSize ? displayValue !== DISPLAY_CONTENTS && isNotOverflowing(element, style) : displayValue === DISPLAY_NONE;
      } catch (exception) {
        console.warn("Failed to inspect element style");
        return false;
      }
    }
    function visible(element) {
      var parentElement = element;
      var rootNode = element.getRootNode && element.getRootNode();
      while (parentElement) {
        if (parentElement === document.body) break;
        if (rootNode && parentElement === rootNode) parentElement = rootNode.host.parentNode;
        if (hidesContents(parentElement)) return false;
        parentElement = parentElement.parentNode;
      }
      return true;
    }
    function focusable(element, isTabIndexNotNaN) {
      var nodeName = element.nodeName.toLowerCase();
      var res = tabbableNode.test(nodeName) && !element.disabled || (nodeName === "a" ? element.href || isTabIndexNotNaN : isTabIndexNotNaN);
      return res && visible(element);
    }
    function tabbable(element) {
      var tabIndex = element.getAttribute("tabindex");
      if (tabIndex === null) tabIndex = void 0;
      var isTabIndexNaN = isNaN(tabIndex);
      return (isTabIndexNaN || tabIndex >= 0) && focusable(element, !isTabIndexNaN);
    }
    function findTabbableDescendants(element) {
      var descendants = [].slice.call(element.querySelectorAll("*"), 0).reduce(function(finished, el) {
        return finished.concat(!el.shadowRoot ? [el] : findTabbableDescendants(el.shadowRoot));
      }, []);
      return descendants.filter(tabbable);
    }
    module.exports = exports["default"];
  }
});

// node_modules/react-modal/lib/helpers/focusManager.js
var require_focusManager = __commonJS({
  "node_modules/react-modal/lib/helpers/focusManager.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.resetState = resetState;
    exports.log = log;
    exports.handleBlur = handleBlur;
    exports.handleFocus = handleFocus;
    exports.markForFocusLater = markForFocusLater;
    exports.returnFocus = returnFocus;
    exports.popWithoutFocus = popWithoutFocus;
    exports.setupScopedFocus = setupScopedFocus;
    exports.teardownScopedFocus = teardownScopedFocus;
    var _tabbable = require_tabbable();
    var _tabbable2 = _interopRequireDefault(_tabbable);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var focusLaterElements = [];
    var modalElement = null;
    var needToFocus = false;
    function resetState() {
      focusLaterElements = [];
    }
    function log() {
      if (true) {
        console.log("focusManager ----------");
        focusLaterElements.forEach(function(f) {
          var check = f || {};
          console.log(check.nodeName, check.className, check.id);
        });
        console.log("end focusManager ----------");
      }
    }
    function handleBlur() {
      needToFocus = true;
    }
    function handleFocus() {
      if (needToFocus) {
        needToFocus = false;
        if (!modalElement) {
          return;
        }
        setTimeout(function() {
          if (modalElement.contains(document.activeElement)) {
            return;
          }
          var el = (0, _tabbable2.default)(modalElement)[0] || modalElement;
          el.focus();
        }, 0);
      }
    }
    function markForFocusLater() {
      focusLaterElements.push(document.activeElement);
    }
    function returnFocus() {
      var preventScroll = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : false;
      var toFocus = null;
      try {
        if (focusLaterElements.length !== 0) {
          toFocus = focusLaterElements.pop();
          toFocus.focus({ preventScroll });
        }
        return;
      } catch (e) {
        console.warn(["You tried to return focus to", toFocus, "but it is not in the DOM anymore"].join(" "));
      }
    }
    function popWithoutFocus() {
      focusLaterElements.length > 0 && focusLaterElements.pop();
    }
    function setupScopedFocus(element) {
      modalElement = element;
      if (window.addEventListener) {
        window.addEventListener("blur", handleBlur, false);
        document.addEventListener("focus", handleFocus, true);
      } else {
        window.attachEvent("onBlur", handleBlur);
        document.attachEvent("onFocus", handleFocus);
      }
    }
    function teardownScopedFocus() {
      modalElement = null;
      if (window.addEventListener) {
        window.removeEventListener("blur", handleBlur);
        document.removeEventListener("focus", handleFocus);
      } else {
        window.detachEvent("onBlur", handleBlur);
        document.detachEvent("onFocus", handleFocus);
      }
    }
  }
});

// node_modules/react-modal/lib/helpers/scopeTab.js
var require_scopeTab = __commonJS({
  "node_modules/react-modal/lib/helpers/scopeTab.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = scopeTab;
    var _tabbable = require_tabbable();
    var _tabbable2 = _interopRequireDefault(_tabbable);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function getActiveElement() {
      var el = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : document;
      return el.activeElement.shadowRoot ? getActiveElement(el.activeElement.shadowRoot) : el.activeElement;
    }
    function scopeTab(node, event) {
      var tabbable = (0, _tabbable2.default)(node);
      if (!tabbable.length) {
        event.preventDefault();
        return;
      }
      var target = void 0;
      var shiftKey = event.shiftKey;
      var head = tabbable[0];
      var tail = tabbable[tabbable.length - 1];
      var activeElement = getActiveElement();
      if (node === activeElement) {
        if (!shiftKey) return;
        target = tail;
      }
      if (tail === activeElement && !shiftKey) {
        target = head;
      }
      if (head === activeElement && shiftKey) {
        target = tail;
      }
      if (target) {
        event.preventDefault();
        target.focus();
        return;
      }
      var checkSafari = /(\bChrome\b|\bSafari\b)\//.exec(navigator.userAgent);
      var isSafariDesktop = checkSafari != null && checkSafari[1] != "Chrome" && /\biPod\b|\biPad\b/g.exec(navigator.userAgent) == null;
      if (!isSafariDesktop) return;
      var x = tabbable.indexOf(activeElement);
      if (x > -1) {
        x += shiftKey ? -1 : 1;
      }
      target = tabbable[x];
      if (typeof target === "undefined") {
        event.preventDefault();
        target = shiftKey ? tail : head;
        target.focus();
        return;
      }
      event.preventDefault();
      target.focus();
    }
    module.exports = exports["default"];
  }
});

// node_modules/exenv/index.js
var require_exenv = __commonJS({
  "node_modules/exenv/index.js"(exports, module) {
    (function() {
      "use strict";
      var canUseDOM = !!(typeof window !== "undefined" && window.document && window.document.createElement);
      var ExecutionEnvironment = {
        canUseDOM,
        canUseWorkers: typeof Worker !== "undefined",
        canUseEventListeners: canUseDOM && !!(window.addEventListener || window.attachEvent),
        canUseViewport: canUseDOM && !!window.screen
      };
      if (typeof define === "function" && typeof define.amd === "object" && define.amd) {
        define(function() {
          return ExecutionEnvironment;
        });
      } else if (typeof module !== "undefined" && module.exports) {
        module.exports = ExecutionEnvironment;
      } else {
        window.ExecutionEnvironment = ExecutionEnvironment;
      }
    })();
  }
});

// node_modules/react-modal/lib/helpers/safeHTMLElement.js
var require_safeHTMLElement = __commonJS({
  "node_modules/react-modal/lib/helpers/safeHTMLElement.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.canUseDOM = exports.SafeNodeList = exports.SafeHTMLCollection = void 0;
    var _exenv = require_exenv();
    var _exenv2 = _interopRequireDefault(_exenv);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var EE = _exenv2.default;
    var SafeHTMLElement = EE.canUseDOM ? window.HTMLElement : {};
    var SafeHTMLCollection = exports.SafeHTMLCollection = EE.canUseDOM ? window.HTMLCollection : {};
    var SafeNodeList = exports.SafeNodeList = EE.canUseDOM ? window.NodeList : {};
    var canUseDOM = exports.canUseDOM = EE.canUseDOM;
    exports.default = SafeHTMLElement;
  }
});

// node_modules/react-modal/lib/helpers/ariaAppHider.js
var require_ariaAppHider = __commonJS({
  "node_modules/react-modal/lib/helpers/ariaAppHider.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.resetState = resetState;
    exports.log = log;
    exports.assertNodeList = assertNodeList;
    exports.setElement = setElement;
    exports.validateElement = validateElement;
    exports.hide = hide;
    exports.show = show;
    exports.documentNotReadyOrSSRTesting = documentNotReadyOrSSRTesting;
    var _warning = require_warning();
    var _warning2 = _interopRequireDefault(_warning);
    var _safeHTMLElement = require_safeHTMLElement();
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var globalElement = null;
    function resetState() {
      if (globalElement) {
        if (globalElement.removeAttribute) {
          globalElement.removeAttribute("aria-hidden");
        } else if (globalElement.length != null) {
          globalElement.forEach(function(element) {
            return element.removeAttribute("aria-hidden");
          });
        } else {
          document.querySelectorAll(globalElement).forEach(function(element) {
            return element.removeAttribute("aria-hidden");
          });
        }
      }
      globalElement = null;
    }
    function log() {
      if (true) {
        var check = globalElement || {};
        console.log("ariaAppHider ----------");
        console.log(check.nodeName, check.className, check.id);
        console.log("end ariaAppHider ----------");
      }
    }
    function assertNodeList(nodeList, selector) {
      if (!nodeList || !nodeList.length) {
        throw new Error("react-modal: No elements were found for selector " + selector + ".");
      }
    }
    function setElement(element) {
      var useElement = element;
      if (typeof useElement === "string" && _safeHTMLElement.canUseDOM) {
        var el = document.querySelectorAll(useElement);
        assertNodeList(el, useElement);
        useElement = el;
      }
      globalElement = useElement || globalElement;
      return globalElement;
    }
    function validateElement(appElement) {
      var el = appElement || globalElement;
      if (el) {
        return Array.isArray(el) || el instanceof HTMLCollection || el instanceof NodeList ? el : [el];
      } else {
        (0, _warning2.default)(false, ["react-modal: App element is not defined.", "Please use `Modal.setAppElement(el)` or set `appElement={el}`.", "This is needed so screen readers don't see main content", "when modal is opened. It is not recommended, but you can opt-out", "by setting `ariaHideApp={false}`."].join(" "));
        return [];
      }
    }
    function hide(appElement) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = void 0;
      try {
        for (var _iterator = validateElement(appElement)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var el = _step.value;
          el.setAttribute("aria-hidden", "true");
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
    function show(appElement) {
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = void 0;
      try {
        for (var _iterator2 = validateElement(appElement)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var el = _step2.value;
          el.removeAttribute("aria-hidden");
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    }
    function documentNotReadyOrSSRTesting() {
      globalElement = null;
    }
  }
});

// node_modules/react-modal/lib/helpers/classList.js
var require_classList = __commonJS({
  "node_modules/react-modal/lib/helpers/classList.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.resetState = resetState;
    exports.log = log;
    var htmlClassList = {};
    var docBodyClassList = {};
    function removeClass(at, cls) {
      at.classList.remove(cls);
    }
    function resetState() {
      var htmlElement = document.getElementsByTagName("html")[0];
      for (var cls in htmlClassList) {
        removeClass(htmlElement, htmlClassList[cls]);
      }
      var body = document.body;
      for (var _cls in docBodyClassList) {
        removeClass(body, docBodyClassList[_cls]);
      }
      htmlClassList = {};
      docBodyClassList = {};
    }
    function log() {
      if (true) {
        var classes = document.getElementsByTagName("html")[0].className;
        var buffer = "Show tracked classes:\n\n";
        buffer += "<html /> (" + classes + "):\n  ";
        for (var x in htmlClassList) {
          buffer += "  " + x + " " + htmlClassList[x] + "\n  ";
        }
        classes = document.body.className;
        buffer += "\n\ndoc.body (" + classes + "):\n  ";
        for (var _x in docBodyClassList) {
          buffer += "  " + _x + " " + docBodyClassList[_x] + "\n  ";
        }
        buffer += "\n";
        console.log(buffer);
      }
    }
    var incrementReference = function incrementReference2(poll, className) {
      if (!poll[className]) {
        poll[className] = 0;
      }
      poll[className] += 1;
      return className;
    };
    var decrementReference = function decrementReference2(poll, className) {
      if (poll[className]) {
        poll[className] -= 1;
      }
      return className;
    };
    var trackClass = function trackClass2(classListRef, poll, classes) {
      classes.forEach(function(className) {
        incrementReference(poll, className);
        classListRef.add(className);
      });
    };
    var untrackClass = function untrackClass2(classListRef, poll, classes) {
      classes.forEach(function(className) {
        decrementReference(poll, className);
        poll[className] === 0 && classListRef.remove(className);
      });
    };
    var add = exports.add = function add2(element, classString) {
      return trackClass(element.classList, element.nodeName.toLowerCase() == "html" ? htmlClassList : docBodyClassList, classString.split(" "));
    };
    var remove = exports.remove = function remove2(element, classString) {
      return untrackClass(element.classList, element.nodeName.toLowerCase() == "html" ? htmlClassList : docBodyClassList, classString.split(" "));
    };
  }
});

// node_modules/react-modal/lib/helpers/portalOpenInstances.js
var require_portalOpenInstances = __commonJS({
  "node_modules/react-modal/lib/helpers/portalOpenInstances.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.log = log;
    exports.resetState = resetState;
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    var PortalOpenInstances = function PortalOpenInstances2() {
      var _this = this;
      _classCallCheck(this, PortalOpenInstances2);
      this.register = function(openInstance) {
        if (_this.openInstances.indexOf(openInstance) !== -1) {
          if (true) {
            console.warn("React-Modal: Cannot register modal instance that's already open");
          }
          return;
        }
        _this.openInstances.push(openInstance);
        _this.emit("register");
      };
      this.deregister = function(openInstance) {
        var index = _this.openInstances.indexOf(openInstance);
        if (index === -1) {
          if (true) {
            console.warn("React-Modal: Unable to deregister " + openInstance + " as it was never registered");
          }
          return;
        }
        _this.openInstances.splice(index, 1);
        _this.emit("deregister");
      };
      this.subscribe = function(callback) {
        _this.subscribers.push(callback);
      };
      this.emit = function(eventType) {
        _this.subscribers.forEach(function(subscriber) {
          return subscriber(
            eventType,
            // shallow copy to avoid accidental mutation
            _this.openInstances.slice()
          );
        });
      };
      this.openInstances = [];
      this.subscribers = [];
    };
    var portalOpenInstances = new PortalOpenInstances();
    function log() {
      console.log("portalOpenInstances ----------");
      console.log(portalOpenInstances.openInstances.length);
      portalOpenInstances.openInstances.forEach(function(p) {
        return console.log(p);
      });
      console.log("end portalOpenInstances ----------");
    }
    function resetState() {
      portalOpenInstances = new PortalOpenInstances();
    }
    exports.default = portalOpenInstances;
  }
});

// node_modules/react-modal/lib/helpers/bodyTrap.js
var require_bodyTrap = __commonJS({
  "node_modules/react-modal/lib/helpers/bodyTrap.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.resetState = resetState;
    exports.log = log;
    var _portalOpenInstances = require_portalOpenInstances();
    var _portalOpenInstances2 = _interopRequireDefault(_portalOpenInstances);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var before = void 0;
    var after = void 0;
    var instances = [];
    function resetState() {
      var _arr = [before, after];
      for (var _i = 0; _i < _arr.length; _i++) {
        var item = _arr[_i];
        if (!item) continue;
        item.parentNode && item.parentNode.removeChild(item);
      }
      before = after = null;
      instances = [];
    }
    function log() {
      console.log("bodyTrap ----------");
      console.log(instances.length);
      var _arr2 = [before, after];
      for (var _i2 = 0; _i2 < _arr2.length; _i2++) {
        var item = _arr2[_i2];
        var check = item || {};
        console.log(check.nodeName, check.className, check.id);
      }
      console.log("edn bodyTrap ----------");
    }
    function focusContent() {
      if (instances.length === 0) {
        if (true) {
          console.warn("React-Modal: Open instances > 0 expected");
        }
        return;
      }
      instances[instances.length - 1].focusContent();
    }
    function bodyTrap(eventType, openInstances) {
      if (!before && !after) {
        before = document.createElement("div");
        before.setAttribute("data-react-modal-body-trap", "");
        before.style.position = "absolute";
        before.style.opacity = "0";
        before.setAttribute("tabindex", "0");
        before.addEventListener("focus", focusContent);
        after = before.cloneNode();
        after.addEventListener("focus", focusContent);
      }
      instances = openInstances;
      if (instances.length > 0) {
        if (document.body.firstChild !== before) {
          document.body.insertBefore(before, document.body.firstChild);
        }
        if (document.body.lastChild !== after) {
          document.body.appendChild(after);
        }
      } else {
        if (before.parentElement) {
          before.parentElement.removeChild(before);
        }
        if (after.parentElement) {
          after.parentElement.removeChild(after);
        }
      }
    }
    _portalOpenInstances2.default.subscribe(bodyTrap);
  }
});

// node_modules/react-modal/lib/components/ModalPortal.js
var require_ModalPortal = __commonJS({
  "node_modules/react-modal/lib/components/ModalPortal.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _extends = Object.assign || function(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function(obj) {
      return typeof obj;
    } : function(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
    var _createClass = /* @__PURE__ */ function() {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }
      return function(Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
      };
    }();
    var _react = require_react();
    var _propTypes = require_prop_types();
    var _propTypes2 = _interopRequireDefault(_propTypes);
    var _focusManager = require_focusManager();
    var focusManager = _interopRequireWildcard(_focusManager);
    var _scopeTab = require_scopeTab();
    var _scopeTab2 = _interopRequireDefault(_scopeTab);
    var _ariaAppHider = require_ariaAppHider();
    var ariaAppHider = _interopRequireWildcard(_ariaAppHider);
    var _classList = require_classList();
    var classList = _interopRequireWildcard(_classList);
    var _safeHTMLElement = require_safeHTMLElement();
    var _safeHTMLElement2 = _interopRequireDefault(_safeHTMLElement);
    var _portalOpenInstances = require_portalOpenInstances();
    var _portalOpenInstances2 = _interopRequireDefault(_portalOpenInstances);
    require_bodyTrap();
    function _interopRequireWildcard(obj) {
      if (obj && obj.__esModule) {
        return obj;
      } else {
        var newObj = {};
        if (obj != null) {
          for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
          }
        }
        newObj.default = obj;
        return newObj;
      }
    }
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    function _possibleConstructorReturn(self, call) {
      if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }
      return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }
    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }
      subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });
      if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }
    var CLASS_NAMES = {
      overlay: "ReactModal__Overlay",
      content: "ReactModal__Content"
    };
    var isTabKey = function isTabKey2(event) {
      return event.code === "Tab" || event.keyCode === 9;
    };
    var isEscKey = function isEscKey2(event) {
      return event.code === "Escape" || event.keyCode === 27;
    };
    var ariaHiddenInstances = 0;
    var ModalPortal = function(_Component) {
      _inherits(ModalPortal2, _Component);
      function ModalPortal2(props) {
        _classCallCheck(this, ModalPortal2);
        var _this = _possibleConstructorReturn(this, (ModalPortal2.__proto__ || Object.getPrototypeOf(ModalPortal2)).call(this, props));
        _this.setOverlayRef = function(overlay) {
          _this.overlay = overlay;
          _this.props.overlayRef && _this.props.overlayRef(overlay);
        };
        _this.setContentRef = function(content) {
          _this.content = content;
          _this.props.contentRef && _this.props.contentRef(content);
        };
        _this.afterClose = function() {
          var _this$props = _this.props, appElement = _this$props.appElement, ariaHideApp = _this$props.ariaHideApp, htmlOpenClassName = _this$props.htmlOpenClassName, bodyOpenClassName = _this$props.bodyOpenClassName, parentSelector = _this$props.parentSelector;
          var parentDocument = parentSelector && parentSelector().ownerDocument || document;
          bodyOpenClassName && classList.remove(parentDocument.body, bodyOpenClassName);
          htmlOpenClassName && classList.remove(parentDocument.getElementsByTagName("html")[0], htmlOpenClassName);
          if (ariaHideApp && ariaHiddenInstances > 0) {
            ariaHiddenInstances -= 1;
            if (ariaHiddenInstances === 0) {
              ariaAppHider.show(appElement);
            }
          }
          if (_this.props.shouldFocusAfterRender) {
            if (_this.props.shouldReturnFocusAfterClose) {
              focusManager.returnFocus(_this.props.preventScroll);
              focusManager.teardownScopedFocus();
            } else {
              focusManager.popWithoutFocus();
            }
          }
          if (_this.props.onAfterClose) {
            _this.props.onAfterClose();
          }
          _portalOpenInstances2.default.deregister(_this);
        };
        _this.open = function() {
          _this.beforeOpen();
          if (_this.state.afterOpen && _this.state.beforeClose) {
            clearTimeout(_this.closeTimer);
            _this.setState({ beforeClose: false });
          } else {
            if (_this.props.shouldFocusAfterRender) {
              focusManager.setupScopedFocus(_this.node);
              focusManager.markForFocusLater();
            }
            _this.setState({ isOpen: true }, function() {
              _this.openAnimationFrame = requestAnimationFrame(function() {
                _this.setState({ afterOpen: true });
                if (_this.props.isOpen && _this.props.onAfterOpen) {
                  _this.props.onAfterOpen({
                    overlayEl: _this.overlay,
                    contentEl: _this.content
                  });
                }
              });
            });
          }
        };
        _this.close = function() {
          if (_this.props.closeTimeoutMS > 0) {
            _this.closeWithTimeout();
          } else {
            _this.closeWithoutTimeout();
          }
        };
        _this.focusContent = function() {
          return _this.content && !_this.contentHasFocus() && _this.content.focus({ preventScroll: true });
        };
        _this.closeWithTimeout = function() {
          var closesAt = Date.now() + _this.props.closeTimeoutMS;
          _this.setState({ beforeClose: true, closesAt }, function() {
            _this.closeTimer = setTimeout(_this.closeWithoutTimeout, _this.state.closesAt - Date.now());
          });
        };
        _this.closeWithoutTimeout = function() {
          _this.setState({
            beforeClose: false,
            isOpen: false,
            afterOpen: false,
            closesAt: null
          }, _this.afterClose);
        };
        _this.handleKeyDown = function(event) {
          if (isTabKey(event)) {
            (0, _scopeTab2.default)(_this.content, event);
          }
          if (_this.props.shouldCloseOnEsc && isEscKey(event)) {
            event.stopPropagation();
            _this.requestClose(event);
          }
        };
        _this.handleOverlayOnClick = function(event) {
          if (_this.shouldClose === null) {
            _this.shouldClose = true;
          }
          if (_this.shouldClose && _this.props.shouldCloseOnOverlayClick) {
            if (_this.ownerHandlesClose()) {
              _this.requestClose(event);
            } else {
              _this.focusContent();
            }
          }
          _this.shouldClose = null;
        };
        _this.handleContentOnMouseUp = function() {
          _this.shouldClose = false;
        };
        _this.handleOverlayOnMouseDown = function(event) {
          if (!_this.props.shouldCloseOnOverlayClick && event.target == _this.overlay) {
            event.preventDefault();
          }
        };
        _this.handleContentOnClick = function() {
          _this.shouldClose = false;
        };
        _this.handleContentOnMouseDown = function() {
          _this.shouldClose = false;
        };
        _this.requestClose = function(event) {
          return _this.ownerHandlesClose() && _this.props.onRequestClose(event);
        };
        _this.ownerHandlesClose = function() {
          return _this.props.onRequestClose;
        };
        _this.shouldBeClosed = function() {
          return !_this.state.isOpen && !_this.state.beforeClose;
        };
        _this.contentHasFocus = function() {
          return document.activeElement === _this.content || _this.content.contains(document.activeElement);
        };
        _this.buildClassName = function(which, additional) {
          var classNames = (typeof additional === "undefined" ? "undefined" : _typeof(additional)) === "object" ? additional : {
            base: CLASS_NAMES[which],
            afterOpen: CLASS_NAMES[which] + "--after-open",
            beforeClose: CLASS_NAMES[which] + "--before-close"
          };
          var className = classNames.base;
          if (_this.state.afterOpen) {
            className = className + " " + classNames.afterOpen;
          }
          if (_this.state.beforeClose) {
            className = className + " " + classNames.beforeClose;
          }
          return typeof additional === "string" && additional ? className + " " + additional : className;
        };
        _this.attributesFromObject = function(prefix, items) {
          return Object.keys(items).reduce(function(acc, name) {
            acc[prefix + "-" + name] = items[name];
            return acc;
          }, {});
        };
        _this.state = {
          afterOpen: false,
          beforeClose: false
        };
        _this.shouldClose = null;
        _this.moveFromContentToOverlay = null;
        return _this;
      }
      _createClass(ModalPortal2, [{
        key: "componentDidMount",
        value: function componentDidMount() {
          if (this.props.isOpen) {
            this.open();
          }
        }
      }, {
        key: "componentDidUpdate",
        value: function componentDidUpdate(prevProps, prevState) {
          if (true) {
            if (prevProps.bodyOpenClassName !== this.props.bodyOpenClassName) {
              console.warn('React-Modal: "bodyOpenClassName" prop has been modified. This may cause unexpected behavior when multiple modals are open.');
            }
            if (prevProps.htmlOpenClassName !== this.props.htmlOpenClassName) {
              console.warn('React-Modal: "htmlOpenClassName" prop has been modified. This may cause unexpected behavior when multiple modals are open.');
            }
          }
          if (this.props.isOpen && !prevProps.isOpen) {
            this.open();
          } else if (!this.props.isOpen && prevProps.isOpen) {
            this.close();
          }
          if (this.props.shouldFocusAfterRender && this.state.isOpen && !prevState.isOpen) {
            this.focusContent();
          }
        }
      }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
          if (this.state.isOpen) {
            this.afterClose();
          }
          clearTimeout(this.closeTimer);
          cancelAnimationFrame(this.openAnimationFrame);
        }
      }, {
        key: "beforeOpen",
        value: function beforeOpen() {
          var _props = this.props, appElement = _props.appElement, ariaHideApp = _props.ariaHideApp, htmlOpenClassName = _props.htmlOpenClassName, bodyOpenClassName = _props.bodyOpenClassName, parentSelector = _props.parentSelector;
          var parentDocument = parentSelector && parentSelector().ownerDocument || document;
          bodyOpenClassName && classList.add(parentDocument.body, bodyOpenClassName);
          htmlOpenClassName && classList.add(parentDocument.getElementsByTagName("html")[0], htmlOpenClassName);
          if (ariaHideApp) {
            ariaHiddenInstances += 1;
            ariaAppHider.hide(appElement);
          }
          _portalOpenInstances2.default.register(this);
        }
        // Don't steal focus from inner elements
      }, {
        key: "render",
        value: function render() {
          var _props2 = this.props, id = _props2.id, className = _props2.className, overlayClassName = _props2.overlayClassName, defaultStyles = _props2.defaultStyles, children = _props2.children;
          var contentStyles = className ? {} : defaultStyles.content;
          var overlayStyles = overlayClassName ? {} : defaultStyles.overlay;
          if (this.shouldBeClosed()) {
            return null;
          }
          var overlayProps = {
            ref: this.setOverlayRef,
            className: this.buildClassName("overlay", overlayClassName),
            style: _extends({}, overlayStyles, this.props.style.overlay),
            onClick: this.handleOverlayOnClick,
            onMouseDown: this.handleOverlayOnMouseDown
          };
          var contentProps = _extends({
            id,
            ref: this.setContentRef,
            style: _extends({}, contentStyles, this.props.style.content),
            className: this.buildClassName("content", className),
            tabIndex: "-1",
            onKeyDown: this.handleKeyDown,
            onMouseDown: this.handleContentOnMouseDown,
            onMouseUp: this.handleContentOnMouseUp,
            onClick: this.handleContentOnClick,
            role: this.props.role,
            "aria-label": this.props.contentLabel
          }, this.attributesFromObject("aria", _extends({ modal: true }, this.props.aria)), this.attributesFromObject("data", this.props.data || {}), {
            "data-testid": this.props.testId
          });
          var contentElement = this.props.contentElement(contentProps, children);
          return this.props.overlayElement(overlayProps, contentElement);
        }
      }]);
      return ModalPortal2;
    }(_react.Component);
    ModalPortal.defaultProps = {
      style: {
        overlay: {},
        content: {}
      },
      defaultStyles: {}
    };
    ModalPortal.propTypes = {
      isOpen: _propTypes2.default.bool.isRequired,
      defaultStyles: _propTypes2.default.shape({
        content: _propTypes2.default.object,
        overlay: _propTypes2.default.object
      }),
      style: _propTypes2.default.shape({
        content: _propTypes2.default.object,
        overlay: _propTypes2.default.object
      }),
      className: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.object]),
      overlayClassName: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.object]),
      parentSelector: _propTypes2.default.func,
      bodyOpenClassName: _propTypes2.default.string,
      htmlOpenClassName: _propTypes2.default.string,
      ariaHideApp: _propTypes2.default.bool,
      appElement: _propTypes2.default.oneOfType([_propTypes2.default.instanceOf(_safeHTMLElement2.default), _propTypes2.default.instanceOf(_safeHTMLElement.SafeHTMLCollection), _propTypes2.default.instanceOf(_safeHTMLElement.SafeNodeList), _propTypes2.default.arrayOf(_propTypes2.default.instanceOf(_safeHTMLElement2.default))]),
      onAfterOpen: _propTypes2.default.func,
      onAfterClose: _propTypes2.default.func,
      onRequestClose: _propTypes2.default.func,
      closeTimeoutMS: _propTypes2.default.number,
      shouldFocusAfterRender: _propTypes2.default.bool,
      shouldCloseOnOverlayClick: _propTypes2.default.bool,
      shouldReturnFocusAfterClose: _propTypes2.default.bool,
      preventScroll: _propTypes2.default.bool,
      role: _propTypes2.default.string,
      contentLabel: _propTypes2.default.string,
      aria: _propTypes2.default.object,
      data: _propTypes2.default.object,
      children: _propTypes2.default.node,
      shouldCloseOnEsc: _propTypes2.default.bool,
      overlayRef: _propTypes2.default.func,
      contentRef: _propTypes2.default.func,
      id: _propTypes2.default.string,
      overlayElement: _propTypes2.default.func,
      contentElement: _propTypes2.default.func,
      testId: _propTypes2.default.string
    };
    exports.default = ModalPortal;
    module.exports = exports["default"];
  }
});

// node_modules/react-modal/lib/components/Modal.js
var require_Modal = __commonJS({
  "node_modules/react-modal/lib/components/Modal.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.bodyOpenClassName = exports.portalClassName = void 0;
    var _extends = Object.assign || function(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
    var _createClass = /* @__PURE__ */ function() {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }
      return function(Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
      };
    }();
    var _react = require_react();
    var _react2 = _interopRequireDefault(_react);
    var _reactDom = require_react_dom();
    var _reactDom2 = _interopRequireDefault(_reactDom);
    var _propTypes = require_prop_types();
    var _propTypes2 = _interopRequireDefault(_propTypes);
    var _ModalPortal = require_ModalPortal();
    var _ModalPortal2 = _interopRequireDefault(_ModalPortal);
    var _ariaAppHider = require_ariaAppHider();
    var ariaAppHider = _interopRequireWildcard(_ariaAppHider);
    var _safeHTMLElement = require_safeHTMLElement();
    var _safeHTMLElement2 = _interopRequireDefault(_safeHTMLElement);
    var _reactLifecyclesCompat = (init_react_lifecycles_compat_es(), __toCommonJS(react_lifecycles_compat_es_exports));
    function _interopRequireWildcard(obj) {
      if (obj && obj.__esModule) {
        return obj;
      } else {
        var newObj = {};
        if (obj != null) {
          for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
          }
        }
        newObj.default = obj;
        return newObj;
      }
    }
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    function _possibleConstructorReturn(self, call) {
      if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }
      return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }
    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }
      subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });
      if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }
    var portalClassName = exports.portalClassName = "ReactModalPortal";
    var bodyOpenClassName = exports.bodyOpenClassName = "ReactModal__Body--open";
    var isReact16 = _safeHTMLElement.canUseDOM && _reactDom2.default.createPortal !== void 0;
    var createHTMLElement = function createHTMLElement2(name) {
      return document.createElement(name);
    };
    var getCreatePortal = function getCreatePortal2() {
      return isReact16 ? _reactDom2.default.createPortal : _reactDom2.default.unstable_renderSubtreeIntoContainer;
    };
    function getParentElement(parentSelector) {
      return parentSelector();
    }
    var Modal = function(_Component) {
      _inherits(Modal2, _Component);
      function Modal2() {
        var _ref;
        var _temp, _this, _ret;
        _classCallCheck(this, Modal2);
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Modal2.__proto__ || Object.getPrototypeOf(Modal2)).call.apply(_ref, [this].concat(args))), _this), _this.removePortal = function() {
          !isReact16 && _reactDom2.default.unmountComponentAtNode(_this.node);
          var parent = getParentElement(_this.props.parentSelector);
          if (parent && parent.contains(_this.node)) {
            parent.removeChild(_this.node);
          } else {
            console.warn('React-Modal: "parentSelector" prop did not returned any DOM element. Make sure that the parent element is unmounted to avoid any memory leaks.');
          }
        }, _this.portalRef = function(ref) {
          _this.portal = ref;
        }, _this.renderPortal = function(props) {
          var createPortal = getCreatePortal();
          var portal = createPortal(_this, _react2.default.createElement(_ModalPortal2.default, _extends({ defaultStyles: Modal2.defaultStyles }, props)), _this.node);
          _this.portalRef(portal);
        }, _temp), _possibleConstructorReturn(_this, _ret);
      }
      _createClass(Modal2, [{
        key: "componentDidMount",
        value: function componentDidMount() {
          if (!_safeHTMLElement.canUseDOM) return;
          if (!isReact16) {
            this.node = createHTMLElement("div");
          }
          this.node.className = this.props.portalClassName;
          var parent = getParentElement(this.props.parentSelector);
          parent.appendChild(this.node);
          !isReact16 && this.renderPortal(this.props);
        }
      }, {
        key: "getSnapshotBeforeUpdate",
        value: function getSnapshotBeforeUpdate(prevProps) {
          var prevParent = getParentElement(prevProps.parentSelector);
          var nextParent = getParentElement(this.props.parentSelector);
          return { prevParent, nextParent };
        }
      }, {
        key: "componentDidUpdate",
        value: function componentDidUpdate(prevProps, _, snapshot) {
          if (!_safeHTMLElement.canUseDOM) return;
          var _props = this.props, isOpen = _props.isOpen, portalClassName2 = _props.portalClassName;
          if (prevProps.portalClassName !== portalClassName2) {
            this.node.className = portalClassName2;
          }
          var prevParent = snapshot.prevParent, nextParent = snapshot.nextParent;
          if (nextParent !== prevParent) {
            prevParent.removeChild(this.node);
            nextParent.appendChild(this.node);
          }
          if (!prevProps.isOpen && !isOpen) return;
          !isReact16 && this.renderPortal(this.props);
        }
      }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
          if (!_safeHTMLElement.canUseDOM || !this.node || !this.portal) return;
          var state = this.portal.state;
          var now = Date.now();
          var closesAt = state.isOpen && this.props.closeTimeoutMS && (state.closesAt || now + this.props.closeTimeoutMS);
          if (closesAt) {
            if (!state.beforeClose) {
              this.portal.closeWithTimeout();
            }
            setTimeout(this.removePortal, closesAt - now);
          } else {
            this.removePortal();
          }
        }
      }, {
        key: "render",
        value: function render() {
          if (!_safeHTMLElement.canUseDOM || !isReact16) {
            return null;
          }
          if (!this.node && isReact16) {
            this.node = createHTMLElement("div");
          }
          var createPortal = getCreatePortal();
          return createPortal(_react2.default.createElement(_ModalPortal2.default, _extends({
            ref: this.portalRef,
            defaultStyles: Modal2.defaultStyles
          }, this.props)), this.node);
        }
      }], [{
        key: "setAppElement",
        value: function setAppElement(element) {
          ariaAppHider.setElement(element);
        }
        /* eslint-disable react/no-unused-prop-types */
        /* eslint-enable react/no-unused-prop-types */
      }]);
      return Modal2;
    }(_react.Component);
    Modal.propTypes = {
      isOpen: _propTypes2.default.bool.isRequired,
      style: _propTypes2.default.shape({
        content: _propTypes2.default.object,
        overlay: _propTypes2.default.object
      }),
      portalClassName: _propTypes2.default.string,
      bodyOpenClassName: _propTypes2.default.string,
      htmlOpenClassName: _propTypes2.default.string,
      className: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.shape({
        base: _propTypes2.default.string.isRequired,
        afterOpen: _propTypes2.default.string.isRequired,
        beforeClose: _propTypes2.default.string.isRequired
      })]),
      overlayClassName: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.shape({
        base: _propTypes2.default.string.isRequired,
        afterOpen: _propTypes2.default.string.isRequired,
        beforeClose: _propTypes2.default.string.isRequired
      })]),
      appElement: _propTypes2.default.oneOfType([_propTypes2.default.instanceOf(_safeHTMLElement2.default), _propTypes2.default.instanceOf(_safeHTMLElement.SafeHTMLCollection), _propTypes2.default.instanceOf(_safeHTMLElement.SafeNodeList), _propTypes2.default.arrayOf(_propTypes2.default.instanceOf(_safeHTMLElement2.default))]),
      onAfterOpen: _propTypes2.default.func,
      onRequestClose: _propTypes2.default.func,
      closeTimeoutMS: _propTypes2.default.number,
      ariaHideApp: _propTypes2.default.bool,
      shouldFocusAfterRender: _propTypes2.default.bool,
      shouldCloseOnOverlayClick: _propTypes2.default.bool,
      shouldReturnFocusAfterClose: _propTypes2.default.bool,
      preventScroll: _propTypes2.default.bool,
      parentSelector: _propTypes2.default.func,
      aria: _propTypes2.default.object,
      data: _propTypes2.default.object,
      role: _propTypes2.default.string,
      contentLabel: _propTypes2.default.string,
      shouldCloseOnEsc: _propTypes2.default.bool,
      overlayRef: _propTypes2.default.func,
      contentRef: _propTypes2.default.func,
      id: _propTypes2.default.string,
      overlayElement: _propTypes2.default.func,
      contentElement: _propTypes2.default.func
    };
    Modal.defaultProps = {
      isOpen: false,
      portalClassName,
      bodyOpenClassName,
      role: "dialog",
      ariaHideApp: true,
      closeTimeoutMS: 0,
      shouldFocusAfterRender: true,
      shouldCloseOnEsc: true,
      shouldCloseOnOverlayClick: true,
      shouldReturnFocusAfterClose: true,
      preventScroll: false,
      parentSelector: function parentSelector() {
        return document.body;
      },
      overlayElement: function overlayElement(props, contentEl) {
        return _react2.default.createElement(
          "div",
          props,
          contentEl
        );
      },
      contentElement: function contentElement(props, children) {
        return _react2.default.createElement(
          "div",
          props,
          children
        );
      }
    };
    Modal.defaultStyles = {
      overlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(255, 255, 255, 0.75)"
      },
      content: {
        position: "absolute",
        top: "40px",
        left: "40px",
        right: "40px",
        bottom: "40px",
        border: "1px solid #ccc",
        background: "#fff",
        overflow: "auto",
        WebkitOverflowScrolling: "touch",
        borderRadius: "4px",
        outline: "none",
        padding: "20px"
      }
    };
    (0, _reactLifecyclesCompat.polyfill)(Modal);
    if (true) {
      Modal.setCreateHTMLElement = function(fn) {
        return createHTMLElement = fn;
      };
    }
    exports.default = Modal;
  }
});

// node_modules/react-modal/lib/index.js
var require_lib = __commonJS({
  "node_modules/react-modal/lib/index.js"(exports, module) {
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _Modal = require_Modal();
    var _Modal2 = _interopRequireDefault(_Modal);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    exports.default = _Modal2.default;
    module.exports = exports["default"];
  }
});
export default require_lib();
/*! Bundled license information:

react-modal/lib/helpers/tabbable.js:
  (*!
   * Adapted from jQuery UI core
   *
   * http://jqueryui.com
   *
   * Copyright 2014 jQuery Foundation and other contributors
   * Released under the MIT license.
   * http://jquery.org/license
   *
   * http://api.jqueryui.com/category/ui-core/
   *)

exenv/index.js:
  (*!
    Copyright (c) 2015 Jed Watson.
    Based on code that is Copyright 2013-2015, Facebook, Inc.
    All rights reserved.
  *)
*/
//# sourceMappingURL=react-modal.js.map
