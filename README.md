vue-own-redux
-------------

This is a connector to make a vue component has its own redux store.

# How to use

1. import the component of `vue-own-redux` as a component of your vue component.
   
   define the way how parent element pass the store and actions in:
   
   1. provide `stores` in the props property.
   1. pass the `stores` into connect component.
   1. use the `state` and `action` in the children components of connect by the `slot-scope` feature. 

```
<template>
  <div>
    <connect :stores="stores">
      <div slot-scope="scope">
        <h1>{{scope.state}}</h1>
        <button @click="add">actions in methods</button>
        <button @click={scope.action.minus({amount:1})}>actions on element</button>
      </div>
    </connect>
  </div>
</template>

<script>
import connect from 'vue-own-redux';

export default {
    name: 'my-component',
    props: ['stores'],
    components: {connect},
};
</script>
```

1. create a store and its actions with `redux` and `redux-actions`, and pass them into your component.

   counter.js
   ```
const reducers = handleActions({
    [ADD](state, action) {
        return {
            ...state,
            count: state.count + action.payload.amount,
        }
    },
    [MINUS](state, action) {
        return {
            ...state,
            count: state.count - action.payload.amount,
        }
    }
}, {
    count: 0,
});
 
const store = createStore(reducers);
 
const actions = bindActions(store, createActions({
    [ADD]: info => info,
    [MINUS]: info => info,
}));

return {
    actions,
    store,
};
   ```

1. import your component where you want, create new store & actions and pass them into your component.
   
   the `stores` property must have two properties `store` and `actions`.
   
   page.vue

   ```
<template>
    <div>
        <h1>{{ msg }}</h1>
        <counter :stores="stores"></counter>
        <counter :stores="stores2"></counter>
    </div>
</template>

<script>
import counter from '../counter';
import elCounter from '../counter.vue';

export default {
    name: 'HelloWorld',
    components: {
        counter: elCounter,
    },
    data () {
        return {
            msg: 'Welcome to Your Vue.js App',
            stores: {},
            stores2: {},
        }
    },
    mounted () {
        this.stores = counter();
        this.stores2 = counter();
    }
}
</script>
   ```
