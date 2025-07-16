import {
  createBrowserRouter,
} from "react-router";
import App from "../App";
import Login from "./Login";
import Register from "./Register";
import Profile from "./Profile";
import MainLayout from "./MainLayout";
import FileUploadRoute from "./FileUploadRoute";
import CommunityList from "./CommunityList";
import CommunityView from "./CommunityView";


export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />, // Use MainLayout as the root layout
    children: [
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "profile", element: <Profile /> },
      { path: "file-upload", element: <FileUploadRoute /> }, // Add FileUploadRoute here
      { path: "communities", element: <CommunityList /> }, // List all communities
      { path: "communities/:slug", element: <CommunityView /> }, // View a single community
      { path: "", element: <App /> }, // Home page
    ],
  },
]);

