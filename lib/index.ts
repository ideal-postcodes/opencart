import { setup } from "@ideal-postcodes/jsutil";

import { bindings as billing } from "./billing";
import { bindings as shipping } from "./shipping";
import { bindings as account } from "./account";

setup({
  bindings: [billing, shipping, account],
  window,
});
