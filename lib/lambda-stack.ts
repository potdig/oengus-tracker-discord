import { Rule, Schedule } from '@aws-cdk/aws-events'
import { LambdaFunction } from '@aws-cdk/aws-events-targets'
import { Code, Function, Runtime } from '@aws-cdk/aws-lambda'
import { Stack, Construct, StackProps } from '@aws-cdk/core'

export class LambdaStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    const func = new Function(this, 'OengusTrackerFunction', {
      runtime: Runtime.NODEJS_14_X,
      handler: 'tracker.track',
      code: Code.fromAsset('lib/lambda/')
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