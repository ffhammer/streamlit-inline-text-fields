// inline_text_fields_component/frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import StreamlitInlineTextFieldsWrapper from './components'; // Your Streamlit connector
// import './index.css'; // If you have global styles

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <StreamlitInlineTextFieldsWrapper />
  </React.StrictMode>
);