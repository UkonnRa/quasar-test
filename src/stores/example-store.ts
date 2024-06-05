import { defineStore } from "pinia";
import nodeProcess from "node:process";

type Props = {
  counter: number;
  nodeEnv: string;
  testVal?: string;
};

export const useCounterStore = defineStore("counter", {
  state: (): Props => ({
    counter: 0,
    nodeEnv: process.env.SERVER
      ? nodeProcess.env.NODE_ENV
      : process.env.NODE_ENV,
    testVal: process.env.SERVER
      ? nodeProcess.env.VITE_TEST_VAL
      : process.env.VITE_TEST_VAL,
  }),
  getters: {
    doubleCount: (state) => state.counter * 2,
  },
  actions: {
    increment() {
      this.counter++;
    },
  },
});
