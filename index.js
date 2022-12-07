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

app.get("/manga/v2/manga-project", (req, res) => {
  let url = "https://komikcast.site";

  axios.get(url).then((response) => {
    const $ = cheerio.load(response.data);
    const content = $(".postbody");
    const obj = {};
    let anime = [];

    obj.author = "Fadila Fitra Kusuma Jaya";
    obj.url = url;

    content.find(".bixbox:nth-child(1) > .listupd > .utao").each((id, el) => {
      let img = $(el).find(".uta > .imgu > a").find("img").attr("src");
      let judul = $(el).find(".uta > .luf > a > h3").text().trim();
      let chapter = $(el)
        .find(".uta > .luf > ul > li:first-child > a")
        .text()
        .trim();
      let link = $(el)
        .find("a")
        .attr("href")
        .replace("https://komikcast.site/komik/", "")
        .replace("/", "");
      let chapter_update = $(el)
        .find(".uta > .luf > ul > li:first-child > span")
        .text()
        .trim();
      anime.push({
        judul,
        img,
        chapter_update,
        chapter,
        link,
      });

      obj.anime_list = anime;
    });

    res.json(obj);
  });
});

app.get("/manga/v2/manga-update", (req, res) => {
  let url = "https://komikcast.site";

  axios.get(url).then((response) => {
    const $ = cheerio.load(response.data);
    const content = $(".postbody");
    const obj = {};
    let anime = [];

    obj.author = "Fadila Fitra Kusuma Jaya";
    obj.url = url;

    content.find(".bixbox:nth-child(2) > .listupd > .utao").each((id, el) => {
      let img = $(el).find(".uta > .imgu > a").find("img").attr("src");
      let judul = $(el).find(".uta > .luf > a > h3").text().trim();
      let chapter = $(el)
        .find(".uta > .luf > ul > li:first-child > a")
        .text()
        .trim();
      let link = $(el)
        .find("a")
        .attr("href")
        .replace("https://komikcast.site/komik/", "")
        .replace("/", "");
      let chapter_update = $(el)
        .find(".uta > .luf > ul > li:first-child > span")
        .text()
        .trim();
      anime.push({
        judul,
        img,
        chapter_update,
        chapter,
        link,
      });

      obj.anime_list = anime;
    });

    res.json(obj);
  });
});

app.get("/manga/v2/page/:id", (req, res) => {
  const pageId = parseInt(req.params.id);
  let url =
    pageId == 1
      ? "https://komikcast.site/daftar-komik/"
      : "https://komikcast.site/daftar-komik/page/" +
        pageId;

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
          obj.title = $(el).find("h1.komik_info-content-body-title").text();
          obj.status = $(el)
            .find(".komik_info-content-meta > span:nth-child(3)")
            .text()
            .replace("Status:", "")
            .trim();
          obj.released = $(el)
            .find(".komik_info-content-meta > span:nth-child(1)")
            .text()
            .replace("Released:", "")
            .trim();
          obj.author = $(el)
            .find(".komik_info-content-meta > span:nth-child(2)")
            .text()
            .replace("Author:", "")
            .trim();
          obj.type = $(el)
            .find(".komik_info-content-meta > span:nth-child(4)")
            .text()
            .replace("Type:", "")
            .trim();
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
    const content = $(".chapter_");

    let chap = [];
    const obj = {};

    content.find(".chapter_headpost").each((id, el) => {
      obj.judul = $(el).find("h1").text().trim();
    });
    content
      .find(".chapter_nav-control > .right-control > .nextprev")
      .each((id, el) => {
        if (
          $(el).find("a:first-child").attr("rel") == "prev" &&
          $(el).find("a:nth-child(2)").attr("rel") == "next"
        ) {
          obj.prevlink = $(el)
            .find("a:first-child")
            .attr("href")
            .replace("https://komikcast.site/chapter/", "");
          obj.nextlink = $(el)
            .find("a:nth-child(2)")
            .attr("href")
            .replace("https://komikcast.site/chapter/", "");
        } else if (
          $(el).find("a:first-child").attr("rel") == "prev" &&
          $(el).find("a:nth-child(2)") == ""
        ) {
          obj.prevlink = $(el)
            .find("a")
            .attr("href")
            .replace("https://komikcast.site/chapter/", "");
          obj.nextlink = "";
        } else if (
          $(el).find("a:first-child").attr("rel") == "next" &&
          $(el).find("a:nth-child(2)") == ""
        ) {
          obj.nextlink = $(el)
            .find("a")
            .attr("href")
            .replace("https://komikcast.site/chapter/", "");
          obj.prevlink = "";
        }
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
