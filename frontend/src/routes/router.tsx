import {
  createBrowserRouter,
} from "react-router";
import App from "../App";
import Login from "./Login";
import Register from "./Register";
import Profile from "./Profile";
import MainLayout from "./MainLayout";


export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />, // Use MainLayout as the root layout
    children: [
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "profile", element: <Profile /> },
      { path: "", element: <App /> }, // Home page
    ],
  },
]);

