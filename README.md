**Welcome to your Base44 project** 

**About**

View and Edit  your app on [Base44.com](http://Base44.com) 

This project contains everything you need to run your app locally.

**Edit the code in your local development environment**

Any change pushed to the repo will also be reflected in the Base44 Builder.

**Prerequisites:** 

1. Clone the repository using the project's Git URL 
2. Navigate to the project directory
3. Install dependencies: `npm install`
4. Create an `.env.local` file and set the right environment variables

```
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_APP_BASE_URL=your_backend_url

e.g.
VITE_BASE44_APP_ID=cbef744a8545c389ef439ea6
VITE_BASE44_APP_BASE_URL=https://my-to-do-list-81bfaad7.base44.app
```

Run the app: `npm run dev`

**Publish your changes**

Open [Base44.com](http://Base44.com) and click on Publish.

**iOS App Store support**

This project now includes Capacitor iOS wrapper support and a GitHub Actions workflow for building an App Store IPA automatically.

- Run `npm install`
- Run `npm run capacitor:add:ios` on a Mac to generate the native iOS wrapper
- Run `npm run ios:prepare` to build and sync the web app into iOS
- Run `npm run capacitor:open` to open the project in Xcode
- Push to `main` to trigger `.github/workflows/ios-app-store.yml`

To upload automatically, add the secret `APP_STORE_CONNECT_API_KEY_JSON` with your App Store Connect API key JSON.

**Docs & Support**

Documentation: [https://docs.base44.com/Integrations/Using-GitHub](https://docs.base44.com/Integrations/Using-GitHub)

Support: [https://app.base44.com/support](https://app.base44.com/support)
