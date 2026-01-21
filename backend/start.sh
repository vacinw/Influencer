#!/bin/bash

lsof -t -i:8080 | xargs kill -9

mvn spring-boot:run
