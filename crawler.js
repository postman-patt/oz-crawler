const request = require('request-promise')
const cheerio = require('cheerio')
const URL = require('url-parse')
const mailer = require('./mailer.js')
const colors = require('colors')
require('dotenv').config()

const SEARCH = ['price error', 'pricing error']
const BASE = 'https://www.ozbargain.com.au/'
const START_URL = 'https://www.ozbargain.com.au/deals'
const url = new URL(START_URL)
var pagesToVisit = []
var pagesVisited = []

const crawler = async () => {
  //Initial link collection
  for (i = 0; i < 5; i++) {
    await request(
      `https://www.ozbargain.com.au/?page=${i}`,
      (error, res, body) => {
        console.log(
          colors.cyan(`Visiting ${START_URL} on page ${i} to gather links...`)
        )
        if (error) {
          console.log(error)
        }

        //Check status code 200
        console.log(colors.grey(`Page status code: ${res.statusCode}`))
        if (res.statusCode !== 200) {
          console.log('Failed inital page load')
          return
        } else {
          var $ = cheerio.load(body)

          var relativeLinks = $("a[href^='/node']")
          relativeLinks.each(function () {
            pagesToVisit.push(url.origin + $(this).attr('href'))
          })
          console.log(
            colors.green(
              'Found ' + pagesToVisit.length + ' total pages to visit'
            )
          )
        }
      }
    )
  }
  crawl()
}

const crawl = () => {
  console.log(pagesVisited.length)
  var nextPage = pagesToVisit.pop()
  if (pagesToVisit.length === 0) {
    console.log('Finished crawling')
  } else {
    setTimeout(() => {
      visitPage(nextPage, crawl)
    }, 3000)
  }
}

const visitPage = (url, callback) => {
  // Add page to our set
  pagesVisited.push(url)

  request(url, (error, res, body) => {
    console.log(colors.yellow(`Visiting page ${url}`))
    if (error) {
      console.log(error)
    }

    if (res.statusCode !== 200) {
      //Initial site must return status code 200, otherwise pagesToVisit remains empty
      callback()
      return
    }

    if (res.statusCode === 200) {
      //Parse document body
      var $ = cheerio.load(body)
      var isWordFound = searchForWord($, SEARCH)
      if (isWordFound) {
        var s = `oz-crawler found at ${url}`
        var b = `Pricing error found. Follow the link at ${url}`
        var h = `<p>${url}<p/>`
        console.log(
          `Word "${SEARCH.join(', ')}" ${colors.green('NOT')} found at page` +
            url
        )
        mailer(s, b, h).catch(console.error)
        callback()
      } else {
        console.log(
          `Word "${SEARCH.join(', ')}" ${colors.red('NOT')} found at page` + url
        )
        callback()
      }
    }
  })
}

//Search for word
const searchForWord = ($, words) => {
  var bodyText = $('.main').text()
  var checker = words.some(
    (word) => bodyText.toLowerCase().indexOf(word.toLowerCase()) !== -1
  )
  if (checker) {
    return true
  }
  return false
}

crawler()
