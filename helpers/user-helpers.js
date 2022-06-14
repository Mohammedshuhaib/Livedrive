const bcrypt = require('bcrypt');
require('dotenv').config();
const { ObjectId } = require('mongodb');
const Razorpay = require('razorpay');
const db = require('../database/connection');
const collection = require('../database/collection');

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_ID,
  key_secret: process.env.RAZORPAY_KEY,
});

module.exports = {
  userSignup: (userData) => new Promise(async (resolve, reject) => {
    userData.password = await bcrypt.hash(userData.password, 10);
    await db
      .get()
      .collection(collection.USER_COLLECTION)
      .insertOne(userData)
      .then((data) => {
        resolve(data.insertedId);
      });
  }),

  userExist: (phoneNumber, userName) => new Promise(async (resolve, reject) => {
    const exist = await db
      .get()
      .collection(collection.USER_COLLECTION)
      .findOne({ number: phoneNumber });
    if (exist) {
      resolve({ mobileExist: true });
    } else {
      const userExist = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ user: userName });
      if (userExist) {
        resolve({ userExist: true });
      } else {
        reject();
      }
    }
  }),

  doLogin: (data) => new Promise(async (resolve, reject) => {
    const response = {};
    const user = await db
      .get()
      .collection(collection.USER_COLLECTION)
      .findOne({ user: data.userName });
    if (user) {
      response.useralive = true;
      bcrypt.compare(data.password, user.password).then((result) => {
        if (result) {
          console.log('login successful');
          response.status = true;
          response.user = user;
          resolve(response);
        } else {
          console.log('login failed');
          reject({ message: 'invalid password' });
        }
      });
    } else {
      console.log('login failed');
      reject({ loginError: true });
    }
  }),
  checkUser: (data) => new Promise(async (resolve, reject) => {
    const exist = await db
      .get()
      .collection(collection.USER_COLLECTION)
      .findOne({ number: data });
    if (exist) {
      resolve();
    } else {
      reject();
    }
  }),
  updatePassword: (data) => new Promise(async (resolve, reject) => {
    data.password = await bcrypt.hash(data.password, 10);
    const updated = await db
      .get()
      .collection(collection.USER_COLLECTION)
      .updateOne(
        { number: data.number },
        { $set: { password: data.password } },
      );
    if (updated) {
      resolve();
    }
  }),
  findSigleUser: (userName) => new Promise(async (resolve, reject) => {
    await db
      .get()
      .collection(collection.USER_COLLECTION)
      .findOne({ user: userName })
      .then((data) => {
        resolve(data);
      });
  }),
  updateUser: (userData, purpose, value) => new Promise(async (resolve, reject) => {
    if (purpose == 'userName') {
      await db
        .get()
        .collection(collection.USER_COLLECTION)
        .updateOne({ user: userData }, { $set: { fullname: value } })
        .then(() => {
          resolve();
        });
    } else if (purpose == 'Mobilenumber') {
      await db
        .get()
        .collection(collection.USER_COLLECTION)
        .updateOne({ user: userData }, { $set: { number: value } })
        .then(() => {
          resolve();
        });
    } else if (purpose == 'birth') {
      await db
        .get()
        .collection(collection.USER_COLLECTION)
        .updateOne({ user: userData }, { $set: { dateOfBirth: value } })
        .then(() => {
          resolve();
        });
    } else if (purpose == 'license') {
      await db
        .get()
        .collection(collection.USER_COLLECTION)
        .updateOne({ user: userData }, { $set: { licenseNumber: value } })
        .then(() => {
          resolve();
        });
    } else if (purpose == 'idproof') {
      await db
        .get()
        .collection(collection.USER_COLLECTION)
        .updateOne({ user: userData }, { $set: { idProof: value } })
        .then(() => {
          resolve();
        });
    } else if (purpose == 'profilePic') {
      await db
        .get()
        .collection(collection.USER_COLLECTION)
        .updateOne({ user: userData }, { $set: { profileImage: value } })
        .then(() => {
          resolve();
        });
    } else if (purpose == 'email') {
      await db
        .get()
        .collection(collection.USER_COLLECTION)
        .updateOne({ user: userData }, { $set: { email: value } })
        .then(() => {
          resolve();
        });
    }
  }),

  addToCart: (
    proId,
    userId,
    rent,
    pickupdate,
    dropdate,
    days,
    pickuplocation,
    droplocation,
    vehicleImage,
  ) =>
    // eslint-disable-next-line no-async-promise-executor
    new Promise(async (resolve, reject) => {
      const vehicles = await db
        .get()
        .collection(collection.VENDOR_COLLECTION)
        .aggregate([
          {
            $unwind: '$vehicles',
          },
          {
            $match: { 'vehicles._id': ObjectId(proId) },
          },
          {
            $project: {
              _id: 0,
              vehicle: {
                _id: '$vehicles._id',
                Number: '$vehicles.Number',
                Name: '$vehicles.Name',
                Type: '$vehicles.Type',
                Seater: '$vehicles.Seater',
                TransmissionType: '$vehicles.Transmissiontype',
                Rent: rent,
                Pickupdate: pickupdate,
                Dropdate: dropdate,
                Days: days,
                Pickuplocation: pickuplocation,
                Droplocation: droplocation,
                Vehicleimage: vehicleImage,
              },
            },
          },
        ])
        .toArray();
      const cart = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .aggregate([
          {
            $match: { _id: ObjectId(userId) },
          },
          {
            $unwind: '$cart',
          },
        ])
        .toArray();
      if (cart != '') {
        const exist = await db
          .get()
          .collection(collection.USER_COLLECTION)
          .aggregate([
            {
              $unwind: '$cart',
            },
            {
              $match: {
                $and: [
                  { 'cart.vehicles.vehicle._id': ObjectId(proId) },
                  { _id: ObjectId(userId) },
                ],
              },
            },
          ])
          .toArray();
        if (exist != '') {
          reject(exist);
        } else {
          const updated = await db
            .get()
            .collection(collection.USER_COLLECTION)
            .updateOne(
              { _id: ObjectId(userId) },
              {
                $push: { 'cart.vehicles': vehicles[0] },
              },
            );
        }

        resolve();
      } else {
        const userCart = {
          _id: new ObjectId(),
          vehicles: [vehicles[0]],
        };
        await db
          .get()
          .collection(collection.USER_COLLECTION)
          .updateOne(
            { _id: ObjectId(userId) },
            {
              $set: {
                cart: userCart,
              },
            },
          );
        resolve({ status: true });
      }
    }),

  getCartData: (id) => new Promise(async (resolve) => {
    const cartData = await db
      .get()
      .collection(collection.USER_COLLECTION)
      .aggregate([
        {
          $match: { _id: ObjectId(id) },
        },
        {
          $project: {
            cartData: {
              vehicles: '$cart.vehicles',
            },
          },
        },
      ])
      .toArray();
    resolve(cartData[0]);
  }),

  // remove from the cart

  removeCart: (id) => new Promise((resolve) => {
    db.get()
      .collection(collection.USER_COLLECTION)
      .updateOne(
        { 'cart.vehicles.vehicle._id': ObjectId(id) },
        {
          $pull: { 'cart.vehicles': { 'vehicle._id': ObjectId(id) } },
        },
      );
    resolve();
  }),

  // add to booking from cart

  addToBookingsCart: (Fare, userData, cart) => new Promise(async (resolve) => {
    const product = [{}];
    for (const i in cart) {
      product[i] = {
        _id: cart[i].vehicle._id,
        Name: cart[i].vehicle.Name,
        Fare: parseInt(cart[i].vehicle.Rent),
        pickUpDate: cart[i].vehicle.Pickupdate,
        dropDate: cart[i].vehicle.Dropdate,
        Days: cart[i].vehicle.Days,
        pickUpLocation: cart[i].vehicle.Pickuplocation,
        dropLocation: cart[i].vehicle.Droplocation,
        vehicleImage: cart[i].vehicle.Vehicleimage,
        status: 'Upcoming',
        approved: false,
      };
    }
    const booking = {
      _id: new ObjectId(),
      PaymentStatus: 'Pending',
      product,
    };

    await db.get().collection(collection.USER_COLLECTION).updateOne(
      { user: userData.user },
      {
        $push: { booking },
      },
      { upsert: true },
    );
    resolve(booking._id);
  }),

  // get cart count

  getCartCount: (user) => new Promise(async (resolve, reject) => {
    const data = await db
      .get()
      .collection(collection.USER_COLLECTION)
      .aggregate([
        {
          $match: { user: user.user },
        },
        {
          $project: {
            'cart.vehicles': 1,
            _id: 0,
          },
        },
      ])
      .toArray();
    const cart = [];
    let cartLength;
    for (const i in data) {
      cart[i] = data[i].cart;
      if (cart[i]) {
        cartLength = cart[i].vehicles;
        resolve(cartLength.length);
      } else {
        const cart = 0;
        resolve(cart);
      }
    }
  }),

  // ---------------------get booking details start--------------------

  // add to bookings from details page

  addToBooking: (user, vehicle, Dates, Days, totalFare) => new Promise(async (resolve) => {
    const product = {
      _id: vehicle.vehicles._id,
      Name: vehicle.vehicles.Name,
      Fare: parseInt(totalFare, 10),
      pickUpDate: Dates.pickUpDate,
      dropDate: Dates.dropDate,
      Days,
      pickUpLocation: Dates.pickUpLocation,
      dropLocation: Dates.dropLocation,
      vehicleImage: vehicle.vehicles.vehicleImage,
      status: 'Upcoming',
      approved: false,
    };
    const booking = {
      _id: new ObjectId(),
      PaymentStatus: 'Pending',
      product: [product],
    };
    await db.get().collection(collection.USER_COLLECTION).updateOne(
      { user: user.user },
      {
        $push: {
          booking,
        },
      },
      { upsert: true },
    );

    resolve(booking._id);
  }),

  // get Upcoming booking details

  getUpcomingBookings: (user) => new Promise(async (resolve) => {
    const bookingData = await db
      .get()
      .collection(collection.USER_COLLECTION)
      .aggregate([
        {
          $match: { user: user.user, 'booking.product.status': 'Upcoming' },
        },
        {
          $unwind: '$booking',
        },
        {
          $unwind: '$booking.product',
        },
        {
          $match: { 'booking.PaymentStatus': 'success' },
        },
        {
          $project: {
            booking: {
              _id: '$booking.product._id',
              Name: '$booking.product.Name',
              Rent: '$booking.product.Fare',
              pickUpDate: '$booking.product.pickUpDate',
              dropDate: '$booking.product.dropDate',
              Days: '$booking.product.Days',
              status: '$booking.PaymentStatus',
              pickUpLocation: '$booking.product.pickUpLocation',
              dropLocation: '$booking.product.dropLocation',
              bookingId: '$booking._id',
              vehicleImage: '$booking.product.vehicleImage',
            },
          },
        },
      ])
      .toArray();
    const upcoming = [];
    for (const i in bookingData) {
      const today = new Date().setHours(0, 0, 0, 0);

      const pickup = new Date(bookingData[i].booking.pickUpDate).setHours(
        0,
        0,
        0,
        0,
      );
      const drop = new Date(bookingData[i].booking.dropDate).setHours(
        0,
        0,
        0,
        0,
      );
      if (today < pickup) {
        upcoming[i] = bookingData[i];
      }
    }
    resolve(upcoming);
  }),

  // get active booking details

  getActiveBookings: (user) => new Promise(async (resolve) => {
    const bookingData = await db
      .get()
      .collection(collection.USER_COLLECTION)
      .aggregate([
        {
          $match: { user: user.user },
        },
        {
          $unwind: '$booking',
        },
        {
          $unwind: '$booking.product',
        },
        {
          $match: { 'booking.PaymentStatus': 'success' },
        },
        {
          $project: {
            booking: {
              _id: '$booking.product._id',
              Name: '$booking.product.Name',
              Rent: '$booking.product.Fare',
              pickUpDate: '$booking.product.pickUpDate',
              dropDate: '$booking.product.dropDate',
              Days: '$booking.product.Days',
              status: '$booking.PaymentStatus',
              pickUpLocation: '$booking.product.pickUpLocation',
              dropLocation: '$booking.product.dropLocation',
              vehicleImage: '$booking.product.vehicleImage',
            },
          },
        },
      ])
      .toArray();
    const active = [];
    for (const i in bookingData) {
      const today = new Date().setHours(0, 0, 0, 0);

      const pickup = new Date(bookingData[i].booking.pickUpDate).setHours(
        0,
        0,
        0,
        0,
      );
      const drop = new Date(bookingData[i].booking.dropDate).setHours(
        0,
        0,
        0,
        0,
      );
      if (today >= pickup && today <= drop) {
        active[i] = bookingData[i];
      }
    }
    resolve(active);
  }),

  // get compleated booking details

  getCompleatedBookings: (user) => new Promise(async (resolve) => {
    const bookingData = await db
      .get()
      .collection(collection.USER_COLLECTION)
      .aggregate([
        {
          $match: { user: user.user },
        },
        {
          $unwind: '$booking',
        },
        {
          $unwind: '$booking.product',
        },
        {
          $match: { 'booking.PaymentStatus': 'success' },
        },
        {
          $project: {
            booking: {
              _id: '$booking.product._id',
              Name: '$booking.product.Name',
              Rent: '$booking.product.Fare',
              pickUpDate: '$booking.product.pickUpDate',
              dropDate: '$booking.product.dropDate',
              Days: '$booking.product.Days',
              status: '$booking.PaymentStatus',
              pickUpLocation: '$booking.product.pickUpLocation',
              dropLocation: '$booking.product.dropLocation',
              vehicleImage: '$booking.product.vehicleImage',
            },
          },
        },
      ])
      .toArray();
    const compleated = [];
    for (const i in bookingData) {
      const today = new Date().setHours(0, 0, 0, 0);

      const pickup = new Date(bookingData[i].booking.pickUpDate).setHours(
        0,
        0,
        0,
        0,
      );
      const drop = new Date(bookingData[i].booking.dropDate).setHours(
        0,
        0,
        0,
        0,
      );
      if (today > drop) {
        compleated[i] = bookingData[i];
      }
    }
    resolve(compleated);
  }),

  getCancelledBookings: (user) => new Promise(async (resolve, reject) => {
    const bookingData = await db
      .get()
      .collection(collection.USER_COLLECTION)
      .aggregate([
        {
          $match: { user: user.user },
        },
        {
          $unwind: '$booking',
        },
        {
          $unwind: '$booking.product',
        },
        {
          $match: { 'booking.PaymentStatus': 'Cancelled' },
        },
        {
          $project: {
            booking: {
              _id: '$booking.product._id',
              Name: '$booking.product.Name',
              Rent: '$booking.product.Fare',
              pickUpDate: '$booking.product.pickUpDate',
              dropDate: '$booking.product.dropDate',
              Days: '$booking.product.Days',
              status: '$booking.PaymentStatus',
              pickUpLocation: '$booking.product.pickUpLocation',
              dropLocation: '$booking.product.dropLocation',
              vehicleImage: '$booking.product.vehicleImage',
            },
          },
        },
      ])
      .toArray();
    resolve(bookingData);
  }),

  // ---------------------get booking details end--------------------

  // -----------------------Payment start--------------------------------

  generateRazorpay: (totalFare, bookingId) => new Promise(async (resolve, reject) => {
    const id = bookingId.toString();
    const options = {
      amount: totalFare, // amount in the smallest currency unit
      currency: 'INR',
      receipt: id,
    };
    instance.orders.create(options, (err, order) => {
      if (err) {
        console.log(err);
      }
      resolve(order);
    });
  }),

  // verify payment

  verifyPayment: (data) => new Promise(async (resolve, reject) => {
    const { createHmac } = await import('node:crypto');
    const crypto = require('crypto');
    let hmac = createHmac('sha256', process.env.RAZORPAY_KEY);
    hmac.update(
      `${data['payment[razorpay_order_id]']}|${data['payment[razorpay_payment_id]']}`,
    );
    hmac = hmac.digest('hex');
    if (hmac == data['payment[razorpay_signature]']) {
      resolve();
    } else {
      reject();
    }
  }),

  // change payment status to succes after succesfull payment

  changePaymentStatus: (user, id, purpose) => new Promise(async (resolve, reject) => {
    const response = await db
      .get()
      .collection(collection.USER_COLLECTION)
      .updateOne(
        {
          user: user.user,
          'booking.PaymentStatus': 'Pending',
          'booking._id': ObjectId(id),
        },
        {
          $set: { 'booking.$.PaymentStatus': 'success' },
        },
      );
    if (purpose == 'cart') {
      await db
        .get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: ObjectId(user._id) },
          {
            $pull: { 'cart.vehicles': { 'vehicle.Days': { $gt: '0' } } },
          },
        );
      resolve();
    }
    resolve();
  }),

  // change payment status to failed after payment failed

  changeToFailed: (user, id) => new Promise(async (resolve, reject) => {
    const response = await db
      .get()
      .collection(collection.USER_COLLECTION)
      .updateOne(
        { user: user.user, 'booking._id': ObjectId(id) },
        {
          $set: { 'booking.$.PaymentStatus': 'Failed' },
        },
      );
    resolve();
  }),

  changeToCancell: (id, user) => new Promise(async (resolve, reject) => {
    const response = await db
      .get()
      .collection(collection.USER_COLLECTION)
      .updateOne(
        {
          user: user.user,
          'booking.PaymentStatus': 'success',
          'booking.product._id': id,
        },
        {
          $set: { 'booking.$.PaymentStatus': 'Cancelled' },
        },
      );
    resolve();
  }),

  // -------------------------------payment end------------------------------

  updateSingleUser: (email, username) => new Promise(async (resolve, reject) => {
    await db
      .get()
      .collection(collection.USER_COLLECTION)
      .updateOne({ user: username }, { $set: { email } });
    resolve();
  }),

  updateIdUser: (idProof, username) => new Promise(async (resolve, reject) => {
    await db
      .get()
      .collection(collection.USER_COLLECTION)
      .updateOne({ user: username }, { $set: { idProof } });
    resolve();
  }),
};
