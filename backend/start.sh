#!/bin/bash

# Source env variables if the file exists
if [ -f "render.env" ]; then
    export $(grep -v '^#' render.env | xargs)
fi

lsof -t -i:8080 | xargs kill -9 2>/dev/null || true

mvn spring-boot:run
