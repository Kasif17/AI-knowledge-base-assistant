import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <>
      <AppRoutes />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: "#1b1f24",
            color: "#f7f5f0",
            fontSize: "0.875rem",
            borderRadius: "0.5rem",
          },
          success: { iconTheme: { primary: "#2f6f4f", secondary: "#f7f5f0" } },
          error: { iconTheme: { primary: "#b5533c", secondary: "#f7f5f0" } },
        }}
      />
    </>
  );
}

export default App;
