import { tool } from "ai";
import {
    description as webSearchDescription,
    parameters as webSearchParameters,
    fn as webSearchFn,
} from "./web-search";
import {
    description as coingeckoDetailsDescription,
    parameters as coingeckoDetailsParameters,
    fn as coingeckoDetailsFn,
} from "./coingecko/details";
import {
    description as coingeckoPriceDescription,
    parameters as coingeckoPriceParameters,
    fn as coingeckoPriceFn,
} from "./coingecko/price";

const webSearch = tool({
    description: webSearchDescription,
    parameters: webSearchParameters,
    execute: webSearchFn,
});

const coingeckoDetails = tool({
    description: coingeckoDetailsDescription,
    parameters: coingeckoDetailsParameters,
    execute: coingeckoDetailsFn,
});

const coingeckoPrice = tool({
    description: coingeckoPriceDescription,
    parameters: coingeckoPriceParameters,
    execute: coingeckoPriceFn,
});

export { webSearch, coingeckoDetails, coingeckoPrice };
