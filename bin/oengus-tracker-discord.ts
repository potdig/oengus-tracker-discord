#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from '@aws-cdk/core'
import { LambdaStack } from '../lib/lambda-stack'
import { DatabaseStack } from '../lib/database-stack'

const app = new cdk.App()
const vpcStack = new DatabaseStack(app, 'OengusTrackerDatabaseStack')
new LambdaStack(app, 'OengusTrackerLambdaStack', vpcStack.props)
