# 💬 Real-Time Webchat Project

This is a webchat application built using sockets for real-time, bi-directional communication.

## 🚀 Getting Started

Follow these instructions to get the project set up and running on your local machine for development and testing.

### Prerequisites

* [Git](https://git-scm.com/)
* [Docker](https://www.docker.com/)
* [Node.js](https://nodejs.org/en/) (which includes npm)

### 🛠️ Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/compNet2025-rotiMatabaAroiEiEi/network2025-project.git
    cd network2025-project
    ```

2.  **Create the backend database file:**
    This project requires a `db.json` file for the backend.
    ```bash
    mkdir -p backend/data
    touch backend/data/db.json
    ```

3.  **Create the backend configuration file:**
    Create a file named `config.env` inside the `backend/config/` directory.
    ```bash
    # Create the file
    touch backend/config/config.env
    ```
    Now, add the following variables to that file:
    ```.env
    # backend/config/config.env
    PORT=8000
    NODE_ENV=development
    ```

4.  **Create the frontend configuration file:**
    Create a file named `config.env` inside the `frontend/config/` directory.
    ```bash
    # Create the file
    touch frontend/config/config.env
    ```
    Now, add the following variable to that file. (This points to the backend server we configured in the step above).
    ```.env
    # frontend/config/config.env
    VITE_BACKEND_HOST={your ipv4 address}
    ```

5.  **Install dependencies and run the application:**
    This single command will install dependencies, build the necessary images, and start all services. (Make sure Docker Desktop is running!)
    ```bash
    npm run dev:up
    ```

6.  **You're free to go!** 🎉
    Once the command finishes, open your browser and navigate to the frontend URL
    
    `{your ipv4 address}:5173`

    You are now running the webchat application!
