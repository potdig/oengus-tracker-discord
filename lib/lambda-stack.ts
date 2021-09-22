import { SubnetType } from '@aws-cdk/aws-ec2'
import { Rule, Schedule } from '@aws-cdk/aws-events'
import { LambdaFunction } from '@aws-cdk/aws-events-targets'
import { Runtime } from '@aws-cdk/aws-lambda'
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs'
import { Stack, Construct, Duration } from '@aws-cdk/core'
import { DatabaseStackProps } from './database-stack'

export class LambdaStack extends Stack {
  constructor(scope: Construct, id: string, props: DatabaseStackProps) {
    super(scope, id, props)

    // Lambda 関数
    const func = new NodejsFunction(this, 'OengusTrackerFunction', {
      functionName: 'track',
      entry: 'lib/lambda/tracker.ts',
      handler: 'track',
      runtime: Runtime.NODEJS_14_X,
      timeout: Duration.seconds(60),
      memorySize: 256,
      bundling: {
        nodeModules: [
          'node-fetch'
        ]
      },
      vpc: props.vpc,
      vpcSubnets: {
        subnetType: SubnetType.PRIVATE_WITH_NAT
      },
      securityGroups: [ props.lambdaGroup ],
      environment: {
        REGION: this.region,
        PROXY_ENDPOINT: props.dbProxy.endpoint,
        // DB の認証情報は Lambda 側で取得する
        RDS_SECRET_NAME: props.dbSecret.secretName
      }
    })

    // Lambda から DB 認証情報へのアクセスを許可
    props.dbSecret.grantRead(func)

    // 定期実行のためのルールを作成してターゲットを追加
    const rule = new Rule(this, 'OengusTrackerCronRule', {
      // 21:00(JST:UTC+9) -> 12:00(UTC)
      schedule: Schedule.cron({
        hour: '12',
        minute: '0'
      })
    })
    rule.addTarget(new LambdaFunction(func))
  }
}