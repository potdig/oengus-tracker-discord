import {
  BastionHostLinux,
  InstanceClass,
  InstanceSize,
  InstanceType,
  InterfaceVpcEndpoint,
  InterfaceVpcEndpointAwsService,
  Port,
  SecurityGroup,
  SubnetType,
  Vpc
} from '@aws-cdk/aws-ec2'
import {
  Credentials,
  DatabaseInstance,
  DatabaseInstanceEngine,
  DatabaseProxy,
  ParameterGroup,
  PostgresEngineVersion
} from '@aws-cdk/aws-rds'
import { Secret } from '@aws-cdk/aws-secretsmanager'
import { Construct, RemovalPolicy, Stack, StackProps } from '@aws-cdk/core'

export class DatabaseStack extends Stack {
  public readonly props: DatabaseStackProps

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    // VPC
    const vpc = new Vpc(this, 'OengusTrackerVpc', {
      maxAzs: 2,
      natGateways: 2,
      subnetConfiguration: [
        {
          name: 'public',
          subnetType: SubnetType.PUBLIC,
          cidrMask: 24
        },
        {
          name: 'privateWithNAT',
          subnetType: SubnetType.PRIVATE_WITH_NAT,
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
    const lambdaGroup = new SecurityGroup(
      this,
      'OengusTrackerConnectionFromLambdaToProxy',
      { vpc }
    )

    // RDS Proxy -> DB
    const dbProxyGroup = new SecurityGroup(
      this,
      'OengusTrackerConnectionFromProxyToDB',
      { vpc }
    )

    // dbProxyGroup から TCP ポート 5432 経由のインバウンドを許可
    dbProxyGroup.addIngressRule(
      dbProxyGroup,
      Port.tcp(5432),
      'allow DB connection'
    )

    // bastionGroup から TCP ポート 5432 経由のインバウンドを許可
    dbProxyGroup.addIngressRule(
      bastionGroup,
      Port.tcp(5432),
      'allow Bastion connection'
    )

    // lambdaGroup から TCP ポート 5432 経由のインバウンドを許可
    dbProxyGroup.addIngressRule(
      lambdaGroup,
      Port.tcp(5432),
      'allow Lambda connection'
    )

    // Lambda から Secrets Manager を使えるようにエンドポイントを用意する
    new InterfaceVpcEndpoint(this, 'OengusTrackerSecretsManagerVpcEndpoint', {
      vpc,
      service: InterfaceVpcEndpointAwsService.SECRETS_MANAGER
    })

    // 踏み台の Bastion
    const operation = new BastionHostLinux(
      this,
      'OengusTrackerBastionForDBOperation',
      {
        vpc,
        instanceType: InstanceType.of(InstanceClass.T2, InstanceSize.MICRO),
        securityGroup: bastionGroup,
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
        excludePunctuation: true,
        includeSpace: false,
        generateStringKey: 'password'
      }
    })
    databaseCredentialSecret.grantRead(operation)

    const postgresVersion = PostgresEngineVersion.VER_11_12
    // PostgreSQL の RDS
    const db = new DatabaseInstance(this, 'OengusTrackerDB', {
      engine: DatabaseInstanceEngine.postgres({
        version: postgresVersion
      }),
      credentials: Credentials.fromSecret(databaseCredentialSecret),
      instanceType: InstanceType.of(InstanceClass.T2, InstanceSize.MICRO),
      allocatedStorage: 1,
      vpc,
      vpcSubnets: {
        subnetType: SubnetType.PRIVATE_ISOLATED
      },
      securityGroups: [dbProxyGroup],
      removalPolicy: RemovalPolicy.DESTROY,
      parameterGroup: new ParameterGroup(
        this,
        'OengusTrackerDBParameterGroup',
        {
          engine: DatabaseInstanceEngine.postgres({
            version: postgresVersion
          })
        }
      )
    })

    // RDS Proxy
    const dbProxy = db.addProxy(`${id}-proxy`, {
      secrets: [databaseCredentialSecret],
      debugLogging: true,
      vpc,
      securityGroups: [dbProxyGroup],
      requireTLS: false
    })

    this.props = {
      vpc,
      lambdaGroup,
      dbProxy,
      dbSecret: databaseCredentialSecret
    }
  }
}

export interface DatabaseStackProps extends StackProps {
  vpc: Vpc
  lambdaGroup: SecurityGroup
  dbProxy: DatabaseProxy,
  dbSecret: Secret
}
