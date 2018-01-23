/**
 * 包装函数
 * 为传入的 vue 对象添加 store 依赖所需的属性
 * @param target
 * @returns {*}
 */
export default function wrapper(target) {
    const data = target.data;
    const mounted = target.mounted;
    const beforeDestroy = target.beforeDestroy;

    // 添加 props 声明, 要不然 businesses 属性传不进来
    if (!target.props) {
        target.props = ['businesses'];
    } else if (-1 === target.props.indexOf('businesses')) {
        target.props.push('businesses');
    }

    target.data = function () {
        return {
            ...(('function' === typeof data && data()) || {}),  // 如果 data 存在, 就用 data 生成, 否则直接就是空对象
            state: getState(this),                              // 生成 state
        };
    };

    target.mounted = function () {
        'function' === typeof mounted && mounted.call(this);

        bindStore(this);

        // businesses 如果有改变, 重新绑定
        this.$watch('businesses', function (val, oldVal) {
            if (val !== oldVal) {
                // 如果已经绑定了, 就全部解绑
                if (this.unsubscribe) {
                    this.unsubscribe.forEach(item => 'function' === typeof item && item.call(this));
                }
                this.unsubscribe = undefined;

                bindStore(this);
            }
        });
    };

    target.beforeDestroy = function () {
        'function' === typeof beforeDestroy && beforeDestroy.call(this);

        if (this.unsubscribe) {
            this.unsubscribe.forEach(item => 'function' === typeof item && item.call(this));
        }
        this.unsubscribe = undefined;
    };

    return target;
};

/**
 * 获取对应示例中 store 生成的 state
 * @param instance
 * @returns {Object}
 */
function getState(instance) {
    if (isSingleStore(instance)) {
        return instance.businesses.store.getState() || {};
    } else if (instance.businesses && Object.keys(instance.businesses).length) {
        return Object.keys(instance.businesses).reduce((state, key) => {
            if (instance.businesses[key] && instance.businesses[key].store && 'function' === typeof instance.businesses[key].store.getState) {
                state[key] = instance.businesses[key].store.getState();
            }
            return state;
        }, {});
    } else {
        return {};
    }
}

/**
 * @title 监听 store 变化的事件
 * @desc 如果只有一个 store, 那就直接获取 store 的 state 并且传出来就够了
 * @desc 如果有多个 store (businesses 属性是对象的话), 那就根据他们的 key 来区分每个 store
 * @desc 漏了的情况下就是直接一个对象
 */
function onStateChange() {
    this.state = getState(this);
}

/**
 * 整个 store 进行监听
 * @param instance
 */
function bindStore(instance) {
    if (instance.businesses) {
        if (isSingleStore(instance)) {
            // 独个 store 的情况
            instance.unsubscribe = [bindStoreSingle(instance, instance.businesses.store)];
        } else {
            // store 组的情况
            instance.unsubscribe = Object.keys(instance.businesses).map(key => {
                return bindStoreSingle(instance, instance.businesses[key].store);
            });
        }
    }
    // 主动运行一次, 好把 store 上的数据都拷过来
    onStateChange.call(instance);
}

/**
 * 监听单个 store 的事件
 * @param instance
 * @param store
 * @returns {function|undefined}
 */
function bindStoreSingle(instance, store) {
    if (store && store.subscribe) {
        return store.subscribe(onStateChange.bind(instance));
    } else {
        return undefined;
    }
}

/**
 * 当前实例是否是单个 store 的情况
 * @param instance
 * @returns {boolean}
 */
function isSingleStore(instance) {
    return !!(instance && instance.businesses && instance.businesses.store && 'function' === typeof instance.businesses.store.getState);
}