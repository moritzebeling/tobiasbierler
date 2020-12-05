
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.30.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    const LOCATION = {};
    const ROUTER = {};

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    function getLocation(source) {
      return {
        ...source.location,
        state: source.history.state,
        key: (source.history.state && source.history.state.key) || "initial"
      };
    }

    function createHistory(source, options) {
      const listeners = [];
      let location = getLocation(source);

      return {
        get location() {
          return location;
        },

        listen(listener) {
          listeners.push(listener);

          const popstateListener = () => {
            location = getLocation(source);
            listener({ location, action: "POP" });
          };

          source.addEventListener("popstate", popstateListener);

          return () => {
            source.removeEventListener("popstate", popstateListener);

            const index = listeners.indexOf(listener);
            listeners.splice(index, 1);
          };
        },

        navigate(to, { state, replace = false } = {}) {
          state = { ...state, key: Date.now() + "" };
          // try...catch iOS Safari limits to 100 pushState calls
          try {
            if (replace) {
              source.history.replaceState(state, null, to);
            } else {
              source.history.pushState(state, null, to);
            }
          } catch (e) {
            source.location[replace ? "replace" : "assign"](to);
          }

          location = getLocation(source);
          listeners.forEach(listener => listener({ location, action: "PUSH" }));
        }
      };
    }

    // Stores history entries in memory for testing or other platforms like Native
    function createMemorySource(initialPathname = "/") {
      let index = 0;
      const stack = [{ pathname: initialPathname, search: "" }];
      const states = [];

      return {
        get location() {
          return stack[index];
        },
        addEventListener(name, fn) {},
        removeEventListener(name, fn) {},
        history: {
          get entries() {
            return stack;
          },
          get index() {
            return index;
          },
          get state() {
            return states[index];
          },
          pushState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            index++;
            stack.push({ pathname, search });
            states.push(state);
          },
          replaceState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            stack[index] = { pathname, search };
            states[index] = state;
          }
        }
      };
    }

    // Global history uses window.history as the source if available,
    // otherwise a memory history
    const canUseDOM = Boolean(
      typeof window !== "undefined" &&
        window.document &&
        window.document.createElement
    );
    const globalHistory = createHistory(canUseDOM ? window : createMemorySource());
    const { navigate } = globalHistory;

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    const paramRe = /^:(.+)/;

    const SEGMENT_POINTS = 4;
    const STATIC_POINTS = 3;
    const DYNAMIC_POINTS = 2;
    const SPLAT_PENALTY = 1;
    const ROOT_POINTS = 1;

    /**
     * Check if `string` starts with `search`
     * @param {string} string
     * @param {string} search
     * @return {boolean}
     */
    function startsWith(string, search) {
      return string.substr(0, search.length) === search;
    }

    /**
     * Check if `segment` is a root segment
     * @param {string} segment
     * @return {boolean}
     */
    function isRootSegment(segment) {
      return segment === "";
    }

    /**
     * Check if `segment` is a dynamic segment
     * @param {string} segment
     * @return {boolean}
     */
    function isDynamic(segment) {
      return paramRe.test(segment);
    }

    /**
     * Check if `segment` is a splat
     * @param {string} segment
     * @return {boolean}
     */
    function isSplat(segment) {
      return segment[0] === "*";
    }

    /**
     * Split up the URI into segments delimited by `/`
     * @param {string} uri
     * @return {string[]}
     */
    function segmentize(uri) {
      return (
        uri
          // Strip starting/ending `/`
          .replace(/(^\/+|\/+$)/g, "")
          .split("/")
      );
    }

    /**
     * Strip `str` of potential start and end `/`
     * @param {string} str
     * @return {string}
     */
    function stripSlashes(str) {
      return str.replace(/(^\/+|\/+$)/g, "");
    }

    /**
     * Score a route depending on how its individual segments look
     * @param {object} route
     * @param {number} index
     * @return {object}
     */
    function rankRoute(route, index) {
      const score = route.default
        ? 0
        : segmentize(route.path).reduce((score, segment) => {
            score += SEGMENT_POINTS;

            if (isRootSegment(segment)) {
              score += ROOT_POINTS;
            } else if (isDynamic(segment)) {
              score += DYNAMIC_POINTS;
            } else if (isSplat(segment)) {
              score -= SEGMENT_POINTS + SPLAT_PENALTY;
            } else {
              score += STATIC_POINTS;
            }

            return score;
          }, 0);

      return { route, score, index };
    }

    /**
     * Give a score to all routes and sort them on that
     * @param {object[]} routes
     * @return {object[]}
     */
    function rankRoutes(routes) {
      return (
        routes
          .map(rankRoute)
          // If two routes have the exact same score, we go by index instead
          .sort((a, b) =>
            a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index
          )
      );
    }

    /**
     * Ranks and picks the best route to match. Each segment gets the highest
     * amount of points, then the type of segment gets an additional amount of
     * points where
     *
     *  static > dynamic > splat > root
     *
     * This way we don't have to worry about the order of our routes, let the
     * computers do it.
     *
     * A route looks like this
     *
     *  { path, default, value }
     *
     * And a returned match looks like:
     *
     *  { route, params, uri }
     *
     * @param {object[]} routes
     * @param {string} uri
     * @return {?object}
     */
    function pick(routes, uri) {
      let match;
      let default_;

      const [uriPathname] = uri.split("?");
      const uriSegments = segmentize(uriPathname);
      const isRootUri = uriSegments[0] === "";
      const ranked = rankRoutes(routes);

      for (let i = 0, l = ranked.length; i < l; i++) {
        const route = ranked[i].route;
        let missed = false;

        if (route.default) {
          default_ = {
            route,
            params: {},
            uri
          };
          continue;
        }

        const routeSegments = segmentize(route.path);
        const params = {};
        const max = Math.max(uriSegments.length, routeSegments.length);
        let index = 0;

        for (; index < max; index++) {
          const routeSegment = routeSegments[index];
          const uriSegment = uriSegments[index];

          if (routeSegment !== undefined && isSplat(routeSegment)) {
            // Hit a splat, just grab the rest, and return a match
            // uri:   /files/documents/work
            // route: /files/* or /files/*splatname
            const splatName = routeSegment === "*" ? "*" : routeSegment.slice(1);

            params[splatName] = uriSegments
              .slice(index)
              .map(decodeURIComponent)
              .join("/");
            break;
          }

          if (uriSegment === undefined) {
            // URI is shorter than the route, no match
            // uri:   /users
            // route: /users/:userId
            missed = true;
            break;
          }

          let dynamicMatch = paramRe.exec(routeSegment);

          if (dynamicMatch && !isRootUri) {
            const value = decodeURIComponent(uriSegment);
            params[dynamicMatch[1]] = value;
          } else if (routeSegment !== uriSegment) {
            // Current segments don't match, not dynamic, not splat, so no match
            // uri:   /users/123/settings
            // route: /users/:id/profile
            missed = true;
            break;
          }
        }

        if (!missed) {
          match = {
            route,
            params,
            uri: "/" + uriSegments.slice(0, index).join("/")
          };
          break;
        }
      }

      return match || default_ || null;
    }

    /**
     * Check if the `path` matches the `uri`.
     * @param {string} path
     * @param {string} uri
     * @return {?object}
     */
    function match(route, uri) {
      return pick([route], uri);
    }

    /**
     * Add the query to the pathname if a query is given
     * @param {string} pathname
     * @param {string} [query]
     * @return {string}
     */
    function addQuery(pathname, query) {
      return pathname + (query ? `?${query}` : "");
    }

    /**
     * Resolve URIs as though every path is a directory, no files. Relative URIs
     * in the browser can feel awkward because not only can you be "in a directory",
     * you can be "at a file", too. For example:
     *
     *  browserSpecResolve('foo', '/bar/') => /bar/foo
     *  browserSpecResolve('foo', '/bar') => /foo
     *
     * But on the command line of a file system, it's not as complicated. You can't
     * `cd` from a file, only directories. This way, links have to know less about
     * their current path. To go deeper you can do this:
     *
     *  <Link to="deeper"/>
     *  // instead of
     *  <Link to=`{${props.uri}/deeper}`/>
     *
     * Just like `cd`, if you want to go deeper from the command line, you do this:
     *
     *  cd deeper
     *  # not
     *  cd $(pwd)/deeper
     *
     * By treating every path as a directory, linking to relative paths should
     * require less contextual information and (fingers crossed) be more intuitive.
     * @param {string} to
     * @param {string} base
     * @return {string}
     */
    function resolve(to, base) {
      // /foo/bar, /baz/qux => /foo/bar
      if (startsWith(to, "/")) {
        return to;
      }

      const [toPathname, toQuery] = to.split("?");
      const [basePathname] = base.split("?");
      const toSegments = segmentize(toPathname);
      const baseSegments = segmentize(basePathname);

      // ?a=b, /users?b=c => /users?a=b
      if (toSegments[0] === "") {
        return addQuery(basePathname, toQuery);
      }

      // profile, /users/789 => /users/789/profile
      if (!startsWith(toSegments[0], ".")) {
        const pathname = baseSegments.concat(toSegments).join("/");

        return addQuery((basePathname === "/" ? "" : "/") + pathname, toQuery);
      }

      // ./       , /users/123 => /users/123
      // ../      , /users/123 => /users
      // ../..    , /users/123 => /
      // ../../one, /a/b/c/d   => /a/b/one
      // .././one , /a/b/c/d   => /a/b/c/one
      const allSegments = baseSegments.concat(toSegments);
      const segments = [];

      allSegments.forEach(segment => {
        if (segment === "..") {
          segments.pop();
        } else if (segment !== ".") {
          segments.push(segment);
        }
      });

      return addQuery("/" + segments.join("/"), toQuery);
    }

    /**
     * Combines the `basepath` and the `path` into one path.
     * @param {string} basepath
     * @param {string} path
     */
    function combinePaths(basepath, path) {
      return `${stripSlashes(
    path === "/" ? basepath : `${stripSlashes(basepath)}/${stripSlashes(path)}`
  )}/`;
    }

    /**
     * Decides whether a given `event` should result in a navigation or not.
     * @param {object} event
     */
    function shouldNavigate(event) {
      return (
        !event.defaultPrevented &&
        event.button === 0 &&
        !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
      );
    }

    /* node_modules/svelte-routing/src/Router.svelte generated by Svelte v3.30.0 */

    function create_fragment(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[8], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $base;
    	let $location;
    	let $routes;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Router", slots, ['default']);
    	let { basepath = "/" } = $$props;
    	let { url = null } = $$props;
    	const locationContext = getContext(LOCATION);
    	const routerContext = getContext(ROUTER);
    	const routes = writable([]);
    	validate_store(routes, "routes");
    	component_subscribe($$self, routes, value => $$invalidate(7, $routes = value));
    	const activeRoute = writable(null);
    	let hasActiveRoute = false; // Used in SSR to synchronously set that a Route is active.

    	// If locationContext is not set, this is the topmost Router in the tree.
    	// If the `url` prop is given we force the location to it.
    	const location = locationContext || writable(url ? { pathname: url } : globalHistory.location);

    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(6, $location = value));

    	// If routerContext is set, the routerBase of the parent Router
    	// will be the base for this Router's descendants.
    	// If routerContext is not set, the path and resolved uri will both
    	// have the value of the basepath prop.
    	const base = routerContext
    	? routerContext.routerBase
    	: writable({ path: basepath, uri: basepath });

    	validate_store(base, "base");
    	component_subscribe($$self, base, value => $$invalidate(5, $base = value));

    	const routerBase = derived([base, activeRoute], ([base, activeRoute]) => {
    		// If there is no activeRoute, the routerBase will be identical to the base.
    		if (activeRoute === null) {
    			return base;
    		}

    		const { path: basepath } = base;
    		const { route, uri } = activeRoute;

    		// Remove the potential /* or /*splatname from
    		// the end of the child Routes relative paths.
    		const path = route.default
    		? basepath
    		: route.path.replace(/\*.*$/, "");

    		return { path, uri };
    	});

    	function registerRoute(route) {
    		const { path: basepath } = $base;
    		let { path } = route;

    		// We store the original path in the _path property so we can reuse
    		// it when the basepath changes. The only thing that matters is that
    		// the route reference is intact, so mutation is fine.
    		route._path = path;

    		route.path = combinePaths(basepath, path);

    		if (typeof window === "undefined") {
    			// In SSR we should set the activeRoute immediately if it is a match.
    			// If there are more Routes being registered after a match is found,
    			// we just skip them.
    			if (hasActiveRoute) {
    				return;
    			}

    			const matchingRoute = match(route, $location.pathname);

    			if (matchingRoute) {
    				activeRoute.set(matchingRoute);
    				hasActiveRoute = true;
    			}
    		} else {
    			routes.update(rs => {
    				rs.push(route);
    				return rs;
    			});
    		}
    	}

    	function unregisterRoute(route) {
    		routes.update(rs => {
    			const index = rs.indexOf(route);
    			rs.splice(index, 1);
    			return rs;
    		});
    	}

    	if (!locationContext) {
    		// The topmost Router in the tree is responsible for updating
    		// the location store and supplying it through context.
    		onMount(() => {
    			const unlisten = globalHistory.listen(history => {
    				location.set(history.location);
    			});

    			return unlisten;
    		});

    		setContext(LOCATION, location);
    	}

    	setContext(ROUTER, {
    		activeRoute,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute
    	});

    	const writable_props = ["basepath", "url"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("basepath" in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ("url" in $$props) $$invalidate(4, url = $$props.url);
    		if ("$$scope" in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		setContext,
    		onMount,
    		writable,
    		derived,
    		LOCATION,
    		ROUTER,
    		globalHistory,
    		pick,
    		match,
    		stripSlashes,
    		combinePaths,
    		basepath,
    		url,
    		locationContext,
    		routerContext,
    		routes,
    		activeRoute,
    		hasActiveRoute,
    		location,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute,
    		$base,
    		$location,
    		$routes
    	});

    	$$self.$inject_state = $$props => {
    		if ("basepath" in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ("url" in $$props) $$invalidate(4, url = $$props.url);
    		if ("hasActiveRoute" in $$props) hasActiveRoute = $$props.hasActiveRoute;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$base*/ 32) {
    			// This reactive statement will update all the Routes' path when
    			// the basepath changes.
    			 {
    				const { path: basepath } = $base;

    				routes.update(rs => {
    					rs.forEach(r => r.path = combinePaths(basepath, r._path));
    					return rs;
    				});
    			}
    		}

    		if ($$self.$$.dirty & /*$routes, $location*/ 192) {
    			// This reactive statement will be run when the Router is created
    			// when there are no Routes and then again the following tick, so it
    			// will not find an active Route in SSR and in the browser it will only
    			// pick an active Route after all Routes have been registered.
    			 {
    				const bestMatch = pick($routes, $location.pathname);
    				activeRoute.set(bestMatch);
    			}
    		}
    	};

    	return [
    		routes,
    		location,
    		base,
    		basepath,
    		url,
    		$base,
    		$location,
    		$routes,
    		$$scope,
    		slots
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { basepath: 3, url: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get basepath() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set basepath(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-routing/src/Route.svelte generated by Svelte v3.30.0 */

    const get_default_slot_changes = dirty => ({
    	params: dirty & /*routeParams*/ 4,
    	location: dirty & /*$location*/ 16
    });

    const get_default_slot_context = ctx => ({
    	params: /*routeParams*/ ctx[2],
    	location: /*$location*/ ctx[4]
    });

    // (40:0) {#if $activeRoute !== null && $activeRoute.route === route}
    function create_if_block(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*component*/ ctx[0] !== null) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(40:0) {#if $activeRoute !== null && $activeRoute.route === route}",
    		ctx
    	});

    	return block;
    }

    // (43:2) {:else}
    function create_else_block(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope, routeParams, $location*/ 532) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[9], dirty, get_default_slot_changes, get_default_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(43:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (41:2) {#if component !== null}
    function create_if_block_1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{ location: /*$location*/ ctx[4] },
    		/*routeParams*/ ctx[2],
    		/*routeProps*/ ctx[3]
    	];

    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*$location, routeParams, routeProps*/ 28)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*$location*/ 16 && { location: /*$location*/ ctx[4] },
    					dirty & /*routeParams*/ 4 && get_spread_object(/*routeParams*/ ctx[2]),
    					dirty & /*routeProps*/ 8 && get_spread_object(/*routeProps*/ ctx[3])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(41:2) {#if component !== null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$activeRoute*/ ctx[1] !== null && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[7] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$activeRoute*/ ctx[1] !== null && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[7]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$activeRoute*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $activeRoute;
    	let $location;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Route", slots, ['default']);
    	let { path = "" } = $$props;
    	let { component = null } = $$props;
    	const { registerRoute, unregisterRoute, activeRoute } = getContext(ROUTER);
    	validate_store(activeRoute, "activeRoute");
    	component_subscribe($$self, activeRoute, value => $$invalidate(1, $activeRoute = value));
    	const location = getContext(LOCATION);
    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(4, $location = value));

    	const route = {
    		path,
    		// If no path prop is given, this Route will act as the default Route
    		// that is rendered if no other Route in the Router is a match.
    		default: path === ""
    	};

    	let routeParams = {};
    	let routeProps = {};
    	registerRoute(route);

    	// There is no need to unregister Routes in SSR since it will all be
    	// thrown away anyway.
    	if (typeof window !== "undefined") {
    		onDestroy(() => {
    			unregisterRoute(route);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("path" in $$new_props) $$invalidate(8, path = $$new_props.path);
    		if ("component" in $$new_props) $$invalidate(0, component = $$new_props.component);
    		if ("$$scope" in $$new_props) $$invalidate(9, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onDestroy,
    		ROUTER,
    		LOCATION,
    		path,
    		component,
    		registerRoute,
    		unregisterRoute,
    		activeRoute,
    		location,
    		route,
    		routeParams,
    		routeProps,
    		$activeRoute,
    		$location
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), $$new_props));
    		if ("path" in $$props) $$invalidate(8, path = $$new_props.path);
    		if ("component" in $$props) $$invalidate(0, component = $$new_props.component);
    		if ("routeParams" in $$props) $$invalidate(2, routeParams = $$new_props.routeParams);
    		if ("routeProps" in $$props) $$invalidate(3, routeProps = $$new_props.routeProps);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$activeRoute*/ 2) {
    			 if ($activeRoute && $activeRoute.route === route) {
    				$$invalidate(2, routeParams = $activeRoute.params);
    			}
    		}

    		 {
    			const { path, component, ...rest } = $$props;
    			$$invalidate(3, routeProps = rest);
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		component,
    		$activeRoute,
    		routeParams,
    		routeProps,
    		$location,
    		activeRoute,
    		location,
    		route,
    		path,
    		$$scope,
    		slots
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { path: 8, component: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get path() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-routing/src/Link.svelte generated by Svelte v3.30.0 */
    const file = "node_modules/svelte-routing/src/Link.svelte";

    function create_fragment$2(ctx) {
    	let a;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[15].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[14], null);

    	let a_levels = [
    		{ href: /*href*/ ctx[0] },
    		{ "aria-current": /*ariaCurrent*/ ctx[2] },
    		/*props*/ ctx[1]
    	];

    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (default_slot) default_slot.c();
    			set_attributes(a, a_data);
    			add_location(a, file, 40, 0, 1249);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*onClick*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 16384) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[14], dirty, null, null);
    				}
    			}

    			set_attributes(a, a_data = get_spread_update(a_levels, [
    				(!current || dirty & /*href*/ 1) && { href: /*href*/ ctx[0] },
    				(!current || dirty & /*ariaCurrent*/ 4) && { "aria-current": /*ariaCurrent*/ ctx[2] },
    				dirty & /*props*/ 2 && /*props*/ ctx[1]
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $base;
    	let $location;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Link", slots, ['default']);
    	let { to = "#" } = $$props;
    	let { replace = false } = $$props;
    	let { state = {} } = $$props;
    	let { getProps = () => ({}) } = $$props;
    	const { base } = getContext(ROUTER);
    	validate_store(base, "base");
    	component_subscribe($$self, base, value => $$invalidate(12, $base = value));
    	const location = getContext(LOCATION);
    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(13, $location = value));
    	const dispatch = createEventDispatcher();
    	let href, isPartiallyCurrent, isCurrent, props;

    	function onClick(event) {
    		dispatch("click", event);

    		if (shouldNavigate(event)) {
    			event.preventDefault();

    			// Don't push another entry to the history stack when the user
    			// clicks on a Link to the page they are currently on.
    			const shouldReplace = $location.pathname === href || replace;

    			navigate(href, { state, replace: shouldReplace });
    		}
    	}

    	const writable_props = ["to", "replace", "state", "getProps"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Link> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("to" in $$props) $$invalidate(6, to = $$props.to);
    		if ("replace" in $$props) $$invalidate(7, replace = $$props.replace);
    		if ("state" in $$props) $$invalidate(8, state = $$props.state);
    		if ("getProps" in $$props) $$invalidate(9, getProps = $$props.getProps);
    		if ("$$scope" in $$props) $$invalidate(14, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		createEventDispatcher,
    		ROUTER,
    		LOCATION,
    		navigate,
    		startsWith,
    		resolve,
    		shouldNavigate,
    		to,
    		replace,
    		state,
    		getProps,
    		base,
    		location,
    		dispatch,
    		href,
    		isPartiallyCurrent,
    		isCurrent,
    		props,
    		onClick,
    		$base,
    		$location,
    		ariaCurrent
    	});

    	$$self.$inject_state = $$props => {
    		if ("to" in $$props) $$invalidate(6, to = $$props.to);
    		if ("replace" in $$props) $$invalidate(7, replace = $$props.replace);
    		if ("state" in $$props) $$invalidate(8, state = $$props.state);
    		if ("getProps" in $$props) $$invalidate(9, getProps = $$props.getProps);
    		if ("href" in $$props) $$invalidate(0, href = $$props.href);
    		if ("isPartiallyCurrent" in $$props) $$invalidate(10, isPartiallyCurrent = $$props.isPartiallyCurrent);
    		if ("isCurrent" in $$props) $$invalidate(11, isCurrent = $$props.isCurrent);
    		if ("props" in $$props) $$invalidate(1, props = $$props.props);
    		if ("ariaCurrent" in $$props) $$invalidate(2, ariaCurrent = $$props.ariaCurrent);
    	};

    	let ariaCurrent;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*to, $base*/ 4160) {
    			 $$invalidate(0, href = to === "/" ? $base.uri : resolve(to, $base.uri));
    		}

    		if ($$self.$$.dirty & /*$location, href*/ 8193) {
    			 $$invalidate(10, isPartiallyCurrent = startsWith($location.pathname, href));
    		}

    		if ($$self.$$.dirty & /*href, $location*/ 8193) {
    			 $$invalidate(11, isCurrent = href === $location.pathname);
    		}

    		if ($$self.$$.dirty & /*isCurrent*/ 2048) {
    			 $$invalidate(2, ariaCurrent = isCurrent ? "page" : undefined);
    		}

    		if ($$self.$$.dirty & /*getProps, $location, href, isPartiallyCurrent, isCurrent*/ 11777) {
    			 $$invalidate(1, props = getProps({
    				location: $location,
    				href,
    				isPartiallyCurrent,
    				isCurrent
    			}));
    		}
    	};

    	return [
    		href,
    		props,
    		ariaCurrent,
    		base,
    		location,
    		onClick,
    		to,
    		replace,
    		state,
    		getProps,
    		isPartiallyCurrent,
    		isCurrent,
    		$base,
    		$location,
    		$$scope,
    		slots
    	];
    }

    class Link extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { to: 6, replace: 7, state: 8, getProps: 9 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Link",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get to() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set to(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get replace() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set replace(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get state() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set state(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getProps() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getProps(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function getPrev( project ){
        let i = project.images.length - 1;
        return project.url + '#' + i;
    }
    function getNext( project ){
        return project.url;
    }

    function getProject( projects, url ){
        let project;
        for (let i = 0; i < projects.length; i++) {
            if( projects[i].url === url ){
                project = projects[i];
                project['prev'] = getPrev( i > 0 ? projects[i-1] : projects[projects.length-1] );
                project['next'] = getNext( i < projects.length-1 ? projects[i+1] : projects[0] );
                break;
            }
        }
        return project;
    }

    /* src/components/Header.svelte generated by Svelte v3.30.0 */

    const file$1 = "src/components/Header.svelte";

    // (3:14) Tobias Bierler
    function fallback_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Tobias Bierler");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(3:14) Tobias Bierler",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let header;
    	let h1;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);
    	const default_slot_or_fallback = default_slot || fallback_block(ctx);

    	const block = {
    		c: function create() {
    			header = element("header");
    			h1 = element("h1");
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    			add_location(h1, file$1, 2, 4, 14);
    			attr_dev(header, "class", "svelte-1piwncw");
    			add_location(header, file$1, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, h1);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(h1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[0], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Header", slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function imageIndex( portfolio ){
        let images = [];
        for( const project of portfolio.pages ){
            for (let i = 0; i < project.images.length; i++){
                images.push({ ...project.images[i],
                    project: project.title,
                    href: i === 0 ? project.url : project.url + '#' + i
                });

            }
        }
        return shuffle( images );
    }

    /* src/components/Img.svelte generated by Svelte v3.30.0 */

    const file$2 = "src/components/Img.svelte";

    function create_fragment$4(ctx) {
    	let img;
    	let img_data_srcset_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "alt", /*alt*/ ctx[2]);
    			attr_dev(img, "data-sizes", "auto");
    			attr_dev(img, "class", "lazyload");
    			attr_dev(img, "data-src", /*src*/ ctx[1]);
    			attr_dev(img, "data-srcset", img_data_srcset_value = set(/*srcset*/ ctx[0]));
    			add_location(img, file$2, 16, 0, 278);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*alt*/ 4) {
    				attr_dev(img, "alt", /*alt*/ ctx[2]);
    			}

    			if (dirty & /*src*/ 2) {
    				attr_dev(img, "data-src", /*src*/ ctx[1]);
    			}

    			if (dirty & /*srcset*/ 1 && img_data_srcset_value !== (img_data_srcset_value = set(/*srcset*/ ctx[0]))) {
    				attr_dev(img, "data-srcset", img_data_srcset_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function set(srcset) {
    	let r = "";

    	for (const size of srcset) {
    		r += `${size.src} ${size.width}w, `;
    	}

    	return r;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Img", slots, []);
    	let { srcset = [] } = $$props;
    	let { src = srcset[0].url } = $$props;
    	let { alt = "" } = $$props;
    	const writable_props = ["srcset", "src", "alt"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Img> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("srcset" in $$props) $$invalidate(0, srcset = $$props.srcset);
    		if ("src" in $$props) $$invalidate(1, src = $$props.src);
    		if ("alt" in $$props) $$invalidate(2, alt = $$props.alt);
    	};

    	$$self.$capture_state = () => ({ srcset, src, alt, set });

    	$$self.$inject_state = $$props => {
    		if ("srcset" in $$props) $$invalidate(0, srcset = $$props.srcset);
    		if ("src" in $$props) $$invalidate(1, src = $$props.src);
    		if ("alt" in $$props) $$invalidate(2, alt = $$props.alt);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [srcset, src, alt];
    }

    class Img extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { srcset: 0, src: 1, alt: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Img",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get srcset() {
    		throw new Error("<Img>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set srcset(value) {
    		throw new Error("<Img>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get src() {
    		throw new Error("<Img>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set src(value) {
    		throw new Error("<Img>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get alt() {
    		throw new Error("<Img>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set alt(value) {
    		throw new Error("<Img>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Grid.svelte generated by Svelte v3.30.0 */
    const file$3 = "src/components/Grid.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (13:12) <Link to={image.href}>
    function create_default_slot(ctx) {
    	let figure;
    	let img;
    	let figure_title_value;
    	let current;

    	img = new Img({
    			props: {
    				srcset: /*image*/ ctx[1].srcset,
    				alt: /*image*/ ctx[1].alt
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			figure = element("figure");
    			create_component(img.$$.fragment);
    			attr_dev(figure, "title", figure_title_value = "" + (/*image*/ ctx[1].project + " " + /*image*/ ctx[1].alt));
    			attr_dev(figure, "class", "svelte-bz0lce");
    			add_location(figure, file$3, 13, 4, 219);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, figure, anchor);
    			mount_component(img, figure, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const img_changes = {};
    			if (dirty & /*images*/ 1) img_changes.srcset = /*image*/ ctx[1].srcset;
    			if (dirty & /*images*/ 1) img_changes.alt = /*image*/ ctx[1].alt;
    			img.$set(img_changes);

    			if (!current || dirty & /*images*/ 1 && figure_title_value !== (figure_title_value = "" + (/*image*/ ctx[1].project + " " + /*image*/ ctx[1].alt))) {
    				attr_dev(figure, "title", figure_title_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(img.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(img.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(figure);
    			destroy_component(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(13:12) <Link to={image.href}>",
    		ctx
    	});

    	return block;
    }

    // (11:4) {#each images as image}
    function create_each_block(ctx) {
    	let li;
    	let link;
    	let t;
    	let current;

    	link = new Link({
    			props: {
    				to: /*image*/ ctx[1].href,
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			li = element("li");
    			create_component(link.$$.fragment);
    			t = space();
    			attr_dev(li, "class", "svelte-bz0lce");
    			add_location(li, file$3, 11, 8, 175);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			mount_component(link, li, null);
    			append_dev(li, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const link_changes = {};
    			if (dirty & /*images*/ 1) link_changes.to = /*image*/ ctx[1].href;

    			if (dirty & /*$$scope, images*/ 17) {
    				link_changes.$$scope = { dirty, ctx };
    			}

    			link.$set(link_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_component(link);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(11:4) {#each images as image}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let ul;
    	let current;
    	let each_value = /*images*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "svelte-bz0lce");
    			add_location(ul, file$3, 9, 0, 134);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*images*/ 1) {
    				each_value = /*images*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Grid", slots, []);
    	let { images } = $$props;
    	const writable_props = ["images"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Grid> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("images" in $$props) $$invalidate(0, images = $$props.images);
    	};

    	$$self.$capture_state = () => ({ Link, Img, images });

    	$$self.$inject_state = $$props => {
    		if ("images" in $$props) $$invalidate(0, images = $$props.images);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [images];
    }

    class Grid extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { images: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Grid",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*images*/ ctx[0] === undefined && !("images" in props)) {
    			console.warn("<Grid> was created without expected prop 'images'");
    		}
    	}

    	get images() {
    		throw new Error("<Grid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set images(value) {
    		throw new Error("<Grid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/routes/Index.svelte generated by Svelte v3.30.0 */

    function create_fragment$6(ctx) {
    	let grid;
    	let current;

    	grid = new Grid({
    			props: { images: /*images*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(grid.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(grid, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(grid.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(grid.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(grid, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Index", slots, []);
    	let { data } = $$props;
    	let images = imageIndex(data);
    	const writable_props = ["data"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Index> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("data" in $$props) $$invalidate(1, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({ Link, imageIndex, Grid, data, images });

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(1, data = $$props.data);
    		if ("images" in $$props) $$invalidate(0, images = $$props.images);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [images, data];
    }

    class Index extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { data: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Index",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[1] === undefined && !("data" in props)) {
    			console.warn("<Index> was created without expected prop 'data'");
    		}
    	}

    	get data() {
    		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/routes/Info.svelte generated by Svelte v3.30.0 */

    const file$4 = "src/routes/Info.svelte";

    function create_fragment$7(ctx) {
    	let main;
    	let p0;
    	let t1;
    	let p1;
    	let t3;
    	let p2;
    	let t5;
    	let p3;
    	let t7;
    	let p4;
    	let t9;
    	let p5;
    	let t11;
    	let p6;
    	let t13;
    	let p7;
    	let t15;
    	let p8;
    	let t17;
    	let p9;
    	let t19;
    	let p10;

    	const block = {
    		c: function create() {
    			main = element("main");
    			p0 = element("p");
    			p0.textContent = "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.";
    			t1 = space();
    			p1 = element("p");
    			p1.textContent = "Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.";
    			t3 = space();
    			p2 = element("p");
    			p2.textContent = "Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi.";
    			t5 = space();
    			p3 = element("p");
    			p3.textContent = "Nam liber tempor cum soluta nobis eleifend option congue nihil imperdiet doming id quod mazim placerat facer possim assum. Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.";
    			t7 = space();
    			p4 = element("p");
    			p4.textContent = "Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis.";
    			t9 = space();
    			p5 = element("p");
    			p5.textContent = "At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, At accusam aliquyam diam diam dolore dolores duo eirmod eos erat, et nonumy sed tempor et et invidunt justo labore Stet clita ea et gubergren, kasd magna no rebum. sanctus sea sed takimata ut vero voluptua. est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat.";
    			t11 = space();
    			p6 = element("p");
    			p6.textContent = "Consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus.";
    			t13 = space();
    			p7 = element("p");
    			p7.textContent = "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.";
    			t15 = space();
    			p8 = element("p");
    			p8.textContent = "Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.";
    			t17 = space();
    			p9 = element("p");
    			p9.textContent = "Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi.";
    			t19 = space();
    			p10 = element("p");
    			p10.textContent = "Nam liber tempor cum soluta nobis eleifend option congue nihil imperdiet doming id quod mazim placerat facer possim assum. Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo.";
    			add_location(p0, file$4, 2, 4, 12);
    			add_location(p1, file$4, 3, 4, 911);
    			add_location(p2, file$4, 4, 4, 1338);
    			add_location(p3, file$4, 5, 4, 1748);
    			add_location(p4, file$4, 6, 4, 2155);
    			add_location(p5, file$4, 7, 4, 2300);
    			add_location(p6, file$4, 8, 4, 3180);
    			add_location(p7, file$4, 9, 4, 4020);
    			add_location(p8, file$4, 10, 4, 4919);
    			add_location(p9, file$4, 11, 4, 5346);
    			add_location(p10, file$4, 12, 4, 5756);
    			attr_dev(main, "class", "svelte-12a1k66");
    			add_location(main, file$4, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, p0);
    			append_dev(main, t1);
    			append_dev(main, p1);
    			append_dev(main, t3);
    			append_dev(main, p2);
    			append_dev(main, t5);
    			append_dev(main, p3);
    			append_dev(main, t7);
    			append_dev(main, p4);
    			append_dev(main, t9);
    			append_dev(main, p5);
    			append_dev(main, t11);
    			append_dev(main, p6);
    			append_dev(main, t13);
    			append_dev(main, p7);
    			append_dev(main, t15);
    			append_dev(main, p8);
    			append_dev(main, t17);
    			append_dev(main, p9);
    			append_dev(main, t19);
    			append_dev(main, p10);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Info", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Info> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Info extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Info",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/routes/Catalogue.svelte generated by Svelte v3.30.0 */
    const file$5 = "src/routes/Catalogue.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	child_ctx[6] = i;
    	return child_ctx;
    }

    // (15:4) <Link to={project.url}>
    function create_default_slot_1(ctx) {
    	let h2;
    	let span0;
    	let t0_value = /*project*/ ctx[1].year + "";
    	let t0;
    	let t1;
    	let span1;
    	let t2_value = /*project*/ ctx[1].title + "";
    	let t2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			span0 = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			span1 = element("span");
    			t2 = text(t2_value);
    			attr_dev(span0, "class", "svelte-1h4gris");
    			add_location(span0, file$5, 16, 6, 251);
    			attr_dev(span1, "class", "svelte-1h4gris");
    			add_location(span1, file$5, 17, 6, 285);
    			attr_dev(h2, "class", "svelte-1h4gris");
    			add_location(h2, file$5, 15, 5, 240);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			append_dev(h2, span0);
    			append_dev(span0, t0);
    			append_dev(h2, t1);
    			append_dev(h2, span1);
    			append_dev(span1, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 1 && t0_value !== (t0_value = /*project*/ ctx[1].year + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*data*/ 1 && t2_value !== (t2_value = /*project*/ ctx[1].title + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(15:4) <Link to={project.url}>",
    		ctx
    	});

    	return block;
    }

    // (26:6) <Link to="{project.url}#{i}">
    function create_default_slot$1(ctx) {
    	let figure;
    	let img;
    	let t0;
    	let figcaption;
    	let t1_value = /*image*/ ctx[4].alt + "";
    	let t1;
    	let figure_title_value;
    	let current;

    	img = new Img({
    			props: {
    				srcset: /*image*/ ctx[4].srcset,
    				alt: /*image*/ ctx[4].alt
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			figure = element("figure");
    			create_component(img.$$.fragment);
    			t0 = space();
    			figcaption = element("figcaption");
    			t1 = text(t1_value);
    			attr_dev(figcaption, "class", "svelte-1h4gris");
    			add_location(figcaption, file$5, 28, 8, 560);
    			attr_dev(figure, "title", figure_title_value = /*image*/ ctx[4].alt);
    			attr_dev(figure, "class", "svelte-1h4gris");
    			add_location(figure, file$5, 26, 7, 467);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, figure, anchor);
    			mount_component(img, figure, null);
    			append_dev(figure, t0);
    			append_dev(figure, figcaption);
    			append_dev(figcaption, t1);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const img_changes = {};
    			if (dirty & /*data*/ 1) img_changes.srcset = /*image*/ ctx[4].srcset;
    			if (dirty & /*data*/ 1) img_changes.alt = /*image*/ ctx[4].alt;
    			img.$set(img_changes);
    			if ((!current || dirty & /*data*/ 1) && t1_value !== (t1_value = /*image*/ ctx[4].alt + "")) set_data_dev(t1, t1_value);

    			if (!current || dirty & /*data*/ 1 && figure_title_value !== (figure_title_value = /*image*/ ctx[4].alt)) {
    				attr_dev(figure, "title", figure_title_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(img.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(img.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(figure);
    			destroy_component(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(26:6) <Link to=\\\"{project.url}#{i}\\\">",
    		ctx
    	});

    	return block;
    }

    // (24:4) {#each project.images as image, i}
    function create_each_block_1(ctx) {
    	let li;
    	let link;
    	let t;
    	let current;

    	link = new Link({
    			props: {
    				to: "" + (/*project*/ ctx[1].url + "#" + /*i*/ ctx[6]),
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			li = element("li");
    			create_component(link.$$.fragment);
    			t = space();
    			attr_dev(li, "class", "svelte-1h4gris");
    			add_location(li, file$5, 24, 5, 419);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			mount_component(link, li, null);
    			append_dev(li, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const link_changes = {};
    			if (dirty & /*data*/ 1) link_changes.to = "" + (/*project*/ ctx[1].url + "#" + /*i*/ ctx[6]);

    			if (dirty & /*$$scope, data*/ 129) {
    				link_changes.$$scope = { dirty, ctx };
    			}

    			link.$set(link_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_component(link);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(24:4) {#each project.images as image, i}",
    		ctx
    	});

    	return block;
    }

    // (11:1) {#each data.pages as project}
    function create_each_block$1(ctx) {
    	let article;
    	let header;
    	let link;
    	let t0;
    	let ul;
    	let t1;
    	let current;

    	link = new Link({
    			props: {
    				to: /*project*/ ctx[1].url,
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let each_value_1 = /*project*/ ctx[1].images;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			article = element("article");
    			header = element("header");
    			create_component(link.$$.fragment);
    			t0 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			attr_dev(header, "class", "svelte-1h4gris");
    			add_location(header, file$5, 13, 3, 198);
    			attr_dev(ul, "class", "gallery svelte-1h4gris");
    			add_location(ul, file$5, 22, 3, 354);
    			attr_dev(article, "class", "svelte-1h4gris");
    			add_location(article, file$5, 12, 2, 185);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);
    			append_dev(article, header);
    			mount_component(link, header, null);
    			append_dev(article, t0);
    			append_dev(article, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			append_dev(article, t1);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const link_changes = {};
    			if (dirty & /*data*/ 1) link_changes.to = /*project*/ ctx[1].url;

    			if (dirty & /*$$scope, data*/ 129) {
    				link_changes.$$scope = { dirty, ctx };
    			}

    			link.$set(link_changes);

    			if (dirty & /*data*/ 1) {
    				each_value_1 = /*project*/ ctx[1].images;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link.$$.fragment, local);

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    			destroy_component(link);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(11:1) {#each data.pages as project}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let div;
    	let current;
    	let each_value = /*data*/ ctx[0].pages;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "wrapper svelte-1h4gris");
    			add_location(div, file$5, 9, 0, 129);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*data*/ 1) {
    				each_value = /*data*/ ctx[0].pages;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Catalogue", slots, []);
    	let { data } = $$props;
    	const writable_props = ["data"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Catalogue> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({ Link, Img, data });

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data];
    }

    class Catalogue extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { data: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Catalogue",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[0] === undefined && !("data" in props)) {
    			console.warn("<Catalogue> was created without expected prop 'data'");
    		}
    	}

    	get data() {
    		throw new Error("<Catalogue>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Catalogue>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, basedir, module) {
    	return module = {
    		path: basedir,
    		exports: {},
    		require: function (path, base) {
    			return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
    		}
    	}, fn(module, module.exports), module.exports;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    var swipe = createCommonjsModule(function (module) {
    (function (root, factory) {
      root = root || {};
      // eslint-disable-next-line no-undef
      if ( module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
      } else {
        // Browser globals
        root.Swipe = factory();
      }
    }(commonjsGlobal, function () {
      // Establish the root object, `window` (`self`) in the browser, `global`
      // on the server, or `this` in some virtual machines. We use `self`
      // instead of `window` for `WebWorker` support.
      var root = typeof self == 'object' && self.self === self && self ||
                 typeof commonjsGlobal == 'object' && commonjsGlobal.global === commonjsGlobal && commonjsGlobal ||
                 this;

      var _document = root.document;

      function Swipe(container, options) {

        options = options || {};

        // setup initial vars
        var start = {};
        var delta = {};
        var isScrolling;

        // setup auto slideshow
        var delay = options.auto || 0;
        var interval;

        var disabled = false;

        // utilities
        // simple no operation function
        var noop = function() {};
        // offload a functions execution
        var offloadFn = function(fn) { setTimeout(fn || noop, 0); };
        // Returns a function, that, as long as it continues to be invoked, will not
        // be triggered.
        var throttle = function (fn, threshhold) {
          threshhold = threshhold || 100;
          var timeout = null;

          function cancel() {
            if (timeout) clearTimeout(timeout);
          }

          function throttledFn() {
            var context = this;
            var args = arguments;
            cancel();
            timeout = setTimeout(function() {
              timeout = null;
              fn.apply(context, args);
            }, threshhold);
          }

          // allow remove throttled timeout
          throttledFn.cancel = cancel;

          return throttledFn;
        };

        // check whether event is cancelable
        var isCancelable = function (event) {
          if (!event) return false;
          return typeof event.cancelable !== 'boolean' || event.cancelable;
        };

        // polyfill for browsers that do not support Element.matches()
        if (!Element.prototype.matches) {
          Element.prototype.matches =
            Element.prototype.matchesSelector ||
            Element.prototype.mozMatchesSelector ||
            Element.prototype.msMatchesSelector ||
            Element.prototype.oMatchesSelector ||
            Element.prototype.webkitMatchesSelector ||
            function (s) {
              var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                i = matches.length;
              while (--i >= 0 && matches.item(i) !== this)
                ;
              return i > -1;
            };
        }

        // check browser capabilities
        var browser = {
          addEventListener: !!root.addEventListener,
          passiveEvents: (function () {
            // Test via a getter in the options object to see if the passive property is accessed
            var supportsPassive = false;
            try {
              var opts = Object.defineProperty({}, 'passive', {
                // eslint-disable-next-line getter-return
                get: function () {
                  supportsPassive = true;
                }
              });
              root.addEventListener('testEvent', null, opts);
              root.removeEventListener('testEvent', null, opts);
            }
            catch (e) {
              supportsPassive = false;
            }
            return supportsPassive;
          })(),
          // eslint-disable-next-line no-undef
          touch: ('ontouchstart' in root) || root.DocumentTouch && _document instanceof DocumentTouch,
          transitions: (function(temp) {
            var props = ['transitionProperty', 'WebkitTransition', 'MozTransition', 'OTransition', 'msTransition'];
            for ( var i in props ) {
              if (temp.style[ props[i] ] !== undefined){
                return true;
              }
            }
            return false;
          })(_document.createElement('swipe'))
        };

        // quit if no root element
        if (!container) return;

        var element = container.children[0];
        var slides, slidePos, width, length;
        var index = parseInt(options.startSlide, 10) || 0;
        var speed = options.speed || 300;
        options.continuous = options.continuous !== undefined ? options.continuous : true;

        // check text direction
        var slideDir = (function(el, prop, dir) {
          if (el.currentStyle) {
            dir = el.currentStyle[prop];
          } else if (root.getComputedStyle) {
            dir = root.getComputedStyle(el, null).getPropertyValue(prop);
          }
          return 'rtl' === dir ? 'right' : 'left';
        })(container, 'direction');

        // AutoRestart option: auto restart slideshow after user's touch event
        options.autoRestart = options.autoRestart !== undefined ? options.autoRestart : false;

        // throttled setup
        var throttledSetup = throttle(setup);

        // setup event capturing
        var events = {

          handleEvent: function(event) {
            if (disabled) return;

            switch (event.type) {
              case 'mousedown':
              case 'touchstart': this.start(event); break;
              case 'mousemove':
              case 'touchmove': this.move(event); break;
              case 'mouseup':
              case 'mouseleave':
              case 'touchend': this.end(event); break;
              case 'webkitTransitionEnd':
              case 'msTransitionEnd':
              case 'oTransitionEnd':
              case 'otransitionend':
              case 'transitionend': this.transitionEnd(event); break;
              case 'resize': throttledSetup(); break;
            }

            if (options.stopPropagation) {
              event.stopPropagation();
            }
          },

          start: function(event) {
            var touches;

            if (isMouseEvent(event)) {
              touches = event;
              event.preventDefault(); // For desktop Safari drag
            } else {
              touches = event.touches[0];
            }

            // check if the user is swiping on an element that the options say to ignore (for example, a scrolling area)
            if (options.ignore && touches.target.matches(options.ignore)) {
              return;
            }

            // measure start values
            start = {

              // get initial touch coords
              x: touches.pageX,
              y: touches.pageY,

              // store time to determine touch duration
              time: +new Date()

            };

            // used for testing first move event
            isScrolling = undefined;

            // reset delta and end measurements
            delta = {};

            // attach touchmove and touchend listeners
            if (isMouseEvent(event)) {
              element.addEventListener('mousemove', this, false);
              element.addEventListener('mouseup', this, false);
              element.addEventListener('mouseleave', this, false);
            } else {
              element.addEventListener('touchmove', this, browser.passiveEvents ? { passive: false } : false);
              element.addEventListener('touchend', this, false);
            }
            runDragStart(getPos(), slides[index]);
          },

          move: function(event) {
            var touches;

            if (isMouseEvent(event)) {
              touches = event;
            } else {
              // ensure swiping with one touch and not pinching
              if ( event.touches.length > 1 || event.scale && event.scale !== 1) {
                return;
              }

              // we can disable scrolling unless it is already in progress
              if (options.disableScroll && isCancelable(event)) {
                event.preventDefault();
              }

              touches = event.touches[0];
            }

            // measure change in x and y
            delta = {
              x: touches.pageX - start.x,
              y: touches.pageY - start.y
            };

            // determine if scrolling test has run - one time test
            if ( typeof isScrolling === 'undefined') {
              isScrolling = !!( isScrolling || Math.abs(delta.x) < Math.abs(delta.y) );
            }

            // if user is not trying to scroll vertically
            if (!isScrolling) {

              // if it is not already scrolling
              if (isCancelable(event)) {
                // prevent native scrolling
                event.preventDefault();
              }

              // stop slideshow
              stop();

              // increase resistance if first or last slide
              if (options.continuous) { // we don't add resistance at the end

                translate(circle(index-1), delta.x + slidePos[circle(index-1)], 0);
                translate(index, delta.x + slidePos[index], 0);
                translate(circle(index+1), delta.x + slidePos[circle(index+1)], 0);

              } else {

                delta.x =
                  delta.x /
                  ( (!index && delta.x > 0 ||             // if first slide and sliding left
                     index === slides.length - 1 &&        // or if last slide and sliding right
                     delta.x < 0                           // and if sliding at all
                  ) ?
                    ( Math.abs(delta.x) / width + 1 )      // determine resistance level
                    : 1 );                                 // no resistance if false

                // translate 1:1
                translate(index-1, delta.x + slidePos[index-1], 0);
                translate(index, delta.x + slidePos[index], 0);
                translate(index+1, delta.x + slidePos[index+1], 0);
              }
            }
          },

          end: function(event) {

            // measure duration
            var duration = +new Date() - start.time;

            // determine if slide attempt triggers next/prev slide
            var isValidSlide =
                Number(duration) < 250 &&         // if slide duration is less than 250ms
                Math.abs(delta.x) > 20 ||         // and if slide amt is greater than 20px
                Math.abs(delta.x) > width/2;      // or if slide amt is greater than half the width

            // determine if slide attempt is past start and end
            var isPastBounds =
                !index && delta.x > 0 ||                      // if first slide and slide amt is greater than 0
                index === slides.length - 1 && delta.x < 0;   // or if last slide and slide amt is less than 0

            if (options.continuous) {
              isPastBounds = false;
            }

            // OLD determine direction of swipe (true:right, false:left)
            // determine direction of swipe (1: backward, -1: forward)
            var direction = Math.abs(delta.x) / delta.x;

            // if not scrolling vertically
            if (!isScrolling) {

              if (isValidSlide && !isPastBounds) {

                // if we're moving right
                if (direction < 0) {

                  if (options.continuous) { // we need to get the next in this direction in place

                    move(circle(index-1), -width, 0);
                    move(circle(index+2), width, 0);

                  } else {
                    move(index-1, -width, 0);
                  }

                  move(index, slidePos[index]-width, speed);
                  move(circle(index+1), slidePos[circle(index+1)]-width, speed);
                  index = circle(index+1);

                } else {
                  if (options.continuous) { // we need to get the next in this direction in place

                    move(circle(index+1), width, 0);
                    move(circle(index-2), -width, 0);

                  } else {
                    move(index+1, width, 0);
                  }

                  move(index, slidePos[index]+width, speed);
                  move(circle(index-1), slidePos[circle(index-1)]+width, speed);
                  index = circle(index-1);
                }

                runCallback(getPos(), slides[index], direction);

              } else {

                if (options.continuous) {

                  move(circle(index-1), -width, speed);
                  move(index, 0, speed);
                  move(circle(index+1), width, speed);

                } else {

                  move(index-1, -width, speed);
                  move(index, 0, speed);
                  move(index+1, width, speed);
                }
              }
            }

            // kill touchmove and touchend event listeners until touchstart called again
            if (isMouseEvent(event)) {
              element.removeEventListener('mousemove', events, false);
              element.removeEventListener('mouseup', events, false);
              element.removeEventListener('mouseleave', events, false);
            } else {
              element.removeEventListener('touchmove', events, browser.passiveEvents ? { passive: false } : false);
              element.removeEventListener('touchend', events, false);
            }
            runDragEnd(getPos(), slides[index]);
          },

          transitionEnd: function(event) {
            var currentIndex = parseInt(event.target.getAttribute('data-index'), 10);
            if (currentIndex === index) {
              if (delay || options.autoRestart) restart();

              runTransitionEnd(getPos(), slides[index]);
            }
          }
        };

        // trigger setup
        setup();

        // start auto slideshow if applicable
        begin();

        // Expose the Swipe API
        return {
          // initialize
          setup: setup,

          // go to slide
          slide: function(to, speed) {
            stop();
            slide(to, speed);
          },

          // move to previous
          prev: function() {
            stop();
            prev();
          },

          // move to next
          next: function() {
            stop();
            next();
          },

          // Restart slideshow
          restart: restart,

          // cancel slideshow
          stop: stop,

          // return current index position
          getPos: getPos,

          // disable slideshow
          disable: disable,

          // enable slideshow
          enable: enable,

          // return total number of slides
          getNumSlides: function() { return length; },

          // completely remove swipe
          kill: kill
        };

        // remove all event listeners
        function detachEvents() {
          if (browser.addEventListener) {
            // remove current event listeners
            element.removeEventListener('touchstart', events, browser.passiveEvents ? { passive: true } : false);
            element.removeEventListener('mousedown', events, false);
            element.removeEventListener('webkitTransitionEnd', events, false);
            element.removeEventListener('msTransitionEnd', events, false);
            element.removeEventListener('oTransitionEnd', events, false);
            element.removeEventListener('otransitionend', events, false);
            element.removeEventListener('transitionend', events, false);
            root.removeEventListener('resize', events, false);
          } else {
            root.onresize = null;
          }
        }

        // add event listeners
        function attachEvents() {
          if (browser.addEventListener) {

            // set touchstart event on element
            if (browser.touch) {
              element.addEventListener('touchstart', events, browser.passiveEvents ? { passive: true } : false);
            }

            if (options.draggable) {
              element.addEventListener('mousedown', events, false);
            }

            if (browser.transitions) {
              element.addEventListener('webkitTransitionEnd', events, false);
              element.addEventListener('msTransitionEnd', events, false);
              element.addEventListener('oTransitionEnd', events, false);
              element.addEventListener('otransitionend', events, false);
              element.addEventListener('transitionend', events, false);
            }

            // set resize event on window
            root.addEventListener('resize', events, false);

          } else {
            root.onresize = throttledSetup; // to play nice with old IE
          }
        }

        // clone nodes when there is only two slides
        function cloneNode(el) {
          var clone = el.cloneNode(true);
          element.appendChild(clone);

          // tag these slides as clones (to remove them on kill)
          clone.setAttribute('data-cloned', true);

          // Remove id from element
          clone.removeAttribute('id');
        }

        function setup(opts) {
          // Overwrite options if necessary
          if (opts != null) {
            for (var prop in opts) {
              options[prop] = opts[prop];
            }
          }

          // cache slides
          slides = element.children;
          length = slides.length;

          // slides length correction, minus cloned slides
          for (var i = 0; i < slides.length; i++) {
            if (slides[i].getAttribute('data-cloned')) length--;
          }

          // set continuous to false if only one slide
          if (slides.length < 2) {
            options.continuous = false;
          }

          // special case if two slides
          if (browser.transitions && options.continuous && slides.length < 3) {
            cloneNode(slides[0]);
            cloneNode(slides[1]);

            slides = element.children;
          }

          // adjust style on rtl
          if ('right' === slideDir) {
            for (var j = 0; j < slides.length; j++) {
              slides[j].style.float = 'right';
            }
          }

          // create an array to store current positions of each slide
          slidePos = new Array(slides.length);

          // determine width of each slide
          width = container.getBoundingClientRect().width || container.offsetWidth;

          element.style.width = (slides.length * width * 2) + 'px';

          // stack elements
          var pos = slides.length;
          while(pos--) {
            var slide = slides[pos];

            slide.style.width = width + 'px';
            slide.setAttribute('data-index', pos);

            if (browser.transitions) {
              slide.style[slideDir] = (pos * -width) + 'px';
              move(pos, index > pos ? -width : (index < pos ? width : 0), 0);
            }
          }

          // reposition elements before and after index
          if (options.continuous && browser.transitions) {
            move(circle(index-1), -width, 0);
            move(circle(index+1), width, 0);
          }

          if (!browser.transitions) {
            element.style[slideDir] = (index * -width) + 'px';
          }

          container.style.visibility = 'visible';

          // reinitialize events
          detachEvents();
          attachEvents();
        }

        function prev() {
          if (disabled) return;

          if (options.continuous) {
            slide(index-1);
          } else if (index) {
            slide(index-1);
          }
        }

        function next() {
          if (disabled) return;

          if (options.continuous) {
            slide(index+1);
          } else if (index < slides.length - 1) {
            slide(index+1);
          }
        }

        function runCallback(pos, index, dir) {
          if (options.callback) {
            options.callback(pos, index, dir);
          }
        }

        function runTransitionEnd(pos, index) {
          if (options.transitionEnd) {
            options.transitionEnd(pos, index);
          }
        }

        function runDragStart(pos, index) {
          if (options.dragStart) {
            options.dragStart(pos, index);
          }
        }

        function runDragEnd(pos, index) {
          if (options.dragEnd) {
            options.dragEnd(pos, index);
          }
        }

        function circle(index) {

          // a simple positive modulo using slides.length
          return (slides.length + (index % slides.length)) % slides.length;
        }

        function getPos() {
          // Fix for the clone issue in the event of 2 slides
          var currentIndex = index;

          if (currentIndex >= length) {
            currentIndex = currentIndex - length;
          }

          return currentIndex;
        }

        function slide(to, slideSpeed) {

          // ensure to is of type 'number'
          to = typeof to !== 'number' ? parseInt(to, 10) : to;

          // do nothing if already on requested slide
          if (index === to) return;

          if (browser.transitions) {

            var direction = Math.abs(index-to) / (index-to); // 1: backward, -1: forward

            // get the actual position of the slide
            if (options.continuous) {
              var natural_direction = direction;
              direction = -slidePos[circle(to)] / width;

              // if going forward but to < index, use to = slides.length + to
              // if going backward but to > index, use to = -slides.length + to
              if (direction !== natural_direction) {
                to = -direction * slides.length + to;
              }

            }

            var diff = Math.abs(index-to) - 1;

            // move all the slides between index and to in the right direction
            while (diff--) {
              move( circle((to > index ? to : index) - diff - 1), width * direction, 0);
            }

            to = circle(to);

            move(index, width * direction, slideSpeed || speed);
            move(to, 0, slideSpeed || speed);

            if (options.continuous) { // we need to get the next in place
              move(circle(to - direction), -(width * direction), 0);
            }

          } else {

            to = circle(to);
            animate(index * -width, to * -width, slideSpeed || speed);
            // no fallback for a circular continuous if the browser does not accept transitions
          }

          index = to;
          offloadFn(function() {
            runCallback(getPos(), slides[index], direction);
          });
        }

        function move(index, dist, speed) {
          translate(index, dist, speed);
          slidePos[index] = dist;
        }

        function translate(index, dist, speed) {

          var slide = slides[index];
          var style = slide && slide.style;

          if (!style) return;

          style.webkitTransitionDuration =
            style.MozTransitionDuration =
            style.msTransitionDuration =
            style.OTransitionDuration =
            style.transitionDuration = speed + 'ms';

          style.webkitTransform =
            style.msTransform =
            style.MozTransform =
            style.OTransform =
            style.transform = 'translateX(' + dist + 'px)';
        }

        function animate(from, to, speed) {

          // if not an animation, just reposition
          if (!speed) {
            element.style[slideDir] = to + 'px';
            return;
          }

          var start = +new Date();

          var timer = setInterval(function() {
            var timeElap = +new Date() - start;

            if (timeElap > speed) {

              element.style[slideDir] = to + 'px';

              if (delay || options.autoRestart) restart();

              runTransitionEnd(getPos(), slides[index]);

              clearInterval(timer);

              return;
            }

            element.style[slideDir] = (( (to - from) * (Math.floor((timeElap / speed) * 100) / 100) ) + from) + 'px';
          }, 4);

        }

        function begin() {
          delay = options.auto || 0;
          if (delay) interval = setTimeout(next, delay);
        }

        function stop() {
          delay = 0;
          clearTimeout(interval);
        }

        function restart() {
          stop();
          begin();
        }

        function disable() {
          stop();
          disabled = true;
        }

        function enable() {
          disabled = false;
          restart();
        }

        function isMouseEvent(e) {
          return /^mouse/.test(e.type);
        }

        function kill() {
          // cancel slideshow
          stop();

          // remove inline styles
          container.style.visibility = '';

          // reset element
          element.style.width = '';
          element.style[slideDir] = '';

          // reset slides
          var pos = slides.length;
          while (pos--) {

            if (browser.transitions) {
              translate(pos, 0, 0);
            }

            var slide = slides[pos];

            // if the slide is tagged as clone, remove it
            if (slide.getAttribute('data-cloned')) {
              var _parent = slide.parentElement;
              _parent.removeChild(slide);
            }

            // remove styles
            slide.style.width = '';
            slide.style[slideDir] = '';

            slide.style.webkitTransitionDuration =
              slide.style.MozTransitionDuration =
              slide.style.msTransitionDuration =
              slide.style.OTransitionDuration =
              slide.style.transitionDuration = '';

            slide.style.webkitTransform =
              slide.style.msTransform =
              slide.style.MozTransform =
              slide.style.OTransform = '';

            // remove custom attributes (?)
            // slide.removeAttribute('data-index');
          }

          // remove all events
          detachEvents();

          // remove throttled function timeout
          throttledSetup.cancel();
        }
      }

      if ( root.jQuery || root.Zepto ) {
        (function($) {
          $.fn.Swipe = function(params) {
            return this.each(function() {
              $(this).data('Swipe', new Swipe($(this)[0], params));
            });
          };
        })( root.jQuery || root.Zepto );
      }

      return Swipe;
    }));
    });

    /* src/routes/Project.svelte generated by Svelte v3.30.0 */
    const file$6 = "src/routes/Project.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[7] = i;
    	return child_ctx;
    }

    // (59:24) {:else}
    function create_else_block_1(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			attr_dev(button, "title", "Previous image");
    			attr_dev(button, "class", "prev svelte-3ikmvd");
    			add_location(button, file$6, 59, 28, 1553);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(
    					button,
    					"click",
    					function () {
    						if (is_function(/*swipeGallery*/ ctx[2].prev)) /*swipeGallery*/ ctx[2].prev.apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(59:24) {:else}",
    		ctx
    	});

    	return block;
    }

    // (55:24) {#if i === 0}
    function create_if_block_1$1(ctx) {
    	let link;
    	let current;

    	link = new Link({
    			props: {
    				to: "/",
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(link.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(link, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const link_changes = {};

    			if (dirty & /*$$scope*/ 256) {
    				link_changes.$$scope = { dirty, ctx };
    			}

    			link.$set(link_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(link, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(55:24) {#if i === 0}",
    		ctx
    	});

    	return block;
    }

    // (56:28) <Link to={'/'}>
    function create_default_slot_1$1(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			attr_dev(button, "title", "Previous project");
    			attr_dev(button, "class", "prev link svelte-3ikmvd");
    			add_location(button, file$6, 56, 32, 1396);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(56:28) <Link to={'/'}>",
    		ctx
    	});

    	return block;
    }

    // (67:24) {:else}
    function create_else_block$1(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			attr_dev(button, "title", "Next image");
    			attr_dev(button, "class", "next svelte-3ikmvd");
    			add_location(button, file$6, 67, 28, 1951);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(
    					button,
    					"click",
    					function () {
    						if (is_function(/*swipeGallery*/ ctx[2].next)) /*swipeGallery*/ ctx[2].next.apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(67:24) {:else}",
    		ctx
    	});

    	return block;
    }

    // (63:24) {#if i + 1 === project.images.length}
    function create_if_block$1(ctx) {
    	let link;
    	let current;

    	link = new Link({
    			props: {
    				to: "/",
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(link.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(link, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const link_changes = {};

    			if (dirty & /*$$scope*/ 256) {
    				link_changes.$$scope = { dirty, ctx };
    			}

    			link.$set(link_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(link, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(63:24) {#if i + 1 === project.images.length}",
    		ctx
    	});

    	return block;
    }

    // (64:28) <Link to={'/'}>
    function create_default_slot$2(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			attr_dev(button, "title", "Next project");
    			attr_dev(button, "class", "next link svelte-3ikmvd");
    			add_location(button, file$6, 64, 32, 1798);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(64:28) <Link to={'/'}>",
    		ctx
    	});

    	return block;
    }

    // (47:16) {#each project.images as image, i}
    function create_each_block$2(ctx) {
    	let figure;
    	let div;
    	let img;
    	let t0;
    	let current_block_type_index;
    	let if_block0;
    	let t1;
    	let current_block_type_index_1;
    	let if_block1;
    	let t2;
    	let figure_title_value;
    	let current;

    	img = new Img({
    			props: {
    				srcset: /*image*/ ctx[5].srcset,
    				alt: /*image*/ ctx[5].alt
    			},
    			$$inline: true
    		});

    	const if_block_creators = [create_if_block_1$1, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*i*/ ctx[7] === 0) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	const if_block_creators_1 = [create_if_block$1, create_else_block$1];
    	const if_blocks_1 = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*i*/ ctx[7] + 1 === /*project*/ ctx[0].images.length) return 0;
    		return 1;
    	}

    	current_block_type_index_1 = select_block_type_1(ctx);
    	if_block1 = if_blocks_1[current_block_type_index_1] = if_block_creators_1[current_block_type_index_1](ctx);

    	const block = {
    		c: function create() {
    			figure = element("figure");
    			div = element("div");
    			create_component(img.$$.fragment);
    			t0 = space();
    			if_block0.c();
    			t1 = space();
    			if_block1.c();
    			t2 = space();
    			attr_dev(div, "class", "square svelte-3ikmvd");
    			add_location(div, file$6, 50, 24, 1153);
    			attr_dev(figure, "title", figure_title_value = /*image*/ ctx[5].alt);
    			attr_dev(figure, "class", "svelte-3ikmvd");
    			add_location(figure, file$6, 48, 20, 1099);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, figure, anchor);
    			append_dev(figure, div);
    			mount_component(img, div, null);
    			append_dev(figure, t0);
    			if_blocks[current_block_type_index].m(figure, null);
    			append_dev(figure, t1);
    			if_blocks_1[current_block_type_index_1].m(figure, null);
    			append_dev(figure, t2);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const img_changes = {};
    			if (dirty & /*project*/ 1) img_changes.srcset = /*image*/ ctx[5].srcset;
    			if (dirty & /*project*/ 1) img_changes.alt = /*image*/ ctx[5].alt;
    			img.$set(img_changes);
    			if_block0.p(ctx, dirty);
    			let previous_block_index_1 = current_block_type_index_1;
    			current_block_type_index_1 = select_block_type_1(ctx);

    			if (current_block_type_index_1 === previous_block_index_1) {
    				if_blocks_1[current_block_type_index_1].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks_1[previous_block_index_1], 1, 1, () => {
    					if_blocks_1[previous_block_index_1] = null;
    				});

    				check_outros();
    				if_block1 = if_blocks_1[current_block_type_index_1];

    				if (!if_block1) {
    					if_block1 = if_blocks_1[current_block_type_index_1] = if_block_creators_1[current_block_type_index_1](ctx);
    					if_block1.c();
    				} else {
    					if_block1.p(ctx, dirty);
    				}

    				transition_in(if_block1, 1);
    				if_block1.m(figure, t2);
    			}

    			if (!current || dirty & /*project*/ 1 && figure_title_value !== (figure_title_value = /*image*/ ctx[5].alt)) {
    				attr_dev(figure, "title", figure_title_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(img.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(img.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(figure);
    			destroy_component(img);
    			if_blocks[current_block_type_index].d();
    			if_blocks_1[current_block_type_index_1].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(47:16) {#each project.images as image, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let article;
    	let header;
    	let h1;
    	let span0;
    	let t0_value = /*project*/ ctx[0].year + "";
    	let t0;
    	let t1;
    	let span1;
    	let t2_value = /*project*/ ctx[0].title + "";
    	let t2;
    	let t3;
    	let span2;
    	let t4_value = /*project*/ ctx[0].images[/*index*/ ctx[3]].alt + "";
    	let t4;
    	let t5;
    	let div0;
    	let span3;
    	let t6_value = /*index*/ ctx[3] + 1 + "";
    	let t6;
    	let t7;
    	let span4;
    	let t8_value = /*project*/ ctx[0].images.length + "";
    	let t8;
    	let t9;
    	let section;
    	let div2;
    	let div1;
    	let current;
    	let each_value = /*project*/ ctx[0].images;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			article = element("article");
    			header = element("header");
    			h1 = element("h1");
    			span0 = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			span1 = element("span");
    			t2 = text(t2_value);
    			t3 = space();
    			span2 = element("span");
    			t4 = text(t4_value);
    			t5 = space();
    			div0 = element("div");
    			span3 = element("span");
    			t6 = text(t6_value);
    			t7 = text("/");
    			span4 = element("span");
    			t8 = text(t8_value);
    			t9 = space();
    			section = element("section");
    			div2 = element("div");
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(span0, "class", "year svelte-3ikmvd");
    			add_location(span0, file$6, 33, 12, 644);
    			attr_dev(span1, "class", "svelte-3ikmvd");
    			add_location(span1, file$6, 34, 12, 697);
    			attr_dev(span2, "class", "svelte-3ikmvd");
    			add_location(span2, file$6, 35, 12, 738);
    			attr_dev(h1, "class", "svelte-3ikmvd");
    			add_location(h1, file$6, 32, 8, 627);
    			attr_dev(span3, "class", "svelte-3ikmvd");
    			add_location(span3, file$6, 38, 12, 833);
    			attr_dev(span4, "class", "svelte-3ikmvd");
    			add_location(span4, file$6, 38, 37, 858);
    			attr_dev(div0, "class", "index svelte-3ikmvd");
    			add_location(div0, file$6, 37, 8, 801);
    			attr_dev(header, "class", "svelte-3ikmvd");
    			add_location(header, file$6, 31, 4, 610);
    			attr_dev(div1, "class", "swipe-wrap svelte-3ikmvd");
    			add_location(div1, file$6, 45, 12, 1002);
    			attr_dev(div2, "class", "swipe svelte-3ikmvd");
    			add_location(div2, file$6, 44, 8, 948);
    			attr_dev(section, "class", "svelte-3ikmvd");
    			add_location(section, file$6, 42, 4, 929);
    			add_location(article, file$6, 29, 0, 595);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);
    			append_dev(article, header);
    			append_dev(header, h1);
    			append_dev(h1, span0);
    			append_dev(span0, t0);
    			append_dev(h1, t1);
    			append_dev(h1, span1);
    			append_dev(span1, t2);
    			append_dev(h1, t3);
    			append_dev(h1, span2);
    			append_dev(span2, t4);
    			append_dev(header, t5);
    			append_dev(header, div0);
    			append_dev(div0, span3);
    			append_dev(span3, t6);
    			append_dev(div0, t7);
    			append_dev(div0, span4);
    			append_dev(span4, t8);
    			append_dev(article, t9);
    			append_dev(article, section);
    			append_dev(section, div2);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			/*div2_binding*/ ctx[4](div2);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*project*/ 1) && t0_value !== (t0_value = /*project*/ ctx[0].year + "")) set_data_dev(t0, t0_value);
    			if ((!current || dirty & /*project*/ 1) && t2_value !== (t2_value = /*project*/ ctx[0].title + "")) set_data_dev(t2, t2_value);
    			if ((!current || dirty & /*project, index*/ 9) && t4_value !== (t4_value = /*project*/ ctx[0].images[/*index*/ ctx[3]].alt + "")) set_data_dev(t4, t4_value);
    			if ((!current || dirty & /*index*/ 8) && t6_value !== (t6_value = /*index*/ ctx[3] + 1 + "")) set_data_dev(t6, t6_value);
    			if ((!current || dirty & /*project*/ 1) && t8_value !== (t8_value = /*project*/ ctx[0].images.length + "")) set_data_dev(t8, t8_value);

    			if (dirty & /*project, swipeGallery*/ 5) {
    				each_value = /*project*/ ctx[0].images;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div1, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    			destroy_each(each_blocks, detaching);
    			/*div2_binding*/ ctx[4](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Project", slots, []);
    	let { project } = $$props;
    	let container;
    	let swipeGallery;
    	let index = parseInt(new URL(document.URL).hash.replace("#", "")) || 0;

    	onMount(() => {
    		$$invalidate(2, swipeGallery = new swipe(container,
    		{
    				draggable: true,
    				continuous: false,
    				startSlide: index,
    				callback(i, element) {
    					$$invalidate(3, index = i);
    				}
    			}));
    	});

    	const writable_props = ["project"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Project> was created with unknown prop '${key}'`);
    	});

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			container = $$value;
    			$$invalidate(1, container);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("project" in $$props) $$invalidate(0, project = $$props.project);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		Link,
    		Swipe: swipe,
    		Img,
    		project,
    		container,
    		swipeGallery,
    		index
    	});

    	$$self.$inject_state = $$props => {
    		if ("project" in $$props) $$invalidate(0, project = $$props.project);
    		if ("container" in $$props) $$invalidate(1, container = $$props.container);
    		if ("swipeGallery" in $$props) $$invalidate(2, swipeGallery = $$props.swipeGallery);
    		if ("index" in $$props) $$invalidate(3, index = $$props.index);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [project, container, swipeGallery, index, div2_binding];
    }

    class Project extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { project: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Project",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*project*/ ctx[0] === undefined && !("project" in props)) {
    			console.warn("<Project> was created without expected prop 'project'");
    		}
    	}

    	get project() {
    		throw new Error("<Project>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set project(value) {
    		throw new Error("<Project>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.30.0 */

    const { console: console_1 } = globals;
    const file$7 = "src/App.svelte";

    // (22:2) <Link to="/">
    function create_default_slot_3(ctx) {
    	let t_value = /*data*/ ctx[0].title + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 1 && t_value !== (t_value = /*data*/ ctx[0].title + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(22:2) <Link to=\\\"/\\\">",
    		ctx
    	});

    	return block;
    }

    // (21:1) <Header>
    function create_default_slot_2(ctx) {
    	let link;
    	let current;

    	link = new Link({
    			props: {
    				to: "/",
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(link.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(link, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const link_changes = {};

    			if (dirty & /*$$scope, data*/ 9) {
    				link_changes.$$scope = { dirty, ctx };
    			}

    			link.$set(link_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(link, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(21:1) <Header>",
    		ctx
    	});

    	return block;
    }

    // (29:2) <Route path="portfolio/:id" let:params>
    function create_default_slot_1$2(ctx) {
    	let project;
    	let current;

    	project = new Project({
    			props: {
    				project: getProject(/*data*/ ctx[0].pages, "portfolio/" + /*params*/ ctx[2].id)
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(project.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(project, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const project_changes = {};
    			if (dirty & /*data, params*/ 5) project_changes.project = getProject(/*data*/ ctx[0].pages, "portfolio/" + /*params*/ ctx[2].id);
    			project.$set(project_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(project.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(project.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(project, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$2.name,
    		type: "slot",
    		source: "(29:2) <Route path=\\\"portfolio/:id\\\" let:params>",
    		ctx
    	});

    	return block;
    }

    // (19:0) <Router url="{url}">
    function create_default_slot$3(ctx) {
    	let header;
    	let t0;
    	let main;
    	let route0;
    	let t1;
    	let route1;
    	let t2;
    	let route2;
    	let t3;
    	let route3;
    	let current;

    	header = new Header({
    			props: {
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route0 = new Route({
    			props: {
    				path: "/",
    				component: Index,
    				data: /*data*/ ctx[0]
    			},
    			$$inline: true
    		});

    	route1 = new Route({
    			props: {
    				path: "info",
    				component: Info,
    				data: /*data*/ ctx[0]
    			},
    			$$inline: true
    		});

    	route2 = new Route({
    			props: {
    				path: "catalogue",
    				component: Catalogue,
    				data: /*data*/ ctx[0]
    			},
    			$$inline: true
    		});

    	route3 = new Route({
    			props: {
    				path: "portfolio/:id",
    				$$slots: {
    					default: [
    						create_default_slot_1$2,
    						({ params }) => ({ 2: params }),
    						({ params }) => params ? 4 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t0 = space();
    			main = element("main");
    			create_component(route0.$$.fragment);
    			t1 = space();
    			create_component(route1.$$.fragment);
    			t2 = space();
    			create_component(route2.$$.fragment);
    			t3 = space();
    			create_component(route3.$$.fragment);
    			add_location(main, file$7, 24, 1, 513);
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			mount_component(route0, main, null);
    			append_dev(main, t1);
    			mount_component(route1, main, null);
    			append_dev(main, t2);
    			mount_component(route2, main, null);
    			append_dev(main, t3);
    			mount_component(route3, main, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const header_changes = {};

    			if (dirty & /*$$scope, data*/ 9) {
    				header_changes.$$scope = { dirty, ctx };
    			}

    			header.$set(header_changes);
    			const route0_changes = {};
    			if (dirty & /*data*/ 1) route0_changes.data = /*data*/ ctx[0];
    			route0.$set(route0_changes);
    			const route1_changes = {};
    			if (dirty & /*data*/ 1) route1_changes.data = /*data*/ ctx[0];
    			route1.$set(route1_changes);
    			const route2_changes = {};
    			if (dirty & /*data*/ 1) route2_changes.data = /*data*/ ctx[0];
    			route2.$set(route2_changes);
    			const route3_changes = {};

    			if (dirty & /*$$scope, data, params*/ 13) {
    				route3_changes.$$scope = { dirty, ctx };
    			}

    			route3.$set(route3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(route0.$$.fragment, local);
    			transition_in(route1.$$.fragment, local);
    			transition_in(route2.$$.fragment, local);
    			transition_in(route3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			transition_out(route2.$$.fragment, local);
    			transition_out(route3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(route0);
    			destroy_component(route1);
    			destroy_component(route2);
    			destroy_component(route3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(19:0) <Router url=\\\"{url}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let router;
    	let current;

    	router = new Router({
    			props: {
    				url: /*url*/ ctx[1],
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(router.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(router, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const router_changes = {};
    			if (dirty & /*url*/ 2) router_changes.url = /*url*/ ctx[1];

    			if (dirty & /*$$scope, data*/ 9) {
    				router_changes.$$scope = { dirty, ctx };
    			}

    			router.$set(router_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(router, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let { data } = $$props;
    	console.log(data);
    	let { url = "" } = $$props;
    	const writable_props = ["data", "url"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    		if ("url" in $$props) $$invalidate(1, url = $$props.url);
    	};

    	$$self.$capture_state = () => ({
    		Router,
    		Link,
    		Route,
    		getProject,
    		Header,
    		Index,
    		Info,
    		Catalogue,
    		Project,
    		data,
    		url
    	});

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    		if ("url" in $$props) $$invalidate(1, url = $$props.url);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data, url];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { data: 0, url: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[0] === undefined && !("data" in props)) {
    			console_1.warn("<App> was created without expected prop 'data'");
    		}
    	}

    	get data() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var lazysizes = createCommonjsModule(function (module) {
    (function(window, factory) {
    	var lazySizes = factory(window, window.document, Date);
    	window.lazySizes = lazySizes;
    	if( module.exports){
    		module.exports = lazySizes;
    	}
    }(typeof window != 'undefined' ?
          window : {}, function l(window, document, Date) { // Pass in the windoe Date function also for SSR because the Date class can be lost
    	/*jshint eqnull:true */

    	var lazysizes, lazySizesCfg;

    	(function(){
    		var prop;

    		var lazySizesDefaults = {
    			lazyClass: 'lazyload',
    			loadedClass: 'lazyloaded',
    			loadingClass: 'lazyloading',
    			preloadClass: 'lazypreload',
    			errorClass: 'lazyerror',
    			//strictClass: 'lazystrict',
    			autosizesClass: 'lazyautosizes',
    			srcAttr: 'data-src',
    			srcsetAttr: 'data-srcset',
    			sizesAttr: 'data-sizes',
    			//preloadAfterLoad: false,
    			minSize: 40,
    			customMedia: {},
    			init: true,
    			expFactor: 1.5,
    			hFac: 0.8,
    			loadMode: 2,
    			loadHidden: true,
    			ricTimeout: 0,
    			throttleDelay: 125,
    		};

    		lazySizesCfg = window.lazySizesConfig || window.lazysizesConfig || {};

    		for(prop in lazySizesDefaults){
    			if(!(prop in lazySizesCfg)){
    				lazySizesCfg[prop] = lazySizesDefaults[prop];
    			}
    		}
    	})();

    	if (!document || !document.getElementsByClassName) {
    		return {
    			init: function () {},
    			cfg: lazySizesCfg,
    			noSupport: true,
    		};
    	}

    	var docElem = document.documentElement;

    	var supportPicture = window.HTMLPictureElement;

    	var _addEventListener = 'addEventListener';

    	var _getAttribute = 'getAttribute';

    	/**
    	 * Update to bind to window because 'this' becomes null during SSR
    	 * builds.
    	 */
    	var addEventListener = window[_addEventListener].bind(window);

    	var setTimeout = window.setTimeout;

    	var requestAnimationFrame = window.requestAnimationFrame || setTimeout;

    	var requestIdleCallback = window.requestIdleCallback;

    	var regPicture = /^picture$/i;

    	var loadEvents = ['load', 'error', 'lazyincluded', '_lazyloaded'];

    	var regClassCache = {};

    	var forEach = Array.prototype.forEach;

    	var hasClass = function(ele, cls) {
    		if(!regClassCache[cls]){
    			regClassCache[cls] = new RegExp('(\\s|^)'+cls+'(\\s|$)');
    		}
    		return regClassCache[cls].test(ele[_getAttribute]('class') || '') && regClassCache[cls];
    	};

    	var addClass = function(ele, cls) {
    		if (!hasClass(ele, cls)){
    			ele.setAttribute('class', (ele[_getAttribute]('class') || '').trim() + ' ' + cls);
    		}
    	};

    	var removeClass = function(ele, cls) {
    		var reg;
    		if ((reg = hasClass(ele,cls))) {
    			ele.setAttribute('class', (ele[_getAttribute]('class') || '').replace(reg, ' '));
    		}
    	};

    	var addRemoveLoadEvents = function(dom, fn, add){
    		var action = add ? _addEventListener : 'removeEventListener';
    		if(add){
    			addRemoveLoadEvents(dom, fn);
    		}
    		loadEvents.forEach(function(evt){
    			dom[action](evt, fn);
    		});
    	};

    	var triggerEvent = function(elem, name, detail, noBubbles, noCancelable){
    		var event = document.createEvent('Event');

    		if(!detail){
    			detail = {};
    		}

    		detail.instance = lazysizes;

    		event.initEvent(name, !noBubbles, !noCancelable);

    		event.detail = detail;

    		elem.dispatchEvent(event);
    		return event;
    	};

    	var updatePolyfill = function (el, full){
    		var polyfill;
    		if( !supportPicture && ( polyfill = (window.picturefill || lazySizesCfg.pf) ) ){
    			if(full && full.src && !el[_getAttribute]('srcset')){
    				el.setAttribute('srcset', full.src);
    			}
    			polyfill({reevaluate: true, elements: [el]});
    		} else if(full && full.src){
    			el.src = full.src;
    		}
    	};

    	var getCSS = function (elem, style){
    		return (getComputedStyle(elem, null) || {})[style];
    	};

    	var getWidth = function(elem, parent, width){
    		width = width || elem.offsetWidth;

    		while(width < lazySizesCfg.minSize && parent && !elem._lazysizesWidth){
    			width =  parent.offsetWidth;
    			parent = parent.parentNode;
    		}

    		return width;
    	};

    	var rAF = (function(){
    		var running, waiting;
    		var firstFns = [];
    		var secondFns = [];
    		var fns = firstFns;

    		var run = function(){
    			var runFns = fns;

    			fns = firstFns.length ? secondFns : firstFns;

    			running = true;
    			waiting = false;

    			while(runFns.length){
    				runFns.shift()();
    			}

    			running = false;
    		};

    		var rafBatch = function(fn, queue){
    			if(running && !queue){
    				fn.apply(this, arguments);
    			} else {
    				fns.push(fn);

    				if(!waiting){
    					waiting = true;
    					(document.hidden ? setTimeout : requestAnimationFrame)(run);
    				}
    			}
    		};

    		rafBatch._lsFlush = run;

    		return rafBatch;
    	})();

    	var rAFIt = function(fn, simple){
    		return simple ?
    			function() {
    				rAF(fn);
    			} :
    			function(){
    				var that = this;
    				var args = arguments;
    				rAF(function(){
    					fn.apply(that, args);
    				});
    			}
    		;
    	};

    	var throttle = function(fn){
    		var running;
    		var lastTime = 0;
    		var gDelay = lazySizesCfg.throttleDelay;
    		var rICTimeout = lazySizesCfg.ricTimeout;
    		var run = function(){
    			running = false;
    			lastTime = Date.now();
    			fn();
    		};
    		var idleCallback = requestIdleCallback && rICTimeout > 49 ?
    			function(){
    				requestIdleCallback(run, {timeout: rICTimeout});

    				if(rICTimeout !== lazySizesCfg.ricTimeout){
    					rICTimeout = lazySizesCfg.ricTimeout;
    				}
    			} :
    			rAFIt(function(){
    				setTimeout(run);
    			}, true)
    		;

    		return function(isPriority){
    			var delay;

    			if((isPriority = isPriority === true)){
    				rICTimeout = 33;
    			}

    			if(running){
    				return;
    			}

    			running =  true;

    			delay = gDelay - (Date.now() - lastTime);

    			if(delay < 0){
    				delay = 0;
    			}

    			if(isPriority || delay < 9){
    				idleCallback();
    			} else {
    				setTimeout(idleCallback, delay);
    			}
    		};
    	};

    	//based on http://modernjavascript.blogspot.de/2013/08/building-better-debounce.html
    	var debounce = function(func) {
    		var timeout, timestamp;
    		var wait = 99;
    		var run = function(){
    			timeout = null;
    			func();
    		};
    		var later = function() {
    			var last = Date.now() - timestamp;

    			if (last < wait) {
    				setTimeout(later, wait - last);
    			} else {
    				(requestIdleCallback || run)(run);
    			}
    		};

    		return function() {
    			timestamp = Date.now();

    			if (!timeout) {
    				timeout = setTimeout(later, wait);
    			}
    		};
    	};

    	var loader = (function(){
    		var preloadElems, isCompleted, resetPreloadingTimer, loadMode, started;

    		var eLvW, elvH, eLtop, eLleft, eLright, eLbottom, isBodyHidden;

    		var regImg = /^img$/i;
    		var regIframe = /^iframe$/i;

    		var supportScroll = ('onscroll' in window) && !(/(gle|ing)bot/.test(navigator.userAgent));

    		var shrinkExpand = 0;
    		var currentExpand = 0;

    		var isLoading = 0;
    		var lowRuns = -1;

    		var resetPreloading = function(e){
    			isLoading--;
    			if(!e || isLoading < 0 || !e.target){
    				isLoading = 0;
    			}
    		};

    		var isVisible = function (elem) {
    			if (isBodyHidden == null) {
    				isBodyHidden = getCSS(document.body, 'visibility') == 'hidden';
    			}

    			return isBodyHidden || !(getCSS(elem.parentNode, 'visibility') == 'hidden' && getCSS(elem, 'visibility') == 'hidden');
    		};

    		var isNestedVisible = function(elem, elemExpand){
    			var outerRect;
    			var parent = elem;
    			var visible = isVisible(elem);

    			eLtop -= elemExpand;
    			eLbottom += elemExpand;
    			eLleft -= elemExpand;
    			eLright += elemExpand;

    			while(visible && (parent = parent.offsetParent) && parent != document.body && parent != docElem){
    				visible = ((getCSS(parent, 'opacity') || 1) > 0);

    				if(visible && getCSS(parent, 'overflow') != 'visible'){
    					outerRect = parent.getBoundingClientRect();
    					visible = eLright > outerRect.left &&
    						eLleft < outerRect.right &&
    						eLbottom > outerRect.top - 1 &&
    						eLtop < outerRect.bottom + 1
    					;
    				}
    			}

    			return visible;
    		};

    		var checkElements = function() {
    			var eLlen, i, rect, autoLoadElem, loadedSomething, elemExpand, elemNegativeExpand, elemExpandVal,
    				beforeExpandVal, defaultExpand, preloadExpand, hFac;
    			var lazyloadElems = lazysizes.elements;

    			if((loadMode = lazySizesCfg.loadMode) && isLoading < 8 && (eLlen = lazyloadElems.length)){

    				i = 0;

    				lowRuns++;

    				for(; i < eLlen; i++){

    					if(!lazyloadElems[i] || lazyloadElems[i]._lazyRace){continue;}

    					if(!supportScroll || (lazysizes.prematureUnveil && lazysizes.prematureUnveil(lazyloadElems[i]))){unveilElement(lazyloadElems[i]);continue;}

    					if(!(elemExpandVal = lazyloadElems[i][_getAttribute]('data-expand')) || !(elemExpand = elemExpandVal * 1)){
    						elemExpand = currentExpand;
    					}

    					if (!defaultExpand) {
    						defaultExpand = (!lazySizesCfg.expand || lazySizesCfg.expand < 1) ?
    							docElem.clientHeight > 500 && docElem.clientWidth > 500 ? 500 : 370 :
    							lazySizesCfg.expand;

    						lazysizes._defEx = defaultExpand;

    						preloadExpand = defaultExpand * lazySizesCfg.expFactor;
    						hFac = lazySizesCfg.hFac;
    						isBodyHidden = null;

    						if(currentExpand < preloadExpand && isLoading < 1 && lowRuns > 2 && loadMode > 2 && !document.hidden){
    							currentExpand = preloadExpand;
    							lowRuns = 0;
    						} else if(loadMode > 1 && lowRuns > 1 && isLoading < 6){
    							currentExpand = defaultExpand;
    						} else {
    							currentExpand = shrinkExpand;
    						}
    					}

    					if(beforeExpandVal !== elemExpand){
    						eLvW = innerWidth + (elemExpand * hFac);
    						elvH = innerHeight + elemExpand;
    						elemNegativeExpand = elemExpand * -1;
    						beforeExpandVal = elemExpand;
    					}

    					rect = lazyloadElems[i].getBoundingClientRect();

    					if ((eLbottom = rect.bottom) >= elemNegativeExpand &&
    						(eLtop = rect.top) <= elvH &&
    						(eLright = rect.right) >= elemNegativeExpand * hFac &&
    						(eLleft = rect.left) <= eLvW &&
    						(eLbottom || eLright || eLleft || eLtop) &&
    						(lazySizesCfg.loadHidden || isVisible(lazyloadElems[i])) &&
    						((isCompleted && isLoading < 3 && !elemExpandVal && (loadMode < 3 || lowRuns < 4)) || isNestedVisible(lazyloadElems[i], elemExpand))){
    						unveilElement(lazyloadElems[i]);
    						loadedSomething = true;
    						if(isLoading > 9){break;}
    					} else if(!loadedSomething && isCompleted && !autoLoadElem &&
    						isLoading < 4 && lowRuns < 4 && loadMode > 2 &&
    						(preloadElems[0] || lazySizesCfg.preloadAfterLoad) &&
    						(preloadElems[0] || (!elemExpandVal && ((eLbottom || eLright || eLleft || eLtop) || lazyloadElems[i][_getAttribute](lazySizesCfg.sizesAttr) != 'auto')))){
    						autoLoadElem = preloadElems[0] || lazyloadElems[i];
    					}
    				}

    				if(autoLoadElem && !loadedSomething){
    					unveilElement(autoLoadElem);
    				}
    			}
    		};

    		var throttledCheckElements = throttle(checkElements);

    		var switchLoadingClass = function(e){
    			var elem = e.target;

    			if (elem._lazyCache) {
    				delete elem._lazyCache;
    				return;
    			}

    			resetPreloading(e);
    			addClass(elem, lazySizesCfg.loadedClass);
    			removeClass(elem, lazySizesCfg.loadingClass);
    			addRemoveLoadEvents(elem, rafSwitchLoadingClass);
    			triggerEvent(elem, 'lazyloaded');
    		};
    		var rafedSwitchLoadingClass = rAFIt(switchLoadingClass);
    		var rafSwitchLoadingClass = function(e){
    			rafedSwitchLoadingClass({target: e.target});
    		};

    		var changeIframeSrc = function(elem, src){
    			try {
    				elem.contentWindow.location.replace(src);
    			} catch(e){
    				elem.src = src;
    			}
    		};

    		var handleSources = function(source){
    			var customMedia;

    			var sourceSrcset = source[_getAttribute](lazySizesCfg.srcsetAttr);

    			if( (customMedia = lazySizesCfg.customMedia[source[_getAttribute]('data-media') || source[_getAttribute]('media')]) ){
    				source.setAttribute('media', customMedia);
    			}

    			if(sourceSrcset){
    				source.setAttribute('srcset', sourceSrcset);
    			}
    		};

    		var lazyUnveil = rAFIt(function (elem, detail, isAuto, sizes, isImg){
    			var src, srcset, parent, isPicture, event, firesLoad;

    			if(!(event = triggerEvent(elem, 'lazybeforeunveil', detail)).defaultPrevented){

    				if(sizes){
    					if(isAuto){
    						addClass(elem, lazySizesCfg.autosizesClass);
    					} else {
    						elem.setAttribute('sizes', sizes);
    					}
    				}

    				srcset = elem[_getAttribute](lazySizesCfg.srcsetAttr);
    				src = elem[_getAttribute](lazySizesCfg.srcAttr);

    				if(isImg) {
    					parent = elem.parentNode;
    					isPicture = parent && regPicture.test(parent.nodeName || '');
    				}

    				firesLoad = detail.firesLoad || (('src' in elem) && (srcset || src || isPicture));

    				event = {target: elem};

    				addClass(elem, lazySizesCfg.loadingClass);

    				if(firesLoad){
    					clearTimeout(resetPreloadingTimer);
    					resetPreloadingTimer = setTimeout(resetPreloading, 2500);
    					addRemoveLoadEvents(elem, rafSwitchLoadingClass, true);
    				}

    				if(isPicture){
    					forEach.call(parent.getElementsByTagName('source'), handleSources);
    				}

    				if(srcset){
    					elem.setAttribute('srcset', srcset);
    				} else if(src && !isPicture){
    					if(regIframe.test(elem.nodeName)){
    						changeIframeSrc(elem, src);
    					} else {
    						elem.src = src;
    					}
    				}

    				if(isImg && (srcset || isPicture)){
    					updatePolyfill(elem, {src: src});
    				}
    			}

    			if(elem._lazyRace){
    				delete elem._lazyRace;
    			}
    			removeClass(elem, lazySizesCfg.lazyClass);

    			rAF(function(){
    				// Part of this can be removed as soon as this fix is older: https://bugs.chromium.org/p/chromium/issues/detail?id=7731 (2015)
    				var isLoaded = elem.complete && elem.naturalWidth > 1;

    				if( !firesLoad || isLoaded){
    					if (isLoaded) {
    						addClass(elem, 'ls-is-cached');
    					}
    					switchLoadingClass(event);
    					elem._lazyCache = true;
    					setTimeout(function(){
    						if ('_lazyCache' in elem) {
    							delete elem._lazyCache;
    						}
    					}, 9);
    				}
    				if (elem.loading == 'lazy') {
    					isLoading--;
    				}
    			}, true);
    		});

    		var unveilElement = function (elem){
    			if (elem._lazyRace) {return;}
    			var detail;

    			var isImg = regImg.test(elem.nodeName);

    			//allow using sizes="auto", but don't use. it's invalid. Use data-sizes="auto" or a valid value for sizes instead (i.e.: sizes="80vw")
    			var sizes = isImg && (elem[_getAttribute](lazySizesCfg.sizesAttr) || elem[_getAttribute]('sizes'));
    			var isAuto = sizes == 'auto';

    			if( (isAuto || !isCompleted) && isImg && (elem[_getAttribute]('src') || elem.srcset) && !elem.complete && !hasClass(elem, lazySizesCfg.errorClass) && hasClass(elem, lazySizesCfg.lazyClass)){return;}

    			detail = triggerEvent(elem, 'lazyunveilread').detail;

    			if(isAuto){
    				 autoSizer.updateElem(elem, true, elem.offsetWidth);
    			}

    			elem._lazyRace = true;
    			isLoading++;

    			lazyUnveil(elem, detail, isAuto, sizes, isImg);
    		};

    		var afterScroll = debounce(function(){
    			lazySizesCfg.loadMode = 3;
    			throttledCheckElements();
    		});

    		var altLoadmodeScrollListner = function(){
    			if(lazySizesCfg.loadMode == 3){
    				lazySizesCfg.loadMode = 2;
    			}
    			afterScroll();
    		};

    		var onload = function(){
    			if(isCompleted){return;}
    			if(Date.now() - started < 999){
    				setTimeout(onload, 999);
    				return;
    			}


    			isCompleted = true;

    			lazySizesCfg.loadMode = 3;

    			throttledCheckElements();

    			addEventListener('scroll', altLoadmodeScrollListner, true);
    		};

    		return {
    			_: function(){
    				started = Date.now();

    				lazysizes.elements = document.getElementsByClassName(lazySizesCfg.lazyClass);
    				preloadElems = document.getElementsByClassName(lazySizesCfg.lazyClass + ' ' + lazySizesCfg.preloadClass);

    				addEventListener('scroll', throttledCheckElements, true);

    				addEventListener('resize', throttledCheckElements, true);

    				addEventListener('pageshow', function (e) {
    					if (e.persisted) {
    						var loadingElements = document.querySelectorAll('.' + lazySizesCfg.loadingClass);

    						if (loadingElements.length && loadingElements.forEach) {
    							requestAnimationFrame(function () {
    								loadingElements.forEach( function (img) {
    									if (img.complete) {
    										unveilElement(img);
    									}
    								});
    							});
    						}
    					}
    				});

    				if(window.MutationObserver){
    					new MutationObserver( throttledCheckElements ).observe( docElem, {childList: true, subtree: true, attributes: true} );
    				} else {
    					docElem[_addEventListener]('DOMNodeInserted', throttledCheckElements, true);
    					docElem[_addEventListener]('DOMAttrModified', throttledCheckElements, true);
    					setInterval(throttledCheckElements, 999);
    				}

    				addEventListener('hashchange', throttledCheckElements, true);

    				//, 'fullscreenchange'
    				['focus', 'mouseover', 'click', 'load', 'transitionend', 'animationend'].forEach(function(name){
    					document[_addEventListener](name, throttledCheckElements, true);
    				});

    				if((/d$|^c/.test(document.readyState))){
    					onload();
    				} else {
    					addEventListener('load', onload);
    					document[_addEventListener]('DOMContentLoaded', throttledCheckElements);
    					setTimeout(onload, 20000);
    				}

    				if(lazysizes.elements.length){
    					checkElements();
    					rAF._lsFlush();
    				} else {
    					throttledCheckElements();
    				}
    			},
    			checkElems: throttledCheckElements,
    			unveil: unveilElement,
    			_aLSL: altLoadmodeScrollListner,
    		};
    	})();


    	var autoSizer = (function(){
    		var autosizesElems;

    		var sizeElement = rAFIt(function(elem, parent, event, width){
    			var sources, i, len;
    			elem._lazysizesWidth = width;
    			width += 'px';

    			elem.setAttribute('sizes', width);

    			if(regPicture.test(parent.nodeName || '')){
    				sources = parent.getElementsByTagName('source');
    				for(i = 0, len = sources.length; i < len; i++){
    					sources[i].setAttribute('sizes', width);
    				}
    			}

    			if(!event.detail.dataAttr){
    				updatePolyfill(elem, event.detail);
    			}
    		});
    		var getSizeElement = function (elem, dataAttr, width){
    			var event;
    			var parent = elem.parentNode;

    			if(parent){
    				width = getWidth(elem, parent, width);
    				event = triggerEvent(elem, 'lazybeforesizes', {width: width, dataAttr: !!dataAttr});

    				if(!event.defaultPrevented){
    					width = event.detail.width;

    					if(width && width !== elem._lazysizesWidth){
    						sizeElement(elem, parent, event, width);
    					}
    				}
    			}
    		};

    		var updateElementsSizes = function(){
    			var i;
    			var len = autosizesElems.length;
    			if(len){
    				i = 0;

    				for(; i < len; i++){
    					getSizeElement(autosizesElems[i]);
    				}
    			}
    		};

    		var debouncedUpdateElementsSizes = debounce(updateElementsSizes);

    		return {
    			_: function(){
    				autosizesElems = document.getElementsByClassName(lazySizesCfg.autosizesClass);
    				addEventListener('resize', debouncedUpdateElementsSizes);
    			},
    			checkElems: debouncedUpdateElementsSizes,
    			updateElem: getSizeElement
    		};
    	})();

    	var init = function(){
    		if(!init.i && document.getElementsByClassName){
    			init.i = true;
    			autoSizer._();
    			loader._();
    		}
    	};

    	setTimeout(function(){
    		if(lazySizesCfg.init){
    			init();
    		}
    	});

    	lazysizes = {
    		cfg: lazySizesCfg,
    		autoSizer: autoSizer,
    		loader: loader,
    		init: init,
    		uP: updatePolyfill,
    		aC: addClass,
    		rC: removeClass,
    		hC: hasClass,
    		fire: triggerEvent,
    		gW: getWidth,
    		rAF: rAF,
    	};

    	return lazysizes;
    }
    ));
    });

    const app = new App({
    	target: document.body,
    	props: {
    		data: window.pageData
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
