# Backend T-shirt Store Rest Api

This is a backend rest API for the (E-commerce) T-shirt store. It allows users to signUp/logIn (authentication) and place orders and get orders. It also has separate admin routes to create update and delete products from the database

It also uploads the photo of the user and products to the cloud and adds a reference to the database. This API can also send the forgot password request to the user e-mail address as well as other alerts through e-mail

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`PORT = 4000`

`MONGO_URI`

`JWT_SECRET`

`JWT_EXPIRY = 1h`

`CLOUD_NAME`

`CLOUDINARY_API_KEY`

`CLOUDINARY_API_SECRET`

`SMTP_HOST`

`SMTP_PORT`

`SMTP_USER`

`SMTP_PASS`

## Run Locally

**Note:** Before running add the Environment Variables

Clone the project

```bash
  git clone
```

Go to the project directory

```bash
  cd my-project
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run start
```

## Tech Stack

**Server:** Node, Express

**Database:** MongoDB
