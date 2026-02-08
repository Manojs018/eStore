import ReactGA from "react-ga4";

const MEASUREMENT_ID = "G-XXXXXXXXXX"; // Replace with your Measurement ID

export const initGA = () => {
    ReactGA.initialize(MEASUREMENT_ID);
};

export const logPageView = () => {
    ReactGA.send({ hitType: "pageview", page: window.location.pathname });
};

export const logEvent = (category, action, label) => {
    ReactGA.event({
        category: category,
        action: action,
        label: label,
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
