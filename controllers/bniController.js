const catchAsync = require("../utils/catchAsync");
const axios = require("axios");
const puppeteer = require("puppeteer");
const puppeteerExtra = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteerExtra.use(StealthPlugin());
const BNIs = require("../db/bni");
const cheerio = require('cheerio');

// const getUUID = async(userId) => {
//     try{
//         const browser = await puppeteer.launch({ headless: true });
//     const page = await browser.newPage();

//     // Set headers and user-agent
//     await page.setUserAgent(
//       "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36 Edg/137.0.0.0"
//     );

//     await page.setExtraHTTPHeaders({
//       "accept":
//         "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
//       "accept-language": "en-US,en;q=0.9",
//       "upgrade-insecure-requests": "1",
//     });

//     // Set cookies
//     await page.setCookie(
//       // {
//       //   name: "loggedOutStatus",
//       //   value: "false",
//       //   domain: "www.bniconnectglobal.com",
//       // },
//       // {
//       //   name: "countryId",
//       //   value: "3857",
//       //   domain: "www.bniconnectglobal.com",
//       // },
//       // {
//       //   name: "regionId",
//       //   value: "23524",
//       //   domain: "www.bniconnectglobal.com",
//       // },
//       // {
//       //   name: "chapterId",
//       //   value: "23986",
//       //   domain: "www.bniconnectglobal.com",
//       // },
//       // {
//       //   name: "logCurTime",
//       //   value: "1750309616351",
//       //   domain: "www.bniconnectglobal.com",
//       // },
//       {
//         name: "JSESSIONID",
//         value: "598F54B65021E17329B3E0FCCF002779",
//         domain: "www.bniconnectglobal.com",
//       },
//       // {
//       //   name: "OLDSESSIONID",
//       //   value: "F458B0252A9AF571928903AD4C158E0A",
//       //   domain: "www.bniconnectglobal.com",
//       // },
//       // {
//       //   name: "lastSelectedLandingMenuId",
//       //   value: "5",
//       //   domain: "www.bniconnectglobal.com",
//       // }
//     );

//     // Listen for the 302 response and capture the Location header
//     let redirectLocation = null;

//     page.on("response", async (response) => {
//       if (
//         response.url().includes(`networkHome?userId=${userId}`) &&
//         response.status() === 302
//       ) {
//         redirectLocation = response.headers()["location"];
//         console.log("Redirect location:", redirectLocation);
//       }
//     });

//     // Navigate to the original URL
//     await page.goto(
//       `https://www.bniconnectglobal.com/web/secure/networkHome?userId=${userId}`,
//       { waitUntil: "domcontentloaded", timeout: 0 }
//     );

//     await browser.close();
//     return redirectLocation;
//     }
//     catch(error){
//         console.log("Error in getting UUID:", error);
//         return null;
//     }

// }

// exports.saveBNIData = catchAsync(async (req, res) => {
//   try {
//     const url = "https://api.bniconnectglobal.com/connect-search-api/search/member/advanced";

//     const payload = {
//       search_tags: "",
//       country: "Canada",
//       first_name: null,
//       city: "",
//       last_name: null,
//       state: null,
//       company_name: null,
//       category_id: "",
//       speciality_id: "",
//       locale_code: "en_IN",
//       concept_id: 1,
//       page_no: 1,
//       per_page: 100,
//     };

//     const headers = {
//       // Bearer token for authorization
//       Authorization:
//         "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpbmRpdmlkdWFsVHlwZSI6Ik1FTUJFUiIsInVzZXJfbmFtZSI6InZpc2hhbEBmdXR1cmVwcm9maWxlei5jb20iLCJjb25jZXB0IjoiQ09OTkVDVCIsImluZGl2aWR1YWxJZCI6OTI0ODc1OCwiYXV0aG9yaXRpZXMiOlsiUk9MRV9VU0VSIl0sImNsaWVudF9pZCI6IklERU5USVRZX1BPUlRBTCIsImxvY2FsZUNvZGUiOiJlbl9JTiIsInNjb3BlIjpbImNvcmUiLCJwdWJsaWNfY2hhcHRlcl9kZXRhaWxzIiwiZ3JvdXBzIiwic2VhcmNoIiwidGlwcyIsInB1YmxpY190cmFuc2xhdGlvbnMiLCJtZW1iZXIiLCJvbmxpbmVfYXBwbGljYXRpb25zIiwic29jaWFsIiwicHVibGljX3BvcnRhbCJdLCJhY2NlcHRlZFRvUyI6WzhdLCJpZCI6IjE5OTY3MzUiLCJleHAiOjE3NTA0MTAyNDUsInJvbGVHcm91cHMiOlsiTUVNQkVSIl0sImp0aSI6IjFkOGRiYTRkLWUyY2YtNGFjMC05NWIwLWIwMGMxZTNiYzM4YyIsImtleSI6IjY4NTUwN2U1NTFiYjI0ZmEzNGQyOGMxMyJ9.79dVH0OorBb8GvLCxaX_l-dYUTPC7ERPmW_tjbx_Zak",
//       "Content-Type": "application/json",
//     };

//     const response = await axios.post(url, payload, { headers });
//     const results = response?.data?.content?.search_results || [];

//     if (results.length === 0) {
//       return res.status(404).json({
//         status: false,
//         message: "No BNI data found.",
//       });
//     }

//     const savedRecords = [];

//     for (const record of results) {
//       const newBNI = new BNIs({
//         ...record,
//       });

//       const saved = await newBNI.save();
//       savedRecords.push(saved);
//     }

//     return res.status(200).json({
//       status: true,
//       message: `${savedRecords.length} BNI records saved successfully.`,
//       data: savedRecords,
//     });
//   } catch (error) {
//     console.error("Error getting BNI data:", error?.response?.data || error);
//     return res.status(500).json({
//       status: false,
//       message: "Internal Server Error",
//     });
//   }
// });

// exports.saveBNIuuid = catchAsync(async (req, res) => {
//   try {
//     const data = await BNIs.find();
//     const updatedRecords = [];

//     for (const record of data) {
//       const profileUrl = record.profile_url;
//       if (!profileUrl) continue;

//       const userIdMatch = profileUrl.match(/userId=(\d+)/);
//       const userId = userIdMatch ? userIdMatch[1] : null;

//       if (!userId) continue;

//       const redirectUrl = await getUUID(userId);
//       const uuidMatch = redirectUrl && redirectUrl.match(/uuId=([a-f0-9-]+)/i);
//       const uuid = uuidMatch ? uuidMatch[1] : null;

//       if (uuid) {
//         record.uuid = uuid;
//         await record.save();
//         updatedRecords.push({ _id: record._id, userId, uuid });
//       }
//     }

//     return res.status(200).json({
//       status: true,
//       message: `UUIDs updated for ${updatedRecords.length} records.`,
//       updated: updatedRecords,
//     });
//   } catch (error) {
//     console.log("Error capturing BNI data:", error);
//     return res.status(500).json({
//       status: false,
//       message: "Internal Server Error",
//     });
//   }
// });

// exports.SaveProfile = catchAsync(async (req, res) => {
//   try {
//     const data = await BNIs.find({uuid :{$ne: null}});
//     return res.status(200).json({
//       status: true,
//       message: `BNIs retrieved`,
//       data,
//       size: data?.length || 0,
//     });
//   } catch (error) {
//     console.log("Error capturing BNI data:", error);
//     return res.status(500).json({
//       status: false,
//       message: "Internal Server Error",
//     });
//   }
// });

const urls =[
   "https://bnialberta.ca/bniadvantage/en-CA/memberlist",
  "https://bnialberta.ca/bniaggregate/en-CA/memberlist",
  "https://bnialberta.ca/bniapex/en-CA/memberlist",
  "https://bnialberta.ca/bniascension/en-CA/memberlist",
  "https://bnialberta.ca/bniblackgold/en-CA/memberlist?chapterName=17661&regionIds=17115$isChapterwebsite",
  "https://bnicanada.ca/en-CA/chapterdetail?chapterId=bVoLWVspnkrqUP9r3YeGkQ%3D%3D&name=BNI+BNI+Business+Pillars+%28Edmonton+West%2C+AB%29",
  "https://bnialberta.ca/bnicapitalconnections/en-CA/memberlist",
  "https://bnialberta.ca/bnidynamicconnections/en-CA/memberlist",
  "https://bnibc.ca/bc-lower-mainland-(south-east)-bni-edge/en-CA/memberlist",
  "https://bnicanada.ca/en-CA/chapterdetail?chapterId=NFIjaeIzxcPDKneAwuefng%3D%3D&name=BNI+BNI+Elite",
  "https://bnialberta.ca/bnienterprise/en-CA/memberlist",
  "https://bnialberta.ca/bnifortunebuilders/en-CA/memberlist",
  "https://bnialberta.ca/bniignite/en-CA/memberlist",
  "https://bnicanada.ca/en-CA/chapterdetail?chapterId=b0iR4ivn2nvp6%2FwsC%2BUIQQ%3D%3D&name=BNI+BNI+Infinity+%28Edmonton+South%2C+AB%29",
  "https://bnialberta.ca/bniintegrity/en-CA/memberlist",
  "https://bnialberta.ca/en-CA/chapterdetail?chapterId=Gn5uO%2FH%2F5didYVMtbgO8Zg%3D%3D&name=BNI+BNI+Mavericks+%28Edmonton+South%2C+AB%29",
  "https://bnialberta.ca/bninorthernconnections/en-CA/memberlist?chapterName=17712&regionIds=17115$isChapterwebsite",
  "https://bnialberta.ca/bninorthstars/en-CA/memberlist?chapterName=17496&regionIds=17115$isChapterwebsite",
  "https://bnialberta.ca/bninorthwestsuccess/en-CA/memberlist?chapterName=17703&regionIds=17115$isChapterwebsite",
  "https://bnialberta.ca/bniparkland/en-CA/memberlist",
  "https://bnialberta.ca/bniparkpowerconnections/en-CA/memberlist?chapterName=17373&regionIds=17115$isChapterwebsite",
  "https://bnialberta.ca/en-CA/chapterdetail?chapterId=21HeCSM4HAMmi4tRmOSDHg%3D%3D&name=BNI+BNI+Premiere+%28Edmonton+West%2C+AB%29",
  "https://bnialberta.ca/bnireferralmasters/en-CA/memberlist?chapterName=17617&regionIds=17115$isChapterwebsite",
  "https://bnialberta.ca/bnirevolution/en-CA/memberlist?chapterName=19259&regionIds=17115$isChapterwebsite",
  "https://bnialberta.ca/bnirivercity/en-CA/memberlist",
  "https://bnialberta.ca/bnisaintcity/en-CA/memberlist?chapterName=17582&regionIds=17115$isChapterwebsite",
  "https://bnialberta.ca/bnititans/en-CA/memberlist?chapterName=17678&regionIds=17115$isChapterwebsite",
  "https://bnicanada.ca/en-CA/chapterdetail?chapterId=pCWeXek05OBK7jZD%2Bjdqyg%3D%3D&name=BNI+BNI+Vista+%28Edmonton+North%2C+AB%29",
  "https://bnicanada.ca/en-CA/chapterdetail?chapterId=whcCNBA7uX7hA3QJAfZGvg%3D%3D&name=BNI+BNI+ARC",
  "https://bnicanada.ca/en-CA/chapterdetail?chapterId=%2Ffqbf1Hsl40qsKNUTKD4Rg%3D%3D&name=BNI+BNI+Business+Accelerators",
  "https://bnicanada.ca/en-CA/chapterdetail?chapterId=BL3By%2Fz9ULTPxy92x10CMg%3D%3D&name=BNI+BNI+Business+Leaders",
  "https://bniosw.ca/ont--southwest-bni-cornerstone/en-CA/memberlist",
  "https://bniosw.ca/ont--southwest-bni-forest-city/en-CA/memberlist?chapterName=23993&regionIds=17117,17126$isChapterwebsite",
  "https://bniosw.ca/ont--southwest-bni-impact/en-CA/memberlist",
  "https://bniosw.ca/ont--southwest-bni-london-leaders/en-CA/memberlist?chapterName=39774&regionIds=17117,17126$isChapterwebsite",
  "https://bniosw.ca/ont--southwest-bni-midday-momentum/en-CA/memberlist",
  "https://bniosw.ca/ont--southwest-bni-money-makers/en-CA/memberlist?chapterName=27972&regionIds=17117,17126$isChapterwebsite",
  "https://bniosw.ca/ont--southwest-bni-tnt/en-CA/memberlist",
  "https://bnisalberta.ca/BNI-Excellence/",
  "https://bnisalberta.ca/BNI-Executive-Group/",
  "https://bnisalberta.ca/BNI-rise/",
  "https://bnisalberta.ca/BNI-vibe/",
  "https://bnisalberta.ca/BNI-integrity/",
  "https://bnisalberta.ca/BNI-knights/",
  "https://bnisalberta.ca/BNI-Elite/",
  "https://bnisalberta.ca/BNI-Entrepreneurs/",
  "https://bnisalberta.ca/BNI-Rocky-Mountain-Thunder/",
  "https://bnisalberta.ca/bni-optimum/",
  "https://bnisalberta.ca/bni-inspire/",
  "https://bnisalberta.ca/bni-windy-city/",
  "https://bnisalberta.ca/bni-key-connections/",
  "https://bnisalberta.ca/bni-elevate/",
  "https://bnisalberta.ca/bni-platinum/",
  "https://bnisalberta.ca/bni-horizon/",
  "https://bnisalberta.ca/bni-corridor/",
  "https://bnisalberta.ca/bni-sunrise/",
  "https://bnibc.ca/bc-lower-mainland-(west)-bni-all-stars/en-CA/memberlist",
  "https://bnibc.ca/bc-lower-mainland-(west)-bni-big-tsunami/en-CA/memberlist",
  "https://bnibc.ca/en-CA/chapterdetail?chapterId=oqZ7wo6RjxxnEBAGCt3eMA%3D%3D&name=BNI+BNI+Business+Achievers",
  "https://bnibc.ca/bc-vancouver-island-bni-business-networking-nanaimo/en-CA/memberlist",
  "https://bnibc.ca/bc-northern-&-interior-bni-collective/en-CA/memberlist",
  "https://bnibc.ca/bc-lower-mainland-(south-east)-bni-connections-(bc-lower-mainland)/en-CA/memberlist",
  "https://bnibc.ca/bc-lower-mainland-(south-east)-bni-creekside/en-CA/memberlist",
  "https://bnibc.ca/bc-lower-mainland-(south-east)-bni-destiny/en-CA/memberlist",
  "https://bnibc.ca/disruption/en-CA/memberlist",
  "https://bnibc.ca/bc-lower-mainland-(south-east)-bni-driven-dragons/en-CA/memberlist?chapterName=17207&regionIds=17136,17118,17119,17121$isChapterwebsite",
  "https://bnicanada.ca/en-CA/chapterdetail?chapterId=%2Fw688HxiIVfYdFRCZSDR%2FQ%3D%3D&name=BNI+BNI+Dynamo",
  "https://bnibc.ca/bc-lower-mainland-(south-east)-bni-edge/en-CA/memberlist",
  "https://bnibc.ca/bc-lower-mainland-(south-east)-bni-grand-fortune-city/en-CA/memberlist",
  "https://bnibc.ca/bc-lower-mainland-(south-east)-bni-lions-gate/en-CA/memberlist",
  "https://bnibc.ca/bc-lower-mainland-(south-east)-bni-marinaside/en-CA/memberlist",
  "https://bnibc.ca/bc-northern-&-interior-bni-northern-alliance/en-CA/memberlist",
  "https://bnibc.ca/bc-lower-mainland-(south-east)-bni-oceanside/en-CA/memberlist",
  "https://bnicanada.ca/en-CA/chapterdetail?chapterId=9v%2FcyEcfdmpVoCszuP%2BbbQ%3D%3D&name=BNI+BNI+Peak",
  "https://bnicanada.ca/en-CA/chapterdetail?chapterId=jR77Ceu8iWSNktiANi%2BSGQ%3D%3D&name=BNI+BNI+Power+Partners",
  "https://bnibc.ca/bc-lower-mainland-(south-east)-bni-pulse/en-CA/memberlist",
  "https://bnibc.ca/bc-lower-mainland-(south-east)-bni-revolution-(bc)/en-CA/memberlist",
  "https://bnibc.ca/bc-lower-mainland-(south-east)-bni-shoreline/en-CA/memberlist",
  "https://bnibc.ca/en-CA/chapterdetail?chapterId=4NLyDmNFbBIRPShAOmTLLQ%3D%3D&name=BNI+BNI+The+Elite+Network",
  "https://bnibc.ca/en-CA/chapterdetail?chapterId=QLk2jIAZp5rNx6jAhtQIjQ%3D%3D&name=BNI+BNI+Tri-Cities",
  "https://bnibc.ca/bc-lower-mainland-(south-east)-bni-united/en-CA/memberlist",
  "https://bnibc.ca/bni_urban_professionals_vancouver/en-CA/memberlist",
  "https://bnibc.ca/bc-vancouver-island-bni-worldclass-chapter/en-CA/memberlist",
  "https://bnieast.ca/alpha/en-CA/memberlist",
  "https://bnicanada.ca/en-CA/chapterdetail?chapterId=u3haL4mmm5zQ3RQYg9eEqw%3D%3D&name=BNI+BNI+Business+By+Referral",
  "https://bnicanada.ca/en-CA/chapterdetail?chapterId=CwWcA0f7Zgb38gxkQMBGbQ%3D%3D&name=BNI+BNI+Capital+Network",
  "https://bnieast.ca/en-CA/chapterdetail?chapterId=%2BkNrn77o44CvFltOOmK3yQ%3D%3D&name=BNI+BNI+East+Pros",
  "https://bnieast.ca/k1/en-CA/memberlist",
  "https://bnieast.ca/limestoneleaders/en-CA/memberlist",
  "https://bnieast.ca/en-CA/chapterdetail?chapterId=tkrl5qZiHffp8DsIsxor1w%3D%3D&name=BNI+BNI+Kingston+Prospectors",
  "https://bnieast.ca/metcalfe/en-CA/memberlist",
  "https://bnieast.ca/moneymakers/en-CA/memberlist?chapterName=27852&regionIds=17133$isChapterwebsite",
  "https://bnieast.ca/powerplay/en-CA/memberlist?chapterName=20786&regionIds=17133$isChapterwebsite",
  "https://bnieast.ca/pembroke/en-CA/memberlist",
  "https://bnieast.ca/westboro/en-CA/memberlist",
  "https://bnicanada.ca/en-CA/chapterdetail?chapterId=jXudr372nK2jQz01%2B5iShg%3D%3D&name=BNI+BNI+Business+Builders+%28GH%29",
  "https://bnicanada.ca/en-CA/chapterdetail?chapterId=P9ZvdjWaOARAMQFrmPpU1Q%3D%3D&name=BNI+BNI+Business+Exchange",
  "https://bnicanada.ca/en-CA/chapterdetail?chapterId=v8cC6t9yPdWzjiMt2g8ewg%3D%3D&name=BNI+BNI+Business+Legends",
  "https://bnigh.com/ont--halton-hamilton-bni-escarpment-entrepreneurs/en-CA/memberlist",
  "https://bnigh.com/ont--peel-bni-executive-network/en-CA/memberlist",
  "https://bnicanada.ca/en-CA/chapterdetail?chapterId=fdwtcc8FkQu8GNC5V4NV2A%3D%3D&name=BNI+BNI+Gateway",
  "https://bnigh.com/ont--halton-hamilton-bni-integrity-networking/en-CA/memberlist",
  "https://bnigh.com/en-CA/chapterdetail?chapterId=QqVSTXfkZXpbTiYE06st4g%3D%3D&name=BNI%20Leading%20Edge",
  "https://bnicanada.ca/en-CA/chapterdetail?chapterId=Lt0CSBmKaeatC2ZVyZwKBw%3D%3D&name=BNI+BNI+MAST",
  "https://bnicanada.ca/en-CA/chapterdetail?chapterId=Gpcr5tK%2FiHj%2FisgCxYKfIg%3D%3D&name=BNI+BNI+MasterMinds",
  "https://bnicanada.ca/en-CA/chapterdetail?chapterId=M%2F3jWkIYgH6hsZNSNDdeCA%3D%3D&name=BNI+BNI+Networking+Powers",
  "https://bnigh.com/en-CA/chapterdetail?chapterId=YNGat3ky%2Fr0pYV9gRRhnFg%3D%3D&name=BNI%20Paramount",
  "https://bnicanada.ca/en-CA/chapterdetail?chapterId=LIegRetXl%2FXVB0opAggtgw%3D%3D&name=BNI+BNI+Power+House",
  "https://bnicanada.ca/en-CA/chapterdetail?chapterId=1jXS7JHDYgQ6YqeUkn8YLQ%3D%3D&name=BNI+BNI+Business+Prestige",
  "https://bnicanada.ca/en-CA/chapterdetail?chapterId=mjhru7fPKOatgz3cDzWIew%3D%3D&name=BNI+BNI+Referral+Professionals",
  "https://bnigh.com/ont--peel-bni-rhythm/en-CA/memberlist",
  "https://bnigh.com/ont--halton-hamilton-bni-score/en-CA/memberlist?chapterName=27221&regionIds=31957,17128$isChapterwebsite",
  "https://bnigh.com/ont--peel-bni-strategic-partners/en-CA/memberlist",
  "https://bnicanada.ca/en-CA/chapterdetail?chapterId=Q9ojIfP31Ij59X2vCN6edQ%3D%3D&name=BNI+BNI+Sunrise",
  "https://bnicanada.ca/en-CA/chapterdetail?chapterId=rS9P%2FWwPx9PLD01%2F%2FuU5hw%3D%3D&name=BNI+BNI+Bedford+Business+Builders",
  "https://bnicanada.ca/en-CA/chapterdetail?chapterId=wZlaD1Vv75OKAo87fuDnTw%3D%3D&name=BNI+BNI+Business+Connectors",
  "https://bnimaritimes.com/nova-scotia-bni-halifax-central/en-CA/memberlist",
  "https://bnicanada.ca/en-CA/chapterdetail?chapterId=pwHRAWiDY7eS8UbUC%2FAb3A%3D%3D&name=BNI+Rising+Stars",
  "https://bni-niagara.com/ont--niagara-bni-am-networkers/en-CA/memberlist",
  "https://bni-niagara.com/champagne/en-CA/memberlist"
];

// const urls = [
//   "https://bnisk.ca/saskatchewan-bni-advocates-of-excellence/en-CA/memberlist?chapterName=25593&regionIds=17125$isChapterwebsite",
//   "https://bnisk.ca/saskatchewan-bni-business-elite/en-CA/memberlist?chapterName=17550&regionIds=17125$isChapterwebsite",
//   "https://bnicanada.ca/en-CA/chapterdetail?chapterId=1jXS7JHDYgQ6YqeUkn8YLQ%3D%3D&name=BNI+BNI+Business+Prestige",
//   "https://bnisk.ca/saskatchewan-bni-high-impact/en-CA/memberlist",
//   "https://bnisk.ca/saskatchewan-bni-living-skies/en-CA/memberlist",
//   "https://bnisk.ca/saskatchewan-bni-northern-lights/en-CA/memberlist?chapterName=27011&regionIds=17125$isChapterwebsite",
//   "https://bnisk.ca/saskatchewan-bni-prairie-prosperity/en-CA/memberlist",
//   "https://bnisk.ca/saskatchewan-bni-queen-city/en-CA/memberlist",
//   "https://bnilll.com/centropolis/en-CA/memberlist",
//   "https://bnicanada.ca/en-CA/chapterdetail?chapterId=b0GvjuXuG9J6R0BGVA5%2Bjw%3D%3D&name=BNI+BNI+Connexion",
//   "https://bnilll.com/focus/en-CA/memberlist?chapterName=17292&regionIds=17135$isChapterwebsite",
//   "https://bnilll.com/lacitedemirabel/en-CA/memberlist",
//   "https://bnicanada.ca/en-CA/chapterdetail?chapterId=aW4hBe47UZ5yP67eDOv%2B7A%3D%3D&name=BNI+BNI+Laval+Affaires+Plus",
//   "https://bnilll.com/presence/en-CA/memberlist",
//   "https://bnilll.com/bni-prestige-laval/en-CA/memberlist",
//   "https://bnilll.com/propulsion/fr-CA/listedesmembres",
//   "https://bnicanada.ca/en-CA/chapterdetail?chapterId=j9xU8eYPQRbTkD8GUzAEig%3D%3D&name=BNI+BNI+QG+de+Lanaudi%C3%A8re",
//   "https://bnilll.com/referencesennord/en-CA/memberlist?chapterName=17269&regionIds=17135$isChapterwebsite",
//   "https://bnilll.com/svp/en-CA/memberlist?chapterName=35320&regionIds=17135$isChapterwebsite",
//   "https://bnilll.com/en-CA/chapterdetail?chapterId=o93ps1nej%2F3sCnwLUM7GkQ%3D%3D&name=BNI+BNI+Synergie",
//   "https://bnicanada.ca/en-CA/chapterdetail?chapterId=l8DcR5GKmIGucUGifcBB%2BA%3D%3D&name=BNI+BNI+Les+Arist%C3%B4ts",
//   "https://bni.quebec/gatineau/en-CA/memberlist",
//   "https://bni-ocn.com/ont--central-north-bni-barrie-business-leaders/en-CA/memberlist?chapterName=17466&regionIds=17116$isChapterwebsite",
//   "https://bni-ocn.com/ont--central-north-bni-business-by-the-bay/en-CA/memberlist",
//   "https://bni-ocn.com/ont--central-north-bni-business-dynamos/en-CA/memberlist?chapterName=17371&regionIds=17116$isChapterwebsite",
//   "https://bni-ocn.com/ont--central-north-bni-business-elite/en-CA/memberlist?chapterName=17572&regionIds=17116$isChapterwebsite",
//   "https://bni-ocn.com/ont--central-north-bni-business-matters/en-CA/memberlist",
//   "https://bni-ocn.com/ont--central-north-bni-georgian-triangle/en-CA/memberlist",
//   "https://bni-ocn.com/ont--central-north-bni-lake-country/en-CA/memberlist",
//   "https://bni-ocn.com/ont--central-north-bni-muskoka-success-circle/en-CA/memberlist?chapterName=35821&regionIds=17116$isChapterwebsite",
//   "https://bnicanada.ca/en-CA/chapterdetail?chapterId=z56zro7LNkrt%2F38xNIrw3A%3D%3D&name=BNI+BNI+North+Bay+Nipissing+Network",
//   "https://bni-ocn.com/ont--central-north-bni-power-partners/en-CA/memberlist?chapterName=42539&regionIds=17116$isChapterwebsite",
//   "https://bni-ocn.com/ont--central-north-bni-simcoe-advantage/en-CA/index",
//   "https://bni-ocn.com/ont--central-north-bni-sound-networking/en-CA/memberlist?chapterName=17302&regionIds=17116$isChapterwebsite",
//   "https://bni-ocn.com/ont--central-north-bni-spirit-catchers/en-CA/memberlist",
//   "https://bni-ocn.com/ont--central-north-bni-thrive!/en-CA/memberlist",
//   "https://bnicanada.ca/en-CA/chapterdetail?chapterId=1K5tJ2COcYrmecaMrhBAfw%3D%3D&name=BNI+BNI+Accelerators",
//   "https://bnimanitoba.com/executives/en-CA/memberlist?chapterName=17622&regionIds=17122$isChapterwebsite",
//   "https://bnimanitoba.com/manitoba-bni-impact---manitoba/en-CA/memberlist?chapterName=27928&regionIds=17122$isChapterwebsite",
//   "https://bnimanitoba.com/manitoba-bni-nexus-chapter/en-CA/memberlist?chapterName=17713&regionIds=17122$isChapterwebsite",
//   "https://bnimanitoba.com/manitoba-bni-platinum-(manitoba)/en-CA/memberlist?chapterName=17369&regionIds=17122$isChapterwebsite",
//   "https://bnigtaplus.ca/bniallbusinessnetwork/en-CA/memberlist?chapterName=17386&regionIds=17130,25026,17132,25027$isChapterwebsite",
//   "https://bnicanada.ca/en-CA/chapterdetail?chapterId=UkPey8r338Ckfw6SsUXbXw%3D%3D&name=BNI%20Beach%20Biz",
//   "https://bnigtaplus.ca/bni-bloor-west/en-CA/memberlist",
//   "https://bnicanada.ca/en-CA/chapterdetail?chapterId=CKm8ONqdTaweqYIVs4BYuw%3D%3D&name=BNI+BNI+Build+Your+Business",
//   "https://bnigtaplus.ca/ont--gta-plus-toronto-etobicoke-bni-business-connections-one/en-CA/memberlist",
//   "https://bnigtaplus.ca/ont--gta-plus-toronto-etobicoke-bni-business-edge-(gta)/en-CA/memberlist",
//   "https://bnigtaplus.ca/ont--gta-plus-toronto-etobicoke-bni-business-first/en-CA/memberlist?chapterName=27614&regionIds=17130,25026,17132,25027$isChapterwebsite",
//   "https://bnicanada.ca/en-CA/chapterdetail?chapterId=BL3By%2Fz9ULTPxy92x10CMg%3D%3D&name=BNI+BNI+Business+Leaders",
//   "https://bnicanada.ca/en-CA/chapterdetail?chapterId=e25RStjahOEney5EFaNu4w%3D%3D&name=BNI+BNI+Champions",
//   "https://bnicanada.ca/en-CA/chapterdetail?chapterId=BbwXipXgy%2FdG7Zv5Asec%2Fg%3D%3D&name=BNI+BNI+Danforth",
//   "https://bnicanada.ca/en-CA/chapterdetail?chapterId=pEwCMa7yl8TE8kJbuAhkrg%3D%3D&name=BNI+BNI+High+Park",
//   "https://bnigtaplus.ca/bnileslieville/en-CA/memberlist",
//   "https://bnicanada.ca/en-CA/chapterdetail?chapterId=05V2cMgDAHJXV8teiAkMIg%3D%3D&name=BNI%20Lunch%20Network%20for%20Success",
//   "https://bnicanada.ca/en-CA/chapterdetail?chapterId=ZD5NBLrxCyVSlBb52AQdlA%3D%3D&name=BNI+BNI+Momentum",
//   "https://bnigtaplus.ca/ont--gta-plus-toronto-north-bni-networkers/en-CA/memberlist",
//   "https://bnicanada.ca/en-CA/chapterdetail?chapterId=kVL41rAgQjjxzkxmoTi5XQ%3D%3D&name=BNI+BNI+Outstanding+Results",
//   "https://bnicanada.ca/en-CA/chapterdetail?chapterId=GokRn4U4QOoeI%2Foq1Majng%3D%3D&name=BNI+BNI+-+Performance%2C+Integrity+and+Excellence+%28P.I.E.%29",
//   "https://bnigtaplus.ca/bniprosperity/en-CA/memberlist",
//   "https://bnigtaplus.ca/bnisuccessnetwork/en-CA/memberlist?chapterName=17233&regionIds=17130,25026,17132,25027$isChapterwebsite",
//   "https://bnigtaplus.ca/ont--gta-plus-toronto-north-bni-the-marketeers/en-CA/memberlist",
//   "https://bnicanada.ca/en-CA/chapterdetail?chapterId=nx0gdGUTFXs3qFbTQHiiHA%3D%3D&name=BNI+BNI+Wealth+Builders",
//   "https://bniquebec.com/qc-south-shore-monteregie-eastern-townships-bni-action-monteregie/en-CA/memberlist?chapterName=17605&regionIds=17137,17120,17131$isChapterwebsite",
//   "https://bniquebec.com/qc-south-shore-monteregie-eastern-townships-bni-bonaventure/en-CA/memberlist",
//   "https://bniquebec.com/qc-montreal-(central)-bni-decarie/en-CA/memberlist",
//   "https://bnicanada.ca/en-CA/chapterdetail?chapterId=jbovtRGklpYz8l00lnQM6g==&name=BNI+BNI+Dynamique+Premium",
//   "https://bniquebec.com/qc-l%60est-du-quebec-eastern-quebec-bni-emergence/en-CA/memberlist?chapterName=17241&regionIds=17137,17120,17131$isChapterwebsite",
//   "https://bniquebec.com/qc-l%60est-du-quebec-eastern-quebec-bni-excellence-monteregie/en-CA/memberlist?chapterName=26395&regionIds=17137,17120,17131$isChapterwebsite",
//   "https://bniquebec.com/qc-south-shore-monteregie-eastern-townships-bni-la-seigneurie/en-CA/memberlist?chapterName=17307&regionIds=17137,17120,17131$isChapterwebsite",
//   "https://bnicanada.ca/en-CA/chapterdetail?chapterId=o0tKdREGH%2BAYGpg71uQ%2F0w%3D%3D&name=BNI+BNI+Les+Alli%C3%A9s+du+Succ%C3%A8s",
//   "https://bnicanada.ca/en-CA/chapterdetail?chapterId=n2lIrZHAc9Z1w2f%2Baw2PPA%3D%3D&name=BNI+BNI+Les+B%C3%A2tisseurs+du+Saguenay",
//   "https://bniquebec.com/qc-l%60est-du-quebec-eastern-quebec-bni-les-partenaires-de-la-reussite-(quebec-levis)/en-CA/memberlist?chapterName=17218&regionIds=17137,17120,17131$isChapterwebsite",
//   "https://bniquebec.com/qc-montreal-(central)-bni-montreal-affaires/en-CA/memberlist",
//   "https://bniquebec.com/qc-montreal-(central)-bni-montreal-virtual/en-CA/memberlist?chapterName=17792&regionIds=17137,17120,17131$isChapterwebsite",
//   "https://bnicanada.ca/en-CA/chapterdetail?chapterId=iubldxYKSqQY8ylKIz8JUw%3D%3D&name=BNI+BNI+ProAction+Qu%C3%A9bec",
//   "https://bnicanada.ca/en-CA/chapterdetail?chapterId=Uh96A2JBtIyEiafAB7EvuQ%3D%3D&name=BNI+BNI+Qu%C3%A9bec+Capitale",
//   "https://bniquebec.com/en-CA/chapterdetail?chapterId=PUxRa48%2FXWC%2BCC%2BKphEjXQ%3D%3D&name=BNI%20Shawinigan%20Premier",
//   "https://bniquebec.com/qc-l%60est-du-quebec-eastern-quebec-bni-sigma-drummondville/en-CA/memberlist",
//   "https://bnicanada.ca/en-CA/chapterdetail?chapterId=uZfn3AJS9bNsG6Y0TqfGMw%3D%3D&name=BNI+BNI+Signature",
//   "https://bniquebec.com/qc-l%60est-du-quebec-eastern-quebec-bni-trois-rivieres-premier/en-CA/memberlist",
//   "https://bnicanada.ca/en-CA/chapterdetail?chapterId=%2F5tU2AXCIC9AwVUoGHM17A%3D%3D&name=BNI+BNI+Union+affaires+%2B",
//   "https://bniquebec.com/qc-montreal-(central)-bni-ville-marie/en-CA/memberlist",
//   "https://bniquebec.com/qc-montreal-(central)-bni-west-island-one/en-CA/memberlist?chapterName=17247&regionIds=17137,17120,17131$isChapterwebsite",
//   "https://bniquebec.com/qc-montreal-(central)-bni-west-island-professionals/en-CA/memberlist?chapterName=17791&regionIds=17137,17120,17131$isChapterwebsite",
// ];

exports.fetchBNIMembers = async (req, res) => {
  try {
    // const length1 = urls1.length;
    // const length2 = urls1.length;
    // return res.status(200).json({
    //   status: true,
    //   total: length1+length2,
    //   message: "All urls hit"
    // });
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    const allMembers = [];

    for (const url of urls) {
      try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        const html = await page.content();
        const $ = cheerio.load(html);

        $('table#chapterListTable tbody tr').each((_, row) => {
          const name = $(row).find('td a.linkone').text().trim();
          const profileHref = $(row).find('td a.linkone').attr('href') || '';
          const encryptedMemberId = decodeURIComponent((profileHref.match(/encryptedMemberId=([^&]+)/) || [])[1] || '');
          const company = $(row).find('td').eq(1).text().trim();
          const category = $(row).find('td').eq(2).text().trim();
          const phone = $(row).find('td bdi').text().trim();

          allMembers.push({
            name,
            company,
            category,
            phone,
            encryptedMemberId,
            sourceURL: url
          });
        });
      } catch (err) {
        console.warn(`Skipped URL (error or no table): ${url}`, err.message);
        continue;
      }
    }

    await browser.close();

    return res.status(200).json({
      status: true,
      total: allMembers.length,
      members: allMembers
    });

  } catch (error) {
    console.error("Error fetching BNI members from URLs:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to fetch BNI member data"
    });
  }
};

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

// const { url } = req.body;
// if(!url){
//   return res.status(400).json({
//     status: false,
//     message: "URL is required."
//   });
// }