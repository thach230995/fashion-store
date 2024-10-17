import { createSlice } from '@reduxjs/toolkit';

// Lấy dữ liệu từ localStorage nếu có
const initialCart = JSON.parse(localStorage.getItem('cart')) || { items: [], totalAmount: 0, totalItems: 0 };

const cartSlice = createSlice({
  name: 'cart',
  initialState: initialCart,
  reducers: {
    // Hàm thêm sản phẩm vào giỏ hàng
    addToCart: (state, action) => {
      const existingItem = state.items.find(
        (item) =>
          item.productId === action.payload.productId &&
          item.selectedSize === action.payload.selectedSize &&
          item.selectedColor === action.payload.selectedColor
      );
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      state.totalAmount = Math.max(0, state.totalAmount + action.payload.price * action.payload.quantity);
      state.totalItems += action.payload.quantity;

      // Lưu giỏ hàng vào localStorage
      localStorage.setItem('cart', JSON.stringify(state));
    },

    // Hàm xóa sản phẩm khỏi giỏ hàng
    removeFromCart: (state, action) => {
      const item = state.items.find(
        (item) =>
          item.productId === action.payload.productId &&
          item.selectedSize === action.payload.selectedSize &&
          item.selectedColor === action.payload.selectedColor
      );
      if (item) {
        state.totalAmount = Math.max(0, state.totalAmount - item.price * item.quantity);
        state.totalItems = Math.max(0, state.totalItems - item.quantity);
      }
      state.items = state.items.filter(
        (item) =>
          !(
            item.productId === action.payload.productId &&
            item.selectedSize === action.payload.selectedSize &&
            item.selectedColor === action.payload.selectedColor
          )
      );

      // Lưu giỏ hàng vào localStorage
      localStorage.setItem('cart', JSON.stringify(state));
    },

    // Hàm cập nhật số lượng sản phẩm trong giỏ hàng
    updateCartQuantity: (state, action) => {
      const item = state.items.find(
        (item) =>
          item.productId === action.payload.productId &&
          item.selectedSize === action.payload.selectedSize &&
          item.selectedColor === action.payload.selectedColor
      );
      if (item) {
        const quantityDifference = action.payload.quantity - item.quantity;
        state.totalAmount = Math.max(0, state.totalAmount + item.price * quantityDifference);
        state.totalItems = Math.max(0, state.totalItems + quantityDifference);
        item.quantity = action.payload.quantity;
      }

      // Lưu giỏ hàng vào localStorage
      localStorage.setItem('cart', JSON.stringify(state));
    },

    // Hàm xóa toàn bộ giỏ hàng
    clearCart: (state) => {
      state.items = [];
      state.totalAmount = 0;
      state.totalItems = 0;

      // Xóa giỏ hàng khỏi localStorage
      localStorage.removeItem('cart');
    },

    // Hàm khôi phục giỏ hàng từ localStorage (nếu cần)
    restoreCartFromLocalStorage: (state) => {
      const storedCart = JSON.parse(localStorage.getItem('cart'));
      if (storedCart) {
        state.items = storedCart.items;
        state.totalAmount = storedCart.totalAmount;
        state.totalItems = storedCart.items.reduce((sum, item) => sum + item.quantity, 0);
      }
    }
  }
});

export const { addToCart, removeFromCart, updateCartQuantity, clearCart, restoreCartFromLocalStorage } = cartSlice.actions;
export default cartSlice.reducer;
