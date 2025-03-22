

// //new 
// import passport from 'passport';
// import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
// import dotenv from 'dotenv';
// import User from '../../../models/user.model.js';
// import { ApiError } from '../../../utils/ApiError.js';
// import bcryptjs from 'bcryptjs';
// import slug from 'slug';

// import { Strategy as FacebookStrategy } from 'passport-facebook';

// dotenv.config();




// // 🔹 Google OAuth Strategy

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: `${process.env.SERVER_URL}/auth/google/callback`,
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
        
//         // Check if user already exists
//         let user = await User.findOne({ 
//           where: { 
//             email: profile.emails[0].value 
//           }
//         });

//         const salt = await bcryptjs.genSalt(10);
//         const hashedPassword = await bcryptjs.hash(profile.id, salt);

//         const nowTime = new Date();

//         const nameSlug = slug(profile.displayName, { lower: true });
//         const mainSlug = nameSlug + Math.floor(Math.random() * 1000);

//         if (!user) {
//           // Create new user if doesn't exist
//           user = await User.create({
//             email: profile.emails[0].value,
//             fullName: profile.displayName,
//             slug:mainSlug,
//             authMethod: 'google',
//             password: hashedPassword,
           
//           });
//         }

//         //update last active
//         user.lastActiveAt = nowTime;
//         await user.save();

       

//         // Generate access token
//         const userToken = await user.getAccessToken();

//         // Attach token to user object for use in callback
//         user.token = userToken;
        
//         return done(null, user);
//       } catch (error) {
//         return done(error, null);
//       }
//     }
//   )
// );



// // 🔹 Facebook OAuth Strategy
// passport.use(
//     new FacebookStrategy(
//       {
//         clientID: process.env.FACEBOOK_APP_ID,
//         clientSecret: process.env.FACEBOOK_APP_SECRET,
//         callbackURL: `${process.env.SERVER_URL}/auth/facebook/callback`,
//         profileFields: ['id', 'displayName', 'photos', 'email'], // Request additional fields
//       },
//       async(accessToken, refreshToken, profile, done) => {
//         try {
//              // Check if user already exists
//         let user = await User.findOne({ 
//             where: { 
//               email: profile.emails[0].value 
//             }
//           });
  
//           const salt = await bcryptjs.genSalt(10);
//           const hashedPassword = await bcryptjs.hash(profile.id, salt);
  
//           const nowTime = new Date();

//            const nameSlug = slug(profile.displayName, { lower: true });
//           const mainSlug = nameSlug + Math.floor(Math.random() * 1000);
  
//           if (!user) {
//             // Create new user if doesn't exist
//             user = await User.create({
//               email: profile.emails[0].value,
//               fullName: profile.displayName,
//               slug:mainSlug,
//               authMethod: 'facebook',
//               password: hashedPassword,
              
//             });
//           }
  
//          //update last active
//           user.lastActiveAt = nowTime;
//           await user.save();
  
//           // Generate access token
//           const userToken = await user.getAccessToken();
  
//           // Attach token to user object for use in callback
//           user.token = userToken;
          
//           return done(null, user);
//         } catch (error) {
            
//         }
//       }
//     )
//   );

// // Serialize user for the session
// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// // Deserialize user from the session
// passport.deserializeUser(async (id, done) => {
//   try {
//     const user = await User.findByPk(id);
//     done(null, user);
//   } catch (error) {
//     done(error, null);
//   }
// });

// // Example callback route handler
// const googleCallback = async (req, res) => {
//   try {
//     console.log("token", req.user.token);
//     // Set cookie with user token
//     res.cookie("userToken", req.user.token, {
//       httpOnly: true,
//       expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1), // 1 day
//     });

//     // Send response
//     res.status(200).json({
//       status: 'success',
//       message: 'Google authentication successful',
//       data: {
//         id: req.user.id,
//         fullName: req.user.fullName,
//         email: req.user.email,
//         authMethod: req.user.authMethod,
//         userToken: req.user.token
//       }
//     });
//   } catch (error) {
//     throw new ApiError(500, "Authentication failed");
//   }
// };

// export { googleCallback };




import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import dotenv from 'dotenv';
import User from '../../../models/user.model.js';
import bcryptjs from 'bcryptjs';
import slug from 'slug';

dotenv.config();

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL}/auth/google/callback`,
      passReqToCallback: true, // Add this for more flexibility
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // console.log('Google Profile:', profile); // Debugging log

        if (!profile.emails || !profile.emails.length) {
          return done(new Error('No email found in Google profile'), null);
        }

        const email = profile.emails[0].value;
        
        // Check if user already exists
        let user = await User.findOne({ 
          where: { email }
        });

        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(profile.id, salt);

        const nameSlug = slug(profile.displayName, { lower: true });
        const mainSlug = nameSlug + Math.floor(Math.random() * 1000);

     

        if (!user) {
          user = await User.create({
            email,
            fullName: profile.displayName,
            slug: mainSlug,
            authMethod: 'google',
            profilePicture:profile.photos[0].value,
            password: hashedPassword,
            lastActiveAt: new Date()
          });
        } else {
          user.lastActiveAt = new Date();
          await user.save();
        }

        const userToken = await user.getAccessToken();
        user.token = userToken;
        
        return done(null, user);
      } catch (error) {
        console.error('Google OAuth Error:', error);
        return done(error, null);
      }
    }
  )
);

// Facebook OAuth Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: `${process.env.SERVER_URL}/auth/facebook/callback`,
      profileFields: ['id', 'displayName', 'emails'], 
      passReqToCallback: true, // Add this for more flexibility
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // console.log('Facebook Profile:', profile); // Debugging log

        if (!profile.emails || !profile.emails.length) {
          return done(new Error('No email found in Facebook profile'), null);
        }

        const email = profile.emails[0].value;
        
        let user = await User.findOne({ 
          where: { email }
        });

        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(profile.id, salt);

        const nameSlug = slug(profile.displayName, { lower: true });
        const mainSlug = nameSlug + Math.floor(Math.random() * 1000);

        if (!user) {
          user = await User.create({
            email,
            fullName: profile.displayName,
            slug: mainSlug,
            authMethod: 'facebook',
            password: hashedPassword,
            profilePicture:profile.photos[0].value,
            lastActiveAt: new Date()
          });
        } else {
          user.lastActiveAt = new Date();
          await user.save();
        }

        const userToken = await user.getAccessToken();
        user.token = userToken;
        
        return done(null, user);
      } catch (error) {
        console.error('Facebook OAuth Error:', error);
        return done(error, null);
      }
    }
  )
);



