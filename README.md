This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# KOI STREETWEAR --- Full-Stack E-Commerce

A modern, fully-featured fashion e-commerce built with **Next.js 14/15
(App Router)**, **TypeScript**, **NextAuth**, **MongoDB**,
**Cloudinary**, **MUI**, **Tailwind**, **Yup**, **Cypress**, and
**Jest**.

This project is designed with professional architecture, strict
validation, modular code organization, internationalization, and a
complete admin dashboard.

## Main Features

### Authentication (NextAuth)

- Google OAuth2\
- Email/password (bcrypt)\
- JWT strategy\
- Custom callbacks including profile normalization and token refresh
  on update

### User Profile

- Cloudinary avatar upload\
- Old image cleanup\
- Session update using NextAuth `update()`\
- Yup validation

### Product System

- Cloudinary image uploads\
- Variants: color, size, stock\
- Collections: _duality_, _essentials_, _night-drip_\
- Categories CRUD\
- Product status control\
- Fully validated schemas

### Shopping Cart

- MongoDB persistent cart\
- Variant-based items\
- Quantity update, remove, clear\
- Guest → user cart migration\
- Checkout integration

### Payments (PayPal Sandbox)

- Create order\
- Capture order\
- PayPal REST SDK integration

### Admin Dashboard (MUI)

- Products CRUD\
- Categories CRUD\
- Orders & users list\
- Sonner notifications

### Frontend UI

- Tailwind + MUI\ + CSS module
- Framer Motion\
- Multilanguage (i18n)\
- Hero video intro\
- Modern product cards

### 📧 Email System

- SMTP (Nodemailer)\
- Welcome email\
- HTML templates

### 🧪 Testing

- Cypress E2E\
- Jest unit tests\
- Next.js mocks

---

## 📁 Project Structure (Simplified)

    /src
      /app
        /[locale]
        /auth
        /cart
        /checkout
        /products
        /profile
      /admin
      /api
      /components
      /context
      /lib
      /services
      /schemas
      /types
      /utils
      /i18n
      /styles

    /cypress
    /__tests__
    /__mocks__
    /public

---

## ⚙️ Environment Variables (`.env.local`)

    NEXT_PUBLIC_APP_URL=http://localhost:3000
    NEXT_PUBLIC_APP_NAME="KOI Streetwear"

    MONGODB_URI=

    NEXTAUTH_SECRET=
    GOOGLE_CLIENT_ID=
    GOOGLE_CLIENT_SECRET=

    SMTP_HOST=smtp.gmail.com
    SMTP_PORT=465
    SMTP_USER=
    SMTP_PASS=

    CLOUDINARY_CLOUD_NAME=
    CLOUDINARY_API_KEY=
    CLOUDINARY_API_SECRET=

    PAYPAL_CLIENT_ID=
    PAYPAL_CLIENT_SECRET=
    PAYPAL_MODE=sandbox

---

## 🧪 Cypress Configuration (`cypress.env.json`)

    {

      "testUserEmail": "testuser@koi.com",
      "testUserPassword": "User123*",
    }

---

## Default Admin Credentials

    Email: admin@koi.com
    Password: Admin123*
    Role: admin

---

## Getting Started (Step-by-Step)

### 1. Clone the repository

    https://github.com/vcmvanesa7/ECOMMERCE-RIWI.git
    cd koi-streetwear

### 2. Install dependencies

npm install

### 3. Create `.env.local`

Copy the template above.

### 4. Run dev mode

    npm run dev

### 5. Run tests

    npm run test
    npm run cypress

---

## 🛡️ Security

- Full Yup validation\
- Protected routes\
- JWT session\
- Sanitized inputs\
- HTTPS recommended\
- Cloudinary domain whitelisted

---

## Internationalization

- next-intl routing\
- English + Spanish\
- Localized URLs `/[locale]/*`

---

## API Summary

- `/api/auth`\
- `/api/users`\
- `/api/products`\
- `/api/categories`\
- `/api/cart`\
- `/api/orders`\
- `/api/paypal`\
- `/api/upload`\
- `/api/cron`

---

## 📜 License

This project is released under the MIT License.
You are free to use, modify, and distribute it as long as proper credit is maintained.

## 🤝 Contributing

Contributions, feedback, and improvements are welcome.
Please submit a pull request or open an issue if you'd like to collaborate.

## 🛠️ Support

For questions or issues, visit the project's Issues section or contact the development team.

## ❤️ Author

Developed by Vanesa Carrillo
KOI Streetwear — 2025
