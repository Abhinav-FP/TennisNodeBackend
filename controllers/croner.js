const axios = require("axios");
const fs = require("fs").promises;

// Email logic
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // Using Gmail service
  port: 587, // Port for TLS
  secure: false, // Use false for port 587
  auth: {
    user: process.env.USER, // Your Gmail address
    pass: process.env.APP_PASSWORD, // Your app password
  },
  tls: {
    rejectUnauthorized: false, // Optional: Only use if you encounter certificate issues
  },
});

const sendMail = async (mailOptions) => {
  try {
    const info = await transporter.sendMail(mailOptions);
    if (info.messageId) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log("Mail error:", error);
    return false;
  }
};

const isValidUrl = async (url) => {
  try {
    const response = await axios.head(url);
    return response.status === 200;
  } catch (err) {
    return false;
  }
};

exports.cronerFunction = async () => {
  try {
    console.log("Croner job started");
    const data = await fs.readFile("./controllers/date.json", "utf8");
    const jsonData = JSON.parse(data);
    let startDate = jsonData.date;
    let currentDate = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    currentDate.setDate(currentDate.getDate() + 1);

    while (currentDate <= today) {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const day = String(currentDate.getDate()).padStart(2, "0");
      let url = `https://aitatennis.com/management/upload/ranking/${year}-${month}-${day}_BU-12.pdf`;
      const valid = await isValidUrl(url);

      if (valid) {
        const mailOptions = {
          from: process.env.USER, // sender address
          // to: "a.mathur@futureprofilez.com, naveen@internetbusinesssolutionsindia.com", // list of receivers
          to: "a.mathur@futureprofilez.com",
          subject: "New data has arrived on aita", // Subject line
          html: `
  <html>
    <body style="text-align: center; margin: 0; padding: 10px; background-color: #000000; color: #ffffff;" align="center">
      <!-- Start container for logo -->
      <table align="center" style="width: 600px; max-width: 600px; background-color: #000000;" width="600">
        <tbody>
          <tr>
            <td style="padding: 15px;" width="596">
              <!-- Your logo is here -->
              <div style="text-align: center;">
                <img alt="Logo" src="https://cdn.tenniskhelo.com/main-tenniskhelo-logo.svg" width="200" height="auto" style="display: block; margin: 0 auto;">
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <table align="center" style="width: 600px; max-width: 600px; background-color: #000000;" width="600">
        <tbody>
          <tr>
            <td style="padding: 30px;" width="596">
              <h1 style="font-size: 20px; line-height: 24px; font-family: 'Helvetica', Arial, sans-serif; font-weight: 600; color: #ffffff;">Update Ranking Data</h1>
              <p style="font-size: 15px; line-height: 24px; font-family: 'Helvetica', Arial, sans-serif; font-weight: 400; color: #ffffff;">This is a system-generated email to inform you that new data has arrived on the AITA website for date-${year}-${month}-${day}. Please update it.</p>
            </td>
          </tr>
        </tbody>
      </table>
    </body>
  </html>
`
        };
        // Send email
        try {
          const sendMailResponse = await sendMail(mailOptions);
          if (!sendMailResponse) {
            throw new Error("Failed to send email");
          }
          console.log("Email sent successfully");
        } catch (error) {
          console.log("Error in sending email:", error);
        }
        console.log(`Valid URL found: ${year}-${month}-${day}`);
        break;
      }
      // console.log(`Checked: ${year}-${month}-${day}`);
      currentDate.setDate(currentDate.getDate() + 1);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};
