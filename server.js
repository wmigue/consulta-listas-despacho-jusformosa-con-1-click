import express from 'express'
import bodyParser from 'body-parser'
import fs from 'fs'
import path from 'path'
import puppeteer from 'puppeteer'

const app = express()
const PORT = 3000

app.use(bodyParser.json())

// Servir index.html
app.get('/', (req, res) => {
  res.sendFile(path.resolve('index.html'))
})

// Guardar registro
app.post('/guardar', (req, res) => {
  const { dependencia, numero, anio } = req.body
  let datos = []
  if (fs.existsSync('data.json')) {
    try {
      const fileContent = fs.readFileSync('data.json', 'utf-8')
      datos = fileContent ? JSON.parse(fileContent) : []
    } catch {
      datos = []
    }
  }
  // agregar id único a cada registro para poder eliminarlo
  const id = Date.now()
  datos.push({ id, dependencia, numero, anio })
  fs.writeFileSync('data.json', JSON.stringify(datos, null, 2))

  res.json({ success: true, message: 'Datos guardados correctamente' })
})

// Obtener todos los registros
app.get('/datos', (req, res) => {
  let datos = []
  if (fs.existsSync('data.json')) {
    try {
      const fileContent = fs.readFileSync('data.json', 'utf-8')
      datos = fileContent ? JSON.parse(fileContent) : []
    } catch {
      datos = []
    }
  }
  res.json(datos)
})

// Eliminar registro por id
app.delete('/eliminar/:id', (req, res) => {
  const id = parseInt(req.params.id)
  let datos = []
  if (fs.existsSync('data.json')) {
    try {
      const fileContent = fs.readFileSync('data.json', 'utf-8')
      datos = fileContent ? JSON.parse(fileContent) : []
    } catch {
      datos = []
    }
  }

  datos = datos.filter(d => d.id !== id)
  fs.writeFileSync('data.json', JSON.stringify(datos, null, 2))

  res.json({ success: true, message: 'Registro eliminado correctamente' })
})

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
