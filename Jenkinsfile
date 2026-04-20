pipeline {
    agent any

    // Global environment variables
    environment {
        IMAGE_NAME = "devops-app"
        DOCKER_REPO = "riyaverma/devops-app"
        SONAR_HOST_URL = "http://localhost:9000"
    }

    stages {

        // Fetch latest code from GitHub
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        // Install Node.js dependencies
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        // Run tests and code quality scan in parallel
        stage('Test & Code Quality') {
            parallel {

                // Run automated tests
                stage('Test') {
                    steps {
                        sh 'npm test'
                    }
                }

                // Run SonarQube analysis
                stage('SonarQube Scan') {
                    steps {
                        script {
                            def scannerHome = tool 'sonar-scanner'
                            withSonarQubeEnv('sonarqube') {
                                sh """
                                ${scannerHome}/bin/sonar-scanner \
                                -Dsonar.projectKey=devops-app \
                                -Dsonar.sources=. \
                                -Dsonar.host.url=$SONAR_HOST_URL \
                                -Dsonar.token=$SONAR_AUTH_TOKEN
                                """
                            }
                        }
                    }
                }
            }
        }

        // Check if code passes quality gate
        stage('Quality Gate') {
            steps {
                timeout(time: 2, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: false
                }
            }
        }

        // Scan project for vulnerabilities using Trivy
        stage('Security Scan') {
            steps {
                sh 'trivy fs --severity HIGH,CRITICAL --exit-code 1 .'
            }
        }

        // Build Docker image
        stage('Build Docker Image') {
            steps {
                sh 'docker build -t $IMAGE_NAME .'
            }
        }

        // Push image to Docker Hub repository
        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'docker-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                    echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin

                    docker tag $IMAGE_NAME $DOCKER_REPO:latest
                    docker tag $IMAGE_NAME $DOCKER_REPO:v1.0

                    docker push $DOCKER_REPO:latest
                    docker push $DOCKER_REPO:v1.0
                    '''
                }
            }
        }

        // Deploy container with rollback support
        stage('Deploy') {
            steps {
                script {
                    try {
                        // Remove old container if exists
                        sh 'docker rm -f devops-app || true'

                        // Run new container
                        sh 'docker run -d --name devops-app -p 3000:3000 $IMAGE_NAME'

                    } catch (err) {
                        echo "Deployment failed! Rolling back..."

                        // Rollback to previous stable image
                        sh '''
                        docker rm -f devops-app || true
                        docker run -d --name devops-app -p 3000:3000 riyaverma/devops-app:v1.0
                        '''

                        error("Deployment failed, rollback executed")
                    }
                }
            }
        }

        // Create Git tag for release version
        stage('Release') {
            steps {
                sh 'git tag v1.0 || true'
                sh 'git push origin v1.0 || true'
            }
        }

        // Basic monitoring using container status and logs
        stage('Monitoring') {
            steps {
                sh 'docker ps'
                sh 'docker logs devops-app || true'
            }
        }
    }

    // Email notifications after pipeline execution
    post {
        success {
            emailext (
                subject: "Jenkins Pipeline SUCCESS: ${env.JOB_NAME}",
                body: """
    Status: SUCCESS
    Build, scan, docker push & deploy completed

    All pipeline stages executed successfully:
    - Checkout
    - Build
    - Test
    - Code Quality
    - Security Scan
    - Deploy
    - Release
    - Monitoring
    """,
                to: "riyaverma5383@gmail.com"
            )
        }

        failure {
            emailext (
                subject: "FAILED: ${env.JOB_NAME}",
                body: "Pipeline failed ❌ Check Jenkins logs.",
                to: "riyaverma5383@gmail.com"
            )
        }
    }
}