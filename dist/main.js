var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  1 ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// C:/Users/jmarcum/AppData/Local/deno/npm/registry.npmjs.org/@clerk/clerk-js/5.127.2/dist/clerk.headless.js
var require_clerk_headless = __commonJS({
  "C:/Users/jmarcum/AppData/Local/deno/npm/registry.npmjs.org/@clerk/clerk-js/5.127.2/dist/clerk.headless.js"(exports, module) {
    !function(e, t) {
      if ("object" == typeof exports && "object" == typeof module) module.exports = t();
      else if ("function" == typeof define && define.amd) define([], t);
      else {
        var i = t();
        for (var n in i) ("object" == typeof exports ? exports : e)[n] = i[n];
      }
    }(globalThis, () => (() => {
      var e = {
        8933: function(e2, t2, i2) {
          "use strict";
          let n, r, s;
          function a() {
            return "undefined" != typeof window;
          }
          i2.r(t2), i2.d(t2, {
            EmailLinkErrorCode: () => I,
            EmailLinkErrorCodeStatus: () => P,
            ClerkRuntimeError: () => T,
            isEmailLinkError: () => F,
            Clerk: () => rQ,
            isClerkAPIResponseError: () => S,
            EmailLinkError: () => U,
            isClerkRuntimeError: () => O,
            ClerkAPIResponseError: () => k,
            isMetamaskError: () => M,
            isUserLockedError: () => N,
            isKnownError: () => z
          }), i2(4096);
          let o = RegExp("bot|spider|crawl|APIs-Google|AdsBot|Googlebot|mediapartners|Google Favicon|FeedFetcher|Google-Read-Aloud|DuplexWeb-Google|googleweblight|bing|yandex|baidu|duckduck|yahoo|ecosia|ia_archiver|facebook|instagram|pinterest|reddit|slack|twitter|whatsapp|youtube|semrush", "i");
          function l() {
            var e10;
            let t10 = a() ? window?.navigator : null;
            return !!t10 && !((e10 = t10?.userAgent) && o.test(e10)) && !t10?.webdriver;
          }
          function c() {
            let e10 = a() ? window?.navigator : null;
            if (!e10) return false;
            let t10 = e10?.onLine;
            return e10?.connection?.rtt !== 0 && e10?.connection?.downlink !== 0 && t10;
          }
          function d() {
            return c() && l();
          }
          let h = (e10, t10, i10, n10, r2) => {
            let { notify: s2 } = r2 || {}, a2 = e10.get(i10);
            a2 || (a2 = [], e10.set(i10, a2)), a2.push(n10), s2 && t10.has(i10) && n10(t10.get(i10));
          }, u = (e10, t10, i10) => (e10.get(t10) || []).map((e11) => e11(i10)), p = (e10, t10, i10) => {
            let n10 = e10.get(t10);
            n10 && (i10 ? n10.splice(n10.indexOf(i10) >>> 0, 1) : e10.set(t10, []));
          }, f = () => {
            let e10 = /* @__PURE__ */ new Map(), t10 = /* @__PURE__ */ new Map(), i10 = /* @__PURE__ */ new Map();
            return {
              on: (...i11) => h(e10, t10, ...i11),
              prioritizedOn: (...e11) => h(i10, t10, ...e11),
              emit: (n10, r2) => {
                t10.set(n10, r2), u(i10, n10, r2), u(e10, n10, r2);
              },
              off: (...t11) => p(e10, ...t11),
              prioritizedOff: (...e11) => p(i10, ...e11),
              internal: {
                retrieveListeners: (t11) => e10.get(t11) || []
              }
            };
          }, m = "status", g = /* @__PURE__ */ new Set();
          function _(e10) {
            return function(t10) {
              let i10 = t10 ?? this;
              if (!i10) throw TypeError(`${e10.kind || e10.name} type guard requires an error object`);
              return !!e10.kind && "object" == typeof i10 && null !== i10 && "constructor" in i10 && i10.constructor?.kind === e10.kind || i10 instanceof e10;
            };
          }
          var y, b, w = class {
            static kind = "ClerkApiError";
            code;
            message;
            longMessage;
            meta;
            constructor(e10) {
              let t10 = {
                code: e10.code,
                message: e10.message,
                longMessage: e10.long_message,
                meta: {
                  paramName: e10.meta?.param_name,
                  sessionId: e10.meta?.session_id,
                  emailAddresses: e10.meta?.email_addresses,
                  identifiers: e10.meta?.identifiers,
                  zxcvbn: e10.meta?.zxcvbn,
                  plan: e10.meta?.plan,
                  isPlanUpgradePossible: e10.meta?.is_plan_upgrade_possible
                }
              };
              this.code = t10.code, this.message = t10.message, this.longMessage = t10.longMessage, this.meta = t10.meta;
            }
          };
          _(w);
          var v = class e10 extends Error {
            static kind = "ClerkError";
            clerkError = true;
            code;
            longMessage;
            docsUrl;
            cause;
            get name() {
              return this.constructor.name;
            }
            constructor(t10) {
              super(new.target.formatMessage(new.target.kind, t10.message, t10.code, t10.docsUrl), {
                cause: t10.cause
              }), Object.setPrototypeOf(this, e10.prototype), this.code = t10.code, this.docsUrl = t10.docsUrl, this.longMessage = t10.longMessage, this.cause = t10.cause;
            }
            toString() {
              return `[${this.name}]
Message:${this.message}`;
            }
            static formatMessage(e11, t10, i10, n10) {
              let r2 = "Clerk:", s2 = RegExp(r2.replace(" ", "\\s*"), "i");
              return t10 = t10.replace(s2, ""), t10 = `${r2} ${t10.trim()}

(code="${i10}")

`, n10 && (t10 += `

Docs: ${n10}`), t10;
            }
          }, k = class e10 extends v {
            static kind = "ClerkAPIResponseError";
            status;
            clerkTraceId;
            retryAfter;
            errors;
            constructor(t10, i10) {
              let { data: n10, status: r2, clerkTraceId: s2, retryAfter: a2 } = i10;
              super({
                ...i10,
                message: t10,
                code: "api_response_error"
              }), Object.setPrototypeOf(this, e10.prototype), this.status = r2, this.clerkTraceId = s2, this.retryAfter = a2, this.errors = (n10 || []).map((e11) => new w(e11));
            }
            toString() {
              let e11 = `[${this.name}]
Message:${this.message}
Status:${this.status}
Serialized errors: ${this.errors.map((e12) => JSON.stringify(e12))}`;
              return this.clerkTraceId && (e11 += `
Clerk Trace ID: ${this.clerkTraceId}`), e11;
            }
            static formatMessage(e11, t10, i10, n10) {
              return t10;
            }
          };
          let S = _(k);
          var C = class e10 extends k {
            static kind = "MissingExpiredTokenError";
            static ERROR_CODE = "missing_expired_token";
            static STATUS = 422;
            static is(t10) {
              return S(t10) && t10.status === e10.STATUS && t10.errors.length > 0 && t10.errors[0].code === e10.ERROR_CODE;
            }
          };
          let A = Object.freeze({
            InvalidProxyUrlErrorMessage: "The proxyUrl passed to Clerk is invalid. The expected value for proxyUrl is an absolute URL or a relative path with a leading '/'. (key={{url}})",
            InvalidPublishableKeyErrorMessage: "The publishableKey passed to Clerk is invalid. You can get your Publishable key at https://dashboard.clerk.com/last-active?path=api-keys. (key={{key}})",
            MissingPublishableKeyErrorMessage: "Missing publishableKey. You can get your key at https://dashboard.clerk.com/last-active?path=api-keys.",
            MissingSecretKeyErrorMessage: "Missing secretKey. You can get your key at https://dashboard.clerk.com/last-active?path=api-keys.",
            MissingClerkProvider: "{{source}} can only be used within the <ClerkProvider /> component. Learn more: https://clerk.com/docs/components/clerk-provider"
          });
          var U = class e10 extends Error {
            code;
            constructor(t10) {
              super(t10), this.code = t10, this.name = "EmailLinkError", Object.setPrototypeOf(this, e10.prototype);
            }
          };
          let I = {
            Expired: "expired",
            Failed: "failed",
            ClientMismatch: "client_mismatch"
          }, P = {
            Expired: "expired",
            Failed: "failed",
            ClientMismatch: "client_mismatch"
          };
          var T = class e10 extends v {
            static kind = "ClerkRuntimeError";
            clerkRuntimeError = true;
            constructor(t10, i10) {
              super({
                ...i10,
                message: t10
              }), Object.setPrototypeOf(this, e10.prototype);
            }
          };
          let O = _(T);
          var E = class extends T {
            code;
            constructor(e10, { code: t10 }) {
              super(e10, {
                code: t10
              }), this.code = t10;
            }
          };
          function x(e10) {
            return [
              "captcha_invalid",
              "captcha_not_enabled",
              "captcha_missing_token"
            ].includes(e10.errors[0].code);
          }
          function R(e10) {
            let t10 = e10?.status;
            return !!t10 && t10 >= 400 && t10 < 500;
          }
          function z(e10) {
            return S(e10) || M(e10) || O(e10);
          }
          function M(e10) {
            return "code" in e10 && [
              4001,
              32602,
              32603
            ].includes(e10.code) && "message" in e10;
          }
          function N(e10) {
            return S(e10) && e10.errors?.[0]?.code === "user_locked";
          }
          function F(e10) {
            return "EmailLinkError" === e10.name;
          }
          function D(e10) {
            for (let [t10, i10] of Object.entries({
              isClerkAPIResponseError: S,
              isClerkRuntimeError: O
            })) Object.assign(e10, {
              [t10]: i10
            });
            return e10;
          }
          let W = [
            ".lcl.dev",
            ".lclstage.dev",
            ".lclclerk.com"
          ], L = [
            ".accounts.dev",
            ".accountsstage.dev",
            ".accounts.lclclerk.com"
          ], $ = [
            ".lcl.dev",
            ".stg.dev",
            ".lclstage.dev",
            ".stgstage.dev",
            ".dev.lclclerk.com",
            ".stg.lclclerk.com",
            ".accounts.lclclerk.com",
            "accountsstage.dev",
            "accounts.dev"
          ], j = (e10) => "undefined" != typeof atob && "function" == typeof atob ? atob(e10) : "undefined" != typeof global && global.Buffer ? new global.Buffer(e10, "base64").toString() : e10, J = "pk_live_";
          function K(e10) {
            if (!e10.endsWith("$")) return false;
            let t10 = e10.slice(0, -1);
            return !t10.includes("$") && t10.includes(".");
          }
          function B(e10, t10 = {}) {
            let i10;
            if (!(e10 = e10 || "") || !V(e10)) {
              if (t10.fatal && !e10) throw Error("Publishable key is missing. Ensure that your publishable key is correctly configured. Double-check your environment configuration for your keys, or access them here: https://dashboard.clerk.com/last-active?path=api-keys");
              if (t10.fatal && !V(e10)) throw Error("Publishable key not valid.");
              return null;
            }
            let n10 = e10.startsWith(J) ? "production" : "development";
            try {
              i10 = j(e10.split("_")[2]);
            } catch {
              if (t10.fatal) throw Error("Publishable key not valid: Failed to decode key.");
              return null;
            }
            if (!K(i10)) {
              if (t10.fatal) throw Error("Publishable key not valid: Decoded key has invalid format.");
              return null;
            }
            let r2 = i10.slice(0, -1);
            return t10.proxyUrl ? r2 = t10.proxyUrl : "development" !== n10 && t10.domain && t10.isSatellite && (r2 = `clerk.${t10.domain}`), {
              instanceType: n10,
              frontendApi: r2
            };
          }
          function V(e10 = "") {
            try {
              if (!(e10.startsWith(J) || e10.startsWith("pk_test_"))) return false;
              let t10 = e10.split("_");
              if (3 !== t10.length) return false;
              let i10 = t10[2];
              if (!i10) return false;
              return K(j(i10));
            } catch {
              return false;
            }
          }
          async function q(e10, t10 = globalThis.crypto.subtle) {
            var i10;
            let n10 = new TextEncoder().encode(e10);
            return (i10 = String.fromCharCode(...new Uint8Array(await t10.digest("sha-1", n10))), "undefined" != typeof btoa && "function" == typeof btoa ? btoa(i10) : "undefined" != typeof global && global.Buffer ? new global.Buffer(i10).toString("base64") : i10).replace(/\+/gi, "-").replace(/\//gi, "_").substring(0, 8);
          }
          let H = (e10, t10) => `${e10}_${t10}`, G = /* @__PURE__ */ new Set(), Z = (e10) => {
            G.has(e10) || (G.add(e10), console.warn(e10));
          }, Y = "__clerk_netlify_cache_bust";
          function Q(e10) {
            return /^http(s)?:\/\//.test(e10 || "");
          }
          function X(e10) {
            return e10.startsWith("/");
          }
          function ee(e10) {
            return e10 ? e10.replace(/([-_][a-z])/g, (e11) => e11.toUpperCase().replace(/-|_/, "")) : "";
          }
          function et(e10) {
            return e10 ? e10.replace(/[A-Z]/g, (e11) => `_${e11.toLowerCase()}`) : "";
          }
          let ei = (e10) => {
            let t10 = (i10) => {
              if (!i10) return i10;
              if (Array.isArray(i10)) return i10.map((e11) => "object" == typeof e11 || Array.isArray(e11) ? t10(e11) : e11);
              let n10 = {
                ...i10
              };
              for (let i11 of Object.keys(n10)) {
                let r2 = e10(i11.toString());
                r2 !== i11 && (n10[r2] = n10[i11], delete n10[i11]), "object" == typeof n10[r2] && (n10[r2] = t10(n10[r2]));
              }
              return n10;
            };
            return t10;
          }, en = ei(et), er = ei(ee);
          function es(e10) {
            if ("boolean" == typeof e10) return e10;
            if (null == e10) return false;
            if ("string" == typeof e10) {
              if ("true" === e10.toLowerCase()) return true;
              if ("false" === e10.toLowerCase()) return false;
            }
            let t10 = parseInt(e10, 10);
            return !isNaN(t10) && t10 > 0;
          }
          var ea = class {
            #e;
            #t = 864e5;
            constructor(e10) {
              this.#e = e10;
            }
            isEventThrottled(e10) {
              let t10 = Date.now(), i10 = this.#i(e10), n10 = this.#e.getItem(i10);
              return !!n10 && !(t10 - n10 > this.#t) || (this.#e.setItem(i10, t10), false);
            }
            #i(e10) {
              let { sk: t10, pk: i10, payload: n10, ...r2 } = e10, s2 = {
                ...n10,
                ...r2
              };
              return JSON.stringify(Object.keys({
                ...n10,
                ...r2
              }).sort().map((e11) => s2[e11]));
            }
          }, eo = class {
            #n = "clerk_telemetry_throttler";
            getItem(e10) {
              return this.#r()[e10];
            }
            setItem(e10, t10) {
              try {
                let i10 = this.#r();
                i10[e10] = t10, localStorage.setItem(this.#n, JSON.stringify(i10));
              } catch (e11) {
                e11 instanceof DOMException && ("QuotaExceededError" === e11.name || "NS_ERROR_DOM_QUOTA_REACHED" === e11.name) && localStorage.length > 0 && localStorage.removeItem(this.#n);
              }
            }
            removeItem(e10) {
              try {
                let t10 = this.#r();
                delete t10[e10], localStorage.setItem(this.#n, JSON.stringify(t10));
              } catch {
              }
            }
            #r() {
              try {
                let e10 = localStorage.getItem(this.#n);
                if (!e10) return {};
                return JSON.parse(e10);
              } catch {
                return {};
              }
            }
            static isSupported() {
              return "undefined" != typeof window && !!window.localStorage;
            }
          }, el = class {
            #e = /* @__PURE__ */ new Map();
            #s = 1e4;
            getItem(e10) {
              return this.#e.size > this.#s ? void this.#e.clear() : this.#e.get(e10);
            }
            setItem(e10, t10) {
              this.#e.set(e10, t10);
            }
            removeItem(e10) {
              this.#e.delete(e10);
            }
          };
          let ec = /* @__PURE__ */ new Set([
            "error",
            "warn",
            "info",
            "debug",
            "trace"
          ]);
          var ed = class {
            #a;
            #o;
            #l = {};
            #c = [];
            #d = null;
            constructor(e10) {
              this.#a = {
                maxBufferSize: e10.maxBufferSize ?? 5,
                samplingRate: e10.samplingRate ?? 1,
                perEventSampling: e10.perEventSampling ?? true,
                disabled: e10.disabled ?? false,
                debug: e10.debug ?? false,
                endpoint: "https://clerk-telemetry.com"
              }, e10.clerkVersion || "undefined" != typeof window ? this.#l.clerkVersion = e10.clerkVersion ?? "" : this.#l.clerkVersion = "", this.#l.sdk = e10.sdk, this.#l.sdkVersion = e10.sdkVersion, this.#l.publishableKey = e10.publishableKey ?? "";
              let t10 = B(e10.publishableKey);
              t10 && (this.#l.instanceType = t10.instanceType), e10.secretKey && (this.#l.secretKey = e10.secretKey.substring(0, 16)), this.#o = new ea(eo.isSupported() ? new eo() : new el());
            }
            get isEnabled() {
              return !("development" !== this.#l.instanceType || this.#a.disabled || "undefined" != typeof process && process.env && es(process.env.CLERK_TELEMETRY_DISABLED) || "undefined" != typeof window && window?.navigator?.webdriver);
            }
            get isDebug() {
              return this.#a.debug || "undefined" != typeof process && process.env && es(process.env.CLERK_TELEMETRY_DEBUG);
            }
            record(e10) {
              try {
                let t10 = this.#h(e10.event, e10.payload);
                if (this.#u(t10.event, t10), !this.#p(t10, e10.eventSamplingRate)) return;
                this.#c.push({
                  kind: "event",
                  value: t10
                }), this.#f();
              } catch (e11) {
                console.error("[clerk/telemetry] Error recording telemetry event", e11);
              }
            }
            recordLog(e10) {
              try {
                if (!this.#m(e10)) return;
                let t10 = "string" == typeof e10?.level && ec.has(e10.level), i10 = "string" == typeof e10?.message && e10.message.trim().length > 0, n10 = null, r2 = e10?.timestamp;
                if ("number" == typeof r2 || "string" == typeof r2) {
                  let e11 = new Date(r2);
                  Number.isNaN(e11.getTime()) || (n10 = e11);
                }
                if (!t10 || !i10 || null === n10) {
                  this.isDebug && "undefined" != typeof console && console.warn("[clerk/telemetry] Dropping invalid telemetry log entry", {
                    levelIsValid: t10,
                    messageIsValid: i10,
                    timestampIsValid: null !== n10
                  });
                  return;
                }
                let s2 = this.#g(), a2 = {
                  sdk: s2.name,
                  sdkv: s2.version,
                  cv: this.#l.clerkVersion ?? "",
                  lvl: e10.level,
                  msg: e10.message,
                  ts: n10.toISOString(),
                  pk: this.#l.publishableKey || null,
                  payload: this.#_(e10.context)
                };
                this.#c.push({
                  kind: "log",
                  value: a2
                }), this.#f();
              } catch (e11) {
                console.error("[clerk/telemetry] Error recording telemetry log entry", e11);
              }
            }
            #p(e10, t10) {
              return this.isEnabled && !this.isDebug && this.#y(e10, t10);
            }
            #m(e10) {
              return true;
            }
            #y(e10, t10) {
              let i10 = Math.random();
              return !!(i10 <= this.#a.samplingRate && (false === this.#a.perEventSampling || void 0 === t10 || i10 <= t10)) && !this.#o.isEventThrottled(e10);
            }
            #f() {
              if ("undefined" == typeof window) return void this.#b();
              if (this.#c.length >= this.#a.maxBufferSize) {
                this.#d && ("undefined" != typeof cancelIdleCallback ? cancelIdleCallback(Number(this.#d)) : clearTimeout(Number(this.#d))), this.#b();
                return;
              }
              this.#d || ("requestIdleCallback" in window ? this.#d = requestIdleCallback(() => {
                this.#b(), this.#d = null;
              }) : this.#d = setTimeout(() => {
                this.#b(), this.#d = null;
              }, 0));
            }
            #b() {
              let e10 = [
                ...this.#c
              ];
              if (this.#c = [], this.#d = null, 0 === e10.length) return;
              let t10 = e10.filter((e11) => "event" === e11.kind).map((e11) => e11.value), i10 = e10.filter((e11) => "log" === e11.kind).map((e11) => e11.value);
              t10.length > 0 && fetch(new URL("/v1/event", this.#a.endpoint), {
                headers: {
                  "Content-Type": "application/json"
                },
                keepalive: true,
                method: "POST",
                body: JSON.stringify({
                  events: t10
                })
              }).catch(() => void 0), i10.length > 0 && fetch(new URL("/v1/logs", this.#a.endpoint), {
                headers: {
                  "Content-Type": "application/json"
                },
                keepalive: true,
                method: "POST",
                body: JSON.stringify({
                  logs: i10
                })
              }).catch(() => void 0);
            }
            #u(e10, t10) {
              this.isDebug && (void 0 !== console.groupCollapsed ? (console.groupCollapsed("[clerk/telemetry]", e10), console.log(t10), console.groupEnd()) : console.log("[clerk/telemetry]", e10, t10));
            }
            #g() {
              let e10 = {
                name: this.#l.sdk,
                version: this.#l.sdkVersion
              };
              if ("undefined" != typeof window) {
                let t10 = window;
                if (t10.Clerk) {
                  let i10 = t10.Clerk;
                  if ("object" == typeof i10 && null !== i10 && "constructor" in i10 && "function" == typeof i10.constructor && i10.constructor.sdkMetadata) {
                    let { name: t11, version: n10 } = i10.constructor.sdkMetadata;
                    void 0 !== t11 && (e10.name = t11), void 0 !== n10 && (e10.version = n10);
                  }
                }
              }
              return e10;
            }
            #h(e10, t10) {
              let i10 = this.#g();
              return {
                event: e10,
                cv: this.#l.clerkVersion ?? "",
                it: this.#l.instanceType ?? "",
                sdk: i10.name,
                sdkv: i10.version,
                ...this.#l.publishableKey ? {
                  pk: this.#l.publishableKey
                } : {},
                ...this.#l.secretKey ? {
                  sk: this.#l.secretKey
                } : {},
                payload: t10
              };
            }
            #_(e10) {
              if (null == e10 || "object" != typeof e10) return null;
              try {
                let t10 = JSON.parse(JSON.stringify(e10));
                if (t10 && "object" == typeof t10 && !Array.isArray(t10)) return t10;
                return null;
              } catch {
                return null;
              }
            }
          };
          let eh = "COMPONENT_MOUNTED", eu = /* @__PURE__ */ new Set([
            "SignIn",
            "SignUp"
          ]);
          function ep(e10) {
            return function(t10, i10, n10) {
              return {
                event: e10,
                eventSamplingRate: e10 === eh ? eu.has(t10) ? 1 : 0.1 : 0.1,
                payload: {
                  component: t10,
                  appearanceProp: !!i10?.appearance,
                  baseTheme: !!i10?.appearance?.baseTheme,
                  elements: !!i10?.appearance?.elements,
                  variables: !!i10?.appearance?.variables,
                  ...n10
                }
              };
            };
          }
          function ef(e10, t10, i10) {
            return ep(eh)(e10, t10, i10);
          }
          function em(e10, t10, i10) {
            return ep("COMPONENT_OPENED")(e10, t10, i10);
          }
          function eg(e10) {
            return "string" == typeof e10 ? e10 : "object" == typeof e10 && null !== e10 && "name" in e10 && "string" == typeof e10.name ? e10.name : void 0;
          }
          let e_ = /^[a-zA-Z][a-zA-Z\d+\-.]*?:/;
          var ey = i2(2823);
          let eb = false, ew = null, ev = false, ek = [];
          function eS(e10, t10, i10, n10) {
            eb && (ek.push({
              level: e10,
              message: t10,
              context: i10,
              source: n10,
              ts: Date.now()
            }), ek.length > 200 && ek.shift());
          }
          async function eC(e10) {
            try {
              if (!eb || ew) return;
              let { getDebugLogger: t10 } = await i2.e("785").then(i2.bind(i2, 3656)), n10 = await t10({
                logLevel: e10?.logLevel,
                telemetryCollector: e10?.telemetryCollector
              });
              if (n10 && (ew = n10) && 0 !== ek.length) {
                for (let e11 of ek) {
                  let t11 = {
                    ...e11.context || {},
                    __preInit: true,
                    __preInitTs: e11.ts
                  };
                  switch (e11.level) {
                    case "error":
                      ew.error(e11.message, t11, e11.source);
                      break;
                    case "warn":
                      ew.warn(e11.message, t11, e11.source);
                      break;
                    case "info":
                      ew.info(e11.message, t11, e11.source);
                      break;
                    case "debug":
                      ew.debug(e11.message, t11, e11.source);
                  }
                }
                ek.length = 0;
              }
            } catch (e11) {
              try {
                console.debug?.("Debug logger initialization failed", e11);
              } catch {
              }
              return;
            }
          }
          let eA = {
            debug(e10, t10, i10) {
              if (!ew) return void eS("debug", e10, t10, i10);
              ew.debug(e10, t10, i10);
            },
            error(e10, t10, i10) {
              if (!ew) return void eS("error", e10, t10, i10);
              ew.error(e10, t10, i10);
            },
            info(e10, t10, i10) {
              if (!ew) return void eS("info", e10, t10, i10);
              ew.info(e10, t10, i10);
            },
            warn(e10, t10, i10) {
              if (!ew) return void eS("warn", e10, t10, i10);
              ew.warn(e10, t10, i10);
            }
          }, eU = "clerk:beforeunload", eI = [
            "http:",
            "https:",
            "wails:",
            "chrome-extension:"
          ];
          function eP(e10) {
            let t10 = new URL(e10, window.location.href);
            window.dispatchEvent(new CustomEvent(eU)), window.location.href = t10.href;
          }
          let eT = (e10 = false) => {
            if (!e10) return {
              track: async (e11) => {
                await e11();
              },
              isUnloading: () => false
            };
            let t10 = /* @__PURE__ */ (() => {
              let e11 = false, t11 = () => e11 = true;
              return {
                startListening: () => {
                  window.addEventListener("beforeunload", t11), window.addEventListener(eU, t11);
                },
                stopListening: () => {
                  window.removeEventListener("beforeunload", t11), window.removeEventListener(eU, t11);
                },
                isUnloading: () => e11
              };
            })();
            return {
              track: async (e11) => {
                t10.startListening(), await e11(), t10.stopListening();
              },
              isUnloading: t10.isUnloading
            };
          }, eO = (e10) => ({
            amount: e10.amount,
            amountFormatted: e10.amount_formatted,
            currency: e10.currency,
            currencySymbol: e10.currency_symbol
          }), eE = (e10) => ({
            proration: e10.proration ? {
              amount: eO(e10.proration.amount),
              cycleDaysRemaining: e10.proration.cycle_days_remaining,
              cycleDaysTotal: e10.proration.cycle_days_total,
              cycleRemainingPercent: e10.proration.cycle_remaining_percent
            } : null,
            payer: e10.payer ? {
              remainingBalance: eO(e10.payer.remaining_balance),
              appliedAmount: eO(e10.payer.applied_amount)
            } : null,
            total: eO(e10.total)
          }), ex = (e10) => {
            let t10 = {
              grandTotal: eO(e10.grand_total),
              subtotal: eO(e10.subtotal),
              taxTotal: eO(e10.tax_total)
            };
            return "past_due" in e10 && (t10.pastDue = e10.past_due ? eO(e10.past_due) : null), "credit" in e10 && (t10.credit = e10.credit ? eO(e10.credit) : null), "credits" in e10 && (t10.credits = e10.credits ? eE(e10.credits) : null), "total_due_now" in e10 && (t10.totalDueNow = eO(e10.total_due_now)), "total_due_after_free_trial" in e10 && (t10.totalDueAfterFreeTrial = e10.total_due_after_free_trial ? eO(e10.total_due_after_free_trial) : null), t10;
          }, eR = "__clerk_satellite_url", ez = "suffixed_cookies", eM = "__clerk_synced", eN = [
            "__clerk_status",
            "__clerk_created_session",
            "__clerk_invitation_token",
            "__clerk_ticket",
            "__clerk_modal_state",
            "__clerk_handshake",
            "__clerk_handshake_nonce",
            "__clerk_help",
            Y,
            eM,
            eR,
            ez
          ];
          function eF(e10) {
            return new URL(window.location.href).searchParams.get(e10) || null;
          }
          function eD(e10) {
            let t10 = new URL(window.location.href);
            t10.searchParams.has(e10) && (t10.searchParams.delete(e10), window.history.replaceState(window.history.state, "", t10));
          }
          function eW(e10) {
            let t10 = new URLSearchParams(window.location.search), i10 = e10 || new URLSearchParams();
            for (let e11 of eN) {
              let n10 = t10.get(e11);
              n10 && i10.set(e11, n10);
            }
            return i10;
          }
          let eL = (e10, t10) => !!(e10.isSignedIn && t10?.authConfig.singleSessionMode), e$ = (e10, t10) => !t10?.commerceSettings.billing.user.enabled && !t10?.commerceSettings.billing.organization.enabled, ej = (e10, t10) => !t10?.apiKeysSettings?.user_api_keys_enabled, eJ = (e10, t10) => !t10?.apiKeysSettings?.orgs_api_keys_enabled;
          function eK(e10, t10 = "") {
            return e10.errors && !!e10.errors.find((e11) => e11.code === t10);
          }
          let eB = function({ packageName: e10, customMessages: t10 }) {
            let i10 = e10;
            function n10(e11, t11) {
              if (!t11) return `${i10}: ${e11}`;
              let n11 = e11;
              for (let i11 of e11.matchAll(/{{([a-zA-Z0-9-_]+)}}/g)) {
                let e12 = (t11[i11[1]] || "").toString();
                n11 = n11.replace(`{{${i11[1]}}}`, e12);
              }
              return `${i10}: ${n11}`;
            }
            let r2 = {
              ...A,
              ...t10
            };
            return {
              setPackageName({ packageName: e11 }) {
                return "string" == typeof e11 && (i10 = e11), this;
              },
              setMessages({ customMessages: e11 }) {
                return Object.assign(r2, e11 || {}), this;
              },
              throwInvalidPublishableKeyError(e11) {
                throw Error(n10(r2.InvalidPublishableKeyErrorMessage, e11));
              },
              throwInvalidProxyUrl(e11) {
                throw Error(n10(r2.InvalidProxyUrlErrorMessage, e11));
              },
              throwMissingPublishableKeyError() {
                throw Error(n10(r2.MissingPublishableKeyErrorMessage));
              },
              throwMissingSecretKeyError() {
                throw Error(n10(r2.MissingSecretKeyErrorMessage));
              },
              throwMissingClerkProviderError(e11) {
                throw Error(n10(r2.MissingClerkProvider, e11));
              },
              throw(e11) {
                throw Error(n10(e11));
              }
            };
          }({
            packageName: "@clerk/clerk-js"
          });
          var eV = i2(4763);
          let eq = RegExp("/{1,}", "g"), eH = (e10, t10 = {}) => {
            if (null == e10 || !e10 || "object" != typeof e10) return "";
            let i10 = new URLSearchParams();
            return Object.keys(e10).forEach((n10) => {
              let r2 = t10.keyEncoder ? t10.keyEncoder(n10) : n10, s2 = e10[n10];
              if (Array.isArray(s2)) s2.forEach((e11) => void 0 !== e11 && i10.append(r2, e11 || ""));
              else {
                if (void 0 === s2) return;
                "object" == typeof s2 && null !== s2 ? i10.append(r2, JSON.stringify(s2)) : i10.append(r2, String(s2 ?? ""));
              }
            }), i10.toString();
          }, eG = "http://clerk-dummy", eZ = [
            "javascript:"
          ], { isDevOrStagingUrl: eY } = /* @__PURE__ */ function() {
            let e10 = /* @__PURE__ */ new Map();
            return {
              isDevOrStagingUrl: (t10) => {
                if (!t10) return false;
                let i10 = "string" == typeof t10 ? t10 : t10.hostname, n10 = e10.get(i10);
                return void 0 === n10 && (n10 = $.some((e11) => i10.endsWith(e11)), e10.set(i10, n10)), n10;
              }
            };
          }(), eQ = /* @__PURE__ */ new Map();
          function eX(e10) {
            return e10.replace("clerk.", "");
          }
          function e0(e10, t10 = {}) {
            let { base: i10, hashPath: n10, hashSearch: r2, searchParams: s2, hashSearchParams: a2, ...o2 } = e10, l2 = new URL(i10 || "", "undefined" != typeof window && window.location ? window.location.href : "http://react-native-fake-base-url");
            if (s2 instanceof URLSearchParams && s2.forEach((e11, t11) => {
              null != e11 && l2.searchParams.set(et(t11), e11);
            }), Object.assign(l2, o2), n10 || r2 || a2) {
              var c2;
              let e11 = new URL(eG + l2.hash.substring(1));
              for (let [t12, i11] of (c2 = e11.pathname, e11.pathname = [
                c2,
                n10 || ""
              ].filter((e12) => e12).join("/").replace(eq, "/"), Object.entries(((e12) => {
                let t13 = {};
                return new URLSearchParams(e12).forEach((e13, i12) => {
                  if (i12 in t13) {
                    let n11 = t13[i12];
                    Array.isArray(n11) ? n11.push(e13) : t13[i12] = [
                      n11,
                      e13
                    ];
                  } else t13[i12] = e13;
                }), t13;
              })(r2 || "")))) e11.searchParams.append(t12, i11);
              if (a2) for (let t12 of Array.isArray(a2) ? a2 : [
                a2
              ]) (t12 instanceof URLSearchParams || "object" == typeof t12) && new URLSearchParams(t12).forEach((t13, i11) => {
                null != t13 && e11.searchParams.set(et(i11), t13);
              });
              let t11 = e11.href.replace(eG, "");
              "/" !== t11 && (l2.hash = t11);
            }
            let { stringify: d2, skipOrigin: h2 } = t10;
            return d2 ? h2 ? l2.href.replace(l2.origin, "") : l2.href : l2;
          }
          function e1(e10) {
            return void 0 === window.location && "string" == typeof e10 ? e10 : (e10 = new URL(e10.toString(), window.location.origin)).href.replace(e10.origin, "");
          }
          let e3 = (e10) => (e10 || "").replace(/\/+$/, "");
          function e22(e10, t10) {
            try {
              return new URL(e10);
            } catch {
              return new URL(e10, t10);
            }
          }
          let e4 = [
            /\0/,
            /^\/\//,
            /[\x00-\x1F]/
          ], e6 = [
            "/oauth/authorize"
          ], e5 = [
            "/v1/verify",
            "/v1/tickets/accept",
            "/oauth/authorize-with-immediate-redirect",
            "/oauth/end_session"
          ];
          function e8(e10) {
            var t10;
            return t10 = e10.replace(/_/g, "/").replace(/-/g, "+"), decodeURIComponent(i2.g.atob(t10).split("").map((e11) => "%" + ("00" + e11.charCodeAt(0).toString(16)).slice(-2)).join(""));
          }
          function e7(e10) {
            let t10 = (e10 || "").split("."), [i10, n10, r2] = t10;
            if (3 !== t10.length || !i10 || !n10 || !r2) throw Error("JWT could not be decoded");
            let s2 = JSON.parse(e8(n10)), a2 = {
              __raw: e10
            };
            return Object.keys(s2).forEach((e11) => {
              a2[e11] = s2[e11];
            }), {
              encoded: {
                header: i10,
                payload: n10,
                signature: r2
              },
              header: JSON.parse(e8(i10)),
              claims: a2
            };
          }
          function e9() {
            if (!a()) return null;
            try {
              let e10 = navigator?.language;
              if (!e10 || "string" != typeof e10 || "" === e10.trim()) return null;
              return e10;
            } catch {
              return null;
            }
          }
          function te() {
            return void 0 !== globalThis.document;
          }
          function tt() {
            if (!function() {
              if (!te()) return false;
              try {
                return window.self !== window.top;
              } catch {
                return true;
              }
            }()) return false;
            try {
              return window.top?.location.href, false;
            } catch {
              return true;
            }
          }
          class ti {
            #w = void 0;
            #v = false;
            static #k = null;
            constructor() {
            }
            async #S() {
              if (this.#v) return;
              this.#v = true;
              let e10 = await i2.e("825").then(i2.bind(i2, 2854)).then((e11) => e11.getWallets());
              this.#w = e10.get(), e10.on("register", () => {
                this.#w = e10.get();
              }), e10.on("unregister", () => {
                this.#w = e10.get();
              });
            }
            #C(e10) {
              return e10.chains?.some((e11) => e11.startsWith("solana:")) ?? false;
            }
            #A(e10) {
              return "solana:signMessage" in e10.features;
            }
            static getInstance() {
              return ti.#k || (ti.#k = new ti()), ti.#k;
            }
            get = async (e10) => {
              await this.#S();
              let t10 = (this.#w || []).find((t11) => t11.name === e10 && this.#C(t11) && this.#A(t11));
              if (t10 && this.#C(t10)) return t10;
              if ("undefined" == typeof window) return;
              let i10 = window.solana;
              if (i10 && "function" == typeof i10.connect && "function" == typeof i10.signMessage) return i10;
            };
          }
          class tn {
            #U = [];
            #I = {
              metamask: "MetaMask",
              okx_wallet: "OKX Wallet"
            };
            static #k = null;
            constructor() {
              if ("undefined" == typeof window) return;
              window.addEventListener("eip6963:announceProvider", this.#P), window.dispatchEvent(new Event("eip6963:requestProvider"));
            }
            static getInstance() {
              return tn.#k || (tn.#k = new tn()), tn.#k;
            }
            get = (e10) => {
              let t10 = this.#U.find((t11) => t11.info.name === this.#I[e10])?.provider;
              return void 0 !== t10 ? t10 : window.ethereum;
            };
            #P = (e10) => {
              this.#U.some((t10) => t10.info.uuid === e10.detail.info.uuid) || this.#U.push(e10.detail);
            };
          }
          async function tr(e10) {
            let { provider: t10, walletName: i10 } = e10, n10 = await tg(t10, i10);
            if (!n10) return "";
            if ("solana" === t10) {
              let e11 = await n10.features["standard:connect"].connect();
              return e11 && e11.accounts[0].address || "";
            }
            let r2 = await n10.request({
              method: "eth_requestAccounts"
            });
            return r2 && r2[0] || "";
          }
          let ts = async (e10) => {
            let { identifier: t10, nonce: i10, provider: n10, walletName: r2 = "" } = e10, s2 = await tg(n10, r2);
            if (!s2) return "";
            if ("solana" === n10) try {
              let e11 = s2.accounts.find((e12) => e12.address === t10);
              if (!e11) return console.warn(`Wallet account with address ${t10} not found`), "";
              let n11 = await s2.features["solana:signMessage"]?.signMessage({
                account: e11,
                message: new TextEncoder().encode(i10)
              });
              return n11?.[0]?.signature ? btoa(String.fromCharCode(...n11[0].signature)) : "";
            } catch (e11) {
              if (e11 instanceof Error && e11.message.includes("User rejected the request.")) throw new T("Web3 signature request was rejected by the user.", {
                code: "web3_signature_request_rejected"
              });
              throw new T("An error occurred while generating the Solana signature.", {
                code: "web3_solana_signature_generation_failed",
                cause: e11
              });
            }
            return await s2.request({
              method: "personal_sign",
              params: [
                `0x${i10.split("").map((e11) => e11.charCodeAt(0).toString(16).padStart(2, "0")).join("")}`,
                t10
              ]
            });
          };
          async function ta() {
            return await tr({
              provider: "metamask"
            });
          }
          async function to() {
            return await tr({
              provider: "coinbase_wallet"
            });
          }
          async function tl() {
            return await tr({
              provider: "okx_wallet"
            });
          }
          async function tc() {
            return await tr({
              provider: "base"
            });
          }
          async function td(e10) {
            return await tr({
              provider: "solana",
              walletName: e10
            });
          }
          async function th(e10) {
            return await ts({
              ...e10,
              provider: "metamask"
            });
          }
          async function tu(e10) {
            return await ts({
              ...e10,
              provider: "coinbase_wallet"
            });
          }
          async function tp(e10) {
            return await ts({
              ...e10,
              provider: "okx_wallet"
            });
          }
          async function tf(e10) {
            return await ts({
              ...e10,
              provider: "base"
            });
          }
          async function tm(e10) {
            return await ts({
              ...e10,
              provider: "solana"
            });
          }
          async function tg(e10, t10) {
            if ("coinbase_wallet" === e10) return (await i2.e("368").then(i2.bind(i2, 9373)).then((e11) => e11.createCoinbaseWalletSDK))({
              preference: {
                options: "all"
              }
            }).getProvider();
            if ("base" === e10) try {
              return (await i2.e("623").then(i2.bind(i2, 140)).then((e11) => e11.createBaseAccountSDK))({
                appName: "undefined" != typeof window && window.Clerk?.__unstable__environment?.displayConfig?.applicationName || "undefined" != typeof document && document.title || "Web3 Application"
              }).getProvider();
            } catch {
              return null;
            }
            return "solana" === e10 ? t10 && 0 !== t10.length ? await ti.getInstance().get(t10) : void eB.throw("Wallet name must be provided to get Solana wallet provider") : tn.getInstance().get(e10);
          }
          function t_(e10) {
            let t10 = [
              "redirectUrl",
              "afterSignInUrl",
              "afterSignUpUrl",
              "after_sign_in_url",
              "after_sign_up_url"
            ], i10 = Object.keys(e10).find((e11) => t10.includes(e11));
            i10 && e10[i10] && Z(`Clerk: The prop "${i10}" is deprecated and should be replaced with the new "fallbackRedirectUrl" or "forceRedirectUrl" props instead. Learn more: https://clerk.com/docs/guides/custom-redirects#redirect-url-props`);
          }
          let ty = "environment", tb = JSON.stringify, tw = JSON.parse;
          class tv {
            static _key(e10) {
              return `__clerk_${e10}`;
            }
            static isExpired(e10) {
              return !!e10.exp && Date.now() > e10.exp;
            }
            static setItem(e10, t10, i10) {
              try {
                let n10 = {
                  value: t10,
                  ...i10 && {
                    exp: Date.now() + i10
                  }
                };
                window.localStorage.setItem(this._key(e10), tb(n10));
              } catch {
              }
            }
            static getItem(e10, t10) {
              try {
                let i10 = window.localStorage.getItem(this._key(e10));
                if (!i10) return t10;
                let n10 = tw(i10);
                if (!n10) return t10;
                if (this.isExpired(n10)) return this.removeItem(e10), t10;
                return n10?.value ?? t10;
              } catch {
                return t10;
              }
            }
            static removeItem(e10) {
              try {
                window.localStorage.removeItem(this._key(e10));
              } catch {
              }
            }
          }
          let tk = "ClerkJS:";
          function tS(e10 = "") {
            throw Error(`${tk} Something went wrong initializing Clerk in development mode.${e10 && ` ${e10}`}`);
          }
          function tC(e10) {
            throw Error(`${tk} Something went wrong initializing Clerk during the ${e10} flow. Please contact support.`);
          }
          function tA(e10) {
            throw Error(`${tk} You need to start a ${e10} flow by calling ${e10}.create() first.`);
          }
          function tU(e10, t10) {
            throw Error(`${tk} Strategy "${t10}" is not a valid strategy for ${e10}.`);
          }
          function tI(e10) {
            throw Error(`${tk} You need to start a ${e10} flow by calling ${e10}.create({ identifier: 'your web3 wallet address' }) first`);
          }
          function tP(e10 = "") {
            throw Error(`${tk} Missing '${e10}' option`);
          }
          function tT(e10, t10) {
            throw Error(`${tk} Response: ${e10 || 0} not supported yet.
For more information contact us at ${t10}`);
          }
          function tO(e10) {
            throw Error(`${tk} Missing publicKey. When calling 'navigator.credentials.${e10}()' it is required to pass a publicKey object.`);
          }
          let tE = {
            initialDelay: 125,
            maxDelayBetweenRetries: 0,
            factor: 2,
            shouldRetry: (e10, t10) => t10 < 5,
            retryImmediately: false,
            jitter: true
          }, tx = async (e10) => new Promise((t10) => setTimeout(t10, e10)), tR = (e10, t10) => t10 ? e10 * (1 + Math.random()) : e10, tz = async (e10, t10 = {}) => {
            var i10;
            let n10, r2 = 0, { shouldRetry: s2, initialDelay: a2, maxDelayBetweenRetries: o2, factor: l2, retryImmediately: c2, jitter: d2, onBeforeRetry: h2 } = {
              ...tE,
              ...t10
            }, u2 = (i10 = {
              initialDelay: a2,
              maxDelayBetweenRetries: o2,
              factor: l2,
              jitter: d2
            }, n10 = 0, async () => {
              let e11;
              await tx((e11 = tR(e11 = i10.initialDelay * Math.pow(i10.factor, n10), i10.jitter), Math.min(i10.maxDelayBetweenRetries || e11, e11))), n10++;
            });
            for (; ; ) try {
              return await e10();
            } catch (e11) {
              if (!s2(e11, ++r2)) throw e11;
              h2 && await h2(r2), c2 && 1 === r2 ? await tx(tR(100, d2)) : await u2();
            }
          };
          async function tM(e10 = "", t10) {
            let { async: i10, defer: n10, beforeLoad: r2, crossOrigin: s2, nonce: a2 } = t10 || {};
            return tz(() => new Promise((t11, o2) => {
              e10 || o2(Error("loadScript cannot be called without a src")), document && document.body || o2(Error("loadScript cannot be called when document does not exist"));
              let l2 = document.createElement("script");
              s2 && l2.setAttribute("crossorigin", s2), l2.async = i10 || false, l2.defer = n10 || false, l2.addEventListener("load", () => {
                l2.remove(), t11(l2);
              }), l2.addEventListener("error", (t12) => {
                l2.remove(), o2(t12.error ?? Error(`failed to load script: ${e10}`));
              }), l2.src = e10, l2.nonce = a2, r2?.(l2), document.body.appendChild(l2);
            }), {
              shouldRetry: (e11, t11) => t11 <= 5
            });
          }
          let tN = "clerk-captcha", tF = "clerk-invisible-captcha";
          async function tD(e10) {
            return window.turnstile || await tW(e10).catch(() => {
              throw {
                captchaError: "captcha_script_failed_to_load"
              };
            }), window.turnstile;
          }
          async function tW(e10) {
            try {
              return await tM("https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit", {
                defer: true,
                nonce: e10
              });
            } catch (e11) {
              throw console.warn("Clerk: Failed to load the CAPTCHA script from Cloudflare. If you see a CSP error in your browser, please add the necessary CSP rules to your app. Visit https://clerk.com/docs/security/clerk-csp for more information."), e11;
            }
          }
          function tL(e10) {
            try {
              let t10 = e10.getAttribute("data-cl-theme") || void 0, i10 = e10.getAttribute("data-cl-language") || void 0, n10 = e10.getAttribute("data-cl-size") || void 0;
              return {
                theme: t10,
                language: i10,
                size: n10
              };
            } catch {
              return {
                theme: void 0,
                language: void 0,
                size: void 0
              };
            }
          }
          let t$ = async (e10) => {
            let t10, i10, n10, r2, { siteKey: s2, widgetType: a2, invisibleSiteKey: o2, nonce: l2 } = e10, { modalContainerQuerySelector: c2, modalWrapperQuerySelector: d2, closeModal: h2, openModal: u2 } = e10, p2 = await tD(l2), f2 = [], m2 = 0, g2 = [], _2 = "";
            try {
              m2 = Date.now(), _2 = "undefined" != typeof crypto && "function" == typeof crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9);
            } catch {
            }
            let y2 = "", b2 = "", w2 = s2, v2 = 0, k2 = null, S2 = "invisible";
            if (c2 && d2) {
              k2 = a2, r2 = c2, S2 = "modal";
              try {
                await u2?.();
              } catch {
                throw {
                  captchaError: "modal_component_not_ready"
                };
              }
              let e11 = await new Promise((e12) => {
                if (document.querySelector(c2)) return e12(document.querySelector(c2));
                let t11 = new MutationObserver(() => {
                  document.querySelector(c2) && (t11.disconnect(), e12(document.querySelector(c2)));
                });
                t11.observe(document.body, {
                  childList: true,
                  subtree: true
                });
              });
              if (e11) {
                let { theme: r3, language: s3, size: a3 } = tL(e11);
                t10 = r3, n10 = s3, i10 = a3;
              }
            }
            if (!r2 && "smart" === a2) {
              let e11 = document.getElementById(tN);
              if (e11) {
                S2 = "smart", k2 = "smart", r2 = `#${tN}`, e11.style.maxHeight = "0";
                let { theme: s3, language: a3, size: o3 } = tL(e11);
                t10 = s3, n10 = a3, i10 = o3;
              } else console.error("Cannot initialize Smart CAPTCHA widget because the `clerk-captcha` DOM element was not found; falling back to Invisible CAPTCHA widget. If you are using a custom flow, visit https://clerk.com/docs/guides/development/custom-flows/bot-sign-up-protection for instructions");
            }
            if (!r2) {
              S2 = "invisible", w2 = o2, k2 = "invisible", r2 = `.${tF}`;
              let e11 = document.createElement("div");
              e11.classList.add(tF), e11.style.display = "none", document.body.appendChild(e11);
            }
            let C2 = async () => new Promise((s3, a3) => {
              try {
                let o3 = p2.render(r2, {
                  sitekey: w2,
                  appearance: "interaction-only",
                  theme: t10 || "auto",
                  size: i10 || "normal",
                  language: n10 || "auto",
                  action: e10.action,
                  retry: "never",
                  "refresh-expired": "auto",
                  callback: function(e11) {
                    h2?.(), s3([
                      e11,
                      o3
                    ]);
                  },
                  "before-interactive-callback": () => {
                    if (d2) {
                      let e11 = document.querySelector(d2);
                      e11?.style.setProperty("visibility", "visible"), e11?.style.setProperty("pointer-events", "all");
                    } else {
                      let e11 = document.getElementById(tN);
                      e11 && (e11.style.maxHeight = "unset", e11.style.minHeight = "compact" === i10 ? "140px" : "68px", e11.style.marginBottom = "1.5rem", e11.dataset.clInteractive = "true");
                    }
                  },
                  "error-callback": function(e11) {
                    var t11;
                    f2.push(e11);
                    try {
                      g2.push({
                        code: e11,
                        t: Date.now() - m2
                      });
                    } catch {
                    }
                    if (v2 < 2 && (t11 = e11.toString(), [
                      "crashed",
                      "undefined_error",
                      "102",
                      "103",
                      "104",
                      "106",
                      "110600",
                      "300",
                      "600"
                    ].find((e12) => t11.startsWith(e12)))) return void setTimeout(() => {
                      if (r2 && !document.querySelector(r2)) return void a3([
                        f2.join(","),
                        o3
                      ]);
                      p2.reset(o3), v2++;
                    }, 250);
                    a3([
                      f2.join(","),
                      o3
                    ]);
                  },
                  "unsupported-callback": function() {
                    return a3([
                      "This browser is not supported by the CAPTCHA.",
                      o3
                    ]), true;
                  }
                });
              } catch (e11) {
                a3([
                  e11,
                  void 0
                ]);
              }
            });
            try {
              [y2, b2] = await C2(), p2.remove(b2);
            } catch ([e11, t11]) {
              t11 && p2.remove(t11);
              try {
                let t12 = !!r2 && !!document.querySelector(r2);
                eA.error("Turnstile captcha challenge failed", {
                  captchaAttemptId: _2,
                  errorTimeline: g2,
                  lastErrorCode: g2.length > 0 ? g2[g2.length - 1].code : null,
                  finalError: String(e11),
                  retriesAttempted: v2,
                  widgetType: S2,
                  containerExistsAtFailure: t12,
                  totalDurationMs: Date.now() - m2
                }, "captcha");
              } catch {
              }
              throw {
                captchaError: e11
              };
            } finally {
              if ("modal" === S2 && h2?.(), "invisible" === S2) {
                let e11 = document.querySelector(`.${tF}`);
                e11 && document.body.removeChild(e11);
              }
              if ("smart" === S2) {
                let e11 = document.getElementById(tN);
                e11 && (delete e11.dataset.clInteractive, e11.style.maxHeight = "0", e11.style.minHeight = "unset", e11.style.marginBottom = "unset");
              }
            }
            return {
              captchaToken: y2,
              captchaWidgetType: k2
            };
          }, tj = (e10) => t$(e10), tJ = (e10) => {
            let t10 = e10.__unstable__environment, i10 = t10 ? t10.displayConfig.captchaProvider : "turnstile", n10 = e10.__internal_getOption?.("nonce");
            return {
              captchaSiteKey: t10 ? t10.displayConfig.captchaPublicKey : null,
              captchaWidgetType: t10 ? t10.displayConfig.captchaWidgetType : null,
              captchaProvider: i10,
              captchaPublicKeyInvisible: t10 ? t10.displayConfig.captchaPublicKeyInvisible : null,
              canUseCaptcha: t10 ? t10.userSettings.signUp.captcha_enabled && e10.isStandardBrowser : null,
              nonce: n10 || void 0
            };
          };
          class tK {
            clerk;
            constructor(e10) {
              this.clerk = e10;
            }
            async invisible(e10) {
              let { captchaSiteKey: t10, canUseCaptcha: i10, captchaPublicKeyInvisible: n10, nonce: r2 } = tJ(this.clerk);
              return i10 && t10 && n10 ? {
                ...await tj({
                  action: e10?.action,
                  captchaProvider: "turnstile",
                  invisibleSiteKey: n10,
                  nonce: e10?.nonce || r2 || void 0,
                  siteKey: n10,
                  widgetType: "invisible"
                }).catch((e11) => e11.captchaError ? {
                  captchaError: e11.captchaError
                } : {
                  captchaError: e11?.message || e11 || "unexpected_captcha_error"
                }),
                captchaAction: e10?.action
              } : {
                captchaError: "captcha_unavailable",
                captchaAction: e10?.action
              };
            }
            async managedOrInvisible(e10) {
              let { captchaSiteKey: t10, canUseCaptcha: i10, captchaWidgetType: n10, captchaProvider: r2, captchaPublicKeyInvisible: s2, nonce: a2 } = tJ(this.clerk);
              if (i10 && t10 && s2) {
                let i11 = await tj({
                  captchaProvider: r2,
                  invisibleSiteKey: s2,
                  nonce: a2 || void 0,
                  siteKey: t10,
                  widgetType: n10,
                  ...e10
                }).catch((t11) => t11.captchaError ? {
                  captchaError: t11.captchaError
                } : e10?.action === "verify" ? {
                  captchaError: t11?.message || t11 || "unexpected_captcha_error"
                } : void 0);
                return e10?.action === "verify" ? {
                  ...i11,
                  captchaAction: "verify"
                } : i11;
              }
              return e10?.action === "verify" ? {
                captchaError: "captcha_unavailable",
                captchaAction: e10?.action
              } : {};
            }
            async managedInModal(e10) {
              return this.managedOrInvisible({
                modalWrapperQuerySelector: "#cl-modal-captcha-wrapper",
                modalContainerQuerySelector: "#cl-modal-captcha-container",
                openModal: () => this.clerk.__internal_openBlankCaptchaModal(),
                closeModal: () => this.clerk.__internal_closeBlankCaptchaModal(),
                action: e10?.action
              });
            }
          }
          class tB {
            client;
            CaptchaChallengeImpl;
            static instance;
            inflightException = null;
            captchaRetryCount = 0;
            MAX_RETRY_ATTEMPTS = 3;
            static getInstance() {
              return tB.instance || (tB.instance = new tB(ie, tK)), tB.instance;
            }
            constructor(e10, t10) {
              this.client = e10, this.CaptchaChallengeImpl = t10;
            }
            async execute(e10, t10) {
              if (this.captchaAttemptsExceeded()) throw new T("Security verification failed. Please try again by refreshing the page, clearing your browser cookies, or using a different web browser.", {
                code: "captcha_client_attempts_exceeded"
              });
              try {
                return this.inflightException && await this.inflightException, await t10();
              } catch (n10) {
                let i10;
                if (!S(n10) || O(n10) && "network_error" === n10.code || n10.errors[0]?.code !== "requires_captcha") throw n10;
                if (this.inflightException) return await this.inflightException, await t10();
                this.inflightException = new Promise((e11) => i10 = e11);
                try {
                  let t11 = await this.managedChallenge(e10);
                  t11?.captchaError !== "modal_component_not_ready" && (await this.client.getOrCreateInstance().__internal_sendCaptchaToken(t11), this.captchaRetryCount = 0);
                } catch (e11) {
                  throw this.captchaRetryCount++, e11;
                } finally {
                  i10(), this.inflightException = null;
                }
                return await t10();
              }
            }
            managedChallenge(e10) {
              return new this.CaptchaChallengeImpl(e10).managedInModal({
                action: "verify"
              });
            }
            captchaAttemptsExceeded = () => this.captchaRetryCount >= this.MAX_RETRY_ATTEMPTS;
          }
          class tV {
            static clerk;
            id;
            pathRoot = "";
            static get fapiClient() {
              return tV.clerk.getFapiClient();
            }
            async reload(e10) {
              let { rotatingTokenNonce: t10 } = e10 || {};
              return this._baseGet({
                forceUpdateClient: true,
                rotatingTokenNonce: t10
              });
            }
            isNew() {
              return !this.id;
            }
            static async _fetch(e10, t10 = {}) {
              return tB.getInstance().execute(this.clerk, () => this._baseFetch(e10, t10));
            }
            static async _baseFetch(e10, t10 = {}) {
              let i10;
              tV.fapiClient || function() {
                throw Error(`${tk} Missing FAPI client in resources.`);
              }();
              let { fetchMaxTries: n10 } = t10;
              try {
                i10 = await tV.fapiClient.request(e10, {
                  fetchMaxTries: n10
                });
              } catch (t11) {
                if (this.shouldRethrowOfflineNetworkErrors()) throw new T(t11?.message || t11, {
                  code: "network_error"
                });
                if (!d()) return eA.warn("Network request failed while offline, returning null", {
                  method: e10.method,
                  path: e10.path
                }, "baseResource"), null;
                throw t11;
              }
              let { payload: r2, status: s2, statusText: a2, headers: o2 } = i10;
              if (o2) {
                let e11 = o2.get("x-country");
                this.clerk.__internal_setCountry(e11 ? e11.toLowerCase() : null);
              }
              if (("GET" !== e10.method || t10.forceUpdateClient) && this._updateClient(r2), s2 >= 200 && s2 <= 299) return r2;
              if (s2 >= 400) {
                let e11 = r2?.errors, t11 = e11?.[0]?.long_message, i11 = e11?.[0]?.code;
                401 === s2 && "requires_captcha" !== i11 && await tV.clerk.handleUnauthenticated(), function(e12, t12) {
                  var i12;
                  if (!t12 || !t12[0]) return;
                  let n12 = t12[0], r3 = n12.long_message;
                  if ("origin_invalid" === n12.code && ((i12 = tV.clerk.publishableKey).startsWith("live_") || i12.startsWith("pk_live_"))) {
                    let i13 = tV.clerk.frontendApi.replace("clerk.", "");
                    throw new k(`Clerk: Production Keys are only allowed for domain "${i13}". 
API Error: ${r3}`, {
                      data: t12,
                      status: e12
                    });
                  }
                }(s2, e11);
                let n11 = {
                  data: e11,
                  status: s2
                };
                if (429 === s2 && o2) {
                  let e12 = o2.get("retry-after");
                  if (e12) {
                    let t12 = parseInt(e12, 10);
                    isNaN(t12) || (n11.retryAfter = t12);
                  }
                }
                throw new k(t11 || a2, n11);
              }
              return null;
            }
            static _updateClient(e10) {
              if (!e10) return;
              let t10 = e10.client || e10.meta?.client;
              t10 && tV.clerk && tV.clerk.updateClient(ie.getOrCreateInstance().fromJSON(t10));
            }
            path(e10) {
              let t10 = this.pathRoot;
              if (this.isNew()) return t10;
              let i10 = t10.replace(/[^/]$/, "$&/") + encodeURIComponent(this.id);
              return e10 ? i10.replace(/[^/]$/, "$&/") + encodeURIComponent(e10) : i10;
            }
            withDefault(e10, t10) {
              return e10 ?? t10;
            }
            async _baseGet(e10 = {}) {
              let t10 = await tV._fetch({
                method: "GET",
                path: this.path(),
                rotatingTokenNonce: e10.rotatingTokenNonce,
                signal: e10.abortSignal
              }, e10);
              return this.fromJSON(t10?.response || t10);
            }
            async _baseMutate(e10) {
              let { action: t10, body: i10, method: n10, path: r2 } = e10, s2 = await tV._fetch({
                method: n10,
                path: r2 || this.path(t10),
                body: i10
              });
              return this.fromJSON(s2?.response || s2);
            }
            async _baseMutateBypass(e10) {
              let { action: t10, body: i10, method: n10, path: r2 } = e10, s2 = await tV._baseFetch({
                method: n10,
                path: r2 || this.path(t10),
                body: i10
              });
              return this.fromJSON(s2?.response || s2);
            }
            async _basePost(e10 = {}) {
              return this._baseMutate({
                ...e10,
                method: "POST"
              });
            }
            async _basePostBypass(e10 = {}) {
              return this._baseMutateBypass({
                ...e10,
                method: "POST"
              });
            }
            async _basePut(e10 = {}) {
              return this._baseMutate({
                ...e10,
                method: "PUT"
              });
            }
            async _basePatch(e10 = {}) {
              return this._baseMutate({
                ...e10,
                method: "PATCH"
              });
            }
            async _baseDelete(e10 = {}) {
              await this._baseMutate({
                ...e10,
                method: "DELETE"
              });
            }
            static shouldRethrowOfflineNetworkErrors() {
              let e10 = tV.clerk?.__internal_getOption?.("experimental");
              return e10?.rethrowOfflineNetworkErrors || false;
            }
          }
          let tq = {
            enabled: false,
            first_factors: [],
            name: "phone_number",
            required: false,
            second_factors: [],
            used_for_first_factor: false,
            used_for_second_factor: false,
            verifications: [],
            verify_at_sign_up: false
          };
          class tH extends tV {
            id = void 0;
            actions = {
              create_organization: false,
              delete_self: false
            };
            attributes = {
              email_address: {
                enabled: true,
                first_factors: [
                  "email_code"
                ],
                name: "email_address",
                required: true,
                second_factors: [],
                used_for_first_factor: true,
                used_for_second_factor: false,
                verifications: [
                  "email_code"
                ],
                verify_at_sign_up: true
              },
              phone_number: {
                ...tq,
                name: "phone_number"
              },
              username: {
                ...tq,
                name: "username"
              },
              web3_wallet: {
                ...tq,
                name: "web3_wallet"
              },
              first_name: {
                ...tq,
                name: "first_name"
              },
              last_name: {
                ...tq,
                name: "last_name"
              },
              password: {
                enabled: true,
                first_factors: [],
                name: "password",
                required: true,
                second_factors: [],
                used_for_first_factor: false,
                used_for_second_factor: false,
                verifications: [],
                verify_at_sign_up: false
              },
              authenticator_app: {
                ...tq,
                name: "authenticator_app"
              },
              backup_code: {
                ...tq,
                name: "backup_code"
              },
              passkey: {
                ...tq,
                name: "passkey"
              }
            };
            enterpriseSSO = {
              enabled: false
            };
            passkeySettings = {
              allow_autofill: false,
              show_sign_in_button: false
            };
            passwordSettings = {};
            saml = {
              enabled: false
            };
            signIn = {
              second_factor: {
                required: false,
                enabled: false
              }
            };
            signUp = {
              allowlist_only: false,
              captcha_enabled: false,
              legal_consent_enabled: false,
              mode: "public",
              progressive: true,
              mfa: {
                required: false
              }
            };
            social = {};
            usernameSettings = {};
            get authenticatableSocialStrategies() {
              return this.social ? Object.entries(this.social).filter(([, e10]) => e10.enabled && e10.authenticatable).map(([, e10]) => e10.strategy).sort() : [];
            }
            get enabledFirstFactorIdentifiers() {
              return this.attributes ? Object.entries(this.attributes).filter(([e10, t10]) => t10.used_for_first_factor && !e10.startsWith("web3")).map(([e10]) => e10) : [];
            }
            get socialProviderStrategies() {
              return this.social ? Object.entries(this.social).filter(([, e10]) => e10.enabled).map(([, e10]) => e10.strategy).sort() : [];
            }
            get web3FirstFactors() {
              return this.attributes ? Object.entries(this.attributes).filter(([e10, t10]) => t10.used_for_first_factor && e10.startsWith("web3")).map(([, e10]) => e10.first_factors).flat() : [];
            }
            get alternativePhoneCodeChannels() {
              return this.attributes ? Object.entries(this.attributes).filter(([e10, t10]) => t10.used_for_first_factor && "phone_number" === e10).map(([, e10]) => e10?.channels?.filter((e11) => "sms" !== e11) || []).flat() : [];
            }
            constructor(e10 = null) {
              super(), this.fromJSON(e10);
            }
            get instanceIsPasswordBased() {
              return !!this.attributes?.password?.enabled;
            }
            get hasValidAuthFactor() {
              return !!(this.attributes?.email_address?.enabled || this.attributes?.phone_number?.enabled || this.attributes.password?.required && this.attributes.username?.required);
            }
            fromJSON(e10) {
              return e10 && (this.attributes = this.withDefault(e10.attributes ? Object.fromEntries(Object.entries(e10.attributes).map((e11) => [
                e11[0],
                {
                  ...e11[1],
                  name: e11[0]
                }
              ])) : null, this.attributes), this.actions = this.withDefault(e10.actions, this.actions), this.enterpriseSSO = this.withDefault(e10.enterprise_sso, this.enterpriseSSO), this.passkeySettings = this.withDefault(e10.passkey_settings, this.passkeySettings), this.passwordSettings = e10.password_settings ? {
                ...e10.password_settings,
                min_length: Math.max(e10.password_settings?.min_length ?? 8, 8),
                max_length: e10.password_settings?.max_length === 0 ? 72 : Math.min(e10.password_settings?.max_length ?? 72, 72)
              } : this.passwordSettings, this.saml = this.withDefault(e10.saml, this.saml), this.signIn = this.withDefault(e10.sign_in, this.signIn), this.signUp = this.withDefault(e10.sign_up, this.signUp), this.social = this.withDefault(e10.social, this.social), this.usernameSettings = e10.username_settings ? {
                ...e10.username_settings,
                min_length: Math.max(e10.username_settings?.min_length ?? 4, 4),
                max_length: Math.min(e10.username_settings?.max_length ?? 64, 64)
              } : this.usernameSettings), this;
            }
            __internal_toSnapshot() {
              return {
                actions: this.actions,
                attributes: this.attributes,
                passkey_settings: this.passkeySettings,
                password_settings: this.passwordSettings,
                saml: this.saml,
                sign_in: this.signIn,
                sign_up: this.signUp,
                social: this.social
              };
            }
          }
          class tG extends tV {
            billing = {
              stripePublishableKey: null,
              organization: {
                enabled: false,
                hasPaidPlans: false
              },
              user: {
                enabled: false,
                hasPaidPlans: false
              }
            };
            constructor(e10 = null) {
              super(), this.fromJSON(e10);
            }
            fromJSON(e10) {
              return e10 && (this.billing.stripePublishableKey = e10.billing.stripe_publishable_key, this.billing.organization.enabled = e10.billing.organization.enabled, this.billing.organization.hasPaidPlans = e10.billing.organization.has_paid_plans, this.billing.user.enabled = e10.billing.user.enabled, this.billing.user.hasPaidPlans = e10.billing.user.has_paid_plans), this;
            }
            __internal_toSnapshot() {
              return {
                billing: {
                  stripe_publishable_key: this.billing.stripePublishableKey,
                  organization: {
                    enabled: this.billing.organization.enabled,
                    has_paid_plans: this.billing.organization.hasPaidPlans
                  },
                  user: {
                    enabled: this.billing.user.enabled,
                    has_paid_plans: this.billing.user.hasPaidPlans
                  }
                }
              };
            }
          }
          function tZ(e10) {
            let t10 = new Date(e10 || /* @__PURE__ */ new Date());
            return t10 instanceof Date && !isNaN(t10.getTime()) ? t10 : /* @__PURE__ */ new Date();
          }
          class tY extends tV {
            claimedAt = null;
            reverification = false;
            singleSessionMode = false;
            preferredChannels = null;
            sessionMinter = false;
            constructor(e10 = null) {
              super(), this.fromJSON(e10);
            }
            fromJSON(e10) {
              return e10 && (this.claimedAt = this.withDefault(e10.claimed_at ? tZ(e10.claimed_at) : null, this.claimedAt), this.reverification = this.withDefault(e10.reverification, this.reverification), this.singleSessionMode = this.withDefault(e10.single_session_mode, this.singleSessionMode), this.preferredChannels = this.withDefault(e10.preferred_channels, this.preferredChannels), this.sessionMinter = this.withDefault(e10.session_minter, this.sessionMinter)), this;
            }
            __internal_toSnapshot() {
              return {
                claimed_at: this.claimedAt ? this.claimedAt.getTime() : null,
                id: this.id ?? "",
                object: "auth_config",
                reverification: this.reverification,
                single_session_mode: this.singleSessionMode,
                session_minter: this.sessionMinter
              };
            }
          }
          let tQ = {
            build: (e10, t10, i10) => [
              e10,
              t10,
              i10
            ].filter(Boolean).join("-"),
            parse: (e10, t10, i10) => {
              let n10 = tQ.extractTemplate(e10, t10, i10);
              return {
                organizationId: i10,
                sessionId: t10,
                template: n10
              };
            },
            extractTemplate: (e10, t10, i10) => {
              if (e10 === t10 || i10 && e10 === `${t10}-${i10}`) return;
              let n10 = e10.slice(t10.length + 1);
              return i10 && n10.endsWith(`-${i10}`) && (n10 = n10.slice(0, -(i10.length + 1))), n10 || void 0;
            }
          };
          function tX(e10) {
            return "getRawString" in e10 ? e10.jwt : e10;
          }
          function t0(e10, t10) {
            if (null == e10) return t10;
            let i10 = tX(e10)?.header?.oiat, n10 = tX(t10)?.header?.oiat;
            return null == i10 && null == n10 ? t10 : null == n10 ? e10 : null == i10 ? t10 : i10 > n10 ? e10 : i10 < n10 ? t10 : (tX(e10)?.claims?.iat ?? 0) > (tX(t10)?.claims?.iat ?? 0) ? e10 : t10;
          }
          function t1(e10) {
            return tX(e10)?.header?.oiat;
          }
          function t3(e10) {
            return tX(e10)?.claims?.sid;
          }
          function t22(e10) {
            let t10 = tX(e10)?.claims;
            return t10?.org_id || (t10?.o?.id ?? "");
          }
          let t4 = "clerk", t6 = 10, t5 = {
            broadcast: true
          }, t8 = {
            broadcast: false
          };
          class t7 {
            prefix;
            data;
            static fromKey(e10) {
              let [t10, i10, n10 = ""] = e10.split("::");
              return new t7(t10, {
                audience: n10,
                tokenId: i10
              });
            }
            constructor(e10, t10) {
              this.prefix = e10, this.data = t10, this.prefix = e10, this.data = t10;
            }
            toKey() {
              let { tokenId: e10, audience: t10 } = this.data;
              return [
                this.prefix,
                e10,
                t10 || ""
              ].join("::");
            }
          }
          let t9 = ((e10 = t4) => {
            let t10 = /* @__PURE__ */ new Map(), i10 = Math.random().toString(36).slice(2), n10 = null, r2 = () => n10 || ("undefined" == typeof BroadcastChannel ? null : ((n10 = new BroadcastChannel("clerk:session_token")).addEventListener("message", (e11) => {
              a2(e11);
            }), n10));
            r2();
            let s2 = (i11, n11 = t6) => {
              r2();
              let s3 = new t7(e10, i11), a3 = t10.get(s3.toKey());
              if (!a3) return;
              let o3 = Math.floor(Date.now() / 1e3) - a3.createdAt;
              if (a3.expiresIn - o3 < (n11 || 1) + 5) {
                void 0 !== a3.timeoutId && clearTimeout(a3.timeoutId), t10.delete(s3.toKey());
                return;
              }
              return a3.entry;
            }, a2 = async ({ data: e11 }) => {
              let t11, n11 = tQ.build(e11.sessionId, e11.template, e11.organizationId);
              if (e11.tokenId !== n11) return void eA.warn("Ignoring token broadcast with mismatched tokenId", {
                expectedTokenId: n11,
                organizationId: e11.organizationId,
                receivedTokenId: e11.tokenId,
                tabId: i10,
                template: e11.template,
                traceId: e11.traceId
              }, "tokenCache");
              try {
                t11 = new nE({
                  id: e11.tokenId,
                  jwt: e11.tokenRaw,
                  object: "token"
                });
              } catch (t12) {
                eA.warn("Failed to parse token from broadcast, skipping cache update", {
                  error: t12,
                  tabId: i10,
                  tokenId: e11.tokenId,
                  traceId: e11.traceId
                }, "tokenCache");
                return;
              }
              let r3 = t11.jwt?.claims?.iat, a3 = t11.jwt?.claims?.exp;
              if (!r3 || !a3) return void eA.warn("Token missing iat/exp claim, skipping cache update", {
                tabId: i10,
                tokenId: e11.tokenId,
                traceId: e11.traceId
              }, "tokenCache");
              try {
                let i11 = s2({
                  tokenId: e11.tokenId
                });
                if (i11) {
                  let n12 = await i11.tokenResolver;
                  if (t0(n12, t11) === n12) return void eA.debug("Ignoring staler token broadcast", {
                    tokenId: e11.tokenId,
                    traceId: e11.traceId
                  }, "tokenCache");
                }
              } catch (t12) {
                eA.warn("Existing entry compare failed; proceeding with broadcast update", {
                  error: t12,
                  tabId: i10,
                  tokenId: e11.tokenId,
                  traceId: e11.traceId
                }, "tokenCache");
              }
              eA.info("Updating token cache from broadcast", {
                iat: r3,
                organizationId: e11.organizationId,
                tabId: i10,
                template: e11.template,
                tokenId: e11.tokenId,
                traceId: e11.traceId
              }, "tokenCache"), o2({
                createdAt: r3,
                tokenId: e11.tokenId,
                tokenResolver: Promise.resolve(t11)
              }, t8);
            }, o2 = (r3, s3 = t5) => {
              let a3 = new t7(e10, {
                audience: r3.audience,
                tokenId: r3.tokenId
              }).toKey(), o3 = Math.floor(Date.now() / 1e3), l2 = {
                createdAt: r3.createdAt ?? o3,
                entry: r3,
                expiresIn: void 0
              }, c2 = () => {
                let e11 = t10.get(a3);
                e11 === l2 && (void 0 !== e11.timeoutId && clearTimeout(e11.timeoutId), t10.delete(a3));
              };
              r3.tokenResolver.then((e11) => {
                let t11 = e11.jwt?.claims;
                if (!t11 || "number" != typeof t11.exp || "number" != typeof t11.iat) return c2();
                let a4 = t11.exp - t11.iat;
                l2.expiresIn = a4;
                let o4 = setTimeout(c2, 1e3 * a4);
                l2.timeoutId = o4, "function" == typeof o4.unref && o4.unref();
                let d2 = n10;
                if (d2 && s3.broadcast) {
                  let n11 = e11.getRawString();
                  if (n11 && t11.sid) {
                    let e12 = t11.sid, s4 = t11.org_id || t11.o?.id, a5 = tQ.extractTemplate(r3.tokenId, e12, s4), o5 = tQ.build(e12, a5, s4);
                    if (r3.tokenId === o5) {
                      let t12 = `bc_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
                      eA.info("Broadcasting token update to other tabs", {
                        organizationId: s4,
                        sessionId: e12,
                        tabId: i10,
                        template: a5,
                        tokenId: r3.tokenId,
                        traceId: t12
                      }, "tokenCache");
                      let o6 = {
                        organizationId: s4,
                        sessionId: e12,
                        template: a5,
                        tokenId: r3.tokenId,
                        tokenRaw: n11,
                        traceId: t12
                      };
                      d2.postMessage(o6);
                    }
                  }
                }
              }).catch(() => {
                c2();
              }), t10.set(a3, l2);
            };
            return {
              clear: () => {
                t10.forEach((e11) => {
                  void 0 !== e11.timeoutId && clearTimeout(e11.timeoutId);
                }), t10.clear();
              },
              close: () => {
                n10 && (n10.close(), n10 = null);
              },
              get: s2,
              set: (e11) => {
                r2(), o2(e11, t5);
              },
              size: () => t10.size
            };
          })();
          class ie extends tV {
            static instance;
            pathRoot = "/client";
            sessions = [];
            signUp = new nP();
            signIn = new nC();
            lastActiveSessionId = null;
            captchaBypass = false;
            cookieExpiresAt = null;
            lastAuthenticationStrategy = null;
            createdAt = null;
            updatedAt = null;
            static getOrCreateInstance(e10 = null) {
              return ie.instance || (ie.instance = new ie(e10)), ie.instance;
            }
            static clearInstance() {
              ie.instance = null;
            }
            static isClientResource(e10) {
              return !!e10 && e10 instanceof ie;
            }
            constructor(e10 = null) {
              super(), this.fromJSON(e10);
            }
            get signUpAttempt() {
              return this.signUp;
            }
            get signInAttempt() {
              return this.signIn;
            }
            get activeSessions() {
              return this.sessions.filter((e10) => "active" === e10.status);
            }
            get signedInSessions() {
              return this.sessions.filter((e10) => "active" === e10.status || "pending" === e10.status);
            }
            create() {
              return this._basePut();
            }
            fetch({ fetchMaxTries: e10, abortSignal: t10 } = {}) {
              return this._baseGet({
                fetchMaxTries: e10,
                abortSignal: t10
              });
            }
            async destroy() {
              return this._baseDelete({
                path: "/client"
              }).then(() => {
                t9.clear(), this.id = "", this.sessions = [], this.signUp = new nP(null), this.signIn = new nC(null), this.lastActiveSessionId = null, this.lastAuthenticationStrategy = null, this.cookieExpiresAt = null, this.createdAt = null, this.updatedAt = null;
              });
            }
            removeSessions() {
              return this._baseDelete({
                path: this.path() + "/sessions"
              }).then((e10) => (t9.clear(), e10));
            }
            clearCache() {
              return this.sessions.forEach((e10) => e10.clearCache());
            }
            isEligibleForTouch() {
              return !!this.cookieExpiresAt && this.cookieExpiresAt.getTime() - Date.now() <= 6912e5;
            }
            buildTouchUrl({ redirectUrl: e10 }) {
              return tV.fapiClient.buildUrl({
                method: "GET",
                path: "/client/touch",
                pathPrefix: "v1",
                search: {
                  redirect_url: e10.toString()
                }
              }).toString();
            }
            __internal_sendCaptchaToken(e10) {
              return this._basePostBypass({
                body: e10,
                path: this.path() + "/verify"
              });
            }
            fromJSON(e10) {
              return e10 && (this.id = e10.id, this.sessions = (e10.sessions || []).map((e11) => new np(e11)), this.signUp = new nP(e10.sign_up), this.signIn = new nC(e10.sign_in), this.lastActiveSessionId = e10.last_active_session_id, this.captchaBypass = e10.captcha_bypass || false, this.cookieExpiresAt = e10.cookie_expires_at ? tZ(e10.cookie_expires_at) : null, this.lastAuthenticationStrategy = e10.last_authentication_strategy || null, this.createdAt = tZ(e10.created_at || void 0), this.updatedAt = tZ(e10.updated_at || void 0)), this;
            }
            __internal_toSnapshot() {
              return {
                object: "client",
                id: this.id || "",
                sessions: this.sessions.map((e10) => e10.__internal_toSnapshot()),
                sign_up: this.signUp.__internal_toSnapshot(),
                sign_in: this.signIn.__internal_toSnapshot(),
                last_active_session_id: this.lastActiveSessionId,
                captcha_bypass: this.captchaBypass,
                cookie_expires_at: this.cookieExpiresAt ? this.cookieExpiresAt.getTime() : null,
                last_authentication_strategy: this.lastAuthenticationStrategy ?? null,
                created_at: this.createdAt?.getTime() ?? null,
                updated_at: this.updatedAt?.getTime() ?? null
              };
            }
            path() {
              return this.pathRoot;
            }
          }
          function it(e10) {
            let { pageSize: t10, initialPage: i10, ...n10 } = e10 || {}, r2 = t10 ?? 10;
            return new URLSearchParams({
              ...Object.entries(n10).reduce((e11, [t11, i11]) => (void 0 !== i11 && (e11[t11] = i11), e11), {}),
              limit: r2 + "",
              offset: ((i10 ?? 1) - 1) * r2 + ""
            });
          }
          class ii {
            static #T = "/billing";
            static path(e10, t10) {
              let { orgId: i10 } = t10 || {}, n10 = i10 ? `/organizations/${i10}` : "/me";
              return `${n10}${ii.#T}${e10}`;
            }
            getPlans = async (e10) => {
              let { for: t10, ...i10 } = e10 || {}, n10 = {
                ...i10,
                payer_type: "organization" === t10 ? "org" : "user"
              };
              return await tV._fetch({
                path: `${ii.#T}/plans`,
                method: "GET",
                search: it(n10)
              }).then((e11) => {
                let { data: t11, total_count: i11 } = e11;
                return {
                  total_count: i11,
                  data: t11.map((e12) => new i_(e12))
                };
              });
            };
            getPlan = async (e10) => new i_(await tV._fetch({
              path: `${ii.#T}/plans/${e10.id}`,
              method: "GET"
            }));
            getSubscription = async (e10) => await tV._fetch({
              path: ii.path("/subscription", {
                orgId: e10.orgId
              }),
              method: "GET"
            }).then((e11) => new iy(e11?.response));
            getStatements = async (e10) => {
              let { orgId: t10, ...i10 } = e10;
              return await tV._fetch({
                path: ii.path("/statements", {
                  orgId: t10
                }),
                method: "GET",
                search: it(i10)
              }).then((e11) => {
                let { data: t11, total_count: i11 } = e11?.response;
                return {
                  total_count: i11,
                  data: t11.map((e12) => new io(e12))
                };
              });
            };
            getStatement = async (e10) => new io((await tV._fetch({
              path: ii.path(`/statements/${e10.id}`, {
                orgId: e10.orgId
              }),
              method: "GET"
            }))?.response);
            getPaymentAttempts = async (e10) => {
              let { orgId: t10, ...i10 } = e10;
              return await tV._fetch({
                path: ii.path("/payment_attempts", {
                  orgId: t10
                }),
                method: "GET",
                search: it(i10)
              }).then((e11) => {
                let { data: t11, total_count: i11 } = e11;
                return {
                  total_count: i11,
                  data: t11.map((e12) => new ic(e12))
                };
              });
            };
            getPaymentAttempt = async (e10) => new ic(await tV._fetch({
              path: ii.path(`/payment_attempts/${e10.id}`, {
                orgId: e10.orgId
              }),
              method: "GET"
            }));
            startCheckout = async (e10) => {
              let { orgId: t10, ...i10 } = e10;
              return new is((await tV._fetch({
                path: ii.path("/checkouts", {
                  orgId: t10
                }),
                method: "POST",
                body: i10
              }))?.response);
            };
          }
          class ir extends tV {
            id;
            createdAt;
            updatedAt;
            imageUrl;
            userId = null;
            email;
            firstName;
            lastName;
            organizationId = null;
            organizationName;
            constructor(e10) {
              super(), this.fromJSON(e10);
            }
            fromJSON(e10) {
              return e10 && (this.id = e10.id, e10.created_at && (this.createdAt = tZ(e10.created_at)), e10.updated_at && (this.updatedAt = tZ(e10.updated_at)), this.imageUrl = e10.image_url, this.userId = e10.user_id, this.email = e10.email, this.firstName = e10.first_name, this.lastName = e10.last_name, this.organizationId = e10.organization_id, this.organizationName = e10.organization_name), this;
            }
          }
          class is extends tV {
            id;
            externalClientSecret;
            externalGatewayId;
            paymentMethod;
            plan;
            planPeriod;
            planPeriodStart;
            status;
            totals;
            isImmediatePlanChange;
            freeTrialEndsAt;
            payer;
            needsPaymentMethod;
            constructor(e10) {
              super(), this.fromJSON(e10);
            }
            fromJSON(e10) {
              return e10 && (this.id = e10.id, this.externalClientSecret = e10.external_client_secret, this.externalGatewayId = e10.external_gateway_id, this.paymentMethod = e10.payment_method ? new im(e10.payment_method) : void 0, this.plan = new i_(e10.plan), this.planPeriod = e10.plan_period, this.planPeriodStart = e10.plan_period_start, this.status = e10.status, this.totals = ex(e10.totals), this.isImmediatePlanChange = e10.is_immediate_plan_change, e10.free_trial_ends_at && (this.freeTrialEndsAt = tZ(e10.free_trial_ends_at)), this.payer = new ir(e10.payer), this.needsPaymentMethod = e10.needs_payment_method), this;
            }
            confirm = (e10) => tz(() => this._basePatch({
              path: ii.path(`/checkouts/${this.id}/confirm`, {
                orgId: this.payer.organizationId
              }),
              body: e10
            }), {
              factor: 1.1,
              maxDelayBetweenRetries: 2e3,
              initialDelay: 2e3,
              jitter: false,
              shouldRetry(e11, t10) {
                if (!S(e11) || t10 >= 4) return false;
                let i10 = e11?.status, n10 = 409 === i10 && e11.errors?.[0]?.code === "checkout_already_in_progress";
                return i10 >= 500 || n10;
              }
            });
          }
          class ia extends tV {
            id;
            name;
            description = null;
            slug;
            avatarUrl = null;
            constructor(e10) {
              super(), this.fromJSON(e10);
            }
            fromJSON(e10) {
              return e10 && (this.id = e10.id, this.name = e10.name, this.description = e10.description, this.slug = e10.slug, this.avatarUrl = e10.avatar_url), this;
            }
          }
          class io extends tV {
            id;
            status;
            timestamp;
            totals;
            groups;
            constructor(e10) {
              super(), this.fromJSON(e10);
            }
            fromJSON(e10) {
              return e10 && (this.id = e10.id, this.status = e10.status, this.timestamp = tZ(e10.timestamp), this.totals = ex(e10.totals), this.groups = e10.groups.map((e11) => new il(e11))), this;
            }
          }
          class il {
            id;
            timestamp;
            items;
            constructor(e10) {
              this.fromJSON(e10);
            }
            fromJSON(e10) {
              return e10 && (this.id = e10.id, this.timestamp = tZ(e10.timestamp), this.items = e10.items.map((e11) => new ic(e11))), this;
            }
          }
          class ic extends tV {
            id;
            amount;
            failedAt = null;
            paidAt = null;
            updatedAt;
            paymentMethod = null;
            subscriptionItem;
            chargeType;
            status;
            constructor(e10) {
              super(), this.fromJSON(e10);
            }
            fromJSON(e10) {
              return e10 && (this.id = e10.id, this.amount = eO(e10.amount), this.paidAt = e10.paid_at ? tZ(e10.paid_at) : null, this.failedAt = e10.failed_at ? tZ(e10.failed_at) : null, this.updatedAt = tZ(e10.updated_at), this.paymentMethod = e10.payment_method ? new im(e10.payment_method) : null, this.subscriptionItem = new ib(e10.subscription_item), this.chargeType = e10.charge_type, this.status = e10.status), this;
            }
          }
          let id = "/payment_methods", ih = async (e10) => {
            let { orgId: t10, ...i10 } = e10;
            return new ig((await tV._fetch({
              path: ii.path(`${id}/initialize`, {
                orgId: t10
              }),
              method: "POST",
              body: i10
            }))?.response);
          }, iu = async (e10) => {
            let { orgId: t10, ...i10 } = e10;
            return new im((await tV._fetch({
              path: ii.path(id, {
                orgId: t10
              }),
              method: "POST",
              body: i10
            }))?.response);
          }, ip = async (e10) => {
            let { orgId: t10, ...i10 } = e10 ?? {};
            return await tV._fetch({
              path: ii.path(id, {
                orgId: t10
              }),
              method: "GET",
              search: it(i10)
            }).then((e11) => {
              let { data: t11, total_count: i11 } = e11?.response;
              return {
                total_count: i11,
                data: t11.map((e12) => new im(e12))
              };
            });
          };
          class im extends tV {
            id;
            last4 = null;
            paymentType;
            cardType = null;
            isDefault;
            isRemovable;
            status;
            walletType;
            expiryYear;
            expiryMonth;
            createdAt;
            updatedAt;
            constructor(e10) {
              super(), this.fromJSON(e10);
            }
            fromJSON(e10) {
              return e10 && (this.id = e10.id, this.last4 = e10.last4, this.paymentType = e10.payment_type, this.cardType = e10.card_type, this.isDefault = e10.is_default, this.isRemovable = e10.is_removable, this.status = e10.status, this.walletType = e10.wallet_type, this.expiryYear = e10.expiry_year, this.expiryMonth = e10.expiry_month, this.createdAt = null == e10.created_at ? e10.created_at : tZ(e10.created_at), this.updatedAt = null == e10.updated_at ? e10.updated_at : tZ(e10.updated_at)), this;
            }
            async remove(e10) {
              let { orgId: t10 } = e10 ?? {};
              return new iw((await tV._fetch({
                path: ii.path(`/payment_methods/${this.id}`, {
                  orgId: t10
                }),
                method: "DELETE"
              }))?.response);
            }
            async makeDefault(e10) {
              let { orgId: t10 } = e10 ?? {};
              return await tV._fetch({
                path: ii.path("/payers/default_payment_method", {
                  orgId: t10
                }),
                method: "PUT",
                body: {
                  payment_method_id: this.id
                }
              }), null;
            }
          }
          class ig extends tV {
            externalClientSecret;
            externalGatewayId;
            paymentMethodOrder;
            constructor(e10) {
              super(), this.fromJSON(e10);
            }
            fromJSON(e10) {
              return e10 && (this.externalClientSecret = e10.external_client_secret, this.externalGatewayId = e10.external_gateway_id, this.paymentMethodOrder = e10.payment_method_order ?? [
                "card"
              ]), this;
            }
          }
          class i_ extends tV {
            id;
            name;
            fee;
            annualFee = null;
            annualMonthlyFee = null;
            description = null;
            isDefault;
            isRecurring;
            hasBaseFee;
            forPayerType;
            publiclyVisible;
            slug;
            avatarUrl = null;
            features;
            freeTrialDays;
            freeTrialEnabled;
            constructor(e10) {
              super(), this.fromJSON(e10);
            }
            fromJSON(e10) {
              return e10 && (this.id = e10.id, this.name = e10.name, this.fee = eO(e10.fee), this.annualFee = e10.annual_fee ? eO(e10.annual_fee) : null, this.annualMonthlyFee = e10.annual_monthly_fee ? eO(e10.annual_monthly_fee) : null, this.description = e10.description, this.isDefault = e10.is_default, this.isRecurring = e10.is_recurring, this.hasBaseFee = e10.has_base_fee, this.forPayerType = e10.for_payer_type, this.publiclyVisible = e10.publicly_visible, this.slug = e10.slug, this.avatarUrl = e10.avatar_url, this.freeTrialDays = this.withDefault(e10.free_trial_days, null), this.freeTrialEnabled = this.withDefault(e10.free_trial_enabled, false), this.features = (e10.features || []).map((e11) => new ia(e11))), this;
            }
          }
          class iy extends tV {
            id;
            status;
            activeAt;
            createdAt;
            pastDueAt;
            updatedAt;
            nextPayment;
            subscriptionItems;
            eligibleForFreeTrial;
            constructor(e10) {
              super(), this.fromJSON(e10);
            }
            fromJSON(e10) {
              return e10 && (this.id = e10.id, this.status = e10.status, this.createdAt = tZ(e10.created_at), this.updatedAt = e10.updated_at ? tZ(e10.updated_at) : null, this.activeAt = tZ(e10.active_at), this.pastDueAt = e10.past_due_at ? tZ(e10.past_due_at) : null, e10.next_payment && (this.nextPayment = {
                amount: eO(e10.next_payment.amount),
                date: tZ(e10.next_payment.date)
              }), this.subscriptionItems = (e10.subscription_items || []).map((e11) => new ib(e11)), this.eligibleForFreeTrial = this.withDefault(e10.eligible_for_free_trial, false)), this;
            }
          }
          class ib extends tV {
            id;
            plan;
            planPeriod;
            status;
            createdAt;
            periodStart;
            periodEnd;
            canceledAt;
            pastDueAt;
            amount;
            credit;
            credits;
            isFreeTrial;
            constructor(e10) {
              super(), this.fromJSON(e10);
            }
            fromJSON(e10) {
              return e10 && (this.id = e10.id, this.plan = new i_(e10.plan), this.planPeriod = e10.plan_period, this.status = e10.status, this.createdAt = tZ(e10.created_at), this.pastDueAt = e10.past_due_at ? tZ(e10.past_due_at) : null, this.periodStart = tZ(e10.period_start), this.periodEnd = e10.period_end ? tZ(e10.period_end) : null, this.canceledAt = e10.canceled_at ? tZ(e10.canceled_at) : null, this.amount = e10.amount ? eO(e10.amount) : void 0, this.credit = e10.credit && e10.credit.amount ? {
                amount: eO(e10.credit.amount)
              } : void 0, this.credits = e10.credits ? eE(e10.credits) : void 0, this.isFreeTrial = this.withDefault(e10.is_free_trial, false)), this;
            }
            async cancel(e10) {
              let { orgId: t10 } = e10;
              return new iw((await tV._fetch({
                path: ii.path(`/subscription_items/${this.id}`, {
                  orgId: t10
                }),
                method: "DELETE"
              }))?.response);
            }
          }
          class iw {
            object = "";
            id;
            slug;
            deleted = false;
            constructor(e10) {
              this.fromJSON(e10);
            }
            fromJSON(e10) {
              return e10 && (this.object = e10.object, this.id = e10.id, this.slug = e10.slug, this.deleted = e10.deleted), this;
            }
          }
          class iv extends tV {
            afterCreateOrganizationUrl = "";
            afterJoinWaitlistUrl = "";
            afterLeaveOrganizationUrl = "";
            afterSignInUrl = "";
            afterSignOutAllUrl = "";
            afterSignOutOneUrl = "";
            afterSignOutUrl = "";
            afterSignUpUrl = "";
            afterSwitchSessionUrl = "";
            applicationName = "";
            backendHost = "";
            branded = false;
            captchaHeartbeat = false;
            captchaHeartbeatIntervalMs;
            captchaOauthBypass = [
              "oauth_google",
              "oauth_microsoft",
              "oauth_apple"
            ];
            captchaProvider = "turnstile";
            captchaPublicKey = null;
            captchaPublicKeyInvisible = null;
            captchaWidgetType = null;
            clerkJSVersion;
            createOrganizationUrl = "";
            experimental__forceOauthFirst;
            faviconImageUrl = "";
            googleOneTapClientId;
            homeUrl = "";
            id = "";
            instanceEnvironmentType = "";
            logoImageUrl = "";
            organizationProfileUrl = "";
            preferredSignInStrategy = "password";
            privacyPolicyUrl = "";
            showDevModeWarning = false;
            signInUrl = "";
            signUpUrl = "";
            supportEmail = "";
            termsUrl = "";
            theme = {};
            userProfileUrl = "";
            waitlistUrl = "";
            constructor(e10 = null) {
              super(), this.fromJSON(e10);
            }
            fromJSON(e10) {
              return e10 && (this.afterCreateOrganizationUrl = this.withDefault(e10.after_create_organization_url, this.afterCreateOrganizationUrl), this.afterJoinWaitlistUrl = this.withDefault(e10.after_join_waitlist_url, this.afterJoinWaitlistUrl), this.afterLeaveOrganizationUrl = this.withDefault(e10.after_leave_organization_url, this.afterLeaveOrganizationUrl), this.afterSignInUrl = this.withDefault(e10.after_sign_in_url, this.afterSignInUrl), this.afterSignOutAllUrl = this.withDefault(e10.after_sign_out_all_url, this.afterSignOutAllUrl), this.afterSignOutOneUrl = this.withDefault(e10.after_sign_out_one_url, this.afterSignOutOneUrl), this.afterSignUpUrl = this.withDefault(e10.after_sign_up_url, this.afterSignUpUrl), this.afterSwitchSessionUrl = this.withDefault(e10.after_switch_session_url, this.afterSwitchSessionUrl), this.applicationName = this.withDefault(e10.application_name, this.applicationName), this.branded = this.withDefault(e10.branded, this.branded), this.captchaHeartbeat = this.withDefault(e10.captcha_heartbeat, this.captchaHeartbeat), this.captchaHeartbeatIntervalMs = this.withDefault(e10.captcha_heartbeat_interval_ms, this.captchaHeartbeatIntervalMs), this.captchaOauthBypass = this.withDefault(e10.captcha_oauth_bypass, this.captchaOauthBypass), this.captchaProvider = this.withDefault(e10.captcha_provider, this.captchaProvider), this.captchaPublicKey = this.withDefault(e10.captcha_public_key, this.captchaPublicKey), this.captchaPublicKeyInvisible = this.withDefault(e10.captcha_public_key_invisible, this.captchaPublicKeyInvisible), this.captchaWidgetType = this.withDefault(e10.captcha_widget_type, this.captchaWidgetType), this.clerkJSVersion = this.withDefault(e10.clerk_js_version, this.clerkJSVersion), this.createOrganizationUrl = this.withDefault(e10.create_organization_url, this.createOrganizationUrl), this.faviconImageUrl = this.withDefault(e10.favicon_image_url, this.faviconImageUrl), this.googleOneTapClientId = this.withDefault(e10.google_one_tap_client_id, this.googleOneTapClientId), this.homeUrl = this.withDefault(e10.home_url, this.homeUrl), this.id = this.withDefault(e10.id, this.id), this.instanceEnvironmentType = this.withDefault(e10.instance_environment_type, this.instanceEnvironmentType), this.logoImageUrl = this.withDefault(e10.logo_image_url, this.logoImageUrl), this.organizationProfileUrl = this.withDefault(e10.organization_profile_url, this.organizationProfileUrl), this.preferredSignInStrategy = this.withDefault(e10.preferred_sign_in_strategy, this.preferredSignInStrategy), this.privacyPolicyUrl = this.withDefault(e10.privacy_policy_url, this.privacyPolicyUrl), this.showDevModeWarning = this.withDefault(e10.show_devmode_warning, this.showDevModeWarning), this.signInUrl = this.withDefault(e10.sign_in_url, this.signInUrl), this.signUpUrl = this.withDefault(e10.sign_up_url, this.signUpUrl), this.supportEmail = this.withDefault(e10.support_email, this.supportEmail), this.termsUrl = this.withDefault(e10.terms_url, this.termsUrl), this.theme = this.withDefault(e10.theme, this.theme), this.userProfileUrl = this.withDefault(e10.user_profile_url, this.userProfileUrl), this.waitlistUrl = this.withDefault(e10.waitlist_url, this.waitlistUrl)), this;
            }
            __internal_toSnapshot() {
              return {
                object: "display_config",
                after_create_organization_url: this.afterCreateOrganizationUrl,
                after_join_waitlist_url: this.afterJoinWaitlistUrl,
                after_leave_organization_url: this.afterLeaveOrganizationUrl,
                after_sign_in_url: this.afterSignInUrl,
                after_sign_out_all_url: this.afterSignOutAllUrl,
                after_sign_out_one_url: this.afterSignOutOneUrl,
                after_sign_up_url: this.afterSignUpUrl,
                after_switch_session_url: this.afterSwitchSessionUrl,
                application_name: this.applicationName,
                branded: this.branded,
                captcha_heartbeat_interval_ms: this.captchaHeartbeatIntervalMs,
                captcha_heartbeat: this.captchaHeartbeat,
                captcha_oauth_bypass: this.captchaOauthBypass,
                captcha_provider: this.captchaProvider,
                captcha_public_key_invisible: this.captchaPublicKeyInvisible,
                captcha_public_key: this.captchaPublicKey,
                captcha_widget_type: this.captchaWidgetType,
                clerk_js_version: this.clerkJSVersion,
                create_organization_url: this.createOrganizationUrl,
                favicon_image_url: this.faviconImageUrl,
                google_one_tap_client_id: this.googleOneTapClientId,
                home_url: this.homeUrl,
                id: this.id,
                instance_environment_type: this.instanceEnvironmentType,
                logo_image_url: this.logoImageUrl,
                organization_profile_url: this.organizationProfileUrl,
                preferred_sign_in_strategy: this.preferredSignInStrategy,
                privacy_policy_url: this.privacyPolicyUrl,
                show_devmode_warning: this.showDevModeWarning,
                sign_in_url: this.signInUrl,
                sign_up_url: this.signUpUrl,
                support_email: this.supportEmail,
                terms_url: this.termsUrl,
                theme: this.theme,
                user_profile_url: this.userProfileUrl,
                waitlist_url: this.waitlistUrl
              };
            }
          }
          var ik = i2(5851), iS = 'const respond=r=>{self.postMessage(r)},workerToTabIds={};self.addEventListener("message",r=>{const e=r.data;switch(e.type){case"setTimeout":workerToTabIds[e.id]=setTimeout(()=>{respond({id:e.id}),delete workerToTabIds[e.id]},e.ms);break;case"clearTimeout":workerToTabIds[e.id]&&(clearTimeout(workerToTabIds[e.id]),delete workerToTabIds[e.id]);break;case"setInterval":workerToTabIds[e.id]=setInterval(()=>{respond({id:e.id})},e.ms);break;case"clearInterval":workerToTabIds[e.id]&&(clearInterval(workerToTabIds[e.id]),delete workerToTabIds[e.id]);break}});\n';
          let iC = (e10, t10 = {}) => {
            if ("undefined" == typeof Worker) return null;
            try {
              let i10 = new Blob([
                e10
              ], {
                type: "application/javascript; charset=utf-8"
              }), n10 = globalThis.URL.createObjectURL(i10);
              return new Worker(n10, t10);
            } catch {
              return console.warn("Clerk: Cannot create worker from blob. Consider adding worker-src blob:; to your CSP"), null;
            }
          }, iA = () => {
            let e10 = 0, t10 = () => e10++, i10 = /* @__PURE__ */ new Map(), n10 = (e11, t11) => e11?.postMessage(t11), r2 = (e11) => {
              i10.get(e11.data.id)?.();
            }, s2 = iC(iS, {
              name: "clerk-timers"
            });
            if (s2?.addEventListener("message", r2), !s2) return {
              setTimeout: globalThis.setTimeout.bind(globalThis),
              setInterval: globalThis.setInterval.bind(globalThis),
              clearTimeout: globalThis.clearTimeout.bind(globalThis),
              clearInterval: globalThis.clearInterval.bind(globalThis),
              cleanup: ik.Z
            };
            let a2 = () => {
              s2 || (s2 = iC(iS, {
                name: "clerk-timers"
              }), s2?.addEventListener("message", r2));
            };
            return {
              setTimeout: (e11, r3) => {
                a2();
                let o2 = t10();
                return i10.set(o2, () => {
                  e11(), i10.delete(o2);
                }), n10(s2, {
                  type: "setTimeout",
                  id: o2,
                  ms: r3
                }), o2;
              },
              setInterval: (e11, r3) => {
                a2();
                let o2 = t10();
                return i10.set(o2, e11), n10(s2, {
                  type: "setInterval",
                  id: o2,
                  ms: r3
                }), o2;
              },
              clearTimeout: (e11) => {
                a2(), i10.delete(e11), n10(s2, {
                  type: "clearTimeout",
                  id: e11
                });
              },
              clearInterval: (e11) => {
                a2(), i10.delete(e11), n10(s2, {
                  type: "clearInterval",
                  id: e11
                });
              },
              cleanup: () => {
                s2 && (s2.terminate(), s2 = null, i10.clear());
              }
            };
          };
          function iU({ delayInMs: e10 } = {
            delayInMs: 1e3
          }) {
            let t10, i10 = iA(), n10 = false, r2 = () => {
              t10 && (i10.clearTimeout(t10), i10.cleanup()), n10 = true;
            }, s2 = async (a2) => {
              n10 = false, await a2(r2), n10 || (t10 = i10.setTimeout(() => {
                s2(a2);
              }, e10));
            };
            return {
              run: s2,
              stop: r2
            };
          }
          class iI extends tV {
            id;
            emailAddress = "";
            matchesSsoConnection = false;
            linkedTo = [];
            verification;
            constructor(e10, t10) {
              super(), this.pathRoot = t10, this.fromJSON(e10);
            }
            create() {
              return this._basePost({
                body: {
                  email_address: this.emailAddress
                }
              });
            }
            prepareVerification = (e10) => this._basePost({
              action: "prepare_verification",
              body: {
                ...e10
              }
            });
            attemptVerification = (e10) => {
              let { code: t10 } = e10 || {};
              return this._basePost({
                action: "attempt_verification",
                body: {
                  code: t10
                }
              });
            };
            createEmailLinkFlow = () => {
              let { run: e10, stop: t10 } = iU();
              return {
                startEmailLinkFlow: async ({ redirectUrl: i10 }) => (await this.prepareVerification({
                  strategy: "email_link",
                  redirectUrl: i10
                }), new Promise((i11, n10) => {
                  e10(() => this.reload().then((e11) => {
                    "verified" === e11.verification.status && (t10(), i11(e11));
                  }).catch((e11) => {
                    t10(), n10(e11);
                  }));
                })),
                cancelEmailLinkFlow: t10
              };
            };
            createEnterpriseSSOLinkFlow = () => {
              let { run: e10, stop: t10 } = iU();
              return {
                startEnterpriseSSOLinkFlow: async ({ redirectUrl: i10 }) => {
                  if (!(await this.prepareVerification({
                    strategy: "enterprise_sso",
                    redirectUrl: i10
                  })).verification.externalVerificationRedirectURL) throw Error("Unexpected: External verification redirect URL is missing");
                  return new Promise((i11, n10) => {
                    e10(() => this.reload().then((e11) => {
                      "verified" === e11.verification.status && (t10(), i11(e11));
                    }).catch((e11) => {
                      t10(), n10(e11);
                    }));
                  });
                },
                cancelEnterpriseSSOLinkFlow: t10
              };
            };
            destroy = () => this._baseDelete();
            toString = () => this.emailAddress;
            fromJSON(e10) {
              return e10 && (this.id = e10.id, this.emailAddress = e10.email_address, this.verification = new iV(e10.verification), this.matchesSsoConnection = e10.matches_sso_connection, this.linkedTo = (e10.linked_to || []).map((e11) => new iX(e11))), this;
            }
            __internal_toSnapshot() {
              return {
                object: "email_address",
                id: this.id,
                email_address: this.emailAddress,
                verification: this.verification.__internal_toSnapshot(),
                linked_to: this.linkedTo.map((e10) => e10.__internal_toSnapshot()),
                matches_sso_connection: this.matchesSsoConnection
              };
            }
          }
          let iP = "token:update", iT = "user:signOut", iO = "environment:update", iE = "session:tokenResolved", ix = f();
          class iR extends tV {
            user_api_keys_enabled = false;
            orgs_api_keys_enabled = false;
            constructor(e10 = null) {
              super(), this.fromJSON(e10);
            }
            fromJSON(e10) {
              return e10 && (this.user_api_keys_enabled = e10.user_api_keys_enabled, this.orgs_api_keys_enabled = e10.orgs_api_keys_enabled), this;
            }
            __internal_toSnapshot() {
              return {
                user_api_keys_enabled: this.user_api_keys_enabled,
                orgs_api_keys_enabled: this.orgs_api_keys_enabled
              };
            }
          }
          class iz extends tV {
            actions = {
              adminDelete: false
            };
            domains = {
              enabled: false,
              enrollmentModes: [],
              defaultRole: null
            };
            slug = {
              disabled: false
            };
            organizationCreationDefaults = {
              enabled: false
            };
            enabled = false;
            maxAllowedMemberships = 1;
            forceOrganizationSelection;
            constructor(e10 = null) {
              super(), this.fromJSON(e10);
            }
            fromJSON(e10) {
              return e10 && (e10.actions && (this.actions.adminDelete = this.withDefault(e10.actions.admin_delete, this.actions.adminDelete)), e10.domains && (this.domains.enabled = this.withDefault(e10.domains.enabled, this.domains.enabled), this.domains.enrollmentModes = this.withDefault(e10.domains.enrollment_modes, this.domains.enrollmentModes), this.domains.defaultRole = this.withDefault(e10.domains.default_role, this.domains.defaultRole)), e10.slug && (this.slug.disabled = this.withDefault(e10.slug.disabled, this.slug.disabled)), e10.organization_creation_defaults && (this.organizationCreationDefaults.enabled = this.withDefault(e10.organization_creation_defaults.enabled, this.organizationCreationDefaults.enabled)), this.enabled = this.withDefault(e10.enabled, this.enabled), this.maxAllowedMemberships = this.withDefault(e10.max_allowed_memberships, this.maxAllowedMemberships), this.forceOrganizationSelection = this.withDefault(e10.force_organization_selection, this.forceOrganizationSelection)), this;
            }
            __internal_toSnapshot() {
              return {
                actions: {
                  admin_delete: this.actions.adminDelete
                },
                domains: {
                  enabled: this.domains.enabled,
                  enrollment_modes: this.domains.enrollmentModes,
                  default_role: this.domains.defaultRole
                },
                enabled: this.enabled,
                max_allowed_memberships: this.maxAllowedMemberships
              };
            }
          }
          class iM extends tV {
            static instance;
            authConfig = new tY();
            displayConfig = new iv();
            maintenanceMode = false;
            clientDebugMode = false;
            partitionedCookies = false;
            pathRoot = "/environment";
            userSettings = new tH();
            organizationSettings = new iz();
            commerceSettings = new tG();
            apiKeysSettings = new iR();
            protectConfig = new nm();
            static getInstance() {
              return iM.instance || (iM.instance = new iM()), iM.instance;
            }
            constructor(e10 = null) {
              super(), this.fromJSON(e10);
            }
            fromJSON(e10) {
              return e10 && (this.authConfig = new tY(e10.auth_config), this.displayConfig = new iv(e10.display_config), this.maintenanceMode = this.withDefault(e10.maintenance_mode, this.maintenanceMode), this.clientDebugMode = this.withDefault(e10.client_debug_mode, this.clientDebugMode), this.partitionedCookies = this.withDefault(e10.partitioned_cookies, this.partitionedCookies), this.organizationSettings = new iz(e10.organization_settings), this.userSettings = new tH(e10.user_settings), this.commerceSettings = new tG(e10.commerce_settings), this.apiKeysSettings = new iR(e10.api_keys_settings), this.protectConfig = new nm(e10.protect_config)), this;
            }
            fetch({ touch: e10, fetchMaxTries: t10 } = {
              touch: false
            }) {
              return (e10 ? this._basePatch({}) : this._baseGet({
                fetchMaxTries: t10
              })).then((e11) => (ix.emit(iO, null), e11));
            }
            isDevelopmentOrStaging = () => !this.isProduction();
            isProduction = () => "production" === this.displayConfig.instanceEnvironmentType;
            isSingleSession = () => this.authConfig.singleSessionMode;
            onWindowLocationHost = () => this.displayConfig.backendHost === window.location.host;
            __internal_toSnapshot() {
              return {
                object: "environment",
                auth_config: this.authConfig.__internal_toSnapshot(),
                display_config: this.displayConfig.__internal_toSnapshot(),
                id: this.id ?? "",
                maintenance_mode: this.maintenanceMode,
                client_debug_mode: this.clientDebugMode,
                partitioned_cookies: this.partitionedCookies,
                organization_settings: this.organizationSettings.__internal_toSnapshot(),
                user_settings: this.userSettings.__internal_toSnapshot(),
                commerce_settings: this.commerceSettings.__internal_toSnapshot(),
                api_keys_settings: this.apiKeysSettings.__internal_toSnapshot(),
                protect_config: this.protectConfig.__internal_toSnapshot()
              };
            }
          }
          class iN {
            static encode(e10) {
              return btoa(String.fromCharCode(...new Uint8Array(e10))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
            }
            static decode(e10) {
              let t10 = atob(e10.replace(/-/g, "+").replace(/_/g, "/")), i10 = t10.length, n10 = new Uint8Array(i10);
              for (let e11 = 0; e11 < i10; e11++) n10[e11] = t10.charCodeAt(e11);
              return n10.buffer;
            }
          }
          async function iF(e10) {
            try {
              let t11 = await navigator.credentials.create({
                publicKey: e10
              });
              if (!t11) return {
                error: new E("Browser failed to create credential", {
                  code: "passkey_registration_failed"
                }),
                publicKeyCredential: null
              };
              return {
                publicKeyCredential: t11,
                error: null
              };
            } catch (e11) {
              var t10;
              return {
                error: "InvalidStateError" === (t10 = e11).name ? new E(t10.message, {
                  code: "passkey_already_exists"
                }) : "NotAllowedError" === t10.name ? new E(t10.message, {
                  code: "passkey_registration_cancelled"
                }) : iL(t10),
                publicKeyCredential: null
              };
            }
          }
          let iD = new class {
            controller;
            __abort() {
              if (!this.controller) return;
              let e10 = Error();
              e10.name = "AbortError", this.controller.abort(e10);
            }
            createAbortSignal() {
              this.__abort();
              let e10 = new AbortController();
              return this.controller = e10, e10.signal;
            }
            abort() {
              this.__abort(), this.controller = void 0;
            }
          }();
          async function iW({ publicKeyOptions: e10, conditionalUI: t10 }) {
            try {
              let i11 = await navigator.credentials.get({
                publicKey: e10,
                mediation: t10 ? "conditional" : "optional",
                signal: iD.createAbortSignal()
              });
              if (!i11) return {
                error: new E("Browser failed to get credential", {
                  code: "passkey_retrieval_failed"
                }),
                publicKeyCredential: null
              };
              return {
                publicKeyCredential: i11,
                error: null
              };
            } catch (e11) {
              var i10;
              return {
                error: "NotAllowedError" === (i10 = e11).name ? new E(i10.message, {
                  code: "passkey_retrieval_cancelled"
                }) : iL(i10),
                publicKeyCredential: null
              };
            }
          }
          function iL(e10) {
            return "AbortError" === e10.name ? new E(e10.message, {
              code: "passkey_operation_aborted"
            }) : "SecurityError" === e10.name ? new E(e10.message, {
              code: "passkey_invalid_rpID_or_domain"
            }) : e10;
          }
          function i$(e10) {
            let t10 = iB(e10.challenge), i10 = (e10.allowCredentials || []).map((e11) => ({
              ...e11,
              id: iB(e11.id)
            }));
            return {
              ...e10,
              allowCredentials: i10,
              challenge: t10
            };
          }
          function ij(e10) {
            return {
              type: e10.type,
              id: e10.id,
              rawId: iK(e10.rawId),
              authenticatorAttachment: e10.authenticatorAttachment
            };
          }
          function iJ(e10) {
            let t10 = e10.response;
            return {
              ...ij(e10),
              response: {
                clientDataJSON: iK(t10.clientDataJSON),
                authenticatorData: iK(t10.authenticatorData),
                signature: iK(t10.signature),
                userHandle: t10.userHandle ? iK(t10.userHandle) : null
              }
            };
          }
          let iK = iN.encode.bind(iN), iB = iN.decode.bind(iN);
          class iV extends tV {
            pathRoot = "";
            status = null;
            strategy = null;
            nonce = null;
            message = null;
            externalVerificationRedirectURL = null;
            attempts = null;
            expireAt = null;
            error = null;
            verifiedAtClient = null;
            channel;
            constructor(e10) {
              super(), this.fromJSON(e10);
            }
            verifiedFromTheSameClient = () => this.verifiedAtClient === tV.clerk?.client?.id;
            fromJSON(e10) {
              return e10 && (this.status = e10.status, this.verifiedAtClient = e10.verified_at_client, this.strategy = e10.strategy, this.nonce = e10.nonce || null, this.message = e10.message || null, e10.external_verification_redirect_url ? this.externalVerificationRedirectURL = new URL(e10.external_verification_redirect_url) : this.externalVerificationRedirectURL = null, this.attempts = e10.attempts, this.expireAt = tZ(e10.expire_at || void 0), this.error = e10.error ? new w(e10.error) : null, this.channel = e10.channel || void 0), this;
            }
            __internal_toSnapshot() {
              var e10;
              return {
                object: "verification",
                id: this.id || "",
                status: this.status,
                strategy: this.strategy,
                nonce: this.nonce,
                message: this.message,
                external_verification_redirect_url: this.externalVerificationRedirectURL?.toString() || null,
                attempts: this.attempts,
                expire_at: this.expireAt?.getTime() || null,
                error: (e10 = this.error, {
                  code: e10?.code || "",
                  message: e10?.message || "",
                  long_message: e10?.longMessage,
                  meta: {
                    param_name: e10?.meta?.paramName,
                    session_id: e10?.meta?.sessionId,
                    email_addresses: e10?.meta?.emailAddresses,
                    identifiers: e10?.meta?.identifiers,
                    zxcvbn: e10?.meta?.zxcvbn,
                    plan: e10?.meta?.plan,
                    is_plan_upgrade_possible: e10?.meta?.isPlanUpgradePossible
                  }
                }),
                verified_at_client: this.verifiedAtClient
              };
            }
          }
          class iq extends iV {
            publicKey = null;
            constructor(e10) {
              super(e10), this.fromJSON(e10);
            }
            fromJSON(e10) {
              return super.fromJSON(e10), e10?.nonce && (this.publicKey = function(e11) {
                let t10 = iB(e11.user.id), i10 = iB(e11.challenge), n10 = (e11.excludeCredentials || []).map((e12) => ({
                  ...e12,
                  id: iB(e12.id)
                }));
                return {
                  ...e11,
                  excludeCredentials: n10,
                  challenge: i10,
                  user: {
                    ...e11.user,
                    id: t10
                  }
                };
              }(JSON.parse(e10.nonce))), this;
            }
          }
          class iH {
            emailAddress;
            phoneNumber;
            web3Wallet;
            externalAccount;
            constructor(e10) {
              e10 ? (this.emailAddress = new iG(e10.email_address), this.phoneNumber = new iG(e10.phone_number), this.web3Wallet = new iG(e10.web3_wallet), this.externalAccount = new iV(e10.external_account)) : (this.emailAddress = new iG(null), this.phoneNumber = new iG(null), this.web3Wallet = new iG(null), this.externalAccount = new iV(null));
            }
            __internal_toSnapshot() {
              return {
                email_address: this.emailAddress.__internal_toSnapshot(),
                phone_number: this.phoneNumber.__internal_toSnapshot(),
                web3_wallet: this.web3Wallet.__internal_toSnapshot(),
                external_account: this.externalAccount.__internal_toSnapshot()
              };
            }
          }
          class iG extends iV {
            nextAction;
            supportedStrategies;
            constructor(e10) {
              super(e10), e10 ? (this.nextAction = e10.next_action, this.supportedStrategies = e10.supported_strategies) : (this.nextAction = "", this.supportedStrategies = []);
            }
            __internal_toSnapshot() {
              return {
                ...super.__internal_toSnapshot(),
                next_action: this.nextAction,
                supported_strategies: this.supportedStrategies
              };
            }
          }
          class iZ extends tV {
            id;
            identificationId;
            provider;
            providerUserId = "";
            emailAddress = "";
            approvedScopes = "";
            firstName = "";
            lastName = "";
            imageUrl = "";
            username = "";
            phoneNumber = "";
            publicMetadata = {};
            label = "";
            verification = null;
            constructor(e10, t10) {
              super(), this.pathRoot = t10, this.fromJSON(e10);
            }
            reauthorize = (e10) => {
              let { additionalScopes: t10, redirectUrl: i10 } = e10 || {};
              return this._basePatch({
                action: "reauthorize",
                body: {
                  additional_scope: t10,
                  redirect_url: i10
                }
              });
            };
            destroy = () => this._baseDelete();
            fromJSON(e10) {
              return e10 && (this.id = e10.id, this.identificationId = e10.identification_id, this.providerUserId = e10.provider_user_id, this.approvedScopes = e10.approved_scopes, this.imageUrl = e10.image_url, this.emailAddress = e10.email_address, this.firstName = e10.first_name, this.lastName = e10.last_name, this.provider = (e10.provider || "").replace("oauth_", ""), this.username = e10.username, this.phoneNumber = e10.phone_number, this.publicMetadata = e10.public_metadata, this.label = e10.label, e10.verification && (this.verification = new iV(e10.verification))), this;
            }
            __internal_toSnapshot() {
              return {
                object: "external_account",
                id: this.id,
                identification_id: this.identificationId,
                provider: this.provider,
                provider_user_id: this.providerUserId,
                email_address: this.emailAddress,
                approved_scopes: this.approvedScopes,
                first_name: this.firstName,
                last_name: this.lastName,
                image_url: this.imageUrl,
                username: this.username,
                phone_number: this.phoneNumber,
                public_metadata: this.publicMetadata,
                label: this.label,
                verification: this.verification?.__internal_toSnapshot() || null
              };
            }
            providerSlug() {
              return this.provider;
            }
            providerTitle() {
              return [
                function(e10) {
                  let t10 = e10 || "";
                  return t10.charAt(0).toUpperCase() + t10.slice(1);
                }(this.providerSlug()),
                "Account"
              ].join(" ");
            }
            accountIdentifier() {
              return this.username || this.emailAddress || this.label;
            }
          }
          class iY extends tV {
            id;
            protocol;
            provider;
            providerUserId = null;
            active;
            emailAddress = "";
            firstName = "";
            lastName = "";
            publicMetadata = {};
            verification = null;
            enterpriseConnection = null;
            lastAuthenticatedAt = null;
            enterpriseConnectionId = null;
            constructor(e10, t10) {
              super(), this.pathRoot = t10, this.fromJSON(e10);
            }
            fromJSON(e10) {
              return e10 && (this.id = e10.id, this.provider = e10.provider, this.protocol = e10.protocol, this.providerUserId = e10.provider_user_id, this.active = e10.active, this.emailAddress = e10.email_address, this.firstName = e10.first_name, this.lastName = e10.last_name, this.publicMetadata = e10.public_metadata, this.lastAuthenticatedAt = e10.last_authenticated_at ? tZ(e10.last_authenticated_at) : null, this.enterpriseConnectionId = e10.enterprise_connection_id, e10.verification && (this.verification = new iV(e10.verification)), e10.enterprise_connection && (this.enterpriseConnection = new iQ(e10.enterprise_connection))), this;
            }
            __internal_toSnapshot() {
              return {
                object: "enterprise_account",
                id: this.id,
                provider: this.provider,
                protocol: this.protocol,
                provider_user_id: this.providerUserId,
                active: this.active,
                email_address: this.emailAddress,
                first_name: this.firstName,
                last_name: this.lastName,
                public_metadata: this.publicMetadata,
                verification: this.verification?.__internal_toSnapshot() || null,
                enterprise_connection: this.enterpriseConnection?.__internal_toSnapshot() || null,
                last_authenticated_at: this.lastAuthenticatedAt ? this.lastAuthenticatedAt.getTime() : null,
                enterprise_connection_id: this.enterpriseConnectionId
              };
            }
          }
          class iQ extends tV {
            id;
            active;
            allowIdpInitiated;
            allowSubdomains;
            disableAdditionalIdentifications;
            domain;
            logoPublicUrl = "";
            name;
            protocol;
            provider;
            syncUserAttributes;
            createdAt;
            updatedAt;
            enterpriseConnectionId = "";
            constructor(e10) {
              super(), this.fromJSON(e10);
            }
            fromJSON(e10) {
              return e10 && (this.id = e10.id, this.name = e10.name, this.domain = e10.domain, this.active = e10.active, this.provider = e10.provider, this.logoPublicUrl = e10.logo_public_url, this.syncUserAttributes = e10.sync_user_attributes, this.allowSubdomains = e10.allow_subdomains, this.allowIdpInitiated = e10.allow_idp_initiated, this.disableAdditionalIdentifications = e10.disable_additional_identifications, this.createdAt = tZ(e10.created_at), this.updatedAt = tZ(e10.updated_at), this.enterpriseConnectionId = e10.enterprise_connection_id), this;
            }
            __internal_toSnapshot() {
              return {
                object: "enterprise_account_connection",
                id: this.id,
                name: this.name,
                domain: this.domain,
                active: this.active,
                protocol: this.protocol,
                provider: this.provider,
                logo_public_url: this.logoPublicUrl,
                sync_user_attributes: this.syncUserAttributes,
                allow_subdomains: this.allowSubdomains,
                allow_idp_initiated: this.allowIdpInitiated,
                disable_additional_identifications: this.disableAdditionalIdentifications,
                enterprise_connection_id: this.enterpriseConnectionId,
                created_at: this.createdAt.getTime(),
                updated_at: this.updatedAt.getTime()
              };
            }
          }
          class iX extends tV {
            id;
            type;
            constructor(e10) {
              super(), this.fromJSON(e10);
            }
            fromJSON(e10) {
              return e10 && (this.id = e10.id, this.type = e10.type), this;
            }
            __internal_toSnapshot() {
              return {
                object: "identification_link",
                id: this.id,
                type: this.type
              };
            }
          }
          class i0 extends tV {
            id;
            name = null;
            publicUrl = null;
            static async create(e10, t10 = {}) {
              let i10, n10 = t10;
              return "string" == typeof t10.file ? (n10 = t10.file, i10 = new Headers({
                "Content-Type": "application/octet-stream"
              })) : t10.file && (n10 = new FormData()).append("file", t10.file), new i0((await tV._fetch({
                path: e10,
                method: "POST",
                body: n10,
                headers: i10
              }))?.response);
            }
            static async delete(e10) {
              return new i0((await tV._fetch({
                path: e10,
                method: "DELETE"
              }))?.response);
            }
            constructor(e10) {
              super(), this.fromJSON(e10);
            }
            fromJSON(e10) {
              return e10 && (this.id = e10.id, this.name = e10.name, this.publicUrl = e10.public_url), this;
            }
          }
          class i1 extends tV {
            id;
            phoneNumber = "";
            reservedForSecondFactor = false;
            defaultSecondFactor = false;
            linkedTo = [];
            verification;
            backupCodes;
            constructor(e10, t10) {
              super(), this.pathRoot = t10, this.fromJSON(e10);
            }
            create = () => this._basePost({
              body: {
                phone_number: this.phoneNumber
              }
            });
            prepareVerification = () => this._basePost({
              action: "prepare_verification",
              body: {
                strategy: "phone_code"
              }
            });
            attemptVerification = (e10) => {
              let { code: t10 } = e10 || {};
              return this._basePost({
                action: "attempt_verification",
                body: {
                  code: t10
                }
              });
            };
            setReservedForSecondFactor = (e10) => {
              let { reserved: t10 } = e10 || {};
              return this._basePatch({
                body: {
                  reserved_for_second_factor: t10
                }
              });
            };
            makeDefaultSecondFactor = () => this._basePatch({
              body: {
                default_second_factor: true
              }
            });
            destroy = () => this._baseDelete();
            toString = () => {
              let e10 = this.phoneNumber.match(/^(\d{3})(\d{3})(\d{4})$/);
              return e10 ? "(" + e10[1] + ") " + e10[2] + "-" + e10[3] : this.phoneNumber;
            };
            fromJSON(e10) {
              return e10 && (this.id = e10.id, this.phoneNumber = e10.phone_number, this.reservedForSecondFactor = e10.reserved_for_second_factor, this.defaultSecondFactor = e10.default_second_factor, this.verification = new iV(e10.verification), this.linkedTo = (e10.linked_to || []).map((e11) => new iX(e11)), this.backupCodes = e10.backup_codes), this;
            }
            __internal_toSnapshot() {
              return {
                object: "phone_number",
                id: this.id || "",
                phone_number: this.phoneNumber,
                reserved_for_second_factor: this.reservedForSecondFactor,
                default_second_factor: this.defaultSecondFactor,
                verification: this.verification.__internal_toSnapshot(),
                linked_to: this.linkedTo.map((e10) => e10.__internal_toSnapshot()),
                backup_codes: this.backupCodes
              };
            }
          }
          class i3 extends tV {
            id;
            name;
            organizationId;
            enrollmentMode;
            verification;
            affiliationEmailAddress;
            createdAt;
            updatedAt;
            totalPendingInvitations;
            totalPendingSuggestions;
            constructor(e10) {
              super(), this.fromJSON(e10);
            }
            static async create(e10, { name: t10 }) {
              return new i3((await tV._fetch({
                path: `/organizations/${e10}/domains`,
                method: "POST",
                body: {
                  name: t10
                }
              }))?.response);
            }
            prepareAffiliationVerification = async (e10) => this._basePost({
              path: `/organizations/${this.organizationId}/domains/${this.id}/prepare_affiliation_verification`,
              method: "POST",
              body: e10
            });
            attemptAffiliationVerification = async (e10) => this._basePost({
              path: `/organizations/${this.organizationId}/domains/${this.id}/attempt_affiliation_verification`,
              method: "POST",
              body: e10
            });
            updateEnrollmentMode = (e10) => this._basePost({
              path: `/organizations/${this.organizationId}/domains/${this.id}/update_enrollment_mode`,
              body: e10
            });
            delete = () => this._baseDelete({
              path: `/organizations/${this.organizationId}/domains/${this.id}`
            });
            fromJSON(e10) {
              return e10 && (this.id = e10.id, this.name = e10.name, this.organizationId = e10.organization_id, this.enrollmentMode = e10.enrollment_mode, this.affiliationEmailAddress = e10.affiliation_email_address, this.totalPendingSuggestions = e10.total_pending_suggestions, this.totalPendingInvitations = e10.total_pending_invitations, e10.verification ? this.verification = {
                status: e10.verification.status,
                strategy: e10.verification.strategy,
                attempts: e10.verification.attempts,
                expiresAt: tZ(e10.verification.expires_at)
              } : this.verification = null), this;
            }
          }
          class i22 extends tV {
            id;
            organizationId;
            status;
            publicUserData;
            createdAt;
            updatedAt;
            constructor(e10) {
              super(), this.fromJSON(e10);
            }
            accept = async () => await this._basePost({
              path: `/organizations/${this.organizationId}/membership_requests/${this.id}/accept`
            });
            reject = async () => await this._basePost({
              path: `/organizations/${this.organizationId}/membership_requests/${this.id}/reject`
            });
            fromJSON(e10) {
              return e10 && (this.id = e10.id, this.organizationId = e10.organization_id, this.status = e10.status, this.createdAt = tZ(e10.created_at), this.updatedAt = tZ(e10.updated_at), e10.public_user_data && (this.publicUserData = new ng(e10.public_user_data))), this;
            }
          }
          class i4 extends tV {
            id;
            key;
            name;
            description;
            type;
            createdAt;
            updatedAt;
            constructor(e10) {
              super(), this.fromJSON(e10);
            }
            fromJSON(e10) {
              return e10 && (this.id = e10.id, this.key = e10.key, this.name = e10.name, this.description = e10.description, this.type = e10.type, this.createdAt = tZ(e10.created_at), this.updatedAt = tZ(e10.updated_at)), this;
            }
          }
          class i6 extends tV {
            id;
            key;
            name;
            description;
            permissions = [];
            createdAt;
            updatedAt;
            constructor(e10) {
              super(), this.fromJSON(e10);
            }
            fromJSON(e10) {
              return e10 && (this.id = e10.id, this.key = e10.key, this.name = e10.name, this.description = e10.description, this.permissions = e10.permissions.map((e11) => new i4(e11)), this.createdAt = tZ(e10.created_at), this.updatedAt = tZ(e10.updated_at)), this;
            }
          }
          class i5 extends tV {
            pathRoot = "/organizations";
            id;
            name;
            slug;
            imageUrl;
            hasImage;
            publicMetadata = {};
            adminDeleteEnabled;
            createdAt;
            updatedAt;
            membersCount = 0;
            pendingInvitationsCount = 0;
            maxAllowedMemberships;
            exclusiveMembership = false;
            constructor(e10) {
              super(), this.fromJSON(e10);
            }
            static async create(e10) {
              return new i5((await tV._fetch({
                path: "/organizations",
                method: "POST",
                body: e10
              }))?.response);
            }
            static async get(e10) {
              return new i5((await tV._fetch({
                path: `/organizations/${e10}`,
                method: "GET"
              }))?.response);
            }
            update = async (e10) => this._basePatch({
              body: e10
            });
            getRoles = async (e10) => await tV._fetch({
              path: `/organizations/${this.id}/roles`,
              method: "GET",
              search: it(e10)
            }, {
              forceUpdateClient: true
            }).then((e11) => {
              let { data: t10, total_count: i10, has_role_set_migration: n10 } = e11?.response;
              return {
                total_count: i10,
                data: t10.map((e12) => new i6(e12)),
                has_role_set_migration: n10
              };
            });
            getDomains = async (e10) => await tV._fetch({
              path: `/organizations/${this.id}/domains`,
              method: "GET",
              search: it(e10)
            }, {
              forceUpdateClient: true
            }).then((e11) => {
              let { data: t10, total_count: i10 } = e11?.response;
              return {
                total_count: i10,
                data: t10.map((e12) => new i3(e12))
              };
            });
            getDomain = async ({ domainId: e10 }) => new i3((await tV._fetch({
              path: `/organizations/${this.id}/domains/${e10}`,
              method: "GET"
            }))?.response);
            getMembershipRequests = async (e10) => await tV._fetch({
              path: `/organizations/${this.id}/membership_requests`,
              method: "GET",
              search: it(e10)
            }).then((e11) => {
              let { data: t10, total_count: i10 } = e11?.response;
              return {
                total_count: i10,
                data: t10.map((e12) => new i22(e12))
              };
            });
            createDomain = async (e10) => i3.create(this.id, {
              name: e10
            });
            getMemberships = async (e10) => await tV._fetch({
              path: `/organizations/${this.id}/memberships`,
              method: "GET",
              search: it({
                ...e10,
                paginated: true
              })
            }).then((e11) => {
              let { data: t10, total_count: i10 } = e11?.response;
              return {
                total_count: i10,
                data: t10.map((e12) => new i7(e12))
              };
            });
            getInvitations = async (e10) => await tV._fetch({
              path: `/organizations/${this.id}/invitations`,
              method: "GET",
              search: it(e10)
            }, {
              forceUpdateClient: true
            }).then((e11) => {
              let { data: t10, total_count: i10 } = e11?.response;
              return {
                total_count: i10,
                data: t10.map((e12) => new i8(e12))
              };
            });
            addMember = async ({ userId: e10, role: t10 }) => await tV._fetch({
              method: "POST",
              path: `/organizations/${this.id}/memberships`,
              body: {
                userId: e10,
                role: t10
              }
            }).then((e11) => new i7(e11?.response));
            inviteMember = async (e10) => i8.create(this.id, e10);
            inviteMembers = async (e10) => i8.createBulk(this.id, e10);
            updateMember = async ({ userId: e10, role: t10 }) => await tV._fetch({
              method: "PATCH",
              path: `/organizations/${this.id}/memberships/${e10}`,
              body: {
                role: t10
              }
            }).then((e11) => new i7(e11?.response));
            removeMember = async (e10) => await tV._fetch({
              method: "DELETE",
              path: `/organizations/${this.id}/memberships/${e10}`
            }).then((e11) => new i7(e11?.response));
            destroy = async () => this._baseDelete();
            setLogo = async ({ file: e10 }) => {
              let t10, i10;
              return null === e10 ? await tV._fetch({
                path: `/organizations/${this.id}/logo`,
                method: "DELETE"
              }).then((e11) => new i5(e11?.response)) : ("string" == typeof e10 ? (t10 = e10, i10 = new Headers({
                "Content-Type": "application/octet-stream"
              })) : (t10 = new FormData()).append("file", e10), await tV._fetch({
                path: `/organizations/${this.id}/logo`,
                method: "PUT",
                body: t10,
                headers: i10
              }).then((e11) => new i5(e11?.response)));
            };
            initializePaymentMethod = (e10) => ih({
              ...e10,
              orgId: this.id
            });
            addPaymentMethod = (e10) => iu({
              ...e10,
              orgId: this.id
            });
            getPaymentMethods = (e10) => ip({
              ...e10,
              orgId: this.id
            });
            fromJSON(e10) {
              return e10 && (this.id = e10.id, this.name = e10.name, this.slug = e10.slug, this.imageUrl = e10.image_url || "", this.hasImage = e10.has_image || false, this.publicMetadata = e10.public_metadata || {}, this.membersCount = e10.members_count || 0, this.pendingInvitationsCount = e10.pending_invitations_count || 0, this.maxAllowedMemberships = e10.max_allowed_memberships || 0, this.adminDeleteEnabled = e10.admin_delete_enabled || false, this.exclusiveMembership = e10.exclusive_membership || false, this.createdAt = tZ(e10.created_at), this.updatedAt = tZ(e10.updated_at)), this;
            }
            __internal_toSnapshot() {
              return {
                object: "organization",
                id: this.id,
                name: this.name,
                slug: this.slug,
                image_url: this.imageUrl,
                has_image: this.hasImage,
                public_metadata: this.publicMetadata,
                members_count: this.membersCount,
                pending_invitations_count: this.pendingInvitationsCount,
                max_allowed_memberships: this.maxAllowedMemberships,
                admin_delete_enabled: this.adminDeleteEnabled,
                exclusive_membership: this.exclusiveMembership,
                created_at: this.createdAt.getTime(),
                updated_at: this.updatedAt.getTime()
              };
            }
            async reload(e10) {
              let { rotatingTokenNonce: t10 } = e10 || {}, i10 = (await tV._fetch({
                path: `/organizations/${this.id}`,
                method: "GET",
                rotatingTokenNonce: t10
              }, {
                forceUpdateClient: true
              }))?.response;
              return this.fromJSON(i10);
            }
          }
          class i8 extends tV {
            id;
            emailAddress;
            organizationId;
            publicMetadata = {};
            status;
            role;
            roleName;
            createdAt;
            updatedAt;
            static async create(e10, { emailAddress: t10, role: i10 }) {
              return new i8((await tV._fetch({
                path: `/organizations/${e10}/invitations`,
                method: "POST",
                body: {
                  email_address: t10,
                  role: i10
                }
              }))?.response);
            }
            static async createBulk(e10, t10) {
              let { emailAddresses: i10, role: n10 } = t10;
              return ((await tV._fetch({
                path: `/organizations/${e10}/invitations/bulk`,
                method: "POST",
                body: {
                  email_address: i10,
                  role: n10
                }
              }))?.response).map((e11) => new i8(e11));
            }
            constructor(e10) {
              super(), this.fromJSON(e10);
            }
            revoke = async () => await this._basePost({
              path: `/organizations/${this.organizationId}/invitations/${this.id}/revoke`
            });
            fromJSON(e10) {
              return e10 && (this.id = e10.id, this.emailAddress = e10.email_address, this.organizationId = e10.organization_id, this.publicMetadata = e10.public_metadata, this.role = e10.role, this.roleName = e10.role_name, this.status = e10.status, this.createdAt = tZ(e10.created_at), this.updatedAt = tZ(e10.updated_at)), this;
            }
          }
          class i7 extends tV {
            id;
            publicMetadata = {};
            publicUserData;
            organization;
            permissions = [];
            role;
            roleName;
            createdAt;
            updatedAt;
            constructor(e10) {
              super(), this.fromJSON(e10);
            }
            static retrieve = async (e10) => await tV._fetch({
              path: "/me/organization_memberships",
              method: "GET",
              search: it({
                ...e10,
                paginated: true
              })
            }).then((e11) => {
              let { data: t10, total_count: i10 } = e11?.response;
              return {
                total_count: i10,
                data: t10.map((e12) => new i7(e12))
              };
            });
            destroy = async () => await this._baseDelete({
              path: `/organizations/${this.organization.id}/memberships/${this.publicUserData?.userId}`
            });
            update = async ({ role: e10 }) => await this._basePatch({
              path: `/organizations/${this.organization.id}/memberships/${this.publicUserData?.userId}`,
              body: {
                role: e10
              }
            });
            fromJSON(e10) {
              return e10 && (this.id = e10.id, this.organization = new i5(e10.organization), this.publicMetadata = e10.public_metadata || {}, e10.public_user_data && (this.publicUserData = new ng(e10.public_user_data)), this.permissions = Array.isArray(e10.permissions) ? [
                ...e10.permissions
              ] : [], this.role = e10.role, this.roleName = e10.role_name, this.createdAt = tZ(e10.created_at), this.updatedAt = tZ(e10.updated_at)), this;
            }
            __internal_toSnapshot() {
              return {
                object: "organization_membership",
                id: this.id,
                organization: this.organization.__internal_toSnapshot(),
                public_metadata: this.publicMetadata,
                public_user_data: this.publicUserData?.__internal_toSnapshot(),
                permissions: this.permissions,
                role: this.role,
                role_name: this.roleName,
                created_at: this.createdAt.getTime(),
                updated_at: this.updatedAt.getTime()
              };
            }
            reload(e10) {
              throw Error(`${tk} Calling OrganizationMembership.reload is not currently supported. Please contact support.`);
            }
          }
          class i9 extends tV {
            id;
            publicOrganizationData;
            status;
            createdAt;
            updatedAt;
            constructor(e10) {
              super(), this.fromJSON(e10);
            }
            static async retrieve(e10) {
              return await tV._fetch({
                path: "/me/organization_suggestions",
                method: "GET",
                search: it(e10)
              }).then((e11) => {
                let { data: t10, total_count: i10 } = e11?.response;
                return {
                  total_count: i10,
                  data: t10.map((e12) => new i9(e12))
                };
              });
            }
            accept = async () => await this._basePost({
              path: `/me/organization_suggestions/${this.id}/accept`
            });
            fromJSON(e10) {
              return e10 && (this.id = e10.id, this.status = e10.status, this.publicOrganizationData = {
                hasImage: e10.public_organization_data.has_image,
                imageUrl: e10.public_organization_data.image_url,
                name: e10.public_organization_data.name,
                id: e10.public_organization_data.id,
                slug: e10.public_organization_data.slug
              }, this.createdAt = tZ(e10.created_at), this.updatedAt = tZ(e10.updated_at)), this;
            }
          }
          class ne extends tV {
            id;
            provider = "saml_custom";
            providerUserId = null;
            active = false;
            emailAddress = "";
            firstName = "";
            lastName = "";
            verification = null;
            samlConnection = null;
            lastAuthenticatedAt = null;
            enterpriseConnectionId = null;
            constructor(e10, t10) {
              super(), this.pathRoot = t10, this.fromJSON(e10);
            }
            fromJSON(e10) {
              return e10 && (this.id = e10.id, this.provider = e10.provider, this.providerUserId = e10.provider_user_id, this.active = e10.active, this.emailAddress = e10.email_address, this.firstName = e10.first_name, this.lastName = e10.last_name, this.enterpriseConnectionId = e10.enterprise_connection_id, e10.verification && (this.verification = new iV(e10.verification)), e10.saml_connection && (this.samlConnection = new nt(e10.saml_connection)), this.lastAuthenticatedAt = e10.last_authenticated_at ? tZ(e10.last_authenticated_at) : null), this;
            }
            __internal_toSnapshot() {
              return {
                object: "saml_account",
                id: this.id,
                provider: this.provider,
                provider_user_id: this.providerUserId,
                active: this.active,
                email_address: this.emailAddress,
                first_name: this.firstName,
                last_name: this.lastName,
                verification: this.verification?.__internal_toSnapshot() || null,
                saml_connection: this.samlConnection?.__internal_toSnapshot(),
                enterprise_connection_id: this.enterpriseConnectionId,
                last_authenticated_at: this.lastAuthenticatedAt ? this.lastAuthenticatedAt.getTime() : null
              };
            }
          }
          class nt extends tV {
            id;
            name;
            domain;
            active;
            provider;
            syncUserAttributes;
            allowSubdomains;
            allowIdpInitiated;
            disableAdditionalIdentifications;
            createdAt;
            updatedAt;
            constructor(e10) {
              super(), this.fromJSON(e10);
            }
            fromJSON(e10) {
              return e10 && (this.id = e10.id, this.name = e10.name, this.domain = e10.domain, this.active = e10.active, this.provider = e10.provider, this.syncUserAttributes = e10.sync_user_attributes, this.allowSubdomains = e10.allow_subdomains, this.allowIdpInitiated = e10.allow_idp_initiated, this.disableAdditionalIdentifications = e10.disable_additional_identifications, this.createdAt = tZ(e10.created_at), this.updatedAt = tZ(e10.updated_at)), this;
            }
            __internal_toSnapshot() {
              return {
                object: "saml_account_connection",
                id: this.id,
                name: this.name,
                domain: this.domain,
                active: this.active,
                provider: this.provider,
                sync_user_attributes: this.syncUserAttributes,
                allow_subdomains: this.allowSubdomains,
                allow_idp_initiated: this.allowIdpInitiated,
                disable_additional_identifications: this.disableAdditionalIdentifications,
                created_at: this.createdAt.getTime(),
                updated_at: this.updatedAt.getTime()
              };
            }
          }
          let ni = {
            strict_mfa: {
              afterMinutes: 10,
              level: "multi_factor"
            },
            strict: {
              afterMinutes: 10,
              level: "second_factor"
            },
            moderate: {
              afterMinutes: 60,
              level: "second_factor"
            },
            lax: {
              afterMinutes: 1440,
              level: "second_factor"
            }
          }, nn = /* @__PURE__ */ new Set([
            "first_factor",
            "second_factor",
            "multi_factor"
          ]), nr = /* @__PURE__ */ new Set([
            "strict_mfa",
            "strict",
            "moderate",
            "lax"
          ]), ns = (e10) => "number" == typeof e10 && Number.isFinite(e10) && (-1 === e10 || e10 >= 0), na = (e10) => e10.replace(/^(org:)*/, "org:"), no = (e10, t10) => {
            let { org: i10, user: n10 } = nl(e10), [r2, s2] = t10.split(":"), a2 = s2 || r2;
            return "org" === r2 ? i10.includes(a2) : "user" === r2 ? n10.includes(a2) : [
              ...i10,
              ...n10
            ].includes(a2);
          }, nl = (e10) => {
            let t10 = e10 ? e10.split(",").map((e11) => e11.trim()) : [];
            return {
              org: t10.filter((e11) => e11.split(":")[0].includes("o")).map((e11) => e11.split(":")[1]),
              user: t10.filter((e11) => e11.split(":")[0].includes("u")).map((e11) => e11.split(":")[1])
            };
          };
          function nc() {
            return l() && "function" == typeof window.PublicKeyCredential;
          }
          async function nd() {
            try {
              return nc() && await window.PublicKeyCredential.isConditionalMediationAvailable();
            } catch {
              return false;
            }
          }
          async function nh() {
            try {
              return "undefined" != typeof window && await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
            } catch {
              return false;
            }
          }
          class nu extends tV {
            status;
            level;
            session;
            supportedFirstFactors = [];
            supportedSecondFactors = [];
            firstFactorVerification = new iV(null);
            secondFactorVerification = new iV(null);
            constructor(e10 = null) {
              super(), this.fromJSON(e10);
            }
            fromJSON(e10) {
              return e10 && (this.id = e10.id, this.status = e10.status, this.session = new np(e10.session), this.level = e10.level, this.supportedFirstFactors = er(e10.supported_first_factors), this.supportedSecondFactors = er(e10.supported_second_factors), this.firstFactorVerification = new iV(e10.first_factor_verification), this.secondFactorVerification = new iV(e10.second_factor_verification)), this;
            }
          }
          class np extends tV {
            pathRoot = "/client/sessions";
            id;
            status;
            lastActiveAt;
            lastActiveToken;
            lastActiveOrganizationId;
            actor;
            agent;
            user;
            publicUserData;
            factorVerificationAge = null;
            tasks = null;
            expireAt;
            abandonAt;
            createdAt;
            updatedAt;
            static isSessionResource(e10) {
              return !!e10 && e10 instanceof np;
            }
            constructor(e10) {
              super(), this.fromJSON(e10), this.#O(this.lastActiveToken);
            }
            end = () => (t9.clear(), this._basePost({
              action: "end"
            }));
            remove = () => (t9.clear(), this._basePost({
              action: "remove"
            }));
            touch = ({ intent: e10 } = {}) => this._basePost({
              action: "touch",
              body: {
                active_organization_id: this.lastActiveOrganizationId,
                intent: e10
              }
            }).then((e11) => (e11.lastActiveToken && ix.emit(iP, {
              token: e11.lastActiveToken
            }), e11));
            clearCache = () => t9.clear();
            getToken = async (e10) => tz(() => this._getToken(e10), {
              factor: 1.55,
              initialDelay: 3e3,
              maxDelayBetweenRetries: 5e4,
              jitter: false,
              shouldRetry: (e11, t10) => !R(e11) && t10 <= 8
            });
            checkAuthorization = (e10) => {
              let t10 = (this.user?.organizationMemberships || []).find((e11) => e11.organization.id === this.lastActiveOrganizationId);
              return (/* @__PURE__ */ ((e11) => (t11) => {
                let i10;
                return !!e11.userId && (i10 = [
                  ((e12, t12) => {
                    let { orgId: i11, orgRole: n10, orgPermissions: r2 } = t12, s2 = void 0 !== e12.role, a2 = void 0 !== e12.permission;
                    return s2 || a2 ? s2 && "string" != typeof e12.role || a2 && "string" != typeof e12.permission || !i11 || s2 && ("string" != typeof n10 || !n10 || na(n10) !== na(e12.role)) || a2 && (!Array.isArray(r2) || !r2.includes(na(e12.permission))) ? "fail" : "pass" : "skip";
                  })(t11, e11),
                  ((e12, t12) => {
                    let { features: i11, plans: n10 } = t12, r2 = void 0 !== e12.feature, s2 = void 0 !== e12.plan;
                    if (!r2 && !s2) return "skip";
                    if (r2 && "string" != typeof e12.feature || s2 && "string" != typeof e12.plan) return "fail";
                    if (r2) {
                      if ("string" != typeof i11 || !i11) return "fail";
                      try {
                        if (!no(i11, e12.feature)) return "fail";
                      } catch {
                        return "fail";
                      }
                    }
                    if (s2) {
                      if ("string" != typeof n10 || !n10) return "fail";
                      try {
                        if (!no(n10, e12.plan)) return "fail";
                      } catch {
                        return "fail";
                      }
                    }
                    return "pass";
                  })(t11, e11),
                  ((e12, { factorVerificationAge: t12 }) => {
                    if (void 0 === e12.reverification) return "skip";
                    if (!t12 || !Array.isArray(t12) || 2 !== t12.length || !ns(t12[0]) || !ns(t12[1])) return "fail";
                    let i11 = ((e13) => {
                      let t13, i12;
                      if (!e13) return false;
                      let n11 = "string" == typeof e13 && nr.has(e13), r3 = "object" == typeof e13 && (t13 = e13.level, nn.has(t13)) && "number" == typeof (i12 = e13.afterMinutes) && i12 > 0;
                      return (!!n11 || !!r3) && ((e14) => "string" == typeof e14 ? ni[e14] : e14).bind(null, e13);
                    })(e12.reverification);
                    if (!i11) return "fail";
                    let { level: n10, afterMinutes: r2 } = i11(), [s2, a2] = t12;
                    if (-1 === s2 && -1 === a2) return "fail";
                    let o2 = -1 !== s2 && r2 > s2, l2 = -1 !== a2 && r2 > a2;
                    switch (n10) {
                      case "first_factor":
                        return o2 ? "pass" : "fail";
                      case "second_factor":
                        if (-1 === a2) return o2 ? "pass" : "fail";
                        return l2 ? "pass" : "fail";
                      case "multi_factor":
                        if (-1 === a2) return o2 ? "pass" : "fail";
                        if (-1 === s2) return "fail";
                        return o2 && l2 ? "pass" : "fail";
                    }
                  })(t11, e11)
                ]).some((e12) => "pass" === e12) && i10.every((e12) => "pass" === e12 || "skip" === e12);
              })({
                userId: this.user?.id,
                factorVerificationAge: this.factorVerificationAge,
                orgId: t10?.organization?.id,
                orgRole: t10?.role,
                orgPermissions: t10?.permissions,
                features: this.lastActiveToken?.jwt?.claims.fea || "",
                plans: this.lastActiveToken?.jwt?.claims.pla || ""
              }))(e10);
            };
            #O = (e10) => {
              e10 && t9.set({
                tokenId: this.#E(),
                tokenResolver: Promise.resolve(e10)
              });
            };
            #E(e10, t10) {
              let i10 = void 0 === t10 ? this.lastActiveOrganizationId : t10;
              return tQ.build(this.id, e10, i10);
            }
            startVerification = async ({ level: e10 }) => new nu((await tV._fetch({
              method: "POST",
              path: `/client/sessions/${this.id}/verify`,
              body: {
                level: e10
              }
            }))?.response);
            prepareFirstFactorVerification = async (e10) => {
              let t10;
              switch (e10.strategy) {
                case "email_code":
                  t10 = {
                    emailAddressId: e10.emailAddressId
                  };
                  break;
                case "phone_code":
                  t10 = {
                    phoneNumberId: e10.phoneNumberId,
                    default: e10.default
                  };
                  break;
                case "passkey":
                  t10 = {};
                  break;
                case "enterprise_sso":
                  t10 = {
                    emailAddressId: e10.emailAddressId,
                    enterpriseConnectionId: e10.enterpriseConnectionId,
                    redirectUrl: e10.redirectUrl
                  };
                  break;
                default:
                  tU("Session.prepareFirstFactorVerification", e10.strategy);
              }
              return new nu((await tV._fetch({
                method: "POST",
                path: `/client/sessions/${this.id}/verify/prepare_first_factor`,
                body: {
                  ...t10,
                  strategy: e10.strategy
                }
              }))?.response);
            };
            attemptFirstFactorVerification = async (e10) => {
              let t10;
              return t10 = "passkey" === e10.strategy ? {
                publicKeyCredential: JSON.stringify(iJ(e10.publicKeyCredential))
              } : {
                ...e10
              }, new nu((await tV._fetch({
                method: "POST",
                path: `/client/sessions/${this.id}/verify/attempt_first_factor`,
                body: {
                  ...t10,
                  strategy: e10.strategy
                }
              }))?.response);
            };
            verifyWithPasskey = async () => {
              let { nonce: e10 = null } = (await this.prepareFirstFactorVerification({
                strategy: "passkey"
              })).firstFactorVerification, t10 = np.clerk.__internal_isWebAuthnSupported || nc, i10 = np.clerk.__internal_getPublicCredentials || iW;
              if (!t10()) throw new E("Passkeys are not supported", {
                code: "passkey_not_supported"
              });
              let n10 = e10 ? i$(JSON.parse(e10)) : null;
              n10 || tO("get");
              let { publicKeyCredential: r2, error: s2 } = await i10({
                publicKeyOptions: n10,
                conditionalUI: false
              });
              if (!r2) throw s2;
              return this.attemptFirstFactorVerification({
                strategy: "passkey",
                publicKeyCredential: r2
              });
            };
            prepareSecondFactorVerification = async (e10) => new nu((await tV._fetch({
              method: "POST",
              path: `/client/sessions/${this.id}/verify/prepare_second_factor`,
              body: e10
            }))?.response);
            attemptSecondFactorVerification = async (e10) => new nu((await tV._fetch({
              method: "POST",
              path: `/client/sessions/${this.id}/verify/attempt_second_factor`,
              body: e10
            }))?.response);
            fromJSON(e10) {
              return e10 && (this.id = e10.id, this.status = e10.status, this.expireAt = tZ(e10.expire_at), this.abandonAt = tZ(e10.abandon_at), this.factorVerificationAge = e10.factor_verification_age, this.lastActiveAt = tZ(e10.last_active_at || void 0), this.lastActiveOrganizationId = e10.last_active_organization_id, this.actor = e10.actor || null, this.agent = e10.actor?.type === "agent" ? e10.actor : null, this.createdAt = tZ(e10.created_at), this.updatedAt = tZ(e10.updated_at), this.user = new nM(e10.user), this.tasks = e10.tasks || null, e10.public_user_data && (this.publicUserData = new ng(e10.public_user_data)), this.lastActiveToken = e10.last_active_token ? new nE(e10.last_active_token) : null), this;
            }
            __internal_toSnapshot() {
              return {
                object: "session",
                id: this.id,
                status: this.status,
                expire_at: this.expireAt.getTime(),
                abandon_at: this.abandonAt.getTime(),
                factor_verification_age: this.factorVerificationAge,
                last_active_at: this.lastActiveAt.getTime(),
                last_active_organization_id: this.lastActiveOrganizationId,
                actor: this.actor,
                tasks: this.tasks,
                user: this.user?.__internal_toSnapshot() || null,
                public_user_data: this.publicUserData.__internal_toSnapshot(),
                last_active_token: this.lastActiveToken?.__internal_toSnapshot() || null,
                created_at: this.createdAt.getTime(),
                updated_at: this.updatedAt.getTime()
              };
            }
            async _getToken(e10) {
              if (!this.user) return null;
              let { leewayInSeconds: t10, template: i10, skipCache: n10 = false } = e10 || {}, r2 = void 0 === e10?.organizationId ? this.lastActiveOrganizationId : e10?.organizationId;
              if (!i10 && Number(t10) >= 60) throw Error("Leeway can not exceed the token lifespan (60 seconds)");
              let s2 = this.#E(i10, r2), a2 = n10 ? void 0 : t9.get({
                tokenId: s2
              }, t10), o2 = !i10 && r2 === this.lastActiveOrganizationId;
              if (a2) {
                eA.debug("Using cached token (no fetch needed)", {
                  tokenId: s2
                }, "session");
                let e11 = await a2.tokenResolver;
                return o2 && ix.emit(iP, {
                  token: e11
                }), e11.getRawString() || null;
              }
              eA.info("Fetching new token from API", {
                organizationId: r2,
                template: i10,
                tokenId: s2
              }, "session");
              let l2 = i10 ? `${this.path()}/tokens/${i10}` : `${this.path()}/tokens`, c2 = np.clerk?.__unstable__environment?.authConfig?.sessionMinter, d2 = i10 ? {} : {
                organizationId: r2,
                ...c2 && this.lastActiveToken ? {
                  token: this.lastActiveToken.getRawString()
                } : {},
                ...c2 && n10 ? {
                  forceOrigin: "true"
                } : {}
              }, h2 = this.lastActiveToken?.getRawString(), u2 = c2 ? nE.create(l2, d2, n10 ? {
                debug: "skip_cache"
              } : void 0) : nE.create(l2, d2, n10 ? {
                debug: "skip_cache"
              } : void 0).catch((e11) => {
                if (C.is(e11) && h2) return nE.create(l2, {
                  ...d2
                }, {
                  expired_token: h2
                });
                throw e11;
              });
              return t9.set({
                tokenId: s2,
                tokenResolver: u2
              }), u2.then((e11) => {
                let t11 = e11.jwt?.claims?.sid;
                return t11 && t11 !== this.id && eA.warn("Token session mismatch: requested token for one session but received token for another", {
                  requestedSessionId: this.id,
                  returnedSessionId: t11,
                  tokenId: s2,
                  hasActor: !!this.actor
                }, "session"), o2 && (ix.emit(iP, {
                  token: e11
                }), e11.jwt && !this.#x(e11) && (this.lastActiveToken = e11, ix.emit(iE, null))), e11.getRawString() || null;
              });
            }
            #x(e10) {
              let t10 = this.lastActiveToken;
              return !!t10?.jwt && t3(t10) === t3(e10) && (t22(t10) || "") === (t22(e10) || "") && t0(t10, e10) !== e10;
            }
            get currentTask() {
              let [e10] = this.tasks ?? [];
              return e10;
            }
          }
          class nf extends tV {
            id;
            pathRoot = "/me/passkeys";
            verification = null;
            name = null;
            lastUsedAt = null;
            createdAt;
            updatedAt;
            constructor(e10) {
              super(), this.fromJSON(e10);
            }
            static async create() {
              return tV._fetch({
                path: "/me/passkeys",
                method: "POST"
              }).then((e10) => new nf(e10?.response));
            }
            static async attemptVerification(e10, t10) {
              let i10 = function(e11) {
                let t11 = e11.response;
                return {
                  ...ij(e11),
                  response: {
                    clientDataJSON: iK(t11.clientDataJSON),
                    attestationObject: iK(t11.attestationObject),
                    transports: t11.getTransports()
                  }
                };
              }(t10);
              return tV._fetch({
                path: `/me/passkeys/${e10}/attempt_verification`,
                method: "POST",
                body: {
                  strategy: "passkey",
                  publicKeyCredential: JSON.stringify(i10)
                }
              }).then((e11) => new nf(e11?.response));
            }
            static async registerPasskey() {
              let e10 = nf.clerk.__internal_isWebAuthnSupported || nc, t10 = nf.clerk.__internal_createPublicCredentials || iF, i10 = nf.clerk.__internal_isWebAuthnPlatformAuthenticatorSupported || nh;
              if (!e10()) throw new E("Passkeys are not supported on this device.", {
                code: "passkey_not_supported"
              });
              let n10 = await this.create(), { verification: r2 } = n10, s2 = r2?.publicKey;
              if (s2 || tO("create"), s2.authenticatorSelection?.authenticatorAttachment === "platform" && !await i10()) throw new E("Registration requires a platform authenticator but the device does not support it.", {
                code: "passkey_pa_not_supported"
              });
              let { publicKeyCredential: a2, error: o2 } = await t10(s2);
              if (!a2) throw o2;
              return this.attemptVerification(n10.id, a2);
            }
            update = (e10) => this._basePatch({
              body: e10
            });
            delete = async () => new iw((await tV._fetch({
              path: this.path(),
              method: "DELETE"
            }))?.response);
            fromJSON(e10) {
              return e10 && (this.id = e10.id, this.name = e10.name, this.lastUsedAt = e10.last_used_at ? tZ(e10.last_used_at) : null, this.createdAt = tZ(e10.created_at), this.updatedAt = tZ(e10.updated_at), e10.verification && (this.verification = new iq(e10.verification))), this;
            }
            __internal_toSnapshot() {
              return {
                object: "passkey",
                id: this.id,
                name: this.name,
                verification: this.verification?.__internal_toSnapshot() || null,
                last_used_at: this.lastUsedAt?.getTime() || null,
                created_at: this.createdAt.getTime(),
                updated_at: this.updatedAt.getTime()
              };
            }
          }
          class nm extends tV {
            id = "";
            loaders;
            rollout;
            constructor(e10 = null) {
              super(), this.fromJSON(e10);
            }
            fromJSON(e10) {
              return e10 && (this.id = this.withDefault(e10.id, this.id), this.loaders = this.withDefault(e10.loaders, this.loaders)), this;
            }
            __internal_toSnapshot() {
              return {
                object: "protect_config",
                id: this.id,
                loaders: this.loaders
              };
            }
          }
          class ng {
            firstName;
            lastName;
            imageUrl;
            hasImage;
            identifier;
            userId;
            username;
            constructor(e10) {
              this.fromJSON(e10);
            }
            fromJSON(e10) {
              return e10 && (this.firstName = e10.first_name || null, this.lastName = e10.last_name || null, this.imageUrl = e10.image_url || "", this.hasImage = e10.has_image || false, this.identifier = e10.identifier || "", this.userId = e10.user_id, this.username = e10.username), this;
            }
            __internal_toSnapshot() {
              return {
                first_name: this.firstName,
                last_name: this.lastName,
                image_url: this.imageUrl,
                has_image: this.hasImage,
                identifier: this.identifier,
                user_id: this.userId,
                username: this.username
              };
            }
          }
          class n_ extends tV {
            pathRoot = "";
            id;
            status;
            abandonAt;
            expireAt;
            lastActiveAt;
            latestActivity;
            actor;
            constructor(e10, t10) {
              super(), this.pathRoot = t10, this.fromJSON(e10);
            }
            static retrieve() {
              let e10 = tV.clerk.session?.id;
              return this.clerk.getFapiClient().request({
                method: "GET",
                path: "/me/sessions/active",
                sessionId: e10
              }).then((e11) => e11.payload.map((e12) => new n_(e12, "/me/sessions"))).catch(() => []);
            }
            revoke() {
              return this._basePost({
                action: "revoke",
                body: {}
              });
            }
            fromJSON(e10) {
              let t10;
              return e10 ? (this.id = e10.id, this.status = e10.status, this.expireAt = tZ(e10.expire_at), this.abandonAt = tZ(e10.abandon_at), this.lastActiveAt = tZ(e10.last_active_at || void 0), this.latestActivity = {
                id: (t10 = e10.latest_activity ?? {}).id,
                deviceType: t10.device_type,
                browserName: t10.browser_name,
                browserVersion: t10.browser_version,
                country: t10.country,
                city: t10.city,
                isMobile: t10.is_mobile,
                ipAddress: t10.ip_address
              }, this.actor = e10.actor, this) : this;
            }
          }
          function ny(e10) {
            return e10 ? `https://${e10.replace(/clerk\.accountsstage\./, "accountsstage.").replace(/clerk\.accounts\.|clerk\./, "accounts.")}` : "";
          }
          async function nb(e10, t10, i10, n10, r2) {
            if (!e10.client || !n10.popup) return;
            let s2 = ny(e10.frontendApi), { redirectUrl: a2 } = n10, o2 = new URL(a2);
            o2.searchParams.set("sign_in_force_redirect_url", n10.redirectUrlComplete), o2.searchParams.set("sign_up_force_redirect_url", n10.redirectUrlComplete), o2.searchParams.set("intent", t10);
            let l2 = e10.buildUrlWithAuth(o2.toString()), c2 = e10.buildUrlWithAuth(`${s2}/popup-callback`), d2 = e10.buildUrlWithAuth(`${s2}/popup-callback?return_url=${encodeURIComponent(l2)}`), h2 = async (t11) => {
              if (t11.origin !== s2) return;
              let i11 = false;
              if (t11.data.session) {
                if (!e10.client?.sessions.find((e11) => e11.id === t11.data.session)) try {
                  await e10.client?.reload();
                } catch (e11) {
                  console.error(e11);
                }
                await e10.setActive({
                  session: t11.data.session,
                  redirectUrl: n10.redirectUrlComplete
                }), i11 = true;
              } else t11.data.return_url && (e10.navigate(t11.data.return_url), i11 = true);
              i11 && window.removeEventListener("message", h2);
            };
            window.addEventListener("message", h2), await i10({
              ...n10,
              redirectUrlComplete: c2,
              redirectUrl: d2
            }, r2);
          }
          function nw(e10, { redirectCallbackUrl: t10, redirectUrl: i10 }) {
            let n10 = ny(e10.frontendApi), r2 = new URL(t10);
            r2.searchParams.set("sign_in_force_redirect_url", i10), r2.searchParams.set("sign_up_force_redirect_url", i10);
            let s2 = e10.buildUrlWithAuth(r2.toString()), a2 = e10.buildUrlWithAuth(`${n10}/popup-callback`);
            return {
              redirectCallbackUrl: e10.buildUrlWithAuth(`${n10}/popup-callback?return_url=${encodeURIComponent(s2)}`),
              redirectUrl: a2
            };
          }
          function nv(e10, t10) {
            return new Promise((i10, n10) => {
              if (!e10.client || !t10.popup) return void n10();
              let r2 = async (t11) => {
                t11.origin === ny(e10.frontendApi) && (t11.data.session || t11.data.return_url ? (window.removeEventListener("message", r2), i10()) : n10());
              };
              window.addEventListener("message", r2), t10.popup.location.href = t10.externalVerificationRedirectURL.toString();
            });
          }
          let nk = (e10, t10) => {
            let { onValidation: n10 = ey.ZT, onValidationComplexity: r2 = ey.ZT } = t10 || {}, { show_zxcvbn: s2, validatePassword: a2 } = e10, o2 = (t11) => ((e11, t12) => {
              let { max_length: i10, min_length: n11, require_special_char: r3, require_lowercase: s3, require_numbers: a3, require_uppercase: o3 } = t12, l3 = ((e12) => {
                let t13;
                if (e12.allowed_special_characters) {
                  let i11 = e12.allowed_special_characters.replace("[", "\\[");
                  i11 = i11.replace("]", "\\]"), t13 = RegExp(`[${i11}]`);
                } else t13 = /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/;
                return (e13, { minLength: i11, maxLength: n12 }) => ({
                  max_length: e13.length < n12,
                  min_length: e13.length >= i11,
                  require_numbers: /\d/.test(e13),
                  require_lowercase: /[a-z]/.test(e13),
                  require_uppercase: /[A-Z]/.test(e13),
                  require_special_char: t13.test(e13)
                });
              })(t12)(e11, {
                maxLength: t12.max_length,
                minLength: t12.min_length
              }), c3 = {
                max_length: i10,
                min_length: n11,
                require_special_char: r3,
                require_lowercase: s3,
                require_numbers: a3,
                require_uppercase: o3
              }, d2 = /* @__PURE__ */ new Map();
              for (let e12 in c3) c3[e12] && !l3[e12] && d2.set(e12, true);
              return Object.freeze(Object.fromEntries(d2));
            })(t11, e10), l2 = (({ min_zxcvbn_strength: e11, onResult: t11 }) => (i10) => (n11) => {
              let r3 = i10(n11);
              return (t11?.(r3), r3.score >= e11 && r3.score < 3) ? {
                state: "pass",
                keys: [
                  "unstable__errors.zxcvbn.couldBeStronger"
                ],
                result: r3
              } : r3.score >= e11 ? {
                state: "excellent",
                result: r3
              } : {
                state: "fail",
                keys: [
                  "unstable__errors.zxcvbn.notEnough",
                  ...r3.feedback.suggestions.map((e12) => `unstable__errors.zxcvbn.suggestions.${e12}`)
                ],
                result: r3
              };
            })(e10), c2 = {};
            return (e11, t11) => {
              let { onValidation: d2 = n10, onValidationComplexity: h2 = r2 } = t11 || {};
              if (!a2) return;
              let u2 = o2(e11);
              h2(0 === Object.keys(u2).length), c2 = {
                ...c2,
                complexity: u2
              }, s2 && Promise.all([
                i2.e("890").then(i2.bind(i2, 384)),
                i2.e("377").then(i2.bind(i2, 7706))
              ]).then(([e12, t12]) => {
                let { zxcvbnOptions: i10, zxcvbn: n11 } = e12, { dictionary: r3, adjacencyGraphs: s3 } = t12;
                return i10.setOptions({
                  dictionary: {
                    ...r3
                  },
                  graphs: s3
                }), n11;
              }).then((t12) => {
                let i10 = l2(t12)(e11);
                d2({
                  ...c2 = {
                    ...c2,
                    strength: i10
                  },
                  strength: i10
                });
              }), c2.complexity && 0 === Object.keys(c2.complexity).length && s2 || d2(c2);
            };
          };
          async function nS(e10, t10) {
            ix.emit("resource:error", {
              resource: e10,
              error: null
            }), ix.emit("resource:fetch", {
              resource: e10,
              status: "fetching"
            });
            try {
              return {
                result: await t10(),
                error: null
              };
            } catch (t11) {
              return ix.emit("resource:error", {
                resource: e10,
                error: t11
              }), {
                error: t11
              };
            } finally {
              ix.emit("resource:fetch", {
                resource: e10,
                status: "idle"
              });
            }
          }
          class nC extends tV {
            pathRoot = "/client/sign_ins";
            id;
            _status = null;
            supportedIdentifiers = [];
            supportedFirstFactors = [];
            supportedSecondFactors = null;
            firstFactorVerification = new iV(null);
            secondFactorVerification = new iV(null);
            identifier = null;
            createdSessionId = null;
            userData = new nU(null);
            clientTrustState;
            get status() {
              return this._status;
            }
            set status(e10) {
              let t10 = this._status;
              this._status = e10, e10 && t10 !== e10 && eA.debug("SignIn.status", {
                id: this.id,
                from: t10,
                to: e10
              });
            }
            __internal_future = new nA(this);
            __internal_basePost = this._basePost.bind(this);
            __internal_baseGet = this._baseGet.bind(this);
            constructor(e10 = null) {
              super(), this.fromJSON(e10);
            }
            create = (e10) => {
              eA.debug("SignIn.create", {
                id: this.id,
                strategy: "strategy" in e10 ? e10.strategy : void 0
              });
              let t10 = e9();
              return this._basePost({
                path: this.pathRoot,
                body: t10 ? {
                  locale: t10,
                  ...e10
                } : e10
              });
            };
            resetPassword = (e10) => this._basePost({
              body: e10,
              action: "reset_password"
            });
            prepareFirstFactor = (e10) => {
              let t10;
              switch (eA.debug("SignIn.prepareFirstFactor", {
                id: this.id,
                strategy: e10.strategy
              }), e10.strategy) {
                case "passkey":
                  t10 = {};
                  break;
                case "email_link":
                  t10 = {
                    emailAddressId: e10.emailAddressId,
                    redirectUrl: e10.redirectUrl
                  };
                  break;
                case "email_code":
                case "reset_password_email_code":
                  t10 = {
                    emailAddressId: e10.emailAddressId
                  };
                  break;
                case "phone_code":
                  t10 = {
                    phoneNumberId: e10.phoneNumberId,
                    default: e10.default,
                    channel: e10.channel
                  };
                  break;
                case "web3_metamask_signature":
                case "web3_base_signature":
                case "web3_coinbase_wallet_signature":
                case "web3_okx_wallet_signature":
                case "web3_solana_signature":
                  t10 = {
                    web3WalletId: e10.web3WalletId
                  };
                  break;
                case "reset_password_phone_code":
                  t10 = {
                    phoneNumberId: e10.phoneNumberId
                  };
                  break;
                case "saml":
                  t10 = {
                    redirectUrl: e10.redirectUrl,
                    actionCompleteRedirectUrl: e10.actionCompleteRedirectUrl
                  };
                  break;
                case "enterprise_sso":
                  t10 = {
                    redirectUrl: e10.redirectUrl,
                    actionCompleteRedirectUrl: e10.actionCompleteRedirectUrl,
                    oidcPrompt: e10.oidcPrompt,
                    enterpriseConnectionId: e10.enterpriseConnectionId
                  };
                  break;
                default:
                  tU("SignIn.prepareFirstFactor", e10.strategy);
              }
              return this._basePost({
                body: {
                  ...t10,
                  strategy: e10.strategy
                },
                action: "prepare_first_factor"
              });
            };
            attemptFirstFactor = (e10) => {
              let t10;
              return eA.debug("SignIn.attemptFirstFactor", {
                id: this.id,
                strategy: e10.strategy
              }), t10 = "passkey" === e10.strategy ? {
                publicKeyCredential: JSON.stringify(iJ(e10.publicKeyCredential))
              } : {
                ...e10
              }, this._basePost({
                body: {
                  ...t10,
                  strategy: e10.strategy
                },
                action: "attempt_first_factor"
              });
            };
            createEmailLinkFlow = () => {
              let { run: e10, stop: t10 } = iU();
              return {
                startEmailLinkFlow: async ({ emailAddressId: i10, redirectUrl: n10 }) => {
                  this.id || tA("SignIn");
                  let r2 = {
                    strategy: "email_link",
                    emailAddressId: i10,
                    redirectUrl: n10
                  }, s2 = "needs_second_factor" === this.status, a2 = s2 ? "secondFactorVerification" : "firstFactorVerification";
                  return s2 ? await this.prepareSecondFactor(r2) : await this.prepareFirstFactor(r2), new Promise((i11, n11) => {
                    e10(() => this.reload().then((e11) => {
                      let n12 = e11[a2].status;
                      ("verified" === n12 || "expired" === n12) && (t10(), i11(e11));
                    }).catch((e11) => {
                      t10(), n11(e11);
                    }));
                  });
                },
                cancelEmailLinkFlow: t10
              };
            };
            prepareSecondFactor = (e10) => (eA.debug("SignIn.prepareSecondFactor", {
              id: this.id,
              strategy: e10.strategy
            }), this._basePost({
              body: e10,
              action: "prepare_second_factor"
            }));
            attemptSecondFactor = (e10) => (eA.debug("SignIn.attemptSecondFactor", {
              id: this.id,
              strategy: e10.strategy
            }), this._basePost({
              body: e10,
              action: "attempt_second_factor"
            }));
            authenticateWithRedirectOrPopup = async (e10, t10) => {
              let { strategy: i10, redirectUrlComplete: n10, identifier: r2, oidcPrompt: s2, continueSignIn: a2, enterpriseConnectionId: o2 } = e10 || {}, l2 = nC.clerk.buildUrlWithAuth(e10.redirectUrl);
              this.id && a2 || await this.create({
                strategy: i10,
                identifier: r2,
                redirectUrl: l2,
                actionCompleteRedirectUrl: n10
              }), ("saml" === i10 || "enterprise_sso" === i10) && await this.prepareFirstFactor({
                strategy: i10,
                redirectUrl: l2,
                actionCompleteRedirectUrl: n10,
                oidcPrompt: s2,
                enterpriseConnectionId: o2
              });
              let { status: c2, externalVerificationRedirectURL: d2 } = this.firstFactorVerification;
              "unverified" === c2 && d2 ? t10(d2) : tT(c2, nC.fapiClient.buildEmailAddress("support"));
            };
            authenticateWithRedirect = async (e10) => this.authenticateWithRedirectOrPopup(e10, eP);
            authenticateWithPopup = async (e10) => {
              let { popup: t10 } = e10 || {};
              return t10 || tP("popup"), nb(nC.clerk, "signIn", this.authenticateWithRedirectOrPopup, e10, (e11) => {
                t10.location.href = e11.toString();
              });
            };
            authenticateWithWeb3 = async (e10) => {
              let t10, { identifier: i10, generateSignature: n10, strategy: r2 = "web3_metamask_signature", walletName: s2 } = e10 || {}, a2 = r2.replace("web3_", "").replace("_signature", "");
              "function" != typeof n10 && tP("generateSignature"), "solana" !== a2 || s2 || tP("walletName"), await this.create({
                identifier: i10
              });
              let o2 = this.supportedFirstFactors?.find((e11) => e11.strategy === r2);
              o2 || tI("SignIn"), await this.prepareFirstFactor(o2);
              let { message: l2 } = this.firstFactorVerification;
              l2 || tI("SignIn");
              try {
                t10 = await n10({
                  identifier: i10,
                  nonce: l2,
                  walletName: s2,
                  provider: a2
                });
              } catch (e11) {
                if ("coinbase_wallet" === a2 && 4001 === e11.code) t10 = await n10({
                  identifier: i10,
                  nonce: l2,
                  provider: a2,
                  walletName: s2
                });
                else throw e11;
              }
              return this.attemptFirstFactor({
                signature: t10,
                strategy: r2
              });
            };
            authenticateWithMetamask = async () => {
              let e10 = await ta();
              return this.authenticateWithWeb3({
                identifier: e10,
                generateSignature: th,
                strategy: "web3_metamask_signature"
              });
            };
            authenticateWithCoinbaseWallet = async () => {
              let e10 = await to();
              return this.authenticateWithWeb3({
                identifier: e10,
                generateSignature: tu,
                strategy: "web3_coinbase_wallet_signature"
              });
            };
            authenticateWithBase = async () => {
              let e10 = await tc();
              return this.authenticateWithWeb3({
                identifier: e10,
                generateSignature: tf,
                strategy: "web3_base_signature"
              });
            };
            authenticateWithOKXWallet = async () => {
              let e10 = await tl();
              return this.authenticateWithWeb3({
                identifier: e10,
                generateSignature: tp,
                strategy: "web3_okx_wallet_signature"
              });
            };
            authenticateWithSolana = async ({ walletName: e10 }) => {
              let t10 = await td(e10);
              return this.authenticateWithWeb3({
                identifier: t10,
                generateSignature: (t11) => tm({
                  ...t11,
                  walletName: e10
                }),
                strategy: "web3_solana_signature",
                walletName: e10
              });
            };
            authenticateWithPasskey = async (e10) => {
              let { flow: t10 } = e10 || {}, i10 = nC.clerk.__internal_isWebAuthnSupported || nc, n10 = nC.clerk.__internal_getPublicCredentials || iW, r2 = nC.clerk.__internal_isWebAuthnAutofillSupported || nd;
              if (!i10()) throw new E("Passkeys are not supported", {
                code: "passkey_not_supported"
              });
              if ("autofill" === t10 || "discoverable" === t10) await this.create({
                strategy: "passkey"
              });
              else {
                let e11 = this.supportedFirstFactors.find((e12) => "passkey" === e12.strategy);
                e11 || function() {
                  throw Error(`${tk} You need to start a SignIn flow by calling SignIn.create({ strategy: 'passkey' }) first`);
                }(), await this.prepareFirstFactor(e11);
              }
              let { nonce: s2 } = this.firstFactorVerification, a2 = s2 ? i$(JSON.parse(s2)) : null;
              a2 || tO("get");
              let o2 = false;
              "autofill" === t10 && (o2 = await r2());
              let { publicKeyCredential: l2, error: c2 } = await n10({
                publicKeyOptions: a2,
                conditionalUI: o2
              });
              if (!l2) throw c2;
              return this.attemptFirstFactor({
                publicKeyCredential: l2,
                strategy: "passkey"
              });
            };
            validatePassword = (e10, t10) => {
              if (nC.clerk.__unstable__environment?.userSettings.passwordSettings) return nk({
                ...nC.clerk.__unstable__environment?.userSettings.passwordSettings,
                validatePassword: true
              })(e10, t10);
            };
            fromJSON(e10) {
              return e10 && (this.id = e10.id, this.status = e10.status, this.supportedIdentifiers = e10.supported_identifiers, this.identifier = e10.identifier, this.supportedFirstFactors = er(e10.supported_first_factors), this.supportedSecondFactors = er(e10.supported_second_factors), this.firstFactorVerification = new iV(e10.first_factor_verification), this.secondFactorVerification = new iV(e10.second_factor_verification), this.createdSessionId = e10.created_session_id, this.userData = new nU(e10.user_data), this.clientTrustState = e10.client_trust_state ?? void 0), ix.emit("resource:update", {
                resource: this
              }), this;
            }
            __internal_toSnapshot() {
              return {
                object: "sign_in",
                id: this.id || "",
                status: this.status || null,
                supported_identifiers: this.supportedIdentifiers,
                supported_first_factors: en(this.supportedFirstFactors),
                supported_second_factors: en(this.supportedSecondFactors),
                first_factor_verification: this.firstFactorVerification.__internal_toSnapshot(),
                second_factor_verification: this.secondFactorVerification.__internal_toSnapshot(),
                identifier: this.identifier,
                created_session_id: this.createdSessionId,
                user_data: this.userData.__internal_toSnapshot()
              };
            }
          }
          class nA {
            emailCode = {
              sendCode: this.sendEmailCode.bind(this),
              verifyCode: this.verifyEmailCode.bind(this)
            };
            emailLink = {
              sendLink: this.sendEmailLink.bind(this),
              waitForVerification: this.waitForEmailLinkVerification.bind(this),
              get verification() {
                if (!a()) return null;
                let e10 = eF("__clerk_status"), t10 = eF("__clerk_created_session");
                if (!e10 || !t10) return null;
                let i10 = "verified" === e10 && void 0 !== nC.clerk.client && nC.clerk.client.sessions.some((e11) => e11.id === t10);
                return {
                  status: e10,
                  createdSessionId: t10,
                  verifiedFromTheSameClient: i10
                };
              }
            };
            resetPasswordEmailCode = {
              sendCode: this.sendResetPasswordEmailCode.bind(this),
              verifyCode: this.verifyResetPasswordEmailCode.bind(this),
              submitPassword: this.submitResetPassword.bind(this)
            };
            phoneCode = {
              sendCode: this.sendPhoneCode.bind(this),
              verifyCode: this.verifyPhoneCode.bind(this)
            };
            mfa = {
              sendPhoneCode: this.sendMFAPhoneCode.bind(this),
              verifyPhoneCode: this.verifyMFAPhoneCode.bind(this),
              verifyTOTP: this.verifyTOTP.bind(this),
              verifyBackupCode: this.verifyBackupCode.bind(this)
            };
            #R;
            constructor(e10) {
              this.#R = e10;
            }
            get id() {
              return this.#R.id;
            }
            get identifier() {
              return this.#R.identifier;
            }
            get createdSessionId() {
              return this.#R.createdSessionId;
            }
            get userData() {
              return this.#R.userData;
            }
            get status() {
              return this.#R.status || "needs_identifier";
            }
            get supportedFirstFactors() {
              return this.#R.supportedFirstFactors ?? [];
            }
            get supportedSecondFactors() {
              return this.#R.supportedSecondFactors ?? [];
            }
            get isTransferable() {
              return "transferable" === this.#R.firstFactorVerification.status;
            }
            get existingSession() {
              if ("failed" === this.#R.firstFactorVerification.status && this.#R.firstFactorVerification.error?.code === "identifier_already_signed_in" && this.#R.firstFactorVerification.error?.meta?.sessionId) return {
                sessionId: this.#R.firstFactorVerification.error?.meta?.sessionId
              };
            }
            get firstFactorVerification() {
              return this.#R.firstFactorVerification;
            }
            get secondFactorVerification() {
              return this.#R.secondFactorVerification;
            }
            async sendResetPasswordEmailCode() {
              if (!this.#R.id) throw Error("Cannot reset password without a sign in.");
              return nS(this.#R, async () => {
                let e10 = this.#R.supportedFirstFactors?.find((e11) => "reset_password_email_code" === e11.strategy);
                if (!e10) throw new T("Reset password email code factor not found", {
                  code: "factor_not_found"
                });
                let { emailAddressId: t10 } = e10;
                await this.#R.__internal_basePost({
                  body: {
                    emailAddressId: t10,
                    strategy: "reset_password_email_code"
                  },
                  action: "prepare_first_factor"
                });
              });
            }
            async verifyResetPasswordEmailCode(e10) {
              let { code: t10 } = e10;
              return nS(this.#R, async () => {
                await this.#R.__internal_basePost({
                  body: {
                    code: t10,
                    strategy: "reset_password_email_code"
                  },
                  action: "attempt_first_factor"
                });
              });
            }
            async submitResetPassword(e10) {
              let { password: t10, signOutOfOtherSessions: i10 = true } = e10;
              return nS(this.#R, async () => {
                await this.#R.__internal_basePost({
                  body: {
                    password: t10,
                    signOutOfOtherSessions: i10
                  },
                  action: "reset_password"
                });
              });
            }
            async _create(e10) {
              let t10 = e9();
              await this.#R.__internal_basePost({
                path: this.#R.pathRoot,
                body: t10 ? {
                  locale: t10,
                  ...e10
                } : e10
              });
            }
            async create(e10) {
              return nS(this.#R, async () => {
                await this._create(e10);
              });
            }
            async password(e10) {
              if ([
                e10.identifier,
                e10.emailAddress,
                e10.phoneNumber
              ].filter(Boolean).length > 1) throw Error("Only one of identifier, emailAddress, or phoneNumber can be provided");
              return nS(this.#R, async () => {
                let t10 = e10.identifier || e10.emailAddress || e10.phoneNumber, i10 = this.#R.identifier, n10 = e9();
                await this.#R.__internal_basePost({
                  path: this.#R.pathRoot,
                  body: {
                    identifier: t10 || i10,
                    password: e10.password,
                    ...n10 ? {
                      locale: n10
                    } : {}
                  }
                });
              });
            }
            async sendEmailCode(e10 = {}) {
              let { emailAddress: t10, emailAddressId: i10 } = e10;
              if (!this.#R.id && i10) throw Error("signIn.emailCode.sendCode() cannot be called with an emailAddressId if an existing signIn does not exist.");
              if (!this.#R.id && !t10) throw Error("signIn.emailCode.sendCode() cannot be called without an emailAddress if an existing signIn does not exist.");
              return nS(this.#R, async () => {
                t10 && await this._create({
                  identifier: t10
                });
                let e11 = this.selectFirstFactor({
                  strategy: "email_code",
                  emailAddressId: i10
                });
                if (!e11) throw new T("Email code factor not found", {
                  code: "factor_not_found"
                });
                await this.#R.__internal_basePost({
                  body: {
                    emailAddressId: e11.emailAddressId,
                    strategy: "email_code"
                  },
                  action: "prepare_first_factor"
                });
              });
            }
            async verifyEmailCode(e10) {
              let { code: t10 } = e10;
              return nS(this.#R, async () => {
                await this.#R.__internal_basePost({
                  body: {
                    code: t10,
                    strategy: "email_code"
                  },
                  action: "attempt_first_factor"
                });
              });
            }
            async sendEmailLink(e10) {
              let { emailAddress: t10, verificationUrl: i10, emailAddressId: n10 } = e10;
              if (!this.#R.id && n10) throw Error("signIn.emailLink.sendLink() cannot be called with an emailAddressId if an existing signIn does not exist.");
              if (!this.#R.id && !t10) throw Error("signIn.emailLink.sendLink() cannot be called without an emailAddress if an existing signIn does not exist.");
              return nS(this.#R, async () => {
                t10 && await this._create({
                  identifier: t10
                });
                let e11 = this.selectFirstFactor({
                  strategy: "email_link",
                  emailAddressId: n10
                });
                if (!e11) throw new T("Email link factor not found", {
                  code: "factor_not_found"
                });
                let r2 = i10;
                try {
                  new URL(i10);
                } catch {
                  r2 = window.location.origin + i10;
                }
                await this.#R.__internal_basePost({
                  body: {
                    emailAddressId: e11.emailAddressId,
                    redirectUrl: r2,
                    strategy: "email_link"
                  },
                  action: "prepare_first_factor"
                });
              });
            }
            async waitForEmailLinkVerification() {
              return nS(this.#R, async () => {
                let { run: e10, stop: t10 } = iU();
                await new Promise((i10, n10) => {
                  e10(async () => {
                    try {
                      let e11 = await this.#R.__internal_baseGet(), n11 = e11.firstFactorVerification.status;
                      ("verified" === n11 || "expired" === n11) && (t10(), i10(e11));
                    } catch (e11) {
                      t10(), n10(e11);
                    }
                  });
                });
              });
            }
            async sendPhoneCode(e10 = {}) {
              let { phoneNumber: t10, phoneNumberId: i10, channel: n10 = "sms" } = e10;
              if (!this.#R.id && i10) throw Error("signIn.phoneCode.sendCode() cannot be called with an phoneNumberId if an existing signIn does not exist.");
              if (!this.#R.id && !t10) throw Error("signIn.phoneCode.sendCode() cannot be called without an phoneNumber if an existing signIn does not exist.");
              return nS(this.#R, async () => {
                t10 && await this._create({
                  identifier: t10
                });
                let e11 = this.selectFirstFactor({
                  strategy: "phone_code",
                  phoneNumberId: i10
                });
                if (!e11) throw new T("Phone code factor not found", {
                  code: "factor_not_found"
                });
                await this.#R.__internal_basePost({
                  body: {
                    phoneNumberId: e11.phoneNumberId,
                    strategy: "phone_code",
                    channel: n10
                  },
                  action: "prepare_first_factor"
                });
              });
            }
            async verifyPhoneCode(e10) {
              let { code: t10 } = e10;
              return nS(this.#R, async () => {
                await this.#R.__internal_basePost({
                  body: {
                    code: t10,
                    strategy: "phone_code"
                  },
                  action: "attempt_first_factor"
                });
              });
            }
            async sso(e10) {
              let { strategy: t10, redirectUrl: i10, redirectCallbackUrl: n10, popup: r2, oidcPrompt: s2, enterpriseConnectionId: a2, identifier: o2 } = e10;
              return nS(this.#R, async () => {
                let e11 = i10;
                try {
                  new URL(i10);
                } catch {
                  e11 = window.location.origin + i10;
                }
                let l2 = {
                  redirectUrl: nC.clerk.buildUrlWithAuth(n10),
                  actionCompleteRedirectUrl: e11
                };
                if (r2) {
                  let t11 = nw(nC.clerk, {
                    redirectCallbackUrl: l2.redirectUrl,
                    redirectUrl: e11
                  });
                  l2.redirectUrl = t11.redirectCallbackUrl, l2.actionCompleteRedirectUrl = t11.redirectUrl;
                }
                await this._create({
                  strategy: t10,
                  ...l2,
                  identifier: o2
                }), "enterprise_sso" === t10 && await this.#R.__internal_basePost({
                  body: {
                    ...l2,
                    oidcPrompt: s2,
                    enterpriseConnectionId: a2,
                    strategy: "enterprise_sso"
                  },
                  action: "prepare_first_factor"
                });
                let { status: c2, externalVerificationRedirectURL: d2 } = this.#R.firstFactorVerification;
                "unverified" === c2 && d2 && (r2 ? (await nv(nC.clerk, {
                  popup: r2,
                  externalVerificationRedirectURL: d2
                }), await this.#R.reload()) : eP(d2));
              });
            }
            async web3(e10) {
              let { strategy: t10 } = e10, i10 = t10.replace("web3_", "").replace("_signature", "");
              return nS(this.#R, async () => {
                let n10, r2, s2;
                switch (i10) {
                  case "metamask":
                    n10 = await ta(), r2 = th;
                    break;
                  case "coinbase_wallet":
                    n10 = await to(), r2 = tu;
                    break;
                  case "base":
                    n10 = await tc(), r2 = tf;
                    break;
                  case "okx_wallet":
                    n10 = await tl(), r2 = tp;
                    break;
                  case "solana":
                    if (!e10.walletName) throw new T("Wallet name is required for Solana authentication.", {
                      code: "web3_solana_wallet_name_required"
                    });
                    n10 = await td(e10.walletName), r2 = (t11) => tm({
                      ...t11,
                      walletName: e10.walletName
                    });
                    break;
                  default:
                    throw Error(`Unsupported Web3 provider: ${i10}`);
                }
                await this._create({
                  identifier: n10
                });
                let a2 = this.#R.supportedFirstFactors?.find((e11) => e11.strategy === t10);
                if (!a2) throw new T("Web3 first factor not found", {
                  code: "factor_not_found"
                });
                await this.#R.__internal_basePost({
                  body: {
                    web3WalletId: a2.web3WalletId,
                    strategy: t10
                  },
                  action: "prepare_first_factor"
                });
                let { message: o2 } = this.firstFactorVerification;
                if (!o2) throw new T("Web3 nonce not found", {
                  code: "web3_nonce_not_found"
                });
                try {
                  s2 = await r2({
                    identifier: n10,
                    nonce: o2,
                    walletName: e10?.walletName,
                    provider: i10
                  });
                } catch (e11) {
                  if ("coinbase_wallet" === i10 && 4001 === e11.code) s2 = await r2({
                    identifier: n10,
                    nonce: o2,
                    provider: i10
                  });
                  else throw e11;
                }
                await this.#R.__internal_basePost({
                  body: {
                    signature: s2,
                    strategy: t10
                  },
                  action: "attempt_first_factor"
                });
              });
            }
            async passkey(e10) {
              let { flow: t10 } = e10 || {}, i10 = nC.clerk.__internal_isWebAuthnSupported || nc, n10 = nC.clerk.__internal_getPublicCredentials || iW, r2 = nC.clerk.__internal_isWebAuthnAutofillSupported || nd;
              if (!i10()) throw new E("Passkeys are not supported", {
                code: "passkey_not_supported"
              });
              return nS(this.#R, async () => {
                if ("autofill" === t10 || "discoverable" === t10) await this._create({
                  strategy: "passkey"
                });
                else {
                  if (!this.supportedFirstFactors.find((e12) => "passkey" === e12.strategy)) throw new T("Passkey factor not found", {
                    code: "factor_not_found"
                  });
                  await this.#R.__internal_basePost({
                    body: {
                      strategy: "passkey"
                    },
                    action: "prepare_first_factor"
                  });
                }
                let { nonce: e11 } = this.firstFactorVerification, i11 = e11 ? i$(JSON.parse(e11)) : null;
                if (!i11) throw new T("Missing public key options", {
                  code: "missing_public_key_options"
                });
                let s2 = false;
                "autofill" === t10 && (s2 = await r2());
                let { publicKeyCredential: a2, error: o2 } = await n10({
                  publicKeyOptions: i11,
                  conditionalUI: s2
                });
                if (!a2) throw new E(o2.message, {
                  code: "passkey_retrieval_failed"
                });
                await this.#R.__internal_basePost({
                  body: {
                    publicKeyCredential: JSON.stringify(iJ(a2)),
                    strategy: "passkey"
                  },
                  action: "attempt_first_factor"
                });
              });
            }
            async sendMFAPhoneCode() {
              return nS(this.#R, async () => {
                let e10 = this.#R.supportedSecondFactors?.find((e11) => "phone_code" === e11.strategy);
                if (!e10) throw new T("Phone code factor not found", {
                  code: "factor_not_found"
                });
                let { phoneNumberId: t10 } = e10;
                await this.#R.__internal_basePost({
                  body: {
                    phoneNumberId: t10,
                    strategy: "phone_code"
                  },
                  action: "prepare_second_factor"
                });
              });
            }
            async verifyMFAPhoneCode(e10) {
              let { code: t10 } = e10;
              return nS(this.#R, async () => {
                await this.#R.__internal_basePost({
                  body: {
                    code: t10,
                    strategy: "phone_code"
                  },
                  action: "attempt_second_factor"
                });
              });
            }
            async verifyTOTP(e10) {
              let { code: t10 } = e10;
              return nS(this.#R, async () => {
                await this.#R.__internal_basePost({
                  body: {
                    code: t10,
                    strategy: "totp"
                  },
                  action: "attempt_second_factor"
                });
              });
            }
            async verifyBackupCode(e10) {
              let { code: t10 } = e10;
              return nS(this.#R, async () => {
                await this.#R.__internal_basePost({
                  body: {
                    code: t10,
                    strategy: "backup_code"
                  },
                  action: "attempt_second_factor"
                });
              });
            }
            async ticket(e10) {
              let t10 = e10?.ticket ?? eF("__clerk_ticket");
              return this.create({
                ticket: t10 ?? void 0
              });
            }
            async finalize(e10) {
              let { navigate: t10 } = e10 || {};
              if (!this.#R.createdSessionId) throw Error("Cannot finalize sign-in without a created session.");
              return nS(this.#R, async () => {
                await nC.clerk.client?.reload(), await nC.clerk.setActive({
                  session: this.#R.createdSessionId,
                  navigate: t10
                });
              });
            }
            selectFirstFactor({ strategy: e10, emailAddressId: t10, phoneNumberId: i10 }) {
              if (!this.#R.supportedFirstFactors) return null;
              if (t10) {
                let i11 = this.#R.supportedFirstFactors.find((i12) => i12.strategy === e10 && i12.emailAddressId === t10);
                if (i11) return i11;
              }
              if (i10) {
                let t11 = this.#R.supportedFirstFactors.find((t12) => t12.strategy === e10 && t12.phoneNumberId === i10);
                if (t11) return t11;
              }
              let n10 = this.#R.supportedFirstFactors.find((t11) => t11.strategy === e10 && t11.safeIdentifier === this.#R.identifier);
              if (n10) return n10;
              let r2 = this.#R.supportedFirstFactors.find((t11) => t11.strategy === e10);
              return r2 || null;
            }
          }
          class nU {
            firstName;
            lastName;
            imageUrl;
            hasImage;
            constructor(e10) {
              this.fromJSON(e10);
            }
            fromJSON(e10) {
              return e10 && (this.firstName = e10.first_name, this.lastName = e10.last_name, this.imageUrl = e10.image_url ?? void 0, this.hasImage = e10.has_image ?? void 0), this;
            }
            __internal_toSnapshot() {
              return {
                first_name: this.firstName,
                last_name: this.lastName,
                image_url: this.imageUrl || null,
                has_image: this.hasImage || null
              };
            }
          }
          function nI(e10) {
            let { unsafeMetadata: t10 } = {
              ...e10
            }, i10 = t10 ? "object" == typeof t10 ? JSON.stringify(t10) : t10 : "";
            return {
              ...e10,
              ...t10 ? {
                unsafeMetadata: i10
              } : {}
            };
          }
          class nP extends tV {
            pathRoot = "/client/sign_ups";
            id;
            _status = null;
            requiredFields = [];
            missingFields = [];
            optionalFields = [];
            unverifiedFields = [];
            verifications = new iH(null);
            username = null;
            firstName = null;
            lastName = null;
            emailAddress = null;
            phoneNumber = null;
            web3wallet = null;
            externalAccount;
            hasPassword = false;
            unsafeMetadata = {};
            createdSessionId = null;
            createdUserId = null;
            abandonAt = null;
            legalAcceptedAt = null;
            locale = null;
            get status() {
              return this._status;
            }
            set status(e10) {
              let t10 = this._status;
              this._status = e10, e10 && t10 !== e10 && eA.debug("SignUp.status", {
                id: this.id,
                from: t10,
                to: e10
              });
            }
            __internal_future = new nT(this);
            __internal_basePost = this._basePost.bind(this);
            __internal_basePatch = this._basePatch.bind(this);
            constructor(e10 = null) {
              super(), this.fromJSON(e10);
            }
            create = async (e10) => {
              eA.debug("SignUp.create", {
                id: this.id,
                strategy: e10.strategy
              });
              let t10 = {
                ...e10
              };
              if (!t10.locale) {
                let e11 = e9();
                e11 && (t10.locale = e11);
              }
              if (!this.clientBypass() && !this.shouldBypassCaptchaForAttempt(e10)) {
                let e11 = new tK(nP.clerk), i10 = await e11.managedOrInvisible({
                  action: "signup"
                });
                if (!i10) throw new T("", {
                  code: "captcha_unavailable"
                });
                t10 = {
                  ...t10,
                  ...i10
                };
              }
              return this._basePost({
                path: this.pathRoot,
                body: nI(t10)
              });
            };
            prepareVerification = (e10) => (eA.debug("SignUp.prepareVerification", {
              id: this.id,
              strategy: e10.strategy
            }), this._basePost({
              body: e10,
              action: "prepare_verification"
            }));
            attemptVerification = (e10) => (eA.debug("SignUp.attemptVerification", {
              id: this.id,
              strategy: e10.strategy
            }), this._basePost({
              body: e10,
              action: "attempt_verification"
            }));
            prepareEmailAddressVerification = (e10) => this.prepareVerification(e10 || {
              strategy: "email_code"
            });
            attemptEmailAddressVerification = (e10) => this.attemptVerification({
              ...e10,
              strategy: "email_code"
            });
            createEmailLinkFlow = () => {
              let { run: e10, stop: t10 } = iU();
              return {
                startEmailLinkFlow: async ({ redirectUrl: i10 }) => (this.id || tA("SignUp"), await this.prepareEmailAddressVerification({
                  strategy: "email_link",
                  redirectUrl: i10
                }), new Promise((i11, n10) => {
                  e10(() => this.reload().then((e11) => {
                    let n11 = e11.verifications.emailAddress.status;
                    ("verified" === n11 || "expired" === n11) && (t10(), i11(e11));
                  }).catch((e11) => {
                    t10(), n10(e11);
                  }));
                })),
                cancelEmailLinkFlow: t10
              };
            };
            preparePhoneNumberVerification = (e10) => this.prepareVerification(e10 || {
              strategy: "phone_code"
            });
            attemptPhoneNumberVerification = (e10) => this.attemptVerification({
              ...e10,
              strategy: "phone_code"
            });
            prepareWeb3WalletVerification = (e10) => this.prepareVerification({
              strategy: "web3_metamask_signature",
              ...e10
            });
            attemptWeb3WalletVerification = async (e10) => {
              let { signature: t10, strategy: i10 = "web3_metamask_signature" } = e10;
              return this.attemptVerification({
                signature: t10,
                strategy: i10
              });
            };
            authenticateWithWeb3 = async (e10) => {
              let t10, { generateSignature: i10, identifier: n10, unsafeMetadata: r2, strategy: s2 = "web3_metamask_signature", legalAccepted: a2, walletName: o2 } = e10 || {}, l2 = s2.replace("web3_", "").replace("_signature", "");
              "function" != typeof i10 && tP("generateSignature");
              let c2 = n10 || this.web3wallet;
              await this.create({
                web3Wallet: c2,
                unsafeMetadata: r2,
                legalAccepted: a2
              }), await this.prepareWeb3WalletVerification({
                strategy: s2
              });
              let { message: d2 } = this.verifications.web3Wallet;
              d2 || tI("SignUp");
              try {
                t10 = await i10({
                  identifier: n10,
                  nonce: d2,
                  provider: l2,
                  walletName: o2
                });
              } catch (e11) {
                if ("coinbase_wallet" === l2 && 4001 === e11.code) t10 = await i10({
                  identifier: n10,
                  nonce: d2,
                  provider: l2
                });
                else throw e11;
              }
              return this.attemptWeb3WalletVerification({
                signature: t10,
                strategy: s2
              });
            };
            authenticateWithMetamask = async (e10) => {
              let t10 = await ta();
              return this.authenticateWithWeb3({
                identifier: t10,
                generateSignature: th,
                unsafeMetadata: e10?.unsafeMetadata,
                strategy: "web3_metamask_signature",
                legalAccepted: e10?.legalAccepted
              });
            };
            authenticateWithCoinbaseWallet = async (e10) => {
              let t10 = await to();
              return this.authenticateWithWeb3({
                identifier: t10,
                generateSignature: tu,
                unsafeMetadata: e10?.unsafeMetadata,
                strategy: "web3_coinbase_wallet_signature",
                legalAccepted: e10?.legalAccepted
              });
            };
            authenticateWithBase = async (e10) => {
              let t10 = await tc();
              return this.authenticateWithWeb3({
                identifier: t10,
                generateSignature: tf,
                unsafeMetadata: e10?.unsafeMetadata,
                strategy: "web3_base_signature",
                legalAccepted: e10?.legalAccepted
              });
            };
            authenticateWithOKXWallet = async (e10) => {
              let t10 = await tl();
              return this.authenticateWithWeb3({
                identifier: t10,
                generateSignature: tp,
                unsafeMetadata: e10?.unsafeMetadata,
                strategy: "web3_okx_wallet_signature",
                legalAccepted: e10?.legalAccepted
              });
            };
            authenticateWithSolana = async ({ walletName: e10, unsafeMetadata: t10, legalAccepted: i10 }) => {
              let n10 = await td(e10);
              return this.authenticateWithWeb3({
                identifier: n10,
                generateSignature: (t11) => tm({
                  ...t11,
                  walletName: e10
                }),
                unsafeMetadata: t10,
                strategy: "web3_solana_signature",
                legalAccepted: i10,
                walletName: e10
              });
            };
            authenticateWithRedirectOrPopup = async (e10, t10) => {
              let { redirectUrl: i10, redirectUrlComplete: n10, strategy: r2, continueSignUp: s2 = false, unsafeMetadata: a2, emailAddress: o2, legalAccepted: l2, oidcPrompt: c2, enterpriseConnectionId: d2 } = e10, h2 = nP.clerk.buildUrlWithAuth(i10), u2 = () => {
                let e11 = {
                  strategy: r2,
                  redirectUrl: h2,
                  actionCompleteRedirectUrl: n10,
                  unsafeMetadata: a2,
                  emailAddress: o2,
                  legalAccepted: l2,
                  oidcPrompt: c2,
                  enterpriseConnectionId: d2
                };
                return s2 && this.id ? this.update(e11) : this.create(e11);
              }, { verifications: p2 } = await u2().catch(async (e11) => {
                if (S(e11) && x(e11)) return await nP.clerk.__unstable__environment.reload(), u2();
                throw e11;
              }), { externalAccount: f2 } = p2, { status: m2, externalVerificationRedirectURL: g2 } = f2;
              "unverified" === m2 && g2 ? t10(g2) : tT(m2, nP.fapiClient.buildEmailAddress("support"));
            };
            authenticateWithRedirect = async (e10) => this.authenticateWithRedirectOrPopup(e10, eP);
            authenticateWithPopup = async (e10) => {
              let { popup: t10 } = e10 || {};
              return t10 || tP("popup"), nb(nP.clerk, "signUp", this.authenticateWithRedirectOrPopup, e10, (e11) => {
                t10.location.href = e11 instanceof URL ? e11.toString() : e11;
              });
            };
            update = (e10) => this._basePatch({
              body: nI(e10)
            });
            upsert = (e10) => this.id ? this.update(e10) : this.create(e10);
            validatePassword = (e10, t10) => {
              if (nP.clerk.__unstable__environment?.userSettings.passwordSettings) return nk({
                ...nP.clerk.__unstable__environment?.userSettings.passwordSettings,
                validatePassword: true
              })(e10, t10);
            };
            fromJSON(e10) {
              return e10 && (this.id = e10.id, this.status = e10.status, this.requiredFields = e10.required_fields, this.optionalFields = e10.optional_fields, this.missingFields = e10.missing_fields, this.unverifiedFields = e10.unverified_fields, this.verifications = new iH(e10.verifications), this.username = e10.username, this.firstName = e10.first_name, this.lastName = e10.last_name, this.emailAddress = e10.email_address, this.phoneNumber = e10.phone_number, this.hasPassword = e10.has_password, this.unsafeMetadata = e10.unsafe_metadata, this.createdSessionId = e10.created_session_id, this.createdUserId = e10.created_user_id, this.abandonAt = e10.abandon_at, this.web3wallet = e10.web3_wallet, this.legalAcceptedAt = e10.legal_accepted_at, this.locale = e10.locale), ix.emit("resource:update", {
                resource: this
              }), this;
            }
            __internal_toSnapshot() {
              return {
                object: "sign_up",
                id: this.id || "",
                status: this.status || null,
                required_fields: this.requiredFields,
                optional_fields: this.optionalFields,
                missing_fields: this.missingFields,
                unverified_fields: this.unverifiedFields,
                verifications: this.verifications.__internal_toSnapshot(),
                username: this.username,
                first_name: this.firstName,
                last_name: this.lastName,
                email_address: this.emailAddress,
                phone_number: this.phoneNumber,
                has_password: this.hasPassword,
                unsafe_metadata: this.unsafeMetadata,
                created_session_id: this.createdSessionId,
                created_user_id: this.createdUserId,
                abandon_at: this.abandonAt,
                web3_wallet: this.web3wallet,
                legal_accepted_at: this.legalAcceptedAt,
                locale: this.locale,
                external_account: this.externalAccount,
                external_account_strategy: this.externalAccount?.strategy
              };
            }
            clientBypass() {
              return nP.clerk.client?.captchaBypass;
            }
            shouldBypassCaptchaForAttempt(e10) {
              let t10 = nP.clerk.__unstable__environment.displayConfig.captchaOauthBypass;
              return !!(e10.transfer && t10.some((e11) => e11 === nP.clerk.client.signIn.firstFactorVerification.strategy) || e10.strategy && t10.some((t11) => t11 === e10.strategy));
            }
            __experimental_getEnterpriseConnections = () => tV._fetch({
              path: `/client/sign_ups/${this.id}/enterprise_connections`,
              method: "GET"
            }).then((e10) => (e10?.response).map((e11) => new nO(e11)));
          }
          class nT {
            verifications = {
              sendEmailCode: this.sendEmailCode.bind(this),
              verifyEmailCode: this.verifyEmailCode.bind(this),
              sendPhoneCode: this.sendPhoneCode.bind(this),
              verifyPhoneCode: this.verifyPhoneCode.bind(this)
            };
            #R;
            constructor(e10) {
              this.#R = e10;
            }
            get id() {
              return this.#R.id;
            }
            get requiredFields() {
              return this.#R.requiredFields;
            }
            get optionalFields() {
              return this.#R.optionalFields;
            }
            get missingFields() {
              return this.#R.missingFields;
            }
            get status() {
              return this.#R.status || "missing_requirements";
            }
            get username() {
              return this.#R.username;
            }
            get firstName() {
              return this.#R.firstName;
            }
            get lastName() {
              return this.#R.lastName;
            }
            get emailAddress() {
              return this.#R.emailAddress;
            }
            get phoneNumber() {
              return this.#R.phoneNumber;
            }
            get web3Wallet() {
              return this.#R.web3wallet;
            }
            get hasPassword() {
              return this.#R.hasPassword;
            }
            get unsafeMetadata() {
              return this.#R.unsafeMetadata;
            }
            get createdSessionId() {
              return this.#R.createdSessionId;
            }
            get createdUserId() {
              return this.#R.createdUserId;
            }
            get abandonAt() {
              return this.#R.abandonAt;
            }
            get legalAcceptedAt() {
              return this.#R.legalAcceptedAt;
            }
            get locale() {
              return this.#R.locale;
            }
            get unverifiedFields() {
              return this.#R.unverifiedFields;
            }
            get isTransferable() {
              return "transferable" === this.#R.verifications.externalAccount.status && this.#R.verifications.externalAccount.error?.code === "external_account_exists";
            }
            get existingSession() {
              if (("failed" === this.#R.verifications.externalAccount.status || "unverified" === this.#R.verifications.externalAccount.status) && this.#R.verifications.externalAccount.error?.code === "identifier_already_signed_in" && this.#R.verifications.externalAccount.error?.meta?.sessionId) return {
                sessionId: this.#R.verifications.externalAccount.error?.meta?.sessionId
              };
            }
            async getCaptchaToken() {
              let e10 = new tK(nP.clerk), t10 = await e10.managedOrInvisible({
                action: "signup"
              });
              if (!t10) throw Error("Captcha challenge failed");
              let { captchaError: i10, captchaToken: n10, captchaWidgetType: r2 } = t10;
              return {
                captchaToken: n10,
                captchaWidgetType: r2,
                captchaError: i10
              };
            }
            async _create(e10) {
              let { captchaToken: t10, captchaWidgetType: i10, captchaError: n10 } = await this.getCaptchaToken(), r2 = {
                transfer: e10.transfer,
                captchaToken: t10,
                captchaWidgetType: i10,
                captchaError: n10,
                ...e10,
                unsafeMetadata: e10.unsafeMetadata ? nI(e10.unsafeMetadata) : void 0,
                locale: e10.locale ?? e9()
              };
              await this.#R.__internal_basePost({
                path: this.#R.pathRoot,
                body: r2
              });
            }
            async create(e10) {
              return nS(this.#R, async () => {
                await this._create(e10);
              });
            }
            async update(e10) {
              return nS(this.#R, async () => {
                let t10 = {
                  ...e10,
                  unsafeMetadata: e10.unsafeMetadata ? nI(e10.unsafeMetadata) : void 0
                };
                await this.#R.__internal_basePatch({
                  path: this.#R.pathRoot,
                  body: t10
                });
              });
            }
            async password(e10) {
              return nS(this.#R, async () => {
                let { captchaToken: t10, captchaWidgetType: i10, captchaError: n10 } = await this.getCaptchaToken(), r2 = {
                  strategy: "password",
                  captchaToken: t10,
                  captchaWidgetType: i10,
                  captchaError: n10,
                  ...e10,
                  unsafeMetadata: e10.unsafeMetadata ? nI(e10.unsafeMetadata) : void 0
                };
                await this.#R.__internal_basePost({
                  path: this.#R.pathRoot,
                  body: r2
                });
              });
            }
            async sendEmailCode() {
              return nS(this.#R, async () => {
                await this.#R.__internal_basePost({
                  body: {
                    strategy: "email_code"
                  },
                  action: "prepare_verification"
                });
              });
            }
            async verifyEmailCode(e10) {
              let { code: t10 } = e10;
              return nS(this.#R, async () => {
                await this.#R.__internal_basePost({
                  body: {
                    strategy: "email_code",
                    code: t10
                  },
                  action: "attempt_verification"
                });
              });
            }
            async sendPhoneCode(e10) {
              let { phoneNumber: t10, channel: i10 = "sms" } = e10;
              return nS(this.#R, async () => {
                if (!this.#R.id) {
                  let { captchaToken: e11, captchaWidgetType: i11, captchaError: n10 } = await this.getCaptchaToken();
                  await this.#R.__internal_basePost({
                    path: this.#R.pathRoot,
                    body: {
                      phoneNumber: t10,
                      captchaToken: e11,
                      captchaWidgetType: i11,
                      captchaError: n10
                    }
                  });
                }
                await this.#R.__internal_basePost({
                  body: {
                    strategy: "phone_code",
                    channel: i10
                  },
                  action: "prepare_verification"
                });
              });
            }
            async verifyPhoneCode(e10) {
              let { code: t10 } = e10;
              return nS(this.#R, async () => {
                await this.#R.__internal_basePost({
                  body: {
                    strategy: "phone_code",
                    code: t10
                  },
                  action: "attempt_verification"
                });
              });
            }
            async sso(e10) {
              let { strategy: t10, redirectUrl: i10, redirectCallbackUrl: n10, unsafeMetadata: r2, legalAccepted: s2, oidcPrompt: a2, enterpriseConnectionId: o2, emailAddress: l2, popup: c2 } = e10;
              return nS(this.#R, async () => {
                let { captchaToken: e11, captchaWidgetType: d2, captchaError: h2 } = await this.getCaptchaToken(), u2 = i10;
                try {
                  new URL(i10);
                } catch {
                  u2 = window.location.origin + i10;
                }
                let p2 = {
                  redirectUrl: nP.clerk.buildUrlWithAuth(n10),
                  actionCompleteRedirectUrl: u2
                };
                if (c2) {
                  let e12 = nw(nP.clerk, {
                    redirectCallbackUrl: p2.redirectUrl,
                    redirectUrl: u2
                  });
                  p2.redirectUrl = e12.redirectCallbackUrl, p2.actionCompleteRedirectUrl = e12.redirectUrl;
                }
                let f2 = () => this.#R.__internal_basePost({
                  path: this.#R.pathRoot,
                  body: {
                    strategy: t10,
                    ...p2,
                    unsafeMetadata: r2,
                    legalAccepted: s2,
                    oidcPrompt: a2,
                    enterpriseConnectionId: o2,
                    emailAddress: l2,
                    captchaToken: e11,
                    captchaWidgetType: d2,
                    captchaError: h2
                  }
                });
                await f2().catch(async (e12) => {
                  if (S(e12) && x(e12)) return await nP.clerk.__unstable__environment.reload(), f2();
                  throw e12;
                });
                let { status: m2, externalVerificationRedirectURL: g2 } = this.#R.verifications.externalAccount;
                "unverified" === m2 && g2 && (c2 ? (await nv(nP.clerk, {
                  popup: c2,
                  externalVerificationRedirectURL: g2
                }), await this.#R.reload()) : eP(g2));
              });
            }
            async web3(e10) {
              let { strategy: t10, unsafeMetadata: i10, legalAccepted: n10 } = e10, r2 = t10.replace("web3_", "").replace("_signature", "");
              return nS(this.#R, async () => {
                let e11, s2, a2;
                switch (r2) {
                  case "metamask":
                    e11 = await ta(), s2 = th;
                    break;
                  case "coinbase_wallet":
                    e11 = await to(), s2 = tu;
                    break;
                  case "base":
                    e11 = await tc(), s2 = tf;
                    break;
                  case "okx_wallet":
                    e11 = await tl(), s2 = tp;
                    break;
                  default:
                    throw Error(`Unsupported Web3 provider: ${r2}`);
                }
                let o2 = e11 || this.#R.web3wallet;
                await this._create({
                  web3Wallet: o2,
                  unsafeMetadata: i10,
                  legalAccepted: n10
                }), await this.#R.__internal_basePost({
                  body: {
                    strategy: t10
                  },
                  action: "prepare_verification"
                });
                let { message: l2 } = this.#R.verifications.web3Wallet;
                l2 || tI("SignUp");
                try {
                  a2 = await s2({
                    identifier: e11,
                    nonce: l2
                  });
                } catch (t11) {
                  if ("coinbase_wallet" === r2 && 4001 === t11.code) a2 = await s2({
                    identifier: e11,
                    nonce: l2
                  });
                  else throw t11;
                }
                await this.#R.__internal_basePost({
                  body: {
                    signature: a2,
                    strategy: t10
                  },
                  action: "attempt_verification"
                });
              });
            }
            async ticket(e10) {
              let t10 = e10?.ticket ?? eF("__clerk_ticket");
              return this.create({
                ...e10,
                ticket: t10 ?? void 0
              });
            }
            async finalize(e10) {
              let { navigate: t10 } = e10 || {};
              return nS(this.#R, async () => {
                if (!this.#R.createdSessionId) throw Error("Cannot finalize sign-up without a created session.");
                await nP.clerk.setActive({
                  session: this.#R.createdSessionId,
                  navigate: t10
                });
              });
            }
          }
          class nO extends tV {
            id;
            name;
            constructor(e10) {
              super(), this.fromJSON(e10);
            }
            fromJSON(e10) {
              return e10 && (this.id = e10.id, this.name = e10.name), this;
            }
          }
          class nE extends tV {
            pathRoot = "tokens";
            jwt;
            static async create(e10, t10 = {}, i10 = {}) {
              return new nE(await tV._fetch({
                method: "POST",
                path: e10,
                body: t10,
                search: i10
              }), e10);
            }
            constructor(e10, t10) {
              super(), t10 && (this.pathRoot = t10), e10?.jwt && (this.jwt = e7(e10.jwt));
            }
            getRawString = () => this.jwt?.claims.__raw || "";
            fromJSON(e10) {
              return e10 && (this.jwt = e7(e10.jwt)), this;
            }
            __internal_toSnapshot() {
              return {
                object: "token",
                id: this.id || "",
                jwt: this.getRawString()
              };
            }
          }
          class nx extends tV {
            pathRoot = "/me";
            id = "";
            secret;
            uri;
            verified = false;
            backupCodes;
            updatedAt = null;
            createdAt = null;
            constructor(e10) {
              super(), this.fromJSON(e10);
            }
            fromJSON(e10) {
              return e10 && (this.id = e10.id, this.secret = e10.secret, this.uri = e10.uri, this.verified = e10.verified, this.backupCodes = e10.backup_codes, this.updatedAt = tZ(e10.updated_at), this.createdAt = tZ(e10.created_at)), this;
            }
          }
          class nR extends tV {
            pathRoot = "/me";
            id;
            codes = [];
            updatedAt = null;
            createdAt = null;
            constructor(e10) {
              super(), this.fromJSON(e10);
            }
            fromJSON(e10) {
              return e10 && (this.id = e10.id, this.codes = e10.codes, this.updatedAt = tZ(e10.updated_at), this.createdAt = tZ(e10.created_at)), this;
            }
          }
          class nz extends tV {
            advisory = null;
            form = {
              name: "",
              slug: "",
              logo: null,
              blurHash: null
            };
            constructor(e10 = null) {
              super(), this.fromJSON(e10);
            }
            fromJSON(e10) {
              return e10 && (e10.advisory && (this.advisory = this.withDefault(e10.advisory, this.advisory ?? null)), e10.form && (this.form.name = this.withDefault(e10.form.name, this.form.name), this.form.slug = this.withDefault(e10.form.slug, this.form.slug), this.form.logo = this.withDefault(e10.form.logo, this.form.logo), this.form.blurHash = this.withDefault(e10.form.blur_hash, this.form.blurHash))), this;
            }
            static async retrieve() {
              return await tV._fetch({
                path: "/me/organization_creation_defaults",
                method: "GET"
              }).then((e10) => new nz(e10?.response));
            }
            __internal_toSnapshot() {
              return {
                advisory: this.advisory ? {
                  code: this.advisory.code,
                  meta: this.advisory.meta,
                  severity: this.advisory.severity
                } : null,
                form: {
                  name: this.form.name,
                  slug: this.form.slug,
                  logo: this.form.logo,
                  blur_hash: this.form.blurHash
                }
              };
            }
          }
          class nM extends tV {
            pathRoot = "/me";
            id = "";
            externalId = null;
            username = null;
            emailAddresses = [];
            phoneNumbers = [];
            web3Wallets = [];
            externalAccounts = [];
            enterpriseAccounts = [];
            passkeys = [];
            samlAccounts = [];
            organizationMemberships = [];
            passwordEnabled = false;
            firstName = null;
            lastName = null;
            fullName = null;
            primaryEmailAddressId = null;
            primaryEmailAddress = null;
            primaryPhoneNumberId = null;
            primaryPhoneNumber = null;
            primaryWeb3WalletId = null;
            primaryWeb3Wallet = null;
            imageUrl = "";
            hasImage = false;
            twoFactorEnabled = false;
            totpEnabled = false;
            backupCodeEnabled = false;
            publicMetadata = {};
            unsafeMetadata = {};
            createOrganizationEnabled = false;
            createOrganizationsLimit = null;
            deleteSelfEnabled = false;
            lastSignInAt = null;
            legalAcceptedAt = null;
            updatedAt = null;
            createdAt = null;
            cachedSessionsWithActivities = null;
            static isUserResource(e10) {
              return !!e10 && e10 instanceof nM;
            }
            constructor(e10) {
              super(), this.fromJSON(e10);
            }
            path() {
              return this.pathRoot;
            }
            isPrimaryIdentification = (e10) => {
              switch (e10.constructor) {
                case iI:
                  return this.primaryEmailAddressId === e10.id;
                case i1:
                  return this.primaryPhoneNumberId === e10.id;
                case nF:
                  return this.primaryWeb3WalletId === e10.id;
                default:
                  return false;
              }
            };
            createEmailAddress = (e10) => {
              let { email: t10 } = e10 || {};
              return new iI({
                email_address: t10
              }, this.path() + "/email_addresses/").create();
            };
            createPasskey = () => nf.registerPasskey();
            createPhoneNumber = (e10) => {
              let { phoneNumber: t10 } = e10 || {};
              return new i1({
                phone_number: t10
              }, this.path() + "/phone_numbers/").create();
            };
            createWeb3Wallet = (e10) => {
              let { web3Wallet: t10 } = e10 || {};
              return new nF({
                web3_wallet: t10
              }, this.path() + "/web3_wallets/").create();
            };
            createExternalAccount = async (e10) => {
              let { strategy: t10, redirectUrl: i10, additionalScopes: n10 } = e10 || {};
              return new iZ((await tV._fetch({
                path: "/me/external_accounts",
                method: "POST",
                body: {
                  strategy: t10,
                  redirect_url: i10,
                  additional_scope: n10
                }
              }))?.response, this.path() + "/external_accounts");
            };
            createTOTP = async () => new nx((await tV._fetch({
              path: "/me/totp",
              method: "POST"
            }))?.response);
            verifyTOTP = async ({ code: e10 }) => new nx((await tV._fetch({
              path: "/me/totp/attempt_verification",
              method: "POST",
              body: {
                code: e10
              }
            }))?.response);
            disableTOTP = async () => new iw((await tV._fetch({
              path: "/me/totp",
              method: "DELETE"
            }))?.response);
            createBackupCode = async () => new nR((await tV._fetch({
              path: this.path() + "/backup_codes/",
              method: "POST"
            }))?.response);
            update = (e10) => this._basePatch({
              body: nI(e10)
            });
            updatePassword = (e10) => this._basePost({
              body: e10,
              path: `${this.path()}/change_password`
            });
            removePassword = (e10) => this._basePost({
              body: e10,
              path: `${this.path()}/remove_password`
            });
            delete = () => this._baseDelete({
              path: "/me"
            }).then((e10) => (ix.emit(iT, null), e10));
            getSessions = async () => {
              if (this.cachedSessionsWithActivities) return this.cachedSessionsWithActivities;
              let e10 = await n_.retrieve();
              return this.cachedSessionsWithActivities = e10, e10;
            };
            setProfileImage = (e10) => {
              let { file: t10 } = e10 || {};
              return null === t10 ? i0.delete(`${this.path()}/profile_image`) : i0.create(`${this.path()}/profile_image`, {
                file: t10
              });
            };
            getOrganizationInvitations = (e10) => nN.retrieve(e10);
            getOrganizationSuggestions = (e10) => i9.retrieve(e10);
            getOrganizationMemberships = (e10) => i7.retrieve(e10);
            getOrganizationCreationDefaults = () => nz.retrieve();
            leaveOrganization = async (e10) => new iw((await tV._fetch({
              path: `${this.path()}/organization_memberships/${e10}`,
              method: "DELETE"
            }))?.response);
            initializePaymentMethod = (e10) => ih(e10);
            addPaymentMethod = (e10) => iu(e10);
            getPaymentMethods = (e10) => ip(e10);
            get verifiedExternalAccounts() {
              return this.externalAccounts.filter((e10) => e10.verification?.status == "verified");
            }
            get unverifiedExternalAccounts() {
              return this.externalAccounts.filter((e10) => e10.verification?.status != "verified");
            }
            get verifiedWeb3Wallets() {
              return this.web3Wallets.filter((e10) => e10.verification?.status == "verified");
            }
            get hasVerifiedEmailAddress() {
              return this.emailAddresses.filter((e10) => "verified" === e10.verification.status).length > 0;
            }
            get hasVerifiedPhoneNumber() {
              return this.phoneNumbers.filter((e10) => "verified" === e10.verification.status).length > 0;
            }
            fromJSON(e10) {
              return e10 && (this.id = e10.id, this.externalId = e10.external_id || null, this.firstName = e10.first_name || null, this.lastName = e10.last_name || null, (this.firstName || this.lastName) && (this.fullName = (({ firstName: e11, lastName: t10, name: i10 }) => i10 || [
                e11,
                t10
              ].join(" ").trim() || "")({
                firstName: this.firstName,
                lastName: this.lastName
              })), this.imageUrl = e10.image_url || "", this.hasImage = e10.has_image || false, this.username = e10.username || null, this.passwordEnabled = e10.password_enabled || false, this.emailAddresses = (e10.email_addresses || []).map((e11) => new iI(e11, this.path() + "/email_addresses")), this.primaryEmailAddressId = e10.primary_email_address_id || null, this.primaryEmailAddress = this.emailAddresses.find(({ id: e11 }) => e11 === this.primaryEmailAddressId) || null, this.phoneNumbers = (e10.phone_numbers || []).map((e11) => new i1(e11, this.path() + "/phone_numbers")), this.primaryPhoneNumberId = e10.primary_phone_number_id || null, this.primaryPhoneNumber = this.phoneNumbers.find(({ id: e11 }) => e11 === this.primaryPhoneNumberId) || null, this.web3Wallets = (e10.web3_wallets || []).map((e11) => new nF(e11, this.path() + "/web3_wallets")), this.primaryWeb3WalletId = e10.primary_web3_wallet_id || null, this.primaryWeb3Wallet = this.web3Wallets.find(({ id: e11 }) => e11 === this.primaryWeb3WalletId) || null, this.externalAccounts = (e10.external_accounts || []).map((e11) => new iZ(e11, this.path() + "/external_accounts")), this.passkeys = (e10.passkeys || []).map((e11) => new nf(e11)), this.organizationMemberships = (e10.organization_memberships || []).map((e11) => new i7(e11)), this.samlAccounts = (e10.saml_accounts || []).map((e11) => new ne(e11, this.path() + "/saml_accounts")), this.enterpriseAccounts = (e10.enterprise_accounts || []).map((e11) => new iY(e11, this.path() + "/enterprise_accounts")), this.publicMetadata = e10.public_metadata || {}, this.unsafeMetadata = e10.unsafe_metadata || {}, this.totpEnabled = e10.totp_enabled || false, this.backupCodeEnabled = e10.backup_code_enabled || false, this.twoFactorEnabled = e10.two_factor_enabled || false, this.createOrganizationEnabled = e10.create_organization_enabled || false, this.createOrganizationsLimit = e10.create_organizations_limit || null, this.deleteSelfEnabled = e10.delete_self_enabled || false, e10.last_sign_in_at && (this.lastSignInAt = tZ(e10.last_sign_in_at)), e10.legal_accepted_at && (this.legalAcceptedAt = tZ(e10.legal_accepted_at)), this.updatedAt = tZ(e10.updated_at || void 0), this.createdAt = tZ(e10.created_at || void 0)), this;
            }
            __internal_toSnapshot() {
              return {
                object: "user",
                id: this.id,
                external_id: this.externalId,
                first_name: this.firstName,
                last_name: this.lastName,
                username: this.username,
                public_metadata: this.publicMetadata,
                unsafe_metadata: this.unsafeMetadata,
                image_url: this.imageUrl,
                has_image: this.hasImage,
                email_addresses: this.emailAddresses.map((e10) => e10.__internal_toSnapshot()),
                phone_numbers: this.phoneNumbers.map((e10) => e10.__internal_toSnapshot()),
                web3_wallets: this.web3Wallets.map((e10) => e10.__internal_toSnapshot()),
                external_accounts: this.externalAccounts.map((e10) => e10.__internal_toSnapshot()),
                passkeys: this.passkeys.map((e10) => e10.__internal_toSnapshot()),
                organization_memberships: this.organizationMemberships.map((e10) => e10.__internal_toSnapshot()),
                saml_accounts: this.samlAccounts.map((e10) => e10.__internal_toSnapshot()),
                enterprise_accounts: this.enterpriseAccounts.map((e10) => e10.__internal_toSnapshot()),
                totp_enabled: this.totpEnabled,
                backup_code_enabled: this.backupCodeEnabled,
                two_factor_enabled: this.twoFactorEnabled,
                create_organization_enabled: this.createOrganizationEnabled,
                create_organizations_limit: this.createOrganizationsLimit,
                delete_self_enabled: this.deleteSelfEnabled,
                primary_email_address_id: this.primaryEmailAddressId,
                primary_phone_number_id: this.primaryPhoneNumberId,
                primary_web3_wallet_id: this.primaryWeb3WalletId,
                password_enabled: this.passwordEnabled,
                profile_image_id: this.imageUrl,
                last_sign_in_at: this.lastSignInAt?.getTime() || null,
                legal_accepted_at: this.legalAcceptedAt?.getTime() || null,
                updated_at: this.updatedAt?.getTime() || null,
                created_at: this.createdAt?.getTime() || null
              };
            }
          }
          class nN extends tV {
            id;
            emailAddress;
            publicOrganizationData;
            publicMetadata = {};
            status;
            role;
            createdAt;
            updatedAt;
            static async retrieve(e10) {
              return await tV._fetch({
                path: "/me/organization_invitations",
                method: "GET",
                search: it(e10)
              }).then((e11) => {
                let { data: t10, total_count: i10 } = e11?.response;
                return {
                  total_count: i10,
                  data: t10.map((e12) => new nN(e12))
                };
              });
            }
            constructor(e10) {
              super(), this.fromJSON(e10);
            }
            accept = async () => await this._basePost({
              path: `/me/organization_invitations/${this.id}/accept`
            });
            fromJSON(e10) {
              return e10 && (this.id = e10.id, this.emailAddress = e10.email_address, this.publicOrganizationData = {
                hasImage: e10.public_organization_data.has_image,
                imageUrl: e10.public_organization_data.image_url,
                name: e10.public_organization_data.name,
                id: e10.public_organization_data.id,
                slug: e10.public_organization_data.slug
              }, this.publicMetadata = e10.public_metadata, this.role = e10.role, this.status = e10.status, this.createdAt = tZ(e10.created_at), this.updatedAt = tZ(e10.updated_at)), this;
            }
          }
          class nF extends tV {
            id;
            web3Wallet = "";
            verification;
            constructor(e10, t10) {
              super(), this.pathRoot = t10, this.fromJSON(e10);
            }
            create() {
              return this._basePost({
                body: {
                  web3_wallet: this.web3Wallet
                }
              });
            }
            prepareVerification = (e10) => this._basePost({
              action: "prepare_verification",
              body: {
                ...e10
              }
            });
            attemptVerification = (e10) => {
              let { signature: t10 } = e10;
              return this._basePost({
                action: "attempt_verification",
                body: {
                  signature: t10
                }
              });
            };
            destroy() {
              return this._baseDelete();
            }
            toString() {
              return this.web3Wallet;
            }
            fromJSON(e10) {
              return e10 && (this.id = e10.id, this.web3Wallet = e10.web3_wallet, this.verification = new iV(e10.verification)), this;
            }
            __internal_toSnapshot() {
              return {
                object: "web3_wallet",
                id: this.id,
                web3_wallet: this.web3Wallet,
                verification: this.verification.__internal_toSnapshot()
              };
            }
          }
          class nD extends tV {
            pathRoot = "/waitlist";
            id = "";
            updatedAt = null;
            createdAt = null;
            constructor(e10) {
              super(), this.fromJSON(e10);
            }
            fromJSON(e10) {
              return e10 && (this.id = e10.id, this.updatedAt = tZ(e10.updated_at), this.createdAt = tZ(e10.created_at)), this;
            }
            static async join(e10) {
              return new nD((await tV._fetch({
                path: "/waitlist",
                method: "POST",
                body: e10
              }))?.response);
            }
          }
          class nW extends tV {
            pathRoot = "/api_keys";
            id;
            type;
            name;
            subject;
            scopes;
            claims;
            revoked;
            revocationReason;
            expired;
            expiration;
            createdBy;
            description;
            secret;
            lastUsedAt;
            createdAt;
            updatedAt;
            constructor(e10) {
              super(), this.fromJSON(e10);
            }
            fromJSON(e10) {
              return e10 && (this.id = e10.id, this.type = e10.type, this.name = e10.name, this.subject = e10.subject, this.scopes = e10.scopes, this.claims = e10.claims, this.revoked = e10.revoked, this.revocationReason = e10.revocation_reason, this.expired = e10.expired, this.expiration = e10.expiration ? tZ(e10.expiration) : null, this.createdBy = e10.created_by, this.description = e10.description, this.secret = e10.secret, this.lastUsedAt = e10.last_used_at ? tZ(e10.last_used_at) : null, this.updatedAt = tZ(e10.updated_at), this.createdAt = tZ(e10.created_at)), this;
            }
            __internal_toSnapshot() {
              return {
                object: "api_key",
                id: this.id,
                type: this.type,
                name: this.name,
                subject: this.subject,
                scopes: this.scopes,
                claims: this.claims,
                revoked: this.revoked,
                revocation_reason: this.revocationReason,
                expired: this.expired,
                expiration: this.expiration ? this.expiration.getTime() : null,
                created_by: this.createdBy,
                description: this.description,
                last_used_at: this.lastUsedAt ? this.lastUsedAt.getTime() : null,
                created_at: this.createdAt.getTime(),
                updated_at: this.updatedAt.getTime()
              };
            }
          }
          function nL(e10, t10) {
            var i10, n10;
            return e10.id !== t10.id || e10.updatedAt.getTime() < t10.updatedAt.getTime() || (i10 = t10, n10 = e10, i10.organizationMemberships.length !== n10.organizationMemberships.length || i10.organizationMemberships[0]?.updatedAt !== n10.organizationMemberships[0]?.updatedAt);
          }
          function n$(e10, t10) {
            return !function(e11, t11) {
              if (!e11 && t11 || e11 && !t11) return true;
              if (!e11 && e11 === t11) return false;
              if (!e11 || !t11) return true;
              try {
                if (ie.isClientResource(e11)) return e11.id !== t11.id || e11.updatedAt.getTime() < t11.updatedAt.getTime() || e11.sessions.length !== t11.sessions.length;
                if (np.isSessionResource(e11)) {
                  var i10, n10;
                  return e11.id !== t11.id || e11.updatedAt.getTime() < t11.updatedAt.getTime() || e11.lastActiveToken?.jwt?.claims?.__raw !== t11.lastActiveToken?.jwt?.claims?.__raw || function(e12, t12) {
                    if (e12.lastActiveOrganizationId !== t12.lastActiveOrganizationId) return true;
                    let i11 = e12.user?.organizationMemberships?.find((t13) => t13.organization.id === e12.lastActiveOrganizationId), n11 = t12.user?.organizationMemberships?.find((t13) => t13.organization.id === e12.lastActiveOrganizationId);
                    return i11?.permissions?.length !== n11?.permissions?.length;
                  }(e11, t11) || (i10 = e11, n10 = t11, !!i10.user != !!n10.user || !!i10.user && !!n10.user && nL(i10.user, n10.user));
                }
                if (nM.isUserResource(e11)) return nL(e11, t11);
              } catch {
              }
              return true;
            }(e10, t10) ? e10 : t10;
          }
          let nj = (e10, t10) => {
            let i10 = {};
            for (let n10 in e10) i10[n10] = t10(e10[n10], n10);
            return i10;
          }, nJ = (e10, t10) => {
            let i10 = {};
            for (let n10 in e10) e10[n10] && t10(e10[n10]) && (i10[n10] = e10[n10]);
            return i10;
          };
          class nK {
            static keys = [
              "signInForceRedirectUrl",
              "signInFallbackRedirectUrl",
              "signUpForceRedirectUrl",
              "signUpFallbackRedirectUrl",
              "afterSignInUrl",
              "afterSignUpUrl",
              "redirectUrl"
            ];
            static preserved = [
              "redirectUrl"
            ];
            options;
            fromOptions;
            fromProps;
            fromSearchParams;
            mode;
            constructor(e10, t10 = {}, i10 = {}, n10) {
              this.options = e10, this.fromOptions = this.#z(e10 || {}), this.fromProps = this.#z(t10 || {}), this.fromSearchParams = this.#M(i10 || {}), this.mode = n10;
            }
            getAfterSignInUrl() {
              return this.#N("signIn");
            }
            getAfterSignUpUrl() {
              return this.#N("signUp");
            }
            getPreservedSearchParams() {
              return this.#F(this.#D());
            }
            toSearchParams() {
              return this.#F(this.#W());
            }
            #F(e10) {
              return new URLSearchParams(Object.entries(Object.fromEntries(Object.entries(e10).map(([e11, t10]) => [
                et(e11),
                t10
              ]))).reduce((e11, [t10, i10]) => (null != i10 && (e11[t10] = i10), e11), {}));
            }
            #D() {
              return Object.fromEntries(Object.entries({
                ...this.fromSearchParams
              }).filter(([e10]) => nK.preserved.includes(e10)));
            }
            #W() {
              let e10 = this.fromSearchParams.signUpForceRedirectUrl || this.fromProps.signUpForceRedirectUrl || this.fromOptions.signUpForceRedirectUrl, t10 = this.fromSearchParams.signUpFallbackRedirectUrl || this.fromProps.signUpFallbackRedirectUrl || this.fromOptions.signUpFallbackRedirectUrl, i10 = this.fromSearchParams.signInForceRedirectUrl || this.fromProps.signInForceRedirectUrl || this.fromOptions.signInForceRedirectUrl, n10 = this.fromSearchParams.signInFallbackRedirectUrl || this.fromProps.signInFallbackRedirectUrl || this.fromOptions.signInFallbackRedirectUrl, r2 = this.fromSearchParams.afterSignInUrl || this.fromProps.afterSignInUrl || this.fromOptions.afterSignInUrl, s2 = {
                signUpForceRedirectUrl: e10,
                signUpFallbackRedirectUrl: t10,
                signInFallbackRedirectUrl: n10,
                signInForceRedirectUrl: i10,
                afterSignInUrl: r2,
                afterSignUpUrl: this.fromSearchParams.afterSignUpUrl || this.fromProps.afterSignUpUrl || this.fromOptions.afterSignUpUrl,
                redirectUrl: this.fromSearchParams.redirectUrl || this.fromProps.redirectUrl || this.fromOptions.redirectUrl
              };
              return e10 && delete s2.signUpFallbackRedirectUrl, i10 && delete s2.signInFallbackRedirectUrl, s2;
            }
            #N(e10) {
              var t10, i10;
              let n10, r2, s2 = `${e10}ForceRedirectUrl`, a2 = `${e10}FallbackRedirectUrl`, o2 = `after${e10[0].toUpperCase()}${e10.slice(1)}Url`;
              (r2 = this.fromSearchParams[s2] || this.fromProps[s2] || this.fromOptions[s2]) && (n10 = s2), (r2 ||= this.fromSearchParams.redirectUrl) && (n10 = "redirectUrl"), (r2 ||= this.fromSearchParams[a2] || this.fromProps[a2] || this.fromOptions[a2]) && (n10 = a2);
              let l2 = this.fromSearchParams[o2] || this.fromProps[o2] || this.fromProps.redirectUrl || this.fromOptions[o2];
              return (t10 = n10, (i10 = r2) && l2 && Z(`Clerk: The "${t10}" prop ("${i10}") has priority over the legacy "${o2}" (or "redirectUrl") ("${l2}"), which will be completely ignored in this case. "${o2}" (or "redirectUrl" prop) should be replaced with the new "fallbackRedirectUrl" or "forceRedirectUrl" props instead. Learn more: https://clerk.com/docs/guides/custom-redirects#redirect-url-props`), (r2 ||= l2) || "modal" !== this.mode) ? r2 || "/" : window.location.href;
            }
            #z(e10) {
              t_(e10);
              let t10 = {};
              return nK.keys.forEach((i10) => {
                t10[i10] = e10[i10];
              }), nj(this.#L(this.#$(nJ(t10, Boolean))), (e11) => e11.toString());
            }
            #M(e10) {
              t_(e10);
              let t10 = {};
              return nK.keys.forEach((i10) => {
                e10 instanceof URLSearchParams ? t10[i10] = e10.get(et(i10)) : t10[i10] = e10[et(i10)];
              }), nj(this.#L(this.#$(nJ(t10, Boolean))), (e11) => e11.toString());
            }
            #$(e10) {
              return nj(e10, (e11) => e22(e11, window.location.origin));
            }
            #L = (e10) => nJ(e10, /* @__PURE__ */ ((e11, t10) => (i10) => {
              let n10 = i10;
              if ("string" == typeof n10 && (n10 = e22(n10, t10)), !e11) return true;
              let r2 = t10 === n10.origin, s2 = !function(e12) {
                if (function(e13) {
                  if (!function(e14) {
                    if (!e14) return false;
                    try {
                      return new URL(e14), true;
                    } catch {
                      return false;
                    }
                  }(e13)) return false;
                  let t11 = new URL(e13).protocol;
                  return eZ.some((e14) => e14 === t11);
                }(e12)) return true;
                for (let t11 of e4) if (t11.test(e12.pathname)) return true;
                return false;
              }(n10) && (r2 || e11.map((e12) => "string" == typeof e12 ? ((e13) => {
                try {
                  return eV(e13);
                } catch (t11) {
                  throw Error(`Invalid pattern: ${e13}.
Consult the documentation of glob-to-regexp here: https://www.npmjs.com/package/glob-to-regexp.
${t11.message}`);
                }
              })(e3(e12)) : e12).some((e12) => e12.test(e3(n10.origin))));
              return s2 || Z(`Clerk: Redirect URL ${n10} is not on one of the allowedRedirectOrigins, falling back to the default redirect URL.`), s2;
            })(this.options?.allowedRedirectOrigins, window.location.origin));
          }
          let nB = "__clerk_db_jwt";
          function nV(e10, t10) {
            let i10 = new URL(e10), n10 = i10.searchParams.get(nB);
            i10.searchParams.delete(nB);
            let r2 = n10 || t10;
            return r2 && i10.searchParams.set(nB, r2), i10;
          }
          let nq = (e10) => nH(nG(e10)), nH = (e10) => {
            let t10 = new URL(e10);
            return t10.searchParams.delete(nB), t10;
          }, nG = (e10) => {
            let t10 = new URL(e10);
            return t10.searchParams.delete("__dev_session"), t10.hash = decodeURI(t10.hash).replace(/__clerk_db_jwt\[(.*)\]/, ""), t10.href.endsWith("#") && (t10.hash = ""), t10;
          };
          function nZ(e10) {
            for (var t10 = 1; t10 < arguments.length; t10++) {
              var i10 = arguments[t10];
              for (var n10 in i10) "__proto__" !== n10 && (e10[n10] = i10[n10]);
            }
            return e10;
          }
          var nY = function e10(t10, i10) {
            function n10(e11, n11, r2) {
              if ("undefined" != typeof document) {
                "number" == typeof (r2 = nZ({}, i10, r2)).expires && (r2.expires = new Date(Date.now() + 864e5 * r2.expires)), r2.expires && (r2.expires = r2.expires.toUTCString()), e11 = encodeURIComponent(e11).replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent).replace(/[()]/g, escape);
                var s2 = "";
                for (var a2 in r2) r2[a2] && (s2 += "; " + a2, true !== r2[a2] && (s2 += "=" + r2[a2].split(";")[0]));
                return document.cookie = e11 + "=" + t10.write(n11, e11) + s2;
              }
            }
            return Object.create({
              set: n10,
              get: function(e11) {
                if ("undefined" != typeof document && (!arguments.length || e11)) {
                  for (var i11 = document.cookie ? document.cookie.split("; ") : [], n11 = {}, r2 = 0; r2 < i11.length; r2++) {
                    var s2 = i11[r2].split("="), a2 = s2.slice(1).join("=");
                    try {
                      var o2 = decodeURIComponent(s2[0]);
                      if (o2 in n11 || (n11[o2] = t10.read(a2, o2)), e11 === o2) break;
                    } catch {
                    }
                  }
                  return e11 ? n11[e11] : n11;
                }
              },
              remove: function(e11, t11) {
                n10(e11, "", nZ({}, t11, {
                  expires: -1
                }));
              },
              withAttributes: function(t11) {
                return e10(this.converter, nZ({}, this.attributes, t11));
              },
              withConverter: function(t11) {
                return e10(nZ({}, this.converter, t11), this.attributes);
              }
            }, {
              attributes: {
                value: Object.freeze(i10)
              },
              converter: {
                value: Object.freeze(t10)
              }
            });
          }({
            read: function(e10) {
              return '"' === e10[0] && (e10 = e10.slice(1, -1)), e10.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);
            },
            write: function(e10) {
              return encodeURIComponent(e10).replace(/%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g, decodeURIComponent);
            }
          }, {
            path: "/"
          });
          function nQ(e10) {
            return {
              get: () => nY.get(e10),
              set(t10, i10 = {}) {
                nY.set(e10, t10, i10);
              },
              remove(t10) {
                nY.remove(e10, t10);
              }
            };
          }
          let nX = (e10) => "https:" === window.location.protocol || "None" === e10 && void 0 === window.safari && (void 0 !== window.isSecureContext ? window.isSecureContext : "localhost" === window.location.hostname);
          function n0(e10, t10) {
            let i10 = function(e11) {
              try {
                return new Date(e11 || /* @__PURE__ */ new Date());
              } catch {
                return /* @__PURE__ */ new Date();
              }
            }(e10);
            return i10.setFullYear(i10.getFullYear() + t10), i10;
          }
          let n1 = nQ("__clerk_test_etld"), n3 = [
            ".lovable.app",
            ".lovableproject.com",
            ".webcontainer-api.io",
            ".vusercontent.net",
            ".v0.dev",
            ".v0.app",
            ".lp.dev",
            ".replit.dev"
          ];
          function n2() {
            try {
              return n3.some((e10) => window.location.hostname.endsWith(e10));
            } catch {
              return false;
            }
          }
          let n4 = "__client_uat", n6 = "__session", n5 = (e10) => {
            let t10 = e10.usePartitionedCookies(), i10 = t10 || tt() || n2() ? "None" : "Lax", n10 = nX(i10);
            return {
              sameSite: i10,
              secure: n10,
              partitioned: t10 && n10
            };
          };
          async function n8(e10) {
            let t10;
            try {
              t10 = await q(e10);
            } catch (o2) {
              var n10;
              n10 = `Suffixed cookie failed due to ${o2.message} (secure-context: ${window.isSecureContext}, url: ${window.location.href})`, G.has(n10) || (console.log(n10), G.add(n10));
              let { default: r2 } = await i2.e("199").then(i2.t.bind(i2, 394, 23)), { default: s2 } = await i2.e("199").then(i2.t.bind(i2, 7202, 23)), a2 = r2(e10);
              t10 = s2.stringify(a2).replace(/\+/gi, "-").replace(/\//gi, "_").substring(0, 8);
            }
            return t10;
          }
          let n7 = (e10) => {
            let t10 = e10.usePartitionedCookies(), i10 = t10 || tt() || n2() ? "None" : "Lax", n10 = nX(i10);
            return {
              sameSite: i10,
              secure: n10,
              partitioned: t10 && n10
            };
          };
          var n9 = i2(2788), re = i2.n(n9);
          class rt {
            lock = function(e10) {
              let t10 = new (re())();
              return {
                acquireLockAndRun: async (i10) => {
                  if ("locks" in navigator && isSecureContext) {
                    let t11 = new AbortController(), n10 = setTimeout(() => t11.abort(), 4999);
                    return await navigator.locks.request(e10, {
                      signal: t11.signal
                    }, async () => (clearTimeout(n10), await i10())).catch(() => false);
                  }
                  if (await t10.acquireLock(e10, 5e3)) try {
                    return await i10();
                  } finally {
                    await t10.releaseLock(e10);
                  }
                }
              };
            }("clerk.lock.refreshSessionToken");
            workerTimers = iA();
            timerId = null;
            initiated = false;
            startPollingForSessionToken(e10) {
              if (this.timerId || this.initiated) return;
              let t10 = async () => {
                this.initiated = true, await this.lock.acquireLockAndRun(e10), this.timerId = this.workerTimers.setTimeout(t10, 5e3);
              };
              t10();
            }
            stopPollingForSessionToken() {
              null != this.timerId && (this.workerTimers.clearTimeout(this.timerId), this.timerId = null), this.initiated = false;
            }
          }
          class ri {
            clerk;
            instanceType;
            clerkEventBus;
            poller = null;
            clientUat;
            sessionCookie;
            activeCookie;
            devBrowser;
            static async create(e10, t10, i10, n10) {
              let r2 = await n8(e10.publishableKey), s2 = new ri(e10, t10, r2, i10, n10);
              return await s2.setup(), s2;
            }
            constructor(e10, t10, i10, r2, s2) {
              this.clerk = e10, this.instanceType = r2, this.clerkEventBus = s2, ix.on(iP, ({ token: e11 }) => {
                this.updateSessionCookie(e11 && e11.getRawString()), this.setClientUatCookieForDevelopmentInstances();
              }), ix.on(iT, () => this.handleSignOut()), ix.on(iO, () => {
                this.devBrowser.refreshCookies();
              }), this.refreshTokenOnFocus(), this.startPollingForToken();
              let a2 = {
                usePartitionedCookies: () => iM.getInstance().partitionedCookies
              };
              this.clientUat = ((e11, t11) => {
                let i11 = nQ(n4), r3 = nQ(H(n4, e11));
                return {
                  set: (e12) => {
                    let s3 = n0(Date.now(), 1), a3 = t11.usePartitionedCookies(), o2 = a3 || tt() || n2() ? "None" : "Strict", l2 = nX(o2), c2 = a3 && l2, d2 = function(e13 = window.location.hostname, t12 = n1, i12) {
                      if (n) return n;
                      if ([
                        "localhost",
                        "127.0.0.1",
                        "0.0.0.0"
                      ].includes(e13)) return e13;
                      let r4 = e13.split(".");
                      if (1 === r4.length) return e13;
                      for (let e14 = r4.length - 2; e14 >= 0; e14--) {
                        let s4 = r4.slice(e14).join(".");
                        if (t12.set("1", {
                          ...i12,
                          domain: s4
                        }), "1" === t12.get()) return t12.remove({
                          ...i12,
                          domain: s4
                        }), n = s4, s4;
                        t12.remove({
                          ...i12,
                          domain: s4
                        });
                      }
                      return n = e13, e13;
                    }(void 0, void 0, {
                      sameSite: o2,
                      secure: l2
                    }), h2 = "0";
                    e12 && e12.updatedAt && e12.signedInSessions.length > 0 && (h2 = Math.floor(e12.updatedAt.getTime() / 1e3).toString()), r3.remove(), i11.remove(), r3.set(h2, {
                      domain: d2,
                      expires: s3,
                      partitioned: c2,
                      sameSite: o2,
                      secure: l2
                    }), i11.set(h2, {
                      domain: d2,
                      expires: s3,
                      partitioned: c2,
                      sameSite: o2,
                      secure: l2
                    });
                  },
                  get: () => parseInt(r3.get() || i11.get() || "0", 10)
                };
              })(i10, a2), this.sessionCookie = ((e11, t11) => {
                let i11 = nQ(n6), n10 = nQ(H(n6, e11));
                return {
                  set: (e12) => {
                    let r3 = n0(Date.now(), 1), { sameSite: s3, secure: a3, partitioned: o2 } = n5(t11);
                    o2 && (i11.remove(), n10.remove()), i11.set(e12, {
                      expires: r3,
                      sameSite: s3,
                      secure: a3,
                      partitioned: o2
                    }), n10.set(e12, {
                      expires: r3,
                      sameSite: s3,
                      secure: a3,
                      partitioned: o2
                    });
                  },
                  remove: () => {
                    let e12 = n5(t11);
                    i11.remove(e12), n10.remove(e12), e12.partitioned && (i11.remove(), n10.remove());
                  },
                  get: () => n10.get() || i11.get()
                };
              })(i10, a2), this.activeCookie = (() => {
                let e11 = nQ("clerk_active_context"), t11 = {
                  secure: nX("None")
                };
                return {
                  set: (i11) => {
                    e11.set(i11, t11);
                  },
                  get: () => e11.get(),
                  remove: () => e11.remove(t11)
                };
              })(), this.devBrowser = function({ cookieSuffix: e11, frontendApi: t11, fapiClient: i11, cookieOptions: n10 }) {
                let r3, s3 = ((e12, t12) => {
                  let i12 = nQ(nB), n11 = nQ(H(nB, e12));
                  return {
                    get: () => n11.get() || i12.get(),
                    set: (e13) => {
                      let r4 = n0(Date.now(), 1), { sameSite: s4, secure: a4, partitioned: o3 } = n7(t12);
                      o3 && (n11.remove(), i12.remove()), n11.set(e13, {
                        expires: r4,
                        sameSite: s4,
                        secure: a4,
                        partitioned: o3
                      }), i12.set(e13, {
                        expires: r4,
                        sameSite: s4,
                        secure: a4,
                        partitioned: o3
                      });
                    },
                    remove: () => {
                      let e13 = n7(t12);
                      n11.remove(e13), i12.remove(e13), e13.partitioned && (n11.remove(), i12.remove());
                    }
                  };
                })(e11, n10);
                function a3() {
                  return r3 || s3.get();
                }
                function o2(e12) {
                  r3 = e12, s3.set(e12);
                }
                function l2() {
                  r3 = void 0, s3.remove();
                }
                return {
                  clear: function() {
                    l2();
                  },
                  setup: async function e12() {
                    if (!eY(t11)) return;
                    i11.onBeforeRequest((e14) => {
                      let t12 = a3();
                      t12 && e14?.url && (e14.url = nV(e14.url, t12));
                    }), i11.onAfterResponse((e14, t12) => {
                      let i12 = t12?.headers?.get("Clerk-Db-Jwt");
                      i12 && o2(i12);
                    });
                    let e13 = function(e14) {
                      let t12 = e14.searchParams.get(nB) || "";
                      return nq(e14).href !== e14.href && void 0 !== globalThis.history && globalThis.history.replaceState(null, "", nq(e14)), t12;
                    }(new URL(window.location.href));
                    if (e13) return void o2(e13);
                    let n11 = s3.get();
                    if (n11) {
                      r3 = n11;
                      return;
                    }
                    let l3 = i11.buildUrl({
                      path: "/dev_browser"
                    }), c2 = await fetch(l3.toString(), {
                      method: "POST"
                    });
                    if (!c2.ok) {
                      let e14 = function(e15 = []) {
                        return e15.length > 0 ? e15.map((e16) => new w(e16)) : [];
                      }((await c2.json()).errors);
                      e14[0] ? tS(e14[0].longMessage) : tS();
                    }
                    let d2 = await c2.json();
                    o2(d2?.id);
                  },
                  getDevBrowserJWT: a3,
                  setDevBrowserJWT: o2,
                  removeDevBrowserJWT: l2,
                  refreshCookies: function() {
                    let e12 = a3();
                    e12 && o2(e12);
                  }
                };
              }({
                frontendApi: e10.frontendApi,
                fapiClient: t10,
                cookieSuffix: i10,
                cookieOptions: a2
              });
            }
            async setup() {
              return "production" === this.instanceType ? this.setupProduction() : this.setupDevelopment();
            }
            isSignedOut() {
              return this.clerk.loaded ? !!this.clerk.user : 0 >= this.clientUat.get();
            }
            async handleUnauthenticatedDevBrowser() {
              this.devBrowser.clear(), await this.devBrowser.setup();
            }
            decorateUrlWithDevBrowserToken(e10) {
              let t10 = this.devBrowser.getDevBrowserJWT();
              if (!t10) throw Error(`${tk} Missing dev browser jwt. Please contact support.`);
              return nV(e10, t10);
            }
            async setupDevelopment() {
              await this.devBrowser.setup();
            }
            setupProduction() {
              this.devBrowser.clear();
            }
            startPollingForToken() {
              this.poller || (this.poller = new rt(), this.poller.startPollingForSessionToken(() => this.refreshSessionToken()));
            }
            stopPollingForToken() {
              this.poller && (this.poller.stopPollingForSessionToken(), this.poller = null);
            }
            refreshTokenOnFocus() {
              window.addEventListener("focus", () => {
                "visible" === document.visibilityState && this.refreshSessionToken({
                  updateCookieImmediately: true
                });
              });
            }
            async refreshSessionToken({ updateCookieImmediately: e10 = false } = {}) {
              if (this.clerk.session) try {
                let t10 = await this.clerk.session.getToken();
                e10 && this.updateSessionCookie(t10);
              } catch (e11) {
                return this.handleGetTokenError(e11);
              }
            }
            updateSessionCookie(e10) {
              if (!document.hasFocus() && !this.isCurrentContextActive() || e10 && this.#j(e10)) return;
              let t10 = this.clerk.client?.sessions;
              return t10?.length > 1 && e10 && eA.info("Updating session cookie (multi-session client)", {
                activeSessionId: this.clerk.session?.id,
                sessionCount: t10.length,
                hasActor: !!this.clerk.session?.actor
              }, "authCookieService"), e10 || d() || eA.warn("Removing session cookie (offline)", {
                sessionId: this.clerk.session?.id
              }, "authCookieService"), this.setActiveContextInStorage(), e10 ? this.sessionCookie.set(e10) : this.sessionCookie.remove();
            }
            #j(e10) {
              let t10 = this.#J(e10);
              if (!t10 || null == t1(t10)) return false;
              let i10 = this.#J(this.sessionCookie.get());
              if (!i10 || null == t1(i10)) return false;
              let n10 = i10.jwt?.claims?.exp;
              return !("number" != typeof n10 || n10 <= Math.floor(Date.now() / 1e3)) && t3(i10) === t3(t10) && (t22(i10) || "") === (t22(t10) || "") && t0(i10, t10) === i10;
            }
            #J(e10) {
              if (!e10) return null;
              try {
                let t10 = new nE({
                  id: "__session",
                  jwt: e10,
                  object: "token"
                });
                return t10.jwt ? t10 : null;
              } catch {
                return null;
              }
            }
            setClientUatCookieForDevelopmentInstances() {
              "production" !== this.instanceType && this.inCustomDevelopmentDomain() && this.clientUat.set(this.clerk.client);
            }
            inCustomDevelopmentDomain() {
              let e10 = this.clerk.frontendApi.replace("clerk.", "");
              return !window.location.host.endsWith(e10);
            }
            handleGetTokenError(e10) {
              if (S(e10) || O(e10) || (`${e10.message}${e10.name}` || "").toLowerCase().replace(/\s+/g, "").includes("networkerror")) {
                if (R(e10)) {
                  eA.warn("Token fetch failed with 4xx, triggering unauthenticated flow", {
                    errorCode: S(e10) ? e10.errors[0]?.code : void 0,
                    sessionId: this.clerk.session?.id
                  }, "authCookieService"), this.clerk.handleUnauthenticated().catch(ey.ZT);
                  return;
                }
                this.clerkEventBus.emit(m, "degraded"), eA.warn("Token fetch failed, status degraded", {
                  errorName: e10?.name,
                  sessionId: this.clerk.session?.id
                }, "authCookieService");
              }
            }
            handleSignOut() {
              this.activeCookie.remove(), this.sessionCookie.remove(), this.setClientUatCookieForDevelopmentInstances();
            }
            setActiveContextInStorage() {
              let e10 = this.clerk.session?.id || "", t10 = this.clerk.organization?.id || "", i10 = `${e10}:${t10}`;
              ":" !== i10 ? this.activeCookie.set(i10) : this.activeCookie.remove();
            }
            isCurrentContextActive() {
              let e10 = this.activeCookie.get();
              if (!e10) return true;
              let [t10, i10] = e10.split(":"), n10 = this.clerk.session?.id || "", r2 = this.clerk.organization?.id || "";
              return t10 === n10 && i10 === r2;
            }
            getSessionCookie() {
              return this.sessionCookie.get();
            }
          }
          class rn {
            clerk;
            captchaChallenge;
            timers;
            constructor(e10, t10 = new tK(e10), i10 = iA()) {
              this.clerk = e10, this.captchaChallenge = t10, this.timers = i10;
            }
            async start() {
              this.isEnabled() && (await this.challengeAndSend(), this.timers.setInterval(() => {
                this.challengeAndSend();
              }, this.intervalInMs()));
            }
            async challengeAndSend() {
              if (!(!this.clerk.client || this.clientBypass())) try {
                let e10 = await this.captchaChallenge.invisible({
                  action: "heartbeat"
                });
                await this.clerk.client.__internal_sendCaptchaToken(e10);
              } catch {
              }
            }
            isEnabled() {
              return !!this.clerk.__unstable__environment?.displayConfig?.captchaHeartbeat;
            }
            clientBypass() {
              return this.clerk.client?.captchaBypass;
            }
            intervalInMs() {
              return this.clerk.__unstable__environment?.displayConfig?.captchaHeartbeatIntervalMs ?? 6e5;
            }
          }
          let rr = [
            "/client",
            "/waitlist"
          ];
          function rs(e10) {
            let t10;
            try {
              t10 = new nE({
                jwt: e10 || "",
                object: "token",
                id: void 0
              });
            } catch {
              t10 = null;
            }
            if (ie.clearInstance(), !t10?.jwt) return ie.getOrCreateInstance({
              object: "client",
              last_active_session_id: null,
              id: "client_init",
              sessions: []
            });
            let { sessionId: i10, userId: n10, orgId: r2, orgRole: s2, orgPermissions: a2, orgSlug: o2, factorVerificationAge: l2 } = ((e11) => {
              let t11, i11, n11, r3, s3 = e11.fva ?? null, a3 = e11.sts ?? null;
              if (2 === e11.v) {
                if (e11.o) {
                  t11 = e11.o?.id, n11 = e11.o?.slg, e11.o?.rol && (i11 = `org:${e11.o?.rol}`);
                  let { org: s4 } = nl(e11.fea), { permissions: a4, featurePermissionMap: o3 } = (({ per: e12, fpm: t12 }) => {
                    if (!e12 || !t12) return {
                      permissions: [],
                      featurePermissionMap: []
                    };
                    let i12 = e12.split(",").map((e13) => e13.trim());
                    return {
                      permissions: i12,
                      featurePermissionMap: t12.split(",").map((e13) => Number.parseInt(e13.trim(), 10)).map((e13) => e13.toString(2).padStart(i12.length, "0").split("").map((e14) => Number.parseInt(e14, 10)).reverse()).filter(Boolean)
                    };
                  })({
                    per: e11.o?.per,
                    fpm: e11.o?.fpm
                  });
                  r3 = function({ features: e12, permissions: t12, featurePermissionMap: i12 }) {
                    if (!e12 || !t12 || !i12) return [];
                    let n12 = [];
                    for (let r4 = 0; r4 < e12.length; r4++) {
                      let s5 = e12[r4];
                      if (r4 >= i12.length) continue;
                      let a5 = i12[r4];
                      if (a5) for (let e13 = 0; e13 < a5.length; e13++) 1 === a5[e13] && n12.push(`org:${s5}:${t12[e13]}`);
                    }
                    return n12;
                  }({
                    features: s4,
                    featurePermissionMap: o3,
                    permissions: a4
                  });
                }
              } else t11 = e11.org_id, i11 = e11.org_role, n11 = e11.org_slug, r3 = e11.org_permissions;
              return {
                sessionClaims: e11,
                sessionId: e11.sid,
                sessionStatus: a3,
                actor: e11.act,
                userId: e11.sub,
                orgId: t11,
                orgRole: i11,
                orgSlug: n11,
                orgPermissions: r3,
                factorVerificationAge: s3
              };
            })(t10.jwt.claims), c2 = {
              object: "client",
              last_active_session_id: i10,
              id: "client_init",
              sessions: [
                {
                  object: "session",
                  id: i10,
                  status: "active",
                  last_active_organization_id: r2 || null,
                  last_active_token: {
                    id: void 0,
                    object: "token",
                    jwt: e10
                  },
                  factor_verification_age: l2 || null,
                  public_user_data: {
                    user_id: n10
                  },
                  user: {
                    object: "user",
                    id: n10,
                    updated_at: 1,
                    organization_memberships: r2 && o2 && s2 ? [
                      {
                        object: "organization_membership",
                        id: r2,
                        role: s2,
                        permissions: a2 || [],
                        organization: {
                          object: "organization",
                          id: r2,
                          name: o2,
                          slug: o2,
                          members_count: 1,
                          max_allowed_memberships: 1
                        }
                      }
                    ] : []
                  }
                }
              ]
            };
            return ie.getOrCreateInstance(c2);
          }
          class ra {
            async getBaseFapiProxyOptions() {
              let e10 = await tV.clerk.session?.getToken();
              if (!e10) throw new T("No valid session token available", {
                code: "no_session_token"
              });
              return {
                pathPrefix: "",
                headers: {
                  Authorization: `Bearer ${e10}`,
                  "Content-Type": "application/json"
                },
                credentials: "same-origin"
              };
            }
            async getAll(e10) {
              return tV._fetch({
                ...await this.getBaseFapiProxyOptions(),
                method: "GET",
                path: "/api_keys",
                search: it({
                  ...e10,
                  subject: e10?.subject ?? tV.clerk.organization?.id ?? tV.clerk.user?.id ?? "",
                  query: e10?.query ?? ""
                })
              }).then((e11) => {
                let { data: t10, total_count: i10 } = e11;
                return {
                  total_count: i10,
                  data: t10.map((e12) => new nW(e12))
                };
              });
            }
            async create(e10) {
              return new nW(await tV._fetch({
                ...await this.getBaseFapiProxyOptions(),
                path: "/api_keys",
                method: "POST",
                body: JSON.stringify({
                  type: "api_key",
                  name: e10.name,
                  subject: e10.subject ?? tV.clerk.organization?.id ?? tV.clerk.user?.id ?? "",
                  description: e10.description,
                  seconds_until_expiration: e10.secondsUntilExpiration
                })
              }));
            }
            async revoke(e10) {
              return new nW(await tV._fetch({
                ...await this.getBaseFapiProxyOptions(),
                method: "POST",
                path: `/api_keys/${e10.apiKeyID}/revoke`,
                body: JSON.stringify({
                  revocation_reason: e10.revocationReason
                })
              }));
            }
          }
          let ro = /* @__PURE__ */ (() => {
            let e10 = /* @__PURE__ */ new Map();
            return {
              cache: e10,
              listeners: /* @__PURE__ */ new Map(),
              pendingOperations: /* @__PURE__ */ new Map(),
              safeGet: (e11, t10) => (t10.has(e11) || t10.set(e11, /* @__PURE__ */ new Set()), t10.get(e11)),
              safeGetOperations(e11) {
                return this.pendingOperations.has(e11) || this.pendingOperations.set(e11, /* @__PURE__ */ new Map()), this.pendingOperations.get(e11);
              }
            };
          })(), rl = "completed";
          function rc(e10) {
            let t10 = e10.isStarting || e10.isConfirming ? "fetching" : e10.error ? "error" : "idle", i10 = e10.checkout?.status === rl ? rl : e10.checkout ? "needs_confirmation" : "needs_initialization";
            return {
              ...e10,
              fetchStatus: t10,
              status: i10
            };
          }
          let rd = Object.freeze(rc({
            isStarting: false,
            isConfirming: false,
            error: null,
            checkout: null
          }));
          class rh {
            #v = false;
            load(e10) {
              let t10 = e10?.protectConfig;
              if (t10?.loaders && Array.isArray(t10.loaders) && 0 !== t10.loaders.length && !this.#v) {
                if (a()) for (let e11 of (this.#v = true, t10.loaders)) try {
                  this.applyLoader(e11);
                } catch (e12) {
                  Z(`[protect] failed to apply loader: ${e12}`);
                }
              }
            }
            applyLoader(e10) {
              if (void 0 !== e10.rollout) {
                let t11 = e10.rollout;
                if ("number" != typeof t11 || t11 < 0) return void Z(`[protect] loader rollout value is invalid: ${t11}`);
                if (0 === t11 || Math.random() > t11) return;
              }
              let t10 = e10.type || "script", i10 = e10.target || "body", n10 = document.createElement(t10);
              if (e10.attributes) for (let [t11, i11] of Object.entries(e10.attributes)) switch (typeof i11) {
                case "string":
                case "number":
                case "boolean":
                  n10.setAttribute(t11, String(i11));
                  break;
                default:
                  Z(`[protect] loader attribute is invalid type: ${t11}=${i11}`);
              }
              switch (e10.textContent && "string" == typeof e10.textContent && (n10.textContent = e10.textContent), i10) {
                case "head":
                  document.head.appendChild(n10);
                  break;
                case "body":
                  document.body.appendChild(n10);
                  break;
                default:
                  if (i10?.startsWith("#")) {
                    let e11 = document.getElementById(i10.substring(1));
                    if (!e11) return void Z(`[protect] loader target element not found: ${i10}`);
                    e11.appendChild(n10);
                    return;
                  }
                  Z(`[protect] loader target is invalid: ${i10}`);
              }
            }
          }
          let ru = {
            "choose-organization": "choose-organization",
            "reset-password": "reset-password",
            "setup-mfa": "setup-mfa"
          }, rp = (e10) => `/tasks/${ru[e10.key]}`;
          function rf(e10, { navigate: t10, baseUrl: i10 }) {
            let n10 = e10.currentTask;
            if (n10) return t10(function(e11, t11) {
              let i11 = eW();
              return e0({
                base: t11.base,
                hashPath: rp(e11),
                searchParams: i11
              }, {
                stringify: true
              });
            }(n10, {
              base: i10
            }));
          }
          (y = b || (b = {}))[y.None = 0] = "None", y[y.Mutable = 1] = "Mutable", y[y.Watching = 2] = "Watching", y[y.RecursedCheck = 4] = "RecursedCheck", y[y.Recursed = 8] = "Recursed", y[y.Dirty = 16] = "Dirty", y[y.Pending = 32] = "Pending";
          let rm = [], { link: rg, unlink: r_, propagate: ry, checkDirty: rb, endTracking: rw, startTracking: rv, shallowPropagate: rk } = function({ update: e10, notify: t10, unwatched: i10 }) {
            let n10 = 0;
            return {
              link: function(e11, t11) {
                let i11, r3 = t11.depsTail;
                if (void 0 !== r3 && r3.dep === e11) return;
                if (4 & t11.flags && void 0 !== (i11 = void 0 !== r3 ? r3.nextDep : t11.deps) && i11.dep === e11) {
                  i11.version = n10, t11.depsTail = i11;
                  return;
                }
                let s3 = e11.subsTail;
                if (void 0 !== s3 && s3.version === n10 && s3.sub === t11) return;
                let a2 = t11.depsTail = e11.subsTail = {
                  version: n10,
                  dep: e11,
                  sub: t11,
                  prevDep: r3,
                  nextDep: i11,
                  prevSub: s3,
                  nextSub: void 0
                };
                void 0 !== i11 && (i11.prevDep = a2), void 0 !== r3 ? r3.nextDep = a2 : t11.deps = a2, void 0 !== s3 ? s3.nextSub = a2 : e11.subs = a2;
              },
              unlink: r2,
              propagate: function(e11) {
                let i11, n11 = e11.nextSub;
                e: for (; ; ) {
                  let r3 = e11.sub, s3 = r3.flags;
                  if (3 & s3 && (60 & s3 ? 12 & s3 ? 4 & s3 ? !(48 & s3) && function(e12, t11) {
                    let i12 = t11.depsTail;
                    if (void 0 !== i12) {
                      let n12 = t11.deps;
                      do {
                        if (n12 === e12) return true;
                        if (n12 === i12) break;
                        n12 = n12.nextDep;
                      } while (void 0 !== n12);
                    }
                    return false;
                  }(e11, r3) ? (r3.flags = 40 | s3, s3 &= 1) : s3 = 0 : r3.flags = -9 & s3 | 32 : s3 = 0 : r3.flags = 32 | s3, 2 & s3 && t10(r3), 1 & s3)) {
                    let t11 = r3.subs;
                    if (void 0 !== t11) {
                      e11 = t11, void 0 !== t11.nextSub && (i11 = {
                        value: n11,
                        prev: i11
                      }, n11 = e11.nextSub);
                      continue;
                    }
                  }
                  if (void 0 !== (e11 = n11)) {
                    n11 = e11.nextSub;
                    continue;
                  }
                  for (; void 0 !== i11; ) if (e11 = i11.value, i11 = i11.prev, void 0 !== e11) {
                    n11 = e11.nextSub;
                    continue e;
                  }
                  break;
                }
              },
              checkDirty: function(t11, i11) {
                let n11, r3 = 0;
                e: for (; ; ) {
                  let a2 = t11.dep, o2 = a2.flags, l2 = false;
                  if (16 & i11.flags) l2 = true;
                  else if ((17 & o2) == 17) {
                    if (e10(a2)) {
                      let e11 = a2.subs;
                      void 0 !== e11.nextSub && s2(e11), l2 = true;
                    }
                  } else if ((33 & o2) == 33) {
                    (void 0 !== t11.nextSub || void 0 !== t11.prevSub) && (n11 = {
                      value: t11,
                      prev: n11
                    }), t11 = a2.deps, i11 = a2, ++r3;
                    continue;
                  }
                  if (!l2 && void 0 !== t11.nextDep) {
                    t11 = t11.nextDep;
                    continue;
                  }
                  for (; r3; ) {
                    --r3;
                    let a3 = i11.subs, o3 = void 0 !== a3.nextSub;
                    if (o3 ? (t11 = n11.value, n11 = n11.prev) : t11 = a3, l2) {
                      if (e10(i11)) {
                        o3 && s2(a3), i11 = t11.sub;
                        continue;
                      }
                    } else i11.flags &= -33;
                    if (i11 = t11.sub, void 0 !== t11.nextDep) {
                      t11 = t11.nextDep;
                      continue e;
                    }
                    l2 = false;
                  }
                  return l2;
                }
              },
              endTracking: function(e11) {
                let t11 = e11.depsTail, i11 = void 0 !== t11 ? t11.nextDep : e11.deps;
                for (; void 0 !== i11; ) i11 = r2(i11, e11);
                e11.flags &= -5;
              },
              startTracking: function(e11) {
                ++n10, e11.depsTail = void 0, e11.flags = -57 & e11.flags | 4;
              },
              shallowPropagate: s2
            };
            function r2(e11, t11 = e11.sub) {
              let n11 = e11.dep, s3 = e11.prevDep, a2 = e11.nextDep, o2 = e11.nextSub, l2 = e11.prevSub;
              return void 0 !== a2 ? a2.prevDep = s3 : t11.depsTail = s3, void 0 !== s3 ? s3.nextDep = a2 : t11.deps = a2, void 0 !== o2 ? o2.prevSub = l2 : n11.subsTail = l2, void 0 !== l2 ? l2.nextSub = o2 : void 0 === (n11.subs = o2) && i10(n11), a2;
            }
            function s2(e11) {
              do {
                let i11 = e11.sub, n11 = e11.nextSub, r3 = i11.flags;
                (48 & r3) == 32 && (i11.flags = 16 | r3, 2 & r3 && t10(i11)), e11 = n11;
              } while (void 0 !== e11);
            }
          }({
            update: (e10) => "getter" in e10 ? rT(e10) : rO(e10, e10.value),
            notify: function e10(t10) {
              let i10 = t10.flags;
              if (!(64 & i10)) {
                t10.flags = 64 | i10;
                let n10 = t10.subs;
                void 0 !== n10 ? e10(n10.sub) : rm[rC++] = t10;
              }
            },
            unwatched(e10) {
              if ("getter" in e10) {
                let t10 = e10.deps;
                if (void 0 !== t10) {
                  e10.flags = 17;
                  do
                    t10 = r_(t10, e10);
                  while (void 0 !== t10);
                }
              } else "previousValue" in e10 || rR.call(e10);
            }
          }), rS = 0, rC = 0;
          function rA(e10) {
            let t10 = r;
            return r = e10, t10;
          }
          function rU(e10) {
            return rx.bind({
              previousValue: e10,
              value: e10,
              subs: void 0,
              subsTail: void 0,
              flags: 1
            });
          }
          function rI(e10) {
            return rE.bind({
              value: void 0,
              subs: void 0,
              subsTail: void 0,
              deps: void 0,
              depsTail: void 0,
              flags: 17,
              getter: e10
            });
          }
          function rP(e10) {
            let t10 = {
              fn: e10,
              subs: void 0,
              subsTail: void 0,
              deps: void 0,
              depsTail: void 0,
              flags: 2
            };
            void 0 !== r ? rg(t10, r) : void 0 !== s && rg(t10, s);
            let i10 = rA(t10);
            try {
              t10.fn();
            } finally {
              rA(i10);
            }
            return rR.bind(t10);
          }
          function rT(e10) {
            let t10 = rA(e10);
            rv(e10);
            try {
              let t11 = e10.value;
              return t11 !== (e10.value = e10.getter(t11));
            } finally {
              rA(t10), rw(e10);
            }
          }
          function rO(e10, t10) {
            return e10.flags = 1, e10.previousValue !== (e10.previousValue = t10);
          }
          function rE() {
            let e10 = this.flags;
            if (16 & e10 || 32 & e10 && rb(this.deps, this)) {
              if (rT(this)) {
                let e11 = this.subs;
                void 0 !== e11 && rk(e11);
              }
            } else 32 & e10 && (this.flags = -33 & e10);
            return void 0 !== r ? rg(this, r) : void 0 !== s && rg(this, s), this.value;
          }
          function rx(...e10) {
            if (e10.length) {
              let t10 = e10[0];
              if (this.value !== (this.value = t10)) {
                this.flags = 17;
                let e11 = this.subs;
                void 0 !== e11 && (ry(e11), function() {
                  for (; rS < rC; ) {
                    let e12 = rm[rS];
                    rm[rS++] = void 0, function e13(t11, i10) {
                      if (16 & i10 || 32 & i10 && rb(t11.deps, t11)) {
                        let e14 = rA(t11);
                        rv(t11);
                        try {
                          t11.fn();
                        } finally {
                          rA(e14), rw(t11);
                        }
                        return;
                      }
                      32 & i10 && (t11.flags = -33 & i10);
                      let n10 = t11.deps;
                      for (; void 0 !== n10; ) {
                        let t12 = n10.dep, i11 = t12.flags;
                        64 & i11 && e13(t12, t12.flags = -65 & i11), n10 = n10.nextDep;
                      }
                    }(e12, e12.flags &= -65);
                  }
                  rS = 0, rC = 0;
                }());
              }
            } else {
              let e11 = this.value;
              if (16 & this.flags && rO(this, e11)) {
                let e12 = this.subs;
                void 0 !== e12 && rk(e12);
              }
              return void 0 !== r && rg(this, r), e11;
            }
          }
          function rR() {
            let e10 = this.deps;
            for (; void 0 !== e10; ) e10 = r_(e10, this);
            let t10 = this.subs;
            void 0 !== t10 && r_(t10), this.flags = 0;
          }
          let rz = rU({
            resource: null
          }), rM = rU({
            error: null
          }), rN = rU({
            status: "idle"
          }), rF = rI(() => {
            let e10 = rz().resource, t10 = rM().error, i10 = rN().status;
            return {
              errors: rj(t10, {
                identifier: null,
                password: null,
                code: null
              }),
              fetchStatus: i10,
              signIn: e10 ? e10.__internal_future : null
            };
          }), rD = rU({
            resource: null
          }), rW = rU({
            error: null
          }), rL = rU({
            status: "idle"
          }), r$ = rI(() => {
            let e10 = rD().resource, t10 = rW().error, i10 = rL().status;
            return {
              errors: rj(t10, {
                firstName: null,
                lastName: null,
                emailAddress: null,
                phoneNumber: null,
                password: null,
                username: null,
                code: null,
                captcha: null,
                legalAccepted: null
              }),
              fetchStatus: i10,
              signUp: e10 ? e10.__internal_future : null
            };
          });
          function rj(e10, t10) {
            let i10 = {
              fields: {
                ...t10
              },
              raw: null,
              global: null
            };
            return e10 && (S(e10) ? e10.errors.some((e11) => "meta" in e11 && e11.meta && "paramName" in e11.meta) ? e10.errors.forEach((e11) => {
              if (i10.raw ? i10.raw.push(e11) : i10.raw = [
                e11
              ], "meta" in e11 && e11.meta && "paramName" in e11.meta) {
                let t11 = ee(e11.meta.paramName);
                t11 in i10.fields && (i10.fields[t11] = e11);
              }
            }) : (i10.raw = [
              e10
            ], i10.global = [
              D(e10)
            ]) : (i10.raw = [
              e10
            ], i10.global = [
              D(e10)
            ])), i10;
          }
          class rJ {
            signInResourceSignal = rz;
            signInErrorSignal = rM;
            signInFetchSignal = rN;
            signInSignal = rF;
            signUpResourceSignal = rD;
            signUpErrorSignal = rW;
            signUpFetchSignal = rL;
            signUpSignal = r$;
            __internal_effect = rP;
            __internal_computed = rI;
            constructor() {
              ix.on("resource:update", this.onResourceUpdated), ix.on("resource:error", this.onResourceError), ix.on("resource:fetch", this.onResourceFetch);
            }
            onResourceError = (e10) => {
              e10.resource instanceof nC && this.signInErrorSignal({
                error: e10.error
              }), e10.resource instanceof nP && this.signUpErrorSignal({
                error: e10.error
              });
            };
            onResourceUpdated = (e10) => {
              e10.resource instanceof nC && this.signInResourceSignal({
                resource: e10.resource
              }), e10.resource instanceof nP && this.signUpResourceSignal({
                resource: e10.resource
              });
            };
            onResourceFetch = (e10) => {
              e10.resource instanceof nC && this.signInFetchSignal({
                status: e10.status
              }), e10.resource instanceof nP && this.signUpFetchSignal({
                status: e10.status
              });
            };
          }
          let rK = (e10) => `\u{1F512} Clerk:
${e10.trim()}
(This notice only appears in development)`, rB = {
            cannotRenderComponentWhenSessionExists: "The <SignUp/> and <SignIn/> components cannot render when a user is already signed in, unless the application allows multiple sessions. Since a user is signed in and this application only allows a single session, Clerk is redirecting to the Home URL instead.",
            cannotRenderSignUpComponentWhenSessionExists: "The <SignUp/> component cannot render when a user is already signed in, unless the application allows multiple sessions. Since a user is signed in and this application only allows a single session, Clerk is redirecting to the value set in `afterSignUp` URL instead.",
            cannotRenderSignUpComponentWhenTaskExists: "The <SignUp/> component cannot render when a user has a pending task, unless the application allows multiple sessions. Since a user is signed in and this application only allows a single session, Clerk is redirecting to the task instead.",
            cannotRenderComponentWhenTaskDoesNotExist: "<TaskChooseOrganization/> cannot render unless a session task is pending. Clerk is redirecting to the value set in `redirectUrlComplete` instead.",
            cannotRenderSignInComponentWhenSessionExists: "The <SignIn/> component cannot render when a user is already signed in, unless the application allows multiple sessions. Since a user is signed in and this application only allows a single session, Clerk is redirecting to the `afterSignIn` URL instead.",
            cannotRenderSignInComponentWhenTaskExists: "The <SignIn/> component cannot render when a user has a pending task, unless the application allows multiple sessions. Since a user is signed in and this application only allows a single session, Clerk is redirecting to the task instead.",
            cannotRenderComponentWhenUserDoesNotExist: "<UserProfile/> cannot render unless a user is signed in. Since no user is signed in, this is no-op.",
            cannotRenderComponentWhenOrgDoesNotExist: "<OrganizationProfile/> cannot render unless an organization is active. Since no organization is currently active, this is no-op.",
            cannotRenderAnyOrganizationComponent: (e10) => rK(`The <${e10}/> cannot be rendered when the feature is turned off. Visit 'dashboard.clerk.com' to enable the feature. Since the feature is turned off, this is no-op.`),
            cannotRenderAnyBillingComponent: (e10) => rK(`The <${e10}/> component cannot be rendered when billing is disabled. Visit 'https://dashboard.clerk.com/last-active?path=billing/settings' to follow the necessary steps to enable billing. Since billing is disabled, this is no-op.`),
            cannotOpenUserProfile: "The UserProfile modal cannot render unless a user is signed in. Since no user is signed in, this is no-op.",
            cannotOpenCheckout: "The Checkout drawer cannot render unless a user is signed in. Since no user is signed in, this is no-op.",
            cannotOpenSignInOrSignUp: "The SignIn or SignUp modals do not render when a user is already signed in, unless the application allows multiple sessions. Since a user is signed in and this application only allows a single session, this is no-op.",
            cannotRenderAPIKeysComponent: "The <APIKeys/> component cannot be rendered when API keys are disabled. Since API keys are disabled, this is no-op.",
            cannotRenderAPIKeysComponentForUserWhenDisabled: "The <APIKeys/> component cannot be rendered when user API keys are disabled. Since user API keys are disabled, this is no-op.",
            cannotRenderAPIKeysComponentForOrgWhenDisabled: "The <APIKeys/> component cannot be rendered when organization API keys are disabled. Since organization API keys are disabled, this is no-op."
          };
          for (let e10 of Object.keys(rB)) {
            let t10 = rB[e10];
            "function" != typeof t10 && (rB[e10] = rK(t10));
          }
          let rV = "cannot_render_billing_disabled", rq = "cannot_render_user_missing", rH = "cannot_render_organizations_disabled", rG = "cannot_render_organization_missing", rZ = "cannot_render_single_session_enabled", rY = {
            polling: true,
            standardBrowser: true,
            touchSession: true,
            isSatellite: false,
            signInUrl: void 0,
            signUpUrl: void 0,
            afterSignOutUrl: void 0,
            signInFallbackRedirectUrl: void 0,
            signUpFallbackRedirectUrl: void 0,
            signInForceRedirectUrl: void 0,
            signUpForceRedirectUrl: void 0,
            newSubscriptionRedirectUrl: void 0
          };
          class rQ {
            static mountComponentRenderer;
            static version = "5.127.2";
            static sdkMetadata = {
              name: "@clerk/clerk-js",
              version: "5.127.2"
            };
            static _billing;
            static _apiKeys;
            _checkout;
            client;
            session;
            organization;
            user;
            __internal_country;
            telemetry;
            __internal_state = new rJ();
            internal_last_error = null;
            environment;
            #K;
            #B = "";
            #V;
            #q;
            #H;
            #G;
            #Z;
            #Y = null;
            #Q;
            #X;
            #ee;
            #et = "loading";
            #ei = [];
            #en = [];
            #er = {};
            #es = null;
            #ea = 0;
            #eo = f();
            get __internal_queryClient() {
              return this.#K || i2.e("437").then(i2.bind(i2, 1522)).then((e10) => e10.QueryClient).then((e10) => {
                this.#K || (this.#K = new e10(), this.#eo.emit("queryClientStatus", "ready"));
              }), this.#K ? {
                __tag: "clerk-rq-client",
                client: this.#K
              } : void 0;
            }
            __internal_getCachedResources;
            __internal_createPublicCredentials;
            __internal_getPublicCredentials;
            __internal_isWebAuthnSupported;
            __internal_isWebAuthnAutofillSupported;
            __internal_isWebAuthnPlatformAuthenticatorSupported;
            __internal_setActiveInProgress = false;
            get publishableKey() {
              return this.#B;
            }
            get version() {
              return rQ.version;
            }
            set sdkMetadata(e10) {
              rQ.sdkMetadata = e10;
            }
            get sdkMetadata() {
              return rQ.sdkMetadata;
            }
            get loaded() {
              return "degraded" === this.status || "ready" === this.status;
            }
            get status() {
              return this.#et;
            }
            get isSatellite() {
              return !!te() && (0, ey.YZ)(this.#er.isSatellite, new URL(window.location.href), false);
            }
            get domain() {
              if (te()) {
                let e10 = function(e11 = "") {
                  return (e11 || "").replace(/^.+:\/\//, "");
                }((0, ey.YZ)(this.#V, new URL(window.location.href)));
                if ("production" === this.#ee) {
                  let t10;
                  if (!e10) return "";
                  if (e10.match(/^(clerk\.)+\w*$/)) t10 = /(clerk\.)*(?=clerk\.)/;
                  else {
                    if (e10.match(/\.clerk.accounts/)) return e10;
                    t10 = /^(clerk\.)*/gi;
                  }
                  return `clerk.${e10.replace(t10, "")}`;
                }
                return e10;
              }
              return "";
            }
            get proxyUrl() {
              if (te()) {
                let e10 = (0, ey.YZ)(this.#q, new URL(window.location.href));
                return !e10 || Q(e10) || X(e10) || eB.throwInvalidProxyUrl({
                  url: e10
                }), e10 ? X(e10) ? new URL(e10, window.location.origin).toString() : e10 : "";
              }
              return "";
            }
            get frontendApi() {
              let e10 = B(this.publishableKey);
              return e10 ? e10.frontendApi : eB.throwInvalidPublishableKeyError({
                key: this.publishableKey
              });
            }
            get instanceType() {
              return this.#ee;
            }
            get isStandardBrowser() {
              return this.#er.standardBrowser || false;
            }
            get billing() {
              return rQ._billing || (rQ._billing = new ii()), rQ._billing;
            }
            get apiKeys() {
              return rQ._apiKeys || (rQ._apiKeys = new ra()), rQ._apiKeys;
            }
            __experimental_checkout(e10) {
              return this._checkout || (this._checkout = (e11) => function(e12, t10) {
                let { for: i10, planId: n10, planPeriod: r2 } = t10;
                if (!e12.isSignedIn || !e12.user) throw Error("Clerk: User is not authenticated");
                if ("organization" === i10 && !e12.organization) throw Error("Clerk: Use `setActive` to set the organization");
                let s2 = function(e13) {
                  let t11 = ro.safeGet(e13, ro.listeners), i11 = ro.safeGetOperations(e13), n11 = () => ro.cache.get(e13) || rd, r3 = (i12) => {
                    let r4 = rc({
                      ...n11(),
                      ...i12
                    });
                    ro.cache.set(e13, Object.freeze(r4)), t11.forEach((e14) => e14(n11()));
                  };
                  return {
                    subscribe: (e14) => (t11.add(e14), () => {
                      t11.delete(e14);
                    }),
                    getCacheState: n11,
                    async executeOperation(t12, n12) {
                      let s3 = `${e13}-${t12}`, a2 = "start" === t12 ? "isStarting" : "isConfirming", o2 = i11.get(s3);
                      if (o2) return await o2;
                      let l2 = (async () => {
                        let e14 = null, o3 = null;
                        try {
                          r3({
                            [a2]: true,
                            error: null,
                            ..."start" === t12 ? {
                              checkout: null
                            } : {}
                          });
                          let i12 = await n12();
                          r3({
                            [a2]: false,
                            error: null,
                            checkout: i12
                          }), e14 = i12;
                        } catch (e15) {
                          o3 = e15, r3({
                            [a2]: false,
                            error: e15
                          });
                        } finally {
                          i11.delete(s3);
                        }
                        return {
                          data: e14,
                          error: o3
                        };
                      })();
                      return i11.set(s3, l2), l2;
                    },
                    clearCheckout() {
                      0 === i11.size && r3(rd);
                    }
                  };
                }(function(e13) {
                  let { userId: t11, orgId: i11, planId: n11, planPeriod: r3 } = e13;
                  return `${t11}-${i11 || "user"}-${n11}-${r3}`;
                }({
                  userId: e12.user.id,
                  orgId: "organization" === i10 ? e12.organization?.id : void 0,
                  planId: n10,
                  planPeriod: r2
                }));
                return {
                  start: async () => s2.executeOperation("start", async () => await e12.billing?.startCheckout({
                    ..."organization" === i10 ? {
                      orgId: e12.organization?.id
                    } : {},
                    planId: n10,
                    planPeriod: r2
                  })),
                  confirm: async (e13) => s2.executeOperation("confirm", async () => {
                    let t11 = s2.getCacheState().checkout;
                    if (!t11) throw Error("Clerk: Call `start` before `confirm`");
                    return t11.confirm(e13);
                  }),
                  finalize: (t11) => {
                    let { navigate: i11 } = t11 || {};
                    return e12.setActive({
                      session: e12.session?.id,
                      navigate: i11
                    });
                  },
                  clear: () => s2.clearCheckout(),
                  subscribe: (e13) => s2.subscribe(e13),
                  getState: s2.getCacheState
                };
              }(this, e11)), this._checkout(e10);
            }
            __internal_getOption(e10) {
              return this.#er[e10];
            }
            get isSignedIn() {
              return this?.session?.status !== "pending" && !!this.session;
            }
            constructor(e10, t10) {
              if (!(e10 = (e10 || "").trim())) return eB.throwMissingPublishableKeyError();
              let i10 = B(e10);
              if (!i10) return eB.throwInvalidPublishableKeyError({
                key: e10
              });
              this.#V = t10?.domain, this.#q = t10?.proxyUrl, this.environment = iM.getInstance(), this.#ee = i10.instanceType, this.#B = e10, this.#X = /* @__PURE__ */ function(e11) {
                let t11 = [], i11 = [];
                async function n10(e12) {
                  for await (let i12 of [
                    "undefined" != typeof window && window.__unstable__onBeforeRequest,
                    ...t11
                  ].filter((e13) => e13)) if (await i12(e12) === false) return false;
                  return true;
                }
                async function r2(e12, t12) {
                  for await (let n11 of [
                    "undefined" != typeof window && window.__unstable__onAfterResponse,
                    ...i11
                  ].filter((e13) => e13)) if (await n11(e12, t12) === false) return false;
                  return true;
                }
                function s2({ method: t12, path: i12, sessionId: n11, search: r3, rotatingTokenNonce: s3 }) {
                  let a3 = new URLSearchParams(r3);
                  return a3.append("__clerk_api_version", "2025-11-10"), a3.append("_clerk_js_version", "5.127.2"), s3 && a3.append("rotating_token_nonce", s3), e11.domain && "development" === e11.instanceType && e11.isSatellite && a3.append("__domain", e11.domain), t12 && "GET" !== t12 && "POST" !== t12 && a3.append("_method", t12), i12 && !rr.some((e12) => i12.startsWith(e12)) && n11 && a3.append("_clerk_session_id", n11), eH([
                    ...a3.entries()
                  ].reduce((e12, [t13, i13]) => (e12[t13] = i13.includes(",") ? i13.split(",") : i13, e12), {}));
                }
                function a2(t12) {
                  let { path: i12, pathPrefix: n11 = "v1" } = t12;
                  if (e11.proxyUrl) {
                    let r4 = new URL(e11.proxyUrl), a3 = r4.pathname.slice(1);
                    return a3.endsWith("/") && (a3 = a3.slice(0, -1)), e0({
                      base: r4.origin,
                      pathname: `${a3}/${n11}${i12}`,
                      search: s2(t12)
                    }, {
                      stringify: false
                    });
                  }
                  let r3 = "production" === e11.instanceType ? e11.domain : "";
                  return e0({
                    base: `https://${r3 || e11.frontendApi}`,
                    pathname: `${n11}${i12}`,
                    search: s2(t12)
                  }, {
                    stringify: false
                  });
                }
                async function o2(t12, i12) {
                  let s3, o3 = {
                    ...t12
                  }, { method: l2 = "GET", body: d2 } = o3;
                  !d2 || "object" != typeof d2 || d2 instanceof FormData || (o3.body = function(e12) {
                    if (!e12 || "object" != typeof e12 || Object.getPrototypeOf(e12) !== Object.prototype) return e12;
                    let t13 = {};
                    for (let [i13, n11] of Object.entries(e12)) void 0 !== n11 && (t13[i13] = n11);
                    return t13;
                  }(d2)), o3.url = a2({
                    ...o3,
                    sessionId: e11.getSessionId()
                  }), o3.headers = new Headers(o3.headers), "GET" === l2 || d2 instanceof FormData || o3.headers.has("content-type") || o3.headers.set("content-type", "application/x-www-form-urlencoded"), "application/x-www-form-urlencoded" === o3.headers.get("content-type") && (o3.body = d2 ? eH(d2, {
                    keyEncoder: et
                  }) : d2);
                  let h2 = await n10(o3), u2 = "GET" === l2 ? "GET" : "POST", p2 = o3.url, f2 = {
                    ...o3,
                    method: u2,
                    credentials: o3.credentials || "include"
                  };
                  try {
                    if (h2) {
                      let e12 = i12?.fetchMaxTries ?? (c() ? 4 : 11);
                      s3 = await tz(() => fetch(p2, f2), {
                        retryImmediately: true,
                        initialDelay: 700,
                        maxDelayBetweenRetries: 5e3,
                        shouldRetry: (t13, i13) => "GET" === u2 && i13 < e12 && !f2.signal?.aborted,
                        onBeforeRetry: (e13) => {
                          p2.searchParams.set("_clerk_retry_attempt", e13.toString());
                        }
                      });
                    } else s3 = new Response("{}", o3);
                  } catch (t13) {
                    let e12 = p2.toString();
                    eA.error("network error", {
                      error: t13,
                      url: e12,
                      method: l2
                    }, "fapiClient");
                    throw Error(`${tk} Network error at "${e12}" - ${t13}. Please try again.`);
                  }
                  let m2 = 204 !== s3.status ? await s3.json() : null, g2 = Object.assign(s3, {
                    payload: m2
                  });
                  return s3.ok || eA.error("request failed", {
                    method: l2,
                    path: o3.path,
                    status: s3.status
                  }, "fapiClient"), await r2(o3, g2), g2;
                }
                return {
                  buildEmailAddress: function(t12) {
                    return function({ localPart: e12, frontendApi: t13 }) {
                      let i12 = t13 ? t13.replace("clerk.", "") : "clerk.com";
                      return `${e12}@${i12}`;
                    }({
                      localPart: t12,
                      frontendApi: e11.frontendApi
                    });
                  },
                  buildUrl: a2,
                  onAfterResponse: function(e12) {
                    i11.push(e12);
                  },
                  onBeforeRequest: function(e12) {
                    t11.push(e12);
                  },
                  request: o2
                };
              }({
                domain: this.domain,
                frontendApi: this.frontendApi,
                instanceType: this.instanceType,
                isSatellite: this.isSatellite,
                getSessionId: () => this.session?.id,
                proxyUrl: this.proxyUrl
              }), this.#eo.emit(m, "loading"), this.#eo.prioritizedOn(m, (e11) => this.#et = e11), tV.clerk = this, this.#G = new rh();
            }
            getFapiClient = () => this.#X;
            load = async (e10) => {
              if (eA.info("load() start", {}, "clerk"), !this.loaded) {
                if ("development" === this.#ee && Z("Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production. Learn more: https://clerk.com/docs/deployments/overview"), this.#er = this.#el(e10), "development" === this.#ee && (this.#er.routerPush || this.#er.routerReplace) && (!this.#er.routerPush || !this.#er.routerReplace)) {
                  let e11 = this.#er.routerPush ? "routerReplace" : "routerPush";
                  Z(`Clerk: Both \`routerPush\` and \`routerReplace\` need to be defined, but \`${e11}\` is not defined. This may cause issues with navigation in your application.`);
                }
                ix.on(iE, () => {
                  this.#ec(this.session), this.#ed();
                }), t_(this.#er), this.#er.sdkMetadata && (rQ.sdkMetadata = this.#er.sdkMetadata), false !== this.#er.telemetry && (this.telemetry = new ed({
                  clerkVersion: rQ.version,
                  samplingRate: 1,
                  perEventSampling: !this.#er.__internal_keyless_claimKeylessApplicationUrl && void 0,
                  publishableKey: this.publishableKey,
                  ...this.#er.telemetry
                }), this.#er.appearance && this.telemetry.record({
                  event: "THEME_USAGE",
                  eventSamplingRate: 1,
                  payload: function(e11) {
                    let t10;
                    if (!e11 || "object" != typeof e11) return {};
                    let i10 = e11.theme || e11.baseTheme;
                    if (!i10) return {};
                    if (Array.isArray(i10)) for (let e12 of i10) {
                      let i11 = eg(e12);
                      if (i11) {
                        t10 = i11;
                        break;
                      }
                    }
                    else t10 = eg(i10);
                    return {
                      themeName: t10
                    };
                  }(this.#er.appearance)
                }));
                try {
                  this.#er.standardBrowser ? await this.#eh() : await this.#eu();
                  let e11 = this.#er.telemetry, t10 = false !== e11 && !e11?.disabled, i10 = !!this.#er.__internal_keyless_claimKeylessApplicationUrl, n10 = !!this.environment?.clientDebugMode, r2 = this.environment?.isProduction?.() ?? false, s2 = n10 || i10 && !r2, a2 = i10 && !n10 ? "error" : void 0;
                  s2 && function(e12 = {}) {
                    if (ev) return;
                    let { enabled: t11 = false, ...i11 } = e12;
                    t11 && (eb = true, ev = true, eC(i11));
                  }({
                    enabled: true,
                    ...a2 ? {
                      logLevel: a2
                    } : {},
                    ...t10 && this.telemetry ? {
                      telemetryCollector: this.telemetry
                    } : {}
                  }), this.#G?.load(this.environment), eA.info("load() complete", {}, "clerk");
                } catch (e11) {
                  throw this.#eo.emit(m, "error"), eA.error("load() failed", {
                    error: e11
                  }, "clerk"), e11;
                }
              }
            };
            #ep() {
              let e10;
              return !!(!this.#er.signUpUrl && this.#er.signInUrl && (e10 = this.#er.signInUrl, !e_.test(e10)));
            }
            signOut = async (e10, t10) => {
              if (!this.client || 0 === this.client.sessions.length) return;
              let i10 = "undefined" != typeof window && "function" == typeof window.__unstable__onBeforeSetActive ? window.__unstable__onBeforeSetActive : ey.ZT, n10 = "undefined" != typeof window && "function" == typeof window.__unstable__onAfterSetActive ? window.__unstable__onAfterSetActive : ey.ZT, r2 = e10 && "object" == typeof e10 ? e10 : t10 || {}, s2 = r2?.redirectUrl || this.buildAfterSignOutUrl();
              eA.debug("signOut() start", {
                hasClient: !!this.client,
                multiSessionCount: this.client?.signedInSessions.length ?? 0,
                redirectUrl: s2,
                sessionTarget: r2?.sessionId ?? null
              }, "clerk");
              let a2 = "function" == typeof e10 ? e10 : void 0, o2 = async () => {
                let e11 = eT(this.#er.standardBrowser);
                ix.emit(iT, null), this.#ef(), await e11.track(async () => {
                  a2 ? await a2() : await this.navigate(s2);
                }), e11.isUnloading() || (this.#ec(), this.#ed(), await n10());
              };
              if (await i10(), !r2.sessionId || 1 === this.client.signedInSessions.length) {
                this.#er.experimental?.persistClient ?? true ? await this.client.removeSessions() : await this.client.destroy(), await o2(), eA.info("signOut() complete", {
                  redirectUrl: e1(s2)
                }, "clerk");
                return;
              }
              let l2 = this.client.signedInSessions.find((e11) => e11.id === r2.sessionId), c2 = l2?.id && this.session?.id === l2.id;
              await l2?.remove(), c2 && (await o2(), eA.info("signOut() complete", {
                redirectUrl: e1(s2)
              }, "clerk"));
            };
            openGoogleOneTap = (e10) => {
              let t10 = "GoogleOneTap";
              this.assertComponentsReady(this.#Q), this.#Q.ensureMounted({
                preloadHint: t10
              }).then((t11) => t11.openModal("googleOneTap", e10 || {})), this.telemetry?.record(em(t10, e10));
            };
            closeGoogleOneTap = () => {
              this.assertComponentsReady(this.#Q), this.#Q.ensureMounted().then((e10) => e10.closeModal("googleOneTap"));
            };
            openSignIn = (e10) => {
              if (this.assertComponentsReady(this.#Q), eL(this, this.environment)) {
                if ("development" === this.#ee) throw new T(rB.cannotOpenSignInOrSignUp, {
                  code: rZ
                });
                return;
              }
              let t10 = "SignIn";
              this.#Q.ensureMounted({
                preloadHint: t10
              }).then((t11) => t11.openModal("signIn", e10 || {}));
              let i10 = {
                withSignUp: e10?.withSignUp ?? this.#ep()
              };
              this.telemetry?.record(em(t10, e10, i10));
            };
            closeSignIn = () => {
              this.assertComponentsReady(this.#Q), this.#Q.ensureMounted().then((e10) => e10.closeModal("signIn"));
            };
            __internal_openCheckout = (e10) => {
              if (this.assertComponentsReady(this.#Q), e$(this, this.environment)) {
                if ("development" === this.#ee) throw new T(rB.cannotRenderAnyBillingComponent("Checkout"), {
                  code: rV
                });
                return;
              }
              if (!this.user) {
                if ("development" === this.#ee) throw new T(rB.cannotOpenCheckout, {
                  code: rq
                });
                return;
              }
              this.#Q.ensureMounted({
                preloadHint: "Checkout"
              }).then((t10) => t10.openDrawer("checkout", e10 || {}));
            };
            __internal_closeCheckout = () => {
              this.assertComponentsReady(this.#Q), this.#Q.ensureMounted().then((e10) => e10.closeDrawer("checkout"));
            };
            __internal_openPlanDetails = (e10) => {
              if (this.assertComponentsReady(this.#Q), e$(this, this.environment)) {
                if ("development" === this.#ee) throw new T(rB.cannotRenderAnyBillingComponent("PlanDetails"), {
                  code: rV
                });
                return;
              }
              let t10 = "PlanDetails";
              this.#Q.ensureMounted({
                preloadHint: t10
              }).then((t11) => t11.openDrawer("planDetails", e10 || {})), this.telemetry?.record(em(t10, e10));
            };
            __internal_closePlanDetails = () => {
              this.assertComponentsReady(this.#Q), this.#Q.ensureMounted().then((e10) => e10.closeDrawer("planDetails"));
            };
            __internal_openSubscriptionDetails = (e10) => {
              this.assertComponentsReady(this.#Q), this.#Q.ensureMounted({
                preloadHint: "SubscriptionDetails"
              }).then((t10) => t10.openDrawer("subscriptionDetails", e10 || {}));
            };
            __internal_closeSubscriptionDetails = () => {
              this.assertComponentsReady(this.#Q), this.#Q.ensureMounted().then((e10) => e10.closeDrawer("subscriptionDetails"));
            };
            __internal_openReverification = (e10) => {
              if (this.assertComponentsReady(this.#Q), !this.user) {
                if ("development" === this.#ee) throw new T(rB.cannotOpenUserProfile, {
                  code: rq
                });
                return;
              }
              this.#Q.ensureMounted({
                preloadHint: "UserVerification"
              }).then((t10) => t10.openModal("userVerification", e10 || {})), this.telemetry?.record(em("UserVerification", e10));
            };
            __internal_closeReverification = () => {
              this.assertComponentsReady(this.#Q), this.#Q.ensureMounted().then((e10) => e10.closeModal("userVerification"));
            };
            __internal_attemptToEnableEnvironmentSetting = (e10) => {
              let { for: t10, caller: i10 } = e10;
              if (this.user || "development" !== this.#ee || Z(`Clerk: "${i10}" requires an active user session. Ensure a user is signed in before executing ${i10}.`), "organizations" === t10) {
                let t11;
                return (t11 = this.environment, t11?.organizationSettings.enabled || this.session?.currentTask?.key === "choose-organization") ? {
                  isEnabled: true
                } : ("development" === this.#ee && this.__internal_openEnableOrganizationsPrompt({
                  caller: i10,
                  onSuccess: () => window.location.reload(),
                  onClose: e10.onClose
                }), {
                  isEnabled: false
                });
              }
              throw Error(`Attempted to enable an unknown or unsupported setting "${t10}".`);
            };
            __internal_openEnableOrganizationsPrompt = (e10) => {
              this.assertComponentsReady(this.#Q), this.#Q.ensureMounted({
                preloadHint: "EnableOrganizationsPrompt"
              }).then((t10) => t10.openModal("enableOrganizationsPrompt", e10 || {})), this.telemetry?.record(ef("EnableOrganizationsPrompt", e10));
            };
            __internal_closeEnableOrganizationsPrompt = () => {
              this.assertComponentsReady(this.#Q), this.#Q.ensureMounted().then((e10) => e10.closeModal("enableOrganizationsPrompt"));
            };
            __internal_openBlankCaptchaModal = () => (this.assertComponentsReady(this.#Q), this.#Q.ensureMounted({
              preloadHint: "BlankCaptchaModal"
            }).then((e10) => e10.openModal("blankCaptcha", {})));
            __internal_closeBlankCaptchaModal = () => (this.assertComponentsReady(this.#Q), this.#Q.ensureMounted({
              preloadHint: "BlankCaptchaModal"
            }).then((e10) => e10.closeModal("blankCaptcha")));
            __internal_loadStripeJs = async () => {
              let { loadStripe: e10 } = await i2.e("553").then(i2.bind(i2, 8823));
              return e10;
            };
            openSignUp = (e10) => {
              if (this.assertComponentsReady(this.#Q), eL(this, this.environment)) {
                if ("development" === this.#ee) throw new T(rB.cannotOpenSignInOrSignUp, {
                  code: rZ
                });
                return;
              }
              this.#Q.ensureMounted({
                preloadHint: "SignUp"
              }).then((t10) => t10.openModal("signUp", e10 || {})), this.telemetry?.record(em("SignUp", e10));
            };
            closeSignUp = () => {
              this.assertComponentsReady(this.#Q), this.#Q.ensureMounted().then((e10) => e10.closeModal("signUp"));
            };
            openUserProfile = (e10) => {
              if (this.assertComponentsReady(this.#Q), !this.user) {
                if ("development" === this.#ee) throw new T(rB.cannotOpenUserProfile, {
                  code: rq
                });
                return;
              }
              this.#Q.ensureMounted({
                preloadHint: "UserProfile"
              }).then((t11) => t11.openModal("userProfile", e10 || {}));
              let t10 = (e10?.customPages?.length || 0) > 0 ? {
                customPages: true
              } : void 0;
              this.telemetry?.record(em("UserProfile", e10, t10));
            };
            closeUserProfile = () => {
              this.assertComponentsReady(this.#Q), this.#Q.ensureMounted().then((e10) => e10.closeModal("userProfile"));
            };
            openOrganizationProfile = (e10) => {
              this.assertComponentsReady(this.#Q);
              let { isEnabled: t10 } = this.__internal_attemptToEnableEnvironmentSetting({
                for: "organizations",
                caller: "OrganizationProfile",
                onClose: () => {
                  throw new T(rB.cannotRenderAnyOrganizationComponent("OrganizationProfile"), {
                    code: rH
                  });
                }
              });
              if (t10) {
                if (!this.organization) {
                  if ("development" === this.#ee) throw new T(rB.cannotRenderComponentWhenOrgDoesNotExist, {
                    code: rG
                  });
                  return;
                }
                this.#Q.ensureMounted({
                  preloadHint: "OrganizationProfile"
                }).then((t11) => t11.openModal("organizationProfile", e10 || {})), this.telemetry?.record(em("OrganizationProfile", e10));
              }
            };
            closeOrganizationProfile = () => {
              this.assertComponentsReady(this.#Q), this.#Q.ensureMounted().then((e10) => e10.closeModal("organizationProfile"));
            };
            openCreateOrganization = (e10) => {
              this.assertComponentsReady(this.#Q);
              let { isEnabled: t10 } = this.__internal_attemptToEnableEnvironmentSetting({
                for: "organizations",
                caller: "CreateOrganization",
                onClose: () => {
                  throw new T(rB.cannotRenderAnyOrganizationComponent("CreateOrganization"), {
                    code: rH
                  });
                }
              });
              t10 && (this.#Q.ensureMounted({
                preloadHint: "CreateOrganization"
              }).then((t11) => t11.openModal("createOrganization", e10 || {})), this.telemetry?.record(em("CreateOrganization", e10)));
            };
            closeCreateOrganization = () => {
              this.assertComponentsReady(this.#Q), this.#Q.ensureMounted().then((e10) => e10.closeModal("createOrganization"));
            };
            openWaitlist = (e10) => {
              this.assertComponentsReady(this.#Q), this.#Q.ensureMounted({
                preloadHint: "Waitlist"
              }).then((t10) => t10.openModal("waitlist", e10 || {})), this.telemetry?.record(em("Waitlist", e10));
            };
            closeWaitlist = () => {
              this.assertComponentsReady(this.#Q), this.#Q.ensureMounted().then((e10) => e10.closeModal("waitlist"));
            };
            mountSignIn = (e10, t10) => {
              this.assertComponentsReady(this.#Q);
              let i10 = "SignIn";
              this.#Q.ensureMounted({
                preloadHint: i10
              }).then((n11) => n11.mountComponent({
                name: i10,
                appearanceKey: "signIn",
                node: e10,
                props: t10
              }));
              let n10 = {
                withSignUp: t10?.withSignUp ?? this.#ep()
              };
              this.telemetry?.record(ef(i10, t10, n10));
            };
            unmountSignIn = (e10) => {
              this.assertComponentsReady(this.#Q), this.#Q.ensureMounted().then((t10) => t10.unmountComponent({
                node: e10
              }));
            };
            mountUserAvatar = (e10, t10) => {
              this.assertComponentsReady(this.#Q);
              let i10 = "UserAvatar";
              this.#Q.ensureMounted({
                preloadHint: i10
              }).then((n10) => n10.mountComponent({
                name: i10,
                appearanceKey: "userAvatar",
                node: e10,
                props: t10
              })), this.telemetry?.record(ef(i10, t10));
            };
            unmountUserAvatar = (e10) => {
              this.assertComponentsReady(this.#Q), this.#Q.ensureMounted().then((t10) => t10.unmountComponent({
                node: e10
              }));
            };
            mountSignUp = (e10, t10) => {
              this.assertComponentsReady(this.#Q);
              let i10 = "SignUp";
              this.#Q.ensureMounted({
                preloadHint: i10
              }).then((n10) => n10.mountComponent({
                name: i10,
                appearanceKey: "signUp",
                node: e10,
                props: t10
              })), this.telemetry?.record(ef(i10, t10));
            };
            unmountSignUp = (e10) => {
              this.assertComponentsReady(this.#Q), this.#Q.ensureMounted().then((t10) => t10.unmountComponent({
                node: e10
              }));
            };
            mountUserProfile = (e10, t10) => {
              if (this.assertComponentsReady(this.#Q), !this.user) {
                if ("development" === this.#ee) throw new T(rB.cannotRenderComponentWhenUserDoesNotExist, {
                  code: rq
                });
                return;
              }
              let i10 = "UserProfile";
              this.#Q.ensureMounted({
                preloadHint: i10
              }).then((n11) => n11.mountComponent({
                name: i10,
                appearanceKey: "userProfile",
                node: e10,
                props: t10
              }));
              let n10 = (t10?.customPages?.length || 0) > 0 ? {
                customPages: true
              } : void 0;
              this.telemetry?.record(ef(i10, t10, n10));
            };
            unmountUserProfile = (e10) => {
              this.assertComponentsReady(this.#Q), this.#Q.ensureMounted().then((t10) => t10.unmountComponent({
                node: e10
              }));
            };
            mountOrganizationProfile = (e10, t10) => {
              this.assertComponentsReady(this.#Q);
              let { isEnabled: i10 } = this.__internal_attemptToEnableEnvironmentSetting({
                for: "organizations",
                caller: "OrganizationProfile",
                onClose: () => {
                  throw new T(rB.cannotRenderAnyOrganizationComponent("OrganizationProfile"), {
                    code: rH
                  });
                }
              });
              if (!i10) return;
              let n10 = !!this.user;
              if (!this.organization && n10) {
                if ("development" === this.#ee) throw new T(rB.cannotRenderComponentWhenOrgDoesNotExist, {
                  code: rG
                });
                return;
              }
              this.#Q.ensureMounted({
                preloadHint: "OrganizationProfile"
              }).then((i11) => i11.mountComponent({
                name: "OrganizationProfile",
                appearanceKey: "userProfile",
                node: e10,
                props: t10
              })), this.telemetry?.record(ef("OrganizationProfile", t10));
            };
            unmountOrganizationProfile = (e10) => {
              this.assertComponentsReady(this.#Q), this.#Q.ensureMounted().then((t10) => t10.unmountComponent({
                node: e10
              }));
            };
            mountCreateOrganization = (e10, t10) => {
              this.assertComponentsReady(this.#Q);
              let { isEnabled: i10 } = this.__internal_attemptToEnableEnvironmentSetting({
                for: "organizations",
                caller: "CreateOrganization",
                onClose: () => {
                  throw new T(rB.cannotRenderAnyOrganizationComponent("CreateOrganization"), {
                    code: rH
                  });
                }
              });
              i10 && (this.#Q?.ensureMounted({
                preloadHint: "CreateOrganization"
              }).then((i11) => i11.mountComponent({
                name: "CreateOrganization",
                appearanceKey: "createOrganization",
                node: e10,
                props: t10
              })), this.telemetry?.record(ef("CreateOrganization", t10)));
            };
            unmountCreateOrganization = (e10) => {
              this.assertComponentsReady(this.#Q), this.#Q?.ensureMounted().then((t10) => t10.unmountComponent({
                node: e10
              }));
            };
            mountOrganizationSwitcher = (e10, t10) => {
              this.assertComponentsReady(this.#Q);
              let { isEnabled: i10 } = this.__internal_attemptToEnableEnvironmentSetting({
                for: "organizations",
                caller: "OrganizationSwitcher",
                onClose: () => {
                  throw new T(rB.cannotRenderAnyOrganizationComponent("OrganizationSwitcher"), {
                    code: rH
                  });
                }
              });
              i10 && (this.#Q?.ensureMounted({
                preloadHint: "OrganizationSwitcher"
              }).then((i11) => i11.mountComponent({
                name: "OrganizationSwitcher",
                appearanceKey: "organizationSwitcher",
                node: e10,
                props: t10
              })), this.telemetry?.record(ef("OrganizationSwitcher", {
                ...t10,
                forceOrganizationSelection: this.environment?.organizationSettings.forceOrganizationSelection
              })));
            };
            unmountOrganizationSwitcher = (e10) => {
              this.assertComponentsReady(this.#Q), this.#Q?.ensureMounted().then((t10) => t10.unmountComponent({
                node: e10
              }));
            };
            __experimental_prefetchOrganizationSwitcher = () => {
              this.assertComponentsReady(this.#Q), this.#Q?.ensureMounted({
                preloadHint: "OrganizationSwitcher"
              }).then((e10) => e10.prefetch("organizationSwitcher"));
            };
            mountOrganizationList = (e10, t10) => {
              this.assertComponentsReady(this.#Q);
              let { isEnabled: i10 } = this.__internal_attemptToEnableEnvironmentSetting({
                for: "organizations",
                caller: "OrganizationList",
                onClose: () => {
                  throw new T(rB.cannotRenderAnyOrganizationComponent("OrganizationList"), {
                    code: rH
                  });
                }
              });
              i10 && (this.#Q?.ensureMounted({
                preloadHint: "OrganizationList"
              }).then((i11) => i11.mountComponent({
                name: "OrganizationList",
                appearanceKey: "organizationList",
                node: e10,
                props: t10
              })), this.telemetry?.record(ef("OrganizationList", {
                ...t10,
                forceOrganizationSelection: this.environment?.organizationSettings.forceOrganizationSelection
              })));
            };
            unmountOrganizationList = (e10) => {
              this.assertComponentsReady(this.#Q), this.#Q?.ensureMounted().then((t10) => t10.unmountComponent({
                node: e10
              }));
            };
            mountUserButton = (e10, t10) => {
              this.assertComponentsReady(this.#Q), this.#Q?.ensureMounted({
                preloadHint: "UserButton"
              }).then((i11) => i11.mountComponent({
                name: "UserButton",
                appearanceKey: "userButton",
                node: e10,
                props: t10
              }));
              let i10 = {
                ...t10?.customMenuItems?.length || 0 ? {
                  customItems: true
                } : void 0,
                ...t10?.__experimental_asStandalone ? {
                  standalone: true
                } : void 0
              };
              this.telemetry?.record(ef("UserButton", t10, i10));
            };
            unmountUserButton = (e10) => {
              this.assertComponentsReady(this.#Q), this.#Q?.ensureMounted().then((t10) => t10.unmountComponent({
                node: e10
              }));
            };
            mountWaitlist = (e10, t10) => {
              this.assertComponentsReady(this.#Q), this.#Q?.ensureMounted({
                preloadHint: "Waitlist"
              }).then((i10) => i10.mountComponent({
                name: "Waitlist",
                appearanceKey: "waitlist",
                node: e10,
                props: t10
              })), this.telemetry?.record(ef("Waitlist", t10));
            };
            unmountWaitlist = (e10) => {
              this.assertComponentsReady(this.#Q), this.#Q?.ensureMounted().then((t10) => t10.unmountComponent({
                node: e10
              }));
            };
            mountPricingTable = (e10, t10) => {
              if (this.assertComponentsReady(this.#Q), e$(this, this.environment)) {
                if ("development" === this.#ee) throw new T(rB.cannotRenderAnyBillingComponent("PricingTable"), {
                  code: rV
                });
                return;
              }
              let i10 = {
                ...t10
              };
              void 0 !== t10?.forOrganizations && Z('Clerk: [IMPORTANT] <PricingTable /> prop `forOrganizations` is deprecated and will be removed in the coming minors. Use `for="organization"` instead.'), this.#Q.ensureMounted({
                preloadHint: "PricingTable"
              }).then((t11) => t11.mountComponent({
                name: "PricingTable",
                appearanceKey: "pricingTable",
                node: e10,
                props: i10
              })), this.telemetry?.record(ef("PricingTable", i10));
            };
            unmountPricingTable = (e10) => {
              this.assertComponentsReady(this.#Q), this.#Q.ensureMounted().then((t10) => t10.unmountComponent({
                node: e10
              }));
            };
            __internal_mountOAuthConsent = (e10, t10) => {
              this.assertComponentsReady(this.#Q), this.#Q.ensureMounted({
                preloadHint: "OAuthConsent"
              }).then((i10) => i10.mountComponent({
                name: "OAuthConsent",
                appearanceKey: "__internal_oauthConsent",
                node: e10,
                props: t10
              }));
            };
            __internal_unmountOAuthConsent = (e10) => {
              this.assertComponentsReady(this.#Q), this.#Q.ensureMounted().then((t10) => t10.unmountComponent({
                node: e10
              }));
            };
            mountAPIKeys = (e10, t10) => {
              if (this.assertComponentsReady(this.#Q), Z("Clerk: <APIKeys /> component is in early access and not yet recommended for production use."), ((e11, t11) => ej(e11, t11) && eJ(e11, t11))(this, this.environment)) {
                if ("development" === this.#ee) throw new T(rB.cannotRenderAPIKeysComponent, {
                  code: "cannot_render_api_keys_disabled"
                });
                return;
              }
              if (this.organization && eJ(this, this.environment)) {
                if ("development" === this.#ee) throw new T(rB.cannotRenderAPIKeysComponentForOrgWhenDisabled, {
                  code: "cannot_render_api_keys_org_disabled"
                });
                return;
              }
              if (ej(this, this.environment)) {
                if ("development" === this.#ee) throw new T(rB.cannotRenderAPIKeysComponentForUserWhenDisabled, {
                  code: "cannot_render_api_keys_user_disabled"
                });
                return;
              }
              this.#Q.ensureMounted({
                preloadHint: "APIKeys"
              }).then((i10) => i10.mountComponent({
                name: "APIKeys",
                appearanceKey: "apiKeys",
                node: e10,
                props: t10
              })), this.telemetry?.record(ef("APIKeys", t10));
            };
            unmountAPIKeys = (e10) => {
              this.assertComponentsReady(this.#Q), this.#Q.ensureMounted().then((t10) => t10.unmountComponent({
                node: e10
              }));
            };
            mountTaskChooseOrganization = (e10, t10) => {
              this.assertComponentsReady(this.#Q);
              let { isEnabled: i10 } = this.__internal_attemptToEnableEnvironmentSetting({
                for: "organizations",
                caller: "TaskChooseOrganization",
                onClose: () => {
                  throw new T(rB.cannotRenderAnyOrganizationComponent("TaskChooseOrganization"), {
                    code: rH
                  });
                }
              });
              i10 && (this.#Q.ensureMounted({
                preloadHint: "TaskChooseOrganization"
              }).then((i11) => i11.mountComponent({
                name: "TaskChooseOrganization",
                appearanceKey: "taskChooseOrganization",
                node: e10,
                props: t10
              })), this.telemetry?.record(ef("TaskChooseOrganization", t10)));
            };
            unmountTaskChooseOrganization = (e10) => {
              this.assertComponentsReady(this.#Q), this.#Q.ensureMounted().then((t10) => t10.unmountComponent({
                node: e10
              }));
            };
            mountTaskResetPassword = (e10, t10) => {
              this.assertComponentsReady(this.#Q), this.#Q.ensureMounted({
                preloadHint: "TaskResetPassword"
              }).then((i10) => i10.mountComponent({
                name: "TaskResetPassword",
                appearanceKey: "taskResetPassword",
                node: e10,
                props: t10
              })), this.telemetry?.record(ef("TaskResetPassword", t10));
            };
            unmountTaskResetPassword = (e10) => {
              this.assertComponentsReady(this.#Q), this.#Q.ensureMounted().then((t10) => t10.unmountComponent({
                node: e10
              }));
            };
            mountTaskSetupMFA = (e10, t10) => {
              this.assertComponentsReady(this.#Q), this.#Q.ensureMounted({
                preloadHint: "TaskSetupMFA"
              }).then((i10) => i10.mountComponent({
                name: "TaskSetupMFA",
                appearanceKey: "taskSetupMfa",
                node: e10,
                props: t10
              })), this.telemetry?.record(ef("TaskSetupMFA", t10));
            };
            unmountTaskSetupMFA = (e10) => {
              this.assertComponentsReady(this.#Q), this.#Q.ensureMounted().then((t10) => t10.unmountComponent({
                node: e10
              }));
            };
            setActive = async (e10) => {
              let { organization: t10, beforeEmit: i10, redirectUrl: n10, navigate: r2 } = e10, { session: s2 } = e10;
              this.__internal_setActiveInProgress = true, eA.debug("setActive() start", {
                hasClient: !!this.client,
                sessionTarget: "string" == typeof s2 ? s2 : s2?.id ?? s2 ?? null,
                organizationTarget: "string" == typeof t10 ? t10 : t10?.id ?? t10 ?? null,
                redirectUrl: n10 ?? null
              }, "clerk");
              try {
                if (!this.client) throw eA.warn("Clerk setActive called before client is loaded", {}, "clerk"), Error("setActive is being called before the client is loaded. Wait for init.");
                if (void 0 === s2 && !this.session) throw eA.warn("Clerk setActive precondition not met: no target session and no active session", {}, "clerk"), Error("setActive should either be called with a session param or there should be already an active session.");
                "string" == typeof s2 && (s2 = this.client.sessions.find((e11) => e11.id === s2) || null);
                let a2 = "undefined" != typeof window && "function" == typeof window.__unstable__onBeforeSetActive ? window.__unstable__onBeforeSetActive : ey.ZT, o2 = "undefined" != typeof window && "function" == typeof window.__unstable__onAfterSetActive ? window.__unstable__onAfterSetActive : ey.ZT, l2 = void 0 === s2 ? this.session : s2;
                l2?.status === "pending" && function(e11) {
                  let t11 = [
                    "taskUrls",
                    "navigate"
                  ];
                  Object.keys(e11).some((e12) => t11.includes(e12)) || Z('Clerk: Session has pending tasks but no handling is configured. To handle pending tasks, provide either "taskUrls" for navigation to custom URLs or "navigate" for programmatic navigation. Without these options, users may get stuck on incomplete flows.');
                }({
                  ...this.#er,
                  ...e10
                });
                let c2 = void 0 !== t10;
                if (l2 && c2) {
                  let e11 = "string" == typeof t10 ? t10 : t10?.id;
                  if (function(e12) {
                    return "string" == typeof e12 && e12.startsWith("org_");
                  }(e11)) l2.lastActiveOrganizationId = e11 || null;
                  else {
                    let t11 = l2.user.organizationMemberships.find((t12) => t12.organization.slug === e11), i11 = t11?.organization.id || null, n11 = null === i11;
                    if (this.environment?.organizationSettings?.forceOrganizationSelection && n11) return;
                    l2.lastActiveOrganizationId = i11;
                  }
                }
                l2?.status !== "pending" && await a2(null === l2 ? "sign-out" : void 0), (te() && globalThis.document.hasFocus() || !this.#er.standardBrowser) && (await this.#em(l2, c2 ? "select_org" : "select_session"), l2 = this.#eg(l2?.id)), await l2?.getToken() || (d() || eA.warn("Token is null when setting active session (offline)", {
                  sessionId: l2?.id
                }, "clerk"), ix.emit(iP, {
                  token: null
                }));
                let h2 = eT(this.#er.standardBrowser);
                i10 && (((e11, t11, i11) => {
                  let n11 = (() => {
                    try {
                      return true;
                    } catch {
                    }
                    return false;
                  })(), r3 = i11 ?? e11;
                  g.has(r3) || n11 || (g.add(r3), console.warn(`Clerk - DEPRECATION WARNING: "${e11}" is deprecated and will be removed in the next major release.
${t11}`));
                })("Clerk.setActive({beforeEmit})", 'Use the `redirectUrl` property instead. Example `Clerk.setActive({redirectUrl:"/"})`'), await h2.track(async () => {
                  this.#ef(), await i10(l2);
                }));
                let u2 = l2?.status === "pending" && l2?.currentTask && this.#er.taskUrls?.[l2?.currentTask.key];
                if (!i10 && (n10 || u2 || r2) && await h2.track(async () => {
                  if (this.client) {
                    if (l2?.status !== "pending" && this.#ef(), u2) {
                      let e11 = n10 ? e0({
                        base: u2,
                        hashSearchParams: {
                          redirectUrl: n10
                        }
                      }, {
                        stringify: true
                      }) : u2;
                      await this.navigate(e11);
                    } else if (r2 && l2) await r2({
                      session: l2
                    });
                    else if (n10) {
                      if (this.client.isEligibleForTouch()) {
                        let e11 = new URL(n10, window.location.href), t11 = this.buildUrlWithAuth(this.client.buildTouchUrl({
                          redirectUrl: e11
                        }));
                        await this.navigate(t11);
                      }
                      await this.navigate(n10);
                    }
                  }
                }), h2.isUnloading()) return;
                this.#ec(l2), this.#ed(), l2?.status !== "pending" && await o2();
              } finally {
                this.__internal_setActiveInProgress = false;
              }
            };
            addListener = (e10) => (e10 = /* @__PURE__ */ function(e11) {
              let t10;
              return (i10) => {
                var n10;
                t10 ||= {
                  ...i10
                }, e11(t10 = {
                  ...{
                    client: n$((n10 = t10).client, i10.client),
                    session: n$(n10.session, i10.session),
                    user: n$(n10.user, i10.user),
                    organization: n$(n10.organization, i10.organization)
                  }
                });
              };
            }(e10), this.#ei.push(e10), this.client && e10({
              client: this.client,
              session: this.session,
              user: this.user,
              organization: this.organization
            }), () => {
              this.#ei = this.#ei.filter((t10) => t10 !== e10);
            });
            on = (...e10) => {
              this.#eo.on(...e10);
            };
            off = (...e10) => {
              this.#eo.off(...e10);
            };
            __internal_addNavigationListener = (e10) => (this.#en.push(e10), () => {
              this.#en = this.#en.filter((t10) => t10 !== e10);
            });
            navigate = async (e10, t10) => {
              if (!e10 || !te()) return;
              if (void 0 === window.location) {
                let i11 = t10?.replace && this.#er.routerReplace ? this.#er.routerReplace : this.#er.routerPush;
                return i11 ? (eA.info(`Clerk is navigating to: ${e10}`), await i11(e10, {
                  windowNavigate: eP
                })) : void 0;
              }
              setTimeout(() => {
                this.#e_();
              }, 0);
              let i10 = new URL(e10, window.location.href);
              this.#ey.includes(i10.protocol) || (console.warn(`Clerk: "${i10.protocol}" is not a valid protocol. Redirecting to "/" instead. If you think this is a mistake, please open an issue.`), i10 = new URL("/", window.location.href));
              let n10 = t10?.replace && this.#er.routerReplace ? this.#er.routerReplace : this.#er.routerPush;
              if (eA.info(`Clerk is navigating to: ${i10}`), this.#er.routerDebug && console.log(`Clerk is navigating to: ${i10}`), "null" !== i10.origin && i10.origin !== window.location.origin || !n10) return void eP(i10);
              let r2 = {
                ...t10?.metadata ? {
                  __internal_metadata: t10?.metadata
                } : {},
                windowNavigate: eP
              };
              return await n10(e1(i10), r2);
            };
            buildUrlWithAuth(e10) {
              if ("production" === this.#ee) return e10;
              let t10 = new URL(e10, window.location.origin);
              return t10.origin !== window.location.origin && this.#H ? this.#H.decorateUrlWithDevBrowserToken(t10).href : t10.href;
            }
            buildSignInUrl(e10) {
              return this.#eb("signInUrl", {
                ...e10,
                redirectUrl: e10?.redirectUrl || window.location.href
              }, e10?.initialValues);
            }
            buildSignUpUrl(e10) {
              return this.#eb("signUpUrl", {
                ...e10,
                redirectUrl: e10?.redirectUrl || window.location.href
              }, e10?.initialValues);
            }
            buildUserProfileUrl() {
              return this.environment && this.environment.displayConfig ? this.buildUrlWithAuth(this.environment.displayConfig.userProfileUrl) : "";
            }
            buildHomeUrl() {
              return this.environment && this.environment.displayConfig ? this.buildUrlWithAuth(this.environment.displayConfig.homeUrl) : "";
            }
            buildAfterSignInUrl({ params: e10 } = {}) {
              return this.buildUrlWithAuth(new nK(this.#er, {}, e10).getAfterSignInUrl());
            }
            buildAfterSignUpUrl({ params: e10 } = {}) {
              return this.buildUrlWithAuth(new nK(this.#er, {}, e10).getAfterSignUpUrl());
            }
            buildAfterSignOutUrl() {
              return this.#er.afterSignOutUrl ? this.buildUrlWithAuth(this.#er.afterSignOutUrl) : "/";
            }
            buildNewSubscriptionRedirectUrl() {
              return this.#er.newSubscriptionRedirectUrl ? this.#er.newSubscriptionRedirectUrl : this.buildAfterSignInUrl();
            }
            buildWaitlistUrl(e10) {
              return this.environment && this.environment.displayConfig ? e0({
                base: this.#er.waitlistUrl || this.environment.displayConfig.waitlistUrl,
                hashSearchParams: [
                  new URLSearchParams(e10?.initialValues || {})
                ]
              }, {
                stringify: true
              }) : "";
            }
            buildAfterMultiSessionSingleSignOutUrl() {
              return this.environment ? this.#er.afterMultiSessionSingleSignOutUrl ? this.buildUrlWithAuth(this.#er.afterMultiSessionSingleSignOutUrl) : this.#er.signInUrl ? this.buildUrlWithAuth(e0({
                base: this.#er.signInUrl,
                hashPath: "choose"
              }, {
                stringify: true
              })) : this.buildUrlWithAuth(this.environment.displayConfig.afterSignOutOneUrl) : "";
            }
            buildCreateOrganizationUrl() {
              return this.environment && this.environment.displayConfig ? this.buildUrlWithAuth(this.environment.displayConfig.createOrganizationUrl) : "";
            }
            buildOrganizationProfileUrl() {
              return this.environment && this.environment.displayConfig ? this.buildUrlWithAuth(this.environment.displayConfig.organizationProfileUrl) : "";
            }
            buildTasksUrl(e10) {
              let t10 = this.session?.currentTask;
              if (!t10) return "";
              let i10 = this.#er.taskUrls?.[t10.key];
              return i10 || e0({
                base: this.buildSignInUrl(e10),
                hashPath: rp(t10)
              }, {
                stringify: true
              });
            }
            #ew = async () => {
              if (!te()) return;
              let e10 = new URLSearchParams({
                [eM]: "true"
              }), t10 = eF(eR);
              t10 && Q(t10) || function() {
                throw Error(`${tk} Invalid redirect_url. A valid http or https url should be used for the redirection.`);
              }();
              let i10 = e0({
                base: eF(eR),
                searchParams: e10
              }, {
                stringify: true
              });
              return this.navigate(this.buildUrlWithAuth(i10));
            };
            redirectWithAuth = async (e10) => {
              if (te()) return this.navigate(this.buildUrlWithAuth(e10));
            };
            redirectToSignIn = async (e10) => {
              if (te()) return this.navigate(this.buildSignInUrl(e10));
            };
            redirectToSignUp = async (e10) => {
              if (te()) return this.navigate(this.buildSignUpUrl(e10));
            };
            redirectToUserProfile = async () => {
              if (te()) return this.navigate(this.buildUserProfileUrl());
            };
            redirectToCreateOrganization = async () => {
              if (te()) return this.navigate(this.buildCreateOrganizationUrl());
            };
            redirectToOrganizationProfile = async () => {
              if (te()) return this.navigate(this.buildOrganizationProfileUrl());
            };
            redirectToAfterSignIn = async () => {
              if (te()) return this.navigate(this.buildAfterSignInUrl());
            };
            redirectToAfterSignUp = async () => {
              if (te()) return this.navigate(this.buildAfterSignUpUrl());
            };
            redirectToAfterSignOut = async () => {
              if (te()) return this.navigate(this.buildAfterSignOutUrl());
            };
            redirectToWaitlist = async () => {
              if (te()) return this.navigate(this.buildWaitlistUrl());
            };
            redirectToTasks = async (e10) => {
              if (te()) return this.navigate(this.buildTasksUrl(e10));
            };
            handleEmailLinkVerification = async (e10, t10) => {
              if (!this.client) return;
              let i10 = eF("__clerk_status");
              if ("expired" === i10) throw new U(P.Expired);
              if ("client_mismatch" === i10) throw new U(P.ClientMismatch);
              if ("verified" !== i10) throw new U(P.Failed);
              let n10 = eF("__clerk_created_session"), { signIn: r2, signUp: s2, sessions: a2 } = this.client, o2 = a2.some((e11) => e11.id === n10), l2 = "needs_second_factor" === r2.status || "missing_requirements" === s2.status, c2 = (e11) => t10 && "function" == typeof t10 ? t10(e11) : this.navigate(e11), d2 = e10.redirectUrl ? () => c2(e10.redirectUrl) : ey.ZT;
              return o2 ? this.setActive({
                session: n10,
                redirectUrl: e10.redirectUrlComplete
              }) : l2 ? d2() : ("function" == typeof e10.onVerifiedOnOtherDevice && e10.onVerifiedOnOtherDevice(), null);
            };
            handleGoogleOneTapCallback = async (e10, t10, i10) => {
              if (!this.loaded || !this.environment || !this.client) return;
              let { signIn: n10, signUp: r2 } = this.client, s2 = "identifier" in (e10 || {}) ? e10 : n10, a2 = "missingFields" in (e10 || {}) ? e10 : r2, o2 = (e11) => i10 && "function" == typeof i10 ? i10(this.buildUrlWithAuth(e11)) : this.navigate(this.buildUrlWithAuth(e11));
              return this._handleRedirectCallback(t10, {
                signUp: a2,
                signIn: s2,
                navigate: o2
              });
            };
            _handleRedirectCallback = async (e10, { signIn: t10, signUp: i10, navigate: n10 }) => {
              if (!this.loaded || !this.environment || !this.client) return;
              if (!window.opener && e10.reloadResource) try {
                "signIn" === e10.reloadResource ? await t10.reload() : "signUp" === e10.reloadResource && await i10.reload();
              } catch {
              }
              let { displayConfig: r2 } = this.environment, { firstFactorVerification: s2 } = t10, { externalAccount: a2 } = i10.verifications, o2 = {
                status: i10.status,
                missingFields: i10.missingFields,
                externalAccountStatus: a2.status,
                externalAccountErrorCode: a2.error?.code,
                externalAccountSessionId: a2.error?.meta?.sessionId,
                sessionId: i10.createdSessionId
              }, l2 = {
                status: t10.status,
                firstFactorVerificationStatus: s2.status,
                firstFactorVerificationErrorCode: s2.error?.code,
                firstFactorVerificationSessionId: s2.error?.meta?.sessionId,
                sessionId: t10.createdSessionId
              }, c2 = (e11) => () => n10(e11), d2 = c2(e10.signInUrl || r2.signInUrl), h2 = c2(e10.signUpUrl || r2.signUpUrl), u2 = c2(e10.firstFactorUrl || e0({
                base: r2.signInUrl,
                hashPath: "/factor-one"
              }, {
                stringify: true
              })), p2 = c2(e10.secondFactorUrl || e0({
                base: r2.signInUrl,
                hashPath: "/factor-two"
              }, {
                stringify: true
              })), f2 = c2(e10.resetPasswordUrl || e0({
                base: r2.signInUrl,
                hashPath: "/reset-password"
              }, {
                stringify: true
              })), m2 = new nK(this.#er, e10), g2 = c2(e10.continueSignUpUrl || e0({
                base: r2.signUpUrl,
                hashPath: "/continue"
              }, {
                stringify: true
              })), _2 = ({ missingFields: t11 }) => t11.length ? g2() : (({ signUp: e11, verifyEmailPath: t12, verifyPhonePath: i11, continuePath: n11, navigate: r3, handleComplete: s3, redirectUrl: a3 = "", redirectUrlComplete: o3 = "", oidcPrompt: l3 }) => {
                if ("complete" === e11.status) return s3 && s3();
                if ("missing_requirements" === e11.status) {
                  if (e11.missingFields.some((e12) => "saml" === e12 || "enterprise_sso" === e12)) return e11.authenticateWithRedirect({
                    strategy: "enterprise_sso",
                    redirectUrl: a3,
                    redirectUrlComplete: o3,
                    continueSignUp: true,
                    oidcPrompt: l3
                  });
                  let s4 = eW();
                  if (e11.unverifiedFields?.includes("email_address") && t12) return r3(t12, {
                    searchParams: s4
                  });
                  if (e11.unverifiedFields?.includes("phone_number") && i11) return r3(i11, {
                    searchParams: s4
                  });
                  if (n11) return r3(n11, {
                    searchParams: s4
                  });
                }
              })({
                signUp: i10,
                verifyEmailPath: e10.verifyEmailAddressUrl || e0({
                  base: r2.signUpUrl,
                  hashPath: "/verify-email-address"
                }, {
                  stringify: true
                }),
                verifyPhonePath: e10.verifyPhoneNumberUrl || e0({
                  base: r2.signUpUrl,
                  hashPath: "/verify-phone-number"
                }, {
                  stringify: true
                }),
                navigate: n10
              }), y2 = e10.signInUrl || r2.signInUrl, b2 = e10.signUpUrl || r2.signUpUrl, w2 = async ({ session: e11, baseUrl: t11, redirectUrl: i11 }) => {
                if (!e11.currentTask) return void await this.navigate(i11);
                await rf(e11, {
                  baseUrl: t11,
                  navigate: this.navigate
                });
              };
              if ("complete" === l2.status) return this.setActive({
                session: l2.sessionId,
                navigate: async ({ session: e11 }) => {
                  await w2({
                    session: e11,
                    baseUrl: y2,
                    redirectUrl: m2.getAfterSignInUrl()
                  });
                }
              });
              if ("transferable" === o2.externalAccountStatus && "external_account_exists" === o2.externalAccountErrorCode) {
                let e11 = await t10.create({
                  transfer: true
                });
                switch (e11.status) {
                  case "complete":
                    return this.setActive({
                      session: e11.createdSessionId,
                      navigate: async ({ session: e12 }) => {
                        await w2({
                          session: e12,
                          baseUrl: b2,
                          redirectUrl: m2.getAfterSignInUrl()
                        });
                      }
                    });
                  case "needs_first_factor":
                    return u2();
                  case "needs_second_factor":
                    return p2();
                  case "needs_new_password":
                    return f2();
                  default:
                    tC("sign in");
                }
              }
              let v2 = "user_locked" === o2.externalAccountErrorCode, k2 = "user_locked" === l2.firstFactorVerificationErrorCode;
              if (v2) return h2();
              if (k2) return d2();
              if ("needs_first_factor" === l2.status && !t10.supportedFirstFactors?.every((e11) => "enterprise_sso" === e11.strategy)) return u2();
              if ("needs_new_password" === l2.status) return f2();
              if ("transferable" === l2.firstFactorVerificationStatus) {
                if (false === e10.transferable) return d2();
                let t11 = await i10.create({
                  transfer: true,
                  unsafeMetadata: e10.unsafeMetadata
                });
                switch (t11.status) {
                  case "complete":
                    return this.setActive({
                      session: t11.createdSessionId,
                      navigate: async ({ session: e11 }) => {
                        await w2({
                          session: e11,
                          baseUrl: b2,
                          redirectUrl: m2.getAfterSignUpUrl()
                        });
                      }
                    });
                  case "missing_requirements":
                    return _2({
                      missingFields: t11.missingFields
                    });
                  default:
                    tC("sign in");
                }
              }
              if ("complete" === o2.status) return this.setActive({
                session: o2.sessionId,
                navigate: async ({ session: e11 }) => {
                  await w2({
                    session: e11,
                    baseUrl: b2,
                    redirectUrl: m2.getAfterSignUpUrl()
                  });
                }
              });
              if ("needs_second_factor" === l2.status) return p2();
              let S2 = ("failed" === o2.externalAccountStatus || "unverified" === o2.externalAccountStatus) && "identifier_already_signed_in" === o2.externalAccountErrorCode && o2.externalAccountSessionId, C2 = "failed" === l2.firstFactorVerificationStatus && "identifier_already_signed_in" === l2.firstFactorVerificationErrorCode && l2.firstFactorVerificationSessionId;
              if (S2 || C2) {
                let e11 = l2.firstFactorVerificationSessionId || o2.externalAccountSessionId;
                if (e11) return this.setActive({
                  session: e11,
                  navigate: async ({ session: e12 }) => {
                    await w2({
                      session: e12,
                      baseUrl: S2 ? b2 : y2,
                      redirectUrl: m2.getAfterSignInUrl()
                    });
                  }
                });
              }
              return ((e11) => {
                let { externalAccount: t11 } = e11.verifications;
                return !!t11.error;
              })(i10) ? h2() : "verified" === o2.externalAccountStatus && "missing_requirements" === o2.status ? _2({
                missingFields: i10.missingFields
              }) : this.session?.currentTask ? void await this.redirectToTasks({
                redirectUrl: this.buildAfterSignInUrl()
              }) : d2();
            };
            handleRedirectCallback = async (e10 = {}, t10) => {
              if (!this.loaded || !this.environment || !this.client) return;
              let { signIn: i10, signUp: n10 } = this.client, r2 = (e11) => t10 && "function" == typeof t10 ? t10(e11) : this.navigate(e11);
              return this._handleRedirectCallback(e10, {
                signUp: n10,
                signIn: i10,
                navigate: r2
              });
            };
            handleUnauthenticated = async (e10 = {
              broadcast: true
            }) => {
              if (this.client && this.session) {
                eA.warn("handleUnauthenticated triggered", {
                  activeSessionId: this.session.id,
                  hasActor: !!this.session.actor,
                  totalSessions: this.client.sessions?.length ?? 0
                }, "clerk");
                try {
                  let t10 = await ie.getOrCreateInstance().fetch();
                  if (this.updateClient(t10), this.session) return;
                  return e10.broadcast && ix.emit(iT, null), this.setActive({
                    session: null
                  });
                } catch (e11) {
                  if (S(e11) && [
                    403,
                    500
                  ].includes(e11.status)) return this.setActive({
                    session: null
                  });
                  throw e11;
                }
              }
            };
            authenticateWithGoogleOneTap = async (e10) => this.client?.signIn.create({
              strategy: "google_one_tap",
              token: e10.token
            }).catch((t10) => {
              if (S(t10) && "external_account_not_found" === t10.errors[0].code) return this.client?.signUp.create({
                strategy: "google_one_tap",
                token: e10.token,
                legalAccepted: e10.legalAccepted
              });
              throw t10;
            });
            authenticateWithMetamask = async (e10 = {}) => {
              await this.authenticateWithWeb3({
                ...e10,
                strategy: "web3_metamask_signature"
              });
            };
            authenticateWithCoinbaseWallet = async (e10 = {}) => {
              await this.authenticateWithWeb3({
                ...e10,
                strategy: "web3_coinbase_wallet_signature"
              });
            };
            authenticateWithBase = async (e10 = {}) => {
              await this.authenticateWithWeb3({
                ...e10,
                strategy: "web3_base_signature"
              });
            };
            authenticateWithOKXWallet = async (e10 = {}) => {
              await this.authenticateWithWeb3({
                ...e10,
                strategy: "web3_okx_wallet_signature"
              });
            };
            authenticateWithSolana = async (e10) => {
              await this.authenticateWithWeb3({
                ...e10,
                strategy: "web3_solana_signature"
              });
            };
            authenticateWithWeb3 = async ({ redirectUrl: e10, signUpContinueUrl: t10, customNavigate: i10, unsafeMetadata: n10, strategy: r2, legalAccepted: s2, secondFactorUrl: a2, walletName: o2 }) => {
              let l2, c2;
              if (!this.client || !this.environment) return;
              let { displayConfig: d2 } = this.environment, h2 = r2.replace("web3_", "").replace("_signature", ""), u2 = await tr({
                provider: h2,
                walletName: o2
              });
              switch (h2) {
                case "metamask":
                  l2 = th;
                  break;
                case "base":
                  l2 = tf;
                  break;
                case "coinbase_wallet":
                  l2 = tu;
                  break;
                case "solana":
                  if (!o2) throw new T("Wallet name is required for Solana authentication.", {
                    code: "web3_solana_wallet_name_required"
                  });
                  l2 = (e11) => tm({
                    ...e11,
                    walletName: o2
                  });
                  break;
                default:
                  l2 = tp;
              }
              let p2 = (e11) => () => i10 && "function" == typeof i10 ? i10(e11) : this.navigate(e11), f2 = p2(a2 || e0({
                base: d2.signInUrl,
                hashPath: "/factor-two"
              }, {
                stringify: true
              })), m2 = p2(t10 || e0({
                base: d2.signUpUrl,
                hashPath: "/continue"
              }, {
                stringify: true
              }));
              try {
                c2 = await this.client.signIn.authenticateWithWeb3({
                  identifier: u2,
                  generateSignature: l2,
                  strategy: r2,
                  walletName: o2
                });
              } catch (e11) {
                if (eK(e11, "form_identifier_not_found")) c2 = await this.client.signUp.authenticateWithWeb3({
                  identifier: u2,
                  generateSignature: l2,
                  unsafeMetadata: n10,
                  strategy: r2,
                  legalAccepted: s2,
                  walletName: o2
                }), t10 && "missing_requirements" === c2.status && "verified" === c2.verifications.web3Wallet.status && await m2();
                else throw e11;
              }
              let g2 = async ({ session: e11, redirectUrl: t11 }) => {
                if (!e11.currentTask) return void await this.navigate(t11);
                await rf(e11, {
                  baseUrl: d2.signInUrl,
                  navigate: this.navigate
                });
              };
              switch (c2.status) {
                case "needs_second_factor":
                  await f2();
                  break;
                case "complete":
                  c2.createdSessionId && await this.setActive({
                    session: c2.createdSessionId,
                    navigate: async ({ session: t11 }) => {
                      await g2({
                        session: t11,
                        redirectUrl: e10 ?? this.buildAfterSignInUrl()
                      });
                    }
                  });
                  break;
                default:
                  return;
              }
            };
            createOrganization = async ({ name: e10, slug: t10 }) => i5.create({
              name: e10,
              slug: t10
            });
            getOrganization = async (e10) => i5.get(e10);
            joinWaitlist = async ({ emailAddress: e10 }) => nD.join({
              emailAddress: e10
            });
            updateEnvironment(e10) {
              this.environment = e10;
            }
            __internal_setCountry = (e10) => {
              this.__internal_country || (this.__internal_country = e10);
            };
            get __internal_last_error() {
              let e10 = this.internal_last_error;
              return this.internal_last_error = null, e10;
            }
            set __internal_last_error(e10) {
              this.internal_last_error = e10;
            }
            updateClient = (e10) => {
              if (!this.client) {
                let t10 = this.#er.selectInitialSession ? this.#er.selectInitialSession(e10) : this.#ev(e10);
                this.#ec(t10);
              }
              if (this.client = e10, this.session) {
                let e11 = this.#eg(this.session.id);
                "active" === this.session.status && e11?.status === "pending" && ("undefined" != typeof window && "function" == typeof window.__unstable__onAfterSetActive ? window.__unstable__onAfterSetActive : ey.ZT)(), this.#ec(e11), this.session?.lastActiveToken || d() || eA.warn("No last active token when updating client (offline)", {
                  sessionId: this.session?.id
                }, "clerk"), ix.emit(iP, {
                  token: this.session?.lastActiveToken
                });
              }
              this.#ed();
            };
            get __unstable__environment() {
              return this.environment;
            }
            __unstable__setEnvironment = async (e10) => {
              this.environment = new iM(e10), rQ.mountComponentRenderer && (this.#Q = rQ.mountComponentRenderer(this, this.environment, this.#er));
            };
            __unstable__onBeforeRequest = (e10) => {
              this.#X.onBeforeRequest(e10);
            };
            __unstable__onAfterResponse = (e10) => {
              this.#X.onAfterResponse(e10);
            };
            __unstable__updateProps = (e10) => {
              let t10 = {
                ...e10,
                options: this.#el({
                  ...this.#er,
                  ...e10.options
                })
              };
              return this.#Q?.ensureMounted().then((e11) => e11.updateProps(t10));
            };
            __internal_navigateWithError(e10, t10) {
              return this.__internal_last_error = t10, this.navigate(e10);
            }
            #ek = () => {
              let e10 = new URLSearchParams({
                [eR]: window.location.href
              });
              return e0({
                base: this.#er.signInUrl,
                searchParams: e10
              }, {
                stringify: true
              });
            };
            #eS = () => {
              let e10;
              if (this.proxyUrl) {
                let t10 = new URL(this.proxyUrl);
                e10 = new URL(`${t10.pathname}/v1/client/sync`, t10.origin);
              } else this.domain && (e10 = new URL("/v1/client/sync", `https://${this.domain}`));
              return e10?.searchParams.append("redirect_url", window.location.href), e10?.toString() || "";
            };
            #eC = () => "true" !== eF(eM) && !!this.isSatellite && !!this.#H?.isSignedOut();
            #eA = () => "production" !== this.#ee && !this.isSatellite && !!eF(eR);
            #eU = async () => {
              "development" === this.instanceType ? await this.navigate(this.#ek()) : "production" === this.instanceType && await this.navigate(this.#eS());
            };
            #eI = (e10, t10) => {
              let i10;
              try {
                i10 = new URL(e10);
              } catch {
                throw Error(`${tk} The signInUrl needs to have a absolute url format.`);
              }
              i10.origin === t10 && function() {
                throw Error(`${tk} The signInUrl needs to be on a different origin than your satellite application.`);
              }();
            };
            #eP = () => {
              this.isSatellite && ("development" !== this.#ee || this.#er.signInUrl || function() {
                throw Error(`${tk} Missing signInUrl. A satellite application needs to specify the signInUrl for development instances.`);
              }(), this.proxyUrl || this.domain || function() {
                throw Error(`${tk} Missing domain and proxyUrl. A satellite application needs to specify a domain or a proxyUrl.`);
              }(), this.#er.signInUrl && this.#eI(this.#er.signInUrl, window.location.origin));
            };
            #eh = async () => {
              if (this.#H = await ri.create(this, this.#X, this.#ee, this.#eo), this.#eP(), this.#eC()) return void await this.#eU();
              if (this.#eA()) return void await this.#ew();
              this.#es = (() => {
                if (!a()) return {
                  onPageFocus: ey.ZT
                };
                let e11 = [];
                return window.addEventListener("focus", () => {
                  "visible" === document.visibilityState && e11.forEach((e12) => e12());
                }), {
                  onPageFocus: (t11) => {
                    e11.push(t11);
                  }
                };
              })(), "undefined" != typeof BroadcastChannel && (this.#Y = new BroadcastChannel("clerk")), this.#eT();
              let e10 = function(e11 = window.location.hostname) {
                if (!e11) return false;
                let t11 = eQ.get(e11);
                void 0 === t11 && (t11 = W.some((t12) => e11.startsWith("accounts.") && e11.endsWith(t12)) || L.some((t12) => e11.endsWith(t12) && !e11.endsWith(".clerk" + t12)), eQ.set(e11, t11));
                return t11;
              }(window?.location.hostname), t10 = "development" === this.#ee && !e10, i10 = 0, n10 = 0;
              for (; n10 < 2; ) {
                n10++;
                try {
                  let e11 = iM.getInstance().fetch({
                    touch: t10
                  }).then((e12) => this.updateEnvironment(e12)).catch(() => {
                    ++i10;
                    let e12 = tv.getItem(ty, null);
                    e12 && this.updateEnvironment(new iM(e12));
                  }), n11 = async () => {
                    let e12 = new AbortController();
                    return (0, ey.AW)(ie.getOrCreateInstance().fetch({
                      abortSignal: e12.signal
                    }), 7e3, e12).then((e13) => this.updateClient(e13)).catch(async (e13) => {
                      if (R(e13)) throw e13;
                      ++i10, this.#H?.stopPollingForToken();
                      try {
                        let e14 = this.#ev(rs(this.#H?.getSessionCookie()));
                        e14?.clearCache();
                        let t11 = e14 ? await (0, ey.AW)(e14.getToken(), 7e3).catch(() => (e14.clearCache(), this.#H?.getSessionCookie())) : this.#H?.getSessionCookie();
                        this.updateClient(rs(t11));
                      } finally {
                        this.#H?.startPollingForToken();
                      }
                      return ie.getOrCreateInstance().fetch().then((e14) => this.updateClient(e14)).catch(ey.ZT), null;
                    });
                  }, r2 = () => {
                    rQ.mountComponentRenderer && !this.#Q && (this.#Q = rQ.mountComponentRenderer(this, this.environment, this.#er));
                  }, [, s2] = await (0, ey.Lu)([
                    e11,
                    n11()
                  ]);
                  if ("rejected" === s2.status) {
                    let e12 = s2.reason;
                    if (eK(e12, "requires_captcha")) r2(), await n11();
                    else throw e12;
                  }
                  if (this.#H?.setClientUatCookieForDevelopmentInstances(), await this.#eO()) return;
                  r2();
                  break;
                } catch (e11) {
                  if (eK(e11, "dev_browser_unauthenticated")) await this.#H.handleUnauthenticatedDevBrowser();
                  else if (!d()) return void console.warn(e11);
                  else throw e11;
                }
                n10 >= 2 && function() {
                  throw Error(`${tk} Something went wrong initializing Clerk.`);
                }();
              }
              this.#Z = new rn(this), this.#Z.start(), this.#eE(), this.#ex(), this.#eR(), this.#eo.emit(m, i10 > 0 ? "degraded" : "ready");
            };
            shouldFallbackToCachedResources = () => !!this.__internal_getCachedResources;
            #eu = async () => {
              let e10, t10, i10 = this.shouldFallbackToCachedResources() ? 1 : void 0, n10 = 0;
              try {
                [e10, t10] = await Promise.all([
                  iM.getInstance().fetch({
                    touch: false,
                    fetchMaxTries: i10
                  }),
                  ie.getOrCreateInstance().fetch({
                    fetchMaxTries: i10
                  })
                ]);
              } catch (i11) {
                if (O(i11) && "network_error" === i11.code && this.shouldFallbackToCachedResources()) {
                  let i12 = await this.__internal_getCachedResources?.();
                  e10 = new iM(i12?.environment), ie.clearInstance(), t10 = ie.getOrCreateInstance(i12?.client), ++n10;
                } else throw i11;
              }
              this.updateClient(t10), this.updateEnvironment(e10), rQ.mountComponentRenderer && (this.#Q = rQ.mountComponentRenderer(this, this.environment, this.#er)), this.#eo.emit(m, n10 > 0 ? "degraded" : "ready");
            };
            __internal_reloadInitialResources = async () => {
              let [e10, t10] = await Promise.all([
                iM.getInstance().fetch({
                  touch: false,
                  fetchMaxTries: 1
                }),
                ie.getOrCreateInstance().fetch({
                  fetchMaxTries: 1
                })
              ]);
              this.updateClient(t10), this.updateEnvironment(e10), this.#ed();
            };
            #ev = (e10) => {
              if (e10.lastActiveSessionId) {
                let t10 = e10.signedInSessions.find((t11) => t11.id === e10.lastActiveSessionId);
                if (t10) return t10;
              }
              return e10.signedInSessions[0] || null;
            };
            #eT = () => {
              a() && (this.#es?.onPageFocus(() => {
                this.session && !(!(this.environment && !this.environment.authConfig.singleSessionMode) && this.#ea > Date.now()) && (this.#ea = Date.now() + 5e3, this.#er.touchSession && this.#em(this.session, "focus"));
              }), this.#Y?.addEventListener("message", (e10) => {
                e10.data?.type === "signout" && this.handleUnauthenticated({
                  broadcast: false
                });
              }), ix.on(iT, () => {
                this.#Y?.postMessage({
                  type: "signout"
                });
              }), ix.on(iO, () => {
                tv.setItem(ty, this.environment?.__internal_toSnapshot(), 864e5);
              }));
            };
            #em = async (e10, t10 = "focus") => {
              if (!e10) return Promise.resolve();
              await e10.touch({
                intent: t10
              }).catch((e11) => {
                R(e11) && this.handleUnauthenticated();
              });
            };
            #ed = () => {
              if (this.client) for (let e10 of this.#ei) e10({
                client: this.client,
                session: this.session,
                user: this.user,
                organization: this.organization
              });
            };
            #e_ = () => {
              for (let e10 of this.#en) e10();
            };
            #ef = () => {
              this.session = void 0, this.organization = void 0, this.user = void 0, this.#ed();
            };
            #ez = () => (this.session?.user.organizationMemberships || []).map((e10) => e10.organization).find((e10) => e10.id === this.session?.lastActiveOrganizationId) || null;
            #ec = (e10) => {
              this.session = e10 || null, this.organization = this.#ez(), this.user = this.session ? this.session.user : null;
            };
            #eg = (e10) => this.client?.signedInSessions.find((t10) => t10.id === e10) || null;
            #ex = () => {
              this.addListener(({ session: e10 }) => {
                e10?.actor && this.#Q?.ensureMounted().then((e11) => e11.mountImpersonationFab());
              });
            };
            #eR = () => {
              this.#er.__internal_keyless_claimKeylessApplicationUrl && this.#Q?.ensureMounted().then((e10) => {
                e10.updateProps({
                  options: {
                    __internal_keyless_claimKeylessApplicationUrl: this.#er.__internal_keyless_claimKeylessApplicationUrl,
                    __internal_keyless_copyInstanceKeysUrl: this.#er.__internal_keyless_copyInstanceKeysUrl,
                    __internal_keyless_dismissPrompt: this.#er.__internal_keyless_dismissPrompt
                  }
                });
              });
            };
            #eb = (e10, t10, i10) => {
              if (!e10 || !this.loaded || !this.environment || !this.environment.displayConfig) return "";
              let n10 = this.#er[e10] || this.environment.displayConfig[e10];
              this.#ep() && (n10 = this.#er.signInUrl);
              let r2 = new nK(this.#er, t10).toSearchParams(), s2 = new URLSearchParams(i10 || {}), a2 = e0({
                base: n10,
                hashPath: this.#ep() && "signUpUrl" === e10 ? "/create" : "",
                hashSearchParams: [
                  s2,
                  r2
                ]
              }, {
                stringify: true
              });
              return this.buildUrlWithAuth(a2);
            };
            assertComponentsReady(e10) {
              if (!rQ.mountComponentRenderer) throw Error("ClerkJS was loaded without UI components.");
              if (!e10) throw Error("ClerkJS components are not ready yet.");
            }
            #eO = async () => {
              let e10 = new URLSearchParams(window.location.search).get("redirect_url"), t10 = "production" === this.instanceType, i10 = null !== e10 && function(e11, t11) {
                let i11 = new URL(t11, eG), n11 = i11.pathname, r3 = e6.includes(n11) || e5.includes(n11);
                return e11 === i11.host && r3;
              }(this.frontendApi, e10);
              if (t10 || !i10) return false;
              let n10 = this.session, r2 = this.#er.signInUrl || this.environment?.displayConfig.signInUrl, s2 = r2 && window.location.href.startsWith(r2), a2 = this.#er.signUpUrl || this.environment?.displayConfig.signUpUrl, o2 = a2 && window.location.href.startsWith(a2);
              return (!function(e11) {
                let t11 = new URL(e11, eG);
                return e6.includes(t11.pathname);
              }(e10) || !!n10 || !s2 && !o2) && (await this.navigate(this.buildUrlWithAuth(e10)), true);
            };
            #el = (e10) => {
              let t10 = e10 ? {
                ...e10
              } : {};
              return t10.appearance && (t10.appearance = function(e11) {
                let t11;
                if (!e11 || "object" != typeof e11) return e11;
                let i10 = void 0 !== e11.theme ? e11.theme : e11.baseTheme, n10 = void 0 !== e11.theme;
                if (!i10) return e11;
                if (Array.isArray(i10)) {
                  i10.forEach((e12) => {
                    !t11 && "object" == typeof e12 && e12.cssLayerName && (t11 = e12.cssLayerName);
                  });
                  let r2 = i10.map((e12) => {
                    if ("string" == typeof e12) return e12;
                    let { cssLayerName: t12, ...i11 } = e12;
                    return i11;
                  }), s2 = e11.cssLayerName || t11, a2 = {
                    ...e11,
                    [n10 ? "theme" : "baseTheme"]: r2
                  };
                  return s2 && (a2.cssLayerName = s2), a2;
                }
                {
                  let t12;
                  "object" == typeof i10 && i10.cssLayerName && (t12 = i10.cssLayerName);
                  let r2 = "string" == typeof i10 ? i10 : (() => {
                    let { cssLayerName: e12, ...t13 } = i10;
                    return t13;
                  })(), s2 = e11.cssLayerName || t12, a2 = {
                    ...e11,
                    [n10 ? "theme" : "baseTheme"]: r2
                  };
                  return s2 && (a2.cssLayerName = s2), a2;
                }
              }(t10.appearance)), {
                ...rY,
                ...t10,
                allowedRedirectOrigins: function(e11, t11, i10) {
                  if (Array.isArray(e11) && e11.length) return e11;
                  let n10 = [];
                  return "undefined" != typeof window && window.location && n10.push(window.location.origin), n10.push(`https://${eX(t11)}`), n10.push(`https://*.${eX(t11)}`), "development" === i10 && n10.push(`https://${t11}`), n10;
                }(e10?.allowedRedirectOrigins, this.frontendApi, this.instanceType)
              };
            };
            #eE = () => {
              try {
                eD(eM), eD(Y), eD(ez), eD("__clerk_handshake"), eD("__clerk_handshake_nonce"), eD("__clerk_help");
              } catch {
              }
            };
            get #ey() {
              let e10 = eI;
              return this.#er.allowedRedirectProtocols && (e10 = e10.concat(this.#er.allowedRedirectProtocols)), e10;
            }
          }
          (e2 = i2.hmd(e2)).hot && e2.hot.accept();
        },
        2788: function(e2, t2, i2) {
          "use strict";
          var n = this && this.__awaiter || function(e3, t3, i3, n2) {
            return new (i3 || (i3 = Promise))(function(r2, s2) {
              function a2(e4) {
                try {
                  l2(n2.next(e4));
                } catch (e5) {
                  s2(e5);
                }
              }
              function o2(e4) {
                try {
                  l2(n2.throw(e4));
                } catch (e5) {
                  s2(e5);
                }
              }
              function l2(e4) {
                e4.done ? r2(e4.value) : new i3(function(t4) {
                  t4(e4.value);
                }).then(a2, o2);
              }
              l2((n2 = n2.apply(e3, t3 || [])).next());
            });
          }, r = this && this.__generator || function(e3, t3) {
            var i3, n2, r2, s2, a2 = {
              label: 0,
              sent: function() {
                if (1 & r2[0]) throw r2[1];
                return r2[1];
              },
              trys: [],
              ops: []
            };
            return s2 = {
              next: o2(0),
              throw: o2(1),
              return: o2(2)
            }, "function" == typeof Symbol && (s2[Symbol.iterator] = function() {
              return this;
            }), s2;
            function o2(s3) {
              return function(o3) {
                var l2 = [
                  s3,
                  o3
                ];
                if (i3) throw TypeError("Generator is already executing.");
                for (; a2; ) try {
                  if (i3 = 1, n2 && (r2 = 2 & l2[0] ? n2.return : l2[0] ? n2.throw || ((r2 = n2.return) && r2.call(n2), 0) : n2.next) && !(r2 = r2.call(n2, l2[1])).done) return r2;
                  switch (n2 = 0, r2 && (l2 = [
                    2 & l2[0],
                    r2.value
                  ]), l2[0]) {
                    case 0:
                    case 1:
                      r2 = l2;
                      break;
                    case 4:
                      return a2.label++, {
                        value: l2[1],
                        done: false
                      };
                    case 5:
                      a2.label++, n2 = l2[1], l2 = [
                        0
                      ];
                      continue;
                    case 7:
                      l2 = a2.ops.pop(), a2.trys.pop();
                      continue;
                    default:
                      if (!(r2 = (r2 = a2.trys).length > 0 && r2[r2.length - 1]) && (6 === l2[0] || 2 === l2[0])) {
                        a2 = 0;
                        continue;
                      }
                      if (3 === l2[0] && (!r2 || l2[1] > r2[0] && l2[1] < r2[3])) {
                        a2.label = l2[1];
                        break;
                      }
                      if (6 === l2[0] && a2.label < r2[1]) {
                        a2.label = r2[1], r2 = l2;
                        break;
                      }
                      if (r2 && a2.label < r2[2]) {
                        a2.label = r2[2], a2.ops.push(l2);
                        break;
                      }
                      r2[2] && a2.ops.pop(), a2.trys.pop();
                      continue;
                  }
                  l2 = t3.call(e3, a2);
                } catch (e4) {
                  l2 = [
                    6,
                    e4
                  ], n2 = 0;
                } finally {
                  i3 = r2 = 0;
                }
                if (5 & l2[0]) throw l2[1];
                return {
                  value: l2[0] ? l2[1] : void 0,
                  done: true
                };
              };
            }
          }, s = this;
          Object.defineProperty(t2, "__esModule", {
            value: true
          });
          var a = i2(6119), o = "browser-tabs-lock-key", l = {
            key: function(e3) {
              return n(s, void 0, void 0, function() {
                return r(this, function(e4) {
                  throw Error("Unsupported");
                });
              });
            },
            getItem: function(e3) {
              return n(s, void 0, void 0, function() {
                return r(this, function(e4) {
                  throw Error("Unsupported");
                });
              });
            },
            clear: function() {
              return n(s, void 0, void 0, function() {
                return r(this, function(e3) {
                  return [
                    2,
                    window.localStorage.clear()
                  ];
                });
              });
            },
            removeItem: function(e3) {
              return n(s, void 0, void 0, function() {
                return r(this, function(e4) {
                  throw Error("Unsupported");
                });
              });
            },
            setItem: function(e3, t3) {
              return n(s, void 0, void 0, function() {
                return r(this, function(e4) {
                  throw Error("Unsupported");
                });
              });
            },
            keySync: function(e3) {
              return window.localStorage.key(e3);
            },
            getItemSync: function(e3) {
              return window.localStorage.getItem(e3);
            },
            clearSync: function() {
              return window.localStorage.clear();
            },
            removeItemSync: function(e3) {
              return window.localStorage.removeItem(e3);
            },
            setItemSync: function(e3, t3) {
              return window.localStorage.setItem(e3, t3);
            }
          };
          function c(e3) {
            return new Promise(function(t3) {
              return setTimeout(t3, e3);
            });
          }
          function d(e3) {
            for (var t3 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz", i3 = "", n2 = 0; n2 < e3; n2++) {
              var r2 = Math.floor(Math.random() * t3.length);
              i3 += t3[r2];
            }
            return i3;
          }
          t2.default = function() {
            function e3(t3) {
              this.acquiredIatSet = /* @__PURE__ */ new Set(), this.storageHandler = void 0, this.id = Date.now().toString() + d(15), this.acquireLock = this.acquireLock.bind(this), this.releaseLock = this.releaseLock.bind(this), this.releaseLock__private__ = this.releaseLock__private__.bind(this), this.waitForSomethingToChange = this.waitForSomethingToChange.bind(this), this.refreshLockWhileAcquired = this.refreshLockWhileAcquired.bind(this), this.storageHandler = t3, void 0 === e3.waiters && (e3.waiters = []);
            }
            return e3.prototype.acquireLock = function(t3, i3) {
              return void 0 === i3 && (i3 = 5e3), n(this, void 0, void 0, function() {
                var n2, s2, a2, h, u, p, f;
                return r(this, function(r2) {
                  switch (r2.label) {
                    case 0:
                      n2 = Date.now() + d(4), s2 = Date.now() + i3, a2 = o + "-" + t3, h = void 0 === this.storageHandler ? l : this.storageHandler, r2.label = 1;
                    case 1:
                      if (!(Date.now() < s2)) return [
                        3,
                        8
                      ];
                      return [
                        4,
                        c(30)
                      ];
                    case 2:
                      if (r2.sent(), null !== h.getItemSync(a2)) return [
                        3,
                        5
                      ];
                      return u = this.id + "-" + t3 + "-" + n2, [
                        4,
                        c(Math.floor(25 * Math.random()))
                      ];
                    case 3:
                      return r2.sent(), h.setItemSync(a2, JSON.stringify({
                        id: this.id,
                        iat: n2,
                        timeoutKey: u,
                        timeAcquired: Date.now(),
                        timeRefreshed: Date.now()
                      })), [
                        4,
                        c(30)
                      ];
                    case 4:
                      if (r2.sent(), null !== (p = h.getItemSync(a2)) && (f = JSON.parse(p)).id === this.id && f.iat === n2) return this.acquiredIatSet.add(n2), this.refreshLockWhileAcquired(a2, n2), [
                        2,
                        true
                      ];
                      return [
                        3,
                        7
                      ];
                    case 5:
                      return e3.lockCorrector(void 0 === this.storageHandler ? l : this.storageHandler), [
                        4,
                        this.waitForSomethingToChange(s2)
                      ];
                    case 6:
                      r2.sent(), r2.label = 7;
                    case 7:
                      return n2 = Date.now() + d(4), [
                        3,
                        1
                      ];
                    case 8:
                      return [
                        2,
                        false
                      ];
                  }
                });
              });
            }, e3.prototype.refreshLockWhileAcquired = function(e4, t3) {
              return n(this, void 0, void 0, function() {
                var i3 = this;
                return r(this, function(s2) {
                  return setTimeout(function() {
                    return n(i3, void 0, void 0, function() {
                      var i4, n2, s3;
                      return r(this, function(r2) {
                        switch (r2.label) {
                          case 0:
                            return [
                              4,
                              a.default().lock(t3)
                            ];
                          case 1:
                            if (r2.sent(), !this.acquiredIatSet.has(t3) || null === (n2 = (i4 = void 0 === this.storageHandler ? l : this.storageHandler).getItemSync(e4))) return a.default().unlock(t3), [
                              2
                            ];
                            return (s3 = JSON.parse(n2)).timeRefreshed = Date.now(), i4.setItemSync(e4, JSON.stringify(s3)), a.default().unlock(t3), this.refreshLockWhileAcquired(e4, t3), [
                              2
                            ];
                        }
                      });
                    });
                  }, 1e3), [
                    2
                  ];
                });
              });
            }, e3.prototype.waitForSomethingToChange = function(t3) {
              return n(this, void 0, void 0, function() {
                return r(this, function(i3) {
                  switch (i3.label) {
                    case 0:
                      return [
                        4,
                        new Promise(function(i4) {
                          var n2 = false, r2 = Date.now(), s2 = false;
                          function a2() {
                            if (s2 || (window.removeEventListener("storage", a2), e3.removeFromWaiting(a2), clearTimeout(o2), s2 = true), !n2) {
                              n2 = true;
                              var t4 = 50 - (Date.now() - r2);
                              t4 > 0 ? setTimeout(i4, t4) : i4(null);
                            }
                          }
                          window.addEventListener("storage", a2), e3.addToWaiting(a2);
                          var o2 = setTimeout(a2, Math.max(0, t3 - Date.now()));
                        })
                      ];
                    case 1:
                      return i3.sent(), [
                        2
                      ];
                  }
                });
              });
            }, e3.addToWaiting = function(t3) {
              this.removeFromWaiting(t3), void 0 !== e3.waiters && e3.waiters.push(t3);
            }, e3.removeFromWaiting = function(t3) {
              void 0 !== e3.waiters && (e3.waiters = e3.waiters.filter(function(e4) {
                return e4 !== t3;
              }));
            }, e3.notifyWaiters = function() {
              void 0 !== e3.waiters && e3.waiters.slice().forEach(function(e4) {
                return e4();
              });
            }, e3.prototype.releaseLock = function(e4) {
              return n(this, void 0, void 0, function() {
                return r(this, function(t3) {
                  switch (t3.label) {
                    case 0:
                      return [
                        4,
                        this.releaseLock__private__(e4)
                      ];
                    case 1:
                      return [
                        2,
                        t3.sent()
                      ];
                  }
                });
              });
            }, e3.prototype.releaseLock__private__ = function(t3) {
              return n(this, void 0, void 0, function() {
                var i3, n2, s2, c2;
                return r(this, function(r2) {
                  switch (r2.label) {
                    case 0:
                      if (i3 = void 0 === this.storageHandler ? l : this.storageHandler, n2 = o + "-" + t3, null === (s2 = i3.getItemSync(n2))) return [
                        2
                      ];
                      if ((c2 = JSON.parse(s2)).id !== this.id) return [
                        3,
                        2
                      ];
                      return [
                        4,
                        a.default().lock(c2.iat)
                      ];
                    case 1:
                      r2.sent(), this.acquiredIatSet.delete(c2.iat), i3.removeItemSync(n2), a.default().unlock(c2.iat), e3.notifyWaiters(), r2.label = 2;
                    case 2:
                      return [
                        2
                      ];
                  }
                });
              });
            }, e3.lockCorrector = function(t3) {
              for (var i3 = Date.now() - 5e3, n2 = [], r2 = 0; ; ) {
                var s2 = t3.keySync(r2);
                if (null === s2) break;
                n2.push(s2), r2++;
              }
              for (var a2 = false, l2 = 0; l2 < n2.length; l2++) {
                var c2 = n2[l2];
                if (c2.includes(o)) {
                  var d2 = t3.getItemSync(c2);
                  if (null !== d2) {
                    var h = JSON.parse(d2);
                    (void 0 === h.timeRefreshed && h.timeAcquired < i3 || void 0 !== h.timeRefreshed && h.timeRefreshed < i3) && (t3.removeItemSync(c2), a2 = true);
                  }
                }
              }
              a2 && e3.notifyWaiters();
            }, e3.waiters = void 0, e3;
          }();
        },
        6119: function(e2, t2) {
          "use strict";
          Object.defineProperty(t2, "__esModule", {
            value: true
          });
          var i2 = function() {
            function e3() {
              var e4 = this;
              this.locked = /* @__PURE__ */ new Map(), this.addToLocked = function(t3, i3) {
                var n = e4.locked.get(t3);
                void 0 === n ? void 0 === i3 ? e4.locked.set(t3, []) : e4.locked.set(t3, [
                  i3
                ]) : void 0 !== i3 && (n.unshift(i3), e4.locked.set(t3, n));
              }, this.isLocked = function(t3) {
                return e4.locked.has(t3);
              }, this.lock = function(t3) {
                return new Promise(function(i3, n) {
                  e4.isLocked(t3) ? e4.addToLocked(t3, i3) : (e4.addToLocked(t3), i3());
                });
              }, this.unlock = function(t3) {
                var i3 = e4.locked.get(t3);
                if (void 0 === i3 || 0 === i3.length) return void e4.locked.delete(t3);
                var n = i3.pop();
                e4.locked.set(t3, i3), void 0 !== n && setTimeout(n, 0);
              };
            }
            return e3.getInstance = function() {
              return void 0 === e3.instance && (e3.instance = new e3()), e3.instance;
            }, e3;
          }();
          t2.default = function() {
            return i2.getInstance();
          };
        },
        4763: function(e2) {
          e2.exports = function(e3, t2) {
            if ("string" != typeof e3) throw TypeError("Expected a string");
            for (var i2, n = String(e3), r = "", s = !!t2 && !!t2.extended, a = !!t2 && !!t2.globstar, o = false, l = t2 && "string" == typeof t2.flags ? t2.flags : "", c = 0, d = n.length; c < d; c++) switch (i2 = n[c]) {
              case "/":
              case "$":
              case "^":
              case "+":
              case ".":
              case "(":
              case ")":
              case "=":
              case "!":
              case "|":
                r += "\\" + i2;
                break;
              case "?":
                if (s) {
                  r += ".";
                  break;
                }
              case "[":
              case "]":
                if (s) {
                  r += i2;
                  break;
                }
              case "{":
                if (s) {
                  o = true, r += "(";
                  break;
                }
              case "}":
                if (s) {
                  o = false, r += ")";
                  break;
                }
              case ",":
                if (o) {
                  r += "|";
                  break;
                }
                r += "\\" + i2;
                break;
              case "*":
                for (var h = n[c - 1], u = 1; "*" === n[c + 1]; ) u++, c++;
                var p = n[c + 1];
                a ? u > 1 && ("/" === h || void 0 === h) && ("/" === p || void 0 === p) ? (r += "((?:[^/]*(?:/|$))*)", c++) : r += "([^/]*)" : r += ".*";
                break;
              default:
                r += i2;
            }
            return l && ~l.indexOf("g") || (r = "^" + r + "$"), new RegExp(r, l);
          };
        },
        4096: function(e2) {
          var t2 = function(e3) {
            "use strict";
            var t3, i2 = Object.prototype, n = i2.hasOwnProperty, r = Object.defineProperty || function(e4, t4, i3) {
              e4[t4] = i3.value;
            }, s = "function" == typeof Symbol ? Symbol : {}, a = s.iterator || "@@iterator", o = s.asyncIterator || "@@asyncIterator", l = s.toStringTag || "@@toStringTag";
            function c(e4, t4, i3) {
              return Object.defineProperty(e4, t4, {
                value: i3,
                enumerable: true,
                configurable: true,
                writable: true
              }), e4[t4];
            }
            try {
              c({}, "");
            } catch (e4) {
              c = function(e5, t4, i3) {
                return e5[t4] = i3;
              };
            }
            function d(e4, i3, n2, s2) {
              var a2, o2, l2, c2, d2 = Object.create((i3 && i3.prototype instanceof g ? i3 : g).prototype);
              return r(d2, "_invoke", {
                value: (a2 = e4, o2 = n2, l2 = new I(s2 || []), c2 = u, function(e5, i4) {
                  if (c2 === p) throw Error("Generator is already running");
                  if (c2 === f) {
                    if ("throw" === e5) throw i4;
                    return {
                      value: t3,
                      done: true
                    };
                  }
                  for (l2.method = e5, l2.arg = i4; ; ) {
                    var n3 = l2.delegate;
                    if (n3) {
                      var r2 = function e6(i5, n4) {
                        var r3 = n4.method, s4 = i5.iterator[r3];
                        if (t3 === s4) return (n4.delegate = null, "throw" === r3 && i5.iterator.return && (n4.method = "return", n4.arg = t3, e6(i5, n4), "throw" === n4.method)) ? m : ("return" !== r3 && (n4.method = "throw", n4.arg = TypeError("The iterator does not provide a '" + r3 + "' method")), m);
                        var a3 = h(s4, i5.iterator, n4.arg);
                        if ("throw" === a3.type) return n4.method = "throw", n4.arg = a3.arg, n4.delegate = null, m;
                        var o3 = a3.arg;
                        return o3 ? o3.done ? (n4[i5.resultName] = o3.value, n4.next = i5.nextLoc, "return" !== n4.method && (n4.method = "next", n4.arg = t3), n4.delegate = null, m) : o3 : (n4.method = "throw", n4.arg = TypeError("iterator result is not an object"), n4.delegate = null, m);
                      }(n3, l2);
                      if (r2) {
                        if (r2 === m) continue;
                        return r2;
                      }
                    }
                    if ("next" === l2.method) l2.sent = l2._sent = l2.arg;
                    else if ("throw" === l2.method) {
                      if (c2 === u) throw c2 = f, l2.arg;
                      l2.dispatchException(l2.arg);
                    } else "return" === l2.method && l2.abrupt("return", l2.arg);
                    c2 = p;
                    var s3 = h(a2, o2, l2);
                    if ("normal" === s3.type) {
                      if (c2 = l2.done ? f : "suspendedYield", s3.arg === m) continue;
                      return {
                        value: s3.arg,
                        done: l2.done
                      };
                    }
                    "throw" === s3.type && (c2 = f, l2.method = "throw", l2.arg = s3.arg);
                  }
                })
              }), d2;
            }
            function h(e4, t4, i3) {
              try {
                return {
                  type: "normal",
                  arg: e4.call(t4, i3)
                };
              } catch (e5) {
                return {
                  type: "throw",
                  arg: e5
                };
              }
            }
            e3.wrap = d;
            var u = "suspendedStart", p = "executing", f = "completed", m = {};
            function g() {
            }
            function _() {
            }
            function y() {
            }
            var b = {};
            c(b, a, function() {
              return this;
            });
            var w = Object.getPrototypeOf, v = w && w(w(P([])));
            v && v !== i2 && n.call(v, a) && (b = v);
            var k = y.prototype = g.prototype = Object.create(b);
            function S(e4) {
              [
                "next",
                "throw",
                "return"
              ].forEach(function(t4) {
                c(e4, t4, function(e5) {
                  return this._invoke(t4, e5);
                });
              });
            }
            function C(e4, t4) {
              var i3;
              r(this, "_invoke", {
                value: function(r2, s2) {
                  function a2() {
                    return new t4(function(i4, a3) {
                      !function i5(r3, s3, a4, o2) {
                        var l2 = h(e4[r3], e4, s3);
                        if ("throw" === l2.type) o2(l2.arg);
                        else {
                          var c2 = l2.arg, d2 = c2.value;
                          return d2 && "object" == typeof d2 && n.call(d2, "__await") ? t4.resolve(d2.__await).then(function(e5) {
                            i5("next", e5, a4, o2);
                          }, function(e5) {
                            i5("throw", e5, a4, o2);
                          }) : t4.resolve(d2).then(function(e5) {
                            c2.value = e5, a4(c2);
                          }, function(e5) {
                            return i5("throw", e5, a4, o2);
                          });
                        }
                      }(r2, s2, i4, a3);
                    });
                  }
                  return i3 = i3 ? i3.then(a2, a2) : a2();
                }
              });
            }
            function A(e4) {
              var t4 = {
                tryLoc: e4[0]
              };
              1 in e4 && (t4.catchLoc = e4[1]), 2 in e4 && (t4.finallyLoc = e4[2], t4.afterLoc = e4[3]), this.tryEntries.push(t4);
            }
            function U(e4) {
              var t4 = e4.completion || {};
              t4.type = "normal", delete t4.arg, e4.completion = t4;
            }
            function I(e4) {
              this.tryEntries = [
                {
                  tryLoc: "root"
                }
              ], e4.forEach(A, this), this.reset(true);
            }
            function P(e4) {
              if (null != e4) {
                var i3 = e4[a];
                if (i3) return i3.call(e4);
                if ("function" == typeof e4.next) return e4;
                if (!isNaN(e4.length)) {
                  var r2 = -1, s2 = function i4() {
                    for (; ++r2 < e4.length; ) if (n.call(e4, r2)) return i4.value = e4[r2], i4.done = false, i4;
                    return i4.value = t3, i4.done = true, i4;
                  };
                  return s2.next = s2;
                }
              }
              throw TypeError(typeof e4 + " is not iterable");
            }
            return _.prototype = y, r(k, "constructor", {
              value: y,
              configurable: true
            }), r(y, "constructor", {
              value: _,
              configurable: true
            }), _.displayName = c(y, l, "GeneratorFunction"), e3.isGeneratorFunction = function(e4) {
              var t4 = "function" == typeof e4 && e4.constructor;
              return !!t4 && (t4 === _ || "GeneratorFunction" === (t4.displayName || t4.name));
            }, e3.mark = function(e4) {
              return Object.setPrototypeOf ? Object.setPrototypeOf(e4, y) : (e4.__proto__ = y, c(e4, l, "GeneratorFunction")), e4.prototype = Object.create(k), e4;
            }, e3.awrap = function(e4) {
              return {
                __await: e4
              };
            }, S(C.prototype), c(C.prototype, o, function() {
              return this;
            }), e3.AsyncIterator = C, e3.async = function(t4, i3, n2, r2, s2) {
              void 0 === s2 && (s2 = Promise);
              var a2 = new C(d(t4, i3, n2, r2), s2);
              return e3.isGeneratorFunction(i3) ? a2 : a2.next().then(function(e4) {
                return e4.done ? e4.value : a2.next();
              });
            }, S(k), c(k, l, "Generator"), c(k, a, function() {
              return this;
            }), c(k, "toString", function() {
              return "[object Generator]";
            }), e3.keys = function(e4) {
              var t4 = Object(e4), i3 = [];
              for (var n2 in t4) i3.push(n2);
              return i3.reverse(), function e5() {
                for (; i3.length; ) {
                  var n3 = i3.pop();
                  if (n3 in t4) return e5.value = n3, e5.done = false, e5;
                }
                return e5.done = true, e5;
              };
            }, e3.values = P, I.prototype = {
              constructor: I,
              reset: function(e4) {
                if (this.prev = 0, this.next = 0, this.sent = this._sent = t3, this.done = false, this.delegate = null, this.method = "next", this.arg = t3, this.tryEntries.forEach(U), !e4) for (var i3 in this) "t" === i3.charAt(0) && n.call(this, i3) && !isNaN(+i3.slice(1)) && (this[i3] = t3);
              },
              stop: function() {
                this.done = true;
                var e4 = this.tryEntries[0].completion;
                if ("throw" === e4.type) throw e4.arg;
                return this.rval;
              },
              dispatchException: function(e4) {
                if (this.done) throw e4;
                var i3 = this;
                function r2(n2, r3) {
                  return o2.type = "throw", o2.arg = e4, i3.next = n2, r3 && (i3.method = "next", i3.arg = t3), !!r3;
                }
                for (var s2 = this.tryEntries.length - 1; s2 >= 0; --s2) {
                  var a2 = this.tryEntries[s2], o2 = a2.completion;
                  if ("root" === a2.tryLoc) return r2("end");
                  if (a2.tryLoc <= this.prev) {
                    var l2 = n.call(a2, "catchLoc"), c2 = n.call(a2, "finallyLoc");
                    if (l2 && c2) {
                      if (this.prev < a2.catchLoc) return r2(a2.catchLoc, true);
                      else if (this.prev < a2.finallyLoc) return r2(a2.finallyLoc);
                    } else if (l2) {
                      if (this.prev < a2.catchLoc) return r2(a2.catchLoc, true);
                    } else if (c2) {
                      if (this.prev < a2.finallyLoc) return r2(a2.finallyLoc);
                    } else throw Error("try statement without catch or finally");
                  }
                }
              },
              abrupt: function(e4, t4) {
                for (var i3 = this.tryEntries.length - 1; i3 >= 0; --i3) {
                  var r2 = this.tryEntries[i3];
                  if (r2.tryLoc <= this.prev && n.call(r2, "finallyLoc") && this.prev < r2.finallyLoc) {
                    var s2 = r2;
                    break;
                  }
                }
                s2 && ("break" === e4 || "continue" === e4) && s2.tryLoc <= t4 && t4 <= s2.finallyLoc && (s2 = null);
                var a2 = s2 ? s2.completion : {};
                return (a2.type = e4, a2.arg = t4, s2) ? (this.method = "next", this.next = s2.finallyLoc, m) : this.complete(a2);
              },
              complete: function(e4, t4) {
                if ("throw" === e4.type) throw e4.arg;
                return "break" === e4.type || "continue" === e4.type ? this.next = e4.arg : "return" === e4.type ? (this.rval = this.arg = e4.arg, this.method = "return", this.next = "end") : "normal" === e4.type && t4 && (this.next = t4), m;
              },
              finish: function(e4) {
                for (var t4 = this.tryEntries.length - 1; t4 >= 0; --t4) {
                  var i3 = this.tryEntries[t4];
                  if (i3.finallyLoc === e4) return this.complete(i3.completion, i3.afterLoc), U(i3), m;
                }
              },
              catch: function(e4) {
                for (var t4 = this.tryEntries.length - 1; t4 >= 0; --t4) {
                  var i3 = this.tryEntries[t4];
                  if (i3.tryLoc === e4) {
                    var n2 = i3.completion;
                    if ("throw" === n2.type) {
                      var r2 = n2.arg;
                      U(i3);
                    }
                    return r2;
                  }
                }
                throw Error("illegal catch attempt");
              },
              delegateYield: function(e4, i3, n2) {
                return this.delegate = {
                  iterator: P(e4),
                  resultName: i3,
                  nextLoc: n2
                }, "next" === this.method && (this.arg = t3), m;
              }
            }, e3;
          }(e2.exports);
          try {
            regeneratorRuntime = t2;
          } catch (e3) {
            "object" == typeof globalThis ? globalThis.regeneratorRuntime = t2 : Function("r", "regeneratorRuntime = r")(t2);
          }
        },
        5851: function(e2, t2, i2) {
          "use strict";
          i2.d(t2, {
            Z: () => n
          });
          let n = (...e3) => {
          };
        },
        2823: function(e2, t2, i2) {
          "use strict";
          function n(e3, t3, i3) {
            return "function" == typeof e3 ? e3(t3) : void 0 !== e3 ? e3 : void 0 !== i3 ? i3 : void 0;
          }
          i2.d(t2, {
            ZT: () => r.Z,
            Lu: () => s,
            YZ: () => n,
            AW: () => a
          });
          var r = i2(5851);
          function s(e3) {
            return Promise.all(Array.from(e3).map((e4) => e4.then((e5) => ({
              status: "fulfilled",
              value: e5
            }), (e5) => ({
              status: "rejected",
              reason: e5
            }))));
          }
          function a(e3, t3, i3) {
            let n2, r2 = new Promise((e4, r3) => {
              n2 = setTimeout(() => {
                let e5 = Error(`Timed out after ${t3}ms`);
                i3?.abort(), r3(e5);
              }, t3), n2.unref?.();
            });
            return Promise.race([
              Promise.resolve(e3),
              r2
            ]).finally(() => {
              clearTimeout(n2);
            });
          }
        }
      }, t = {};
      function i(n) {
        var r = t[n];
        if (void 0 !== r) return r.exports;
        var s = t[n] = {
          id: n,
          loaded: false,
          exports: {}
        };
        return e[n].call(s.exports, s, s.exports, i), s.loaded = true, s.exports;
      }
      return i.m = e, i.n = (e2) => {
        var t2 = e2 && e2.__esModule ? () => e2.default : () => e2;
        return i.d(t2, {
          a: t2
        }), t2;
      }, (() => {
        var e2, t2 = Object.getPrototypeOf ? (e3) => Object.getPrototypeOf(e3) : (e3) => e3.__proto__;
        i.t = function(n, r) {
          if (1 & r && (n = this(n)), 8 & r || "object" == typeof n && n && (4 & r && n.__esModule || 16 & r && "function" == typeof n.then)) return n;
          var s = /* @__PURE__ */ Object.create(null);
          i.r(s);
          var a = {};
          e2 = e2 || [
            null,
            t2({}),
            t2([]),
            t2(t2)
          ];
          for (var o = 2 & r && n; "object" == typeof o && !~e2.indexOf(o); o = t2(o)) Object.getOwnPropertyNames(o).forEach((e3) => {
            a[e3] = () => n[e3];
          });
          return a.default = () => n, i.d(s, a), s;
        };
      })(), i.d = (e2, t2) => {
        for (var n in t2) i.o(t2, n) && !i.o(e2, n) && Object.defineProperty(e2, n, {
          enumerable: true,
          get: t2[n]
        });
      }, i.f = {}, i.e = (e2) => Promise.all(Object.keys(i.f).reduce((t2, n) => (i.f[n](e2, t2), t2), [])), i.hmd = (e2) => ((e2 = Object.create(e2)).children || (e2.children = []), Object.defineProperty(e2, "exports", {
        enumerable: true,
        set: () => {
          throw Error("ES Modules may not assign module.exports or exports.*, Use ESM export syntax, instead: " + e2.id);
        }
      }), e2), i.u = (e2) => "" + ("199" === e2 ? "cookieSuffix" : e2) + "_clerk.headless_" + i.h().slice(0, 6) + "_5.127.2.js", i.h = () => "b86dff784599f210", i.g = (() => {
        if ("object" == typeof globalThis) return globalThis;
        try {
          return exports || Function("return this")();
        } catch (e2) {
          if ("object" == typeof window) return window;
        }
      })(), i.o = (e2, t2) => Object.prototype.hasOwnProperty.call(e2, t2), (() => {
        var e2 = {}, t2 = "@clerk/clerk-js:";
        i.l = function(n, r, s, a) {
          if (e2[n]) return void e2[n].push(r);
          if (void 0 !== s) for (var o, l, c = document.getElementsByTagName("script"), d = 0; d < c.length; d++) {
            var h = c[d];
            if (h.getAttribute("src") == n || h.getAttribute("data-webpack") == t2 + s) {
              o = h;
              break;
            }
          }
          o || (l = true, (o = document.createElement("script")).charset = "utf-8", o.timeout = 120, i.nc && o.setAttribute("nonce", i.nc), o.setAttribute("data-webpack", t2 + s), o.src = n), e2[n] = [
            r
          ];
          var u = function(t3, i2) {
            o.onerror = o.onload = null, clearTimeout(p);
            var r2 = e2[n];
            if (delete e2[n], o.parentNode && o.parentNode.removeChild(o), r2 && r2.forEach(function(e3) {
              return e3(i2);
            }), t3) return t3(i2);
          }, p = setTimeout(u.bind(null, void 0, {
            type: "timeout",
            target: o
          }), 12e4);
          o.onerror = u.bind(null, o.onerror), o.onload = u.bind(null, o.onload), l && document.head.appendChild(o);
        };
      })(), i.r = (e2) => {
        "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e2, Symbol.toStringTag, {
          value: "Module"
        }), Object.defineProperty(e2, "__esModule", {
          value: true
        });
      }, i.p = "", (() => {
        var e2 = {
          994: 0
        };
        i.f.j = function(t3, n2) {
          var r = i.o(e2, t3) ? e2[t3] : void 0;
          if (0 !== r) if (r) n2.push(r[2]);
          else {
            var s = new Promise((i2, n3) => r = e2[t3] = [
              i2,
              n3
            ]);
            n2.push(r[2] = s);
            var a = i.p + i.u(t3), o = Error();
            i.l(a, function(n3) {
              if (i.o(e2, t3) && (0 !== (r = e2[t3]) && (e2[t3] = void 0), r)) {
                var s2 = n3 && ("load" === n3.type ? "missing" : n3.type), a2 = n3 && n3.target && n3.target.src;
                o.message = "Loading chunk " + t3 + " failed.\n(" + s2 + ": " + a2 + ")", o.name = "ChunkLoadError", o.type = s2, o.request = a2, r[1](o);
              }
            }, "chunk-" + t3, t3);
          }
        };
        var t2 = (t3, n2) => {
          var r, s, [a, o, l] = n2, c = 0;
          if (a.some((t4) => 0 !== e2[t4])) {
            for (r in o) i.o(o, r) && (i.m[r] = o[r]);
            l && l(i);
          }
          for (t3 && t3(n2); c < a.length; c++) s = a[c], i.o(e2, s) && e2[s] && e2[s][0](), e2[s] = 0;
        }, n = globalThis.webpackChunk_clerk_clerk_js = globalThis.webpackChunk_clerk_clerk_js || [];
        n.forEach(t2.bind(null, 0)), n.push = t2.bind(null, n.push.bind(n));
      })(), i(8933);
    })());
  }
});

// C:/Users/jmarcum/AppData/Local/deno/npm/registry.npmjs.org/@clerk/clerk-js/5.127.2/headless/index.js
var require_headless = __commonJS({
  "C:/Users/jmarcum/AppData/Local/deno/npm/registry.npmjs.org/@clerk/clerk-js/5.127.2/headless/index.js"(exports, module) {
    module.exports = require_clerk_headless();
  }
});

// src/backends/neon-clerk.ts
var neon_clerk_exports = {};
__export(neon_clerk_exports, {
  NeonClerkBackend: () => NeonClerkBackend
});
function clerkError(e) {
  const err = e;
  const first = err?.errors?.[0];
  return first?.longMessage ?? first?.message ?? err?.message ?? "Authentication failed.";
}
var import_headless, cfg, PUBLISHABLE_KEY, API_BASE, NeonClerkBackend;
var init_neon_clerk = __esm({
  "src/backends/neon-clerk.ts"() {
    import_headless = __toESM(require_headless());
    cfg = globalThis.__LP_CONFIG__ ?? {};
    PUBLISHABLE_KEY = cfg.clerkPublishableKey ?? "";
    API_BASE = (cfg.apiBaseUrl ?? "").replace(/\/$/, "");
    NeonClerkBackend = class {
      // deno-lint-ignore no-explicit-any
      clerk = null;
      listeners = [];
      loaded = false;
      async init() {
        if (!PUBLISHABLE_KEY) {
          console.warn("[backend] No Clerk publishable key configured \u2014 running signed out.");
          return;
        }
        try {
          this.clerk = new import_headless.Clerk(PUBLISHABLE_KEY);
          await this.clerk.load({});
          this.loaded = true;
          this.clerk.addListener(() => {
            for (const cb of this.listeners) cb();
          });
        } catch (e) {
          console.warn("[backend] Clerk unavailable \u2014 continuing with cached state.", e);
          this.loaded = false;
        }
      }
      currentUser() {
        const u = this.loaded ? this.clerk?.user : null;
        if (!u) return null;
        return {
          id: u.id,
          email: u.primaryEmailAddress?.emailAddress ?? null
        };
      }
      onAuthChange(cb) {
        this.listeners.push(cb);
      }
      async signIn(email, password) {
        if (!this.loaded) return {
          error: "Cannot sign in while offline."
        };
        try {
          const attempt = await this.clerk.client.signIn.create({
            identifier: email,
            password
          });
          if (attempt.status === "complete") {
            await this.clerk.setActive({
              session: attempt.createdSessionId
            });
            return {
              error: null
            };
          }
          return {
            error: "Additional verification is required to sign in."
          };
        } catch (e) {
          return {
            error: clerkError(e)
          };
        }
      }
      async signUp(email, password) {
        if (!this.loaded) return {
          error: "Cannot create an account while offline."
        };
        try {
          const attempt = await this.clerk.client.signUp.create({
            emailAddress: email,
            password
          });
          if (attempt.status === "complete") {
            await this.clerk.setActive({
              session: attempt.createdSessionId
            });
            return {
              error: null,
              needsVerification: false
            };
          }
          await attempt.prepareEmailAddressVerification({
            strategy: "email_code"
          });
          return {
            error: null,
            needsVerification: true
          };
        } catch (e) {
          return {
            error: clerkError(e)
          };
        }
      }
      async verifyEmailCode(code) {
        if (!this.loaded) return {
          error: "Cannot verify while offline."
        };
        try {
          const attempt = await this.clerk.client.signUp.attemptEmailAddressVerification({
            code
          });
          if (attempt.status === "complete") {
            await this.clerk.setActive({
              session: attempt.createdSessionId
            });
            return {
              error: null
            };
          }
          return {
            error: "That code was not accepted. Check it and try again."
          };
        } catch (e) {
          return {
            error: clerkError(e)
          };
        }
      }
      async signOut() {
        if (!this.loaded) return;
        try {
          await this.clerk.signOut();
        } catch {
        }
      }
      async getMyRole() {
        const data = await this.call("GET", "/me");
        return {
          role: data.role ?? "free",
          trialExpiresAt: data.trial_expires_at ?? null,
          packIds: Array.isArray(data.pack_ids) ? data.pack_ids : []
        };
      }
      async getPackKey(packId) {
        try {
          const data = await this.call("GET", `/pack-key?pack_id=${encodeURIComponent(packId)}`);
          return data.key && data.key.length > 0 ? data.key : null;
        } catch {
          return null;
        }
      }
      async redeemLicenseCode(code) {
        try {
          const data = await this.call("POST", "/redeem", {
            code
          });
          return {
            success: data.success ?? false,
            message: data.message ?? "Unknown response.",
            role: data.role ?? void 0,
            packId: data.pack_id ?? void 0
          };
        } catch (e) {
          return {
            success: false,
            message: e.message || "Network error."
          };
        }
      }
      // -------------------------------------------------------------------------
      // Internals
      // -------------------------------------------------------------------------
      /** Fresh short-lived session JWT. Null when signed out or offline. */
      async token() {
        if (!this.loaded || !this.clerk?.session) return null;
        try {
          return await this.clerk.session.getToken();
        } catch {
          return null;
        }
      }
      async call(method, path, body) {
        if (!API_BASE) throw new Error("No API URL configured.");
        const jwt = await this.token();
        if (!jwt) throw new Error("Not signed in.");
        const res = await fetch(API_BASE + path, {
          method,
          headers: {
            "Authorization": `Bearer ${jwt}`,
            ...body ? {
              "Content-Type": "application/json"
            } : {}
          },
          body: body ? JSON.stringify(body) : void 0
        });
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(text || `Request failed (${res.status}).`);
        }
        return await res.json();
      }
    };
  }
});

// src/solver.ts
var exp;
async function init() {
  const { instance } = await WebAssembly.instantiateStreaming(fetch("./solver.wasm"));
  exp = instance.exports;
}
var rect_area = (b, h) => exp.rect_area(b, h);
var rect_ix = (b, h) => exp.rect_ix(b, h);
var solve_beam_deflection = (p, l, e, i) => exp.solve_beam_deflection(p, l, e, i);

// src/backend.ts
var _backend = null;
async function getBackend() {
  if (_backend) return _backend;
  const { NeonClerkBackend: NeonClerkBackend2 } = await Promise.resolve().then(() => (init_neon_clerk(), neon_clerk_exports));
  _backend = new NeonClerkBackend2();
  return _backend;
}

// src/crypto.ts
function b64Decode(s) {
  const binary = atob(s);
  const buf = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
async function importPackKey(base64Key) {
  const raw = b64Decode(base64Key);
  return await crypto.subtle.importKey("raw", raw.buffer, {
    name: "AES-GCM",
    length: 256
  }, false, [
    "encrypt",
    "decrypt"
  ]);
}
async function decryptTemplate(iv, ciphertext, key) {
  try {
    const ivBytes = b64Decode(iv);
    const ctBytes = b64Decode(ciphertext);
    const decrypted = await crypto.subtle.decrypt({
      name: "AES-GCM",
      iv: ivBytes.buffer
    }, key, ctBytes.buffer);
    return new TextDecoder().decode(decrypted);
  } catch {
    return null;
  }
}

// src/auth.ts
var currentUser = null;
var currentRole = "free";
var ownedPackIds = /* @__PURE__ */ new Set();
var entitlementsStale = false;
var lastSyncedAt = null;
var LS_ROLE = "lp_role";
var LS_PACKS = "lp_packs";
var LS_SYNCED = "lp_synced_at";
var LS_PK_PFX = "lp_pk_";
var backend = null;
function canCreateSection() {
  return currentRole === "super" || currentRole === "pro" || currentRole === "demo";
}
function hasPack(packId) {
  return currentRole === "super" || ownedPackIds.has(packId);
}
function roleLabel() {
  const labels = {
    super: "Super",
    pro: "Pro",
    demo: "Demo",
    free: "Free"
  };
  return labels[currentRole];
}
async function initAuth() {
  backend = await getBackend();
  await backend.init();
  currentUser = backend.currentUser();
  if (currentUser) {
    await _syncEntitlements();
  } else {
    _restoreFromCache();
  }
  backend.onAuthChange(async () => {
    currentUser = backend.currentUser();
    if (currentUser) {
      await _syncEntitlements();
    } else {
      _clearSession();
    }
    _notifyListeners();
  });
  globalThis.addEventListener("online", () => {
    if (currentUser && entitlementsStale) void refreshEntitlements();
  });
}
async function login(email, password) {
  const b = backend ?? (backend = await getBackend());
  return await b.signIn(email, password);
}
async function signup(email, password) {
  const b = backend ?? (backend = await getBackend());
  return await b.signUp(email, password);
}
async function verifyEmailCode(code) {
  const b = backend ?? (backend = await getBackend());
  if (!b.verifyEmailCode) {
    return {
      error: "Check your email for a confirmation link, then sign in."
    };
  }
  return await b.verifyEmailCode(code);
}
async function logout() {
  const b = backend ?? (backend = await getBackend());
  await b.signOut();
  _clearSession();
  _notifyListeners();
}
async function getPackKeyMaterial(packId) {
  const cacheKey = LS_PK_PFX + packId;
  try {
    const b = backend ?? (backend = await getBackend());
    const key = await b.getPackKey(packId);
    if (key) {
      localStorage.setItem(cacheKey, key);
      return key;
    }
  } catch {
  }
  return localStorage.getItem(cacheKey);
}
async function getPackKey(packId) {
  const material = await getPackKeyMaterial(packId);
  return material ? await importPackKey(material) : null;
}
async function redeemCode(code) {
  const b = backend ?? (backend = await getBackend());
  return await b.redeemLicenseCode(code);
}
async function refreshEntitlements() {
  await _syncEntitlements();
  _notifyListeners();
}
var _listeners = [];
function onAuthChange(cb) {
  _listeners.push(cb);
}
function _notifyListeners() {
  for (const cb of _listeners) cb();
}
async function _syncEntitlements() {
  try {
    const info = await backend.getMyRole();
    currentRole = info.role ?? "free";
    ownedPackIds = new Set(info.packIds ?? []);
    entitlementsStale = false;
    lastSyncedAt = Date.now();
    localStorage.setItem(LS_ROLE, currentRole);
    localStorage.setItem(LS_PACKS, JSON.stringify([
      ...ownedPackIds
    ]));
    localStorage.setItem(LS_SYNCED, String(lastSyncedAt));
  } catch {
    entitlementsStale = true;
    _restoreFromCache();
  }
}
function _restoreFromCache() {
  currentRole = localStorage.getItem(LS_ROLE) ?? "free";
  try {
    const raw = JSON.parse(localStorage.getItem(LS_PACKS) ?? "[]");
    ownedPackIds = new Set(Array.isArray(raw) ? raw : []);
  } catch {
    ownedPackIds = /* @__PURE__ */ new Set();
  }
  const synced = Number(localStorage.getItem(LS_SYNCED));
  lastSyncedAt = Number.isFinite(synced) && synced > 0 ? synced : null;
}
function accessUnverified() {
  return entitlementsStale && lastSyncedAt === null;
}
function lastSyncedLabel() {
  if (lastSyncedAt === null) return null;
  const secs = Math.max(0, Math.round((Date.now() - lastSyncedAt) / 1e3));
  if (secs < 60) return "just now";
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}
function _clearSession() {
  currentUser = null;
  currentRole = "free";
  ownedPackIds = /* @__PURE__ */ new Set();
  entitlementsStale = false;
  lastSyncedAt = null;
  localStorage.removeItem(LS_ROLE);
  localStorage.removeItem(LS_PACKS);
  localStorage.removeItem(LS_SYNCED);
}

// src/license.ts
async function redeemLicenseCode(rawCode) {
  if (!currentUser) {
    return {
      success: false,
      message: "You must be signed in to redeem a code."
    };
  }
  const code = rawCode.trim().toUpperCase();
  if (!code) {
    return {
      success: false,
      message: "Please enter a code."
    };
  }
  try {
    const result = await redeemCode(code);
    if (result.success) await refreshEntitlements();
    return result;
  } catch (e) {
    return {
      success: false,
      message: e.message ?? "Network error."
    };
  }
}
function showRedeemCodeDialog() {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "import-modal-overlay";
    const dialog = document.createElement("div");
    dialog.className = "import-modal";
    const title = document.createElement("h3");
    title.textContent = "Redeem License Code";
    dialog.appendChild(title);
    const sub = document.createElement("p");
    sub.className = "import-modal-sub";
    sub.textContent = "Enter your purchase code to activate Pro access or unlock a template pack.";
    dialog.appendChild(sub);
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "XXXX-XXXX-XXXX-XXXX";
    input.className = "license-code-input";
    input.maxLength = 24;
    input.style.cssText = "width:100%;margin:0.75rem 0 0.25rem;padding:0.5rem 0.6rem;font-size:1rem;letter-spacing:0.1em;text-transform:uppercase;border:1px solid var(--border);border-radius:4px;background:var(--bg-input,#fff);color:var(--text);";
    dialog.appendChild(input);
    const errorEl = document.createElement("p");
    errorEl.style.cssText = "color:#e55;font-size:0.8rem;min-height:1.2em;margin:0.2rem 0 0.6rem;";
    dialog.appendChild(errorEl);
    const btns = document.createElement("div");
    btns.className = "import-modal-btns";
    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.addEventListener("click", () => {
      overlay.remove();
      resolve(null);
    });
    btns.appendChild(cancelBtn);
    const redeemBtn = document.createElement("button");
    redeemBtn.className = "import-confirm-btn";
    redeemBtn.textContent = "Redeem";
    redeemBtn.addEventListener("click", async () => {
      redeemBtn.disabled = true;
      redeemBtn.textContent = "Checking\u2026";
      errorEl.textContent = "";
      const result = await redeemLicenseCode(input.value);
      if (result.success) {
        overlay.remove();
        resolve(result);
      } else {
        errorEl.textContent = result.message;
        redeemBtn.disabled = false;
        redeemBtn.textContent = "Redeem";
        input.focus();
      }
    });
    btns.appendChild(redeemBtn);
    dialog.appendChild(btns);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") redeemBtn.click();
      if (e.key === "Escape") {
        overlay.remove();
        resolve(null);
      }
    });
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.remove();
        resolve(null);
      }
    });
    setTimeout(() => input.focus(), 50);
  });
}
function accessSummary() {
  if (accessUnverified()) return "Offline \u2014 access not yet verified";
  const base = currentRole === "super" ? "Full access (super)" : currentRole === "pro" ? "Pro \u2014 all features" : currentRole === "demo" ? "Demo trial active" : ownedPackIds.size > 0 ? `${ownedPackIds.size} template pack(s)` : "Free \u2014 no packs";
  if (!entitlementsStale) return base;
  const when = lastSyncedLabel();
  return when ? `${base} \xB7 offline, synced ${when}` : `${base} \xB7 offline`;
}

// src/types.ts
var DEFAULT_PLOT = {
  expr: "sin(x)",
  xVar: "x",
  xMin: 0,
  xMax: 6.2832,
  xMinExpr: "0",
  xMaxExpr: "6.2832",
  nPts: 200,
  xLabel: "x",
  yLabel: "y",
  xMarkers: [],
  yMarkers: [],
  fill: true
};
var GRID_SIZE = 20;
var PX_PER_IN = 96;
var PX_PER_MM = PX_PER_IN / 25.4;
var TITLE_BLOCK_H = 112;
var PAGE_SIZES = {
  a4: {
    label: "A4",
    w: Math.round(210 * PX_PER_MM),
    h: Math.round(297 * PX_PER_MM)
  },
  a3: {
    label: "A3",
    w: Math.round(297 * PX_PER_MM),
    h: Math.round(420 * PX_PER_MM)
  },
  letter: {
    label: "Letter",
    w: Math.round(8.5 * PX_PER_IN),
    h: Math.round(11 * PX_PER_IN)
  },
  legal: {
    label: "Legal",
    w: Math.round(8.5 * PX_PER_IN),
    h: Math.round(14 * PX_PER_IN)
  },
  tabloid: {
    label: "Tabloid",
    w: Math.round(11 * PX_PER_IN),
    h: Math.round(17 * PX_PER_IN)
  }
};

// src/state.ts
var CANVAS_W = PAGE_SIZES.letter.w;
var PAGE_H = PAGE_SIZES.letter.h;
var numPages = 1;
var CANVAS_H = PAGE_H;
var marginUnit = "in";
var margins = {
  top: Math.round(0.25 * PX_PER_IN),
  bottom: Math.round(0.25 * PX_PER_IN),
  left: Math.round(0.75 * PX_PER_IN),
  right: Math.round(0.25 * PX_PER_IN)
};
var titleBlockEnabled = false;
var pageNumberingEnabled = true;
function titleBlockH() {
  return titleBlockEnabled ? TITLE_BLOCK_H : 0;
}
function setCANVAS_W(v) {
  CANVAS_W = v;
}
function setPAGE_H(v) {
  PAGE_H = v;
}
function setNumPages(v) {
  numPages = v;
}
function setCANVAS_H(v) {
  CANVAS_H = v;
}
function setMarginUnit(v) {
  marginUnit = v;
}
function setTitleBlockEnabled(v) {
  titleBlockEnabled = v;
}
function setPageNumberingEnabled(v) {
  pageNumberingEnabled = v;
}
var state = {
  projectName: "Untitled Project",
  blocks: [],
  constants: {
    E: 2e5
  }
};
var globalScope = {};
var globalFnScope = {};
var sectionSummaryVarNames = /* @__PURE__ */ new Map();
var sectionSummaryComparisons = /* @__PURE__ */ new Map();
var childToSection = /* @__PURE__ */ new Map();
var deletionStack = [];
var CUSTOM_MODULES_KEY = "mathwasm-custom-modules";
var customModules = (() => {
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_MODULES_KEY) ?? "[]");
  } catch {
    return [];
  }
})();
function saveCustomModules() {
  localStorage.setItem(CUSTOM_MODULES_KEY, JSON.stringify(customModules));
}
function setCustomModules(v) {
  customModules = v;
}
var fileHandle = null;
function setFileHandle(v) {
  fileHandle = v;
}
var canvas = null;
function setCanvas(c) {
  canvas = c;
}
var selectedEl = null;
function setSelectedEl(v) {
  selectedEl = v;
}
var selectedEls = /* @__PURE__ */ new Set();
var multiDragState = null;
function setMultiDragState(v) {
  multiDragState = v;
}
var bandState = null;
function setBandState(v) {
  bandState = v;
}
var skipNextCanvasClick = false;
function setSkipNextCanvasClick(v) {
  skipNextCanvasClick = v;
}
var bandEl = null;
function setBandEl(v) {
  bandEl = v;
}
var gridCursor = {
  x: 0,
  y: 0
};
var onSectionSummaryUpdate = null;
var onRefreshAllSectionHeights = null;
var onSelectBlock = null;
var onMoveGridCursor = null;
var onUpdatePageCount = null;
var onSyncPageSeparators = null;
var onClearSelection = null;
var onAddToSelection = null;
var onRefreshCustomModulesList = null;
var onAppendCustomModuleToSidebar = null;
var onAuthStateChange = null;
function setOnSectionSummaryUpdate(fn) {
  onSectionSummaryUpdate = fn;
}
function setOnRefreshAllSectionHeights(fn) {
  onRefreshAllSectionHeights = fn;
}
function setOnSelectBlock(fn) {
  onSelectBlock = fn;
}
function setOnMoveGridCursor(fn) {
  onMoveGridCursor = fn;
}
function setOnUpdatePageCount(fn) {
  onUpdatePageCount = fn;
}
function setOnSyncPageSeparators(fn) {
  onSyncPageSeparators = fn;
}
function setOnClearSelection(fn) {
  onClearSelection = fn;
}
function setOnAddToSelection(fn) {
  onAddToSelection = fn;
}
function setOnRefreshCustomModulesList(fn) {
  onRefreshCustomModulesList = fn;
}
function setOnAppendCustomModuleToSidebar(fn) {
  onAppendCustomModuleToSidebar = fn;
}
function setOnAuthStateChange(fn) {
  onAuthStateChange = fn;
}

// src/utils/unit-defs.ts
var _PI = Math.PI;
var UNIT_CATEGORIES = {
  // ---- Length (base: m) ---------------------------------------------------
  length: {
    id: "length",
    label: "Length",
    siBase: "m",
    units: [
      {
        id: "mm",
        label: "Millimeters",
        symbol: "mm",
        factor: 1e-3,
        system: "metric"
      },
      {
        id: "cm",
        label: "Centimeters",
        symbol: "cm",
        factor: 0.01,
        system: "metric"
      },
      {
        id: "m",
        label: "Meters",
        symbol: "m",
        factor: 1,
        system: "metric"
      },
      {
        id: "km",
        label: "Kilometers",
        symbol: "km",
        factor: 1e3,
        system: "metric"
      },
      {
        id: "in",
        label: "Inches",
        symbol: "in",
        factor: 0.0254,
        system: "english"
      },
      {
        id: "ft",
        label: "Feet",
        symbol: "ft",
        factor: 0.3048,
        system: "english"
      },
      {
        id: "yd",
        label: "Yards",
        symbol: "yd",
        factor: 0.9144,
        system: "english"
      },
      {
        id: "mi",
        label: "Miles",
        symbol: "mi",
        factor: 1609.344,
        system: "english"
      }
    ]
  },
  // ---- Area (base: m²) ----------------------------------------------------
  area: {
    id: "area",
    label: "Area",
    siBase: "m\xB2",
    units: [
      {
        id: "mm2",
        label: "Square Millimeters",
        symbol: "mm\xB2",
        factor: 1e-6,
        system: "metric"
      },
      {
        id: "cm2",
        label: "Square Centimeters",
        symbol: "cm\xB2",
        factor: 1e-4,
        system: "metric"
      },
      {
        id: "m2",
        label: "Square Meters",
        symbol: "m\xB2",
        factor: 1,
        system: "metric"
      },
      {
        id: "km2",
        label: "Square Kilometers",
        symbol: "km\xB2",
        factor: 1e6,
        system: "metric"
      },
      {
        id: "ha",
        label: "Hectares",
        symbol: "ha",
        factor: 1e4,
        system: "metric"
      },
      {
        id: "in2",
        label: "Square Inches",
        symbol: "in\xB2",
        factor: 64516e-8,
        system: "english"
      },
      {
        id: "ft2",
        label: "Square Feet",
        symbol: "ft\xB2",
        factor: 0.09290304,
        system: "english"
      },
      {
        id: "yd2",
        label: "Square Yards",
        symbol: "yd\xB2",
        factor: 0.83612736,
        system: "english"
      },
      {
        id: "acre",
        label: "Acres",
        symbol: "ac",
        factor: 4046.8564224,
        system: "english"
      },
      {
        id: "mi2",
        label: "Square Miles",
        symbol: "mi\xB2",
        factor: 2589988110336e-6,
        system: "english"
      }
    ]
  },
  // ---- Volume (base: m³) --------------------------------------------------
  volume: {
    id: "volume",
    label: "Volume",
    siBase: "m\xB3",
    units: [
      {
        id: "mm3",
        label: "Cubic Millimeters",
        symbol: "mm\xB3",
        factor: 1e-9,
        system: "metric"
      },
      {
        id: "cm3",
        label: "Cubic Centimeters",
        symbol: "cm\xB3",
        factor: 1e-6,
        system: "metric"
      },
      {
        id: "m3",
        label: "Cubic Meters",
        symbol: "m\xB3",
        factor: 1,
        system: "metric"
      },
      {
        id: "L",
        label: "Liters",
        symbol: "L",
        factor: 1e-3,
        system: "metric"
      },
      {
        id: "mL",
        label: "Milliliters",
        symbol: "mL",
        factor: 1e-6,
        system: "metric"
      },
      {
        id: "in3",
        label: "Cubic Inches",
        symbol: "in\xB3",
        factor: 16387064e-12,
        system: "english"
      },
      {
        id: "ft3",
        label: "Cubic Feet",
        symbol: "ft\xB3",
        factor: 0.028316846592,
        system: "english"
      },
      {
        id: "yd3",
        label: "Cubic Yards",
        symbol: "yd\xB3",
        factor: 0.764554857984,
        system: "english"
      },
      {
        id: "gal",
        label: "Gallons (US)",
        symbol: "gal",
        factor: 0.003785411784,
        system: "english"
      },
      {
        id: "qt",
        label: "Quarts (US)",
        symbol: "qt",
        factor: 946352946e-12,
        system: "english"
      },
      {
        id: "floz",
        label: "Fluid Ounces (US)",
        symbol: "fl oz",
        factor: 295735295625e-16,
        system: "english"
      }
    ]
  },
  // ---- Mass (base: kg) ----------------------------------------------------
  mass: {
    id: "mass",
    label: "Mass",
    siBase: "kg",
    units: [
      {
        id: "g",
        label: "Grams",
        symbol: "g",
        factor: 1e-3,
        system: "metric"
      },
      {
        id: "kg",
        label: "Kilograms",
        symbol: "kg",
        factor: 1,
        system: "metric"
      },
      {
        id: "t",
        label: "Metric Tons",
        symbol: "t",
        factor: 1e3,
        system: "metric"
      },
      {
        id: "oz",
        label: "Ounces",
        symbol: "oz",
        factor: 0.028349523125,
        system: "english"
      },
      {
        id: "lbm",
        label: "Pounds",
        symbol: "lbm",
        factor: 0.45359237,
        system: "english"
      },
      {
        id: "slug",
        label: "Slugs",
        symbol: "slug",
        factor: 14.593902937206,
        system: "english"
      },
      {
        id: "tonm_s",
        label: "Tons (US short)",
        symbol: "tonm",
        factor: 907.18474,
        system: "english"
      },
      {
        id: "tonm_l",
        label: "Tons (long)",
        symbol: "LTm",
        factor: 1016.0469088,
        system: "english"
      }
    ]
  },
  // ---- Time (base: s) -----------------------------------------------------
  time: {
    id: "time",
    label: "Time",
    siBase: "s",
    units: [
      {
        id: "ms",
        label: "Milliseconds",
        symbol: "ms",
        factor: 1e-3,
        system: "both"
      },
      {
        id: "s",
        label: "Seconds",
        symbol: "s",
        factor: 1,
        system: "both"
      },
      {
        id: "min",
        label: "Minutes",
        symbol: "min",
        factor: 60,
        system: "both"
      },
      {
        id: "hr",
        label: "Hours",
        symbol: "hr",
        factor: 3600,
        system: "both"
      },
      {
        id: "day",
        label: "Days",
        symbol: "day",
        factor: 86400,
        system: "both"
      }
    ]
  },
  // ---- Temperature (base: K, affine) --------------------------------------
  // toBase(x) = x * factor + offset;  fromBase(b) = (b - offset) / factor
  temperature: {
    id: "temperature",
    label: "Temperature",
    siBase: "K",
    units: [
      {
        id: "K",
        label: "Kelvin",
        symbol: "K",
        factor: 1,
        offset: 0,
        system: "metric"
      },
      {
        id: "C",
        label: "Celsius",
        symbol: "\xB0C",
        factor: 1,
        offset: 273.15,
        system: "metric"
      },
      // offset = 273.15 - 32*(5/9) = 255.37222…
      {
        id: "F",
        label: "Fahrenheit",
        symbol: "\xB0F",
        factor: 5 / 9,
        offset: 255.3722222222222,
        system: "english"
      },
      {
        id: "R",
        label: "Rankine",
        symbol: "\xB0R",
        factor: 5 / 9,
        offset: 0,
        system: "english"
      }
    ]
  },
  // ---- Force (base: N) ----------------------------------------------------
  force: {
    id: "force",
    label: "Force",
    siBase: "N",
    units: [
      {
        id: "N",
        label: "Newtons",
        symbol: "N",
        factor: 1,
        system: "metric"
      },
      {
        id: "kN",
        label: "Kilonewtons",
        symbol: "kN",
        factor: 1e3,
        system: "metric"
      },
      {
        id: "MN",
        label: "Meganewtons",
        symbol: "MN",
        factor: 1e6,
        system: "metric"
      },
      {
        id: "lbf",
        label: "Pounds-force",
        symbol: "lbf",
        factor: 4.4482216152605,
        system: "english"
      },
      {
        id: "kip",
        label: "Kips",
        symbol: "kip",
        factor: 4448.2216152605,
        system: "english"
      },
      {
        id: "tonf",
        label: "Tons-force (US)",
        symbol: "tonf",
        factor: 8896.443230521,
        system: "english"
      }
    ]
  },
  // ---- Force per unit length (base: N/m) ----------------------------------------------------
  forcePerUnitLength: {
    id: "forcePerUnitLength",
    label: "Force per unit length",
    siBase: "N/m",
    units: [
      {
        id: "N_m",
        label: "Newtons per meter",
        symbol: "N/m",
        factor: 1,
        system: "metric"
      },
      {
        id: "kN_m",
        label: "Kilonewtons per meter",
        symbol: "kN/m",
        factor: 1e3,
        system: "metric"
      },
      {
        id: "MN_m",
        label: "Meganewtons per meter",
        symbol: "MN/m",
        factor: 1e6,
        system: "metric"
      },
      {
        id: "lbf_ft",
        label: "Pounds-force per foot",
        symbol: "lbf/ft",
        factor: 14.593902937206,
        system: "english"
      },
      {
        id: "plf",
        label: "Pounds-force per foot",
        symbol: "plf",
        factor: 14.593902937206,
        system: "english"
      },
      {
        id: "kip_ft",
        label: "Kips per foot",
        symbol: "kip/ft",
        factor: 14593.902937206,
        system: "english"
      },
      {
        id: "klf",
        label: "Kips per foot",
        symbol: "klf",
        factor: 14593.902937206,
        system: "english"
      },
      {
        id: "tonf_ft",
        label: "Tons-force (US) per foot",
        symbol: "tonf/ft",
        factor: 28178.345536848,
        system: "english"
      }
    ]
  },
  // ---- Pressure (base: Pa) ------------------------------------------------
  // baseUnits: 1 [unit] = 1 [product-of-primitives] exactly (no numeric scaling).
  // Pa=N/m², kPa=kN/m², MPa=N/mm², GPa=kN/mm²,
  // psi=lbf/in², ksi=kip/in², psf=lbf/ft², ksf=kip/ft²
  pressure: {
    id: "pressure",
    label: "Pressure",
    siBase: "Pa",
    units: [
      {
        id: "Pa",
        label: "Pascals",
        symbol: "Pa",
        factor: 1,
        system: "metric",
        baseUnits: {
          N: 1,
          m: -2
        }
      },
      {
        id: "kPa",
        label: "Kilopascals",
        symbol: "kPa",
        factor: 1e3,
        system: "metric",
        baseUnits: {
          kN: 1,
          m: -2
        }
      },
      {
        id: "MPa",
        label: "Megapascals",
        symbol: "MPa",
        factor: 1e6,
        system: "metric",
        baseUnits: {
          N: 1,
          mm: -2
        }
      },
      {
        id: "GPa",
        label: "Gigapascals",
        symbol: "GPa",
        factor: 1e9,
        system: "metric",
        baseUnits: {
          kN: 1,
          mm: -2
        }
      },
      {
        id: "bar",
        label: "Bar",
        symbol: "bar",
        factor: 1e5,
        system: "metric"
      },
      {
        id: "atm",
        label: "Atmospheres",
        symbol: "atm",
        factor: 101325,
        system: "both"
      },
      {
        id: "mmHg",
        label: "Millimeters of Mercury",
        symbol: "mmHg",
        factor: 133.322387415,
        system: "both"
      },
      {
        id: "psi",
        label: "Pounds per sq. in.",
        symbol: "psi",
        factor: 6894.757293168,
        system: "english",
        baseUnits: {
          lbf: 1,
          in: -2
        }
      },
      {
        id: "ksi",
        label: "Kips per sq. in.",
        symbol: "ksi",
        factor: 6894757293168e-6,
        system: "english",
        baseUnits: {
          kip: 1,
          in: -2
        }
      },
      {
        id: "psf",
        label: "Pounds per sq. ft.",
        symbol: "psf",
        factor: 47.88025898,
        system: "english",
        baseUnits: {
          lbf: 1,
          ft: -2
        }
      },
      {
        id: "ksf",
        label: "Kips per sq. ft.",
        symbol: "ksf",
        factor: 47880.25898,
        system: "english",
        baseUnits: {
          kip: 1,
          ft: -2
        }
      }
    ]
  },
  // ---- Energy / Work (base: J) --------------------------------------------
  // J=N·m, kJ=kN·m, MJ=MN·m; ft_lbf=lbf·ft, ft_kip=kip·ft, in_lbf=lbf·in, in_kip=kip·in
  energy: {
    id: "energy",
    label: "Energy",
    siBase: "J",
    units: [
      {
        id: "J",
        label: "Joules",
        symbol: "J",
        factor: 1,
        system: "metric",
        baseUnits: {
          N: 1,
          m: 1
        }
      },
      {
        id: "kJ",
        label: "Kilojoules",
        symbol: "kJ",
        factor: 1e3,
        system: "metric",
        baseUnits: {
          kN: 1,
          m: 1
        }
      },
      {
        id: "MJ",
        label: "Megajoules",
        symbol: "MJ",
        factor: 1e6,
        system: "metric",
        baseUnits: {
          MN: 1,
          m: 1
        }
      },
      {
        id: "kWh",
        label: "Kilowatt-hours",
        symbol: "kWh",
        factor: 36e5,
        system: "metric"
      },
      {
        id: "cal",
        label: "Calories",
        symbol: "cal",
        factor: 4.184,
        system: "metric"
      },
      {
        id: "kcal",
        label: "Kilocalories",
        symbol: "kcal",
        factor: 4184,
        system: "metric"
      },
      {
        id: "BTU",
        label: "BTU",
        symbol: "BTU",
        factor: 1055.05585262,
        system: "english"
      },
      {
        id: "ft-lbf",
        label: "Foot-pounds",
        symbol: "ft\xB7lbf",
        factor: 1.3558179483314,
        system: "english",
        baseUnits: {
          lbf: 1,
          ft: 1
        }
      },
      {
        id: "ft-kip",
        label: "Foot-kips",
        symbol: "ft\xB7kip",
        factor: 1355.8179483314,
        system: "english",
        baseUnits: {
          kip: 1,
          ft: 1
        }
      },
      {
        id: "in-lbf",
        label: "Inch-pounds",
        symbol: "in\xB7lbf",
        factor: 0.1129848290276,
        system: "english",
        baseUnits: {
          lbf: 1,
          in: 1
        }
      },
      {
        id: "in-kip",
        label: "Inch-kips",
        symbol: "in\xB7kip",
        factor: 112.9848290276,
        system: "english",
        baseUnits: {
          kip: 1,
          in: 1
        }
      }
    ]
  },
  // ---- Power (base: W) ----------------------------------------------------
  // W=N·m/s, kW=kN·m/s, MW=MN·m/s
  power: {
    id: "power",
    label: "Power",
    siBase: "W",
    units: [
      {
        id: "W",
        label: "Watts",
        symbol: "W",
        factor: 1,
        system: "metric",
        baseUnits: {
          N: 1,
          m: 1,
          s: -1
        }
      },
      {
        id: "kW",
        label: "Kilowatts",
        symbol: "kW",
        factor: 1e3,
        system: "metric",
        baseUnits: {
          kN: 1,
          m: 1,
          s: -1
        }
      },
      {
        id: "MW",
        label: "Megawatts",
        symbol: "MW",
        factor: 1e6,
        system: "metric",
        baseUnits: {
          MN: 1,
          m: 1,
          s: -1
        }
      },
      {
        id: "hp",
        label: "Horsepower",
        symbol: "hp",
        factor: 745.69987158227,
        system: "english"
      },
      {
        id: "BTU_hr",
        label: "BTU per hour",
        symbol: "BTU/hr",
        factor: 0.29307107017,
        system: "english"
      }
    ]
  },
  // ---- Velocity (base: m/s) -----------------------------------------------
  velocity: {
    id: "velocity",
    label: "Velocity",
    siBase: "m/s",
    units: [
      {
        id: "m_s",
        label: "Meters per second",
        symbol: "m/s",
        factor: 1,
        system: "metric",
        baseUnits: {
          m: 1,
          s: -1
        }
      },
      {
        id: "m_h",
        label: "Meters per hour",
        symbol: "m/h",
        factor: 1 / 3600,
        system: "metric",
        baseUnits: {
          m: 1,
          hr: -1
        }
      },
      {
        id: "km_s",
        label: "Kilometers per second",
        symbol: "km/s",
        factor: 1 / 1e3,
        system: "metric"
      },
      {
        id: "km_h",
        label: "Kilometers per hour",
        symbol: "km/h",
        factor: 1 / 3.6,
        system: "metric",
        baseUnits: {
          km: 1,
          hr: -1
        }
      },
      {
        id: "ft_s",
        label: "Feet per second",
        symbol: "ft/s",
        factor: 0.3048,
        system: "english",
        baseUnits: {
          ft: 1,
          s: -1
        }
      },
      {
        id: "in_s",
        label: "Inches per second",
        symbol: "in/s",
        factor: 0.0254,
        system: "english",
        baseUnits: {
          in: 1,
          s: -1
        }
      },
      {
        id: "mph",
        label: "Miles per hour",
        symbol: "mph",
        factor: 0.44704,
        system: "english",
        baseUnits: {
          mi: 1,
          hr: -1
        }
      },
      {
        id: "kn",
        label: "Knots",
        symbol: "kn",
        factor: 1.852 / 3.6,
        system: "both"
      }
    ]
  },
  // ---- Acceleration (base: m/s²) ------------------------------------------
  acceleration: {
    id: "acceleration",
    label: "Acceleration",
    siBase: "m/s\xB2",
    units: [
      {
        id: "m_s2",
        label: "Meters per second\xB2",
        symbol: "m/s\xB2",
        factor: 1,
        system: "metric",
        baseUnits: {
          m: 1,
          s: -2
        }
      },
      {
        id: "cm_s2",
        label: "Centimeters per second\xB2",
        symbol: "cm/s\xB2",
        factor: 0.01,
        system: "metric",
        baseUnits: {
          cm: 1,
          s: -2
        }
      },
      {
        id: "ft_s2",
        label: "Feet per second\xB2",
        symbol: "ft/s\xB2",
        factor: 0.3048,
        system: "english",
        baseUnits: {
          ft: 1,
          s: -2
        }
      },
      {
        id: "in_s2",
        label: "Inches per second\xB2",
        symbol: "in/s\xB2",
        factor: 0.0254,
        system: "english",
        baseUnits: {
          in: 1,
          s: -2
        }
      },
      {
        id: "g",
        label: "Standard Gravity",
        symbol: "g",
        factor: 9.80665,
        system: "both"
      }
    ]
  },
  // ---- Angle (base: rad) --------------------------------------------------
  angle: {
    id: "angle",
    label: "Angle",
    siBase: "rad",
    units: [
      {
        id: "rad",
        label: "Radians",
        symbol: "rad",
        factor: 1,
        system: "both"
      },
      {
        id: "deg",
        label: "Degrees",
        symbol: "\xB0",
        factor: _PI / 180,
        system: "both"
      },
      {
        id: "grad",
        label: "Gradians",
        symbol: "grad",
        factor: _PI / 200,
        system: "both"
      },
      {
        id: "arcmin",
        label: "Arcminutes",
        symbol: "'",
        factor: _PI / 10800,
        system: "both"
      },
      {
        id: "arcsec",
        label: "Arcseconds",
        symbol: '"',
        factor: _PI / 648e3,
        system: "both"
      },
      {
        id: "rev",
        label: "Revolutions",
        symbol: "rev",
        factor: 2 * _PI,
        system: "both"
      }
    ]
  },
  // ---- Linear Momentum (base: kg·m/s) -------------------------------------
  momentum: {
    id: "momentum",
    label: "Linear Momentum",
    siBase: "kg\xB7m/s",
    units: [
      {
        id: "kg-m_s",
        label: "Kilogram\xB7meters/s",
        symbol: "kg\xB7m/s",
        factor: 1,
        system: "metric",
        baseUnits: {
          kg: 1,
          m: 1,
          s: -1
        }
      },
      {
        id: "g-cm_s",
        label: "Gram\xB7centimeters/s",
        symbol: "g\xB7cm/s",
        factor: 1e-5,
        system: "metric",
        baseUnits: {
          g: 1,
          cm: 1,
          s: -1
        }
      },
      {
        id: "lb-ft_s",
        label: "Pound\xB7feet/s",
        symbol: "lb\xB7ft/s",
        factor: 0.45359237 * 0.3048,
        system: "english",
        baseUnits: {
          lbm: 1,
          ft: 1,
          s: -1
        }
      },
      {
        id: "lb-in_s",
        label: "Pound\xB7inches/s",
        symbol: "lb\xB7in/s",
        factor: 0.45359237 * 0.0254,
        system: "english",
        baseUnits: {
          lbm: 1,
          in: 1,
          s: -1
        }
      },
      {
        id: "slug-ft_s",
        label: "Slug\xB7feet/s",
        symbol: "slug\xB7ft/s",
        factor: 14.593902937206 * 0.3048,
        system: "english",
        baseUnits: {
          slug: 1,
          ft: 1,
          s: -1
        }
      }
    ]
  },
  // ---- Angular Momentum (base: kg·m²/s) -----------------------------------
  angular_momentum: {
    id: "angular_momentum",
    label: "Angular Momentum",
    siBase: "kg\xB7m\xB2/s",
    units: [
      {
        id: "kg-m2_s",
        label: "Kilogram\xB7meters\xB2/s",
        symbol: "kg\xB7m\xB2/s",
        factor: 1,
        system: "metric",
        baseUnits: {
          kg: 1,
          m: 2,
          s: -1
        }
      },
      {
        id: "g-cm2_s",
        label: "Gram\xB7cm\xB2/s",
        symbol: "g\xB7cm\xB2/s",
        factor: 1e-7,
        system: "metric",
        baseUnits: {
          g: 1,
          cm: 2,
          s: -1
        }
      },
      {
        id: "lb-ft2_s",
        label: "Pound\xB7feet\xB2/s",
        symbol: "lb\xB7ft\xB2/s",
        factor: 0.45359237 * 0.09290304,
        system: "english",
        baseUnits: {
          lbm: 1,
          ft: 2,
          s: -1
        }
      },
      {
        id: "lb-in2_s",
        label: "Pound\xB7inches\xB2/s",
        symbol: "lb\xB7in\xB2/s",
        factor: 0.45359237 * 64516e-8,
        system: "english",
        baseUnits: {
          lbm: 1,
          in: 2,
          s: -1
        }
      },
      {
        id: "slug-ft2_s",
        label: "Slug\xB7feet\xB2/s",
        symbol: "slug\xB7ft\xB2/s",
        factor: 14.593902937206 * 0.09290304,
        system: "english",
        baseUnits: {
          slug: 1,
          ft: 2,
          s: -1
        }
      }
    ]
  },
  // ---- Angular Acceleration (base: rad/s²) --------------------------------
  angular_acceleration: {
    id: "angular_acceleration",
    label: "Angular Acceleration",
    siBase: "rad/s\xB2",
    units: [
      {
        id: "rad_s2",
        label: "Radians/s\xB2",
        symbol: "rad/s\xB2",
        factor: 1,
        system: "both"
      },
      {
        id: "deg_s2",
        label: "Degrees/s\xB2",
        symbol: "\xB0/s\xB2",
        factor: _PI / 180,
        system: "both"
      },
      {
        id: "rev_s2",
        label: "Revolutions/s\xB2",
        symbol: "rev/s\xB2",
        factor: 2 * _PI,
        system: "both"
      },
      {
        id: "rpm_s",
        label: "RPM per second",
        symbol: "rpm/s",
        factor: 2 * _PI / 60,
        system: "both"
      },
      {
        id: "rpm_min",
        label: "RPM per minute",
        symbol: "rpm/min",
        factor: 2 * _PI / 3600,
        system: "both"
      }
    ]
  },
  // ---- Torque (base: N·m) -------------------------------------------------
  // N_mm=N·mm, N_m=N·m, kN_m=kN·m; lbf_in=lbf·in, lbf_ft=lbf·ft, kip_in=kip·in, kip_ft=kip·ft
  torque: {
    id: "torque",
    label: "Torque",
    siBase: "N\xB7m",
    units: [
      {
        id: "N-mm",
        label: "Newton\xB7millimeters",
        symbol: "N\xB7mm",
        factor: 1e-3,
        system: "metric",
        baseUnits: {
          N: 1,
          mm: 1
        }
      },
      {
        id: "N-m",
        label: "Newton\xB7meters",
        symbol: "N\xB7m",
        factor: 1,
        system: "metric",
        baseUnits: {
          N: 1,
          m: 1
        }
      },
      {
        id: "kN-m",
        label: "Kilonewton\xB7meters",
        symbol: "kN\xB7m",
        factor: 1e3,
        system: "metric",
        baseUnits: {
          kN: 1,
          m: 1
        }
      },
      {
        id: "lbf-in",
        label: "Pound-force\xB7inches",
        symbol: "lbf\xB7in",
        factor: 0.1129848290276,
        system: "english",
        baseUnits: {
          lbf: 1,
          in: 1
        }
      },
      {
        id: "lbf-ft",
        label: "Pound-force\xB7feet",
        symbol: "lbf\xB7ft",
        factor: 1.3558179483314,
        system: "english",
        baseUnits: {
          lbf: 1,
          ft: 1
        }
      },
      {
        id: "kip-in",
        label: "Kip\xB7inches",
        symbol: "kip\xB7in",
        factor: 112.9848290276,
        system: "english",
        baseUnits: {
          kip: 1,
          in: 1
        }
      },
      {
        id: "kip-ft",
        label: "Kip\xB7feet",
        symbol: "kip\xB7ft",
        factor: 1355.8179483314,
        system: "english",
        baseUnits: {
          kip: 1,
          ft: 1
        }
      }
    ]
  },
  // ---- Density / Specific Gravity (base: kg/m³) ---------------------------
  // Specific gravity (SG) is dimensionless: SG = density / 1000 kg/m³ (water at 4 °C).
  // It is listed here as a unit with factor = 1000 so convert() treats it correctly.
  density: {
    id: "density",
    label: "Density / Specific Gravity",
    siBase: "kg/m\xB3",
    units: [
      {
        id: "kg_m3",
        label: "Kilograms/m\xB3",
        symbol: "kg/m\xB3",
        factor: 1,
        system: "metric",
        baseUnits: {
          kg: 1,
          m: -3
        }
      },
      {
        id: "g_cm3",
        label: "Grams/cm\xB3",
        symbol: "g/cm\xB3",
        factor: 1e3,
        system: "metric",
        baseUnits: {
          g: 1,
          cm: -3
        }
      },
      {
        id: "kg_L",
        label: "Kilograms/liter",
        symbol: "kg/L",
        factor: 1e3,
        system: "metric"
      },
      {
        id: "sg",
        label: "Specific Gravity (water = 1)",
        symbol: "SG",
        factor: 1e3,
        system: "both"
      },
      {
        id: "lb_ft3",
        label: "Pounds/ft\xB3",
        symbol: "lb/ft\xB3",
        factor: 16.01846337396,
        system: "english",
        baseUnits: {
          lbm: 1,
          ft: -3
        }
      },
      {
        id: "lb_in3",
        label: "Pounds/in\xB3",
        symbol: "lb/in\xB3",
        factor: 27679.904710191,
        system: "english",
        baseUnits: {
          lbm: 1,
          in: -3
        }
      },
      {
        id: "slug_ft3",
        label: "Slugs/ft\xB3",
        symbol: "slug/ft\xB3",
        factor: 515.37882,
        system: "english",
        baseUnits: {
          slug: 1,
          ft: -3
        }
      }
    ]
  },
  // ---- Area Moment of Inertia / Second Moment of Area (base: m⁴) ----------
  area_moi: {
    id: "area_moi",
    label: "Area Moment of Inertia (Second Moment of Area)",
    siBase: "m\u2074",
    units: [
      {
        id: "mm4",
        label: "mm\u2074",
        symbol: "mm\u2074",
        factor: 1e-12,
        system: "metric"
      },
      {
        id: "cm4",
        label: "cm\u2074",
        symbol: "cm\u2074",
        factor: 1e-8,
        system: "metric"
      },
      {
        id: "m4",
        label: "m\u2074",
        symbol: "m\u2074",
        factor: 1,
        system: "metric"
      },
      // in⁴: 0.0254^4 = 4.162314256e-7
      {
        id: "in4",
        label: "in\u2074",
        symbol: "in\u2074",
        factor: 4162314256e-16,
        system: "english"
      },
      // ft⁴: 0.3048^4 = 8.630975e-3
      {
        id: "ft4",
        label: "ft\u2074",
        symbol: "ft\u2074",
        factor: 8630975e-9,
        system: "english"
      }
    ]
  },
  // ---- Mass Moment of Inertia (base: kg·m²) -------------------------------
  mass_moi: {
    id: "mass_moi",
    label: "Mass Moment of Inertia",
    siBase: "kg\xB7m\xB2",
    units: [
      {
        id: "kg-m2",
        label: "Kilogram\xB7meters\xB2",
        symbol: "kg\xB7m\xB2",
        factor: 1,
        system: "metric",
        baseUnits: {
          kg: 1,
          m: 2
        }
      },
      {
        id: "g-cm2",
        label: "Gram\xB7centimeters\xB2",
        symbol: "g\xB7cm\xB2",
        factor: 1e-7,
        system: "metric",
        baseUnits: {
          g: 1,
          cm: 2
        }
      },
      {
        id: "kg-cm2",
        label: "Kilogram\xB7cm\xB2",
        symbol: "kg\xB7cm\xB2",
        factor: 1e-4,
        system: "metric",
        baseUnits: {
          kg: 1,
          cm: 2
        }
      },
      {
        id: "lb-ft2",
        label: "Pound\xB7feet\xB2",
        symbol: "lb\xB7ft\xB2",
        factor: 0.45359237 * 0.09290304,
        system: "english",
        baseUnits: {
          lbm: 1,
          ft: 2
        }
      },
      {
        id: "lb-in2",
        label: "Pound\xB7inches\xB2",
        symbol: "lb\xB7in\xB2",
        factor: 0.45359237 * 64516e-8,
        system: "english",
        baseUnits: {
          lbm: 1,
          in: 2
        }
      },
      {
        id: "slug-ft2",
        label: "Slug\xB7feet\xB2",
        symbol: "slug\xB7ft\xB2",
        factor: 14.593902937206 * 0.09290304,
        system: "english",
        baseUnits: {
          slug: 1,
          ft: 2
        }
      },
      {
        id: "slug-in2",
        label: "Slug\xB7inches\xB2",
        symbol: "slug\xB7in\xB2",
        factor: 14.593902937206 * 64516e-8,
        system: "english",
        baseUnits: {
          slug: 1,
          in: 2
        }
      }
    ]
  },
  // ---- Section Modulus (base: m³) -----------------------------------------
  section_modulus: {
    id: "section_modulus",
    label: "Section Modulus",
    siBase: "m\xB3",
    units: [
      {
        id: "mm3",
        label: "mm\xB3",
        symbol: "mm\xB3",
        factor: 1e-9,
        system: "metric"
      },
      {
        id: "cm3",
        label: "cm\xB3",
        symbol: "cm\xB3",
        factor: 1e-6,
        system: "metric"
      },
      {
        id: "m3",
        label: "m\xB3",
        symbol: "m\xB3",
        factor: 1,
        system: "metric"
      },
      // in³: 0.0254^3 = 1.6387064e-5
      {
        id: "in3",
        label: "in\xB3",
        symbol: "in\xB3",
        factor: 16387064e-12,
        system: "english"
      },
      // ft³: 0.3048^3 = 0.028316846592
      {
        id: "ft3",
        label: "ft\xB3",
        symbol: "ft\xB3",
        factor: 0.028316846592,
        system: "english"
      }
    ]
  },
  // ---- Torsional Warping Constant (base: m⁶) ------------------------------
  warping_constant: {
    id: "warping_constant",
    label: "Torsional Warping Constant",
    siBase: "m\u2076",
    units: [
      {
        id: "mm6",
        label: "mm\u2076",
        symbol: "mm\u2076",
        factor: 1e-18,
        system: "metric"
      },
      {
        id: "cm6",
        label: "cm\u2076",
        symbol: "cm\u2076",
        factor: 1e-12,
        system: "metric"
      },
      {
        id: "m6",
        label: "m\u2076",
        symbol: "m\u2076",
        factor: 1,
        system: "metric"
      },
      // in⁶: 0.0254^6 = 2.68536e-10
      {
        id: "in6",
        label: "in\u2076",
        symbol: "in\u2076",
        factor: 268536e-15,
        system: "english"
      },
      // ft⁶: 0.3048^6 = 8.01843e-4
      {
        id: "ft6",
        label: "ft\u2076",
        symbol: "ft\u2076",
        factor: 801843e-9,
        system: "english"
      }
    ]
  }
};
var UNIT_LOOKUP = (() => {
  const m = /* @__PURE__ */ new Map();
  for (const cat of Object.values(UNIT_CATEGORIES)) {
    for (const u of cat.units) {
      if (!m.has(u.id)) m.set(u.id, u);
    }
  }
  return m;
})();

// src/utils/units.ts
function mmToPx(mm) {
  return Math.round(mm * PX_PER_MM);
}
function inToPx(inches) {
  return Math.round(inches * PX_PER_IN);
}
function pxToMm(px) {
  return parseFloat((px / PX_PER_MM).toFixed(1));
}
function pxToIn(px) {
  return parseFloat((px / PX_PER_IN).toFixed(3));
}
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}
function pxToUnit(px) {
  return marginUnit === "mm" ? pxToMm(px) : pxToIn(px);
}
function unitToPx(val) {
  return marginUnit === "mm" ? mmToPx(val) : inToPx(val);
}

// src/utils/theme.ts
function isDark() {
  return globalThis.matchMedia("(prefers-color-scheme: dark)").matches;
}

// src/expr.ts
function cleanU(u) {
  const r = {};
  for (const [k, e] of Object.entries(u)) if (e !== 0) r[k] = e;
  return r;
}
function mulU(a, b) {
  const r = {
    ...a
  };
  for (const [k, e] of Object.entries(b)) r[k] = (r[k] ?? 0) + e;
  return cleanU(r);
}
function divU(a, b) {
  const r = {
    ...a
  };
  for (const [k, e] of Object.entries(b)) r[k] = (r[k] ?? 0) - e;
  return cleanU(r);
}
function powU(u, n) {
  if (Object.keys(u).length === 0) return u;
  const r = {};
  for (const [k, e] of Object.entries(u)) r[k] = e * n;
  return cleanU(r);
}
function eqU(a, b) {
  const ka = Object.keys(a).filter((k) => a[k] !== 0).sort();
  const kb = Object.keys(b).filter((k) => b[k] !== 0).sort();
  if (ka.length !== kb.length) return false;
  return ka.every((k, i) => k === kb[i] && a[k] === b[k]);
}
function addU(a, b) {
  const aEmpty = Object.keys(a).length === 0;
  const bEmpty = Object.keys(b).length === 0;
  if (aEmpty) return b;
  if (bEmpty) return a;
  if (!eqU(a, b)) {
    throw new Error(`Unit mismatch: ${formatUnit(a)} \u2260 ${formatUnit(b)}`);
  }
  return a;
}
function formatUnit(u) {
  const pos = Object.entries(u).filter(([, e]) => e > 0).sort((a, b) => a[0].localeCompare(b[0]));
  const neg = Object.entries(u).filter(([, e]) => e < 0).sort((a, b) => a[0].localeCompare(b[0]));
  const fmt = ([name, exp2]) => {
    const e = Math.abs(exp2);
    if (e === 1) return name;
    return `${name}^${Number.isInteger(e) ? e : e.toFixed(2)}`;
  };
  const numStr = pos.map(fmt).join("\xB7");
  const denParts = neg.map(fmt);
  if (!numStr && denParts.length === 0) return "";
  if (denParts.length === 0) return numStr;
  const denStr = denParts.length === 1 ? denParts[0] : `(${denParts.join("\xB7")})`;
  return `${numStr || "1"}/${denStr}`;
}
function parseUnitExpr(s) {
  s = s.trim().replace(/·/g, "*");
  const result = {};
  function applyTerms(str, sign) {
    str = str.trim();
    if (str.startsWith("(") && str.endsWith(")")) str = str.slice(1, -1).trim();
    for (const raw of str.split("*")) {
      const t = raw.trim();
      if (!t) continue;
      let name;
      let exp2;
      const ci = t.indexOf("^");
      if (ci >= 0) {
        name = t.slice(0, ci).trim();
        exp2 = Number(t.slice(ci + 1).trim());
      } else {
        name = t;
        exp2 = 1;
      }
      if (!name) continue;
      const def = UNIT_LOOKUP.get(name);
      if (def?.baseUnits) {
        for (const [bKey, bExp] of Object.entries(def.baseUnits)) {
          result[bKey] = (result[bKey] ?? 0) + sign * exp2 * bExp;
        }
      } else {
        result[name] = (result[name] ?? 0) + sign * exp2;
      }
    }
  }
  const si = s.indexOf("/");
  applyTerms(si >= 0 ? s.slice(0, si) : s, 1);
  if (si >= 0) applyTerms(s.slice(si + 1), -1);
  return cleanU(result);
}
function unitMapSiFactor(umap) {
  let f = 1;
  for (const [sym, exp2] of Object.entries(umap)) {
    const def = UNIT_LOOKUP.get(sym);
    if (!def) throw new Error(`No SI conversion factor for unit: "${sym}"`);
    f *= Math.pow(def.factor, exp2);
  }
  return f;
}
function isSingleTempUnit(umap) {
  const keys = Object.keys(umap);
  if (keys.length !== 1 || umap[keys[0]] !== 1) return false;
  const def = UNIT_LOOKUP.get(keys[0]);
  return !!def && (def.offset ?? 0) !== 0;
}
function applyTargetUnit(q, targetUmap) {
  if (isSingleTempUnit(q.u) && isSingleTempUnit(targetUmap)) {
    const src = UNIT_LOOKUP.get(Object.keys(q.u)[0]);
    const tgt = UNIT_LOOKUP.get(Object.keys(targetUmap)[0]);
    const base = q.v * src.factor + (src.offset ?? 0);
    return {
      v: (base - (tgt.offset ?? 0)) / tgt.factor,
      u: targetUmap
    };
  }
  const srcF = unitMapSiFactor(q.u);
  const tgtF = unitMapSiFactor(targetUmap);
  return {
    v: q.v * srcF / tgtF,
    u: targetUmap
  };
}
function lex(src) {
  const out = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (/\d/.test(ch) || ch === "." && /\d/.test(src[i + 1] ?? "")) {
      let s = "";
      while (i < src.length && /[\d.]/.test(src[i])) s += src[i++];
      if (i < src.length && /[eE]/.test(src[i])) {
        s += src[i++];
        if (i < src.length && /[+-]/.test(src[i])) s += src[i++];
        while (i < src.length && /\d/.test(src[i])) s += src[i++];
      }
      out.push({
        t: "NUM",
        v: s
      });
      continue;
    }
    if (/[a-zA-Z_]/.test(ch)) {
      let s = "";
      while (i < src.length && /\w/.test(src[i])) s += src[i++];
      out.push({
        t: "ID",
        v: s
      });
      continue;
    }
    if (ch === ",") {
      out.push({
        t: "COMMA",
        v: ","
      });
      i++;
      continue;
    }
    if (ch === "=") {
      if (src[i + 1] === "=") {
        out.push({
          t: "EQ",
          v: "=="
        });
        i += 2;
      } else {
        out.push({
          t: "EQ",
          v: "="
        });
        i++;
      }
      continue;
    }
    if (ch === "!" && src[i + 1] === "=") {
      out.push({
        t: "NEQ",
        v: "!="
      });
      i += 2;
      continue;
    }
    if (ch === "<") {
      if (src[i + 1] === ">") {
        out.push({
          t: "NEQ",
          v: "<>"
        });
        i += 2;
      } else if (src[i + 1] === "=") {
        out.push({
          t: "LEQ",
          v: "<="
        });
        i += 2;
      } else {
        out.push({
          t: "LT",
          v: "<"
        });
        i++;
      }
      continue;
    }
    if (ch === ">") {
      if (src[i + 1] === "=") {
        out.push({
          t: "GEQ",
          v: ">="
        });
        i += 2;
      } else {
        out.push({
          t: "GT",
          v: ">"
        });
        i++;
      }
      continue;
    }
    const ops = {
      "+": "PLUS",
      "-": "MINUS",
      "*": "STAR",
      "/": "SLASH",
      "^": "CARET",
      "(": "LPAREN",
      ")": "RPAREN"
    };
    if (ops[ch]) {
      out.push({
        t: ops[ch],
        v: ch
      });
      i++;
      continue;
    }
    throw new Error(`Unknown character: '${ch}'`);
  }
  out.push({
    t: "EOF",
    v: ""
  });
  return out;
}
function _gamma(z) {
  if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * _gamma(1 - z));
  z -= 1;
  const g = 7;
  const c = [
    0.9999999999998099,
    676.5203681218851,
    -1259.1392167224028,
    771.3234287776531,
    -176.6150291621406,
    12.507343278686905,
    -0.13857109526572012,
    9984369578019572e-21,
    15056327351493116e-23
  ];
  let x = c[0];
  for (let i = 1; i < g + 2; i++) x += c[i] / (z + i);
  const t = z + g + 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}
function _erf(x) {
  const sign = x >= 0 ? 1 : -1;
  x = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * x);
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return sign * y;
}
var MATH_FN = {
  // Basic trig
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  // Hyperbolic trig
  sinh: Math.sinh,
  cosh: Math.cosh,
  tanh: Math.tanh,
  asinh: Math.asinh,
  acosh: Math.acosh,
  atanh: Math.atanh,
  // Exponential / logarithmic
  exp: Math.exp,
  expm1: Math.expm1,
  log: Math.log,
  log2: Math.log2,
  log10: Math.log10,
  log1p: Math.log1p,
  // Angle conversion
  degrees: (x) => x * (180 / Math.PI),
  radians: (x) => x * (Math.PI / 180),
  // Sign / logic
  sign: Math.sign,
  // Statistical
  erf: _erf,
  erfc: (x) => 1 - _erf(x),
  gamma: _gamma,
  lgamma: (x) => Math.log(Math.abs(_gamma(x))),
  factorial: (n) => {
    if (n < 0 || !Number.isInteger(n)) throw new Error("factorial requires a non-negative integer");
    if (n > 170) return Infinity;
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
  }
};
var PRESERVE_FN = {
  abs: Math.abs,
  floor: Math.floor,
  ceil: Math.ceil,
  round: Math.round,
  trunc: Math.trunc
};
var CONST = {
  pi: Math.PI,
  e: Math.E,
  tau: 2 * Math.PI
};
var CMP_OPS = [
  "EQ",
  "NEQ",
  "LT",
  "GT",
  "LEQ",
  "GEQ"
];
var Parser = class {
  toks;
  scope;
  fnScope;
  pos;
  constructor(toks, scope, fnScope = {}) {
    this.toks = toks;
    this.scope = scope;
    this.fnScope = fnScope;
    this.pos = 0;
  }
  peek() {
    return this.toks[this.pos];
  }
  eat() {
    return this.toks[this.pos++];
  }
  need(t) {
    const tok = this.eat();
    if (tok.t !== t) throw new Error(`Expected ${t}, got '${tok.v}'`);
    return tok;
  }
  // Top-level: comparison (returns 0 or 1) or plain arithmetic
  compare() {
    const q = this.arithmetic();
    if (CMP_OPS.includes(this.peek().t)) {
      const op = this.eat().t;
      const r = this.arithmetic();
      let result;
      const EPS = 1e-12;
      switch (op) {
        case "EQ":
          result = Math.abs(q.v - r.v) <= EPS * (Math.abs(q.v) + Math.abs(r.v) + 1);
          break;
        case "NEQ":
          result = Math.abs(q.v - r.v) > EPS * (Math.abs(q.v) + Math.abs(r.v) + 1);
          break;
        case "LT":
          result = q.v < r.v;
          break;
        case "GT":
          result = q.v > r.v;
          break;
        case "LEQ":
          result = q.v <= r.v;
          break;
        case "GEQ":
          result = q.v >= r.v;
          break;
        default:
          result = false;
      }
      return {
        v: result ? 1 : 0,
        u: {}
      };
    }
    return q;
  }
  arithmetic() {
    let q = this.addend();
    while (this.peek().t === "PLUS" || this.peek().t === "MINUS") {
      const op = this.eat().t;
      const r = this.addend();
      const u = addU(q.u, r.u);
      q = {
        v: op === "PLUS" ? q.v + r.v : q.v - r.v,
        u
      };
    }
    return q;
  }
  addend() {
    let q = this.power();
    while (this.peek().t === "STAR" || this.peek().t === "SLASH") {
      const op = this.eat().t;
      const r = this.power();
      q = op === "STAR" ? {
        v: q.v * r.v,
        u: mulU(q.u, r.u)
      } : {
        v: q.v / r.v,
        u: divU(q.u, r.u)
      };
    }
    return q;
  }
  power() {
    const base = this.unary();
    if (this.peek().t === "CARET") {
      this.eat();
      const exp2 = this.power();
      if (Object.keys(exp2.u).length > 0) {
        throw new Error(`Exponent must be dimensionless (got ${formatUnit(exp2.u)})`);
      }
      return {
        v: Math.pow(base.v, exp2.v),
        u: powU(base.u, exp2.v)
      };
    }
    return base;
  }
  unary() {
    if (this.peek().t === "MINUS") {
      this.eat();
      const q = this.unary();
      return {
        v: -q.v,
        u: q.u
      };
    }
    return this.atom();
  }
  atom() {
    const tok = this.peek();
    if (tok.t === "NUM") {
      this.eat();
      return {
        v: parseFloat(tok.v),
        u: {}
      };
    }
    if (tok.t === "LPAREN") {
      this.eat();
      const q = this.compare();
      this.need("RPAREN");
      return q;
    }
    if (tok.t === "ID") {
      this.eat();
      const name = tok.v;
      if (this.peek().t === "LPAREN") {
        this.eat();
        const args = [];
        if (this.peek().t !== "RPAREN") {
          args.push(this.compare());
          while (this.peek().t === "COMMA") {
            this.eat();
            args.push(this.compare());
          }
        }
        this.need("RPAREN");
        if (args.length === 1) {
          const arg = args[0];
          if (name === "not") return {
            v: arg.v === 0 ? 1 : 0,
            u: {}
          };
          if (name === "sqrt") {
            return {
              v: Math.sqrt(arg.v),
              u: powU(arg.u, 0.5)
            };
          }
          if (name === "cbrt") {
            return {
              v: Math.cbrt(arg.v),
              u: powU(arg.u, 1 / 3)
            };
          }
          if (PRESERVE_FN[name]) {
            return {
              v: PRESERVE_FN[name](arg.v),
              u: arg.u
            };
          }
          if (MATH_FN[name]) {
            if (Object.keys(arg.u).length > 0) {
              throw new Error(`${name}() requires dimensionless argument, got ${formatUnit(arg.u)}`);
            }
            return {
              v: MATH_FN[name](arg.v),
              u: {}
            };
          }
          if (name in this.fnScope) {
            const fn = this.fnScope[name];
            const innerScope = {
              ...this.scope,
              [fn.param]: arg
            };
            let result = evalExpr(fn.expr, innerScope, this.fnScope);
            if (fn.targetUnit) result = applyTargetUnit(result, fn.targetUnit);
            return result;
          }
        }
        if (args.length === 2) {
          const [a, b] = args;
          if (name === "and") return {
            v: a.v !== 0 && b.v !== 0 ? 1 : 0,
            u: {}
          };
          if (name === "or") return {
            v: a.v !== 0 || b.v !== 0 ? 1 : 0,
            u: {}
          };
          if (name === "xor") return {
            v: a.v !== 0 !== (b.v !== 0) ? 1 : 0,
            u: {}
          };
          if (name === "min") return {
            v: Math.min(a.v, b.v),
            u: addU(a.u, b.u)
          };
          if (name === "max") return {
            v: Math.max(a.v, b.v),
            u: addU(a.u, b.u)
          };
          if (name === "atan2") {
            if (Object.keys(a.u).length > 0 || Object.keys(b.u).length > 0) {
              throw new Error("atan2() requires dimensionless arguments");
            }
            return {
              v: Math.atan2(a.v, b.v),
              u: {}
            };
          }
          if (name === "mod") return {
            v: (a.v % b.v + b.v) % b.v,
            u: {}
          };
          if (name === "pow") {
            if (Object.keys(b.u).length > 0) {
              throw new Error("pow() exponent must be dimensionless");
            }
            return {
              v: Math.pow(a.v, b.v),
              u: powU(a.u, b.v)
            };
          }
          if (name === "hypot") {
            if (Object.keys(a.u).length > 0 || Object.keys(b.u).length > 0) {
              throw new Error("hypot() requires dimensionless arguments");
            }
            return {
              v: Math.hypot(a.v, b.v),
              u: {}
            };
          }
          if (name === "comb") {
            if (Object.keys(a.u).length > 0 || Object.keys(b.u).length > 0) {
              throw new Error("comb() requires dimensionless arguments");
            }
            const n = a.v, k = b.v;
            if (!Number.isInteger(n) || !Number.isInteger(k) || n < 0 || k < 0 || k > n) {
              throw new Error("comb(n,k) requires non-negative integers with k \u2264 n");
            }
            let r = 1;
            for (let i = 0; i < k; i++) r = r * (n - i) / (i + 1);
            return {
              v: Math.round(r),
              u: {}
            };
          }
          if (name === "perm") {
            if (Object.keys(a.u).length > 0 || Object.keys(b.u).length > 0) {
              throw new Error("perm() requires dimensionless arguments");
            }
            const n = a.v, k = b.v;
            if (!Number.isInteger(n) || !Number.isInteger(k) || n < 0 || k < 0 || k > n) {
              throw new Error("perm(n,k) requires non-negative integers with k \u2264 n");
            }
            let r = 1;
            for (let i = 0; i < k; i++) r *= n - i;
            return {
              v: r,
              u: {}
            };
          }
        }
        if (args.length === 3 && name === "if") {
          const [cond, thenVal, elseVal] = args;
          return cond.v !== 0 ? thenVal : elseVal;
        }
        if (args.length === 3 && name === "clamp") {
          const [x, lo, hi] = args;
          return {
            v: Math.min(Math.max(x.v, lo.v), hi.v),
            u: addU(x.u, addU(lo.u, hi.u))
          };
        }
        if (args.length === 1 && name in this.fnScope) {
          const fn = this.fnScope[name];
          const innerScope = {
            ...this.scope,
            [fn.param]: args[0]
          };
          let result = evalExpr(fn.expr, innerScope, this.fnScope);
          if (fn.targetUnit) result = applyTargetUnit(result, fn.targetUnit);
          return result;
        }
        throw new Error(`Unknown function or wrong argument count: ${name}(${args.length} args)`);
      }
      if (CONST[name] !== void 0) return {
        v: CONST[name],
        u: {}
      };
      if (this.scope[name] !== void 0) return this.scope[name];
      throw new Error(`Undefined: ${name}`);
    }
    throw new Error(`Unexpected token: '${tok.v}'`);
  }
};
function evalExpr(src, scope, fnScope = {}) {
  const toks = lex(src.trim());
  const p = new Parser(toks, scope, fnScope);
  const q = p.compare();
  if (p.peek().t !== "EOF") throw new Error("Unexpected input after expression");
  return q;
}
function evalStatements(src, scope, fnScope = {}) {
  const results = [];
  for (const raw of src.split(";")) {
    const s = raw.trim();
    if (!s) continue;
    let targetUnit;
    let stmt = s;
    const targetMatch = s.match(/\[\[([^\]]+)\]\]\s*$/);
    if (targetMatch) {
      targetUnit = parseUnitExpr(targetMatch[1]);
      stmt = s.slice(0, targetMatch.index).trim();
    }
    let tagUnit;
    const unitMatch = stmt.match(/\[([^\]]+)\]\s*$/);
    if (unitMatch) {
      tagUnit = parseUnitExpr(unitMatch[1]);
      stmt = stmt.slice(0, unitMatch.index).trim();
    }
    const fnDefMatch = stmt.match(/^([a-zA-Z_]\w*)\s*\(([a-zA-Z_]\w*)\)\s*=\s*(.+)$/);
    if (fnDefMatch) {
      const [, fnName, param, fnExpr] = fnDefMatch;
      fnScope[fnName] = {
        param,
        expr: fnExpr.trim(),
        ...targetUnit && {
          targetUnit
        }
      };
      results.push({
        raw: s,
        name: fnName,
        expr: fnExpr.trim(),
        value: NaN,
        unit: {},
        isFn: true,
        fnParam: param
      });
      continue;
    }
    const eqIdx = stmt.indexOf("=");
    if (eqIdx > 0) {
      const name = stmt.slice(0, eqIdx).trim();
      const expr = stmt.slice(eqIdx + 1).trim();
      if (/^[a-zA-Z_]\w*$/.test(name)) {
        try {
          let q = evalExpr(expr, scope, fnScope);
          if (tagUnit !== void 0) q = {
            v: q.v,
            u: tagUnit
          };
          if (targetUnit !== void 0) q = applyTargetUnit(q, targetUnit);
          scope[name] = q;
          results.push({
            raw: s,
            name,
            expr,
            value: q.v,
            unit: q.u
          });
        } catch (e) {
          results.push({
            raw: s,
            name,
            expr,
            value: NaN,
            unit: {},
            error: e.message
          });
        }
        continue;
      }
    }
    try {
      let q = evalExpr(stmt, scope, fnScope);
      if (tagUnit !== void 0) q = {
        v: q.v,
        u: tagUnit
      };
      if (targetUnit !== void 0) q = applyTargetUnit(q, targetUnit);
      results.push({
        raw: s,
        name: "",
        expr: stmt,
        value: q.v,
        unit: q.u
      });
    } catch (e) {
      results.push({
        raw: s,
        name: "",
        expr: stmt,
        value: NaN,
        unit: {},
        error: e.message
      });
    }
  }
  return results;
}
function parseRowsToAST(rows, start2, stopTypes) {
  const nodes = [];
  let i = start2;
  while (i < rows.length) {
    const row = rows[i];
    const rt = row.type;
    if (!rt) {
      nodes.push({
        kind: "stmt",
        rowIdx: i
      });
      i++;
    } else if (rt === "if") {
      const ifNode = {
        kind: "if",
        rowIdx: i,
        branches: [
          {
            condRowIdx: i,
            cond: row.e,
            body: []
          }
        ],
        elseBody: null,
        elseRowIdx: null,
        endRowIdx: null
      };
      i++;
      const thenResult = parseRowsToAST(rows, i, [
        "elseif",
        "else",
        "end"
      ]);
      ifNode.branches[0].body = thenResult.nodes;
      i = thenResult.next;
      while (i < rows.length && rows[i].type === "elseif") {
        const elifRowIdx = i;
        const elifCond = rows[i].e;
        i++;
        const elifResult = parseRowsToAST(rows, i, [
          "elseif",
          "else",
          "end"
        ]);
        ifNode.branches.push({
          condRowIdx: elifRowIdx,
          cond: elifCond,
          body: elifResult.nodes
        });
        i = elifResult.next;
      }
      if (i < rows.length && rows[i].type === "else") {
        ifNode.elseRowIdx = i;
        i++;
        const elseResult = parseRowsToAST(rows, i, [
          "end"
        ]);
        ifNode.elseBody = elseResult.nodes;
        i = elseResult.next;
      }
      if (i < rows.length && rows[i].type === "end") {
        ifNode.endRowIdx = i;
        i++;
      }
      nodes.push(ifNode);
    } else if (rt === "for") {
      const forNode = {
        kind: "for",
        rowIdx: i,
        body: [],
        endRowIdx: null
      };
      i++;
      const bodyResult = parseRowsToAST(rows, i, [
        "end"
      ]);
      forNode.body = bodyResult.nodes;
      i = bodyResult.next;
      if (i < rows.length && rows[i].type === "end") {
        forNode.endRowIdx = i;
        i++;
      }
      nodes.push(forNode);
    } else if (stopTypes.includes(rt)) {
      break;
    } else {
      nodes.push({
        kind: "stmt",
        rowIdx: i
      });
      i++;
    }
  }
  return {
    nodes,
    next: i
  };
}
function parseForHeader(header, scope, fnScope) {
  let mainPart = header.trim();
  let stepExpr;
  const stepMatch = mainPart.match(/^(.*)\s+step\s+([^\s].*)$/i);
  if (stepMatch) {
    mainPart = stepMatch[1].trim();
    stepExpr = stepMatch[2].trim();
  }
  const toIdx = mainPart.lastIndexOf(" to ");
  if (toIdx < 0) throw new Error(`for loop header missing 'to': "${header}"`);
  const lhs = mainPart.slice(0, toIdx).trim();
  const endExpr = mainPart.slice(toIdx + 4).trim();
  const eqIdx = lhs.indexOf("=");
  if (eqIdx < 0) throw new Error(`for loop header missing '=': "${header}"`);
  const varName = lhs.slice(0, eqIdx).trim();
  if (!/^[a-zA-Z_]\w*$/.test(varName)) {
    throw new Error(`Invalid loop variable: "${varName}"`);
  }
  const startExpr = lhs.slice(eqIdx + 1).trim();
  const startVal = evalExpr(startExpr, scope, fnScope).v;
  const endVal = evalExpr(endExpr, scope, fnScope).v;
  const stepVal = stepExpr ? evalExpr(stepExpr, scope, fnScope).v : endVal >= startVal ? 1 : -1;
  if (stepVal === 0) throw new Error("for loop step cannot be zero");
  return {
    varName,
    startVal,
    endVal,
    stepVal
  };
}
var MAX_LOOP_ITER = 1e4;
function execNodes(nodes, rows, scope, fnScope, results, active) {
  for (const node of nodes) {
    if (node.kind === "stmt") {
      const row = rows[node.rowIdx];
      if (!active || !row.e.trim()) {
        results[node.rowIdx] = {
          raw: row.e,
          name: "",
          expr: row.e,
          value: NaN,
          unit: {},
          active
        };
        continue;
      }
      const stmts = evalStatements(row.e, scope, fnScope);
      results[node.rowIdx] = {
        ...stmts[0] ?? {
          raw: row.e,
          name: "",
          expr: row.e,
          value: NaN,
          unit: {}
        },
        active: true
      };
    } else if (node.kind === "if") {
      let branchTaken = false;
      for (const branch of node.branches) {
        let condVal = 0;
        let condError;
        if (active) {
          try {
            condVal = evalExpr(branch.cond || "0", scope, fnScope).v;
          } catch (e) {
            condError = e.message;
          }
        }
        const taken = active && !branchTaken && condVal !== 0 && !condError;
        results[branch.condRowIdx] = {
          raw: branch.cond,
          name: "",
          expr: branch.cond,
          value: condVal,
          unit: {},
          rowType: branch.condRowIdx === node.rowIdx ? "if" : "elseif",
          active,
          condValue: condVal,
          error: condError
        };
        execNodes(branch.body, rows, scope, fnScope, results, taken);
        if (taken) branchTaken = true;
      }
      if (node.elseRowIdx !== null) {
        const elseTaken = active && !branchTaken;
        results[node.elseRowIdx] = {
          raw: "else",
          name: "",
          expr: "",
          value: NaN,
          unit: {},
          rowType: "else",
          active,
          condValue: elseTaken ? 1 : 0
        };
        execNodes(node.elseBody, rows, scope, fnScope, results, elseTaken);
      }
      if (node.endRowIdx !== null) {
        results[node.endRowIdx] = {
          raw: "end",
          name: "",
          expr: "",
          value: NaN,
          unit: {},
          rowType: "end",
          active
        };
      }
    } else if (node.kind === "for") {
      const row = rows[node.rowIdx];
      let iterCount = 0;
      let forError;
      if (active) {
        try {
          const { varName, startVal, endVal, stepVal } = parseForHeader(row.e, scope, fnScope);
          const dir = stepVal > 0 ? 1 : -1;
          const eps = Math.abs(stepVal) * 1e-9;
          let val = startVal;
          while (dir > 0 ? val <= endVal + eps : val >= endVal - eps) {
            if (iterCount >= MAX_LOOP_ITER) {
              forError = `Loop limit (${MAX_LOOP_ITER}) reached`;
              break;
            }
            scope[varName] = {
              v: val,
              u: {}
            };
            execNodes(node.body, rows, scope, fnScope, results, true);
            val += stepVal;
            iterCount++;
          }
        } catch (e) {
          forError = e.message;
          execNodes(node.body, rows, scope, fnScope, results, false);
        }
      } else {
        execNodes(node.body, rows, scope, fnScope, results, false);
      }
      results[node.rowIdx] = {
        raw: row.e,
        name: "",
        expr: row.e,
        value: iterCount,
        unit: {},
        rowType: "for",
        active,
        error: forError
      };
      if (node.endRowIdx !== null) {
        results[node.endRowIdx] = {
          raw: "end",
          name: "",
          expr: "",
          value: NaN,
          unit: {},
          rowType: "end",
          active
        };
      }
    }
  }
}
function evalFormulaRows(rows, scope, fnScope = {}) {
  const results = rows.map((r) => ({
    raw: r.e,
    name: "",
    expr: r.e,
    value: NaN,
    unit: {},
    active: false
  }));
  if (rows.length === 0) return results;
  const { nodes } = parseRowsToAST(rows, 0, []);
  execNodes(nodes, rows, scope, fnScope, results, true);
  return results;
}

// src/utils/markdown.ts
var GREEK_TABLE = [
  [
    /\bepsilon\b/g,
    "\u03B5"
  ],
  [
    /\bEpsilon\b/g,
    "\u03B5"
  ],
  [
    /\blambda\b/g,
    "\u03BB"
  ],
  [
    /\bLambda\b/g,
    "\u039B"
  ],
  [
    /\balpha\b/g,
    "\u03B1"
  ],
  [
    /\bAlpha\b/g,
    "\u03B1"
  ],
  [
    /\btheta\b/g,
    "\u03B8"
  ],
  [
    /\bTheta\b/g,
    "\u0398"
  ],
  [
    /\bdelta\b/g,
    "\u03B4"
  ],
  [
    /\bDelta\b/g,
    "\u0394"
  ],
  [
    /\bgamma\b/g,
    "\u03B3"
  ],
  [
    /\bGamma\b/g,
    "\u0393"
  ],
  [
    /\bomega\b/g,
    "\u03C9"
  ],
  [
    /\bOmega\b/g,
    "\u03A9"
  ],
  [
    /\bsigma\b/g,
    "\u03C3"
  ],
  [
    /\bSigma\b/g,
    "\u03A3"
  ],
  [
    /\bbeta\b/g,
    "\u03B2"
  ],
  [
    /\bBeta\b/g,
    "\u0392"
  ],
  [
    /\bphi\b/g,
    "\u03C6"
  ],
  [
    /\bPhi\b/g,
    "\u03A6"
  ],
  [
    /\bpsi\b/g,
    "\u03C8"
  ],
  [
    /\bPsi\b/g,
    "\u03A8"
  ],
  [
    /\bchi\b/g,
    "\u03C7"
  ],
  [
    /\bChi\b/g,
    "\u03A7"
  ],
  [
    /\bxi\b/g,
    "\u03BE"
  ],
  [
    /\bXi\b/g,
    "\u039E"
  ],
  [
    /\beta\b/g,
    "\u03B7"
  ],
  [
    /\bEta\b/g,
    "\u0397"
  ],
  [
    /\bmu\b/g,
    "\u03BC"
  ],
  [
    /\bMu\b/g,
    "\u039C"
  ],
  [
    /\bnu\b/g,
    "\u03BD"
  ],
  [
    /\bNu\b/g,
    "\u039D"
  ],
  [
    /\brho\b/g,
    "\u03C1"
  ],
  [
    /\bRho\b/g,
    "\u03A1"
  ],
  [
    /\btau\b/g,
    "\u03C4"
  ],
  [
    /\bTau\b/g,
    "\u03A4"
  ],
  [
    /\bpi\b/g,
    "\u03C0"
  ],
  [
    /\bPi\b/g,
    "\u03A0"
  ]
];
function sanitizeUrl(url) {
  const t = url.trim();
  return /^javascript:/i.test(t) ? "#" : t;
}
function topLevelIdx(s, ch) {
  let depth = 0;
  for (let i = 0; i <= s.length - ch.length; i++) {
    if (s[i] === "(") depth++;
    else if (s[i] === ")") depth--;
    else if (depth === 0 && s.slice(i, i + ch.length) === ch) return i;
  }
  return -1;
}
function stripOuter(s) {
  s = s.trim();
  if (!s.startsWith("(") || !s.endsWith(")")) return s;
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "(") depth++;
    else if (s[i] === ")") {
      depth--;
      if (depth === 0 && i < s.length - 1) return s;
    }
  }
  return s.slice(1, -1).trim();
}
function findAssignmentIdx(s) {
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "(") depth++;
    else if (s[i] === ")") depth--;
    else if (depth === 0 && s[i] === "=") {
      if (i > 0 && /[<>!=]/.test(s[i - 1])) continue;
      if (i + 1 < s.length && s[i + 1] === "=") continue;
      return i;
    }
  }
  return -1;
}
function transformUnit(raw) {
  let s = raw.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  s = s.replace(/\^(\d+)/g, "<sup>$1</sup>");
  s = s.replace(/\^([A-Za-z])\b/g, "<sup>$1</sup>");
  s = s.replace(/\s*\*\s*/g, " \xB7 ");
  return s;
}
function transformPiece(raw) {
  let s = raw.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  s = s.replace(/\bsqrt\s*\(/g, "\u221A(");
  s = s.replace(/\b([A-Za-z][A-Za-z0-9]*)((?:_[A-Za-z0-9]+)+)\b/g, (_m, base, subs) => {
    let baseHtml = base;
    for (const [re, sym] of GREEK_TABLE) baseHtml = baseHtml.replace(re, sym);
    const subParts = subs.split("_").filter(Boolean).join(",");
    return `${baseHtml}<sub>${subParts}</sub>`;
  });
  for (const [re, sym] of GREEK_TABLE) s = s.replace(re, sym);
  s = s.replace(/\^(\d+)/g, "<sup>$1</sup>");
  s = s.replace(/\^([A-Za-z])\b/g, "<sup>$1</sup>");
  s = s.replace(/\s*\*\s*/g, " \xB7 ");
  return s;
}
function renderExpr(raw) {
  const s = stripOuter(raw.trim());
  if (!s) return "";
  const addSplits = [];
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "(") depth++;
    else if (s[i] === ")") depth--;
    else if (depth === 0 && i > 0 && (s[i] === "+" || s[i] === "-")) addSplits.push(i);
  }
  if (addSplits.length > 0) {
    let html = "";
    let start2 = 0;
    for (const idx of addSplits) {
      html += renderExpr(s.slice(start2, idx));
      html += ` ${s[idx]} `;
      start2 = idx + 1;
    }
    html += renderExpr(s.slice(start2));
    return html;
  }
  const divIdx = topLevelIdx(s, "/");
  if (divIdx >= 0) {
    const numStr = s.slice(0, divIdx).trim();
    const denStr = s.slice(divIdx + 1).trim();
    const num = stripOuter(numStr);
    const mulIdx = topLevelIdx(denStr, "*");
    if (mulIdx < 0) {
      const den = stripOuter(denStr);
      return `<span class="frac"><span>${renderExpr(num)}</span><span>${renderExpr(den)}</span></span>`;
    }
    const pureDen = stripOuter(denStr.slice(0, mulIdx).trim());
    if (pureDen) {
      const trailing = denStr.slice(mulIdx + 1).trim();
      const fracHtml = `<span class="frac"><span>${renderExpr(num)}</span><span>${renderExpr(pureDen)}</span></span>`;
      return fracHtml + (trailing ? " \xB7 " + renderExpr(trailing) : "");
    }
  }
  const mulSplits = [];
  depth = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "(") depth++;
    else if (s[i] === ")") depth--;
    else if (depth === 0 && s[i] === "*") mulSplits.push(i);
  }
  if (mulSplits.length > 0) {
    const pieces = [];
    let start2 = 0;
    for (const idx of mulSplits) {
      pieces.push(s.slice(start2, idx).trim());
      start2 = idx + 1;
    }
    pieces.push(s.slice(start2).trim());
    return pieces.map((piece) => {
      const stripped = stripOuter(piece);
      return stripped !== piece ? "(" + renderExpr(stripped) + ")" : transformPiece(piece);
    }).join(" \xB7 ");
  }
  return transformPiece(s);
}
function prettifyExpr(src) {
  const raw = src.trim();
  if (!raw) return "";
  let targetUnitHtml = "";
  const targetMatch = raw.match(/\[\[([^\]]+)\]\]\s*$/);
  const afterTarget = targetMatch ? raw.slice(0, targetMatch.index).trim() : raw;
  if (targetMatch) {
    targetUnitHtml = ` <span class="fp-unit fp-unit-target">\u2192 ${transformUnit(targetMatch[1])}</span>`;
  }
  let unitHtml = "";
  const unitMatch = afterTarget.match(/\[([^\]]+)\]\s*$/);
  const body = unitMatch ? afterTarget.slice(0, unitMatch.index).trim() : afterTarget;
  if (unitMatch) {
    unitHtml = ` <span class="fp-unit">${transformUnit(unitMatch[1])}</span>`;
  }
  let lhsHtml = "";
  let rhsRaw = body;
  const eqIdx = findAssignmentIdx(body);
  if (eqIdx > 0) {
    const lhs = body.slice(0, eqIdx).trim();
    rhsRaw = body.slice(eqIdx + 1).trim();
    lhsHtml = (/^[A-Za-z_]\w*$/.test(lhs) ? transformPiece(lhs) : renderExpr(lhs)) + ' <span class="fp-eq">=</span> ';
  }
  const rhsHtml = renderExpr(rhsRaw);
  return lhsHtml + rhsHtml + unitHtml + targetUnitHtml;
}
function renderInlineMd(src) {
  if (!src) return "";
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const spans = [];
  const p = src.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, url) => {
    spans.push(`<img src="${sanitizeUrl(url)}" alt="${esc(alt)}" class="md-img">`);
    return `\0${spans.length - 1}\0`;
  }).replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, href) => {
    spans.push(`<a href="${sanitizeUrl(href)}" target="_blank" rel="noopener noreferrer">${esc(text)}</a>`);
    return `\0${spans.length - 1}\0`;
  }).replace(/`([^`]+)`/g, (_, c) => {
    spans.push(`<code>${esc(c)}</code>`);
    return `\0${spans.length - 1}\0`;
  }).replace(/\$([^$\n]+?)\$/g, (_, m) => {
    const html = prettifyExpr(m);
    spans.push(`<span class="md-math">${html || esc(m)}</span>`);
    return `\0${spans.length - 1}\0`;
  });
  const r = esc(p).replace(/\*{3}(.+?)\*{3}/g, "<strong><em>$1</em></strong>").replace(/\*{2}(.+?)\*{2}/g, "<strong>$1</strong>").replace(/_{2}(.+?)_{2}/g, "<strong>$1</strong>").replace(/\*([^*\n]+?)\*/g, "<em>$1</em>").replace(/_([^_\n]+?)_/g, "<em>$1</em>");
  return r.replace(/\x00(\d+)\x00/g, (_, i) => spans[parseInt(i)]).replace(/\n/g, "<br>");
}
function parseEqTag(line) {
  const m = line.match(/#([\w-]*)(?::([\w. +-]+))?\s*$/);
  if (!m) return {
    label: null,
    display: null,
    exprEnd: line.length
  };
  const label = m[1] || null;
  const display = m[2]?.trim() || null;
  return {
    label,
    display,
    exprEnd: m.index
  };
}
function collectEqLabels(src) {
  const map = /* @__PURE__ */ new Map();
  let counter = 0;
  let inMath = false;
  for (const line of src.split("\n")) {
    const isSingle = /^\$\$.+\$\$\s*$/.test(line);
    if (!isSingle && line.trim() === "$$") {
      inMath = !inMath;
      continue;
    }
    if (!isSingle && !inMath) continue;
    const raw = isSingle ? line.replace(/^\$\$/, "").replace(/\$\$$/, "") : line;
    if (!raw.trim()) continue;
    const { label, display } = parseEqTag(raw);
    const displayStr = display ?? String(++counter);
    if (label) map.set(label, displayStr);
    else if (!display) counter++;
  }
  return map;
}
function renderMarkdown(src) {
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const eqLabels = collectEqLabels(src);
  let eqCounter = 0;
  function eqRow(raw) {
    const { label, display, exprEnd } = parseEqTag(raw.trim());
    const expr = raw.trim().slice(0, exprEnd).trim();
    const displayStr = display !== null ? display : String(++eqCounter);
    const numCell = `<span class="eq-num">[eq ${esc(displayStr)}]</span>`;
    const html = prettifyExpr(expr);
    const idAttr = label ? ` id="eq-${esc(label)}"` : "";
    return `<div class="eq-row"><span></span><span class="md-math"${idAttr}>${html || esc(expr)}</span>${numCell}</div>`;
  }
  function inline(s) {
    const spans = [];
    const p = s.replace(/\(#([\w-]+)\)/g, (_, label) => {
      const n = eqLabels.get(label);
      const inner = n !== void 0 ? `<a class="eq-ref" href="#eq-${esc(label)}">[eq ${esc(n)}]</a>` : `<span class="eq-ref eq-ref-missing">[eq ?]</span>`;
      spans.push(inner);
      return `\0${spans.length - 1}\0`;
    }).replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, url) => {
      spans.push(`<img src="${sanitizeUrl(url)}" alt="${esc(alt)}" class="md-img">`);
      return `\0${spans.length - 1}\0`;
    }).replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, href) => {
      spans.push(`<a href="${sanitizeUrl(href)}" target="_blank" rel="noopener noreferrer">${esc(text)}</a>`);
      return `\0${spans.length - 1}\0`;
    }).replace(/`([^`]+)`/g, (_, c) => {
      spans.push(`<code>${esc(c)}</code>`);
      return `\0${spans.length - 1}\0`;
    }).replace(/\$([^$\n]+?)\$/g, (_, m) => {
      const html = prettifyExpr(m);
      spans.push(`<span class="md-math">${html || esc(m)}</span>`);
      return `\0${spans.length - 1}\0`;
    });
    const r = esc(p).replace(/\*{3}(.+?)\*{3}/g, "<strong><em>$1</em></strong>").replace(/\*{2}(.+?)\*{2}/g, "<strong>$1</strong>").replace(/_{2}(.+?)_{2}/g, "<strong>$1</strong>").replace(/\*([^*\n]+?)\*/g, "<em>$1</em>").replace(/_([^_\n]+?)_/g, "<em>$1</em>");
    return r.replace(/\x00(\d+)\x00/g, (_, i) => spans[parseInt(i)]);
  }
  const lines = src.split("\n");
  const out = [];
  let inPre = false, preLang = "";
  let inMath = false;
  let lineIdx = -1;
  const mathLines = [];
  const listStack = [];
  const para = [];
  const bqLines = [];
  function flushPara() {
    if (!para.length) return;
    out.push(`<p>${para.map(inline).join("<br>")}</p>`);
    para.length = 0;
  }
  function flushBq() {
    if (!bqLines.length) return;
    out.push(`<blockquote>${bqLines.map((l) => `<p>${inline(l)}</p>`).join("\n")}</blockquote>`);
    bqLines.length = 0;
  }
  function closeListsToIndent(targetIndent) {
    while (listStack.length > 0 && listStack[listStack.length - 1].indent >= targetIndent) {
      const top = listStack.pop();
      out.push(top.type === "ul" ? "</ul>" : "</ol>");
    }
  }
  function closeAllLists() {
    closeListsToIndent(-1);
  }
  function flushAll() {
    flushPara();
    flushBq();
    closeAllLists();
  }
  for (const line of lines) {
    lineIdx++;
    if (!inMath && line.startsWith("```")) {
      if (inPre) {
        out.push("</code></pre>");
        inPre = false;
        preLang = "";
      } else {
        flushAll();
        preLang = line.slice(3).trim();
        out.push(`<pre><code${preLang ? ` class="lang-${esc(preLang)}"` : ""}>`);
        inPre = true;
      }
      continue;
    }
    if (inPre) {
      out.push(esc(line));
      continue;
    }
    const singleMath = line.match(/^\$\$(.+)\$\$\s*$/);
    if (singleMath) {
      flushAll();
      out.push(`<div class="md-math-block">${eqRow(singleMath[1].trim())}</div>`);
      continue;
    }
    if (line.trim() === "$$") {
      if (inMath) {
        const rows = mathLines.filter((l) => l.trim()).map(eqRow).join("");
        out.push(`<div class="md-math-block">${rows}</div>`);
        mathLines.length = 0;
        inMath = false;
      } else {
        flushAll();
        inMath = true;
      }
      continue;
    }
    if (inMath) {
      mathLines.push(line);
      continue;
    }
    if (line.startsWith("> ") || line === ">") {
      flushPara();
      closeAllLists();
      bqLines.push(line.startsWith("> ") ? line.slice(2) : "");
      continue;
    }
    flushBq();
    const hm = line.match(/^(#{1,4})\s+(.+)$/);
    if (hm) {
      flushPara();
      closeAllLists();
      out.push(`<h${hm[1].length}>${inline(hm[2])}</h${hm[1].length}>`);
      continue;
    }
    if (/^[-*=_]{3,}\s*$/.test(line)) {
      flushPara();
      closeAllLists();
      out.push("<hr>");
      continue;
    }
    const listMatch = line.match(/^(\s*)([-*+]|\d+\.|[a-zA-Z]\.)\s+(.*)$/);
    if (listMatch) {
      flushPara();
      const indent = listMatch[1].length;
      const marker = listMatch[2];
      const content = listMatch[3];
      let listType;
      let listTag;
      if (/^[-*+]$/.test(marker)) {
        listType = "ul";
        listTag = "<ul>";
      } else if (/^\d+\.$/.test(marker)) {
        listType = "ol";
        listTag = "<ol>";
      } else if (/^[a-z]\.$/.test(marker)) {
        listType = "ol";
        listTag = '<ol type="a">';
      } else {
        listType = "ol";
        listTag = '<ol type="A">';
      }
      closeListsToIndent(indent + 1);
      if (listStack.length === 0 || listStack[listStack.length - 1].indent < indent) {
        out.push(listTag);
        listStack.push({
          type: listType,
          tag: listTag,
          indent
        });
      } else if (listStack[listStack.length - 1].tag !== listTag) {
        const top = listStack.pop();
        out.push(top.type === "ul" ? "</ul>" : "</ol>");
        out.push(listTag);
        listStack.push({
          type: listType,
          tag: listTag,
          indent
        });
      }
      const taskMatch = listType === "ul" && content.match(/^\[([ xX])\]\s+(.*)$/);
      if (taskMatch) {
        const checked = taskMatch[1].toLowerCase() === "x";
        out.push(`<li class="task-item"><input type="checkbox" data-task-line="${lineIdx}"${checked ? " checked" : ""}> ${inline(taskMatch[2])}</li>`);
      } else {
        out.push(`<li>${inline(content)}</li>`);
      }
      continue;
    }
    if (line.trim() === "") {
      flushPara();
      closeAllLists();
      continue;
    }
    closeAllLists();
    para.push(line);
  }
  flushPara();
  flushBq();
  if (inMath) {
    const rows = mathLines.filter((l) => l.trim()).map(eqRow).join("");
    out.push(`<div class="md-math-block">${rows}</div>`);
  }
  if (inPre) out.push("</code></pre>");
  closeAllLists();
  return out.join("\n");
}

// src/blocks/formula.ts
var COMP_RE = /[<>]=?|[!=]=/;
function fmtNum(n) {
  if (!isFinite(n)) return String(n);
  if (Number.isInteger(n) && Math.abs(n) < 1e9) return n.toLocaleString();
  return parseFloat(n.toPrecision(6)).toString();
}
function expandDotNotation(expr) {
  return expr.replace(/\b([A-Za-z_]\w*)\.([A-Za-z_]\w*)\b/g, "$1__$2");
}
function parseFormulaRows(content) {
  try {
    const p = JSON.parse(content);
    if (Array.isArray(p) && (p.length === 0 || "e" in p[0])) {
      return p.map((r) => {
        const row = {
          e: String(r.e ?? ""),
          d: String(r.d ?? "")
        };
        if (r.type) row.type = r.type;
        if (r.ref) row.ref = String(r.ref);
        return row;
      });
    }
  } catch {
  }
  return content.split(";").map((s) => ({
    e: s.trim(),
    d: ""
  }));
}
function insertLineBreak() {
  const sel = globalThis.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const range = sel.getRangeAt(0);
  range.deleteContents();
  const br = document.createElement("br");
  range.insertNode(br);
  if (!br.nextSibling || br.nextSibling.nodeType === Node.TEXT_NODE && br.nextSibling.textContent === "") {
    const sentinel = document.createElement("br");
    br.after(sentinel);
    range.setStartBefore(sentinel);
  } else {
    range.setStartAfter(br);
  }
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
}
function serializeEditable(el) {
  function processNode(node) {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? "";
    const elem = node;
    if (elem.tagName === "BR") return "\n";
    if (elem.tagName === "DIV" || elem.tagName === "P") {
      const kids = Array.from(elem.childNodes);
      const isEmptyBlock = kids.length === 0 || kids.length === 1 && kids[0].tagName === "BR";
      return isEmptyBlock ? "" : kids.map(processNode).join("");
    }
    return Array.from(elem.childNodes).map(processNode).join("");
  }
  const children = Array.from(el.childNodes);
  const hasBlocks = children.some((n) => n instanceof HTMLElement && (n.tagName === "DIV" || n.tagName === "P"));
  if (hasBlocks) {
    const lines = [];
    for (const child of children) {
      if (child instanceof HTMLElement && (child.tagName === "DIV" || child.tagName === "P")) {
        lines.push(processNode(child));
      } else {
        if (lines.length === 0) lines.push("");
        lines[lines.length - 1] += processNode(child);
      }
    }
    return lines.join("\n");
  }
  return children.map(processNode).join("");
}
function applyEvalResults(formulaEl, stmts) {
  const rowEls = Array.from(formulaEl.querySelectorAll(".formula-row"));
  stmts.forEach((stmt, i) => {
    const rowEl = rowEls[i];
    if (rowEl) {
      rowEl.classList.toggle("formula-row--inactive", stmt.active === false && !stmt.rowType);
    }
    const r = formulaEl.querySelector(`[data-result="${i}"]`);
    if (!r) return;
    if (stmt.rowType === "if" || stmt.rowType === "elseif") {
      const taken = (stmt.condValue ?? 0) !== 0 && !stmt.error;
      if (stmt.error) {
        r.textContent = "err";
        r.title = stmt.error;
        r.className = "formula-result formula-error";
      } else {
        r.textContent = taken ? "\u25B6 true" : "\u25B7 false";
        r.title = "";
        r.className = `formula-result ${taken ? "formula-cond-true" : "formula-cond-false"}`;
      }
      return;
    }
    if (stmt.rowType === "else") {
      const taken = (stmt.condValue ?? 0) !== 0;
      r.textContent = taken ? "\u25B6" : "\u25B7";
      r.title = "";
      r.className = `formula-result ${taken ? "formula-cond-true" : "formula-cond-false"}`;
      return;
    }
    if (stmt.rowType === "end") {
      r.textContent = "";
      r.title = "";
      r.className = "formula-result";
      return;
    }
    if (stmt.rowType === "for") {
      if (stmt.error) {
        r.textContent = "err";
        r.title = stmt.error;
        r.className = "formula-result formula-error";
      } else {
        r.textContent = `${stmt.value}\xD7`;
        r.title = `${stmt.value} iteration${stmt.value !== 1 ? "s" : ""}`;
        r.className = "formula-result formula-loop-count";
      }
      return;
    }
    if (!stmt.active) {
      r.textContent = "\u2014";
      r.title = "inactive branch";
      r.className = "formula-result formula-inactive";
      return;
    }
    if (stmt.isFn) {
      r.textContent = "fn";
      r.title = `${stmt.name}(${stmt.fnParam}) \u2014 user-defined function`;
      r.className = "formula-result formula-fn";
    } else if (stmt.error) {
      r.textContent = "err";
      r.title = stmt.error;
      r.className = "formula-result formula-error";
    } else {
      const unitStr = formatUnit(stmt.unit);
      r.innerHTML = fmtNum(stmt.value) + (unitStr ? ` <span class="result-unit">${transformUnit(unitStr)}</span>` : "");
      r.title = "";
      r.className = "formula-result";
    }
  });
}
function reEvalAllFormulas() {
  if (!canvas) return;
  for (const k in globalScope) delete globalScope[k];
  for (const k in globalFnScope) delete globalFnScope[k];
  for (const [k, v] of Object.entries(state.constants)) globalScope[k] = {
    v,
    u: {}
  };
  const topLevelEls = [
    ...Array.from(canvas.domElement.querySelectorAll(".formula-block")).filter((el) => !childToSection.has(el.id)),
    ...Array.from(canvas.domElement.querySelectorAll(".section-block"))
  ].sort((a, b) => {
    const dy = parseInt(a.style.top) - parseInt(b.style.top);
    return dy !== 0 ? dy : parseInt(a.style.left) - parseInt(b.style.left);
  });
  for (const el of topLevelEls) {
    const block = state.blocks.find((b) => b.id === el.id);
    if (!block) continue;
    if (block.type === "section") {
      const prefix = (block.sectionName || "section1") + "__";
      const sectionScope = {
        ...globalScope
      };
      const sectionFnScope = {
        ...globalFnScope
      };
      const sectionAliasKeys = /* @__PURE__ */ new Set();
      for (const [k, v] of Object.entries(globalScope)) {
        if (k.startsWith(prefix)) {
          const bare = k.slice(prefix.length);
          sectionScope[bare] = v;
          sectionAliasKeys.add(bare);
        }
      }
      const preKeys = new Set(Object.keys(sectionScope));
      const content = el.querySelector(".section-content");
      const childFormulaEls = content ? Array.from(content.querySelectorAll(".formula-block")).filter((cel) => childToSection.get(cel.id) === el.id).sort((a, b) => {
        const dy = parseInt(a.style.top) - parseInt(b.style.top);
        return dy !== 0 ? dy : parseInt(a.style.left) - parseInt(b.style.left);
      }) : [];
      const summaryVars = /* @__PURE__ */ new Set();
      const summaryComps = [];
      for (const cel of childFormulaEls) {
        const cBlock = state.blocks.find((b) => b.id === cel.id);
        if (!cBlock) continue;
        const rows = parseFormulaRows(cBlock.content).map((r) => ({
          ...r,
          e: expandDotNotation(r.e)
        }));
        const stmts = evalFormulaRows(rows, sectionScope, sectionFnScope);
        applyEvalResults(cel, stmts);
        if (cBlock.type === "summary") {
          for (const stmt of stmts) {
            if (!stmt.active || stmt.rowType) continue;
            if (stmt.name && !stmt.error) {
              summaryVars.add(stmt.name);
            } else if (!stmt.name && !stmt.error && COMP_RE.test(stmt.expr)) {
              summaryComps.push({
                expr: stmt.raw,
                pass: stmt.value !== 0
              });
            } else if (!stmt.name && !stmt.error && /^[a-zA-Z_]\w*$/.test(stmt.expr.trim())) {
              summaryVars.add(stmt.expr.trim());
            } else if (COMP_RE.test(stmt.raw)) {
              try {
                const result = evalExpr(stmt.raw, sectionScope, sectionFnScope);
                summaryComps.push({
                  expr: stmt.raw,
                  pass: result.v !== 0
                });
              } catch {
              }
            }
          }
        }
      }
      sectionSummaryVarNames.set(el.id, summaryVars);
      sectionSummaryComparisons.set(el.id, summaryComps);
      for (const [k, v] of Object.entries(sectionScope)) {
        if (!k.startsWith(prefix) && (!preKeys.has(k) || sectionAliasKeys.has(k))) {
          globalScope[`${prefix}${k}`] = v;
        }
      }
      for (const [k, v] of Object.entries(sectionScope)) {
        if (k.startsWith(prefix)) globalScope[k] = v;
      }
      onSectionSummaryUpdate?.(el, block);
    } else {
      const rows = parseFormulaRows(block.content).map((r) => ({
        ...r,
        e: expandDotNotation(r.e)
      }));
      const stmts = evalFormulaRows(rows, globalScope, globalFnScope);
      applyEvalResults(el, stmts);
    }
  }
  canvas.domElement.querySelectorAll(".plot-block").forEach((el) => {
    const rerender = el.__plotRerender;
    if (rerender) rerender();
  });
  onRefreshAllSectionHeights?.();
}
function buildFormulaBlock(el, block) {
  el.classList.add("formula-block");
  if (block.w) el.style.width = `${block.w}px`;
  const labelEl = document.createElement("div");
  labelEl.className = "formula-label";
  labelEl.contentEditable = "true";
  labelEl.textContent = block.label ?? "Formula";
  labelEl.dataset.placeholder = "Label\u2026";
  labelEl.addEventListener("blur", () => {
    block.label = labelEl.textContent ?? "";
  });
  el.appendChild(labelEl);
  const divider = document.createElement("hr");
  divider.className = "math-divider";
  el.appendChild(divider);
  const rowsEl = document.createElement("div");
  rowsEl.className = "formula-rows";
  el.appendChild(rowsEl);
  let lastFocusedRowIdx = -1;
  function updateHasAnyDesc() {
    const arr = parseFormulaRows(block.content);
    const anyDesc = arr.some((r) => !!r.d);
    rowsEl.classList.toggle("has-any-desc", anyDesc);
    rowsEl.classList.toggle("has-any-row-desc", anyDesc);
  }
  function updateHasAnyRef() {
    const arr = parseFormulaRows(block.content);
    const anyRef = arr.some((r) => !!r.ref);
    rowsEl.classList.toggle("has-any-ref", anyRef);
    rowsEl.classList.toggle("has-any-row-ref", anyRef);
  }
  function syncContent() {
    const rows = rowsEl.querySelectorAll(".formula-row");
    block.content = JSON.stringify(Array.from(rows).map((r) => {
      const obj = {
        e: r.dataset.raw ?? "",
        d: r.dataset.desc ?? ""
      };
      if (r.dataset.rowType) obj.type = r.dataset.rowType;
      if (r.dataset.ref) obj.ref = r.dataset.ref;
      return obj;
    }));
    reEvalAllFormulas();
    updateHasAnyDesc();
    updateHasAnyRef();
  }
  function findBranchInsertPoint(arr, ifIdx) {
    let depth = 1;
    let hasElse = false;
    for (let j = ifIdx + 1; j < arr.length; j++) {
      const t = arr[j].type;
      if (t === "if" || t === "for") depth++;
      if (t === "end") {
        depth--;
        if (depth === 0) return {
          insertIdx: j,
          hasElse
        };
      }
      if (t === "else" && depth === 1) {
        hasElse = true;
        return {
          insertIdx: j,
          hasElse
        };
      }
    }
    return {
      insertIdx: arr.length,
      hasElse
    };
  }
  function findOwningIfIdx(arr, rowIdx) {
    if (arr[rowIdx]?.type === "if") return rowIdx;
    let depth = 0;
    for (let j = rowIdx - 1; j >= 0; j--) {
      const t = arr[j].type;
      if (t === "end") depth++;
      else if ((t === "if" || t === "for") && depth > 0) depth--;
      else if (t === "if" && depth === 0) return j;
    }
    return rowIdx;
  }
  function findBlockEndIdx(arr, blockIdx) {
    let depth = 1;
    for (let j = blockIdx + 1; j < arr.length; j++) {
      const t = arr[j].type;
      if (t === "if" || t === "for") depth++;
      if (t === "end") {
        depth--;
        if (depth === 0) return j;
      }
    }
    return arr.length - 1;
  }
  function findBranchBodyEnd(arr, branchIdx) {
    let depth = 0;
    for (let j = branchIdx + 1; j < arr.length; j++) {
      const t = arr[j].type;
      if (t === "if" || t === "for") depth++;
      if (t === "end") {
        if (depth === 0) return j;
        depth--;
      }
      if ((t === "elseif" || t === "else") && depth === 0) return j;
    }
    return arr.length;
  }
  function findOwningBlockStart(arr, idx) {
    let depth = 0;
    for (let j = idx - 1; j >= 0; j--) {
      const t = arr[j].type;
      if (t === "end") depth++;
      else if ((t === "if" || t === "for") && depth > 0) depth--;
      else if ((t === "if" || t === "for") && depth === 0) return j;
    }
    return 0;
  }
  function smartDelete(arr, idx) {
    const rt = arr[idx].type;
    if (!rt) {
      arr.splice(idx, 1);
      if (arr.length === 0) arr.push({
        e: "",
        d: ""
      });
      return Math.min(idx, arr.length - 1);
    }
    if (rt === "if" || rt === "for") {
      const endIdx = findBlockEndIdx(arr, idx);
      arr.splice(idx, endIdx - idx + 1);
      if (arr.length === 0) arr.push({
        e: "",
        d: ""
      });
      return Math.min(idx, arr.length - 1);
    }
    if (rt === "elseif" || rt === "else") {
      const bodyEnd = findBranchBodyEnd(arr, idx);
      arr.splice(idx, bodyEnd - idx);
      if (arr.length === 0) arr.push({
        e: "",
        d: ""
      });
      return Math.min(idx, arr.length - 1);
    }
    if (rt === "end") {
      const ownerIdx = findOwningBlockStart(arr, idx);
      arr.splice(ownerIdx, idx - ownerIdx + 1);
      if (arr.length === 0) arr.push({
        e: "",
        d: ""
      });
      return Math.min(ownerIdx, arr.length - 1);
    }
    return idx;
  }
  function findContextIfBlock(arr) {
    if (lastFocusedRowIdx >= 0 && lastFocusedRowIdx < arr.length) {
      const rt = arr[lastFocusedRowIdx]?.type;
      const candidate = rt === "if" ? lastFocusedRowIdx : findOwningBlockStart(arr, lastFocusedRowIdx);
      if (arr[candidate]?.type === "if") return candidate;
    }
    for (let j = arr.length - 1; j >= 0; j--) {
      if (arr[j].type === "if") return j;
    }
    return -1;
  }
  function computeDepths(rowData) {
    const depths = [];
    let depth = 0;
    for (const row of rowData) {
      const rt = row.type;
      if (rt === "elseif" || rt === "else" || rt === "end") depth = Math.max(0, depth - 1);
      depths.push(depth);
      if (rt === "if" || rt === "for" || rt === "elseif" || rt === "else") depth++;
    }
    return depths;
  }
  function rebuildRows() {
    const rowData = parseFormulaRows(block.content);
    rowsEl.innerHTML = "";
    block.content = JSON.stringify(rowData);
    if (!rowsEl._rowUndoStack) rowsEl._rowUndoStack = [];
    const rowUndoStack = rowsEl._rowUndoStack;
    const depths = computeDepths(rowData);
    const containerStack = [
      rowsEl
    ];
    const peekContainer = () => containerStack[containerStack.length - 1];
    rowData.forEach((rowDatum, i) => {
      const { e: stmt, d: desc, ref, type: rowType } = rowDatum;
      const isCtrl = !!rowType;
      const isBodyOnly = rowType === "else" || rowType === "end";
      const row = document.createElement("div");
      row.className = "formula-row";
      if (isCtrl) row.classList.add("formula-row--control");
      if (isBodyOnly) row.classList.add("formula-row--no-expr");
      if (rowType) row.dataset.rowType = rowType;
      row.dataset.raw = stmt;
      row.dataset.desc = desc ?? "";
      row.dataset.ref = ref ?? "";
      if (desc) row.classList.add("has-desc");
      if (ref) row.classList.add("has-ref");
      const d = depths[i] ?? 0;
      row.style.setProperty("--depth", String(d));
      if (isCtrl) {
        const badge = document.createElement("span");
        badge.className = `formula-keyword formula-keyword--${rowType}`;
        badge.textContent = rowType;
        if (isBodyOnly) {
          badge.tabIndex = 0;
          badge.addEventListener("focus", () => {
            lastFocusedRowIdx = i;
          });
          badge.addEventListener("keydown", (ev) => {
            if (!ev.ctrlKey || ev.key !== "-" || ev.shiftKey || ev.altKey) return;
            ev.preventDefault();
            ev.stopPropagation();
            const arr = parseFormulaRows(block.content);
            const allRowEls = Array.from(rowsEl.querySelectorAll(".formula-row"));
            const rowIdx = allRowEls.indexOf(row);
            rowUndoStack.push(Object.assign({}, arr[rowIdx], {
              idx: rowIdx
            }));
            const refocusIdx = smartDelete(arr, rowIdx);
            block.content = JSON.stringify(arr);
            rebuildRows();
            reEvalAllFormulas();
            const cells = rowsEl.querySelectorAll('.formula-cell:not([style*="display: none"])');
            cells[Math.min(refocusIdx, cells.length - 1)]?.focus();
          });
        }
        row.appendChild(badge);
      } else {
        const descWrap = document.createElement("div");
        descWrap.className = "formula-desc-wrap";
        const descCell = document.createElement("div");
        descCell.contentEditable = "true";
        descCell.className = "formula-desc-cell";
        descCell.dataset.placeholder = "Description\u2026";
        const renderDesc = () => {
          const html = renderInlineMd(row.dataset.desc ?? "");
          if (html) descCell.innerHTML = html;
          else descCell.textContent = "";
        };
        descCell.addEventListener("focus", () => {
          descCell.innerText = row.dataset.desc ?? "";
          const range = document.createRange();
          range.selectNodeContents(descCell);
          range.collapse(false);
          globalThis.getSelection()?.removeAllRanges();
          globalThis.getSelection()?.addRange(range);
        });
        descCell.addEventListener("input", () => {
          row.dataset.desc = serializeEditable(descCell);
        });
        descCell.addEventListener("blur", () => {
          row.dataset.desc = serializeEditable(descCell);
          if (row.dataset.desc) row.classList.add("has-desc");
          else row.classList.remove("has-desc");
          syncContent();
          updateHasAnyDesc();
          renderDesc();
        });
        descCell.addEventListener("keydown", (ev) => {
          if (ev.key === "Tab" && !ev.shiftKey) {
            ev.preventDefault();
            cell.focus();
          }
          if (ev.key === "Enter") {
            ev.preventDefault();
            insertLineBreak();
          }
        });
        renderDesc();
        descWrap.appendChild(descCell);
        row.appendChild(descWrap);
      }
      const exprSide = document.createElement("div");
      exprSide.className = "formula-expr-side";
      const cell = document.createElement("div");
      cell.className = "formula-cell";
      if (isBodyOnly) {
        cell.style.display = "none";
      } else {
        cell.contentEditable = "true";
        const PLAIN_TYPES = /* @__PURE__ */ new Set([
          "if",
          "elseif",
          "for"
        ]);
        const renderMath = () => {
          if (PLAIN_TYPES.has(row.dataset.rowType ?? "")) {
            cell.textContent = row.dataset.raw ?? "";
          } else {
            const html = prettifyExpr(row.dataset.raw ?? "");
            if (html) cell.innerHTML = html;
            else cell.textContent = row.dataset.raw ?? "";
          }
        };
        if (rowType === "if" || rowType === "elseif") {
          cell.dataset.placeholder = "condition  e.g. x > 0";
        } else if (rowType === "for") {
          cell.dataset.placeholder = "i = 1 to n";
        } else {
          cell.dataset.placeholder = "x = expression";
        }
        cell.addEventListener("focus", () => {
          lastFocusedRowIdx = i;
          cell.textContent = row.dataset.raw ?? "";
          const range = document.createRange();
          range.selectNodeContents(cell);
          range.collapse(false);
          globalThis.getSelection()?.removeAllRanges();
          globalThis.getSelection()?.addRange(range);
        });
        cell.addEventListener("blur", () => {
          row.dataset.raw = cell.textContent?.trim() ?? "";
          syncContent();
          renderMath();
        });
        cell.addEventListener("input", () => {
          row.dataset.raw = cell.textContent ?? "";
          syncContent();
        });
        cell.addEventListener("keydown", (e) => {
          const k = e.key;
          if (k === "Enter" && e.altKey && !e.ctrlKey) {
            e.preventDefault();
            return;
          }
          if (!e.ctrlKey) return;
          if (k !== "Enter" && k !== "-" && k.toLowerCase() !== "z" && k.toLowerCase() !== "i" && k.toLowerCase() !== "l" && k.toLowerCase() !== "e") return;
          e.preventDefault();
          e.stopPropagation();
          row.dataset.raw = cell.textContent?.trim() ?? "";
          const arr = parseFormulaRows(block.content);
          const allRows = Array.from(rowsEl.querySelectorAll(".formula-row"));
          const idx = allRows.indexOf(row);
          const refocus = (targetIdx) => {
            rebuildRows();
            reEvalAllFormulas();
            const newCells = rowsEl.querySelectorAll('.formula-cell:not([style*="display: none"])');
            newCells[Math.max(0, Math.min(targetIdx, newCells.length - 1))]?.focus();
          };
          if (k === "Enter" && !e.altKey) {
            arr.splice(idx + 1, 0, {
              e: "",
              d: ""
            });
            block.content = JSON.stringify(arr);
            refocus(idx + 1);
          } else if (k === "Enter" && e.altKey) {
            arr.splice(idx, 0, {
              e: "",
              d: ""
            });
            block.content = JSON.stringify(arr);
            refocus(idx);
          } else if (k === "-" && !e.shiftKey && !e.altKey) {
            rowUndoStack.push(Object.assign({}, arr[idx], {
              idx
            }));
            const refocusIdx = smartDelete(arr, idx);
            block.content = JSON.stringify(arr);
            refocus(refocusIdx);
          } else if (k.toLowerCase() === "z" && e.shiftKey && !e.altKey) {
            const entry = rowUndoStack.pop();
            if (!entry) return;
            const restoreIdx = entry.idx ?? idx;
            arr.splice(restoreIdx, 0, {
              e: entry.e,
              d: entry.d ?? "",
              type: entry.type
            });
            block.content = JSON.stringify(arr);
            refocus(restoreIdx);
          } else if (k.toLowerCase() === "i" && !e.altKey && !e.shiftKey) {
            arr.splice(idx + 1, 0, {
              e: "",
              d: "",
              type: "if"
            }, {
              e: "",
              d: ""
            }, {
              e: "",
              d: "",
              type: "end"
            });
            block.content = JSON.stringify(arr);
            rebuildRows();
            reEvalAllFormulas();
            const allCells = Array.from(rowsEl.querySelectorAll(".formula-cell"));
            allCells[idx + 2]?.focus();
          } else if (k.toLowerCase() === "l" && !e.altKey && !e.shiftKey) {
            arr.splice(idx + 1, 0, {
              e: "i = 1 to n",
              d: "",
              type: "for"
            }, {
              e: "",
              d: ""
            }, {
              e: "",
              d: "",
              type: "end"
            });
            block.content = JSON.stringify(arr);
            rebuildRows();
            reEvalAllFormulas();
            const allCells = Array.from(rowsEl.querySelectorAll(".formula-cell"));
            allCells[idx + 1]?.focus();
          } else if (k.toLowerCase() === "e" && (rowType === "if" || rowType === "elseif")) {
            const ownerIdx = findOwningIfIdx(arr, idx);
            const { insertIdx, hasElse } = findBranchInsertPoint(arr, ownerIdx);
            if (insertIdx < 0 || hasElse) return;
            if (e.shiftKey) {
              arr.splice(insertIdx, 0, {
                e: "",
                d: "",
                type: "else"
              }, {
                e: "",
                d: ""
              });
            } else {
              arr.splice(insertIdx, 0, {
                e: "",
                d: "",
                type: "elseif"
              }, {
                e: "",
                d: ""
              });
            }
            block.content = JSON.stringify(arr);
            rebuildRows();
            reEvalAllFormulas();
            const newAllCells = Array.from(rowsEl.querySelectorAll(".formula-cell"));
            newAllCells[insertIdx]?.focus();
          }
        });
        renderMath();
      }
      const sep = document.createElement("span");
      sep.className = "formula-sep";
      if (isBodyOnly) {
        sep.style.display = "none";
      } else if (isCtrl) {
        sep.textContent = " \u2192 ";
      } else {
        sep.textContent = " = ";
      }
      const resultEl = document.createElement("span");
      resultEl.className = "formula-result";
      resultEl.dataset.result = String(i);
      resultEl.textContent = isBodyOnly ? "" : "\u2014";
      exprSide.appendChild(cell);
      exprSide.appendChild(sep);
      exprSide.appendChild(resultEl);
      row.appendChild(exprSide);
      const refWrap = document.createElement("div");
      refWrap.className = "formula-ref-wrap";
      if (!isCtrl) {
        const refCell = document.createElement("div");
        refCell.contentEditable = "true";
        refCell.className = "formula-ref-cell";
        refCell.dataset.placeholder = "Reference\u2026";
        if (ref) refCell.innerText = ref;
        refCell.addEventListener("focus", () => {
          refCell.innerText = row.dataset.ref ?? "";
          const range = document.createRange();
          range.selectNodeContents(refCell);
          range.collapse(false);
          globalThis.getSelection()?.removeAllRanges();
          globalThis.getSelection()?.addRange(range);
        });
        refCell.addEventListener("input", () => {
          row.dataset.ref = serializeEditable(refCell);
        });
        refCell.addEventListener("blur", () => {
          row.dataset.ref = serializeEditable(refCell);
          if (row.dataset.ref) row.classList.add("has-ref");
          else row.classList.remove("has-ref");
          syncContent();
          updateHasAnyRef();
        });
        refCell.addEventListener("keydown", (ev) => {
          if (ev.key === "Tab" && ev.shiftKey) {
            ev.preventDefault();
            cell.focus();
          }
          if (ev.key === "Enter") {
            ev.preventDefault();
            insertLineBreak();
          }
        });
        refWrap.appendChild(refCell);
      }
      row.appendChild(refWrap);
      if (rowType === "if" || rowType === "for") {
        const group = document.createElement("div");
        group.className = "formula-block-group";
        if (desc) group.classList.add("has-group-desc");
        if (ref) group.classList.add("has-group-ref");
        const groupDescWrap = document.createElement("div");
        groupDescWrap.className = "formula-desc-wrap";
        const groupDescCell = document.createElement("div");
        groupDescCell.contentEditable = "true";
        groupDescCell.className = "formula-desc-cell";
        groupDescCell.dataset.placeholder = "Description\u2026";
        const renderGroupDesc = () => {
          const html = renderInlineMd(row.dataset.desc ?? "");
          if (html) groupDescCell.innerHTML = html;
          else groupDescCell.textContent = "";
        };
        groupDescCell.addEventListener("focus", () => {
          groupDescCell.innerText = row.dataset.desc ?? "";
          const range = document.createRange();
          range.selectNodeContents(groupDescCell);
          range.collapse(false);
          globalThis.getSelection()?.removeAllRanges();
          globalThis.getSelection()?.addRange(range);
        });
        groupDescCell.addEventListener("input", () => {
          row.dataset.desc = serializeEditable(groupDescCell);
        });
        groupDescCell.addEventListener("blur", () => {
          row.dataset.desc = serializeEditable(groupDescCell);
          if (row.dataset.desc) {
            row.classList.add("has-desc");
            group.classList.add("has-group-desc");
          } else {
            row.classList.remove("has-desc");
            group.classList.remove("has-group-desc");
          }
          syncContent();
          updateHasAnyDesc();
          renderGroupDesc();
        });
        groupDescCell.addEventListener("keydown", (ev) => {
          if (ev.key === "Tab" && !ev.shiftKey) {
            ev.preventDefault();
            cell.focus();
          }
          if (ev.key === "Enter") {
            ev.preventDefault();
            insertLineBreak();
          }
        });
        renderGroupDesc();
        groupDescWrap.appendChild(groupDescCell);
        group.appendChild(groupDescWrap);
        const inner = document.createElement("div");
        inner.className = "formula-block-inner";
        group.appendChild(inner);
        const groupRefWrap = document.createElement("div");
        groupRefWrap.className = "formula-ref-wrap";
        const groupRefCell = document.createElement("div");
        groupRefCell.contentEditable = "true";
        groupRefCell.className = "formula-ref-cell";
        groupRefCell.dataset.placeholder = "Reference\u2026";
        if (ref) groupRefCell.innerText = ref;
        groupRefCell.addEventListener("focus", () => {
          groupRefCell.innerText = row.dataset.ref ?? "";
          const range = document.createRange();
          range.selectNodeContents(groupRefCell);
          range.collapse(false);
          globalThis.getSelection()?.removeAllRanges();
          globalThis.getSelection()?.addRange(range);
        });
        groupRefCell.addEventListener("input", () => {
          row.dataset.ref = serializeEditable(groupRefCell);
        });
        groupRefCell.addEventListener("blur", () => {
          row.dataset.ref = serializeEditable(groupRefCell);
          if (row.dataset.ref) {
            row.classList.add("has-ref");
            group.classList.add("has-group-ref");
          } else {
            row.classList.remove("has-ref");
            group.classList.remove("has-group-ref");
          }
          syncContent();
          updateHasAnyRef();
        });
        groupRefCell.addEventListener("keydown", (ev) => {
          if (ev.key === "Tab" && ev.shiftKey) {
            ev.preventDefault();
            cell.focus();
          }
          if (ev.key === "Enter") {
            ev.preventDefault();
            insertLineBreak();
          }
        });
        groupRefWrap.appendChild(groupRefCell);
        group.appendChild(groupRefWrap);
        peekContainer().appendChild(group);
        containerStack.push(inner);
        inner.appendChild(row);
      } else if (rowType === "end") {
        peekContainer().appendChild(row);
        if (containerStack.length > 1) containerStack.pop();
      } else {
        peekContainer().appendChild(row);
      }
    });
    updateHasAnyDesc();
    updateHasAnyRef();
  }
  const getRowIdx = (rowEl) => Array.from(rowsEl.querySelectorAll(".formula-row")).indexOf(rowEl);
  const ctxRefocus = (idx) => {
    rebuildRows();
    reEvalAllFormulas();
    const cells = rowsEl.querySelectorAll('.formula-cell:not([style*="display: none"])');
    cells[Math.max(0, Math.min(idx, cells.length - 1))]?.focus();
  };
  rowsEl._formulaCtxActions = {
    getRowState: (rowEl) => {
      const arr = parseFormulaRows(block.content);
      const idx = rowEl ? getRowIdx(rowEl) : -1;
      const rowType = rowEl?.dataset.rowType ?? null;
      const hasIf = arr.some((r) => r.type === "if");
      let hasElse = false;
      if (hasIf) {
        const ownerIdx = idx >= 0 ? arr[idx]?.type === "if" ? idx : findOwningBlockStart(arr, idx) : findContextIfBlock(arr);
        if (ownerIdx >= 0 && arr[ownerIdx]?.type === "if") {
          ({ hasElse } = findBranchInsertPoint(arr, ownerIdx));
        }
      }
      const canDelBranch = rowType === "elseif" || rowType === "else" || rowType === "for";
      return {
        rowType,
        hasIf,
        hasElse,
        canDelBranch
      };
    },
    insertRowAfter: (rowEl) => {
      const arr = parseFormulaRows(block.content);
      const idx = rowEl ? getRowIdx(rowEl) : arr.length - 1;
      arr.splice(idx + 1, 0, {
        e: "",
        d: ""
      });
      block.content = JSON.stringify(arr);
      ctxRefocus(idx + 1);
    },
    insertIfAfter: (rowEl) => {
      const arr = parseFormulaRows(block.content);
      const idx = rowEl ? getRowIdx(rowEl) : arr.length - 1;
      arr.splice(idx + 1, 0, {
        e: "",
        d: "",
        type: "if"
      }, {
        e: "",
        d: ""
      }, {
        e: "",
        d: "",
        type: "end"
      });
      block.content = JSON.stringify(arr);
      ctxRefocus(idx + 2);
    },
    insertForAfter: (rowEl) => {
      const arr = parseFormulaRows(block.content);
      const idx = rowEl ? getRowIdx(rowEl) : arr.length - 1;
      arr.splice(idx + 1, 0, {
        e: "i = 1 to n",
        d: "",
        type: "for"
      }, {
        e: "",
        d: ""
      }, {
        e: "",
        d: "",
        type: "end"
      });
      block.content = JSON.stringify(arr);
      ctxRefocus(idx + 1);
    },
    insertElseifFor: (rowEl) => {
      const arr = parseFormulaRows(block.content);
      const idx = rowEl ? getRowIdx(rowEl) : lastFocusedRowIdx;
      const ownerIdx = idx >= 0 ? arr[idx]?.type === "if" ? idx : findOwningIfIdx(arr, idx) : findContextIfBlock(arr);
      if (ownerIdx < 0) return;
      const { insertIdx, hasElse } = findBranchInsertPoint(arr, ownerIdx);
      if (hasElse) return;
      arr.splice(insertIdx, 0, {
        e: "",
        d: "",
        type: "elseif"
      }, {
        e: "",
        d: ""
      });
      block.content = JSON.stringify(arr);
      ctxRefocus(insertIdx);
    },
    insertElseFor: (rowEl) => {
      const arr = parseFormulaRows(block.content);
      const idx = rowEl ? getRowIdx(rowEl) : lastFocusedRowIdx;
      const ownerIdx = idx >= 0 ? arr[idx]?.type === "if" ? idx : findOwningIfIdx(arr, idx) : findContextIfBlock(arr);
      if (ownerIdx < 0) return;
      const { insertIdx, hasElse } = findBranchInsertPoint(arr, ownerIdx);
      if (hasElse) return;
      arr.splice(insertIdx, 0, {
        e: "",
        d: "",
        type: "else"
      }, {
        e: "",
        d: ""
      });
      block.content = JSON.stringify(arr);
      ctxRefocus(insertIdx + 1);
    },
    smartDeleteRow: (rowEl) => {
      const arr = parseFormulaRows(block.content);
      const idx = getRowIdx(rowEl);
      if (idx < 0) return;
      const undoStack = rowsEl._rowUndoStack ?? [];
      undoStack.push(Object.assign({}, arr[idx], {
        idx
      }));
      rowsEl._rowUndoStack = undoStack;
      const refocusIdx = smartDelete(arr, idx);
      block.content = JSON.stringify(arr);
      ctxRefocus(refocusIdx);
    },
    addDescription: (rowEl) => {
      const rt = rowEl.dataset.rowType;
      let descCell;
      if (rt === "if" || rt === "for") {
        const group = rowEl.closest(".formula-block-group");
        descCell = group?.querySelector(":scope > .formula-desc-wrap .formula-desc-cell") ?? null;
        if (descCell) {
          rowEl.classList.add("has-desc");
          group?.classList.add("has-group-desc");
          rowsEl.classList.add("has-any-desc");
          rowsEl.classList.add("has-any-row-desc");
        }
      } else {
        descCell = rowEl.querySelector(".formula-desc-cell");
        if (descCell) {
          rowEl.classList.add("has-desc");
          rowsEl.classList.add("has-any-row-desc");
          rowsEl.classList.add("has-any-desc");
        }
      }
      if (!descCell) return;
      descCell.focus();
    },
    isRegularRow: (rowEl) => !rowEl?.dataset.rowType,
    hasDescription: (rowEl) => !!rowEl?.classList.contains("has-desc"),
    addReference: (rowEl) => {
      const rt = rowEl.dataset.rowType;
      let refCell;
      if (rt === "if" || rt === "for") {
        const group = rowEl.closest(".formula-block-group");
        refCell = group?.querySelector(":scope > .formula-ref-wrap .formula-ref-cell") ?? null;
        if (refCell) {
          rowEl.classList.add("has-ref");
          group?.classList.add("has-group-ref");
          rowsEl.classList.add("has-any-ref");
          rowsEl.classList.add("has-any-row-ref");
        }
      } else {
        refCell = rowEl.querySelector(".formula-ref-cell");
        if (refCell) {
          rowEl.classList.add("has-ref");
          rowsEl.classList.add("has-any-row-ref");
          rowsEl.classList.add("has-any-ref");
        }
      }
      if (!refCell) return;
      refCell.focus();
    },
    hasReference: (rowEl) => !!rowEl?.classList.contains("has-ref")
  };
  rebuildRows();
  const resizeHandle = document.createElement("div");
  resizeHandle.className = "formula-resize-handle";
  resizeHandle.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    e.stopPropagation();
    e.preventDefault();
    resizeHandle.setPointerCapture(e.pointerId);
    resizeHandle.classList.add("handle-active");
    const startX = e.clientX;
    const startW = el.offsetWidth;
    const blockLeft = parseInt(el.style.left);
    const maxW = CANVAS_W - margins.right - blockLeft;
    const onMove = (mv) => {
      const newW = Math.min(Math.max(220, startW + (mv.clientX - startX)), maxW);
      el.style.width = `${newW}px`;
      block.w = newW;
    };
    const onUp = () => {
      resizeHandle.removeEventListener("pointermove", onMove);
      resizeHandle.removeEventListener("pointerup", onUp);
      resizeHandle.classList.remove("handle-active");
      document.body.style.cursor = "";
    };
    resizeHandle.addEventListener("pointermove", onMove);
    resizeHandle.addEventListener("pointerup", onUp);
    document.body.style.cursor = "ew-resize";
  });
  el.appendChild(resizeHandle);
}

// src/blocks/pro/section.ts
function shiftBlocksBelowSection(sectionEl, prevBottom, deltaY) {
  if (!canvas || Math.abs(deltaY) < 1) return;
  for (const block of state.blocks) {
    if (block.id === sectionEl.id) continue;
    if (childToSection.has(block.id)) continue;
    const blockEl = canvas.domElement.querySelector(`#${block.id}`);
    if (!blockEl) continue;
    const blockTop = parseInt(blockEl.style.top || "0");
    if (blockTop >= prevBottom - 2) {
      const newTop = Math.max(margins.top, blockTop + deltaY);
      blockEl.style.top = `${newTop}px`;
      block.y = newTop - margins.top;
    }
  }
}
function refreshSectionHeight(sectionEl) {
  const content = sectionEl.querySelector(".section-content");
  if (!content || content.classList.contains("collapsed")) return;
  const prevTop = parseInt(sectionEl.style.top || "0");
  const prevH = sectionEl.offsetHeight;
  let maxBottom = 60;
  content.querySelectorAll(".block").forEach((child) => {
    const b = parseInt(child.style.top || "0") + child.offsetHeight + GRID_SIZE;
    if (b > maxBottom) maxBottom = b;
  });
  const block = state.blocks.find((blk) => blk.id === sectionEl.id);
  const headerH = (sectionEl.querySelector(".section-header")?.offsetHeight ?? GRID_SIZE) + (sectionEl.querySelector(".section-summary")?.offsetHeight ?? GRID_SIZE) + (sectionEl.querySelector(".section-resize-handle")?.offsetHeight ?? 8);
  if (block?.h) {
    const contentCapacity = block.h - headerH - 2;
    if (maxBottom > contentCapacity) {
      sectionEl.style.height = "";
    } else {
      maxBottom = Math.max(maxBottom, contentCapacity);
    }
  }
  content.style.minHeight = `${maxBottom}px`;
  const newH = sectionEl.offsetHeight;
  const deltaY = newH - prevH;
  if (Math.abs(deltaY) > 1) shiftBlocksBelowSection(sectionEl, prevTop + prevH, deltaY);
}
function refreshAllSectionHeights() {
  canvas.domElement.querySelectorAll(".section-block").forEach(refreshSectionHeight);
}
function updateSectionSummary(sectionEl, block) {
  const summary = sectionEl.querySelector(".section-summary");
  if (!summary) return;
  const prefix = (block.sectionName || "section") + "__";
  const summaryVars = sectionSummaryVarNames.get(sectionEl.id);
  const entries = summaryVars && summaryVars.size > 0 ? [
    ...summaryVars
  ].map((k) => {
    const v = globalScope[prefix + k] ?? globalScope[k];
    if (!v) return null;
    const unit = formatUnit(v.u);
    return `${k} = ${fmtNum(v.v)}${unit ? " " + unit : ""}`;
  }).filter(Boolean) : [];
  const comparisons = sectionSummaryComparisons.get(sectionEl.id) ?? [];
  if (entries.length === 0 && comparisons.length === 0) {
    summary.innerHTML = '<span class="section-summary-empty">no outputs yet</span>';
    return;
  }
  summary.innerHTML = "";
  if (entries.length > 0) {
    const varsSpan = document.createElement("span");
    varsSpan.textContent = entries.join("\xA0\xA0|\xA0\xA0");
    summary.appendChild(varsSpan);
  }
  for (const cmp of comparisons) {
    if (entries.length > 0 || summary.childElementCount > 0) {
      summary.appendChild(document.createTextNode("\xA0\xA0|\xA0\xA0"));
    }
    const badge = document.createElement("span");
    badge.className = cmp.pass ? "section-cmp-pass" : "section-cmp-fail";
    badge.textContent = (cmp.pass ? "\u2713 " : "\u2717 ") + cmp.expr;
    summary.appendChild(badge);
  }
}
function reparentToSection(childEl, sectionEl) {
  const content = sectionEl.querySelector(".section-content");
  if (!content) return;
  const sectionBlock = state.blocks.find((b) => b.id === sectionEl.id);
  const childBlock = state.blocks.find((b) => b.id === childEl.id);
  if (!sectionBlock || !childBlock) return;
  const contentRect = content.getBoundingClientRect();
  const childRect = childEl.getBoundingClientRect();
  const relLeft = Math.max(0, Math.round((childRect.left - contentRect.left) / GRID_SIZE) * GRID_SIZE);
  const relTop = Math.max(0, Math.round((childRect.top - contentRect.top) / GRID_SIZE) * GRID_SIZE);
  content.appendChild(childEl);
  childEl.style.left = `${relLeft}px`;
  childEl.style.top = `${relTop}px`;
  childEl.style.maxWidth = "";
  childBlock.x = relLeft;
  childBlock.y = relTop;
  childBlock.parentSectionId = sectionBlock.id;
  childToSection.set(childBlock.id, sectionBlock.id);
  refreshSectionHeight(sectionEl);
}
function unparentFromSection(childEl, sectionEl) {
  const content = sectionEl.querySelector(".section-content");
  if (!content) return;
  const childBlock = state.blocks.find((b) => b.id === childEl.id);
  if (!childBlock) return;
  const contentRect = content.getBoundingClientRect();
  const canvasRect = canvas.domElement.getBoundingClientRect();
  const absLeft = clamp(Math.round((contentRect.left - canvasRect.left + childBlock.x) / GRID_SIZE) * GRID_SIZE, margins.left, CANVAS_W - margins.right);
  const absTop = clamp(Math.round((contentRect.top - canvasRect.top + childBlock.y) / GRID_SIZE) * GRID_SIZE, margins.top, CANVAS_H);
  canvas.domElement.appendChild(childEl);
  childEl.style.left = `${absLeft}px`;
  childEl.style.top = `${absTop}px`;
  childEl.style.maxWidth = `${CANVAS_W - margins.right - absLeft}px`;
  childBlock.x = absLeft - margins.left;
  childBlock.y = absTop - margins.top;
  delete childBlock.parentSectionId;
  childToSection.delete(childBlock.id);
  refreshSectionHeight(sectionEl);
}
function sectionAtPoint(cx, cy) {
  for (const el of canvas.domElement.querySelectorAll(".section-block")) {
    const content = el.querySelector(".section-content");
    if (!content || content.classList.contains("collapsed")) continue;
    const elLeft = parseInt(el.style.left || "0");
    const elTop = parseInt(el.style.top || "0");
    const contentTop = elTop + content.offsetTop;
    if (cx >= elLeft && cx <= elLeft + el.offsetWidth && cy >= contentTop && cy <= contentTop + content.offsetHeight) return el;
  }
  return null;
}
var SECTION_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899"
];
var _sectionColorIdx = 0;
function nextSectionColor() {
  return SECTION_COLORS[_sectionColorIdx++ % SECTION_COLORS.length];
}
function nextSectionName() {
  const existing = new Set(state.blocks.filter((b) => b.type === "section" && b.sectionName).map((b) => b.sectionName));
  let i = 1;
  while (existing.has(`section${i}`)) i++;
  return `section${i}`;
}
function sanitizeSectionName(raw) {
  return raw.trim().replace(/[\s\-]+/g, "_").replace(/[^A-Za-z0-9_]/g, "").replace(/__+/g, "_").replace(/^[0-9_]+/, "").replace(/_+$/, "");
}
function buildSectionBlock(el, block) {
  if (!block.packId && !canCreateSection()) {
    el.classList.add("section-block", "section-locked");
    el.style.cssText += "display:flex;align-items:center;justify-content:center;min-height:60px;background:#f3f4f6;border:2px dashed #cbd5e1;border-radius:4px;color:#94a3b8;font-size:0.8rem;";
    el.textContent = "[Pro required to create sections]";
    return;
  }
  if (block.packId && !hasPack(block.packId) && !block.encrypted) {
    el.classList.add("section-block", "section-locked");
    el.style.cssText += "display:flex;align-items:center;justify-content:center;min-height:60px;background:#fef3c7;border:2px dashed #fbbf24;border-radius:4px;color:#92400e;font-size:0.8rem;";
    el.textContent = `[Pack "${block.packId}" not owned]`;
    return;
  }
  const color = block.sectionColor ?? nextSectionColor();
  block.sectionColor = color;
  el.style.setProperty("--section-color", color);
  el.classList.add("section-block");
  const header = document.createElement("div");
  header.className = "section-header";
  const toggle = document.createElement("button");
  toggle.className = "section-toggle";
  toggle.textContent = block.collapsed ? "\u25B6" : "\u25BC";
  toggle.title = "Collapse / expand section";
  const title = document.createElement("span");
  title.className = "section-title";
  title.contentEditable = "true";
  title.textContent = block.sectionName ?? "section1";
  title.dataset.placeholder = "Section name\u2026";
  title.addEventListener("mousedown", (ev) => {
    ev.stopPropagation();
  });
  title.addEventListener("blur", () => {
    const candidate = sanitizeSectionName(title.textContent ?? "") || block.sectionName || nextSectionName();
    const isDuplicate = state.blocks.some((b) => b.type === "section" && b.id !== block.id && b.sectionName === candidate);
    if (isDuplicate) {
      title.style.color = "#ef4444";
      title.style.outline = "1px solid #ef4444";
      title.textContent = block.sectionName ?? candidate;
      setTimeout(() => {
        title.style.color = "";
        title.style.outline = "";
      }, 1500);
    } else {
      title.textContent = candidate;
      block.sectionName = candidate;
      reEvalAllFormulas();
    }
  });
  title.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter") {
      ev.preventDefault();
      title.blur();
    }
  });
  header.appendChild(toggle);
  header.appendChild(title);
  el.appendChild(header);
  const summary = document.createElement("div");
  summary.className = "section-summary";
  summary.innerHTML = '<span class="section-summary-empty">no outputs yet</span>';
  el.appendChild(summary);
  const content = document.createElement("div");
  content.className = "section-content";
  if (block.collapsed) {
    content.classList.add("collapsed");
    el.style.minHeight = "0";
  }
  el.appendChild(content);
  toggle.addEventListener("click", (ev) => {
    ev.stopPropagation();
    const prevBottom = parseInt(el.style.top || "0") + el.offsetHeight;
    block.collapsed = !block.collapsed;
    toggle.textContent = block.collapsed ? "\u25B6" : "\u25BC";
    content.classList.toggle("collapsed", block.collapsed);
    if (block.collapsed) {
      el.style.height = "";
      el.style.minHeight = "0";
      resizeHandle.style.display = "none";
    } else {
      el.style.minHeight = "";
      el.style.height = "";
      resizeHandle.style.display = "";
      updateSectionSummary(el, block);
    }
    const newBottom = parseInt(el.style.top || "0") + el.offsetHeight;
    const deltaY = newBottom - prevBottom;
    if (Math.abs(deltaY) > 1) shiftBlocksBelowSection(el, prevBottom, deltaY);
  });
  const resizeHandle = document.createElement("div");
  resizeHandle.className = "section-resize-handle";
  if (block.collapsed) resizeHandle.style.display = "none";
  el.appendChild(resizeHandle);
  resizeHandle.addEventListener("pointerdown", (ev) => {
    if (ev.button !== 0 && ev.pointerType === "mouse") return;
    ev.stopPropagation();
    ev.preventDefault();
    resizeHandle.setPointerCapture(ev.pointerId);
    resizeHandle.classList.add("handle-active");
    const startY = ev.clientY;
    const startH = el.offsetHeight;
    const startBottom = parseInt(el.style.top || "0") + startH;
    document.body.style.cursor = "ns-resize";
    const onMove = (mv) => {
      const newH = Math.max(80, startH + (mv.clientY - startY));
      block.h = newH;
      el.style.height = `${newH}px`;
      const headerH = (el.querySelector(".section-header")?.offsetHeight ?? GRID_SIZE) + (el.querySelector(".section-summary")?.offsetHeight ?? GRID_SIZE) + (el.querySelector(".section-resize-handle")?.offsetHeight ?? 8);
      content.style.minHeight = `${Math.max(GRID_SIZE * 2, newH - headerH - 2)}px`;
    };
    const onUp = () => {
      resizeHandle.removeEventListener("pointermove", onMove);
      resizeHandle.removeEventListener("pointerup", onUp);
      resizeHandle.classList.remove("handle-active");
      document.body.style.cursor = "";
      const newBottom = parseInt(el.style.top || "0") + el.offsetHeight;
      const deltaY = newBottom - startBottom;
      if (Math.abs(deltaY) > 1) shiftBlocksBelowSection(el, startBottom, deltaY);
    };
    resizeHandle.addEventListener("pointermove", onMove);
    resizeHandle.addEventListener("pointerup", onUp);
  });
  content.addEventListener("click", (ev) => {
    if (ev.target.closest(".block:not(.section-block)")) return;
    const canvasRect = canvas.domElement.getBoundingClientRect();
    onMoveGridCursor?.(ev.clientX - canvasRect.left, ev.clientY - canvasRect.top);
  });
  const childResizeObserver = new ResizeObserver(() => refreshSectionHeight(el));
  const childMutationObserver = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node instanceof HTMLElement && node.classList.contains("block")) {
          childResizeObserver.observe(node);
        }
      }
      for (const node of m.removedNodes) {
        if (node instanceof HTMLElement && node.classList.contains("block")) {
          childResizeObserver.unobserve(node);
        }
      }
    }
    refreshSectionHeight(el);
  });
  childMutationObserver.observe(content, {
    childList: true
  });
  header.addEventListener("pointerdown", (ev) => {
    if (ev.button !== 0 && ev.pointerType === "mouse") return;
    if (ev.target.isContentEditable) return;
    if (ev.target.tagName === "BUTTON") return;
    ev.stopPropagation();
    if (!selectedEls.has(el)) onSelectBlock?.(el);
    setMultiDragState({
      startX: ev.clientX,
      startY: ev.clientY,
      origPositions: new Map([
        ...selectedEls
      ].map((s) => [
        s,
        {
          left: parseInt(s.style.left),
          top: parseInt(s.style.top)
        }
      ]))
    });
    document.body.style.cursor = "grabbing";
    ev.preventDefault();
  });
}

// src/blocks/plot.ts
var PLOT_W = 420;
var PLOT_H = 240;
var PLOT_ML = 54;
var PLOT_MR = 12;
var PLOT_MT = 14;
var PLOT_MB = 40;
var MAX_ANNOT = 14;
function fmtTick(v) {
  if (v === 0) return "0";
  const abs = Math.abs(v);
  if (abs >= 1e4 || abs < 1e-3 && abs > 0) return v.toExponential(1);
  if (abs >= 100) return v.toFixed(0);
  if (abs >= 10) return v.toFixed(1);
  if (abs >= 1) return v.toFixed(2);
  return v.toFixed(3);
}
function niceStep(range, targetTicks) {
  if (range === 0) return 1;
  const rough = range / targetTicks;
  const mag = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm = rough / mag;
  return (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
}
function computePlotML(yMin, yMax) {
  const yRange = yMax - yMin || 1;
  const yStep = niceStep(yRange, 5);
  let maxLen = 1;
  for (let yv = Math.ceil(yMin / yStep) * yStep; yv <= yMax + yStep * 1e-3; yv += yStep) {
    const len = fmtTick(+yv.toPrecision(10)).length;
    if (len > maxLen) maxLen = len;
  }
  return Math.max(PLOT_ML, Math.round(maxLen * 5.5 + 12));
}
function interpolatePlot(points, xTarget) {
  if (points.length === 0) return NaN;
  for (let i = 0; i < points.length - 1; i++) {
    if (points[i][0] <= xTarget && points[i + 1][0] >= xTarget) {
      const [x0, y0] = points[i];
      const [x1, y1] = points[i + 1];
      if (!isFinite(y0) || !isFinite(y1)) return NaN;
      return y0 + (xTarget - x0) / (x1 - x0) * (y1 - y0);
    }
  }
  return NaN;
}
function localSlope(points, xTarget) {
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    if (x0 <= xTarget && xTarget <= x1) {
      if (!isFinite(y0) || !isFinite(y1) || x1 === x0) return 0;
      return (y1 - y0) / (x1 - x0);
    }
  }
  return 0;
}
function findLocalExtrema(points) {
  const out = [];
  for (let i = 2; i < points.length - 2; i++) {
    const [, ya] = points[i - 2];
    const [, yb] = points[i - 1];
    const [xv, yv] = points[i];
    const [, yc] = points[i + 1];
    const [, yd] = points[i + 2];
    if (!isFinite(ya) || !isFinite(yb) || !isFinite(yv) || !isFinite(yc) || !isFinite(yd)) continue;
    if (yv >= yb && yv >= yc && yv > ya && yv > yd) out.push({
      x: xv,
      y: yv,
      kind: "max"
    });
    else if (yv <= yb && yv <= yc && yv < ya && yv < yd) out.push({
      x: xv,
      y: yv,
      kind: "min"
    });
  }
  return out;
}
function parsePlotConfig(content) {
  let raw = {};
  try {
    raw = JSON.parse(content || "{}") ?? {};
  } catch {
    raw = {};
  }
  const cfg2 = {
    ...DEFAULT_PLOT,
    ...raw
  };
  if (!Array.isArray(raw.xMarkers) && Array.isArray(raw.markers)) {
    cfg2.xMarkers = raw.markers;
  }
  if (!Array.isArray(cfg2.xMarkers)) cfg2.xMarkers = [];
  if (!Array.isArray(cfg2.yMarkers)) cfg2.yMarkers = [];
  delete cfg2.markers;
  return cfg2;
}
function buildPlotSVG(points, cfg2, yMin, yMax, dark, markerData = [], plotW = PLOT_W, plotH = PLOT_H) {
  const ml = computePlotML(yMin, yMax);
  const pw = plotW - ml - PLOT_MR;
  const ph = plotH - PLOT_MT - PLOT_MB;
  const bg = dark ? "#18181b" : "#ffffff";
  const fg = dark ? "#e4e4e7" : "#18181b";
  const grid = dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const axis = dark ? "#52525b" : "#9ca3af";
  const zero = dark ? "#71717a" : "#d1d5db";
  const curve = dark ? "#38bdf8" : "#2563eb";
  const xRange = cfg2.xMax - cfg2.xMin || 1;
  const yRange = yMax - yMin || 1;
  const toSX = (x) => ml + (x - cfg2.xMin) / xRange * pw;
  const toSY = (y) => PLOT_MT + ph - (y - yMin) / yRange * ph;
  const cpId = `pc${Math.random().toString(36).slice(2, 9)}`;
  const clampLy = (y) => Math.max(PLOT_MT + 8, Math.min(plotH - 6, y));
  const labelLy = (sy, yv) => yv >= 0 ? sy - 5 : sy + 12;
  const LINE_H = 9;
  const CHAR_W = 4.9;
  function nodeLabel(sx, sy, xv, yv, col, gap, preferLeft) {
    const single = [
      `(${fmtTick(xv)}, ${fmtTick(yv)})`
    ];
    const folded = [
      `(${fmtTick(xv)},`,
      `${fmtTick(yv)})`
    ];
    const widthOf = (ls) => Math.max(...ls.map((l) => l.length)) * CHAR_W;
    const fits = (onLeft2, ls) => onLeft2 ? sx - gap - widthOf(ls) >= 2 : sx + gap + widthOf(ls) <= plotW - 2;
    let onLeft = preferLeft;
    let lines;
    if (fits(onLeft, single)) lines = single;
    else if (fits(onLeft, folded)) lines = folded;
    else if (fits(!onLeft, single)) onLeft = !onLeft, lines = single;
    else onLeft = !onLeft, lines = folded;
    const lx = onLeft ? sx - gap : sx + gap;
    const anchor = onLeft ? "end" : "start";
    const span = (lines.length - 1) * LINE_H;
    const rawTop = yv >= 0 ? labelLy(sy, yv) - span : labelLy(sy, yv);
    const top = Math.max(PLOT_MT + 8, Math.min(plotH - 6 - span, rawTop));
    return lines.map((line, i) => `<text x="${lx.toFixed(1)}" y="${(top + i * LINE_H).toFixed(1)}" text-anchor="${anchor}" font-size="8" fill="${col}" font-family="monospace">${line}</text>`).join("");
  }
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${plotW}" height="${plotH}" style="display:block;max-width:100%">`;
  s += `<rect width="${plotW}" height="${plotH}" fill="${bg}"/>`;
  s += `<clipPath id="${cpId}"><rect x="${ml}" y="${PLOT_MT}" width="${pw}" height="${ph}"/></clipPath>`;
  const xStep = niceStep(xRange, 5);
  for (let xv = Math.ceil(cfg2.xMin / xStep) * xStep; xv <= cfg2.xMax + xStep * 1e-3; xv += xStep) {
    const sx = toSX(xv).toFixed(1);
    s += `<line x1="${sx}" y1="${PLOT_MT}" x2="${sx}" y2="${PLOT_MT + ph}" stroke="${grid}" stroke-width="1"/>`;
    s += `<line x1="${sx}" y1="${PLOT_MT + ph}" x2="${sx}" y2="${PLOT_MT + ph + 4}" stroke="${axis}" stroke-width="1"/>`;
    s += `<text x="${sx}" y="${PLOT_MT + ph + 14}" text-anchor="middle" font-size="9" fill="${fg}" font-family="monospace">${fmtTick(+xv.toPrecision(10))}</text>`;
  }
  const yStep = niceStep(yRange, 5);
  for (let yv = Math.ceil(yMin / yStep) * yStep; yv <= yMax + yStep * 1e-3; yv += yStep) {
    const sy = toSY(yv).toFixed(1);
    s += `<line x1="${ml}" y1="${sy}" x2="${ml + pw}" y2="${sy}" stroke="${grid}" stroke-width="1"/>`;
    s += `<line x1="${ml - 4}" y1="${sy}" x2="${ml}" y2="${sy}" stroke="${axis}" stroke-width="1"/>`;
    s += `<text x="${ml - 6}" y="${sy}" dominant-baseline="middle" text-anchor="end" font-size="9" fill="${fg}" font-family="monospace">${fmtTick(+yv.toPrecision(10))}</text>`;
  }
  s += `<rect x="${ml}" y="${PLOT_MT}" width="${pw}" height="${ph}" fill="none" stroke="${axis}" stroke-width="1"/>`;
  if (cfg2.xMin <= 0 && cfg2.xMax >= 0) {
    const sx = toSX(0).toFixed(1);
    s += `<line x1="${sx}" y1="${PLOT_MT}" x2="${sx}" y2="${PLOT_MT + ph}" stroke="${zero}" stroke-width="1" stroke-dasharray="3,2"/>`;
  }
  if (yMin <= 0 && yMax >= 0) {
    const sy = toSY(0).toFixed(1);
    s += `<line x1="${ml}" y1="${sy}" x2="${ml + pw}" y2="${sy}" stroke="${zero}" stroke-width="1" stroke-dasharray="3,2"/>`;
  }
  if (cfg2.fill && points.length > 1) {
    const sy0 = Math.max(PLOT_MT, Math.min(PLOT_MT + ph, toSY(0)));
    let d = "";
    let penDown = false;
    let lastSx = "";
    for (const [xv, yv] of points) {
      const sx = toSX(xv).toFixed(1);
      if (!isFinite(yv)) {
        if (penDown) {
          d += ` L${lastSx},${sy0.toFixed(1)} Z`;
          penDown = false;
        }
        continue;
      }
      const sy = toSY(yv).toFixed(1);
      if (!penDown) {
        d += ` M${sx},${sy0.toFixed(1)} L${sx},${sy}`;
        penDown = true;
      } else d += ` L${sx},${sy}`;
      lastSx = sx;
    }
    if (penDown) d += ` L${lastSx},${sy0.toFixed(1)} Z`;
    if (d) {
      const fillCol = dark ? "rgba(56,189,248,0.18)" : "rgba(37,99,235,0.12)";
      s += `<path d="${d.trim()}" fill="${fillCol}" stroke="none" clip-path="url(#${cpId})"/>`;
    }
  }
  if (points.length > 1) {
    let d = "";
    let penDown = false;
    for (const [xv, yv] of points) {
      if (!isFinite(yv)) {
        penDown = false;
        continue;
      }
      d += `${penDown ? "L" : "M"}${toSX(xv).toFixed(1)},${toSY(yv).toFixed(1)} `;
      penDown = true;
    }
    if (d) {
      s += `<path d="${d.trim()}" fill="none" stroke="${curve}" stroke-width="2" stroke-linejoin="round" clip-path="url(#${cpId})"/>`;
    }
  }
  const zeroCrossings = findCurveCrossings(points, 0).map(([x]) => x);
  const zeroCol = dark ? "#2dd4bf" : "#0d9488";
  if (zeroCrossings.length <= MAX_ANNOT) {
    for (const xc of zeroCrossings) {
      const sx = toSX(xc);
      if (sx < ml || sx > ml + pw) continue;
      const sy = toSY(0);
      s += `<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="3" fill="${zeroCol}" stroke="${bg}" stroke-width="1" clip-path="url(#${cpId})"/>`;
      const lx = sx > ml + pw * 0.75 ? sx - 4 : sx + 4;
      const anchor = sx > ml + pw * 0.75 ? "end" : "start";
      s += `<text x="${lx.toFixed(1)}" y="${clampLy(sy - 5).toFixed(1)}" text-anchor="${anchor}" font-size="8" fill="${zeroCol}" font-family="monospace">(${fmtTick(xc)}, 0)</text>`;
    }
  }
  const extrema = findLocalExtrema(points);
  const maxCol = dark ? "#fbbf24" : "#d97706";
  const minCol = dark ? "#f87171" : "#dc2626";
  if (extrema.length <= MAX_ANNOT) {
    for (const { x: xv, y: yv, kind } of extrema) {
      const sx = toSX(xv), sy = toSY(yv);
      if (sx < ml || sx > ml + pw || sy < PLOT_MT || sy > PLOT_MT + ph) continue;
      const col = kind === "max" ? maxCol : minCol;
      s += `<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="3" fill="${col}" stroke="${bg}" stroke-width="1" clip-path="url(#${cpId})"/>`;
      const lx = sx > ml + pw * 0.75 ? sx - 4 : sx + 4;
      const anchor = sx > ml + pw * 0.75 ? "end" : "start";
      s += `<text x="${lx.toFixed(1)}" y="${clampLy(labelLy(sy, yv)).toFixed(1)}" text-anchor="${anchor}" font-size="8" fill="${col}" font-family="monospace">(${fmtTick(xv)}, ${fmtTick(yv)})</text>`;
    }
  }
  const markerCol = dark ? "#f472b6" : "#db2777";
  for (const [xv, yv] of markerData) {
    if (!isFinite(yv)) continue;
    const sx = toSX(xv), sy = toSY(yv);
    if (sx >= ml && sx <= ml + pw && sy >= PLOT_MT && sy <= PLOT_MT + ph) {
      const d = 5;
      s += `<polygon points="${sx.toFixed(1)},${(sy - d).toFixed(1)} ${(sx + d).toFixed(1)},${sy.toFixed(1)} ${sx.toFixed(1)},${(sy + d).toFixed(1)} ${(sx - d).toFixed(1)},${sy.toFixed(1)}" fill="${markerCol}" stroke="${bg}" stroke-width="1" clip-path="url(#${cpId})"/>`;
      const slope = localSlope(points, xv);
      s += nodeLabel(sx, sy, xv, yv, markerCol, 7, slope >= 0 !== yv < 0);
    }
  }
  if (cfg2.xLabel) {
    s += `<text x="${ml + pw / 2}" y="${plotH - 4}" text-anchor="middle" font-size="10" fill="${fg}" font-family="system-ui,sans-serif">${cfg2.xLabel}</text>`;
  }
  if (cfg2.yLabel) {
    const cy = PLOT_MT + ph / 2;
    s += `<text x="10" y="${cy}" text-anchor="middle" dominant-baseline="middle" transform="rotate(-90,10,${cy})" font-size="10" fill="${fg}" font-family="system-ui,sans-serif">${cfg2.yLabel}</text>`;
  }
  s += "</svg>";
  return s;
}
function resolveRangeQty(expr, fallback, scope, fnScope) {
  if (!expr) return {
    v: fallback,
    u: {}
  };
  const n = parseFloat(expr);
  if (isFinite(n) && String(n) === expr.trim()) return {
    v: n,
    u: {}
  };
  try {
    return evalExpr(expr, scope, fnScope);
  } catch {
    return {
      v: isFinite(n) ? n : fallback,
      u: {}
    };
  }
}
function evalPlotData(block) {
  const cfg2 = parsePlotConfig(block.content);
  if (!cfg2.expr.trim()) {
    return {
      points: [],
      yMin: -1,
      yMax: 1,
      markerData: [],
      markerSrc: [],
      xMin: cfg2.xMin,
      xMax: cfg2.xMax
    };
  }
  const baseScope = {
    ...globalScope
  };
  const xMinExpr = cfg2.xMinExpr ?? String(cfg2.xMin);
  const xMaxExpr = cfg2.xMaxExpr ?? String(cfg2.xMax);
  const xMinQty = resolveRangeQty(xMinExpr, cfg2.xMin, baseScope, globalFnScope);
  const xMaxQty = resolveRangeQty(xMaxExpr, cfg2.xMax, baseScope, globalFnScope);
  const resolvedXMin = isFinite(xMinQty.v) ? xMinQty.v : 0;
  const resolvedXMax = isFinite(xMaxQty.v) && xMaxQty.v > resolvedXMin ? xMaxQty.v : resolvedXMin + 1;
  const xUnit = Object.keys(xMaxQty.u).length > 0 ? xMaxQty.u : Object.keys(xMinQty.u).length > 0 ? xMinQty.u : {};
  const points = [];
  let yMin = Infinity, yMax = -Infinity;
  let error;
  for (let i = 0; i <= cfg2.nPts; i++) {
    const xv = resolvedXMin + (resolvedXMax - resolvedXMin) * (i / cfg2.nPts);
    const scope = {
      ...globalScope,
      [cfg2.xVar]: {
        v: xv,
        u: xUnit
      }
    };
    try {
      const yv = evalExpr(cfg2.expr, scope, globalFnScope).v;
      points.push([
        xv,
        isFinite(yv) ? yv : NaN
      ]);
      if (isFinite(yv)) {
        if (yv < yMin) yMin = yv;
        if (yv > yMax) yMax = yv;
      }
    } catch (e) {
      error = e.message;
      break;
    }
  }
  if (!isFinite(yMin)) {
    yMin = -1;
    yMax = 1;
  } else if (yMin === yMax) {
    yMin -= 1;
    yMax += 1;
  } else {
    const pad = (yMax - yMin) * 0.05;
    yMin -= pad;
    yMax += pad;
  }
  const markerData = [];
  const markerSrc = [];
  for (const xv of cfg2.xMarkers) {
    const scope = {
      ...globalScope,
      [cfg2.xVar]: {
        v: xv,
        u: xUnit
      }
    };
    let yv;
    try {
      yv = evalExpr(cfg2.expr, scope, globalFnScope).v;
    } catch {
      yv = NaN;
    }
    markerData.push([
      xv,
      yv
    ]);
    markerSrc.push({
      kind: "x",
      value: xv
    });
  }
  for (const yv of cfg2.yMarkers) {
    for (const pt of findCurveCrossings(points, yv)) {
      markerData.push(pt);
      markerSrc.push({
        kind: "y",
        value: yv
      });
    }
  }
  return {
    points,
    yMin,
    yMax,
    markerData,
    markerSrc,
    xMin: resolvedXMin,
    xMax: resolvedXMax,
    error
  };
}
function findCurveCrossings(points, target) {
  const out = [];
  if (!isFinite(target)) return out;
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    if (!isFinite(y0) || !isFinite(y1)) continue;
    const d0 = y0 - target;
    const d1 = y1 - target;
    if (d0 === 0) {
      out.push([
        x0,
        target
      ]);
      continue;
    }
    if (d0 * d1 < 0) {
      const t = d0 / (d0 - d1);
      out.push([
        x0 + t * (x1 - x0),
        target
      ]);
    }
  }
  const last = points[points.length - 1];
  if (last && isFinite(last[1]) && last[1] === target) out.push([
    last[0],
    target
  ]);
  return out;
}
function showPlotMarkerDelete(src, cfg2, onMarkerChange, clientX, clientY) {
  document.querySelector(".plot-ctx-popup")?.remove();
  const popup = document.createElement("div");
  popup.className = "plot-ctx-popup";
  popup.style.left = `${clientX}px`;
  popup.style.top = `${clientY}px`;
  const row = document.createElement("div");
  row.className = "plot-ctx-row";
  const btn = document.createElement("button");
  btn.className = "plot-ctx-btn plot-ctx-btn-primary";
  btn.textContent = "Clear current point";
  btn.onclick = () => {
    const list = src.kind === "x" ? cfg2.xMarkers : cfg2.yMarkers;
    const i = list.indexOf(src.value);
    if (i !== -1) list.splice(i, 1);
    onMarkerChange();
    popup.remove();
  };
  row.appendChild(btn);
  popup.appendChild(row);
  document.body.appendChild(popup);
  const closeOutside = (e) => {
    if (!popup.contains(e.target)) {
      popup.remove();
      document.removeEventListener("mousedown", closeOutside);
    }
  };
  setTimeout(() => document.addEventListener("mousedown", closeOutside), 0);
}
function showPlotMarkerInput(xDefault, yDefault, cfg2, points, yMin, yMax, onMarkerChange, clientX, clientY) {
  document.querySelector(".plot-ctx-popup")?.remove();
  const popup = document.createElement("div");
  popup.className = "plot-ctx-popup";
  popup.style.left = `${clientX}px`;
  popup.style.top = `${clientY}px`;
  const msgEl = document.createElement("div");
  msgEl.className = "plot-ctx-msg";
  msgEl.style.display = "none";
  const mkRow = (labelText, initial, validate, onAdd) => {
    const row = document.createElement("div");
    row.className = "plot-ctx-row";
    const label = document.createElement("span");
    label.className = "plot-ctx-label";
    label.textContent = labelText;
    const inp2 = document.createElement("input");
    inp2.type = "number";
    inp2.className = "plot-ctx-input";
    inp2.value = isFinite(initial) ? fmtTick(+initial.toPrecision(6)) : "";
    inp2.step = "any";
    const addBtn = document.createElement("button");
    addBtn.className = "plot-ctx-btn plot-ctx-btn-primary";
    addBtn.textContent = "Add";
    const commit = () => {
      const v = parseFloat(inp2.value);
      if (!isFinite(v)) {
        msgEl.textContent = "Enter a number.";
        msgEl.style.display = "";
        inp2.focus();
        return;
      }
      const err = validate(v);
      if (err) {
        msgEl.textContent = err;
        msgEl.style.display = "";
        inp2.focus();
        inp2.select();
        return;
      }
      onAdd(v);
      onMarkerChange();
      popup.remove();
    };
    addBtn.onclick = commit;
    inp2.addEventListener("input", () => {
      msgEl.style.display = "none";
    });
    inp2.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        commit();
      }
      if (e.key === "Escape") popup.remove();
    });
    row.appendChild(label);
    row.appendChild(inp2);
    row.appendChild(addBtn);
    popup.appendChild(row);
    return inp2;
  };
  const extrema = findLocalExtrema(points);
  const zeros = findCurveCrossings(points, 0).map(([x]) => x);
  const extremaShown = extrema.length <= MAX_ANNOT;
  const zerosShown = zeros.length <= MAX_ANNOT;
  const xTol = Math.abs(cfg2.xMax - cfg2.xMin) / Math.max(cfg2.nPts, 1);
  const yTol = Math.abs(yMax - yMin) / Math.max(cfg2.nPts, 1);
  const near = (a, b, tol) => Math.abs(a - b) <= tol;
  const inp = mkRow("x =", xDefault, (xv) => {
    if (xv < cfg2.xMin || xv > cfg2.xMax) {
      return `Point is out of bounds \u2014 x range is ${fmtTick(cfg2.xMin)} to ${fmtTick(cfg2.xMax)}.`;
    }
    if (cfg2.xMarkers.some((m) => near(m, xv, xTol))) {
      return `A point at x = ${fmtTick(xv)} already exists.`;
    }
    if (extremaShown) {
      const hit = extrema.find((e) => near(e.x, xv, xTol));
      if (hit) {
        return `A local ${hit.kind === "max" ? "maximum" : "minimum"} is already marked at x = ${fmtTick(hit.x)}.`;
      }
    }
    if (zerosShown && zeros.some((zx) => near(zx, xv, xTol))) {
      return `A zero crossing is already marked at x = ${fmtTick(xv)}.`;
    }
    return null;
  }, (xv) => {
    cfg2.xMarkers.push(xv);
  });
  mkRow("y =", yDefault, (yv) => {
    const hits = findCurveCrossings(points, yv);
    if (hits.length === 0) {
      return "Point is out of bounds \u2014 the curve never reaches that y.";
    }
    if (hits.every(([hx]) => cfg2.xMarkers.some((m) => near(m, hx, xTol)))) {
      return hits.length === 1 ? `A point at y = ${fmtTick(yv)} already exists.` : `All ${hits.length} points at y = ${fmtTick(yv)} already exist.`;
    }
    if (extremaShown) {
      const hit = extrema.find((e) => near(e.y, yv, yTol));
      if (hit) {
        return `A local ${hit.kind === "max" ? "maximum" : "minimum"} is already marked at y = ${fmtTick(hit.y)}.`;
      }
    }
    if (zerosShown && zeros.length > 0 && near(0, yv, yTol)) {
      return "The zero crossings are already marked.";
    }
    return null;
  }, (yv) => {
    for (const [hx] of findCurveCrossings(points, yv)) {
      if (!cfg2.xMarkers.some((m) => near(m, hx, xTol))) cfg2.xMarkers.push(hx);
    }
  });
  popup.appendChild(msgEl);
  const clearRow = document.createElement("div");
  clearRow.className = "plot-ctx-row";
  const clearBtn = document.createElement("button");
  clearBtn.className = "plot-ctx-btn";
  clearBtn.textContent = "Clear All";
  clearBtn.onclick = () => {
    cfg2.xMarkers = [];
    cfg2.yMarkers = [];
    onMarkerChange();
    popup.remove();
  };
  clearRow.appendChild(clearBtn);
  popup.appendChild(clearRow);
  document.body.appendChild(popup);
  inp.focus();
  inp.select();
  const closeOutside = (e) => {
    if (!popup.contains(e.target)) {
      popup.remove();
      document.removeEventListener("mousedown", closeOutside);
    }
  };
  setTimeout(() => document.addEventListener("mousedown", closeOutside), 0);
}
function attachPlotHover(svgWrap, points, cfg2, yMin, yMax, markerData, markerSrc, onMarkerChange, plotW, plotH) {
  const svgEl = svgWrap.querySelector("svg");
  if (!svgEl) return;
  const ml = computePlotML(yMin, yMax);
  const pw = plotW - ml - PLOT_MR;
  const ph = plotH - PLOT_MT - PLOT_MB;
  const xRange = cfg2.xMax - cfg2.xMin || 1;
  const yRange = yMax - yMin || 1;
  const toSX = (x) => ml + (x - cfg2.xMin) / xRange * pw;
  const toSY = (y) => PLOT_MT + ph - (y - yMin) / yRange * ph;
  const toDataX = (sx) => cfg2.xMin + (sx - ml) / pw * xRange;
  const toDataY = (sy) => yMin + (PLOT_MT + ph - sy) / ph * yRange;
  const dark = isDark();
  const hoverColor = dark ? "#34d399" : "#059669";
  const hoverBg = dark ? "rgba(0,0,0,0.78)" : "rgba(255,255,255,0.88)";
  const hoverFg = dark ? "#e4e4e7" : "#18181b";
  const ns = "http://www.w3.org/2000/svg";
  const hg = document.createElementNS(ns, "g");
  hg.style.display = "none";
  hg.style.pointerEvents = "none";
  const hLine = document.createElementNS(ns, "line");
  hLine.setAttribute("stroke", hoverColor);
  hLine.setAttribute("stroke-width", "1");
  hLine.setAttribute("stroke-dasharray", "3,2");
  hLine.setAttribute("y1", String(PLOT_MT));
  hLine.setAttribute("y2", String(PLOT_MT + ph));
  const hDot = document.createElementNS(ns, "circle");
  hDot.setAttribute("r", "4");
  hDot.setAttribute("fill", hoverColor);
  const hBg = document.createElementNS(ns, "rect");
  hBg.setAttribute("rx", "3");
  hBg.setAttribute("fill", hoverBg);
  const hTxt = document.createElementNS(ns, "text");
  hTxt.setAttribute("font-size", "9");
  hTxt.setAttribute("fill", hoverFg);
  hTxt.setAttribute("font-family", "monospace");
  hg.appendChild(hLine);
  hg.appendChild(hDot);
  hg.appendChild(hBg);
  hg.appendChild(hTxt);
  svgEl.appendChild(hg);
  function getSVGX(e) {
    const rect = svgEl.getBoundingClientRect();
    return (e.clientX - rect.left) * (plotW / rect.width);
  }
  function getSVGY(e) {
    const rect = svgEl.getBoundingClientRect();
    return (e.clientY - rect.top) * (plotH / rect.height);
  }
  const HIT_R = 8;
  function markerAt(sx, sy) {
    for (let i = markerData.length - 1; i >= 0; i--) {
      const [xv, yv] = markerData[i];
      if (!isFinite(yv)) continue;
      const dx = toSX(xv) - sx;
      const dy = toSY(yv) - sy;
      if (dx * dx + dy * dy <= HIT_R * HIT_R) return i;
    }
    return -1;
  }
  svgEl.addEventListener("mousemove", (e) => {
    const me = e;
    const sx = getSVGX(me);
    const overNode = markerAt(sx, getSVGY(me)) !== -1;
    svgEl.style.cursor = overNode ? "pointer" : "";
    svgEl.setAttribute("title", overNode ? "Right-click to clear this point" : "");
    if (sx < ml || sx > ml + pw) {
      hg.style.display = "none";
      return;
    }
    const xv = toDataX(sx);
    const yv = interpolatePlot(points, xv);
    if (!isFinite(yv)) {
      hg.style.display = "none";
      return;
    }
    const sy = toSY(yv);
    hg.style.display = "";
    hLine.setAttribute("x1", sx.toFixed(1));
    hLine.setAttribute("x2", sx.toFixed(1));
    hDot.setAttribute("cx", sx.toFixed(1));
    hDot.setAttribute("cy", sy.toFixed(1));
    const label = `(${fmtTick(+xv.toPrecision(5))}, ${fmtTick(+yv.toPrecision(5))})`;
    hTxt.textContent = label;
    const txtW = label.length * 5.5 + 8;
    const txtH = 14;
    let tx = sx + 8;
    if (tx + txtW > ml + pw) tx = sx - txtW - 8;
    const ty = sy < PLOT_MT + ph * 0.25 ? sy + 16 : sy - 6;
    hBg.setAttribute("x", String(tx - 2));
    hBg.setAttribute("y", String(ty - 11));
    hBg.setAttribute("width", String(txtW));
    hBg.setAttribute("height", String(txtH));
    hTxt.setAttribute("x", String(tx));
    hTxt.setAttribute("y", String(ty));
  });
  svgEl.addEventListener("mouseleave", () => {
    hg.style.display = "none";
  });
  svgEl.addEventListener("contextmenu", (e) => {
    const me = e;
    me.preventDefault();
    me.stopPropagation();
    const sx = getSVGX(me);
    const sy = getSVGY(me);
    const hit = markerAt(sx, sy);
    if (hit !== -1) {
      showPlotMarkerDelete(markerSrc[hit], cfg2, onMarkerChange, me.clientX, me.clientY);
      return;
    }
    showPlotMarkerInput(toDataX(sx), toDataY(sy), cfg2, points, yMin, yMax, onMarkerChange, me.clientX, me.clientY);
  });
  svgEl.addEventListener("mousedown", (e) => e.stopPropagation());
}
function buildPlotBlock(el, block) {
  el.classList.add("plot-block");
  const readCfg = () => parsePlotConfig(block.content);
  const initialCfg = readCfg();
  if (!block.content) block.content = JSON.stringify(initialCfg);
  const controls = document.createElement("div");
  controls.className = "plot-controls";
  const exprRow = document.createElement("div");
  exprRow.className = "plot-row";
  const exprLabel = document.createElement("span");
  exprLabel.className = "plot-label";
  exprLabel.textContent = "y =";
  const exprCell = document.createElement("div");
  exprCell.contentEditable = "true";
  exprCell.className = "plot-input plot-expr plot-cell";
  exprCell.dataset.placeholder = "e.g. sin(x),  x^2 + b,  m*x + c";
  exprCell.dataset.raw = initialCfg.expr;
  exprRow.appendChild(exprLabel);
  exprRow.appendChild(exprCell);
  controls.appendChild(exprRow);
  const rangeRow = document.createElement("div");
  rangeRow.className = "plot-row";
  const mkLabel = (text) => {
    const s = document.createElement("span");
    s.className = "plot-label";
    s.textContent = text;
    return s;
  };
  const mkRangeCell = (raw, placeholder, title) => {
    const cell = document.createElement("div");
    cell.contentEditable = "true";
    cell.className = "plot-input plot-range plot-cell";
    cell.dataset.placeholder = placeholder;
    cell.dataset.raw = raw;
    cell.title = title;
    return cell;
  };
  const xVarCell = document.createElement("div");
  xVarCell.contentEditable = "true";
  xVarCell.className = "plot-input plot-xvar plot-cell";
  xVarCell.dataset.placeholder = "x";
  xVarCell.dataset.raw = initialCfg.xVar;
  xVarCell.title = "Sweep variable name";
  const xMinExprInit = initialCfg.xMinExpr ?? String(initialCfg.xMin);
  const xMaxExprInit = initialCfg.xMaxExpr ?? String(initialCfg.xMax);
  const xMinCell = mkRangeCell(xMinExprInit, "0", "Lower bound \u2014 number or variable name");
  const xMaxCell = mkRangeCell(xMaxExprInit, "1", "Upper bound \u2014 number or variable name");
  const fillLabel = document.createElement("label");
  fillLabel.className = "plot-fill-label";
  const fillCheck = document.createElement("input");
  fillCheck.type = "checkbox";
  fillCheck.className = "plot-fill-check";
  fillCheck.checked = initialCfg.fill ?? true;
  fillLabel.appendChild(fillCheck);
  fillLabel.append(" Fill");
  rangeRow.appendChild(mkLabel("x:"));
  rangeRow.appendChild(xVarCell);
  rangeRow.appendChild(mkLabel("from"));
  rangeRow.appendChild(xMinCell);
  rangeRow.appendChild(mkLabel("to"));
  rangeRow.appendChild(xMaxCell);
  rangeRow.appendChild(fillLabel);
  controls.appendChild(rangeRow);
  el.appendChild(controls);
  const svgWrap = document.createElement("div");
  svgWrap.className = "plot-svg-wrap";
  el.appendChild(svgWrap);
  const errEl = document.createElement("div");
  errEl.className = "plot-err";
  el.appendChild(errEl);
  function render() {
    const plotW = block.w ?? PLOT_W;
    const plotH = block.h ?? PLOT_H;
    const { points, yMin, yMax, markerData, markerSrc, xMin, xMax, error } = evalPlotData(block);
    if (error) {
      errEl.textContent = "\u26A0 " + error;
      svgWrap.innerHTML = "";
      return;
    }
    errEl.textContent = "";
    const legacy = readCfg();
    if (legacy.yMarkers.length > 0) {
      for (const yv of legacy.yMarkers) {
        for (const [hx] of findCurveCrossings(points, yv)) {
          if (!legacy.xMarkers.includes(hx)) legacy.xMarkers.push(hx);
        }
      }
      legacy.yMarkers = [];
      block.content = JSON.stringify(legacy);
      render();
      return;
    }
    const cfgNow = readCfg();
    cfgNow.xMin = xMin;
    cfgNow.xMax = xMax;
    svgWrap.innerHTML = buildPlotSVG(points, cfgNow, yMin, yMax, isDark(), markerData, plotW, plotH);
    attachPlotHover(svgWrap, points, cfgNow, yMin, yMax, markerData, markerSrc, () => {
      const next = readCfg();
      next.xMarkers = cfgNow.xMarkers;
      next.yMarkers = cfgNow.yMarkers;
      block.content = JSON.stringify(next);
      render();
    }, plotW, plotH);
  }
  function syncAndRender() {
    const next = readCfg();
    next.expr = exprCell.dataset.raw ?? "";
    next.xVar = xVarCell.dataset.raw?.trim() || "x";
    next.xMinExpr = xMinCell.dataset.raw?.trim() || "0";
    next.xMaxExpr = xMaxCell.dataset.raw?.trim() || "1";
    next.fill = fillCheck.checked;
    block.content = JSON.stringify(next);
    render();
  }
  function renderExprMath() {
    const html = prettifyExpr(exprCell.dataset.raw ?? "");
    if (html) exprCell.innerHTML = html;
    else exprCell.textContent = exprCell.dataset.raw ?? "";
  }
  function renderXVarMath() {
    const html = prettifyExpr(xVarCell.dataset.raw ?? "");
    if (html) xVarCell.innerHTML = html;
    else xVarCell.textContent = xVarCell.dataset.raw ?? "";
  }
  function bindCell(cell, renderMath) {
    cell.addEventListener("focus", () => {
      cell.textContent = cell.dataset.raw ?? "";
      const range = document.createRange();
      range.selectNodeContents(cell);
      range.collapse(false);
      globalThis.getSelection()?.removeAllRanges();
      globalThis.getSelection()?.addRange(range);
    });
    cell.addEventListener("input", () => {
      cell.dataset.raw = cell.textContent ?? "";
    });
    cell.addEventListener("blur", () => {
      cell.dataset.raw = cell.textContent?.trim() ?? "";
      syncAndRender();
      renderMath();
    });
    cell.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        e.target.blur();
      }
    });
  }
  function renderRangeCell(cell) {
    const html = prettifyExpr(cell.dataset.raw ?? "");
    if (html) cell.innerHTML = html;
    else cell.textContent = cell.dataset.raw ?? "";
  }
  bindCell(exprCell, renderExprMath);
  bindCell(xVarCell, renderXVarMath);
  bindCell(xMinCell, () => renderRangeCell(xMinCell));
  bindCell(xMaxCell, () => renderRangeCell(xMaxCell));
  fillCheck.addEventListener("change", syncAndRender);
  renderExprMath();
  renderXVarMath();
  renderRangeCell(xMinCell);
  renderRangeCell(xMaxCell);
  const rightHandle = document.createElement("div");
  rightHandle.className = "plot-right-handle";
  rightHandle.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    e.stopPropagation();
    e.preventDefault();
    rightHandle.setPointerCapture(e.pointerId);
    rightHandle.classList.add("handle-active");
    const startX = e.clientX;
    const startW = block.w ?? PLOT_W;
    const blockLeft = parseInt(el.style.left);
    const maxW = CANVAS_W - margins.right - blockLeft;
    const onMove = (mv) => {
      const newW = Math.min(Math.max(300, startW + (mv.clientX - startX)), maxW);
      block.w = newW;
      render();
    };
    const onUp = () => {
      rightHandle.removeEventListener("pointermove", onMove);
      rightHandle.removeEventListener("pointerup", onUp);
      rightHandle.classList.remove("handle-active");
      document.body.style.cursor = "";
    };
    rightHandle.addEventListener("pointermove", onMove);
    rightHandle.addEventListener("pointerup", onUp);
    document.body.style.cursor = "ew-resize";
  });
  const bottomHandle = document.createElement("div");
  bottomHandle.className = "plot-bottom-handle";
  bottomHandle.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    e.stopPropagation();
    e.preventDefault();
    bottomHandle.setPointerCapture(e.pointerId);
    bottomHandle.classList.add("handle-active");
    const startY = e.clientY;
    const startH = block.h ?? PLOT_H;
    const onMove = (mv) => {
      const newH = Math.max(120, startH + (mv.clientY - startY));
      block.h = newH;
      render();
    };
    const onUp = () => {
      bottomHandle.removeEventListener("pointermove", onMove);
      bottomHandle.removeEventListener("pointerup", onUp);
      bottomHandle.classList.remove("handle-active");
      document.body.style.cursor = "";
    };
    bottomHandle.addEventListener("pointermove", onMove);
    bottomHandle.addEventListener("pointerup", onUp);
    document.body.style.cursor = "ns-resize";
  });
  el.appendChild(rightHandle);
  el.appendChild(bottomHandle);
  el.__plotRerender = render;
  render();
}

// src/blocks/_math-block-helpers.ts
function numInput(label, unit, defaultVal) {
  const wrap = document.createElement("label");
  wrap.className = "math-row";
  const lbl = document.createElement("span");
  lbl.className = "math-label";
  lbl.textContent = label;
  wrap.appendChild(lbl);
  const inp = document.createElement("input");
  inp.type = "number";
  inp.className = "block-input";
  inp.value = String(defaultVal);
  inp.step = "any";
  wrap.appendChild(inp);
  if (unit) {
    const u = document.createElement("span");
    u.className = "math-unit";
    u.textContent = unit;
    wrap.appendChild(u);
  }
  return wrap;
}
function resultRow(label, unit) {
  const row = document.createElement("div");
  row.className = "math-result-row";
  const lbl = document.createElement("span");
  lbl.className = "math-label";
  lbl.textContent = label;
  row.appendChild(lbl);
  const value = document.createElement("span");
  value.className = "math-result-value";
  value.textContent = "\u2014";
  row.appendChild(value);
  if (unit) {
    const u = document.createElement("span");
    u.className = "math-unit";
    u.textContent = unit;
    row.appendChild(u);
  }
  return {
    row,
    value
  };
}

// src/blocks/sect-prop.ts
function buildSectPropBlock(el) {
  const title = document.createElement("div");
  title.className = "math-title";
  title.textContent = "Section Properties";
  el.appendChild(title);
  const bRow = numInput("b", "mm", 100);
  const hRow = numInput("h", "mm", 200);
  const bInp = bRow.querySelector("input");
  const hInp = hRow.querySelector("input");
  const divider = document.createElement("hr");
  divider.className = "math-divider";
  const { row: aRow, value: aVal } = resultRow("Area", "mm\xB2");
  const { row: ixRow, value: ixVal } = resultRow("I\u2093", "mm\u2074");
  function calc() {
    const b = parseFloat(bInp.value);
    const h = parseFloat(hInp.value);
    if (!isNaN(b) && !isNaN(h)) {
      aVal.textContent = rect_area(b, h).toFixed(2);
      ixVal.textContent = rect_ix(b, h).toFixed(2);
    }
  }
  bInp.addEventListener("input", calc);
  hInp.addEventListener("input", calc);
  el.appendChild(bRow);
  el.appendChild(hRow);
  el.appendChild(divider);
  el.appendChild(aRow);
  el.appendChild(ixRow);
  calc();
}

// src/blocks/beam-def.ts
function buildBeamDefBlock(el, E_default) {
  const title = document.createElement("div");
  title.className = "math-title";
  title.textContent = "Beam Deflection";
  const pRow = numInput("P", "kN", 10);
  const lRow = numInput("L", "mm", 3e3);
  const eRow = numInput("E", "MPa", E_default);
  const iRow = numInput("I\u2093", "mm\u2074", 8333333);
  const pInp = pRow.querySelector("input");
  const lInp = lRow.querySelector("input");
  const eInp = eRow.querySelector("input");
  const iInp = iRow.querySelector("input");
  const divider = document.createElement("hr");
  divider.className = "math-divider";
  const { row: dRow, value: dVal } = resultRow("\u03B4\u2098\u2090\u2093", "mm");
  function calc() {
    const p = parseFloat(pInp.value) * 1e3;
    const l = parseFloat(lInp.value);
    const e = parseFloat(eInp.value);
    const i = parseFloat(iInp.value);
    if (![
      p,
      l,
      e,
      i
    ].some(isNaN)) {
      dVal.textContent = solve_beam_deflection(p, l, e, i).toFixed(4);
    }
  }
  pInp.addEventListener("input", calc);
  lInp.addEventListener("input", calc);
  eInp.addEventListener("input", calc);
  iInp.addEventListener("input", calc);
  el.appendChild(title);
  el.appendChild(pRow);
  el.appendChild(lRow);
  el.appendChild(eRow);
  el.appendChild(iRow);
  el.appendChild(divider);
  el.appendChild(dRow);
  calc();
}

// src/blocks/text.ts
function buildTextBlock(el, block) {
  el.classList.add("text-block");
  const DEFAULT_W = 240;
  el.style.width = `${block.w ?? DEFAULT_W}px`;
  const viewDiv = document.createElement("div");
  viewDiv.className = "md-view";
  const toolbar = document.createElement("div");
  toolbar.className = "md-toolbar";
  toolbar.style.display = "none";
  const editArea = document.createElement("textarea");
  editArea.className = "md-edit";
  editArea.placeholder = "Markdown text\u2026\n\n# Heading\n**bold**  *italic*  `code`\n- list item\n  - sub-item\n- [ ] task\n> blockquote\n[link](url)  ![alt](url)\n$a = x^2$\n$$E = mc^2$$";
  editArea.spellcheck = true;
  function syncHeight() {
    editArea.style.height = "auto";
    const snapH = (v) => Math.ceil(v / GRID_SIZE) * GRID_SIZE;
    editArea.style.height = `${snapH(Math.max(editArea.scrollHeight, 60))}px`;
  }
  function saveContent() {
    block.content = editArea.value;
  }
  function wrapSelection(prefix, suffix = prefix) {
    const start2 = editArea.selectionStart;
    const end = editArea.selectionEnd;
    const selected = editArea.value.slice(start2, end);
    const newText = prefix + selected + suffix;
    editArea.setRangeText(newText, start2, end, "end");
    if (!selected) {
      const pos = start2 + prefix.length;
      editArea.setSelectionRange(pos, pos);
    }
    saveContent();
    syncHeight();
    editArea.focus();
  }
  function prefixLines(prefix) {
    const val = editArea.value;
    const start2 = editArea.selectionStart;
    const end = editArea.selectionEnd;
    const lineStart = val.lastIndexOf("\n", start2 - 1) + 1;
    const rawEnd = val.indexOf("\n", end);
    const lineEnd = rawEnd === -1 ? val.length : rawEnd;
    const lines = val.slice(lineStart, lineEnd).split("\n");
    const newText = lines.map((l) => prefix + l).join("\n");
    editArea.setRangeText(newText, lineStart, lineEnd, "end");
    const cursorPos = lineStart + prefix.length;
    editArea.setSelectionRange(cursorPos, cursorPos);
    saveContent();
    syncHeight();
    editArea.focus();
  }
  function promptLink() {
    const sel = editArea.value.slice(editArea.selectionStart, editArea.selectionEnd);
    const url = globalThis.prompt("URL:", "https://");
    if (url == null) {
      editArea.focus();
      return;
    }
    const label = sel || globalThis.prompt("Link text:", "link") || "link";
    const start2 = editArea.selectionStart;
    const end = editArea.selectionEnd;
    const md = `[${label}](${url})`;
    editArea.setRangeText(md, start2, end, "end");
    saveContent();
    syncHeight();
    editArea.focus();
  }
  function promptImage() {
    const url = globalThis.prompt("Image URL:", "https://");
    if (url == null) {
      editArea.focus();
      return;
    }
    const alt = globalThis.prompt("Alt text:", "") || "";
    const start2 = editArea.selectionStart;
    const end = editArea.selectionEnd;
    const md = `![${alt}](${url})`;
    editArea.setRangeText(md, start2, end, "end");
    saveContent();
    syncHeight();
    editArea.focus();
  }
  const buttons = [
    {
      label: "B",
      title: "Bold",
      action: () => wrapSelection("**")
    },
    {
      label: "I",
      title: "Italic",
      action: () => wrapSelection("*")
    },
    {
      label: "`",
      title: "Inline code",
      action: () => wrapSelection("`")
    },
    "sep",
    {
      label: "H1",
      title: "Heading 1",
      action: () => prefixLines("# ")
    },
    {
      label: "H2",
      title: "Heading 2",
      action: () => prefixLines("## ")
    },
    "sep",
    {
      label: "\u2022",
      title: "Bullet list",
      action: () => prefixLines("- ")
    },
    {
      label: "1.",
      title: "Numbered list",
      action: () => prefixLines("1. ")
    },
    {
      label: "\u2611",
      title: "Task list",
      action: () => prefixLines("- [ ] ")
    },
    "sep",
    {
      label: "\u275D",
      title: "Blockquote",
      action: () => prefixLines("> ")
    },
    "sep",
    {
      label: "\u{1F517}",
      title: "Insert link",
      action: promptLink
    },
    {
      label: "img",
      title: "Insert image",
      action: promptImage
    },
    "sep",
    {
      label: "$",
      title: "Inline math",
      action: () => wrapSelection("$")
    },
    {
      label: "$$",
      title: "Block math",
      action: () => {
        const sel = editArea.value.slice(editArea.selectionStart, editArea.selectionEnd);
        if (sel) {
          wrapSelection("$$\n", "\n$$");
        } else {
          const start2 = editArea.selectionStart;
          const ins = "$$\n\n$$";
          editArea.setRangeText(ins, start2, start2, "end");
          const pos = start2 + 3;
          editArea.setSelectionRange(pos, pos);
          saveContent();
          syncHeight();
          editArea.focus();
        }
      }
    }
  ];
  for (const def of buttons) {
    if (def === "sep") {
      const sep = document.createElement("span");
      sep.className = "tb-sep";
      toolbar.appendChild(sep);
    } else {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = def.label;
      btn.title = def.title;
      btn.addEventListener("mousedown", (e) => {
        e.preventDefault();
        def.action();
      });
      toolbar.appendChild(btn);
    }
  }
  function showView() {
    const html = renderMarkdown(block.content || "");
    viewDiv.innerHTML = html || '<span class="md-placeholder">Click to add text\u2026</span>';
    viewDiv.style.display = "";
    editArea.style.display = "none";
    toolbar.style.display = "none";
    viewDiv.querySelectorAll("input[data-task-line]").forEach((cb) => {
      cb.addEventListener("click", (e) => e.stopPropagation());
      cb.addEventListener("change", () => {
        const idx = parseInt(cb.dataset.taskLine);
        const srcLines = (block.content || "").split("\n");
        if (idx < srcLines.length) {
          srcLines[idx] = cb.checked ? srcLines[idx].replace(/\[ \]/, "[x]") : srcLines[idx].replace(/\[x\]/i, "[ ]");
          block.content = srcLines.join("\n");
          showView();
        }
      });
    });
  }
  function enterEdit() {
    const h = viewDiv.offsetHeight;
    editArea.value = block.content || "";
    editArea.style.display = "block";
    toolbar.style.display = "flex";
    viewDiv.style.display = "none";
    const snapH = (v) => Math.ceil(v / GRID_SIZE) * GRID_SIZE;
    editArea.style.height = `${snapH(Math.max(h, 60))}px`;
    if (editArea.scrollHeight > h) editArea.style.height = `${snapH(editArea.scrollHeight)}px`;
    editArea.focus();
  }
  editArea.addEventListener("input", () => {
    saveContent();
    syncHeight();
  });
  editArea.addEventListener("blur", () => {
    saveContent();
    showView();
  });
  editArea.addEventListener("keydown", (e) => {
    if (e.key === "Escape" || e.key === "Enter" && e.altKey) {
      e.preventDefault();
      editArea.blur();
      return;
    }
    if (e.key === "Enter" && !e.shiftKey && !e.altKey && !e.ctrlKey) {
      const val = editArea.value;
      const start2 = editArea.selectionStart;
      const end = editArea.selectionEnd;
      const lineStart = val.lastIndexOf("\n", start2 - 1) + 1;
      const lineRawEnd = val.indexOf("\n", start2);
      const lineEnd = lineRawEnd === -1 ? val.length : lineRawEnd;
      const lineText = val.slice(lineStart, lineEnd);
      const nextLetter = (c) => c === "z" ? "a" : c === "Z" ? "A" : String.fromCharCode(c.charCodeAt(0) + 1);
      let newPrefix = null;
      let prefixLen = 0;
      const taskM = lineText.match(/^(\s*)([-*+])\s+\[[ xX]\]\s*/);
      if (taskM) {
        newPrefix = `${taskM[1]}${taskM[2]} [ ] `;
        prefixLen = taskM[0].length;
      }
      if (!newPrefix) {
        const bulletM = lineText.match(/^(\s*)([-*+])\s+/);
        if (bulletM) {
          newPrefix = `${bulletM[1]}${bulletM[2]} `;
          prefixLen = bulletM[0].length;
        }
      }
      if (!newPrefix) {
        const numM = lineText.match(/^(\s*)(\d+)\.\s+/);
        if (numM) {
          newPrefix = `${numM[1]}${parseInt(numM[2]) + 1}. `;
          prefixLen = numM[0].length;
        }
      }
      if (!newPrefix) {
        const letM = lineText.match(/^(\s*)([a-zA-Z])\.\s+/);
        if (letM) {
          newPrefix = `${letM[1]}${nextLetter(letM[2])}. `;
          prefixLen = letM[0].length;
        }
      }
      if (newPrefix !== null) {
        e.preventDefault();
        const hasContent = val.slice(lineStart + prefixLen, lineEnd).trim().length > 0;
        if (!hasContent) {
          editArea.setRangeText("", lineStart, lineEnd, "end");
          editArea.setSelectionRange(lineStart, lineStart);
        } else {
          editArea.setRangeText("\n" + newPrefix, start2, end, "end");
        }
        saveContent();
        syncHeight();
      }
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const val = editArea.value;
      const start2 = editArea.selectionStart;
      const lineStart = val.lastIndexOf("\n", start2 - 1) + 1;
      const lineRawEnd = val.indexOf("\n", start2);
      const lineEnd = lineRawEnd === -1 ? val.length : lineRawEnd;
      const lineText = val.slice(lineStart, lineEnd);
      const isList = /^\s*([-*+]|\d+\.|[a-zA-Z]\.)\s/.test(lineText);
      if (isList) {
        const m = lineText.match(/^(\s*)([-*+]|\d+\.|[a-zA-Z]\.)\s+(\[[ xX]\]\s+)?(.*)/);
        if (m) {
          const [, curIndent, marker, taskPart = "", content] = m;
          let newIndent;
          let newMarker;
          if (!e.shiftKey) {
            newIndent = curIndent + "  ";
            if (/^\d+\.$/.test(marker)) newMarker = "a.";
            else if (/^[a-zA-Z]\.$/.test(marker)) newMarker = "1.";
            else newMarker = marker;
          } else {
            if (curIndent.length < 2) return;
            newIndent = curIndent.slice(2);
            if (/^[a-zA-Z]\.$/.test(marker)) newMarker = "1.";
            else if (/^\d+\.$/.test(marker)) newMarker = "a.";
            else newMarker = marker;
          }
          const newLine = `${newIndent}${newMarker} ${taskPart}${content}`;
          editArea.setRangeText(newLine, lineStart, lineEnd, "end");
          const newPos = lineStart + newIndent.length + newMarker.length + 1 + taskPart.length;
          editArea.setSelectionRange(newPos, newPos);
          saveContent();
          syncHeight();
          editArea.focus();
        }
      } else {
        editArea.setRangeText("  ", start2, editArea.selectionEnd, "end");
        saveContent();
        syncHeight();
      }
    }
  });
  const handle = document.createElement("div");
  handle.className = "text-resize-handle";
  handle.addEventListener("pointerdown", (e) => {
    e.stopPropagation();
    e.preventDefault();
    handle.setPointerCapture(e.pointerId);
    handle.classList.add("handle-active");
    const startX = e.clientX;
    const startW = el.offsetWidth;
    const blockLeft = parseInt(el.style.left);
    const maxW = CANVAS_W - margins.right - blockLeft;
    function onMove(ev) {
      const newW = Math.min(Math.max(DEFAULT_W, startW + (ev.clientX - startX)), maxW);
      el.style.width = `${newW}px`;
      block.w = newW;
    }
    function onUp() {
      handle.removeEventListener("pointermove", onMove);
      handle.removeEventListener("pointerup", onUp);
      handle.classList.remove("handle-active");
      document.body.style.cursor = "";
    }
    handle.addEventListener("pointermove", onMove);
    handle.addEventListener("pointerup", onUp);
    document.body.style.cursor = "ew-resize";
  });
  viewDiv.addEventListener("mousedown", (e) => e.stopPropagation());
  editArea.addEventListener("mousedown", (e) => e.stopPropagation());
  toolbar.addEventListener("mousedown", (e) => e.stopPropagation());
  viewDiv.addEventListener("click", enterEdit);
  el.appendChild(toolbar);
  el.appendChild(viewDiv);
  el.appendChild(editArea);
  el.appendChild(handle);
  showView();
}

// src/blocks/figure.ts
function nextFigureNum() {
  let max = 0;
  for (const b of state.blocks) {
    if (b.type === "figure" && b.label) {
      const m = b.label.match(/^Fig\s+(\d+)$/i);
      if (m) max = Math.max(max, parseInt(m[1]));
    }
  }
  return max + 1;
}
function buildFigureBlock(el, block) {
  el.classList.add("figure-block");
  const DEFAULT_W = 240;
  const DEFAULT_H = 200;
  el.style.width = `${block.w ?? DEFAULT_W}px`;
  el.style.height = `${block.h ?? DEFAULT_H}px`;
  let data;
  try {
    data = JSON.parse(block.content || "{}");
  } catch {
    data = {
      src: "",
      caption: ""
    };
  }
  const header = document.createElement("div");
  header.className = "figure-label";
  header.textContent = block.label ?? "Figure";
  el.appendChild(header);
  const imgWrap = document.createElement("div");
  imgWrap.className = "figure-img-wrap";
  const img = document.createElement("img");
  img.className = "figure-img";
  img.draggable = false;
  img.alt = "";
  const placeholder = document.createElement("div");
  placeholder.className = "figure-placeholder";
  placeholder.innerHTML = "<span>Paste image (Ctrl+V)<br>or click to upload</span>";
  function loadSrc(src) {
    data.src = src;
    block.content = JSON.stringify(data);
    img.src = src;
    img.style.display = "";
    placeholder.style.display = "none";
    const applyAspect = () => {
      if (!img.naturalWidth || !img.naturalHeight) return;
      const w = el.offsetWidth;
      const chromeH = header.offsetHeight + caption.offsetHeight;
      const imgH = Math.round(w / (img.naturalWidth / img.naturalHeight) / GRID_SIZE) * GRID_SIZE;
      block.h = Math.max(GRID_SIZE * 2, imgH) + chromeH;
      el.style.height = `${block.h}px`;
    };
    if (img.complete && img.naturalWidth) applyAspect();
    else img.onload = applyAspect;
  }
  if (data.src) {
    img.src = data.src;
    img.style.display = "";
    placeholder.style.display = "none";
  } else {
    img.style.display = "none";
  }
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.style.display = "none";
  fileInput.addEventListener("change", () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => loadSrc(reader.result);
    reader.readAsDataURL(file);
  });
  placeholder.addEventListener("click", () => fileInput.click());
  imgWrap.appendChild(img);
  imgWrap.appendChild(placeholder);
  el.appendChild(imgWrap);
  const caption = document.createElement("div");
  caption.className = "figure-caption";
  caption.contentEditable = "true";
  caption.dataset.placeholder = "Caption\u2026";
  caption.textContent = data.caption || "";
  caption.addEventListener("mousedown", (e) => e.stopPropagation());
  caption.addEventListener("blur", () => {
    data.caption = caption.textContent ?? "";
    block.content = JSON.stringify(data);
  });
  el.appendChild(caption);
  el.appendChild(fileInput);
  el.tabIndex = 0;
  el.addEventListener("paste", (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) continue;
        const reader = new FileReader();
        reader.onload = () => loadSrc(reader.result);
        reader.readAsDataURL(file);
        return;
      }
    }
  });
  const rightHandle = document.createElement("div");
  rightHandle.className = "figure-resize-handle";
  rightHandle.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    e.stopPropagation();
    e.preventDefault();
    rightHandle.setPointerCapture(e.pointerId);
    rightHandle.classList.add("handle-active");
    const startX = e.clientX;
    const startW = el.offsetWidth;
    const onMove = (mv) => {
      const newW = Math.max(80, Math.round((startW + (mv.clientX - startX)) / GRID_SIZE) * GRID_SIZE);
      block.w = newW;
      el.style.width = `${newW}px`;
    };
    const onUp = () => {
      rightHandle.removeEventListener("pointermove", onMove);
      rightHandle.removeEventListener("pointerup", onUp);
      rightHandle.classList.remove("handle-active");
      document.body.style.cursor = "";
    };
    rightHandle.addEventListener("pointermove", onMove);
    rightHandle.addEventListener("pointerup", onUp);
    document.body.style.cursor = "ew-resize";
  });
  const bottomHandle = document.createElement("div");
  bottomHandle.className = "figure-bottom-handle";
  bottomHandle.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    e.stopPropagation();
    e.preventDefault();
    bottomHandle.setPointerCapture(e.pointerId);
    bottomHandle.classList.add("handle-active");
    const startY = e.clientY;
    const startH = el.offsetHeight;
    const onMove = (mv) => {
      const newH = Math.max(GRID_SIZE * 3, Math.round((startH + (mv.clientY - startY)) / GRID_SIZE) * GRID_SIZE);
      block.h = newH;
      el.style.height = `${newH}px`;
    };
    const onUp = () => {
      bottomHandle.removeEventListener("pointermove", onMove);
      bottomHandle.removeEventListener("pointerup", onUp);
      bottomHandle.classList.remove("handle-active");
      document.body.style.cursor = "";
    };
    bottomHandle.addEventListener("pointermove", onMove);
    bottomHandle.addEventListener("pointerup", onUp);
    document.body.style.cursor = "ns-resize";
  });
  el.appendChild(rightHandle);
  el.appendChild(bottomHandle);
  imgWrap.addEventListener("mousedown", (e) => {
    const t = e.target;
    if (t !== rightHandle && t !== bottomHandle) e.stopPropagation();
  });
}

// src/canvas.ts
var Canvas = class {
  element;
  guide;
  cursor;
  constructor(id) {
    this.element = document.getElementById(id);
    this.element.style.width = `${CANVAS_W}px`;
    this.element.style.height = `${CANVAS_H}px`;
    this.element.addEventListener("dragover", (e) => e.preventDefault());
    this.guide = document.createElement("div");
    this.guide.id = "margin-guide";
    this.guide.classList.add("engineering-grid");
    this.element.appendChild(this.guide);
    this.cursor = document.getElementById("grid-cursor");
    this.cursor.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" style="position:absolute;top:-5px;left:-5px;display:block"><line x1="0" y1="5" x2="10" y2="5" stroke="#f97316" stroke-width="1.5" stroke-linecap="round"/><line x1="5" y1="0" x2="5" y2="10" stroke="#f97316" stroke-width="1.5" stroke-linecap="round"/></svg>`;
    this.updateMarginGuide();
  }
  moveGhost(canvasX, canvasY) {
    this.cursor.style.transform = `translate(${canvasX}px, ${canvasY}px)`;
  }
  get domElement() {
    return this.element;
  }
  snap(value) {
    return Math.round(value / GRID_SIZE) * GRID_SIZE;
  }
  updateMarginGuide() {
    const guideH = PAGE_H - margins.top - margins.bottom;
    this.guide.style.top = `${margins.top}px`;
    this.guide.style.left = `${margins.left}px`;
    this.guide.style.right = `${margins.right}px`;
    this.guide.style.height = `${guideH}px`;
    this.guide.style.bottom = "auto";
    this.guide.style.backgroundPosition = "0 0";
    this.element.querySelectorAll(".page-num").forEach((pn, i) => {
      pn.style.top = `${(i + 1) * PAGE_H - margins.bottom}px`;
      pn.style.right = `${margins.right}px`;
    });
    this.element.querySelectorAll(".page-guide").forEach((g, i) => {
      const pageIdx = i + 1;
      g.style.top = `${pageIdx * PAGE_H + margins.top}px`;
      g.style.left = `${margins.left}px`;
      g.style.right = `${margins.right}px`;
      g.style.height = `${guideH}px`;
      g.style.bottom = "auto";
      g.style.backgroundPosition = "0 0";
    });
    this.element.querySelectorAll(".block").forEach((el) => {
      if (childToSection.has(el.id)) return;
      const block = state.blocks.find((b) => b.id === el.id);
      if (!block) return;
      if (block.type === "section") {
        block.x = 0;
        el.style.left = `${margins.left}px`;
        el.style.top = `${clamp(margins.top + titleBlockH() + block.y, margins.top + titleBlockH(), CANVAS_H - el.offsetHeight)}px`;
        el.style.width = `${CANVAS_W - margins.left - margins.right}px`;
        el.style.maxWidth = "";
        return;
      }
      const tbH = titleBlockH();
      const absLeft = clamp(margins.left + block.x, margins.left, CANVAS_W - margins.right - el.offsetWidth);
      const absTop = clamp(margins.top + block.y, margins.top + tbH, CANVAS_H - el.offsetHeight);
      el.style.left = `${absLeft}px`;
      el.style.top = `${absTop}px`;
      el.style.maxWidth = `${CANVAS_W - margins.right - absLeft}px`;
    });
    this.element.querySelectorAll(".title-block-overlay").forEach((el, i) => {
      el.style.left = `${margins.left}px`;
      el.style.top = `${i * PAGE_H + margins.top}px`;
      el.style.width = `${CANVAS_W - margins.left - margins.right}px`;
    });
  }
  addBlock(block) {
    const el = document.createElement("div");
    el.id = block.id;
    el.className = "block";
    if (!block.parentSectionId) {
      const initLeft = margins.left + this.snap(block.x);
      el.style.left = `${initLeft}px`;
      el.style.top = `${margins.top + this.snap(block.y)}px`;
      el.style.maxWidth = `${CANVAS_W - margins.right - initLeft}px`;
    } else {
      el.style.left = `${this.snap(block.x)}px`;
      el.style.top = `${this.snap(block.y)}px`;
    }
    if (block.type === "section") {
      block.x = 0;
      const sectionW = CANVAS_W - margins.left - margins.right;
      el.style.left = `${margins.left}px`;
      el.style.width = `${sectionW}px`;
      el.style.maxWidth = "";
      buildSectionBlock(el, block);
    } else if (block.type === "plot") {
      buildPlotBlock(el, block);
    } else if (block.type === "header") {
      const h2 = document.createElement("h2");
      h2.contentEditable = "true";
      h2.textContent = block.content || "";
      h2.dataset.placeholder = "Heading\u2026";
      h2.addEventListener("blur", () => {
        block.content = h2.textContent ?? "";
      });
      el.appendChild(h2);
    } else if (block.type === "formula") {
      buildFormulaBlock(el, block);
    } else if (block.type === "math" && block.subtype === "sect-prop") {
      buildSectPropBlock(el);
    } else if (block.type === "math" && block.subtype === "beam-def") {
      buildBeamDefBlock(el, state.constants.E ?? 2e5);
    } else if (block.type === "summary") {
      buildFormulaBlock(el, block);
      el.classList.add("summary-block");
    } else if (block.type === "text") {
      buildTextBlock(el, block);
    } else if (block.type === "figure") {
      buildFigureBlock(el, block);
    } else {
      const div = document.createElement("div");
      div.contentEditable = "true";
      div.className = "block-text";
      div.textContent = block.content || "";
      div.dataset.placeholder = `New ${block.type} block`;
      div.addEventListener("blur", () => {
        block.content = div.textContent ?? "";
      });
      el.appendChild(div);
    }
    el.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      const target = e.target;
      if (target.tagName === "INPUT" || target.isContentEditable) return;
      if (block.type === "section") return;
      e.stopPropagation();
      if (e.shiftKey) {
        onAddToSelection?.(el);
      } else if (!selectedEls.has(el)) {
        onSelectBlock?.(el);
      }
      setMultiDragState({
        startX: e.clientX,
        startY: e.clientY,
        origPositions: new Map([
          ...selectedEls
        ].map((s) => [
          s,
          {
            left: parseInt(s.style.left),
            top: parseInt(s.style.top)
          }
        ]))
      });
      document.body.style.cursor = "grabbing";
      e.preventDefault();
    });
    const LONG_PRESS_MS = 500;
    const CANCEL_PX = 8;
    const EDGE_PX = 24;
    let lpTimer = null;
    let lpStartX = 0, lpStartY = 0, lpId = -1;
    el.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "touch") return;
      lpStartX = e.clientX;
      lpStartY = e.clientY;
      lpId = e.pointerId;
      if (lpTimer !== null) {
        clearTimeout(lpTimer);
        lpTimer = null;
      }
      lpTimer = setTimeout(() => {
        lpTimer = null;
        const rect = el.getBoundingClientRect();
        const rx = lpStartX - rect.left;
        const ry = lpStartY - rect.top;
        const onEdge = rx < EDGE_PX || rx > rect.width - EDGE_PX || ry < EDGE_PX || ry > rect.height - EDGE_PX;
        if (onEdge) {
          onSelectBlock?.(el);
        } else {
          setMultiDragState(null);
          document.body.style.cursor = "";
          const hit = document.elementFromPoint(lpStartX, lpStartY) ?? el;
          hit.dispatchEvent(new MouseEvent("contextmenu", {
            bubbles: true,
            cancelable: true,
            clientX: lpStartX,
            clientY: lpStartY,
            view: window
          }));
        }
      }, LONG_PRESS_MS);
    });
    const lpCancel = (e) => {
      if (e.pointerType !== "touch" || e.pointerId !== lpId || lpTimer === null) return;
      if (e.type === "pointermove") {
        if (Math.hypot(e.clientX - lpStartX, e.clientY - lpStartY) > CANCEL_PX) {
          clearTimeout(lpTimer);
          lpTimer = null;
        }
      } else {
        clearTimeout(lpTimer);
        lpTimer = null;
      }
    };
    el.addEventListener("pointermove", lpCancel);
    el.addEventListener("pointerup", lpCancel);
    el.addEventListener("pointercancel", lpCancel);
    this.element.appendChild(el);
  }
};

// src/dnd.ts
function showCursor() {
  document.getElementById("grid-cursor").style.zIndex = "9999";
}
function hideCursor() {
  document.getElementById("grid-cursor").style.zIndex = "-1";
}
function selectBlock(el) {
  for (const s of selectedEls) s.classList.remove("selected");
  selectedEls.clear();
  setSelectedEl(el);
  selectedEls.add(el);
  el.classList.add("selected");
  hideCursor();
}
function addToSelection(el) {
  if (selectedEls.has(el)) {
    el.classList.remove("selected");
    selectedEls.delete(el);
    if (selectedEl === el) setSelectedEl(selectedEls.size > 0 ? [
      ...selectedEls
    ].at(-1) : null);
    if (selectedEls.size === 0) showCursor();
  } else {
    el.classList.add("selected");
    selectedEls.add(el);
    setSelectedEl(el);
    hideCursor();
  }
}
function clearSelection() {
  for (const s of selectedEls) s.classList.remove("selected");
  selectedEls.clear();
  setSelectedEl(null);
  showCursor();
}
function deleteBlock(el) {
  const idx = state.blocks.findIndex((b) => b.id === el.id);
  if (idx !== -1) {
    const block = state.blocks[idx];
    deletionStack.push({
      ...block
    });
    if (block.type === "section") {
      const content = el.querySelector(".section-content");
      if (content) {
        for (const child of Array.from(content.querySelectorAll(".block"))) {
          const childBlock = state.blocks.find((b) => b.id === child.id);
          if (childBlock) {
            unparentFromSection(child, el);
          }
        }
      }
    } else if (block.parentSectionId) {
      childToSection.delete(block.id);
      delete block.parentSectionId;
    }
    state.blocks.splice(idx, 1);
  }
  el.remove();
  selectedEls.delete(el);
  if (selectedEl === el) {
    setSelectedEl(selectedEls.size > 0 ? [
      ...selectedEls
    ].at(-1) : null);
    if (selectedEls.size === 0) showCursor();
  }
  reEvalAllFormulas();
  updatePageCount();
}
function shiftBlocksVertical(thresholdY, delta) {
  for (const el of canvas.domElement.querySelectorAll(".block")) {
    const top = parseInt(el.style.top);
    if (top >= thresholdY) {
      const newTop = clamp(top + delta, margins.top, CANVAS_H + PAGE_H);
      placeBlock(el, parseInt(el.style.left), newTop);
    }
  }
  updatePageCount();
}
function syncTitleBlocks() {
  canvas.domElement.querySelectorAll(".title-block-overlay").forEach((e) => e.remove());
  if (!titleBlockEnabled) return;
  if (!state.titleBlock) {
    state.titleBlock = {
      project: "",
      by: "",
      sheetNo: "",
      subject: "",
      subject2: "",
      subject3: "",
      date: "",
      jobNo: ""
    };
  }
  const w = CANVAS_W - margins.left - margins.right;
  for (let i = 0; i < numPages; i++) {
    const el = document.createElement("div");
    el.className = "block title-block title-block-overlay";
    el.style.left = `${margins.left}px`;
    el.style.top = `${i * PAGE_H + margins.top}px`;
    el.style.width = `${w}px`;
    el.style.maxWidth = "";
    el.style.zIndex = "2";
    buildTitleBlockOverlay(el, i);
    canvas.domElement.appendChild(el);
  }
}
function syncPageSeparators() {
  canvas.domElement.querySelectorAll(".page-sep, .page-guide, .page-num").forEach((e) => e.remove());
  const isGridOn = document.getElementById("margin-guide").classList.contains("engineering-grid");
  for (let i = 1; i < numPages; i++) {
    const guide = document.createElement("div");
    guide.className = "page-guide";
    if (isGridOn) guide.classList.add("engineering-grid");
    canvas.domElement.appendChild(guide);
    const sep = document.createElement("div");
    sep.className = "page-sep";
    sep.style.top = `${i * PAGE_H}px`;
    const label = document.createElement("span");
    label.textContent = `Page ${i + 1}`;
    sep.appendChild(label);
    canvas.domElement.appendChild(sep);
  }
  if (!titleBlockEnabled) {
    for (let i = 1; i <= numPages; i++) {
      const pn = document.createElement("div");
      pn.className = "page-num";
      pn.textContent = `Page ${i} of ${numPages}`;
      pn.style.top = `${i * PAGE_H - margins.bottom}px`;
      pn.style.right = `${margins.right}px`;
      canvas.domElement.appendChild(pn);
    }
  }
  canvas.updateMarginGuide();
  syncTitleBlocks();
}
function updatePageCount() {
  const blockEls = canvas.domElement.querySelectorAll(".block");
  let maxBottom = 0;
  for (const el of blockEls) {
    if (childToSection.has(el.id)) continue;
    const bot = parseInt(el.style.top) + el.offsetHeight;
    if (bot > maxBottom) maxBottom = bot;
  }
  const needed = Math.max(1, Math.ceil((maxBottom + margins.bottom) / PAGE_H));
  if (needed === numPages) return;
  setNumPages(needed);
  setCANVAS_H(numPages * PAGE_H);
  canvas.domElement.style.height = `${CANVAS_H}px`;
  syncPageSeparators();
}
function buildTitleBlockOverlay(el, pageIdx = 0) {
  el.innerHTML = "";
  el.classList.add("title-block", "title-block-overlay");
  el.style.padding = "0";
  el.style.cursor = "default";
  el.style.zIndex = "2";
  const data = state.titleBlock ?? {
    project: "",
    by: "",
    sheetNo: "",
    subject: "",
    subject2: "",
    subject3: "",
    date: "",
    jobNo: ""
  };
  if (!state.titleBlock) state.titleBlock = data;
  function save() {
    canvas.domElement.querySelectorAll(".title-block-overlay").forEach((other) => {
      if (other === el) return;
      other.querySelectorAll("[data-tb-field]").forEach((cell) => {
        const f = cell.dataset.tbField;
        if (!cell.contains(document.activeElement)) {
          cell.textContent = data[f] ?? "";
        }
      });
    });
  }
  const table = document.createElement("table");
  table.className = "title-block-table";
  function makeLabel(text) {
    const td = document.createElement("td");
    td.className = "tb-label";
    td.textContent = text;
    return td;
  }
  function makeValue(key, cls = "") {
    const td = document.createElement("td");
    td.className = `tb-value${cls ? " " + cls : ""}`;
    td.dataset.tbField = key;
    td.contentEditable = "true";
    td.textContent = data[key] ?? "";
    td.addEventListener("mousedown", (ev) => ev.stopPropagation());
    td.addEventListener("blur", () => {
      data[key] = td.textContent ?? "";
      save();
    });
    td.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") {
        ev.preventDefault();
        td.blur();
      }
    });
    return td;
  }
  const logoTd = document.createElement("td");
  logoTd.className = "tb-logo";
  logoTd.rowSpan = 4;
  const logoImg = document.createElement("img");
  logoImg.className = "tb-logo-img";
  if (data.logo) {
    logoImg.src = data.logo;
    logoImg.style.display = "";
  } else logoImg.style.display = "none";
  const logoPh = document.createElement("div");
  logoPh.className = "tb-logo-ph";
  logoPh.textContent = "+ Logo";
  if (data.logo) logoPh.style.display = "none";
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/png,image/jpeg";
  fileInput.style.display = "none";
  fileInput.addEventListener("change", () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result;
      data.logo = url;
      canvas.domElement.querySelectorAll(".title-block-overlay").forEach((o) => {
        const img = o.querySelector(".tb-logo-img");
        const ph = o.querySelector(".tb-logo-ph");
        if (img) {
          img.src = url;
          img.style.display = "";
        }
        if (ph) ph.style.display = "none";
      });
    };
    reader.readAsDataURL(file);
  });
  logoTd.appendChild(logoImg);
  logoTd.appendChild(logoPh);
  logoTd.appendChild(fileInput);
  logoTd.addEventListener("click", (ev) => {
    ev.stopPropagation();
    fileInput.click();
  });
  logoTd.addEventListener("mousedown", (ev) => ev.stopPropagation());
  const lbProject = makeLabel("Project");
  lbProject.style.width = "68px";
  const lbBy = makeLabel("By");
  lbBy.style.width = "68px";
  const lbSheetNo = makeLabel("Sheet No.");
  lbSheetNo.style.width = "68px";
  const ROW_H = "28px";
  const row1 = document.createElement("tr");
  row1.style.height = ROW_H;
  row1.appendChild(logoTd);
  row1.appendChild(lbProject);
  row1.appendChild(makeValue("project", "tb-wide"));
  row1.appendChild(lbBy);
  row1.appendChild(lbSheetNo);
  table.appendChild(row1);
  const sheetNoTd = document.createElement("td");
  sheetNoTd.className = "tb-value tb-narrow tb-sheet-num";
  sheetNoTd.textContent = `${pageIdx + 1} of ${numPages}`;
  const row2 = document.createElement("tr");
  row2.style.height = ROW_H;
  row2.appendChild(makeLabel("Subject"));
  row2.appendChild(makeValue("subject", "tb-wide"));
  row2.appendChild(makeValue("by"));
  row2.appendChild(sheetNoTd);
  table.appendChild(row2);
  const row3 = document.createElement("tr");
  row3.style.height = ROW_H;
  const blank3 = document.createElement("td");
  blank3.className = "tb-blank";
  row3.appendChild(blank3);
  row3.appendChild(makeValue("subject2", "tb-wide"));
  row3.appendChild(makeLabel("Date"));
  row3.appendChild(makeLabel("Job No."));
  table.appendChild(row3);
  const row4 = document.createElement("tr");
  row4.style.height = ROW_H;
  const blank4 = document.createElement("td");
  blank4.className = "tb-blank";
  row4.appendChild(blank4);
  row4.appendChild(makeValue("subject3", "tb-wide"));
  row4.appendChild(makeValue("date"));
  row4.appendChild(makeValue("jobNo", "tb-narrow"));
  table.appendChild(row4);
  el.appendChild(table);
}
function placeBlock(el, newLeft, newTop) {
  const b = state.blocks.find((blk) => blk.id === el.id);
  if (b?.type === "section") {
    el.style.left = `${margins.left}px`;
    el.style.top = `${newTop}px`;
    el.style.width = `${CANVAS_W - margins.left - margins.right}px`;
    el.style.maxWidth = "";
    b.x = 0;
    b.y = newTop - margins.top - titleBlockH();
    return;
  }
  el.style.left = `${newLeft}px`;
  el.style.top = `${newTop}px`;
  el.style.maxWidth = `${CANVAS_W - margins.right - newLeft}px`;
  if (b) {
    b.x = newLeft - margins.left;
    b.y = newTop - margins.top;
  }
}
function blocksOverlap(a, b) {
  const aL = parseInt(a.style.left), aT = parseInt(a.style.top);
  const aR = aL + a.offsetWidth, aB = aT + a.offsetHeight;
  const bL = parseInt(b.style.left), bT = parseInt(b.style.top);
  const bR = bL + b.offsetWidth, bB = bT + b.offsetHeight;
  return aR > bL && aL < bR && aB > bT && aT < bB;
}
function resolveOverlapsRight(movedEl) {
  if (movedEl.classList.contains("title-block") || movedEl.classList.contains("section-block")) {
    return;
  }
  const movedLeft = parseInt(movedEl.style.left);
  const movedTop = parseInt(movedEl.style.top);
  const movedBottom = movedTop + movedEl.offsetHeight;
  const wrapY = margins.top + Math.ceil((movedBottom - margins.top) / GRID_SIZE) * GRID_SIZE;
  function inRegion(el) {
    if (el.classList.contains("title-block")) return false;
    if (el.classList.contains("section-block")) return false;
    if (childToSection.has(el.id)) return false;
    const elLeft = parseInt(el.style.left);
    const elTop = parseInt(el.style.top);
    if (elLeft < movedLeft) return false;
    if (elTop < movedTop) return false;
    if (elTop >= movedBottom) return false;
    return true;
  }
  for (let iter = 0; iter < 100; iter++) {
    const els = [
      movedEl,
      ...Array.from(canvas.domElement.querySelectorAll(".block")).filter((el) => el !== movedEl && inRegion(el))
    ].sort((a, b) => parseInt(a.style.left) - parseInt(b.style.left));
    let didMove = false;
    outer: for (let i = 0; i < els.length; i++) {
      for (let j = i + 1; j < els.length; j++) {
        const a = els[i], b = els[j];
        if (!blocksOverlap(a, b)) continue;
        const aRight = parseInt(a.style.left) + a.offsetWidth;
        const needed = margins.left + Math.round((aRight - margins.left) / GRID_SIZE) * GRID_SIZE;
        const maxLeft = CANVAS_W - margins.right - b.offsetWidth;
        if (needed > maxLeft) {
          const bH = b.offsetHeight;
          for (const other of canvas.domElement.querySelectorAll(".block")) {
            if (other === movedEl || other === b) continue;
            if (other.classList.contains("title-block")) continue;
            if (childToSection.has(other.id)) continue;
            const otherTop = parseInt(other.style.top);
            if (otherTop >= wrapY) {
              placeBlock(other, parseInt(other.style.left), otherTop + bH + GRID_SIZE);
            }
          }
          placeBlock(b, margins.left, wrapY);
        } else {
          placeBlock(b, needed, parseInt(b.style.top));
        }
        didMove = true;
        break outer;
      }
    }
    if (!didMove) break;
  }
}
function blockAtCursor(canvasX, canvasY) {
  for (const el of canvas.domElement.querySelectorAll(".block:not(.section-block)")) {
    const left = parseInt(el.style.left);
    const top = parseInt(el.style.top);
    if (canvasX >= left && canvasX <= left + el.offsetWidth && canvasY >= top && canvasY <= top + el.offsetHeight) {
      return el;
    }
  }
  return null;
}
function moveGridCursor(canvasX, canvasY) {
  const tbH = titleBlockH();
  const snappedX = margins.left + Math.round((canvasX - margins.left) / GRID_SIZE) * GRID_SIZE;
  gridCursor.x = clamp(snappedX, margins.left, CANVAS_W - margins.right);
  const gridOrigin = (pi) => pi * PAGE_H + margins.top;
  const pageEffTop = (pi) => pi * PAGE_H + margins.top + tbH;
  const pageEffBot = (pi) => pi * PAGE_H + PAGE_H - margins.bottom;
  const firstGridY = (pi) => {
    const go = gridOrigin(pi);
    return go + Math.ceil((pageEffTop(pi) - go) / GRID_SIZE) * GRID_SIZE;
  };
  const lastGridY = (pi) => {
    const go = gridOrigin(pi);
    return go + Math.floor((pageEffBot(pi) - go) / GRID_SIZE) * GRID_SIZE;
  };
  const rawPageIdx = Math.max(0, Math.floor(canvasY / PAGE_H));
  let finalY;
  if (canvasY < pageEffTop(rawPageIdx)) {
    finalY = rawPageIdx > 0 ? lastGridY(rawPageIdx - 1) : firstGridY(0);
  } else if (canvasY > pageEffBot(rawPageIdx)) {
    const next = rawPageIdx + 1;
    finalY = next * PAGE_H < CANVAS_H ? firstGridY(next) : lastGridY(rawPageIdx);
  } else {
    const go = gridOrigin(rawPageIdx);
    finalY = go + Math.round((canvasY - go) / GRID_SIZE) * GRID_SIZE;
    finalY = clamp(finalY, firstGridY(rawPageIdx), lastGridY(rawPageIdx));
  }
  gridCursor.y = finalY;
  canvas.moveGhost(gridCursor.x, gridCursor.y);
  const el = document.getElementById("cursor-coords");
  if (el) el.textContent = `x: ${gridCursor.x}px  y: ${gridCursor.y}px`;
  const hit = blockAtCursor(gridCursor.x, gridCursor.y);
  if (hit) {
    selectBlock(hit);
    const editable = hit.querySelector('input, [contenteditable="true"]');
    editable?.focus();
  } else {
    clearSelection();
  }
}
function renderBlock(block) {
  canvas.addBlock(block);
}
function dropBlock(type, subtype, canvasX, canvasY) {
  if (type === "summary" && !sectionAtPoint(canvasX, canvasY)) return;
  const customMod = type === "formula" && subtype ? customModules.find((m) => m.id === subtype) : void 0;
  if (customMod?.blocks) {
    clearSelection();
    const baseX = canvasX - margins.left;
    const baseY = canvasY - margins.top;
    const targetSection = sectionAtPoint(canvasX, canvasY);
    for (const b of customMod.blocks) {
      const block2 = {
        id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type: b.type,
        subtype: b.subtype,
        x: baseX + b.dx,
        y: baseY + b.dy,
        w: b.w,
        content: b.content,
        label: b.label
      };
      state.blocks.push(block2);
      renderBlock(block2);
      const el2 = document.getElementById(block2.id);
      if (el2) {
        if (targetSection) reparentToSection(el2, targetSection);
        selectedEls.add(el2);
        el2.classList.add("selected");
        setSelectedEl(el2);
      }
    }
    reEvalAllFormulas();
    updatePageCount();
    return;
  }
  const block = {
    id: `block-${Date.now()}`,
    type,
    subtype,
    x: canvasX - margins.left,
    y: canvasY - margins.top,
    content: customMod ? customMod.content : type === "formula" ? "x = " : type === "summary" ? "x = " : "",
    label: customMod ? customMod.label : type === "formula" ? "Formula" : type === "summary" ? "Summary" : type === "figure" ? `Fig ${nextFigureNum()}` : void 0,
    w: type === "figure" ? 240 : void 0,
    h: type === "figure" ? 200 : void 0,
    sectionName: type === "section" ? nextSectionName() : void 0
  };
  state.blocks.push(block);
  renderBlock(block);
  const el = document.getElementById(block.id);
  if (el) {
    if (type !== "section") {
      const targetSection = sectionAtPoint(canvasX, canvasY);
      if (targetSection) reparentToSection(el, targetSection);
    }
    selectBlock(el);
  }
  reEvalAllFormulas();
  updatePageCount();
}

// src/persistence.ts
function showImportToolsDialog(tools) {
  const overlay = document.createElement("div");
  overlay.className = "import-modal-overlay";
  const dialog = document.createElement("div");
  dialog.className = "import-modal";
  const title = document.createElement("h3");
  title.textContent = "Import Custom Tools";
  dialog.appendChild(title);
  const subtitle = document.createElement("p");
  subtitle.className = "import-modal-sub";
  subtitle.textContent = "Select tools to add to this project:";
  dialog.appendChild(subtitle);
  const listEl = document.createElement("div");
  listEl.className = "import-modal-list";
  const checkboxes = [];
  for (const mod of tools) {
    const alreadyExists = customModules.some((m) => m.name === mod.name);
    const row = document.createElement("label");
    row.className = "import-tool-row";
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = !alreadyExists;
    cb.disabled = alreadyExists;
    row.appendChild(cb);
    const nameSpan = document.createElement("span");
    nameSpan.textContent = mod.name;
    row.appendChild(nameSpan);
    if (alreadyExists) {
      const note = document.createElement("span");
      note.className = "import-tool-exists";
      note.textContent = "(already exists)";
      row.appendChild(note);
    }
    listEl.appendChild(row);
    checkboxes.push({
      cb,
      mod
    });
  }
  dialog.appendChild(listEl);
  const btnRow = document.createElement("div");
  btnRow.className = "import-modal-btns";
  const selectAllBtn = document.createElement("button");
  selectAllBtn.textContent = "Select All";
  selectAllBtn.addEventListener("click", () => {
    checkboxes.forEach(({ cb }) => {
      if (!cb.disabled) cb.checked = true;
    });
  });
  btnRow.appendChild(selectAllBtn);
  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "Cancel";
  cancelBtn.addEventListener("click", () => overlay.remove());
  btnRow.appendChild(cancelBtn);
  const importBtn = document.createElement("button");
  importBtn.className = "import-confirm-btn";
  importBtn.textContent = "Import Selected";
  importBtn.addEventListener("click", () => {
    const selected = checkboxes.filter(({ cb }) => cb.checked && !cb.disabled).map(({ mod }) => mod);
    for (const mod of selected) {
      const newMod = {
        ...mod,
        id: `custom-${Date.now()}-${Math.random().toString(36).slice(2)}`
      };
      customModules.push(newMod);
      onAppendCustomModuleToSidebar?.(newMod);
    }
    if (selected.length > 0) saveCustomModules();
    overlay.remove();
  });
  btnRow.appendChild(importBtn);
  dialog.appendChild(btnRow);
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });
}
async function importToolsFromFile() {
  try {
    const hasPicker = typeof window.showOpenFilePicker === "function";
    if (hasPicker) {
      let pickerHandles;
      try {
        pickerHandles = await window.showOpenFilePicker({
          types: [
            {
              description: "JSON Project",
              accept: {
                "application/json": [
                  ".json"
                ]
              }
            }
          ]
        });
      } catch (e) {
        if (e.name !== "AbortError") throw e;
        return;
      }
      const handle = pickerHandles[0];
      const text = await (await handle.getFile()).text();
      const proj = JSON.parse(text);
      const tools = proj.custom_tools;
      if (!tools || !Array.isArray(tools) || tools.length === 0) {
        alert("No custom tools found in this project file.\n\nMake sure the file was saved after creating custom tools in it.");
        return;
      }
      showImportToolsDialog(tools);
    } else {
      const inp = document.createElement("input");
      inp.type = "file";
      inp.accept = ".json";
      inp.addEventListener("change", async () => {
        const file = inp.files?.[0];
        if (!file) return;
        try {
          const text = await file.text();
          const proj = JSON.parse(text);
          const tools = proj.custom_tools;
          if (!tools || !Array.isArray(tools) || tools.length === 0) {
            alert("No custom tools found in this project file.\n\nMake sure the file was saved after creating custom tools in it.");
            return;
          }
          showImportToolsDialog(tools);
        } catch {
          alert("Invalid project file.");
        }
      });
      inp.click();
    }
  } catch (e) {
    alert("Failed to open file: " + e.message);
  }
}
function showSavePromptDialog() {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "import-modal-overlay";
    const dialog = document.createElement("div");
    dialog.className = "import-modal";
    const title = document.createElement("h3");
    title.textContent = "Unsaved Changes";
    dialog.appendChild(title);
    const msg = document.createElement("p");
    msg.textContent = "Do you want to save your changes before continuing?";
    dialog.appendChild(msg);
    const btns = document.createElement("div");
    btns.className = "import-modal-btns";
    const saveBtn = document.createElement("button");
    saveBtn.className = "import-confirm-btn";
    saveBtn.textContent = "Save";
    saveBtn.addEventListener("click", () => {
      overlay.remove();
      resolve("save");
    });
    const discardBtn = document.createElement("button");
    discardBtn.textContent = "Don't Save";
    discardBtn.addEventListener("click", () => {
      overlay.remove();
      resolve("discard");
    });
    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.addEventListener("click", () => {
      overlay.remove();
      resolve("cancel");
    });
    btns.appendChild(saveBtn);
    btns.appendChild(discardBtn);
    btns.appendChild(cancelBtn);
    dialog.appendChild(btns);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
  });
}
function clearProjectState() {
  canvas.domElement.querySelectorAll(".block").forEach((el) => el.remove());
  canvas.domElement.querySelectorAll(".title-block-overlay").forEach((el) => el.remove());
  state.blocks = [];
  delete state.titleBlock;
  setTitleBlockEnabled(false);
  const tbToggle = document.getElementById("title-block-toggle");
  if (tbToggle) tbToggle.checked = false;
  state.projectName = "Untitled Project";
  state.constants = {
    E: 2e5
  };
  for (const k in globalScope) delete globalScope[k];
  for (const k in globalFnScope) delete globalFnScope[k];
  clearSelection();
  deletionStack.length = 0;
  childToSection.clear();
  setFileHandle(null);
  setNumPages(1);
  setCANVAS_H(PAGE_H);
  canvas.domElement.style.height = `${CANVAS_H}px`;
  syncPageSeparators();
  setCustomModules([]);
  saveCustomModules();
  const list = document.getElementById("custom-modules-list");
  if (list) list.innerHTML = "";
}
async function newProject() {
  if (state.blocks.length > 0) {
    const choice = await showSavePromptDialog();
    if (choice === "cancel") return;
    if (choice === "save") await saveProject(false);
  }
  clearProjectState();
}
async function newFromTemplate() {
  if (state.blocks.length > 0) {
    const choice = await showSavePromptDialog();
    if (choice === "cancel") return;
    if (choice === "save") await saveProject(false);
  }
  const hasPicker = typeof window.showOpenFilePicker === "function";
  if (hasPicker) {
    let pickerHandles;
    try {
      pickerHandles = await window.showOpenFilePicker({
        types: [
          {
            description: "JSON Project",
            accept: {
              "application/json": [
                ".json"
              ]
            }
          }
        ]
      });
    } catch (e) {
      if (e.name !== "AbortError") {
        alert("Failed to open template: " + e.message);
      }
      return;
    }
    const handle = pickerHandles[0];
    try {
      loadProject(JSON.parse(await (await handle.getFile()).text()));
    } catch {
      alert("Invalid template file.");
      return;
    }
    setFileHandle(null);
  } else {
    const inp = document.createElement("input");
    inp.type = "file";
    inp.accept = ".json";
    inp.addEventListener("change", async () => {
      const file = inp.files?.[0];
      if (!file) return;
      try {
        loadProject(JSON.parse(await file.text()));
        setFileHandle(null);
      } catch {
        alert("Invalid template file.");
      }
    });
    inp.click();
  }
}
function loadProject(proj) {
  canvas.domElement.querySelectorAll(".block").forEach((el) => el.remove());
  canvas.domElement.querySelectorAll(".title-block-overlay").forEach((e) => e.remove());
  state.blocks = [];
  setTitleBlockEnabled(false);
  const rawTb = proj.title_block;
  if (rawTb) {
    state.titleBlock = rawTb;
    setTitleBlockEnabled(true);
    const tbToggle = document.getElementById("title-block-toggle");
    if (tbToggle) tbToggle.checked = true;
    const pnCheckbox = document.getElementById("page-numbering-toggle");
    if (pnCheckbox) {
      pnCheckbox.checked = false;
      pnCheckbox.disabled = true;
      const pnLabel = pnCheckbox.parentElement;
      if (pnLabel) {
        pnLabel.style.opacity = "0.4";
        pnLabel.style.pointerEvents = "none";
      }
    }
    setPageNumberingEnabled(false);
  } else {
    setTitleBlockEnabled(false);
    const tbToggle = document.getElementById("title-block-toggle");
    if (tbToggle) tbToggle.checked = false;
    const pnCheckbox = document.getElementById("page-numbering-toggle");
    if (pnCheckbox) {
      pnCheckbox.disabled = false;
      const pnLabel = pnCheckbox.parentElement;
      if (pnLabel) {
        pnLabel.style.opacity = "1";
        pnLabel.style.pointerEvents = "";
      }
    }
  }
  const consts = proj.global_constants;
  if (consts) Object.assign(state.constants, consts);
  const rawBlocks = proj.blocks ?? [];
  for (const raw of rawBlocks) {
    const rawType = raw.type;
    if (rawType === "title-block") {
      if (!state.titleBlock && raw.content) {
        try {
          state.titleBlock = JSON.parse(raw.content);
        } catch {
        }
      }
      continue;
    }
    const type = rawType === "math" && raw.content && !raw.subtype ? "formula" : rawType;
    const block = {
      id: raw.id ?? `block-${Date.now()}`,
      type,
      subtype: raw.subtype,
      x: raw.x ?? 0,
      y: raw.y ?? 0,
      w: raw.w,
      content: raw.content ?? "",
      label: raw.label,
      sectionName: raw.sectionName,
      collapsed: raw.collapsed,
      sectionColor: raw.sectionColor,
      parentSectionId: raw.parentSectionId,
      h: raw.h,
      packId: raw.packId,
      encrypted: raw.encrypted,
      encIv: raw.encIv,
      encContent: raw.encContent
    };
    if (block.encrypted && block.packId && block.encIv && block.encContent) {
      if (hasPack(block.packId)) {
        getPackKey(block.packId).then(async (key) => {
          if (!key) return;
          const plain = await decryptTemplate(block.encIv, block.encContent, key);
          if (plain !== null) {
            block.content = plain;
            block.encrypted = false;
            const el = document.getElementById(block.id);
            if (el) {
              el.remove();
              renderBlock(block);
              reEvalAllFormulas();
            }
          }
        });
      } else {
        block.content = `[Locked: "${block.packId}" pack required]`;
      }
    }
    state.blocks.push(block);
    if (!block.parentSectionId) {
      renderBlock(block);
    }
  }
  for (const block of state.blocks) {
    if (!block.parentSectionId) continue;
    const sectionEl = document.getElementById(block.parentSectionId);
    const content = sectionEl?.querySelector(".section-content");
    if (!content) continue;
    renderBlock(block);
    const childEl = document.getElementById(block.id);
    if (!childEl) continue;
    content.appendChild(childEl);
    childEl.style.left = `${block.x}px`;
    childEl.style.top = `${block.y}px`;
    childEl.style.maxWidth = "";
    childToSection.set(block.id, block.parentSectionId);
    refreshSectionHeight(sectionEl);
  }
  reEvalAllFormulas();
  updatePageCount();
  syncTitleBlocks();
  canvas.updateMarginGuide();
  moveGridCursor(margins.left, margins.top + titleBlockH());
  const savedTools = proj.custom_tools;
  if (savedTools && Array.isArray(savedTools)) {
    setCustomModules(savedTools);
    saveCustomModules();
    onRefreshCustomModulesList?.();
  }
}
function serializeProject() {
  const blocks = state.blocks.map((b) => {
    const out2 = {
      id: b.id,
      type: b.type,
      x: b.x,
      y: b.y
    };
    if (b.subtype) out2.subtype = b.subtype;
    if (b.label) out2.label = b.label;
    if (b.w) out2.w = b.w;
    if (b.sectionName) out2.sectionName = b.sectionName;
    if (b.collapsed) out2.collapsed = b.collapsed;
    if (b.sectionColor) out2.sectionColor = b.sectionColor;
    if (b.parentSectionId) out2.parentSectionId = b.parentSectionId;
    if (b.h) out2.h = b.h;
    if (b.packId && b.encIv && b.encContent) {
      out2.packId = b.packId;
      out2.encrypted = true;
      out2.encIv = b.encIv;
      out2.encContent = b.encContent;
    } else {
      if (b.content) out2.content = b.content;
    }
    return out2;
  });
  const out = {
    project_metadata: {
      name: state.projectName,
      date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      units: "SI"
    },
    blocks,
    global_constants: state.constants,
    custom_tools: customModules
  };
  if (state.titleBlock) out.title_block = state.titleBlock;
  return JSON.stringify(out, null, 2);
}
async function saveProject(saveAs = false) {
  const hasPicker = typeof globalThis.showSaveFilePicker === "function";
  if (hasPicker) {
    try {
      if (!fileHandle || saveAs) {
        setFileHandle(await globalThis.showSaveFilePicker({
          suggestedName: state.projectName.replace(/[^\w-]/g, "_") + ".json",
          types: [
            {
              description: "JSON Project",
              accept: {
                "application/json": [
                  ".json"
                ]
              }
            }
          ]
        }));
      }
      const writable = await fileHandle.createWritable();
      await writable.write(serializeProject());
      await writable.close();
      return;
    } catch (e) {
      if (e.name === "AbortError") return;
    }
  }
  const blob = new Blob([
    serializeProject()
  ], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = state.projectName.replace(/[^\w-]/g, "_") + ".json";
  a.click();
  URL.revokeObjectURL(url);
}

// src/main.ts
var MODULES = [
  {
    id: "formula",
    name: "Formula Block",
    icon: "\u03A3",
    type: "formula"
  },
  {
    id: "summary",
    name: "Summary Block",
    icon: "\u03A3\u0332",
    type: "summary",
    sectionOnly: true
  },
  {
    id: "section",
    name: "Section",
    icon: "\u29C5",
    type: "section",
    requiresPro: true
  },
  {
    id: "beam-def",
    name: "Beam Deflection",
    icon: "\u{1F4CF}",
    type: "math"
  },
  {
    id: "sect-prop",
    name: "Section Properties",
    icon: "\u{1F3D7}",
    type: "math"
  },
  {
    id: "plot",
    name: "Plot",
    icon: "\u{1F4C8}",
    type: "plot"
  },
  {
    id: "figure",
    name: "Figure",
    icon: "\u{1F5BC}",
    type: "figure"
  },
  {
    id: "text",
    name: "Text Block",
    icon: "\u{1F4DD}",
    type: "text"
  }
];
function renderCustomModuleItem(mod) {
  const item = document.createElement("div");
  item.className = "module-item custom";
  item.draggable = true;
  item.dataset.moduleType = "formula";
  item.dataset.moduleId = mod.id;
  const iconEl = document.createElement("span");
  iconEl.textContent = mod.blocks ? "\u229E" : "\u03A3";
  if (mod.blocks) item.title = `${mod.blocks.length} block group`;
  const nameEl = document.createElement("span");
  nameEl.textContent = mod.name;
  nameEl.style.flex = "1";
  const delBtn = document.createElement("button");
  delBtn.className = "mod-delete";
  delBtn.title = "Remove from toolbar";
  delBtn.textContent = "\xD7";
  delBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    setCustomModules(customModules.filter((m) => m.id !== mod.id));
    saveCustomModules();
    item.remove();
  });
  item.appendChild(iconEl);
  item.appendChild(nameEl);
  item.appendChild(delBtn);
  return item;
}
function showLoginModal() {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "import-modal-overlay";
    const dialog = document.createElement("div");
    dialog.className = "import-modal";
    dialog.style.maxWidth = "340px";
    const title = document.createElement("h3");
    title.textContent = "Sign in to LeptonPad";
    dialog.appendChild(title);
    let isSignup = false;
    const modeNote = document.createElement("p");
    modeNote.style.cssText = "font-size:0.8rem;margin:0 0 0.5rem;color:var(--muted,#888);";
    modeNote.textContent = "Pro and purchased template packs require an account.";
    dialog.appendChild(modeNote);
    const mkInput = (type, placeholder) => {
      const inp = document.createElement("input");
      inp.type = type;
      inp.placeholder = placeholder;
      inp.style.cssText = "width:100%;margin:0.3rem 0;padding:0.45rem 0.6rem;font-size:0.95rem;border:1px solid var(--border);border-radius:4px;background:var(--bg-input,#fff);color:var(--text);box-sizing:border-box;";
      return inp;
    };
    const emailInp = mkInput("email", "Email address");
    const passInp = mkInput("password", "Password");
    dialog.appendChild(emailInp);
    dialog.appendChild(passInp);
    const codeInp = mkInput("text", "Confirmation code from your email");
    codeInp.style.display = "none";
    codeInp.autocomplete = "one-time-code";
    dialog.appendChild(codeInp);
    let awaitingCode = false;
    const errorEl = document.createElement("p");
    errorEl.style.cssText = "color:#e55;font-size:0.8rem;min-height:1rem;margin:0.2rem 0;";
    dialog.appendChild(errorEl);
    const successEl = document.createElement("p");
    successEl.style.cssText = "color:#3a3;font-size:0.8rem;min-height:1rem;margin:0.2rem 0;display:none;";
    dialog.appendChild(successEl);
    const btns = document.createElement("div");
    btns.className = "import-modal-btns";
    btns.style.flexDirection = "column";
    btns.style.gap = "0.4rem";
    const submitBtn = document.createElement("button");
    submitBtn.className = "import-confirm-btn";
    submitBtn.textContent = "Sign In";
    const toggleBtn = document.createElement("button");
    toggleBtn.textContent = "Create account instead";
    toggleBtn.style.cssText = "background:none;border:none;color:var(--link,#4a9);cursor:pointer;font-size:0.85rem;padding:0;";
    toggleBtn.addEventListener("click", () => {
      isSignup = !isSignup;
      submitBtn.textContent = isSignup ? "Create Account" : "Sign In";
      title.textContent = isSignup ? "Create LeptonPad Account" : "Sign in to LeptonPad";
      toggleBtn.textContent = isSignup ? "Back to sign in" : "Create account instead";
      errorEl.textContent = "";
      successEl.style.display = "none";
    });
    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.addEventListener("click", () => {
      overlay.remove();
      resolve();
    });
    submitBtn.addEventListener("click", async () => {
      const email = emailInp.value.trim();
      const password = passInp.value;
      errorEl.textContent = "";
      successEl.style.display = "none";
      if (awaitingCode) {
        const code = codeInp.value.trim();
        if (!code) {
          errorEl.textContent = "Enter the code from your email.";
          return;
        }
        submitBtn.disabled = true;
        submitBtn.textContent = "Confirming\u2026";
        const { error: error2 } = await verifyEmailCode(code);
        if (error2) {
          errorEl.textContent = error2;
          submitBtn.disabled = false;
          submitBtn.textContent = "Confirm Email";
          return;
        }
        overlay.remove();
        resolve();
        return;
      }
      if (!email || !password) {
        errorEl.textContent = "Email and password are required.";
        return;
      }
      submitBtn.disabled = true;
      submitBtn.textContent = isSignup ? "Creating\u2026" : "Signing in\u2026";
      const fn = isSignup ? signup : login;
      const { error, needsVerification } = await fn(email, password);
      if (error) {
        errorEl.textContent = error;
        submitBtn.disabled = false;
        submitBtn.textContent = isSignup ? "Create Account" : "Sign In";
      } else if (isSignup && needsVerification) {
        awaitingCode = true;
        successEl.textContent = "Account created \u2014 enter the code we emailed you.";
        successEl.style.display = "";
        emailInp.style.display = "none";
        passInp.style.display = "none";
        codeInp.style.display = "";
        codeInp.focus();
        toggleBtn.style.display = "none";
        submitBtn.disabled = false;
        submitBtn.textContent = "Confirm Email";
      } else {
        overlay.remove();
        resolve();
      }
    });
    btns.appendChild(submitBtn);
    btns.appendChild(toggleBtn);
    btns.appendChild(cancelBtn);
    dialog.appendChild(btns);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    [
      emailInp,
      passInp,
      codeInp
    ].forEach((inp) => inp.addEventListener("keydown", (e) => {
      if (e.key === "Enter") submitBtn.click();
      if (e.key === "Escape") {
        overlay.remove();
        resolve();
      }
    }));
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.remove();
        resolve();
      }
    });
    setTimeout(() => emailInp.focus(), 50);
  });
}
function renderAuthPanel(container) {
  const existing = container.querySelector(".auth-panel");
  if (existing) existing.remove();
  const panel = document.createElement("div");
  panel.className = "auth-panel";
  panel.style.cssText = "padding:0.4rem 0.5rem 0.5rem;border-bottom:1px solid var(--border);margin-bottom:0.4rem;";
  if (currentUser) {
    const emailEl = document.createElement("div");
    emailEl.style.cssText = "font-size:0.75rem;color:var(--muted,#888);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;";
    emailEl.textContent = currentUser.email ?? "";
    panel.appendChild(emailEl);
    const roleRow = document.createElement("div");
    roleRow.style.cssText = "display:flex;align-items:center;gap:0.4rem;margin:0.25rem 0;";
    const roleBadge = document.createElement("span");
    const roleColors = {
      super: "#7c3aed",
      pro: "#0284c7",
      demo: "#d97706",
      free: "#6b7280"
    };
    const badgeColor = accessUnverified() ? "#6b7280" : roleColors[currentRole] ?? "#6b7280";
    roleBadge.style.cssText = `font-size:0.7rem;padding:0.1rem 0.4rem;border-radius:3px;background:${badgeColor};color:#fff;font-weight:600;` + (entitlementsStale ? "opacity:0.65;" : "");
    roleBadge.textContent = accessUnverified() ? "Unverified" : roleLabel();
    if (entitlementsStale) {
      const when = lastSyncedLabel();
      roleBadge.title = when ? `Could not reach the server \u2014 showing access cached ${when}.` : "Could not reach the server \u2014 your access has not been verified yet.";
    }
    roleRow.appendChild(roleBadge);
    const accessEl = document.createElement("span");
    accessEl.style.cssText = "font-size:0.72rem;color:var(--muted,#888);";
    accessEl.textContent = accessSummary();
    roleRow.appendChild(accessEl);
    panel.appendChild(roleRow);
    const btnRow = document.createElement("div");
    btnRow.style.cssText = "display:flex;gap:0.35rem;";
    const redeemBtn = document.createElement("button");
    redeemBtn.className = "view-toggle";
    redeemBtn.textContent = "Redeem Code";
    redeemBtn.style.cssText = "font-size:0.75rem;padding:0.2rem 0.5rem;flex:1;";
    redeemBtn.addEventListener("click", async () => {
      const result = await showRedeemCodeDialog();
      if (result?.success) {
        await initAuth();
        renderAuthPanel(container);
        _refreshProBadges(container);
        alert(result.message);
      }
    });
    const signOutBtn = document.createElement("button");
    signOutBtn.className = "view-toggle";
    signOutBtn.textContent = "Sign Out";
    signOutBtn.style.cssText = "font-size:0.75rem;padding:0.2rem 0.5rem;";
    signOutBtn.addEventListener("click", async () => {
      await logout();
      renderAuthPanel(container);
      _refreshProBadges(container);
    });
    btnRow.appendChild(redeemBtn);
    btnRow.appendChild(signOutBtn);
    panel.appendChild(btnRow);
  } else {
    const msgEl = document.createElement("div");
    msgEl.style.cssText = "font-size:0.75rem;color:var(--muted,#888);margin-bottom:0.3rem;";
    msgEl.textContent = "Sign in for Pro features and template packs.";
    panel.appendChild(msgEl);
    const signInBtn = document.createElement("button");
    signInBtn.className = "view-toggle";
    signInBtn.textContent = "Sign In / Create Account";
    signInBtn.style.cssText = "width:100%;font-size:0.8rem;";
    signInBtn.addEventListener("click", async () => {
      await showLoginModal();
      renderAuthPanel(container);
      _refreshProBadges(container);
    });
    panel.appendChild(signInBtn);
  }
  const firstH2 = container.querySelector("h2");
  if (firstH2) {
    container.insertBefore(panel, firstH2);
  } else {
    container.appendChild(panel);
  }
}
function _refreshProBadges(container) {
  const locked = !canCreateSection();
  container.querySelectorAll("[data-requires-pro]").forEach((el) => {
    el.classList.toggle("module-locked", locked);
    const badge = el.querySelector(".module-pro-badge");
    if (badge) badge.style.display = locked ? "" : "none";
  });
}
function _showProRequiredDialog() {
  const overlay = document.createElement("div");
  overlay.className = "import-modal-overlay";
  const dialog = document.createElement("div");
  dialog.className = "import-modal";
  dialog.style.maxWidth = "320px";
  const blocked = entitlementsStale;
  const title = document.createElement("h3");
  title.textContent = blocked ? "Couldn't verify your account" : "Pro Feature";
  dialog.appendChild(title);
  const msg = document.createElement("p");
  msg.textContent = blocked ? "Creating Section blocks needs Pro or an active Demo trial, and we could not reach the server to check yours. Your existing sheets are unaffected. Try again once you are back online." : "Creating Section blocks requires a Pro subscription or active Demo trial. Sign in and redeem a license code to unlock.";
  msg.style.fontSize = "0.9rem";
  dialog.appendChild(msg);
  const btns = document.createElement("div");
  btns.className = "import-modal-btns";
  if (blocked) {
    const retryBtn = document.createElement("button");
    retryBtn.textContent = "Retry";
    retryBtn.addEventListener("click", async () => {
      retryBtn.disabled = true;
      retryBtn.textContent = "Checking\u2026";
      await refreshEntitlements();
      overlay.remove();
    });
    btns.appendChild(retryBtn);
  }
  const closeBtn = document.createElement("button");
  closeBtn.className = "import-confirm-btn";
  closeBtn.textContent = "OK";
  closeBtn.addEventListener("click", () => overlay.remove());
  btns.appendChild(closeBtn);
  dialog.appendChild(btns);
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });
}
function renderSidebar() {
  const container = document.getElementById("sidebar-left");
  const logoImg = document.createElement("img");
  logoImg.src = "/LeptonPadLogo.png";
  logoImg.alt = "LeptonPad";
  logoImg.className = "sidebar-logo";
  container.appendChild(logoImg);
  const licenseLink = document.createElement("a");
  licenseLink.href = "https://github.com/jrmarcum/LeptonPad/blob/main/LICENSE";
  licenseLink.target = "_blank";
  licenseLink.rel = "noopener noreferrer";
  licenseLink.textContent = "\xA9 2026 LeptonPad \u2014 Proprietary License";
  licenseLink.className = "sidebar-license";
  container.appendChild(licenseLink);
  const version = globalThis.__LP_CONFIG__?.version ?? "";
  if (version) {
    const versionEl = document.createElement("div");
    versionEl.className = "sidebar-version";
    versionEl.textContent = `v${version}`;
    container.appendChild(versionEl);
  }
  renderAuthPanel(container);
  const posHeading = document.createElement("h2");
  posHeading.textContent = "Cursor";
  container.appendChild(posHeading);
  const posDisplay = document.createElement("div");
  posDisplay.id = "cursor-coords";
  posDisplay.textContent = "x: \u2014 y: \u2014";
  container.appendChild(posDisplay);
  const viewHeading = document.createElement("h2");
  viewHeading.textContent = "View";
  container.appendChild(viewHeading);
  const printBtn = document.createElement("button");
  printBtn.className = "view-toggle";
  printBtn.textContent = "\u2399 Print Sheet";
  printBtn.addEventListener("click", () => globalThis.print());
  container.appendChild(printBtn);
  globalThis.addEventListener("beforeprint", () => {
    if (!canvas) return;
    canvas.domElement.style.width = `${CANVAS_W / PX_PER_IN}in`;
    canvas.domElement.style.height = `${CANVAS_H / PX_PER_IN}in`;
  });
  globalThis.addEventListener("afterprint", () => {
    if (!canvas) return;
    canvas.domElement.style.width = `${CANVAS_W}px`;
    canvas.domElement.style.height = `${CANVAS_H}px`;
  });
  const newBtn = document.createElement("button");
  newBtn.className = "view-toggle";
  newBtn.textContent = "\u2726 New Project";
  newBtn.addEventListener("click", () => newProject());
  container.appendChild(newBtn);
  const templateBtn = document.createElement("button");
  templateBtn.className = "view-toggle";
  templateBtn.textContent = "\u229E New from Template";
  templateBtn.addEventListener("click", () => newFromTemplate());
  container.appendChild(templateBtn);
  const loadBtn = document.createElement("button");
  loadBtn.className = "view-toggle";
  loadBtn.textContent = "\u2B06 Load Project";
  loadBtn.addEventListener("click", async () => {
    const hasPicker = typeof window.showOpenFilePicker === "function";
    if (hasPicker) {
      try {
        const [handle] = await window.showOpenFilePicker({
          types: [
            {
              description: "JSON Project",
              accept: {
                "application/json": [
                  ".json"
                ]
              }
            }
          ]
        });
        setFileHandle(handle);
        const file = await handle.getFile();
        loadProject(JSON.parse(await file.text()));
      } catch (e) {
        if (e.name !== "AbortError") {
          alert("Failed to load: " + e.message);
        }
      }
      return;
    }
    const inp = document.createElement("input");
    inp.type = "file";
    inp.accept = ".json";
    inp.addEventListener("change", async () => {
      const file = inp.files?.[0];
      if (!file) return;
      try {
        setFileHandle(null);
        loadProject(JSON.parse(await file.text()));
      } catch (e) {
        alert("Failed to load: " + e.message);
      }
    });
    inp.click();
  });
  container.appendChild(loadBtn);
  const saveBtn = document.createElement("button");
  saveBtn.className = "view-toggle";
  saveBtn.textContent = "\u{1F4BE} Save";
  saveBtn.addEventListener("click", () => saveProject(false));
  container.appendChild(saveBtn);
  const saveAsBtn = document.createElement("button");
  saveAsBtn.className = "view-toggle";
  saveAsBtn.textContent = "\u2193 Save As";
  saveAsBtn.addEventListener("click", () => saveProject(true));
  container.appendChild(saveAsBtn);
  const gridBtn = document.createElement("button");
  gridBtn.id = "grid-toggle";
  gridBtn.className = "view-toggle active";
  gridBtn.textContent = "# Grid";
  container.appendChild(gridBtn);
  const densityWrap = document.createElement("div");
  densityWrap.className = "grid-density";
  const densityLabel = document.createElement("span");
  densityLabel.textContent = "Dark";
  const densitySlider = document.createElement("input");
  densitySlider.id = "grid-opacity";
  densitySlider.type = "range";
  densitySlider.min = "0.1";
  densitySlider.max = "1";
  densitySlider.step = "0.05";
  densitySlider.value = "0.45";
  densityWrap.appendChild(densityLabel);
  densityWrap.appendChild(densitySlider);
  container.appendChild(densityWrap);
  const pageHeading = document.createElement("h2");
  pageHeading.textContent = "Page";
  container.appendChild(pageHeading);
  const pageControls = document.createElement("div");
  pageControls.className = "page-controls";
  const pageSel = document.createElement("select");
  pageSel.id = "page-size";
  pageSel.className = "page-size-select";
  for (const [key, size] of Object.entries(PAGE_SIZES)) {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = size.label;
    if (key === "letter") opt.selected = true;
    pageSel.appendChild(opt);
  }
  pageControls.appendChild(pageSel);
  container.appendChild(pageControls);
  const tbToggleLabel = document.createElement("label");
  tbToggleLabel.className = "view-toggle";
  tbToggleLabel.style.cursor = "pointer";
  const tbCheckbox = document.createElement("input");
  tbCheckbox.type = "checkbox";
  tbCheckbox.id = "title-block-toggle";
  tbCheckbox.style.marginRight = "0.4rem";
  tbCheckbox.checked = titleBlockEnabled;
  tbCheckbox.addEventListener("change", () => {
    setTitleBlockEnabled(tbCheckbox.checked);
    if (!titleBlockEnabled) {
      canvas.domElement.querySelectorAll(".title-block-overlay").forEach((e) => e.remove());
      pnCheckbox.disabled = false;
      pnToggleLabel.style.opacity = "1";
      pnToggleLabel.style.pointerEvents = "";
    } else {
      syncTitleBlocks();
      pnCheckbox.checked = false;
      setPageNumberingEnabled(false);
      pnCheckbox.disabled = true;
      pnToggleLabel.style.opacity = "0.4";
      pnToggleLabel.style.pointerEvents = "none";
    }
    syncPageSeparators();
    canvas.updateMarginGuide();
    moveGridCursor(margins.left, margins.top + titleBlockH());
  });
  tbToggleLabel.appendChild(tbCheckbox);
  tbToggleLabel.appendChild(document.createTextNode("Title Block"));
  container.appendChild(tbToggleLabel);
  const pnToggleLabel = document.createElement("label");
  pnToggleLabel.className = "view-toggle";
  pnToggleLabel.style.cursor = "pointer";
  const pnCheckbox = document.createElement("input");
  pnCheckbox.type = "checkbox";
  pnCheckbox.id = "page-numbering-toggle";
  pnCheckbox.style.marginRight = "0.4rem";
  pnCheckbox.checked = pageNumberingEnabled;
  pnCheckbox.disabled = titleBlockEnabled;
  if (titleBlockEnabled) {
    pnToggleLabel.style.opacity = "0.4";
    pnToggleLabel.style.pointerEvents = "none";
  }
  pnCheckbox.addEventListener("change", () => {
    setPageNumberingEnabled(pnCheckbox.checked);
    syncPageSeparators();
  });
  pnToggleLabel.appendChild(pnCheckbox);
  pnToggleLabel.appendChild(document.createTextNode("Page Numbering"));
  container.appendChild(pnToggleLabel);
  const marginRow = document.createElement("div");
  marginRow.className = "margin-heading-row";
  const marginHeading = document.createElement("h2");
  marginHeading.textContent = "Margins";
  const unitBtn = document.createElement("button");
  unitBtn.id = "unit-toggle";
  unitBtn.className = "unit-toggle";
  unitBtn.textContent = "in";
  marginRow.appendChild(marginHeading);
  marginRow.appendChild(unitBtn);
  container.appendChild(marginRow);
  const marginGrid = document.createElement("div");
  marginGrid.className = "margin-inputs";
  const marginDefs = [
    {
      id: "margin-top",
      label: "Top",
      side: "top"
    },
    {
      id: "margin-right",
      label: "Right",
      side: "right"
    },
    {
      id: "margin-bottom",
      label: "Bottom",
      side: "bottom"
    },
    {
      id: "margin-left",
      label: "Left",
      side: "left"
    }
  ];
  for (const def of marginDefs) {
    const wrap = document.createElement("label");
    wrap.className = "margin-field";
    const lbl = document.createElement("span");
    lbl.textContent = def.label;
    const inp = document.createElement("input");
    inp.id = def.id;
    inp.type = "number";
    inp.min = "0";
    inp.step = "1";
    inp.value = String(pxToUnit(margins[def.side]));
    wrap.appendChild(lbl);
    wrap.appendChild(inp);
    marginGrid.appendChild(wrap);
  }
  container.appendChild(marginGrid);
  const modulesHeading = document.createElement("h2");
  modulesHeading.textContent = "Modules";
  container.appendChild(modulesHeading);
  MODULES.forEach((mod) => {
    const item = document.createElement("div");
    item.className = "module-item";
    item.draggable = true;
    item.dataset.moduleType = mod.type;
    item.dataset.moduleId = mod.id;
    item.innerHTML = `<span>${mod.icon}</span><span>${mod.name}</span>`;
    if (mod.sectionOnly) {
      const badge = document.createElement("span");
      badge.className = "module-section-badge";
      badge.textContent = "\xA7";
      badge.title = "Can only be placed inside a Section";
      item.appendChild(badge);
    }
    if (mod.requiresPro) {
      item.dataset.requiresPro = "1";
      const proBadge = document.createElement("span");
      proBadge.className = "module-pro-badge";
      proBadge.textContent = "PRO";
      proBadge.title = "Requires Pro or higher to create sections";
      proBadge.style.display = canCreateSection() ? "none" : "";
      item.appendChild(proBadge);
      if (!canCreateSection()) item.classList.add("module-locked");
    }
    container.appendChild(item);
  });
  const customHeading = document.createElement("h2");
  customHeading.className = "custom-tools-heading";
  const customHeadingText = document.createElement("span");
  customHeadingText.textContent = "Custom Tools";
  customHeading.appendChild(customHeadingText);
  const importToolsBtn = document.createElement("button");
  importToolsBtn.className = "import-tools-btn";
  importToolsBtn.textContent = "\u2B06 Import\u2026";
  importToolsBtn.title = "Import custom tools from a saved project file";
  importToolsBtn.addEventListener("click", importToolsFromFile);
  customHeading.appendChild(importToolsBtn);
  container.appendChild(customHeading);
  const customList = document.createElement("div");
  customList.id = "custom-modules-list";
  container.appendChild(customList);
  customModules.forEach((mod) => customList.appendChild(renderCustomModuleItem(mod)));
}
async function start() {
  try {
    await init();
    console.log("MathWasm Engine Ready");
    await initAuth();
    renderSidebar();
    setCanvas(new Canvas("canvas"));
    onAuthChange(() => {
      const container = document.getElementById("sidebar-left");
      if (container) {
        renderAuthPanel(container);
        _refreshProBadges(container);
      }
    });
    setOnAuthStateChange(() => {
      const container = document.getElementById("sidebar-left");
      if (container) {
        renderAuthPanel(container);
        _refreshProBadges(container);
      }
    });
    setOnSectionSummaryUpdate(updateSectionSummary);
    setOnRefreshAllSectionHeights(refreshAllSectionHeights);
    setOnSelectBlock(selectBlock);
    setOnAddToSelection(addToSelection);
    setOnMoveGridCursor(moveGridCursor);
    setOnUpdatePageCount(updatePageCount);
    setOnSyncPageSeparators(syncPageSeparators);
    setOnClearSelection(clearSelection);
    setOnRefreshCustomModulesList(() => {
      const list = document.getElementById("custom-modules-list");
      if (!list) return;
      list.innerHTML = "";
      customModules.forEach((mod) => list.appendChild(renderCustomModuleItem(mod)));
    });
    setOnAppendCustomModuleToSidebar((mod) => {
      const list = document.getElementById("custom-modules-list");
      if (list) list.appendChild(renderCustomModuleItem(mod));
    });
    syncPageSeparators();
    moveGridCursor(margins.left, margins.top + titleBlockH());
    setBandEl(document.createElement("div"));
    bandEl.id = "selection-band";
    canvas.domElement.appendChild(bandEl);
    const BAND_LONG_PRESS_MS = 500;
    const BAND_CANCEL_PX = 10;
    canvas.domElement.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      if (e.target.closest(".block")) return;
      const rect = canvas.domElement.getBoundingClientRect();
      const startX = e.clientX - rect.left;
      const startY = e.clientY - rect.top;
      const startBand = () => {
        const bs = {
          startX,
          startY,
          moved: false
        };
        setBandState(bs);
        bandEl.style.left = `${startX}px`;
        bandEl.style.top = `${startY}px`;
        bandEl.style.width = "0";
        bandEl.style.height = "0";
        bandEl.classList.add("active");
      };
      if (e.pointerType !== "touch") {
        startBand();
        return;
      }
      let lpTimer = setTimeout(() => {
        lpTimer = null;
        startBand();
      }, BAND_LONG_PRESS_MS);
      const cancelBandLp = (ev) => {
        if (ev.pointerId !== e.pointerId) return;
        if (lpTimer !== null) {
          if (ev.type === "pointermove") {
            const dx = ev.clientX - e.clientX;
            const dy = ev.clientY - e.clientY;
            if (Math.hypot(dx, dy) <= BAND_CANCEL_PX) return;
          }
          clearTimeout(lpTimer);
          lpTimer = null;
        }
        canvas.domElement.removeEventListener("pointermove", cancelBandLp);
        canvas.domElement.removeEventListener("pointerup", cancelBandLp);
        canvas.domElement.removeEventListener("pointercancel", cancelBandLp);
      };
      canvas.domElement.addEventListener("pointermove", cancelBandLp);
      canvas.domElement.addEventListener("pointerup", cancelBandLp);
      canvas.domElement.addEventListener("pointercancel", cancelBandLp);
    });
    document.addEventListener("pointermove", (e) => {
      if (multiDragState) {
        const dx = e.clientX - multiDragState.startX;
        const dy = e.clientY - multiDragState.startY;
        for (const [el, orig] of multiDragState.origPositions) {
          const blk = state.blocks.find((b) => b.id === el.id);
          const tbH = titleBlockH();
          const dragTopMin = margins.top + tbH;
          const sectionContent = el.parentElement?.classList.contains("section-content") ? el.parentElement : null;
          if (sectionContent) {
            const maxLeft = Math.max(0, sectionContent.offsetWidth - el.offsetWidth);
            const maxTop = Math.max(0, sectionContent.offsetHeight - el.offsetHeight);
            const newLeft = clamp(orig.left + dx, 0, maxLeft);
            const newTop = clamp(orig.top + dy, 0, maxTop);
            el.style.left = `${newLeft}px`;
            el.style.top = `${newTop}px`;
            el.style.maxWidth = `${sectionContent.offsetWidth - newLeft}px`;
          } else if (blk?.type === "section") {
            el.style.top = `${clamp(orig.top + dy, dragTopMin, CANVAS_H + PAGE_H)}px`;
          } else {
            const dragLeft = clamp(orig.left + dx, margins.left, CANVAS_W - margins.right - el.offsetWidth);
            el.style.left = `${dragLeft}px`;
            el.style.top = `${clamp(orig.top + dy, dragTopMin, CANVAS_H + PAGE_H)}px`;
            el.style.maxWidth = `${CANVAS_W - margins.right - dragLeft}px`;
          }
        }
      }
      if (bandState) {
        const rect = canvas.domElement.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;
        const x = Math.min(bandState.startX, cx);
        const y = Math.min(bandState.startY, cy);
        const w = Math.abs(cx - bandState.startX);
        const h = Math.abs(cy - bandState.startY);
        bandEl.style.left = `${x}px`;
        bandEl.style.top = `${y}px`;
        bandEl.style.width = `${w}px`;
        bandEl.style.height = `${h}px`;
        if (w > 4 || h > 4) bandState.moved = true;
      }
    });
    const mSnapX = (absX) => margins.left + canvas.snap(absX - margins.left);
    const mSnapY = (absY) => {
      const pi = Math.max(0, Math.floor(absY / PAGE_H));
      const orig = pi * PAGE_H + margins.top;
      return orig + canvas.snap(absY - orig);
    };
    document.addEventListener("pointerup", (e) => {
      if (multiDragState) {
        for (const [el] of multiDragState.origPositions) {
          const block = state.blocks.find((b) => b.id === el.id);
          if (!block || block.type === "section") {
            const snappedTop = clamp(mSnapY(parseInt(el.style.top)), margins.top + titleBlockH(), CANVAS_H + PAGE_H);
            placeBlock(el, margins.left, snappedTop);
            continue;
          }
          const snapContent = el.parentElement?.classList.contains("section-content") ? el.parentElement : null;
          const snapSectionEl = snapContent?.parentElement;
          if (snapContent && snapSectionEl) {
            const maxLeft = Math.max(0, snapContent.offsetWidth - el.offsetWidth);
            const maxTop = Math.max(0, snapContent.offsetHeight - el.offsetHeight);
            const canvasRect2 = canvas.domElement.getBoundingClientRect();
            const contentRect = snapContent.getBoundingClientRect();
            const contentLeft = Math.round(contentRect.left - canvasRect2.left);
            const contentTop = Math.round(contentRect.top - canvasRect2.top);
            const rawLeft = parseInt(el.style.left);
            const rawTop = parseInt(el.style.top);
            const snappedLeft = clamp(mSnapX(contentLeft + rawLeft) - contentLeft, 0, maxLeft);
            const snappedTop = clamp(mSnapY(contentTop + rawTop) - contentTop, 0, maxTop);
            el.style.left = `${snappedLeft}px`;
            el.style.top = `${snappedTop}px`;
            el.style.maxWidth = `${snapContent.offsetWidth - snappedLeft}px`;
            block.x = snappedLeft;
            block.y = snappedTop;
            refreshSectionHeight(snapSectionEl);
          } else {
            const canvasRect = canvas.domElement.getBoundingClientRect();
            const cx = e.clientX - canvasRect.left;
            const cy = e.clientY - canvasRect.top;
            const targetSection = sectionAtPoint(cx, cy);
            if (targetSection && targetSection.id !== el.id) {
              reparentToSection(el, targetSection);
            } else {
              const snappedLeft = clamp(mSnapX(parseInt(el.style.left)), margins.left, CANVAS_W - margins.right - el.offsetWidth);
              const snappedTop = clamp(mSnapY(parseInt(el.style.top)), margins.top, CANVAS_H + PAGE_H);
              placeBlock(el, snappedLeft, snappedTop);
            }
          }
        }
        document.body.style.cursor = "";
        setMultiDragState(null);
        reEvalAllFormulas();
        updatePageCount();
      }
      if (bandState) {
        bandEl.classList.remove("active");
        if (bandState.moved) {
          setSkipNextCanvasClick(true);
          const rect = canvas.domElement.getBoundingClientRect();
          const cx = e.clientX - rect.left;
          const cy = e.clientY - rect.top;
          const x = Math.min(bandState.startX, cx);
          const y = Math.min(bandState.startY, cy);
          const w = Math.abs(cx - bandState.startX);
          const h = Math.abs(cy - bandState.startY);
          clearSelection();
          for (const bl of canvas.domElement.querySelectorAll(".block")) {
            const bL = parseInt(bl.style.left), bT = parseInt(bl.style.top);
            if (bL + bl.offsetWidth > x && bL < x + w && bT + bl.offsetHeight > y && bT < y + h) {
              bl.classList.add("selected");
              selectedEls.add(bl);
              setSelectedEl(bl);
            }
          }
          if (selectedEls.size > 0) hideCursor();
        }
        setBandState(null);
      }
    });
    document.addEventListener("keydown", (e) => {
      if (document.activeElement?.tagName === "TEXTAREA") return;
      if (e.key === "Enter" && e.shiftKey && !e.altKey) {
        e.preventDefault();
        shiftBlocksVertical(gridCursor.y, e.ctrlKey ? -GRID_SIZE : GRID_SIZE);
        return;
      }
      if (e.key === "Enter" && e.altKey && !e.ctrlKey) {
        const blockEl = selectedEl ?? document.activeElement?.closest(".block");
        if (!blockEl) return;
        e.preventDefault();
        document.activeElement?.blur();
        clearSelection();
        blockEl.classList.remove("selected");
        const blockRight = parseInt(blockEl.style.left) + blockEl.offsetWidth;
        const exitX = margins.left + (Math.floor((blockRight - margins.left) / GRID_SIZE) + 1) * GRID_SIZE;
        const exitY = parseInt(blockEl.style.top);
        moveGridCursor(exitX, exitY);
        return;
      }
      if (e.ctrlKey && selectedEls.size > 0) {
        if (e.key === "Delete") {
          e.preventDefault();
          const toDelete = [
            ...selectedEls
          ];
          for (const el of toDelete) deleteBlock(el);
          return;
        }
        const delta2 = {
          ArrowLeft: [
            -GRID_SIZE,
            0
          ],
          ArrowRight: [
            GRID_SIZE,
            0
          ],
          ArrowUp: [
            0,
            -GRID_SIZE
          ],
          ArrowDown: [
            0,
            GRID_SIZE
          ]
        };
        const d2 = delta2[e.key];
        if (d2) {
          e.preventDefault();
          let movedIsChild = false;
          for (const el of selectedEls) {
            const sc = el.parentElement?.classList.contains("section-content") ? el.parentElement : null;
            if (sc) {
              movedIsChild = true;
              const maxLeft = Math.max(0, sc.offsetWidth - el.offsetWidth);
              const maxTop = Math.max(0, sc.offsetHeight - el.offsetHeight);
              const newLeft = clamp(parseInt(el.style.left) + d2[0], 0, maxLeft);
              const newTop = clamp(parseInt(el.style.top) + d2[1], 0, maxTop);
              el.style.left = `${newLeft}px`;
              el.style.top = `${newTop}px`;
              el.style.maxWidth = `${sc.offsetWidth - newLeft}px`;
              const blk = state.blocks.find((b) => b.id === el.id);
              if (blk) {
                blk.x = newLeft;
                blk.y = newTop;
              }
              refreshSectionHeight(sc.parentElement);
            } else {
              const newLeft = clamp(parseInt(el.style.left) + d2[0], margins.left, CANVAS_W - margins.right - el.offsetWidth);
              const newTop = clamp(parseInt(el.style.top) + d2[1], margins.top, CANVAS_H + PAGE_H);
              placeBlock(el, newLeft, newTop);
            }
          }
          if (e.key === "ArrowRight" && selectedEl && !movedIsChild) {
            resolveOverlapsRight(selectedEl);
          }
          updatePageCount();
          return;
        }
      }
      const active = document.activeElement;
      if (active?.tagName === "INPUT" || active?.isContentEditable) return;
      if (e.ctrlKey && e.key === "z" && !e.shiftKey && !e.altKey) {
        const block = deletionStack.pop();
        if (!block) return;
        e.preventDefault();
        state.blocks.push(block);
        renderBlock(block);
        reEvalAllFormulas();
        updatePageCount();
        const restored = document.getElementById(block.id);
        if (restored) selectBlock(restored);
        return;
      }
      const delta = {
        ArrowLeft: [
          -GRID_SIZE,
          0
        ],
        ArrowRight: [
          GRID_SIZE,
          0
        ],
        ArrowUp: [
          0,
          -GRID_SIZE
        ],
        ArrowDown: [
          0,
          GRID_SIZE
        ]
      };
      const d = delta[e.key];
      if (!d) return;
      e.preventDefault();
      moveGridCursor(gridCursor.x + d[0], gridCursor.y + d[1]);
    });
    document.getElementById("grid-toggle").addEventListener("click", (e) => {
      const btn = e.currentTarget;
      const guide = document.getElementById("margin-guide");
      const on = guide.classList.toggle("engineering-grid");
      canvas.domElement.querySelectorAll(".page-guide").forEach((g) => {
        g.classList.toggle("engineering-grid", on);
      });
      btn.classList.toggle("active", on);
    });
    document.getElementById("grid-opacity").addEventListener("input", (e) => {
      const a = parseFloat(e.target.value);
      canvas.domElement.style.setProperty("--grid-line", isDark() ? `rgba(212, 212, 216, ${a})` : `rgba(55, 65, 81, ${a})`);
    });
    document.getElementById("page-size").addEventListener("change", (e) => {
      const key = e.target.value;
      const size = PAGE_SIZES[key];
      setCANVAS_W(size.w);
      setPAGE_H(size.h);
      setCANVAS_H(numPages * PAGE_H);
      canvas.domElement.style.width = `${size.w}px`;
      canvas.domElement.style.height = `${CANVAS_H}px`;
      syncPageSeparators();
      updatePageCount();
    });
    const marginSides = [
      {
        id: "margin-top",
        side: "top"
      },
      {
        id: "margin-right",
        side: "right"
      },
      {
        id: "margin-bottom",
        side: "bottom"
      },
      {
        id: "margin-left",
        side: "left"
      }
    ];
    const refreshMarginInputs = () => {
      for (const { id, side } of marginSides) {
        const inp = document.getElementById(id);
        inp.value = String(pxToUnit(margins[side]));
        inp.step = marginUnit === "mm" ? "1" : "0.125";
      }
    };
    document.getElementById("unit-toggle").addEventListener("click", (e) => {
      setMarginUnit(marginUnit === "mm" ? "in" : "mm");
      e.currentTarget.textContent = marginUnit;
      refreshMarginInputs();
    });
    for (const { id, side } of marginSides) {
      document.getElementById(id).addEventListener("input", (e) => {
        const val = parseFloat(e.target.value);
        if (!isNaN(val)) {
          margins[side] = unitToPx(val);
          canvas.updateMarginGuide();
        }
      });
    }
    canvas.domElement.addEventListener("click", (e) => {
      if (skipNextCanvasClick) {
        setSkipNextCanvasClick(false);
        return;
      }
      if (e.target.closest(".block")) return;
      const rect = canvas.domElement.getBoundingClientRect();
      moveGridCursor(e.clientX - rect.left, e.clientY - rect.top);
      if (e.target === canvas.domElement) clearSelection();
    });
    document.getElementById("sidebar-left").addEventListener("dblclick", (e) => {
      const el = e.target.closest("[data-module-type]");
      if (!el?.dataset.moduleType) return;
      if (el.dataset.requiresPro && !canCreateSection()) {
        _showProRequiredDialog();
        return;
      }
      dropBlock(el.dataset.moduleType, el.dataset.moduleId ?? "", gridCursor.x, gridCursor.y);
    });
    document.getElementById("sidebar-left").addEventListener("dragstart", (e) => {
      const el = e.target.closest("[data-module-type]");
      if (!el?.dataset.moduleType) return;
      if (el.dataset.requiresPro && !canCreateSection()) {
        e.preventDefault();
        _showProRequiredDialog();
        return;
      }
      e.dataTransfer.setData("module-type", el.dataset.moduleType);
      e.dataTransfer.setData("module-id", el.dataset.moduleId ?? "");
    });
    canvas.domElement.addEventListener("drop", (e) => {
      e.preventDefault();
      const type = e.dataTransfer.getData("module-type");
      const subtype = e.dataTransfer.getData("module-id");
      if (type) {
        const rect = canvas.domElement.getBoundingClientRect();
        dropBlock(type, subtype, e.clientX - rect.left, e.clientY - rect.top);
      }
    });
    const ctxMenu = document.createElement("div");
    ctxMenu.id = "ctx-menu";
    const ctxFormulaGroup = document.createElement("div");
    ctxFormulaGroup.className = "ctx-formula-group";
    ctxFormulaGroup.style.display = "none";
    const ctxFormulaHeader = document.createElement("div");
    ctxFormulaHeader.className = "ctx-section-header";
    ctxFormulaHeader.textContent = "Formula row";
    ctxFormulaGroup.appendChild(ctxFormulaHeader);
    const ctxAddRowBtn = document.createElement("button");
    const ctxAddIfBtn = document.createElement("button");
    const ctxAddElseifBtn = document.createElement("button");
    const ctxAddElseBtn = document.createElement("button");
    const ctxAddForBtn = document.createElement("button");
    const ctxAddDescBtn = document.createElement("button");
    const ctxAddRefBtn = document.createElement("button");
    const ctxDelBranchBtn = document.createElement("button");
    const ctxDelRowBtn = document.createElement("button");
    ctxAddRowBtn.className = "ctx-neutral-btn";
    ctxAddRowBtn.textContent = "+ row";
    ctxAddIfBtn.className = "ctx-neutral-btn";
    ctxAddIfBtn.textContent = "+ if";
    ctxAddElseifBtn.className = "ctx-neutral-btn";
    ctxAddElseifBtn.textContent = "+ elseif";
    ctxAddElseBtn.className = "ctx-neutral-btn";
    ctxAddElseBtn.textContent = "+ else";
    ctxAddForBtn.className = "ctx-neutral-btn";
    ctxAddForBtn.textContent = "+ for";
    ctxAddDescBtn.className = "ctx-neutral-btn";
    ctxAddDescBtn.textContent = "+ description";
    ctxAddRefBtn.className = "ctx-neutral-btn";
    ctxAddRefBtn.textContent = "+ reference";
    ctxDelBranchBtn.textContent = "\xD7 branch";
    ctxDelRowBtn.textContent = "\xD7 delete row";
    ctxAddRowBtn.title = "Insert blank row after this row (Ctrl+Enter)";
    ctxAddIfBtn.title = "Insert if/end block after this row (Ctrl+I)";
    ctxAddElseifBtn.title = "Add elseif branch to enclosing if (Ctrl+E)";
    ctxAddElseBtn.title = "Add else branch to enclosing if (Ctrl+Shift+E)";
    ctxAddForBtn.title = "Insert for/end block after this row (Ctrl+L)";
    ctxAddDescBtn.title = "Add a text description to this row (left column)";
    ctxAddRefBtn.title = "Add a reference annotation to this row (right column)";
    ctxDelBranchBtn.title = "Delete this branch (elseif/else/for) and its body (Ctrl+-)";
    ctxDelRowBtn.title = "Delete this row or block (Ctrl+-)";
    [
      ctxAddRowBtn,
      ctxAddIfBtn,
      ctxAddElseifBtn,
      ctxAddElseBtn,
      ctxAddForBtn,
      ctxAddDescBtn,
      ctxAddRefBtn,
      ctxDelBranchBtn,
      ctxDelRowBtn
    ].forEach((b) => ctxFormulaGroup.appendChild(b));
    const ctxFormulaSep = document.createElement("hr");
    ctxFormulaSep.className = "ctx-sep";
    ctxMenu.appendChild(ctxFormulaGroup);
    ctxMenu.appendChild(ctxFormulaSep);
    const ctxSaveToolBtn = document.createElement("button");
    ctxSaveToolBtn.className = "ctx-save-btn";
    ctxSaveToolBtn.textContent = "\u2B50 Save as Tool";
    ctxSaveToolBtn.title = "Save this formula block as a reusable toolbar item";
    ctxMenu.appendChild(ctxSaveToolBtn);
    const ctxDeleteBtn = document.createElement("button");
    ctxDeleteBtn.textContent = "Delete Block";
    ctxMenu.appendChild(ctxDeleteBtn);
    document.body.appendChild(ctxMenu);
    let ctxTarget = null;
    let ctxFormulaRowEl = null;
    let ctxFormulaActions = null;
    const hideCtxMenu = () => {
      ctxMenu.style.display = "none";
      ctxTarget = null;
      ctxFormulaRowEl = null;
      ctxFormulaActions = null;
    };
    ctxSaveToolBtn.addEventListener("click", () => {
      if (!ctxTarget) return;
      const name = prompt("Name for this tool:")?.trim();
      if (!name) return;
      const els = selectedEls.size > 1 ? [
        ...selectedEls
      ] : [
        ctxTarget
      ];
      let originX = Infinity, originY = Infinity;
      for (const el of els) {
        originX = Math.min(originX, parseInt(el.style.left));
        originY = Math.min(originY, parseInt(el.style.top));
      }
      const toolBlocks = els.flatMap((el) => {
        const block = state.blocks.find((b) => b.id === el.id);
        if (!block) return [];
        return [
          {
            type: block.type,
            subtype: block.subtype,
            content: block.content,
            label: block.label,
            w: block.w,
            dx: parseInt(el.style.left) - originX,
            dy: parseInt(el.style.top) - originY
          }
        ];
      });
      const mod = {
        id: `custom-${Date.now()}`,
        name,
        content: toolBlocks[0]?.content ?? "",
        label: toolBlocks[0]?.label ?? "",
        blocks: toolBlocks
      };
      customModules.push(mod);
      saveCustomModules();
      const list = document.getElementById("custom-modules-list");
      if (list) list.appendChild(renderCustomModuleItem(mod));
      hideCtxMenu();
    });
    ctxDeleteBtn.addEventListener("click", () => {
      if (ctxTarget) deleteBlock(ctxTarget);
      hideCtxMenu();
    });
    ctxAddRowBtn.addEventListener("click", () => {
      ctxFormulaActions?.insertRowAfter(ctxFormulaRowEl);
      hideCtxMenu();
    });
    ctxAddIfBtn.addEventListener("click", () => {
      ctxFormulaActions?.insertIfAfter(ctxFormulaRowEl);
      hideCtxMenu();
    });
    ctxAddElseifBtn.addEventListener("click", () => {
      ctxFormulaActions?.insertElseifFor(ctxFormulaRowEl);
      hideCtxMenu();
    });
    ctxAddElseBtn.addEventListener("click", () => {
      ctxFormulaActions?.insertElseFor(ctxFormulaRowEl);
      hideCtxMenu();
    });
    ctxAddForBtn.addEventListener("click", () => {
      ctxFormulaActions?.insertForAfter(ctxFormulaRowEl);
      hideCtxMenu();
    });
    ctxAddDescBtn.addEventListener("click", () => {
      if (ctxFormulaRowEl) ctxFormulaActions?.addDescription(ctxFormulaRowEl);
      hideCtxMenu();
    });
    ctxAddRefBtn.addEventListener("click", () => {
      if (ctxFormulaRowEl) ctxFormulaActions?.addReference(ctxFormulaRowEl);
      hideCtxMenu();
    });
    ctxDelBranchBtn.addEventListener("click", () => {
      if (ctxFormulaRowEl) ctxFormulaActions?.smartDeleteRow(ctxFormulaRowEl);
      hideCtxMenu();
    });
    ctxDelRowBtn.addEventListener("click", () => {
      if (ctxFormulaRowEl) ctxFormulaActions?.smartDeleteRow(ctxFormulaRowEl);
      hideCtxMenu();
    });
    document.addEventListener("mousedown", (e) => {
      if (!ctxMenu.contains(e.target)) hideCtxMenu();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") hideCtxMenu();
    });
    document.addEventListener("contextmenu", (e) => {
      const target = e.target.closest(".block");
      if (!target) return;
      e.preventDefault();
      if (!selectedEls.has(target)) selectBlock(target);
      ctxTarget = target;
      const multi = selectedEls.size > 1;
      ctxSaveToolBtn.textContent = multi ? "\u2B50 Save Selection as Tool" : "\u2B50 Save as Tool";
      ctxSaveToolBtn.style.display = "";
      const rowsEl = e.target.closest(".formula-rows");
      const rowEl = e.target.closest(".formula-row");
      const actions = rowsEl ? rowsEl._formulaCtxActions : null;
      if (actions) {
        ctxFormulaRowEl = rowEl;
        ctxFormulaActions = actions;
        const { rowType, hasIf, hasElse, canDelBranch } = actions.getRowState(rowEl);
        const isRegular = actions.isRegularRow(rowEl);
        const hasDesc = actions.hasDescription(rowEl);
        const hasRef = actions.hasReference(rowEl);
        ctxAddElseifBtn.style.display = hasIf ? "" : "none";
        ctxAddElseBtn.style.display = hasIf ? "" : "none";
        ctxAddElseifBtn.disabled = hasElse;
        ctxAddElseBtn.disabled = hasElse;
        ctxAddElseifBtn.title = hasElse ? "+ elseif (else branch already exists)" : "Add elseif branch to enclosing if (Ctrl+E)";
        ctxAddElseBtn.title = hasElse ? "+ else (else branch already exists)" : "Add else branch to enclosing if (Ctrl+Shift+E)";
        const isInsideGroup = !!rowEl?.closest(".formula-block-group");
        const canHaveDescRef = isRegular && !isInsideGroup || rowType === "if" || rowType === "for";
        ctxAddDescBtn.style.display = canHaveDescRef && !hasDesc ? "" : "none";
        ctxAddRefBtn.style.display = canHaveDescRef && !hasRef ? "" : "none";
        ctxDelBranchBtn.style.display = canDelBranch ? "" : "none";
        const typeLabel = rowType ? ` (${rowType})` : "";
        ctxDelRowBtn.title = `Delete this row${typeLabel} (Ctrl+-)`;
        ctxFormulaGroup.style.display = "";
        ctxFormulaSep.style.display = "";
      } else {
        ctxFormulaRowEl = null;
        ctxFormulaActions = null;
        ctxFormulaGroup.style.display = "none";
        ctxFormulaSep.style.display = "none";
      }
      ctxMenu.style.left = `${e.clientX}px`;
      ctxMenu.style.top = `${e.clientY}px`;
      ctxMenu.style.display = "block";
    });
    state.blocks.forEach(renderBlock);
  } catch (e) {
    console.error("Wasm Load Error:", e);
  }
}
start();
