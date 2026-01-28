import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Add error handler for unhandled errors
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  console.error('Error message:', event.message);
  console.error('Error source:', event.filename, ':', event.lineno, ':', event.colno);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error('Root element not found! Make sure index.html has a <div id="root"></div>');
  document.body.innerHTML = '<div style="padding: 20px; font-family: sans-serif;"><h1 style="color: red;">Error: Root element not found</h1><p>Make sure index.html has a <code>&lt;div id="root"&gt;&lt;/div&gt;</code> element.</p></div>';
} else {
  try {
    const root = createRoot(rootElement);
    root.render(<App />);
  } catch (error) {
    console.error('Error rendering app:', error);
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: sans-serif; max-width: 800px; margin: 50px auto;">
        <h1 style="color: red; margin-bottom: 20px;">Error Loading Application</h1>
        <p style="color: #666; margin-bottom: 20px;">${error instanceof Error ? error.message : 'Unknown error'}</p>
        <pre style="background: #f5f5f5; padding: 15px; border-radius: 5px; overflow: auto; font-size: 12px;">
${error instanceof Error ? error.stack : String(error)}
        </pre>
        <button 
          onclick="window.location.reload()" 
          style="margin-top: 20px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;"
        >
          Reload Page
        </button>
      </div>
    `;
  }
}
