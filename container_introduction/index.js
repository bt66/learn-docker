require('dotenv').config()
const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send(`hi ${process.env.NAME}, i hope you know how env on docker work.`)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})