import {
  __publicField
} from "./chunk-EWTE5DHJ.js";

// node_modules/ldrs/dist/lib/LdrsBaseElement.js
var t = class extends HTMLElement {
  constructor() {
    super();
    __publicField(this, "_propsToUpgrade", {});
    __publicField(this, "shadow");
    __publicField(this, "template");
    __publicField(this, "defaultProps");
    __publicField(this, "isAttached", false);
    this.shadow = this.attachShadow({ mode: "open" }), this.template = document.createElement("template");
  }
  storePropsToUpgrade(t3) {
    t3.forEach((t4) => {
      this.hasOwnProperty(t4) && void 0 !== this[t4] && (this._propsToUpgrade[t4] = this[t4], delete this[t4]);
    });
  }
  upgradeStoredProps() {
    Object.entries(this._propsToUpgrade).forEach(([t3, e2]) => {
      this.setAttribute(t3, e2);
    });
  }
  reflect(t3) {
    t3.forEach((t4) => {
      Object.defineProperty(this, t4, { set(e2) {
        "string,number".includes(typeof e2) ? this.setAttribute(t4, e2.toString()) : this.removeAttribute(t4);
      }, get() {
        return this.getAttribute(t4);
      } });
    });
  }
  applyDefaultProps(t3) {
    this.defaultProps = t3, Object.entries(t3).forEach(([t4, e2]) => {
      this[t4] = this[t4] || e2.toString();
    });
  }
};

// node_modules/ldrs/dist/elements/quantum.js
var t2 = ':host{align-items:center;display:inline-flex;flex-shrink:0;height:var(--uib-size);justify-content:center;width:var(--uib-size)}:host([hidden]){display:none}.container{animation:rotate calc(var(--uib-speed)*4) linear infinite;height:var(--uib-size);position:relative;width:var(--uib-size)}@keyframes rotate{0%{transform:rotate(0deg)}to{transform:rotate(1turn)}}.particle{align-items:center;display:flex;height:100%;justify-content:center;left:0;position:absolute;top:0;width:100%}.particle:first-child{--uib-delay:0;transform:rotate(8deg)}.particle:nth-child(2){--uib-delay:-0.4;transform:rotate(36deg)}.particle:nth-child(3){--uib-delay:-0.9;transform:rotate(72deg)}.particle:nth-child(4){--uib-delay:-0.5;transform:rotate(90deg)}.particle:nth-child(5){--uib-delay:-0.3;transform:rotate(144deg)}.particle:nth-child(6){--uib-delay:-0.2;transform:rotate(180deg)}.particle:nth-child(7){--uib-delay:-0.6;transform:rotate(216deg)}.particle:nth-child(8){--uib-delay:-0.7;transform:rotate(252deg)}.particle:nth-child(9){--uib-delay:-0.1;transform:rotate(300deg)}.particle:nth-child(10){--uib-delay:-0.8;transform:rotate(324deg)}.particle:nth-child(11){--uib-delay:-1.2;transform:rotate(335deg)}.particle:nth-child(12){--uib-delay:-0.5;transform:rotate(290deg)}.particle:nth-child(13){--uib-delay:-0.2;transform:rotate(240deg)}.particle:before{--uib-d:calc(var(--uib-delay)*var(--uib-speed));animation:orbit var(--uib-speed) linear var(--uib-d) infinite;background-color:var(--uib-color);border-radius:50%;content:"";flex-shrink:0;height:17.5%;position:absolute;transition:background-color .3s ease;width:17.5%}@keyframes orbit{0%{opacity:.65;transform:translate(calc(var(--uib-size)*.5)) scale(.73684)}5%{opacity:.58;transform:translate(calc(var(--uib-size)*.4)) scale(.684208)}10%{opacity:.51;transform:translate(calc(var(--uib-size)*.3)) scale(.631576)}15%{opacity:.44;transform:translate(calc(var(--uib-size)*.2)) scale(.578944)}20%{opacity:.37;transform:translate(calc(var(--uib-size)*.1)) scale(.526312)}25%{opacity:.3;transform:translate(0) scale(.47368)}30%{opacity:.37;transform:translate(calc(var(--uib-size)*-.1)) scale(.526312)}35%{opacity:.44;transform:translate(calc(var(--uib-size)*-.2)) scale(.578944)}40%{opacity:.51;transform:translate(calc(var(--uib-size)*-.3)) scale(.631576)}45%{opacity:.58;transform:translate(calc(var(--uib-size)*-.4)) scale(.684208)}50%{opacity:.65;transform:translate(calc(var(--uib-size)*-.5)) scale(.73684)}55%{opacity:.72;transform:translate(calc(var(--uib-size)*-.4)) scale(.789472)}60%{opacity:.79;transform:translate(calc(var(--uib-size)*-.3)) scale(.842104)}65%{opacity:.86;transform:translate(calc(var(--uib-size)*-.2)) scale(.894736)}70%{opacity:.93;transform:translate(calc(var(--uib-size)*-.1)) scale(.947368)}75%{opacity:1;transform:translate(0) scale(1)}80%{opacity:.93;transform:translate(calc(var(--uib-size)*.1)) scale(.947368)}85%{opacity:.86;transform:translate(calc(var(--uib-size)*.2)) scale(.894736)}90%{opacity:.79;transform:translate(calc(var(--uib-size)*.3)) scale(.842104)}95%{opacity:.72;transform:translate(calc(var(--uib-size)*.4)) scale(.789472)}to{opacity:.65;transform:translate(calc(var(--uib-size)*.5)) scale(.73684)}}';
var e = class extends t {
  constructor() {
    super();
    __publicField(this, "_attributes", ["size", "color", "speed"]);
    __publicField(this, "size");
    __publicField(this, "color");
    __publicField(this, "speed");
    this.storePropsToUpgrade(this._attributes), this.reflect(this._attributes);
  }
  static get observedAttributes() {
    return ["size", "color", "speed"];
  }
  connectedCallback() {
    this.upgradeStoredProps(), this.applyDefaultProps({ size: 45, color: "black", speed: 1.75 }), this.template.innerHTML = `
      <div class="container">
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
      </div>
      <style>
        :host{
          --uib-size: ${this.size}px;
          --uib-color: ${this.color};
          --uib-speed: ${this.speed}s;
        }
        ${t2}
      </style>
    `, this.shadow.replaceChildren(this.template.content.cloneNode(true));
  }
  attributeChangedCallback() {
    const a = this.shadow.querySelector("style");
    a && (a.innerHTML = `
      :host{
        --uib-size: ${this.size}px;
        --uib-color: ${this.color};
        --uib-speed: ${this.speed}s;
      }
      ${t2}
    `);
  }
};
var i = { register: (a = "l-quantum") => {
  customElements.get(a) || customElements.define(a, class extends e {
  });
}, element: e };

export {
  t,
  i
};
//# sourceMappingURL=chunk-JJ4TM4NG.js.map
