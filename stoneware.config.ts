import { defineConfig } from "stoneware";

export default defineConfig({
  port: 3000,
  // The framework's default Content-Security-Policy applies unless you replace
  // it here. The CSRF secret comes from STONEWARE_CSRF_SECRET in .env - keep it out
  // of this file so it is never committed.
});
