// // import express from 'express';
// // import passport from 'passport';

// // const router = express.Router();

// // // Google OAuth Route
// // router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// // // Google OAuth Callback
// // router.get('/google/callback',
// //   passport.authenticate('google', { failureRedirect: '/' }),
// //   (req, res) => {
// //     res.redirect('http://localhost:3000'); 
// //   }
// // );


// // // Facebook Login Route
// // router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

// // // Facebook OAuth Callback
// // router.get(
// //   '/facebook/callback',
// //   passport.authenticate('facebook', { failureRedirect: '/' }),
// //   (req, res) => {
// //     res.redirect('http://localhost:3000'); // Redirect after successful login
// //   }
// // );

// // // Protected Profile Route
// // router.get('/profile', (req, res) => {
// //   if (!req.user) {
// //     return res.redirect('/');
// //   }
// //   res.send(`Hello, ${req.user.displayName}!`);
// // });


// // export default router;


// import express from 'express';
// import passport from 'passport';

// const router = express.Router();

// // Google OAuth Route
// router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// // Google OAuth Callback
// router.get('/google/callback',
//   passport.authenticate('google', { 
//     failureRedirect: '/',
//     session: false
//   }),
//   (req, res) => {
//     try {
//       // Log user information for debugging
//       // console.log('Google Auth User:', req.user);

//       // Set cookie with user token if available
//       if (req.user && req.user.token) {
//         res.cookie('userToken', req.user.token, {
//           httpOnly: true,
//           secure: process.env.NODE_ENV === 'production',
//           sameSite: 'lax', // More lenient than 'strict'
//           maxAge: 24 * 60 * 60 * 1000 // 1 day in milliseconds
//         });
//       }

//       // Redirect with user information as query parameters
//       const redirectUrl = new URL(`${process.env.CLIENT_URL}`);
//       // if (req.user) {
//       //   redirectUrl.searchParams.append('userId', req.user.id);
//       //   redirectUrl.searchParams.append('email', req.user.email);
//       // }

//       res.redirect(redirectUrl.toString());
//     } catch (error) {
//       console.error('Google Auth Callback Error:', error);
//       res.status(500).redirect(`${process.env.CLIENT_URL}/error`);
//     }
//   }
// );

// // Facebook Login Route
// router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

// // Facebook OAuth Callback
// router.get(
//   '/facebook/callback',
//   passport.authenticate('facebook', { 
//     failureRedirect: '/',
//     session: false // Disable session if using token-based auth
//   }),
//   (req, res) => {
//     try {
//       // Log user information for debugging
//       // console.log('Facebook Auth User:', req.user);

//       // Set cookie with user token if available
//       if (req.user && req.user.token) {
//         res.cookie('userToken', req.user.token, {
//           httpOnly: true,
//           secure: process.env.NODE_ENV === 'production',
//           sameSite: 'lax',
//           maxAge: 24 * 60 * 60 * 1000 // 1 day in milliseconds
//         });
//       }

//       // Redirect with user information as query parameters
//       const redirectUrl = new URL(`${process.env.CLIENT_URL}`);
//       // if (req.user) {
//       //   redirectUrl.searchParams.append('userId', req.user.id);
//       //   redirectUrl.searchParams.append('email', req.user.email);
//       // }

//       res.redirect(redirectUrl.toString());
//     } catch (error) {
//       console.error('Facebook Auth Callback Error:', error);
//       res.status(500).redirect(`${process.env.CLIENT_URL}/error`);
//     }
//   }
// );

// // Protected Profile Route
// router.get('/profile', (req, res) => {
//   if (!req.user) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }
//   res.json({
//     id: req.user.id,
//     email: req.user.email,
//     fullName: req.user.fullName
//   });
// });

// export default router;




//updated
import express from 'express';
import passport from 'passport';
import User from "../../models/user.model.js"
import jwt from 'jsonwebtoken'; 
import slug from 'slug';
import bcryptjs from 'bcryptjs';

const router = express.Router();

// OAuth user registration/login endpoint for NextAuth
router.post('/:provider/register', async (req, res) => {
  console.log("Registering user with OAuth provider:", req.params.provider);
  try {
    const { providerId, email, name, image, provider } = req.body;
    
    if (!email || !providerId || !provider) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Check if user already exists
    let user = await User.findOne({ where: { email } });

    
    if (user) {
      // Update existing user with latest info
      user.fullName = name || user.fullName;
      user.profilePicture = image || user.profilePicture;
      user.providerId = providerId;
      user.provider = provider;
      await user.save();
    } else {
      // Create new user
      const nameSlug = slug(name, { lower: true });
      const mainSlug = nameSlug + Math.floor(Math.random() * 1000);

      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(name, salt);

      user = await User.create({
        email,
        slug: mainSlug,
        fullName: name,
        password: hashedPassword, 
        profilePicture:image,
        providerId,
        provider,
        role: 'user', // Default role
        verified:true,
        authMethod: provider
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '7d' }
    );
    
    // Send success response with user data and token
    res.status(200).json({
      success: true,
      message: `${provider} authentication successful`,
      data: {
        jwt: token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
          authMethod: user.authMethod,
          firstTimeLogin: user.createdAt === user.updatedAt 
        }
      }
    });
  } catch (error) {
    console.error(`OAuth ${req.params.provider} Register Error:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to register user',
      error: error.message
    });
  }
});

// Original Google OAuth Route (can still be used for direct backend auth)
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth Callback
router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: '/',
    session: false
  }),
  (req, res) => {
    try {
      if (req.user && req.user.token) {
        res.cookie('userToken', req.user.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 24 * 60 * 60 * 1000 // 1 day
        });
      }

      const redirectUrl = new URL(`${process.env.CLIENT_URL}`);
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
    session: false
  }),
  (req, res) => {
    try {
      if (req.user && req.user.token) {
        res.cookie('userToken', req.user.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 24 * 60 * 60 * 1000
        });
      }

      const redirectUrl = new URL(`${process.env.CLIENT_URL}`);
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





// ALTER TABLE users
// ADD COLUMN "providerId" VARCHAR(255) DEFAULT NULL,
// ADD COLUMN "provider" VARCHAR(255) DEFAULT NULL CHECK ("provider" IN ('google', 'facebook', 'credentials') OR "provider" IS NULL);
