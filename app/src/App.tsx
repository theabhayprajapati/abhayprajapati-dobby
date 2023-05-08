import { RouterProvider, createBrowserRouter } from "react-router-dom";
import './App.css';
import "./index.css";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Profile from './pages/Profile';
import Register from "./pages/Register";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <NotFound />,
  },
  {
    path: '/login',
    element: <Login />,
    errorElement: <NotFound />,

  },
  {
    path: '/profile',
    element: <Profile user={
      {
        name: 'John Doe',
        username: '@johndoe',
        bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam at ipsum eu nunc commodo posuere et sit amet ligula.',
        followers: 1234,
        following: 123,
        posts: 123,
      }
    } />,
    errorElement: <NotFound />,

  }, {
    path: '/register',
    element: <Register />,
    errorElement: <NotFound />,
  }
]
);

function App() {
  return (
    <RouterProvider router={router} />
  )
}

export default App
