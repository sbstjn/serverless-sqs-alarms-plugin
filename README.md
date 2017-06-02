# ⚡️ Serverless Plugin for SQS CloudWatch Alarms

[![npm](https://img.shields.io/npm/v/serverless-sqs-alarms-plugin.svg)](https://www.npmjs.com/package/serverless-sqs-alarms-plugin)
[![CircleCI](https://img.shields.io/circleci/project/github/sbstjn/serverless-sqs-alarms-plugin.svg)](https://circleci.com/gh/sbstjn/serverless-sqs-alarms-plugin)
[![license](https://img.shields.io/github/license/sbstjn/serverless-sqs-alarms-plugin.svg)](https://github.com/sbstjn/serverless-sqs-alarms-plugin/blob/master/LICENSE.md)
[![Coveralls](https://img.shields.io/coveralls/sbstjn/serverless-sqs-alarms-plugin.svg)](https://coveralls.io/github/sbstjn/serverless-sqs-alarms-plugin)

## About the plugin

This serverless plugin is a wrapper to configure CloudWatch Alarms to monitor the visible messages in an SQS queue. You need to provide the SQS *queue name* and SNS *topic* which will receive the `Alarm` and `OK` messages.

## Usage

Add the npm package to your project:

```bash
# Via yarn
$ yarn add serverless-sqs-alarms-plugin

# Via npm
$ npm install serverless-sqs-alarms-plugin --save
```

Add the plugin to your `serverless.yml`:

```yaml
plugins:
  - serverless-sqs-alarms-plugin
```

Configure alarms in `serverless.yml`:

```yaml
custom:
  sqs-alarms:
    - queue: your-sqs-queue-name
      topic: your-sns-topic-name
      name: your-alarm-name # optional parameter
      thresholds:
        - 1
        - 50
        - 100
        - 500
```

That's it! With this example your SNS topic will receive a message when there are more than 1, 50, 100, and 500 visible in SQS.

## CloudWatch Alarms

The created CloudWatch Alarms look like this:

```json
{
  "Type": "AWS::CloudWatch::Alarm",
  "Properties": {
    "AlarmDescription": "Alarm if queue contains more than 100 messages",
    "Namespace": "AWS/SQS",
    "MetricName": "ApproximateNumberOfMessagesVisible",
    "Dimensions": [
      {
        "Name": "QueueName",
        "Value": "your-sqs-queue-name"
      }
    ],
    "Statistic": "Sum",
    "Period": 60,
    "EvaluationPeriods": 1,
    "Threshold": 100,
    "ComparisonOperator": "GreaterThanOrEqualToThreshold",
    "AlarmActions": [
      { "Fn::Join": [ "", [ "arn:aws:sns:eu-west-1:", { "Ref": "AWS::AccountId" }, ":your-sns-topic-name" ] ] }
    ],
    "OKActions": [
      { "Fn::Join": [ "", [ "arn:aws:sns:eu-west-1:", { "Ref": "AWS::AccountId" }, ":your-sns-topic-name" ] ] }
    ]
  }
}
```

## License

Feel free to use the code, it's released using the [MIT license](https://github.com/sbstjn/serverless-sqs-alarms-plugin/blob/master/LICENSE.md).

## Contribution

Feel free to contribute to this project! Thanks 😘
