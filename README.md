# Receipt Recorder (API)
This is the backend API for receipt recorder, created with Node.js, express.js, MySQL and Redis.

With this API, you can upload and categorized your receipts with self-created tags.

## Table of Content
* [API Document](#API_Document)
* [ERD Diagram](#ERD_Diagram)
* [Server](#Server)
* [Features](#Features)
* [Installation](#Installation)
* [Testing](#Testing)

## API_Document
For API detailed information, please checked in [Swagger](https://app.swaggerhub.com/apis-docs/Kaikai8888/receipt-recorder_api/1.0.0)

## ERD_Diagram
![ERD](/docs/Invoice-Recorder-ERD.png)

## Server
Server has been deployed to heroku. My hostname is https://receipt-recorder.herokuapp.com/
**Demo Account:**
* email: user1@example.com , user2@example.com
* password: 12345678

## Features
| Parts   | Features                                            |
|---------|-----------------------------------------------------|
| User    | sign in, sign out                                   |
| Receipt | upload receipt(with fixed format), get all receipts or filter with certain tag |
| Tag     | create, read, update, delete your own tags          |
| Tagging | tag or untag receipt                                |

Receipt Format: [example receipt](https://raw.githubusercontent.com/Kaikai8888/receipt-recorder/master/docs/quiz_sample_receipts/sample_receipt_2.txt)

## Installation
### Getting Started
1. Clone repository

```bash
git clone https://github.com/Kaikai8888/receipt-recorder.git
```

2. Install dependencies

```bash
cd receipt-recorder
npm install
```

3. Setup your own MySQL database and modify connection config in `/config/config.json`)

4. Start Redis Server

```bash
# For Windows
cd [Your Redis server folder]
redis-server redis.windows.conf
```

5. Setup environment variables:

  Create `.env` file follow `.env.example` and set your own `JWT_SECRET`

6. (For Mac) Replace scripts in `package.json` with below scripts
```json
  {
    "scripts": {
      "start": "mkdir temp && npm run reset && node app.js",
      "dev": "export NODE_ENV=development && npx sequelize-cli db:migrate && nodemon app.js",
      "reset": "npx sequelize-cli db:migrate:undo:all && npx sequelize-cli db:migrate && npx sequelize-cli db:seed:all",
      "clear-temp": "rm ./temp/*",
      "test": "export NODE_ENV=test && npx sequelize-cli db:migrate && mocha test/*.js --exit --recursive --timeout 5000"
    },
  }
```

7. Initialize the server

```
npm run start
```

### Built with
- Node.js: 10.15.0
- express: 4.17.1
- mysql2: 2.2.5
- sequelize: 6.5.0
- sequelize-cli: 6.2.0
- redis: 3.0.2

## Testing
```
npm run test
```
Test with:
- mocha: 8.3.0
- chai: 4.3.0
- sinon: 9.2.4
- supertest: 6.1.3
