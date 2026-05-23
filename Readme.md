# 🛒 E-Commerce Full Stack Application

A full-stack e-commerce web application built with **Spring Boot** (backend) and **React** (frontend), featuring JWT authentication, Razorpay payment integration, role-based access control, and Docker deployment.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Local Development Setup](#local-development-setup)
- [Docker Deployment](#docker-deployment)
  - [Docker Compose Setup](#docker-compose-setup)
  - [Running with Docker](#running-with-docker)
- [Environment Variables](#environment-variables)
- [Screenshots](#screenshots)
- [Contributing](#contributing)

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure login & registration with token-based auth
- 👤 **Role-Based Access** — Separate USER and ADMIN roles
- 🛍️ **Product Browsing** — Search and filter products by category
- 🛒 **Shopping Cart** — Add, update, and remove items
- 📦 **Order Management** — Place orders and track order history
- 💳 **Razorpay Payment Integration** — Secure online payment with signature verification
- ⭐ **Product Reviews** — Leave ratings and comments on products
- 🖥️ **Admin Dashboard** — Manage products, orders, and users with stats overview

---

## 🛠 Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Java | 17 | Programming language |
| Spring Boot | 3.5.14 | Application framework |
| Spring Security | — | Authentication & Authorization |
| Spring Data JPA | — | ORM & database interaction |
| MySQL | 8 | Relational database |
| JWT (jjwt) | 0.11.5 | Token generation & validation |
| Razorpay Java SDK | 1.4.3 | Payment gateway |
| Lombok | — | Boilerplate reduction |
| Maven | — | Build tool |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19.2.5 | UI library |
| React Router DOM | 7.14.2 | Client-side routing |
| Axios | 1.15.2 | HTTP client |

---

## 📁 Project Structure

```
E-commerce project/
├── backend/
│   └── e-commerce/
│       ├── src/
│       │   └── main/
│       │       ├── java/com/ecommerce/
│       │       │   ├── config/          # JWT, Security, CORS config
│       │       │   ├── controller/      # REST API controllers
│       │       │   ├── dto/             # Data Transfer Objects
│       │       │   ├── model/           # JPA Entity models
│       │       │   ├── repository/      # Spring Data repositories
│       │       │   └── service/         # Business logic
│       │       └── resources/
│       │           └── application.properties
│       ├── pom.xml
│       └── Dockerfile
└── frontend/
    └── ecommerce-frontend/
        ├── src/
        │   ├── pages/                   # React page components
        │   │   ├── Login.jsx
        │   │   ├── Register.jsx
        │   │   ├── ProductList.jsx
        │   │   ├── ProductDetail.jsx
        │   │   ├── Cart.jsx
        │   │   ├── Checkout.jsx
        │   │   ├── Payment.jsx
        │   │   ├── OrderHistory.jsx
        │   │   ├── OrderDetail.jsx
        │   │   └── AdminDashboard.jsx
        │   ├── components/
        │   │   └── StarBadge.jsx
        │   ├── api.js
        │   └── App.js
        ├── package.json
        └── Dockerfile
```

---

## 📡 API Endpoints

### Auth — `/api/auth`
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Login and receive JWT token | No |

### Products — `/api/products`
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/products` | Get all products (supports `?search=` & `?category=`) | No |
| GET | `/api/products/{id}` | Get product by ID | No |
| POST | `/api/products` | Create a product | Admin |
| PUT | `/api/products/{id}` | Update a product | Admin |
| DELETE | `/api/products/{id}` | Delete a product | Admin |

### Cart — `/api/cart`
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/cart` | Get current user's cart | Yes |
| POST | `/api/cart` | Add item to cart | Yes |
| PUT | `/api/cart/{itemId}` | Update item quantity | Yes |
| DELETE | `/api/cart/{itemId}` | Remove item from cart | Yes |

### Orders — `/api/orders`
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/orders` | Place a new order | Yes |
| GET | `/api/orders` | Get my orders | Yes |
| GET | `/api/orders/{id}` | Get single order | Yes |
| GET | `/api/orders/admin/all` | Get all orders | Admin |
| PUT | `/api/orders/admin/{id}/status` | Update order status | Admin |

### Payments — `/api/payment`
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/payment/create-order` | Create Razorpay order | Yes |
| POST | `/api/payment/verify` | Verify payment signature | Yes |

### Reviews — `/api/reviews`
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/reviews/product/{productId}` | Get reviews for a product | No |
| GET | `/api/reviews/product/{productId}/stats` | Get rating stats | No |
| GET | `/api/reviews/product/{productId}/mine` | Check if user reviewed | Yes |
| POST | `/api/reviews/product/{productId}` | Add/update review | Yes |
| DELETE | `/api/reviews/{reviewId}` | Delete own review | Yes |

### Admin — `/api/admin`
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/admin/stats` | Dashboard statistics | Admin |
| GET | `/api/admin/orders` | All orders | Admin |
| PUT | `/api/admin/orders/{id}/status` | Update order status | Admin |
| GET | `/api/admin/users` | All users | Admin |
| GET | `/api/admin/products` | All products | Admin |
| POST | `/api/admin/products` | Add product | Admin |
| PUT | `/api/admin/products/{id}` | Update product | Admin |
| DELETE | `/api/admin/products/{id}` | Delete product | Admin |

---

## 🚀 Getting Started

### Prerequisites

- Java 17+
- Node.js 18+ & npm
- MySQL 8+
- Docker & Docker Compose (for containerized deployment)
- Maven 3.8+

---

### Local Development Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/your-username/ecommerce-project.git
cd ecommerce-project
```

#### 2. Configure the Database

Create a MySQL database:

```sql
CREATE DATABASE ecommerce;
```

Update `backend/e-commerce/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/ecommerce
spring.datasource.username=your_mysql_username
spring.datasource.password=your_mysql_password

jwt.secret=your_jwt_secret_key
jwt.expiration=3600000

razorpay.key.id=your_razorpay_key_id
razorpay.key.secret=your_razorpay_key_secret
```

#### 3. Run the Backend

```bash
cd backend/e-commerce
./mvnw spring-boot:run
```

The backend starts at `http://localhost:8080`.

#### 4. Run the Frontend

```bash
cd frontend/ecommerce-frontend
npm install
npm start
```

The frontend starts at `http://localhost:3000`.

---

## 🐳 Docker Deployment

### Dockerfiles

#### Backend — `backend/e-commerce/Dockerfile`

```dockerfile
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY . .
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

#### Frontend — `frontend/ecommerce-frontend/Dockerfile`

```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

### Docker Compose Setup

Create a `docker-compose.yml` in the project root:

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: ecommerce-mysql
    environment:
      MYSQL_ROOT_PASSWORD: 1234
      MYSQL_DATABASE: ecommerce
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend/e-commerce
      dockerfile: Dockerfile
    container_name: ecommerce-backend
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/ecommerce
      SPRING_DATASOURCE_USERNAME: root
      SPRING_DATASOURCE_PASSWORD: 1234
      JWT_SECRET: bKJ6tsMaBWD9FzcXfc2gWJAJbjLCsDmmC3+gHVbFHCo=
      JWT_EXPIRATION: 3600000
      RAZORPAY_KEY_ID: your_razorpay_key_id
      RAZORPAY_KEY_SECRET: your_razorpay_key_secret
    depends_on:
      mysql:
        condition: service_healthy

  frontend:
    build:
      context: ./frontend/ecommerce-frontend
      dockerfile: Dockerfile
    container_name: ecommerce-frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  mysql_data:
```

---

### Running with Docker

```bash
# Build and start all containers
docker-compose up --build

# Run in detached (background) mode
docker-compose up --build -d

# View running containers
docker ps

# Stop all containers
docker-compose down

# Stop and remove volumes (clears database)
docker-compose down -v
```

Access the application:
- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:8080`

---

## 🔧 Environment Variables

| Variable | Description | Default |
|---|---|---|
| `SPRING_DATASOURCE_URL` | MySQL connection URL | `jdbc:mysql://localhost:3306/ecommerce` |
| `SPRING_DATASOURCE_USERNAME` | Database username | `root` |
| `SPRING_DATASOURCE_PASSWORD` | Database password | `1234` |
| `JWT_SECRET` | Secret key for signing JWTs | — |
| `JWT_EXPIRATION` | JWT expiry in milliseconds | `3600000` (1 hour) |
| `RAZORPAY_KEY_ID` | Razorpay API key ID | — |
| `RAZORPAY_KEY_SECRET` | Razorpay API key secret | — |

> ⚠️ **Security Note:** Never commit real credentials to version control. Use environment variables or a `.env` file for sensitive values.

---

## 🔑 Default Roles

| Role | Access |
|---|---|
| `USER` | Browse products, manage cart, place orders, write reviews |
| `ADMIN` | All USER permissions + manage products, view all orders/users, update order statuses |

To create an ADMIN user, manually update the role in the database after registering:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@example.com';
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).