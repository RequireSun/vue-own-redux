<template>
    <div>
        <slot :state="state" :action="stores.actions"></slot>
    </div>
</template>

<script>
    export default {
        props: ['stores'],

        data() {
            return {
                state: this.stores && this.stores.store ? this.stores.store.getState() : {},
            };
        },

        methods: {
            onStateChange() {
                this.state = this.stores.store.getState();
            },
        },

        mounted () {
            if (this.stores && this.stores.store && this.stores.store.subscribe) {
                this.unsubscribe = this.stores.store.subscribe(this.onStateChange.bind(this));
                this.onStateChange.call(this);
            }
        },

        beforeDestroy () {
            this.unsubscribe && this.unsubscribe();
            this.unsubscribe = undefined;
        },

        watch: {
            stores(val, oldVal) {
                if (val !== oldVal) {
                    this.unsubscribe && this.unsubscribe();
                    this.unsubscribe = undefined;
                    if (val && val.store && val.store.subscribe) {
                        this.unsubscribe = val.store.subscribe(this.onStateChange.bind(this));
                        this.onStateChange.call(this);
                    }
                }
            },
        },
    };
</script>
