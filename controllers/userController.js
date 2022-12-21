const User = require('../models/userModel');
const sharp = require('sharp')
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');
const multer = require('multer');

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb)=>{
//     cb(null,'public/img/users' )
//   },
//   filename: (req, file, cb)=>{
//     const ext = file.mimetype.split('/')[1]
//     cb(null,  `user-${req.user.id}-${Date.now()}.${ext}`)
//   }
// })

const multerStorage = multer.memoryStorage()

const multerFilter =(req,file, cb)=> {
  if(file.mimetype.startsWith('image ')){
    cb(null, true)
  } else {
    cb(new AppError("Please upload only image", 404), false)
  }
}

const upload = multer({
  storage:multerStorage,
  fileFilter:multerFilter
})

exports.uploadUserPhoto = upload.single('photo')

exports.resizeUserPhoto = async (req, res, next)=>{
  if(!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`

  await sharp(req.file.buffer).resize(500,500).toFormat('jpeg').jpeg({quality:90}).toFile(`public/img/users/${req.file.filename}`)

  next()
}

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

exports.getMe = (req,res,next)=>{
  req.params.id=req.user.id;
  next()
}

// USERS
exports.getAllUsers = factory.getAll(User)
// exports.getAllUsers = catchAsync(async (req, res, next) => {
//   const users = await User.find();

//   // SEND RESPONSE
//   res.status(200).json({
//     status: 'success',
//     results: users.length,
//     data: {
//       users,
//     },
//   });
// });

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('You cant do this here, ', 400));
  }
  const filterBody = filterObj(req.body, 'name', 'email');

  if(req.file) filterBody.photo= req.file.filename

  const user = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: {
      data: null,
    },
  });
});

exports.getUser = factory.getOne(User)
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Use signup',
  });
};
// exports.getUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'This route is not ready',
//   });
// };
exports.updateUser = factory.updateOne(User)

// exports.updateUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'This route is not ready',
//   });
// };
exports.deleteUser = factory.deleteOne(User)
// exports.deleteUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'This route is not ready',
//   });
// };
