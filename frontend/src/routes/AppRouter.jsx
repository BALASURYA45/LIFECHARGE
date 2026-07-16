import { createBrowserRouter } from 'react-router-dom';
import App from '../App.jsx';
import HomePage from '../pages/HomePage.jsx';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
    ],
  },
]);
