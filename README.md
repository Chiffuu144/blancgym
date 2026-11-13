# blanc

blanc is a gender-personalized fitness app built with React, Vite, Tailwind CSS, Framer Motion, Express, MongoDB, Mongoose, and JWT authentication.

## Local setup

Requirements: Node.js 20 or newer, npm, and a reachable MongoDB deployment.

1. Copy `backend/.env.example` to `backend/.env` and set `MONGODB_URI` and a unique `JWT_SECRET`.
2. Copy `frontend/.env.example` to `frontend/.env` if it does not already exist.
3. Start the backend in one terminal:

   ```powershell
   cd backend
   npm install
   npm run dev
   ```

4. Start the frontend in a second terminal:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

5. Open the Vite URL (normally `http://localhost:5173`) and register an account.

The backend requires MongoDB and exits with a connection error if the database is unavailable. At startup it upserts 63 weekly workout sessions from `backend/config/workoutPlans.json`: three activities, three experience levels, and seven days. The current profile experience selects Beginner, Intermediate, or Advanced. Restart the backend after editing workout data.

Registration is a four-step profile wizard. The API uses the revised Harris-Benedict equations to estimate BMR, multiplies by a selected activity factor (1.375, 1.55, or 1.725), and applies a modest 10% goal adjustment for fat loss or muscle gain. This is an estimate, not medical advice. Meal entries are stored in the `meallogs` collection with the user's id and local date key.

Meal photos can be attached to a log entry. Enter calorie estimates manually before saving.

### Chat photo and video uploads

Friend chat attachments are uploaded directly from the browser to Cloudinary using a short-lived signature created by the authenticated backend. The API secret stays on the backend. Images up to 10 MB and videos up to 50 MB are accepted (JPG, PNG, WebP, MP4, WebM, and MOV).

1. Create a Cloudinary account and open the **Dashboard**. Copy the **Cloud name**, **API Key**, and **API Secret** from the account details.
2. Add `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` to `backend/.env`. Keep the API secret private; never add it to a `VITE_` variable or frontend file.
3. Restart the backend. For Render, add the same three variables under the backend service's **Environment** settings and redeploy.
4. No unsigned upload preset is needed. The app signs each upload on the backend, then sends the file directly to Cloudinary.

The upload signature is limited to the signed-in user's chat folder and is issued only when messaging a friend. Cloudinary's official guides cover [signed Node.js uploads](https://cloudinary.com/documentation/node_image_and_video_upload) and [upload authentication](https://cloudinary.com/documentation/authentication_signatures).

For MongoDB Atlas, choose **Connect -> Drivers -> Node.js**, create a database user, and add the backend machine's IP to the project's IP access list. Put the connection URI in `backend/.env` as `MONGODB_URI` and include `blanc` as the database path. If SRV DNS lookups fail, Atlas can provide a standard non-SRV connection URI. Reserved characters in the username or password must be percent-encoded.

## Structure

```text
blanc/
|-- backend/
|   |-- config/
|   |   |-- db.js
|   |   |-- workoutPlans.json
|   |   `-- seedWorkouts.js
|   |-- controllers/
|   |   |-- authController.js
|   |   |-- nutritionController.js
|   |   `-- workoutController.js
|   |-- middleware/auth.js
|   |-- models/
|   |   |-- User.js
|   |   |-- MealLog.js
|   |   `-- Workout.js
|   |-- routes/
|   |   |-- authRoutes.js
|   |   |-- nutritionRoutes.js
|   |   `-- workoutRoutes.js
|   |-- utils/calorieCalculator.js
|   |-- .env.example
|   |-- package.json
|   `-- server.js
|-- frontend/
|   |-- src/
|   |   |-- assets/
|   |   |-- components/
|   |   |   |-- CalorieProgressBar.jsx
|   |   |   |-- CapybaraMascot.jsx
|   |   |   |-- GlassCard.jsx
|   |   |   |-- Navbar.jsx
|   |   |   |-- ProtectedRoute.jsx
|   |   |   |-- GuidePage.jsx
|   |   |   `-- WorkoutList.jsx
|   |   |-- context/AuthContext.jsx
|   |   |-- pages/
|   |   |   |-- Dashboard.jsx
|   |   |   |-- Home.jsx
|   |   |   |-- Login.jsx
|   |   |   |-- NutritionTracker.jsx
|   |   |   |-- Onboarding.jsx
|   |   |   |-- Register.jsx
|   |   |   |-- ExerciseGuide.jsx
|   |   |   |-- GymGuide.jsx
|   |   |   `-- HomeGuide.jsx
|   |   |-- App.jsx
|   |   |-- index.css
|   |   `-- main.jsx
|   |-- .env.example
|   |-- index.html
|   |-- package.json
|   |-- postcss.config.js
|   |-- tailwind.config.js
|   |-- vercel.json
|   `-- vite.config.js
|-- .gitignore
`-- README.md
```

## Deployment

### Render (backend)

- Create a Web Service rooted at `backend`.
- Build command: `npm install`; start command: `npm start`.
- Set `MONGODB_URI`, a strong `JWT_SECRET`, and `CLIENT_URL` to the deployed frontend origin.
- Use `/api/health` as the health-check path.

### Vercel (frontend)

- Set the project root to `frontend`.
- Build command: `npm run build`; output directory: `dist`.
- Set `VITE_API_URL` to `https://YOUR-RENDER-SERVICE.onrender.com/api`.
- The included `vercel.json` rewrites client-side routes to the React entry point.

Real `.env` files are ignored by Git. Keep production credentials in the hosting provider's environment settings.
