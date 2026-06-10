import { createContext, useContext, useReducer, useEffect } from "react";

const CART_KEY = "qwin_cart";
const HELD_KEY = "qwin_held_sale";

const load = (key) => {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

const save = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch { }
};

const initialState = {
    purchased: load(CART_KEY) || [],
};

const salesReducer = (state, action) => {
    switch (action.type) {
        case "ADD_SALE_ITEM": {
            const existing = state.purchased.findIndex(i => i.productId === action.payload.productId);
            let updated;
            if (existing !== -1) {
                updated = state.purchased.map((item, idx) =>
                    idx === existing
                        ? { ...item, quantity: item.quantity + action.payload.quantity, amount: item.amount + action.payload.amount }
                        : item
                );
                const hit = updated.splice(existing, 1)[0];
                updated = [hit, ...updated];
            } else {
                updated = [action.payload, ...state.purchased];
            }
            return { ...state, purchased: updated };
        }
        case "UPDATE_QUANTITY": {
            const updated = state.purchased.map(item =>
                item.productId === action.payload.productId
                    ? { ...item, quantity: action.payload.quantity, amount: action.payload.quantity * item.unitPrice }
                    : item
            );
            return { ...state, purchased: updated };
        }
        case "REMOVE_SALE_ITEM":
            return { ...state, purchased: state.purchased.filter(i => i.productId !== action.payload) };
        case "CLEAR_SALES":
            return { ...state, purchased: [] };
        case "RESTORE_HELD":
            return { ...state, purchased: action.payload };
        default:
            return state;
    }
};

const SalesContext = createContext();

export const SalesProvider = ({ children }) => {
    const [state, dispatch] = useReducer(salesReducer, initialState);

    // Persist cart to localStorage on every change
    useEffect(() => {
        save(CART_KEY, state.purchased);
    }, [state.purchased]);

    const holdSale = () => {
        if (state.purchased.length === 0) return;
        save(HELD_KEY, state.purchased);
        dispatch({ type: "CLEAR_SALES" });
    };

    const restoreHeld = () => {
        const held = load(HELD_KEY);
        if (held) {
            dispatch({ type: "RESTORE_HELD", payload: held });
            localStorage.removeItem(HELD_KEY);
        }
    };

    const getHeldSale = () => load(HELD_KEY);

    const clearCart = () => {
        dispatch({ type: "CLEAR_SALES" });
        localStorage.removeItem(CART_KEY);
    };

    return (
        <SalesContext.Provider value={{ sales: state, dispatch, holdSale, restoreHeld, getHeldSale, clearCart }}>
            {children}
        </SalesContext.Provider>
    );
};

export const useSales = () => useContext(SalesContext);
