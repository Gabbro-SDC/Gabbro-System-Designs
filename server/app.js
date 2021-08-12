const express = require('express')
const app = express()
const port = 3000
const db = require('../server/db')


app.listen(port, () => {
  console.log(`App is listening on port: ${port}`)
  console.log(db)
})

app.use(express.json())
