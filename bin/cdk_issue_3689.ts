#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { CdkIssue3689Stack } from '../lib/cdk_issue_3689-stack';

const app = new cdk.App();
new CdkIssue3689Stack(app, 'CdkIssue3689Stack');
