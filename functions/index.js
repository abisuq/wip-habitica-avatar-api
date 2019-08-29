const functions = require('firebase-functions')
const app = require('express')()
const axios = require('axios')
const chromium = require('chrome-aws-lambda')
const puppeteer = require('puppeteer-core')
const { avatar } = require('./avatar')
const mcache = require('memory-cache')
const cache = duration => {
  return (req, res, next) => {
    let key = '__express__' + req.originalUrl || req.url
    let cachedBody = mcache.get(key)
    if (cachedBody) {
      res.send(cachedBody)
      return
    } else {
      res.sendResponse = res.send
      res.send = body => {
        mcache.put(key, body, duration * 1000)
        res.sendResponse(body)
      }
      next()
    }
  }
}
app.use(function cors(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  next()
})
const getProfile = async uid => {
  const { data } = await axios.get(`https://habitica.com/api/v3/members/${uid}`)
  return data.data
}
app.get('/render/:uid', async (req, res) => {
  let profile, html
  try {
    profile = await getProfile(req.params.uid)
    html = await avatar(profile)
  } catch (e) {
    res.status(500).send(e.toString())
  }
  res.type('text/html')
  res.status(200)
  res.send(`
    <!DOCTYPE html>
      <html lang="en">
        <head>
          <link href="https://habitika.firebaseapp.com/css.css" rel="stylesheet">
        </head>
        <body>${html}</body>
      </html>`)
})
app.get('/a/:uid', cache(60), async (req, res) => {
  let profile, html
  try {
    profile = await getProfile(req.params.uid)
    html = `
    <!DOCTYPE html>
      <html lang="en">
        <head>
          <link href="https://habitika.firebaseapp.com/css.css" rel="stylesheet">
        </head>
        <body>${await avatar(profile)}</body>
      </html>`
  } catch (e) {
    res.status(500).send(e.toString())
  }
  try {
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    })
    const page = await browser.newPage()
    await page.goto(`data:text/html,${html}`, { waitUntil: 'networkidle0' })
    const buffer = await page.screenshot({
      clip: { x: 0, y: 0, width: 90, height: 90 },
    })

    res.type('image/png').send(buffer)
  } catch (e) {
    res.status(500).send(e.toString())
  }

  await browser.close()
})

exports.avatar = functions.runWith({ memory: '2GB', timeoutSeconds: 60 }).https.onRequest(app)
exports.render = functions.https.onRequest(app)
