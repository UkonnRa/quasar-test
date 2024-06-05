<template>
  <q-page class="row items-center justify-evenly">
    <example-component
      :title="counterStore.testVal + ' <===> ' + counterStore.nodeEnv"
      active
      :todos="todos"
      :meta="meta"
    />
    <code>
      <pre>
        {{ counterStore.testVal }}
        {{ counterStore.nodeEnv }}
      </pre>

      <strong>From Vue Component</strong>
      <div>{{ testVal }}</div>
    </code>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Todo, Meta } from "components/models";
import ExampleComponent from "components/ExampleComponent.vue";
import { useCounterStore } from "stores/example-store";
import nodeProcess from "node:process";

defineOptions({
  name: "IndexPage",
});

const counterStore = useCounterStore();

const todos = ref<Todo[]>([
  {
    id: 1,
    content: "ct1",
  },
  {
    id: 2,
    content: "ct2",
  },
  {
    id: 3,
    content: "ct3",
  },
  {
    id: 4,
    content: "ct4",
  },
  {
    id: 5,
    content: "ct5",
  },
]);

const meta = ref<Meta>({
  totalCount: 1200,
});

// TODO: this will cause `Hydration completed but contains mismatches` error
const testVal = process.env.SERVER
  ? nodeProcess.env.VITE_TEST_VAL
  : process.env.VITE_TEST_VAL;
</script>
