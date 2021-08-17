
DROP TABLE IF EXISTS questions;

DROP TABLE IF EXISTS answers;

DROP TABLE IF EXISTS answers_photos;

CREATE TABLE questions (
  id SERIAL,
  product_id INT,
  question_body VARCHAR(255) NOT NULL,
  question_date BIGINT,
  asker_name VARCHAR(50),
  asker_email VARCHAR(255),
  reported BOOLEAN NOT NULL,
  question_helpfulness INT,
  PRIMARY KEY(id)
);

CREATE TABLE answers (
  id SERIAL,
  question_id INT,
  body VARCHAR(255) NOT NULL,
  date_written BIGINT,
  answerer_name VARCHAR(255),
  answerer_email VARCHAR(255),
  reported BOOLEAN NOT NULL,
  helpfulness INT NOT NULL,
  PRIMARY KEY(id),
  FOREIGN KEY(question_id)
    REFERENCES questions(id)
);

CREATE TABLE answers_photos (
  id SERIAL NOT NULL,
  answer_id INT NOT NULL,
  url VARCHAR(255) NOT NULL,
  PRIMARY KEY(id),
  FOREIGN KEY (answer_id)
    REFERENCES answers(id)
);

/*

  psql justincase  -h 127.0.0.1 -d test -f server/schema.sql

  COPY questions FROM '/Users/justincase/Documents/Sample_Data/questions.csv' WITH DELIMITER ',' CSV HEADER;

  COPY answers FROM '/Users/justincase/Documents/Sample_Data/answers.csv' WITH DELIMITER ',' CSV HEADER;

  COPY answers_photos FROM '/Users/justincase/Documents/Sample_Data/answers_photos.csv' WITH DELIMITER ',' CSV HEADER;

  ALTER TABLE questions
  ALTER COLUMN question_date TYPE timestamp with time zone
  USING to_timestamp(question_date/1000),
  ALTER COLUMN question_date TYPE VARCHAR
  USING to_char(question_date, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
  ALTER COLUMN question_date SET DEFAULT current_timestamp;

  -----------------

  ALTER COLUMN question_date SET DEFAULT current_timestamp;

  SELECT setval('answers_photos_id_seq', (select max(id) from answers_photos));

  ------ index commands --------

  CREATE INDEX questions_product_id_idx
  ON questions (product_id);

  CREATE INDEX answers_question_id_idx
  ON answers (question_id);

  CREATE INDEX answers_photos_answer_id_idx
  ON answers_photos (answer_id);


*/