# InteractPro

InteractPro is a modern real-time chat application designed to enhance communication through smart features, group collaboration, and seamless cross-platform support.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
  - [Prerequisites](#prerequisites)
  - [Clone the Repository](#clone-the-repository)
  - [Install Dependencies](#install-dependencies)
  - [Environment Variables](#environment-variables)
- [Usage](#usage)
- [Folder Structure](#folder-structure)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Real-time Messaging:** Instant communication with zero lag.
- **Secure Authentication:** Profile management with JWT-based authentication.
- **Cross-Platform Support:** Seamless experience across devices.
- **File Sharing:** Upload and share files effortlessly.

## Tech Stack

### **Client:**
- [React](https://reactjs.org/) - Frontend framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Zustand](https://zustand-demo.pmnd.rs/) - Lightweight state management
- [Axios](https://axios-http.com/) - HTTP requests handling
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [Radix UI](https://www.radix-ui.com/) - Accessible components

### **Server:**
- [Node.js](https://nodejs.org/) - JavaScript runtime environment
- [Express.js](https://expressjs.com/) - Fast backend framework
- [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/) - NoSQL database and ODM
- [Socket.io](https://socket.io/) - Real-time bidirectional event-based communication
- [JWT](https://jwt.io/) - Secure authentication
- [Cloudinary](https://cloudinary.com/) - File uploads handling

## Installation

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/)

### Clone the Repository

```sh
git clone https://github.com/your-username/InteractPro.git
cd InteractPro
```

### Install Dependencies

#### Client
```sh
cd Client
npm install
```

#### Server
```sh
cd Server
npm install
```

### Environment Variables

Create a `.env` file in both the `Client` and `Server` directories and add the following:

#### **Client (.env)**
```env
VITE_APP_SERVER_URL=http://localhost:4000
```

#### **Server (.env)**
```env
DATABASE_URL=mongodb://localhost:27017/interactpro
JWT_KEY=your_jwt_secret_key
CLIENT_URL=http://localhost:3000
```

## Usage

### Running the Client
```sh
cd Client
npm run dev
```

### Running the Server
```sh
cd Server
npm run dev
```

The client will run on `http://localhost:3000` and the server on `http://localhost:4000`.

## Folder Structure

```
Client/
  ├── .env
  ├── .eslintrc.cjs
  ├── .gitignore
  ├── components.json
  ├── index.html
  ├── jsconfig.json
  ├── package.json
  ├── postcss.config.js
  ├── public/
  ├── src/
  │   ├── App.jsx
  │   ├── assets/
  │   ├── components/
  │   ├── context/
  │   ├── index.css
  │   ├── lib/
  │   ├── main.jsx
  │   ├── pages/
  │   └── store/
  ├── tailwind.config.js
  └── vite.config.js
Server/
  ├── .env
  ├── config/
  │   └── database.js
  ├── controllers/
  │   ├── AuthController.js
  │   ├── ContactController.js
  │   ├── messageController.js
  │   └── profileController.js
  ├── middlewares/
  │   └── AuthMiddleware.js
  ├── models/
  ├── package.json
  ├── routes/
  ├── server.js
  ├── socket.js
  └── uploads/
```

## Contributing

Contributions are welcome! Please follow these steps to contribute:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature-branch`).
3. Commit your changes (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a pull request.

## License

This project is licensed under the [MIT License](LICENSE). Feel free to use and modify the code for your own purposes.

