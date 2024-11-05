const catchAsync = require("../utils/catchAsync");
const Key = require("../db/key");

exports.KeyAdd = catchAsync(async (req, res, next) => {
  try {
    const { value } = req.body;
    if (!value) {
      return res.status(400).json({
        status: false,
        message: "Please send a valid value!",
      });
    }
    const newData = new Key({
        value
    });
    await newData.save();
    res.status(201).json({
      status: "success",
      message: "Data Added Successfully!",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "An unknown error occurred. Please try again later.",
    });
  }
});

exports.KeyGet = catchAsync(async (req, res, next) => {
  try {
    const data=await Key.findOne({});
    console.log("data",data);
    return res.status(200).json({
        status: false,
        message: "Key retrieved successfuly!",
        key:data.value
      });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "An unknown error occurred. Please try again later.",
    }); 
  }
});

exports.KeyEdit = catchAsync(async (req, res, next) => {
  try {
    const { value } = req.body;
    if (!value) {
      return res.status(400).json({
        status: false,
        message: "Value can't be empty!",
      });
    }
    const updatedValue = await Key.findOneAndUpdate(
      {},
      { value },
      { new: true }
    );
    if (!updatedValue) {
      return res.status(404).json({
        status: false,
        message: "Key not found!",
      });
    }
    return res.status(200).json({
      status: true,
      message: "Value updated successfully!",
      data: updatedValue.value,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "An unknown error occurred. Please try again later.",
    });
  }
});