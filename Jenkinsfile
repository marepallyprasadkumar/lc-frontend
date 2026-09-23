pipeline {
    agent any

    environment {
        CI = 'true'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
    }

    stages {
        stage('Checkout Source Code') {
            steps {
                checkout scm
            }
        }

        stage('Inspect File Structure') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'find . -maxdepth 3 -not -path "*/node_modules/*" -not -path "*/.git/*"'
                    } else {
                        bat 'dir /s /b /a-d'
                    }
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'npm install'
                    } else {
                        bat 'npm install'
                    }
                }
            }
        }

        stage('Build Application') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'npm run build'
                    } else {
                        bat 'npm run build'
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'Build succeeded! Commit changes and file structure recorded.'
        }
        failure {
            echo 'Build failed! Please check logs.'
        }
    }
}
