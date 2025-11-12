import puppeteer from 'puppeteer'
;(async () => {
  const browser = await puppeteer.launch({
    headless: false, // ponelo en true si querés que no se abra la ventana
    defaultViewport: null,
    args: ['--start-maximized'] // 👈 abre el navegador maximizado
  })

  const page = await browser.newPage()

  // Ir a la página del formulario
  await page.goto(
    'https://portalservicios.jusformosa.gob.ar/listadespachoV4/consultas/C_consulta/MostrarBusquedaPorCriteriosEjusticia',
    { waitUntil: 'networkidle2' }
  )

  //  Hacer clic en la pestaña "Número / Año"
  await page.waitForSelector('#nav-numeroanio-tab', { visible: true })
  await page.click('#nav-numeroanio-tab')

  //  Esperar el select y seleccionar por texto o valor
  await page.waitForSelector('#cuDependenciaNA', { visible: true })
  await page.select('#cuDependenciaNA', '50332011')

  //  Esperar y escribir en el input #numero
  await page.waitForSelector('#numero', { visible: true })
  await page.type('#numero', '131')

  //  Esperar y escribir en el input #anio
  await page.waitForSelector('#anio', { visible: true })
  await page.type('#anio', '23')

  // Hacer clic en el botón "Buscar"
  await page.waitForSelector('button.btn.btn-primary.btn-busqueda', {
    visible: true
  })
  await Promise.all([
    page.click('button.btn.btn-primary.btn-busqueda'),
    page.waitForNavigation({ waitUntil: 'networkidle2' })
  ])

  console.log('✅ Búsqueda completada, resultados cargados.')

  // 7️⃣ Obtener el HTML con los resultados
  // const html = await page.content()
  // console.log(html)

  //await browser.close()
})()
