import { makeAutoObservable } from "mobx";
export default class CounterStore {
  title = "Counter store";
  count = 0;
  events: string[] = [`Initial count is ${this.count}`];

  constructor() {
    makeAutoObservable(this);
  }

  increment = (amount = 1) => {
    this.count += amount;
    this.events.push(`Incremented count by ${amount} - current count is ${this.count}`);
  };

  decrement = (amount = 1) => {
    this.count -= amount;
    this.events.push(`Decremented count by ${amount} - current count is ${this.count}`);
  };

  get eventCount() {
    return this.events.length;
  }
}
