const cheerio = require("cheerio");
const express = require("express");
const axios = require("axios");
const PORT = process.env.PORT || 8080;
const cors = require("cors");
const app = express();

app.use(cors());

app.get("/", (req, res) => {
  res.send({ message: "Hallo" });
});

app.get("/manga/v2/page/:id", (req, res) => {
  const pageId = parseInt(req.params.id);
  let url =
    pageId == 1
      ? "https://komikcast.site/daftar-komik/?orderby=update"
      : "https://komikcast.site/daftar-komik/page/" +
        pageId +
        "/?orderby=update";

  axios.get(url).then((response) => {
    const $ = cheerio.load(response.data);
    const content = $(".list-update");
    const obj = {};
    let anime = [];

    obj.author = "Fadila Fitra Kusuma Jaya";
    obj.url = url;
    obj.currentPage = pageId;
    obj.nextPage = pageId + 1;

    content
      .find(
        ".list-update_items > .list-update_items-wrapper > .list-update_item"
      )
      .each((id, el) => {
        let img = $(el)
          .find("a > .list-update_item-image")
          .find("img")
          .attr("src");
        let judul = $(el)
          .find("a > .list-update_item-info > h3.title")
          .text()
          .trim();
        let chapter = $(el)
          .find("a > .list-update_item-info > .other > .chapter")
          .text()
          .trim();
        let link = $(el)
          .find("a")
          .attr("href")
          .replace("https://komikcast.site/komik/", "")
          .replace("/", "");
        let type = $(el)
          .find("a > .list-update_item-image")
          .find("span.type")
          .text();
        anime.push({
          judul,
          img,
          type,
          chapter,
          link,
        });

        obj.anime_list = anime;
      });

    res.json(obj);
  });
});

app.get("/manga/v2/detail/:slug", (req, res) => {
  const slug = req.params.slug;
  axios
    .get("https://komikcast.site/komik/" + slug)
    .then((response) => {
      const $ = cheerio.load(response.data);
      const content = $(".komik_info-body");

      const obj = {};
      let list_chapter = [];
      let detail = [];
      let genres = [];

      //   Ambil gambar cover komik
      content
        .find(".komik_info-content > .komik_info-content-thumbnail")
        .each((id, el) => {
          obj.img = $(el).find("img").attr("src");
        });

      // Ambil Info Komik
      content
        .find(".komik_info-content > .komik_info-content-body")
        .each((id, el) => {
          let title = $(el).find("h1.komik_info-content-body-title").text();
          let status = $(el)
            .find(".komik_info-content-meta > span:nth-child(3)")
            .text()
            .replace("Status:", "")
            .trim();
          let released = $(el)
            .find(".komik_info-content-meta > span:nth-child(1)")
            .text()
            .replace("Released:", "")
            .trim();
          let author = $(el)
            .find(".komik_info-content-meta > span:nth-child(2)")
            .text()
            .replace("Author:", "")
            .trim();
          let type = $(el)
            .find(".komik_info-content-meta > span:nth-child(4)")
            .text()
            .replace("Type:", "")
            .trim();

          detail.push({
            title,
            status,
            released,
            author,
            type,
          });
          obj.anime_detail = detail;
        });

      // Ambil genre Komik
      content
        .find(
          ".komik_info-content > .komik_info-content-body > .komik_info-content-genre > a"
        )
        .each((id, el) => {
          const genre = $(el).text();
          genres.push({
            genre,
          });
          obj.genres = genres;
        });

      // Ambil sinopsi komik
      content.find(".komik_info-description").each((id, el) => {
        obj.sinopsis = $(el)
          .find(".komik_info-description-sinopsis > .infox > .desc")
          .text()
          .trim();
      });

      //   Ambil semua chapter komik
      content
        .find(
          ".komik_info-chapters > ul.komik_info-chapters-wrapper > li.komik_info-chapters-item"
        )
        .each((id, el) => {
          let chapter_name = $(el).find("a.chapter-link-item").text().trim();
          let chapter_up = $(el).find(".chapter-link-time").text().trim();
          let chapter_link = $(el)
            .find("a.chapter-link-item")
            .attr("href")
            .replace("https://komikcast.site/chapter/", "")
            .replace("/", "");

          list_chapter.push({
            chapter_name,
            chapter_up,
            chapter_link,
          });

          obj.chapter_list = list_chapter;
        });
      res.json(obj);
    })
    .catch((e) => {
      res.send({
        message: "Upss ada yang tidak beres",
        author: "Fadila Fitra Kusuma Jaya",
      });
    });
});

app.get("/manga/v2/chapter/:slug", (req, res) => {
  const slug = req.params.slug;
  axios.get("https://komikcast.site/chapter/" + slug).then((response) => {
    const $ = cheerio.load(response.data);
    const content = $("#chapter_body");

    let chap = [];
    let links = [];
    const obj = {};

    content
      .find(".chapter_nav-control > .right-control > .nextprev > a")
      .each((id, el) => {
        let link = $(el)
          .attr("href")
          .replace("https://komikcast.site/chapter/", "");

        links.push({
          link,
        });

        obj.links = links;
      });

    content.find(".main-reading-area > img").each((id, el) => {
      let chapter_image = $(el).attr("src");

      chap.push({
        chapter_image,
        chapter_number: id,
      });

      obj.chapter = chap;
    });

    res.json(obj);
  });
});

app.listen(PORT, function () {
  console.log("Started application on port %d", 10000);
});
