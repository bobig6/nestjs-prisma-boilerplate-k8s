import { Injectable } from '@nestjs/common';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import * as process from 'node:process';

@Injectable()
export class S3Service {
  // private readonly s3Client = new S3Client({
  //   region: process.env.AWS_S3_REGION,
  // });
  private readonly s3Client = new S3Client({
    forcePathStyle: true,
    region: process.env.AWS_S3_REGION,
    endpoint: process.env.AWS_S3_ENDPOINT,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
  private readonly bucketName = process.env.AWS_S3_BUCKET_NAME;

  // function to check connection to the bucket and return a boolean
  async checkHealth() {
    try {
      await this.s3Client.send(
        new ListObjectsCommand({
          Bucket: this.bucketName,
        }),
      );
      return { status: 'up' };
    } catch (e) {
      return { status: 'down', message: e.message };
    }
  }

  async addObject(
    key: string,
    extension: string,
    body: Buffer,
  ): Promise<string> {
    try {
      // Append the extension to the key if not already included
      if (!key.endsWith(`.${extension}`)) {
        key = `${key}.${extension}`;
      }

      // Check if the key already exists
      const response = await this.s3Client.send(
        new ListObjectsV2Command({
          Bucket: this.bucketName,
          Prefix: key,
        }),
      );

      if (
        response.Contents &&
        response.Contents.some((obj) => obj.Key === key)
      ) {
        throw new Error(`Key "${key}" already exists`);
      }
    } catch (error) {
      if (error.name !== 'NoSuchKey') {
        throw new Error(`Failed to check key existence: ${error.message}`);
      }
    }

    // Upload the object to S3
    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: body,
        }),
      );
      return key; // Return the full key with the extension
    } catch (error) {
      throw new Error(`Failed to add object to bucket: ${error.message}`);
    }
  }

  // function to get an object from the bucket
  async getObject(key: string) {
    // Check if the key exists
    const listResponse = await this.s3Client.send(
      new ListObjectsCommand({
        Bucket: this.bucketName,
        Prefix: key,
      }),
    );

    if (
      !listResponse.Contents ||
      !listResponse.Contents.some((obj) => obj.Key === key)
    ) {
      throw new Error('Key does not exist');
    }

    // If the key exists, get the object
    const getResponse = await this.s3Client.send(
      new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }),
    );

    if (!getResponse.Body) {
      throw new Error('Object content is missing');
    }

    return getResponse.Body;
  }

  // function to update an object in the bucket
  async updateObject(key: string, body: Buffer) {
    // Check if the key already exists
    const listResponse = await this.s3Client.send(
      new ListObjectsCommand({
        Bucket: this.bucketName,
        Prefix: key,
      }),
    );

    if (
      !listResponse.Contents ||
      !listResponse.Contents.some((obj) => obj.Key === key)
    ) {
      throw new Error('Key does not exist');
    }

    // If the key exists, update the object
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: body,
      }),
    );
  }

  async deleteObject(key: string) {
    // Check if the key exists
    const listResponse = await this.s3Client.send(
      new ListObjectsCommand({
        Bucket: this.bucketName,
        Prefix: key,
      }),
    );

    if (
      !listResponse.Contents ||
      !listResponse.Contents.some((obj) => obj.Key === key)
    ) {
      throw new Error('Key does not exist');
    }

    // If the key exists, delete the object
    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }),
    );
  }
}
