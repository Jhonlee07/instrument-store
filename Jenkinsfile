pipeline {
  agent any

  options {
    timestamps()
    timeout(time: 30, unit: 'MINUTES')
    disableConcurrentBuilds()
  }

  environment {
    TAG = "${env.BUILD_NUMBER}"            // consumed by docker-compose.yml image tags
    COMPOSE_PROJECT_NAME = 'instrument-store'
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Test') {
      steps {
        // Runs `npm test` inside the build; a failing test fails the build and stops the pipeline.
        sh 'docker build --target test -t store-backend-test:${BUILD_NUMBER} ./backend'
      }
    }

    stage('Build Images') {
      steps {
        sh 'docker compose build'          // images tagged store-*:${BUILD_NUMBER}
      }
    }

    stage('Deploy') {
      steps {
        sh 'docker compose up -d'
      }
    }

   stage('Smoke Test') {
    steps {
        // Hit the backend health endpoint directly from inside the compose network
        sh '''
            sleep 5
            for i in $(seq 1 30); do
                if docker compose exec -T backend wget -q -O /dev/null http://localhost:3000/api/health; then
                    echo "Smoke test passed: GET /api/health -> 200"
                    exit 0
                fi
                sleep 2
            done
            echo "Smoke test failed"
            docker compose logs --tail=50
            exit 1
        '''

        //test run for jenkins

        

      
    }
}
  }

  post {
    failure { echo 'Pipeline failed.' }
    success { echo "Build ${env.BUILD_NUMBER} deployed." }
  }
}
