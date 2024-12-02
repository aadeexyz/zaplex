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
import {
    description as realtimeWeatherDescription,
    parameters as realtimeWeatherParameters,
    fn as realtimeWeatherFn,
} from "./realtime-weather";
import {
    description as stockPriceDescription,
    parameters as stockPriceParameters,
    fn as stockPriceFn,
} from "./stock-price";

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

const realtimeWeather = tool({
    description: realtimeWeatherDescription,
    parameters: realtimeWeatherParameters,
    execute: realtimeWeatherFn,
});

const stockPrice = tool({
    description: stockPriceDescription,
    parameters: stockPriceParameters,
    execute: stockPriceFn,
});

export {
    webSearch,
    coingeckoDetails,
    coingeckoPrice,
    realtimeWeather,
    stockPrice,
};
