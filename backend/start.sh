#!/bin/bash

# Script to start the InfluConnect application
# Assumes JAVA_HOME is set correctly in .zshrc/.bashrc

# Ensure we are in the script's directory
cd "$(dirname "$0")"

# Check JAVA_HOME
if [ -z "$JAVA_HOME" ]; then
    # Fallback for macOS
    if [ -x "/usr/libexec/java_home" ]; then
        export JAVA_HOME=$(/usr/libexec/java_home)
        echo "JAVA_HOME not set. Using detected: $JAVA_HOME"
    else
        echo "Error: JAVA_HOME is not set. Please set it in your shell profile."
        exit 1
    fi
fi

echo "Using JAVA_HOME: $JAVA_HOME"
"$JAVA_HOME/bin/java" -version

# Run Maven
if [ -f "./mvnw" ]; then
    echo "Starting with Maven Wrapper..."
    chmod +x mvnw
    ./mvnw spring-boot:run
elif command -v mvn &> /dev/null; then
    echo "Maven Wrapper not found. Using system Maven..."
    mvn spring-boot:run
else
    echo "Error: 'mvn' command not found. Please install Maven or add the Maven Wrapper."
    exit 1
fi
