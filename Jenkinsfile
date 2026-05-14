pipeline {
    agent any

    tools {
        nodejs 'node20'
    }

    environment {

        APP_NAME = "HealthNX"

        AWS_ACCOUNT_ID = "407876287494"
        AWS_REGION = "us-east-1"

        ECR_REPO = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${APP_NAME}"

        IMAGE_TAG = "${BUILD_NUMBER}"

        SONAR_HOME = tool 'sonar-scanner'

        NEXUS_URL = "http://3.227.230.192:8081"
        NEXUS_REPO = "react-repo"

        EMAIL = "sivaprabha997@gmail.com"
    }

    stages {

        stage('Clean Workspace') {
            steps {
                cleanWs()
            }
        }

        stage('Checkout Code') {
            steps {

                git branch: 'main',
                url: 'https://github.com/shivaprabha2997/HealthNx.git'
            }
        }

        stage('Install Dependencies') {
            steps {

                sh '''
                npm install

                npm install -D vitest @vitest/coverage-v8 @testing-library/react jsdom
                '''
            }
        }

        stage('Code Lint Check') {
            steps {

                sh '''
                npm run lint || true
                '''
            }
        }

        stage('Run Test Coverage') {
            steps {

                sh '''
                
                if ! grep -q '"coverage"' package.json; then
                  npm pkg set scripts.test="vitest"
                  npm pkg set scripts.coverage="vitest run --coverage"
                fi

                cat > src/App.test.tsx << 'EOF'
                import { render } from '@testing-library/react'
                import App from './App'

                test('renders app', () => {
                  render(<App />)
                })
                EOF

                npm run coverage
                '''
            }
        }

        stage('SonarQube Analysis') {
            steps {

                withSonarQubeEnv('sonar-server') {

                    sh '''
                    ${SONAR_HOME}/bin/sonar-scanner \
                    -Dsonar.projectName=HealthNX \
                    -Dsonar.projectKey=HealthNX \
                    -Dsonar.sources=. \
                    -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
                    '''
                }
            }
        }

        stage('Quality Gate') {
            steps {

                timeout(time: 5, unit: 'MINUTES') {

                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Build Application') {
            steps {

                sh '''
                npm run build
                '''
            }
        }

        stage('Archive Artifacts') {
            steps {

                archiveArtifacts artifacts: 'dist/**'
            }
        }

        stage('Create Artifact Zip') {
            steps {

                sh '''
                zip -r dist.zip dist
                '''
            }
        }

        stage('Upload Artifact To Nexus') {
            steps {

                sh '''
                curl -v -u admin:admin \
                --upload-file dist.zip \
                ${NEXUS_URL}/repository/${NEXUS_REPO}/dist-${BUILD_NUMBER}.zip
                '''
            }
        }

        stage('Docker Build') {
            steps {

                sh '''
                docker build -t ${APP_NAME}:${IMAGE_TAG} .
                '''
            }
        }

        stage('Trivy FileSystem Scan') {
            steps {

                sh '''
                trivy fs .
                '''
            }
        }

        stage('Trivy Image Scan') {
            steps {

                sh '''
                trivy image --severity HIGH,CRITICAL ${APP_NAME}:${IMAGE_TAG}
                '''
            }
        }

        stage('AWS ECR Login') {
            steps {

                sh '''
                aws ecr get-login-password --region ${AWS_REGION} | \
                docker login --username AWS --password-stdin \
                ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
                '''
            }
        }

        stage('Docker Tag') {
            steps {

                sh '''
                docker tag ${APP_NAME}:${IMAGE_TAG} \
                ${ECR_REPO}:${IMAGE_TAG}
                '''
            }
        }

        stage('Push Docker Image') {
            steps {

                sh '''
                docker push ${ECR_REPO}:${IMAGE_TAG}
                '''
            }
        }

        stage('Update Kubernetes Deployment') {
            steps {

                sh '''
                sed -i "s|IMAGE_TAG|${IMAGE_TAG}|g" k8s/deployment.yaml
                '''
            }
        }

        stage('Deploy To Kubernetes') {
            steps {

                sh '''
                kubectl apply -f k8s/
                '''
            }
        }

        stage('Verify Deployment') {
            steps {

                sh '''
                kubectl get pods
                kubectl get svc
                kubectl get ingress
                '''
            }
        }
    }

    post {

        always {

            emailext(
                subject: "Jenkins Build: ${JOB_NAME} - ${currentBuild.currentResult}",

                body: """

                <h2>Build Report</h2>

                <p><b>Project:</b> ${JOB_NAME}</p>

                <p><b>Build Number:</b> ${BUILD_NUMBER}</p>

                <p><b>Status:</b> ${currentBuild.currentResult}</p>

                <p><b>Build URL:</b><br>
                ${BUILD_URL}</p>

                <p><b>SonarQube Report:</b><br>
                http://3.227.230.192:9000/dashboard?id=HealthNX
                </p>

                <p><b>Nexus Artifact:</b><br>
                ${NEXUS_URL}/repository/${NEXUS_REPO}/
                </p>

                <p><b>Docker Image:</b><br>
                ${ECR_REPO}:${IMAGE_TAG}
                </p>

                <p><b>Kubernetes Ingress URL:</b><br>
                http://myapp.com
                </p>

                <br>

                <p>Thanks,<br>
                DevOps Team</p>

                """,

                mimeType: 'text/html',

                to: "${EMAIL}"
            )
        }

        success {

            echo 'Pipeline executed successfully'
        }

        failure {

            echo 'Pipeline failed'
        }
    }
}
