import ReactGA from "react-ga4";
import axios from 'axios';

const MEASUREMENT_ID = "G-XXXXXXXXXX"; // Replace with your Measurement ID

// Initialize a guest ID if not present
const getGuestId = () => {
    let id = localStorage.getItem('analytics_guest_id');
    if (!id) {
        id = 'guest_' + Math.random().toString(36).substr(2, 9) + Date.now();
        localStorage.setItem('analytics_guest_id', id);
    }
    return id;
};

const sendInternalEvent = async (eventType, metadata = {}) => {
    try {
        const guestId = getGuestId();
        const token = localStorage.getItem('token'); // May or may not exist
        const userId = token ? JSON.parse(atob(token.split('.')[1])).id : null; // Simple decode if JWT, or ignore if invalid

        await axios.post('/api/analytics/event', {
            eventType,
            guestId,
            userId, // Backend will handle if this is null/invalid
            url: window.location.pathname,
            metadata
        });
    } catch (error) {
        // Fail silently so we don't disturb the user
        // console.error("Analytics Error", error);
        if (process.env.NODE_ENV === 'development') {
            console.log(`[Analytics] Failed to send ${eventType}`, error);
        }
    }
};

export const initGA = () => {
    ReactGA.initialize(MEASUREMENT_ID);
};

export const logPageView = () => {
    const path = window.location.pathname;
    ReactGA.send({ hitType: "pageview", page: path });
    sendInternalEvent('pageview');
};

export const logEvent = (category, action, label, value) => {
    ReactGA.event({
        category: category,
        action: action,
        label: label,
        value: value,
    });
    // Map generic events to internal types if needed, or just log all
    // For specific flows, we use dedicated functions below.
    // If we want to capture generic events:
    sendInternalEvent('custom_event', { category, action, label, value });
};

export const logPurchase = (transactionId, value, currency = "USD") => {
    ReactGA.event("purchase", {
        transaction_id: transactionId,
        value: value,
        currency: currency,
    });
    sendInternalEvent('purchase', { transactionId, value, currency });
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
    sendInternalEvent('add_to_cart', {
        productId: item.id || item._id,
        productName: item.name,
        value: item.price
    });
};

export const logViewItem = (item) => {
    ReactGA.event("view_item", {
        currency: "USD",
        value: item.price,
        items: [
            {
                item_id: item.id || item._id,
                item_name: item.name,
                price: item.price
            }
        ]
    });
    sendInternalEvent('view_item', {
        productId: item.id || item._id,
        productName: item.name,
        value: item.price
    });
};

export const logBeginCheckout = (cartTotal, itemCount) => {
    ReactGA.event("begin_checkout", {
        currency: "USD",
        value: cartTotal,
        items: [] // Can populate if needed
    });
    sendInternalEvent('begin_checkout', { value: cartTotal, itemCount });
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
