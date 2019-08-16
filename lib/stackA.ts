import cdk = require('@aws-cdk/core');
import elbv2 = require('@aws-cdk/aws-elasticloadbalancingv2');
import { ApplicationListener } from '@aws-cdk/aws-elasticloadbalancingv2';
import { Vpc } from '@aws-cdk/aws-ec2';

export class StackA extends cdk.Stack {
  readonly defaultListener: ApplicationListener;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = Vpc.fromVpcAttributes(this, 'ImportedVPC', {
      vpcId: 'vpcId',
      availabilityZones: ['',''],
      publicSubnetIds: ['',''],
      privateSubnetIds: ['',''],
    });
    const alb = new elbv2.ApplicationLoadBalancer(this, 'PublicLoadBalancer', {
      vpc,
      internetFacing: true,
    });
    this.defaultListener = alb.addListener('DefaultListener', {
      port: 80,
      open: true,
    });
    this.defaultListener.addFixedResponse('Default404', {
      statusCode: '404'
    });
  }
}
