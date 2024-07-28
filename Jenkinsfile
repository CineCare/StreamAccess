pipeline {
    agent any

    tools {
        nodejs 'nodeJS'
    }

    options { buildDiscarder(logRotator(numToKeepStr: '5')) }

    environment {
        DOCKER_CREDENTIALS = credentials('github_ssh')
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
                url: 'git@github.com:CineCare/CineHub-backend.git'
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

        // stage('Update stack portainer') {
        //     when {
        //         expression { env.BRANCH_NAME == 'main' || env.BRANCH_NAME == 'dev'}
        //     }
        //     steps {
        //         //stop and restart portainer stack via api
        //         withCredentials([string(credentialsId: 'portainer_token', variable: 'TOKEN')]) { //set SECRET with the credential content
        //             sh '''
        //                 curl -X POST -H "X-API-Key: ${TOKEN}" https://portainer.codevert.org/api/stacks/4/stop?endpointId=2 &&
        //                 curl -X POST -H "X-API-Key: ${TOKEN}" https://portainer.codevert.org/api/stacks/4/start?endpointId=2
        //             '''
        //         }
        //     }
        // }
    }
}
