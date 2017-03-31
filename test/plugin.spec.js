'use strict'

const Plugin = require('../')

it('creates CloudFormation configuration', () => {
  let config = {
    service: {
      custom: {
        'sqs-alarms': [
          { queue: 'test-queue',
            topic: 'test-topic',
            thresholds: [1, 2, 3]
          }
        ]
      },
      provider: {
        region: 'test-region',
        compiledCloudFormationTemplate: {
          Resources: {}
        }
      }
    }
  }

  const test = new Plugin(config);
  test.beforeDeployResources()

  const data = config.service.provider.compiledCloudFormationTemplate.Resources

  expect(data).toHaveProperty('MessageAlarm3')
  expect(data).toHaveProperty('MessageAlarm3.Type', 'AWS::CloudWatch::Alarm')
  expect(data).toHaveProperty('MessageAlarm3.Properties')
  expect(data).toHaveProperty('MessageAlarm3.Properties.AlarmDescription', 'Alarm if queue contains more than 3 messages')
  expect(data).toHaveProperty('MessageAlarm3.Properties.Threshold', 3)
})