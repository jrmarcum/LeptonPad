// src/solver.ts
var exp;
async function init() {
  const { instance } = await WebAssembly.instantiateStreaming(fetch("./solver.wasm"));
  exp = instance.exports;
}
var rect_area = (b, h) => exp.rect_area(b, h);
var rect_ix = (b, h) => exp.rect_ix(b, h);
var solve_beam_deflection = (p, l, e, i) => exp.solve_beam_deflection(p, l, e, i);

// C:/Users/Jmarcum/AppData/Local/deno/npm/registry.npmjs.org/tslib/2.8.1/tslib.es6.mjs
function __rest(s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
}
function __awaiter(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}

// C:/Users/Jmarcum/AppData/Local/deno/npm/registry.npmjs.org/@supabase/functions-js/2.98.0/dist/module/helper.js
var resolveFetch = (customFetch) => {
  if (customFetch) {
    return (...args) => customFetch(...args);
  }
  return (...args) => fetch(...args);
};

// C:/Users/Jmarcum/AppData/Local/deno/npm/registry.npmjs.org/@supabase/functions-js/2.98.0/dist/module/types.js
var FunctionsError = class extends Error {
  constructor(message, name = "FunctionsError", context) {
    super(message);
    this.name = name;
    this.context = context;
  }
};
var FunctionsFetchError = class extends FunctionsError {
  constructor(context) {
    super("Failed to send a request to the Edge Function", "FunctionsFetchError", context);
  }
};
var FunctionsRelayError = class extends FunctionsError {
  constructor(context) {
    super("Relay Error invoking the Edge Function", "FunctionsRelayError", context);
  }
};
var FunctionsHttpError = class extends FunctionsError {
  constructor(context) {
    super("Edge Function returned a non-2xx status code", "FunctionsHttpError", context);
  }
};
var FunctionRegion;
(function(FunctionRegion2) {
  FunctionRegion2["Any"] = "any";
  FunctionRegion2["ApNortheast1"] = "ap-northeast-1";
  FunctionRegion2["ApNortheast2"] = "ap-northeast-2";
  FunctionRegion2["ApSouth1"] = "ap-south-1";
  FunctionRegion2["ApSoutheast1"] = "ap-southeast-1";
  FunctionRegion2["ApSoutheast2"] = "ap-southeast-2";
  FunctionRegion2["CaCentral1"] = "ca-central-1";
  FunctionRegion2["EuCentral1"] = "eu-central-1";
  FunctionRegion2["EuWest1"] = "eu-west-1";
  FunctionRegion2["EuWest2"] = "eu-west-2";
  FunctionRegion2["EuWest3"] = "eu-west-3";
  FunctionRegion2["SaEast1"] = "sa-east-1";
  FunctionRegion2["UsEast1"] = "us-east-1";
  FunctionRegion2["UsWest1"] = "us-west-1";
  FunctionRegion2["UsWest2"] = "us-west-2";
})(FunctionRegion || (FunctionRegion = {}));

// C:/Users/Jmarcum/AppData/Local/deno/npm/registry.npmjs.org/@supabase/functions-js/2.98.0/dist/module/FunctionsClient.js
var FunctionsClient = class {
  /**
     * Creates a new Functions client bound to an Edge Functions URL.
     *
     * @example
     * ```ts
     * import { FunctionsClient, FunctionRegion } from '@supabase/functions-js'
     *
     * const functions = new FunctionsClient('https://xyzcompany.supabase.co/functions/v1', {
     *   headers: { apikey: 'public-anon-key' },
     *   region: FunctionRegion.UsEast1,
     * })
     * ```
     */
  constructor(url, { headers = {}, customFetch, region = FunctionRegion.Any } = {}) {
    this.url = url;
    this.headers = headers;
    this.region = region;
    this.fetch = resolveFetch(customFetch);
  }
  /**
     * Updates the authorization header
     * @param token - the new jwt token sent in the authorisation header
     * @example
     * ```ts
     * functions.setAuth(session.access_token)
     * ```
     */
  setAuth(token) {
    this.headers.Authorization = `Bearer ${token}`;
  }
  /**
     * Invokes a function
     * @param functionName - The name of the Function to invoke.
     * @param options - Options for invoking the Function.
     * @example
     * ```ts
     * const { data, error } = await functions.invoke('hello-world', {
     *   body: { name: 'Ada' },
     * })
     * ```
     */
  invoke(functionName_1) {
    return __awaiter(this, arguments, void 0, function* (functionName, options = {}) {
      var _a;
      let timeoutId;
      let timeoutController;
      try {
        const { headers, method, body: functionArgs, signal, timeout } = options;
        let _headers = {};
        let { region } = options;
        if (!region) {
          region = this.region;
        }
        const url = new URL(`${this.url}/${functionName}`);
        if (region && region !== "any") {
          _headers["x-region"] = region;
          url.searchParams.set("forceFunctionRegion", region);
        }
        let body;
        if (functionArgs && (headers && !Object.prototype.hasOwnProperty.call(headers, "Content-Type") || !headers)) {
          if (typeof Blob !== "undefined" && functionArgs instanceof Blob || functionArgs instanceof ArrayBuffer) {
            _headers["Content-Type"] = "application/octet-stream";
            body = functionArgs;
          } else if (typeof functionArgs === "string") {
            _headers["Content-Type"] = "text/plain";
            body = functionArgs;
          } else if (typeof FormData !== "undefined" && functionArgs instanceof FormData) {
            body = functionArgs;
          } else {
            _headers["Content-Type"] = "application/json";
            body = JSON.stringify(functionArgs);
          }
        } else {
          if (functionArgs && typeof functionArgs !== "string" && !(typeof Blob !== "undefined" && functionArgs instanceof Blob) && !(functionArgs instanceof ArrayBuffer) && !(typeof FormData !== "undefined" && functionArgs instanceof FormData)) {
            body = JSON.stringify(functionArgs);
          } else {
            body = functionArgs;
          }
        }
        let effectiveSignal = signal;
        if (timeout) {
          timeoutController = new AbortController();
          timeoutId = setTimeout(() => timeoutController.abort(), timeout);
          if (signal) {
            effectiveSignal = timeoutController.signal;
            signal.addEventListener("abort", () => timeoutController.abort());
          } else {
            effectiveSignal = timeoutController.signal;
          }
        }
        const response = yield this.fetch(url.toString(), {
          method: method || "POST",
          // headers priority is (high to low):
          // 1. invoke-level headers
          // 2. client-level headers
          // 3. default Content-Type header
          headers: Object.assign(Object.assign(Object.assign({}, _headers), this.headers), headers),
          body,
          signal: effectiveSignal
        }).catch((fetchError) => {
          throw new FunctionsFetchError(fetchError);
        });
        const isRelayError = response.headers.get("x-relay-error");
        if (isRelayError && isRelayError === "true") {
          throw new FunctionsRelayError(response);
        }
        if (!response.ok) {
          throw new FunctionsHttpError(response);
        }
        let responseType = ((_a = response.headers.get("Content-Type")) !== null && _a !== void 0 ? _a : "text/plain").split(";")[0].trim();
        let data;
        if (responseType === "application/json") {
          data = yield response.json();
        } else if (responseType === "application/octet-stream" || responseType === "application/pdf") {
          data = yield response.blob();
        } else if (responseType === "text/event-stream") {
          data = response;
        } else if (responseType === "multipart/form-data") {
          data = yield response.formData();
        } else {
          data = yield response.text();
        }
        return {
          data,
          error: null,
          response
        };
      } catch (error) {
        return {
          data: null,
          error,
          response: error instanceof FunctionsHttpError || error instanceof FunctionsRelayError ? error.context : void 0
        };
      } finally {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      }
    });
  }
};

// C:/Users/Jmarcum/AppData/Local/deno/npm/registry.npmjs.org/@supabase/postgrest-js/2.98.0/dist/index.mjs
var PostgrestError = class extends Error {
  /**
  * @example
  * ```ts
  * import PostgrestError from '@supabase/postgrest-js'
  *
  * throw new PostgrestError({
  *   message: 'Row level security prevented the request',
  *   details: 'RLS denied the insert',
  *   hint: 'Check your policies',
  *   code: 'PGRST301',
  * })
  * ```
  */
  constructor(context) {
    super(context.message);
    this.name = "PostgrestError";
    this.details = context.details;
    this.hint = context.hint;
    this.code = context.code;
  }
};
var PostgrestBuilder = class {
  /**
  * Creates a builder configured for a specific PostgREST request.
  *
  * @example
  * ```ts
  * import PostgrestQueryBuilder from '@supabase/postgrest-js'
  *
  * const builder = new PostgrestQueryBuilder(
  *   new URL('https://xyzcompany.supabase.co/rest/v1/users'),
  *   { headers: new Headers({ apikey: 'public-anon-key' }) }
  * )
  * ```
  */
  constructor(builder) {
    var _builder$shouldThrowO, _builder$isMaybeSingl, _builder$urlLengthLim;
    this.shouldThrowOnError = false;
    this.method = builder.method;
    this.url = builder.url;
    this.headers = new Headers(builder.headers);
    this.schema = builder.schema;
    this.body = builder.body;
    this.shouldThrowOnError = (_builder$shouldThrowO = builder.shouldThrowOnError) !== null && _builder$shouldThrowO !== void 0 ? _builder$shouldThrowO : false;
    this.signal = builder.signal;
    this.isMaybeSingle = (_builder$isMaybeSingl = builder.isMaybeSingle) !== null && _builder$isMaybeSingl !== void 0 ? _builder$isMaybeSingl : false;
    this.urlLengthLimit = (_builder$urlLengthLim = builder.urlLengthLimit) !== null && _builder$urlLengthLim !== void 0 ? _builder$urlLengthLim : 8e3;
    if (builder.fetch) this.fetch = builder.fetch;
    else this.fetch = fetch;
  }
  /**
  * If there's an error with the query, throwOnError will reject the promise by
  * throwing the error instead of returning it as part of a successful response.
  *
  * {@link https://github.com/supabase/supabase-js/issues/92}
  */
  throwOnError() {
    this.shouldThrowOnError = true;
    return this;
  }
  /**
  * Set an HTTP header for the request.
  */
  setHeader(name, value) {
    this.headers = new Headers(this.headers);
    this.headers.set(name, value);
    return this;
  }
  then(onfulfilled, onrejected) {
    var _this = this;
    if (this.schema === void 0) {
    } else if ([
      "GET",
      "HEAD"
    ].includes(this.method)) this.headers.set("Accept-Profile", this.schema);
    else this.headers.set("Content-Profile", this.schema);
    if (this.method !== "GET" && this.method !== "HEAD") this.headers.set("Content-Type", "application/json");
    const _fetch = this.fetch;
    let res = _fetch(this.url.toString(), {
      method: this.method,
      headers: this.headers,
      body: JSON.stringify(this.body),
      signal: this.signal
    }).then(async (res$1) => {
      let error = null;
      let data = null;
      let count = null;
      let status = res$1.status;
      let statusText = res$1.statusText;
      if (res$1.ok) {
        var _this$headers$get2, _res$headers$get;
        if (_this.method !== "HEAD") {
          var _this$headers$get;
          const body = await res$1.text();
          if (body === "") {
          } else if (_this.headers.get("Accept") === "text/csv") data = body;
          else if (_this.headers.get("Accept") && ((_this$headers$get = _this.headers.get("Accept")) === null || _this$headers$get === void 0 ? void 0 : _this$headers$get.includes("application/vnd.pgrst.plan+text"))) data = body;
          else data = JSON.parse(body);
        }
        const countHeader = (_this$headers$get2 = _this.headers.get("Prefer")) === null || _this$headers$get2 === void 0 ? void 0 : _this$headers$get2.match(/count=(exact|planned|estimated)/);
        const contentRange = (_res$headers$get = res$1.headers.get("content-range")) === null || _res$headers$get === void 0 ? void 0 : _res$headers$get.split("/");
        if (countHeader && contentRange && contentRange.length > 1) count = parseInt(contentRange[1]);
        if (_this.isMaybeSingle && _this.method === "GET" && Array.isArray(data)) if (data.length > 1) {
          error = {
            code: "PGRST116",
            details: `Results contain ${data.length} rows, application/vnd.pgrst.object+json requires 1 row`,
            hint: null,
            message: "JSON object requested, multiple (or no) rows returned"
          };
          data = null;
          count = null;
          status = 406;
          statusText = "Not Acceptable";
        } else if (data.length === 1) data = data[0];
        else data = null;
      } else {
        var _error$details;
        const body = await res$1.text();
        try {
          error = JSON.parse(body);
          if (Array.isArray(error) && res$1.status === 404) {
            data = [];
            error = null;
            status = 200;
            statusText = "OK";
          }
        } catch (_unused) {
          if (res$1.status === 404 && body === "") {
            status = 204;
            statusText = "No Content";
          } else error = {
            message: body
          };
        }
        if (error && _this.isMaybeSingle && (error === null || error === void 0 || (_error$details = error.details) === null || _error$details === void 0 ? void 0 : _error$details.includes("0 rows"))) {
          error = null;
          status = 200;
          statusText = "OK";
        }
        if (error && _this.shouldThrowOnError) throw new PostgrestError(error);
      }
      return {
        error,
        data,
        count,
        status,
        statusText
      };
    });
    if (!this.shouldThrowOnError) res = res.catch((fetchError) => {
      var _fetchError$name2;
      let errorDetails = "";
      let hint = "";
      let code = "";
      const cause = fetchError === null || fetchError === void 0 ? void 0 : fetchError.cause;
      if (cause) {
        var _cause$message, _cause$code, _fetchError$name, _cause$name;
        const causeMessage = (_cause$message = cause === null || cause === void 0 ? void 0 : cause.message) !== null && _cause$message !== void 0 ? _cause$message : "";
        const causeCode = (_cause$code = cause === null || cause === void 0 ? void 0 : cause.code) !== null && _cause$code !== void 0 ? _cause$code : "";
        errorDetails = `${(_fetchError$name = fetchError === null || fetchError === void 0 ? void 0 : fetchError.name) !== null && _fetchError$name !== void 0 ? _fetchError$name : "FetchError"}: ${fetchError === null || fetchError === void 0 ? void 0 : fetchError.message}`;
        errorDetails += `

Caused by: ${(_cause$name = cause === null || cause === void 0 ? void 0 : cause.name) !== null && _cause$name !== void 0 ? _cause$name : "Error"}: ${causeMessage}`;
        if (causeCode) errorDetails += ` (${causeCode})`;
        if (cause === null || cause === void 0 ? void 0 : cause.stack) errorDetails += `
${cause.stack}`;
      } else {
        var _fetchError$stack;
        errorDetails = (_fetchError$stack = fetchError === null || fetchError === void 0 ? void 0 : fetchError.stack) !== null && _fetchError$stack !== void 0 ? _fetchError$stack : "";
      }
      const urlLength = this.url.toString().length;
      if ((fetchError === null || fetchError === void 0 ? void 0 : fetchError.name) === "AbortError" || (fetchError === null || fetchError === void 0 ? void 0 : fetchError.code) === "ABORT_ERR") {
        code = "";
        hint = "Request was aborted (timeout or manual cancellation)";
        if (urlLength > this.urlLengthLimit) hint += `. Note: Your request URL is ${urlLength} characters, which may exceed server limits. If selecting many fields, consider using views. If filtering with large arrays (e.g., .in('id', [many IDs])), consider using an RPC function to pass values server-side.`;
      } else if ((cause === null || cause === void 0 ? void 0 : cause.name) === "HeadersOverflowError" || (cause === null || cause === void 0 ? void 0 : cause.code) === "UND_ERR_HEADERS_OVERFLOW") {
        code = "";
        hint = "HTTP headers exceeded server limits (typically 16KB)";
        if (urlLength > this.urlLengthLimit) hint += `. Your request URL is ${urlLength} characters. If selecting many fields, consider using views. If filtering with large arrays (e.g., .in('id', [200+ IDs])), consider using an RPC function instead.`;
      }
      return {
        error: {
          message: `${(_fetchError$name2 = fetchError === null || fetchError === void 0 ? void 0 : fetchError.name) !== null && _fetchError$name2 !== void 0 ? _fetchError$name2 : "FetchError"}: ${fetchError === null || fetchError === void 0 ? void 0 : fetchError.message}`,
          details: errorDetails,
          hint,
          code
        },
        data: null,
        count: null,
        status: 0,
        statusText: ""
      };
    });
    return res.then(onfulfilled, onrejected);
  }
  /**
  * Override the type of the returned `data`.
  *
  * @typeParam NewResult - The new result type to override with
  * @deprecated Use overrideTypes<yourType, { merge: false }>() method at the end of your call chain instead
  */
  returns() {
    return this;
  }
  /**
  * Override the type of the returned `data` field in the response.
  *
  * @typeParam NewResult - The new type to cast the response data to
  * @typeParam Options - Optional type configuration (defaults to { merge: true })
  * @typeParam Options.merge - When true, merges the new type with existing return type. When false, replaces the existing types entirely (defaults to true)
  * @example
  * ```typescript
  * // Merge with existing types (default behavior)
  * const query = supabase
  *   .from('users')
  *   .select()
  *   .overrideTypes<{ custom_field: string }>()
  *
  * // Replace existing types completely
  * const replaceQuery = supabase
  *   .from('users')
  *   .select()
  *   .overrideTypes<{ id: number; name: string }, { merge: false }>()
  * ```
  * @returns A PostgrestBuilder instance with the new type
  */
  overrideTypes() {
    return this;
  }
};
var PostgrestTransformBuilder = class extends PostgrestBuilder {
  /**
  * Perform a SELECT on the query result.
  *
  * By default, `.insert()`, `.update()`, `.upsert()`, and `.delete()` do not
  * return modified rows. By calling this method, modified rows are returned in
  * `data`.
  *
  * @param columns - The columns to retrieve, separated by commas
  */
  select(columns) {
    let quoted = false;
    const cleanedColumns = (columns !== null && columns !== void 0 ? columns : "*").split("").map((c) => {
      if (/\s/.test(c) && !quoted) return "";
      if (c === '"') quoted = !quoted;
      return c;
    }).join("");
    this.url.searchParams.set("select", cleanedColumns);
    this.headers.append("Prefer", "return=representation");
    return this;
  }
  /**
  * Order the query result by `column`.
  *
  * You can call this method multiple times to order by multiple columns.
  *
  * You can order referenced tables, but it only affects the ordering of the
  * parent table if you use `!inner` in the query.
  *
  * @param column - The column to order by
  * @param options - Named parameters
  * @param options.ascending - If `true`, the result will be in ascending order
  * @param options.nullsFirst - If `true`, `null`s appear first. If `false`,
  * `null`s appear last.
  * @param options.referencedTable - Set this to order a referenced table by
  * its columns
  * @param options.foreignTable - Deprecated, use `options.referencedTable`
  * instead
  */
  order(column, { ascending = true, nullsFirst, foreignTable, referencedTable = foreignTable } = {}) {
    const key = referencedTable ? `${referencedTable}.order` : "order";
    const existingOrder = this.url.searchParams.get(key);
    this.url.searchParams.set(key, `${existingOrder ? `${existingOrder},` : ""}${column}.${ascending ? "asc" : "desc"}${nullsFirst === void 0 ? "" : nullsFirst ? ".nullsfirst" : ".nullslast"}`);
    return this;
  }
  /**
  * Limit the query result by `count`.
  *
  * @param count - The maximum number of rows to return
  * @param options - Named parameters
  * @param options.referencedTable - Set this to limit rows of referenced
  * tables instead of the parent table
  * @param options.foreignTable - Deprecated, use `options.referencedTable`
  * instead
  */
  limit(count, { foreignTable, referencedTable = foreignTable } = {}) {
    const key = typeof referencedTable === "undefined" ? "limit" : `${referencedTable}.limit`;
    this.url.searchParams.set(key, `${count}`);
    return this;
  }
  /**
  * Limit the query result by starting at an offset `from` and ending at the offset `to`.
  * Only records within this range are returned.
  * This respects the query order and if there is no order clause the range could behave unexpectedly.
  * The `from` and `to` values are 0-based and inclusive: `range(1, 3)` will include the second, third
  * and fourth rows of the query.
  *
  * @param from - The starting index from which to limit the result
  * @param to - The last index to which to limit the result
  * @param options - Named parameters
  * @param options.referencedTable - Set this to limit rows of referenced
  * tables instead of the parent table
  * @param options.foreignTable - Deprecated, use `options.referencedTable`
  * instead
  */
  range(from, to, { foreignTable, referencedTable = foreignTable } = {}) {
    const keyOffset = typeof referencedTable === "undefined" ? "offset" : `${referencedTable}.offset`;
    const keyLimit = typeof referencedTable === "undefined" ? "limit" : `${referencedTable}.limit`;
    this.url.searchParams.set(keyOffset, `${from}`);
    this.url.searchParams.set(keyLimit, `${to - from + 1}`);
    return this;
  }
  /**
  * Set the AbortSignal for the fetch request.
  *
  * @param signal - The AbortSignal to use for the fetch request
  */
  abortSignal(signal) {
    this.signal = signal;
    return this;
  }
  /**
  * Return `data` as a single object instead of an array of objects.
  *
  * Query result must be one row (e.g. using `.limit(1)`), otherwise this
  * returns an error.
  */
  single() {
    this.headers.set("Accept", "application/vnd.pgrst.object+json");
    return this;
  }
  /**
  * Return `data` as a single object instead of an array of objects.
  *
  * Query result must be zero or one row (e.g. using `.limit(1)`), otherwise
  * this returns an error.
  */
  maybeSingle() {
    if (this.method === "GET") this.headers.set("Accept", "application/json");
    else this.headers.set("Accept", "application/vnd.pgrst.object+json");
    this.isMaybeSingle = true;
    return this;
  }
  /**
  * Return `data` as a string in CSV format.
  */
  csv() {
    this.headers.set("Accept", "text/csv");
    return this;
  }
  /**
  * Return `data` as an object in [GeoJSON](https://geojson.org) format.
  */
  geojson() {
    this.headers.set("Accept", "application/geo+json");
    return this;
  }
  /**
  * Return `data` as the EXPLAIN plan for the query.
  *
  * You need to enable the
  * [db_plan_enabled](https://supabase.com/docs/guides/database/debugging-performance#enabling-explain)
  * setting before using this method.
  *
  * @param options - Named parameters
  *
  * @param options.analyze - If `true`, the query will be executed and the
  * actual run time will be returned
  *
  * @param options.verbose - If `true`, the query identifier will be returned
  * and `data` will include the output columns of the query
  *
  * @param options.settings - If `true`, include information on configuration
  * parameters that affect query planning
  *
  * @param options.buffers - If `true`, include information on buffer usage
  *
  * @param options.wal - If `true`, include information on WAL record generation
  *
  * @param options.format - The format of the output, can be `"text"` (default)
  * or `"json"`
  */
  explain({ analyze = false, verbose = false, settings = false, buffers = false, wal = false, format = "text" } = {}) {
    var _this$headers$get;
    const options = [
      analyze ? "analyze" : null,
      verbose ? "verbose" : null,
      settings ? "settings" : null,
      buffers ? "buffers" : null,
      wal ? "wal" : null
    ].filter(Boolean).join("|");
    const forMediatype = (_this$headers$get = this.headers.get("Accept")) !== null && _this$headers$get !== void 0 ? _this$headers$get : "application/json";
    this.headers.set("Accept", `application/vnd.pgrst.plan+${format}; for="${forMediatype}"; options=${options};`);
    if (format === "json") return this;
    else return this;
  }
  /**
  * Rollback the query.
  *
  * `data` will still be returned, but the query is not committed.
  */
  rollback() {
    this.headers.append("Prefer", "tx=rollback");
    return this;
  }
  /**
  * Override the type of the returned `data`.
  *
  * @typeParam NewResult - The new result type to override with
  * @deprecated Use overrideTypes<yourType, { merge: false }>() method at the end of your call chain instead
  */
  returns() {
    return this;
  }
  /**
  * Set the maximum number of rows that can be affected by the query.
  * Only available in PostgREST v13+ and only works with PATCH and DELETE methods.
  *
  * @param value - The maximum number of rows that can be affected
  */
  maxAffected(value) {
    this.headers.append("Prefer", "handling=strict");
    this.headers.append("Prefer", `max-affected=${value}`);
    return this;
  }
};
var PostgrestReservedCharsRegexp = /* @__PURE__ */ new RegExp("[,()]");
var PostgrestFilterBuilder = class extends PostgrestTransformBuilder {
  /**
  * Match only rows where `column` is equal to `value`.
  *
  * To check if the value of `column` is NULL, you should use `.is()` instead.
  *
  * @param column - The column to filter on
  * @param value - The value to filter with
  */
  eq(column, value) {
    this.url.searchParams.append(column, `eq.${value}`);
    return this;
  }
  /**
  * Match only rows where `column` is not equal to `value`.
  *
  * @param column - The column to filter on
  * @param value - The value to filter with
  */
  neq(column, value) {
    this.url.searchParams.append(column, `neq.${value}`);
    return this;
  }
  /**
  * Match only rows where `column` is greater than `value`.
  *
  * @param column - The column to filter on
  * @param value - The value to filter with
  */
  gt(column, value) {
    this.url.searchParams.append(column, `gt.${value}`);
    return this;
  }
  /**
  * Match only rows where `column` is greater than or equal to `value`.
  *
  * @param column - The column to filter on
  * @param value - The value to filter with
  */
  gte(column, value) {
    this.url.searchParams.append(column, `gte.${value}`);
    return this;
  }
  /**
  * Match only rows where `column` is less than `value`.
  *
  * @param column - The column to filter on
  * @param value - The value to filter with
  */
  lt(column, value) {
    this.url.searchParams.append(column, `lt.${value}`);
    return this;
  }
  /**
  * Match only rows where `column` is less than or equal to `value`.
  *
  * @param column - The column to filter on
  * @param value - The value to filter with
  */
  lte(column, value) {
    this.url.searchParams.append(column, `lte.${value}`);
    return this;
  }
  /**
  * Match only rows where `column` matches `pattern` case-sensitively.
  *
  * @param column - The column to filter on
  * @param pattern - The pattern to match with
  */
  like(column, pattern) {
    this.url.searchParams.append(column, `like.${pattern}`);
    return this;
  }
  /**
  * Match only rows where `column` matches all of `patterns` case-sensitively.
  *
  * @param column - The column to filter on
  * @param patterns - The patterns to match with
  */
  likeAllOf(column, patterns) {
    this.url.searchParams.append(column, `like(all).{${patterns.join(",")}}`);
    return this;
  }
  /**
  * Match only rows where `column` matches any of `patterns` case-sensitively.
  *
  * @param column - The column to filter on
  * @param patterns - The patterns to match with
  */
  likeAnyOf(column, patterns) {
    this.url.searchParams.append(column, `like(any).{${patterns.join(",")}}`);
    return this;
  }
  /**
  * Match only rows where `column` matches `pattern` case-insensitively.
  *
  * @param column - The column to filter on
  * @param pattern - The pattern to match with
  */
  ilike(column, pattern) {
    this.url.searchParams.append(column, `ilike.${pattern}`);
    return this;
  }
  /**
  * Match only rows where `column` matches all of `patterns` case-insensitively.
  *
  * @param column - The column to filter on
  * @param patterns - The patterns to match with
  */
  ilikeAllOf(column, patterns) {
    this.url.searchParams.append(column, `ilike(all).{${patterns.join(",")}}`);
    return this;
  }
  /**
  * Match only rows where `column` matches any of `patterns` case-insensitively.
  *
  * @param column - The column to filter on
  * @param patterns - The patterns to match with
  */
  ilikeAnyOf(column, patterns) {
    this.url.searchParams.append(column, `ilike(any).{${patterns.join(",")}}`);
    return this;
  }
  /**
  * Match only rows where `column` matches the PostgreSQL regex `pattern`
  * case-sensitively (using the `~` operator).
  *
  * @param column - The column to filter on
  * @param pattern - The PostgreSQL regular expression pattern to match with
  */
  regexMatch(column, pattern) {
    this.url.searchParams.append(column, `match.${pattern}`);
    return this;
  }
  /**
  * Match only rows where `column` matches the PostgreSQL regex `pattern`
  * case-insensitively (using the `~*` operator).
  *
  * @param column - The column to filter on
  * @param pattern - The PostgreSQL regular expression pattern to match with
  */
  regexIMatch(column, pattern) {
    this.url.searchParams.append(column, `imatch.${pattern}`);
    return this;
  }
  /**
  * Match only rows where `column` IS `value`.
  *
  * For non-boolean columns, this is only relevant for checking if the value of
  * `column` is NULL by setting `value` to `null`.
  *
  * For boolean columns, you can also set `value` to `true` or `false` and it
  * will behave the same way as `.eq()`.
  *
  * @param column - The column to filter on
  * @param value - The value to filter with
  */
  is(column, value) {
    this.url.searchParams.append(column, `is.${value}`);
    return this;
  }
  /**
  * Match only rows where `column` IS DISTINCT FROM `value`.
  *
  * Unlike `.neq()`, this treats `NULL` as a comparable value. Two `NULL` values
  * are considered equal (not distinct), and comparing `NULL` with any non-NULL
  * value returns true (distinct).
  *
  * @param column - The column to filter on
  * @param value - The value to filter with
  */
  isDistinct(column, value) {
    this.url.searchParams.append(column, `isdistinct.${value}`);
    return this;
  }
  /**
  * Match only rows where `column` is included in the `values` array.
  *
  * @param column - The column to filter on
  * @param values - The values array to filter with
  */
  in(column, values) {
    const cleanedValues = Array.from(new Set(values)).map((s) => {
      if (typeof s === "string" && PostgrestReservedCharsRegexp.test(s)) return `"${s}"`;
      else return `${s}`;
    }).join(",");
    this.url.searchParams.append(column, `in.(${cleanedValues})`);
    return this;
  }
  /**
  * Match only rows where `column` is NOT included in the `values` array.
  *
  * @param column - The column to filter on
  * @param values - The values array to filter with
  */
  notIn(column, values) {
    const cleanedValues = Array.from(new Set(values)).map((s) => {
      if (typeof s === "string" && PostgrestReservedCharsRegexp.test(s)) return `"${s}"`;
      else return `${s}`;
    }).join(",");
    this.url.searchParams.append(column, `not.in.(${cleanedValues})`);
    return this;
  }
  /**
  * Only relevant for jsonb, array, and range columns. Match only rows where
  * `column` contains every element appearing in `value`.
  *
  * @param column - The jsonb, array, or range column to filter on
  * @param value - The jsonb, array, or range value to filter with
  */
  contains(column, value) {
    if (typeof value === "string") this.url.searchParams.append(column, `cs.${value}`);
    else if (Array.isArray(value)) this.url.searchParams.append(column, `cs.{${value.join(",")}}`);
    else this.url.searchParams.append(column, `cs.${JSON.stringify(value)}`);
    return this;
  }
  /**
  * Only relevant for jsonb, array, and range columns. Match only rows where
  * every element appearing in `column` is contained by `value`.
  *
  * @param column - The jsonb, array, or range column to filter on
  * @param value - The jsonb, array, or range value to filter with
  */
  containedBy(column, value) {
    if (typeof value === "string") this.url.searchParams.append(column, `cd.${value}`);
    else if (Array.isArray(value)) this.url.searchParams.append(column, `cd.{${value.join(",")}}`);
    else this.url.searchParams.append(column, `cd.${JSON.stringify(value)}`);
    return this;
  }
  /**
  * Only relevant for range columns. Match only rows where every element in
  * `column` is greater than any element in `range`.
  *
  * @param column - The range column to filter on
  * @param range - The range to filter with
  */
  rangeGt(column, range) {
    this.url.searchParams.append(column, `sr.${range}`);
    return this;
  }
  /**
  * Only relevant for range columns. Match only rows where every element in
  * `column` is either contained in `range` or greater than any element in
  * `range`.
  *
  * @param column - The range column to filter on
  * @param range - The range to filter with
  */
  rangeGte(column, range) {
    this.url.searchParams.append(column, `nxl.${range}`);
    return this;
  }
  /**
  * Only relevant for range columns. Match only rows where every element in
  * `column` is less than any element in `range`.
  *
  * @param column - The range column to filter on
  * @param range - The range to filter with
  */
  rangeLt(column, range) {
    this.url.searchParams.append(column, `sl.${range}`);
    return this;
  }
  /**
  * Only relevant for range columns. Match only rows where every element in
  * `column` is either contained in `range` or less than any element in
  * `range`.
  *
  * @param column - The range column to filter on
  * @param range - The range to filter with
  */
  rangeLte(column, range) {
    this.url.searchParams.append(column, `nxr.${range}`);
    return this;
  }
  /**
  * Only relevant for range columns. Match only rows where `column` is
  * mutually exclusive to `range` and there can be no element between the two
  * ranges.
  *
  * @param column - The range column to filter on
  * @param range - The range to filter with
  */
  rangeAdjacent(column, range) {
    this.url.searchParams.append(column, `adj.${range}`);
    return this;
  }
  /**
  * Only relevant for array and range columns. Match only rows where
  * `column` and `value` have an element in common.
  *
  * @param column - The array or range column to filter on
  * @param value - The array or range value to filter with
  */
  overlaps(column, value) {
    if (typeof value === "string") this.url.searchParams.append(column, `ov.${value}`);
    else this.url.searchParams.append(column, `ov.{${value.join(",")}}`);
    return this;
  }
  /**
  * Only relevant for text and tsvector columns. Match only rows where
  * `column` matches the query string in `query`.
  *
  * @param column - The text or tsvector column to filter on
  * @param query - The query text to match with
  * @param options - Named parameters
  * @param options.config - The text search configuration to use
  * @param options.type - Change how the `query` text is interpreted
  */
  textSearch(column, query, { config, type } = {}) {
    let typePart = "";
    if (type === "plain") typePart = "pl";
    else if (type === "phrase") typePart = "ph";
    else if (type === "websearch") typePart = "w";
    const configPart = config === void 0 ? "" : `(${config})`;
    this.url.searchParams.append(column, `${typePart}fts${configPart}.${query}`);
    return this;
  }
  /**
  * Match only rows where each column in `query` keys is equal to its
  * associated value. Shorthand for multiple `.eq()`s.
  *
  * @param query - The object to filter with, with column names as keys mapped
  * to their filter values
  */
  match(query) {
    Object.entries(query).forEach(([column, value]) => {
      this.url.searchParams.append(column, `eq.${value}`);
    });
    return this;
  }
  /**
  * Match only rows which doesn't satisfy the filter.
  *
  * Unlike most filters, `opearator` and `value` are used as-is and need to
  * follow [PostgREST
  * syntax](https://postgrest.org/en/stable/api.html#operators). You also need
  * to make sure they are properly sanitized.
  *
  * @param column - The column to filter on
  * @param operator - The operator to be negated to filter with, following
  * PostgREST syntax
  * @param value - The value to filter with, following PostgREST syntax
  */
  not(column, operator, value) {
    this.url.searchParams.append(column, `not.${operator}.${value}`);
    return this;
  }
  /**
  * Match only rows which satisfy at least one of the filters.
  *
  * Unlike most filters, `filters` is used as-is and needs to follow [PostgREST
  * syntax](https://postgrest.org/en/stable/api.html#operators). You also need
  * to make sure it's properly sanitized.
  *
  * It's currently not possible to do an `.or()` filter across multiple tables.
  *
  * @param filters - The filters to use, following PostgREST syntax
  * @param options - Named parameters
  * @param options.referencedTable - Set this to filter on referenced tables
  * instead of the parent table
  * @param options.foreignTable - Deprecated, use `referencedTable` instead
  */
  or(filters, { foreignTable, referencedTable = foreignTable } = {}) {
    const key = referencedTable ? `${referencedTable}.or` : "or";
    this.url.searchParams.append(key, `(${filters})`);
    return this;
  }
  /**
  * Match only rows which satisfy the filter. This is an escape hatch - you
  * should use the specific filter methods wherever possible.
  *
  * Unlike most filters, `opearator` and `value` are used as-is and need to
  * follow [PostgREST
  * syntax](https://postgrest.org/en/stable/api.html#operators). You also need
  * to make sure they are properly sanitized.
  *
  * @param column - The column to filter on
  * @param operator - The operator to filter with, following PostgREST syntax
  * @param value - The value to filter with, following PostgREST syntax
  */
  filter(column, operator, value) {
    this.url.searchParams.append(column, `${operator}.${value}`);
    return this;
  }
};
var PostgrestQueryBuilder = class {
  /**
  * Creates a query builder scoped to a Postgres table or view.
  *
  * @example
  * ```ts
  * import PostgrestQueryBuilder from '@supabase/postgrest-js'
  *
  * const query = new PostgrestQueryBuilder(
  *   new URL('https://xyzcompany.supabase.co/rest/v1/users'),
  *   { headers: { apikey: 'public-anon-key' } }
  * )
  * ```
  */
  constructor(url, { headers = {}, schema, fetch: fetch$1, urlLengthLimit = 8e3 }) {
    this.url = url;
    this.headers = new Headers(headers);
    this.schema = schema;
    this.fetch = fetch$1;
    this.urlLengthLimit = urlLengthLimit;
  }
  /**
  * Clone URL and headers to prevent shared state between operations.
  */
  cloneRequestState() {
    return {
      url: new URL(this.url.toString()),
      headers: new Headers(this.headers)
    };
  }
  /**
  * Perform a SELECT query on the table or view.
  *
  * @param columns - The columns to retrieve, separated by commas. Columns can be renamed when returned with `customName:columnName`
  *
  * @param options - Named parameters
  *
  * @param options.head - When set to `true`, `data` will not be returned.
  * Useful if you only need the count.
  *
  * @param options.count - Count algorithm to use to count rows in the table or view.
  *
  * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
  * hood.
  *
  * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
  * statistics under the hood.
  *
  * `"estimated"`: Uses exact count for low numbers and planned count for high
  * numbers.
  *
  * @remarks
  * When using `count` with `.range()` or `.limit()`, the returned `count` is the total number of rows
  * that match your filters, not the number of rows in the current page. Use this to build pagination UI.
  */
  select(columns, options) {
    const { head: head2 = false, count } = options !== null && options !== void 0 ? options : {};
    const method = head2 ? "HEAD" : "GET";
    let quoted = false;
    const cleanedColumns = (columns !== null && columns !== void 0 ? columns : "*").split("").map((c) => {
      if (/\s/.test(c) && !quoted) return "";
      if (c === '"') quoted = !quoted;
      return c;
    }).join("");
    const { url, headers } = this.cloneRequestState();
    url.searchParams.set("select", cleanedColumns);
    if (count) headers.append("Prefer", `count=${count}`);
    return new PostgrestFilterBuilder({
      method,
      url,
      headers,
      schema: this.schema,
      fetch: this.fetch,
      urlLengthLimit: this.urlLengthLimit
    });
  }
  /**
  * Perform an INSERT into the table or view.
  *
  * By default, inserted rows are not returned. To return it, chain the call
  * with `.select()`.
  *
  * @param values - The values to insert. Pass an object to insert a single row
  * or an array to insert multiple rows.
  *
  * @param options - Named parameters
  *
  * @param options.count - Count algorithm to use to count inserted rows.
  *
  * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
  * hood.
  *
  * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
  * statistics under the hood.
  *
  * `"estimated"`: Uses exact count for low numbers and planned count for high
  * numbers.
  *
  * @param options.defaultToNull - Make missing fields default to `null`.
  * Otherwise, use the default value for the column. Only applies for bulk
  * inserts.
  */
  insert(values, { count, defaultToNull = true } = {}) {
    var _this$fetch;
    const method = "POST";
    const { url, headers } = this.cloneRequestState();
    if (count) headers.append("Prefer", `count=${count}`);
    if (!defaultToNull) headers.append("Prefer", `missing=default`);
    if (Array.isArray(values)) {
      const columns = values.reduce((acc, x) => acc.concat(Object.keys(x)), []);
      if (columns.length > 0) {
        const uniqueColumns = [
          ...new Set(columns)
        ].map((column) => `"${column}"`);
        url.searchParams.set("columns", uniqueColumns.join(","));
      }
    }
    return new PostgrestFilterBuilder({
      method,
      url,
      headers,
      schema: this.schema,
      body: values,
      fetch: (_this$fetch = this.fetch) !== null && _this$fetch !== void 0 ? _this$fetch : fetch,
      urlLengthLimit: this.urlLengthLimit
    });
  }
  /**
  * Perform an UPSERT on the table or view. Depending on the column(s) passed
  * to `onConflict`, `.upsert()` allows you to perform the equivalent of
  * `.insert()` if a row with the corresponding `onConflict` columns doesn't
  * exist, or if it does exist, perform an alternative action depending on
  * `ignoreDuplicates`.
  *
  * By default, upserted rows are not returned. To return it, chain the call
  * with `.select()`.
  *
  * @param values - The values to upsert with. Pass an object to upsert a
  * single row or an array to upsert multiple rows.
  *
  * @param options - Named parameters
  *
  * @param options.onConflict - Comma-separated UNIQUE column(s) to specify how
  * duplicate rows are determined. Two rows are duplicates if all the
  * `onConflict` columns are equal.
  *
  * @param options.ignoreDuplicates - If `true`, duplicate rows are ignored. If
  * `false`, duplicate rows are merged with existing rows.
  *
  * @param options.count - Count algorithm to use to count upserted rows.
  *
  * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
  * hood.
  *
  * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
  * statistics under the hood.
  *
  * `"estimated"`: Uses exact count for low numbers and planned count for high
  * numbers.
  *
  * @param options.defaultToNull - Make missing fields default to `null`.
  * Otherwise, use the default value for the column. This only applies when
  * inserting new rows, not when merging with existing rows under
  * `ignoreDuplicates: false`. This also only applies when doing bulk upserts.
  *
  * @example Upsert a single row using a unique key
  * ```ts
  * // Upserting a single row, overwriting based on the 'username' unique column
  * const { data, error } = await supabase
  *   .from('users')
  *   .upsert({ username: 'supabot' }, { onConflict: 'username' })
  *
  * // Example response:
  * // {
  * //   data: [
  * //     { id: 4, message: 'bar', username: 'supabot' }
  * //   ],
  * //   error: null
  * // }
  * ```
  *
  * @example Upsert with conflict resolution and exact row counting
  * ```ts
  * // Upserting and returning exact count
  * const { data, error, count } = await supabase
  *   .from('users')
  *   .upsert(
  *     {
  *       id: 3,
  *       message: 'foo',
  *       username: 'supabot'
  *     },
  *     {
  *       onConflict: 'username',
  *       count: 'exact'
  *     }
  *   )
  *
  * // Example response:
  * // {
  * //   data: [
  * //     {
  * //       id: 42,
  * //       handle: "saoirse",
  * //       display_name: "Saoirse"
  * //     }
  * //   ],
  * //   count: 1,
  * //   error: null
  * // }
  * ```
  */
  upsert(values, { onConflict, ignoreDuplicates = false, count, defaultToNull = true } = {}) {
    var _this$fetch2;
    const method = "POST";
    const { url, headers } = this.cloneRequestState();
    headers.append("Prefer", `resolution=${ignoreDuplicates ? "ignore" : "merge"}-duplicates`);
    if (onConflict !== void 0) url.searchParams.set("on_conflict", onConflict);
    if (count) headers.append("Prefer", `count=${count}`);
    if (!defaultToNull) headers.append("Prefer", "missing=default");
    if (Array.isArray(values)) {
      const columns = values.reduce((acc, x) => acc.concat(Object.keys(x)), []);
      if (columns.length > 0) {
        const uniqueColumns = [
          ...new Set(columns)
        ].map((column) => `"${column}"`);
        url.searchParams.set("columns", uniqueColumns.join(","));
      }
    }
    return new PostgrestFilterBuilder({
      method,
      url,
      headers,
      schema: this.schema,
      body: values,
      fetch: (_this$fetch2 = this.fetch) !== null && _this$fetch2 !== void 0 ? _this$fetch2 : fetch,
      urlLengthLimit: this.urlLengthLimit
    });
  }
  /**
  * Perform an UPDATE on the table or view.
  *
  * By default, updated rows are not returned. To return it, chain the call
  * with `.select()` after filters.
  *
  * @param values - The values to update with
  *
  * @param options - Named parameters
  *
  * @param options.count - Count algorithm to use to count updated rows.
  *
  * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
  * hood.
  *
  * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
  * statistics under the hood.
  *
  * `"estimated"`: Uses exact count for low numbers and planned count for high
  * numbers.
  */
  update(values, { count } = {}) {
    var _this$fetch3;
    const method = "PATCH";
    const { url, headers } = this.cloneRequestState();
    if (count) headers.append("Prefer", `count=${count}`);
    return new PostgrestFilterBuilder({
      method,
      url,
      headers,
      schema: this.schema,
      body: values,
      fetch: (_this$fetch3 = this.fetch) !== null && _this$fetch3 !== void 0 ? _this$fetch3 : fetch,
      urlLengthLimit: this.urlLengthLimit
    });
  }
  /**
  * Perform a DELETE on the table or view.
  *
  * By default, deleted rows are not returned. To return it, chain the call
  * with `.select()` after filters.
  *
  * @param options - Named parameters
  *
  * @param options.count - Count algorithm to use to count deleted rows.
  *
  * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
  * hood.
  *
  * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
  * statistics under the hood.
  *
  * `"estimated"`: Uses exact count for low numbers and planned count for high
  * numbers.
  */
  delete({ count } = {}) {
    var _this$fetch4;
    const method = "DELETE";
    const { url, headers } = this.cloneRequestState();
    if (count) headers.append("Prefer", `count=${count}`);
    return new PostgrestFilterBuilder({
      method,
      url,
      headers,
      schema: this.schema,
      fetch: (_this$fetch4 = this.fetch) !== null && _this$fetch4 !== void 0 ? _this$fetch4 : fetch,
      urlLengthLimit: this.urlLengthLimit
    });
  }
};
function _typeof(o) {
  "@babel/helpers - typeof";
  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o$1) {
    return typeof o$1;
  } : function(o$1) {
    return o$1 && "function" == typeof Symbol && o$1.constructor === Symbol && o$1 !== Symbol.prototype ? "symbol" : typeof o$1;
  }, _typeof(o);
}
function toPrimitive(t, r) {
  if ("object" != _typeof(t) || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != _typeof(i)) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
function toPropertyKey(t) {
  var i = toPrimitive(t, "string");
  return "symbol" == _typeof(i) ? i : i + "";
}
function _defineProperty(e, r, t) {
  return (r = toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
    value: t,
    enumerable: true,
    configurable: true,
    writable: true
  }) : e[r] = t, e;
}
function ownKeys(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function(r$1) {
      return Object.getOwnPropertyDescriptor(e, r$1).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread2(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys(Object(t), true).forEach(function(r$1) {
      _defineProperty(e, r$1, t[r$1]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r$1) {
      Object.defineProperty(e, r$1, Object.getOwnPropertyDescriptor(t, r$1));
    });
  }
  return e;
}
var PostgrestClient = class PostgrestClient2 {
  /**
  * Creates a PostgREST client.
  *
  * @param url - URL of the PostgREST endpoint
  * @param options - Named parameters
  * @param options.headers - Custom headers
  * @param options.schema - Postgres schema to switch to
  * @param options.fetch - Custom fetch
  * @param options.timeout - Optional timeout in milliseconds for all requests. When set, requests will automatically abort after this duration to prevent indefinite hangs.
  * @param options.urlLengthLimit - Maximum URL length in characters before warnings/errors are triggered. Defaults to 8000.
  * @example
  * ```ts
  * import PostgrestClient from '@supabase/postgrest-js'
  *
  * const postgrest = new PostgrestClient('https://xyzcompany.supabase.co/rest/v1', {
  *   headers: { apikey: 'public-anon-key' },
  *   schema: 'public',
  *   timeout: 30000, // 30 second timeout
  * })
  * ```
  */
  constructor(url, { headers = {}, schema, fetch: fetch$1, timeout, urlLengthLimit = 8e3 } = {}) {
    this.url = url;
    this.headers = new Headers(headers);
    this.schemaName = schema;
    this.urlLengthLimit = urlLengthLimit;
    const originalFetch = fetch$1 !== null && fetch$1 !== void 0 ? fetch$1 : globalThis.fetch;
    if (timeout !== void 0 && timeout > 0) this.fetch = (input, init2) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      const existingSignal = init2 === null || init2 === void 0 ? void 0 : init2.signal;
      if (existingSignal) {
        if (existingSignal.aborted) {
          clearTimeout(timeoutId);
          return originalFetch(input, init2);
        }
        const abortHandler = () => {
          clearTimeout(timeoutId);
          controller.abort();
        };
        existingSignal.addEventListener("abort", abortHandler, {
          once: true
        });
        return originalFetch(input, _objectSpread2(_objectSpread2({}, init2), {}, {
          signal: controller.signal
        })).finally(() => {
          clearTimeout(timeoutId);
          existingSignal.removeEventListener("abort", abortHandler);
        });
      }
      return originalFetch(input, _objectSpread2(_objectSpread2({}, init2), {}, {
        signal: controller.signal
      })).finally(() => clearTimeout(timeoutId));
    };
    else this.fetch = originalFetch;
  }
  /**
  * Perform a query on a table or a view.
  *
  * @param relation - The table or view name to query
  */
  from(relation) {
    if (!relation || typeof relation !== "string" || relation.trim() === "") throw new Error("Invalid relation name: relation must be a non-empty string.");
    return new PostgrestQueryBuilder(new URL(`${this.url}/${relation}`), {
      headers: new Headers(this.headers),
      schema: this.schemaName,
      fetch: this.fetch,
      urlLengthLimit: this.urlLengthLimit
    });
  }
  /**
  * Select a schema to query or perform an function (rpc) call.
  *
  * The schema needs to be on the list of exposed schemas inside Supabase.
  *
  * @param schema - The schema to query
  */
  schema(schema) {
    return new PostgrestClient2(this.url, {
      headers: this.headers,
      schema,
      fetch: this.fetch,
      urlLengthLimit: this.urlLengthLimit
    });
  }
  /**
  * Perform a function call.
  *
  * @param fn - The function name to call
  * @param args - The arguments to pass to the function call
  * @param options - Named parameters
  * @param options.head - When set to `true`, `data` will not be returned.
  * Useful if you only need the count.
  * @param options.get - When set to `true`, the function will be called with
  * read-only access mode.
  * @param options.count - Count algorithm to use to count rows returned by the
  * function. Only applicable for [set-returning
  * functions](https://www.postgresql.org/docs/current/functions-srf.html).
  *
  * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
  * hood.
  *
  * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
  * statistics under the hood.
  *
  * `"estimated"`: Uses exact count for low numbers and planned count for high
  * numbers.
  *
  * @example
  * ```ts
  * // For cross-schema functions where type inference fails, use overrideTypes:
  * const { data } = await supabase
  *   .schema('schema_b')
  *   .rpc('function_a', {})
  *   .overrideTypes<{ id: string; user_id: string }[]>()
  * ```
  */
  rpc(fn, args = {}, { head: head2 = false, get: get2 = false, count } = {}) {
    var _this$fetch;
    let method;
    const url = new URL(`${this.url}/rpc/${fn}`);
    let body;
    const _isObject = (v) => v !== null && typeof v === "object" && (!Array.isArray(v) || v.some(_isObject));
    const _hasObjectArg = head2 && Object.values(args).some(_isObject);
    if (_hasObjectArg) {
      method = "POST";
      body = args;
    } else if (head2 || get2) {
      method = head2 ? "HEAD" : "GET";
      Object.entries(args).filter(([_, value]) => value !== void 0).map(([name, value]) => [
        name,
        Array.isArray(value) ? `{${value.join(",")}}` : `${value}`
      ]).forEach(([name, value]) => {
        url.searchParams.append(name, value);
      });
    } else {
      method = "POST";
      body = args;
    }
    const headers = new Headers(this.headers);
    if (_hasObjectArg) headers.set("Prefer", count ? `count=${count},return=minimal` : "return=minimal");
    else if (count) headers.set("Prefer", `count=${count}`);
    return new PostgrestFilterBuilder({
      method,
      url,
      headers,
      schema: this.schemaName,
      body,
      fetch: (_this$fetch = this.fetch) !== null && _this$fetch !== void 0 ? _this$fetch : fetch,
      urlLengthLimit: this.urlLengthLimit
    });
  }
};

// C:/Users/Jmarcum/AppData/Local/deno/npm/registry.npmjs.org/@supabase/realtime-js/2.98.0/dist/module/lib/websocket-factory.js
var WebSocketFactory = class {
  /**
     * Static-only utility – prevent instantiation.
     */
  constructor() {
  }
  static detectEnvironment() {
    var _a;
    if (typeof WebSocket !== "undefined") {
      return {
        type: "native",
        constructor: WebSocket
      };
    }
    if (typeof globalThis !== "undefined" && typeof globalThis.WebSocket !== "undefined") {
      return {
        type: "native",
        constructor: globalThis.WebSocket
      };
    }
    if (typeof global !== "undefined" && typeof global.WebSocket !== "undefined") {
      return {
        type: "native",
        constructor: global.WebSocket
      };
    }
    if (typeof globalThis !== "undefined" && typeof globalThis.WebSocketPair !== "undefined" && typeof globalThis.WebSocket === "undefined") {
      return {
        type: "cloudflare",
        error: "Cloudflare Workers detected. WebSocket clients are not supported in Cloudflare Workers.",
        workaround: "Use Cloudflare Workers WebSocket API for server-side WebSocket handling, or deploy to a different runtime."
      };
    }
    if (typeof globalThis !== "undefined" && globalThis.EdgeRuntime || typeof navigator !== "undefined" && ((_a = navigator.userAgent) === null || _a === void 0 ? void 0 : _a.includes("Vercel-Edge"))) {
      return {
        type: "unsupported",
        error: "Edge runtime detected (Vercel Edge/Netlify Edge). WebSockets are not supported in edge functions.",
        workaround: "Use serverless functions or a different deployment target for WebSocket functionality."
      };
    }
    const _process = globalThis["process"];
    if (_process) {
      const processVersions = _process["versions"];
      if (processVersions && processVersions["node"]) {
        const versionString = processVersions["node"];
        const nodeVersion = parseInt(versionString.replace(/^v/, "").split(".")[0]);
        if (nodeVersion >= 22) {
          if (typeof globalThis.WebSocket !== "undefined") {
            return {
              type: "native",
              constructor: globalThis.WebSocket
            };
          }
          return {
            type: "unsupported",
            error: `Node.js ${nodeVersion} detected but native WebSocket not found.`,
            workaround: "Provide a WebSocket implementation via the transport option."
          };
        }
        return {
          type: "unsupported",
          error: `Node.js ${nodeVersion} detected without native WebSocket support.`,
          workaround: 'For Node.js < 22, install "ws" package and provide it via the transport option:\nimport ws from "ws"\nnew RealtimeClient(url, { transport: ws })'
        };
      }
    }
    return {
      type: "unsupported",
      error: "Unknown JavaScript runtime without WebSocket support.",
      workaround: "Ensure you're running in a supported environment (browser, Node.js, Deno) or provide a custom WebSocket implementation."
    };
  }
  /**
     * Returns the best available WebSocket constructor for the current runtime.
     *
     * @example
     * ```ts
     * const WS = WebSocketFactory.getWebSocketConstructor()
     * const socket = new WS('wss://realtime.supabase.co/socket')
     * ```
     */
  static getWebSocketConstructor() {
    const env = this.detectEnvironment();
    if (env.constructor) {
      return env.constructor;
    }
    let errorMessage = env.error || "WebSocket not supported in this environment.";
    if (env.workaround) {
      errorMessage += `

Suggested solution: ${env.workaround}`;
    }
    throw new Error(errorMessage);
  }
  /**
     * Creates a WebSocket using the detected constructor.
     *
     * @example
     * ```ts
     * const socket = WebSocketFactory.createWebSocket('wss://realtime.supabase.co/socket')
     * ```
     */
  static createWebSocket(url, protocols) {
    const WS = this.getWebSocketConstructor();
    return new WS(url, protocols);
  }
  /**
     * Detects whether the runtime can establish WebSocket connections.
     *
     * @example
     * ```ts
     * if (!WebSocketFactory.isWebSocketSupported()) {
     *   console.warn('Falling back to long polling')
     * }
     * ```
     */
  static isWebSocketSupported() {
    try {
      const env = this.detectEnvironment();
      return env.type === "native" || env.type === "ws";
    } catch (_a) {
      return false;
    }
  }
};
var websocket_factory_default = WebSocketFactory;

// C:/Users/Jmarcum/AppData/Local/deno/npm/registry.npmjs.org/@supabase/realtime-js/2.98.0/dist/module/lib/version.js
var version = "2.98.0";

// C:/Users/Jmarcum/AppData/Local/deno/npm/registry.npmjs.org/@supabase/realtime-js/2.98.0/dist/module/lib/constants.js
var DEFAULT_VERSION = `realtime-js/${version}`;
var VSN_1_0_0 = "1.0.0";
var VSN_2_0_0 = "2.0.0";
var DEFAULT_VSN = VSN_2_0_0;
var DEFAULT_TIMEOUT = 1e4;
var WS_CLOSE_NORMAL = 1e3;
var MAX_PUSH_BUFFER_SIZE = 100;
var SOCKET_STATES;
(function(SOCKET_STATES2) {
  SOCKET_STATES2[SOCKET_STATES2["connecting"] = 0] = "connecting";
  SOCKET_STATES2[SOCKET_STATES2["open"] = 1] = "open";
  SOCKET_STATES2[SOCKET_STATES2["closing"] = 2] = "closing";
  SOCKET_STATES2[SOCKET_STATES2["closed"] = 3] = "closed";
})(SOCKET_STATES || (SOCKET_STATES = {}));
var CHANNEL_STATES;
(function(CHANNEL_STATES2) {
  CHANNEL_STATES2["closed"] = "closed";
  CHANNEL_STATES2["errored"] = "errored";
  CHANNEL_STATES2["joined"] = "joined";
  CHANNEL_STATES2["joining"] = "joining";
  CHANNEL_STATES2["leaving"] = "leaving";
})(CHANNEL_STATES || (CHANNEL_STATES = {}));
var CHANNEL_EVENTS;
(function(CHANNEL_EVENTS2) {
  CHANNEL_EVENTS2["close"] = "phx_close";
  CHANNEL_EVENTS2["error"] = "phx_error";
  CHANNEL_EVENTS2["join"] = "phx_join";
  CHANNEL_EVENTS2["reply"] = "phx_reply";
  CHANNEL_EVENTS2["leave"] = "phx_leave";
  CHANNEL_EVENTS2["access_token"] = "access_token";
})(CHANNEL_EVENTS || (CHANNEL_EVENTS = {}));
var TRANSPORTS;
(function(TRANSPORTS2) {
  TRANSPORTS2["websocket"] = "websocket";
})(TRANSPORTS || (TRANSPORTS = {}));
var CONNECTION_STATE;
(function(CONNECTION_STATE2) {
  CONNECTION_STATE2["Connecting"] = "connecting";
  CONNECTION_STATE2["Open"] = "open";
  CONNECTION_STATE2["Closing"] = "closing";
  CONNECTION_STATE2["Closed"] = "closed";
})(CONNECTION_STATE || (CONNECTION_STATE = {}));

// C:/Users/Jmarcum/AppData/Local/deno/npm/registry.npmjs.org/@supabase/realtime-js/2.98.0/dist/module/lib/serializer.js
var Serializer = class {
  constructor(allowedMetadataKeys) {
    this.HEADER_LENGTH = 1;
    this.USER_BROADCAST_PUSH_META_LENGTH = 6;
    this.KINDS = {
      userBroadcastPush: 3,
      userBroadcast: 4
    };
    this.BINARY_ENCODING = 0;
    this.JSON_ENCODING = 1;
    this.BROADCAST_EVENT = "broadcast";
    this.allowedMetadataKeys = [];
    this.allowedMetadataKeys = allowedMetadataKeys !== null && allowedMetadataKeys !== void 0 ? allowedMetadataKeys : [];
  }
  encode(msg, callback) {
    if (msg.event === this.BROADCAST_EVENT && !(msg.payload instanceof ArrayBuffer) && typeof msg.payload.event === "string") {
      return callback(this._binaryEncodeUserBroadcastPush(msg));
    }
    let payload = [
      msg.join_ref,
      msg.ref,
      msg.topic,
      msg.event,
      msg.payload
    ];
    return callback(JSON.stringify(payload));
  }
  _binaryEncodeUserBroadcastPush(message) {
    var _a;
    if (this._isArrayBuffer((_a = message.payload) === null || _a === void 0 ? void 0 : _a.payload)) {
      return this._encodeBinaryUserBroadcastPush(message);
    } else {
      return this._encodeJsonUserBroadcastPush(message);
    }
  }
  _encodeBinaryUserBroadcastPush(message) {
    var _a, _b;
    const userPayload = (_b = (_a = message.payload) === null || _a === void 0 ? void 0 : _a.payload) !== null && _b !== void 0 ? _b : new ArrayBuffer(0);
    return this._encodeUserBroadcastPush(message, this.BINARY_ENCODING, userPayload);
  }
  _encodeJsonUserBroadcastPush(message) {
    var _a, _b;
    const userPayload = (_b = (_a = message.payload) === null || _a === void 0 ? void 0 : _a.payload) !== null && _b !== void 0 ? _b : {};
    const encoder = new TextEncoder();
    const encodedUserPayload = encoder.encode(JSON.stringify(userPayload)).buffer;
    return this._encodeUserBroadcastPush(message, this.JSON_ENCODING, encodedUserPayload);
  }
  _encodeUserBroadcastPush(message, encodingType, encodedPayload) {
    var _a, _b;
    const topic = message.topic;
    const ref = (_a = message.ref) !== null && _a !== void 0 ? _a : "";
    const joinRef = (_b = message.join_ref) !== null && _b !== void 0 ? _b : "";
    const userEvent = message.payload.event;
    const rest = this.allowedMetadataKeys ? this._pick(message.payload, this.allowedMetadataKeys) : {};
    const metadata = Object.keys(rest).length === 0 ? "" : JSON.stringify(rest);
    if (joinRef.length > 255) {
      throw new Error(`joinRef length ${joinRef.length} exceeds maximum of 255`);
    }
    if (ref.length > 255) {
      throw new Error(`ref length ${ref.length} exceeds maximum of 255`);
    }
    if (topic.length > 255) {
      throw new Error(`topic length ${topic.length} exceeds maximum of 255`);
    }
    if (userEvent.length > 255) {
      throw new Error(`userEvent length ${userEvent.length} exceeds maximum of 255`);
    }
    if (metadata.length > 255) {
      throw new Error(`metadata length ${metadata.length} exceeds maximum of 255`);
    }
    const metaLength = this.USER_BROADCAST_PUSH_META_LENGTH + joinRef.length + ref.length + topic.length + userEvent.length + metadata.length;
    const header = new ArrayBuffer(this.HEADER_LENGTH + metaLength);
    let view = new DataView(header);
    let offset = 0;
    view.setUint8(offset++, this.KINDS.userBroadcastPush);
    view.setUint8(offset++, joinRef.length);
    view.setUint8(offset++, ref.length);
    view.setUint8(offset++, topic.length);
    view.setUint8(offset++, userEvent.length);
    view.setUint8(offset++, metadata.length);
    view.setUint8(offset++, encodingType);
    Array.from(joinRef, (char) => view.setUint8(offset++, char.charCodeAt(0)));
    Array.from(ref, (char) => view.setUint8(offset++, char.charCodeAt(0)));
    Array.from(topic, (char) => view.setUint8(offset++, char.charCodeAt(0)));
    Array.from(userEvent, (char) => view.setUint8(offset++, char.charCodeAt(0)));
    Array.from(metadata, (char) => view.setUint8(offset++, char.charCodeAt(0)));
    var combined = new Uint8Array(header.byteLength + encodedPayload.byteLength);
    combined.set(new Uint8Array(header), 0);
    combined.set(new Uint8Array(encodedPayload), header.byteLength);
    return combined.buffer;
  }
  decode(rawPayload, callback) {
    if (this._isArrayBuffer(rawPayload)) {
      let result = this._binaryDecode(rawPayload);
      return callback(result);
    }
    if (typeof rawPayload === "string") {
      const jsonPayload = JSON.parse(rawPayload);
      const [join_ref, ref, topic, event, payload] = jsonPayload;
      return callback({
        join_ref,
        ref,
        topic,
        event,
        payload
      });
    }
    return callback({});
  }
  _binaryDecode(buffer) {
    const view = new DataView(buffer);
    const kind = view.getUint8(0);
    const decoder = new TextDecoder();
    switch (kind) {
      case this.KINDS.userBroadcast:
        return this._decodeUserBroadcast(buffer, view, decoder);
    }
  }
  _decodeUserBroadcast(buffer, view, decoder) {
    const topicSize = view.getUint8(1);
    const userEventSize = view.getUint8(2);
    const metadataSize = view.getUint8(3);
    const payloadEncoding = view.getUint8(4);
    let offset = this.HEADER_LENGTH + 4;
    const topic = decoder.decode(buffer.slice(offset, offset + topicSize));
    offset = offset + topicSize;
    const userEvent = decoder.decode(buffer.slice(offset, offset + userEventSize));
    offset = offset + userEventSize;
    const metadata = decoder.decode(buffer.slice(offset, offset + metadataSize));
    offset = offset + metadataSize;
    const payload = buffer.slice(offset, buffer.byteLength);
    const parsedPayload = payloadEncoding === this.JSON_ENCODING ? JSON.parse(decoder.decode(payload)) : payload;
    const data = {
      type: this.BROADCAST_EVENT,
      event: userEvent,
      payload: parsedPayload
    };
    if (metadataSize > 0) {
      data["meta"] = JSON.parse(metadata);
    }
    return {
      join_ref: null,
      ref: null,
      topic,
      event: this.BROADCAST_EVENT,
      payload: data
    };
  }
  _isArrayBuffer(buffer) {
    var _a;
    return buffer instanceof ArrayBuffer || ((_a = buffer === null || buffer === void 0 ? void 0 : buffer.constructor) === null || _a === void 0 ? void 0 : _a.name) === "ArrayBuffer";
  }
  _pick(obj, keys) {
    if (!obj || typeof obj !== "object") {
      return {};
    }
    return Object.fromEntries(Object.entries(obj).filter(([key]) => keys.includes(key)));
  }
};

// C:/Users/Jmarcum/AppData/Local/deno/npm/registry.npmjs.org/@supabase/realtime-js/2.98.0/dist/module/lib/timer.js
var Timer = class {
  constructor(callback, timerCalc) {
    this.callback = callback;
    this.timerCalc = timerCalc;
    this.timer = void 0;
    this.tries = 0;
    this.callback = callback;
    this.timerCalc = timerCalc;
  }
  reset() {
    this.tries = 0;
    clearTimeout(this.timer);
    this.timer = void 0;
  }
  // Cancels any previous scheduleTimeout and schedules callback
  scheduleTimeout() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.tries = this.tries + 1;
      this.callback();
    }, this.timerCalc(this.tries + 1));
  }
};

// C:/Users/Jmarcum/AppData/Local/deno/npm/registry.npmjs.org/@supabase/realtime-js/2.98.0/dist/module/lib/transformers.js
var PostgresTypes;
(function(PostgresTypes2) {
  PostgresTypes2["abstime"] = "abstime";
  PostgresTypes2["bool"] = "bool";
  PostgresTypes2["date"] = "date";
  PostgresTypes2["daterange"] = "daterange";
  PostgresTypes2["float4"] = "float4";
  PostgresTypes2["float8"] = "float8";
  PostgresTypes2["int2"] = "int2";
  PostgresTypes2["int4"] = "int4";
  PostgresTypes2["int4range"] = "int4range";
  PostgresTypes2["int8"] = "int8";
  PostgresTypes2["int8range"] = "int8range";
  PostgresTypes2["json"] = "json";
  PostgresTypes2["jsonb"] = "jsonb";
  PostgresTypes2["money"] = "money";
  PostgresTypes2["numeric"] = "numeric";
  PostgresTypes2["oid"] = "oid";
  PostgresTypes2["reltime"] = "reltime";
  PostgresTypes2["text"] = "text";
  PostgresTypes2["time"] = "time";
  PostgresTypes2["timestamp"] = "timestamp";
  PostgresTypes2["timestamptz"] = "timestamptz";
  PostgresTypes2["timetz"] = "timetz";
  PostgresTypes2["tsrange"] = "tsrange";
  PostgresTypes2["tstzrange"] = "tstzrange";
})(PostgresTypes || (PostgresTypes = {}));
var convertChangeData = (columns, record, options = {}) => {
  var _a;
  const skipTypes = (_a = options.skipTypes) !== null && _a !== void 0 ? _a : [];
  if (!record) {
    return {};
  }
  return Object.keys(record).reduce((acc, rec_key) => {
    acc[rec_key] = convertColumn(rec_key, columns, record, skipTypes);
    return acc;
  }, {});
};
var convertColumn = (columnName, columns, record, skipTypes) => {
  const column = columns.find((x) => x.name === columnName);
  const colType = column === null || column === void 0 ? void 0 : column.type;
  const value = record[columnName];
  if (colType && !skipTypes.includes(colType)) {
    return convertCell(colType, value);
  }
  return noop(value);
};
var convertCell = (type, value) => {
  if (type.charAt(0) === "_") {
    const dataType = type.slice(1, type.length);
    return toArray(value, dataType);
  }
  switch (type) {
    case PostgresTypes.bool:
      return toBoolean(value);
    case PostgresTypes.float4:
    case PostgresTypes.float8:
    case PostgresTypes.int2:
    case PostgresTypes.int4:
    case PostgresTypes.int8:
    case PostgresTypes.numeric:
    case PostgresTypes.oid:
      return toNumber(value);
    case PostgresTypes.json:
    case PostgresTypes.jsonb:
      return toJson(value);
    case PostgresTypes.timestamp:
      return toTimestampString(value);
    // Format to be consistent with PostgREST
    case PostgresTypes.abstime:
    case PostgresTypes.date:
    case PostgresTypes.daterange:
    case PostgresTypes.int4range:
    case PostgresTypes.int8range:
    case PostgresTypes.money:
    case PostgresTypes.reltime:
    case PostgresTypes.text:
    case PostgresTypes.time:
    case PostgresTypes.timestamptz:
    case PostgresTypes.timetz:
    case PostgresTypes.tsrange:
    case PostgresTypes.tstzrange:
      return noop(value);
    default:
      return noop(value);
  }
};
var noop = (value) => {
  return value;
};
var toBoolean = (value) => {
  switch (value) {
    case "t":
      return true;
    case "f":
      return false;
    default:
      return value;
  }
};
var toNumber = (value) => {
  if (typeof value === "string") {
    const parsedValue = parseFloat(value);
    if (!Number.isNaN(parsedValue)) {
      return parsedValue;
    }
  }
  return value;
};
var toJson = (value) => {
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch (_a) {
      return value;
    }
  }
  return value;
};
var toArray = (value, type) => {
  if (typeof value !== "string") {
    return value;
  }
  const lastIdx = value.length - 1;
  const closeBrace = value[lastIdx];
  const openBrace = value[0];
  if (openBrace === "{" && closeBrace === "}") {
    let arr;
    const valTrim = value.slice(1, lastIdx);
    try {
      arr = JSON.parse("[" + valTrim + "]");
    } catch (_) {
      arr = valTrim ? valTrim.split(",") : [];
    }
    return arr.map((val) => convertCell(type, val));
  }
  return value;
};
var toTimestampString = (value) => {
  if (typeof value === "string") {
    return value.replace(" ", "T");
  }
  return value;
};
var httpEndpointURL = (socketUrl) => {
  const wsUrl = new URL(socketUrl);
  wsUrl.protocol = wsUrl.protocol.replace(/^ws/i, "http");
  wsUrl.pathname = wsUrl.pathname.replace(/\/+$/, "").replace(/\/socket\/websocket$/i, "").replace(/\/socket$/i, "").replace(/\/websocket$/i, "");
  if (wsUrl.pathname === "" || wsUrl.pathname === "/") {
    wsUrl.pathname = "/api/broadcast";
  } else {
    wsUrl.pathname = wsUrl.pathname + "/api/broadcast";
  }
  return wsUrl.href;
};

// C:/Users/Jmarcum/AppData/Local/deno/npm/registry.npmjs.org/@supabase/realtime-js/2.98.0/dist/module/lib/push.js
var Push = class {
  /**
     * Initializes the Push
     *
     * @param channel The Channel
     * @param event The event, for example `"phx_join"`
     * @param payload The payload, for example `{user_id: 123}`
     * @param timeout The push timeout in milliseconds
     */
  constructor(channel, event, payload = {}, timeout = DEFAULT_TIMEOUT) {
    this.channel = channel;
    this.event = event;
    this.payload = payload;
    this.timeout = timeout;
    this.sent = false;
    this.timeoutTimer = void 0;
    this.ref = "";
    this.receivedResp = null;
    this.recHooks = [];
    this.refEvent = null;
  }
  resend(timeout) {
    this.timeout = timeout;
    this._cancelRefEvent();
    this.ref = "";
    this.refEvent = null;
    this.receivedResp = null;
    this.sent = false;
    this.send();
  }
  send() {
    if (this._hasReceived("timeout")) {
      return;
    }
    this.startTimeout();
    this.sent = true;
    this.channel.socket.push({
      topic: this.channel.topic,
      event: this.event,
      payload: this.payload,
      ref: this.ref,
      join_ref: this.channel._joinRef()
    });
  }
  updatePayload(payload) {
    this.payload = Object.assign(Object.assign({}, this.payload), payload);
  }
  receive(status, callback) {
    var _a;
    if (this._hasReceived(status)) {
      callback((_a = this.receivedResp) === null || _a === void 0 ? void 0 : _a.response);
    }
    this.recHooks.push({
      status,
      callback
    });
    return this;
  }
  startTimeout() {
    if (this.timeoutTimer) {
      return;
    }
    this.ref = this.channel.socket._makeRef();
    this.refEvent = this.channel._replyEventName(this.ref);
    const callback = (payload) => {
      this._cancelRefEvent();
      this._cancelTimeout();
      this.receivedResp = payload;
      this._matchReceive(payload);
    };
    this.channel._on(this.refEvent, {}, callback);
    this.timeoutTimer = setTimeout(() => {
      this.trigger("timeout", {});
    }, this.timeout);
  }
  trigger(status, response) {
    if (this.refEvent) this.channel._trigger(this.refEvent, {
      status,
      response
    });
  }
  destroy() {
    this._cancelRefEvent();
    this._cancelTimeout();
  }
  _cancelRefEvent() {
    if (!this.refEvent) {
      return;
    }
    this.channel._off(this.refEvent, {});
  }
  _cancelTimeout() {
    clearTimeout(this.timeoutTimer);
    this.timeoutTimer = void 0;
  }
  _matchReceive({ status, response }) {
    this.recHooks.filter((h) => h.status === status).forEach((h) => h.callback(response));
  }
  _hasReceived(status) {
    return this.receivedResp && this.receivedResp.status === status;
  }
};

// C:/Users/Jmarcum/AppData/Local/deno/npm/registry.npmjs.org/@supabase/realtime-js/2.98.0/dist/module/RealtimePresence.js
var REALTIME_PRESENCE_LISTEN_EVENTS;
(function(REALTIME_PRESENCE_LISTEN_EVENTS2) {
  REALTIME_PRESENCE_LISTEN_EVENTS2["SYNC"] = "sync";
  REALTIME_PRESENCE_LISTEN_EVENTS2["JOIN"] = "join";
  REALTIME_PRESENCE_LISTEN_EVENTS2["LEAVE"] = "leave";
})(REALTIME_PRESENCE_LISTEN_EVENTS || (REALTIME_PRESENCE_LISTEN_EVENTS = {}));
var RealtimePresence = class _RealtimePresence {
  /**
     * Creates a Presence helper that keeps the local presence state in sync with the server.
     *
     * @param channel - The realtime channel to bind to.
     * @param opts - Optional custom event names, e.g. `{ events: { state: 'state', diff: 'diff' } }`.
     *
     * @example
     * ```ts
     * const presence = new RealtimePresence(channel)
     *
     * channel.on('presence', ({ event, key }) => {
     *   console.log(`Presence ${event} on ${key}`)
     * })
     * ```
     */
  constructor(channel, opts) {
    this.channel = channel;
    this.state = {};
    this.pendingDiffs = [];
    this.joinRef = null;
    this.enabled = false;
    this.caller = {
      onJoin: () => {
      },
      onLeave: () => {
      },
      onSync: () => {
      }
    };
    const events = (opts === null || opts === void 0 ? void 0 : opts.events) || {
      state: "presence_state",
      diff: "presence_diff"
    };
    this.channel._on(events.state, {}, (newState) => {
      const { onJoin, onLeave, onSync } = this.caller;
      this.joinRef = this.channel._joinRef();
      this.state = _RealtimePresence.syncState(this.state, newState, onJoin, onLeave);
      this.pendingDiffs.forEach((diff) => {
        this.state = _RealtimePresence.syncDiff(this.state, diff, onJoin, onLeave);
      });
      this.pendingDiffs = [];
      onSync();
    });
    this.channel._on(events.diff, {}, (diff) => {
      const { onJoin, onLeave, onSync } = this.caller;
      if (this.inPendingSyncState()) {
        this.pendingDiffs.push(diff);
      } else {
        this.state = _RealtimePresence.syncDiff(this.state, diff, onJoin, onLeave);
        onSync();
      }
    });
    this.onJoin((key, currentPresences, newPresences) => {
      this.channel._trigger("presence", {
        event: "join",
        key,
        currentPresences,
        newPresences
      });
    });
    this.onLeave((key, currentPresences, leftPresences) => {
      this.channel._trigger("presence", {
        event: "leave",
        key,
        currentPresences,
        leftPresences
      });
    });
    this.onSync(() => {
      this.channel._trigger("presence", {
        event: "sync"
      });
    });
  }
  /**
     * Used to sync the list of presences on the server with the
     * client's state.
     *
     * An optional `onJoin` and `onLeave` callback can be provided to
     * react to changes in the client's local presences across
     * disconnects and reconnects with the server.
     *
     * @internal
     */
  static syncState(currentState, newState, onJoin, onLeave) {
    const state2 = this.cloneDeep(currentState);
    const transformedState = this.transformState(newState);
    const joins = {};
    const leaves = {};
    this.map(state2, (key, presences) => {
      if (!transformedState[key]) {
        leaves[key] = presences;
      }
    });
    this.map(transformedState, (key, newPresences) => {
      const currentPresences = state2[key];
      if (currentPresences) {
        const newPresenceRefs = newPresences.map((m) => m.presence_ref);
        const curPresenceRefs = currentPresences.map((m) => m.presence_ref);
        const joinedPresences = newPresences.filter((m) => curPresenceRefs.indexOf(m.presence_ref) < 0);
        const leftPresences = currentPresences.filter((m) => newPresenceRefs.indexOf(m.presence_ref) < 0);
        if (joinedPresences.length > 0) {
          joins[key] = joinedPresences;
        }
        if (leftPresences.length > 0) {
          leaves[key] = leftPresences;
        }
      } else {
        joins[key] = newPresences;
      }
    });
    return this.syncDiff(state2, {
      joins,
      leaves
    }, onJoin, onLeave);
  }
  /**
     * Used to sync a diff of presence join and leave events from the
     * server, as they happen.
     *
     * Like `syncState`, `syncDiff` accepts optional `onJoin` and
     * `onLeave` callbacks to react to a user joining or leaving from a
     * device.
     *
     * @internal
     */
  static syncDiff(state2, diff, onJoin, onLeave) {
    const { joins, leaves } = {
      joins: this.transformState(diff.joins),
      leaves: this.transformState(diff.leaves)
    };
    if (!onJoin) {
      onJoin = () => {
      };
    }
    if (!onLeave) {
      onLeave = () => {
      };
    }
    this.map(joins, (key, newPresences) => {
      var _a;
      const currentPresences = (_a = state2[key]) !== null && _a !== void 0 ? _a : [];
      state2[key] = this.cloneDeep(newPresences);
      if (currentPresences.length > 0) {
        const joinedPresenceRefs = state2[key].map((m) => m.presence_ref);
        const curPresences = currentPresences.filter((m) => joinedPresenceRefs.indexOf(m.presence_ref) < 0);
        state2[key].unshift(...curPresences);
      }
      onJoin(key, currentPresences, newPresences);
    });
    this.map(leaves, (key, leftPresences) => {
      let currentPresences = state2[key];
      if (!currentPresences) return;
      const presenceRefsToRemove = leftPresences.map((m) => m.presence_ref);
      currentPresences = currentPresences.filter((m) => presenceRefsToRemove.indexOf(m.presence_ref) < 0);
      state2[key] = currentPresences;
      onLeave(key, currentPresences, leftPresences);
      if (currentPresences.length === 0) delete state2[key];
    });
    return state2;
  }
  /** @internal */
  static map(obj, func) {
    return Object.getOwnPropertyNames(obj).map((key) => func(key, obj[key]));
  }
  /**
     * Remove 'metas' key
     * Change 'phx_ref' to 'presence_ref'
     * Remove 'phx_ref' and 'phx_ref_prev'
     *
     * @example
     * // returns {
     *  abc123: [
     *    { presence_ref: '2', user_id: 1 },
     *    { presence_ref: '3', user_id: 2 }
     *  ]
     * }
     * RealtimePresence.transformState({
     *  abc123: {
     *    metas: [
     *      { phx_ref: '2', phx_ref_prev: '1' user_id: 1 },
     *      { phx_ref: '3', user_id: 2 }
     *    ]
     *  }
     * })
     *
     * @internal
     */
  static transformState(state2) {
    state2 = this.cloneDeep(state2);
    return Object.getOwnPropertyNames(state2).reduce((newState, key) => {
      const presences = state2[key];
      if ("metas" in presences) {
        newState[key] = presences.metas.map((presence) => {
          presence["presence_ref"] = presence["phx_ref"];
          delete presence["phx_ref"];
          delete presence["phx_ref_prev"];
          return presence;
        });
      } else {
        newState[key] = presences;
      }
      return newState;
    }, {});
  }
  /** @internal */
  static cloneDeep(obj) {
    return JSON.parse(JSON.stringify(obj));
  }
  /** @internal */
  onJoin(callback) {
    this.caller.onJoin = callback;
  }
  /** @internal */
  onLeave(callback) {
    this.caller.onLeave = callback;
  }
  /** @internal */
  onSync(callback) {
    this.caller.onSync = callback;
  }
  /** @internal */
  inPendingSyncState() {
    return !this.joinRef || this.joinRef !== this.channel._joinRef();
  }
};

// C:/Users/Jmarcum/AppData/Local/deno/npm/registry.npmjs.org/@supabase/realtime-js/2.98.0/dist/module/RealtimeChannel.js
var REALTIME_POSTGRES_CHANGES_LISTEN_EVENT;
(function(REALTIME_POSTGRES_CHANGES_LISTEN_EVENT2) {
  REALTIME_POSTGRES_CHANGES_LISTEN_EVENT2["ALL"] = "*";
  REALTIME_POSTGRES_CHANGES_LISTEN_EVENT2["INSERT"] = "INSERT";
  REALTIME_POSTGRES_CHANGES_LISTEN_EVENT2["UPDATE"] = "UPDATE";
  REALTIME_POSTGRES_CHANGES_LISTEN_EVENT2["DELETE"] = "DELETE";
})(REALTIME_POSTGRES_CHANGES_LISTEN_EVENT || (REALTIME_POSTGRES_CHANGES_LISTEN_EVENT = {}));
var REALTIME_LISTEN_TYPES;
(function(REALTIME_LISTEN_TYPES2) {
  REALTIME_LISTEN_TYPES2["BROADCAST"] = "broadcast";
  REALTIME_LISTEN_TYPES2["PRESENCE"] = "presence";
  REALTIME_LISTEN_TYPES2["POSTGRES_CHANGES"] = "postgres_changes";
  REALTIME_LISTEN_TYPES2["SYSTEM"] = "system";
})(REALTIME_LISTEN_TYPES || (REALTIME_LISTEN_TYPES = {}));
var REALTIME_SUBSCRIBE_STATES;
(function(REALTIME_SUBSCRIBE_STATES2) {
  REALTIME_SUBSCRIBE_STATES2["SUBSCRIBED"] = "SUBSCRIBED";
  REALTIME_SUBSCRIBE_STATES2["TIMED_OUT"] = "TIMED_OUT";
  REALTIME_SUBSCRIBE_STATES2["CLOSED"] = "CLOSED";
  REALTIME_SUBSCRIBE_STATES2["CHANNEL_ERROR"] = "CHANNEL_ERROR";
})(REALTIME_SUBSCRIBE_STATES || (REALTIME_SUBSCRIBE_STATES = {}));
var RealtimeChannel = class _RealtimeChannel {
  /**
     * Creates a channel that can broadcast messages, sync presence, and listen to Postgres changes.
     *
     * The topic determines which realtime stream you are subscribing to. Config options let you
     * enable acknowledgement for broadcasts, presence tracking, or private channels.
     *
     * @example
     * ```ts
     * import RealtimeClient from '@supabase/realtime-js'
     *
     * const client = new RealtimeClient('https://xyzcompany.supabase.co/realtime/v1', {
     *   params: { apikey: 'public-anon-key' },
     * })
     * const channel = new RealtimeChannel('realtime:public:messages', { config: {} }, client)
     * ```
     */
  constructor(topic, params = {
    config: {}
  }, socket) {
    var _a, _b;
    this.topic = topic;
    this.params = params;
    this.socket = socket;
    this.bindings = {};
    this.state = CHANNEL_STATES.closed;
    this.joinedOnce = false;
    this.pushBuffer = [];
    this.subTopic = topic.replace(/^realtime:/i, "");
    this.params.config = Object.assign({
      broadcast: {
        ack: false,
        self: false
      },
      presence: {
        key: "",
        enabled: false
      },
      private: false
    }, params.config);
    this.timeout = this.socket.timeout;
    this.joinPush = new Push(this, CHANNEL_EVENTS.join, this.params, this.timeout);
    this.rejoinTimer = new Timer(() => this._rejoinUntilConnected(), this.socket.reconnectAfterMs);
    this.joinPush.receive("ok", () => {
      this.state = CHANNEL_STATES.joined;
      this.rejoinTimer.reset();
      this.pushBuffer.forEach((pushEvent) => pushEvent.send());
      this.pushBuffer = [];
    });
    this._onClose(() => {
      this.rejoinTimer.reset();
      this.socket.log("channel", `close ${this.topic} ${this._joinRef()}`);
      this.state = CHANNEL_STATES.closed;
      this.socket._remove(this);
    });
    this._onError((reason) => {
      if (this._isLeaving() || this._isClosed()) {
        return;
      }
      this.socket.log("channel", `error ${this.topic}`, reason);
      this.state = CHANNEL_STATES.errored;
      this.rejoinTimer.scheduleTimeout();
    });
    this.joinPush.receive("timeout", () => {
      if (!this._isJoining()) {
        return;
      }
      this.socket.log("channel", `timeout ${this.topic}`, this.joinPush.timeout);
      this.state = CHANNEL_STATES.errored;
      this.rejoinTimer.scheduleTimeout();
    });
    this.joinPush.receive("error", (reason) => {
      if (this._isLeaving() || this._isClosed()) {
        return;
      }
      this.socket.log("channel", `error ${this.topic}`, reason);
      this.state = CHANNEL_STATES.errored;
      this.rejoinTimer.scheduleTimeout();
    });
    this._on(CHANNEL_EVENTS.reply, {}, (payload, ref) => {
      this._trigger(this._replyEventName(ref), payload);
    });
    this.presence = new RealtimePresence(this);
    this.broadcastEndpointURL = httpEndpointURL(this.socket.endPoint);
    this.private = this.params.config.private || false;
    if (!this.private && ((_b = (_a = this.params.config) === null || _a === void 0 ? void 0 : _a.broadcast) === null || _b === void 0 ? void 0 : _b.replay)) {
      throw `tried to use replay on public channel '${this.topic}'. It must be a private channel.`;
    }
  }
  /** Subscribe registers your client with the server */
  subscribe(callback, timeout = this.timeout) {
    var _a, _b, _c;
    if (!this.socket.isConnected()) {
      this.socket.connect();
    }
    if (this.state == CHANNEL_STATES.closed) {
      const { config: { broadcast, presence, private: isPrivate } } = this.params;
      const postgres_changes = (_b = (_a = this.bindings.postgres_changes) === null || _a === void 0 ? void 0 : _a.map((r) => r.filter)) !== null && _b !== void 0 ? _b : [];
      const presence_enabled = !!this.bindings[REALTIME_LISTEN_TYPES.PRESENCE] && this.bindings[REALTIME_LISTEN_TYPES.PRESENCE].length > 0 || ((_c = this.params.config.presence) === null || _c === void 0 ? void 0 : _c.enabled) === true;
      const accessTokenPayload = {};
      const config = {
        broadcast,
        presence: Object.assign(Object.assign({}, presence), {
          enabled: presence_enabled
        }),
        postgres_changes,
        private: isPrivate
      };
      if (this.socket.accessTokenValue) {
        accessTokenPayload.access_token = this.socket.accessTokenValue;
      }
      this._onError((e) => callback === null || callback === void 0 ? void 0 : callback(REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR, e));
      this._onClose(() => callback === null || callback === void 0 ? void 0 : callback(REALTIME_SUBSCRIBE_STATES.CLOSED));
      this.updateJoinPayload(Object.assign({
        config
      }, accessTokenPayload));
      this.joinedOnce = true;
      this._rejoin(timeout);
      this.joinPush.receive("ok", async ({ postgres_changes: postgres_changes2 }) => {
        var _a2;
        if (!this.socket._isManualToken()) {
          this.socket.setAuth();
        }
        if (postgres_changes2 === void 0) {
          callback === null || callback === void 0 ? void 0 : callback(REALTIME_SUBSCRIBE_STATES.SUBSCRIBED);
          return;
        } else {
          const clientPostgresBindings = this.bindings.postgres_changes;
          const bindingsLen = (_a2 = clientPostgresBindings === null || clientPostgresBindings === void 0 ? void 0 : clientPostgresBindings.length) !== null && _a2 !== void 0 ? _a2 : 0;
          const newPostgresBindings = [];
          for (let i = 0; i < bindingsLen; i++) {
            const clientPostgresBinding = clientPostgresBindings[i];
            const { filter: { event, schema, table, filter } } = clientPostgresBinding;
            const serverPostgresFilter = postgres_changes2 && postgres_changes2[i];
            if (serverPostgresFilter && serverPostgresFilter.event === event && _RealtimeChannel.isFilterValueEqual(serverPostgresFilter.schema, schema) && _RealtimeChannel.isFilterValueEqual(serverPostgresFilter.table, table) && _RealtimeChannel.isFilterValueEqual(serverPostgresFilter.filter, filter)) {
              newPostgresBindings.push(Object.assign(Object.assign({}, clientPostgresBinding), {
                id: serverPostgresFilter.id
              }));
            } else {
              this.unsubscribe();
              this.state = CHANNEL_STATES.errored;
              callback === null || callback === void 0 ? void 0 : callback(REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR, new Error("mismatch between server and client bindings for postgres changes"));
              return;
            }
          }
          this.bindings.postgres_changes = newPostgresBindings;
          callback && callback(REALTIME_SUBSCRIBE_STATES.SUBSCRIBED);
          return;
        }
      }).receive("error", (error) => {
        this.state = CHANNEL_STATES.errored;
        callback === null || callback === void 0 ? void 0 : callback(REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR, new Error(JSON.stringify(Object.values(error).join(", ") || "error")));
        return;
      }).receive("timeout", () => {
        callback === null || callback === void 0 ? void 0 : callback(REALTIME_SUBSCRIBE_STATES.TIMED_OUT);
        return;
      });
    }
    return this;
  }
  /**
     * Returns the current presence state for this channel.
     *
     * The shape is a map keyed by presence key (for example a user id) where each entry contains the
     * tracked metadata for that user.
     */
  presenceState() {
    return this.presence.state;
  }
  /**
     * Sends the supplied payload to the presence tracker so other subscribers can see that this
     * client is online. Use `untrack` to stop broadcasting presence for the same key.
     */
  async track(payload, opts = {}) {
    return await this.send({
      type: "presence",
      event: "track",
      payload
    }, opts.timeout || this.timeout);
  }
  /**
     * Removes the current presence state for this client.
     */
  async untrack(opts = {}) {
    return await this.send({
      type: "presence",
      event: "untrack"
    }, opts);
  }
  on(type, filter, callback) {
    if (this.state === CHANNEL_STATES.joined && type === REALTIME_LISTEN_TYPES.PRESENCE) {
      this.socket.log("channel", `resubscribe to ${this.topic} due to change in presence callbacks on joined channel`);
      this.unsubscribe().then(async () => await this.subscribe());
    }
    return this._on(type, filter, callback);
  }
  /**
     * Sends a broadcast message explicitly via REST API.
     *
     * This method always uses the REST API endpoint regardless of WebSocket connection state.
     * Useful when you want to guarantee REST delivery or when gradually migrating from implicit REST fallback.
     *
     * @param event The name of the broadcast event
     * @param payload Payload to be sent (required)
     * @param opts Options including timeout
     * @returns Promise resolving to object with success status, and error details if failed
     */
  async httpSend(event, payload, opts = {}) {
    var _a;
    if (payload === void 0 || payload === null) {
      return Promise.reject("Payload is required for httpSend()");
    }
    const headers = {
      apikey: this.socket.apiKey ? this.socket.apiKey : "",
      "Content-Type": "application/json"
    };
    if (this.socket.accessTokenValue) {
      headers["Authorization"] = `Bearer ${this.socket.accessTokenValue}`;
    }
    const options = {
      method: "POST",
      headers,
      body: JSON.stringify({
        messages: [
          {
            topic: this.subTopic,
            event,
            payload,
            private: this.private
          }
        ]
      })
    };
    const response = await this._fetchWithTimeout(this.broadcastEndpointURL, options, (_a = opts.timeout) !== null && _a !== void 0 ? _a : this.timeout);
    if (response.status === 202) {
      return {
        success: true
      };
    }
    let errorMessage = response.statusText;
    try {
      const errorBody = await response.json();
      errorMessage = errorBody.error || errorBody.message || errorMessage;
    } catch (_b) {
    }
    return Promise.reject(new Error(errorMessage));
  }
  /**
     * Sends a message into the channel.
     *
     * @param args Arguments to send to channel
     * @param args.type The type of event to send
     * @param args.event The name of the event being sent
     * @param args.payload Payload to be sent
     * @param opts Options to be used during the send process
     */
  async send(args, opts = {}) {
    var _a, _b;
    if (!this._canPush() && args.type === "broadcast") {
      console.warn("Realtime send() is automatically falling back to REST API. This behavior will be deprecated in the future. Please use httpSend() explicitly for REST delivery.");
      const { event, payload: endpoint_payload } = args;
      const headers = {
        apikey: this.socket.apiKey ? this.socket.apiKey : "",
        "Content-Type": "application/json"
      };
      if (this.socket.accessTokenValue) {
        headers["Authorization"] = `Bearer ${this.socket.accessTokenValue}`;
      }
      const options = {
        method: "POST",
        headers,
        body: JSON.stringify({
          messages: [
            {
              topic: this.subTopic,
              event,
              payload: endpoint_payload,
              private: this.private
            }
          ]
        })
      };
      try {
        const response = await this._fetchWithTimeout(this.broadcastEndpointURL, options, (_a = opts.timeout) !== null && _a !== void 0 ? _a : this.timeout);
        await ((_b = response.body) === null || _b === void 0 ? void 0 : _b.cancel());
        return response.ok ? "ok" : "error";
      } catch (error) {
        if (error.name === "AbortError") {
          return "timed out";
        } else {
          return "error";
        }
      }
    } else {
      return new Promise((resolve) => {
        var _a2, _b2, _c;
        const push = this._push(args.type, args, opts.timeout || this.timeout);
        if (args.type === "broadcast" && !((_c = (_b2 = (_a2 = this.params) === null || _a2 === void 0 ? void 0 : _a2.config) === null || _b2 === void 0 ? void 0 : _b2.broadcast) === null || _c === void 0 ? void 0 : _c.ack)) {
          resolve("ok");
        }
        push.receive("ok", () => resolve("ok"));
        push.receive("error", () => resolve("error"));
        push.receive("timeout", () => resolve("timed out"));
      });
    }
  }
  /**
     * Updates the payload that will be sent the next time the channel joins (reconnects).
     * Useful for rotating access tokens or updating config without re-creating the channel.
     */
  updateJoinPayload(payload) {
    this.joinPush.updatePayload(payload);
  }
  /**
     * Leaves the channel.
     *
     * Unsubscribes from server events, and instructs channel to terminate on server.
     * Triggers onClose() hooks.
     *
     * To receive leave acknowledgements, use the a `receive` hook to bind to the server ack, ie:
     * channel.unsubscribe().receive("ok", () => alert("left!") )
     */
  unsubscribe(timeout = this.timeout) {
    this.state = CHANNEL_STATES.leaving;
    const onClose = () => {
      this.socket.log("channel", `leave ${this.topic}`);
      this._trigger(CHANNEL_EVENTS.close, "leave", this._joinRef());
    };
    this.joinPush.destroy();
    let leavePush = null;
    return new Promise((resolve) => {
      leavePush = new Push(this, CHANNEL_EVENTS.leave, {}, timeout);
      leavePush.receive("ok", () => {
        onClose();
        resolve("ok");
      }).receive("timeout", () => {
        onClose();
        resolve("timed out");
      }).receive("error", () => {
        resolve("error");
      });
      leavePush.send();
      if (!this._canPush()) {
        leavePush.trigger("ok", {});
      }
    }).finally(() => {
      leavePush === null || leavePush === void 0 ? void 0 : leavePush.destroy();
    });
  }
  /**
     * Teardown the channel.
     *
     * Destroys and stops related timers.
     */
  teardown() {
    this.pushBuffer.forEach((push) => push.destroy());
    this.pushBuffer = [];
    this.rejoinTimer.reset();
    this.joinPush.destroy();
    this.state = CHANNEL_STATES.closed;
    this.bindings = {};
  }
  /** @internal */
  async _fetchWithTimeout(url, options, timeout) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await this.socket.fetch(url, Object.assign(Object.assign({}, options), {
      signal: controller.signal
    }));
    clearTimeout(id);
    return response;
  }
  /** @internal */
  _push(event, payload, timeout = this.timeout) {
    if (!this.joinedOnce) {
      throw `tried to push '${event}' to '${this.topic}' before joining. Use channel.subscribe() before pushing events`;
    }
    let pushEvent = new Push(this, event, payload, timeout);
    if (this._canPush()) {
      pushEvent.send();
    } else {
      this._addToPushBuffer(pushEvent);
    }
    return pushEvent;
  }
  /** @internal */
  _addToPushBuffer(pushEvent) {
    pushEvent.startTimeout();
    this.pushBuffer.push(pushEvent);
    if (this.pushBuffer.length > MAX_PUSH_BUFFER_SIZE) {
      const removedPush = this.pushBuffer.shift();
      if (removedPush) {
        removedPush.destroy();
        this.socket.log("channel", `discarded push due to buffer overflow: ${removedPush.event}`, removedPush.payload);
      }
    }
  }
  /**
     * Overridable message hook
     *
     * Receives all events for specialized message handling before dispatching to the channel callbacks.
     * Must return the payload, modified or unmodified.
     *
     * @internal
     */
  _onMessage(_event, payload, _ref) {
    return payload;
  }
  /** @internal */
  _isMember(topic) {
    return this.topic === topic;
  }
  /** @internal */
  _joinRef() {
    return this.joinPush.ref;
  }
  /** @internal */
  _trigger(type, payload, ref) {
    var _a, _b;
    const typeLower = type.toLocaleLowerCase();
    const { close, error, leave, join } = CHANNEL_EVENTS;
    const events = [
      close,
      error,
      leave,
      join
    ];
    if (ref && events.indexOf(typeLower) >= 0 && ref !== this._joinRef()) {
      return;
    }
    let handledPayload = this._onMessage(typeLower, payload, ref);
    if (payload && !handledPayload) {
      throw "channel onMessage callbacks must return the payload, modified or unmodified";
    }
    if ([
      "insert",
      "update",
      "delete"
    ].includes(typeLower)) {
      (_a = this.bindings.postgres_changes) === null || _a === void 0 ? void 0 : _a.filter((bind) => {
        var _a2, _b2, _c;
        return ((_a2 = bind.filter) === null || _a2 === void 0 ? void 0 : _a2.event) === "*" || ((_c = (_b2 = bind.filter) === null || _b2 === void 0 ? void 0 : _b2.event) === null || _c === void 0 ? void 0 : _c.toLocaleLowerCase()) === typeLower;
      }).map((bind) => bind.callback(handledPayload, ref));
    } else {
      (_b = this.bindings[typeLower]) === null || _b === void 0 ? void 0 : _b.filter((bind) => {
        var _a2, _b2, _c, _d, _e, _f;
        if ([
          "broadcast",
          "presence",
          "postgres_changes"
        ].includes(typeLower)) {
          if ("id" in bind) {
            const bindId = bind.id;
            const bindEvent = (_a2 = bind.filter) === null || _a2 === void 0 ? void 0 : _a2.event;
            return bindId && ((_b2 = payload.ids) === null || _b2 === void 0 ? void 0 : _b2.includes(bindId)) && (bindEvent === "*" || (bindEvent === null || bindEvent === void 0 ? void 0 : bindEvent.toLocaleLowerCase()) === ((_c = payload.data) === null || _c === void 0 ? void 0 : _c.type.toLocaleLowerCase()));
          } else {
            const bindEvent = (_e = (_d = bind === null || bind === void 0 ? void 0 : bind.filter) === null || _d === void 0 ? void 0 : _d.event) === null || _e === void 0 ? void 0 : _e.toLocaleLowerCase();
            return bindEvent === "*" || bindEvent === ((_f = payload === null || payload === void 0 ? void 0 : payload.event) === null || _f === void 0 ? void 0 : _f.toLocaleLowerCase());
          }
        } else {
          return bind.type.toLocaleLowerCase() === typeLower;
        }
      }).map((bind) => {
        if (typeof handledPayload === "object" && "ids" in handledPayload) {
          const postgresChanges = handledPayload.data;
          const { schema, table, commit_timestamp, type: type2, errors } = postgresChanges;
          const enrichedPayload = {
            schema,
            table,
            commit_timestamp,
            eventType: type2,
            new: {},
            old: {},
            errors
          };
          handledPayload = Object.assign(Object.assign({}, enrichedPayload), this._getPayloadRecords(postgresChanges));
        }
        bind.callback(handledPayload, ref);
      });
    }
  }
  /** @internal */
  _isClosed() {
    return this.state === CHANNEL_STATES.closed;
  }
  /** @internal */
  _isJoined() {
    return this.state === CHANNEL_STATES.joined;
  }
  /** @internal */
  _isJoining() {
    return this.state === CHANNEL_STATES.joining;
  }
  /** @internal */
  _isLeaving() {
    return this.state === CHANNEL_STATES.leaving;
  }
  /** @internal */
  _replyEventName(ref) {
    return `chan_reply_${ref}`;
  }
  /** @internal */
  _on(type, filter, callback) {
    const typeLower = type.toLocaleLowerCase();
    const binding = {
      type: typeLower,
      filter,
      callback
    };
    if (this.bindings[typeLower]) {
      this.bindings[typeLower].push(binding);
    } else {
      this.bindings[typeLower] = [
        binding
      ];
    }
    return this;
  }
  /** @internal */
  _off(type, filter) {
    const typeLower = type.toLocaleLowerCase();
    if (this.bindings[typeLower]) {
      this.bindings[typeLower] = this.bindings[typeLower].filter((bind) => {
        var _a;
        return !(((_a = bind.type) === null || _a === void 0 ? void 0 : _a.toLocaleLowerCase()) === typeLower && _RealtimeChannel.isEqual(bind.filter, filter));
      });
    }
    return this;
  }
  /** @internal */
  static isEqual(obj1, obj2) {
    if (Object.keys(obj1).length !== Object.keys(obj2).length) {
      return false;
    }
    for (const k in obj1) {
      if (obj1[k] !== obj2[k]) {
        return false;
      }
    }
    return true;
  }
  /**
     * Compares two optional filter values for equality.
     * Treats undefined, null, and empty string as equivalent empty values.
     * @internal
     */
  static isFilterValueEqual(serverValue, clientValue) {
    const normalizedServer = serverValue !== null && serverValue !== void 0 ? serverValue : void 0;
    const normalizedClient = clientValue !== null && clientValue !== void 0 ? clientValue : void 0;
    return normalizedServer === normalizedClient;
  }
  /** @internal */
  _rejoinUntilConnected() {
    this.rejoinTimer.scheduleTimeout();
    if (this.socket.isConnected()) {
      this._rejoin();
    }
  }
  /**
     * Registers a callback that will be executed when the channel closes.
     *
     * @internal
     */
  _onClose(callback) {
    this._on(CHANNEL_EVENTS.close, {}, callback);
  }
  /**
     * Registers a callback that will be executed when the channel encounteres an error.
     *
     * @internal
     */
  _onError(callback) {
    this._on(CHANNEL_EVENTS.error, {}, (reason) => callback(reason));
  }
  /**
     * Returns `true` if the socket is connected and the channel has been joined.
     *
     * @internal
     */
  _canPush() {
    return this.socket.isConnected() && this._isJoined();
  }
  /** @internal */
  _rejoin(timeout = this.timeout) {
    if (this._isLeaving()) {
      return;
    }
    this.socket._leaveOpenTopic(this.topic);
    this.state = CHANNEL_STATES.joining;
    this.joinPush.resend(timeout);
  }
  /** @internal */
  _getPayloadRecords(payload) {
    const records = {
      new: {},
      old: {}
    };
    if (payload.type === "INSERT" || payload.type === "UPDATE") {
      records.new = convertChangeData(payload.columns, payload.record);
    }
    if (payload.type === "UPDATE" || payload.type === "DELETE") {
      records.old = convertChangeData(payload.columns, payload.old_record);
    }
    return records;
  }
};

// C:/Users/Jmarcum/AppData/Local/deno/npm/registry.npmjs.org/@supabase/realtime-js/2.98.0/dist/module/RealtimeClient.js
var noop2 = () => {
};
var CONNECTION_TIMEOUTS = {
  HEARTBEAT_INTERVAL: 25e3,
  RECONNECT_DELAY: 10,
  HEARTBEAT_TIMEOUT_FALLBACK: 100
};
var RECONNECT_INTERVALS = [
  1e3,
  2e3,
  5e3,
  1e4
];
var DEFAULT_RECONNECT_FALLBACK = 1e4;
var WORKER_SCRIPT = `
  addEventListener("message", (e) => {
    if (e.data.event === "start") {
      setInterval(() => postMessage({ event: "keepAlive" }), e.data.interval);
    }
  });`;
var RealtimeClient = class {
  /**
     * Initializes the Socket.
     *
     * @param endPoint The string WebSocket endpoint, ie, "ws://example.com/socket", "wss://example.com", "/socket" (inherited host & protocol)
     * @param httpEndpoint The string HTTP endpoint, ie, "https://example.com", "/" (inherited host & protocol)
     * @param options.transport The Websocket Transport, for example WebSocket. This can be a custom implementation
     * @param options.timeout The default timeout in milliseconds to trigger push timeouts.
     * @param options.params The optional params to pass when connecting.
     * @param options.headers Deprecated: headers cannot be set on websocket connections and this option will be removed in the future.
     * @param options.heartbeatIntervalMs The millisec interval to send a heartbeat message.
     * @param options.heartbeatCallback The optional function to handle heartbeat status and latency.
     * @param options.logger The optional function for specialized logging, ie: logger: (kind, msg, data) => { console.log(`${kind}: ${msg}`, data) }
     * @param options.logLevel Sets the log level for Realtime
     * @param options.encode The function to encode outgoing messages. Defaults to JSON: (payload, callback) => callback(JSON.stringify(payload))
     * @param options.decode The function to decode incoming messages. Defaults to Serializer's decode.
     * @param options.reconnectAfterMs he optional function that returns the millsec reconnect interval. Defaults to stepped backoff off.
     * @param options.worker Use Web Worker to set a side flow. Defaults to false.
     * @param options.workerUrl The URL of the worker script. Defaults to https://realtime.supabase.com/worker.js that includes a heartbeat event call to keep the connection alive.
     * @param options.vsn The protocol version to use when connecting. Supported versions are "1.0.0" and "2.0.0". Defaults to "2.0.0".
     * @example
     * ```ts
     * import RealtimeClient from '@supabase/realtime-js'
     *
     * const client = new RealtimeClient('https://xyzcompany.supabase.co/realtime/v1', {
     *   params: { apikey: 'public-anon-key' },
     * })
     * client.connect()
     * ```
     */
  constructor(endPoint, options) {
    var _a;
    this.accessTokenValue = null;
    this.apiKey = null;
    this._manuallySetToken = false;
    this.channels = new Array();
    this.endPoint = "";
    this.httpEndpoint = "";
    this.headers = {};
    this.params = {};
    this.timeout = DEFAULT_TIMEOUT;
    this.transport = null;
    this.heartbeatIntervalMs = CONNECTION_TIMEOUTS.HEARTBEAT_INTERVAL;
    this.heartbeatTimer = void 0;
    this.pendingHeartbeatRef = null;
    this.heartbeatCallback = noop2;
    this.ref = 0;
    this.reconnectTimer = null;
    this.vsn = DEFAULT_VSN;
    this.logger = noop2;
    this.conn = null;
    this.sendBuffer = [];
    this.serializer = new Serializer();
    this.stateChangeCallbacks = {
      open: [],
      close: [],
      error: [],
      message: []
    };
    this.accessToken = null;
    this._connectionState = "disconnected";
    this._wasManualDisconnect = false;
    this._authPromise = null;
    this._heartbeatSentAt = null;
    this._resolveFetch = (customFetch) => {
      if (customFetch) {
        return (...args) => customFetch(...args);
      }
      return (...args) => fetch(...args);
    };
    if (!((_a = options === null || options === void 0 ? void 0 : options.params) === null || _a === void 0 ? void 0 : _a.apikey)) {
      throw new Error("API key is required to connect to Realtime");
    }
    this.apiKey = options.params.apikey;
    this.endPoint = `${endPoint}/${TRANSPORTS.websocket}`;
    this.httpEndpoint = httpEndpointURL(endPoint);
    this._initializeOptions(options);
    this._setupReconnectionTimer();
    this.fetch = this._resolveFetch(options === null || options === void 0 ? void 0 : options.fetch);
  }
  /**
     * Connects the socket, unless already connected.
     */
  connect() {
    if (this.isConnecting() || this.isDisconnecting() || this.conn !== null && this.isConnected()) {
      return;
    }
    this._setConnectionState("connecting");
    if (this.accessToken && !this._authPromise) {
      this._setAuthSafely("connect");
    }
    if (this.transport) {
      this.conn = new this.transport(this.endpointURL());
    } else {
      try {
        this.conn = websocket_factory_default.createWebSocket(this.endpointURL());
      } catch (error) {
        this._setConnectionState("disconnected");
        const errorMessage = error.message;
        if (errorMessage.includes("Node.js")) {
          throw new Error(`${errorMessage}

To use Realtime in Node.js, you need to provide a WebSocket implementation:

Option 1: Use Node.js 22+ which has native WebSocket support
Option 2: Install and provide the "ws" package:

  npm install ws

  import ws from "ws"
  const client = new RealtimeClient(url, {
    ...options,
    transport: ws
  })`);
        }
        throw new Error(`WebSocket not available: ${errorMessage}`);
      }
    }
    this._setupConnectionHandlers();
  }
  /**
     * Returns the URL of the websocket.
     * @returns string The URL of the websocket.
     */
  endpointURL() {
    return this._appendParams(this.endPoint, Object.assign({}, this.params, {
      vsn: this.vsn
    }));
  }
  /**
     * Disconnects the socket.
     *
     * @param code A numeric status code to send on disconnect.
     * @param reason A custom reason for the disconnect.
     */
  disconnect(code, reason) {
    if (this.isDisconnecting()) {
      return;
    }
    this._setConnectionState("disconnecting", true);
    if (this.conn) {
      const fallbackTimer = setTimeout(() => {
        this._setConnectionState("disconnected");
      }, 100);
      this.conn.onclose = () => {
        clearTimeout(fallbackTimer);
        this._setConnectionState("disconnected");
      };
      if (typeof this.conn.close === "function") {
        if (code) {
          this.conn.close(code, reason !== null && reason !== void 0 ? reason : "");
        } else {
          this.conn.close();
        }
      }
      this._teardownConnection();
    } else {
      this._setConnectionState("disconnected");
    }
  }
  /**
     * Returns all created channels
     */
  getChannels() {
    return this.channels;
  }
  /**
     * Unsubscribes and removes a single channel
     * @param channel A RealtimeChannel instance
     */
  async removeChannel(channel) {
    const status = await channel.unsubscribe();
    if (this.channels.length === 0) {
      this.disconnect();
    }
    return status;
  }
  /**
     * Unsubscribes and removes all channels
     */
  async removeAllChannels() {
    const values_1 = await Promise.all(this.channels.map((channel) => channel.unsubscribe()));
    this.channels = [];
    this.disconnect();
    return values_1;
  }
  /**
     * Logs the message.
     *
     * For customized logging, `this.logger` can be overridden.
     */
  log(kind, msg, data) {
    this.logger(kind, msg, data);
  }
  /**
     * Returns the current state of the socket.
     */
  connectionState() {
    switch (this.conn && this.conn.readyState) {
      case SOCKET_STATES.connecting:
        return CONNECTION_STATE.Connecting;
      case SOCKET_STATES.open:
        return CONNECTION_STATE.Open;
      case SOCKET_STATES.closing:
        return CONNECTION_STATE.Closing;
      default:
        return CONNECTION_STATE.Closed;
    }
  }
  /**
     * Returns `true` is the connection is open.
     */
  isConnected() {
    return this.connectionState() === CONNECTION_STATE.Open;
  }
  /**
     * Returns `true` if the connection is currently connecting.
     */
  isConnecting() {
    return this._connectionState === "connecting";
  }
  /**
     * Returns `true` if the connection is currently disconnecting.
     */
  isDisconnecting() {
    return this._connectionState === "disconnecting";
  }
  /**
     * Creates (or reuses) a {@link RealtimeChannel} for the provided topic.
     *
     * Topics are automatically prefixed with `realtime:` to match the Realtime service.
     * If a channel with the same topic already exists it will be returned instead of creating
     * a duplicate connection.
     */
  channel(topic, params = {
    config: {}
  }) {
    const realtimeTopic = `realtime:${topic}`;
    const exists = this.getChannels().find((c) => c.topic === realtimeTopic);
    if (!exists) {
      const chan = new RealtimeChannel(`realtime:${topic}`, params, this);
      this.channels.push(chan);
      return chan;
    } else {
      return exists;
    }
  }
  /**
     * Push out a message if the socket is connected.
     *
     * If the socket is not connected, the message gets enqueued within a local buffer, and sent out when a connection is next established.
     */
  push(data) {
    const { topic, event, payload, ref } = data;
    const callback = () => {
      this.encode(data, (result) => {
        var _a;
        (_a = this.conn) === null || _a === void 0 ? void 0 : _a.send(result);
      });
    };
    this.log("push", `${topic} ${event} (${ref})`, payload);
    if (this.isConnected()) {
      callback();
    } else {
      this.sendBuffer.push(callback);
    }
  }
  /**
     * Sets the JWT access token used for channel subscription authorization and Realtime RLS.
     *
     * If param is null it will use the `accessToken` callback function or the token set on the client.
     *
     * On callback used, it will set the value of the token internal to the client.
     *
     * When a token is explicitly provided, it will be preserved across channel operations
     * (including removeChannel and resubscribe). The `accessToken` callback will not be
     * invoked until `setAuth()` is called without arguments.
     *
     * @param token A JWT string to override the token set on the client.
     *
     * @example
     * // Use a manual token (preserved across resubscribes, ignores accessToken callback)
     * client.realtime.setAuth('my-custom-jwt')
     *
     * // Switch back to using the accessToken callback
     * client.realtime.setAuth()
     */
  async setAuth(token = null) {
    this._authPromise = this._performAuth(token);
    try {
      await this._authPromise;
    } finally {
      this._authPromise = null;
    }
  }
  /**
     * Returns true if the current access token was explicitly set via setAuth(token),
     * false if it was obtained via the accessToken callback.
     * @internal
     */
  _isManualToken() {
    return this._manuallySetToken;
  }
  /**
     * Sends a heartbeat message if the socket is connected.
     */
  async sendHeartbeat() {
    var _a;
    if (!this.isConnected()) {
      try {
        this.heartbeatCallback("disconnected");
      } catch (e) {
        this.log("error", "error in heartbeat callback", e);
      }
      return;
    }
    if (this.pendingHeartbeatRef) {
      this.pendingHeartbeatRef = null;
      this._heartbeatSentAt = null;
      this.log("transport", "heartbeat timeout. Attempting to re-establish connection");
      try {
        this.heartbeatCallback("timeout");
      } catch (e) {
        this.log("error", "error in heartbeat callback", e);
      }
      this._wasManualDisconnect = false;
      (_a = this.conn) === null || _a === void 0 ? void 0 : _a.close(WS_CLOSE_NORMAL, "heartbeat timeout");
      setTimeout(() => {
        var _a2;
        if (!this.isConnected()) {
          (_a2 = this.reconnectTimer) === null || _a2 === void 0 ? void 0 : _a2.scheduleTimeout();
        }
      }, CONNECTION_TIMEOUTS.HEARTBEAT_TIMEOUT_FALLBACK);
      return;
    }
    this._heartbeatSentAt = Date.now();
    this.pendingHeartbeatRef = this._makeRef();
    this.push({
      topic: "phoenix",
      event: "heartbeat",
      payload: {},
      ref: this.pendingHeartbeatRef
    });
    try {
      this.heartbeatCallback("sent");
    } catch (e) {
      this.log("error", "error in heartbeat callback", e);
    }
    this._setAuthSafely("heartbeat");
  }
  /**
     * Sets a callback that receives lifecycle events for internal heartbeat messages.
     * Useful for instrumenting connection health (e.g. sent/ok/timeout/disconnected).
     */
  onHeartbeat(callback) {
    this.heartbeatCallback = callback;
  }
  /**
     * Flushes send buffer
     */
  flushSendBuffer() {
    if (this.isConnected() && this.sendBuffer.length > 0) {
      this.sendBuffer.forEach((callback) => callback());
      this.sendBuffer = [];
    }
  }
  /**
     * Return the next message ref, accounting for overflows
     *
     * @internal
     */
  _makeRef() {
    let newRef = this.ref + 1;
    if (newRef === this.ref) {
      this.ref = 0;
    } else {
      this.ref = newRef;
    }
    return this.ref.toString();
  }
  /**
     * Unsubscribe from channels with the specified topic.
     *
     * @internal
     */
  _leaveOpenTopic(topic) {
    let dupChannel = this.channels.find((c) => c.topic === topic && (c._isJoined() || c._isJoining()));
    if (dupChannel) {
      this.log("transport", `leaving duplicate topic "${topic}"`);
      dupChannel.unsubscribe();
    }
  }
  /**
     * Removes a subscription from the socket.
     *
     * @param channel An open subscription.
     *
     * @internal
     */
  _remove(channel) {
    this.channels = this.channels.filter((c) => c.topic !== channel.topic);
  }
  /** @internal */
  _onConnMessage(rawMessage) {
    this.decode(rawMessage.data, (msg) => {
      if (msg.topic === "phoenix" && msg.event === "phx_reply" && msg.ref && msg.ref === this.pendingHeartbeatRef) {
        const latency = this._heartbeatSentAt ? Date.now() - this._heartbeatSentAt : void 0;
        try {
          this.heartbeatCallback(msg.payload.status === "ok" ? "ok" : "error", latency);
        } catch (e) {
          this.log("error", "error in heartbeat callback", e);
        }
        this._heartbeatSentAt = null;
        this.pendingHeartbeatRef = null;
      }
      const { topic, event, payload, ref } = msg;
      const refString = ref ? `(${ref})` : "";
      const status = payload.status || "";
      this.log("receive", `${status} ${topic} ${event} ${refString}`.trim(), payload);
      this.channels.filter((channel) => channel._isMember(topic)).forEach((channel) => channel._trigger(event, payload, ref));
      this._triggerStateCallbacks("message", msg);
    });
  }
  /**
     * Clear specific timer
     * @internal
     */
  _clearTimer(timer) {
    var _a;
    if (timer === "heartbeat" && this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = void 0;
    } else if (timer === "reconnect") {
      (_a = this.reconnectTimer) === null || _a === void 0 ? void 0 : _a.reset();
    }
  }
  /**
     * Clear all timers
     * @internal
     */
  _clearAllTimers() {
    this._clearTimer("heartbeat");
    this._clearTimer("reconnect");
  }
  /**
     * Setup connection handlers for WebSocket events
     * @internal
     */
  _setupConnectionHandlers() {
    if (!this.conn) return;
    if ("binaryType" in this.conn) {
      ;
      this.conn.binaryType = "arraybuffer";
    }
    this.conn.onopen = () => this._onConnOpen();
    this.conn.onerror = (error) => this._onConnError(error);
    this.conn.onmessage = (event) => this._onConnMessage(event);
    this.conn.onclose = (event) => this._onConnClose(event);
    if (this.conn.readyState === SOCKET_STATES.open) {
      this._onConnOpen();
    }
  }
  /**
     * Teardown connection and cleanup resources
     * @internal
     */
  _teardownConnection() {
    if (this.conn) {
      if (this.conn.readyState === SOCKET_STATES.open || this.conn.readyState === SOCKET_STATES.connecting) {
        try {
          this.conn.close();
        } catch (e) {
          this.log("error", "Error closing connection", e);
        }
      }
      this.conn.onopen = null;
      this.conn.onerror = null;
      this.conn.onmessage = null;
      this.conn.onclose = null;
      this.conn = null;
    }
    this._clearAllTimers();
    this._terminateWorker();
    this.channels.forEach((channel) => channel.teardown());
  }
  /** @internal */
  _onConnOpen() {
    this._setConnectionState("connected");
    this.log("transport", `connected to ${this.endpointURL()}`);
    const authPromise = this._authPromise || (this.accessToken && !this.accessTokenValue ? this.setAuth() : Promise.resolve());
    authPromise.then(() => {
      if (this.accessTokenValue) {
        this.channels.forEach((channel) => {
          channel.updateJoinPayload({
            access_token: this.accessTokenValue
          });
        });
        this.sendBuffer = [];
        this.channels.forEach((channel) => {
          if (channel._isJoining()) {
            channel.joinPush.sent = false;
            channel.joinPush.send();
          }
        });
      }
      this.flushSendBuffer();
    }).catch((e) => {
      this.log("error", "error waiting for auth on connect", e);
      this.flushSendBuffer();
    });
    this._clearTimer("reconnect");
    if (!this.worker) {
      this._startHeartbeat();
    } else {
      if (!this.workerRef) {
        this._startWorkerHeartbeat();
      }
    }
    this._triggerStateCallbacks("open");
  }
  /** @internal */
  _startHeartbeat() {
    this.heartbeatTimer && clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = setInterval(() => this.sendHeartbeat(), this.heartbeatIntervalMs);
  }
  /** @internal */
  _startWorkerHeartbeat() {
    if (this.workerUrl) {
      this.log("worker", `starting worker for from ${this.workerUrl}`);
    } else {
      this.log("worker", `starting default worker`);
    }
    const objectUrl = this._workerObjectUrl(this.workerUrl);
    this.workerRef = new Worker(objectUrl);
    this.workerRef.onerror = (error) => {
      this.log("worker", "worker error", error.message);
      this._terminateWorker();
    };
    this.workerRef.onmessage = (event) => {
      if (event.data.event === "keepAlive") {
        this.sendHeartbeat();
      }
    };
    this.workerRef.postMessage({
      event: "start",
      interval: this.heartbeatIntervalMs
    });
  }
  /**
     * Terminate the Web Worker and clear the reference
     * @internal
     */
  _terminateWorker() {
    if (this.workerRef) {
      this.log("worker", "terminating worker");
      this.workerRef.terminate();
      this.workerRef = void 0;
    }
  }
  /** @internal */
  _onConnClose(event) {
    var _a;
    this._setConnectionState("disconnected");
    this.log("transport", "close", event);
    this._triggerChanError();
    this._clearTimer("heartbeat");
    if (!this._wasManualDisconnect) {
      (_a = this.reconnectTimer) === null || _a === void 0 ? void 0 : _a.scheduleTimeout();
    }
    this._triggerStateCallbacks("close", event);
  }
  /** @internal */
  _onConnError(error) {
    this._setConnectionState("disconnected");
    this.log("transport", `${error}`);
    this._triggerChanError();
    this._triggerStateCallbacks("error", error);
    try {
      this.heartbeatCallback("error");
    } catch (e) {
      this.log("error", "error in heartbeat callback", e);
    }
  }
  /** @internal */
  _triggerChanError() {
    this.channels.forEach((channel) => channel._trigger(CHANNEL_EVENTS.error));
  }
  /** @internal */
  _appendParams(url, params) {
    if (Object.keys(params).length === 0) {
      return url;
    }
    const prefix = url.match(/\?/) ? "&" : "?";
    const query = new URLSearchParams(params);
    return `${url}${prefix}${query}`;
  }
  _workerObjectUrl(url) {
    let result_url;
    if (url) {
      result_url = url;
    } else {
      const blob = new Blob([
        WORKER_SCRIPT
      ], {
        type: "application/javascript"
      });
      result_url = URL.createObjectURL(blob);
    }
    return result_url;
  }
  /**
     * Set connection state with proper state management
     * @internal
     */
  _setConnectionState(state2, manual = false) {
    this._connectionState = state2;
    if (state2 === "connecting") {
      this._wasManualDisconnect = false;
    } else if (state2 === "disconnecting") {
      this._wasManualDisconnect = manual;
    }
  }
  /**
     * Perform the actual auth operation
     * @internal
     */
  async _performAuth(token = null) {
    let tokenToSend;
    let isManualToken = false;
    if (token) {
      tokenToSend = token;
      isManualToken = true;
    } else if (this.accessToken) {
      try {
        tokenToSend = await this.accessToken();
      } catch (e) {
        this.log("error", "Error fetching access token from callback", e);
        tokenToSend = this.accessTokenValue;
      }
    } else {
      tokenToSend = this.accessTokenValue;
    }
    if (isManualToken) {
      this._manuallySetToken = true;
    } else if (this.accessToken) {
      this._manuallySetToken = false;
    }
    if (this.accessTokenValue != tokenToSend) {
      this.accessTokenValue = tokenToSend;
      this.channels.forEach((channel) => {
        const payload = {
          access_token: tokenToSend,
          version: DEFAULT_VERSION
        };
        tokenToSend && channel.updateJoinPayload(payload);
        if (channel.joinedOnce && channel._isJoined()) {
          channel._push(CHANNEL_EVENTS.access_token, {
            access_token: tokenToSend
          });
        }
      });
    }
  }
  /**
     * Wait for any in-flight auth operations to complete
     * @internal
     */
  async _waitForAuthIfNeeded() {
    if (this._authPromise) {
      await this._authPromise;
    }
  }
  /**
     * Safely call setAuth with standardized error handling
     * @internal
     */
  _setAuthSafely(context = "general") {
    if (!this._isManualToken()) {
      this.setAuth().catch((e) => {
        this.log("error", `Error setting auth in ${context}`, e);
      });
    }
  }
  /**
     * Trigger state change callbacks with proper error handling
     * @internal
     */
  _triggerStateCallbacks(event, data) {
    try {
      this.stateChangeCallbacks[event].forEach((callback) => {
        try {
          callback(data);
        } catch (e) {
          this.log("error", `error in ${event} callback`, e);
        }
      });
    } catch (e) {
      this.log("error", `error triggering ${event} callbacks`, e);
    }
  }
  /**
     * Setup reconnection timer with proper configuration
     * @internal
     */
  _setupReconnectionTimer() {
    this.reconnectTimer = new Timer(async () => {
      setTimeout(async () => {
        await this._waitForAuthIfNeeded();
        if (!this.isConnected()) {
          this.connect();
        }
      }, CONNECTION_TIMEOUTS.RECONNECT_DELAY);
    }, this.reconnectAfterMs);
  }
  /**
     * Initialize client options with defaults
     * @internal
     */
  _initializeOptions(options) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    this.transport = (_a = options === null || options === void 0 ? void 0 : options.transport) !== null && _a !== void 0 ? _a : null;
    this.timeout = (_b = options === null || options === void 0 ? void 0 : options.timeout) !== null && _b !== void 0 ? _b : DEFAULT_TIMEOUT;
    this.heartbeatIntervalMs = (_c = options === null || options === void 0 ? void 0 : options.heartbeatIntervalMs) !== null && _c !== void 0 ? _c : CONNECTION_TIMEOUTS.HEARTBEAT_INTERVAL;
    this.worker = (_d = options === null || options === void 0 ? void 0 : options.worker) !== null && _d !== void 0 ? _d : false;
    this.accessToken = (_e = options === null || options === void 0 ? void 0 : options.accessToken) !== null && _e !== void 0 ? _e : null;
    this.heartbeatCallback = (_f = options === null || options === void 0 ? void 0 : options.heartbeatCallback) !== null && _f !== void 0 ? _f : noop2;
    this.vsn = (_g = options === null || options === void 0 ? void 0 : options.vsn) !== null && _g !== void 0 ? _g : DEFAULT_VSN;
    if (options === null || options === void 0 ? void 0 : options.params) this.params = options.params;
    if (options === null || options === void 0 ? void 0 : options.logger) this.logger = options.logger;
    if ((options === null || options === void 0 ? void 0 : options.logLevel) || (options === null || options === void 0 ? void 0 : options.log_level)) {
      this.logLevel = options.logLevel || options.log_level;
      this.params = Object.assign(Object.assign({}, this.params), {
        log_level: this.logLevel
      });
    }
    this.reconnectAfterMs = (_h = options === null || options === void 0 ? void 0 : options.reconnectAfterMs) !== null && _h !== void 0 ? _h : (tries) => {
      return RECONNECT_INTERVALS[tries - 1] || DEFAULT_RECONNECT_FALLBACK;
    };
    switch (this.vsn) {
      case VSN_1_0_0:
        this.encode = (_j = options === null || options === void 0 ? void 0 : options.encode) !== null && _j !== void 0 ? _j : (payload, callback) => {
          return callback(JSON.stringify(payload));
        };
        this.decode = (_k = options === null || options === void 0 ? void 0 : options.decode) !== null && _k !== void 0 ? _k : (payload, callback) => {
          return callback(JSON.parse(payload));
        };
        break;
      case VSN_2_0_0:
        this.encode = (_l = options === null || options === void 0 ? void 0 : options.encode) !== null && _l !== void 0 ? _l : this.serializer.encode.bind(this.serializer);
        this.decode = (_m = options === null || options === void 0 ? void 0 : options.decode) !== null && _m !== void 0 ? _m : this.serializer.decode.bind(this.serializer);
        break;
      default:
        throw new Error(`Unsupported serializer version: ${this.vsn}`);
    }
    if (this.worker) {
      if (typeof window !== "undefined" && !window.Worker) {
        throw new Error("Web Worker is not supported");
      }
      this.workerUrl = options === null || options === void 0 ? void 0 : options.workerUrl;
    }
  }
};

// C:/Users/Jmarcum/AppData/Local/deno/npm/registry.npmjs.org/iceberg-js/0.8.1/dist/index.mjs
var IcebergError = class extends Error {
  constructor(message, opts) {
    super(message);
    this.name = "IcebergError";
    this.status = opts.status;
    this.icebergType = opts.icebergType;
    this.icebergCode = opts.icebergCode;
    this.details = opts.details;
    this.isCommitStateUnknown = opts.icebergType === "CommitStateUnknownException" || [
      500,
      502,
      504
    ].includes(opts.status) && opts.icebergType?.includes("CommitState") === true;
  }
  /**
   * Returns true if the error is a 404 Not Found error.
   */
  isNotFound() {
    return this.status === 404;
  }
  /**
   * Returns true if the error is a 409 Conflict error.
   */
  isConflict() {
    return this.status === 409;
  }
  /**
   * Returns true if the error is a 419 Authentication Timeout error.
   */
  isAuthenticationTimeout() {
    return this.status === 419;
  }
};
function buildUrl(baseUrl, path, query) {
  const url = new URL(path, baseUrl);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== void 0) {
        url.searchParams.set(key, value);
      }
    }
  }
  return url.toString();
}
async function buildAuthHeaders(auth) {
  if (!auth || auth.type === "none") {
    return {};
  }
  if (auth.type === "bearer") {
    return {
      Authorization: `Bearer ${auth.token}`
    };
  }
  if (auth.type === "header") {
    return {
      [auth.name]: auth.value
    };
  }
  if (auth.type === "custom") {
    return await auth.getHeaders();
  }
  return {};
}
function createFetchClient(options) {
  const fetchFn = options.fetchImpl ?? globalThis.fetch;
  return {
    async request({ method, path, query, body, headers }) {
      const url = buildUrl(options.baseUrl, path, query);
      const authHeaders = await buildAuthHeaders(options.auth);
      const res = await fetchFn(url, {
        method,
        headers: {
          ...body ? {
            "Content-Type": "application/json"
          } : {},
          ...authHeaders,
          ...headers
        },
        body: body ? JSON.stringify(body) : void 0
      });
      const text = await res.text();
      const isJson = (res.headers.get("content-type") || "").includes("application/json");
      const data = isJson && text ? JSON.parse(text) : text;
      if (!res.ok) {
        const errBody = isJson ? data : void 0;
        const errorDetail = errBody?.error;
        throw new IcebergError(errorDetail?.message ?? `Request failed with status ${res.status}`, {
          status: res.status,
          icebergType: errorDetail?.type,
          icebergCode: errorDetail?.code,
          details: errBody
        });
      }
      return {
        status: res.status,
        headers: res.headers,
        data
      };
    }
  };
}
function namespaceToPath(namespace) {
  return namespace.join("");
}
var NamespaceOperations = class {
  constructor(client, prefix = "") {
    this.client = client;
    this.prefix = prefix;
  }
  async listNamespaces(parent) {
    const query = parent ? {
      parent: namespaceToPath(parent.namespace)
    } : void 0;
    const response = await this.client.request({
      method: "GET",
      path: `${this.prefix}/namespaces`,
      query
    });
    return response.data.namespaces.map((ns) => ({
      namespace: ns
    }));
  }
  async createNamespace(id, metadata) {
    const request = {
      namespace: id.namespace,
      properties: metadata?.properties
    };
    const response = await this.client.request({
      method: "POST",
      path: `${this.prefix}/namespaces`,
      body: request
    });
    return response.data;
  }
  async dropNamespace(id) {
    await this.client.request({
      method: "DELETE",
      path: `${this.prefix}/namespaces/${namespaceToPath(id.namespace)}`
    });
  }
  async loadNamespaceMetadata(id) {
    const response = await this.client.request({
      method: "GET",
      path: `${this.prefix}/namespaces/${namespaceToPath(id.namespace)}`
    });
    return {
      properties: response.data.properties
    };
  }
  async namespaceExists(id) {
    try {
      await this.client.request({
        method: "HEAD",
        path: `${this.prefix}/namespaces/${namespaceToPath(id.namespace)}`
      });
      return true;
    } catch (error) {
      if (error instanceof IcebergError && error.status === 404) {
        return false;
      }
      throw error;
    }
  }
  async createNamespaceIfNotExists(id, metadata) {
    try {
      return await this.createNamespace(id, metadata);
    } catch (error) {
      if (error instanceof IcebergError && error.status === 409) {
        return;
      }
      throw error;
    }
  }
};
function namespaceToPath2(namespace) {
  return namespace.join("");
}
var TableOperations = class {
  constructor(client, prefix = "", accessDelegation) {
    this.client = client;
    this.prefix = prefix;
    this.accessDelegation = accessDelegation;
  }
  async listTables(namespace) {
    const response = await this.client.request({
      method: "GET",
      path: `${this.prefix}/namespaces/${namespaceToPath2(namespace.namespace)}/tables`
    });
    return response.data.identifiers;
  }
  async createTable(namespace, request) {
    const headers = {};
    if (this.accessDelegation) {
      headers["X-Iceberg-Access-Delegation"] = this.accessDelegation;
    }
    const response = await this.client.request({
      method: "POST",
      path: `${this.prefix}/namespaces/${namespaceToPath2(namespace.namespace)}/tables`,
      body: request,
      headers
    });
    return response.data.metadata;
  }
  async updateTable(id, request) {
    const response = await this.client.request({
      method: "POST",
      path: `${this.prefix}/namespaces/${namespaceToPath2(id.namespace)}/tables/${id.name}`,
      body: request
    });
    return {
      "metadata-location": response.data["metadata-location"],
      metadata: response.data.metadata
    };
  }
  async dropTable(id, options) {
    await this.client.request({
      method: "DELETE",
      path: `${this.prefix}/namespaces/${namespaceToPath2(id.namespace)}/tables/${id.name}`,
      query: {
        purgeRequested: String(options?.purge ?? false)
      }
    });
  }
  async loadTable(id) {
    const headers = {};
    if (this.accessDelegation) {
      headers["X-Iceberg-Access-Delegation"] = this.accessDelegation;
    }
    const response = await this.client.request({
      method: "GET",
      path: `${this.prefix}/namespaces/${namespaceToPath2(id.namespace)}/tables/${id.name}`,
      headers
    });
    return response.data.metadata;
  }
  async tableExists(id) {
    const headers = {};
    if (this.accessDelegation) {
      headers["X-Iceberg-Access-Delegation"] = this.accessDelegation;
    }
    try {
      await this.client.request({
        method: "HEAD",
        path: `${this.prefix}/namespaces/${namespaceToPath2(id.namespace)}/tables/${id.name}`,
        headers
      });
      return true;
    } catch (error) {
      if (error instanceof IcebergError && error.status === 404) {
        return false;
      }
      throw error;
    }
  }
  async createTableIfNotExists(namespace, request) {
    try {
      return await this.createTable(namespace, request);
    } catch (error) {
      if (error instanceof IcebergError && error.status === 409) {
        return await this.loadTable({
          namespace: namespace.namespace,
          name: request.name
        });
      }
      throw error;
    }
  }
};
var IcebergRestCatalog = class {
  /**
   * Creates a new Iceberg REST Catalog client.
   *
   * @param options - Configuration options for the catalog client
   */
  constructor(options) {
    let prefix = "v1";
    if (options.catalogName) {
      prefix += `/${options.catalogName}`;
    }
    const baseUrl = options.baseUrl.endsWith("/") ? options.baseUrl : `${options.baseUrl}/`;
    this.client = createFetchClient({
      baseUrl,
      auth: options.auth,
      fetchImpl: options.fetch
    });
    this.accessDelegation = options.accessDelegation?.join(",");
    this.namespaceOps = new NamespaceOperations(this.client, prefix);
    this.tableOps = new TableOperations(this.client, prefix, this.accessDelegation);
  }
  /**
   * Lists all namespaces in the catalog.
   *
   * @param parent - Optional parent namespace to list children under
   * @returns Array of namespace identifiers
   *
   * @example
   * ```typescript
   * // List all top-level namespaces
   * const namespaces = await catalog.listNamespaces();
   *
   * // List namespaces under a parent
   * const children = await catalog.listNamespaces({ namespace: ['analytics'] });
   * ```
   */
  async listNamespaces(parent) {
    return this.namespaceOps.listNamespaces(parent);
  }
  /**
   * Creates a new namespace in the catalog.
   *
   * @param id - Namespace identifier to create
   * @param metadata - Optional metadata properties for the namespace
   * @returns Response containing the created namespace and its properties
   *
   * @example
   * ```typescript
   * const response = await catalog.createNamespace(
   *   { namespace: ['analytics'] },
   *   { properties: { owner: 'data-team' } }
   * );
   * console.log(response.namespace); // ['analytics']
   * console.log(response.properties); // { owner: 'data-team', ... }
   * ```
   */
  async createNamespace(id, metadata) {
    return this.namespaceOps.createNamespace(id, metadata);
  }
  /**
   * Drops a namespace from the catalog.
   *
   * The namespace must be empty (contain no tables) before it can be dropped.
   *
   * @param id - Namespace identifier to drop
   *
   * @example
   * ```typescript
   * await catalog.dropNamespace({ namespace: ['analytics'] });
   * ```
   */
  async dropNamespace(id) {
    await this.namespaceOps.dropNamespace(id);
  }
  /**
   * Loads metadata for a namespace.
   *
   * @param id - Namespace identifier to load
   * @returns Namespace metadata including properties
   *
   * @example
   * ```typescript
   * const metadata = await catalog.loadNamespaceMetadata({ namespace: ['analytics'] });
   * console.log(metadata.properties);
   * ```
   */
  async loadNamespaceMetadata(id) {
    return this.namespaceOps.loadNamespaceMetadata(id);
  }
  /**
   * Lists all tables in a namespace.
   *
   * @param namespace - Namespace identifier to list tables from
   * @returns Array of table identifiers
   *
   * @example
   * ```typescript
   * const tables = await catalog.listTables({ namespace: ['analytics'] });
   * console.log(tables); // [{ namespace: ['analytics'], name: 'events' }, ...]
   * ```
   */
  async listTables(namespace) {
    return this.tableOps.listTables(namespace);
  }
  /**
   * Creates a new table in the catalog.
   *
   * @param namespace - Namespace to create the table in
   * @param request - Table creation request including name, schema, partition spec, etc.
   * @returns Table metadata for the created table
   *
   * @example
   * ```typescript
   * const metadata = await catalog.createTable(
   *   { namespace: ['analytics'] },
   *   {
   *     name: 'events',
   *     schema: {
   *       type: 'struct',
   *       fields: [
   *         { id: 1, name: 'id', type: 'long', required: true },
   *         { id: 2, name: 'timestamp', type: 'timestamp', required: true }
   *       ],
   *       'schema-id': 0
   *     },
   *     'partition-spec': {
   *       'spec-id': 0,
   *       fields: [
   *         { source_id: 2, field_id: 1000, name: 'ts_day', transform: 'day' }
   *       ]
   *     }
   *   }
   * );
   * ```
   */
  async createTable(namespace, request) {
    return this.tableOps.createTable(namespace, request);
  }
  /**
   * Updates an existing table's metadata.
   *
   * Can update the schema, partition spec, or properties of a table.
   *
   * @param id - Table identifier to update
   * @param request - Update request with fields to modify
   * @returns Response containing the metadata location and updated table metadata
   *
   * @example
   * ```typescript
   * const response = await catalog.updateTable(
   *   { namespace: ['analytics'], name: 'events' },
   *   {
   *     properties: { 'read.split.target-size': '134217728' }
   *   }
   * );
   * console.log(response['metadata-location']); // s3://...
   * console.log(response.metadata); // TableMetadata object
   * ```
   */
  async updateTable(id, request) {
    return this.tableOps.updateTable(id, request);
  }
  /**
   * Drops a table from the catalog.
   *
   * @param id - Table identifier to drop
   *
   * @example
   * ```typescript
   * await catalog.dropTable({ namespace: ['analytics'], name: 'events' });
   * ```
   */
  async dropTable(id, options) {
    await this.tableOps.dropTable(id, options);
  }
  /**
   * Loads metadata for a table.
   *
   * @param id - Table identifier to load
   * @returns Table metadata including schema, partition spec, location, etc.
   *
   * @example
   * ```typescript
   * const metadata = await catalog.loadTable({ namespace: ['analytics'], name: 'events' });
   * console.log(metadata.schema);
   * console.log(metadata.location);
   * ```
   */
  async loadTable(id) {
    return this.tableOps.loadTable(id);
  }
  /**
   * Checks if a namespace exists in the catalog.
   *
   * @param id - Namespace identifier to check
   * @returns True if the namespace exists, false otherwise
   *
   * @example
   * ```typescript
   * const exists = await catalog.namespaceExists({ namespace: ['analytics'] });
   * console.log(exists); // true or false
   * ```
   */
  async namespaceExists(id) {
    return this.namespaceOps.namespaceExists(id);
  }
  /**
   * Checks if a table exists in the catalog.
   *
   * @param id - Table identifier to check
   * @returns True if the table exists, false otherwise
   *
   * @example
   * ```typescript
   * const exists = await catalog.tableExists({ namespace: ['analytics'], name: 'events' });
   * console.log(exists); // true or false
   * ```
   */
  async tableExists(id) {
    return this.tableOps.tableExists(id);
  }
  /**
   * Creates a namespace if it does not exist.
   *
   * If the namespace already exists, returns void. If created, returns the response.
   *
   * @param id - Namespace identifier to create
   * @param metadata - Optional metadata properties for the namespace
   * @returns Response containing the created namespace and its properties, or void if it already exists
   *
   * @example
   * ```typescript
   * const response = await catalog.createNamespaceIfNotExists(
   *   { namespace: ['analytics'] },
   *   { properties: { owner: 'data-team' } }
   * );
   * if (response) {
   *   console.log('Created:', response.namespace);
   * } else {
   *   console.log('Already exists');
   * }
   * ```
   */
  async createNamespaceIfNotExists(id, metadata) {
    return this.namespaceOps.createNamespaceIfNotExists(id, metadata);
  }
  /**
   * Creates a table if it does not exist.
   *
   * If the table already exists, returns its metadata instead.
   *
   * @param namespace - Namespace to create the table in
   * @param request - Table creation request including name, schema, partition spec, etc.
   * @returns Table metadata for the created or existing table
   *
   * @example
   * ```typescript
   * const metadata = await catalog.createTableIfNotExists(
   *   { namespace: ['analytics'] },
   *   {
   *     name: 'events',
   *     schema: {
   *       type: 'struct',
   *       fields: [
   *         { id: 1, name: 'id', type: 'long', required: true },
   *         { id: 2, name: 'timestamp', type: 'timestamp', required: true }
   *       ],
   *       'schema-id': 0
   *     }
   *   }
   * );
   * ```
   */
  async createTableIfNotExists(namespace, request) {
    return this.tableOps.createTableIfNotExists(namespace, request);
  }
};

// C:/Users/Jmarcum/AppData/Local/deno/npm/registry.npmjs.org/@supabase/storage-js/2.98.0/dist/index.mjs
var StorageError = class extends Error {
  constructor(message, namespace = "storage", status, statusCode) {
    super(message);
    this.__isStorageError = true;
    this.namespace = namespace;
    this.name = namespace === "vectors" ? "StorageVectorsError" : "StorageError";
    this.status = status;
    this.statusCode = statusCode;
  }
};
function isStorageError(error) {
  return typeof error === "object" && error !== null && "__isStorageError" in error;
}
var StorageApiError = class extends StorageError {
  constructor(message, status, statusCode, namespace = "storage") {
    super(message, namespace, status, statusCode);
    this.name = namespace === "vectors" ? "StorageVectorsApiError" : "StorageApiError";
    this.status = status;
    this.statusCode = statusCode;
  }
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      statusCode: this.statusCode
    };
  }
};
var StorageUnknownError = class extends StorageError {
  constructor(message, originalError, namespace = "storage") {
    super(message, namespace);
    this.name = namespace === "vectors" ? "StorageVectorsUnknownError" : "StorageUnknownError";
    this.originalError = originalError;
  }
};
var resolveFetch2 = (customFetch) => {
  if (customFetch) return (...args) => customFetch(...args);
  return (...args) => fetch(...args);
};
var isPlainObject = (value) => {
  if (typeof value !== "object" || value === null) return false;
  const prototype = Object.getPrototypeOf(value);
  return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in value) && !(Symbol.iterator in value);
};
var recursiveToCamel = (item) => {
  if (Array.isArray(item)) return item.map((el) => recursiveToCamel(el));
  else if (typeof item === "function" || item !== Object(item)) return item;
  const result = {};
  Object.entries(item).forEach(([key, value]) => {
    const newKey = key.replace(/([-_][a-z])/gi, (c) => c.toUpperCase().replace(/[-_]/g, ""));
    result[newKey] = recursiveToCamel(value);
  });
  return result;
};
var isValidBucketName = (bucketName) => {
  if (!bucketName || typeof bucketName !== "string") return false;
  if (bucketName.length === 0 || bucketName.length > 100) return false;
  if (bucketName.trim() !== bucketName) return false;
  if (bucketName.includes("/") || bucketName.includes("\\")) return false;
  return /^[\w!.\*'() &$@=;:+,?-]+$/.test(bucketName);
};
function _typeof2(o) {
  "@babel/helpers - typeof";
  return _typeof2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o$1) {
    return typeof o$1;
  } : function(o$1) {
    return o$1 && "function" == typeof Symbol && o$1.constructor === Symbol && o$1 !== Symbol.prototype ? "symbol" : typeof o$1;
  }, _typeof2(o);
}
function toPrimitive2(t, r) {
  if ("object" != _typeof2(t) || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != _typeof2(i)) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
function toPropertyKey2(t) {
  var i = toPrimitive2(t, "string");
  return "symbol" == _typeof2(i) ? i : i + "";
}
function _defineProperty2(e, r, t) {
  return (r = toPropertyKey2(r)) in e ? Object.defineProperty(e, r, {
    value: t,
    enumerable: true,
    configurable: true,
    writable: true
  }) : e[r] = t, e;
}
function ownKeys2(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function(r$1) {
      return Object.getOwnPropertyDescriptor(e, r$1).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread22(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys2(Object(t), true).forEach(function(r$1) {
      _defineProperty2(e, r$1, t[r$1]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys2(Object(t)).forEach(function(r$1) {
      Object.defineProperty(e, r$1, Object.getOwnPropertyDescriptor(t, r$1));
    });
  }
  return e;
}
var _getErrorMessage = (err) => {
  var _err$error;
  return err.msg || err.message || err.error_description || (typeof err.error === "string" ? err.error : (_err$error = err.error) === null || _err$error === void 0 ? void 0 : _err$error.message) || JSON.stringify(err);
};
var handleError = async (error, reject, options, namespace) => {
  if (error && typeof error === "object" && "status" in error && "ok" in error && typeof error.status === "number" && !(options === null || options === void 0 ? void 0 : options.noResolveJson)) {
    const responseError = error;
    const status = responseError.status || 500;
    if (typeof responseError.json === "function") responseError.json().then((err) => {
      const statusCode = (err === null || err === void 0 ? void 0 : err.statusCode) || (err === null || err === void 0 ? void 0 : err.code) || status + "";
      reject(new StorageApiError(_getErrorMessage(err), status, statusCode, namespace));
    }).catch(() => {
      if (namespace === "vectors") {
        const statusCode = status + "";
        reject(new StorageApiError(responseError.statusText || `HTTP ${status} error`, status, statusCode, namespace));
      } else {
        const statusCode = status + "";
        reject(new StorageApiError(responseError.statusText || `HTTP ${status} error`, status, statusCode, namespace));
      }
    });
    else {
      const statusCode = status + "";
      reject(new StorageApiError(responseError.statusText || `HTTP ${status} error`, status, statusCode, namespace));
    }
  } else reject(new StorageUnknownError(_getErrorMessage(error), error, namespace));
};
var _getRequestParams = (method, options, parameters, body) => {
  const params = {
    method,
    headers: (options === null || options === void 0 ? void 0 : options.headers) || {}
  };
  if (method === "GET" || method === "HEAD" || !body) return _objectSpread22(_objectSpread22({}, params), parameters);
  if (isPlainObject(body)) {
    params.headers = _objectSpread22({
      "Content-Type": "application/json"
    }, options === null || options === void 0 ? void 0 : options.headers);
    params.body = JSON.stringify(body);
  } else params.body = body;
  if (options === null || options === void 0 ? void 0 : options.duplex) params.duplex = options.duplex;
  return _objectSpread22(_objectSpread22({}, params), parameters);
};
async function _handleRequest(fetcher, method, url, options, parameters, body, namespace) {
  return new Promise((resolve, reject) => {
    fetcher(url, _getRequestParams(method, options, parameters, body)).then((result) => {
      if (!result.ok) throw result;
      if (options === null || options === void 0 ? void 0 : options.noResolveJson) return result;
      if (namespace === "vectors") {
        const contentType = result.headers.get("content-type");
        if (result.headers.get("content-length") === "0" || result.status === 204) return {};
        if (!contentType || !contentType.includes("application/json")) return {};
      }
      return result.json();
    }).then((data) => resolve(data)).catch((error) => handleError(error, reject, options, namespace));
  });
}
function createFetchApi(namespace = "storage") {
  return {
    get: async (fetcher, url, options, parameters) => {
      return _handleRequest(fetcher, "GET", url, options, parameters, void 0, namespace);
    },
    post: async (fetcher, url, body, options, parameters) => {
      return _handleRequest(fetcher, "POST", url, options, parameters, body, namespace);
    },
    put: async (fetcher, url, body, options, parameters) => {
      return _handleRequest(fetcher, "PUT", url, options, parameters, body, namespace);
    },
    head: async (fetcher, url, options, parameters) => {
      return _handleRequest(fetcher, "HEAD", url, _objectSpread22(_objectSpread22({}, options), {}, {
        noResolveJson: true
      }), parameters, void 0, namespace);
    },
    remove: async (fetcher, url, body, options, parameters) => {
      return _handleRequest(fetcher, "DELETE", url, options, parameters, body, namespace);
    }
  };
}
var defaultApi = createFetchApi("storage");
var { get, post, put, head, remove } = defaultApi;
var vectorsApi = createFetchApi("vectors");
var BaseApiClient = class {
  /**
  * Creates a new BaseApiClient instance
  * @param url - Base URL for API requests
  * @param headers - Default headers for API requests
  * @param fetch - Optional custom fetch implementation
  * @param namespace - Error namespace ('storage' or 'vectors')
  */
  constructor(url, headers = {}, fetch$1, namespace = "storage") {
    this.shouldThrowOnError = false;
    this.url = url;
    this.headers = headers;
    this.fetch = resolveFetch2(fetch$1);
    this.namespace = namespace;
  }
  /**
  * Enable throwing errors instead of returning them.
  * When enabled, errors are thrown instead of returned in { data, error } format.
  *
  * @returns this - For method chaining
  */
  throwOnError() {
    this.shouldThrowOnError = true;
    return this;
  }
  /**
  * Set an HTTP header for the request.
  * Creates a shallow copy of headers to avoid mutating shared state.
  *
  * @param name - Header name
  * @param value - Header value
  * @returns this - For method chaining
  */
  setHeader(name, value) {
    this.headers = _objectSpread22(_objectSpread22({}, this.headers), {}, {
      [name]: value
    });
    return this;
  }
  /**
  * Handles API operation with standardized error handling
  * Eliminates repetitive try-catch blocks across all API methods
  *
  * This wrapper:
  * 1. Executes the operation
  * 2. Returns { data, error: null } on success
  * 3. Returns { data: null, error } on failure (if shouldThrowOnError is false)
  * 4. Throws error on failure (if shouldThrowOnError is true)
  *
  * @typeParam T - The expected data type from the operation
  * @param operation - Async function that performs the API call
  * @returns Promise with { data, error } tuple
  *
  * @example
  * ```typescript
  * async listBuckets() {
  *   return this.handleOperation(async () => {
  *     return await get(this.fetch, `${this.url}/bucket`, {
  *       headers: this.headers,
  *     })
  *   })
  * }
  * ```
  */
  async handleOperation(operation) {
    var _this = this;
    try {
      return {
        data: await operation(),
        error: null
      };
    } catch (error) {
      if (_this.shouldThrowOnError) throw error;
      if (isStorageError(error)) return {
        data: null,
        error
      };
      throw error;
    }
  }
};
var StreamDownloadBuilder = class {
  constructor(downloadFn, shouldThrowOnError) {
    this.downloadFn = downloadFn;
    this.shouldThrowOnError = shouldThrowOnError;
  }
  then(onfulfilled, onrejected) {
    return this.execute().then(onfulfilled, onrejected);
  }
  async execute() {
    var _this = this;
    try {
      return {
        data: (await _this.downloadFn()).body,
        error: null
      };
    } catch (error) {
      if (_this.shouldThrowOnError) throw error;
      if (isStorageError(error)) return {
        data: null,
        error
      };
      throw error;
    }
  }
};
var _Symbol$toStringTag;
_Symbol$toStringTag = Symbol.toStringTag;
var BlobDownloadBuilder = class {
  constructor(downloadFn, shouldThrowOnError) {
    this.downloadFn = downloadFn;
    this.shouldThrowOnError = shouldThrowOnError;
    this[_Symbol$toStringTag] = "BlobDownloadBuilder";
    this.promise = null;
  }
  asStream() {
    return new StreamDownloadBuilder(this.downloadFn, this.shouldThrowOnError);
  }
  then(onfulfilled, onrejected) {
    return this.getPromise().then(onfulfilled, onrejected);
  }
  catch(onrejected) {
    return this.getPromise().catch(onrejected);
  }
  finally(onfinally) {
    return this.getPromise().finally(onfinally);
  }
  getPromise() {
    if (!this.promise) this.promise = this.execute();
    return this.promise;
  }
  async execute() {
    var _this = this;
    try {
      return {
        data: await (await _this.downloadFn()).blob(),
        error: null
      };
    } catch (error) {
      if (_this.shouldThrowOnError) throw error;
      if (isStorageError(error)) return {
        data: null,
        error
      };
      throw error;
    }
  }
};
var DEFAULT_SEARCH_OPTIONS = {
  limit: 100,
  offset: 0,
  sortBy: {
    column: "name",
    order: "asc"
  }
};
var DEFAULT_FILE_OPTIONS = {
  cacheControl: "3600",
  contentType: "text/plain;charset=UTF-8",
  upsert: false
};
var StorageFileApi = class extends BaseApiClient {
  constructor(url, headers = {}, bucketId, fetch$1) {
    super(url, headers, fetch$1, "storage");
    this.bucketId = bucketId;
  }
  /**
  * Uploads a file to an existing bucket or replaces an existing file at the specified path with a new one.
  *
  * @param method HTTP method.
  * @param path The relative file path. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
  * @param fileBody The body of the file to be stored in the bucket.
  */
  async uploadOrUpdate(method, path, fileBody, fileOptions) {
    var _this = this;
    return _this.handleOperation(async () => {
      let body;
      const options = _objectSpread22(_objectSpread22({}, DEFAULT_FILE_OPTIONS), fileOptions);
      let headers = _objectSpread22(_objectSpread22({}, _this.headers), method === "POST" && {
        "x-upsert": String(options.upsert)
      });
      const metadata = options.metadata;
      if (typeof Blob !== "undefined" && fileBody instanceof Blob) {
        body = new FormData();
        body.append("cacheControl", options.cacheControl);
        if (metadata) body.append("metadata", _this.encodeMetadata(metadata));
        body.append("", fileBody);
      } else if (typeof FormData !== "undefined" && fileBody instanceof FormData) {
        body = fileBody;
        if (!body.has("cacheControl")) body.append("cacheControl", options.cacheControl);
        if (metadata && !body.has("metadata")) body.append("metadata", _this.encodeMetadata(metadata));
      } else {
        body = fileBody;
        headers["cache-control"] = `max-age=${options.cacheControl}`;
        headers["content-type"] = options.contentType;
        if (metadata) headers["x-metadata"] = _this.toBase64(_this.encodeMetadata(metadata));
        if ((typeof ReadableStream !== "undefined" && body instanceof ReadableStream || body && typeof body === "object" && "pipe" in body && typeof body.pipe === "function") && !options.duplex) options.duplex = "half";
      }
      if (fileOptions === null || fileOptions === void 0 ? void 0 : fileOptions.headers) headers = _objectSpread22(_objectSpread22({}, headers), fileOptions.headers);
      const cleanPath = _this._removeEmptyFolders(path);
      const _path = _this._getFinalPath(cleanPath);
      const data = await (method == "PUT" ? put : post)(_this.fetch, `${_this.url}/object/${_path}`, body, _objectSpread22({
        headers
      }, (options === null || options === void 0 ? void 0 : options.duplex) ? {
        duplex: options.duplex
      } : {}));
      return {
        path: cleanPath,
        id: data.Id,
        fullPath: data.Key
      };
    });
  }
  /**
  * Uploads a file to an existing bucket.
  *
  * @category File Buckets
  * @param path The file path, including the file name. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
  * @param fileBody The body of the file to be stored in the bucket.
  * @param fileOptions Optional file upload options including cacheControl, contentType, upsert, and metadata.
  * @returns Promise with response containing file path, id, and fullPath or error
  *
  * @example Upload file
  * ```js
  * const avatarFile = event.target.files[0]
  * const { data, error } = await supabase
  *   .storage
  *   .from('avatars')
  *   .upload('public/avatar1.png', avatarFile, {
  *     cacheControl: '3600',
  *     upsert: false
  *   })
  * ```
  *
  * Response:
  * ```json
  * {
  *   "data": {
  *     "path": "public/avatar1.png",
  *     "fullPath": "avatars/public/avatar1.png"
  *   },
  *   "error": null
  * }
  * ```
  *
  * @example Upload file using `ArrayBuffer` from base64 file data
  * ```js
  * import { decode } from 'base64-arraybuffer'
  *
  * const { data, error } = await supabase
  *   .storage
  *   .from('avatars')
  *   .upload('public/avatar1.png', decode('base64FileData'), {
  *     contentType: 'image/png'
  *   })
  * ```
  */
  async upload(path, fileBody, fileOptions) {
    return this.uploadOrUpdate("POST", path, fileBody, fileOptions);
  }
  /**
  * Upload a file with a token generated from `createSignedUploadUrl`.
  *
  * @category File Buckets
  * @param path The file path, including the file name. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
  * @param token The token generated from `createSignedUploadUrl`
  * @param fileBody The body of the file to be stored in the bucket.
  * @param fileOptions HTTP headers (cacheControl, contentType, etc.).
  * **Note:** The `upsert` option has no effect here. To enable upsert behavior,
  * pass `{ upsert: true }` when calling `createSignedUploadUrl()` instead.
  * @returns Promise with response containing file path and fullPath or error
  *
  * @example Upload to a signed URL
  * ```js
  * const { data, error } = await supabase
  *   .storage
  *   .from('avatars')
  *   .uploadToSignedUrl('folder/cat.jpg', 'token-from-createSignedUploadUrl', file)
  * ```
  *
  * Response:
  * ```json
  * {
  *   "data": {
  *     "path": "folder/cat.jpg",
  *     "fullPath": "avatars/folder/cat.jpg"
  *   },
  *   "error": null
  * }
  * ```
  */
  async uploadToSignedUrl(path, token, fileBody, fileOptions) {
    var _this3 = this;
    const cleanPath = _this3._removeEmptyFolders(path);
    const _path = _this3._getFinalPath(cleanPath);
    const url = new URL(_this3.url + `/object/upload/sign/${_path}`);
    url.searchParams.set("token", token);
    return _this3.handleOperation(async () => {
      let body;
      const options = _objectSpread22({
        upsert: DEFAULT_FILE_OPTIONS.upsert
      }, fileOptions);
      const headers = _objectSpread22(_objectSpread22({}, _this3.headers), {
        "x-upsert": String(options.upsert)
      });
      if (typeof Blob !== "undefined" && fileBody instanceof Blob) {
        body = new FormData();
        body.append("cacheControl", options.cacheControl);
        body.append("", fileBody);
      } else if (typeof FormData !== "undefined" && fileBody instanceof FormData) {
        body = fileBody;
        body.append("cacheControl", options.cacheControl);
      } else {
        body = fileBody;
        headers["cache-control"] = `max-age=${options.cacheControl}`;
        headers["content-type"] = options.contentType;
      }
      return {
        path: cleanPath,
        fullPath: (await put(_this3.fetch, url.toString(), body, {
          headers
        })).Key
      };
    });
  }
  /**
  * Creates a signed upload URL.
  * Signed upload URLs can be used to upload files to the bucket without further authentication.
  * They are valid for 2 hours.
  *
  * @category File Buckets
  * @param path The file path, including the current file name. For example `folder/image.png`.
  * @param options.upsert If set to true, allows the file to be overwritten if it already exists.
  * @returns Promise with response containing signed upload URL, token, and path or error
  *
  * @example Create Signed Upload URL
  * ```js
  * const { data, error } = await supabase
  *   .storage
  *   .from('avatars')
  *   .createSignedUploadUrl('folder/cat.jpg')
  * ```
  *
  * Response:
  * ```json
  * {
  *   "data": {
  *     "signedUrl": "https://example.supabase.co/storage/v1/object/upload/sign/avatars/folder/cat.jpg?token=<TOKEN>",
  *     "path": "folder/cat.jpg",
  *     "token": "<TOKEN>"
  *   },
  *   "error": null
  * }
  * ```
  */
  async createSignedUploadUrl(path, options) {
    var _this4 = this;
    return _this4.handleOperation(async () => {
      let _path = _this4._getFinalPath(path);
      const headers = _objectSpread22({}, _this4.headers);
      if (options === null || options === void 0 ? void 0 : options.upsert) headers["x-upsert"] = "true";
      const data = await post(_this4.fetch, `${_this4.url}/object/upload/sign/${_path}`, {}, {
        headers
      });
      const url = new URL(_this4.url + data.url);
      const token = url.searchParams.get("token");
      if (!token) throw new StorageError("No token returned by API");
      return {
        signedUrl: url.toString(),
        path,
        token
      };
    });
  }
  /**
  * Replaces an existing file at the specified path with a new one.
  *
  * @category File Buckets
  * @param path The relative file path. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to update.
  * @param fileBody The body of the file to be stored in the bucket.
  * @param fileOptions Optional file upload options including cacheControl, contentType, upsert, and metadata.
  * @returns Promise with response containing file path, id, and fullPath or error
  *
  * @example Update file
  * ```js
  * const avatarFile = event.target.files[0]
  * const { data, error } = await supabase
  *   .storage
  *   .from('avatars')
  *   .update('public/avatar1.png', avatarFile, {
  *     cacheControl: '3600',
  *     upsert: true
  *   })
  * ```
  *
  * Response:
  * ```json
  * {
  *   "data": {
  *     "path": "public/avatar1.png",
  *     "fullPath": "avatars/public/avatar1.png"
  *   },
  *   "error": null
  * }
  * ```
  *
  * @example Update file using `ArrayBuffer` from base64 file data
  * ```js
  * import {decode} from 'base64-arraybuffer'
  *
  * const { data, error } = await supabase
  *   .storage
  *   .from('avatars')
  *   .update('public/avatar1.png', decode('base64FileData'), {
  *     contentType: 'image/png'
  *   })
  * ```
  */
  async update(path, fileBody, fileOptions) {
    return this.uploadOrUpdate("PUT", path, fileBody, fileOptions);
  }
  /**
  * Moves an existing file to a new path in the same bucket.
  *
  * @category File Buckets
  * @param fromPath The original file path, including the current file name. For example `folder/image.png`.
  * @param toPath The new file path, including the new file name. For example `folder/image-new.png`.
  * @param options The destination options.
  * @returns Promise with response containing success message or error
  *
  * @example Move file
  * ```js
  * const { data, error } = await supabase
  *   .storage
  *   .from('avatars')
  *   .move('public/avatar1.png', 'private/avatar2.png')
  * ```
  *
  * Response:
  * ```json
  * {
  *   "data": {
  *     "message": "Successfully moved"
  *   },
  *   "error": null
  * }
  * ```
  */
  async move(fromPath, toPath, options) {
    var _this6 = this;
    return _this6.handleOperation(async () => {
      return await post(_this6.fetch, `${_this6.url}/object/move`, {
        bucketId: _this6.bucketId,
        sourceKey: fromPath,
        destinationKey: toPath,
        destinationBucket: options === null || options === void 0 ? void 0 : options.destinationBucket
      }, {
        headers: _this6.headers
      });
    });
  }
  /**
  * Copies an existing file to a new path in the same bucket.
  *
  * @category File Buckets
  * @param fromPath The original file path, including the current file name. For example `folder/image.png`.
  * @param toPath The new file path, including the new file name. For example `folder/image-copy.png`.
  * @param options The destination options.
  * @returns Promise with response containing copied file path or error
  *
  * @example Copy file
  * ```js
  * const { data, error } = await supabase
  *   .storage
  *   .from('avatars')
  *   .copy('public/avatar1.png', 'private/avatar2.png')
  * ```
  *
  * Response:
  * ```json
  * {
  *   "data": {
  *     "path": "avatars/private/avatar2.png"
  *   },
  *   "error": null
  * }
  * ```
  */
  async copy(fromPath, toPath, options) {
    var _this7 = this;
    return _this7.handleOperation(async () => {
      return {
        path: (await post(_this7.fetch, `${_this7.url}/object/copy`, {
          bucketId: _this7.bucketId,
          sourceKey: fromPath,
          destinationKey: toPath,
          destinationBucket: options === null || options === void 0 ? void 0 : options.destinationBucket
        }, {
          headers: _this7.headers
        })).Key
      };
    });
  }
  /**
  * Creates a signed URL. Use a signed URL to share a file for a fixed amount of time.
  *
  * @category File Buckets
  * @param path The file path, including the current file name. For example `folder/image.png`.
  * @param expiresIn The number of seconds until the signed URL expires. For example, `60` for a URL which is valid for one minute.
  * @param options.download triggers the file as a download if set to true. Set this parameter as the name of the file if you want to trigger the download with a different filename.
  * @param options.transform Transform the asset before serving it to the client.
  * @returns Promise with response containing signed URL or error
  *
  * @example Create Signed URL
  * ```js
  * const { data, error } = await supabase
  *   .storage
  *   .from('avatars')
  *   .createSignedUrl('folder/avatar1.png', 60)
  * ```
  *
  * Response:
  * ```json
  * {
  *   "data": {
  *     "signedUrl": "https://example.supabase.co/storage/v1/object/sign/avatars/folder/avatar1.png?token=<TOKEN>"
  *   },
  *   "error": null
  * }
  * ```
  *
  * @example Create a signed URL for an asset with transformations
  * ```js
  * const { data } = await supabase
  *   .storage
  *   .from('avatars')
  *   .createSignedUrl('folder/avatar1.png', 60, {
  *     transform: {
  *       width: 100,
  *       height: 100,
  *     }
  *   })
  * ```
  *
  * @example Create a signed URL which triggers the download of the asset
  * ```js
  * const { data } = await supabase
  *   .storage
  *   .from('avatars')
  *   .createSignedUrl('folder/avatar1.png', 60, {
  *     download: true,
  *   })
  * ```
  */
  async createSignedUrl(path, expiresIn, options) {
    var _this8 = this;
    return _this8.handleOperation(async () => {
      let _path = _this8._getFinalPath(path);
      let data = await post(_this8.fetch, `${_this8.url}/object/sign/${_path}`, _objectSpread22({
        expiresIn
      }, (options === null || options === void 0 ? void 0 : options.transform) ? {
        transform: options.transform
      } : {}), {
        headers: _this8.headers
      });
      const downloadQueryParam = (options === null || options === void 0 ? void 0 : options.download) ? `&download=${options.download === true ? "" : options.download}` : "";
      return {
        signedUrl: encodeURI(`${_this8.url}${data.signedURL}${downloadQueryParam}`)
      };
    });
  }
  /**
  * Creates multiple signed URLs. Use a signed URL to share a file for a fixed amount of time.
  *
  * @category File Buckets
  * @param paths The file paths to be downloaded, including the current file names. For example `['folder/image.png', 'folder2/image2.png']`.
  * @param expiresIn The number of seconds until the signed URLs expire. For example, `60` for URLs which are valid for one minute.
  * @param options.download triggers the file as a download if set to true. Set this parameter as the name of the file if you want to trigger the download with a different filename.
  * @returns Promise with response containing array of objects with signedUrl, path, and error or error
  *
  * @example Create Signed URLs
  * ```js
  * const { data, error } = await supabase
  *   .storage
  *   .from('avatars')
  *   .createSignedUrls(['folder/avatar1.png', 'folder/avatar2.png'], 60)
  * ```
  *
  * Response:
  * ```json
  * {
  *   "data": [
  *     {
  *       "error": null,
  *       "path": "folder/avatar1.png",
  *       "signedURL": "/object/sign/avatars/folder/avatar1.png?token=<TOKEN>",
  *       "signedUrl": "https://example.supabase.co/storage/v1/object/sign/avatars/folder/avatar1.png?token=<TOKEN>"
  *     },
  *     {
  *       "error": null,
  *       "path": "folder/avatar2.png",
  *       "signedURL": "/object/sign/avatars/folder/avatar2.png?token=<TOKEN>",
  *       "signedUrl": "https://example.supabase.co/storage/v1/object/sign/avatars/folder/avatar2.png?token=<TOKEN>"
  *     }
  *   ],
  *   "error": null
  * }
  * ```
  */
  async createSignedUrls(paths, expiresIn, options) {
    var _this9 = this;
    return _this9.handleOperation(async () => {
      const data = await post(_this9.fetch, `${_this9.url}/object/sign/${_this9.bucketId}`, {
        expiresIn,
        paths
      }, {
        headers: _this9.headers
      });
      const downloadQueryParam = (options === null || options === void 0 ? void 0 : options.download) ? `&download=${options.download === true ? "" : options.download}` : "";
      return data.map((datum) => _objectSpread22(_objectSpread22({}, datum), {}, {
        signedUrl: datum.signedURL ? encodeURI(`${_this9.url}${datum.signedURL}${downloadQueryParam}`) : null
      }));
    });
  }
  /**
  * Downloads a file from a private bucket. For public buckets, make a request to the URL returned from `getPublicUrl` instead.
  *
  * @category File Buckets
  * @param path The full path and file name of the file to be downloaded. For example `folder/image.png`.
  * @param options.transform Transform the asset before serving it to the client.
  * @param parameters Additional fetch parameters like signal for cancellation. Supports standard fetch options including cache control.
  * @returns BlobDownloadBuilder instance for downloading the file
  *
  * @example Download file
  * ```js
  * const { data, error } = await supabase
  *   .storage
  *   .from('avatars')
  *   .download('folder/avatar1.png')
  * ```
  *
  * Response:
  * ```json
  * {
  *   "data": <BLOB>,
  *   "error": null
  * }
  * ```
  *
  * @example Download file with transformations
  * ```js
  * const { data, error } = await supabase
  *   .storage
  *   .from('avatars')
  *   .download('folder/avatar1.png', {
  *     transform: {
  *       width: 100,
  *       height: 100,
  *       quality: 80
  *     }
  *   })
  * ```
  *
  * @example Download with cache control (useful in Edge Functions)
  * ```js
  * const { data, error } = await supabase
  *   .storage
  *   .from('avatars')
  *   .download('folder/avatar1.png', {}, { cache: 'no-store' })
  * ```
  *
  * @example Download with abort signal
  * ```js
  * const controller = new AbortController()
  * setTimeout(() => controller.abort(), 5000)
  *
  * const { data, error } = await supabase
  *   .storage
  *   .from('avatars')
  *   .download('folder/avatar1.png', {}, { signal: controller.signal })
  * ```
  */
  download(path, options, parameters) {
    const renderPath = typeof (options === null || options === void 0 ? void 0 : options.transform) !== "undefined" ? "render/image/authenticated" : "object";
    const transformationQuery = this.transformOptsToQueryString((options === null || options === void 0 ? void 0 : options.transform) || {});
    const queryString = transformationQuery ? `?${transformationQuery}` : "";
    const _path = this._getFinalPath(path);
    const downloadFn = () => get(this.fetch, `${this.url}/${renderPath}/${_path}${queryString}`, {
      headers: this.headers,
      noResolveJson: true
    }, parameters);
    return new BlobDownloadBuilder(downloadFn, this.shouldThrowOnError);
  }
  /**
  * Retrieves the details of an existing file.
  *
  * @category File Buckets
  * @param path The file path, including the file name. For example `folder/image.png`.
  * @returns Promise with response containing file metadata or error
  *
  * @example Get file info
  * ```js
  * const { data, error } = await supabase
  *   .storage
  *   .from('avatars')
  *   .info('folder/avatar1.png')
  * ```
  */
  async info(path) {
    var _this10 = this;
    const _path = _this10._getFinalPath(path);
    return _this10.handleOperation(async () => {
      return recursiveToCamel(await get(_this10.fetch, `${_this10.url}/object/info/${_path}`, {
        headers: _this10.headers
      }));
    });
  }
  /**
  * Checks the existence of a file.
  *
  * @category File Buckets
  * @param path The file path, including the file name. For example `folder/image.png`.
  * @returns Promise with response containing boolean indicating file existence or error
  *
  * @example Check file existence
  * ```js
  * const { data, error } = await supabase
  *   .storage
  *   .from('avatars')
  *   .exists('folder/avatar1.png')
  * ```
  */
  async exists(path) {
    var _this11 = this;
    const _path = _this11._getFinalPath(path);
    try {
      await head(_this11.fetch, `${_this11.url}/object/${_path}`, {
        headers: _this11.headers
      });
      return {
        data: true,
        error: null
      };
    } catch (error) {
      if (_this11.shouldThrowOnError) throw error;
      if (isStorageError(error) && error instanceof StorageUnknownError) {
        const originalError = error.originalError;
        if ([
          400,
          404
        ].includes(originalError === null || originalError === void 0 ? void 0 : originalError.status)) return {
          data: false,
          error
        };
      }
      throw error;
    }
  }
  /**
  * A simple convenience function to get the URL for an asset in a public bucket. If you do not want to use this function, you can construct the public URL by concatenating the bucket URL with the path to the asset.
  * This function does not verify if the bucket is public. If a public URL is created for a bucket which is not public, you will not be able to download the asset.
  *
  * @category File Buckets
  * @param path The path and name of the file to generate the public URL for. For example `folder/image.png`.
  * @param options.download Triggers the file as a download if set to true. Set this parameter as the name of the file if you want to trigger the download with a different filename.
  * @param options.transform Transform the asset before serving it to the client.
  * @returns Object with public URL
  *
  * @example Returns the URL for an asset in a public bucket
  * ```js
  * const { data } = supabase
  *   .storage
  *   .from('public-bucket')
  *   .getPublicUrl('folder/avatar1.png')
  * ```
  *
  * Response:
  * ```json
  * {
  *   "data": {
  *     "publicUrl": "https://example.supabase.co/storage/v1/object/public/public-bucket/folder/avatar1.png"
  *   }
  * }
  * ```
  *
  * @example Returns the URL for an asset in a public bucket with transformations
  * ```js
  * const { data } = supabase
  *   .storage
  *   .from('public-bucket')
  *   .getPublicUrl('folder/avatar1.png', {
  *     transform: {
  *       width: 100,
  *       height: 100,
  *     }
  *   })
  * ```
  *
  * @example Returns the URL which triggers the download of an asset in a public bucket
  * ```js
  * const { data } = supabase
  *   .storage
  *   .from('public-bucket')
  *   .getPublicUrl('folder/avatar1.png', {
  *     download: true,
  *   })
  * ```
  */
  getPublicUrl(path, options) {
    const _path = this._getFinalPath(path);
    const _queryString = [];
    const downloadQueryParam = (options === null || options === void 0 ? void 0 : options.download) ? `download=${options.download === true ? "" : options.download}` : "";
    if (downloadQueryParam !== "") _queryString.push(downloadQueryParam);
    const renderPath = typeof (options === null || options === void 0 ? void 0 : options.transform) !== "undefined" ? "render/image" : "object";
    const transformationQuery = this.transformOptsToQueryString((options === null || options === void 0 ? void 0 : options.transform) || {});
    if (transformationQuery !== "") _queryString.push(transformationQuery);
    let queryString = _queryString.join("&");
    if (queryString !== "") queryString = `?${queryString}`;
    return {
      data: {
        publicUrl: encodeURI(`${this.url}/${renderPath}/public/${_path}${queryString}`)
      }
    };
  }
  /**
  * Deletes files within the same bucket
  *
  * @category File Buckets
  * @param paths An array of files to delete, including the path and file name. For example [`'folder/image.png'`].
  * @returns Promise with response containing array of deleted file objects or error
  *
  * @example Delete file
  * ```js
  * const { data, error } = await supabase
  *   .storage
  *   .from('avatars')
  *   .remove(['folder/avatar1.png'])
  * ```
  *
  * Response:
  * ```json
  * {
  *   "data": [],
  *   "error": null
  * }
  * ```
  */
  async remove(paths) {
    var _this12 = this;
    return _this12.handleOperation(async () => {
      return await remove(_this12.fetch, `${_this12.url}/object/${_this12.bucketId}`, {
        prefixes: paths
      }, {
        headers: _this12.headers
      });
    });
  }
  /**
  * Get file metadata
  * @param id the file id to retrieve metadata
  */
  /**
  * Update file metadata
  * @param id the file id to update metadata
  * @param meta the new file metadata
  */
  /**
  * Lists all the files and folders within a path of the bucket.
  *
  * @category File Buckets
  * @param path The folder path.
  * @param options Search options including limit (defaults to 100), offset, sortBy, and search
  * @param parameters Optional fetch parameters including signal for cancellation
  * @returns Promise with response containing array of files or error
  *
  * @example List files in a bucket
  * ```js
  * const { data, error } = await supabase
  *   .storage
  *   .from('avatars')
  *   .list('folder', {
  *     limit: 100,
  *     offset: 0,
  *     sortBy: { column: 'name', order: 'asc' },
  *   })
  * ```
  *
  * Response:
  * ```json
  * {
  *   "data": [
  *     {
  *       "name": "avatar1.png",
  *       "id": "e668cf7f-821b-4a2f-9dce-7dfa5dd1cfd2",
  *       "updated_at": "2024-05-22T23:06:05.580Z",
  *       "created_at": "2024-05-22T23:04:34.443Z",
  *       "last_accessed_at": "2024-05-22T23:04:34.443Z",
  *       "metadata": {
  *         "eTag": "\"c5e8c553235d9af30ef4f6e280790b92\"",
  *         "size": 32175,
  *         "mimetype": "image/png",
  *         "cacheControl": "max-age=3600",
  *         "lastModified": "2024-05-22T23:06:05.574Z",
  *         "contentLength": 32175,
  *         "httpStatusCode": 200
  *       }
  *     }
  *   ],
  *   "error": null
  * }
  * ```
  *
  * @example Search files in a bucket
  * ```js
  * const { data, error } = await supabase
  *   .storage
  *   .from('avatars')
  *   .list('folder', {
  *     limit: 100,
  *     offset: 0,
  *     sortBy: { column: 'name', order: 'asc' },
  *     search: 'jon'
  *   })
  * ```
  */
  async list(path, options, parameters) {
    var _this13 = this;
    return _this13.handleOperation(async () => {
      const body = _objectSpread22(_objectSpread22(_objectSpread22({}, DEFAULT_SEARCH_OPTIONS), options), {}, {
        prefix: path || ""
      });
      return await post(_this13.fetch, `${_this13.url}/object/list/${_this13.bucketId}`, body, {
        headers: _this13.headers
      }, parameters);
    });
  }
  /**
  * @experimental this method signature might change in the future
  *
  * @category File Buckets
  * @param options search options
  * @param parameters
  */
  async listV2(options, parameters) {
    var _this14 = this;
    return _this14.handleOperation(async () => {
      const body = _objectSpread22({}, options);
      return await post(_this14.fetch, `${_this14.url}/object/list-v2/${_this14.bucketId}`, body, {
        headers: _this14.headers
      }, parameters);
    });
  }
  encodeMetadata(metadata) {
    return JSON.stringify(metadata);
  }
  toBase64(data) {
    if (typeof Buffer !== "undefined") return Buffer.from(data).toString("base64");
    return btoa(data);
  }
  _getFinalPath(path) {
    return `${this.bucketId}/${path.replace(/^\/+/, "")}`;
  }
  _removeEmptyFolders(path) {
    return path.replace(/^\/|\/$/g, "").replace(/\/+/g, "/");
  }
  transformOptsToQueryString(transform) {
    const params = [];
    if (transform.width) params.push(`width=${transform.width}`);
    if (transform.height) params.push(`height=${transform.height}`);
    if (transform.resize) params.push(`resize=${transform.resize}`);
    if (transform.format) params.push(`format=${transform.format}`);
    if (transform.quality) params.push(`quality=${transform.quality}`);
    return params.join("&");
  }
};
var version2 = "2.98.0";
var DEFAULT_HEADERS = {
  "X-Client-Info": `storage-js/${version2}`
};
var StorageBucketApi = class extends BaseApiClient {
  constructor(url, headers = {}, fetch$1, opts) {
    const baseUrl = new URL(url);
    if (opts === null || opts === void 0 ? void 0 : opts.useNewHostname) {
      if (/supabase\.(co|in|red)$/.test(baseUrl.hostname) && !baseUrl.hostname.includes("storage.supabase.")) baseUrl.hostname = baseUrl.hostname.replace("supabase.", "storage.supabase.");
    }
    const finalUrl = baseUrl.href.replace(/\/$/, "");
    const finalHeaders = _objectSpread22(_objectSpread22({}, DEFAULT_HEADERS), headers);
    super(finalUrl, finalHeaders, fetch$1, "storage");
  }
  /**
  * Retrieves the details of all Storage buckets within an existing project.
  *
  * @category File Buckets
  * @param options Query parameters for listing buckets
  * @param options.limit Maximum number of buckets to return
  * @param options.offset Number of buckets to skip
  * @param options.sortColumn Column to sort by ('id', 'name', 'created_at', 'updated_at')
  * @param options.sortOrder Sort order ('asc' or 'desc')
  * @param options.search Search term to filter bucket names
  * @returns Promise with response containing array of buckets or error
  *
  * @example List buckets
  * ```js
  * const { data, error } = await supabase
  *   .storage
  *   .listBuckets()
  * ```
  *
  * @example List buckets with options
  * ```js
  * const { data, error } = await supabase
  *   .storage
  *   .listBuckets({
  *     limit: 10,
  *     offset: 0,
  *     sortColumn: 'created_at',
  *     sortOrder: 'desc',
  *     search: 'prod'
  *   })
  * ```
  */
  async listBuckets(options) {
    var _this = this;
    return _this.handleOperation(async () => {
      const queryString = _this.listBucketOptionsToQueryString(options);
      return await get(_this.fetch, `${_this.url}/bucket${queryString}`, {
        headers: _this.headers
      });
    });
  }
  /**
  * Retrieves the details of an existing Storage bucket.
  *
  * @category File Buckets
  * @param id The unique identifier of the bucket you would like to retrieve.
  * @returns Promise with response containing bucket details or error
  *
  * @example Get bucket
  * ```js
  * const { data, error } = await supabase
  *   .storage
  *   .getBucket('avatars')
  * ```
  *
  * Response:
  * ```json
  * {
  *   "data": {
  *     "id": "avatars",
  *     "name": "avatars",
  *     "owner": "",
  *     "public": false,
  *     "file_size_limit": 1024,
  *     "allowed_mime_types": [
  *       "image/png"
  *     ],
  *     "created_at": "2024-05-22T22:26:05.100Z",
  *     "updated_at": "2024-05-22T22:26:05.100Z"
  *   },
  *   "error": null
  * }
  * ```
  */
  async getBucket(id) {
    var _this2 = this;
    return _this2.handleOperation(async () => {
      return await get(_this2.fetch, `${_this2.url}/bucket/${id}`, {
        headers: _this2.headers
      });
    });
  }
  /**
  * Creates a new Storage bucket
  *
  * @category File Buckets
  * @param id A unique identifier for the bucket you are creating.
  * @param options.public The visibility of the bucket. Public buckets don't require an authorization token to download objects, but still require a valid token for all other operations. By default, buckets are private.
  * @param options.fileSizeLimit specifies the max file size in bytes that can be uploaded to this bucket.
  * The global file size limit takes precedence over this value.
  * The default value is null, which doesn't set a per bucket file size limit.
  * @param options.allowedMimeTypes specifies the allowed mime types that this bucket can accept during upload.
  * The default value is null, which allows files with all mime types to be uploaded.
  * Each mime type specified can be a wildcard, e.g. image/*, or a specific mime type, e.g. image/png.
  * @param options.type (private-beta) specifies the bucket type. see `BucketType` for more details.
  *   - default bucket type is `STANDARD`
  * @returns Promise with response containing newly created bucket name or error
  *
  * @example Create bucket
  * ```js
  * const { data, error } = await supabase
  *   .storage
  *   .createBucket('avatars', {
  *     public: false,
  *     allowedMimeTypes: ['image/png'],
  *     fileSizeLimit: 1024
  *   })
  * ```
  *
  * Response:
  * ```json
  * {
  *   "data": {
  *     "name": "avatars"
  *   },
  *   "error": null
  * }
  * ```
  */
  async createBucket(id, options = {
    public: false
  }) {
    var _this3 = this;
    return _this3.handleOperation(async () => {
      return await post(_this3.fetch, `${_this3.url}/bucket`, {
        id,
        name: id,
        type: options.type,
        public: options.public,
        file_size_limit: options.fileSizeLimit,
        allowed_mime_types: options.allowedMimeTypes
      }, {
        headers: _this3.headers
      });
    });
  }
  /**
  * Updates a Storage bucket
  *
  * @category File Buckets
  * @param id A unique identifier for the bucket you are updating.
  * @param options.public The visibility of the bucket. Public buckets don't require an authorization token to download objects, but still require a valid token for all other operations.
  * @param options.fileSizeLimit specifies the max file size in bytes that can be uploaded to this bucket.
  * The global file size limit takes precedence over this value.
  * The default value is null, which doesn't set a per bucket file size limit.
  * @param options.allowedMimeTypes specifies the allowed mime types that this bucket can accept during upload.
  * The default value is null, which allows files with all mime types to be uploaded.
  * Each mime type specified can be a wildcard, e.g. image/*, or a specific mime type, e.g. image/png.
  * @returns Promise with response containing success message or error
  *
  * @example Update bucket
  * ```js
  * const { data, error } = await supabase
  *   .storage
  *   .updateBucket('avatars', {
  *     public: false,
  *     allowedMimeTypes: ['image/png'],
  *     fileSizeLimit: 1024
  *   })
  * ```
  *
  * Response:
  * ```json
  * {
  *   "data": {
  *     "message": "Successfully updated"
  *   },
  *   "error": null
  * }
  * ```
  */
  async updateBucket(id, options) {
    var _this4 = this;
    return _this4.handleOperation(async () => {
      return await put(_this4.fetch, `${_this4.url}/bucket/${id}`, {
        id,
        name: id,
        public: options.public,
        file_size_limit: options.fileSizeLimit,
        allowed_mime_types: options.allowedMimeTypes
      }, {
        headers: _this4.headers
      });
    });
  }
  /**
  * Removes all objects inside a single bucket.
  *
  * @category File Buckets
  * @param id The unique identifier of the bucket you would like to empty.
  * @returns Promise with success message or error
  *
  * @example Empty bucket
  * ```js
  * const { data, error } = await supabase
  *   .storage
  *   .emptyBucket('avatars')
  * ```
  *
  * Response:
  * ```json
  * {
  *   "data": {
  *     "message": "Successfully emptied"
  *   },
  *   "error": null
  * }
  * ```
  */
  async emptyBucket(id) {
    var _this5 = this;
    return _this5.handleOperation(async () => {
      return await post(_this5.fetch, `${_this5.url}/bucket/${id}/empty`, {}, {
        headers: _this5.headers
      });
    });
  }
  /**
  * Deletes an existing bucket. A bucket can't be deleted with existing objects inside it.
  * You must first `empty()` the bucket.
  *
  * @category File Buckets
  * @param id The unique identifier of the bucket you would like to delete.
  * @returns Promise with success message or error
  *
  * @example Delete bucket
  * ```js
  * const { data, error } = await supabase
  *   .storage
  *   .deleteBucket('avatars')
  * ```
  *
  * Response:
  * ```json
  * {
  *   "data": {
  *     "message": "Successfully deleted"
  *   },
  *   "error": null
  * }
  * ```
  */
  async deleteBucket(id) {
    var _this6 = this;
    return _this6.handleOperation(async () => {
      return await remove(_this6.fetch, `${_this6.url}/bucket/${id}`, {}, {
        headers: _this6.headers
      });
    });
  }
  listBucketOptionsToQueryString(options) {
    const params = {};
    if (options) {
      if ("limit" in options) params.limit = String(options.limit);
      if ("offset" in options) params.offset = String(options.offset);
      if (options.search) params.search = options.search;
      if (options.sortColumn) params.sortColumn = options.sortColumn;
      if (options.sortOrder) params.sortOrder = options.sortOrder;
    }
    return Object.keys(params).length > 0 ? "?" + new URLSearchParams(params).toString() : "";
  }
};
var StorageAnalyticsClient = class extends BaseApiClient {
  /**
  * @alpha
  *
  * Creates a new StorageAnalyticsClient instance
  *
  * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
  *
  * @category Analytics Buckets
  * @param url - The base URL for the storage API
  * @param headers - HTTP headers to include in requests
  * @param fetch - Optional custom fetch implementation
  *
  * @example
  * ```typescript
  * const client = new StorageAnalyticsClient(url, headers)
  * ```
  */
  constructor(url, headers = {}, fetch$1) {
    const finalUrl = url.replace(/\/$/, "");
    const finalHeaders = _objectSpread22(_objectSpread22({}, DEFAULT_HEADERS), headers);
    super(finalUrl, finalHeaders, fetch$1, "storage");
  }
  /**
  * @alpha
  *
  * Creates a new analytics bucket using Iceberg tables
  * Analytics buckets are optimized for analytical queries and data processing
  *
  * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
  *
  * @category Analytics Buckets
  * @param name A unique name for the bucket you are creating
  * @returns Promise with response containing newly created analytics bucket or error
  *
  * @example Create analytics bucket
  * ```js
  * const { data, error } = await supabase
  *   .storage
  *   .analytics
  *   .createBucket('analytics-data')
  * ```
  *
  * Response:
  * ```json
  * {
  *   "data": {
  *     "name": "analytics-data",
  *     "type": "ANALYTICS",
  *     "format": "iceberg",
  *     "created_at": "2024-05-22T22:26:05.100Z",
  *     "updated_at": "2024-05-22T22:26:05.100Z"
  *   },
  *   "error": null
  * }
  * ```
  */
  async createBucket(name) {
    var _this = this;
    return _this.handleOperation(async () => {
      return await post(_this.fetch, `${_this.url}/bucket`, {
        name
      }, {
        headers: _this.headers
      });
    });
  }
  /**
  * @alpha
  *
  * Retrieves the details of all Analytics Storage buckets within an existing project
  * Only returns buckets of type 'ANALYTICS'
  *
  * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
  *
  * @category Analytics Buckets
  * @param options Query parameters for listing buckets
  * @param options.limit Maximum number of buckets to return
  * @param options.offset Number of buckets to skip
  * @param options.sortColumn Column to sort by ('name', 'created_at', 'updated_at')
  * @param options.sortOrder Sort order ('asc' or 'desc')
  * @param options.search Search term to filter bucket names
  * @returns Promise with response containing array of analytics buckets or error
  *
  * @example List analytics buckets
  * ```js
  * const { data, error } = await supabase
  *   .storage
  *   .analytics
  *   .listBuckets({
  *     limit: 10,
  *     offset: 0,
  *     sortColumn: 'created_at',
  *     sortOrder: 'desc'
  *   })
  * ```
  *
  * Response:
  * ```json
  * {
  *   "data": [
  *     {
  *       "name": "analytics-data",
  *       "type": "ANALYTICS",
  *       "format": "iceberg",
  *       "created_at": "2024-05-22T22:26:05.100Z",
  *       "updated_at": "2024-05-22T22:26:05.100Z"
  *     }
  *   ],
  *   "error": null
  * }
  * ```
  */
  async listBuckets(options) {
    var _this2 = this;
    return _this2.handleOperation(async () => {
      const queryParams = new URLSearchParams();
      if ((options === null || options === void 0 ? void 0 : options.limit) !== void 0) queryParams.set("limit", options.limit.toString());
      if ((options === null || options === void 0 ? void 0 : options.offset) !== void 0) queryParams.set("offset", options.offset.toString());
      if (options === null || options === void 0 ? void 0 : options.sortColumn) queryParams.set("sortColumn", options.sortColumn);
      if (options === null || options === void 0 ? void 0 : options.sortOrder) queryParams.set("sortOrder", options.sortOrder);
      if (options === null || options === void 0 ? void 0 : options.search) queryParams.set("search", options.search);
      const queryString = queryParams.toString();
      const url = queryString ? `${_this2.url}/bucket?${queryString}` : `${_this2.url}/bucket`;
      return await get(_this2.fetch, url, {
        headers: _this2.headers
      });
    });
  }
  /**
  * @alpha
  *
  * Deletes an existing analytics bucket
  * A bucket can't be deleted with existing objects inside it
  * You must first empty the bucket before deletion
  *
  * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
  *
  * @category Analytics Buckets
  * @param bucketName The unique identifier of the bucket you would like to delete
  * @returns Promise with response containing success message or error
  *
  * @example Delete analytics bucket
  * ```js
  * const { data, error } = await supabase
  *   .storage
  *   .analytics
  *   .deleteBucket('analytics-data')
  * ```
  *
  * Response:
  * ```json
  * {
  *   "data": {
  *     "message": "Successfully deleted"
  *   },
  *   "error": null
  * }
  * ```
  */
  async deleteBucket(bucketName) {
    var _this3 = this;
    return _this3.handleOperation(async () => {
      return await remove(_this3.fetch, `${_this3.url}/bucket/${bucketName}`, {}, {
        headers: _this3.headers
      });
    });
  }
  /**
  * @alpha
  *
  * Get an Iceberg REST Catalog client configured for a specific analytics bucket
  * Use this to perform advanced table and namespace operations within the bucket
  * The returned client provides full access to the Apache Iceberg REST Catalog API
  * with the Supabase `{ data, error }` pattern for consistent error handling on all operations.
  *
  * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
  *
  * @category Analytics Buckets
  * @param bucketName - The name of the analytics bucket (warehouse) to connect to
  * @returns The wrapped Iceberg catalog client
  * @throws {StorageError} If the bucket name is invalid
  *
  * @example Get catalog and create table
  * ```js
  * // First, create an analytics bucket
  * const { data: bucket, error: bucketError } = await supabase
  *   .storage
  *   .analytics
  *   .createBucket('analytics-data')
  *
  * // Get the Iceberg catalog for that bucket
  * const catalog = supabase.storage.analytics.from('analytics-data')
  *
  * // Create a namespace
  * const { error: nsError } = await catalog.createNamespace({ namespace: ['default'] })
  *
  * // Create a table with schema
  * const { data: tableMetadata, error: tableError } = await catalog.createTable(
  *   { namespace: ['default'] },
  *   {
  *     name: 'events',
  *     schema: {
  *       type: 'struct',
  *       fields: [
  *         { id: 1, name: 'id', type: 'long', required: true },
  *         { id: 2, name: 'timestamp', type: 'timestamp', required: true },
  *         { id: 3, name: 'user_id', type: 'string', required: false }
  *       ],
  *       'schema-id': 0,
  *       'identifier-field-ids': [1]
  *     },
  *     'partition-spec': {
  *       'spec-id': 0,
  *       fields: []
  *     },
  *     'write-order': {
  *       'order-id': 0,
  *       fields: []
  *     },
  *     properties: {
  *       'write.format.default': 'parquet'
  *     }
  *   }
  * )
  * ```
  *
  * @example List tables in namespace
  * ```js
  * const catalog = supabase.storage.analytics.from('analytics-data')
  *
  * // List all tables in the default namespace
  * const { data: tables, error: listError } = await catalog.listTables({ namespace: ['default'] })
  * if (listError) {
  *   if (listError.isNotFound()) {
  *     console.log('Namespace not found')
  *   }
  *   return
  * }
  * console.log(tables) // [{ namespace: ['default'], name: 'events' }]
  * ```
  *
  * @example Working with namespaces
  * ```js
  * const catalog = supabase.storage.analytics.from('analytics-data')
  *
  * // List all namespaces
  * const { data: namespaces } = await catalog.listNamespaces()
  *
  * // Create namespace with properties
  * await catalog.createNamespace(
  *   { namespace: ['production'] },
  *   { properties: { owner: 'data-team', env: 'prod' } }
  * )
  * ```
  *
  * @example Cleanup operations
  * ```js
  * const catalog = supabase.storage.analytics.from('analytics-data')
  *
  * // Drop table with purge option (removes all data)
  * const { error: dropError } = await catalog.dropTable(
  *   { namespace: ['default'], name: 'events' },
  *   { purge: true }
  * )
  *
  * if (dropError?.isNotFound()) {
  *   console.log('Table does not exist')
  * }
  *
  * // Drop namespace (must be empty)
  * await catalog.dropNamespace({ namespace: ['default'] })
  * ```
  *
  * @remarks
  * This method provides a bridge between Supabase's bucket management and the standard
  * Apache Iceberg REST Catalog API. The bucket name maps to the Iceberg warehouse parameter.
  * All authentication and configuration is handled automatically using your Supabase credentials.
  *
  * **Error Handling**: Invalid bucket names throw immediately. All catalog
  * operations return `{ data, error }` where errors are `IcebergError` instances from iceberg-js.
  * Use helper methods like `error.isNotFound()` or check `error.status` for specific error handling.
  * Use `.throwOnError()` on the analytics client if you prefer exceptions for catalog operations.
  *
  * **Cleanup Operations**: When using `dropTable`, the `purge: true` option permanently
  * deletes all table data. Without it, the table is marked as deleted but data remains.
  *
  * **Library Dependency**: The returned catalog wraps `IcebergRestCatalog` from iceberg-js.
  * For complete API documentation and advanced usage, refer to the
  * [iceberg-js documentation](https://supabase.github.io/iceberg-js/).
  */
  from(bucketName) {
    var _this4 = this;
    if (!isValidBucketName(bucketName)) throw new StorageError("Invalid bucket name: File, folder, and bucket names must follow AWS object key naming guidelines and should avoid the use of any other characters.");
    const catalog = new IcebergRestCatalog({
      baseUrl: this.url,
      catalogName: bucketName,
      auth: {
        type: "custom",
        getHeaders: async () => _this4.headers
      },
      fetch: this.fetch
    });
    const shouldThrowOnError = this.shouldThrowOnError;
    return new Proxy(catalog, {
      get(target, prop) {
        const value = target[prop];
        if (typeof value !== "function") return value;
        return async (...args) => {
          try {
            return {
              data: await value.apply(target, args),
              error: null
            };
          } catch (error) {
            if (shouldThrowOnError) throw error;
            return {
              data: null,
              error
            };
          }
        };
      }
    });
  }
};
var VectorIndexApi = class extends BaseApiClient {
  /** Creates a new VectorIndexApi instance */
  constructor(url, headers = {}, fetch$1) {
    const finalUrl = url.replace(/\/$/, "");
    const finalHeaders = _objectSpread22(_objectSpread22({}, DEFAULT_HEADERS), {}, {
      "Content-Type": "application/json"
    }, headers);
    super(finalUrl, finalHeaders, fetch$1, "vectors");
  }
  /** Creates a new vector index within a bucket */
  async createIndex(options) {
    var _this = this;
    return _this.handleOperation(async () => {
      return await vectorsApi.post(_this.fetch, `${_this.url}/CreateIndex`, options, {
        headers: _this.headers
      }) || {};
    });
  }
  /** Retrieves metadata for a specific vector index */
  async getIndex(vectorBucketName, indexName) {
    var _this2 = this;
    return _this2.handleOperation(async () => {
      return await vectorsApi.post(_this2.fetch, `${_this2.url}/GetIndex`, {
        vectorBucketName,
        indexName
      }, {
        headers: _this2.headers
      });
    });
  }
  /** Lists vector indexes within a bucket with optional filtering and pagination */
  async listIndexes(options) {
    var _this3 = this;
    return _this3.handleOperation(async () => {
      return await vectorsApi.post(_this3.fetch, `${_this3.url}/ListIndexes`, options, {
        headers: _this3.headers
      });
    });
  }
  /** Deletes a vector index and all its data */
  async deleteIndex(vectorBucketName, indexName) {
    var _this4 = this;
    return _this4.handleOperation(async () => {
      return await vectorsApi.post(_this4.fetch, `${_this4.url}/DeleteIndex`, {
        vectorBucketName,
        indexName
      }, {
        headers: _this4.headers
      }) || {};
    });
  }
};
var VectorDataApi = class extends BaseApiClient {
  /** Creates a new VectorDataApi instance */
  constructor(url, headers = {}, fetch$1) {
    const finalUrl = url.replace(/\/$/, "");
    const finalHeaders = _objectSpread22(_objectSpread22({}, DEFAULT_HEADERS), {}, {
      "Content-Type": "application/json"
    }, headers);
    super(finalUrl, finalHeaders, fetch$1, "vectors");
  }
  /** Inserts or updates vectors in batch (1-500 per request) */
  async putVectors(options) {
    var _this = this;
    if (options.vectors.length < 1 || options.vectors.length > 500) throw new Error("Vector batch size must be between 1 and 500 items");
    return _this.handleOperation(async () => {
      return await vectorsApi.post(_this.fetch, `${_this.url}/PutVectors`, options, {
        headers: _this.headers
      }) || {};
    });
  }
  /** Retrieves vectors by their keys in batch */
  async getVectors(options) {
    var _this2 = this;
    return _this2.handleOperation(async () => {
      return await vectorsApi.post(_this2.fetch, `${_this2.url}/GetVectors`, options, {
        headers: _this2.headers
      });
    });
  }
  /** Lists vectors in an index with pagination */
  async listVectors(options) {
    var _this3 = this;
    if (options.segmentCount !== void 0) {
      if (options.segmentCount < 1 || options.segmentCount > 16) throw new Error("segmentCount must be between 1 and 16");
      if (options.segmentIndex !== void 0) {
        if (options.segmentIndex < 0 || options.segmentIndex >= options.segmentCount) throw new Error(`segmentIndex must be between 0 and ${options.segmentCount - 1}`);
      }
    }
    return _this3.handleOperation(async () => {
      return await vectorsApi.post(_this3.fetch, `${_this3.url}/ListVectors`, options, {
        headers: _this3.headers
      });
    });
  }
  /** Queries for similar vectors using approximate nearest neighbor search */
  async queryVectors(options) {
    var _this4 = this;
    return _this4.handleOperation(async () => {
      return await vectorsApi.post(_this4.fetch, `${_this4.url}/QueryVectors`, options, {
        headers: _this4.headers
      });
    });
  }
  /** Deletes vectors by their keys in batch (1-500 per request) */
  async deleteVectors(options) {
    var _this5 = this;
    if (options.keys.length < 1 || options.keys.length > 500) throw new Error("Keys batch size must be between 1 and 500 items");
    return _this5.handleOperation(async () => {
      return await vectorsApi.post(_this5.fetch, `${_this5.url}/DeleteVectors`, options, {
        headers: _this5.headers
      }) || {};
    });
  }
};
var VectorBucketApi = class extends BaseApiClient {
  /** Creates a new VectorBucketApi instance */
  constructor(url, headers = {}, fetch$1) {
    const finalUrl = url.replace(/\/$/, "");
    const finalHeaders = _objectSpread22(_objectSpread22({}, DEFAULT_HEADERS), {}, {
      "Content-Type": "application/json"
    }, headers);
    super(finalUrl, finalHeaders, fetch$1, "vectors");
  }
  /** Creates a new vector bucket */
  async createBucket(vectorBucketName) {
    var _this = this;
    return _this.handleOperation(async () => {
      return await vectorsApi.post(_this.fetch, `${_this.url}/CreateVectorBucket`, {
        vectorBucketName
      }, {
        headers: _this.headers
      }) || {};
    });
  }
  /** Retrieves metadata for a specific vector bucket */
  async getBucket(vectorBucketName) {
    var _this2 = this;
    return _this2.handleOperation(async () => {
      return await vectorsApi.post(_this2.fetch, `${_this2.url}/GetVectorBucket`, {
        vectorBucketName
      }, {
        headers: _this2.headers
      });
    });
  }
  /** Lists vector buckets with optional filtering and pagination */
  async listBuckets(options = {}) {
    var _this3 = this;
    return _this3.handleOperation(async () => {
      return await vectorsApi.post(_this3.fetch, `${_this3.url}/ListVectorBuckets`, options, {
        headers: _this3.headers
      });
    });
  }
  /** Deletes a vector bucket (must be empty first) */
  async deleteBucket(vectorBucketName) {
    var _this4 = this;
    return _this4.handleOperation(async () => {
      return await vectorsApi.post(_this4.fetch, `${_this4.url}/DeleteVectorBucket`, {
        vectorBucketName
      }, {
        headers: _this4.headers
      }) || {};
    });
  }
};
var StorageVectorsClient = class extends VectorBucketApi {
  /**
  * @alpha
  *
  * Creates a StorageVectorsClient that can manage buckets, indexes, and vectors.
  *
  * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
  *
  * @category Vector Buckets
  * @param url - Base URL of the Storage Vectors REST API.
  * @param options.headers - Optional headers (for example `Authorization`) applied to every request.
  * @param options.fetch - Optional custom `fetch` implementation for non-browser runtimes.
  *
  * @example
  * ```typescript
  * const client = new StorageVectorsClient(url, options)
  * ```
  */
  constructor(url, options = {}) {
    super(url, options.headers || {}, options.fetch);
  }
  /**
  *
  * @alpha
  *
  * Access operations for a specific vector bucket
  * Returns a scoped client for index and vector operations within the bucket
  *
  * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
  *
  * @category Vector Buckets
  * @param vectorBucketName - Name of the vector bucket
  * @returns Bucket-scoped client with index and vector operations
  *
  * @example
  * ```typescript
  * const bucket = supabase.storage.vectors.from('embeddings-prod')
  * ```
  */
  from(vectorBucketName) {
    return new VectorBucketScope(this.url, this.headers, vectorBucketName, this.fetch);
  }
  /**
  *
  * @alpha
  *
  * Creates a new vector bucket
  * Vector buckets are containers for vector indexes and their data
  *
  * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
  *
  * @category Vector Buckets
  * @param vectorBucketName - Unique name for the vector bucket
  * @returns Promise with empty response on success or error
  *
  * @example
  * ```typescript
  * const { data, error } = await supabase
  *   .storage
  *   .vectors
  *   .createBucket('embeddings-prod')
  * ```
  */
  async createBucket(vectorBucketName) {
    var _superprop_getCreateBucket = () => super.createBucket, _this = this;
    return _superprop_getCreateBucket().call(_this, vectorBucketName);
  }
  /**
  *
  * @alpha
  *
  * Retrieves metadata for a specific vector bucket
  *
  * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
  *
  * @category Vector Buckets
  * @param vectorBucketName - Name of the vector bucket
  * @returns Promise with bucket metadata or error
  *
  * @example
  * ```typescript
  * const { data, error } = await supabase
  *   .storage
  *   .vectors
  *   .getBucket('embeddings-prod')
  *
  * console.log('Bucket created:', data?.vectorBucket.creationTime)
  * ```
  */
  async getBucket(vectorBucketName) {
    var _superprop_getGetBucket = () => super.getBucket, _this2 = this;
    return _superprop_getGetBucket().call(_this2, vectorBucketName);
  }
  /**
  *
  * @alpha
  *
  * Lists all vector buckets with optional filtering and pagination
  *
  * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
  *
  * @category Vector Buckets
  * @param options - Optional filters (prefix, maxResults, nextToken)
  * @returns Promise with list of buckets or error
  *
  * @example
  * ```typescript
  * const { data, error } = await supabase
  *   .storage
  *   .vectors
  *   .listBuckets({ prefix: 'embeddings-' })
  *
  * data?.vectorBuckets.forEach(bucket => {
  *   console.log(bucket.vectorBucketName)
  * })
  * ```
  */
  async listBuckets(options = {}) {
    var _superprop_getListBuckets = () => super.listBuckets, _this3 = this;
    return _superprop_getListBuckets().call(_this3, options);
  }
  /**
  *
  * @alpha
  *
  * Deletes a vector bucket (bucket must be empty)
  * All indexes must be deleted before deleting the bucket
  *
  * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
  *
  * @category Vector Buckets
  * @param vectorBucketName - Name of the vector bucket to delete
  * @returns Promise with empty response on success or error
  *
  * @example
  * ```typescript
  * const { data, error } = await supabase
  *   .storage
  *   .vectors
  *   .deleteBucket('embeddings-old')
  * ```
  */
  async deleteBucket(vectorBucketName) {
    var _superprop_getDeleteBucket = () => super.deleteBucket, _this4 = this;
    return _superprop_getDeleteBucket().call(_this4, vectorBucketName);
  }
};
var VectorBucketScope = class extends VectorIndexApi {
  /**
  * @alpha
  *
  * Creates a helper that automatically scopes all index operations to the provided bucket.
  *
  * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
  *
  * @category Vector Buckets
  * @example
  * ```typescript
  * const bucket = supabase.storage.vectors.from('embeddings-prod')
  * ```
  */
  constructor(url, headers, vectorBucketName, fetch$1) {
    super(url, headers, fetch$1);
    this.vectorBucketName = vectorBucketName;
  }
  /**
  *
  * @alpha
  *
  * Creates a new vector index in this bucket
  * Convenience method that automatically includes the bucket name
  *
  * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
  *
  * @category Vector Buckets
  * @param options - Index configuration (vectorBucketName is automatically set)
  * @returns Promise with empty response on success or error
  *
  * @example
  * ```typescript
  * const bucket = supabase.storage.vectors.from('embeddings-prod')
  * await bucket.createIndex({
  *   indexName: 'documents-openai',
  *   dataType: 'float32',
  *   dimension: 1536,
  *   distanceMetric: 'cosine',
  *   metadataConfiguration: {
  *     nonFilterableMetadataKeys: ['raw_text']
  *   }
  * })
  * ```
  */
  async createIndex(options) {
    var _superprop_getCreateIndex = () => super.createIndex, _this5 = this;
    return _superprop_getCreateIndex().call(_this5, _objectSpread22(_objectSpread22({}, options), {}, {
      vectorBucketName: _this5.vectorBucketName
    }));
  }
  /**
  *
  * @alpha
  *
  * Lists indexes in this bucket
  * Convenience method that automatically includes the bucket name
  *
  * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
  *
  * @category Vector Buckets
  * @param options - Listing options (vectorBucketName is automatically set)
  * @returns Promise with response containing indexes array and pagination token or error
  *
  * @example
  * ```typescript
  * const bucket = supabase.storage.vectors.from('embeddings-prod')
  * const { data } = await bucket.listIndexes({ prefix: 'documents-' })
  * ```
  */
  async listIndexes(options = {}) {
    var _superprop_getListIndexes = () => super.listIndexes, _this6 = this;
    return _superprop_getListIndexes().call(_this6, _objectSpread22(_objectSpread22({}, options), {}, {
      vectorBucketName: _this6.vectorBucketName
    }));
  }
  /**
  *
  * @alpha
  *
  * Retrieves metadata for a specific index in this bucket
  * Convenience method that automatically includes the bucket name
  *
  * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
  *
  * @category Vector Buckets
  * @param indexName - Name of the index to retrieve
  * @returns Promise with index metadata or error
  *
  * @example
  * ```typescript
  * const bucket = supabase.storage.vectors.from('embeddings-prod')
  * const { data } = await bucket.getIndex('documents-openai')
  * console.log('Dimension:', data?.index.dimension)
  * ```
  */
  async getIndex(indexName) {
    var _superprop_getGetIndex = () => super.getIndex, _this7 = this;
    return _superprop_getGetIndex().call(_this7, _this7.vectorBucketName, indexName);
  }
  /**
  *
  * @alpha
  *
  * Deletes an index from this bucket
  * Convenience method that automatically includes the bucket name
  *
  * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
  *
  * @category Vector Buckets
  * @param indexName - Name of the index to delete
  * @returns Promise with empty response on success or error
  *
  * @example
  * ```typescript
  * const bucket = supabase.storage.vectors.from('embeddings-prod')
  * await bucket.deleteIndex('old-index')
  * ```
  */
  async deleteIndex(indexName) {
    var _superprop_getDeleteIndex = () => super.deleteIndex, _this8 = this;
    return _superprop_getDeleteIndex().call(_this8, _this8.vectorBucketName, indexName);
  }
  /**
  *
  * @alpha
  *
  * Access operations for a specific index within this bucket
  * Returns a scoped client for vector data operations
  *
  * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
  *
  * @category Vector Buckets
  * @param indexName - Name of the index
  * @returns Index-scoped client with vector data operations
  *
  * @example
  * ```typescript
  * const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
  *
  * // Insert vectors
  * await index.putVectors({
  *   vectors: [
  *     { key: 'doc-1', data: { float32: [...] }, metadata: { title: 'Intro' } }
  *   ]
  * })
  *
  * // Query similar vectors
  * const { data } = await index.queryVectors({
  *   queryVector: { float32: [...] },
  *   topK: 5
  * })
  * ```
  */
  index(indexName) {
    return new VectorIndexScope(this.url, this.headers, this.vectorBucketName, indexName, this.fetch);
  }
};
var VectorIndexScope = class extends VectorDataApi {
  /**
  *
  * @alpha
  *
  * Creates a helper that automatically scopes all vector operations to the provided bucket/index names.
  *
  * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
  *
  * @category Vector Buckets
  * @example
  * ```typescript
  * const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
  * ```
  */
  constructor(url, headers, vectorBucketName, indexName, fetch$1) {
    super(url, headers, fetch$1);
    this.vectorBucketName = vectorBucketName;
    this.indexName = indexName;
  }
  /**
  *
  * @alpha
  *
  * Inserts or updates vectors in this index
  * Convenience method that automatically includes bucket and index names
  *
  * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
  *
  * @category Vector Buckets
  * @param options - Vector insertion options (bucket and index names automatically set)
  * @returns Promise with empty response on success or error
  *
  * @example
  * ```typescript
  * const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
  * await index.putVectors({
  *   vectors: [
  *     {
  *       key: 'doc-1',
  *       data: { float32: [0.1, 0.2, ...] },
  *       metadata: { title: 'Introduction', page: 1 }
  *     }
  *   ]
  * })
  * ```
  */
  async putVectors(options) {
    var _superprop_getPutVectors = () => super.putVectors, _this9 = this;
    return _superprop_getPutVectors().call(_this9, _objectSpread22(_objectSpread22({}, options), {}, {
      vectorBucketName: _this9.vectorBucketName,
      indexName: _this9.indexName
    }));
  }
  /**
  *
  * @alpha
  *
  * Retrieves vectors by keys from this index
  * Convenience method that automatically includes bucket and index names
  *
  * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
  *
  * @category Vector Buckets
  * @param options - Vector retrieval options (bucket and index names automatically set)
  * @returns Promise with response containing vectors array or error
  *
  * @example
  * ```typescript
  * const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
  * const { data } = await index.getVectors({
  *   keys: ['doc-1', 'doc-2'],
  *   returnMetadata: true
  * })
  * ```
  */
  async getVectors(options) {
    var _superprop_getGetVectors = () => super.getVectors, _this10 = this;
    return _superprop_getGetVectors().call(_this10, _objectSpread22(_objectSpread22({}, options), {}, {
      vectorBucketName: _this10.vectorBucketName,
      indexName: _this10.indexName
    }));
  }
  /**
  *
  * @alpha
  *
  * Lists vectors in this index with pagination
  * Convenience method that automatically includes bucket and index names
  *
  * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
  *
  * @category Vector Buckets
  * @param options - Listing options (bucket and index names automatically set)
  * @returns Promise with response containing vectors array and pagination token or error
  *
  * @example
  * ```typescript
  * const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
  * const { data } = await index.listVectors({
  *   maxResults: 500,
  *   returnMetadata: true
  * })
  * ```
  */
  async listVectors(options = {}) {
    var _superprop_getListVectors = () => super.listVectors, _this11 = this;
    return _superprop_getListVectors().call(_this11, _objectSpread22(_objectSpread22({}, options), {}, {
      vectorBucketName: _this11.vectorBucketName,
      indexName: _this11.indexName
    }));
  }
  /**
  *
  * @alpha
  *
  * Queries for similar vectors in this index
  * Convenience method that automatically includes bucket and index names
  *
  * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
  *
  * @category Vector Buckets
  * @param options - Query options (bucket and index names automatically set)
  * @returns Promise with response containing matches array of similar vectors ordered by distance or error
  *
  * @example
  * ```typescript
  * const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
  * const { data } = await index.queryVectors({
  *   queryVector: { float32: [0.1, 0.2, ...] },
  *   topK: 5,
  *   filter: { category: 'technical' },
  *   returnDistance: true,
  *   returnMetadata: true
  * })
  * ```
  */
  async queryVectors(options) {
    var _superprop_getQueryVectors = () => super.queryVectors, _this12 = this;
    return _superprop_getQueryVectors().call(_this12, _objectSpread22(_objectSpread22({}, options), {}, {
      vectorBucketName: _this12.vectorBucketName,
      indexName: _this12.indexName
    }));
  }
  /**
  *
  * @alpha
  *
  * Deletes vectors by keys from this index
  * Convenience method that automatically includes bucket and index names
  *
  * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
  *
  * @category Vector Buckets
  * @param options - Deletion options (bucket and index names automatically set)
  * @returns Promise with empty response on success or error
  *
  * @example
  * ```typescript
  * const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
  * await index.deleteVectors({
  *   keys: ['doc-1', 'doc-2', 'doc-3']
  * })
  * ```
  */
  async deleteVectors(options) {
    var _superprop_getDeleteVectors = () => super.deleteVectors, _this13 = this;
    return _superprop_getDeleteVectors().call(_this13, _objectSpread22(_objectSpread22({}, options), {}, {
      vectorBucketName: _this13.vectorBucketName,
      indexName: _this13.indexName
    }));
  }
};
var StorageClient = class extends StorageBucketApi {
  /**
  * Creates a client for Storage buckets, files, analytics, and vectors.
  *
  * @category File Buckets
  * @example
  * ```ts
  * import { StorageClient } from '@supabase/storage-js'
  *
  * const storage = new StorageClient('https://xyzcompany.supabase.co/storage/v1', {
  *   apikey: 'public-anon-key',
  * })
  * const avatars = storage.from('avatars')
  * ```
  */
  constructor(url, headers = {}, fetch$1, opts) {
    super(url, headers, fetch$1, opts);
  }
  /**
  * Perform file operation in a bucket.
  *
  * @category File Buckets
  * @param id The bucket id to operate on.
  *
  * @example
  * ```typescript
  * const avatars = supabase.storage.from('avatars')
  * ```
  */
  from(id) {
    return new StorageFileApi(this.url, this.headers, id, this.fetch);
  }
  /**
  *
  * @alpha
  *
  * Access vector storage operations.
  *
  * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
  *
  * @category Vector Buckets
  * @returns A StorageVectorsClient instance configured with the current storage settings.
  */
  get vectors() {
    return new StorageVectorsClient(this.url + "/vector", {
      headers: this.headers,
      fetch: this.fetch
    });
  }
  /**
  *
  * @alpha
  *
  * Access analytics storage operations using Iceberg tables.
  *
  * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
  *
  * @category Analytics Buckets
  * @returns A StorageAnalyticsClient instance configured with the current storage settings.
  */
  get analytics() {
    return new StorageAnalyticsClient(this.url + "/iceberg", this.headers, this.fetch);
  }
};

// C:/Users/Jmarcum/AppData/Local/deno/npm/registry.npmjs.org/@supabase/auth-js/2.98.0/dist/module/lib/version.js
var version3 = "2.98.0";

// C:/Users/Jmarcum/AppData/Local/deno/npm/registry.npmjs.org/@supabase/auth-js/2.98.0/dist/module/lib/constants.js
var AUTO_REFRESH_TICK_DURATION_MS = 30 * 1e3;
var AUTO_REFRESH_TICK_THRESHOLD = 3;
var EXPIRY_MARGIN_MS = AUTO_REFRESH_TICK_THRESHOLD * AUTO_REFRESH_TICK_DURATION_MS;
var GOTRUE_URL = "http://localhost:9999";
var STORAGE_KEY = "supabase.auth.token";
var DEFAULT_HEADERS2 = {
  "X-Client-Info": `gotrue-js/${version3}`
};
var API_VERSION_HEADER_NAME = "X-Supabase-Api-Version";
var API_VERSIONS = {
  "2024-01-01": {
    timestamp: Date.parse("2024-01-01T00:00:00.0Z"),
    name: "2024-01-01"
  }
};
var BASE64URL_REGEX = /^([a-z0-9_-]{4})*($|[a-z0-9_-]{3}$|[a-z0-9_-]{2}$)$/i;
var JWKS_TTL = 10 * 60 * 1e3;

// C:/Users/Jmarcum/AppData/Local/deno/npm/registry.npmjs.org/@supabase/auth-js/2.98.0/dist/module/lib/errors.js
var AuthError = class extends Error {
  constructor(message, status, code) {
    super(message);
    this.__isAuthError = true;
    this.name = "AuthError";
    this.status = status;
    this.code = code;
  }
};
function isAuthError(error) {
  return typeof error === "object" && error !== null && "__isAuthError" in error;
}
var AuthApiError = class extends AuthError {
  constructor(message, status, code) {
    super(message, status, code);
    this.name = "AuthApiError";
    this.status = status;
    this.code = code;
  }
};
function isAuthApiError(error) {
  return isAuthError(error) && error.name === "AuthApiError";
}
var AuthUnknownError = class extends AuthError {
  constructor(message, originalError) {
    super(message);
    this.name = "AuthUnknownError";
    this.originalError = originalError;
  }
};
var CustomAuthError = class extends AuthError {
  constructor(message, name, status, code) {
    super(message, status, code);
    this.name = name;
    this.status = status;
  }
};
var AuthSessionMissingError = class extends CustomAuthError {
  constructor() {
    super("Auth session missing!", "AuthSessionMissingError", 400, void 0);
  }
};
function isAuthSessionMissingError(error) {
  return isAuthError(error) && error.name === "AuthSessionMissingError";
}
var AuthInvalidTokenResponseError = class extends CustomAuthError {
  constructor() {
    super("Auth session or user missing", "AuthInvalidTokenResponseError", 500, void 0);
  }
};
var AuthInvalidCredentialsError = class extends CustomAuthError {
  constructor(message) {
    super(message, "AuthInvalidCredentialsError", 400, void 0);
  }
};
var AuthImplicitGrantRedirectError = class extends CustomAuthError {
  constructor(message, details = null) {
    super(message, "AuthImplicitGrantRedirectError", 500, void 0);
    this.details = null;
    this.details = details;
  }
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      details: this.details
    };
  }
};
function isAuthImplicitGrantRedirectError(error) {
  return isAuthError(error) && error.name === "AuthImplicitGrantRedirectError";
}
var AuthPKCEGrantCodeExchangeError = class extends CustomAuthError {
  constructor(message, details = null) {
    super(message, "AuthPKCEGrantCodeExchangeError", 500, void 0);
    this.details = null;
    this.details = details;
  }
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      details: this.details
    };
  }
};
var AuthPKCECodeVerifierMissingError = class extends CustomAuthError {
  constructor() {
    super("PKCE code verifier not found in storage. This can happen if the auth flow was initiated in a different browser or device, or if the storage was cleared. For SSR frameworks (Next.js, SvelteKit, etc.), use @supabase/ssr on both the server and client to store the code verifier in cookies.", "AuthPKCECodeVerifierMissingError", 400, "pkce_code_verifier_not_found");
  }
};
var AuthRetryableFetchError = class extends CustomAuthError {
  constructor(message, status) {
    super(message, "AuthRetryableFetchError", status, void 0);
  }
};
function isAuthRetryableFetchError(error) {
  return isAuthError(error) && error.name === "AuthRetryableFetchError";
}
var AuthWeakPasswordError = class extends CustomAuthError {
  constructor(message, status, reasons) {
    super(message, "AuthWeakPasswordError", status, "weak_password");
    this.reasons = reasons;
  }
};
var AuthInvalidJwtError = class extends CustomAuthError {
  constructor(message) {
    super(message, "AuthInvalidJwtError", 400, "invalid_jwt");
  }
};

// C:/Users/Jmarcum/AppData/Local/deno/npm/registry.npmjs.org/@supabase/auth-js/2.98.0/dist/module/lib/base64url.js
var TO_BASE64URL = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".split("");
var IGNORE_BASE64URL = " 	\n\r=".split("");
var FROM_BASE64URL = (() => {
  const charMap = new Array(128);
  for (let i = 0; i < charMap.length; i += 1) {
    charMap[i] = -1;
  }
  for (let i = 0; i < IGNORE_BASE64URL.length; i += 1) {
    charMap[IGNORE_BASE64URL[i].charCodeAt(0)] = -2;
  }
  for (let i = 0; i < TO_BASE64URL.length; i += 1) {
    charMap[TO_BASE64URL[i].charCodeAt(0)] = i;
  }
  return charMap;
})();
function byteToBase64URL(byte, state2, emit) {
  if (byte !== null) {
    state2.queue = state2.queue << 8 | byte;
    state2.queuedBits += 8;
    while (state2.queuedBits >= 6) {
      const pos = state2.queue >> state2.queuedBits - 6 & 63;
      emit(TO_BASE64URL[pos]);
      state2.queuedBits -= 6;
    }
  } else if (state2.queuedBits > 0) {
    state2.queue = state2.queue << 6 - state2.queuedBits;
    state2.queuedBits = 6;
    while (state2.queuedBits >= 6) {
      const pos = state2.queue >> state2.queuedBits - 6 & 63;
      emit(TO_BASE64URL[pos]);
      state2.queuedBits -= 6;
    }
  }
}
function byteFromBase64URL(charCode, state2, emit) {
  const bits = FROM_BASE64URL[charCode];
  if (bits > -1) {
    state2.queue = state2.queue << 6 | bits;
    state2.queuedBits += 6;
    while (state2.queuedBits >= 8) {
      emit(state2.queue >> state2.queuedBits - 8 & 255);
      state2.queuedBits -= 8;
    }
  } else if (bits === -2) {
    return;
  } else {
    throw new Error(`Invalid Base64-URL character "${String.fromCharCode(charCode)}"`);
  }
}
function stringFromBase64URL(str) {
  const conv = [];
  const utf8Emit = (codepoint) => {
    conv.push(String.fromCodePoint(codepoint));
  };
  const utf8State = {
    utf8seq: 0,
    codepoint: 0
  };
  const b64State = {
    queue: 0,
    queuedBits: 0
  };
  const byteEmit = (byte) => {
    stringFromUTF8(byte, utf8State, utf8Emit);
  };
  for (let i = 0; i < str.length; i += 1) {
    byteFromBase64URL(str.charCodeAt(i), b64State, byteEmit);
  }
  return conv.join("");
}
function codepointToUTF8(codepoint, emit) {
  if (codepoint <= 127) {
    emit(codepoint);
    return;
  } else if (codepoint <= 2047) {
    emit(192 | codepoint >> 6);
    emit(128 | codepoint & 63);
    return;
  } else if (codepoint <= 65535) {
    emit(224 | codepoint >> 12);
    emit(128 | codepoint >> 6 & 63);
    emit(128 | codepoint & 63);
    return;
  } else if (codepoint <= 1114111) {
    emit(240 | codepoint >> 18);
    emit(128 | codepoint >> 12 & 63);
    emit(128 | codepoint >> 6 & 63);
    emit(128 | codepoint & 63);
    return;
  }
  throw new Error(`Unrecognized Unicode codepoint: ${codepoint.toString(16)}`);
}
function stringToUTF8(str, emit) {
  for (let i = 0; i < str.length; i += 1) {
    let codepoint = str.charCodeAt(i);
    if (codepoint > 55295 && codepoint <= 56319) {
      const highSurrogate = (codepoint - 55296) * 1024 & 65535;
      const lowSurrogate = str.charCodeAt(i + 1) - 56320 & 65535;
      codepoint = (lowSurrogate | highSurrogate) + 65536;
      i += 1;
    }
    codepointToUTF8(codepoint, emit);
  }
}
function stringFromUTF8(byte, state2, emit) {
  if (state2.utf8seq === 0) {
    if (byte <= 127) {
      emit(byte);
      return;
    }
    for (let leadingBit = 1; leadingBit < 6; leadingBit += 1) {
      if ((byte >> 7 - leadingBit & 1) === 0) {
        state2.utf8seq = leadingBit;
        break;
      }
    }
    if (state2.utf8seq === 2) {
      state2.codepoint = byte & 31;
    } else if (state2.utf8seq === 3) {
      state2.codepoint = byte & 15;
    } else if (state2.utf8seq === 4) {
      state2.codepoint = byte & 7;
    } else {
      throw new Error("Invalid UTF-8 sequence");
    }
    state2.utf8seq -= 1;
  } else if (state2.utf8seq > 0) {
    if (byte <= 127) {
      throw new Error("Invalid UTF-8 sequence");
    }
    state2.codepoint = state2.codepoint << 6 | byte & 63;
    state2.utf8seq -= 1;
    if (state2.utf8seq === 0) {
      emit(state2.codepoint);
    }
  }
}
function base64UrlToUint8Array(str) {
  const result = [];
  const state2 = {
    queue: 0,
    queuedBits: 0
  };
  const onByte = (byte) => {
    result.push(byte);
  };
  for (let i = 0; i < str.length; i += 1) {
    byteFromBase64URL(str.charCodeAt(i), state2, onByte);
  }
  return new Uint8Array(result);
}
function stringToUint8Array(str) {
  const result = [];
  stringToUTF8(str, (byte) => result.push(byte));
  return new Uint8Array(result);
}
function bytesToBase64URL(bytes) {
  const result = [];
  const state2 = {
    queue: 0,
    queuedBits: 0
  };
  const onChar = (char) => {
    result.push(char);
  };
  bytes.forEach((byte) => byteToBase64URL(byte, state2, onChar));
  byteToBase64URL(null, state2, onChar);
  return result.join("");
}

// C:/Users/Jmarcum/AppData/Local/deno/npm/registry.npmjs.org/@supabase/auth-js/2.98.0/dist/module/lib/helpers.js
function expiresAt(expiresIn) {
  const timeNow = Math.round(Date.now() / 1e3);
  return timeNow + expiresIn;
}
function generateCallbackId() {
  return Symbol("auth-callback");
}
var isBrowser = () => typeof window !== "undefined" && typeof document !== "undefined";
var localStorageWriteTests = {
  tested: false,
  writable: false
};
var supportsLocalStorage = () => {
  if (!isBrowser()) {
    return false;
  }
  try {
    if (typeof globalThis.localStorage !== "object") {
      return false;
    }
  } catch (e) {
    return false;
  }
  if (localStorageWriteTests.tested) {
    return localStorageWriteTests.writable;
  }
  const randomKey = `lswt-${Math.random()}${Math.random()}`;
  try {
    globalThis.localStorage.setItem(randomKey, randomKey);
    globalThis.localStorage.removeItem(randomKey);
    localStorageWriteTests.tested = true;
    localStorageWriteTests.writable = true;
  } catch (e) {
    localStorageWriteTests.tested = true;
    localStorageWriteTests.writable = false;
  }
  return localStorageWriteTests.writable;
};
function parseParametersFromURL(href) {
  const result = {};
  const url = new URL(href);
  if (url.hash && url.hash[0] === "#") {
    try {
      const hashSearchParams = new URLSearchParams(url.hash.substring(1));
      hashSearchParams.forEach((value, key) => {
        result[key] = value;
      });
    } catch (e) {
    }
  }
  url.searchParams.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}
var resolveFetch3 = (customFetch) => {
  if (customFetch) {
    return (...args) => customFetch(...args);
  }
  return (...args) => fetch(...args);
};
var looksLikeFetchResponse = (maybeResponse) => {
  return typeof maybeResponse === "object" && maybeResponse !== null && "status" in maybeResponse && "ok" in maybeResponse && "json" in maybeResponse && typeof maybeResponse.json === "function";
};
var setItemAsync = async (storage, key, data) => {
  await storage.setItem(key, JSON.stringify(data));
};
var getItemAsync = async (storage, key) => {
  const value = await storage.getItem(key);
  if (!value) {
    return null;
  }
  try {
    return JSON.parse(value);
  } catch (_a) {
    return value;
  }
};
var removeItemAsync = async (storage, key) => {
  await storage.removeItem(key);
};
var Deferred = class _Deferred {
  constructor() {
    ;
    this.promise = new _Deferred.promiseConstructor((res, rej) => {
      ;
      this.resolve = res;
      this.reject = rej;
    });
  }
};
Deferred.promiseConstructor = Promise;
function decodeJWT(token) {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new AuthInvalidJwtError("Invalid JWT structure");
  }
  for (let i = 0; i < parts.length; i++) {
    if (!BASE64URL_REGEX.test(parts[i])) {
      throw new AuthInvalidJwtError("JWT not in base64url format");
    }
  }
  const data = {
    // using base64url lib
    header: JSON.parse(stringFromBase64URL(parts[0])),
    payload: JSON.parse(stringFromBase64URL(parts[1])),
    signature: base64UrlToUint8Array(parts[2]),
    raw: {
      header: parts[0],
      payload: parts[1]
    }
  };
  return data;
}
async function sleep(time) {
  return await new Promise((accept) => {
    setTimeout(() => accept(null), time);
  });
}
function retryable(fn, isRetryable) {
  const promise = new Promise((accept, reject) => {
    ;
    (async () => {
      for (let attempt = 0; attempt < Infinity; attempt++) {
        try {
          const result = await fn(attempt);
          if (!isRetryable(attempt, null, result)) {
            accept(result);
            return;
          }
        } catch (e) {
          if (!isRetryable(attempt, e)) {
            reject(e);
            return;
          }
        }
      }
    })();
  });
  return promise;
}
function dec2hex(dec) {
  return ("0" + dec.toString(16)).substr(-2);
}
function generatePKCEVerifier() {
  const verifierLength = 56;
  const array = new Uint32Array(verifierLength);
  if (typeof crypto === "undefined") {
    const charSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
    const charSetLen = charSet.length;
    let verifier = "";
    for (let i = 0; i < verifierLength; i++) {
      verifier += charSet.charAt(Math.floor(Math.random() * charSetLen));
    }
    return verifier;
  }
  crypto.getRandomValues(array);
  return Array.from(array, dec2hex).join("");
}
async function sha256(randomString) {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(randomString);
  const hash = await crypto.subtle.digest("SHA-256", encodedData);
  const bytes = new Uint8Array(hash);
  return Array.from(bytes).map((c) => String.fromCharCode(c)).join("");
}
async function generatePKCEChallenge(verifier) {
  const hasCryptoSupport = typeof crypto !== "undefined" && typeof crypto.subtle !== "undefined" && typeof TextEncoder !== "undefined";
  if (!hasCryptoSupport) {
    console.warn("WebCrypto API is not supported. Code challenge method will default to use plain instead of sha256.");
    return verifier;
  }
  const hashed = await sha256(verifier);
  return btoa(hashed).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
async function getCodeChallengeAndMethod(storage, storageKey, isPasswordRecovery = false) {
  const codeVerifier = generatePKCEVerifier();
  let storedCodeVerifier = codeVerifier;
  if (isPasswordRecovery) {
    storedCodeVerifier += "/PASSWORD_RECOVERY";
  }
  await setItemAsync(storage, `${storageKey}-code-verifier`, storedCodeVerifier);
  const codeChallenge = await generatePKCEChallenge(codeVerifier);
  const codeChallengeMethod = codeVerifier === codeChallenge ? "plain" : "s256";
  return [
    codeChallenge,
    codeChallengeMethod
  ];
}
var API_VERSION_REGEX = /^2[0-9]{3}-(0[1-9]|1[0-2])-(0[1-9]|1[0-9]|2[0-9]|3[0-1])$/i;
function parseResponseAPIVersion(response) {
  const apiVersion = response.headers.get(API_VERSION_HEADER_NAME);
  if (!apiVersion) {
    return null;
  }
  if (!apiVersion.match(API_VERSION_REGEX)) {
    return null;
  }
  try {
    const date = /* @__PURE__ */ new Date(`${apiVersion}T00:00:00.0Z`);
    return date;
  } catch (e) {
    return null;
  }
}
function validateExp(exp2) {
  if (!exp2) {
    throw new Error("Missing exp claim");
  }
  const timeNow = Math.floor(Date.now() / 1e3);
  if (exp2 <= timeNow) {
    throw new Error("JWT has expired");
  }
}
function getAlgorithm(alg) {
  switch (alg) {
    case "RS256":
      return {
        name: "RSASSA-PKCS1-v1_5",
        hash: {
          name: "SHA-256"
        }
      };
    case "ES256":
      return {
        name: "ECDSA",
        namedCurve: "P-256",
        hash: {
          name: "SHA-256"
        }
      };
    default:
      throw new Error("Invalid alg claim");
  }
}
var UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
function validateUUID(str) {
  if (!UUID_REGEX.test(str)) {
    throw new Error("@supabase/auth-js: Expected parameter to be UUID but is not");
  }
}
function userNotAvailableProxy() {
  const proxyTarget = {};
  return new Proxy(proxyTarget, {
    get: (target, prop) => {
      if (prop === "__isUserNotAvailableProxy") {
        return true;
      }
      if (typeof prop === "symbol") {
        const sProp = prop.toString();
        if (sProp === "Symbol(Symbol.toPrimitive)" || sProp === "Symbol(Symbol.toStringTag)" || sProp === "Symbol(util.inspect.custom)") {
          return void 0;
        }
      }
      throw new Error(`@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Accessing the "${prop}" property of the session object is not supported. Please use getUser() instead.`);
    },
    set: (_target, prop) => {
      throw new Error(`@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Setting the "${prop}" property of the session object is not supported. Please use getUser() to fetch a user object you can manipulate.`);
    },
    deleteProperty: (_target, prop) => {
      throw new Error(`@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Deleting the "${prop}" property of the session object is not supported. Please use getUser() to fetch a user object you can manipulate.`);
    }
  });
}
function insecureUserWarningProxy(user, suppressWarningRef) {
  return new Proxy(user, {
    get: (target, prop, receiver) => {
      if (prop === "__isInsecureUserWarningProxy") {
        return true;
      }
      if (typeof prop === "symbol") {
        const sProp = prop.toString();
        if (sProp === "Symbol(Symbol.toPrimitive)" || sProp === "Symbol(Symbol.toStringTag)" || sProp === "Symbol(util.inspect.custom)" || sProp === "Symbol(nodejs.util.inspect.custom)") {
          return Reflect.get(target, prop, receiver);
        }
      }
      if (!suppressWarningRef.value && typeof prop === "string") {
        console.warn("Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server.");
        suppressWarningRef.value = true;
      }
      return Reflect.get(target, prop, receiver);
    }
  });
}
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// C:/Users/Jmarcum/AppData/Local/deno/npm/registry.npmjs.org/@supabase/auth-js/2.98.0/dist/module/lib/fetch.js
var _getErrorMessage2 = (err) => err.msg || err.message || err.error_description || err.error || JSON.stringify(err);
var NETWORK_ERROR_CODES = [
  502,
  503,
  504
];
async function handleError2(error) {
  var _a;
  if (!looksLikeFetchResponse(error)) {
    throw new AuthRetryableFetchError(_getErrorMessage2(error), 0);
  }
  if (NETWORK_ERROR_CODES.includes(error.status)) {
    throw new AuthRetryableFetchError(_getErrorMessage2(error), error.status);
  }
  let data;
  try {
    data = await error.json();
  } catch (e) {
    throw new AuthUnknownError(_getErrorMessage2(e), e);
  }
  let errorCode = void 0;
  const responseAPIVersion = parseResponseAPIVersion(error);
  if (responseAPIVersion && responseAPIVersion.getTime() >= API_VERSIONS["2024-01-01"].timestamp && typeof data === "object" && data && typeof data.code === "string") {
    errorCode = data.code;
  } else if (typeof data === "object" && data && typeof data.error_code === "string") {
    errorCode = data.error_code;
  }
  if (!errorCode) {
    if (typeof data === "object" && data && typeof data.weak_password === "object" && data.weak_password && Array.isArray(data.weak_password.reasons) && data.weak_password.reasons.length && data.weak_password.reasons.reduce((a, i) => a && typeof i === "string", true)) {
      throw new AuthWeakPasswordError(_getErrorMessage2(data), error.status, data.weak_password.reasons);
    }
  } else if (errorCode === "weak_password") {
    throw new AuthWeakPasswordError(_getErrorMessage2(data), error.status, ((_a = data.weak_password) === null || _a === void 0 ? void 0 : _a.reasons) || []);
  } else if (errorCode === "session_not_found") {
    throw new AuthSessionMissingError();
  }
  throw new AuthApiError(_getErrorMessage2(data), error.status || 500, errorCode);
}
var _getRequestParams2 = (method, options, parameters, body) => {
  const params = {
    method,
    headers: (options === null || options === void 0 ? void 0 : options.headers) || {}
  };
  if (method === "GET") {
    return params;
  }
  params.headers = Object.assign({
    "Content-Type": "application/json;charset=UTF-8"
  }, options === null || options === void 0 ? void 0 : options.headers);
  params.body = JSON.stringify(body);
  return Object.assign(Object.assign({}, params), parameters);
};
async function _request(fetcher, method, url, options) {
  var _a;
  const headers = Object.assign({}, options === null || options === void 0 ? void 0 : options.headers);
  if (!headers[API_VERSION_HEADER_NAME]) {
    headers[API_VERSION_HEADER_NAME] = API_VERSIONS["2024-01-01"].name;
  }
  if (options === null || options === void 0 ? void 0 : options.jwt) {
    headers["Authorization"] = `Bearer ${options.jwt}`;
  }
  const qs = (_a = options === null || options === void 0 ? void 0 : options.query) !== null && _a !== void 0 ? _a : {};
  if (options === null || options === void 0 ? void 0 : options.redirectTo) {
    qs["redirect_to"] = options.redirectTo;
  }
  const queryString = Object.keys(qs).length ? "?" + new URLSearchParams(qs).toString() : "";
  const data = await _handleRequest2(fetcher, method, url + queryString, {
    headers,
    noResolveJson: options === null || options === void 0 ? void 0 : options.noResolveJson
  }, {}, options === null || options === void 0 ? void 0 : options.body);
  return (options === null || options === void 0 ? void 0 : options.xform) ? options === null || options === void 0 ? void 0 : options.xform(data) : {
    data: Object.assign({}, data),
    error: null
  };
}
async function _handleRequest2(fetcher, method, url, options, parameters, body) {
  const requestParams = _getRequestParams2(method, options, parameters, body);
  let result;
  try {
    result = await fetcher(url, Object.assign({}, requestParams));
  } catch (e) {
    console.error(e);
    throw new AuthRetryableFetchError(_getErrorMessage2(e), 0);
  }
  if (!result.ok) {
    await handleError2(result);
  }
  if (options === null || options === void 0 ? void 0 : options.noResolveJson) {
    return result;
  }
  try {
    return await result.json();
  } catch (e) {
    await handleError2(e);
  }
}
function _sessionResponse(data) {
  var _a;
  let session = null;
  if (hasSession(data)) {
    session = Object.assign({}, data);
    if (!data.expires_at) {
      session.expires_at = expiresAt(data.expires_in);
    }
  }
  const user = (_a = data.user) !== null && _a !== void 0 ? _a : data;
  return {
    data: {
      session,
      user
    },
    error: null
  };
}
function _sessionResponsePassword(data) {
  const response = _sessionResponse(data);
  if (!response.error && data.weak_password && typeof data.weak_password === "object" && Array.isArray(data.weak_password.reasons) && data.weak_password.reasons.length && data.weak_password.message && typeof data.weak_password.message === "string" && data.weak_password.reasons.reduce((a, i) => a && typeof i === "string", true)) {
    response.data.weak_password = data.weak_password;
  }
  return response;
}
function _userResponse(data) {
  var _a;
  const user = (_a = data.user) !== null && _a !== void 0 ? _a : data;
  return {
    data: {
      user
    },
    error: null
  };
}
function _ssoResponse(data) {
  return {
    data,
    error: null
  };
}
function _generateLinkResponse(data) {
  const { action_link, email_otp, hashed_token, redirect_to, verification_type } = data, rest = __rest(data, [
    "action_link",
    "email_otp",
    "hashed_token",
    "redirect_to",
    "verification_type"
  ]);
  const properties = {
    action_link,
    email_otp,
    hashed_token,
    redirect_to,
    verification_type
  };
  const user = Object.assign({}, rest);
  return {
    data: {
      properties,
      user
    },
    error: null
  };
}
function _noResolveJsonResponse(data) {
  return data;
}
function hasSession(data) {
  return data.access_token && data.refresh_token && data.expires_in;
}

// C:/Users/Jmarcum/AppData/Local/deno/npm/registry.npmjs.org/@supabase/auth-js/2.98.0/dist/module/lib/types.js
var SIGN_OUT_SCOPES = [
  "global",
  "local",
  "others"
];

// C:/Users/Jmarcum/AppData/Local/deno/npm/registry.npmjs.org/@supabase/auth-js/2.98.0/dist/module/GoTrueAdminApi.js
var GoTrueAdminApi = class {
  /**
     * Creates an admin API client that can be used to manage users and OAuth clients.
     *
     * @example
     * ```ts
     * import { GoTrueAdminApi } from '@supabase/auth-js'
     *
     * const admin = new GoTrueAdminApi({
     *   url: 'https://xyzcompany.supabase.co/auth/v1',
     *   headers: { Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` },
     * })
     * ```
     */
  constructor({ url = "", headers = {}, fetch: fetch2 }) {
    this.url = url;
    this.headers = headers;
    this.fetch = resolveFetch3(fetch2);
    this.mfa = {
      listFactors: this._listFactors.bind(this),
      deleteFactor: this._deleteFactor.bind(this)
    };
    this.oauth = {
      listClients: this._listOAuthClients.bind(this),
      createClient: this._createOAuthClient.bind(this),
      getClient: this._getOAuthClient.bind(this),
      updateClient: this._updateOAuthClient.bind(this),
      deleteClient: this._deleteOAuthClient.bind(this),
      regenerateClientSecret: this._regenerateOAuthClientSecret.bind(this)
    };
  }
  /**
     * Removes a logged-in session.
     * @param jwt A valid, logged-in JWT.
     * @param scope The logout sope.
     */
  async signOut(jwt, scope = SIGN_OUT_SCOPES[0]) {
    if (SIGN_OUT_SCOPES.indexOf(scope) < 0) {
      throw new Error(`@supabase/auth-js: Parameter scope must be one of ${SIGN_OUT_SCOPES.join(", ")}`);
    }
    try {
      await _request(this.fetch, "POST", `${this.url}/logout?scope=${scope}`, {
        headers: this.headers,
        jwt,
        noResolveJson: true
      });
      return {
        data: null,
        error: null
      };
    } catch (error) {
      if (isAuthError(error)) {
        return {
          data: null,
          error
        };
      }
      throw error;
    }
  }
  /**
     * Sends an invite link to an email address.
     * @param email The email address of the user.
     * @param options Additional options to be included when inviting.
     */
  async inviteUserByEmail(email, options = {}) {
    try {
      return await _request(this.fetch, "POST", `${this.url}/invite`, {
        body: {
          email,
          data: options.data
        },
        headers: this.headers,
        redirectTo: options.redirectTo,
        xform: _userResponse
      });
    } catch (error) {
      if (isAuthError(error)) {
        return {
          data: {
            user: null
          },
          error
        };
      }
      throw error;
    }
  }
  /**
     * Generates email links and OTPs to be sent via a custom email provider.
     * @param email The user's email.
     * @param options.password User password. For signup only.
     * @param options.data Optional user metadata. For signup only.
     * @param options.redirectTo The redirect url which should be appended to the generated link
     */
  async generateLink(params) {
    try {
      const { options } = params, rest = __rest(params, [
        "options"
      ]);
      const body = Object.assign(Object.assign({}, rest), options);
      if ("newEmail" in rest) {
        body.new_email = rest === null || rest === void 0 ? void 0 : rest.newEmail;
        delete body["newEmail"];
      }
      return await _request(this.fetch, "POST", `${this.url}/admin/generate_link`, {
        body,
        headers: this.headers,
        xform: _generateLinkResponse,
        redirectTo: options === null || options === void 0 ? void 0 : options.redirectTo
      });
    } catch (error) {
      if (isAuthError(error)) {
        return {
          data: {
            properties: null,
            user: null
          },
          error
        };
      }
      throw error;
    }
  }
  // User Admin API
  /**
     * Creates a new user.
     * This function should only be called on a server. Never expose your `service_role` key in the browser.
     */
  async createUser(attributes) {
    try {
      return await _request(this.fetch, "POST", `${this.url}/admin/users`, {
        body: attributes,
        headers: this.headers,
        xform: _userResponse
      });
    } catch (error) {
      if (isAuthError(error)) {
        return {
          data: {
            user: null
          },
          error
        };
      }
      throw error;
    }
  }
  /**
     * Get a list of users.
     *
     * This function should only be called on a server. Never expose your `service_role` key in the browser.
     * @param params An object which supports `page` and `perPage` as numbers, to alter the paginated results.
     */
  async listUsers(params) {
    var _a, _b, _c, _d, _e, _f, _g;
    try {
      const pagination = {
        nextPage: null,
        lastPage: 0,
        total: 0
      };
      const response = await _request(this.fetch, "GET", `${this.url}/admin/users`, {
        headers: this.headers,
        noResolveJson: true,
        query: {
          page: (_b = (_a = params === null || params === void 0 ? void 0 : params.page) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : "",
          per_page: (_d = (_c = params === null || params === void 0 ? void 0 : params.perPage) === null || _c === void 0 ? void 0 : _c.toString()) !== null && _d !== void 0 ? _d : ""
        },
        xform: _noResolveJsonResponse
      });
      if (response.error) throw response.error;
      const users = await response.json();
      const total = (_e = response.headers.get("x-total-count")) !== null && _e !== void 0 ? _e : 0;
      const links = (_g = (_f = response.headers.get("link")) === null || _f === void 0 ? void 0 : _f.split(",")) !== null && _g !== void 0 ? _g : [];
      if (links.length > 0) {
        links.forEach((link) => {
          const page = parseInt(link.split(";")[0].split("=")[1].substring(0, 1));
          const rel = JSON.parse(link.split(";")[1].split("=")[1]);
          pagination[`${rel}Page`] = page;
        });
        pagination.total = parseInt(total);
      }
      return {
        data: Object.assign(Object.assign({}, users), pagination),
        error: null
      };
    } catch (error) {
      if (isAuthError(error)) {
        return {
          data: {
            users: []
          },
          error
        };
      }
      throw error;
    }
  }
  /**
     * Get user by id.
     *
     * @param uid The user's unique identifier
     *
     * This function should only be called on a server. Never expose your `service_role` key in the browser.
     */
  async getUserById(uid) {
    validateUUID(uid);
    try {
      return await _request(this.fetch, "GET", `${this.url}/admin/users/${uid}`, {
        headers: this.headers,
        xform: _userResponse
      });
    } catch (error) {
      if (isAuthError(error)) {
        return {
          data: {
            user: null
          },
          error
        };
      }
      throw error;
    }
  }
  /**
     * Updates the user data. Changes are applied directly without confirmation flows.
     *
     * @param uid The user's unique identifier
     * @param attributes The data you want to update.
     *
     * This function should only be called on a server. Never expose your `service_role` key in the browser.
     *
     * @remarks
     * **Important:** This is a server-side operation and does **not** trigger client-side
     * `onAuthStateChange` listeners. The admin API has no connection to client state.
     *
     * To sync changes to the client after calling this method:
     * 1. On the client, call `supabase.auth.refreshSession()` to fetch the updated user data
     * 2. This will trigger the `TOKEN_REFRESHED` event and notify all listeners
     *
     * @example
     * ```typescript
     * // Server-side (Edge Function)
     * const { data, error } = await supabase.auth.admin.updateUserById(
     *   userId,
     *   { user_metadata: { preferences: { theme: 'dark' } } }
     * )
     *
     * // Client-side (to sync the changes)
     * const { data, error } = await supabase.auth.refreshSession()
     * // onAuthStateChange listeners will now be notified with updated user
     * ```
     *
     * @see {@link GoTrueClient.refreshSession} for syncing admin changes to the client
     * @see {@link GoTrueClient.updateUser} for client-side user updates (triggers listeners automatically)
     */
  async updateUserById(uid, attributes) {
    validateUUID(uid);
    try {
      return await _request(this.fetch, "PUT", `${this.url}/admin/users/${uid}`, {
        body: attributes,
        headers: this.headers,
        xform: _userResponse
      });
    } catch (error) {
      if (isAuthError(error)) {
        return {
          data: {
            user: null
          },
          error
        };
      }
      throw error;
    }
  }
  /**
     * Delete a user. Requires a `service_role` key.
     *
     * @param id The user id you want to remove.
     * @param shouldSoftDelete If true, then the user will be soft-deleted from the auth schema. Soft deletion allows user identification from the hashed user ID but is not reversible.
     * Defaults to false for backward compatibility.
     *
     * This function should only be called on a server. Never expose your `service_role` key in the browser.
     */
  async deleteUser(id, shouldSoftDelete = false) {
    validateUUID(id);
    try {
      return await _request(this.fetch, "DELETE", `${this.url}/admin/users/${id}`, {
        headers: this.headers,
        body: {
          should_soft_delete: shouldSoftDelete
        },
        xform: _userResponse
      });
    } catch (error) {
      if (isAuthError(error)) {
        return {
          data: {
            user: null
          },
          error
        };
      }
      throw error;
    }
  }
  async _listFactors(params) {
    validateUUID(params.userId);
    try {
      const { data, error } = await _request(this.fetch, "GET", `${this.url}/admin/users/${params.userId}/factors`, {
        headers: this.headers,
        xform: (factors) => {
          return {
            data: {
              factors
            },
            error: null
          };
        }
      });
      return {
        data,
        error
      };
    } catch (error) {
      if (isAuthError(error)) {
        return {
          data: null,
          error
        };
      }
      throw error;
    }
  }
  async _deleteFactor(params) {
    validateUUID(params.userId);
    validateUUID(params.id);
    try {
      const data = await _request(this.fetch, "DELETE", `${this.url}/admin/users/${params.userId}/factors/${params.id}`, {
        headers: this.headers
      });
      return {
        data,
        error: null
      };
    } catch (error) {
      if (isAuthError(error)) {
        return {
          data: null,
          error
        };
      }
      throw error;
    }
  }
  /**
     * Lists all OAuth clients with optional pagination.
     * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
     *
     * This function should only be called on a server. Never expose your `service_role` key in the browser.
     */
  async _listOAuthClients(params) {
    var _a, _b, _c, _d, _e, _f, _g;
    try {
      const pagination = {
        nextPage: null,
        lastPage: 0,
        total: 0
      };
      const response = await _request(this.fetch, "GET", `${this.url}/admin/oauth/clients`, {
        headers: this.headers,
        noResolveJson: true,
        query: {
          page: (_b = (_a = params === null || params === void 0 ? void 0 : params.page) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : "",
          per_page: (_d = (_c = params === null || params === void 0 ? void 0 : params.perPage) === null || _c === void 0 ? void 0 : _c.toString()) !== null && _d !== void 0 ? _d : ""
        },
        xform: _noResolveJsonResponse
      });
      if (response.error) throw response.error;
      const clients = await response.json();
      const total = (_e = response.headers.get("x-total-count")) !== null && _e !== void 0 ? _e : 0;
      const links = (_g = (_f = response.headers.get("link")) === null || _f === void 0 ? void 0 : _f.split(",")) !== null && _g !== void 0 ? _g : [];
      if (links.length > 0) {
        links.forEach((link) => {
          const page = parseInt(link.split(";")[0].split("=")[1].substring(0, 1));
          const rel = JSON.parse(link.split(";")[1].split("=")[1]);
          pagination[`${rel}Page`] = page;
        });
        pagination.total = parseInt(total);
      }
      return {
        data: Object.assign(Object.assign({}, clients), pagination),
        error: null
      };
    } catch (error) {
      if (isAuthError(error)) {
        return {
          data: {
            clients: []
          },
          error
        };
      }
      throw error;
    }
  }
  /**
     * Creates a new OAuth client.
     * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
     *
     * This function should only be called on a server. Never expose your `service_role` key in the browser.
     */
  async _createOAuthClient(params) {
    try {
      return await _request(this.fetch, "POST", `${this.url}/admin/oauth/clients`, {
        body: params,
        headers: this.headers,
        xform: (client) => {
          return {
            data: client,
            error: null
          };
        }
      });
    } catch (error) {
      if (isAuthError(error)) {
        return {
          data: null,
          error
        };
      }
      throw error;
    }
  }
  /**
     * Gets details of a specific OAuth client.
     * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
     *
     * This function should only be called on a server. Never expose your `service_role` key in the browser.
     */
  async _getOAuthClient(clientId) {
    try {
      return await _request(this.fetch, "GET", `${this.url}/admin/oauth/clients/${clientId}`, {
        headers: this.headers,
        xform: (client) => {
          return {
            data: client,
            error: null
          };
        }
      });
    } catch (error) {
      if (isAuthError(error)) {
        return {
          data: null,
          error
        };
      }
      throw error;
    }
  }
  /**
     * Updates an existing OAuth client.
     * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
     *
     * This function should only be called on a server. Never expose your `service_role` key in the browser.
     */
  async _updateOAuthClient(clientId, params) {
    try {
      return await _request(this.fetch, "PUT", `${this.url}/admin/oauth/clients/${clientId}`, {
        body: params,
        headers: this.headers,
        xform: (client) => {
          return {
            data: client,
            error: null
          };
        }
      });
    } catch (error) {
      if (isAuthError(error)) {
        return {
          data: null,
          error
        };
      }
      throw error;
    }
  }
  /**
     * Deletes an OAuth client.
     * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
     *
     * This function should only be called on a server. Never expose your `service_role` key in the browser.
     */
  async _deleteOAuthClient(clientId) {
    try {
      await _request(this.fetch, "DELETE", `${this.url}/admin/oauth/clients/${clientId}`, {
        headers: this.headers,
        noResolveJson: true
      });
      return {
        data: null,
        error: null
      };
    } catch (error) {
      if (isAuthError(error)) {
        return {
          data: null,
          error
        };
      }
      throw error;
    }
  }
  /**
     * Regenerates the secret for an OAuth client.
     * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
     *
     * This function should only be called on a server. Never expose your `service_role` key in the browser.
     */
  async _regenerateOAuthClientSecret(clientId) {
    try {
      return await _request(this.fetch, "POST", `${this.url}/admin/oauth/clients/${clientId}/regenerate_secret`, {
        headers: this.headers,
        xform: (client) => {
          return {
            data: client,
            error: null
          };
        }
      });
    } catch (error) {
      if (isAuthError(error)) {
        return {
          data: null,
          error
        };
      }
      throw error;
    }
  }
};

// C:/Users/Jmarcum/AppData/Local/deno/npm/registry.npmjs.org/@supabase/auth-js/2.98.0/dist/module/lib/local-storage.js
function memoryLocalStorageAdapter(store = {}) {
  return {
    getItem: (key) => {
      return store[key] || null;
    },
    setItem: (key, value) => {
      store[key] = value;
    },
    removeItem: (key) => {
      delete store[key];
    }
  };
}

// C:/Users/Jmarcum/AppData/Local/deno/npm/registry.npmjs.org/@supabase/auth-js/2.98.0/dist/module/lib/locks.js
var internals = {
  /**
     * @experimental
     */
  debug: !!(globalThis && supportsLocalStorage() && globalThis.localStorage && globalThis.localStorage.getItem("supabase.gotrue-js.locks.debug") === "true")
};
var LockAcquireTimeoutError = class extends Error {
  constructor(message) {
    super(message);
    this.isAcquireTimeout = true;
  }
};
var NavigatorLockAcquireTimeoutError = class extends LockAcquireTimeoutError {
};
async function navigatorLock(name, acquireTimeout, fn) {
  if (internals.debug) {
    console.log("@supabase/gotrue-js: navigatorLock: acquire lock", name, acquireTimeout);
  }
  const abortController = new globalThis.AbortController();
  if (acquireTimeout > 0) {
    setTimeout(() => {
      abortController.abort();
      if (internals.debug) {
        console.log("@supabase/gotrue-js: navigatorLock acquire timed out", name);
      }
    }, acquireTimeout);
  }
  await Promise.resolve();
  try {
    return await globalThis.navigator.locks.request(name, acquireTimeout === 0 ? {
      mode: "exclusive",
      ifAvailable: true
    } : {
      mode: "exclusive",
      signal: abortController.signal
    }, async (lock) => {
      if (lock) {
        if (internals.debug) {
          console.log("@supabase/gotrue-js: navigatorLock: acquired", name, lock.name);
        }
        try {
          return await fn();
        } finally {
          if (internals.debug) {
            console.log("@supabase/gotrue-js: navigatorLock: released", name, lock.name);
          }
        }
      } else {
        if (acquireTimeout === 0) {
          if (internals.debug) {
            console.log("@supabase/gotrue-js: navigatorLock: not immediately available", name);
          }
          throw new NavigatorLockAcquireTimeoutError(`Acquiring an exclusive Navigator LockManager lock "${name}" immediately failed`);
        } else {
          if (internals.debug) {
            try {
              const result = await globalThis.navigator.locks.query();
              console.log("@supabase/gotrue-js: Navigator LockManager state", JSON.stringify(result, null, "  "));
            } catch (e) {
              console.warn("@supabase/gotrue-js: Error when querying Navigator LockManager state", e);
            }
          }
          console.warn("@supabase/gotrue-js: Navigator LockManager returned a null lock when using #request without ifAvailable set to true, it appears this browser is not following the LockManager spec https://developer.mozilla.org/en-US/docs/Web/API/LockManager/request");
          return await fn();
        }
      }
    });
  } catch (e) {
    if ((e === null || e === void 0 ? void 0 : e.name) === "AbortError" && acquireTimeout > 0) {
      if (internals.debug) {
        console.log("@supabase/gotrue-js: navigatorLock: acquire timeout, recovering by stealing lock", name);
      }
      console.warn(`@supabase/gotrue-js: Lock "${name}" was not released within ${acquireTimeout}ms. This may indicate an orphaned lock from a component unmount (e.g., React Strict Mode). Forcefully acquiring the lock to recover.`);
      return await Promise.resolve().then(() => globalThis.navigator.locks.request(name, {
        mode: "exclusive",
        steal: true
      }, async (lock) => {
        if (lock) {
          if (internals.debug) {
            console.log("@supabase/gotrue-js: navigatorLock: recovered (stolen)", name, lock.name);
          }
          try {
            return await fn();
          } finally {
            if (internals.debug) {
              console.log("@supabase/gotrue-js: navigatorLock: released (stolen)", name, lock.name);
            }
          }
        } else {
          console.warn("@supabase/gotrue-js: Navigator LockManager returned null lock even with steal: true");
          return await fn();
        }
      }));
    }
    throw e;
  }
}

// C:/Users/Jmarcum/AppData/Local/deno/npm/registry.npmjs.org/@supabase/auth-js/2.98.0/dist/module/lib/polyfills.js
function polyfillGlobalThis() {
  if (typeof globalThis === "object") return;
  try {
    Object.defineProperty(Object.prototype, "__magic__", {
      get: function() {
        return this;
      },
      configurable: true
    });
    __magic__.globalThis = __magic__;
    delete Object.prototype.__magic__;
  } catch (e) {
    if (typeof self !== "undefined") {
      self.globalThis = self;
    }
  }
}

// C:/Users/Jmarcum/AppData/Local/deno/npm/registry.npmjs.org/@supabase/auth-js/2.98.0/dist/module/lib/web3/ethereum.js
function getAddress(address) {
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    throw new Error(`@supabase/auth-js: Address "${address}" is invalid.`);
  }
  return address.toLowerCase();
}
function fromHex(hex) {
  return parseInt(hex, 16);
}
function toHex(value) {
  const bytes = new TextEncoder().encode(value);
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return "0x" + hex;
}
function createSiweMessage(parameters) {
  var _a;
  const { chainId, domain, expirationTime, issuedAt = /* @__PURE__ */ new Date(), nonce, notBefore, requestId, resources, scheme, uri, version: version5 } = parameters;
  {
    if (!Number.isInteger(chainId)) throw new Error(`@supabase/auth-js: Invalid SIWE message field "chainId". Chain ID must be a EIP-155 chain ID. Provided value: ${chainId}`);
    if (!domain) throw new Error(`@supabase/auth-js: Invalid SIWE message field "domain". Domain must be provided.`);
    if (nonce && nonce.length < 8) throw new Error(`@supabase/auth-js: Invalid SIWE message field "nonce". Nonce must be at least 8 characters. Provided value: ${nonce}`);
    if (!uri) throw new Error(`@supabase/auth-js: Invalid SIWE message field "uri". URI must be provided.`);
    if (version5 !== "1") throw new Error(`@supabase/auth-js: Invalid SIWE message field "version". Version must be '1'. Provided value: ${version5}`);
    if ((_a = parameters.statement) === null || _a === void 0 ? void 0 : _a.includes("\n")) throw new Error(`@supabase/auth-js: Invalid SIWE message field "statement". Statement must not include '\\n'. Provided value: ${parameters.statement}`);
  }
  const address = getAddress(parameters.address);
  const origin = scheme ? `${scheme}://${domain}` : domain;
  const statement = parameters.statement ? `${parameters.statement}
` : "";
  const prefix = `${origin} wants you to sign in with your Ethereum account:
${address}

${statement}`;
  let suffix = `URI: ${uri}
Version: ${version5}
Chain ID: ${chainId}${nonce ? `
Nonce: ${nonce}` : ""}
Issued At: ${issuedAt.toISOString()}`;
  if (expirationTime) suffix += `
Expiration Time: ${expirationTime.toISOString()}`;
  if (notBefore) suffix += `
Not Before: ${notBefore.toISOString()}`;
  if (requestId) suffix += `
Request ID: ${requestId}`;
  if (resources) {
    let content = "\nResources:";
    for (const resource of resources) {
      if (!resource || typeof resource !== "string") throw new Error(`@supabase/auth-js: Invalid SIWE message field "resources". Every resource must be a valid string. Provided value: ${resource}`);
      content += `
- ${resource}`;
    }
    suffix += content;
  }
  return `${prefix}
${suffix}`;
}

// C:/Users/Jmarcum/AppData/Local/deno/npm/registry.npmjs.org/@supabase/auth-js/2.98.0/dist/module/lib/webauthn.errors.js
var WebAuthnError = class extends Error {
  constructor({ message, code, cause, name }) {
    var _a;
    super(message, {
      cause
    });
    this.__isWebAuthnError = true;
    this.name = (_a = name !== null && name !== void 0 ? name : cause instanceof Error ? cause.name : void 0) !== null && _a !== void 0 ? _a : "Unknown Error";
    this.code = code;
  }
};
var WebAuthnUnknownError = class extends WebAuthnError {
  constructor(message, originalError) {
    super({
      code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
      cause: originalError,
      message
    });
    this.name = "WebAuthnUnknownError";
    this.originalError = originalError;
  }
};
function identifyRegistrationError({ error, options }) {
  var _a, _b, _c;
  const { publicKey } = options;
  if (!publicKey) {
    throw Error("options was missing required publicKey property");
  }
  if (error.name === "AbortError") {
    if (options.signal instanceof AbortSignal) {
      return new WebAuthnError({
        message: "Registration ceremony was sent an abort signal",
        code: "ERROR_CEREMONY_ABORTED",
        cause: error
      });
    }
  } else if (error.name === "ConstraintError") {
    if (((_a = publicKey.authenticatorSelection) === null || _a === void 0 ? void 0 : _a.requireResidentKey) === true) {
      return new WebAuthnError({
        message: "Discoverable credentials were required but no available authenticator supported it",
        code: "ERROR_AUTHENTICATOR_MISSING_DISCOVERABLE_CREDENTIAL_SUPPORT",
        cause: error
      });
    } else if (
      // @ts-ignore: `mediation` doesn't yet exist on CredentialCreationOptions but it's possible as of Sept 2024
      options.mediation === "conditional" && ((_b = publicKey.authenticatorSelection) === null || _b === void 0 ? void 0 : _b.userVerification) === "required"
    ) {
      return new WebAuthnError({
        message: "User verification was required during automatic registration but it could not be performed",
        code: "ERROR_AUTO_REGISTER_USER_VERIFICATION_FAILURE",
        cause: error
      });
    } else if (((_c = publicKey.authenticatorSelection) === null || _c === void 0 ? void 0 : _c.userVerification) === "required") {
      return new WebAuthnError({
        message: "User verification was required but no available authenticator supported it",
        code: "ERROR_AUTHENTICATOR_MISSING_USER_VERIFICATION_SUPPORT",
        cause: error
      });
    }
  } else if (error.name === "InvalidStateError") {
    return new WebAuthnError({
      message: "The authenticator was previously registered",
      code: "ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED",
      cause: error
    });
  } else if (error.name === "NotAllowedError") {
    return new WebAuthnError({
      message: error.message,
      code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
      cause: error
    });
  } else if (error.name === "NotSupportedError") {
    const validPubKeyCredParams = publicKey.pubKeyCredParams.filter((param) => param.type === "public-key");
    if (validPubKeyCredParams.length === 0) {
      return new WebAuthnError({
        message: 'No entry in pubKeyCredParams was of type "public-key"',
        code: "ERROR_MALFORMED_PUBKEYCREDPARAMS",
        cause: error
      });
    }
    return new WebAuthnError({
      message: "No available authenticator supported any of the specified pubKeyCredParams algorithms",
      code: "ERROR_AUTHENTICATOR_NO_SUPPORTED_PUBKEYCREDPARAMS_ALG",
      cause: error
    });
  } else if (error.name === "SecurityError") {
    const effectiveDomain = window.location.hostname;
    if (!isValidDomain(effectiveDomain)) {
      return new WebAuthnError({
        message: `${window.location.hostname} is an invalid domain`,
        code: "ERROR_INVALID_DOMAIN",
        cause: error
      });
    } else if (publicKey.rp.id !== effectiveDomain) {
      return new WebAuthnError({
        message: `The RP ID "${publicKey.rp.id}" is invalid for this domain`,
        code: "ERROR_INVALID_RP_ID",
        cause: error
      });
    }
  } else if (error.name === "TypeError") {
    if (publicKey.user.id.byteLength < 1 || publicKey.user.id.byteLength > 64) {
      return new WebAuthnError({
        message: "User ID was not between 1 and 64 characters",
        code: "ERROR_INVALID_USER_ID_LENGTH",
        cause: error
      });
    }
  } else if (error.name === "UnknownError") {
    return new WebAuthnError({
      message: "The authenticator was unable to process the specified options, or could not create a new credential",
      code: "ERROR_AUTHENTICATOR_GENERAL_ERROR",
      cause: error
    });
  }
  return new WebAuthnError({
    message: "a Non-Webauthn related error has occurred",
    code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
    cause: error
  });
}
function identifyAuthenticationError({ error, options }) {
  const { publicKey } = options;
  if (!publicKey) {
    throw Error("options was missing required publicKey property");
  }
  if (error.name === "AbortError") {
    if (options.signal instanceof AbortSignal) {
      return new WebAuthnError({
        message: "Authentication ceremony was sent an abort signal",
        code: "ERROR_CEREMONY_ABORTED",
        cause: error
      });
    }
  } else if (error.name === "NotAllowedError") {
    return new WebAuthnError({
      message: error.message,
      code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
      cause: error
    });
  } else if (error.name === "SecurityError") {
    const effectiveDomain = window.location.hostname;
    if (!isValidDomain(effectiveDomain)) {
      return new WebAuthnError({
        message: `${window.location.hostname} is an invalid domain`,
        code: "ERROR_INVALID_DOMAIN",
        cause: error
      });
    } else if (publicKey.rpId !== effectiveDomain) {
      return new WebAuthnError({
        message: `The RP ID "${publicKey.rpId}" is invalid for this domain`,
        code: "ERROR_INVALID_RP_ID",
        cause: error
      });
    }
  } else if (error.name === "UnknownError") {
    return new WebAuthnError({
      message: "The authenticator was unable to process the specified options, or could not create a new assertion signature",
      code: "ERROR_AUTHENTICATOR_GENERAL_ERROR",
      cause: error
    });
  }
  return new WebAuthnError({
    message: "a Non-Webauthn related error has occurred",
    code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
    cause: error
  });
}

// C:/Users/Jmarcum/AppData/Local/deno/npm/registry.npmjs.org/@supabase/auth-js/2.98.0/dist/module/lib/webauthn.js
var WebAuthnAbortService = class {
  /**
     * Create an abort signal for a new WebAuthn operation.
     * Automatically cancels any existing operation.
     *
     * @returns {AbortSignal} Signal to pass to navigator.credentials.create() or .get()
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal MDN - AbortSignal}
     */
  createNewAbortSignal() {
    if (this.controller) {
      const abortError = new Error("Cancelling existing WebAuthn API call for new one");
      abortError.name = "AbortError";
      this.controller.abort(abortError);
    }
    const newController = new AbortController();
    this.controller = newController;
    return newController.signal;
  }
  /**
     * Manually cancel the current WebAuthn operation.
     * Useful for cleaning up when user cancels or navigates away.
     *
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort MDN - AbortController.abort}
     */
  cancelCeremony() {
    if (this.controller) {
      const abortError = new Error("Manually cancelling existing WebAuthn API call");
      abortError.name = "AbortError";
      this.controller.abort(abortError);
      this.controller = void 0;
    }
  }
};
var webAuthnAbortService = new WebAuthnAbortService();
function deserializeCredentialCreationOptions(options) {
  if (!options) {
    throw new Error("Credential creation options are required");
  }
  if (typeof PublicKeyCredential !== "undefined" && "parseCreationOptionsFromJSON" in PublicKeyCredential && typeof PublicKeyCredential.parseCreationOptionsFromJSON === "function") {
    return PublicKeyCredential.parseCreationOptionsFromJSON(
      /** we assert the options here as typescript still doesn't know about future webauthn types */
      options
    );
  }
  const { challenge: challengeStr, user: userOpts, excludeCredentials } = options, restOptions = __rest(options, [
    "challenge",
    "user",
    "excludeCredentials"
  ]);
  const challenge = base64UrlToUint8Array(challengeStr).buffer;
  const user = Object.assign(Object.assign({}, userOpts), {
    id: base64UrlToUint8Array(userOpts.id).buffer
  });
  const result = Object.assign(Object.assign({}, restOptions), {
    challenge,
    user
  });
  if (excludeCredentials && excludeCredentials.length > 0) {
    result.excludeCredentials = new Array(excludeCredentials.length);
    for (let i = 0; i < excludeCredentials.length; i++) {
      const cred = excludeCredentials[i];
      result.excludeCredentials[i] = Object.assign(Object.assign({}, cred), {
        id: base64UrlToUint8Array(cred.id).buffer,
        type: cred.type || "public-key",
        // Cast transports to handle future transport types like "cable"
        transports: cred.transports
      });
    }
  }
  return result;
}
function deserializeCredentialRequestOptions(options) {
  if (!options) {
    throw new Error("Credential request options are required");
  }
  if (typeof PublicKeyCredential !== "undefined" && "parseRequestOptionsFromJSON" in PublicKeyCredential && typeof PublicKeyCredential.parseRequestOptionsFromJSON === "function") {
    return PublicKeyCredential.parseRequestOptionsFromJSON(options);
  }
  const { challenge: challengeStr, allowCredentials } = options, restOptions = __rest(options, [
    "challenge",
    "allowCredentials"
  ]);
  const challenge = base64UrlToUint8Array(challengeStr).buffer;
  const result = Object.assign(Object.assign({}, restOptions), {
    challenge
  });
  if (allowCredentials && allowCredentials.length > 0) {
    result.allowCredentials = new Array(allowCredentials.length);
    for (let i = 0; i < allowCredentials.length; i++) {
      const cred = allowCredentials[i];
      result.allowCredentials[i] = Object.assign(Object.assign({}, cred), {
        id: base64UrlToUint8Array(cred.id).buffer,
        type: cred.type || "public-key",
        // Cast transports to handle future transport types like "cable"
        transports: cred.transports
      });
    }
  }
  return result;
}
function serializeCredentialCreationResponse(credential) {
  var _a;
  if ("toJSON" in credential && typeof credential.toJSON === "function") {
    return credential.toJSON();
  }
  const credentialWithAttachment = credential;
  return {
    id: credential.id,
    rawId: credential.id,
    response: {
      attestationObject: bytesToBase64URL(new Uint8Array(credential.response.attestationObject)),
      clientDataJSON: bytesToBase64URL(new Uint8Array(credential.response.clientDataJSON))
    },
    type: "public-key",
    clientExtensionResults: credential.getClientExtensionResults(),
    // Convert null to undefined and cast to AuthenticatorAttachment type
    authenticatorAttachment: (_a = credentialWithAttachment.authenticatorAttachment) !== null && _a !== void 0 ? _a : void 0
  };
}
function serializeCredentialRequestResponse(credential) {
  var _a;
  if ("toJSON" in credential && typeof credential.toJSON === "function") {
    return credential.toJSON();
  }
  const credentialWithAttachment = credential;
  const clientExtensionResults = credential.getClientExtensionResults();
  const assertionResponse = credential.response;
  return {
    id: credential.id,
    rawId: credential.id,
    response: {
      authenticatorData: bytesToBase64URL(new Uint8Array(assertionResponse.authenticatorData)),
      clientDataJSON: bytesToBase64URL(new Uint8Array(assertionResponse.clientDataJSON)),
      signature: bytesToBase64URL(new Uint8Array(assertionResponse.signature)),
      userHandle: assertionResponse.userHandle ? bytesToBase64URL(new Uint8Array(assertionResponse.userHandle)) : void 0
    },
    type: "public-key",
    clientExtensionResults,
    // Convert null to undefined and cast to AuthenticatorAttachment type
    authenticatorAttachment: (_a = credentialWithAttachment.authenticatorAttachment) !== null && _a !== void 0 ? _a : void 0
  };
}
function isValidDomain(hostname) {
  return (
    // Consider localhost valid as well since it's okay wrt Secure Contexts
    hostname === "localhost" || /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i.test(hostname)
  );
}
function browserSupportsWebAuthn() {
  var _a, _b;
  return !!(isBrowser() && "PublicKeyCredential" in window && window.PublicKeyCredential && "credentials" in navigator && typeof ((_a = navigator === null || navigator === void 0 ? void 0 : navigator.credentials) === null || _a === void 0 ? void 0 : _a.create) === "function" && typeof ((_b = navigator === null || navigator === void 0 ? void 0 : navigator.credentials) === null || _b === void 0 ? void 0 : _b.get) === "function");
}
async function createCredential(options) {
  try {
    const response = await navigator.credentials.create(
      /** we assert the type here until typescript types are updated */
      options
    );
    if (!response) {
      return {
        data: null,
        error: new WebAuthnUnknownError("Empty credential response", response)
      };
    }
    if (!(response instanceof PublicKeyCredential)) {
      return {
        data: null,
        error: new WebAuthnUnknownError("Browser returned unexpected credential type", response)
      };
    }
    return {
      data: response,
      error: null
    };
  } catch (err) {
    return {
      data: null,
      error: identifyRegistrationError({
        error: err,
        options
      })
    };
  }
}
async function getCredential(options) {
  try {
    const response = await navigator.credentials.get(
      /** we assert the type here until typescript types are updated */
      options
    );
    if (!response) {
      return {
        data: null,
        error: new WebAuthnUnknownError("Empty credential response", response)
      };
    }
    if (!(response instanceof PublicKeyCredential)) {
      return {
        data: null,
        error: new WebAuthnUnknownError("Browser returned unexpected credential type", response)
      };
    }
    return {
      data: response,
      error: null
    };
  } catch (err) {
    return {
      data: null,
      error: identifyAuthenticationError({
        error: err,
        options
      })
    };
  }
}
var DEFAULT_CREATION_OPTIONS = {
  hints: [
    "security-key"
  ],
  authenticatorSelection: {
    authenticatorAttachment: "cross-platform",
    requireResidentKey: false,
    /** set to preferred because older yubikeys don't have PIN/Biometric */
    userVerification: "preferred",
    residentKey: "discouraged"
  },
  attestation: "direct"
};
var DEFAULT_REQUEST_OPTIONS = {
  /** set to preferred because older yubikeys don't have PIN/Biometric */
  userVerification: "preferred",
  hints: [
    "security-key"
  ],
  attestation: "direct"
};
function deepMerge(...sources) {
  const isObject = (val) => val !== null && typeof val === "object" && !Array.isArray(val);
  const isArrayBufferLike = (val) => val instanceof ArrayBuffer || ArrayBuffer.isView(val);
  const result = {};
  for (const source of sources) {
    if (!source) continue;
    for (const key in source) {
      const value = source[key];
      if (value === void 0) continue;
      if (Array.isArray(value)) {
        result[key] = value;
      } else if (isArrayBufferLike(value)) {
        result[key] = value;
      } else if (isObject(value)) {
        const existing = result[key];
        if (isObject(existing)) {
          result[key] = deepMerge(existing, value);
        } else {
          result[key] = deepMerge(value);
        }
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}
function mergeCredentialCreationOptions(baseOptions, overrides) {
  return deepMerge(DEFAULT_CREATION_OPTIONS, baseOptions, overrides || {});
}
function mergeCredentialRequestOptions(baseOptions, overrides) {
  return deepMerge(DEFAULT_REQUEST_OPTIONS, baseOptions, overrides || {});
}
var WebAuthnApi = class {
  constructor(client) {
    this.client = client;
    this.enroll = this._enroll.bind(this);
    this.challenge = this._challenge.bind(this);
    this.verify = this._verify.bind(this);
    this.authenticate = this._authenticate.bind(this);
    this.register = this._register.bind(this);
  }
  /**
     * Enroll a new WebAuthn factor.
     * Creates an unverified WebAuthn factor that must be verified with a credential.
     *
     * @experimental This method is experimental and may change in future releases
     * @param {Omit<MFAEnrollWebauthnParams, 'factorType'>} params - Enrollment parameters (friendlyName required)
     * @returns {Promise<AuthMFAEnrollWebauthnResponse>} Enrolled factor details or error
     * @see {@link https://w3c.github.io/webauthn/#sctn-registering-a-new-credential W3C WebAuthn Spec - Registering a New Credential}
     */
  async _enroll(params) {
    return this.client.mfa.enroll(Object.assign(Object.assign({}, params), {
      factorType: "webauthn"
    }));
  }
  /**
     * Challenge for WebAuthn credential creation or authentication.
     * Combines server challenge with browser credential operations.
     * Handles both registration (create) and authentication (request) flows.
     *
     * @experimental This method is experimental and may change in future releases
     * @param {MFAChallengeWebauthnParams & { friendlyName?: string; signal?: AbortSignal }} params - Challenge parameters including factorId
     * @param {Object} overrides - Allows you to override the parameters passed to navigator.credentials
     * @param {PublicKeyCredentialCreationOptionsFuture} overrides.create - Override options for credential creation
     * @param {PublicKeyCredentialRequestOptionsFuture} overrides.request - Override options for credential request
     * @returns {Promise<RequestResult>} Challenge response with credential or error
     * @see {@link https://w3c.github.io/webauthn/#sctn-credential-creation W3C WebAuthn Spec - Credential Creation}
     * @see {@link https://w3c.github.io/webauthn/#sctn-verifying-assertion W3C WebAuthn Spec - Verifying Assertion}
     */
  async _challenge({ factorId, webauthn, friendlyName, signal }, overrides) {
    var _a;
    try {
      const { data: challengeResponse, error: challengeError } = await this.client.mfa.challenge({
        factorId,
        webauthn
      });
      if (!challengeResponse) {
        return {
          data: null,
          error: challengeError
        };
      }
      const abortSignal = signal !== null && signal !== void 0 ? signal : webAuthnAbortService.createNewAbortSignal();
      if (challengeResponse.webauthn.type === "create") {
        const { user } = challengeResponse.webauthn.credential_options.publicKey;
        if (!user.name) {
          const nameToUse = friendlyName;
          if (!nameToUse) {
            const currentUser2 = await this.client.getUser();
            const userData = currentUser2.data.user;
            const fallbackName = ((_a = userData === null || userData === void 0 ? void 0 : userData.user_metadata) === null || _a === void 0 ? void 0 : _a.name) || (userData === null || userData === void 0 ? void 0 : userData.email) || (userData === null || userData === void 0 ? void 0 : userData.id) || "User";
            user.name = `${user.id}:${fallbackName}`;
          } else {
            user.name = `${user.id}:${nameToUse}`;
          }
        }
        if (!user.displayName) {
          user.displayName = user.name;
        }
      }
      switch (challengeResponse.webauthn.type) {
        case "create": {
          const options = mergeCredentialCreationOptions(challengeResponse.webauthn.credential_options.publicKey, overrides === null || overrides === void 0 ? void 0 : overrides.create);
          const { data, error } = await createCredential({
            publicKey: options,
            signal: abortSignal
          });
          if (data) {
            return {
              data: {
                factorId,
                challengeId: challengeResponse.id,
                webauthn: {
                  type: challengeResponse.webauthn.type,
                  credential_response: data
                }
              },
              error: null
            };
          }
          return {
            data: null,
            error
          };
        }
        case "request": {
          const options = mergeCredentialRequestOptions(challengeResponse.webauthn.credential_options.publicKey, overrides === null || overrides === void 0 ? void 0 : overrides.request);
          const { data, error } = await getCredential(Object.assign(Object.assign({}, challengeResponse.webauthn.credential_options), {
            publicKey: options,
            signal: abortSignal
          }));
          if (data) {
            return {
              data: {
                factorId,
                challengeId: challengeResponse.id,
                webauthn: {
                  type: challengeResponse.webauthn.type,
                  credential_response: data
                }
              },
              error: null
            };
          }
          return {
            data: null,
            error
          };
        }
      }
    } catch (error) {
      if (isAuthError(error)) {
        return {
          data: null,
          error
        };
      }
      return {
        data: null,
        error: new AuthUnknownError("Unexpected error in challenge", error)
      };
    }
  }
  /**
     * Verify a WebAuthn credential with the server.
     * Completes the WebAuthn ceremony by sending the credential to the server for verification.
     *
     * @experimental This method is experimental and may change in future releases
     * @param {Object} params - Verification parameters
     * @param {string} params.challengeId - ID of the challenge being verified
     * @param {string} params.factorId - ID of the WebAuthn factor
     * @param {MFAVerifyWebauthnParams<T>['webauthn']} params.webauthn - WebAuthn credential response
     * @returns {Promise<AuthMFAVerifyResponse>} Verification result with session or error
     * @see {@link https://w3c.github.io/webauthn/#sctn-verifying-assertion W3C WebAuthn Spec - Verifying an Authentication Assertion}
     * */
  async _verify({ challengeId, factorId, webauthn }) {
    return this.client.mfa.verify({
      factorId,
      challengeId,
      webauthn
    });
  }
  /**
     * Complete WebAuthn authentication flow.
     * Performs challenge and verification in a single operation for existing credentials.
     *
     * @experimental This method is experimental and may change in future releases
     * @param {Object} params - Authentication parameters
     * @param {string} params.factorId - ID of the WebAuthn factor to authenticate with
     * @param {Object} params.webauthn - WebAuthn configuration
     * @param {string} params.webauthn.rpId - Relying Party ID (defaults to current hostname)
     * @param {string[]} params.webauthn.rpOrigins - Allowed origins (defaults to current origin)
     * @param {AbortSignal} params.webauthn.signal - Optional abort signal
     * @param {PublicKeyCredentialRequestOptionsFuture} overrides - Override options for navigator.credentials.get
     * @returns {Promise<RequestResult<AuthMFAVerifyResponseData, WebAuthnError | AuthError>>} Authentication result
     * @see {@link https://w3c.github.io/webauthn/#sctn-authentication W3C WebAuthn Spec - Authentication Ceremony}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/PublicKeyCredentialRequestOptions MDN - PublicKeyCredentialRequestOptions}
     */
  async _authenticate({ factorId, webauthn: { rpId = typeof window !== "undefined" ? window.location.hostname : void 0, rpOrigins = typeof window !== "undefined" ? [
    window.location.origin
  ] : void 0, signal } = {} }, overrides) {
    if (!rpId) {
      return {
        data: null,
        error: new AuthError("rpId is required for WebAuthn authentication")
      };
    }
    try {
      if (!browserSupportsWebAuthn()) {
        return {
          data: null,
          error: new AuthUnknownError("Browser does not support WebAuthn", null)
        };
      }
      const { data: challengeResponse, error: challengeError } = await this.challenge({
        factorId,
        webauthn: {
          rpId,
          rpOrigins
        },
        signal
      }, {
        request: overrides
      });
      if (!challengeResponse) {
        return {
          data: null,
          error: challengeError
        };
      }
      const { webauthn } = challengeResponse;
      return this._verify({
        factorId,
        challengeId: challengeResponse.challengeId,
        webauthn: {
          type: webauthn.type,
          rpId,
          rpOrigins,
          credential_response: webauthn.credential_response
        }
      });
    } catch (error) {
      if (isAuthError(error)) {
        return {
          data: null,
          error
        };
      }
      return {
        data: null,
        error: new AuthUnknownError("Unexpected error in authenticate", error)
      };
    }
  }
  /**
     * Complete WebAuthn registration flow.
     * Performs enrollment, challenge, and verification in a single operation for new credentials.
     *
     * @experimental This method is experimental and may change in future releases
     * @param {Object} params - Registration parameters
     * @param {string} params.friendlyName - User-friendly name for the credential
     * @param {string} params.rpId - Relying Party ID (defaults to current hostname)
     * @param {string[]} params.rpOrigins - Allowed origins (defaults to current origin)
     * @param {AbortSignal} params.signal - Optional abort signal
     * @param {PublicKeyCredentialCreationOptionsFuture} overrides - Override options for navigator.credentials.create
     * @returns {Promise<RequestResult<AuthMFAVerifyResponseData, WebAuthnError | AuthError>>} Registration result
     * @see {@link https://w3c.github.io/webauthn/#sctn-registering-a-new-credential W3C WebAuthn Spec - Registration Ceremony}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/PublicKeyCredentialCreationOptions MDN - PublicKeyCredentialCreationOptions}
     */
  async _register({ friendlyName, webauthn: { rpId = typeof window !== "undefined" ? window.location.hostname : void 0, rpOrigins = typeof window !== "undefined" ? [
    window.location.origin
  ] : void 0, signal } = {} }, overrides) {
    if (!rpId) {
      return {
        data: null,
        error: new AuthError("rpId is required for WebAuthn registration")
      };
    }
    try {
      if (!browserSupportsWebAuthn()) {
        return {
          data: null,
          error: new AuthUnknownError("Browser does not support WebAuthn", null)
        };
      }
      const { data: factor, error: enrollError } = await this._enroll({
        friendlyName
      });
      if (!factor) {
        await this.client.mfa.listFactors().then((factors) => {
          var _a;
          return (_a = factors.data) === null || _a === void 0 ? void 0 : _a.all.find((v) => v.factor_type === "webauthn" && v.friendly_name === friendlyName && v.status !== "unverified");
        }).then((factor2) => factor2 ? this.client.mfa.unenroll({
          factorId: factor2 === null || factor2 === void 0 ? void 0 : factor2.id
        }) : void 0);
        return {
          data: null,
          error: enrollError
        };
      }
      const { data: challengeResponse, error: challengeError } = await this._challenge({
        factorId: factor.id,
        friendlyName: factor.friendly_name,
        webauthn: {
          rpId,
          rpOrigins
        },
        signal
      }, {
        create: overrides
      });
      if (!challengeResponse) {
        return {
          data: null,
          error: challengeError
        };
      }
      return this._verify({
        factorId: factor.id,
        challengeId: challengeResponse.challengeId,
        webauthn: {
          rpId,
          rpOrigins,
          type: challengeResponse.webauthn.type,
          credential_response: challengeResponse.webauthn.credential_response
        }
      });
    } catch (error) {
      if (isAuthError(error)) {
        return {
          data: null,
          error
        };
      }
      return {
        data: null,
        error: new AuthUnknownError("Unexpected error in register", error)
      };
    }
  }
};

// C:/Users/Jmarcum/AppData/Local/deno/npm/registry.npmjs.org/@supabase/auth-js/2.98.0/dist/module/GoTrueClient.js
polyfillGlobalThis();
var DEFAULT_OPTIONS = {
  url: GOTRUE_URL,
  storageKey: STORAGE_KEY,
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: true,
  headers: DEFAULT_HEADERS2,
  flowType: "implicit",
  debug: false,
  hasCustomAuthorizationHeader: false,
  throwOnError: false,
  lockAcquireTimeout: 5e3,
  skipAutoInitialize: false
};
async function lockNoOp(name, acquireTimeout, fn) {
  return await fn();
}
var GLOBAL_JWKS = {};
var GoTrueClient = class _GoTrueClient {
  /**
     * The JWKS used for verifying asymmetric JWTs
     */
  get jwks() {
    var _a, _b;
    return (_b = (_a = GLOBAL_JWKS[this.storageKey]) === null || _a === void 0 ? void 0 : _a.jwks) !== null && _b !== void 0 ? _b : {
      keys: []
    };
  }
  set jwks(value) {
    GLOBAL_JWKS[this.storageKey] = Object.assign(Object.assign({}, GLOBAL_JWKS[this.storageKey]), {
      jwks: value
    });
  }
  get jwks_cached_at() {
    var _a, _b;
    return (_b = (_a = GLOBAL_JWKS[this.storageKey]) === null || _a === void 0 ? void 0 : _a.cachedAt) !== null && _b !== void 0 ? _b : Number.MIN_SAFE_INTEGER;
  }
  set jwks_cached_at(value) {
    GLOBAL_JWKS[this.storageKey] = Object.assign(Object.assign({}, GLOBAL_JWKS[this.storageKey]), {
      cachedAt: value
    });
  }
  /**
     * Create a new client for use in the browser.
     *
     * @example
     * ```ts
     * import { GoTrueClient } from '@supabase/auth-js'
     *
     * const auth = new GoTrueClient({
     *   url: 'https://xyzcompany.supabase.co/auth/v1',
     *   headers: { apikey: 'public-anon-key' },
     *   storageKey: 'supabase-auth',
     * })
     * ```
     */
  constructor(options) {
    var _a, _b, _c;
    this.userStorage = null;
    this.memoryStorage = null;
    this.stateChangeEmitters = /* @__PURE__ */ new Map();
    this.autoRefreshTicker = null;
    this.autoRefreshTickTimeout = null;
    this.visibilityChangedCallback = null;
    this.refreshingDeferred = null;
    this.initializePromise = null;
    this.detectSessionInUrl = true;
    this.hasCustomAuthorizationHeader = false;
    this.suppressGetSessionWarning = false;
    this.lockAcquired = false;
    this.pendingInLock = [];
    this.broadcastChannel = null;
    this.logger = console.log;
    const settings = Object.assign(Object.assign({}, DEFAULT_OPTIONS), options);
    this.storageKey = settings.storageKey;
    this.instanceID = (_a = _GoTrueClient.nextInstanceID[this.storageKey]) !== null && _a !== void 0 ? _a : 0;
    _GoTrueClient.nextInstanceID[this.storageKey] = this.instanceID + 1;
    this.logDebugMessages = !!settings.debug;
    if (typeof settings.debug === "function") {
      this.logger = settings.debug;
    }
    if (this.instanceID > 0 && isBrowser()) {
      const message = `${this._logPrefix()} Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key.`;
      console.warn(message);
      if (this.logDebugMessages) {
        console.trace(message);
      }
    }
    this.persistSession = settings.persistSession;
    this.autoRefreshToken = settings.autoRefreshToken;
    this.admin = new GoTrueAdminApi({
      url: settings.url,
      headers: settings.headers,
      fetch: settings.fetch
    });
    this.url = settings.url;
    this.headers = settings.headers;
    this.fetch = resolveFetch3(settings.fetch);
    this.lock = settings.lock || lockNoOp;
    this.detectSessionInUrl = settings.detectSessionInUrl;
    this.flowType = settings.flowType;
    this.hasCustomAuthorizationHeader = settings.hasCustomAuthorizationHeader;
    this.throwOnError = settings.throwOnError;
    this.lockAcquireTimeout = settings.lockAcquireTimeout;
    if (settings.lock) {
      this.lock = settings.lock;
    } else if (this.persistSession && isBrowser() && ((_b = globalThis === null || globalThis === void 0 ? void 0 : globalThis.navigator) === null || _b === void 0 ? void 0 : _b.locks)) {
      this.lock = navigatorLock;
    } else {
      this.lock = lockNoOp;
    }
    if (!this.jwks) {
      this.jwks = {
        keys: []
      };
      this.jwks_cached_at = Number.MIN_SAFE_INTEGER;
    }
    this.mfa = {
      verify: this._verify.bind(this),
      enroll: this._enroll.bind(this),
      unenroll: this._unenroll.bind(this),
      challenge: this._challenge.bind(this),
      listFactors: this._listFactors.bind(this),
      challengeAndVerify: this._challengeAndVerify.bind(this),
      getAuthenticatorAssuranceLevel: this._getAuthenticatorAssuranceLevel.bind(this),
      webauthn: new WebAuthnApi(this)
    };
    this.oauth = {
      getAuthorizationDetails: this._getAuthorizationDetails.bind(this),
      approveAuthorization: this._approveAuthorization.bind(this),
      denyAuthorization: this._denyAuthorization.bind(this),
      listGrants: this._listOAuthGrants.bind(this),
      revokeGrant: this._revokeOAuthGrant.bind(this)
    };
    if (this.persistSession) {
      if (settings.storage) {
        this.storage = settings.storage;
      } else {
        if (supportsLocalStorage()) {
          this.storage = globalThis.localStorage;
        } else {
          this.memoryStorage = {};
          this.storage = memoryLocalStorageAdapter(this.memoryStorage);
        }
      }
      if (settings.userStorage) {
        this.userStorage = settings.userStorage;
      }
    } else {
      this.memoryStorage = {};
      this.storage = memoryLocalStorageAdapter(this.memoryStorage);
    }
    if (isBrowser() && globalThis.BroadcastChannel && this.persistSession && this.storageKey) {
      try {
        this.broadcastChannel = new globalThis.BroadcastChannel(this.storageKey);
      } catch (e) {
        console.error("Failed to create a new BroadcastChannel, multi-tab state changes will not be available", e);
      }
      (_c = this.broadcastChannel) === null || _c === void 0 ? void 0 : _c.addEventListener("message", async (event) => {
        this._debug("received broadcast notification from other tab or client", event);
        try {
          await this._notifyAllSubscribers(event.data.event, event.data.session, false);
        } catch (error) {
          this._debug("#broadcastChannel", "error", error);
        }
      });
    }
    if (!settings.skipAutoInitialize) {
      this.initialize().catch((error) => {
        this._debug("#initialize()", "error", error);
      });
    }
  }
  /**
     * Returns whether error throwing mode is enabled for this client.
     */
  isThrowOnErrorEnabled() {
    return this.throwOnError;
  }
  /**
     * Centralizes return handling with optional error throwing. When `throwOnError` is enabled
     * and the provided result contains a non-nullish error, the error is thrown instead of
     * being returned. This ensures consistent behavior across all public API methods.
     */
  _returnResult(result) {
    if (this.throwOnError && result && result.error) {
      throw result.error;
    }
    return result;
  }
  _logPrefix() {
    return `GoTrueClient@${this.storageKey}:${this.instanceID} (${version3}) ${(/* @__PURE__ */ new Date()).toISOString()}`;
  }
  _debug(...args) {
    if (this.logDebugMessages) {
      this.logger(this._logPrefix(), ...args);
    }
    return this;
  }
  /**
     * Initializes the client session either from the url or from storage.
     * This method is automatically called when instantiating the client, but should also be called
     * manually when checking for an error from an auth redirect (oauth, magiclink, password recovery, etc).
     */
  async initialize() {
    if (this.initializePromise) {
      return await this.initializePromise;
    }
    this.initializePromise = (async () => {
      return await this._acquireLock(this.lockAcquireTimeout, async () => {
        return await this._initialize();
      });
    })();
    return await this.initializePromise;
  }
  /**
     * IMPORTANT:
     * 1. Never throw in this method, as it is called from the constructor
     * 2. Never return a session from this method as it would be cached over
     *    the whole lifetime of the client
     */
  async _initialize() {
    var _a;
    try {
      let params = {};
      let callbackUrlType = "none";
      if (isBrowser()) {
        params = parseParametersFromURL(window.location.href);
        if (this._isImplicitGrantCallback(params)) {
          callbackUrlType = "implicit";
        } else if (await this._isPKCECallback(params)) {
          callbackUrlType = "pkce";
        }
      }
      if (isBrowser() && this.detectSessionInUrl && callbackUrlType !== "none") {
        const { data, error } = await this._getSessionFromURL(params, callbackUrlType);
        if (error) {
          this._debug("#_initialize()", "error detecting session from URL", error);
          if (isAuthImplicitGrantRedirectError(error)) {
            const errorCode = (_a = error.details) === null || _a === void 0 ? void 0 : _a.code;
            if (errorCode === "identity_already_exists" || errorCode === "identity_not_found" || errorCode === "single_identity_not_deletable") {
              return {
                error
              };
            }
          }
          return {
            error
          };
        }
        const { session, redirectType } = data;
        this._debug("#_initialize()", "detected session in URL", session, "redirect type", redirectType);
        await this._saveSession(session);
        setTimeout(async () => {
          if (redirectType === "recovery") {
            await this._notifyAllSubscribers("PASSWORD_RECOVERY", session);
          } else {
            await this._notifyAllSubscribers("SIGNED_IN", session);
          }
        }, 0);
        return {
          error: null
        };
      }
      await this._recoverAndRefresh();
      return {
        error: null
      };
    } catch (error) {
      if (isAuthError(error)) {
        return this._returnResult({
          error
        });
      }
      return this._returnResult({
        error: new AuthUnknownError("Unexpected error during initialization", error)
      });
    } finally {
      await this._handleVisibilityChange();
      this._debug("#_initialize()", "end");
    }
  }
  /**
     * Creates a new anonymous user.
     *
     * @returns A session where the is_anonymous claim in the access token JWT set to true
     */
  async signInAnonymously(credentials) {
    var _a, _b, _c;
    try {
      const res = await _request(this.fetch, "POST", `${this.url}/signup`, {
        headers: this.headers,
        body: {
          data: (_b = (_a = credentials === null || credentials === void 0 ? void 0 : credentials.options) === null || _a === void 0 ? void 0 : _a.data) !== null && _b !== void 0 ? _b : {},
          gotrue_meta_security: {
            captcha_token: (_c = credentials === null || credentials === void 0 ? void 0 : credentials.options) === null || _c === void 0 ? void 0 : _c.captchaToken
          }
        },
        xform: _sessionResponse
      });
      const { data, error } = res;
      if (error || !data) {
        return this._returnResult({
          data: {
            user: null,
            session: null
          },
          error
        });
      }
      const session = data.session;
      const user = data.user;
      if (data.session) {
        await this._saveSession(data.session);
        await this._notifyAllSubscribers("SIGNED_IN", session);
      }
      return this._returnResult({
        data: {
          user,
          session
        },
        error: null
      });
    } catch (error) {
      if (isAuthError(error)) {
        return this._returnResult({
          data: {
            user: null,
            session: null
          },
          error
        });
      }
      throw error;
    }
  }
  /**
     * Creates a new user.
     *
     * Be aware that if a user account exists in the system you may get back an
     * error message that attempts to hide this information from the user.
     * This method has support for PKCE via email signups. The PKCE flow cannot be used when autoconfirm is enabled.
     *
     * @returns A logged-in session if the server has "autoconfirm" ON
     * @returns A user if the server has "autoconfirm" OFF
     */
  async signUp(credentials) {
    var _a, _b, _c;
    try {
      let res;
      if ("email" in credentials) {
        const { email, password, options } = credentials;
        let codeChallenge = null;
        let codeChallengeMethod = null;
        if (this.flowType === "pkce") {
          ;
          [codeChallenge, codeChallengeMethod] = await getCodeChallengeAndMethod(this.storage, this.storageKey);
        }
        res = await _request(this.fetch, "POST", `${this.url}/signup`, {
          headers: this.headers,
          redirectTo: options === null || options === void 0 ? void 0 : options.emailRedirectTo,
          body: {
            email,
            password,
            data: (_a = options === null || options === void 0 ? void 0 : options.data) !== null && _a !== void 0 ? _a : {},
            gotrue_meta_security: {
              captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken
            },
            code_challenge: codeChallenge,
            code_challenge_method: codeChallengeMethod
          },
          xform: _sessionResponse
        });
      } else if ("phone" in credentials) {
        const { phone, password, options } = credentials;
        res = await _request(this.fetch, "POST", `${this.url}/signup`, {
          headers: this.headers,
          body: {
            phone,
            password,
            data: (_b = options === null || options === void 0 ? void 0 : options.data) !== null && _b !== void 0 ? _b : {},
            channel: (_c = options === null || options === void 0 ? void 0 : options.channel) !== null && _c !== void 0 ? _c : "sms",
            gotrue_meta_security: {
              captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken
            }
          },
          xform: _sessionResponse
        });
      } else {
        throw new AuthInvalidCredentialsError("You must provide either an email or phone number and a password");
      }
      const { data, error } = res;
      if (error || !data) {
        await removeItemAsync(this.storage, `${this.storageKey}-code-verifier`);
        return this._returnResult({
          data: {
            user: null,
            session: null
          },
          error
        });
      }
      const session = data.session;
      const user = data.user;
      if (data.session) {
        await this._saveSession(data.session);
        await this._notifyAllSubscribers("SIGNED_IN", session);
      }
      return this._returnResult({
        data: {
          user,
          session
        },
        error: null
      });
    } catch (error) {
      await removeItemAsync(this.storage, `${this.storageKey}-code-verifier`);
      if (isAuthError(error)) {
        return this._returnResult({
          data: {
            user: null,
            session: null
          },
          error
        });
      }
      throw error;
    }
  }
  /**
     * Log in an existing user with an email and password or phone and password.
     *
     * Be aware that you may get back an error message that will not distinguish
     * between the cases where the account does not exist or that the
     * email/phone and password combination is wrong or that the account can only
     * be accessed via social login.
     */
  async signInWithPassword(credentials) {
    try {
      let res;
      if ("email" in credentials) {
        const { email, password, options } = credentials;
        res = await _request(this.fetch, "POST", `${this.url}/token?grant_type=password`, {
          headers: this.headers,
          body: {
            email,
            password,
            gotrue_meta_security: {
              captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken
            }
          },
          xform: _sessionResponsePassword
        });
      } else if ("phone" in credentials) {
        const { phone, password, options } = credentials;
        res = await _request(this.fetch, "POST", `${this.url}/token?grant_type=password`, {
          headers: this.headers,
          body: {
            phone,
            password,
            gotrue_meta_security: {
              captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken
            }
          },
          xform: _sessionResponsePassword
        });
      } else {
        throw new AuthInvalidCredentialsError("You must provide either an email or phone number and a password");
      }
      const { data, error } = res;
      if (error) {
        return this._returnResult({
          data: {
            user: null,
            session: null
          },
          error
        });
      } else if (!data || !data.session || !data.user) {
        const invalidTokenError = new AuthInvalidTokenResponseError();
        return this._returnResult({
          data: {
            user: null,
            session: null
          },
          error: invalidTokenError
        });
      }
      if (data.session) {
        await this._saveSession(data.session);
        await this._notifyAllSubscribers("SIGNED_IN", data.session);
      }
      return this._returnResult({
        data: Object.assign({
          user: data.user,
          session: data.session
        }, data.weak_password ? {
          weakPassword: data.weak_password
        } : null),
        error
      });
    } catch (error) {
      if (isAuthError(error)) {
        return this._returnResult({
          data: {
            user: null,
            session: null
          },
          error
        });
      }
      throw error;
    }
  }
  /**
     * Log in an existing user via a third-party provider.
     * This method supports the PKCE flow.
     */
  async signInWithOAuth(credentials) {
    var _a, _b, _c, _d;
    return await this._handleProviderSignIn(credentials.provider, {
      redirectTo: (_a = credentials.options) === null || _a === void 0 ? void 0 : _a.redirectTo,
      scopes: (_b = credentials.options) === null || _b === void 0 ? void 0 : _b.scopes,
      queryParams: (_c = credentials.options) === null || _c === void 0 ? void 0 : _c.queryParams,
      skipBrowserRedirect: (_d = credentials.options) === null || _d === void 0 ? void 0 : _d.skipBrowserRedirect
    });
  }
  /**
     * Log in an existing user by exchanging an Auth Code issued during the PKCE flow.
     */
  async exchangeCodeForSession(authCode) {
    await this.initializePromise;
    return this._acquireLock(this.lockAcquireTimeout, async () => {
      return this._exchangeCodeForSession(authCode);
    });
  }
  /**
     * Signs in a user by verifying a message signed by the user's private key.
     * Supports Ethereum (via Sign-In-With-Ethereum) & Solana (Sign-In-With-Solana) standards,
     * both of which derive from the EIP-4361 standard
     * With slight variation on Solana's side.
     * @reference https://eips.ethereum.org/EIPS/eip-4361
     */
  async signInWithWeb3(credentials) {
    const { chain } = credentials;
    switch (chain) {
      case "ethereum":
        return await this.signInWithEthereum(credentials);
      case "solana":
        return await this.signInWithSolana(credentials);
      default:
        throw new Error(`@supabase/auth-js: Unsupported chain "${chain}"`);
    }
  }
  async signInWithEthereum(credentials) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    let message;
    let signature;
    if ("message" in credentials) {
      message = credentials.message;
      signature = credentials.signature;
    } else {
      const { chain, wallet, statement, options } = credentials;
      let resolvedWallet;
      if (!isBrowser()) {
        if (typeof wallet !== "object" || !(options === null || options === void 0 ? void 0 : options.url)) {
          throw new Error("@supabase/auth-js: Both wallet and url must be specified in non-browser environments.");
        }
        resolvedWallet = wallet;
      } else if (typeof wallet === "object") {
        resolvedWallet = wallet;
      } else {
        const windowAny = window;
        if ("ethereum" in windowAny && typeof windowAny.ethereum === "object" && "request" in windowAny.ethereum && typeof windowAny.ethereum.request === "function") {
          resolvedWallet = windowAny.ethereum;
        } else {
          throw new Error(`@supabase/auth-js: No compatible Ethereum wallet interface on the window object (window.ethereum) detected. Make sure the user already has a wallet installed and connected for this app. Prefer passing the wallet interface object directly to signInWithWeb3({ chain: 'ethereum', wallet: resolvedUserWallet }) instead.`);
        }
      }
      const url = new URL((_a = options === null || options === void 0 ? void 0 : options.url) !== null && _a !== void 0 ? _a : window.location.href);
      const accounts = await resolvedWallet.request({
        method: "eth_requestAccounts"
      }).then((accs) => accs).catch(() => {
        throw new Error(`@supabase/auth-js: Wallet method eth_requestAccounts is missing or invalid`);
      });
      if (!accounts || accounts.length === 0) {
        throw new Error(`@supabase/auth-js: No accounts available. Please ensure the wallet is connected.`);
      }
      const address = getAddress(accounts[0]);
      let chainId = (_b = options === null || options === void 0 ? void 0 : options.signInWithEthereum) === null || _b === void 0 ? void 0 : _b.chainId;
      if (!chainId) {
        const chainIdHex = await resolvedWallet.request({
          method: "eth_chainId"
        });
        chainId = fromHex(chainIdHex);
      }
      const siweMessage = {
        domain: url.host,
        address,
        statement,
        uri: url.href,
        version: "1",
        chainId,
        nonce: (_c = options === null || options === void 0 ? void 0 : options.signInWithEthereum) === null || _c === void 0 ? void 0 : _c.nonce,
        issuedAt: (_e = (_d = options === null || options === void 0 ? void 0 : options.signInWithEthereum) === null || _d === void 0 ? void 0 : _d.issuedAt) !== null && _e !== void 0 ? _e : /* @__PURE__ */ new Date(),
        expirationTime: (_f = options === null || options === void 0 ? void 0 : options.signInWithEthereum) === null || _f === void 0 ? void 0 : _f.expirationTime,
        notBefore: (_g = options === null || options === void 0 ? void 0 : options.signInWithEthereum) === null || _g === void 0 ? void 0 : _g.notBefore,
        requestId: (_h = options === null || options === void 0 ? void 0 : options.signInWithEthereum) === null || _h === void 0 ? void 0 : _h.requestId,
        resources: (_j = options === null || options === void 0 ? void 0 : options.signInWithEthereum) === null || _j === void 0 ? void 0 : _j.resources
      };
      message = createSiweMessage(siweMessage);
      signature = await resolvedWallet.request({
        method: "personal_sign",
        params: [
          toHex(message),
          address
        ]
      });
    }
    try {
      const { data, error } = await _request(this.fetch, "POST", `${this.url}/token?grant_type=web3`, {
        headers: this.headers,
        body: Object.assign({
          chain: "ethereum",
          message,
          signature
        }, ((_k = credentials.options) === null || _k === void 0 ? void 0 : _k.captchaToken) ? {
          gotrue_meta_security: {
            captcha_token: (_l = credentials.options) === null || _l === void 0 ? void 0 : _l.captchaToken
          }
        } : null),
        xform: _sessionResponse
      });
      if (error) {
        throw error;
      }
      if (!data || !data.session || !data.user) {
        const invalidTokenError = new AuthInvalidTokenResponseError();
        return this._returnResult({
          data: {
            user: null,
            session: null
          },
          error: invalidTokenError
        });
      }
      if (data.session) {
        await this._saveSession(data.session);
        await this._notifyAllSubscribers("SIGNED_IN", data.session);
      }
      return this._returnResult({
        data: Object.assign({}, data),
        error
      });
    } catch (error) {
      if (isAuthError(error)) {
        return this._returnResult({
          data: {
            user: null,
            session: null
          },
          error
        });
      }
      throw error;
    }
  }
  async signInWithSolana(credentials) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    let message;
    let signature;
    if ("message" in credentials) {
      message = credentials.message;
      signature = credentials.signature;
    } else {
      const { chain, wallet, statement, options } = credentials;
      let resolvedWallet;
      if (!isBrowser()) {
        if (typeof wallet !== "object" || !(options === null || options === void 0 ? void 0 : options.url)) {
          throw new Error("@supabase/auth-js: Both wallet and url must be specified in non-browser environments.");
        }
        resolvedWallet = wallet;
      } else if (typeof wallet === "object") {
        resolvedWallet = wallet;
      } else {
        const windowAny = window;
        if ("solana" in windowAny && typeof windowAny.solana === "object" && ("signIn" in windowAny.solana && typeof windowAny.solana.signIn === "function" || "signMessage" in windowAny.solana && typeof windowAny.solana.signMessage === "function")) {
          resolvedWallet = windowAny.solana;
        } else {
          throw new Error(`@supabase/auth-js: No compatible Solana wallet interface on the window object (window.solana) detected. Make sure the user already has a wallet installed and connected for this app. Prefer passing the wallet interface object directly to signInWithWeb3({ chain: 'solana', wallet: resolvedUserWallet }) instead.`);
        }
      }
      const url = new URL((_a = options === null || options === void 0 ? void 0 : options.url) !== null && _a !== void 0 ? _a : window.location.href);
      if ("signIn" in resolvedWallet && resolvedWallet.signIn) {
        const output = await resolvedWallet.signIn(Object.assign(Object.assign(Object.assign({
          issuedAt: (/* @__PURE__ */ new Date()).toISOString()
        }, options === null || options === void 0 ? void 0 : options.signInWithSolana), {
          // non-overridable properties
          version: "1",
          domain: url.host,
          uri: url.href
        }), statement ? {
          statement
        } : null));
        let outputToProcess;
        if (Array.isArray(output) && output[0] && typeof output[0] === "object") {
          outputToProcess = output[0];
        } else if (output && typeof output === "object" && "signedMessage" in output && "signature" in output) {
          outputToProcess = output;
        } else {
          throw new Error("@supabase/auth-js: Wallet method signIn() returned unrecognized value");
        }
        if ("signedMessage" in outputToProcess && "signature" in outputToProcess && (typeof outputToProcess.signedMessage === "string" || outputToProcess.signedMessage instanceof Uint8Array) && outputToProcess.signature instanceof Uint8Array) {
          message = typeof outputToProcess.signedMessage === "string" ? outputToProcess.signedMessage : new TextDecoder().decode(outputToProcess.signedMessage);
          signature = outputToProcess.signature;
        } else {
          throw new Error("@supabase/auth-js: Wallet method signIn() API returned object without signedMessage and signature fields");
        }
      } else {
        if (!("signMessage" in resolvedWallet) || typeof resolvedWallet.signMessage !== "function" || !("publicKey" in resolvedWallet) || typeof resolvedWallet !== "object" || !resolvedWallet.publicKey || !("toBase58" in resolvedWallet.publicKey) || typeof resolvedWallet.publicKey.toBase58 !== "function") {
          throw new Error("@supabase/auth-js: Wallet does not have a compatible signMessage() and publicKey.toBase58() API");
        }
        message = [
          `${url.host} wants you to sign in with your Solana account:`,
          resolvedWallet.publicKey.toBase58(),
          ...statement ? [
            "",
            statement,
            ""
          ] : [
            ""
          ],
          "Version: 1",
          `URI: ${url.href}`,
          `Issued At: ${(_c = (_b = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _b === void 0 ? void 0 : _b.issuedAt) !== null && _c !== void 0 ? _c : (/* @__PURE__ */ new Date()).toISOString()}`,
          ...((_d = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _d === void 0 ? void 0 : _d.notBefore) ? [
            `Not Before: ${options.signInWithSolana.notBefore}`
          ] : [],
          ...((_e = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _e === void 0 ? void 0 : _e.expirationTime) ? [
            `Expiration Time: ${options.signInWithSolana.expirationTime}`
          ] : [],
          ...((_f = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _f === void 0 ? void 0 : _f.chainId) ? [
            `Chain ID: ${options.signInWithSolana.chainId}`
          ] : [],
          ...((_g = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _g === void 0 ? void 0 : _g.nonce) ? [
            `Nonce: ${options.signInWithSolana.nonce}`
          ] : [],
          ...((_h = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _h === void 0 ? void 0 : _h.requestId) ? [
            `Request ID: ${options.signInWithSolana.requestId}`
          ] : [],
          ...((_k = (_j = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _j === void 0 ? void 0 : _j.resources) === null || _k === void 0 ? void 0 : _k.length) ? [
            "Resources",
            ...options.signInWithSolana.resources.map((resource) => `- ${resource}`)
          ] : []
        ].join("\n");
        const maybeSignature = await resolvedWallet.signMessage(new TextEncoder().encode(message), "utf8");
        if (!maybeSignature || !(maybeSignature instanceof Uint8Array)) {
          throw new Error("@supabase/auth-js: Wallet signMessage() API returned an recognized value");
        }
        signature = maybeSignature;
      }
    }
    try {
      const { data, error } = await _request(this.fetch, "POST", `${this.url}/token?grant_type=web3`, {
        headers: this.headers,
        body: Object.assign({
          chain: "solana",
          message,
          signature: bytesToBase64URL(signature)
        }, ((_l = credentials.options) === null || _l === void 0 ? void 0 : _l.captchaToken) ? {
          gotrue_meta_security: {
            captcha_token: (_m = credentials.options) === null || _m === void 0 ? void 0 : _m.captchaToken
          }
        } : null),
        xform: _sessionResponse
      });
      if (error) {
        throw error;
      }
      if (!data || !data.session || !data.user) {
        const invalidTokenError = new AuthInvalidTokenResponseError();
        return this._returnResult({
          data: {
            user: null,
            session: null
          },
          error: invalidTokenError
        });
      }
      if (data.session) {
        await this._saveSession(data.session);
        await this._notifyAllSubscribers("SIGNED_IN", data.session);
      }
      return this._returnResult({
        data: Object.assign({}, data),
        error
      });
    } catch (error) {
      if (isAuthError(error)) {
        return this._returnResult({
          data: {
            user: null,
            session: null
          },
          error
        });
      }
      throw error;
    }
  }
  async _exchangeCodeForSession(authCode) {
    const storageItem = await getItemAsync(this.storage, `${this.storageKey}-code-verifier`);
    const [codeVerifier, redirectType] = (storageItem !== null && storageItem !== void 0 ? storageItem : "").split("/");
    try {
      if (!codeVerifier && this.flowType === "pkce") {
        throw new AuthPKCECodeVerifierMissingError();
      }
      const { data, error } = await _request(this.fetch, "POST", `${this.url}/token?grant_type=pkce`, {
        headers: this.headers,
        body: {
          auth_code: authCode,
          code_verifier: codeVerifier
        },
        xform: _sessionResponse
      });
      await removeItemAsync(this.storage, `${this.storageKey}-code-verifier`);
      if (error) {
        throw error;
      }
      if (!data || !data.session || !data.user) {
        const invalidTokenError = new AuthInvalidTokenResponseError();
        return this._returnResult({
          data: {
            user: null,
            session: null,
            redirectType: null
          },
          error: invalidTokenError
        });
      }
      if (data.session) {
        await this._saveSession(data.session);
        await this._notifyAllSubscribers("SIGNED_IN", data.session);
      }
      return this._returnResult({
        data: Object.assign(Object.assign({}, data), {
          redirectType: redirectType !== null && redirectType !== void 0 ? redirectType : null
        }),
        error
      });
    } catch (error) {
      await removeItemAsync(this.storage, `${this.storageKey}-code-verifier`);
      if (isAuthError(error)) {
        return this._returnResult({
          data: {
            user: null,
            session: null,
            redirectType: null
          },
          error
        });
      }
      throw error;
    }
  }
  /**
     * Allows signing in with an OIDC ID token. The authentication provider used
     * should be enabled and configured.
     */
  async signInWithIdToken(credentials) {
    try {
      const { options, provider, token, access_token, nonce } = credentials;
      const res = await _request(this.fetch, "POST", `${this.url}/token?grant_type=id_token`, {
        headers: this.headers,
        body: {
          provider,
          id_token: token,
          access_token,
          nonce,
          gotrue_meta_security: {
            captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken
          }
        },
        xform: _sessionResponse
      });
      const { data, error } = res;
      if (error) {
        return this._returnResult({
          data: {
            user: null,
            session: null
          },
          error
        });
      } else if (!data || !data.session || !data.user) {
        const invalidTokenError = new AuthInvalidTokenResponseError();
        return this._returnResult({
          data: {
            user: null,
            session: null
          },
          error: invalidTokenError
        });
      }
      if (data.session) {
        await this._saveSession(data.session);
        await this._notifyAllSubscribers("SIGNED_IN", data.session);
      }
      return this._returnResult({
        data,
        error
      });
    } catch (error) {
      if (isAuthError(error)) {
        return this._returnResult({
          data: {
            user: null,
            session: null
          },
          error
        });
      }
      throw error;
    }
  }
  /**
     * Log in a user using magiclink or a one-time password (OTP).
     *
     * If the `{{ .ConfirmationURL }}` variable is specified in the email template, a magiclink will be sent.
     * If the `{{ .Token }}` variable is specified in the email template, an OTP will be sent.
     * If you're using phone sign-ins, only an OTP will be sent. You won't be able to send a magiclink for phone sign-ins.
     *
     * Be aware that you may get back an error message that will not distinguish
     * between the cases where the account does not exist or, that the account
     * can only be accessed via social login.
     *
     * Do note that you will need to configure a Whatsapp sender on Twilio
     * if you are using phone sign in with the 'whatsapp' channel. The whatsapp
     * channel is not supported on other providers
     * at this time.
     * This method supports PKCE when an email is passed.
     */
  async signInWithOtp(credentials) {
    var _a, _b, _c, _d, _e;
    try {
      if ("email" in credentials) {
        const { email, options } = credentials;
        let codeChallenge = null;
        let codeChallengeMethod = null;
        if (this.flowType === "pkce") {
          ;
          [codeChallenge, codeChallengeMethod] = await getCodeChallengeAndMethod(this.storage, this.storageKey);
        }
        const { error } = await _request(this.fetch, "POST", `${this.url}/otp`, {
          headers: this.headers,
          body: {
            email,
            data: (_a = options === null || options === void 0 ? void 0 : options.data) !== null && _a !== void 0 ? _a : {},
            create_user: (_b = options === null || options === void 0 ? void 0 : options.shouldCreateUser) !== null && _b !== void 0 ? _b : true,
            gotrue_meta_security: {
              captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken
            },
            code_challenge: codeChallenge,
            code_challenge_method: codeChallengeMethod
          },
          redirectTo: options === null || options === void 0 ? void 0 : options.emailRedirectTo
        });
        return this._returnResult({
          data: {
            user: null,
            session: null
          },
          error
        });
      }
      if ("phone" in credentials) {
        const { phone, options } = credentials;
        const { data, error } = await _request(this.fetch, "POST", `${this.url}/otp`, {
          headers: this.headers,
          body: {
            phone,
            data: (_c = options === null || options === void 0 ? void 0 : options.data) !== null && _c !== void 0 ? _c : {},
            create_user: (_d = options === null || options === void 0 ? void 0 : options.shouldCreateUser) !== null && _d !== void 0 ? _d : true,
            gotrue_meta_security: {
              captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken
            },
            channel: (_e = options === null || options === void 0 ? void 0 : options.channel) !== null && _e !== void 0 ? _e : "sms"
          }
        });
        return this._returnResult({
          data: {
            user: null,
            session: null,
            messageId: data === null || data === void 0 ? void 0 : data.message_id
          },
          error
        });
      }
      throw new AuthInvalidCredentialsError("You must provide either an email or phone number.");
    } catch (error) {
      await removeItemAsync(this.storage, `${this.storageKey}-code-verifier`);
      if (isAuthError(error)) {
        return this._returnResult({
          data: {
            user: null,
            session: null
          },
          error
        });
      }
      throw error;
    }
  }
  /**
     * Log in a user given a User supplied OTP or TokenHash received through mobile or email.
     */
  async verifyOtp(params) {
    var _a, _b;
    try {
      let redirectTo = void 0;
      let captchaToken = void 0;
      if ("options" in params) {
        redirectTo = (_a = params.options) === null || _a === void 0 ? void 0 : _a.redirectTo;
        captchaToken = (_b = params.options) === null || _b === void 0 ? void 0 : _b.captchaToken;
      }
      const { data, error } = await _request(this.fetch, "POST", `${this.url}/verify`, {
        headers: this.headers,
        body: Object.assign(Object.assign({}, params), {
          gotrue_meta_security: {
            captcha_token: captchaToken
          }
        }),
        redirectTo,
        xform: _sessionResponse
      });
      if (error) {
        throw error;
      }
      if (!data) {
        const tokenVerificationError = new Error("An error occurred on token verification.");
        throw tokenVerificationError;
      }
      const session = data.session;
      const user = data.user;
      if (session === null || session === void 0 ? void 0 : session.access_token) {
        await this._saveSession(session);
        await this._notifyAllSubscribers(params.type == "recovery" ? "PASSWORD_RECOVERY" : "SIGNED_IN", session);
      }
      return this._returnResult({
        data: {
          user,
          session
        },
        error: null
      });
    } catch (error) {
      if (isAuthError(error)) {
        return this._returnResult({
          data: {
            user: null,
            session: null
          },
          error
        });
      }
      throw error;
    }
  }
  /**
     * Attempts a single-sign on using an enterprise Identity Provider. A
     * successful SSO attempt will redirect the current page to the identity
     * provider authorization page. The redirect URL is implementation and SSO
     * protocol specific.
     *
     * You can use it by providing a SSO domain. Typically you can extract this
     * domain by asking users for their email address. If this domain is
     * registered on the Auth instance the redirect will use that organization's
     * currently active SSO Identity Provider for the login.
     *
     * If you have built an organization-specific login page, you can use the
     * organization's SSO Identity Provider UUID directly instead.
     */
  async signInWithSSO(params) {
    var _a, _b, _c, _d, _e;
    try {
      let codeChallenge = null;
      let codeChallengeMethod = null;
      if (this.flowType === "pkce") {
        ;
        [codeChallenge, codeChallengeMethod] = await getCodeChallengeAndMethod(this.storage, this.storageKey);
      }
      const result = await _request(this.fetch, "POST", `${this.url}/sso`, {
        body: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, "providerId" in params ? {
          provider_id: params.providerId
        } : null), "domain" in params ? {
          domain: params.domain
        } : null), {
          redirect_to: (_b = (_a = params.options) === null || _a === void 0 ? void 0 : _a.redirectTo) !== null && _b !== void 0 ? _b : void 0
        }), ((_c = params === null || params === void 0 ? void 0 : params.options) === null || _c === void 0 ? void 0 : _c.captchaToken) ? {
          gotrue_meta_security: {
            captcha_token: params.options.captchaToken
          }
        } : null), {
          skip_http_redirect: true,
          code_challenge: codeChallenge,
          code_challenge_method: codeChallengeMethod
        }),
        headers: this.headers,
        xform: _ssoResponse
      });
      if (((_d = result.data) === null || _d === void 0 ? void 0 : _d.url) && isBrowser() && !((_e = params.options) === null || _e === void 0 ? void 0 : _e.skipBrowserRedirect)) {
        window.location.assign(result.data.url);
      }
      return this._returnResult(result);
    } catch (error) {
      await removeItemAsync(this.storage, `${this.storageKey}-code-verifier`);
      if (isAuthError(error)) {
        return this._returnResult({
          data: null,
          error
        });
      }
      throw error;
    }
  }
  /**
     * Sends a reauthentication OTP to the user's email or phone number.
     * Requires the user to be signed-in.
     */
  async reauthenticate() {
    await this.initializePromise;
    return await this._acquireLock(this.lockAcquireTimeout, async () => {
      return await this._reauthenticate();
    });
  }
  async _reauthenticate() {
    try {
      return await this._useSession(async (result) => {
        const { data: { session }, error: sessionError } = result;
        if (sessionError) throw sessionError;
        if (!session) throw new AuthSessionMissingError();
        const { error } = await _request(this.fetch, "GET", `${this.url}/reauthenticate`, {
          headers: this.headers,
          jwt: session.access_token
        });
        return this._returnResult({
          data: {
            user: null,
            session: null
          },
          error
        });
      });
    } catch (error) {
      if (isAuthError(error)) {
        return this._returnResult({
          data: {
            user: null,
            session: null
          },
          error
        });
      }
      throw error;
    }
  }
  /**
     * Resends an existing signup confirmation email, email change email, SMS OTP or phone change OTP.
     */
  async resend(credentials) {
    try {
      const endpoint = `${this.url}/resend`;
      if ("email" in credentials) {
        const { email, type, options } = credentials;
        const { error } = await _request(this.fetch, "POST", endpoint, {
          headers: this.headers,
          body: {
            email,
            type,
            gotrue_meta_security: {
              captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken
            }
          },
          redirectTo: options === null || options === void 0 ? void 0 : options.emailRedirectTo
        });
        return this._returnResult({
          data: {
            user: null,
            session: null
          },
          error
        });
      } else if ("phone" in credentials) {
        const { phone, type, options } = credentials;
        const { data, error } = await _request(this.fetch, "POST", endpoint, {
          headers: this.headers,
          body: {
            phone,
            type,
            gotrue_meta_security: {
              captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken
            }
          }
        });
        return this._returnResult({
          data: {
            user: null,
            session: null,
            messageId: data === null || data === void 0 ? void 0 : data.message_id
          },
          error
        });
      }
      throw new AuthInvalidCredentialsError("You must provide either an email or phone number and a type");
    } catch (error) {
      if (isAuthError(error)) {
        return this._returnResult({
          data: {
            user: null,
            session: null
          },
          error
        });
      }
      throw error;
    }
  }
  /**
     * Returns the session, refreshing it if necessary.
     *
     * The session returned can be null if the session is not detected which can happen in the event a user is not signed-in or has logged out.
     *
     * **IMPORTANT:** This method loads values directly from the storage attached
     * to the client. If that storage is based on request cookies for example,
     * the values in it may not be authentic and therefore it's strongly advised
     * against using this method and its results in such circumstances. A warning
     * will be emitted if this is detected. Use {@link #getUser()} instead.
     */
  async getSession() {
    await this.initializePromise;
    const result = await this._acquireLock(this.lockAcquireTimeout, async () => {
      return this._useSession(async (result2) => {
        return result2;
      });
    });
    return result;
  }
  /**
     * Acquires a global lock based on the storage key.
     */
  async _acquireLock(acquireTimeout, fn) {
    this._debug("#_acquireLock", "begin", acquireTimeout);
    try {
      if (this.lockAcquired) {
        const last = this.pendingInLock.length ? this.pendingInLock[this.pendingInLock.length - 1] : Promise.resolve();
        const result = (async () => {
          await last;
          return await fn();
        })();
        this.pendingInLock.push((async () => {
          try {
            await result;
          } catch (e) {
          }
        })());
        return result;
      }
      return await this.lock(`lock:${this.storageKey}`, acquireTimeout, async () => {
        this._debug("#_acquireLock", "lock acquired for storage key", this.storageKey);
        try {
          this.lockAcquired = true;
          const result = fn();
          this.pendingInLock.push((async () => {
            try {
              await result;
            } catch (e) {
            }
          })());
          await result;
          while (this.pendingInLock.length) {
            const waitOn = [
              ...this.pendingInLock
            ];
            await Promise.all(waitOn);
            this.pendingInLock.splice(0, waitOn.length);
          }
          return await result;
        } finally {
          this._debug("#_acquireLock", "lock released for storage key", this.storageKey);
          this.lockAcquired = false;
        }
      });
    } finally {
      this._debug("#_acquireLock", "end");
    }
  }
  /**
     * Use instead of {@link #getSession} inside the library. It is
     * semantically usually what you want, as getting a session involves some
     * processing afterwards that requires only one client operating on the
     * session at once across multiple tabs or processes.
     */
  async _useSession(fn) {
    this._debug("#_useSession", "begin");
    try {
      const result = await this.__loadSession();
      return await fn(result);
    } finally {
      this._debug("#_useSession", "end");
    }
  }
  /**
     * NEVER USE DIRECTLY!
     *
     * Always use {@link #_useSession}.
     */
  async __loadSession() {
    this._debug("#__loadSession()", "begin");
    if (!this.lockAcquired) {
      this._debug("#__loadSession()", "used outside of an acquired lock!", new Error().stack);
    }
    try {
      let currentSession = null;
      const maybeSession = await getItemAsync(this.storage, this.storageKey);
      this._debug("#getSession()", "session from storage", maybeSession);
      if (maybeSession !== null) {
        if (this._isValidSession(maybeSession)) {
          currentSession = maybeSession;
        } else {
          this._debug("#getSession()", "session from storage is not valid");
          await this._removeSession();
        }
      }
      if (!currentSession) {
        return {
          data: {
            session: null
          },
          error: null
        };
      }
      const hasExpired = currentSession.expires_at ? currentSession.expires_at * 1e3 - Date.now() < EXPIRY_MARGIN_MS : false;
      this._debug("#__loadSession()", `session has${hasExpired ? "" : " not"} expired`, "expires_at", currentSession.expires_at);
      if (!hasExpired) {
        if (this.userStorage) {
          const maybeUser = await getItemAsync(this.userStorage, this.storageKey + "-user");
          if (maybeUser === null || maybeUser === void 0 ? void 0 : maybeUser.user) {
            currentSession.user = maybeUser.user;
          } else {
            currentSession.user = userNotAvailableProxy();
          }
        }
        if (this.storage.isServer && currentSession.user && !currentSession.user.__isUserNotAvailableProxy) {
          const suppressWarningRef = {
            value: this.suppressGetSessionWarning
          };
          currentSession.user = insecureUserWarningProxy(currentSession.user, suppressWarningRef);
          if (suppressWarningRef.value) {
            this.suppressGetSessionWarning = true;
          }
        }
        return {
          data: {
            session: currentSession
          },
          error: null
        };
      }
      const { data: session, error } = await this._callRefreshToken(currentSession.refresh_token);
      if (error) {
        return this._returnResult({
          data: {
            session: null
          },
          error
        });
      }
      return this._returnResult({
        data: {
          session
        },
        error: null
      });
    } finally {
      this._debug("#__loadSession()", "end");
    }
  }
  /**
     * Gets the current user details if there is an existing session. This method
     * performs a network request to the Supabase Auth server, so the returned
     * value is authentic and can be used to base authorization rules on.
     *
     * @param jwt Takes in an optional access token JWT. If no JWT is provided, the JWT from the current session is used.
     */
  async getUser(jwt) {
    if (jwt) {
      return await this._getUser(jwt);
    }
    await this.initializePromise;
    const result = await this._acquireLock(this.lockAcquireTimeout, async () => {
      return await this._getUser();
    });
    if (result.data.user) {
      this.suppressGetSessionWarning = true;
    }
    return result;
  }
  async _getUser(jwt) {
    try {
      if (jwt) {
        return await _request(this.fetch, "GET", `${this.url}/user`, {
          headers: this.headers,
          jwt,
          xform: _userResponse
        });
      }
      return await this._useSession(async (result) => {
        var _a, _b, _c;
        const { data, error } = result;
        if (error) {
          throw error;
        }
        if (!((_a = data.session) === null || _a === void 0 ? void 0 : _a.access_token) && !this.hasCustomAuthorizationHeader) {
          return {
            data: {
              user: null
            },
            error: new AuthSessionMissingError()
          };
        }
        return await _request(this.fetch, "GET", `${this.url}/user`, {
          headers: this.headers,
          jwt: (_c = (_b = data.session) === null || _b === void 0 ? void 0 : _b.access_token) !== null && _c !== void 0 ? _c : void 0,
          xform: _userResponse
        });
      });
    } catch (error) {
      if (isAuthError(error)) {
        if (isAuthSessionMissingError(error)) {
          await this._removeSession();
          await removeItemAsync(this.storage, `${this.storageKey}-code-verifier`);
        }
        return this._returnResult({
          data: {
            user: null
          },
          error
        });
      }
      throw error;
    }
  }
  /**
     * Updates user data for a logged in user.
     */
  async updateUser(attributes, options = {}) {
    await this.initializePromise;
    return await this._acquireLock(this.lockAcquireTimeout, async () => {
      return await this._updateUser(attributes, options);
    });
  }
  async _updateUser(attributes, options = {}) {
    try {
      return await this._useSession(async (result) => {
        const { data: sessionData, error: sessionError } = result;
        if (sessionError) {
          throw sessionError;
        }
        if (!sessionData.session) {
          throw new AuthSessionMissingError();
        }
        const session = sessionData.session;
        let codeChallenge = null;
        let codeChallengeMethod = null;
        if (this.flowType === "pkce" && attributes.email != null) {
          ;
          [codeChallenge, codeChallengeMethod] = await getCodeChallengeAndMethod(this.storage, this.storageKey);
        }
        const { data, error: userError } = await _request(this.fetch, "PUT", `${this.url}/user`, {
          headers: this.headers,
          redirectTo: options === null || options === void 0 ? void 0 : options.emailRedirectTo,
          body: Object.assign(Object.assign({}, attributes), {
            code_challenge: codeChallenge,
            code_challenge_method: codeChallengeMethod
          }),
          jwt: session.access_token,
          xform: _userResponse
        });
        if (userError) {
          throw userError;
        }
        session.user = data.user;
        await this._saveSession(session);
        await this._notifyAllSubscribers("USER_UPDATED", session);
        return this._returnResult({
          data: {
            user: session.user
          },
          error: null
        });
      });
    } catch (error) {
      await removeItemAsync(this.storage, `${this.storageKey}-code-verifier`);
      if (isAuthError(error)) {
        return this._returnResult({
          data: {
            user: null
          },
          error
        });
      }
      throw error;
    }
  }
  /**
     * Sets the session data from the current session. If the current session is expired, setSession will take care of refreshing it to obtain a new session.
     * If the refresh token or access token in the current session is invalid, an error will be thrown.
     * @param currentSession The current session that minimally contains an access token and refresh token.
     */
  async setSession(currentSession) {
    await this.initializePromise;
    return await this._acquireLock(this.lockAcquireTimeout, async () => {
      return await this._setSession(currentSession);
    });
  }
  async _setSession(currentSession) {
    try {
      if (!currentSession.access_token || !currentSession.refresh_token) {
        throw new AuthSessionMissingError();
      }
      const timeNow = Date.now() / 1e3;
      let expiresAt2 = timeNow;
      let hasExpired = true;
      let session = null;
      const { payload } = decodeJWT(currentSession.access_token);
      if (payload.exp) {
        expiresAt2 = payload.exp;
        hasExpired = expiresAt2 <= timeNow;
      }
      if (hasExpired) {
        const { data: refreshedSession, error } = await this._callRefreshToken(currentSession.refresh_token);
        if (error) {
          return this._returnResult({
            data: {
              user: null,
              session: null
            },
            error
          });
        }
        if (!refreshedSession) {
          return {
            data: {
              user: null,
              session: null
            },
            error: null
          };
        }
        session = refreshedSession;
      } else {
        const { data, error } = await this._getUser(currentSession.access_token);
        if (error) {
          return this._returnResult({
            data: {
              user: null,
              session: null
            },
            error
          });
        }
        session = {
          access_token: currentSession.access_token,
          refresh_token: currentSession.refresh_token,
          user: data.user,
          token_type: "bearer",
          expires_in: expiresAt2 - timeNow,
          expires_at: expiresAt2
        };
        await this._saveSession(session);
        await this._notifyAllSubscribers("SIGNED_IN", session);
      }
      return this._returnResult({
        data: {
          user: session.user,
          session
        },
        error: null
      });
    } catch (error) {
      if (isAuthError(error)) {
        return this._returnResult({
          data: {
            session: null,
            user: null
          },
          error
        });
      }
      throw error;
    }
  }
  /**
     * Returns a new session, regardless of expiry status.
     * Takes in an optional current session. If not passed in, then refreshSession() will attempt to retrieve it from getSession().
     * If the current session's refresh token is invalid, an error will be thrown.
     * @param currentSession The current session. If passed in, it must contain a refresh token.
     */
  async refreshSession(currentSession) {
    await this.initializePromise;
    return await this._acquireLock(this.lockAcquireTimeout, async () => {
      return await this._refreshSession(currentSession);
    });
  }
  async _refreshSession(currentSession) {
    try {
      return await this._useSession(async (result) => {
        var _a;
        if (!currentSession) {
          const { data, error: error2 } = result;
          if (error2) {
            throw error2;
          }
          currentSession = (_a = data.session) !== null && _a !== void 0 ? _a : void 0;
        }
        if (!(currentSession === null || currentSession === void 0 ? void 0 : currentSession.refresh_token)) {
          throw new AuthSessionMissingError();
        }
        const { data: session, error } = await this._callRefreshToken(currentSession.refresh_token);
        if (error) {
          return this._returnResult({
            data: {
              user: null,
              session: null
            },
            error
          });
        }
        if (!session) {
          return this._returnResult({
            data: {
              user: null,
              session: null
            },
            error: null
          });
        }
        return this._returnResult({
          data: {
            user: session.user,
            session
          },
          error: null
        });
      });
    } catch (error) {
      if (isAuthError(error)) {
        return this._returnResult({
          data: {
            user: null,
            session: null
          },
          error
        });
      }
      throw error;
    }
  }
  /**
     * Gets the session data from a URL string
     */
  async _getSessionFromURL(params, callbackUrlType) {
    try {
      if (!isBrowser()) throw new AuthImplicitGrantRedirectError("No browser detected.");
      if (params.error || params.error_description || params.error_code) {
        throw new AuthImplicitGrantRedirectError(params.error_description || "Error in URL with unspecified error_description", {
          error: params.error || "unspecified_error",
          code: params.error_code || "unspecified_code"
        });
      }
      switch (callbackUrlType) {
        case "implicit":
          if (this.flowType === "pkce") {
            throw new AuthPKCEGrantCodeExchangeError("Not a valid PKCE flow url.");
          }
          break;
        case "pkce":
          if (this.flowType === "implicit") {
            throw new AuthImplicitGrantRedirectError("Not a valid implicit grant flow url.");
          }
          break;
        default:
      }
      if (callbackUrlType === "pkce") {
        this._debug("#_initialize()", "begin", "is PKCE flow", true);
        if (!params.code) throw new AuthPKCEGrantCodeExchangeError("No code detected.");
        const { data: data2, error: error2 } = await this._exchangeCodeForSession(params.code);
        if (error2) throw error2;
        const url = new URL(window.location.href);
        url.searchParams.delete("code");
        window.history.replaceState(window.history.state, "", url.toString());
        return {
          data: {
            session: data2.session,
            redirectType: null
          },
          error: null
        };
      }
      const { provider_token, provider_refresh_token, access_token, refresh_token, expires_in, expires_at, token_type } = params;
      if (!access_token || !expires_in || !refresh_token || !token_type) {
        throw new AuthImplicitGrantRedirectError("No session defined in URL");
      }
      const timeNow = Math.round(Date.now() / 1e3);
      const expiresIn = parseInt(expires_in);
      let expiresAt2 = timeNow + expiresIn;
      if (expires_at) {
        expiresAt2 = parseInt(expires_at);
      }
      const actuallyExpiresIn = expiresAt2 - timeNow;
      if (actuallyExpiresIn * 1e3 <= AUTO_REFRESH_TICK_DURATION_MS) {
        console.warn(`@supabase/gotrue-js: Session as retrieved from URL expires in ${actuallyExpiresIn}s, should have been closer to ${expiresIn}s`);
      }
      const issuedAt = expiresAt2 - expiresIn;
      if (timeNow - issuedAt >= 120) {
        console.warn("@supabase/gotrue-js: Session as retrieved from URL was issued over 120s ago, URL could be stale", issuedAt, expiresAt2, timeNow);
      } else if (timeNow - issuedAt < 0) {
        console.warn("@supabase/gotrue-js: Session as retrieved from URL was issued in the future? Check the device clock for skew", issuedAt, expiresAt2, timeNow);
      }
      const { data, error } = await this._getUser(access_token);
      if (error) throw error;
      const session = {
        provider_token,
        provider_refresh_token,
        access_token,
        expires_in: expiresIn,
        expires_at: expiresAt2,
        refresh_token,
        token_type,
        user: data.user
      };
      window.location.hash = "";
      this._debug("#_getSessionFromURL()", "clearing window.location.hash");
      return this._returnResult({
        data: {
          session,
          redirectType: params.type
        },
        error: null
      });
    } catch (error) {
      if (isAuthError(error)) {
        return this._returnResult({
          data: {
            session: null,
            redirectType: null
          },
          error
        });
      }
      throw error;
    }
  }
  /**
     * Checks if the current URL contains parameters given by an implicit oauth grant flow (https://www.rfc-editor.org/rfc/rfc6749.html#section-4.2)
     *
     * If `detectSessionInUrl` is a function, it will be called with the URL and params to determine
     * if the URL should be processed as a Supabase auth callback. This allows users to exclude
     * URLs from other OAuth providers (e.g., Facebook Login) that also return access_token in the fragment.
     */
  _isImplicitGrantCallback(params) {
    if (typeof this.detectSessionInUrl === "function") {
      return this.detectSessionInUrl(new URL(window.location.href), params);
    }
    return Boolean(params.access_token || params.error_description);
  }
  /**
     * Checks if the current URL and backing storage contain parameters given by a PKCE flow
     */
  async _isPKCECallback(params) {
    const currentStorageContent = await getItemAsync(this.storage, `${this.storageKey}-code-verifier`);
    return !!(params.code && currentStorageContent);
  }
  /**
     * Inside a browser context, `signOut()` will remove the logged in user from the browser session and log them out - removing all items from localstorage and then trigger a `"SIGNED_OUT"` event.
     *
     * For server-side management, you can revoke all refresh tokens for a user by passing a user's JWT through to `auth.api.signOut(JWT: string)`.
     * There is no way to revoke a user's access token jwt until it expires. It is recommended to set a shorter expiry on the jwt for this reason.
     *
     * If using `others` scope, no `SIGNED_OUT` event is fired!
     */
  async signOut(options = {
    scope: "global"
  }) {
    await this.initializePromise;
    return await this._acquireLock(this.lockAcquireTimeout, async () => {
      return await this._signOut(options);
    });
  }
  async _signOut({ scope } = {
    scope: "global"
  }) {
    return await this._useSession(async (result) => {
      var _a;
      const { data, error: sessionError } = result;
      if (sessionError && !isAuthSessionMissingError(sessionError)) {
        return this._returnResult({
          error: sessionError
        });
      }
      const accessToken = (_a = data.session) === null || _a === void 0 ? void 0 : _a.access_token;
      if (accessToken) {
        const { error } = await this.admin.signOut(accessToken, scope);
        if (error) {
          if (!(isAuthApiError(error) && (error.status === 404 || error.status === 401 || error.status === 403) || isAuthSessionMissingError(error))) {
            return this._returnResult({
              error
            });
          }
        }
      }
      if (scope !== "others") {
        await this._removeSession();
        await removeItemAsync(this.storage, `${this.storageKey}-code-verifier`);
      }
      return this._returnResult({
        error: null
      });
    });
  }
  onAuthStateChange(callback) {
    const id = generateCallbackId();
    const subscription = {
      id,
      callback,
      unsubscribe: () => {
        this._debug("#unsubscribe()", "state change callback with id removed", id);
        this.stateChangeEmitters.delete(id);
      }
    };
    this._debug("#onAuthStateChange()", "registered callback with id", id);
    this.stateChangeEmitters.set(id, subscription);
    (async () => {
      await this.initializePromise;
      await this._acquireLock(this.lockAcquireTimeout, async () => {
        this._emitInitialSession(id);
      });
    })();
    return {
      data: {
        subscription
      }
    };
  }
  async _emitInitialSession(id) {
    return await this._useSession(async (result) => {
      var _a, _b;
      try {
        const { data: { session }, error } = result;
        if (error) throw error;
        await ((_a = this.stateChangeEmitters.get(id)) === null || _a === void 0 ? void 0 : _a.callback("INITIAL_SESSION", session));
        this._debug("INITIAL_SESSION", "callback id", id, "session", session);
      } catch (err) {
        await ((_b = this.stateChangeEmitters.get(id)) === null || _b === void 0 ? void 0 : _b.callback("INITIAL_SESSION", null));
        this._debug("INITIAL_SESSION", "callback id", id, "error", err);
        console.error(err);
      }
    });
  }
  /**
     * Sends a password reset request to an email address. This method supports the PKCE flow.
     *
     * @param email The email address of the user.
     * @param options.redirectTo The URL to send the user to after they click the password reset link.
     * @param options.captchaToken Verification token received when the user completes the captcha on the site.
     */
  async resetPasswordForEmail(email, options = {}) {
    let codeChallenge = null;
    let codeChallengeMethod = null;
    if (this.flowType === "pkce") {
      ;
      [codeChallenge, codeChallengeMethod] = await getCodeChallengeAndMethod(
        this.storage,
        this.storageKey,
        true
        // isPasswordRecovery
      );
    }
    try {
      return await _request(this.fetch, "POST", `${this.url}/recover`, {
        body: {
          email,
          code_challenge: codeChallenge,
          code_challenge_method: codeChallengeMethod,
          gotrue_meta_security: {
            captcha_token: options.captchaToken
          }
        },
        headers: this.headers,
        redirectTo: options.redirectTo
      });
    } catch (error) {
      await removeItemAsync(this.storage, `${this.storageKey}-code-verifier`);
      if (isAuthError(error)) {
        return this._returnResult({
          data: null,
          error
        });
      }
      throw error;
    }
  }
  /**
     * Gets all the identities linked to a user.
     */
  async getUserIdentities() {
    var _a;
    try {
      const { data, error } = await this.getUser();
      if (error) throw error;
      return this._returnResult({
        data: {
          identities: (_a = data.user.identities) !== null && _a !== void 0 ? _a : []
        },
        error: null
      });
    } catch (error) {
      if (isAuthError(error)) {
        return this._returnResult({
          data: null,
          error
        });
      }
      throw error;
    }
  }
  async linkIdentity(credentials) {
    if ("token" in credentials) {
      return this.linkIdentityIdToken(credentials);
    }
    return this.linkIdentityOAuth(credentials);
  }
  async linkIdentityOAuth(credentials) {
    var _a;
    try {
      const { data, error } = await this._useSession(async (result) => {
        var _a2, _b, _c, _d, _e;
        const { data: data2, error: error2 } = result;
        if (error2) throw error2;
        const url = await this._getUrlForProvider(`${this.url}/user/identities/authorize`, credentials.provider, {
          redirectTo: (_a2 = credentials.options) === null || _a2 === void 0 ? void 0 : _a2.redirectTo,
          scopes: (_b = credentials.options) === null || _b === void 0 ? void 0 : _b.scopes,
          queryParams: (_c = credentials.options) === null || _c === void 0 ? void 0 : _c.queryParams,
          skipBrowserRedirect: true
        });
        return await _request(this.fetch, "GET", url, {
          headers: this.headers,
          jwt: (_e = (_d = data2.session) === null || _d === void 0 ? void 0 : _d.access_token) !== null && _e !== void 0 ? _e : void 0
        });
      });
      if (error) throw error;
      if (isBrowser() && !((_a = credentials.options) === null || _a === void 0 ? void 0 : _a.skipBrowserRedirect)) {
        window.location.assign(data === null || data === void 0 ? void 0 : data.url);
      }
      return this._returnResult({
        data: {
          provider: credentials.provider,
          url: data === null || data === void 0 ? void 0 : data.url
        },
        error: null
      });
    } catch (error) {
      if (isAuthError(error)) {
        return this._returnResult({
          data: {
            provider: credentials.provider,
            url: null
          },
          error
        });
      }
      throw error;
    }
  }
  async linkIdentityIdToken(credentials) {
    return await this._useSession(async (result) => {
      var _a;
      try {
        const { error: sessionError, data: { session } } = result;
        if (sessionError) throw sessionError;
        const { options, provider, token, access_token, nonce } = credentials;
        const res = await _request(this.fetch, "POST", `${this.url}/token?grant_type=id_token`, {
          headers: this.headers,
          jwt: (_a = session === null || session === void 0 ? void 0 : session.access_token) !== null && _a !== void 0 ? _a : void 0,
          body: {
            provider,
            id_token: token,
            access_token,
            nonce,
            link_identity: true,
            gotrue_meta_security: {
              captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken
            }
          },
          xform: _sessionResponse
        });
        const { data, error } = res;
        if (error) {
          return this._returnResult({
            data: {
              user: null,
              session: null
            },
            error
          });
        } else if (!data || !data.session || !data.user) {
          return this._returnResult({
            data: {
              user: null,
              session: null
            },
            error: new AuthInvalidTokenResponseError()
          });
        }
        if (data.session) {
          await this._saveSession(data.session);
          await this._notifyAllSubscribers("USER_UPDATED", data.session);
        }
        return this._returnResult({
          data,
          error
        });
      } catch (error) {
        await removeItemAsync(this.storage, `${this.storageKey}-code-verifier`);
        if (isAuthError(error)) {
          return this._returnResult({
            data: {
              user: null,
              session: null
            },
            error
          });
        }
        throw error;
      }
    });
  }
  /**
     * Unlinks an identity from a user by deleting it. The user will no longer be able to sign in with that identity once it's unlinked.
     */
  async unlinkIdentity(identity) {
    try {
      return await this._useSession(async (result) => {
        var _a, _b;
        const { data, error } = result;
        if (error) {
          throw error;
        }
        return await _request(this.fetch, "DELETE", `${this.url}/user/identities/${identity.identity_id}`, {
          headers: this.headers,
          jwt: (_b = (_a = data.session) === null || _a === void 0 ? void 0 : _a.access_token) !== null && _b !== void 0 ? _b : void 0
        });
      });
    } catch (error) {
      if (isAuthError(error)) {
        return this._returnResult({
          data: null,
          error
        });
      }
      throw error;
    }
  }
  /**
     * Generates a new JWT.
     * @param refreshToken A valid refresh token that was returned on login.
     */
  async _refreshAccessToken(refreshToken) {
    const debugName = `#_refreshAccessToken(${refreshToken.substring(0, 5)}...)`;
    this._debug(debugName, "begin");
    try {
      const startedAt = Date.now();
      return await retryable(async (attempt) => {
        if (attempt > 0) {
          await sleep(200 * Math.pow(2, attempt - 1));
        }
        this._debug(debugName, "refreshing attempt", attempt);
        return await _request(this.fetch, "POST", `${this.url}/token?grant_type=refresh_token`, {
          body: {
            refresh_token: refreshToken
          },
          headers: this.headers,
          xform: _sessionResponse
        });
      }, (attempt, error) => {
        const nextBackOffInterval = 200 * Math.pow(2, attempt);
        return error && isAuthRetryableFetchError(error) && // retryable only if the request can be sent before the backoff overflows the tick duration
        Date.now() + nextBackOffInterval - startedAt < AUTO_REFRESH_TICK_DURATION_MS;
      });
    } catch (error) {
      this._debug(debugName, "error", error);
      if (isAuthError(error)) {
        return this._returnResult({
          data: {
            session: null,
            user: null
          },
          error
        });
      }
      throw error;
    } finally {
      this._debug(debugName, "end");
    }
  }
  _isValidSession(maybeSession) {
    const isValidSession = typeof maybeSession === "object" && maybeSession !== null && "access_token" in maybeSession && "refresh_token" in maybeSession && "expires_at" in maybeSession;
    return isValidSession;
  }
  async _handleProviderSignIn(provider, options) {
    const url = await this._getUrlForProvider(`${this.url}/authorize`, provider, {
      redirectTo: options.redirectTo,
      scopes: options.scopes,
      queryParams: options.queryParams
    });
    this._debug("#_handleProviderSignIn()", "provider", provider, "options", options, "url", url);
    if (isBrowser() && !options.skipBrowserRedirect) {
      window.location.assign(url);
    }
    return {
      data: {
        provider,
        url
      },
      error: null
    };
  }
  /**
     * Recovers the session from LocalStorage and refreshes the token
     * Note: this method is async to accommodate for AsyncStorage e.g. in React native.
     */
  async _recoverAndRefresh() {
    var _a, _b;
    const debugName = "#_recoverAndRefresh()";
    this._debug(debugName, "begin");
    try {
      const currentSession = await getItemAsync(this.storage, this.storageKey);
      if (currentSession && this.userStorage) {
        let maybeUser = await getItemAsync(this.userStorage, this.storageKey + "-user");
        if (!this.storage.isServer && Object.is(this.storage, this.userStorage) && !maybeUser) {
          maybeUser = {
            user: currentSession.user
          };
          await setItemAsync(this.userStorage, this.storageKey + "-user", maybeUser);
        }
        currentSession.user = (_a = maybeUser === null || maybeUser === void 0 ? void 0 : maybeUser.user) !== null && _a !== void 0 ? _a : userNotAvailableProxy();
      } else if (currentSession && !currentSession.user) {
        if (!currentSession.user) {
          const separateUser = await getItemAsync(this.storage, this.storageKey + "-user");
          if (separateUser && (separateUser === null || separateUser === void 0 ? void 0 : separateUser.user)) {
            currentSession.user = separateUser.user;
            await removeItemAsync(this.storage, this.storageKey + "-user");
            await setItemAsync(this.storage, this.storageKey, currentSession);
          } else {
            currentSession.user = userNotAvailableProxy();
          }
        }
      }
      this._debug(debugName, "session from storage", currentSession);
      if (!this._isValidSession(currentSession)) {
        this._debug(debugName, "session is not valid");
        if (currentSession !== null) {
          await this._removeSession();
        }
        return;
      }
      const expiresWithMargin = ((_b = currentSession.expires_at) !== null && _b !== void 0 ? _b : Infinity) * 1e3 - Date.now() < EXPIRY_MARGIN_MS;
      this._debug(debugName, `session has${expiresWithMargin ? "" : " not"} expired with margin of ${EXPIRY_MARGIN_MS}s`);
      if (expiresWithMargin) {
        if (this.autoRefreshToken && currentSession.refresh_token) {
          const { error } = await this._callRefreshToken(currentSession.refresh_token);
          if (error) {
            console.error(error);
            if (!isAuthRetryableFetchError(error)) {
              this._debug(debugName, "refresh failed with a non-retryable error, removing the session", error);
              await this._removeSession();
            }
          }
        }
      } else if (currentSession.user && currentSession.user.__isUserNotAvailableProxy === true) {
        try {
          const { data, error: userError } = await this._getUser(currentSession.access_token);
          if (!userError && (data === null || data === void 0 ? void 0 : data.user)) {
            currentSession.user = data.user;
            await this._saveSession(currentSession);
            await this._notifyAllSubscribers("SIGNED_IN", currentSession);
          } else {
            this._debug(debugName, "could not get user data, skipping SIGNED_IN notification");
          }
        } catch (getUserError) {
          console.error("Error getting user data:", getUserError);
          this._debug(debugName, "error getting user data, skipping SIGNED_IN notification", getUserError);
        }
      } else {
        await this._notifyAllSubscribers("SIGNED_IN", currentSession);
      }
    } catch (err) {
      this._debug(debugName, "error", err);
      console.error(err);
      return;
    } finally {
      this._debug(debugName, "end");
    }
  }
  async _callRefreshToken(refreshToken) {
    var _a, _b;
    if (!refreshToken) {
      throw new AuthSessionMissingError();
    }
    if (this.refreshingDeferred) {
      return this.refreshingDeferred.promise;
    }
    const debugName = `#_callRefreshToken(${refreshToken.substring(0, 5)}...)`;
    this._debug(debugName, "begin");
    try {
      this.refreshingDeferred = new Deferred();
      const { data, error } = await this._refreshAccessToken(refreshToken);
      if (error) throw error;
      if (!data.session) throw new AuthSessionMissingError();
      await this._saveSession(data.session);
      await this._notifyAllSubscribers("TOKEN_REFRESHED", data.session);
      const result = {
        data: data.session,
        error: null
      };
      this.refreshingDeferred.resolve(result);
      return result;
    } catch (error) {
      this._debug(debugName, "error", error);
      if (isAuthError(error)) {
        const result = {
          data: null,
          error
        };
        if (!isAuthRetryableFetchError(error)) {
          await this._removeSession();
        }
        (_a = this.refreshingDeferred) === null || _a === void 0 ? void 0 : _a.resolve(result);
        return result;
      }
      (_b = this.refreshingDeferred) === null || _b === void 0 ? void 0 : _b.reject(error);
      throw error;
    } finally {
      this.refreshingDeferred = null;
      this._debug(debugName, "end");
    }
  }
  async _notifyAllSubscribers(event, session, broadcast = true) {
    const debugName = `#_notifyAllSubscribers(${event})`;
    this._debug(debugName, "begin", session, `broadcast = ${broadcast}`);
    try {
      if (this.broadcastChannel && broadcast) {
        this.broadcastChannel.postMessage({
          event,
          session
        });
      }
      const errors = [];
      const promises = Array.from(this.stateChangeEmitters.values()).map(async (x) => {
        try {
          await x.callback(event, session);
        } catch (e) {
          errors.push(e);
        }
      });
      await Promise.all(promises);
      if (errors.length > 0) {
        for (let i = 0; i < errors.length; i += 1) {
          console.error(errors[i]);
        }
        throw errors[0];
      }
    } finally {
      this._debug(debugName, "end");
    }
  }
  /**
     * set currentSession and currentUser
     * process to _startAutoRefreshToken if possible
     */
  async _saveSession(session) {
    this._debug("#_saveSession()", session);
    this.suppressGetSessionWarning = true;
    await removeItemAsync(this.storage, `${this.storageKey}-code-verifier`);
    const sessionToProcess = Object.assign({}, session);
    const userIsProxy = sessionToProcess.user && sessionToProcess.user.__isUserNotAvailableProxy === true;
    if (this.userStorage) {
      if (!userIsProxy && sessionToProcess.user) {
        await setItemAsync(this.userStorage, this.storageKey + "-user", {
          user: sessionToProcess.user
        });
      } else if (userIsProxy) {
      }
      const mainSessionData = Object.assign({}, sessionToProcess);
      delete mainSessionData.user;
      const clonedMainSessionData = deepClone(mainSessionData);
      await setItemAsync(this.storage, this.storageKey, clonedMainSessionData);
    } else {
      const clonedSession = deepClone(sessionToProcess);
      await setItemAsync(this.storage, this.storageKey, clonedSession);
    }
  }
  async _removeSession() {
    this._debug("#_removeSession()");
    this.suppressGetSessionWarning = false;
    await removeItemAsync(this.storage, this.storageKey);
    await removeItemAsync(this.storage, this.storageKey + "-code-verifier");
    await removeItemAsync(this.storage, this.storageKey + "-user");
    if (this.userStorage) {
      await removeItemAsync(this.userStorage, this.storageKey + "-user");
    }
    await this._notifyAllSubscribers("SIGNED_OUT", null);
  }
  /**
     * Removes any registered visibilitychange callback.
     *
     * {@see #startAutoRefresh}
     * {@see #stopAutoRefresh}
     */
  _removeVisibilityChangedCallback() {
    this._debug("#_removeVisibilityChangedCallback()");
    const callback = this.visibilityChangedCallback;
    this.visibilityChangedCallback = null;
    try {
      if (callback && isBrowser() && (window === null || window === void 0 ? void 0 : window.removeEventListener)) {
        window.removeEventListener("visibilitychange", callback);
      }
    } catch (e) {
      console.error("removing visibilitychange callback failed", e);
    }
  }
  /**
     * This is the private implementation of {@link #startAutoRefresh}. Use this
     * within the library.
     */
  async _startAutoRefresh() {
    await this._stopAutoRefresh();
    this._debug("#_startAutoRefresh()");
    const ticker = setInterval(() => this._autoRefreshTokenTick(), AUTO_REFRESH_TICK_DURATION_MS);
    this.autoRefreshTicker = ticker;
    if (ticker && typeof ticker === "object" && typeof ticker.unref === "function") {
      ticker.unref();
    } else if (typeof Deno !== "undefined" && typeof Deno.unrefTimer === "function") {
      Deno.unrefTimer(ticker);
    }
    const timeout = setTimeout(async () => {
      await this.initializePromise;
      await this._autoRefreshTokenTick();
    }, 0);
    this.autoRefreshTickTimeout = timeout;
    if (timeout && typeof timeout === "object" && typeof timeout.unref === "function") {
      timeout.unref();
    } else if (typeof Deno !== "undefined" && typeof Deno.unrefTimer === "function") {
      Deno.unrefTimer(timeout);
    }
  }
  /**
     * This is the private implementation of {@link #stopAutoRefresh}. Use this
     * within the library.
     */
  async _stopAutoRefresh() {
    this._debug("#_stopAutoRefresh()");
    const ticker = this.autoRefreshTicker;
    this.autoRefreshTicker = null;
    if (ticker) {
      clearInterval(ticker);
    }
    const timeout = this.autoRefreshTickTimeout;
    this.autoRefreshTickTimeout = null;
    if (timeout) {
      clearTimeout(timeout);
    }
  }
  /**
     * Starts an auto-refresh process in the background. The session is checked
     * every few seconds. Close to the time of expiration a process is started to
     * refresh the session. If refreshing fails it will be retried for as long as
     * necessary.
     *
     * If you set the {@link GoTrueClientOptions#autoRefreshToken} you don't need
     * to call this function, it will be called for you.
     *
     * On browsers the refresh process works only when the tab/window is in the
     * foreground to conserve resources as well as prevent race conditions and
     * flooding auth with requests. If you call this method any managed
     * visibility change callback will be removed and you must manage visibility
     * changes on your own.
     *
     * On non-browser platforms the refresh process works *continuously* in the
     * background, which may not be desirable. You should hook into your
     * platform's foreground indication mechanism and call these methods
     * appropriately to conserve resources.
     *
     * {@see #stopAutoRefresh}
     */
  async startAutoRefresh() {
    this._removeVisibilityChangedCallback();
    await this._startAutoRefresh();
  }
  /**
     * Stops an active auto refresh process running in the background (if any).
     *
     * If you call this method any managed visibility change callback will be
     * removed and you must manage visibility changes on your own.
     *
     * See {@link #startAutoRefresh} for more details.
     */
  async stopAutoRefresh() {
    this._removeVisibilityChangedCallback();
    await this._stopAutoRefresh();
  }
  /**
     * Runs the auto refresh token tick.
     */
  async _autoRefreshTokenTick() {
    this._debug("#_autoRefreshTokenTick()", "begin");
    try {
      await this._acquireLock(0, async () => {
        try {
          const now = Date.now();
          try {
            return await this._useSession(async (result) => {
              const { data: { session } } = result;
              if (!session || !session.refresh_token || !session.expires_at) {
                this._debug("#_autoRefreshTokenTick()", "no session");
                return;
              }
              const expiresInTicks = Math.floor((session.expires_at * 1e3 - now) / AUTO_REFRESH_TICK_DURATION_MS);
              this._debug("#_autoRefreshTokenTick()", `access token expires in ${expiresInTicks} ticks, a tick lasts ${AUTO_REFRESH_TICK_DURATION_MS}ms, refresh threshold is ${AUTO_REFRESH_TICK_THRESHOLD} ticks`);
              if (expiresInTicks <= AUTO_REFRESH_TICK_THRESHOLD) {
                await this._callRefreshToken(session.refresh_token);
              }
            });
          } catch (e) {
            console.error("Auto refresh tick failed with error. This is likely a transient error.", e);
          }
        } finally {
          this._debug("#_autoRefreshTokenTick()", "end");
        }
      });
    } catch (e) {
      if (e.isAcquireTimeout || e instanceof LockAcquireTimeoutError) {
        this._debug("auto refresh token tick lock not available");
      } else {
        throw e;
      }
    }
  }
  /**
     * Registers callbacks on the browser / platform, which in-turn run
     * algorithms when the browser window/tab are in foreground. On non-browser
     * platforms it assumes always foreground.
     */
  async _handleVisibilityChange() {
    this._debug("#_handleVisibilityChange()");
    if (!isBrowser() || !(window === null || window === void 0 ? void 0 : window.addEventListener)) {
      if (this.autoRefreshToken) {
        this.startAutoRefresh();
      }
      return false;
    }
    try {
      this.visibilityChangedCallback = async () => {
        try {
          await this._onVisibilityChanged(false);
        } catch (error) {
          this._debug("#visibilityChangedCallback", "error", error);
        }
      };
      window === null || window === void 0 ? void 0 : window.addEventListener("visibilitychange", this.visibilityChangedCallback);
      await this._onVisibilityChanged(true);
    } catch (error) {
      console.error("_handleVisibilityChange", error);
    }
  }
  /**
     * Callback registered with `window.addEventListener('visibilitychange')`.
     */
  async _onVisibilityChanged(calledFromInitialize) {
    const methodName = `#_onVisibilityChanged(${calledFromInitialize})`;
    this._debug(methodName, "visibilityState", document.visibilityState);
    if (document.visibilityState === "visible") {
      if (this.autoRefreshToken) {
        this._startAutoRefresh();
      }
      if (!calledFromInitialize) {
        await this.initializePromise;
        await this._acquireLock(this.lockAcquireTimeout, async () => {
          if (document.visibilityState !== "visible") {
            this._debug(methodName, "acquired the lock to recover the session, but the browser visibilityState is no longer visible, aborting");
            return;
          }
          await this._recoverAndRefresh();
        });
      }
    } else if (document.visibilityState === "hidden") {
      if (this.autoRefreshToken) {
        this._stopAutoRefresh();
      }
    }
  }
  /**
     * Generates the relevant login URL for a third-party provider.
     * @param options.redirectTo A URL or mobile address to send the user to after they are confirmed.
     * @param options.scopes A space-separated list of scopes granted to the OAuth application.
     * @param options.queryParams An object of key-value pairs containing query parameters granted to the OAuth application.
     */
  async _getUrlForProvider(url, provider, options) {
    const urlParams = [
      `provider=${encodeURIComponent(provider)}`
    ];
    if (options === null || options === void 0 ? void 0 : options.redirectTo) {
      urlParams.push(`redirect_to=${encodeURIComponent(options.redirectTo)}`);
    }
    if (options === null || options === void 0 ? void 0 : options.scopes) {
      urlParams.push(`scopes=${encodeURIComponent(options.scopes)}`);
    }
    if (this.flowType === "pkce") {
      const [codeChallenge, codeChallengeMethod] = await getCodeChallengeAndMethod(this.storage, this.storageKey);
      const flowParams = new URLSearchParams({
        code_challenge: `${encodeURIComponent(codeChallenge)}`,
        code_challenge_method: `${encodeURIComponent(codeChallengeMethod)}`
      });
      urlParams.push(flowParams.toString());
    }
    if (options === null || options === void 0 ? void 0 : options.queryParams) {
      const query = new URLSearchParams(options.queryParams);
      urlParams.push(query.toString());
    }
    if (options === null || options === void 0 ? void 0 : options.skipBrowserRedirect) {
      urlParams.push(`skip_http_redirect=${options.skipBrowserRedirect}`);
    }
    return `${url}?${urlParams.join("&")}`;
  }
  async _unenroll(params) {
    try {
      return await this._useSession(async (result) => {
        var _a;
        const { data: sessionData, error: sessionError } = result;
        if (sessionError) {
          return this._returnResult({
            data: null,
            error: sessionError
          });
        }
        return await _request(this.fetch, "DELETE", `${this.url}/factors/${params.factorId}`, {
          headers: this.headers,
          jwt: (_a = sessionData === null || sessionData === void 0 ? void 0 : sessionData.session) === null || _a === void 0 ? void 0 : _a.access_token
        });
      });
    } catch (error) {
      if (isAuthError(error)) {
        return this._returnResult({
          data: null,
          error
        });
      }
      throw error;
    }
  }
  async _enroll(params) {
    try {
      return await this._useSession(async (result) => {
        var _a, _b;
        const { data: sessionData, error: sessionError } = result;
        if (sessionError) {
          return this._returnResult({
            data: null,
            error: sessionError
          });
        }
        const body = Object.assign({
          friendly_name: params.friendlyName,
          factor_type: params.factorType
        }, params.factorType === "phone" ? {
          phone: params.phone
        } : params.factorType === "totp" ? {
          issuer: params.issuer
        } : {});
        const { data, error } = await _request(this.fetch, "POST", `${this.url}/factors`, {
          body,
          headers: this.headers,
          jwt: (_a = sessionData === null || sessionData === void 0 ? void 0 : sessionData.session) === null || _a === void 0 ? void 0 : _a.access_token
        });
        if (error) {
          return this._returnResult({
            data: null,
            error
          });
        }
        if (params.factorType === "totp" && data.type === "totp" && ((_b = data === null || data === void 0 ? void 0 : data.totp) === null || _b === void 0 ? void 0 : _b.qr_code)) {
          data.totp.qr_code = `data:image/svg+xml;utf-8,${data.totp.qr_code}`;
        }
        return this._returnResult({
          data,
          error: null
        });
      });
    } catch (error) {
      if (isAuthError(error)) {
        return this._returnResult({
          data: null,
          error
        });
      }
      throw error;
    }
  }
  async _verify(params) {
    return this._acquireLock(this.lockAcquireTimeout, async () => {
      try {
        return await this._useSession(async (result) => {
          var _a;
          const { data: sessionData, error: sessionError } = result;
          if (sessionError) {
            return this._returnResult({
              data: null,
              error: sessionError
            });
          }
          const body = Object.assign({
            challenge_id: params.challengeId
          }, "webauthn" in params ? {
            webauthn: Object.assign(Object.assign({}, params.webauthn), {
              credential_response: params.webauthn.type === "create" ? serializeCredentialCreationResponse(params.webauthn.credential_response) : serializeCredentialRequestResponse(params.webauthn.credential_response)
            })
          } : {
            code: params.code
          });
          const { data, error } = await _request(this.fetch, "POST", `${this.url}/factors/${params.factorId}/verify`, {
            body,
            headers: this.headers,
            jwt: (_a = sessionData === null || sessionData === void 0 ? void 0 : sessionData.session) === null || _a === void 0 ? void 0 : _a.access_token
          });
          if (error) {
            return this._returnResult({
              data: null,
              error
            });
          }
          await this._saveSession(Object.assign({
            expires_at: Math.round(Date.now() / 1e3) + data.expires_in
          }, data));
          await this._notifyAllSubscribers("MFA_CHALLENGE_VERIFIED", data);
          return this._returnResult({
            data,
            error
          });
        });
      } catch (error) {
        if (isAuthError(error)) {
          return this._returnResult({
            data: null,
            error
          });
        }
        throw error;
      }
    });
  }
  async _challenge(params) {
    return this._acquireLock(this.lockAcquireTimeout, async () => {
      try {
        return await this._useSession(async (result) => {
          var _a;
          const { data: sessionData, error: sessionError } = result;
          if (sessionError) {
            return this._returnResult({
              data: null,
              error: sessionError
            });
          }
          const response = await _request(this.fetch, "POST", `${this.url}/factors/${params.factorId}/challenge`, {
            body: params,
            headers: this.headers,
            jwt: (_a = sessionData === null || sessionData === void 0 ? void 0 : sessionData.session) === null || _a === void 0 ? void 0 : _a.access_token
          });
          if (response.error) {
            return response;
          }
          const { data } = response;
          if (data.type !== "webauthn") {
            return {
              data,
              error: null
            };
          }
          switch (data.webauthn.type) {
            case "create":
              return {
                data: Object.assign(Object.assign({}, data), {
                  webauthn: Object.assign(Object.assign({}, data.webauthn), {
                    credential_options: Object.assign(Object.assign({}, data.webauthn.credential_options), {
                      publicKey: deserializeCredentialCreationOptions(data.webauthn.credential_options.publicKey)
                    })
                  })
                }),
                error: null
              };
            case "request":
              return {
                data: Object.assign(Object.assign({}, data), {
                  webauthn: Object.assign(Object.assign({}, data.webauthn), {
                    credential_options: Object.assign(Object.assign({}, data.webauthn.credential_options), {
                      publicKey: deserializeCredentialRequestOptions(data.webauthn.credential_options.publicKey)
                    })
                  })
                }),
                error: null
              };
          }
        });
      } catch (error) {
        if (isAuthError(error)) {
          return this._returnResult({
            data: null,
            error
          });
        }
        throw error;
      }
    });
  }
  /**
     * {@see GoTrueMFAApi#challengeAndVerify}
     */
  async _challengeAndVerify(params) {
    const { data: challengeData, error: challengeError } = await this._challenge({
      factorId: params.factorId
    });
    if (challengeError) {
      return this._returnResult({
        data: null,
        error: challengeError
      });
    }
    return await this._verify({
      factorId: params.factorId,
      challengeId: challengeData.id,
      code: params.code
    });
  }
  /**
     * {@see GoTrueMFAApi#listFactors}
     */
  async _listFactors() {
    var _a;
    const { data: { user }, error: userError } = await this.getUser();
    if (userError) {
      return {
        data: null,
        error: userError
      };
    }
    const data = {
      all: [],
      phone: [],
      totp: [],
      webauthn: []
    };
    for (const factor of (_a = user === null || user === void 0 ? void 0 : user.factors) !== null && _a !== void 0 ? _a : []) {
      data.all.push(factor);
      if (factor.status === "verified") {
        ;
        data[factor.factor_type].push(factor);
      }
    }
    return {
      data,
      error: null
    };
  }
  /**
     * {@see GoTrueMFAApi#getAuthenticatorAssuranceLevel}
     */
  async _getAuthenticatorAssuranceLevel(jwt) {
    var _a, _b, _c, _d;
    if (jwt) {
      try {
        const { payload: payload2 } = decodeJWT(jwt);
        let currentLevel2 = null;
        if (payload2.aal) {
          currentLevel2 = payload2.aal;
        }
        let nextLevel2 = currentLevel2;
        const { data: { user }, error: userError } = await this.getUser(jwt);
        if (userError) {
          return this._returnResult({
            data: null,
            error: userError
          });
        }
        const verifiedFactors2 = (_b = (_a = user === null || user === void 0 ? void 0 : user.factors) === null || _a === void 0 ? void 0 : _a.filter((factor) => factor.status === "verified")) !== null && _b !== void 0 ? _b : [];
        if (verifiedFactors2.length > 0) {
          nextLevel2 = "aal2";
        }
        const currentAuthenticationMethods2 = payload2.amr || [];
        return {
          data: {
            currentLevel: currentLevel2,
            nextLevel: nextLevel2,
            currentAuthenticationMethods: currentAuthenticationMethods2
          },
          error: null
        };
      } catch (error) {
        if (isAuthError(error)) {
          return this._returnResult({
            data: null,
            error
          });
        }
        throw error;
      }
    }
    const { data: { session }, error: sessionError } = await this.getSession();
    if (sessionError) {
      return this._returnResult({
        data: null,
        error: sessionError
      });
    }
    if (!session) {
      return {
        data: {
          currentLevel: null,
          nextLevel: null,
          currentAuthenticationMethods: []
        },
        error: null
      };
    }
    const { payload } = decodeJWT(session.access_token);
    let currentLevel = null;
    if (payload.aal) {
      currentLevel = payload.aal;
    }
    let nextLevel = currentLevel;
    const verifiedFactors = (_d = (_c = session.user.factors) === null || _c === void 0 ? void 0 : _c.filter((factor) => factor.status === "verified")) !== null && _d !== void 0 ? _d : [];
    if (verifiedFactors.length > 0) {
      nextLevel = "aal2";
    }
    const currentAuthenticationMethods = payload.amr || [];
    return {
      data: {
        currentLevel,
        nextLevel,
        currentAuthenticationMethods
      },
      error: null
    };
  }
  /**
     * Retrieves details about an OAuth authorization request.
     * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
     *
     * Returns authorization details including client info, scopes, and user information.
     * If the response includes only a redirect_url field, it means consent was already given - the caller
     * should handle the redirect manually if needed.
     */
  async _getAuthorizationDetails(authorizationId) {
    try {
      return await this._useSession(async (result) => {
        const { data: { session }, error: sessionError } = result;
        if (sessionError) {
          return this._returnResult({
            data: null,
            error: sessionError
          });
        }
        if (!session) {
          return this._returnResult({
            data: null,
            error: new AuthSessionMissingError()
          });
        }
        return await _request(this.fetch, "GET", `${this.url}/oauth/authorizations/${authorizationId}`, {
          headers: this.headers,
          jwt: session.access_token,
          xform: (data) => ({
            data,
            error: null
          })
        });
      });
    } catch (error) {
      if (isAuthError(error)) {
        return this._returnResult({
          data: null,
          error
        });
      }
      throw error;
    }
  }
  /**
     * Approves an OAuth authorization request.
     * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
     */
  async _approveAuthorization(authorizationId, options) {
    try {
      return await this._useSession(async (result) => {
        const { data: { session }, error: sessionError } = result;
        if (sessionError) {
          return this._returnResult({
            data: null,
            error: sessionError
          });
        }
        if (!session) {
          return this._returnResult({
            data: null,
            error: new AuthSessionMissingError()
          });
        }
        const response = await _request(this.fetch, "POST", `${this.url}/oauth/authorizations/${authorizationId}/consent`, {
          headers: this.headers,
          jwt: session.access_token,
          body: {
            action: "approve"
          },
          xform: (data) => ({
            data,
            error: null
          })
        });
        if (response.data && response.data.redirect_url) {
          if (isBrowser() && !(options === null || options === void 0 ? void 0 : options.skipBrowserRedirect)) {
            window.location.assign(response.data.redirect_url);
          }
        }
        return response;
      });
    } catch (error) {
      if (isAuthError(error)) {
        return this._returnResult({
          data: null,
          error
        });
      }
      throw error;
    }
  }
  /**
     * Denies an OAuth authorization request.
     * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
     */
  async _denyAuthorization(authorizationId, options) {
    try {
      return await this._useSession(async (result) => {
        const { data: { session }, error: sessionError } = result;
        if (sessionError) {
          return this._returnResult({
            data: null,
            error: sessionError
          });
        }
        if (!session) {
          return this._returnResult({
            data: null,
            error: new AuthSessionMissingError()
          });
        }
        const response = await _request(this.fetch, "POST", `${this.url}/oauth/authorizations/${authorizationId}/consent`, {
          headers: this.headers,
          jwt: session.access_token,
          body: {
            action: "deny"
          },
          xform: (data) => ({
            data,
            error: null
          })
        });
        if (response.data && response.data.redirect_url) {
          if (isBrowser() && !(options === null || options === void 0 ? void 0 : options.skipBrowserRedirect)) {
            window.location.assign(response.data.redirect_url);
          }
        }
        return response;
      });
    } catch (error) {
      if (isAuthError(error)) {
        return this._returnResult({
          data: null,
          error
        });
      }
      throw error;
    }
  }
  /**
     * Lists all OAuth grants that the authenticated user has authorized.
     * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
     */
  async _listOAuthGrants() {
    try {
      return await this._useSession(async (result) => {
        const { data: { session }, error: sessionError } = result;
        if (sessionError) {
          return this._returnResult({
            data: null,
            error: sessionError
          });
        }
        if (!session) {
          return this._returnResult({
            data: null,
            error: new AuthSessionMissingError()
          });
        }
        return await _request(this.fetch, "GET", `${this.url}/user/oauth/grants`, {
          headers: this.headers,
          jwt: session.access_token,
          xform: (data) => ({
            data,
            error: null
          })
        });
      });
    } catch (error) {
      if (isAuthError(error)) {
        return this._returnResult({
          data: null,
          error
        });
      }
      throw error;
    }
  }
  /**
     * Revokes a user's OAuth grant for a specific client.
     * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
     */
  async _revokeOAuthGrant(options) {
    try {
      return await this._useSession(async (result) => {
        const { data: { session }, error: sessionError } = result;
        if (sessionError) {
          return this._returnResult({
            data: null,
            error: sessionError
          });
        }
        if (!session) {
          return this._returnResult({
            data: null,
            error: new AuthSessionMissingError()
          });
        }
        await _request(this.fetch, "DELETE", `${this.url}/user/oauth/grants`, {
          headers: this.headers,
          jwt: session.access_token,
          query: {
            client_id: options.clientId
          },
          noResolveJson: true
        });
        return {
          data: {},
          error: null
        };
      });
    } catch (error) {
      if (isAuthError(error)) {
        return this._returnResult({
          data: null,
          error
        });
      }
      throw error;
    }
  }
  async fetchJwk(kid, jwks = {
    keys: []
  }) {
    let jwk = jwks.keys.find((key) => key.kid === kid);
    if (jwk) {
      return jwk;
    }
    const now = Date.now();
    jwk = this.jwks.keys.find((key) => key.kid === kid);
    if (jwk && this.jwks_cached_at + JWKS_TTL > now) {
      return jwk;
    }
    const { data, error } = await _request(this.fetch, "GET", `${this.url}/.well-known/jwks.json`, {
      headers: this.headers
    });
    if (error) {
      throw error;
    }
    if (!data.keys || data.keys.length === 0) {
      return null;
    }
    this.jwks = data;
    this.jwks_cached_at = now;
    jwk = data.keys.find((key) => key.kid === kid);
    if (!jwk) {
      return null;
    }
    return jwk;
  }
  /**
     * Extracts the JWT claims present in the access token by first verifying the
     * JWT against the server's JSON Web Key Set endpoint
     * `/.well-known/jwks.json` which is often cached, resulting in significantly
     * faster responses. Prefer this method over {@link #getUser} which always
     * sends a request to the Auth server for each JWT.
     *
     * If the project is not using an asymmetric JWT signing key (like ECC or
     * RSA) it always sends a request to the Auth server (similar to {@link
     * #getUser}) to verify the JWT.
     *
     * @param jwt An optional specific JWT you wish to verify, not the one you
     *            can obtain from {@link #getSession}.
     * @param options Various additional options that allow you to customize the
     *                behavior of this method.
     */
  async getClaims(jwt, options = {}) {
    try {
      let token = jwt;
      if (!token) {
        const { data, error } = await this.getSession();
        if (error || !data.session) {
          return this._returnResult({
            data: null,
            error
          });
        }
        token = data.session.access_token;
      }
      const { header, payload, signature, raw: { header: rawHeader, payload: rawPayload } } = decodeJWT(token);
      if (!(options === null || options === void 0 ? void 0 : options.allowExpired)) {
        validateExp(payload.exp);
      }
      const signingKey = !header.alg || header.alg.startsWith("HS") || !header.kid || !("crypto" in globalThis && "subtle" in globalThis.crypto) ? null : await this.fetchJwk(header.kid, (options === null || options === void 0 ? void 0 : options.keys) ? {
        keys: options.keys
      } : options === null || options === void 0 ? void 0 : options.jwks);
      if (!signingKey) {
        const { error } = await this.getUser(token);
        if (error) {
          throw error;
        }
        return {
          data: {
            claims: payload,
            header,
            signature
          },
          error: null
        };
      }
      const algorithm = getAlgorithm(header.alg);
      const publicKey = await crypto.subtle.importKey("jwk", signingKey, algorithm, true, [
        "verify"
      ]);
      const isValid = await crypto.subtle.verify(algorithm, publicKey, signature, stringToUint8Array(`${rawHeader}.${rawPayload}`));
      if (!isValid) {
        throw new AuthInvalidJwtError("Invalid JWT signature");
      }
      return {
        data: {
          claims: payload,
          header,
          signature
        },
        error: null
      };
    } catch (error) {
      if (isAuthError(error)) {
        return this._returnResult({
          data: null,
          error
        });
      }
      throw error;
    }
  }
};
GoTrueClient.nextInstanceID = {};
var GoTrueClient_default = GoTrueClient;

// C:/Users/Jmarcum/AppData/Local/deno/npm/registry.npmjs.org/@supabase/auth-js/2.98.0/dist/module/AuthClient.js
var AuthClient = GoTrueClient_default;
var AuthClient_default = AuthClient;

// C:/Users/Jmarcum/AppData/Local/deno/npm/registry.npmjs.org/@supabase/supabase-js/2.98.0/dist/index.mjs
var version4 = "2.98.0";
var JS_ENV = "";
if (typeof Deno !== "undefined") JS_ENV = "deno";
else if (typeof document !== "undefined") JS_ENV = "web";
else if (typeof navigator !== "undefined" && navigator.product === "ReactNative") JS_ENV = "react-native";
else JS_ENV = "node";
var DEFAULT_HEADERS3 = {
  "X-Client-Info": `supabase-js-${JS_ENV}/${version4}`
};
var DEFAULT_GLOBAL_OPTIONS = {
  headers: DEFAULT_HEADERS3
};
var DEFAULT_DB_OPTIONS = {
  schema: "public"
};
var DEFAULT_AUTH_OPTIONS = {
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: true,
  flowType: "implicit"
};
var DEFAULT_REALTIME_OPTIONS = {};
function _typeof3(o) {
  "@babel/helpers - typeof";
  return _typeof3 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o$1) {
    return typeof o$1;
  } : function(o$1) {
    return o$1 && "function" == typeof Symbol && o$1.constructor === Symbol && o$1 !== Symbol.prototype ? "symbol" : typeof o$1;
  }, _typeof3(o);
}
function toPrimitive3(t, r) {
  if ("object" != _typeof3(t) || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != _typeof3(i)) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
function toPropertyKey3(t) {
  var i = toPrimitive3(t, "string");
  return "symbol" == _typeof3(i) ? i : i + "";
}
function _defineProperty3(e, r, t) {
  return (r = toPropertyKey3(r)) in e ? Object.defineProperty(e, r, {
    value: t,
    enumerable: true,
    configurable: true,
    writable: true
  }) : e[r] = t, e;
}
function ownKeys3(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function(r$1) {
      return Object.getOwnPropertyDescriptor(e, r$1).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread23(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys3(Object(t), true).forEach(function(r$1) {
      _defineProperty3(e, r$1, t[r$1]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys3(Object(t)).forEach(function(r$1) {
      Object.defineProperty(e, r$1, Object.getOwnPropertyDescriptor(t, r$1));
    });
  }
  return e;
}
var resolveFetch4 = (customFetch) => {
  if (customFetch) return (...args) => customFetch(...args);
  return (...args) => fetch(...args);
};
var resolveHeadersConstructor = () => {
  return Headers;
};
var fetchWithAuth = (supabaseKey, getAccessToken, customFetch) => {
  const fetch$1 = resolveFetch4(customFetch);
  const HeadersConstructor = resolveHeadersConstructor();
  return async (input, init2) => {
    var _await$getAccessToken;
    const accessToken = (_await$getAccessToken = await getAccessToken()) !== null && _await$getAccessToken !== void 0 ? _await$getAccessToken : supabaseKey;
    let headers = new HeadersConstructor(init2 === null || init2 === void 0 ? void 0 : init2.headers);
    if (!headers.has("apikey")) headers.set("apikey", supabaseKey);
    if (!headers.has("Authorization")) headers.set("Authorization", `Bearer ${accessToken}`);
    return fetch$1(input, _objectSpread23(_objectSpread23({}, init2), {}, {
      headers
    }));
  };
};
function ensureTrailingSlash(url) {
  return url.endsWith("/") ? url : url + "/";
}
function applySettingDefaults(options, defaults) {
  var _DEFAULT_GLOBAL_OPTIO, _globalOptions$header;
  const { db: dbOptions, auth: authOptions, realtime: realtimeOptions, global: globalOptions } = options;
  const { db: DEFAULT_DB_OPTIONS$1, auth: DEFAULT_AUTH_OPTIONS$1, realtime: DEFAULT_REALTIME_OPTIONS$1, global: DEFAULT_GLOBAL_OPTIONS$1 } = defaults;
  const result = {
    db: _objectSpread23(_objectSpread23({}, DEFAULT_DB_OPTIONS$1), dbOptions),
    auth: _objectSpread23(_objectSpread23({}, DEFAULT_AUTH_OPTIONS$1), authOptions),
    realtime: _objectSpread23(_objectSpread23({}, DEFAULT_REALTIME_OPTIONS$1), realtimeOptions),
    storage: {},
    global: _objectSpread23(_objectSpread23(_objectSpread23({}, DEFAULT_GLOBAL_OPTIONS$1), globalOptions), {}, {
      headers: _objectSpread23(_objectSpread23({}, (_DEFAULT_GLOBAL_OPTIO = DEFAULT_GLOBAL_OPTIONS$1 === null || DEFAULT_GLOBAL_OPTIONS$1 === void 0 ? void 0 : DEFAULT_GLOBAL_OPTIONS$1.headers) !== null && _DEFAULT_GLOBAL_OPTIO !== void 0 ? _DEFAULT_GLOBAL_OPTIO : {}), (_globalOptions$header = globalOptions === null || globalOptions === void 0 ? void 0 : globalOptions.headers) !== null && _globalOptions$header !== void 0 ? _globalOptions$header : {})
    }),
    accessToken: async () => ""
  };
  if (options.accessToken) result.accessToken = options.accessToken;
  else delete result.accessToken;
  return result;
}
function validateSupabaseUrl(supabaseUrl) {
  const trimmedUrl = supabaseUrl === null || supabaseUrl === void 0 ? void 0 : supabaseUrl.trim();
  if (!trimmedUrl) throw new Error("supabaseUrl is required.");
  if (!trimmedUrl.match(/^https?:\/\//i)) throw new Error("Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL.");
  try {
    return new URL(ensureTrailingSlash(trimmedUrl));
  } catch (_unused) {
    throw Error("Invalid supabaseUrl: Provided URL is malformed.");
  }
}
var SupabaseAuthClient = class extends AuthClient_default {
  constructor(options) {
    super(options);
  }
};
var SupabaseClient = class {
  /**
  * Create a new client for use in the browser.
  * @param supabaseUrl The unique Supabase URL which is supplied when you create a new project in your project dashboard.
  * @param supabaseKey The unique Supabase Key which is supplied when you create a new project in your project dashboard.
  * @param options.db.schema You can switch in between schemas. The schema needs to be on the list of exposed schemas inside Supabase.
  * @param options.auth.autoRefreshToken Set to "true" if you want to automatically refresh the token before expiring.
  * @param options.auth.persistSession Set to "true" if you want to automatically save the user session into local storage.
  * @param options.auth.detectSessionInUrl Set to "true" if you want to automatically detects OAuth grants in the URL and signs in the user.
  * @param options.realtime Options passed along to realtime-js constructor.
  * @param options.storage Options passed along to the storage-js constructor.
  * @param options.global.fetch A custom fetch implementation.
  * @param options.global.headers Any additional headers to send with each network request.
  * @example
  * ```ts
  * import { createClient } from '@supabase/supabase-js'
  *
  * const supabase = createClient('https://xyzcompany.supabase.co', 'public-anon-key')
  * const { data } = await supabase.from('profiles').select('*')
  * ```
  */
  constructor(supabaseUrl, supabaseKey, options) {
    var _settings$auth$storag, _settings$global$head;
    this.supabaseUrl = supabaseUrl;
    this.supabaseKey = supabaseKey;
    const baseUrl = validateSupabaseUrl(supabaseUrl);
    if (!supabaseKey) throw new Error("supabaseKey is required.");
    this.realtimeUrl = new URL("realtime/v1", baseUrl);
    this.realtimeUrl.protocol = this.realtimeUrl.protocol.replace("http", "ws");
    this.authUrl = new URL("auth/v1", baseUrl);
    this.storageUrl = new URL("storage/v1", baseUrl);
    this.functionsUrl = new URL("functions/v1", baseUrl);
    const defaultStorageKey = `sb-${baseUrl.hostname.split(".")[0]}-auth-token`;
    const DEFAULTS = {
      db: DEFAULT_DB_OPTIONS,
      realtime: DEFAULT_REALTIME_OPTIONS,
      auth: _objectSpread23(_objectSpread23({}, DEFAULT_AUTH_OPTIONS), {}, {
        storageKey: defaultStorageKey
      }),
      global: DEFAULT_GLOBAL_OPTIONS
    };
    const settings = applySettingDefaults(options !== null && options !== void 0 ? options : {}, DEFAULTS);
    this.storageKey = (_settings$auth$storag = settings.auth.storageKey) !== null && _settings$auth$storag !== void 0 ? _settings$auth$storag : "";
    this.headers = (_settings$global$head = settings.global.headers) !== null && _settings$global$head !== void 0 ? _settings$global$head : {};
    if (!settings.accessToken) {
      var _settings$auth;
      this.auth = this._initSupabaseAuthClient((_settings$auth = settings.auth) !== null && _settings$auth !== void 0 ? _settings$auth : {}, this.headers, settings.global.fetch);
    } else {
      this.accessToken = settings.accessToken;
      this.auth = new Proxy({}, {
        get: (_, prop) => {
          throw new Error(`@supabase/supabase-js: Supabase Client is configured with the accessToken option, accessing supabase.auth.${String(prop)} is not possible`);
        }
      });
    }
    this.fetch = fetchWithAuth(supabaseKey, this._getAccessToken.bind(this), settings.global.fetch);
    this.realtime = this._initRealtimeClient(_objectSpread23({
      headers: this.headers,
      accessToken: this._getAccessToken.bind(this)
    }, settings.realtime));
    if (this.accessToken) Promise.resolve(this.accessToken()).then((token) => this.realtime.setAuth(token)).catch((e) => console.warn("Failed to set initial Realtime auth token:", e));
    this.rest = new PostgrestClient(new URL("rest/v1", baseUrl).href, {
      headers: this.headers,
      schema: settings.db.schema,
      fetch: this.fetch,
      timeout: settings.db.timeout,
      urlLengthLimit: settings.db.urlLengthLimit
    });
    this.storage = new StorageClient(this.storageUrl.href, this.headers, this.fetch, options === null || options === void 0 ? void 0 : options.storage);
    if (!settings.accessToken) this._listenForAuthEvents();
  }
  /**
  * Supabase Functions allows you to deploy and invoke edge functions.
  */
  get functions() {
    return new FunctionsClient(this.functionsUrl.href, {
      headers: this.headers,
      customFetch: this.fetch
    });
  }
  /**
  * Perform a query on a table or a view.
  *
  * @param relation - The table or view name to query
  */
  from(relation) {
    return this.rest.from(relation);
  }
  /**
  * Select a schema to query or perform an function (rpc) call.
  *
  * The schema needs to be on the list of exposed schemas inside Supabase.
  *
  * @param schema - The schema to query
  */
  schema(schema) {
    return this.rest.schema(schema);
  }
  /**
  * Perform a function call.
  *
  * @param fn - The function name to call
  * @param args - The arguments to pass to the function call
  * @param options - Named parameters
  * @param options.head - When set to `true`, `data` will not be returned.
  * Useful if you only need the count.
  * @param options.get - When set to `true`, the function will be called with
  * read-only access mode.
  * @param options.count - Count algorithm to use to count rows returned by the
  * function. Only applicable for [set-returning
  * functions](https://www.postgresql.org/docs/current/functions-srf.html).
  *
  * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
  * hood.
  *
  * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
  * statistics under the hood.
  *
  * `"estimated"`: Uses exact count for low numbers and planned count for high
  * numbers.
  */
  rpc(fn, args = {}, options = {
    head: false,
    get: false,
    count: void 0
  }) {
    return this.rest.rpc(fn, args, options);
  }
  /**
  * Creates a Realtime channel with Broadcast, Presence, and Postgres Changes.
  *
  * @param {string} name - The name of the Realtime channel.
  * @param {Object} opts - The options to pass to the Realtime channel.
  *
  */
  channel(name, opts = {
    config: {}
  }) {
    return this.realtime.channel(name, opts);
  }
  /**
  * Returns all Realtime channels.
  */
  getChannels() {
    return this.realtime.getChannels();
  }
  /**
  * Unsubscribes and removes Realtime channel from Realtime client.
  *
  * @param {RealtimeChannel} channel - The name of the Realtime channel.
  *
  */
  removeChannel(channel) {
    return this.realtime.removeChannel(channel);
  }
  /**
  * Unsubscribes and removes all Realtime channels from Realtime client.
  */
  removeAllChannels() {
    return this.realtime.removeAllChannels();
  }
  async _getAccessToken() {
    var _this = this;
    var _data$session$access_, _data$session;
    if (_this.accessToken) return await _this.accessToken();
    const { data } = await _this.auth.getSession();
    return (_data$session$access_ = (_data$session = data.session) === null || _data$session === void 0 ? void 0 : _data$session.access_token) !== null && _data$session$access_ !== void 0 ? _data$session$access_ : _this.supabaseKey;
  }
  _initSupabaseAuthClient({ autoRefreshToken, persistSession, detectSessionInUrl, storage, userStorage, storageKey, flowType, lock, debug, throwOnError }, headers, fetch$1) {
    const authHeaders = {
      Authorization: `Bearer ${this.supabaseKey}`,
      apikey: `${this.supabaseKey}`
    };
    return new SupabaseAuthClient({
      url: this.authUrl.href,
      headers: _objectSpread23(_objectSpread23({}, authHeaders), headers),
      storageKey,
      autoRefreshToken,
      persistSession,
      detectSessionInUrl,
      storage,
      userStorage,
      flowType,
      lock,
      debug,
      throwOnError,
      fetch: fetch$1,
      hasCustomAuthorizationHeader: Object.keys(this.headers).some((key) => key.toLowerCase() === "authorization")
    });
  }
  _initRealtimeClient(options) {
    return new RealtimeClient(this.realtimeUrl.href, _objectSpread23(_objectSpread23({}, options), {}, {
      params: _objectSpread23(_objectSpread23({}, {
        apikey: this.supabaseKey
      }), options === null || options === void 0 ? void 0 : options.params)
    }));
  }
  _listenForAuthEvents() {
    return this.auth.onAuthStateChange((event, session) => {
      this._handleTokenChanged(event, "CLIENT", session === null || session === void 0 ? void 0 : session.access_token);
    });
  }
  _handleTokenChanged(event, source, token) {
    if ((event === "TOKEN_REFRESHED" || event === "SIGNED_IN") && this.changedAccessToken !== token) {
      this.changedAccessToken = token;
      this.realtime.setAuth(token);
    } else if (event === "SIGNED_OUT") {
      this.realtime.setAuth();
      if (source == "STORAGE") this.auth.signOut();
      this.changedAccessToken = void 0;
    }
  }
};
var createClient = (supabaseUrl, supabaseKey, options) => {
  return new SupabaseClient(supabaseUrl, supabaseKey, options);
};
function shouldShowDeprecationWarning() {
  if (typeof window !== "undefined") return false;
  const _process = globalThis["process"];
  if (!_process) return false;
  const processVersion = _process["version"];
  if (processVersion === void 0 || processVersion === null) return false;
  const versionMatch = processVersion.match(/^v(\d+)\./);
  if (!versionMatch) return false;
  return parseInt(versionMatch[1], 10) <= 18;
}
if (shouldShowDeprecationWarning()) console.warn("\u26A0\uFE0F  Node.js 18 and below are deprecated and will no longer be supported in future versions of @supabase/supabase-js. Please upgrade to Node.js 20 or later. For more information, visit: https://github.com/orgs/supabase/discussions/37217");

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
      iv: ivBytes
    }, key, ctBytes);
    return new TextDecoder().decode(decrypted);
  } catch {
    return null;
  }
}

// src/auth.ts
var cfg = globalThis.__LP_CONFIG__ ?? {
  supabaseUrl: "",
  supabaseAnonKey: ""
};
var supabase = createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  }
});
var currentUser = null;
var currentRole = "free";
var ownedPackIds = /* @__PURE__ */ new Set();
var LS_ROLE = "lp_role";
var LS_PACKS = "lp_packs";
var LS_PK_PFX = "lp_pk_";
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
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    await _applySession(session);
  } else {
    _restoreFromCache();
  }
  supabase.auth.onAuthStateChange(async (_event, session2) => {
    if (session2) {
      await _applySession(session2);
    } else {
      _clearSession();
    }
    _notifyListeners();
  });
}
async function login(email, password) {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  return {
    error: error?.message ?? null
  };
}
async function signup(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });
  if (error) return {
    error: error.message
  };
  if (!data.session) {
    return {
      error: null
    };
  }
  return {
    error: null
  };
}
async function logout() {
  await supabase.auth.signOut();
  _clearSession();
  _notifyListeners();
}
async function getPackKey(packId) {
  const cacheKey = LS_PK_PFX + packId;
  try {
    const { data, error } = await supabase.rpc("get_pack_key", {
      p_pack_id: packId
    });
    if (!error && typeof data === "string" && data.length > 0) {
      localStorage.setItem(cacheKey, data);
      return importPackKey(data);
    }
  } catch {
  }
  const cached = localStorage.getItem(cacheKey);
  if (cached) return importPackKey(cached);
  return null;
}
var _listeners = [];
function onAuthChange(cb) {
  _listeners.push(cb);
}
function _notifyListeners() {
  for (const cb of _listeners) cb();
}
async function _applySession(session) {
  currentUser = session.user;
  try {
    const { data, error } = await supabase.rpc("get_my_role");
    if (error) throw error;
    currentRole = data?.role ?? "free";
    ownedPackIds = new Set(Array.isArray(data?.pack_ids) ? data.pack_ids : []);
    localStorage.setItem(LS_ROLE, currentRole);
    localStorage.setItem(LS_PACKS, JSON.stringify([
      ...ownedPackIds
    ]));
  } catch {
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
}
function _clearSession() {
  currentUser = null;
  currentRole = "free";
  ownedPackIds = /* @__PURE__ */ new Set();
  localStorage.removeItem(LS_ROLE);
  localStorage.removeItem(LS_PACKS);
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
    const { data, error } = await supabase.rpc("redeem_license_code", {
      p_code: code
    });
    if (error) return {
      success: false,
      message: error.message
    };
    return {
      success: data?.success ?? false,
      message: data?.message ?? "Unknown response.",
      role: data?.role ?? void 0,
      packId: data?.pack_id ?? void 0
    };
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
  if (currentRole === "super") return "Full access (super)";
  if (currentRole === "pro") return "Pro \u2014 all features";
  if (currentRole === "demo") return "Demo trial active";
  if (ownedPackIds.size > 0) return `${ownedPackIds.size} template pack(s)`;
  return "Free \u2014 no packs";
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
  markers: [],
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
      const ci = t.indexOf("^");
      if (ci >= 0) {
        const name = t.slice(0, ci).trim();
        const exp2 = Number(t.slice(ci + 1).trim());
        if (name) result[name] = (result[name] ?? 0) + sign * exp2;
      } else {
        result[t] = (result[t] ?? 0) + sign;
      }
    }
  }
  const si = s.indexOf("/");
  applyTerms(si >= 0 ? s.slice(0, si) : s, 1);
  if (si >= 0) applyTerms(s.slice(si + 1), -1);
  return cleanU(result);
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
            return evalExpr(fn.expr, innerScope, this.fnScope);
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
            if (Object.keys(b.u).length > 0) throw new Error("pow() exponent must be dimensionless");
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
          return evalExpr(fn.expr, innerScope, this.fnScope);
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
    let tagUnit;
    let stmt = s;
    const unitMatch = s.match(/\[([^\]]+)\]\s*$/);
    if (unitMatch) {
      tagUnit = parseUnitExpr(unitMatch[1]);
      stmt = s.slice(0, unitMatch.index).trim();
    }
    const fnDefMatch = stmt.match(/^([a-zA-Z_]\w*)\s*\(([a-zA-Z_]\w*)\)\s*=\s*(.+)$/);
    if (fnDefMatch) {
      const [, fnName, param, fnExpr] = fnDefMatch;
      fnScope[fnName] = {
        param,
        expr: fnExpr.trim()
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
  let unitHtml = "";
  const unitMatch = raw.match(/\[([^\]]+)\]\s*$/);
  const body = unitMatch ? raw.slice(0, unitMatch.index).trim() : raw;
  if (unitMatch) {
    unitHtml = ` <span class="fp-unit">${transformPiece(unitMatch[1])}</span>`;
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
  return lhsHtml + rhsHtml + unitHtml;
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
    if (rowEl) rowEl.classList.toggle("formula-row--inactive", stmt.active === false && !stmt.rowType);
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
      r.innerHTML = fmtNum(stmt.value) + (unitStr ? ` <span class="result-unit">${transformPiece(unitStr)}</span>` : "");
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
function buildPlotSVG(points, cfg2, yMin, yMax, dark, markerData = []) {
  const ml = computePlotML(yMin, yMax);
  const pw = PLOT_W - ml - PLOT_MR;
  const ph = PLOT_H - PLOT_MT - PLOT_MB;
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
  const clampLy = (y) => Math.max(PLOT_MT + 8, Math.min(PLOT_H - 6, y));
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${PLOT_W}" height="${PLOT_H}" style="display:block;max-width:100%">`;
  s += `<rect width="${PLOT_W}" height="${PLOT_H}" fill="${bg}"/>`;
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
    if (d) s += `<path d="${d.trim()}" fill="none" stroke="${curve}" stroke-width="2" stroke-linejoin="round" clip-path="url(#${cpId})"/>`;
  }
  const MAX_ANNOT = 14;
  const zeroCrossings = [];
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    if (!isFinite(y0) || !isFinite(y1)) continue;
    if (y0 === 0) {
      zeroCrossings.push(x0);
    } else if (y0 * y1 < 0) {
      zeroCrossings.push(x0 + -y0 / (y1 - y0) * (x1 - x0));
    }
  }
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
  const extrema = [];
  for (let i = 2; i < points.length - 2; i++) {
    const [, ya] = points[i - 2];
    const [, yb] = points[i - 1];
    const [xv, yv] = points[i];
    const [, yc] = points[i + 1];
    const [, yd] = points[i + 2];
    if (!isFinite(ya) || !isFinite(yb) || !isFinite(yv) || !isFinite(yc) || !isFinite(yd)) continue;
    if (yv >= yb && yv >= yc && yv > ya && yv > yd) {
      extrema.push({
        x: xv,
        y: yv,
        kind: "max"
      });
    } else if (yv <= yb && yv <= yc && yv < ya && yv < yd) {
      extrema.push({
        x: xv,
        y: yv,
        kind: "min"
      });
    }
  }
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
      const rawLy = kind === "max" ? sy - 5 : sy + 12;
      s += `<text x="${lx.toFixed(1)}" y="${clampLy(rawLy).toFixed(1)}" text-anchor="${anchor}" font-size="8" fill="${col}" font-family="monospace">(${fmtTick(xv)}, ${fmtTick(yv)})</text>`;
    }
  }
  const markerCol = dark ? "#f472b6" : "#db2777";
  for (const [xv, yv] of markerData) {
    if (!isFinite(yv)) continue;
    const sx = toSX(xv), sy = toSY(yv);
    if (sx >= ml && sx <= ml + pw && sy >= PLOT_MT && sy <= PLOT_MT + ph) {
      const d = 5;
      s += `<polygon points="${sx.toFixed(1)},${(sy - d).toFixed(1)} ${(sx + d).toFixed(1)},${sy.toFixed(1)} ${sx.toFixed(1)},${(sy + d).toFixed(1)} ${(sx - d).toFixed(1)},${sy.toFixed(1)}" fill="${markerCol}" stroke="${bg}" stroke-width="1" clip-path="url(#${cpId})"/>`;
      const lx = sx > ml + pw * 0.75 ? sx - 7 : sx + 7;
      const anchor = sx > ml + pw * 0.75 ? "end" : "start";
      s += `<text x="${lx.toFixed(1)}" y="${clampLy(sy + 4).toFixed(1)}" text-anchor="${anchor}" font-size="8" fill="${markerCol}" font-family="monospace">(${fmtTick(xv)}, ${fmtTick(yv)})</text>`;
    }
  }
  if (cfg2.xLabel) {
    s += `<text x="${ml + pw / 2}" y="${PLOT_H - 4}" text-anchor="middle" font-size="10" fill="${fg}" font-family="system-ui,sans-serif">${cfg2.xLabel}</text>`;
  }
  if (cfg2.yLabel) {
    const cy = PLOT_MT + ph / 2;
    s += `<text x="10" y="${cy}" text-anchor="middle" dominant-baseline="middle" transform="rotate(-90,10,${cy})" font-size="10" fill="${fg}" font-family="system-ui,sans-serif">${cfg2.yLabel}</text>`;
  }
  s += "</svg>";
  return s;
}
function resolveRangeExpr(expr, fallback, scope, fnScope) {
  if (!expr) return fallback;
  const n = parseFloat(expr);
  if (isFinite(n) && String(n) === expr.trim()) return n;
  try {
    return evalExpr(expr, scope, fnScope).v;
  } catch {
    return isFinite(n) ? n : fallback;
  }
}
function evalPlotData(block) {
  let cfg2;
  try {
    cfg2 = {
      ...DEFAULT_PLOT,
      ...JSON.parse(block.content || "{}")
    };
  } catch {
    cfg2 = {
      ...DEFAULT_PLOT
    };
  }
  if (!cfg2.expr.trim()) return {
    points: [],
    yMin: -1,
    yMax: 1,
    markerData: [],
    xMin: cfg2.xMin,
    xMax: cfg2.xMax
  };
  const baseScope = {
    ...globalScope
  };
  const xMinExpr = cfg2.xMinExpr ?? String(cfg2.xMin);
  const xMaxExpr = cfg2.xMaxExpr ?? String(cfg2.xMax);
  const xMin = resolveRangeExpr(xMinExpr, cfg2.xMin, baseScope, globalFnScope);
  const xMax = resolveRangeExpr(xMaxExpr, cfg2.xMax, baseScope, globalFnScope);
  const resolvedXMin = isFinite(xMin) ? xMin : 0;
  const resolvedXMax = isFinite(xMax) && xMax > resolvedXMin ? xMax : resolvedXMin + 1;
  const points = [];
  let yMin = Infinity, yMax = -Infinity;
  let error;
  for (let i = 0; i <= cfg2.nPts; i++) {
    const xv = resolvedXMin + (resolvedXMax - resolvedXMin) * (i / cfg2.nPts);
    const scope = {
      ...globalScope,
      [cfg2.xVar]: {
        v: xv,
        u: {}
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
  const markers = Array.isArray(cfg2.markers) ? cfg2.markers : [];
  const markerData = markers.map((xv) => {
    const scope = {
      ...globalScope,
      [cfg2.xVar]: {
        v: xv,
        u: {}
      }
    };
    try {
      return [
        xv,
        evalExpr(cfg2.expr, scope, globalFnScope).v
      ];
    } catch {
      return [
        xv,
        NaN
      ];
    }
  });
  return {
    points,
    yMin,
    yMax,
    markerData,
    xMin: resolvedXMin,
    xMax: resolvedXMax,
    error
  };
}
function showPlotMarkerInput(xDefault, cfg2, onMarkerChange, clientX, clientY) {
  document.querySelector(".plot-ctx-popup")?.remove();
  const popup = document.createElement("div");
  popup.className = "plot-ctx-popup";
  popup.style.left = `${clientX}px`;
  popup.style.top = `${clientY}px`;
  const row = document.createElement("div");
  row.className = "plot-ctx-row";
  const label = document.createElement("span");
  label.className = "plot-ctx-label";
  label.textContent = "x =";
  const inp = document.createElement("input");
  inp.type = "number";
  inp.className = "plot-ctx-input";
  inp.value = fmtTick(+xDefault.toPrecision(6));
  inp.step = "any";
  const addBtn = document.createElement("button");
  addBtn.className = "plot-ctx-btn plot-ctx-btn-primary";
  addBtn.textContent = "Add";
  addBtn.onclick = () => {
    const xv = parseFloat(inp.value);
    if (isFinite(xv)) {
      if (!Array.isArray(cfg2.markers)) cfg2.markers = [];
      cfg2.markers.push(xv);
      onMarkerChange();
    }
    popup.remove();
  };
  const clearBtn = document.createElement("button");
  clearBtn.className = "plot-ctx-btn";
  clearBtn.textContent = "Clear All";
  clearBtn.onclick = () => {
    cfg2.markers = [];
    onMarkerChange();
    popup.remove();
  };
  row.appendChild(label);
  row.appendChild(inp);
  row.appendChild(addBtn);
  row.appendChild(clearBtn);
  popup.appendChild(row);
  document.body.appendChild(popup);
  inp.focus();
  inp.select();
  inp.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addBtn.click();
    if (e.key === "Escape") popup.remove();
  });
  const closeOutside = (e) => {
    if (!popup.contains(e.target)) {
      popup.remove();
      document.removeEventListener("mousedown", closeOutside);
    }
  };
  setTimeout(() => document.addEventListener("mousedown", closeOutside), 0);
}
function attachPlotHover(svgWrap, points, cfg2, yMin, yMax, onMarkerChange) {
  const svgEl = svgWrap.querySelector("svg");
  if (!svgEl) return;
  const ml = computePlotML(yMin, yMax);
  const pw = PLOT_W - ml - PLOT_MR;
  const ph = PLOT_H - PLOT_MT - PLOT_MB;
  const xRange = cfg2.xMax - cfg2.xMin || 1;
  const yRange = yMax - yMin || 1;
  const toSY = (y) => PLOT_MT + ph - (y - yMin) / yRange * ph;
  const toDataX = (sx) => cfg2.xMin + (sx - ml) / pw * xRange;
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
    return (e.clientX - rect.left) * (PLOT_W / rect.width);
  }
  svgEl.addEventListener("mousemove", (e) => {
    const me = e;
    const sx = getSVGX(me);
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
    showPlotMarkerInput(toDataX(sx), cfg2, onMarkerChange, me.clientX, me.clientY);
  });
  svgEl.addEventListener("mousedown", (e) => e.stopPropagation());
}
function buildPlotBlock(el, block) {
  el.classList.add("plot-block");
  let cfg2;
  try {
    cfg2 = {
      ...DEFAULT_PLOT,
      ...JSON.parse(block.content || "{}")
    };
  } catch {
    cfg2 = {
      ...DEFAULT_PLOT
    };
    block.content = JSON.stringify(cfg2);
  }
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
  exprCell.dataset.raw = cfg2.expr;
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
  xVarCell.dataset.raw = cfg2.xVar;
  xVarCell.title = "Sweep variable name";
  const xMinExprInit = cfg2.xMinExpr ?? String(cfg2.xMin);
  const xMaxExprInit = cfg2.xMaxExpr ?? String(cfg2.xMax);
  const xMinCell = mkRangeCell(xMinExprInit, "0", "Lower bound \u2014 number or variable name");
  const xMaxCell = mkRangeCell(xMaxExprInit, "1", "Upper bound \u2014 number or variable name");
  const fillLabel = document.createElement("label");
  fillLabel.className = "plot-fill-label";
  const fillCheck = document.createElement("input");
  fillCheck.type = "checkbox";
  fillCheck.className = "plot-fill-check";
  fillCheck.checked = cfg2.fill ?? true;
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
    const { points, yMin, yMax, markerData, xMin, xMax, error } = evalPlotData(block);
    if (error) {
      errEl.textContent = "\u26A0 " + error;
      svgWrap.innerHTML = "";
      return;
    }
    errEl.textContent = "";
    let cfgNow;
    try {
      cfgNow = {
        ...DEFAULT_PLOT,
        ...JSON.parse(block.content || "{}")
      };
    } catch {
      cfgNow = {
        ...DEFAULT_PLOT
      };
    }
    cfgNow.xMin = xMin;
    cfgNow.xMax = xMax;
    svgWrap.innerHTML = buildPlotSVG(points, cfgNow, yMin, yMax, isDark(), markerData);
    attachPlotHover(svgWrap, points, cfgNow, yMin, yMax, () => {
      block.content = JSON.stringify(cfgNow);
      render();
    });
  }
  function syncAndRender() {
    cfg2.expr = exprCell.dataset.raw ?? "";
    cfg2.xVar = xVarCell.dataset.raw?.trim() || "x";
    cfg2.xMinExpr = xMinCell.dataset.raw?.trim() || "0";
    cfg2.xMaxExpr = xMaxCell.dataset.raw?.trim() || "1";
    cfg2.fill = fillCheck.checked;
    block.content = JSON.stringify(cfg2);
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
  function insertAt(text, cursorOffset) {
    const start2 = editArea.selectionStart;
    const end = editArea.selectionEnd;
    editArea.setRangeText(text, start2, end, "end");
    if (cursorOffset !== void 0) {
      const pos = start2 + cursorOffset;
      editArea.setSelectionRange(pos, pos);
    }
    saveContent();
    syncHeight();
    editArea.focus();
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
  function dedentLines(n) {
    const val = editArea.value;
    const start2 = editArea.selectionStart;
    const end = editArea.selectionEnd;
    const lineStart = val.lastIndexOf("\n", start2 - 1) + 1;
    const rawEnd = val.indexOf("\n", end);
    const lineEnd = rawEnd === -1 ? val.length : rawEnd;
    const lines = val.slice(lineStart, lineEnd).split("\n");
    const newText = lines.map((l) => l.replace(new RegExp(`^ {1,${n}}`), "")).join("\n");
    editArea.setRangeText(newText, lineStart, lineEnd, "preserve");
    saveContent();
    syncHeight();
    editArea.focus();
  }
  function promptLink() {
    const sel = editArea.value.slice(editArea.selectionStart, editArea.selectionEnd);
    const url = window.prompt("URL:", "https://");
    if (url == null) {
      editArea.focus();
      return;
    }
    const label = sel || window.prompt("Link text:", "link") || "link";
    const start2 = editArea.selectionStart;
    const end = editArea.selectionEnd;
    const md = `[${label}](${url})`;
    editArea.setRangeText(md, start2, end, "end");
    saveContent();
    syncHeight();
    editArea.focus();
  }
  function promptImage() {
    const url = window.prompt("Image URL:", "https://");
    if (url == null) {
      editArea.focus();
      return;
    }
    const alt = window.prompt("Alt text:", "") || "";
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
  const resizeHandle = document.createElement("div");
  resizeHandle.className = "figure-resize-handle";
  resizeHandle.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    e.stopPropagation();
    e.preventDefault();
    resizeHandle.setPointerCapture(e.pointerId);
    resizeHandle.classList.add("handle-active");
    const startX = e.clientX;
    const startW = el.offsetWidth;
    const startH = el.offsetHeight;
    const imgAR = img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : null;
    const blockAR = startW / startH;
    const onMove = (mv) => {
      const dX = mv.clientX - startX;
      const newW = Math.max(80, Math.round((startW + dX) / GRID_SIZE) * GRID_SIZE);
      let newH;
      if (imgAR) {
        const chromeH = header.offsetHeight + caption.offsetHeight;
        const imgH = Math.round(newW / imgAR / GRID_SIZE) * GRID_SIZE;
        newH = Math.max(GRID_SIZE * 2, imgH) + chromeH;
      } else {
        newH = Math.max(60, Math.round(newW / blockAR / GRID_SIZE) * GRID_SIZE);
      }
      block.w = newW;
      block.h = newH;
      el.style.width = `${newW}px`;
      el.style.height = `${newH}px`;
    };
    const onUp = () => {
      resizeHandle.removeEventListener("pointermove", onMove);
      resizeHandle.removeEventListener("pointerup", onUp);
      resizeHandle.classList.remove("handle-active");
      document.body.style.cursor = "";
    };
    resizeHandle.addEventListener("pointermove", onMove);
    resizeHandle.addEventListener("pointerup", onUp);
    document.body.style.cursor = "se-resize";
  });
  el.appendChild(resizeHandle);
  imgWrap.addEventListener("mousedown", (e) => {
    if (e.target !== resizeHandle) e.stopPropagation();
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
  if (!state.titleBlock) state.titleBlock = {
    project: "",
    by: "",
    sheetNo: "",
    subject: "",
    subject2: "",
    subject3: "",
    date: "",
    jobNo: ""
  };
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
        if (ph) {
          ph.style.display = "none";
        }
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
  if (movedEl.classList.contains("title-block") || movedEl.classList.contains("section-block")) return;
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
      if (e.name !== "AbortError") alert("Failed to open template: " + e.message);
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
  const hasPicker = typeof window.showSaveFilePicker === "function";
  if (hasPicker) {
    try {
      if (!fileHandle || saveAs) {
        setFileHandle(await window.showSaveFilePicker({
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
      if (!email || !password) {
        errorEl.textContent = "Email and password are required.";
        return;
      }
      submitBtn.disabled = true;
      submitBtn.textContent = isSignup ? "Creating\u2026" : "Signing in\u2026";
      const fn = isSignup ? signup : login;
      const { error } = await fn(email, password);
      if (error) {
        errorEl.textContent = error;
        submitBtn.disabled = false;
        submitBtn.textContent = isSignup ? "Create Account" : "Sign In";
      } else if (isSignup) {
        successEl.textContent = "Account created \u2014 check your email to confirm, then sign in.";
        successEl.style.display = "";
        submitBtn.disabled = false;
        submitBtn.textContent = "Create Account";
        isSignup = false;
        title.textContent = "Sign in to LeptonPad";
        submitBtn.textContent = "Sign In";
        toggleBtn.textContent = "Create account instead";
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
      passInp
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
    roleBadge.style.cssText = `font-size:0.7rem;padding:0.1rem 0.4rem;border-radius:3px;background:${roleColors[currentRole] ?? "#6b7280"};color:#fff;font-weight:600;`;
    roleBadge.textContent = roleLabel();
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
  const title = document.createElement("h3");
  title.textContent = "Pro Feature";
  dialog.appendChild(title);
  const msg = document.createElement("p");
  msg.textContent = "Creating Section blocks requires a Pro subscription or active Demo trial. Sign in and redeem a license code to unlock.";
  msg.style.fontSize = "0.9rem";
  dialog.appendChild(msg);
  const btns = document.createElement("div");
  btns.className = "import-modal-btns";
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
  const version5 = globalThis.__LP_CONFIG__?.version ?? "";
  if (version5) {
    const versionEl = document.createElement("div");
    versionEl.className = "sidebar-version";
    versionEl.textContent = `v${version5}`;
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
          if (e.key === "ArrowRight" && selectedEl && !movedIsChild) resolveOverlapsRight(selectedEl);
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
