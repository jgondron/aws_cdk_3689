import cdk = require('@aws-cdk/core');
import ecs = require('@aws-cdk/aws-ecs');
import elbv2 = require('@aws-cdk/aws-elasticloadbalancingv2');
import { NetworkMode, ContainerImage } from '@aws-cdk/aws-ecs';
import { Duration } from '@aws-cdk/core';
import { TargetType, ApplicationProtocol } from '@aws-cdk/aws-elasticloadbalancingv2';
import { Vpc, SubnetType, SecurityGroup } from '@aws-cdk/aws-ec2';
import { StackA } from '../lib/stackA';

export interface StackBProps extends cdk.StackProps {
  readonly stackA: StackA;
}

export class StackB extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: StackBProps) {
    super(scope, id, props);

    const vpc = Vpc.fromVpcAttributes(this, 'ImportedVPC', {
      vpcId: 'vpcId',
      availabilityZones: ['',''],
      publicSubnetIds: ['',''],
      privateSubnetIds: ['',''],
    });
    const securityGroup = new SecurityGroup(this, 'FargateSG', {
      vpc,
      allowAllOutbound: true,
    });  
    const cluster = new ecs.Cluster(this, 'FargateCluster', {
      vpc, 
    });
    const task = new ecs.TaskDefinition(this, 'TaskDefinition', {
      compatibility: ecs.Compatibility.FARGATE,
      family: `${this.stackName}-ArchitectureDrawings`,
      cpu: '256',
      memoryMiB: '512',
      networkMode: NetworkMode.AWS_VPC,
    });
    const nginx = task.addContainer('nginx', {
      image: ContainerImage.fromRegistry('nginx'),
      essential: true,
    });
    nginx.addPortMappings({
      containerPort: 80
    });
    const service = new ecs.FargateService(this, 'Service', {
      taskDefinition: task,
      cluster,
      vpcSubnets: {subnetType: SubnetType.PRIVATE},
      securityGroup,
    });
    const targetGroup = new elbv2.ApplicationTargetGroup(this, 'TargetGroup', {
      healthCheck: {
        path: '/',
        protocol: elbv2.Protocol.HTTP,
        interval: Duration.seconds(30),
        timeout: Duration.seconds(10),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 10,
        port: '80',
      },
      targetType: TargetType.IP,
      port: 80,
      protocol: ApplicationProtocol.HTTP,
      vpc,
      targets: [service],
    });

    if(this.node.tryGetContext('useAddTargetGroups')) {
      // This adds cyclic ref
      props.stackA.defaultListener.addTargetGroups('ECSServiceRule', {
        targetGroups: [targetGroup],
        priority: 1,
        pathPattern: '*',
      });
    } else {
      // This does not
      new elbv2.ApplicationListenerRule(this, 'ECSServiceRule', {
        listener: props.stackA.defaultListener,
        targetGroups: [targetGroup],
        priority: 1,
        pathPattern: '*',
      });
    }
  }
}
