
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
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

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
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
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
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
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
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

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
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
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
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
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
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
    /**
     * Base class for Svelte components. Used when dev=false.
     */
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.32.3' }, detail)));
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
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
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

    const page = writable("home");
    const mediaQuery = writable("desktop");

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }

    /* src\pages\components\home\Introduction.svelte generated by Svelte v3.32.3 */
    const file = "src\\pages\\components\\home\\Introduction.svelte";

    // (22:2) {#if $mediaQuery === "desktop"}
    function create_if_block_3(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "column");
    			add_location(div, file, 22, 4, 680);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(22:2) {#if $mediaQuery === \\\"desktop\\\"}",
    		ctx
    	});

    	return block;
    }

    // (28:4) {#if (isVisible && $mediaQuery === "desktop")}
    function create_if_block_2(ctx) {
    	let br0;
    	let t0;
    	let br1;
    	let t1;
    	let h5;
    	let t2;
    	let h5_transition;
    	let current;

    	const block = {
    		c: function create() {
    			br0 = element("br");
    			t0 = space();
    			br1 = element("br");
    			t1 = space();
    			h5 = element("h5");
    			t2 = text(/*descText*/ ctx[2]);
    			add_location(br0, file, 28, 6, 903);
    			add_location(br1, file, 29, 6, 917);
    			attr_dev(h5, "class", "is-size-5");
    			add_location(h5, file, 30, 6, 931);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, br0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, h5, anchor);
    			append_dev(h5, t2);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*descText*/ 4) set_data_dev(t2, /*descText*/ ctx[2]);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!h5_transition) h5_transition = create_bidirectional_transition(h5, fade, { duration: 100 }, true);
    				h5_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!h5_transition) h5_transition = create_bidirectional_transition(h5, fade, { duration: 100 }, false);
    			h5_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(h5);
    			if (detaching && h5_transition) h5_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(28:4) {#if (isVisible && $mediaQuery === \\\"desktop\\\")}",
    		ctx
    	});

    	return block;
    }

    // (55:6) {#if $mediaQuery !== "desktop"}
    function create_if_block_1(ctx) {
    	let h5;
    	let t;

    	const block = {
    		c: function create() {
    			h5 = element("h5");
    			t = text(/*descText*/ ctx[2]);
    			attr_dev(h5, "class", "is-size-5 mt-4");
    			add_location(h5, file, 55, 6, 1657);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h5, anchor);
    			append_dev(h5, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*descText*/ 4) set_data_dev(t, /*descText*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(55:6) {#if $mediaQuery !== \\\"desktop\\\"}",
    		ctx
    	});

    	return block;
    }

    // (60:2) {#if $mediaQuery === "desktop"}
    function create_if_block(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "column");
    			add_location(div, file, 60, 4, 1778);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(60:2) {#if $mediaQuery === \\\"desktop\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div2;
    	let t0;
    	let div0;
    	let h3;
    	let t2;
    	let h1;
    	let t4;
    	let t5;
    	let div1;
    	let figure;
    	let img;
    	let img_src_value;
    	let t6;
    	let t7;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*$mediaQuery*/ ctx[3] === "desktop" && create_if_block_3(ctx);
    	let if_block1 = /*isVisible*/ ctx[0] && /*$mediaQuery*/ ctx[3] === "desktop" && create_if_block_2(ctx);
    	let if_block2 = /*$mediaQuery*/ ctx[3] !== "desktop" && create_if_block_1(ctx);
    	let if_block3 = /*$mediaQuery*/ ctx[3] === "desktop" && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div0 = element("div");
    			h3 = element("h3");
    			h3.textContent = "Hi! I'm";
    			t2 = space();
    			h1 = element("h1");
    			h1.textContent = "David Pescariu";
    			t4 = space();
    			if (if_block1) if_block1.c();
    			t5 = space();
    			div1 = element("div");
    			figure = element("figure");
    			img = element("img");
    			t6 = space();
    			if (if_block2) if_block2.c();
    			t7 = space();
    			if (if_block3) if_block3.c();
    			attr_dev(h3, "class", "is-size-3 mt-5 mb-0");
    			add_location(h3, file, 25, 4, 741);
    			attr_dev(h1, "class", "title is-size-1 my-0");
    			add_location(h1, file, 26, 4, 791);
    			attr_dev(div0, "class", "column");
    			add_location(div0, file, 24, 2, 715);
    			attr_dev(img, "class", "is-rounded svelte-1px73g6");
    			if (img.src !== (img_src_value = "assets/profile.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Profile");
    			add_location(img, file, 35, 6, 1103);
    			attr_dev(figure, "class", "image");
    			add_location(figure, file, 34, 4, 1073);
    			attr_dev(div1, "class", "column is-narrow-desktop");
    			add_location(div1, file, 33, 2, 1029);
    			attr_dev(div2, "class", "columns");
    			add_location(div2, file, 20, 0, 618);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			if (if_block0) if_block0.m(div2, null);
    			append_dev(div2, t0);
    			append_dev(div2, div0);
    			append_dev(div0, h3);
    			append_dev(div0, t2);
    			append_dev(div0, h1);
    			append_dev(div0, t4);
    			if (if_block1) if_block1.m(div0, null);
    			append_dev(div2, t5);
    			append_dev(div2, div1);
    			append_dev(div1, figure);
    			append_dev(figure, img);
    			append_dev(figure, t6);
    			if (if_block2) if_block2.m(figure, null);
    			append_dev(div2, t7);
    			if (if_block3) if_block3.m(div2, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(img, "mouseenter", /*mouseenter_handler*/ ctx[5], false, false, false),
    					listen_dev(img, "mouseout", /*mouseout_handler*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$mediaQuery*/ ctx[3] === "desktop") {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_3(ctx);
    					if_block0.c();
    					if_block0.m(div2, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*isVisible*/ ctx[0] && /*$mediaQuery*/ ctx[3] === "desktop") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*isVisible, $mediaQuery*/ 9) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div0, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*$mediaQuery*/ ctx[3] !== "desktop") {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_1(ctx);
    					if_block2.c();
    					if_block2.m(figure, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*$mediaQuery*/ ctx[3] === "desktop") {
    				if (if_block3) ; else {
    					if_block3 = create_if_block(ctx);
    					if_block3.c();
    					if_block3.m(div2, null);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			mounted = false;
    			run_all(dispose);
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

    function getRandomColor() {
    	let color = randomColor({ luminosity: "dark" });
    	document.documentElement.style.setProperty("--imageShadowColor", `${color}cc`);
    }

    function instance($$self, $$props, $$invalidate) {
    	let $mediaQuery;
    	validate_store(mediaQuery, "mediaQuery");
    	component_subscribe($$self, mediaQuery, $$value => $$invalidate(3, $mediaQuery = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Introduction", slots, []);
    	let isVisible = true;
    	let hoverCounter = 0;
    	let descText = "Student & Developer from Romania";

    	if ($mediaQuery === "desktop") {
    		document.getElementsByTagName("html")[0].classList.add("is-clipped");
    	}

    	function fadeInOut() {
    		$$invalidate(0, isVisible = false);

    		setTimeout(
    			() => {
    				$$invalidate(0, isVisible = true);
    			},
    			200
    		);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Introduction> was created with unknown prop '${key}'`);
    	});

    	const mouseenter_handler = () => {
    		getRandomColor();
    		fadeInOut();
    		$$invalidate(1, hoverCounter++, hoverCounter);
    		$$invalidate(2, descText = "Handsome lad eh?");
    	};

    	const mouseout_handler = () => {
    		fadeInOut();

    		if (hoverCounter % 5 === 0) {
    			$$invalidate(2, descText = "Having fun? :)");
    		} else {
    			$$invalidate(2, descText = "Student & Developer from Romania");
    		}
    	};

    	$$self.$capture_state = () => ({
    		mediaQuery,
    		fade,
    		isVisible,
    		hoverCounter,
    		descText,
    		fadeInOut,
    		getRandomColor,
    		$mediaQuery
    	});

    	$$self.$inject_state = $$props => {
    		if ("isVisible" in $$props) $$invalidate(0, isVisible = $$props.isVisible);
    		if ("hoverCounter" in $$props) $$invalidate(1, hoverCounter = $$props.hoverCounter);
    		if ("descText" in $$props) $$invalidate(2, descText = $$props.descText);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		isVisible,
    		hoverCounter,
    		descText,
    		$mediaQuery,
    		fadeInOut,
    		mouseenter_handler,
    		mouseout_handler
    	];
    }

    class Introduction extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Introduction",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src\pages\components\home\Buttons.svelte generated by Svelte v3.32.3 */
    const file$1 = "src\\pages\\components\\home\\Buttons.svelte";

    // (9:2) {#if $mediaQuery === "desktop"}
    function create_if_block_1$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "column");
    			add_location(div, file$1, 9, 4, 311);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(9:2) {#if $mediaQuery === \\\"desktop\\\"}",
    		ctx
    	});

    	return block;
    }

    // (85:2) {#if $mediaQuery === "desktop"}
    function create_if_block$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "column");
    			add_location(div, file$1, 85, 4, 4246);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(85:2) {#if $mediaQuery === \\\"desktop\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div9;
    	let t0;
    	let div2;
    	let a0;
    	let div0;
    	let svg0;
    	let path0;
    	let t1;
    	let div1;
    	let h50;
    	let t3;
    	let p0;
    	let t5;
    	let div5;
    	let a1;
    	let div3;
    	let svg1;
    	let path1;
    	let t6;
    	let div4;
    	let h51;
    	let t8;
    	let p1;
    	let t10;
    	let div8;
    	let a2;
    	let div6;
    	let svg2;
    	let path2;
    	let t11;
    	let div7;
    	let h52;
    	let t13;
    	let p2;
    	let t15;
    	let mounted;
    	let dispose;
    	let if_block0 = /*$mediaQuery*/ ctx[0] === "desktop" && create_if_block_1$1(ctx);
    	let if_block1 = /*$mediaQuery*/ ctx[0] === "desktop" && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div9 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div2 = element("div");
    			a0 = element("a");
    			div0 = element("div");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t1 = space();
    			div1 = element("div");
    			h50 = element("h5");
    			h50.textContent = "About Me";
    			t3 = space();
    			p0 = element("p");
    			p0.textContent = "Who I am";
    			t5 = space();
    			div5 = element("div");
    			a1 = element("a");
    			div3 = element("div");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t6 = space();
    			div4 = element("div");
    			h51 = element("h5");
    			h51.textContent = "My Work";
    			t8 = space();
    			p1 = element("p");
    			p1.textContent = "Projects & Experience";
    			t10 = space();
    			div8 = element("div");
    			a2 = element("a");
    			div6 = element("div");
    			svg2 = svg_element("svg");
    			path2 = svg_element("path");
    			t11 = space();
    			div7 = element("div");
    			h52 = element("h5");
    			h52.textContent = "Contact Me";
    			t13 = space();
    			p2 = element("p");
    			p2.textContent = "Let's get in touch!";
    			t15 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(path0, "fill", "currentColor");
    			attr_dev(path0, "d", "M528 32H48A48 48 0 000 80v352a48 48 0 0048 48h480a48 48 0 0048-48V80a48 48 0 00-48-48zm0 400H48V80h480v352zM208 256a64 64 0 10-.1-128.1A64 64 0 00208 256zm-89.6 128h179.2c12.4 0 22.4-8.6 22.4-19.2v-19.2c0-31.8-30.1-57.6-67.2-57.6-10.8 0-18.7 8-44.8 8-26.9 0-33.4-8-44.8-8-37.1 0-67.2 25.8-67.2 57.6v19.2c0 10.6 10 19.2 22.4 19.2zM360 320h112a8 8 0 008-8v-16a8 8 0 00-8-8H360a8 8 0 00-8 8v16a8 8 0 008 8zm0-64h112a8 8 0 008-8v-16a8 8 0 00-8-8H360a8 8 0 00-8 8v16a8 8 0 008 8zm0-64h112a8 8 0 008-8v-16a8 8 0 00-8-8H360a8 8 0 00-8 8v16a8 8 0 008 8z");
    			add_location(path0, file$1, 23, 11, 854);
    			attr_dev(svg0, "aria-hidden", "true");
    			attr_dev(svg0, "class", "icon has-text-white");
    			set_style(svg0, "color", "white");
    			set_style(svg0, "position", "relative");
    			set_style(svg0, "width", "46px");
    			set_style(svg0, "top", "16px");
    			set_style(svg0, "left", "5px");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "viewBox", "0 0 576 512");
    			add_location(svg0, file$1, 17, 8, 603);
    			attr_dev(div0, "class", "rnd svelte-1po05qo");
    			set_style(div0, "background-color", "#084c61");
    			add_location(div0, file$1, 16, 6, 542);
    			attr_dev(h50, "class", "mt-2");
    			add_location(h50, file$1, 30, 8, 1548);
    			add_location(p0, file$1, 31, 8, 1588);
    			attr_dev(div1, "class", "content ml-1 mt-5");
    			add_location(div1, file$1, 29, 6, 1507);
    			attr_dev(a0, "class", "box is-success mx-3");
    			add_location(a0, file$1, 15, 4, 464);
    			attr_dev(div2, "class", "column has-text-left");
    			add_location(div2, file$1, 13, 2, 372);
    			attr_dev(path1, "fill", "currentColor");
    			attr_dev(path1, "d", "M278.9 511.5l-61-17.7a12 12 0 01-8.2-14.9L346.2 8.7A12 12 0 01361.1.5l61 17.7a12 12 0 018.2 14.9L293.8 503.3a12 12 0 01-14.9 8.2zm-114-112.2l43.5-46.4a12 12 0 00-.8-17.2L117 256l90.6-79.7a12 12 0 00.8-17.2l-43.5-46.4a12 12 0 00-17-.5L3.8 247.2a12 12 0 000 17.5l144.1 135.1a12 12 0 0017-.5zm327.2.6l144.1-135.1a12 12 0 000-17.5L492.1 112.1a12.1 12.1 0 00-17 .5L431.6 159a12 12 0 00.8 17.2L523 256l-90.6 79.7a12 12 0 00-.8 17.2l43.5 46.4a12 12 0 0017 .6z");
    			add_location(path1, file$1, 47, 11, 2148);
    			attr_dev(svg1, "aria-hidden", "true");
    			attr_dev(svg1, "class", "icon has-text-white");
    			set_style(svg1, "color", "white");
    			set_style(svg1, "position", "relative");
    			set_style(svg1, "width", "46px");
    			set_style(svg1, "top", "16px");
    			set_style(svg1, "left", "5px");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "viewBox", "0 0 640 512");
    			add_location(svg1, file$1, 41, 8, 1897);
    			attr_dev(div3, "class", "rnd svelte-1po05qo");
    			set_style(div3, "background-color", "#e3b505");
    			add_location(div3, file$1, 40, 6, 1836);
    			attr_dev(h51, "class", "mt-2");
    			add_location(h51, file$1, 54, 8, 2749);
    			add_location(p1, file$1, 55, 8, 2788);
    			attr_dev(div4, "class", "content ml-1 mt-5");
    			add_location(div4, file$1, 53, 6, 2708);
    			attr_dev(a1, "class", "box is-success mx-3");
    			add_location(a1, file$1, 39, 4, 1759);
    			attr_dev(div5, "class", "column has-text-left");
    			add_location(div5, file$1, 37, 2, 1668);
    			attr_dev(path2, "fill", "currentColor");
    			attr_dev(path2, "d", "M256 8C119 8 8 119 8 256a247.9 247.9 0 00383.4 207.8 24 24 0 005.6-35.4L386.8 416a24 24 0 00-31.4-5.2A184.2 184.2 0 0172 256c0-101.5 82.5-184 184-184 100.1 0 184 57.6 184 160 0 38.8-21 79.7-58.2 83.7-17.3-.5-16.9-12.9-13.4-30l23.4-121.1a24 24 0 00-23.6-28.6h-45a13.5 13.5 0 00-13.4 12c-14.7-17.8-40.4-21.7-60-21.7-74.5 0-137.8 62.2-137.8 151.5 0 65.3 36.8 105.8 96 105.8 27 0 57.4-15.6 75-38.3 9.5 34.1 40.6 34.1 70.7 34.1 109 0 150.3-71.6 150.3-147.4C504 95.7 394 8 256 8zm-21.7 304.4c-22.2 0-36-15.6-36-40.7 0-45 30.7-72.8 58.6-72.8 22.3 0 35.6 15.3 35.6 40.8 0 45-33.9 72.7-58.2 72.7z");
    			add_location(path2, file$1, 71, 11, 3365);
    			attr_dev(svg2, "aria-hidden", "true");
    			attr_dev(svg2, "class", "icon has-text-white");
    			set_style(svg2, "color", "white");
    			set_style(svg2, "position", "relative");
    			set_style(svg2, "width", "46px");
    			set_style(svg2, "top", "16px");
    			set_style(svg2, "left", "5px");
    			attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg2, "viewBox", "0 0 512 512");
    			add_location(svg2, file$1, 65, 8, 3114);
    			attr_dev(div6, "class", "rnd svelte-1po05qo");
    			set_style(div6, "background-color", "#db504a");
    			add_location(div6, file$1, 64, 6, 3053);
    			attr_dev(h52, "class", "mt-2");
    			add_location(h52, file$1, 78, 8, 4101);
    			add_location(p2, file$1, 79, 8, 4143);
    			attr_dev(div7, "class", "content ml-1 mt-5");
    			add_location(div7, file$1, 77, 6, 4060);
    			attr_dev(a2, "class", "box is-success mx-3");
    			add_location(a2, file$1, 63, 4, 3014);
    			attr_dev(div8, "class", "column has-text-left");
    			add_location(div8, file$1, 61, 2, 2882);
    			attr_dev(div9, "class", "columns has-text-centered");
    			add_location(div9, file$1, 7, 0, 231);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div9, anchor);
    			if (if_block0) if_block0.m(div9, null);
    			append_dev(div9, t0);
    			append_dev(div9, div2);
    			append_dev(div2, a0);
    			append_dev(a0, div0);
    			append_dev(div0, svg0);
    			append_dev(svg0, path0);
    			append_dev(a0, t1);
    			append_dev(a0, div1);
    			append_dev(div1, h50);
    			append_dev(div1, t3);
    			append_dev(div1, p0);
    			append_dev(div9, t5);
    			append_dev(div9, div5);
    			append_dev(div5, a1);
    			append_dev(a1, div3);
    			append_dev(div3, svg1);
    			append_dev(svg1, path1);
    			append_dev(a1, t6);
    			append_dev(a1, div4);
    			append_dev(div4, h51);
    			append_dev(div4, t8);
    			append_dev(div4, p1);
    			append_dev(div9, t10);
    			append_dev(div9, div8);
    			append_dev(div8, a2);
    			append_dev(a2, div6);
    			append_dev(div6, svg2);
    			append_dev(svg2, path2);
    			append_dev(a2, t11);
    			append_dev(a2, div7);
    			append_dev(div7, h52);
    			append_dev(div7, t13);
    			append_dev(div7, p2);
    			append_dev(div9, t15);
    			if (if_block1) if_block1.m(div9, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(a0, "click", /*click_handler*/ ctx[2], false, false, false),
    					listen_dev(a1, "click", /*click_handler_1*/ ctx[3], false, false, false),
    					listen_dev(div8, "click", /*click_handler_2*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$mediaQuery*/ ctx[0] === "desktop") {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_1$1(ctx);
    					if_block0.c();
    					if_block0.m(div9, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*$mediaQuery*/ ctx[0] === "desktop") {
    				if (if_block1) ; else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					if_block1.m(div9, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div9);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			mounted = false;
    			run_all(dispose);
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
    	let $mediaQuery;
    	validate_store(mediaQuery, "mediaQuery");
    	component_subscribe($$self, mediaQuery, $$value => $$invalidate(0, $mediaQuery = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Buttons", slots, []);

    	function switchPage(newPage) {
    		document.getElementsByTagName("html")[0].classList.remove("is-clipped");
    		page.update(_ => newPage);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Buttons> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		switchPage("about");
    	};

    	const click_handler_1 = () => {
    		switchPage("work");
    	};

    	const click_handler_2 = () => {
    		switchPage("contact");
    	};

    	$$self.$capture_state = () => ({
    		page,
    		mediaQuery,
    		switchPage,
    		$mediaQuery
    	});

    	return [$mediaQuery, switchPage, click_handler, click_handler_1, click_handler_2];
    }

    class Buttons extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Buttons",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\pages\components\home\WIP.svelte generated by Svelte v3.32.3 */

    const file$2 = "src\\pages\\components\\home\\WIP.svelte";

    function create_fragment$2(ctx) {
    	let article;
    	let div3;
    	let div2;
    	let div0;
    	let strong;
    	let t1;
    	let t2;
    	let div1;
    	let a;

    	const block = {
    		c: function create() {
    			article = element("article");
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			strong = element("strong");
    			strong.textContent = "Hey there!";
    			t1 = text(" This website is currently work-in-progress");
    			t2 = space();
    			div1 = element("div");
    			a = element("a");
    			a.textContent = "View CV";
    			add_location(strong, file$2, 4, 6, 189);
    			attr_dev(div0, "class", "column is-three-quarters mr-0 has-text-centered");
    			add_location(div0, file$2, 3, 5, 120);
    			attr_dev(a, "href", "/David-Pescariu.pdf");
    			attr_dev(a, "class", "button is-warning is-outlined is-fullwidth");
    			add_location(a, file$2, 7, 7, 313);
    			attr_dev(div1, "class", "column ml-0");
    			add_location(div1, file$2, 6, 5, 279);
    			attr_dev(div2, "class", "columns is-vcentered");
    			add_location(div2, file$2, 2, 3, 79);
    			attr_dev(div3, "class", "message-body");
    			add_location(div3, file$2, 1, 2, 48);
    			attr_dev(article, "class", "consent message is-warning svelte-tqr7h5");
    			add_location(article, file$2, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);
    			append_dev(article, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, strong);
    			append_dev(div0, t1);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, a);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
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

    function instance$2($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("WIP", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<WIP> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class WIP extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "WIP",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\pages\Home.svelte generated by Svelte v3.32.3 */
    const file$3 = "src\\pages\\Home.svelte";

    // (11:2) {#if $mediaQuery === "desktop"}
    function create_if_block_2$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			set_style(div, "height", "5.5rem");
    			add_location(div, file$3, 11, 4, 507);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(11:2) {#if $mediaQuery === \\\"desktop\\\"}",
    		ctx
    	});

    	return block;
    }

    // (17:2) {#if $mediaQuery === "desktop"}
    function create_if_block_1$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			set_style(div, "height", "6.9rem");
    			add_location(div, file$3, 17, 4, 611);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(17:2) {#if $mediaQuery === \\\"desktop\\\"}",
    		ctx
    	});

    	return block;
    }

    // (23:2) {#if $mediaQuery !== "desktop"}
    function create_if_block$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			set_style(div, "height", "9rem");
    			add_location(div, file$3, 23, 4, 710);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(23:2) {#if $mediaQuery !== \\\"desktop\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let section;
    	let t0;
    	let introduction;
    	let t1;
    	let t2;
    	let buttons;
    	let t3;
    	let t4;
    	let wip;
    	let section_transition;
    	let current;
    	let if_block0 = /*$mediaQuery*/ ctx[0] === "desktop" && create_if_block_2$1(ctx);
    	introduction = new Introduction({ $$inline: true });
    	let if_block1 = /*$mediaQuery*/ ctx[0] === "desktop" && create_if_block_1$2(ctx);
    	buttons = new Buttons({ $$inline: true });
    	let if_block2 = /*$mediaQuery*/ ctx[0] !== "desktop" && create_if_block$2(ctx);
    	wip = new WIP({ $$inline: true });

    	const block = {
    		c: function create() {
    			section = element("section");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			create_component(introduction.$$.fragment);
    			t1 = space();
    			if (if_block1) if_block1.c();
    			t2 = space();
    			create_component(buttons.$$.fragment);
    			t3 = space();
    			if (if_block2) if_block2.c();
    			t4 = space();
    			create_component(wip.$$.fragment);
    			attr_dev(section, "class", "content svelte-7henp0");
    			add_location(section, file$3, 9, 0, 405);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			if (if_block0) if_block0.m(section, null);
    			append_dev(section, t0);
    			mount_component(introduction, section, null);
    			append_dev(section, t1);
    			if (if_block1) if_block1.m(section, null);
    			append_dev(section, t2);
    			mount_component(buttons, section, null);
    			append_dev(section, t3);
    			if (if_block2) if_block2.m(section, null);
    			append_dev(section, t4);
    			mount_component(wip, section, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$mediaQuery*/ ctx[0] === "desktop") {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_2$1(ctx);
    					if_block0.c();
    					if_block0.m(section, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*$mediaQuery*/ ctx[0] === "desktop") {
    				if (if_block1) ; else {
    					if_block1 = create_if_block_1$2(ctx);
    					if_block1.c();
    					if_block1.m(section, t2);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*$mediaQuery*/ ctx[0] !== "desktop") {
    				if (if_block2) ; else {
    					if_block2 = create_if_block$2(ctx);
    					if_block2.c();
    					if_block2.m(section, t4);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(introduction.$$.fragment, local);
    			transition_in(buttons.$$.fragment, local);
    			transition_in(wip.$$.fragment, local);

    			add_render_callback(() => {
    				if (!section_transition) section_transition = create_bidirectional_transition(section, fade, { duration: 200 }, true);
    				section_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(introduction.$$.fragment, local);
    			transition_out(buttons.$$.fragment, local);
    			transition_out(wip.$$.fragment, local);
    			if (!section_transition) section_transition = create_bidirectional_transition(section, fade, { duration: 200 }, false);
    			section_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if (if_block0) if_block0.d();
    			destroy_component(introduction);
    			if (if_block1) if_block1.d();
    			destroy_component(buttons);
    			if (if_block2) if_block2.d();
    			destroy_component(wip);
    			if (detaching && section_transition) section_transition.end();
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
    	let $mediaQuery;
    	validate_store(mediaQuery, "mediaQuery");
    	component_subscribe($$self, mediaQuery, $$value => $$invalidate(0, $mediaQuery = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Home", slots, []);
    	document.querySelector("body").classList.remove("has-navbar-fixed-top");
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		mediaQuery,
    		fade,
    		Introduction,
    		Buttons,
    		WIP,
    		$mediaQuery
    	});

    	return [$mediaQuery];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\pages\components\navbar\Link.svelte generated by Svelte v3.32.3 */
    const file$4 = "src\\pages\\components\\navbar\\Link.svelte";

    // (25:0) {:else}
    function create_else_block(ctx) {
    	let a;
    	let span;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			span = element("span");
    			span.textContent = `${/*getDisplayName*/ ctx[2]()}`;
    			add_location(span, file$4, 27, 4, 746);
    			attr_dev(a, "class", "navbar-item");
    			add_location(a, file$4, 26, 2, 683);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, span);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*click_handler_1*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(25:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (20:0) {#if to === $page}
    function create_if_block$3(ctx) {
    	let a;
    	let span;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			span = element("span");
    			span.textContent = `${/*getDisplayName*/ ctx[2]()}`;
    			attr_dev(span, "class", "currentPage svelte-1pnu2pn");
    			add_location(span, file$4, 22, 4, 562);
    			attr_dev(a, "class", "navbar-item");
    			add_location(a, file$4, 21, 2, 499);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, span);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*click_handler*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(20:0) {#if to === $page}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*to*/ ctx[0] === /*$page*/ ctx[1]) return create_if_block$3;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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

    function instance$4($$self, $$props, $$invalidate) {
    	let $page;
    	validate_store(page, "page");
    	component_subscribe($$self, page, $$value => $$invalidate(1, $page = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Link", slots, []);
    	let { to } = $$props;

    	function getDisplayName() {
    		switch (to) {
    			case "about":
    				return "About Me";
    			case "work":
    				return "My Work";
    			case "contact":
    				return "Contact Me";
    			default:
    				return "Fail";
    		}
    	}

    	function switchPage(newPage) {
    		page.update(_ => newPage);
    	}

    	const writable_props = ["to"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Link> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		switchPage(to);
    	};

    	const click_handler_1 = () => {
    		switchPage(to);
    	};

    	$$self.$$set = $$props => {
    		if ("to" in $$props) $$invalidate(0, to = $$props.to);
    	};

    	$$self.$capture_state = () => ({
    		page,
    		to,
    		getDisplayName,
    		switchPage,
    		$page
    	});

    	$$self.$inject_state = $$props => {
    		if ("to" in $$props) $$invalidate(0, to = $$props.to);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [to, $page, getDisplayName, switchPage, click_handler, click_handler_1];
    }

    class Link extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { to: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Link",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*to*/ ctx[0] === undefined && !("to" in props)) {
    			console.warn("<Link> was created without expected prop 'to'");
    		}
    	}

    	get to() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set to(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\components\Navbar.svelte generated by Svelte v3.32.3 */
    const file$5 = "src\\pages\\components\\Navbar.svelte";

    // (38:4) {#if $mediaQuery !== "desktop"}
    function create_if_block$4(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			set_style(div, "height", "1rem");
    			add_location(div, file$5, 38, 6, 1258);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(38:4) {#if $mediaQuery !== \\\"desktop\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let nav;
    	let div1;
    	let a0;
    	let img;
    	let img_src_value;
    	let t0;
    	let span0;
    	let strong;
    	let t2;
    	let div0;
    	let span1;
    	let t3;
    	let span2;
    	let t4;
    	let span3;
    	let t5;
    	let div6;
    	let div2;
    	let link0;
    	let t6;
    	let link1;
    	let t7;
    	let link2;
    	let t8;
    	let t9;
    	let div5;
    	let div4;
    	let div3;
    	let a1;
    	let span4;
    	let svg0;
    	let path0;
    	let t10;
    	let span5;
    	let t12;
    	let a2;
    	let span6;
    	let svg1;
    	let path1;
    	let t13;
    	let span7;
    	let current;
    	let mounted;
    	let dispose;
    	link0 = new Link({ props: { to: "about" }, $$inline: true });
    	link1 = new Link({ props: { to: "work" }, $$inline: true });
    	link2 = new Link({ props: { to: "contact" }, $$inline: true });
    	let if_block = /*$mediaQuery*/ ctx[0] !== "desktop" && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			div1 = element("div");
    			a0 = element("a");
    			img = element("img");
    			t0 = space();
    			span0 = element("span");
    			strong = element("strong");
    			strong.textContent = "David Pescariu";
    			t2 = space();
    			div0 = element("div");
    			span1 = element("span");
    			t3 = space();
    			span2 = element("span");
    			t4 = space();
    			span3 = element("span");
    			t5 = space();
    			div6 = element("div");
    			div2 = element("div");
    			create_component(link0.$$.fragment);
    			t6 = space();
    			create_component(link1.$$.fragment);
    			t7 = space();
    			create_component(link2.$$.fragment);
    			t8 = space();
    			if (if_block) if_block.c();
    			t9 = space();
    			div5 = element("div");
    			div4 = element("div");
    			div3 = element("div");
    			a1 = element("a");
    			span4 = element("span");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t10 = space();
    			span5 = element("span");
    			span5.textContent = "Hire Me!";
    			t12 = space();
    			a2 = element("a");
    			span6 = element("span");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t13 = space();
    			span7 = element("span");
    			span7.textContent = "View my GitHub";
    			if (img.src !== (img_src_value = "assets/logo.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "logo");
    			attr_dev(img, "width", "28");
    			attr_dev(img, "height", "28");
    			add_location(img, file$5, 18, 6, 655);
    			add_location(strong, file$5, 19, 25, 745);
    			attr_dev(span0, "class", "ml-2");
    			add_location(span0, file$5, 19, 6, 726);
    			attr_dev(a0, "class", "navbar-item");
    			attr_dev(a0, "href", "/");
    			add_location(a0, file$5, 17, 4, 615);
    			add_location(span1, file$5, 23, 6, 927);
    			add_location(span2, file$5, 24, 6, 943);
    			add_location(span3, file$5, 25, 6, 959);
    			attr_dev(div0, "id", "main-navbar-btn");
    			attr_dev(div0, "class", "navbar-burger");
    			add_location(div0, file$5, 22, 4, 847);
    			attr_dev(div1, "class", "navbar-brand");
    			add_location(div1, file$5, 15, 2, 564);
    			attr_dev(div2, "class", "navbar-start");
    			add_location(div2, file$5, 31, 4, 1091);
    			attr_dev(path0, "fill", "currentColor");
    			attr_dev(path0, "d", "M369.9 97.9L286 14C277 5 264.8-.1 252.1-.1H48C21.5 0 0 21.5 0 48v416c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48V131.9c0-12.7-5.1-25-14.1-34zM332.1 128H256V51.9l76.1 76.1zM48 464V48h160v104c0 13.3 10.7 24 24 24h104v288H48zm250.2-143.7c-12.2-12-47-8.7-64.4-6.5-17.2-10.5-28.7-25-36.8-46.3 3.9-16.1 10.1-40.6 5.4-56-4.2-26.2-37.8-23.6-42.6-5.9-4.4 16.1-.4 38.5 7 67.1-10 23.9-24.9 56-35.4 74.4-20 10.3-47 26.2-51 46.2-3.3 15.8 26 55.2 76.1-31.2 22.4-7.4 46.8-16.5 68.4-20.1 18.9 10.2 41 17 55.8 17 25.5 0 28-28.2 17.5-38.7zm-198.1 77.8c5.1-13.7 24.5-29.5 30.4-35-19 30.3-30.4 35.7-30.4 35zm81.6-190.6c7.4 0 6.7 32.1 1.8 40.8-4.4-13.9-4.3-40.8-1.8-40.8zm-24.4 136.6c9.7-16.9 18-37 24.7-54.7 8.3 15.1 18.9 27.2 30.1 35.5-20.8 4.3-38.9 13.1-54.8 19.2zm131.6-5s-5 6-37.3-7.8c35.1-2.6 40.9 5.4 37.3 7.8z");
    			add_location(path0, file$5, 51, 17, 1773);
    			attr_dev(svg0, "aria-hidden", "true");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "viewBox", "0 0 384 512");
    			add_location(svg0, file$5, 47, 14, 1623);
    			attr_dev(span4, "class", "icon p-1");
    			add_location(span4, file$5, 46, 12, 1584);
    			add_location(span5, file$5, 57, 12, 2716);
    			attr_dev(a1, "class", "button is-white is-rounded");
    			attr_dev(a1, "target", "_blank");
    			attr_dev(a1, "href", "/David-Pescariu.pdf");
    			set_style(a1, "color", "#CD542F");
    			add_location(a1, file$5, 45, 10, 1466);
    			attr_dev(path1, "fill", "currentColor");
    			attr_dev(path1, "d", "M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z");
    			add_location(path1, file$5, 67, 17, 3118);
    			attr_dev(svg1, "aria-hidden", "true");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "viewBox", "0 0 496 512");
    			add_location(svg1, file$5, 63, 14, 2968);
    			attr_dev(span6, "class", "icon");
    			add_location(span6, file$5, 62, 12, 2933);
    			add_location(span7, file$5, 73, 12, 4567);
    			attr_dev(a2, "class", "button is-white is-rounded");
    			attr_dev(a2, "target", "_blank");
    			attr_dev(a2, "href", "https://github.com/davidp-ro");
    			set_style(a2, "color", "#0D1117");
    			add_location(a2, file$5, 61, 10, 2806);
    			attr_dev(div3, "class", "buttons is-centered");
    			add_location(div3, file$5, 43, 8, 1372);
    			attr_dev(div4, "class", "navbar-item");
    			add_location(div4, file$5, 42, 6, 1337);
    			attr_dev(div5, "class", "navbar-end");
    			add_location(div5, file$5, 41, 4, 1305);
    			attr_dev(div6, "id", "main-navbar");
    			attr_dev(div6, "class", "navbar-menu");
    			set_style(div6, "z-index", "99");
    			add_location(div6, file$5, 30, 2, 1022);
    			attr_dev(nav, "class", "navbar is-transparent is-fixed-top");
    			add_location(nav, file$5, 14, 0, 512);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, div1);
    			append_dev(div1, a0);
    			append_dev(a0, img);
    			append_dev(a0, t0);
    			append_dev(a0, span0);
    			append_dev(span0, strong);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			append_dev(div0, span1);
    			append_dev(div0, t3);
    			append_dev(div0, span2);
    			append_dev(div0, t4);
    			append_dev(div0, span3);
    			append_dev(nav, t5);
    			append_dev(nav, div6);
    			append_dev(div6, div2);
    			mount_component(link0, div2, null);
    			append_dev(div2, t6);
    			mount_component(link1, div2, null);
    			append_dev(div2, t7);
    			mount_component(link2, div2, null);
    			append_dev(div6, t8);
    			if (if_block) if_block.m(div6, null);
    			append_dev(div6, t9);
    			append_dev(div6, div5);
    			append_dev(div5, div4);
    			append_dev(div4, div3);
    			append_dev(div3, a1);
    			append_dev(a1, span4);
    			append_dev(span4, svg0);
    			append_dev(svg0, path0);
    			append_dev(a1, t10);
    			append_dev(a1, span5);
    			append_dev(div3, t12);
    			append_dev(div3, a2);
    			append_dev(a2, span6);
    			append_dev(span6, svg1);
    			append_dev(svg1, path1);
    			append_dev(a2, t13);
    			append_dev(a2, span7);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div0, "click", toggleNavbar, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$mediaQuery*/ ctx[0] !== "desktop") {
    				if (if_block) ; else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					if_block.m(div6, t9);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link0.$$.fragment, local);
    			transition_in(link1.$$.fragment, local);
    			transition_in(link2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link0.$$.fragment, local);
    			transition_out(link1.$$.fragment, local);
    			transition_out(link2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			destroy_component(link0);
    			destroy_component(link1);
    			destroy_component(link2);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
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

    function toggleNavbar() {
    	const nav = document.getElementById("main-navbar");
    	const navButton = document.getElementById("main-navbar-btn");

    	if (nav && navButton) {
    		nav.classList.toggle("is-active");
    		navButton.classList.toggle("is-active");
    	}
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $mediaQuery;
    	validate_store(mediaQuery, "mediaQuery");
    	component_subscribe($$self, mediaQuery, $$value => $$invalidate(0, $mediaQuery = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Navbar", slots, []);
    	document.querySelector("body").classList.add("has-navbar-fixed-top");
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Navbar> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		mediaQuery,
    		Link,
    		toggleNavbar,
    		$mediaQuery
    	});

    	return [$mediaQuery];
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navbar",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\pages\About.svelte generated by Svelte v3.32.3 */
    const file$6 = "src\\pages\\About.svelte";

    function create_fragment$6(ctx) {
    	let section;
    	let navbar;
    	let t0;
    	let h3;
    	let section_transition;
    	let current;
    	navbar = new Navbar({ $$inline: true });

    	const block = {
    		c: function create() {
    			section = element("section");
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			h3 = element("h3");
    			h3.textContent = "Work in progress";
    			add_location(h3, file$6, 6, 2, 214);
    			attr_dev(section, "class", "content");
    			add_location(section, file$6, 4, 0, 124);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			mount_component(navbar, section, null);
    			append_dev(section, t0);
    			append_dev(section, h3);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);

    			add_render_callback(() => {
    				if (!section_transition) section_transition = create_bidirectional_transition(section, fade, { delay: 200, duration: 300 }, true);
    				section_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			if (!section_transition) section_transition = create_bidirectional_transition(section, fade, { delay: 200, duration: 300 }, false);
    			section_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(navbar);
    			if (detaching && section_transition) section_transition.end();
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
    	validate_slots("About", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Navbar, fade });
    	return [];
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\pages\Work.svelte generated by Svelte v3.32.3 */
    const file$7 = "src\\pages\\Work.svelte";

    function create_fragment$7(ctx) {
    	let section;
    	let navbar;
    	let t0;
    	let h3;
    	let section_transition;
    	let current;
    	navbar = new Navbar({ $$inline: true });

    	const block = {
    		c: function create() {
    			section = element("section");
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			h3 = element("h3");
    			h3.textContent = "Work in progress";
    			add_location(h3, file$7, 6, 2, 214);
    			attr_dev(section, "class", "content");
    			add_location(section, file$7, 4, 0, 124);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			mount_component(navbar, section, null);
    			append_dev(section, t0);
    			append_dev(section, h3);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);

    			add_render_callback(() => {
    				if (!section_transition) section_transition = create_bidirectional_transition(section, fade, { delay: 200, duration: 300 }, true);
    				section_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			if (!section_transition) section_transition = create_bidirectional_transition(section, fade, { delay: 200, duration: 300 }, false);
    			section_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(navbar);
    			if (detaching && section_transition) section_transition.end();
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

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Work", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Work> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Navbar, fade });
    	return [];
    }

    class Work extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Work",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\pages\Contact.svelte generated by Svelte v3.32.3 */
    const file$8 = "src\\pages\\Contact.svelte";

    function create_fragment$8(ctx) {
    	let section;
    	let navbar;
    	let t0;
    	let h3;
    	let section_transition;
    	let current;
    	navbar = new Navbar({ $$inline: true });

    	const block = {
    		c: function create() {
    			section = element("section");
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			h3 = element("h3");
    			h3.textContent = "Work in progress";
    			add_location(h3, file$8, 6, 2, 214);
    			attr_dev(section, "class", "content");
    			add_location(section, file$8, 4, 0, 124);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			mount_component(navbar, section, null);
    			append_dev(section, t0);
    			append_dev(section, h3);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);

    			add_render_callback(() => {
    				if (!section_transition) section_transition = create_bidirectional_transition(section, fade, { delay: 200, duration: 300 }, true);
    				section_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			if (!section_transition) section_transition = create_bidirectional_transition(section, fade, { delay: 200, duration: 300 }, false);
    			section_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(navbar);
    			if (detaching && section_transition) section_transition.end();
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
    	validate_slots("Contact", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Contact> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Navbar, fade });
    	return [];
    }

    class Contact extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Contact",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src\pages\components\Consent.svelte generated by Svelte v3.32.3 */

    const file$9 = "src\\pages\\components\\Consent.svelte";

    function create_fragment$9(ctx) {
    	let article;
    	let div3;
    	let div2;
    	let div0;
    	let strong;
    	let t1;
    	let a;
    	let t3;
    	let t4;
    	let div1;
    	let button0;
    	let t6;
    	let button1;

    	const block = {
    		c: function create() {
    			article = element("article");
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			strong = element("strong");
    			strong.textContent = "Hey there!";
    			t1 = text(" I would like to use some basic analytics to\r\n    track traffic, so I need to store some cookies, \r\n    ");
    			a = element("a");
    			a.textContent = "what are cookies?";
    			t3 = text(". Is that OK with you?");
    			t4 = space();
    			div1 = element("div");
    			button0 = element("button");
    			button0.textContent = "Nope";
    			t6 = space();
    			button1 = element("button");
    			button1.textContent = "Sure!";
    			add_location(strong, file$9, 4, 8, 169);
    			attr_dev(a, "href", "https://www.cookiesandyou.com/");
    			add_location(a, file$9, 6, 4, 300);
    			attr_dev(div0, "class", "column is-three-quarters");
    			add_location(div0, file$9, 3, 6, 121);
    			attr_dev(button0, "class", "button is-danger is-outlined");
    			add_location(button0, file$9, 9, 8, 436);
    			attr_dev(button1, "class", "button is-primary is-outlined");
    			add_location(button1, file$9, 10, 8, 504);
    			attr_dev(div1, "class", "column");
    			add_location(div1, file$9, 8, 6, 406);
    			attr_dev(div2, "class", "columns is-vcentered");
    			add_location(div2, file$9, 2, 4, 79);
    			attr_dev(div3, "class", "message-body");
    			add_location(div3, file$9, 1, 2, 47);
    			attr_dev(article, "class", "consent message is-danger svelte-1win8lw");
    			add_location(article, file$9, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);
    			append_dev(article, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, strong);
    			append_dev(div0, t1);
    			append_dev(div0, a);
    			append_dev(div0, t3);
    			append_dev(div2, t4);
    			append_dev(div2, div1);
    			append_dev(div1, button0);
    			append_dev(div1, t6);
    			append_dev(div1, button1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
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

    function instance$9($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Consent", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Consent> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Consent extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Consent",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src\utils\MediaQuery.svelte generated by Svelte v3.32.3 */
    const get_default_slot_changes = dirty => ({ matches: dirty & /*matches*/ 1 });
    const get_default_slot_context = ctx => ({ matches: /*matches*/ ctx[0] });

    function create_fragment$a(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], get_default_slot_context);

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
    				if (default_slot.p && dirty & /*$$scope, matches*/ 9) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, get_default_slot_changes, get_default_slot_context);
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
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MediaQuery", slots, ['default']);
    	let { query } = $$props;
    	let mql;
    	let mqlListener;
    	let wasMounted = false;
    	let matches = false;

    	onMount(() => {
    		$$invalidate(2, wasMounted = true);

    		return () => {
    			removeActiveListener();
    		};
    	});

    	function addNewListener(query) {
    		mql = window.matchMedia(query);
    		mqlListener = v => $$invalidate(0, matches = v.matches);
    		mql.addListener(mqlListener);
    		$$invalidate(0, matches = mql.matches);
    	}

    	function removeActiveListener() {
    		if (mql && mqlListener) {
    			mql.removeListener(mqlListener);
    		}
    	}

    	const writable_props = ["query"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MediaQuery> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("query" in $$props) $$invalidate(1, query = $$props.query);
    		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		query,
    		mql,
    		mqlListener,
    		wasMounted,
    		matches,
    		addNewListener,
    		removeActiveListener
    	});

    	$$self.$inject_state = $$props => {
    		if ("query" in $$props) $$invalidate(1, query = $$props.query);
    		if ("mql" in $$props) mql = $$props.mql;
    		if ("mqlListener" in $$props) mqlListener = $$props.mqlListener;
    		if ("wasMounted" in $$props) $$invalidate(2, wasMounted = $$props.wasMounted);
    		if ("matches" in $$props) $$invalidate(0, matches = $$props.matches);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*wasMounted, query*/ 6) {
    			{
    				if (wasMounted) {
    					removeActiveListener();
    					addNewListener(query);
    				}
    			}
    		}
    	};

    	return [matches, query, wasMounted, $$scope, slots];
    }

    class MediaQuery extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { query: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MediaQuery",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*query*/ ctx[1] === undefined && !("query" in props)) {
    			console.warn("<MediaQuery> was created without expected prop 'query'");
    		}
    	}

    	get query() {
    		throw new Error("<MediaQuery>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set query(value) {
    		throw new Error("<MediaQuery>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\utils\UpdateMQ.svelte generated by Svelte v3.32.3 */

    const { console: console_1 } = globals;

    function create_fragment$b(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("UpdateMQ", slots, []);
    	let { newMediaQuery } = $$props;
    	console.debug(`MQ::Update -> ${newMediaQuery}`);

    	if (newMediaQuery !== "desktop") {
    		document.getElementsByTagName("html")[0].classList.remove("is-clipped");
    	}

    	mediaQuery.update(_ => newMediaQuery);
    	const writable_props = ["newMediaQuery"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<UpdateMQ> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("newMediaQuery" in $$props) $$invalidate(0, newMediaQuery = $$props.newMediaQuery);
    	};

    	$$self.$capture_state = () => ({ mediaQuery, newMediaQuery });

    	$$self.$inject_state = $$props => {
    		if ("newMediaQuery" in $$props) $$invalidate(0, newMediaQuery = $$props.newMediaQuery);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [newMediaQuery];
    }

    class UpdateMQ extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { newMediaQuery: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "UpdateMQ",
    			options,
    			id: create_fragment$b.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*newMediaQuery*/ ctx[0] === undefined && !("newMediaQuery" in props)) {
    			console_1.warn("<UpdateMQ> was created without expected prop 'newMediaQuery'");
    		}
    	}

    	get newMediaQuery() {
    		throw new Error("<UpdateMQ>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set newMediaQuery(value) {
    		throw new Error("<UpdateMQ>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.32.3 */
    const file$a = "src\\App.svelte";

    // (24:4) {#if matches}
    function create_if_block_6(ctx) {
    	let updatemq;
    	let current;

    	updatemq = new UpdateMQ({
    			props: { newMediaQuery: "desktop" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(updatemq.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(updatemq, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(updatemq.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(updatemq.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(updatemq, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(24:4) {#if matches}",
    		ctx
    	});

    	return block;
    }

    // (23:2) <MediaQuery query="(min-width: 1024px)" let:matches>
    function create_default_slot_2(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*matches*/ ctx[2] && create_if_block_6(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*matches*/ ctx[2]) {
    				if (if_block) {
    					if (dirty & /*matches*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_6(ctx);
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
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(23:2) <MediaQuery query=\\\"(min-width: 1024px)\\\" let:matches>",
    		ctx
    	});

    	return block;
    }

    // (29:4) {#if matches}
    function create_if_block_5(ctx) {
    	let updatemq;
    	let current;

    	updatemq = new UpdateMQ({
    			props: { newMediaQuery: "tablet" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(updatemq.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(updatemq, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(updatemq.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(updatemq.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(updatemq, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(29:4) {#if matches}",
    		ctx
    	});

    	return block;
    }

    // (28:2) <MediaQuery query="(min-width: 769px) and (max-width: 1023px)" let:matches>
    function create_default_slot_1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*matches*/ ctx[2] && create_if_block_5(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*matches*/ ctx[2]) {
    				if (if_block) {
    					if (dirty & /*matches*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_5(ctx);
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
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(28:2) <MediaQuery query=\\\"(min-width: 769px) and (max-width: 1023px)\\\" let:matches>",
    		ctx
    	});

    	return block;
    }

    // (34:4) {#if matches}
    function create_if_block_4(ctx) {
    	let updatemq;
    	let current;

    	updatemq = new UpdateMQ({
    			props: { newMediaQuery: "mobile" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(updatemq.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(updatemq, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(updatemq.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(updatemq.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(updatemq, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(34:4) {#if matches}",
    		ctx
    	});

    	return block;
    }

    // (33:2) <MediaQuery query="(max-width: 768px)" let:matches>
    function create_default_slot(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*matches*/ ctx[2] && create_if_block_4(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*matches*/ ctx[2]) {
    				if (if_block) {
    					if (dirty & /*matches*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_4(ctx);
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
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(33:2) <MediaQuery query=\\\"(max-width: 768px)\\\" let:matches>",
    		ctx
    	});

    	return block;
    }

    // (46:2) {:else}
    function create_else_block$1(ctx) {
    	let home;
    	let current;
    	home = new Home({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(home.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(home, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(home.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(home.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(home, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(46:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (44:32) 
    function create_if_block_3$1(ctx) {
    	let contact;
    	let current;
    	contact = new Contact({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(contact.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(contact, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(contact.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(contact.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(contact, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(44:32) ",
    		ctx
    	});

    	return block;
    }

    // (42:29) 
    function create_if_block_2$2(ctx) {
    	let work;
    	let current;
    	work = new Work({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(work.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(work, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(work.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(work.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(work, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(42:29) ",
    		ctx
    	});

    	return block;
    }

    // (40:2) {#if $page === "about"}
    function create_if_block_1$3(ctx) {
    	let about;
    	let current;
    	about = new About({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(about.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(about, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(about.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(about.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(about, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(40:2) {#if $page === \\\"about\\\"}",
    		ctx
    	});

    	return block;
    }

    // (52:2) {#if showConsentPrompt}
    function create_if_block$5(ctx) {
    	let consent;
    	let current;
    	consent = new Consent({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(consent.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(consent, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(consent.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(consent.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(consent, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(52:2) {#if showConsentPrompt}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let div;
    	let mediaquery0;
    	let t0;
    	let mediaquery1;
    	let t1;
    	let mediaquery2;
    	let t2;
    	let current_block_type_index;
    	let if_block0;
    	let t3;
    	let current;

    	mediaquery0 = new MediaQuery({
    			props: {
    				query: "(min-width: 1024px)",
    				$$slots: {
    					default: [
    						create_default_slot_2,
    						({ matches }) => ({ 2: matches }),
    						({ matches }) => matches ? 4 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	mediaquery1 = new MediaQuery({
    			props: {
    				query: "(min-width: 769px) and (max-width: 1023px)",
    				$$slots: {
    					default: [
    						create_default_slot_1,
    						({ matches }) => ({ 2: matches }),
    						({ matches }) => matches ? 4 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	mediaquery2 = new MediaQuery({
    			props: {
    				query: "(max-width: 768px)",
    				$$slots: {
    					default: [
    						create_default_slot,
    						({ matches }) => ({ 2: matches }),
    						({ matches }) => matches ? 4 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const if_block_creators = [create_if_block_1$3, create_if_block_2$2, create_if_block_3$1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$page*/ ctx[0] === "about") return 0;
    		if (/*$page*/ ctx[0] === "work") return 1;
    		if (/*$page*/ ctx[0] === "contact") return 2;
    		return 3;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	let if_block1 = /*showConsentPrompt*/ ctx[1] && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(mediaquery0.$$.fragment);
    			t0 = space();
    			create_component(mediaquery1.$$.fragment);
    			t1 = space();
    			create_component(mediaquery2.$$.fragment);
    			t2 = space();
    			if_block0.c();
    			t3 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(div, "class", "App");
    			add_location(div, file$a, 20, 0, 744);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(mediaquery0, div, null);
    			append_dev(div, t0);
    			mount_component(mediaquery1, div, null);
    			append_dev(div, t1);
    			mount_component(mediaquery2, div, null);
    			append_dev(div, t2);
    			if_blocks[current_block_type_index].m(div, null);
    			append_dev(div, t3);
    			if (if_block1) if_block1.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const mediaquery0_changes = {};

    			if (dirty & /*$$scope, matches*/ 12) {
    				mediaquery0_changes.$$scope = { dirty, ctx };
    			}

    			mediaquery0.$set(mediaquery0_changes);
    			const mediaquery1_changes = {};

    			if (dirty & /*$$scope, matches*/ 12) {
    				mediaquery1_changes.$$scope = { dirty, ctx };
    			}

    			mediaquery1.$set(mediaquery1_changes);
    			const mediaquery2_changes = {};

    			if (dirty & /*$$scope, matches*/ 12) {
    				mediaquery2_changes.$$scope = { dirty, ctx };
    			}

    			mediaquery2.$set(mediaquery2_changes);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block0 = if_blocks[current_block_type_index];

    				if (!if_block0) {
    					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block0.c();
    				}

    				transition_in(if_block0, 1);
    				if_block0.m(div, t3);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mediaquery0.$$.fragment, local);
    			transition_in(mediaquery1.$$.fragment, local);
    			transition_in(mediaquery2.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mediaquery0.$$.fragment, local);
    			transition_out(mediaquery1.$$.fragment, local);
    			transition_out(mediaquery2.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(mediaquery0);
    			destroy_component(mediaquery1);
    			destroy_component(mediaquery2);
    			if_blocks[current_block_type_index].d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let $page;
    	validate_store(page, "page");
    	component_subscribe($$self, page, $$value => $$invalidate(0, $page = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let showConsentPrompt = false;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		page,
    		Home,
    		About,
    		Work,
    		Contact,
    		Consent,
    		MediaQuery,
    		UpdateMQ,
    		showConsentPrompt,
    		$page
    	});

    	$$self.$inject_state = $$props => {
    		if ("showConsentPrompt" in $$props) $$invalidate(1, showConsentPrompt = $$props.showConsentPrompt);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [$page, showConsentPrompt];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    const app = new App({
        target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
