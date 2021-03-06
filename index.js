const cheerio = require('cheerio')
const express = require('express')
const axios = require('axios')
const PORT = process.env.PORT || 8000
const cors = require('cors')
const app = express()

app.use(cors())

app.get("/", (req, res) => {
    res.send({message:"Hallo"})
})

app.get("/manga/page/:id", (req, res) => {
    let pageId = parseInt(req.params.id)
    let url = pageId == 1 ? 'https://komikcast.com/daftar-komik/?order=update' : 'https://komikcast.com/daftar-komik/page/' + pageId +'/?order=update'

        axios.get(url)
        .then(response => {
            const $ = cheerio.load(response.data)
            const content = $(".bixbox")
            const objAnime = {}
            let anime = []

            objAnime.currentPage = pageId
            objAnime.nextPage = pageId + 1

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

                objAnime.anime_list = anime
            })

            res.json(objAnime)

        }).catch(e => {
                res.send({message:"Upss"})
        })
})

app.get("/manga/detail/:slug", (req, res) => {
    const slug = req.params.slug
        axios.get("https://komikcast.com/komik/" + slug)
        .then(response => {
            const $ = cheerio.load(response.data)
            const content = $("article")

            const obj = {}
            let list_chapter = []
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

                list_chapter.push({
                    chapter_name,
                    chapter_link
                })

                obj.chapter_list = list_chapter
            })
            res.json(obj)
        }).catch(e => {
                res.send({message:"Upss"})
        })
})

app.get("/manga/chapter/:slug", (req, res) => {
    const slug = req.params.slug
        axios.get("https://komikcast.com/chapter/" + slug)
        .then(response => {
            const $ = cheerio.load(response.data)
            const content = $(".postarea")

            let chap = []
            const obj = {}

            content.find("article > .maincontent > .nextprev").each((id,el) => {
                obj.next_link = $(el).find("a:nth-child(2)").attr("href").replace("https://komikcast.com/chapter/","").replace("/","")
            })

            content.find("article > .maincontent > .nextprev").each((id,el) => {
                obj.prev_link = $(el).find("a:nth-child(1)").attr("href").replace("https://komikcast.com/chapter/","").replace("/","")
            })

            content.find("article > .maincontent > #readerarea > img").each((id,el) => {
                let chapter_image = $(el).attr("src")

                chap.push({
                    chapter_image,
                    chapter_number : id
                })

                obj.chapter = chap
            })

            res.json(obj)
            

        }).catch(e => {
                res.send({message:"Upss"})
        })
})

        
    app.listen(PORT, function () {
        console.log("Started application on port %d", 10000)
    });
