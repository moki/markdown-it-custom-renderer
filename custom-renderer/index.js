"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.customRenderer = exports.CustomRenderer = exports.CustomRendererMode = exports.CustomRendererLifeCycle = void 0;
const renderer_1 = __importDefault(require("markdown-it/lib/renderer"));
var CustomRendererLifeCycle;
(function (CustomRendererLifeCycle) {
    CustomRendererLifeCycle[CustomRendererLifeCycle["BeforeRender"] = 0] = "BeforeRender";
    CustomRendererLifeCycle[CustomRendererLifeCycle["AfterRender"] = 1] = "AfterRender";
    CustomRendererLifeCycle[CustomRendererLifeCycle["BeforeInlineRender"] = 2] = "BeforeInlineRender";
    CustomRendererLifeCycle[CustomRendererLifeCycle["AfterInlineRender"] = 3] = "AfterInlineRender";
})(CustomRendererLifeCycle = exports.CustomRendererLifeCycle || (exports.CustomRendererLifeCycle = {}));
function isCustomRendererLifeCycle(cycle) {
    return Object.keys(CustomRendererLifeCycle).includes(cycle);
}
var CustomRendererMode;
(function (CustomRendererMode) {
    CustomRendererMode[CustomRendererMode["Production"] = 0] = "Production";
    CustomRendererMode[CustomRendererMode["Development"] = 1] = "Development";
})(CustomRendererMode = exports.CustomRendererMode || (exports.CustomRendererMode = {}));
class CustomRenderer extends renderer_1.default {
    constructor({ mode = CustomRendererMode.Production, handlers = {}, hooks = {}, rules = {}, initState = () => ({}), }) {
        super();
        this.mode = mode;
        this.setRules(rules);
        this.state = initState();
        this.handlers = new Map();
        this.setHandlers({ ...handlers });
        this.hooks = new Map();
        this.setHooks({ ...hooks });
    }
    setRules(rules) {
        for (const [name, rule] of Object.entries(rules)) {
            if (!rule || !name?.length) {
                continue;
            }
            this.rules[name] = rule.bind(this);
        }
    }
    setHandlers(rules) {
        for (const [name, handler] of Object.entries(rules)) {
            if (!handler || !name?.length) {
                continue;
            }
            this.handle(name, handler);
        }
    }
    handle(type, handler) {
        const handlers = this.handlers.get(type) ?? [];
        const normalized = (Array.isArray(handler) ? handler : [handler]).map((h) => h.bind(this));
        this.handlers.set(type, [...handlers, ...normalized]);
    }
    setHooks(hooks) {
        for (const [name, hook] of Object.entries(hooks)) {
            if (isCustomRendererLifeCycle(name)) {
                this.hook(parseInt(name, 10), hook);
            }
        }
    }
    hook(cycle, hook) {
        const hooks = this.hooks.get(cycle) ?? [];
        const normalized = (Array.isArray(hook) ? hook : [hook]).map((h) => h.bind(this));
        this.hooks.set(cycle, [...hooks, ...normalized]);
    }
    runHooks(cycle, parameters) {
        let rendered = '';
        const hooks = this.hooks.get(cycle) ?? [];
        for (const hook of hooks) {
            rendered += hook(parameters);
        }
        return rendered;
    }
    render(tokens, options, env) {
        let rendered = '';
        let children;
        let type;
        let len;
        let i;
        const parameters = { tokens, options, env };
        rendered += this.runHooks(CustomRendererLifeCycle.BeforeRender, parameters);
        for (i = 0, len = tokens.length; i < len; i++) {
            type = tokens[i].type;
            children = tokens[i].children;
            if (type === 'inline' && Array.isArray(children)) {
                rendered += this.renderInline(children, options, env);
                continue;
            }
            rendered += this.processToken(tokens, i, options, env);
        }
        rendered += this.runHooks(CustomRendererLifeCycle.AfterRender, parameters);
        return rendered;
    }
    renderInline(tokens, options, env) {
        let rendered = '';
        let len;
        let i;
        const parameters = { tokens, options, env };
        rendered += this.runHooks(CustomRendererLifeCycle.BeforeInlineRender, parameters);
        for (i = 0, len = tokens.length; i < len; i++) {
            rendered += this.processToken(tokens, i, options, env);
        }
        rendered += this.runHooks(CustomRendererLifeCycle.AfterInlineRender, parameters);
        return rendered;
    }
    processToken(tokens, i, options, env) {
        let rendered = '';
        const type = tokens[i].type;
        const handlers = this.handlers.get(type);
        const rule = this.rules[type];
        if (handlers) {
            for (const handler of handlers) {
                rendered += handler(tokens, i, options, env, this);
            }
        }
        if (rule) {
            rendered += rule(tokens, i, options, env, this);
        }
        else {
            rendered += this.renderToken(tokens, i, options);
        }
        return rendered;
    }
}
exports.CustomRenderer = CustomRenderer;
function customRenderer(parser, parameters) {
    const options = {
        ...parameters,
    };
    const renderer = new CustomRenderer(options);
    // @ts-ignore
    parser.renderer = renderer;
}
exports.customRenderer = customRenderer;
exports.default = { CustomRenderer, customRenderer };
