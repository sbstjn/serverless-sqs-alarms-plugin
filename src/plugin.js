'use strict'

const _ = require('lodash')
const util = require('util')

class Alarm {
  constructor (alarm, region) {
    this.queue = alarm.queue
    this.topic = alarm.topic
    this.region = region
    this.thresholds = alarm.thresholds
  }

  ressources () {
    return this.thresholds.map(
      value => ({
        [util.format('MessageAlarm%s', value)]: {
          Type: 'AWS::CloudWatch::Alarm',
          Properties: {
            AlarmDescription: util.format('Alarm if queue contains more than %s messages', value),
            Namespace: 'AWS/SQS',
            MetricName: 'ApproximateNumberOfMessagesVisible',
            Dimensions: [
              {
                Name: 'QueueName',
                Value: this.queue
              }
            ],
            Statistic: 'Sum',
            Period: 60,
            EvaluationPeriods: 1,
            Threshold: value,
            ComparisonOperator: 'GreaterThanOrEqualToThreshold',
            AlarmActions: [
              { 'Fn::Join': [ '', [ 'arn:aws:sns:' + this.region + ':', { 'Ref': 'AWS::AccountId' }, ':' + this.topic ] ] }
            ],
            OKActions: [
              { 'Fn::Join': [ '', [ 'arn:aws:sns:' + this.region + ':', { 'Ref': 'AWS::AccountId' }, ':' + this.topic ] ] }
            ]
          }
        }
      })
    )
  }
}

class Plugin {
  constructor (serverless, options) {
    this.serverless = serverless
    this.hooks = {
      'deploy:compileEvents': this.beforeDeployResources.bind(this)
    }
  }

  beforeDeployResources () {
    const alarms = this.serverless.service.custom['sqs-alarms'].map(
      data => new Alarm(data, this.serverless.service.provider.region)
    )

    alarms.forEach(
      alarm => alarm.ressources().forEach(
        ressource => {
          _.merge(
            this.serverless.service.provider.compiledCloudFormationTemplate.Resources,
            ressource
          )
        }
      )
    )
  }
}

module.exports = Plugin
