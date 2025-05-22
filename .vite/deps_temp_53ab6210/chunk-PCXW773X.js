import {
  useEventCallback
} from "./chunk-DU2TMUUJ.js";
import {
  require_react
} from "./chunk-W4EHDCLL.js";
import {
  __toESM
} from "./chunk-EWTE5DHJ.js";

// node_modules/@restart/hooks/esm/useEventListener.js
var import_react = __toESM(require_react());
function useEventListener(eventTarget, event, listener, capture = false) {
  const handler = useEventCallback(listener);
  (0, import_react.useEffect)(() => {
    const target = typeof eventTarget === "function" ? eventTarget() : eventTarget;
    target.addEventListener(event, handler, capture);
    return () => target.removeEventListener(event, handler, capture);
  }, [eventTarget]);
}

// node_modules/@restart/hooks/esm/useGlobalListener.js
var import_react2 = __toESM(require_react());
function useGlobalListener(event, handler, capture = false) {
  const documentTarget = (0, import_react2.useCallback)(() => document, []);
  return useEventListener(documentTarget, event, handler, capture);
}

// node_modules/@restart/hooks/esm/useForceUpdate.js
var import_react3 = __toESM(require_react());
function useForceUpdate() {
  const [, dispatch] = (0, import_react3.useReducer)((state) => !state, false);
  return dispatch;
}

export {
  useEventListener,
  useGlobalListener,
  useForceUpdate
};
//# sourceMappingURL=chunk-PCXW773X.js.map
