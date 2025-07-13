import {
  createBrowserRouter,
} from "react-router";
import App from "../App";
import Login from "./Login";
import Register from "./Register";
import Profile from "./Profile";
import MainLayout from "./MainLayout";
import FileUploadRoute from "./FileUploadRoute";


export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />, // Use MainLayout as the root layout
    children: [
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "profile", element: <Profile /> },
      { path: "file-upload", element: <FileUploadRoute /> }, // Add FileUploadRoute here
      { path: "", element: <App /> }, // Home page
    ],
  },
]);

