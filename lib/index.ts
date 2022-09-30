import { config } from "@ideal-postcodes/jsutil";
import { bindings as billing } from "./billing";
import { bindings as shipping } from "./shipping";
import { bindings as account } from "./account";
import { bindings as custom } from "./custom";

const bindings = [billing, shipping, account, custom];

bindings.forEach((binding) => {
  const conf = config();
  if(conf) binding.bind(conf);
});
