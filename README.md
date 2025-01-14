# **NestJS Prisma Boilerplate**

This boilerplate provides a robust and extensible foundation for building scalable backend applications using **NestJS** with **Prisma ORM**. It incorporates modern development practices, CI/CD pipelines, and Dockerization for ease of deployment.

## **Core Features**

### 1. **Prisma ORM**
- Integrated Prisma ORM for database management and migrations.
- Pre-configured with a sample schema (`schema.prisma`) to get started.
- Easily extendable for your specific database models.

### 2. **Security**
- **Snyk Integration**: Vulnerability scanning for dependencies.
- **Trivy Integration**: Docker image scanning for vulnerabilities.
- **Best Practices**:
    - Environment variables validation using `class-validator`.
    - Strict TypeScript settings for improved code safety.

### 3. **Swagger Documentation**
- **@nestjs/swagger** integration for automatic API documentation.
- Swagger UI is available at `/api-docs` endpoint.

### 4. **Testing**
- **Unit Testing**:
    - Configured with Jest for service and controller tests.
    - Mocked Prisma Client for isolated tests.
- **Integration Testing**:
    - API endpoint tests with `supertest`.
    - Uses an in-memory database for clean and repeatable tests.
- **End-to-End Testing**:
    - Set up for comprehensive application workflow testing.

### 5. **CI/CD Pipeline**
- Includes GitHub Actions workflows for:
    - Linting and code quality checks.
    - Unit and integration tests with PostgreSQL.
    - Dependency scanning with Snyk.
    - Docker image vulnerability scans with Trivy.
    - Automated Docker image builds and pushes.

### 6. **Docker**
- Production-ready Dockerfile included.
- Local development with `docker-compose.yml`.

---

## **Setup Guide**

### **1. Prerequisites**
- Node.js 20 or higher.
- Docker and Docker Compose.
- PostgreSQL database.

### **2. Clone the Repository**
```bash
git clone https://github.com/bobig6/nestjs-prisma-boilerplate.git
cd nestjs-prisma-boilerplate
```

### **3. Install Dependencies**
```bash
npm install
```

### **4. Configure Environment**
- Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
- Update environment variables for your database, JWT secrets, and AWS S3 configuration.

### **5. Run Prisma Migrations**
```bash
npx prisma migrate dev
```

### **6. Start the Application**
- **Development**:
```bash
npm run start:dev
```
- **Production**:
```bash
npm run start:prod
```

### **7. Run Tests**
- **Unit and Integration Tests**:
```bash
npm run test
```
- **Coverage**:
```bash
npm run test:cov
```

### **8. Build Docker Image**
```bash
docker build -t nestjs-prisma-boilerplate .
```
### **9. Deployment**

To deploy the application to a server, follow these steps:

1. **Copy Deployment Script**:
   Transfer the `example.deploy.sh` file to your server and modify it with your proper values

    ```bash
    #!/bin/bash
    
    # Ensure the script exits on any command failure
    set -e
    
    # Define environment variables for the container
    CONTAINER_NAME="my_container"
    IMAGE_NAME="my_docker_image"
    ENV_FILE="/path/to/.env"  # Path to your .env file
    
    # Pull the latest Docker image
    echo "Pulling the latest image: $IMAGE_NAME"
    docker pull $IMAGE_NAME
    
    # Stop and remove the currently running container if it exists
    if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
        echo "Stopping running container: $CONTAINER_NAME"
        docker stop $CONTAINER_NAME
        echo "Removing container: $CONTAINER_NAME"
        docker rm $CONTAINER_NAME
    fi
    
    # Run the new container with environment variables
    echo "Starting a new container: $CONTAINER_NAME"
    docker run -d --name $CONTAINER_NAME -p 3030:3030 --env-file $ENV_FILE $IMAGE_NAME
    
    echo "Deployment complete. New container is running: $CONTAINER_NAME"
    ```

2. **Set Up Environment Variables**:
   On your server, create an `.env` file using `.env.example` as a template:

    ```bash
    PORT=3030
    
    # Connect to Supabase via connection pooling with Supavisor.
    DATABASE_URL=
    # Direct connection to the database. Used for migrations.
    DIRECT_URL=
    
    JWT_SECRET=
    AWS_ACCESS_KEY_ID=
    AWS_SECRET_ACCESS_KEY=
    AWS_S3_REGION=
    AWS_S3_ENDPOINT=
    AWS_S3_BUCKET_NAME=
    
    NODE_ENV=development
    ```

3. **Install Docker**:
   Follow the official Docker installation guide for Ubuntu:

   [Docker Engine Installation on Ubuntu](https://docs.docker.com/engine/install/ubuntu/)

4. **Make the Deployment Script Executable**:
   On your server, make the deployment script executable:

    ```bash
    chmod +x example.deploy.sh
    ```

5. **Run the Deployment Script**:
   Execute the script to deploy the application:

    ```bash
    ./example.deploy.sh
    ```

6. **Configure Server Firewall Rules**:
   Ensure your server's firewall rules allow inbound and outbound traffic on the application's port (default: 3030).
---

## **GitHub Actions Workflow**

- **Branches**:
    - `main`: Production-ready code.
    - `develop`: Pre-production branch.
    - `feature/*`: Feature development.
    - `hotfix/*`: Critical production fixes.

- Workflows:
    - **Linting**: Runs ESLint checks.
    - **Testing**: Executes unit and integration tests.
    - **Vulnerability Scans**: Uses Snyk and Trivy for security checks.
    - **Build and Push Docker Image**: Builds and pushes to Docker Hub.

---

## **Usage**

### **Swagger API Documentation**
Access the API documentation at:
```
http://localhost:3000/api
```

### **Health Check**
Verify server health with:
```
http://localhost:3000/health
```

---

## **Folder Structure**

- **`prisma/`**: Prisma configuration and migrations.
- **`src/`**: Application source code.
  - **`decorators/`**: Custom decorators.
  - **`guards/`**: Auth guards.
  - **`health/`**: Health check module.
  - **`prisma/`**: Prisma service and module.
  - **`users/`**: User module.
  - **`s3/`**: AWS S3 service.
  - **`app.controller.ts`**: Main application controller.
  - **`app.module.ts`**: Main application module.
  - **`app.service.ts`**: Main application service.
  - **`main.ts`**: Application entry point.
- **`test/`**: Test utilities and fixtures.
- **`Dockerfile`**: Production-ready Docker configuration.
- **`docker-compose.yml`**: Local development setup.
- **`example.deploy.sh`**: Deployment script template.
- **`.env.example`**: Environment variables template.

---

## **License**
This project is UNLICENSED and is intended for educational purposes.

---