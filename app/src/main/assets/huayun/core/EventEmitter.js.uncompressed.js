/**
 * 事件监听类
 * @see com.huayun.core.EventEmitter
 */
define("com/huayun/core/EventEmitter", [], function () {
    var defaultMaxListeners = 10;

    function $getMaxListeners(that) {
        if (that._maxListeners === undefined)
            return EventEmitter.defaultMaxListeners;
        return that._maxListeners;
    }

    function arrayClone(arr, n) {
        var copy = new Array(n);
        for (var i = 0; i < n; ++i)
            copy[i] = arr[i];
        return copy;
    }

    function _addListener(target, type, listener, prepend) {
        var m;
        var events;
        var existing;
        if (typeof listener !== 'function') {
            throw new Error("listener must be function");
        }
        events = target._events;
        if (events === undefined) {
            events = target._events = Object.create(null);
            target._eventsCount = 0;
        } else {
            if (events.newListener !== undefined) {
                target.emit('newListener', type, listener.listener ? listener.listener : listener);
                events = target._events;
            }
            existing = events[type];
        }
        if (existing === undefined) {
            existing = events[type] = listener;
            ++target._eventsCount;
        } else {
            if (typeof existing === 'function') {
                existing = events[type] = prepend ? [listener, existing] : [existing, listener];
            } else if (prepend) {
                existing.unshift(listener);
            } else {
                existing.push(listener);
            }
            m = $getMaxListeners(target);
            if (m > 0 && existing.length > m && !existing.warned) {
                console.warn("Possible EventEmitter memory leak detected.");
            }
        }
        return target;
    }

    function _onceWrap(target, type, listener) {
        var state = {
            fired: false,
            wrapFn: undefined,
            target: target,
            type: type,
            listener: listener
        };
        var wrapped = onceWrapper.bind(state);
        wrapped.listener = listener;
        state.wrapFn = wrapped;
        return wrapped;
    }

    function onceWrapper() {
        if (!this.fired) {
            this.target.removeListener(this.type, this.wrapFn);
            this.fired = true;
            this.listener.apply(this.target, Array.prototype.slice.call(arguments, 0));
        }
    }

    function unwrapListeners(arr) {
        const ret = new Array(arr.length);
        for (var i = 0; i < ret.length; ++i) {
            ret[i] = arr[i].listener || arr[i];
        }
        return ret;
    }

    function _listeners(target, type, unwrap) {
        const events = target._events;
        if (events === undefined)
            return [];
        const evlistener = events[type];
        if (evlistener === undefined)
            return [];
        if (typeof evlistener === 'function')
            return unwrap ? [evlistener.listener || evlistener] : [evlistener];

        return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
    }

    /**
     * 地图类, 管理所有的图层
     * @private
     * @ignore
     * @constructor
     * @alias com.huayun.core.EventEmitter
     * @property {Object} _events 事件和监听器的Map
     * @property {Number} _eventsCount 事件数目
     */
    function EventEmitter() {
        EventEmitter.init.call(this);
    }

    Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
        enumerable: true,
        get: function () {
            return defaultMaxListeners;
        },
        set: function (arg) {
            if (typeof arg !== 'number' || arg < 0 || Number.isNaN(arg)) {
                throw new Error("defaultMaxListeners must be a positive number!");
            }
            defaultMaxListeners = arg;
        }
    })

    EventEmitter.prototype._events = undefined;
    EventEmitter.prototype._eventsCount = 0;
    EventEmitter.prototype._maxListeners = undefined;

    EventEmitter.init = function () {
        if (this._events === undefined ||
            this._events === Object.getPrototypeOf(this)._events) {
            this._events = Object.create(null);
            this._eventsCount = 0;
        }
        this._maxListeners = this._maxListeners || undefined;
    }

    EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
        if (typeof n !== 'number' || n < 0 || Number.isNaN(n)) {
            throw new Error("defaultMaxListeners must be a positive number!");
        }
        this._maxListeners = n;
        return this;
    };

    EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
        return $getMaxListeners(this);
    };

    EventEmitter.prototype.emit = function emit(type) {
        var doError = type === 'error';
        var events = this._events;
        if (events !== undefined)
            doError = (doError && events.error === undefined);
        else if (!doError)
            return false;
        if (doError) {
            var er;
            if (arguments.length > 1) {
                er = arguments[1];
            }
            if (er instanceof Error) {
                throw er;
            }
        }
        var handler = events[type];
        if (handler === undefined) {
            return false;
        }
        if (typeof handler === 'function') {
            handler.apply(this, Array.prototype.slice.call(arguments, 1));
        } else {
            var len = handler.length;
            var listeners = arrayClone(handler, len);
            for (var i = 0; i < len; ++i)
                listeners[i].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        return true;
    }

    EventEmitter.prototype.addListener = function addListener(type, listener) {
        return _addListener(this, type, listener, false);
    };

    EventEmitter.prototype.on = EventEmitter.prototype.addListener;

    EventEmitter.prototype.prependListener = function prependListener(type, listener) {
        return _addListener(this, type, listener, true);
    };

    EventEmitter.prototype.once = function once(type, listener) {
        if (typeof listener !== 'function') {
            throw new Error("listener must be function!");
        }
        this.on(type, _onceWrap(this, type, listener));
        return this;
    };

    EventEmitter.prototype.prependOnceListener = function prependOnceListener(type, listener) {
        if (typeof listener !== 'function') {
            throw new Error("listener must be function!");
        }
        this.prependListener(type, _onceWrap(this, type, listener));
        return this;
    };

    EventEmitter.prototype.removeListener = function removeListener(type, listener) {
        var list, events, position, i, originalListener;
        if (typeof listener !== 'function') {
            throw new Error("listener must be function!");
        }
        events = this._events;
        if (events === undefined)
            return this;
        list = events[type];
        if (list === undefined)
            return this;
        if (list === listener || list.listener === listener) {
            if (--this._eventsCount === 0)
                this._events = Object.create(null);
            else {
                delete events[type];
                if (events.removeListener)
                    this.emit('removeListener', type, list.listener || listener);
            }
        } else if (typeof list !== 'function') {
            position = -1;
            for (i = list.length - 1; i >= 0; i--) {
                if (list[i] === listener || list[i].listener === listener) {
                    originalListener = list[i].listener;
                    position = i;
                    break;
                }
            }
            if (position < 0)
                return this;
            if (position === 0)
                list.shift();
            else {
                list.splice(position, 1);
            }

            if (list.length === 1)
                events[type] = list[0];
            if (events.removeListener !== undefined)
                this.emit('removeListener', type, originalListener || listener);
        }
        return this;
    };

    EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

    EventEmitter.prototype.removeAllListeners = function removeAllListeners(type) {
        var listeners, events, i;
        events = this._events;
        if (events === undefined)
            return this;
        if (events.removeListener === undefined) {
            if (arguments.length === 0) {
                this._events = Object.create(null);
                this._eventsCount = 0;
            } else if (events[type] !== undefined) {
                if (--this._eventsCount === 0)
                    this._events = Object.create(null);
                else
                    delete events[type];
            }
            return this;
        }
        if (arguments.length === 0) {
            var keys = Object.keys(events);
            var key;
            for (i = 0; i < keys.length; ++i) {
                key = keys[i];
                if (key === 'removeListener') continue;
                this.removeAllListeners(key);
            }
            this.removeAllListeners('removeListener');
            this._events = Object.create(null);
            this._eventsCount = 0;
            return this;
        }
        listeners = events[type];
        if (typeof listeners === 'function') {
            this.removeListener(type, listeners);
        } else if (listeners !== undefined) {
            for (i = listeners.length - 1; i >= 0; i--) {
                this.removeListener(type, listeners[i]);
            }
        }
        return this;
    };

    EventEmitter.prototype.listeners = function listeners(type) {
        return _listeners(this, type, true);
    };

    EventEmitter.prototype.rawListeners = function rawListeners(type) {
        return _listeners(this, type, false);
    };

    EventEmitter.listenerCount = function (emitter, type) {
        if (typeof emitter.listenerCount === 'function') {
            return emitter.listenerCount(type);
        } else {
            return listenerCount.call(emitter, type);
        }
    };

    EventEmitter.prototype.listenerCount = listenerCount;

    function listenerCount(type) {
        const events = this._events;
        if (events !== undefined) {
            const evlistener = events[type];
            if (typeof evlistener === 'function') {
                return 1;
            } else if (evlistener !== undefined) {
                return evlistener.length;
            }
        }
        return 0;
    }

    EventEmitter.prototype.eventNames = function eventNames() {
        return this._eventsCount > 0 ? Object.keys(this._events) : [];
    };

    return EventEmitter;
});