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

  expect(data).toHaveProperty('testqueueMessageAlarm3')
  expect(data).toHaveProperty('testqueueMessageAlarm3.Type', 'AWS::CloudWatch::Alarm')
  expect(data).toHaveProperty('testqueueMessageAlarm3.Properties')
  expect(data).toHaveProperty('testqueueMessageAlarm3.Properties.AlarmDescription', 'Alarm if queue contains more than 3 messages')
  expect(data).toHaveProperty('testqueueMessageAlarm3.Properties.Threshold', 3)
})

describe('alarm name', () => {
  let config

  beforeEach(() => {
    config = {
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
  });

  describe('is given', () => {
    it('adds alarm name to CloudFormation configuration', () => {

      config.service.custom['sqs-alarms'][0].alarmName = 'alarm'

      const test = new Plugin(config);
      test.beforeDeployResources()

      const data = config.service.provider.compiledCloudFormationTemplate.Resources

      expect(data).toHaveProperty('testqueueMessageAlarm3.Properties.AlarmName', 'test-queue-alarm-3')
    })
  })

  describe('is not given', () => {
    it('adds no alarm name to CloudFormation configuration', () => {
      const test = new Plugin(config);
      test.beforeDeployResources()

      const data = config.service.provider.compiledCloudFormationTemplate.Resources

      expect(data).not.toHaveProperty('testqueueMessageAlarm3.Properties.AlarmName')
    })
  })
})

it('creates alarms for multiple queues', () => {
    let config = {
        service: {
            custom: {
                'sqs-alarms': [
                    {
                        queue: 'test-queue',
                        topic: 'test-topic',
                        thresholds: [1,2]
                    },
                    {
                      queue: 'test-queue-2',
                      topic: 'test-topic',
                      thresholds: [1, 2]
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

    expect(data).toHaveProperty('testqueueMessageAlarm1')
    expect(data).toHaveProperty('testqueueMessageAlarm2')
    expect(data).toHaveProperty('testqueue2MessageAlarm1')
    expect(data).toHaveProperty('testqueue2MessageAlarm2')
})

it('does not fail without configuration', () => {
  let config = {
    service: {
      custom: { },
      provider: {
        compiledCloudFormationTemplate: {
          Resources: {}
        }
      }
    }
  }

  const test = new Plugin(config);
  test.beforeDeployResources()

  const data = config.service.provider.compiledCloudFormationTemplate.Resources

  expect(data).not.toHaveProperty('testqueueMessageAlarm3')
})
