'use strict';
import AWS from 'aws-sdk';
import { nanoid } from 'nanoid';

const S3 = new AWS.S3();

export async function save(event) {
  await S3.putObject({
    Bucket: "service-lambda-to-s3",
    Key: nanoid(),
    Body: 'test',
    ContentType: "text/plain",
  }).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Go Serverless v1.0! Your function executed successfully!',
        input: event,
      },
      null,
      2
    ),
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
