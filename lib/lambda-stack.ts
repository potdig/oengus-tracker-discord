import { Code, Function, Runtime } from '@aws-cdk/aws-lambda'
import { Stack, Construct, StackProps } from '@aws-cdk/core'
export class LambdaStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    const func = new Function(this, 'OengusTrackerFunction', {
      runtime: Runtime.NODEJS_14_X,
      handler: 'track',
      code: Code.fromAsset('lib/lambda/'),
    })
  }
}