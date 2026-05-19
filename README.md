--START
This is a example template, which you can use. Version 1.0.
--END

# Adulting101

Web application designed to help young adults manage everyday life tasks, finances, and chores.

## Description

Adulting101 is a comprehensive life management tool built with a modern web architecture. The application consists of a responsive **Angular frontend** utilizing reactive features like Angular Signals, and a robust **Node.js/Express backend** connected to a **MongoDB** cloud database.

The application provides integrated tools for:

- **Financial Management:** Monthly budgeting with dynamic limit bars, single entries, and automated recurring transactions.
- **Moving Checklists:** Interactive item checklists categorized to help organize the relocation process.
- **Personal Notes:** Fast and intuitive digital sticky notes for daily reminders.

User authentication and secure data isolation are robustly managed via integration with **AWS Cognito**.

## Getting Started

### Dependencies

The project is divided into two main directories: `frontend` and `backend`.

**Frontend Requirements:**

- Angular CLI (v17 or newer)
- TypeScript
- Bootstrap / CSS components for styling

**Backend Requirements:**

- Node.js (v18 or newer recommended)
- Express framework
- Mongoose ORM (MongoDB)
- AWS SDK (`@aws-sdk/client-cognito-identity-provider`)
- Security tools: Helmet, CORS, Express-Rate-Limit, Express-Validator

### Installing

1.  **Clone the repository:**

    ````bash
    git clone https://github.com/jamktiko/Adulting101.git
    cd Adulting101
    cd backend
    npm install

    Create a `.env` file in the root of the `backend/` folder and populate it with your environment credentials:
    ```env
    PORT=3000
    MONGODB_URI=your_mongodb_cluster_connection_string
    COGNITO_CLIENT_ID=your_aws_cognito_client_id
    COGNITO_CLIENT_SECRET=your_aws_cognito_client_secret

    cd frontend
    npm install
    ````

### Executing program

To run the full stack application locally, you need to spin up both servers.

1.  **Start the Backend Server:**
    In the `backend/` directory, run:
    `bash`
    `node server.js`
    You should see confirmation logs: `🚀 Serveri pyörii portissa 3000` and `✅ Yhteys MongoDB-pilveen ok!`.

    In the frontend/ directory, run:
    `ng serve`

    Open your browser and navigate to `http://localhost:4200` to interact with the application.

## Authors

- Milena Madlin - backend, database, documenting
- Tatu Olkinuora - AWS, UI/UX, GitHub, documenting
- Aino Seppi - frontend, backend, database, UI/UX, GitHub Projects, Product Owner
- Aarne Ylönen - AWS, UI/UX, Scrum Master

## Version History

- 1.0
  - Full Stack Integration: Angular Frontend connected dynamically with Node.js.
  - AWS Cognito fully handles registration, login tokens, and email verification.
  - Secured backend pipelines via validations, custom text sanitizers, and request rate-limiting.
- 0.1
  - Initial UI Mockups and basic REST API route definitions.

## License

This project is licensed under the CC BY-SA 4.0 License - see the LICENSE.md file for details

[![CC BY-SA 4.0][cc-by-sa-image]][cc-by-sa]

[cc-by-sa]: http://creativecommons.org/licenses/by-sa/4.0/
[cc-by-sa-image]: https://licensebuttons.net/l/by-sa/4.0/88x31.png

## Acknowledgments

- JAMK University of Applied Sciences - Project Course Inspiration
- AWS SDK and Mongoose Open-Source Documentations
