import {
  BastionHostLinux,
  InstanceClass,
  InstanceSize,
  InstanceType,
  SubnetType
} from '@aws-cdk/aws-ec2'
import {
  Credentials,
  DatabaseInstance,
  DatabaseInstanceEngine,
  ParameterGroup,
  PostgresEngineVersion
} from '@aws-cdk/aws-rds'
import { Secret } from '@aws-cdk/aws-secretsmanager'
import { Construct, RemovalPolicy, Stack } from '@aws-cdk/core'
import { VPCStackProps } from './vpc-stack'

export class RDSStack extends Stack {
  constructor(scope: Construct, id: string, props: VPCStackProps) {
    super(scope, id, props)

    const t2Micro = InstanceType.of(InstanceClass.T2, InstanceSize.MICRO)

    // 踏み台の Bastion
    const operation = new BastionHostLinux(
      this,
      'OengusTrackerBastionForDBOperation',
      {
        vpc: props.vpc,
        instanceType: t2Micro,
        securityGroup: props.bastionGroup,
        subnetSelection: {
          subnetType: SubnetType.PUBLIC
        }
      }
    )

    // psql を使えるようにしとく
    operation.instance.addUserData('yum -y update', 'yum install -y postgresql')

    // DB 認証情報
    const databaseCredentialSecret = new Secret(this, 'OengusTrackerDBSecret', {
      secretName: `${id}-rds-credentials`,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username: 'trackeradmin'
        }),
        includeSpace: false,
        generateStringKey: 'password'
      }
    })
    databaseCredentialSecret.grantRead(operation)

    // PostgreSQL の RDS
    const db = new DatabaseInstance(this, 'OengusTrackerDB', {
      engine: DatabaseInstanceEngine.postgres({
        version: PostgresEngineVersion.VER_12_7
      }),
      credentials: Credentials.fromSecret(databaseCredentialSecret),
      instanceType: t2Micro,
      vpc: props.vpc,
      vpcSubnets: {
        subnetType: SubnetType.PRIVATE_ISOLATED
      },
      securityGroups: [props.dbProxyGroup],
      removalPolicy: RemovalPolicy.DESTROY,
      parameterGroup: new ParameterGroup(
        this,
        'OengusTrackerDBParameterGroup',
        {
          engine: DatabaseInstanceEngine.postgres({
            version: PostgresEngineVersion.VER_12_7
          })
        }
      )
    })

    // TODO: Lambda から使う Secrets Manager へのエンドポイント

    // TODO: RDS Proxy
  }
}
