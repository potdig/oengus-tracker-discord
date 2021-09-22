import { Port, SecurityGroup, SubnetType, Vpc } from '@aws-cdk/aws-ec2'
import { Construct, Stack, StackProps } from '@aws-cdk/core'

export class VPCStack extends Stack {
  public readonly props: VPCStackProps

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    // VPC
    const vpc = new Vpc(this, 'OengusTrackerVpc', {
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [
        {
          name: 'public',
          subnetType: SubnetType.PUBLIC,
          cidrMask: 24
        },
        {
          name: 'private',
          subnetType: SubnetType.PRIVATE_ISOLATED,
          cidrMask: 24
        }
      ]
    })

    // Bastion -> DB
    const bastionGroup = new SecurityGroup(
      this,
      'OengusTrackerConnectionFromBastionToDB',
      { vpc }
    )

    // TODO: Lambda -> RDS Proxy

    // RDS Proxy -> DB
    const dbProxyGroup = new SecurityGroup(
      this,
      'OengusTrackerConnectionFromProxyToDB',
      { vpc }
    )

    // dbProxyGroup から TCP ポート 3306 経由のインバウンドを許可
    dbProxyGroup.addIngressRule(
      dbProxyGroup,
      Port.tcp(5432),
      'allow DB connection'
    )

    // bastionGroup から TCP ポート 3306 経由のインバウンドを許可
    dbProxyGroup.addIngressRule(
      bastionGroup,
      Port.tcp(5432),
      'allow Bastion connection'
    )

    this.props = {
      vpc, bastionGroup, dbProxyGroup
    }
  }
}

export interface VPCStackProps extends StackProps {
  vpc: Vpc,
  bastionGroup: SecurityGroup,
  dbProxyGroup: SecurityGroup
}