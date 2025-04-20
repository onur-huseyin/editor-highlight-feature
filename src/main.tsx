import { createRoot } from "react-dom/client";
import App from "./App";
import { PrimeReactProvider } from 'primereact/api';
        

const rootElement: any = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <PrimeReactProvider>
      <App />
      </PrimeReactProvider>
);
