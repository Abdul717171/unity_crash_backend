import express from 'express';
// import config from '../../config/config.js';
import gameRoutes from '../v1/game_route.js';
// import adminRoute from './admin.route.js';

const router = express.Router();

const defaultRoutes = [
//   {
//     path: '/auth',
//     route: authRoute,
//   },
//   {
//     path: '/users',
//     route: userRoute,
//   },
  {
    path: '/games',
    route: gameRoutes,
  },
//   {
//     path: '/admin/auth',
//     route: adminRoute,
//   },
];

// const devRoutes = [
//   // routes available only in development mode
//   {
//     path: '/docs',
//     route: docsRoute,
//   },
// ];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
// if (config.env === 'development') {
//   devRoutes.forEach((route) => {
//     router.use(route.path, route.route);
//   });
// }

export default router;
