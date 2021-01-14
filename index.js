const cheerio = require('cheerio')
const express = require('express')
const axios = require('axios')
const PORT = process.env.PORT || 8080
const cors = require('cors')
const app = express()

app.use(cors())

app.get("/manga/v2/page/:id", (req, res) => {
    const pageId = parseInt(req.params.id)
    let url = pageId == 1 ? 'https://komikcast.com/daftar-komik/?order=update' : 'https://komikcast.com/daftar-komik/page/' + pageId +'/?order=update'

        axios.get(url)
        .then(response => {
            const $ = cheerio.load(response.data)
            const content = $(".bixbox")
            const obj = {}
            let anime = []

            obj.currentPage = pageId
            obj.nextPage = pageId + 1

            content.find(".mrgn > .listupd > .bs").each((id,el) => {
                let img = $(el).find(".bsx > a > .limit").find("img").attr("src")
                let judul = $(el).find(".bsx > .bigor > a > .tt").text().trim()
                let chapter = $(el).find(".bsx > .bigor > .adds > .epxs > a").text().trim()
                let link = $(el).find(".bsx > a").attr("href").replace("https://komikcast.com/komik/","").replace("/","")
                let type = $(el).find(".bsx > a > .limit").find(".type").text()
                anime.push({
                    judul,
                    img,
                    type,
                    chapter,
                    link
                })

                obj.anime_list = anime
            })

            res.json(obj)

        })
})

app.get("/manga/v2/detail/:slug", (req, res) => {
    const slug = req.params.slug
        axios.get("https://komikcast.com/komik/" + slug)
        .then(response => {
            const $ = cheerio.load(response.data)
            const content = $("article")

            const obj = {}
            let chapter = []
            let detail = []

            content.find(".animefull > .bigcover > .ime").each((id, el) => {
                obj.img = $(el).find("img").attr("src")
            })

            content.find(".animefull > .bigcontent > .infox").each((id, el) => {
                let title = $(el).find("h1").text()
                let alter_title = $(el).find(".alter").text()
                let genres = $(el).find(".spe > span:nth-child(1)").text().replace("Genres: ","")
                let status = $(el).find(".spe > span:nth-child(2)").text().replace("Status:","").trim()
                let released = $(el).find(".spe > span:nth-child(3)").text().replace("Released:","").trim()
                let author = $(el).find(".spe > span:nth-child(4)").text().replace("Author:","").trim()
                let type = $(el).find(".spe > span:nth-child(5)").text().replace("Type:","").trim()

                detail.push({
                    title,
                    alter_title,
                    genres,
                    status,
                    released,
                    author,
                    type
                })
                obj.anime_detail = detail
            })

            content.find(".animefull > .desc > div > p").each((id, el) => {
                obj.sinopsis = $(el).text()
            })

            content.find(".bixbox > .cl > ul > li").each((id, el) => {
                let chapter_name = $(el).find(".leftoff").text()
                let chapter_link = $(el).find(".leftoff > a").attr("href").replace("https://komikcast.com/chapter/","").replace("/","")

                chapter.push({
                    chapter_name,
                    chapter_link
                })

                obj.chapter_list = chapter
            })

            res.json(obj)
            

        })
})

app.get("/manga/v2/chapter/:slug", (req, res) => {
    const slug = req.params.slug
        axios.get("https://komikcast.com/chapter/" + slug)
        .then(response => {
            const $ = cheerio.load(response.data)
            const content = $(".postarea")

            let chapter = []
            const obj = {}

            

            content.find("article > .maincontent > .nextprev").each((id,el) => {
                obj.next_link = $(el).find("a:nth-child(2)").attr("href").replace("https://komikcast.com/chapter/","").replace("/","")
            })

            content.find("article > .maincontent > .nextprev").each((id,el) => {
                obj.prev_link = $(el).find("a:nth-child(1)").attr("href").replace("https://komikcast.com/chapter/","").replace("/","")
            })

            content.find("article > .maincontent > #readerarea > img").each((id,el) => {
                let chapter_image = $(el).attr("src")

                chapter.push({
                    chapter_image,
                    chapter_number : id
                })

                obj.chapter = chapter
            })

            res.json(obj)
            

        })
})

        
    app.listen(PORT, function () {
        console.log("Started application on port %d", 10000)
    });