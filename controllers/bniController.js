const catchAsync = require("../utils/catchAsync");
const axios = require("axios");
const puppeteer = require("puppeteer");
const puppeteerExtra = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteerExtra.use(StealthPlugin());
const BNIs = require("../db/bni");

const getUUID = async(userId) => {
    try{
        const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Set headers and user-agent
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36 Edg/137.0.0.0"
    );

    await page.setExtraHTTPHeaders({
      "accept":
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "accept-language": "en-US,en;q=0.9",
      "upgrade-insecure-requests": "1",
    });

    // Set cookies
    await page.setCookie(
      // {
      //   name: "loggedOutStatus",
      //   value: "false",
      //   domain: "www.bniconnectglobal.com",
      // },
      // {
      //   name: "countryId",
      //   value: "3857",
      //   domain: "www.bniconnectglobal.com",
      // },
      // {
      //   name: "regionId",
      //   value: "23524",
      //   domain: "www.bniconnectglobal.com",
      // },
      // {
      //   name: "chapterId",
      //   value: "23986",
      //   domain: "www.bniconnectglobal.com",
      // },
      // {
      //   name: "logCurTime",
      //   value: "1750309616351",
      //   domain: "www.bniconnectglobal.com",
      // },
      {
        name: "JSESSIONID",
        value: "598F54B65021E17329B3E0FCCF002779",
        domain: "www.bniconnectglobal.com",
      },
      // {
      //   name: "OLDSESSIONID",
      //   value: "F458B0252A9AF571928903AD4C158E0A",
      //   domain: "www.bniconnectglobal.com",
      // },
      // {
      //   name: "lastSelectedLandingMenuId",
      //   value: "5",
      //   domain: "www.bniconnectglobal.com",
      // }
    );

    // Listen for the 302 response and capture the Location header
    let redirectLocation = null;

    page.on("response", async (response) => {
      if (
        response.url().includes(`networkHome?userId=${userId}`) &&
        response.status() === 302
      ) {
        redirectLocation = response.headers()["location"];
        console.log("Redirect location:", redirectLocation);
      }
    });

    // Navigate to the original URL
    await page.goto(
      `https://www.bniconnectglobal.com/web/secure/networkHome?userId=${userId}`,
      { waitUntil: "domcontentloaded", timeout: 0 }
    );

    await browser.close();
    return redirectLocation;
    }
    catch(error){
        console.log("Error in getting UUID:", error);
        return null;
    }

}

exports.saveBNIData = catchAsync(async (req, res) => {
  try {
    const url = "https://api.bniconnectglobal.com/connect-search-api/search/member/advanced";

    const payload = {
      search_tags: "",
      country: "Canada",
      first_name: null,
      city: "",
      last_name: null,
      state: null,
      company_name: null,
      category_id: "",
      speciality_id: "",
      locale_code: "en_IN",
      concept_id: 1,
      page_no: 1,
      per_page: 100,
    };

    const headers = {
      // Bearer token for authorization
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpbmRpdmlkdWFsVHlwZSI6Ik1FTUJFUiIsInVzZXJfbmFtZSI6InZpc2hhbEBmdXR1cmVwcm9maWxlei5jb20iLCJjb25jZXB0IjoiQ09OTkVDVCIsImluZGl2aWR1YWxJZCI6OTI0ODc1OCwiYXV0aG9yaXRpZXMiOlsiUk9MRV9VU0VSIl0sImNsaWVudF9pZCI6IklERU5USVRZX1BPUlRBTCIsImxvY2FsZUNvZGUiOiJlbl9JTiIsInNjb3BlIjpbImNvcmUiLCJwdWJsaWNfY2hhcHRlcl9kZXRhaWxzIiwiZ3JvdXBzIiwic2VhcmNoIiwidGlwcyIsInB1YmxpY190cmFuc2xhdGlvbnMiLCJtZW1iZXIiLCJvbmxpbmVfYXBwbGljYXRpb25zIiwic29jaWFsIiwicHVibGljX3BvcnRhbCJdLCJhY2NlcHRlZFRvUyI6WzhdLCJpZCI6IjE5OTY3MzUiLCJleHAiOjE3NTA0MTAyNDUsInJvbGVHcm91cHMiOlsiTUVNQkVSIl0sImp0aSI6IjFkOGRiYTRkLWUyY2YtNGFjMC05NWIwLWIwMGMxZTNiYzM4YyIsImtleSI6IjY4NTUwN2U1NTFiYjI0ZmEzNGQyOGMxMyJ9.79dVH0OorBb8GvLCxaX_l-dYUTPC7ERPmW_tjbx_Zak",
      "Content-Type": "application/json",
    };

    const response = await axios.post(url, payload, { headers });
    const results = response?.data?.content?.search_results || [];

    if (results.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No BNI data found.",
      });
    }

    const savedRecords = [];

    for (const record of results) {
      const newBNI = new BNIs({
        ...record,
      });

      const saved = await newBNI.save();
      savedRecords.push(saved);
    }

    return res.status(200).json({
      status: true,
      message: `${savedRecords.length} BNI records saved successfully.`,
      data: savedRecords,
    });
  } catch (error) {
    console.error("Error getting BNI data:", error?.response?.data || error);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
});

exports.saveBNIuuid = catchAsync(async (req, res) => {
  try {
    const data = await BNIs.find();
    const updatedRecords = [];

    for (const record of data) {
      const profileUrl = record.profile_url;
      if (!profileUrl) continue;

      const userIdMatch = profileUrl.match(/userId=(\d+)/);
      const userId = userIdMatch ? userIdMatch[1] : null;

      if (!userId) continue;

      const redirectUrl = await getUUID(userId);
      const uuidMatch = redirectUrl && redirectUrl.match(/uuId=([a-f0-9-]+)/i);
      const uuid = uuidMatch ? uuidMatch[1] : null;

      if (uuid) {
        record.uuid = uuid;
        await record.save();
        updatedRecords.push({ _id: record._id, userId, uuid });
      }
    }

    return res.status(200).json({
      status: true,
      message: `UUIDs updated for ${updatedRecords.length} records.`,
      updated: updatedRecords,
    });
  } catch (error) {
    console.log("Error capturing BNI data:", error);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
});

exports.SaveProfile = catchAsync(async (req, res) => {
  try {
    const data = await BNIs.find({uuid :{$ne: null}});
    return res.status(200).json({
      status: true,
      message: `BNIs retrieved`,
      data,
      size: data?.length || 0,
    });
  } catch (error) {
    console.log("Error capturing BNI data:", error);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
});

exports.checkApi = catchAsync(async (req, res) => {
  try {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded
      ? forwarded.split(',')[0].trim()
      : req.connection?.remoteAddress || req.socket?.remoteAddress || req.ip;

    console.log("Client IP address:", ip);

    return res.status(200).json({
      status: true,
      message: "IP address captured successfully.",
      ip,
    });
  } catch (error) {
    console.log("Error capturing IP address:", error);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
});

