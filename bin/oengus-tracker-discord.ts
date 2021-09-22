#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from '@aws-cdk/core'
import { LambdaStack } from '../lib/lambda-stack'
import { VPCStack } from '../lib/vpc-stack'
import { RDSStack } from '../lib/rds-stack'

const app = new cdk.App()
const vpcStack = new VPCStack(app, 'OengusTrackerVPCStack')
new RDSStack(app, 'OengusTrackerRDSSTack', vpcStack.props)
new LambdaStack(app, 'OengusTrackerLambdaStack')
