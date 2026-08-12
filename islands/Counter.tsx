import { signal } from "stoneware/signals";

// Module-scope state is shared by every Counter on the page. For per-instance
// state, create the signal inside the function.
const count = signal(0);

export default function Counter() {
  return (
    <button type="button" onClick={() => count.value++}>
      Clicked {count} times
    </button>
  );
}
