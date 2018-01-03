<template>
  <slot :state="state" :action="stores.actions"></slot>
</template>

<script>

  class Main {
    props = ['stores'];

    data = () => ({
      state: this.stores && this.stores.store ? this.stores.store.getState() : {},
    });

    methods = {
      onStateChange() {
          this.state = this.stores.store.getState();
      },
    };

    mounted = function () {
        if (this.stores && this.stores.store && this.stores.store.subscribe) {
          this.unsubscribe = this.stores.store.subscribe(this.onStateChange.bind(this));
          this.onStateChange.call(this);
        }
    };

    beforeDestroy = function () {
      this.unsubscribe && this.unsubscribe();
      this.unsubscribe = undefined;
    };

    watch = {
        stores: function (val, oldVal) {
            if (val !== oldVal) {
              this.unsubscribe && this.unsubscribe();
              this.unsubscribe = undefined;
              if (val && val.store && val.store.subscribe) {
                this.unsubscribe = val.store.subscribe(this.onStateChange.bind(this));
                this.onStateChange.call(this);
              }
            }
        },
    };
  }

  export default new Main();
</script>
