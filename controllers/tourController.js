const fs = require('fs');
const Tour = require('../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// TOURS
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// CHECK ID MIDDLE WARE
// exports.checkID = (req, res, next, val) => {
//   const id = req.params.id * 1;
//   if (!id || id > tours.length || id < 1) {
//     return res.status(404).json({
//       status: 'failed request',
//       message: 'Tour not found',
//     });
//   }
//   next();
// };

// CHECK BODY MIDDE WARE
// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Missing name or price',
//     });
//   }
//   next();
// };

exports.aliasTopTour = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  // // QUERYING BY FILTERING
  // const queryObj = { ...req.query };

  // const excludedField = ['page', 'sort', 'limit', 'fields'];

  // excludedField.forEach((el) => delete queryObj[el]);

  // // console.log(req.query, queryObj);
  // // ADVANCED FILTERING
  // let queryStr = JSON.stringify(queryObj);
  // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

  // // BUILDING THE QUERY
  // let query = Tour.find(JSON.parse(queryStr));

  //  SORTING
  // if (req.query.sort) {
  //   const sortBy = req.query.sort.split(',').join(' ');
  //   console.log(sortBy);
  //   query = query.sort(sortBy);
  // } else {
  //   query = query.sort('-createdAt');
  // }
  // // FIELD LIMITING
  // if (req.query.fields) {
  //   const fields = req.query.fields.split(',').join(' ');
  //   query = query.select(fields);
  // } else {
  //   query = query.select('-__v');
  // }

  // // PAGINATION
  // const page = req.query.page * 1 || 1;
  // const limit = req.query.limit * 1 || 100;
  // const skip = (page - 1) * limit;

  // query = query.skip(skip).limit(limit);
  // if (req.query.page) {
  //   const numTours = await Tour.countDocuments();
  //   if (skip > numTours) throw new Error('This page does not exist');
  // }

  // EXECUTING THE QUERY
  const features = new APIFeatures(Tour.find(), req.query)
    .toFilter()
    .sort()
    .limiting()
    .pagination();
  const tours = await features.query;

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });

  // res.status(200).json({
  //   status: 'success',
  //   requestTime: req.requestTime,
  //   data: {
  //     tours,
  //   },
  // });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id).populate('reviews');
  if (!tour) {
    return next(new AppError('No tour found with  that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });

  // const id = req.params.id * 1;
  // const tour = tours.find((t) => t.id === id);
  // res.status(200).json({
  //   status: 'success',
  //   data: {
  //     tours: tour,
  //   },
  // });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
      // try {
      //   const newTour = await Tour.create(req.body);
      //   res.status(201).json({
      //     status: 'success',
      //     data: {
      //       tour: newTour,
      //     },
      //   });
      // } catch (error) {
      //   res.status(400).json({
      //     status: 'fail',
      //     message: error,
      //   });
    },
  });

  // WORKING WITH OUR LOCAL JSON API
  // const newID = tours[tours.length - 1].id + 1;
  // const newTour = Object.assign({ id: newID }, req.body);
  // tours.push(newTour);
  // fs.writeFile(
  //   `${__dirname}/../dev-data/data/tours-simple.json`,
  //   JSON.stringify(tours),
  //   (err) => {
  //     res.status(201).json({
  //       status: 'success',
  //       data: {
  //         tours: newTour,
  //       },
  //     });
  //   }
  // );
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!tour) {
    return next(new AppError('No tour found with  that ID', 404));
  }

  res.status(201).json({
    status: 'success',
    data: {
      tour,
    },
  });
});
exports.putTour = catchAsync(async (req, res, next) => {
  // try {
  //   const tour = await Tour.findById(req.params.id);
  //   res.status(200).json({
  //     status: 'success',
  //     data: {
  //       tour,
  //     },
  //   });
  // } catch (error) {
  //   res.status(404).json({
  //     status: 'fail',
  //     message: error,
  //   })
  // }
});
exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) {
    return next(new AppError('No tour found with  that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: {},
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: '$difficulty',
        numTours: { $sum: 1 },
        numRating: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: {
          $sum: 1,
        },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: {
        month: '$_id',
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 6,
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});
