pipeline {
    agent any

    tools {
        nodejs 'node18'
    }

    environment {
        IMAGE_NAME = "devops-app"
        DOCKER_REPO = "riyaverma5456/devops-app"
        SONAR_HOST_URL = "http://localhost:9000"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm install'
            }
        }

        stage('Test') {
            steps {
                bat 'npm test'
            }
        }

        stage('SonarQube Scan') {
            steps {
                script {
                    def scannerHome = tool 'sonar-scanner'
                    withSonarQubeEnv('sonarqube') {
                        bat """
                        ${scannerHome}\\bin\\sonar-scanner.bat ^
                        -Dsonar.projectKey=devops-app ^
                        -Dsonar.sources=. ^
                        -Dsonar.host.url=%SONAR_HOST_URL% ^
                        -Dsonar.token=%SONAR_AUTH_TOKEN%
                        """
                    }
                }
            }
        }

        stage('Security Scan') {
            steps {
                bat '"C:\\Users\\riyav\\AppData\\Local\\Microsoft\\WinGet\\Links\\trivy.exe" fs --severity HIGH,CRITICAL --exit-code 1 .'
            }
        }

        stage('Build Docker Image') {
            steps {
                bat 'docker build -t %IMAGE_NAME% .'
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'docker-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    bat """
                    echo %DOCKER_PASS% | docker login -u %DOCKER_USER% --password-stdin
                    docker tag %IMAGE_NAME% %DOCKER_REPO%:latest
                    docker tag %IMAGE_NAME% %DOCKER_REPO%:v1.0
                    docker push %DOCKER_REPO%:latest
                    docker push %DOCKER_REPO%:v1.0
                    """
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    try {
                        bat 'docker rm -f devops-app || exit /b 0'
                        bat 'docker run -d --name devops-app -p 3000:3000 %IMAGE_NAME%'
                    } catch (err) {
                        echo "Deployment failed! Rolling back..."
                        bat """
                        docker rm -f devops-app || exit /b 0
                        docker run -d --name devops-app -p 3000:3000 riyaverma5456/devops-app:v1.0
                        """
                        error("Deployment failed, rollback executed")
                    }
                }
            }
        }

        stage('Release') {
            steps {
                bat 'git tag v1.0 || exit /b 0'
                bat 'git push origin v1.0 || exit /b 0'
            }
        }

        stage('Monitoring') {
            steps {
                bat 'docker ps'
                bat 'docker logs devops-app || exit /b 0'
            }
        }
    }

    post {
        success {
            emailext(
                subject: "SUCCESS: ${env.JOB_NAME}",
                body: """Pipeline completed successfully.

Stages executed:
- Checkout
- Install Dependencies
- Test
- SonarQube Scan
- Security Scan
- Build Docker Image
- Push to Docker Hub
- Deploy
- Release
- Monitoring
""",
                to: "riyaverma5383@gmail.com"
            )
        }

        failure {
            emailext(
                subject: "FAILED: ${env.JOB_NAME}",
                body: """Pipeline failed.

Please check the Jenkins console output for the exact error details.
""",
                to: "riyaverma5383@gmail.com"
            )
        }
    }
}