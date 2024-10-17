import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Gọi API để lấy danh sách đơn hàng từ JSON Server hoặc bất kỳ API nào
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async () => {
    const response = await fetch('http://localhost:5000/orders'); // Đường dẫn đến API
    const data = await response.json();
    return data;
  }
);

export const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [],         // Danh sách đơn hàng
    status: 'idle',     // Trạng thái của việc tải đơn hàng ('idle', 'loading', 'succeeded', 'failed')
    error: null         // Lưu lỗi nếu có
  },
  reducers: {
    createOrder: (state, action) => {
      state.orders.push(action.payload); // Thêm đơn hàng mới vào danh sách
    },
    updateOrderStatus: (state, action) => {
      const order = state.orders.find(o => o.id === action.payload.id);
      if (order) {
        order.status = action.payload.status; // Cập nhật trạng thái đơn hàng
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.status = 'loading'; // Đặt trạng thái loading khi yêu cầu API đang xử lý
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.status = 'succeeded';  // Đặt trạng thái thành công khi API trả về dữ liệu
        state.orders = action.payload;  // Lưu danh sách đơn hàng vào state
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.status = 'failed';    // Đặt trạng thái thất bại nếu có lỗi
        state.error = action.error.message; // Lưu thông báo lỗi
      });
  },
});

// Export các action có thể dùng (createOrder, updateOrderStatus)
export const { createOrder, updateOrderStatus } = orderSlice.actions;

// Export reducer để sử dụng trong store
export default orderSlice.reducer;
