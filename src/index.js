import React from 'react';
import ReactDOM from 'react-dom/client';  // Sử dụng từ 'react-dom/client' thay vì 'react-dom'
import './index.css';
import App from './App';
import { Provider } from 'react-redux';
import store from './redux/store';

// Tạo root bằng createRoot
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
