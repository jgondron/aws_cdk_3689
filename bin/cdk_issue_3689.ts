#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { StackA } from '../lib/stackA';
import { StackB } from '../lib/stackB';

const app = new cdk.App();
const stackA = new StackA(app, 'StackA');
const stackB = new StackB(app, 'StackB', { stackA });