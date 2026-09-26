// Jenkinsfile -- CI/CD Pipeline (Docker)
// Playwright TypeScript Framework
// Author: Rajaram Manoharan

pipeline {
    agent any

    tools {
        nodejs 'NodeJS-22'
    }

    parameters {
        choice(
            name: 'ENVIRONMENT',
            choices: ['dev', 'qa', 'stage', 'prod'],
            description: 'Run up to environment'
        )
    }

    environment {
        DOCKER_IMAGE = 'pw-scaffold'
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '20'))
        disableConcurrentBuilds()
    }

    stages {

        stage('Lint & Typecheck') {
            steps {
                sh 'npm ci'
                sh 'npx tsc --noEmit'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${DOCKER_IMAGE} ."
                sh "docker images | grep ${DOCKER_IMAGE}"
            }
        }

        stage('Deploy to Dev') {
            steps {
                echo 'Deployed to Dev'
            }
        }

        stage('Dev - Smoke Tests') {
            steps {
                sh 'mkdir -p reports-dev/html allure-results-dev'
                withCredentials([
                    usernamePassword(credentialsId: 'app-dev-credentials',
                        usernameVariable: 'APP_USERNAME', passwordVariable: 'APP_PASSWORD'),
                    string(credentialsId: 'app-dev-url', variable: 'APP_URL')
                ]) {
                    sh """
                        docker run --rm \
                            -e CI=true \
                            -e ENVIRONMENT=dev \
                            -e APP_URL=${APP_URL} \
                            -e APP_USERNAME=${APP_USERNAME} \
                            -e APP_PASSWORD=${APP_PASSWORD} \
                            -v \${WORKSPACE}/reports-dev/html:/app/playwright-report \
                            -v \${WORKSPACE}/allure-results-dev:/app/allure-results \
                            ${DOCKER_IMAGE} \
                            npx playwright test --project=chromium --grep @smoke
                    """
                }
            }
            post {
                always {
                    sh 'mkdir -p reports-dev/allure'
                    sh 'npx allure generate allure-results-dev --clean -o reports-dev/allure || true'
                    publishHTML(target: [
                        reportName: 'Dev Smoke - Playwright Report',
                        reportDir: 'reports-dev/html',
                        reportFiles: 'index.html',
                        keepAll: true,
                        alwaysLinkToLastBuild: true
                    ])
                    publishHTML(target: [
                        reportName: 'Dev Smoke - Allure Report',
                        reportDir: 'reports-dev/allure',
                        reportFiles: 'index.html',
                        keepAll: true,
                        alwaysLinkToLastBuild: true
                    ])
                }
            }
        }

        stage('Deploy to QA') {
            when { expression { params.ENVIRONMENT in ['qa', 'stage', 'prod'] } }
            steps {
                echo 'Deployed to QA'
            }
        }

        stage('QA - Full Test Suite') {
            when { expression { params.ENVIRONMENT in ['qa', 'stage', 'prod'] } }
            steps {
                sh 'mkdir -p reports-qa/html allure-results-qa'
                withCredentials([
                    usernamePassword(credentialsId: 'app-qa-credentials',
                        usernameVariable: 'APP_USERNAME', passwordVariable: 'APP_PASSWORD'),
                    string(credentialsId: 'app-qa-url', variable: 'APP_URL')
                ]) {
                    sh """
                        docker run --rm \
                            -e CI=true \
                            -e ENVIRONMENT=qa \
                            -e APP_URL=${APP_URL} \
                            -e APP_USERNAME=${APP_USERNAME} \
                            -e APP_PASSWORD=${APP_PASSWORD} \
                            -v \${WORKSPACE}/reports-qa/html:/app/playwright-report \
                            -v \${WORKSPACE}/allure-results-qa:/app/allure-results \
                            ${DOCKER_IMAGE} \
                            npx playwright test --project=chromium
                    """
                }
            }
            post {
                always {
                    sh 'mkdir -p reports-qa/allure'
                    sh 'npx allure generate allure-results-qa --clean -o reports-qa/allure || true'
                    publishHTML(target: [
                        reportName: 'QA Full Suite - Playwright Report',
                        reportDir: 'reports-qa/html',
                        reportFiles: 'index.html',
                        keepAll: true,
                        alwaysLinkToLastBuild: true
                    ])
                    publishHTML(target: [
                        reportName: 'QA Full Suite - Allure Report',
                        reportDir: 'reports-qa/allure',
                        reportFiles: 'index.html',
                        keepAll: true,
                        alwaysLinkToLastBuild: true
                    ])
                }
            }
        }

        stage('Deploy to Stage') {
            when { expression { params.ENVIRONMENT in ['stage', 'prod'] } }
            steps {
                echo 'Deployed to Stage'
            }
        }

        stage('Stage - Smoke Tests') {
            when { expression { params.ENVIRONMENT in ['stage', 'prod'] } }
            steps {
                sh 'mkdir -p reports-stage/html allure-results-stage'
                withCredentials([
                    usernamePassword(credentialsId: 'app-stage-credentials',
                        usernameVariable: 'APP_USERNAME', passwordVariable: 'APP_PASSWORD'),
                    string(credentialsId: 'app-stage-url', variable: 'APP_URL')
                ]) {
                    sh """
                        docker run --rm \
                            -e CI=true \
                            -e ENVIRONMENT=stage \
                            -e APP_URL=${APP_URL} \
                            -e APP_USERNAME=${APP_USERNAME} \
                            -e APP_PASSWORD=${APP_PASSWORD} \
                            -v \${WORKSPACE}/reports-stage/html:/app/playwright-report \
                            -v \${WORKSPACE}/allure-results-stage:/app/allure-results \
                            ${DOCKER_IMAGE} \
                            npx playwright test --project=chromium --grep @smoke
                    """
                }
            }
            post {
                always {
                    sh 'mkdir -p reports-stage/allure'
                    sh 'npx allure generate allure-results-stage --clean -o reports-stage/allure || true'
                    publishHTML(target: [
                        reportName: 'Stage Smoke - Playwright Report',
                        reportDir: 'reports-stage/html',
                        reportFiles: 'index.html',
                        keepAll: true,
                        alwaysLinkToLastBuild: true
                    ])
                    publishHTML(target: [
                        reportName: 'Stage Smoke - Allure Report',
                        reportDir: 'reports-stage/allure',
                        reportFiles: 'index.html',
                        keepAll: true,
                        alwaysLinkToLastBuild: true
                    ])
                }
            }
        }

        stage('Approval for Prod') {
            when { expression { params.ENVIRONMENT == 'prod' } }
            steps {
                input message: 'Deploy to Prod?', ok: 'Yes, Deploy!'
            }
        }

        stage('Deploy to Prod') {
            when { expression { params.ENVIRONMENT == 'prod' } }
            steps {
                echo 'Deployed to Prod'
            }
        }

        stage('Prod - Smoke Tests') {
            when { expression { params.ENVIRONMENT == 'prod' } }
            steps {
                sh 'mkdir -p reports-prod/html allure-results-prod'
                withCredentials([
                    usernamePassword(credentialsId: 'app-prod-credentials',
                        usernameVariable: 'APP_USERNAME', passwordVariable: 'APP_PASSWORD'),
                    string(credentialsId: 'app-prod-url', variable: 'APP_URL')
                ]) {
                    sh """
                        docker run --rm \
                            -e CI=true \
                            -e ENVIRONMENT=prod \
                            -e APP_URL=${APP_URL} \
                            -e APP_USERNAME=${APP_USERNAME} \
                            -e APP_PASSWORD=${APP_PASSWORD} \
                            -v \${WORKSPACE}/reports-prod/html:/app/playwright-report \
                            -v \${WORKSPACE}/allure-results-prod:/app/allure-results \
                            ${DOCKER_IMAGE} \
                            npx playwright test --project=chromium --grep @smoke
                    """
                }
            }
            post {
                always {
                    sh 'mkdir -p reports-prod/allure'
                    sh 'npx allure generate allure-results-prod --clean -o reports-prod/allure || true'
                    publishHTML(target: [
                        reportName: 'Prod Smoke - Playwright Report',
                        reportDir: 'reports-prod/html',
                        reportFiles: 'index.html',
                        keepAll: true,
                        alwaysLinkToLastBuild: true
                    ])
                    publishHTML(target: [
                        reportName: 'Prod Smoke - Allure Report',
                        reportDir: 'reports-prod/allure',
                        reportFiles: 'index.html',
                        keepAll: true,
                        alwaysLinkToLastBuild: true
                    ])
                }
            }
        }
    }

    post {
        always {
            sh "docker rmi ${DOCKER_IMAGE} || true"
        }
        success {
            echo 'PIPELINE: SUCCESS'
        }
        failure {
            echo 'PIPELINE: FAILED'
        }
    }
}
