export default function (target) {
    function onStateChange() {
        this.state = this.stores.store.getState();
    }

    const data = target.prototype.data;
    const mounted = target.prototype.mounted;
    const beforeDestroy = target.prototype.beforeDestroy;

    target.prototype.data = function () {
        return Object.assign(('function' === typeof data && data()) || {}, {
            state: this.stores && this.stores.store ? this.stores.store.getState() : {}
        });
    };

    target.prototype.mounted = function () {
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

    target.prototype.beforeDestroy = function () {
        'function' === typeof beforeDestroy && beforeDestroy.call(this);

        this.unsubscribe && this.unsubscribe();
        this.unsubscribe = undefined;
    };
}