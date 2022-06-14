const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const db = require('../database/connection');
const collection = require('../database/collection');

module.exports = {
  adminLogin: (adminData) => {
    response = {};
    return new Promise(async (resolve, reject) => {
      const admin = await db
        .get()
        .collection(collection.ADMIN_COLLECTION)
        .findOne({ name: adminData.username });
      if (admin) {
        const password = await bcrypt.compare(
          adminData.password,
          admin.password,
        );
        if (password) {
          console.log('admin login succesfull');
          resolve();
        } else {
          console.log('password error');
          response.status = false;
          reject(response);
        }
      } else {
        console.log('name error');
        response.status = false;
        reject(response);
      }
    });
  },

  getVehicles: (vehicle) => new Promise(async (resolve, reject) => {
    if (vehicle == 'cars') {
      const cars = await db
        .get()
        .collection(collection.VENDOR_COLLECTION)
        .aggregate([
          {
            $unwind: '$vehicles',
          },
          {
            $match: { 'vehicles.Type': 'car' },
          },
          {
            $project: {
              _id: 0,
              carsData: {
                Name: '$vehicles.Name',
                hubName: '$data.hubName',
                _id: '$vehicles._id',
                Number: '$vehicles.Number',
                Transmissiontype: '$vehicles.Transmissiontype',
                Kilometers: '$vehicles.Kilometers',
                Type: '$vehicles.Type',
                FuelType: '$Fuel_type',
                Seater: '$vehicles.Seater',
                Rent: '$vehicles.Rent',
                addDate: '$vehicles.addedon',
                vehicleImage: '$vehicles.vehicleImage',
              },
            },
          },
        ])
        .toArray();

      resolve(cars);
    } else {
      const bikes = await db
        .get()
        .collection(collection.VENDOR_COLLECTION)
        .aggregate([
          {
            $unwind: '$vehicles',
          },
          {
            $match: { 'vehicles.Type': 'bike' },
          },
          {
            $project: {
              _id: 0,
              bikesData: {
                Name: '$vehicles.Name',
                hubName: '$data.hubName',
                _id: '$vehicles._id',
                Number: '$vehicles.Number',
                Transmissiontype: '$vehicles.Transmissiontype',
                Kilometers: '$vehicles.Kilometers',
                Type: '$vehicles.Type',
                FuelType: '$Fuel_type',
                Seater: '$vehicles.Seater',
                Rent: '$vehicles.Rent',
                addDate: '$vehicles.addedon',
                vehicleImage: '$vehicles.vehicleImage',
              },
            },
          },
        ])
        .toArray();

      resolve(bikes);
    }
  }),
  getCustomers: () => new Promise(async (resolve, reject) => {
    const user = await db
      .get()
      .collection(collection.USER_COLLECTION)
      .find()
      .toArray();
    resolve(user);
  }),
  blockUser: (id) => new Promise(async (resolve, reject) => {
    await db
      .get()
      .collection(collection.USER_COLLECTION)
      .updateOne(
        { _id: ObjectId(id) },
        {
          $set: { blocked: true },
        },
      );
    resolve();
  }),
  unBlockUser: (id) => new Promise(async (resolve, reject) => {
    await db
      .get()
      .collection(collection.USER_COLLECTION)
      .updateOne(
        { _id: ObjectId(id) },
        {
          $set: { blocked: false },
        },
      );
    resolve();
  }),

  getBookings: () => new Promise(async (resolve, reject) => {
    const bookings = await db
      .get()
      .collection(collection.USER_COLLECTION)
      .aggregate([
        {
          $unwind: '$booking',
        },
        {
          $unwind: '$booking.product',
        },
        {
          $project: {
            booking: {
              UserName: '$user',
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
    resolve(bookings);
  }),

  getCompleatedBookings: () => new Promise(async (resolve, reject) => {
    const bookingData = await db
      .get()
      .collection(collection.USER_COLLECTION)
      .aggregate([
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
              UserName: '$user',
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

  getUpcomingBookings: () => new Promise(async (resolve, reject) => {
    const bookingData = await db
      .get()
      .collection(collection.USER_COLLECTION)
      .aggregate([
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
              UserName: '$user',
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

  getActiveBookings: () => new Promise(async (resolve, reject) => {
    const bookingData = await db
      .get()
      .collection(collection.USER_COLLECTION)
      .aggregate([
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
              UserName: '$user',
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

  getCancelledBookings: () => new Promise(async (resolve, reject) => {
    const bookings = await db
      .get()
      .collection(collection.USER_COLLECTION)
      .aggregate([
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
              UserName: '$user',
              _id: '$booking.product._id',
              Name: '$booking.product.Name',
              Rent: '$booking.product.Fare',
              pickUpDate: '$booking.product.pickUpDate',
              dropDate: '$booking.product.dropDate',
              Days: '$booking.product.Days',
              status: '$booking.PaymentStatus',
              pickUpLocation: '$booking.product.pickUpLocation',
              dropLocation: '$booking.product.dropLocation',
            },
          },
        },
      ])
      .toArray();
    resolve(bookings);
  }),

  getNotApprovedVendors: () => new Promise(async (resolve, reject) => {
    const vendor = await db
      .get()
      .collection(collection.VENDOR_COLLECTION)
      .find({ approved: false })
      .toArray();
    resolve(vendor);
  }),

  getApprovedVendors: () => new Promise(async (resolve, reject) => {
    const vendor = await db
      .get()
      .collection(collection.VENDOR_COLLECTION)
      .find({ approved: true })
      .toArray();
    resolve(vendor);
  }),

  changeApproveTrue: (id) => new Promise(async (resolve, reject) => {
    await db
      .get()
      .collection(collection.VENDOR_COLLECTION)
      .updateOne({ _id: ObjectId(id) }, { $set: { approved: true } });
    resolve();
  }),

  changeApprovefalse: (id) => new Promise(async (resolve, reject) => {
    await db
      .get()
      .collection(collection.VENDOR_COLLECTION)
      .updateOne({ _id: ObjectId(id) }, { $set: { approved: false } });
    resolve();
  }),

  addMessages: (message) => new Promise(async (resolve, reject) => {
    await db
      .get()
      .collection(collection.ADMIN_COLLECTION)
      .updateOne({}, { $push: { message } }, { upsert: true });
    resolve();
  }),

  getMessages: () => new Promise(async (resolve, reject) => {
    const messages = await db
      .get()
      .collection(collection.ADMIN_COLLECTION)
      .aggregate([
        { $unwind: '$message' },
        { $project: { _id: 0, message: 1 } },
      ])
      .toArray();
    resolve(messages);
  }),

  deleteMessage: (id) => new Promise(async (resolve, reject) => {
    await db
      .get()
      .collection(collection.ADMIN_COLLECTION)
      .updateOne(
        { 'message._id': ObjectId(id) },
        {
          $pull: { message: { _id: ObjectId(id) } },
        },
      );
    resolve();
  }),

  updateNotification: (message) => new Promise(async (resolve, reject) => {
    await db
      .get()
      .collection(collection.ADMIN_COLLECTION)
      .updateOne({}, { $push: { Notification: message } }, { upsert: true });
  }),

  getNotification: () => new Promise(async (resolve, reject) => {
    const notification = await db
      .get()
      .collection(collection.ADMIN_COLLECTION)
      .aggregate([
        {
          $project: { Notification: 1, _id: 0 },
        },
      ])
      .toArray();
    resolve(notification[0].Notification);
  }),

  clearNotification: () => new Promise(async (resolve, reject) => {
    await db
      .get()
      .collection(collection.ADMIN_COLLECTION)
      .updateOne({}, { $set: { Notification: [] } }, { multi: true });
    resolve();
  }),

};
