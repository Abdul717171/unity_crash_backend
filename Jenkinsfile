pipeline {
  agent any
  stages {
    stage('Upload Build') {
          steps {
            sshPublisher(publishers: [sshPublisherDesc(configName: 'winit', transfers: [sshTransfer(cleanRemote: false, excludes: '', execCommand: '''rm /home/ubuntu/package.json
cd /home/ubuntu/crash-backend && git add .
cd /home/ubuntu/crash-backend && git commit -m "update"
cd /home/ubuntu/crash-backend && git pull origin main
cd /home/ubuntu/crash-backend && npm install
pm2 delete crash-server
cd /home/ubuntu/crash-backend && pm2 start ecosystem.config.json''', execTimeout: 120000, flatten: false, makeEmptyDirs: false, noDefaultExcludes: false, patternSeparator: '[, ]+', remoteDirectory: '/', remoteDirectorySDF: false, removePrefix: '', sourceFiles: 'package.json')], usePromotionTimestamp: false, useWorkspaceInPromotion: false, verbose: true)])
            }
        }
  }
}
