
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
    function null_to_empty(value) {
        return value == null ? '' : value;
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
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
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

    function switchPage(newPage) {
        console.debug(`[Pages] Switching to: ${newPage}`);
        page.update((_) => newPage);
        window.history.pushState({ page: newPage }, `@davidp-ro - ${newPage}`, `?${newPage}`);
        document.title = `David Pescariu - ${newPage.charAt(0).toUpperCase() + newPage.substr(1)}`;
    }

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

    // (19:2) {#if $mediaQuery === "desktop"}
    function create_if_block_3(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "column");
    			add_location(div, file, 19, 4, 579);
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
    		source: "(19:2) {#if $mediaQuery === \\\"desktop\\\"}",
    		ctx
    	});

    	return block;
    }

    // (25:4) {#if (isVisible && $mediaQuery === "desktop")}
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
    			add_location(br0, file, 25, 6, 802);
    			add_location(br1, file, 26, 6, 816);
    			attr_dev(h5, "class", "is-size-5");
    			add_location(h5, file, 27, 6, 830);
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
    		source: "(25:4) {#if (isVisible && $mediaQuery === \\\"desktop\\\")}",
    		ctx
    	});

    	return block;
    }

    // (52:6) {#if $mediaQuery !== "desktop"}
    function create_if_block_1(ctx) {
    	let h5;
    	let t;

    	const block = {
    		c: function create() {
    			h5 = element("h5");
    			t = text(/*descText*/ ctx[2]);
    			attr_dev(h5, "class", "is-size-5 mt-4");
    			add_location(h5, file, 52, 6, 1556);
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
    		source: "(52:6) {#if $mediaQuery !== \\\"desktop\\\"}",
    		ctx
    	});

    	return block;
    }

    // (57:2) {#if $mediaQuery === "desktop"}
    function create_if_block(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "column");
    			add_location(div, file, 57, 4, 1677);
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
    		source: "(57:2) {#if $mediaQuery === \\\"desktop\\\"}",
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
    			add_location(h3, file, 22, 4, 640);
    			attr_dev(h1, "class", "title is-size-1 my-0");
    			add_location(h1, file, 23, 4, 690);
    			attr_dev(div0, "class", "column");
    			add_location(div0, file, 21, 2, 614);
    			attr_dev(img, "class", "is-rounded svelte-1px73g6");
    			if (img.src !== (img_src_value = "assets/profile.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Profile");
    			add_location(img, file, 32, 6, 1002);
    			attr_dev(figure, "class", "image");
    			add_location(figure, file, 31, 4, 972);
    			attr_dev(div1, "class", "column is-narrow-desktop");
    			add_location(div1, file, 30, 2, 928);
    			attr_dev(div2, "class", "columns is-desktop");
    			add_location(div2, file, 17, 0, 506);
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

    // (6:2) {#if $mediaQuery === "desktop"}
    function create_if_block_1$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "column");
    			add_location(div, file$1, 6, 4, 211);
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
    		source: "(6:2) {#if $mediaQuery === \\\"desktop\\\"}",
    		ctx
    	});

    	return block;
    }

    // (82:2) {#if $mediaQuery === "desktop"}
    function create_if_block$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "column");
    			add_location(div, file$1, 82, 4, 4146);
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
    		source: "(82:2) {#if $mediaQuery === \\\"desktop\\\"}",
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
    			add_location(path0, file$1, 20, 11, 754);
    			attr_dev(svg0, "aria-hidden", "true");
    			attr_dev(svg0, "class", "icon has-text-white");
    			set_style(svg0, "color", "white");
    			set_style(svg0, "position", "relative");
    			set_style(svg0, "width", "46px");
    			set_style(svg0, "top", "16px");
    			set_style(svg0, "left", "5px");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "viewBox", "0 0 576 512");
    			add_location(svg0, file$1, 14, 8, 503);
    			attr_dev(div0, "class", "rnd svelte-uza0h8");
    			set_style(div0, "background-color", "#084c61");
    			add_location(div0, file$1, 13, 6, 442);
    			attr_dev(h50, "class", "mt-2");
    			add_location(h50, file$1, 27, 8, 1448);
    			add_location(p0, file$1, 28, 8, 1488);
    			attr_dev(div1, "class", "content ml-1 mt-5");
    			add_location(div1, file$1, 26, 6, 1407);
    			attr_dev(a0, "class", "box is-success mx-3 svelte-uza0h8");
    			add_location(a0, file$1, 12, 4, 364);
    			attr_dev(div2, "class", "column has-text-left");
    			add_location(div2, file$1, 10, 2, 272);
    			attr_dev(path1, "fill", "currentColor");
    			attr_dev(path1, "d", "M278.9 511.5l-61-17.7a12 12 0 01-8.2-14.9L346.2 8.7A12 12 0 01361.1.5l61 17.7a12 12 0 018.2 14.9L293.8 503.3a12 12 0 01-14.9 8.2zm-114-112.2l43.5-46.4a12 12 0 00-.8-17.2L117 256l90.6-79.7a12 12 0 00.8-17.2l-43.5-46.4a12 12 0 00-17-.5L3.8 247.2a12 12 0 000 17.5l144.1 135.1a12 12 0 0017-.5zm327.2.6l144.1-135.1a12 12 0 000-17.5L492.1 112.1a12.1 12.1 0 00-17 .5L431.6 159a12 12 0 00.8 17.2L523 256l-90.6 79.7a12 12 0 00-.8 17.2l43.5 46.4a12 12 0 0017 .6z");
    			add_location(path1, file$1, 44, 11, 2048);
    			attr_dev(svg1, "aria-hidden", "true");
    			attr_dev(svg1, "class", "icon has-text-white");
    			set_style(svg1, "color", "white");
    			set_style(svg1, "position", "relative");
    			set_style(svg1, "width", "46px");
    			set_style(svg1, "top", "16px");
    			set_style(svg1, "left", "5px");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "viewBox", "0 0 640 512");
    			add_location(svg1, file$1, 38, 8, 1797);
    			attr_dev(div3, "class", "rnd svelte-uza0h8");
    			set_style(div3, "background-color", "#e3b505");
    			add_location(div3, file$1, 37, 6, 1736);
    			attr_dev(h51, "class", "mt-2");
    			add_location(h51, file$1, 51, 8, 2649);
    			add_location(p1, file$1, 52, 8, 2688);
    			attr_dev(div4, "class", "content ml-1 mt-5");
    			add_location(div4, file$1, 50, 6, 2608);
    			attr_dev(a1, "class", "box is-success mx-3 svelte-uza0h8");
    			add_location(a1, file$1, 36, 4, 1659);
    			attr_dev(div5, "class", "column has-text-left");
    			add_location(div5, file$1, 34, 2, 1568);
    			attr_dev(path2, "fill", "currentColor");
    			attr_dev(path2, "d", "M256 8C119 8 8 119 8 256a247.9 247.9 0 00383.4 207.8 24 24 0 005.6-35.4L386.8 416a24 24 0 00-31.4-5.2A184.2 184.2 0 0172 256c0-101.5 82.5-184 184-184 100.1 0 184 57.6 184 160 0 38.8-21 79.7-58.2 83.7-17.3-.5-16.9-12.9-13.4-30l23.4-121.1a24 24 0 00-23.6-28.6h-45a13.5 13.5 0 00-13.4 12c-14.7-17.8-40.4-21.7-60-21.7-74.5 0-137.8 62.2-137.8 151.5 0 65.3 36.8 105.8 96 105.8 27 0 57.4-15.6 75-38.3 9.5 34.1 40.6 34.1 70.7 34.1 109 0 150.3-71.6 150.3-147.4C504 95.7 394 8 256 8zm-21.7 304.4c-22.2 0-36-15.6-36-40.7 0-45 30.7-72.8 58.6-72.8 22.3 0 35.6 15.3 35.6 40.8 0 45-33.9 72.7-58.2 72.7z");
    			add_location(path2, file$1, 68, 11, 3265);
    			attr_dev(svg2, "aria-hidden", "true");
    			attr_dev(svg2, "class", "icon has-text-white");
    			set_style(svg2, "color", "white");
    			set_style(svg2, "position", "relative");
    			set_style(svg2, "width", "46px");
    			set_style(svg2, "top", "16px");
    			set_style(svg2, "left", "5px");
    			attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg2, "viewBox", "0 0 512 512");
    			add_location(svg2, file$1, 62, 8, 3014);
    			attr_dev(div6, "class", "rnd svelte-uza0h8");
    			set_style(div6, "background-color", "#db504a");
    			add_location(div6, file$1, 61, 6, 2953);
    			attr_dev(h52, "class", "mt-2");
    			add_location(h52, file$1, 75, 8, 4001);
    			add_location(p2, file$1, 76, 8, 4043);
    			attr_dev(div7, "class", "content ml-1 mt-5");
    			add_location(div7, file$1, 74, 6, 3960);
    			attr_dev(a2, "class", "box is-success mx-3 svelte-uza0h8");
    			add_location(a2, file$1, 60, 4, 2914);
    			attr_dev(div8, "class", "column has-text-left");
    			add_location(div8, file$1, 58, 2, 2782);
    			attr_dev(div9, "class", "columns has-text-centered");
    			add_location(div9, file$1, 4, 0, 131);
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
    					listen_dev(a0, "click", /*click_handler*/ ctx[1], false, false, false),
    					listen_dev(a1, "click", /*click_handler_1*/ ctx[2], false, false, false),
    					listen_dev(div8, "click", /*click_handler_2*/ ctx[3], false, false, false)
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

    	$$self.$capture_state = () => ({ mediaQuery, switchPage, $mediaQuery });
    	return [$mediaQuery, click_handler, click_handler_1, click_handler_2];
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

    /* src\pages\Home.svelte generated by Svelte v3.32.3 */
    const file$2 = "src\\pages\\Home.svelte";

    // (10:2) {#if $mediaQuery === "desktop"}
    function create_if_block_2$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			set_style(div, "height", "5.5rem");
    			add_location(div, file$2, 10, 4, 458);
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
    		source: "(10:2) {#if $mediaQuery === \\\"desktop\\\"}",
    		ctx
    	});

    	return block;
    }

    // (16:2) {#if $mediaQuery === "desktop"}
    function create_if_block_1$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			set_style(div, "height", "6.9rem");
    			add_location(div, file$2, 16, 4, 562);
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
    		source: "(16:2) {#if $mediaQuery === \\\"desktop\\\"}",
    		ctx
    	});

    	return block;
    }

    // (22:2) {#if $mediaQuery !== "desktop"}
    function create_if_block$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			set_style(div, "height", "9rem");
    			add_location(div, file$2, 22, 4, 661);
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
    		source: "(22:2) {#if $mediaQuery !== \\\"desktop\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let section;
    	let t0;
    	let introduction;
    	let t1;
    	let t2;
    	let buttons;
    	let t3;
    	let section_transition;
    	let current;
    	let if_block0 = /*$mediaQuery*/ ctx[0] === "desktop" && create_if_block_2$1(ctx);
    	introduction = new Introduction({ $$inline: true });
    	let if_block1 = /*$mediaQuery*/ ctx[0] === "desktop" && create_if_block_1$2(ctx);
    	buttons = new Buttons({ $$inline: true });
    	let if_block2 = /*$mediaQuery*/ ctx[0] !== "desktop" && create_if_block$2(ctx);

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
    			attr_dev(section, "class", "content svelte-7henp0");
    			add_location(section, file$2, 8, 0, 356);
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
    					if_block2.m(section, null);
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

    			add_render_callback(() => {
    				if (!section_transition) section_transition = create_bidirectional_transition(section, fade, { duration: 200 }, true);
    				section_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(introduction.$$.fragment, local);
    			transition_out(buttons.$$.fragment, local);
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
    			if (detaching && section_transition) section_transition.end();
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
    		$mediaQuery
    	});

    	return [$mediaQuery];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\pages\components\navbar\HireMe.svelte generated by Svelte v3.32.3 */
    const file$3 = "src\\pages\\components\\navbar\\HireMe.svelte";

    // (38:0) {:else}
    function create_else_block(ctx) {
    	let div3;
    	let div0;
    	let button;
    	let span0;
    	let svg;
    	let path;
    	let t0;
    	let span1;
    	let t2;
    	let div2;
    	let div1;
    	let a0;
    	let t4;
    	let br;
    	let t5;
    	let a1;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			button = element("button");
    			span0 = element("span");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t0 = space();
    			span1 = element("span");
    			span1.textContent = "Hire Me!";
    			t2 = space();
    			div2 = element("div");
    			div1 = element("div");
    			a0 = element("a");
    			a0.textContent = "Română";
    			t4 = space();
    			br = element("br");
    			t5 = space();
    			a1 = element("a");
    			a1.textContent = "English";
    			attr_dev(path, "fill", "currentColor");
    			attr_dev(path, "d", "M369.9 97.9L286 14C277 5 264.8-.1 252.1-.1H48C21.5 0 0 21.5 0 48v416c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48V131.9c0-12.7-5.1-25-14.1-34zM332.1 128H256V51.9l76.1 76.1zM48 464V48h160v104c0 13.3 10.7 24 24 24h104v288H48zm250.2-143.7c-12.2-12-47-8.7-64.4-6.5-17.2-10.5-28.7-25-36.8-46.3 3.9-16.1 10.1-40.6 5.4-56-4.2-26.2-37.8-23.6-42.6-5.9-4.4 16.1-.4 38.5 7 67.1-10 23.9-24.9 56-35.4 74.4-20 10.3-47 26.2-51 46.2-3.3 15.8 26 55.2 76.1-31.2 22.4-7.4 46.8-16.5 68.4-20.1 18.9 10.2 41 17 55.8 17 25.5 0 28-28.2 17.5-38.7zm-198.1 77.8c5.1-13.7 24.5-29.5 30.4-35-19 30.3-30.4 35.7-30.4 35zm81.6-190.6c7.4 0 6.7 32.1 1.8 40.8-4.4-13.9-4.3-40.8-1.8-40.8zm-24.4 136.6c9.7-16.9 18-37 24.7-54.7 8.3 15.1 18.9 27.2 30.1 35.5-20.8 4.3-38.9 13.1-54.8 19.2zm131.6-5s-5 6-37.3-7.8c35.1-2.6 40.9 5.4 37.3 7.8z");
    			add_location(path, file$3, 47, 13, 2237);
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 384 512");
    			add_location(svg, file$3, 43, 10, 2103);
    			attr_dev(span0, "class", "icon p-1");
    			add_location(span0, file$3, 42, 8, 2068);
    			add_location(span1, file$3, 53, 8, 3156);
    			attr_dev(button, "class", "button is-white is-rounded");
    			set_style(button, "color", "#CD542F");
    			add_location(button, file$3, 41, 6, 1992);
    			attr_dev(div0, "class", "dropdown-trigger");
    			add_location(div0, file$3, 40, 4, 1954);
    			attr_dev(a0, "class", "button is-rounded svelte-1tu0mxv");
    			attr_dev(a0, "target", "_blank");
    			attr_dev(a0, "href", "/David-Pescariu.pdf");
    			add_location(a0, file$3, 58, 8, 3321);
    			add_location(br, file$3, 61, 8, 3435);
    			attr_dev(a1, "class", "button is-rounded mb-0 svelte-1tu0mxv");
    			attr_dev(a1, "target", "_blank");
    			attr_dev(a1, "href", "/David-Pescariu_en.pdf");
    			add_location(a1, file$3, 62, 8, 3451);
    			attr_dev(div1, "class", "dropdown-content dropdown-custom has-text-centered svelte-1tu0mxv");
    			add_location(div1, file$3, 57, 6, 3247);
    			attr_dev(div2, "class", "dropdown-menu");
    			add_location(div2, file$3, 56, 4, 3212);
    			attr_dev(div3, "class", "dropdown is-hoverable  is-up");
    			add_location(div3, file$3, 39, 2, 1906);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div0, button);
    			append_dev(button, span0);
    			append_dev(span0, svg);
    			append_dev(svg, path);
    			append_dev(button, t0);
    			append_dev(button, span1);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, a0);
    			append_dev(div1, t4);
    			append_dev(div1, br);
    			append_dev(div1, t5);
    			append_dev(div1, a1);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(38:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (4:0) {#if $mediaQuery == "desktop"}
    function create_if_block$3(ctx) {
    	let div3;
    	let div0;
    	let button;
    	let span0;
    	let svg;
    	let path;
    	let t0;
    	let span1;
    	let t2;
    	let div2;
    	let div1;
    	let a0;
    	let t4;
    	let br;
    	let t5;
    	let a1;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			button = element("button");
    			span0 = element("span");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t0 = space();
    			span1 = element("span");
    			span1.textContent = "Hire Me!";
    			t2 = space();
    			div2 = element("div");
    			div1 = element("div");
    			a0 = element("a");
    			a0.textContent = "Română";
    			t4 = space();
    			br = element("br");
    			t5 = space();
    			a1 = element("a");
    			a1.textContent = "English";
    			attr_dev(path, "fill", "currentColor");
    			attr_dev(path, "d", "M369.9 97.9L286 14C277 5 264.8-.1 252.1-.1H48C21.5 0 0 21.5 0 48v416c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48V131.9c0-12.7-5.1-25-14.1-34zM332.1 128H256V51.9l76.1 76.1zM48 464V48h160v104c0 13.3 10.7 24 24 24h104v288H48zm250.2-143.7c-12.2-12-47-8.7-64.4-6.5-17.2-10.5-28.7-25-36.8-46.3 3.9-16.1 10.1-40.6 5.4-56-4.2-26.2-37.8-23.6-42.6-5.9-4.4 16.1-.4 38.5 7 67.1-10 23.9-24.9 56-35.4 74.4-20 10.3-47 26.2-51 46.2-3.3 15.8 26 55.2 76.1-31.2 22.4-7.4 46.8-16.5 68.4-20.1 18.9 10.2 41 17 55.8 17 25.5 0 28-28.2 17.5-38.7zm-198.1 77.8c5.1-13.7 24.5-29.5 30.4-35-19 30.3-30.4 35.7-30.4 35zm81.6-190.6c7.4 0 6.7 32.1 1.8 40.8-4.4-13.9-4.3-40.8-1.8-40.8zm-24.4 136.6c9.7-16.9 18-37 24.7-54.7 8.3 15.1 18.9 27.2 30.1 35.5-20.8 4.3-38.9 13.1-54.8 19.2zm131.6-5s-5 6-37.3-7.8c35.1-2.6 40.9 5.4 37.3 7.8z");
    			add_location(path, file$3, 12, 13, 436);
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 384 512");
    			add_location(svg, file$3, 8, 10, 302);
    			attr_dev(span0, "class", "icon p-1");
    			add_location(span0, file$3, 7, 8, 267);
    			add_location(span1, file$3, 18, 8, 1355);
    			attr_dev(button, "class", "button is-white is-rounded");
    			set_style(button, "color", "#CD542F");
    			add_location(button, file$3, 6, 6, 191);
    			attr_dev(div0, "class", "dropdown-trigger");
    			add_location(div0, file$3, 5, 4, 153);
    			attr_dev(a0, "class", "button is-rounded svelte-1tu0mxv");
    			attr_dev(a0, "target", "_blank");
    			attr_dev(a0, "href", "/David-Pescariu.pdf");
    			add_location(a0, file$3, 23, 8, 1520);
    			add_location(br, file$3, 26, 8, 1634);
    			attr_dev(a1, "class", "button is-rounded mb-0 svelte-1tu0mxv");
    			attr_dev(a1, "target", "_blank");
    			attr_dev(a1, "href", "/David-Pescariu_en.pdf");
    			add_location(a1, file$3, 27, 8, 1650);
    			attr_dev(div1, "class", "dropdown-content dropdown-custom has-text-centered svelte-1tu0mxv");
    			add_location(div1, file$3, 22, 6, 1446);
    			attr_dev(div2, "class", "dropdown-menu");
    			add_location(div2, file$3, 21, 4, 1411);
    			attr_dev(div3, "class", "dropdown is-hoverable");
    			add_location(div3, file$3, 4, 2, 112);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div0, button);
    			append_dev(button, span0);
    			append_dev(span0, svg);
    			append_dev(svg, path);
    			append_dev(button, t0);
    			append_dev(button, span1);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, a0);
    			append_dev(div1, t4);
    			append_dev(div1, br);
    			append_dev(div1, t5);
    			append_dev(div1, a1);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(4:0) {#if $mediaQuery == \\\"desktop\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*$mediaQuery*/ ctx[0] == "desktop") return create_if_block$3;
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
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
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
    	validate_slots("HireMe", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<HireMe> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ mediaQuery, $mediaQuery });
    	return [$mediaQuery];
    }

    class HireMe extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HireMe",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\pages\components\navbar\Link.svelte generated by Svelte v3.32.3 */
    const file$4 = "src\\pages\\components\\navbar\\Link.svelte";

    // (23:0) {:else}
    function create_else_block$1(ctx) {
    	let a;
    	let span;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			span = element("span");
    			span.textContent = `${/*getDisplayName*/ ctx[2]()}`;
    			add_location(span, file$4, 25, 4, 730);
    			attr_dev(a, "class", "navbar-item");
    			add_location(a, file$4, 24, 2, 667);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, span);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*click_handler_1*/ ctx[4], false, false, false);
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
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(23:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (18:0) {#if to === $page}
    function create_if_block$4(ctx) {
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
    			add_location(span, file$4, 20, 4, 546);
    			attr_dev(a, "class", "navbar-item");
    			add_location(a, file$4, 19, 2, 483);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, span);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*click_handler*/ ctx[3], false, false, false);
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
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(18:0) {#if to === $page}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*to*/ ctx[0] === /*$page*/ ctx[1]) return create_if_block$4;
    		return create_else_block$1;
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
    		switchPage,
    		to,
    		getDisplayName,
    		$page
    	});

    	$$self.$inject_state = $$props => {
    		if ("to" in $$props) $$invalidate(0, to = $$props.to);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [to, $page, getDisplayName, click_handler, click_handler_1];
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

    // (39:4) {#if $mediaQuery !== "desktop"}
    function create_if_block$5(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			set_style(div, "height", "1rem");
    			add_location(div, file$5, 39, 6, 1304);
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
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(39:4) {#if $mediaQuery !== \\\"desktop\\\"}",
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
    	let hireme;
    	let t10;
    	let a1;
    	let span4;
    	let svg;
    	let path;
    	let t11;
    	let span5;
    	let current;
    	let mounted;
    	let dispose;
    	link0 = new Link({ props: { to: "about" }, $$inline: true });
    	link1 = new Link({ props: { to: "work" }, $$inline: true });
    	link2 = new Link({ props: { to: "contact" }, $$inline: true });
    	let if_block = /*$mediaQuery*/ ctx[0] !== "desktop" && create_if_block$5(ctx);
    	hireme = new HireMe({ $$inline: true });

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
    			create_component(hireme.$$.fragment);
    			t10 = space();
    			a1 = element("a");
    			span4 = element("span");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t11 = space();
    			span5 = element("span");
    			span5.textContent = "View my GitHub";
    			if (img.src !== (img_src_value = "assets/logo.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "logo");
    			attr_dev(img, "width", "28");
    			attr_dev(img, "height", "28");
    			add_location(img, file$5, 19, 6, 701);
    			add_location(strong, file$5, 20, 25, 791);
    			attr_dev(span0, "class", "ml-2");
    			add_location(span0, file$5, 20, 6, 772);
    			attr_dev(a0, "class", "navbar-item");
    			attr_dev(a0, "href", "/");
    			add_location(a0, file$5, 18, 4, 661);
    			add_location(span1, file$5, 24, 6, 973);
    			add_location(span2, file$5, 25, 6, 989);
    			add_location(span3, file$5, 26, 6, 1005);
    			attr_dev(div0, "id", "main-navbar-btn");
    			attr_dev(div0, "class", "navbar-burger");
    			add_location(div0, file$5, 23, 4, 893);
    			attr_dev(div1, "class", "navbar-brand");
    			add_location(div1, file$5, 16, 2, 610);
    			attr_dev(div2, "class", "navbar-start");
    			add_location(div2, file$5, 32, 4, 1137);
    			attr_dev(path, "fill", "currentColor");
    			attr_dev(path, "d", "M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z");
    			add_location(path, file$5, 55, 17, 1889);
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 496 512");
    			add_location(svg, file$5, 51, 14, 1739);
    			attr_dev(span4, "class", "icon");
    			add_location(span4, file$5, 50, 12, 1704);
    			add_location(span5, file$5, 61, 12, 3338);
    			attr_dev(a1, "class", "button is-white is-rounded");
    			attr_dev(a1, "target", "_blank");
    			attr_dev(a1, "href", "https://github.com/davidp-ro");
    			set_style(a1, "color", "#0D1117");
    			add_location(a1, file$5, 49, 10, 1577);
    			attr_dev(div3, "class", "buttons is-centered");
    			add_location(div3, file$5, 44, 8, 1418);
    			attr_dev(div4, "class", "navbar-item");
    			add_location(div4, file$5, 43, 6, 1383);
    			attr_dev(div5, "class", "navbar-end");
    			add_location(div5, file$5, 42, 4, 1351);
    			attr_dev(div6, "id", "main-navbar");
    			attr_dev(div6, "class", "navbar-menu");
    			set_style(div6, "z-index", "99");
    			add_location(div6, file$5, 31, 2, 1068);
    			attr_dev(nav, "class", "navbar is-transparent is-fixed-top");
    			add_location(nav, file$5, 15, 0, 558);
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
    			mount_component(hireme, div3, null);
    			append_dev(div3, t10);
    			append_dev(div3, a1);
    			append_dev(a1, span4);
    			append_dev(span4, svg);
    			append_dev(svg, path);
    			append_dev(a1, t11);
    			append_dev(a1, span5);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div0, "click", toggleNavbar, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$mediaQuery*/ ctx[0] !== "desktop") {
    				if (if_block) ; else {
    					if_block = create_if_block$5(ctx);
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
    			transition_in(hireme.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link0.$$.fragment, local);
    			transition_out(link1.$$.fragment, local);
    			transition_out(link2.$$.fragment, local);
    			transition_out(hireme.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			destroy_component(link0);
    			destroy_component(link1);
    			destroy_component(link2);
    			if (if_block) if_block.d();
    			destroy_component(hireme);
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
    		HireMe,
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

    /**
     * Manage cookies
     */
    class CookieManager {
        /**
         * Add a new cookie
         *
         * @param name Cookie name
         * @param value Cookie value
         * @param days Expiry
         */
        static setCookie(name, value, days) {
            let expires = "";
            if (days) {
                const date = new Date();
                date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
                expires = "; expires=" + date.toUTCString();
            }
            document.cookie = name + "=" + (value || "") + expires + "; path=/";
        }
        /**
         * Get the value of a cookie
         *
         * @param name Cookie name
         */
        static getCookie(name) {
            let nameEQ = name + "=";
            let ca = document.cookie.split(";");
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) == " ")
                    c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) == 0)
                    return c.substring(nameEQ.length, c.length);
            }
            return null;
        }
        /**
         * Remove a cookie; It will attempt to remove it from all paths
         *
         * @param name Current cookie
         *
         * @src https://stackoverflow.com/questions/179355/clearing-all-cookies-with-javascript
         */
        static eraseCookie(name) {
            const pathBits = location.pathname.split("/");
            let pathCurrent = " path=";
            // do a simple pathless delete first.
            document.cookie = name + "=; expires=Thu, 01-Jan-1970 00:00:01 GMT;";
            for (let i = 0; i < pathBits.length; i++) {
                pathCurrent += (pathCurrent.substr(-1) != "/" ? "/" : "") + pathBits[i];
                document.cookie =
                    name + "=; expires=Thu, 01-Jan-1970 00:00:01 GMT;" + pathCurrent + ";";
            }
        }
        /**
         * Erase all cookies
         */
        static eraseAllCookies() {
            let cookies = document.cookie.split("; ");
            cookies.forEach((cookie) => {
                this.eraseCookie(cookie);
            });
        }
    }

    /* src\pages\components\Footer.svelte generated by Svelte v3.32.3 */
    const file$6 = "src\\pages\\components\\Footer.svelte";

    function create_fragment$6(ctx) {
    	let footer;
    	let div4;
    	let div3;
    	let div0;
    	let button;
    	let t0;
    	let button_class_value;
    	let t1;
    	let div1;
    	let p0;
    	let strong;
    	let t3;
    	let p1;
    	let t4;
    	let a0;
    	let t6;
    	let div2;
    	let p2;
    	let t7;
    	let a1;
    	let t9;
    	let a2;
    	let footer_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			div4 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			button = element("button");
    			t0 = text("Delete cookies from this site");
    			t1 = space();
    			div1 = element("div");
    			p0 = element("p");
    			strong = element("strong");
    			strong.textContent = "© Copyright 2021 - David Pescariu";
    			t3 = space();
    			p1 = element("p");
    			t4 = text("Icons from ");
    			a0 = element("a");
    			a0.textContent = "FontAwesome";
    			t6 = space();
    			div2 = element("div");
    			p2 = element("p");
    			t7 = text("Built with ");
    			a1 = element("a");
    			a1.textContent = "Svelte";
    			t9 = text("\r\n          and ");
    			a2 = element("a");
    			a2.textContent = "Bulma";
    			attr_dev(button, "class", button_class_value = "button is-rounded is-danger is-outlined " + (/*isLoadingBtn*/ ctx[0] ? "is-loading" : ""));
    			add_location(button, file$6, 19, 8, 537);
    			attr_dev(div0, "class", "column");
    			add_location(div0, file$6, 18, 6, 507);
    			add_location(strong, file$6, 32, 10, 1098);
    			attr_dev(p0, "class", "mb-2");
    			add_location(p0, file$6, 31, 8, 1070);
    			attr_dev(a0, "target", "_blank");
    			attr_dev(a0, "href", "https://fontawesome.com/license/free");
    			add_location(a0, file$6, 35, 21, 1203);
    			add_location(p1, file$6, 34, 8, 1177);
    			attr_dev(div1, "class", "column");
    			add_location(div1, file$6, 30, 6, 1040);
    			attr_dev(a1, "target", "_blank");
    			attr_dev(a1, "href", "https://svelte.dev/");
    			add_location(a1, file$6, 42, 21, 1424);
    			attr_dev(a2, "target", "_blank");
    			attr_dev(a2, "href", "https://bulma.io/");
    			add_location(a2, file$6, 43, 14, 1496);
    			attr_dev(p2, "class", "info p-2 mx-auto svelte-1j46n0i");
    			add_location(p2, file$6, 41, 8, 1373);
    			attr_dev(div2, "class", "column");
    			add_location(div2, file$6, 40, 6, 1343);
    			attr_dev(div3, "class", "columns is-vcentered");
    			add_location(div3, file$6, 17, 4, 465);
    			attr_dev(div4, "class", "content has-text-centered");
    			add_location(div4, file$6, 16, 2, 420);
    			attr_dev(footer, "class", footer_class_value = "" + (null_to_empty(/*footerClass*/ ctx[1]) + " svelte-1j46n0i"));
    			add_location(footer, file$6, 15, 0, 388);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div0);
    			append_dev(div0, button);
    			append_dev(button, t0);
    			append_dev(div3, t1);
    			append_dev(div3, div1);
    			append_dev(div1, p0);
    			append_dev(p0, strong);
    			append_dev(div1, t3);
    			append_dev(div1, p1);
    			append_dev(p1, t4);
    			append_dev(p1, a0);
    			append_dev(div3, t6);
    			append_dev(div3, div2);
    			append_dev(div2, p2);
    			append_dev(p2, t7);
    			append_dev(p2, a1);
    			append_dev(p2, t9);
    			append_dev(p2, a2);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*isLoadingBtn*/ 1 && button_class_value !== (button_class_value = "button is-rounded is-danger is-outlined " + (/*isLoadingBtn*/ ctx[0] ? "is-loading" : ""))) {
    				attr_dev(button, "class", button_class_value);
    			}

    			if (dirty & /*footerClass*/ 2 && footer_class_value !== (footer_class_value = "" + (null_to_empty(/*footerClass*/ ctx[1]) + " svelte-1j46n0i"))) {
    				attr_dev(footer, "class", footer_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    			mounted = false;
    			dispose();
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
    	validate_slots("Footer", slots, []);
    	let { isFixed = false } = $$props;
    	let isLoadingBtn = false;
    	let footerClass = "footer";

    	mediaQuery.subscribe(mq => {
    		if (isFixed && mq !== "mobile") {
    			$$invalidate(1, footerClass = "footer-fixed");
    		} else {
    			$$invalidate(1, footerClass = "footer");
    		}
    	});

    	const writable_props = ["isFixed"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		CookieManager.eraseAllCookies();
    		$$invalidate(0, isLoadingBtn = true);

    		// The deletion is basically instant, the delay is here so that a
    		// visitor sees someting happening
    		setTimeout(
    			() => {
    				window.location.href = "/deleted-cookies";
    			},
    			831
    		);
    	};

    	$$self.$$set = $$props => {
    		if ("isFixed" in $$props) $$invalidate(2, isFixed = $$props.isFixed);
    	};

    	$$self.$capture_state = () => ({
    		CookieManager,
    		mediaQuery,
    		isFixed,
    		isLoadingBtn,
    		footerClass
    	});

    	$$self.$inject_state = $$props => {
    		if ("isFixed" in $$props) $$invalidate(2, isFixed = $$props.isFixed);
    		if ("isLoadingBtn" in $$props) $$invalidate(0, isLoadingBtn = $$props.isLoadingBtn);
    		if ("footerClass" in $$props) $$invalidate(1, footerClass = $$props.footerClass);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [isLoadingBtn, footerClass, isFixed, click_handler];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { isFixed: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get isFixed() {
    		throw new Error("<Footer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isFixed(value) {
    		throw new Error("<Footer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\components\about\Source.svelte generated by Svelte v3.32.3 */

    const file$7 = "src\\pages\\components\\about\\Source.svelte";

    function create_fragment$7(ctx) {
    	let a;
    	let figure;
    	let img;
    	let img_src_value;
    	let t0;
    	let p;
    	let t1;

    	const block = {
    		c: function create() {
    			a = element("a");
    			figure = element("figure");
    			img = element("img");
    			t0 = space();
    			p = element("p");
    			t1 = text(/*name*/ ctx[1]);
    			if (img.src !== (img_src_value = /*imgSrc*/ ctx[0])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", /*name*/ ctx[1]);
    			add_location(img, file$7, 7, 4, 202);
    			attr_dev(figure, "class", "image is-128x128 mx-auto my-0 p-2");
    			add_location(figure, file$7, 6, 2, 146);
    			attr_dev(p, "class", "p-0 mt-3");
    			add_location(p, file$7, 9, 2, 248);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "href", /*link*/ ctx[2]);
    			attr_dev(a, "class", "box source mx-4 svelte-j3umkc");
    			add_location(a, file$7, 5, 0, 87);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, figure);
    			append_dev(figure, img);
    			append_dev(a, t0);
    			append_dev(a, p);
    			append_dev(p, t1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*imgSrc*/ 1 && img.src !== (img_src_value = /*imgSrc*/ ctx[0])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*name*/ 2) {
    				attr_dev(img, "alt", /*name*/ ctx[1]);
    			}

    			if (dirty & /*name*/ 2) set_data_dev(t1, /*name*/ ctx[1]);

    			if (dirty & /*link*/ 4) {
    				attr_dev(a, "href", /*link*/ ctx[2]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
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
    	validate_slots("Source", slots, []);
    	let { imgSrc } = $$props;
    	let { name } = $$props;
    	let { link } = $$props;
    	const writable_props = ["imgSrc", "name", "link"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Source> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("imgSrc" in $$props) $$invalidate(0, imgSrc = $$props.imgSrc);
    		if ("name" in $$props) $$invalidate(1, name = $$props.name);
    		if ("link" in $$props) $$invalidate(2, link = $$props.link);
    	};

    	$$self.$capture_state = () => ({ imgSrc, name, link });

    	$$self.$inject_state = $$props => {
    		if ("imgSrc" in $$props) $$invalidate(0, imgSrc = $$props.imgSrc);
    		if ("name" in $$props) $$invalidate(1, name = $$props.name);
    		if ("link" in $$props) $$invalidate(2, link = $$props.link);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [imgSrc, name, link];
    }

    class Source extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { imgSrc: 0, name: 1, link: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Source",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*imgSrc*/ ctx[0] === undefined && !("imgSrc" in props)) {
    			console.warn("<Source> was created without expected prop 'imgSrc'");
    		}

    		if (/*name*/ ctx[1] === undefined && !("name" in props)) {
    			console.warn("<Source> was created without expected prop 'name'");
    		}

    		if (/*link*/ ctx[2] === undefined && !("link" in props)) {
    			console.warn("<Source> was created without expected prop 'link'");
    		}
    	}

    	get imgSrc() {
    		throw new Error("<Source>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set imgSrc(value) {
    		throw new Error("<Source>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<Source>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Source>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get link() {
    		throw new Error("<Source>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set link(value) {
    		throw new Error("<Source>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\About.svelte generated by Svelte v3.32.3 */
    const file$8 = "src\\pages\\About.svelte";

    // (14:2) {#if $mediaQuery === "desktop"}
    function create_if_block_2$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			set_style(div, "height", "3rem");
    			add_location(div, file$8, 14, 4, 476);
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
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(14:2) {#if $mediaQuery === \\\"desktop\\\"}",
    		ctx
    	});

    	return block;
    }

    // (21:4) {#if $mediaQuery === "desktop"}
    function create_if_block_1$3(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "column is-3");
    			add_location(div, file$8, 21, 6, 653);
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
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(21:4) {#if $mediaQuery === \\\"desktop\\\"}",
    		ctx
    	});

    	return block;
    }

    // (171:4) {#if $mediaQuery === "desktop"}
    function create_if_block$6(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "column is-3");
    			add_location(div, file$8, 171, 6, 6081);
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
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(171:4) {#if $mediaQuery === \\\"desktop\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let section;
    	let navbar;
    	let t0;
    	let t1;
    	let div7;
    	let t2;
    	let div6;
    	let h30;
    	let t4;
    	let hr0;
    	let t5;
    	let p0;
    	let t6;
    	let a0;
    	let t8;
    	let br0;
    	let t9;
    	let br1;
    	let t10;
    	let br2;
    	let t11;
    	let p2;
    	let t12;
    	let a1;
    	let t14;
    	let sup0;
    	let t16;
    	let br3;
    	let t17;
    	let a2;
    	let t19;
    	let div0;
    	let t20;
    	let h31;
    	let t22;
    	let hr1;
    	let t23;
    	let p1;
    	let t24;
    	let a3;
    	let t26;
    	let span0;
    	let hr2;
    	let t27;
    	let sup1;
    	let t29;
    	let a4;
    	let t31;
    	let span1;
    	let hr3;
    	let t32;
    	let sup2;
    	let t34;
    	let a5;
    	let t36;
    	let t37;
    	let div1;
    	let t38;
    	let h32;
    	let t40;
    	let hr4;
    	let t41;
    	let div5;
    	let div2;
    	let source0;
    	let t42;
    	let source1;
    	let t43;
    	let source2;
    	let t44;
    	let div3;
    	let source3;
    	let t45;
    	let source4;
    	let t46;
    	let source5;
    	let t47;
    	let div4;
    	let source6;
    	let t48;
    	let source7;
    	let t49;
    	let source8;
    	let t50;
    	let small;
    	let t52;
    	let t53;
    	let footer;
    	let section_transition;
    	let current;
    	let mounted;
    	let dispose;
    	navbar = new Navbar({ $$inline: true });
    	let if_block0 = /*$mediaQuery*/ ctx[0] === "desktop" && create_if_block_2$2(ctx);
    	let if_block1 = /*$mediaQuery*/ ctx[0] === "desktop" && create_if_block_1$3(ctx);

    	source0 = new Source({
    			props: {
    				imgSrc: "assets/logos/ebs.jpg",
    				name: "EBS Radio",
    				link: "https://ebsradio.ro/uncategorized/video-trei-echipe-de-elevi-din-cluj-premiate-pentru-crearea-unor-aplicatii-pentru-orase-smart-si-pentru-protejarea-padurilor/"
    			},
    			$$inline: true
    		});

    	source1 = new Source({
    			props: {
    				imgSrc: "assets/logos/transilvania-press.png",
    				name: "Transilvania Press",
    				link: "https://www.transilvaniapress.ro/actualitate/elevii-au-inventat-aplicatii-inovative-pentru-biciclisti-si-persoanele-rapite/"
    			},
    			$$inline: true
    		});

    	source2 = new Source({
    			props: {
    				imgSrc: "assets/logos/info-actual.png",
    				name: "Info Actual",
    				link: "https://www.infoactual.ro/aplicatii-de-la-cluj-pentru-orase-smart-si-paduri-protejate-cine-au-fost-premiantii.html"
    			},
    			$$inline: true
    		});

    	source3 = new Source({
    			props: {
    				imgSrc: "assets/logos/b24.jpeg",
    				name: "Business24",
    				link: "https://business24.ro/mobile/aplicatii-mobile/ce-aplicatii-au-inventat-liceenii-romani-in-pandemie-1614264"
    			},
    			$$inline: true
    		});

    	source4 = new Source({
    			props: {
    				imgSrc: "assets/logos/radio-cluj.png",
    				name: "Radio Cluj",
    				link: "http://www.radiocluj.ro/2020/11/05/aplicatii-de-la-cluj-pentru-orase-smart-si-paduri-protejate-video/"
    			},
    			$$inline: true
    		});

    	source5 = new Source({
    			props: {
    				imgSrc: "assets/logos/n-news.jpg",
    				name: "NapocaNews",
    				link: "http://www.napocanews.ro/2020/11/aplicatii-de-la-cluj-pentru-orase-smart-si-paduri-protejate.html"
    			},
    			$$inline: true
    		});

    	source6 = new Source({
    			props: {
    				imgSrc: "assets/logos/transilvania-rep.jpg",
    				name: "Transilvania Reporter",
    				link: "https://transilvaniareporter.ro/actualitate/copiii-clujului-realizeaza-aplicatii-pentru-orase-smart-si-paduri-protejate/"
    			},
    			$$inline: true
    		});

    	source7 = new Source({
    			props: {
    				imgSrc: "assets/logos/zcj.jpg",
    				name: "Ziua de Cluj",
    				link: "https://zcj.ro/economie/it-istii-clujeni-au-gasit-solutia-la-protejarea-trotinetistilor-si-taierea-padurilor--206267.html"
    			},
    			$$inline: true
    		});

    	source8 = new Source({
    			props: {
    				imgSrc: "assets/logos/monitorul-cj.png",
    				name: "Monitorul de Cluj",
    				link: "http://www.monitorulcj.ro/actualitate/85404-cine-sunt-tinerii-clujeni-care-ne-vor-face-viata-mai-usoara_-si-mai-smart#sthash.YzhOeF8N.tJ72YUIH.dpbs"
    			},
    			$$inline: true
    		});

    	let if_block2 = /*$mediaQuery*/ ctx[0] === "desktop" && create_if_block$6(ctx);
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			section = element("section");
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			div7 = element("div");
    			if (if_block1) if_block1.c();
    			t2 = space();
    			div6 = element("div");
    			h30 = element("h3");
    			h30.textContent = "Who am I?";
    			t4 = space();
    			hr0 = element("hr");
    			t5 = space();
    			p0 = element("p");
    			t6 = text("I'm a high school student in Cluj-Napoca, Romania and a freelance\r\n        developer in my free time! I'm passionate about Computer Vision and I'm\r\n        actually\r\n        \r\n        ");
    			a0 = element("a");
    			a0.textContent = "looking for internships";
    			t8 = space();
    			br0 = element("br");
    			t9 = space();
    			br1 = element("br");
    			t10 = space();
    			br2 = element("br");
    			t11 = space();
    			p2 = element("p2");
    			t12 = text("I'm also quite a big fan of Hackathons, especially when I'm in teams,\r\n          my favorite one yet was ");
    			a1 = element("a");
    			a1.textContent = "Polihack";
    			t14 = text("\r\n          where we built an MVP for a pair of glasses meant to help the blind keep\r\n          their social distance during the COVID pandemic. Won 1");
    			sup0 = element("sup");
    			sup0.textContent = "st";
    			t16 = text(" place\r\n          ");
    			br3 = element("br");
    			t17 = space();
    			a2 = element("a");
    			a2.textContent = "See our presentation video (Romanian)";
    			t19 = space();
    			div0 = element("div");
    			t20 = space();
    			h31 = element("h3");
    			h31.textContent = "Academics / Contests";
    			t22 = space();
    			hr1 = element("hr");
    			t23 = space();
    			p1 = element("p");
    			t24 = text("Head of Promotion / Valedictorian - ");
    			a3 = element("a");
    			a3.textContent = "DPIT Academy";
    			t26 = text("\r\n        2020\r\n\r\n        ");
    			span0 = element("span");
    			hr2 = element("hr");
    			t27 = text("\r\n\r\n        2");
    			sup1 = element("sup");
    			sup1.textContent = "nd";
    			t29 = text(" Place\r\n        ");
    			a4 = element("a");
    			a4.textContent = "NerdPitch";
    			t31 = text(" Hackathon -\r\n        Entrepreneurship\r\n\r\n        ");
    			span1 = element("span");
    			hr3 = element("hr");
    			t32 = text("\r\n\r\n        6");
    			sup2 = element("sup");
    			sup2.textContent = "th";
    			t34 = text(" Place\r\n        ");
    			a5 = element("a");
    			a5.textContent = "Acadnet";
    			t36 = text(" Nationals -\r\n        Computers / Calculatoare");
    			t37 = space();
    			div1 = element("div");
    			t38 = space();
    			h32 = element("h3");
    			h32.textContent = "Public apparences";
    			t40 = space();
    			hr4 = element("hr");
    			t41 = space();
    			div5 = element("div");
    			div2 = element("div");
    			create_component(source0.$$.fragment);
    			t42 = space();
    			create_component(source1.$$.fragment);
    			t43 = space();
    			create_component(source2.$$.fragment);
    			t44 = space();
    			div3 = element("div");
    			create_component(source3.$$.fragment);
    			t45 = space();
    			create_component(source4.$$.fragment);
    			t46 = space();
    			create_component(source5.$$.fragment);
    			t47 = space();
    			div4 = element("div");
    			create_component(source6.$$.fragment);
    			t48 = space();
    			create_component(source7.$$.fragment);
    			t49 = space();
    			create_component(source8.$$.fragment);
    			t50 = space();
    			small = element("small");
    			small.textContent = "All logos and/or trademarks are the property of their respective owners.";
    			t52 = space();
    			if (if_block2) if_block2.c();
    			t53 = space();
    			create_component(footer.$$.fragment);
    			add_location(h30, file$8, 27, 6, 775);
    			set_style(hr0, "background-color", "var(--primary)");
    			add_location(hr0, file$8, 28, 6, 801);
    			set_style(a0, "border-bottom", "0.2rem solid var(--warning)");
    			set_style(a0, "color", "#4A4A4A");
    			add_location(a0, file$8, 34, 8, 1098);
    			add_location(br0, file$8, 41, 8, 1317);
    			add_location(br1, file$8, 42, 8, 1333);
    			add_location(br2, file$8, 43, 8, 1349);
    			attr_dev(a1, "target", "_blank");
    			attr_dev(a1, "href", "https://polihack.osut.org/");
    			add_location(a1, file$8, 46, 34, 1486);
    			add_location(sup0, file$8, 51, 64, 1739);
    			add_location(br3, file$8, 52, 10, 1770);
    			attr_dev(a2, "target", "_blank");
    			attr_dev(a2, "href", "https://www.youtube.com/watch?v=IlWPMHCDhBA");
    			add_location(a2, file$8, 53, 10, 1788);
    			add_location(p2, file$8, 44, 8, 1365);
    			add_location(p0, file$8, 29, 6, 856);
    			set_style(div0, "height", "1rem");
    			add_location(div0, file$8, 60, 6, 1992);
    			add_location(h31, file$8, 63, 6, 2056);
    			set_style(hr1, "background-color", "var(--primary)");
    			add_location(hr1, file$8, 64, 6, 2093);
    			attr_dev(a3, "target", "_blank");
    			attr_dev(a3, "href", "https://dpit.ro/");
    			add_location(a3, file$8, 66, 44, 2197);
    			attr_dev(hr2, "class", "mx-auto my-3");
    			set_style(hr2, "width", "20rem");
    			set_style(hr2, "background-color", "#A1A1A1");
    			add_location(hr2, file$8, 73, 11, 2332);
    			add_location(span0, file$8, 72, 8, 2314);
    			add_location(sup1, file$8, 79, 9, 2474);
    			attr_dev(a4, "target", "_blank");
    			attr_dev(a4, "href", "https://www.nerd-pitch.ro/");
    			add_location(a4, file$8, 80, 8, 2503);
    			attr_dev(hr3, "class", "mx-auto my-3");
    			set_style(hr3, "width", "20rem");
    			set_style(hr3, "background-color", "#A1A1A1");
    			add_location(hr3, file$8, 84, 11, 2637);
    			add_location(span1, file$8, 83, 8, 2619);
    			add_location(sup2, file$8, 90, 9, 2779);
    			attr_dev(a5, "target", "_blank");
    			attr_dev(a5, "href", "https://acadnet.ro/ro/");
    			add_location(a5, file$8, 91, 8, 2808);
    			add_location(p1, file$8, 65, 6, 2148);
    			set_style(div1, "height", "1rem");
    			add_location(div1, file$8, 96, 6, 2966);
    			add_location(h32, file$8, 99, 6, 3030);
    			set_style(hr4, "background-color", "var(--primary)");
    			add_location(hr4, file$8, 100, 6, 3064);
    			attr_dev(div2, "class", "column is-4 mx-auto");
    			add_location(div2, file$8, 104, 8, 3212);
    			attr_dev(div3, "class", "column is-4 mx-auto");
    			add_location(div3, file$8, 123, 8, 4111);
    			attr_dev(div4, "class", "column is-4 mx-auto");
    			add_location(div4, file$8, 142, 8, 4908);
    			attr_dev(div5, "class", "columns mx-auto");
    			set_style(div5, "max-width", "50rem");
    			add_location(div5, file$8, 102, 6, 3121);
    			add_location(small, file$8, 163, 6, 5864);
    			attr_dev(div6, "class", "column");
    			add_location(div6, file$8, 25, 4, 721);
    			attr_dev(div7, "class", "columns m-0 has-text-centered");
    			add_location(div7, file$8, 18, 2, 539);
    			attr_dev(section, "class", "content");
    			add_location(section, file$8, 10, 0, 346);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			mount_component(navbar, section, null);
    			append_dev(section, t0);
    			if (if_block0) if_block0.m(section, null);
    			append_dev(section, t1);
    			append_dev(section, div7);
    			if (if_block1) if_block1.m(div7, null);
    			append_dev(div7, t2);
    			append_dev(div7, div6);
    			append_dev(div6, h30);
    			append_dev(div6, t4);
    			append_dev(div6, hr0);
    			append_dev(div6, t5);
    			append_dev(div6, p0);
    			append_dev(p0, t6);
    			append_dev(p0, a0);
    			append_dev(p0, t8);
    			append_dev(p0, br0);
    			append_dev(p0, t9);
    			append_dev(p0, br1);
    			append_dev(p0, t10);
    			append_dev(p0, br2);
    			append_dev(p0, t11);
    			append_dev(p0, p2);
    			append_dev(p2, t12);
    			append_dev(p2, a1);
    			append_dev(p2, t14);
    			append_dev(p2, sup0);
    			append_dev(p2, t16);
    			append_dev(p2, br3);
    			append_dev(p2, t17);
    			append_dev(p2, a2);
    			append_dev(div6, t19);
    			append_dev(div6, div0);
    			append_dev(div6, t20);
    			append_dev(div6, h31);
    			append_dev(div6, t22);
    			append_dev(div6, hr1);
    			append_dev(div6, t23);
    			append_dev(div6, p1);
    			append_dev(p1, t24);
    			append_dev(p1, a3);
    			append_dev(p1, t26);
    			append_dev(p1, span0);
    			append_dev(span0, hr2);
    			append_dev(p1, t27);
    			append_dev(p1, sup1);
    			append_dev(p1, t29);
    			append_dev(p1, a4);
    			append_dev(p1, t31);
    			append_dev(p1, span1);
    			append_dev(span1, hr3);
    			append_dev(p1, t32);
    			append_dev(p1, sup2);
    			append_dev(p1, t34);
    			append_dev(p1, a5);
    			append_dev(p1, t36);
    			append_dev(div6, t37);
    			append_dev(div6, div1);
    			append_dev(div6, t38);
    			append_dev(div6, h32);
    			append_dev(div6, t40);
    			append_dev(div6, hr4);
    			append_dev(div6, t41);
    			append_dev(div6, div5);
    			append_dev(div5, div2);
    			mount_component(source0, div2, null);
    			append_dev(div2, t42);
    			mount_component(source1, div2, null);
    			append_dev(div2, t43);
    			mount_component(source2, div2, null);
    			append_dev(div5, t44);
    			append_dev(div5, div3);
    			mount_component(source3, div3, null);
    			append_dev(div3, t45);
    			mount_component(source4, div3, null);
    			append_dev(div3, t46);
    			mount_component(source5, div3, null);
    			append_dev(div5, t47);
    			append_dev(div5, div4);
    			mount_component(source6, div4, null);
    			append_dev(div4, t48);
    			mount_component(source7, div4, null);
    			append_dev(div4, t49);
    			mount_component(source8, div4, null);
    			append_dev(div6, t50);
    			append_dev(div6, small);
    			append_dev(div7, t52);
    			if (if_block2) if_block2.m(div7, null);
    			append_dev(section, t53);
    			mount_component(footer, section, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(a0, "click", /*click_handler*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$mediaQuery*/ ctx[0] === "desktop") {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_2$2(ctx);
    					if_block0.c();
    					if_block0.m(section, t1);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*$mediaQuery*/ ctx[0] === "desktop") {
    				if (if_block1) ; else {
    					if_block1 = create_if_block_1$3(ctx);
    					if_block1.c();
    					if_block1.m(div7, t2);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*$mediaQuery*/ ctx[0] === "desktop") {
    				if (if_block2) ; else {
    					if_block2 = create_if_block$6(ctx);
    					if_block2.c();
    					if_block2.m(div7, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(source0.$$.fragment, local);
    			transition_in(source1.$$.fragment, local);
    			transition_in(source2.$$.fragment, local);
    			transition_in(source3.$$.fragment, local);
    			transition_in(source4.$$.fragment, local);
    			transition_in(source5.$$.fragment, local);
    			transition_in(source6.$$.fragment, local);
    			transition_in(source7.$$.fragment, local);
    			transition_in(source8.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);

    			add_render_callback(() => {
    				if (!section_transition) section_transition = create_bidirectional_transition(section, fade, { delay: 150, duration: 300 }, true);
    				section_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(source0.$$.fragment, local);
    			transition_out(source1.$$.fragment, local);
    			transition_out(source2.$$.fragment, local);
    			transition_out(source3.$$.fragment, local);
    			transition_out(source4.$$.fragment, local);
    			transition_out(source5.$$.fragment, local);
    			transition_out(source6.$$.fragment, local);
    			transition_out(source7.$$.fragment, local);
    			transition_out(source8.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			if (!section_transition) section_transition = create_bidirectional_transition(section, fade, { delay: 150, duration: 300 }, false);
    			section_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(navbar);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			destroy_component(source0);
    			destroy_component(source1);
    			destroy_component(source2);
    			destroy_component(source3);
    			destroy_component(source4);
    			destroy_component(source5);
    			destroy_component(source6);
    			destroy_component(source7);
    			destroy_component(source8);
    			if (if_block2) if_block2.d();
    			destroy_component(footer);
    			if (detaching && section_transition) section_transition.end();
    			mounted = false;
    			dispose();
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
    	let $mediaQuery;
    	validate_store(mediaQuery, "mediaQuery");
    	component_subscribe($$self, mediaQuery, $$value => $$invalidate(0, $mediaQuery = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("About", slots, []);

    	function switchPage(newPage) {
    		page.update(_ => newPage);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		switchPage("contact");
    	};

    	$$self.$capture_state = () => ({
    		Navbar,
    		Footer,
    		Source,
    		page,
    		mediaQuery,
    		fade,
    		switchPage,
    		$mediaQuery
    	});

    	return [$mediaQuery, switchPage, click_handler];
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src\pages\components\work\JobTitle.svelte generated by Svelte v3.32.3 */
    const file$9 = "src\\pages\\components\\work\\JobTitle.svelte";

    // (16:2) {:else}
    function create_else_block_1(ctx) {
    	let div;
    	let p;
    	let t0;
    	let t1;
    	let small;
    	let t2;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			t0 = text(/*duration*/ ctx[2]);
    			t1 = space();
    			small = element("small");
    			t2 = text(/*location*/ ctx[1]);
    			add_location(small, file$9, 17, 32, 513);
    			attr_dev(p, "class", "m-0");
    			add_location(p, file$9, 17, 6, 487);
    			attr_dev(div, "class", "column m-0 pt-0");
    			add_location(div, file$9, 16, 4, 450);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			append_dev(p, small);
    			append_dev(small, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*duration*/ 4) set_data_dev(t0, /*duration*/ ctx[2]);
    			if (dirty & /*location*/ 2) set_data_dev(t2, /*location*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(16:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (12:2) {#if $mediaQuery == "desktop"}
    function create_if_block_2$3(ctx) {
    	let div;
    	let p;
    	let t0;
    	let t1;
    	let small;
    	let t2;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			t0 = text(/*duration*/ ctx[2]);
    			t1 = space();
    			small = element("small");
    			t2 = text(/*location*/ ctx[1]);
    			add_location(small, file$9, 13, 32, 392);
    			attr_dev(p, "class", "m-0");
    			add_location(p, file$9, 13, 6, 366);
    			attr_dev(div, "class", "column m-0 has-text-right");
    			add_location(div, file$9, 12, 4, 319);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			append_dev(p, small);
    			append_dev(small, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*duration*/ 4) set_data_dev(t0, /*duration*/ ctx[2]);
    			if (dirty & /*location*/ 2) set_data_dev(t2, /*location*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$3.name,
    		type: "if",
    		source: "(12:2) {#if $mediaQuery == \\\"desktop\\\"}",
    		ctx
    	});

    	return block;
    }

    // (49:2) {:else}
    function create_else_block$2(ctx) {
    	let div1;
    	let div0;
    	let p;
    	let t;
    	let hr;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			p = element("p");
    			t = space();
    			hr = element("hr");
    			add_location(p, file$9, 51, 6, 1564);
    			attr_dev(hr, "class", "mx-0");
    			set_style(hr, "background-color", "var(--primary)");
    			add_location(hr, file$9, 52, 6, 1577);
    			attr_dev(div0, "class", "column");
    			add_location(div0, file$9, 50, 4, 1536);
    			attr_dev(div1, "class", "columns is-vcentered has-text-centered is-mobile");
    			add_location(div1, file$9, 49, 2, 1468);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, p);
    			append_dev(div0, t);
    			append_dev(div0, hr);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(49:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (37:2) {#if workplace != ""}
    function create_if_block_1$4(ctx) {
    	let div3;
    	let div0;
    	let p0;
    	let t0;
    	let hr0;
    	let t1;
    	let div1;
    	let t2;
    	let t3;
    	let div2;
    	let p1;
    	let t4;
    	let hr1;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			p0 = element("p");
    			t0 = space();
    			hr0 = element("hr");
    			t1 = space();
    			div1 = element("div");
    			t2 = text(/*workplace*/ ctx[3]);
    			t3 = space();
    			div2 = element("div");
    			p1 = element("p");
    			t4 = space();
    			hr1 = element("hr");
    			add_location(p0, file$9, 39, 6, 1191);
    			attr_dev(hr0, "class", "mx-0");
    			set_style(hr0, "background-color", "var(--primary)");
    			add_location(hr0, file$9, 40, 6, 1204);
    			attr_dev(div0, "class", "column");
    			add_location(div0, file$9, 38, 4, 1163);
    			attr_dev(div1, "class", "column is-5");
    			add_location(div1, file$9, 42, 4, 1282);
    			add_location(p1, file$9, 44, 6, 1358);
    			attr_dev(hr1, "class", "mx-0");
    			set_style(hr1, "background-color", "var(--primary)");
    			add_location(hr1, file$9, 45, 6, 1371);
    			attr_dev(div2, "class", "column");
    			add_location(div2, file$9, 43, 4, 1330);
    			attr_dev(div3, "class", "columns is-vcentered has-text-centered is-mobile");
    			add_location(div3, file$9, 37, 2, 1095);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div0, p0);
    			append_dev(div0, t0);
    			append_dev(div0, hr0);
    			append_dev(div3, t1);
    			append_dev(div3, div1);
    			append_dev(div1, t2);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			append_dev(div2, p1);
    			append_dev(div2, t4);
    			append_dev(div2, hr1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*workplace*/ 8) set_data_dev(t2, /*workplace*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(37:2) {#if workplace != \\\"\\\"}",
    		ctx
    	});

    	return block;
    }

    // (24:0) {#if workplace != "" && $mediaQuery != "mobile"}
    function create_if_block$7(ctx) {
    	let div3;
    	let div0;
    	let p0;
    	let t0;
    	let hr0;
    	let t1;
    	let div1;
    	let t2;
    	let t3;
    	let div2;
    	let p1;
    	let t4;
    	let hr1;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			p0 = element("p");
    			t0 = space();
    			hr0 = element("hr");
    			t1 = space();
    			div1 = element("div");
    			t2 = text(/*workplace*/ ctx[3]);
    			t3 = space();
    			div2 = element("div");
    			p1 = element("p");
    			t4 = space();
    			hr1 = element("hr");
    			add_location(p0, file$9, 26, 6, 795);
    			attr_dev(hr0, "class", "mx-0");
    			set_style(hr0, "background-color", "var(--primary)");
    			add_location(hr0, file$9, 27, 6, 808);
    			attr_dev(div0, "class", "column");
    			add_location(div0, file$9, 25, 4, 767);
    			attr_dev(div1, "class", "column is-3");
    			add_location(div1, file$9, 29, 4, 886);
    			add_location(p1, file$9, 31, 6, 962);
    			attr_dev(hr1, "class", "mx-0");
    			set_style(hr1, "background-color", "var(--primary)");
    			add_location(hr1, file$9, 32, 6, 975);
    			attr_dev(div2, "class", "column");
    			add_location(div2, file$9, 30, 4, 934);
    			attr_dev(div3, "class", "columns is-vcentered has-text-centered");
    			add_location(div3, file$9, 24, 2, 709);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div0, p0);
    			append_dev(div0, t0);
    			append_dev(div0, hr0);
    			append_dev(div3, t1);
    			append_dev(div3, div1);
    			append_dev(div1, t2);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			append_dev(div2, p1);
    			append_dev(div2, t4);
    			append_dev(div2, hr1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*workplace*/ 8) set_data_dev(t2, /*workplace*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(24:0) {#if workplace != \\\"\\\" && $mediaQuery != \\\"mobile\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div1;
    	let div0;
    	let h3;
    	let t0;
    	let t1;
    	let t2;
    	let if_block1_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*$mediaQuery*/ ctx[4] == "desktop") return create_if_block_2$3;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*workplace*/ ctx[3] != "" && /*$mediaQuery*/ ctx[4] != "mobile") return create_if_block$7;
    		if (/*workplace*/ ctx[3] != "") return create_if_block_1$4;
    		return create_else_block$2;
    	}

    	let current_block_type_1 = select_block_type_1(ctx);
    	let if_block1 = current_block_type_1(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			h3 = element("h3");
    			t0 = text(/*title*/ ctx[0]);
    			t1 = space();
    			if_block0.c();
    			t2 = space();
    			if_block1.c();
    			if_block1_anchor = empty();
    			attr_dev(h3, "class", "m-0");
    			add_location(h3, file$9, 9, 4, 241);
    			attr_dev(div0, "class", "column m-0");
    			add_location(div0, file$9, 8, 2, 211);
    			attr_dev(div1, "class", "columns m-0 is-vcentered");
    			add_location(div1, file$9, 7, 0, 169);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, h3);
    			append_dev(h3, t0);
    			append_dev(div1, t1);
    			if_block0.m(div1, null);
    			insert_dev(target, t2, anchor);
    			if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*title*/ 1) set_data_dev(t0, /*title*/ ctx[0]);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div1, null);
    				}
    			}

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type_1(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if_block0.d();
    			if (detaching) detach_dev(t2);
    			if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
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
    	let $mediaQuery;
    	validate_store(mediaQuery, "mediaQuery");
    	component_subscribe($$self, mediaQuery, $$value => $$invalidate(4, $mediaQuery = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("JobTitle", slots, []);
    	let { title } = $$props;
    	let { location } = $$props;
    	let { duration } = $$props;
    	let { workplace = "" } = $$props;
    	const writable_props = ["title", "location", "duration", "workplace"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<JobTitle> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("location" in $$props) $$invalidate(1, location = $$props.location);
    		if ("duration" in $$props) $$invalidate(2, duration = $$props.duration);
    		if ("workplace" in $$props) $$invalidate(3, workplace = $$props.workplace);
    	};

    	$$self.$capture_state = () => ({
    		title,
    		location,
    		duration,
    		workplace,
    		mediaQuery,
    		$mediaQuery
    	});

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("location" in $$props) $$invalidate(1, location = $$props.location);
    		if ("duration" in $$props) $$invalidate(2, duration = $$props.duration);
    		if ("workplace" in $$props) $$invalidate(3, workplace = $$props.workplace);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, location, duration, workplace, $mediaQuery];
    }

    class JobTitle extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {
    			title: 0,
    			location: 1,
    			duration: 2,
    			workplace: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "JobTitle",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*title*/ ctx[0] === undefined && !("title" in props)) {
    			console.warn("<JobTitle> was created without expected prop 'title'");
    		}

    		if (/*location*/ ctx[1] === undefined && !("location" in props)) {
    			console.warn("<JobTitle> was created without expected prop 'location'");
    		}

    		if (/*duration*/ ctx[2] === undefined && !("duration" in props)) {
    			console.warn("<JobTitle> was created without expected prop 'duration'");
    		}
    	}

    	get title() {
    		throw new Error("<JobTitle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<JobTitle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get location() {
    		throw new Error("<JobTitle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set location(value) {
    		throw new Error("<JobTitle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get duration() {
    		throw new Error("<JobTitle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set duration(value) {
    		throw new Error("<JobTitle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get workplace() {
    		throw new Error("<JobTitle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set workplace(value) {
    		throw new Error("<JobTitle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\Work.svelte generated by Svelte v3.32.3 */
    const file$a = "src\\pages\\Work.svelte";

    // (11:2) {#if $mediaQuery === "desktop"}
    function create_if_block_2$4(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			set_style(div, "height", "3rem");
    			add_location(div, file$a, 11, 4, 404);
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
    		id: create_if_block_2$4.name,
    		type: "if",
    		source: "(11:2) {#if $mediaQuery === \\\"desktop\\\"}",
    		ctx
    	});

    	return block;
    }

    // (17:4) {#if $mediaQuery === "desktop"}
    function create_if_block_1$5(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "column is-3");
    			add_location(div, file$a, 17, 6, 543);
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
    		id: create_if_block_1$5.name,
    		type: "if",
    		source: "(17:4) {#if $mediaQuery === \\\"desktop\\\"}",
    		ctx
    	});

    	return block;
    }

    // (93:4) {#if $mediaQuery === "desktop"}
    function create_if_block$8(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "column is-3");
    			add_location(div, file$a, 93, 6, 2837);
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
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(93:4) {#if $mediaQuery === \\\"desktop\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let section;
    	let navbar;
    	let t0;
    	let t1;
    	let div2;
    	let t2;
    	let div1;
    	let jobtitle0;
    	let t3;
    	let p0;
    	let t4;
    	let ul1;
    	let li0;
    	let t6;
    	let li1;
    	let t8;
    	let li3;
    	let t9;
    	let a0;
    	let t11;
    	let ul0;
    	let li2;
    	let small;
    	let t13;
    	let div0;
    	let t14;
    	let jobtitle1;
    	let t15;
    	let p1;
    	let t16;
    	let ul2;
    	let li4;
    	let t17;
    	let a1;
    	let t19;
    	let h6;
    	let t21;
    	let li5;
    	let t23;
    	let li6;
    	let t25;
    	let li7;
    	let t27;
    	let t28;
    	let footer;
    	let section_transition;
    	let current;
    	navbar = new Navbar({ $$inline: true });
    	let if_block0 = /*$mediaQuery*/ ctx[0] === "desktop" && create_if_block_2$4(ctx);
    	let if_block1 = /*$mediaQuery*/ ctx[0] === "desktop" && create_if_block_1$5(ctx);

    	jobtitle0 = new JobTitle({
    			props: {
    				title: "Freelance Web Developer",
    				duration: "December 2020 - Present",
    				location: "Cluj-Napoca"
    			},
    			$$inline: true
    		});

    	jobtitle1 = new JobTitle({
    			props: {
    				title: "Internship - Full Stack Developer",
    				duration: "May 2020 - November 2020",
    				location: "Cluj-Napoca",
    				workplace: "Bosch ECC / DPIT Academy"
    			},
    			$$inline: true
    		});

    	let if_block2 = /*$mediaQuery*/ ctx[0] === "desktop" && create_if_block$8(ctx);
    	footer = new Footer({ props: { isFixed: true }, $$inline: true });

    	const block = {
    		c: function create() {
    			section = element("section");
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			div2 = element("div");
    			if (if_block1) if_block1.c();
    			t2 = space();
    			div1 = element("div");
    			create_component(jobtitle0.$$.fragment);
    			t3 = space();
    			p0 = element("p");
    			t4 = space();
    			ul1 = element("ul");
    			li0 = element("li");
    			li0.textContent = "Developing a complete solution for my client’s needs, especially\r\n          mobile-first websites.";
    			t6 = space();
    			li1 = element("li");
    			li1.textContent = "Close collaboration with the clients at every step to make sure that\r\n          I’m on the right path with their wishes.";
    			t8 = space();
    			li3 = element("li");
    			t9 = text("Latest delivered project – ");
    			a0 = element("a");
    			a0.textContent = "davinet.ro";
    			t11 = space();
    			ul0 = element("ul");
    			li2 = element("li");
    			small = element("small");
    			small.textContent = "Built with Svelte as the framework and Bulma for styling (just\r\n                like this website)";
    			t13 = space();
    			div0 = element("div");
    			t14 = space();
    			create_component(jobtitle1.$$.fragment);
    			t15 = space();
    			p1 = element("p");
    			t16 = space();
    			ul2 = element("ul");
    			li4 = element("li");
    			t17 = text("Our team created a product meant to make you feel safe all the time -\r\n          Safe Signal, now known as ");
    			a1 = element("a");
    			a1.textContent = "prisma.ai";
    			t19 = space();
    			h6 = element("h6");
    			h6.textContent = "I worked on:";
    			t21 = space();
    			li5 = element("li");
    			li5.textContent = "Mobile – our app (Flutter) especially on the BLE communication\r\n          (implemented with FlutterBlue) and on the Google Maps & Geocoding\r\n          integration.";
    			t23 = space();
    			li6 = element("li");
    			li6.textContent = "Backend – our API (Flask / MySQL) that was storing data about reports\r\n          in the user’s zone.";
    			t25 = space();
    			li7 = element("li");
    			li7.textContent = "Hardware / Embedded – on the CYBLE-222014 BLE Module firmware (ARM\r\n          Cortex M0) and on the physical design of the bracelet";
    			t27 = space();
    			if (if_block2) if_block2.c();
    			t28 = space();
    			create_component(footer.$$.fragment);
    			attr_dev(p0, "class", "px-3");
    			add_location(p0, file$a, 28, 6, 811);
    			add_location(li0, file$a, 30, 8, 851);
    			add_location(li1, file$a, 34, 8, 990);
    			attr_dev(a0, "target", "_blank");
    			attr_dev(a0, "href", "https://davinet.ro");
    			add_location(a0, file$a, 39, 37, 1194);
    			add_location(small, file$a, 45, 14, 1341);
    			add_location(li2, file$a, 44, 12, 1321);
    			add_location(ul0, file$a, 43, 10, 1303);
    			add_location(li3, file$a, 38, 8, 1151);
    			add_location(ul1, file$a, 29, 6, 837);
    			set_style(div0, "height", "2rem");
    			add_location(div0, file$a, 55, 6, 1594);
    			attr_dev(p1, "class", "px-3");
    			add_location(p1, file$a, 64, 6, 1854);
    			attr_dev(a1, "target", "_blank");
    			attr_dev(a1, "href", "https://github.com/prisma-ai-official");
    			add_location(a1, file$a, 68, 36, 2017);
    			add_location(li4, file$a, 66, 8, 1894);
    			attr_dev(h6, "class", "mt-2 mb-1");
    			add_location(h6, file$a, 73, 8, 2157);
    			add_location(li5, file$a, 74, 8, 2206);
    			add_location(li6, file$a, 79, 8, 2410);
    			add_location(li7, file$a, 83, 8, 2551);
    			add_location(ul2, file$a, 65, 6, 1880);
    			attr_dev(div1, "class", "column");
    			add_location(div1, file$a, 21, 4, 611);
    			attr_dev(div2, "class", "columns m-0");
    			add_location(div2, file$a, 14, 2, 447);
    			attr_dev(section, "class", "content");
    			add_location(section, file$a, 7, 0, 274);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			mount_component(navbar, section, null);
    			append_dev(section, t0);
    			if (if_block0) if_block0.m(section, null);
    			append_dev(section, t1);
    			append_dev(section, div2);
    			if (if_block1) if_block1.m(div2, null);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			mount_component(jobtitle0, div1, null);
    			append_dev(div1, t3);
    			append_dev(div1, p0);
    			append_dev(div1, t4);
    			append_dev(div1, ul1);
    			append_dev(ul1, li0);
    			append_dev(ul1, t6);
    			append_dev(ul1, li1);
    			append_dev(ul1, t8);
    			append_dev(ul1, li3);
    			append_dev(li3, t9);
    			append_dev(li3, a0);
    			append_dev(li3, t11);
    			append_dev(li3, ul0);
    			append_dev(ul0, li2);
    			append_dev(li2, small);
    			append_dev(div1, t13);
    			append_dev(div1, div0);
    			append_dev(div1, t14);
    			mount_component(jobtitle1, div1, null);
    			append_dev(div1, t15);
    			append_dev(div1, p1);
    			append_dev(div1, t16);
    			append_dev(div1, ul2);
    			append_dev(ul2, li4);
    			append_dev(li4, t17);
    			append_dev(li4, a1);
    			append_dev(ul2, t19);
    			append_dev(ul2, h6);
    			append_dev(ul2, t21);
    			append_dev(ul2, li5);
    			append_dev(ul2, t23);
    			append_dev(ul2, li6);
    			append_dev(ul2, t25);
    			append_dev(ul2, li7);
    			append_dev(div2, t27);
    			if (if_block2) if_block2.m(div2, null);
    			append_dev(section, t28);
    			mount_component(footer, section, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$mediaQuery*/ ctx[0] === "desktop") {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_2$4(ctx);
    					if_block0.c();
    					if_block0.m(section, t1);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*$mediaQuery*/ ctx[0] === "desktop") {
    				if (if_block1) ; else {
    					if_block1 = create_if_block_1$5(ctx);
    					if_block1.c();
    					if_block1.m(div2, t2);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*$mediaQuery*/ ctx[0] === "desktop") {
    				if (if_block2) ; else {
    					if_block2 = create_if_block$8(ctx);
    					if_block2.c();
    					if_block2.m(div2, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(jobtitle0.$$.fragment, local);
    			transition_in(jobtitle1.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);

    			add_render_callback(() => {
    				if (!section_transition) section_transition = create_bidirectional_transition(section, fade, { delay: 150, duration: 300 }, true);
    				section_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(jobtitle0.$$.fragment, local);
    			transition_out(jobtitle1.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			if (!section_transition) section_transition = create_bidirectional_transition(section, fade, { delay: 150, duration: 300 }, false);
    			section_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(navbar);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			destroy_component(jobtitle0);
    			destroy_component(jobtitle1);
    			if (if_block2) if_block2.d();
    			destroy_component(footer);
    			if (detaching && section_transition) section_transition.end();
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
    	let $mediaQuery;
    	validate_store(mediaQuery, "mediaQuery");
    	component_subscribe($$self, mediaQuery, $$value => $$invalidate(0, $mediaQuery = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Work", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Work> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Navbar,
    		Footer,
    		JobTitle,
    		mediaQuery,
    		fade,
    		$mediaQuery
    	});

    	return [$mediaQuery];
    }

    class Work extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Work",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src\pages\components\contact\SocialTile.svelte generated by Svelte v3.32.3 */

    const file$b = "src\\pages\\components\\contact\\SocialTile.svelte";

    function create_fragment$b(ctx) {
    	let a;
    	let div3;
    	let div1;
    	let div0;
    	let t0;
    	let div2;
    	let h4;
    	let t1;
    	let t2;
    	let p;
    	let t3;

    	const block = {
    		c: function create() {
    			a = element("a");
    			div3 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div2 = element("div");
    			h4 = element("h4");
    			t1 = text(/*name*/ ctx[0]);
    			t2 = space();
    			p = element("p");
    			t3 = text(/*handle*/ ctx[1]);
    			attr_dev(div0, "class", "icon svelte-10s2k2u");
    			add_location(div0, file$b, 11, 6, 373);
    			attr_dev(div1, "class", "column is-2 has-text-centered mx-auto my-auto");
    			set_style(div1, "color", /*textColor*/ ctx[4]);
    			add_location(div1, file$b, 10, 4, 279);
    			attr_dev(h4, "class", "mb-2");
    			set_style(h4, "color", /*textColor*/ ctx[4]);
    			add_location(h4, file$b, 16, 6, 473);
    			set_style(p, "color", /*textColor*/ ctx[4]);
    			add_location(p, file$b, 17, 6, 536);
    			attr_dev(div2, "class", "column");
    			add_location(div2, file$b, 15, 4, 445);
    			attr_dev(div3, "class", "columns is-mobile");
    			add_location(div3, file$b, 9, 2, 242);
    			attr_dev(a, "href", /*link*/ ctx[2]);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "class", "box has-text-left svelte-10s2k2u");
    			set_style(a, "background-color", /*color*/ ctx[3]);
    			add_location(a, file$b, 8, 0, 147);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, div3);
    			append_dev(div3, div1);
    			append_dev(div1, div0);
    			div0.innerHTML = /*icon*/ ctx[5];
    			append_dev(div3, t0);
    			append_dev(div3, div2);
    			append_dev(div2, h4);
    			append_dev(h4, t1);
    			append_dev(div2, t2);
    			append_dev(div2, p);
    			append_dev(p, t3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*icon*/ 32) div0.innerHTML = /*icon*/ ctx[5];
    			if (dirty & /*textColor*/ 16) {
    				set_style(div1, "color", /*textColor*/ ctx[4]);
    			}

    			if (dirty & /*name*/ 1) set_data_dev(t1, /*name*/ ctx[0]);

    			if (dirty & /*textColor*/ 16) {
    				set_style(h4, "color", /*textColor*/ ctx[4]);
    			}

    			if (dirty & /*handle*/ 2) set_data_dev(t3, /*handle*/ ctx[1]);

    			if (dirty & /*textColor*/ 16) {
    				set_style(p, "color", /*textColor*/ ctx[4]);
    			}

    			if (dirty & /*link*/ 4) {
    				attr_dev(a, "href", /*link*/ ctx[2]);
    			}

    			if (dirty & /*color*/ 8) {
    				set_style(a, "background-color", /*color*/ ctx[3]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
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
    	validate_slots("SocialTile", slots, []);
    	let { name } = $$props;
    	let { handle } = $$props;
    	let { link } = $$props;
    	let { color } = $$props;
    	let { textColor } = $$props;
    	let { icon } = $$props;
    	const writable_props = ["name", "handle", "link", "color", "textColor", "icon"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SocialTile> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("handle" in $$props) $$invalidate(1, handle = $$props.handle);
    		if ("link" in $$props) $$invalidate(2, link = $$props.link);
    		if ("color" in $$props) $$invalidate(3, color = $$props.color);
    		if ("textColor" in $$props) $$invalidate(4, textColor = $$props.textColor);
    		if ("icon" in $$props) $$invalidate(5, icon = $$props.icon);
    	};

    	$$self.$capture_state = () => ({
    		name,
    		handle,
    		link,
    		color,
    		textColor,
    		icon
    	});

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("handle" in $$props) $$invalidate(1, handle = $$props.handle);
    		if ("link" in $$props) $$invalidate(2, link = $$props.link);
    		if ("color" in $$props) $$invalidate(3, color = $$props.color);
    		if ("textColor" in $$props) $$invalidate(4, textColor = $$props.textColor);
    		if ("icon" in $$props) $$invalidate(5, icon = $$props.icon);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, handle, link, color, textColor, icon];
    }

    class SocialTile extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {
    			name: 0,
    			handle: 1,
    			link: 2,
    			color: 3,
    			textColor: 4,
    			icon: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SocialTile",
    			options,
    			id: create_fragment$b.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !("name" in props)) {
    			console.warn("<SocialTile> was created without expected prop 'name'");
    		}

    		if (/*handle*/ ctx[1] === undefined && !("handle" in props)) {
    			console.warn("<SocialTile> was created without expected prop 'handle'");
    		}

    		if (/*link*/ ctx[2] === undefined && !("link" in props)) {
    			console.warn("<SocialTile> was created without expected prop 'link'");
    		}

    		if (/*color*/ ctx[3] === undefined && !("color" in props)) {
    			console.warn("<SocialTile> was created without expected prop 'color'");
    		}

    		if (/*textColor*/ ctx[4] === undefined && !("textColor" in props)) {
    			console.warn("<SocialTile> was created without expected prop 'textColor'");
    		}

    		if (/*icon*/ ctx[5] === undefined && !("icon" in props)) {
    			console.warn("<SocialTile> was created without expected prop 'icon'");
    		}
    	}

    	get name() {
    		throw new Error("<SocialTile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<SocialTile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get handle() {
    		throw new Error("<SocialTile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set handle(value) {
    		throw new Error("<SocialTile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get link() {
    		throw new Error("<SocialTile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set link(value) {
    		throw new Error("<SocialTile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<SocialTile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<SocialTile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get textColor() {
    		throw new Error("<SocialTile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set textColor(value) {
    		throw new Error("<SocialTile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icon() {
    		throw new Error("<SocialTile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<SocialTile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\components\contact\Socials.svelte generated by Svelte v3.32.3 */
    const file$c = "src\\pages\\components\\contact\\Socials.svelte";

    function create_fragment$c(ctx) {
    	let div2;
    	let div0;
    	let socialtile0;
    	let t0;
    	let socialtile1;
    	let t1;
    	let div1;
    	let socialtile2;
    	let t2;
    	let socialtile3;
    	let current;

    	socialtile0 = new SocialTile({
    			props: {
    				name: "LinkedIn",
    				handle: "davidpescariu",
    				link: "https://www.linkedin.com/in/davidpescariu/",
    				color: "#0A66C2",
    				textColor: "white",
    				icon: /*icons*/ ctx[0].linkedin
    			},
    			$$inline: true
    		});

    	socialtile1 = new SocialTile({
    			props: {
    				name: "Discord",
    				handle: "@dvp #4408",
    				link: "https://discord.com/",
    				color: "#677BC4",
    				textColor: "white",
    				icon: /*icons*/ ctx[0].discord
    			},
    			$$inline: true
    		});

    	socialtile2 = new SocialTile({
    			props: {
    				name: "Twitter",
    				handle: "@DPescariu",
    				link: "https://twitter.com/DPescariu",
    				color: "#1A91DA",
    				textColor: "white",
    				icon: /*icons*/ ctx[0].twitter
    			},
    			$$inline: true
    		});

    	socialtile3 = new SocialTile({
    			props: {
    				name: "Instagram",
    				handle: "@david.pescariu",
    				link: "https://www.instagram.com/david.pescariu/",
    				color: "#CF3F61",
    				textColor: "white",
    				icon: /*icons*/ ctx[0].instagram
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			create_component(socialtile0.$$.fragment);
    			t0 = space();
    			create_component(socialtile1.$$.fragment);
    			t1 = space();
    			div1 = element("div");
    			create_component(socialtile2.$$.fragment);
    			t2 = space();
    			create_component(socialtile3.$$.fragment);
    			attr_dev(div0, "class", "column");
    			add_location(div0, file$c, 10, 2, 4196);
    			attr_dev(div1, "class", "column");
    			add_location(div1, file$c, 28, 2, 4627);
    			attr_dev(div2, "class", "columns");
    			add_location(div2, file$c, 9, 0, 4171);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			mount_component(socialtile0, div0, null);
    			append_dev(div0, t0);
    			mount_component(socialtile1, div0, null);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			mount_component(socialtile2, div1, null);
    			append_dev(div1, t2);
    			mount_component(socialtile3, div1, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(socialtile0.$$.fragment, local);
    			transition_in(socialtile1.$$.fragment, local);
    			transition_in(socialtile2.$$.fragment, local);
    			transition_in(socialtile3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(socialtile0.$$.fragment, local);
    			transition_out(socialtile1.$$.fragment, local);
    			transition_out(socialtile2.$$.fragment, local);
    			transition_out(socialtile3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(socialtile0);
    			destroy_component(socialtile1);
    			destroy_component(socialtile2);
    			destroy_component(socialtile3);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Socials", slots, []);

    	const icons = {
    		twitter: `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"/></svg>`,
    		linkedin: `<svg aria-hidden="true" data-prefix="fab" data-icon="linkedin" class="svg-inline--fa fa-linkedin fa-w-14" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z"/></svg>`,
    		discord: `<svg aria-hidden="true" data-prefix="fab" data-icon="discord" class="svg-inline--fa fa-discord fa-w-14" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M297.216 243.2c0 15.616-11.52 28.416-26.112 28.416-14.336 0-26.112-12.8-26.112-28.416s11.52-28.416 26.112-28.416c14.592 0 26.112 12.8 26.112 28.416zm-119.552-28.416c-14.592 0-26.112 12.8-26.112 28.416s11.776 28.416 26.112 28.416c14.592 0 26.112-12.8 26.112-28.416.256-15.616-11.52-28.416-26.112-28.416zM448 52.736V512c-64.494-56.994-43.868-38.128-118.784-107.776l13.568 47.36H52.48C23.552 451.584 0 428.032 0 398.848V52.736C0 23.552 23.552 0 52.48 0h343.04C424.448 0 448 23.552 448 52.736zm-72.96 242.688c0-82.432-36.864-149.248-36.864-149.248-36.864-27.648-71.936-26.88-71.936-26.88l-3.584 4.096c43.52 13.312 63.744 32.512 63.744 32.512-60.811-33.329-132.244-33.335-191.232-7.424-9.472 4.352-15.104 7.424-15.104 7.424s21.248-20.224 67.328-33.536l-2.56-3.072s-35.072-.768-71.936 26.88c0 0-36.864 66.816-36.864 149.248 0 0 21.504 37.12 78.08 38.912 0 0 9.472-11.52 17.152-21.248-32.512-9.728-44.8-30.208-44.8-30.208 3.766 2.636 9.976 6.053 10.496 6.4 43.21 24.198 104.588 32.126 159.744 8.96 8.96-3.328 18.944-8.192 29.44-15.104 0 0-12.8 20.992-46.336 30.464 7.68 9.728 16.896 20.736 16.896 20.736 56.576-1.792 78.336-38.912 78.336-38.912z"/></svg>`,
    		instagram: `<svg aria-hidden="true" data-prefix="fab" data-icon="instagram" class="svg-inline--fa fa-instagram fa-w-14" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/></svg>`
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Socials> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ SocialTile, icons });
    	return [icons];
    }

    class Socials extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Socials",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src\pages\components\contact\Form.svelte generated by Svelte v3.32.3 */
    const file$d = "src\\pages\\components\\contact\\Form.svelte";

    // (82:2) {#if hasError}
    function create_if_block$9(ctx) {
    	let p;
    	let t;
    	let p_transition;
    	let current;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(/*errorText*/ ctx[3]);
    			attr_dev(p, "class", "mt-1 has-text-danger");
    			add_location(p, file$d, 82, 4, 2256);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*errorText*/ 8) set_data_dev(t, /*errorText*/ ctx[3]);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!p_transition) p_transition = create_bidirectional_transition(p, fade, { duration: 100 }, true);
    				p_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!p_transition) p_transition = create_bidirectional_transition(p, fade, { duration: 100 }, false);
    			p_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching && p_transition) p_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$9.name,
    		type: "if",
    		source: "(82:2) {#if hasError}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let div4;
    	let div0;
    	let input;
    	let t0;
    	let p0;
    	let t1_value = /*subject*/ ctx[0].length + "";
    	let t1;
    	let t2;
    	let strong0;
    	let t4;
    	let div1;
    	let t5;
    	let div2;
    	let textarea;
    	let t6;
    	let p1;
    	let t7_value = /*message*/ ctx[1].length + "";
    	let t7;
    	let t8;
    	let strong1;
    	let t10;
    	let div3;
    	let t11;
    	let button;
    	let svg;
    	let path;
    	let t12;
    	let span;
    	let t14;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*hasError*/ ctx[2] && create_if_block$9(ctx);

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			input = element("input");
    			t0 = space();
    			p0 = element("p");
    			t1 = text(t1_value);
    			t2 = text(" / ");
    			strong0 = element("strong");
    			strong0.textContent = "100";
    			t4 = space();
    			div1 = element("div");
    			t5 = space();
    			div2 = element("div");
    			textarea = element("textarea");
    			t6 = space();
    			p1 = element("p");
    			t7 = text(t7_value);
    			t8 = text(" / ");
    			strong1 = element("strong");
    			strong1.textContent = "1000";
    			t10 = space();
    			div3 = element("div");
    			t11 = space();
    			button = element("button");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t12 = space();
    			span = element("span");
    			span.textContent = "Send";
    			t14 = space();
    			if (if_block) if_block.c();
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "input is-rounded");
    			attr_dev(input, "placeholder", "Subject");
    			add_location(input, file$d, 44, 4, 1150);
    			add_location(strong0, file$d, 50, 44, 1318);
    			attr_dev(p0, "class", "help ml-1");
    			add_location(p0, file$d, 50, 4, 1278);
    			attr_dev(div0, "class", "field has-text-left");
    			add_location(div0, file$d, 43, 2, 1111);
    			set_style(div1, "height", "1rem");
    			add_location(div1, file$d, 53, 2, 1358);
    			attr_dev(textarea, "class", "textarea has-fixed-size svelte-1n7bpmb");
    			attr_dev(textarea, "placeholder", "Your message");
    			add_location(textarea, file$d, 56, 4, 1431);
    			add_location(strong1, file$d, 61, 44, 1595);
    			attr_dev(p1, "class", "help ml-1");
    			add_location(p1, file$d, 61, 4, 1555);
    			attr_dev(div2, "class", "field has-text-left");
    			add_location(div2, file$d, 55, 2, 1392);
    			set_style(div3, "height", "1rem");
    			add_location(div3, file$d, 64, 2, 1636);
    			attr_dev(path, "fill", "currentColor");
    			attr_dev(path, "d", "M476 3.2L12.5 270.6c-18.1 10.4-15.8 35.6 2.2 43.2L121 358.4l287.3-253.2c5.5-4.9 13.3 2.6 8.6 8.3L176 407v80.5c0 23.6 28.5 32.9 42.5 15.8L282 426l124.6 52.2c14.2 6 30.4-2.9 33-18.2l72-432C515 7.8 493.3-6.8 476 3.2z");
    			add_location(path, file$d, 73, 7, 1911);
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "class", "icon");
    			set_style(svg, "padding", "0.2rem");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 512 512");
    			add_location(svg, file$d, 67, 4, 1750);
    			add_location(span, file$d, 78, 4, 2200);
    			attr_dev(button, "class", "button is-primary is-fullwidth is-rounded");
    			add_location(button, file$d, 66, 2, 1670);
    			attr_dev(div4, "class", "control");
    			add_location(div4, file$d, 42, 0, 1086);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);
    			append_dev(div0, input);
    			set_input_value(input, /*subject*/ ctx[0]);
    			append_dev(div0, t0);
    			append_dev(div0, p0);
    			append_dev(p0, t1);
    			append_dev(p0, t2);
    			append_dev(p0, strong0);
    			append_dev(div4, t4);
    			append_dev(div4, div1);
    			append_dev(div4, t5);
    			append_dev(div4, div2);
    			append_dev(div2, textarea);
    			set_input_value(textarea, /*message*/ ctx[1]);
    			append_dev(div2, t6);
    			append_dev(div2, p1);
    			append_dev(p1, t7);
    			append_dev(p1, t8);
    			append_dev(p1, strong1);
    			append_dev(div4, t10);
    			append_dev(div4, div3);
    			append_dev(div4, t11);
    			append_dev(div4, button);
    			append_dev(button, svg);
    			append_dev(svg, path);
    			append_dev(button, t12);
    			append_dev(button, span);
    			append_dev(div4, t14);
    			if (if_block) if_block.m(div4, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[5]),
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[6]),
    					listen_dev(button, "click", /*send*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*subject*/ 1 && input.value !== /*subject*/ ctx[0]) {
    				set_input_value(input, /*subject*/ ctx[0]);
    			}

    			if ((!current || dirty & /*subject*/ 1) && t1_value !== (t1_value = /*subject*/ ctx[0].length + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*message*/ 2) {
    				set_input_value(textarea, /*message*/ ctx[1]);
    			}

    			if ((!current || dirty & /*message*/ 2) && t7_value !== (t7_value = /*message*/ ctx[1].length + "")) set_data_dev(t7, t7_value);

    			if (/*hasError*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*hasError*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$9(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div4, null);
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
    			if (detaching) detach_dev(div4);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Form", slots, []);
    	let subject = "";
    	let message = "";
    	let lastValidS;
    	let lastValidM;
    	let hasError = false;
    	let errorText = "";

    	function validate() {
    		if (subject.length <= 100) {
    			lastValidS = subject;
    		} else {
    			$$invalidate(0, subject = lastValidS);
    		}

    		if (message.length <= 1000) {
    			lastValidM = message;
    		} else {
    			$$invalidate(1, message = lastValidM);
    		}
    	}

    	function send() {
    		if (subject.length === 0 && message.length === 0) {
    			$$invalidate(3, errorText = "Yes, the button does indeed work :)");
    			$$invalidate(2, hasError = true);
    		} else if (subject.length === 0) {
    			$$invalidate(3, errorText = "I think you forgot the subject!");
    			$$invalidate(2, hasError = true);
    		} else if (message.length === 0) {
    			$$invalidate(3, errorText = "Nothing to tell me?");
    			$$invalidate(2, hasError = true);
    		} else {
    			const messageToSend = message.replaceAll("\n", "%0A");
    			window.open(`mailto:davidpescariu12@gmail.com?subject=${subject}&body=${messageToSend}`);
    		}
    	}

    	setInterval(validate, 100);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Form> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		subject = this.value;
    		$$invalidate(0, subject);
    	}

    	function textarea_input_handler() {
    		message = this.value;
    		$$invalidate(1, message);
    	}

    	$$self.$capture_state = () => ({
    		fade,
    		subject,
    		message,
    		lastValidS,
    		lastValidM,
    		hasError,
    		errorText,
    		validate,
    		send
    	});

    	$$self.$inject_state = $$props => {
    		if ("subject" in $$props) $$invalidate(0, subject = $$props.subject);
    		if ("message" in $$props) $$invalidate(1, message = $$props.message);
    		if ("lastValidS" in $$props) lastValidS = $$props.lastValidS;
    		if ("lastValidM" in $$props) lastValidM = $$props.lastValidM;
    		if ("hasError" in $$props) $$invalidate(2, hasError = $$props.hasError);
    		if ("errorText" in $$props) $$invalidate(3, errorText = $$props.errorText);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		subject,
    		message,
    		hasError,
    		errorText,
    		send,
    		input_input_handler,
    		textarea_input_handler
    	];
    }

    class Form extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Form",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src\pages\Contact.svelte generated by Svelte v3.32.3 */
    const file$e = "src\\pages\\Contact.svelte";

    // (12:2) {#if $mediaQuery === "desktop"}
    function create_if_block_2$5(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			set_style(div, "height", "3rem");
    			add_location(div, file$e, 12, 4, 459);
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
    		id: create_if_block_2$5.name,
    		type: "if",
    		source: "(12:2) {#if $mediaQuery === \\\"desktop\\\"}",
    		ctx
    	});

    	return block;
    }

    // (18:4) {#if $mediaQuery === "desktop"}
    function create_if_block_1$6(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "column is-3");
    			add_location(div, file$e, 18, 6, 616);
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
    		id: create_if_block_1$6.name,
    		type: "if",
    		source: "(18:4) {#if $mediaQuery === \\\"desktop\\\"}",
    		ctx
    	});

    	return block;
    }

    // (37:4) {#if $mediaQuery === "desktop"}
    function create_if_block$a(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "column is-3");
    			add_location(div, file$e, 37, 6, 1147);
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
    		id: create_if_block$a.name,
    		type: "if",
    		source: "(37:4) {#if $mediaQuery === \\\"desktop\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let section;
    	let navbar;
    	let t0;
    	let t1;
    	let div2;
    	let t2;
    	let div1;
    	let h30;
    	let t4;
    	let hr0;
    	let t5;
    	let socials;
    	let t6;
    	let div0;
    	let t7;
    	let h31;
    	let t9;
    	let h6;
    	let a;
    	let t11;
    	let hr1;
    	let t12;
    	let form;
    	let t13;
    	let t14;
    	let footer;
    	let section_transition;
    	let current;
    	navbar = new Navbar({ $$inline: true });
    	let if_block0 = /*$mediaQuery*/ ctx[0] === "desktop" && create_if_block_2$5(ctx);
    	let if_block1 = /*$mediaQuery*/ ctx[0] === "desktop" && create_if_block_1$6(ctx);
    	socials = new Socials({ $$inline: true });
    	form = new Form({ $$inline: true });
    	let if_block2 = /*$mediaQuery*/ ctx[0] === "desktop" && create_if_block$a(ctx);
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			section = element("section");
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			div2 = element("div");
    			if (if_block1) if_block1.c();
    			t2 = space();
    			div1 = element("div");
    			h30 = element("h3");
    			h30.textContent = "You can find me here";
    			t4 = space();
    			hr0 = element("hr");
    			t5 = space();
    			create_component(socials.$$.fragment);
    			t6 = space();
    			div0 = element("div");
    			t7 = space();
    			h31 = element("h3");
    			h31.textContent = "Send me an email";
    			t9 = space();
    			h6 = element("h6");
    			a = element("a");
    			a.textContent = "davidpescariu12@gmail.com";
    			t11 = space();
    			hr1 = element("hr");
    			t12 = space();
    			create_component(form.$$.fragment);
    			t13 = space();
    			if (if_block2) if_block2.c();
    			t14 = space();
    			create_component(footer.$$.fragment);
    			add_location(h30, file$e, 23, 6, 712);
    			set_style(hr0, "background-color", "var(--primary)");
    			add_location(hr0, file$e, 24, 6, 749);
    			set_style(div0, "height", "1rem");
    			add_location(div0, file$e, 27, 6, 825);
    			attr_dev(h31, "class", "mb-1");
    			add_location(h31, file$e, 29, 6, 863);
    			attr_dev(a, "href", "mailto:davidpescariu12@gmail.com");
    			add_location(a, file$e, 30, 10, 913);
    			add_location(h6, file$e, 30, 6, 909);
    			set_style(hr1, "background-color", "var(--primary)");
    			add_location(hr1, file$e, 31, 6, 998);
    			attr_dev(div1, "class", "column");
    			add_location(div1, file$e, 22, 4, 684);
    			attr_dev(div2, "class", "columns m-0 has-text-centered");
    			add_location(div2, file$e, 15, 2, 502);
    			attr_dev(section, "class", "content");
    			add_location(section, file$e, 8, 0, 329);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			mount_component(navbar, section, null);
    			append_dev(section, t0);
    			if (if_block0) if_block0.m(section, null);
    			append_dev(section, t1);
    			append_dev(section, div2);
    			if (if_block1) if_block1.m(div2, null);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, h30);
    			append_dev(div1, t4);
    			append_dev(div1, hr0);
    			append_dev(div1, t5);
    			mount_component(socials, div1, null);
    			append_dev(div1, t6);
    			append_dev(div1, div0);
    			append_dev(div1, t7);
    			append_dev(div1, h31);
    			append_dev(div1, t9);
    			append_dev(div1, h6);
    			append_dev(h6, a);
    			append_dev(div1, t11);
    			append_dev(div1, hr1);
    			append_dev(div1, t12);
    			mount_component(form, div1, null);
    			append_dev(div2, t13);
    			if (if_block2) if_block2.m(div2, null);
    			append_dev(section, t14);
    			mount_component(footer, section, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$mediaQuery*/ ctx[0] === "desktop") {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_2$5(ctx);
    					if_block0.c();
    					if_block0.m(section, t1);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*$mediaQuery*/ ctx[0] === "desktop") {
    				if (if_block1) ; else {
    					if_block1 = create_if_block_1$6(ctx);
    					if_block1.c();
    					if_block1.m(div2, t2);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*$mediaQuery*/ ctx[0] === "desktop") {
    				if (if_block2) ; else {
    					if_block2 = create_if_block$a(ctx);
    					if_block2.c();
    					if_block2.m(div2, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(socials.$$.fragment, local);
    			transition_in(form.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);

    			add_render_callback(() => {
    				if (!section_transition) section_transition = create_bidirectional_transition(section, fade, { delay: 150, duration: 300 }, true);
    				section_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(socials.$$.fragment, local);
    			transition_out(form.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			if (!section_transition) section_transition = create_bidirectional_transition(section, fade, { delay: 150, duration: 300 }, false);
    			section_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(navbar);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			destroy_component(socials);
    			destroy_component(form);
    			if (if_block2) if_block2.d();
    			destroy_component(footer);
    			if (detaching && section_transition) section_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let $mediaQuery;
    	validate_store(mediaQuery, "mediaQuery");
    	component_subscribe($$self, mediaQuery, $$value => $$invalidate(0, $mediaQuery = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Contact", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Contact> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Navbar,
    		Footer,
    		Socials,
    		Form,
    		fade,
    		mediaQuery,
    		$mediaQuery
    	});

    	return [$mediaQuery];
    }

    class Contact extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Contact",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src\pages\components\Consent.svelte generated by Svelte v3.32.3 */

    const file$f = "src\\pages\\components\\Consent.svelte";

    function create_fragment$f(ctx) {
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
    			add_location(strong, file$f, 4, 8, 169);
    			attr_dev(a, "href", "https://www.cookiesandyou.com/");
    			add_location(a, file$f, 6, 4, 300);
    			attr_dev(div0, "class", "column is-three-quarters");
    			add_location(div0, file$f, 3, 6, 121);
    			attr_dev(button0, "class", "button is-danger is-outlined");
    			add_location(button0, file$f, 9, 8, 436);
    			attr_dev(button1, "class", "button is-primary is-outlined");
    			add_location(button1, file$f, 10, 8, 504);
    			attr_dev(div1, "class", "column");
    			add_location(div1, file$f, 8, 6, 406);
    			attr_dev(div2, "class", "columns is-vcentered");
    			add_location(div2, file$f, 2, 4, 79);
    			attr_dev(div3, "class", "message-body");
    			add_location(div3, file$f, 1, 2, 47);
    			attr_dev(article, "class", "consent message is-danger svelte-1win8lw");
    			add_location(article, file$f, 0, 0, 0);
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
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props) {
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
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Consent",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* src\utils\MediaQuery.svelte generated by Svelte v3.32.3 */
    const get_default_slot_changes = dirty => ({ matches: dirty & /*matches*/ 1 });
    const get_default_slot_context = ctx => ({ matches: /*matches*/ ctx[0] });

    function create_fragment$g(ctx) {
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
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, { query: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MediaQuery",
    			options,
    			id: create_fragment$g.name
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

    function create_fragment$h(ctx) {
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
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("UpdateMQ", slots, []);
    	let { newMediaQuery } = $$props;
    	console.debug(`[MediaQuery] Update: ${newMediaQuery}`);

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
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, { newMediaQuery: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "UpdateMQ",
    			options,
    			id: create_fragment$h.name
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
    const file$g = "src\\App.svelte";

    // (41:4) {#if matches}
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
    		source: "(41:4) {#if matches}",
    		ctx
    	});

    	return block;
    }

    // (40:2) <MediaQuery query="(min-width: 1024px)" let:matches>
    function create_default_slot_2(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*matches*/ ctx[4] && create_if_block_6(ctx);

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
    			if (/*matches*/ ctx[4]) {
    				if (if_block) {
    					if (dirty & /*matches*/ 16) {
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
    		source: "(40:2) <MediaQuery query=\\\"(min-width: 1024px)\\\" let:matches>",
    		ctx
    	});

    	return block;
    }

    // (46:4) {#if matches}
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
    		source: "(46:4) {#if matches}",
    		ctx
    	});

    	return block;
    }

    // (45:2) <MediaQuery query="(min-width: 769px) and (max-width: 1023px)" let:matches>
    function create_default_slot_1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*matches*/ ctx[4] && create_if_block_5(ctx);

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
    			if (/*matches*/ ctx[4]) {
    				if (if_block) {
    					if (dirty & /*matches*/ 16) {
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
    		source: "(45:2) <MediaQuery query=\\\"(min-width: 769px) and (max-width: 1023px)\\\" let:matches>",
    		ctx
    	});

    	return block;
    }

    // (51:4) {#if matches}
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
    		source: "(51:4) {#if matches}",
    		ctx
    	});

    	return block;
    }

    // (50:2) <MediaQuery query="(max-width: 768px)" let:matches>
    function create_default_slot(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*matches*/ ctx[4] && create_if_block_4(ctx);

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
    			if (/*matches*/ ctx[4]) {
    				if (if_block) {
    					if (dirty & /*matches*/ 16) {
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
    		source: "(50:2) <MediaQuery query=\\\"(max-width: 768px)\\\" let:matches>",
    		ctx
    	});

    	return block;
    }

    // (63:2) {:else}
    function create_else_block$3(ctx) {
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
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(63:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (61:32) 
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
    		source: "(61:32) ",
    		ctx
    	});

    	return block;
    }

    // (59:29) 
    function create_if_block_2$6(ctx) {
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
    		id: create_if_block_2$6.name,
    		type: "if",
    		source: "(59:29) ",
    		ctx
    	});

    	return block;
    }

    // (57:2) {#if $page === "about"}
    function create_if_block_1$7(ctx) {
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
    		id: create_if_block_1$7.name,
    		type: "if",
    		source: "(57:2) {#if $page === \\\"about\\\"}",
    		ctx
    	});

    	return block;
    }

    // (68:2) {#if showConsentPrompt}
    function create_if_block$b(ctx) {
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
    		id: create_if_block$b.name,
    		type: "if",
    		source: "(68:2) {#if showConsentPrompt}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
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
    						({ matches }) => ({ 4: matches }),
    						({ matches }) => matches ? 16 : 0
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
    						({ matches }) => ({ 4: matches }),
    						({ matches }) => matches ? 16 : 0
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
    						({ matches }) => ({ 4: matches }),
    						({ matches }) => matches ? 16 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const if_block_creators = [create_if_block_1$7, create_if_block_2$6, create_if_block_3$1, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$page*/ ctx[0] === "about") return 0;
    		if (/*$page*/ ctx[0] === "work") return 1;
    		if (/*$page*/ ctx[0] === "contact") return 2;
    		return 3;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	let if_block1 = /*showConsentPrompt*/ ctx[1] && create_if_block$b(ctx);

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
    			add_location(div, file$g, 37, 0, 1310);
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

    			if (dirty & /*$$scope, matches*/ 48) {
    				mediaquery0_changes.$$scope = { dirty, ctx };
    			}

    			mediaquery0.$set(mediaquery0_changes);
    			const mediaquery1_changes = {};

    			if (dirty & /*$$scope, matches*/ 48) {
    				mediaquery1_changes.$$scope = { dirty, ctx };
    			}

    			mediaquery1.$set(mediaquery1_changes);
    			const mediaquery2_changes = {};

    			if (dirty & /*$$scope, matches*/ 48) {
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
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let $page;
    	validate_store(page, "page");
    	component_subscribe($$self, page, $$value => $$invalidate(0, $page = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let loaded = false;
    	let showConsentPrompt = false;

    	// Remove safe-text because the script loaded sucesfully
    	document.getElementById("safe-text").remove();

    	/**
     * If there is a page in the URL, switch to it. (only on inital load)
     *
     * @example /?contact will switch to the contacts page.
     */
    	function reactToURL() {
    		if (!loaded) {
    			const splitUrl = window.location.href.split("/");
    			let urlPage = splitUrl[splitUrl.length - 1];
    			if (urlPage.length == 0) return; // No page in url, exit
    			urlPage = urlPage.replace(/\?*\#*/gm, "");
    			switchPage(urlPage);
    		}
    	}

    	reactToURL();

    	// TODO: Made this in advance, uncomment when google analytics is implemented
    	// let consent = CookieManager.getCookie("acceptedCookies");
    	// if (consent !== null) {
    	//   showConsentPrompt = false;
    	// }
    	loaded = true;

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		loaded,
    		showConsentPrompt,
    		page,
    		switchPage,
    		Home,
    		About,
    		Work,
    		Contact,
    		Consent,
    		MediaQuery,
    		UpdateMQ,
    		reactToURL,
    		$page
    	});

    	$$self.$inject_state = $$props => {
    		if ("loaded" in $$props) loaded = $$props.loaded;
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
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$i.name
    		});
    	}
    }

    const app = new App({
        target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
