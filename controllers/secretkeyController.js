const catchAsync = require("../utils/catchAsync");
const Key = require("../db/key");
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

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


const sesClient = new SESClient({
  region: process?.env?.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process?.env?.ACCESS_KEY || "",
    secretAccessKey: process?.env?.SECRET_ACCESS_KEY || ""
  }
});

// Function to send email
const sendEmail = async (toEmail, subject, message) => {
  const params = {
    Source: "a.mathur@futureprofilez.com",
    Destination: {
      ToAddresses: [toEmail],
    },
    Message: {
      Subject: {
        Data: subject,
      },
      Body: {
        Html: {
          Data: message,
        },
      },
    },
  };

  const command = new SendEmailCommand(params);
  return sesClient.send(command);
};

// Express route handler (assuming `catchAsync` is defined elsewhere)
exports.SendEmail = catchAsync(async (req, res, next) => {
  try {
    const { toEmail, subject, message } = req.body; // Extract values from request
    const response = await sendEmail(toEmail, subject, message);

    console.log("Email sent! Message ID:", response.MessageId);
    res.status(200).json({ success: true, messageId: response.MessageId });
  } catch (error) {
    console.error("Error sending email:", error);
    next(error); // Pass error to error handler
  }
});
