const axios = require("axios");
const cheerio = require("cheerio");
const logger = require("../utils/logger");
const puppeteer = require('puppeteer');

async function fetchWithProxy(url) {
    const proxyUrl = `http://api.scraperapi.com/?api_key=d7292a9e41327497892e27241d29e620&url=${encodeURIComponent(url)}`;
    try {
      const { data } = await axios.get(proxyUrl);
      console.log("data",data);
      return data;
    } catch (error) {
      console.error("Error fetching via proxy:", error);
      throw error;
    }
  }

async function fetchHTML(url) {
  try {
    const { data } = await axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        },
      });
    console.log("data", data);
    return data;
  } catch (error) {
    console.error("Error fetching the HTML:", error);
    throw error;
  }
}

async function extractTournamentData(html) {
  const data = [];
  const $ = cheerio.load(html); // Load the HTML into cheerio

  // Select all elements with the class "tournament-info__details-item"
  $(".tournament-info__details-item").each((_, element) => {
    const textElement = $(element).find(".tournament-info__label").text().trim();
    const valueElement = $(element).find(".tournament-info__value");
    const linkElement = valueElement.is("a") ? valueElement.attr("href") : "";

    const entry = {
      text: textElement || "",
      value: valueElement.text().trim() || "",
      link: linkElement || "",
    };

    data.push(entry);
  });

  return { data };
}

exports.getITFDetail = async (req, res) => {
  try {
    // const { link } = req.body;
    // console.log("link", link);
    // const html = await fetchHTML(link);
    (async() => {
        const { data } = await axios({
          data: {
            apiKey: 'd7292a9e41327497892e27241d29e620',
            urls: ["https://www.itftennis.com/en/tournament/j60-indore/ind/2025/j-j60-ind-2025-001/fact-sheet/"]
          },
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
          url: 'https://async.scraperapi.com/jobs'
        });
      
        console.log(data);
      })();
    // const data = await extractTournamentData(html);

    res.status(200).json({
      status: true,
      message: "Extracting data success!",
    //   data: data,
    });
  } catch (err) {
    console.log("error", err);
    logger.error(`Request failed: ${err.message}`);
    res.status(400).json({
      status: false,
      message: err.message,
    });
  }
};
