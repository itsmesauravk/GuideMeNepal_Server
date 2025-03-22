// import express from 'express';
// import passport from 'passport';

// const router = express.Router();

// // Google OAuth Route
// router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// // Google OAuth Callback
// router.get('/google/callback',
//   passport.authenticate('google', { failureRedirect: '/' }),
//   (req, res) => {
//     res.redirect('http://localhost:3000'); 
//   }
// );


// // Facebook Login Route
// router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

// // Facebook OAuth Callback
// router.get(
//   '/facebook/callback',
//   passport.authenticate('facebook', { failureRedirect: '/' }),
//   (req, res) => {
//     res.redirect('http://localhost:3000'); // Redirect after successful login
//   }
// );

// // Protected Profile Route
// router.get('/profile', (req, res) => {
//   if (!req.user) {
//     return res.redirect('/');
//   }
//   res.send(`Hello, ${req.user.displayName}!`);
// });


// export default router;


import express from 'express';
import passport from 'passport';

const router = express.Router();

// Google OAuth Route
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth Callback
router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: '/',
    session: false
  }),
  (req, res) => {
    try {
      // Log user information for debugging
      // console.log('Google Auth User:', req.user);

      // Set cookie with user token if available
      if (req.user && req.user.token) {
        res.cookie('userToken', req.user.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax', // More lenient than 'strict'
          maxAge: 24 * 60 * 60 * 1000 // 1 day in milliseconds
        });
      }

      // Redirect with user information as query parameters
      const redirectUrl = new URL(`${process.env.CLIENT_URL}`);
      // if (req.user) {
      //   redirectUrl.searchParams.append('userId', req.user.id);
      //   redirectUrl.searchParams.append('email', req.user.email);
      // }

      res.redirect(redirectUrl.toString());
    } catch (error) {
      console.error('Google Auth Callback Error:', error);
      res.status(500).redirect(`${process.env.CLIENT_URL}/error`);
    }
  }
);

// Facebook Login Route
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

// Facebook OAuth Callback
router.get(
  '/facebook/callback',
  passport.authenticate('facebook', { 
    failureRedirect: '/',
    session: false // Disable session if using token-based auth
  }),
  (req, res) => {
    try {
      // Log user information for debugging
      // console.log('Facebook Auth User:', req.user);

      // Set cookie with user token if available
      if (req.user && req.user.token) {
        res.cookie('userToken', req.user.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 24 * 60 * 60 * 1000 // 1 day in milliseconds
        });
      }

      // Redirect with user information as query parameters
      const redirectUrl = new URL(`${process.env.CLIENT_URL}`);
      // if (req.user) {
      //   redirectUrl.searchParams.append('userId', req.user.id);
      //   redirectUrl.searchParams.append('email', req.user.email);
      // }

      res.redirect(redirectUrl.toString());
    } catch (error) {
      console.error('Facebook Auth Callback Error:', error);
      res.status(500).redirect(`${process.env.CLIENT_URL}/error`);
    }
  }
);

// Protected Profile Route
router.get('/profile', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json({
    id: req.user.id,
    email: req.user.email,
    fullName: req.user.fullName
  });
});

export default router;