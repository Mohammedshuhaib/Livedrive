const { ObjectId } = require('mongodb');
const db = require('../database/connection');
const collection = require('../database/collection');

module.exports = {
  addvehicle: (vehicleData, vehcileImg, vendorId) => {
    const vehicles = {
      _id: new ObjectId(),
      Number: vehicleData.vehicleNumber,
      Name: vehicleData.vehicleName,
      Type: vehicleData.type,
      Transmissiontype: vehicleData.transmissionType,
      Kilometers: vehicleData.Kilometers,
      Fuel_type: vehicleData.fuelType,
      Seater: vehicleData.seater,
      Rent: vehicleData.Rent,
      addedOn: new Date(),
      catogory: vehicleData.Catagory,
      Actype: vehicleData.Actype,
      vehicleImage: vehcileImg,
      deleted: false,
    };
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.VENDOR_COLLECTION)
        .updateOne(
          { _id: ObjectId(vendorId) },
          {
            $push: {
              vehicles: { ...vehicles },
            },
          },
          { upsert: true }
        )
        .then(() => {
          resolve(vehicles._id);
        });
    });
  },

  showCars: (hub) =>
    new Promise(async (resolve, reject) => {
      const cars = await db
        .get()
        .collection(collection.VENDOR_COLLECTION)
        .aggregate([
          { $unwind: '$vehicles' },
          {
            $match: {
              'vehicles.deleted': false,
              'vehicles.Type': 'car',
              'data.hubName': hub,
            },
          },
          {
            $project: {
              cars: {
                Name: '$vehicles.Name',
                Number: '$vehicles.Number',
                Kilometers: '$vehicles.Kilometers',
                Rent: '$vehicles.Rent',
                vehicleImage: '$vehicles.vehicleImage',
                _id: '$vehicles._id',
              },
            },
          },
        ])
        .toArray();
      if (cars.length === 0) {
        resolve(null);
      } else {
        resolve(cars);
      }
    }),

  showBikes: (hub) =>
    new Promise(async (resolve, reject) => {
      const bike = await db
        .get()
        .collection(collection.VENDOR_COLLECTION)
        .aggregate([
          { $unwind: '$vehicles' },
          {
            $match: {
              'vehicles.deleted': false,
              'vehicles.Type': 'bike',
              'data.hubName': hub,
            },
          },
          {
            $project: {
              bikes: {
                Name: '$vehicles.Name',
                Number: '$vehicles.Number',
                Kilometers: '$vehicles.Kilometers',
                Rent: '$vehicles.Rent',
                vehicleImage: '$vehicles.vehicleImage',
                _id: '$vehicles._id',
              },
            },
          },
        ])
        .toArray();
      if (bike.length === 0) {
        resolve(null);
      } else {
        resolve(bike);
      }
    }),

  findSingVehicle: (id) =>
    new Promise(async (resolve, reject) => {
      const info = await db
        .get()
        .collection(collection.VENDOR_COLLECTION)
        .aggregate([
          { $unwind: '$vehicles' },
          { $match: { 'vehicles._id': ObjectId(id) } },
          {
            $project: {
              _id: 0,
              username: 0,
              email: 0,
              password: 0,
              hubName: 0,
              country: 0,
            },
          },
        ])
        .toArray();
      resolve(info[0]);
    }),

  updateSingleVehicle: (id, vehicleData) =>
    new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.VENDOR_COLLECTION)
        .updateOne(
          { 'vehicles._id': ObjectId(id) },
          {
            $set: {
              'vehicles.$.Number': vehicleData.vehicleNumber,
              'vehicles.$.Name': vehicleData.vehicleName,
              'vehicles.$.Type': vehicleData.type,
              'vehicles.$.Transmissiontype': vehicleData.transmissionType,
              'vehicles.$.Kilometers': vehicleData.Kilometers,
              'vehicles.$.Fuel_type': vehicleData.fuelType,
              'vehicles.$.Seater': vehicleData.seater,
              'vehicles.$.Rent': vehicleData.Rent,
              'vehicles.$.catogory': vehicleData.Catagory,
              'vehicles.$.Actype': vehicleData.Actype,
            },
          }
        )
        .then((response) => {
          resolve(response);
        });
    }),

  updatevehicleImg: (vehicleId, vehicleimg) =>
    new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.VENDOR_COLLECTION)
        .updateOne(
          { 'vehicles._id': ObjectId(vehicleId) },
          {
            $set: { 'vehicles.$.vehicleImage': vehicleimg },
          }
        );
      resolve();
    }),

  deleteVehicle: (id) =>
    new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.VENDOR_COLLECTION)
        .updateOne(
          { 'vehicles._id': ObjectId(id) },
          {
            $set: {
              'vehicles.$.deleted': true,
            },
          },
        )
        .then((response) => {
          resolve(response);
        })
        .catch(() => {
          console.log('not updated');
        });
    }),
  getAllVehicles: (purpose, location, pickDate, dropDate) =>
    new Promise(async (resolve, reject) => {
      if (purpose == 'bike') {
        const bikes = await db
          .get()
          .collection(collection.VENDOR_COLLECTION)
          .aggregate([
            { $unwind: '$vehicles' },
            {
              $match: {
                'vehicles.deleted': false,
                'vehicles.Type': 'bike',
                'data.hubName': location,
              },
            },
            {
              $project: {
                bikes: {
                  Name: '$vehicles.Name',
                  _id: '$vehicles._id',
                  Transmissiontype: '$vehicles.Transmissiontype',
                  Seater: '$vehicles.Seater',
                  Rent: '$vehicles.Rent',
                  vehicleImage: '$vehicles.vehicleImage',
                },
              },
            },
          ])
          .toArray();
        const booked = await db
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
              $match: {
                $or: [
                  {
                    $and: [
                      { 'booking.product.dropDate': { $gte: pickDate } },
                      { 'booking.product.pickUpDate': { $lte: dropDate } },
                    ],
                  },
                  {
                    $and: [
                      { 'booking.product.dropDate': { $gte: dropDate } },
                      { 'booking.product.pickUpDate': { $lte: pickDate } },
                    ],
                  },
                ],
              },
            },
            {
              $project: {
                booking: '$booking.product',
              },
            },
          ])
          .toArray();
        for (const i in bikes) {
          for (const j in booked) {
            if (bikes[i].bikes._id.toString() === booked[j].booking._id) {
              bikes.splice(i, 1);
            }
          }
        }
        resolve(bikes);
      } else {
        const cars = await db
          .get()
          .collection(collection.VENDOR_COLLECTION)
          .aggregate([
            { $unwind: '$vehicles' },
            {
              $match: {
                'vehicles.deleted': false,
                'vehicles.Type': 'car',
                'data.hubName': location,
              },
            },
            {
              $project: {
                cars: {
                  Name: '$vehicles.Name',
                  _id: '$vehicles._id',
                  Transmissiontype: '$vehicles.Transmissiontype',
                  Seater: '$vehicles.Seater',
                  Rent: '$vehicles.Rent',
                  vehicleImage: '$vehicles.vehicleImage',
                },
              },
            },
          ])
          .toArray();
        const booked = await db
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
              $match: {
                $or: [
                  {
                    $and: [
                      { 'booking.product.dropDate': { $gte: pickDate } },
                      { 'booking.product.pickUpDate': { $lte: dropDate } },
                    ],
                  },
                  {
                    $and: [
                      { 'booking.product.dropDate': { $gte: dropDate } },
                      { 'booking.product.pickUpDate': { $lte: pickDate } },
                    ],
                  },
                ],
              },
            },
            {
              $project: {
                booking: '$booking.product',
              },
            },
          ])
          .toArray();
        for (const i in cars) {
          for (const j in booked) {
            if (cars[i].cars._id.toString() === booked[j].booking._id) {
              cars.splice(i, 1);
            }
          }
        }
        resolve(cars);
      }
    }),
};
