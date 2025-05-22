import {
  Tooltip_default,
  getInitialPopperStyles,
  getOverlayDirection
} from "./chunk-TIWDOYR6.js";
import {
  arrow_default,
  computeStyles_default,
  eventListeners_default,
  flip_default,
  hide_default,
  offset_default,
  popperGenerator,
  popperOffsets_default,
  preventOverflow_default,
  useSafeState_default,
  useUncontrolledProp
} from "./chunk-J2H2JMVC.js";
import {
  require_warning
} from "./chunk-OFHKCT6E.js";
import {
  Fade_default,
  isEscKey,
  renderTransition,
  safeFindDOMNode,
  useIsomorphicEffect_default,
  useWaitForDOMRef
} from "./chunk-EDNDKAQK.js";
import {
  contains,
  hasClass,
  listen_default,
  ownerDocument,
  useCallbackRef,
  useEventCallback,
  useMergedRefs_default,
  useMounted,
  useWillUnmount
} from "./chunk-DU2TMUUJ.js";
import {
  require_prop_types
} from "./chunk-IQIDLP6P.js";
import {
  require_react_dom
} from "./chunk-UHINIFCJ.js";
import {
  require_classnames,
  require_jsx_runtime,
  useBootstrapPrefix,
  useIsRTL
} from "./chunk-6RCSRPQS.js";
import {
  require_react
} from "./chunk-W4EHDCLL.js";
import {
  __toESM
} from "./chunk-EWTE5DHJ.js";

// node_modules/react-bootstrap/esm/OverlayTrigger.js
var import_prop_types = __toESM(require_prop_types());
var React6 = __toESM(require_react());
var import_react8 = __toESM(require_react());

// node_modules/@restart/hooks/esm/useTimeout.js
var import_react = __toESM(require_react());
var MAX_DELAY_MS = 2 ** 31 - 1;
function setChainedTimeout(handleRef, fn, timeoutAtMs) {
  const delayMs = timeoutAtMs - Date.now();
  handleRef.current = delayMs <= MAX_DELAY_MS ? setTimeout(fn, delayMs) : setTimeout(() => setChainedTimeout(handleRef, fn, timeoutAtMs), MAX_DELAY_MS);
}
function useTimeout() {
  const isMounted = useMounted();
  const handleRef = (0, import_react.useRef)();
  useWillUnmount(() => clearTimeout(handleRef.current));
  return (0, import_react.useMemo)(() => {
    const clear = () => clearTimeout(handleRef.current);
    function set(fn, delayMs = 0) {
      if (!isMounted()) return;
      clear();
      if (delayMs <= MAX_DELAY_MS) {
        handleRef.current = setTimeout(fn, delayMs);
      } else {
        setChainedTimeout(handleRef, fn, Date.now() + delayMs);
      }
    }
    return {
      set,
      clear,
      handleRef
    };
  }, []);
}

// node_modules/react-bootstrap/esm/OverlayTrigger.js
var import_warning2 = __toESM(require_warning());

// node_modules/react-bootstrap/esm/Overlay.js
var React5 = __toESM(require_react());
var import_react7 = __toESM(require_react());
var import_classnames4 = __toESM(require_classnames());

// node_modules/@restart/ui/esm/Overlay.js
var React = __toESM(require_react());
var import_react_dom = __toESM(require_react_dom());
var import_react5 = __toESM(require_react());

// node_modules/@restart/ui/esm/usePopper.js
var import_react2 = __toESM(require_react());

// node_modules/dequal/dist/index.mjs
var has = Object.prototype.hasOwnProperty;
function find(iter, tar, key) {
  for (key of iter.keys()) {
    if (dequal(key, tar)) return key;
  }
}
function dequal(foo, bar) {
  var ctor, len, tmp;
  if (foo === bar) return true;
  if (foo && bar && (ctor = foo.constructor) === bar.constructor) {
    if (ctor === Date) return foo.getTime() === bar.getTime();
    if (ctor === RegExp) return foo.toString() === bar.toString();
    if (ctor === Array) {
      if ((len = foo.length) === bar.length) {
        while (len-- && dequal(foo[len], bar[len])) ;
      }
      return len === -1;
    }
    if (ctor === Set) {
      if (foo.size !== bar.size) {
        return false;
      }
      for (len of foo) {
        tmp = len;
        if (tmp && typeof tmp === "object") {
          tmp = find(bar, tmp);
          if (!tmp) return false;
        }
        if (!bar.has(tmp)) return false;
      }
      return true;
    }
    if (ctor === Map) {
      if (foo.size !== bar.size) {
        return false;
      }
      for (len of foo) {
        tmp = len[0];
        if (tmp && typeof tmp === "object") {
          tmp = find(bar, tmp);
          if (!tmp) return false;
        }
        if (!dequal(len[1], bar.get(tmp))) {
          return false;
        }
      }
      return true;
    }
    if (ctor === ArrayBuffer) {
      foo = new Uint8Array(foo);
      bar = new Uint8Array(bar);
    } else if (ctor === DataView) {
      if ((len = foo.byteLength) === bar.byteLength) {
        while (len-- && foo.getInt8(len) === bar.getInt8(len)) ;
      }
      return len === -1;
    }
    if (ArrayBuffer.isView(foo)) {
      if ((len = foo.byteLength) === bar.byteLength) {
        while (len-- && foo[len] === bar[len]) ;
      }
      return len === -1;
    }
    if (!ctor || typeof foo === "object") {
      len = 0;
      for (ctor in foo) {
        if (has.call(foo, ctor) && ++len && !has.call(bar, ctor)) return false;
        if (!(ctor in bar) || !dequal(foo[ctor], bar[ctor])) return false;
      }
      return Object.keys(bar).length === len;
    }
  }
  return foo !== foo && bar !== bar;
}

// node_modules/@restart/ui/esm/popper.js
var createPopper = popperGenerator({
  defaultModifiers: [hide_default, popperOffsets_default, computeStyles_default, eventListeners_default, offset_default, flip_default, preventOverflow_default, arrow_default]
});

// node_modules/@restart/ui/esm/usePopper.js
var _excluded = ["enabled", "placement", "strategy", "modifiers"];
function _objectWithoutPropertiesLoose(r, e) {
  if (null == r) return {};
  var t = {};
  for (var n in r) if ({}.hasOwnProperty.call(r, n)) {
    if (e.indexOf(n) >= 0) continue;
    t[n] = r[n];
  }
  return t;
}
var disabledApplyStylesModifier = {
  name: "applyStyles",
  enabled: false,
  phase: "afterWrite",
  fn: () => void 0
};
var ariaDescribedByModifier = {
  name: "ariaDescribedBy",
  enabled: true,
  phase: "afterWrite",
  effect: ({
    state
  }) => () => {
    const {
      reference,
      popper
    } = state.elements;
    if ("removeAttribute" in reference) {
      const ids = (reference.getAttribute("aria-describedby") || "").split(",").filter((id) => id.trim() !== popper.id);
      if (!ids.length) reference.removeAttribute("aria-describedby");
      else reference.setAttribute("aria-describedby", ids.join(","));
    }
  },
  fn: ({
    state
  }) => {
    var _popper$getAttribute;
    const {
      popper,
      reference
    } = state.elements;
    const role = (_popper$getAttribute = popper.getAttribute("role")) == null ? void 0 : _popper$getAttribute.toLowerCase();
    if (popper.id && role === "tooltip" && "setAttribute" in reference) {
      const ids = reference.getAttribute("aria-describedby");
      if (ids && ids.split(",").indexOf(popper.id) !== -1) {
        return;
      }
      reference.setAttribute("aria-describedby", ids ? `${ids},${popper.id}` : popper.id);
    }
  }
};
var EMPTY_MODIFIERS = [];
function usePopper(referenceElement, popperElement, _ref = {}) {
  let {
    enabled = true,
    placement = "bottom",
    strategy = "absolute",
    modifiers = EMPTY_MODIFIERS
  } = _ref, config = _objectWithoutPropertiesLoose(_ref, _excluded);
  const prevModifiers = (0, import_react2.useRef)(modifiers);
  const popperInstanceRef = (0, import_react2.useRef)();
  const update = (0, import_react2.useCallback)(() => {
    var _popperInstanceRef$cu;
    (_popperInstanceRef$cu = popperInstanceRef.current) == null ? void 0 : _popperInstanceRef$cu.update();
  }, []);
  const forceUpdate = (0, import_react2.useCallback)(() => {
    var _popperInstanceRef$cu2;
    (_popperInstanceRef$cu2 = popperInstanceRef.current) == null ? void 0 : _popperInstanceRef$cu2.forceUpdate();
  }, []);
  const [popperState, setState] = useSafeState_default((0, import_react2.useState)({
    placement,
    update,
    forceUpdate,
    attributes: {},
    styles: {
      popper: {},
      arrow: {}
    }
  }));
  const updateModifier = (0, import_react2.useMemo)(() => ({
    name: "updateStateModifier",
    enabled: true,
    phase: "write",
    requires: ["computeStyles"],
    fn: ({
      state
    }) => {
      const styles = {};
      const attributes = {};
      Object.keys(state.elements).forEach((element) => {
        styles[element] = state.styles[element];
        attributes[element] = state.attributes[element];
      });
      setState({
        state,
        styles,
        attributes,
        update,
        forceUpdate,
        placement: state.placement
      });
    }
  }), [update, forceUpdate, setState]);
  const nextModifiers = (0, import_react2.useMemo)(() => {
    if (!dequal(prevModifiers.current, modifiers)) {
      prevModifiers.current = modifiers;
    }
    return prevModifiers.current;
  }, [modifiers]);
  (0, import_react2.useEffect)(() => {
    if (!popperInstanceRef.current || !enabled) return;
    popperInstanceRef.current.setOptions({
      placement,
      strategy,
      modifiers: [...nextModifiers, updateModifier, disabledApplyStylesModifier]
    });
  }, [strategy, placement, updateModifier, enabled, nextModifiers]);
  (0, import_react2.useEffect)(() => {
    if (!enabled || referenceElement == null || popperElement == null) {
      return void 0;
    }
    popperInstanceRef.current = createPopper(referenceElement, popperElement, Object.assign({}, config, {
      placement,
      strategy,
      modifiers: [...nextModifiers, ariaDescribedByModifier, updateModifier]
    }));
    return () => {
      if (popperInstanceRef.current != null) {
        popperInstanceRef.current.destroy();
        popperInstanceRef.current = void 0;
        setState((s) => Object.assign({}, s, {
          attributes: {},
          styles: {
            popper: {}
          }
        }));
      }
    };
  }, [enabled, referenceElement, popperElement]);
  return popperState;
}
var usePopper_default = usePopper;

// node_modules/@restart/ui/esm/useRootClose.js
var import_react4 = __toESM(require_react());

// node_modules/@restart/ui/esm/useClickOutside.js
var import_react3 = __toESM(require_react());
var import_warning = __toESM(require_warning());
var noop = () => {
};
function isLeftClickEvent(event) {
  return event.button === 0;
}
function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}
var getRefTarget = (ref) => ref && ("current" in ref ? ref.current : ref);
var InitialTriggerEvents = {
  click: "mousedown",
  mouseup: "mousedown",
  pointerup: "pointerdown"
};
function useClickOutside(ref, onClickOutside = noop, {
  disabled,
  clickTrigger = "click"
} = {}) {
  const preventMouseClickOutsideRef = (0, import_react3.useRef)(false);
  const waitingForTrigger = (0, import_react3.useRef)(false);
  const handleMouseCapture = (0, import_react3.useCallback)((e) => {
    const currentTarget = getRefTarget(ref);
    (0, import_warning.default)(!!currentTarget, "ClickOutside captured a close event but does not have a ref to compare it to. useClickOutside(), should be passed a ref that resolves to a DOM node");
    preventMouseClickOutsideRef.current = !currentTarget || isModifiedEvent(e) || !isLeftClickEvent(e) || !!contains(currentTarget, e.target) || waitingForTrigger.current;
    waitingForTrigger.current = false;
  }, [ref]);
  const handleInitialMouse = useEventCallback((e) => {
    const currentTarget = getRefTarget(ref);
    if (currentTarget && contains(currentTarget, e.target)) {
      waitingForTrigger.current = true;
    }
  });
  const handleMouse = useEventCallback((e) => {
    if (!preventMouseClickOutsideRef.current) {
      onClickOutside(e);
    }
  });
  (0, import_react3.useEffect)(() => {
    var _ownerWindow$event, _ownerWindow$parent;
    if (disabled || ref == null) return void 0;
    const doc = ownerDocument(getRefTarget(ref));
    const ownerWindow = doc.defaultView || window;
    let currentEvent = (_ownerWindow$event = ownerWindow.event) != null ? _ownerWindow$event : (_ownerWindow$parent = ownerWindow.parent) == null ? void 0 : _ownerWindow$parent.event;
    let removeInitialTriggerListener = null;
    if (InitialTriggerEvents[clickTrigger]) {
      removeInitialTriggerListener = listen_default(doc, InitialTriggerEvents[clickTrigger], handleInitialMouse, true);
    }
    const removeMouseCaptureListener = listen_default(doc, clickTrigger, handleMouseCapture, true);
    const removeMouseListener = listen_default(doc, clickTrigger, (e) => {
      if (e === currentEvent) {
        currentEvent = void 0;
        return;
      }
      handleMouse(e);
    });
    let mobileSafariHackListeners = [];
    if ("ontouchstart" in doc.documentElement) {
      mobileSafariHackListeners = [].slice.call(doc.body.children).map((el) => listen_default(el, "mousemove", noop));
    }
    return () => {
      removeInitialTriggerListener == null ? void 0 : removeInitialTriggerListener();
      removeMouseCaptureListener();
      removeMouseListener();
      mobileSafariHackListeners.forEach((remove) => remove());
    };
  }, [ref, disabled, clickTrigger, handleMouseCapture, handleInitialMouse, handleMouse]);
}
var useClickOutside_default = useClickOutside;

// node_modules/@restart/ui/esm/useRootClose.js
var noop2 = () => {
};
function useRootClose(ref, onRootClose, {
  disabled,
  clickTrigger
} = {}) {
  const onClose = onRootClose || noop2;
  useClickOutside_default(ref, onClose, {
    disabled,
    clickTrigger
  });
  const handleKeyUp = useEventCallback((e) => {
    if (isEscKey(e)) {
      onClose(e);
    }
  });
  (0, import_react4.useEffect)(() => {
    if (disabled || ref == null) return void 0;
    const doc = ownerDocument(getRefTarget(ref));
    let currentEvent = (doc.defaultView || window).event;
    const removeKeyupListener = listen_default(doc, "keyup", (e) => {
      if (e === currentEvent) {
        currentEvent = void 0;
        return;
      }
      handleKeyUp(e);
    });
    return () => {
      removeKeyupListener();
    };
  }, [ref, disabled, handleKeyUp]);
}
var useRootClose_default = useRootClose;

// node_modules/@restart/ui/esm/mergeOptionsWithPopperConfig.js
function toModifierMap(modifiers) {
  const result = {};
  if (!Array.isArray(modifiers)) {
    return modifiers || result;
  }
  modifiers == null ? void 0 : modifiers.forEach((m) => {
    result[m.name] = m;
  });
  return result;
}
function toModifierArray(map = {}) {
  if (Array.isArray(map)) return map;
  return Object.keys(map).map((k) => {
    map[k].name = k;
    return map[k];
  });
}
function mergeOptionsWithPopperConfig({
  enabled,
  enableEvents,
  placement,
  flip,
  offset,
  fixed,
  containerPadding,
  arrowElement,
  popperConfig = {}
}) {
  var _modifiers$eventListe, _modifiers$preventOve, _modifiers$preventOve2, _modifiers$offset, _modifiers$arrow;
  const modifiers = toModifierMap(popperConfig.modifiers);
  return Object.assign({}, popperConfig, {
    placement,
    enabled,
    strategy: fixed ? "fixed" : popperConfig.strategy,
    modifiers: toModifierArray(Object.assign({}, modifiers, {
      eventListeners: {
        enabled: enableEvents,
        options: (_modifiers$eventListe = modifiers.eventListeners) == null ? void 0 : _modifiers$eventListe.options
      },
      preventOverflow: Object.assign({}, modifiers.preventOverflow, {
        options: containerPadding ? Object.assign({
          padding: containerPadding
        }, (_modifiers$preventOve = modifiers.preventOverflow) == null ? void 0 : _modifiers$preventOve.options) : (_modifiers$preventOve2 = modifiers.preventOverflow) == null ? void 0 : _modifiers$preventOve2.options
      }),
      offset: {
        options: Object.assign({
          offset
        }, (_modifiers$offset = modifiers.offset) == null ? void 0 : _modifiers$offset.options)
      },
      arrow: Object.assign({}, modifiers.arrow, {
        enabled: !!arrowElement,
        options: Object.assign({}, (_modifiers$arrow = modifiers.arrow) == null ? void 0 : _modifiers$arrow.options, {
          element: arrowElement
        })
      }),
      flip: Object.assign({
        enabled: !!flip
      }, modifiers.flip)
    }))
  });
}

// node_modules/@restart/ui/esm/Overlay.js
var Overlay = React.forwardRef((props, outerRef) => {
  const {
    flip,
    offset,
    placement,
    containerPadding,
    popperConfig = {},
    transition: Transition,
    runTransition
  } = props;
  const [rootElement, attachRef] = useCallbackRef();
  const [arrowElement, attachArrowRef] = useCallbackRef();
  const mergedRef = useMergedRefs_default(attachRef, outerRef);
  const container = useWaitForDOMRef(props.container);
  const target = useWaitForDOMRef(props.target);
  const [exited, setExited] = (0, import_react5.useState)(!props.show);
  const popper = usePopper_default(target, rootElement, mergeOptionsWithPopperConfig({
    placement,
    enableEvents: !!props.show,
    containerPadding: containerPadding || 5,
    flip,
    offset,
    arrowElement,
    popperConfig
  }));
  if (props.show && exited) {
    setExited(false);
  }
  const handleHidden = (...args) => {
    setExited(true);
    if (props.onExited) {
      props.onExited(...args);
    }
  };
  const mountOverlay = props.show || !exited;
  useRootClose_default(rootElement, props.onHide, {
    disabled: !props.rootClose || props.rootCloseDisabled,
    clickTrigger: props.rootCloseEvent
  });
  if (!mountOverlay) {
    return null;
  }
  const {
    onExit,
    onExiting,
    onEnter,
    onEntering,
    onEntered
  } = props;
  let child = props.children(Object.assign({}, popper.attributes.popper, {
    style: popper.styles.popper,
    ref: mergedRef
  }), {
    popper,
    placement,
    show: !!props.show,
    arrowProps: Object.assign({}, popper.attributes.arrow, {
      style: popper.styles.arrow,
      ref: attachArrowRef
    })
  });
  child = renderTransition(Transition, runTransition, {
    in: !!props.show,
    appear: true,
    mountOnEnter: true,
    unmountOnExit: true,
    children: child,
    onExit,
    onExiting,
    onExited: handleHidden,
    onEnter,
    onEntering,
    onEntered
  });
  return container ? import_react_dom.default.createPortal(child, container) : null;
});
Overlay.displayName = "Overlay";
var Overlay_default = Overlay;

// node_modules/react-bootstrap/esm/useOverlayOffset.js
var import_react6 = __toESM(require_react());

// node_modules/react-bootstrap/esm/Popover.js
var import_classnames3 = __toESM(require_classnames());
var React4 = __toESM(require_react());

// node_modules/react-bootstrap/esm/PopoverHeader.js
var React2 = __toESM(require_react());
var import_classnames = __toESM(require_classnames());
var import_jsx_runtime = __toESM(require_jsx_runtime());
var PopoverHeader = React2.forwardRef(({
  className,
  bsPrefix,
  as: Component = "div",
  ...props
}, ref) => {
  bsPrefix = useBootstrapPrefix(bsPrefix, "popover-header");
  return (0, import_jsx_runtime.jsx)(Component, {
    ref,
    className: (0, import_classnames.default)(className, bsPrefix),
    ...props
  });
});
PopoverHeader.displayName = "PopoverHeader";
var PopoverHeader_default = PopoverHeader;

// node_modules/react-bootstrap/esm/PopoverBody.js
var React3 = __toESM(require_react());
var import_classnames2 = __toESM(require_classnames());
var import_jsx_runtime2 = __toESM(require_jsx_runtime());
var PopoverBody = React3.forwardRef(({
  className,
  bsPrefix,
  as: Component = "div",
  ...props
}, ref) => {
  bsPrefix = useBootstrapPrefix(bsPrefix, "popover-body");
  return (0, import_jsx_runtime2.jsx)(Component, {
    ref,
    className: (0, import_classnames2.default)(className, bsPrefix),
    ...props
  });
});
PopoverBody.displayName = "PopoverBody";
var PopoverBody_default = PopoverBody;

// node_modules/react-bootstrap/esm/Popover.js
var import_jsx_runtime3 = __toESM(require_jsx_runtime());
var import_jsx_runtime4 = __toESM(require_jsx_runtime());
var Popover = React4.forwardRef(({
  bsPrefix,
  placement = "right",
  className,
  style,
  children,
  body,
  arrowProps,
  hasDoneInitialMeasure,
  popper,
  show,
  ...props
}, ref) => {
  const decoratedBsPrefix = useBootstrapPrefix(bsPrefix, "popover");
  const isRTL = useIsRTL();
  const [primaryPlacement] = (placement == null ? void 0 : placement.split("-")) || [];
  const bsDirection = getOverlayDirection(primaryPlacement, isRTL);
  let computedStyle = style;
  if (show && !hasDoneInitialMeasure) {
    computedStyle = {
      ...style,
      ...getInitialPopperStyles(popper == null ? void 0 : popper.strategy)
    };
  }
  return (0, import_jsx_runtime4.jsxs)("div", {
    ref,
    role: "tooltip",
    style: computedStyle,
    "x-placement": primaryPlacement,
    className: (0, import_classnames3.default)(className, decoratedBsPrefix, primaryPlacement && `bs-popover-${bsDirection}`),
    ...props,
    children: [(0, import_jsx_runtime3.jsx)("div", {
      className: "popover-arrow",
      ...arrowProps
    }), body ? (0, import_jsx_runtime3.jsx)(PopoverBody_default, {
      children
    }) : children]
  });
});
var Popover_default = Object.assign(Popover, {
  Header: PopoverHeader_default,
  Body: PopoverBody_default,
  // Default popover offset.
  // https://github.com/twbs/bootstrap/blob/5c32767e0e0dbac2d934bcdee03719a65d3f1187/js/src/popover.js#L28
  POPPER_OFFSET: [0, 8]
});

// node_modules/react-bootstrap/esm/useOverlayOffset.js
function useOverlayOffset(customOffset) {
  const overlayRef = (0, import_react6.useRef)(null);
  const popoverClass = useBootstrapPrefix(void 0, "popover");
  const tooltipClass = useBootstrapPrefix(void 0, "tooltip");
  const offset = (0, import_react6.useMemo)(() => ({
    name: "offset",
    options: {
      offset: () => {
        if (customOffset) {
          return customOffset;
        }
        if (overlayRef.current) {
          if (hasClass(overlayRef.current, popoverClass)) {
            return Popover_default.POPPER_OFFSET;
          }
          if (hasClass(overlayRef.current, tooltipClass)) {
            return Tooltip_default.TOOLTIP_OFFSET;
          }
        }
        return [0, 0];
      }
    }
  }), [customOffset, popoverClass, tooltipClass]);
  return [overlayRef, [offset]];
}

// node_modules/react-bootstrap/esm/Overlay.js
var import_jsx_runtime5 = __toESM(require_jsx_runtime());
function wrapRefs(props, arrowProps) {
  const {
    ref
  } = props;
  const {
    ref: aRef
  } = arrowProps;
  props.ref = ref.__wrapped || (ref.__wrapped = (r) => ref(safeFindDOMNode(r)));
  arrowProps.ref = aRef.__wrapped || (aRef.__wrapped = (r) => aRef(safeFindDOMNode(r)));
}
var Overlay2 = React5.forwardRef(({
  children: overlay,
  transition = Fade_default,
  popperConfig = {},
  rootClose = false,
  placement = "top",
  show: outerShow = false,
  ...outerProps
}, outerRef) => {
  const popperRef = (0, import_react7.useRef)({});
  const [firstRenderedState, setFirstRenderedState] = (0, import_react7.useState)(null);
  const [ref, modifiers] = useOverlayOffset(outerProps.offset);
  const mergedRef = useMergedRefs_default(outerRef, ref);
  const actualTransition = transition === true ? Fade_default : transition || void 0;
  const handleFirstUpdate = useEventCallback((state) => {
    setFirstRenderedState(state);
    popperConfig == null || popperConfig.onFirstUpdate == null || popperConfig.onFirstUpdate(state);
  });
  useIsomorphicEffect_default(() => {
    if (firstRenderedState && outerProps.target) {
      popperRef.current.scheduleUpdate == null || popperRef.current.scheduleUpdate();
    }
  }, [firstRenderedState, outerProps.target]);
  (0, import_react7.useEffect)(() => {
    if (!outerShow) {
      setFirstRenderedState(null);
    }
  }, [outerShow]);
  return (0, import_jsx_runtime5.jsx)(Overlay_default, {
    ...outerProps,
    ref: mergedRef,
    popperConfig: {
      ...popperConfig,
      modifiers: modifiers.concat(popperConfig.modifiers || []),
      onFirstUpdate: handleFirstUpdate
    },
    transition: actualTransition,
    rootClose,
    placement,
    show: outerShow,
    children: (overlayProps, {
      arrowProps,
      popper: popperObj,
      show
    }) => {
      var _popperObj$state;
      wrapRefs(overlayProps, arrowProps);
      const updatedPlacement = popperObj == null ? void 0 : popperObj.placement;
      const popper = Object.assign(popperRef.current, {
        state: popperObj == null ? void 0 : popperObj.state,
        scheduleUpdate: popperObj == null ? void 0 : popperObj.update,
        placement: updatedPlacement,
        outOfBoundaries: (popperObj == null || (_popperObj$state = popperObj.state) == null || (_popperObj$state = _popperObj$state.modifiersData.hide) == null ? void 0 : _popperObj$state.isReferenceHidden) || false,
        strategy: popperConfig.strategy
      });
      const hasDoneInitialMeasure = !!firstRenderedState;
      if (typeof overlay === "function") return overlay({
        ...overlayProps,
        placement: updatedPlacement,
        show,
        ...!transition && show && {
          className: "show"
        },
        popper,
        arrowProps,
        hasDoneInitialMeasure
      });
      return React5.cloneElement(overlay, {
        ...overlayProps,
        placement: updatedPlacement,
        arrowProps,
        popper,
        hasDoneInitialMeasure,
        className: (0, import_classnames4.default)(overlay.props.className, !transition && show && "show"),
        style: {
          ...overlay.props.style,
          ...overlayProps.style
        }
      });
    }
  });
});
Overlay2.displayName = "Overlay";
var Overlay_default2 = Overlay2;

// node_modules/react-bootstrap/esm/OverlayTrigger.js
var import_jsx_runtime6 = __toESM(require_jsx_runtime());
var import_jsx_runtime7 = __toESM(require_jsx_runtime());
var import_jsx_runtime8 = __toESM(require_jsx_runtime());
function normalizeDelay(delay) {
  return delay && typeof delay === "object" ? delay : {
    show: delay,
    hide: delay
  };
}
function handleMouseOverOut(handler, args, relatedNative) {
  const [e] = args;
  const target = e.currentTarget;
  const related = e.relatedTarget || e.nativeEvent[relatedNative];
  if ((!related || related !== target) && !contains(target, related)) {
    handler(...args);
  }
}
var triggerType = import_prop_types.default.oneOf(["click", "hover", "focus"]);
var OverlayTrigger = ({
  trigger = ["hover", "focus"],
  overlay,
  children,
  popperConfig = {},
  show: propsShow,
  defaultShow = false,
  onToggle,
  delay: propsDelay,
  placement,
  flip = placement && placement.indexOf("auto") !== -1,
  ...props
}) => {
  const triggerNodeRef = (0, import_react8.useRef)(null);
  const mergedRef = useMergedRefs_default(triggerNodeRef, children.ref);
  const timeout = useTimeout();
  const hoverStateRef = (0, import_react8.useRef)("");
  const [show, setShow] = useUncontrolledProp(propsShow, defaultShow, onToggle);
  const delay = normalizeDelay(propsDelay);
  const {
    onFocus,
    onBlur,
    onClick
  } = typeof children !== "function" ? React6.Children.only(children).props : {};
  const attachRef = (r) => {
    mergedRef(safeFindDOMNode(r));
  };
  const handleShow = (0, import_react8.useCallback)(() => {
    timeout.clear();
    hoverStateRef.current = "show";
    if (!delay.show) {
      setShow(true);
      return;
    }
    timeout.set(() => {
      if (hoverStateRef.current === "show") setShow(true);
    }, delay.show);
  }, [delay.show, setShow, timeout]);
  const handleHide = (0, import_react8.useCallback)(() => {
    timeout.clear();
    hoverStateRef.current = "hide";
    if (!delay.hide) {
      setShow(false);
      return;
    }
    timeout.set(() => {
      if (hoverStateRef.current === "hide") setShow(false);
    }, delay.hide);
  }, [delay.hide, setShow, timeout]);
  const handleFocus = (0, import_react8.useCallback)((...args) => {
    handleShow();
    onFocus == null || onFocus(...args);
  }, [handleShow, onFocus]);
  const handleBlur = (0, import_react8.useCallback)((...args) => {
    handleHide();
    onBlur == null || onBlur(...args);
  }, [handleHide, onBlur]);
  const handleClick = (0, import_react8.useCallback)((...args) => {
    setShow(!show);
    onClick == null || onClick(...args);
  }, [onClick, setShow, show]);
  const handleMouseOver = (0, import_react8.useCallback)((...args) => {
    handleMouseOverOut(handleShow, args, "fromElement");
  }, [handleShow]);
  const handleMouseOut = (0, import_react8.useCallback)((...args) => {
    handleMouseOverOut(handleHide, args, "toElement");
  }, [handleHide]);
  const triggers = trigger == null ? [] : [].concat(trigger);
  const triggerProps = {
    ref: attachRef
  };
  if (triggers.indexOf("click") !== -1) {
    triggerProps.onClick = handleClick;
  }
  if (triggers.indexOf("focus") !== -1) {
    triggerProps.onFocus = handleFocus;
    triggerProps.onBlur = handleBlur;
  }
  if (triggers.indexOf("hover") !== -1) {
    true ? (0, import_warning2.default)(triggers.length > 1, '[react-bootstrap] Specifying only the `"hover"` trigger limits the visibility of the overlay to just mouse users. Consider also including the `"focus"` trigger so that touch and keyboard only users can see the overlay as well.') : void 0;
    triggerProps.onMouseOver = handleMouseOver;
    triggerProps.onMouseOut = handleMouseOut;
  }
  return (0, import_jsx_runtime8.jsxs)(import_jsx_runtime7.Fragment, {
    children: [typeof children === "function" ? children(triggerProps) : (0, import_react8.cloneElement)(children, triggerProps), (0, import_jsx_runtime6.jsx)(Overlay_default2, {
      ...props,
      show,
      onHide: handleHide,
      flip,
      placement,
      popperConfig,
      target: triggerNodeRef.current,
      children: overlay
    })]
  });
};
var OverlayTrigger_default = OverlayTrigger;

export {
  useTimeout,
  usePopper_default,
  useClickOutside_default,
  mergeOptionsWithPopperConfig,
  PopoverHeader_default,
  PopoverBody_default,
  Popover_default,
  Overlay_default2 as Overlay_default,
  OverlayTrigger_default
};
//# sourceMappingURL=chunk-CWA6HSA2.js.map
