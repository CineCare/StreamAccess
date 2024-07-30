pipeline {
    agent any

    tools {
        nodejs 'nodeJS'
    }

    options { buildDiscarder(logRotator(numToKeepStr: '5')) }

    environment {
        DOCKER_CREDENTIALS = credentials('codevertDocker')
        DOCKER_TAG = "${env.BRANCH_NAME == 'main' ? 'latest' : env.BRANCH_NAME}"
        ENV_ID = "${env.BRANCH_NAME == 'main' ? 'backend_env' : "backend_env_" + env.BRANCH_NAME}"
    }
    
    stages {
        stage('Clean') {
            steps {
                cleanWs()
                sh 'echo ${BRANCH_NAME}'
                sh 'echo ${DOCKER_TAG}'
                sh 'echo ${ENV_ID}'
                
            }
        }

        stage('pull sources') {
            steps {
                git branch: '${BRANCH_NAME}',
                credentialsId: 'github_ssh',
                url: 'git@github.com:CineCare/StreamAccess-Backend.git'
                script {
                    env.GIT_COMMIT_MSG = sh(script: 'git log -1 --pretty=%B ${GIT_COMMIT}', returnStdout: true).trim()
                }
            }
        }

        stage('install') {
            steps {
                echo 'performing install...'
                sh '''
                    npm install
                '''
            }
        }

        stage('build & push docker image') {
            when {
                expression { env.BRANCH_NAME == 'main' || env.BRANCH_NAME == 'dev'}
            }
            steps {
                sh '''
                    echo $DOCKER_CREDENTIALS_PSW | docker login -u $DOCKER_CREDENTIALS_USR --password-stdin
                    docker build -t "localhost:5000/streamaccess:backend_${env.BRANCH_NAME}" .
                    docker push localhost:5000/streamaccess:backend
                '''
            }
        }

        stage('Update stack portainer') {
            when {
                expression { env.BRANCH_NAME == 'main' || env.BRANCH_NAME == 'dev'}
            }
            steps {
                //stop and restart portainer stack via api
                withCredentials([string(credentialsId: 'portainer_token', variable: 'TOKEN')]) { //set SECRET with the credential content
                    sh '''
                        curl -X POST -H "X-API-Key: ${TOKEN}" https://portainer.codevert.org/api/stacks/7/stop?endpointId=2 &&
                        curl -X POST -H "X-API-Key: ${TOKEN}" https://portainer.codevert.org/api/stacks/7/start?endpointId=2
                    '''
                }
            }
        }

        // stage('lint') {
        //     steps {
        //         sh '''
        //             npm run ci_eslint
        //             ls
        //         '''
        //     }
        //     post {
        //         always {
        //             recordIssues aggregatingResults: true, enabledForFailure: true, failOnError: true, ignoreQualityGate: false, skipPublishingChecks: true, sourceDirectories: [[path: 'src']], tools: [checkStyle(pattern: 'eslint.xml')]
        //         }
        //     }
        // }

        // stage('build & push docker image') {
        //     when {
        //         expression { env.BRANCH_NAME == 'main' || env.BRANCH_NAME == 'dev'}
        //     }
        //     steps {
        //         //copy .env file from jenkins credentials to current workspace
        //         withCredentials([file(credentialsId: "${ENV_ID}", variable: 'envFile')]){
        //             sh 'cp $envFile $WORKSPACE'
        //         }
        //         //connect to docker hub, build image and push to registry
        //         sh '''
        //             echo $DOCKER_CREDENTIALS_PSW | docker login -u $DOCKER_CREDENTIALS_USR --password-stdin
        //             docker build -t "whitedog44/cinehub:backend_${DOCKER_TAG}" .

        //             docker push whitedog44/cinehub:backend_${DOCKER_TAG}
        //         '''
        //     }
        // }
        
    }

    post {
        failure {
            sh 'echo ${GIT_COMMIT_MSG}'
            discordSend description: "Jenkins Pipeline Build for StreamAccess-Backend ${BRANCH_NAME} failed ! ☹️\n\ngit commit message :\n${GIT_COMMIT_MSG}",
            footer: "Better luck next try ?",
            link: "$BUILD_URL",
            result: currentBuild.currentResult,
            title: JOB_NAME,
            webhookURL: "https://discord.com/api/webhooks/1208855718338363572/hPxGKwxnigUMvt0ZaPSsAiU1p8Udkdpg4Yo79UCIfo_lxm7Phbe-JLYdTV-22GFCXvYU"
        }
        fixed {
            discordSend description: "Jenkins Pipeline Build for StreamAccess-Backend ${BRANCH_NAME} succeed ! 😎\n\ngit commit message :\n${GIT_COMMIT_MSG}",
            footer: "Good job !",
            link: "$BUILD_URL",
            result: currentBuild.currentResult,
            title: JOB_NAME, webhookURL: "https://discord.com/api/webhooks/1208855718338363572/hPxGKwxnigUMvt0ZaPSsAiU1p8Udkdpg4Yo79UCIfo_lxm7Phbe-JLYdTV-22GFCXvYU"
        }
    }
}
