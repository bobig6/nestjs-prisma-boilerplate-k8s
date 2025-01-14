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
### **9. Deployment with Docker and Minikube**
This will show you how to deploy the application locally with minikube.

- **Start Minikube**
```bash
minikube start
```

- **Setup your configmap**
You should copy the contents from k8s/configmap-template.yaml to a new file called k8s/configmap.yaml and replace the values with your own.

- **Create the configmap**
```bash
kubectl apply -f k8s/configmap.yaml
```

- **Apply the deployment and service**
```bash
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

- **Check the status of the deployment**
```bash
kubectl get pods
kubectl get deployments
kubectl get services
```

- **Access the application**
```bash
minikube service nestjs-prisma-boilerplate-service
```

### **10. Stop the application**
- **Delete the deployment and service**
```bash
kubectl delete -f k8s/deployment.yaml
kubectl delete -f k8s/service.yaml
```

- **Delete the configmap**
```bash
kubectl delete -f k8s/configmap.yaml
```

- **Verify the deletion**
```bash
kubectl get all
```

- **Stop Minikube**
```bash
minikube stop
```

- **List the docker containers**
```bash
docker ps
```

- **Stop the docker container**
```bash
docker stop <container_id>
```

- **Remove the docker container**
```bash
docker rm <container_id>
```

- **Remove the docker image**
```bash
docker rmi <image_id>
```


## **GitHub Actions Workflow**

Before you can use the GitHub Actions workflows, you need to set up the following secrets in your repository:
- `AWS_ACCESS_KEY_ID`: AWS Access Key ID.
- `AWS_S3_BUCKET_NAME`: AWS S3 Bucket Name.
- `AWS_S3_ENDPOINT`: AWS S3 Endpoint.
- `AWS_SECRET_ACCESS_KEY`: AWS Secret Access Key.
- `DATABASE_URL`: PostgreSQL database URL.
- `DOCKER_PASSWORD`: Docker Hub password.
- `DOCKER_USERNAME`: Docker Hub username.
- `JWT_SECRET`: JWT secret key for authentication.
- `SNYK_TOKEN`: Snyk API token.

### **CI/CD Pipeline**
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
    - **Minikube**: Simulates a deployment with Kubernetes. It sets up a local cluster with Minikube and deploys the application. After that it stops the cluster and removes the deployment.

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
- **`k8s/`**: Kubernetes deployment files.
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