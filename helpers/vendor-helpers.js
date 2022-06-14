const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
const db = require('../database/connection');
const collection = require('../database/collection');
const vehicleHelpers = require('./vehicle-helpers');

module.exports = {
  // for signup vendor
  dosignup: (data, idProof) => new Promise(async (resolve, reject) => {
    const userData = {
      data,
      idproof: idProof,
      approved: false,
    };
    data.password = await bcrypt.hash(data.password, 10);
    await db
      .get()
      .collection(collection.VENDOR_COLLECTION)
      .insertOne(userData)
      .then((response) => {
        resolve(response);
      });
  }),

  // for vendor login

  doLogin: (data) => {
    const response = {};
    return new Promise(async (resolve, reject) => {
      const vendor = await db
        .get()
        .collection(collection.VENDOR_COLLECTION)
        .findOne({ 'data.username': data.username });
      if (vendor) {
        bcrypt.compare(data.password, vendor.data.password).then((result) => {
          if (result) {
            response.status = true;
            response.vendorid = vendor._id;
            response.vendor = vendor;
            response.hub = vendor.data.hubName;
            response.Name = vendor.data.username;
            console.log('login succes');
            resolve(response);
          } else {
            console.log('password incorrect');
            reject({ loginError: true });
          }
        });
      } else {
        console.log('login faild');
        reject({ loginError: true });
      }
    });
  },

  getHubName: () => new Promise(async (resolve, reject) => {
    const hubName = db
      .get()
      .collection(collection.VENDOR_COLLECTION)
      .aggregate([{ $project: { 'data.hubName': 1, _id: 0 } }])
      .toArray();
    resolve(hubName);
  }),

  getBookings: (hub) => new Promise(async (resolve, reject) => {
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
          $match: { 'booking.product.pickUpLocation': hub },
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

  getCompleatedBookings: (hub) => new Promise(async (resolve, reject) => {
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
          $match: { 'booking.product.dropLocation': hub },
        },
        {
          $match: { 'booking.PaymentStatus': 'success' },
        },
        {
          $match: { 'booking.product.approved': true },
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

  getUpcomingBookings: (hub) => new Promise(async (resolve, reject) => {
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
          $match: { 'booking.product.pickUpLocation': hub },
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

  getActiveBookings: (hub) => new Promise(async (resolve, reject) => {
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
          $match: { 'booking.product.pickUpLocation': hub },
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

  getCancelledBookings: (hub) => new Promise(async (resolve, reject) => {
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
          $match: { 'booking.product.pickUpLocation': hub },
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
              vehicleImage: '$booking.product.vehicleImage',
            },
          },
        },
      ])
      .toArray();
    resolve(bookings);
  }),
  getSingleVendor: (id) => new Promise(async (resolve, reject) => {
    const vendorData = await db
      .get()
      .collection(collection.VENDOR_COLLECTION)
      .aggregate([
        {
          $match: { _id: ObjectId(id) },
        },
        {
          $project: {
            Name: '$data.username',
            mobile: '$data.mobileNumber',
            email: '$data.email',
            address: '$data.address',
            country: '$data.country',
            hubName: '$data.hubName',
            experience: '$data.expreience',
            education: '$data.education',
            additionalData: '$data.additionalData',
            idproof: '$idproof',
            password: '$data.password',
            _id: '$_id',
          },
        },
      ])
      .toArray();

    resolve(vendorData[0]);
  }),

  getApprovedBookings: (hub) => new Promise(async (resolve, reject) => {
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
          $match: { 'booking.product.dropLocation': hub },
        },
        {
          $match: { 'booking.PaymentStatus': 'success' },
        },
        {
          $match: { 'booking.product.approved': false },
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
              bookingId: '$booking._id',
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
  updateVendor: (vendorId, vendorData) => new Promise(async (resolve, reject) => {
    console.log(vendorId, vendorData);
    await db
      .get()
      .collection(collection.VENDOR_COLLECTION)
      .updateOne(
        {
          _id: ObjectId(vendorId),
        },
        {
          $set: { data: vendorData },
        },
      );
    resolve();
  }),

  updateId: (vendorId, idImage) => new Promise(async (resolve, reject) => {
    await db
      .get()
      .collection(collection.VENDOR_COLLECTION)
      .updateOne(
        {
          _id: ObjectId(vendorId),
        },
        {
          $set: { idproof: idImage },
        },
      );
  }),

  changeLocation: (data) => new Promise(async (resolve, reject) => {
    const response = await db
      .get()
      .collection(collection.USER_COLLECTION)
      .updateOne(
        {
          'booking._id': ObjectId(data.bookingId),
          'booking.product._id': data.productId,
          user: data.userName,
        },
        { $set: { 'booking.$[i].product.$[j].approved': true } },
        { arrayFilters: [{ 'i._id': ObjectId(data.bookingId) }, { 'j._id': data.productId }] },
      );
    await db
      .get()
      .collection(collection.VENDOR_COLLECTION)
      .updateOne(
        {
          'data.hubName': data.pickLocation,
          'vehicles._id': ObjectId(data.productId),
        },
        { $set: { 'vehicles.$.Kilometers': data.result } },
      );
    if (data.pickLocation != data.dropLocation) {
      let vehicleData = await db
        .get()
        .collection(collection.VENDOR_COLLECTION)
        .aggregate([
          {
            $unwind: '$vehicles',
          },
          {
            $match: { 'vehicles._id': ObjectId(data.productId) },
          },
          {
            $project: {
              vehicles: 1,
            },
          },
        ])
        .toArray();
      vehicleData = vehicleData[0];
      const response = await db
        .get()
        .collection(collection.VENDOR_COLLECTION)
        .updateOne(
          { 'data.hubName': data.dropLocation },
          {
            $push: { vehicles: vehicleData.vehicles },
          },
        );
      await db
        .get()
        .collection(collection.VENDOR_COLLECTION)
        .updateOne(
          {
            'data.hubName': data.pickLocation,
            'vehicles._id': ObjectId(data.productId),
          },
          {
            $pull: { vehicles: { _id: ObjectId(data.productId) } },
          },
          { upsert: true },
        );
      resolve({ updated: true });
    } else {
      resolve({ updated: false });
    }
  }),
};
