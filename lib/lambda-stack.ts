import { Rule, Schedule } from '@aws-cdk/aws-events'
import { LambdaFunction } from '@aws-cdk/aws-events-targets'
import { Runtime } from '@aws-cdk/aws-lambda'
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs'
import { Stack, Construct, StackProps, Duration } from '@aws-cdk/core'

export class LambdaStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    const func = new NodejsFunction(this, 'OengusTrackerFunction', {
      functionName: 'track',
      entry: 'lib/lambda/tracker.ts',
      handler: 'track',
      runtime: Runtime.NODEJS_14_X,
      timeout: Duration.seconds(60),
      bundling: {
        nodeModules: [
          'node-fetch'
        ]
      }
    })

    const rule = new Rule(this, 'OengusTrackerCronRule', {
      schedule: Schedule.cron({
        hour: '21',
        minute: '0'
      })
    })

    rule.addTarget(new LambdaFunction(func))
  }
}