const express = require('express')
const app = express()
const port = 3000
const db = require('../server/db')


app.listen(port, () => {
  console.log(`App is listening on port: ${port}`)
})

app.use(express.json())

app.get("/qa/questions/", (req, res) => {

  var count = req.query.count || 5
  var page = req.query.page || 1
  console.log(page)

  db.query(`
  SELECT questions.id AS question_id, questions.question_body, questions.question_date, questions.asker_name, questions.question_helpfulness, questions.reported,
  COALESCE(JSON_OBJECT_AGG(answers.id,
    JSON_BUILD_OBJECT('id', answers.id, 'body', answers.body, 'date', answers.date_written, 'answerer_name', answers.answerer_name,'helpfulness', answers.helpfulness, 'photos', ARRAY(
      SELECT answers_photos.url
      FROM answers_photos
      WHERE answers_photos.answer_id = answers.id
      ))) FILTER (WHERE answers.id IS NOT NULL), '{}'::JSON) AS answers
  FROM questions
  LEFT JOIN answers
  ON questions.id = answers.question_id
  WHERE questions.product_id = ${req.query.product_id} AND questions.reported = false
  GROUP BY questions.id
  LIMIT ${count}
  OFFSET (${count * page - count})`)
    .then((results) => {
      var resultObj = {
        product_id: req.query.product_id,
        results: results.rows
      }
      res.send(resultObj)
    })
    .catch((err) => {
      console.log(err)
      res.send(err)
    })

})


app.get("/qa/questions/:question_id/answers", (req, res) => {
  var page = req.query.page || 1;
  var count = req.query.count || 5;

  db.query(`
  SELECT answers.id, answers.body, answers.date_written, answers.answerer_name, answers.helpfulness, ARRAY_AGG(JSON_BUILD_OBJECT('id', answers_photos.id, 'url', answers_photos.url))
   AS photos
  FROM answers
  LEFT JOIN answers_photos
  ON answers.id = answers_photos.answer_id
  WHERE answers.question_id = ${req.params.question_id} AND answers.reported = false
  GROUP BY answers.id
  LIMIT ${count}
  OFFSET ${count * page - count}`)
    .then((results) => {
      var resultObj = {
        question: req.params.question_id,
        page: page,
        count: count,
        results: results.rows
      }
      res.send(resultObj)
    })
    .catch((err) => {
      console.log(err)
    })
})

/* --------------- POST REQUESTS ----------------- */
app.post("/qa/questions", (req, res) => {
  db.query(`INSERT INTO questions (product_id, question_body, asker_name, asker_email, reported, question_helpfulness) VALUES (${req.body.product_id}, '${req.body.body}', '${req.body.name}', '${req.body.email}', 'f', 0)`)
    .then((results) => {
      res.send('Created')
    })
    .catch((err) => {
      res.send(err)
    })
})


app.post('/qa/questions/:question_id/answers', (req, res) => {

  var values = [req.params.question_id, req.body.body, req.body.name, req.body.email, req.body.photos]

  db.query(`
  WITH temp_answers AS (
    INSERT INTO answers(question_id, body, answerer_name, answerer_email, reported, helpfulness) VALUES ($1, $2, $3, $4, 'f', 0) RETURNING id)

    INSERT INTO answers_photos(answer_id, url)
    SELECT id,
    UNNEST(($5)::text[])
    FROM temp_answers
    `, values)
    .then(() => {
      res.send('Answers added successfully')
    })
    .catch((err) => {
      res.send(err)
    })

})

/* --------------------PUT REQUESTS--------------------- */

app.put('/qa/questions/:question_id/helpful', (req, res) => {
  db.query(`
  UPDATE questions
  SET question_helpfulness = question_helpfulness + 1
  WHERE questions.id = ${req.params.question_id}
  `)
    .then(() => {
      res.send('Helpfulness Updated')
    })
    .catch((err) => {
      res.send(err)
    })
})

app.put('/qa/questions/:question_id/report', (req, res) => {
  db.query(`
  UPDATE questions
  SET reported = 't'
  WHERE questions.id = ${req.params.question_id}
  `)
    .then(() => {
      res.send('Question Reported')
    })
    .catch((err) => {
      res.send(err)
    })
})

app.put('/qa/answers/:answer_id/helpful', (req, res) => {
  db.query(`
  UPDATE answers
  SET helpfulness = helpfulness + 1
  WHERE answers.id = ${req.params.answer_id}
  `)
    .then(() => {
      res.send('Helpfulness Updated')
    })
    .catch((err) => {
      res.send(err)
    })
})

app.put('/qa/answers/:answer_id/report', (req, res) => {
  db.query(`
  UPDATE answers
  SET reported = 't'
  WHERE answers.id = ${req.params.answer_id}
  `)
    .then(() => {
      res.send('Answer Reported')
    })
    .catch((err) => {
      res.send(err)
    })
})