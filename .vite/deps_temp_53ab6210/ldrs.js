import {
  i,
  t
} from "./chunk-JJ4TM4NG.js";
import {
  __publicField
} from "./chunk-EWTE5DHJ.js";

// node_modules/ldrs/dist/elements/bouncy.js
var i2 = ":host{align-items:center;display:inline-flex;flex-shrink:0;height:calc(var(--uib-size)*.6);justify-content:center;width:var(--uib-size)}:host([hidden]){display:none}.container{align-items:flex-end;display:flex;height:calc(var(--uib-size)*.6);justify-content:space-between;padding-bottom:20%;width:var(--uib-size)}.cube{animation:jump var(--uib-speed) ease-in-out infinite;flex-shrink:0;height:calc(var(--uib-size)*.2);width:calc(var(--uib-size)*.2)}.cube__inner{animation:morph var(--uib-speed) ease-in-out infinite;background-color:var(--uib-color);border-radius:25%;display:block;height:100%;transform-origin:center bottom;transition:background-color .3s ease;width:100%}.cube:nth-child(2),.cube:nth-child(2) .cube__inner{animation-delay:calc(var(--uib-speed)*-.36)}.cube:nth-child(3),.cube:nth-child(3) .cube__inner{animation-delay:calc(var(--uib-speed)*-.2)}@keyframes jump{0%{transform:translateY(0)}28%{animation-timing-function:ease-out;transform:translateY(0)}50%{animation-timing-function:ease-in;transform:translateY(-200%)}74%{animation-timing-function:ease-in;transform:translateY(0)}}@keyframes morph{0%{transform:scaleY(1)}10%{transform:scaleY(1)}20%,25%{animation-timing-function:ease-in-out;transform:scaleY(.6) scaleX(1.3)}30%{animation-timing-function:ease-in-out;transform:scaleY(1.15) scaleX(.9)}40%{transform:scaleY(1)}72%,87%,to{transform:scaleY(1)}77%{transform:scaleY(.8) scaleX(1.2)}}";
var t2 = class extends t {
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
        <div class="cube"><div class="cube__inner"></div></div>
        <div class="cube"><div class="cube__inner"></div></div>
        <div class="cube"><div class="cube__inner"></div></div>
      </div>
      <style>
        :host{
          --uib-size: ${this.size}px;
          --uib-color: ${this.color};
          --uib-speed: ${this.speed}s;
        }
        ${i2}
      </style>
    `, this.shadow.replaceChildren(this.template.content.cloneNode(true));
  }
  attributeChangedCallback() {
    const e11 = this.shadow.querySelector("style");
    e11 && (e11.innerHTML = `
      :host{
        --uib-size: ${this.size}px;
        --uib-color: ${this.color};
        --uib-speed: ${this.speed}s;
      }
      ${i2}
    `);
  }
};
var n = { register: (e11 = "l-bouncy") => {
  customElements.get(e11) || customElements.define(e11, class extends t2 {
  });
}, element: t2 };

// node_modules/ldrs/dist/elements/bouncyArc.js
var t3 = ':host{align-items:center;display:inline-flex;flex-shrink:0;height:calc(var(--uib-size)*.51);justify-content:center;width:var(--uib-size)}:host([hidden]){display:none}.container{--uib-cube-size:calc(var(--uib-size)/5.5);--uib-arc-1:-80deg;--uib-arc-2:80deg;align-items:flex-start;display:flex;height:100%;justify-content:center;width:100%}.cube{animation:metronome var(--uib-speed) linear infinite;height:calc(var(--uib-size)*.5);transform:rotate(var(var(--uib-arc-1)));transform-origin:center bottom}.cube,.cube:after{width:var(--uib-cube-size)}.cube:after{animation:morph var(--uib-speed) linear infinite;background-color:var(--uib-color);border-radius:25%;content:"";display:block;height:var(--uib-cube-size);transition:background-color .3s ease}@keyframes metronome{0%{transform:rotate(var(--uib-arc-1))}10%{animation-timing-function:ease-out;transform:rotate(var(--uib-arc-1))}50%{transform:rotate(var(--uib-arc-2))}60%{animation-timing-function:ease-out;transform:rotate(var(--uib-arc-2))}to{transform:rotate(var(--uib-arc-1))}}@keyframes morph{0%,5%{transform:scaleX(.75) scaleY(1.25);transform-origin:center left}12.5%{transform:scaleX(1.5);transform-origin:center left}27.5%{transform:scaleX(1);transform-origin:center left}27.5001%,42.5%{transform:scaleX(1);transform-origin:center right}47.5%{animation-timing-function:ease-in;transform:scaleX(.75) scaleY(1.25);transform-origin:center right}65%{transform:scaleX(1.5);transform-origin:center right}77.5%{transform:scaleX(1);transform-origin:center right}77.5001%,95%{transform:scaleX(1);transform-origin:center left}to{transform:scaleX(.75) scaleY(1.25);transform-origin:center left}}';
var r = class extends t {
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
    this.upgradeStoredProps(), this.applyDefaultProps({ size: 70, color: "black", speed: 1.65 }), this.template.innerHTML = `
      <div class="container"><div class="cube"></div></div>
      <style>
        :host{
          --uib-size: ${this.size}px;
          --uib-color: ${this.color};
          --uib-speed: ${this.speed}s;
        }
        ${t3}
      </style>
    `, this.shadow.replaceChildren(this.template.content.cloneNode(true));
  }
  attributeChangedCallback() {
    const e11 = this.shadow.querySelector("style");
    e11 && (e11.innerHTML = `
      :host{
        --uib-size: ${this.size}px;
        --uib-color: ${this.color};
        --uib-speed: ${this.speed}s;
      }
      ${t3}
    `);
  }
};
var i3 = { register: (e11 = "l-bouncy-arc") => {
  customElements.get(e11) || customElements.define(e11, class extends r {
  });
}, element: r };

// node_modules/ldrs/dist/lib/scaleD.js
function t4(t34, e11) {
  return e11.replace(/([-A-y])/g, ",$1").split(",").filter((t35) => "" !== t35).map((e12) => {
    var _a;
    const r9 = (_a = e12.match(/(\d+\.?\d*)/g)) == null ? void 0 : _a[0], a5 = parseFloat(r9) * t34;
    return e12.replace(r9, a5.toString());
  }).join(" ");
}

// node_modules/ldrs/dist/elements/cardio.js
var s = ":host{align-items:center;display:inline-flex;flex-shrink:0;height:calc(var(--uib-size)*.625);justify-content:center;width:var(--uib-size)}:host([hidden]){display:none}.container{height:calc(var(--uib-size)*.625);overflow:visible;transform-origin:center;width:var(--uib-size)}.car{stroke:var(--uib-color);stroke-dasharray:100;stroke-dashoffset:0;animation:travel var(--uib-speed) ease-in-out infinite,fade var(--uib-speed) ease-out infinite;transition:stroke .5s ease;will-change:stroke-dasharray,stroke-dashoffset}.car,.track{stroke-linecap:round;stroke-linejoin:round}.track{stroke:var(--uib-color);opacity:var(--uib-bg-opacity)}@keyframes travel{0%{stroke-dashoffset:100}75%{stroke-dashoffset:0}}@keyframes fade{0%{opacity:0}20%,55%{opacity:1}to{opacity:0}}";
var i4 = class extends t {
  constructor() {
    super();
    __publicField(this, "_attributes", ["size", "color", "speed", "stroke", "bg-opacity"]);
    __publicField(this, "size");
    __publicField(this, "color");
    __publicField(this, "speed");
    __publicField(this, "stroke");
    __publicField(this, "bg-opacity");
    __publicField(this, "d");
    this.storePropsToUpgrade(this._attributes), this.reflect(this._attributes), this.d = "M0.5,17.2h8.2l3-4.7l5.9,12l7.8-24l5.9,16.7v0h8.2";
  }
  static get observedAttributes() {
    return ["size", "color", "speed", "stroke", "bg-opacity"];
  }
  connectedCallback() {
    this.upgradeStoredProps(), this.applyDefaultProps({ size: 50, color: "black", speed: 1.5, stroke: 4, "bg-opacity": 0.1 });
    const e11 = parseInt(this.size), i40 = t4(e11 / 40, this.d);
    this.template.innerHTML = `
      <svg
        class="container" 
        x="0px" 
        y="0px"
        viewBox="0 0 ${this.size} ${0.625 * e11}"
        height="${0.625 * e11}"
        width="${this.size}"
        preserveAspectRatio='xMidYMid meet'
      >
        <path 
          class="track"
          stroke-width="${this.stroke}" 
          fill="none" 
          pathlength="100"
          d="${i40}"
        />
        <path 
          class="car"
          stroke-width="${this.stroke}" 
          fill="none" 
          pathlength="100"
          d="${i40}"
        />
      </svg>
      <style>
        :host{
          --uib-size: ${this.size}px;
          --uib-color: ${this.color};
          --uib-speed: ${this.speed}s;
          --uib-bg-opacity: ${this["bg-opacity"]};
        }
        ${s}
      </style>
    `, this.shadow.replaceChildren(this.template.content.cloneNode(true));
  }
  attributeChangedCallback() {
    const e11 = parseInt(this.size), i40 = this.shadow.querySelector("style"), r9 = this.shadow.querySelector("svg"), o = this.shadow.querySelectorAll("path");
    i40 && (r9.setAttribute("height", String(0.625 * e11)), r9.setAttribute("width", this.size), r9.setAttribute("viewBox", `0 0 ${this.size} ${0.625 * e11}`), o.forEach((s35) => {
      s35.setAttribute("stroke-width", this.stroke), s35.setAttribute("d", t4(e11 / 40, this.d));
    }), i40.innerHTML = `
      :host{
        --uib-size: ${this.size}px;
        --uib-color: ${this.color};
        --uib-speed: ${this.speed}s;
        --uib-bg-opacity: ${this["bg-opacity"]};
      }
      ${s}
    `);
  }
};
var r2 = { register: (t34 = "l-cardio") => {
  customElements.get(t34) || customElements.define(t34, class extends i4 {
  });
}, element: i4 };

// node_modules/ldrs/dist/elements/chaoticOrbit.js
var e = ':host{--uib-dot-size:calc(var(--uib-size)*0.4);align-items:center;display:inline-flex;flex-shrink:0;height:var(--uib-size);justify-content:center;width:var(--uib-size)}:host([hidden]){display:none}.container{align-items:center;animation:rotate calc(var(--uib-speed)*1.667) infinite linear;display:flex;height:var(--uib-size);justify-content:center;position:relative;width:var(--uib-size)}.container:after,.container:before{background-color:var(--uib-color);border-radius:50%;content:"";flex-shrink:0;height:var(--uib-dot-size);position:absolute;transition:background-color .3s ease;width:var(--uib-dot-size)}.container:before{animation:orbit var(--uib-speed) linear infinite}.container:after{animation:orbit var(--uib-speed) linear calc(var(--uib-speed)/-2) infinite}@keyframes rotate{0%{transform:rotate(0deg)}to{transform:rotate(1turn)}}@keyframes orbit{0%{opacity:.65;transform:translateX(calc(var(--uib-size)*.25)) scale(.73684)}5%{opacity:.58;transform:translateX(calc(var(--uib-size)*.235)) scale(.684208)}10%{opacity:.51;transform:translateX(calc(var(--uib-size)*.182)) scale(.631576)}15%{opacity:.44;transform:translateX(calc(var(--uib-size)*.129)) scale(.578944)}20%{opacity:.37;transform:translateX(calc(var(--uib-size)*.076)) scale(.526312)}25%{opacity:.3;transform:translateX(0) scale(.47368)}30%{opacity:.37;transform:translateX(calc(var(--uib-size)*-.076)) scale(.526312)}35%{opacity:.44;transform:translateX(calc(var(--uib-size)*-.129)) scale(.578944)}40%{opacity:.51;transform:translateX(calc(var(--uib-size)*-.182)) scale(.631576)}45%{opacity:.58;transform:translateX(calc(var(--uib-size)*-.235)) scale(.684208)}50%{opacity:.65;transform:translateX(calc(var(--uib-size)*-.25)) scale(.73684)}55%{opacity:.72;transform:translateX(calc(var(--uib-size)*-.235)) scale(.789472)}60%{opacity:.79;transform:translateX(calc(var(--uib-size)*-.182)) scale(.842104)}65%{opacity:.86;transform:translateX(calc(var(--uib-size)*-.129)) scale(.894736)}70%{opacity:.93;transform:translateX(calc(var(--uib-size)*-.076)) scale(.947368)}75%{opacity:1;transform:translateX(0) scale(1)}80%{opacity:.93;transform:translateX(calc(var(--uib-size)*.076)) scale(.947368)}85%{opacity:.86;transform:translateX(calc(var(--uib-size)*.129)) scale(.894736)}90%{opacity:.79;transform:translateX(calc(var(--uib-size)*.182)) scale(.842104)}95%{opacity:.72;transform:translateX(calc(var(--uib-size)*.235)) scale(.789472)}to{opacity:.65;transform:translateX(calc(var(--uib-size)*.25)) scale(.73684)}}';
var t5 = class extends t {
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
    this.upgradeStoredProps(), this.applyDefaultProps({ size: 35, color: "black", speed: 1.5 }), this.template.innerHTML = `
      <div class="container"></div>
      <style>
        :host{
          --uib-size: ${this.size}px;
          --uib-color: ${this.color};
          --uib-speed: ${this.speed}s;
        }
        ${e}
      </style>
    `, this.shadow.replaceChildren(this.template.content.cloneNode(true));
  }
  attributeChangedCallback() {
    const a5 = this.shadow.querySelector("style");
    a5 && (a5.innerHTML = `
      :host{
        --uib-size: ${this.size}px;
        --uib-color: ${this.color};
        --uib-speed: ${this.speed}s;
      }
      ${e}
    `);
  }
};
var s2 = { register: (a5 = "l-chaotic-orbit") => {
  customElements.get(a5) || customElements.define(a5, class extends t5 {
  });
}, element: t5 };

// node_modules/ldrs/dist/elements/dotPulse.js
var t6 = ':host{--uib-dot-size:calc(var(--uib-size)*0.24);align-items:center;display:inline-flex;flex-shrink:0;height:var(--uib-dot-size);justify-content:center;width:var(--uib-size)}:host([hidden]){display:none}.container{align-items:center;display:flex;height:100%;justify-content:space-between;position:relative;width:100%}.container:after,.container:before,.dot{background-color:var(--uib-color);border-radius:50%;content:"";display:block;height:var(--uib-dot-size);transform:scale(0);transition:background-color .3s ease;width:var(--uib-dot-size)}.container:before{animation:pulse var(--uib-speed) ease-in-out calc(var(--uib-speed)*-.375) infinite}.dot{animation:pulse var(--uib-speed) ease-in-out calc(var(--uib-speed)*-.25) infinite both}.container:after{animation:pulse var(--uib-speed) ease-in-out calc(var(--uib-speed)*-.125) infinite}@keyframes pulse{0%,to{transform:scale(0)}50%{transform:scale(1)}}';
var s3 = class extends t {
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
    this.upgradeStoredProps(), this.applyDefaultProps({ size: 43, color: "black", speed: 1.3 }), this.template.innerHTML = `
      <div class="container"><div class="dot" /></div>
      <style>
        :host{
          --uib-size: ${this.size}px;
          --uib-color: ${this.color};
          --uib-speed: ${this.speed}s;
        }
        ${t6}
      </style>
    `, this.shadow.replaceChildren(this.template.content.cloneNode(true));
  }
  attributeChangedCallback() {
    const e11 = this.shadow.querySelector("style");
    e11 && (e11.innerHTML = `
      :host{
        --uib-size: ${this.size}px;
        --uib-color: ${this.color};
        --uib-speed: ${this.speed}s;
      }
      ${t6}
    `);
  }
};
var i5 = { register: (e11 = "l-dot-pulse") => {
  customElements.get(e11) || customElements.define(e11, class extends s3 {
  });
}, element: s3 };

// node_modules/ldrs/dist/elements/dotSpinner.js
var t7 = ':host{align-items:center;display:inline-flex;flex-shrink:0;height:var(--uib-size);justify-content:center;width:var(--uib-size)}:host([hidden]){display:none}.container{height:var(--uib-size);position:relative;width:var(--uib-size)}.container,.dot{align-items:center;display:flex;justify-content:flex-start}.dot{height:100%;left:0;position:absolute;top:0;width:100%}.dot:before{animation:pulse calc(var(--uib-speed)*1.111) ease-in-out infinite;background-color:var(--uib-color);border-radius:50%;content:"";height:20%;opacity:.5;transform:scale(0);transition:background-color .3s ease;width:20%}.dot:nth-child(2){transform:rotate(45deg)}.dot:nth-child(2):before{animation-delay:calc(var(--uib-speed)*-.875)}.dot:nth-child(3){transform:rotate(90deg)}.dot:nth-child(3):before{animation-delay:calc(var(--uib-speed)*-.75)}.dot:nth-child(4){transform:rotate(135deg)}.dot:nth-child(4):before{animation-delay:calc(var(--uib-speed)*-.625)}.dot:nth-child(5){transform:rotate(180deg)}.dot:nth-child(5):before{animation-delay:calc(var(--uib-speed)*-.5)}.dot:nth-child(6){transform:rotate(225deg)}.dot:nth-child(6):before{animation-delay:calc(var(--uib-speed)*-.375)}.dot:nth-child(7){transform:rotate(270deg)}.dot:nth-child(7):before{animation-delay:calc(var(--uib-speed)*-.25)}.dot:nth-child(8){transform:rotate(315deg)}.dot:nth-child(8):before{animation-delay:calc(var(--uib-speed)*-.125)}@keyframes pulse{0%,to{opacity:.5;transform:scale(0)}50%{opacity:1;transform:scale(1)}}';
var i6 = class extends t {
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
    this.upgradeStoredProps(), this.applyDefaultProps({ size: 40, color: "black", speed: 0.9 }), this.template.innerHTML = `
      <div class="container">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
      <style>
        :host{
          --uib-size: ${this.size}px;
          --uib-color: ${this.color};
          --uib-speed: ${this.speed}s;
        }
        ${t7}
      </style>
    `, this.shadow.replaceChildren(this.template.content.cloneNode(true));
  }
  attributeChangedCallback() {
    const e11 = this.shadow.querySelector("style");
    e11 && (e11.innerHTML = `
      :host{
        --uib-size: ${this.size}px;
        --uib-color: ${this.color};
        --uib-speed: ${this.speed}s;
      }
      ${t7}
    `);
  }
};
var s4 = { register: (e11 = "l-dot-spinner") => {
  customElements.get(e11) || customElements.define(e11, class extends i6 {
  });
}, element: i6 };

// node_modules/ldrs/dist/elements/dotStream.js
var t8 = ":host{align-items:center;display:inline-flex;flex-shrink:0;height:calc(var(--uib-size)*.18);justify-content:center;width:var(--uib-size)}:host([hidden]){display:none}.container{--uib-dot-size:calc(var(--uib-size)*0.18);align-items:center;display:flex;justify-content:space-between;position:relative;width:var(--uib-size)}.container,.dot{height:var(--uib-dot-size)}.dot{animation:stream var(--uib-speed) linear infinite both;background-color:var(--uib-color);border-radius:50%;display:block;left:calc(0px - var(--uib-dot-size)/2);position:absolute;top:calc(50% - var(--uib-dot-size)/2);transition:background-color .3s ease;width:var(--uib-dot-size)}.dot:nth-child(2){animation-delay:calc(var(--uib-speed)*-.2)}.dot:nth-child(3){animation-delay:calc(var(--uib-speed)*-.4)}.dot:nth-child(4){animation-delay:calc(var(--uib-speed)*-.6)}.dot:nth-child(5){animation-delay:calc(var(--uib-speed)*-.8)}@keyframes stream{0%,to{transform:translateX(0) scale(0)}50%{transform:translateX(calc(var(--uib-size)*.5)) scale(1)}99.999%{transform:translateX(calc(var(--uib-size))) scale(0)}}";
var i7 = class extends t {
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
    this.upgradeStoredProps(), this.applyDefaultProps({ size: 60, color: "black", speed: 2.5 }), this.template.innerHTML = `
      <div class="container">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
      <style>
        :host{
          --uib-size: ${this.size}px;
          --uib-color: ${this.color};
          --uib-speed: ${this.speed}s;
        }
        ${t8}
      </style>
    `, this.shadow.replaceChildren(this.template.content.cloneNode(true));
  }
  attributeChangedCallback() {
    const e11 = this.shadow.querySelector("style");
    e11 && (e11.innerHTML = `
      :host{
        --uib-size: ${this.size}px;
        --uib-color: ${this.color};
        --uib-speed: ${this.speed}s;
      }
      ${t8}
    `);
  }
};
var s5 = { register: (e11 = "l-dot-stream") => {
  customElements.get(e11) || customElements.define(e11, class extends i7 {
  });
}, element: i7 };

// node_modules/ldrs/dist/elements/dotWave.js
var t9 = ":host{align-items:center;display:inline-flex;flex-shrink:0;height:calc(var(--uib-size)*.5);justify-content:center;width:var(--uib-size)}:host([hidden]){display:none}.container{align-items:flex-end;display:flex;height:100%;justify-content:space-between;width:100%}.dot{background-color:var(--uib-color);border-radius:50%;flex-shrink:0;height:calc(var(--uib-size)*.17);transition:background-color .3s ease;width:calc(var(--uib-size)*.17)}.dot:first-child{animation:jump var(--uib-speed) ease-in-out calc(var(--uib-speed)*-.45) infinite}.dot:nth-child(2){animation:jump var(--uib-speed) ease-in-out calc(var(--uib-speed)*-.3) infinite}.dot:nth-child(3){animation:jump var(--uib-speed) ease-in-out calc(var(--uib-speed)*-.15) infinite}.dot:nth-child(4){animation:jump var(--uib-speed) ease-in-out infinite}@keyframes jump{0%,to{transform:translateY(0)}50%{transform:translateY(-200%)}}";
var i8 = class extends t {
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
    this.upgradeStoredProps(), this.applyDefaultProps({ size: 47, color: "black", speed: 1 }), this.template.innerHTML = `
      <div class="container">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
      <style>
        :host{
          --uib-size: ${this.size}px;
          --uib-color: ${this.color};
          --uib-speed: ${this.speed}s;
        }
        ${t9}
      </style>
    `, this.shadow.replaceChildren(this.template.content.cloneNode(true));
  }
  attributeChangedCallback() {
    const e11 = this.shadow.querySelector("style");
    e11 && (e11.innerHTML = `
      :host{
        --uib-size: ${this.size}px;
        --uib-color: ${this.color};
        --uib-speed: ${this.speed}s;
      }
      ${t9}
    `);
  }
};
var s6 = { register: (e11 = "l-dot-wave") => {
  customElements.get(e11) || customElements.define(e11, class extends i8 {
  });
}, element: i8 };

// node_modules/ldrs/dist/elements/grid.js
var t10 = ':host{align-items:center;display:inline-flex;flex-shrink:0;height:calc(var(--uib-size)*.8);justify-content:center;width:var(--uib-size)}:host([hidden]){display:none}.container{--uib-dot-size:calc(var(--uib-size)*0.1);height:calc(var(--uib-size)*.64);position:relative;width:calc(var(--uib-size)*.64)}.container,.dot{align-items:center;display:flex;justify-content:flex-start}.dot{--uib-d1:-0.48;--uib-d2:-0.4;--uib-d3:-0.32;--uib-d4:-0.24;--uib-d5:-0.16;--uib-d6:-0.08;--uib-d7:-0;animation:jump var(--uib-speed) ease-in-out infinite;backface-visibility:hidden;bottom:calc(var(--uib-bottom) + var(--uib-dot-size)/2);height:var(--uib-dot-size);opacity:var(--uib-scale);position:absolute;right:calc(var(--uib-right) + var(--uib-dot-size)/2);width:var(--uib-dot-size);will-change:transform}.dot:before{background-color:var(--uib-color);border-radius:50%;content:"";height:100%;transform:scale(var(--uib-scale));transition:background-color .3s ease;width:100%}.dot:first-child{--uib-bottom:24%;--uib-right:-35%;animation-delay:calc(var(--uib-speed)*var(--uib-d1))}.dot:nth-child(2){--uib-bottom:16%;--uib-right:-6%;animation-delay:calc(var(--uib-speed)*var(--uib-d2))}.dot:nth-child(3){--uib-bottom:8%;--uib-right:23%;animation-delay:calc(var(--uib-speed)*var(--uib-d3))}.dot:nth-child(4){--uib-bottom:-1%;--uib-right:51%;animation-delay:calc(var(--uib-speed)*var(--uib-d4))}.dot:nth-child(5){--uib-bottom:38%;--uib-right:-17.5%;animation-delay:calc(var(--uib-speed)*var(--uib-d2))}.dot:nth-child(6){--uib-bottom:30%;--uib-right:10%;animation-delay:calc(var(--uib-speed)*var(--uib-d3))}.dot:nth-child(7){--uib-bottom:22%;--uib-right:39%;animation-delay:calc(var(--uib-speed)*var(--uib-d4))}.dot:nth-child(8){--uib-bottom:14%;--uib-right:67%;animation-delay:calc(var(--uib-speed)*var(--uib-d5))}.dot:nth-child(9){--uib-bottom:53%;--uib-right:-0.8%;animation-delay:calc(var(--uib-speed)*var(--uib-d3))}.dot:nth-child(10){--uib-bottom:44.5%;--uib-right:27%;animation-delay:calc(var(--uib-speed)*var(--uib-d4))}.dot:nth-child(11){--uib-bottom:36%;--uib-right:55.7%;animation-delay:calc(var(--uib-speed)*var(--uib-d5))}.dot:nth-child(12){--uib-bottom:28.7%;--uib-right:84.3%;animation-delay:calc(var(--uib-speed)*var(--uib-d6))}.dot:nth-child(13){--uib-bottom:66.8%;--uib-right:15%;animation-delay:calc(var(--uib-speed)*var(--uib-d4))}.dot:nth-child(14){--uib-bottom:58.8%;--uib-right:43%;animation-delay:calc(var(--uib-speed)*var(--uib-d5))}.dot:nth-child(15){--uib-bottom:50%;--uib-right:72%;animation-delay:calc(var(--uib-speed)*var(--uib-d6))}.dot:nth-child(16){--uib-bottom:42%;--uib-right:100%;animation-delay:calc(var(--uib-speed)*var(--uib-d7))}.dot:nth-child(3){--uib-scale:0.98}.dot:nth-child(2),.dot:nth-child(8){--uib-scale:0.96}.dot:first-child,.dot:nth-child(7){--uib-scale:0.94}.dot:nth-child(12),.dot:nth-child(6){--uib-scale:0.92}.dot:nth-child(11),.dot:nth-child(5){--uib-scale:0.9}.dot:nth-child(10),.dot:nth-child(16){--uib-scale:0.88}.dot:nth-child(15),.dot:nth-child(9){--uib-scale:0.86}.dot:nth-child(14){--uib-scale:0.84}.dot:nth-child(13){--uib-scale:0.82}@keyframes jump{0%,to{transform:translateY(120%)}50%{transform:translateY(-120%)}}';
var d = class extends t {
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
    this.upgradeStoredProps(), this.applyDefaultProps({ size: 60, color: "black", speed: 1.5 }), this.template.innerHTML = `
      <div class="container">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
      <style>
        :host{
          --uib-size: ${this.size}px;
          --uib-color: ${this.color};
          --uib-speed: ${this.speed}s;
        }
        ${t10}
      </style>
    `, this.shadow.replaceChildren(this.template.content.cloneNode(true));
  }
  attributeChangedCallback() {
    const i40 = this.shadow.querySelector("style");
    i40 && (i40.innerHTML = `
      :host{
        --uib-size: ${this.size}px;
        --uib-color: ${this.color};
        --uib-speed: ${this.speed}s;
      }
      ${t10}
    `);
  }
};
var a = { register: (i40 = "l-grid") => {
  customElements.get(i40) || customElements.define(i40, class extends d {
  });
}, element: d };

// node_modules/ldrs/dist/elements/hatch.js
var e2 = ':host{--uib-mult:calc(var(--uib-size)/var(--uib-stroke));--uib-stroke-px:calc(var(--uib-stroke)*1px);--uib-size-px:calc(var(--uib-size)*1px);align-items:flex-start;display:inline-flex;flex-shrink:0;height:var(--uib-size-px);justify-content:flex-start;position:relative;width:var(--uib-size-px)}:host([hidden]){display:none}.container{height:100%;position:relative;width:100%}.line{animation:center-line var(--uib-speed) ease infinite;left:calc(50% - var(--uib-stroke-px)/2);top:calc(50% - var(--uib-stroke-px)/2)}.container:after,.container:before,.line{background-color:var(--uib-color);height:var(--uib-stroke-px);position:absolute;transition:background-color .3s ease;width:var(--uib-stroke-px)}.container:after,.container:before{animation:explore var(--uib-speed) ease infinite;content:""}.container:after{animation-delay:calc(var(--uib-speed)*-.5)}@keyframes center-line{0%,25%,50%,75%,to{transform:scaleX(1) scaleY(1)}12.5%,62.5%{transform:scaleX(var(--uib-mult)) scaleY(1)}37.5%,87.5%{transform:scaleX(1) scaleY(var(--uib-mult))}}@keyframes explore{0%,to{left:0;top:0;transform:scaleX(1) scaleY(1) translate(0);transform-origin:top left}12.5%{left:0;top:0;transform:scaleX(var(--uib-mult)) scaleY(1) translate(0);transform-origin:top left}12.50001%{left:auto;right:0;top:0;transform:scaleX(var(--uib-mult)) scaleY(1) translate(0);transform-origin:top right}25%{left:auto;right:0;top:0;transform:scaleX(1) scaleY(1) translate(0);transform-origin:top right}37.5%{left:auto;right:0;top:0;transform:scaleX(1) scaleY(var(--uib-mult)) translate(0);transform-origin:top right}37.5001%{bottom:0;left:auto;right:0;top:auto;transform:scaleX(1) scaleY(var(--uib-mult)) translate(0);transform-origin:bottom right}50%{bottom:0;left:auto;right:0;top:auto;transform:scaleX(1) scaleY(1) translate(0);transform-origin:bottom right}62.5%{bottom:0;left:auto;right:0;top:auto;transform:scaleX(var(--uib-mult)) scaleY(1) translate(0);transform-origin:bottom right}62.5001%{bottom:0;left:0;top:auto;transform:scaleX(var(--uib-mult)) scaleY(1) translate(0);transform-origin:bottom left}75%{bottom:0;left:0;top:auto;transform:scaleX(1) scaleY(1) translate(0);transform-origin:bottom left}87.5%{bottom:0;left:0;top:auto;transform:scaleX(1) scaleY(var(--uib-mult)) translate(0);transform-origin:bottom left}87.5001%{left:0;top:0;transform:scaleX(1) scaleY(var(--uib-mult)) translate(0);transform-origin:top left}}';
var r3 = class extends t {
  constructor() {
    super();
    __publicField(this, "_attributes", ["size", "color", "speed", "stroke"]);
    __publicField(this, "size");
    __publicField(this, "color");
    __publicField(this, "speed");
    __publicField(this, "stroke");
    this.storePropsToUpgrade(this._attributes), this.reflect(this._attributes);
  }
  static get observedAttributes() {
    return ["size", "color", "speed", "stroke"];
  }
  connectedCallback() {
    this.upgradeStoredProps(), this.applyDefaultProps({ size: 28, color: "black", speed: 3.5, stroke: 4 }), this.template.innerHTML = `
      <div class="container"><div class="line"></div></div>
      <style>
        :host{
          --uib-size: ${this.size};
          --uib-color: ${this.color};
          --uib-speed: ${this.speed}s;
          --uib-stroke: ${this.stroke};
        }
        ${e2}
      </style>
    `, this.shadow.replaceChildren(this.template.content.cloneNode(true));
  }
  attributeChangedCallback() {
    const t34 = this.shadow.querySelector("style");
    t34 && (t34.innerHTML = `
      :host{
        --uib-size: ${this.size};
        --uib-color: ${this.color};
        --uib-speed: ${this.speed}s;
        --uib-stroke: ${this.stroke};
      }
      ${e2}
    `);
  }
};
var s7 = { register: (t34 = "l-hatch") => {
  customElements.get(t34) || customElements.define(t34, class extends r3 {
  });
}, element: r3 };

// node_modules/ldrs/dist/elements/helix.js
var e3 = ':host{align-items:center;display:inline-flex;flex-shrink:0;height:var(--uib-size);justify-content:center;width:var(--uib-size)}:host([hidden]){display:none}.container{align-items:center;display:flex;flex-direction:column;height:100%;justify-content:center;width:100%}.slice{height:calc(var(--uib-size)/6);position:relative;width:100%}.slice:after,.slice:before{--uib-a:calc(var(--uib-speed)/-2);--uib-b:calc(var(--uib-speed)/-6);animation:orbit var(--uib-speed) linear infinite;background-color:var(--uib-color);border-radius:50%;content:"";flex-shrink:0;height:100%;left:calc(50% - var(--uib-size)/12);position:absolute;top:0;transition:background-color .3s ease;width:16.6666666667%}.slice:first-child:after{animation-delay:var(--uib-a)}.slice:nth-child(2):before{animation-delay:var(--uib-b)}.slice:nth-child(2):after{animation-delay:calc(var(--uib-a) + var(--uib-b))}.slice:nth-child(3):before{animation-delay:calc(var(--uib-b)*2)}.slice:nth-child(3):after{animation-delay:calc(var(--uib-a) + var(--uib-b)*2)}.slice:nth-child(4):before{animation-delay:calc(var(--uib-b)*3)}.slice:nth-child(4):after{animation-delay:calc(var(--uib-a) + var(--uib-b)*3)}.slice:nth-child(5):before{animation-delay:calc(var(--uib-b)*4)}.slice:nth-child(5):after{animation-delay:calc(var(--uib-a) + var(--uib-b)*4)}.slice:nth-child(6):before{animation-delay:calc(var(--uib-b)*5)}.slice:nth-child(6):after{animation-delay:calc(var(--uib-a) + var(--uib-b)*5)}@keyframes orbit{0%{opacity:.65;transform:translateX(calc(var(--uib-size)*.25)) scale(.73684)}5%{opacity:.58;transform:translateX(calc(var(--uib-size)*.235)) scale(.684208)}10%{opacity:.51;transform:translateX(calc(var(--uib-size)*.182)) scale(.631576)}15%{opacity:.44;transform:translateX(calc(var(--uib-size)*.129)) scale(.578944)}20%{opacity:.37;transform:translateX(calc(var(--uib-size)*.076)) scale(.526312)}25%{opacity:.3;transform:translateX(0) scale(.47368)}30%{opacity:.37;transform:translateX(calc(var(--uib-size)*-.076)) scale(.526312)}35%{opacity:.44;transform:translateX(calc(var(--uib-size)*-.129)) scale(.578944)}40%{opacity:.51;transform:translateX(calc(var(--uib-size)*-.182)) scale(.631576)}45%{opacity:.58;transform:translateX(calc(var(--uib-size)*-.235)) scale(.684208)}50%{opacity:.65;transform:translateX(calc(var(--uib-size)*-.25)) scale(.73684)}55%{opacity:.72;transform:translateX(calc(var(--uib-size)*-.235)) scale(.789472)}60%{opacity:.79;transform:translateX(calc(var(--uib-size)*-.182)) scale(.842104)}65%{opacity:.86;transform:translateX(calc(var(--uib-size)*-.129)) scale(.894736)}70%{opacity:.93;transform:translateX(calc(var(--uib-size)*-.076)) scale(.947368)}75%{opacity:1;transform:translateX(0) scale(1)}80%{opacity:.93;transform:translateX(calc(var(--uib-size)*.076)) scale(.947368)}85%{opacity:.86;transform:translateX(calc(var(--uib-size)*.129)) scale(.894736)}90%{opacity:.79;transform:translateX(calc(var(--uib-size)*.182)) scale(.842104)}95%{opacity:.72;transform:translateX(calc(var(--uib-size)*.235)) scale(.789472)}to{opacity:.65;transform:translateX(calc(var(--uib-size)*.25)) scale(.73684)}}';
var i9 = class extends t {
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
    this.upgradeStoredProps(), this.applyDefaultProps({ size: 45, color: "black", speed: 2.5 }), this.template.innerHTML = `
      <div class="container">
        <div class="slice"></div>
        <div class="slice"></div>
        <div class="slice"></div>
        <div class="slice"></div>
        <div class="slice"></div>
        <div class="slice"></div>
      </div>
      <style>
        :host{
          --uib-size: ${this.size}px;
          --uib-color: ${this.color};
          --uib-speed: ${this.speed}s;
        }
        ${e3}
      </style>
    `, this.shadow.replaceChildren(this.template.content.cloneNode(true));
  }
  attributeChangedCallback() {
    const a5 = this.shadow.querySelector(".container"), i40 = this.shadow.querySelector("style");
    a5 && (a5.className = "container", i40.innerHTML = `
      :host{
        --uib-size: ${this.size}px;
        --uib-color: ${this.color};
        --uib-speed: ${this.speed}s;
      }
      ${e3}
    `);
  }
};
var t11 = { register: (a5 = "l-helix") => {
  customElements.get(a5) || customElements.define(a5, class extends i9 {
  });
}, element: i9 };

// node_modules/ldrs/dist/elements/hourglass.js
var t12 = ':host{align-items:center;display:inline-flex;flex-shrink:0;height:var(--uib-size);justify-content:center;width:var(--uib-size)}:host([hidden]){display:none}.container{animation:rotate calc(var(--uib-speed)*2) ease-in-out infinite;display:flex;flex-direction:column;height:100%;position:relative;transform:rotate(45deg);width:100%}.half{--uib-half-size:calc(var(--uib-size)*0.435);align-items:center;display:flex;height:var(--uib-half-size);isolation:isolate;justify-content:center;overflow:hidden;position:absolute;width:var(--uib-half-size)}.half:first-child{left:8.25%;top:8.25%}.half:first-child,.half:last-child{border-radius:50% 50% calc(var(--uib-size)/15)}.half:last-child{align-self:flex-end;bottom:8.25%;right:8.25%;transform:rotate(180deg)}.half:last-child:after{animation-delay:calc(var(--uib-speed)*-1)}.half:before{left:0;opacity:var(--uib-bg-opacity);position:absolute;top:0}.half:after,.half:before{background-color:var(--uib-color);content:"";height:100%;transition:background-color .3s ease;width:100%}.half:after{animation:flow calc(var(--uib-speed)*2) linear infinite both;border-radius:0 0 calc(var(--uib-size)/20) 0;display:block;position:relative;transform:rotate(45deg) translate(-3%,50%) scaleX(1.2);transform-origin:bottom right;z-index:1}@keyframes flow{0%{transform:rotate(45deg) translate(-3%,50%) scaleX(1.2)}30%{transform:rotate(45deg) translate(115%,50%) scaleX(1.2)}30.001%,50%{transform:rotate(0deg) translate(-85%,-85%) scaleX(1)}80%,to{transform:rotate(0deg) translate(0) scaleX(1)}}@keyframes rotate{0%,30%{transform:rotate(45deg)}50%,80%{transform:rotate(225deg)}to{transform:rotate(405deg)}}';
var i10 = class extends t {
  constructor() {
    super();
    __publicField(this, "_attributes", ["size", "color", "speed", "bg-opacity"]);
    __publicField(this, "size");
    __publicField(this, "color");
    __publicField(this, "speed");
    __publicField(this, "bg-opacity");
    this.storePropsToUpgrade(this._attributes), this.reflect(this._attributes);
  }
  static get observedAttributes() {
    return ["size", "color", "speed", "bg-opacity"];
  }
  connectedCallback() {
    this.upgradeStoredProps(), this.applyDefaultProps({ size: 40, color: "black", speed: 1.75, "bg-opacity": 0.1 }), this.template.innerHTML = `
      <div class="container">
        <div class="half"></div>
        <div class="half"></div>
      </div>
      <style>
        :host{
          --uib-size: ${this.size}px;
          --uib-color: ${this.color};
          --uib-speed: ${this.speed}s;
          --uib-bg-opacity: ${this["bg-opacity"]};
        }
        ${t12}
      </style>
    `, this.shadow.replaceChildren(this.template.content.cloneNode(true));
  }
  attributeChangedCallback() {
    const e11 = this.shadow.querySelector("style");
    e11 && (e11.innerHTML = `
      :host{
        --uib-size: ${this.size}px;
        --uib-color: ${this.color};
        --uib-speed: ${this.speed}s;
        --uib-bg-opacity: ${this["bg-opacity"]};
      }
      ${t12}
    `);
  }
};
var a2 = { register: (e11 = "l-hourglass") => {
  customElements.get(e11) || customElements.define(e11, class extends i10 {
  });
}, element: i10 };

// node_modules/ldrs/dist/elements/infinity.js
var s8 = ":host{align-items:center;display:inline-flex;flex-shrink:0;height:calc(var(--uib-size)*.42);justify-content:center;width:var(--uib-size)}:host([hidden]){display:none}.container{height:calc(var(--uib-size)*.42);overflow:visible;transform-origin:center;width:var(--uib-size)}.car{fill:none;stroke:var(--uib-color);stroke-dasharray:var(--uib-dash),var(--uib-gap);stroke-dashoffset:0;stroke-linecap:round;animation:travel var(--uib-speed) linear infinite;transition:stroke .5s ease;will-change:stroke-dasharray,stroke-dashoffset}.track{stroke:var(--uib-color);opacity:var(--uib-bg-opacity)}@keyframes travel{0%{stroke-dashoffset:0}to{stroke-dashoffset:100}}";
var i11 = class extends t {
  constructor() {
    super();
    __publicField(this, "_attributes", ["size", "color", "speed", "stroke", "stroke-length", "bg-opacity"]);
    __publicField(this, "size");
    __publicField(this, "color");
    __publicField(this, "speed");
    __publicField(this, "stroke");
    __publicField(this, "stroke-length");
    __publicField(this, "bg-opacity");
    __publicField(this, "d");
    this.storePropsToUpgrade(this._attributes), this.reflect(this._attributes), this.d = "M26.7,12.2c3.5,3.4,7.4,7.8,12.7,7.8c5.5,0,9.6-4.4,9.6-9.5C49,5,45.1,1,39.8,1c-5.5,0-9.5,4.2-13.1,7.8l-3.4,3.3c-3.6,3.6-7.6,7.8-13.1,7.8C4.9,20,1,16,1,10.5C1,5.4,5.1,1,10.6,1c5.3,0,9.2,4.5,12.7,7.8L26.7,12.2z";
  }
  static get observedAttributes() {
    return ["size", "color", "speed", "stroke", "stroke-length", "bg-opacity"];
  }
  connectedCallback() {
    this.upgradeStoredProps(), this.applyDefaultProps({ size: 55, color: "black", speed: 1.3, stroke: 4, "stroke-length": 0.15, "bg-opacity": 0.1 });
    const e11 = parseInt(this.size), i40 = t4(e11 / 50, this.d);
    this.template.innerHTML = `
      <svg
        class="container" 
        x="0px" 
        y="0px"
        viewBox="0 0 ${this.size} ${e11 * (2.1 / 5)}"
        height="${e11 * (2.1 / 5)}"
        width="${this.size}"
        preserveAspectRatio='xMidYMid meet'
      >
        <path
          class="track" 
          fill="none" 
          stroke-width="${this.stroke}" 
          pathlength="100"
          d="${i40}"
        />

        <path
          class="car" 
          fill="none" 
          stroke-width="${this.stroke}" 
          pathlength="100"
          d="${i40}"
        />
      </svg>
      <style>
        :host{
          --uib-size: ${this.size}px;
          --uib-color: ${this.color};
          --uib-speed: ${this.speed}s;
          --uib-dash: ${100 * parseFloat(this["stroke-length"])};
          --uib-gap: ${100 - 100 * parseFloat(this["stroke-length"])};
          --uib-bg-opacity: ${this["bg-opacity"]};
        }
        ${s8}
      </style>
    `, this.shadow.replaceChildren(this.template.content.cloneNode(true));
  }
  attributeChangedCallback() {
    const e11 = this.shadow.querySelector("style"), i40 = this.shadow.querySelector("svg"), r9 = this.shadow.querySelectorAll("path"), n4 = parseInt(this.size);
    e11 && (i40.setAttribute("height", String(n4 * (2.1 / 5))), i40.setAttribute("width", this.size), i40.setAttribute("viewBox", `0 0 ${this.size} ${n4 * (2.1 / 5)}`), r9.forEach((e12) => {
      e12.setAttribute("stroke-width", this.stroke), e12.setAttribute("d", t4(n4 / 50, this.d));
    }), e11.innerHTML = `
      :host{
        --uib-size: ${this.size}px;
        --uib-color: ${this.color};
        --uib-speed: ${this.speed}s;
        --uib-dash: ${100 * parseFloat(this["stroke-length"])};
        --uib-gap: ${100 - 100 * parseFloat(this["stroke-length"])};
        --uib-bg-opacity: ${this["bg-opacity"]};
      }
      ${s8}
    `);
  }
};
var r4 = { register: (t34 = "l-infinity") => {
  customElements.get(t34) || customElements.define(t34, class extends i11 {
  });
}, element: i11 };

// node_modules/ldrs/dist/elements/jelly.js
var t13 = ':host{align-items:center;display:inline-flex;flex-shrink:0;height:var(--uib-size);justify-content:center;width:var(--uib-size)}:host([hidden]){display:none}.container{animation:rotate calc(var(--uib-speed)*2) linear infinite;filter:url(#uib-jelly-ooze);height:calc(var(--uib-size)/2);position:relative;width:var(--uib-size);will-change:transform}.container:after,.container:before{background-color:var(--uib-color);border-radius:100%;content:"";height:100%;left:25%;position:absolute;top:0;transition:background-color .3s ease;width:50%;will-change:transform}.container:before{animation:shift-left var(--uib-speed) ease infinite}.container:after{animation:shift-right var(--uib-speed) ease infinite}.svg{height:0;position:absolute;width:0}@keyframes rotate{0%,49.999%,to{transform:none}50%,99.999%{transform:rotate(90deg)}}@keyframes shift-left{0%,to{transform:translateX(0)}50%{transform:scale(.65) translateX(-75%)}}@keyframes shift-right{0%,to{transform:translateX(0)}50%{transform:scale(.65) translateX(75%)}}';
var i12 = class extends t {
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
    this.upgradeStoredProps(), this.applyDefaultProps({ size: 40, color: "black", speed: 0.9 }), this.template.innerHTML = `
      <div
        class="container"
      ></div>
      <svg width="0" height="0" class="svg">
        <defs>
          <filter id="uib-jelly-ooze">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation=${parseInt(this.size) / 8}
              result="blur"
            />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="ooze"
            />
            <feBlend in="SourceGraphic" in2="ooze" />
          </filter>
        </defs>
      </svg>
      <style>
        :host{
          --uib-size: ${this.size}px;
          --uib-color: ${this.color};
          --uib-speed: ${this.speed}s;
        }
        ${t13}
      </style>
    `, this.shadow.replaceChildren(this.template.content.cloneNode(true));
  }
  attributeChangedCallback() {
    const e11 = this.shadow.querySelector("style");
    e11 && (e11.innerHTML = `
      :host{
        --uib-size: ${this.size}px;
        --uib-color: ${this.color};
        --uib-speed: ${this.speed}s;
      }
      ${t13}
    `);
  }
};
var s9 = { register: (e11 = "l-jelly") => {
  customElements.get(e11) || customElements.define(e11, class extends i12 {
  });
}, element: i12 };

// node_modules/ldrs/dist/elements/jellyTriangle.js
var t14 = ':host{align-items:center;display:inline-flex;flex-shrink:0;height:var(--uib-size);justify-content:center;width:var(--uib-size)}:host([hidden]){display:none}.container{filter:url(#uib-jelly-triangle-ooze);height:var(--uib-size);position:relative;width:var(--uib-size)}.container:after,.container:before,.dot{background-color:var(--uib-color);border-radius:100%;content:"";height:33%;position:absolute;transition:background-color .3s ease;width:33%;will-change:transform}.dot{animation:grow var(--uib-speed) ease infinite;left:30%;top:6%}.container:before{animation:grow var(--uib-speed) ease calc(var(--uib-speed)*-.666) infinite;bottom:6%;right:0}.container:after{animation:grow var(--uib-speed) ease calc(var(--uib-speed)*-.333) infinite;bottom:6%;left:0}.traveler{animation:triangulate var(--uib-speed) ease infinite;background-color:var(--uib-color);border-radius:100%;height:33%;left:30%;top:6%;transition:background-color .3s ease;width:33%}.svg,.traveler{position:absolute}.svg{height:0;width:0}@keyframes triangulate{0%,to{transform:none}33.333%{transform:translate(120%,175%)}66.666%{transform:translate(-95%,175%)}}@keyframes grow{0%,85%,to{transform:scale(1.5)}50%,60%{transform:scale(0)}}';
var i13 = class extends t {
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
    this.upgradeStoredProps(), this.applyDefaultProps({ size: 30, color: "black", speed: 1.75 }), this.template.innerHTML = `
      <div
        class="container"
      >
      <div class="dot"></div>
      <div class="traveler"></div>
      </div>
      <svg width="0" height="0" class="svg">
        <defs>
          <filter id="uib-jelly-triangle-ooze">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation=${parseInt(this.size) / 9}
              result="blur"
            />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="ooze"
            />
            <feBlend in="SourceGraphic" in2="ooze" />
          </filter>
        </defs>
      </svg>
      <style>
        :host{
          --uib-size: ${this.size}px;
          --uib-color: ${this.color};
          --uib-speed: ${this.speed}s;
        }
        ${t14}
      </style>
    `, this.shadow.replaceChildren(this.template.content.cloneNode(true));
  }
  attributeChangedCallback() {
    const e11 = this.shadow.querySelector("style");
    e11 && (e11.innerHTML = `
      :host{
        --uib-size: ${this.size}px;
        --uib-color: ${this.color};
        --uib-speed: ${this.speed}s;
      }
      ${t14}
    `);
  }
};
var s10 = { register: (e11 = "l-jelly-triangle") => {
  customElements.get(e11) || customElements.define(e11, class extends i13 {
  });
}, element: i13 };

// node_modules/ldrs/dist/elements/leapfrog.js
var t15 = ':host{align-items:center;display:inline-flex;flex-shrink:0;height:calc(var(--uib-size)*.62);justify-content:center;width:var(--uib-size)}:host([hidden]){display:none}.container{height:var(--uib-size);justify-content:space-between;position:relative;top:15%;width:var(--uib-size)}.container,.dot{align-items:center;display:flex;left:0}.dot{height:100%;justify-content:flex-start;position:absolute;top:0;width:100%}.dot:before{background-color:var(--uib-color);border-radius:50%;content:"";display:block;height:calc(var(--uib-size)*.22);transition:background-color .3s ease;width:calc(var(--uib-size)*.22)}.dot:first-child{animation:leapFrog var(--uib-speed) ease infinite}.dot:nth-child(2){animation:leapFrog var(--uib-speed) ease calc(var(--uib-speed)/-1.5) infinite;transform:translateX(calc(var(--uib-size)*.4))}.dot:nth-child(3){animation:leapFrog var(--uib-speed) ease calc(var(--uib-speed)/-3) infinite;transform:translateX(calc(var(--uib-size)*.8)) rotate(0deg)}@keyframes leapFrog{0%{transform:translateX(0) rotate(0deg)}33.333%{transform:translateX(0) rotate(180deg)}66.666%{transform:translateX(calc(var(--uib-size)*-.38)) rotate(180deg)}99.999%{transform:translateX(calc(var(--uib-size)*-.78)) rotate(180deg)}to{transform:translateX(0) rotate(0deg)}}';
var s11 = class extends t {
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
    this.upgradeStoredProps(), this.applyDefaultProps({ size: 40, color: "black", speed: 2.5 }), this.template.innerHTML = `
      <div class="container">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
      <style>
        :host{
          --uib-size: ${this.size}px;
          --uib-color: ${this.color};
          --uib-speed: ${this.speed}s;
        }
        ${t15}
      </style>
    `, this.shadow.replaceChildren(this.template.content.cloneNode(true));
  }
  attributeChangedCallback() {
    const e11 = this.shadow.querySelector("style");
    e11 && (e11.innerHTML = `
      :host{
        --uib-size: ${this.size}px;
        --uib-color: ${this.color};
        --uib-speed: ${this.speed}s;
      }
      ${t15}
    `);
  }
};
var i14 = { register: (e11 = "l-leapfrog") => {
  customElements.get(e11) || customElements.define(e11, class extends s11 {
  });
}, element: s11 };

// node_modules/ldrs/dist/elements/lineSpinner.js
var i15 = ':host{align-items:center;display:inline-flex;flex-shrink:0;height:var(--uib-size);justify-content:center;width:var(--uib-size)}:host([hidden]){display:none}.container{align-items:center;display:flex;height:var(--uib-size);justify-content:flex-start;position:relative;width:var(--uib-size)}.line{align-items:flex-start;display:flex;height:100%;left:calc(50% - var(--uib-stroke)/2);position:absolute;top:0;width:var(--uib-stroke)}.line:before{animation:pulse calc(var(--uib-speed)) ease-in-out infinite;background-color:var(--uib-color);border-radius:calc(var(--uib-stroke)/2);content:"";height:22%;transform-origin:center bottom;transition:background-color .3s ease;width:100%}.line:first-child{transform:rotate(-30deg)}.line:first-child:before{animation-delay:calc(var(--uib-speed)/-12*1)}.line:nth-child(2){transform:rotate(-60deg)}.line:nth-child(2):before{animation-delay:calc(var(--uib-speed)/-12*2)}.line:nth-child(3){transform:rotate(-90deg)}.line:nth-child(3):before{animation-delay:calc(var(--uib-speed)/-12*3)}.line:nth-child(4){transform:rotate(-120deg)}.line:nth-child(4):before{animation-delay:calc(var(--uib-speed)/-12*4)}.line:nth-child(5){transform:rotate(-150deg)}.line:nth-child(5):before{animation-delay:calc(var(--uib-speed)/-12*5)}.line:nth-child(6){transform:rotate(-180deg)}.line:nth-child(6):before{animation-delay:calc(var(--uib-speed)/-12*6)}.line:nth-child(7){transform:rotate(-210deg)}.line:nth-child(7):before{animation-delay:calc(var(--uib-speed)/-12*7)}.line:nth-child(8){transform:rotate(-240deg)}.line:nth-child(8):before{animation-delay:calc(var(--uib-speed)/-12*8)}.line:nth-child(9){transform:rotate(-270deg)}.line:nth-child(9):before{animation-delay:calc(var(--uib-speed)/-12*9)}.line:nth-child(10){transform:rotate(-300deg)}.line:nth-child(10):before{animation-delay:calc(var(--uib-speed)/-12*10)}.line:nth-child(11){transform:rotate(-330deg)}.line:nth-child(11):before{animation-delay:calc(var(--uib-speed)/-12*11)}@keyframes pulse{0%,80%,to{opacity:0;transform:scaleY(.75)}20%{opacity:1;transform:scaleY(1)}}';
var t16 = class extends t {
  constructor() {
    super();
    __publicField(this, "_attributes", ["size", "color", "speed", "stroke"]);
    __publicField(this, "size");
    __publicField(this, "color");
    __publicField(this, "speed");
    __publicField(this, "stroke");
    this.storePropsToUpgrade(this._attributes), this.reflect(this._attributes);
  }
  static get observedAttributes() {
    return ["size", "color", "speed", "stroke"];
  }
  connectedCallback() {
    this.upgradeStoredProps(), this.applyDefaultProps({ size: 40, color: "black", speed: 1, stroke: 3 }), this.template.innerHTML = `
      <div class="container">
        <div class="line"></div>
        <div class="line"></div>
        <div class="line"></div>
        <div class="line"></div>
        <div class="line"></div>
        <div class="line"></div>
        <div class="line"></div>
        <div class="line"></div>
        <div class="line"></div>
        <div class="line"></div>
        <div class="line"></div>
        <div class="line"></div>
      </div>
      <style>
        :host{
          --uib-size: ${this.size}px;
          --uib-color: ${this.color};
          --uib-speed: ${this.speed}s;
          --uib-stroke: ${this.stroke}px;
        }
        ${i15}
      </style>
    `, this.shadow.replaceChildren(this.template.content.cloneNode(true));
  }
  attributeChangedCallback() {
    const e11 = this.shadow.querySelector("style");
    e11 && (e11.innerHTML = `
      :host{
        --uib-size: ${this.size}px;
        --uib-color: ${this.color};
        --uib-speed: ${this.speed}s;
        --uib-stroke: ${this.stroke}px;
      }
      ${i15}
    `);
  }
};
var n2 = { register: (e11 = "l-line-spinner") => {
  customElements.get(e11) || customElements.define(e11, class extends t16 {
  });
}, element: t16 };

// node_modules/ldrs/dist/elements/lineWobble.js
var t17 = ':host{align-items:center;display:inline-flex;flex-shrink:0;height:var(--uib-stroke);justify-content:center;width:var(--uib-size)}:host([hidden]){display:none}.container{align-items:center;border-radius:calc(var(--uib-stroke)/2);display:flex;height:var(--uib-stroke);justify-content:center;overflow:hidden;position:relative;transform:translateZ(0);width:var(--uib-size)}.container:before{left:0;opacity:var(--uib-bg-opacity);position:absolute;top:0}.container:after,.container:before{background-color:var(--uib-color);content:"";height:100%;transition:background-color .3s ease;width:100%}.container:after{animation:wobble var(--uib-speed) ease-in-out infinite;border-radius:calc(var(--uib-stroke)/2);transform:translateX(-95%)}@keyframes wobble{0%,to{transform:translateX(-95%)}50%{transform:translateX(95%)}}';
var s12 = class extends t {
  constructor() {
    super();
    __publicField(this, "_attributes", ["size", "color", "speed", "stroke", "bg-opacity"]);
    __publicField(this, "size");
    __publicField(this, "color");
    __publicField(this, "speed");
    __publicField(this, "stroke");
    __publicField(this, "bg-opacity");
    this.storePropsToUpgrade(this._attributes), this.reflect(this._attributes);
  }
  static get observedAttributes() {
    return ["size", "color", "speed", "stroke", "bg-opacity"];
  }
  connectedCallback() {
    this.upgradeStoredProps(), this.applyDefaultProps({ size: 80, color: "black", speed: 1.75, stroke: 5, "bg-opacity": 0.1 }), this.template.innerHTML = `
      <div class="container"></div>
      <style>
        :host{
          --uib-size: ${this.size}px;
          --uib-color: ${this.color};
          --uib-speed: ${this.speed}s;
          --uib-stroke: ${this.stroke}px;
          --uib-bg-opacity: ${this["bg-opacity"]};
        }
        ${t17}
      </style>
    `, this.shadow.replaceChildren(this.template.content.cloneNode(true));
  }
  attributeChangedCallback() {
    const e11 = this.shadow.querySelector("style");
    e11 && (e11.innerHTML = `
      :host{
        --uib-size: ${this.size}px;
        --uib-color: ${this.color};
        --uib-speed: ${this.speed}s;
        --uib-stroke: ${this.stroke}px;
        --uib-bg-opacity: ${this["bg-opacity"]};
      }
      ${t17}
    `);
  }
};
var i16 = { register: (e11 = "l-line-wobble") => {
  customElements.get(e11) || customElements.define(e11, class extends s12 {
  });
}, element: s12 };

// node_modules/ldrs/dist/elements/metronome.js
var t18 = ':host{align-items:center;display:inline-flex;flex-shrink:0;height:calc(var(--uib-size)*.63);justify-content:center;width:var(--uib-size)}:host([hidden]){display:none}.container{height:var(--uib-size);position:relative;top:8%;width:var(--uib-size)}.container,.dot{align-items:center;display:flex;justify-content:flex-start}.dot{animation:swing var(--uib-speed) linear infinite;height:100%;left:0;position:absolute;top:13.5%;width:100%}.dot:before{background-color:var(--uib-color);border-radius:50%;content:"";height:25%;transition:background-color .3s ease;width:25%}.dot:first-child{animation-delay:calc(var(--uib-speed)*-.36)}.dot:nth-child(2){animation-delay:calc(var(--uib-speed)*-.27);opacity:.8}.dot:nth-child(2):before{transform:scale(.9)}.dot:nth-child(3){animation-delay:calc(var(--uib-speed)*-.18);opacity:.6}.dot:nth-child(3):before{transform:scale(.8)}.dot:nth-child(4){animation-delay:calc(var(--uib-speed)*-.09);opacity:.4}.dot:nth-child(4):before{transform:scale(.7)}@keyframes swing{0%{transform:rotate(0deg)}15%{transform:rotate(0deg)}50%{transform:rotate(180deg)}65%{transform:rotate(180deg)}to{transform:rotate(0deg)}}';
var i17 = class extends t {
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
    this.upgradeStoredProps(), this.applyDefaultProps({ size: 40, color: "black", speed: 1.6 }), this.template.innerHTML = `
      <div class="container">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
      <style>
        :host{
          --uib-size: ${this.size}px;
          --uib-color: ${this.color};
          --uib-speed: ${this.speed}s;
        }
        ${t18}
      </style>
    `, this.shadow.replaceChildren(this.template.content.cloneNode(true));
  }
  attributeChangedCallback() {
    const e11 = this.shadow.querySelector("style");
    e11 && (e11.innerHTML = `
      :host{
        --uib-size: ${this.size}px;
        --uib-color: ${this.color};
        --uib-speed: ${this.speed}s;
      }
      ${t18}
    `);
  }
};
var s13 = { register: (e11 = "l-metronome") => {
  customElements.get(e11) || customElements.define(e11, class extends i17 {
  });
}, element: i17 };

// node_modules/ldrs/dist/elements/mirage.js
var i18 = ":host{--uib-dot-size:calc(var(--uib-size)*0.23);align-items:center;display:inline-flex;flex-shrink:0;height:var(--uib-dot-size);justify-content:center;width:var(--uib-size)}:host([hidden]){display:none}.container{align-items:center;display:flex;filter:url(#uib-jelly-ooze);justify-content:space-between;position:relative;width:var(--uib-size)}.container,.dot{height:var(--uib-dot-size)}.dot{animation:stream var(--uib-speed) linear infinite both;background-color:var(--uib-color);border-radius:50%;display:block;left:calc(0px - var(--uib-dot-size)/2);position:absolute;top:calc(50% - var(--uib-dot-size)/2);transition:background-color .3s ease;width:var(--uib-dot-size)}.dot:nth-child(2){animation-delay:calc(var(--uib-speed)*-.2)}.dot:nth-child(3){animation-delay:calc(var(--uib-speed)*-.4)}.dot:nth-child(4){animation-delay:calc(var(--uib-speed)*-.6)}.dot:nth-child(5){animation-delay:calc(var(--uib-speed)*-.8)}@keyframes stream{0%,to{transform:translateX(0) scale(0)}50%{transform:translateX(calc(var(--uib-size)*.5)) scale(1)}99.999%{transform:translateX(calc(var(--uib-size))) scale(0)}}";
var t19 = class extends t {
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
    this.upgradeStoredProps(), this.applyDefaultProps({ size: 60, color: "black", speed: 2.5 }), this.template.innerHTML = `
      <div class="container">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
      <svg width="0" height="0" class="svg">
        <defs>
          <filter id="uib-jelly-ooze">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation=${parseInt(this.size) / 20}
              result="blur"
            />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="ooze"
            />
            <feBlend in="SourceGraphic" in2="ooze" />
          </filter>
        </defs>
      </svg>
      <style>
        :host{
          --uib-size: ${this.size}px;
          --uib-color: ${this.color};
          --uib-speed: ${this.speed}s;
        }
        ${i18}
      </style>
    `, this.shadow.replaceChildren(this.template.content.cloneNode(true));
  }
  attributeChangedCallback() {
    const e11 = this.shadow.querySelector("style");
    e11 && (e11.innerHTML = `
      :host{
        --uib-size: ${this.size}px;
        --uib-color: ${this.color};
        --uib-speed: ${this.speed}s;
      }
      ${i18}
    `);
  }
};
var s14 = { register: (e11 = "l-mirage") => {
  customElements.get(e11) || customElements.define(e11, class extends t19 {
  });
}, element: t19 };

// node_modules/ldrs/dist/elements/miyagi.js
var i19 = ":host{align-items:center;display:inline-flex;flex-shrink:0;height:var(--uib-size);justify-content:center;width:var(--uib-size)}:host([hidden]){display:none}.container{align-items:center;display:flex;height:var(--uib-size);justify-content:center;position:relative;width:var(--uib-size)}.line{animation:rotate var(--uib-speed) ease-in-out infinite alternate;background-color:var(--uib-color);border-radius:calc(var(--uib-stroke)/2);height:var(--uib-stroke);left:0;position:absolute;top:calc(50% - var(--uib-stroke)/2);transition:background-color .3s ease;width:100%}.line:first-child,.line:nth-child(2){animation-delay:calc(var(--uib-speed)*-.375)}.line:nth-child(2){opacity:.8}.line:nth-child(3){animation-delay:calc(var(--uib-speed)*-.3);opacity:.6}.line:nth-child(4){animation-delay:calc(var(--uib-speed)*-.225);opacity:.4}.line:nth-child(5){animation-delay:calc(var(--uib-speed)*-.15);opacity:.2}.line:nth-child(6){animation-delay:calc(var(--uib-speed)*-.075);opacity:.1}@keyframes rotate{0%{transform:rotate(0deg)}to{transform:rotate(180deg)}}";
var t20 = class extends t {
  constructor() {
    super();
    __publicField(this, "_attributes", ["size", "color", "speed", "stroke"]);
    __publicField(this, "size");
    __publicField(this, "color");
    __publicField(this, "speed");
    __publicField(this, "stroke");
    this.storePropsToUpgrade(this._attributes), this.reflect(this._attributes);
  }
  static get observedAttributes() {
    return ["size", "color", "speed", "stroke"];
  }
  connectedCallback() {
    this.upgradeStoredProps(), this.applyDefaultProps({ size: 35, color: "black", speed: 0.9, stroke: 3.5 }), this.template.innerHTML = `
      <div class="container">
        <div class="line"></div>
        <div class="line"></div>
        <div class="line"></div>
        <div class="line"></div>
        <div class="line"></div>
        <div class="line"></div>
      </div>
      <style>
        :host{
          --uib-size: ${this.size}px;
          --uib-color: ${this.color};
          --uib-speed: ${this.speed}s;
          --uib-stroke: ${this.stroke}px;
        }
        ${i19}
      </style>
    `, this.shadow.replaceChildren(this.template.content.cloneNode(true));
  }
  attributeChangedCallback() {
    const e11 = this.shadow.querySelector("style");
    e11 && (e11.innerHTML = `
      :host{
        --uib-size: ${this.size}px;
        --uib-color: ${this.color};
        --uib-speed: ${this.speed}s;
        --uib-stroke: ${this.stroke}px;
      }
      ${i19}
    `);
  }
};
var s15 = { register: (e11 = "l-miyagi") => {
  customElements.get(e11) || customElements.define(e11, class extends t20 {
  });
}, element: t20 };

// node_modules/ldrs/dist/elements/momentum.js
var t21 = ':host{align-items:center;display:inline-flex;flex-shrink:0;height:var(--uib-size);justify-content:center;width:var(--uib-size)}:host([hidden]){display:none}.container{align-items:center;animation:rotate var(--uib-speed) linear infinite;display:flex;height:var(--uib-size);justify-content:center;position:relative;width:var(--uib-size)}.container:after,.container:before{background-color:var(--uib-color);border-radius:50%;content:"";height:25%;transition:background-color .3s ease;width:25%}.container:before{animation:wobble2 calc(var(--uib-speed)*1.25) ease-in-out infinite}.container:after{animation:wobble calc(var(--uib-speed)*1.25) ease-in-out infinite}.container:before{margin-right:10%}@keyframes wobble{0%,to{transform:translateX(0)}50%{transform:translateX(calc(var(--uib-size)*.2)) scale(1.1)}}@keyframes wobble2{0%,to{transform:translateX(0)}50%{transform:translateX(calc(var(--uib-size)*-.2)) scale(1.1)}}@keyframes rotate{0%{transform:rotate(0deg)}to{transform:rotate(1turn)}}';
var i20 = class extends t {
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
    this.upgradeStoredProps(), this.applyDefaultProps({ size: 40, color: "black", speed: 1.1 }), this.template.innerHTML = `
      <div class="container"></div>
      <style>
        :host{
          --uib-size: ${this.size}px;
          --uib-color: ${this.color};
          --uib-speed: ${this.speed}s;
        }
        ${t21}
      </style>
    `, this.shadow.replaceChildren(this.template.content.cloneNode(true));
  }
  attributeChangedCallback() {
    const e11 = this.shadow.querySelector("style");
    e11 && (e11.innerHTML = `
      :host{
        --uib-size: ${this.size}px;
        --uib-color: ${this.color};
        --uib-speed: ${this.speed}s;
      }
      ${t21}
    `);
  }
};
var s16 = { register: (e11 = "l-momentum") => {
  customElements.get(e11) || customElements.define(e11, class extends i20 {
  });
}, element: i20 };

// node_modules/ldrs/dist/elements/newtonsCradle.js
var e4 = ':host{align-items:center;display:inline-flex;flex-shrink:0;height:calc(var(--uib-size)*.3);justify-content:center;width:var(--uib-size)}:host([hidden]){display:none}.container{height:calc(var(--uib-size)*.51);justify-content:center;top:28%;width:51%}.container,.dot{align-items:center;display:flex;position:relative}.dot{flex-shrink:0;height:100%;transform-origin:center top;width:25%}.dot:after{background-color:var(--uib-color);border-radius:50%;content:"";display:block;height:25%;transition:background-color .3s ease;width:100%}.dot:first-child{animation:swing var(--uib-speed) linear infinite}.dot:last-child{animation:swing2 var(--uib-speed) linear infinite}@keyframes swing{0%{animation-timing-function:ease-out;transform:rotate(0deg)}25%{animation-timing-function:ease-in;transform:rotate(70deg)}50%{animation-timing-function:linear;transform:rotate(0deg)}}@keyframes swing2{0%{animation-timing-function:linear;transform:rotate(0deg)}50%{animation-timing-function:ease-out;transform:rotate(0deg)}75%{animation-timing-function:ease-in;transform:rotate(-70deg)}}';
var i21 = class extends t {
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
    this.upgradeStoredProps(), this.applyDefaultProps({ size: 78, color: "black", speed: 1.4 }), this.template.innerHTML = `
      <div class="container">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
      <style>
        :host{
          --uib-size: ${this.size}px;
          --uib-color: ${this.color};
          --uib-speed: ${this.speed}s;
        }
        ${e4}
      </style>
    `, this.shadow.replaceChildren(this.template.content.cloneNode(true));
  }
  attributeChangedCallback() {
    const t34 = this.shadow.querySelector("style");
    t34 && (t34.innerHTML = `
      :host{
        --uib-size: ${this.size}px;
        --uib-color: ${this.color};
        --uib-speed: ${this.speed}s;
      }
      ${e4}
    `);
  }
};
var n3 = { register: (t34 = "l-newtons-cradle") => {
  customElements.get(t34) || customElements.define(t34, class extends i21 {
  });
}, element: i21 };

// node_modules/ldrs/dist/elements/orbit.js
var e5 = ':host{--uib-dot-size:calc(var(--uib-size)*0.4);align-items:center;display:inline-flex;flex-shrink:0;height:var(--uib-dot-size);justify-content:center;width:var(--uib-size)}:host([hidden]){display:none}.container{align-items:center;display:flex;height:100%;justify-content:center;position:relative;width:100%}.container:after,.container:before{background-color:var(--uib-color);border-radius:50%;content:"";flex-shrink:0;height:var(--uib-dot-size);position:absolute;transition:background-color .3s ease;width:var(--uib-dot-size)}.container:before{animation:orbit var(--uib-speed) linear infinite}.container:after{animation:orbit var(--uib-speed) linear calc(var(--uib-speed)/-2) infinite}@keyframes orbit{0%{opacity:.65;transform:translateX(calc(var(--uib-size)*.25)) scale(.73684)}5%{opacity:.58;transform:translateX(calc(var(--uib-size)*.235)) scale(.684208)}10%{opacity:.51;transform:translateX(calc(var(--uib-size)*.182)) scale(.631576)}15%{opacity:.44;transform:translateX(calc(var(--uib-size)*.129)) scale(.578944)}20%{opacity:.37;transform:translateX(calc(var(--uib-size)*.076)) scale(.526312)}25%{opacity:.3;transform:translateX(0) scale(.47368)}30%{opacity:.37;transform:translateX(calc(var(--uib-size)*-.076)) scale(.526312)}35%{opacity:.44;transform:translateX(calc(var(--uib-size)*-.129)) scale(.578944)}40%{opacity:.51;transform:translateX(calc(var(--uib-size)*-.182)) scale(.631576)}45%{opacity:.58;transform:translateX(calc(var(--uib-size)*-.235)) scale(.684208)}50%{opacity:.65;transform:translateX(calc(var(--uib-size)*-.25)) scale(.73684)}55%{opacity:.72;transform:translateX(calc(var(--uib-size)*-.235)) scale(.789472)}60%{opacity:.79;transform:translateX(calc(var(--uib-size)*-.182)) scale(.842104)}65%{opacity:.86;transform:translateX(calc(var(--uib-size)*-.129)) scale(.894736)}70%{opacity:.93;transform:translateX(calc(var(--uib-size)*-.076)) scale(.947368)}75%{opacity:1;transform:translateX(0) scale(1)}80%{opacity:.93;transform:translateX(calc(var(--uib-size)*.076)) scale(.947368)}85%{opacity:.86;transform:translateX(calc(var(--uib-size)*.129)) scale(.894736)}90%{opacity:.79;transform:translateX(calc(var(--uib-size)*.182)) scale(.842104)}95%{opacity:.72;transform:translateX(calc(var(--uib-size)*.235)) scale(.789472)}to{opacity:.65;transform:translateX(calc(var(--uib-size)*.25)) scale(.73684)}}';
var t22 = class extends t {
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
    this.upgradeStoredProps(), this.applyDefaultProps({ size: 35, color: "black", speed: 1.5 }), this.template.innerHTML = `
      <div class="container"></div>
      <style>
        :host{
          --uib-size: ${this.size}px;
          --uib-color: ${this.color};
          --uib-speed: ${this.speed}s;
        }
        ${e5}
      </style>
    `, this.shadow.replaceChildren(this.template.content.cloneNode(true));
  }
  attributeChangedCallback() {
    const a5 = this.shadow.querySelector("style");
    a5 && (a5.innerHTML = `
      :host{
        --uib-size: ${this.size}px;
        --uib-color: ${this.color};
        --uib-speed: ${this.speed}s;
      }
      ${e5}
    `);
  }
};
var s17 = { register: (a5 = "l-orbit") => {
  customElements.get(a5) || customElements.define(a5, class extends t22 {
  });
}, element: t22 };

// node_modules/ldrs/dist/elements/ping.js
var t23 = ':host{align-items:center;display:inline-flex;flex-shrink:0;height:var(--uib-size);justify-content:center;width:var(--uib-size)}:host([hidden]){display:none}.container{height:var(--uib-size);position:relative;width:var(--uib-size)}.container:after,.container:before{animation:pulse var(--uib-speed) linear infinite;background-color:var(--uib-color);border-radius:50%;content:"";height:100%;left:0;opacity:0;position:absolute;top:0;transform:scale(0);transition:background-color .3s ease;width:100%}.container:after{animation-delay:calc(var(--uib-speed)/-2)}@keyframes pulse{0%{opacity:1;transform:scale(0)}to{opacity:0;transform:scale(1)}}';
var s18 = class extends t {
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
    this.upgradeStoredProps(), this.applyDefaultProps({ size: 45, color: "black", speed: 2 }), this.template.innerHTML = `
      <div class="container"></div>
      <style>
        :host{
          --uib-size: ${this.size}px;
          --uib-color: ${this.color};
          --uib-speed: ${this.speed}s;
        }
        ${t23}
      </style>
    `, this.shadow.replaceChildren(this.template.content.cloneNode(true));
  }
  attributeChangedCallback() {
    const e11 = this.shadow.querySelector("style");
    e11 && (e11.innerHTML = `
      :host{
        --uib-size: ${this.size}px;
        --uib-color: ${this.color};
        --uib-speed: ${this.speed}s;
      }
      ${t23}
    `);
  }
};
var i22 = { register: (e11 = "l-ping") => {
  customElements.get(e11) || customElements.define(e11, class extends s18 {
  });
}, element: s18 };

// node_modules/ldrs/dist/elements/pinwheel.js
var i23 = ":host{align-items:center;display:inline-flex;flex-shrink:0;height:var(--uib-size);justify-content:center;width:var(--uib-size)}:host([hidden]){display:none}.container{align-items:center;display:flex;height:var(--uib-size);justify-content:center;position:relative;width:var(--uib-size)}.line{animation:rotate var(--uib-speed) ease-in-out infinite;background-color:var(--uib-color);border-radius:calc(var(--uib-stroke)/2);height:var(--uib-stroke);left:0;position:absolute;top:calc(50% - var(--uib-stroke)/2);transition:background-color .3s ease;width:100%}.line:first-child,.line:nth-child(2){animation-delay:calc(var(--uib-speed)*-.375)}.line:nth-child(2){opacity:.8}.line:nth-child(3){animation-delay:calc(var(--uib-speed)*-.3);opacity:.6}.line:nth-child(4){animation-delay:calc(var(--uib-speed)*-.225);opacity:.4}.line:nth-child(5){animation-delay:calc(var(--uib-speed)*-.15);opacity:.2}.line:nth-child(6){animation-delay:calc(var(--uib-speed)*-.075);opacity:.1}@keyframes rotate{0%{transform:rotate(0deg)}to{transform:rotate(180deg)}}";
var t24 = class extends t {
  constructor() {
    super();
    __publicField(this, "_attributes", ["size", "color", "speed", "stroke"]);
    __publicField(this, "size");
    __publicField(this, "color");
    __publicField(this, "speed");
    __publicField(this, "stroke");
    this.storePropsToUpgrade(this._attributes), this.reflect(this._attributes);
  }
  static get observedAttributes() {
    return ["size", "color", "speed", "stroke"];
  }
  connectedCallback() {
    this.upgradeStoredProps(), this.applyDefaultProps({ size: 35, color: "black", speed: 0.9, stroke: 3.5 }), this.template.innerHTML = `
      <div class="container">
        <div class="line"></div>
        <div class="line"></div>
        <div class="line"></div>
        <div class="line"></div>
        <div class="line"></div>
        <div class="line"></div>
      </div>
      <style>
        :host{
          --uib-size: ${this.size}px;
          --uib-color: ${this.color};
          --uib-speed: ${this.speed}s;
          --uib-stroke: ${this.stroke}px;
        }
        ${i23}
      </style>
    `, this.shadow.replaceChildren(this.template.content.cloneNode(true));
  }
  attributeChangedCallback() {
    const e11 = this.shadow.querySelector("style");
    e11 && (e11.innerHTML = `
      :host{
        --uib-size: ${this.size}px;
        --uib-color: ${this.color};
        --uib-speed: ${this.speed}s;
        --uib-stroke: ${this.stroke}px;
      }
      ${i23}
    `);
  }
};
var s19 = { register: (e11 = "l-pinwheel") => {
  customElements.get(e11) || customElements.define(e11, class extends t24 {
  });
}, element: t24 };

// node_modules/ldrs/dist/elements/pulsar.js
var t25 = ':host{align-items:center;display:inline-flex;flex-shrink:0;height:var(--uib-size);justify-content:center;width:var(--uib-size)}:host([hidden]){display:none}.container{height:var(--uib-size);position:relative;width:var(--uib-size)}.container:after,.container:before{animation:pulse var(--uib-speed) ease-in-out infinite;background-color:var(--uib-color);border-radius:50%;content:"";height:100%;left:0;position:absolute;top:0;transform:scale(0);transition:background-color .3s ease;width:100%}.container:after{animation-delay:calc(var(--uib-speed)/-2)}@keyframes pulse{0%,to{opacity:1;transform:scale(0)}50%{opacity:.25;transform:scale(1)}}';
var s20 = class extends t {
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
    this.upgradeStoredProps(), this.applyDefaultProps({ size: 40, color: "black", speed: 1.75 }), this.template.innerHTML = `
      <div class="container"></div>
      <style>
        :host{
          --uib-size: ${this.size}px;
          --uib-color: ${this.color};
          --uib-speed: ${this.speed}s;
        }
        ${t25}
      </style>
    `, this.shadow.replaceChildren(this.template.content.cloneNode(true));
  }
  attributeChangedCallback() {
    const e11 = this.shadow.querySelector("style");
    e11 && (e11.innerHTML = `
      :host{
        --uib-size: ${this.size}px;
        --uib-color: ${this.color};
        --uib-speed: ${this.speed}s;
      }
      ${t25}
    `);
  }
};
var i24 = { register: (e11 = "l-pulsar") => {
  customElements.get(e11) || customElements.define(e11, class extends s20 {
  });
}, element: s20 };

// node_modules/ldrs/dist/elements/reuleaux.js
var s21 = ":host{align-items:center;display:inline-flex;flex-shrink:0;height:var(--uib-size);justify-content:center;width:var(--uib-size)}:host([hidden]){display:none}.container{height:var(--uib-size);overflow:visible;transform-origin:center;width:var(--uib-size)}.car{fill:none;stroke:var(--uib-color);stroke-dasharray:var(--uib-dash),var(--uib-gap);stroke-dashoffset:0;stroke-linecap:round;animation:travel var(--uib-speed) linear infinite;will-change:stroke-dasharray,stroke-dashoffset}.car,.track{transition:stroke .5s ease}.track{stroke:var(--uib-color);opacity:var(--uib-bg-opacity)}@keyframes travel{0%{stroke-dashoffset:0}to{stroke-dashoffset:100}}";
var i25 = class extends t {
  constructor() {
    super();
    __publicField(this, "_attributes", ["size", "color", "speed", "stroke", "stroke-length", "bg-opacity"]);
    __publicField(this, "size");
    __publicField(this, "color");
    __publicField(this, "speed");
    __publicField(this, "stroke");
    __publicField(this, "stroke-length");
    __publicField(this, "bg-opacity");
    __publicField(this, "d");
    this.storePropsToUpgrade(this._attributes), this.reflect(this._attributes), this.d = "M49.5,42.9c0-18.1-9.9-34-24.5-42.4C10.4,9,0.5,24.8,0.5,42.9c7.2,4.2,15.6,6.6,24.5,6.6S42.3,47.1,49.5,42.9z";
  }
  static get observedAttributes() {
    return ["size", "color", "speed", "stroke", "stroke-length", "bg-opacity"];
  }
  connectedCallback() {
    this.upgradeStoredProps(), this.applyDefaultProps({ size: 37, color: "black", stroke: 5, speed: 0.9, "stroke-length": 0.15, "bg-opacity": 0.1 });
    const e11 = t4(parseInt(this.size) / 50, this.d);
    this.template.innerHTML = `
      <svg
        class="container" 
        x="0px" 
        y="0px"
        viewBox="0 0 ${this.size} ${this.size}"
        height="${this.size}"
        width="${this.size}"
        preserveAspectRatio='xMidYMid meet'
      >
        <path
          class="track" 
          fill="none" 
          stroke-width="${this.stroke}" 
          pathlength="100"
          d="${e11}"
        />

        <path
          class="car" 
          fill="none" 
          stroke-width="${this.stroke}" 
          pathlength="100"
          d="${e11}"
        />
      </svg>
      <style>
        :host{
          --uib-size: ${this.size}px;
          --uib-color: ${this.color};
          --uib-speed: ${this.speed}s;
          --uib-dash: ${100 * parseFloat(this["stroke-length"])};
          --uib-gap: ${100 - 100 * parseFloat(this["stroke-length"])};
          --uib-bg-opacity: ${this["bg-opacity"]};
        }
        ${s21}
      </style>
    `, this.shadow.replaceChildren(this.template.content.cloneNode(true));
  }
  attributeChangedCallback() {
    const e11 = this.shadow.querySelector("style"), i40 = this.shadow.querySelector("svg"), r9 = this.shadow.querySelectorAll("path");
    e11 && (i40.setAttribute("height", this.size), i40.setAttribute("width", this.size), i40.setAttribute("viewBox", `0 0 ${this.size} ${this.size}`), r9.forEach((e12) => {
      e12.setAttribute("stroke-width", this.stroke), e12.setAttribute("d", t4(parseInt(this.size) / 50, this.d));
    }), e11.innerHTML = `
      :host{
        --uib-size: ${this.size}px;
        --uib-color: ${this.color};
        --uib-speed: ${this.speed}s;
        --uib-dash: ${100 * parseFloat(this["stroke-length"])};
        --uib-gap: ${100 - 100 * parseFloat(this["stroke-length"])};
        --uib-bg-opacity: ${this["bg-opacity"]};
      }
      ${s21}
    `);
  }
};
var r5 = { register: (t34 = "l-reuleaux") => {
  customElements.get(t34) || customElements.define(t34, class extends i25 {
  });
}, element: i25 };

// node_modules/ldrs/dist/elements/ring.js
var e6 = ":host{align-items:center;display:inline-flex;flex-shrink:0;height:var(--uib-size);justify-content:center;width:var(--uib-size)}:host([hidden]){display:none}.container{animation:rotate var(--uib-speed) linear infinite;height:var(--uib-size);overflow:visible;transform-origin:center;width:var(--uib-size);will-change:transform}.car{stroke:var(--uib-color);stroke-dasharray:1,200;stroke-dashoffset:0;stroke-linecap:round;animation:stretch calc(var(--uib-speed)*.75) ease-in-out infinite;will-change:stroke-dasharray,stroke-dashoffset}.car,.track{fill:none;transition:stroke .5s ease}.track{stroke:var(--uib-color);opacity:var(--uib-bg-opacity)}@keyframes rotate{to{transform:rotate(1turn)}}@keyframes stretch{0%{stroke-dasharray:0,150;stroke-dashoffset:0}50%{stroke-dasharray:75,150;stroke-dashoffset:-25}to{stroke-dashoffset:-99}}";
var s22 = class extends t {
  constructor() {
    super();
    __publicField(this, "_attributes", ["size", "color", "speed", "stroke", "bg-opacity"]);
    __publicField(this, "size");
    __publicField(this, "color");
    __publicField(this, "speed");
    __publicField(this, "stroke");
    __publicField(this, "bg-opacity");
    this.storePropsToUpgrade(this._attributes), this.reflect(this._attributes);
  }
  static get observedAttributes() {
    return ["size", "color", "stroke", "speed", "bg-opacity"];
  }
  connectedCallback() {
    this.upgradeStoredProps(), this.applyDefaultProps({ size: 40, color: "black", stroke: 5, speed: 2, "bg-opacity": 0 });
    const t34 = parseInt(this.size), s35 = parseInt(this.stroke), i40 = t34 / 2, r9 = Math.max(0, t34 / 2 - s35 / 2);
    this.template.innerHTML = `
      <svg
        class="container"
        viewBox="0 0 ${this.size} ${this.size}"
        height="${this.size}"
        width="${this.size}"
      >
        <circle 
          class="track"
          cx="${i40}" 
          cy="${i40}" 
          r="${r9}" 
          pathlength="100" 
          stroke-width="${this.stroke}px" 
          fill="none" 
        />
        <circle 
          class="car"
          cx="${i40}" 
          cy="${i40}" 
          r="${r9}" 
          pathlength="100" 
          stroke-width="${this.stroke}px" 
          fill="none" 
        />
      </svg>
      <style>
        :host{
          --uib-size: ${this.size}px;
          --uib-color: ${this.color};
          --uib-speed: ${this.speed}s;
          --uib-bg-opacity: ${this["bg-opacity"]};
        }
        ${e6}
      </style>
    `, this.shadow.replaceChildren(this.template.content.cloneNode(true));
  }
  attributeChangedCallback() {
    const t34 = this.shadow.querySelector("style"), s35 = this.shadow.querySelector("svg"), i40 = this.shadow.querySelectorAll("circle");
    if (!t34) return;
    const r9 = parseInt(this.size), o = parseInt(this.stroke), n4 = String(r9 / 2), a5 = String(Math.max(0, r9 / 2 - o / 2));
    s35.setAttribute("height", this.stroke), s35.setAttribute("width", this.stroke), s35.setAttribute("viewBox", `0 0 ${r9} ${r9}`), i40.forEach((t35) => {
      t35.setAttribute("cx", n4), t35.setAttribute("cy", n4), t35.setAttribute("r", a5), t35.setAttribute("stroke-width", this.stroke);
    }), t34.innerHTML = `
      :host{
        --uib-size: ${r9}px;
        --uib-color: ${this.color};
        --uib-speed: ${this.speed}s;
        --uib-bg-opacity: ${this["bg-opacity"]};
      }
      ${e6}
    `;
  }
};
var i26 = { register: (t34 = "l-ring") => {
  customElements.get(t34) || customElements.define(t34, class extends s22 {
  });
}, element: s22 };

// node_modules/ldrs/dist/elements/ring2.js
var e7 = ":host{align-items:center;display:inline-flex;flex-shrink:0;height:var(--uib-size);justify-content:center;width:var(--uib-size)}:host([hidden]){display:none}.container{animation:rotate var(--uib-speed) linear infinite;height:var(--uib-size);overflow:visible;transform-origin:center;width:var(--uib-size);will-change:transform}.car{stroke:var(--uib-color);stroke-dasharray:var(--uib-dash),var(--uib-gap);stroke-dashoffset:0;stroke-linecap:round}.car,.track{fill:none;transition:stroke .5s ease}.track{stroke:var(--uib-color);opacity:var(--uib-bg-opacity)}@keyframes rotate{to{transform:rotate(1turn)}}";
var s23 = class extends t {
  constructor() {
    super();
    __publicField(this, "_attributes", ["size", "color", "speed", "stroke", "stroke-length", "bg-opacity"]);
    __publicField(this, "size");
    __publicField(this, "color");
    __publicField(this, "speed");
    __publicField(this, "stroke");
    __publicField(this, "stroke-length");
    __publicField(this, "bg-opacity");
    this.storePropsToUpgrade(this._attributes), this.reflect(this._attributes);
  }
  static get observedAttributes() {
    return ["size", "color", "stroke", "stroke-length", "speed", "bg-opacity"];
  }
  connectedCallback() {
    this.upgradeStoredProps(), this.applyDefaultProps({ size: 40, color: "black", stroke: 5, "stroke-length": 0.25, speed: 0.8, "bg-opacity": 0.1 });
    const t34 = parseInt(this.size), s35 = parseInt(this.stroke), i40 = t34 / 2, r9 = Math.max(0, t34 / 2 - s35 / 2);
    this.template.innerHTML = `
      <svg
        class="container"
        viewBox="${i40} ${i40} ${this.size} ${this.size}"
        height="${this.size}"
        width="${this.size}"
      >
        <circle 
          class="track"
          cx="${this.size}" 
          cy="${this.size}" 
          r="${r9}" 
          stroke-width="${this.stroke}px" 
          fill="none" 
        />
        <circle 
          class="car"
          cx="${this.size}" 
          cy="${this.size}" 
          r="${r9}" 
          pathlength="100" 
          stroke-width="${this.stroke}px" 
          fill="none" 
        />
      </svg>
      <style>
        :host{
          --uib-size: ${this.size}px;
          --uib-color: ${this.color};
          --uib-speed: ${this.speed}s;
          --uib-dash: ${100 * parseFloat(this["stroke-length"])};
          --uib-gap: ${100 - 100 * parseFloat(this["stroke-length"])};
          --uib-bg-opacity: ${this["bg-opacity"]};
        }
        ${e7}
      </style>
    `, this.shadow.replaceChildren(this.template.content.cloneNode(true));
  }
  attributeChangedCallback() {
    const t34 = this.shadow.querySelector("style"), s35 = this.shadow.querySelector("svg"), i40 = this.shadow.querySelectorAll("circle");
    if (!t34) return;
    const r9 = parseInt(this.size), n4 = parseInt(this.stroke), o = r9 / 2, a5 = String(Math.max(0, r9 / 2 - n4 / 2));
    s35.setAttribute("height", this.size), s35.setAttribute("width", this.size), s35.setAttribute("viewBox", `${o} ${o} ${this.size} ${this.size}`), i40.forEach((t35) => {
      t35.setAttribute("cx", this.size), t35.setAttribute("cy", this.size), t35.setAttribute("r", a5), t35.setAttribute("stroke-width", this.stroke);
    }), t34.innerHTML = `
      :host{
        --uib-size: ${this.size}px;
        --uib-color: ${this.color};
        --uib-speed: ${this.speed}s;
        --uib-dash: ${100 * parseFloat(this["stroke-length"])};
        --uib-gap: ${100 - 100 * parseFloat(this["stroke-length"])};
        --uib-bg-opacity: ${this["bg-opacity"]};
      }
      ${e7}
    `;
  }
};
var i27 = { register: (t34 = "l-ring-2") => {
  customElements.get(t34) || customElements.define(t34, class extends s23 {
  });
}, element: s23 };

// node_modules/ldrs/dist/elements/ripples.js
var t26 = ':host{align-items:center;display:inline-flex;flex-shrink:0;height:var(--uib-size);justify-content:center;width:var(--uib-size)}:host([hidden]){display:none}.container{height:var(--uib-size);position:relative;width:var(--uib-size)}.container:after,.container:before,.dot:after,.dot:before{animation:pulse var(--uib-speed) linear infinite;background-color:var(--uib-color);border-radius:50%;content:"";height:100%;left:0;opacity:0;position:absolute;top:0;transform:scale(0);transition:background-color .3s ease;width:100%}.container:after{animation-delay:calc(var(--uib-speed)/-4)}.dot:before{animation-delay:calc(var(--uib-speed)*-.5)}.dot:after{animation-delay:calc(var(--uib-speed)*-.75)}@keyframes pulse{0%{opacity:1;transform:scale(0)}to{opacity:0;transform:scale(1)}}';
var s24 = class extends t {
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
    this.upgradeStoredProps(), this.applyDefaultProps({ size: 45, color: "black", speed: 2 }), this.template.innerHTML = `
      <div class="container">
        <div class="dot"></div>
      </div>
      <style>
        :host{
          --uib-size: ${this.size}px;
          --uib-color: ${this.color};
          --uib-speed: ${this.speed}s;
        }
        ${t26}
      </style>
    `, this.shadow.replaceChildren(this.template.content.cloneNode(true));
  }
  attributeChangedCallback() {
    const e11 = this.shadow.querySelector("style");
    e11 && (e11.innerHTML = `
      :host{
        --uib-size: ${this.size}px;
        --uib-color: ${this.color};
        --uib-speed: ${this.speed}s;
      }
      ${t26}
    `);
  }
};
var i28 = { register: (e11 = "l-ripples") => {
  customElements.get(e11) || customElements.define(e11, class extends s24 {
  });
}, element: s24 };

// node_modules/ldrs/dist/elements/spiral.js
var e8 = ':host{align-items:center;display:inline-flex;flex-shrink:0;height:var(--uib-size);justify-content:center;width:var(--uib-size)}:host([hidden]){display:none}.container{--uib-center:calc(var(--uib-size)/2 - var(--uib-size)/5/2);animation:rotate calc(var(--uib-speed)*3) linear infinite;height:var(--uib-size);position:relative;width:var(--uib-size)}.container,.dot{align-items:center;display:flex;justify-content:flex-start}.dot{height:100%;left:0;position:absolute;top:0;width:100%}.dot:before{animation:oscillate var(--uib-speed) ease-in-out infinite alternate;background-color:var(--uib-color);border-radius:50%;content:"";height:20%;transition:background-color .3s ease;width:20%}.dot:first-child:before{transform:translateX(var(--uib-center))}.dot:nth-child(2){transform:rotate(45deg)}.dot:nth-child(2):before{animation-delay:calc(var(--uib-speed)*-.125);transform:translateX(var(--uib-center))}.dot:nth-child(3){transform:rotate(90deg)}.dot:nth-child(3):before{animation-delay:calc(var(--uib-speed)*-.25);transform:translateX(var(--uib-center))}.dot:nth-child(4){transform:rotate(135deg)}.dot:nth-child(4):before{animation-delay:calc(var(--uib-speed)*-.375);transform:translateX(var(--uib-center))}.dot:nth-child(5){transform:rotate(180deg)}.dot:nth-child(5):before{animation-delay:calc(var(--uib-speed)*-.5);transform:translateX(var(--uib-center))}.dot:nth-child(6){transform:rotate(225deg)}.dot:nth-child(6):before{animation-delay:calc(var(--uib-speed)*-.625);transform:translateX(var(--uib-center))}.dot:nth-child(7){transform:rotate(270deg)}.dot:nth-child(7):before{animation-delay:calc(var(--uib-speed)*-.75);transform:translateX(var(--uib-center))}.dot:nth-child(8){transform:rotate(315deg)}.dot:nth-child(8):before{animation-delay:calc(var(--uib-speed)*-.875);transform:translateX(var(--uib-center))}@keyframes oscillate{0%{opacity:.25;transform:translateX(var(--uib-center)) scale(0)}to{opacity:1;transform:translateX(0) scale(1)}}@keyframes rotate{0%{transform:rotate(0deg)}to{transform:rotate(1turn)}}';
var a3 = class extends t {
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
    this.upgradeStoredProps(), this.applyDefaultProps({ size: 40, color: "black", speed: 0.9 }), this.template.innerHTML = `
      <div class="container">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
      <style>
        :host{
          --uib-size: ${this.size}px;
          --uib-color: ${this.color};
          --uib-speed: ${this.speed}s;
        }
        ${e8}
      </style>
    `, this.shadow.replaceChildren(this.template.content.cloneNode(true));
  }
  attributeChangedCallback() {
    const t34 = this.shadow.querySelector("style");
    t34 && (t34.innerHTML = `
      :host{
        --uib-size: ${this.size}px;
        --uib-color: ${this.color};
        --uib-speed: ${this.speed}s;
      }
      ${e8}
    `);
  }
};
var i29 = { register: (t34 = "l-spiral") => {
  customElements.get(t34) || customElements.define(t34, class extends a3 {
  });
}, element: a3 };

// node_modules/ldrs/dist/elements/square.js
var e9 = ":host{align-items:center;display:inline-flex;flex-shrink:0;height:var(--uib-size);justify-content:center;width:var(--uib-size)}:host([hidden]){display:none}.container{height:var(--uib-size);overflow:visible;transform-origin:center;width:var(--uib-size);will-change:transform}.car{stroke:var(--uib-color);stroke-dasharray:var(--uib-dash),var(--uib-gap);stroke-dashoffset:0;animation:travel var(--uib-speed) linear infinite;will-change:stroke-dasharray,stroke-dashoffset}.car,.track{fill:none;transition:stroke .5s ease}.track{stroke:var(--uib-color);opacity:var(--uib-bg-opacity)}@keyframes travel{0%{stroke-dashoffset:0}to{stroke-dashoffset:-100}}";
var s25 = class extends t {
  constructor() {
    super();
    __publicField(this, "_attributes", ["size", "color", "speed", "stroke", "stroke-length", "bg-opacity"]);
    __publicField(this, "size");
    __publicField(this, "color");
    __publicField(this, "speed");
    __publicField(this, "stroke");
    __publicField(this, "stroke-length");
    __publicField(this, "bg-opacity");
    this.storePropsToUpgrade(this._attributes), this.reflect(this._attributes);
  }
  static get observedAttributes() {
    return ["size", "color", "stroke", "stroke-length", "speed", "bg-opacity"];
  }
  connectedCallback() {
    this.upgradeStoredProps(), this.applyDefaultProps({ size: 35, color: "black", stroke: 5, "stroke-length": 0.25, speed: 1.2, "bg-opacity": 0.1 });
    const t34 = parseInt(this.size), s35 = parseInt(this.stroke), i40 = s35 / 2, r9 = Math.max(t34 - s35 / 2, 0);
    this.template.innerHTML = `
      <svg
        class="container"
        viewBox="0 0 ${this.size} ${this.size}"
        height="${this.size}"
        width="${this.size}"
      >
        <rect 
          class="track"
          x="${i40}" 
          y="${i40}" 
          fill="none" 
          stroke-width="${this.stroke}px" 
          width="${r9}" 
          height="${r9}"
        />
        <rect 
          class="car"
          x="${i40}" 
          y="${i40}" 
          fill="none" 
          stroke-width="${this.stroke}px" 
          width="${r9}" 
          height="${r9}"
          pathlength="100"
        />
      </svg>
      <style>
        :host{
          --uib-size: ${this.size}px;
          --uib-color: ${this.color};
          --uib-speed: ${this.speed}s;
          --uib-dash: ${100 * parseFloat(this["stroke-length"])};
          --uib-gap: ${100 - 100 * parseFloat(this["stroke-length"])};
          --uib-bg-opacity: ${this["bg-opacity"]};
        }
        ${e9}
      </style>
    `, this.shadow.replaceChildren(this.template.content.cloneNode(true));
  }
  attributeChangedCallback() {
    const t34 = this.shadow.querySelector("style"), s35 = this.shadow.querySelector("svg"), i40 = this.shadow.querySelectorAll("rect");
    if (!t34) return;
    const r9 = parseInt(this.size), n4 = parseInt(this.stroke), o = String(n4 / 2), a5 = String(Math.max(r9 - n4 / 2, 0));
    s35.setAttribute("height", this.size), s35.setAttribute("width", this.size), s35.setAttribute("viewBox", `0 0 ${this.size} ${this.size}`), i40.forEach((t35) => {
      t35.setAttribute("stroke-width", this.stroke), t35.setAttribute("width", a5), t35.setAttribute("height", a5), t35.setAttribute("x", o), t35.setAttribute("y", o);
    }), t34.innerHTML = `
      :host{
        --uib-size: ${this.size}px;
        --uib-color: ${this.color};
        --uib-speed: ${this.speed}s;
        --uib-dash: ${100 * parseFloat(this["stroke-length"])};
        --uib-gap: ${100 - 100 * parseFloat(this["stroke-length"])};
        --uib-bg-opacity: ${this["bg-opacity"]};
      }
      ${e9}
    `;
  }
};
var i30 = { register: (t34 = "l-square") => {
  customElements.get(t34) || customElements.define(t34, class extends s25 {
  });
}, element: s25 };

// node_modules/ldrs/dist/elements/squircle.js
var s26 = ":host{align-items:center;display:inline-flex;flex-shrink:0;height:var(--uib-size);justify-content:center;width:var(--uib-size)}:host([hidden]){display:none}.container{height:var(--uib-size);overflow:visible;transform-origin:center;width:var(--uib-size)}.car{fill:none;stroke:var(--uib-color);stroke-dasharray:var(--uib-dash),var(--uib-gap);stroke-dashoffset:0;stroke-linecap:round;animation:travel var(--uib-speed) linear infinite;will-change:stroke-dasharray,stroke-dashoffset}.car,.track{transition:stroke .5s ease}.track{stroke:var(--uib-color);opacity:var(--uib-bg-opacity)}@keyframes travel{0%{stroke-dashoffset:0}to{stroke-dashoffset:-100}}";
var i31 = class extends t {
  constructor() {
    super();
    __publicField(this, "_attributes", ["size", "color", "speed", "stroke", "stroke-length", "bg-opacity"]);
    __publicField(this, "size");
    __publicField(this, "color");
    __publicField(this, "speed");
    __publicField(this, "stroke");
    __publicField(this, "stroke-length");
    __publicField(this, "bg-opacity");
    __publicField(this, "d");
    this.storePropsToUpgrade(this._attributes), this.reflect(this._attributes), this.d = "M0.5,25C0.5,7.8,7.8,0.5,25,0.5S49.5,7.8,49.5,25S42.2,49.5,25,49.5S0.5,42.2,0.5,25";
  }
  static get observedAttributes() {
    return ["size", "color", "speed", "stroke", "stroke-length", "bg-opacity"];
  }
  connectedCallback() {
    this.upgradeStoredProps(), this.applyDefaultProps({ size: 37, color: "black", stroke: 5, "stroke-length": 0.15, speed: 0.9, "bg-opacity": 0.1 });
    const e11 = t4(parseInt(this.size) / 50, this.d);
    this.template.innerHTML = `
      <svg
        class="container" 
        x="0px" 
        y="0px"
        viewBox="0 0 ${this.size} ${this.size}"
        height="${this.size}"
        width="${this.size}"
        preserveAspectRatio='xMidYMid meet'
      >
        <path
          class="track" 
          fill="none" 
          stroke-width="${this.stroke}" 
          pathlength="100"
          d="${e11}"
        />

        <path
          class="car" 
          fill="none" 
          stroke-width="${this.stroke}" 
          pathlength="100"
          d="${e11}"
        />
      </svg>
      <style>
        :host{
          --uib-size: ${this.size}px;
          --uib-color: ${this.color};
          --uib-speed: ${this.speed}s;
          --uib-dash: ${100 * parseFloat(this["stroke-length"])};
          --uib-gap: ${100 - 100 * parseFloat(this["stroke-length"])};
          --uib-bg-opacity: ${this["bg-opacity"]};
        }
        ${s26}
      </style>
    `, this.shadow.replaceChildren(this.template.content.cloneNode(true));
  }
  attributeChangedCallback() {
    const e11 = this.shadow.querySelector("style"), i40 = this.shadow.querySelector("svg"), r9 = this.shadow.querySelectorAll("path");
    e11 && (i40.setAttribute("height", this.size), i40.setAttribute("width", this.size), i40.setAttribute("viewBox", `0 0 ${this.size} ${this.size}`), r9.forEach((e12) => {
      e12.setAttribute("stroke-width", this.stroke), e12.setAttribute("d", t4(parseInt(this.size) / 50, this.d));
    }), e11.innerHTML = `
      :host{
        --uib-size: ${this.size}px;
        --uib-color: ${this.color};
        --uib-speed: ${this.speed}s;
        --uib-dash: ${100 * parseFloat(this["stroke-length"])};
        --uib-gap: ${100 - 100 * parseFloat(this["stroke-length"])};
        --uib-bg-opacity: ${this["bg-opacity"]};
      }
      ${s26}
    `);
  }
};
var r6 = { register: (t34 = "l-squircle") => {
  customElements.get(t34) || customElements.define(t34, class extends i31 {
  });
}, element: i31 };

// node_modules/ldrs/dist/elements/superballs.js
var t27 = ':host{align-items:center;display:inline-flex;flex-shrink:0;height:var(--uib-size);justify-content:center;width:var(--uib-size)}:host([hidden]){display:none}.container{height:var(--uib-size);position:relative;width:var(--uib-size)}.container,.electron{align-items:center;display:flex;justify-content:center}.electron{height:100%;left:0;position:absolute;top:0;width:100%}.electron:before{background-color:var(--uib-color);border-radius:50%;content:"";flex-shrink:0;height:35%;transition:background-color .3s ease;width:35%}.electron:first-child{transform:rotate(45deg)}.electron:first-child:before{animation:orbit var(--uib-speed) linear calc(var(--uib-speed)*-.143) infinite}.electron:nth-child(2){transform:rotate(-45deg)}.electron:nth-child(2):before{animation:orbit var(--uib-speed) linear calc(var(--uib-speed)/-2) infinite}@keyframes orbit{0%{opacity:.65;transform:translate(calc(var(--uib-size)*.5)) scale(.73684)}5%{opacity:.58;transform:translate(calc(var(--uib-size)*.4)) scale(.684208)}10%{opacity:.51;transform:translate(calc(var(--uib-size)*.3)) scale(.631576)}15%{opacity:.44;transform:translate(calc(var(--uib-size)*.2)) scale(.578944)}20%{opacity:.37;transform:translate(calc(var(--uib-size)*.1)) scale(.526312)}25%{opacity:.3;transform:translate(0) scale(.47368)}30%{opacity:.37;transform:translate(calc(var(--uib-size)*-.1)) scale(.526312)}35%{opacity:.44;transform:translate(calc(var(--uib-size)*-.2)) scale(.578944)}40%{opacity:.51;transform:translate(calc(var(--uib-size)*-.3)) scale(.631576)}45%{opacity:.58;transform:translate(calc(var(--uib-size)*-.4)) scale(.684208)}50%{opacity:.65;transform:translate(calc(var(--uib-size)*-.5)) scale(.73684)}55%{opacity:.72;transform:translate(calc(var(--uib-size)*-.4)) scale(.789472)}60%{opacity:.79;transform:translate(calc(var(--uib-size)*-.3)) scale(.842104)}65%{opacity:.86;transform:translate(calc(var(--uib-size)*-.2)) scale(.894736)}70%{opacity:.93;transform:translate(calc(var(--uib-size)*-.1)) scale(.947368)}75%{opacity:1;transform:translate(0) scale(1)}80%{opacity:.93;transform:translate(calc(var(--uib-size)*.1)) scale(.947368)}85%{opacity:.86;transform:translate(calc(var(--uib-size)*.2)) scale(.894736)}90%{opacity:.79;transform:translate(calc(var(--uib-size)*.3)) scale(.842104)}95%{opacity:.72;transform:translate(calc(var(--uib-size)*.4)) scale(.789472)}to{opacity:.65;transform:translate(calc(var(--uib-size)*.5)) scale(.73684)}}';
var a4 = class extends t {
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
    this.upgradeStoredProps(), this.applyDefaultProps({ size: 40, color: "black", speed: 1.4 }), this.template.innerHTML = `
      <div class="container">
        <div class="electron"></div>
        <div class="electron"></div>
      </div>
      <style>
        :host{
          --uib-size: ${this.size}px;
          --uib-color: ${this.color};
          --uib-speed: ${this.speed}s;
        }
        ${t27}
      </style>
    `, this.shadow.replaceChildren(this.template.content.cloneNode(true));
  }
  attributeChangedCallback() {
    const e11 = this.shadow.querySelector("style");
    e11 && (e11.innerHTML = `
      :host{
        --uib-size: ${this.size}px;
        --uib-color: ${this.color};
        --uib-speed: ${this.speed}s;
      }
      ${t27}
    `);
  }
};
var s27 = { register: (e11 = "l-superballs") => {
  customElements.get(e11) || customElements.define(e11, class extends a4 {
  });
}, element: a4 };

// node_modules/ldrs/dist/elements/tailChase.js
var t28 = ':host{align-items:center;display:inline-flex;flex-shrink:0;height:var(--uib-size);justify-content:center;width:var(--uib-size)}:host([hidden]){display:none}.container{--dot-size:calc(var(--uib-size)*0.17);align-items:center;animation:smoothRotate calc(var(--uib-speed)*1.8) linear infinite;display:flex;height:var(--uib-size);justify-content:flex-start;position:relative;width:var(--uib-size)}.dot{align-items:flex-start;animation:rotate var(--uib-speed) ease-in-out infinite;display:flex;height:100%;justify-content:center;left:0;position:absolute;top:0;width:100%}.dot:before{background-color:var(--uib-color);border-radius:50%;content:"";height:var(--dot-size);transition:background-color .3s ease;width:var(--dot-size)}.dot:nth-child(2),.dot:nth-child(2):before{animation-delay:calc(var(--uib-speed)*-.835*.5)}.dot:nth-child(3),.dot:nth-child(3):before{animation-delay:calc(var(--uib-speed)*-.668*.5)}.dot:nth-child(4),.dot:nth-child(4):before{animation-delay:calc(var(--uib-speed)*-.501*.5)}.dot:nth-child(5),.dot:nth-child(5):before{animation-delay:calc(var(--uib-speed)*-.334*.5)}.dot:nth-child(6),.dot:nth-child(6):before{animation-delay:calc(var(--uib-speed)*-.167*.5)}@keyframes rotate{0%{transform:rotate(0deg)}65%,to{transform:rotate(1turn)}}@keyframes smoothRotate{0%{transform:rotate(0deg)}to{transform:rotate(1turn)}}';
var i32 = class extends t {
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
    this.upgradeStoredProps(), this.applyDefaultProps({ size: 40, color: "black", speed: 1.5 }), this.template.innerHTML = `
      <div class="container">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
      <style>
        :host{
          --uib-size: ${this.size}px;
          --uib-color: ${this.color};
          --uib-speed: ${this.speed}s;
        }
        ${t28}
      </style>
    `, this.shadow.replaceChildren(this.template.content.cloneNode(true));
  }
  attributeChangedCallback() {
    const e11 = this.shadow.querySelector("style");
    e11 && (e11.innerHTML = `
      :host{
        --uib-size: ${this.size}px;
        --uib-color: ${this.color};
        --uib-speed: ${this.speed}s;
      }
      ${t28}
    `);
  }
};
var s28 = { register: (e11 = "l-tail-chase") => {
  customElements.get(e11) || customElements.define(e11, class extends i32 {
  });
}, element: i32 };

// node_modules/ldrs/dist/elements/tailspin.js
var t29 = ":host{align-items:center;display:inline-flex;flex-shrink:0;height:var(--uib-size);justify-content:center;width:var(--uib-size)}:host([hidden]){display:none}.container{--mask-size:calc(var(--uib-size)/2 - var(--uib-stroke));align-items:center;animation:spin calc(var(--uib-speed)) linear infinite;background-image:conic-gradient(transparent 25%,var(--uib-color));border-radius:50%;display:flex;height:var(--uib-size);justify-content:flex-start;-webkit-mask:radial-gradient(circle var(--mask-size),transparent 99%,#000 100%);mask:radial-gradient(circle var(--mask-size),transparent 99%,#000 100%);position:relative;width:var(--uib-size)}@keyframes spin{0%{transform:rotate(0deg)}to{transform:rotate(1turn)}}";
var s29 = class extends t {
  constructor() {
    super();
    __publicField(this, "_attributes", ["size", "color", "speed", "stroke"]);
    __publicField(this, "size");
    __publicField(this, "color");
    __publicField(this, "speed");
    __publicField(this, "stroke");
    this.storePropsToUpgrade(this._attributes), this.reflect(this._attributes);
  }
  static get observedAttributes() {
    return ["size", "color", "speed", "stroke"];
  }
  connectedCallback() {
    this.upgradeStoredProps(), this.applyDefaultProps({ size: 40, color: "black", speed: 0.9, stroke: 5 }), this.template.innerHTML = `
      <div class="container"></div>
      <style>
        :host{
          --uib-size: ${this.size}px;
          --uib-color: ${this.color};
          --uib-speed: ${this.speed}s;
          --uib-stroke: ${this.stroke}px;
        }
        ${t29}
      </style>
    `, this.shadow.replaceChildren(this.template.content.cloneNode(true));
  }
  attributeChangedCallback() {
    const e11 = this.shadow.querySelector("style");
    e11 && (e11.innerHTML = `
      :host{
        --uib-size: ${this.size}px;
        --uib-color: ${this.color};
        --uib-speed: ${this.speed}s;
        --uib-stroke: ${this.stroke}px;
      }
      ${t29}
    `);
  }
};
var i33 = { register: (e11 = "l-tailspin") => {
  customElements.get(e11) || customElements.define(e11, class extends s29 {
  });
}, element: s29 };

// node_modules/ldrs/dist/elements/treadmill.js
var t30 = ':host{align-items:center;display:inline-flex;flex-shrink:0;height:calc(var(--uib-size)*.59);justify-content:center;width:var(--uib-size)}:host([hidden]){display:none}.container{--uib-cube-size:calc(var(--uib-size)*0.2);--uib-arc-1:-90deg;--uib-arc-2:90deg;align-items:flex-end;display:flex;height:calc(100% - var(--uib-cube-size)/2);justify-content:center;padding-bottom:calc(var(--uib-cube-size)/2);width:100%}.cube{--cube-container-height:calc(var(--uib-size)*0.8);align-items:center;animation:metronome var(--uib-speed) linear infinite;display:flex;height:var(--cube-container-height);transform:rotate(var(var(--uib-arc-1)));transform-origin:center bottom}.cube,.cube:after{width:var(--uib-cube-size)}.cube:after{animation:morph var(--uib-speed) linear infinite;background-color:var(--uib-color);border-radius:25%;content:"";display:block;height:var(--uib-cube-size);transform-origin:center left;transition:background-color .3s ease}@keyframes metronome{0%{transform:rotate(var(--uib-arc-1))}50%{transform:rotate(var(--uib-arc-2))}50.001%{transform:translateX(var(--cube-container-height)) rotate(var(--uib-arc-1))}to{transform:rotate(var(--uib-arc-1))}}@keyframes morph{15%{transform:scaleX(1.2) scaleY(.8)}30%,50%{transform:scaleX(1)}55%{transform:scaleX(.8) scaleY(1.2)}65%,80%{transform:scaleX(1)}90%,95%{transform:scaleX(.65) scaleY(1.3)}}';
var r7 = class extends t {
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
    this.upgradeStoredProps(), this.applyDefaultProps({ size: 70, color: "black", speed: 1.25 }), this.template.innerHTML = `
    <div class="container"><div class="cube"></div></div>
      <style>
        :host{
          --uib-size: ${this.size}px;
          --uib-color: ${this.color};
          --uib-speed: ${this.speed}s;
        }
        ${t30}
      </style>
    `, this.shadow.replaceChildren(this.template.content.cloneNode(true));
  }
  attributeChangedCallback() {
    const e11 = this.shadow.querySelector("style");
    e11 && (e11.innerHTML = `
      :host{
        --uib-size: ${this.size}px;
        --uib-color: ${this.color};
        --uib-speed: ${this.speed}s;
      }
      ${t30}
    `);
  }
};
var i34 = { register: (e11 = "l-treadmill") => {
  customElements.get(e11) || customElements.define(e11, class extends r7 {
  });
}, element: r7 };

// node_modules/ldrs/dist/elements/trefoil.js
var s30 = ":host{align-items:center;display:inline-flex;flex-shrink:0;height:var(--uib-size);justify-content:center;width:var(--uib-size)}:host([hidden]){display:none}.container{height:var(--uib-size);overflow:visible;transform-origin:center;width:var(--uib-size)}.car{fill:none;stroke:var(--uib-color);stroke-dasharray:var(--uib-dash),var(--uib-gap);stroke-dashoffset:0;stroke-linecap:round;animation:travel var(--uib-speed) linear infinite;will-change:stroke-dasharray,stroke-dashoffset}.car,.track{transition:stroke .5s ease}.track{stroke:var(--uib-color);opacity:var(--uib-bg-opacity)}@keyframes travel{0%{stroke-dashoffset:0}to{stroke-dashoffset:-100}}";
var i35 = class extends t {
  constructor() {
    super();
    __publicField(this, "_attributes", ["size", "color", "speed", "stroke", "stroke-length", "bg-opacity"]);
    __publicField(this, "size");
    __publicField(this, "color");
    __publicField(this, "speed");
    __publicField(this, "stroke");
    __publicField(this, "stroke-length");
    __publicField(this, "bg-opacity");
    __publicField(this, "d");
    this.storePropsToUpgrade(this._attributes), this.reflect(this._attributes), this.d = "M37.2,23.4c0,9.1-4.9,17-12.3,21.2c-3.6,2.1-7.8,3.3-12.3,3.3c-4.5,0-8.6-1.2-12.2-3.3c0-9.1,4.9-16.9,12.3-21.2c3.6-2.1,7.8-3.3,12.2-3.3S33.6,21.3,37.2,23.4c7.3,4.2,12.2,12.1,12.3,21.2c-3.6,2.1-7.8,3.3-12.2,3.3c-4.5,0-8.6-1.2-12.3-3.3c-7.3-4.2-12.2-12.1-12.2-21.2c0-9.1,4.9-17,12.2-21.2C32.3,6.4,37.2,14.3,37.2,23.4z";
  }
  static get observedAttributes() {
    return ["size", "color", "speed", "stroke", "stroke-length", "bg-opacity"];
  }
  connectedCallback() {
    this.upgradeStoredProps(), this.applyDefaultProps({ size: 40, color: "black", stroke: 4, "stroke-length": 0.15, speed: 1.4, "bg-opacity": 0.1 });
    const e11 = t4(parseInt(this.size) / 50, this.d);
    this.template.innerHTML = `
      <svg
        class="container" 
        x="0px" 
        y="0px"
        viewBox="0 0 ${this.size} ${this.size}"
        height="${this.size}"
        width="${this.size}"
        preserveAspectRatio='xMidYMid meet'
      >
        <path
          class="track" 
          fill="none" 
          stroke-width="${this.stroke}" 
          pathlength="100"
          d="${e11}"
        />

        <path
          class="car" 
          fill="none" 
          stroke-width="${this.stroke}" 
          pathlength="100"
          d="${e11}"
        />
      </svg>
      <style>
        :host{
          --uib-size: ${this.size}px;
          --uib-color: ${this.color};
          --uib-speed: ${this.speed}s;
          --uib-dash: ${100 * parseFloat(this["stroke-length"])};
          --uib-gap: ${100 - 100 * parseFloat(this["stroke-length"])};
          --uib-bg-opacity: ${this["bg-opacity"]};
        }
        ${s30}
      </style>
    `, this.shadow.replaceChildren(this.template.content.cloneNode(true));
  }
  attributeChangedCallback() {
    const e11 = this.shadow.querySelector("style"), i40 = this.shadow.querySelector("svg"), r9 = this.shadow.querySelectorAll("path");
    e11 && (i40.setAttribute("height", this.size), i40.setAttribute("width", this.size), i40.setAttribute("viewBox", `0 0 ${this.size} ${this.size}`), r9.forEach((e12) => {
      e12.setAttribute("stroke-width", this.stroke), e12.setAttribute("d", t4(parseInt(this.size) / 50, this.d));
    }), e11.innerHTML = `
      :host{
        --uib-size: ${this.size}px;
        --uib-color: ${this.color};
        --uib-speed: ${this.speed}s;
        --uib-dash: ${100 * parseFloat(this["stroke-length"])};
        --uib-gap: ${100 - 100 * parseFloat(this["stroke-length"])};
        --uib-bg-opacity: ${this["bg-opacity"]};
      }
      ${s30}
    `);
  }
};
var r8 = { register: (t34 = "l-trefoil") => {
  customElements.get(t34) || customElements.define(t34, class extends i35 {
  });
}, element: i35 };

// node_modules/ldrs/dist/elements/trio.js
var e10 = ':host{align-items:center;display:inline-flex;flex-shrink:0;height:var(--uib-size);justify-content:center;width:var(--uib-size)}:host([hidden]){display:none}.container{--uib-dot-size:25%;animation:spin var(--uib-speed) infinite linear;display:inline-block;height:var(--uib-size);position:relative;width:var(--uib-size)}.dot{height:100%;left:calc(50% - var(--uib-dot-size)/2);width:var(--uib-dot-size)}.dot,.dot:after{position:absolute}.dot:after{background-color:var(--uib-color);border-radius:50%;content:"";height:0;left:0;padding-bottom:100%;top:0;transition:background-color .3s ease;width:100%}.dot:first-child{transform:rotate(120deg)}.dot:first-child:after{animation:wobble var(--uib-speed) infinite ease-in-out}.dot:nth-child(2){transform:rotate(-120deg)}.dot:nth-child(2):after,.dot:nth-child(3):after{animation:wobble var(--uib-speed) infinite ease-in-out}@keyframes spin{0%{transform:rotate(0deg)}to{transform:rotate(1turn)}}@keyframes wobble{0%,to{transform:translateY(0)}50%{transform:translateY(65%)}}';
var i36 = class extends t {
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
    this.upgradeStoredProps(), this.applyDefaultProps({ size: 40, color: "black", speed: 1.3 }), this.template.innerHTML = `
      <div class="container">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
      <style>
        :host{
          --uib-size: ${this.size}px;
          --uib-color: ${this.color};
          --uib-speed: ${this.speed}s;
        }
        ${e10}
      </style>
    `, this.shadow.replaceChildren(this.template.content.cloneNode(true));
  }
  attributeChangedCallback() {
    const t34 = this.shadow.querySelector("style");
    t34 && (t34.innerHTML = `
      :host{
        --uib-size: ${this.size}px;
        --uib-color: ${this.color};
        --uib-speed: ${this.speed}s;
      }
      ${e10}
    `);
  }
};
var s31 = { register: (t34 = "l-trio") => {
  customElements.get(t34) || customElements.define(t34, class extends i36 {
  });
}, element: i36 };

// node_modules/ldrs/dist/elements/waveform.js
var i37 = ":host{align-items:center;display:inline-flex;flex-shrink:0;height:calc(var(--uib-size)*.9);justify-content:center;width:var(--uib-size)}:host([hidden]){display:none}.container{align-items:center;display:flex;height:calc(var(--uib-size)*.9);justify-content:space-between;width:var(--uib-size)}.bar{background-color:var(--uib-color);height:100%;transition:background-color .3s ease;width:var(--uib-stroke)}.bar:first-child{animation:grow var(--uib-speed) ease-in-out calc(var(--uib-speed)*-.45) infinite}.bar:nth-child(2){animation:grow var(--uib-speed) ease-in-out calc(var(--uib-speed)*-.3) infinite}.bar:nth-child(3){animation:grow var(--uib-speed) ease-in-out calc(var(--uib-speed)*-.15) infinite}.bar:nth-child(4){animation:grow var(--uib-speed) ease-in-out infinite}@keyframes grow{0%,to{transform:scaleY(.3)}50%{transform:scaleY(1)}}";
var s32 = class extends t {
  constructor() {
    super();
    __publicField(this, "_attributes", ["size", "color", "speed", "stroke"]);
    __publicField(this, "size");
    __publicField(this, "color");
    __publicField(this, "speed");
    __publicField(this, "stroke");
    this.storePropsToUpgrade(this._attributes), this.reflect(this._attributes);
  }
  static get observedAttributes() {
    return ["size", "color", "speed", "stroke"];
  }
  connectedCallback() {
    this.upgradeStoredProps(), this.applyDefaultProps({ size: 35, color: "black", speed: 1, stroke: 3.5 }), this.template.innerHTML = `
      <div class="container">
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
      </div>
      <style>
        :host{
          --uib-size: ${this.size}px;
          --uib-color: ${this.color};
          --uib-speed: ${this.speed}s;
          --uib-stroke: ${this.stroke}px;
        }
        ${i37}
      </style>
    `, this.shadow.replaceChildren(this.template.content.cloneNode(true));
  }
  attributeChangedCallback() {
    const e11 = this.shadow.querySelector("style");
    e11 && (e11.innerHTML = `
      :host{
        --uib-size: ${this.size}px;
        --uib-color: ${this.color};
        --uib-speed: ${this.speed}s;
        --uib-stroke: ${this.stroke}px;
      }
      ${i37}
    `);
  }
};
var t31 = { register: (e11 = "l-waveform") => {
  customElements.get(e11) || customElements.define(e11, class extends s32 {
  });
}, element: s32 };

// node_modules/ldrs/dist/elements/wobble.js
var t32 = ':host{align-items:center;display:inline-flex;flex-shrink:0;height:calc(var(--uib-size)*.25);justify-content:center;width:var(--uib-size)}:host([hidden]){display:none}.container{align-items:center;display:flex;height:100%;justify-content:flex-start;position:relative;width:100%}.container:before{animation:wobble var(--uib-speed) calc(var(--uib-speed)*-.1) ease-in-out infinite;background-color:var(--uib-color);border-radius:50%;content:"";height:calc(var(--uib-size)*.25);transform:translateY(calc(var(--uib-size)*-.4));transition:background-color .3s ease;width:25%}@keyframes wobble{0%,to{transform:translateX(0)}50%{transform:translateX(calc(var(--uib-size)*.75))}}';
var s33 = class extends t {
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
    this.upgradeStoredProps(), this.applyDefaultProps({ size: 45, color: "black", speed: 0.9 }), this.template.innerHTML = `
      <div class="container"></div>
      <style>
        :host{
          --uib-size: ${this.size}px;
          --uib-color: ${this.color};
          --uib-speed: ${this.speed}s;
        }
        ${t32}
      </style>
    `, this.shadow.replaceChildren(this.template.content.cloneNode(true));
  }
  attributeChangedCallback() {
    const e11 = this.shadow.querySelector("style");
    e11 && (e11.innerHTML = `
      :host{
        --uib-size: ${this.size}px;
        --uib-color: ${this.color};
        --uib-speed: ${this.speed}s;
      }
      ${t32}
    `);
  }
};
var i38 = { register: (e11 = "l-wobble") => {
  customElements.get(e11) || customElements.define(e11, class extends s33 {
  });
}, element: s33 };

// node_modules/ldrs/dist/elements/zoomies.js
var t33 = ':host{align-items:center;display:inline-flex;flex-shrink:0;height:var(--uib-stroke);justify-content:center;width:var(--uib-size)}:host([hidden]){display:none}.container{align-items:center;border-radius:calc(var(--uib-stroke)/2);display:flex;height:var(--uib-stroke);justify-content:center;overflow:hidden;position:relative;transform:translateZ(0);width:var(--uib-size)}.container:before{left:0;opacity:var(--uib-bg-opacity);position:absolute;top:0}.container:after,.container:before{background-color:var(--uib-color);content:"";height:100%;transition:background-color .3s ease;width:100%}.container:after{animation:zoom var(--uib-speed) ease-in-out infinite;border-radius:calc(var(--uib-stroke)/2);transform:translateX(-100%)}@keyframes zoom{0%{transform:translateX(-100%)}to{transform:translateX(100%)}}';
var s34 = class extends t {
  constructor() {
    super();
    __publicField(this, "_attributes", ["size", "color", "speed", "stroke", "bg-opacity"]);
    __publicField(this, "size");
    __publicField(this, "color");
    __publicField(this, "speed");
    __publicField(this, "stroke");
    __publicField(this, "bg-opacity");
    this.storePropsToUpgrade(this._attributes), this.reflect(this._attributes);
  }
  static get observedAttributes() {
    return ["size", "color", "speed", "stroke", "bg-opacity"];
  }
  connectedCallback() {
    this.upgradeStoredProps(), this.applyDefaultProps({ size: 80, color: "black", speed: 1.4, stroke: 5, "bg-opacity": 0.1 }), this.template.innerHTML = `
      <div class="container"></div>
      <style>
        :host{
          --uib-size: ${this.size}px;
          --uib-color: ${this.color};
          --uib-speed: ${this.speed}s;
          --uib-stroke: ${this.stroke}px;
          --uib-bg-opacity: ${this["bg-opacity"]};
        }
        ${t33}
      </style>
    `, this.shadow.replaceChildren(this.template.content.cloneNode(true));
  }
  attributeChangedCallback() {
    const e11 = this.shadow.querySelector("style");
    e11 && (e11.innerHTML = `
      :host{
        --uib-size: ${this.size}px;
        --uib-color: ${this.color};
        --uib-speed: ${this.speed}s;
        --uib-stroke: ${this.stroke}px;
        --uib-bg-opacity: ${this["bg-opacity"]};
      }
      ${t33}
    `);
  }
};
var i39 = { register: (e11 = "l-zoomies") => {
  customElements.get(e11) || customElements.define(e11, class extends s34 {
  });
}, element: s34 };
export {
  n as bouncy,
  i3 as bouncyArc,
  r2 as cardio,
  s2 as chaoticOrbit,
  i5 as dotPulse,
  s4 as dotSpinner,
  s5 as dotStream,
  s6 as dotWave,
  a as grid,
  s7 as hatch,
  t11 as helix,
  a2 as hourglass,
  r4 as infinity,
  s9 as jelly,
  s10 as jellyTriangle,
  i14 as leapfrog,
  n2 as lineSpinner,
  i16 as lineWobble,
  s13 as metronome,
  s14 as mirage,
  s15 as miyagi,
  s16 as momentum,
  n3 as newtonsCradle,
  s17 as orbit,
  i22 as ping,
  s19 as pinwheel,
  i24 as pulsar,
  i as quantum,
  r5 as reuleaux,
  i26 as ring,
  i27 as ring2,
  i28 as ripples,
  i29 as spiral,
  i30 as square,
  r6 as squircle,
  s27 as superballs,
  s28 as tailChase,
  i33 as tailspin,
  i34 as treadmill,
  r8 as trefoil,
  s31 as trio,
  t31 as waveform,
  i38 as wobble,
  i39 as zoomies
};
//# sourceMappingURL=ldrs.js.map
