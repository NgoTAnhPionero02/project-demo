# Project Management Tool Server

Express server for the project management tool, designed to be deployed on AWS ECS.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:

```
PORT=3000
# Add other environment variables as needed
```

3. Start the development server:

```bash
npm run dev
```

4. Start the production server:

```bash
npm start
```

## API Endpoints

- `POST /user` - Create a new user
- `GET /user?uid=${uid}` - Get user data
- `PUT /user/boards` - Remove user from board
- `POST /user/boards` - Get user's boards

## Deployment

The server is designed to be deployed on AWS ECS. Make sure to:

1. Set up proper environment variables in ECS
2. Configure the container port mapping
3. Set up proper security groups
4. Configure the load balancer if needed
