
# Live drive car rental web site

## Table of contents

- [Introduction](#introduction)
- [Demo](#demo)
- [Run](#run)
- [Technology](#technology)
- [Features](#features)
- [License](#license)

## Introduction

A car rental web site in wich user can rent car . add coupons..

NOTE: Please read the RUN section before opening an issue.

## Demo

![screenshot](shoppi.png)

The application is deployed to AWS and can be accessed through the following link:

[Shoppi on AWS](https://Livedrive.tk/)

The website resembles a real store and you can add vehicles to your cart and pay for them. If you want to try the checkout process, you can use the dummy card number/ upi/ Internet Bankinng provided by Razorpay for testing . Please <u><b>DO NOT</b></u> provide real card number and data.

In order to access the vendor panel on "/vendor" you need to signup and login.

In order to access the admin panel on "/admin" you need to provide the admin email and password.
for making admin user name and password you have to add the details in to database 

eg:-
name:'admin@gmail.com',
password:'$2a$12$Yt7qlh5n.Le9h9Sv9vrI0uta5m/PJz3KlIJv4z1izEnASsj5jP6KO'     \\ 123 \\


## Run

To run this application, you have to set your own environmental variables. For security reasons, some variables have been hidden from view and used as environmental variables with the help of dotenv package. Below are the variables that you need to set in order to run the application:

- RAZORPAY_ID:     This is the razorpay key_Id (string).

- RAZORPAY_KEY:  This is the razorpay key_Secret (string).

- TWILIO_SERVICE_ID: This is the Twilio Service Id (string).

- TWILIO_ACCOUNT_SID: This is the Twilio accountSID (string).

- TWILIO_AUTH_TOKEN: This is the Twilio AuthToken (string).

- SESSION_KEY: Specify a key word

- NODEMAILER_USER: Your gmail

- NODEMAILER_PASS: Gmail app password (U can create from your gmail account)

After you've set these environmental variables in the .env file at the root of the project, and intsall node modules using  `npm install`

Now you can run `npm start` in the terminal and the application should work.

## Technology

The application is built with:

- Node.js 
- MongoDB
- Express 
- Bootstrap 
- AJAX
- JQuery
- Razorpay
- Twilio
- SweetAlert
- Nodemailer
- Scoket.io
- Twak.to

Deployed in AWS EC2 instance with Nginx reverse proxy

## Features

The application displays Cars and bikes for rental by searching data.

Users can do the following:

- Create an account, login or logout
- Browse available vehicle added by the vendor
- Add vehicle to the cart
- Delete vehicle from the cart 
- Display the cart
- If a user rented a car by a specific date other users cannot able to rent that vehicle on that time
- To checkout, a user must be logged in
- Checkout information is processed using razorpay and the payment is send to the admin
- The profile contains all the bookings a user has made
- cancel the bookings
- Update their profile
- Search and vehicles
 

Vendors can do the following:

- Create an account, login or logout
- Add vehicle
- Veiw sale reports
- View, edit or delete their vehicles
- Display the bookings done by the users
- Upadate kilometer after vehicle came to hub
- Update their profile
- Send redemption requests to the admin


Admins can do the following:

- Login or logout to the admin panel
- Display sale report
- Manage users and vendors
- View all bookings done by users
- View all vehicles done by vendors
- View redeem requests and accept them

## License

[![License](https://img.shields.io/:License-MIT-blue.svg?style=flat-square)](http://badges.mit-license.org)

- MIT License
- Copyright 2022 © [MOHAMMEDSHUHAIB](https://github.com/Mohammedshuhaib)
