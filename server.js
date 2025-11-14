import express from 'express'
import bodyParser from 'body-parser'
import fs from 'fs'
import path from 'path'
import puppeteer from 'puppeteer'
import cors from 'cors'

const app = express()
const PORT = 3000

app.use(cors())
app.use(express.json())
app.use(bodyParser.json())

// Servir index.html
app.get('/', (req, res) => {
  res.sendFile(path.resolve('index.html'))
})

//consultar con puppeteer (scraping)
app.post('/consultar', async (req, res) => {
  const { dependencia, numero, anio } = req.body
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null
  })
  const page = await browser.newPage()
  await page.goto(
    'https://portalservicios.jusformosa.gob.ar/listadespachoV4/consultas/C_consulta/MostrarBusquedaPorCriteriosEjusticia'
  )

  //  Hacer clic en la pestaña "Número / Año"
  await page.waitForSelector('#nav-numeroanio-tab', { visible: true })
  await page.click('#nav-numeroanio-tab')

  //  Esperar el select y seleccionar por texto o valor
  await page.waitForSelector('#cuDependenciaNA', { visible: true })
  await page.select('#cuDependenciaNA', dependencia)

  //  Esperar y escribir en el input #numero
  await page.waitForSelector('#numero', { visible: true })
  await page.type('#numero', numero)

  //  Esperar y escribir en el input #anio
  await page.waitForSelector('#anio', { visible: true })
  await page.type('#anio', anio)

  // Hacer clic en el botón "Buscar"
  await page.waitForSelector('button.btn.btn-primary.btn-busqueda', {
    visible: true
  })
  await Promise.all([
    page.click('button.btn.btn-primary.btn-busqueda'),
    page.waitForNavigation({ waitUntil: 'networkidle2' })
  ])

  const html = await page.content()
  await browser.close()
  res.json({ html })
})

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})
