import React, { Suspense, Fragment, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Loader from './components/Loader';
import AuthGuard from './components/Guard/AuthGuard'; 


export const renderRoutes = (routes = []) => (
  <Suspense fallback={<Loader />}>
    <Routes>
      {routes.map((route, i) => {
        const Guard = route.guard || Fragment;
        const Element = route.element;
        const Layout = route.layout || Fragment;


        return (
          <Route
            key={i}
            path={route.path}
            element={
              <Guard>
                <Layout>{route.routes ? renderRoutes(route.routes) : <Element />}</Layout>
              </Guard>
            }
          />
        );
      })}
    </Routes>
  </Suspense>
);

const routes = [
  {
    path: '/',
    guard:AuthGuard,
    element: lazy(() => import('./visitor'))
  },
  {
    path: '/login',
    element: lazy(() => import('./components/SignIn/login.jsx'))
  },
  {
    path: '*',
    element: () => <Navigate to={"/"} />
  }
];

export default routes;
