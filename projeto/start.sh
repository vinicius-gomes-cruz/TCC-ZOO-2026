#!/bin/bash

# backend
cd back-end
./mvnw spring-boot:run &

# frontend
cd ../front-end
npm run dev