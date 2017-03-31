# ⚡️ Serverless Plugin for SQS CloudWatch Alarms

[![npm](https://img.shields.io/npm/v/serverless-sqs-alarms-plugin.svg)](https://www.npmjs.com/package/serverless-sqs-alarms-plugin)
[![license](https://img.shields.io/github/license/sbstjn/serverless-sqs-alarms-plugin.svg)](https://github.com/sbstjn/serverless-sqs-alarms-plugin/blob/master/LICENSE.md)
[![Coveralls](https://img.shields.io/coveralls/sbstjn/serverless-sqs-alarms-plugin.svg)](https://coveralls.io/github/sbstjn/serverless-sqs-alarms-plugin)

## About the plugin

This serverless plugins wraps the configuration for CloudWatch alarms to monitor the messages in an SQS queue. You need to provide the SQS queue name and SNS topic which will receive the `Alarm` and `OK` messages. 

## Usage

Add the npm package to your project:

```bash
# Via yarn
$ yarn add serverless-sqs-alarms-plugin

# Via npm
$ npm instal serverless-sqs-alarms-plugin --save
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
      thresholds:
        - 1
        - 50
        - 100
        - 500
        - 1111
        - 2222
```

That's it!

## Contribution

Feel free to contribute to this project! Thanks 😘