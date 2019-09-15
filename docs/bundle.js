
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
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
        else
            node.setAttribute(attribute, value);
    }
    function set_svg_attributes(node, attributes) {
        for (const key in attributes) {
            attr(node, key, attributes[key]);
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
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
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_update);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
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

    const globals = (typeof window !== 'undefined' ? window : global);

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

    function bind(component, name, callback) {
        if (component.$$.props.indexOf(name) === -1)
            return;
        component.$$.bound[name] = callback;
        callback(component.$$.ctx[name]);
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment.m(target, anchor);
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
        if (component.$$.fragment) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
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
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, ret, value = ret) => {
                if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
                return ret;
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_update);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    let SvelteElement;
    if (typeof HTMLElement !== 'undefined') {
        SvelteElement = class extends HTMLElement {
            constructor() {
                super();
                this.attachShadow({ mode: 'open' });
            }
            connectedCallback() {
                // @ts-ignore todo: improve typings
                for (const key in this.$$.slotted) {
                    // @ts-ignore todo: improve typings
                    this.appendChild(this.$$.slotted[key]);
                }
            }
            attributeChangedCallback(attr, _oldValue, newValue) {
                this[attr] = newValue;
            }
            $destroy() {
                destroy_component(this, 1);
                this.$destroy = noop;
            }
            $on(type, callback) {
                // TODO should this delegate to addEventListener?
                const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
                callbacks.push(callback);
                return () => {
                    const index = callbacks.indexOf(callback);
                    if (index !== -1)
                        callbacks.splice(index, 1);
                };
            }
            $set() {
                // overridden by instance, if it has props
            }
        };
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
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, detail));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /* src\InputField.svelte generated by Svelte v3.12.1 */

    const file = "src\\InputField.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.option = list[i];
    	return child_ctx;
    }

    // (24:1) {:else}
    function create_else_block(ctx) {
    	var select, dispose;

    	let each_value = ctx.options;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			if (ctx.value === void 0) add_render_callback(() => ctx.select_change_handler.call(select));
    			attr_dev(select, "class", "svelte-13hecza");
    			add_location(select, file, 24, 1, 579);
    			dispose = listen_dev(select, "change", ctx.select_change_handler);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, ctx.value);
    		},

    		p: function update(changed, ctx) {
    			if (changed.options) {
    				each_value = ctx.options;

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}

    			if (changed.value) select_option(select, ctx.value);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(select);
    			}

    			destroy_each(each_blocks, detaching);

    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block.name, type: "else", source: "(24:1) {:else}", ctx });
    	return block;
    }

    // (19:1) {#if type !== TYPE_OPTIONS}
    function create_if_block(ctx) {
    	var t0, input, t1, t2, if_block2_anchor, dispose;

    	var if_block0 = (ctx.type === TYPE_DOLLAR) && create_if_block_3(ctx);

    	var if_block1 = (ctx.type === TYPE_PERCENT) && create_if_block_2(ctx);

    	var if_block2 = (ctx.type === TYPE_YEAR) && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			input = element("input");
    			t1 = space();
    			if (if_block1) if_block1.c();
    			t2 = space();
    			if (if_block2) if_block2.c();
    			if_block2_anchor = empty();
    			attr_dev(input, "placeholder", ctx.placeholder);
    			attr_dev(input, "class", "svelte-13hecza");
    			add_location(input, file, 20, 1, 417);
    			dispose = listen_dev(input, "input", ctx.input_input_handler);
    		},

    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, input, anchor);

    			set_input_value(input, ctx.value);

    			insert_dev(target, t1, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, if_block2_anchor, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (ctx.type === TYPE_DOLLAR) {
    				if (!if_block0) {
    					if_block0 = create_if_block_3(ctx);
    					if_block0.c();
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (changed.value && (input.value !== ctx.value)) set_input_value(input, ctx.value);

    			if (changed.placeholder) {
    				attr_dev(input, "placeholder", ctx.placeholder);
    			}

    			if (ctx.type === TYPE_PERCENT) {
    				if (!if_block1) {
    					if_block1 = create_if_block_2(ctx);
    					if_block1.c();
    					if_block1.m(t2.parentNode, t2);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (ctx.type === TYPE_YEAR) {
    				if (!if_block2) {
    					if_block2 = create_if_block_1(ctx);
    					if_block2.c();
    					if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},

    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);

    			if (detaching) {
    				detach_dev(t0);
    				detach_dev(input);
    				detach_dev(t1);
    			}

    			if (if_block1) if_block1.d(detaching);

    			if (detaching) {
    				detach_dev(t2);
    			}

    			if (if_block2) if_block2.d(detaching);

    			if (detaching) {
    				detach_dev(if_block2_anchor);
    			}

    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block.name, type: "if", source: "(19:1) {#if type !== TYPE_OPTIONS}", ctx });
    	return block;
    }

    // (26:2) {#each options as option}
    function create_each_block(ctx) {
    	var option, t_value = ctx.option.title + "", t, option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = ctx.option.value;
    			option.value = option.__value;
    			attr_dev(option, "class", "svelte-13hecza");
    			add_location(option, file, 26, 2, 637);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.options) && t_value !== (t_value = ctx.option.title + "")) {
    				set_data_dev(t, t_value);
    			}

    			if ((changed.options) && option_value_value !== (option_value_value = ctx.option.value)) {
    				prop_dev(option, "__value", option_value_value);
    			}

    			option.value = option.__value;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(option);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block.name, type: "each", source: "(26:2) {#each options as option}", ctx });
    	return block;
    }

    // (20:1) {#if type === TYPE_DOLLAR}
    function create_if_block_3(ctx) {
    	var span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "$";
    			add_location(span, file, 19, 27, 396);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(span);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_3.name, type: "if", source: "(20:1) {#if type === TYPE_DOLLAR}", ctx });
    	return block;
    }

    // (22:1) {#if type === TYPE_PERCENT}
    function create_if_block_2(ctx) {
    	var span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "%";
    			add_location(span, file, 21, 28, 500);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(span);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_2.name, type: "if", source: "(22:1) {#if type === TYPE_PERCENT}", ctx });
    	return block;
    }

    // (23:1) {#if type === TYPE_YEAR}
    function create_if_block_1(ctx) {
    	var span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Years";
    			add_location(span, file, 22, 25, 545);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(span);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_1.name, type: "if", source: "(23:1) {#if type === TYPE_YEAR}", ctx });
    	return block;
    }

    function create_fragment(ctx) {
    	var div;

    	function select_block_type(changed, ctx) {
    		if (ctx.type !== TYPE_OPTIONS) return create_if_block;
    		return create_else_block;
    	}

    	var current_block_type = select_block_type(null, ctx);
    	var if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "wrapper svelte-13hecza");
    			add_location(div, file, 17, 0, 318);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);
    		},

    		p: function update(changed, ctx) {
    			if (current_block_type === (current_block_type = select_block_type(changed, ctx)) && if_block) {
    				if_block.p(changed, ctx);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);
    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}

    			if_block.d();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment.name, type: "component", source: "", ctx });
    	return block;
    }

    const TYPE_DOLLAR = 'dollar';

    const TYPE_PERCENT = 'percent';

    const TYPE_YEAR = 'years';

    const TYPE_OPTIONS = 'option';

    function instance($$self, $$props, $$invalidate) {
    	

    	// PROPS
    	let { value = 0, placeholder = '', type = '', decimals = '', step = '', options = [] } = $$props;

    	const writable_props = ['value', 'placeholder', 'type', 'decimals', 'step', 'options'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<InputField> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate('value', value);
    		$$invalidate('options', options);
    	}

    	function select_change_handler() {
    		value = select_value(this);
    		$$invalidate('value', value);
    		$$invalidate('options', options);
    	}

    	$$self.$set = $$props => {
    		if ('value' in $$props) $$invalidate('value', value = $$props.value);
    		if ('placeholder' in $$props) $$invalidate('placeholder', placeholder = $$props.placeholder);
    		if ('type' in $$props) $$invalidate('type', type = $$props.type);
    		if ('decimals' in $$props) $$invalidate('decimals', decimals = $$props.decimals);
    		if ('step' in $$props) $$invalidate('step', step = $$props.step);
    		if ('options' in $$props) $$invalidate('options', options = $$props.options);
    	};

    	$$self.$capture_state = () => {
    		return { value, placeholder, type, decimals, step, options };
    	};

    	$$self.$inject_state = $$props => {
    		if ('value' in $$props) $$invalidate('value', value = $$props.value);
    		if ('placeholder' in $$props) $$invalidate('placeholder', placeholder = $$props.placeholder);
    		if ('type' in $$props) $$invalidate('type', type = $$props.type);
    		if ('decimals' in $$props) $$invalidate('decimals', decimals = $$props.decimals);
    		if ('step' in $$props) $$invalidate('step', step = $$props.step);
    		if ('options' in $$props) $$invalidate('options', options = $$props.options);
    	};

    	return {
    		value,
    		placeholder,
    		type,
    		decimals,
    		step,
    		options,
    		input_input_handler,
    		select_change_handler
    	};
    }

    class InputField extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, ["value", "placeholder", "type", "decimals", "step", "options"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "InputField", options, id: create_fragment.name });
    	}

    	get value() {
    		throw new Error("<InputField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<InputField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<InputField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<InputField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<InputField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<InputField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get decimals() {
    		throw new Error("<InputField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set decimals(value) {
    		throw new Error("<InputField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get step() {
    		throw new Error("<InputField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set step(value) {
    		throw new Error("<InputField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get options() {
    		throw new Error("<InputField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<InputField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.12.1 */
    const { Object: Object_1 } = globals;

    const file$1 = "src\\App.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = Object_1.create(ctx);
    	child_ctx.p = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = Object_1.create(ctx);
    	child_ctx.a = list[i];
    	child_ctx.index = i;
    	return child_ctx;
    }

    // (177:6) {#if index % (amortization < 55 ? 5 : 10) === 0}
    function create_if_block_1$1(ctx) {
    	var text_1, t, text_1_x_value;

    	const block = {
    		c: function create() {
    			text_1 = svg_element("text");
    			t = text(ctx.index);
    			attr_dev(text_1, "x", text_1_x_value = (ctx.index-0.4)*500/(ctx.amortization));
    			attr_dev(text_1, "y", 30);
    			attr_dev(text_1, "class", "svelte-12liesy");
    			add_location(text_1, file$1, 177, 7, 4870);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, text_1, anchor);
    			append_dev(text_1, t);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.amortization) && text_1_x_value !== (text_1_x_value = (ctx.index-0.4)*500/(ctx.amortization))) {
    				attr_dev(text_1, "x", text_1_x_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(text_1);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_1$1.name, type: "if", source: "(177:6) {#if index % (amortization < 55 ? 5 : 10) === 0}", ctx });
    	return block;
    }

    // (169:4) {#each amortizationPayments as a,index}
    function create_each_block_1(ctx) {
    	var g, line, line_x__value, line_x__value_1;

    	var if_block = (ctx.index % (ctx.amortization < 55 ? 5 : 10) === 0) && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			g = svg_element("g");
    			line = svg_element("line");
    			if (if_block) if_block.c();
    			attr_dev(line, "y1", "0");
    			attr_dev(line, "y2", ctx.index % 5 === 0 ? 10 : 5);
    			attr_dev(line, "x1", line_x__value = ctx.index*500/(ctx.amortization));
    			attr_dev(line, "x2", line_x__value_1 = ctx.index*500/(ctx.amortization));
    			attr_dev(line, "class", "svelte-12liesy");
    			add_location(line, file$1, 170, 6, 4660);
    			add_location(g, file$1, 169, 5, 4650);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);
    			append_dev(g, line);
    			if (if_block) if_block.m(g, null);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.amortization) && line_x__value !== (line_x__value = ctx.index*500/(ctx.amortization))) {
    				attr_dev(line, "x1", line_x__value);
    			}

    			if ((changed.amortization) && line_x__value_1 !== (line_x__value_1 = ctx.index*500/(ctx.amortization))) {
    				attr_dev(line, "x2", line_x__value_1);
    			}

    			if (ctx.index % (ctx.amortization < 55 ? 5 : 10) === 0) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    				} else {
    					if_block = create_if_block_1$1(ctx);
    					if_block.c();
    					if_block.m(g, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(g);
    			}

    			if (if_block) if_block.d();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block_1.name, type: "each", source: "(169:4) {#each amortizationPayments as a,index}", ctx });
    	return block;
    }

    // (185:4) {#each amortizationRects as p}
    function create_each_block$1(ctx) {
    	var rect, dispose;

    	function mousemove_handler(...args) {
    		return ctx.mousemove_handler(ctx, ...args);
    	}

    	var rect_levels = [
    		ctx.p,
    		{ class: "svelte-12liesy" }
    	];

    	var rect_data = {};
    	for (var i = 0; i < rect_levels.length; i += 1) {
    		rect_data = assign(rect_data, rect_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			rect = svg_element("rect");
    			set_svg_attributes(rect, rect_data);
    			add_location(rect, file$1, 185, 5, 5042);

    			dispose = [
    				listen_dev(rect, "mousemove", mousemove_handler),
    				listen_dev(rect, "mouseout", ctx.mouseout_handler)
    			];
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, rect, anchor);
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			set_svg_attributes(rect, get_spread_update(rect_levels, [
    				(changed.amortizationRects) && ctx.p,
    				{ class: "svelte-12liesy" }
    			]));
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(rect);
    			}

    			run_all(dispose);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$1.name, type: "each", source: "(185:4) {#each amortizationRects as p}", ctx });
    	return block;
    }

    // (197:2) {#if graphSelection !== null}
    function create_if_block$1(ctx) {
    	var div, t0, t1_value = ctx.graphSelection.year + "", t1, br0, t2, t3_value = ctx.graphSelection.principal + "", t3, t4, br1, t5, t6_value = ctx.graphSelection.principalPercent + "", t6, t7, br2;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("Year: ");
    			t1 = text(t1_value);
    			br0 = element("br");
    			t2 = text("\n\t\t\t\tPrincipal: ");
    			t3 = text(t3_value);
    			t4 = space();
    			br1 = element("br");
    			t5 = text("\n\t\t\t\tRemaining: ");
    			t6 = text(t6_value);
    			t7 = space();
    			br2 = element("br");
    			add_location(br0, file$1, 198, 33, 5340);
    			add_location(br1, file$1, 199, 44, 5390);
    			add_location(br2, file$1, 200, 51, 5447);
    			attr_dev(div, "class", "hover svelte-12liesy");
    			attr_dev(div, "style", ctx.styleString);
    			add_location(div, file$1, 197, 3, 5267);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, br0);
    			append_dev(div, t2);
    			append_dev(div, t3);
    			append_dev(div, t4);
    			append_dev(div, br1);
    			append_dev(div, t5);
    			append_dev(div, t6);
    			append_dev(div, t7);
    			append_dev(div, br2);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.graphSelection) && t1_value !== (t1_value = ctx.graphSelection.year + "")) {
    				set_data_dev(t1, t1_value);
    			}

    			if ((changed.graphSelection) && t3_value !== (t3_value = ctx.graphSelection.principal + "")) {
    				set_data_dev(t3, t3_value);
    			}

    			if ((changed.graphSelection) && t6_value !== (t6_value = ctx.graphSelection.principalPercent + "")) {
    				set_data_dev(t6, t6_value);
    			}

    			if (changed.styleString) {
    				attr_dev(div, "style", ctx.styleString);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block$1.name, type: "if", source: "(197:2) {#if graphSelection !== null}", ctx });
    	return block;
    }

    function create_fragment$1(ctx) {
    	var div9, h2, t1, div8, div0, label0, t3, updating_value, t4, div1, label1, t6, updating_value_1, t7, div2, label2, t9, updating_value_2, t10, div3, label3, t12, updating_value_3, t13, div4, label4, t15, updating_value_4, t16, div5, label5, t18, span0, t19_value = formatAsCurrency(ctx.totalCostOfMortgage) + "", t19, t20, div6, label6, t22, span1, t23_value = formatAsCurrency(ctx.interestPayed) + "", t23, t24, div7, label7, t26, span2, t27_value = formatAsCurrency(ctx.payment) + "", t27, t28, h3, t30, svg, g0, line, g1, t31, current;

    	function inputfield0_value_binding(value) {
    		ctx.inputfield0_value_binding.call(null, value);
    		updating_value = true;
    		add_flush_callback(() => updating_value = false);
    	}

    	let inputfield0_props = {
    		type: "dollar",
    		decimals: "0",
    		step: "1000"
    	};
    	if (ctx.homeValue !== void 0) {
    		inputfield0_props.value = ctx.homeValue;
    	}
    	var inputfield0 = new InputField({ props: inputfield0_props, $$inline: true });

    	binding_callbacks.push(() => bind(inputfield0, 'value', inputfield0_value_binding));

    	function inputfield1_value_binding(value_1) {
    		ctx.inputfield1_value_binding.call(null, value_1);
    		updating_value_1 = true;
    		add_flush_callback(() => updating_value_1 = false);
    	}

    	let inputfield1_props = {
    		type: "dollar",
    		decimals: "0",
    		step: "1000"
    	};
    	if (ctx.downpayment !== void 0) {
    		inputfield1_props.value = ctx.downpayment;
    	}
    	var inputfield1 = new InputField({ props: inputfield1_props, $$inline: true });

    	binding_callbacks.push(() => bind(inputfield1, 'value', inputfield1_value_binding));

    	function inputfield2_value_binding(value_2) {
    		ctx.inputfield2_value_binding.call(null, value_2);
    		updating_value_2 = true;
    		add_flush_callback(() => updating_value_2 = false);
    	}

    	let inputfield2_props = {
    		type: "percent",
    		decimals: "2",
    		step: "0.01"
    	};
    	if (ctx.interestPercent !== void 0) {
    		inputfield2_props.value = ctx.interestPercent;
    	}
    	var inputfield2 = new InputField({ props: inputfield2_props, $$inline: true });

    	binding_callbacks.push(() => bind(inputfield2, 'value', inputfield2_value_binding));

    	function inputfield3_value_binding(value_3) {
    		ctx.inputfield3_value_binding.call(null, value_3);
    		updating_value_3 = true;
    		add_flush_callback(() => updating_value_3 = false);
    	}

    	let inputfield3_props = { type: "years", decimals: "0", step: "1" };
    	if (ctx.amortization !== void 0) {
    		inputfield3_props.value = ctx.amortization;
    	}
    	var inputfield3 = new InputField({ props: inputfield3_props, $$inline: true });

    	binding_callbacks.push(() => bind(inputfield3, 'value', inputfield3_value_binding));

    	function inputfield4_value_binding(value_4) {
    		ctx.inputfield4_value_binding.call(null, value_4);
    		updating_value_4 = true;
    		add_flush_callback(() => updating_value_4 = false);
    	}

    	let inputfield4_props = {
    		type: "option",
    		options: ctx.paymentFrequencyOptions,
    		decimals: "0",
    		step: "100"
    	};
    	if (ctx.paymentFrequency !== void 0) {
    		inputfield4_props.value = ctx.paymentFrequency;
    	}
    	var inputfield4 = new InputField({ props: inputfield4_props, $$inline: true });

    	binding_callbacks.push(() => bind(inputfield4, 'value', inputfield4_value_binding));

    	let each_value_1 = ctx.amortizationPayments;

    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = ctx.amortizationRects;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	var if_block = (ctx.graphSelection !== null) && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div9 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Mortgage Calculator";
    			t1 = space();
    			div8 = element("div");
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "Home Value:";
    			t3 = space();
    			inputfield0.$$.fragment.c();
    			t4 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "Down Payment:";
    			t6 = space();
    			inputfield1.$$.fragment.c();
    			t7 = space();
    			div2 = element("div");
    			label2 = element("label");
    			label2.textContent = "Interest Rate:";
    			t9 = space();
    			inputfield2.$$.fragment.c();
    			t10 = space();
    			div3 = element("div");
    			label3 = element("label");
    			label3.textContent = "Amortization:";
    			t12 = space();
    			inputfield3.$$.fragment.c();
    			t13 = space();
    			div4 = element("div");
    			label4 = element("label");
    			label4.textContent = "Payment Frequency:";
    			t15 = space();
    			inputfield4.$$.fragment.c();
    			t16 = space();
    			div5 = element("div");
    			label5 = element("label");
    			label5.textContent = "Total cost of loan:";
    			t18 = space();
    			span0 = element("span");
    			t19 = text(t19_value);
    			t20 = space();
    			div6 = element("div");
    			label6 = element("label");
    			label6.textContent = "Total Interest Paid:";
    			t22 = space();
    			span1 = element("span");
    			t23 = text(t23_value);
    			t24 = space();
    			div7 = element("div");
    			label7 = element("label");
    			label7.textContent = "Monthly Payment:";
    			t26 = space();
    			span2 = element("span");
    			t27 = text(t27_value);
    			t28 = space();
    			h3 = element("h3");
    			h3.textContent = "Amortization Schedule";
    			t30 = space();
    			svg = svg_element("svg");
    			g0 = svg_element("g");
    			line = svg_element("line");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			g1 = svg_element("g");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t31 = space();
    			if (if_block) if_block.c();
    			attr_dev(h2, "class", "svelte-12liesy");
    			add_location(h2, file$1, 117, 2, 3183);
    			attr_dev(label0, "class", "svelte-12liesy");
    			add_location(label0, file$1, 121, 3, 3264);
    			attr_dev(div0, "class", "form-group svelte-12liesy");
    			add_location(div0, file$1, 120, 2, 3236);
    			attr_dev(label1, "class", "svelte-12liesy");
    			add_location(label1, file$1, 125, 3, 3410);
    			attr_dev(div1, "class", "form-group svelte-12liesy");
    			add_location(div1, file$1, 124, 2, 3382);
    			attr_dev(label2, "class", "svelte-12liesy");
    			add_location(label2, file$1, 129, 3, 3560);
    			attr_dev(div2, "class", "form-group svelte-12liesy");
    			add_location(div2, file$1, 128, 2, 3532);
    			attr_dev(label3, "class", "svelte-12liesy");
    			add_location(label3, file$1, 133, 3, 3716);
    			attr_dev(div3, "class", "form-group svelte-12liesy");
    			add_location(div3, file$1, 132, 2, 3688);
    			attr_dev(label4, "class", "svelte-12liesy");
    			add_location(label4, file$1, 137, 3, 3863);
    			attr_dev(div4, "class", "form-group svelte-12liesy");
    			add_location(div4, file$1, 136, 2, 3835);
    			attr_dev(label5, "class", "svelte-12liesy");
    			add_location(label5, file$1, 143, 3, 4058);
    			attr_dev(span0, "class", "value svelte-12liesy");
    			add_location(span0, file$1, 144, 3, 4096);
    			attr_dev(div5, "class", "form-group svelte-12liesy");
    			add_location(div5, file$1, 142, 2, 4030);
    			attr_dev(label6, "class", "svelte-12liesy");
    			add_location(label6, file$1, 150, 3, 4212);
    			attr_dev(span1, "class", "value svelte-12liesy");
    			add_location(span1, file$1, 151, 3, 4251);
    			attr_dev(div6, "class", "form-group svelte-12liesy");
    			add_location(div6, file$1, 149, 2, 4184);
    			attr_dev(label7, "class", "svelte-12liesy");
    			add_location(label7, file$1, 157, 3, 4361);
    			attr_dev(span2, "class", "value out svelte-12liesy");
    			add_location(span2, file$1, 158, 3, 4396);
    			attr_dev(div7, "class", "form-group svelte-12liesy");
    			add_location(div7, file$1, 156, 2, 4333);
    			attr_dev(h3, "class", "svelte-12liesy");
    			add_location(h3, file$1, 163, 2, 4476);
    			attr_dev(line, "x1", "0");
    			attr_dev(line, "y1", "1");
    			attr_dev(line, "x2", "500");
    			attr_dev(line, "y2", "1");
    			attr_dev(line, "class", "svelte-12liesy");
    			add_location(line, file$1, 167, 4, 4563);
    			attr_dev(g0, "class", "xaxis svelte-12liesy");
    			add_location(g0, file$1, 166, 3, 4541);
    			attr_dev(g1, "class", "graph svelte-12liesy");
    			add_location(g1, file$1, 183, 3, 4984);
    			attr_dev(svg, "viewBox", "0 0 560 300");
    			attr_dev(svg, "class", "svelte-12liesy");
    			add_location(svg, file$1, 164, 2, 4509);
    			attr_dev(div8, "class", "form svelte-12liesy");
    			add_location(div8, file$1, 118, 2, 3214);
    			attr_dev(div9, "id", "app");
    			attr_dev(div9, "class", "svelte-12liesy");
    			add_location(div9, file$1, 116, 0, 3166);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div9, anchor);
    			append_dev(div9, h2);
    			append_dev(div9, t1);
    			append_dev(div9, div8);
    			append_dev(div8, div0);
    			append_dev(div0, label0);
    			append_dev(div0, t3);
    			mount_component(inputfield0, div0, null);
    			append_dev(div8, t4);
    			append_dev(div8, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t6);
    			mount_component(inputfield1, div1, null);
    			append_dev(div8, t7);
    			append_dev(div8, div2);
    			append_dev(div2, label2);
    			append_dev(div2, t9);
    			mount_component(inputfield2, div2, null);
    			append_dev(div8, t10);
    			append_dev(div8, div3);
    			append_dev(div3, label3);
    			append_dev(div3, t12);
    			mount_component(inputfield3, div3, null);
    			append_dev(div8, t13);
    			append_dev(div8, div4);
    			append_dev(div4, label4);
    			append_dev(div4, t15);
    			mount_component(inputfield4, div4, null);
    			append_dev(div8, t16);
    			append_dev(div8, div5);
    			append_dev(div5, label5);
    			append_dev(div5, t18);
    			append_dev(div5, span0);
    			append_dev(span0, t19);
    			append_dev(div8, t20);
    			append_dev(div8, div6);
    			append_dev(div6, label6);
    			append_dev(div6, t22);
    			append_dev(div6, span1);
    			append_dev(span1, t23);
    			append_dev(div8, t24);
    			append_dev(div8, div7);
    			append_dev(div7, label7);
    			append_dev(div7, t26);
    			append_dev(div7, span2);
    			append_dev(span2, t27);
    			append_dev(div8, t28);
    			append_dev(div8, h3);
    			append_dev(div8, t30);
    			append_dev(div8, svg);
    			append_dev(svg, g0);
    			append_dev(g0, line);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(g0, null);
    			}

    			append_dev(svg, g1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(g1, null);
    			}

    			append_dev(div9, t31);
    			if (if_block) if_block.m(div9, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var inputfield0_changes = {};
    			if (!updating_value && changed.homeValue) {
    				inputfield0_changes.value = ctx.homeValue;
    			}
    			inputfield0.$set(inputfield0_changes);

    			var inputfield1_changes = {};
    			if (!updating_value_1 && changed.downpayment) {
    				inputfield1_changes.value = ctx.downpayment;
    			}
    			inputfield1.$set(inputfield1_changes);

    			var inputfield2_changes = {};
    			if (!updating_value_2 && changed.interestPercent) {
    				inputfield2_changes.value = ctx.interestPercent;
    			}
    			inputfield2.$set(inputfield2_changes);

    			var inputfield3_changes = {};
    			if (!updating_value_3 && changed.amortization) {
    				inputfield3_changes.value = ctx.amortization;
    			}
    			inputfield3.$set(inputfield3_changes);

    			var inputfield4_changes = {};
    			if (!updating_value_4 && changed.paymentFrequency) {
    				inputfield4_changes.value = ctx.paymentFrequency;
    			}
    			inputfield4.$set(inputfield4_changes);

    			if ((!current || changed.totalCostOfMortgage) && t19_value !== (t19_value = formatAsCurrency(ctx.totalCostOfMortgage) + "")) {
    				set_data_dev(t19, t19_value);
    			}

    			if ((!current || changed.interestPayed) && t23_value !== (t23_value = formatAsCurrency(ctx.interestPayed) + "")) {
    				set_data_dev(t23, t23_value);
    			}

    			if ((!current || changed.payment) && t27_value !== (t27_value = formatAsCurrency(ctx.payment) + "")) {
    				set_data_dev(t27, t27_value);
    			}

    			if (changed.amortization || changed.amortizationPayments) {
    				each_value_1 = ctx.amortizationPayments;

    				let i;
    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(changed, child_ctx);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(g0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}
    				each_blocks_1.length = each_value_1.length;
    			}

    			if (changed.amortizationRects) {
    				each_value = ctx.amortizationRects;

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(g1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}

    			if (ctx.graphSelection !== null) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(div9, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(inputfield0.$$.fragment, local);

    			transition_in(inputfield1.$$.fragment, local);

    			transition_in(inputfield2.$$.fragment, local);

    			transition_in(inputfield3.$$.fragment, local);

    			transition_in(inputfield4.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(inputfield0.$$.fragment, local);
    			transition_out(inputfield1.$$.fragment, local);
    			transition_out(inputfield2.$$.fragment, local);
    			transition_out(inputfield3.$$.fragment, local);
    			transition_out(inputfield4.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div9);
    			}

    			destroy_component(inputfield0);

    			destroy_component(inputfield1);

    			destroy_component(inputfield2);

    			destroy_component(inputfield3);

    			destroy_component(inputfield4);

    			destroy_each(each_blocks_1, detaching);

    			destroy_each(each_blocks, detaching);

    			if (if_block) if_block.d();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$1.name, type: "component", source: "", ctx });
    	return block;
    }

    function round2(value) {
    	return (value || 0).toFixed(2)
    }

    function formatAsCurrency (value, dec = 2) {
    	dec = dec || 0;
    	return '$ ' + (value | 0).toFixed(dec).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let homeValue = 350000;
    	let downpayment = 0;// homeValue * 0.05;
    	let interestPercent = 2.5;
    	let amortization = 25;
    	let paymentFrequency = 12;
    	
    	// internal
    	const paymentFrequencyOptions = [
    		{value:12, title:"Monthly" },
    		{value:24, title:"Semi-monthly" },
    		{value:365.25 / 7 / 2, title:"Bi-weekly" },
    		{value:365.25 / 7, title:"Weekly" },
    	];
    	let amortizationPayments = [];
    	let amortizationRects = [];
    	let payment = 0;
    	let graphSelection = {
    		style: {
    			display: 'none'
    		}
    	};	function amortizationGraphBars (amortizationPayments, width, height) {
    		let bars = [];
    		let spacing = 0;
    		let i, p, x, y, w, h;
    		for (i in amortizationPayments) {
    			p = amortizationPayments[i].principal;
    			w = width/amortization - spacing;
    			x = parseInt(i) * (w + spacing); 
    			w -= 1;
    			h = p * height/principal;
    			console.log(p, height, principal);
    			h = h > 3 ? h : 3;
    			y = height - h;

    			bars.push({
    				x: x,
    				y: y,
    				width: w,
    				height: h,
    				'data-p': p,
    				'data-ip': amortizationPayments[i].interestPortion,
    				'data-year': parseInt(i) + 1
    			});
    		}
    		console.log(bars);
    		return bars
    	}	function setHover (p, e) {
    		$$invalidate('graphSelection', graphSelection = {
    			style: {
    				left: e.clientX + 20 + 'px',
    				top: e.clientY - 25 + 'px'
    			},
    			year: p['data-year'],
    			principal: formatAsCurrency(p['data-p']),
    			principalPercent: (p['data-p']/principal*100).toFixed(1) + "%",
    			visible: true
    		});
    	}

    	function inputfield0_value_binding(value) {
    		homeValue = value;
    		$$invalidate('homeValue', homeValue);
    	}

    	function inputfield1_value_binding(value_1) {
    		downpayment = value_1;
    		$$invalidate('downpayment', downpayment);
    	}

    	function inputfield2_value_binding(value_2) {
    		interestPercent = value_2;
    		$$invalidate('interestPercent', interestPercent);
    	}

    	function inputfield3_value_binding(value_3) {
    		amortization = value_3;
    		$$invalidate('amortization', amortization);
    	}

    	function inputfield4_value_binding(value_4) {
    		paymentFrequency = value_4;
    		$$invalidate('paymentFrequency', paymentFrequency);
    	}

    	const mousemove_handler = ({ p }, e) => setHover(p, e);

    	const mouseout_handler = () => $$invalidate('graphSelection', graphSelection.style.display = 'none', graphSelection);

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('homeValue' in $$props) $$invalidate('homeValue', homeValue = $$props.homeValue);
    		if ('downpayment' in $$props) $$invalidate('downpayment', downpayment = $$props.downpayment);
    		if ('interestPercent' in $$props) $$invalidate('interestPercent', interestPercent = $$props.interestPercent);
    		if ('amortization' in $$props) $$invalidate('amortization', amortization = $$props.amortization);
    		if ('paymentFrequency' in $$props) $$invalidate('paymentFrequency', paymentFrequency = $$props.paymentFrequency);
    		if ('amortizationPayments' in $$props) $$invalidate('amortizationPayments', amortizationPayments = $$props.amortizationPayments);
    		if ('amortizationRects' in $$props) $$invalidate('amortizationRects', amortizationRects = $$props.amortizationRects);
    		if ('payment' in $$props) $$invalidate('payment', payment = $$props.payment);
    		if ('graphSelection' in $$props) $$invalidate('graphSelection', graphSelection = $$props.graphSelection);
    		if ('yearEndPrincipal' in $$props) $$invalidate('yearEndPrincipal', yearEndPrincipal = $$props.yearEndPrincipal);
    		if ('interestPortion' in $$props) $$invalidate('interestPortion', interestPortion = $$props.interestPortion);
    		if ('yearlyPrincipal' in $$props) $$invalidate('yearlyPrincipal', yearlyPrincipal = $$props.yearlyPrincipal);
    		if ('principalTemp' in $$props) $$invalidate('principalTemp', principalTemp = $$props.principalTemp);
    		if ('y' in $$props) $$invalidate('y', y = $$props.y);
    		if ('q' in $$props) $$invalidate('q', q = $$props.q);
    		if ('interestRate' in $$props) $$invalidate('interestRate', interestRate = $$props.interestRate);
    		if ('principal' in $$props) $$invalidate('principal', principal = $$props.principal);
    		if ('numPayments' in $$props) $$invalidate('numPayments', numPayments = $$props.numPayments);
    		if ('interestPerPayment' in $$props) $$invalidate('interestPerPayment', interestPerPayment = $$props.interestPerPayment);
    		if ('totalCostOfMortgage' in $$props) $$invalidate('totalCostOfMortgage', totalCostOfMortgage = $$props.totalCostOfMortgage);
    		if ('interestPayed' in $$props) $$invalidate('interestPayed', interestPayed = $$props.interestPayed);
    		if ('styleString' in $$props) $$invalidate('styleString', styleString = $$props.styleString);
    	};

    	let interestRate, principal, numPayments, interestPerPayment, totalCostOfMortgage, interestPayed, styleString;

    	$$self.$$.update = ($$dirty = { interestPercent: 1, homeValue: 1, downpayment: 1, amortization: 1, paymentFrequency: 1, interestRate: 1, interestPerPayment: 1, numPayments: 1, principal: 1, yearEndPrincipal: 1, interestPortion: 1, yearlyPrincipal: 1, principalTemp: 1, y: 1, q: 1, payment: 1, amortizationPayments: 1, totalCostOfMortgage: 1, graphSelection: 1 }) => {
    		if ($$dirty.interestPercent) { $$invalidate('interestRate', interestRate = interestPercent / 100); }
    		if ($$dirty.homeValue || $$dirty.downpayment) { $$invalidate('principal', principal = homeValue - downpayment); }
    		if ($$dirty.amortization || $$dirty.paymentFrequency) { $$invalidate('numPayments', numPayments = amortization * paymentFrequency); }
    		if ($$dirty.interestRate || $$dirty.paymentFrequency) { $$invalidate('interestPerPayment', interestPerPayment = interestRate / paymentFrequency); }
    		if ($$dirty.interestPerPayment || $$dirty.numPayments || $$dirty.principal || $$dirty.yearEndPrincipal || $$dirty.interestPortion || $$dirty.yearlyPrincipal || $$dirty.principalTemp || $$dirty.y || $$dirty.amortization || $$dirty.q || $$dirty.paymentFrequency || $$dirty.payment || $$dirty.amortizationPayments) { {
    				let temp = Math.pow(1 + interestPerPayment, numPayments);
    				$$invalidate('payment', payment = principal * interestPerPayment * temp / (temp - 1));
    		
    				var yearEndPrincipal = [];
    				var interestPortion;
    				var principalTemp = principal + 0;
    				for (var y = 0; y < amortization; $$invalidate('y', y++, y)){
    					for (var q = 0; q < paymentFrequency; $$invalidate('q', q++, q)){
    						$$invalidate('interestPortion', interestPortion = principalTemp * interestPerPayment); // portion of payment paying down interest
    						$$invalidate('principalTemp', principalTemp = principalTemp - (payment - interestPortion));
    					}
    					$$invalidate('principalTemp', principalTemp = principalTemp > 0 ? principalTemp : 0);
    					yearEndPrincipal.push({
    						principal: principalTemp,
    						interestPortion
    					});
    				}
    				$$invalidate('amortizationPayments', amortizationPayments = yearEndPrincipal);
    				console.log(amortizationPayments);
    			  $$invalidate('amortizationRects', amortizationRects = amortizationGraphBars(amortizationPayments, 500, 250));
    			} }
    		if ($$dirty.payment || $$dirty.numPayments) { $$invalidate('totalCostOfMortgage', totalCostOfMortgage = round2(payment * numPayments)); }
    		if ($$dirty.totalCostOfMortgage || $$dirty.principal) { $$invalidate('interestPayed', interestPayed = round2(totalCostOfMortgage - principal)); }
    		if ($$dirty.graphSelection) { $$invalidate('styleString', styleString = Object.entries(graphSelection.style)
    		  	.reduce((styleString, [propName, propValue]) => {
    		  		propName = propName.replace(/([A-Z])/g, matches => `-${matches[0].toLowerCase()}`);
    		    	return `${styleString}${propName}:${propValue};`;
    		  	}, '')); }
    	};

    	return {
    		homeValue,
    		downpayment,
    		interestPercent,
    		amortization,
    		paymentFrequency,
    		paymentFrequencyOptions,
    		amortizationPayments,
    		amortizationRects,
    		payment,
    		graphSelection,
    		setHover,
    		totalCostOfMortgage,
    		interestPayed,
    		styleString,
    		inputfield0_value_binding,
    		inputfield1_value_binding,
    		inputfield2_value_binding,
    		inputfield3_value_binding,
    		inputfield4_value_binding,
    		mousemove_handler,
    		mouseout_handler
    	};
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "App", options, id: create_fragment$1.name });
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
