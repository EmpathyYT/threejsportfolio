import { Clock } from "three";

function wait(time) {
  return new Promise((resolve) => setTimeout(() => {resolve()}, time));
}

export { wait };
