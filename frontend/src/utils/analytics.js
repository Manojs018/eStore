import ReactGA from "react-ga4";

const MEASUREMENT_ID = "G-XXXXXXXXXX"; // Replace with your Measurement ID

export const initGA = () => {
    ReactGA.initialize(MEASUREMENT_ID);
};

export const logPageView = () => {
    ReactGA.send({ hitType: "pageview", page: window.location.pathname });
};

export const logEvent = (category, action, label, value) => {
    ReactGA.event({
        category: category,
        action: action,
        label: label,
        value: value,
    });
};

export const logPurchase = (transactionId, value, currency = "USD") => {
    ReactGA.event("purchase", {
        transaction_id: transactionId,
        value: value,
        currency: currency,
    });
};

export const logAddToCart = (item) => {
    ReactGA.event("add_to_cart", {
        currency: "USD",
        value: item.price,
        items: [
            {
                item_id: item.id,
                item_name: item.name,
                price: item.price,
                quantity: item.quantity || 1
            }
        ]
    });
};

export const logWebVitals = (metric) => {
    // Analytics requires integer values, so we round the metric value.
    // For CLS, we multiply by 1000 since it is usually a small decimal.
    const value = Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value);

    ReactGA.event({
        category: "Web Vitals",
        action: metric.name,
        value: value,
        label: metric.id, // unique id for current page load
        nonInteraction: true,
    });

    if (process.env.NODE_ENV === 'development') {
        console.log(`[Web Vitals] ${metric.name}: ${metric.value}`, metric);
    }
};
