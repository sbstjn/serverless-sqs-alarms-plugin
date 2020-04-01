'use strict'

const _ = require('lodash')
const util = require('util')

class Alarm {
  constructor (alarm, region) {
    this.queue = alarm.queue
    this.description = alarm.description
    this.topic = alarm.topic
    this.region = region
    this.thresholds = alarm.thresholds
    this.name = alarm.name
    this.treatMissingData = alarm.treatMissingData
  }

  formatAlarmName (value) {
    // Cloud Watch alarms must be alphanumeric only
    let queue = this.queue.replace(/[^0-9a-z]/gi, '')
    return util.format(queue + 'MessageAlarm%s', value)
  }

  resolveTreatMissingData (index) {
    if (this.treatMissingData.constructor === Array) {
      return this.validateTreatMissingData(this.treatMissingData[index])
    } else {
      return this.validateTreatMissingData(this.treatMissingData)
    }
  }

  validateTreatMissingData (treatment) {
    let validTreamtments = ['missing', 'ignore', 'breaching', 'notBreaching']
    if (validTreamtments.includes(treatment)) {
      return treatment
    }
  }

  resourceProperties (value) {
    if (value instanceof Object) {
      return value
    }

    return {
      value
    }
  }

  ressources () {
    return this.thresholds.map(
      (props, i) => {
        const properties = this.resourceProperties(props)
        const defaultDescription = util.format("Alarm if queue contains more than %s messages", properties.value )
        const description = this.description ? this.description : defaultDescription

        const config = {
          [this.formatAlarmName(properties.value)]: {
            Type: 'AWS::CloudWatch::Alarm',
            Properties: {
              AlarmDescription: description,
              Namespace: properties.namespace || 'AWS/SQS',
              MetricName: 'ApproximateNumberOfMessagesVisible',
              Dimensions: [
                {
                  Name: 'QueueName',
                  Value: this.queue
                }
              ],
              Statistic: 'Sum',
              Period: properties.period || 60,
              EvaluationPeriods: properties.evaluationPeriods || 1,
              Threshold: properties.value,
              ComparisonOperator: 'GreaterThanOrEqualToThreshold',
              AlarmActions: [
                { 'Fn::Join': [ '', [ 'arn:aws:sns:' + this.region + ':', { 'Ref': 'AWS::AccountId' }, ':' + this.topic ] ] }
              ],
              OKActions: [
                { 'Fn::Join': [ '', [ 'arn:aws:sns:' + this.region + ':', { 'Ref': 'AWS::AccountId' }, ':' + this.topic ] ] }
              ]
            }
          }
        }

        if (this.name) {
          config[this.formatAlarmName(properties.value)].Properties.AlarmName = util.format('%s-%s-%d', this.name, this.queue, properties.value)
        }

        if (this.treatMissingData) {
          let treatMissing = this.resolveTreatMissingData(i)
          if (treatMissing) {
            config[this.formatAlarmName(properties.value)].Properties.TreatMissingData = treatMissing
          }
        }
        return config
      }
    )
  }
}

class Plugin {
  constructor (serverless, options) {
    this.serverless = serverless
    this.hooks = {
      'package:compileEvents': this.beforeDeployResources.bind(this)
    }
  }

  beforeDeployResources () {
    if (!this.serverless.service.custom || !this.serverless.service.custom['sqs-alarms']) {
      return
    }

    const alarms = this.serverless.service.custom['sqs-alarms'].map(
      data => new Alarm(data, this.serverless.getProvider('aws').getRegion())
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
