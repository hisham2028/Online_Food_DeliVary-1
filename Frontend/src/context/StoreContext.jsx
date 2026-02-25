import { createContext, useState, useEffect, useMemo } from "react";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = ({ children }) => {
  const url = "http://localhost:4002";

  const [token, setToken] = useState("");
  const [food_list, setFoodlist] = useState([]); // always array
  const [cartItems, setCartItems] = useState({}); // always object

  // ================= FETCH FOOD LIST =================
  const fetchFoodlist = async () => {
    try {
      const response = await axios.get(`${url}/api/food/list`);
      setFoodlist(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching food list:", error);
      setFoodlist([]);
    }
  };

  // ================= LOAD CART DATA =================
  const loadCartData = async (authToken) => {
    try {
      const response = await axios.post(
        `${url}/api/cart/get`,
        {},
        { headers: { token: authToken } }
      );

      // NEVER allow null or undefined
      setCartItems(response.data?.cartData || {});
    } catch (error) {
      console.error("Error loading cart:", error);
      setCartItems({});
    }
  };

  // ================= INITIAL LOAD =================
  useEffect(() => {
    const loadData = async () => {
      await fetchFoodlist();

      const savedToken = localStorage.getItem("token");
      if (savedToken) {
        setToken(savedToken);
        await loadCartData(savedToken);
      }
    };

    loadData();
  }, []);

  // ================= ADD TO CART =================
  const addToCart = async (itemId) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));

    if (token) {
      try {
        await axios.post(
          `${url}/api/cart/add`,
          { itemId },
          { headers: { token } }
        );
      } catch (error) {
        console.error("Error adding to cart:", error);
      }
    }
  };

  // ================= REMOVE FROM CART =================
  const removeFromCart = async (itemId) => {
    setCartItems((prev) => {
      const updated = { ...prev };
      if (updated[itemId] > 1) {
        updated[itemId] -= 1;
      } else {
        delete updated[itemId];
      }
      return updated;
    });

    if (token) {
      try {
        await axios.post(
          `${url}/api/cart/remove`,
          { itemId },
          { headers: { token } }
        );
      } catch (error) {
        console.error("Error removing from cart:", error);
      }
    }
  };

  // ================= TOTAL CART AMOUNT =================
  const getTotalCartAmount = () => {
    if (!cartItems || !Array.isArray(food_list)) return 0;

    return Object.entries(cartItems).reduce((total, [itemId, quantity]) => {
      const item = food_list.find((item) => item._id === itemId);
      return total + (item ? item.price * quantity : 0);
    }, 0);
  };

  // ================= TOTAL CART ITEMS =================
  const getTotalCartItems = () => {
    if (!cartItems) return 0;
    return Object.values(cartItems).reduce(
      (total, quantity) => total + quantity,
      0
    );
  };

  // ================= CONTEXT VALUE =================
  const contextValue = useMemo(
    () => ({
      food_list,
      cartItems,
      addToCart,
      removeFromCart,
      getTotalCartAmount,
      getTotalCartItems,
      url,
      token,
      setToken,
    }),
    [food_list, cartItems, token]
  );

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
