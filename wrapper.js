export default function wrapper(target) {
    function onStateChange() {
        this.state = this.stores.store.getState();
    }

    const data = target.data;
    const mounted = target.mounted;
    const beforeDestroy = target.beforeDestroy;

    if (!target.props) {
        target.props = ['stores'];
    } else if (-1 === target.props.indexOf('stores')) {
        target.props.push('stores');
    }
    
    target.data = function () {
        let obj = ('function' === typeof data && data()) || {};
        return Object.assign(obj, {
            state: this.stores && this.stores.store ? this.stores.store.getState() : {}
        });
    };

    target.mounted = function () {
        'function' === typeof mounted && mounted.call(this);

        if (this.stores && this.stores.store && this.stores.store.subscribe) {
            this.unsubscribe = this.stores.store.subscribe(onStateChange.bind(this));
            onStateChange.call(this);
        }

        this.$watch('stores', function (val, oldVal) {
            if (val !== oldVal) {
                this.unsubscribe && this.unsubscribe();
                this.unsubscribe = undefined;
                if (val && val.store && val.store.subscribe) {
                    this.unsubscribe = val.store.subscribe(onStateChange.bind(this));
                    onStateChange.call(this);
                }
            }
        });
    };

    target.beforeDestroy = function () {
        'function' === typeof beforeDestroy && beforeDestroy.call(this);

        this.unsubscribe && this.unsubscribe();
        this.unsubscribe = undefined;
    };

    return target;
}