pipeline {
    agent any

    tools {
        nodejs 'NodeJS' // make sure NodeJS is configured in Jenkins
    }

    environment {
        SONARQUBE_SERVER = 'sonarqube' // must match Jenkins config name
    }

    stages {

        stage('Checkout') {
            steps {
                git credentialsId: 'gmail-smtp', url: 'https://github.com/riyaverma5456/devops-riya'
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
                withSonarQubeEnv("${SONARQUBE_SERVER}") {
                    bat 'sonar-scanner'
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 2, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                bat 'docker build -t riyaverma5456/devops-app .'
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker-creds', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
                    bat 'docker login -u %USERNAME% -p %PASSWORD%'
                    bat 'docker push riyaverma5456/devops-app'
                }
            }
        }

        stage('Deploy') {
            steps {
                bat 'docker run -d -p 3000:3000 riyaverma5456/devops-app'
            }
        }
    }

    post {
        always {
            emailext to: 'riyaverma5383@gmail.com',
                     subject: "Pipeline Status: ${currentBuild.currentResult}",
                     body: "Build ${currentBuild.currentResult}"
        }
    }
}








// pipeline {
//     agent any

//     tools {
//         nodejs 'node18'
//     }

//     environment {
//         IMAGE_NAME = "devops-app"
//         DOCKER_REPO = "riyaverma5456/devops-pipeline"
//         SONAR_HOST_URL = "http://localhost:9000"
//         TRIVY_PATH = "C:\\Users\\riyav\\AppData\\Local\\Microsoft\\WinGet\\Links\\trivy.exe"
//     }

//     stages {

//         stage('Checkout') {
//             steps {
//                 checkout scm
//             }
//         }

//         stage('Install Dependencies') {
//             steps {
//                 bat 'npm install'
//             }
//         }

//         stage('Test') {
//             steps {
//                 bat 'npm test'
//             }
//         }

//         stage('SonarQube Scan') {
//             steps {
//                 script {
//                     def scannerHome = tool 'sonar-scanner'
//                     withSonarQubeEnv('sonarqube') {
//                         bat """
//                         @echo off
//                         call "${scannerHome}\\bin\\sonar-scanner.bat" ^
//                         -Dsonar.projectKey=devops-app ^
//                         -Dsonar.sources=. ^
//                         -Dsonar.host.url=%SONAR_HOST_URL% ^
//                         -Dsonar.token=%SONAR_AUTH_TOKEN%
//                         if errorlevel 1 exit /b 1
//                         """
//                     }
//                 }
//             }
//         }

//         stage('Security Scan') {
//             steps {
//                 bat """
//                 @echo off
//                 "%TRIVY_PATH%" fs --severity HIGH,CRITICAL --exit-code 1 .
//                 if errorlevel 1 exit /b 1
//                 """
//             }
//         }

//         stage('Build Docker Image') {
//             steps {
//                 bat """
//                 @echo off
//                 docker build -t %IMAGE_NAME% .
//                 if errorlevel 1 exit /b 1
//                 """
//             }
//         }

//         stage('Push to Docker Hub') {
//             steps {
//                 withCredentials([usernamePassword(
//                     credentialsId: 'docker-creds',
//                     usernameVariable: 'DOCKER_USER',
//                     passwordVariable: 'DOCKER_PASS'
//                 )]) {
//                     bat """
//                     @echo off
//                     docker logout >nul 2>&1

//                     echo %DOCKER_PASS%| docker login -u %DOCKER_USER% --password-stdin
//                     if errorlevel 1 exit /b 1

//                     docker tag %IMAGE_NAME% %DOCKER_REPO%:latest
//                     if errorlevel 1 exit /b 1

//                     docker tag %IMAGE_NAME% %DOCKER_REPO%:v1.0
//                     if errorlevel 1 exit /b 1

//                     docker push %DOCKER_REPO%:latest
//                     if errorlevel 1 exit /b 1

//                     docker push %DOCKER_REPO%:v1.0
//                     if errorlevel 1 exit /b 1

//                     docker logout >nul 2>&1
//                     """
//                 }
//             }
//         }

//         stage('Deploy') {
//             steps {
//                 script {
//                     try {
//                         bat """
//                         @echo off
//                         docker rm -f devops-app >nul 2>&1
//                         docker run -d --name devops-app -p 3000:3000 %IMAGE_NAME%
//                         if errorlevel 1 exit /b 1
//                         """
//                     } catch (err) {
//                         echo "Deployment failed! Rolling back..."
//                         bat """
//                         @echo off
//                         docker rm -f devops-app >nul 2>&1
//                         docker run -d --name devops-app -p 3000:3000 %DOCKER_REPO%:v1.0
//                         """
//                         error("Deployment failed, rollback executed")
//                     }
//                 }
//             }
//         }

//         stage('Release') {
//             steps {
//                 bat """
//                 @echo off
//                 git tag v1.0 >nul 2>&1
//                 exit /b 0
//                 """
//             }
//         }

//         stage('Monitoring') {
//             steps {
//                 bat """
//                 @echo off
//                 docker ps
//                 docker logs devops-app >nul 2>&1
//                 exit /b 0
//                 """
//             }
//         }
//     }

//     post {
//         success {
//             emailext(
//                 subject: "SUCCESS: ${env.JOB_NAME}",
//                 body: """Pipeline completed successfully.

// Stages executed:
// - Checkout
// - Install Dependencies
// - Test
// - SonarQube Scan
// - Security Scan
// - Build Docker Image
// - Push to Docker Hub
// - Deploy
// - Release
// - Monitoring
// """,
//                 to: "riyaverma5383@gmail.com"
//             )
//         }

//         failure {
//             emailext(
//                 subject: "FAILED: ${env.JOB_NAME}",
//                 body: """Pipeline failed.

// Check:
// - SonarQube is running on localhost:9000
// - Jenkins credential ID 'docker-creds' exists
// - docker-creds username is riyaverma5456
// - docker-creds password/token is correct
// - Trivy exists at: %TRIVY_PATH%
// """,
//                 to: "riyaverma5383@gmail.com"
//             )
//         }
//     }
// }